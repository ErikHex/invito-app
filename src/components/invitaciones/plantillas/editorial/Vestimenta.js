import { pinterestUrl } from "@/lib/invitation-utils";
import styles from "./editorial.module.css";

export default function Vestimenta({ vestimenta }) {
  const inspiracion = pinterestUrl(vestimenta?.pinterestUrl);
  if (!vestimenta?.codigo && !vestimenta?.descripcion && !inspiracion) return null;

  return (
    <section
      className={styles.event}
      data-editor-section="detalles"
      aria-labelledby="vestimenta-titulo"
    >
      <p className={styles.eyebrow}>Para tener en cuenta</p>
      <h2 id="vestimenta-titulo">
        Código de
        <br />
        <em>vestimenta</em>
      </h2>
      {vestimenta.codigo && <h3>{vestimenta.codigo}</h3>}
      {vestimenta.descripcion && (
        <p className={styles.venueDetails}>{vestimenta.descripcion}</p>
      )}
      {inspiracion && <a href={inspiracion} className={styles.mapLink} target="_blank" rel="noopener noreferrer">Ver inspiración en Pinterest ↗</a>}
    </section>
  );
}
