import styles from "./editorial.module.css";

export default function Ceremonia({ ceremonia, fechaTexto }) {
  if (!ceremonia) return null;
  return (
    <section
      className={styles.event}
      aria-labelledby="ceremonia-titulo"
    >
      <p className={styles.eyebrow}>El gran día</p>
      <h2 id="ceremonia-titulo">
        Un día para
        <br />
        <em>recordar</em>
      </h2>
      {ceremonia.foto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.venuePhoto}
          src={ceremonia.foto}
          alt={ceremonia.fotoAlt || "Lugar de la celebración"}
          loading="lazy"
          decoding="async"
        />
      )}
      {fechaTexto && <p className={styles.eventDate}>{fechaTexto}</p>}
      <span
        className={styles.rule}
        aria-hidden="true"
      />
      <h3>La ceremonia</h3>
      <p className={styles.venueDetails}>
        {ceremonia.hora} · {ceremonia.lugar}
      </p>
      {ceremonia.mapsUrl && /^https?:\/\//i.test(ceremonia.mapsUrl) && (
        <a
          className={styles.mapLink}
          href={ceremonia.mapsUrl}
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
