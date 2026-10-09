import Link from 'next/link';
import { catalogoPlantillas } from '@/components/invitaciones/plantillas/catalogo';
import { getDashboardData } from "../dashboard-data";
import ConfiguracionManager from "../ConfiguracionManager";

// The editor must always start from the same persisted configuration used by the
// public invitation. It is an authenticated, per-event view, so it must not be
// served from a route cache after an editor save.
export const dynamic = "force-dynamic";

export default async function DisenoPage({ params, searchParams }) {
  const { slug } = await params;
  const data = await getDashboardData(slug);
  if (!data) return null;

  const query = await searchParams;
  const muestra = data.evento.es_muestra;
  const modelo = catalogoPlantillas.find(p => p.id === (query.plantilla || data.evento.plantilla)) || catalogoPlantillas[0];
  const contexto = `?plantilla=${modelo.id}`;

  return (
    <main className="mx-auto max-w-7xl p-0 md:p-6 lg:p-8">
      <div className="mb-4 hidden md:block"><h1 className="text-2xl font-bold text-gray-900">Diseño de invitación</h1><p className="mt-1 text-gray-600">Gestiona las fotos y el contenido de tu evento.</p></div>
      {data.rol === 'admin' && <div className="dash-banner mb-6"><div>
        <h2>{muestra ? 'Editando muestra' : 'Modelo de plantilla'}: {modelo.nombre}</h2>
        <p className="helper">{muestra ? `Contenido de ${data.evento.nombre_evento}. Si otras plantillas usan este evento, también recibirán los cambios en textos y fotos.` : 'Cambia el modelo conservando el contenido y los invitados del evento.'}</p>
        {muestra && <div className="row-actions">{catalogoPlantillas.map(p => <Link key={p.id} href={`/dashboard/${slug}/diseno?plantilla=${p.id}`} aria-current={p.id === modelo.id ? 'page' : undefined}>{p.id === modelo.id ? `✓ ${p.nombre}` : p.nombre}</Link>)}</div>}
      </div><div className="row-actions">
        <Link href={`/preview/${slug}${contexto}`} target="_blank">Previsualizar {modelo.nombre} ↗</Link>
        <Link href={`/admin/${data.evento.id}${contexto}#plantilla`}>{muestra ? 'Secciones y estado' : 'Cambiar plantilla'} ↗</Link>
        {muestra && <Link href="/admin/muestras">Volver a plantillas y muestras ↗</Link>}
      </div></div>}
      <ConfiguracionManager eventoId={data.evento.id} eventoInicial={{ ...data.evento, plantilla: modelo.id }} slug={slug} esMuestra={muestra} />
    </main>
  );
}
