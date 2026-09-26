"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackError() {
  const params = useSearchParams();
  return params.get("error") === "auth_callback" ? (
    <p role="alert" className="text-red-600 text-center">El enlace de acceso no es válido o venció. Solicita uno nuevo.</p>
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
        options: { redirectTo: `${window.location.origin}/auth/callback` },
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

  if (enviado) {
    return (
      <main className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gray-50 p-6">
        <p className="text-center text-gray-600">
          Revisa tu correo, te enviamos un link para entrar.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gray-50 p-6">
      <Suspense fallback={null}><CallbackError /></Suspense>
      <button
        disabled={cargando}
        onClick={handleGoogleLogin}
        className="w-80 max-w-full border border-gray-300 py-2 rounded-lg font-semibold mb-4"
      >
        Continuar con Google
      </button>

      {mensajeError && <p role="alert" className="text-red-600 text-center">{mensajeError}</p>}
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow w-80"
      >
        <h1 className="text-xl font-bold mb-4 text-center">Entrar a Invito</h1>
        <input
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 mb-4"
        />
        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-purple-500 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
        >
          {cargando ? "Enviando..." : "Enviar link de acceso"}
        </button>
      </form>
    </main>
  );
}
