/**
 * Lightweight Web Audio Synthesizer for Pedagogical Ear Training & Sound Playback
 */
class WebAudioSynth {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playTone(frequencyHz: number, durationSeconds: number = 1.0, type: OscillatorType = 'triangle'): void {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequencyHz, ctx.currentTime);

      // Smooth attack and release envelope to prevent clicks
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSeconds);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSeconds);
    } catch (e) {
      console.warn('[WebAudioSynth] Playback error:', e);
    }
  }

  public playChord(frequenciesHz: number[], durationSeconds: number = 2.0): void {
    try {
      const ctx = this.getContext();
      frequenciesHz.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const individualVolume = 0.3 / Math.max(1, frequenciesHz.length);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(individualVolume, ctx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSeconds);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + durationSeconds);
      });
    } catch (e) {
      console.warn('[WebAudioSynth] Chord error:', e);
    }
  }

  public playSequence(frequenciesHz: number[], stepDurationSeconds: number = 0.5): void {
    frequenciesHz.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, stepDurationSeconds * 0.9, 'triangle');
      }, index * stepDurationSeconds * 1000);
    });
  }
}

export const webAudioSynth = new WebAudioSynth();
