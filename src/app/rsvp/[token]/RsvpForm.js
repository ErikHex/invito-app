"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RsvpForm({ invitado }) {
  const [estado, setEstado] = useState(invitado.estado);
  const [cargando, setCargando] = useState(false);
  const supabase = createClient();

  async function actualizarEstado(nuevoEstado) {
    setCargando(true);

    const { error } = await supabase.rpc("actualizar_estado_invitado", {
      token_input: invitado.token,
      nuevo_estado: nuevoEstado,
    });

    if (!error) setEstado(nuevoEstado);
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
    </div>
  );
}
