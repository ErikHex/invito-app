-- Preserve the existing public event summary without exposing configuration or commercial data.
create or replace function public.evento_publico(slug_input text)
returns table(nombre_evento text,fecha date) language sql stable security definer set search_path='' as $$
 select e.nombre_evento,e.fecha from public.eventos e where e.slug=slug_input and e.publicacion='publicado';
$$;
revoke all on function public.evento_publico(text) from public;
grant execute on function public.evento_publico(text) to anon,authenticated;
create unique index if not exists eventos_slug_unique on public.eventos(slug);
