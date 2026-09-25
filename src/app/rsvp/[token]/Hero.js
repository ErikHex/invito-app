export default function Hero({
  fotoPortada,
  nombreEvento,
  nombreInvitado,
  mensajeBase,
}) {
  return (
    <div
      className="relative h-screen flex items-end justify-end p-8"
      style={{
        backgroundImage: `url(${fotoPortada})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65), transparent 55%)",
        }}
      />
      <div className="relative text-right text-white max-w-sm">
        <h1
          className="text-4xl mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {nombreEvento}
        </h1>
        <p className="text-lg opacity-90">Hola, {nombreInvitado}</p>
        <p className="text-sm opacity-80 mt-2">{mensajeBase}</p>
      </div>
    </div>
  );
}
