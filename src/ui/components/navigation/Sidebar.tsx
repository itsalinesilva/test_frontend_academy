import React from 'react';
import {
  GraduationCap,
  Sparkles,
  Sliders,
  FileMusic,
  Users,
  Compass,
  Award,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Baby,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badgeCount?: number;
  isKidsAdapted?: boolean;
}

export interface SidebarProps {
  id?: string;
  activeId: string;
  onSelect: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isKidsMode?: boolean;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  id = 'app-sidebar',
  activeId,
  onSelect,
  isCollapsed = false,
  onToggleCollapse,
  isKidsMode = false,
  className,
}) => {
  const items: SidebarItem[] = [
    { id: 'academy', label: 'Academia Formal', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'practice', label: 'Treino & Habilidades', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'studio', label: 'Estúdio & DAW', icon: <Sliders className="w-5 h-5" /> },
    { id: 'scores', label: 'Partituras & Repertório', icon: <FileMusic className="w-5 h-5" /> },
    { id: 'rooms', label: 'Salas dos Professores', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'community', label: 'Fórum Musicológico', icon: <Users className="w-5 h-5" /> },
    { id: 'atlas', label: 'Atlas Histórico & Mundos', icon: <Compass className="w-5 h-5" /> },
    { id: 'portfolio', label: 'Portfólio & Credenciais', icon: <Award className="w-5 h-5" /> },
  ];

  if (isKidsMode) {
    // Curated kids items
    items.push({ id: 'kids-safety', label: 'Espaço Protegido', icon: <Baby className="w-5 h-5" /> });
  } else {
    items.push({ id: 'admin', label: 'Governança & Auditoria', icon: <Shield className="w-5 h-5" /> });
  }

  return (
    <aside
      id={id}
      aria-label="Navegação Principal da Plataforma"
      className={twMerge(
        'flex flex-col bg-white border-r border-stone-200 transition-all duration-200 h-full select-none shrink-0 z-20',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Sidebar Header */}
      <div
        id={`${id}-header`}
        className={clsx(
          'flex items-center h-14 border-b border-stone-100 px-3',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-6 h-6 rounded bg-anil-800 text-white flex items-center justify-center font-serif text-sm font-bold shrink-0">
              A
            </span>
            <span className="text-xs font-semibold tracking-wider text-stone-900 uppercase truncate">
              {isKidsMode ? 'Academia Kids' : 'Academia Musical'}
            </span>
          </div>
        )}

        {onToggleCollapse && (
          <button
            id={`${id}-collapse-btn`}
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded focus:outline-none focus:ring-2 focus:ring-anil-800 cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav id={`${id}-nav`} className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              id={`${id}-item-${item.id}`}
              type="button"
              onClick={() => onSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              title={isCollapsed ? item.label : undefined}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-anil-800',
                isActive
                  ? 'bg-red-50 text-red-900 font-semibold border border-red-200/60'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-transparent',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <span className={clsx('shrink-0', isActive ? 'text-anil-800' : 'text-stone-500')}>
                {item.icon}
              </span>

              {!isCollapsed && <span className="truncate text-left flex-1">{item.label}</span>}

              {!isCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-anil-800 text-white">
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Settings */}
      <div id={`${id}-footer`} className="p-2 border-t border-stone-100">
        <button
          id={`${id}-settings-btn`}
          type="button"
          onClick={() => onSelect('settings')}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Configurações</span>}
        </button>
      </div>
    </aside>
  );
};
