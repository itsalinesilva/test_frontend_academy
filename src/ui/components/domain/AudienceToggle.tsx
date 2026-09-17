import React from 'react';
import { AudienceVariant } from '../../../domain/academy';
import { BookOpen, Sparkles } from 'lucide-react';

interface AudienceToggleProps {
  id?: string;
  variant: AudienceVariant;
  onChange: (variant: AudienceVariant) => void;
  className?: string;
}

export const AudienceToggle: React.FC<AudienceToggleProps> = ({
  id = 'audience-variant-toggle',
  variant,
  onChange,
  className = '',
}) => {
  return (
    <div
      id={id}
      className={`inline-flex items-center p-1 bg-stone-100 border border-stone-200 rounded-lg text-xs ${className}`}
      role="group"
      aria-label="Alternar modalidade pedagógica"
    >
      <button
        type="button"
        id={`${id}-traditional`}
        onClick={() => onChange('TRADITIONAL')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
          variant === 'TRADITIONAL'
            ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
            : 'text-stone-600 hover:text-stone-900'
        }`}
      >
        <BookOpen className="w-3.5 h-3.5 text-stone-700" />
        <span>Tradicional / Acadêmico</span>
      </button>

      <button
        type="button"
        id={`${id}-kids`}
        onClick={() => onChange('KIDS')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
          variant === 'KIDS'
            ? 'bg-amber-50 text-amber-900 shadow-xs border border-amber-300 font-semibold'
            : 'text-stone-600 hover:text-stone-900'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        <span>Infantil / Kids</span>
      </button>
    </div>
  );
};
