import { ARENA, EXTENTS } from '../config';
import type { GameState } from '../types';
import type { SimulationActions } from '../simulation/contracts';
import { EPS } from '../utils/math';
import { spawnLaser } from './projectiles';

export function advanceLaunchedEnemies(
  state: GameState,
  actions: SimulationActions,
  dt: number,
) {
  for (const enemy of state.enemies) {
    if (enemy.mode !== 'launched') continue;
    enemy.age += dt;
    enemy.y -= state.config.descentSpeed * dt;
    enemy.x += enemy.direction * state.config.horizontalSpeed * dt;
    const low = ARENA.left + EXTENTS.enemy.x,
      high = ARENA.right - EXTENTS.enemy.x;
    while (enemy.x < low || enemy.x > high) {
      if (enemy.x < low) {
        enemy.x = 2 * low - enemy.x;
        enemy.direction = 1;
      }
      if (enemy.x > high) {
        enemy.x = 2 * high - enemy.x;
        enemy.direction = -1;
      }
    }
    enemy.fireTimer -= dt;
    while (enemy.fireTimer <= EPS) {
      spawnLaser(
        state,
        actions,
        'enemy',
        enemy.x,
        enemy.y - EXTENTS.enemy.y - EXTENTS.laser.y - 0.05,
      );
      enemy.fireTimer += state.config.fireInterval;
    }
  }
}
