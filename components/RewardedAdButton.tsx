'use client';

import { Loader2, Lock, Play } from 'lucide-react';
import { motion } from 'motion/react';
import type React from 'react';
import type { RewardStatus } from '@/lib/ads/rewarded-store';

/**
 * Uma recompensa do Free Rewards com anúncio real (H5 Games Ads).
 *
 * Fluxo: o jogador toca na recompensa → pedimos o anúncio ao Google →
 * se houver, aparece "Watch ad" → o anúncio passa → o bônus só sai quando o
 * Google confirma que foi assistido (`adViewed`). Sem anúncio, a tela diz isso
 * e libera nova tentativa depois.
 */
export interface RewardedAdButtonProps {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Cooldown restante em segundos depois de uma recompensa entregue. */
  cooldownRemaining: number;
  status: RewardStatus;
  /** Segundos até a próxima tentativa quando não houve anúncio. */
  retryIn: number;
  /** Pede o anúncio ao Google. */
  onRequest: () => void;
  /** Mostra o anúncio já disponível (gesto do jogador). */
  onWatch: () => void;
  disabled?: boolean;
  disabledReason?: string;
}

export function rewardStatusText(
  status: RewardStatus,
  description: string,
  retryIn: number,
): string {
  switch (status) {
    case 'checking':
      return 'Looking for an ad...';
    case 'ready':
      return 'Ad ready. Watch it to get the reward.';
    case 'showing':
      return 'Ad playing...';
    case 'unavailable':
      return `No ad available right now. Try again in ${retryIn}s.`;
    case 'dismissed':
      return 'Ad closed before the end. No reward this time.';
    default:
      return description;
  }
}

export default function RewardedAdButton({
  label,
  description,
  icon: Icon,
  cooldownRemaining,
  status,
  retryIn,
  onRequest,
  onWatch,
  disabled = false,
  disabledReason,
}: RewardedAdButtonProps) {
  const onCooldown = cooldownRemaining > 0;
  const busy = status === 'checking' || status === 'showing';
  const waitingRetry = status === 'unavailable';
  const isLocked = onCooldown || disabled;
  const canRequest = !isLocked && !busy && !waitingRetry && status !== 'ready';
  const text = rewardStatusText(status, description, retryIn);

  return (
    <div className="space-y-2">
      <motion.button
        type="button"
        onClick={canRequest ? onRequest : undefined}
        disabled={!canRequest}
        aria-busy={busy}
        whileHover={canRequest ? { scale: 1.02 } : {}}
        whileTap={canRequest ? { scale: 0.98 } : {}}
        className={`abyss-card ${isLocked ? '' : 'is-gold'}`}
        title={disabled ? disabledReason : undefined}
      >
        <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full abyss-level">
          <Play className="w-2.5 h-2.5" aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Ad</span>
        </div>

        <div className="abyss-card-icon">
          {isLocked ? (
            <Lock className="w-5 h-5" aria-hidden="true" />
          ) : busy ? (
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          ) : (
            <Icon className="w-5 h-5" aria-hidden="true" />
          )}
        </div>

        <div className="flex-1 text-left min-w-0">
          <div className="font-bold text-sm">{label}</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }} aria-live="polite">
            {text}
          </div>
        </div>

        {onCooldown && (
          <div className="abyss-level">
            <span className="text-xs font-mono font-bold">{Math.ceil(cooldownRemaining)}s</span>
          </div>
        )}
      </motion.button>

      {status === 'ready' && !isLocked && (
        <button type="button" onClick={onWatch} className="abyss-btn abyss-btn-teal w-full">
          <Play className="w-4 h-4" aria-hidden="true" />
          <span className="text-sm">Watch ad</span>
        </button>
      )}
    </div>
  );
}
