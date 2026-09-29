import Link from 'next/link';
import { catalogoPlantillas } from '@/components/invitaciones/plantillas/catalogo';
import { notFound } from 'next/navigation';
import { getPanelSession } from '@/lib/panel-server';
import EventoNegocio from './EventoNegocio';
import EquipoManager from '@/app/dashboard/[slug]/equipo/EquipoManager';
export default async function EventoAdmin({params,searchParams}){
 const {id}=await params;const {client}=await getPanelSession(true);
 const {data:evento}=await client.from('eventos').select('*').eq('id',id).maybeSingle();if(!evento)notFound();
 const [{data:negocio},{data:accesos},{data:actividad}]=await Promise.all([client.from('evento_negocio').select('*').eq('evento_id',id).single(),client.from('evento_accesos').select('*').eq('evento_id',id),client.from('evento_actividad').select('*').eq('evento_id',id).order('creado_at',{ascending:false}).limit(30)]);
 const query=await searchParams;
 const modelo=evento.es_muestra && catalogoPlantillas.find(p=>p.id===query.plantilla);
 const contexto=modelo ? `?plantilla=${modelo.id}` : '';
 return <main className="mx-auto p-4 sm:p-8"><p className="dash-eyebrow">ADMINISTRACIÓN DEL EVENTO</p><h1>{evento.nombre_evento}</h1>{evento.es_muestra&&<p className="helper">Evento de muestra {modelo ? `· ${modelo.nombre}` : ''} · Sus cambios se reflejan en las plantillas asignadas. <Link href="/admin/muestras">Gestionar muestras públicas ↗</Link></p>}<div className="row-actions"><Link href={`/dashboard/${evento.slug}/diseno${contexto}`}>Editar contenido y fotografías ↗</Link><Link href={`/preview/${evento.slug}${contexto}`} target="_blank">Previsualizar invitación ↗</Link>{!evento.es_muestra&&<Link href={`/checkin/${evento.slug}`}>Recepción ↗</Link>}</div><EventoNegocio evento={evento} negocio={negocio}/>{!evento.es_muestra&&<EquipoManager eventoId={id} accesosIniciales={accesos||[]} admin/>}<details className="guest-card mt-6"><summary>Actividad reciente</summary><ul className="delivery-history">{(actividad||[]).map(a=><li key={a.id}>{a.accion} · {new Date(a.creado_at).toLocaleString('es-MX',{timeZone:'America/Mexico_City'})}</li>)}</ul></details></main>;
}
