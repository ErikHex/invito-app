"use client";

import { useState } from "react";

export default function SeleccionarContacto({ onSelect, disabled = false }) {
  const [abriendo, setAbriendo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [contacto, setContacto] = useState(null);

  function usar(nombre, telefono) {
    onSelect({ nombre, telefono });
    setContacto(null);
    setMensaje("Número agregado. Revisa el país y el número antes de guardar.");
  }

  async function elegir() {
    setMensaje("");
    setContacto(null);
    if (!window.isSecureContext || typeof navigator.contacts?.select !== "function") {
      setMensaje("Este navegador no permite elegir contactos. Copia el número desde la agenda de tu teléfono y pégalo en el campo de teléfono.");
      return;
    }
    setAbriendo(true);
    try {
      // Call directly from the click to preserve the required user activation.
      const seleccion = await navigator.contacts.select(["name", "tel"], { multiple: false });
      const elegido = seleccion[0];
      if (!elegido) return;
      const numeros = [...new Set((elegido.tel || []).filter(n => typeof n === "string").map(n => n.trim()).filter(Boolean))];
      const nombre = elegido.name?.find(n => typeof n === "string" && n.trim())?.trim() || "";
      if (!numeros.length) {
        setMensaje("No se compartió un número de teléfono. Elige otro contacto o escríbelo manualmente.");
      } else if (numeros.length === 1) {
        usar(nombre, numeros[0]);
      } else {
        setContacto({ nombre, numeros });
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setMensaje("No pudimos abrir tus contactos. Puedes intentar de nuevo o pegar el número manualmente.");
      }
    } finally {
      setAbriendo(false);
    }
  }

  return (
    <div className="contact-picker">
      <div className="row-actions">
        <button type="button" disabled={disabled || abriendo} onClick={elegir}>
          {abriendo ? "Abriendo contactos…" : "Elegir de mis contactos"}
        </button>
      </div>
      {contacto && (
        <label>
          Elige el número de {contacto.nombre || "este contacto"}
          <select value="" disabled={disabled} onChange={event => {
            if (event.target.value) usar(contacto.nombre, event.target.value);
          }}>
            <option value="">Seleccionar número</option>
            {contacto.numeros.map(numero => <option key={numero} value={numero}>{numero}</option>)}
          </select>
        </label>
      )}
      {mensaje && <p className="helper" role="status">{mensaje}</p>}
    </div>
  );
}
