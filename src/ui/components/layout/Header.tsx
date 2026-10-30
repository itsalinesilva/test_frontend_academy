import React, { useState } from 'react';
import { User, UserRole } from '../../../domain/types';
import { LogIn, Music2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from '../../navigation/router';
import { ExplorarMenu } from './ExplorarMenu';
import { HeaderSearch } from './HeaderSearch';
import { ProfileMenu } from '../overlays/ProfileMenu';
import { useNaoLidas } from '../../hooks/useNaoLidas';

export interface HeaderProps {
  currentUser: User | null;
  onLoginClick?: () => void;
  onLogoutClick: () => void;
  onSwitchRole?: (role: UserRole) => void;
  onTogglePlayer?: () => void;
  isPlayerOpen?: boolean;
  showAdminTab?: boolean;
}

/**
 * A navbar.
 *
 * Cinco elementos, e nada mais: a marca, que leva à home; **Explorar**, que
 * abre o painel com tudo o que a plataforma tem; **Meu aprendizado**, que leva
 * ao que o aluno já fez; a **lupa**; e o **avatar**.
 *
 * Tudo o que não é um desses cinco vive dentro de Explorar ou dentro da
 * própria tela. Uma barra com dez itens expostos não ajuda a navegar — obriga
 * a ler dez itens toda vez.
 */
export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLoginClick,
  onLogoutClick,
  onSwitchRole,
  onTogglePlayer,
  isPlayerOpen = false,
  /**
   * Mantido no contrato e não usado aqui: a administração entra pelo Perfil,
   * e não pelo menu. O menu tem os pilares, e nada mais.
   */
  showAdminTab: _showAdminTab = false,
}) => {
  const { currentPath, navigate } = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  /** AUD-10 — o aviso não ganha um sexto botão na barra: vira um selo no avatar e um item no menu. */
  const naoLidas = useNaoLidas(currentUser?.id, currentPath);

  const emAprendizado = currentPath.startsWith('/academia/meu-aprendizado');

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 select-none border-b border-stone-200 bg-white"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-1 px-3 sm:gap-3 sm:px-6 lg:px-8">
        <button
          type="button"
          id="header-brand"
          onClick={() => navigate('/')}
          aria-label="Conservatório Muscicapa, ir para a página inicial"
          className="flex shrink-0 items-center gap-2 rounded px-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-anil-700"
        >
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-ouro-500" />
          <span className="font-serif text-base font-bold tracking-tight text-anil-900">
            Muscicapa
          </span>
        </button>

        <div className="hidden sm:block">
          <ExplorarMenu id="header-explorar" />
        </div>

        {currentUser && (
          <button
            type="button"
            id="header-meu-aprendizado"
            onClick={() => navigate('/academia/meu-aprendizado')}
            aria-current={emAprendizado ? 'page' : undefined}
            className={clsx(
              'hidden shrink-0 rounded px-2 py-1.5 text-sm transition-colors sm:block',
              'focus:outline-none focus-visible:ring-1 focus-visible:ring-anil-700',
              emAprendizado ? 'font-semibold text-anil-800' : 'text-stone-700 hover:text-anil-800'
            )}
          >
            Meu aprendizado
          </button>
        )}

        <div className="flex-1" />

        <div id="header-actions" className="flex shrink-0 items-center gap-0.5">
          <HeaderSearch />

          {onTogglePlayer && (
            <button
              type="button"
              id="header-player-btn"
              onClick={onTogglePlayer}
              aria-pressed={isPlayerOpen}
              title="Player de referência"
              aria-label="Player de referência"
              className={clsx(
                'rounded-md p-2 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-anil-700',
                isPlayerOpen ? 'bg-anil-50 text-anil-800' : 'text-stone-500 hover:text-stone-900'
              )}
            >
              <Music2 className="h-4 w-4" />
            </button>
          )}

          {currentUser ? (
            <div className="relative">
              <button
                type="button"
                id="header-profile-btn"
                onClick={() => setIsProfileMenuOpen((v) => !v)}
                aria-expanded={isProfileMenuOpen}
                aria-label={`Conta de ${currentUser.name}${naoLidas ? `, ${naoLidas} ${naoLidas === 1 ? 'notificação não lida' : 'notificações não lidas'}` : ''}`}
                className="ml-0.5 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-anil-800 text-xs font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-anil-700 focus-visible:ring-offset-1"
              >
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  currentUser.name?.charAt(0).toUpperCase() || 'U'
                )}
              </button>
              {naoLidas > 0 && (
                <span aria-hidden="true" className="pointer-events-none absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-600" />
              )}

              <ProfileMenu
                isOpen={isProfileMenuOpen}
                onClose={() => setIsProfileMenuOpen(false)}
                currentUser={currentUser}
                onLogout={onLogoutClick}
                onSwitchRole={onSwitchRole}
                naoLidas={naoLidas}
              />
            </div>
          ) : (
            <button
              type="button"
              id="header-login-button"
              onClick={() => (onLoginClick ? onLoginClick() : navigate('/auth/login'))}
              className="ml-1 inline-flex items-center gap-1.5 rounded-md bg-anil-800 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-anil-700"
            >
              <LogIn className="h-3.5 w-3.5" />
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
