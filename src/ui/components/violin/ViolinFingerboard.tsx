import React from 'react';
import {
  CORDAS,
  ondeTocar,
  notasEmPrimeiraPosicao,
  descreverExecucao,
  PontoNoBraco,
} from '../../../domain/violin';

/**
 * Braço do violino mapeado.
 *
 * As posições dos dedos vêm de `fracaoDoBraco`, que é física: para subir `n`
 * semitons pisa-se à fração `1 − 2^(−n/12)` do comprimento. As distâncias
 * diminuem conforme se sobe.
 *
 * Isso não é preciosismo. Um diagrama com dedos igualmente espaçados — o que
 * sai quando se desenha de olho — ensina a mão a ir para o lugar errado, e no
 * violino não há trastes para corrigir. O braço desenhado é o braço real.
 *
 * Orientação: corda Sol à esquerda, Mi à direita, pestana em cima. É como o
 * instrumentista vê o próprio braço ao olhar para baixo.
 */

export interface BracoDoViolinoProps {
  /** Nota que deve ser tocada agora. */
  notaAlvo?: string | null;
  /** Nota seguinte, mostrada apagada para antecipar o movimento. */
  notaSeguinte?: string | null;
  /** Nota que o microfone está captando. */
  notaDetectada?: string | null;
  /** Desvio de afinação em cents, para colorir o ponto detectado. */
  deviationCents?: number | null;
  /** Mostra todas as alturas de primeira posição, como mapa de estudo. */
  mostrarTodasAsNotas?: boolean;
  larguraExibicao?: number;
  id?: string;
}

// Geometria do desenho, em unidades do viewBox.
const L = 300;
const A = 560;
const TOPO = 44;
const BASE = 520;
const MARGEM_X = 58;
const ESPACO = (L - MARGEM_X * 2) / 3;

/** A primeira posição ocupa esta fração do braço desenhado. */
const FRACAO_VISIVEL = 0.42;

function xDaCorda(indice: number): number {
  return MARGEM_X + indice * ESPACO;
}

function yDaFracao(fracao: number): number {
  return TOPO + (fracao / FRACAO_VISIVEL) * (BASE - TOPO);
}

