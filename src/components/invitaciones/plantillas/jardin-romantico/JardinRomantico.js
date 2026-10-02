'use client';

/* Customer photographs may come from any host, as in the other templates. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react';
import RsvpForm from '../../compartidos/RsvpForm';
import QrCode from '../../compartidos/QrCode';
import Transferencia from '../../compartidos/Transferencia';
import { invitationField, pinterestUrl } from '@/lib/invitation-utils';
import { enlaceSeguro, enlaceRegalo, fechaInvitacion, tiempoRestante } from '@/lib/aura-xv';
import { colorValido, tipoCelebracion } from '@/lib/invitation-theme';
import styles from './jardin-romantico.module.css';

function Rama({ className = '' }) {
  return <svg className={className} viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
    <path d="M8 49C30 44 61 26 89 10M27 41C13 40 12 30 14 23C25 25 29 32 27 41ZM41 34C28 30 30 19 33 13C42 18 45 25 41 34ZM57 25C49 16 54 7 60 3C65 11 64 20 57 25ZM28 41C33 53 44 53 52 48C46 40 37 38 28 41ZM47 31C55 41 67 37 72 30C63 25 55 25 47 31ZM66 20C77 28 87 22 91 15C80 12 74 13 66 20Z" />
  </svg>;
}

function Flores({ className = '', priority = false }) {
  return <img className={`${styles.flowers} ${className}`} src="/plantillas/jardin-romantico/botanica.webp" alt="" aria-hidden="true" width="1024" height="1536" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} decoding="async" />;
}

function Encabezado({ etiqueta, titulo }) {
  return <><p className={styles.eyebrow}>{etiqueta}</p><h2>{titulo}</h2></>;
}

function Cuenta({ fechaHora }) {
  const [tiempo, setTiempo] = useState(null);
  useEffect(() => {
    const actualizar = () => setTiempo(tiempoRestante(fechaHora));
    const inicio = setTimeout(actualizar, 0);
    const intervalo = setInterval(actualizar, 1000);
    return () => { clearTimeout(inicio); clearInterval(intervalo); };
  }, [fechaHora]);
  return <div className={styles.countdown} aria-label="Tiempo que falta para el evento">
    {['dias', 'horas', 'minutos', 'segundos'].map((key, i) => <div key={key}><strong>{tiempo ? String(tiempo[key]).padStart(2, '0') : '—'}</strong><span>{['Días', 'Horas', 'Minutos', 'Segundos'][i]}</span></div>)}
  </div>;
}

function Lugar({ datos, tipo, numero }) {
  if (!datos || !Object.values(datos).some(Boolean)) return null;
  const mapa = enlaceSeguro(datos.mapsUrl);
  return <article className={styles.venue}>
    {datos.foto ? <div className={styles.venuePhoto}><img src={datos.foto} alt={datos.fotoAlt || `Lugar de ${tipo.toLowerCase()}`} loading="lazy" decoding="async" /></div> : <Rama className={styles.venueBranch} />}
    <div className={styles.venueCopy}>
      <p className={styles.eyebrow}>{numero} · {tipo}</p>
      <h3>{datos.lugar || tipo}</h3>
      {datos.hora && <p className={styles.venueTime}>{datos.hora}</p>}
      {datos.direccion && <p className={styles.bodyText}>{datos.direccion}</p>}
      {mapa && <a className={styles.link} href={mapa} target="_blank" rel="noopener noreferrer">Cómo llegar <span aria-hidden="true">↗</span></a>}
    </div>
  </article>;
}

function Galeria({ fotos }) {
  const modal = useRef(null);
  const [seleccionada, setSeleccionada] = useState(null);
  useEffect(() => {
    if (seleccionada === null) return;
    const dialog = modal.current;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; };
  }, [seleccionada]);
  return <>
    <div className={styles.gallery}>{fotos.map((foto, i) => <button type="button" key={`${foto}-${i}`} onClick={() => setSeleccionada(i)} aria-label={`Ampliar fotografía ${i + 1}`}>
      <img src={foto} alt={`Recuerdo de la celebración, fotografía ${i + 1}`} loading="lazy" decoding="async" /><span>Un instante para siempre · {String(i + 1).padStart(2, '0')}</span>
    </button>)}</div>
    <dialog ref={modal} className={styles.lightbox} aria-label="Fotografía ampliada" onCancel={() => setSeleccionada(null)} onClose={() => setSeleccionada(null)} onClick={event => { if (event.target === event.currentTarget) setSeleccionada(null); }}>
      <button type="button" autoFocus onClick={() => setSeleccionada(null)}>Cerrar ×</button>
      {seleccionada !== null && <img src={fotos[seleccionada]} alt={`Fotografía ${seleccionada + 1} ampliada`} />}
    </dialog>
  </>;
}

export default function JardinRomantico({ datos, estado, onEstadoChange, preview }) {
  const cfg = datos.configuracion || {};
  const visible = key => datos.modulos_activos?.[key] !== false;
  const tipo = tipoCelebracion(cfg, 'jardin_romantico');
  const nombres = Array.isArray(cfg.nombres) ? cfg.nombres.filter(nombre => typeof nombre === 'string' && nombre.trim()) : [];
  const nombre = nombres.length ? nombres.join(tipo === 'boda' ? ' & ' : ' ') : datos.evento_nombre || 'Una celebración especial';
  const iniciales = nombres.length ? nombres.slice(0, 2).map(n => Array.from(n.trim())[0]).join(' · ') : Array.from(nombre.trim())[0];
  const fecha = fechaInvitacion(cfg.fechaHora);
  const partesFecha = fecha ? cfg.fechaHora.slice(0, 10).split('-') : null;
  const mes = partesFecha ? new Intl.DateTimeFormat('es-MX', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(Number(partesFecha[0]), Number(partesFecha[1]) - 1, Number(partesFecha[2])))) : null;
  const ceremonia = invitationField(cfg, 'ceremonia');
  const recepcion = invitationField(cfg, 'recepcion');
  const mensaje = invitationField(cfg, 'mensajeBase');
  const fotoMensaje = invitationField(cfg, 'fotoMensaje');
  const lugares = (visible('ceremonia') && ceremonia && Object.values(ceremonia).some(Boolean)) || (visible('recepcion') && recepcion && Object.values(recepcion).some(Boolean));
  const itinerario = Array.isArray(cfg.itinerario) ? cfg.itinerario.filter(Boolean) : [];
  const fotos = Array.isArray(cfg.galeria) ? cfg.galeria.filter(f => typeof f === 'string' && f.trim()) : [];
  const vestimenta = cfg.vestimenta || {};
  const colores = Array.isArray(vestimenta.coloresReservados) ? vestimenta.coloresReservados.filter(colorValido) : [];
  const pinterest = pinterestUrl(vestimenta.pinterestUrl);
  const regalos = cfg.regalos || {};
  const enlaces = Array.isArray(regalos.enlaces) ? regalos.enlaces.filter(e => e?.nombre && enlaceRegalo(e.url)).map(e => ({ ...e, url: enlaceRegalo(e.url) })) : [];
  const hayRegalos = regalos.mensaje || regalos.sobres || regalos.transferencia?.activa || enlaces.length > 0;
  const asistencia = visible('rsvp') || visible('qr');
  const destino = visible('mensaje') ? '#jardin-mensaje' : lugares ? '#jardin-lugares' : asistencia ? '#jardin-asistencia' : null;

  return <main className={styles.jardin}>
    {visible('portada') && <header className={styles.hero}>
      <div className={styles.heroTop}><span>{tipo === 'boda' ? 'Una historia que florece' : 'Un día para florecer'}</span><span>Con todo el corazón</span></div>
      <div className={styles.stationery}>
        <Flores className={styles.heroFlowersLeft} priority /><Flores className={styles.heroFlowersRight} />
        <div className={styles.invitationCard}>
          <div className={styles.monogram} aria-hidden="true"><Rama /><span>{iniciales}</span></div>
          <p className={styles.eyebrow}>{invitationField(cfg, 'encabezado') ?? (tipo === 'boda' ? 'Nos casamos' : tipo === 'xv' ? 'Mis quince años' : 'Celebremos juntos')}</p>
          <h1 className={styles.names}>{tipo === 'boda' && nombres.length >= 2 ? nombres.map((n, i) => <span key={i}>{i > 0 && <i className={styles.ampersand}>&</i>}{n}</span>) : nombre}</h1>
          <p className={styles.heroNote}>Hay días que se guardan<br />para siempre en el corazón.</p>
          {partesFecha && <div className={styles.date} aria-label={fecha}><span>{mes}</span><strong>{Number(partesFecha[2])}</strong><span>{partesFecha[0]}</span></div>}
          {destino && <a className={styles.discover} href={destino}>Descubre la invitación <span aria-hidden="true">↓</span></a>}
        </div>
        <div className={styles.seal} aria-hidden="true"><Rama /></div>
      </div>
      <p className={styles.heroFoot}>Una invitación hecha con cariño</p>
    </header>}

    {visible('portada') && cfg.fotoPortada && <figure className={styles.coverPhoto}>
      <img src={cfg.fotoPortada} alt={invitationField(cfg, 'fotoPortadaAlt') || cfg.editorial?.fotoAlt || `Fotografía de ${nombre}`} style={{ objectPosition: cfg.encuadrePortada || cfg.editorial?.encuadre || 'center' }} loading="lazy" decoding="async" />
      <figcaption>{tipo === 'boda' ? 'Y elegirnos, una y otra vez.' : 'Lo bonito de la vida es compartirla.'}</figcaption>
    </figure>}

    {visible('mensaje') && <section id="jardin-mensaje" className={`${styles.section} ${styles.message}`}>
      <Rama className={styles.branch} />
      <Encabezado etiqueta={datos.nombre ? `Para ti, ${datos.nombre}` : 'Con mucho cariño'} titulo={<>Lo más bonito es<br /><em>compartirlo contigo.</em></>} />
      {mensaje && <p className={styles.bodyText}>{mensaje}</p>}
      {fotoMensaje && <figure className={styles.messagePhoto}><img src={fotoMensaje} alt={invitationField(cfg, 'fotoMensajeAlt') || 'Un momento de nuestra historia'} loading="lazy" decoding="async" /><span aria-hidden="true">Con amor</span></figure>}
      <p className={styles.signature}>Con todo el corazón,<span>{nombre}</span></p>
    </section>}

    {visible('cuenta_regresiva') && fecha && <section id="jardin-cuenta" className={`${styles.section} ${styles.countSection}`}>
      <Encabezado etiqueta="Cada vez más cerca" titulo={<>Falta muy poco<br /><em>para celebrar.</em></>} />
      <Cuenta fechaHora={cfg.fechaHora} />
    </section>}

    {lugares && <section id="jardin-lugares" className={`${styles.section} ${styles.places}`}>
      <Encabezado etiqueta={fecha || 'Guarda este día'} titulo={<>El lugar de<br /><em>nuestros recuerdos.</em></>} />
      <div className={styles.venues}>
        {visible('ceremonia') && <Lugar datos={ceremonia} tipo="Ceremonia" numero="01" />}
        {visible('recepcion') && <Lugar datos={recepcion} tipo="Recepción" numero="02" />}
      </div>
    </section>}

    {visible('itinerario') && itinerario.length > 0 && <section id="jardin-itinerario" className={`${styles.section} ${styles.program}`}>
      <div className={styles.programHeading}><Rama className={styles.branch} /><Encabezado etiqueta="Cada momento cuenta" titulo={<>Un día<br /><em>inolvidable.</em></>} /><p className={styles.bodyText}>Tiempo de abrazar, brindar<br />y crear nuevos recuerdos.</p></div>
      <ol className={styles.timeline}>{itinerario.map((item, i) => <li key={i}><span className={styles.timelineTime}>{item.hora}</span><div><h3>{item.titulo}</h3>{item.lugar && <p>{item.lugar}</p>}{enlaceSeguro(item.mapsUrl) && <a href={enlaceSeguro(item.mapsUrl)} target="_blank" rel="noopener noreferrer" className={styles.textLink}>Ver ubicación ↗</a>}</div></li>)}</ol>
    </section>}

    {visible('vestimenta') && (vestimenta.codigo || vestimenta.descripcion || colores.length > 0 || pinterest) && <section id="jardin-vestimenta" className={`${styles.section} ${styles.dress}`}>
      <Flores className={styles.dressFlowers} />
      <div className={styles.dressCard}>
        <Encabezado etiqueta="Un toque especial" titulo={<>Viste para<br /><em>celebrar.</em></>} />
        {vestimenta.codigo && <p className={styles.dressCode}>{vestimenta.codigo}</p>}
        {vestimenta.descripcion && <p className={styles.bodyText}>{vestimenta.descripcion}</p>}
        {colores.length > 0 && <div className={styles.reserved}><p>Colores reservados para protagonistas del evento</p><div>{colores.map((color, i) => <span key={`${color}-${i}`}><i style={{ backgroundColor: color }} aria-hidden="true" />{color}</span>)}</div></div>}
        {pinterest && <a className={styles.link} href={pinterest} target="_blank" rel="noopener noreferrer">Inspiración para tu look ↗</a>}
      </div>
    </section>}

    {visible('galeria') && fotos.length > 0 && <section id="jardin-galeria" className={`${styles.section} ${styles.memories}`}>
      <Encabezado etiqueta="Nuestro pequeño álbum" titulo={<>Instantes que<br /><em>se quedan.</em></>} /><Galeria fotos={fotos} />
    </section>}

    {visible('regalos') && hayRegalos && <section id="jardin-regalos" className={`${styles.section} ${styles.gifts}`}>
      <Rama className={styles.branch} /><Encabezado etiqueta="Detalles que abrazan" titulo={<>Tu presencia,<br /><em>el mejor regalo.</em></>} />
      {regalos.mensaje && <p className={styles.bodyText}>{regalos.mensaje}</p>}
      {regalos.sobres && <p className={styles.bodyText}>Habrá un espacio para lluvia de sobres durante la celebración.</p>}
      {enlaces.length > 0 && <div className={styles.giftLinks}>{enlaces.map((enlace, i) => <a key={i} className={styles.link} href={enlace.url} target="_blank" rel="noopener noreferrer"><span>{enlace.nombre}{enlace.codigo && <small>Código: {enlace.codigo}</small>}</span><span aria-hidden="true">↗</span></a>)}</div>}
      {regalos.transferencia?.activa && <div className={styles.transfer}><Transferencia datos={regalos.transferencia} /></div>}
    </section>}

    {asistencia && <section id="jardin-asistencia" className={`${styles.section} ${styles.rsvp}`}>
      <Encabezado etiqueta="Falta lo más importante: tú" titulo={<>¿Nos acompañas<br /><em>a celebrar?</em></>} />
      <div className={styles.ticket}>
        <p className={styles.eyebrow}>Reservado con cariño</p><h3>{datos.nombre || 'Una invitación para ti'}</h3>
        <div className={styles.ticketDetails}><span><strong>{1 + Number(datos.acompanantes || 0)}</strong> lugares</span>{datos.mesa_nombre && <span>Mesa <strong>{datos.mesa_nombre}</strong></span>}</div>
        {visible('rsvp') && <RsvpForm invitado={datos} estado={estado} onEstadoChange={onEstadoChange} preview={preview} />}
        {visible('qr') && estado === 'confirmado' && (preview ? <p className={styles.previewNote}>Vista de muestra. Tu pase QR estará disponible en la invitación real.</p> : datos.token ? <QrCode token={datos.token} /> : null)}
      </div>
      <p className={styles.rsvpNote}>Gracias por ser parte de este día.</p>
    </section>}
    <footer className={styles.footer}><Rama className={styles.branch} /><p>{nombre}</p>{fecha && <span>{fecha}</span>}<span className={styles.brand}>Con cariño, invito</span></footer>
  </main>;
}
