import { TUNING, EXTENTS } from '../config';
import type { GameState } from '../types';
import { EPS } from '../utils/math';

export function admitReserves(state: GameState) {
  for (const reserve of state.enemies.filter((e) => e.mode === 'reserve')) {
    const formation = state.enemies.filter((e) => e.mode === 'formation');
    if (
      state.enemies.filter((e) => e.mode !== 'reserve').length >=
      TUNING.visibleCapacity
    )
      return;
    const x = (reserve.column - 2.5) * TUNING.spacingX,
      y = TUNING.formationTop;
    // Reserve arrivals cannot overlap ships or lasers, including a moving top row.
    if (
      state.enemies.some(
        (e) =>
          e.mode !== 'reserve' &&
          Math.abs(e.x - x) < 2 * EXTENTS.enemy.x + 0.2 &&
          Math.abs(e.y - y) < 2 * EXTENTS.enemy.y + 0.2,
      ) ||
      state.projectiles.some(
        (p) =>
          Math.abs(p.x - x) < EXTENTS.enemy.x + EXTENTS.laser.x + 0.2 &&
          Math.abs(p.y - y) < EXTENTS.enemy.y + EXTENTS.laser.y + 0.2,
      )
    )
      continue;
    reserve.x = x;
    reserve.y = y;
    reserve.previous = { x, y };
    reserve.mode = 'formation';
    const topRow = formation.find((e) => Math.abs(e.y - y) < EPS);
    reserve.row =
      topRow?.row ?? Math.min(0, ...formation.map((e) => e.row)) - 1;
  }
}
