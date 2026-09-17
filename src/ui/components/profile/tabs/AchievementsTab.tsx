import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { Trophy, Calendar, ShieldCheck } from 'lucide-react';

interface AchievementsTabProps {
  profile: UnifiedProfileRecord;
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({ profile }) => {
  const achievements = profile.achievementsList || [];

  return (
    <div id="profile-achievements-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">
          Conquistas, Premiações & Distinções
        </h2>
        <p className="text-xs text-stone-600">
          Reconhecimento institucional em concursos de interpretação, bolsas de mérito e distinções acadêmicas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((ach) => (
          <Card key={ach.id} variant="default" padding="lg" className="border-stone-200">
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {ach.year}
              </span>
            </div>

            <div className="mt-3">
              <h3 className="font-serif font-bold text-sm text-stone-900">{ach.title}</h3>
              <p className="text-xs font-medium text-amber-900 mt-0.5">{ach.issuer}</p>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">{ach.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="capitalize font-mono bg-stone-100 px-2 py-0.5 rounded">
                Categoria: {ach.category}
              </span>
              <span className="text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Distinção Oficial
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
