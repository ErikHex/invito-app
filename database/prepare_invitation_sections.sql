BEGIN;
ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS plantilla text NOT NULL DEFAULT 'editorial';
ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS plantilla_version integer NOT NULL DEFAULT 1;
ALTER TABLE public.eventos ADD CONSTRAINT eventos_plantilla_valida CHECK (plantilla ~ '^[a-z][a-z0-9_-]*$' AND plantilla_version > 0);
ALTER TABLE public.eventos ALTER COLUMN configuracion SET DEFAULT '{"version":1,"encabezado":"Celebremos juntos","nombres":[],"fotoPortada":null,"encuadrePortada":"center","mensajeBase":null,"fotoMensaje":null,"fotoMensajeAlt":null,"fechaHora":null,"zonaHoraria":null,"calendario":{"titulo":null,"descripcion":null,"ubicacion":null,"fechaFin":null},"ceremonia":{"hora":null,"lugar":null,"direccion":null,"foto":null,"fotoAlt":null,"mapsUrl":null},"recepcion":{"hora":null,"lugar":null,"direccion":null,"foto":null,"fotoAlt":null,"mapsUrl":null},"historia":{"titulo":null,"texto":null,"fotos":[]},"galeria":[],"itinerario":[],"vestimenta":{"codigo":null,"descripcion":null,"referencias":[],"coloresReservados":[]},"regalos":{"mensaje":null,"enlaces":[]},"informacion":{"fechaLimiteRsvp":null,"ninos":null,"estacionamiento":null,"transporte":null,"notas":[]},"hospedaje":[],"album":{"url":null,"instrucciones":null},"cierre":{"mensaje":null,"firma":null,"contactos":[]},"musicaUrl":null,"tema":{},"diseno":{}}'::jsonb;
ALTER TABLE public.eventos ALTER COLUMN modulos_activos SET DEFAULT '{"sobre":true,"portada":true,"mensaje":true,"cuenta_regresiva":true,"calendario":false,"historia":false,"ceremonia":false,"recepcion":false,"galeria":false,"itinerario":false,"vestimenta":false,"regalos":false,"informacion":false,"hospedaje":false,"rsvp":true,"qr":true,"album":false,"cierre":false,"musica":false}'::jsonb;
UPDATE public.eventos SET configuracion = '{"version":1,"encabezado":"Celebremos juntos","nombres":[],"fotoPortada":null,"encuadrePortada":"center","mensajeBase":null,"fotoMensaje":null,"fotoMensajeAlt":null,"fechaHora":null,"zonaHoraria":null,"calendario":{"titulo":null,"descripcion":null,"ubicacion":null,"fechaFin":null},"ceremonia":{"hora":null,"lugar":null,"direccion":null,"foto":null,"fotoAlt":null,"mapsUrl":null},"recepcion":{"hora":null,"lugar":null,"direccion":null,"foto":null,"fotoAlt":null,"mapsUrl":null},"historia":{"titulo":null,"texto":null,"fotos":[]},"galeria":[],"itinerario":[],"vestimenta":{"codigo":null,"descripcion":null,"referencias":[],"coloresReservados":[]},"regalos":{"mensaje":null,"enlaces":[]},"informacion":{"fechaLimiteRsvp":null,"ninos":null,"estacionamiento":null,"transporte":null,"notas":[]},"hospedaje":[],"album":{"url":null,"instrucciones":null},"cierre":{"mensaje":null,"firma":null,"contactos":[]},"musicaUrl":null,"tema":{},"diseno":{}}'::jsonb || coalesce(configuracion,'{}'::jsonb),
 modulos_activos = '{"sobre":true,"portada":true,"mensaje":true,"cuenta_regresiva":true,"calendario":false,"historia":false,"ceremonia":false,"recepcion":false,"galeria":false,"itinerario":false,"vestimenta":false,"regalos":false,"informacion":false,"hospedaje":false,"rsvp":true,"qr":true,"album":false,"cierre":false,"musica":false}'::jsonb || coalesce(modulos_activos,'{}'::jsonb);
