import React, { useState } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { webAudioSynth } from '../../../infrastructure/audio/synth';
import { CirculationBar } from '../../components/navigation/CirculationBar';
import {
  Target,
  Volume2,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowRight,
  Sparkles,
  Flame,
  Award,
  Play,
  RotateCcw,
} from 'lucide-react';
import { clsx } from 'clsx';

interface IntervalQuestion {
  id: string;
  name: string;
  firstNote: string;
  secondNote: string;
  firstFreq: number;
  secondFreq: number;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

const SAMPLE_INTERVALS: IntervalQuestion[] = [
  {
    id: 'int-1',
    name: 'Dó4 para Mi4',
    firstNote: 'C4',
    secondNote: 'E4',
    firstFreq: 261.63,
    secondFreq: 329.63,
    correctAnswer: '3ª Maior (Terça Maior)',
    options: ['2ª Maior', '3ª Maior (Terça Maior)', '4ª Justa', '5ª Justa'],
    explanation: 'A distância entre Dó e Mi equivale a 2 tons inteiros (4 semitons), caracterizando a Terça Maior.',
  },
  {
    id: 'int-2',
    name: 'Dó4 para Sol4',
    firstNote: 'C4',
    secondNote: 'G4',
    firstFreq: 261.63,
    secondFreq: 392.00,
    correctAnswer: '5ª Justa (Quinta Justa)',
    options: ['4ª Justa', '5ª Diminuta', '5ª Justa (Quinta Justa)', '6ª Menor'],
    explanation: 'A quinta justa possui 7 semitons e é a base da consonância acústica e do ciclo de quintas.',
  },
  {
    id: 'int-3',
    name: 'Dó4 para Fá4',
    firstNote: 'C4',
    secondNote: 'F4',
    firstFreq: 261.63,
    secondFreq: 349.23,
    correctAnswer: '4ª Justa (Quarta Justa)',
    options: ['3ª Maior', '4ª Justa (Quarta Justa)', 'Trítono', '5ª Justa'],
    explanation: 'A quarta justa compreende 5 semitons, sendo o intervalo de inversão da quinta justa.',
  },
];

export const PracticeScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState<'intervals' | 'rhythm' | 'chords'>('intervals');

