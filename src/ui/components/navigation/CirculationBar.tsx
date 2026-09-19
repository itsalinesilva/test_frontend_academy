import React from 'react';
import { useRouter } from '../../navigation/router';
import {
  GraduationCap,
  Target,
  FileMusic,
  Sliders,
  User,
  Users,
  Calendar,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CirculationStep {
  id: string;
  label: string;
  shortLabel: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const CIRCULATION_CHAIN: CirculationStep[] = [
  {
    id: 'academy',
    label: 'Academia',
    shortLabel: 'Academia',
    path: '/academia',
    icon: GraduationCap,
    description: 'Disciplinas, Cursos e Lições Teóricas',
  },
  {
    id: 'practice',
    label: 'Laboratório',
    shortLabel: 'Prática',
    path: '/practice',
    icon: Target,
    description: 'Treino Diário e Microcompetências',
  },
  {
    id: 'score',
    label: 'Score',
    shortLabel: 'Partituras',
    path: '/score',
    icon: FileMusic,
    description: 'Editor Notacional e Repertório Urtext',
  },
  {
    id: 'studio',
    label: 'Studio',
    shortLabel: 'Estúdio',
    path: '/studio',
    icon: Sliders,
    description: 'DAW Multicanal, Mixagem e Síntese',
  },
  {
    id: 'profile',
    label: 'Profile',
    shortLabel: 'Perfil',
    path: '/profile',
    icon: User,
    description: 'Evidências, Portfólio e Credenciais',
  },
  {
    id: 'community',
    label: 'Community',
    shortLabel: 'Comunidade',
    path: '/community',
    icon: Users,
    description: 'Fórum Musicológico e Diálogos Acadêmicos',
  },
  {
    id: 'event',
    label: 'Event',
    shortLabel: 'Eventos',
    path: '/community/events',
    icon: Calendar,
    description: 'Masterclasses e Recitais ao Vivo',
  },
  {
    id: 'room',
    label: 'Room',
    shortLabel: 'Salas',
    path: '/rooms',
    icon: BookOpen,
    description: 'Cátedras de Professores e Turmas',
  },
];

export interface CirculationBarProps {
  id?: string;
  className?: string;
  variant?: 'full' | 'compact';
}

export const CirculationBar: React.FC<CirculationBarProps> = ({
  id = 'canonical-circulation-bar',
  className,
  variant = 'full',
}) => {
  const { currentPath, navigate } = useRouter();

  // Find active step index
  const currentIndex = CIRCULATION_CHAIN.findIndex((step) => {
    if (step.id === 'event') {
      return currentPath === '/community/events';
    }
    if (step.id === 'community') {
      return currentPath.startsWith('/community') && currentPath !== '/community/events';
    }
    return currentPath.startsWith(step.path);
  });

  const activeIdx = currentIndex >= 0 ? currentIndex : 0;
  const prevStep = CIRCULATION_CHAIN[(activeIdx - 1 + CIRCULATION_CHAIN.length) % CIRCULATION_CHAIN.length];
  const nextStep = CIRCULATION_CHAIN[(activeIdx + 1) % CIRCULATION_CHAIN.length];

  if (variant === 'compact') {
    return (
      <div
        id={id}
        aria-label="Circulação rápida entre modos da plataforma"
        className={twMerge(
          'flex items-center justify-between gap-2 p-2 bg-stone-900 text-stone-200 rounded-lg text-xs shadow-sm border border-stone-800',
          className
        )}
      >
        <button
          type="button"
          onClick={() => navigate(prevStep.path)}
          className="flex items-center gap-1 text-stone-400 hover:text-white px-2 py-1 rounded hover:bg-stone-800 transition-colors"
          title={`Ir para ${prevStep.label}: ${prevStep.description}`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{prevStep.label}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wide">
            Elo {activeIdx + 1} de {CIRCULATION_CHAIN.length}:
          </span>
          <span className="font-semibold text-white bg-anil-900/60 px-2 py-0.5 rounded border border-red-700/50">
            {CIRCULATION_CHAIN[activeIdx]?.label}
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate(nextStep.path)}
          className="flex items-center gap-1 text-stone-100 hover:text-white px-2.5 py-1 rounded bg-anil-800 hover:bg-anil-700 transition-colors font-medium"
          title={`Avançar para ${nextStep.label}: ${nextStep.description}`}
        >
          <span className="hidden sm:inline">Próximo ({nextStep.label})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <nav
      id={id}
      aria-label="Trilha de Circulação Fluida da Academia Musical"
      className={twMerge(
        'p-3 bg-white border border-stone-200 rounded-xl shadow-xs space-y-2.5 select-none',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100 text-xs">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 text-anil-800 shrink-0" />
          <span className="font-serif font-bold text-stone-900 tracking-tight">
            Circulação Soberana • Modos Integrados
          </span>
          <span className="hidden md:inline text-stone-400 text-[11px]">
            (Nunca preso a um único modo)
          </span>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => navigate(prevStep.path)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Voltar ({prevStep.label})</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(nextStep.path)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-anil-800 hover:bg-anil-700 rounded transition-colors"
          >
            <span>Avançar ({nextStep.label})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Circulation Chain Ribbon */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {CIRCULATION_CHAIN.map((step, idx) => {
          const IconComp = step.icon;
          const isActive = idx === activeIdx;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => navigate(step.path)}
                title={`${step.label}: ${step.description}`}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-anil-800',
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs font-semibold scale-105'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 bg-stone-50 border border-stone-200/70'
                )}
              >
                <IconComp className={clsx('w-3.5 h-3.5', isActive ? 'text-red-400' : 'text-stone-500')} />
                <span>{step.label}</span>
              </button>

              {idx < CIRCULATION_CHAIN.length - 1 && (
                <ArrowRight className="w-3 h-3 text-stone-300 shrink-0" aria-hidden="true" />
              )}
              {idx === CIRCULATION_CHAIN.length - 1 && (
                <span className="text-[10px] text-stone-400 font-mono shrink-0 pl-1">
                  ↺ Loop
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
