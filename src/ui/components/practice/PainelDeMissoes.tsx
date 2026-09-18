import React from 'react';
import { ProgressoDaMissao, temBarra } from '../../../domain/missoes';
import { Check, Clock } from 'lucide-react';

interface PainelDeMissoesProps {
  missoes: ProgressoDaMissao[];
  /** Quanto falta para a virada do dia, já escrito. */
  prazo: string;
  /**
   * O desafio do mês, quando houver.
   *
   * Opcional: mês sem desafio não mostra um vazio nem promete um futuro. Ou o
   * desafio existe, ou a seção não aparece.
   */
  desafioDoMes?: { titulo: string; descricao: string; feito: number; alvo: number };
}

/**
 * As missões do dia.
 *
 * Três, sorteadas de uma lista fixa, com prazo até a virada. Quem sorteia é o
 * domínio, com semente derivada da pessoa e do dia — a mesma pessoa vê as
 * mesmas três o dia inteiro, em qualquer aparelho.
 *
 * NÃO EXISTE "MAIS MISSÕES EM BREVE"
 * ----------------------------------
 * Nem o espaço reservado para elas. Promessa de funcionalidade futura na tela
 * é antipadrão: ou a missão existe, ou não aparece.
 *
 * BARRA SÓ ONDE HÁ O QUE CONTAR
 * -----------------------------
 * "Termine uma rodada sem errar" não tem meio caminho. Desenhar "0 de 1" ali
 * seria fingir progresso onde só há sim e não — e barra parada é lida como
 * travamento, não como tarefa de um passo.
 */
export const PainelDeMissoes: React.FC<PainelDeMissoesProps> = ({
  missoes,
  prazo,
  desafioDoMes,
}) => (
  <section aria-labelledby="titulo-missoes" className="space-y-3">
    <header className="flex items-baseline justify-between gap-4">
      <h2 id="titulo-missoes" className="font-serif text-lg font-bold text-stone-900">
        Missões de hoje
      </h2>
      <p className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-stone-500">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">Prazo: </span>
        {prazo}
      </p>
    </header>

    <ul className="space-y-2">
      {missoes.map((p) => (
        <li
          key={p.missao.id}
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            p.cumprida ? 'border-anil-700 bg-anil-50' : 'border-stone-200 bg-white'
          }`}
        >
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
              p.cumprida
                ? 'border-anil-700 bg-anil-700 text-white'
                : 'border-stone-200 text-stone-300'
            }`}
          >
            {p.cumprida && <Check className="h-4 w-4" />}
          </span>

          <div className="min-w-0 flex-1">
            <p className="flex items-baseline justify-between gap-3">
              <span className="font-serif text-base font-bold text-stone-900">
                {p.missao.titulo}
                {p.cumprida && <span className="sr-only"> — cumprida</span>}
              </span>
              <span className="shrink-0 font-mono text-xs font-bold text-ouro-600">
                +{p.missao.xp} XP
              </span>
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
              {p.missao.descricao}
            </p>

            {temBarra(p) && (
              <div className="mt-2 flex items-center gap-2">
                <div
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200"
                  role="progressbar"
                  aria-valuenow={p.feito}
                  aria-valuemin={0}
                  aria-valuemax={p.alvo}
                  aria-label={`Progresso de ${p.missao.titulo}`}
                >
                  <div
                    className="h-full rounded-full bg-anil-700 transition-all"
                    style={{ width: `${(p.feito / p.alvo) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] text-stone-500">
                  {p.feito} de {p.alvo}
                </span>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>

    {desafioDoMes && (
      <div className="rounded-xl border border-ouro-500/40 bg-white p-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ouro-600">
          Desafio do mês
        </p>
        <p className="mt-1 font-serif text-base font-bold text-stone-900">
          {desafioDoMes.titulo}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-stone-600">
          {desafioDoMes.descricao}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200"
            role="progressbar"
            aria-valuenow={desafioDoMes.feito}
            aria-valuemin={0}
            aria-valuemax={desafioDoMes.alvo}
            aria-label={`Progresso do desafio do mês`}
          >
            <div
              className="h-full rounded-full bg-ouro-500 transition-all"
              style={{ width: `${(desafioDoMes.feito / desafioDoMes.alvo) * 100}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-stone-500">
            {desafioDoMes.feito} de {desafioDoMes.alvo}
          </span>
        </div>
        <p className="mt-2 text-[11px] text-stone-500">
          Rende emblema, e não experiência.
        </p>
      </div>
    )}
  </section>
);
