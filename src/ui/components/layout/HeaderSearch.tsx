import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from '../../navigation/router';

export interface HeaderSearchProps {
  id?: string;
}

/**
 * Busca do header: uma lupa, e só.
 *
 * Fechada, ocupa o espaço de um ícone. Clicada, o campo aparece à direita dela
 * e recebe foco. Sem rótulo, sem placeholder longo, sem caixa permanente
 * ocupando o header — a lupa já diz o que é.
 *
 * DOIS DEFEITOS QUE ISTO CORRIGE
 * ------------------------------
 * **Cor.** O componente nasceu num header escuro: ícone claro, texto digitado
 * branco. Quando o header passou a ser branco, o ícone clareava até sumir no
 * hover e o que se digitava ficava branco sobre branco.
 *
 * **Recorte.** O campo era um `<input>` sempre montado dentro de um container
 * com `overflow-hidden` que animava de 32px para 176px. Dar foco a um elemento
 * dentro de um container recortado faz o navegador rolá-lo para dentro da
 * vista — e como o container tinha 32px no instante do foco, ele ganhava
 * `scrollLeft` e nunca voltava. O texto existia no DOM e ficava fora da área
 * visível. jsdom não faz layout nem rolagem, então nenhum teste de valor
 * pegaria isso.
 *
 * Agora o campo só é **montado** quando aberto, e não há recorte: não existe
 * container clipado para rolar, e não existe estado intermediário em que o
 * foco cai num elemento de 32px de largura.
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
      {!aberta ? (
        <button
          type="button"
          onClick={() => setAberta(true)}
          aria-label="Abrir busca"
          aria-expanded={false}
          className="rounded-md p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 focus:outline-none focus-visible:ring-1 focus-visible:ring-anil-700"
        >
          <Search className="h-4 w-4" />
        </button>
      ) : (
        <div className="flex w-44 items-center gap-1 rounded-md bg-stone-100 px-1 ring-1 ring-stone-300 focus-within:ring-2 focus-within:ring-anil-700 sm:w-64">
          <button
            type="submit"
            aria-label="Buscar"
            className="shrink-0 rounded p-1.5 text-stone-500 transition-colors hover:text-stone-900 focus:outline-none focus-visible:ring-1 focus-visible:ring-anil-700"
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
            placeholder="Buscar"
            className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-stone-900 outline-none placeholder:text-stone-400 [&::-webkit-search-cancel-button]:appearance-none"
          />

          {termo && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={fechar}
              aria-label="Limpar busca"
              className="shrink-0 rounded p-1.5 text-stone-400 transition-colors hover:text-stone-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </form>
  );
};
