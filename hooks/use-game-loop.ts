import { useEffect } from 'react';
import { GameEngine } from '@/lib/game/engine';
import { GameState } from '@/lib/game/types';

export function useGameLoop(engine: GameEngine, onStateUpdate: (state: GameState) => void) {
  useEffect(() => {
    let frameId: number;
    const loop = () => {
      engine.tick();
      onStateUpdate({ ...engine.getState() });
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [engine, onStateUpdate]);
}
