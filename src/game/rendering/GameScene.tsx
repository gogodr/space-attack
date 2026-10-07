import { Suspense, useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import type { GameEngine } from '../engine';
import { SimulationBridge } from '../physics/SimulationBridge';
import { ArenaCamera } from './scene/ArenaCamera';
import { Starfield } from './scene/Starfield';
import { SceneErrorBoundary } from './scene/SceneErrorBoundary';
import { FlightSystemsLoading } from './scene/FlightSystemsLoading';
import { GameEntities } from './entities/GameEntities';

export function GameScene({ engine }: { engine: GameEngine }) {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <SceneErrorBoundary>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 30], near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false }}
        style={{ background: '#070c19' }}
      >
        <color attach="background" args={['#070c19']} />
        <ArenaCamera />
        <Starfield />
        <Suspense fallback={null}>
          <Physics
            gravity={[0, 0, 0]}
            timeStep={1 / 60}
            interpolate={false}
            colliders={false}
          >
            <SimulationBridge engine={engine} onReady={onReady} />
            <GameEntities engine={engine} />
          </Physics>
        </Suspense>
      </Canvas>
      {!ready && <FlightSystemsLoading />}
    </SceneErrorBoundary>
  );
}