-- Move legacy editorial content into template-independent fields; preserve legacy extras.
UPDATE public.eventos SET configuracion = configuracion || jsonb_strip_nulls(jsonb_build_object(
 'encabezado',configuracion#>'{editorial,encabezado}',
 'fotoMensaje',configuracion#>'{editorial,fotoMensaje}',
 'fotoMensajeAlt',configuracion#>'{editorial,fotoMensajeAlt}',
 'ceremonia',configuracion#>'{editorial,ceremonia}',
 'encuadrePortada',configuracion#>'{editorial,encuadre}'
)) WHERE jsonb_typeof(configuracion->'editorial')='object';
-- Confirmed test-event date. No other event's date is inferred.
UPDATE public.eventos SET fecha='2027-08-18',
 configuracion = configuracion || '{"fechaHora":"2027-08-18T17:00:00-06:00","zonaHoraria":"America/Mexico_City"}'::jsonb
WHERE slug='juan-y-maria';
-- Reuse the existing ceremony and reception information, without inventing addresses or photos.
UPDATE public.eventos e SET configuracion = jsonb_set(jsonb_set(e.configuracion,'{ceremonia}',
 (e.configuracion->'ceremonia') || coalesce((select item - 'titulo' from jsonb_array_elements(e.configuracion->'itinerario') item where item->>'titulo'='Ceremonia' limit 1),'{}'::jsonb)),
 '{recepcion}',(e.configuracion->'recepcion') || coalesce((select item - 'titulo' from jsonb_array_elements(e.configuracion->'itinerario') item where item->>'titulo'='Recepción' limit 1),'{}'::jsonb))
WHERE e.slug='juan-y-maria';
UPDATE public.eventos SET modulos_activos=modulos_activos || jsonb_build_object(
 'calendario',true,'ceremonia',true,'recepcion',true,'itinerario',true,'musica',true)
WHERE slug='juan-y-maria';
ALTER TABLE public.eventos ALTER COLUMN configuracion SET NOT NULL;
ALTER TABLE public.eventos ALTER COLUMN modulos_activos SET NOT NULL;
ALTER TABLE public.eventos ADD CONSTRAINT eventos_configuracion_objeto CHECK (
 jsonb_typeof(configuracion)='object' AND
 jsonb_typeof(configuracion->'galeria')='array' AND
 jsonb_typeof(configuracion->'itinerario')='array' AND
 jsonb_typeof(configuracion->'ceremonia')='object' AND
 jsonb_typeof(configuracion->'recepcion')='object');
-- Same token lookup and existing public fields, with extra metadata for the future components.
DROP FUNCTION public.get_invitacion(text);
CREATE FUNCTION public.get_invitacion(token_input text)
RETURNS TABLE(id uuid,nombre text,estado text,acompanantes smallint,token text,checked_in boolean,mesa_nombre text,evento_nombre text,configuracion jsonb,plantilla text,plantilla_version integer,modulos_activos jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $fn$
 SELECT i.id,i.nombre,i.estado,i.acompanantes,i.token,i.checked_in,m.nombre,e.nombre_evento,
 -- Transitional projection for the current components, not a second stored source of content.
 e.configuracion || jsonb_build_object('editorial',
 coalesce(e.configuracion->'editorial','{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
 'encabezado',e.configuracion->'encabezado',
 'fotoMensaje',e.configuracion->'fotoMensaje',
 'fotoMensajeAlt',e.configuracion->'fotoMensajeAlt',
 'encuadre',e.configuracion->'encuadrePortada',
 'lugar',e.configuracion#>'{ceremonia,lugar}',
 'ceremonia',CASE WHEN e.modulos_activos->>'ceremonia'='true' THEN e.configuracion->'ceremonia' ELSE 'null'::jsonb END))),
 e.plantilla,e.plantilla_version,e.modulos_activos
 FROM public.invitados i JOIN public.eventos e ON e.id=i.evento_id
 LEFT JOIN public.mesas m ON m.id=i.mesa_id AND m.evento_id=e.id
 WHERE i.token=token_input;
$fn$;
REVOKE ALL ON FUNCTION public.get_invitacion(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invitacion(text) TO anon,authenticated,service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
