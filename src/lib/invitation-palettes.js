// Paletas cerradas: cada combinación fue definida como un sistema completo,
// para que el usuario no tenga que resolver contraste o armonía de colores.
export const familiasPaleta = [
  { id: "neutros", nombre: "Neutros", descripcion: "Blanco, crema y negro", variantes: [
    { id: "marfil", nombre: "Marfil clásico", colores: ["#F7F1E7", "#292927", "#B58A45"] },
    { id: "noche", nombre: "Negro elegante", colores: ["#171719", "#F8F1E7", "#D4AD67"] },
  ] },
  { id: "rosas", nombre: "Rosas", descripcion: "Del blush al fucsia", variantes: [
    { id: "blush", nombre: "Blush romántico", colores: ["#FFF4F5", "#4C3038", "#B8677B"] },
    { id: "fucsia", nombre: "Fucsia vibrante", colores: ["#351126", "#FFF4FA", "#F05C9B"] },
  ] },
  { id: "rojos", nombre: "Rojos", descripcion: "Coral, rojo y vino", variantes: [
    { id: "coral", nombre: "Coral luminoso", colores: ["#FFF4EF", "#522C27", "#DD6B54"] },
    { id: "vino", nombre: "Vino profundo", colores: ["#31171F", "#FFF4F0", "#B74C5C"] },
  ] },
  { id: "tierras", nombre: "Tierras", descripcion: "Durazno, terracota y cobre", variantes: [
    { id: "durazno", nombre: "Durazno suave", colores: ["#FFF5ED", "#59392B", "#D8875B"] },
    { id: "terracota", nombre: "Terracota", colores: ["#3A211B", "#FFF4EA", "#D16D46"] },
  ] },
  { id: "dorados", nombre: "Dorados", descripcion: "Miel, mostaza y champagne", variantes: [
    { id: "miel", nombre: "Miel dorada", colores: ["#FFF9E9", "#47391D", "#B98722"] },
    { id: "mostaza", nombre: "Mostaza nocturna", colores: ["#292315", "#FFF8E5", "#D8A62D"] },
  ] },
  { id: "verdes", nombre: "Verdes", descripcion: "Menta, salvia y esmeralda", variantes: [
    { id: "salvia", nombre: "Salvia botánica", colores: ["#F2F6EE", "#2E4237", "#64815E"] },
    { id: "esmeralda", nombre: "Esmeralda", colores: ["#102E2B", "#F0FAF5", "#3AA77C"] },
  ] },
  { id: "azules", nombre: "Azules", descripcion: "Cielo, rey, marino y petróleo", variantes: [
    { id: "cielo", nombre: "Azul cielo", colores: ["#F0F8FF", "#24394F", "#5B99C8"] },
    { id: "marino", nombre: "Azul marino", colores: ["#152438", "#F3F8FF", "#5B9ED1"] },
  ] },
  { id: "morados", nombre: "Morados", descripcion: "Lila, violeta y ciruela", variantes: [
    { id: "lavanda", nombre: "Lavanda etérea", colores: ["#F7F3FF", "#3D3152", "#9574BF"] },
    { id: "ciruela", nombre: "Ciruela nocturna", colores: ["#29172F", "#FCF4FF", "#B76CB5"] },
  ] },
];

const paletas = familiasPaleta.flatMap((familia) => familia.variantes.map((variante) => ({
  ...variante,
  id: `${familia.id}:${variante.id}`,
  familia: familia.nombre,
})));

export function paletaInvitacion(configuracion = {}) {
  const seleccion = configuracion.tema?.paleta;
  return paletas.find((paleta) => paleta.id === seleccion) || null;
}
