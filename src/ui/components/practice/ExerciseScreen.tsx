import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  MusicExercise,
  LessonInProgress,
  TAG_TEXT,
  currentExercise,
  isInCombo,
  progress,
} from '../../../domain/music-exercise';
import { webAudioSynth } from '../../../infrastructure/audio/synth';
import { FiguraDoExercicio } from './FiguraDoExercicio';
import { X, Volume2, Turtle, Check, RotateCcw, Flag } from 'lucide-react';

interface ExerciseScreenProps {
  lesson: LessonInProgress;
  onAnswer: (isCorrect: boolean, selectedIds: string[]) => void;
  onSkip: () => void;
  onExit: () => void;
  /**
   * Calibragem do exercicio pela propria pessoa.
   *
   * Opcional DE PROPOSITO: sem destino para o dado, o rodape nao aparece. Um
   * botao que coleta opiniao e nao a registra em lugar nenhum e pior do que
   * nao perguntar — cria a impressao de que alguem esta ouvindo.
   */
  onRateDifficulty?: (exerciseId: string, verdict: 'EASY' | 'HARD') => void;
  /** Idem: sem destino, sem botao. */
  onReport?: (exerciseId: string) => void;
}

/**
 * A tela onde se responde.
 *
 * É a tela em que a pessoa passa mais tempo da plataforma inteira, e por isso
 * a anatomia é fixa: quem já respondeu dez exercícios não deve precisar
 * procurar onde fica o botão de conferir.
 *
 * ```
 *   ✕   ▓▓▓▓▓░░░░░░░░░░░░              ♥ 5      sair · progresso · vidas
 *       ⊕ CONTEÚDO NOVO                          etiqueta do tipo
 *       Enunciado em uma linha
 *       [ o exercício ]
 *   PULAR                    CONFERIR            rodapé fixo
 * ```
 *
 * TRÊS DECISÕES QUE NÃO SÃO ÓBVIAS
 * --------------------------------
 * **A barra muda de cor no combo.** Verde vira ouro a partir de cinco
 * acertos seguidos. É reforço sem texto, e não interrompe quem está
 * respondendo.
 *
 * **A alternativa soa ao ser tocada.** Num produto de música isso não é
 * enfeite: é a matéria. Quem escolhe "terça maior" ouve uma terça maior, e o
 * exercício ensina mesmo quando a resposta está errada.
 *
 * **Meia velocidade, e não só repetir.** Ouvir uma cadência a metade da
 * velocidade é o que torna audível a condução de vozes. Na referência a
 * tartaruga é conveniência; aqui é instrumento pedagógico.
 */
