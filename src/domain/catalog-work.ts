import { EntityId } from './types';
import {
  ExternalIds,
  FieldProvenance,
  LocalizedText,
  PublicDomainAssessment,
  ResolutionMetadata,
} from './music-knowledge';
import { FormacaoVocal, Tessitura, TexturaVocal } from './catalog-vocabulary';

/**
 * OBRA — a peça musical, e não o arquivo que a representa.
 *
 * A DISTINÇÃO QUE SUSTENTA O CATÁLOGO INTEIRO
 * -------------------------------------------
 * A Sonata K. 545 é **uma** obra. Dela existem dezenas de edições, centenas de
 * gravações e quantos arquivos de partitura alguém tenha produzido. Tudo isso
 * são recursos **ligados** à obra; nada disso é outra obra.
 *
 * O catálogo perdeu essa distinção e pagou caro: as mil trezentas e trinta e
 * uma partituras cujo título não casava com nenhuma obra conhecida **viraram
 * obras**. Não porque alguém decidiu isso, mas porque `Score` não existia como
 * entidade — a única forma de uma partitura entrar no acervo era sendo uma obra.
 *
 * A ausência da entidade força a duplicata. É por isso que a ontologia vem
 * antes da ingestão, e não depois.
 *
 * QUEM FEZ A OBRA NÃO É UM CAMPO
 * ------------------------------
 * `composerIds: EntityId[]` respondia "quem compôs" e mais nada. Uma ópera tem
 * compositor **e** libretista; um arranjo tem o autor do original **e** o
 * arranjador; uma orquestração tem os três. Achatar isso numa lista de
 * compositores atribui ao compositor o trabalho de outra pessoa.
 *
 * `Contribuicao` liga pessoa, papel e obra. É a mesma forma de `AtuacaoMusical`
 * na pessoa, e de propósito: papel é sempre uma ligação, nunca um rótulo.
 */

export interface Contribuicao {
  pessoaId: EntityId;
  /** Papel do vocabulário: `papel_compositor`, `papel_libretista`. */
  papelId: EntityId;
  /**
   * Quando a contribuição é sobre outra obra.
   *
   * Um arranjo de Bach por Busoni é uma obra com contribuição de Busoni como
   * arranjador **e** uma relação `ARRANJO_DE` apontando para a obra de Bach.
   * Sem o segundo, o arranjo some da ficha de Bach.
   */
  observacao?: string;
  provenance: FieldProvenance[];
}

/**
 * MOVIMENTO — parte de uma obra, com identidade própria.
 *
 * Era `movements: string[]`. Uma lista de cadeias não tem número, tonalidade,
 * andamento nem duração — e um movimento tem as quatro coisas. Pior: não tem
 * identificador, então uma partitura não pode apontar para o *Adagio* de uma
 * sonata, só para a sonata inteira.
 *
 * Quem estuda toca o segundo movimento. O catálogo precisa saber qual é.
 */
export interface Movimento {
  id: EntityId;
  obraId: EntityId;
  /** Ordem dentro da obra, começando em 1. */
  numero: number;
  titulo?: LocalizedText;
  /** A indicação de andamento como a partitura a escreve: "Allegro con brio". */
  andamento?: string;
  tonalidade?: string;
  compasso?: string;
  /** Duração aproximada em segundos, quando alguma edição a declara. */
  duracaoSegundos?: number;
}

/**
 * A PARTE VOCAL de uma obra — quatro eixos que se cruzam.
 *
 * Uma peça SATB precisa aparecer em quatro recortes ao mesmo tempo: tem quatro
 * **tessituras**, tem **formação** de coro, cada voz tem um **papel** dentro da
 * peça, e o conjunto tem uma **textura**. Guardar só "coral" perderia três.
 */
export interface ParteVocal {
  voz: Tessitura;
  /** Voz principal, secundária, coro de apoio, ou solo dentro do coro. */
  funcao: 'PRINCIPAL' | 'SECUNDARIA' | 'CORO' | 'SOLO_NO_CORO';
}

export interface Obra {
  id: EntityId;
  tituloCanonico: LocalizedText;
  /**
   * Os outros títulos, e eles são pesquisáveis.
   *
   * A mesma obra é `Das wohltemperierte Klavier` e `O cravo bem temperado`, e
   * quem procura em português não deve receber vazio. Foi a falta disto que
   * fez o casamento por título render dezoito de seiscentas e trinta e oito.
   */
  titulosAlternativos: string[];

