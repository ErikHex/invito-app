-- Extiende solo el catálogo permitido; conserva permisos y operaciones del panel.
-- Se aplica sobre la definición vigente para no sobrescribir otros cambios.
do $migration$
declare
  definition text := pg_get_functiondef('invito_private.panel(text,jsonb)'::regprocedure);
  old_check text := $old$datos->>'plantilla' is distinct from 'editorial'$old$;
  new_check text := $new$(datos->>'plantilla' is null or datos->>'plantilla' not in ('editorial', 'aura_xv'))$new$;
  old_insert text := $old$::date,uid,'editorial','borrador'$old$;
  new_insert text := $new$::date,uid,datos->>'plantilla','borrador'$new$;
begin
  if position(new_check in definition) > 0 and position(new_insert in definition) > 0 then
    return;
  end if;
  if (length(definition) - length(replace(definition, old_check, ''))) / length(old_check) <> 2
    or position(old_insert in definition) = 0 then
    raise exception 'La definición del panel cambió. Revisa la migración de Aura XV antes de aplicarla.';
  end if;
  definition := replace(definition, old_check, new_check);
  definition := replace(definition, old_insert, new_insert);
  execute definition;
end;
$migration$;
