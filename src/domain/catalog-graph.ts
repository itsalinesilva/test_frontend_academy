import { EntityId, ISOTimestamp } from './types';
import { FieldProvenance } from './music-knowledge';
import { Pessoa, termosDeBuscaDaPessoa } from './catalog-person';
import { Obra, termosDeBuscaDaObra } from './catalog-work';
import { Gravacao, Partitura, termosDeBuscaDaPartitura } from './catalog-resource';
import { INSTRUMENTOS, Instrumento, PAPEIS, PapelMusical, RegistroVocal, VOZES } from './catalog-vocabulary';

/**
 * O GRAFO DO CATÁLOGO — e a porta única para entrar nele.
 *
 * O QUE ESTAVA ERRADO NA BUSCA
 * ----------------------------
 * A busca era uma coleção de filtros sobre obras: era, região, gênero,
 * tonalidade. Ela respondia a uma pergunta menor — *"quantos campos consigo
 * filtrar?"* — e não à que um catálogo musical precisa responder:
 *
 *   **"quais entidades existem, e por quais delas eu chego ao acervo?"**
 *
 * Quem digita `Mozart` não está filtrando obras: está procurando uma pessoa, e
 * quer, junto, as obras dela, as partituras e as gravações. Quem digita
 * `barítono` procura pessoas. Quem digita `violino` pode querer violinistas,
 * obras para violino, partituras para violino ou o curso de violino — e o
 * catálogo deve oferecer os quatro, separados por tipo.
 *
 * Quem digita `BWV 1041` quer **uma obra**, diretamente.
 *
 * O CONTRATO
 * ----------
 * Toda entidade do catálogo se reduz a `EntidadeIndexada`: identificador, tipo,
 * rótulo, uma linha de apoio e os termos por que pode ser encontrada. A busca
 * não sabe o que é uma pessoa nem o que é uma partitura — ela casa termos e
 * agrupa por tipo.
 *
 * É isso que permite acrescentar uma entidade nova sem tocar na busca: basta
 * que ela saiba se indexar.
 */

export type TipoDeEntidade =
  | 'PESSOA'
  | 'OBRA'
  | 'MOVIMENTO_DA_OBRA'
  | 'EDICAO'
  | 'PARTITURA'
  | 'GRAVACAO'
  | 'INSTRUMENTO'
  | 'VOZ'
  | 'PAPEL'
  | 'FORMA'
  | 'PERIODO'
  | 'REGIAO'
  | 'MOVIMENTO_ESTETICO'
  | 'EVENTO'
  | 'FONTE';

export interface EntidadeIndexada {
  id: EntityId;
  tipo: TipoDeEntidade;
  rotulo: string;
  /** O que distingue este registro de um homônimo: datas, autor, formato. */
  linhaDeApoio?: string;
  /**
   * Tudo por que a entidade pode ser encontrada.
   *
   * Inclui nome alternativo, grafia de fonte, número de catálogo e ano. O
   * catálogo devolvia vazio para quem digitava `Fryderyk Szopen` ou `BWV 1041`
   * porque só o rótulo canônico era pesquisável.
   */
  termos: string[];
  /**
   * Quanto esta entidade "pesa" quando duas casam igualmente.
   *
   * Uma pessoa com oitocentas obras aparece antes de uma com três. Não é
   * juízo de valor: é a probabilidade de ser quem a pessoa procurava.
   */
  relevancia?: number;
}

// ---------------------------------------------------------------------------
// Indexação de cada entidade
// ---------------------------------------------------------------------------

export function indexarPessoa(p: Pessoa, quantasObras = 0): EntidadeIndexada {
  const vida = [p.anoDeNascimento, p.anoDeMorte].filter(Boolean).join('–');
  return {
    id: p.id,
    tipo: 'PESSOA',
    rotulo: p.nomeCanonico,
    linhaDeApoio: vida || undefined,
    termos: termosDeBuscaDaPessoa(p),
    relevancia: quantasObras,
  };
}

