import { useEffect, useRef } from 'react';
import { GameEngine } from '@/lib/game/engine';
import { GameState } from '@/lib/game/types';

export function useGameKeyboard(engine: GameEngine, onStateUpdate: (state: GameState) => void) {
  const lastClickUpgradeTime = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c') {
        const now = Date.now();
        if (now - lastClickUpgradeTime.current < 150) return;
        lastClickUpgradeTime.current = now;
        if (engine.buyClickUpgrade()) {
          onStateUpdate({ ...engine.getState() });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine, onStateUpdate]);
}
