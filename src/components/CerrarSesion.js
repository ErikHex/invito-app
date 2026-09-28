"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './CerrarSesion.module.css';

export default function CerrarSesion() {
  const [saliendo, setSaliendo] = useState(false);
  const [error, setError] = useState('');

  async function cerrarSesion() {
    if (saliendo) return;
    setSaliendo(true);
    setError('');
    try {
      const { error } = await createClient().auth.signOut({ scope: 'local' });
      if (error) throw error;
      // Una navegación completa descarta el contenido en memoria de la cuenta anterior.
      window.location.replace('/login');
    } catch {
      setError('No pudimos cerrar sesión. Intenta de nuevo.');
      setSaliendo(false);
    }
  }

  return <div className={styles.account}>
    <button type="button" className={styles.button} onClick={cerrarSesion} disabled={saliendo}>
      {saliendo ? 'Cerrando sesión…' : 'Cerrar sesión'}
    </button>
    {error && <p className={styles.error} role="alert">{error}</p>}
  </div>;
}
