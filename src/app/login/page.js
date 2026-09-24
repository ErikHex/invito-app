"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const supabase = createClient();

  async function handleLogin(e) {
    e.preventDefault();
    setCargando(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setCargando(false);
    if (!error) setEnviado(true);
  }

  if (enviado) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-center text-gray-600">
          Revisa tu correo, te enviamos un link para entrar.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
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
