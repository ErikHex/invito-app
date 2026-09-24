"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrCode({ token }) {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(token, { width: 200 }).then(setQrUrl);
  }, [token]);

  if (!qrUrl) return null;

  return (
    <div className="mt-6">
      <img
        src={qrUrl}
        alt="Código QR de tu invitación"
        className="mx-auto"
      />
      <p className="text-xs text-gray-400 mt-1">
        Presenta este código en la entrada
      </p>
    </div>
  );
}
