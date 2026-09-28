import Link from 'next/link';
import DashboardShell from '../dashboard/layout';
import { getPanelSession } from '@/lib/panel-server';
export default async function AdminLayout({ children }) {
  await getPanelSession(true);
  return <DashboardShell><header className="dash-nav"><div className="dash-nav-inner"><Link href="/admin" className="dash-brand">invito<span>✳</span></Link><nav className="dash-links" aria-label="Administración"><Link href="/admin">Mi negocio</Link><Link href="/admin/nuevo">Crear evento</Link><Link href="/dashboard">Mis accesos</Link></nav></div></header>{children}</DashboardShell>;
}
