"use client";

import { useState } from "react";

export default function Galeria({ fotos, colorFondo }) {
  const [seleccionada, setSeleccionada] = useState(null);

  if (!fotos || fotos.length === 0) return null;

  return (
    <div className="py-16 px-6">
      <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
        {fotos.map((foto, i) => (
          <button
            key={i}
            onClick={() => setSeleccionada(foto)}
            className="w-40 h-48 overflow-hidden shadow-xl transition-transform hover:scale-105 hover:z-10"
            style={{
              transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (4 + (i % 3))}deg)`,
              border: "6px solid #FFFDF8",
            }}
          >
            <img
              src={foto}
              alt=""
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {seleccionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: `${colorFondo}f0` }}
          onClick={() => setSeleccionada(null)}
        >
          <img
            src={seleccionada}
            alt=""
            className="max-w-full max-h-full rounded shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
