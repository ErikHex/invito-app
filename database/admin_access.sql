-- Admin and per-event access. Private functions deliberately mediate narrow privileged operations.
create schema if not exists invito_private;
revoke all on schema invito_private from public, anon;
grant usage on schema invito_private to authenticated;
create table invito_private.administradores (
  email text primary key check(email=lower(trim(email))), creado_at timestamptz not null default now()
);
alter table invito_private.administradores enable row level security;
revoke all on invito_private.administradores from public,anon,authenticated;

create table public.evento_accesos (
  evento_id uuid not null references public.eventos(id) on delete cascade,
  rol text not null check(rol in ('titular','portero')),
  plaza smallint not null check(plaza between 1 and 2),
  email text not null check(email=lower(trim(email))),
  user_id uuid references auth.users(id) on delete set null,
  invitacion_vence timestamptz not null default now()+interval '14 days',
  acceso_vence timestamptz,
  creado_at timestamptz not null default now(),
  primary key(evento_id,rol,plaza), unique(evento_id,email), unique(evento_id,user_id),
  check(rol <> 'portero' or acceso_vence is not null)
);
create index evento_accesos_user_idx on public.evento_accesos(user_id,evento_id);
create index evento_accesos_email_idx on public.evento_accesos(email);
insert into public.evento_accesos(evento_id,rol,plaza,email,user_id)
select e.id,'titular',1,lower(u.email),u.id from public.eventos e join auth.users u on u.id=e.user_id where u.email is not null;

create table public.evento_negocio (
  evento_id uuid primary key references public.eventos(id) on delete cascade,
  trabajo text not null default 'por_preparar' check(trabajo in ('por_preparar','en_revision','entregado')),
  precio numeric(12,2) not null default 1490 check(precio>=0),
  abonado numeric(12,2) not null default 0 check(abonado>=0 and abonado<=precio),
  notas text not null default ''
);
insert into public.evento_negocio(evento_id) select id from public.eventos;
create table public.evento_actividad (
  id bigint generated always as identity primary key,
  evento_id uuid not null references public.eventos(id) on delete cascade,
  actor uuid, accion text not null, creado_at timestamptz not null default now()
);
create index evento_actividad_evento_idx on public.evento_actividad(evento_id,creado_at desc);
create table public.evento_entradas (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos(id) on delete cascade,
  invitado_id uuid references public.invitados(id) on delete set null,
  actor uuid not null, cantidad integer not null check(cantidad>0),
  creado_at timestamptz not null default now(), solicitud uuid not null unique
);
create index evento_entradas_evento_idx on public.evento_entradas(evento_id,creado_at desc);
alter table public.eventos add column publicacion text not null default 'publicado' check(publicacion in ('borrador','publicado','archivado'));
alter table public.eventos alter column publicacion set default 'borrador';
alter table public.invitados add column entradas integer not null default 0 check(entradas>=0);
update public.invitados set entradas=1+coalesce(acompanantes,0) where checked_in=true;

create function invito_private.es_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from invito_private.administradores a join auth.users u on lower(u.email)=a.email where u.id=auth.uid() and u.email_confirmed_at is not null);
$$;
create function invito_private.rol_evento(eid uuid) returns text language sql stable security definer set search_path='' as $$
 select case when invito_private.es_admin() then 'admin' else (select a.rol from public.evento_accesos a where a.evento_id=eid and a.user_id=auth.uid() and (a.acceso_vence is null or a.acceso_vence>now())) end;
