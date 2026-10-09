import styles from "./editorial.module.css";

export default function Recepcion({ recepcion, fechaTexto }) {
  if (
    !recepcion ||
    (!recepcion.foto &&
      !recepcion.hora &&
      !recepcion.lugar &&
      !recepcion.mapsUrl)
  ) {
    return null;
  }

  return (
    <section
      className={styles.event}
      data-editor-section="evento"
      aria-labelledby="recepcion-titulo"
    >
      <p className={styles.eyebrow}>Después del sí</p>
      <h2 id="recepcion-titulo">
        La celebración
        <br />
        <em>continúa</em>
      </h2>
      {recepcion.foto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.venuePhoto}
          src={recepcion.foto}
          alt={recepcion.fotoAlt || "Lugar de la recepción"}
          loading="lazy"
          decoding="async"
        />
      )}
      {fechaTexto && <p className={styles.eventDate}>{fechaTexto}</p>}
      <span
        className={styles.rule}
        aria-hidden="true"
      />
      <h3>La recepción</h3>
      <p className={styles.venueDetails}>
        {[recepcion.hora, recepcion.lugar].filter(Boolean).join(" · ")}
      </p>
      {recepcion.mapsUrl && /^https?:\/\//i.test(recepcion.mapsUrl) && (
        <a
          className={styles.mapLink}
          href={recepcion.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Cómo llegar <span aria-hidden="true">↗</span>
          <span className={styles.srOnly}> (abre en otra pestaña)</span>
        </a>
      )}
    </section>
  );
}
