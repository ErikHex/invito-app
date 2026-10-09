'use client';

// Las fotos del evento pueden alojarse en Storage o en hosts de los clientes.
/* eslint-disable @next/next/no-img-element */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RsvpForm from '../../compartidos/RsvpForm';
import QrCode from '../../compartidos/QrCode';
import Transferencia from '../../compartidos/Transferencia';
import { invitationField, pinterestUrl } from '@/lib/invitation-utils';
import { enlaceSeguro, enlaceRegalo, fechaInvitacion, tiempoRestante } from '@/lib/aura-xv';
import { ajusteTextoPortada, tipoCelebracion } from '@/lib/invitation-theme';
import styles from './aura-xv.module.css';
import TextoPortadaEditable from '../../compartidos/TextoPortadaEditable';

function Destello({ className = '' }) {
  return <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M50 2C53 37 63 47 98 50C63 53 53 63 50 98C47 63 37 53 2 50C37 47 47 37 50 2Z" fill="currentColor" /></svg>;
}

function Seccion({ id, etiqueta, titulo, children, className = '' }) {
  const seccionEditor = id.includes('galeria') ? 'fotos'
    : /lugares|itinerario/.test(id) ? 'evento'
      : /vestimenta|regalos/.test(id) ? 'detalles'
        : /mensaje|cuenta/.test(id) ? 'informacion'
          : undefined;
  return <section id={id} className={`${styles.section} ${className}`} data-editor-section={seccionEditor} aria-labelledby={`${id}-titulo`}>
    <div data-reveal><p className={styles.eyebrow}>{etiqueta}</p><h2 id={`${id}-titulo`}>{titulo}</h2></div>
    {children}
  </section>;
}

function Cuenta({ fechaHora }) {
  const [tiempo, setTiempo] = useState(null);
  useEffect(() => {
    function actualizar() { setTiempo(tiempoRestante(fechaHora)); }
    const first = setTimeout(actualizar, 0);
    const interval = setInterval(actualizar, 1000);
    return () => { clearTimeout(first); clearInterval(interval); };
  }, [fechaHora]);
  return <div className={styles.countdown} aria-label="Tiempo que falta para el evento">
    {['dias', 'horas', 'minutos', 'segundos'].map((key, i) => <div key={key}><strong>{tiempo ? String(tiempo[key]).padStart(2, '0') : '—'}</strong><span>{['Días', 'Horas', 'Minutos', 'Segundos'][i]}</span></div>)}
  </div>;
}

function Lugar({ datos, tipo, numero }) {
  if (!datos || !Object.values(datos).some(Boolean)) return null;
  const url = enlaceSeguro(datos.mapsUrl);
  return <article className={styles.venue} data-reveal>
    <div className={styles.venueTop}><span>{numero}</span><span>{tipo}</span><Destello /></div>
    {datos.foto && <img src={datos.foto} alt={datos.fotoAlt || `Lugar de ${tipo.toLowerCase()}`} loading="lazy" decoding="async" className={styles.venuePhoto} />}
    <h3>{datos.lugar || tipo}</h3>
    {datos.hora && <p className={styles.venueTime}>{datos.hora}</p>}
    {datos.direccion && <p className={styles.bodyText}>{datos.direccion}</p>}
    {url && <a className={styles.link} href={url} target="_blank" rel="noopener noreferrer">Cómo llegar <span aria-hidden="true">↗</span><span className={styles.srOnly}> (abre en otra pestaña)</span></a>}
  </article>;
}

