import { ARENA, EXTENTS, TUNING } from '../config';
import type { GameState, InputState } from '../types';
import type { WeaponRuntime } from '../simulation/runtime';
import type { SimulationActions } from '../simulation/contracts';
import { EPS, clamp } from '../utils/math';
import { spawnLaser } from './projectiles';

export function advancePlayer(
  state: GameState,
  input: InputState,
  runtime: WeaponRuntime,
  actions: SimulationActions,
  dt: number,
) {
  state.player.x = clamp(
    state.player.x +
      (Number(input.right) - Number(input.left)) * TUNING.playerSpeed * dt,
    ARENA.left + EXTENTS.player.x,
    ARENA.right - EXTENTS.player.x,
  );
  const gap = state.time - runtime.lastShot;
  if (
    (input.firePressed && gap + EPS >= TUNING.tapInterval) ||
    (!input.firePressed && input.fireHeld && gap + EPS >= TUNING.holdInterval)
  ) {
    spawnLaser(
      state,
      actions,
      'player',
      state.player.x,
      state.player.y + EXTENTS.player.y + EXTENTS.laser.y + 0.05,
    );
    runtime.lastShot = state.time;
  }
  input.firePressed = false;
}
