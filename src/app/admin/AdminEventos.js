'use client';
import Link from 'next/link';
import { useState } from 'react';
const dinero = n => new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(n);
export default function AdminEventos({eventos,negocio}) {
  const [busqueda,setBusqueda]=useState('');
  const [filtro,setFiltro]=useState('todos');
  const info=Object.fromEntries(negocio.map(n=>[n.evento_id,n]));
  const visibles=eventos.filter(e=>(e.nombre_evento||'').toLowerCase().includes(busqueda.toLowerCase()) && (filtro==='todos'||e.publicacion===filtro));
  return <>
    <div className="dash-stats">{[['Eventos',eventos.length],['Por entregar',negocio.filter(n=>n.trabajo!=='entregado').length],['Abonos registrados',dinero(negocio.reduce((n,e)=>n+Number(e.abonado),0))],['Saldo por cobrar',dinero(negocio.reduce((n,e)=>n+Number(e.precio)-Number(e.abonado),0))]].map(([label,value])=><div key={label}><span>{label}</span><strong style={typeof value === "string" ? {fontSize:"clamp(20px, 2.2vw, 32px)",overflowWrap:"anywhere"} : undefined}>{value}</strong></div>)}</div>
    <div className="dash-banner"><div><h2>Un nuevo comienzo.</h2><p className="helper">Crea la invitación y asigna hasta dos titulares.</p></div><Link className="dash-primary" href="/admin/nuevo">Crear evento ↗</Link></div>
    <div className="guest-filters"><label>Buscar evento<input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Nombre de la celebración"/></label><label>Publicación<select value={filtro} onChange={e=>setFiltro(e.target.value)}><option value="todos">Todos</option><option value="borrador">Borradores</option><option value="publicado">Publicados</option><option value="archivado">Archivados</option></select></label></div>
    <div className="guest-list">{visibles.map(e=><article className="guest-card" key={e.id}><div className="guest-heading"><h2>{e.nombre_evento}</h2><span className="status-pill">{e.publicacion}</span></div><p className="helper">{e.fecha || 'Sin fecha'} · {e.plantilla} · {(info[e.id]?.trabajo || 'por_preparar').replaceAll('_',' ')}</p><p className="helper">Precio: {dinero(info[e.id]?.precio||0)} · Saldo: {dinero(Number(info[e.id]?.precio||0)-Number(info[e.id]?.abonado||0))}</p><div className="row-actions"><Link href={`/admin/${e.id}`}>Administrar negocio y accesos ↗</Link><Link href={`/dashboard/${e.slug}/diseno`}>Configurar invitación ↗</Link></div></article>)}</div>
    {!visibles.length && <p className="empty-state">No hay eventos con estos filtros.</p>}
  </>;
}
