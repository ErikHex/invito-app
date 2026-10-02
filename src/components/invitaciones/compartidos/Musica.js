"use client";

import { useEffect, useRef, useState } from "react";

export default function Musica({ url, reproducir }) {
  const audioRef = useRef(null);
  const [reproduciendo, setReproduciendo] = useState(false);

  useEffect(() => {
    if (reproducir && audioRef.current) {
      audioRef.current
        .play()
        .then(() => setReproduciendo(true))
        .catch(() => setReproduciendo(false));
    }
  }, [reproducir]);

  if (!url) return null;

  const cambiarReproduccion = () => {
    if (!audioRef.current) return;
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
        aria-pressed={reproduciendo}
        aria-label={reproduciendo ? "Pausar música" : "Reanudar música"}
      >
        <span aria-hidden="true">{reproduciendo ? "♫" : "▶"}</span>
        {reproduciendo ? "Pausar música" : "Reanudar música"}
      </button>
    </>
  );
}
