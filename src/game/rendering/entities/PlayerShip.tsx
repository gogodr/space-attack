import type { GameEngine } from '../../engine';
import { EXTENTS } from '../../config';
import { COLLISION_GROUPS } from '../../physics/collisionGroups';
import { EntityBody } from './EntityBody';
import { AtlasSprite } from '../sprites/AtlasSprite';

export function PlayerShip({ engine }: { engine: GameEngine }) {
  return (
    <EntityBody
      position={engine.state.player}
      getPosition={() => engine.state.player}
      getVisible={() =>
        engine.state.protection <= 0 ||
        Math.floor(engine.state.time * 12) % 2 === 0
      }
      extents={EXTENTS.player}
      collisionGroups={COLLISION_GROUPS.player}
    >
      <AtlasSprite
        clip="player"
        size={[1.65, 1.65]}
        getTime={() => engine.state.time}
      />
    </EntityBody>
  );
}
