/**
 * Calculates points for a prediction:
 * - 3 points: exact score
 * - 1 point: correct winner/draw
 * - 0 points: wrong
 */
export function calcularPuntos(pronostico, resultado) {
  const { golesLocal: pL, golesVisita: pV } = pronostico;
  const { golesLocal: rL, golesVisita: rV } = resultado;

  if (pL === rL && pV === rV) return 3;

  const ganadorPron = pL > pV ? 'local' : pL < pV ? 'visita' : 'empate';
  const ganadorReal = rL > rV ? 'local' : rL < rV ? 'visita' : 'empate';

  return ganadorPron === ganadorReal ? 1 : 0;
}

export function formatFecha(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const COSTO_INSCRIPCION = 15000; // COP
