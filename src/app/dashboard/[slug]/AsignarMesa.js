"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AsignarMesa({ invitado, mesas }) {
  const [mesaId, setMesaId] = useState(invitado.mesa_id || "");
  const [guardando, setGuardando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");
  const supabase = createClient();

  async function handleChange(e) {
    const nuevaMesaId = e.target.value;
    setGuardando(true);
    setErrorMensaje("");

    const { error } = await supabase
      .from("invitados")
      .update({ mesa_id: nuevaMesaId || null })
      .eq("id", invitado.id)
      .eq("evento_id", invitado.evento_id);

    if (!error) {
      setMesaId(nuevaMesaId);
    } else setErrorMensaje("No se pudo asignar la mesa.");

    setGuardando(false);
  }

  return (
    <div><select
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
    </select>{errorMensaje && <p role="alert" className="text-xs text-red-600">{errorMensaje}</p>}</div>
  );
}
