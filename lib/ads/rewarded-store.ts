/**
 * Estado compartilhado do Free Rewards (anúncio com recompensa).
 *
 * Store fora do React para que o `Game` (botão e contador do 2x) e o modal
 * leiam o mesmo estado sem passar props novas. Cada recompensa tem um status:
 * - idle: pode pedir anúncio;
 * - checking: `adBreak` enviado, esperando o Google;
 * - ready: há anúncio (`beforeReward`), esperando o clique em "Watch ad";
 * - showing: anúncio na tela;
 * - unavailable: sem anúncio agora; nova tentativa após `retryUntil`;
 * - dismissed: fechou antes do fim, sem bônus.
 *
 * O bônus só é entregue em `onViewed` (`adViewed` do Google).
 */

import {
  configureH5Ads,
  H5_ADS_CONFIG,
  type H5AdsConfig,
  type RequestRewardedAdOptions,
  type RewardedAdSession,
  requestRewardedAd,
} from '@/lib/ads/h5-games';
import {
  emptyRewardedState,
  loadRewardedState,
  type RewardedPersisted,
  type RewardKey,
  saveRewardedState,
} from '@/lib/ads/rewarded-persistence';
import { REWARDED_CONFIG } from '@/lib/game/constants';

export type RewardStatus = 'idle' | 'checking' | 'ready' | 'showing' | 'unavailable' | 'dismissed';

export interface RewardedSnapshot {
  statuses: Record<RewardKey, RewardStatus>;
  retryUntil: Record<RewardKey, number>;
  persisted: RewardedPersisted;
}

/** O que a recompensa faz no jogo; o store só chama depois de `adViewed`. */
export type GrantReward = (key: RewardKey, now: number) => void;

const idleStatuses = (): Record<RewardKey, RewardStatus> => ({
  gold_boost: 'idle',
  instant_harvest: 'idle',
  reset_cooldown: 'idle',
});

export function createRewardedStore(
  config: H5AdsConfig,
  deps: {
    load?: (now: number) => RewardedPersisted;
    save?: (state: RewardedPersisted) => void;
    now?: () => number;
    request?: typeof requestRewardedAd;
    requestOptions?: RequestRewardedAdOptions;
    configure?: () => void;
  } = {},
) {
  const now = deps.now ?? Date.now;
  const load = deps.load ?? ((t: number) => loadRewardedState(t));
  const save = deps.save ?? ((state: RewardedPersisted) => saveRewardedState(state));
  const request = deps.request ?? requestRewardedAd;
  const configure =
    deps.configure ?? (() => configureH5Ads({ preloadAdBreaks: 'on', sound: 'on' }));

  let snapshot: RewardedSnapshot = {
    statuses: idleStatuses(),
    retryUntil: { gold_boost: 0, instant_harvest: 0, reset_cooldown: 0 },
    persisted: emptyRewardedState(),
  };
  let hydrated = false;
  let configured = false;
  let session: { key: RewardKey; handle: RewardedAdSession } | null = null;
  let pendingShow: (() => void) | null = null;
  const listeners = new Set<() => void>();

  const emit = () => {
    for (const listener of listeners) listener();
  };

  const update = (next: Partial<RewardedSnapshot>) => {
    snapshot = { ...snapshot, ...next };
    emit();
  };

  const setStatus = (key: RewardKey, status: RewardStatus) => {
    update({ statuses: { ...snapshot.statuses, [key]: status } });
  };

  const hydrate = () => {
    if (hydrated) return;
    hydrated = true;
    snapshot = { ...snapshot, persisted: load(now()) };
  };

  const endSession = () => {
    session?.handle.cancel();
    session = null;
    pendingShow = null;
  };

  return {
    config,

    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    getSnapshot(): RewardedSnapshot {
      hydrate();
      return snapshot;
    },

    /** Pede um anúncio para a recompensa. Não entrega nada sozinho. */
    requestAd(key: RewardKey, grant: GrantReward): void {
      hydrate();
      if (!config.enabled) return;
      const t = now();
      if (snapshot.persisted.cooldownUntil[key] > t) return;
      if (snapshot.retryUntil[key] > t) return;
      const busy = session && ['checking', 'showing'].includes(snapshot.statuses[session.key]);
      if (busy) return;

      // Um adBreak por vez: o convite anterior, se havia, deixa de valer.
      if (session) {
        const previous = session.key;
        endSession();
        setStatus(previous, 'idle');
      }

      if (!configured) {
        configured = true;
        configure();
      }

      setStatus(key, 'checking');
      const handle = request(
        `free_rewards_${key}`,
        {
          onReady: (showAd) => {
            pendingShow = showAd;
            setStatus(key, 'ready');
          },
          onBeforeAd: () => setStatus(key, 'showing'),
          onViewed: () => {
            const viewedAt = now();
            grant(key, viewedAt);
            const persisted: RewardedPersisted = {
              ...snapshot.persisted,
              cooldownUntil: {
                ...snapshot.persisted.cooldownUntil,
                [key]: viewedAt + REWARDED_CONFIG.cooldownSeconds[key] * 1000,
              },
            };
            save(persisted);
            update({ persisted });
          },
          onDone: (outcome) => {
            if (session?.key === key) {
              session = null;
              pendingShow = null;
            }
            if (outcome === 'viewed') {
              setStatus(key, 'idle');
            } else if (outcome === 'dismissed') {
              setStatus(key, 'dismissed');
            } else {
              update({
                statuses: { ...snapshot.statuses, [key]: 'unavailable' },
                retryUntil: {
                  ...snapshot.retryUntil,
                  [key]: now() + REWARDED_CONFIG.unavailableRetrySeconds * 1000,
                },
              });
            }
          },
        },
        deps.requestOptions,
      );
      session = { key, handle };
    },

    /** Clique do jogador no convite: mostra o anúncio (gesto do usuário). */
    watchAd(key: RewardKey): void {
      if (session?.key !== key || snapshot.statuses[key] !== 'ready' || !pendingShow) return;
      const show = pendingShow;
      pendingShow = null;
      show();
    },

    /** Modal fechado: descarta convites pendentes. Um anúncio na tela continua valendo. */
    reset(): void {
      if (session && snapshot.statuses[session.key] === 'showing') return;
      if (session) endSession();
      const statuses = { ...snapshot.statuses };
      for (const key of Object.keys(statuses) as Array<RewardKey>) {
        if (statuses[key] !== 'unavailable') statuses[key] = 'idle';
      }
      update({ statuses });
    },

    /** Grava o fim do 2x Gold Boost (para restaurar depois do reload). */
    setGoldBoostUntil(until: number): void {
      hydrate();
      const persisted = { ...snapshot.persisted, goldBoostUntil: until };
      save(persisted);
      update({ persisted });
    },
  };
}

export type RewardedStore = ReturnType<typeof createRewardedStore>;

export const rewardedStore: RewardedStore = createRewardedStore(H5_ADS_CONFIG);
