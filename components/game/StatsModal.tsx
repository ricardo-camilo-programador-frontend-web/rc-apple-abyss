'use client';

import React from 'react';
import Modal from '@/components/Modal';
import type { GameState } from '@/lib/game/types';

interface StatsModalProps {
  isOpen: boolean;
  state: GameState;
  t: (key: string, params?: any) => string;
  onClose: () => void;
}

export default function StatsModal({ isOpen, state, t, onClose }: StatsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('statistics')}>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Total Clicks:</span>{' '}
          <span className="font-mono font-bold">{state.totalClicks}</span>
        </div>
        <div className="flex justify-between">
          <span>Apples Eaten:</span>{' '}
          <span className="font-mono font-bold">{state.totalApplesEaten}</span>
        </div>
        <div className="flex justify-between">
          <span>Lucky Worms:</span> <span className="font-mono font-bold">{state.luckyWorms}</span>
        </div>
        <div className="flex justify-between">
          <span>Gold Bonus:</span>{' '}
          <span className="font-mono font-bold">+{state.luckyWorms * 5}%</span>
        </div>
      </div>
    </Modal>
  );
}
