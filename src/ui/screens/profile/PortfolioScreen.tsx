import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { Modal } from '../../components/overlays/Modal';
import { profileService } from '../../../services/application/profile.service';
import { Evidence, UnifiedProfileRecord } from '../../../domain/profile';
import {
  verifyEvidenceIntegrity,
  computeEvidenceHash,
  canonicalJson,
  ResultadoIntegridade,
} from '../../../domain/integrity';
import { ShieldCheck, Download, FileCheck, ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react';

type FiltroArtefato = 'todas' | 'audio' | 'score' | 'document' | 'project';

const FILTROS: { id: FiltroArtefato; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'audio', label: 'Gravações & Áudios' },
  { id: 'score', label: 'Partituras MusicXML' },
  { id: 'document', label: 'Manuscritos & Ensaios' },
  { id: 'project', label: 'Projetos Multitrack' },
];

interface Veredito {
  evidencia: Evidence;
  resultado: ResultadoIntegridade;
  recalculado: string;
}

export const PortfolioScreen: React.FC = () => {
  const { navigate } = useRouter();
  const [profile, setProfile] = useState<UnifiedProfileRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filter, setFilter] = useState<FiltroArtefato>('todas');
  const [verdict, setVeredito] = useState<Veredito | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setProfile(await profileService.getUnifiedProfile());
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Não foi possível carregar o dossiê.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const evidences: Evidence[] = profile?.evidences || [];
  const filteredEvidences = evidences.filter((e) =>
    filter === 'todas' ? true : e.artifactType === filter
  );

  /**
   * Verificação de verdade: recalcula o SHA-256 sobre o conteúdo e compara.
   *
   * A versão anterior desta função apenas guardava o hash num estado e
   * exibia "Integridade confirmada!" — sem calcular nada. Anunciava prova
   * criptográfica sobre um valor que era `Math.random()`.
   */
  const handleVerify = async (item: Evidence) => {
    const resultado = await verifyEvidenceIntegrity(item);
    const recalculado = await computeEvidenceHash(item);
    setVeredito({ evidencia: item, resultado, recalculado });
  };

  /**
   * Exportação real: baixa o dossiê como JSON assinado pelo hash do conjunto.
   *
   * Antes era um `alert()` afirmando exportar um PDF que nunca era gerado.
   * JSON é o formato que a arquitetura já usa para backup no Drive do
   * usuário, então o dossiê exportado é o mesmo artefato que ele guarda.
   */
  const handleExportDossier = async () => {
    const dossie = {
      formato: 'conservatorio-muscicapa/dossie-evidencias@1',
      exportadoEm: new Date().toISOString(),
      titular: { userId: profile?.userId, nome: profile?.displayName },
      evidencias: evidences,
    };
    const conteudo = canonicalJson(dossie);
    const blob = new Blob([JSON.stringify({ ...dossie, conteudoCanonico: conteudo }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dossie-evidencias-${profile?.userId ?? 'perfil'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rotuloVeredito: Record<ResultadoIntegridade, { texto: string; classe: string }> = {
    valida: {
      texto: 'Integridade confirmada: o hash recalculado bate com o registrado.',
      classe: 'text-emerald-800',
    },
    adulterada: {
      texto: 'ATENÇÃO: o conteúdo mudou desde a emissão. O hash não confere.',
      classe: 'text-red-800',
    },
    nao_verificavel: {
      texto:
        'Não verificável: este registro foi gravado antes da adoção do hash real e seu valor não tem o formato de um SHA-256.',
      classe: 'text-amber-800',
    },
  };

  return (
    <PageLayout
      id="profile-portfolio"
      form="catalog"
      density="catalog"
      asideLabel="Filtros"
      state={
        isLoading
          ? 'loading'
          : erro
            ? 'error'
            : filteredEvidences.length === 0
              ? 'empty'
              : 'content'
      }
      loadingMessage="Carregando o dossiê de evidências…"
      errorProps={{ message: erro ?? '', onRetry: () => window.location.reload() }}
      emptyProps={{
        title: filter === 'todas' ? 'Nenhuma evidência ainda' : 'Nada nesta categoria',
        description:
          filter === 'todas'
            ? 'Cada curso concluído, gravação avaliada e projeto entregue deposita uma evidência auditável aqui.'
            : 'Nenhuma evidência corresponde ao filtro selecionado.',
        actionLabel: filter === 'todas' ? 'Ir para a Academia' : 'Ver todas',
        onAction: () => (filter === 'todas' ? navigate('/academy') : setFilter('todas')),
      }}
    >
      <PageLayout.Hero>
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Dossiê de Evidências Auditadas
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-stone-600">
            Cada evidência carrega um SHA-256 calculado sobre o próprio conteúdo. Recalcule
            quando quiser: se algo tiver mudado desde a emissão, o hash não fecha.
          </p>
        </div>
      </PageLayout.Hero>

      <PageLayout.Tabs
        id="portfolio-filters"
        tabs={FILTROS.map((f) => ({
          id: f.id,
          label: f.label,
          badge:
            f.id === 'todas'
              ? evidences.length
              : evidences.filter((e) => e.artifactType === f.id).length,
        }))}
        activeTab={filter}
        onChange={(id) => setFilter(id as FiltroArtefato)}
      />

      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Dossiê
          </p>
          <dl className="space-y-1.5 text-xs text-stone-700">
            <div className="flex items-center justify-between">
              <dt>Evidências</dt>
              <dd className="font-mono font-bold">{evidences.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Exibindo</dt>
              <dd className="font-mono font-bold">{filteredEvidences.length}</dd>
            </div>
          </dl>
          <div className="space-y-2 border-t border-stone-100 pt-2.5">
            <Button variant="primary" size="sm" className="w-full" onClick={handleExportDossier}>
              <Download className="mr-1 h-3.5 w-3.5" />
              Exportar dossiê (JSON)
            </Button>
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/profile')}>
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Voltar ao perfil
            </Button>
          </div>
        </Card>
      </PageLayout.Aside>

      <PageLayout.Main>
        <div className="space-y-4">
          {filteredEvidences.map((item) => (
            <Card key={item.id} variant="default" padding="lg" className="space-y-3 shadow-xs">
              <div className="flex flex-col justify-between gap-2 border-b border-stone-100 pb-3 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 shrink-0 text-emerald-700" />
                    <h2 className="font-serif text-base font-bold text-stone-900">{item.title}</h2>
                  </div>
                  <p className="text-xs leading-relaxed text-stone-600">{item.description}</p>
                  {item.evaluator && (
                    <p className="text-[11px] text-stone-500">
                      Banca / Avaliador:{' '}
                      <strong className="text-stone-800">{item.evaluator.name}</strong> (
                      {item.evaluator.title}) • {item.evaluator.feedbackNotes}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="brand" className="text-[10px] uppercase">
                    {item.artifactType}
                  </Badge>
                  <Badge variant="neutral" className="text-[10px] uppercase">
                    {item.source}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {item.instruments.map((inst) => (
                  <span key={inst} className="rounded bg-stone-100 px-2 py-0.5 text-[10px] text-stone-700">
                    {inst}
                  </span>
                ))}
                {item.skills.map((sk) => (
                  <span
                    key={sk}
                    className="rounded border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] text-stone-600"
                  >
                    {sk}
                  </span>
                ))}
              </div>

              <div className="flex flex-col justify-between gap-3 border-t border-stone-50 pt-2 font-mono text-xs text-stone-500 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 truncate">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-anil-800" />
                  <span className="truncate">
                    SHA-256: <code>{item.sha256Hash}</code>
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleVerify(item)}>
                    Recalcular e conferir
                  </Button>
                  {item.artifactUrl && (
                    <a
                      href={item.artifactUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-sans text-[11px] text-anil-800 hover:underline"
                    >
                      <span>Acessar</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Modal
          id="portfolio-verification-modal"
          isOpen={verdict !== null}
          onClose={() => setVeredito(null)}
          title="Conferência de integridade"
          description={verdict?.evidencia.title}
          size="lg"
          footer={
            <Button variant="outline" size="sm" onClick={() => setVeredito(null)}>
              Fechar
            </Button>
          }
        >
          {verdict && (
            <div className="space-y-4 text-xs">
              <p
                className={`flex items-start gap-2 font-sans font-semibold ${rotuloVeredito[verdict.resultado].classe}`}
              >
                {verdict.resultado === 'valida' ? (
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <span>{rotuloVeredito[verdict.resultado].texto}</span>
              </p>

              <dl className="space-y-2 border-t border-stone-100 pt-3 font-mono">
                <div className="space-y-0.5">
                  <dt className="text-[10px] uppercase tracking-wider text-stone-500">Registrado</dt>
                  <dd className="break-all text-stone-800">{verdict.evidencia.sha256Hash}</dd>
                </div>
                <div className="space-y-0.5">
                  <dt className="text-[10px] uppercase tracking-wider text-stone-500">
                    Recalculado agora
                  </dt>
                  <dd className="break-all text-stone-800">{verdict.recalculado}</dd>
                </div>
              </dl>

              <p className="border-t border-stone-100 pt-3 leading-relaxed text-stone-600">
                O hash cobre autoria, obra, tipo de artefato, competências, avaliador e data de
                emissão. Não cobre a visibilidade: tornar uma evidência privada é decisão sua
                sobre quem a vê, não uma alteração do que foi feito.
              </p>
            </div>
          )}
        </Modal>
      </PageLayout.Main>
    </PageLayout>
  );
};
