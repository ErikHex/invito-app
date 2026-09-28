export function pinterestUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && /^(www\.)?(pinterest\.(com|com\.mx|es)|pin\.it)$/.test(url.hostname) ? url.href : null;
  } catch { return null; }
}
export function validClabe(value) {
  if (!/^\d{18}$/.test(value)) return false;
  const sum = [...value.slice(0, 17)].reduce((n, digit, i) => n + (Number(digit) * [3, 7, 1][i % 3]) % 10, 0);
  return (10 - sum % 10) % 10 === Number(value[17]);
}
export function normalizePhone(value) { return value.replace(/[\s()+-]/g, ''); }
export function validPhone(value) { return /^[1-9]\d{7,14}$/.test(normalizePhone(value)); }
export function guestMatches(guest, filter) {
  if (filter === 'pendientes') return guest.envio_estado !== 'enviada';
  if (filter === 'verificar') return guest.envio_estado === 'por_verificar';
  if (filter === 'sin_telefono') return !guest.telefono;
  if (filter === 'sin_respuesta') return guest.envio_estado === 'enviada' && guest.estado === 'pendiente';
  return true;
}
// An explicitly cleared field must not bring back the legacy editorial value.
export function invitationField(config, field) {
  return Object.hasOwn(config, field) ? config[field] : config.editorial?.[field];
}
