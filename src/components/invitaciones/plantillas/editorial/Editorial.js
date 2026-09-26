import Hero from "./Hero";
import Mensaje from "./Mensaje";
import Ceremonia from "./Ceremonia";
import Recepcion from "./Recepcion";
import Vestimenta from "./Vestimenta";
import Regalos from "./Regalos";
import CuentaRegresiva from "./CuentaRegresiva";
import Galeria from "./Galeria";
import Itinerario from "./Itinerario";
import RsvpForm from "../../compartidos/RsvpForm";
import QrCode from "../../compartidos/QrCode";
import styles from "./editorial.module.css";

export default function Editorial({
  datos,
  estado,
  onEstadoChange,
  preview,
  colorFondo,
  colorClaro,
  colorAcento,
}) {
  const cfg = datos.configuracion || {};
  const { fechaHora } = cfg;
  // Preserve the event's written calendar date rather than shifting it to the viewer's timezone.
  const fecha = fechaHora?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const fechaTexto = fecha
    ? new Intl.DateTimeFormat("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(
        new Date(
          Date.UTC(Number(fecha[1]), Number(fecha[2]) - 1, Number(fecha[3])),
        ),
      )
    : null;
  return (
    <>
      <div className={styles.editorial}>
        <Hero
          nombreEvento={datos.evento_nombre}
          configuracion={cfg}
          fechaTexto={fechaTexto}
        />
        <Mensaje
          nombreEvento={datos.evento_nombre}
          nombreInvitado={datos.nombre}
          mensajeBase={cfg.mensajeBase || cfg.editorial?.mensajeBase}
          fotoMensaje={cfg.fotoMensaje || cfg.editorial?.fotoMensaje}
          fotoMensajeAlt={cfg.fotoMensajeAlt || cfg.editorial?.fotoMensajeAlt}
        />
        <CuentaRegresiva fechaHora={cfg.fechaHora} />
        <Ceremonia
          ceremonia={cfg.ceremonia || cfg.editorial?.ceremonia}
          fechaTexto={fechaTexto}
        />
        <Recepcion
          recepcion={cfg.recepcion || cfg.editorial?.recepcion}
          fechaTexto={fechaTexto}
        />
        <Vestimenta vestimenta={cfg.vestimenta} />
        <Regalos regalos={cfg.regalos} />
      </div>

      <Galeria
        fotos={cfg.galeria}
        colorFondo={colorFondo}
      />
      <Itinerario
        items={cfg.itinerario}
        colorAcento={colorAcento}
        colorTexto={colorClaro}
      />

      <div
        className="py-16 px-6 rounded-t-3xl"
        style={{ backgroundColor: colorClaro, color: colorFondo }}
      >
        {datos.mesa_nombre && (
          <p className="text-center mb-4">
            Tu mesa: <strong>{datos.mesa_nombre}</strong>
          </p>
        )}
        <p className="text-center mb-6">
          Boletos disponibles: {Number(datos.acompanantes) + 1}
        </p>
        <RsvpForm
          invitado={datos}
          estado={estado}
          onEstadoChange={onEstadoChange}
          preview={preview}
        />
        {estado === "confirmado" &&
          (preview ? (
            <p className="text-sm text-center mt-6">
              Vista de muestra. El boleto QR se entrega en una invitación real.
            </p>
          ) : (
            <QrCode token={datos.token} />
          ))}
      </div>
    </>
  );
}
