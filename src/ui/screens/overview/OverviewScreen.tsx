import React from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Badge } from '../../components/base/Badge';
import { CirculationBar } from '../../components/navigation/CirculationBar';
import {
  GraduationCap,
  Target,
  FileMusic,
  Sliders,
  Globe2,
  Users,
  User,
  ArrowRight,
  BookOpen,
  Sparkles,
  ShieldCheck,
  FileCheck,
  Play,
  Flame,
} from 'lucide-react';

export const OverviewScreen: React.FC = () => {
  const { navigate } = useRouter();

  const primaryPillars = [
    {
      id: 'academy',
      title: 'ACADEMY',
      subtitle: 'Currículo & Teoria Auditada',
      desc: 'Disciplinas progressivas de Harmonia, Contraponto, Análise e Instrumento com metodologia canônica.',
      icon: GraduationCap,
      path: '/academy',
      stats: '14 Disciplinas',
    },
    {
      id: 'practice',
      title: 'PRACTICE',
      subtitle: 'Treino Auditivo & Microcompetências',
      desc: 'Prática diária de percepção de intervalos, ritmos, metronomo acústico e solfejo com feedback instantâneo.',
      icon: Target,
      path: '/practice',
      stats: 'Exercícios Acústicos',
    },
    {
      id: 'score',
      title: 'SCORE',
      subtitle: 'Partituras & Repertório Urtext',
      desc: 'Editor de pautas canônicas, biblioteca Urtext (Bach, Mozart, Beethoven), notação MusicXML e audição.',
      icon: FileMusic,
      path: '/score',
      stats: 'Biblioteca Urtext',
    },
    {
      id: 'studio',
      title: 'STUDIO',
      subtitle: 'DAW, Gravação & Síntese',
      desc: 'Ambiente de gravação com DAW multicanal, sintetizador Web Audio e laboratório de voz e afinação.',
      icon: Sliders,
      path: '/studio',
      stats: 'DAW Multicanal',
    },
    {
      id: 'profile',
      title: 'PROFILE',
      subtitle: 'Portfólio & Evidências',
      desc: 'Histórico acadêmico individual, evidências de estudo auditadas por hash criptográfico e passaporte de habilidades.',
      icon: User,
      path: '/profile',
      stats: 'Hashes SHA-256',
    },
    {
      id: 'community',
      title: 'COMMUNITY',
      subtitle: 'Fórum Musicológico & Debates',
      desc: 'Discussões acadêmicas com mestres, debates de interpretação histórica e agenda de recitais comentados.',
      icon: Users,
      path: '/community',
      stats: 'Fórum Ativo',
    },
    {
      id: 'worlds',
      title: 'WORLDS',
      subtitle: 'Atlas Histórico & Grafo Canônico',
      desc: 'Viagem cronológica pelo patrimônio musical da humanidade, manuscritos fac-símile e rede de conexões.',
      icon: Globe2,
      path: '/worlds',
      stats: '5 Eras Catalogadas',
    },
    {
      id: 'rooms',
      title: 'ROOMS',
      subtitle: 'Cátedras de Professores & Turmas',
      desc: 'Salas virtuais de mestres, bancas de avaliação síncronas, devoluções pedagógicas e masterclasses.',
      icon: BookOpen,
      path: '/rooms',
      stats: 'Cátedras & Turmas',
    },
  ];

  return (
    <ScreenContainer
      id="overview"
      title="Academia Musical Digital"
      subtitle="Instituição soberana de ensino e criação musical. Circulação contínua entre Teoria, Prática, Notação Urtext, DAW e Cátedras de Mestres."
      badgeLabel="Plataforma Soberana"
      badgeVariant="brand"
      primaryAction={{
        label: 'Iniciar Prática Diária',
        icon: Play,
        onClick: () => navigate('/practice'),
      }}
      secondaryActions={[
        {
          label: 'Catálogo de Cursos',
          icon: BookOpen,
          onClick: () => navigate('/academy/catalog'),
        },
        {
          label: 'Guia de Integração',
          icon: Sparkles,
          onClick: () => navigate('/onboarding'),
        },
      ]}
    >
      <div className="space-y-8">
        {/* Circulation Bar Prominently Featured */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-stone-900">
              Trilha de Circulação Soberana
            </span>
            <span className="text-[11px] font-mono text-stone-500">
              8 Estações Integradas • Sem becos sem saída
            </span>
          </div>
          <CirculationBar id="overview-circulation" />
        </div>

        {/* Quick Streak & Performance Banner */}
        <div className="p-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-red-800 flex items-center justify-center shrink-0">
              <Flame className="w-6 h-6 fill-white text-white" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                Ofensiva de Estudos Ativa • 7 Dias Consecutivos
              </h3>
              <p className="text-xs text-stone-300 mt-0.5">
                Você já completou a teoria de hoje. Avance para o treino auditivo em <strong>Practice</strong> ou componha no <strong>Score</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/practice')}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Treinar Ouvido & Ritmo →
            </button>
          </div>
        </div>

        {/* Core Pillars Bento Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-900">
                Eixos Canônicos da Academia
              </h2>
              <p className="text-xs text-stone-500">
                Acesso direto a todas as dimensões pedagógicas, criativas e comunitárias da plataforma.
              </p>
            </div>
            <span className="text-xs text-stone-500 font-mono hidden sm:inline">
              8 Pilares Principais
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {primaryPillars.map((pillar) => {
              const IconComp = pillar.icon;
              return (
                <Card
                  key={pillar.id}
                  id={`pillar-card-${pillar.id}`}
                  variant="default"
                  padding="md"
                  interactive
                  onClick={() => navigate(pillar.path)}
                  className="space-y-3 flex flex-col justify-between cursor-pointer group hover:border-red-800/60 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-stone-100 text-stone-900 group-hover:bg-red-800 group-hover:text-white transition-colors">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <Badge variant="neutral" size="sm">
                        {pillar.stats}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-sm text-stone-900 tracking-tight">
                        {pillar.title}
                      </h3>
                      <p className="text-[11px] font-semibold text-stone-500 font-mono">
                        {pillar.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-stone-500 group-hover:text-red-800 transition-colors">
                      Acessar Modo
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-red-800 transition-colors" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Academic Principles and Compliance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="muted" padding="md" className="space-y-1.5 border-stone-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <ShieldCheck className="w-4 h-4 text-red-800" />
              <span>Proveniência Musicológica</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Todo o repertório e análises são baseados em tratados primários auditados de Tovey, Fux, Piston e Grout.
            </p>
          </Card>

          <Card variant="muted" padding="md" className="space-y-1.5 border-stone-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <span>Evidências Criptográficas</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Sua evolução técnica e tarefas submetidas geram hashes imutáveis para certificação de competência real.
            </p>
          </Card>

          <Card variant="muted" padding="md" className="space-y-1.5 border-stone-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <Sparkles className="w-4 h-4 text-stone-800" />
              <span>Acessibilidade & Web Audio</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Design System concebido para conformidade WCAG AA, leitura em alto contraste e síntese sonora em tempo real.
            </p>
          </Card>
        </div>
      </div>
    </ScreenContainer>
  );
};
