import { ExerciseType, MusicExercise } from './music-exercise';
import { NATURAL_NAME_PT, absolutePitchOf, frequencyOf } from './pitch';
import { EscritaDaFaixa, temposDoCompasso } from './partitura-da-faixa';

/**
 * 🔴 PRATICAR A PEÇA, E NÃO UM EXERCÍCIO QUALQUER (AC-1i).
 *
 * "Levar à prática", na ficha da obra, abria o Laboratório e ignorava a obra:
 * a pessoa escolhia estudar o Prelúdio de Bach e caía no mesmo feed de quem
 * não escolheu nada. Aqui a prática é FEITA da peça — a mesma transcrição que a
 * ficha toca e que a partitura do Estúdio desenha:
 *
 *   - ler notas da melodia, na pauta;
 *   - nomear os intervalos entre notas vizinhas;
 *   - reconhecer o compasso, no primeiro compasso escrito;
 *   - de ouvido: que trecho da peça soou.
 *
 * Determinística e sem sorteio: a mesma obra dá sempre a mesma prática, e
 * quem volta a ela reencontra as mesmas perguntas — que é como se estuda uma
 * peça.
 */

export interface PecaParaPraticar extends EscritaDaFaixa {
  id: string;
  titulo: string;
  bpm: number;
}

const LETRAS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ACIDENTE_PT: Record<string, string> = { '#': ' sustenido', b: ' bemol', '': '' };

