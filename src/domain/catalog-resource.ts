import { EntityId, ISOTimestamp } from './types';
import { FieldProvenance, KnowledgeSource, LocalizedText } from './music-knowledge';

/**
 * OS RECURSOS DA OBRA — edição, partitura, gravação.
 *
 * A HIERARQUIA, E POR QUE ELA TEM TRÊS NÍVEIS E NÃO UM
 * ----------------------------------------------------
 *
 *   OBRA      a peça musical. A Sonata K. 545 é uma só.
 *     │
 *     ├── EDIÇÃO     uma realização editorial dela: quem revisou, quando,
 *     │              com que critério. A Henle e a Peters da mesma sonata são
 *     │              duas edições, com direito autoral próprio e dedilhado
 *     │              diferente.
 *     │     │
 *     │     └── PARTITURA   um arquivo daquela edição: o PDF, o MusicXML, o
 *     │                     LilyPond, o MIDI. São representações do MESMO
 *     │                     texto musical, e não quatro partituras.
 *     │
 *     └── GRAVAÇÃO   uma execução registrada.
 *
 * Colapsar os níveis parece economia e não é. Sem EDIÇÃO, a licença do arquivo
 * fica pendurada na obra — e obra em domínio público com edição sob Creative
 * Commons passa a parecer livre. Sem PARTITURA como entidade, os quatro
 * formatos do mesmo texto viram quatro registros que ninguém sabe que são o
 * mesmo.
 *
 * 🔴 O QUE ACONTECEU POR FALTAR ESTA CAMADA
 * -----------------------------------------
 * Mil trezentas e trinta e uma partituras cujo título não casava com nenhuma
 * obra conhecida **viraram obras**. Não houve decisão: `Score` não existia como
 * entidade, e a única forma de uma partitura entrar no acervo era sendo uma
 * obra. A ausência da entidade força a duplicata.
 *
 * É por isso que `Partitura` pode existir com `obraId` vazio, em fila de
 * resolução. Um recurso sem obra conhecida é um recurso pendente — nunca uma
 * obra nova.
 */

// ---------------------------------------------------------------------------
// Fonte
// ---------------------------------------------------------------------------

/**
 * A FONTE como entidade, e não como cadeia de texto.
 *
 * `source: 'MUTOPIA'` dizia de onde veio e nada mais. Uma fonte tem política de
 * uso, exigência de atribuição, `robots.txt` e ritmo aceitável de requisição —
 * e essas coisas decidem o que a plataforma pode fazer com o que baixou.
 *
 * Guardá-las aqui faz a regra viajar junto do dado: quem for usar um recurso
 * encontra, no mesmo lugar, o que a fonte exige em troca.
 */
export interface FonteDoCatalogo {
  id: KnowledgeSource;
  rotulo: string;
  url: string;
  /** O que ela dá: identidade, metadado, partitura, gravação. */
  fornece: Array<'IDENTIDADE' | 'METADADO' | 'PARTITURA' | 'GRAVACAO' | 'IMAGEM'>;
  /** A licença exige creditar quem produziu? Vale por item, e não pela fonte. */
  exigeAtribuicaoPorItem: boolean;
  /**
   * Os diretórios que o `robots.txt` proíbe.
   *
   * Obra livre não autoriza rastrear o servidor de ninguém. IMSLP e Música
   * Brasilis proíbem justamente os diretórios onde os arquivos ficam — delas o
   * catálogo aceita **ficha**, e não arquivo.
   */
  restricoesDeacesso?: string;
}

// ---------------------------------------------------------------------------
// Edição
// ---------------------------------------------------------------------------

