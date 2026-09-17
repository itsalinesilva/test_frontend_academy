import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface TimelineProps {
  id?: string;
  totalMeasures?: number; // default 16
  currentMeasure?: number; // e.g. 3.2
  bpm?: number;
  timeSignature?: string; // "4/4"
  onSeek?: (measure: number) => void;
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  id = 'daw-timeline',
  totalMeasures = 16,
  currentMeasure = 1.0,
  bpm = 120,
  timeSignature = '4/4',
  onSeek,
  className,
}) => {
  const measures = Array.from({ length: totalMeasures }, (_, i) => i + 1);
  const playheadPercent = Math.min(100, Math.max(0, ((currentMeasure - 1) / totalMeasures) * 100));

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    const targetMeasure = 1 + percent * totalMeasures;
    onSeek(Math.round(targetMeasure * 10) / 10);
  };

  return (
    <div
      id={id}
      className={twMerge(
        'w-full bg-stone-950 border-b border-stone-800 select-none flex flex-col font-mono text-stone-400',
        className
      )}
    >
      {/* Top info strip */}
      <div className="flex items-center justify-between px-3 py-1 text-[11px] border-b border-stone-900 bg-stone-950 text-stone-400">
        <div className="flex items-center gap-4">
          <span>{bpm} BPM</span>
          <span>{timeSignature}</span>
        </div>
        <div className="text-red-500 font-bold">
          Compasso: {currentMeasure.toFixed(1)}
        </div>
      </div>

      {/* Metric Ruler */}
      <div
        id={`${id}-ruler`}
        onClick={handleRulerClick}
        className="h-7 relative flex items-end cursor-pointer bg-stone-900/60 overflow-hidden"
      >
        {/* Playhead Needle */}
        <div
          id={`${id}-playhead`}
          style={{ left: `${playheadPercent}%` }}
          className="absolute top-0 bottom-0 w-0.5 bg-red-600 z-10 pointer-events-none transition-all duration-75"
        >
          <div className="w-2.5 h-2.5 -ml-1 -top-0.5 bg-red-600 rotate-45 pointer-events-none shadow-xs" />
        </div>

        {/* Measure markers */}
        {measures.map((m) => (
          <div
            key={m}
            style={{ width: `${100 / totalMeasures}%` }}
            className="h-full border-l border-stone-700/80 px-1 flex flex-col justify-between py-0.5 text-[10px]"
          >
            <span className="font-bold text-stone-300">{m}</span>
            <div className="flex justify-between w-full opacity-40">
              <span className="h-1.5 w-px bg-stone-600" />
              <span className="h-1 w-px bg-stone-700" />
              <span className="h-1 w-px bg-stone-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
