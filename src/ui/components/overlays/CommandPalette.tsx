import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../../navigation/router';
import {
  Search,
  Home,
  GraduationCap,
  Target,
  FileMusic,
  Sliders,
  Users,
  Compass,
  User,
  BookOpen,
  Shield,
  Calendar,
  Bell,
  Settings,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export interface CommandPaletteProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  items?: CommandItem[];
  className?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  id = 'command-palette',
  isOpen,
  onClose,
  items: customItems,
  className,
}) => {
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultItems: CommandItem[] = [
    {
      id: 'cmd-home',
      title: 'Início: Visão Geral da Academia',
      category: 'Navegação',
      icon: <Home className="w-4 h-4" />,
      shortcut: 'H',
      action: () => { navigate('/'); onClose(); },
    },
    {
      id: 'cmd-academy',
      title: 'Academia: disciplinas formais e currículo',
      category: 'Pilar Principal',
      icon: <GraduationCap className="w-4 h-4" />,
      shortcut: 'A',
      action: () => { navigate('/academia'); onClose(); },
    },
    {
      id: 'cmd-practice',
      title: 'Laboratório: treino auditivo e microcompetências',
      category: 'Pilar Principal',
      icon: <Target className="w-4 h-4" />,
      shortcut: 'P',
      action: () => { navigate('/practice'); onClose(); },
    },
    {
      id: 'cmd-score',
      title: 'Score: Notação Musical e Repertório Urtext',
      category: 'Pilar Principal',
      icon: <FileMusic className="w-4 h-4" />,
      shortcut: 'S',
      action: () => { navigate('/score'); onClose(); },
    },
    {
      id: 'cmd-studio',
      title: 'Studio: DAW Multicanal e Síntese de Áudio',
      category: 'Pilar Principal',
      icon: <Sliders className="w-4 h-4" />,
      action: () => { navigate('/studio'); onClose(); },
    },
    {
      id: 'cmd-profile',
      title: 'Profile: Portfólio, Conquistas e Evidências',
      category: 'Pilar Principal',
      icon: <User className="w-4 h-4" />,
      action: () => { navigate('/profile'); onClose(); },
    },
    {
      id: 'cmd-community',
      title: 'Community: Fórum Musicológico',
      category: 'Pilar Principal',
      icon: <Users className="w-4 h-4" />,
      action: () => { navigate('/community'); onClose(); },
    },
    {
      id: 'cmd-events',
      title: 'Eventos: Masterclasses e Recitais Comentados',
      category: 'Circulação',
      icon: <Calendar className="w-4 h-4" />,
      action: () => { navigate('/community/events'); onClose(); },
    },
    {
      id: 'cmd-room',
      title: 'Room: Salas de Aula dos Professores',
      category: 'Docência',
      icon: <BookOpen className="w-4 h-4" />,
      action: () => { navigate('/rooms'); onClose(); },
    },
    {
      id: 'cmd-worlds',
      title: 'Atlas: o mapa da música no tempo e no espaço',
      category: 'Pilar Principal',
      icon: <Compass className="w-4 h-4" />,
      action: () => { navigate('/worlds'); onClose(); },
    },
    {
      id: 'cmd-admin',
      title: 'Admin: Governança, Engines e Auditoria',
      category: 'Administração',
      icon: <Shield className="w-4 h-4" />,
      action: () => { navigate('/founder'); onClose(); },
    },
    {
      id: 'cmd-notifications',
      title: 'Notificações: Central de Avisos e Alertas',
      category: 'Sistema',
      icon: <Bell className="w-4 h-4" />,
      action: () => { navigate('/notifications'); onClose(); },
    },
    {
      id: 'cmd-search',
      title: 'Busca Global: Catálogo, Obras e Lições',
      category: 'Sistema',
      icon: <Search className="w-4 h-4" />,
      action: () => { navigate('/search'); onClose(); },
    },
    {
      id: 'cmd-settings',
      title: 'Configurações: Preferências de Áudio e Notação',
      category: 'Sistema',
      icon: <Settings className="w-4 h-4" />,
      action: () => { navigate('/settings'); onClose(); },
    },
    {
      id: 'cmd-help',
      title: 'Ajuda: Manuais de Solfejo e Engenharia',
      category: 'Sistema',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => { navigate('/help'); onClose(); },
    },
  ];

  const allItems = customItems || defaultItems;

  const filteredItems = allItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id={`${id}-backdrop`}
      role="dialog"
      aria-modal="true"
      aria-label="Paleta de Comandos Universal"
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 p-4 bg-stone-900/60 backdrop-blur-xs select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id={id}
        className={twMerge(
          'w-full max-w-xl bg-white border border-stone-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]',
          className
        )}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-stone-200 gap-3 bg-stone-50/50">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            aria-label="Buscar comando ou tela"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Navegar para Academia, Laboratório, Partituras, Estúdio, Perfil…"
            className="w-full text-sm sm:text-base text-stone-900 placeholder:text-stone-400 bg-transparent focus:outline-none"
          />
          <kbd className="text-[10px] font-mono text-stone-400 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-stone-50">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-500">
              Nenhum destino encontrado para &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  id={`cmd-item-${item.id}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={clsx(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
                    isSelected ? 'bg-red-50 text-anil-950 font-medium' : 'text-stone-700 hover:bg-stone-50'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={clsx('shrink-0', isSelected ? 'text-anil-800' : 'text-stone-400')}>
                      {item.icon}
                    </span>
                    <span className="text-xs sm:text-sm">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-anil-800" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Keyboard hints footer */}
        <div className="px-4 py-2 border-t border-stone-100 bg-stone-50 text-[11px] text-stone-500 font-mono flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑ ↓ Navegar</span>
            <span>↵ Abrir</span>
            <span>ESC Fechar</span>
          </div>
          <span className="hidden sm:inline text-anil-800 font-sans font-semibold">
            Conservatório Muscicapa
          </span>
        </div>
      </div>
    </div>
  );
};
