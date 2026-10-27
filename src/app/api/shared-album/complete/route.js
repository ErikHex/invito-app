import { createClient } from '@/lib/supabase/server';
import { validatePhotoUpload } from '@/lib/media-upload';

function reply(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ error: 'Origen no permitido.' }, 403);
  let body;
  try { body = await request.json(); } catch { return reply({ error: 'Solicitud inválida.' }, 400); }
  const input = validatePhotoUpload({ ...body, eventoId: '00000000-0000-0000-0000-000000000000' });
  const codigo = typeof body?.codigo === 'string' && /^[A-Za-z0-9_-]{16,64}$/.test(body.codigo) ? body.codigo : null;
  const key = typeof body?.key === 'string' ? body.key : '';
  if (!input || !codigo || key.length > 160) return reply({ error: 'Solicitud inválida.' }, 400);
  const baseUrl = process.env.R2_PUBLIC_URL;
  if (!baseUrl) return reply({ error: 'Servicio de fotos no disponible.' }, 503);
  try {
    const client = await createClient();
    const { error } = await client.rpc('registrar_foto_album_compartido', {
      codigo_input: codigo, storage_key_input: key,
      url_input: `${baseUrl.replace(/\/$/, '')}/${key}`,
      content_type_input: input.contentType, tamano_input: input.size,
    });
    if (error) return reply({ error: 'No pudimos guardar la fotografía.' }, 403);
    return reply({ ok: true });
  } catch { return reply({ error: 'No pudimos guardar la fotografía.' }, 503); }
}
