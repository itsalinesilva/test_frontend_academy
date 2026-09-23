import React from 'react';
import { ExerciseFigure } from '../../../domain/music-exercise';
import { Staff } from '../domain/Staff';
import { InstrumentKeyboard } from '../domain/InstrumentKeyboard';
import { webAudioSynth } from '../../../infrastructure/audio/synth';

/**
 * 🔴 A FIGURA SOBRE A QUAL A PERGUNTA É FEITA.
 *
 * POR QUE ELA EXISTE
 * ------------------
 * O gerador perguntava "Que nota está uma si — qual destas é?", com a resposta
 * dentro do enunciado, porque não havia onde desenhar a nota. Enunciado que
 * carrega o gabarito não mede música: mede leitura de enunciado.
 *
 * Agora o enunciado diz "Que nota está escrita na pauta?" e a informação mora
 * aqui. Sem este componente a pergunta apontaria para o vazio — que é pior
 * que o defeito original, porque não teria resposta possível.
 *
 * 🔴 A FIGURA NÃO TOCA SOZINHA
 * ----------------------------
 * Num exercício de leitura, ouvir é atalho: quem toca a pauta responde de
 * ouvido e não lê nada. O som fica no exercício de ouvido, onde é a matéria.
 *
 * O teclado é exceção declarada: ali a tecla soa ao ser tocada pela pessoa,
 * porque o instrumento só é instrumento se responder — e quem clica escolheu
 * ouvir.
 */
export const FiguraDoExercicio: React.FC<{ figura: ExerciseFigure }> = ({ figura }) => {
  if (figura.kind === 'STAFF') {
    return (
      <figure className="mt-6 space-y-2">
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white p-4">
          <Staff
            id="figura-do-exercicio"
            clef={figura.clef}
            timeSignature={figura.timeSignature}
            notes={figura.notes
              .map(paraNota)
              .filter((n): n is NonNullable<typeof n> => n !== null)}
            /**
             * Um compasso só: a pauta aqui é uma pergunta, e não uma peça.
             * Compassos vazios à direita fariam procurar o que não há.
             */
            measureCount={1}
            acorde={figura.simultaneas}
          />
        </div>
        {figura.caption && (
          <figcaption className="text-xs text-stone-600">{figura.caption}</figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="mt-6 space-y-2">
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white p-4">
        <InstrumentKeyboard
          id="figura-do-exercicio"
          startOctave={figura.startOctave ?? 4}
          octavesCount={figura.octaves ?? 2}
          activePitches={figura.highlightNotes
            .map(paraMidi)
            .filter((m): m is number => m !== null)}
          onNoteDown={(pitch) => webAudioSynth.playTone(440 * Math.pow(2, (pitch - 69) / 12), 0.6)}
        />
      </div>
      {figura.caption && (
        <figcaption className="text-xs text-stone-600">{figura.caption}</figcaption>
      )}
    </figure>
  );
};

/**
 * "C#4" → a nota que a pauta desenha.
 *
 * Devolve `null` para o que não casa. O gerador só produz notação científica
 * com um acidente — `nexo-das-perguntas.test.ts` tem caso que exige isso —,
 * mas a guarda fica: figura com nota faltando é pergunta sobre pauta
 * incompleta, e é melhor que ela suma inteira a que saia errada pela metade.
 */
function paraNota(nota: string, i: number) {
  const m = nota.trim().match(/^([A-Ga-g])([#b]?)(-?\d)$/);
  if (!m) return null;

  return {
    id: `fig-${i}-${nota}`,
    step: m[1].toUpperCase() as 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B',
    octave: Number(m[3]),
    /**
     * Semínima para tudo.
     *
     * A figura aqui pergunta sobre ALTURA — que nota, que intervalo, que
     * acorde. Variar a duração acrescentaria uma informação que a pergunta não
     * usa, e que o aluno tentaria interpretar.
     */
    duration: 'quarter' as const,
    accidental:
      m[2] === '#' ? ('sharp' as const) : m[2] === 'b' ? ('flat' as const) : undefined,
  };
}

/** "C#4" → número MIDI, para o teclado destacar a tecla. */
function paraMidi(nota: string): number | null {
  const m = nota.trim().match(/^([A-Ga-g])([#b]?)(-?\d)$/);
  if (!m) return null;

  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const semitom = base[m[1].toUpperCase()];
  if (semitom === undefined) return null;

  const acidente = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  return 12 * (Number(m[3]) + 1) + semitom + acidente;
}
