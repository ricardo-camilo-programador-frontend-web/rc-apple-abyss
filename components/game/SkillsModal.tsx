'use client';

import { Sparkles } from 'lucide-react';
import React from 'react';
import Modal from '@/components/Modal';
import type { GameEngine } from '@/lib/game/engine';

interface SkillsModalProps {
  isOpen: boolean;
  engine: GameEngine;
  t: (key: string, params?: any) => string;
  onClose: () => void;
}

export default function SkillsModal({ isOpen, engine, t, onClose }: SkillsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('skills')}>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => {
            engine.activateSkill('golden_harvest');
            onClose();
          }}
          className="abyss-card is-gold"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="abyss-card-icon">
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="text-left">
                <div className="font-bold">Golden Harvest</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  x5 Click Gold, x2.5 Idle Gold for 20s
                </div>
              </div>
            </div>
            <div className="abyss-level">Active</div>
          </div>
        </button>
      </div>
    </Modal>
  );
}
