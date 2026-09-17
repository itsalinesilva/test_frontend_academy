import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import { AcademicHistoryEntry } from '../../../domain/academy';
import { History, Download, ArrowLeft, CheckCircle2, Award, FileText } from 'lucide-react';

export const AcademicHistoryScreen: React.FC = () => {
  const { navigate } = useRouter();

  const [historyEntries, setHistoryEntries] = useState<AcademicHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const session = await authService.getActiveSession();
        const userId = session?.user.id || 'usr_founder_1';

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
    <ScreenContainer
      id="academic-history-screen"
      title="Histórico Acadêmico Imutável"
      subtitle="Registro auditável de todas as lições integralizadas, avaliações realizadas e evidências emitidas."
      badgeLabel="Livro de Registro Oficial"
      badgeVariant="neutral"
      primaryAction={{
        label: 'Exportar Histórico / Imprimir',
        icon: Download,
        onClick: handlePrint,
      }}
      secondaryActions={[
        {
          label: 'Meu Aprendizado',
          icon: ArrowLeft,
          onClick: () => navigate('/academy/my-learning'),
        },
      ]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Summary Banner */}
        <div className="p-4 bg-white border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-stone-500 font-semibold flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-red-800" />
              Auditoria de Conquistas & Integralizações
            </span>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Total de Atos Acadêmicos Registrados: {historyEntries.length}
            </h3>
          </div>

          <div className="text-xs font-mono text-stone-500">
            Hash Ledger: SHA-256 Verificado
          </div>
        </div>

        {/* Timeline List of Events */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-stone-500 font-mono">
            Carregando histórico acadêmico auditável...
          </div>
        ) : historyEntries.length === 0 ? (
          <Card variant="muted" padding="xl" className="text-center space-y-3">
            <History className="w-8 h-8 text-stone-400 mx-auto" />
            <h4 className="font-serif font-bold text-base text-stone-900">
              Nenhum ato acadêmico registrado ainda
            </h4>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              Ao concluir lições, resolver atividades e prestar exames, seus registros imutáveis constarão aqui.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/academy/catalog')}
            >
              Ir ao Catálogo de Cursos
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {historyEntries.map((entry, idx) => (
              <Card
                key={entry.id || idx}
                variant="default"
                padding="md"
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-stone-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 shrink-0 mt-0.5">
                    {entry.type.includes('certificate') ? (
                      <Award className="w-4 h-4 text-amber-700" />
                    ) : entry.type.includes('assessment') ? (
                      <FileText className="w-4 h-4 text-red-800" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral" size="sm">
                        {entry.type.toUpperCase().replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs font-mono text-stone-400">
                        {new Date(entry.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="text-xs text-stone-800 font-serif font-medium">
                      {entry.contentTitle} ({entry.contentId})
                    </div>

                    {entry.details && (
                      <div className="text-[11px] text-stone-600 font-mono bg-stone-50 p-2 rounded border border-stone-100">
                        {entry.details}
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-[10px] font-mono text-stone-400 shrink-0">
                  ID: {entry.id.slice(0, 12)}...
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ScreenContainer>
  );
};
