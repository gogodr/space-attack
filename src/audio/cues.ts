import type { SoundCue } from '../game/types';
import type { TonePlayer } from './SynthVoice';

export function playCue(cue: SoundCue, tone: TonePlayer) {
  switch (cue) {
    case 'shoot':
      tone(1250, 0.08, 'square', 0.035, 320);
      break;
    case 'enemy-shot':
      tone(320, 0.1, 'sawtooth', 0.025, 160);
      break;
    case 'kill':
      tone(160, 0.15, 'sawtooth', 0.07, 35);
      break;
    case 'cancel':
      tone(1000, 0.06, 'triangle', 0.09, 1600);
      tone(1600, 0.07, 'triangle', 0.06, 650, 0.04);
      break;
    case 'hit':
      tone(180, 0.4, 'sawtooth', 0.09, 28);
      break;
    case 'escape':
      tone(220, 0.17, 'square', 0.06, 80);
      break;
    case 'level':
      [440, 554.37, 659.25].forEach((n, i) =>
        tone(n, 0.2, 'triangle', 0.07, n, i * 0.1),
      );
      break;
    case 'game-over':
      [440, 349.23, 293.66, 220].forEach((n, i) =>
        tone(n, 0.3, 'triangle', 0.09, n, i * 0.2),
      );
      break;
    case 'victory':
      [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((n, i) =>
        tone(n, 0.28, 'square', 0.055, n, i * 0.15),
      );
      break;
  }
}

export function playCountdown(seconds: number, tone: TonePlayer) {
  tone(seconds === 1 ? 880 : 440, 0.07, 'square', 0.09);
}
