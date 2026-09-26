"use client";

import { useEffect, useState } from "react";

export default function CuentaRegresiva({ fechaHora }) {
  const [tiempo, setTiempo] = useState(null);

  useEffect(() => {
    function calcular() {
      const diff = new Date(fechaHora) - new Date();
      if (!Number.isFinite(diff)) return null;
      if (diff <= 0) return { dias: 0, horas: 0, min: 0, seg: 0 };
      return {
        dias: Math.floor(diff / 86400000),
        horas: Math.floor((diff / 3600000) % 24),
        min: Math.floor((diff / 60000) % 60),
        seg: Math.floor((diff / 1000) % 60),
      };
    }
    const initial = setTimeout(() => setTiempo(calcular()), 0);
    const interval = setInterval(() => setTiempo(calcular()), 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [fechaHora]);

  if (!tiempo) return null;

  return (
    <div className="inv-glass-section grid grid-cols-4 gap-2 sm:gap-8 py-10 sm:py-16 px-3 sm:px-8 mx-4 mt-0 mb-8">
      {[
        ["Días", tiempo.dias],
        ["Horas", tiempo.horas],
        ["Min", tiempo.min],
        ["Seg", tiempo.seg],
      ].map(([label, val]) => (
        <div
          key={label}
          className="min-w-0 text-center"
        >
          <p
            className="text-3xl sm:text-5xl font-bold tabular-nums"
            style={{ color: "#292927", fontFamily: "var(--font-display)" }}
          >
            {String(val).padStart(2, "0")}
          </p>
          <p
            className="text-[10px] sm:text-sm mt-1 opacity-70 uppercase tracking-wider"
            style={{ color: "#56544F" }}
          >
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
