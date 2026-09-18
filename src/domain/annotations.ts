import { EntityId, ISOTimestamp } from './types';

/**
 * Anotações do aluno sobre o material do curso.
 *
 * Marca-texto, marcador de página e comentário — em trecho ou na página
 * inteira. Tudo reunido no caderno do curso.
 *
 * A DECISÃO QUE SUSTENTA O RESTO: ÂNCORA POR TEXTO, NÃO POR POSIÇÃO
 * -----------------------------------------------------------------
 * Uma marcação guarda o TRECHO marcado, além do deslocamento. Guardar apenas
 * "do caractere 1420 ao 1476" parece mais simples e quebra na primeira vez
 * que alguém corrige uma vírgula na lição: todas as marcações posteriores
 * escorregam, e o aluno abre o caderno e encontra grifos no meio de palavras.
 *
 * Com o texto guardado, a marcação é reancorada procurando o trecho — e,
 * quando ele deixa de existir porque a lição mudou de verdade, a anotação é
 * mostrada como ÓRFÃ, com o texto original preservado. O aluno perde a
 * posição, nunca o conteúdo do que escreveu.
 */

export type TipoAnotacao =
  /** Grifo sobre um trecho. */
  | 'MARCA_TEXTO'
  /** Marcador de página, para voltar depois. */
  | 'MARCADOR'
  /** Comentário do aluno, em trecho ou na página. */
  | 'COMENTARIO';

export type CorDeMarcacao = 'amarelo' | 'verde' | 'azul' | 'rosa';

export const CORES_DE_MARCACAO: Record<CorDeMarcacao, { hex: string; label: string }> = {
  amarelo: { hex: '#fde68a', label: 'Amarelo' },
  verde: { hex: '#bbf7d0', label: 'Verde' },
  azul: { hex: '#cad6e8', label: 'Azul' },
  rosa: { hex: '#fbcfe8', label: 'Rosa' },
};

/**
 * Onde a anotação se prende.
 *
 * `inicio` e `fim` são dicas de busca, não a verdade. A verdade é `texto`.
 */
export interface AncoraDeTrecho {
  /** O trecho marcado, como estava quando foi marcado. */
  texto: string;
  /** Deslocamento em caracteres, usado como ponto de partida da busca. */
  inicio: number;
  fim: number;
  /** Algumas palavras antes e depois, para desempatar trechos repetidos. */
  contextoAntes: string;
  contextoDepois: string;
}

export interface Anotacao {
  id: EntityId;
  userId: EntityId;
  cursoId: EntityId;
  /** Lição ou página do curso. */
  lessonId: EntityId;
  /** Bloco dentro da lição, quando a lição é composta por blocos. */
  blocoId?: string;
  tipo: TipoAnotacao;
  /** Ausente em marcador de página e em comentário de página inteira. */
  ancora?: AncoraDeTrecho;
  cor?: CorDeMarcacao;
  /** Texto escrito pelo aluno. Obrigatório em comentário. */
  comentario?: string;
  criadaEm: ISOTimestamp;
  updatedAtIso: ISOTimestamp;
}

// ---------------------------------------------------------------------------
// Reancoragem
// ---------------------------------------------------------------------------

export type SituacaoDaAncora =
  /** Encontrada exatamente onde estava. */
  | 'firme'
  /** Encontrada em outra posição — o texto acima mudou de tamanho. */
  | 'deslocada'
  /** O trecho não existe mais no conteúdo. */
  | 'orfa';

export interface AncoraResolvida {
  situacao: SituacaoDaAncora;
  inicio: number;
  fim: number;
}

/**
 * Reencontra o trecho de uma anotação no conteúdo atual.
 *
 * Procura em três passos, do mais confiável ao menos: na posição registrada;
 * pelo texto com o contexto em volta; pelo texto sozinho, escolhendo a
 * ocorrência mais próxima de onde estava.
 *
 * O último passo é o que evita o erro chato: quando o trecho marcado é uma
 * palavra comum que aparece dez vezes na lição, a proximidade decide — e
 * quase sempre acerta, porque o conteúdo raramente muda tanto assim.
 */
export function resolverAncora(ancora: AncoraDeTrecho, conteudo: string): AncoraResolvida {
  const { texto, inicio, contextoAntes, contextoDepois } = ancora;

  if (texto.length === 0) {
    return { situacao: 'orfa', inicio: 0, fim: 0 };
  }

  // 1. Continua exatamente onde estava.
  if (conteudo.slice(inicio, inicio + texto.length) === texto) {
    return { situacao: 'firme', inicio, fim: inicio + texto.length };
  }

  // 2. Com o contexto em volta — desempata trechos repetidos.
  if (contextoAntes || contextoDepois) {
    const alvo = contextoAntes + texto + contextoDepois;
    const achado = conteudo.indexOf(alvo);
    if (achado >= 0) {
      const comeco = achado + contextoAntes.length;
      return { situacao: 'deslocada', inicio: comeco, fim: comeco + texto.length };
    }
  }

  // 3. Só o texto, na ocorrência mais próxima de onde estava.
  const ocorrencias: number[] = [];
  let de = conteudo.indexOf(texto);
  while (de >= 0) {
    ocorrencias.push(de);
    de = conteudo.indexOf(texto, de + 1);
  }
  if (ocorrencias.length === 0) {
    return { situacao: 'orfa', inicio: 0, fim: 0 };
  }

  const maisProxima = ocorrencias.reduce((a, b) =>
    Math.abs(b - inicio) < Math.abs(a - inicio) ? b : a
  );
  return {
    situacao: maisProxima === inicio ? 'firme' : 'deslocada',
    inicio: maisProxima,
    fim: maisProxima + texto.length,
  };
}

