import React, { useState, useEffect } from 'react';
import { SkipLink } from '../a11y/SkipLink';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { User, UserRole } from '../../../domain/types';
import { useRouter } from '../../navigation/router';
import { GlobalPlayer } from '../player/GlobalPlayer';
import { CommandPalette } from '../overlays/CommandPalette';
import { CirculationBar } from '../navigation/CirculationBar';
import {
  Home,
  GraduationCap,
  Target,
  FileMusic,
  Sliders,
  User as UserIcon,
  BookOpen,
  Shield,
  Compass,
  Users,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';

export interface AppShellProps {
  currentUser: User | null;
  onLoginClick?: () => void;
  onLogoutClick: () => void;
  onSwitchRole?: (role: UserRole) => void;
  showAdminTab: boolean;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentUser,
  onLoginClick,
  onLogoutClick,
  onSwitchRole,
  showAdminTab,
  children,
}) => {
  const { currentPath, navigate } = useRouter();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Global Keyboard Shortcuts (Ctrl+K for Command Palette, Alt+P for Player)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // Alt+P
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPlayerOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isProfessor =
    currentUser?.primaryRole === UserRole.PROFESSOR || currentUser?.primaryRole === UserRole.ADMIN;
  const isAdmin = currentUser?.primaryRole === UserRole.ADMIN || showAdminTab;

  // Mobile Bottom Navigation Bar: Primary Thumb-Friendly Pillars
  const mobileBottomItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Academy', icon: GraduationCap, path: '/academy' },
    { label: 'Practice', icon: Target, path: '/practice' },
    { label: 'Score', icon: FileMusic, path: '/score' },
    { label: 'Studio', icon: Sliders, path: '/studio' },
    { label: 'Profile', icon: UserIcon, path: '/profile' },
  ];

  const handleNavigateFromDrawer = (path: string) => {
    setIsMobileDrawerOpen(false);
    navigate(path);
  };

  return (
    <div
      id="app-shell-root"
      className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans pb-16 lg:pb-0"
    >
      <SkipLink targetId="main-content" />

      {/* 1. Global Institutional Header */}
      <Header
        currentUser={currentUser}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        onSwitchRole={onSwitchRole}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onTogglePlayer={() => setIsPlayerOpen((prev) => !prev)}
        isPlayerOpen={isPlayerOpen}
        onToggleMobileMenu={() => setIsMobileDrawerOpen(true)}
      />

      {/* 2. Primary Navigation & Contextual Sub-Bar */}
      <Navigation
        showAdminTab={showAdminTab}
        currentUserRole={currentUser?.primaryRole || UserRole.ALUNO}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* 3. Main Application Work Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 focus:outline-none"
      >
        {children}
      </main>

      {/* 4. Global Persistent Audio Player */}
      <GlobalPlayer
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
      />

      {/* 5. Command / Navigation Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* 6. Mobile Slide-out Drawer */}
      {isMobileDrawerOpen && (
        <div
          id="mobile-nav-drawer-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Menu Principal de Navegação Móvel"
          className="lg:hidden fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMobileDrawerOpen(false);
          }}
        >
          <div className="w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-red-800 text-white flex items-center justify-center font-serif text-xs font-bold">
                  A
                </span>
                <span className="font-serif font-bold text-sm text-stone-900">
                  Academia Musical
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Links */}
            <div className="p-3 space-y-1">
              <p className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                Pilares da Academia
              </p>

              {[
                { label: 'Home (Início)', icon: Home, path: '/' },
                { label: 'Academy (Disciplinas)', icon: GraduationCap, path: '/academy' },
                { label: 'Practice (Treino & Ouvido)', icon: Target, path: '/practice' },
                { label: 'Worlds (Atlas Musical)', icon: Compass, path: '/worlds' },
                { label: 'Community (Fórum)', icon: Users, path: '/community' },
                { label: 'Studio (DAW & Síntese)', icon: Sliders, path: '/studio' },
                { label: 'Score (Partituras Urtext)', icon: FileMusic, path: '/score' },
                { label: 'Profile (Meu Perfil)', icon: UserIcon, path: '/profile' },
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path);

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavigateFromDrawer(item.path)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left',
                      isActive
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'text-stone-700 hover:bg-stone-100'
                    )}
                  >
                    <IconComp className={clsx('w-4 h-4', isActive ? 'text-red-400' : 'text-stone-500')} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {isProfessor && (
                <button
                  type="button"
                  onClick={() => handleNavigateFromDrawer('/rooms')}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left mt-2',
                    currentPath.startsWith('/rooms')
                      ? 'bg-red-900 text-white font-bold'
                      : 'text-red-900 bg-red-50 hover:bg-red-100'
                  )}
                >
                  <BookOpen className="w-4 h-4 text-red-800" />
                  <span>Room (Salas do Professor)</span>
                </button>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleNavigateFromDrawer('/admin')}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left',
                    currentPath.startsWith('/admin')
                      ? 'bg-red-800 text-white font-bold'
                      : 'text-red-800 bg-red-50/70 hover:bg-red-100'
                  )}
                >
                  <Shield className="w-4 h-4 text-red-800" />
                  <span>Admin (Governança Soberana)</span>
                </button>
              )}
            </div>

            {/* Quick Circulation in Mobile Drawer */}
            <div className="p-3 border-t border-stone-200 bg-stone-50 space-y-2">
              <CirculationBar id="mobile-drawer-circulation" variant="compact" />

              {/* Role Switcher in Drawer */}
              {onSwitchRole && (
                <div className="pt-2">
                  <label htmlFor="drawer-role-select" className="block text-[10px] font-mono text-stone-500 uppercase tracking-wide mb-1">
                    Simular Papel:
                  </label>
                  <select
                    id="drawer-role-select"
                    value={currentUser?.primaryRole || UserRole.ALUNO}
                    onChange={(e) => {
                      onSwitchRole(e.target.value as UserRole);
                      setIsMobileDrawerOpen(false);
                    }}
                    className="w-full text-xs bg-white border border-stone-300 rounded px-2 py-1"
                  >
                    <option value={UserRole.ADMIN}>ADMIN</option>
                    <option value={UserRole.PROFESSOR}>PROFESSOR</option>
                    <option value={UserRole.MUSICO}>MÚSICO</option>
                    <option value={UserRole.ALUNO}>ALUNO</option>
                    <option value={UserRole.CRIANCA}>CRIANÇA</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Institutional Provenance Footer */}
      <footer
        id="app-institutional-footer"
        className="bg-stone-900 text-stone-400 border-t border-stone-800 py-6 px-4 sm:px-6 lg:px-8 text-xs"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div id="footer-provenance-statement" className="text-center sm:text-left">
            <p className="font-semibold text-stone-300 font-serif">Academia Musical Digital</p>
            <p className="text-stone-500 mt-0.5 max-w-xl">
              Plataforma Soberana de Educação e Criação Musical • Circulação contínua entre Teoria, Prática, Notação Urtext, DAW e Governança Acadêmica.
            </p>
          </div>
          <div id="footer-system-badges" className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-400 bg-stone-800/80 px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              TypeScript Strict
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-400 bg-stone-800/80 px-2 py-1 rounded">
              Web Audio Synthesizer
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-400 bg-stone-800/80 px-2 py-1 rounded">
              WCAG AA Compliant
            </span>
          </div>
        </div>
      </footer>

      {/* 8. Mobile Bottom Thumb Navigation Bar (44px min touch target) */}
      <div
        id="mobile-bottom-bar"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg px-1 py-1 flex items-center justify-around"
      >
        {mobileBottomItems.map((item) => {
          const IconComp = item.icon;
          const isActive = item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path);

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              className={clsx(
                'flex flex-col items-center justify-center min-h-[44px] min-w-[50px] py-1 px-1.5 rounded transition-colors text-[10px] font-semibold cursor-pointer',
                isActive ? 'text-red-800 font-bold' : 'text-stone-600 hover:text-stone-900'
              )}
            >
              <IconComp className={clsx('w-4 h-4 mb-0.5', isActive ? 'text-red-800' : 'text-stone-500')} />
              <span className="truncate max-w-[56px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
