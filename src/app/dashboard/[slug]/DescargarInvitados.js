'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Paginar evita que el límite de filas del servidor recorte el respaldo.
async function leerTodos(client, tabla, columnas, eventoId) {
  const rows = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client.from(tabla).select(columnas)
      .eq('evento_id', eventoId).order('id').range(offset, offset + pageSize - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < pageSize) return rows;
  }
}

export default function DescargarInvitados({ eventoId, eventoNombre }) {
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState('');
  const descargando = useRef(false);

  async function descargar() {
    if (descargando.current) return;
    descargando.current = true;
    setOcupado(true);
    setError('');
    try {
      const client = createClient();
      const [pdf, invitados, mesas] = await Promise.all([
        import('@/lib/guest-pdf'),
        leerTodos(client, 'invitados', 'id,nombre,mesa_id,estado,acompanantes,entradas', eventoId),
        leerTodos(client, 'mesas', 'id,nombre', eventoId),
      ]);
      const documento = pdf.crearPdfInvitados({ eventoNombre, invitados, mesas });
      await documento.save(pdf.nombrePdf(eventoNombre), { returnPromise: true });
    } catch {
      setError('No pudimos descargar el respaldo actualizado. Revisa tu conexión e intenta de nuevo.');
    } finally {
      descargando.current = false;
      setOcupado(false);
    }
  }

  return <section className="guest-card mb-6" aria-label="Respaldo para recepción">
    <div className="guest-heading">
      <div><h2>Tu lista, también sin internet</h2><p className="helper">PDF con todos los invitados, sus mesas y espacio para registrar llegadas. Incluye una lista alfabética y otra por mesa.</p></div>
      <button type="button" className="dash-primary" onClick={descargar} disabled={ocupado}>{ocupado ? 'Preparando PDF…' : 'Descargar lista para recepción'}</button>
    </div>
    <p className="helper">Descárgalo con internet antes del evento y guárdalo o imprímelo. Incluye todos los estados de respuesta, sin aplicar los filtros de esta pantalla. Las anotaciones no se sincronizan.</p>
    <p role="status" className="helper">{ocupado ? 'Consultando la lista completa y las mesas actuales…' : ''}</p>
    {error && <p role="alert">{error}</p>}
  </section>;
}
