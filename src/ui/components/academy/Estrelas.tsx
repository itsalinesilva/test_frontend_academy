import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';
import { Estrelas as NotaEstrelas } from '../../../domain/reviews';

export interface EstrelasProps {
  id?: string;
  /** `null` desenha as cinco vazias — ausência de nota, não nota zero. */
  valor: number | null;
  tamanho?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TAMANHO = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };

/** Exibição. Não interage. */
export const Estrelas: React.FC<EstrelasProps> = ({ valor, tamanho = 'md', className }) => (
  <span
    className={clsx('inline-flex items-center gap-0.5', className)}
    role="img"
    aria-label={valor === null ? 'sem avaliação' : `${valor} de 5 estrelas`}
  >
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        aria-hidden="true"
        className={clsx(
          TAMANHO[tamanho],
          valor !== null && i <= Math.round(valor)
            ? 'fill-ouro-500 text-ouro-500'
            : 'text-stone-300'
        )}
      />
    ))}
  </span>
);

export interface SeletorDeEstrelasProps {
  id: string;
  valor: NotaEstrelas | null;
  onChange: (n: NotaEstrelas) => void;
  disabled?: boolean;
}

/**
 * Seletor de nota.
 *
 * É um grupo de rádio de verdade — cada estrela é um input, navegável por
 * teclado com as setas e anunciado pelo leitor de tela. Estrela desenhada com
 * `onClick` num `div` não é acessível, por mais bonita que fique.
 */
export const SeletorDeEstrelas: React.FC<SeletorDeEstrelasProps> = ({
  id,
  valor,
  onChange,
  disabled = false,
}) => {
  const [sobre, setSobre] = useState<number | null>(null);
  const exibido = sobre ?? valor;

  return (
    // `fieldset` tem papel implícito de `group`. Um seletor de nota é um
    // `radiogroup`, e declará-lo faz o leitor de tela anunciar "1 de 5".
    <fieldset
      id={id}
      disabled={disabled}
      role="radiogroup"
      aria-label="Nota de 1 a 5 estrelas"
      className="border-0 p-0"
    >
      <legend className="sr-only">Nota de 1 a 5 estrelas</legend>
      <div className="flex items-center gap-1" onMouseLeave={() => setSobre(null)}>
        {([1, 2, 3, 4, 5] as NotaEstrelas[]).map((n) => (
          <label
            key={n}
            onMouseEnter={() => setSobre(n)}
            className={clsx('cursor-pointer', disabled && 'cursor-default opacity-60')}
          >
            <input
              type="radio"
              name={`${id}-nota`}
              value={n}
              checked={valor === n}
              onChange={() => onChange(n)}
              className="sr-only peer"
            />
            <Star
              aria-hidden="true"
              className={clsx(
                'h-6 w-6 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-anil-700 peer-focus-visible:ring-offset-1 rounded-sm',
                exibido !== null && n <= exibido
                  ? 'fill-ouro-500 text-ouro-500'
                  : 'text-stone-300 hover:text-ouro-400'
              )}
            />
            <span className="sr-only">
              {n} estrela{n > 1 ? 's' : ''}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};
