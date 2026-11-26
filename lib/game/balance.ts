/**
 * Fórmulas de balanceamento (#47, fases 3 e 4).
 *
 * Antes: dano do clique 1,35^nível e DPS dos worms dpsGrowth^(n−1) cresciam mais
 * rápido que os custos (1,15^n…1,6^n), então a economia disparava e o HP
 * (50 × 1,5^(estágio−1)) virava Infinity por volta do estágio 1742.
 *
 * Agora, no modelo do Clicker Heroes e do artigo de Pecorella: custo
 * exponencial (inalterado), produção linear por unidade com ×4 a cada 25
 * níveis, HP em dois trechos e prestígio quadrático no estágio da corrida.
 * Tudo em Decimal (break_infinity.js), então nada estoura em 1,79e308.
 */
import { BALANCE, CLICK_UPGRADE, GAME_CONFIG } from './constants';
import { Decimal } from './num';
import type { WormUpgrade } from './types';

/** ×MILESTONE_MULTIPLIER a cada MILESTONE_EVERY níveis. */
export function milestoneMultiplier(level: number): Decimal {
  return Decimal.pow(
    BALANCE.MILESTONE_MULTIPLIER,
    Math.floor(Math.max(0, level) / BALANCE.MILESTONE_EVERY),
  );
}

/**
 * HP máximo da maçã: INITIAL_HP × HP_GROWTH^(estágio−1) até HP_LATE_STAGE e,
 * depois, × HP_GROWTH_LATE por estágio.
 */
export function calculateMaxAppleHP(stage: number): Decimal {
  const s = Math.max(1, Math.floor(stage));
  const early = Math.min(s, BALANCE.HP_LATE_STAGE) - 1;
  const late = Math.max(0, s - BALANCE.HP_LATE_STAGE);
  return Decimal.pow(GAME_CONFIG.HP_GROWTH, early)
    .mul(Decimal.pow(BALANCE.HP_GROWTH_LATE, late))
    .mul(GAME_CONFIG.INITIAL_HP)
    .floor()
    .max(1);
}

/** DPS de `count` unidades de um worm: base × quantidade × marco. */
export function calculateWormDPS(upgrade: WormUpgrade, count: number): Decimal {
  if (count <= 0) return new Decimal(0);
  return milestoneMultiplier(count).mul(upgrade.baseDPS).mul(count);
}

/** Dano base do clique: (1 + nível) × marco, antes de bônus. */
export function calculateClickDamageBase(level: number): Decimal {
  const l = Math.max(0, level);
  return milestoneMultiplier(l).mul(CLICK_UPGRADE.baseDamage * (1 + l));
}

/** Custo do próximo worm: base × costGrowth^quantidade (igual à v0.2.1). */
export function calculateWormCost(upgrade: WormUpgrade, count: number): Decimal {
  return Decimal.pow(upgrade.costGrowth, count).mul(upgrade.baseCost).floor();
}

/** Custo do próximo nível de clique: 20 × 1,15^nível (igual à v0.2.1). */
export function calculateClickUpgradeCost(level: number): Decimal {
  return Decimal.pow(GAME_CONFIG.CLICK_UPGRADE_COST_GROWTH, level)
    .mul(GAME_CONFIG.CLICK_UPGRADE_BASE_COST)
    .floor();
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

/** Multiplicador permanente do Abismo: ×2 por mergulho. */
export function abyssMultiplier(depth: number): Decimal {
  return Decimal.pow(BALANCE.ABYSS_MULTIPLIER_PER_DEPTH, Math.max(0, Math.floor(depth)));
}
