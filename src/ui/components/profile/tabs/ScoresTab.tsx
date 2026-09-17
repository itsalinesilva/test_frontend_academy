import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { ExternalLink } from 'lucide-react';

interface ScoresTabProps {
  profile: UnifiedProfileRecord;
}

export const ScoresTab: React.FC<ScoresTabProps> = ({ profile }) => {
  const scores = profile.scoresList || [];

  return (
    <div id="profile-scores-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">
          Partituras, Edições Críticas & Transcrições
        </h2>
        <p className="text-xs text-stone-600">
          Acervo de notações musicais com análise morfológica, realização de baixo cifrado e notação Urtext
        </p>
      </div>

      <div className="space-y-4">
        {scores.map((score) => (
          <Card key={score.id} variant="default" padding="lg">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-sm text-stone-900">{score.title}</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                    {score.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  {score.workReference} • Composição original: {score.composer}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {score.previewUrl && (
                  <a
                    href={score.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-stone-100 text-stone-800 hover:bg-stone-200 font-medium transition-colors"
                  >
                    Ver no IMSLP <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Score Anatomy Details */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-stone-50 rounded border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase block font-semibold">Tonalidade</span>
                <span className="font-medium text-stone-800 mt-0.5 block">{score.keySignature}</span>
              </div>

              <div className="p-2.5 bg-stone-50 rounded border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase block font-semibold">Fórmula de Compasso</span>
                <span className="font-medium text-stone-800 mt-0.5 block">{score.timeSignature}</span>
              </div>

              <div className="p-2.5 bg-stone-50 rounded border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase block font-semibold">Extensão</span>
                <span className="font-medium text-stone-800 mt-0.5 block">{score.pagesCount} páginas</span>
              </div>

              <div className="p-2.5 bg-stone-50 rounded border border-stone-200">
                <span className="text-[10px] text-stone-500 uppercase block font-semibold">Claves Empregadas</span>
                <span className="font-medium text-stone-800 mt-0.5 block truncate">
                  {score.clefs.join(', ')}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
