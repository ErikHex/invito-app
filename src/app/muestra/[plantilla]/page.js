import Link from 'next/link';
import { notFound } from 'next/navigation';
import Invitacion from '@/components/invitaciones/Invitacion';
import { catalogoPlantillas } from '@/components/invitaciones/plantillas/catalogo';
import { sampleInvitation } from '@/lib/sample-invitation';
import styles from './page.module.css';
import { createClient } from '@/lib/supabase/server';

export async function generateMetadata({ params }) {
  const { plantilla } = await params;
  const diseno = catalogoPlantillas.find(item => item.id === plantilla);
  return {
    title: `${diseno?.nombre || 'Invitación'} · Ejemplo | Invito`,
    robots: { index: false, follow: true },
  };
}

export default async function MuestraPage({ params, searchParams }) {
  const { plantilla } = await params;
  if (!catalogoPlantillas.some(item => item.id === plantilla)) notFound();
  const client = await createClient();
  const { data: muestras, error } = await client.from('muestras_plantillas')
    .select('plantilla,nombre_evento,configuracion,modulos_activos').eq('disponible', true);
  if (error) throw new Error('No pudimos cargar la invitación de muestra. Intenta de nuevo.');
  // Cronica encantada may be deployed before its sample-row migration. In that
  // brief interval, reuse another explicitly public sample instead of exposing
  // an event that was not selected for the public gallery.
  const muestra = muestras.find(item => item.plantilla === plantilla)
    || (plantilla === 'cronica_encantada' ? muestras[0] : null);
  if (!muestra) notFound();
  const disponibles = catalogoPlantillas.filter(item => muestras.some(muestra => muestra.plantilla === item.id));
  const portada = (await searchParams).portada === '1';
  return <>
    {!portada && <nav className={styles.bar} aria-label="Ejemplos de invitación">
      <Link href="/#plantillas">← Ver plantillas</Link>
      <span>Evento de muestra · Las respuestas no se guardan</span>
      <div className={styles.designs}>
        {disponibles.map(item => <Link key={item.id} href={item.demo}
          aria-current={plantilla === item.id ? 'page' : undefined}>{item.nombre}</Link>)}
      </div>
    </nav>}
    <Invitacion key={`${plantilla}-${portada}`} datos={sampleInvitation(muestra, { portada })} preview />
  </>;
}
