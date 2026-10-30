import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from '../../navigation/router';
import { pilaresVisiveis } from '../../navigation/pilares';
import { useCurrentUser } from '../../hooks/useCurrentUser';

export interface ExplorarMenuProps {
  id?: string;
}

/**
 * "Explorar" — o dropdown que reúne tudo o que a plataforma tem.
 *
 * É um painel largo, em colunas por assunto, e não uma lista de rotas: quem
 * abre está procurando um lugar para ir, não conferindo um menu. Abre por
 * proximidade do ponteiro e por clique, fecha no Escape e no clique fora.
 */
export const ExplorarMenu: React.FC<ExplorarMenuProps> = ({ id = 'explorar' }) => {
  const { currentPath, navigate } = useRouter();
  const { userId } = useCurrentUser();
  const temSessao = !!userId;
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

  /**
   * 🔴 O MENU LISTA OS PILARES, E NADA MAIS.
   *
   * Ele já listou quatro grupos por verbo — "Aprender", "Tocar", "Descobrir" —
   * e depois os pilares **com as sub-rotas penduradas**. Nos dois casos virou
   * um inventário: quem abre para ir a um lugar precisa ler tudo para achar.
   *
   * Aqui ficam só os destinos. O editor de partitura está dentro do Estúdio, o
   * Atlas dentro do Acervo, a comunidade dentro do Perfil — e cada um desses
   * lugares os oferece. Um menu de navegação que lista sub-rota obriga a pessoa
   * a ler o mapa inteiro para achar a sala.
   *
   * Visitante vê **quatro**. Perfil é a conta, e só existe com sessão.
   */
  const itens = pilaresVisiveis(temSessao).map((pilar) => ({
    label: pilar.label,
    hint: pilar.hint,
    path: pilar.path,
  }));

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
        <ul className="mx-auto grid max-w-7xl gap-1 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {itens.map((it) => {
            const atual = currentPath === it.path;
            return (
              <li key={it.path}>
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={aberto ? 0 : -1}
                  onClick={() => ir(it.path)}
                  aria-current={atual ? 'page' : undefined}
                  className="w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-stone-50 focus:outline-none focus-visible:bg-stone-50"
                >
                  <span
                    className={clsx(
                      'block text-sm',
                      atual ? 'font-semibold text-anil-800' : 'font-medium text-stone-900'
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
    </div>
  );
};
