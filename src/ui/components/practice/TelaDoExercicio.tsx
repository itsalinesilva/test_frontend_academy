import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ExercicioMusical,
  LicaoEmAndamento,
  TEXTO_DA_ETIQUETA,
  exercicioAtual,
  emCombo,
  progresso,
} from '../../../domain/exercicio-musical';
import { webAudioSynth } from '../../../infrastructure/audio/synth';
import { X, Volume2, Turtle, Check, RotateCcw } from 'lucide-react';

interface TelaDoExercicioProps {
  licao: LicaoEmAndamento;
  aoResponder: (acertou: boolean, escolhidas: string[]) => void;
  aoPular: () => void;
  aoSair: () => void;
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
export const TelaDoExercicio: React.FC<TelaDoExercicioProps> = ({
  licao,
  aoResponder,
  aoPular,
  aoSair,
}) => {
  const exercicio = exercicioAtual(licao);
  const [escolhidas, setEscolhidas] = useState<string[]>([]);
  const [conferido, setConferido] = useState<null | { acertou: boolean }>(null);

  useEffect(() => {
    setEscolhidas([]);
    setConferido(null);
  }, [exercicio?.id]);

  const tocar = useCallback(
    (frequencias: number[] | undefined, modo: 'SEQUENCIA' | 'ACORDE', lento = false) => {
      if (!frequencias?.length) return;
      const duracao = lento ? 1.4 : 0.7;
      if (modo === 'ACORDE') webAudioSynth.playChord(frequencias, duracao * 1.6);
      else webAudioSynth.playSequence(frequencias, duracao);
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
    if (exercicio?.audio) {
      const t = window.setTimeout(
        () => tocar(exercicio.audio!.frequenciasHz, exercicio.audio!.modo),
        250
      );
      return () => window.clearTimeout(t);
    }
  }, [exercicio, tocar]);

  const conferir = () => {
    if (!exercicio || escolhidas.length === 0) return;
    const acertou =
      escolhidas.length === exercicio.corretas.length &&
      escolhidas.every((id) => exercicio.corretas.includes(id));
    setConferido({ acertou });
    somDeResultado(acertou, exercicio);
  };

  const seguir = () => {
    if (!conferido) return;
    aoResponder(conferido.acertou, escolhidas);
  };

  /** Atalho numérico — acessibilidade e velocidade, como na referência. */
  useAtalhoNumerico(exercicio, conferido, (id) => alternar(id));

  const alternar = (id: string) => {
    if (conferido) return;
    setEscolhidas((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
    );
  };

  if (!exercicio) return null;

  const combo = emCombo(licao);

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      <header className="flex items-center gap-4 px-4 py-4 sm:px-8">
        <button
          type="button"
          onClick={aoSair}
          aria-label="Sair da lição"
          className="rounded p-1 text-stone-400 transition-colors hover:text-stone-700"
        >
          <X className="h-6 w-6" aria-hidden="true" />
        </button>

        <div
          className="h-3 flex-1 overflow-hidden rounded-full bg-stone-200"
          role="progressbar"
          aria-valuenow={Math.round(progresso(licao) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso da lição"
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              combo ? 'bg-ouro-500' : 'bg-anil-700'
            }`}
            style={{ width: `${progresso(licao) * 100}%` }}
          />
        </div>

        <Vidas restantes={licao.vidas} />
      </header>

      {licao.seguidos >= 2 && (
        <p
          role="status"
          className={`text-center font-mono text-xs font-bold uppercase tracking-wider ${
            combo ? 'text-ouro-600' : 'text-anil-700'
          }`}
        >
          {licao.seguidos} seguidos
        </p>
      )}

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-8">
        <p className="mb-2 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-anil-800">
          {exercicio.etiqueta === 'REVISAO' && (
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {TEXTO_DA_ETIQUETA[exercicio.etiqueta]}
        </p>

        <h1 className="font-serif text-2xl font-bold leading-snug text-stone-900">
          {exercicio.enunciado}
        </h1>

        {exercicio.audio && (
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => tocar(exercicio.audio!.frequenciasHz, exercicio.audio!.modo)}
              aria-label="Ouvir"
              className="flex h-16 w-16 items-center justify-center rounded-xl bg-anil-800 text-white transition-colors hover:bg-anil-700"
            >
              <Volume2 className="h-7 w-7" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => tocar(exercicio.audio!.frequenciasHz, exercicio.audio!.modo, true)}
              aria-label="Ouvir a meia velocidade"
              title="Meia velocidade — é o que torna audível a condução de vozes"
              className="flex h-12 w-12 items-center justify-center rounded-lg bg-anil-100 text-anil-800 transition-colors hover:bg-anil-200"
            >
              <Turtle className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {exercicio.alternativas.map((alt, i) => {
            const escolhida = escolhidas.includes(alt.id);
            const correta = exercicio.corretas.includes(alt.id);

            let estilo = 'border-stone-200 bg-white text-stone-800 hover:border-stone-400';
            if (conferido) {
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
                disabled={conferido !== null}
                aria-pressed={escolhida}
                onClick={() => {
                  alternar(alt.id);
                  // a alternativa SOA ao ser tocada — ver o cabeçalho
                  tocar(alt.frequenciasHz, 'SEQUENCIA');
                }}
                className={`flex items-center justify-between rounded-xl border-2 p-4 text-left text-sm transition-all ${estilo}`}
              >
                <span className="flex items-center gap-3">
                  <kbd className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-current/25 font-mono text-[11px] opacity-60">
                    {i + 1}
                  </kbd>
                  <span>{alt.rotulo}</span>
                </span>
                {conferido && correta && (
                  <Check className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {conferido && (
          <div
            role="status"
            className={`mt-6 rounded-xl border p-4 ${
              conferido.acertou
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <p
              className={`font-serif text-base font-bold ${
                conferido.acertou ? 'text-emerald-900' : 'text-red-900'
              }`}
            >
              {conferido.acertou ? 'Correto.' : 'Não é essa.'}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-stone-700">{exercicio.explicacao}</p>
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <button
            type="button"
            onClick={aoPular}
            disabled={conferido !== null}
            className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-40"
          >
            Pular
          </button>

          <button
            type="button"
            onClick={conferido ? seguir : conferir}
            disabled={escolhidas.length === 0}
            className="rounded-lg bg-anil-800 px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-anil-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {conferido ? 'Continuar' : 'Conferir'}
          </button>
        </div>
      </footer>
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
const Vidas: React.FC<{ restantes: number }> = ({ restantes }) => (
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
function somDeResultado(acertou: boolean, exercicio: ExercicioMusical): void {
  const tonica = exercicio.tonalidadeHz ?? 261.63;
  if (acertou) {
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
function useAtalhoNumerico(
  exercicio: ExercicioMusical | null,
  conferido: unknown,
  escolher: (id: string) => void
): void {
  const ref = useRef(escolher);
  ref.current = escolher;

  useEffect(() => {
    if (!exercicio || conferido) return;
    const aoTeclar = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > exercicio.alternativas.length) return;
      e.preventDefault();
      ref.current(exercicio.alternativas[n - 1].id);
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [exercicio, conferido]);
}
