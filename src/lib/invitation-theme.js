export function colorValido(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

export function temaInvitacion(configuracion = {}, plantilla) {
  const value = configuracion.tema?.colorAcento;
  const principal = colorValido(value)
    ? value
    : plantilla === 'jardin_romantico'
      ? '#596b4e'
    : plantilla === 'aura_xv'
      ? '#6c538b'
    : plantilla === 'nocturno'
      ? '#7c6cff'
      : plantilla === 'cronica_encantada'
        ? '#c89b45'
      : '#C9A24B';
  let rgb = principal.slice(1).match(/../g).map(value => parseInt(value, 16));
  // Keep small accent text readable on the templates' light paper.
  const luminancia = () => rgb.map(value => {
    const s = value / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  while (luminancia() > 0.14) rgb = rgb.map(value => Math.floor(value * 0.9));
  const texto = `#${rgb.map(value => value.toString(16).padStart(2, '0')).join('')}`;
  return { principal, texto };
}

export function tipoCelebracion(configuracion = {}, plantilla) {
  const tipo = configuracion.tipoEvento;
  return ['xv', 'boda', 'otro'].includes(tipo)
    ? tipo
    : plantilla === 'aura_xv' || plantilla === 'nocturno'
      ? 'xv'
      : 'otro';
}
