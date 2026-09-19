import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface WaveformProps {
  id?: string;
  peaks?: number[]; // Normalized amplitude values 0.0 to 1.0
  progressPercentage?: number; // 0 to 100
  barCount?: number;
  height?: number;
  onSeek?: (percentage: number) => void;
  className?: string;
}

export const Waveform: React.FC<WaveformProps> = ({
  id = 'audio-waveform',
  peaks,
  progressPercentage = 0,
  barCount = 64,
  height = 56,
  onSeek,
  className,
}) => {
  // Generate deterministic synthetic waveform peaks if not supplied
  const defaultPeaks = React.useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      const x = (i / barCount) * Math.PI * 4;
      const noise = (Math.sin(x * 3) + Math.cos(x * 7) + 2) / 4;
      return Math.max(0.1, Math.min(1.0, noise));
    });
  }, [barCount]);

  const activePeaks = peaks || defaultPeaks;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
    onSeek(Math.round(percentage));
  };

  return (
    <div
      id={id}
      onClick={handleClick}
      role="progressbar"
      aria-valuenow={progressPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ height }}
      className={twMerge(
        'w-full relative flex items-center justify-between gap-0.5 bg-stone-950 border border-stone-800 rounded p-1 select-none overflow-hidden cursor-pointer group',
        className
      )}
    >
      {/* Playhead line */}
      <div
        id={`${id}-playhead`}
        style={{ left: `${progressPercentage}%` }}
        className="absolute top-0 bottom-0 w-0.5 bg-red-600 z-10 pointer-events-none transition-all duration-75"
      />

      {/* Amplitude Bars */}
      {activePeaks.map((peak, idx) => {
        const barPercent = (idx / activePeaks.length) * 100;
        const isPlayed = barPercent <= progressPercentage;

        return (
          <div
            key={idx}
            style={{ height: `${peak * 100}%` }}
            className={clsx(
              'flex-1 min-w-[2px] max-w-[4px] rounded-full transition-colors',
              isPlayed ? 'bg-anil-700' : 'bg-stone-700 group-hover:bg-stone-600'
            )}
          />
        );
      })}
    </div>
  );
};
