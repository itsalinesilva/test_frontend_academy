import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface NoteItem {
  id: string;
  step: 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
  octave: number;
  duration: 'whole' | 'half' | 'quarter' | 'eighth';
  accidental?: 'sharp' | 'flat' | 'natural';
}

export interface StaffProps {
  id?: string;
  clef?: 'treble' | 'bass' | 'alto';
  timeSignature?: string; // "4/4", "3/4", "6/8"
  notes?: NoteItem[];
  /** Compassos da pauta VAZIA. Com notas, os compassos saem da duração delas. */
  measureCount?: number;
  /** Notas simultâneas: um acorde se escreve empilhado, e não em fila. */
  acorde?: boolean;
  interactive?: boolean;
  onMeasureClick?: (measureIndex: number) => void;
  className?: string;
}

/**
 * 🔴 A PAUTA DESENHA A NOTA NA ALTURA DELA.
 *
 * A versão anterior punha TODA nota na linha do meio (`noteY = 54`, com o
 * comentário "aproximado pela oitava"), sem acidente e sem linha suplementar.
 * Numa pergunta "que nota está escrita na pauta?", a pauta mostrava a mesma
 * cabeça de nota qualquer que fosse a resposta — a pergunta não tinha resposta
 * possível pela leitura. Os testes contavam cabeças de nota, e nunca a posição
 * delas: por isso nada acusou.
 *
 * A REGRA
 * -------
 * Cada linha e cada espaço é um grau. A linha de baixo é Mi4 na clave de sol,
 * Sol2 na de fá e Fá3 na de dó (3ª linha = Dó4). Subir um grau é subir meio
 * espaço — seis unidades aqui. Fora das cinco linhas, desenham-se as linhas
 * suplementares até a nota: sem elas, Dó4 e Lá3 seriam indistinguíveis.
 */

/** Posição vertical das cinco linhas, de cima para baixo. */
const LINHAS = [30, 42, 54, 66, 78] as const;
const LINHA_DE_BAIXO = 78;
const LINHA_DO_MEIO = 54;
const MEIO_ESPACO = 6;

const GRAU: Record<NoteItem['step'], number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };

/** O grau (oitava × 7 + letra) que cai na linha de baixo de cada clave. */
const GRAU_DA_LINHA_DE_BAIXO: Record<NonNullable<StaffProps['clef']>, number> = {
  treble: 4 * 7 + GRAU.E, // Mi4
  bass: 2 * 7 + GRAU.G, // Sol2
  alto: 3 * 7 + GRAU.F, // Fá3
};

/** Altura na pauta: exportada porque é a regra que o teste confere. */
export function alturaNaPauta(
  nota: Pick<NoteItem, 'step' | 'octave'>,
  clef: NonNullable<StaffProps['clef']>
): number {
  const grau = nota.octave * 7 + GRAU[nota.step];
  return LINHA_DE_BAIXO - (grau - GRAU_DA_LINHA_DE_BAIXO[clef]) * MEIO_ESPACO;
}

/** Linhas suplementares que a nota precisa, abaixo ou acima da pauta. */
function suplementares(y: number): number[] {
  const linhas: number[] = [];
  for (let ly = LINHA_DE_BAIXO + 12; ly <= y; ly += 12) linhas.push(ly);
  for (let ly = LINHAS[0] - 12; ly >= y; ly -= 12) linhas.push(ly);
  return linhas;
}

const TEMPOS: Record<NoteItem['duration'], number> = { whole: 4, half: 2, quarter: 1, eighth: 0.5 };
const SIMBOLO_DO_ACIDENTE: Record<NonNullable<NoteItem['accidental']>, string> = {
  sharp: '♯',
  flat: '♭',
  natural: '♮',
};
const NOME_DO_ACIDENTE: Record<NonNullable<NoteItem['accidental']>, string> = {
  sharp: '#',
  flat: 'b',
  natural: '',
};

/** Tempos por compasso, em semínimas: 6/8 são três semínimas, e não seis. */
function temposPorCompasso(formula: string): number {
  const [n, d] = formula.split('/').map(Number);
  if (!n || !d) return 4;
  return (n * 4) / d;
}

const INICIO = 96;
const PASSO = 44;

