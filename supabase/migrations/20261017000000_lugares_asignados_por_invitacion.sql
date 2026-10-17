-- Cada invitación guarda el total de lugares que incluye, sin sumar un titular implícito.
update public.invitados set acompanantes = 1 where acompanantes is null or acompanantes < 1;
alter table public.invitados rename column acompanantes to lugares_asignados;
alter table public.invitados alter column lugares_asignados set default 1;
alter table public.invitados alter column lugares_asignados set not null;
alter table public.invitados add constraint invitados_lugares_asignados_positivos check (lugares_asignados >= 1);

create or replace function public.validar_cupo_invitados()
returns trigger language plpgsql security definer set search_path = '' as $$
declare limite integer; usados integer;
begin
  select nullif(e.configuracion->>'limiteInvitados','')::integer into limite
  from public.eventos e where e.id=new.evento_id;
  if limite is null or limite < 1 then return new; end if;
  select coalesce(sum(i.lugares_asignados),0) into usados
  from public.invitados i where i.evento_id=new.evento_id and i.id is distinct from new.id;
  if usados + new.lugares_asignados > limite then
    raise exception 'El registro supera el cupo configurado de % invitados.', limite using errcode='23514';
  end if;
  return new;
end $$;

drop trigger if exists validar_cupo_invitados on public.invitados;
create trigger validar_cupo_invitados before insert or update of evento_id,lugares_asignados
on public.invitados for each row execute function public.validar_cupo_invitados();
revoke execute on function public.validar_cupo_invitados() from public, anon, authenticated;

-- Ajusta las operaciones del panel/check-in que antes agregaban un titular implícito.
do $$ declare f record; definition text; begin
  for f in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where p.prokind='f' and n.nspname in ('public','invito_private')
    and pg_get_functiondef(p.oid) ilike '%acompanantes%' loop
    definition:=pg_get_functiondef(f.oid);
    definition:=replace(definition,'1+coalesce(i.acompanantes,0)','i.lugares_asignados');
    definition:=replace(definition,'guest.entradas+cantidad>1+coalesce(guest.acompanantes,0)','guest.entradas+cantidad>guest.lugares_asignados');
    definition:=replace(definition,'.acompanantes','.lugares_asignados');
    definition:=replace(definition,'1 + COALESCE(i.lugares_asignados, 0)','i.lugares_asignados');
    definition:=replace(definition,'1+coalesce(i.lugares_asignados,0)','i.lugares_asignados');
    definition:=replace(definition,'guest.entradas + cantidad > (1 + COALESCE(guest.lugares_asignados, 0))','guest.entradas + cantidad > guest.lugares_asignados');
    definition:=replace(definition,'guest.entradas+cantidad>1+coalesce(guest.lugares_asignados,0)','guest.entradas+cantidad>guest.lugares_asignados');
    execute definition;
  end loop;
end $$;

-- Las funciones públicas conservan el nombre de salida anterior para no romper enlaces ya publicados,
-- pero el valor que devuelven ahora es el total de lugares.
create or replace function public.get_invitado_by_token(token_input text)
returns table(id uuid,nombre text,estado text,acompanantes smallint,token text,checked_in boolean,mesa_nombre text)
language sql security definer set search_path='' as $$
 select i.id,i.nombre,i.estado,i.lugares_asignados::smallint,i.token,i.checked_in,m.nombre
 from public.invitados i join public.eventos e on e.id=i.evento_id
 left join public.mesas m on m.id=i.mesa_id and m.evento_id=e.id
 where i.token=token_input and e.publicacion='publicado';
$$;
