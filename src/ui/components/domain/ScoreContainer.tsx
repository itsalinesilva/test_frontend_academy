import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ZoomIn, ZoomOut, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '../base/Button';
import { Badge } from '../base/Badge';

export interface ScoreMeasure {
  measureNumber: number;
  notes: string[];
  chords?: string;
  isCurrent?: boolean;
}

export interface ScoreContainerProps {
  id: string; // Mandatory ID
  title: string;
  composer?: string;
  clef?: 'treble' | 'bass' | 'alto';
  keySignature?: string; // e.g. 'C Major', 'G Major', 'D Minor'
  timeSignature?: string; // e.g. '4/4', '3/4', '6/8'
  tempoBpm?: number;
  tempo?: number;
  measures?: ScoreMeasure[];
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onResetPlayback?: () => void;
  className?: string;
}

export const ScoreContainer: React.FC<ScoreContainerProps> = ({
  id,
  title,
  composer,
  clef = 'treble',
  keySignature = 'C Maior (0♯, 0♭)',
  timeSignature = '4/4',
  tempoBpm: explicitTempoBpm,
  tempo,
  measures = [
    { measureNumber: 1, notes: ['C4', 'E4', 'G4', 'C5'], chords: 'C', isCurrent: true },
    { measureNumber: 2, notes: ['D4', 'F4', 'A4', 'C5'], chords: 'Dm7', isCurrent: false },
    { measureNumber: 3, notes: ['G3', 'B3', 'D4', 'F4'], chords: 'G7', isCurrent: false },
    { measureNumber: 4, notes: ['C4', 'E4', 'G4', 'C5'], chords: 'C', isCurrent: false },
  ],
  isPlaying = false,
  onTogglePlay,
  onResetPlayback,
  className,
}) => {
  const tempoBpm = tempo ?? explicitTempoBpm ?? 108;
  const [zoomLevel, setZoomLevel] = useState(100);

  const clefSymbols = {
    treble: '𝄞',
    bass: '𝄢',
    alto: '𝄡',
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
      {/* Score Header & Transport Toolbar */}
      <div
        id={`${id}-toolbar`}
        className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col">
            <span id={`${id}-title`} className="font-serif font-bold text-stone-900 text-sm truncate">
              {title}
            </span>
            {composer && (
              <span id={`${id}-composer`} className="text-[11px] text-stone-500 font-sans truncate">
                {composer}
              </span>
            )}
          </div>
          <Badge id={`${id}-clef-badge`} variant="neutral" size="sm">
            Clave: {clef === 'treble' ? 'Sol (G)' : clef === 'bass' ? 'Fá (F)' : 'Dó (C)'}
          </Badge>
          <Badge id={`${id}-key-badge`} variant="neutral" size="sm">
            {keySignature}
          </Badge>
        </div>

        {/* Transport & Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-mono text-stone-700 bg-stone-100 px-2 py-1 rounded border border-stone-200">
            <span>♩ =</span>
            <span id={`${id}-tempo-bpm`} className="font-semibold text-stone-900">{tempoBpm}</span>
            <span className="text-stone-400 text-[10px]">BPM</span>
          </div>

          {onTogglePlay && (
            <Button
              id={`${id}-play-btn`}
              size="sm"
              variant={isPlaying ? 'primary' : 'outline'}
              onClick={onTogglePlay}
              leadingIcon={isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            >
              {isPlaying ? 'Pausar' : 'Reproduzir'}
            </Button>
          )}

          {onResetPlayback && (
            <button
              id={`${id}-reset-btn`}
              type="button"
              onClick={onResetPlayback}
              title="Voltar ao início (Compasso 1)"
              aria-label="Reiniciar partitura"
              className="p-1.5 rounded hover:bg-stone-200 text-stone-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="h-4 w-px bg-stone-300 mx-1" aria-hidden="true" />

          {/* Zoom controls */}
          <button
            id={`${id}-zoom-out-btn`}
            type="button"
            onClick={() => setZoomLevel((prev) => Math.max(60, prev - 10))}
            aria-label="Diminuir zoom"
            className="p-1.5 rounded hover:bg-stone-200 text-stone-600 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span id={`${id}-zoom-label`} className="font-mono text-stone-500 text-[10px] w-8 text-center">
            {zoomLevel}%
          </span>
          <button
            id={`${id}-zoom-in-btn`}
            type="button"
            onClick={() => setZoomLevel((prev) => Math.min(150, prev + 10))}
            aria-label="Aumentar zoom"
            className="p-1.5 rounded hover:bg-stone-200 text-stone-600 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Music Staff Canvas Area */}
      <div
        id={`${id}-canvas-scroll`}
        className="p-6 bg-white overflow-x-auto select-none transition-transform origin-top-left"
        style={{ transform: `scale(${zoomLevel / 100})` }}
      >
        <div id={`${id}-staff-system`} className="min-w-[700px] flex items-center relative py-4">
          {/* Clef & Key Signature Header */}
          <div className="flex items-center gap-3 pr-4 border-r-2 border-stone-900 shrink-0">
            <span id={`${id}-clef-glyph`} className="text-4xl leading-none font-serif text-stone-900 select-none">
              {clefSymbols[clef]}
            </span>
            <div className="flex flex-col items-center justify-center font-serif font-bold text-sm leading-tight text-stone-900">
              <span id={`${id}-time-num`}>{timeSignature.split('/')[0]}</span>
              <span id={`${id}-time-den`}>{timeSignature.split('/')[1]}</span>
            </div>
          </div>

          {/* Measures */}
          <div className="flex-1 grid grid-cols-4 gap-0 divide-x-2 divide-stone-900 relative">
            {measures.map((measure) => {
              const isCurrent = measure.isCurrent;
              const measureId = `${id}-measure-${measure.measureNumber}`;

              return (
                <div
                  key={measure.measureNumber}
                  id={measureId}
                  className={clsx(
                    'relative h-28 px-3 py-2 flex flex-col justify-between transition-colors',
                    isCurrent ? 'bg-red-50/40' : 'hover:bg-stone-50/50'
                  )}
                >
                  {/* Measure Number & Chord Symbol */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-stone-500">
                    <span id={`${measureId}-num`}>c.{measure.measureNumber}</span>
                    {measure.chords && (
                      <span id={`${measureId}-chord`} className="font-bold text-stone-900 font-sans text-xs">
                        {measure.chords}
                      </span>
                    )}
                  </div>

                  {/* 5 Staff Lines */}
                  <div className="relative h-12 w-full flex flex-col justify-between py-1" aria-hidden="true">
                    <div className="h-px bg-stone-400 w-full" />
                    <div className="h-px bg-stone-400 w-full" />
                    <div className="h-px bg-stone-400 w-full" />
                    <div className="h-px bg-stone-400 w-full" />
                    <div className="h-px bg-stone-400 w-full" />

                    {/* Visual note heads */}
                    <div className="absolute inset-0 flex items-center justify-around">
                      {measure.notes.map((note, noteIdx) => (
                        <div
                          key={noteIdx}
                          id={`${measureId}-note-${noteIdx}`}
                          className={clsx(
                            'w-3 h-2.5 rounded-full rotate-[-20deg] flex items-center justify-center shadow-xs',
                            isCurrent ? 'bg-anil-800' : 'bg-stone-900'
                          )}
                          title={note}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Playhead indicator bar */}
                  {isCurrent && (
                    <div
                      id={`${measureId}-playhead`}
                      className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-red-600 pointer-events-none shadow-xs"
                      aria-label="Cursor de compasso ativo"
                    />
                  )}

                  <div className="text-[10px] font-mono text-stone-400 text-center truncate">
                    {measure.notes.join(' - ')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Final double barline */}
          <div className="h-28 w-2 border-r-4 border-l border-stone-900 ml-1 shrink-0" aria-hidden="true" />
        </div>
      </div>

      {/* Footer accessibility notes */}
      <div className="px-4 py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
        <span>Atalhos: [Espaço] Tocar/Pausar • [← / →] Navegar compassos • [1-8] Oitavas</span>
        <span className="font-mono text-stone-400">Notação Vetorial Estrita</span>
      </div>
    </div>
  );
};
