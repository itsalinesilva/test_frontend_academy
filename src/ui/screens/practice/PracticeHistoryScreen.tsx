import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  History,
  ChevronLeft,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { PracticeResult } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter } from '../../navigation/router';
import { useUsuarioAtual } from '../../hooks/useUsuarioAtual';

export const PracticeHistoryScreen: React.FC = () => {
  const { userId } = useUsuarioAtual();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
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
          {history.map((item) => (
            <Card
              key={item.id}
              variant="default"
              padding="md"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-anil-800 transition-all cursor-pointer"
              onClick={() => router.navigate(`/practice/result/${item.id}`)}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">{item.modality}</Badge>
                  <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {Math.round(item.durationSeconds / 60)} min
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base text-stone-900 truncate">
                  {item.exerciseTitle}
                </h3>

                <div className="flex items-center gap-4 text-xs font-mono text-stone-600">
                  <span>Acurácia: {item.pitchAccuracy}%</span>
                  <span>•</span>
                  <span>Ritmo: {item.rhythmAccuracy}%</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-bold">+{item.xpGained} XP</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-stone-400 block">Score</span>
                  <span className="font-mono text-xl font-bold text-red-900">
                    {item.summaryScore}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 text-xs"
                >
                  <span>Ver Detalhes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
