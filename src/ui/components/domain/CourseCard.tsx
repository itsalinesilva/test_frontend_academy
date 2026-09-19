import React, { useId, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Clock, ChevronRight, ChevronDown } from 'lucide-react';
import { ProgressBar } from '../data-display/Progress';

export interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  instructorName: string;
  level: string;
  durationHours: number;
  modulesCount: number;
  /** Títulos das disciplinas, na ordem do curso. Quando vazio, o cartão não expande. */
  moduleTitles?: string[];
  progressPercent?: number;
  isEnrolled?: boolean;
  /** Abre a página de apresentação do curso. */
  onActionClick: () => void;
  className?: string;
}

/**
 * Cartão de curso.
 *
 * Sem contorno: o cartão se separa do fundo pelo espaçamento e pelo realce no
 * hover, não por uma caixa desenhada em volta. O corpo inteiro é clicável e
 * abre a lista de disciplinas ali mesmo, sem sair da tela nem empurrar o
 * resto. Quem quer a página do curso clica no chevron — um ícone com um
 * círculo atrás, no lugar de um botão da largura do cartão repetindo por
 * extenso o que o ícone já diz.
 */
export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  instructorName,
  level,
  durationHours,
  modulesCount,
  moduleTitles = [],
  progressPercent,
  isEnrolled = false,
  onActionClick,
  className,
}) => {
  const [aberto, setAberto] = useState(false);
  const listaId = `${useId()}-disciplinas`;
  const expansivel = moduleTitles.length > 0;

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
          <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">{level}</p>

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
            <span>{modulesCount} disciplinas</span>
            <span className="truncate">{instructorName}</span>
            {expansivel && (
              <span className="inline-flex items-center gap-0.5 text-anil-700">
                <ChevronDown
                  className={clsx('h-3 w-3 transition-transform', aberto && 'rotate-180')}
                  aria-hidden="true"
                />
                {aberto ? 'ocultar' : 'disciplinas'}
              </span>
            )}
          </div>
        </button>

        <button
          type="button"
          id={`${id}-open`}
          onClick={onActionClick}
          aria-label={isEnrolled ? `Continuar ${title}` : `Abrir ${title}`}
          title={isEnrolled ? 'Continuar' : 'Abrir curso'}
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition-colors hover:bg-anil-800 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-anil-700"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {isEnrolled && progressPercent !== undefined && (
        <div className="mt-3">
          <ProgressBar
            id={`${id}-progress-bar`}
            value={progressPercent}
            label="Progresso"
            showValueLabel
            sizeVariant="sm"
          />
        </div>
      )}

      {expansivel && aberto && (
        <ol
          id={listaId}
          className="mt-3 max-h-64 space-y-0.5 overflow-y-auto border-t border-stone-200 pt-3 text-xs"
        >
          {moduleTitles.map((t, i) => (
            <li key={`${id}-mod-${i}`} className="flex gap-2 py-0.5 text-stone-600">
              <span className="w-6 shrink-0 text-right font-mono text-[10px] text-stone-400">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate">{t}</span>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
};
