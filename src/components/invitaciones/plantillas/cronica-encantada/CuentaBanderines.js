'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import styles from './cuenta-banderines.module.css';

export default function CuentaBanderines({ fechaHora }) {
  const root = useRef(null);
  const [tiempo, setTiempo] = useState(null);
  useEffect(() => { if (!fechaHora) return undefined; const tick = () => { let ms = Math.max(0, new Date(fechaHora) - Date.now()); setTiempo({ dias: Math.floor(ms / 864e5), horas: Math.floor(ms % 864e5 / 36e5), min: Math.floor(ms % 36e5 / 6e4), seg: Math.floor(ms % 6e4 / 1e3), terminado: ms <= 0 }); }; tick(); const id = setInterval(tick, 1000); return () => clearInterval(id); }, [fechaHora]);
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const context = gsap.context(() => {
      gsap.utils.toArray(`.${styles.fabric}`).forEach((flag, index) => {
        gsap.to(flag, {
          rotation: index % 2 ? 2.1 : -2.1,
          x: index % 2 ? 2 : -2,
          duration: 2.7 + index * 0.23,
          delay: index * 0.16,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          transformOrigin: '50% 9px',
        });
      });
    }, root);
    return () => context.revert();
  }, []);
  const unidades = [['dias', 'días', 'rojo'], ['horas', 'horas', 'azul'], ['min', 'minutos', 'amarillo'], ['seg', 'segundos', 'verde']];
  return <><div ref={root} className={styles.countdown} role="timer">{unidades.map(([clave, etiqueta, color]) => <div key={clave} className={`${styles.flag} ${styles[color]}`}><div className={styles.fabric}><div className={styles.fabricInside}><span className={styles.hem} /><strong>{tiempo ? String(tiempo[clave]).padStart(2, '0') : '00'}</strong><span className={styles.label}>{etiqueta}</span></div></div></div>)}{tiempo?.terminado && <p className={styles.finished}>¡Llegó el día!</p>}</div><p style={{ margin:"16px 0 0", color:"#f8edcf", fontSize:18, fontStyle:"italic", textAlign:"center", textShadow:"0 2px 8px rgba(0,0,0,.55)" }}>{tiempo ? "Faltan " + tiempo.dias + " días para que esta historia comience." : "La magia se acerca."}</p></>;
}
