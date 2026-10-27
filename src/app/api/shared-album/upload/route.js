import { createClient } from '@/lib/supabase/server';
import { validatePhotoUpload } from '@/lib/media-upload';
import { createSharedAlbumPhotoUpload } from '@/lib/r2';

export const runtime = 'nodejs';

function reply(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Origen no permitido.' }, 403);
  let body;
  try { body = await request.json(); } catch { return reply({ error: 'Solicitud inválida.' }, 400); }
  const input = validatePhotoUpload({ ...body, eventoId: body?.eventoId || '00000000-0000-0000-0000-000000000000' });
  const codigo = typeof body?.codigo === 'string' && /^[A-Za-z0-9_-]{16,64}$/.test(body.codigo) ? body.codigo : null;
  if (!input || !codigo) return reply({ error: 'Usa JPG, PNG o WebP de hasta 8 MB.' }, 400);
  try {
    const client = await createClient();
    const { data: album, error } = await client.rpc('album_compartido_publico', { codigo_input: codigo });
    if (error || !album?.acepta_fotos || !album?.album_id) return reply({ error: 'Este álbum no acepta fotografías en este momento.' }, 403);
    const upload = await createSharedAlbumPhotoUpload({ ...input, albumId: album.album_id });
    return reply(upload);
  } catch {
    return reply({ error: 'No pudimos preparar la subida. Intenta de nuevo.' }, 503);
  }
}
