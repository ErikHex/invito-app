import styles from "./editorial.module.css";
import { invitationField } from "@/lib/invitation-utils";
import { ajusteTextoPortada } from "@/lib/invitation-theme";
import TextoPortadaEditable from "../../compartidos/TextoPortadaEditable";

export default function Hero({ nombreEvento, configuracion, editorPreview, onPortadaTextoChange }) {
  const textoPortada = ajusteTextoPortada(configuracion, { relativoAContenedor: true });
  const { fotoPortada } = configuracion;
  const editorial = configuracion.editorial || {};
  const nombresConfigurados = Array.isArray(configuracion.nombres)
    ? configuracion.nombres.filter(Boolean)
    : [];
  const nombres = nombresConfigurados.length
    ? nombresConfigurados
    : nombreEvento?.split(/\s+&\s+/).filter(Boolean) || [];
  return (
    <header className={styles.cover} data-portada-contenedor data-editor-section="diseno">
      <p className={styles.eyebrow} data-editor-section="informacion">
        {invitationField(configuracion, "encabezado") ?? "Celebremos juntos"}
      </p>
      <TextoPortadaEditable as="h1" className={styles.names} style={textoPortada.style} ajuste={textoPortada} editorPreview={editorPreview} onChange={onPortadaTextoChange}>
        {nombres.length >= 2 ? (
          <>
            <span>{nombres[0]}</span>
            <i
              className={styles.ampersand}
              aria-hidden="true"
            >
              &amp;
            </i>
            <span>{nombres[1]}</span>
          </>
        ) : (
          nombres[0] || nombreEvento
        )}
      </TextoPortadaEditable>
      {fotoPortada && (
        <div className={styles.portrait}>
          {fotoPortada && (
            /* A native responsive image preserves support for customer-provided image hosts. */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fotoPortada}
              alt={editorial.fotoAlt || `Fotografía de ${nombreEvento}`}
              fetchPriority="high"
              decoding="async"
              style={{
                objectPosition:
                  configuracion.encuadrePortada ||
                  editorial.encuadre ||
                  "center",
              }}
            />
          )}
        </div>
      )}
      <div className={styles.details}>
        <a
          href="#mensaje-pareja"
          className={styles.discover}
        >
          Una historia para compartir<span aria-hidden="true">↓</span>
        </a>
      </div>
    </header>
  );
}
