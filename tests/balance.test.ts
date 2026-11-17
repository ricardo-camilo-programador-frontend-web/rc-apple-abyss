import { describe, expect, it } from 'vitest';
import {
  abyssMultiplier,
  calculatePendingLuckyWorms,
  calculateClickUpgradeCost as clickCostD,
  calculateClickDamageBase as clickDamageD,
  calculateMaxAppleHP as maxHPD,
  milestoneMultiplier as milestoneD,
  calculateWormCost as wormCostD,
  calculateWormDPS as wormDPSD,
} from '@/lib/game/balance';
import type { WormUpgrade } from '@/lib/game/types';

// As fórmulas devolvem Decimal; nesta faixa (< 1e308) comparar como number basta.
const calculateMaxAppleHP = (stage: number) => maxHPD(stage).toNumber();
const calculateWormDPS = (u: WormUpgrade, n: number) => wormDPSD(u, n).toNumber();
const calculateWormCost = (u: WormUpgrade, n: number) => wormCostD(u, n).toNumber();
const calculateClickDamageBase = (level: number) => clickDamageD(level).toNumber();
const calculateClickUpgradeCost = (level: number) => clickCostD(level).toNumber();
const milestoneMultiplier = (n: number) => milestoneD(n).toNumber();

import { BALANCE, GAME_CONFIG, WORM_UPGRADES } from '@/lib/game/constants';

describe('curva de HP em dois trechos', () => {
  it('começa em INITIAL_HP e cresce HP_GROWTH até o estágio de transição', () => {
    expect(calculateMaxAppleHP(1)).toBe(GAME_CONFIG.INITIAL_HP);
    expect(calculateMaxAppleHP(2)).toBe(Math.floor(50 * 1.33));
    expect(calculateMaxAppleHP(80)).toBe(Math.floor(50 * 1.33 ** 79));
  });

  it('cresce HP_GROWTH_LATE por estágio depois da transição', () => {
    const at80 = 50 * 1.33 ** 79;
    expect(calculateMaxAppleHP(81)).toBe(Math.floor(at80 * 1.1));
    // Em ~1e23 o pow de Decimal e o ** de number diferem em 1 ulp.
    expect(calculateMaxAppleHP(373) / (at80 * 1.1 ** 293)).toBeCloseTo(1, 12);
  });

  it('é monotônica e muito menor que a curva antiga no estágio 373', () => {
    for (let s = 2; s < 2000; s++) {
      expect(calculateMaxAppleHP(s)).toBeGreaterThanOrEqual(calculateMaxAppleHP(s - 1));
    }
    expect(calculateMaxAppleHP(373)).toBeLessThan(1e25);
  });
});

describe('produção linear com marcos (×4 a cada 25 níveis)', () => {
  it('multiplicador de marco', () => {
    expect(milestoneMultiplier(0)).toBe(1);
    expect(milestoneMultiplier(24)).toBe(1);
    expect(milestoneMultiplier(25)).toBe(4);
    expect(milestoneMultiplier(50)).toBe(16);
  });

  it('DPS do worm = base × quantidade × marco', () => {
    const small = WORM_UPGRADES[0];
    expect(calculateWormDPS(small, 0)).toBe(0);
    expect(calculateWormDPS(small, 1)).toBe(1);
    expect(calculateWormDPS(small, 10)).toBe(10);
    expect(calculateWormDPS(small, 25)).toBe(100);
  });

  it('dano do clique = (1 + nível) × marco', () => {
    expect(calculateClickDamageBase(0)).toBe(1);
    expect(calculateClickDamageBase(9)).toBe(10);
    expect(calculateClickDamageBase(25)).toBe(26 * 4);
  });

  it('custos continuam iguais (compatível com os saves)', () => {
    expect(calculateWormCost(WORM_UPGRADES[0], 0)).toBe(15);
    expect(calculateWormCost(WORM_UPGRADES[0], 10)).toBe(Math.floor(15 * 1.15 ** 10));
    expect(calculateClickUpgradeCost(0)).toBe(20);
    expect(calculateClickUpgradeCost(10)).toBe(Math.floor(20 * 1.15 ** 10));
  });

  it('sem crescimento explosivo: 25 níveis custam mais do que rendem', () => {
    for (const upgrade of WORM_UPGRADES) {
      const dpsGain = calculateWormDPS(upgrade, 125) / calculateWormDPS(upgrade, 100);
      const costGain = calculateWormCost(upgrade, 125) / calculateWormCost(upgrade, 100);
      expect(costGain).toBeGreaterThan(dpsGain);
    }
    const clickGain = calculateClickDamageBase(125) / calculateClickDamageBase(100);
    const clickCost = calculateClickUpgradeCost(125) / calculateClickUpgradeCost(100);
    expect(clickCost).toBeGreaterThan(clickGain);
  });

  it('o clique do print (Lv.516) não mata mais a maçã do estágio 373 em um golpe', () => {
    expect(calculateClickDamageBase(516)).toBeLessThan(calculateMaxAppleHP(373));
  });
});

