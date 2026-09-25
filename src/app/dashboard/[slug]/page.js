import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ListaInvitados from "./ListaInvitados";
import GaleriaManager from "./GaleriaManager";

export default async function DashboardPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
      <GaleriaManager
        eventoId={evento.id}
        fotosIniciales={evento.configuracion?.galeria || []}
      />
      <ListaInvitados
        eventoId={evento.id}
        invitadosIniciales={invitados || []}
        mesas={mesas || []}
      />
    </main>
  );
}
