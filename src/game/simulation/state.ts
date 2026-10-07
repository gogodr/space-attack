import { ARENA, TUNING, getLevelConfig } from '../config';
import type { Enemy, GameState } from '../types';
import { copy } from '../utils/math';
import type { SimulationActions } from './contracts';
import type { SimulationRuntime } from './runtime';

export function createGameState(): GameState {
  return {
    phase: 'start',
    resumePhase: 'playing',
    level: 1,
    lives: TUNING.lives,
    levelScore: 0,
    totalScore: 0,
    player: { x: 0, y: ARENA.playerY },
    previousPlayer: { x: 0, y: ARENA.playerY },
    enemies: [],
    projectiles: [],
    effects: [],
    protection: 0,
    hitCountdown: 0,
    levelCountdown: 0,
    initialHP: 0,
    time: 0,
    config: getLevelConfig(1),
  };
}

/** Initializes entities and level clocks; preserves run score, lives and protection. */

export function initializeLevel(
  state: GameState,
  level: number,
  runtime: SimulationRuntime,
  actions: SimulationActions,
) {
  state.level = level;
  state.config = getLevelConfig(level);
  state.initialHP = state.config.count;
  state.levelScore = 0;
  state.projectiles = [];
  state.effects = [];
  state.player = { x: 0, y: ARENA.playerY };
  state.previousPlayer = copy(state.player);
  state.enemies = Array.from({ length: state.config.count }, (_, i): Enemy => {
    const column = i % TUNING.columns,
      row = Math.floor(i / TUNING.columns);
    const x = (column - (TUNING.columns - 1) / 2) * TUNING.spacingX;
    const y = TUNING.formationTop - row * TUNING.spacingY;
    return {
      id: actions.id('enemy'),
      x,
      y,
      previous: { x, y },
      row,
      column,
      variant: (['C', 'B', 'A'] as const)[row % 3],
      mode: i < TUNING.visibleCapacity ? 'formation' : 'reserve',
      direction: 1,
      fireTimer: TUNING.launchTelegraph,
      age: 0,
    };
  });
  runtime.formation.clock = 0;
  runtime.launch.clock = 0;
  runtime.formation.direction = 1;
  runtime.formation.boundaryPending = false;
  runtime.launch.left = true;
  runtime.weapon.lastShot = -Infinity;
  state.hitCountdown = 0;
  state.levelCountdown = 0;
}
