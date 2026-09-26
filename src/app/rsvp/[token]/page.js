import { createClient } from "@/lib/supabase/server";
import Invitacion from "./Invitacion";

export default async function RsvpPage({ params }) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("get_invitacion", { token_input: token })
    .single();

  if (error || !data) {
    return <p className="text-center mt-20">Invitación no encontrada.</p>;
  }

  return <Invitacion datos={data} />;
}
