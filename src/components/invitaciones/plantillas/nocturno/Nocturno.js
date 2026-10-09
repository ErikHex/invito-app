'use client';

// Plantilla Nocturno: fondo oscuro, cristal esmerilado y acentos de color.
// Sigue el mismo contrato de props que Editorial y Aura XV.
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import RsvpForm from '../../compartidos/RsvpForm';
import QrCode from '../../compartidos/QrCode';
import { invitationField } from '@/lib/invitation-utils';
import { ajusteTextoPortada } from '@/lib/invitation-theme';
import styles from './nocturno.module.css';
import TextoPortadaEditable from '../../compartidos/TextoPortadaEditable';

// Fecha escrita del evento, sin moverla a la zona horaria del visitante.
function fechaTextoDe(fechaHora) {
  const fecha = fechaHora?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!fecha) return null;
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(Number(fecha[1]), Number(fecha[2]) - 1, Number(fecha[3]))));
}

function horaDe(fechaHora) {
  const hora = fechaHora?.match(/T(\d{2}):(\d{2})/);
  return hora ? `${hora[1]}:${hora[2]}` : null;
}

function CuentaRegresiva({ fechaHora }) {
  const [restante, setRestante] = useState(null);
  useEffect(() => {
    if (!fechaHora) return undefined;
    const objetivo = new Date(fechaHora).getTime();
    if (Number.isNaN(objetivo)) return undefined;
    const actualizar = () => setRestante(Math.max(0, objetivo - Date.now()));
    actualizar();
    const intervalo = setInterval(actualizar, 1000);
    return () => clearInterval(intervalo);
  }, [fechaHora]);

  const celdas = restante === null ? null : [
    { valor: Math.floor(restante / 86_400_000), etiqueta: 'Días' },
    { valor: Math.floor(restante / 3_600_000) % 24, etiqueta: 'Hrs' },
    { valor: Math.floor(restante / 60_000) % 60, etiqueta: 'Min' },
    { valor: Math.floor(restante / 1_000) % 60, etiqueta: 'Seg' },
  ];

  if (!fechaHora) return null;
  return (
    <div className={styles.countdown} aria-label="Tiempo que falta para el evento">
      {(celdas || [
        { valor: null, etiqueta: 'Días' },
        { valor: null, etiqueta: 'Hrs' },
        { valor: null, etiqueta: 'Min' },
        { valor: null, etiqueta: 'Seg' },
      ]).map(({ valor, etiqueta }) => (
        <div key={etiqueta} className={styles.cell}>
          <strong>{valor === null ? '—' : String(valor).padStart(2, '0')}</strong>
          <span>{etiqueta}</span>
        </div>
      ))}
    </div>
  );
}

function TarjetaLugar({ id, etiqueta, datos, fechaTexto }) {
  if (!datos || !Object.values(datos).some(Boolean)) return null;
  const url = typeof datos.mapsUrl === 'string' && /^https:\/\//.test(datos.mapsUrl) ? datos.mapsUrl : null;
  return (
    <article id={id} className={styles.card} data-editor-section="evento">
      <p className={styles.cardLabel}>{etiqueta}</p>
      {datos.foto && <img
        src={datos.foto}
        alt={datos.fotoAlt || `Lugar de ${etiqueta.toLowerCase()}`}
        className={styles.lugarFoto}
        loading="lazy"
        decoding="async"
      />}
      <h3 className={styles.cardTitle}>{datos.lugar || etiqueta}</h3>
      {datos.hora && <p className={styles.cardSub}>{datos.hora}</p>}
      {fechaTexto && <p className={styles.cardSub}>{fechaTexto}</p>}
      {datos.direccion && <p className={styles.cardText}>{datos.direccion}</p>}
      {url && (
        <a className={styles.link} href={url} target="_blank" rel="noopener noreferrer">
          Cómo llegar <span aria-hidden="true">↗</span>
        </a>
      )}
    </article>
  );
}

