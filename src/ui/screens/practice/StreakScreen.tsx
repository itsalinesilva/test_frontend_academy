import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Badge } from '../../components/base/Badge';
import {
  Flame,
  Shield,
  Trophy,
  ChevronLeft,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { StreakTracker } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter } from '../../navigation/router';
import { useUsuarioAtual } from '../../hooks/useUsuarioAtual';

export const StreakScreen: React.FC = () => {
  const { userId } = useUsuarioAtual();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<StreakTracker | null>(null);

  useEffect(() => {
    async function loadStreak() {
      if (!userId) return;
      try {
        setLoading(true);
        const data = await practiceService.getStreak(userId);
        setStreak(data);
      } catch (err) {
        console.error('Failed to load streak', err);
      } finally {
        setLoading(false);
      }
    }
    loadStreak();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-stone-200 rounded" />
        <div className="h-64 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  if (!streak) return null;

  const milestones = [
    { days: 7, label: 'Primeira Semana Consistente', reward: '+150 XP • Escudo de Congelamento', unlocked: streak.currentStreakDays >= 7 },
    { days: 14, label: 'Duas Semanas Canônicas', reward: '+300 XP • Distintivo de Disciplina', unlocked: streak.currentStreakDays >= 14 },
    { days: 30, label: 'Hábito de Conservatório', reward: '+750 XP • Título de Mestre de Rotina', unlocked: streak.currentStreakDays >= 30 },
    { days: 100, label: 'Centenário Virtuoso', reward: '+2500 XP • Certificado de Honra', unlocked: streak.currentStreakDays >= 100 },
  ];

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
          Ofensiva & Regularidade (Streak)
        </h1>
        <p className="text-sm text-stone-600 font-sans mt-1">
          A consistência diária é a chave mestra para a neuroplasticidade e precisão musical.
        </p>
      </div>

      {/* Flame Showcase Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-600 via-red-600 to-amber-700 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Flame className="w-10 h-10 fill-white text-white" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-100 block">
                Ofensiva Atual
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold">
                {streak.currentStreakDays} Dias Seguidos
              </h2>
            </div>
          </div>

          {/* Records & Freeze */}
          <div className="flex items-center gap-3">
            <div className="bg-black/20 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-center">
              <span className="text-[10px] font-mono uppercase text-amber-100 block">Recorde Pessoal</span>
              <span className="font-mono text-xl font-bold">{streak.longestStreakDays} Dias</span>
            </div>

            <div className="bg-black/20 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-center">
              <span className="text-[10px] font-mono uppercase text-amber-100 block flex items-center justify-center gap-1">
                <Shield className="w-3 h-3 text-cyan-300" /> Escudos
              </span>
              <span className="font-mono text-xl font-bold text-cyan-200">
                {streak.freezeDaysAvailable} Disponíveis
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-amber-100/90 leading-relaxed font-sans max-w-2xl">
          Pratique ao menos 1 exercício todos os dias antes da meia-noite para manter o fogo da sua ofensiva aceso e desbloquear multiplicadores de XP.
        </p>
      </div>

      {/* Calendar Consistency History */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-anil-800" />
          <span>Histórico dos Últimos Dias Praticados</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {streak.calendarHistory.slice(-7).map((entry) => (
            <Card
              key={entry.date}
              variant="default"
              padding="sm"
              className="text-center p-3 space-y-1 bg-stone-50 border border-stone-200"
            >
              <span className="text-[11px] font-mono text-stone-500 block">
                {entry.date}
              </span>
              <div className="w-8 h-8 rounded-full bg-red-100 text-anil-800 mx-auto flex items-center justify-center font-bold text-xs">
                <Flame className="w-4 h-4 fill-anil-800" />
              </div>
              <span className="text-xs font-bold text-stone-800 block">
                {entry.completedMinutes} min
              </span>
              <span className="text-[10px] font-mono text-emerald-700 block">
                +{entry.xp} XP
              </span>
            </Card>
          ))}
        </div>
      </section>

      {/* Milestones Roadmap */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-600" />
          <span>Marcos de Disciplina</span>
        </h2>

        <div className="space-y-3">
          {milestones.map((m) => (
            <Card
              key={m.days}
              variant="default"
              padding="md"
              className={`flex items-center justify-between gap-4 ${
                m.unlocked ? 'border-amber-300 bg-amber-50/20' : 'opacity-70 bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    m.unlocked ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {m.unlocked ? <CheckCircle2 className="w-6 h-6" /> : `${m.days}d`}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-stone-900">
                    {m.label} ({m.days} Dias)
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">{m.reward}</p>
                </div>
              </div>

              <Badge variant={m.unlocked ? 'success' : 'neutral'}>
                {m.unlocked ? 'Conquistado' : 'Bloqueado'}
              </Badge>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
