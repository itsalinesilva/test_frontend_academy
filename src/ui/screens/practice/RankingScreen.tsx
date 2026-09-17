import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Badge } from '../../components/base/Badge';
import {
  ChevronLeft,
  Crown,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Clock,
} from 'lucide-react';
import { RankingLeaderboardEntry, RankingLeague } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter } from '../../navigation/router';
import { useUsuarioAtual } from '../../hooks/useUsuarioAtual';

export const RankingScreen: React.FC = () => {
  const { userId } = useUsuarioAtual();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<RankingLeague>(RankingLeague.CONSERVATORIO);
  const [entries, setEntries] = useState<RankingLeaderboardEntry[]>([]);
  const currentUserId = userId;

  useEffect(() => {
    async function loadRankings() {
      try {
        setLoading(true);
        const data = await practiceService.getLeaderboard('WEEKLY', selectedLeague);
        setEntries(data);
      } catch (err) {
        console.error('Failed to load ranking', err);
      } finally {
        setLoading(false);
      }
    }
    loadRankings();
  }, [selectedLeague]);

  const leaguesList = [
    { id: RankingLeague.BRONZE, label: 'Bronze', color: 'text-amber-800' },
    { id: RankingLeague.SILVER, label: 'Prata', color: 'text-slate-600' },
    { id: RankingLeague.GOLD, label: 'Ouro', color: 'text-amber-600' },
    { id: RankingLeague.PLATINUM, label: 'Platina', color: 'text-teal-600' },
    { id: RankingLeague.DIAMOND, label: 'Diamante', color: 'text-blue-600' },
    { id: RankingLeague.CONSERVATORIO, label: 'Conservatório', color: 'text-purple-600' },
  ];

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-stone-200 rounded" />
        <div className="h-64 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
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
            Ligas de Desempenho Musical
          </h1>
          <p className="text-sm text-stone-600 font-sans mt-1">
            Ranking semanal calibrado por XP e rigor de execução em todos os instrumentos.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-mono text-stone-600">
          <Clock className="w-3.5 h-3.5 text-stone-500" />
          <span>Encerramento em: 2d 14h</span>
        </div>
      </div>

      {/* League Selector Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {leaguesList.map((lg) => (
          <button
            key={lg.id}
            onClick={() => setSelectedLeague(lg.id)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
              selectedLeague === lg.id
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs font-semibold'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {lg.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <Card variant="default" padding="none" className="bg-white border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs font-mono text-stone-500">
          <span>Posição / Músico</span>
          <span>XP Semanal</span>
        </div>

        <div className="divide-y divide-stone-100">
          {entries.map((entry) => {
            const isCurrentUser = entry.userId === currentUserId;
            const isTop3 = entry.rankPosition <= 3;

            return (
              <div
                key={entry.id}
                className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                  isCurrentUser ? 'bg-red-50/50 border-l-4 border-l-anil-800' : 'hover:bg-stone-50/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      entry.rankPosition === 1
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : entry.rankPosition === 2
                        ? 'bg-slate-100 text-slate-800 border border-slate-300'
                        : entry.rankPosition === 3
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {entry.rankPosition === 1 ? <Crown className="w-4 h-4 text-amber-600" /> : `#${entry.rankPosition}`}
                  </div>

                  <div>
                    <span className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                      {entry.userDisplayName}
                      {isCurrentUser && (
                        <Badge variant="primary" className="text-[10px] py-0 px-1.5">
                          Você
                        </Badge>
                      )}
                    </span>
                    <span className="text-[11px] text-stone-400 font-sans">
                      {isTop3 ? 'Zona de Promoção' : 'Manutenção de Liga'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {entry.changeDirection === 'up' && (
                    <ArrowUp className="w-4 h-4 text-emerald-600" />
                  )}
                  {entry.changeDirection === 'down' && (
                    <ArrowDown className="w-4 h-4 text-rose-600" />
                  )}
                  {entry.changeDirection === 'neutral' && (
                    <Minus className="w-4 h-4 text-stone-400" />
                  )}

                  <span className="font-mono text-sm font-bold text-stone-900">
                    {entry.xp} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Promotion Zone Explainer */}
      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
        <h4 className="font-serif font-bold text-sm flex items-center gap-1.5 text-purple-950">
          <Sparkles className="w-4 h-4 text-purple-700" />
          Regras de Ascensão de Liga
        </h4>
        <p className="leading-relaxed font-sans">
          Os 3 primeiros colocados da semana no Conservatório recebem o Laurel de Excelência e multiplicador de 1.5x em todas as evidências geradas na plataforma.
        </p>
      </div>
    </div>
  );
};
