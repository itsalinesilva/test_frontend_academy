import { Exercise, ExerciseType, PracticeModality } from '../domain/practice';
import { REPERTORIO_DO_PLAYER } from './seed-player-repertoire';

/**
 * 🔴 OS EXERCÍCIOS MEDIDOS, DERIVADOS — e não escritos à mão (LAB-3).
 *
 * O Laboratório tinha 11 exercícios de tocar e cantar, escritos um a um. Escrever
 * mais do mesmo jeito seria repetir o defeito que a LX-1 tirou: conteúdo à
 * parte, que diverge do resto sem ninguém ver.
 *
 * Aqui eles saem do que a plataforma JÁ tem escrito e conferido:
 *
 *   - uma frase medida por peça do repertório — as mesmas transcrições que a
 *     ficha da obra toca e a partitura do Estúdio desenha;
 *   - as escalas maiores das sete tônicas naturais, soletradas por grau;
 *   - o canto de cada nota natural da oitava central.
 *
 * Corrigir uma nota numa transcrição corrige o exercício junto.
 */

const CRIADO = '2026-09-22T00:00:00Z';
const LETRAS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const VALOR = [0, 2, 4, 5, 7, 9, 11];
const NOME: Record<string, string> = { C: 'dó', D: 'ré', E: 'mi', F: 'fá', G: 'sol', A: 'lá', B: 'si' };

/** A escala maior soletrada por grau: cada grau toma a próxima letra. */
function escalaMaior(tonica: string, oitava: number): string[] {
  const i0 = LETRAS.indexOf(tonica);
  const passos = [0, 2, 4, 5, 7, 9, 11, 12];
  return passos.map((semitons, grau) => {
    const i = (i0 + grau) % 7;
    const salto = Math.floor((i0 + grau) / 7);
    let acidente = ((semitons % 12) - ((VALOR[i] - VALOR[i0] + 12) % 12) + 12) % 12;
    if (acidente > 6) acidente -= 12;
    const sinal = acidente === 1 ? '#' : acidente === -1 ? 'b' : '';
    return `${LETRAS[i]}${sinal}${oitava + salto}`;
  });
}

const claveDe = (nota: string) => (Number(nota.slice(-1)) >= 4 ? 'treble' : 'bass');

function frasesDoRepertorio(): Exercise[] {
  return REPERTORIO_DO_PLAYER.filter((f) => f.autor !== 'Referência de afinação').flatMap((f): Exercise[] => {
    const notas = f.escrita.filter(([n]) => n !== '_').map(([n]) => n).slice(0, 8);
    if (notas.length < 5) return [];
    return [
      {
        id: `ex_rep_${f.id}`,
        skillId: 'sk_finger_dexterity',
        title: `${f.titulo} — ${f.autor}`,
        instruction: `Toque o início da peça, no andamento indicado: ${notas.join(' – ')}.`,
        type: ExerciseType.REPERTOIRE_PHRASE,
        modality: PracticeModality.REPERTOIRE,
        difficulty: f.periodo === 'Tradicional' || f.periodo === 'Teoria' ? 'iniciante' : 'intermediario',
        expectedNotes: notas,
        targetBpm: f.bpm,
        notationSnippet: {
          clef: claveDe(notas[0]),
          keySignature: f.tonalidade,
          timeSignature: f.compasso,
          notesDisplay: notas.join(' '),
        },
        toleranceCents: 20,
        tempoBpm: f.bpm,
        maxScore: 1000,
        xpAwarded: 50,
        createdAt: CRIADO,
        updatedAt: CRIADO,
      },
    ];
  });
}

function escalas(): Exercise[] {
  return LETRAS.map((t) => {
    const notas = escalaMaior(t, 4);
    return {
      id: `ex_escala_${t}_maior`,
      skillId: 'sk_finger_dexterity',
      title: `Escala de ${NOME[t]} maior, subindo`,
      instruction: `Toque a escala de ${NOME[t]} maior em uma oitava, nota a nota: ${notas.join(' – ')}.`,
      type: ExerciseType.SCALE,
      modality: PracticeModality.TECHNIQUE,
      difficulty: notas.some((n) => /[#b]/.test(n)) ? 'intermediario' : 'iniciante',
      expectedNotes: notas,
      targetBpm: 60,
      notationSnippet: {
        clef: 'treble',
        keySignature: `${NOME[t]} maior`,
        timeSignature: '4/4',
        notesDisplay: notas.join(' '),
      },
      toleranceCents: 20,
      tempoBpm: 60,
      maxScore: 1000,
      xpAwarded: 40,
      createdAt: CRIADO,
      updatedAt: CRIADO,
    };
  });
}

function cantoDasNotas(): Exercise[] {
  return LETRAS.map((l) => ({
    id: `ex_canto_${l}4`,
    skillId: 'sk_intervals_basic',
    title: `Cantar o ${NOME[l]} da oitava central`,
    instruction: `Ouça o ${NOME[l]} e cante-o sustentado, na mesma altura, até o afinador estabilizar.`,
    type: ExerciseType.PITCH_MATCH,
    modality: PracticeModality.VOICE,
    difficulty: 'iniciante',
    targetPitch: `${l}4`,
    expectedNotes: [`${l}4`],
    notationSnippet: { clef: 'treble', keySignature: 'dó maior', timeSignature: '4/4', notesDisplay: `${l}4` },
    toleranceCents: 25,
    maxScore: 1000,
    xpAwarded: 20,
    createdAt: CRIADO,
    updatedAt: CRIADO,
  }));
}

export const EXERCICIOS_DERIVADOS: Exercise[] = [...frasesDoRepertorio(), ...escalas(), ...cantoDasNotas()];