/** Cria a âncora de uma seleção, guardando o contexto em volta. */
export function criarAncora(
  conteudo: string,
  inicio: number,
  fim: number,
  tamanhoDoContexto = 24
): AncoraDeTrecho {
  return {
    texto: conteudo.slice(inicio, fim),
    inicio,
    fim,
    contextoAntes: conteudo.slice(Math.max(0, inicio - tamanhoDoContexto), inicio),
    contextoDepois: conteudo.slice(fim, fim + tamanhoDoContexto),
  };
}

// ---------------------------------------------------------------------------
// Segmentação para renderização
// ---------------------------------------------------------------------------

export interface SegmentoDeTexto {
  texto: string;
  /** Anotações que cobrem este segmento. */
  anotacoes: Anotacao[];
}

/**
 * Corta o conteúdo em segmentos conforme as marcações.
 *
 * Marcações podem se sobrepor — o aluno grifa uma frase e depois comenta três
 * palavras dela. Por isso cada segmento carrega uma LISTA de anotações, e não
 * uma só: renderizar sobreposição como se fosse exclusiva faria a marcação de
 * cima apagar a de baixo.
 */
export function segmentar(conteudo: string, anotacoes: Anotacao[]): SegmentoDeTexto[] {
  const comTrecho = anotacoes.filter((a) => a.ancora);
  if (comTrecho.length === 0) return [{ texto: conteudo, anotacoes: [] }];

  const resolvidas = comTrecho
    .map((a) => ({ anotacao: a, faixa: resolverAncora(a.ancora!, conteudo) }))
    .filter((r) => r.faixa.situacao !== 'orfa');

  if (resolvidas.length === 0) return [{ texto: conteudo, anotacoes: [] }];

  // Cada fronteira de marcação vira um ponto de corte.
  const cortes = new Set<number>([0, conteudo.length]);
  for (const r of resolvidas) {
    cortes.add(r.faixa.inicio);
    cortes.add(r.faixa.fim);
  }

  const points = [...cortes].filter((p) => p >= 0 && p <= conteudo.length).sort((a, b) => a - b);
  const segmentos: SegmentoDeTexto[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const de = points[i];
    const ate = points[i + 1];
    if (ate <= de) continue;
    segmentos.push({
      texto: conteudo.slice(de, ate),
      anotacoes: resolvidas
        .filter((r) => r.faixa.inicio <= de && r.faixa.fim >= ate)
        .map((r) => r.anotacao),
    });
  }

  return segmentos;
}

// ---------------------------------------------------------------------------
// Caderno
// ---------------------------------------------------------------------------

export interface EntradaDoCaderno {
  anotacao: Anotacao;
  /** `true` quando o trecho não existe mais no conteúdo atual. */
  orfa: boolean;
}

/**
 * Ordena as anotações de um curso para leitura no caderno.
 *
 * Por lição, e dentro da lição pela posição no texto — que é a ordem em que o
 * aluno as criou lendo. Ordenar por data poria o que ele grifou por último no
 * topo, quebrando a sequência do raciocínio que ele estava construindo.
 */
export function montarCaderno(
  anotacoes: Anotacao[],
  conteudoPorLicao: Record<string, string>
): EntradaDoCaderno[] {
  return anotacoes
    .map((anotacao) => {
      const conteudo = conteudoPorLicao[anotacao.lessonId] ?? '';
      const faixa = anotacao.ancora ? resolverAncora(anotacao.ancora, conteudo) : null;
      return {
        anotacao,
        orfa: faixa?.situacao === 'orfa',
        posicao: faixa && faixa.situacao !== 'orfa' ? faixa.inicio : Number.MAX_SAFE_INTEGER,
      };
    })
    .sort(
      (a, b) =>
        a.anotacao.lessonId.localeCompare(b.anotacao.lessonId) ||
        a.posicao - b.posicao ||
        a.anotacao.criadaEm.localeCompare(b.anotacao.criadaEm)
    )
    .map(({ anotacao, orfa }) => ({ anotacao, orfa }));
}

export interface ResumoDoCaderno {
  marcacoes: number;
  comentarios: number;
  marcadores: number;
  orfas: number;
  licoesComAnotacao: number;
}

export function resumirCaderno(entradas: EntradaDoCaderno[]): ResumoDoCaderno {
  return {
    marcacoes: entradas.filter((e) => e.anotacao.tipo === 'MARCA_TEXTO').length,
    comentarios: entradas.filter((e) => e.anotacao.tipo === 'COMENTARIO').length,
    marcadores: entradas.filter((e) => e.anotacao.tipo === 'MARCADOR').length,
    orfas: entradas.filter((e) => e.orfa).length,
    licoesComAnotacao: new Set(entradas.map((e) => e.anotacao.lessonId)).size,
  };
}
