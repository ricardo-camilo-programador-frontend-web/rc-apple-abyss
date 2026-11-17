'use client';

import React from 'react';
import Modal from '@/components/Modal';
import type { GameState } from '@/lib/game/types';
import NumberText from './NumberText';

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
          <span>Total Clicks:</span> <NumberText value={state.totalClicks} className="font-bold" />
        </div>
        <div className="flex justify-between">
          <span>Apples Eaten:</span>{' '}
          <NumberText value={state.totalApplesEaten} className="font-bold" />
        </div>
        <div className="flex justify-between">
          <span>Lucky Worms:</span> <NumberText value={state.luckyWorms} className="font-bold" />
        </div>
        <div className="flex justify-between">
          <span>Gold Bonus:</span>{' '}
          <span className="abyss-num font-bold">
            +<NumberText value={state.luckyWorms * 5} />%
          </span>
        </div>
      </div>
    </Modal>
  );
}
