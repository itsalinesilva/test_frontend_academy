import { AudioEngineAdapter, PitchDetectionResult } from './audio-engine.interface';
import { EngineImplementationType, EngineExecutionStatus } from '../../../contracts/tool-contracts';

export class WebAudioEngineAdapter implements AudioEngineAdapter {
  public readonly engineName = 'WebAudioBuiltInEngine';
  public readonly implementationType = EngineImplementationType.BUILT_IN_BROWSER;

  public async getHealth(): Promise<{ status: EngineExecutionStatus; latencyMs: number }> {
    return {
      status: EngineExecutionStatus.READY,
      latencyMs: 1,
    };
  }

  public async detectPitch(buffer: Float32Array, sampleRate: number): Promise<PitchDetectionResult | null> {
    // Autocorrelation algorithm implementation for pitch detection
    const SIZE = buffer.length;
    let sum = 0;
    for (let i = 0; i < SIZE; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / SIZE);
    if (rms < 0.01) {
      // Signal too low
      return null;
    }

    let r1 = 0;
    let r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < thres) {
        r2 = SIZE - i;
        break;
      }
    }

    const trimmed = buffer.slice(r1, r2);
    const c = new Array<number>(trimmed.length).fill(0);
    for (let i = 0; i < trimmed.length; i++) {
      for (let j = 0; j < trimmed.length - i; j++) {
        c[i] = c[i] + trimmed[j] * trimmed[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1;
    let maxpos = -1;
    for (let i = d; i < trimmed.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }

    let T0 = maxpos;
    if (T0 === 0) return null;

    // Parabolic interpolation
    const x1 = c[T0 - 1] ?? 0;
    const x2 = c[T0] ?? 0;
    const x3 = c[T0 + 1] ?? 0;
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) {
      T0 = T0 - b / (2 * a);
    }

    const pitchHz = sampleRate / T0;
    if (pitchHz < 40 || pitchHz > 4000) return null;

    const { noteName, centsDeviation } = this.frequencyToNote(pitchHz);

    return {
      pitchHz: Math.round(pitchHz * 10) / 10,
      noteName,
      centsDeviation: Math.round(centsDeviation),
      clarity: Math.min(1, Math.max(0, maxval / c[0])),
    };
  }

  public async generateReferenceTone(frequencyHz: number, durationSeconds: number): Promise<AudioBuffer | null> {
    if (typeof window === 'undefined' || !(window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)) {
      return null;
    }
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const sampleRate = ctx.sampleRate;
    const frameCount = Math.floor(sampleRate * durationSeconds);
    const audioBuffer = ctx.createBuffer(1, frameCount, sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      channelData[i] = Math.sin((2 * Math.PI * frequencyHz * i) / sampleRate);
    }
    return audioBuffer;
  }

  private frequencyToNote(frequency: number): { noteName: string; centsDeviation: number } {
    const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const midiNum = 12 * (Math.log(frequency / 440) / Math.log(2)) + 69;
    const roundedMidi = Math.round(midiNum);
    const centsDeviation = Math.floor((midiNum - roundedMidi) * 100);
    const noteIndex = (roundedMidi % 12 + 12) % 12;
    const octave = Math.floor(roundedMidi / 12) - 1;
    return {
      noteName: `${noteStrings[noteIndex]}${octave}`,
      centsDeviation,
    };
  }
}
