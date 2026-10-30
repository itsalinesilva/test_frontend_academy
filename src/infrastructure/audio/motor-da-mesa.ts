/**
 * O motor da mesa de áudio: gravar do microfone, decodificar, tocar junto.
 *
 * Fica separado das regras (`domain/mesa-de-audio.ts`) porque depende do
 * navegador — microfone, `MediaRecorder`, `AudioContext` — e as regras não:
 * quem soa, a forma de onda e o WAV se testam sem som nenhum.
 */
import { DICA_DE_LATENCIA, lerPreferencias } from '../../repositories/preferencias.repository';

export interface Gravacao {
  /** Encerra a gravação e devolve o áudio. */
  parar(): Promise<Blob>;
}

export interface Reproducao {
  parar(): void;
}

export interface MotorDaMesa {
  disponivel(): boolean;
  gravar(): Promise<Gravacao>;
  decodificar(audio: Blob): Promise<{ amostras: Float32Array; taxa: number }>;
  tocar(pistas: Array<{ amostras: Float32Array; taxa: number; ganho: number }>, aoTerminar: () => void): Reproducao;
}

let contexto: AudioContext | null = null;
function ctx(): AudioContext {
  /** A prioridade das Configurações vira a dica de latência do contexto (AUD-6). */
  if (!contexto) contexto = new AudioContext({ latencyHint: DICA_DE_LATENCIA[lerPreferencias().prioridade] });
  return contexto;
}

export const motorDoNavegador: MotorDaMesa = {
  disponivel() {
    return (
      typeof window !== 'undefined' &&
      typeof window.MediaRecorder !== 'undefined' &&
      typeof window.AudioContext !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia
    );
  },

  async gravar() {
    /** O microfone escolhido nas Configurações; se ele sumiu (desplugado), o do sistema. */
    const { microfoneId } = lerPreferencias();
    const stream = await navigator.mediaDevices
      .getUserMedia({ audio: microfoneId ? { deviceId: { exact: microfoneId } } : true })
      .catch((e: Error) =>
        microfoneId && e.name === 'OverconstrainedError'
          ? navigator.mediaDevices.getUserMedia({ audio: true })
          : Promise.reject(e)
      );
    const gravador = new MediaRecorder(stream);
    const pedacos: Blob[] = [];
    gravador.ondataavailable = (e) => e.data.size && pedacos.push(e.data);
    gravador.start();
    return {
      parar: () =>
        new Promise<Blob>((ok) => {
          gravador.onstop = () => {
            stream.getTracks().forEach((t) => t.stop());
            ok(new Blob(pedacos, { type: gravador.mimeType || 'audio/webm' }));
          };
          gravador.stop();
        }),
    };
  },

  async decodificar(audio) {
    const buffer = await ctx().decodeAudioData(await audio.arrayBuffer());
    /** Mono: a média dos canais. A mesa mistura em mono, e o WAV sai mono. */
    const amostras = new Float32Array(buffer.length);
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const canal = buffer.getChannelData(c);
      for (let i = 0; i < canal.length; i++) amostras[i] += canal[i] / buffer.numberOfChannels;
    }
    return { amostras, taxa: buffer.sampleRate };
  },

  tocar(pistas, aoTerminar) {
    const c = ctx();
    void c.resume();
    const inicio = c.currentTime + 0.05;
    let restantes = pistas.length;
    const fontes = pistas.map((p) => {
      const buffer = c.createBuffer(1, p.amostras.length, p.taxa);
      buffer.copyToChannel(new Float32Array(p.amostras), 0);
      const fonte = c.createBufferSource();
      fonte.buffer = buffer;
      const ganho = c.createGain();
      ganho.gain.value = p.ganho;
      fonte.connect(ganho).connect(c.destination);
      fonte.onended = () => {
        restantes--;
        if (restantes === 0) aoTerminar();
      };
      /** Todas começam no MESMO instante: é isso que faz das pistas uma música. */
      fonte.start(inicio);
      return fonte;
    });
    if (pistas.length === 0) aoTerminar();
    return {
      parar: () =>
        fontes.forEach((f) => {
          try {
            f.stop();
          } catch {
            /* já parou */
          }
        }),
    };
  },
};
