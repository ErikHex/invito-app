import { createClient } from "@/lib/supabase/client";
import RsvpForm from "./RsvpForm";
import QrCode from "./QrCode";

async function getInvitado(token) {
  const supabase = createClient();
  const { data, error } = await supabase
    .rpc("get_invitado_by_token", { token_input: token })
    .single();
  return { data, error };
}

export default async function RsvpPage({ params }) {
  const { token } = await params;
  const { data: invitado, error } = await getInvitado(token);

  if (error || !invitado) {
    return <p className="text-center mt-20">Invitación no encontrada.</p>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Hola, {invitado.nombre}
        </h1>

        {invitado.mesa_nombre && (
          <p className="text-purple-600 font-semibold mt-2">
            Tu mesa: {invitado.mesa_nombre}
          </p>
        )}

        <RsvpForm invitado={invitado} />

        {invitado.estado === "confirmado" && <QrCode token={invitado.token} />}
      </div>
    </main>
  );
}
