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
import { invitationField } from "@/lib/invitation-utils";

export default function Editorial({
  datos,
  estado,
  onEstadoChange,
  preview,
  colorFondo,
  colorClaro,
  colorAcento,
  editorPreview,
  onPortadaTextoChange,
}) {
  const cfg = datos.configuracion || {};
  const visible = key => datos.modulos_activos?.[key] !== false;
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
        {visible("portada") && (<Hero
          nombreEvento={datos.evento_nombre}
          configuracion={cfg}
          fechaTexto={fechaTexto}
          editorPreview={editorPreview}
          onPortadaTextoChange={onPortadaTextoChange}
        />)}
        {visible("mensaje") && (<Mensaje
          nombreEvento={datos.evento_nombre}
          nombreInvitado={datos.nombre}
          mensajeBase={invitationField(cfg, "mensajeBase")}
          fotoMensaje={invitationField(cfg, "fotoMensaje")}
          fotoMensajeAlt={invitationField(cfg, "fotoMensajeAlt")}
        />)}
        {visible("cuenta_regresiva") && (<CuentaRegresiva fechaHora={cfg.fechaHora} />)}
        {visible("ceremonia") && (<Ceremonia
          ceremonia={invitationField(cfg, "ceremonia")}
          fechaTexto={fechaTexto}
        />)}
        {visible("recepcion") && (<Recepcion
          recepcion={invitationField(cfg, "recepcion")}
          fechaTexto={fechaTexto}
        />)}
        {visible("vestimenta") && (<Vestimenta vestimenta={cfg.vestimenta} />)}
        {visible("regalos") && (<Regalos regalos={cfg.regalos} />)}
      </div>

      {visible("galeria") && (<Galeria
        fotos={cfg.galeria}
        colorFondo={colorFondo}
      />)}
      {visible("itinerario") && (<Itinerario
        items={cfg.itinerario}
        colorAcento={colorAcento}
        colorTexto={colorClaro}
      />)}

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
        {visible("rsvp") && (<RsvpForm
          invitado={datos}
          estado={estado}
          onEstadoChange={onEstadoChange}
          preview={preview}
        />)}
        {visible("qr") && estado === "confirmado" &&
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
