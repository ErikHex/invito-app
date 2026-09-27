import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardHomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: eventos } = await supabase
    .from("eventos")
    .select("*")
    .eq("user_id", user.id);

  return (
    <main className="min-h-screen bg-gray-50 p-8 mx-auto">
      <Link href="/" className="dash-brand" aria-label="Invito, inicio">invito<span>✳</span></Link>
      <p className="dash-eyebrow mt-10">TUS PRÓXIMOS GRANDES MOMENTOS</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tus celebraciones</h1>

      {(!eventos || eventos.length === 0) && (
        <p className="text-gray-500">Todavía no tienes eventos creados.</p>
      )}

      <div className="grid gap-4">
        {eventos?.map((evento) => (
          <Link
            key={evento.id}
            href={`/dashboard/${evento.slug}`}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
          >
            <p className="font-semibold text-gray-800">
              {evento.nombre_evento}
            </p>
            <p className="text-sm text-gray-500">{evento.fecha}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
