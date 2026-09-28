import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { accountDestination } from '@/lib/account';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (user) {
    const { data: session } = await client.rpc('panel_operacion', { operacion: 'sesion', datos: {} });
    redirect(accountDestination(session).href);
  }
  return <LoginForm />;
}
