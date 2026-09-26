-- Apply once in Supabase SQL Editor.
create or replace function public.actualizar_configuracion_evento(
  evento_id_input uuid,
  nombre_evento_input text,
  fecha_input date,
  configuracion_input jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Sesión requerida' using errcode = '42501';
  end if;

  if jsonb_typeof(configuracion_input) <> 'object' then
    raise exception 'La configuración debe ser un objeto JSON';
  end if;

  update public.eventos
  set nombre_evento = nombre_evento_input,
      fecha = fecha_input,
      configuracion = configuracion_input
  where id = evento_id_input and user_id = auth.uid();

  if not found then
    raise exception 'Evento no encontrado o sin acceso' using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.actualizar_configuracion_evento(uuid, text, date, jsonb) from public, anon;
grant execute on function public.actualizar_configuracion_evento(uuid, text, date, jsonb) to authenticated;
