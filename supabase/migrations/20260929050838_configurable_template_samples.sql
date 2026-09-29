-- Samples use the normal event editor. Only explicitly assigned sample content
-- is projected into this public table; event ownership/guests/business stay private.
alter table public.eventos add column es_muestra boolean not null default false;

create table public.muestras_plantillas (
  plantilla text primary key check (plantilla in ('editorial','aura_xv','nocturno')),
  evento_id uuid references public.eventos(id) on delete set null,
  nombre_evento text,
  configuracion jsonb not null default '{}'::jsonb,
  modulos_activos jsonb not null default '{}'::jsonb,
  disponible boolean not null default false
);
create index muestras_plantillas_evento_idx on public.muestras_plantillas(evento_id);
alter table public.muestras_plantillas enable row level security;
revoke all on public.muestras_plantillas from public, anon, authenticated;
grant select on public.muestras_plantillas to anon, authenticated;
grant update(evento_id) on public.muestras_plantillas to authenticated;
create policy muestras_publicas on public.muestras_plantillas for select to anon, authenticated using (disponible);
create policy muestras_admin_lectura on public.muestras_plantillas for select to authenticated using ((select invito_private.es_admin()));
create policy muestras_admin_edicion on public.muestras_plantillas for update to authenticated
  using ((select invito_private.es_admin())) with check ((select invito_private.es_admin()));

-- Trigger functions are private and not callable by API roles. Column-level
-- grants prevent callers from forging the public projection or marking real events.
create function invito_private.preparar_muestra() returns trigger
language plpgsql security definer set search_path='' as $$
declare ev public.eventos;
begin
  if new.evento_id is null then
    new.nombre_evento := null;
    new.configuracion := '{}'::jsonb;
    new.modulos_activos := '{}'::jsonb;
    new.disponible := false;
    return new;
  end if;
  select * into ev from public.eventos where id=new.evento_id for share;
  if not found or not ev.es_muestra then
    raise exception 'Selecciona un evento de muestra' using errcode='22023';
  end if;
  if ev.publicacion='archivado' then
    raise exception 'El evento de muestra está archivado' using errcode='22023';
  end if;
  new.nombre_evento := ev.nombre_evento;
  new.configuracion := ev.configuracion;
  new.modulos_activos := ev.modulos_activos;
  new.disponible := true;
  return new;
end $$;
revoke all on function invito_private.preparar_muestra() from public, anon, authenticated;
create trigger preparar_muestra before insert or update of evento_id on public.muestras_plantillas
for each row execute function invito_private.preparar_muestra();

create function invito_private.sincronizar_muestras() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  update public.muestras_plantillas set
    nombre_evento=new.nombre_evento, configuracion=new.configuracion,
    modulos_activos=new.modulos_activos,
    disponible=new.es_muestra and new.publicacion<>'archivado'
  where evento_id=new.id;
  return new;
end $$;
revoke all on function invito_private.sincronizar_muestras() from public, anon, authenticated;
create trigger sincronizar_muestras after update of nombre_evento,configuracion,modulos_activos,es_muestra,publicacion
on public.eventos for each row execute function invito_private.sincronizar_muestras();

