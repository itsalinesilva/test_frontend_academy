import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';

interface PassportsTabProps {
  profile: UnifiedProfileRecord;
}

export const PassportsTab: React.FC<PassportsTabProps> = ({ profile }) => {
  const passports = profile.worlds?.passports || [];

  return (
    <div id="profile-passports-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">
          Passaportes Musicais & Selos de Mundos Históricos
        </h2>
        <p className="text-xs text-stone-600">
          Exploração imersiva de estéticas, tratados de época e repertórios canônicos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {passports.map((pass) => (
          <Card key={pass.id} variant="default" padding="lg" className="border-stone-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-xs font-mono uppercase text-stone-500">Passaporte</span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded capitalize font-medium">
                  {pass.era}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="font-serif font-bold text-base text-stone-900">{pass.worldName}</h3>
                <div className="mt-3 flex items-center justify-between text-xs text-stone-600">
                  <span>Maestria da Era</span>
                  <span className="font-mono font-bold text-stone-900">{pass.masteryPercentage}%</span>
                </div>

                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-stone-800 rounded-full"
                    style={{ width: `${pass.masteryPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
              <span className="flex items-center gap-1 font-medium text-amber-900">
                ⭐ {pass.stampsCount} selos históricos
              </span>
              <span className="font-mono text-[11px] text-stone-500">
                {new Date(pass.unlockedAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
