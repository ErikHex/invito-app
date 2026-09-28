"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import styles from "./login.module.css";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackError() {
  const params = useSearchParams();
  return params.get("error") === "auth_callback" ? (
    <p role="alert" className={styles.error}>El enlace de acceso no es válido o venció. Solicita uno nuevo.</p>
  ) : null;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const supabase = createClient();

  async function handleGoogleLogin() {
    setCargando(true);
    setMensajeError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
    } catch {
      setMensajeError("No pudimos iniciar sesión con Google. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setCargando(true);
    setMensajeError("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
      setEnviado(true);
    } catch {
      setMensajeError("No pudimos enviar el enlace. Revisa tu correo e intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.story} aria-label="Invito, invitaciones digitales">
        <Link href="/" className={styles.brand} aria-label="Invito, ir al inicio">invito<span>✳</span></Link>
        <div className={styles.storyContent}>
          <p className={styles.eyebrow}>EL COMIENZO DE ALGO ESPECIAL</p>
          <h2>Grandes momentos.<br /><em>Bonitos comienzos.</em></h2>
          <p className={styles.storyDescription}>Cada celebración tiene una historia.<br />La tuya empieza con una invitación.</p>
          <div className={styles.art} aria-hidden="true">
            <div className={styles.orbit} />
            <span className={styles.spark}>✳</span>
            <div className={styles.envelope} />
            <div className={styles.invitation}>
              <span className={styles.cardEyebrow}>JUNTOS ES MEJOR</span>
              <span className={styles.flower}>✳</span>
              <span className={styles.names}>Sofía <i>&</i> Mateo</span>
              <span className={styles.cardRule} />
              <span className={styles.cardDate}>12 · DICIEMBRE · 2026</span>
              <span className={styles.cardNote}>Un día para recordar, contigo.</span>
            </div>
            <div className={styles.seal}>i</div>
            <span className={styles.artCaption}>HECHA PARA COMPARTIR. DISEÑADA PARA EMOCIONAR.</span>
          </div>
        </div>
        <p className={styles.storyFooter}>Tu evento, tu estilo, todos tus invitados.</p>
      </section>

      <section className={styles.access} aria-labelledby="login-title">
        <Link href="/" className={styles.back}><span aria-hidden="true">←</span> Volver al inicio</Link>
        <div className={styles.formArea}>
          {enviado ? (
            <div className={styles.success} role="status" aria-live="polite">
              <div className={styles.iconBadge} aria-hidden="true">✉</div>
              <p className={styles.eyebrow}>YA CASI ESTÁS DENTRO</p>
              <h1 id="login-title">Revisa tu correo</h1>
              <p className={styles.description}>Enviamos un enlace de acceso a <strong>{email.trim()}</strong>. Ábrelo para entrar a tu cuenta.</p>
              <p className={styles.hint}>Si no lo encuentras, revisa tu carpeta de spam o correo no deseado.</p>
              <button type="button" className={styles.secondary} onClick={() => setEnviado(false)}>Usar otro correo</button>
            </div>
          ) : (
            <>
              <div className={styles.iconBadge} aria-hidden="true">✳</div>
              <p className={styles.eyebrow}>TU PRÓXIMA CELEBRACIÓN TE ESPERA</p>
              <h1 id="login-title">Qué gusto verte.</h1>
              <p className={styles.description}>Entra a tu cuenta y sigue dando vida<br className={styles.desktopBreak} /> a ese día tan especial.</p>
              <Suspense fallback={null}><CallbackError /></Suspense>
              {mensajeError && <p role="alert" className={styles.error}>{mensajeError}</p>}
              <button type="button" disabled={cargando} onClick={handleGoogleLogin} className={styles.google}>
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.23c1.89-1.74 2.98-4.3 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.23-2.51c-.9.6-2.05.96-3.39.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.92a6 6 0 0 1 0-3.84V7.49H3.06a10 10 0 0 0 0 9.02l3.34-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.49l3.34 2.59A5.99 5.99 0 0 1 12 5.96Z"/></svg>
                Continuar con Google
              </button>
              <div className={styles.divider}><span>o entra con tu correo</span></div>
              <form onSubmit={handleLogin} className={styles.form} aria-busy={cargando}>
                <label htmlFor="email">Correo electrónico</label>
                <input id="email" name="email" type="email" autoComplete="email" aria-describedby="email-hint" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={cargando} />
                <p id="email-hint" className={styles.inputHint}>Te enviaremos un enlace para entrar sin contraseña.</p>
                <button type="submit" disabled={cargando} className={styles.primary}>
                  {cargando ? "Conectando…" : "Enviar enlace de acceso"}<span aria-hidden="true">↗</span>
                </button>
              </form>
              <p className={styles.note}><span aria-hidden="true">◇</span> Menos contraseñas. Más motivos para celebrar.</p>
            </>
          )}
        </div>
        <footer className={styles.footer}>Hecho para celebrar lo que importa.<span>© {new Date().getFullYear()} Invito</span></footer>
      </section>
    </main>
  );
}
