import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useRouter } from '../../navigation/router';

export interface HeaderSearchProps {
  id?: string;
}

/**
 * Busca do header: uma lupa, e só.
 *
 * Fechada, ocupa o espaço de um ícone. Clicada, o campo cresce para a
 * esquerda e recebe foco. Sem rótulo, sem placeholder longo, sem caixa
 * permanente ocupando o header — a lupa já diz o que é.
 *
 * Fecha no Escape, ao perder o foco vazia, e ao submeter.
 */
export const HeaderSearch: React.FC<HeaderSearchProps> = ({ id = 'header-search' }) => {
  const { navigate } = useRouter();
  const [aberta, setAberta] = useState(false);
  const [termo, setTermo] = useState('');
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberta) campo.current?.focus();
  }, [aberta]);

  const fechar = () => {
    setAberta(false);
    setTermo('');
  };

  const submeter = (e: React.FormEvent) => {
    e.preventDefault();
    const q = termo.trim();
    if (!q) {
      fechar();
      return;
    }
    navigate(`/search?q=${encodeURIComponent(q)}`);
    fechar();
  };

  return (
    <form id={id} onSubmit={submeter} className="flex items-center" role="search">
      <div
        className={clsx(
          'flex items-center overflow-hidden rounded-md transition-all duration-200 ease-out',
          aberta ? 'w-44 bg-white/10 sm:w-56' : 'w-8 bg-transparent'
        )}
      >
        <button
          type={aberta ? 'submit' : 'button'}
          onClick={() => {
            if (!aberta) setAberta(true);
          }}
          aria-label={aberta ? 'Buscar' : 'Abrir busca'}
          className="shrink-0 rounded-md p-1.5 text-stone-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-ouro-400"
        >
          <Search className="h-4 w-4" />
        </button>

        <input
          ref={campo}
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') fechar();
          }}
          onBlur={() => {
            if (!termo.trim()) setAberta(false);
          }}
          aria-label="Buscar na plataforma"
          tabIndex={aberta ? 0 : -1}
          className={clsx(
            'min-w-0 flex-1 bg-transparent py-1.5 pr-1 text-xs text-white outline-none',
            'placeholder:text-stone-500 [&::-webkit-search-cancel-button]:appearance-none',
            !aberta && 'pointer-events-none'
          )}
        />

        {aberta && termo && (
          <button
            type="button"
            onClick={fechar}
            aria-label="Limpar busca"
            className="shrink-0 p-1.5 text-stone-400 transition-colors hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </form>
  );
};
