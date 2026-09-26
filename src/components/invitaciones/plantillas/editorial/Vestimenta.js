import styles from "./editorial.module.css";

export default function Vestimenta({ vestimenta }) {
  if (!vestimenta?.codigo && !vestimenta?.descripcion) return null;

  return (
    <section
      className={styles.event}
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
    </section>
  );
}
