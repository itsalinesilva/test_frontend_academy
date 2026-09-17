import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ShieldCheck, Award, ExternalLink } from 'lucide-react';

export interface CredentialChipProps {
  id: string; // Mandatory ID
  title: string;
  institution: string;
  level?: string;
  isVerified?: boolean;
  provenanceSource?: string;
  onClick?: () => void;
  sizeVariant?: 'sm' | 'md';
  className?: string;
}

export const CredentialChip: React.FC<CredentialChipProps> = ({
  id,
  title,
  institution,
  level,
  isVerified = true,
  provenanceSource,
  onClick,
  sizeVariant = 'md',
  className,
}) => {
  const isClickable = Boolean(onClick);
  const Component = isClickable ? 'button' : 'div';

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
  };

  return (
    <Component
      id={id}
      type={isClickable ? 'button' : undefined}
      onClick={onClick}
      className={twMerge(
        clsx(
          'inline-flex items-center gap-2 rounded-md border border-stone-300 bg-stone-50/90 text-stone-800 transition-all select-none text-left',
          sizeClasses[sizeVariant],
          isClickable && 'hover:bg-stone-100 hover:border-stone-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-800',
          className
        )
      )}
    >
      <div className="flex items-center justify-center shrink-0">
        {isVerified ? (
          <ShieldCheck id={`${id}-verified-icon`} className="w-4 h-4 text-emerald-700" aria-label="Credencial verificada" />
        ) : (
          <Award id={`${id}-award-icon`} className="w-4 h-4 text-stone-500" aria-label="Certificado acadêmico" />
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span id={`${id}-title`} className="font-semibold text-stone-900 truncate">
            {title}
          </span>
          {level && (
            <span id={`${id}-level`} className="text-[10px] font-mono px-1 bg-stone-200 text-stone-700 rounded">
              {level}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-stone-500">
          <span id={`${id}-institution`} className="truncate">{institution}</span>
          {provenanceSource && (
            <>
              <span aria-hidden="true">•</span>
              <span id={`${id}-provenance`} className="italic truncate text-[10px] text-stone-400">
                {provenanceSource}
              </span>
            </>
          )}
        </div>
      </div>

      {isClickable && (
        <ExternalLink id={`${id}-ext-icon`} className="w-3 h-3 text-stone-400 shrink-0 ml-1" aria-hidden="true" />
      )}
    </Component>
  );
};
