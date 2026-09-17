import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { ShieldCheck, Copy } from 'lucide-react';

interface CredentialsTabProps {
  profile: UnifiedProfileRecord;
}

export const CredentialsTab: React.FC<CredentialsTabProps> = ({ profile }) => {
  const evidences = profile.evidences || [];

  const copyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash);
  };

  return (
    <div id="profile-credentials-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">
          Credenciais Oficiais & Dossiê Criptográfico
        </h2>
        <p className="text-xs text-stone-600">
          Certificados acadêmicos e microcredenciais com prova matemática de integridade (SHA-256)
        </p>
      </div>

      <div className="space-y-4">
        {evidences.map((ev) => (
          <Card key={ev.id} variant="default" padding="lg">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-sm text-stone-900">{ev.title}</h3>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Auditado
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">{ev.description}</p>
              </div>

              <span className="text-xs font-mono text-stone-500 whitespace-nowrap">
                {new Date(ev.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {/* Evaluator Notes */}
            {ev.evaluator && (
              <div className="mt-3 p-3 bg-stone-50 rounded border border-stone-200 text-xs">
                <div className="flex items-center justify-between text-stone-700">
                  <span className="font-semibold">Avaliador Oficial: {ev.evaluator.name}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-stone-200 rounded">
                    {ev.evaluator.decision.replace(/_/g, ' ')}
                  </span>
                </div>
                {ev.evaluator.feedbackNotes && (
                  <p className="text-stone-600 mt-1.5 italic">"{ev.evaluator.feedbackNotes}"</p>
                )}
              </div>
            )}

            {/* Cryptographic SHA-256 Hash */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500 overflow-hidden">
                <span className="font-semibold text-stone-700 shrink-0">SHA-256:</span>
                <span className="truncate max-w-xs sm:max-w-md">{ev.sha256Hash}</span>
              </div>
              <button
                onClick={() => copyHash(ev.sha256Hash)}
                className="text-[11px] text-stone-600 hover:text-stone-900 flex items-center gap-1 shrink-0 font-medium"
              >
                <Copy className="w-3 h-3" /> Copiar Hash
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
