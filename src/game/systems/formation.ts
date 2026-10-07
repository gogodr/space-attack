import { ARENA, EXTENTS, TUNING } from '../config';
import type { Enemy, GameState } from '../types';
import type { FormationRuntime } from '../simulation/runtime';
import { EPS, clamp } from '../utils/math';

export function advanceFormation(
  state: GameState,
  runtime: FormationRuntime,
  dt: number,
) {
  runtime.clock += dt;
  while (runtime.clock + EPS >= state.config.formationInterval) {
    runtime.clock -= state.config.formationInterval;
    moveFormation(state, runtime);
  }
}
function moveFormation(state: GameState, runtime: FormationRuntime) {
  const enemies = state.enemies.filter((e) => e.mode === 'formation');
  if (!enemies.length) return;
  if (runtime.boundaryPending) {
    for (const e of enemies) e.y -= TUNING.stepY;
    runtime.direction *= -1;
    runtime.boundaryPending = false;
    return;
  }
  const rows = new Map<number, Enemy[]>();
  for (const enemy of enemies) {
    const row = rows.get(enemy.row) ?? [];
    row.push(enemy);
    rows.set(enemy.row, row);
  }
  const references = [...rows.values()].map((row) => ({
    left: Math.min(...row.map((e) => e.x)) - EXTENTS.enemy.x,
    right: Math.max(...row.map((e) => e.x)) + EXTENTS.enemy.x,
  }));
  references.sort(
    (a, b) =>
      b.right - b.left - (a.right - a.left) ||
      (runtime.direction > 0 ? b.right - a.right : a.left - b.left),
  );
  const ref = references[0];
  const room =
    runtime.direction > 0 ? ARENA.right - ref.right : ref.left - ARENA.left;
  const distance = Math.max(0, Math.min(TUNING.stepX, room));
  for (const e of enemies)
    e.x = clamp(
      e.x + runtime.direction * distance,
      ARENA.left + EXTENTS.enemy.x,
      ARENA.right - EXTENTS.enemy.x,
    );
  if (room <= TUNING.stepX + EPS) runtime.boundaryPending = true;
}
