import type { Phase, SoundCue } from '../game/types';
import { SynthVoice } from './SynthVoice';
import { playCue, playCountdown } from './cues';
import { playMusicStep } from './music';

/** Public audio facade: settings, phase gating, and the sequencer lifecycle. */
export class ArcadeAudio {
  private readonly synth = new SynthVoice();
  private readonly tone = this.synth.tone.bind(this.synth);
  private timer?: ReturnType<typeof setInterval>;
  private step = 0;
  private music = true;
  private effects = true;
  private phase: Phase = 'start';
  private countdown = -1;
  unlock() {
    this.synth.unlock();
    if (!this.timer) this.timer = setInterval(() => this.musicTick(), 180);
  }
  setMusic(value: boolean) {
    this.music = value;
  }
  setEffects(value: boolean) {
    this.effects = value;
  }
  setPhase(value: Phase) {
    this.phase = value;
    this.synth.mute(value === 'paused');
    if (value !== 'hit-pause') this.countdown = -1;
  }
  tickCountdown(seconds: number) {
    const rounded = Math.ceil(seconds);
    if (rounded !== this.countdown && rounded > 0) {
      this.countdown = rounded;
      if (this.effects && this.phase === 'hit-pause')
        playCountdown(rounded, this.tone);
    }
  }
  private musicTick() {
    if (
      !this.music ||
      this.phase === 'paused' ||
      this.phase === 'game-over' ||
      this.phase === 'victory' ||
      !this.synth.running
    )
      return;
    playMusicStep(this.step++, this.phase, this.tone);
  }
  cue(cue: SoundCue) {
    if (!this.effects || this.phase === 'paused') return;
    playCue(cue, this.tone);
  }
  dispose() {
    if (this.timer) clearInterval(this.timer);
    this.synth.dispose();
    this.timer = undefined;
  }
}
