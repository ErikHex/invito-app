"use client";

import Link from "next/link";
import { useState } from "react";

const items = [
  ["Resumen", ""],
  ["Invitados", "/invitados"],
  ["Mesas", "/mesas"],
  ["Diseño de invitación", "/diseno"],
];

export default function DashboardNav({ slug, invitacionToken }) {
  const [abierto, setAbierto] = useState(false);
  const base = `/dashboard/${slug}`;
  const invitacionHref = invitacionToken ? `/rsvp/${encodeURIComponent(invitacionToken)}` : null;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={base} className="text-lg font-bold text-gray-900">Invito</Link>
        <button type="button" onClick={() => setAbierto(!abierto)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 sm:hidden" aria-expanded={abierto}>
          {abierto ? "Cerrar" : "Menú"}
        </button>
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Navegación del dashboard">
          {items.map(([label, path]) => <Link key={path} href={`${base}${path}`} className="rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">{label}</Link>)}
          {invitacionHref && <Link href={invitacionHref} target="_blank" className="ml-2 rounded bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-700">Ver invitación</Link>}
        </nav>
      </div>
      {abierto && <nav className="border-t border-gray-200 px-4 py-3 sm:hidden" aria-label="Navegación móvil">
        <div className="grid gap-1">
          {items.map(([label, path]) => <Link key={path} href={`${base}${path}`} onClick={() => setAbierto(false)} className="rounded px-3 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100">{label}</Link>)}
          {invitacionHref && <Link href={invitacionHref} target="_blank" onClick={() => setAbierto(false)} className="rounded bg-gray-900 px-3 py-3 text-sm font-semibold text-white">Ver invitación</Link>}
        </div>
      </nav>}
    </header>
  );
}
