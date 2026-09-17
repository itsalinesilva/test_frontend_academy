import React from 'react';
import { CheckCircle2, Award, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '../base/Button';
import { twMerge } from 'tailwind-merge';

export interface CompletedStateProps {
  id?: string;
  title?: string;
  description?: string;
  scoreText?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const CompletedState: React.FC<CompletedStateProps> = ({
  id = 'completed-state',
  title = 'Etapa Concluída com Sucesso!',
  description = 'Você atendeu a todos os critérios formais de proficiência exigidos para este módulo.',
  scoreText,
  primaryActionLabel = 'Continuar Jornada',
  onPrimaryAction,
  secondaryActionLabel = 'Revisar Conteúdo',
  onSecondaryAction,
  className,
}) => {
  return (
    <div
      id={id}
      role="status"
      aria-label={title}
      className={twMerge(
        'flex flex-col items-center justify-center p-8 text-center bg-emerald-50/50 border border-emerald-200 rounded-lg select-none max-w-md mx-auto',
        className
      )}
    >
      <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 shrink-0">
        <CheckCircle2 className="w-8 h-8 text-emerald-700" />
      </div>

      <h3 className="text-lg font-bold text-stone-900 tracking-tight mb-1">{title}</h3>
      <p className="text-xs text-stone-600 mb-3 max-w-xs">{description}</p>

      {scoreText && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-300 rounded-full text-xs font-semibold text-emerald-800 mb-4 font-mono shadow-xs">
          <Award className="w-3.5 h-3.5 text-emerald-700" />
          <span>{scoreText}</span>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap justify-center">
        {onSecondaryAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSecondaryAction}
            leadingIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            {secondaryActionLabel}
          </Button>
        )}

        {onPrimaryAction && (
          <Button
            variant="primary"
            size="sm"
            onClick={onPrimaryAction}
            trailingIcon={<ArrowRight className="w-4 h-4" />}
          >
            {primaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