export const ViolinFingerboard: React.FC<BracoDoViolinoProps> = ({
  notaAlvo,
  notaSeguinte,
  notaDetectada,
  deviationCents,
  mostrarTodasAsNotas = false,
  larguraExibicao = 260,
  id = 'braco-violino',
}) => {
  const alvo = notaAlvo ? ondeTocar(notaAlvo) : null;
  const seguinte = notaSeguinte ? ondeTocar(notaSeguinte) : null;
  const detectado = notaDetectada ? ondeTocar(notaDetectada) : null;
  const todas = mostrarTodasAsNotas ? notasEmPrimeiraPosicao() : [];

  const corDetectado =
    deviationCents === null || deviationCents === undefined
      ? '#78716c'
      : Math.abs(deviationCents) <= 10
        ? '#15803d'
        : Math.abs(deviationCents) <= 30
          ? '#b45309'
          : '#b91c1c';

  const label = alvo ? descreverExecucao(alvo).acessivel : 'Nenhuma nota indicada.';

  return (
    <svg
      id={id}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${L} ${A}`}
      width={larguraExibicao}
      role="img"
      aria-label={`Braço do violino. ${label}`}
      className="select-none"
    >
      {/* Espelho */}
      <path
        d={`M ${MARGEM_X - 26} ${TOPO - 18} L ${L - MARGEM_X + 26} ${TOPO - 18} L ${L - MARGEM_X + 40} ${A - 8} L ${MARGEM_X - 40} ${A - 8} Z`}
        fill="#2a1f18"
      />
      {/* Pestana */}
      <rect
        x={MARGEM_X - 28}
        y={TOPO - 24}
        width={L - (MARGEM_X - 28) * 2}
        height={10}
        rx={3}
        fill="#e1dbd1"
      />

      {/*
        Marcas de referência das posições naturais. Não são trastes — o
        violino não tem — e por isso são finas e discretas: servem de
        orientação visual, não de garantia de afinação.
      */}
      {[2, 4, 5, 7].map((semitom) => {
        const y = yDaFracao(1 - Math.pow(2, -semitom / 12));
        return (
          <line
            key={semitom}
            x1={MARGEM_X - 20}
            x2={L - MARGEM_X + 20}
            y1={y}
            y2={y}
            stroke="#ffffff"
            strokeOpacity={0.09}
            strokeWidth={1}
          />
        );
      })}

      {/* Cordas */}
      {CORDAS.map((corda) => (
        <g key={corda.indice}>
          <line
            x1={xDaCorda(corda.indice)}
            x2={xDaCorda(corda.indice)}
            y1={TOPO - 22}
            y2={A - 8}
            stroke="#d6d3d1"
            // A Sol é a mais grossa; a Mi, a mais fina.
            strokeWidth={2.6 - corda.indice * 0.45}
            strokeLinecap="round"
          />
          <text
            x={xDaCorda(corda.indice)}
            y={TOPO - 32}
            textAnchor="middle"
            fontSize={13}
            fontWeight="bold"
            fill={
              alvo?.corda.indice === corda.indice
                ? '#b5a17d'
                : '#a8a29e'
            }
          >
            {corda.nome}
          </text>
        </g>
      ))}

      {/* Mapa completo, quando pedido */}
      {todas.map((p: PontoNoBraco) => (
        <circle
          key={`${p.corda.indice}-${p.digitacao.semitons}`}
          cx={xDaCorda(p.corda.indice)}
          cy={yDaFracao(p.fracao)}
          r={p.digitacao.dedo === 0 ? 0 : 7}
          fill="#ffffff"
          fillOpacity={0.09}
        />
      ))}

      {/* Nota seguinte, apagada — antecipa o movimento da mão */}
      {seguinte && seguinte.digitacao.dedo > 0 && (
        <circle
          cx={xDaCorda(seguinte.corda.indice)}
          cy={yDaFracao(seguinte.fracao)}
          r={11}
          fill="none"
          stroke="#b5a17d"
          strokeOpacity={0.45}
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
      )}

      {/* Onde o microfone diz que a mão está */}
      {detectado && (
        <circle
          cx={xDaCorda(detectado.corda.indice)}
          cy={yDaFracao(detectado.fracao)}
          r={9}
          fill={corDetectado}
          fillOpacity={0.55}
        />
      )}

      {/* Nota a tocar agora */}
      {alvo && (
        <g>
          {alvo.digitacao.dedo === 0 ? (
            // Corda solta: a marca fica na pestana, não no braço.
            <rect
              x={xDaCorda(alvo.corda.indice) - 13}
              y={TOPO - 26}
              width={26}
              height={14}
              rx={3}
              fill="#b5a17d"
            />
          ) : (
            <>
              <circle
                cx={xDaCorda(alvo.corda.indice)}
                cy={yDaFracao(alvo.fracao)}
                r={14}
                fill="#b5a17d"
              />
              <text
                x={xDaCorda(alvo.corda.indice)}
                y={yDaFracao(alvo.fracao) + 5}
                textAnchor="middle"
                fontSize={15}
                fontWeight="bold"
                fill="#1d2f49"
              >
                {alvo.digitacao.dedo}
              </text>
              {/*
                O 2º dedo baixo e o alto são o MESMO dedo em lugares
                diferentes, e confundi-los é a origem de boa parte da
                desafinação de iniciante. A marca torna a diferença visível.
              */}
              {alvo.digitacao.variante !== 'natural' && (
                <text
                  x={xDaCorda(alvo.corda.indice) + 20}
                  y={yDaFracao(alvo.fracao) + 4}
                  fontSize={9}
                  fill="#cdc1ad"
                >
                  {alvo.digitacao.variante === 'baixo' ? '↓' : '↑'}
                </text>
              )}
            </>
          )}
        </g>
      )}

      {/* Legenda em texto: quem está com o instrumento no ombro não fica
          olhando para a tela. */}
      {alvo && (
        <text
          x={L / 2}
          y={A - 14}
          textAnchor="middle"
          fontSize={14}
          fontWeight="bold"
          fill="#f5f7fa"
        >
          {descreverExecucao(alvo).texto}
        </text>
      )}
    </svg>
  );
};