$$;
create function invito_private.edita_evento(eid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select coalesce(invito_private.rol_evento(eid) in ('admin','titular'),false);
$$;
revoke all on all functions in schema invito_private from public,anon;
grant execute on function invito_private.es_admin(), invito_private.rol_evento(uuid), invito_private.edita_evento(uuid) to authenticated;

-- Replace ownership-only policies; gatekeepers never SELECT whole event or guest rows.
do $$ declare p record; begin
 for p in select tablename,policyname from pg_policies where schemaname='public' and tablename in ('eventos','invitados','mesas') loop execute format('drop policy %I on public.%I',p.policyname,p.tablename); end loop;
end $$;
revoke all on public.eventos, public.invitados, public.mesas from anon,authenticated;
grant select on public.eventos to authenticated;
grant update(nombre_evento,fecha,configuracion) on public.eventos to authenticated;
grant select,insert,update,delete on public.invitados,public.mesas to authenticated;
create policy evento_lectura on public.eventos for select to authenticated using(invito_private.edita_evento(id));
create policy evento_edicion on public.eventos for update to authenticated using(invito_private.edita_evento(id)) with check(invito_private.edita_evento(id));
create policy invitados_gestion on public.invitados for all to authenticated using(invito_private.edita_evento(evento_id)) with check(invito_private.edita_evento(evento_id));
create policy mesas_gestion on public.mesas for all to authenticated using(invito_private.edita_evento(evento_id)) with check(invito_private.edita_evento(evento_id));
do $$ declare t text; begin
 foreach t in array array['evento_accesos','evento_negocio','evento_actividad','evento_entradas'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon,authenticated',t);
 execute format('grant select on public.%I to authenticated',t);
 end loop;
end $$;
create policy accesos_lectura on public.evento_accesos for select to authenticated using(invito_private.edita_evento(evento_id));
create policy negocio_admin on public.evento_negocio for select to authenticated using(invito_private.es_admin());
create policy actividad_admin on public.evento_actividad for select to authenticated using(invito_private.es_admin());
create policy entradas_titulares on public.evento_entradas for select to authenticated using(invito_private.edita_evento(evento_id));
alter policy "permitir subir fotos autenticado" on storage.objects to authenticated with check(bucket_id='fotos_eventos' and exists(select 1 from public.eventos e where e.id::text=(storage.foldername(name))[1] and invito_private.edita_evento(e.id)));

-- Existing RPCs continue to work for both holders, retaining optimistic concurrency.
do $$ declare f record; q text; begin
 for f in select oid,proname from pg_proc where pronamespace='public'::regnamespace and proname in ('guardar_editor_evento','registrar_envio','actualizar_configuracion_evento','agregar_foto_galeria') loop
 q:=pg_get_functiondef(f.oid);
 q:=replace(q,'user_id=auth.uid()','invito_private.edita_evento(id)');
 q:=replace(q,'user_id = auth.uid()','invito_private.edita_evento(id)');
 q:=replace(q,'e.invito_private.edita_evento(id)','invito_private.edita_evento(e.id)');
 execute q;
 end loop;
end $$;

create function invito_private.panel(operacion text, datos jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); correo text; eid uuid; r text; acceso public.evento_accesos; ev public.eventos; guest public.invitados; cantidad integer; req uuid; outjson jsonb; plantilla_id text; pl integer; begin
 if uid is null then raise exception 'Inicia sesión para continuar' using errcode='42501'; end if;
 select lower(email) into correo from auth.users where id=uid and email_confirmed_at is not null;
 if correo is null then raise exception 'Verifica tu correo para continuar' using errcode='42501'; end if;
 if operacion='sesion' then
  return jsonb_build_object('admin',invito_private.es_admin(),'eventos',coalesce((select jsonb_agg(jsonb_build_object('id',e.id,'slug',e.slug,'nombre_evento',e.nombre_evento,'fecha',e.fecha,'publicacion',e.publicacion,'rol',invito_private.rol_evento(e.id))) from public.eventos e where invito_private.rol_evento(e.id) is not null),'[]'::jsonb),'pendientes',coalesce((select jsonb_agg(jsonb_build_object('evento_id',a.evento_id,'nombre',e.nombre_evento,'rol',a.rol,'plaza',a.plaza)) from public.evento_accesos a join public.eventos e on e.id=a.evento_id where a.email=correo and a.user_id is null and a.invitacion_vence>now() and (a.acceso_vence is null or a.acceso_vence>now())),'[]'::jsonb));
 end if;
 eid:=nullif(datos->>'evento_id','')::uuid;
 if operacion='crear_evento' then
  if not invito_private.es_admin() then raise exception 'Solo el administrador puede crear eventos' using errcode='42501'; end if;
  if nullif(trim(datos->>'nombre'),'') is null or coalesce(datos->>'slug','') !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then raise exception 'Nombre o enlace inválido'; end if;
  -- Register new deployed templates here as part of their release.
  if datos->>'plantilla' is distinct from 'editorial' then raise exception 'Plantilla no disponible'; end if;
  insert into public.eventos(nombre_evento,slug,fecha,user_id,plantilla,publicacion,configuracion,modulos_activos)
  values(trim(datos->>'nombre'),datos->>'slug',nullif(datos->>'fecha','')::date,uid,'editorial','borrador',
   '{"version":1,"nombres":[],"galeria":[],"itinerario":[],"ceremonia":{},"recepcion":{},"vestimenta":{},"regalos":{}}'::jsonb || jsonb_build_object('zonaHoraria',coalesce(nullif(datos->>'zona',''),'America/Mexico_City')),
   '{"sobre":true,"portada":true,"mensaje":true,"cuenta_regresiva":true,"ceremonia":true,"recepcion":true,"vestimenta":true,"regalos":true,"galeria":true,"itinerario":true,"rsvp":true,"qr":true,"musica":true}') returning id into eid;
  insert into public.evento_negocio(evento_id) values(eid);
  insert into public.evento_actividad(evento_id,actor,accion) values(eid,uid,'Evento creado');
  return jsonb_build_object('id',eid,'slug',datos->>'slug');
 end if;
 select * into ev from public.eventos where id=eid for update;
 if not found then raise exception 'Evento no encontrado'; end if;
 r:=invito_private.rol_evento(eid);
 if operacion='aceptar' then
  update public.evento_accesos set user_id=uid where evento_id=eid and email=correo and user_id is null and invitacion_vence>now() and (acceso_vence is null or acceso_vence>now());
  if not found then raise exception 'No hay una invitación vigente para tu correo'; end if;
 elsif operacion in ('asignar','revocar') then
  if r is null or r not in ('admin','titular') then raise exception 'No tienes permiso para gestionar accesos' using errcode='42501'; end if;
  if datos->>'rol' not in ('titular','portero') or datos->>'rol' is null then raise exception 'Rol inválido'; end if;
  if datos->>'rol'='titular' and r<>'admin' then raise exception 'Solo el administrador asigna titulares' using errcode='42501'; end if;
  pl:=(datos->>'plaza')::integer;
  if pl is null or pl not between 1 and 2 then raise exception 'Máximo dos cuentas por rol y evento'; end if;
  if operacion='revocar' then
   if datos->>'rol'='titular' and (select count(*) from public.evento_accesos where evento_id=eid and rol='titular')<=1 then raise exception 'Reemplaza al último titular en lugar de eliminarlo'; end if;
   delete from public.evento_accesos where evento_id=eid and rol=datos->>'rol' and plaza=pl;
  else
   correo:=lower(trim(datos->>'email'));
   if correo is null or correo !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Correo inválido'; end if;
   if datos->>'rol'='portero' and (nullif(datos->>'vence','') is null or (datos->>'vence')::timestamptz<=now()) then raise exception 'Indica una fecha futura para el acceso del portero'; end if;
   insert into public.evento_accesos(evento_id,rol,plaza,email,user_id,invitacion_vence,acceso_vence)
   values(eid,datos->>'rol',pl,correo,null,now()+interval '14 days',case when datos->>'rol'='portero' then (datos->>'vence')::timestamptz else null end)
   on conflict(evento_id,rol,plaza) do update set email=excluded.email,user_id=null,invitacion_vence=excluded.invitacion_vence,acceso_vence=excluded.acceso_vence,creado_at=now();
  end if;
 elsif operacion='negocio' then
  if r is distinct from 'admin' then raise exception 'Solo el administrador puede modificar el negocio' using errcode='42501'; end if;
  if datos->>'plantilla' is distinct from 'editorial' or (datos->>'version')::integer is distinct from 1 then raise exception 'Plantilla o versión no disponible'; end if;
  if (datos->>'publicacion')='publicado' and not exists(select 1 from public.evento_accesos where evento_id=eid and rol='titular') then raise exception 'Asigna al menos un titular antes de publicar'; end if;
  update public.eventos set plantilla=datos->>'plantilla',plantilla_version=(datos->>'version')::integer,publicacion=datos->>'publicacion',modulos_activos=coalesce(datos->'modulos',modulos_activos) where id=eid;
  update public.evento_negocio set trabajo=datos->>'trabajo',precio=(datos->>'precio')::numeric,abonado=(datos->>'abonado')::numeric,notas=coalesce(datos->>'notas','') where evento_id=eid;
 elsif operacion='recepcion' then
  if r is null then raise exception 'No tienes acceso a recepción' using errcode='42501'; end if;
  return jsonb_build_object('id',ev.id,'nombre',ev.nombre_evento,'slug',ev.slug,'rol',r);
 elsif operacion='buscar' then
  if r is null then raise exception 'No tienes acceso a recepción' using errcode='42501'; end if;
  if length(trim(coalesce(datos->>'texto','')))<2 and nullif(datos->>'token','') is null then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(x),'[]') into outjson from (select i.id,i.nombre,i.estado,1+coalesce(i.acompanantes,0) as lugares,i.entradas,m.nombre as mesa from public.invitados i left join public.mesas m on m.id=i.mesa_id and m.evento_id=eid where i.evento_id=eid and (case when nullif(datos->>'token','') is not null then i.token=datos->>'token' else i.nombre ilike '%'||trim(datos->>'texto')||'%' end) order by i.nombre limit 30) x;
  return outjson;
 elsif operacion='entrada' then
  if r is null then raise exception 'No tienes acceso a recepción' using errcode='42501'; end if;
  req:=(datos->>'solicitud')::uuid;
  if req is null then raise exception 'Solicitud requerida'; end if;
  if exists(select 1 from public.evento_entradas where solicitud=req and evento_id=eid and actor=uid) then return jsonb_build_object('registrado',true); end if;
  select * into guest from public.invitados where id=(datos->>'invitado_id')::uuid and evento_id=eid for update;
  if not found or guest.estado is distinct from 'confirmado' then raise exception 'Invitación no encontrada o sin confirmar'; end if;
  cantidad:=(datos->>'cantidad')::integer;
  if cantidad is null or cantidad<1 or guest.entradas+cantidad>1+coalesce(guest.acompanantes,0) then raise exception 'La cantidad supera los lugares pendientes. Actualiza la consulta.'; end if;
  update public.invitados set entradas=entradas+cantidad,checked_in=true where id=guest.id;
  insert into public.evento_entradas(evento_id,invitado_id,actor,cantidad,solicitud) values(eid,guest.id,uid,cantidad,req);
  return jsonb_build_object('registrado',true,'entradas',guest.entradas+cantidad);
 else raise exception 'Operación desconocida';
 end if;
 insert into public.evento_actividad(evento_id,actor,accion) values(eid,uid,case operacion when 'asignar' then 'Acceso asignado: '|| (datos->>'rol') when 'revocar' then 'Acceso revocado: '||(datos->>'rol') when 'aceptar' then 'Invitación de acceso aceptada' else 'Configuración comercial actualizada' end);
 return jsonb_build_object('ok',true);
end $$;
revoke all on function invito_private.panel(text,jsonb) from public,anon;
grant execute on function invito_private.panel(text,jsonb) to authenticated;
create function public.panel_operacion(operacion text, datos jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$ select invito_private.panel(operacion,datos); $$;
revoke all on function public.panel_operacion(text,jsonb) from public,anon;
grant execute on function public.panel_operacion(text,jsonb) to authenticated;

-- Stop legacy QR writes from bypassing counted entries; the new reception screen uses panel_operacion.
revoke execute on function public.hacer_checkin(text,uuid) from public,anon,authenticated;
-- Guest links keep their tokens, but drafts/archived events are not public.
do $$ declare q text; begin
 select pg_get_functiondef(oid) into q from pg_proc where pronamespace='public'::regnamespace and proname='get_invitacion';
 q:=replace(q,'WHERE i.token=token_input','WHERE i.token=token_input AND e.publicacion=''publicado'''); execute q;
end $$;
create or replace function public.actualizar_estado_invitado(token_input text,nuevo_estado text) returns void language plpgsql security definer set search_path='' as $$
begin
 if nuevo_estado is null or nuevo_estado not in ('confirmado','rechazado','pendiente') then raise exception 'Estado inválido'; end if;
 update public.invitados i set estado=nuevo_estado where i.token=token_input and exists(select 1 from public.eventos e where e.id=i.evento_id and e.publicacion='publicado');
 if not found then raise exception 'Invitación no disponible'; end if;
end $$;
notify pgrst,'reload schema';
insert into invito_private.administradores(email) values('invitofun@gmail.com');
-- These sections were previously rendered regardless of their flags. Preserve current invitations.
update public.eventos set modulos_activos=modulos_activos || '{"sobre":true,"portada":true,"mensaje":true,"cuenta_regresiva":true,"ceremonia":true,"recepcion":true,"vestimenta":true,"regalos":true,"galeria":true,"itinerario":true,"rsvp":true,"qr":true,"musica":true}'::jsonb;
alter table public.mesas alter column id set default gen_random_uuid();
-- Legacy token lookup must also respect publication state.
create or replace function public.get_invitado_by_token(token_input text)
returns table(id uuid,nombre text,estado text,acompanantes smallint,token text,checked_in boolean,mesa_nombre text)
language sql security definer set search_path='' as $$
 select i.id,i.nombre,i.estado,i.acompanantes,i.token,i.checked_in,m.nombre
 from public.invitados i join public.eventos e on e.id=i.evento_id
 left join public.mesas m on m.id=i.mesa_id and m.evento_id=e.id
 where i.token=token_input and e.publicacion='publicado';
$$;
