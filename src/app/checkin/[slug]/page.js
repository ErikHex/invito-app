import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CheckinScanner from "./CheckinScanner";

export default async function CheckinPage({ params }) {
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

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Check-in: {evento.nombre_evento}
      </h1>
      <CheckinScanner eventoId={evento.id} />
    </main>
  );
}
