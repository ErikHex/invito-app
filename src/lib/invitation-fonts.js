export const familiasTipografia = [
  {
    id: "clasica",
    nombre: "Clásica",
    descripcion: "Serif tradicional y sobria",
    muestraTitulo: "Celebramos juntos",
    muestraTexto: "Una celebración para recordar",
    variables: {
      "--font-script": "var(--font-script-allura)",
      "--font-display": 'Georgia, "Times New Roman", serif',
      "--font-text": '"Times New Roman", Times, serif',
    },
  },
  {
    id: "romantica",
    nombre: "Editorial caligráfica",
    descripcion: "Títulos caligráficos y texto con serif",
    muestraTitulo: "Nuestro día especial",
    muestraTexto: "Una historia escrita para compartir",
    variables: {
      "--font-script": "var(--font-script-allura)",
      "--font-display": "var(--font-script-allura)",
      "--font-text": '"Times New Roman", Times, serif',
    },
  },
  {
    id: "contemporanea",
    nombre: "Contemporánea",
    descripcion: "Sans-serif limpia y moderna",
    muestraTitulo: "Una noche para recordar",
    muestraTexto: "Diseño limpio y actual",
    variables: {
      "--font-script": 'Arial, Helvetica, sans-serif',
      "--font-display": 'Arial, Helvetica, sans-serif',
      "--font-text": 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
  },
];

export function tipografiaInvitacion(configuracion = {}) {
  const seleccion = configuracion.tema?.tipografia;
  return familiasTipografia.find((familia) => familia.id === seleccion) || familiasTipografia[0];
}
