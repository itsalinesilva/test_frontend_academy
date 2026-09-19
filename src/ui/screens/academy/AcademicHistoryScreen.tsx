import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { DataGrid } from '../../components/data-display/DataGrid';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import { AcademicHistoryEntry } from '../../../domain/academy';

/** Rotulos legiveis dos atos academicos registrados. */
const ACT_LABEL: Record<string, string> = {
  course_enrolled: 'Matricula',
  lesson_completed: 'Licao concluida',
  activity_attempt: 'Atividade',
  assessment_submitted: 'Avaliacao',
  course_completed: 'Curso concluido',
  certificate_issued: 'Certificado emitido',
};

export const AcademicHistoryScreen: React.FC = () => {
  const { navigate } = useRouter();

  const [historyEntries, setHistoryEntries] = useState<AcademicHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const session = await authService.getActiveSession();
        // Sem sessao nao ha progresso a carregar nem a gravar: o fallback
        // anterior misturava dados de visitantes anonimos com os da
        // fundadora (CLAUDE_AUDIT.md T-05).
        if (!session) return;
        const userId = session.user.id;

        const entries = await academyService.listUserAuditEntries(userId);
        setHistoryEntries(entries);
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageLayout
      id="academic-history"
      form="catalog"
      density="operational"
      asideLabel="Resumo do registro"
      state={isLoading ? 'loading' : historyEntries.length === 0 ? 'empty' : 'content'}
      loadingMessage="Carregando o livro de registro acadêmico…"
      emptyProps={{
        title: 'Seu histórico ainda está vazio',
        description:
          'Cada lição concluída, avaliação realizada e certificado emitido fica registrado aqui de forma auditável.',
        actionLabel: 'Ir ao catálogo',
        onAction: () => navigate('/academy/catalog'),
      }}
    >
      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Livro de registro
          </p>
          <dl className="space-y-1.5 text-xs text-stone-700">
            <div className="flex items-center justify-between">
              <dt>Atos registrados</dt>
              <dd className="font-mono font-bold">{historyEntries.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Licoes</dt>
              <dd className="font-mono font-bold">
                {historyEntries.filter((e) => e.type === 'lesson_completed').length}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Avaliacoes</dt>
              <dd className="font-mono font-bold">
                {historyEntries.filter((e) => e.type === 'assessment_submitted').length}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-stone-100 pt-1.5">
              <dt>Certificados</dt>
              <dd className="font-mono font-bold">
                {historyEntries.filter((e) => e.type === 'certificate_issued').length}
              </dd>
            </div>
          </dl>
          <Button variant="outline" size="sm" className="w-full" onClick={handlePrint}>
            Exportar / imprimir
          </Button>
          <p className="text-[11px] leading-relaxed text-stone-500">
            Registro append-only: atos nao sao editados nem removidos.
          </p>
        </Card>
      </PageLayout.Aside>

      <PageLayout.Main>
        {/* Densidade operacional com DataGrid — o livro-razao e uma tabela
            ordenavel e pesquisavel, nao uma lista de cards. O componente
            existia com 237 linhas e zero usos (01_REPOSITORY_AUDIT I.4). */}
        <DataGrid
          id="academic-history-grid"
          data={historyEntries}
          searchable
          pageSize={25}
          emptyMessage="Nenhum ato academico registrado."
          columns={[
            {
              key: 'timestamp',
              header: 'Data',
              sortable: true,
              width: '150px',
              render: (row) => (
                <span className="font-mono text-[11px] text-stone-600">
                  {new Date(row.timestamp).toLocaleString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              ),
            },
            {
              key: 'type',
              header: 'Ato',
              sortable: true,
              width: '170px',
              render: (row) => <span className="text-xs">{ACT_LABEL[row.type] ?? row.type}</span>,
            },
            {
              key: 'contentTitle',
              header: 'Conteudo',
              sortable: true,
              render: (row) => (
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-stone-900">{row.contentTitle}</p>
                  {row.skills.length > 0 && (
                    <p className="text-[11px] text-stone-500">{row.skills.join(' | ')}</p>
                  )}
                </div>
              ),
            },
            {
              key: 'score',
              header: 'Nota',
              sortable: true,
              width: '80px',
              render: (row) =>
                row.score === undefined ? (
                  <span className="text-stone-300" aria-label="sem nota">--</span>
                ) : (
                  <span className="font-mono text-xs font-bold text-stone-900">{row.score}</span>
                ),
            },
            {
              key: 'contentVersion',
              header: 'Versao',
              width: '90px',
              render: (row) => (
                <span className="font-mono text-[11px] text-stone-500">{row.contentVersion}</span>
              ),
            },
          ]}
        />
      </PageLayout.Main>
    </PageLayout>
  );
};
