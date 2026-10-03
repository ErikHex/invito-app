import { createClient } from '@/lib/supabase/server';
import { validatePhotoUpload, canUploadPhoto } from '@/lib/media-upload';
import { createPhotoUpload } from '@/lib/r2';

export const runtime = 'nodejs';

function reply(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request) {
  // Browser uploads must originate from this app; do not trust a caller-supplied event role.
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return reply({ error: 'Origen no permitido.' }, 403);
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return reply({ error: 'Formato de solicitud inválido.' }, 415);
  }
  let input;
  try { input = validatePhotoUpload(await request.json()); }
  catch { return reply({ error: 'Solicitud inválida.' }, 400); }
  if (!input) return reply({ error: 'Usa JPG, PNG o WebP de hasta 8 MB y un evento válido.' }, 400);

  try {
    const client = await createClient();
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return reply({ error: 'Inicia sesión para subir fotografías.' }, 401);
    const { data: session, error } = await client.rpc('panel_operacion', { operacion: 'sesion', datos: {} });
    if (error || !canUploadPhoto(session, input.eventoId)) {
      return reply({ error: 'No tienes permiso para subir fotografías a este evento.' }, 403);
    }
    return reply(await createPhotoUpload(input));
  } catch {
    return reply({ error: 'No pudimos preparar la subida. Intenta de nuevo.' }, 503);
  }
}
