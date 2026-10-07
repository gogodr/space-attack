import { TUNING } from '../config';
import type { GameState, InputState } from '../types';
import type { SimulationActions } from '../simulation/contracts';
import { clearInput } from './input';
import { EPS } from '../utils/math';

/** Returns whether a frozen countdown changed; this tick never advances gameplay. */

export function advanceTransition(
  state: GameState,
  input: InputState,
  dt: number,
  initializeNextLevel: (level: number) => void,
): boolean {
  if (state.phase === 'hit-pause') {
    state.hitCountdown = Math.max(0, state.hitCountdown - dt);
    if (state.hitCountdown <= EPS) {
      state.hitCountdown = 0;
      state.phase = 'playing';
      state.protection = TUNING.protection;
      clearInput(input);
    }
    return true;
  }
  if (state.phase === 'level-complete') {
    state.levelCountdown = Math.max(0, state.levelCountdown - dt);
    if (state.levelCountdown <= EPS) {
      initializeNextLevel(state.level + 1);
      state.phase = 'playing';
      clearInput(input);
    }
    return true;
  }
  return false;
}

/** Fatal damage precedes clear; a surviving clear precedes a hit pause. */

export function resolveOutcome(
  state: GameState,
  input: InputState,
  hit: boolean,
  actions: SimulationActions,
) {
  if (state.lives === 0) {
    state.phase = 'game-over';
    clearInput(input);
    actions.sound('game-over');
  } else if (state.enemies.length === 0) {
    state.projectiles = [];
    if (hit) state.protection = TUNING.protection;
    clearInput(input);
    if (state.level === TUNING.maxLevel) {
      state.phase = 'victory';
      actions.sound('victory');
    } else {
      state.phase = 'level-complete';
      state.levelCountdown = TUNING.levelTransition;
      actions.sound('level');
    }
  } else if (hit) {
    state.phase = 'hit-pause';
    state.hitCountdown = TUNING.hitPause;
    clearInput(input);
  }
}

export function togglePause(state: GameState, input: InputState): boolean {
  if (state.phase === 'paused') state.phase = state.resumePhase;
  else if (
    state.phase === 'playing' ||
    state.phase === 'hit-pause' ||
    state.phase === 'level-complete'
  ) {
    state.resumePhase = state.phase;
    state.phase = 'paused';
  } else return false;
  clearInput(input);
  return true;
}
