# Contrato de invitación — versión 1

La base remota ya fue actualizada con database/prepare_invitation_sections.sql.
Es un registro del cambio aplicado, no una migración para ejecutar repetidamente.
No se modificaron los componentes en este paso.

## Evento
- plantilla: identificador del registro (actual: editorial).
- plantilla_version: entero positivo; preparado para versiones futuras. El frontend aún no selecciona versiones.
- fecha: fecha local del evento para listados.
- configuracion.fechaHora: inicio ISO 8601 con offset. Mantener su fecha local consistente con fecha.
- configuracion.zonaHoraria: zona IANA para calendarios.
- modulos_activos: booleanos por sección; frontend pendiente de conectarlos.

## Configuración inicial completa
Los defaults de columna se aplican al omitir la columna al insertar. Si se envía un objeto parcial, el editor debe combinarlo con esta estructura; no hay normalización automática de objetos parciales.

```json
{
  "version": 1,
  "encabezado": "Celebremos juntos",
  "nombres": [],
  "fotoPortada": null,
  "encuadrePortada": "center",
  "mensajeBase": null,
  "fotoMensaje": null,
  "fotoMensajeAlt": null,
  "fechaHora": null,
  "zonaHoraria": null,
  "calendario": {
    "titulo": null,
    "descripcion": null,
    "ubicacion": null,
    "fechaFin": null
  },
  "ceremonia": {
    "hora": null,
    "lugar": null,
    "direccion": null,
    "foto": null,
    "fotoAlt": null,
    "mapsUrl": null
  },
  "recepcion": {
    "hora": null,
    "lugar": null,
    "direccion": null,
    "foto": null,
    "fotoAlt": null,
    "mapsUrl": null
  },
  "historia": {
    "titulo": null,
    "texto": null,
    "fotos": []
  },
  "galeria": [],
  "itinerario": [],
  "vestimenta": {
    "codigo": null,
    "descripcion": null,
    "referencias": [],
    "coloresReservados": []
  },
  "regalos": {
    "mensaje": null,
    "enlaces": []
  },
  "informacion": {
    "fechaLimiteRsvp": null,
    "ninos": null,
    "estacionamiento": null,
    "transporte": null,
    "notas": []
  },
  "hospedaje": [],
  "album": {
    "url": null,
    "instrucciones": null
  },
  "cierre": {
    "mensaje": null,
    "firma": null,
    "contactos": []
  },
  "musicaUrl": null,
  "tema": {},
  "diseno": {}
}
```

## Elementos de las listas
- nombres: strings, un nombre por protagonista. No deducirlos automáticamente del título comercial.
- galeria: URLs de imágenes (se mantiene compatible con GaleriaManager y agregar_foto_galeria).
- itinerario: { hora, titulo, lugar, mapsUrl }.
- historia.fotos: URLs.
- vestimenta.referencias: { imagen, descripcion }.
- vestimenta.coloresReservados: { nombre, hex }.
- regalos.enlaces: { nombre, url, codigo }.
- informacion.notas: { titulo, texto }.
- hospedaje: { nombre, direccion, url, mapsUrl, codigoReserva, notas, foto }.
- cierre.contactos: { nombre, telefono, whatsappUrl, email }.
Todos los enlaces son opcionales y deben validarse antes de mostrarse. No almacenar notas internas o credenciales en configuracion: es contenido de invitación.

## Secciones y orden
Sobre → portada → mensaje → cuenta regresiva/calendario → historia → ceremonia/recepción → galería → itinerario → vestimenta → regalos → información → hospedaje → RSVP/QR → álbum → cierre.
musica es un control transversal. Un módulo activo sin contenido suficiente debe omitirse, no mostrar datos inventados.
El QR además requiere confirmación del invitado.

## Separación de diseño
tema conserva los colores existentes. diseno contiene ajustes visuales específicos de la plantilla; nunca las direcciones o textos del evento.
encabezado, fotoPortada, encuadrePortada, mensajeBase, fotoMensaje y ceremonia son datos comunes a los diseños.
editorial es exclusivamente una proyección temporal de compatibilidad en get_invitacion; los nuevos editores deben escribir las claves comunes.

## API
get_invitacion conserva los campos anteriores y añade plantilla, plantilla_version y modulos_activos.
La consulta pública por token fue probada con rol anon.
Sigue generando configuracion.editorial para los componentes actuales. Retirar esta proyección cuando Hero, Mensaje y Ceremonia lean las claves comunes.
No se cambiaron los procedimientos de RSVP, check-in ni subida de fotos.

## Evento de prueba
Fecha confirmada: 2027-08-18T17:00:00-06:00, America/Mexico_City.
Se conservaron 7 imágenes, música, mensaje y 2 actividades.
Ceremonia: 17:00, Parroquia San Juan. Recepción: 19:00, Salón Jardín.
Se conservaron sus enlaces de búsqueda en Maps; faltan direcciones exactas y fotos de sedes.
Vestimenta, regalos, información, historia, hospedaje, álbum y cierre permanecen vacíos y desactivados.
No se copió contenido ficticio de la demo.

## Verificación y límites
- Revisadas RLS existentes: habilitadas en eventos, invitados y mesas.
- No se ampliaron permisos sobre tablas.
- get_invitacion sigue siendo una API pública por token con SECURITY DEFINER; search_path vacío y tablas calificadas. No exige login porque los invitados acceden por enlace.
- Advisors conserva avisos sobre las funciones públicas por token y protección de contraseñas filtradas desactivada.
- Políticas existentes permiten lectura pública de eventos y mesas; no incluir información privada en esos registros. Esta tarea no cambia ese modelo.
- Faltan componentes, edición desde dashboard, validación completa de campos anidados y pruebas visuales. Preparar las claves no implementa esas funciones.

