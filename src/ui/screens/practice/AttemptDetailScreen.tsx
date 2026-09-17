import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  RotateCcw,
  Activity,
} from 'lucide-react';
import { ExerciseAttempt, Exercise } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter, useRouteParams } from '../../navigation/router';

export const AttemptDetailScreen: React.FC = () => {
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
        const att = await practiceService.getAttempt(attemptId);
        setAttempt(att);
        if (att) {
          const ex = await practiceService.getExercise(att.exerciseId);
          setExercise(ex);
        }
      } catch (err) {
        console.error('Failed to load attempt detail', err);
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
        <h2 className="text-xl font-serif font-bold text-stone-900">Tentativa não encontrada</h2>
        <Button variant="outline" onClick={() => router.navigate('/practice')}>
          Voltar para Prática
        </Button>
      </div>
    );
  }

  const { measurement, immediateFeedback, isCorrect } = attempt;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Back Button */}
      <div>
        <button
          onClick={() => router.navigate('/practice')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Prática
        </button>
      </div>

      {/* Header Profile */}
      <Card
        variant="default"
        padding="lg"
        className={`space-y-4 bg-white border-2 ${
          isCorrect ? 'border-emerald-500' : 'border-amber-500'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isCorrect ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={isCorrect ? 'success' : 'warning'}>
                  {isCorrect ? 'Aprovado' : 'Revisão Solicitada'}
                </Badge>
                <Badge variant="neutral">+{attempt.xpEarned} XP</Badge>
                {immediateFeedback.badgeAwarded && (
                  <Badge variant="brand">{immediateFeedback.badgeAwarded}</Badge>
                )}
              </div>
              <h1 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                {immediateFeedback.headline}
              </h1>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-xs text-stone-400 block">Pontuação Final</span>
            <span className="text-2xl font-bold text-red-900">
              {measurement.score}/1000
            </span>
          </div>
        </div>

        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-700">
          <p className="leading-relaxed">{immediateFeedback.details}</p>
          <p className="mt-1 font-semibold text-stone-900">
            Ação Corretiva: {immediateFeedback.correctiveAction}
          </p>
        </div>
      </Card>

      {/* 10 Measurements Grid */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-anil-800" />
          <span>Telemetria Acústica & Medições Canônicas</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
            <span className="text-[10px] uppercase font-mono text-stone-400 block">1. Pitch / Afinação</span>
            <span className="font-mono text-lg font-bold text-stone-900">{measurement.pitch.centsAccuracy}%</span>
            <span className="text-[10px] font-mono text-stone-500 block">{measurement.pitch.deviationCents} cents</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
            <span className="text-[10px] uppercase font-mono text-stone-400 block">2. Timing</span>
            <span className="font-mono text-lg font-bold text-stone-900">{measurement.timing.timingScore}%</span>
            <span className="text-[10px] font-mono text-stone-500 block">{measurement.timing.deviationMs} ms</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
            <span className="text-[10px] uppercase font-mono text-stone-400 block">3. Ritmo</span>
            <span className="font-mono text-lg font-bold text-stone-900">{measurement.rhythm.stabilityScore}%</span>
            <span className="text-[10px] font-mono text-stone-500 block">Estabilidade</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
            <span className="text-[10px] uppercase font-mono text-stone-400 block">4. Tempo / BPM</span>
            <span className="font-mono text-lg font-bold text-stone-900">{measurement.tempo.recordedBpm}</span>
            <span className="text-[10px] font-mono text-stone-500 block">Alvo: {measurement.tempo.targetBpm}</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
            <span className="text-[10px] uppercase font-mono text-stone-400 block">5. Acurácia</span>
            <span className="font-mono text-lg font-bold text-red-900">{measurement.accuracy}%</span>
            <span className="text-[10px] font-mono text-stone-500 block">Global</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
            <span className="text-[10px] uppercase font-mono text-stone-400 block">6. Entonação</span>
            <span className="font-mono text-lg font-bold text-stone-900">{measurement.intonation}%</span>
            <span className="text-[10px] font-mono text-stone-500 block">Pureza acústica</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
            <span className="text-[10px] uppercase font-mono text-stone-400 block">7. Duração</span>
            <span className="font-mono text-lg font-bold text-stone-900">{measurement.duration.recordedSeconds}s</span>
            <span className="text-[10px] font-mono text-stone-500 block">Sustain {measurement.duration.sustainScore}%</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
            <span className="text-[10px] uppercase font-mono text-stone-400 block">8. Consistência</span>
            <span className="font-mono text-lg font-bold text-stone-900">{measurement.consistency}%</span>
            <span className="text-[10px] font-mono text-stone-500 block">Linearidade</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
            <span className="text-[10px] uppercase font-mono text-stone-400 block">9. Dificuldade</span>
            <span className="font-mono text-sm font-bold text-stone-800 capitalize mt-1 block">
              {measurement.difficulty}
            </span>
            <span className="text-[10px] font-mono text-stone-400 block">Calibração</span>
          </div>

          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center">
            <span className="text-[10px] uppercase font-mono text-anil-800 block font-bold">10. Score Final</span>
            <span className="font-mono text-lg font-bold text-red-900">{measurement.score}</span>
            <span className="text-[10px] font-mono text-red-700 block">Escala 0..1000</span>
          </div>
        </div>
      </section>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
        <Button
          variant="outline"
          size="md"
          onClick={() => router.navigate('/practice')}
        >
          Voltar para Prática
        </Button>
        {exercise && (
          <Button
            variant="primary"
            size="md"
            onClick={async () => {
              const session = await practiceService.startSession(
                'usr_founder_1',
                exercise.modality,
                exercise.id,
                exercise.skillId
              );
              router.navigate(`/practice/session/${session.id}`);
            }}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Repetir Exercício</span>
          </Button>
        )}
      </div>
    </div>
  );
};
