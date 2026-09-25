"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { createClient } from "@/lib/supabase/client";

export default function CheckinScanner({ eventoId }) {
  const [resultado, setResultado] = useState(null);
  const [errorCamara, setErrorCamara] = useState("");
  const scannerRef = useRef(null);
  const supabase = createClient();

  useEffect(() => {
    const scanner = new Html5Qrcode("lector-qr");
    scannerRef.current = scanner;
    let isMounted = true;
    async function onScanSuccess(token) {
      scanner.pause();
      const { data, error } = await supabase
        .rpc("hacer_checkin", { token_input: token, evento_id_input: eventoId })
        .single();
      if (!isMounted) return;
      if (error || !data) {
        setResultado({ tipo: "error", mensaje: "QR no válido para este evento" });
      } else if (data.ya_registrado) {
        setResultado({ tipo: "advertencia", mensaje: `${data.nombre} ya hizo check-in anteriormente` });
      } else {
        setResultado({ tipo: "exito", nombre: data.nombre, mesa: data.mesa_nombre || "Sin mesa asignada", acompanantes: data.acompanantes });
      }
    }

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        onScanSuccess,
      )
      .then(() => {
        if (!isMounted) scanner.stop().catch(() => {});
      })
      .catch(() => {
        if (isMounted) setErrorCamara("No se pudo abrir la cámara. Revisa el permiso e intenta recargar la página.");
      });

    return () => {
      isMounted = false;
      const s = scannerRef.current;
      if (s && s.getState() === 2 /* SCANNING */) {
        s.stop().catch(() => {});
      }
    };
  }, [eventoId, supabase]);

  function continuarEscaneando() {
    setResultado(null);
    scannerRef.current.resume();
  }

  return (
    <div className="max-w-sm mx-auto">
      <div
        id="lector-qr"
        className="rounded-lg overflow-hidden"
      ></div>
      {errorCamara && <p role="alert" className="mt-4 text-red-600">{errorCamara}</p>}

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