  // Exercise loop state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [sessionXp, setSessionXp] = useState(40);
  const [sessionStreak] = useState(7);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);

  // Metronome state for rhythm practice
  const [metronomeBpm, setMetronomeBpm] = useState(80);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const metronomeTimerRef = React.useRef<number | null>(null);

  const currentQ = SAMPLE_INTERVALS[currentQuestionIndex];

  // Play auditory reference for current interval
  const playIntervalAudio = () => {
    webAudioSynth.playTone(currentQ.firstFreq, 0.6, 'triangle');
    setTimeout(() => {
      webAudioSynth.playTone(currentQ.secondFreq, 0.8, 'triangle');
    }, 700);
  };

  const playHarmonicInterval = () => {
    webAudioSynth.playChord([currentQ.firstFreq, currentQ.secondFreq], 1.2);
  };

  const handleAnswer = (option: string) => {
    if (selectedAnswer) return; // Prevent multi-clicks
    setSelectedAnswer(option);
    setTotalAttempts((prev) => prev + 1);

    const isCorrect = option === currentQ.correctAnswer;
    if (isCorrect) {
      setCorrectAttempts((prev) => prev + 1);
      setSessionXp((prev) => prev + 25);
      setFeedback({
        isCorrect: true,
        text: `Correto! ${currentQ.explanation}`,
      });
      // Harmonic celebratory chord
      webAudioSynth.playChord([261.63, 329.63, 392.00, 523.25], 0.8);
    } else {
      setFeedback({
        isCorrect: false,
        text: `Incorreto. A resposta certa é: ${currentQ.correctAnswer}. ${currentQ.explanation}`,
      });
      // Soft minor resolution
      webAudioSynth.playTone(220, 0.5, 'sawtooth');
    }
  };

  const handleNextExercise = () => {
    setSelectedAnswer(null);
    setFeedback(null);
    setCurrentQuestionIndex((prev) => (prev + 1) % SAMPLE_INTERVALS.length);
  };

  // Metronome click loop
  const toggleMetronome = () => {
    if (isMetronomeActive) {
      if (metronomeTimerRef.current) {
        window.clearInterval(metronomeTimerRef.current);
        metronomeTimerRef.current = null;
      }
      setIsMetronomeActive(false);
    } else {
      setIsMetronomeActive(true);
      const intervalMs = (60 / metronomeBpm) * 1000;
      webAudioSynth.playTone(880, 0.05, 'sine');
      metronomeTimerRef.current = window.setInterval(() => {
        webAudioSynth.playTone(880, 0.05, 'sine');
      }, intervalMs);
    }
  };

  // Clean metronome on unmount
  React.useEffect(() => {
    return () => {
      if (metronomeTimerRef.current) {
        window.clearInterval(metronomeTimerRef.current);
      }
    };
  }, []);

  const accuracyPercent =
    totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 100;

  return (
    <ScreenContainer
      id="practice-hub"
      title="Prática & Microcompetências"
      subtitle="Treino auditivo diário, percepção de intervalos, pulso rítmico e maestria instrumental com validação acústica."
      badgeLabel="Motor de Prática Soberano"
      badgeVariant="brand"
      primaryAction={{
        label: 'Avançar para Partituras (Score)',
        icon: ArrowRight,
        onClick: () => navigate('/score'),
      }}
      secondaryActions={[
        {
          label: 'Voltar para Academia',
          onClick: () => navigate('/academy'),
        },
      ]}
      emptyProps={{
        title: 'Nenhum exercício pendente',
        description: 'Parabéns! Sua meta diária de percepção e treino rítmico foi concluída com êxito.',
        actionLabel: 'Reiniciar Prática',
        onAction: () => setCurrentQuestionIndex(0),
      }}
    >
      <div className="space-y-6">
        {/* Circulation Bar */}
        <CirculationBar id="practice-circulation" />

        {/* Practice Stats Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card variant="default" padding="sm" className="flex items-center gap-3">
            <div className="p-2 rounded bg-red-100 text-anil-800">
              <Flame className="w-4 h-4 fill-anil-800" />
            </div>
            <div>
              <p className="text-[11px] text-stone-500 font-mono">Ofensiva Atual</p>
              <p className="text-sm font-bold text-stone-900">{sessionStreak} dias seguidos</p>
            </div>
          </Card>

          <Card variant="default" padding="sm" className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-100 text-amber-800">
              <Zap className="w-4 h-4 fill-amber-700" />
            </div>
            <div>
              <p className="text-[11px] text-stone-500 font-mono">XP Ganho Hoje</p>
              <p className="text-sm font-bold text-stone-900">+{sessionXp} XP</p>
            </div>
          </Card>

          <Card variant="default" padding="sm" className="flex items-center gap-3">
            <div className="p-2 rounded bg-emerald-100 text-emerald-800">
              <Target className="w-4 h-4 text-emerald-800" />
            </div>
            <div>
              <p className="text-[11px] text-stone-500 font-mono">Precisão Auditiva</p>
              <p className="text-sm font-bold text-stone-900">{accuracyPercent}%</p>
            </div>
          </Card>

          <Card variant="default" padding="sm" className="flex items-center gap-3">
            <div className="p-2 rounded bg-purple-100 text-purple-800">
              <Award className="w-4 h-4 text-purple-800" />
            </div>
            <div>
              <p className="text-[11px] text-stone-500 font-mono">Liga Semanal</p>
              <p className="text-sm font-bold text-stone-900">Conservatório II</p>
            </div>
          </Card>
        </div>

        {/* Skill Category Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('intervals')}
            className={clsx(
              'px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2',
              activeTab === 'intervals'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            )}
          >
            <Volume2 className="w-4 h-4" />
            <span>Percepção de Intervalos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rhythm')}
            className={clsx(
              'px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2',
              activeTab === 'rhythm'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span>Metrônomo & Pulso Rítmico</span>
          </button>
        </div>

        {/* 1. Interval Practice Loop */}
        {activeTab === 'intervals' && (
          <Card variant="default" padding="lg" className="space-y-6 max-w-3xl mx-auto shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-anil-800 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  Exercício {currentQuestionIndex + 1} de {SAMPLE_INTERVALS.length}
                </span>
                <h3 className="text-lg font-serif font-bold text-stone-900 mt-1">
                  Identifique o Intervalo Melódico e Harmônico
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playIntervalAudio}
                  leadingIcon={<Volume2 className="w-4 h-4 text-anil-800" />}
                >
                  Ouvir Melódico
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playHarmonicInterval}
                  leadingIcon={<Play className="w-4 h-4" />}
                >
                  Ouvir Harmônico
                </Button>
              </div>
            </div>

            {/* Visual Prompts / Staves preview */}
            <div className="p-6 bg-stone-50 border border-stone-200 rounded-xl text-center space-y-2">
              <p className="text-xs text-stone-500 font-mono">Pauta Auditiva (Tons Sintetizados em Tempo Real)</p>
              <div className="flex items-center justify-center gap-6 py-2">
                <div className="p-3 bg-white rounded-lg border border-stone-300 shadow-2xs font-mono font-bold text-lg text-stone-900">
                  {currentQ.firstNote} ({Math.round(currentQ.firstFreq)} Hz)
                </div>
                <span className="text-stone-400 font-serif text-xl">→</span>
                <div className="p-3 bg-white rounded-lg border border-stone-300 shadow-2xs font-mono font-bold text-lg text-stone-900">
                  {currentQ.secondNote} ({Math.round(currentQ.secondFreq)} Hz)
                </div>
              </div>
              <p className="text-xs text-stone-600">
                Clique nos botões acima para escutar as notas antes de escolher sua resposta.
              </p>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === currentQ.correctAnswer;

                let btnStyle = 'border-stone-200 bg-white text-stone-800 hover:border-stone-400';
                if (selectedAnswer) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'border-red-500 bg-red-50 text-anil-950 font-bold';
                  } else {
                    btnStyle = 'border-stone-200 bg-stone-50 text-stone-400';
                  }
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleAnswer(opt)}
                    disabled={selectedAnswer !== null}
                    className={clsx(
                      'p-4 rounded-xl border-2 text-left font-medium text-sm transition-all flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-anil-800',
                      btnStyle
                    )}
                  >
                    <span>{opt}</span>
                    {selectedAnswer && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    {selectedAnswer && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Next Button */}
            {feedback && (
              <div
                className={clsx(
                  'p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150',
                  feedback.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
                )}
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold font-mono uppercase tracking-wider">
                    {feedback.isCorrect ? '✓ Excelente!' : '⚠ Análise Teórica'}
                  </span>
                  <p className="text-xs leading-relaxed">{feedback.text}</p>
                </div>

                <Button variant="primary" size="sm" onClick={handleNextExercise}>
                  Próximo Exercício
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* 2. Rhythm & Metronome Practice */}
        {activeTab === 'rhythm' && (
          <Card variant="default" padding="lg" className="space-y-6 max-w-3xl mx-auto shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  Metrônomo Acústico de Precisão
                </h3>
                <p className="text-xs text-stone-500">
                  Pratique subdivisão rítmica (semínimas, colcheias, tercinas) com o gerador de áudio canônico.
                </p>
              </div>
              <Badge variant="neutral">{metronomeBpm} BPM</Badge>
            </div>

            <div className="p-8 bg-stone-900 text-white rounded-2xl text-center space-y-6 shadow-inner">
              <div className="text-5xl font-mono font-bold tracking-tight text-stone-100">
                {metronomeBpm} <span className="text-base text-stone-400 font-sans font-normal">BPM</span>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setMetronomeBpm((prev) => Math.max(40, prev - 5))}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded font-mono text-sm"
                >
                  -5
                </button>
                <input
                  type="range"
                  min="40"
                  max="220"
                  value={metronomeBpm}
                  onChange={(e) => setMetronomeBpm(Number(e.target.value))}
                  className="w-48 sm:w-64 accent-red-600"
                />
                <button
                  type="button"
                  onClick={() => setMetronomeBpm((prev) => Math.min(220, prev + 5))}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded font-mono text-sm"
                >
                  +5
                </button>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={toggleMetronome}
                  leadingIcon={isMetronomeActive ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                >
                  {isMetronomeActive ? 'Parar Metrônomo' : 'Iniciar Metrônomo'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Next step in circulation prompt */}
        <div className="p-4 bg-stone-100 border border-stone-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 text-anil-800 shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-stone-900">
                Próximo Elo da Circulação: Partituras (Score)
              </h4>
              <p className="text-[11px] text-stone-600">
                Transfira as habilidades auditivas exercitadas para o registro em pautas e edição formal.
              </p>
            </div>
          </div>

          <Button variant="primary" size="sm" onClick={() => navigate('/score')}>
            Ir para Partituras (Score)
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </ScreenContainer>
  );
};
