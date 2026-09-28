# Administración de Invito

Acceso: `/admin`, con el correo verificado `invitofun@gmail.com`. No se crearon contraseñas ni se enviaron correos. La autorización se consulta en la base de datos, nunca en metadatos editables del usuario.

## Operación

1. Crear un evento como borrador desde `/admin/nuevo`.
2. Abrir el evento en administración y asignar hasta dos titulares por correo.
3. Compartir el enlace `/login`. Cada persona entra con el correo asignado y acepta su acceso desde `/dashboard`. No se envían invitaciones por correo automáticamente.
4. Configurar fotos, textos y detalles desde el editor; revisar la previsualización sin crear un invitado ficticio.
5. Seleccionar las secciones, registrar precio/abonos y publicar. Archivar retira el acceso público a las invitaciones, pero mantiene el panel de los titulares.
6. Titulares y administrador pueden asignar hasta dos porteros, indicando vigencia. Solo el administrador modifica titulares.

Las asignaciones pendientes vencen a los 14 días y ocupan una plaza hasta que se reemplacen o revoquen. Reemplazar una plaza quita inmediatamente el acceso anterior y requiere nueva aceptación. Cada correo solo puede ocupar una plaza por evento. Revocar al último titular no está permitido: se debe reemplazar.

## Recepción

El portero entra con su propia cuenta, acepta la asignación y ve únicamente recepción. Puede buscar por nombre o escanear el QR, revisar lugares restantes y confirmar cuántas personas llegaron. El servidor valida el rol vigente en cada operación, bloquea exceso de lugares y deduplica reintentos con un identificador de solicitud. Se conservan actor, cantidad y fecha de cada entrada en `evento_entradas`.

## Plantillas

Actualmente está disponible Editorial v1. Para añadir otra, desplegar su componente, registrarlo en `plantillas/registro.js`, añadir su ficha a `plantillas/catalogo.js` y actualizar la lista permitida en `invito_private.panel` mediante migración. No basta con crear una opción en el selector. Los datos del evento y sus invitados permanecen independientes del diseño.

## Base de datos

`database/admin_access.sql` corresponde a la migración remota `admin_event_access_and_reception`. No volver a ejecutar como script idempotente: crea tablas nuevas y migra propietarios existentes.

- `invito_private.administradores`: autorización del negocio; sin acceso directo del cliente.
- `evento_accesos`: dos plazas por rol/evento, permisos de lectura limitados y escritura exclusiva por funciones protegidas.
- `evento_negocio`: importes y notas privados del administrador.
- `evento_actividad`: registro de creación, accesos y cambios comerciales.
- `evento_entradas`: auditoría de recepción.
- `panel_operacion`: interfaz autenticada; la implementación privilegiada está en el esquema privado y comprueba identidad, rol y alcance.

`database/admin_public_summary.sql` mantiene la página pública de resumen con nombre y fecha únicamente. Las fotos públicas siguen usando sus URLs existentes; archivar un evento no vuelve privados los archivos del bucket.

Pruebas de permisos: ejecutar `database/tests/admin_access.sql` dentro de `BEGIN` y `ROLLBACK` en un entorno conectado. Crea datos de prueba que no deben confirmarse. Cubren límites, titular secundario, aislamiento del portero, aceptación por correo, revocación y entradas parciales/idempotentes.
