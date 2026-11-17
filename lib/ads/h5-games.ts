/**
 * H5 Games Ads (Google AdSense, Ad Placement API) — anúncio com recompensa.
 *
 * Docs: https://developers.google.com/ad-placement/apis
 *
 * O Ad Placement API usa o mesmo `adsbygoogle.js` do AdSense que já carrega no
 * `app/layout.tsx`. `adBreak()` e `adConfig()` são o `adsbygoogle.push(o)`.
 * Fluxo do tipo `reward`:
 * 1. `adBreak({ type: 'reward', ... })` declara a oportunidade.
 * 2. Se houver anúncio, o Google chama `beforeReward(showAdFn)`; o jogo mostra
 *    o convite e chama `showAdFn()` no clique do jogador.
 * 3. `adViewed()` = assistiu até o fim → só aqui o bônus é entregue.
 *    `adDismissed()` = fechou antes → sem bônus.
 * 4. `adBreakDone(placementInfo)` sempre vem por último. Sem `beforeReward`,
 *    não houve anúncio (`breakStatus` notReady, frequencyCapped, etc.).
 *
 * Não há caminho que entregue bônus sem `adViewed`. Para testar sem conta
 * aprovada, o script recebe `data-adbreak-test="on"` e o Google mostra um
 * anúncio de teste.
 */

/** Publisher id do script AdSense em `app/layout.tsx`. */
export const H5_ADS_SCRIPT_CLIENT = 'ca-pub-6735039970151788';

const CLIENT_PATTERN = /^ca-pub-\d{16}$/;

export interface H5AdsEnv {
  enabled?: string;
  client?: string;
  test?: string;
}

export type H5AdsDisabledReason =
  | 'disabled'
  | 'missing-client'
  | 'invalid-client'
  | 'client-mismatch';

export interface H5AdsConfig {
  enabled: boolean;
  client: string | null;
  /** `data-adbreak-test="on"`: anúncios de teste do Google. */
  test: boolean;
  reason: H5AdsDisabledReason | null;
}

const TRUE_VALUES = new Set(['true', 'on', '1', 'yes']);

function isOn(value: string | undefined): boolean {
  return TRUE_VALUES.has((value ?? '').trim().toLowerCase());
}

export function resolveH5AdsConfig(env: H5AdsEnv): H5AdsConfig {
  const test = isOn(env.test);
  const client = env.client?.trim() || null;
  const disabled = (reason: H5AdsDisabledReason): H5AdsConfig => ({
    enabled: false,
    client,
    test: false,
    reason,
  });

  if (!isOn(env.enabled)) return disabled('disabled');
  if (!client) return disabled('missing-client');
  if (!CLIENT_PATTERN.test(client)) return disabled('invalid-client');
  // O script carregado é o do layout; outro publisher não receberia os anúncios.
  if (client !== H5_ADS_SCRIPT_CLIENT) return disabled('client-mismatch');
  return { enabled: true, client, test, reason: null };
}

/** Lê as envs públicas (nomes literais para o Next inlinar no bundle). */
export function h5AdsEnvFromProcess(): H5AdsEnv {
  return {
    enabled: process.env.NEXT_PUBLIC_H5_ADS_ENABLED,
    client: process.env.NEXT_PUBLIC_H5_ADS_CLIENT,
    test: process.env.NEXT_PUBLIC_H5_ADS_TEST,
  };
}

export const H5_ADS_CONFIG: H5AdsConfig = resolveH5AdsConfig(h5AdsEnvFromProcess());

/** Atributos extras do `<script adsbygoogle.js>` quando o H5 Games Ads está ligado. */
export function h5ScriptAttributes(config: H5AdsConfig): Record<string, string> {
  if (!config.enabled) return {};
  return config.test ? { 'data-adbreak-test': 'on' } : {};
}

export interface PlacementInfo {
  breakType?: string;
  breakName?: string;
  breakFormat?: string;
  breakStatus?: string;
}

