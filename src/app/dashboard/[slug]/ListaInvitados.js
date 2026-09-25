"use client";

import { useState } from "react";
import AsignarMesa from "./AsignarMesa";
import AgregarInvitado from "./AgregarInvitado";

export default function ListaInvitados({
  eventoId,
  invitadosIniciales,
  mesas,
}) {
  const [invitados, setInvitados] = useState(invitadosIniciales);

  function handleAgregado(nuevoInvitado) {
    setInvitados((prev) => [...prev, nuevoInvitado]);
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-4 mb-6">
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

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Invitados</h2>
      <div className="bg-white rounded-lg shadow divide-y">
        {invitados.map((inv) => (
          <div
            key={inv.id}
            className="p-3 flex justify-between items-center"
          >
            <span>{inv.nombre}</span>
            <span className="text-sm text-gray-500">{inv.estado}</span>
            <AsignarMesa
              invitado={inv}
              mesas={mesas}
            />
          </div>
        ))}
      </div>
    </>
  );
}
