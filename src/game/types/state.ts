import type { Vec, Enemy, Projectile, Effect } from './entities';
import type { LevelConfig } from './level';

export type Phase =
  | 'start'
  | 'playing'
  | 'paused'
  | 'hit-pause'
  | 'level-complete'
  | 'game-over'
  | 'victory';

export interface GameState {
  phase: Phase;
  resumePhase: Phase;
  level: number;
  lives: number;
  levelScore: number;
  totalScore: number;
  player: Vec;
  previousPlayer: Vec;
  enemies: Enemy[];
  projectiles: Projectile[];
  effects: Effect[];
  protection: number;
  hitCountdown: number;
  levelCountdown: number;
  initialHP: number;
  time: number;
  config: LevelConfig;
}

export interface InputState {
  left: boolean;
  right: boolean;
  fireHeld: boolean;
  firePressed: boolean;
}
