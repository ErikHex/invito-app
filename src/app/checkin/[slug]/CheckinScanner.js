"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { createClient } from "@/lib/supabase/client";

export default function CheckinScanner({ eventoId }) {
  const [resultado, setResultado] = useState(null);
  const [escaneando, setEscaneando] = useState(false);
  const scannerRef = useRef(null);
  const containerRef = useRef(null);
  const [errorCamara, setErrorCamara] = useState("");
  const supabase = createClient();

  useEffect(() => {
    // Each effect owns its DOM element, including during Strict Mode cleanup.
    const element = document.createElement("div");
    element.id = `lector-${crypto.randomUUID()}`;
    containerRef.current.appendChild(element);
    const scanner = new Html5Qrcode(element.id);
    scannerRef.current = scanner;
    let disposed = false;
    let processing = false;

    async function onScanSuccess(token) {
      if (disposed || processing) return;
      processing = true;
      scanner.pause();
      try {
        const { data, error } = await supabase
          .rpc("hacer_checkin", { token_input: token, evento_id_input: eventoId })
          .single();
        if (disposed) return;
        if (error || !data) {
          setResultado({ tipo: "error", mensaje: "No se pudo registrar la entrada. Verifica el QR y tu conexión." });
        } else if (data.ya_registrado) {
          setResultado({ tipo: "advertencia", mensaje: `${data.nombre} ya hizo check-in anteriormente` });
        } else {
          setResultado({ tipo: "exito", nombre: data.nombre, mesa: data.mesa_nombre || "Sin mesa asignada", acompanantes: data.acompanantes });
        }
      } catch {
        if (!disposed) setResultado({ tipo: "error", mensaje: "No se pudo conectar. Intenta de nuevo." });
      } finally {
        processing = false;
      }
    }

    const starting = scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      onScanSuccess,
    ).then(() => {
      if (!disposed) setEscaneando(true);
    }).catch(() => {
      if (!disposed) setErrorCamara("No pudimos abrir la cámara. Revisa los permisos y vuelve a cargar la página.");
    });

    return () => {
      disposed = true;
      void starting.then(async () => {
        try {
          const state = scanner.getState();
          if (state === 2 || state === 3) await scanner.stop();
          scanner.clear();
        } finally {
          element.remove();
        }
      }).catch(() => {});
    };
  }, [eventoId, supabase]);

  function continuarEscaneando() {
    setResultado(null);
    scannerRef.current.resume();
  }

  return (
    <div className="max-w-sm mx-auto">
      <div
        ref={containerRef}
        className="rounded-lg overflow-hidden"
      ></div>

      {errorCamara && <p role="alert" className="text-red-600">{errorCamara}</p>}
      {!escaneando && !errorCamara && <p>Iniciando cámara...</p>}
      {resultado && (
        <div
          className={`mt-4 p-4 rounded-lg text-center ${
            resultado.tipo === "exito"
              ? "bg-green-100"
              : resultado.tipo === "advertencia"
                ? "bg-yellow-100"
                : "bg-red-100"
          }`}
        >
          {resultado.tipo === "exito" && (
            <>
              <p className="text-lg font-bold">{resultado.nombre}</p>
              <p className="text-purple-600">Mesa: {resultado.mesa}</p>
              <p className="text-gray-500 text-sm">
                Acompañantes: {resultado.acompanantes}
              </p>
            </>
          )}

          {resultado.tipo === "advertencia" && (
            <p className="text-yellow-700 font-semibold">{resultado.mensaje}</p>
          )}

          {resultado.tipo === "error" && (
            <p className="text-red-600 font-semibold">{resultado.mensaje}</p>
          )}

          <button
            onClick={continuarEscaneando}
            className="mt-3 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm"
          >
            Escanear siguiente
          </button>
        </div>
      )}
    </div>
  );
}
