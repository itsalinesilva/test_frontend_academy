import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import {
  Star,
  ChevronLeft,
  ShieldCheck,
} from 'lucide-react';
import { Skill, MasteryRecord } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter } from '../../navigation/router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { PageLayout } from '../../components/layout/PageLayout';
import { DataGrid } from '../../components/data-display/DataGrid';

export const MasteryScreen: React.FC = () => {
  const { userId } = useCurrentUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [masteries, setMasteries] = useState<MasteryRecord[]>([]);

  useEffect(() => {
    async function loadMastery() {
      if (!userId) return;
      try {
        setLoading(true);
        const [allSkills, overview] = await Promise.all([
          practiceService.listSkills(),
          practiceService.getMasteryOverview(userId),
        ]);
        setSkills(allSkills);
        setMasteries(overview.masteries);
      } catch (err) {
        console.error('Failed to load mastery data', err);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    }
    loadMastery();
  }, []);

  const levelLabels = ['', 'Novato', 'Aprendiz', 'Competente', 'Mestre', 'Virtuoso'];

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-stone-200 rounded" />
        <div className="h-48 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  const masteredCount = masteries.filter((m) => m.level >= 4).length;
  const inProgressCount = masteries.filter((m) => m.level >= 1 && m.level < 4).length;

  return (
    <PageLayout
      id="mastery"
      form="catalog"
      density="operational"
      asideLabel="Domínio"
      state={isLoading ? 'loading' : masteries.length === 0 ? 'empty' : 'content'}
      loadingMessage="Carregando..."
    >
      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Domínio
          </p>
          <p className="text-xs leading-relaxed text-stone-600">
            Domínio exige três execuções seguidas acima do limiar — não um pico isolado.
          </p>
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
            Matriz de Maestria & Competências
          </h1>
          <p className="text-sm text-stone-600 font-sans mt-1">
            Acompanhe o nível de maturidade e retenção em cada habilidade musical canônica.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Card variant="default" padding="sm" className="bg-stone-50 text-center px-4 py-2">
            <span className="text-[10px] uppercase font-mono text-stone-500 block">Habilidades Mestras</span>
            <span className="text-xl font-bold font-mono text-red-900">{masteredCount}</span>
          </Card>
          <Card variant="default" padding="sm" className="bg-stone-50 text-center px-4 py-2">
            <span className="text-[10px] uppercase font-mono text-stone-500 block">Em Progresso</span>
            <span className="text-xl font-bold font-mono text-amber-700">{inProgressCount}</span>
          </Card>
        </div>
      </div>

      {/* Mastery Tiers Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div key={lvl} className="p-3 bg-white rounded-xl border border-stone-200 text-center space-y-1">
            <div className="flex justify-center gap-0.5">
              {[...Array(lvl)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-500" />
              ))}
            </div>
            <span className="text-xs font-bold text-stone-900 block font-serif">
              Nível {lvl}: {levelLabels[lvl]}
            </span>
          </div>
        ))}
      </div>

      {/* Skills Mastery List */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-anil-800" />
          <span>Habilidades Auditadas</span>
        </h2>

        <div className="space-y-3">
          <DataGrid
            id="dominio-habilidades"
            searchable
            pageSize={15}
            data={skills}
            emptyMessage="Nenhuma habilidade registrada ainda."
            onRowClick={(skill) => router.navigate(`/practice/skill/${skill.id}`)}
            columns={[
              { key: 'code', header: 'Código' },
              { key: 'name', header: 'Habilidade' },
              { key: 'category', header: 'Categoria' },
              {
                key: 'id',
                header: 'Domínio',
                render: (skill) => {
                  const m = masteries.find((x) => x.skillId === skill.id);
                  return m ? `nível ${m.level} · ${m.scorePercentage}%` : 'não iniciada';
                },
              },
              {
                key: 'maxMasteryLevel',
                header: 'Tentativas',
                render: (skill) => {
                  const m = masteries.find((x) => x.skillId === skill.id);
                  return m ? `${m.successfulAttempts}/${m.totalAttempts}` : '—';
                },
              },
            ]}
          />
        </div>
      </section>
      </PageLayout.Main>
    </PageLayout>
  );
};
