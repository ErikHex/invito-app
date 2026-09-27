import Transferencia from "../../compartidos/Transferencia";
import styles from "./editorial.module.css";

export default function Regalos({ regalos }) {
  const enlaces = Array.isArray(regalos?.enlaces)
    ? regalos.enlaces.filter((enlace) => enlace?.nombre && enlace.url?.trim())
    : [];

  if (!regalos?.mensaje && enlaces.length === 0 && !regalos?.transferencia?.activa && !regalos?.sobres) return null;

  return (
    <section
      className={`${styles.event} ${styles.giftSection}`}
      aria-labelledby="regalos-titulo"
    >
      <p className={styles.eyebrow}>Un detalle para nosotros</p>
      <h2 id="regalos-titulo">
        Un detalle para<br /><em>recordar</em>
      </h2>
      {regalos.mensaje && (
        <p className={styles.venueDetails}>{regalos.mensaje}</p>
      )}
      {regalos?.transferencia?.activa && <Transferencia datos={regalos.transferencia} />}
      {regalos?.sobres && <p className={styles.venueDetails}>Si prefieres un regalo en efectivo, habrá lluvia de sobres el día del evento.</p>}
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
