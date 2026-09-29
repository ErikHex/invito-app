-- Agrega 'nocturno' a la lista permitida de plantillas en invito_private.panel.
-- Incremental, igual que la migración de Aura XV: se aplica sobre la definición
-- vigente y falla si la función cambió de forma inesperada.
do $migration$
declare
  definition text := pg_get_functiondef('invito_private.panel(text,jsonb)'::regprocedure);
  old_check text := $old$(datos->>'plantilla' is null or datos->>'plantilla' not in ('editorial', 'aura_xv'))$old$;
  new_check text := $new$(datos->>'plantilla' is null or datos->>'plantilla' not in ('editorial', 'aura_xv', 'nocturno'))$new$;
begin
  if position(new_check in definition) > 0 then
    return;
  end if;
  if (length(definition) - length(replace(definition, old_check, ''))) / length(old_check) <> 2 then
    raise exception 'La definición del panel cambió. Revisa las migraciones de Aura XV antes de aplicarla.';
  end if;
  definition := replace(definition, old_check, new_check);
  execute definition;
end;
$migration$;
