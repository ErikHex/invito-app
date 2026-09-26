import styles from "./editorial.module.css";

export default function Regalos({ regalos }) {
  const enlaces = Array.isArray(regalos?.enlaces)
    ? regalos.enlaces.filter((enlace) => enlace?.nombre && enlace.url?.trim())
    : [];

  if (!regalos?.mensaje && enlaces.length === 0) return null;

  return (
    <section
      className={`${styles.event} ${styles.giftSection}`}
      aria-labelledby="regalos-titulo"
    >
      <p className={styles.eyebrow}>Un detalle para nosotros</p>
      <h2 id="regalos-titulo">
        Mesas de
        <br />
        <em>regalos</em>
      </h2>
      {regalos.mensaje && (
        <p className={styles.venueDetails}>{regalos.mensaje}</p>
      )}
      <div className="space-y-3">
        {enlaces.map((enlace) => (
          <a
            key={`${enlace.nombre}-${enlace.url}`}
            className={styles.mapLink}
            href={
              /^https?:\/\//i.test(enlace.url)
                ? enlace.url
                : `https://${enlace.url}`
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {enlace.nombre}
            {enlace.codigo && (
              <span className="text-sm not-italic">
                Código: {enlace.codigo}
              </span>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
