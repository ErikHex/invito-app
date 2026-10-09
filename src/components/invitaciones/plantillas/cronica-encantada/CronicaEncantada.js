'use client';

/* eslint-disable @next/next/no-img-element */
import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RsvpForm from '../../compartidos/RsvpForm';
import QrCode from '../../compartidos/QrCode';
import Transferencia from '../../compartidos/Transferencia';
import CuentaBanderines from './CuentaBanderines';
import OrbeDorado from './OrbeDorado';
import { invitationField, pinterestUrl } from '@/lib/invitation-utils';
import { enlaceRegalo, enlaceSeguro } from '@/lib/aura-xv';
import { ajusteTextoPortada, tipoCelebracion } from '@/lib/invitation-theme';
import styles from './cronica-encantada.module.css';
import TextoPortadaEditable from '../../compartidos/TextoPortadaEditable';

function fechaLarga(valor) {
  const match = valor?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return '';
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(+match[1], +match[2] - 1, +match[3])));
}

function Vela({ clase }) {
  return <i className={`${styles.candle} ${clase}`} aria-hidden="true"><b /><em /></i>;
}

function Lugar({ titulo, datos, fecha }) {
  if (!datos || !Object.values(datos).some(Boolean)) return null;
  const mapa = enlaceSeguro(datos.mapsUrl);
  return <article className={styles.place}>
    {datos.foto && <img src={datos.foto} alt={datos.fotoAlt || `Lugar de ${titulo.toLowerCase()}`} loading="lazy" decoding="async" style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', marginBottom: 18 }} />}
    <i>✦</i><p>{titulo}</p><h3>{datos.lugar || titulo}</h3>
    <time>{datos.hora}{datos.hora && fecha ? ' · ' : ''}{fecha}</time>
    {datos.direccion && <address>{datos.direccion}</address>}
    {mapa && <a href={mapa} target="_blank" rel="noopener noreferrer">Abrir el portal ↗</a>}
  </article>;
}

function Pergamino({ item, numero }) {
  const [abierto, setAbierto] = useState(false);
  const mapa = enlaceSeguro(item.mapsUrl);
  return <li className={`${styles.parchment} ${abierto ? styles.open : ''}`}>
    <button type="button" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
      <span>{String(numero + 1).padStart(2, '0')}</span><time>{item.hora || '—'}</time><b>{item.titulo || 'Acontecimiento'}</b><i aria-hidden="true">⌄</i>
    </button>
    <div className={styles.parchmentInside}><p>{item.lugar || 'Un momento especialmente preparado para celebrar.'}</p>{mapa && <a href={mapa} target="_blank" rel="noopener noreferrer">Ver ubicación ↗</a>}</div>
  </li>;
}

function Galeria({ fotos }) {
  const [seleccionada, setSeleccionada] = useState(null);
  return <>
    <div className={styles.gallery}>{fotos.map((foto, index) => <button type="button" key={`${foto}-${index}`} onClick={() => setSeleccionada(index)} aria-label={`Ampliar fotografía ${index + 1}`}><img src={foto} alt={`Recuerdo de la celebración, fotografía ${index + 1}`} loading="lazy" decoding="async" /></button>)}</div>
    {seleccionada !== null && <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Fotografía ampliada" onClick={() => setSeleccionada(null)}><button type="button" onClick={() => setSeleccionada(null)} aria-label="Cerrar fotografía">×</button><img src={fotos[seleccionada]} alt={`Fotografía ${seleccionada + 1} ampliada`} onClick={event => event.stopPropagation()} /></div>}
  </>;
}

export { default as OrbeDorado } from './OrbeDorado';

export default function CronicaEncantada({ datos, estado, onEstadoChange, preview, editorPreview, onPortadaTextoChange }) {
  const root = useRef(null);
  const cfg = datos.configuracion || {};
  const textoPortada = ajusteTextoPortada(cfg);
  const visible = key => datos.modulos_activos?.[key] !== false;
  const tipo = tipoCelebracion(cfg, 'cronica_encantada');
  const nombres = Array.isArray(cfg.nombres) ? cfg.nombres.filter(Boolean).join(tipo === 'boda' ? ' & ' : ' ') : datos.evento_nombre;
  const fecha = fechaLarga(cfg.fechaHora);
  const ceremonia = invitationField(cfg, 'ceremonia') || {};
  const recepcion = invitationField(cfg, 'recepcion') || {};
  const itinerario = Array.isArray(cfg.itinerario) ? cfg.itinerario.filter(Boolean) : [];
  const biblioteca = Array.isArray(cfg.bibliotecaFotos || cfg.galeria) ? (cfg.bibliotecaFotos || cfg.galeria).filter(foto => typeof foto === 'string' && foto.trim()) : [];
  const fotosGaleria = Array.isArray(cfg.galeria) ? cfg.galeria.filter(foto => typeof foto === 'string' && foto.trim()) : [];
  const foto = cfg.fotoPortada || biblioteca[0] || null;
  const video = enlaceSeguro(cfg.videoPortada);
  const mensaje = invitationField(cfg, 'mensajeBase');
  const fotoMensaje = invitationField(cfg, 'fotoMensaje');
  const vestimenta = cfg.vestimenta || {};
  const inspiracion = pinterestUrl(vestimenta.pinterestUrl);
  const regalos = cfg.regalos || {};
  const enlacesRegaloValidos = Array.isArray(regalos.enlaces) ? regalos.enlaces.filter(enlace => enlace?.nombre && enlaceRegalo(enlace.url)).map(enlace => ({ ...enlace, url: enlaceRegalo(enlace.url) })) : [];
  const hayVestimenta = vestimenta.codigo || vestimenta.descripcion || inspiracion;
  const hayRegalos = regalos.mensaje || regalos.sobres || regalos.transferencia?.activa || enlacesRegaloValidos.length > 0;
  const encabezado = invitationField(cfg, 'encabezado') || (tipo === 'boda' ? 'Dos destinos se encuentran bajo las estrellas.' : tipo === 'xv' ? 'Una noche para abrir un nuevo capítulo.' : 'La magia nos reúne para celebrar un momento irrepetible.');

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.from(`.${styles.reveal}`, { y: 32, opacity: 0, duration: 1, stagger: .11, ease: 'power3.out', delay: .12 });
      gsap.to(`.${styles.candle}`, { y: -13, rotation: 2, duration: 3.2, stagger: .2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to(`.${styles.candle}`, { x: index => index % 2 ? 42 : -42, rotation: index => index % 2 ? 8 : -8, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 1 } });
    }, root);
    return () => context.revert();
  }, []);

  return <main className={styles.page} ref={root}>
    <div className={styles.stars} /><div className={styles.mist} /><OrbeDorado />
    <div className={styles.candles}>{Array.from({ length: 11 }, (_, index) => <Vela key={index} clase={styles[`c${index + 1}`]} />)}</div>

    {visible('portada') && <>
      <section className={styles.hero} data-editor-section="diseno">
        <p className={`${styles.kicker} ${styles.reveal}`}>{tipo === 'boda' ? 'Una historia escrita entre dos almas' : tipo === 'xv' ? 'Una nueva etapa escrita entre estrellas' : 'Una noche escrita entre las estrellas'}</p>
        <span className={`${styles.sigils} ${styles.reveal}`} aria-hidden="true">☾ · ✦ · ☽</span>
        <TextoPortadaEditable as="h1" className={styles.reveal} style={textoPortada.style} ajuste={textoPortada} editorPreview={editorPreview} onChange={onPortadaTextoChange}>{nombres || 'Una celebración extraordinaria'}</TextoPortadaEditable>
        <p className={`${styles.heroText} ${styles.reveal}`}>{encabezado}</p>
      </section>
      <section className={styles.portrait}><figure>{video ? <video src={video} autoPlay loop muted playsInline poster={foto || undefined} /> : foto ? <img src={foto} alt={`Retrato de ${nombres}`} style={{ objectPosition: cfg.encuadrePortada || 'center' }} /> : <div>Tu retrato<br />encantado</div>}</figure></section>
    </>}

    {visible('cuenta_regresiva') && cfg.fechaHora && <section className={styles.program} data-editor-section="informacion" style={{ marginTop: visible('portada') ? '-74px' : 0, paddingTop: 0, paddingBottom: 38, position: 'relative', zIndex: 3 }}><CuentaBanderines fechaHora={cfg.fechaHora} /></section>}

    {visible('mensaje') && (mensaje || fotoMensaje) && <section className={styles.venues} data-editor-section="informacion">
      <p className={styles.kicker}>{datos.nombre ? `Una carta para ${datos.nombre}` : 'Un mensaje para ti'}</p><h2>El comienzo de la historia</h2>
      <div className={styles.placeGrid}><article className={styles.place} style={{ gridColumn: '1 / -1' }}>
        {fotoMensaje && <img src={fotoMensaje} alt={invitationField(cfg, 'fotoMensajeAlt') || 'Un momento de nuestra historia'} loading="lazy" decoding="async" style={{ width: '100%', maxHeight: 420, objectFit: 'cover', marginBottom: 22 }} />}
        <i>✦</i>{mensaje && <address style={{ fontSize: 20 }}>{mensaje}</address>}
      </article></div>
    </section>}

    {(visible('ceremonia') || visible('recepcion')) && <section className={styles.venues} data-editor-section="evento">
      <p className={styles.kicker}>El mapa de las estrellas</p><h2>Donde la magia sucede</h2>
      <div className={styles.placeGrid}>{visible('ceremonia') && <Lugar titulo="Ceremonia" datos={ceremonia} fecha={fecha} />}{visible('recepcion') && <Lugar titulo="Recepción" datos={recepcion} fecha={fecha} />}</div>
    </section>}

    {visible('itinerario') && itinerario.length > 0 && <section className={styles.program} data-editor-section="evento"><p className={styles.kicker}>El conjuro de la noche</p><h2>La travesía</h2><p className={styles.tapHint}>Toca cada pergamino para revelar el siguiente momento</p><ol>{itinerario.map((item, index) => <Pergamino key={`${item.titulo}-${index}`} item={item} numero={index} />)}</ol></section>}

    {visible('vestimenta') && hayVestimenta && <section className={styles.venues} data-editor-section="detalles">
      <p className={styles.kicker}>Un detalle para la noche</p><h2>Viste para celebrar</h2>
      <div className={styles.placeGrid}><article className={styles.place} style={{ position: 'relative', gridColumn: '1 / -1' }}>
        <img src="/plantillas/cronica-encantada/sombrero-encantado.png" alt="" aria-hidden="true" style={{ position: 'absolute', zIndex: 1, top: '-42px', right: '-31px', width: '144px', height: '192px', objectFit: 'contain', pointerEvents: 'none', filter: 'drop-shadow(0 9px 9px rgba(0,0,0,.42))' }} />
        <i>✦</i><p>Código de vestimenta</p><h3>{vestimenta.codigo || 'Una noche elegante'}</h3>
        {vestimenta.descripcion && <address>{vestimenta.descripcion}</address>}
        {inspiracion && <a href={inspiracion} target="_blank" rel="noopener noreferrer">Inspiración para tu look ↗</a>}
      </article></div>
    </section>}

    {visible('regalos') && hayRegalos && <section className={styles.venues} data-editor-section="detalles">
      <p className={styles.kicker}>Tu presencia es el mayor tesoro</p><h2>Un gesto de cariño</h2>
      <div className={styles.placeGrid}><article className={styles.place} style={{ position: 'relative', overflow: 'visible', gridColumn: '1 / -1' }}>
        <img src="/plantillas/cronica-encantada/lechuza-mensajera.png" alt="" aria-hidden="true" style={{ position: 'absolute', zIndex: 1, top: '-62px', left: '-60px', width: '190px', height: '190px', objectFit: 'contain', pointerEvents: 'none', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,.45))' }} />
        <i>✦</i><p>Con mucho aprecio</p><h3>{regalos.sobres ? 'Lluvia de sobres' : 'Gracias por acompañarnos'}</h3>
        {regalos.mensaje && <address>{regalos.mensaje}</address>}
        {regalos.sobres && <address>Habrá un espacio para tus buenos deseos durante la celebración.</address>}
        {enlacesRegaloValidos.map((enlace, index) => <a key={`${enlace.nombre}-${index}`} href={enlace.url} target="_blank" rel="noopener noreferrer">{enlace.nombre}{enlace.codigo ? ` · Código: ${enlace.codigo}` : ''} ↗</a>)}
        {regalos.transferencia?.activa && <div style={{ marginTop: 22 }}><Transferencia datos={regalos.transferencia} /></div>}
      </article></div>
    </section>}

    {visible('galeria') && fotosGaleria.length > 0 && <section className={styles.memories} data-editor-section="fotos"><p className={styles.kicker}>Recuerdos bajo el mismo cielo</p><h2>El gran salón de los recuerdos</h2><Galeria fotos={fotosGaleria} /></section>}

    {(visible('rsvp') || visible('qr')) && <section className={styles.rsvp}>
      <p className={styles.kicker}>La invitación te ha encontrado</p><h2>¿Serás parte de esta historia?</h2>
      <p>Esta invitación está reservada para <b>{datos.nombre || 'ti'}</b>.</p>
      <p><b>{1 + Number(datos.acompanantes || 0)}</b> lugar{1 + Number(datos.acompanantes || 0) === 1 ? '' : 'es'} disponibles{datos.mesa_nombre ? <> · Mesa <b>{datos.mesa_nombre}</b></> : null}</p>
      {visible('rsvp') && <RsvpForm invitado={datos} estado={estado} onEstadoChange={onEstadoChange} preview={preview} />}
      {visible('qr') && estado === 'confirmado' && (preview ? <p>Vista de muestra: el pase mágico aparecerá en la invitación publicada.</p> : datos.token ? <QrCode token={datos.token} /> : null)}
    </section>}
    <footer>✦ {nombres} ✦ {fecha}</footer>
  </main>;
}
