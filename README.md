# Invito

Aplicación Next.js para invitaciones digitales, confirmación de asistencia, asignación de mesas y registro con QR. Usa Supabase para autenticación, datos y almacenamiento.

## Desarrollo local

Requiere Node.js compatible con Next.js 16 y un proyecto Supabase configurado.

1. Ejecuta `npm ci`.
2. Crea `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` de tu proyecto Supabase. No incluyas la clave `service_role` en variables públicas.
3. Ejecuta `npm run dev` y abre `http://localhost:3000`.
4. Ejecuta `npm run lint` y `npm run build` antes de publicar.

## Configuración pendiente para usarlo con datos reales

El repositorio aún no incluye migraciones ni políticas RLS. La aplicación espera las tablas `eventos`, `invitados` y `mesas`, el bucket `fotos_eventos` y las funciones RPC `get_invitacion`, `actualizar_estado_invitado`, `hacer_checkin` y `agregar_foto_galeria`. Antes de abrir el servicio al público, incorpora las migraciones y comprueba que cada consulta y función respete los permisos del propietario del evento y del invitado.

Configura Google OAuth y el enlace por correo en Supabase, con `/auth/callback` entre las URL permitidas. Sustituye los valores de ejemplo de precio, WhatsApp y correo en `src/app/page.js` por los datos comerciales correctos antes de publicar la página.
