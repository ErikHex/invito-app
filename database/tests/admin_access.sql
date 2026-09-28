-- Run inside a transaction and roll back. No fixture accounts or events are retained.
do $$
declare
 admin_id uuid:=gen_random_uuid(); titular1 uuid:=gen_random_uuid(); titular2 uuid:=gen_random_uuid();
 portero1 uuid:=gen_random_uuid(); portero2 uuid:=gen_random_uuid(); ajeno uuid:=gen_random_uuid();
 eid uuid; gid uuid:=gen_random_uuid(); nonce uuid:=gen_random_uuid(); tok text:=gen_random_uuid()::text;
 result jsonb; n integer; cfg jsonb;
begin
 insert into auth.users(id,email,email_confirmed_at) values
 (admin_id,'admin-test@invito.invalid',now()),(titular1,'titular1-test@invito.invalid',now()),(titular2,'titular2-test@invito.invalid',now()),
 (portero1,'portero1-test@invito.invalid',now()),(portero2,'portero2-test@invito.invalid',now()),(ajeno,'ajeno-test@invito.invalid',now());
 insert into invito_private.administradores(email) values('admin-test@invito.invalid');
 perform set_config('request.jwt.claim.sub',admin_id::text,true); set local role authenticated;
 result:=public.panel_operacion('crear_evento',jsonb_build_object('nombre','Prueba de permisos','slug','test-'||replace(gen_random_uuid()::text,'-',''),'fecha','2027-06-19','plantilla','editorial'));
 eid:=(result->>'id')::uuid;
 select configuracion into cfg from public.eventos where id=eid;
 perform public.guardar_editor_evento(eid,'Evento guardado por administrador','2027-07-20',cfg || '{"encabezado":"Encabezado actualizado"}'::jsonb,cfg);
 if not exists(select 1 from public.eventos where id=eid and nombre_evento='Evento guardado por administrador' and fecha='2027-07-20' and configuracion->>'encabezado'='Encabezado actualizado') then
  raise exception 'FAIL: administrator changes were not persisted';
 end if;
 begin
  perform public.guardar_editor_evento(eid,'Cambios obsoletos','2027-06-19',cfg,cfg);
  raise exception 'FAIL: stale configuration overwrote saved changes';
 exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform public.panel_operacion('asignar',jsonb_build_object('evento_id',eid,'rol','titular','plaza',1,'email','titular1-test@invito.invalid'));
 perform public.panel_operacion('asignar',jsonb_build_object('evento_id',eid,'rol','titular','plaza',2,'email','titular2-test@invito.invalid'));
 begin perform public.panel_operacion('asignar',jsonb_build_object('evento_id',eid,'rol','titular','plaza',3,'email','third@invito.invalid')); raise exception 'FAIL: third holder accepted'; exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform public.panel_operacion('negocio',jsonb_build_object('evento_id',eid,'plantilla','editorial','version',1,'publicacion','publicado','trabajo','en_revision','precio',1490,'abonado',0));
 perform set_config('request.jwt.claim.sub',titular1::text,true);
 perform public.panel_operacion('aceptar',jsonb_build_object('evento_id',eid));
 if invito_private.rol_evento(eid) <> 'titular' then raise exception 'FAIL: acceptance'; end if;
 begin perform public.panel_operacion('asignar',jsonb_build_object('evento_id',eid,'rol','titular','plaza',2,'email','ajeno-test@invito.invalid')); raise exception 'FAIL: holder changed roles'; exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 begin update public.eventos set plantilla='unavailable' where id=eid; raise exception 'FAIL: holder changed template'; exception when insufficient_privilege then null; end;
 select configuracion into cfg from public.eventos where id=eid;
 perform public.guardar_editor_evento(eid,'Prueba editada','2027-06-19',cfg,cfg);
 perform public.panel_operacion('asignar',jsonb_build_object('evento_id',eid,'rol','portero','plaza',1,'email','portero1-test@invito.invalid','vence',now()+interval '2 days'));
 perform public.panel_operacion('asignar',jsonb_build_object('evento_id',eid,'rol','portero','plaza',2,'email','portero2-test@invito.invalid','vence',now()+interval '2 days'));
 begin perform public.panel_operacion('asignar',jsonb_build_object('evento_id',eid,'rol','portero','plaza',3,'email','third@invito.invalid','vence',now()+interval '2 days')); raise exception 'FAIL: third gatekeeper accepted'; exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 insert into public.invitados(id,evento_id,nombre,token,estado,acompanantes) values(gid,eid,'Familia Prueba',tok,'confirmado',3);
 perform set_config('request.jwt.claim.sub',titular2::text,true);
 perform public.panel_operacion('aceptar',jsonb_build_object('evento_id',eid));
 perform public.registrar_envio(gid,'enviar','whatsapp');
 select count(*) into n from public.invitados where id=gid; if n<>1 then raise exception 'FAIL: second holder access'; end if;
 perform set_config('request.jwt.claim.sub',portero1::text,true);
 perform public.panel_operacion('aceptar',jsonb_build_object('evento_id',eid));
 select count(*) into n from public.invitados where id=gid; if n<>0 then raise exception 'FAIL: gatekeeper sees guest personal data'; end if;
 select count(*) into n from public.eventos where id=eid; if n<>0 then raise exception 'FAIL: gatekeeper sees invitation/bank data'; end if;
 select count(*) into n from public.evento_negocio where evento_id=eid; if n<>0 then raise exception 'FAIL: gatekeeper sees commercial data'; end if;
 result:=public.panel_operacion('buscar',jsonb_build_object('evento_id',eid,'texto','Familia'));
 if jsonb_array_length(result)<>1 or result->0 ? 'telefono' or result->0 ? 'token' then raise exception 'FAIL: reception projection'; end if;
 perform public.panel_operacion('entrada',jsonb_build_object('evento_id',eid,'invitado_id',gid,'cantidad',2,'solicitud',nonce));
 perform public.panel_operacion('entrada',jsonb_build_object('evento_id',eid,'invitado_id',gid,'cantidad',2,'solicitud',nonce));
 result:=public.panel_operacion('buscar',jsonb_build_object('evento_id',eid,'token',tok));
 if (result->0->>'entradas')::integer<>2 then raise exception 'FAIL: idempotent partial admission'; end if;
 begin perform public.panel_operacion('entrada',jsonb_build_object('evento_id',eid,'invitado_id',gid,'cantidad',3,'solicitud',gen_random_uuid())); raise exception 'FAIL: capacity exceeded'; exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform set_config('request.jwt.claim.sub',ajeno::text,true);
 begin perform public.panel_operacion('aceptar',jsonb_build_object('evento_id',eid)); raise exception 'FAIL: wrong email accepted'; exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 begin perform public.panel_operacion('buscar',jsonb_build_object('evento_id',eid,'texto','Familia')); raise exception 'FAIL: outsider searched'; exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 perform set_config('request.jwt.claim.sub',titular2::text,true);
 perform public.panel_operacion('revocar',jsonb_build_object('evento_id',eid,'rol','portero','plaza',1));
 perform set_config('request.jwt.claim.sub',portero1::text,true);
 begin perform public.panel_operacion('recepcion',jsonb_build_object('evento_id',eid)); raise exception 'FAIL: revoked access works'; exception when others then if sqlerrm like 'FAIL:%' then raise; end if; end;
 reset role;
end $$;
