import React, { useState } from 'react';
import {
  EstadoDoNo,
  NoDoPercurso,
  estadoDoNo,
  motivoDoBloqueio,
  progressoDaUnidade,
  unidadesDoPercurso,
} from '../../../domain/percurso';
import { Dimensao } from '../../../domain/gramatica-musical';
import { Check, Lock } from 'lucide-react';

interface CaminhoDoPercursoProps {
  concluidas: readonly Dimensao[];
  aoAbrirNo: (dimensao: Dimensao) => void;
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
export const CaminhoDoPercurso: React.FC<CaminhoDoPercursoProps> = ({
  concluidas,
  aoAbrirNo,
}) => {
  const [motivoAberto, setMotivoAberto] = useState<Dimensao | null>(null);

  return (
    <div className="mx-auto w-full max-w-lg space-y-10 px-4 py-8 sm:px-6">
      {unidadesDoPercurso().map((unidade) => {
        const feito = progressoDaUnidade(unidade, concluidas);

        return (
          <section key={unidade.numero} aria-labelledby={`unidade-${unidade.numero}`}>
            <header className="mb-5 border-l-2 border-anil-700 pl-4">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-anil-700">
                Unidade {unidade.numero}
              </p>
              <h2
                id={`unidade-${unidade.numero}`}
                className="font-serif text-xl font-bold leading-snug text-stone-900"
              >
                {unidade.titulo}
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <div
                  className="h-1.5 w-28 overflow-hidden rounded-full bg-stone-200"
                  role="progressbar"
                  aria-valuenow={Math.round(feito * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progresso da unidade ${unidade.numero}`}
                >
                  <div
                    className="h-full rounded-full bg-anil-700 transition-all"
                    style={{ width: `${feito * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] text-stone-500">
                  {unidade.nos.filter((n) => concluidas.includes(n.dimensao)).length} de{' '}
                  {unidade.nos.length}
                </span>
              </div>
            </header>

            <ol className="space-y-2">
              {unidade.nos.map((no) => (
                <li key={no.dimensao}>
                  <NoDoCaminho
                    no={no}
                    estado={estadoDoNo(no.dimensao, concluidas)}
                    motivo={motivoDoBloqueio(no.dimensao, concluidas)}
                    motivoVisivel={motivoAberto === no.dimensao}
                    aoAtivar={() => {
                      const travado = estadoDoNo(no.dimensao, concluidas) === 'BLOQUEADO';
                      if (travado) {
                        setMotivoAberto((atual) =>
                          atual === no.dimensao ? null : no.dimensao
                        );
                      } else {
                        aoAbrirNo(no.dimensao);
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

const ESTILO: Record<EstadoDoNo, string> = {
  CONCLUIDO: 'border-anil-700 bg-anil-50 text-anil-950',
  ATUAL: 'border-ouro-500 bg-white text-stone-900 shadow-sm ring-2 ring-ouro-500/25',
  DISPONIVEL: 'border-stone-200 bg-white text-stone-800 hover:border-stone-400',
  BLOQUEADO: 'border-stone-200 bg-stone-50 text-stone-400',
};

const NoDoCaminho: React.FC<{
  no: NoDoPercurso;
  estado: EstadoDoNo;
  motivo: string | null;
  motivoVisivel: boolean;
  aoAtivar: () => void;
}> = ({ no, estado, motivo, motivoVisivel, aoAtivar }) => {
  const travado = estado === 'BLOQUEADO';

  return (
    <>
      <button
        type="button"
        onClick={aoAtivar}
        /**
         * Travado NÃO usa `disabled`: um botão desabilitado some do foco, e
         * quem navega por teclado nunca chega ao motivo. O estado vai em
         * `aria-disabled`, que anuncia sem remover.
         */
        aria-disabled={travado}
        aria-expanded={travado ? motivoVisivel : undefined}
        aria-label={travado && motivo ? `${no.titulo} — bloqueado. ${motivo}` : no.titulo}
        className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${ESTILO[estado]}`}
      >
        <span
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
            estado === 'CONCLUIDO'
              ? 'border-anil-700 bg-anil-700 text-white'
              : estado === 'ATUAL'
                ? 'border-ouro-500 bg-ouro-500 text-white'
                : 'border-current/30'
          }`}
        >
          {estado === 'CONCLUIDO' ? (
            <Check className="h-5 w-5" />
          ) : travado ? (
            <Lock className="h-4 w-4" />
          ) : (
            <span className="font-serif text-sm font-bold">{no.titulo.charAt(0)}</span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block font-serif text-base font-bold">{no.titulo}</span>
          <span className="block truncate text-xs text-current/70">{no.pergunta}</span>
        </span>

        {estado === 'ATUAL' && (
          <span className="shrink-0 rounded-full bg-ouro-500 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
            Começar
          </span>
        )}
      </button>

      {travado && motivoVisivel && motivo && (
        <p className="mt-1 pl-[4.5rem] text-xs leading-relaxed text-stone-500">{motivo}</p>
      )}
    </>
  );
};
