-- Ejecutar dentro de BEGIN / ROLLBACK; no conserva usuarios ni eventos de prueba.
do $test$
declare
  admin_id uuid := gen_random_uuid();
  ajeno_id uuid := gen_random_uuid();
  admin_email text := 'aura-' || gen_random_uuid() || '@invito.invalid';
  result jsonb;
  eid uuid;
  config_original jsonb;
begin
  insert into auth.users(id,email,email_confirmed_at) values
    (admin_id,admin_email,now()), (ajeno_id,'ajeno-' || gen_random_uuid() || '@invito.invalid',now());
  insert into invito_private.administradores(email) values(admin_email);
  perform set_config('request.jwt.claim.sub',admin_id::text,true);
  set local role authenticated;
  result := public.panel_operacion('crear_evento',jsonb_build_object('nombre','Prueba Aura XV','slug','test-aura-' || gen_random_uuid(),'plantilla','aura_xv','fecha','2027-08-21'));
  eid := (result->>'id')::uuid;
  if not exists(select 1 from public.eventos where id=eid and plantilla='aura_xv' and plantilla_version=1 and publicacion='borrador') then
    raise exception 'FAIL: crear_evento no conservó Aura XV';
  end if;
  select configuracion into config_original from public.eventos where id=eid;
  perform public.panel_operacion('negocio',jsonb_build_object('evento_id',eid,'plantilla','editorial','version',1,'publicacion','borrador','trabajo','por_preparar','precio',1490,'abonado',0));
  if not exists(select 1 from public.eventos where id=eid and plantilla='editorial' and configuracion=config_original) then
    raise exception 'FAIL: cambiar de plantilla alteró el contenido';
  end if;
  perform public.panel_operacion('negocio',jsonb_build_object('evento_id',eid,'plantilla','aura_xv','version',1,'publicacion','borrador','trabajo','por_preparar','precio',1490,'abonado',0));
  if not exists(select 1 from public.eventos where id=eid and plantilla='aura_xv' and configuracion=config_original) then
    raise exception 'FAIL: no se pudo seleccionar Aura XV';
  end if;
  begin
    perform public.panel_operacion('negocio',jsonb_build_object('evento_id',eid,'plantilla','aura_xv','version',2));
    raise exception 'FAIL: aceptó una versión desconocida';
  exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
  begin
    perform public.panel_operacion('crear_evento',jsonb_build_object('nombre','Inválido','slug','invalid-' || gen_random_uuid(),'plantilla','inventada'));
    raise exception 'FAIL: aceptó una plantilla desconocida';
  exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
  begin
    perform public.panel_operacion('crear_evento',jsonb_build_object('nombre','Sin plantilla','slug','invalid-' || gen_random_uuid()));
    raise exception 'FAIL: aceptó plantilla nula';
  exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
  perform set_config('request.jwt.claim.sub',ajeno_id::text,true);
  begin
    perform public.panel_operacion('crear_evento',jsonb_build_object('nombre','Sin permiso','slug','forbidden-' || gen_random_uuid(),'plantilla','aura_xv'));
    raise exception 'FAIL: usuario ajeno pudo crear evento';
  exception when insufficient_privilege then null; end;
  begin
    perform public.panel_operacion('negocio',jsonb_build_object('evento_id',eid,'plantilla','aura_xv','version',1));
    raise exception 'FAIL: usuario ajeno pudo cambiar plantilla';
  exception when insufficient_privilege then null; end;
  reset role;
end;
$test$;
