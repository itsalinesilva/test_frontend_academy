import React from 'react';
import { Award, ExternalLink, ShieldCheck } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface CredentialProps {
  id?: string;
  title: string;
  issuer: string;
  type?: 'CERTIFICATE' | 'DIPLOMA' | 'MICROCREDENTIAL' | 'TEACHING_LICENSE';
  issuedDate: string;
  verificationCode?: string;
  verificationUrl?: string;
  competencies?: string[];
  isVerified?: boolean;
  onViewDetails?: () => void;
  className?: string;
}

export const Credential: React.FC<CredentialProps> = ({
  id = 'credential-card',
  title,
  issuer,
  type = 'CERTIFICATE',
  issuedDate,
  verificationCode,
  verificationUrl,
  competencies = [],
  isVerified = true,
  onViewDetails,
  className,
}) => {
  return (
    <article
      id={id}
      aria-labelledby={`${id}-title`}
      className={twMerge(
        'p-4 bg-white border border-stone-200 rounded-lg shadow-xs flex flex-col justify-between gap-3 hover:border-stone-300 transition-colors select-none',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200/80 flex items-center justify-center text-red-800 shrink-0">
            <Award className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider text-red-800 bg-red-50 border border-red-200/60 px-1.5 py-0.5 rounded">
                {type}
              </span>
              {isVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Auditado
                </span>
              )}
            </div>

            <h4 id={`${id}-title`} className="text-sm font-bold text-stone-900 mt-1">
              {title}
            </h4>
            <p className="text-xs text-stone-600">{issuer}</p>
          </div>
        </div>

        {verificationCode && (
          <div className="text-right shrink-0">
            <span className="text-[10px] text-stone-400 font-mono block">CÓDIGO</span>
            <span className="text-xs font-mono font-bold text-stone-800">{verificationCode}</span>
          </div>
        )}
      </div>

      {competencies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {competencies.slice(0, 4).map((comp, idx) => (
            <span
              key={idx}
              className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200 font-medium"
            >
              {comp}
            </span>
          ))}
          {competencies.length > 4 && (
            <span className="text-[11px] text-stone-500 self-center">
              +{competencies.length - 4}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
        <span>Emitido em: {issuedDate}</span>

        <div className="flex items-center gap-2">
          {verificationUrl && (
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-red-800 hover:text-red-900 font-medium"
            >
              <span>Verificar</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {onViewDetails && (
            <button
              type="button"
              onClick={onViewDetails}
              className="font-medium text-stone-900 hover:underline cursor-pointer"
            >
              Ver Detalhes
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
