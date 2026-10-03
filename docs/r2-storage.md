# Fotos en Cloudflare R2

Las nuevas subidas de la galería usan `/api/media/upload`. El servidor verifica
la identidad con Supabase y consulta `panel_operacion('sesion')` para permitir
solo titulares y administradores del evento. Las URLs PUT duran 120 segundos
y firman el tipo y tamaño de la foto (máximo 8 MiB). Las fotos se optimizan
en el navegador antes de subirlas directamente a R2.

Configurar en `.env.local` y en el proveedor de hosting (solo servidor):

```dotenv
R2_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=REEMPLAZAR
R2_SECRET_ACCESS_KEY=REEMPLAZAR
R2_BUCKET=invito-media
R2_PUBLIC_URL=https://cdn.invito.fun
```

En Cloudflare, conectar `cdn.invito.fun` al bucket y guardar una política CORS
que permita PUT y Content-Type desde los orígenes exactos de la aplicación.
Ejemplo si producción usa `https://invito.fun` y `https://www.invito.fun`:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://invito.fun", "https://www.invito.fun"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

Agregar el origen de staging si corresponde. CORS no sustituye la autorización.
El navegador envía Content-Length automáticamente para el Blob; no establecerlo
manualmente. El token R2 debe limitarse a lectura y escritura de objetos del bucket.
Puede no tener permiso para consultar o modificar CORS: usar el panel de Cloudflare.

Verificar con sesión de titular: subir, guardar, recargar y reemplazar una foto.
Verificar también que un portero u otro usuario no pueda solicitar permisos
para subir a ese evento. Comprobar que la URL pública muestra la foto.

Las URLs existentes de Supabase siguen funcionando. Este cambio no copia ni
elimina objetos ni modifica las configuraciones guardadas. Antes de retirar
Supabase Storage: respaldar configuraciones, copiar objetos conservando rutas,
verificar contenidos y acceso público, y reemplazar únicamente las URLs
verificadas. Conservar el origen hasta completar la validación en producción.
