"use client";

import { useEffect, useState } from "react";

export default function CuentaRegresiva({
  fechaHora,
  colorAcento,
  colorTexto,
}) {
  const [tiempo, setTiempo] = useState(null);

  useEffect(() => {
    function calcular() {
      const diff = new Date(fechaHora) - new Date();
      if (diff <= 0) return { dias: 0, horas: 0, min: 0, seg: 0 };
      return {
        dias: Math.floor(diff / 86400000),
        horas: Math.floor((diff / 3600000) % 24),
        min: Math.floor((diff / 60000) % 60),
        seg: Math.floor((diff / 1000) % 60),
      };
    }
    setTiempo(calcular());
    const interval = setInterval(() => setTiempo(calcular()), 1000);
    return () => clearInterval(interval);
  }, [fechaHora]);

  if (!tiempo) return null;

  return (
    <div className="flex justify-center gap-8 py-16">
      {[
        ["Días", tiempo.dias],
        ["Horas", tiempo.horas],
        ["Min", tiempo.min],
        ["Seg", tiempo.seg],
      ].map(([label, val]) => (
        <div
          key={label}
          className="text-center"
        >
          <p
            className="text-5xl font-bold"
            style={{ color: colorAcento, fontFamily: "var(--font-display)" }}
          >
            {String(val).padStart(2, "0")}
          </p>
          <p
            className="text-sm mt-1 opacity-70"
            style={{ color: colorTexto }}
          >
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
