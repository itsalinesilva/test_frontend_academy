import React from 'react';
import {
  PartituraExecutavel,
  NotaDaPartitura,
  Veredito,
  msParaBatida,
} from '../../../domain/score-follow';
import { ondeTocar, CORDAS } from '../../../domain/violin';

/**
 * Esteira de notas com ponteiro fixo.
 *
 * As notas correm; o ponteiro não. É a convenção dos jogos de ritmo e existe
 * por um motivo prático: com o ponteiro parado, o olho do instrumentista fica
 * num ponto só e a visão periférica antecipa o que vem — enquanto um ponteiro
 * móvel obriga a perseguir a posição com o olhar, o que é incompatível com
 * estar tocando.
 *
 * A altura de cada nota na tela é a CORDA em que ela se toca, não a altura
 * musical. Quem está aprendendo violino precisa saber para qual corda o arco
 * vai; a altura absoluta já está no nome da nota.
 */

export interface EsteiraDeNotasProps {
  partitura: PartituraExecutavel;
  bpm: number;
  /** Tempo decorrido da execução, em ms. */
  decorridoMs: number;
  /** Vereditos já emitidos, por id de nota. */
  vereditos: Record<string, Veredito>;
  /** Quantas batidas cabem na faixa visível. */
  janelaBatidas?: number;
  id?: string;
}

const A = 200;
const L = 900;
/** O ponteiro fica a 28% da esquerda: sobra tempo de ver o que vem. */
const X_PONTEIRO = L * 0.28;

const COR_VEREDITO: Record<Veredito, string> = {
  PERFEITO: '#15803d',
  BOM: '#4d7c0f',
  ADIANTADO: '#b45309',
  ATRASADO: '#b45309',
  ALTURA_ERRADA: '#b91c1c',
  NAO_TOCADA: '#57534e',
};

/** Faixa vertical de cada corda — Mi em cima, Sol embaixo. */
function yDaCorda(indice: number): number {
  const faixa = (A - 56) / 4;
  return 34 + (3 - indice) * faixa + faixa / 2;
}

export const NoteConveyor: React.FC<EsteiraDeNotasProps> = ({
  partitura,
  bpm,
  decorridoMs,
  vereditos,
  janelaBatidas = 8,
  id = 'esteira-notas',
}) => {
  const batidaAtual = msParaBatida(decorridoMs, bpm);
  const larguraPorBatida = (L - X_PONTEIRO) / janelaBatidas;

  const xDaBatida = (batida: number) =>
    X_PONTEIRO + (batida - batidaAtual) * larguraPorBatida;

  // Só o que está na faixa visível é desenhado.
  const visiveis = partitura.notas.filter((n) => {
    const x = xDaBatida(n.inicioBatida);
    return x > -160 && x < L + 40;
  });

  const compassoEmBatidas = partitura.compasso[0];
  const primeiroCompasso = Math.floor(batidaAtual / compassoEmBatidas) - 1;
  const barras = Array.from({ length: janelaBatidas + 2 }, (_, i) => (primeiroCompasso + i) * compassoEmBatidas);

  return (
    <svg
      id={id}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${L} ${A}`}
      className="w-full select-none"
      role="img"
      aria-label={`Esteira da peça ${partitura.titulo}, batida ${Math.floor(batidaAtual) + 1}`}
    >
      <rect x={0} y={0} width={L} height={A} fill="#151f2e" rx={10} />

      {/* Trilhos das cordas */}
      {CORDAS.map((corda) => (
        <g key={corda.indice}>
          <line
            x1={0}
            x2={L}
            y1={yDaCorda(corda.indice)}
            y2={yDaCorda(corda.indice)}
            stroke="#ffffff"
            strokeOpacity={0.07}
            strokeWidth={2.4 - corda.indice * 0.4}
          />
          <text
            x={10}
            y={yDaCorda(corda.indice) + 4}
            fontSize={11}
            fontWeight="bold"
            fill="#57534e"
          >
            {corda.nome}
          </text>
        </g>
      ))}

      {/* Barras de compasso */}
      {barras.map((b) => {
        const x = xDaBatida(b);
        if (x < 0 || x > L) return null;
        return (
          <line
            key={b}
            x1={x}
            x2={x}
            y1={22}
            y2={A - 16}
            stroke="#ffffff"
            strokeOpacity={0.12}
            strokeWidth={1}
          />
        );
      })}

      {/* Notas */}
      {visiveis.map((nota: NotaDaPartitura) => {
        if (nota.nota === null) return null;
        const ponto = ondeTocar(nota.nota);
        if (!ponto) return null;

        const x = xDaBatida(nota.inicioBatida);
        const largura = Math.max(18, nota.duracaoBatidas * larguraPorBatida - 6);
        const y = yDaCorda(ponto.corda.indice);
        const verdict = vereditos[nota.id];

        // Já passou pelo ponteiro e ainda não foi julgada.
        const passou = x + largura < X_PONTEIRO;
        const cor = verdict
          ? COR_VEREDITO[verdict]
          : passou
            ? '#3f3f46'
            : '#b5a17d';

        return (
          <g key={nota.id} opacity={passou && !verdict ? 0.4 : 1}>
            <rect
              x={x}
              y={y - 13}
              width={largura}
              height={26}
              rx={6}
              fill={cor}
              fillOpacity={verdict ? 0.85 : 0.9}
            />
            <text
              x={x + 8}
              y={y + 5}
              fontSize={13}
              fontWeight="bold"
              fill="#151f2e"
            >
              {ponto.digitacao.dedo}
            </text>
            {largura > 46 && (
              <text x={x + 24} y={y + 4} fontSize={11} fill="#151f2e" fillOpacity={0.75}>
                {nota.nota}
              </text>
            )}
          </g>
        );
      })}

      {/* Ponteiro — fixo, por isso o olho não precisa persegui-lo */}
      <line
        x1={X_PONTEIRO}
        x2={X_PONTEIRO}
        y1={16}
        y2={A - 10}
        stroke="#f5f7fa"
        strokeWidth={2.5}
      />
      <polygon
        points={`${X_PONTEIRO - 7},10 ${X_PONTEIRO + 7},10 ${X_PONTEIRO},20`}
        fill="#f5f7fa"
      />
    </svg>
  );
};
