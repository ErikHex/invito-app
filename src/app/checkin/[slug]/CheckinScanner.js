'use client';
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { createClient } from '@/lib/supabase/client';
import { panel } from '@/lib/panel';
import styles from './checkin.module.css';
export default function CheckinScanner({eventoId}){
 const [seleccion,setSeleccion]=useState(null);const [cantidad,setCantidad]=useState(1);
 const [texto,setTexto]=useState('');const [resultados,setResultados]=useState([]);
 const [message,setMessage]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const [cameraError,setCameraError]=useState('');const [activa,setActiva]=useState(false);
 const container=useRef(null), scannerRef=useRef(null), solicitud=useRef(null), paused=useRef(false), queryVersion=useRef(0), busyRef=useRef(false);
 const client=createClient();
 useEffect(()=>{
  let disposed=false,processing=false;
  const el=document.createElement('div');el.id=`lector-${crypto.randomUUID()}`;container.current.appendChild(el);
  const scanner=new Html5Qrcode(el.id);scannerRef.current=scanner;
  const starting=scanner.start({facingMode:'environment'},{fps:10,qrbox:(w,h)=>({width:Math.min(250,w*.8,h*.8),height:Math.min(250,w*.8,h*.8)})},async token=>{
   if(disposed||processing||busyRef.current)return;processing=true;scanner.pause();paused.current=true;
   const version=++queryVersion.current;
   try{const rows=await panel(client,'buscar',{evento_id:eventoId,token});if(disposed||version!==queryVersion.current)return;if(!rows.length)throw new Error('Este QR no corresponde a un invitado del evento.');setSeleccion(rows[0]);setCantidad(Math.max(1,rows[0].lugares-rows[0].entradas));solicitud.current=null;setError('');setMessage('');}
   catch(e){if(!disposed&&version===queryVersion.current)setError(e.message);}
   finally{processing=false;}
  }).then(()=>{if(!disposed)setActiva(true);}).catch(()=>{if(!disposed)setCameraError('No pudimos abrir la cámara. Revisa los permisos; también puedes buscar por nombre.');});
  return()=>{disposed=true;void starting.then(async()=>{try{if([2,3].includes(scanner.getState()))await scanner.stop();scanner.clear();}finally{el.remove();}}).catch(()=>{});};
 },[client,eventoId]);
 function elegir(row){queryVersion.current++;if(scannerRef.current?.getState()===2){scannerRef.current.pause();paused.current=true;}setSeleccion(row);setCantidad(Math.max(1,row.lugares-row.entradas));solicitud.current=null;setError('');setMessage('');}
 async function buscar(e){e.preventDefault();const version=++queryVersion.current;busyRef.current=true;setBusy(true);setError('');try{const rows=await panel(client,'buscar',{evento_id:eventoId,texto});if(version===queryVersion.current){setResultados(rows);if(!rows.length)setMessage('No encontramos invitados con ese nombre.');}}catch(e){setError(e.message);}finally{busyRef.current=false;setBusy(false);}}
 async function registrar(){busyRef.current=true;setBusy(true);setError('');solicitud.current ||= crypto.randomUUID();try{await panel(client,'entrada',{evento_id:eventoId,invitado_id:seleccion.id,cantidad:Number(cantidad),solicitud:solicitud.current});setMessage(`Entrada registrada: ${cantidad} persona${Number(cantidad)===1?'':'s'}.`);setSeleccion(null);setResultados([]);solicitud.current=null;}catch(e){setError(e.message);}finally{busyRef.current=false;setBusy(false);}}
 function continuar(){queryVersion.current++;setSeleccion(null);setMessage('');setError('');solicitud.current=null;if(paused.current&&scannerRef.current?.getState()===3){scannerRef.current.resume();paused.current=false;}}
 return <section className={styles.scannerCard} aria-label="Recepción de invitados"><div className={styles.scannerHeading}><h2>Registro de acceso</h2><span className={styles.cameraStatus}>{activa?'Cámara disponible':'Búsqueda por nombre disponible'}</span></div><div ref={container} className={styles.camera}/>{cameraError&&<p className={styles.cameraHint}>{cameraError}</p>}
 <form onSubmit={buscar} className={styles.searchForm}><label>Buscar por nombre<input value={texto} onChange={e=>setTexto(e.target.value)} minLength={2} required placeholder="Nombre o familia"/></label><button className={styles.primary} disabled={busy}>Buscar invitado</button></form>
 {resultados.length>0&&<ul className={styles.searchResults}>{resultados.map(row=><li key={row.id}><button type="button" disabled={busy} onClick={()=>elegir(row)}>{row.nombre}<span>{row.entradas} de {row.lugares} entradas · {row.mesa||'Sin mesa'}</span></button></li>)}</ul>}
 {seleccion&&<div className={`${styles.result} ${styles.warning}`}><h3>{seleccion.nombre}</h3><p>Mesa: {seleccion.mesa||'Sin mesa asignada'}</p><p>{seleccion.entradas} de {seleccion.lugares} lugares registrados.</p>{seleccion.estado!=='confirmado'?<p>Esta invitación todavía no está confirmada. Consulta con los anfitriones.</p>:seleccion.entradas>=seleccion.lugares?<p>Todos los lugares de este pase ya fueron registrados.</p>:<><label>Personas que entran ahora<input className={styles.quantity} type="number" min="1" max={seleccion.lugares-seleccion.entradas} value={cantidad} disabled={busy} onChange={e=>{setCantidad(e.target.value);solicitud.current=null;}}/></label><button className={styles.primary} disabled={busy||!Number.isInteger(Number(cantidad))||Number(cantidad)<1||Number(cantidad)>seleccion.lugares-seleccion.entradas} onClick={registrar}>{busy?'Registrando…':'Confirmar entrada'}</button></>}</div>}
 {message&&<p className={`${styles.result} ${styles.success}`} role="status">{message}</p>}{error&&<p className={`${styles.result} ${styles.error}`} role="alert">{error}</p>}
 {(seleccion||message||error)&&<button type="button" className={styles.primary} disabled={busy} onClick={continuar}>Continuar con otro invitado ↗</button>}
 <p className={styles.note}>Se registra quién realizó cada entrada. Requiere conexión a internet.</p></section>;
}
