/** Original procedural oscillator voices; no sampled or third-party assets. */
export class SynthVoice {
  private context?: AudioContext;
  private master?: GainNode;
  get running() {
    return this.context?.state === 'running';
  }
  unlock() {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.65;
      this.master.connect(this.context.destination);
    }
    void this.context.resume().catch(() => {});
  }
  mute(value: boolean) {
    if (this.master && this.context)
      this.master.gain.setTargetAtTime(
        value ? 0 : 0.65,
        this.context.currentTime,
        0.025,
      );
  }
  tone(
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    end = frequency,
    delay = 0,
  ) {
    if (!this.context || !this.master) return;
    const t = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, t);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, end),
      t + duration,
    );
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(t);
    oscillator.stop(t + duration + 0.015);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }
  dispose() {
    void this.context?.close().catch(() => {});
    this.context = undefined;
    this.master = undefined;
  }
}
export type TonePlayer = SynthVoice['tone'];
