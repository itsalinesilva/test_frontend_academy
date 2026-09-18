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
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const DESTINOS: Destino[] = [
  { id: 'academy', label: 'Academy', icon: GraduationCap, path: '/academy' },
  { id: 'practice', label: 'Practice', icon: Target, path: '/practice' },
  { id: 'score', label: 'Score', icon: FileMusic, path: '/score' },
  { id: 'studio', label: 'Studio', icon: Sliders, path: '/studio' },
  { id: 'worlds', label: 'Worlds', icon: Compass, path: '/worlds' },
  { id: 'community', label: 'Community', icon: Users, path: '/community' },
  { id: 'profile', label: 'Perfil', icon: UserIcon, path: '/profile' },
];

/**
 * Menu de rotas do header.
 *
 * Fechado, é um chevron — o bastante para indicar que há algo ali, e alvo de
 * toque no celular. Aberto, desce como **faixa horizontal** ocupando toda a
 * largura do header, com os destinos lado a lado. Não é uma coluna suspensa:
 * a faixa acompanha o header porque é a continuação dele.
 *
 * Abre por proximidade do ponteiro, por clique e por foco de teclado. Fecha ao
 * sair, no Escape e no clique fora.
 *
 * A faixa é posicionada em `top-12` fixo porque o header tem altura `h-12` e
 * está grudado no topo — as duas medidas mudam juntas.
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

  /** Sair não fecha na hora: o ponteiro cruza a fresta entre o gatilho e a faixa. */
  const agendarFechamento = useCallback(() => {
    cancelarFechamento();
    fechamento.current = window.setTimeout(() => setAberto(false), 200);
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
    destinos.push({ id: 'rooms', label: 'Salas', icon: BookOpen, path: '/rooms' });
  }
  if (currentUserRole === UserRole.ADMIN || showAdminTab) {
    destinos.push({ id: 'admin', label: 'Admin', icon: Shield, path: '/admin' });
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
        aria-controls={`${id}-bar`}
        aria-label="Abrir menu de navegação"
        className={clsx(
          'inline-flex items-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-medium transition-colors',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-ouro-400',
          aberto ? 'bg-white/10 text-white' : 'text-stone-300 hover:bg-white/5 hover:text-white'
        )}
      >
        <span className="hidden sm:inline">{ativo ? ativo.label : 'Navegar'}</span>
        <ChevronDown
          className={clsx('h-3.5 w-3.5 transition-transform duration-150', aberto && 'rotate-180')}
        />
      </button>

      {/* Faixa horizontal: desce colada ao header e ocupa a mesma largura. */}
      <div
        id={`${id}-bar`}
        role="menu"
        aria-label="Destinos"
        aria-hidden={!aberto}
        onMouseEnter={cancelarFechamento}
        onMouseLeave={agendarFechamento}
        className={clsx(
          'fixed inset-x-0 top-12 z-40 border-b border-white/10 bg-anil-950/95 backdrop-blur-md',
          'transition-[opacity,transform] duration-150 ease-out',
          aberto
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-1 opacity-0'
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-0.5 overflow-x-auto px-3 py-1.5 sm:px-6 lg:px-8">
          {destinos.map((d) => {
            const Icone = d.icon;
            const atual = d.id === ativo?.id;
            return (
              <button
                key={d.id}
                type="button"
                role="menuitem"
                tabIndex={aberto ? 0 : -1}
                onClick={() => ir(d.path)}
                aria-current={atual ? 'page' : undefined}
                className={clsx(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors',
                  'focus:outline-none focus-visible:ring-1 focus-visible:ring-ouro-400',
                  atual
                    ? 'bg-white/10 font-semibold text-white'
                    : 'text-stone-300 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icone
                  className={clsx('h-3.5 w-3.5 shrink-0', atual ? 'text-ouro-400' : 'text-stone-400')}
                />
                <span className="whitespace-nowrap">{d.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
