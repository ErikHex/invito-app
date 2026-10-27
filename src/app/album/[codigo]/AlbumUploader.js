"use client";
/* Guest images are served from the event's configured public media origin. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { optimizeAlbumPhoto } from '@/lib/optimize-album-photo';
import styles from './AlbumUploader.module.css';

const validTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

function CuentaRegresiva({ iniciaAt, ahora }) {
  const fecha = iniciaAt ? new Date(iniciaAt) : null;
  if (!fecha || Number.isNaN(fecha.getTime()) || fecha.getTime() <= ahora) return null;
  const segundos = Math.ceil((fecha.getTime() - ahora) / 1000);
  const unidades = [["Días", Math.floor(segundos / 86400)], ["Horas", Math.floor(segundos % 86400 / 3600)], ["Min", Math.floor(segundos % 3600 / 60)], ["Seg", segundos % 60]];
  return <div className={styles.countdown} aria-label="Cuenta regresiva para abrir el álbum">{unidades.map(([etiqueta, valor]) => <div key={etiqueta}><strong>{String(valor).padStart(2, '0')}</strong><span>{etiqueta}</span></div>)}</div>;
}

export default function AlbumUploader({ codigo, evento, activo, iniciaAt, fotos }) {
  const [estado, setEstado] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const seleccionadasRef = useRef([]);
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const intervalo = window.setInterval(() => setAhora(Date.now()), 1000);
    return () => window.clearInterval(intervalo);
  }, []);
  const esperando = Boolean(iniciaAt && new Date(iniciaAt).getTime() > ahora);

  function limpiarSeleccion() {
    seleccionadasRef.current.forEach((foto) => URL.revokeObjectURL(foto.previa));
    seleccionadasRef.current = [];
    setSeleccionadas([]);
  }

  useEffect(() => () => seleccionadasRef.current.forEach((foto) => URL.revokeObjectURL(foto.previa)), []);

  function elegirFotos(event) {
    const files = Array.from(event.currentTarget.files || []).filter((file) => validTypes.has(file.type));
    event.currentTarget.value = '';
    limpiarSeleccion();
    if (!files.length) return setEstado('Elige fotos JPG, PNG o WebP.');
    const nuevas = files.map((file, index) => ({ id: `${file.name}-${file.lastModified}-${file.size}-${index}`, file, previa: URL.createObjectURL(file) }));
    seleccionadasRef.current = nuevas;
    setSeleccionadas(nuevas);
    setEstado(`Revisa las ${nuevas.length} foto${nuevas.length === 1 ? '' : 's'} antes de enviarlas.`);
  }

  function quitarFoto(id) {
    const siguiente = seleccionadasRef.current.filter((foto) => {
      if (foto.id === id) URL.revokeObjectURL(foto.previa);
      return foto.id !== id;
    });
    seleccionadasRef.current = siguiente;
    setSeleccionadas(siguiente);
  }

  async function subir() {
    const files = seleccionadasRef.current;
    if (!files.length) return;
    setSubiendo(true); setEstado('');
    let exitos = 0;
    try {
      for (let index = 0; index < files.length; index += 1) {
        const { file } = files[index];
        setEstado(`Preparando foto ${index + 1} de ${files.length}…`);
        const optimizada = await optimizeAlbumPhoto(file);
        if (optimizada.size > 8 * 1024 * 1024) {
          throw new Error('No pudimos comprimir una fotografía lo suficiente. Intenta con otra imagen.');
        }
        const permiso = await fetch('/api/shared-album/upload', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codigo, contentType: optimizada.type, size: optimizada.size }),
        });
        const datos = await permiso.json();
        if (!permiso.ok) throw new Error(datos.error || 'No se pudo preparar la fotografía.');
        setEstado(`Subiendo foto ${index + 1} de ${files.length}…`);
        const subida = await fetch(datos.uploadUrl, { method: 'PUT', headers: { 'Content-Type': optimizada.type }, body: optimizada });
        if (!subida.ok) throw new Error('No se pudo subir una fotografía.');
        const registro = await fetch('/api/shared-album/complete', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codigo, key: datos.key, contentType: optimizada.type, size: optimizada.size }),
        });
        if (!registro.ok) throw new Error('La foto se subió, pero no pudimos registrarla. Intenta nuevamente.');
        exitos += 1;
      }
      setEstado(exitos ? `¡Gracias! ${exitos} foto${exitos === 1 ? '' : 's'} recibida${exitos === 1 ? '' : 's'}.` : 'Elige fotos JPG, PNG o WebP que puedan comprimirse para la web.');
      if (exitos === files.length) limpiarSeleccion();
    } catch (error) {
      setEstado(error.message || 'No pudimos subir las fotografías. Intenta de nuevo.');
    } finally { setSubiendo(false); }
  }

  return <main className={styles.page}>
    <div className={styles.frame}>
      <Link href="/" className={styles.brand} aria-label="Invito, inicio">invito<span className={styles.brandMark} aria-hidden="true">✳</span></Link>
      <section className={styles.card}>
        <div className={styles.ornament} aria-hidden="true">✳</div>
        <p className={styles.eyebrow}>ÁLBUM COMPARTIDO</p>
        <h1 className={styles.title}>{evento}</h1>
        <div className={styles.rule} aria-hidden="true" />
        {activo ? <>
          <p className={styles.description}>Comparte los momentos que capturaste. Tus fotografías llegarán directamente a quienes celebran hoy.</p>
          <label className={styles.upload}>
            <span className={styles.uploadIcon} aria-hidden="true">↥</span>
            <strong>{subiendo ? 'Subiendo fotografías…' : 'Elegir fotografías'}</strong>
            <span>Selecciona una o varias imágenes desde tu celular.</span>
            <input className={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={subiendo} onChange={elegirFotos} />
          </label>
          <p className={styles.hint}>JPG, PNG o WebP de cualquier tamaño · las comprimimos antes de subirlas y se guardan como JPG listo para descargar e imprimir</p>
          {seleccionadas.length > 0 && <section className={styles.review} aria-label="Fotos seleccionadas"><div className={styles.reviewHeader}><div><strong>Revisa tu selección</strong><span>{seleccionadas.length} lista{seleccionadas.length === 1 ? '' : 's'} para enviar</span></div><button type="button" className={styles.clear} disabled={subiendo} onClick={limpiarSeleccion}>Quitar todas</button></div><div className={styles.previewGrid}>{seleccionadas.map((foto, index) => <figure key={foto.id} className={styles.preview}><img src={foto.previa} alt={`Vista previa de la foto ${index + 1}`} /><button type="button" disabled={subiendo} onClick={() => quitarFoto(foto.id)} aria-label={`Quitar foto ${index + 1}`}>×</button></figure>)}</div><button type="button" className={styles.confirmUpload} disabled={subiendo} onClick={subir}>{subiendo ? 'Subiendo fotografías…' : `Confirmar y subir ${seleccionadas.length} foto${seleccionadas.length === 1 ? '' : 's'}`}</button></section>}
        </> : esperando ? <section className={styles.waiting}><p>¡Aún no abras el carrete!</p><h2>Las fotos se desbloquean cuando comience la celebración.</h2><CuentaRegresiva iniciaAt={iniciaAt} ahora={ahora} /><small>Mientras tanto, disfruta el momento. Después podrás compartir todos tus recuerdos ✳</small></section> : <p className={styles.closed}>Los anfitriones cerraron la recepción de fotografías. Gracias por acompañarlos y ser parte de este recuerdo.</p>}
        {estado && <p className={styles.status} role="status">{estado}</p>}
        {fotos.length > 0 && <section className={styles.gallery}><h2>Recuerdos compartidos</h2><p>Fotos aprobadas por los anfitriones.</p><div className={styles.grid}>{fotos.map((foto, index) => <img key={foto.id} src={foto.url} alt={`Recuerdo compartido ${index + 1}`} loading="lazy" />)}</div></section>}
      </section>
      <p className={styles.footer}>Invito · Momentos que se quedan contigo</p>
    </div>
  </main>;
}
