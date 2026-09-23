/**
 * A MESA DE ÁUDIO DO ESTÚDIO (E-9).
 *
 * A tela era vitrine: quatro pistas "SATB" escritas no código, "Gravar" e
 * "Tocar" que só trocavam de cor, um relógio parado em 00:01:24, desfazer e
 * refazer sem ação, e uma forma de onda desenhada por fórmula. Nada soava,
 * nada gravava, nada ficava.
 *
 * Aqui mora o que é regra e se testa sem som: quem soa (mudo e solo), a
 * forma de onda tirada das AMOSTRAS gravadas, e a mixagem escrita em WAV.
 * O que toca e grava de verdade está no motor (`infrastructure/audio`).
 */

export interface PistaDaMesa {
  id: string;
  nome: string;
  /** 0 a 100. */
  volume: number;
  mudo: boolean;
  solo: boolean;
  /** A gravação guardada à parte (áudio não cabe no armazenamento de texto). */
  gravacaoId?: string;
  duracaoSegundos?: number;
  /** A forma de onda, tirada das amostras — nunca desenhada por fórmula. */
  picos?: number[];
}

export interface ProjetoDaMesa {
  id: string;
  autorId: string;
  titulo: string;
  pistas: PistaDaMesa[];
  criadoEm: string;
  atualizadoEm: string;
}

export const LIMITE_DE_PISTAS = 8;

export function novaPista(n: number): PistaDaMesa {
  return { id: `pista_${Date.now().toString(36)}_${n}`, nome: `Pista ${n}`, volume: 80, mudo: false, solo: false };
}

/**
 * Quem soa. Com alguma pista em solo, só as em solo (e não mudas); sem solo,
 * todas as não mudas. Pista sem gravação não soa — não há o que tocar.
 */
export function pistasAudiveis(pistas: readonly PistaDaMesa[]): PistaDaMesa[] {
  const algumSolo = pistas.some((p) => p.solo);
  return pistas.filter((p) => p.gravacaoId && !p.mudo && (!algumSolo || p.solo));
}

/** Volume da tela (0–100) em ganho linear, com curva que o ouvido percebe como uniforme. */
export function ganhoDoVolume(volume: number): number {
  const v = Math.max(0, Math.min(100, volume)) / 100;
  return v * v;
}

/**
 * A forma de onda: o pico de cada trecho das amostras, normalizado.
 * É o desenho do que foi GRAVADO — um trecho de silêncio sai reto.
 */
export function picosDasAmostras(amostras: Float32Array, trechos = 120): number[] {
  if (amostras.length === 0) return [];
  const tamanho = Math.max(1, Math.floor(amostras.length / trechos));
  const picos: number[] = [];
  for (let i = 0; i < trechos && i * tamanho < amostras.length; i++) {
    let max = 0;
    for (let j = i * tamanho; j < Math.min((i + 1) * tamanho, amostras.length); j++) {
      const a = Math.abs(amostras[j]);
      if (a > max) max = a;
    }
    picos.push(max);
  }
  const maior = Math.max(...picos);
  return maior > 0 ? picos.map((p) => Math.round((p / maior) * 1000) / 1000) : picos;
}

/** Soma as pistas com seus ganhos, em mono, cortando o que passar de ±1. */
export function mixar(pistas: Array<{ amostras: Float32Array; ganho: number }>): Float32Array {
  const tamanho = Math.max(0, ...pistas.map((p) => p.amostras.length));
  const saida = new Float32Array(tamanho);
  for (const { amostras, ganho } of pistas) {
    for (let i = 0; i < amostras.length; i++) saida[i] += amostras[i] * ganho;
  }
  for (let i = 0; i < saida.length; i++) saida[i] = Math.max(-1, Math.min(1, saida[i]));
  return saida;
}

/** WAV PCM 16 bits, mono — o formato que qualquer programa abre. */
export function codificarWav(amostras: Float32Array, taxa: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(44 + amostras.length * 2));
  const v = new DataView(bytes.buffer);
  const texto = (off: number, s: string) => [...s].forEach((c, i) => v.setUint8(off + i, c.charCodeAt(0)));
  texto(0, 'RIFF');
  v.setUint32(4, 36 + amostras.length * 2, true);
  texto(8, 'WAVE');
  texto(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, taxa, true);
  v.setUint32(28, taxa * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  texto(36, 'data');
  v.setUint32(40, amostras.length * 2, true);
  for (let i = 0; i < amostras.length; i++) {
    const s = Math.max(-1, Math.min(1, amostras[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return bytes;
}

/** "01:24.3" — minutos, segundos e décimos: o relógio da mesa. */
export function relogio(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos - m * 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`;
}
