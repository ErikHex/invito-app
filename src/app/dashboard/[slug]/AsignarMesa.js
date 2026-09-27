"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AsignarMesa({ invitado, mesas, invitados, onChange }) {
  const [guardando, setGuardando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const supabase = createClient();

  async function handleChange(e) {
    const nuevaMesaId = e.target.value;
    setGuardando(true);

    setMensajeError("");
    try {
      if (nuevaMesaId) {
        const mesa = mesas.find((item) => item.id === nuevaMesaId);
        const ocupados = invitados
          .filter((item) => item.mesa_id === nuevaMesaId && item.id !== invitado.id)
          .reduce((total, item) => total + 1 + (Number(item.acompanantes) || 0), 0);
        const lugaresNecesarios = 1 + (Number(invitado.acompanantes) || 0);
        if (mesa && ocupados + lugaresNecesarios > Number(mesa.capacidad)) {
          throw new Error("La mesa no tiene lugares suficientes para este invitado.");
        }
      }
      const { data, error } = await supabase
        .from("invitados")
        .update({ mesa_id: nuevaMesaId || null })
        .eq("id", invitado.id)
        .select("*")
        .single();
      if (error) throw error;
      onChange?.(data);
    } catch (error) {
      setMensajeError(error.message || "No se pudo asignar la mesa. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <select
        aria-label={`Mesa de ${invitado.nombre}`}
        value={invitado.mesa_id || ""}
        onChange={handleChange}
        disabled={guardando}
        className="border border-gray-300 rounded bg-white px-2 py-1 text-sm text-gray-900 focus:border-gray-700 focus:outline-none"
      >
        <option value="">Sin mesa</option>
        {mesas.map((mesa) => (
          <option
            key={mesa.id}
            value={mesa.id}
          >
            {mesa.nombre} ({mesa.capacidad} lugares)
          </option>
        ))}
      </select>
      {mensajeError && (
        <p
          role="alert"
          className="text-red-600 text-sm"
        >
          {mensajeError}
        </p>
      )}
    </div>
  );
}
