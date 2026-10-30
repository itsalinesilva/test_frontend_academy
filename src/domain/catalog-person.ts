import { EntityId } from './types';
import {
  ExternalIds,
  FieldProvenance,
  LocalizedText,
  PublicDomainAssessment,
  ResolutionMetadata,
} from './music-knowledge';
import { PAPEL_POR_ID, Tessitura } from './catalog-vocabulary';

/**
 * PESSOA — e não "compositor".
 *
 * O TIPO QUE DECIDIA QUEM PODE EXISTIR
 * ------------------------------------
 * O catálogo tinha `CanonicalComposer`. O nome parece descrição e é regra: a
 * única forma de entrar no acervo era tendo composto. Um violinista que nunca
 * escreveu uma nota não tinha onde existir; um barítono virava "um compositor
 * que tem uma voz"; e o instrumento que a pessoa tocava foi parar dentro do
 * registro de compositor, como se tocar fosse um detalhe de quem compõe.
 *
 * Bach é compositor, organista e cravista. Liszt é compositor, pianista e
 * professor. Clara Schumann é pianista e compositora, e a ordem importa para a
 * biografia dela. Nenhum dos três cabe num tipo que já decidiu o que a pessoa é.
 *
 * O PAPEL É UMA LIGAÇÃO, E NÃO UM RÓTULO
 * --------------------------------------
 * `AtuacaoMusical` liga pessoa a papel, e carrega o que aquele papel exige:
 * instrumento para quem toca, tessitura para quem canta. É por isso que ela é
 * um objeto, e não uma lista de cadeias.
 *
 * Isso permite as duas perguntas que o acervo não sabia responder:
 *
 *   "quem tocava violino"           → atuação com papel instrumentista e
 *                                     instrumento `inst_violino`
 *   "quais barítonos há no acervo"  → atuação com papel cantor e voz BARITONO
 *
 * A segunda era impossível: não havia onde guardar tessitura de uma pessoa.
 */

export interface AtuacaoMusical {
  /** Papel do vocabulário — `papel_compositor`, `papel_instrumentista`. */
  papelId: EntityId;
  /** Exigido quando o papel é de instrumentista. */
  instrumentoId?: EntityId;
  /** Exigida quando o papel é de cantor. */
  voz?: Tessitura;
  /**
   * Quanto desta atuação o acervo de fato conhece.
   *
   * A fonte declara que alguém é pianista; ela não declara se a pessoa é
   * conhecida por isso ou se tocava em casa. `PRINCIPAL` é curadoria, e nasce
   * vazio — deduzi-lo do volume de obras seria palpite com cara de catalogação.
   */
  destaque?: 'PRINCIPAL' | 'SECUNDARIA';
  provenance: FieldProvenance[];
}

/** Como a pessoa é chamada em outras línguas, edições e catálogos. */
export interface NomeAlternativo {
  nome: string;
  /** `NASCIMENTO`, `ARTISTICO`, `LATINIZADO`, `TRANSLITERADO`, `GRAFIA_DE_FONTE`. */
  tipo: string;
  idioma?: string;
}

export interface Pessoa {
  id: EntityId;
  /** O nome pelo qual o catálogo a chama. */
  nomeCanonico: string;
  /** "Bach, Johann Sebastian" — para ordenar sem depender do primeiro nome. */
  nomeParaOrdenar: string;
  /**
   * Os outros nomes, e eles são **pesquisáveis**.
   *
   * Quem procura "Chopin" e quem procura "Fryderyk Szopen" procuram a mesma
   * pessoa. Guardar só o canônico faz o catálogo devolver vazio para quem
   * escreveu o nome na língua de origem.
   */
  nomesAlternativos: NomeAlternativo[];

  anoDeNascimento?: number;
  anoDeMorte?: number;
  localDeNascimento?: string;
  localDeMorte?: string;
  /** Onde produziu — pode ser diferente de onde nasceu, e em geral é. */
  locaisDeAtuacao: string[];

  biografia?: LocalizedText;
  retratoUrl?: string;

  /** O que a pessoa fez na música. Uma pessoa, vários papéis. */
  atuacoes: AtuacaoMusical[];

  /** Eras do Atlas em que produziu. */
  periodIds: EntityId[];
  subPeriodo?: string;
  regionIds: EntityId[];
  /** Movimentos estéticos a que se filia. Eixo SELETIVO: a maioria não tem. */
  movimentos: EntityId[];

  externalIds: ExternalIds;
  provenance: FieldProvenance[];
  publicDomain: PublicDomainAssessment;
  resolution: ResolutionMetadata;
}

// ---------------------------------------------------------------------------
// Perguntas que a ficha responde
// ---------------------------------------------------------------------------

/** A pessoa exerceu este papel? */
export function temPapel(p: Pessoa, papelId: EntityId): boolean {
  return p.atuacoes.some((a) => a.papelId === papelId);
}

/** Ela compôs, arranjou ou escreveu texto — alguma autoria. */
export function ehAutora(p: Pessoa): boolean {
  return p.atuacoes.some((a) => PAPEL_POR_ID.get(a.papelId)?.natureza === 'AUTORIA');
}

/** Os instrumentos que a pessoa toca, sem repetir. */
export function instrumentosDe(p: Pessoa): EntityId[] {
  return [...new Set(p.atuacoes.map((a) => a.instrumentoId).filter((i): i is EntityId => !!i))];
}

/** As tessituras da pessoa. Mais de uma acontece, e a ficha precisa comportar. */
export function vozesDe(p: Pessoa): Tessitura[] {
  return [...new Set(p.atuacoes.map((a) => a.voz).filter((v): v is Tessitura => !!v))];
}

/**
 * A atuação está completa, ou falta o que o papel exige?
 *
 * Um registro de cantor sem tessitura e um de instrumentista sem instrumento
 * são fichas pela metade — e a metade que falta é justamente a que o aluno
 * usa para procurar. Devolve o que falta, para a ficha poder dizer.
 */
export function atuacaoIncompleta(a: AtuacaoMusical): 'INSTRUMENTO' | 'VOZ' | null {
  const papel = PAPEL_POR_ID.get(a.papelId);
  if (!papel?.exige) return null;
  if (papel.exige === 'INSTRUMENTO' && !a.instrumentoId) return 'INSTRUMENTO';
  if (papel.exige === 'VOZ' && !a.voz) return 'VOZ';
  return null;
}

/**
 * Tudo por que esta pessoa pode ser encontrada.
 *
 * A busca universal não sabe o que é uma pessoa — ela recebe termos. Montá-los
 * aqui mantém a regra ao lado do tipo: acrescentar um campo pesquisável é
 * acrescentar uma linha, e não caçar o índice em outro arquivo.
 */
export function termosDeBuscaDaPessoa(p: Pessoa): string[] {
  return [
    p.nomeCanonico,
    p.nomeParaOrdenar,
    ...p.nomesAlternativos.map((n) => n.nome),
    ...(p.localDeNascimento ? [p.localDeNascimento] : []),
    ...p.locaisDeAtuacao,
    ...(p.anoDeNascimento ? [String(p.anoDeNascimento)] : []),
  ];
}
