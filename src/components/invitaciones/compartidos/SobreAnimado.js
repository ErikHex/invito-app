"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "./SobreAnimado.module.css";

export default function SobreAnimado({ nombreInvitado, onAbrir, variante }) {
  const [abriendo, setAbriendo] = useState(false);
  const iniciado = useRef(false);
  const sobre = useRef(null);
  const animacion = useRef(null);

  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflowAnterior;
      animacion.current?.revert();
    };
  }, []);

  function abrir() {
    if (iniciado.current) return;
    iniciado.current = true;
    setAbriendo(true);
    const reducirMovimiento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const elemento = sobre.current;
    const buscar = (clase) => elemento.querySelector(`.${clase}`);
    const sello = buscar(styles.seal);
    const solapa = buscar(styles.flapShadow);
    const carta = buscar(styles.letter);
    const bolsillo = buscar(styles.pocket);
    const textos = [buscar(styles.hint), buscar(styles.recipient)];

    // Una sola secuencia controla el final; no hay temporizadores desfasados.
    const secuencia = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: onAbrir,
    });
    animacion.current = secuencia;

    if (reducirMovimiento) {
      secuencia.to(elemento, { opacity: 0, duration: 0.15 });
      return;
    }

    secuencia
      .set([sello, solapa, carta, bolsillo], { willChange: "transform" })
      .to(textos, { opacity: 0, duration: 0.18 }, 0)
      .to(sello, { scale: 0.94, duration: 0.12 }, 0)
      .to(sello, {
        y: 36, rotation: -24, scale: 1.08, opacity: 0,
        duration: 0.32, ease: "power2.in",
      }, 0.12)
      .to(solapa, { rotationX: 175, duration: 0.85 }, 0.25)
      .to(carta, { yPercent: -14, duration: 0.85, ease: "power3.out" }, 0.7)
      .to(bolsillo, { yPercent: 24, duration: 0.8, ease: "power3.inOut" }, 0.85)
      .to(elemento, { opacity: 0, duration: 0.35 }, 1.4);
  }

  return (
    <div
      ref={sobre}
      className={`${styles.envelope} ${variante === "aura" ? styles.aura : ""} ${abriendo ? styles.opening : ""}`}
      aria-busy={abriendo}
    >
      <div
        className={styles.letter}
        aria-hidden="true"
      >
        <span>Con mucho cariño</span>
        <p>{nombreInvitado ? `Para ${nombreInvitado}` : "Para ti"}</p>
      </div>
      <div
        className={styles.pocket}
        aria-hidden="true"
      />
      <div
        className={styles.flapShadow}
        aria-hidden="true"
      >
        <div className={styles.flap}>
          <span>Ábreme</span>
        </div>
      </div>
      <button
        className={styles.trigger}
        onClick={abrir}
        aria-label={
          nombreInvitado
            ? `Abrir invitación para ${nombreInvitado}`
            : "Abrir invitación"
        }
        aria-disabled={abriendo}
      >
        <span
          className={styles.seal}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 100 100"
            fill="none"
          >
            <circle
              cx="50"
              cy="50"
              r="39"
            />
            {variante === "aura" ? <path d="M50 23C53 42 58 47 77 50C58 53 53 58 50 77C47 58 42 53 23 50C42 47 47 42 50 23Z" /> : <>
            <path d="M50 76C48 62 57 51 52 39M51 64C35 63 31 55 31 55C43 53 48 59 51 64ZM52 55C64 54 69 46 69 46C57 44 53 49 52 55Z" />
            <path d="M51 21C60 18 68 27 64 35C68 42 57 48 50 44C41 48 31 39 36 32C32 24 43 17 51 21ZM43 28C50 21 61 28 58 35C53 42 42 38 43 28ZM45 30C50 27 57 29 54 34C50 37 45 34 45 30Z" />
            </>}
          </svg>
        </span>
        <span className={styles.hint}>
          {abriendo ? "Abriendo tu invitación…" : "Toca el sello para abrir"}
        </span>
      </button>
      <p className={styles.recipient}>
        {nombreInvitado
          ? `Una invitación para ${nombreInvitado}`
          : "Una invitación especial para ti"}
      </p>
    </div>
  );
}
