import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  Flame,
  Target,
  Trophy,
  Play,
  Award,
  History,
  TrendingUp,
  Music,
  Activity,
  Mic,
  Eye,
  Headphones,
  Sliders,
  Compass,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import {
  PracticeModality,
  SkillTree,
  StreakTracker,
  DailyGoal,
  RankingLeaderboardEntry,
} from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter } from '../../navigation/router';
import { useUsuarioAtual } from '../../hooks/useUsuarioAtual';

export const PracticeHomeScreen: React.FC = () => {
  const { userId } = useUsuarioAtual();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trees, setTrees] = useState<SkillTree[]>([]);
  const [streak, setStreak] = useState<StreakTracker | null>(null);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [leaderboard, setLeaderboard] = useState<RankingLeaderboardEntry[]>([]);
  const currentUserId = userId;

  useEffect(() => {
    async function loadPracticeHome() {
      if (!userId) return;
      try {
        setLoading(true);
        const [treesData, streakData, goalData, rankData] = await Promise.all([
          practiceService.listSkillTrees(),
          practiceService.getStreak(userId),
          practiceService.getDailyGoal(userId),
          practiceService.getLeaderboard(),
        ]);
        setTrees(treesData);
        setStreak(streakData);
        setDailyGoal(goalData);
        setLeaderboard(rankData);
      } catch (err) {
        console.error('Failed to load practice home', err);
      } finally {
        setLoading(false);
      }
    }
    loadPracticeHome();
  }, []);

  const modalitiesList = [
    {
      id: PracticeModality.KEYBOARD,
      title: 'Teclado',
      desc: 'Toque com piano virtual, MIDI ou teclado físico.',
      icon: Sliders,
      badge: 'Interativo',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id: PracticeModality.VIRTUAL_INSTRUMENT,
      title: 'Instrumento Virtual',
      desc: 'Simulação acústica de Violino, Flauta e Violão.',
      icon: Music,
      badge: 'Multitimbres',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: PracticeModality.VOICE,
      title: 'Voz & Afinação',
      desc: 'Pitch tracker em tempo real via microfone.',
      icon: Mic,
      badge: 'Microfone',
      color: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    {
      id: PracticeModality.RHYTHM,
      title: 'Ritmo & Metrônomo',
      desc: 'Isocronia, síncopes e tap tempo em milissegundos.',
      icon: Activity,
      badge: 'Precisão ms',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      id: PracticeModality.READING,
      title: 'Leitura Urtext',
      desc: 'Leitura rápida em Clave de Sol e Clave de Fá.',
      icon: Eye,
      badge: 'Primeira Vista',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    {
      id: PracticeModality.PERCEPTION,
      title: 'Percepção Melódica',
      desc: 'Ditado de intervalos, graus e contornos.',
      icon: Compass,
      badge: 'Auditivo',
      color: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      id: PracticeModality.THEORY,
      title: 'Teoria Musical',
      desc: 'Armaduras de clave, tríades e cadências.',
      icon: BookOpen,
      badge: 'Conceitos',
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    {
      id: PracticeModality.EAR_TRAINING,
      title: 'Treinamento Auditivo',
      desc: 'Ouvido relativo e identificação de consonâncias.',
      icon: Headphones,
      badge: 'Harmônico',
      color: 'bg-orange-50 text-orange-800 border-orange-200',
    },
    {
      id: PracticeModality.REPERTOIRE,
      title: 'Repertório Canônico',
      desc: 'Frases de Bach, Mozart e Villa-Lobos.',
      icon: Trophy,
      badge: 'Obras',
      color: 'bg-stone-100 text-stone-800 border-stone-300',
    },
    {
      id: PracticeModality.TECHNIQUE,
      title: 'Técnica Instrumental',
      desc: 'Exercícios Hanon, agilidade e dinâmica.',
      icon: TrendingUp,
      badge: 'Velocidade',
      color: 'bg-red-50 text-anil-800 border-red-200',
    },
  ];

  const handleStartTraining = async (modality: PracticeModality) => {
    if (!userId) return;
    if (!userId) return;
    try {
      const exercises = await practiceService.listExercises();
      const match = exercises.find((e) => e.modality === modality) || exercises[0];
      const session = await practiceService.startSession(userId, modality, match.id, match.skillId);
      router.navigate(`/practice/session/${session.id}`);
    } catch (e) {
      console.error('Failed to start session', e);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-28 bg-stone-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-36 bg-stone-200 rounded-xl" />
          <div className="h-36 bg-stone-200 rounded-xl" />
          <div className="h-36 bg-stone-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const goalPercent = dailyGoal
    ? Math.min(100, Math.round((dailyGoal.completedMinutes / dailyGoal.targetMinutes) * 100))
    : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Training Hero & Gamification Ticker */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-stone-100 p-6 md:p-8 rounded-2xl shadow-xl border border-stone-800">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wide uppercase bg-anil-950/80 text-red-300 border border-anil-800">
              Laboratório de Alta Performance
            </span>
            <span className="text-xs text-stone-400 font-serif italic">
              Metodologia de Prática Deliberada
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Prática Musical Deliberada
          </h1>
          <p className="text-sm text-stone-300 leading-relaxed font-sans">
            Ciclos curtos de execução com medição acústica em 10 dimensões, feedback instantâneo e progressão contínua rumo à maestria canônica.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              id="btn-quick-practice"
              variant="primary"
              size="lg"
              onClick={() => handleStartTraining(PracticeModality.KEYBOARD)}
              className="flex items-center gap-2 bg-anil-800 hover:bg-anil-700 text-white"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Iniciar Sessão Recomendada</span>
            </Button>
            <Button
              id="btn-skill-tree-nav"
              variant="outline"
              size="lg"
              onClick={() => router.navigate('/practice/skill-tree')}
              className="text-stone-100 border-stone-600 hover:bg-stone-800"
            >
              <span>Practice → Skill Builder</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Gamification Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 shrink-0 lg:w-72">
          {/* Streak */}
          <div
            onClick={() => router.navigate('/practice/streak')}
            className="cursor-pointer bg-stone-800/80 hover:bg-stone-800 p-3 rounded-xl border border-stone-700 flex items-center gap-3 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <span className="text-xs text-stone-400 block font-mono">Ofensiva</span>
              <span className="text-lg font-bold font-mono text-white">
                {streak?.currentStreakDays || 0} Dias
              </span>
            </div>
          </div>

          {/* Daily Goal */}
          <div
            onClick={() => router.navigate('/practice/daily-goal')}
            className="cursor-pointer bg-stone-800/80 hover:bg-stone-800 p-3 rounded-xl border border-stone-700 flex items-center gap-3 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs text-stone-400 font-mono">
                <span>Meta Diária</span>
                <span>{goalPercent}%</span>
              </div>
              <div className="w-full bg-stone-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* League */}
          <div
            onClick={() => router.navigate('/practice/ranking')}
            className="cursor-pointer bg-stone-800/80 hover:bg-stone-800 p-3 rounded-xl border border-stone-700 flex items-center gap-3 transition-colors col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-400 block font-mono">Liga Semanal</span>
              <span className="text-sm font-bold text-purple-300">
                Conservatório (#{leaderboard.find((l) => l.userId === currentUserId)?.rankPosition || 3})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Hub */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.navigate('/practice/skill-tree')}
            className="flex items-center gap-1.5"
          >
            <Award className="w-4 h-4 text-amber-700" />
            <span>Árvore de Habilidades</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.navigate('/practice/mastery')}
            className="flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <span>Matriz de Maestria</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.navigate('/practice/history')}
            className="flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-stone-700" />
            <span>Histórico</span>
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.navigate('/practice/profile')}
          className="flex items-center gap-2"
        >
          <span>Ver Perfil de Prática</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Section 1: Modalidades de Prática (10 modalidades) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Modalidades de Treinamento
            </h2>
            <p className="text-xs text-stone-500 font-sans">
              Selecione o instrumento, meio de entrada ou área de competência técnica para iniciar.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {modalitiesList.map((m) => {
            const Icon = m.icon;
            return (
              <Card
                key={m.id}
                variant="default"
                padding="md"
                onClick={() => handleStartTraining(m.id)}
                className="cursor-pointer hover:border-anil-800 transition-all hover:shadow-md flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-lg border ${m.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="neutral" className="text-[10px]">
                    {m.badge}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-stone-900 group-hover:text-anil-900 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed font-sans">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-medium text-stone-700 group-hover:text-anil-800">
                  <span>Praticar</span>
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Section 2: Árvores de Competência Ativas (Skill Trees Preview) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Árvores de Competências & Tiers
            </h2>
            <p className="text-xs text-stone-500 font-sans">
              Trilhas gamificadas com nós de habilidades, pré-requisitos e níveis de domínio.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.navigate('/practice/skill-tree')}
          >
            Ver Todas as Árvores
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trees.map((tree) => {
            const totalNodes = tree.nodes.length;
            const masteredNodes = tree.nodes.filter((n) => (n.masteryLevel || 0) >= 3).length;
            const progress = totalNodes > 0 ? Math.round((masteredNodes / totalNodes) * 100) : 0;

            return (
              <Card
                key={tree.id}
                variant="default"
                padding="md"
                className="space-y-4 hover:border-stone-400 transition-all cursor-pointer"
                onClick={() => router.navigate('/practice/skill-tree')}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="brand" className="text-[10px] mb-1">
                      {tree.category}
                    </Badge>
                    <h3 className="font-serif font-bold text-stone-900 text-base">
                      {tree.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-stone-400 font-semibold">
                    v{tree.version}
                  </span>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {tree.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <div className="flex justify-between text-xs font-mono text-stone-500">
                    <span>Nós Dominados: {masteredNodes}/{totalNodes}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-anil-800 h-full rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                  <span>{tree.nodes.length} nós pedagógicos</span>
                  <span className="font-medium text-anil-800 flex items-center gap-1">
                    Abrir Árvore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Section 3: Academy → Practice: Laboratórios Integrados */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900">
              Academy → Practice: Laboratórios Integrados
            </h2>
            <p className="text-xs text-stone-500 font-sans">
              Práticas deliberadas diretamente conectadas às disciplinas matriculadas no currículo acadêmico.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.navigate('/academy/my-learning')}
          >
            Ver Meu Aprendizado
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="default" padding="md" className="space-y-3 bg-white border border-stone-200">
            <div className="flex items-center justify-between">
              <Badge variant="brand">Disciplina: Teoria & Harmonia I</Badge>
              <span className="text-xs font-mono text-stone-400">Lição 3: Cadências</span>
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Laboratório Prático: Resolução de Cadências Perfeitas e Plagais
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Pratique a identificação instantânea e condução de vozes com medição rigorosa de timing e acurácia harmônica.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <span className="text-[11px] font-mono text-stone-500">Modalidade: Teoria & Teclado</span>
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleStartTraining(PracticeModality.THEORY)}
                className="text-xs bg-anil-800 hover:bg-anil-700 text-white"
              >
                Praticar Agora
              </Button>
            </div>
          </Card>

          <Card variant="default" padding="md" className="space-y-3 bg-white border border-stone-200">
            <div className="flex items-center justify-between">
              <Badge variant="success">Disciplina: Percepção Auditiva I</Badge>
              <span className="text-xs font-mono text-stone-400">Lição 2: Intervalos</span>
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Laboratório Prático: Discriminação Microtonal e Consonâncias
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Equalize seu ouvido com 10 medições acústicas por tentativa, gerando evidências auditadas para o histórico.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <span className="text-[11px] font-mono text-stone-500">Modalidade: Treinamento Auditivo</span>
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleStartTraining(PracticeModality.EAR_TRAINING)}
                className="text-xs bg-anil-800 hover:bg-anil-700 text-white"
              >
                Praticar Agora
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
