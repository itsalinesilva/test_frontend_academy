import React from 'react';
import {
  CLUBES_DE_OFENSIVA,
  INICIAIS_DA_SEMANA,
  clubesAlcancados,
  proximoClube,
} from '../../../domain/frequencia';
import { Flame, Lock, Snowflake } from 'lucide-react';

interface PainelDaOfensivaProps {
  diasSeguidos: number;
  /** Sete posições, de domingo a sábado: houve estudo naquele dia? */
  semana: readonly boolean[];
  /** Congelamentos guardados — protegem um dia perdido cada. */
  congelamentos: number;
  /** Meta de constância que a pessoa escolheu, se escolheu. */
  meta: number | null;
}

/**
 * A ofensiva.
 *
 * ZERO SE DECLARA SEM CONSTRANGER
 * -------------------------------
 * "0 dias" não vem acompanhado de cara triste, de "não perca!" nem de nada
 * que sugira falta. Quem está em zero ou nunca começou, ou parou — e nos dois
 * casos a informação útil é como recomeçar, não a repreensão.
 *
 * É a regra da casa, e já era antes desta tela: em `domain/frequencia.ts`, o
 * dia de hoje **nunca conta como falta**, porque senão às 00h01 toda ofensiva
 * apareceria quebrada.
 *
 * O CLUBE MOSTRA O DEGRAU, E NÃO SÓ O CADEADO
 * -------------------------------------------
 * Diz quantos dias faltam. Cadeado sem número é convite a desistir — a pessoa
 * não sabe se está perto ou a um ano de distância.
 */
export const PainelDaOfensiva: React.FC<PainelDaOfensivaProps> = ({
  diasSeguidos,
  semana,
  congelamentos,
  meta,
}) => {
  const conquistados = clubesAlcancados(diasSeguidos);
  const seguinte = proximoClube(diasSeguidos);

  return (
    <section aria-labelledby="titulo-ofensiva" className="space-y-4">
      <header className="flex items-center gap-3">
        <Flame
          className={`h-8 w-8 ${diasSeguidos > 0 ? 'text-ouro-500' : 'text-stone-300'}`}
          aria-hidden="true"
        />
        <div>
          <h2 id="titulo-ofensiva" className="font-serif text-2xl font-bold text-stone-900">
            {diasSeguidos === 1 ? '1 dia' : `${diasSeguidos} dias`} de ofensiva
          </h2>
          <p className="text-xs leading-relaxed text-stone-600">
            {diasSeguidos === 0
              ? 'Uma lição, atividade ou exercício hoje já começa uma.'
              : 'Um dia inteiro sem praticar zera a contagem.'}
          </p>
        </div>
      </header>

      <ol className="flex justify-between gap-1" aria-label="Esta semana">
        {INICIAIS_DA_SEMANA.map((inicial, i) => {
          const estudou = semana[i] === true;
          return (
            <li key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                  estudou
                    ? 'border-ouro-500 bg-ouro-500 text-white'
                    : 'border-stone-200 bg-white text-stone-300'
                }`}
              >
                {estudou && <Flame className="h-4 w-4" aria-hidden="true" />}
                <span className="sr-only">
                  {DIA_POR_EXTENSO[i]}: {estudou ? 'estudou' : 'sem registro'}
                </span>
              </span>
              <span aria-hidden="true" className="font-mono text-[10px] text-stone-400">
                {inicial}
              </span>
            </li>
          );
        })}
      </ol>

      {congelamentos > 0 && (
        <p className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-600">
          <Snowflake className="h-4 w-4 shrink-0 text-anil-700" aria-hidden="true" />
          {congelamentos === 1
            ? '1 congelamento guardado — protege um dia perdido.'
            : `${congelamentos} congelamentos guardados — protegem um dia perdido cada.`}
        </p>
      )}

      {meta !== null && (
        <p className="text-xs text-stone-600">
          Sua meta é de <strong>{meta} dias</strong>.{' '}
          {diasSeguidos >= meta
            ? 'Cumprida.'
            : `Faltam ${meta - diasSeguidos}.`}
        </p>
      )}

      <div>
        <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          Clubes
        </h3>
        <ul className="mt-2 space-y-1.5">
          {CLUBES_DE_OFENSIVA.map((clube) => {
            const alcancado = conquistados.some((c) => c.id === clube.id);
            const emCurso = seguinte?.clube.id === clube.id;

            return (
              <li
                key={clube.id}
                className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 ${
                  alcancado
                    ? 'border-ouro-500/40 bg-white'
                    : 'border-stone-200 bg-stone-50 text-stone-400'
                }`}
              >
                {alcancado ? (
                  <Flame className="h-4 w-4 shrink-0 text-ouro-500" aria-hidden="true" />
                ) : (
                  <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                )}
                <span className="flex-1 text-sm font-medium">{clube.nome}</span>
                <span className="font-mono text-[11px]">
                  {alcancado ? (
                    <span className="text-ouro-600">alcançado</span>
                  ) : emCurso ? (
                    /* O degrau, e não só o cadeado: sem o número a pessoa não
                       sabe se está perto ou a um ano de distância. */
                    <>faltam {seguinte!.faltam} dias</>
                  ) : (
                    <>{clube.diasExigidos} dias</>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

const DIA_POR_EXTENSO = [
  'domingo',
  'segunda',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sábado',
];
