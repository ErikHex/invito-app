'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { catalogoPlantillas } from '@/components/invitaciones/plantillas/catalogo';

function AsignacionMuestra({ plantilla, asignacion, eventos }) {
  const [seleccion, setSeleccion] = useState(asignacion?.evento_id || '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const evento = eventos.find(item => item.id === seleccion);
  const cambio = seleccion !== (asignacion?.evento_id || '');

  async function guardar(e) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const { data, error } = await createClient().from('muestras_plantillas')
        .update({ evento_id: seleccion || null }).eq('plantilla', plantilla.id).select('plantilla').single();
      if (error || !data) throw new Error(error?.message || 'No pudimos guardar la muestra.');
      setMessage(seleccion ? 'Muestra actualizada en la página principal.' : 'Muestra retirada de la página principal.');
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return <form className="guest-card" onSubmit={guardar}>
    <h3>{plantilla.nombre}</h3>
    <fieldset disabled={busy} className="grid gap-4 mt-4">
      <label>Evento de muestra
        <select value={seleccion} onChange={e => { setSeleccion(e.target.value); setMessage(''); }}>
          <option value="">Sin muestra pública</option>
          {eventos.map(item => <option key={item.id} value={item.id} disabled={item.publicacion === 'archivado'}>
            {item.nombre_evento} · {item.slug}{item.publicacion === 'archivado' ? ' (archivado)' : ''}
          </option>)}
        </select>
      </label>
      <button className="dash-primary" disabled={!cambio}>{busy ? 'Guardando…' : 'Guardar muestra pública'}</button>
    </fieldset>
    <div className="row-actions mt-4">
      {evento && <><Link href={`/dashboard/${evento.slug}/diseno`}>Editar fotos y contenido ↗</Link><Link href={`/admin/${evento.id}`}>Configurar secciones y estado ↗</Link></>}
      {asignacion?.disponible && <a href={plantilla.demo} target="_blank" rel="noopener noreferrer">Ver muestra publicada ↗</a>}
    </div>
    {asignacion?.evento_id && !asignacion.disponible && <p className="helper">La muestra está oculta porque el evento está archivado.</p>}
    {cambio && <p className="helper">Selección pendiente de guardar.</p>}
    {message && <p role="status" className="mt-3">{message}</p>}
  </form>;
}

export default function MuestrasAdmin({ eventos, asignaciones }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function crear(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      const { data, error } = await createClient().rpc('crear_evento_muestra', {
        nombre_input: form.get('nombre'), slug_input: form.get('slug'),
      });
      if (error) throw error;
      router.push(`/dashboard/${data.slug}/diseno`);
      router.refresh();
    } catch (error) {
      setError(error.code === '23505' ? 'Ese enlace ya existe. Elige otro para esta muestra.' : error.message);
      setBusy(false);
    }
  }

  return <section id="muestras" className="my-8" aria-labelledby="muestras-title">
    <h2 id="muestras-title">Muestras de la página principal</h2>
    <p className="helper">Elige qué evento presenta cada plantilla. Puedes usar el mismo en todas o uno diferente para cada diseño.
      Al guardar una asignación, sus fotos y contenido se muestran públicamente. Los cambios que guardes en el editor se reflejarán en todas las plantillas que usen ese evento.</p>
    <div className="grid gap-4 lg:grid-cols-3 mt-5">
      {catalogoPlantillas.map(plantilla => {
        const asignacion = asignaciones.find(item => item.plantilla === plantilla.id);
        return <AsignacionMuestra key={`${plantilla.id}-${asignacion?.evento_id || ''}-${asignacion?.disponible}`}
          plantilla={plantilla} asignacion={asignacion} eventos={eventos} />;
      })}
    </div>
    <details className="guest-card mt-5">
      <summary>Crear otro evento de muestra</summary>
      <p className="helper mt-3">Empezarás con una boda ficticia completa: textos, fotos de referencia, horarios, lugares, vestimenta, regalos, galería e itinerario. Personalízala antes de asignarla a una plantilla.</p>
      <form onSubmit={crear} className="mt-4">
        <fieldset disabled={busy} className="grid gap-4 md:grid-cols-2">
          <label>Nombre del evento<input name="nombre" required maxLength={160} defaultValue="Mariana & Santiago" /></label>
          <label>Enlace del evento<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="muestra-boda-jardin" /></label>
          <button className="dash-primary">{busy ? 'Preparando…' : 'Crear muestra y editar contenido'}</button>
        </fieldset>
        {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
      </form>
    </details>
  </section>;
}
