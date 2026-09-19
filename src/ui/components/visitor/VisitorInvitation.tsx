import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface InvitationHighlight {
  /** O número, já formatado. Vem de quem mediu — este componente não conta. */
  value: string;
  label: string;
}

export interface InvitationStep {
  title: string;
  description: string;
}

interface VisitorInvitationProps {
  /** O nome do espaço, como ele se chama. */
  space: string;
  /** Uma frase sobre o que este espaço é. Não um slogan: uma definição. */
  summary: string;
  /**
   * Números reais, medidos por quem chama.
   *
   * O componente não conta nada: contar aqui exigiria buscar dados que a tela
   * já tem, e duas contagens divergem. Lista vazia é caso previsto.
   */
  highlights?: InvitationHighlight[];
  /** Como funciona, em passos. É o que responde "e daí?". */
  steps?: InvitationStep[];
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /**
   * A ressalva institucional, quando o espaço a exige.
   *
   * Curso livre precisa dizer que é curso livre **na apresentação**, e não
   * escondido no rodapé de um termo. Ver `73_ANTIPATTERNS.md`.
   */
  disclaimer?: string;
}

/**
 * O convite ao visitante.
 *
 * O QUE ISTO SUBSTITUI
 * --------------------
 * O trilho da Academia dizia, a quem nunca entrou: *"Seu progresso — você
 * ainda não se matriculou."* O componente existia ali por razão estrutural, e
 * mostrar o estado vazio dele foi o caminho mais curto.
 *
 * Mas o espaço mais valioso da tela estava sendo gasto para informar à pessoa
 * que ela não tem nada. Para quem chega de fora, "seu progresso" não é uma
 * seção vazia: é uma seção **sem sujeito**. Não há "seu".
 *
 * O QUE ELE FAZ
 * -------------
 * Responde às três perguntas de quem chega, nesta ordem: **o que é isto**,
 * **o que eu levo** e **como começo**. É a ordem em que a dúvida aparece —
 * começar pela chamada à ação seria pedir decisão antes de dar informação.
 *
 * OS NÚMEROS SÃO REAIS
 * --------------------
 * Vêm de fora, medidos por quem já carregou os dados. Um número inventado num
 * convite é pior que em qualquer outro lugar da plataforma: é a primeira coisa
 * que a pessoa lê, e vira a promessa contra a qual ela vai comparar tudo.
 */
export const VisitorInvitation: React.FC<VisitorInvitationProps> = ({
  space,
  summary,
  highlights = [],
  steps = [],
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  disclaimer,
}) => (
  <section aria-labelledby="convite-titulo" className="space-y-5">
    <header>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-anil-700">
        {space}
      </p>
      <h2
        id="convite-titulo"
        className="mt-1 font-serif text-xl font-bold leading-snug text-stone-900"
      >
        {summary}
      </h2>
    </header>

    {highlights.length > 0 && (
      <dl className="grid grid-cols-2 gap-2">
        {highlights.map((h) => (
          <div key={h.label} className="rounded-xl border border-stone-200 bg-white px-3 py-2.5">
            <dt className="font-mono text-[10px] uppercase tracking-wider text-stone-500">
              {h.label}
            </dt>
            <dd className="mt-0.5 font-serif text-lg font-bold text-stone-900">{h.value}</dd>
          </div>
        ))}
      </dl>
    )}

    {steps.length > 0 && (
      <ol className="space-y-2.5">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-anil-800 font-mono text-[10px] font-bold text-white"
            >
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-stone-900">{s.title}</span>
              <span className="block text-xs leading-relaxed text-stone-600">
                {s.description}
              </span>
            </span>
          </li>
        ))}
      </ol>
    )}

    <div className="space-y-2">
      <button
        type="button"
        onClick={onPrimary}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-anil-800 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-anil-700"
      >
        {primaryLabel}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>

      {secondaryLabel && onSecondary && (
        <button
          type="button"
          onClick={onSecondary}
          className="w-full rounded-lg border border-stone-300 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:border-anil-700 hover:text-anil-800"
        >
          {secondaryLabel}
        </button>
      )}
    </div>

    {disclaimer && (
      <p className="border-t border-stone-200 pt-3 text-[11px] leading-relaxed text-stone-500">
        {disclaimer}
      </p>
    )}
  </section>
);
