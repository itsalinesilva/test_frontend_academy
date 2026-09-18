import React, { useId, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Clock, ChevronRight, ChevronDown } from 'lucide-react';

export interface CursoDoPrograma {
  id: string;
  titulo: string;
  disciplinas: number;
  horas: number;
}

export interface ProgramCardProps {
  id: string;
  title: string;
  description: string;
  durationHours: number;
  /** Os cursos que o programa reúne, na ordem de cursar. */
  cursos: CursoDoPrograma[];
  /** Abre a página do programa. */
  onActionClick: () => void;
  /** Abre um curso específico a partir da lista expandida. */
  onCourseClick?: (courseId: string) => void;
  className?: string;
}

/**
 * Cartão de programa.
 *
 * Mesma forma do cartão de curso, e pelo mesmo motivo: o corpo inteiro é
 * clicável e abre ali mesmo a lista do que o programa contém — aqui, os
 * **cursos**, como lá são as disciplinas. Quem está decidindo precisa ver o
 * que vai cursar antes de sair da tela.
 *
 * A lista mostra a ordem, e a ordem importa: num programa, o segundo curso
 * frequentemente pressupõe o primeiro.
 */
export const ProgramCard: React.FC<ProgramCardProps> = ({
  id,
  title,
  description,
  durationHours,
  cursos,
  onActionClick,
  onCourseClick,
  className,
}) => {
  const [aberto, setAberto] = useState(false);
  const listaId = `${useId()}-cursos`;
  const expansivel = cursos.length > 0;

  return (
    <article
      id={id}
      className={twMerge(
        clsx(
          'group flex w-full flex-col rounded-xl bg-white/60 p-4 text-stone-900 transition-colors',
          'hover:bg-white',
          className
        )
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => expansivel && setAberto((v) => !v)}
          aria-expanded={expansivel ? aberto : undefined}
          aria-controls={expansivel ? listaId : undefined}
          disabled={!expansivel}
          className="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-anil-700 disabled:cursor-default"
        >
          <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Programa</p>

          <h3
            id={`${id}-title`}
            className="mt-0.5 font-serif text-base font-semibold leading-snug tracking-tight text-stone-900"
          >
            {title}
          </h3>

          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-600">{description}</p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {durationHours} h
            </span>
            <span>
              {cursos.length} {cursos.length === 1 ? 'curso' : 'cursos'}
            </span>
            {expansivel && (
              <span className="inline-flex items-center gap-0.5 text-anil-700">
                <ChevronDown
                  className={clsx('h-3 w-3 transition-transform', aberto && 'rotate-180')}
                  aria-hidden="true"
                />
                {aberto ? 'ocultar' : 'cursos'}
              </span>
            )}
          </div>
        </button>

        <button
          type="button"
          id={`${id}-open`}
          onClick={onActionClick}
          aria-label={`Abrir programa ${title}`}
          title="Abrir programa"
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition-colors hover:bg-anil-800 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-anil-700"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {expansivel && aberto && (
        <ol
          id={listaId}
          className="mt-3 space-y-0.5 border-t border-stone-200 pt-3 text-xs"
        >
          {cursos.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onCourseClick?.(c.id)}
                disabled={!onCourseClick}
                className="flex w-full items-baseline gap-2 rounded px-1 py-1 text-left transition-colors enabled:hover:bg-stone-100 disabled:cursor-default"
              >
                <span className="w-5 shrink-0 text-right font-mono text-[10px] text-stone-400">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-stone-800">{c.titulo}</span>
                  <span className="block text-[10px] text-stone-500">
                    {c.disciplinas} disciplinas · {c.horas} h
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
};
