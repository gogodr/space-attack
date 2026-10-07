import type { GameEngine } from '../../engine';
import { EXTENTS } from '../../config';
import { COLLISION_GROUPS } from '../../physics/collisionGroups';
import { EntityBody } from './EntityBody';
import { AtlasSprite } from '../sprites/AtlasSprite';
import { enemySprite } from '../sprites/enemySprites';

export function EnemyShip({ engine, id }: { engine: GameEngine; id: string }) {
  const enemy = engine.state.enemies.find((entity) => entity.id === id);
  return (
    <EntityBody
      position={enemy}
      getPosition={() =>
        engine.state.enemies.find((entity) => entity.id === id)
      }
      extents={EXTENTS.enemy}
      collisionGroups={COLLISION_GROUPS.enemy}
    >
      <AtlasSprite
        clip={enemySprite(enemy)}
        size={[1.55, 1.55]}
        getTime={() => engine.state.time}
        offset={(enemy?.column ?? 0) * 0.07}
      />
    </EntityBody>
  );
}
