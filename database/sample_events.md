# Eventos de muestra

En **Administración → Muestras de la página principal**, cada plantilla se asigna a un evento marcado `es_muestra`. La migración carga una boda ficticia y la asigna inicialmente a Editorial, Aura y Nocturno.

- **Editar fotos y contenido** abre el editor habitual y permite subir imágenes al almacenamiento existente.
- Los cambios guardados se reflejan en todas las plantillas asignadas al evento.
- **Crear otro evento de muestra** prepara una boda ficticia completa, sin asignarla automáticamente. Personalízala y después guarda su asignación.
- **Sin muestra pública** retira la plantilla del inicio. Archivar el evento oculta todas sus muestras; restaurarlo vuelve a mostrarlas donde siga asignado.
- Las muestras usan confirmaciones locales: no crean invitados ni pases QR válidos. No cuentan en los totales comerciales.

`public.muestras_plantillas` contiene únicamente la proyección pública del contenido de las muestras asignadas. Sus triggers privados sincronizan el editor con esta proyección. RLS permite leer las muestras disponibles y reserva las asignaciones al administrador; los clientes no pueden modificar la proyección, marcar eventos existentes como muestras ni asignar eventos de clientes.

El estado `borrador` del evento permite preparar y editar contenido; la asignación explícita es lo que lo publica como muestra. No requiere asignar un titular ni cambiar la publicación de una invitación real.

Verificación: ejecutar `database/tests/template_samples.sql` entre `BEGIN` y `ROLLBACK`. Comprueba creación, sincronización de fotos, asignaciones, retirada, archivado y permisos de administrador, usuario ajeno y visitante anónimo sin conservar datos de prueba.
