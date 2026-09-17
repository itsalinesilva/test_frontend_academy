import React from 'react';
import { Undo2, Redo2, ZoomIn, ZoomOut, Play } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type NoteDuration = 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth';
export type Accidental = 'sharp' | 'flat' | 'natural' | 'none';

export interface NotationToolbarProps {
  id?: string;
  selectedDuration?: NoteDuration;
  selectedAccidental?: Accidental;
  onSelectDuration?: (duration: NoteDuration) => void;
  onSelectAccidental?: (accidental: Accidental) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onPlay?: () => void;
  className?: string;
}

export const NotationToolbar: React.FC<NotationToolbarProps> = ({
  id = 'notation-toolbar',
  selectedDuration = 'quarter',
  selectedAccidental = 'none',
  onSelectDuration,
  onSelectAccidental,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onPlay,
  className,
}) => {
  const durations: { id: NoteDuration; label: string; symbol: string }[] = [
    { id: 'whole', label: 'Semibreve', symbol: '𝅝' },
    { id: 'half', label: 'Mínima', symbol: '𝅗𝅥' },
    { id: 'quarter', label: 'Semínima', symbol: '𝅘𝅥' },
    { id: 'eighth', label: 'Colcheia', symbol: '𝅘𝅥𝅮' },
    { id: 'sixteenth', label: 'Semicolcheia', symbol: '𝅘𝅥𝅯' },
  ];

  const accidentals: { id: Accidental; label: string; symbol: string }[] = [
    { id: 'flat', label: 'Bemol', symbol: '♭' },
    { id: 'natural', label: 'Bequadro', symbol: '♮' },
    { id: 'sharp', label: 'Sustenido', symbol: '♯' },
  ];

  return (
    <div
      id={id}
      role="toolbar"
      aria-label="Ferramentas de Notação Musical"
      className={twMerge(
        'flex items-center justify-between p-2 bg-white border border-stone-200 rounded-lg shadow-xs select-none gap-2 flex-wrap',
        className
      )}
    >
      {/* Note Durations Group */}
      <div className="flex items-center gap-1 border-r border-stone-200 pr-2">
        {durations.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onSelectDuration && onSelectDuration(d.id)}
            title={d.label}
            aria-pressed={selectedDuration === d.id}
            className={clsx(
              'w-8 h-8 rounded flex items-center justify-center text-lg font-serif transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-anil-800',
              selectedDuration === d.id
                ? 'bg-anil-800 text-white font-bold'
                : 'text-stone-700 hover:bg-stone-100'
            )}
          >
            {d.symbol}
          </button>
        ))}
      </div>

      {/* Accidentals Group */}
      <div className="flex items-center gap-1 border-r border-stone-200 pr-2">
        {accidentals.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() =>
              onSelectAccidental &&
              onSelectAccidental(selectedAccidental === a.id ? 'none' : a.id)
            }
            title={a.label}
            aria-pressed={selectedAccidental === a.id}
            className={clsx(
              'w-8 h-8 rounded flex items-center justify-center text-base font-serif transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-anil-800',
              selectedAccidental === a.id
                ? 'bg-anil-800 text-white font-bold'
                : 'text-stone-700 hover:bg-stone-100'
            )}
          >
            {a.symbol}
          </button>
        ))}
      </div>

      {/* History / Zoom / Play Actions */}
      <div className="flex items-center gap-1">
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            title="Desfazer (Ctrl+Z)"
            aria-label="Desfazer"
            className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100 cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
          </button>
        )}

        {onRedo && (
          <button
            type="button"
            onClick={onRedo}
            title="Refazer (Ctrl+Y)"
            aria-label="Refazer"
            className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100 cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        )}

        {onZoomIn && (
          <button
            type="button"
            onClick={onZoomIn}
            aria-label="Aumentar zoom"
            className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100 cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        )}

        {onZoomOut && (
          <button
            type="button"
            onClick={onZoomOut}
            aria-label="Diminuir zoom"
            className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100 cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        )}

        {onPlay && (
          <button
            type="button"
            onClick={onPlay}
            aria-label="Reproduzir partitura"
            className="ml-2 px-3 py-1 bg-anil-800 hover:bg-anil-900 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-anil-800"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Tocar</span>
          </button>
        )}
      </div>
    </div>
  );
};
