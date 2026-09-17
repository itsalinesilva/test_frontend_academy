import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Sliders, RotateCcw, AlertTriangle } from 'lucide-react';
import { Badge } from '../base/Badge';

export interface ToolPanelProps {
  id: string; // Mandatory ID
  toolName: string;
  toolCategory: 'sintese' | 'afinacao' | 'metronomo' | 'analise' | 'teoria';
  engineSource?: string;
  status?: 'ativo' | 'calibrando' | 'em_espera' | 'erro';
  warningMessage?: string;
  onReset?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const ToolPanel: React.FC<ToolPanelProps> = ({
  id,
  toolName,
  toolCategory,
  engineSource = 'Engine Adapter (WebAudio / Local DSP)',
  status = 'ativo',
  warningMessage,
  onReset,
  children,
  footer,
  className,
}) => {
  const statusBadges = {
    ativo: <Badge id={`${id}-status`} variant="success" size="sm" hasDot>Operacional</Badge>,
    calibrando: <Badge id={`${id}-status`} variant="warning" size="sm" hasDot>Calibrando</Badge>,
    em_espera: <Badge id={`${id}-status`} variant="neutral" size="sm" hasDot>Standby</Badge>,
    erro: <Badge id={`${id}-status`} variant="error" size="sm" hasDot>Falha de DSP</Badge>,
  };

  return (
    <div
      id={id}
      className={twMerge(
        clsx(
          'w-full bg-white border border-stone-200 rounded-lg shadow-xs overflow-hidden flex flex-col',
          className
        )
      )}
    >
      {/* Header */}
      <div
        id={`${id}-header`}
        className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-stone-200 text-stone-700 rounded" aria-hidden="true">
            <Sliders className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h3 id={`${id}-title`} className="text-sm font-semibold text-stone-900 truncate">
                {toolName}
              </h3>
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 bg-stone-200/60 px-1.5 py-0.5 rounded">
                {toolCategory}
              </span>
            </div>
            <span id={`${id}-engine-source`} className="text-[11px] text-stone-400 font-mono truncate">
              {engineSource}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {statusBadges[status]}
          {onReset && (
            <button
              id={`${id}-reset-btn`}
              type="button"
              onClick={onReset}
              title="Resetar parâmetros do instrumento"
              aria-label="Resetar parâmetros"
              className="p-1.5 rounded hover:bg-stone-200 text-stone-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Warning banner */}
      {warningMessage && (
        <div
          id={`${id}-warning`}
          className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Body / Tool Controls */}
      <div id={`${id}-body`} className="p-5 text-sm text-stone-800 space-y-4">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div
          id={`${id}-footer`}
          className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500"
        >
          {footer}
        </div>
      )}
    </div>
  );
};
