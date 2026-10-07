import { useSyncExternalStore } from 'react';
import type { GameEngine } from '../../engine';
import { PlayerShip } from './PlayerShip';
import { EnemyShip } from './EnemyShip';
import { LaserProjectile } from './LaserProjectile';
import { ExplosionEffect } from '../effects/ExplosionEffect';
import { SpriteAtlasProvider } from '../sprites/SpriteAtlasProvider';

export function GameEntities({ engine }: { engine: GameEngine }) {
  useSyncExternalStore(
    engine.subscribe,
    engine.getSnapshot,
    engine.getSnapshot,
  );
  const state = engine.state;
  return (
    <SpriteAtlasProvider>
      <PlayerShip engine={engine} />
      {state.enemies
        .filter((enemy) => enemy.mode !== 'reserve')
        .map((enemy) => (
          <EnemyShip key={enemy.id} engine={engine} id={enemy.id} />
        ))}
      {state.projectiles.map((projectile) => (
        <LaserProjectile
          key={projectile.id}
          engine={engine}
          id={projectile.id}
        />
      ))}
      {state.effects.map((effect) => (
        <ExplosionEffect key={effect.id} effect={effect} />
      ))}
    </SpriteAtlasProvider>
  );
}