export interface RewardPlacementConfig {
  type: 'reward';
  name: string;
  beforeAd: () => void;
  afterAd: () => void;
  beforeReward: (showAdFn: () => void) => void;
  adDismissed: () => void;
  adViewed: () => void;
  adBreakDone: (placementInfo: PlacementInfo) => void;
}

export interface AdConfigOptions {
  preloadAdBreaks?: 'on' | 'auto';
  sound?: 'on' | 'off';
}

export type AdPush = (config: RewardPlacementConfig | AdConfigOptions) => void;

declare global {
  interface Window {
    adsbygoogle?: Array<unknown>;
  }
}

/** `adBreak`/`adConfig` do boilerplate oficial: empurra o objeto na fila do adsbygoogle. */
export function windowAdPush(config: RewardPlacementConfig | AdConfigOptions): void {
  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.push(config);
}

export function configureH5Ads(options: AdConfigOptions, push: AdPush = windowAdPush): void {
  push(options);
}

export type RewardedOutcome = 'viewed' | 'dismissed' | 'unavailable';

export interface RewardedAdHandlers {
  /** Há anúncio: mostre o convite e chame `showAd()` no clique do jogador. */
  onReady: (showAd: () => void) => void;
  /** O anúncio vai começar (pause/mute). */
  onBeforeAd?: () => void;
  /** O anúncio terminou ou foi fechado. */
  onAfterAd?: () => void;
  /** Assistiu até o fim: única chamada que libera a recompensa. Vem no máximo uma vez. */
  onViewed: () => void;
  /** Fim da tentativa. `status` é o `breakStatus` do Google, ou `timeout`. */
  onDone: (outcome: RewardedOutcome, status: string) => void;
}

export interface RequestRewardedAdOptions {
  push?: AdPush;
  /** Sem `beforeReward` nem `adBreakDone` nesse prazo, conta como sem anúncio (ex.: script bloqueado). */
  timeoutMs?: number;
}

export interface RewardedAdSession {
  /** Ignora callbacks que chegarem depois (o modal fechou, por exemplo). */
  cancel: () => void;
}

export const REWARDED_REQUEST_TIMEOUT_MS = 8000;

export function requestRewardedAd(
  name: string,
  handlers: RewardedAdHandlers,
  options: RequestRewardedAdOptions = {},
): RewardedAdSession {
  const push = options.push ?? windowAdPush;
  const timeoutMs = options.timeoutMs ?? REWARDED_REQUEST_TIMEOUT_MS;
  let cancelled = false;
  let settled = false;
  let offered = false;
  let viewed = false;
  let dismissed = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const clearTimer = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  const finish = (outcome: RewardedOutcome, status: string) => {
    if (settled) return;
    settled = true;
    clearTimer();
    if (!cancelled) handlers.onDone(outcome, status);
  };

  timer = setTimeout(() => {
    if (!offered) finish('unavailable', 'timeout');
  }, timeoutMs);

  try {
    push({
      type: 'reward',
      name,
      beforeAd: () => {
        if (!cancelled) handlers.onBeforeAd?.();
      },
      afterAd: () => {
        if (!cancelled) handlers.onAfterAd?.();
      },
      beforeReward: (showAdFn) => {
        if (settled || cancelled) return;
        offered = true;
        clearTimer();
        handlers.onReady(() => {
          if (!cancelled && !settled) showAdFn();
        });
      },
      adDismissed: () => {
        dismissed = true;
      },
      adViewed: () => {
        if (viewed || cancelled) return;
        viewed = true;
        handlers.onViewed();
      },
      adBreakDone: (placementInfo) => {
        const status = placementInfo?.breakStatus ?? 'other';
        if (viewed) finish('viewed', status);
        else if (dismissed || status === 'dismissed') finish('dismissed', status);
        else finish('unavailable', status);
      },
    });
  } catch {
    finish('unavailable', 'error');
  }

  return {
    cancel: () => {
      cancelled = true;
      clearTimer();
    },
  };
}
