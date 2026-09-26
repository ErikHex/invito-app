import { getDashboardData } from "../dashboard-data";
import MesasManager from "../MesasManager";

export default async function MesasPage({ params }) {
  const { slug } = await params;
  const data = await getDashboardData(slug);
  if (!data) return null;

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Mesas</h1><p className="mt-1 text-gray-600">Organiza capacidades y asigna invitados visualmente.</p></div>
      <MesasManager eventoId={data.evento.id} mesasIniciales={data.mesas} invitadosIniciales={data.invitados} />
    </main>
  );
}
