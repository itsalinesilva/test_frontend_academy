import { PartituraExecutavel } from '../domain/score-follow';

/**
 * Peças de estudo para o simulador de violino.
 *
 * TODAS SÃO AUTORAIS OU DE DOMÍNIO PÚBLICO INCONTESTE.
 *
 * As três primeiras são exercícios escritos aqui — escalas e arpejos em
 * primeira posição, que são material didático elementar e não obra de
 * ninguém. A quarta é uma melodia tradicional europeia de domínio público
 * havia séculos.
 *
 * Nenhuma peça de método protegido entra aqui. Quando os métodos do acervo
 * forem trabalhados, o que a plataforma reproduz é o EXERCÍCIO TÉCNICO —
 * escala, arpejo, padrão de arco — e não a edição de ninguém.
 *
 * Todas cabem em primeira posição: `notaCabeEmPrimeiraPosicao` é verificada
 * em teste para cada nota de cada peça.
 */

/** Gera uma sequência de notas com durações iguais. */
function sequencia(
  notas: (string | null)[],
  duracaoBatidas: number,
  prefixo: string
): PartituraExecutavel['notas'] {
  return notas.map((nota, i) => ({
    id: `${prefixo}_${i}`,
    nota,
    inicioBatida: i * duracaoBatidas,
    duracaoBatidas,
  }));
}

export const PARTITURAS_VIOLINO: PartituraExecutavel[] = [
  {
    id: 'vln_cordas_soltas',
    titulo: 'As quatro cordas soltas',
    bpmOriginal: 60,
    compasso: [4, 4],
    tonalidade: 'Sem armadura',
    // Sem dedo algum: a primeira dificuldade real do violino é o ARCO, e
    // ela merece ser isolada antes de somar a mão esquerda.
    notas: sequencia(
      ['G3', 'G3', 'D4', 'D4', 'A4', 'A4', 'E5', 'E5', 'A4', 'A4', 'D4', 'D4', 'G3', null, 'G3', null],
      1,
      'cs'
    ),
  },
  {
    id: 'vln_escala_re_maior',
    titulo: 'Escala de Ré maior — uma oitava',
    bpmOriginal: 66,
    compasso: [4, 4],
    tonalidade: 'Ré maior',
    // A primeira escala de todo método de violino: começa na corda Ré solta
    // e usa só dedos naturais, sem 2º baixo.
    notas: sequencia(
      ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5',
       'D5', 'C#5', 'B4', 'A4', 'G4', 'F#4', 'E4', 'D4'],
      1,
      'drm'
    ),
  },
  {
    id: 'vln_arpejo_sol',
    titulo: 'Arpejo de Sol maior',
    bpmOriginal: 72,
    compasso: [3, 4],
    tonalidade: 'Sol maior',
    notas: sequencia(
      ['G3', 'B3', 'D4', 'G4', 'D4', 'B3', 'G3', null, 'G3', 'B3', 'D4', 'G4'],
      1,
      'arp'
    ),
  },
  {
    id: 'vln_melodia_tradicional',
    titulo: 'Melodia tradicional em Lá',
    bpmOriginal: 84,
    compasso: [4, 4],
    tonalidade: 'Lá maior',
    // Melodia europeia tradicional, de domínio público. A primeira peça em
    // que há frase musical — e não apenas mecânica.
    notas: [
      { id: 'md_0', nota: 'A4', inicioBatida: 0, duracaoBatidas: 1 },
      { id: 'md_1', nota: 'A4', inicioBatida: 1, duracaoBatidas: 1 },
      { id: 'md_2', nota: 'E5', inicioBatida: 2, duracaoBatidas: 1 },
      { id: 'md_3', nota: 'E5', inicioBatida: 3, duracaoBatidas: 1 },
      { id: 'md_4', nota: 'F#5', inicioBatida: 4, duracaoBatidas: 1 },
      { id: 'md_5', nota: 'F#5', inicioBatida: 5, duracaoBatidas: 1 },
      { id: 'md_6', nota: 'E5', inicioBatida: 6, duracaoBatidas: 2 },
      { id: 'md_7', nota: 'D5', inicioBatida: 8, duracaoBatidas: 1 },
      { id: 'md_8', nota: 'D5', inicioBatida: 9, duracaoBatidas: 1 },
      { id: 'md_9', nota: 'C#5', inicioBatida: 10, duracaoBatidas: 1 },
      { id: 'md_10', nota: 'C#5', inicioBatida: 11, duracaoBatidas: 1 },
      { id: 'md_11', nota: 'B4', inicioBatida: 12, duracaoBatidas: 1 },
      { id: 'md_12', nota: 'B4', inicioBatida: 13, duracaoBatidas: 1 },
      { id: 'md_13', nota: 'A4', inicioBatida: 14, duracaoBatidas: 2 },
    ],
  },
];

export function buscarPartitura(id: string): PartituraExecutavel | null {
  return PARTITURAS_VIOLINO.find((p) => p.id === id) ?? null;
}
