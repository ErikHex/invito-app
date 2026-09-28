"use client";
import { useEffect, useRef, useState } from "react";
import TelefonoInput from "./TelefonoInput";
import { splitPhone, joinPhone } from "@/lib/phone-country";
import SeleccionarContacto from "./SeleccionarContacto";
import { createClient } from "@/lib/supabase/client";
import { guestMatches, normalizePhone, validPhone } from "@/lib/invitation-utils";
import AgregarInvitado from "./AgregarInvitado";
import AsignarMesa from "./AsignarMesa";

const estados = { pendiente:'Pendiente de enviar', por_verificar:'Envío por verificar', enviada:'Marcada como enviada' };
const acciones = { abrir:'WhatsApp abierto · por verificar', enviar:'Envío registrado por el anfitrión', recordatorio:'Recordatorio registrado', restablecer:'Restablecida a pendiente' };
function fecha(value) { return value ? new Date(value).toLocaleString('es-MX') : ''; }

function Invitado({ invitado: inv, eventoId, eventoNombre, mesas, invitados, onChange, onDelete }) {
  const [editando,setEditando] = useState(false);
  const [nombre,setNombre] = useState(inv.nombre);
  const [telefonoDatos,setTelefonoDatos] = useState(()=>splitPhone(inv.telefono || ''));
  const telefono=joinPhone(telefonoDatos);
  const [acompanantes,setAcompanantes] = useState(inv.acompanantes || 0);
  const [mensaje,setMensaje] = useState(`Hola, ${inv.nombre}. Nos encantará contar contigo en ${eventoNombre}. Consulta los detalles y confirma tu asistencia aquí:`);
  const [canal,setCanal] = useState('whatsapp');
  const [error,setError] = useState('');
  const [ocupado,setOcupado] = useState(false);
  const supabase = createClient();
  const link = () => `${window.location.origin}/rsvp/${encodeURIComponent(inv.token)}`;
  async function registrar(accion, selectedCanal=canal) {
    const {data,error} = await supabase.rpc('registrar_envio',{invitado_id_input:inv.id,accion_input:accion,canal_input:selectedCanal});
    if(error) throw error;
    onChange(Array.isArray(data)?data[0]:data);
  }
  async function ejecutar(fn) { setOcupado(true);setError('');try { await fn(); } catch(e) {setError(e.message || 'No se pudo guardar. Intenta de nuevo.');} finally {setOcupado(false);} }
  async function abrir() {
    if (!validPhone(inv.telefono || '')) {setError('Agrega un teléfono con código de país. Ejemplo: 525512345678.');return;}
    // Open synchronously from the user's click; never send or mark delivery automatically.
    window.open(`https://wa.me/${normalizePhone(inv.telefono)}?text=${encodeURIComponent(`${mensaje}\n${link()}`)}`,'_blank','noopener,noreferrer');
    setCanal('whatsapp');
    await ejecutar(()=>registrar('abrir','whatsapp'));
  }
  async function guardar(event) {
    event.preventDefault();
    await ejecutar(async()=>{
      if (telefono && !validPhone(telefono)) throw new Error('Usa el teléfono completo con código de país.');
      const mesa = mesas.find(m=>m.id===inv.mesa_id);
      const usados = invitados.filter(i=>i.mesa_id===inv.mesa_id && i.id!==inv.id).reduce((n,i)=>n+1+Number(i.acompanantes||0),0);
      if(mesa && usados+1+Number(acompanantes)>Number(mesa.capacidad)) throw new Error('La mesa no tiene lugares suficientes. Cambia la asignación primero.');
      const {data,error} = await supabase.from('invitados').update({nombre:nombre.trim(),telefono:normalizePhone(telefono)||null,acompanantes:Number(acompanantes)}).eq('id',inv.id).eq('evento_id',eventoId).select().single();
      if(error) throw error;
      onChange(data);setEditando(false);
    });
  }
  return <article className="guest-card">
    <div className="guest-heading"><div><h3>{inv.nombre}</h3><p className="helper">{1+Number(inv.acompanantes||0)} lugares · {inv.telefono || 'Sin teléfono'}</p></div><span className={`status-pill ${inv.envio_estado==='enviada'?'status-success':''}`}>{estados[inv.envio_estado || 'pendiente']}</span></div>
    <p className="helper">Asistencia: {inv.estado==='confirmado'?'Confirmó':inv.estado==='rechazado'?'No asistirá':'Sin respuesta'}{inv.enviado_at && ` · Envío: ${fecha(inv.enviado_at)}`}</p>
    <AsignarMesa invitado={inv} mesas={mesas} invitados={invitados} onChange={onChange} />
    <div className="row-actions"><button type="button" onClick={()=>{setNombre(inv.nombre);setTelefonoDatos(splitPhone(inv.telefono||''));setAcompanantes(inv.acompanantes||0);setEditando(!editando);}}>Editar datos</button><button type="button" disabled={ocupado} onClick={()=>{if(window.confirm(`¿Eliminar a ${inv.nombre} y su historial? Su enlace dejará de funcionar.`)) ejecutar(async()=>{const {data,error}=await supabase.from('invitados').delete().eq('id',inv.id).eq('evento_id',eventoId).select('id').single();if(error||!data) throw error || new Error('No se pudo eliminar.');onDelete(inv.id);});}}>Eliminar</button></div>
    {editando && <form onSubmit={guardar} className="guest-edit"><label>Nombre o familia<input required value={nombre} onChange={e=>setNombre(e.target.value)} /></label><TelefonoInput value={telefonoDatos} onChange={setTelefonoDatos} disabled={ocupado} /><SeleccionarContacto disabled={ocupado} onSelect={contacto=>{setTelefonoDatos(splitPhone(contacto.telefono,telefonoDatos.codigo));setNombre(actual=>actual.trim()?actual:contacto.nombre);}} /><label>Acompañantes<input type="number" min="0" max="100" required value={acompanantes} onChange={e=>setAcompanantes(e.target.value)} /></label><button disabled={ocupado} className="dash-primary">Guardar datos</button></form>}
    <details className="delivery-details"><summary>Compartir y registrar envío</summary>
      <label>Mensaje<textarea rows={3} value={mensaje} onChange={e=>setMensaje(e.target.value)} /></label>
      <p className="helper">El enlace personal se agrega al mensaje. Abrir WhatsApp o copiar el enlace no confirma el envío.</p>
      <div className="row-actions"><button type="button" className="dash-primary" disabled={ocupado} onClick={abrir}>Abrir WhatsApp ↗</button><button type="button" disabled={ocupado} onClick={()=>ejecutar(async()=>{await navigator.clipboard.writeText(link());setCanal('enlace');setError('Enlace copiado. Registra el envío cuando lo hayas compartido.');})}>Copiar enlace</button><a href={`/rsvp/${encodeURIComponent(inv.token)}`} target="_blank" rel="noopener noreferrer">Ver invitación ↗</a></div>
      <label>Canal del envío<select value={canal} onChange={e=>setCanal(e.target.value)}><option value="whatsapp">WhatsApp</option><option value="enlace">Enlace compartido por otro medio</option></select></label>
      <div className="row-actions"><button type="button" disabled={ocupado} onClick={()=>ejecutar(()=>registrar(inv.envio_estado==='enviada'?'recordatorio':'enviar'))}>{inv.envio_estado==='enviada'?'Ya envié un recordatorio':'Ya envié la invitación'}</button>{inv.envio_estado!=='pendiente' && <button type="button" disabled={ocupado} onClick={()=>ejecutar(()=>registrar('restablecer'))}>Volver a pendiente</button>}</div>
      <details><summary>Historial ({inv.envio_historial?.length || 0})</summary><ul className="delivery-history">{[...(inv.envio_historial||[])].reverse().map((h,i)=><li key={`${h.fecha}-${i}`}>{acciones[h.accion]} · {h.canal==='enlace'?'Enlace': 'WhatsApp'}<br /><span className="helper">{fecha(h.fecha)}</span></li>)}</ul></details>
    </details>
    {error && <p role="status" className="helper">{error}</p>}
  </article>;
}
export default function ListaInvitados({ eventoId, eventoNombre, invitadosIniciales, mesas, filtroInicial='todos' }) {
  const [invitados,setInvitados] = useState(invitadosIniciales);
  const [busqueda,setBusqueda] = useState('');
  const [filtro,setFiltro] = useState(filtroInicial);
  const [error,setError] = useState('');
  const revision = useRef(0);
  const supabase = createClient();
  function cambiar(data) { revision.current++; setInvitados(prev=>prev.map(i=>i.id===data.id?data:i)); }
  useEffect(()=>{
    let disposed=false, loading=false;
    async function actualizar() {
      if(document.hidden || loading) return;
      loading=true;const version=revision.current;
      try {const {data,error}=await supabase.from('invitados').select('*').eq('evento_id',eventoId).order('nombre');if(error) throw error;if(!disposed && revision.current===version){setInvitados(data);setError('');}}
      catch {if(!disposed)setError('No pudimos actualizar la lista. Reintentaremos automáticamente.');}
      finally {loading=false;}
    }
    const id=setInterval(actualizar,15000);document.addEventListener('visibilitychange',actualizar);
    return ()=>{disposed=true;clearInterval(id);document.removeEventListener('visibilitychange',actualizar);};
  },[eventoId,supabase]);
  const enviados=invitados.filter(i=>i.envio_estado==='enviada').length;
  const visibles=invitados.filter(i=>i.nombre.toLowerCase().includes(busqueda.toLowerCase()) && guestMatches(i,filtro));
  return <>
    <div className="dash-stats">{[['Invitaciones',invitados.length],['Marcadas como enviadas',enviados],['Pendientes de envío',invitados.length-enviados],['Lugares contemplados',invitados.reduce((n,i)=>n+1+Number(i.acompanantes||0),0)]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <AgregarInvitado eventoId={eventoId} onAgregado={nuevo=>{revision.current++;setInvitados(prev=>[...prev,nuevo]);}} />
    <div className="guest-filters"><label>Buscar invitado<input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Nombre o familia" /></label><label>Mostrar<select value={filtro} onChange={e=>setFiltro(e.target.value)}><option value="todos">Todas las invitaciones</option><option value="pendientes">Pendientes de envío</option><option value="verificar">Envíos por verificar</option><option value="sin_respuesta">Enviadas sin respuesta</option><option value="sin_telefono">Sin teléfono</option></select></label></div>
    <p className="helper">La lista se actualiza cada 15 segundos. Cada invitación puede incluir varios lugares.</p>
    {error && <p role="alert">{error}</p>}
    <div className="guest-list">{visibles.map(inv=><Invitado key={inv.id} invitado={inv} eventoId={eventoId} eventoNombre={eventoNombre} mesas={mesas} invitados={invitados} onChange={cambiar} onDelete={id=>{revision.current++;setInvitados(prev=>prev.filter(i=>i.id!==id));}} />)}</div>
    {!visibles.length && <p className="empty-state">{invitados.length?'No hay invitaciones con estos filtros.':'Agrega tu primera invitación para comenzar.'}</p>}
  </>;
}
