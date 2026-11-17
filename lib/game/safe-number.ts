/**
 * Guardas numéricas: nenhum valor do jogo pode virar Infinity ou NaN, porque
 * `JSON.stringify` grava os dois como `null` e corrompe o save.
 */

/** Troca ±Infinity pelo maior number finito e NaN pelo fallback. */
export function clampFinite(value: number, fallback = 0): number {
  if (Number.isNaN(value)) return fallback;
  if (value === Infinity) return Number.MAX_VALUE;
  if (value === -Infinity) return -Number.MAX_VALUE;
  return value;
}

/** Porcentagem entre 0 e 100 que nunca retorna NaN. */
export function safePercent(current: number, max: number): number {
  if (Number.isNaN(current) || Number.isNaN(max) || max <= 0) return 0;
  if (!Number.isFinite(max)) return Number.isFinite(current) ? 0 : 100;
  const pct = (current / max) * 100;
  if (!Number.isFinite(pct)) return 100;
  return Math.min(100, Math.max(0, pct));
}
