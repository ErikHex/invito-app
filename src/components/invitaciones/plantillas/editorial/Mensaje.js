import styles from "./editorial.module.css";

export default function Mensaje({
  nombreEvento,
  nombreInvitado,
  mensajeBase,
  fotoMensaje,
  fotoMensajeAlt,
}) {
  return (
    <section
      id="mensaje-pareja"
      className={styles.message}
      aria-labelledby="mensaje-titulo"
    >
      <p className={styles.eyebrow}>
        {nombreInvitado ? `Para ti, ${nombreInvitado}` : "Con mucho cariño"}
      </p>
      <h2 id="mensaje-titulo">
        Lo más bonito es
        <br />
        <em>compartirlo contigo.</em>
      </h2>
      {mensajeBase && <p className={styles.letter}>{mensajeBase}</p>}
      {fotoMensaje && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.messagePhoto}
          src={fotoMensaje}
          alt={fotoMensajeAlt || "Un momento de nuestra historia"}
          loading="lazy"
          decoding="async"
        />
      )}
      <div className={styles.signature}>
        <span aria-hidden="true" />
        <p>
          Con amor,
          <br />
          <strong>{nombreEvento}</strong>
        </p>
      </div>
    </section>
  );
}
