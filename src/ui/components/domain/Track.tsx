import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TrackProps {
  id?: string;
  name: string;
  type?: 'AUDIO' | 'MIDI' | 'INSTRUMENT' | 'BUS';
  isMuted?: boolean;
  isSolo?: boolean;
  isArmed?: boolean;
  volumeDb?: number; // e.g. -6.0 dB
  pan?: number; // -100 to +100
  color?: string; // hex accent
  onToggleMute?: () => void;
  onToggleSolo?: () => void;
  onToggleArm?: () => void;
  onVolumeChange?: (db: number) => void;
  onPanChange?: (pan: number) => void;
  children?: React.ReactNode; // Clips / waveform lane
  className?: string;
}

export const Track: React.FC<TrackProps> = ({
  id = 'daw-track',
  name,
  type = 'AUDIO',
  isMuted = false,
  isSolo = false,
  isArmed = false,
  volumeDb = 0.0,
  pan = 0,
  color = '#991b1b',
  onToggleMute,
  onToggleSolo,
  onToggleArm,
  onVolumeChange,
  onPanChange,
  children,
  className,
}) => {
  return (
    <div
      id={id}
      className={twMerge(
        'flex items-stretch h-20 bg-stone-900 border-b border-stone-800 text-stone-200 select-none overflow-hidden font-sans',
        className
      )}
    >
      {/* Track Header / Controls Column */}
      <div className="w-56 bg-stone-950 border-r border-stone-800 p-2.5 flex flex-col justify-between shrink-0">
        {/* Track Title and Color Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs font-bold text-stone-100 truncate">{name}</span>
          </div>

          <span className="text-[10px] font-mono text-stone-500 uppercase">{type}</span>
        </div>

        {/* Buttons: Mute, Solo, Record Arm */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={`Mudo ${name}`}
              className={clsx(
                'w-6 h-6 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors',
                isMuted
                  ? 'bg-amber-600 text-stone-950'
                  : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
              )}
            >
              M
            </button>

            <button
              type="button"
              onClick={onToggleSolo}
              aria-label={`Solo ${name}`}
              className={clsx(
                'w-6 h-6 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors',
                isSolo
                  ? 'bg-yellow-400 text-stone-950'
                  : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
              )}
            >
              S
            </button>

            <button
              type="button"
              onClick={onToggleArm}
              aria-label={`Armar Gravação ${name}`}
              className={clsx(
                'w-6 h-6 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors',
                isArmed
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
              )}
            >
              R
            </button>
          </div>

          {/* Volume and Pan readout */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-stone-400">
            <button
              type="button"
              disabled={!onVolumeChange}
              onClick={() => onVolumeChange && onVolumeChange(0)}
              className={onVolumeChange ? 'cursor-pointer hover:text-stone-200' : ''}
              title="Voltar o volume a zero"
              aria-label="Voltar o volume a zero"
            >
              {volumeDb > 0 ? `+${volumeDb.toFixed(1)}` : volumeDb.toFixed(1)} dB
            </button>
            <span className="text-stone-600">|</span>
            <button
              type="button"
              disabled={!onPanChange}
              onClick={() => onPanChange && onPanChange(0)}
              className={onPanChange ? 'cursor-pointer hover:text-stone-200' : ''}
              title="Centralizar o panorama"
              aria-label="Centralizar o panorama"
            >
              {pan === 0 ? 'C' : pan < 0 ? `L${Math.abs(pan)}` : `R${pan}`}
            </button>
          </div>
        </div>
      </div>

      {/* Track Timeline Lane (Clips & Audio) */}
      <div className="flex-1 bg-stone-900/90 relative overflow-hidden flex items-center p-2">
        {children || (
          <div className="w-full h-12 bg-stone-800/40 rounded border border-stone-800/80 flex items-center px-4">
            <span className="text-[11px] text-stone-600 font-mono italic">
              Pista sem clipes de áudio ou MIDI
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
