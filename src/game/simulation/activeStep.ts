import type { GameState, InputState } from '../types';
import type { SimulationRuntime } from './runtime';
import type { SimulationActions } from './contracts';
import { copy } from '../utils/math';
import { advancePlayer } from '../systems/player';
import { advanceProjectiles } from '../systems/projectiles';
import { advanceFormation } from '../systems/formation';
import { advanceLaunchedEnemies } from '../systems/enemyMovement';
import { advanceLaunches } from '../systems/launches';
import { admitReserves } from '../systems/reserves';

/** Capture sweep origins, then advance systems in the original deterministic order. */

export function advanceActiveStep(
  state: GameState,
  input: InputState,
  runtime: SimulationRuntime,
  actions: SimulationActions,
  dt: number,
) {
  state.previousPlayer = copy(state.player);
  for (const enemy of state.enemies) enemy.previous = copy(enemy);
  for (const projectile of state.projectiles)
    projectile.previous = copy(projectile);
  state.time += dt;
  state.protection = Math.max(0, state.protection - dt);
  for (const effect of state.effects) effect.remaining -= dt;
  state.effects = state.effects.filter((effect) => effect.remaining > 0);
  advancePlayer(state, input, runtime.weapon, actions, dt);
  advanceProjectiles(state, dt);
  advanceFormation(state, runtime.formation, dt);
  advanceLaunchedEnemies(state, actions, dt);
  advanceLaunches(state, runtime.launch, dt);
  admitReserves(state);
}
