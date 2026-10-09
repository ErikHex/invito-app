"use client";

import { useEffect, useRef } from "react";
import styles from "./TextoPortadaEditable.module.css";

const limitar = (valor, minimo, maximo) => Math.min(maximo, Math.max(minimo, valor));

export default function TextoPortadaEditable({
  as: Element = "h1",
  ajuste,
  children,
  className,
  editorPreview = false,
  onChange,
  style,
  ...props
}) {
  const gesto = useRef(null);
  const raiz = useRef(null);
  const editable = editorPreview && typeof onChange === "function";

  useEffect(() => {
    if (!editable) return undefined;
    const deseleccionar = (evento) => {
      if (!raiz.current?.contains(evento.target) && !evento.target.closest("[data-portada-controls]")) {
        document.dispatchEvent(new CustomEvent("invito:deseleccionar-texto-portada"));
      }
    };
    document.addEventListener("pointerdown", deseleccionar);
    return () => document.removeEventListener("pointerdown", deseleccionar);
  }, [editable]);

  function enfocarAjustes() {
    document.dispatchEvent(new CustomEvent("invito:seleccionar-texto-portada"));
  }

  function iniciar(evento) {
    if (!editable || (evento.button !== undefined && evento.button !== 0)) return;
    evento.preventDefault();
    const rect = raiz.current?.getBoundingClientRect();
    const contenedor = raiz.current?.closest("[data-portada-contenedor]");
    const rectContenedor = contenedor?.getBoundingClientRect();
    if (!rect) return;
    gesto.current = {
      x: evento.clientX,
      y: evento.clientY,
      ajuste,
      ancho: rectContenedor?.width || window.innerWidth,
    };
    raiz.current?.setPointerCapture?.(evento.pointerId);
  }

  function mover(evento) {
    const inicial = gesto.current;
    if (!inicial) return;
    onChange({
      x: limitar(inicial.ajuste.x + (evento.clientX - inicial.x) / inicial.ancho * 100, -150, 150),
      // The adjustment is rendered in cqw. Use the same reference for both
      // axes so the title lands exactly where the pointer is released.
      y: limitar(inicial.ajuste.y + (evento.clientY - inicial.y) / inicial.ancho * 100, -150, 150),
    });
  }

  function terminar() {
    if (gesto.current) enfocarAjustes();
    gesto.current = null;
  }

  return (
    <Element
      ref={raiz}
      {...props}
      className={`${className || ""} ${editable ? styles.editable : ""}`}
      style={{ ...style, ...(editable ? { touchAction: "none" } : {}) }}
      onPointerDown={iniciar}
      onPointerMove={mover}
      onPointerUp={terminar}
      onPointerCancel={terminar}
      onClick={() => { if (editable && !gesto.current) enfocarAjustes(); }}
    >
      {children}
    </Element>
  );
}
