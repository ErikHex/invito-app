import DashboardNav from "./DashboardNav";
import { getDashboardData } from "./dashboard-data";

export default async function DashboardLayout({ children, params }) {
  const { slug } = await params;
  const data = await getDashboardData(slug);

  if (!data) {
    return <p className="mt-20 text-center text-gray-700">Evento no encontrado o no tienes acceso.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav slug={slug} esMuestra={data.evento.es_muestra} />
      {children}
    </div>
  );
}
