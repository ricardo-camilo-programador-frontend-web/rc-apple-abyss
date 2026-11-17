import { calculateMaxAppleHP } from './balance';
import { CURRENT_SAVE_VERSION, INITIAL_STATE } from './constants';
import { isNumberNotation } from './format';
import { ABYSS_THRESHOLD, Decimal, toDecimal, ZERO } from './num';
import type { GameState } from './types';

export { CURRENT_SAVE_VERSION };

type RawSave = Record<string, unknown>;
export type MigratedSave = Partial<GameState> & { saveVersion: number };

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const INTEGER_FIELDS = [
  'stage',
  'highestStage',
  'clickLevel',
  'totalClicks',
  'totalApplesEaten',
  'luckyWorms',
  'abyssDepth',
] as const;

function isObject(value: unknown): value is RawSave {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cleanCopy(value: RawSave): RawSave {
  const out: RawSave = {};
  for (const [k, v] of Object.entries(value)) {
    if (!DANGEROUS_KEYS.has(k)) out[k] = v;
  }
  return out;
}

function intValue(value: unknown, fallback: number, min = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min) return fallback;
  return Math.floor(value);
}

function sanitizeIntRecord(value: unknown): Record<string, number> | undefined {
  if (!isObject(value)) return undefined;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(value)) {
    if (!DANGEROUS_KEYS.has(k)) out[k] = intValue(v, 0);
  }
  return out;
}

/**
 * Leva qualquer save (de qualquer versão) ao formato atual.
 *
 * - v1 (até a v0.2.1): sem `saveVersion` nem `settings.notation`; números em
 *   `number`, e campos que estouraram para Infinity foram gravados como `null`.
 * - v2: igual à v1, com `saveVersion` e números sempre finitos.
 * - v3: HP pela curva nova de dois trechos (fase 3 do #47).
 * - v4: ouro, HP e `statistics.totalGoldEarned` em Decimal (break_infinity.js),
 *   gravados como string no JSON; campo `abyssDepth`.
 *
 * A limpeza roda em todo load, não só na migração, para que um save editado à
 * mão nunca injete NaN ou Infinity no estado.
 */
export function migrateSave(raw: unknown): MigratedSave {
  if (!isObject(raw)) return { saveVersion: CURRENT_SAVE_VERSION };
  const version = typeof raw.saveVersion === 'number' ? raw.saveVersion : 1;
  const save = cleanCopy(raw);

  for (const field of INTEGER_FIELDS) {
    if (field in save) {
      const min = field === 'stage' || field === 'highestStage' ? 1 : 0;
      save[field] = intValue(save[field], INITIAL_STATE[field], min);
    }
  }
  const stage = typeof save.stage === 'number' ? save.stage : INITIAL_STATE.stage;

  // v1–v3 guardavam number (ou null para Infinity); v4 guarda string. toDecimal aceita os três.
  if ('gold' in save) save.gold = toDecimal(save.gold);

  if ('maxAppleHP' in save) {
    const max = toDecimal(save.maxAppleHP, ZERO);
    save.maxAppleHP = max.gte(1) && max.lt(ABYSS_THRESHOLD) ? max : calculateMaxAppleHP(stage);
  }
  if ('appleHP' in save) {
    const max = (save.maxAppleHP as Decimal | undefined) ?? calculateMaxAppleHP(stage);
    const hp = toDecimal(save.appleHP, ZERO);
    save.appleHP = hp.gt(0) && hp.lte(max) ? hp : max;
  }

  // v1/v2 → v3: o HP foi calculado com a curva antiga (1,5^estágio). Recalcula o
  // máximo pela curva nova e mantém a mesma porcentagem de vida da maçã.
  if (version < 3 && save.maxAppleHP instanceof Decimal) {
    const oldMax = save.maxAppleHP;
    const oldHP = save.appleHP instanceof Decimal ? save.appleHP : oldMax;
    const ratio = Math.min(1, Math.max(0, oldHP.div(oldMax).toNumber()));
    const newMax = calculateMaxAppleHP(stage);
    save.maxAppleHP = newMax;
    // maçã cheia copia o máximo direto: mul(1).ceil() pode mudar o último dígito.
    save.appleHP =
      ratio >= 1 || oldHP.gte(oldMax)
        ? newMax
        : Decimal.min(newMax, Decimal.max(1, newMax.mul(ratio).ceil()));
  }

  const worms = sanitizeIntRecord(save.worms);
  if (worms) save.worms = worms;
  else delete save.worms;

  if (isObject(save.statistics)) {
    const stats = cleanCopy(save.statistics);
    for (const [k, v] of Object.entries(stats)) {
      stats[k] = k === 'totalGoldEarned' ? toDecimal(v) : intValue(v, 0);
    }
    save.statistics = stats;
  } else {
    delete save.statistics;
  }

  if (isObject(save.lastOfflineResult)) {
    const r = save.lastOfflineResult;
    save.lastOfflineResult = { apples: intValue(r.apples, 0), gold: toDecimal(r.gold) };
  } else {
    delete save.lastOfflineResult;
  }

  if (isObject(save.settings)) {
    const settings = cleanCopy(save.settings);
    if (!isNumberNotation(settings.notation)) settings.notation = INITIAL_STATE.settings.notation;
    save.settings = settings;
  } else {
    delete save.settings;
  }

  save.saveVersion = CURRENT_SAVE_VERSION;
  return save as MigratedSave;
}
