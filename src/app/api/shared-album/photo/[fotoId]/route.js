import { deleteSharedAlbumPhoto } from '@/lib/r2';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return Response.json({ error: 'Origen no permitido.' }, { status: 403 });
  const { fotoId } = await params;
  if (!/^[a-f0-9-]{36}$/i.test(fotoId)) return Response.json({ error: 'Fotografía no encontrada.' }, { status: 404 });
  const client = await createClient();
  const { data: foto, error: lookupError } = await client.from('fotos_album_compartido').select('id, storage_key').eq('id', fotoId).single();
  if (lookupError || !foto) return Response.json({ error: 'No tienes permiso para eliminar esta fotografía.' }, { status: 403 });
  const { error: deleteError } = await client.from('fotos_album_compartido').delete().eq('id', fotoId);
  if (deleteError) return Response.json({ error: 'No pudimos eliminar la fotografía.' }, { status: 403 });
  try { await deleteSharedAlbumPhoto(foto.storage_key); } catch { /* The database row is removed, so it is no longer visible or downloadable. */ }
  return Response.json({ ok: true });
}