function Galeria({ fotos }) {
  const [seleccionada, setSeleccionada] = useState(null);
  const hayFotos = Array.isArray(fotos) && fotos.some(Boolean);

  useEffect(() => {
    if (seleccionada === null) return undefined;
    const alCerrar = evento => {
      if (evento.key === 'Escape') setSeleccionada(null);
    };
    window.addEventListener('keydown', alCerrar);
    return () => window.removeEventListener('keydown', alCerrar);
  }, [seleccionada]);

  if (!hayFotos) return null;
  const visibles = fotos.filter(Boolean);
  return (
    <section id="galeria" className={styles.section} data-editor-section="fotos">
      <p className={styles.eyebrow}>Recuerdos</p>
      <h2 className={styles.titulo}>Galería</h2>
      <div className={styles.gridFotos}>
        {visibles.map((foto, indice) => (
          <button
            key={foto}
            type="button"
            className={styles.fotoBoton}
            onClick={() => setSeleccionada(indice)}
            aria-label={`Ampliar foto ${indice + 1}`}
          >
            <img src={foto} alt={`Foto ${indice + 1} del evento`} loading="lazy" decoding="async" className={styles.foto} />
          </button>
        ))}
      </div>
      {seleccionada !== null && visibles[seleccionada] && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          onClick={() => setSeleccionada(null)}
        >
          <img src={visibles[seleccionada]} alt={`Foto ${seleccionada + 1} del evento`} className={styles.lightboxFoto} />
        </div>
      )}
    </section>
  );
}

