export const callingCodes = [
  ['52', 'México'], ['1', 'Estados Unidos / Canadá'], ['54', 'Argentina'],
  ['591', 'Bolivia'], ['55', 'Brasil'], ['56', 'Chile'], ['57', 'Colombia'],
  ['506', 'Costa Rica'], ['53', 'Cuba'], ['593', 'Ecuador'], ['503', 'El Salvador'],
  ['34', 'España'], ['502', 'Guatemala'], ['504', 'Honduras'], ['505', 'Nicaragua'],
  ['507', 'Panamá'], ['595', 'Paraguay'], ['51', 'Perú'], ['598', 'Uruguay'],
  ['58', 'Venezuela'], ['49', 'Alemania'], ['33', 'Francia'], ['39', 'Italia'],
  ['351', 'Portugal'], ['44', 'Reino Unido'], ['61', 'Australia'], ['81', 'Japón'],
];

export function splitPhone(value = '', fallback = '52') {
  const raw = value.trim();
  const digits = raw.replace(/[\s()+.-]/g, '').replace(/^00/, '');
  if (!digits) return { codigo: fallback, numero: '' };
  // Bare ten-digit numbers from a Mexican address book are national numbers.
  if (!raw.startsWith('+') && !raw.startsWith('00') && digits.length === 10 && fallback === '52') {
    return { codigo: '52', numero: digits };
  }
  const match = [...callingCodes].sort((a,b)=>b[0].length-a[0].length).find(([code])=>digits.startsWith(code));
  if (match) return { codigo: match[0], numero: digits.slice(match[0].length) };
  return { codigo: '', numero: digits };
}

export function joinPhone({ codigo, numero }) {
  const digits = numero.replace(/[\s()-]/g, '');
  return digits ? `${codigo}${digits}` : '';
}
