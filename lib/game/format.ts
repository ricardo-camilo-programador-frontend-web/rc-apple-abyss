/**
 * Formatação única de números do jogo.
 *
 * Toda quantidade exibida (ouro, HP, custos, DPS) passa por aqui para que a tela
 * nunca mostre dezenas de grupos de zeros. O núcleo trabalha com o par
 * (mantissa, expoente) em base 10, o que permite formatar valores além do
 * teto do `number` quando eles vierem de um Decimal.
 */

export const NUMBER_NOTATIONS = ['mixed', 'letters', 'scientific', 'engineering'] as const;
export type NumberNotation = (typeof NUMBER_NOTATIONS)[number];
export const DEFAULT_NOTATION: NumberNotation = 'mixed';

/** Sufixos da escala curta, um por potência de mil: K = 1e3 … Dc = 1e33. */
const SHORT_SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
/** Na notação Letras, K/M/B/T vêm antes de aa (1e15), ab (1e18)… */
const LETTERS_BEFORE_AA = 5;

export interface FormatOptions {
  notation?: NumberNotation;
  /** Idioma do jogo (código BCP 47). Define o separador decimal. */
  locale?: string;
  /** Casas decimais abaixo de 1000 (truncadas). Padrão 0. */
  decimals?: number;
  /** Casas decimais da mantissa a partir de 1000. Padrão 2. */
  places?: number;
}

/** Valor em notação científica: sinal × mantissa × 10^expoente, com 1 ≤ mantissa < 10. */
export interface SciParts {
  sign: -1 | 1;
  mantissa: number;
  exponent: number;
}

/** Qualquer coisa que o formatador aceita: number ou um objeto com mantissa/expoente (Decimal). */
export type Formattable = number | { mantissa: number; exponent: number; sign?: number };

export function isNumberNotation(value: unknown): value is NumberNotation {
  return typeof value === 'string' && (NUMBER_NOTATIONS as ReadonlyArray<string>).includes(value);
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, min: number, max: number): Intl.NumberFormat {
  const key = `${locale}|${min}|${max}`;
  let nf = formatterCache.get(key);
  if (!nf) {
    try {
      nf = new Intl.NumberFormat(locale, {
        minimumFractionDigits: min,
        maximumFractionDigits: max,
        numberingSystem: 'latn',
        roundingMode: 'trunc',
      } as Intl.NumberFormatOptions);
    } catch {
      nf = new Intl.NumberFormat('en', { minimumFractionDigits: min, maximumFractionDigits: max });
    }
    formatterCache.set(key, nf);
  }
  return nf;
}

function fixed(value: number, places: number, locale: string): string {
  // O valor já chega arredondado; o formatter só aplica o separador do idioma.
  return getFormatter(locale, places, places).format(value);
}

/** Arredonda para `places` casas tolerando o erro binário (9.995 → 10.00, não 9.99). */
function roundTo(value: number, places: number): number {
  const f = 10 ** places;
  return Math.round(value * f * (1 + 1e-12)) / f;
}

function truncate(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.trunc(value * f + 1e-9) / f;
}

/** Converte um number ou Decimal em partes científicas. Retorna null para 0, NaN e ±Infinity. */
export function toSciParts(value: Formattable): SciParts | null {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value === 0) return null;
    const abs = Math.abs(value);
    let exponent = Math.floor(Math.log10(abs));
    let mantissa = abs / 10 ** exponent;
    if (!Number.isFinite(mantissa)) {
      // Subnormais: divide em duas etapas para não estourar.
      mantissa = abs / 10 ** (exponent + 10) / 1e-10;
    }
    if (mantissa >= 10) {
      mantissa /= 10;
      exponent += 1;
    } else if (mantissa < 1) {
      mantissa *= 10;
      exponent -= 1;
    }
    return { sign: value < 0 ? -1 : 1, mantissa, exponent };
  }
  const { mantissa, exponent } = value;
  if (!Number.isFinite(mantissa) || !Number.isFinite(exponent) || mantissa === 0) return null;
  const sign = (value.sign ?? Math.sign(mantissa)) < 0 ? -1 : 1;
  return { sign, mantissa: Math.abs(mantissa), exponent };
}

