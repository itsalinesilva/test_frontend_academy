import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from '../../navigation/router';
import { UserRole } from '../../../domain/types';

export interface ExplorarMenuProps {
  id?: string;
  currentUserRole?: UserRole;
  showAdminTab?: boolean;
}

interface Grupo {
  titulo: string;
  itens: { label: string; hint: string; path: string }[];
}

/**
 * "Explorar" — o dropdown que reúne tudo o que a plataforma tem.
 *
 * É um painel largo, em colunas por assunto, e não uma lista de rotas: quem
 * abre está procurando um lugar para ir, não conferindo um menu. Abre por
 * proximidade do ponteiro e por clique, fecha no Escape e no clique fora.
 */
export const ExplorarMenu: React.FC<ExplorarMenuProps> = ({
  id = 'explorar',
  currentUserRole = UserRole.ALUNO,
  showAdminTab = false,
}) => {
  const { currentPath, navigate } = useRouter();
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const fechamento = useRef<number | null>(null);

  const cancelar = useCallback(() => {
    if (fechamento.current !== null) {
      window.clearTimeout(fechamento.current);
      fechamento.current = null;
    }
  }, []);

  const agendarFechamento = useCallback(() => {
    cancelar();
    fechamento.current = window.setTimeout(() => setAberto(false), 200);
  }, [cancelar]);

  useEffect(() => cancelar, [cancelar]);

  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
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

  const grupos: Grupo[] = [
    {
      titulo: 'Estudar',
      itens: [
        { label: 'Cursos', hint: 'O catálogo completo', path: '/academy' },
        { label: 'Programas', hint: 'Cursos combinados em percurso', path: '/academy?aba=programas' },
        { label: 'Biblioteca', hint: 'Livros do Conservatório', path: '/admin/biblioteca' },
      ],
    },
    {
      titulo: 'Praticar',
      itens: [
        { label: 'Practice', hint: 'Treino com medição real', path: '/practice' },
        { label: 'Violino', hint: 'Simulador e board por nível', path: '/violin/simulator' },
        { label: 'Partituras', hint: 'Acervo de domínio público', path: '/score' },
      ],
    },
    {
      titulo: 'Criar',
      itens: [
        { label: 'Studio', hint: 'Edição e síntese', path: '/studio' },
        { label: 'Editor de partitura', hint: 'Escrever e salvar', path: '/studio/score' },
        { label: 'Laboratório de voz', hint: 'Afinador e forma de onda', path: '/studio/voice-ear' },
      ],
    },
    {
      titulo: 'Descobrir',
      itens: [
        { label: 'Atlas', hint: 'Obras por era e compositor', path: '/worlds' },
        { label: 'Comunidade', hint: 'Fórum e eventos', path: '/community' },
        { label: 'Rede', hint: 'Perfis do Conservatório', path: '/profile/network' },
      ],
    },
  ];

  if (currentUserRole === UserRole.PROFESSOR || currentUserRole === UserRole.ADMIN) {
    grupos[3].itens.push({ label: 'Salas', hint: 'Suas turmas', path: '/rooms' });
  }
  if (currentUserRole === UserRole.ADMIN || showAdminTab) {
    grupos[3].itens.push({ label: 'Admin', hint: 'Governança', path: '/admin' });
  }

  const ir = (path: string) => {
    setAberto(false);
    navigate(path);
  };

  return (
    <div
      id={id}
      ref={raiz}
      onMouseEnter={() => {
        cancelar();
        setAberto(true);
      }}
      onMouseLeave={agendarFechamento}
    >
      <button
        type="button"
        id={`${id}-trigger`}
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-controls={`${id}-painel`}
        className={clsx(
          'inline-flex items-center gap-1 rounded px-2 py-1.5 text-sm transition-colors',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-anil-700',
          aberto ? 'text-anil-800' : 'text-stone-700 hover:text-anil-800'
        )}
      >
        Explorar
        <ChevronDown
          className={clsx('h-3.5 w-3.5 transition-transform duration-150', aberto && 'rotate-180')}
        />
      </button>

      <div
        id={`${id}-painel`}
        role="menu"
        aria-label="Explorar a plataforma"
        aria-hidden={!aberto}
        onMouseEnter={cancelar}
        onMouseLeave={agendarFechamento}
        className={clsx(
          'fixed inset-x-0 top-14 z-40 border-b border-stone-200 bg-white shadow-lg',
          'transition-[opacity,transform] duration-150 ease-out',
          aberto
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-1 opacity-0'
        )}
      >
        <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-5 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {grupos.map((g) => (
            <div key={g.titulo}>
              <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                {g.titulo}
              </p>
              <ul className="space-y-0.5">
                {g.itens.map((it) => {
                  const atual = currentPath === it.path;
                  return (
                    <li key={it.path}>
                      <button
                        type="button"
                        role="menuitem"
                        tabIndex={aberto ? 0 : -1}
                        onClick={() => ir(it.path)}
                        aria-current={atual ? 'page' : undefined}
                        className="w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-stone-50 focus:outline-none focus-visible:bg-stone-50"
                      >
                        <span
                          className={clsx(
                            'block text-sm',
                            atual ? 'font-semibold text-anil-800' : 'text-stone-900'
                          )}
                        >
                          {it.label}
                        </span>
                        <span className="block text-xs text-stone-500">{it.hint}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
