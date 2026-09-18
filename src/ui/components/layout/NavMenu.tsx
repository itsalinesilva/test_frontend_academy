import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  GraduationCap,
  Target,
  FileMusic,
  Sliders,
  Compass,
  Users,
  User as UserIcon,
  BookOpen,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from '../../navigation/router';
import { UserRole } from '../../../domain/types';

export interface NavMenuProps {
  id?: string;
  currentUserRole?: UserRole;
  showAdminTab?: boolean;
}

interface Destino {
  id: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const DESTINOS: Destino[] = [
  { id: 'academy', label: 'Academy', hint: 'Cursos e programas', icon: GraduationCap, path: '/academy' },
  { id: 'practice', label: 'Practice', hint: 'Treino medido', icon: Target, path: '/practice' },
  { id: 'score', label: 'Score', hint: 'Partituras', icon: FileMusic, path: '/score' },
  { id: 'studio', label: 'Studio', hint: 'Edição e síntese', icon: Sliders, path: '/studio' },
  { id: 'worlds', label: 'Worlds', hint: 'Atlas de obras', icon: Compass, path: '/worlds' },
  { id: 'community', label: 'Community', hint: 'Fórum', icon: Users, path: '/community' },
  { id: 'profile', label: 'Perfil', hint: 'Sua conta', icon: UserIcon, path: '/profile' },
];

/**
 * Menu de rotas fechado atrás de um chevron.
 *
 * Abre por proximidade — o ponteiro entrando na área do gatilho basta — e
 * também por clique e por teclado, porque hover sozinho não é acessível.
 * Fecha ao sair, no Escape e no clique fora.
 *
 * Existe um menu de navegação nesta aplicação, e é este. Não há barra de
 * pilares exposta nem sub-barra contextual: o que não está aqui, está
 * dentro da própria tela.
 */
export const NavMenu: React.FC<NavMenuProps> = ({
  id = 'nav-menu',
  currentUserRole = UserRole.ALUNO,
  showAdminTab = false,
}) => {
  const { currentPath, navigate } = useRouter();
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const fechamento = useRef<number | null>(null);

  const cancelarFechamento = useCallback(() => {
    if (fechamento.current !== null) {
      window.clearTimeout(fechamento.current);
      fechamento.current = null;
    }
  }, []);

  /** Sair não fecha na hora: o ponteiro costuma cruzar a fresta entre gatilho e painel. */
  const agendarFechamento = useCallback(() => {
    cancelarFechamento();
    fechamento.current = window.setTimeout(() => setAberto(false), 180);
  }, [cancelarFechamento]);

  useEffect(() => cancelarFechamento, [cancelarFechamento]);

  useEffect(() => {
    if (!aberto) return;

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false);
    };
    const aoClicarFora = (e: MouseEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAberto(false);
    };

    document.addEventListener('keydown', aoTeclar);
    document.addEventListener('mousedown', aoClicarFora);
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.removeEventListener('mousedown', aoClicarFora);
    };
  }, [aberto]);

  const destinos = [...DESTINOS];
  if (currentUserRole === UserRole.PROFESSOR || currentUserRole === UserRole.ADMIN) {
    destinos.push({ id: 'rooms', label: 'Salas', hint: 'Suas turmas', icon: BookOpen, path: '/rooms' });
  }
  if (currentUserRole === UserRole.ADMIN || showAdminTab) {
    destinos.push({ id: 'admin', label: 'Admin', hint: 'Governança', icon: Shield, path: '/admin' });
  }

  const ativo = destinos.find((d) => currentPath.startsWith(d.path));

  const ir = (path: string) => {
    setAberto(false);
    navigate(path);
  };

  return (
    <div
      id={id}
      ref={raiz}
      className="relative"
      onMouseEnter={() => {
        cancelarFechamento();
        setAberto(true);
      }}
      onMouseLeave={agendarFechamento}
    >
      <button
        type="button"
        id={`${id}-trigger`}
        onClick={() => setAberto((v) => !v)}
        onFocus={() => setAberto(true)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label="Abrir menu de navegação"
        className={clsx(
          'inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-ouro-400',
          aberto ? 'bg-white/10 text-white' : 'text-stone-300 hover:bg-white/5 hover:text-white'
        )}
      >
        <span className="hidden sm:inline">{ativo ? ativo.label : 'Navegar'}</span>
        <ChevronDown
          className={clsx('h-3.5 w-3.5 transition-transform duration-150', aberto && 'rotate-180')}
        />
      </button>

      {aberto && (
        <div
          role="menu"
          aria-label="Destinos"
          id={`${id}-panel`}
          className="absolute left-0 top-full z-50 mt-1 w-60 overflow-hidden rounded-lg border border-white/10 bg-anil-950/95 py-1 shadow-xl backdrop-blur-md"
        >
          {destinos.map((d) => {
            const Icone = d.icon;
            const atual = d.id === ativo?.id;
            return (
              <button
                key={d.id}
                type="button"
                role="menuitem"
                onClick={() => ir(d.path)}
                className={clsx(
                  'flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors',
                  'focus:outline-none focus-visible:bg-white/10',
                  atual ? 'bg-white/10' : 'hover:bg-white/5'
                )}
              >
                <Icone className={clsx('h-4 w-4 shrink-0', atual ? 'text-ouro-400' : 'text-stone-400')} />
                <span className="min-w-0">
                  <span
                    className={clsx(
                      'block truncate text-xs font-medium',
                      atual ? 'text-white' : 'text-stone-200'
                    )}
                  >
                    {d.label}
                  </span>
                  <span className="block truncate text-[11px] text-stone-500">{d.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
