"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function DashboardNav({ slug }) {
  const pathname=usePathname();
  const base=`/dashboard/${slug}`;
  const items=[['Resumen',base],['Invitados',`${base}/invitados`],['Mesas',`${base}/mesas`],['Tu invitación',`${base}/diseno`],['Equipo y accesos',`${base}/equipo`],['Registrar accesos',`/checkin/${slug}`]];
  return <header className="dash-nav"><div className="dash-nav-inner"><Link href="/dashboard" className="dash-brand" aria-label="Invito, mis eventos">invito<span aria-hidden="true">✳</span></Link><nav className="dash-links" aria-label="Navegación del evento">{items.map(([label,href])=><Link key={href} href={href} aria-current={pathname===href?'page':undefined}>{label}</Link>)}{<Link href={`/preview/${slug}`} target="_blank" rel="noopener noreferrer">Ver invitación ↗</Link>}</nav></div></header>;
}
