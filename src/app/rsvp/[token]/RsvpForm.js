"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RsvpForm({ invitado, estado, onEstadoChange }) {
  const [cargando, setCargando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const supabase = createClient();

  async function actualizarEstado(nuevoEstado) {
    setCargando(true);
    setErrorMensaje("");

    const { error } = await supabase.rpc("actualizar_estado_invitado", {
      token_input: invitado.token,
      nuevo_estado: nuevoEstado,
    });

    if (!error) onEstadoChange(nuevoEstado);
    else setErrorMensaje("No se pudo guardar tu respuesta. Intenta de nuevo.");
    setCargando(false);
  }

  return (
    <div className="mt-6">
      <p className="text-gray-500 mb-4">
        Estado actual: <span className="font-semibold">{estado}</span>
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => actualizarEstado("confirmado")}
          disabled={cargando}
          className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          Confirmar
        </button>
        <button
          onClick={() => actualizarEstado("rechazado")}
          disabled={cargando}
          className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          No podré asistir
        </button>
      </div>
      {errorMensaje && <p role="alert" className="mt-3 text-center text-red-600">{errorMensaje}</p>}
    </div>
  );
}
