import React, { useId, useState } from 'react';
import {
  EXPLICACAO_DO_PONTO_DE_PARTIDA,
  EXPLICACAO_DO_RITMO,
  FAIXAS_POR_PARTIDA,
  NOME_DO_PONTO_DE_PARTIDA,
  NOME_DO_RITMO,
  PontoDePartida,
  RitmoDoPercurso,
} from '../../../domain/matricula-no-practice';

interface FormularioDeMatriculaProps {
  /** O percurso em que a pessoa está se matriculando — teoria, história, violino. */
  nomeDoPercurso: string;
  /**
   * Curso do Academy correspondente, quando existir.
   *
   * Ausente é caso previsto: quem pratica história sem fazer o curso de
   * história não é exceção a tolerar.
   */
  cursoCorrespondente?: { id: string; titulo: string };
  aoMatricular: (dados: {
    pontoDePartida: PontoDePartida;
    ritmo: RitmoDoPercurso;
    cursoVinculadoId?: string;
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
export const FormularioDeMatricula: React.FC<FormularioDeMatriculaProps> = ({
  nomeDoPercurso,
  cursoCorrespondente,
  aoMatricular,
}) => {
  const [partida, setPartida] = useState<PontoDePartida | null>(null);
  const [ritmo, setRitmo] = useState<RitmoDoPercurso>(RitmoDoPercurso.PASSO_A_PASSO);
  const grupoPartida = useId();
  const grupoRitmo = useId();

  const pronto = partida !== null;

  return (
    <form
      className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!partida) return;
        aoMatricular({
          pontoDePartida: partida,
          ritmo,
          cursoVinculadoId: cursoCorrespondente?.id,
        });
      }}
    >
      <h1 className="font-serif text-2xl font-bold text-stone-900">
        Percurso de {nomeDoPercurso}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        Duas perguntas, e nada de teste antes de começar. As duas respostas são suas, e dá
        para mudar depois.
      </p>

      <fieldset className="mt-8" aria-describedby={`${grupoPartida}-ajuda`}>
        <legend className="font-serif text-lg font-bold text-stone-900">
          De onde você parte?
        </legend>
        <p id={`${grupoPartida}-ajuda`} className="mt-1 text-xs text-stone-500">
          Não existe resposta melhor: cada uma abre um material diferente.
        </p>

        <div className="mt-4 space-y-2">
          {Object.values(PontoDePartida).map((opcao) => (
            <Opcao
              key={opcao}
              nome={grupoPartida}
              valor={opcao}
              rotulo={NOME_DO_PONTO_DE_PARTIDA[opcao]}
              explicacao={EXPLICACAO_DO_PONTO_DE_PARTIDA[opcao]}
              marcada={partida === opcao}
              aoMarcar={() => setPartida(opcao)}
              rodape={
                <span className="mt-2 flex flex-wrap gap-1">
                  {FAIXAS_POR_PARTIDA[opcao].map((faixa) => (
                    <span
                      key={faixa}
                      className="rounded border border-current/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider opacity-70"
                    >
                      {faixa.toLowerCase()}
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
          {Object.values(RitmoDoPercurso).map((opcao) => (
            <Opcao
              key={opcao}
              nome={grupoRitmo}
              valor={opcao}
              rotulo={NOME_DO_RITMO[opcao]}
              explicacao={EXPLICACAO_DO_RITMO[opcao]}
              marcada={ritmo === opcao}
              aoMarcar={() => setRitmo(opcao)}
            />
          ))}
        </div>
      </fieldset>

      {cursoCorrespondente ? (
        <p className="mt-8 rounded-xl border border-stone-200 bg-white p-4 text-sm leading-relaxed text-stone-600">
          Este percurso fica ligado ao curso <strong>{cursoCorrespondente.titulo}</strong>. As
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
        disabled={!pronto}
        className="mt-8 w-full rounded-lg bg-anil-800 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-anil-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Começar o percurso
      </button>
      {!pronto && (
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
const Opcao: React.FC<{
  nome: string;
  valor: string;
  rotulo: string;
  explicacao: string;
  marcada: boolean;
  aoMarcar: () => void;
  rodape?: React.ReactNode;
}> = ({ nome, valor, rotulo, explicacao, marcada, aoMarcar, rodape }) => (
  <label
    className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition-colors ${
      marcada
        ? 'border-anil-700 bg-anil-50 text-anil-950'
        : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
    }`}
  >
    <input
      type="radio"
      name={nome}
      value={valor}
      checked={marcada}
      onChange={aoMarcar}
      className="mt-1 h-4 w-4 shrink-0 accent-anil-800"
    />
    <span className="min-w-0">
      <span className="block font-serif text-base font-bold">{rotulo}</span>
      <span className="mt-0.5 block text-xs leading-relaxed text-current/75">{explicacao}</span>
      {rodape}
    </span>
  </label>
);
