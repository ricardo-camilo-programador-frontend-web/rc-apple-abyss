import { GAME_CONFIG } from './constants';
import { clampFinite } from './safe-number';

/** HP máximo da maçã no estágio. Limitado ao maior number finito. */
export function calculateMaxAppleHP(stage: number): number {
  const raw = GAME_CONFIG.INITIAL_HP * GAME_CONFIG.HP_GROWTH ** (stage - 1);
  return Math.max(1, Math.floor(clampFinite(raw, GAME_CONFIG.INITIAL_HP)));
}
