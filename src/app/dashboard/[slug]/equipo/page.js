import { getDashboardData } from '../dashboard-data';
import { createClient } from '@/lib/supabase/server';
import EquipoManager from './EquipoManager';
export default async function EquipoPage({params}){
 const {slug}=await params;const data=await getDashboardData(slug);if(!data)return null;
 const client=await createClient();const {data:accesos,error}=await client.from('evento_accesos').select('*').eq('evento_id',data.evento.id);if(error)throw new Error('No pudimos cargar los accesos.');
 return <main className="mx-auto p-4 sm:p-8"><h1>Equipo y accesos</h1><EquipoManager eventoId={data.evento.id} accesosIniciales={accesos||[]} admin={data.rol==='admin'}/></main>;
}
