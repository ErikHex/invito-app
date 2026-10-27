import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AlbumUploader from './AlbumUploader';

export const dynamic = 'force-dynamic';

export default async function AlbumPage({ params }) {
  const { codigo } = await params;
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(codigo)) notFound();
  const client = await createClient();
  const { data: album, error } = await client.rpc('album_compartido_publico', { codigo_input: codigo });
  if (error || !album) notFound();
  const { data: fotos } = album.mostrar_publicamente
    ? await client.rpc('fotos_album_compartido_publicas', { codigo_input: codigo })
    : { data: [] };
  return <AlbumUploader codigo={codigo} evento={album.evento} activo={album.acepta_fotos} iniciaAt={album.inicia_at} fotos={Array.isArray(fotos) ? fotos : []} />;
}
