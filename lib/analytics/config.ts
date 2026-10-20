/**
 * Analytics configuration — single source of truth for Clarity, GA4, GTM and counter.dev.
 * Mirrors the analytics standard from SGS_WEB #3590 and rc-cigana-lila PR #50.
 *
 * Env names (NEXT_PUBLIC_ prefix), with legacy fallbacks:
 * - NEXT_PUBLIC_CLARITY_ID
 * - NEXT_PUBLIC_GA4_ID (legacy: NEXT_PUBLIC_GA_MEASUREMENT_ID)
 * - NEXT_PUBLIC_GTM_ID / NEXT_PUBLIC_GTM_ENABLED / NEXT_PUBLIC_GTM_GA4_ID
 * - NEXT_PUBLIC_COUNTER_ID (legacy: NEXT_PUBLIC_COUNTER_DEV_ID) / NEXT_PUBLIC_COUNTER_UTCOFFSET
 * - NEXT_PUBLIC_ANALYTICS_ENABLED ('false' disables everything)
 */

export type AnalyticsEnv = Record<string, string | undefined>;

export type AnalyticsConfig = {
  /** Kill switch: false disables every analytics script. */
  enabled: boolean;
  clarityId: string;
  ga4Id: string;
  /** Load the gtag snippet directly (false when GTM already tracks this GA4 id). */
  loadGa4: boolean;
  /** Load the GTM container script. */
  loadGtm: boolean;
  gtmId: string;
  counterId: string;
  counterUtcOffset: string;
};

export const ANALYTICS_DEFAULTS = {
  enabled: true,
  clarityId: 'vtlognmjgs',
  ga4Id: 'G-V44M6KV02M',
  gtmId: '',
  gtmEnabled: false,
  gtmGa4Id: '',
  counterId: 'f30df6f3-776d-4154-959d-0210ac8a8325',
  counterUtcOffset: '-3',
} as const;

const PLACEHOLDER_IDS = new Set(['g-xxxxxxxxxx', 'gtm-xxxxxxx']);

function resolveValue(value: string | undefined, fallback: string): string {
  const trimmed = (value ?? '').trim();
  if (trimmed === '' || PLACEHOLDER_IDS.has(trimmed.toLowerCase())) return fallback;
  return trimmed;
}

function resolveEnabled(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  return fallback;
}

/**
 * Pure resolver: empty or placeholder env values fall back to DEFAULTS,
 * and the new env name always wins over its legacy fallback.
 */
export function resolveAnalyticsConfig(env: AnalyticsEnv): AnalyticsConfig {
  const enabled = resolveEnabled(env.NEXT_PUBLIC_ANALYTICS_ENABLED, ANALYTICS_DEFAULTS.enabled);

  const ga4Id =
    resolveValue(env.NEXT_PUBLIC_GA4_ID, '') ||
    resolveValue(env.NEXT_PUBLIC_GA_MEASUREMENT_ID, '') ||
    ANALYTICS_DEFAULTS.ga4Id;

  const counterId =
    resolveValue(env.NEXT_PUBLIC_COUNTER_ID, '') ||
    resolveValue(env.NEXT_PUBLIC_COUNTER_DEV_ID, '') ||
    ANALYTICS_DEFAULTS.counterId;

  const gtmId = resolveValue(env.NEXT_PUBLIC_GTM_ID, ANALYTICS_DEFAULTS.gtmId);
  const gtmEnabled = resolveEnabled(env.NEXT_PUBLIC_GTM_ENABLED, ANALYTICS_DEFAULTS.gtmEnabled);
  const loadGtm = gtmEnabled && gtmId !== '';

  const gtmGa4Id = resolveValue(env.NEXT_PUBLIC_GTM_GA4_ID, ANALYTICS_DEFAULTS.gtmGa4Id);
  // GTM already tracks this measurement id — loading gtag too would double-count.
  const loadGa4 = !(loadGtm && gtmGa4Id !== '' && gtmGa4Id === ga4Id);

  return {
    enabled,
    clarityId: resolveValue(env.NEXT_PUBLIC_CLARITY_ID, ANALYTICS_DEFAULTS.clarityId),
    ga4Id,
    loadGa4,
    loadGtm,
    gtmId,
    counterId,
    counterUtcOffset: resolveValue(
      env.NEXT_PUBLIC_COUNTER_UTCOFFSET,
      ANALYTICS_DEFAULTS.counterUtcOffset,
    ),
  };
}
