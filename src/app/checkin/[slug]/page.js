import { getPanelSession } from "@/lib/panel-server";
import { panel } from "@/lib/panel";
import Link from "next/link";
import styles from "./checkin.module.css";
import CheckinScanner from "./CheckinScanner";
import CerrarSesion from '@/components/CerrarSesion';

export default async function CheckinPage({ params }) {
  const { slug } = await params;
  const session = await getPanelSession();
  const permitido = session.eventos.find(e => e.slug === slug);
  const evento = permitido ? await panel(session.client, 'recepcion', {evento_id: permitido.id}) : null;

  if (!evento) {
    return (
      <main className={styles.page}><div className={styles.content}>
        <p className={styles.eyebrow}>REGISTRO DE ACCESO</p>
        <h1>Este evento no está disponible.</h1>
        <p className={styles.description}>No encontramos el evento o tu cuenta no tiene acceso.</p>
        <Link href="/dashboard" className={styles.back}>← Volver a mis eventos</Link>
        <CerrarSesion />
      </div></main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.brand} aria-label="Invito, mis eventos">invito<span aria-hidden="true">✳</span></Link>
        <Link href="/dashboard" className={styles.back}>← Mis accesos</Link>
        <CerrarSesion />
      </header>
      <div className={styles.content}>
        <div className={styles.badge} aria-hidden="true">✳</div>
        <p className={styles.eyebrow}>CADA BIENVENIDA ES PARTE DE LA HISTORIA</p>
        <h1>Listos para <em>recibirlos.</em></h1>
        <p className={styles.eventName}>{evento.nombre}</p>
        <p className={styles.description}>Escanea el pase QR de cada invitado para registrar su entrada y consultar su mesa.</p>
        <CheckinScanner eventoId={evento.id} />
      </div>
      <footer className={styles.footer}>Hecho para celebrar lo que importa.<span>Invito · Registro de acceso</span></footer>
    </main>
  );
}
