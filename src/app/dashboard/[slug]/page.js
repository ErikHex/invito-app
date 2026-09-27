import Link from "next/link";
import { getDashboardData } from "./dashboard-data";
export default async function DashboardPage({params}) {
  const {slug}=await params;
  const data=await getDashboardData(slug);
  if(!data)return null;
  const {evento,invitados,mesas}=data;
  const enviados=invitados.filter(i=>i.envio_estado==='enviada').length;
  const pendientes=invitados.length-enviados;
  const lugares=invitados.reduce((n,i)=>n+1+Number(i.acompanantes||0),0);
  const confirmados=invitados.filter(i=>i.estado==='confirmado').reduce((n,i)=>n+1+Number(i.acompanantes||0),0);
  return <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
    <p className="dash-eyebrow">TU CELEBRACIÓN, EN UN MISMO LUGAR</p><h1>{evento.nombre_evento}</h1><p className="helper">De la primera invitación al último detalle. Aquí puedes mantener todo al día.</p>
    <div className="dash-banner"><div><h2>{pendientes?`${pendientes} invitaciones pendientes de envío`:'Todo listo para seguir celebrando'}</h2><p className="helper">{enviados} de {invitados.length} marcadas como enviadas. Revisa también los envíos por verificar.</p></div><Link href={`/dashboard/${slug}/invitados?filtro=pendientes`} className="dash-primary">Continuar con pendientes ↗</Link></div>
    <div className="dash-stats">{[['Invitaciones',invitados.length,'invitados'],['Lugares contemplados',lugares,'invitados'],['Lugares confirmados',confirmados,'invitados'],['Mesas',mesas.length,'mesas']].map(([label,value,path])=><Link key={label} href={`/dashboard/${slug}/${path}`}><span>{label}</span><strong>{value}</strong></Link>)}</div>
    <div className="grid gap-4 md:grid-cols-2"><Link href={`/dashboard/${slug}/diseno`} className="rounded-xl border border-gray-200 bg-white p-6"><h2>Tu invitación, a tu manera.</h2><p className="helper">Actualiza fotos, vestimenta, regalos y los datos de tu celebración.</p><span className="text-sm">Editar mi invitación ↗</span></Link><Link href={`/dashboard/${slug}/mesas`} className="rounded-xl border border-gray-200 bg-white p-6"><h2>Un lugar para cada invitado.</h2><p className="helper">{invitados.filter(i=>!i.mesa_id && i.estado!=='rechazado').length} invitaciones sin mesa asignada.</p><span className="text-sm">Organizar mesas ↗</span></Link></div>
  </main>;
}
