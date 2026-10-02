-- Add a new design without changing any existing event, sample assignment or grant.
do $migration$
declare
  definition text := pg_get_functiondef('invito_private.panel(text,jsonb)'::regprocedure);
  old_check text := $old$(datos->>'plantilla' is null or datos->>'plantilla' not in ('editorial', 'aura_xv', 'nocturno'))$old$;
  new_check text := $new$(datos->>'plantilla' is null or datos->>'plantilla' not in ('editorial', 'aura_xv', 'nocturno', 'jardin_romantico'))$new$;
begin
  if position(new_check in definition) = 0 then
    if (length(definition) - length(replace(definition, old_check, ''))) / length(old_check) <> 2 then
      raise exception 'La definición del panel cambió. Revisa la lista de plantillas antes de aplicar esta migración.';
    end if;
    execute replace(definition, old_check, new_check);
  end if;
end;
$migration$;

alter table public.muestras_plantillas
  drop constraint muestras_plantillas_plantilla_check,
  add constraint muestras_plantillas_plantilla_check
    check (plantilla in ('editorial', 'aura_xv', 'nocturno', 'jardin_romantico'));

-- Reuse only an explicitly public fictional sample. If none is available, leave
-- an unassigned row for the administrator, rather than exposing a real event.
insert into public.muestras_plantillas (plantilla, evento_id)
values ('jardin_romantico', (
  select m.evento_id
  from public.muestras_plantillas m
  join public.eventos e on e.id = m.evento_id
  where m.disponible and e.es_muestra and e.publicacion <> 'archivado'
  order by (m.plantilla = 'editorial') desc, m.plantilla
  limit 1
))
on conflict (plantilla) do nothing;
