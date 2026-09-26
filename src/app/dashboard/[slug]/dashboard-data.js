import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getDashboardData(slug) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: evento } = await supabase
    .from("eventos")
    .select("*")
    .eq("slug", slug)
    .eq("user_id", user.id)
    .single();

  if (!evento) return null;

  const [{ data: invitados }, { data: mesas }] = await Promise.all([
    supabase.from("invitados").select("*").eq("evento_id", evento.id).order("nombre"),
    supabase.from("mesas").select("*").eq("evento_id", evento.id).order("nombre"),
  ]);

  return { evento, invitados: invitados || [], mesas: mesas || [] };
}
