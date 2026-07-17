'use client';

import React from 'react';
import AscensionSidebar from '@/components/game/AscensionSidebar';
import UpgradeSidebar from '@/components/game/UpgradeSidebar';
import Modal from '@/components/Modal';
import type { GameEngine } from '@/lib/game/engine';
import type { GameState } from '@/lib/game/types';

interface MobileModalsProps {
  state: GameState;
  engine: GameEngine;
  t: (key: string, params?: Record<string, string | number>) => string;
  showUpgradesModal: boolean;
  showAscensionModal: boolean;
  showStatsPanelModal: boolean;
  onCloseUpgrades: () => void;
  onCloseAscension: () => void;
  onCloseStatsPanel: () => void;
  onBuyUpgrade: (id: string) => void;
  onBuyClickUpgrade: () => void;
  onAscend: () => void;
}

export default function MobileModals({
  state,
  engine,
  t,
  showUpgradesModal,
  showAscensionModal,
  showStatsPanelModal,
  onCloseUpgrades,
  onCloseAscension,
  onCloseStatsPanel,
  onBuyUpgrade,
  onBuyClickUpgrade,
  onAscend,
}: MobileModalsProps) {
  return (
    <>
      <Modal isOpen={showUpgradesModal} onClose={onCloseUpgrades} title={t('upgrades')}>
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
          <UpgradeSidebar
            state={state}
            engine={engine}
            t={t}
            onBuyUpgrade={onBuyUpgrade}
            onBuyClickUpgrade={onBuyClickUpgrade}
            className="flex flex-col gap-2"
          />
        </div>
      </Modal>

      <Modal isOpen={showAscensionModal} onClose={onCloseAscension} title={t('ascension')}>
        <AscensionSidebar
          state={state}
          engine={engine}
          t={t}
          onAscend={onAscend}
          className="flex flex-col gap-4"
        />
      </Modal>

      <Modal isOpen={showStatsPanelModal} onClose={onCloseStatsPanel} title={t('statistics')}>
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total Clicks:</span>{' '}
            <span className="font-mono font-bold">{state.totalClicks}</span>
          </div>
          <div className="flex justify-between">
            <span>Apples Eaten:</span>{' '}
            <span className="font-mono font-bold">{state.totalApplesEaten}</span>
          </div>
          <div className="flex justify-between">
            <span>Lucky Worms:</span>{' '}
            <span className="font-mono font-bold">{state.luckyWorms}</span>
          </div>
          <div className="flex justify-between">
            <span>Gold Bonus:</span>{' '}
            <span className="font-mono font-bold">+{state.luckyWorms * 5}%</span>
          </div>
        </div>
      </Modal>
    </>
  );
}