function Itinerario({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section id="itinerario" className={styles.section} data-editor-section="evento">
      <p className={styles.eyebrow}>Programa</p>
      <h2 className={styles.titulo}>Itinerario</h2>
      <ol className={styles.itinerario}>
        {items.filter(Boolean).map((item, indice) => (
          <li key={indice} className={styles.item}>
            <span className={styles.itemHora}>{item.hora || ''}</span>
            <span className={styles.itemCuerpo}>
              <strong>{item.titulo}</strong>
              {item.lugar && <em>{item.lugar}</em>}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Nocturno({
  datos,
  estado,
  onEstadoChange,
  preview,
  editorPreview,
  onPortadaTextoChange,
}) {
  const cfg = datos.configuracion || {};
  const textoPortada = ajusteTextoPortada(cfg, { relativoAContenedor: true });
  const visible = key => datos.modulos_activos?.[key] !== false;
  const { fechaHora } = cfg;
  const fechaTexto = fechaTextoDe(fechaHora);
  const horaTexto = horaDe(fechaHora);
  const nombres = (Array.isArray(cfg.nombres) ? cfg.nombres.filter(Boolean).join(' & ') : '') || datos.evento_nombre;
  const mensaje = invitationField(cfg, 'mensajeBase');
  const fotoMensaje = invitationField(cfg, 'fotoMensaje');
  const tipo = invitationField(cfg, 'tipoEvento') || 'celebración';

  return (
    <div className={styles.nocturno}>
      <div className={styles.luces} aria-hidden="true">
        <i className={styles.luzA} />
        <i className={styles.luzB} />
        <i className={styles.luzC} />
      </div>

      <div className={styles.contenido}>
        <div className={styles.topbar}>
          <span className={styles.marca}>Invito</span>
          {datos.evento_nombre && <span className={styles.badge}>{tipo}</span>}
        </div>

        {visible('portada') && (
          <section id="portada" className={styles.portada} data-portada-contenedor data-editor-section="diseno">
            <p className={styles.eyebrow} data-editor-section="informacion">{invitationField(cfg, 'encabezado') ?? 'Celebremos juntos'}</p>
            <TextoPortadaEditable as="h1" className={styles.nombre} style={textoPortada.style} ajuste={textoPortada} editorPreview={editorPreview} onChange={onPortadaTextoChange}>{nombres}</TextoPortadaEditable>
            {fechaTexto && <p className={styles.frase} data-editor-section="informacion">{fechaTexto}{horaTexto ? ` · ${horaTexto}` : ''}</p>}
            {cfg.fotoPortada && (
              <img
                src={cfg.fotoPortada}
                alt={invitationField(cfg, 'fotoPortadaAlt') || cfg.editorial?.fotoAlt || `Portada de ${nombres}`}
                className={styles.portadaFoto}
                style={{ objectPosition: cfg.encuadrePortada || cfg.editorial?.encuadre || 'center' }}
                fetchPriority="high"
                decoding="async"
              />
            )}
          </section>
        )}

        {visible('mensaje') && (
          <section id="mensaje" className={styles.section} data-editor-section="informacion" aria-labelledby="nocturno-mensaje-titulo">
            <p className={styles.eyebrow}>{datos.nombre ? `Para ti, ${datos.nombre}` : 'Con mucho cariño'}</p>
            <h2 id="nocturno-mensaje-titulo" className={styles.titulo}>Lo más bonito es compartirlo contigo.</h2>
            {mensaje && <p className={styles.mensajeTexto}>{mensaje}</p>}
            {fotoMensaje && <img
              src={fotoMensaje}
              alt={invitationField(cfg, 'fotoMensajeAlt') || 'Un momento de nuestra historia'}
              className={styles.mensajeFoto}
              loading="lazy"
              decoding="async"
            />}
            <p className={styles.firma}>Con cariño, <strong>{nombres}</strong></p>
          </section>
        )}

        {visible('cuenta_regresiva') && fechaHora && (
          <section id="cuenta-regresiva" className={styles.section} data-editor-section="informacion" aria-labelledby="nocturno-cuenta-titulo">
            <p className={styles.eyebrow}>Cada vez más cerca</p>
            <h2 id="nocturno-cuenta-titulo" className={styles.titulo}>La cuenta para celebrar</h2>
            <CuentaRegresiva fechaHora={fechaHora} />
          </section>
        )}

        {visible('ceremonia') && <TarjetaLugar id="ceremonia" etiqueta="Ceremonia" datos={invitationField(cfg, 'ceremonia')} fechaTexto={fechaTexto} />}
        {visible('recepcion') && <TarjetaLugar id="recepcion" etiqueta="Recepción" datos={invitationField(cfg, 'recepcion')} fechaTexto={fechaTexto} />}

        {visible('vestimenta') && cfg.vestimenta && (
          <section id="vestimenta" className={styles.section} data-editor-section="detalles">
            <p className={styles.eyebrow}>Dress code</p>
            <h2 className={styles.titulo}>Vestimenta</h2>
            {cfg.vestimenta.codigo && <p className={styles.codigoVestimenta}>{cfg.vestimenta.codigo}</p>}
            {cfg.vestimenta.descripcion && <p className={styles.texto}>{cfg.vestimenta.descripcion}</p>}
            {Array.isArray(cfg.vestimenta.coloresReservados) && cfg.vestimenta.coloresReservados.length > 0 && (
              <div className={styles.muestras}>
                {cfg.vestimenta.coloresReservados.filter(Boolean).map(color => (
                  <span key={color.nombre} className={styles.muestra} title={color.nombre}>
                    <i style={{ backgroundColor: color.hex }} />
                    {color.nombre}
                  </span>
                ))}
              </div>
            )}
          </section>
        )}

        {visible('regalos') && cfg.regalos && (
          <section id="regalos" className={styles.section} data-editor-section="detalles">
            <p className={styles.eyebrow}>Con cariño</p>
            <h2 className={styles.titulo}>Regalos</h2>
            {cfg.regalos.mensaje && <p className={styles.texto}>{cfg.regalos.mensaje}</p>}
            {Array.isArray(cfg.regalos.enlaces) && cfg.regalos.enlaces.length > 0 && (
              <div className={styles.enlaces}>
                {cfg.regalos.enlaces.filter(Boolean).map(enlace => (
                  <a
                    key={enlace.nombre}
                    className={styles.botonSecundario}
                    href={enlace.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {enlace.nombre}
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        {visible('galeria') && <Galeria fotos={cfg.galeria} />}
        {visible('itinerario') && <Itinerario items={cfg.itinerario} />}

        {(visible('rsvp') || visible('qr')) && <section id="rsvp" className={styles.rsvp}>
          <div className={styles.rsvpHead}>
            <h2 className={styles.titulo}>Confirma tu asistencia</h2>
            {fechaTexto && <p className={styles.texto}>{fechaTexto}{horaTexto ? ` · ${horaTexto}` : ''}</p>}
          </div>
          {datos.mesa_nombre && <p className={styles.texto}>Tu mesa: <strong>{datos.mesa_nombre}</strong></p>}
          <p className={styles.texto}>Boletos disponibles: {Number(datos.acompanantes || 0) + 1}</p>
          {visible('rsvp') && (
            <RsvpForm invitado={datos} estado={estado} onEstadoChange={onEstadoChange} preview={preview} />
          )}
          {visible('qr') && estado === 'confirmado' &&
            (preview ? (
              <p className={styles.texto}>Vista de muestra. El boleto QR se entrega en una invitación real.</p>
            ) : (
              <QrCode token={datos.token} />
            ))}
        </section>}

        <footer className={styles.footer}>Con amor · {nombres} · {fechaTexto ? new Date(fechaHora).getFullYear() : ''}</footer>
      </div>
    </div>
  );
}
