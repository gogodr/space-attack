import type { SoundCue } from '../types';

/** Narrow side effects supplied by the authoritative engine. */

export interface SimulationActions {
  id(kind: string): string;
  sound(cue: SoundCue): void;
}
