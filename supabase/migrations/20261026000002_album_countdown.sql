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
notify pgrst, 'reload schema';
