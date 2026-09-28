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

## Respaldo de recepción sin internet

Desde **Invitados → Descargar lista para recepción**, los titulares pueden guardar un PDF tamaño carta con la lista alfabética y la distribución por mesa. La descarga consulta de nuevo todos los invitados y mesas del evento, por páginas, sin aplicar los filtros visibles del panel. Requiere internet para obtener los datos; el archivo guardado funciona sin conexión.

Incluye respuesta, lugares (titular y acompañantes), entradas previas y una columna en blanco para nuevas llegadas. Los lugares confirmados del resumen solo cuentan invitaciones confirmadas. Las invitaciones sin respuesta y rechazadas se incluyen para consulta, con su estado visible. El archivo no contiene teléfonos ni tokens de invitación.

Descargar antes del evento y repartir una copia al equipo de recepción. La fecha de descarga aparece en cada página. Los cambios posteriores y las anotaciones en papel no se sincronizan: el equipo debe conciliarlos al recuperar la conexión. Coordinar el uso de copias para no registrar dos veces a la misma familia.

## Plantillas disponibles

Disponibles: **Editorial v1** y **Aura XV v1** (`aura_xv`). Aura XV está pensada para quinceañeras: fondo claro, lavanda, fotografía editorial, ilustración de respaldo sin foto y entradas con GSAP. Su demo está en `/demo/xv`.

El administrador la elige en `/admin/nuevo` o en **Entrega y seguimiento comercial → Plantilla** de un evento existente. En el editor, escribir el nombre de la quinceañera en **Nombres** y cargar sus fotos, mensajes y detalles habituales. Conserva las mismas secciones, controles de visibilidad, música, sobre, confirmaciones y QR. Cambiar de plantilla no modifica invitados ni contenido.

Aura XV carga su código cuando se necesita y desactiva las animaciones al detectar movimiento reducido. El sobre usa papel lavanda y sello plateado. La galería se amplía en un diálogo que admite Escape y navegación por teclado. Las fotografías de la demo son referencias de ambientación, no fotos de una cliente real.

La migración `supabase/migrations/20260928205317_add_aura_xv_template.sql` amplía la lista permitida y hace que la creación respete la plantilla elegida. Es incremental: requiere la estructura previa documentada en `database/`; no constituye un esquema inicial para una base vacía. Se aplicó al proyecto conectado. Pruebas: `database/tests/aura_xv.sql`, siempre dentro de `BEGIN` / `ROLLBACK`.

Para añadir otra, desplegar su componente, registrarlo en `plantillas/registro.js`, añadir su ficha a `plantillas/catalogo.js` y actualizar la lista permitida en `invito_private.panel` mediante migración. No basta con crear una opción en el selector. Los datos del evento y sus invitados permanecen independientes del diseño.

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

### Verificación de Aura XV

Se probaron creación, cambio de plantilla sin pérdida de contenido, rechazo de plantilla/versión inválida y denegación a usuarios ajenos, con datos temporales revertidos. La migración conserva los permisos existentes.

El asesor de Supabase también reporta avisos en funciones públicas existentes con `SECURITY DEFINER` ([acceso anónimo](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable) y [autenticado](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)), [RLS sin políticas](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) en la tabla privada de administradores y [protección de contraseñas filtradas desactivada](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Estos avisos corresponden a configuración ajena al registro de la nueva plantilla; no se modificó durante esta entrega.
