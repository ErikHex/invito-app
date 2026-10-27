import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  const { fotoId } = await params;
  if (!/^[a-f0-9-]{36}$/i.test(fotoId)) return new Response('Fotografía no encontrada.', { status: 404 });
  const client = await createClient();
  const { data: foto, error } = await client
    .from('fotos_album_compartido')
    .select('url_publica, content_type')
    .eq('id', fotoId)
    .single();
  if (error || !foto) return new Response('Fotografía no encontrada.', { status: 404 });
  try {
    const source = await fetch(foto.url_publica);
    if (!source.ok) return new Response('No pudimos descargar la fotografía.', { status: 502 });
    const extension = foto.content_type === 'image/png' ? 'png' : foto.content_type === 'image/webp' ? 'webp' : 'jpg';
    return new Response(await source.arrayBuffer(), {
      headers: {
        'Content-Type': foto.content_type,
        'Content-Disposition': `attachment; filename="foto-album-invito.${extension}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch { return new Response('No pudimos descargar la fotografía.', { status: 502 }); }
}
