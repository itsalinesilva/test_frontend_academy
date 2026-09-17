import React from 'react';
import { Mic, Square, RotateCcw, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface RecorderProps {
  id?: string;
  isRecording?: boolean;
  isArmed?: boolean;
  elapsedSeconds?: number;
  inputLevel?: number; // 0 to 100
  selectedDeviceName?: string;
  hasRecordedTake?: boolean;
  onToggleArm?: () => void;
  onStartRecord?: () => void;
  onStopRecord?: () => void;
  onDiscardTake?: () => void;
  onSaveTake?: () => void;
  className?: string;
}

export const Recorder: React.FC<RecorderProps> = ({
  id = 'audio-recorder',
  isRecording = false,
  isArmed = true,
  elapsedSeconds = 0,
  inputLevel = 0,
  selectedDeviceName = 'Microfone Padrão do Sistema (48kHz / 24-bit)',
  hasRecordedTake = false,
  onToggleArm,
  onStartRecord,
  onStopRecord,
  onDiscardTake,
  onSaveTake,
  className,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    const tenths = Math.floor((secs % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}.${tenths}`;
  };

  return (
    <div
      id={id}
      className={twMerge(
        'p-5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 select-none shadow-xl flex flex-col items-center font-mono max-w-md mx-auto gap-4',
        isRecording && 'border-red-600/80 ring-2 ring-red-800/30',
        className
      )}
    >
      {/* Device Info & Status Header */}
      <div className="w-full flex items-center justify-between text-[11px] text-stone-500 border-b border-stone-900 pb-2">
        <div className="flex items-center gap-1.5 truncate">
          <Mic className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="truncate">{selectedDeviceName}</span>
        </div>

        <button
          type="button"
          onClick={onToggleArm}
          disabled={isRecording || !onToggleArm}
          className={clsx(
            'px-2 py-0.5 rounded text-[10px] font-bold shrink-0 transition-colors',
            isRecording
              ? 'bg-red-600 text-white animate-pulse cursor-default'
              : isArmed
              ? 'bg-amber-950 text-amber-400 border border-amber-800 cursor-pointer hover:bg-amber-900'
              : 'bg-stone-900 text-stone-500 cursor-pointer hover:bg-stone-800'
          )}
        >
          {isRecording ? '● GRAVANDO' : isArmed ? 'ARMADO' : 'STANDBY'}
        </button>
      </div>

      {/* Recording Timer */}
      <div className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-stone-100">
        {formatTime(elapsedSeconds)}
      </div>

      {/* Real-Time VU Meter */}
      <div className="w-full space-y-1">
        <div className="flex justify-between text-[10px] text-stone-500">
          <span>Nível de Entrada</span>
          <span>{Math.round(inputLevel)}%</span>
        </div>
        <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden border border-stone-800 flex">
          <div
            style={{ width: `${Math.min(100, inputLevel)}%` }}
            className={clsx(
              'h-full transition-all duration-75',
              inputLevel > 85 ? 'bg-red-500' : inputLevel > 60 ? 'bg-amber-400' : 'bg-emerald-500'
            )}
          />
        </div>
      </div>

      {/* Main Record Action Button */}
      <div className="flex items-center justify-center gap-4 pt-2">
        {!isRecording ? (
          <button
            type="button"
            onClick={onStartRecord}
            disabled={!isArmed}
            aria-label="Iniciar Gravação"
            className="w-16 h-16 rounded-full bg-red-800 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-red-900"
          >
            <div className="w-6 h-6 rounded-full bg-white" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopRecord}
            aria-label="Interromper Gravação"
            className="w-16 h-16 rounded-full bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-stone-600"
          >
            <Square className="w-6 h-6 fill-white" />
          </button>
        )}
      </div>

      {/* Take Actions (Save / Discard) */}
      {hasRecordedTake && !isRecording && (
        <div className="w-full pt-3 border-t border-stone-900 flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onDiscardTake}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Descartar Take</span>
          </button>

          <button
            type="button"
            onClick={onSaveTake}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-red-800 hover:bg-red-900 text-white font-bold cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Salvar como Evidência</span>
          </button>
        </div>
      )}
    </div>
  );
};
