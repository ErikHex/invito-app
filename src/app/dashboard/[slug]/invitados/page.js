import { getDashboardData } from "../dashboard-data";
import ListaInvitados from "../ListaInvitados";

export default async function InvitadosPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const data = await getDashboardData(slug);
  if (!data) return null;

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Invitados</h1><p className="mt-1 text-gray-600">Comparte cada invitación y lleva el control de envíos y respuestas.</p></div>
      <ListaInvitados eventoNombre={data.evento.nombre_evento} filtroInicial={query?.filtro || "todos"} eventoId={data.evento.id} invitadosIniciales={data.invitados} mesas={data.mesas} />
    </main>
  );
}
