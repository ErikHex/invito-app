'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { panel } from '@/lib/panel';
import { catalogoPlantillas } from '@/components/invitaciones/plantillas/catalogo';
export default function CrearEvento(){
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);const router=useRouter();
 async function crear(event){event.preventDefault();setBusy(true);setError('');const datos=Object.fromEntries(new FormData(event.currentTarget));try{const nuevo=await panel(createClient(),'crear_evento',datos);router.push(`/admin/${nuevo.id}`);}catch(e){setError(e.message);}finally{setBusy(false);}}
 return <form onSubmit={crear} className="guest-card"><fieldset disabled={busy} className="grid gap-5 md:grid-cols-2"><label>Nombre del evento<input name="nombre" required maxLength={160}/></label><label>Enlace del evento<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="sofia-y-mateo"/><span className="helper">Letras minúsculas, números y guiones. Único por evento.</span></label><label>Fecha<input name="fecha" type="date" required/></label><label>Zona horaria<select name="zona" defaultValue="America/Mexico_City"><option>America/Mexico_City</option><option>America/Cancun</option><option>America/Tijuana</option><option>America/Hermosillo</option><option>America/Chihuahua</option></select></label><label>Plantilla<select name="plantilla">{catalogoPlantillas.map(p=><option key={p.id} value={p.id}>{p.nombre} · v{p.version}</option>)}</select></label><p className="helper">Se creará como borrador. Después podrás asignar titulares, preparar el contenido y publicarlo.</p><button className="dash-primary">{busy?'Creando…':'Crear borrador'}</button></fieldset>{error&&<p role="alert" className="text-red-700 mt-4">{error}</p>}</form>;
}
