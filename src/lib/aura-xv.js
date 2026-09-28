export function fechaInvitacion(value) {
  const match = typeof value === 'string' && value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function tiempoRestante(fechaHora, ahora = Date.now()) {
  const target = new Date(fechaHora).getTime();
  if (!fechaHora || !Number.isFinite(target)) return null;
  const total = Math.max(0, Math.floor((target - ahora) / 1000));
  return { dias: Math.floor(total / 86400), horas: Math.floor(total / 3600) % 24, minutos: Math.floor(total / 60) % 60, segundos: total % 60 };
}

export function enlaceSeguro(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

export function enlaceRegalo(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const url = value.trim();
  return enlaceSeguro(/^[a-z][a-z\d+.-]*:/i.test(url) ? url : `https://${url}`);
}
