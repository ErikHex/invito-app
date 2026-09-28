import { getPanelSession } from '@/lib/panel-server';
import AdminEventos from './AdminEventos';
export default async function AdminPage() {
  const { client } = await getPanelSession(true);
  const [{data:eventos,error},{data:negocio,error:negocioError}] = await Promise.all([
    client.from('eventos').select('id,slug,nombre_evento,fecha,plantilla,publicacion').order('fecha'),
    client.from('evento_negocio').select('*'),
  ]);
  if(error || negocioError) throw new Error('No pudimos cargar los eventos. Intenta de nuevo.');
  return <main className="mx-auto p-4 sm:p-8"><p className="dash-eyebrow">EL DETRÁS DE CADA CELEBRACIÓN</p><h1>Tu negocio, en orden.</h1><p className="helper">Prepara eventos, organiza entregas y administra los accesos de tus clientes.</p><AdminEventos eventos={eventos} negocio={negocio}/></main>;
}
