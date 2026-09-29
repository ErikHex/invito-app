import { getDashboardData } from '@/app/dashboard/[slug]/dashboard-data';
import Invitacion from '@/components/invitaciones/Invitacion';
import { catalogoPlantillas } from '@/components/invitaciones/plantillas/catalogo';

export default async function PreviewPage({ params, searchParams }) {
  const { slug } = await params;
  const data = await getDashboardData(slug);
  if (!data) return null;
  const query = await searchParams;
  const modelo = data.evento.es_muestra && catalogoPlantillas.find(p => p.id === query.plantilla);
  return <Invitacion preview datos={{
    evento_nombre: data.evento.nombre_evento,
    configuracion: data.evento.configuracion,
    plantilla: modelo?.id || data.evento.plantilla,
    modulos_activos: data.evento.modulos_activos,
    nombre: 'Invitado de muestra', acompanantes: 1, estado: 'pendiente',
  }} />;
}
