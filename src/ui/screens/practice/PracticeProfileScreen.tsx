import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  Clock,
  Award,
  Flame,
  Trophy,
  Target,
  ChevronLeft,
  Activity,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { PracticeProfile } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter } from '../../navigation/router';
import { useUsuarioAtual } from '../../hooks/useUsuarioAtual';
import { PageLayout } from '../../components/layout/PageLayout';

export const PracticeProfileScreen: React.FC = () => {
  const { userId } = useUsuarioAtual();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<PracticeProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!userId) return;
      try {
        setLoading(true);
        const data = await practiceService.getPracticeProfile(userId);
        setProfile(data);
      } catch (err) {
        console.error('Failed to load practice profile', err);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-stone-200 rounded" />
        <div className="h-64 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <PageLayout
      id="practiceprofile"
      form="detail"
      density="operational"
      asideLabel="Resumo"
      state={isLoading ? 'loading' : !profile ? 'empty' : 'content'}
      loadingMessage="Carregando..."
    >
      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Perfil de prática
          </p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => router.navigate('/practice/history')}>
            Ver histórico
          </Button>
        </Card>
      </PageLayout.Aside>

      <PageLayout.Main>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <button
            onClick={() => router.navigate('/practice')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar para Prática
          </button>
          <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
            Perfil de Prática & Treinamento
          </h1>
          <p className="text-sm text-stone-600 font-sans mt-1">
            Registro consolidado de horas de dedicação, telemetria e competências técnicas.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => router.navigate('/practice')}
          className="bg-anil-800 hover:bg-anil-700 text-white"
        >
          Praticar Agora
        </Button>
      </div>

      {/* Main KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="default" padding="md" className="space-y-1 bg-white border border-stone-200">
          <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-400" /> Tempo Total
          </span>
          <div className="font-mono text-2xl font-bold text-stone-900">
            {Math.round(profile.totalPracticeTimeMinutes / 60)}h {profile.totalPracticeTimeMinutes % 60}m
          </div>
        </Card>

        <Card variant="default" padding="md" className="space-y-1 bg-white border border-stone-200">
          <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-red-600" /> Acurácia Global
          </span>
          <div className="font-mono text-2xl font-bold text-red-900">
            {profile.overallAccuracyPercentage}%
          </div>
        </Card>

        <Card variant="default" padding="md" className="space-y-1 bg-white border border-stone-200">
          <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Ofensiva Ativa
          </span>
          <div className="font-mono text-2xl font-bold text-stone-900">
            {profile.streak.currentStreakDays} Dias
          </div>
        </Card>

        <Card variant="default" padding="md" className="space-y-1 bg-white border border-stone-200">
          <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-purple-600" /> Liga Atual
          </span>
          <div className="font-serif text-lg font-bold text-purple-900 truncate">
            {profile.currentLeague}
          </div>
        </Card>
      </div>

      {/* Mastery Breakdown & Preferred Modalities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mastery Distribution */}
        <Card variant="default" padding="md" className="space-y-4 bg-white border border-stone-200">
          <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-anil-800" />
            <span>Distribuição de Níveis de Maestria</span>
          </h2>

          <div className="space-y-3">
            {[
              { label: 'Nível 5: Virtuoso', count: profile.masteryCount.virtuoso, color: 'bg-purple-600' },
              { label: 'Nível 4: Mestre', count: profile.masteryCount.mestre, color: 'bg-anil-800' },
              { label: 'Nível 3: Competente', count: profile.masteryCount.competente, color: 'bg-amber-600' },
              { label: 'Nível 2: Aprendiz', count: profile.masteryCount.aprendiz, color: 'bg-blue-600' },
              { label: 'Nível 1: Novato', count: profile.masteryCount.novato, color: 'bg-stone-500' },
            ].map((tier) => (
              <div key={tier.label} className="flex items-center justify-between text-xs font-mono">
                <span className="text-stone-700">{tier.label}</span>
                <span className="font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                  {tier.count} Habilidades
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.navigate('/practice/mastery')}
              className="w-full text-xs"
            >
              Ver Matriz Completa de Maestria
            </Button>
          </div>
        </Card>

        {/* Preferred Modalities */}
        <Card variant="default" padding="md" className="space-y-4 bg-white border border-stone-200">
          <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-700" />
            <span>Foco por Modalidade de Entrada</span>
          </h2>

          <div className="space-y-3">
            {profile.preferredModalities.map((item) => (
              <div key={item.modality} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="capitalize text-stone-700">{item.modality}</span>
                  <span className="font-bold text-stone-900">{item.percentage}%</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-anil-800 h-full rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.navigate('/practice/skill-tree')}
              className="w-full text-xs"
            >
              Explorar Novas Árvores de Habilidades
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Practice Results */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-anil-800" />
          <span>Sessões Recentes & Evidências Geradas</span>
        </h2>

        <div className="space-y-3">
          {profile.recentResults.map((result) => (
            <Card
              key={result.id}
              variant="default"
              padding="md"
              className="flex items-center justify-between gap-4 hover:border-anil-800 transition-all cursor-pointer"
              onClick={() => router.navigate(`/practice/result/${result.id}`)}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">{result.modality}</Badge>
                  <span className="text-xs font-mono text-stone-400">
                    {new Date(result.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-stone-900 text-sm">
                  {result.exerciseTitle}
                </h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-red-900">
                    {result.summaryScore}/1000
                  </span>
                  <span className="text-[10px] font-mono text-stone-400 block">
                    Acurácia: {result.pitchAccuracy}%
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </div>
            </Card>
          ))}
        </div>
      </section>
      </PageLayout.Main>
    </PageLayout>
  );
};
