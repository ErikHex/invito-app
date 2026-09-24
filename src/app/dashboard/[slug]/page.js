import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AsignarMesa from "./AsignarMesa";

export default async function DashboardPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: evento } = await supabase
    .from("eventos")
    .select("*")
    .eq("slug", slug)
    .eq("user_id", user.id)
    .single();

  if (!evento) {
    return (
      <p className="text-center mt-20">
        Evento no encontrado o no tienes acceso.
      </p>
    );
  }

  const { data: invitados } = await supabase
    .from("invitados")
    .select("*")
    .eq("evento_id", evento.id);

  const { data: mesas } = await supabase
    .from("mesas")
    .select("*")
    .eq("evento_id", evento.id);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard: {evento.nombre_evento}
      </h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-green-500">
            {invitados.filter((i) => i.estado === "confirmado").length}
          </p>
          <p className="text-gray-500">Confirmados</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-yellow-500">
            {invitados.filter((i) => i.estado === "pendiente").length}
          </p>
          <p className="text-gray-500">Pendientes</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-red-500">
            {invitados.filter((i) => i.estado === "rechazado").length}
          </p>
          <p className="text-gray-500">Rechazados</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-blue-500">
            {invitados.filter((i) => i.checked_in).length}
          </p>
          <p className="text-gray-500">Ya llegaron</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Invitados</h2>
      <div className="bg-white rounded-lg shadow divide-y">
        {invitados.map((inv) => (
          <div
            key={inv.id}
            className="p-3 flex justify-between items-center"
          >
            <span>{inv.nombre}</span>
            <span className="text-sm text-gray-500">{inv.estado}</span>
            <AsignarMesa
              invitado={inv}
              mesas={mesas}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
