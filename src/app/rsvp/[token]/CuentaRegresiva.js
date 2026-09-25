"use client";

import { useEffect, useState } from "react";

export default function CuentaRegresiva({
  fechaHora,
  colorAcento,
  colorTexto,
}) {
  const [ahora, setAhora] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!fechaHora || ahora === null) return null;
  const diff = Math.max(0, new Date(fechaHora).getTime() - ahora);
  if (!Number.isFinite(diff)) return null;
  const tiempo = {
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff / 3600000) % 24),
    min: Math.floor((diff / 60000) % 60),
    seg: Math.floor((diff / 1000) % 60),
  };

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
