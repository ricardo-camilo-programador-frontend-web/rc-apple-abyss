import { useEffect } from 'react';
import type { GameEngine } from '@/lib/game/engine';

export function useGameLoop(engine: GameEngine, onStateUpdate: () => void) {
  useEffect(() => {
    let frameId: number;
    const loop = () => {
      engine.tick();
      onStateUpdate();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [engine, onStateUpdate]);
}
