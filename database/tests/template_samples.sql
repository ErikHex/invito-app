-- Execute inside BEGIN/ROLLBACK; no accounts, assignments or content survive.
do $$
declare
  admin_id uuid:=gen_random_uuid(); outsider uuid:=gen_random_uuid();
  admin_email text:='sample-admin-'||gen_random_uuid()||'@invito.invalid';
  result jsonb; eid uuid; normal_id uuid; cfg jsonb; n integer;
begin
  insert into auth.users(id,email,email_confirmed_at) values
    (admin_id,admin_email,now()),(outsider,'sample-outsider-'||gen_random_uuid()||'@invito.invalid',now());
  insert into invito_private.administradores(email) values(admin_email);
  perform set_config('request.jwt.claim.sub',admin_id::text,true);
  set local role authenticated;
  result:=public.crear_evento_muestra('Muestra de prueba','sample-test-'||gen_random_uuid());
  eid:=(result->>'id')::uuid;
  select configuracion into cfg from public.eventos where id=eid and es_muestra;
  if cfg is null or jsonb_array_length(cfg->'galeria')<2 or jsonb_array_length(cfg->'itinerario')<3
    or cfg->>'fotoPortada' is null or cfg->'recepcion'->>'lugar' is null then
    raise exception 'FAIL: sample not fully seeded';
  end if;
  if not exists(select 1 from public.evento_negocio where evento_id=eid and precio=0 and abonado=0) then
    raise exception 'FAIL: sample has commercial balance';
  end if;
  if exists(select 1 from public.invitados where evento_id=eid) then raise exception 'FAIL: real guests created'; end if;
  update public.muestras_plantillas set evento_id=eid;
  get diagnostics n=row_count;
  if n<>3 then raise exception 'FAIL: admin assignment'; end if;
  perform public.guardar_editor_evento(eid,'Contenido editado','2027-06-19',cfg||'{"fotoPortada":"https://example.com/foto-propia.jpg","galeria":["https://example.com/galeria.jpg"]}',cfg);
  if (select count(*) from public.muestras_plantillas where nombre_evento='Contenido editado'
    and configuracion->>'fotoPortada'='https://example.com/foto-propia.jpg')<>3 then
    raise exception 'FAIL: content not synced across templates';
  end if;
  result:=public.panel_operacion('crear_evento',jsonb_build_object('nombre','Evento privado','slug','private-test-'||gen_random_uuid(),'fecha','2027-06-19','plantilla','editorial'));
  normal_id:=(result->>'id')::uuid;
  begin
    update public.muestras_plantillas set evento_id=normal_id where plantilla='editorial';
    raise exception 'FAIL: customer event exposed';
  exception when invalid_parameter_value then null; end;
  begin
    update public.eventos set es_muestra=true where id=normal_id;
    raise exception 'FAIL: direct sample flag mutation';
  exception when insufficient_privilege then null; end;
  begin
    update public.muestras_plantillas set configuracion='{}'::jsonb where plantilla='editorial';
    raise exception 'FAIL: public projection can be forged';
  exception when insufficient_privilege then null; end;

  -- A signed-in customer cannot assign samples, create samples, or read drafts.
  perform set_config('request.jwt.claim.sub',outsider::text,true);
  update public.muestras_plantillas set evento_id=null;
  get diagnostics n=row_count;
  if n<>0 then raise exception 'FAIL: outsider changed assignments'; end if;
  begin
    perform public.crear_evento_muestra('No autorizado','unauthorized-'||gen_random_uuid());
    raise exception 'FAIL: outsider created sample';
  exception when insufficient_privilege then null; end;
  if exists(select 1 from public.eventos where id in (eid,normal_id)) then raise exception 'FAIL: private event visible'; end if;

  -- No sign-in is needed for the safe sample projection, but guests stay private.
  perform set_config('request.jwt.claim.sub','',true);
  set local role anon;
  if (select count(*) from public.muestras_plantillas where disponible)<>3 then raise exception 'FAIL: anon cannot read samples'; end if;
  begin
    update public.muestras_plantillas set evento_id=null;
    raise exception 'FAIL: anon changed samples';
  exception when insufficient_privilege then null; end;
  begin
    perform public.crear_evento_muestra('No autorizado','anon-'||gen_random_uuid());
    raise exception 'FAIL: anon created sample';
  exception when insufficient_privilege then null; end;
  begin
    perform 1 from public.invitados;
    raise exception 'FAIL: anon reads guests';
  exception when insufficient_privilege then null; end;

  perform set_config('request.jwt.claim.sub',admin_id::text,true);
  set local role authenticated;
  perform public.panel_operacion('negocio',jsonb_build_object('evento_id',eid,'plantilla','editorial','version',1,'publicacion','archivado','trabajo','por_preparar','precio',0,'abonado',0));
  perform set_config('request.jwt.claim.sub','',true);
  set local role anon;
  if exists(select 1 from public.muestras_plantillas) then raise exception 'FAIL: archived sample still public'; end if;

  perform set_config('request.jwt.claim.sub',admin_id::text,true);
  set local role authenticated;
  begin
    update public.muestras_plantillas set evento_id=eid where plantilla='editorial';
    raise exception 'FAIL: archived event assigned';
  exception when invalid_parameter_value then null; end;
  perform public.panel_operacion('negocio',jsonb_build_object('evento_id',eid,'plantilla','editorial','version',1,'publicacion','borrador','trabajo','por_preparar','precio',0,'abonado',0));
  update public.muestras_plantillas set evento_id=null where plantilla='editorial';
  if not exists(select 1 from public.muestras_plantillas where plantilla='editorial' and configuracion='{}'::jsonb and not disponible) then
    raise exception 'FAIL: unassigned content not cleared';
  end if;
  perform set_config('request.jwt.claim.sub','',true);
  set local role anon;
  if exists(select 1 from public.muestras_plantillas where plantilla='editorial') then raise exception 'FAIL: unassigned sample public'; end if;
  if (select count(*) from public.muestras_plantillas)<>2 then raise exception 'FAIL: remaining samples not restored'; end if;
  reset role;
end $$;
