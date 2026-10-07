import { TUNING } from '../config';
import type { GameState } from '../types';
import type { LaunchRuntime } from '../simulation/runtime';
import { EPS } from '../utils/math';

export function advanceLaunches(
  state: GameState,
  runtime: LaunchRuntime,
  dt: number,
) {
  runtime.clock += dt;
  if (
    runtime.clock + EPS >= state.config.launchInterval &&
    state.enemies.filter((e) => e.mode === 'launched').length <
      state.config.launchedCap
  ) {
    if (launchEnemy(state, runtime)) runtime.clock = 0;
  }
}
function launchEnemy(state: GameState, runtime: LaunchRuntime) {
  const formation = state.enemies.filter((e) => e.mode === 'formation');
  if (!formation.length) return false;
  const bottomRow = Math.max(...formation.map((e) => e.row));
  const candidates = formation
    .filter((e) => e.row === bottomRow)
    .sort((a, b) => a.x - b.x || a.id.localeCompare(b.id));
  const enemy = runtime.left
    ? candidates[0]
    : candidates[candidates.length - 1];
  enemy.mode = 'launched';
  enemy.direction =
    Math.abs(enemy.x) <= EPS ? (runtime.left ? 1 : -1) : -Math.sign(enemy.x);
  enemy.age = 0;
  enemy.fireTimer = TUNING.launchTelegraph;
  runtime.left = !runtime.left;
  return true;
}
