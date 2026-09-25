export function generarToken(nombre) {
  const base = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^a-z0-9\s]/g, "") // quita símbolos raros
    .trim()
    .replace(/\s+/g, "-"); // espacios -> guiones

  const sufijo = crypto.randomUUID();

  return `${base}-${sufijo}`;
}
