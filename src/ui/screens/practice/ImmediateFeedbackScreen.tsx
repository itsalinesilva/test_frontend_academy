import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  Activity,
  Award,
  Sparkles,
} from 'lucide-react';
import { ExerciseAttempt, Exercise } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { webAudioSynth } from '../../../infrastructure/audio/synth';
import { useRouter, useRouteParams } from '../../navigation/router';

export const ImmediateFeedbackScreen: React.FC = () => {
  const router = useRouter();
  const params = useRouteParams();
  const attemptId = params.id || '';

  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<ExerciseAttempt | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        let att: ExerciseAttempt | null = null;
        if (attemptId) {
          att = await practiceService.getAttempt(attemptId);
        }
        if (!att) {
          // If no specific attempt ID, get the latest attempt or evaluate default
          const allExercises = await practiceService.listExercises();
          const firstEx = allExercises[0];
          if (firstEx) {
            att = await practiceService.evaluateAttempt({
              exerciseId: firstEx.id,
              userId: 'usr_founder_1',
              givenResponse: 'C4 D4 E4',
              detectedPitch: 'C4',
              targetPitch: 'C4',
              timingDeviationMs: 8,
              targetBpm: 80,
              recordedBpm: 80,
            });
          }
        }
        setAttempt(att);
        if (att) {
          const ex = await practiceService.getExercise(att.exerciseId);
          setExercise(ex);

          // Acoustic feedback audio chime
          if (att.isCorrect) {
            webAudioSynth.playTone(523.25, 0.15, 'triangle'); // C5
            setTimeout(() => webAudioSynth.playTone(659.25, 0.2, 'triangle'), 120); // E5
            setTimeout(() => webAudioSynth.playTone(783.99, 0.3, 'triangle'), 240); // G5
          } else {
            webAudioSynth.playTone(392.0, 0.2, 'sawtooth');
            setTimeout(() => webAudioSynth.playTone(369.99, 0.3, 'sawtooth'), 180);
          }
        }
      } catch (err) {
        console.error('Failed to load immediate feedback data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-stone-200 rounded" />
        <div className="h-64 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-stone-900">Tentativa de Prática não localizada</h2>
        <Button variant="outline" onClick={() => router.navigate('/practice')}>
          Voltar para Prática
        </Button>
      </div>
    );
  }

  const { measurement, immediateFeedback, isCorrect } = attempt;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Back button & stage breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => (attempt.sessionId ? router.navigate(`/practice/session/${attempt.sessionId}`) : router.navigate('/practice'))}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Sessão
        </button>
        <span className="text-[11px] font-mono uppercase tracking-widest text-stone-400 font-bold">
          Loop de Treino • Feedback Imediato
        </span>
      </div>

      {/* Main Feedback Banner */}
      <Card
        variant="default"
        padding="lg"
        className={`space-y-5 bg-white border-2 shadow-sm ${
          isCorrect ? 'border-emerald-500 bg-emerald-50/10' : 'border-amber-500 bg-amber-50/10'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isCorrect ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={isCorrect ? 'success' : 'warning'}>
                  {isCorrect ? 'Execução Aprovada' : 'Ajuste Pedagógico Necessário'}
                </Badge>
                <Badge variant="neutral">+{attempt.xpEarned} XP</Badge>
                {immediateFeedback.badgeAwarded && (
                  <Badge variant="brand" className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>{immediateFeedback.badgeAwarded}</span>
                  </Badge>
                )}
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                {immediateFeedback.headline}
              </h1>
              {exercise && (
                <p className="text-xs text-stone-500 font-sans mt-0.5">
                  Exercício: <span className="font-medium text-stone-700">{exercise.title}</span> • Modalidade: {exercise.modality}
                </p>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-center shrink-0">
            <span className="text-[10px] uppercase font-mono text-stone-400 block font-semibold">
              Score da Tentativa
            </span>
            <span className="font-mono text-3xl font-bold text-red-900">
              {measurement.score}
            </span>
            <span className="text-[10px] font-mono text-stone-400 block">/1000 canônico</span>
          </div>
        </div>

        {/* Master's Corrective Note */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-stone-500 font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-anil-800" />
              Orientação do Mestre
            </span>
            <span className="text-[11px] font-mono text-stone-400">
              Acurácia: {measurement.accuracy}%
            </span>
          </div>
          <p className="text-sm text-stone-800 font-sans leading-relaxed">
            {immediateFeedback.details}
          </p>
          <div className="pt-2 border-t border-stone-200 flex items-center gap-2 text-xs font-semibold text-stone-900">
            <span className="text-anil-800 font-mono uppercase text-[10px] bg-red-50 px-2 py-0.5 rounded border border-red-200">
              Ação Imediata
            </span>
            <span>{immediateFeedback.correctiveAction}</span>
          </div>
        </div>
      </Card>

      {/* 10 Telemetric Measurements Radar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-anil-800" />
            <span>Telemetria Acústica & As 10 Medições Canônicas</span>
          </h2>
          <span className="text-xs font-mono text-stone-500">
            Rigor de Auditoria Canônica
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Pitch */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-stone-400 block font-bold">1. Pitch</span>
            <span className="font-mono text-lg font-bold text-stone-900">{measurement.pitch.centsAccuracy}%</span>
            <span className="text-[10px] font-mono text-stone-500 block">±{Math.abs(measurement.pitch.deviationCents)} cents</span>
          </div>

          {/* 2. Timing */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-stone-400 block font-bold">2. Timing</span>
            <span className="font-mono text-lg font-bold text-stone-900">{measurement.timing.timingScore}%</span>
            <span className="text-[10px] font-mono text-stone-500 block">{measurement.timing.deviationMs} ms</span>
          </div>

          {/* 3. Rhythm */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-stone-400 block font-bold">3. Rhythm</span>
            <span className="font-mono text-lg font-bold text-stone-900">{measurement.rhythm.stabilityScore}%</span>
            <span className="text-[10px] font-mono text-stone-500 block">Estabilidade</span>
          </div>

          {/* 4. Tempo */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-stone-400 block font-bold">4. Tempo</span>
            <span className="font-mono text-lg font-bold text-stone-900">{measurement.tempo.recordedBpm}</span>
            <span className="text-[10px] font-mono text-stone-500 block">Alvo: {measurement.tempo.targetBpm} BPM</span>
          </div>

          {/* 5. Accuracy */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-stone-400 block font-bold">5. Accuracy</span>
            <span className="font-mono text-lg font-bold text-red-900">{measurement.accuracy}%</span>
            <span className="text-[10px] font-mono text-stone-500 block">Geral Ponderada</span>
          </div>

          {/* 6. Intonation */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-stone-400 block font-bold">6. Intonation</span>
            <span className="font-mono text-lg font-bold text-stone-900">{measurement.intonation}%</span>
            <span className="text-[10px] font-mono text-stone-500 block">Pureza Acústica</span>
          </div>

          {/* 7. Duration */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-stone-400 block font-bold">7. Duration</span>
            <span className="font-mono text-lg font-bold text-stone-900">{measurement.duration.recordedSeconds}s</span>
            <span className="text-[10px] font-mono text-stone-500 block">Sustain {measurement.duration.sustainScore}%</span>
          </div>

          {/* 8. Consistency */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-stone-400 block font-bold">8. Consistency</span>
            <span className="font-mono text-lg font-bold text-stone-900">{measurement.consistency}%</span>
            <span className="text-[10px] font-mono text-stone-500 block">Linearidade</span>
          </div>

          {/* 9. Difficulty */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-stone-400 block font-bold">9. Difficulty</span>
            <span className="font-mono text-sm font-bold text-stone-800 capitalize mt-1 block">
              {measurement.difficulty}
            </span>
            <span className="text-[10px] font-mono text-stone-400 block">Calibração</span>
          </div>

          {/* 10. Score */}
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-anil-800 block font-bold">10. Score</span>
            <span className="font-mono text-lg font-bold text-red-900">{measurement.score}</span>
            <span className="text-[10px] font-mono text-red-700 block">Escala 0..1000</span>
          </div>
        </div>
      </section>

      {/* Gamified Action Loop Footer */}
      <div className="p-5 bg-stone-100 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="text-xs font-mono font-bold text-stone-700 block">
            Próximo Passo do Loop de Aprendizagem
          </span>
          <p className="text-xs text-stone-500 font-sans">
            Tente novamente para calibrar timing e pitch, ou prossiga para avançar na Árvore de Habilidades.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* RETRY */}
          <Button
            id="btn-feedback-retry"
            variant="outline"
            size="md"
            onClick={() => {
              if (attempt.sessionId) {
                router.navigate(`/practice/session/${attempt.sessionId}`);
              } else {
                router.navigate('/practice');
              }
            }}
            className="flex items-center gap-2 bg-white"
          >
            <RotateCcw className="w-4 h-4 text-stone-700" />
            <span>Repetir (Retry)</span>
          </Button>

          {/* ADVANCE / CONCLUDE */}
          {attempt.sessionId ? (
            <Button
              id="btn-feedback-conclude"
              variant="primary"
              size="md"
              onClick={async () => {
                const result = await practiceService.finishSession(attempt.sessionId!, 'usr_founder_1');
                router.navigate(`/practice/result/${result.id}`);
              }}
              className="flex items-center gap-2 bg-anil-800 hover:bg-anil-700 text-white"
            >
              <span>Concluir Sessão & Salvar Evidência</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              id="btn-feedback-skill-tree"
              variant="primary"
              size="md"
              onClick={() => router.navigate('/practice/skill-tree')}
              className="flex items-center gap-2 bg-anil-800 hover:bg-anil-700 text-white"
            >
              <span>Avançar na Skill Tree</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
