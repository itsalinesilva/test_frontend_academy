import React, { useCallback, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { Play, Square, CheckCircle2, XCircle, Info, ScrollText, AlertTriangle, Lightbulb, Loader2, ChevronLeft, ChevronRight, Clapperboard } from 'lucide-react';
import type { LessonBlock } from '../../../domain/academy';
import { Card } from '../base/Card';
import { Button } from '../base/Button';
import { Staff } from '../domain/Staff';
import { InstrumentKeyboard } from '../domain/InstrumentKeyboard';
import { webAudioSynth } from '../../../infrastructure/audio/synth';
import { engineGateway } from '../../../adapters/engines/gateway/engine-gateway';

/**
 * Blocos interativos da lição.
 *
 * PRINCÍPIO: nenhum bloco aqui simula resultado. Toda análise vem do
 * `RuleBasedTheoryEngineAdapter` (real, coberto por 4 testes) e todo som vem
 * do `WebAudioSynth` (síntese real). Se o motor não souber responder, o
 * bloco diz isso — não inventa um valor plausível.
 *
 * Reconecta três componentes que estavam órfãos: `Staff`,
 * `InstrumentKeyboard` e, indiretamente, o sintetizador.
 */

// ------------------------------------------------------------ utilitários ---

const NOTE_SEMITONES: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

/** Converte notação científica (ex.: "C#4") em frequência temperada. */
export function noteToFrequency(note: string): number | null {
  const match = note.trim().match(/^([A-Ga-g][#b]?)(-?\d)$/);
  if (!match) return null;
  const step = match[1][0].toUpperCase() + match[1].slice(1);
  const semitone = NOTE_SEMITONES[step];
  if (semitone === undefined) return null;
  const midi = (Number(match[2]) + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const QUALITY_PT: Record<string, string> = {
  MAJOR: 'maior', MINOR: 'menor', DIMINISHED: 'diminuto', AUGMENTED: 'aumentado',
};
const INVERSION_PT: Record<string, string> = {
  ROOT_POSITION: 'estado fundamental',
  FIRST_INVERSION: 'primeira inversão',
  SECOND_INVERSION: 'segunda inversão',
};

/** Converte "C#4" no `NoteItem` que o componente `Staff` consome. */
function toNoteItem(note: string, index: number) {
  const m = note.trim().match(/^([A-Ga-g])([#b]?)(-?\d)$/);
  if (!m) return null;
  return {
    id: `n-${index}-${note}`,
    step: m[1].toUpperCase() as 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B',
    octave: Number(m[3]),
    duration: 'quarter' as const,
    accidental: m[2] === '#' ? ('sharp' as const) : m[2] === 'b' ? ('flat' as const) : undefined,
  };
}

function noteToMidi(note: string): number | null {
  const freq = noteToFrequency(note);
  return freq === null ? null : Math.round(69 + 12 * Math.log2(freq / 440));
}

/** Toca notas em sequência ou simultaneamente. Resolve ao fim da execução. */
async function play(notes: string[], mode: 'SEQUENCE' | 'CHORD', bpm = 90): Promise<void> {
  const freqs = notes.map(noteToFrequency).filter((f): f is number => f !== null);
  if (freqs.length === 0) return;

  if (mode === 'CHORD') {
    webAudioSynth.playChord(freqs, 1.8);
    await new Promise((r) => setTimeout(r, 1800));
    return;
  }
  const step = 60 / bpm;
  webAudioSynth.playSequence(freqs, step);
  await new Promise((r) => setTimeout(r, freqs.length * step * 1000));
}

// --------------------------------------------------------- botão de escuta ---

const ListenButton: React.FC<{
  notes: string[];
  mode: 'SEQUENCE' | 'CHORD';
  bpm?: number;
  label?: string;
  variant?: 'primary' | 'outline';
}> = ({ notes, mode, bpm, label, variant = 'outline' }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handle = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await play(notes, mode, bpm);
    } finally {
      setIsPlaying(false);
    }
  }, [notes, mode, bpm, isPlaying]);

  return (
    <Button variant={variant} size="sm" onClick={handle} disabled={isPlaying}>
      {isPlaying ? (
        <Square className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Play className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
      )}
      {label || (mode === 'CHORD' ? 'Ouvir acorde' : 'Ouvir')}
    </Button>
  );
};

// ------------------------------------------------------------- laboratórios ---

const LabShell: React.FC<{ title: string; children: React.ReactNode; footer?: React.ReactNode }> = ({
  title,
  children,
  footer,
}) => (
  <Card variant="muted" padding="md" className="space-y-3 border-stone-200 not-prose">
    <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
      Laboratório · {title}
    </p>
    {children}
    {footer && <div className="border-t border-stone-200 pt-2.5 text-xs text-stone-600">{footer}</div>}
  </Card>
);

/** Intervalo: ouvir separado, ouvir junto, e analisar no motor de teoria. */
const IntervalLab: React.FC<{ block: Extract<LessonBlock, { kind: 'INTERVAL_LAB' }> }> = ({ block }) => {
  const [analysis, setAnalysis] = useState<{ name: string; semitones: number; quality: string; isConsonant: boolean } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [failed, setFailed] = useState(false);

  const analyze = useCallback(async () => {
    setIsAnalyzing(true);
    setFailed(false);
    try {
      const r = await engineGateway.getTheoryEngine().analyzeInterval(block.lowerNote, block.upperNote);
      setAnalysis({ name: r.name, semitones: r.semitones, quality: r.quality, isConsonant: r.isConsonant });
    } catch {
      setFailed(true);
    } finally {
      setIsAnalyzing(false);
    }
  }, [block.lowerNote, block.upperNote]);

  return (
    <LabShell title={block.title}>
      {block.prompt && <p className="text-xs text-stone-700">{block.prompt}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-white px-2 py-1 font-mono text-sm font-bold text-stone-900 ring-1 ring-stone-200">
          {block.lowerNote}
        </span>
        <span className="text-stone-400">→</span>
        <span className="rounded bg-white px-2 py-1 font-mono text-sm font-bold text-stone-900 ring-1 ring-stone-200">
          {block.upperNote}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <ListenButton notes={[block.lowerNote, block.upperNote]} mode="SEQUENCE" label="Ouvir melódico" />
        <ListenButton notes={[block.lowerNote, block.upperNote]} mode="CHORD" label="Ouvir harmônico" />
        <Button variant="primary" size="sm" onClick={analyze} disabled={isAnalyzing}>
          {isAnalyzing && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
          Analisar
        </Button>
      </div>

      <div aria-live="polite">
        {failed && (
          <p className="text-xs text-amber-800">
            O motor de teoria não conseguiu analisar este intervalo.
          </p>
        )}
        {analysis && (
          <dl className="grid grid-cols-3 gap-2 rounded-md bg-white p-2.5 text-xs ring-1 ring-stone-200">
            <div>
              <dt className="text-[10px] uppercase text-stone-500">Intervalo</dt>
              <dd className="font-serif font-bold text-stone-900">{analysis.name}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-stone-500">Semitons</dt>
              <dd className="font-mono font-bold text-stone-900">{analysis.semitones}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase text-stone-500">Classificação</dt>
              <dd className="font-mono text-stone-900">
                {analysis.isConsonant ? 'consonante' : 'dissonante'}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </LabShell>
  );
};

/** Acorde: ouvir e identificar tríade pelo motor. */
const ChordLab: React.FC<{ block: Extract<LessonBlock, { kind: 'CHORD_LAB' }> }> = ({ block }) => {
  const [result, setResult] = useState<{ root: string; quality: string; inversion: string; romanNumeral?: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const r = await engineGateway.getTheoryEngine().analyzeChord(block.notes);
      // O motor devolve a fundamental como altura ("C4"). Um acorde, porém,
      // nomeia-se pela CLASSE de altura: diz-se "Dó maior", nunca "Dó4 maior".
      setResult({
        root: r.root.replace(/-?\d+$/, ''),
        quality: r.quality,
        inversion: r.inversion,
        romanNumeral: r.romanNumeral,
      });
    } catch {
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [block.notes]);

  return (
    <LabShell title={block.title}>
      {block.prompt && <p className="text-xs text-stone-700">{block.prompt}</p>}
      <div className="flex flex-wrap gap-1.5">
        {block.notes.map((n) => (
          <span
            key={n}
            className="rounded bg-white px-2 py-1 font-mono text-sm font-bold text-stone-900 ring-1 ring-stone-200"
          >
            {n}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <ListenButton notes={block.notes} mode="CHORD" />
        <ListenButton notes={block.notes} mode="SEQUENCE" label="Ouvir arpejado" />
        <Button variant="primary" size="sm" onClick={analyze} disabled={isAnalyzing}>
          {isAnalyzing && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
          Identificar
        </Button>
      </div>
      <div aria-live="polite">
        {result && (
          <div className="space-y-1 rounded-md bg-white p-2.5 text-xs ring-1 ring-stone-200">
            <p>
              <span className="font-serif text-base font-bold text-stone-900">
                {result.root} {QUALITY_PT[result.quality] ?? result.quality.toLowerCase()}
              </span>
              {result.romanNumeral && (
                <span className="ml-2 font-mono text-stone-600">grau {result.romanNumeral}</span>
              )}
            </p>
            <p className="font-mono text-[11px] text-stone-500">{INVERSION_PT[result.inversion] ?? result.inversion}</p>
          </div>
        )}
      </div>
    </LabShell>
  );
};

/** Escala: gerada pela fórmula do motor, tocável e visível no teclado. */
const ScaleLab: React.FC<{ block: Extract<LessonBlock, { kind: 'SCALE_LAB' }> }> = ({ block }) => {
  const [notes, setNotes] = useState<string[]>([]);
  const [accidentals, setAccidentals] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    engineGateway
      .getTheoryEngine()
      .generateScale(block.tonic, block.mode)
      .then((r) => {
        if (!alive) return;
        setNotes(r.notes);
        setAccidentals(r.keySignatureSharpsOrFlats);
      })
      .catch(() => alive && setNotes([]));
    return () => {
      alive = false;
    };
  }, [block.tonic, block.mode]);

  const withOctave = notes.map((n, i) => `${n}${4 + (i === notes.length - 1 ? 1 : 0)}`);
  const midi = withOctave.map(noteToMidi).filter((m): m is number => m !== null);

  return (
    <LabShell
      title={block.title}
      footer={
        accidentals === null ? undefined : (
          <>
            Armadura:{' '}
            <span className="font-mono">
              {accidentals === 0
                ? 'sem acidentes'
                : `${Math.abs(accidentals)} ${accidentals > 0 ? 'sustenido' : 'bemol'}${Math.abs(accidentals) > 1 ? 's' : ''}`}
            </span>
          </>
        )
      }
    >
      {notes.length === 0 ? (
        <p className="text-xs text-stone-500">Gerando escala…</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {notes.map((n, i) => (
              <span
                key={`${n}-${i}`}
                className="rounded bg-white px-2 py-1 font-mono text-sm font-bold text-stone-900 ring-1 ring-stone-200"
              >
                {n}
              </span>
            ))}
          </div>
          <ListenButton notes={withOctave} mode="SEQUENCE" label="Ouvir a escala" variant="primary" />
          <InstrumentKeyboard id={`${block.id}-kb`} startOctave={4} octavesCount={2} activePitches={midi} />
        </>
      )}
    </LabShell>
  );
};

/** Verificação de leitura no meio do texto, com explicação e fonte. */
const Checkpoint: React.FC<{ block: Extract<LessonBlock, { kind: 'CHECKPOINT' }> }> = ({ block }) => {
  const [chosen, setChosen] = useState<number | null>(null);
  const answered = chosen !== null;
  const correct = chosen === block.correctIndex;

  return (
    <Card variant="default" padding="md" className="space-y-3 border-stone-300 not-prose">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
        Verificação de leitura
      </p>
      <p className="text-sm font-medium text-stone-900">{block.question}</p>

      <div role="group" aria-label={block.question} className="grid gap-1.5 sm:grid-cols-2">
        {block.options.map((opt, i) => {
          const isChosen = chosen === i;
          const isAnswer = i === block.correctIndex;
          return (
            <button
              key={opt}
              type="button"
              disabled={answered}
              onClick={() => setChosen(i)}
              aria-pressed={isChosen}
              className={clsx(
                'rounded-md border px-3 py-2 text-left text-xs transition-colors',
                !answered && 'border-stone-200 bg-white hover:border-stone-400',
                answered && isAnswer && 'border-emerald-600 bg-emerald-50 text-emerald-900',
                answered && isChosen && !isAnswer && 'border-red-700 bg-red-50 text-red-900',
                answered && !isChosen && !isAnswer && 'border-stone-200 bg-white text-stone-400'
              )}
            >
              {answered && isAnswer && <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />}
              {answered && isChosen && !isAnswer && <XCircle className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />}
              {opt}
            </button>
          );
        })}
      </div>

      <div aria-live="polite">
        {answered && (
          <div
            className={clsx(
              'space-y-1 rounded-md p-2.5 text-xs',
              correct ? 'bg-emerald-50 text-emerald-900' : 'bg-stone-100 text-stone-800'
            )}
          >
            <p className="font-semibold">{correct ? 'Correto.' : 'Ainda não.'}</p>
            <p className="leading-relaxed">{block.explanation}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// ------------------------------------------------------------- diagramas ---

const CircleOfFifths: React.FC<{ highlight?: string[] }> = ({ highlight = [] }) => {
  const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
  const R = 86;
  return (
    <svg viewBox="0 0 220 220" className="mx-auto h-56 w-56" role="img" aria-label="Ciclo das quintas">
      <circle cx="110" cy="110" r={R} fill="none" stroke="#e7e5e4" strokeWidth="1.5" />
      {keys.map((k, i) => {
        const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
        const x = 110 + R * Math.cos(angle);
        const y = 110 + R * Math.sin(angle);
        const on = highlight.includes(k);
        return (
          <g key={k}>
            <circle cx={x} cy={y} r="15" fill={on ? '#991b1b' : '#ffffff'} stroke={on ? '#6D1D2D' : '#d6d3d1'} strokeWidth="1.5" />
            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              className="font-mono"
              fontSize="11"
              fontWeight="700"
              fill={on ? '#ffffff' : '#44403c'}
            >
              {k}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const ToneSemitone: React.FC = () => {
  const steps = [
    { from: 'C', to: 'D', tone: true }, { from: 'D', to: 'E', tone: true },
    { from: 'E', to: 'F', tone: false }, { from: 'F', to: 'G', tone: true },
    { from: 'G', to: 'A', tone: true }, { from: 'A', to: 'B', tone: true },
    { from: 'B', to: 'C', tone: false },
  ];
  return (
    <div className="flex items-end justify-center gap-1 overflow-x-auto py-2" role="img" aria-label="Distribuição de tons e semitons na escala natural">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <span className="rounded bg-white px-2 py-1 font-mono text-xs font-bold text-stone-900 ring-1 ring-stone-200">
            {s.from}
          </span>
          <span
            className={clsx(
              'mb-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold',
              s.tone ? 'bg-stone-200 text-stone-700' : 'bg-red-800 text-white'
            )}
          >
            {s.tone ? 'T' : '½'}
          </span>
          {i === steps.length - 1 && (
            <span className="rounded bg-white px-2 py-1 font-mono text-xs font-bold text-stone-900 ring-1 ring-stone-200">
              {s.to}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/** Lâminas navegáveis: decompõe um raciocínio em passos, sem parede de texto. */
const Slides: React.FC<{ block: Extract<LessonBlock, { kind: 'SLIDES' }> }> = ({ block }) => {
  const [i, setI] = useState(0);
  const total = block.slides.length;
  const slide = block.slides[i];

  const go = useCallback(
    (delta: number) => setI((prev) => Math.min(Math.max(prev + delta, 0), total - 1)),
    [total]
  );

  return (
    <Card variant="default" padding="md" className="space-y-3 not-prose">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
          {block.title}
        </p>
        <span className="font-mono text-[11px] text-stone-500" aria-hidden="true">
          {i + 1} / {total}
        </span>
      </div>

      <div
        role="group"
        aria-roledescription="apresentação"
        aria-label={`${block.title}: lâmina ${i + 1} de ${total}`}
        className="min-h-32 space-y-2 rounded-md bg-stone-50 p-4"
      >
        <h4 className="font-serif text-base font-bold text-stone-900">{slide.heading}</h4>
        <p className="text-sm leading-relaxed text-stone-700">{slide.body}</p>
        {slide.note && <p className="font-mono text-[11px] text-stone-500">{slide.note}</p>}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" disabled={i === 0} onClick={() => go(-1)}>
          <ChevronLeft className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> Anterior
        </Button>

        <div className="flex gap-1" role="tablist" aria-label="Lâminas">
          {block.slides.map((sl, idx) => (
            <button
              key={sl.heading}
              type="button"
              role="tab"
              aria-selected={idx === i}
              aria-label={`Lâmina ${idx + 1}: ${sl.heading}`}
              onClick={() => setI(idx)}
              className={clsx(
                'h-1.5 rounded-full transition-all',
                idx === i ? 'w-5 bg-red-800' : 'w-1.5 bg-stone-300 hover:bg-stone-400'
              )}
            />
          ))}
        </div>

        <Button variant="ghost" size="sm" disabled={i === total - 1} onClick={() => go(1)}>
          Próxima <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
};

/**
 * Marcador de aula em vídeo — deliberadamente discreto.
 *
 * Uma linha de texto tênue, sem card, sem ícone grande e sem botão: registra
 * onde a aula gravada entrará sem sugerir que falta algo agora. Fingir um
 * player, ou reservar um retângulo vazio, seria pior que a ausência.
 */
const VideoPlaceholder: React.FC<{ topic: string }> = ({ topic }) => (
  <p className="flex items-center gap-1.5 border-l-2 border-stone-200 py-0.5 pl-2.5 text-[11px] text-stone-400 not-prose">
    <Clapperboard className="h-3 w-3 shrink-0" aria-hidden="true" />
    <span>Aula em vídeo sobre {topic} prevista para edição futura.</span>
  </p>
);

// ----------------------------------------------------------- renderizador ---

const CALLOUT_STYLE = {
  info: { icon: Info, cls: 'border-stone-300 bg-stone-50 text-stone-800' },
  historical: { icon: ScrollText, cls: 'border-amber-300 bg-amber-50 text-amber-900' },
  warning: { icon: AlertTriangle, cls: 'border-red-300 bg-red-50 text-red-900' },
  tip: { icon: Lightbulb, cls: 'border-emerald-300 bg-emerald-50 text-emerald-900' },
} as const;

/** Markdown mínimo e seguro: negrito, itálico, código e listas. Sem HTML bruto. */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>;
    if (p.startsWith('`') && p.endsWith('`'))
      return <code key={i} className="rounded bg-stone-100 px-1 py-0.5 font-mono text-[0.9em]">{p.slice(1, -1)}</code>;
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

const Markdown: React.FC<{ markdown: string }> = ({ markdown }) => (
  <div className="space-y-2.5 text-[15px] leading-relaxed text-stone-800">
    {markdown.split('\n').map((line, i) => {
      const t = line.trim();
      if (!t) return null;
      if (t.startsWith('- ')) {
        return (
          <p key={i} className="flex gap-2 pl-1">
            <span aria-hidden="true" className="text-stone-400">•</span>
            <span>{renderInline(t.slice(2))}</span>
          </p>
        );
      }
      return <p key={i}>{renderInline(t)}</p>;
    })}
  </div>
);

export const LessonBlockRenderer: React.FC<{ block: LessonBlock }> = ({ block }) => {
  switch (block.kind) {
    case 'MARKDOWN':
      return <Markdown markdown={block.markdown} />;

    case 'CALLOUT': {
      const { icon: Icon, cls } = CALLOUT_STYLE[block.type];
      return (
        <aside className={clsx('flex gap-2.5 rounded-md border p-3 text-xs not-prose', cls)}>
          <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-serif font-bold">{block.title}</p>
            <p className="leading-relaxed">{block.text}</p>
          </div>
        </aside>
      );
    }

    case 'AUDIO_EXAMPLE':
      return (
        <LabShell title={block.title}>
          {block.description && <p className="text-xs text-stone-700">{block.description}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <ListenButton notes={block.notes} mode={block.playMode} bpm={block.bpm} variant="primary" />
            <span className="font-mono text-xs text-stone-500">{block.notes.join(' · ')}</span>
          </div>
        </LabShell>
      );

    case 'INTERVAL_LAB':
      return <IntervalLab block={block} />;
    case 'CHORD_LAB':
      return <ChordLab block={block} />;
    case 'SCALE_LAB':
      return <ScaleLab block={block} />;

    case 'KEYBOARD':
      return (
        <LabShell title={block.title || 'Teclado'}>
          <InstrumentKeyboard
            id={block.id}
            startOctave={block.startOctave ?? 4}
            octavesCount={block.octaves ?? 2}
            activePitches={(block.highlightNotes || []).map(noteToMidi).filter((m): m is number => m !== null)}
            onNoteDown={(pitch) => webAudioSynth.playTone(440 * Math.pow(2, (pitch - 69) / 12), 0.6)}
          />
        </LabShell>
      );

    case 'STAFF':
      return (
        <figure className="space-y-2 not-prose">
          <Card variant="default" padding="md" className="overflow-x-auto">
            <Staff
              id={block.id}
              clef={block.clef}
              timeSignature={block.timeSignature}
              notes={block.notes.map(toNoteItem).filter((n): n is NonNullable<typeof n> => n !== null)}
            />
          </Card>
          <div className="flex flex-wrap items-center gap-2">
            <ListenButton notes={block.notes} mode="SEQUENCE" label="Ouvir a pauta" />
            {block.caption && <figcaption className="text-xs text-stone-600">{block.caption}</figcaption>}
          </div>
        </figure>
      );

    case 'DIAGRAM':
      return (
        <figure className="space-y-2 not-prose">
          <Card variant="muted" padding="md">
            {block.diagram === 'CIRCLE_OF_FIFTHS' && <CircleOfFifths highlight={block.highlight} />}
            {block.diagram === 'TONE_SEMITONE' && <ToneSemitone />}
            {block.diagram === 'INTERVAL_RULER' && <ToneSemitone />}
          </Card>
          {block.caption && <figcaption className="text-xs text-stone-600">{block.caption}</figcaption>}
        </figure>
      );

    case 'SLIDES':
      return <Slides block={block} />;

    case 'VIDEO_PLACEHOLDER':
      return <VideoPlaceholder topic={block.topic} />;

    case 'CHECKPOINT':
      return <Checkpoint block={block} />;
  }
};
