"use client";

import { useEffect, useRef, useState } from "react";

export default function Musica({ url, reproducir }) {
  const audioRef = useRef(null);
  const [reproduciendo, setReproduciendo] = useState(false);

  useEffect(() => {
    if (reproducir && url && audioRef.current) {
      audioRef.current
        .play()
        .then(() => setReproduciendo(true))
        .catch(() => setReproduciendo(false));
    }
  }, [reproducir, url]);

  const cambiarReproduccion = () => {
    if (!url || !audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current
        .play()
        .then(() => setReproduciendo(true))
        .catch(() => setReproduciendo(false));
      return;
    }
    audioRef.current.pause();
    setReproduciendo(false);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={url}
        loop
        onPlay={() => setReproduciendo(true)}
        onPause={() => setReproduciendo(false)}
      />
      <button
        type="button"
        className="music-control"
        onClick={cambiarReproduccion}
        disabled={!url}
        aria-pressed={reproduciendo}
        aria-label={!url ? "Música no configurada" : reproduciendo ? "Pausar música" : "Reanudar música"}
      >
        <span aria-hidden="true">{reproduciendo ? "♫" : "▶"}</span>
        {!url ? "Música no configurada" : reproduciendo ? "Pausar música" : "Reanudar música"}
      </button>
    </>
  );
}
