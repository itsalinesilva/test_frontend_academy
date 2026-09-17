import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import {
  History,
  ChevronLeft,
} from 'lucide-react';
import { PracticeResult } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter } from '../../navigation/router';
import { useUsuarioAtual } from '../../hooks/useUsuarioAtual';
import { PageLayout } from '../../components/layout/PageLayout';
import { DataGrid } from '../../components/data-display/DataGrid';

export const PracticeHistoryScreen: React.FC = () => {
  const { userId } = useUsuarioAtual();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<PracticeResult[]>([]);

  useEffect(() => {
    async function loadHistory() {
      if (!userId) return;
      try {
        setLoading(true);
        const results = await practiceService.getPracticeHistory(userId);
        setHistory(results.reverse());
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-stone-200 rounded" />
        <div className="h-64 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  return (
    <PageLayout
      id="practicehistory"
      form="catalog"
      density="operational"
      asideLabel="Filtros"
      state={isLoading ? 'loading' : history.length === 0 ? 'empty' : 'content'}
      loadingMessage="Carregando..."
    >
      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Histórico
          </p>
          <dl className="space-y-1.5 text-xs text-stone-700">
            <div className="flex items-center justify-between">
              <dt>Sessões</dt>
              <dd className="font-mono font-bold">{history.length}</dd>
            </div>
          </dl>
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
            Histórico de Sessões Praticadas
          </h1>
          <p className="text-sm text-stone-600 font-sans mt-1">
            Auditoria completa de sessões, pontuações acústicas e evidências geradas.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.navigate('/practice')}
        >
          Iniciar Nova Prática
        </Button>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center py-12 space-y-4">
          <History className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-stone-900">
            Nenhuma sessão registrada ainda
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Inicie um treino de teclado, voz ou percepção rítmica para gerar relatórios de telemetria e evidências.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => router.navigate('/practice')}
          >
            Começar a Praticar
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <DataGrid
            id="historico-pratica"
            searchable
            pageSize={12}
            data={history}
            emptyMessage="Nenhuma sessão registrada ainda."
            onRowClick={(item) => router.navigate(`/practice/result/${item.id}`)}
            columns={[
              {
                key: 'createdAt',
                header: 'Data',
                render: (item) => new Date(item.createdAt).toLocaleDateString('pt-BR'),
              },
              { key: 'modality', header: 'Modalidade' },
              { key: 'exerciseTitle', header: 'Exercício' },
              {
                key: 'durationSeconds',
                header: 'Duração',
                render: (item) => `${Math.round(item.durationSeconds / 60)} min`,
              },
              {
                key: 'summaryScore',
                header: 'Nota',
                render: (item) =>
                  item.medicao?.notaGlobal !== null && item.medicao?.notaGlobal !== undefined
                    ? `${item.medicao.notaGlobal}/100`
                    : 'não medida',
              },
              { key: 'xpGained', header: 'XP' },
            ]}
          />
        </div>
      )}
      </PageLayout.Main>
    </PageLayout>
  );
};
