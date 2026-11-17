/**
 * Persistência dos cooldowns do Free Rewards e do fim do 2x Gold Boost.
 *
 * Fica numa chave própria do localStorage, fora do save do jogo: não mexe no
 * `CURRENT_SAVE_VERSION` nem na migração da PR #48, e um valor corrompido aqui
 * nunca estraga o save. Os instantes são absolutos (ms desde a época), então
 * o tempo continua contando com a aba fechada.
 */

import { REWARDED_CONFIG } from '@/lib/game/constants';

export const REWARDED_STORAGE_KEY = 'apple_abyss_rewarded_v1';

export type RewardKey = keyof typeof REWARDED_CONFIG.cooldownSeconds;

export const REWARD_KEYS: ReadonlyArray<RewardKey> = [
  'gold_boost',
  'instant_harvest',
  'reset_cooldown',
];

export interface RewardedPersisted {
  version: 1;
  cooldownUntil: Record<RewardKey, number>;
  goldBoostUntil: number;
}

export function emptyRewardedState(): RewardedPersisted {
  return {
    version: 1,
    cooldownUntil: { gold_boost: 0, instant_harvest: 0, reset_cooldown: 0 },
    goldBoostUntil: 0,
  };
}

/**
 * Aceita só instantes finitos e no máximo `maxSeconds` à frente de `now`.
 * Um valor maior (relógio mexido, save editado) vira o máximo permitido, para
 * nunca travar a recompensa por mais tempo que o cooldown real.
 */
function sanitizeUntil(value: unknown, now: number, maxSeconds: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= now) return 0;
  return Math.min(value, now + maxSeconds * 1000);
}

export function sanitizeRewardedState(raw: unknown, now: number): RewardedPersisted {
  const state = emptyRewardedState();
  if (!raw || typeof raw !== 'object') return state;
  const data = raw as { cooldownUntil?: unknown; goldBoostUntil?: unknown };
  const cooldowns =
    data.cooldownUntil && typeof data.cooldownUntil === 'object'
      ? (data.cooldownUntil as Record<string, unknown>)
      : {};
  for (const key of REWARD_KEYS) {
    state.cooldownUntil[key] = sanitizeUntil(
      cooldowns[key],
      now,
      REWARDED_CONFIG.cooldownSeconds[key],
    );
  }
  state.goldBoostUntil = sanitizeUntil(
    data.goldBoostUntil,
    now,
    REWARDED_CONFIG.goldBoostDurationSeconds,
  );
  return state;
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function defaultStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function loadRewardedState(
  now: number = Date.now(),
  storage: StorageLike | null = defaultStorage(),
): RewardedPersisted {
  if (!storage) return emptyRewardedState();
  try {
    const raw = storage.getItem(REWARDED_STORAGE_KEY);
    return sanitizeRewardedState(raw ? JSON.parse(raw) : null, now);
  } catch {
    return emptyRewardedState();
  }
}

export function saveRewardedState(
  state: RewardedPersisted,
  storage: StorageLike | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(REWARDED_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Sem localStorage (modo privado): o cooldown vale só nesta aba.
  }
}

export function secondsUntil(until: number, now: number = Date.now()): number {
  return until > now ? Math.ceil((until - now) / 1000) : 0;
}
