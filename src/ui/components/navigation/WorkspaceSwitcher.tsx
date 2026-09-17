import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from '../../navigation/router';
import {
  GraduationCap,
  Target,
  FileMusic,
  Sliders,
  BookOpen,
  Globe2,
  ChevronDown,
  Check,
  Briefcase,
} from 'lucide-react';
import { clsx } from 'clsx';

export type WorkspaceId =
  | 'academic'
  | 'practice'
  | 'creation'
  | 'studio'
  | 'pedagogy'
  | 'musicology';

export interface WorkspaceConfig {
  id: WorkspaceId;
  label: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  defaultPath: string;
}

export const WORKSPACES: WorkspaceConfig[] = [
  {
    id: 'academic',
    label: 'Workspace Acadêmico',
    badge: 'Teoria & Currículo',
    icon: GraduationCap,
    description: 'Disciplinas formais, lições estruturadas e história musicológica.',
    defaultPath: '/academy',
  },
  {
    id: 'practice',
    label: 'Workspace Prática & Técnica',
    badge: 'Treino Auditivo',
    icon: Target,
    description: 'Percepção de intervalos, ritmos, acordes e rotinas de maestria.',
    defaultPath: '/practice',
  },
  {
    id: 'creation',
    label: 'Workspace Partituras & Notação',
    badge: 'Urtext & Gravação',
    icon: FileMusic,
    description: 'Composição formal em pautas canônicas, MusicXML e análise de obras.',
    defaultPath: '/score',
  },
  {
    id: 'studio',
    label: 'Workspace Estúdio DAW',
    badge: 'Produção Multicanal',
    icon: Sliders,
    description: 'Mixagem digital, síntese sonora e processamento de áudio em tempo real.',
    defaultPath: '/studio',
  },
  {
    id: 'pedagogy',
    label: 'Workspace Cátedra Docente',
    badge: 'Salas & Turmas',
    icon: BookOpen,
    description: 'Gestão pedagógica, avaliação de trabalhos e regência de turmas virtuais.',
    defaultPath: '/rooms',
  },
  {
    id: 'musicology',
    label: 'Workspace Atlas & Mundos',
    badge: 'Repertório Histórico',
    icon: Globe2,
    description: 'Grafo de conexões estéticas, períodos históricos e partituras de referência.',
    defaultPath: '/worlds',
  },
];

export interface WorkspaceSwitcherProps {
  id?: string;
  compact?: boolean;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  id = 'workspace-switcher',
  compact = false,
}) => {
  const { currentPath, navigate } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive active workspace from current path
  const activeWorkspace = WORKSPACES.find((w) => {
    if (w.id === 'academic' && currentPath.startsWith('/academy')) return true;
    if (w.id === 'practice' && currentPath.startsWith('/practice')) return true;
    if (w.id === 'creation' && currentPath.startsWith('/score')) return true;
    if (w.id === 'studio' && currentPath.startsWith('/studio')) return true;
    if (w.id === 'pedagogy' && currentPath.startsWith('/rooms')) return true;
    if (w.id === 'musicology' && currentPath.startsWith('/worlds')) return true;
    return false;
  }) || WORKSPACES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectWorkspace = (ws: WorkspaceConfig) => {
    setIsOpen(false);
    navigate(ws.defaultPath);
  };

  const ActiveIcon = activeWorkspace.icon;

  return (
    <div id={id} ref={dropdownRef} className="relative inline-block text-left">
      <button
        id={`${id}-trigger`}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={clsx(
          'inline-flex items-center gap-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-red-800 cursor-pointer',
          compact
            ? 'p-1.5 bg-stone-800 text-stone-200 border-stone-700 hover:bg-stone-700'
            : 'px-3 py-1.5 bg-stone-100/90 text-stone-800 border-stone-200/90 hover:bg-stone-200/80 hover:border-stone-300 text-xs font-semibold'
        )}
      >
        <Briefcase className="w-3.5 h-3.5 text-stone-500 shrink-0" />
        <ActiveIcon className="w-3.5 h-3.5 text-red-800 shrink-0" />
        <span className="hidden sm:inline font-sans truncate max-w-[140px] text-left">
          {activeWorkspace.label.replace('Workspace ', '')}
        </span>
        <ChevronDown className={clsx('w-3 h-3 text-stone-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          id={`${id}-menu`}
          role="menu"
          aria-label="Selecionar Workspace Musical"
          className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 sm:w-80 bg-white border border-stone-200 rounded-xl shadow-xl z-50 p-1.5 divide-y divide-stone-100 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-stone-400 flex items-center justify-between">
            <span>Alternar Workspace</span>
            <span className="text-red-800 font-bold font-sans lowercase text-xs">6 Modos Ativos</span>
          </div>

          <div className="py-1 space-y-0.5 max-h-[380px] overflow-y-auto">
            {WORKSPACES.map((ws) => {
              const IconComp = ws.icon;
              const isCurrent = ws.id === activeWorkspace.id;

              return (
                <button
                  key={ws.id}
                  id={`${id}-option-${ws.id}`}
                  role="menuitem"
                  type="button"
                  onClick={() => handleSelectWorkspace(ws)}
                  className={clsx(
                    'w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors cursor-pointer',
                    isCurrent
                      ? 'bg-red-50 text-stone-900 font-medium'
                      : 'hover:bg-stone-50 text-stone-700'
                  )}
                >
                  <div
                    className={clsx(
                      'p-2 rounded-md shrink-0 mt-0.5',
                      isCurrent ? 'bg-red-800 text-white' : 'bg-stone-100 text-stone-600'
                    )}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate text-stone-900">{ws.label}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-red-800 shrink-0" />}
                    </div>
                    <span className="inline-block text-[10px] font-mono text-red-800 uppercase tracking-wide">
                      {ws.badge}
                    </span>
                    <p className="text-[11px] text-stone-500 leading-snug line-clamp-2 mt-0.5">
                      {ws.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-2 bg-stone-50 rounded-b-lg text-[11px] text-stone-500 font-mono text-center">
            Atalho rápido: navegue fluidamente sem perda de contexto
          </div>
        </div>
      )}
    </div>
  );
};
