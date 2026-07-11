'use client';

import React from 'react';
import Modal from '@/components/Modal';
import { GameEngine } from '@/lib/game/engine';
import { GoalProgress } from '@/lib/game/types';
import { DAILY_REWARD_CONFIG } from '@/lib/game/constants';
import { getGoalDefinition } from '@/lib/game/goals';
import { calculateDailyGoldReward } from '@/lib/game/daily-reward';
import { analytics } from '@/lib/analytics';
import { Coins, Sparkles, Gift, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface JourneyModalProps {
  isOpen: boolean;
  engine: GameEngine;
  t: (key: string, params?: Record<string, string | number>) => string;
  onClose: () => void;
}

export default function JourneyModal({
  isOpen,
  engine,
  t,
  onClose,
}: JourneyModalProps) {
  const [goalProgress, setGoalProgress] = React.useState<GoalProgress[]>([]);
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

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
  };

  const completedGoals = goalProgress.filter((goalProgress) => goalProgress.isCompleted);
  const pendingGoals = goalProgress.filter((goalProgress) => !goalProgress.isCompleted);

  // Build streak day indicators
  const streakDays = Array.from({ length: DAILY_REWARD_CONFIG.MAX_STREAK }, (_, index) => index + 1);
  const currentStreak = engine.getState().journey?.dailyReward.streak ?? 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('journey_title')}>
      <div className="space-y-5">
        {/* Daily Reward Section */}
        <section>
          <h3 className="font-bold text-sm uppercase tracking-wide text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-500" />
            {t('daily_reward_title')}
          </h3>

          {/* Streak indicators */}
          <div className="flex justify-between gap-1 mb-3">
            {streakDays.map((day) => (
              <div
                key={day}
                className={`flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                  day <= currentStreak
                    ? 'bg-gradient-to-b from-amber-400 to-orange-400 text-white'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-400 dark:text-stone-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Claim button or timer */}
          {claimResult ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl border border-amber-200 dark:border-amber-700"
            >
              <Coins className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-amber-700 dark:text-amber-300">
                {t('daily_reward_claimed_day', { day: claimResult })}
              </span>
            </motion.div>
          ) : canClaim ? (
            <button
              onClick={handleClaimDailyReward}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Gift className="w-5 h-5" />
              {t('daily_reward_claim')}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 p-3 bg-stone-100 dark:bg-stone-700/50 rounded-xl text-stone-500 dark:text-stone-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {t('daily_reward_next', { time: formatTimeRemaining(timeUntilNext) })}
              </span>
            </div>
          )}
        </section>

        {/* Divider */}
        <hr className="border-stone-200 dark:border-stone-700" />

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <section>
            <h3 className="font-bold text-sm uppercase tracking-wide text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {t('goals_completed', { count: completedGoals.length })}
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {completedGoals.map((progress) => (
                <div
                  key={progress.goalId}
                  className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
                      {t(progress.goalId + '_name')}
                    </p>
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
            <h3 className="font-bold text-sm uppercase tracking-wide text-stone-500 dark:text-stone-400 mb-3">
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
                      <p className="text-sm text-stone-700 dark:text-stone-300 truncate">
                        {t(progress.goalId + '_name')}
                      </p>
                      <span className="text-xs font-mono text-stone-400">
                        {Math.min(progress.currentValue, targetValue)}/{targetValue}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
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
      </div>
    </Modal>
  );
}
