import React, { useState, useEffect } from 'react';
import { SkipLink } from '../a11y/SkipLink';
import { Header } from './Header';
import { User, UserRole } from '../../../domain/types';
import { useRouter } from '../../navigation/router';
import { GlobalPlayer } from '../player/GlobalPlayer';
import { CommandPalette } from '../overlays/CommandPalette';
import {
  GraduationCap,
  Target,
  FileMusic,
  Sliders,
  User as UserIcon,
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

  const telaDeLarguraTotal =
    /^\/academy\/course\//.test(currentPath) || /^\/academy\/lesson\//.test(currentPath);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

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

  // Mobile Bottom Navigation Bar: Primary Thumb-Friendly Pillars
  const mobileBottomItems = [
    { label: 'Academy', icon: GraduationCap, path: '/academy' },
    { label: 'Practice', icon: Target, path: '/practice' },
    { label: 'Score', icon: FileMusic, path: '/score' },
    { label: 'Studio', icon: Sliders, path: '/studio' },
    { label: 'Perfil', icon: UserIcon, path: '/profile' },
  ];

  return (
    <div
      id="app-shell-root"
      className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans pb-16 lg:pb-0"
    >
      <SkipLink targetId="main-content" />

      {/* Header unico: marca, rotas atras do chevron, acoes. Nao ha segunda barra. */}
      <Header
        currentUser={currentUser}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        onSwitchRole={onSwitchRole}
        onTogglePlayer={() => setIsPlayerOpen((prev) => !prev)}
        isPlayerOpen={isPlayerOpen}
        showAdminTab={showAdminTab}
      />

      {/* 3. Main Application Work Area */}
      {/*
        Telas de largura total.

        A area de curso e a apresentacao do curso trazem a propria estrutura —
        menu lateral fixo, hero sangrando ate a borda, trilho a direita. Elas
        declaram seu proprio <main>, e envolve-las no container centrado com
        padding quebraria o layout e criaria dois landmarks main.
      */}
      {telaDeLarguraTotal ? (
        <div className="flex-1">{children}</div>
      ) : (
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 focus:outline-none"
        >
          {children}
        </main>
      )}

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

      {/* 7. Institutional Provenance Footer */}
      <footer
        id="app-institutional-footer"
        className="bg-stone-900 text-stone-400 border-t border-stone-800 py-6 px-4 sm:px-6 lg:px-8 text-xs"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div id="footer-provenance-statement" className="text-center sm:text-left">
            <p className="font-semibold text-stone-300 font-serif">Conservatório Muscicapa</p>
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
                isActive ? 'text-anil-800 font-bold' : 'text-stone-600 hover:text-stone-900'
              )}
            >
              <IconComp className={clsx('w-4 h-4 mb-0.5', isActive ? 'text-anil-800' : 'text-stone-500')} />
              <span className="truncate max-w-[56px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