function Galeria({ fotos }) {
  const dialog = useRef(null);
  const [seleccionada, setSeleccionada] = useState(null);
  useEffect(() => {
    if (seleccionada === null) return;
    const modal = dialog.current;
    const overflow = document.body.style.overflow;
    modal.showModal();
    document.body.style.overflow = 'hidden';
    return () => { modal.close(); document.body.style.overflow = overflow; };
  }, [seleccionada]);
  return <>
    <div className={styles.gallery}>
      {fotos.map((foto, i) => <button key={`${foto}-${i}`} type="button" onClick={() => setSeleccionada(i)} aria-label={`Ampliar fotografía ${i + 1}`} data-reveal>
        <img src={foto} alt={`Un recuerdo especial, fotografía ${i + 1}`} loading="lazy" decoding="async" /><span aria-hidden="true">{String(i + 1).padStart(2, '0')} / ↗</span>
      </button>)}
    </div>
    <dialog ref={dialog} className={styles.lightbox} aria-label="Fotografía ampliada" onCancel={() => setSeleccionada(null)} onClose={() => setSeleccionada(null)} onClick={event => { if (event.target === event.currentTarget) setSeleccionada(null); }}>
      <button type="button" autoFocus aria-label="Cerrar fotografía" onClick={() => setSeleccionada(null)}>Cerrar ×</button>
      {seleccionada !== null && <img src={fotos[seleccionada]} alt={`Un recuerdo especial, fotografía ${seleccionada + 1}`} />}
    </dialog>
  </>;
}