export function indexarObra(o: Obra, nomeDoAutor?: string): EntidadeIndexada {
  return {
    id: o.id,
    tipo: 'OBRA',
    rotulo: o.tituloCanonico.pt ?? '',
    linhaDeApoio: [nomeDoAutor, o.numeroDeCatalogo].filter(Boolean).join(' · ') || undefined,
    termos: termosDeBuscaDaObra(o),
    /** Obra com partitura serve a mais gente que obra só catalogada. */
    relevancia: o.movimentos.length,
  };
}

export function indexarPartitura(p: Partitura): EntidadeIndexada {
  return {
    id: p.id,
    tipo: 'PARTITURA',
    rotulo: p.tituloNaFonte,
    linhaDeApoio: [p.autorNaFonte, p.formato].filter(Boolean).join(' · '),
    termos: termosDeBuscaDaPartitura(p),
  };
}

export function indexarGravacao(g: Gravacao): EntidadeIndexada {
  return {
    id: g.id,
    tipo: 'GRAVACAO',
    rotulo: g.titulo ?? '(sem título)',
    linhaDeApoio: g.ano ? String(g.ano) : undefined,
    termos: [g.titulo ?? '', ...g.interpretesNaoResolvidos].filter(Boolean),
  };
}

export function indexarInstrumento(i: Instrumento): EntidadeIndexada {
  return {
    id: i.id,
    tipo: 'INSTRUMENTO',
    rotulo: i.rotulo,
    linhaDeApoio: i.familia,
    termos: [i.rotulo, ...i.sinonimos],
  };
}

export function indexarVoz(v: RegistroVocal): EntidadeIndexada {
  return { id: v.id, tipo: 'VOZ', rotulo: v.rotulo, linhaDeApoio: v.extensao, termos: [v.rotulo, ...v.sinonimos] };
}

export function indexarPapel(p: PapelMusical): EntidadeIndexada {
  return { id: p.id, tipo: 'PAPEL', rotulo: p.rotulo, linhaDeApoio: p.natureza, termos: [p.rotulo] };
}

/**
 * Os vocabulários entram no índice como entidades.
 *
 * É o que faz `violino` devolver o instrumento **e** os violinistas **e** as
 * obras para violino. Deixá-los fora obrigaria quem procura a já saber em qual
 * filtro o termo mora — que é justamente o que ninguém sabe.
 */
export function indexarVocabularios(): EntidadeIndexada[] {
  return [
    ...INSTRUMENTOS.map(indexarInstrumento),
    ...VOZES.map(indexarVoz),
    ...PAPEIS.map(indexarPapel),
  ];
}

// ---------------------------------------------------------------------------
// A busca universal
// ---------------------------------------------------------------------------

const semAcento = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export interface ResultadoPorTipo {
  tipo: TipoDeEntidade;
  itens: EntidadeIndexada[];
  /** Quantos há no total, quando a lista vem cortada. */
  total: number;
}

/**
 * Casa o termo contra o índice e agrupa por tipo.
 *
 * O CASAMENTO É POR PREFIXO DE PALAVRA, e não por substring solta.
 * `bar` acha "barítono" e não acha "Barbara"... acha, e deve: é prefixo de
 * palavra nos dois. O que ele NÃO acha é "Lombardo", onde `bar` está no meio —
 * e é essa a diferença entre sugerir e devolver ruído.
 *
 * Casamento exato do termo inteiro vem primeiro: quem digita `BWV 1041` quer a
 * obra, e não as quarenta que citam Bach.
 */
