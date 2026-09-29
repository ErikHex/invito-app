import { getPanelSession } from '@/lib/panel-server';
import MuestrasAdmin from '../MuestrasAdmin';

export default async function MuestrasPage() {
  const { client } = await getPanelSession(true);
  const [{ data: eventos, error }, { data: asignaciones, error: muestrasError }] = await Promise.all([
    client.from('eventos').select('id,slug,nombre_evento,fecha,plantilla,publicacion,es_muestra').order('fecha'),
    client.from('muestras_plantillas').select('plantilla,evento_id,disponible'),
  ]);
  if (error || muestrasError) throw new Error('No pudimos cargar las muestras. Intenta de nuevo.');
  return <main className="mx-auto max-w-7xl p-4 sm:p-8">
    <p className="dash-eyebrow">CATÁLOGO PÚBLICO</p>
    <h1>Plantillas y muestras</h1>
    <p className="helper">Administra los ejemplos de la página principal. Los eventos de clientes se gestionan en Clientes.</p>
    <MuestrasAdmin eventos={eventos.filter(evento => evento.es_muestra)} asignaciones={asignaciones} />
  </main>;
}
