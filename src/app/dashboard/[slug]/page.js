import Link from "next/link";
import { getDashboardData } from "./dashboard-data";

export default async function DashboardPage({ params }) {
  const { slug } = await params;
  const data = await getDashboardData(slug);
  if (!data) return null;
  const { evento, invitados, mesas } = data;
  const confirmados = invitados.filter((invitado) => invitado.estado === "confirmado").length;
  const asignados = invitados.filter((invitado) => invitado.mesa_id).length;

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Resumen del evento</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{evento.nombre_evento}</h1>
        <p className="mt-1 text-gray-600">Aquí puedes revisar el estado general de tu invitación.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["Invitados", invitados.length, "/invitados"], ["Confirmados", confirmados, "/invitados"], ["Mesas", mesas.length, "/mesas"], ["Sin mesa", invitados.length - asignados, "/mesas"]].map(([label, value, href]) => (
          <Link key={label} href={`/dashboard/${slug}${href}`} className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
