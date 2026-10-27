-- Uploads are allowed from the event start through 15 days later, in the
-- event's configured timezone. Enforcement here prevents API bypasses.
create or replace function public.album_compartido_publico(codigo_input text)
returns jsonb language sql security definer set search_path = '' as $$
  with album as (
    select a.*, e.nombre_evento, e.publicacion,
      coalesce(nullif(e.configuracion->>'fechaHora', '')::timestamptz,
        e.fecha::timestamp at time zone coalesce(nullif(e.configuracion->>'zonaHoraria', ''), 'America/Mexico_City')) as inicia_at
    from public.albums_compartidos a join public.eventos e on e.id = a.evento_id
    where a.codigo = codigo_input and e.publicacion = 'publicado'
  ) select jsonb_build_object('album_id', id, 'evento', nombre_evento, 'activo', activo, 'inicia_at', inicia_at,
    'acepta_fotos', activo and inicia_at is not null and now() between inicia_at and inicia_at + interval '15 days',
    'mostrar_publicamente', mostrar_publicamente)
  from album
$$;
revoke all on function public.album_compartido_publico(text) from public, anon, authenticated;
grant execute on function public.album_compartido_publico(text) to anon, authenticated;

create or replace function public.registrar_foto_album_compartido(codigo_input text, storage_key_input text, url_input text, content_type_input text, tamano_input integer)
returns uuid language plpgsql security definer set search_path = '' as $$
declare album public.albums_compartidos; foto_id uuid; inicia_at timestamptz;
begin
  select a.* into album from public.albums_compartidos a join public.eventos e on e.id = a.evento_id
  where a.codigo = codigo_input and a.activo and e.publicacion = 'publicado';
  if not found then raise exception 'El álbum no está disponible' using errcode = '42501'; end if;
  select coalesce(nullif(configuracion->>'fechaHora', '')::timestamptz,
    fecha::timestamp at time zone coalesce(nullif(configuracion->>'zonaHoraria', ''), 'America/Mexico_City')) into inicia_at
  from public.eventos where id = album.evento_id;
  if inicia_at is null or now() < inicia_at or now() > inicia_at + interval '15 days' then
    raise exception 'Este álbum no acepta fotografías en este momento' using errcode = '42501';
  end if;
  if storage_key_input !~ ('^albums/' || album.id::text || '/[a-f0-9-]+\.(jpg|png|webp)$')
    or content_type_input not in ('image/jpeg', 'image/png', 'image/webp') or tamano_input not between 1 and 8388608 then
    raise exception 'Datos de fotografía inválidos';
  end if;
  insert into public.fotos_album_compartido(album_id, storage_key, url_publica, content_type, tamano)
  values(album.id, storage_key_input, url_input, content_type_input, tamano_input) returning id into foto_id;
  return foto_id;
end $$;
revoke all on function public.registrar_foto_album_compartido(text,text,text,text,integer) from public, anon, authenticated;
grant execute on function public.registrar_foto_album_compartido(text,text,text,text,integer) to anon, authenticated;
notify pgrst, 'reload schema';
