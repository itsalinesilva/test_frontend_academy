import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface MixerChannelProps {
  id?: string;
  name: string;
  channelNumber: number;
  volumeDb?: number; // e.g. -6 to +6 dB (0 is unity)
  pan?: number; // -50 (L) to +50 (R)
  peakDb?: number; // current audio level meter
  isMuted?: boolean;
  isSolo?: boolean;
  onVolumeChange?: (db: number) => void;
  onPanChange?: (pan: number) => void;
  onToggleMute?: () => void;
  onToggleSolo?: () => void;
  className?: string;
}

export const MixerChannel: React.FC<MixerChannelProps> = ({
  id = 'mixer-channel',
  name,
  channelNumber,
  volumeDb = 0.0,
  pan = 0,
  peakDb = -18,
  isMuted = false,
  isSolo = false,
  onVolumeChange,
  onPanChange,
  onToggleMute,
  onToggleSolo,
  className,
}) => {
  // Meter height calculation from peakDb (-60dB to +6dB)
  const normalizedPeak = Math.min(100, Math.max(0, ((peakDb + 60) / 66) * 100));

  return (
    <div
      id={id}
      className={twMerge(
        'w-24 bg-stone-950 border border-stone-800 rounded-sm flex flex-col justify-between p-2 select-none font-mono text-stone-300 text-xs shrink-0',
        className
      )}
    >
      {/* Channel Header */}
      <div className="text-center pb-2 border-b border-stone-800">
        <span className="text-[10px] text-stone-500 block">CH {channelNumber}</span>
        <h5 className="font-bold text-stone-100 truncate text-[11px]">{name}</h5>
      </div>

      {/* Pan Control */}
      <div className="py-2 flex flex-col items-center">
        <span className="text-[9px] text-stone-500 uppercase">PAN</span>
        <button
          type="button"
          onClick={() => onPanChange && onPanChange(0)}
          disabled={!onPanChange}
          className="text-[10px] font-bold text-stone-300 hover:text-white cursor-pointer"
          title="Clique para centralizar (Pan 0)"
        >
          {pan === 0 ? 'C' : pan < 0 ? `L${Math.abs(pan)}` : `R${pan}`}
        </button>
      </div>

      {/* Fader & VU Peak Meter Section */}
      <div className="flex-1 flex justify-center items-stretch gap-2 my-2 min-h-[140px] px-1">
        {/* VU Peak Meter */}
        <div className="w-3 bg-stone-900 border border-stone-800 rounded-xs flex flex-col-reverse p-0.5 overflow-hidden">
          <div
            style={{ height: `${normalizedPeak}%` }}
            className={clsx(
              'w-full transition-all duration-75 rounded-xs',
              peakDb > 0 ? 'bg-red-600' : peakDb > -6 ? 'bg-amber-400' : 'bg-emerald-500'
            )}
          />
        </div>

        {/* Vertical Fader Track */}
        <div className="relative w-6 bg-stone-900 border border-stone-800 rounded flex items-center justify-center">
          {/* Unity 0dB mark */}
          <div className="absolute top-[30%] w-full h-px bg-stone-600 pointer-events-none" />

          {/* Fader Cap */}
          <input
            type="range"
            min={-60}
            max={6}
            step={0.5}
            value={volumeDb}
            onChange={(e) => onVolumeChange && onVolumeChange(parseFloat(e.target.value))}
            aria-label={`Fader de volume ${name}`}
            className="w-28 h-6 -rotate-90 origin-center cursor-pointer accent-stone-300 opacity-90"
          />
        </div>
      </div>

      {/* Numerical Volume Readout */}
      <div className="text-center text-[10px] py-1 bg-stone-900/60 rounded border border-stone-800/80 mb-2">
        <span className={clsx(volumeDb > 0 ? 'text-red-400 font-bold' : 'text-stone-300')}>
          {volumeDb > 0 ? `+${volumeDb.toFixed(1)}` : volumeDb.toFixed(1)} dB
        </span>
      </div>

      {/* Mute and Solo Buttons */}
      <div className="grid grid-cols-2 gap-1 pt-1 border-t border-stone-800">
        <button
          type="button"
          aria-label={isMuted ? 'Reativar o som deste canal' : 'Silenciar este canal'}
          aria-pressed={isMuted}
          onClick={onToggleMute}
          className={clsx(
            'py-1 text-[10px] font-bold rounded cursor-pointer transition-colors',
            isMuted
              ? 'bg-amber-600 text-stone-950 font-extrabold'
              : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
          )}
        >
          M
        </button>

        <button
          type="button"
          aria-label={isSolo ? 'Sair do modo solo' : 'Ouvir só este canal'}
          aria-pressed={isSolo}
          onClick={onToggleSolo}
          className={clsx(
            'py-1 text-[10px] font-bold rounded cursor-pointer transition-colors',
            isSolo
              ? 'bg-yellow-400 text-stone-950 font-extrabold'
              : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
          )}
        >
          S
        </button>
      </div>
    </div>
  );
};
