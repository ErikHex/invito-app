-- A separate, moderated collection for photographs uploaded by event guests.
create table if not exists public.albums_compartidos (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null unique references public.eventos(id) on delete cascade,
  codigo text not null unique check (codigo ~ '^[A-Za-z0-9_-]{16,64}$'),
  activo boolean not null default true,
  mostrar_publicamente boolean not null default false,
  creado_at timestamptz not null default now()
);

create table if not exists public.fotos_album_compartido (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums_compartidos(id) on delete cascade,
  storage_key text not null unique,
  url_publica text not null,
  content_type text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  tamano integer not null check (tamano between 1 and 8388608),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobada', 'oculta')),
  creado_at timestamptz not null default now()
);
create index if not exists fotos_album_compartido_album_idx on public.fotos_album_compartido(album_id, creado_at desc);

alter table public.albums_compartidos enable row level security;
alter table public.fotos_album_compartido enable row level security;
revoke all on public.albums_compartidos, public.fotos_album_compartido from public, anon, authenticated;
grant select, update on public.albums_compartidos to authenticated;
grant select, update, delete on public.fotos_album_compartido to authenticated;

create policy albums_compartidos_gestion on public.albums_compartidos for all to authenticated
  using (invito_private.edita_evento(evento_id)) with check (invito_private.edita_evento(evento_id));
create policy fotos_album_compartido_gestion on public.fotos_album_compartido for all to authenticated
  using (exists (select 1 from public.albums_compartidos a where a.id = album_id and invito_private.edita_evento(a.evento_id)))
  with check (exists (select 1 from public.albums_compartidos a where a.id = album_id and invito_private.edita_evento(a.evento_id)));

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

-- The QR only reveals this intentionally limited event information.
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

create or replace function public.fotos_album_compartido_publicas(codigo_input text)
returns jsonb language sql security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', f.id, 'url', f.url_publica) order by f.creado_at desc), '[]'::jsonb)
  from public.albums_compartidos a
  join public.eventos e on e.id = a.evento_id
  join public.fotos_album_compartido f on f.album_id = a.id and f.estado = 'aprobada'
  where a.codigo = codigo_input and a.mostrar_publicamente and e.publicacion = 'publicado'
$$;
revoke all on function public.fotos_album_compartido_publicas(text) from public, anon, authenticated;
grant execute on function public.fotos_album_compartido_publicas(text) to anon, authenticated;

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
