import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import {
  StudyRecord,
  buildMonth,
  currentStreak,
  MONTH_NAMES,
  WEEKDAY_INITIALS,
} from '../../../domain/study-attendance';

export interface CalendarioDeEstudoProps {
  id?: string;
  registros: StudyRecord[];
  /** Injetado para que o componente seja determinístico e testável. */
  hoje?: Date;
}

/**
 * Calendário de frequência — o widget lateral da tela de curso.
 *
 * Mostra o mês inteiro, com os dias estudados marcados. É mais informativo que
 * a fileira de sete bolinhas: dá para ver o padrão do mês, onde houve
 * interrupção, e quantos dias de fato se estudou.
 *
 * Dia futuro não é falta — aparece apagado, sem marca de ausência, porque
 * ainda não aconteceu.
 */
export const StudyCalendar: React.FC<CalendarioDeEstudoProps> = ({
  id = 'calendario-estudo',
  registros,
  hoje = new Date(),
}) => {
  const [deslocamento, setDeslocamento] = useState(0);

  const referencia = new Date(hoje.getFullYear(), hoje.getMonth() + deslocamento, 1);
  const ano = referencia.getFullYear();
  const mes = referencia.getMonth() + 1;

  const dados = buildMonth(registros, ano, mes, hoje);
  const sequencia = currentStreak(registros, hoje);
  const horas = Math.round(dados.minutosTotais / 6) / 10;

  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id={`${id}-titulo`}
          className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500"
        >
          Frequência
        </h2>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setDeslocamento((d) => d - 1)}
            aria-label="Mês anterior"
            className="rounded p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeslocamento((d) => d + 1)}
            disabled={deslocamento >= 0}
            aria-label="Próximo mês"
            className="rounded p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p className="text-sm font-medium capitalize text-stone-900">
        {MONTH_NAMES[mes - 1]} de {ano}
      </p>

      <table className="w-full border-separate border-spacing-0.5" role="grid">
        <caption className="sr-only">
          Dias estudados em {MONTH_NAMES[mes - 1]} de {ano}
        </caption>
        <thead>
          <tr>
            {WEEKDAY_INITIALS.map((inicial, i) => (
              <th
                key={i}
                scope="col"
                className="pb-1 text-center text-[10px] font-normal text-stone-400"
              >
                <abbr title={['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][i]}>
                  {inicial}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(dados.celulas.length / 7) }, (_, semana) => (
            <tr key={semana}>
              {dados.celulas.slice(semana * 7, semana * 7 + 7).map((c, i) => (
                <td key={i} className="p-0 text-center">
                  {c.numero === null ? (
                    <span className="block h-7 w-full" />
                  ) : (
                    <span
                      title={
                        c.estudou
                          ? `${c.numero}: ${c.minutos} min de estudo`
                          : c.futuro
                            ? `${c.numero}: ainda não chegou`
                            : `${c.numero}: sem registro`
                      }
                      aria-label={
                        c.estudou ? `dia ${c.numero}, estudou` : `dia ${c.numero}, sem registro`
                      }
                      className={clsx(
                        'flex h-7 w-full items-center justify-center rounded text-[11px] tabular-nums',
                        c.estudou && 'bg-anil-800 font-semibold text-white',
                        !c.estudou && c.futuro && 'text-stone-300',
                        !c.estudou && !c.futuro && 'text-stone-500',
                        c.ehHoje && !c.estudou && 'ring-1 ring-inset ring-anil-700 font-semibold text-anil-800',
                        c.ehHoje && c.estudou && 'ring-2 ring-ouro-500 ring-offset-1'
                      )}
                    >
                      {c.numero}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="space-y-1 border-t border-stone-200 pt-2.5 text-xs">
        <div className="flex justify-between">
          <dt className="text-stone-500">Dias no mês</dt>
          <dd className="font-medium tabular-nums text-stone-900">
            {dados.diasEstudados} de {dados.diasNoMes}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-stone-500">Horas estudadas</dt>
          <dd className="font-medium tabular-nums text-stone-900">{horas} h</dd>
        </div>
        {deslocamento === 0 && (
          <div className="flex justify-between">
            <dt className="text-stone-500">Sequência atual</dt>
            <dd className="font-medium tabular-nums text-stone-900">
              {sequencia === 0 ? '—' : `${sequencia} dia${sequencia > 1 ? 's' : ''}`}
            </dd>
          </div>
        )}
      </dl>

      {dados.diasEstudados === 0 && deslocamento === 0 && (
        <p className="text-xs leading-relaxed text-stone-500">
          Nenhum dia registrado ainda neste mês. O calendário marca o dia assim que você abre
          uma lição ou responde um exercício.
        </p>
      )}
    </section>
  );
};
