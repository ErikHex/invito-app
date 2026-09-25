"use client";

import { useState } from "react";

export default function SobreAnimado({
  nombreInvitado,
  colorFondo,
  colorAcento,
  onAbrir,
}) {
  const [abriendo, setAbriendo] = useState(false);

  function handleClick() {
    setAbriendo(true);
    setTimeout(onAbrir, 1400);
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-700"
      style={{
        backgroundColor: colorFondo,
        opacity: abriendo ? 0 : 1,
        pointerEvents: abriendo ? "none" : "auto",
      }}
    >
      <div
        className="text-center cursor-pointer"
        onClick={handleClick}
      >
        <div
          className="relative w-64 h-44 mx-auto"
          style={{ perspective: "800px" }}
        >
          <div
            className="absolute inset-0 rounded-sm shadow-2xl"
            style={{
              backgroundColor: colorAcento,
              opacity: 0.15,
              border: `1px solid ${colorAcento}`,
            }}
          />
          <div
            className="absolute left-3 right-3 top-3 bottom-3 rounded-sm flex items-center justify-center"
            style={{
              backgroundColor: "#FFFDF8",
              animation: abriendo
                ? "letterOut 1s ease-in forwards 0.4s"
                : "none",
            }}
          >
            <p
              className="text-sm px-4"
              style={{ color: colorFondo, fontFamily: "var(--font-display)" }}
            >
              Para: {nombreInvitado}
            </p>
          </div>
          <div
            className="absolute top-0 left-0 right-0 h-24 origin-top"
            style={{
              backgroundColor: colorAcento,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              transformStyle: "preserve-3d",
              animation: abriendo ? "flapOpen 0.6s ease-in forwards" : "none",
            }}
          />
        </div>
        <p
          className="mt-8 tracking-wide"
          style={{ color: colorAcento }}
        >
          Toca para abrir tu invitación
        </p>
      </div>
    </div>
  );
}
