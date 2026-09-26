"use client";

import { useRef, useEffect } from "react";

export default function Musica({ url, reproducir }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (reproducir && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [reproducir]);

  if (!url) return null;

  return (
    <audio
      ref={audioRef}
      src={url}
      loop
    />
  );
}
