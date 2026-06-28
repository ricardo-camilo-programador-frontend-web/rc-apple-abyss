/**
 * Lightweight analytics module.
 * Uses Clarity (already loaded) + custom event tracking.
 * No external dependencies — just a wrapper around dataLayer/window.clarity.
 */

type EventParams = Record<string, string | number | boolean>;

/**
 * Track a game event. Works with Clarity and Google Analytics (if added).
 * Silently no-ops in environments without analytics.
 */
export function trackEvent(eventName: string, params?: EventParams): void {
  if (typeof window === 'undefined') return;

  // Clarity custom tags
  const clarity = (window as unknown as { clarity?: (...args: unknown[]) => void }).clarity;
  if (typeof clarity === 'function') {
    try {
      clarity('event', eventName);
    } catch {
      // no-op
    }
  }

  // Console in development
  if (process.env.NODE_ENV === 'development') {
    console.debug('[analytics]', eventName, params);
  }
}

/**
 * Track user engagement milestones.
 */
export const analytics = {
  ascension: (luckyWorms: number, stage: number) => {
    trackEvent('ascension', { luckyWorms, stage });
  },
  skillActivation: (skillId: string) => {
    trackEvent('skill_activated', { skillId });
  },
  appleEaten: (totalEaten: number) => {
    // Only track milestones to avoid spam
    const milestones = [10, 50, 100, 500, 1000, 5000, 10000];
    if (milestones.includes(totalEaten)) {
      trackEvent('apple_milestone', { totalEaten });
    }
  },
  upgradePurchased: (upgradeId: string, count: number) => {
    if (count === 1) {
      trackEvent('first_upgrade', { upgradeId });
    }
  },
  languageChanged: (language: string) => {
    trackEvent('language_changed', { language });
  },
  themeChanged: (theme: string) => {
    trackEvent('theme_changed', { theme });
  },
};