  /** Quem a fez existir, por papel. Substitui `composerIds`. */
  contribuicoes: Contribuicao[];

  /** `BWV 846`, `K. 545`. É o que prova que duas fontes falam da mesma obra. */
  numeroDeCatalogo?: string;
  numeroDeOpus?: string;
  /** Ano ou intervalo, como a fonte declara: "1722", "1717-1723". */
  dataDeComposicao?: string;

  periodId?: EntityId;
  regionId?: EntityId;
  /** Forma: sonata, fuga, minueto. Responde "como a obra se organiza". */
  formaId?: EntityId;
  /** Movimento estético — outra coisa, e o nome coincide por acidente. */
  movimentosEsteticos: EntityId[];

  tonalidade?: string;
  compasso?: string;

  /** Instrumentos do vocabulário. Nunca a grafia da fonte. */
  instrumentacao: EntityId[];
  partesVocais: ParteVocal[];
  formacaoVocal?: FormacaoVocal;
  texturaVocal?: TexturaVocal;

  /** As partes da obra, quando o catálogo as conhece. */
  movimentos: Movimento[];

  /** Duração aproximada da obra inteira, em segundos. */
  duracaoSegundos?: number;
  /** Idioma do texto cantado, quando há texto. */
  idioma?: string;

  externalIds: ExternalIds;
  provenance: FieldProvenance[];
  publicDomain: PublicDomainAssessment;
  resolution: ResolutionMetadata;
}

// ---------------------------------------------------------------------------
// Relações entre obras
// ---------------------------------------------------------------------------

/**
 * Uma obra derivada de outra continua sendo duas obras.
 *
 * A transcrição de Busoni da Chaconne de Bach é obra de Busoni: tem
 * instrumentação própria, edição própria e dificuldade própria. Fundi-la com o
 * original atribuiria a Bach uma peça para piano que ele não escreveu;
 * separá-la sem relação a esconderia de quem estuda Bach.
 */
export type TipoDeRelacaoEntreObras =
  | 'ARRANJO_DE'
  | 'TRANSCRICAO_DE'
  | 'ORQUESTRACAO_DE'
  | 'BASEADA_EM'
  | 'PARTE_DE'
  | 'VERSAO_DE';

export interface RelacaoEntreObras {
  deObraId: EntityId;
  paraObraId: EntityId;
  tipo: TipoDeRelacaoEntreObras;
  provenance: FieldProvenance[];
}

// ---------------------------------------------------------------------------
// Perguntas que a ficha responde
// ---------------------------------------------------------------------------

/** Quem contribuiu neste papel — compositores, libretistas, arranjadores. */
export function pessoasNoPapel(o: Obra, papelId: EntityId): EntityId[] {
  return o.contribuicoes.filter((c) => c.papelId === papelId).map((c) => c.pessoaId);
}

/** Toda pessoa ligada à obra, em qualquer papel. */
export function pessoasDaObra(o: Obra): EntityId[] {
  return [...new Set(o.contribuicoes.map((c) => c.pessoaId))];
}

/**
 * As tessituras que a obra pede.
 *
 * É o recorte que responde "o que há para barítono" — pergunta de cantor, que
 * o catálogo não sabia responder porque voz não existia como eixo.
 */
export function tessiturasDaObra(o: Obra): Tessitura[] {
  return [...new Set(o.partesVocais.map((p) => p.voz))];
}

/**
 * Tudo por que esta obra pode ser encontrada.
 *
 * O número de catálogo entra: quem digita `BWV 1041` quer a obra, e não uma
 * lista de coisas que mencionam Bach.
 */
export function termosDeBuscaDaObra(o: Obra): string[] {
  return [
    ...Object.values(o.tituloCanonico).filter((v): v is string => !!v),
    ...o.titulosAlternativos,
    ...(o.numeroDeCatalogo ? [o.numeroDeCatalogo] : []),
    ...(o.numeroDeOpus ? [o.numeroDeOpus] : []),
    ...(o.dataDeComposicao ? [o.dataDeComposicao] : []),
    ...o.movimentos.flatMap((m) => Object.values(m.titulo ?? {}).filter((v): v is string => !!v)),
  ];
}
