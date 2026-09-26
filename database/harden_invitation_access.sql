-- Audited against the connected Invito database. Existing invitation tokens are preserved.
drop policy if exists "Enable read access for all users" on public.invitados;
create unique index if not exists invitados_token_key on public.invitados(token);

create or replace function public.hacer_checkin(token_input text, evento_id_input uuid)
returns table(nombre text, mesa_nombre text, acompanantes smallint, ya_registrado boolean)
language plpgsql security invoker set search_path = '' as $$
declare
  guest public.invitados%rowtype;
begin
  if auth.uid() is null or not exists (
    select 1 from public.eventos e where e.id = evento_id_input and e.user_id = auth.uid()
  ) then
    raise exception 'No tienes acceso a este evento' using errcode = '42501';
  end if;
  select i.* into guest from public.invitados i
  where i.token = token_input and i.evento_id = evento_id_input for update;
  if not found then raise exception 'Invitado no encontrado'; end if;
  if guest.estado is distinct from 'confirmado' then
    raise exception 'El invitado no ha confirmado su asistencia';
  end if;
  update public.invitados i set checked_in = true where i.id = guest.id;
  return query select guest.nombre, m.nombre, guest.acompanantes, coalesce(guest.checked_in, false)
  from (select 1) singleton left join public.mesas m on m.id = guest.mesa_id;
end;
$$;
revoke all on function public.hacer_checkin(text, uuid) from public, anon;
grant execute on function public.hacer_checkin(text, uuid) to authenticated;

-- Public RSVP is intentionally authorized by possession of the invitation token.
create or replace function public.actualizar_estado_invitado(token_input text, nuevo_estado text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if nuevo_estado is null or nuevo_estado not in ('confirmado', 'rechazado', 'pendiente') then
    raise exception 'Estado inválido';
  end if;
  update public.invitados set estado = nuevo_estado where token = token_input;
  if not found then raise exception 'Invitación no encontrada'; end if;
end;
$$;

create or replace function public.agregar_foto_galeria(evento_id_input uuid, foto_url text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Sesión requerida' using errcode = '42501'; end if;
  update public.eventos
  set configuracion = jsonb_set(
    coalesce(configuracion, '{}'::jsonb),
    '{galeria}',
    coalesce(nullif(configuracion->'galeria', 'null'::jsonb), '[]'::jsonb) || to_jsonb(foto_url)
  )
  where id = evento_id_input and user_id = auth.uid();
  if not found then raise exception 'Evento no encontrado o sin acceso' using errcode = '42501'; end if;
end;
$$;
revoke all on function public.agregar_foto_galeria(uuid, text) from public, anon;
grant execute on function public.agregar_foto_galeria(uuid, text) to authenticated;

alter policy "permitir subir fotos autenticado" on storage.objects
to authenticated with check (
  bucket_id = 'fotos_eventos' and exists (
    select 1 from public.eventos e
    where e.id::text = (storage.foldername(name))[1] and e.user_id = (select auth.uid())
  )
);

