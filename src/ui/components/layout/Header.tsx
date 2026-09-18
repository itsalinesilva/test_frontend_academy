import React, { useState } from 'react';
import { User, UserRole } from '../../../domain/types';
import { LogIn, Bell, Music2, Menu, CheckCircle2, BookOpen, MessageSquare } from 'lucide-react';
import { useRouter } from '../../navigation/router';
import { NavMenu } from './NavMenu';
import { HeaderSearch } from './HeaderSearch';
import { NotificationsPopover, QuickNotification } from '../overlays/NotificationsPopover';
import { ProfileMenu } from '../overlays/ProfileMenu';
import { clsx } from 'clsx';

export interface HeaderProps {
  currentUser: User | null;
  onLoginClick?: () => void;
  onLogoutClick: () => void;
  onSwitchRole?: (role: UserRole) => void;
  onTogglePlayer?: () => void;
  isPlayerOpen?: boolean;
  onToggleMobileMenu?: () => void;
  showAdminTab?: boolean;
}

/**
 * O header. Singular.
 *
 * Havia dois: uma barra institucional escura e, abaixo, uma barra branca com
 * os pilares expostos, a marca repetida e uma sub-barra contextual rotulada
 * "Sub-rotas". Três repetições do mesmo menu, duas da mesma marca.
 *
 * Restou um: marca à esquerda uma vez, rotas atrás de um chevron que abre por
 * proximidade, e à direita apenas o que é ação — busca, player, avisos, conta.
 * O perfil é foto, primeiro nome e sino: nada de crachá de papel nem rótulo.
 */
export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLoginClick,
  onLogoutClick,
  onSwitchRole,
  onTogglePlayer,
  isPlayerOpen = false,
  onToggleMobileMenu,
  showAdminTab = false,
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
    if (onLoginClick) onLoginClick();
    else navigate('/auth/login');
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 select-none border-b border-white/10 bg-anil-950 text-stone-100"
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-2 px-3 sm:px-6 lg:px-8">
        {onToggleMobileMenu && (
          <button
            id="header-mobile-menu-btn"
            type="button"
            onClick={onToggleMobileMenu}
            aria-label="Abrir menu de navegação"
            className="shrink-0 rounded p-1.5 text-stone-300 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Marca — uma vez, e só aqui */}
        <button
          type="button"
          id="header-brand"
          onClick={() => navigate('/academy')}
          className="flex min-w-0 shrink items-center gap-2 rounded px-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-ouro-400"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-ouro-400"
          />
          <span className="truncate font-serif text-sm font-semibold tracking-tight text-white">
            Conservatório Muscicapa
          </span>
        </button>

        {/* Rotas, fechadas atrás do chevron */}
        <div className="hidden lg:block">
          <NavMenu
            id="header-nav-menu"
            currentUserRole={currentUser?.primaryRole}
            showAdminTab={showAdminTab}
          />
        </div>

        <div className="flex-1" />

        <div id="header-actions" className="flex shrink-0 items-center gap-0.5">
          <HeaderSearch />

          {onTogglePlayer && (
            <button
              id="header-player-btn"
              type="button"
              onClick={onTogglePlayer}
              aria-pressed={isPlayerOpen}
              title="Player de referência"
              aria-label="Player de referência"
              className={clsx(
                'rounded-md p-1.5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ouro-400',
                isPlayerOpen ? 'bg-white/10 text-ouro-400' : 'text-stone-300 hover:text-white'
              )}
            >
              <Music2 className="h-4 w-4" />
            </button>
          )}

          <div className="relative">
            <button
              id="header-notifications-btn"
              type="button"
              onClick={() => {
                setIsNotificationsOpen((prev) => !prev);
                setIsProfileMenuOpen(false);
              }}
              title="Avisos"
              aria-label={unreadCount > 0 ? `Avisos, ${unreadCount} não lidos` : 'Avisos'}
              aria-expanded={isNotificationsOpen}
              className={clsx(
                'relative rounded-md p-1.5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ouro-400',
                isNotificationsOpen ? 'bg-white/10 text-white' : 'text-stone-300 hover:text-white'
              )}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-ouro-400 ring-2 ring-anil-950" />
              )}
            </button>

            <NotificationsPopover
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          </div>

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
                aria-label={`Conta de ${currentUser.name}`}
                className="ml-0.5 flex items-center gap-2 rounded-full p-0.5 pr-2 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-1 focus-visible:ring-ouro-400"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-anil-700 text-[11px] font-semibold text-white">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    currentUser.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </span>
                <span className="hidden max-w-[110px] truncate text-xs font-medium text-stone-200 sm:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
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
              className="ml-1 inline-flex items-center gap-1.5 rounded-md bg-anil-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-anil-600"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
