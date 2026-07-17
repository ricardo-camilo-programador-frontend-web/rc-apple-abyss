'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, Lock } from 'lucide-react';

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

    // Simulate ad viewing experience.
    // In production, this would call Adsterra's interstitial API:
    //   loadAdsterra(ADSTERRA_ZONE_IDS[AdFormat.INTERSTITIAL].scriptUrl);
    //   then onAdClose callback → onReward()
    //
    // For now, we use a short timeout to simulate the ad watch.
    // Goodwill policy: reward is granted even if the ad fails to load,
    // because penalizing the user for ad network failures causes churn.
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
      onClick={handleWatchAd}
      disabled={isLocked || isWatching}
      whileHover={!isLocked && !isWatching ? { scale: 1.02 } : {}}
      whileTap={!isLocked && !isWatching ? { scale: 0.98 } : {}}
      className={`w-full relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all overflow-hidden ${
        isLocked
          ? 'border-stone-100 bg-stone-50 cursor-not-allowed opacity-60'
          : 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 hover:border-emerald-300 shadow-md shadow-emerald-100/50'
      }`}
      title={disabled ? disabledReason : undefined}
    >
      {/* Ad badge */}
      <div className="absolute top-1.5 right-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-100 rounded-full">
        <Play className="w-2.5 h-2.5 text-emerald-600" />
        <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-700">Ad</span>
      </div>

      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
        isLocked ? 'bg-stone-200' : 'bg-emerald-100'
      }`}>
        {isLocked ? (
          <Lock className="w-5 h-5 text-stone-400" />
        ) : (
          <Icon className={`w-5 h-5 ${isLocked ? 'text-stone-400' : 'text-emerald-600'}`} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 text-left min-w-0">
        <div className={`font-bold text-sm ${isLocked ? 'text-stone-400' : 'text-emerald-900'}`}>
          {label}
        </div>
        <div className={`text-xs truncate ${isLocked ? 'text-stone-300' : 'text-emerald-700'}`}>
          {isWatching ? 'Watching ad...' : description}
        </div>
      </div>

      {/* Cooldown / watching indicator */}
      {cooldownRemaining > 0 && !isWatching && (
        <div className="flex-shrink-0 px-2 py-1 bg-stone-200 rounded-lg">
          <span className="text-xs font-mono font-bold text-stone-500">
            {Math.ceil(cooldownRemaining)}s
          </span>
        </div>
      )}

      {/* Watching progress bar */}
      {isWatching && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-emerald-500"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 3, ease: 'linear' }}
        />
      )}
    </motion.button>
  );
}
