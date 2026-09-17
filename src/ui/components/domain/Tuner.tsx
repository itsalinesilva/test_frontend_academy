import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TunerProps {
  id?: string;
  detectedNote?: string; // e.g. "A4"
  detectedFreq?: number; // e.g. 441.2
  targetFreq?: number; // e.g. 440.0
  centsOffset?: number; // -50 to +50
  referenceA4?: number; // default 440
  toleranceCents?: number; // default 3
  isListening?: boolean;
  onToggleListening?: () => void;
  className?: string;
}

export const Tuner: React.FC<TunerProps> = ({
  id = 'chromatic-tuner',
  detectedNote = 'A4',
  detectedFreq = 440.0,
  targetFreq = 440.0,
  centsOffset = 0,
  referenceA4 = 440,
  toleranceCents = 3,
  isListening = false,
  onToggleListening,
  className,
}) => {
  const isInTune = Math.abs(centsOffset) <= toleranceCents;
  const isFlat = centsOffset < -toleranceCents;
  const isSharp = centsOffset > toleranceCents;

  // Meter needle rotation angle (-45deg to +45deg)
  const clampedCents = Math.min(50, Math.max(-50, centsOffset));
  const needleDeg = (clampedCents / 50) * 45;

  return (
    <div
      id={id}
      className={twMerge(
        'p-5 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 shadow-lg flex flex-col items-center select-none font-mono max-w-sm mx-auto',
        className
      )}
    >
      {/* Top Header: Calibration */}
      <div className="w-full flex items-center justify-between text-[11px] text-stone-500 border-b border-stone-800 pb-2">
        <span>A4 = {referenceA4} Hz</span>
        <span className={clsx(isListening ? 'text-red-500 font-bold' : 'text-stone-600')}>
          {isListening ? '● MICROFONE ATIVO' : 'PAUSADO'}
        </span>
      </div>

      {/* Analog Needle Gauge */}
      <div className="relative w-48 h-24 my-4 flex items-end justify-center overflow-hidden">
        {/* Scale Arc Background */}
        <div className="absolute top-2 w-40 h-40 rounded-full border-4 border-stone-800 border-t-transparent border-r-transparent border-l-transparent" />

        {/* Center In-Tune Mark */}
        <div className="absolute top-1 w-1 h-3 bg-emerald-500 rounded-full" />

        {/* Needle Indicator */}
        <div
          style={{ transform: `rotate(${needleDeg}deg)` }}
          className="absolute bottom-0 w-0.5 h-20 origin-bottom transition-transform duration-100 ease-out"
        >
          <div
            className={clsx(
              'w-full h-full rounded-t-full',
              isInTune ? 'bg-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-red-500'
            )}
          />
        </div>
      </div>

      {/* Cents readouts */}
      <div className="flex items-center gap-6 text-xs mb-3">
        <span className={clsx('font-bold', isFlat ? 'text-amber-400' : 'text-stone-600')}>
          ♭ FLAT
        </span>

        <span
          className={clsx(
            'text-sm font-bold px-2 py-0.5 rounded font-mono',
            isInTune ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'text-stone-300'
          )}
        >
          {centsOffset > 0 ? `+${centsOffset}c` : `${centsOffset}c`}
        </span>

        <span className={clsx('font-bold', isSharp ? 'text-red-400' : 'text-stone-600')}>
          SHARP ♯
        </span>
      </div>

      {/* Note Display & Detected Frequency */}
      <div className="text-center">
        <div
          className={clsx(
            'text-5xl font-extrabold font-serif tracking-tight',
            isInTune ? 'text-emerald-400' : 'text-stone-100'
          )}
        >
          {detectedNote}
        </div>
        <div className="text-xs text-stone-400 font-mono mt-1">
          {detectedFreq.toFixed(1)} Hz / Alvo: {targetFreq.toFixed(1)} Hz
        </div>
      </div>

      {/* Toggle Button */}
      {onToggleListening && (
        <button
          type="button"
          onClick={onToggleListening}
          className={clsx(
            'mt-5 w-full py-2 px-4 rounded text-xs font-bold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-800',
            isListening
              ? 'bg-stone-800 text-stone-200 hover:bg-stone-700'
              : 'bg-red-800 text-white hover:bg-red-900'
          )}
        >
          {isListening ? 'Desativar Afinador' : 'Iniciar Escuta'}
        </button>
      )}
    </div>
  );
};
