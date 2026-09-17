import React from 'react';
import {
  Home,
  GraduationCap,
  Target,
  Compass,
  Users,
  Sliders,
  FileMusic,
  User as UserIcon,
  BookOpen,
  Shield,
  Calendar,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from '../../navigation/router';
import { UserRole } from '../../../domain/types';

export interface NavigationProps {
  showAdminTab?: boolean;
  currentUserRole?: UserRole;
  onOpenCommandPalette?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  showAdminTab = false,
  currentUserRole = UserRole.ALUNO,
}) => {
  const { currentPath, navigate } = useRouter();

  const isProfessor =
    currentUserRole === UserRole.PROFESSOR || currentUserRole === UserRole.ADMIN;
  const isAdmin = currentUserRole === UserRole.ADMIN || showAdminTab;

  // Primary navigation items strictly per specification:
  // Home, Academy, Practice, Worlds, Community, Studio, Score, Profile
  // Quando Professor: Room
  // Quando Admin: Admin
  const primaryNavItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'academy', label: 'Academy', icon: GraduationCap, path: '/academy' },
    { id: 'practice', label: 'Practice', icon: Target, path: '/practice' },
    { id: 'worlds', label: 'Worlds', icon: Compass, path: '/worlds' },
    { id: 'community', label: 'Community', icon: Users, path: '/community' },
    { id: 'studio', label: 'Studio', icon: Sliders, path: '/studio' },
    { id: 'score', label: 'Score', icon: FileMusic, path: '/score' },
    { id: 'profile', label: 'Profile', icon: UserIcon, path: '/profile' },
  ];

  if (isProfessor) {
    primaryNavItems.push({
      id: 'room',
      label: 'Room',
      icon: BookOpen,
      path: '/rooms',
    });
  }

  if (isAdmin) {
    primaryNavItems.push({
      id: 'admin',
      label: 'Admin',
      icon: Shield,
      path: '/admin',
    });
  }

  // Active check helper
  const isItemActive = (id: string, path: string) => {
    if (id === 'home') return currentPath === '/' || currentPath === '';
    if (id === 'community') return currentPath.startsWith('/community');
    return currentPath.startsWith(path);
  };

  // Contextual Navigation Sub-Bar items based on active pillar
  const getContextualLinks = () => {
    if (currentPath.startsWith('/academy')) {
      return [
        { label: 'Visão Geral', path: '/academy' },
        { label: 'Catálogo de Disciplinas', path: '/academy/catalog' },
        { label: 'Meu Aprendizado', path: '/academy/my-learning' },
        { label: 'Histórico Acadêmico', path: '/academy/history' },
        { label: 'Busca Curricular', path: '/academy/search' },
      ];
    }
    if (currentPath.startsWith('/practice')) {
      return [
        { label: 'Treino Auditivo de Intervalos', path: '/practice' },
        { label: 'Metrônomo Acústico', path: '/practice' },
        { label: 'Partituras Relacionadas', path: '/score' },
        { label: 'Laboratório de Afinação', path: '/studio/voice-ear' },
      ];
    }
    if (currentPath.startsWith('/score')) {
      return [
        { label: 'Catálogo Urtext', path: '/score' },
        { label: 'Editor de Pautas', path: '/score' },
        { label: 'Estúdio DAW', path: '/studio' },
        { label: 'Atlas de Obras', path: '/worlds' },
      ];
    }
    if (currentPath.startsWith('/worlds')) {
      return [
        { label: 'Atlas Histórico', path: '/worlds' },
        { label: 'Grafo Musicológico', path: '/worlds/graph' },
        { label: 'Repertório Urtext', path: '/score' },
      ];
    }
    if (currentPath.startsWith('/community')) {
      return [
        { label: 'Fórum Musicológico', path: '/community' },
        { label: 'Eventos & Recitais ao Vivo', path: '/community/events' },
        { label: 'Salas dos Professores', path: '/rooms' },
      ];
    }
    if (currentPath.startsWith('/studio')) {
      return [
        { label: 'Visão Geral do Estúdio', path: '/studio' },
        { label: 'Editor Notacional', path: '/studio/score' },
        { label: 'Laboratório de Voz & Ouvido', path: '/studio/voice-ear' },
      ];
    }
    if (currentPath.startsWith('/rooms')) {
      return [
        { label: 'Salas & Cátedras Ativas', path: '/rooms' },
        { label: 'Criar Nova Cátedra', path: '/rooms/create' },
        { label: 'Fórum Acadêmico', path: '/community' },
      ];
    }
    if (currentPath.startsWith('/profile')) {
      return [
        { label: 'Visão Geral do Perfil', path: '/profile' },
        { label: 'Portfólio de Evidências', path: '/profile/portfolio' },
        { label: 'Editar Cadastro', path: '/profile/edit' },
      ];
    }
    if (currentPath.startsWith('/admin')) {
      return [
        { label: 'Painel Geral', path: '/admin' },
        { label: 'Usuários & Papéis', path: '/admin/users' },
        { label: 'Engines & Gateway', path: '/admin/engines' },
        { label: 'Conteúdo & Ementas', path: '/admin/content' },
        { label: 'Moderação', path: '/admin/moderation' },
        { label: 'Credenciais & Certificados', path: '/admin/credentials' },
        { label: 'Auditoria Imutável', path: '/admin/audit' },
      ];
    }
    return null;
  };

  const contextualLinks = getContextualLinks();

  return (
    <nav
      id="main-navigation-bar"
      aria-label="Navegação Principal da Academia"
      className="bg-white border-b border-stone-200 sticky top-0 z-20 select-none shadow-2xs"
    >
      {/* Primary Pillar Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        {/* Brand & Home */}
        <button
          id="nav-brand-button"
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-left focus:outline-none focus:ring-1 focus:ring-red-800 rounded px-1 group shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-red-800 text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs group-hover:bg-red-700 transition-colors">
            A
          </div>
          <div className="hidden sm:block">
            <span className="font-serif font-bold text-stone-900 tracking-tight text-base leading-none block">
              Academia Musical
            </span>
            <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block">
              Digital Sovereign
            </span>
          </div>
        </button>

        {/* Primary Desktop Pillars */}
        <div id="nav-primary-links" className="hidden lg:flex items-center gap-1 overflow-x-auto">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.id, item.path);
            const isSpecialAdmin = item.id === 'admin';
            const isSpecialRoom = item.id === 'room';

            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                type="button"
                onClick={() => navigate(item.path)}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-800',
                  active
                    ? 'bg-stone-900 text-white shadow-xs'
                    : isSpecialAdmin
                    ? 'text-red-900 bg-red-50 hover:bg-red-100 border border-red-200'
                    : isSpecialRoom
                    ? 'text-red-950 bg-stone-100 hover:bg-stone-200 font-medium'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                )}
              >
                <Icon className={clsx('w-3.5 h-3.5', active ? 'text-red-400' : 'text-stone-500')} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right utility info */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/community/events')}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-red-800" />
            <span className="hidden md:inline">Eventos & Recitais</span>
          </button>
        </div>
      </div>

      {/* Contextual Sub-Navigation Bar */}
      {contextualLinks && (
        <div
          id="nav-contextual-bar"
          aria-label="Navegação Contextual do Modo Ativo"
          className="bg-stone-50 border-t border-stone-200/70 px-4 sm:px-6 lg:px-8 py-1.5 overflow-x-auto scrollbar-none"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-1 text-xs">
            <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider pr-2 border-r border-stone-200 hidden sm:inline">
              Sub-rotas:
            </span>
            {contextualLinks.map((sub) => {
              const isSubActive = currentPath === sub.path;
              return (
                <button
                  key={sub.label}
                  type="button"
                  onClick={() => navigate(sub.path)}
                  className={clsx(
                    'px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap cursor-pointer',
                    isSubActive
                      ? 'bg-stone-200/90 text-stone-900 font-bold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                  )}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};
