import React, { useState } from 'react';
import {
  NodeState,
  PathNode,
  nodeState,
  lockReason,
  unitProgress,
  pathUnits,
} from '../../../domain/practice-path';
import { Dimension } from '../../../domain/music-grammar';
import { Check, Lock } from 'lucide-react';

interface PracticePathMapProps {
  completed: readonly Dimension[];
  onOpenNode: (dimensao: Dimension) => void;
}

/**
 * O caminho.
 *
 * É a primeira tela do Practice, e a que responde a uma pergunta só: **por
 * onde eu continuo?** Tudo o mais é secundário a isso.
 *
 * POR QUE NÃO É O MAPA DA REFERÊNCIA
 * ----------------------------------
 * A referência serpenteia os nós pela tela, com mascotes entre eles. Aqui o
 * caminho é uma coluna, e a unidade é um cabeçalho — porque o conteúdo é
 * denso e o adulto que estuda teoria musical precisa **enxergar a estrutura**,
 * não percorrê-la por surpresa. O que se copia da referência é o que resolve
 * problema real: um só nó em destaque, e cadeado que diz o motivo.
 *
 * O CADEADO NÃO ESCONDE A RAZÃO
 * -----------------------------
 * Nó fechado sem explicação é lido como "isto é pago" ou "isto quebrou". O
 * motivo vai no nome acessível — quem usa leitor de tela ouve junto com o
 * nome, sem precisar ativar nada — e aparece escrito ao ser tocado, para quem
 * lê a tela.
 */
export const PracticePathMap: React.FC<PracticePathMapProps> = ({
  completed,
  onOpenNode,
}) => {
  const [openReason, setMotivoAberto] = useState<Dimension | null>(null);

  return (
    <div className="mx-auto w-full max-w-lg space-y-10 px-4 py-8 sm:px-6">
      {pathUnits().map((unit) => {
        const feito = unitProgress(unit, completed);

        return (
          <section key={unit.numero} aria-labelledby={`unidade-${unit.numero}`}>
            <header className="mb-5 border-l-2 border-anil-700 pl-4">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-anil-700">
                Unidade {unit.numero}
              </p>
              <h2
                id={`unidade-${unit.numero}`}
                className="font-serif text-xl font-bold leading-snug text-stone-900"
              >
                {unit.titulo}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <div
                  className="h-1.5 w-28 overflow-hidden rounded-full bg-stone-200"
                  role="progressbar"
                  aria-valuenow={Math.round(feito * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progresso da unidade ${unit.numero}`}
                >
                  <div
                    className="h-full rounded-full bg-anil-700 transition-all"
                    style={{ width: `${feito * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] text-stone-500">
                  {unit.nos.filter((n) => completed.includes(n.dimensao)).length} de{' '}
                  {unit.nos.length}
                </span>
              </div>
            </header>

            <ol className="space-y-2">
              {unit.nos.map((no) => (
                <li key={no.dimensao}>
                  <PathNodeRow
                    no={no}
                    state={nodeState(no.dimensao, completed)}
                    reason={lockReason(no.dimensao, completed)}
                    reasonVisible={openReason === no.dimensao}
                    onActivate={() => {
                      const locked = nodeState(no.dimensao, completed) === 'LOCKED';
                      if (locked) {
                        setMotivoAberto((atual) =>
                          atual === no.dimensao ? null : no.dimensao
                        );
                      } else {
                        onOpenNode(no.dimensao);
                      }
                    }}
                  />
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
};

const STYLE: Record<NodeState, string> = {
  DONE: 'border-anil-700 bg-anil-50 text-anil-950',
  CURRENT: 'border-ouro-500 bg-white text-stone-900 shadow-sm ring-2 ring-ouro-500/25',
  AVAILABLE: 'border-stone-200 bg-white text-stone-800 hover:border-stone-400',
  LOCKED: 'border-stone-200 bg-stone-50 text-stone-400',
};

const PathNodeRow: React.FC<{
  no: PathNode;
  state: NodeState;
  reason: string | null;
  reasonVisible: boolean;
  onActivate: () => void;
}> = ({ no, state, reason, reasonVisible, onActivate }) => {
  const locked = state === 'LOCKED';

  return (
    <>
      <button
        type="button"
        onClick={onActivate}
        /**
         * Travado NÃO usa `disabled`: um botão desabilitado some do foco, e
         * quem navega por teclado nunca chega ao motivo. O estado vai em
         * `aria-disabled`, que anuncia sem remover.
         */
        aria-disabled={locked}
        aria-expanded={locked ? reasonVisible : undefined}
        aria-label={locked && reason ? `${no.titulo} — bloqueado. ${reason}` : no.titulo}
        className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${STYLE[state]}`}
      >
        <span
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
            state === 'DONE'
              ? 'border-anil-700 bg-anil-700 text-white'
              : state === 'CURRENT'
                ? 'border-ouro-500 bg-ouro-500 text-white'
                : 'border-current/30'
          }`}
        >
          {state === 'DONE' ? (
            <Check className="h-5 w-5" />
          ) : locked ? (
            <Lock className="h-4 w-4" />
          ) : (
            <span className="font-serif text-sm font-bold">{no.titulo.charAt(0)}</span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block font-serif text-base font-bold">{no.titulo}</span>
          <span className="block truncate text-xs text-current/70">{no.pergunta}</span>
        </span>

        {state === 'CURRENT' && (
          <span className="shrink-0 rounded-full bg-ouro-500 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
            Começar
          </span>
        )}
      </button>

      {locked && reasonVisible && reason && (
        <p className="mt-1 pl-[4.5rem] text-xs leading-relaxed text-stone-500">{reason}</p>
      )}
    </>
  );
};