export const Staff: React.FC<StaffProps> = ({
  id = 'musical-staff',
  clef = 'treble',
  timeSignature = '4/4',
  notes = [],
  measureCount = 4,
  acorde = false,
  interactive = false,
  onMeasureClick,
  className,
}) => {
  /**
   * Onde cada nota fica na horizontal, e onde caem as barras de compasso.
   *
   * As barras vêm da DURAÇÃO das notas, e não de uma divisão fixa: barra em
   * lugar arbitrário diria que a nota pertence a um compasso a que ela não
   * pertence.
   */
  const porCompasso = temposPorCompasso(timeSignature);
  const posicoes: number[] = [];
  const barras: number[] = [];
  let x = INICIO;
  let tempos = 0;

  if (acorde) {
    notes.forEach(() => posicoes.push(INICIO + 20));
    x = INICIO + 20 + PASSO;
  } else {
    for (const n of notes) {
      posicoes.push(x);
      x += PASSO * Math.max(1, TEMPOS[n.duration]);
      tempos += TEMPOS[n.duration];
      if (tempos >= porCompasso - 1e-9) {
        barras.push(x - PASSO / 2);
        tempos = 0;
      }
    }
  }

  const vazia = notes.length === 0;
  const largura = vazia
    ? 600
    : Math.max(acorde ? 200 : 240, (barras.length ? barras[barras.length - 1] : x) + (tempos > 0 || acorde ? PASSO : 8));

  if (vazia) {
    for (let i = 1; i <= measureCount; i++) barras.push(70 + i * (520 / measureCount));
  } else if (acorde || tempos > 0 || barras.length === 0) {
    barras.push(largura - 8);
  }

  const alturas = notes.map((n) => alturaNaPauta(n, clef));

  /**
   * Num acorde, notas vizinhas (uma segunda) não podem ficar uma em cima da
   * outra: a de cima vai para o outro lado da haste, como se escreve à mão.
   */
  const deslocamento = alturas.map((y, i) =>
    acorde && alturas.some((outra, j) => j < i && Math.abs(outra - y) === MEIO_ESPACO) ? 12 : 0
  );

  const topo = Math.min(0, ...alturas.map((y) => y - 36));
  const fundo = Math.max(110, ...alturas.map((y) => y + 36));

  return (
    <div
      id={id}
      className={twMerge(
        'w-full bg-white border border-stone-200 rounded-sm p-4 overflow-x-auto shadow-xs select-none',
        className
      )}
    >
      <svg
        className="h-32"
        style={{ minWidth: `${Math.min(largura, 600)}px`, width: '100%' }}
        viewBox={`0 ${topo} ${largura} ${fundo - topo}`}
        preserveAspectRatio="xMinYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={
          vazia
            ? 'Pauta vazia'
            : `Pauta em clave de ${clef === 'treble' ? 'sol' : clef === 'bass' ? 'fá' : 'dó'}${acorde ? ', notas simultâneas' : ''}`
        }
      >
        <text x="12" y="72" fontFamily="serif" fontSize="48" fill="#1c1917" className="select-none font-bold">
          {clef === 'treble' ? '𝄞' : clef === 'bass' ? '𝄢' : '𝄡'}
        </text>

        <text x="48" y="52" fontFamily="serif" fontSize="22" fontWeight="bold" fill="#1c1917">
          {timeSignature.split('/')[0]}
        </text>
        <text x="48" y="76" fontFamily="serif" fontSize="22" fontWeight="bold" fill="#1c1917">
          {timeSignature.split('/')[1]}
        </text>

        {LINHAS.map((y) => (
          <line key={y} x1="0" y1={y} x2={largura} y2={y} stroke="#44403c" strokeWidth="1.5" />
        ))}

        {barras.map((bx, idx) => (
          <g
            key={idx}
            onClick={() => interactive && onMeasureClick && onMeasureClick(idx)}
            className={interactive ? 'cursor-pointer hover:opacity-80' : undefined}
          >
            <line
              x1={bx}
              y1={LINHAS[0]}
              x2={bx}
              y2={LINHA_DE_BAIXO}
              stroke="#1c1917"
              strokeWidth={idx === barras.length - 1 ? '3' : '1.5'}
            />
          </g>
        ))}

        {notes.map((note, idx) => {
          const y = alturas[idx];
          const nx = posicoes[idx] + deslocamento[idx];
          const vazada = note.duration === 'whole' || note.duration === 'half';
          const temHaste = note.duration !== 'whole';
          /** Da linha do meio para cima, a haste desce pela esquerda; abaixo, sobe pela direita. */
          const hasteParaBaixo = y <= LINHA_DO_MEIO;
          const hx = hasteParaBaixo ? nx - 5.5 : nx + 5.5;
          const hy2 = hasteParaBaixo ? y + 30 : y - 30;
          const nome = `${note.step}${note.accidental ? NOME_DO_ACIDENTE[note.accidental] : ''}${note.octave}`;

          return (
            <g key={note.id} data-nota={nome} data-y={y}>
              <title>{nome}</title>
              {suplementares(y).map((ly) => (
                <line
                  key={ly}
                  x1={nx - 10}
                  y1={ly}
                  x2={nx + 10}
                  y2={ly}
                  stroke="#44403c"
                  strokeWidth="1.5"
                />
              ))}
              {note.accidental && (
                <text
                  x={nx - 20 - (acorde ? (idx % 2) * 9 : 0)}
                  y={y + 5}
                  fontFamily="serif"
                  fontSize="16"
                  fill="#1c1917"
                >
                  {SIMBOLO_DO_ACIDENTE[note.accidental]}
                </text>
              )}
              <ellipse
                cx={nx}
                cy={y}
                rx="6"
                ry="4.5"
                fill={vazada ? 'white' : '#1c1917'}
                stroke="#1c1917"
                strokeWidth={vazada ? 1.6 : 0}
                transform={`rotate(-20 ${nx} ${y})`}
              />
              {temHaste && !acorde && (
                <line x1={hx} y1={y} x2={hx} y2={hy2} stroke="#1c1917" strokeWidth="1.5" />
              )}
              {note.duration === 'eighth' && !acorde && (
                <path
                  d={
                    hasteParaBaixo
                      ? `M ${hx} ${hy2} q 10 -6 8 -16`
                      : `M ${hx} ${hy2} q 10 6 8 16`
                  }
                  stroke="#1c1917"
                  strokeWidth="1.5"
                  fill="none"
                />
              )}
            </g>
          );
        })}

        {/* Num acorde, uma haste só, da nota mais grave à mais aguda. */}
        {acorde && notes.length > 1 && notes[0].duration !== 'whole' && (
          <line
            x1={INICIO + 20 + 5.5}
            y1={Math.max(...alturas)}
            x2={INICIO + 20 + 5.5}
            y2={Math.min(...alturas) - 30}
            stroke="#1c1917"
            strokeWidth="1.5"
          />
        )}
      </svg>
    </div>
  );
};