export interface Edicao {
  id: EntityId;
  obraId: EntityId;
  titulo?: LocalizedText;
  /** Quem revisou, dedilhou, realizou o baixo contínuo. Pessoas do catálogo. */
  responsaveis: Array<{ pessoaId: EntityId; papelId: EntityId }>;
  /** Nome do editor quando a pessoa não está no catálogo. Some quando estiver. */
  responsaveisNaoResolvidos: string[];
  editora?: string;
  ano?: number;
  /**
   * A licença é DA EDIÇÃO, e é distinta do domínio público da OBRA.
   *
   * Uma sonata de 1788 está em domínio público; a edição de 2019 dela não está.
   * Guardar a licença na obra fazia o catálogo afirmar que o arquivo era livre
   * porque a música era antiga.
   */
  licenca?: string;
  /** Anotação de quem cataloga: urtext, revisada, facsímile. */
  natureza?: 'URTEXT' | 'REVISADA' | 'FACSIMILE' | 'TRANSCRICAO' | 'MANUSCRITO';
  fonteId?: KnowledgeSource;
  provenance: FieldProvenance[];
}

// ---------------------------------------------------------------------------
// Partitura
// ---------------------------------------------------------------------------

/**
 * O formato do arquivo, e o que cada um permite fazer.
 *
 * A diferença que importa não é a extensão: é se o conteúdo é **simbólico** —
 * notas que o sistema entende — ou **imagem**, que só se olha.
 *
 * `MUSICXML`, `HUMDRUM`, `LILYPOND` e `MIDI` são simbólicos: deles se extrai
 * altura, duração e compasso, e por isso podem alimentar prática, transposição
 * e reprodução. `PDF` e `IMAGEM` não: são páginas.
 */
export type FormatoDePartitura =
  | 'MUSICXML'
  | 'HUMDRUM'
  | 'LILYPOND'
  | 'MIDI'
  | 'PDF'
  | 'IMAGEM';

export const FORMATOS_SIMBOLICOS: FormatoDePartitura[] = [
  'MUSICXML',
  'HUMDRUM',
  'LILYPOND',
  'MIDI',
];

export function ehSimbolico(f: FormatoDePartitura): boolean {
  return FORMATOS_SIMBOLICOS.includes(f);
}

/**
 * O que a plataforma consegue fazer com este arquivo HOJE.
 *
 * Distinto do formato de propósito. Um `.ly` é simbólico e a plataforma não tem
 * leitor de LilyPond — logo ele é simbólico e **não** renderizável. Misturar as
 * duas coisas produziria um botão de tocar que abre nada, que é o defeito que
 * este projeto passou meses removendo.
 */
export type CapacidadeDaPartitura =
  /** A plataforma renderiza a pauta e toca. */
  | 'RENDERIZAVEL'
  /** O arquivo existe e a plataforma só sabe apontar para ele. */
  | 'SOMENTE_REFERENCIA';

export interface Partitura {
  id: EntityId;
  /**
   * A obra a que esta partitura pertence.
   *
   * **Vazio é um estado legítimo**, e é o que impede a duplicata: uma partitura
   * cuja obra ainda não foi resolvida fica pendente, e não vira obra nova.
   */
  obraId?: EntityId;
  /** Vazio quando a edição não foi identificada — comum em acervo aberto. */
  edicaoId?: EntityId;
  /** Quando a partitura é de uma parte, e não da obra inteira. */
  movimentoId?: EntityId;

  /** O título como a fonte o escreve. Serve à resolução e à busca. */
  tituloNaFonte: string;
  /** O nome do autor como a fonte o escreve, antes de qualquer resolução. */
  autorNaFonte?: string;

  formato: FormatoDePartitura;
  capacidade: CapacidadeDaPartitura;
  url: string;
  /** Licença DO ARQUIVO. Metade do acervo exige atribuição, e exigir é condição. */
  licenca?: string;
  /** Quem transcreveu. Obrigatório onde a licença exige atribuição. */
  transcritores: string[];

  /** Instrumentos do vocabulário — resolvidos, e nunca a grafia da fonte. */
  instrumentacao: EntityId[];

  fonteId: KnowledgeSource;
  /** O identificador da partitura NA fonte, para voltar à origem. */
  refDaFonte: string;
  provenance: FieldProvenance[];
}

// ---------------------------------------------------------------------------
// Gravação
// ---------------------------------------------------------------------------

