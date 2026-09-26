"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AsignarMesa from "./AsignarMesa";
import AgregarInvitado from "./AgregarInvitado";

export default function ListaInvitados({
  eventoId,
  invitadosIniciales,
  mesas,
}) {
  const [invitados, setInvitados] = useState(invitadosIniciales);
  const [errorActualizacion, setErrorActualizacion] = useState("");
  const supabase = createClient();

  useEffect(() => {
    let disposed = false;
    let loading = false;
    async function actualizar() {
      if (document.hidden || loading) return;
      loading = true;
      try {
        const { data, error } = await supabase
          .from("invitados")
          .select("*")
          .eq("evento_id", eventoId)
          .order("nombre")
          .order("id");
        if (error) throw error;
        if (!disposed) {
          setInvitados(data);
          setErrorActualizacion("");
        }
      } catch {
        if (!disposed)
          setErrorActualizacion(
            "No se pudieron actualizar los invitados. Reintentaremos automáticamente.",
          );
      } finally {
        loading = false;
      }
    }
    const interval = setInterval(actualizar, 15000);
    document.addEventListener("visibilitychange", actualizar);
    return () => {
      disposed = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", actualizar);
    };
  }, [eventoId, supabase]);

  function handleAgregado(nuevoInvitado) {
    setInvitados((prev) => [...prev, nuevoInvitado]);
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-green-500">
            {invitados.filter((i) => i.estado === "confirmado").length}
          </p>
          <p className="text-gray-500">Confirmados</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-yellow-500">
            {invitados.filter((i) => i.estado === "pendiente").length}
          </p>
          <p className="text-gray-500">Pendientes</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-red-500">
            {invitados.filter((i) => i.estado === "rechazado").length}
          </p>
          <p className="text-gray-500">Rechazados</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <p className="text-3xl font-bold text-blue-500">
            {invitados.filter((i) => i.checked_in).length}
          </p>
          <p className="text-gray-500">Ya llegaron</p>
        </div>
      </div>

      <AgregarInvitado
        eventoId={eventoId}
        onAgregado={handleAgregado}
      />

      <p className="text-sm text-gray-500 mb-2">
        Actualización automática cada 15 segundos.
      </p>
      {errorActualizacion && (
        <p
          role="alert"
          className="text-red-600"
        >
          {errorActualizacion}
        </p>
      )}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Invitados</h2>
      <div className="bg-white text-gray-900 rounded-lg shadow divide-y">
        {invitados.map((inv) => (
          <div
            key={`${inv.id}-${inv.mesa_id || ""}`}
            className="p-3 flex flex-wrap gap-3 justify-between items-center"
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-900">{inv.nombre}</p>
              <p className="text-sm text-gray-500">
                {Number(inv.acompanantes) || 0} acompañantes · {1 + (Number(inv.acompanantes) || 0)} lugares
              </p>
            </div>
            <span className="text-sm text-gray-500">{inv.estado}</span>
            <AsignarMesa
              invitado={inv}
              mesas={mesas}
              invitados={invitados}
            />
          </div>
        ))}
      </div>
    </>
  );
}