export function buscar(
  indice: EntidadeIndexada[],
  termo: string,
  porTipo = 8
): ResultadoPorTipo[] {
  const alvo = semAcento(termo);
  if (alvo.length < 2) return [];

  const pontuados: Array<{ e: EntidadeIndexada; pontos: number }> = [];

  for (const e of indice) {
    let melhor = 0;
    for (const t of e.termos) {
      const norm = semAcento(t);
      if (!norm) continue;
      if (norm === alvo) melhor = Math.max(melhor, 3);
      else if (norm.startsWith(alvo)) melhor = Math.max(melhor, 2);
      else if (new RegExp(`\\b${alvo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(norm)) {
        melhor = Math.max(melhor, 1);
      }
    }
    if (melhor > 0) pontuados.push({ e, pontos: melhor });
  }

  const grupos = new Map<TipoDeEntidade, Array<{ e: EntidadeIndexada; pontos: number }>>();
  for (const p of pontuados) {
    const lista = grupos.get(p.e.tipo) ?? [];
    lista.push(p);
    grupos.set(p.e.tipo, lista);
  }

  return [...grupos.entries()]
    .map(([tipo, lista]) => {
      lista.sort(
        (a, b) => b.pontos - a.pontos || (b.e.relevancia ?? 0) - (a.e.relevancia ?? 0)
      );
      return { tipo, itens: lista.slice(0, porTipo).map((x) => x.e), total: lista.length };
    })
    .sort((a, b) => b.total - a.total);
}

// ---------------------------------------------------------------------------
// Relações entre pessoas
// ---------------------------------------------------------------------------

/**
 * A linhagem é dado de catálogo, e não enfeite.
 *
 * "Quem estudou com quem" é a pergunta que explica por que uma escola soa como
 * soa. Czerny estudou com Beethoven e ensinou Liszt; sem a relação, os três
 * são três fichas isoladas e a linha que os liga vive só na cabeça de quem já
 * sabe.
 */
export type TipoDeRelacaoEntrePessoas =
  | 'PROFESSOR_DE'
  | 'ALUNO_DE'
  | 'INFLUENCIOU'
  | 'COLABOROU_COM'
  | 'FAMILIA_DE';

export interface RelacaoEntrePessoas {
  dePessoaId: EntityId;
  paraPessoaId: EntityId;
  tipo: TipoDeRelacaoEntrePessoas;
  provenance: FieldProvenance[];
}

/**
 * A relação inversa, para o grafo não precisar guardar as duas pontas.
 *
 * Guardar `PROFESSOR_DE` e `ALUNO_DE` separadamente faria as duas divergirem na
 * primeira correção — alguém apaga uma e a outra fica, e a ficha passa a
 * afirmar uma linhagem que a outra nega.
 */
export function inversaDe(t: TipoDeRelacaoEntrePessoas): TipoDeRelacaoEntrePessoas {
  if (t === 'PROFESSOR_DE') return 'ALUNO_DE';
  if (t === 'ALUNO_DE') return 'PROFESSOR_DE';
  return t;
}

// ---------------------------------------------------------------------------
// Evento e execução
// ---------------------------------------------------------------------------

/**
 * O EVENTO — a estreia, o concerto, a encomenda.
 *
 * É a entidade que dá contexto à obra: *"estreada em Viena, 1808, no concerto
 * em que também estrearam a Quinta e a Sexta"* explica mais sobre a peça do que
 * qualquer campo de metadado.
 *
 * Nasce vazio no catálogo, e é registrado aqui porque um modelo que não tem
 * onde pôr o contexto acaba enfiando-o na biografia, onde ninguém o pesquisa.
 */
export interface Evento {
  id: EntityId;
  titulo: string;
  tipo: 'ESTREIA' | 'CONCERTO' | 'ENCOMENDA' | 'PUBLICACAO' | 'CONCURSO';
  data?: string;
  local?: string;
  obrasIds: EntityId[];
  pessoasIds: EntityId[];
  descricao?: string;
  provenance: FieldProvenance[];
}

/** Uma execução concreta de uma obra num evento, por pessoas determinadas. */
export interface Execucao {
  id: EntityId;
  obraId: EntityId;
  eventoId?: EntityId;
  interpretes: Array<{ pessoaId: EntityId; papelId: EntityId }>;
  gravacaoId?: EntityId;
  registradoEm: ISOTimestamp;
}
