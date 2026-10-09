"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
export default function DashboardNav({ slug, esMuestra }) {
  const pathname=usePathname();
  const searchParams=useSearchParams();
  const base=`/dashboard/${slug}`;
  const plantilla=searchParams.get('plantilla');
  const vistaPrevia=`/preview/${slug}${plantilla ? `?plantilla=${encodeURIComponent(plantilla)}` : ''}`;
  const items=[['Resumen',base],['Invitados',`${base}/invitados`],['Mesas',`${base}/mesas`],['Tu invitación',`${base}/diseno`],['Equipo y accesos',`${base}/equipo`],['Registrar accesos',`/checkin/${slug}`]];
  if (esMuestra) return <header className="dash-nav"><div className="dash-nav-inner"><Link href="/admin/muestras" className="dash-brand">invito<span aria-hidden="true">✳</span></Link><nav className="dash-links" aria-label="Navegación de muestras"><Link href="/admin/muestras">← Plantillas y muestras</Link><span className="status-pill">Evento de muestra</span></nav></div></header>;
  return <header className="dash-nav"><div className="dash-nav-inner"><Link href="/dashboard" className="dash-brand" aria-label="Invito, mis eventos">invito<span aria-hidden="true">✳</span></Link><nav className="dash-links" aria-label="Navegación del evento">{items.map(([label,href])=><Link key={href} href={href} aria-current={pathname===href?'page':undefined}>{label}</Link>)}{<Link href={vistaPrevia} target="_blank" rel="noopener noreferrer">Ver invitación ↗</Link>}</nav></div></header>;
}