-- Complete starting content for new fictional events; editable afterwards.
create function invito_private.configuracion_muestra() returns jsonb
language sql immutable security invoker set search_path='' as $function$
  select $config${
  "tipoEvento": "boda",
  "nombres": [
    "Mariana",
    "Santiago"
  ],
  "encabezado": "Nos casamos",
  "fechaHora": "2027-06-19T17:00:00-06:00",
  "zonaHoraria": "America/Mexico_City",
  "fotoPortada": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85",
  "fotoPortadaAlt": "Una celebración de boda en el jardín",
  "encuadrePortada": "center 55%",
  "fotoMensaje": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85",
  "fotoMensajeAlt": "Un recuerdo de nuestra historia",
  "mensajeBase": "Después de tantos caminos, elegimos uno juntos. Nos encantará que seas parte de este nuevo comienzo. Gracias por acompañarnos y llenar de cariño nuestra historia.",
  "ceremonia": {
    "hora": "17:00 h",
    "lugar": "Jardín de los Olivos",
    "direccion": "San Miguel de Allende, Guanajuato",
    "foto": "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85",
    "fotoAlt": "El jardín preparado para la ceremonia"
  },
  "recepcion": {
    "hora": "19:30 h",
    "lugar": "Salón Los Olivos",
    "direccion": "San Miguel de Allende, Guanajuato",
    "foto": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=85",
    "fotoAlt": "Mesas y flores para celebrar juntos"
  },
  "vestimenta": {
    "codigo": "Formal",
    "descripcion": "Traje y vestido largo. Reservamos el blanco para la novia; trae zapatos cómodos para bailar toda la noche."
  },
  "regalos": {
    "mensaje": "Tu compañía es nuestro mejor regalo. Si deseas tener un detalle con nosotros, habrá un espacio para sobres el día de la boda.",
    "sobres": true
  },
  "galeria": [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=85"
  ],
  "itinerario": [
    {
      "hora": "17:00",
      "titulo": "El sí, para siempre",
      "lugar": "Ceremonia · Jardín de los Olivos"
    },
    {
      "hora": "18:00",
      "titulo": "Un brindis por nosotros",
      "lugar": "Cóctel de bienvenida · La terraza"
    },
    {
      "hora": "19:30",
      "titulo": "A la mesa",
      "lugar": "Cena · Salón Los Olivos"
    },
    {
      "hora": "21:00",
      "titulo": "La noche es nuestra",
      "lugar": "Primer baile y fiesta · Pista principal"
    }
  ],
  "version": 1
}$config$::jsonb;
$function$;
revoke all on function invito_private.configuracion_muestra() from public, anon, authenticated;

create function invito_private.crear_evento_muestra(nombre_input text, slug_input text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare resultado jsonb; eid uuid;
begin
  if auth.uid() is null or not invito_private.es_admin() then
    raise exception 'Solo el administrador puede crear muestras' using errcode='42501';
  end if;
  if length(trim(nombre_input)) > 160 then raise exception 'El nombre es demasiado largo'; end if;
  resultado := invito_private.panel('crear_evento',jsonb_build_object(
    'nombre',nombre_input,'slug',slug_input,'fecha','2027-06-19','plantilla','editorial'));
  eid := (resultado->>'id')::uuid;
  update public.eventos set es_muestra=true, configuracion=invito_private.configuracion_muestra() where id=eid;
  update public.evento_negocio set precio=0,abonado=0,notas='Evento ficticio para mostrar las plantillas.' where evento_id=eid;
  insert into public.evento_actividad(evento_id,actor,accion) values(eid,auth.uid(),'Evento de muestra preparado');
  return resultado;
end $$;
revoke all on function invito_private.crear_evento_muestra(text,text) from public,anon,authenticated;
grant execute on function invito_private.crear_evento_muestra(text,text) to authenticated;
create function public.crear_evento_muestra(nombre_input text, slug_input text) returns jsonb
language sql security invoker set search_path='' as $$
  select invito_private.crear_evento_muestra(nombre_input,slug_input);
$$;
revoke all on function public.crear_evento_muestra(text,text) from public,anon,authenticated;
grant execute on function public.crear_evento_muestra(text,text) to authenticated;

-- Insert one new fictional event and point all three templates at it.
-- Never change an existing customer's event or depend on generated identifiers.
do $$
declare eid uuid; sample_slug text := 'muestra-mariana-y-santiago';
begin
  if exists(select 1 from public.eventos where slug=sample_slug) then
    sample_slug := sample_slug || '-' || gen_random_uuid()::text;
  end if;
  insert into public.eventos(nombre_evento,slug,fecha,plantilla,publicacion,es_muestra,configuracion,modulos_activos)
  values('Mariana & Santiago',sample_slug,'2027-06-19','editorial','borrador',true,
    invito_private.configuracion_muestra(),
    '{"sobre":true,"portada":true,"mensaje":true,"cuenta_regresiva":true,"ceremonia":true,"recepcion":true,"vestimenta":true,"regalos":true,"galeria":true,"itinerario":true,"rsvp":true,"qr":true,"musica":true}')
  returning id into eid;
  insert into public.evento_negocio(evento_id,precio,abonado,notas)
  values(eid,0,0,'Evento ficticio para mostrar las plantillas. Cambia sus imágenes y contenido desde el editor.');
  insert into public.evento_actividad(evento_id,accion) values(eid,'Evento de muestra inicial preparado');
  insert into public.muestras_plantillas(plantilla,evento_id)
  select plantilla,eid from unnest(array['editorial','aura_xv','nocturno']) as plantilla;
end $$;
