"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RsvpForm({ invitado, estado, onEstadoChange, preview = false }) {
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);
  const supabase = createClient();

  async function actualizarEstado(nuevoEstado) {
    if (preview) { onEstadoChange(nuevoEstado); return; }
    setCargando(true);

    setMensajeError("");
    try {
      const { error } = await supabase.rpc("actualizar_estado_invitado", {
        token_input: invitado.token,
        nuevo_estado: nuevoEstado,
      });
      if (error) throw error;
      onEstadoChange(nuevoEstado);
    } catch {
      setMensajeError("No pudimos guardar tu respuesta. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mt-6">
      {mensajeError && <p role="alert" className="text-red-600 mb-3">{mensajeError}</p>}
      <p className="text-gray-500 mb-4" aria-live="polite">
        Estado actual: <span className="font-semibold">{estado}</span>
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => actualizarEstado("confirmado")}
          disabled={cargando}
          className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold disabled:opacity-50" aria-pressed={estado === "confirmado"}
        >
          Confirmar
        </button>
        <button
          onClick={() => actualizarEstado("rechazado")}
          disabled={cargando}
          className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold disabled:opacity-50" aria-pressed={estado === "rechazado"}
        >
          No podré asistir
        </button>
      </div>
    </div>
  );
}
