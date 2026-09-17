import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  Target,
  ChevronLeft,
  CheckCircle2,
  Trophy,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DailyGoal } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter } from '../../navigation/router';

export const DailyGoalScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);

  useEffect(() => {
    async function loadGoal() {
      try {
        setLoading(true);
        const goal = await practiceService.getDailyGoal('usr_founder_1');
        setDailyGoal(goal);
      } catch (err) {
        console.error('Failed to load daily goal', err);
      } finally {
        setLoading(false);
      }
    }
    loadGoal();
  }, []);

  const goalTiers = [
    { label: 'Casual', minutes: 10, xp: 50, exercises: 3, desc: 'Ideal para manutenção diária rápida.' },
    { label: 'Regular', minutes: 20, xp: 100, exercises: 5, desc: 'Recomendado para evolução pedagógica estável.' },
    { label: 'Intenso', minutes: 45, xp: 250, exercises: 10, desc: 'Foco deliberado para acelerar tiers de habilidades.' },
    { label: 'Virtuoso', minutes: 60, xp: 400, exercises: 15, desc: 'Rotina rigorosa de conservatório clássico.' },
  ];

  const handleSelectTier = async (tier: typeof goalTiers[0]) => {
    if (!dailyGoal) return;
    try {
      const updated = await practiceService.updateDailyGoal(
        'usr_founder_1',
        tier.minutes,
        tier.xp,
        tier.exercises
      );
      setDailyGoal(updated);
    } catch (e) {
      console.error('Failed to update daily goal', e);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-stone-200 rounded" />
        <div className="h-64 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  if (!dailyGoal) return null;

  const minutesPct = Math.min(100, Math.round((dailyGoal.completedMinutes / dailyGoal.targetMinutes) * 100));
  const xpPct = Math.min(100, Math.round((dailyGoal.completedXp / dailyGoal.targetXp) * 100));
  const exPct = Math.min(100, Math.round((dailyGoal.completedExercises / dailyGoal.targetExercises) * 100));

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <button
          onClick={() => router.navigate('/practice')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors mb-2"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Prática
        </button>
        <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
          Meta Diária de Prática
        </h1>
        <p className="text-sm text-stone-600 font-sans mt-1">
          Ajuste sua meta e acompanhe o ritmo de dedicação do dia de hoje.
        </p>
      </div>

      {/* Progress Showcase */}
      <Card variant="default" padding="lg" className="space-y-6 bg-white border border-stone-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-stone-400 block font-semibold">
              Status do Dia
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              {dailyGoal.isCompleted ? 'Meta de Hoje Concluída!' : 'Em Progresso'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={dailyGoal.isCompleted ? 'success' : 'brand'} className="text-sm py-1 px-3">
              {minutesPct}% Concluído
            </Badge>
          </div>
        </div>

        {/* 3 Progress Bars: Minutes, XP, Exercises */}
        <div className="space-y-4 pt-2">
          {/* Minutes */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-600 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-stone-500" /> Tempo Praticado
              </span>
              <span className="font-bold text-stone-900">
                {dailyGoal.completedMinutes} / {dailyGoal.targetMinutes} min
              </span>
            </div>
            <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-red-800 h-full rounded-full transition-all"
                style={{ width: `${minutesPct}%` }}
              />
            </div>
          </div>

          {/* XP */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-600 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" /> Experiência (XP)
              </span>
              <span className="font-bold text-stone-900">
                {dailyGoal.completedXp} / {dailyGoal.targetXp} XP
              </span>
            </div>
            <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>

          {/* Exercises */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-stone-600 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600" /> Exercícios Executados
              </span>
              <span className="font-bold text-stone-900">
                {dailyGoal.completedExercises} / {dailyGoal.targetExercises}
              </span>
            </div>
            <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${exPct}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Goal Tiers Selection */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900">
          Escolha seu Nível de Exigência Diária
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goalTiers.map((tier) => {
            const isSelected = dailyGoal.targetMinutes === tier.minutes;

            return (
              <Card
                key={tier.label}
                variant="default"
                padding="md"
                className={`cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-2 border-red-800 bg-red-50/20 shadow-xs'
                    : 'hover:border-stone-400 bg-white'
                }`}
                onClick={() => handleSelectTier(tier)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-serif font-bold text-base text-stone-900">
                      {tier.label}
                    </span>
                    <p className="text-xs text-stone-500 mt-0.5">{tier.desc}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-red-800 shrink-0" />
                  )}
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-mono text-stone-700">
                  <span>{tier.minutes} min/dia</span>
                  <span>{tier.xp} XP</span>
                  <span>{tier.exercises} exercícios</span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Action to Start Practice */}
      <div className="pt-4 flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.navigate('/practice')}
          className="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white"
        >
          <Sparkles className="w-4 h-4" />
          <span>Continuar Treinamento do Dia</span>
        </Button>
      </div>
    </div>
  );
};