function specialValue(value: Formattable): string | null {
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return '—';
    if (value === Infinity) return '∞';
    if (value === -Infinity) return '-∞';
    return null;
  }
  if (Number.isNaN(value.mantissa) || Number.isNaN(value.exponent)) return '—';
  if (!Number.isFinite(value.mantissa) || value.exponent === Infinity) {
    return value.mantissa < 0 ? '-∞' : '∞';
  }
  return null;
}

/** Mantissa arredondada para `places` casas, com virada para a próxima potência. */
function roundedScientific(parts: SciParts, places: number): { m: number; e: number } {
  let m = roundTo(parts.mantissa, places);
  let e = parts.exponent;
  if (m >= 10) {
    m /= 10;
    e += 1;
  }
  return { m, e };
}

/** Mantissa em grupos de mil (1 ≤ m < 1000), arredondada, com virada de grupo. */
function roundedEngineering(parts: SciParts, places: number): { m: number; e: number } {
  const e3 = Math.floor(parts.exponent / 3) * 3;
  let m = roundTo(parts.mantissa * 10 ** (parts.exponent - e3), places);
  let e = e3;
  if (m >= 1000) {
    m = roundTo(m / 1000, places);
    e += 3;
  }
  return { m, e };
}

function letterSuffix(tier: number): string {
  if (tier < LETTERS_BEFORE_AA) return SHORT_SUFFIXES[tier];
  let idx = tier - LETTERS_BEFORE_AA;
  let out = '';
  // aa, ab … az, ba … zz, aaa …
  let width = 2;
  let span = 26 ** width;
  while (idx >= span) {
    idx -= span;
    width += 1;
    span = 26 ** width;
  }
  for (let i = 0; i < width; i++) {
    out = String.fromCharCode(97 + (idx % 26)) + out;
    idx = Math.floor(idx / 26);
  }
  return out;
}

/**
 * Formata um valor para a tela: no máximo 3 algarismos inteiros, `places` casas
 * e um sufixo ou expoente. Abaixo de 1000 mostra o número truncado.
 */
export function formatNumber(value: Formattable, options: FormatOptions = {}): string {
  const special = specialValue(value);
  if (special) return special;

  const { notation = DEFAULT_NOTATION, locale = 'en', decimals = 0, places = 2 } = options;
  const parts = toSciParts(value);
  if (!parts) return fixed(0, decimals, locale);
  const sign = parts.sign < 0 ? '-' : '';

  if (parts.exponent < 3) {
    const abs = Number((parts.mantissa * 10 ** parts.exponent).toPrecision(15));
    return sign + fixed(truncate(abs, decimals), decimals, locale);
  }

  if (notation === 'scientific') {
    const { m, e } = roundedScientific(parts, places);
    return `${sign}${fixed(m, places, locale)}e${e}`;
  }

  const { m, e } = roundedEngineering(parts, places);
  if (notation === 'engineering') {
    return `${sign}${fixed(m, places, locale)}e${e}`;
  }

  const tier = e / 3;
  if (notation === 'letters') {
    return `${sign}${fixed(m, places, locale)}${letterSuffix(tier)}`;
  }

  // Misto: sufixos até Dc (< 1e36), científica depois.
  if (tier < SHORT_SUFFIXES.length) {
    return `${sign}${fixed(m, places, locale)}${SHORT_SUFFIXES[tier]}`;
  }
  const sci = roundedScientific(parts, places);
  return `${sign}${fixed(sci.m, places, locale)}e${sci.e}`;
}

/** Valor completo para tooltip e leitor de tela: todos os dígitos até 1e15, científica longa depois. */
export function formatFull(value: Formattable, locale = 'en'): string {
  const special = specialValue(value);
  if (special) return special;
  const parts = toSciParts(value);
  if (!parts) return '0';
  const sign = parts.sign < 0 ? '-' : '';
  if (parts.exponent < 15) {
    const abs = Math.floor(Number((parts.mantissa * 10 ** parts.exponent).toPrecision(15)));
    return sign + getFormatter(locale, 0, 0).format(abs);
  }
  const m = roundTo(parts.mantissa, 6);
  return m >= 10
    ? `${sign}1.000000e${parts.exponent + 1}`
    : `${sign}${m.toFixed(6)}e${parts.exponent}`;
}
