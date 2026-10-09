"use client";
// Photos may come from customer-provided hosts and public Storage.
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

import { ajusteTextoPortada, tipoCelebracion } from "@/lib/invitation-theme";
import { familiasPaleta } from "@/lib/invitation-palettes";
import { familiasTipografia } from "@/lib/invitation-fonts";
import GaleriaManager from "./GaleriaManager";
import { pinterestUrl, validClabe } from "@/lib/invitation-utils";
import Invitacion from "@/components/invitaciones/Invitacion";
import styles from "./editor.module.css";

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
                alt={`Seleccionar foto para ${label.toLowerCase()}`}
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
            type="time"
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
          <button type="button" onClick={() => onChange(items.filter((_, i) => i !== index))} className="text-sm underline">Eliminar actividad</button>
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
          <button type="button" onClick={() => onChange(enlaces.filter((_, i) => i !== index))} className="text-sm underline">Eliminar enlace</button>
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

export default function ConfiguracionManager({ eventoId, eventoInicial, slug, esMuestra = false }) {
  const router = useRouter();
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
  const [subiendo, setSubiendo] = useState(false);
  const [base, setBase] = useState(eventoInicial.configuracion || {});
  const [panelAbierto, setPanelAbierto] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState("informacion");
  const [familiaPaletaActiva, setFamiliaPaletaActiva] = useState(
    eventoInicial.configuracion?.tema?.paleta?.split(":")[0] || "neutros",
  );
  const [textoPortadaSeleccionado, setTextoPortadaSeleccionado] = useState(false);
  const inicioArrastrePanel = useRef(null);
  const ajustesPortadaRef = useRef(null);
  const [menuNavegacionAbierto, setMenuNavegacionAbierto] = useState(false);
  const [guardado, setGuardado] = useState(JSON.stringify([eventoInicial.nombre_evento || "", eventoInicial.fecha || "", eventoInicial.configuracion || {}, (eventoInicial.configuracion?.nombres || []).join(", ")]));
  const actual = JSON.stringify([nombreEvento, fecha, configuracion, nombres]);
  const pendiente = actual !== guardado;
  useEffect(() => {
    function avisar(event) { if (pendiente || subiendo) { event.preventDefault(); event.returnValue = ""; } }
    function navegar(event) {
      const link = event.target.closest('a[href]');
      if (link && !link.target && !link.getAttribute('href').startsWith('#') && (pendiente || subiendo) && !window.confirm('Tienes cambios sin guardar. ¿Salir del editor?')) { event.preventDefault(); event.stopPropagation(); }
    }
    window.addEventListener('beforeunload', avisar);
    document.addEventListener('click', navegar, true);
    return () => { window.removeEventListener('beforeunload', avisar); document.removeEventListener('click', navegar, true); };
  }, [pendiente, subiendo]);
  useEffect(() => {
    const enfocarAjustesPortada = () => {
      setTextoPortadaSeleccionado(true);
      setPanelAbierto(true);
      setSeccionActiva("diseno");
      requestAnimationFrame(() => {
        document.getElementById("editor-diseno")?.setAttribute("open", "");
        ajustesPortadaRef.current?.focus({ preventScroll: false });
        ajustesPortadaRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    };
    const ocultarAjustesPortada = () => setTextoPortadaSeleccionado(false);
    document.addEventListener("invito:seleccionar-texto-portada", enfocarAjustesPortada);
    document.addEventListener("invito:deseleccionar-texto-portada", ocultarAjustesPortada);
    return () => {
      document.removeEventListener("invito:seleccionar-texto-portada", enfocarAjustesPortada);
      document.removeEventListener("invito:deseleccionar-texto-portada", ocultarAjustesPortada);
    };
  }, []);
  const supabase = createClient();
  const fotos = Array.isArray(configuracion.bibliotecaFotos || configuracion.galeria)
    ? (configuracion.bibliotecaFotos || configuracion.galeria)
    : [];
  const ceremonia = configuracion.ceremonia || {};
  const recepcion = configuracion.recepcion || {};
  const itinerario = Array.isArray(configuracion.itinerario)
    ? configuracion.itinerario
    : [];
  const regalos = configuracion.regalos || {};
  const vestimenta = configuracion.vestimenta || {};
  const textoPortada = ajusteTextoPortada(configuracion);
  const textoPortadaGuardable = {
    x: textoPortada.x,
    y: textoPortada.y,
    escala: textoPortada.escala,
    rotacion: textoPortada.rotacion,
    interlineado: textoPortada.interlineado,
    separacionCaracteres: textoPortada.separacionCaracteres,
    color: textoPortada.color,
    efecto: textoPortada.efecto,
  };
  const familiaPaleta = familiasPaleta.find(
    (familia) => familia.id === familiaPaletaActiva,
  ) || familiasPaleta[0];

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
    if (configuracion.vestimenta?.pinterestUrl && !pinterestUrl(configuracion.vestimenta.pinterestUrl)) { setMensaje('Usa un enlace HTTPS válido de Pinterest o pin.it.'); return false; }
    const transferencia = configuracion.regalos?.transferencia;
    if (transferencia?.activa && (!transferencia.titular?.trim() || !transferencia.banco?.trim() || !validClabe(transferencia.clabe || ''))) { setMensaje('Completa titular, banco y una CLABE válida de 18 dígitos.'); return false; }
    if (!nombreEvento.trim()) { setMensaje('Escribe el nombre del evento.'); return false; }
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
      fechaHora: fecha ? `${fecha}${hora}` : null,
    };

    try {
      const { error } = await supabase.rpc("guardar_editor_evento", {
        evento_id_input: eventoId, nombre_input: nombreEvento,
        fecha_input: fecha || null, configuracion_input: nuevaConfiguracion,
        configuracion_anterior: base,
      });
      if (error) throw error;
      setConfiguracion(nuevaConfiguracion);
      setBase(nuevaConfiguracion);
      setGuardado(JSON.stringify([nombreEvento, fecha, nuevaConfiguracion, nombres]));
      setMensaje("Cambios guardados. Ya puedes revisar la vista previa.");
      router.refresh();
      return true;
    } catch (error) { setMensaje(error.message || "No pudimos guardar. Revisa tu conexión."); }
    finally { setGuardando(false); }
    return false;
  }

  const datosPreview = {
    evento_nombre: nombreEvento,
    configuracion,
    plantilla: eventoInicial.plantilla,
    modulos_activos: eventoInicial.modulos_activos,
    nombre: "Invitado de muestra",
    acompanantes: 1,
    estado: "pendiente",
  };

  const seleccionarSeccion = (seccion, { enfocarPestana = false } = {}) => {
    setPanelAbierto(true);
    setSeccionActiva(seccion);
    requestAnimationFrame(() => {
      const detalle = document.getElementById(`editor-${seccion}`);
      if (detalle) detalle.open = true;
      if (enfocarPestana) {
        document.querySelector(`[data-editor-tab="${seccion}"]`)?.focus({ preventScroll: true });
      }
    });
  };
  const seleccionarTextoVistaPrevia = (event) => {
    const objetivo = event.target instanceof Element ? event.target : null;
    if (!objetivo || objetivo.closest("button, a, input, select, textarea, label")) return;
    if (!objetivo.closest("p, h1, h2, h3, h4, h5, h6, span, strong, em, small, li, address")) return;

    const seccionMarcada = objetivo.closest("[data-editor-section]")?.dataset.editorSection;
    const identificador = objetivo.closest("[id]")?.id || "";
    const seccionPorId = identificador.includes("galeria")
      ? "fotos"
      : /ceremonia|recepcion|lugar|itinerario/.test(identificador)
        ? "evento"
        : /vestimenta|regalos/.test(identificador)
          ? "detalles"
          : /mensaje|cuenta/.test(identificador)
            ? "informacion"
            : null;
    const seccion = seccionMarcada || seccionPorId;
    if (seccion) seleccionarSeccion(seccion, { enfocarPestana: true });
  };
  const minimizarDesdeVistaPrevia = (event) => {
    if (event.target.closest("button, a, input, select, textarea, label")) return;
    setPanelAbierto(false);
  };
  const abrirVistaPublica = async (event) => {
    event.preventDefault();
    if (pendiente && !(await guardar())) {
      setPanelAbierto(true);
      return;
    }
    const destino = new URL(event.currentTarget.href);
    destino.searchParams.set("actualizado", String(Date.now()));
    window.location.assign(destino.href);
  };
  const seccionesEditor = [['informacion', 'Información'], ['diseno', 'Diseño'], ['fotos', 'Fotos'], ['evento', 'Evento'], ['detalles', 'Detalles']];
  const vistaPreviaHref = `/preview/${slug}?plantilla=${encodeURIComponent(eventoInicial.plantilla)}`;
  const enlacesDashboard = esMuestra
    ? [["Plantillas y muestras", "/admin/muestras"], ["Ver invitación", vistaPreviaHref]]
    : [["Resumen", `/dashboard/${slug}`], ["Invitados", `/dashboard/${slug}/invitados`], ["Mesas", `/dashboard/${slug}/mesas`], ["Equipo y accesos", `/dashboard/${slug}/equipo`], ["Registrar accesos", `/checkin/${slug}`], ["Ver invitación", vistaPreviaHref]];

  return (
    <div className={styles.editor}>
      <section onPointerDown={minimizarDesdeVistaPrevia} onClick={seleccionarTextoVistaPrevia} className={`${styles.preview} ${seccionActiva === "diseno" && panelAbierto ? styles.designPreview : ""}`} aria-label="Vista previa en vivo de la invitación">
        <button type="button" className={styles.dashboardMenu} onClick={() => setMenuNavegacionAbierto((abierto) => !abierto)} aria-expanded={menuNavegacionAbierto} aria-controls="navegacion-dashboard" aria-label="Abrir navegación del dashboard">☰</button>
        {menuNavegacionAbierto && <nav id="navegacion-dashboard" className={styles.dashboardMenuList} aria-label="Navegación del dashboard">
          {enlacesDashboard.map(([etiqueta, href]) => <Link key={href} href={href} prefetch={etiqueta === "Ver invitación" ? false : undefined} onClick={etiqueta === "Ver invitación" ? abrirVistaPublica : undefined}>{etiqueta}</Link>)}
        </nav>}
        <div className={styles.previewViewport}>
          <Invitacion datos={datosPreview} editorPreview onPortadaTextoChange={(cambios) => actualizarSeccion("portada", "texto", { ...textoPortadaGuardable, ...cambios })} />
        </div>
      </section>

      <section className={`${styles.panel} ${panelAbierto ? "" : styles.compact} ${seccionActiva === "diseno" ? styles.designPanel : ""}`} aria-label="Panel de edición">
        <div
          className={styles.panelHandle}
          onTouchStart={(event) => { inicioArrastrePanel.current = event.touches[0]?.clientY ?? null; }}
          onTouchEnd={(event) => {
            const inicio = inicioArrastrePanel.current;
            const final = event.changedTouches[0]?.clientY;
            inicioArrastrePanel.current = null;
            if (inicio === null || final === undefined || Math.abs(final - inicio) < 30) return;
            setPanelAbierto(final < inicio);
          }}
        >
          <span className={styles.grip} aria-hidden="true" />
          <span className={styles.panelHeading}>
            <strong>Editar invitación</strong>
            <button type="button" className={styles.panelToggle} onClick={() => setPanelAbierto((abierto) => !abierto)} aria-expanded={panelAbierto} aria-controls="panel-edicion">{panelAbierto ? seccionActiva === "diseno" ? "Ver portada" : "Minimizar" : "Editar"}</button>
          </span>
        </div>
        <div id="panel-edicion" className={styles.panelBody}>
          <nav className={styles.sectionTabs} aria-label="Secciones de edición">
            {seccionesEditor.map(([id, etiqueta]) => (
              <button key={id} type="button" data-editor-tab={id} onClick={() => seleccionarSeccion(id)} aria-pressed={seccionActiva === id}>{etiqueta}</button>
            ))}
          </nav>
      <div className="editor-savebar flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <p className="text-xs text-gray-500">{pendiente ? "Cambios sin guardar" : "Todo guardado"}</p>
        <button
          type="button"
          onClick={guardar}
          disabled={guardando || subiendo}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
        {mensaje && <p className="w-full text-sm text-gray-700" role="status">{mensaje}</p>}
      </div>

      <fieldset disabled={guardando || subiendo} className="space-y-3">
        <details id="editor-informacion" className={`rounded border border-gray-200 p-4 ${styles.mobileSection} ${seccionActiva === "informacion" ? styles.mobileSectionActive : ""}`}
          open
        >
          <summary className={`cursor-pointer font-semibold text-gray-800 ${styles.sectionSummary}`}>
            Información principal
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Tipo de celebración
              <select className={inputClass} value={tipoCelebracion(configuracion, eventoInicial.plantilla)} onChange={event => actualizarCampo("tipoEvento", event.target.value)}>
                <option value="xv">XV años</option>
                <option value="boda">Boda</option>
                <option value="otro">Otra celebración</option>
              </select>
              <span className="text-xs text-gray-500">Elige el evento sin cambiar de plantilla.</span>
            </label>
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

        <details id="editor-diseno" className={`rounded border border-gray-200 p-4 ${styles.mobileSection} ${seccionActiva === "diseno" ? styles.mobileSectionActive : ""}`}>
          <summary className={`cursor-pointer font-semibold text-gray-800 ${styles.sectionSummary}`}>
            Diseño
          </summary>
          <div className="mt-4 space-y-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700" role="note">
              <strong className="block text-gray-900">↕ Mueve el texto de portada</strong>
              <span className="mt-1 block text-xs">Toca y arrastra el título directamente en la previsualización. Al soltarlo aparecerán sus ajustes de color, efecto, tamaño y rotación.</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Paleta de color</h3>
              <p className="mt-1 text-xs text-gray-500">Elige una combinación completa: fondo, texto, recuadros y acentos se ajustan juntos para conservar un diseño armonioso y legible.</p>
            </div>
            <label className="block text-sm font-medium text-gray-700">
              Familia de color
              <select className={inputClass} value={familiaPaleta.id} onChange={(event) => setFamiliaPaletaActiva(event.target.value)}>
                {familiasPaleta.map((familia) => <option key={familia.id} value={familia.id}>{familia.nombre} · {familia.descripcion}</option>)}
              </select>
            </label>
            <section aria-labelledby="variantes-paleta">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h4 id="variantes-paleta" className="text-sm font-medium text-gray-800">Variantes de {familiaPaleta.nombre}</h4>
                <span className="text-xs text-gray-500">{familiaPaleta.descripcion}</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {familiaPaleta.variantes.map((variante) => {
                  const id = `${familiaPaleta.id}:${variante.id}`;
                  const seleccionada = configuracion.tema?.paleta === id;
                  return <button key={id} type="button" onClick={() => actualizarSeccion("tema", "paleta", id)} aria-pressed={seleccionada} className={`flex min-h-16 items-center gap-3 rounded-lg border p-2 text-left transition ${seleccionada ? "border-gray-900 ring-2 ring-gray-300" : "border-gray-200 hover:border-gray-400"}`}>
                    <span className="flex overflow-hidden rounded-full border border-black/10" aria-hidden="true">{variante.colores.map((color) => <i key={color} className="block h-8 w-5" style={{ backgroundColor: color }} />)}</span>
                    <span><strong className="block text-sm text-gray-800">{variante.nombre}</strong><small className="text-xs text-gray-500">{familiaPaleta.nombre}</small></span>
                  </button>;
                })}
              </div>
            </section>
            <button type="button" className="text-sm underline text-gray-700" onClick={() => actualizarSeccion("tema", "paleta", null)}>Restablecer los colores originales de la plantilla</button>
            <section className="border-t border-gray-200 pt-6" aria-labelledby="tipografias">
              <h3 id="tipografias" className="text-sm font-semibold text-gray-800">Tipografía</h3>
              <p className="mt-1 text-xs text-gray-500">Elige el estilo para los títulos, firmas y textos de toda tu invitación. La opción editorial usa caligrafía en títulos y serif en el cuerpo.</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {familiasTipografia.map((familia) => {
                  const seleccionada = (configuracion.tema?.tipografia || "clasica") === familia.id;
                  return <button key={familia.id} type="button" onClick={() => actualizarSeccion("tema", "tipografia", familia.id)} aria-pressed={seleccionada} className={`grid h-44 grid-rows-[auto_3.75rem_auto_1fr] overflow-hidden rounded-lg border p-3 text-left transition ${seleccionada ? "border-gray-900 ring-2 ring-gray-300" : "border-gray-200 hover:border-gray-400"}`}>
                    <strong className="block text-sm text-gray-800">{familia.nombre}</strong>
                    <span className="mt-2 block overflow-hidden text-xl leading-tight text-gray-800" style={{ ...familia.variables, fontFamily: "var(--font-display)" }}>{familia.muestraTitulo}</span>
                    <span className="block text-xs text-gray-600" style={{ ...familia.variables, fontFamily: "var(--font-text)" }}>{familia.muestraTexto}</span>
                    <small className="mt-auto block pt-2 text-xs text-gray-500">{familia.descripcion}</small>
                  </button>;
                })}
              </div>
            </section>
            {textoPortadaSeleccionado && <section ref={ajustesPortadaRef} data-portada-controls tabIndex={-1} className="border-t border-gray-200 pt-6 outline-none" aria-labelledby="ajuste-portada">
              <h3 id="ajuste-portada" className="text-sm font-semibold text-gray-800">Ajustar texto de portada</h3>
              <p className="mt-1 text-xs text-gray-500">Arrastra el título directamente con mouse o touch para moverlo. Al soltarlo, estos controles reciben el foco.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">Color del texto
                  <input className="mt-2 block h-10 w-full cursor-pointer rounded border border-gray-300 bg-white p-1" type="color" value={textoPortada.color || "#ffffff"} onChange={(event) => actualizarSeccion("portada", "texto", { ...textoPortadaGuardable, color: event.target.value })} />
                </label>
                <label className="block text-sm font-medium text-gray-700">Efecto para resaltar
                  <select className={inputClass} value={textoPortada.efecto} onChange={(event) => actualizarSeccion("portada", "texto", { ...textoPortadaGuardable, efecto: event.target.value })}>
                    <option value="sombra">Sombra suave</option>
                    <option value="resplandor">Resplandor</option>
                    <option value="contorno">Contorno oscuro</option>
                    <option value="ninguno">Sin efecto</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-gray-700">Tamaño
                  <input className="mt-2 w-full accent-gray-900" type="range" min="40" max="300" step="1" value={textoPortada.escala} onChange={(event) => actualizarSeccion("portada", "texto", { ...textoPortadaGuardable, escala: Number(event.target.value) })} />
                  <span className="mt-1 block text-xs font-normal text-gray-500">{textoPortada.escala}%</span>
                </label>
                <label className="block text-sm font-medium text-gray-700">Rotación
                  <input className="mt-2 w-full accent-gray-900" type="range" min="-90" max="90" step="1" value={textoPortada.rotacion} onChange={(event) => actualizarSeccion("portada", "texto", { ...textoPortadaGuardable, rotacion: Number(event.target.value) })} />
                  <span className="mt-1 block text-xs font-normal text-gray-500">{textoPortada.rotacion}°</span>
                </label>
                <label className="block text-sm font-medium text-gray-700">Interlineado
                  <input className="mt-2 w-full accent-gray-900" type="range" min="0.7" max="2" step="0.05" value={textoPortada.interlineado} onChange={(event) => actualizarSeccion("portada", "texto", { ...textoPortadaGuardable, interlineado: Number(event.target.value) })} />
                  <span className="mt-1 block text-xs font-normal text-gray-500">{textoPortada.interlineado.toFixed(2)}</span>
                </label>
                <label className="block text-sm font-medium text-gray-700">Separación de caracteres
                  <input className="mt-2 w-full accent-gray-900" type="range" min="-0.1" max="0.5" step="0.01" value={textoPortada.separacionCaracteres} onChange={(event) => actualizarSeccion("portada", "texto", { ...textoPortadaGuardable, separacionCaracteres: Number(event.target.value) })} />
                  <span className="mt-1 block text-xs font-normal text-gray-500">{textoPortada.separacionCaracteres.toFixed(2)} em</span>
                </label>
              </div>
              <button type="button" className="mt-4 text-sm underline text-gray-700" onClick={() => actualizarSeccion("portada", "texto", null)}>Restablecer ajustes del texto</button>
            </section>}
          </div>
        </details>

        <details id="editor-fotos" className={`rounded border border-gray-200 p-4 ${styles.mobileSection} ${seccionActiva === "fotos" ? styles.mobileSectionActive : ""}`}>
          <summary className={`cursor-pointer font-semibold text-gray-800 ${styles.sectionSummary}`}>
            Fotos
          </summary>
          <div className="mt-4 space-y-6">
            <GaleriaManager eventoId={eventoId} configuracion={configuracion} onChange={setConfiguracion} onBusy={setSubiendo} />
            <label className="block text-sm">Encuadre de portada
              <select value={configuracion.encuadrePortada || "center"} onChange={e=>actualizarCampo("encuadrePortada",e.target.value)} className={inputClass}>
                <option value="center">Centrado</option><option value="center top">Arriba</option><option value="center bottom">Abajo</option><option value="left center">Izquierda</option><option value="right center">Derecha</option>
              </select>
            </label>
            {configuracion.fotoPortada && <img src={configuracion.fotoPortada} alt="Vista previa del encuadre de portada" className="h-64 w-44 rounded-xl object-cover" style={{objectPosition: configuracion.encuadrePortada || "center"}} />}
            <SelectorFoto
              label="Foto de portada"
              value={configuracion.fotoPortada || null}
              fotos={fotos}
              onChange={(foto) => actualizarCampo("fotoPortada", foto)}
            />
            <Campo
              label="Video animado de portada (opcional)"
              value={configuracion.videoPortada || ""}
              onChange={(valor) => actualizarCampo("videoPortada", valor)}
              placeholder="https://.../retrato-animado.mp4"
            />
            <p className="-mt-4 text-xs text-gray-500">En Crónica encantada, este video sustituye la foto de portada. Usa un MP4 vertical, corto y sin audio.</p>
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

        <details id="editor-evento" className={`rounded border border-gray-200 p-4 ${styles.mobileSection} ${seccionActiva === "evento" ? styles.mobileSectionActive : ""}`}>
          <summary className={`cursor-pointer font-semibold text-gray-800 ${styles.sectionSummary}`}>
            Ceremonia y recepción
          </summary>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-700">Ceremonia</h3>
            </div>
            <Campo
              label="Hora"
              type="time"
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
              type="time"
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
            <ItinerarioEditor
              items={itinerario}
              onChange={(items) => actualizarCampo("itinerario", items)}
            />
          </div>
        </details>

        <details id="editor-detalles" className={`rounded border border-gray-200 p-4 ${styles.mobileSection} ${seccionActiva === "detalles" ? styles.mobileSectionActive : ""}`}>
          <summary className={`cursor-pointer font-semibold text-gray-800 ${styles.sectionSummary}`}>
            Detalles adicionales
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
            <Campo label="Tablero de Pinterest (opcional)" value={vestimenta.pinterestUrl} onChange={valor=>actualizarSeccion("vestimenta", "pinterestUrl", valor)} placeholder="https://www.pinterest.com/..." />
            <p className="helper md:col-span-2">Usa un tablero público para que tus invitados puedan consultar la inspiración.</p>
            <Textarea
              label="Mensaje de regalos"
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
            <div className="md:col-span-2 gift-editor">
              <h3>Regalos por transferencia</h3>
              <label><input type="checkbox" checked={!!regalos.transferencia?.activa} onChange={e=>actualizarSeccion("regalos","transferencia",{...regalos.transferencia,activa:e.target.checked})} /> Mostrar datos bancarios en la invitación</label>
              <p className="helper">Estos datos serán visibles para quienes puedan acceder a tu invitación. Invito no procesa ni confirma transferencias.</p>
              {regalos.transferencia?.activa && <div className="grid gap-4 md:grid-cols-2">
                {[['titular','Titular'],['banco','Banco'],['clabe','CLABE de 18 dígitos']].map(([key,label])=><Campo key={key} label={label} value={regalos.transferencia?.[key]} onChange={v=>actualizarSeccion("regalos","transferencia",{...regalos.transferencia,[key]:key==='clabe'?v.replace(/\s/g,''):v})} />)}
              </div>}
              <label><input type="checkbox" checked={!!regalos.sobres} onChange={e=>actualizarSeccion("regalos","sobres",e.target.checked)} /> Ofrecer lluvia de sobres el día del evento</label>
            </div>
          </div>
        </details>
      </fieldset>
        </div>
      </section>
    </div>
  );
}
