import { createSharedAlbumPhotoDownload } from '@/lib/r2';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Origen no permitido.' }, { status: 403 });
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: 'Solicitud inválida.' }, { status: 400 }); }
  const ids = Array.isArray(body?.ids) && body.ids.length > 0 && body.ids.length <= 100 && body.ids.every(id => typeof id === 'string' && /^[a-f0-9-]{36}$/i.test(id)) ? body.ids : null;
  if (!ids) return Response.json({ error: 'Selecciona entre 1 y 100 fotografías.' }, { status: 400 });
  const client = await createClient();
  const { data: fotos, error } = await client.from('fotos_album_compartido').select('id, storage_key').in('id', ids).eq('estado', 'aprobada');
  if (error || !fotos || fotos.length !== ids.length) return Response.json({ error: 'No tienes permiso para descargar estas fotografías.' }, { status: 403 });
  try {
    const urls = await Promise.all(fotos.map(async foto => ({ id: foto.id, url: await createSharedAlbumPhotoDownload(foto.storage_key) })));
    return Response.json({ urls }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ error: 'No pudimos preparar las descargas.' }, { status: 503 }); }
}
