"use client";

import { useState } from "react";
import SobreAnimado from "./SobreAnimado";
import Musica from "./Musica";
import Hero from "./Hero";
import CuentaRegresiva from "./CuentaRegresiva";
import Galeria from "./Galeria";
import Itinerario from "./Itinerario";
import RsvpForm from "./RsvpForm";
import QrCode from "./QrCode";

export default function Invitacion({ datos }) {
  const [abierta, setAbierta] = useState(false);
  const cfg = datos.configuracion || {};
  const tema = cfg.tema || {};
  const colorFondo = tema.colorFondo || "#1F2E24";
  const colorClaro = tema.colorClaro || "#F6F1E7";
  const colorAcento = tema.colorAcento || "#C9A24B";

  return (
    <div style={{ backgroundColor: colorFondo, color: colorClaro }}>
      {!abierta && (
        <SobreAnimado
          nombreInvitado={datos.nombre}
          colorFondo={colorFondo}
          colorAcento={colorAcento}
          onAbrir={() => setAbierta(true)}
        />
      )}

      <Musica
        url={cfg.musicaUrl}
        reproducir={abierta}
      />

      {abierta && (
        <>
          <Hero
            fotoPortada={cfg.fotoPortada}
            nombreEvento={datos.evento_nombre}
            nombreInvitado={datos.nombre}
            mensajeBase={cfg.mensajeBase}
          />
          <CuentaRegresiva
            fechaHora={cfg.fechaHora}
            colorAcento={colorAcento}
            colorTexto={colorClaro}
          />
          <Galeria
            fotos={cfg.galeria}
            colorFondo={colorFondo}
          />
          <Itinerario
            items={cfg.itinerario}
            colorAcento={colorAcento}
            colorTexto={colorClaro}
          />

          <div
            className="py-16 px-6 rounded-t-3xl"
            style={{ backgroundColor: colorClaro, color: colorFondo }}
          >
            {datos.mesa_nombre && (
              <p className="text-center mb-4">
                Tu mesa: <strong>{datos.mesa_nombre}</strong>
              </p>
            )}
            <p className="text-center mb-6">
              Boletos disponibles: {Number(datos.acompanantes) + 1}
            </p>
            <RsvpForm invitado={datos} />
            {datos.estado === "confirmado" && <QrCode token={datos.token} />}
          </div>
        </>
      )}
    </div>
  );
}
