import { describe, expect, it, vi } from 'vitest';
import {
  type RewardedAdHandlers,
  type RewardedAdSession,
  resolveH5AdsConfig,
} from '@/lib/ads/h5-games';
import { emptyRewardedState, type RewardedPersisted } from '@/lib/ads/rewarded-persistence';
import { createRewardedStore } from '@/lib/ads/rewarded-store';

const ENABLED = resolveH5AdsConfig({ enabled: 'true', client: 'ca-pub-6735039970151788' });
const DISABLED = resolveH5AdsConfig({});

function setup(config = ENABLED, initial: RewardedPersisted = emptyRewardedState()) {
  let clock = 1_000_000;
  const sessions: Array<{ name: string; h: RewardedAdHandlers; cancel: ReturnType<typeof vi.fn> }> =
    [];
  const saved: Array<RewardedPersisted> = [];
  const configure = vi.fn();
  const store = createRewardedStore(config, {
    now: () => clock,
    load: () => initial,
    save: (s) => saved.push(s),
    configure,
    request: (name, h): RewardedAdSession => {
      const cancel = vi.fn();
      sessions.push({ name, h, cancel });
      return { cancel };
    },
  });
  const grant = vi.fn();
  return {
    store,
    grant,
    sessions,
    saved,
    configure,
    advance: (ms: number) => {
      clock += ms;
    },
    now: () => clock,
  };
}

describe('rewarded store', () => {
  it('desligado: não pede anúncio nem entrega nada', () => {
    const { store, grant, sessions } = setup(DISABLED);
    store.requestAd('gold_boost', grant);
    expect(sessions).toHaveLength(0);
    expect(grant).not.toHaveBeenCalled();
  });

  it('pedir anúncio não entrega bônus; só adViewed entrega e grava o cooldown', () => {
    const { store, grant, sessions, saved, configure, now } = setup();
    store.requestAd('gold_boost', grant);
    expect(configure).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().statuses.gold_boost).toBe('checking');
    expect(grant).not.toHaveBeenCalled();

    const showAd = vi.fn();
    sessions[0].h.onReady(showAd);
    expect(store.getSnapshot().statuses.gold_boost).toBe('ready');
    expect(grant).not.toHaveBeenCalled();

    store.watchAd('gold_boost');
    expect(showAd).toHaveBeenCalledTimes(1);
    sessions[0].h.onBeforeAd?.();
    expect(store.getSnapshot().statuses.gold_boost).toBe('showing');

    sessions[0].h.onViewed();
    expect(grant).toHaveBeenCalledWith('gold_boost', now());
    expect(saved.at(-1)?.cooldownUntil.gold_boost).toBe(now() + 300_000);
    sessions[0].h.onDone('viewed', 'viewed');
    expect(store.getSnapshot().statuses.gold_boost).toBe('idle');
  });

  it('cooldown salvo bloqueia novo pedido (vale depois do reload)', () => {
    const initial = emptyRewardedState();
    initial.cooldownUntil.instant_harvest = 1_000_000 + 60_000;
    const { store, grant, sessions, advance } = setup(ENABLED, initial);
    store.requestAd('instant_harvest', grant);
    expect(sessions).toHaveLength(0);
    advance(60_000);
    store.requestAd('instant_harvest', grant);
    expect(sessions).toHaveLength(1);
  });

  it('sem anúncio: estado unavailable, sem bônus, nova tentativa só após 30 s', () => {
    const { store, grant, sessions, advance } = setup();
    store.requestAd('reset_cooldown', grant);
    sessions[0].h.onDone('unavailable', 'frequencyCapped');
    expect(store.getSnapshot().statuses.reset_cooldown).toBe('unavailable');
    expect(grant).not.toHaveBeenCalled();
    store.requestAd('reset_cooldown', grant);
    expect(sessions).toHaveLength(1);
    advance(30_000);
    store.requestAd('reset_cooldown', grant);
    expect(sessions).toHaveLength(2);
  });

  it('fechar o anúncio antes do fim: dismissed, sem bônus nem cooldown', () => {
    const { store, grant, sessions, saved } = setup();
    store.requestAd('gold_boost', grant);
    sessions[0].h.onReady(vi.fn());
    sessions[0].h.onDone('dismissed', 'dismissed');
    expect(store.getSnapshot().statuses.gold_boost).toBe('dismissed');
    expect(grant).not.toHaveBeenCalled();
    expect(saved).toHaveLength(0);
  });

  it('um adBreak por vez: novo pedido cancela o convite anterior', () => {
    const { store, grant, sessions } = setup();
    store.requestAd('gold_boost', grant);
    sessions[0].h.onReady(vi.fn());
    store.requestAd('instant_harvest', grant);
    expect(sessions[0].cancel).toHaveBeenCalled();
    expect(store.getSnapshot().statuses.gold_boost).toBe('idle');
    expect(store.getSnapshot().statuses.instant_harvest).toBe('checking');
  });

  it('não pede outro anúncio enquanto um está carregando', () => {
    const { store, grant, sessions } = setup();
    store.requestAd('gold_boost', grant);
    store.requestAd('instant_harvest', grant);
    expect(sessions).toHaveLength(1);
  });

  it('watchAd sem convite não faz nada', () => {
    const { store, grant, sessions } = setup();
    store.watchAd('gold_boost');
    store.requestAd('gold_boost', grant);
    store.watchAd('gold_boost');
    expect(sessions[0].h.onViewed).toBeDefined();
    expect(grant).not.toHaveBeenCalled();
  });

  it('reset (modal fechado) descarta convite pendente mas não um anúncio na tela', () => {
    const { store, grant, sessions } = setup();
    store.requestAd('gold_boost', grant);
    sessions[0].h.onReady(vi.fn());
    store.reset();
    expect(sessions[0].cancel).toHaveBeenCalled();
    expect(store.getSnapshot().statuses.gold_boost).toBe('idle');

    store.requestAd('instant_harvest', grant);
    sessions[1].h.onBeforeAd?.();
    store.reset();
    expect(sessions[1].cancel).not.toHaveBeenCalled();
    expect(store.getSnapshot().statuses.instant_harvest).toBe('showing');
  });

  it('setGoldBoostUntil grava o fim do boost', () => {
    const { store, saved } = setup();
    store.setGoldBoostUntil(2_000_000);
    expect(saved.at(-1)?.goldBoostUntil).toBe(2_000_000);
    expect(store.getSnapshot().persisted.goldBoostUntil).toBe(2_000_000);
  });
});
