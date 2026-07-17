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
          onClick={() => {
            engine.activateSkill('golden_harvest');
            onClose();
          }}
          className="w-full p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl flex items-center justify-between hover:border-yellow-300 dark:hover:border-yellow-700 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-left">
              <div className="font-bold text-yellow-900 dark:text-yellow-200">Golden Harvest</div>
              <div className="text-xs text-yellow-700 dark:text-yellow-400">x5 Click Gold, x2.5 Idle Gold for 20s</div>
            </div>
          </div>
          <div className="text-xs font-bold bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded-full text-yellow-800 dark:text-yellow-200">
            Active
          </div>
        </button>
      </div>
    </Modal>
  );
}
