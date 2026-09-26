"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SobreAnimado.module.css";

export default function SobreAnimado({ nombreInvitado, onAbrir }) {
  const [abriendo, setAbriendo] = useState(false);
  const iniciado = useRef(false);
  const timer = useRef(null);

  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowAnterior;
      clearTimeout(timer.current);
    };
  }, []);

  function abrir() {
    if (iniciado.current) return;
    iniciado.current = true;
    setAbriendo(true);
    const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(onAbrir, reducirMovimiento ? 180 : 1900);
  }

  return (
    <div className={`${styles.envelope} ${abriendo ? styles.opening : ""}`}>
      <div className={styles.letter} aria-hidden="true">
        <span>Con mucho cariño</span>
        <p>{nombreInvitado ? `Para ${nombreInvitado}` : "Para ti"}</p>
      </div>
      <div className={styles.pocket} aria-hidden="true" />
      <div className={styles.flapShadow} aria-hidden="true">
        <div className={styles.flap}><span>Ábreme</span></div>
      </div>
      <button className={styles.trigger} onClick={abrir} aria-label={nombreInvitado ? `Abrir invitación para ${nombreInvitado}` : "Abrir invitación"} aria-disabled={abriendo}>
        <span className={styles.seal} aria-hidden="true">
          <svg viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="39" />
            <path d="M50 76C48 62 57 51 52 39M51 64C35 63 31 55 31 55C43 53 48 59 51 64ZM52 55C64 54 69 46 69 46C57 44 53 49 52 55Z" />
            <path d="M51 21C60 18 68 27 64 35C68 42 57 48 50 44C41 48 31 39 36 32C32 24 43 17 51 21ZM43 28C50 21 61 28 58 35C53 42 42 38 43 28ZM45 30C50 27 57 29 54 34C50 37 45 34 45 30Z" />
          </svg>
        </span>
        <span className={styles.hint}>{abriendo ? "Abriendo tu invitación…" : "Toca el sello para abrir"}</span>
      </button>
      <p className={styles.recipient}>{nombreInvitado ? `Una invitación para ${nombreInvitado}` : "Una invitación especial para ti"}</p>
    </div>
  );
}
