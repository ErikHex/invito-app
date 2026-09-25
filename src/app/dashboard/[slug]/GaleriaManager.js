"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GaleriaManager({ eventoId, fotosIniciales }) {
  const [fotos, setFotos] = useState(fotosIniciales || []);
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef(null);
  const supabase = createClient();

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendo(true);

    const nombreArchivo = `${eventoId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("fotos_eventos")
      .upload(nombreArchivo, file);

    if (uploadError) {
      alert("Error al subir la foto");
      setSubiendo(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("fotos_eventos")
      .getPublicUrl(nombreArchivo);

    const url = urlData.publicUrl;

    const { error: rpcError } = await supabase.rpc("agregar_foto_galeria", {
      evento_id_input: eventoId,
      foto_url: url,
    });

    if (!rpcError) {
      setFotos((prev) => [...prev, url]);
    } else {
      alert("La foto se subió pero no se pudo guardar en la galería");
    }

    setSubiendo(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="font-semibold text-gray-800 mb-3">Galería</h3>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={subiendo}
        className="mb-4 text-sm"
      />
      {subiendo && <p className="text-sm text-gray-500">Subiendo...</p>}
      <div className="flex flex-wrap gap-3">
        {fotos.map((url, i) => (
          <img
            key={i}
            src={url}
            alt=""
            className="w-20 h-20 object-cover rounded"
          />
        ))}
      </div>
    </div>
  );
}
