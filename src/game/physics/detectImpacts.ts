import type Rapier from '@dimforge/rapier3d-compat';
import type { GameState, Impact } from '../types';
import { EXTENTS } from '../config';
import { COLLIDER_DEPTH } from './collisionGroups';
import { sweepShapes } from './shapeSweep';

/** Rapier's moving-shape cast evaluates both trajectories over the whole tick,
 * including opposing lasers that exchange sides between rendered frames. */
export function createCollisionDetector(rapier: typeof Rapier) {
  const player = new rapier.Cuboid(
    EXTENTS.player.x,
    EXTENTS.player.y,
    COLLIDER_DEPTH,
  );
  const enemy = new rapier.Cuboid(
    EXTENTS.enemy.x,
    EXTENTS.enemy.y,
    COLLIDER_DEPTH,
  );
  const laser = new rapier.Cuboid(
    EXTENTS.laser.x,
    EXTENTS.laser.y,
    COLLIDER_DEPTH,
  );
  return (state: GameState): Impact[] => {
    const impacts: Impact[] = [];
    const friendly = state.projectiles.filter((p) => p.side === 'player');
    const hostile = state.projectiles.filter((p) => p.side === 'enemy');
    const enemies = state.enemies.filter((e) => e.mode !== 'reserve');
    for (const a of friendly) {
      for (const b of hostile) {
        const toi = sweepShapes(laser, a.previous, a, laser, b.previous, b);
        if (toi !== undefined)
          impacts.push({ kind: 'cancel', a: a.id, b: b.id, toi });
      }
      for (const b of enemies) {
        const toi = sweepShapes(laser, a.previous, a, enemy, b.previous, b);
        if (toi !== undefined)
          impacts.push({ kind: 'kill', projectile: a.id, enemy: b.id, toi });
      }
    }
    for (const a of hostile) {
      const toi = sweepShapes(
        laser,
        a.previous,
        a,
        player,
        state.previousPlayer,
        state.player,
      );
      if (toi !== undefined)
        impacts.push({ kind: 'hit', projectile: a.id, toi });
    }
    for (const a of enemies.filter((e) => e.mode === 'launched')) {
      const toi = sweepShapes(
        enemy,
        a.previous,
        a,
        player,
        state.previousPlayer,
        state.player,
      );
      if (toi !== undefined) impacts.push({ kind: 'hit', enemy: a.id, toi });
    }
    return impacts;
  };
}
