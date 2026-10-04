"use client";

import { colorValido, temaInvitacion } from "@/lib/invitation-theme";
import { useState } from "react";
import SobreAnimado from "./compartidos/SobreAnimado";
import Musica from "./compartidos/Musica";
import { plantillas } from "./plantillas/registro";

export default function Invitacion({ datos, preview = false }) {
  const [abierta, setAbierta] = useState(
    datos.modulos_activos?.sobre === false,
  );
  const [estado, setEstado] = useState(datos.estado);
  const cfg = datos.configuracion || {};
  const Plantilla = Object.hasOwn(plantillas, datos.plantilla)
    ? plantillas[datos.plantilla]
    : plantillas.editorial;
  const tema = cfg.tema || {};
  const colorFondo = "#292927";
  const colorClaro = tema.colorClaro || "#F6F1E7";
  const { principal: colorAcento, texto: colorTextoAcento } = temaInvitacion(
    cfg,
    datos.plantilla,
  );

  return (
    <div
      className="invitation-shell"
      style={{
        color: colorClaro,
        "--event-primary": colorAcento,
        "--event-accent-text": colorTextoAcento,
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

      {abierta && datos.modulos_activos?.musica !== false && (
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
        />
      )}
    </div>
  );
}
