import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { panel } from './panel';
export async function getPanelSession(adminOnly = false) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/login');
  const session = await panel(client, 'sesion');
  if (adminOnly && !session.admin) redirect('/dashboard');
  return { client, user, ...session };
}
