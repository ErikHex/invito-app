export function accountName(user) {
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name;
  return (typeof name === 'string' && name.trim()) || user?.email || 'qué gusto verte';
}

export function accountDestination(session) {
  if (session?.admin) return { href: '/admin', label: 'Ir a mi panel' };
  const eventos = session?.eventos || [];
  if (eventos.length === 1 && !session?.pendientes?.length) {
    const evento = eventos[0];
    return {
      href: `/${evento.rol === 'portero' ? 'checkin' : 'dashboard'}/${evento.slug}`,
      label: evento.rol === 'portero' ? 'Ir a recepción' : 'Ir a tu evento',
    };
  }
  return { href: '/dashboard', label: eventos.length > 1 ? 'Ver tus eventos' : 'Ir a mi cuenta' };
}
