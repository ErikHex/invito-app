"use client";

import Image from 'next/image';
import { useState } from 'react';

const ideas = [
  { imagen: '/images/album-qr-guide/mesa-bienvenida.png', titulo: 'Dale la bienvenida', texto: 'Colócalo junto al libro de firmas o la mesa de bienvenida para que todos lo descubran al llegar.' },
  { imagen: '/images/album-qr-guide/mesa-invitados.png', titulo: 'Acércalo a cada mesa', texto: 'Una tarjeta por mesa anima a tus invitados a sumar recuerdos desde todos los ángulos.' },
  { imagen: '/images/album-qr-guide/dj-fiesta.png', titulo: 'Invítalos a participar', texto: 'Pide al DJ o anfitrión un recordatorio breve durante la fiesta para que nadie se lo pierda.' },
];

export default function AlbumQrGuide() {
  const [abierta, setAbierta] = useState(false);
  return <>
    <button type="button" onClick={() => setAbierta(true)} className="rounded-lg border border-[#d8c4cb] bg-white px-4 py-2 text-sm font-semibold text-[#79528d] transition hover:bg-[#f8f2f5]">Ideas para usar el QR</button>
    {abierta && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#402f38]/55 p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="guia-qr-titulo" onClick={event => { if (event.target === event.currentTarget) setAbierta(false); }}>
      <section className="max-h-[calc(100vh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-2xl bg-[#fffdfb] shadow-[0_24px_80px_rgba(64,47,56,0.35)] sm:max-h-[calc(100vh-3rem)]">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-[#eadfe1] bg-[#fffdfb]/95 px-5 py-4 backdrop-blur sm:px-8"><div><p className="text-xs font-bold tracking-[.18em] text-[#987181]">GUÍA PARA TU EVENTO</p><h2 id="guia-qr-titulo" className="mt-1 font-serif text-2xl text-[#402f38] sm:text-3xl">Comparte el álbum con todos</h2></div><button type="button" onClick={() => setAbierta(false)} className="ml-4 inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#d8c4cb] bg-white px-3 py-2 text-sm font-semibold text-[#765368] hover:bg-[#f8f2f5]" aria-label="Cerrar guía"><span className="text-lg leading-none">×</span><span className="hidden sm:inline">Cerrar</span></button></header>
        <div className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8"><p className="max-w-2xl text-sm leading-6 text-stone-600">Elige uno o combina varios puntos para que tus invitados encuentren el QR de forma natural durante la celebración.</p><div className="mt-6 grid gap-5 md:grid-cols-3">{ideas.map(({ imagen, titulo, texto }, indice) => <article key={titulo} className="overflow-hidden rounded-xl border border-[#eadfe1] bg-white shadow-sm"><div className="relative aspect-[4/3] overflow-hidden bg-[#f1e3e7]"><Image src={imagen} alt="" fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover" /></div><div className="p-4"><p className="text-xs font-bold tracking-[.16em] text-[#987181]">IDEA {String(indice + 1).padStart(2, '0')}</p><h3 className="mt-2 font-serif text-xl text-[#402f38]">{titulo}</h3><p className="mt-2 text-sm leading-5 text-stone-600">{texto}</p></div></article>)}</div><aside className="mt-6 rounded-xl border border-[#e6d8df] bg-[#f8f2f5] p-5 text-center"><p className="font-serif text-xl text-[#402f38]">Una frase que funciona</p><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-600">“Toma una foto, escanea el QR y ayúdanos a guardar este momento”.</p></aside><div className="mt-6 flex justify-center"><button type="button" onClick={() => setAbierta(false)} className="dash-primary">Cerrar guía</button></div></div>
      </section>
    </div>}
  </>;
}
