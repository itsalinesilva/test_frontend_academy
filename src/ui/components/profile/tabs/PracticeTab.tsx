import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { Flame, CheckCircle2, Sliders } from 'lucide-react';

interface PracticeTabProps {
  profile: UnifiedProfileRecord;
}

export const PracticeTab: React.FC<PracticeTabProps> = ({ profile }) => {
  const practice = profile.practice || {
    totalPracticeSessions: 180,
    currentStreakDays: 24,
    longestStreakDays: 45,
    skills: [],
    repertoire: [],
    achievements: [],
    recentExercises: [],
  };

  const practiceLogs = [
    {
      date: 'Hoje, 09:30',
      duration: '75 min',
      instrument: 'Cravo Histórico',
      focus: 'Fuga em Sol Menor BWV 861 - Clareza na 4ª entrada de tenor',
      bpm: '66 BPM',
      tool: 'Metrônomo Subdividido',
      score: '98% acurácia',
    },
    {
      date: 'Ontem, 16:45',
      duration: '90 min',
      instrument: 'Cravo Histórico',
      focus: 'Scarlatti K. 141 - Mecânica de notas repetidas mão direita',
      bpm: '132 BPM',
      tool: 'Prática Lenta com Acentos',
      score: '96% acurácia',
    },
    {
      date: 'Anteontem, 10:15',
      duration: '60 min',
      instrument: 'Piano Steinway B',
      focus: 'Exercícios de Hanon adaptados & Prelúdio BWV 847',
      bpm: '80 BPM',
      tool: 'Gravação Teste',
      score: '99% acurácia',
    },
    {
      date: '3 dias atrás',
      duration: '80 min',
      instrument: 'Cravo Flamengo',
      focus: 'Couperin - Les Barricades Mystérieuses (Rondeau)',
      bpm: '54 BPM',
      tool: 'Afinador Valotti',
      score: 'Afinação Impecável',
    },
  ];

  return (
    <div id="profile-practice-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">
          Rotina de Prática, Disciplina & Consistência Técnica
        </h2>
        <p className="text-xs text-stone-600">
          Métricas de permanência ao teclado, constância diária (streak) e histórico de sessões instrumentais
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" padding="md" className="border-stone-200 bg-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">Streak Atual</span>
            <Flame className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif font-bold text-2xl text-emerald-950">
              {practice.currentStreakDays} dias
            </span>
            <span className="text-xs text-emerald-700">consecutivos</span>
          </div>
          <span className="text-[11px] text-stone-600 mt-2 block">
            Recorde histórico: {practice.longestStreakDays} dias seguidos
          </span>
        </Card>

        <Card variant="default" padding="md" className="border-stone-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700">Sessões Concluídas</span>
            <CheckCircle2 className="w-5 h-5 text-stone-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif font-bold text-2xl text-stone-900">
              {practice.totalPracticeSessions}
            </span>
            <span className="text-xs text-stone-600">sessões registradas</span>
          </div>
          <span className="text-[11px] text-stone-600 mt-2 block">
            Média de 78 minutos por sessão diária
          </span>
        </Card>

        <Card variant="default" padding="md" className="border-stone-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700">Ferramenta Predominante</span>
            <Sliders className="w-5 h-5 text-amber-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif font-bold text-xl text-stone-900">
              Metrônomo & Afinação
            </span>
          </div>
          <span className="text-[11px] text-stone-600 mt-2 block">
            68% das sessões com subdivisão rítmica
          </span>
        </Card>
      </div>

      {/* Practice Logs Table */}
      <Card variant="default" padding="md">
        <h3 className="font-serif font-bold text-sm text-stone-900 pb-3 border-b border-stone-200 flex items-center justify-between">
          <span>Histórico Detalhado de Prática</span>
          <span className="text-xs font-normal text-stone-500 font-mono">Últimas 4 sessões</span>
        </h3>

        <div className="divide-y divide-stone-100 mt-2">
          {practiceLogs.map((log, idx) => (
            <div key={idx} className="py-3 first:pt-1 space-y-1 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-semibold text-stone-900">{log.focus}</span>
                <span className="text-stone-500 font-mono text-[11px]">{log.date}</span>
              </div>
              <div className="flex items-center gap-3 text-stone-600 text-[11px] flex-wrap">
                <span className="font-medium text-stone-800">{log.instrument}</span>
                <span>•</span>
                <span>Duração: {log.duration}</span>
                <span>•</span>
                <span>Pulso: {log.bpm}</span>
                <span>•</span>
                <span className="text-emerald-800 font-medium">{log.score}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
