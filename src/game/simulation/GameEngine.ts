import type { GameState, Impact, SoundCue } from '../types';
import type { SimulationActions } from './contracts';
import { createGameState, initializeLevel } from './state';
import { createRuntime } from './runtime';
import { advanceActiveStep } from './activeStep';
import { createInputState, clearInput } from '../systems/input';
import { resolveCombat } from '../systems/combat';
import {
  advanceTransition,
  resolveOutcome,
  togglePause,
} from '../systems/transitions';

/** Authoritative run lifecycle and step gate; systems own individual gameplay rules. */

export class GameEngine {
  state: GameState;
  input = createInputState();
  onSound?: (cue: SoundCue) => void;
  private listeners = new Set<() => void>();
  private revision = 0;
  private generation = 0;
  private sequence = 0;
  private stepReady = false;
  private runtime = createRuntime();
  private actions: SimulationActions = {
    id: (kind) => this.id(kind),
    sound: (cue) => this.onSound?.(cue),
  };
  constructor() {
    this.state = createGameState();
    this.setupLevel(1);
  }
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getSnapshot = () => this.revision;
  private emit() {
    this.revision++;
    for (const listener of this.listeners) listener();
  }
  private id(kind: string) {
    return `${this.generation}-${kind}-${++this.sequence}`;
  }
  private setupLevel(level: number) {
    initializeLevel(this.state, level, this.runtime, this.actions);
  }
  start() {
    this.generation++;
    this.sequence = 0;
    this.state = createGameState();
    this.state.phase = 'playing';
    clearInput(this.input);
    this.setupLevel(1);
    this.stepReady = false;
    this.emit();
  }
  toStart() {
    this.state = createGameState();
    this.setupLevel(1);
    clearInput(this.input);
    this.stepReady = false;
    this.emit();
  }
  togglePause() {
    if (!togglePause(this.state, this.input)) return;
    this.stepReady = false;
    this.emit();
  }
  prepareStep(dt: number) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    this.stepReady = false;
    if (
      advanceTransition(this.state, this.input, dt, (level) =>
        this.setupLevel(level),
      )
    ) {
      this.emit();
      return;
    }
    if (this.state.phase !== 'playing') return;
    this.stepReady = true;
    advanceActiveStep(this.state, this.input, this.runtime, this.actions, dt);
  }
  resolveStep(impacts: Impact[]) {
    if (this.state.phase !== 'playing' || !this.stepReady) return;
    this.stepReady = false;
    const hit = resolveCombat(this.state, impacts, this.actions);
    resolveOutcome(this.state, this.input, hit, this.actions);
    this.emit();
  }
}
