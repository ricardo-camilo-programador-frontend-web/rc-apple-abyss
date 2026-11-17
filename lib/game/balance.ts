/**
 * Fórmulas de balanceamento (#47, fase 3).
 *
 * Antes: dano do clique 1,35^nível e DPS dos worms dpsGrowth^(n−1) cresciam mais
 * rápido que os custos (1,15^n…1,6^n), então a economia disparava e o HP
 * (50 × 1,5^(estágio−1)) virava Infinity por volta do estágio 1742.
 *
 * Agora, no modelo do Clicker Heroes e do artigo de Pecorella: custo
 * exponencial (inalterado), produção linear por unidade com ×4 a cada 25
 * níveis, HP em dois trechos e prestígio quadrático no estágio da corrida.
 */
import { BALANCE, CLICK_UPGRADE, GAME_CONFIG } from './constants';
import { clampFinite } from './safe-number';
import type { WormUpgrade } from './types';

/** ×MILESTONE_MULTIPLIER a cada MILESTONE_EVERY níveis. */
export function milestoneMultiplier(level: number): number {
  return BALANCE.MILESTONE_MULTIPLIER ** Math.floor(Math.max(0, level) / BALANCE.MILESTONE_EVERY);
}

/**
 * HP máximo da maçã: INITIAL_HP × HP_GROWTH^(estágio−1) até HP_LATE_STAGE e,
 * depois, × HP_GROWTH_LATE por estágio. Limitado ao maior number finito.
 */
export function calculateMaxAppleHP(stage: number): number {
  const s = Math.max(1, Math.floor(stage));
  const early = Math.min(s, BALANCE.HP_LATE_STAGE) - 1;
  const late = Math.max(0, s - BALANCE.HP_LATE_STAGE);
  const raw =
    GAME_CONFIG.INITIAL_HP * GAME_CONFIG.HP_GROWTH ** early * BALANCE.HP_GROWTH_LATE ** late;
  return Math.max(1, Math.floor(clampFinite(raw, GAME_CONFIG.INITIAL_HP)));
}

/** DPS de `count` unidades de um worm: base × quantidade × marco. */
export function calculateWormDPS(upgrade: WormUpgrade, count: number): number {
  if (count <= 0) return 0;
  return clampFinite(upgrade.baseDPS * count * milestoneMultiplier(count));
}

/** Dano base do clique: (1 + nível) × marco, antes de bônus. */
export function calculateClickDamageBase(level: number): number {
  const l = Math.max(0, level);
  return clampFinite(CLICK_UPGRADE.baseDamage * (1 + l) * milestoneMultiplier(l));
}

/** Custo do próximo worm: base × costGrowth^quantidade (igual à v0.2.1). */
export function calculateWormCost(upgrade: WormUpgrade, count: number): number {
  return Math.floor(clampFinite(upgrade.baseCost * upgrade.costGrowth ** count));
}

/** Custo do próximo nível de clique: 20 × 1,15^nível (igual à v0.2.1). */
export function calculateClickUpgradeCost(level: number): number {
  return Math.floor(
    clampFinite(
      GAME_CONFIG.CLICK_UPGRADE_BASE_COST * GAME_CONFIG.CLICK_UPGRADE_COST_GROWTH ** level,
    ),
  );
}

/**
 * Lucky Worms ganhos ao ascender: ⌊(estágio da corrida ÷ 10)²⌋. Usa o estágio
 * atual, não o recorde, para que ascender várias vezes no estágio 50 não
 * renda o bônus do recorde de novo.
 */
export function calculatePendingLuckyWorms(stage: number): number {
  if (stage < GAME_CONFIG.ASCENSION_STAGE) return 0;
  return Math.floor((stage / BALANCE.LUCKY_WORMS_STAGE_DIVISOR) ** 2);
}
