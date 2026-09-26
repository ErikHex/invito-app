"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-800";

function SelectorFoto({ label, value, fotos, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-gray-700">
        {label}
      </legend>
      {fotos.length === 0 ? (
        <p className="text-sm text-gray-500">
          Primero sube fotos en la galería.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {fotos.map((foto) => (
            <button
              key={foto}
              type="button"
              onClick={() => onChange(value === foto ? null : foto)}
              className={`aspect-square overflow-hidden rounded border-2 transition ${
                value === foto
                  ? "border-gray-900 ring-2 ring-gray-300"
                  : "border-transparent hover:border-gray-400"
              }`}
              aria-pressed={value === foto}
            >
              <img
                src={foto}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </fieldset>
  );
}

function Campo({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

function ItinerarioEditor({ items, onChange }) {
  function actualizarItem(index, campo, valor) {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [campo]: valor } : item,
      ),
    );
  }

  function agregarItem() {
    onChange([...items, { hora: "", titulo: "", lugar: "", mapsUrl: "" }]);
  }

  return (
    <div className="space-y-3 md:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-800">Itinerario</h3>
        <button
          type="button"
          onClick={agregarItem}
          className="text-sm font-semibold text-gray-700 underline"
        >
          Agregar actividad
        </button>
      </div>
      {items.map((item, index) => (
        <div
          key={index}
          className="grid gap-3 rounded border border-gray-200 p-3 md:grid-cols-4"
        >
          <Campo
            label="Hora"
            value={item.hora}
            onChange={(valor) => actualizarItem(index, "hora", valor)}
            placeholder="17:00"
          />
          <Campo
            label="Título"
            value={item.titulo}
            onChange={(valor) => actualizarItem(index, "titulo", valor)}
            placeholder="Ceremonia"
          />
          <Campo
            label="Lugar"
            value={item.lugar}
            onChange={(valor) => actualizarItem(index, "lugar", valor)}
            placeholder="Parroquia"
          />
          <Campo
            label="Maps"
            value={item.mapsUrl}
            onChange={(valor) => actualizarItem(index, "mapsUrl", valor)}
            placeholder="https://..."
          />
        </div>
      ))}
    </div>
  );
}

function RegalosEditor({ enlaces, onChange }) {
  function actualizarEnlace(index, campo, valor) {
    onChange(
      enlaces.map((enlace, enlaceIndex) =>
        enlaceIndex === index ? { ...enlace, [campo]: valor } : enlace,
      ),
    );
  }

  return (
    <div className="space-y-3 md:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-800">Mesas de regalos</h3>
        <button
          type="button"
          onClick={() =>
            onChange([...enlaces, { nombre: "", url: "", codigo: "" }])
          }
          className="text-sm font-semibold text-gray-700 underline"
        >
          Agregar mesa
        </button>
      </div>
      {enlaces.map((enlace, index) => (
        <div
          key={index}
          className="grid gap-3 rounded border border-gray-200 p-3 md:grid-cols-3"
        >
          <Campo
            label="Nombre"
            value={enlace.nombre}
            onChange={(valor) => actualizarEnlace(index, "nombre", valor)}
            placeholder="Liverpool"
          />
          <Campo
            label="Enlace"
            value={enlace.url}
            onChange={(valor) => actualizarEnlace(index, "url", valor)}
            placeholder="https://..."
          />
          <Campo
            label="Código"
            value={enlace.codigo}
            onChange={(valor) => actualizarEnlace(index, "codigo", valor)}
            placeholder="Opcional"
          />
        </div>
      ))}
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <label className="block text-sm font-medium text-gray-700 md:col-span-2">
      {label}
      <textarea
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className={inputClass}
      />
    </label>
  );
}

export default function ConfiguracionManager({ eventoId, eventoInicial }) {
  const [nombreEvento, setNombreEvento] = useState(
    eventoInicial.nombre_evento || "",
  );
  const [fecha, setFecha] = useState(eventoInicial.fecha || "");
  const [configuracion, setConfiguracion] = useState(
    eventoInicial.configuracion || {},
  );
  const [nombres, setNombres] = useState(
    (eventoInicial.configuracion?.nombres || []).join(", "),
  );
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const supabase = createClient();
  const fotos = Array.isArray(configuracion.galeria)
    ? configuracion.galeria
    : [];
  const ceremonia = configuracion.ceremonia || {};
  const recepcion = configuracion.recepcion || {};
  const itinerario = Array.isArray(configuracion.itinerario)
    ? configuracion.itinerario
    : [];
  const regalos = configuracion.regalos || {};
  const vestimenta = configuracion.vestimenta || {};

  function actualizarCampo(campo, valor) {
    setConfiguracion((actual) => ({ ...actual, [campo]: valor }));
  }

  function actualizarSeccion(seccion, campo, valor) {
    setConfiguracion((actual) => ({
      ...actual,
      [seccion]: { ...(actual[seccion] || {}), [campo]: valor },
    }));
  }

  async function guardar() {
    setGuardando(true);
    setMensaje("");

    const fechaHoraActual = configuracion.fechaHora || "T17:00:00-06:00";
    const hora =
      fechaHoraActual.match(/T\d{2}:\d{2}:\d{2}(?:[+-]\d{2}:\d{2}|Z)$/)?.[0] ||
      "T17:00:00-06:00";
    const nuevaConfiguracion = {
      ...configuracion,
      nombres: nombres
        .split(",")
        .map((nombre) => nombre.trim())
        .filter(Boolean),
      fechaHora: fecha ? `${fecha}${hora}` : configuracion.fechaHora,
    };

    let { error } = await supabase.rpc("actualizar_configuracion_evento", {
      evento_id_input: eventoId,
      nombre_evento_input: nombreEvento,
      fecha_input: fecha || null,
      configuracion_input: nuevaConfiguracion,
    });

    if (error?.code === "PGRST202") {
      const response = await supabase
        .from("eventos")
        .update({
          nombre_evento: nombreEvento,
          fecha: fecha || null,
          configuracion: nuevaConfiguracion,
        })
        .eq("id", eventoId);
      error = response.error;
    }

    setConfiguracion(nuevaConfiguracion);
    setGuardando(false);
    setMensaje(
      error
        ? `No se pudo guardar la configuración: ${error.message}`
        : "Datos guardados. Recarga la invitación para verlos.",
    );
  }

  return (
    <section className="mb-6 rounded-lg bg-white p-4 shadow">
      <div className="sticky top-0 z-10 -mx-4 mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <div>
          <h2 className="font-semibold text-gray-800">
            Datos de la invitación
          </h2>
          <p className="text-sm text-gray-500">
            Estos datos se sincronizan con la invitación pública.
          </p>
        </div>
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      <div className="space-y-3">
        <details
          open
          className="rounded border border-gray-200 p-4"
        >
          <summary className="cursor-pointer font-semibold text-gray-800">
            1. Datos principales
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Campo
              label="Nombre del evento"
              value={nombreEvento}
              onChange={setNombreEvento}
            />
            <Campo
              label="Fecha del evento"
              type="date"
              value={fecha}
              onChange={setFecha}
            />
            <Campo
              label="Nombres que aparecen en portada"
              value={nombres}
              onChange={setNombres}
              placeholder="Ej. Juan, María"
            />
            <Campo
              label="Encabezado de portada"
              value={configuracion.encabezado}
              onChange={(valor) => actualizarCampo("encabezado", valor)}
              placeholder="Celebremos juntos"
            />
            <Textarea
              label="Mensaje de la invitación"
              value={configuracion.mensajeBase}
              onChange={(valor) => actualizarCampo("mensajeBase", valor)}
              placeholder="Nos encantará contar contigo..."
            />
          </div>
        </details>

        <details className="rounded border border-gray-200 p-4">
          <summary className="cursor-pointer font-semibold text-gray-800">
            2. Fotos
          </summary>
          <div className="mt-4 space-y-6">
            <SelectorFoto
              label="Foto de portada"
              value={configuracion.fotoPortada || null}
              fotos={fotos}
              onChange={(foto) => actualizarCampo("fotoPortada", foto)}
            />
            <SelectorFoto
              label="Foto del mensaje"
              value={configuracion.fotoMensaje || null}
              fotos={fotos}
              onChange={(foto) => actualizarCampo("fotoMensaje", foto)}
            />
            <SelectorFoto
              label="Foto de ceremonia"
              value={ceremonia.foto || null}
              fotos={fotos}
              onChange={(foto) => actualizarSeccion("ceremonia", "foto", foto)}
            />
            <SelectorFoto
              label="Foto de recepción"
              value={recepcion.foto || null}
              fotos={fotos}
              onChange={(foto) => actualizarSeccion("recepcion", "foto", foto)}
            />
          </div>
        </details>

        <details className="rounded border border-gray-200 p-4">
          <summary className="cursor-pointer font-semibold text-gray-800">
            3. Ceremonia y recepción
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-700">Ceremonia</h3>
            </div>
            <Campo
              label="Hora"
              value={ceremonia.hora}
              onChange={(valor) =>
                actualizarSeccion("ceremonia", "hora", valor)
              }
              placeholder="17:00"
            />
            <Campo
              label="Lugar"
              value={ceremonia.lugar}
              onChange={(valor) =>
                actualizarSeccion("ceremonia", "lugar", valor)
              }
              placeholder="Parroquia San Juan"
            />
            <Campo
              label="Dirección"
              value={ceremonia.direccion}
              onChange={(valor) =>
                actualizarSeccion("ceremonia", "direccion", valor)
              }
            />
            <Campo
              label="Enlace de ubicación"
              value={ceremonia.mapsUrl}
              onChange={(valor) =>
                actualizarSeccion("ceremonia", "mapsUrl", valor)
              }
              placeholder="https://maps.google.com/..."
            />
            <div className="md:col-span-2 mt-3">
              <h3 className="font-semibold text-gray-700">Recepción</h3>
            </div>
            <Campo
              label="Hora"
              value={recepcion.hora}
              onChange={(valor) =>
                actualizarSeccion("recepcion", "hora", valor)
              }
              placeholder="19:00"
            />
            <Campo
              label="Lugar"
              value={recepcion.lugar}
              onChange={(valor) =>
                actualizarSeccion("recepcion", "lugar", valor)
              }
              placeholder="Salón Jardín"
            />
            <Campo
              label="Dirección"
              value={recepcion.direccion}
              onChange={(valor) =>
                actualizarSeccion("recepcion", "direccion", valor)
              }
            />
            <Campo
              label="Enlace de ubicación"
              value={recepcion.mapsUrl}
              onChange={(valor) =>
                actualizarSeccion("recepcion", "mapsUrl", valor)
              }
              placeholder="https://maps.google.com/..."
            />
          </div>
        </details>

        <details className="rounded border border-gray-200 p-4">
          <summary className="cursor-pointer font-semibold text-gray-800">
            4. Contenido adicional
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Textarea
              label="Texto alternativo de la foto del mensaje"
              value={configuracion.fotoMensajeAlt}
              onChange={(valor) => actualizarCampo("fotoMensajeAlt", valor)}
            />
            <Campo
              label="Música de la invitación (URL)"
              value={configuracion.musicaUrl}
              onChange={(valor) => actualizarCampo("musicaUrl", valor)}
              placeholder="https://.../cancion.mp3"
            />
            <ItinerarioEditor
              items={itinerario}
              onChange={(items) => actualizarCampo("itinerario", items)}
            />
            <div className="md:col-span-2 mt-4">
              <h3 className="font-semibold text-gray-700">
                Código de vestimenta
              </h3>
            </div>
            <Campo
              label="Código"
              value={vestimenta.codigo}
              onChange={(valor) =>
                actualizarSeccion("vestimenta", "codigo", valor)
              }
              placeholder="Formal / Cocktail"
            />
            <Textarea
              label="Descripción"
              value={vestimenta.descripcion}
              onChange={(valor) =>
                actualizarSeccion("vestimenta", "descripcion", valor)
              }
              placeholder="Sugerencias para tus invitados..."
            />
            <Textarea
              label="Mensaje de mesas de regalos"
              value={regalos.mensaje}
              onChange={(valor) =>
                actualizarSeccion("regalos", "mensaje", valor)
              }
              placeholder="Tu presencia es nuestro mejor regalo..."
            />
            <RegalosEditor
              enlaces={Array.isArray(regalos.enlaces) ? regalos.enlaces : []}
              onChange={(enlaces) =>
                actualizarSeccion("regalos", "enlaces", enlaces)
              }
            />
          </div>
        </details>
      </div>

      {mensaje && (
        <p
          className="mt-5 text-sm text-gray-600"
          role="status"
        >
          {mensaje}
        </p>
      )}
    </section>
  );
}
