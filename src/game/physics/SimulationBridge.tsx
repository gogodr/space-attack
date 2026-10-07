import { useEffect, useMemo } from 'react';
import { useBeforePhysicsStep, useRapier } from '@react-three/rapier';
import type { GameEngine } from '../engine';
import { createCollisionDetector } from './detectImpacts';

export function SimulationBridge({
  engine,
  onReady,
}: {
  engine: GameEngine;
  onReady: () => void;
}) {
  const { rapier } = useRapier();
  const detect = useMemo(() => createCollisionDetector(rapier), [rapier]);
  useEffect(onReady, [onReady]);
  useBeforePhysicsStep(() => {
    engine.prepareStep(1 / 60);
    if (engine.state.phase === 'playing') {
      engine.resolveStep(detect(engine.state));
    }
  });
  return null;
}
