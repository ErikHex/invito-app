-- gen_random_bytes belongs to pgcrypto, which is not enabled on every project.
-- PostgreSQL's gen_random_uuid is already available on this project's version.
create or replace function public.crear_album_compartido(evento_id_input uuid)
returns public.albums_compartidos language plpgsql security definer set search_path = '' as $$
declare resultado public.albums_compartidos;
begin
  if not invito_private.edita_evento(evento_id_input) then
    raise exception 'No tienes permiso para administrar este álbum' using errcode = '42501';
  end if;
  insert into public.albums_compartidos(evento_id, codigo)
  values (evento_id_input, replace(gen_random_uuid()::text, '-', ''))
  on conflict (evento_id) do update set evento_id = excluded.evento_id
  returning * into resultado;
  return resultado;
end $$;
revoke all on function public.crear_album_compartido(uuid) from public, anon;
grant execute on function public.crear_album_compartido(uuid) to authenticated;
notify pgrst, 'reload schema';
