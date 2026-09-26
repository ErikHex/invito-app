"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generarToken } from "@/lib/generarToken";

export default function AgregarInvitado({ eventoId, onAgregado }) {
  const [nombre, setNombre] = useState("");
  const [acompanantes, setAcompanantes] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nombre.trim()) return;

    setGuardando(true);
    setError("");

    const token = generarToken();

    const { data, error } = await supabase
      .from("invitados")
      .insert({
        evento_id: eventoId,
        nombre: nombre.trim(),
        acompanantes: Number(acompanantes),
        token,
        estado: "pendiente",
      })
      .select()
      .single();

    setGuardando(false);

    if (error) {
      console.error("Error real de Supabase:", error);
      setError("No se pudo agregar. Intenta de nuevo.");
      return;
    }

    setNombre("");
    setAcompanantes(0);
    onAgregado(data);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col sm:flex-row gap-3 sm:items-end"
    >
      <div className="flex-1">
        <label className="block text-sm text-gray-700 mb-1">
          Nombre del invitado
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Carlos Pérez"
          required
          className="w-full border border-gray-300 rounded bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-gray-700 focus:outline-none"
        />
      </div>
      <div className="w-32">
        <label className="block text-sm text-gray-700 mb-1">Acompañantes</label>
        <input
          type="number"
          min="0"
          value={acompanantes}
          onChange={(e) => setAcompanantes(e.target.value)}
          className="w-full border border-gray-300 rounded bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-gray-700 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={guardando}
        className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
      >
        {guardando ? "Agregando..." : "Agregar"}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </form>
  );
}