export interface Gravacao {
  id: EntityId;
  obraId?: EntityId;
  titulo?: string;
  /** Quem tocou, por papel: intérpretes, regente, conjunto. */
  interpretes: Array<{ pessoaId: EntityId; papelId: EntityId }>;
  interpretesNaoResolvidos: string[];
  ano?: number;
  url?: string;
  licenca?: string;
  fonteId: KnowledgeSource;
  refDaFonte: string;
  provenance: FieldProvenance[];
}

// ---------------------------------------------------------------------------
// A fila de resolução
// ---------------------------------------------------------------------------

/**
 * O QUE CHEGOU DE FORA E AINDA NÃO ACHOU DONO.
 *
 * É a peça que faltava, e a falta dela custou mil trezentas e trinta e uma
 * obras falsas.
 *
 * Quando uma fonte traz uma partitura cuja obra o catálogo não reconhece, há
 * três saídas possíveis, e duas são ruins:
 *
 *   **descartar** — perde-se um recurso real, e ninguém fica sabendo;
 *   **criar uma obra** — o catálogo ganha uma duplicata que parece registro;
 *   **enfileirar** — o recurso existe, fica visível, e espera resolução.
 *
 * Só a terceira é honesta. Um item nesta fila **aparece no acervo** como
 * recurso pendente, com o nome que a fonte deu, e não conta como obra em
 * nenhuma contagem.
 */
export type MotivoDaPendencia =
  /** Nenhuma obra do catálogo casou com o que a fonte descreve. */
  | 'OBRA_NAO_ENCONTRADA'
  /** Mais de uma casou, e escolher seria adivinhar. */
  | 'OBRA_AMBIGUA'
  /** A pessoa que a fonte nomeia não está no catálogo. */
  | 'PESSOA_NAO_ENCONTRADA'
  /** A fonte não deu dado suficiente para tentar. */
  | 'DADO_INSUFICIENTE';

export interface RegistroPendente {
  id: EntityId;
  /** Que tipo de recurso está esperando. */
  recurso: 'PARTITURA' | 'GRAVACAO' | 'EDICAO';
  recursoId: EntityId;
  motivo: MotivoDaPendencia;
  /** O que a fonte disse, guardado inteiro para quem for resolver à mão. */
  descricaoNaFonte: string;
  /** Os candidatos que a resolução encontrou, quando encontrou mais de um. */
  candidatos: EntityId[];
  registradoEm: ISOTimestamp;
  fonteId: KnowledgeSource;
}

/**
 * A regra que a ingestão não pode violar.
 *
 * Nenhuma fonte externa cria Pessoa ou Obra. Ela **enriquece** o que existe, ou
 * enfileira o que não achou. Criar entidade canônica é ato de curadoria, e
 * curadoria tem dono e data.
 *
 * Esta função existe para ser chamada no ponto da ingestão e para ser
 * verificada: um caminho que cria obra a partir de fonte externa é defeito, e
 * não decisão.
 */
export function podeCriarEntidadeCanonica(origem: 'CURADORIA' | 'FONTE_EXTERNA'): boolean {
  return origem === 'CURADORIA';
}

/** A partitura está pronta para prática, ou só para consulta? */
export function serveParaPratica(p: Partitura): boolean {
  return p.capacidade === 'RENDERIZAVEL' && ehSimbolico(p.formato) && !!p.obraId;
}

/**
 * A atribuição exigida por esta partitura foi cumprida?
 *
 * Licença com cláusula de atribuição é **condição de uso**: exibir o arquivo
 * sem nomear quem o produziu é redistribuí-lo sem licença nenhuma.
 */
export function atribuicaoCumprida(p: Partitura): boolean {
  if (!p.licenca || !/attribution/i.test(p.licenca)) return true;
  return p.transcritores.length > 0;
}

/**
 * Tudo por que esta partitura pode ser encontrada.
 *
 * O título NA FONTE entra mesmo depois de resolvida: quem procurou pelo nome
 * que viu no repositório de origem precisa chegar aqui.
 */
export function termosDeBuscaDaPartitura(p: Partitura): string[] {
  return [p.tituloNaFonte, ...(p.autorNaFonte ? [p.autorNaFonte] : []), ...p.transcritores];
}
