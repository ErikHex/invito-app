import { getDashboardData } from "../dashboard-data";
import ListaInvitados from "../ListaInvitados";

export default async function InvitadosPage({ params }) {
  const { slug } = await params;
  const data = await getDashboardData(slug);
  if (!data) return null;

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Invitados</h1><p className="mt-1 text-gray-600">Agrega invitados y revisa sus confirmaciones.</p></div>
      <ListaInvitados eventoId={data.evento.id} invitadosIniciales={data.invitados} mesas={data.mesas} />
    </main>
  );
}
