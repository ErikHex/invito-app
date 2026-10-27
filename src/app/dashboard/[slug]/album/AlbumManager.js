"use client";
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useRef, useState, useSyncExternalStore } from 'react';
import QRCode from 'qrcode';
import { createClient } from '@/lib/supabase/client';
import AlbumWhatsAppShare from './AlbumWhatsAppShare';
import AlbumQrGuide from './AlbumQrGuide';

const subscribe = () => () => {};
const clientOrigin = () => window.location.origin;
const serverOrigin = () => '';

export default function AlbumManager({ eventoId, slug, albumInicial, fotosIniciales }) {
  const [album, setAlbum] = useState(albumInicial);
  const [fotos, setFotos] = useState(fotosIniciales);
  const [mensaje, setMensaje] = useState('');
  const [ocupado, setOcupado] = useState(false); const [ampliada, setAmpliada] = useState(null);
  const [indice, setIndice] = useState(0);
  const inicio = useRef(null);
  const origen = useSyncExternalStore(subscribe, clientOrigin, serverOrigin);
  const enlace = album && origen ? origen + '/album/' + album.codigo : '';
  const pendientes = fotos.filter(foto => foto.estado === 'pendiente');
  const foto = pendientes[Math.min(indice, Math.max(0, pendientes.length - 1))];
  const mover = (direccion) => setIndice(actual => Math.max(0, Math.min(pendientes.length - 1, actual + direccion)));

  async function crear() {
    setOcupado(true); setMensaje('');
    const { data, error } = await createClient().rpc('crear_album_compartido', { evento_id_input: eventoId }).single();
    setOcupado(false);
    if (error || !data?.id) return setMensaje(error?.message || 'No pudimos crear el álbum.');
    setAlbum(data); setMensaje('Álbum listo para compartir.');
  }
  async function actualizar(cambios) {
    setOcupado(true); setMensaje('');
    const { data, error } = await createClient().from('albums_compartidos').update(cambios).eq('id', album.id).select().single();
    setOcupado(false);
    if (error) return setMensaje(error.message || 'No pudimos guardar el cambio.');
    setAlbum(data);
  }
  async function aprobar() {
    setOcupado(true); setMensaje('');
    const { error } = await createClient().from('fotos_album_compartido').update({ estado: 'aprobada' }).eq('id', foto.id);
    setOcupado(false);
    if (error) return setMensaje(error.message || 'No pudimos aprobar la fotografía.');
    setFotos(actual => actual.map(item => item.id === foto.id ? { ...item, estado: 'aprobada' } : item));
  }
  async function rechazar() {
    if (!window.confirm('¿Rechazar y eliminar esta fotografía? Esta acción no se puede deshacer.')) return;
    setOcupado(true); setMensaje('');
    try {
      const respuesta = await fetch('/api/shared-album/photo/' + foto.id, { method: 'DELETE' });
      const datos = await respuesta.json();
      if (!respuesta.ok) throw new Error(datos.error || 'No pudimos eliminar la fotografía.');
      setFotos(actual => actual.filter(item => item.id !== foto.id));
    } catch (error) { setMensaje(error.message || 'No pudimos eliminar la fotografía.'); }
    finally { setOcupado(false); }
  }
  async function png() {
    if (!enlace) return;
    const data = await QRCode.toDataURL(enlace, { width: 1400, margin: 2, errorCorrectionLevel: 'M' });
    const a = document.createElement('a'); a.href = data; a.download = 'qr-album-compartido.png'; a.click();
  }
  function finDeslizamiento(event) {
    if (inicio.current === null) return;
    const distancia = event.changedTouches[0].clientX - inicio.current;
    inicio.current = null;
    if (Math.abs(distancia) > 45) { const direccion = distancia > 0 ? -1 : 1; mover(direccion); if (ampliada) setAmpliada(actual => { const posicion = pendientes.findIndex(item => item.id === actual.id); return pendientes[(posicion + direccion + pendientes.length) % pendientes.length]; }); }
  }
  if (!album) return <section className="rounded-2xl bg-white p-6 shadow-sm"><h1 className="text-2xl font-bold text-gray-900">Álbum compartido</h1><p className="mt-2 text-gray-600">Crea un QR para recibir fotos de tus invitados.</p><button className="dash-primary mt-5" disabled={ocupado} onClick={crear}>{ocupado ? 'Creando…' : 'Crear álbum compartido'}</button>{mensaje && <p className="helper mt-3">{mensaje}</p>}</section>;
  return <>
    <div className="space-y-8"><section className="rounded-2xl bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-5 sm:flex-row"><div><h1 className="text-2xl font-bold text-gray-900">Álbum compartido</h1><p className="mt-2 text-gray-600">Descarga este QR y compártelo como prefieras para recibir las fotos.</p><p className="mt-3 break-all text-sm text-gray-500">{enlace || 'Preparando enlace…'}</p></div><div className="flex flex-wrap gap-2"><button type="button" className="dash-primary" disabled={!enlace} onClick={png}>Descargar QR (PNG)</button><AlbumQrGuide /></div></div><div className="mt-6 flex flex-wrap gap-5 border-t pt-5"><label><input type="checkbox" checked={album.activo} disabled={ocupado} onChange={e => actualizar({ activo: e.target.checked })} /> Aceptar fotos</label><label><input type="checkbox" checked={album.mostrar_publicamente} disabled={ocupado} onChange={e => actualizar({ mostrar_publicamente: e.target.checked })} /> Mostrar aprobadas a invitados</label></div>{mensaje && <p className="helper mt-3" role="status">{mensaje}</p>}</section><section className="rounded-3xl border border-[#eadfe1] bg-[#fffaf8] p-5 shadow-sm sm:p-7"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold tracking-[.18em] text-[#987181]">POR REVISAR</p><h2 className="mt-1 font-serif text-3xl text-[#402f38]">Fotos recibidas</h2><p className="mt-2 text-sm text-stone-600">Desliza o usa las flechas para revisar una por una.</p></div><span className="rounded-full bg-[#f1e3e7] px-3 py-1 text-sm font-semibold text-[#795366]">{pendientes.length}</span></div>{foto ? <div><div className="mx-auto max-w-2xl overflow-hidden rounded-2xl bg-white shadow-md" onTouchStart={event => { inicio.current = event.touches[0].clientX; }} onTouchEnd={finDeslizamiento}><img src={foto.url_publica} onClick={() => setAmpliada(foto)} role="button" tabIndex={0} alt="Fotografía pendiente de aprobación" className="aspect-[4/3] w-full object-cover cursor-zoom-in" /><div className="grid grid-cols-3 gap-2 p-4"><a className="rounded-xl border border-stone-200 px-3 py-3 text-center text-xs font-semibold text-stone-700" href={`/api/shared-album/download/${foto.id}`}>Descargar</a><button type="button" disabled={ocupado} className="rounded-xl bg-[#765368] px-3 py-3 text-xs font-semibold text-white disabled:opacity-50" onClick={aprobar}>Aprobar</button><button type="button" disabled={ocupado} className="rounded-xl bg-rose-50 px-3 py-3 text-xs font-semibold text-rose-700 disabled:opacity-50" onClick={rechazar}>Rechazar</button></div></div><div className="mx-auto mt-4 flex max-w-2xl items-center justify-between"><button type="button" onClick={() => mover(-1)} disabled={indice <= 0} className="rounded-full border border-[#d8c4cb] px-4 py-2 text-sm disabled:opacity-30">← Anterior</button><span className="text-sm text-stone-500">{Math.min(indice + 1, pendientes.length)} de {pendientes.length}</span><button type="button" onClick={() => mover(1)} disabled={indice >= pendientes.length - 1} className="rounded-full border border-[#d8c4cb] px-4 py-2 text-sm disabled:opacity-30">Siguiente →</button></div></div> : <p className="rounded-2xl border border-dashed border-[#d8c4cb] bg-white p-8 text-center text-stone-500">No hay fotografías pendientes de aprobación.</p>}</section><section className="rounded-3xl bg-[#f5eef0] p-6 text-center"><p className="font-serif text-2xl text-[#402f38]">Recuerdos elegidos</p><p className="mt-2 text-sm text-stone-600">Explora y descarga tus fotografías aprobadas en una galería independiente.</p><Link href={`/dashboard/${slug}/album/galeria`} className="dash-primary mt-5 inline-flex">Ver galería aprobada →</Link></section><AlbumWhatsAppShare codigo={album.codigo} /></div>{ampliada && <div className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4" role="dialog" aria-modal="true" onClick={event => { if (event.target === event.currentTarget) setAmpliada(null); }} onTouchStart={event => { inicio.current = event.touches[0].clientX; }} onTouchEnd={finDeslizamiento}><button type="button" className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white text-2xl text-stone-800" onClick={() => setAmpliada(null)} aria-label="Cerrar fotografía">×</button><div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2"><a href={"/api/shared-album/download/" + ampliada.id} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-800">Descargar</a><button type="button" className="rounded-full bg-purple-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => { aprobar(); setAmpliada(null); }}>Aprobar</button><button type="button" className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700" onClick={() => { rechazar(); setAmpliada(null); }}>Rechazar</button></div><img src={ampliada.url_publica} alt="Fotografía ampliada" className="max-h-[90vh] max-w-full rounded-lg object-contain" onClick={event => event.stopPropagation()} /></div>}</>;
}
