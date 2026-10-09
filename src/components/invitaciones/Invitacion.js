"use client";

import { colorValido, temaInvitacion } from "@/lib/invitation-theme";
import { tipografiaInvitacion } from "@/lib/invitation-fonts";
import { useState } from "react";
import SobreAnimado from "./compartidos/SobreAnimado";
import Musica from "./compartidos/Musica";
import { plantillas } from "./plantillas/registro";

export default function Invitacion({
  datos,
  preview = false,
  editorPreview = false,
  onPortadaTextoChange,
}) {
  const [abierta, setAbierta] = useState(
    editorPreview || datos.modulos_activos?.sobre === false,
  );
  const [estado, setEstado] = useState(datos.estado);
  const cfg = datos.configuracion || {};
  const Plantilla = Object.hasOwn(plantillas, datos.plantilla)
    ? plantillas[datos.plantilla]
    : plantillas.editorial;
  const tema = cfg.tema || {};
  const colorFondo = "#292927";
  const colorClaro = tema.colorClaro || "#F6F1E7";
  const temaResuelto = temaInvitacion(cfg, datos.plantilla);
  const tipografia = tipografiaInvitacion(cfg);
  const { principal: colorAcento, texto: colorTextoAcento } = temaResuelto;

  return (
    <div
      className="invitation-shell"
      style={{
        color: colorClaro,
        "--event-primary": colorAcento,
        "--event-accent-text": colorTextoAcento,
        "--event-panel-background": temaResuelto.fondoPanel,
        "--event-panel-text": temaResuelto.textoPanel,
        ...tipografia.variables,
        ...(temaResuelto.fondo
          ? {
              "--event-background": temaResuelto.fondo,
              "--event-text": temaResuelto.textoPrincipal,
              "--event-muted": `color-mix(in srgb, ${temaResuelto.textoPrincipal} 88%, ${temaResuelto.fondo})`,
              "--event-surface": `color-mix(in srgb, ${temaResuelto.fondo} 96%, ${temaResuelto.textoPrincipal})`,
              "--event-surface-soft": `color-mix(in srgb, ${temaResuelto.fondo} 98%, ${temaResuelto.textoPrincipal})`,
              "--event-border": `color-mix(in srgb, ${temaResuelto.textoPrincipal} 32%, transparent)`,
            }
          : {}),
      }}
    >
      {!abierta && (
        <SobreAnimado
          personalizarColor={colorValido(tema.colorAcento)}
          variante={
            datos.plantilla === "cronica_encantada"
              ? "cronica"
              : datos.plantilla === "aura_xv"
                ? "aura"
                : datos.plantilla === "jardin_romantico"
                  ? "jardin"
                  : undefined
          }
          nombreInvitado={datos.nombre}
          colorFondo={colorFondo}
          colorAcento={colorAcento}
          onAbrir={() => setAbierta(true)}
        />
      )}

      {abierta && !editorPreview && datos.modulos_activos?.musica !== false && (
        <Musica
          url={cfg.musicaUrl}
          reproducir={abierta}
        />
      )}

      {abierta && (
        <Plantilla
          datos={datos}
          estado={estado}
          onEstadoChange={setEstado}
          preview={preview}
          colorFondo={colorFondo}
          colorClaro={colorClaro}
          colorAcento={colorAcento}
          editorPreview={editorPreview}
          onPortadaTextoChange={onPortadaTextoChange}
        />
      )}
    </div>
  );
}
