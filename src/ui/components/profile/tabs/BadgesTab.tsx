import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';

interface BadgesTabProps {
  profile?: UnifiedProfileRecord;
}

/**
 * AUD-7 — a aba dava a toda conta cinco insígnias "Verificado" ("Mestre da
 * Fuga a 4 Vozes", "Curador Canônico"...) com datas de 2023. Agora mostra as
 * insígnias gravadas no perfil, e diz quando não há nenhuma.
 */
export const BadgesTab: React.FC<BadgesTabProps> = ({ profile }) => {
  const insignias = profile?.worlds?.badges ?? [];

  return (
    <div id="profile-badges-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">Insígnias</h2>
        <p className="text-xs text-stone-600">Distinções conquistadas na plataforma</p>
      </div>

      {insignias.length === 0 ? (
        <Card variant="default" padding="md">
          <p className="text-xs text-stone-600">Nenhuma insígnia ainda.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {insignias.map((b) => (
            <Card key={b.id} variant="default" padding="md" className="border-stone-200">
              <span className="text-[10px] uppercase font-mono text-stone-500">{b.category}</span>
              <h3 className="font-serif font-bold text-sm text-stone-900 mt-2">
                <span aria-hidden="true">{b.icon} </span>
                {b.name}
              </h3>
              <p className="mt-3 text-[11px] text-stone-500 font-mono">
                Conquistada em {new Date(b.unlockedAt).toLocaleDateString('pt-BR')}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
