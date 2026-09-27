"use client";
import { useState } from "react";
import styles from "../plantillas/editorial/editorial.module.css";
export default function Transferencia({ datos }) {
  const [mensaje,setMensaje] = useState('');
  async function copiar() {
    try { await navigator.clipboard.writeText(datos.clabe); setMensaje('CLABE copiada.'); }
    catch { setMensaje('No pudimos copiarla. Puedes seleccionar los números y copiarlos.'); }
  }
  return <div className={styles.venueDetails}>
    <p>También puedes hacernos un regalo por transferencia.</p>
    <p>{datos.titular} · {datos.banco}</p>
    <p style={{overflowWrap:'anywhere'}}>CLABE: {datos.clabe}</p>
    <button type="button" onClick={copiar} className={styles.mapLink}>Copiar CLABE</button>
    <p role="status">{mensaje}</p>
  </div>;
}
