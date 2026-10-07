import type { GameEngine } from '../../engine';
import { EXTENTS } from '../../config';
import { COLLISION_GROUPS } from '../../physics/collisionGroups';
import { EntityBody } from './EntityBody';
import { AtlasSprite } from '../sprites/AtlasSprite';

export function LaserProjectile({
  engine,
  id,
}: {
  engine: GameEngine;
  id: string;
}) {
  const projectile = engine.state.projectiles.find(
    (entity) => entity.id === id,
  );
  const side = projectile?.side;
  return (
    <EntityBody
      position={projectile}
      getPosition={() =>
        engine.state.projectiles.find((entity) => entity.id === id)
      }
      extents={EXTENTS.laser}
      collisionGroups={
        side === 'player'
          ? COLLISION_GROUPS.playerLaser
          : COLLISION_GROUPS.enemyLaser
      }
    >
      <AtlasSprite
        clip={side === 'player' ? 'laser-player' : 'laser-enemy'}
        size={[0.6, 0.85]}
        getTime={() => engine.state.time}
      />
    </EntityBody>
  );
}
