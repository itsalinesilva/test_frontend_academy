import { absolutePitchOf, frequencyOf } from './pitch';

/**
 * O CADERNO DE PARTITURAS DO ESTÚDIO (M-10, E-4, E-5).
 *
 * O editor do Estúdio era fachada: mostrava um "Estudo Contrapontístico a
 * Quatro Vozes" que ninguém escreveu, com as notas desenhadas por enfeite, e
 * controles de armadura e fórmula que só trocavam um rótulo. O hub prometia
 * que a partitura "sai daqui em MusicXML e MIDI", e nada saía.
 *
 * Aqui a partitura é o que a pessoa escreve: nota a nota, com figura, numa
 * voz. Ela toca, é guardada, e sai nos dois formatos que outros programas
 * abrem — MusicXML (MuseScore, Finale, Sibelius) e MIDI.
 *
 * LIMITES DECLARADOS: uma voz só; sem ligadura, ponto de aumento nem
 * quiáltera; nota que atravessa a barra fica inteira no compasso em que
 * começa, e é declarada ao escrever.
 */

export type Figura = 'whole' | 'half' | 'quarter' | 'eighth';

export const TEMPOS_DA_FIGURA: Record<Figura, number> = { whole: 4, half: 2, quarter: 1, eighth: 0.5 };
export const NOME_DA_FIGURA: Record<Figura, string> = {
  whole: 'semibreve',
  half: 'mínima',
  quarter: 'semínima',
  eighth: 'colcheia',
};

export type Formula = '2/4' | '3/4' | '4/4' | '6/8';
export const FORMULAS: Formula[] = ['2/4', '3/4', '4/4', '6/8'];

export interface NotaDoCaderno {
  /** "C4", "F#5", "Bb3" — ou `null` para pausa. */
  nota: string | null;
  figura: Figura;
}

export interface PartituraDoCaderno {
  id: string;
  autorId: string;
  titulo: string;
  /**
   * A pasta do caderno (E-5). Vazia é "sem pasta" — pasta é organização, e não
   * condição para guardar: exigir uma antes do primeiro rascunho seria
   * burocracia no caminho de quem quer escrever.
   */
  pasta?: string;
  clave: 'treble' | 'bass';
  formula: Formula;
  andamento: number;
  notas: NotaDoCaderno[];
  criadaEm: string;
  atualizadaEm: string;
}

