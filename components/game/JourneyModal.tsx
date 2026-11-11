'use client';

import { CheckCircle, Clock, Coins, Gift, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import Modal from '@/components/Modal';
import { analytics } from '@/lib/analytics';
import { DAILY_REWARD_CONFIG } from '@/lib/game/constants';
import { calculateDailyGoldReward } from '@/lib/game/daily-reward';
import type { GameEngine } from '@/lib/game/engine';
import { getGoalDefinition } from '@/lib/game/goals';
import type { GoalProgress } from '@/lib/game/types';

interface JourneyModalProps {
  isOpen: boolean;
  engine: GameEngine;
  t: (key: string, params?: Record<string, string | number>) => string;
  onClose: () => void;
}

export default function JourneyModal({ isOpen, engine, t, onClose }: JourneyModalProps) {
  const [goalProgress, setGoalProgress] = React.useState<Array<GoalProgress>>([]);
  const [canClaim, setCanClaim] = React.useState(false);
  const [claimResult, setClaimResult] = React.useState<number | null>(null);
  const [timeUntilNext, setTimeUntilNext] = React.useState(0);

  const refreshState = React.useCallback(() => {
    setGoalProgress(engine.getAllGoalProgress());
    setCanClaim(engine.canClaimDailyReward());
    setTimeUntilNext(engine.getTimeUntilNextDailyReward());
  }, [engine]);

  React.useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional initial refresh from engine state
      refreshState();
      const interval = setInterval(refreshState, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, refreshState]);

  const handleClaimDailyReward = () => {
    const streakDay = engine.claimDailyReward();
    if (streakDay > 0) {
      const goldReward = calculateDailyGoldReward(streakDay, engine.getState().stage);
      analytics.dailyRewardClaimed(streakDay, goldReward);
      setClaimResult(streakDay);
      refreshState();
      setTimeout(() => setClaimResult(null), 3000);
    }
  };

  const formatTimeRemaining = (milliseconds: number): string => {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: Array<string> = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
  };

  const completedGoals = goalProgress.filter((goalProgress) => goalProgress.isCompleted);
  const pendingGoals = goalProgress.filter((goalProgress) => !goalProgress.isCompleted);

  // Build streak day indicators
  const streakDays = Array.from(
    { length: DAILY_REWARD_CONFIG.MAX_STREAK },
    (_, index) => index + 1,
  );
  const currentStreak = engine.getState().journey?.dailyReward.streak ?? 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('journey_title')}>
      <div className="space-y-5">
        {/* Daily Reward Section */}
        <section>
          <h3 className="abyss-kicker mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4" aria-hidden="true" />
            {t('daily_reward_title')}
          </h3>

          {/* Streak indicators */}
          <div className="flex justify-between gap-1 mb-3">
            {streakDays.map((day) => (
              <div key={day} className={`abyss-streak ${day <= currentStreak ? 'is-on' : ''}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Claim button or timer */}
          {claimResult ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="abyss-callout flex items-center justify-center gap-2"
            >
              <Coins className="w-5 h-5" aria-hidden="true" />
              <span className="font-bold">
                {t('daily_reward_claimed_day', { day: claimResult })}
              </span>
            </motion.div>
          ) : canClaim ? (
            <button
              type="button"
              onClick={handleClaimDailyReward}
              className="abyss-btn abyss-btn-apple"
            >
              <Gift className="w-5 h-5" aria-hidden="true" />
              {t('daily_reward_claim')}
            </button>
          ) : (
            <div className="abyss-empty flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {t('daily_reward_next', { time: formatTimeRemaining(timeUntilNext) })}
              </span>
            </div>
          )}
        </section>

        {/* Divider */}
        <hr style={{ borderColor: 'var(--line)' }} />

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <section>
            <h3 className="abyss-kicker mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" aria-hidden="true" />
              {t('goals_completed', { count: completedGoals.length })}
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {completedGoals.map((progress) => (
                <div key={progress.goalId} className="abyss-goal-done">
                  <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t(progress.goalId + '_name')}</p>
                  </div>
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pending Goals */}
        {pendingGoals.length > 0 && (
          <section>
            <h3 className="abyss-kicker mb-3">
              {t('goals_pending', { count: pendingGoals.length })}
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {pendingGoals.map((progress) => {
                const definition = getGoalDefinition(progress.goalId);
                const targetValue = definition?.targetValue ?? 1;
                const percentage = Math.min(100, (progress.currentValue / targetValue) * 100);
                return (
                  <div key={progress.goalId} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm truncate">{t(progress.goalId + '_name')}</p>
                      <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                        {Math.min(progress.currentValue, targetValue)}/{targetValue}
                      </span>
                    </div>
                    <div className="abyss-track">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'var(--gold)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {completedGoals.length === 0 && pendingGoals.length === 0 && (
          <p className="abyss-empty">No goals to show yet.</p>
        )}
      </div>
    </Modal>
  );
}
