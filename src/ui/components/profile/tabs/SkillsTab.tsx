import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';

interface SkillsTabProps {
  profile?: UnifiedProfileRecord;
}

/** A escala do domínio medido (`MasteryRecord.level`, 1 a 5). */
const NIVEL = ['', 'Novato', 'Aprendiz', 'Competente', 'Mestre', 'Virtuoso'];

/**
 * AUD-7 — a aba dava a toda conta onze habilidades "Mestre" e "Avançado" em
 * contraponto e cravo, com o selo "Auditado". Agora mostra o domínio que o
 * Laboratório mediu, habilidade por habilidade.
 */
export const SkillsTab: React.FC<SkillsTabProps> = ({ profile }) => {
  const habilidades = profile?.practice?.skills ?? [];

  return (
    <div id="profile-skills-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">Competências musicais</h2>
        <p className="text-xs text-stone-600">O domínio medido nos exercícios do Laboratório</p>
      </div>

      {habilidades.length === 0 ? (
        <Card variant="default" padding="md">
          <p className="text-xs text-stone-600">
            Nenhuma competência medida ainda. Cada habilidade praticada no Laboratório aparece aqui com o nível que
            os exercícios mostrarem.
          </p>
        </Card>
      ) : (
        <Card variant="default" padding="md" className="space-y-4">
          {habilidades.map((s) => (
            <div key={s.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-stone-800">{s.name}</span>
                <span className="font-mono text-stone-600">{s.accuracyRate}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-stone-800 rounded-full" style={{ width: `${s.accuracyRate}%` }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-stone-500">
                <span>
                  Nível {s.currentLevel}/5 • {NIVEL[s.currentLevel] ?? ''}
                </span>
                {s.totalAttempts !== undefined && (
                  <span>
                    {s.totalAttempts} {s.totalAttempts === 1 ? 'tentativa' : 'tentativas'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};
