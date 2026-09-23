import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { Flame, CheckCircle2 } from 'lucide-react';

interface PracticeTabProps {
  profile: UnifiedProfileRecord;
}

/**
 * AUD-7 — a aba mostrava a toda conta 180 sessões, 24 dias seguidos e quatro
 * sessões de "Cravo Histórico" com 98% de acurácia. Agora mostra o que o
 * perfil mediu (`medirPerfil`), e diz quando ainda não há nada.
 */
export const PracticeTab: React.FC<PracticeTabProps> = ({ profile }) => {
  const practice = profile.practice;
  const sessoes = practice?.totalPracticeSessions ?? 0;
  const recentes = practice?.recentExercises ?? [];

  return (
    <div id="profile-practice-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">Rotina de prática</h2>
        <p className="text-xs text-stone-600">Constância diária e as sessões feitas no Laboratório</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card variant="default" padding="md" className="border-stone-200 bg-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">Dias seguidos</span>
            <Flame className="w-5 h-5 text-emerald-700" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif font-bold text-2xl text-emerald-950">
              {practice?.currentStreakDays ?? 0} {practice?.currentStreakDays === 1 ? 'dia' : 'dias'}
            </span>
          </div>
          <span className="text-[11px] text-stone-600 mt-2 block">
            Recorde: {practice?.longestStreakDays ?? 0} {practice?.longestStreakDays === 1 ? 'dia' : 'dias'}
          </span>
        </Card>

        <Card variant="default" padding="md" className="border-stone-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700">Sessões concluídas</span>
            <CheckCircle2 className="w-5 h-5 text-stone-700" aria-hidden="true" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif font-bold text-2xl text-stone-900">{sessoes}</span>
            <span className="text-xs text-stone-600">{sessoes === 1 ? 'sessão registrada' : 'sessões registradas'}</span>
          </div>
        </Card>
      </div>

      <Card variant="default" padding="md">
        <h3 className="font-serif font-bold text-sm text-stone-900 pb-3 border-b border-stone-200 flex items-center justify-between">
          <span>Sessões recentes</span>
          {recentes.length > 0 && (
            <span className="text-xs font-normal text-stone-500 font-mono">Últimas {recentes.length}</span>
          )}
        </h3>

        {recentes.length === 0 ? (
          <p className="text-xs text-stone-600 pt-3">
            Nenhuma sessão ainda. As sessões do Laboratório aparecem aqui assim que terminam.
          </p>
        ) : (
          <div className="divide-y divide-stone-100 mt-2">
            {recentes.map((r) => (
              <div key={r.id} className="py-3 first:pt-1 space-y-1 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-semibold text-stone-900">{r.title}</span>
                  <span className="text-stone-500 font-mono text-[11px]">
                    {new Date(r.completedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-stone-600 text-[11px] flex-wrap">
                  <span>{r.toolUsed}</span>
                  <span aria-hidden="true">•</span>
                  <span className="text-emerald-800 font-medium">{r.accuracyScore}% de acerto</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
