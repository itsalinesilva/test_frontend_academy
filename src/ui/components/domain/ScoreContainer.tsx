import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ZoomIn, ZoomOut, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '../base/Button';
import { alturaNaPauta, NoteItem } from './Staff';
import { Badge } from '../base/Badge';

export interface ScoreMeasure {
  measureNumber: number;
  /** "C4", "Bb3"; `_` é pausa. */
  notes: string[];
  /** Duração de cada nota, em semínimas. Sem ela, todas valem uma. */
  tempos?: number[];
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

                  <PautaDoCompasso
                    id={measureId}
                    clef={clef}
                    notas={measure.notes}
                    tempos={measure.tempos}
                    destaque={!!isCurrent}
                  />

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

/**
 * 🔴 UM COMPASSO, COM CADA NOTA NA ALTURA DELA (PZ-C).
 *
 * A versão anterior centralizava todas as cabeças de nota na mesma linha —
 * a partitura do Estúdio mostrava um desenho, e não a música. A altura segue
 * a mesma regra do `Staff` (`alturaNaPauta`), para que as duas pautas da
 * plataforma não possam discordar.
 */
const LINHAS_DO_COMPASSO = [30, 42, 54, 66, 78];
const SIMBOLO: Record<string, string> = { '#': '♯', b: '♭' };

function lerNota(nome: string): (Pick<NoteItem, 'step' | 'octave'> & { acidente: string }) | null {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(nome.trim());
  if (!m) return null;
  return { step: m[1] as NoteItem['step'], octave: Number(m[3]), acidente: m[2] };
}

const PautaDoCompasso: React.FC<{
  id: string;
  clef: 'treble' | 'bass' | 'alto';
  notas: string[];
  tempos?: number[];
  destaque: boolean;
}> = ({ id, clef, notas, tempos, destaque }) => {
  const duracoes = notas.map((_, i) => tempos?.[i] ?? 1);
  const total = duracoes.reduce((a, b) => a + b, 0) || 1;
  const cor = destaque ? '#1e3a8a' : '#1c1917';
  let acumulado = 0;

  const lidas = notas.map((n) => (n === '_' ? null : lerNota(n)));
  const alturas = lidas.map((l) => (l ? alturaNaPauta(l, clef) : 54));
  const topo = Math.min(0, ...alturas.map((y) => y - 34));
  const fundo = Math.max(108, ...alturas.map((y) => y + 34));

  return (
    <svg
      viewBox={`0 ${topo} 160 ${fundo - topo}`}
      className="h-20 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label={notas.map((n) => (n === '_' ? 'pausa' : n)).join(', ')}
    >
      {LINHAS_DO_COMPASSO.map((y) => (
        <line key={y} x1="0" y1={y} x2="160" y2={y} stroke="#a8a29e" strokeWidth="1.2" />
      ))}
      {notas.map((nome, i) => {
        const x = 12 + ((acumulado + duracoes[i] / 2) / total) * 136;
        acumulado += duracoes[i];
        const nota = lidas[i];
        if (!nota) {
          return (
            <text key={i} x={x - 4} y={60} fontSize="18" fill={cor} data-nota="pausa">
              𝄽
            </text>
          );
        }
        const y = alturas[i];
        const vazada = duracoes[i] >= 2;
        const haste = duracoes[i] < 4;
        const paraBaixo = y <= 54;
        const suplementares: number[] = [];
        for (let ly = 90; ly <= y; ly += 12) suplementares.push(ly);
        for (let ly = 18; ly >= y; ly -= 12) suplementares.push(ly);
        return (
          <g key={i} id={`${id}-note-${i}`} data-nota={nome} data-y={y}>
            <title>{nome}</title>
            {suplementares.map((ly) => (
              <line key={ly} x1={x - 9} y1={ly} x2={x + 9} y2={ly} stroke="#57534e" strokeWidth="1.2" />
            ))}
            {nota.acidente && (
              <text x={x - 17} y={y + 5} fontSize="14" fill={cor}>
                {SIMBOLO[nota.acidente]}
              </text>
            )}
            <ellipse
              cx={x}
              cy={y}
              rx="5.5"
              ry="4.2"
              fill={vazada ? 'white' : cor}
              stroke={cor}
              strokeWidth={vazada ? 1.5 : 0}
              transform={`rotate(-20 ${x} ${y})`}
            />
            {haste && (
              <line
                x1={paraBaixo ? x - 5 : x + 5}
                y1={y}
                x2={paraBaixo ? x - 5 : x + 5}
                y2={paraBaixo ? y + 28 : y - 28}
                stroke={cor}
                strokeWidth="1.3"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};
