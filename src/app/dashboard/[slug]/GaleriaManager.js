"use client";
/* Customer-uploaded images use public Storage URLs. */
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GaleriaManager({ eventoId, configuracion, onChange, onBusy }) {
  const [progreso, setProgreso] = useState("");
  const [error, setError] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const reemplazo = useRef(null);
  const replaceInput = useRef(null);
  const fotos = configuracion.bibliotecaFotos || configuracion.galeria || [];
  const galeria = configuracion.galeria || [];

  function reemplazarReferencias(config, anterior, nueva) {
    if (typeof config === 'string') return config === anterior ? nueva : config;
    if (Array.isArray(config)) return config.map(v => reemplazarReferencias(v, anterior, nueva)).filter(v => v !== null);
    if (config && typeof config === 'object') return Object.fromEntries(Object.entries(config).map(([k,v]) => [k, reemplazarReferencias(v, anterior, nueva)]));
    return config;
  }
  async function subir(event) {
    const files = Array.from(event.target.files || []);
    const target = reemplazo.current;
    reemplazo.current = null;
    if (!files.length) return;
    setError(""); setSubiendo(true); onBusy(true);
    let siguiente = { ...configuracion, bibliotecaFotos: fotos };
    const fallos = [];
    try {
      for (let i=0; i<files.length; i++) {
        const file = files[i];
        setProgreso(`Subiendo ${i+1} de ${files.length}…`);
        if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 8*1024*1024) {
          fallos.push(`${file.name}: usa JPG, PNG o WebP de hasta 8 MB.`); continue;
        }
        const ext = { 'image/jpeg':'jpg','image/png':'png','image/webp':'webp' }[file.type];
        const path = `${eventoId}/${crypto.randomUUID()}.${ext}`;
        const storage = createClient().storage.from('fotos_eventos');
        const { error } = await storage.upload(path, file, { contentType: file.type });
        if (error) { fallos.push(`${file.name}: no se pudo subir. Intenta de nuevo.`); continue; }
        const url = storage.getPublicUrl(path).data.publicUrl;
        if (target) siguiente = reemplazarReferencias(siguiente, target, url);
        else siguiente = { ...siguiente, bibliotecaFotos: [...siguiente.bibliotecaFotos, url], galeria: [...(siguiente.galeria || []), url] };
      }
      onChange(siguiente);
      setError(fallos.join(' '));
      setProgreso('Carga terminada. Guarda los cambios para publicar tus fotos.');
    } catch { setError('La carga se interrumpió. Revisa tu conexión.'); onChange(siguiente); }
    finally { setSubiendo(false); onBusy(false); event.target.value = ''; }
  }
  function quitar(url) {
    if (!window.confirm('¿Quitar esta foto de la biblioteca y de las secciones donde se usa? Se publicará al guardar.')) return;
    onChange(reemplazarReferencias({ ...configuracion, bibliotecaFotos: fotos }, url, null));
  }
  function mover(url, delta) {
    const ordered = [...galeria], i = ordered.indexOf(url), j = i + delta;
    if (i < 0 || j < 0 || j >= ordered.length) return;
    [ordered[i],ordered[j]] = [ordered[j],ordered[i]];
    onChange({ ...configuracion, galeria: ordered });
  }
  return <section className="photo-library">
    <h3>Tu biblioteca de fotografías</h3>
    <p className="helper">Sube varias fotos y elige cuáles mostrar en la galería. JPG, PNG o WebP · hasta 8 MB por foto.</p>
    <label className="upload-zone">Agregar fotografías<input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={subiendo} onChange={subir} /></label>
    <input ref={replaceInput} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={subir} />
    {progreso && <p role="status" className="helper">{progreso}</p>}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <div className="photo-grid">{fotos.map((url,i) => <article key={url} className="photo-card">
      <img src={url} alt={`Fotografía ${i+1}`} />
      <p className="helper">{[[configuracion.fotoPortada,'Portada'],[configuracion.fotoMensaje || configuracion.editorial?.fotoMensaje,'Mensaje'],[configuracion.ceremonia?.foto || configuracion.editorial?.ceremonia?.foto,'Ceremonia'],[configuracion.recepcion?.foto,'Recepción']].filter(([v])=>v===url).map(([,n])=>n).join(' · ') || 'Sin sección asignada'}</p>
      <label><input type="checkbox" checked={galeria.includes(url)} disabled={subiendo} onChange={e=>onChange({ ...configuracion, galeria:e.target.checked ? [...galeria,url] : galeria.filter(v=>v!==url) })} /> Mostrar en galería</label>
      <div className="row-actions">
        <button type="button" disabled={subiendo || galeria.indexOf(url)<=0} onClick={()=>mover(url,-1)} aria-label={`Mover foto ${i+1} antes`}>←</button>
        <button type="button" disabled={subiendo || !galeria.includes(url) || galeria.indexOf(url)===galeria.length-1} onClick={()=>mover(url,1)} aria-label={`Mover foto ${i+1} después`}>→</button>
        <button type="button" disabled={subiendo} onClick={()=>{ reemplazo.current=url; replaceInput.current.click(); }}>Reemplazar</button>
        <button type="button" disabled={subiendo} onClick={()=>quitar(url)}>Quitar</button>
      </div>
      {galeria.includes(url) && <p className="helper">Posición en galería: {galeria.indexOf(url)+1}</p>}
    </article>)}</div>
    {!fotos.length && <p className="helper">Aquí empieza la historia visual de tu celebración.</p>}
  </section>;
}
