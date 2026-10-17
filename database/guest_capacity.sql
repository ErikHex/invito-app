-- Enforces the event guest limit stored in eventos.configuracion.limiteInvitados.
-- Apply after dashboard_workflow.sql.
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
create trigger validar_cupo_invitados before insert or update of evento_id,lugares_asignados on public.invitados for each row execute function public.validar_cupo_invitados();
