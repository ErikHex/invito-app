import { createClient } from "@/lib/supabase/server";

export default async function EventoPage({ params }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: evento, error } = await supabase
    .rpc("evento_publico", { slug_input: slug })
    .single();

  if (error || !evento) {
    return <p className="text-center mt-20">Evento no encontrado.</p>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          {evento.nombre_evento}
        </h1>
        <p className="text-gray-500 mt-2">Fecha: {evento.fecha}</p>

      </div>
    </main>
  );
}
