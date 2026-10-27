import { getDashboardData } from '../dashboard-data';
import { createClient } from '@/lib/supabase/server';
import AlbumManager from './AlbumManager';

export const dynamic = 'force-dynamic';

export default async function AlbumPage({ params }) {
  const { slug } = await params;
  const data = await getDashboardData(slug);
  if (!data) return null;
  const client = await createClient();
  const { data: album } = await client.from('albums_compartidos').select('*').eq('evento_id', data.evento.id).maybeSingle();
  const { data: fotos } = album ? await client.from('fotos_album_compartido').select('*').eq('album_id', album.id).order('creado_at', { ascending: false }) : { data: [] };
  return <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><AlbumManager eventoId={data.evento.id} slug={slug} albumInicial={album} fotosIniciales={fotos || []} /></main>;
}
