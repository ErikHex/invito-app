import { getPanelSession } from '@/lib/panel-server';
import { redirect } from 'next/navigation';
export async function getDashboardData(slug) {
  const {client,eventos}=await getPanelSession();
  const permitido=eventos.find(e=>e.slug===slug);
  if(!permitido)return null;
  if(permitido.rol==='portero')redirect(`/checkin/${slug}`);
  const {data:evento,error}=await client.from('eventos').select('*').eq('id',permitido.id).single();
  if(error||!evento)return null;
  const [{data:invitados,error:guestError},{data:mesas,error:tableError}]=await Promise.all([
    client.from('invitados').select('*').eq('evento_id',evento.id).order('nombre'),client.from('mesas').select('*').eq('evento_id',evento.id).order('nombre')
  ]);
  if(guestError||tableError)throw new Error('No pudimos cargar los datos del evento.');
  return {evento,invitados:invitados||[],mesas:mesas||[],rol:permitido.rol};
}
