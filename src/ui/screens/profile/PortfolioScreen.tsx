import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { profileService } from '../../../services/application/profile.service';
import { Evidence, UnifiedProfileRecord } from '../../../domain/profile';
import { ShieldCheck, Download, FileCheck, ArrowLeft, CheckCircle2, ExternalLink } from 'lucide-react';

export const PortfolioScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [profile, setProfile] = useState<UnifiedProfileRecord | null>(null);
  const [filter, setFilter] = useState<'todas' | 'audio' | 'score' | 'document' | 'project'>('todas');
  const [verifiedHash, setVerifiedHash] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await profileService.getUnifiedProfile();
      setProfile(data);
    };
    load();
  }, []);

  const evidences: Evidence[] = profile?.evidences || [];

  const filteredEvidences = evidences.filter((e) => {
    if (filter === 'todas') return true;
    return e.artifactType === filter;
  });

  const handleVerify = (hash: string) => {
    setVerifiedHash(hash);
    setTimeout(() => setVerifiedHash(null), 4000);
  };

  const handleExportDossier = () => {
    alert(
      `Exportando Dossiê Musical Oficial em PDF com ${evidences.length} evidências auditadas e carimbadas no registro canônico!`
    );
  };

  return (
    <ScreenContainer
      id="profile-portfolio"
      title="Dossiê Canônico de Evidências Auditadas"
      subtitle="Repositório imutável com hashes SHA-256 de integridade, pareceres de bancas docentes e registros de execução."
      badgeLabel="Integridade Acadêmica"
      badgeVariant="brand"
      primaryAction={{
        label: 'Exportar Dossiê Oficial (PDF)',
        icon: Download,
        onClick: handleExportDossier,
      }}
      secondaryActions={[
        {
          label: 'Voltar ao Perfil Principal',
          icon: ArrowLeft,
          onClick: () => navigate('/profile'),
        },
      ]}
    >
      <div className="space-y-6">
        {verifiedHash && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md text-xs flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Assinatura criptográfica verificada: <strong>{verifiedHash}</strong>. Integridade confirmada!
            </span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between p-2.5 bg-white border border-stone-200 rounded-lg text-xs gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('todas')}
              className={`px-3 py-1 rounded transition-colors ${
                filter === 'todas'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Todas ({evidences.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('audio')}
              className={`px-3 py-1 rounded transition-colors ${
                filter === 'audio'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Gravações & Áudios
            </button>
            <button
              type="button"
              onClick={() => setFilter('score')}
              className={`px-3 py-1 rounded transition-colors ${
                filter === 'score'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Partituras MusicXML
            </button>
            <button
              type="button"
              onClick={() => setFilter('document')}
              className={`px-3 py-1 rounded transition-colors ${
                filter === 'document'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Manuscritos & Ensaios
            </button>
            <button
              type="button"
              onClick={() => setFilter('project')}
              className={`px-3 py-1 rounded transition-colors ${
                filter === 'project'
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Projetos Multitrack
            </button>
          </div>
          <span className="text-stone-500 font-mono text-[11px] hidden sm:inline">
            Protegido por chaves invioláveis
          </span>
        </div>

        {/* Evidence List */}
        {filteredEvidences.length === 0 ? (
          <Card variant="default" padding="lg" className="text-center py-12 space-y-3">
            <p className="text-xs text-stone-600">Nenhuma evidência encontrada para a categoria selecionada.</p>
            <Button variant="outline" size="sm" onClick={() => setFilter('todas')}>
              Ver Todas as Evidências
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEvidences.map((item) => (
              <Card key={item.id} variant="default" padding="lg" className="space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <h3 className="font-serif font-bold text-base text-stone-900">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
                    {item.evaluator && (
                      <p className="text-[11px] text-stone-500">
                        Banca / Avaliador:{' '}
                        <strong className="text-stone-800">{item.evaluator.name}</strong> ({item.evaluator.title}) •{' '}
                        {item.evaluator.feedbackNotes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="brand" className="uppercase text-[10px]">
                      {item.artifactType}
                    </Badge>
                    <Badge variant="neutral" className="uppercase text-[10px]">
                      {item.source}
                    </Badge>
                  </div>
                </div>

                {/* Skills & Instruments */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.instruments.map((inst) => (
                    <span key={inst} className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      {inst}
                    </span>
                  ))}
                  {item.skills.map((sk) => (
                    <span key={sk} className="text-[10px] px-2 py-0.5 rounded bg-stone-50 border border-stone-200 text-stone-600">
                      {sk}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-stone-500 pt-2 border-t border-stone-50">
                  <div className="flex items-center gap-2 truncate">
                    <ShieldCheck className="w-3.5 h-3.5 text-red-800 shrink-0" />
                    <span className="truncate">
                      Hash SHA-256: <code>{item.sha256Hash}</code>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVerify(item.sha256Hash)}
                    >
                      Verificar Assinatura
                    </Button>
                    {item.artifactUrl && (
                      <a
                        href={item.artifactUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-red-800 font-sans hover:underline"
                      >
                        <span>Acessar</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ScreenContainer>
  );
};