export default function AuraXV({ datos, estado, onEstadoChange, preview, editorPreview, onPortadaTextoChange }) {
  const root = useRef(null);
  const cfg = datos.configuracion || {};
  const textoPortada = ajusteTextoPortada(cfg, { relativoAContenedor: true });
  const tipo = tipoCelebracion(cfg, 'aura_xv');
  const boda = tipo === 'boda';
  const tituloEvento = tipo === 'xv' ? 'Mis XV' : boda ? 'Nuestra boda' : 'Celebremos';
  const sello = tipo === 'xv' ? 'XV' : boda ? '&' : '✦';
  const visible = key => datos.modulos_activos?.[key] !== false;
  const nombre = (Array.isArray(cfg.nombres) ? cfg.nombres.filter(Boolean).join(boda ? ' & ' : ' ') : '') || datos.evento_nombre || tituloEvento;
  const fecha = fechaInvitacion(cfg.fechaHora);
  const ceremonia = invitationField(cfg, 'ceremonia');
  const recepcion = invitationField(cfg, 'recepcion');
  const mensaje = invitationField(cfg, 'mensajeBase');
  const fotoMensaje = invitationField(cfg, 'fotoMensaje');
  const fotos = Array.isArray(cfg.galeria) ? cfg.galeria.filter(f => typeof f === 'string' && f) : [];
  const itinerario = Array.isArray(cfg.itinerario) ? cfg.itinerario.filter(Boolean) : [];
  const vestimenta = cfg.vestimenta || {};
  const pinterest = pinterestUrl(vestimenta.pinterestUrl);
  const regalos = cfg.regalos || {};
  const enlaces = Array.isArray(regalos.enlaces) ? regalos.enlaces.filter(e => e?.nombre && enlaceRegalo(e.url)).map(e => ({ ...e, url: enlaceRegalo(e.url) })) : [];
  const hayRegalos = Boolean(regalos.mensaje || regalos.sobres || regalos.transferencia?.activa || enlaces.length);
  const hayLugares = (visible('ceremonia') && ceremonia && Object.values(ceremonia).some(Boolean)) || (visible('recepcion') && recepcion && Object.values(recepcion).some(Boolean));
  const destino = visible('mensaje') ? '#aura-mensaje' : hayLugares ? '#aura-lugares' : visible('rsvp') || visible('qr') ? '#aura-asistencia' : null;

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(root.current.querySelectorAll('[data-intro]'), {
        y: 28, opacity: 0, duration: 0.95, stagger: 0.12, ease: 'power3.out', clearProps: 'transform,opacity',
      });
      root.current.querySelectorAll('[data-reveal]').forEach(element => {
        gsap.from(element, {
          y: 24, opacity: 0, duration: 0.75, ease: 'power2.out', clearProps: 'transform,opacity',
          scrollTrigger: { trigger: element, start: 'top 94%', once: true },
        });
      });
    }, root);
    // Cambios de tamaño por fotos o contenido no dejan puntos de entrada desfasados.
    const observer = new ResizeObserver(() => ScrollTrigger.refresh());
    observer.observe(root.current);
    return () => { observer.disconnect(); media.revert(); };
  }, []);

  return <main ref={root} className={styles.aura}>
    {visible('portada') && <header className={styles.hero}>
      <div className={styles.topline} data-intro><span>Una noche. Mil recuerdos.</span><span>{tituloEvento} <Destello /></span></div>
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy} data-portada-contenedor data-editor-section="diseno">
          <p className={styles.eyebrow} data-editor-section="informacion" data-intro>{invitationField(cfg, 'encabezado') ?? 'Un nuevo capítulo'}</p>
          <TextoPortadaEditable as="h1" data-intro style={textoPortada.style} ajuste={textoPortada} editorPreview={editorPreview} onChange={onPortadaTextoChange}>{nombre}<span>{tituloEvento.toLowerCase()}.</span></TextoPortadaEditable>
          <p className={styles.heroNote} data-intro>Hay momentos que se viven una vez.<br />{boda ? 'Este queremos vivirlo contigo.' : 'Este quiero vivirlo contigo.'}</p>
          {fecha && <p className={styles.heroDate} data-editor-section="informacion" data-intro>{fecha}</p>}
          {destino && <a href={destino} className={styles.heroLink} data-intro>Descubre la celebración <span aria-hidden="true">↓</span></a>}
        </div>
        <div className={styles.heroVisual} data-intro>
          {cfg.fotoPortada ? <img src={cfg.fotoPortada} alt={cfg.editorial?.fotoAlt || `Fotografía de ${nombre}`} fetchPriority="high" decoding="async" style={{ objectPosition: cfg.encuadrePortada || cfg.editorial?.encuadre || 'center' }} /> : <div className={styles.coverArt} aria-hidden="true"><span /><Destello /><i>{sello}</i></div>}
          <span className={styles.photoCaption}>{boda ? 'NUESTRO GRAN DÍA' : 'UN MOMENTO ESPECIAL'}</span>
          <div className={styles.xvStamp} aria-hidden="true">{sello}<Destello /></div>
        </div>
      </div>
      <div className={styles.heroBottom} data-intro><span>El comienzo de algo increíble</span><span aria-hidden="true">01 — {tituloEvento}</span></div>
    </header>}

    {visible('mensaje') && <Seccion id="aura-mensaje" etiqueta={datos.nombre ? `Para ti, ${datos.nombre}` : boda ? 'Con todo nuestro cariño' : 'Con todo mi cariño'} titulo={<>{boda ? 'Nuestro mundo es más bonito' : 'Mi mundo es más bonito'}<br /><em>contigo en él.</em></>} className={styles.message}>
      {mensaje && <p className={styles.messageText} data-reveal>{mensaje}</p>}
      {fotoMensaje && <figure className={styles.messagePhoto} data-reveal><img src={fotoMensaje} alt={invitationField(cfg, 'fotoMensajeAlt') || 'Un recuerdo especial'} loading="lazy" decoding="async" /><Destello /></figure>}
      <p className={styles.signature} data-reveal>Con cariño, <span>{nombre}</span></p>
    </Seccion>}

    {visible('cuenta_regresiva') && tiempoRestante(cfg.fechaHora) && <Seccion id="aura-cuenta" etiqueta="La cuenta para una noche inolvidable" titulo={<>Cada vez <em>más cerca.</em></>} className={styles.countSection}>
      <Cuenta fechaHora={cfg.fechaHora} />
    </Seccion>}

    {hayLugares && <Seccion id="aura-lugares" etiqueta="Guarda la fecha" titulo={<>Nos vemos <em>aquí.</em></>}>
      {fecha && <p className={styles.sectionDate}>{fecha}</p>}
      <div className={styles.venues}>
        {visible('ceremonia') && <Lugar datos={ceremonia} tipo="Ceremonia" numero="01" />}
        {visible('recepcion') && <Lugar datos={recepcion} tipo="Recepción" numero="02" />}
      </div>
    </Seccion>}

    {visible('itinerario') && itinerario.length > 0 && <Seccion id="aura-itinerario" etiqueta="Así se vive la celebración" titulo={<>El plan: <em>disfrutar.</em></>}>
      <ol className={styles.timeline}>{itinerario.map((item, i) => <li key={i} data-reveal><span className={styles.timelineNumber}>{String(i + 1).padStart(2, '0')}</span><span className={styles.timelineTime}>{item.hora}</span><div><h3>{item.titulo}</h3>{item.lugar && <p>{item.lugar}</p>}{enlaceSeguro(item.mapsUrl) && <a href={enlaceSeguro(item.mapsUrl)} target="_blank" rel="noopener noreferrer" className={styles.textLink}>Ver ubicación ↗</a>}</div></li>)}</ol>
    </Seccion>}

    {visible('vestimenta') && (vestimenta.codigo || vestimenta.descripcion || pinterest) && <Seccion id="aura-vestimenta" etiqueta="El look de la noche" titulo={<>Ven a <em>brillar.</em></>} className={styles.dress}>
      <Destello className={styles.dressStar} />
      {vestimenta.codigo && <p className={styles.dressCode} data-reveal>{vestimenta.codigo}</p>}
      {vestimenta.descripcion && <p className={styles.bodyText} data-reveal>{vestimenta.descripcion}</p>}
      {pinterest && <a className={styles.link} href={pinterest} target="_blank" rel="noopener noreferrer">Inspiración para tu look ↗</a>}
    </Seccion>}

    {visible('galeria') && fotos.length > 0 && <Seccion id="aura-galeria" etiqueta="Pequeños instantes, grandes recuerdos" titulo={<>Momentos <em>para recordar.</em></>}><Galeria fotos={fotos} /></Seccion>}

    {visible('regalos') && hayRegalos && <Seccion id="aura-regalos" etiqueta="Detalles con cariño" titulo={<>El mejor regalo:<br /><em>que estés aquí.</em></>} className={styles.gifts}>
      {regalos.mensaje && <p className={styles.bodyText} data-reveal>{regalos.mensaje}</p>}
      {regalos.sobres && <p className={styles.bodyText}>Si quieres dar un detalle, habrá lluvia de sobres durante la celebración.</p>}
      <div className={styles.giftLinks}>{enlaces.map((enlace, i) => <a key={i} href={enlaceSeguro(enlace.url)} target="_blank" rel="noopener noreferrer" className={styles.link}>{enlace.nombre}{enlace.codigo && <small>Código: {enlace.codigo}</small>}<span aria-hidden="true">↗</span></a>)}</div>
      {regalos.transferencia?.activa && <div className={styles.transfer}><Transferencia datos={regalos.transferencia} /></div>}
    </Seccion>}

    {(visible('rsvp') || visible('qr')) && <Seccion id="aura-asistencia" etiqueta="Tu lugar en esta historia" titulo={<>¿Celebramos <em>juntos?</em></>} className={styles.rsvp}>
      <div className={styles.ticket}>
        <Destello /><p>{datos.nombre || 'Una invitación para ti'}</p>
        <div className={styles.ticketDetails}><span><strong>{1 + Number(datos.acompanantes || 0)}</strong> lugares para celebrar</span>{datos.mesa_nombre && <span>Mesa <strong>{datos.mesa_nombre}</strong></span>}</div>
        {visible('rsvp') && <RsvpForm invitado={datos} estado={estado} onEstadoChange={onEstadoChange} preview={preview} />}
        {visible('qr') && estado === 'confirmado' && (preview ? <p className={styles.previewNote}>Vista de muestra. Tu pase QR estará disponible en la invitación real.</p> : <QrCode token={datos.token} />)}
      </div>
    </Seccion>}
    <footer className={styles.footer}><Destello /><p>{nombre}<span>Una noche para recordar.</span></p><span className={styles.brand}>invito</span></footer>
  </main>;
}
