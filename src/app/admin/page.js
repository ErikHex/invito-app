import { getPanelSession } from '@/lib/panel-server';
import AdminEventos from './AdminEventos';
import MuestrasAdmin from './MuestrasAdmin';
export default async function AdminPage() {
  const { client } = await getPanelSession(true);
  const [{data:eventos,error},{data:negocio,error:negocioError},{data:muestras,error:muestrasError}] = await Promise.all([
    client.from('eventos').select('id,slug,nombre_evento,fecha,plantilla,publicacion,es_muestra').order('fecha'),
    client.from('evento_negocio').select('*'),
    client.from('muestras_plantillas').select('plantilla,evento_id,disponible'),
  ]);
  if(error || negocioError || muestrasError) throw new Error('No pudimos cargar los eventos. Intenta de nuevo.');
  return <main className="mx-auto p-4 sm:p-8"><p className="dash-eyebrow">EL DETRÁS DE CADA CELEBRACIÓN</p><h1>Tu negocio, en orden.</h1><p className="helper">Prepara eventos, organiza entregas y administra los accesos de tus clientes.</p><MuestrasAdmin eventos={eventos.filter(e=>e.es_muestra)} asignaciones={muestras}/><AdminEventos eventos={eventos} negocio={negocio}/></main>;
}
