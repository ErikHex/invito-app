"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function lugaresDe(invitado) {
  return 1 + (Number(invitado.acompanantes) || 0);
}

function MesaCard({ mesa, invitados, onAsignar, onEditar, onEliminar }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(mesa.nombre);
  const [capacidadEdit, setCapacidadEdit] = useState(mesa.capacidad);
  const asignados = invitados.filter(
    (invitado) => invitado.mesa_id === mesa.id,
  );
  const lugaresOcupados = asignados.reduce((total, invitado) => total + lugaresDe(invitado), 0);
  const capacidad = Number(mesa.capacidad) || 0;
  const llena = capacidad > 0 && lugaresOcupados >= capacidad;

  async function guardarEdicion(event) {
    event.preventDefault();
    const guardado = await onEditar(mesa.id, nombre, capacidadEdit);
    if (guardado) setEditando(false);
  }

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {editando ? (
            <form onSubmit={guardarEdicion} className="space-y-2">
              <input value={nombre} onChange={(event) => setNombre(event.target.value)} className="w-full rounded border border-gray-300 px-2 py-1 text-gray-900" aria-label="Nombre de mesa" />
              <input type="number" min="1" max="50" value={capacidadEdit} onChange={(event) => setCapacidadEdit(event.target.value)} className="w-28 rounded border border-gray-300 px-2 py-1 text-gray-900" aria-label="Capacidad de mesa" />
              <div className="flex gap-2 text-xs"><button type="submit" className="font-semibold text-gray-900 underline">Guardar</button><button type="button" onClick={() => setEditando(false)} className="text-gray-500 underline">Cancelar</button></div>
            </form>
          ) : (
            <><h3 className="text-lg font-semibold text-gray-900">{mesa.nombre}</h3><p className="text-sm text-gray-500">{lugaresOcupados} de {capacidad || "-"} lugares ocupados</p></>
          )}
        </div>
        {!editando && <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${llena ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
        >
          {llena ? "Llena" : "Disponible"}
        </span>}
      </div>

      {!editando && <div className="mb-3 flex gap-3 text-xs"><button type="button" onClick={() => setEditando(true)} className="font-semibold text-gray-700 underline">Editar mesa</button><button type="button" onClick={() => onEliminar(mesa)} className="font-semibold text-red-600 underline">Eliminar</button></div>}

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${llena ? "bg-red-500" : "bg-gray-800"}`}
          style={{
            width: `${capacidad ? Math.min((lugaresOcupados / capacidad) * 100, 100) : 0}%`,
          }}
        />
      </div>

      <div className="space-y-2">
        {asignados.length > 0 ? (
          asignados.map((invitado) => (
            <div
              key={invitado.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-900"
            >
              <span className="min-w-0 truncate">
                <span className="block">{invitado.nombre}</span>
                <span className="block text-xs text-gray-500">
                  {Number(invitado.acompanantes) || 0} acompañantes · {lugaresDe(invitado)} lugares
                </span>
              </span>
              <button
                type="button"
                onClick={() => onAsignar(invitado.id, "")}
                className="shrink-0 text-xs font-semibold text-gray-500 underline"
              >
                Quitar
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">
            Aún no hay invitados asignados.
          </p>
        )}
      </div>

      <label className="mt-4 block text-sm font-medium text-gray-700">
        Asignar invitado
        <select
          value=""
          onChange={(event) =>
            event.target.value && onAsignar(event.target.value, mesa.id)
          }
          disabled={llena}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-700 focus:outline-none disabled:bg-gray-100"
        >
          <option value="">
            {llena ? "Mesa llena" : "Seleccionar invitado"}
          </option>
          {invitados
            .filter((invitado) => invitado.mesa_id !== mesa.id)
            .map((invitado) => (
              <option
                key={invitado.id}
                value={invitado.id}
              >
                {invitado.nombre}
              </option>
            ))}
        </select>
      </label>
    </article>
  );
}

export default function MesasManager({
  eventoId,
  mesasIniciales,
  invitadosIniciales,
}) {
  const [mesas, setMesas] = useState(mesasIniciales || []);
  const [invitados, setInvitados] = useState(invitadosIniciales || []);
  const [prefijo, setPrefijo] = useState("Mesa");
  const [cantidad, setCantidad] = useState(1);
  const [capacidad, setCapacidad] = useState(8);
  const [capacidadPersonalizada, setCapacidadPersonalizada] = useState(8);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const supabase = createClient();

  const sinMesa = useMemo(
    () => invitados.filter((invitado) => !invitado.mesa_id).length,
    [invitados],
  );
  const mesasVisibles = useMemo(
    () =>
      mesas.filter((mesa) => {
        const asignados = invitados.filter(
          (invitado) => invitado.mesa_id === mesa.id,
        ).reduce((total, invitado) => total + lugaresDe(invitado), 0);
        const llena =
          Number(mesa.capacidad) > 0 && asignados >= Number(mesa.capacidad);
        const coincideBusqueda = mesa.nombre
          .toLowerCase()
          .includes(busqueda.toLowerCase());
        return (
          coincideBusqueda &&
          (filtro === "todas" ||
            (filtro === "llenas" && llena) ||
            (filtro === "disponibles" && !llena))
        );
      }),
    [busqueda, filtro, invitados, mesas],
  );

  async function agregarMesas(event) {
    event.preventDefault();
    const total = Math.max(1, Math.min(50, Number(cantidad) || 1));
    const lugares =
      capacidad === "personalizada"
        ? Number(capacidadPersonalizada)
        : Number(capacidad);
    if (!prefijo.trim() || lugares < 1) return;
    setGuardando(true);
    setMensaje("");

    const existentes = new Set(mesas.map((mesa) => mesa.nombre.toLowerCase()));
    const nuevas = Array.from({ length: total }, (_, index) => {
      let numero = mesas.length + index + 1;
      let mesaNombre = `${prefijo.trim()} ${numero}`;
      while (existentes.has(mesaNombre.toLowerCase()))
        mesaNombre = `${prefijo.trim()} ${++numero}`;
      existentes.add(mesaNombre.toLowerCase());
      return { evento_id: eventoId, nombre: mesaNombre, capacidad: lugares };
    });

    const { data, error } = await supabase
      .from("mesas")
      .insert(nuevas)
      .select();

    if (error) {
      setMensaje(`No se pudieron crear las mesas: ${error.message}`);
    } else {
      setMesas((actuales) => [...actuales, ...(data || [])]);
      setCantidad(1);
      setMensaje(
        `${data?.length || total} mesa${total === 1 ? "" : "s"} creada${total === 1 ? "" : "s"}.`,
      );
    }
    setGuardando(false);
  }

  async function asignarInvitado(invitadoId, mesaId) {
    if (mesaId) {
      const mesa = mesas.find((item) => item.id === mesaId);
      const invitado = invitados.find((item) => item.id === invitadoId);
      const ocupados = invitados.filter((item) => item.mesa_id === mesaId && item.id !== invitadoId).reduce((total, item) => total + lugaresDe(item), 0);
      if (mesa && invitado && ocupados + lugaresDe(invitado) > Number(mesa.capacidad)) {
        setMensaje(`${mesa.nombre} no tiene lugares suficientes para ${invitado.nombre}.`);
        return;
      }
    }
    const anterior = invitados;
    setInvitados((actuales) =>
      actuales.map((invitado) =>
        invitado.id === invitadoId
          ? { ...invitado, mesa_id: mesaId || null }
          : invitado,
      ),
    );
    const { error } = await supabase
      .from("invitados")
      .update({ mesa_id: mesaId || null })
      .eq("id", invitadoId)
      .eq("evento_id", eventoId);
    if (error) {
      setInvitados(anterior);
      setMensaje(`No se pudo asignar el invitado: ${error.message}`);
    }
  }

  async function editarMesa(mesaId, nombre, capacidad) {
    const capacidadNueva = Number(capacidad);
    if (!nombre.trim() || capacidadNueva < 1) return false;
    const ocupados = invitados.filter((invitado) => invitado.mesa_id === mesaId).reduce((total, item) => total + lugaresDe(item), 0);
    if (capacidadNueva < ocupados) {
      setMensaje("La capacidad no puede ser menor que los lugares ya ocupados.");
      return false;
    }
    const { data, error } = await supabase.from("mesas").update({ nombre: nombre.trim(), capacidad: capacidadNueva }).eq("id", mesaId).eq("evento_id", eventoId).select().single();
    if (error) {
      setMensaje(`No se pudo editar la mesa: ${error.message}`);
      return false;
    }
    setMesas((actuales) => actuales.map((mesa) => mesa.id === mesaId ? data : mesa));
    setMensaje("Mesa actualizada.");
    return true;
  }

  async function eliminarMesa(mesa) {
    const asignados = invitados.filter((invitado) => invitado.mesa_id === mesa.id);
    if (asignados.length > 0) {
      setMensaje("Quita primero los invitados asignados antes de eliminar la mesa.");
      return;
    }
    if (!window.confirm(`¿Eliminar ${mesa.nombre}?`)) return;
    const { error } = await supabase.from("mesas").delete().eq("id", mesa.id).eq("evento_id", eventoId);
    if (error) {
      setMensaje(`No se pudo eliminar la mesa: ${error.message}`);
      return;
    }
    setMesas((actuales) => actuales.filter((item) => item.id !== mesa.id));
    setMensaje("Mesa eliminada.");
  }

  return (
    <section className="mb-6 rounded-xl bg-gray-50 p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Organización de mesas
          </h2>
          <p className="text-sm text-gray-600">
            Crea mesas y asigna invitados desde el teléfono.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-700 shadow-sm">
          {sinMesa} sin mesa
        </span>
      </div>

      <form
        onSubmit={agregarMesas}
        className="mb-6 grid gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-[1fr_120px_160px_auto] sm:items-end"
      >
        <label className="text-sm font-medium text-gray-700">
          Nombre base
          <input
            value={prefijo}
            onChange={(event) => setPrefijo(event.target.value)}
            placeholder="Mesa"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-gray-700 focus:outline-none"
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Cantidad
          <input
            type="number"
            min="1"
            max="50"
            value={cantidad}
            onChange={(event) => setCantidad(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-700 focus:outline-none"
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Capacidad
          <select
            value={capacidad}
            onChange={(event) => setCapacidad(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-700 focus:outline-none"
          >
            <option value="8">8 invitados</option>
            <option value="10">10 invitados</option>
            <option value="12">12 invitados</option>
            <option value="personalizada">Personalizada</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={guardando || !prefijo.trim()}
          className="rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Crear mesas"}
        </button>
      </form>

      {capacidad === "personalizada" && (
        <label className="mb-6 block max-w-xs text-sm font-medium text-gray-700">
          Lugares por mesa
          <input
            type="number"
            min="1"
            max="50"
            value={capacidadPersonalizada}
            onChange={(event) => setCapacidadPersonalizada(event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-gray-700 focus:outline-none"
          />
        </label>
      )}

      {mesas.length > 0 && (
        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_180px]">
          <input
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar mesa..."
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-gray-700 focus:outline-none"
          />
          <select
            value={filtro}
            onChange={(event) => setFiltro(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-gray-700 focus:outline-none"
          >
            <option value="todas">Todas las mesas</option>
            <option value="disponibles">Con lugares</option>
            <option value="llenas">Llenas</option>
          </select>
        </div>
      )}

      {mesas.length > 0 ? (
        mesasVisibles.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mesasVisibles.map((mesa) => (
              <MesaCard
                key={mesa.id}
                mesa={mesa}
                invitados={invitados}
                onAsignar={asignarInvitado}
                onEditar={editarMesa}
                onEliminar={eliminarMesa}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            No hay mesas que coincidan con ese filtro.
          </p>
        )
      ) : (
        <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
          Crea tu primera mesa para comenzar.
        </p>
      )}

      {mensaje && (
        <p
          role="status"
          className="mt-4 text-sm text-gray-700"
        >
          {mensaje}
        </p>
      )}
    </section>
  );
}
