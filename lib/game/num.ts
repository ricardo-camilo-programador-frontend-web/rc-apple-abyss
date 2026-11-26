/**
 * Camada numérica do jogo (#47, fase 4).
 *
 * Ouro, HP, dano e custos usam o Decimal do break_infinity.js, que vai até
 * 1e(9e15). Todo o código de jogo importa daqui, nunca direto da biblioteca,
 * para que uma troca futura (por exemplo, break_eternity.js) mexa num lugar só.
 */
import Decimal, { type DecimalSource } from 'break_infinity.js';

export type { DecimalSource };
export { Decimal };

export const ZERO = new Decimal(0);
export const ONE = new Decimal(1);

/** O antigo teto do `number` (≈ 1,79e308): a partir daqui começa o Abismo. */
export const ABYSS_THRESHOLD = new Decimal(Number.MAX_VALUE);

export function isFiniteDecimal(value: Decimal): boolean {
  return Number.isFinite(value.mantissa) && Number.isFinite(value.exponent);
}

/**
 * Converte qualquer valor salvo (number, string do JSON, Decimal ou `null` de
 * um Infinity serializado) em um Decimal finito e não negativo.
 */
export function toDecimal(value: unknown, fallback: Decimal = ZERO): Decimal {
  if (value instanceof Decimal) return isFiniteDecimal(value) && value.gte(0) ? value : fallback;
  if (value === null || value === Infinity) return ABYSS_THRESHOLD;
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? new Decimal(value) : fallback;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    if (value === 'Infinity') return ABYSS_THRESHOLD;
    try {
      const d = new Decimal(value);
      return isFiniteDecimal(d) && d.gte(0) ? d : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/** Porcentagem 0–100 de `current` sobre `max`, sem NaN. */
export function percentOf(current: Decimal, max: Decimal): number {
  if (!isFiniteDecimal(current) || !isFiniteDecimal(max) || max.lte(0)) return 0;
  const pct = current.div(max).toNumber() * 100;
  if (!Number.isFinite(pct)) return 0;
  return Math.min(100, Math.max(0, pct));
}
