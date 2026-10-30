import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  Trophy,
  Flame,
  Star,
  CheckCircle2,
  TrendingUp,
  Activity,
  FileCheck,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { PracticeResult } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter, useRouteParams } from '../../navigation/router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { MeasurementPanel } from '../../components/practice/MeasurementPanel';
import { PageLayout } from '../../components/layout/PageLayout';

export const PracticeResultScreen: React.FC = () => {
  const router = useRouter();
  const { userId } = useCurrentUser();
  const params = useRouteParams();
  const resultId = params.id || '';

  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<PracticeResult | null>(null);

  useEffect(() => {
    async function loadResult() {
      try {
        setLoading(true);
        const res = await practiceService.getResult(resultId, userId ?? "");
        setResult(res);
      } catch (err) {
        console.error('Failed to load practice result', err);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    }
    loadResult();
  }, [resultId]);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-stone-200 rounded" />
        <div className="h-64 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-stone-900">Resultado não encontrado</h2>
        <Button variant="outline" onClick={() => router.navigate('/practice')}>
          Voltar para Prática
        </Button>
      </div>
    );
  }

  const { medicao, masteryAdvancement } = result;

  return (
    <PageLayout
      id="practiceresult"
      form="focus"
      density="editorial"
      state={isLoading ? 'loading' : !result ? 'empty' : 'content'}
      loadingMessage="Carregando..."
    >
      <PageLayout.Main>
      {/* Top Victory Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white shadow-xl border border-stone-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-anil-950 text-red-300 border border-anil-800">
                Sessão Concluída
              </span>
              <Badge variant="neutral">{result.modality}</Badge>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
              Diagnóstico de Desempenho Musical
            </h1>
            <p className="text-xs text-stone-400 font-sans">
              {result.exerciseTitle} • Duração: {Math.round(result.durationSeconds / 60)} min
            </p>
          </div>

          <div className="p-4 bg-stone-800/80 rounded-xl border border-stone-700 text-center shrink-0">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">Score de Sessão</span>
            <span className="font-mono text-3xl font-bold text-red-400">
              {result.summaryScore}
            </span>
            <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
              Escala Canônica /1000
            </span>
          </div>
        </div>

        {/* Gamification Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-700/60">
          <div className="flex items-center gap-3 p-2.5 bg-stone-800/50 rounded-lg border border-stone-700/50">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-mono block">Ofensiva</span>
              <span className="text-xs font-bold text-white font-mono">
                {result.streakIncremented ? 'Mantida (+1 Dia)' : 'Ativa Hoje'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 bg-stone-800/50 rounded-lg border border-stone-700/50">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-mono block">XP Ganho</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                +{result.xpGained} XP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 bg-stone-800/50 rounded-lg border border-stone-700/50">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Star className="w-4 h-4 fill-purple-400" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-mono block">Maestria</span>
              <span className="text-xs font-bold text-purple-300 font-mono">
                {masteryAdvancement?.leveledUp
                  ? `Nível ${masteryAdvancement.newLevel} Alcançado!`
                  : `Nível ${masteryAdvancement?.newLevel || 1} Mantido`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Evidence Alert */}
      {result.evidenceGeneratedId && (
        <Card variant="default" padding="md" className="bg-emerald-50/70 border border-emerald-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileCheck className="w-6 h-6 text-emerald-700 shrink-0" />
            <div>
              <h3 className="font-serif font-bold text-sm text-emerald-950">
                Evidência Oficial Ingerida no Portfólio de Aprendizagem
              </h3>
              <p className="text-xs text-emerald-800 font-sans">
                Esta sessão gerou um artefato auditável com ID <span className="font-mono">{result.evidenceGeneratedId}</span> acessível no seu Portfólio.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.navigate('/profile/portfolio')}
            className="shrink-0 bg-white border-emerald-400 text-emerald-900 hover:bg-emerald-100"
          >
            Ver Portfólio
          </Button>
        </Card>
      )}

      {/* 10 Measurements Grid */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-anil-800" />
          <span>Medições Acústicas & Telemetria</span>
        </h2>

        {/*
          Aqui havia dez celulas fixas, todas sempre preenchidas — inclusive
          quando nao havia o que medir. O painel unico mostra o que foi medido
          e diz, com a razao, o que nao foi.
        */}
        <MeasurementPanel medicao={medicao} variante="completo" id="resultado-medicao" />
      </section>

      {/* Recommendations & Feedback points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="default" padding="md" className="space-y-3 bg-white border border-stone-200">
          <h3 className="font-serif font-bold text-sm text-stone-900">
            Pontos de Observação do Motor de Medição
          </h3>
          <ul className="space-y-2">
            {result.feedbackPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-stone-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card variant="default" padding="md" className="space-y-3 bg-white border border-stone-200">
          <h3 className="font-serif font-bold text-sm text-stone-900">
            Recomendações para Próximas Sessões
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-stone-600">
                <TrendingUp className="w-4 h-4 text-anil-800 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Action Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200">
        <Button
          variant="outline"
          size="md"
          onClick={() => router.navigate('/practice')}
        >
          Voltar para Prática Home
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => router.navigate('/practice?aba=licoes')}
            className="flex items-center gap-2"
          >
            <span>Ver Árvore de Habilidades</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => router.navigate('/practice')}
            className="flex items-center gap-2 bg-anil-800 hover:bg-anil-700 text-white"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Iniciar Próximo Ciclo</span>
          </Button>
        </div>
      </div>
      </PageLayout.Main>
    </PageLayout>
  );
};
