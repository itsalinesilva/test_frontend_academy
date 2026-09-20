import React, { useState, useEffect } from 'react';
import { SkipLink } from '../a11y/SkipLink';
import { Header } from './Header';
import { User, UserRole } from '../../../domain/types';
import { useRouter } from '../../navigation/router';
import { pilarDaRota, pilaresVisiveis } from '../../navigation/pilares';
import { GlobalPlayer } from '../player/GlobalPlayer';
import { CommandPalette } from '../overlays/CommandPalette';
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

  /**
   * A barra inferior lê os PILARES, e não uma lista própria.
   *
   * Havia três listas de navegação mantidas à mão — esta, o menu do chevron e
   * a CirculationBar —, e o **Acervo não estava em nenhuma**: rota pública,
   * com ficha de obra e de compositor, e sem porta na interface.
   *
   * Três listas divergem na primeira tela nova. Uma lista não tem como.
   */
  const mobileBottomItems = pilaresVisiveis(!!currentUser);

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

      {/*
        🔴 O RODAPÉ FALAVA COM QUEM PROGRAMA, E NÃO COM QUEM ESTUDA.

        Ele exibia três selos — "TypeScript Strict", "Web Audio Synthesizer",
        "WCAG AA Compliant" — a aluno, visitante e professor. São escolhas de
        implementação, e não coisas que alguém que veio aprender música precise
        saber; anunciá-las no rodapé é o mesmo tipo de vazamento que o pente
        fino persegue no meio da tela.

        E a linha de apresentação — "Circulação contínua entre Teoria, Prática,
        Notação Urtext, DAW e Governança Acadêmica" — não diz o que a escola faz.

        Um rodapé de escola tem três coisas: quem ela é, o que ela oferece em
        termos que valem juridicamente, e o caminho de volta.
      */}
      <footer
        id="app-institutional-footer"
        className="border-t border-stone-800 bg-stone-900 px-4 py-8 text-xs text-stone-400 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-[1fr_auto]">
          <div id="footer-provenance-statement">
            <p className="font-serif text-sm font-semibold text-stone-200">
              Conservatório Muscicapa
            </p>
            <p className="mt-1 max-w-xl leading-relaxed text-stone-400">
              Escola de música em linha: teoria, história, prática com medição e um acervo
              aberto de obras e partituras.
            </p>

            {/*
              A RESSALVA É OBRIGAÇÃO, e fica onde todo mundo passa.

              Curso livre precisa dizer que é curso livre. Ela já aparece no
              certificado e na apresentação do curso; no rodapé ela alcança
              também quem nunca chegou nessas telas.
            */}
            <p className="mt-3 max-w-xl leading-relaxed text-stone-500">
              Cursos livres, com certificação própria do Conservatório. Não são cursos
              reconhecidos pelo MEC, e não conferem diploma de graduação ou pós-graduação.
            </p>
          </div>

          <nav aria-label="Seções do Conservatório" className="sm:text-right">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 sm:flex-col sm:items-end">
              {mobileBottomItems.map((p) => (
                <li key={p.path}>
                  <button
                    type="button"
                    onClick={() => navigate(p.path)}
                    className="text-stone-400 underline-offset-2 transition-colors hover:text-stone-200 hover:underline"
                  >
                    {p.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>

      {/* 8. Mobile Bottom Thumb Navigation Bar (44px min touch target) */}
      <div
        id="mobile-bottom-bar"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-lg px-1 py-1 flex items-center justify-around"
      >
        {mobileBottomItems.map((item) => {
          const IconComp = item.icon;
          const isActive = pilarDaRota(currentPath)?.id === item.id;

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
