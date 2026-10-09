export function colorValido(value) {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
}

function luminanciaColor(hex) {
  return hex.slice(1).match(/../g).map((parte) => {
    const canal = parseInt(parte, 16) / 255;
    return canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4;
  }).reduce((total, canal, indice) => total + canal * [0.2126, 0.7152, 0.0722][indice], 0);
}

function mezclarColores(uno, dos, porcentajeUno) {
  const canalesUno = uno.slice(1).match(/../g).map((parte) => parseInt(parte, 16));
  const canalesDos = dos.slice(1).match(/../g).map((parte) => parseInt(parte, 16));
  return `#${canalesUno.map((canal, indice) => Math.round(canal * porcentajeUno + canalesDos[indice] * (1 - porcentajeUno)).toString(16).padStart(2, '0')).join('')}`;
}

function colorTextoLegible(fondo, candidato) {
  if (!colorValido(fondo) || !colorValido(candidato)) return candidato;
  const contraste = (uno, dos) => {
    const [claro, oscuro] = [luminanciaColor(uno), luminanciaColor(dos)].sort((a, b) => b - a);
    return (claro + 0.05) / (oscuro + 0.05);
  };
  if (contraste(fondo, candidato) >= 4.5) return candidato;
  return contraste(fondo, '#ffffff') >= contraste(fondo, '#171719') ? '#ffffff' : '#171719';
}

export function temaInvitacion(configuracion = {}, plantilla) {
  const paleta = paletaInvitacion(configuracion);
  if (paleta) {
    const [fondo, texto, principal] = paleta.colores;
    const textoPrincipal = colorTextoLegible(fondo, texto);
    const fondoPanel = mezclarColores(fondo, textoPrincipal, 0.88);
    const textoPanel = colorTextoLegible(fondoPanel, textoPrincipal);
    return { principal, texto: principal, fondo, textoPrincipal, fondoPanel, textoPanel, paleta };
  }
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
  return { principal, texto, fondo: null, textoPrincipal: null, fondoPanel: '#292927', textoPanel: '#F6F1E7', paleta: null };
}

export function tipoCelebracion(configuracion = {}, plantilla) {
  const tipo = configuracion.tipoEvento;
  return ['xv', 'boda', 'otro'].includes(tipo)
    ? tipo
    : plantilla === 'aura_xv' || plantilla === 'nocturno'
      ? 'xv'
      : 'otro';
}

export function ajusteTextoPortada(configuracion = {}, { relativoAContenedor = false } = {}) {
  const ajuste = configuracion.portada?.texto || {};
  const numero = (valor, predeterminado, minimo, maximo) => {
    const convertido = Number(valor);
    return Number.isFinite(convertido)
      ? Math.min(maximo, Math.max(minimo, convertido))
      : predeterminado;
  };
  const x = numero(ajuste.x, 0, -150, 150);
  const y = numero(ajuste.y, 0, -150, 150);
  const escala = numero(ajuste.escala, 100, 40, 300);
  const rotacion = numero(ajuste.rotacion, 0, -90, 90);
  const interlineado = numero(ajuste.interlineado, 1, 0.7, 2);
  const separacionCaracteres = numero(ajuste.separacionCaracteres, 0, -0.1, 0.5);
  const color = colorValido(ajuste.color) ? ajuste.color : null;
  const efecto = ["sombra", "resplandor", "contorno", "ninguno"].includes(ajuste.efecto)
    ? ajuste.efecto
    : "sombra";
  const sombras = {
    sombra: "0 3px 12px rgb(0 0 0 / .62)",
    resplandor: `0 0 8px ${color || "#ffffff"}, 0 2px 12px rgb(0 0 0 / .48)`,
    contorno: "-1px -1px 0 rgb(0 0 0 / .72), 1px -1px 0 rgb(0 0 0 / .72), -1px 1px 0 rgb(0 0 0 / .72), 1px 1px 0 rgb(0 0 0 / .72)",
    ninguno: "none",
  };
  return {
    x, y, escala, rotacion, interlineado, separacionCaracteres, color, efecto,
    // The editor may render each design in a narrow pane. Container units keep
    // the offset proportional to its own cover instead of the browser window.
    // Both axes use the cover width: this works with inline-size containment and
    // mirrors the pointer math in TextoPortadaEditable.
    style: {
      transform: `translate(${x}${relativoAContenedor ? "cqw" : "vw"}, ${y}${relativoAContenedor ? "cqw" : "vh"}) rotate(${rotacion}deg) scale(${escala / 100})`,
      lineHeight: interlineado,
      letterSpacing: `${separacionCaracteres}em`,
      ...(color ? { color } : {}),
      textShadow: sombras[efecto],
    },
  };
}
import { paletaInvitacion } from "./invitation-palettes.js";
