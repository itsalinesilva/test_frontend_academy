import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export interface CarrosselProps {
  id: string;
  /** Itens já renderizados. O carrossel só decide quais aparecem. */
  children: React.ReactNode[];
  /** Quantos itens por página em telas largas. Abaixo disso, a página encolhe. */
  porPagina?: number;
  /** Rótulo acessível da região. */
  label: string;
  className?: string;
}

/**
 * Carrossel paginado.
 *
 * Mostra uma página de cada vez e troca por setas — sem barra de rolagem
 * horizontal, sem arrastar, sem avanço automático. Com uma página só, os
 * controles não aparecem: não há nada para navegar.
 *
 * A paginação existe para que uma lista longa não vire uma parede de cartões.
 * Quando a lista é curta, ela não precisa de nada.
 */
export const Carrossel: React.FC<CarrosselProps> = ({
  id,
  children,
  porPagina = 3,
  label,
  className,
}) => {
  const [pagina, setPagina] = useState(0);
  const [colunas, setColunas] = useState(porPagina);

  useEffect(() => {
    const ajustar = () => {
      const l = window.innerWidth;
      setColunas(l < 640 ? 1 : l < 1024 ? Math.min(2, porPagina) : porPagina);
    };
    ajustar();
    window.addEventListener('resize', ajustar);
    return () => window.removeEventListener('resize', ajustar);
  }, [porPagina]);

  const total = Math.max(1, Math.ceil(children.length / colunas));
  const atual = Math.min(pagina, total - 1);
  const visiveis = children.slice(atual * colunas, atual * colunas + colunas);

  useEffect(() => {
    if (pagina > total - 1) setPagina(total - 1);
  }, [pagina, total]);

  return (
    <section id={id} aria-label={label} aria-roledescription="carrossel" className={className}>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${colunas}, minmax(0, 1fr))` }}
      >
        {visiveis}
      </div>

      {total > 1 && (
        <div className="mt-3 flex items-center justify-end gap-1.5">
          <span className="mr-1 font-mono text-[11px] text-stone-400" aria-live="polite">
            {atual + 1}/{total}
          </span>

          <button
            type="button"
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            disabled={atual === 0}
            aria-label="Página anterior"
            className="flex h-7 w-7 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setPagina((p) => Math.min(total - 1, p + 1))}
            disabled={atual === total - 1}
            aria-label="Próxima página"
            className={clsx(
              'flex h-7 w-7 items-center justify-center rounded-full text-stone-500 transition-colors',
              'hover:bg-stone-100 hover:text-stone-900 disabled:opacity-30 disabled:hover:bg-transparent'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
};
