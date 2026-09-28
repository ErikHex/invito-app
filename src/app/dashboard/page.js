import Link from 'next/link';
import { getPanelSession } from '@/lib/panel-server';
import InvitacionesAcceso from './InvitacionesAcceso';
export default async function DashboardHomePage(){
 const session=await getPanelSession();
 return <main className="mx-auto p-4 sm:p-8"><Link href="/" className="dash-brand">invito<span>✳</span></Link><p className="dash-eyebrow mt-10">TUS PRÓXIMOS GRANDES MOMENTOS</p><h1>Tus celebraciones</h1>{session.admin&&<div className="dash-banner"><div><h2>Administración de Invito</h2><p className="helper">Crea eventos y administra clientes, entregas y cobros.</p></div><Link className="dash-primary" href="/admin">Entrar a mi negocio ↗</Link></div>}<InvitacionesAcceso pendientes={session.pendientes}/><div className="guest-list">{session.eventos.map(e=><Link className="guest-card" key={e.id} href={e.rol==='portero'?`/checkin/${e.slug}`:`/dashboard/${e.slug}`}><h2>{e.nombre_evento}</h2><p className="helper">{e.fecha||'Fecha por definir'} · {e.rol==='portero'?'Recepción del evento':e.rol==='admin'?'Administración':'Titular del evento'}</p></Link>)}</div>{!session.eventos.length&&!session.pendientes.length&&<p className="empty-state">Todavía no tienes eventos asignados. Ingresa con el correo al que te dieron acceso.</p>}</main>;
}
