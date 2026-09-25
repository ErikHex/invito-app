export default function Itinerario({ items, colorAcento, colorTexto }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="py-16 px-6 max-w-md mx-auto">
      <h2
        className="text-2xl text-center mb-10"
        style={{ fontFamily: "var(--font-display)", color: colorTexto }}
      >
        Itinerario
      </h2>
      <div className="space-y-6">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex gap-4 items-start border-l-2 pl-4"
            style={{ borderColor: colorAcento }}
          >
            <div
              className="w-16 shrink-0 font-semibold"
              style={{ color: colorAcento }}
            >
              {item.hora}
            </div>
            <div>
              <p
                className="font-semibold"
                style={{ color: colorTexto }}
              >
                {item.titulo}
              </p>
              <p
                className="text-sm opacity-70"
                style={{ color: colorTexto }}
              >
                {item.lugar}
              </p>
              {item.mapsUrl && (
                <a
                  href={item.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline"
                  style={{ color: colorAcento }}
                >
                  Ver ubicación
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