describe('prestígio (Lucky Worms)', () => {
  it('rende ⌊(estágio ÷ 10)²⌋ a partir do estágio de ascensão', () => {
    expect(calculatePendingLuckyWorms(49)).toBe(0);
    expect(calculatePendingLuckyWorms(50)).toBe(25);
    expect(calculatePendingLuckyWorms(100)).toBe(100);
    expect(calculatePendingLuckyWorms(373)).toBe(1391);
  });
});

describe('simulação de progresso (jogador ativo, 5 cliques/s, compra gulosa)', () => {
  function simulate(seconds: number, luckyWorms = 0) {
    const counts = WORM_UPGRADES.map(() => 0);
    let clickLevel = 0;
    let gold = 0;
    let stage = 1;
    let hp = calculateMaxAppleHP(1);
    let reached50: number | null = null;
    const bonus = 1 + luckyWorms * 0.1;
    const goldMult = 1 + luckyWorms * 0.05;
    for (let t = 0; t < seconds; t++) {
      let dmg =
        (WORM_UPGRADES.reduce((sum, u, i) => sum + calculateWormDPS(u, counts[i]), 0) +
          5 * calculateClickDamageBase(clickLevel)) *
        bonus;
      while (dmg > 0) {
        if (hp > dmg) {
          hp -= dmg;
          gold += dmg * goldMult;
          dmg = 0;
        } else {
          dmg -= hp;
          gold += hp * goldMult;
          stage++;
          hp = calculateMaxAppleHP(stage);
          if (stage === 50 && reached50 === null) reached50 = t;
        }
      }
      for (let k = 0; k < 50; k++) {
        let best: { gain: number; index: number; cost: number } | null = null;
        WORM_UPGRADES.forEach((u, i) => {
          const cost = calculateWormCost(u, counts[i]);
          if (cost > gold) return;
          const gain = (calculateWormDPS(u, counts[i] + 1) - calculateWormDPS(u, counts[i])) / cost;
          if (!best || gain > best.gain) best = { gain, index: i, cost };
        });
        const clickCost = calculateClickUpgradeCost(clickLevel);
        if (clickCost <= gold) {
          const gain =
            (5 *
              (calculateClickDamageBase(clickLevel + 1) - calculateClickDamageBase(clickLevel))) /
            clickCost;
          if (!best || gain > (best as { gain: number }).gain)
            best = { gain, index: -1, cost: clickCost };
        }
        if (!best) break;
        const pick = best as { gain: number; index: number; cost: number };
        gold -= pick.cost;
        if (pick.index < 0) clickLevel++;
        else counts[pick.index]++;
      }
    }
    return { stage, reached50 };
  }

  it('primeira corrida chega à ascensão (estágio 50) entre 30 min e 2 h, sem disparar', () => {
    const { stage, reached50 } = simulate(2 * 3600);
    expect(reached50).not.toBeNull();
    expect(reached50 as number).toBeGreaterThan(30 * 60);
    expect(stage).toBeLessThan(80);
  });

  it('Lucky Worms encurtam a corrida seguinte', () => {
    const first = simulate(2 * 3600);
    const second = simulate(2 * 3600, calculatePendingLuckyWorms(first.stage));
    expect(second.stage).toBeGreaterThan(first.stage);
    expect(second.reached50 as number).toBeLessThan(first.reached50 as number);
  });

  it('expõe as constantes da curva', () => {
    expect(BALANCE.HP_LATE_STAGE).toBe(80);
    expect(BALANCE.MILESTONE_EVERY).toBe(25);
    expect(BALANCE.MILESTONE_MULTIPLIER).toBe(4);
  });
});

describe('Decimal além de 1e308', () => {
  it('HP passa de Number.MAX_VALUE sem virar Infinity', () => {
    const hp = maxHPD(8000);
    expect(hp.exponent).toBeGreaterThan(308);
    expect(Number.isFinite(hp.mantissa)).toBe(true);
    expect(hp.gt(maxHPD(7999))).toBe(true);
  });

  it('multiplicador do Abismo dobra por profundidade', () => {
    expect(abyssMultiplier(0).toNumber()).toBe(1);
    expect(abyssMultiplier(1).toNumber()).toBe(2);
    expect(abyssMultiplier(10).toNumber()).toBe(1024);
  });
});
