import React, { useId, useState } from 'react';
import {
  STARTING_POINT_EXPLANATION,
  PACE_EXPLANATION,
  BANDS_BY_STARTING_POINT,
  MATERIAL_BAND_LABEL,
  STARTING_POINT_NAME,
  PACE_NAME,
  StartingPoint,
  PathPace,
} from '../../../domain/practice-enrollment';

interface EnrollmentFormProps {
  /** O percurso em que a pessoa está se matriculando — teoria, história, violino. */
  pathName: string;
  /**
   * Curso do Academy correspondente, quando existir.
   *
   * Ausente é caso previsto: quem pratica história sem fazer o curso de
   * história não é exceção a tolerar.
   */
  matchingCourse?: { id: string; titulo: string };
  onEnroll: (dados: {
    startingPoint: StartingPoint;
    ritmo: PathPace;
    linkedCourseId?: string;
  }) => void;
}

/**
 * A matrícula no percurso.
 *
 * DUAS PERGUNTAS, E NÃO UM TESTE
 * ------------------------------
 * *De onde eu parto* e *como eu avanço*. São perguntas diferentes, e as duas
 * são da pessoa — quem chega sabendo o que sabe não deve ter que provar isso
 * respondendo trinta questões antes de começar.
 *
 * Para quem **não** sabe dizer de onde parte, existe a sondagem: o percurso a
 * oferece depois, para autodidata e formado fora. A diferença é que aí ela é
 * uma ferramenta, e não um pedágio.
 *
 * NENHUMA OPÇÃO É A CERTA
 * -----------------------
 * Não há recomendada, nem ordem que sugira mérito: "nunca estudei" abre o
 * vocabulário, e isso é um caminho, não um rebaixamento. Marcar uma opção
 * como recomendada faria a pessoa escolher a que parece melhor em vez da que
 * é verdade — e o percurso inteiro sairia errado a partir daí.
 *
 * O que cada escolha **faz** está escrito junto dela, e não numa ajuda
 * escondida: é a única forma de escolher sem adivinhar.
 */
export const EnrollmentForm: React.FC<EnrollmentFormProps> = ({
  pathName,
  matchingCourse,
  onEnroll,
}) => {
  const [start, setPartida] = useState<StartingPoint | null>(null);
  const [ritmo, setRitmo] = useState<PathPace>(PathPace.STEP_BY_STEP);
  const startGroup = useId();
  const paceGroup = useId();

  const canSubmit = start !== null;

  return (
    <form
      className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!start) return;
        onEnroll({
          startingPoint: start,
          ritmo,
          linkedCourseId: matchingCourse?.id,
        });
      }}
    >
      <h1 className="font-serif text-2xl font-bold text-stone-900">
        Percurso de {pathName}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        Duas perguntas, e nada de teste antes de começar. As duas respostas são suas, e dá
        para mudar depois.
      </p>

      <fieldset className="mt-8" aria-describedby={`${startGroup}-ajuda`}>
        <legend className="font-serif text-lg font-bold text-stone-900">
          De onde você parte?
        </legend>
        <p id={`${startGroup}-ajuda`} className="mt-1 text-xs text-stone-500">
          Não existe resposta melhor: cada uma abre um material diferente.
        </p>

        <div className="mt-4 space-y-2">
          {Object.values(StartingPoint).map((option) => (
            <RadioOption
              key={option}
              nome={startGroup}
              valor={option}
              label={STARTING_POINT_NAME[option]}
              explanation={STARTING_POINT_EXPLANATION[option]}
              selected={start === option}
              onSelect={() => setPartida(option)}
              footer={
                <span className="mt-2 flex flex-wrap gap-1">
                  {BANDS_BY_STARTING_POINT[option].map((band) => (
                    <span
                      key={band}
                      className="rounded border border-current/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider opacity-70"
                    >
                      {MATERIAL_BAND_LABEL[band]}
                    </span>
                  ))}
                </span>
              }
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-10">
        <legend className="font-serif text-lg font-bold text-stone-900">Como você avança?</legend>
        <p className="mt-1 text-xs text-stone-500">
          Isto muda quando as etapas abrem, e não o que elas cobram.
        </p>

        <div className="mt-4 space-y-2">
          {Object.values(PathPace).map((option) => (
            <RadioOption
              key={option}
              nome={paceGroup}
              valor={option}
              label={PACE_NAME[option]}
              explanation={PACE_EXPLANATION[option]}
              selected={ritmo === option}
              onSelect={() => setRitmo(option)}
            />
          ))}
        </div>
      </fieldset>

      {matchingCourse ? (
        <p className="mt-8 rounded-xl border border-stone-200 bg-white p-4 text-sm leading-relaxed text-stone-600">
          Este percurso fica ligado ao curso <strong>{matchingCourse.titulo}</strong>. As
          lições são outras — o vínculo serve para o percurso saber onde você está, e não
          para exigir o curso.
        </p>
      ) : (
        <p className="mt-8 rounded-xl border border-stone-200 bg-white p-4 text-sm leading-relaxed text-stone-600">
          Este percurso não depende de nenhum curso. Praticar sem cursar é caso previsto.
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-8 w-full rounded-lg bg-anil-800 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-anil-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Começar o percurso
      </button>
      {!canSubmit && (
        <p className="mt-2 text-center text-xs text-stone-500">
          Escolha de onde você parte para continuar.
        </p>
      )}
    </form>
  );
};

/**
 * Uma opção.
 *
 * `radio` de verdade, e não `div` com `onClick`: as setas do teclado navegam
 * entre as opções do grupo, o leitor de tela anuncia "2 de 5", e o navegador
 * cuida da exclusividade. Já houve aqui uma prova em que as alternativas eram
 * `div onClick` — quem usava teclado literalmente não conseguia responder.
 */
const RadioOption: React.FC<{
  nome: string;
  valor: string;
  label: string;
  explanation: string;
  selected: boolean;
  onSelect: () => void;
  footer?: React.ReactNode;
}> = ({ nome, valor, label, explanation, selected, onSelect, footer }) => (
  <label
    className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition-colors ${
      selected
        ? 'border-anil-700 bg-anil-50 text-anil-950'
        : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
    }`}
  >
    <input
      type="radio"
      name={nome}
      value={valor}
      checked={selected}
      onChange={onSelect}
      className="mt-1 h-4 w-4 shrink-0 accent-anil-800"
    />
    <span className="min-w-0">
      <span className="block font-serif text-base font-bold">{label}</span>
      <span className="mt-0.5 block text-xs leading-relaxed text-current/75">{explanation}</span>
      {footer}
    </span>
  </label>
);
