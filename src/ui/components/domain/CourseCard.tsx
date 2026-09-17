import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '../base/Badge';
import { Button } from '../base/Button';
import { ProgressBar } from '../data-display/Progress';

export interface CourseCardProps {
  id: string; // Mandatory ID
  title: string;
  description: string;
  instructorName: string;
  level: string;
  durationHours: number;
  modulesCount: number;
  progressPercent?: number; // if enrolled
  isEnrolled?: boolean;
  onActionClick: () => void;
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  instructorName,
  level,
  durationHours,
  modulesCount,
  progressPercent,
  isEnrolled = false,
  onActionClick,
  className,
}) => {
  return (
    <article
      id={id}
      className={twMerge(
        clsx(
          'w-full bg-white border border-stone-200 rounded-lg p-6 shadow-xs flex flex-col justify-between gap-4 text-stone-900 transition-all hover:border-stone-400',
          className
        )
      )}
    >
      <div className="space-y-3">
        {/* Top Badges & Provenance */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge id={`${id}-level-badge`} variant="neutral" size="sm">
            {level}
          </Badge>
        </div>

        {/* Title and Instructor */}
        <div>
          <h3 id={`${id}-title`} className="text-base font-semibold text-stone-900 font-sans tracking-tight">
            {title}
          </h3>
          <p id={`${id}-instructor`} className="text-xs text-stone-500 mt-0.5">
            Docente: <span className="font-medium text-stone-700">{instructorName}</span>
          </p>
        </div>

        {/* Description */}
        <p id={`${id}-description`} className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Metadata stats */}
        <div className="flex items-center gap-4 text-xs text-stone-500 pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{durationHours} horas</span>
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{modulesCount} módulos</span>
          </span>
        </div>
      </div>

      {/* Progress & Action CTA */}
      <div className="pt-4 border-t border-stone-100 space-y-3">
        {isEnrolled && progressPercent !== undefined && (
          <div id={`${id}-progress-wrapper`}>
            <ProgressBar
              id={`${id}-progress-bar`}
              value={progressPercent}
              label="Progresso Acadêmico"
              showValueLabel
              sizeVariant="sm"
            />
          </div>
        )}

        <Button
          id={`${id}-action-btn`}
          size="md"
          variant={isEnrolled ? 'secondary' : 'primary'}
          onClick={onActionClick}
          className="w-full"
          trailingIcon={<ChevronRight className="w-4 h-4" />}
        >
          {isEnrolled ? 'Continuar Curso' : 'Matricular-se no Curso'}
        </Button>
      </div>
    </article>
  );
};