const NOTA_VALIDA = /^[A-G][#b]?[1-7]$/;

export function problemasDaPartitura(p: Pick<PartituraDoCaderno, 'titulo' | 'andamento' | 'notas'>): string[] {
  const problemas: string[] = [];
  if (!p.titulo.trim()) problemas.push('Dê um título à partitura: é por ele que ela é achada no caderno.');
  if (p.notas.length === 0) problemas.push('A partitura está vazia — escreva ao menos uma nota.');
  if (!(p.andamento >= 30 && p.andamento <= 240)) problemas.push('O andamento precisa ficar entre 30 e 240 batidas por minuto.');
  for (const n of p.notas) {
    if (n.nota !== null && !NOTA_VALIDA.test(n.nota)) problemas.push(`"${n.nota}" não é uma nota que a pauta escreva.`);
  }
  return problemas;
}

/** As pastas em uso, em ordem alfabética, sem repetição e sem a "sem pasta". */
export function pastasDoCaderno(partituras: readonly Pick<PartituraDoCaderno, 'pasta'>[]): string[] {
  const nomes = new Set(partituras.map((p) => (p.pasta ?? '').trim()).filter(Boolean));
  return [...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/** O caderno agrupado por pasta; "sem pasta" por último. */
export function agruparPorPasta<T extends Pick<PartituraDoCaderno, 'pasta'>>(
  partituras: readonly T[]
): Array<{ pasta: string | null; itens: T[] }> {
  const grupos = pastasDoCaderno(partituras).map((pasta) => ({
    pasta: pasta as string | null,
    itens: partituras.filter((p) => (p.pasta ?? '').trim() === pasta),
  }));
  const soltas = partituras.filter((p) => !(p.pasta ?? '').trim());
  return soltas.length ? [...grupos, { pasta: null, itens: soltas }] : grupos;
}

export function temposPorCompasso(formula: Formula): number {
  const [n, d] = formula.split('/').map(Number);
  return (n * 4) / d;
}

/** Os compassos, pela duração das figuras. */
export function compassosDoCaderno(notas: NotaDoCaderno[], formula: Formula): NotaDoCaderno[][] {
  const porCompasso = temposPorCompasso(formula);
  const saida: NotaDoCaderno[][] = [];
  let atual: NotaDoCaderno[] = [];
  let soma = 0;
  for (const n of notas) {
    atual.push(n);
    soma += TEMPOS_DA_FIGURA[n.figura];
    if (soma >= porCompasso - 1e-9) {
      saida.push(atual);
      atual = [];
      soma = 0;
    }
  }
  if (atual.length) saida.push(atual);
  return saida;
}

/** Compassos em que uma figura passa da barra — dito ao escrever, e não escondido. */
export function compassosQueTransbordam(notas: NotaDoCaderno[], formula: Formula): number[] {
  const porCompasso = temposPorCompasso(formula);
  return compassosDoCaderno(notas, formula)
    .map((c, i) => [i + 1, c.reduce((a, n) => a + TEMPOS_DA_FIGURA[n.figura], 0)] as const)
    .filter(([, t]) => t > porCompasso + 1e-9)
    .map(([i]) => i);
}

/** O que tocar: frequência (0 = pausa) e segundos, no andamento da partitura. */
export function roteiroDeSom(p: Pick<PartituraDoCaderno, 'notas' | 'andamento'>): Array<{ hz: number; segundos: number }> {
  const segundoPorTempo = 60 / p.andamento;
  return p.notas.map((n) => ({
    hz: n.nota ? frequencyOf(n.nota) ?? 0 : 0,
    segundos: TEMPOS_DA_FIGURA[n.figura] * segundoPorTempo,
  }));
}

// ---------------------------------------------------------------------------
// MusicXML
// ---------------------------------------------------------------------------

const escaparXml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * MusicXML 3.1, parte única. `divisions = 2`: a colcheia vale 1 — a menor
 * figura do caderno cabe inteira, sem fração.
 */
export function paraMusicXML(p: PartituraDoCaderno): string {
  const [batidas, unidade] = p.formula.split('/');
  const clave = p.clave === 'treble' ? '<sign>G</sign><line>2</line>' : '<sign>F</sign><line>4</line>';
  const compassos = compassosDoCaderno(p.notas, p.formula);

  const nota = (n: NotaDoCaderno) => {
    const duracao = TEMPOS_DA_FIGURA[n.figura] * 2;
    if (!n.nota) return `      <note><rest/><duration>${duracao}</duration><type>${n.figura}</type></note>`;
    const m = /^([A-G])([#b]?)(\d)$/.exec(n.nota)!;
    const alter = m[2] === '#' ? '<alter>1</alter>' : m[2] === 'b' ? '<alter>-1</alter>' : '';
    const acidente = m[2] === '#' ? '<accidental>sharp</accidental>' : m[2] === 'b' ? '<accidental>flat</accidental>' : '';
    return `      <note><pitch><step>${m[1]}</step>${alter}<octave>${m[3]}</octave></pitch><duration>${duracao}</duration><type>${n.figura}</type>${acidente}</note>`;
  };

  const corpo = compassos
    .map((c, i) => {
      const atributos =
        i === 0
          ? `      <attributes><divisions>2</divisions><key><fifths>0</fifths></key><time><beats>${batidas}</beats><beat-type>${unidade}</beat-type></time><clef>${clave}</clef></attributes>\n      <direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${p.andamento}</per-minute></metronome></direction-type><sound tempo="${p.andamento}"/></direction>\n`
          : '';
      return `    <measure number="${i + 1}">\n${atributos}${c.map(nota).join('\n')}\n    </measure>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>${escaparXml(p.titulo)}</work-title></work>
  <identification><encoding><software>Conservatório Muscicapa — caderno do Estúdio</software></encoding></identification>
  <part-list><score-part id="P1"><part-name>Voz</part-name></score-part></part-list>
  <part id="P1">
${corpo}
  </part>
</score-partwise>
`;
}

// ---------------------------------------------------------------------------
// MIDI
// ---------------------------------------------------------------------------

/** Número de tamanho variável — a forma como o MIDI escreve os intervalos de tempo. */
function vlq(n: number): number[] {
  const bytes = [n & 0x7f];
  let v = n >> 7;
  while (v > 0) {
    bytes.unshift((v & 0x7f) | 0x80);
    v >>= 7;
  }
  return bytes;
}

const TIQUES_POR_SEMINIMA = 480;

/** MIDI formato 0, um canal. Pausa é tempo que passa sem nota. */
export function paraMIDI(p: PartituraDoCaderno): Uint8Array<ArrayBuffer> {
  const microssegundos = Math.round(60_000_000 / p.andamento);
  const eventos: number[] = [
    0x00, 0xff, 0x51, 0x03, (microssegundos >> 16) & 0xff, (microssegundos >> 8) & 0xff, microssegundos & 0xff,
  ];
  const [n, d] = p.formula.split('/').map(Number);
  eventos.push(0x00, 0xff, 0x58, 0x04, n, Math.log2(d), 24, 8);

  let espera = 0;
  for (const nota of p.notas) {
    const tiques = TEMPOS_DA_FIGURA[nota.figura] * TIQUES_POR_SEMINIMA;
    if (!nota.nota) {
      espera += tiques;
      continue;
    }
    /** O índice de `absolutePitchOf` é o número MIDI: dó central (C4) = 60. */
    const midi = absolutePitchOf(nota.nota)!;
    eventos.push(...vlq(espera), 0x90, midi, 80);
    eventos.push(...vlq(tiques), 0x80, midi, 0);
    espera = 0;
  }
  eventos.push(...vlq(espera), 0xff, 0x2f, 0x00);

  const cabecalho = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, (TIQUES_POR_SEMINIMA >> 8) & 0xff, TIQUES_POR_SEMINIMA & 0xff];
  const tamanho = eventos.length;
  const trilha = [0x4d, 0x54, 0x72, 0x6b, (tamanho >> 24) & 0xff, (tamanho >> 16) & 0xff, (tamanho >> 8) & 0xff, tamanho & 0xff];
  return new Uint8Array([...cabecalho, ...trilha, ...eventos]);
}

/** Nome de arquivo sem acento nem espaço: "Minha peça nº 1" → "minha-peca-n-1". */
export function nomeDeArquivo(titulo: string): string {
  return (
    titulo
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'partitura'
  );
}