export const ExerciseScreen: React.FC<ExerciseScreenProps> = ({
  lesson,
  onAnswer,
  onSkip,
  onExit,
  onRateDifficulty,
  onReport,
}) => {
  const exercise = currentExercise(lesson);
  const [selectedIds, setEscolhidas] = useState<string[]>([]);
  const [checked, setConferido] = useState<null | { isCorrect: boolean }>(null);
  const [calibration, setCalibragem] = useState<Calibration>(null);
  const [confirmingExit, setConfirmandoSaida] = useState(false);

  useEffect(() => {
    setEscolhidas([]);
    setConferido(null);
    setCalibragem(null);
  }, [exercise?.id]);

  /**
   * Sair so pergunta quando ha o que perder.
   *
   * Confirmar a saida de uma licao intocada seria atrito puro: nao ha
   * progresso nenhum em risco, e a pergunta so ensinaria a pessoa a
   * descartar avisos sem ler.
   */
  const hasProgress = lesson.correct + lesson.wrong > 0;
  const requestExit = () => (hasProgress ? setConfirmandoSaida(true) : onExit());

  const play = useCallback(
    (frequencies: number[] | undefined, mode: 'SEQUENCE' | 'CHORD', slow = false) => {
      if (!frequencies?.length) return;
      const duration = slow ? 1.4 : 0.7;
      if (mode === 'CHORD') webAudioSynth.playChord(frequencies, duration * 1.6);
      else webAudioSynth.playSequence(frequencies, duration);
    },
    []
  );

  /**
   * O enunciado soa sozinho ao abrir, quando o exercício é de ouvido.
   *
   * Sem isso a pessoa precisa clicar para começar — e num exercício cujo
   * conteúdo É o som, esperar um clique é esconder a pergunta.
   */
  useEffect(() => {
    if (exercise?.audio) {
      const t = window.setTimeout(
        () => play(exercise.audio!.frequenciesHz, exercise.audio!.mode),
        250
      );
      return () => window.clearTimeout(t);
    }
  }, [exercise, play]);

  const check = () => {
    if (!exercise || selectedIds.length === 0) return;
    const isCorrect =
      selectedIds.length === exercise.correctIds.length &&
      selectedIds.every((id) => exercise.correctIds.includes(id));
    setConferido({ isCorrect });
    playResultSound(isCorrect, exercise);
  };

  const advance = () => {
    if (!checked) return;
    onAnswer(checked.isCorrect, selectedIds);
  };

  /** Atalho numérico — acessibilidade e velocidade, como na referência. */
  useNumericShortcut(exercise, checked, (id) => toggle(id));

  const toggle = (id: string) => {
    if (checked) return;
    setEscolhidas((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
    );
  };

  if (!exercise) return null;

  const inCombo = isInCombo(lesson);

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <header className="flex items-center gap-4 px-4 py-4 sm:px-8">
        <button
          type="button"
          onClick={requestExit}
          aria-label="Sair da lição"
          className="rounded p-1 text-stone-400 transition-colors hover:text-stone-700"
        >
          <X className="h-6 w-6" aria-hidden="true" />
        </button>

        <div
          className="h-3 flex-1 overflow-hidden rounded-full bg-stone-200"
          role="progressbar"
          aria-valuenow={Math.round(progress(lesson) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso da lição"
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              inCombo ? 'bg-ouro-500' : 'bg-anil-700'
            }`}
            style={{ width: `${progress(lesson) * 100}%` }}
          />
        </div>

        <Lives restantes={lesson.lives} />
      </header>

      {lesson.streak >= 2 && (
        <p
          role="status"
          className={`text-center font-mono text-xs font-bold uppercase tracking-wider ${
            inCombo ? 'text-ouro-600' : 'text-anil-700'
          }`}
        >
          {lesson.streak} streak
        </p>
      )}

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-8">
        <p className="mb-2 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-anil-800">
          {exercise.tag === 'REVIEW' && (
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {TAG_TEXT[exercise.tag]}
        </p>

        <h1 className="font-serif text-2xl font-bold leading-snug text-stone-900">
          {exercise.prompt}
        </h1>

        {/*
          🔴 A FIGURA VEM ANTES DAS ALTERNATIVAS.

          O enunciado diz "Que nota está escrita na pauta?" — se a pauta
          aparecesse depois das alternativas, ou não aparecesse, a pergunta
          apontaria para o vazio.
        */}
        {exercise.figura && <FiguraDoExercicio figura={exercise.figura} />}

        {exercise.audio && (
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => play(exercise.audio!.frequenciesHz, exercise.audio!.mode)}
              aria-label="Ouvir"
              className="flex h-16 w-16 items-center justify-center rounded-xl bg-anil-800 text-white transition-colors hover:bg-anil-700"
            >
              <Volume2 className="h-7 w-7" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => play(exercise.audio!.frequenciesHz, exercise.audio!.mode, true)}
              aria-label="Ouvir a meia velocidade"
              title="Meia velocidade — é o que torna audível a condução de vozes"
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-anil-100 text-anil-800 transition-colors hover:bg-anil-200"
            >
              <Turtle className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {exercise.choices.map((alt, i) => {
            const escolhida = selectedIds.includes(alt.id);
            const correta = exercise.correctIds.includes(alt.id);

            let estilo = 'border-stone-200 bg-white text-stone-800 hover:border-stone-400';
            if (checked) {
              if (correta) estilo = 'border-emerald-500 bg-emerald-50 font-bold text-emerald-950';
              else if (escolhida) estilo = 'border-red-500 bg-red-50 font-bold text-red-950';
              else estilo = 'border-stone-200 bg-stone-50 text-stone-400';
            } else if (escolhida) {
              estilo = 'border-anil-700 bg-anil-50 font-medium text-anil-950';
            }

            return (
              <button
                key={alt.id}
                type="button"
                disabled={checked !== null}
                aria-pressed={escolhida}
                onClick={() => {
                  toggle(alt.id);
                  // a alternativa SOA ao ser tocada — ver o cabeçalho
                  play(alt.frequenciesHz, 'SEQUENCE');
                }}
                className={`flex items-center justify-between rounded-xl border-2 p-4 text-left text-sm transition-all ${estilo}`}
              >
                <span className="flex items-center gap-3">
                  <kbd className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-current/25 font-mono text-[11px] opacity-60">
                    {i + 1}
                  </kbd>
                  <span>{alt.label}</span>
                </span>
                {checked && correta && (
                  <Check className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {checked && (
          <div
            role="status"
            className={`mt-6 rounded-xl border p-4 ${
              checked.isCorrect
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <p
              className={`font-serif text-base font-bold ${
                checked.isCorrect ? 'text-emerald-900' : 'text-red-900'
              }`}
            >
              {checked.isCorrect ? 'Correto.' : 'Não é essa.'}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-stone-700">{exercise.explanation}</p>

            {(onRateDifficulty || onReport) && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-900/10 pt-3">
                {calibration ? (
                  <p role="status" className="text-xs text-stone-600">
                    {calibration === 'REPORTED'
                      ? 'Reportado. Vamos revisar este exercício.'
                      : 'Anotado — o percurso se ajusta a isso.'}
                  </p>
                ) : (
                  <>
                    {onRateDifficulty && (
                      <>
                        <span className="mr-1 text-xs text-stone-500">Para você, isto foi</span>
                        {(['EASY', 'HARD'] as const).map((verdict) => (
                          <button
                            key={verdict}
                            type="button"
                            onClick={() => {
                              onRateDifficulty(exercise.id, verdict);
                              setCalibragem(verdict);
                            }}
                            className="rounded-full border border-stone-300 bg-white px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-stone-600 transition-colors hover:border-anil-700 hover:text-anil-800"
                          >
                            {verdict === 'EASY' ? 'muito fácil' : 'muito difícil'}
                          </button>
                        ))}
                      </>
                    )}
                    {onReport && (
                      <button
                        type="button"
                        onClick={() => {
                          onReport(exercise.id);
                          setCalibragem('REPORTED');
                        }}
                        className="ml-auto flex items-center gap-1 text-xs text-stone-500 underline-offset-2 transition-colors hover:text-stone-800 hover:underline"
                      >
                        <Flag className="h-3 w-3" aria-hidden="true" />
                        Reportar um problema
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={onSkip}
            disabled={checked !== null}
            className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-40"
          >
            Pular
          </button>

          <button
            type="button"
            onClick={checked ? advance : check}
            disabled={selectedIds.length === 0}
            className="rounded-lg bg-anil-800 px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-anil-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {checked ? 'Continuar' : 'Conferir'}
          </button>
        </div>
      </footer>

      {confirmingExit && (
        <ExitConfirmation
          onStay={() => setConfirmandoSaida(false)}
          onExit={onExit}
        />
      )}
    </div>
  );
};

type Calibration = 'EASY' | 'HARD' | 'REPORTED' | null;

/**
 * O aviso antes de sair.
 *
 * A licao so conta quando termina: quem sai no meio perde o que respondeu.
 * Isso precisa ser dito ANTES, e dito por inteiro — "tem certeza?" nao informa
 * nada. E o botao em destaque e o de FICAR, porque sair e a acao destrutiva.
 */
const ExitConfirmation: React.FC<{ onStay: () => void; onExit: () => void }> = ({
  onStay,
  onExit,
}) => {
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onStay();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [onStay]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-da-saida"
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/50 p-4 sm:items-center"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="titulo-da-saida" className="font-serif text-xl font-bold text-stone-900">
          Sair da lição?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          O que você respondeu até aqui não será registrado, e a lição recomeça do
          primeiro exercício.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            autoFocus
            onClick={onStay}
            className="rounded-lg bg-anil-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-anil-700"
          >
            Continuar a lição
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-lg px-6 py-2.5 text-sm font-medium text-stone-500 transition-colors hover:text-red-700"
          >
            Sair e perder o progresso
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * As vidas.
 *
 * Em zero **não trava**: o que passa a acumular é o índice de débito. Por
 * isso o rótulo muda em vez de sumir — a pessoa precisa entender que segue
 * podendo responder.
 */
const Lives: React.FC<{ restantes: number }> = ({ restantes }) => (
  <p
    className={`flex items-center gap-1.5 font-mono text-sm font-bold ${
      restantes === 0 ? 'text-red-700' : 'text-stone-700'
    }`}
    aria-label={
      restantes === 0
        ? 'Sem vidas. Os erros a partir daqui viram índice de débito.'
        : `${restantes} vidas restantes`
    }
  >
    <span aria-hidden="true">{restantes === 0 ? '○' : '♥'}</span>
    {restantes === 0 ? 'débito' : restantes}
  </p>
);

/**
 * Som de resultado — musicalmente coerente.
 *
 * Acerto é tríade maior no tom do exercício; erro é segunda menor. Num
 * produto de música o som de recompensa **também ensina**, e um efeito
 * eletrônico genérico seria a única parte da plataforma que não é musical.
 */
function playResultSound(isCorrect: boolean, exercise: MusicExercise): void {
  const tonica = exercise.tonicHz ?? 261.63;
  if (isCorrect) {
    webAudioSynth.playChord(
      [tonica, tonica * Math.pow(2, 4 / 12), tonica * Math.pow(2, 7 / 12)],
      0.7
    );
  } else {
    webAudioSynth.playChord([tonica, tonica * Math.pow(2, 1 / 12)], 0.5);
  }
}

/**
 * Atalho numérico.
 *
 * Responder sem tirar a mão do teclado é velocidade para quem vê e é
 * acessibilidade para quem não usa mouse. A referência tem, e é barato.
 */
function useNumericShortcut(
  exercise: MusicExercise | null,
  checked: unknown,
  escolher: (id: string) => void
): void {
  const ref = useRef(escolher);
  ref.current = escolher;

  useEffect(() => {
    if (!exercise || checked) return;
    const aoTeclar = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > exercise.choices.length) return;
      e.preventDefault();
      ref.current(exercise.choices[n - 1].id);
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [exercise, checked]);
}
