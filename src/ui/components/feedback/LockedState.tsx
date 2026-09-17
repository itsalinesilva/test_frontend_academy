import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '../base/Button';
import { twMerge } from 'tailwind-merge';

export interface LockedStateProps {
  id?: string;
  title?: string;
  description?: string;
  requirementText?: string;
  unlockActionLabel?: string;
  onUnlockAction?: () => void;
  className?: string;
}

export const LockedState: React.FC<LockedStateProps> = ({
  id = 'locked-state',
  title = 'Conteúdo Bloqueado',
  description = 'Conclua as etapas ou disciplinas pré-requisito para liberar este módulo de estudo.',
  requirementText,
  unlockActionLabel = 'Ver Pré-requisitos',
  onUnlockAction,
  className,
}) => {
  return (
    <div
      id={id}
      role="status"
      aria-label={title}
      className={twMerge(
        'flex flex-col items-center justify-center p-8 text-center bg-stone-50 border border-stone-200 rounded-lg select-none max-w-md mx-auto',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-stone-200/80 text-stone-600 flex items-center justify-center mb-3 shrink-0">
        <Lock className="w-6 h-6" />
      </div>

      <h3 className="text-base font-bold text-stone-900 tracking-tight mb-1">{title}</h3>
      <p className="text-xs text-stone-600 mb-4 max-w-xs">{description}</p>

      {requirementText && (
        <div className="w-full bg-white border border-stone-200 rounded p-2.5 mb-4 text-xs font-medium text-stone-700 text-left">
          <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
            Pré-requisito Obrigatório
          </span>
          {requirementText}
        </div>
      )}

      {onUnlockAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onUnlockAction}
          trailingIcon={<ArrowRight className="w-4 h-4" />}
        >
          {unlockActionLabel}
        </Button>
      )}
    </div>
  );
};
