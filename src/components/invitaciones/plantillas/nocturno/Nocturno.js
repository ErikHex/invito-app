'use client';

// Plantilla Nocturno: fondo oscuro, cristal esmerilado y acentos de color.
// Sigue el mismo contrato de props que Editorial y Aura XV.
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import RsvpForm from '../../compartidos/RsvpForm';
import QrCode from '../../compartidos/QrCode';
import { invitationField } from '@/lib/invitation-utils';
import styles from './nocturno.module.css';

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

function TarjetaLugar({ etiqueta, datos, fechaTexto }) {
  if (!datos || !Object.values(datos).some(Boolean)) return null;
  const url = typeof datos.mapsUrl === 'string' && /^https:\/\//.test(datos.mapsUrl) ? datos.mapsUrl : null;
  return (
    <article className={styles.card}>
      <p className={styles.cardLabel}>{etiqueta}</p>
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
    <section id="galeria" className={styles.section}>
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
    <section id="itinerario" className={styles.section}>
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
  colorAcento,
}) {
  const cfg = datos.configuracion || {};
  const visible = key => datos.modulos_activos?.[key] !== false;
  const { fechaHora } = cfg;
  const fechaTexto = fechaTextoDe(fechaHora);
  const horaTexto = horaDe(fechaHora);
  const nombres = Array.isArray(datos.nombres) && datos.nombres.length > 0
    ? datos.nombres.filter(Boolean).join(' & ')
    : datos.evento_nombre;
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
          <section id="portada" className={styles.portada}>
            <p className={styles.eyebrow}>Celebramos a</p>
            <h1 className={styles.nombre}>{nombres}</h1>
            {invitationField(cfg, 'mensajeBase') && (
              <p className={styles.frase}>{invitationField(cfg, 'mensajeBase')}</p>
            )}
            {cfg.fotoPortada && (
              <img
                src={invitationField(cfg, 'fotoPortada')}
                alt={invitationField(cfg, 'fotoPortadaAlt') || `Portada de ${nombres}`}
                className={styles.portadaFoto}
                loading="lazy"
                decoding="async"
              />
            )}
            {visible('cuenta_regresiva') && <CuentaRegresiva fechaHora={fechaHora} />}
          </section>
        )}

        <div className={styles.fechaGrid}>
          <TarjetaLugar etiqueta="Fecha" datos={{ fecha: fechaTexto, hora: horaTexto }} fechaTexto={fechaTexto} />
          <TarjetaLugar etiqueta="Ceremonia" datos={invitationField(cfg, 'ceremonia')} />
          <TarjetaLugar etiqueta="Recepción" datos={invitationField(cfg, 'recepcion')} />
        </div>

        {visible('mensaje') && invitationField(cfg, 'mensajeBase') && (
          <section id="mensaje" className={styles.section}>
            <p className={styles.eyebrow}>Un mensaje</p>
            <p className={styles.mensajeTexto}>
              {invitationField(cfg, 'mensajeBase')}
              {datos.nombre && (
                <>
                  <br />
                  <strong className={styles.mensajeInvitado}>{datos.nombre}</strong>
                </>
              )}
            </p>
          </section>
        )}

        {visible('vestimenta') && cfg.vestimenta && (
          <section id="vestimenta" className={styles.section}>
            <p className={styles.eyebrow}>Dress code</p>
            <h2 className={styles.titulo}>Vestimenta</h2>
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
          <section id="regalos" className={styles.section}>
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

        <section id="rsvp" className={styles.rsvp}>
          <div className={styles.rsvpHead}>
            <h2 className={styles.titulo}>Confirma tu asistencia</h2>
            {fechaTexto && <p className={styles.texto}>{fechaTexto}{horaTexto ? ` · ${horaTexto}` : ''}</p>}
          </div>
          {datos.mesa_nombre && <p className={styles.texto}>Tu mesa: <strong>{datos.mesa_nombre}</strong></p>}
          <p className={styles.texto}>Boletos disponibles: {Number(datos.acompanantes) + 1}</p>
          {visible('rsvp') && (
            <RsvpForm invitado={datos} estado={estado} onEstadoChange={onEstadoChange} preview={preview} />
          )}
          {visible('qr') && estado === 'confirmado' &&
            (preview ? (
              <p className={styles.texto}>Vista de muestra. El boleto QR se entrega en una invitación real.</p>
            ) : (
              <QrCode token={datos.token} />
            ))}
        </section>

        <footer className={styles.footer}>Con amor · {nombres} · {fechaTexto ? new Date(fechaHora).getFullYear() : ''}</footer>
      </div>
    </div>
  );
}
