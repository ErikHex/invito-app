import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <span className="text-2xl font-bold text-purple-600">Invito</span>
        <Link
          href="/login"
          className="border border-purple-500 text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition"
        >
          Iniciar sesión
        </Link>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-20 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Invitaciones digitales que sí emocionan
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Bodas, XV años, cumpleaños y más. Diseño innovador, interactivo y sin
          una sola hoja de papel — 100% ecológico, 100% divertido.
        </p>

        <a
          href="#contacto"
          className="inline-block bg-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-600 transition"
        >
          Cotiza tu invitación
        </a>
      </section>

      {/* Features */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-gray-800 mb-2">
              🎨 Diseño a tu medida
            </h3>
            <p className="text-gray-600 text-sm">
              Portada, cuenta regresiva, galería, ubicación — activa solo lo que
              tu evento necesita.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-2">
              📋 Confirmaciones actualizadas
            </h3>
            <p className="text-gray-600 text-sm">
              Ve quién confirmó, quién falta y organiza tus mesas desde un
              dashboard hecho para ti.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-2">
              🎟️ Boleto QR personalizado
            </h3>
            <p className="text-gray-600 text-sm">
              Cada invitado recibe su propio código QR con su mesa — check-in
              rápido el día del evento.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-2">📱 100% responsive</h3>
            <p className="text-gray-600 text-sm">
              Se ve perfecto desde el celular, que es donde tus invitados de
              verdad la van a abrir.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-2">🌱 Ecológico</h3>
            <p className="text-gray-600 text-sm">
              Cero papel, cero impresiones, cero desperdicio. Tan bonito como
              una invitación física, sin el impacto ambiental.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-2">
              ✨ Innovador de verdad
            </h3>
            <p className="text-gray-600 text-sm">
              Nada de plantillas genéricas — construimos algo pensado para tu
              evento, no para cualquiera.
            </p>
          </div>
        </div>
      </section>

      {/* Precio */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          Un solo paquete, todo incluido
        </h2>
        <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg p-8">
          <p className="text-4xl font-bold text-purple-600 mb-2">$XXX</p>
          <p className="text-gray-500 mb-6">precio único por evento</p>
          <ul className="text-left text-gray-600 text-sm space-y-2 mb-8">
            <li>✓ Invitación web personalizada</li>
            <li>✓ RSVP y gestión de invitados</li>
            <li>✓ Organización de mesas</li>
            <li>✓ Boleto QR + check-in el día del evento</li>
            <li>✓ Dashboard con actualización automática</li>
          </ul>

          <a
            href="#contacto"
            className="block bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition"
          >
            Quiero mi invitación
          </a>
        </div>
      </section>

      {/* Contacto */}
      <section
        id="contacto"
        className="bg-purple-500 text-white py-16 px-6 text-center"
      >
        <h2 className="text-2xl font-bold mb-4">¿Listo para tu evento?</h2>
        <p className="mb-8 opacity-90">
          Escríbenos y armamos tu invitación juntos.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/52XXXXXXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            WhatsApp
          </a>

          <a
            href="mailto:hola@invito.com"
            className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition"
          >
            Enviar correo
          </a>
        </div>
      </section>

      <footer className="text-center py-6 text-sm text-gray-400">
        © {new Date().getFullYear()} Invito — Invitaciones digitales
      </footer>
    </main>
  );
}
