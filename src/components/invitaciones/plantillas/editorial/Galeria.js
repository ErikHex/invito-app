"use client";

import { useState } from "react";

export default function Galeria({ fotos, colorFondo }) {
  const [seleccionada, setSeleccionada] = useState(null);

  if (!fotos || fotos.length === 0) return null;

  return (
    <div className="inv-glass-section py-16 px-6 mx-4 my-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
        {fotos.map((foto, i) => (
          <button
            key={i}
            onClick={() => setSeleccionada(foto)}
            className="group aspect-4/5 overflow-hidden rounded-sm border border-white/30 shadow-lg transition-transform hover:scale-[1.02] hover:z-10"
          >
            <img
              src={foto}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {seleccionada && (
        <div
          className="gallery-modal fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: `${colorFondo}f0` }}
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada de la fotografía"
          onClick={() => setSeleccionada(null)}
        >
          <button
            type="button"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/30 text-2xl text-white backdrop-blur-sm transition hover:bg-black/60"
            aria-label="Cerrar fotografía"
            onClick={() => setSeleccionada(null)}
          >
            ×
          </button>
          <img
            src={seleccionada}
            alt=""
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
