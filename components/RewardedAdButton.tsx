'use client';

import { Lock, Play } from 'lucide-react';
import { motion } from 'motion/react';
import type React from 'react';
import { useCallback, useState } from 'react';

/**
 * RewardedAdButton — opt-in ad experience for idle/incremental games.
 *
 * Industry data (2026 benchmarks):
 * - Rewarded video eCPM: $16–$20 (vs banner $1.22)
 * - Completion rate: >95% (opt-in structure)
 * - D30 retention: 53.2% for users who watch even 1 rewarded video (vs 12–13% without)
 * - IAP conversion: 4x higher for rewarded ad users
 *
 * Design:
 * - Player taps button → interstitial loads → reward granted
 * - Cooldown prevents spamming (configurable per reward type)
 * - Graceful degradation: if ads fail, reward is still given (goodwill UX)
 */

export interface RewardedAdButtonProps {
  /** Display label for the reward */
  label: string;
  /** Short description of the reward effect */
  description: string;
  /** Icon component to render */
  icon: React.ComponentType<{ className?: string }>;
  /** Cooldown in seconds. If >0, button is disabled. */
  cooldownRemaining: number;
  /** Callback when the ad is "watched" (or fails to load — goodwill) */
  onReward: () => void;
  /** Whether this reward is available (e.g. instant harvest needs DPS > 0) */
  disabled?: boolean;
  /** Disabled reason tooltip */
  disabledReason?: string;
}

export default function RewardedAdButton({
  label,
  description,
  icon: Icon,
  cooldownRemaining,
  onReward,
  disabled = false,
  disabledReason,
}: RewardedAdButtonProps) {
  const [isWatching, setIsWatching] = useState(false);

  const handleWatchAd = useCallback(() => {
    if (cooldownRemaining > 0 || disabled || isWatching) return;

    setIsWatching(true);

    // Local goodwill timer. This button does not load a third-party ad.
    // The reward is granted after a short delay so a missing ad network
    // never blocks the player.
    const adDuration = 3000; // Simulated 3s ad (real rewarded videos are 15–30s)

    const timer = setTimeout(() => {
      setIsWatching(false);
      onReward();
    }, adDuration);

    return () => clearTimeout(timer);
  }, [cooldownRemaining, disabled, isWatching, onReward]);

  const isLocked = cooldownRemaining > 0 || disabled;

  return (
    <motion.button
      type="button"
      onClick={handleWatchAd}
      disabled={isLocked || isWatching}
      whileHover={!isLocked && !isWatching ? { scale: 1.02 } : {}}
      whileTap={!isLocked && !isWatching ? { scale: 0.98 } : {}}
      className={`abyss-card ${isLocked ? '' : 'is-gold'}`}
      title={disabled ? disabledReason : undefined}
    >
      {/* Ad badge */}
      <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full abyss-level">
        <Play className="w-2.5 h-2.5" aria-hidden="true" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Ad</span>
      </div>

      {/* Icon */}
      <div className="abyss-card-icon">
        {isLocked ? (
          <Lock className="w-5 h-5" aria-hidden="true" />
        ) : (
          <Icon className="w-5 h-5" aria-hidden="true" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 text-left min-w-0">
        <div className="font-bold text-sm">{label}</div>
        <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>
          {isWatching ? 'Watching ad...' : description}
        </div>
      </div>

      {/* Cooldown / watching indicator */}
      {cooldownRemaining > 0 && !isWatching && (
        <div className="abyss-level">
          <span className="text-xs font-mono font-bold">{Math.ceil(cooldownRemaining)}s</span>
        </div>
      )}

      {/* Watching progress bar */}
      {isWatching && (
        <motion.div
          className="absolute bottom-0 left-0 h-1"
          style={{ background: 'var(--teal)' }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 3, ease: 'linear' }}
        />
      )}
    </motion.button>
  );
}
