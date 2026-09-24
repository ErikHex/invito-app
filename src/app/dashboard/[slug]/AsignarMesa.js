"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AsignarMesa({ invitado, mesas }) {
  const [mesaId, setMesaId] = useState(invitado.mesa_id || "");
  const [guardando, setGuardando] = useState(false);

  async function handleChange(e) {
    const nuevaMesaId = e.target.value;
    setGuardando(true);

    const { error } = await supabase
      .from("invitados")
      .update({ mesa_id: nuevaMesaId || null })
      .eq("id", invitado.id);

    if (!error) {
      setMesaId(nuevaMesaId);
    }

    setGuardando(false);
  }

  return (
    <select
      value={mesaId}
      onChange={handleChange}
      disabled={guardando}
      className="border rounded px-2 py-1 text-sm"
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
  );
}
