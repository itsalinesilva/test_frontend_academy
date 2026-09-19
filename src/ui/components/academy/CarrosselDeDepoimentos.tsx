import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { clsx } from 'clsx';
import { AvaliacaoDeCurso, nomeExibido } from '../../../domain/reviews';
import { Estrelas } from './Estrelas';

export interface CarrosselDeDepoimentosProps {
  id?: string;
  /** Avaliações em destaque. A seleção é feita por quem chama. */
  depoimentos: AvaliacaoDeCurso[];
  titulo?: string;
}

/**
 * Carrossel de depoimentos.
 *
 * Mostra um depoimento por vez, com setas e pontos de posição. Não gira
 * sozinho: rotação automática rouba a leitura de quem está no meio de uma
 * frase, e é das coisas mais irritantes que uma página pode fazer.
 *
 * Os depoimentos são avaliações reais de alunos que concluíram. Não há
 * depoimento redigido pela instituição — se não houver aluno, não há seção.
 */
export const CarrosselDeDepoimentos: React.FC<CarrosselDeDepoimentosProps> = ({
  id = 'depoimentos',
  depoimentos,
  titulo = 'Por que estudar no Conservatório',
}) => {
  const [atual, setAtual] = useState(0);

  if (depoimentos.length === 0) {
    return (
      <section id={id} aria-labelledby={`${id}-titulo`}>
        <h2 id={`${id}-titulo`} className="font-serif text-xl font-semibold text-stone-900">
          {titulo}
        </h2>
        <div className="mt-4 rounded-xl bg-stone-50 p-6">
          <Quote className="h-5 w-5 text-stone-300" aria-hidden="true" />
          <p className="mt-3 text-sm leading-relaxed text-stone-700">
            Ainda não há depoimentos. Eles aparecem aqui quando alunos concluírem o curso e
            escreverem sobre a experiência.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-stone-500">
            O Conservatório não redige depoimento. O que estiver nesta seção terá sido escrito
            por quem fez o curso.
          </p>
        </div>
      </section>
    );
  }

  const d = depoimentos[Math.min(atual, depoimentos.length - 1)];
  const unico = depoimentos.length === 1;

  return (
    <section id={id} aria-labelledby={`${id}-titulo`} aria-roledescription="carrossel">
      <h2 id={`${id}-titulo`} className="font-serif text-xl font-semibold text-stone-900">
        {titulo}
      </h2>

      <div className="mt-4 flex items-center gap-3">
        {!unico && (
          <button
            type="button"
            onClick={() => setAtual((i) => (i - 1 + depoimentos.length) % depoimentos.length)}
            aria-label="Depoimento anterior"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <blockquote
          className="min-w-0 flex-1 rounded-xl bg-stone-50 p-6"
          aria-live="polite"
          aria-atomic="true"
        >
          <Quote className="h-5 w-5 text-ouro-500" aria-hidden="true" />
          <p className="mt-3 text-base leading-relaxed text-stone-800">{d.comentario}</p>
          <footer className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
            <cite className="text-sm font-medium not-italic text-stone-900">{nomeExibido(d)}</cite>
            <Estrelas valor={d.estrelas} tamanho="sm" />
            <span className="text-xs text-stone-500">
              concluiu em {new Date(d.criadaEm).toLocaleDateString('pt-BR')}
            </span>
          </footer>
        </blockquote>

        {!unico && (
          <button
            type="button"
            onClick={() => setAtual((i) => (i + 1) % depoimentos.length)}
            aria-label="Próximo depoimento"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {!unico && (
        <div className="mt-3 flex justify-center gap-1.5">
          {depoimentos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setAtual(i)}
              aria-label={`Depoimento ${i + 1} de ${depoimentos.length}`}
              aria-current={i === atual ? 'true' : undefined}
              className={clsx(
                'h-1.5 rounded-full transition-all',
                i === atual ? 'w-5 bg-anil-800' : 'w-1.5 bg-stone-300 hover:bg-stone-400'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
};
