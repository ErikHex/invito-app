import Link from 'next/link';
import { catalogoPlantillas } from '@/components/invitaciones/plantillas/catalogo';
import { getDashboardData } from "../dashboard-data";
import ConfiguracionManager from "../ConfiguracionManager";

export default async function DisenoPage({ params }) {
  const { slug } = await params;
  const data = await getDashboardData(slug);
  if (!data) return null;

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Diseño de invitación</h1><p className="mt-1 text-gray-600">Gestiona las fotos y el contenido de tu evento.</p></div>
      {data.rol === 'admin' && <div className="dash-banner mb-6"><div><h2>Modelo de plantilla: {catalogoPlantillas.find(p => p.id === data.evento.plantilla)?.nombre || data.evento.plantilla}</h2><p className="helper">Cambia el modelo conservando el contenido y los invitados del evento.</p></div><Link className="dash-primary" href={`/admin/${data.evento.id}#plantilla`}>Cambiar plantilla ↗</Link></div>}
      <ConfiguracionManager eventoId={data.evento.id} eventoInicial={data.evento} />
    </main>
  );
}
