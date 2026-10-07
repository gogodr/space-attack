import type { Phase } from '../game/types';
import type { TonePlayer } from './SynthVoice';

const MELODY = [
  440, 0, 659.25, 0, 587.33, 0, 523.25, 0, 440, 523.25, 659.25, 0, 783.99, 0,
  659.25, 0, 349.23, 0, 523.25, 0, 440, 0, 392, 0, 349.23, 440, 523.25, 0,
  587.33, 0, 523.25, 0,
];

export function playMusicStep(step: number, phase: Phase, tone: TonePlayer) {
  const quiet = phase === 'hit-pause' ? 0.22 : 1;
  const note = MELODY[step % MELODY.length];
  if (note) tone(note, 0.12, 'triangle', 0.033 * quiet);
  if (step % 4 === 0)
    tone(step % 32 < 16 ? 110 : 87.3, 0.25, 'triangle', 0.05 * quiet);
}
