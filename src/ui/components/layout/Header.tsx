import React, { useState } from 'react';
import { User, UserRole } from '../../../domain/types';
import { Badge } from '../base/Badge';
import {
  LogIn,
  Search,
  Bell,
  Music2,
  Menu,
  CheckCircle2,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { useRouter } from '../../navigation/router';
import { WorkspaceSwitcher } from '../navigation/WorkspaceSwitcher';
import { NotificationsPopover, QuickNotification } from '../overlays/NotificationsPopover';
import { ProfileMenu } from '../overlays/ProfileMenu';
import { clsx } from 'clsx';

export interface HeaderProps {
  currentUser: User | null;
  onLoginClick?: () => void;
  onLogoutClick: () => void;
  onSwitchRole?: (role: UserRole) => void;
  onOpenCommandPalette?: () => void;
  onTogglePlayer?: () => void;
  isPlayerOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLoginClick,
  onLogoutClick,
  onSwitchRole,
  onOpenCommandPalette,
  onTogglePlayer,
  isPlayerOpen = false,
  onToggleMobileMenu,
}) => {
  const { navigate } = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState<QuickNotification[]>([
    {
      id: 'notif-1',
      title: 'Nova Lição Desbloqueada',
      message: 'Módulo de Contraponto a 2 Vozes disponível na Cátedra de Bach.',
      time: 'Há 12 min',
      unread: true,
      link: '/academy/course/contraponto-fundamental',
      icon: BookOpen,
    },
    {
      id: 'notif-2',
      title: 'Resposta no Fórum',
      message: 'Prof. Gabriel comentou sua análise da Sonata em Dó Maior.',
      time: 'Há 1 hora',
      unread: true,
      link: '/community/topic/analise-sonata-k545',
      icon: MessageSquare,
    },
    {
      id: 'notif-3',
      title: 'Avaliação Registrada no Portfólio',
      message: 'Seu áudio do exercício de 3ª Maior recebeu pontuação 100%.',
      time: 'Ontem',
      unread: false,
      link: '/profile/portfolio',
      icon: CheckCircle2,
    },
  ]);

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      navigate('/auth/login');
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      id="app-institutional-header"
      className="bg-stone-900 text-stone-100 border-b border-stone-800 py-2 px-3 sm:px-6 lg:px-8 select-none relative z-30"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs gap-2">
        {/* Left Side: Mobile Menu Button + Institutional Tag + Workspace Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onToggleMobileMenu && (
            <button
              id="header-mobile-menu-btn"
              type="button"
              onClick={onToggleMobileMenu}
              aria-label="Abrir menu de navegação móvel"
              className="lg:hidden p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800 focus:outline-none focus:ring-1 focus:ring-anil-800 shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div id="header-institutional-tag" className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" aria-hidden="true" />
            <span className="text-red-400 font-mono text-[11px] tracking-wider uppercase font-bold truncate">
              Conservatório Muscicapa
            </span>
            <span className="hidden xl:inline text-stone-600">|</span>
            <span className="hidden xl:inline text-stone-400 text-[11px]">
              Plataforma Soberana de Educação e Criação
            </span>
          </div>

          {/* Integrated Workspace Switcher */}
          <div className="hidden md:block ml-1">
            <WorkspaceSwitcher id="header-workspace-switcher" />
          </div>
        </div>

        {/* Right Side: Command Shortcut + Audio Player + Notifications + User Menu */}
        <div id="header-actions-section" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Global Audio Player Trigger */}
          {onTogglePlayer && (
            <button
              id="header-player-btn"
              type="button"
              onClick={onTogglePlayer}
              title="Player Canônico Auditivo (J.S. Bach, Mozart, Beethoven, Lá 440)"
              className={clsx(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors focus:outline-none focus:ring-1 focus:ring-anil-800',
                isPlayerOpen
                  ? 'bg-anil-900/70 text-white border-red-700'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
              )}
            >
              <Music2 className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Player</span>
              {isPlayerOpen && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping shrink-0" />
              )}
            </button>
          )}

          {/* Command Palette Trigger */}
          <button
            id="header-command-palette-btn"
            type="button"
            onClick={onOpenCommandPalette}
            title="Abrir busca e comandos rápidos (Ctrl + K)"
            className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 rounded-md text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-anil-800"
          >
            <Search className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-400">Buscar...</span>
            <kbd className="text-[10px] font-mono text-stone-400 bg-stone-900 px-1.5 py-0.2 rounded border border-stone-700">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Flyout Trigger */}
          <div className="relative">
            <button
              id="header-notifications-btn"
              type="button"
              onClick={() => {
                setIsNotificationsOpen((prev) => !prev);
                setIsProfileMenuOpen(false);
              }}
              title="Central de Notificações"
              aria-expanded={isNotificationsOpen}
              className={clsx(
                'p-1.5 sm:p-2 rounded-md transition-colors relative focus:outline-none focus:ring-1 focus:ring-anil-800',
                isNotificationsOpen ? 'bg-stone-800 text-white' : 'text-stone-300 hover:bg-stone-800'
              )}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600 ring-2 ring-stone-900" />
              )}
            </button>

            <NotificationsPopover
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          </div>

          {/* Profile / Auth Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                id="header-profile-btn"
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen((prev) => !prev);
                  setIsNotificationsOpen(false);
                }}
                aria-expanded={isProfileMenuOpen}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-lg hover:bg-stone-800 transition-colors focus:outline-none focus:ring-1 focus:ring-anil-800"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-stone-700 text-stone-100 flex items-center justify-center font-bold text-xs shrink-0 border border-stone-600">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}</span>
                  )}
                </div>
                <span className="hidden md:inline font-medium text-stone-200 truncate max-w-[100px]">
                  {currentUser.name.split(' ')[0]}
                </span>
                <Badge
                  variant={currentUser.primaryRole === UserRole.ADMIN ? 'brand' : 'neutral'}
                  size="sm"
                  className="hidden sm:inline-flex"
                >
                  {currentUser.primaryRole}
                </Badge>
              </button>

              <ProfileMenu
                isOpen={isProfileMenuOpen}
                onClose={() => setIsProfileMenuOpen(false)}
                currentUser={currentUser}
                onLogout={onLogoutClick}
                onSwitchRole={onSwitchRole}
              />
            </div>
          ) : (
            <button
              id="header-login-button"
              type="button"
              onClick={handleLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-anil-800 hover:bg-anil-700 text-white rounded-md font-medium transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Acessar Conta</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
