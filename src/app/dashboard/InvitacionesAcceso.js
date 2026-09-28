'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { panel } from '@/lib/panel';
export default function InvitacionesAcceso({pendientes}){
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const router=useRouter();
 async function aceptar(evento_id){setBusy(true);setError('');try{await panel(createClient(),'aceptar',{evento_id});router.refresh();}catch(e){setError(e.message);}finally{setBusy(false);}}
 return <section>{pendientes.map(p=><div className="dash-banner" key={p.evento_id}><div><h2>{p.nombre}</h2><p className="helper">Te asignaron acceso como {p.rol}. Acepta para comenzar.</p></div><button className="dash-primary" disabled={busy} onClick={()=>aceptar(p.evento_id)}>Aceptar acceso</button></div>)}{error&&<p role="alert">{error}</p>}</section>;
}
