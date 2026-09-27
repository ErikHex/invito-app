-- Dashboard editing and owner-only invitation delivery tracking.
alter table public.invitados add column if not exists telefono text;
alter table public.invitados add column if not exists envio_estado text not null default 'pendiente' check (envio_estado in ('pendiente','por_verificar','enviada'));
alter table public.invitados add column if not exists enviado_at timestamptz;
alter table public.invitados add column if not exists envio_historial jsonb not null default '[]'::jsonb;

create or replace function public.registrar_envio(invitado_id_input uuid, accion_input text, canal_input text default 'whatsapp')
returns public.invitados language plpgsql security invoker set search_path = '' as $$
declare resultado public.invitados;
begin
  if auth.uid() is null then raise exception 'Sesión requerida'; end if;
  if accion_input not in ('abrir','enviar','recordatorio','restablecer') or accion_input is null then raise exception 'Acción inválida'; end if;
  if canal_input not in ('whatsapp','enlace') or canal_input is null then raise exception 'Canal inválido'; end if;
  update public.invitados i set
    envio_estado = case when accion_input='restablecer' then 'pendiente' when accion_input in ('enviar','recordatorio') then 'enviada' when envio_estado='enviada' then 'enviada' else 'por_verificar' end,
    enviado_at = case when accion_input='restablecer' then null when accion_input='enviar' then now() else enviado_at end,
    envio_historial = envio_historial || jsonb_build_array(jsonb_build_object('accion',accion_input,'canal',canal_input,'fecha',now(),'autor',auth.uid()))
  where i.id=invitado_id_input and exists(select 1 from public.eventos e where e.id=i.evento_id and e.user_id=auth.uid())
  returning i.* into resultado;
  if not found then raise exception 'Invitado no encontrado o sin acceso'; end if;
  return resultado;
end $$;
revoke all on function public.registrar_envio(uuid,text,text) from public, anon;
grant execute on function public.registrar_envio(uuid,text,text) to authenticated;

create or replace function public.guardar_editor_evento(evento_id_input uuid, nombre_input text, fecha_input date, configuracion_input jsonb, configuracion_anterior jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sesión requerida'; end if;
  if jsonb_typeof(configuracion_input) is distinct from 'object' or nullif(trim(nombre_input),'') is null then raise exception 'Datos inválidos'; end if;
  update public.eventos set nombre_evento=trim(nombre_input), fecha=fecha_input, configuracion=configuracion_input
  where id=evento_id_input and user_id=auth.uid() and coalesce(configuracion,'{}'::jsonb)=configuracion_anterior;
  if not found then raise exception 'El evento cambió en otra sesión o no tienes acceso. Recarga antes de guardar.'; end if;
end $$;
revoke all on function public.guardar_editor_evento(uuid,text,date,jsonb,jsonb) from public, anon;
grant execute on function public.guardar_editor_evento(uuid,text,date,jsonb,jsonb) to authenticated;
