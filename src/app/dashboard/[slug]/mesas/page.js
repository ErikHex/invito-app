import { getDashboardData } from "../dashboard-data";
import MesasManager from "../MesasManager";

export default async function MesasPage({ params }) {
  const { slug } = await params;
  const data = await getDashboardData(slug);
  if (!data) return null;

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <MesasManager eventoId={data.evento.id} mesasIniciales={data.mesas} invitadosIniciales={data.invitados} configuracionInicial={data.evento.configuracion} />
    </main>
  );
}
