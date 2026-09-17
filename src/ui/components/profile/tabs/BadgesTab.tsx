import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { ShieldCheck } from 'lucide-react';

interface BadgesTabProps {
  profile?: UnifiedProfileRecord;
}

export const BadgesTab: React.FC<BadgesTabProps> = () => {
  const badges = [
    {
      id: 'bdg-1',
      title: 'Mestre da Fuga a 4 Vozes',
      category: 'Contraponto',
      description: 'Análise morfológica de 12 fugas completas com marcação semântica de contrassujeitos',
      unlockedAt: '12/10/2023',
      tier: 'Ouro',
    },
    {
      id: 'bdg-2',
      title: 'Guardião do Teclado Histórico',
      category: 'Performance',
      description: 'Dominou afinação Valotti e execução de baixo contínuo em 3 óperas barrocas',
      unlockedAt: '05/11/2023',
      tier: 'Platina',
    },
    {
      id: 'bdg-3',
      title: 'Constância de Ferro (Streak 30)',
      category: 'Prática',
      description: 'Manteve 30 dias ininterruptos de prática com metrônomo e afinador',
      unlockedAt: '20/12/2023',
      tier: 'Ouro',
    },
    {
      id: 'bdg-4',
      title: 'Voz da Comunidade Erudita',
      category: 'Comunidade',
      description: 'Respostas aceitas em fóruns analíticos com nota de rigor histórico',
      unlockedAt: '15/01/2024',
      tier: 'Prata',
    },
    {
      id: 'bdg-5',
      title: 'Curador Canônico',
      category: 'Edição',
      description: 'Publicação de edição crítica com notas filológicas revisadas por pares',
      unlockedAt: '02/02/2024',
      tier: 'Platina',
    },
  ];

  return (
    <div id="profile-badges-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">
          Distinções & Selos de Conquista
        </h2>
        <p className="text-xs text-stone-600">
          Insígnias verificadas outorgadas por rigor analítico, assiduidade e contribuição acadêmica
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((b) => (
          <Card key={b.id} variant="default" padding="md" className="border-stone-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-[10px] uppercase font-mono text-stone-500">{b.category}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    b.tier === 'Platina'
                      ? 'bg-slate-200 text-slate-900 border border-slate-300'
                      : b.tier === 'Ouro'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-stone-200 text-stone-800'
                  }`}
                >
                  {b.tier}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="font-serif font-bold text-sm text-stone-900">{b.title}</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{b.description}</p>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center gap-1 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" /> Verificado
              </span>
              <span className="font-mono">Desbloqueado em {b.unlockedAt}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
