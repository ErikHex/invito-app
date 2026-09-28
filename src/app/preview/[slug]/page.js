import { getDashboardData } from '@/app/dashboard/[slug]/dashboard-data';
import Invitacion from '@/components/invitaciones/Invitacion';
export default async function PreviewPage({params}){const {slug}=await params;const data=await getDashboardData(slug);if(!data)return null;return <Invitacion preview datos={{evento_nombre:data.evento.nombre_evento,configuracion:data.evento.configuracion,plantilla:data.evento.plantilla,modulos_activos:data.evento.modulos_activos,nombre:'Invitado de muestra',acompanantes:1,estado:'pendiente'}}/>;}