function nomeDe(n: string): string {
  const m = /^([A-G])([#b]?)/.exec(n)!;
  return NATURAL_NAME_PT[m[1]] + ACIDENTE_PT[m[2]];
}
const grau = (n: string) => Number(/-?\d+$/.exec(n)![0]) * 7 + LETRAS.indexOf(n[0]);

const NUMEROS = ['uníssono', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sétima', 'oitava'];
const BASE: Record<number, { semitons: number; justo: boolean }> = {
  0: { semitons: 0, justo: true },
  1: { semitons: 2, justo: false },
  2: { semitons: 4, justo: false },
  3: { semitons: 5, justo: true },
  4: { semitons: 7, justo: true },
  5: { semitons: 9, justo: false },
  6: { semitons: 11, justo: false },
  7: { semitons: 12, justo: true },
};

/**
 * O nome do intervalo entre duas notas escritas — pela LETRA e pelos
 * semitons, que é como se nomeia: dó–mi♭ é terça menor, e dó–ré♯ é segunda
 * aumentada, embora soem igual.
 */
export function nomeDoIntervalo(a: string, b: string): string | null {
  const passos = Math.abs(grau(b) - grau(a));
  if (passos > 7) return null;
  const semitons = Math.abs(absolutePitchOf(b)! - absolutePitchOf(a)!);
  const { semitons: base, justo } = BASE[passos];
  const d = semitons - base;
  const qualidade = justo
    ? { [-1]: 'diminuta', 0: 'justa', 1: 'aumentada' }[d]
    : { [-2]: 'diminuta', [-1]: 'menor', 0: 'maior', 1: 'aumentada' }[d];
  if (!qualidade) return null;
  /** "uníssono justo", "oitava justa" — o gênero da palavra manda. */
  if (passos === 0) return qualidade === 'justa' ? 'uníssono justo' : `uníssono ${qualidade.replace(/a$/, 'o')}`;
  return `${NUMEROS[passos]} ${qualidade}`;
}

/** "binário simples", "ternário composto"… — ou `null` para o que não é regular. */
export function nomeDoCompasso(formula: string): string | null {
  const [n, d] = formula.split('/').map(Number);
  const nomes: Record<number, string> = { 2: 'binário', 3: 'ternário', 4: 'quaternário' };
  if ((d === 4 || d === 2) && nomes[n]) return `${nomes[n]} simples`;
  if (d === 8 && n % 3 === 0 && nomes[n / 3]) return `${nomes[n / 3]} composto`;
  return null;
}

const DURACAO: Record<number, 'whole' | 'half' | 'quarter' | 'eighth'> = { 4: 'whole', 2: 'half', 1: 'quarter', 0.5: 'eighth' };

/** Rotação determinística: a certa não fica sempre na primeira posição. */
function embaralhar<T>(lista: T[], k: number): T[] {
  const r = k % lista.length;
  return [...lista.slice(r), ...lista.slice(0, r)];
}

function exercicio(
  peca: PecaParaPraticar,
  n: number,
  corpo: Omit<MusicExercise, 'id' | 'tag' | 'band' | 'choices' | 'correctIds'> & { labels: string[]; certa: string }
): MusicExercise {
  const { labels, certa, ...resto } = corpo;
  const choices = embaralhar([...new Set(labels)], n).map((label, i) => ({ id: `c${i}`, label }));
  return {
    ...resto,
    id: `obra_${peca.id}_${n}`,
    tag: 'PRACTICE',
    band: 'APPLICATION',
    choices,
    correctIds: [choices.find((c) => c.label === certa)!.id],
  };
}

export function praticaDaObra(peca: PecaParaPraticar): MusicExercise[] {
  const notas = peca.escrita.filter(([n]) => n !== '_').map(([n]) => n);
  if (notas.length < 4) return [];

  const saida: MusicExercise[] = [];
  let n = 0;
  const clave = (nota: string) => (Number(/-?\d+$/.exec(nota)![0]) >= 4 ? 'treble' : 'bass') as 'treble' | 'bass';

  // --- ler notas da peça -----------------------------------------------------
  for (const i of [Math.floor(notas.length / 4), Math.floor((3 * notas.length) / 4)]) {
    const nota = notas[i];
    const outras = [...new Set(notas.map(nomeDe))].filter((x) => x !== nomeDe(nota));
    const vizinha = nomeDe(`${LETRAS[(LETRAS.indexOf(nota[0]) + 1) % 7]}4`);
    saida.push(
      exercicio(peca, n++, {
        type: ExerciseType.READ_NOTATION,
        prompt: `Que nota da peça está escrita na pauta?`,
        labels: [nomeDe(nota), ...outras.slice(0, 2), vizinha],
        certa: nomeDe(nota),
        explanation: `É ${nomeDe(nota)}, uma das notas de ${peca.titulo}. Ler a nota antes de tocá-la é o que separa estudar a peça de decorá-la.`,
        figura: { kind: 'STAFF', clef: clave(nota), notes: [nota] },
      })
    );
  }

  // --- intervalos entre notas vizinhas -----------------------------------------
  const pares = notas
    .slice(0, -1)
    .map((a, i) => [a, notas[i + 1]] as const)
    .filter(([a, b]) => grau(a) !== grau(b) && nomeDoIntervalo(a, b) && clave(a) === clave(b));
  for (const [a, b] of [pares[0], pares[Math.floor(pares.length / 2)]].filter(Boolean)) {
    const certo = nomeDoIntervalo(a, b)!;
    const [num, qual] = certo.split(' ');
    const idx = NUMEROS.indexOf(num);
    const trocaQualidade: Record<string, string> = { maior: 'menor', menor: 'maior', justa: 'aumentada', aumentada: 'justa', diminuta: 'justa' };
    const distratores = [
      `${num} ${trocaQualidade[qual] ?? 'maior'}`,
      NUMEROS[idx + 1] ? `${NUMEROS[idx + 1]} ${[3, 4, 7].includes(idx + 1) ? 'justa' : 'maior'}` : 'oitava justa',
      NUMEROS[idx - 1] && idx - 1 > 0 ? `${NUMEROS[idx - 1]} ${[3, 4, 7].includes(idx - 1) ? 'justa' : 'menor'}` : 'terça menor',
    ];
    saida.push(
      exercicio(peca, n++, {
        type: ExerciseType.READ_NOTATION,
        prompt: 'Que intervalo há entre as duas notas da peça escritas na pauta?',
        labels: [certo, ...distratores],
        certa: certo,
        explanation: `De ${nomeDe(a)} a ${nomeDe(b)} é ${certo}: conta-se pelas letras, incluindo as duas pontas, e a qualidade sai dos semitons. É o passo que a melodia dá ali.`,
        figura: { kind: 'STAFF', clef: clave(a), notes: [a, b] },
      })
    );
  }

  // --- o compasso ------------------------------------------------------------
  const nomeCompasso = nomeDoCompasso(peca.compasso);
  const porCompasso = temposDoCompasso(peca.compasso);
  const primeiro: Array<[string, number]> = [];
  let soma = 0;
  for (const par of peca.escrita) {
    if (soma >= porCompasso - 1e-9) break;
    primeiro.push(par);
    soma += par[1];
  }
  const desenhavel = primeiro.every(([, t]) => DURACAO[t]) && Math.abs(soma - porCompasso) < 1e-9;
  if (nomeCompasso && desenhavel) {
    const todos = ['binário simples', 'ternário simples', 'quaternário simples', 'binário composto', 'ternário composto'];
    saida.push(
      exercicio(peca, n++, {
        type: ExerciseType.READ_NOTATION,
        prompt: 'Em que compasso a peça está escrita?',
        labels: [nomeCompasso, ...todos.filter((t) => t !== nomeCompasso).slice(0, 3)],
        certa: nomeCompasso,
        explanation: `${peca.titulo} está em ${nomeCompasso}: é o que a fórmula do início diz, e o primeiro compasso enche exatamente esse número de tempos.`,
        figura: {
          kind: 'STAFF',
          clef: clave(primeiro.find(([x]) => x !== '_')?.[0] ?? 'C4'),
          notes: primeiro.map(([x]) => x),
          duracoes: primeiro.map(([, t]) => DURACAO[t]),
          timeSignature: peca.compasso,
        },
      })
    );
  }

  // --- de ouvido: que trecho soou -----------------------------------------------
  if (notas.length >= 8) {
    const trecho = (i: number) => notas.slice(i, i + 4);
    const rotulo = (t: string[]) => t.map(nomeDe).join(' – ');
    const certo = trecho(0);
    /**
     * Distratores DA PRÓPRIA PEÇA, e distintos do certo pelo NOME das notas.
     * Peça que repete um desenho (o Prelúdio de Bach é um arpejo em loop) dá
     * trechos com os mesmos nomes; por isso se procura ao longo dela, em vez
     * de pegar posições fixas — com posições fixas a pergunta sumia.
     */
    const labels = [rotulo(certo), rotulo([...certo].reverse())];
    for (let i = 1; i + 4 <= notas.length && labels.length < 4; i++) {
      const r = rotulo(trecho(i));
      if (!labels.includes(r)) labels.push(r);
    }
    if (new Set(labels).size === 4) {
      saida.push(
        exercicio(peca, n++, {
          type: ExerciseType.IDENTIFY_BY_EAR,
          prompt: 'Ouça e diga que trecho da peça soou.',
          labels,
          certa: rotulo(certo),
          explanation: `Soou o começo de ${peca.titulo}: ${rotulo(certo)}. Reconhecer a peça pelo som, e não só pela pauta, é o que prepara para tocá-la de memória.`,
          audio: { frequenciesHz: certo.map((x) => frequencyOf(x)!), mode: 'SEQUENCE', bpm: peca.bpm },
          tonicHz: frequencyOf(notas[0]) ?? undefined,
        })
      );
    }
  }

  return saida;
}
