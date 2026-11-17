import { calculateMaxAppleHP } from './balance';
import { CURRENT_SAVE_VERSION, INITIAL_STATE } from './constants';
import { isNumberNotation } from './format';
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

/**
 * Valor grande (ouro, HP, estatística). `null` só aparece quando o valor era
 * Infinity antes do `JSON.stringify`, então volta como o maior number finito.
 */
function bigValue(value: unknown, fallback: number): number {
  if (value === null || value === Infinity) return Number.MAX_VALUE;
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) return fallback;
  return value;
}

function intValue(value: unknown, fallback: number, min = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min) return fallback;
  return Math.floor(value);
}

function sanitizeRecord(
  value: unknown,
  sanitize: (key: string, v: unknown) => number,
): Record<string, number> | undefined {
  if (!isObject(value)) return undefined;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(value)) {
    if (!DANGEROUS_KEYS.has(k)) out[k] = sanitize(k, v);
  }
  return out;
}

/**
 * Leva qualquer save (de qualquer versão) ao formato atual.
 *
 * - v1 (até a v0.2.1): sem `saveVersion` nem `settings.notation`; campos que
 *   estouraram para Infinity foram gravados como `null`.
 * - v2: igual à v1, com `saveVersion` e números sempre finitos.
 * - v3: HP pela curva nova de dois trechos (fase 3 do #47).
 *
 * A limpeza roda em todo load, não só na migração, para que um save editado à
 * mão nunca injete NaN ou Infinity no estado.
 */
export function migrateSave(raw: unknown): MigratedSave {
  if (!isObject(raw)) return { saveVersion: CURRENT_SAVE_VERSION };
  const save = cleanCopy(raw);

  for (const field of INTEGER_FIELDS) {
    if (field in save) {
      const min = field === 'stage' || field === 'highestStage' ? 1 : 0;
      save[field] = intValue(save[field], INITIAL_STATE[field], min);
    }
  }

  const stage = typeof save.stage === 'number' ? save.stage : INITIAL_STATE.stage;
  if ('gold' in save) save.gold = bigValue(save.gold, 0);

  if ('maxAppleHP' in save) {
    const max = save.maxAppleHP;
    save.maxAppleHP =
      typeof max === 'number' && Number.isFinite(max) && max >= 1
        ? max
        : calculateMaxAppleHP(stage);
  }
  if ('appleHP' in save) {
    const max = typeof save.maxAppleHP === 'number' ? save.maxAppleHP : calculateMaxAppleHP(stage);
    const hp = save.appleHP;
    save.appleHP = typeof hp === 'number' && Number.isFinite(hp) && hp > 0 && hp <= max ? hp : max;
  }

  const worms = sanitizeRecord(save.worms, (_k, v) => intValue(v, 0));
  if (worms) save.worms = worms;
  else delete save.worms;

  const statistics = sanitizeRecord(save.statistics, (k, v) =>
    k === 'totalGoldEarned' ? bigValue(v, 0) : intValue(v, 0),
  );
  if (statistics) save.statistics = statistics;
  else delete save.statistics;

  if (isObject(save.settings)) {
    const settings = cleanCopy(save.settings);
    if (!isNumberNotation(settings.notation)) settings.notation = INITIAL_STATE.settings.notation;
    save.settings = settings;
  } else {
    delete save.settings;
  }

  // v1/v2 → v3: o HP foi calculado com a curva antiga (1,5^estágio). Recalcula o
  // máximo pela curva nova e mantém a mesma porcentagem de vida da maçã.
  const version = typeof raw.saveVersion === 'number' ? raw.saveVersion : 1;
  if (version < 3 && 'maxAppleHP' in save) {
    const oldMax = save.maxAppleHP as number;
    const oldHP = typeof save.appleHP === 'number' ? save.appleHP : oldMax;
    const ratio = oldMax > 0 ? Math.min(1, Math.max(0, oldHP / oldMax)) : 1;
    const newMax = calculateMaxAppleHP(stage);
    save.maxAppleHP = newMax;
    save.appleHP = Math.max(1, Math.ceil(newMax * ratio));
  }

  save.saveVersion = CURRENT_SAVE_VERSION;
  return save as MigratedSave;
}
