import { EntityId, ISOTimestamp } from './types';

/**
 * O ACERVO CANÔNICO — compositores, obras e proveniência.
 *
 * A PLATAFORMA MANTÉM ENTIDADE PRÓPRIA
 * ------------------------------------
 * As fontes externas são **referência**, e nunca o banco de dados do produto.
 * Wikidata resolve identidade, MusicBrainz confirma autoria, Commons traz
 * retrato — e nada disso é a obra do Conservatório. O que a plataforma guarda
 * é o registro canônico dela, reconciliado, com proveniência por campo.
 *
 * A diferença não é acadêmica. Acervo montado como espelho de uma API morre
 * quando a API muda; acervo próprio sobrevive, e pode ser corrigido por quem
 * sabe mais que a fonte.
 *
 * PROVENIÊNCIA POR CAMPO, E NÃO POR ENTIDADE
 * ------------------------------------------
 * A data de morte pode vir do Wikidata, o identificador de obra do
 * MusicBrainz e a biografia de curadoria própria. Registrar a origem só no
 * nível da entidade apagaria essa distinção — e é justamente ela que permite
 * auditar, corrigir e dar crédito.
 *
 * Ver `docs/backend_specs/21.1_MUSIC_KNOWLEDGE_SOURCES_AND_ENTITY_RESOLUTION.md`.
 */

/** Texto com idioma. `pt` é o que a plataforma mostra; `en` é a rede de segurança. */
export interface LocalizedText {
  pt?: string;
  en?: string;
}

/** O que exibir, preferindo português e nunca devolvendo vazio silencioso. */
export function textoDe(t: LocalizedText | undefined): string | null {
  return t?.pt ?? t?.en ?? null;
}

export type KnowledgeSource =
  | 'WIKIDATA'
  | 'MUSICBRAINZ'
  | 'OPEN_OPUS'
  | 'COMMONS'
  | 'INTERNET_ARCHIVE'
  | 'MUTOPIA'
  | 'IMSLP'
  /**
   * Música Brasilis — e aqui ela é fonte PRIMÁRIA, e não complemento.
   *
   * O Brasil aparecia no acervo com quatro compositores. Não porque o
   * repertório seja pequeno: a catalogação de origem é do concerto ocidental, e
   * ela cobre o Brasil como cobre qualquer periferia — pelos poucos nomes que
   * atravessaram.
   *
   * Esta fonte cataloga o corpus brasileiro **como corpus**. Para o recorte
   * brasileiro ela ocupa o lugar que o Open Opus ocupa no ocidental.
   *
   * O `robots.txt` dela proíbe `/media/`, que é onde vivem arquivos e imagens:
   * o acervo guarda **ficha e link**, nunca o arquivo, e não exibe o retrato
   * hospedado lá.
   */
  | 'MUSICA_BRASILIS'
  | 'MANUAL_CURATION';

/**
 * De onde veio ESTE campo, e quando.
 *
 * `confidence` abaixo de 1 significa que as fontes discordaram em alguma
 * medida, e que o campo precisa de olho humano antes de ser publicado.
 */
export interface FieldProvenance {
  field: string;
  source: KnowledgeSource;
  sourceRef?: string;
  retrievedAt: ISOTimestamp;
  confidence: number;
}

// ---------------------------------------------------------------------------
// Domínio público
// ---------------------------------------------------------------------------

export type PublicDomainStatus =
  | 'PUBLIC_DOMAIN'
  | 'LIKELY_PUBLIC_DOMAIN'
  | 'UNDETERMINED'
  | 'PROTECTED';

export interface PublicDomainAssessment {
  status: PublicDomainStatus;
  basis: 'AUTHOR_DEATH_PLUS_TERM' | 'SOURCE_DECLARED_LICENSE' | 'MANUAL_REVIEW' | 'UNKNOWN';
  authorDeathYear?: number;
  /** Jurisdição do cálculo. O produto é brasileiro, e o padrão é BR. */
  jurisdiction: 'BR' | 'US' | 'EU';
  assessedAt: ISOTimestamp;
  note?: string;
}

/**
 * O prazo brasileiro: **setenta anos a partir de 1º de janeiro do ano
 * seguinte ao da morte** (Lei 9.610/98, art. 41).
 *
 * A contagem importa e é fácil de errar por um ano. Quem morreu em 1955 tem
 * proteção até 31/12/2025, e a obra entra em domínio público em 01/01/2026 —
 * ou seja, `anoAtual >= anoDeMorte + 71`. Usar `+ 70` liberaria a obra um ano
 * antes, o que é exatamente o erro que ninguém percebe até receber a
 * notificação.
 */
export const PRAZO_APOS_MORTE_BR = 70;

export function anoDeEntradaEmDominioPublico(anoDeMorte: number): number {
  return anoDeMorte + PRAZO_APOS_MORTE_BR + 1;
}

/**
 * Quantos anos de vida se presume, quando só se conhece o nascimento.
 *
 * Serve para o caso "nasceu em 1550 e ninguém registrou a morte": é
 * razoavelmente seguro presumir domínio público, e por isso o veredito é
 * `LIKELY_PUBLIC_DOMAIN` — **provável**, e não certo. A diferença entre os
 * dois é o que separa exibir de ter de conferir antes.
 */
const VIDA_PRESUMIDA = 100;

/**
 * Avalia o domínio público a partir da data de morte, e nunca da idade
 * aparente da obra.
 *
 * "É antiga" e "está num acervo público" não são fundamentos: o primeiro não
 * é critério legal e o segundo confunde a OBRA com o ARQUIVO — um manuscrito
 * de Bach digitalizado em 2015 tem obra livre e digitalização com dono.
 */
export function avaliarDominioPublico(entrada: {
  anoDeMorte?: number;
  anoDeNascimento?: number;
  licencaDeclarada?: string;
  hoje?: Date;
}): PublicDomainAssessment {
  const agora = entrada.hoje ?? new Date();
  const anoAtual = agora.getFullYear();
  const assessedAt = agora.toISOString();
  const base = { jurisdiction: 'BR' as const, assessedAt };

  if (typeof entrada.anoDeMorte === 'number') {
    const entra = anoDeEntradaEmDominioPublico(entrada.anoDeMorte);
    return {
      ...base,
      status: anoAtual >= entra ? 'PUBLIC_DOMAIN' : 'PROTECTED',
      basis: 'AUTHOR_DEATH_PLUS_TERM',
      authorDeathYear: entrada.anoDeMorte,
      note:
        anoAtual >= entra
          ? `Em domínio público desde ${entra}.`
          : `Protegida até 31/12/${entra - 1}.`,
    };
  }

  /**
   * Licença declarada pela FONTE vale por si — é o caso do Mutopia, que
   * publica sob domínio público ou Creative Commons e o declara por peça.
   * Vale para o ARQUIVO, e não para a obra: são coisas diferentes.
   */
  if (entrada.licencaDeclarada) {
    return {
      ...base,
      status: 'LIKELY_PUBLIC_DOMAIN',
      basis: 'SOURCE_DECLARED_LICENSE',
      note: `A fonte declara: ${entrada.licencaDeclarada}. Vale para o arquivo, não para a obra.`,
    };
  }

  if (typeof entrada.anoDeNascimento === 'number') {
    const morteProvavel = entrada.anoDeNascimento + VIDA_PRESUMIDA;
    if (anoAtual >= anoDeEntradaEmDominioPublico(morteProvavel)) {
      return {
        ...base,
        status: 'LIKELY_PUBLIC_DOMAIN',
        basis: 'MANUAL_REVIEW',
        note: `Nascimento em ${entrada.anoDeNascimento} e morte não registrada. Confirmar antes de publicar.`,
      };
    }
  }

  return {
    ...base,
    status: 'UNDETERMINED',
    basis: 'UNKNOWN',
    note: 'Sem data de morte e sem licença declarada. Não exibir nem reproduzir.',
  };
}

/**
 * DOIS EIXOS QUE NÃO SE ANULAM: CATALOGAR E OFERECER.
 *
 * O ERRO QUE ISTO CORRIGE
 * -----------------------
 * A primeira versão tinha `podeListarFicha`, que devolvia `false` para obra
 * protegida — ou seja, o acervo **escondia** o que não podia reproduzir. Isso
 * confundia duas coisas diferentes:
 *
 *   **Catalogar** é registrar que a obra existe, de quem é, quando foi
 *   escrita, em que era e região, com que instrumentação. É trabalho
 *   acadêmico, e é a razão de um acervo existir.
 *
 *   **Oferecer a experiência** é renderizar a partitura, tocar o áudio, usar
 *   a obra na prática. É isso, e só isso, que a legislação limita.
 *
 * Um conservatório que só catalogasse o que pode tocar teria um catálogo
 * mutilado — sem Stravinsky, sem Villa-Lobos, sem quase nada do século XX. O
 * aluno de história da música precisa saber que a Sagração da Primavera
 * existe, mesmo que a plataforma não possa reproduzi-la.
 *
 * ENTÃO O ACERVO REGISTRA TUDO
 * ----------------------------
 * E sinaliza, com todas as letras, o que não está disponível como
 * experiência aqui dentro — e aponta **o link oficial** de onde o item está
 * disponível legitimamente.
 *
 * ISTO NÃO CONTRADIZ "SEM LINK DE SAÍDA"
 * --------------------------------------
 * A `21.1 §11.7` proíbe link de saída **no fluxo de estudo** — para não
 * interromper quem está numa lição. A ficha de catálogo é outro lugar e outro
 * propósito: ali, omitir onde a obra está seria esconder informação de quem
 * veio justamente procurá-la.
 */
export type ModoDeAcesso =
  /** Renderiza partitura, toca áudio, entra na prática. */
  | 'EXPERIENCIA_COMPLETA'
  /** Catalogada com ficha completa; a experiência fica na fonte oficial. */
  | 'SOMENTE_CATALOGO';

export interface DisponibilidadeNoConservatorio {
  modo: ModoDeAcesso;
  /** Escrito para a pessoa, e nunca vazio. Ausência de motivo é opacidade. */
  motivo: string;
  /** Onde o item está disponível de forma legítima, quando se sabe. */
  linkOficial?: { rotulo: string; url: string };
}

/**
 * O item entra no acervo? **Sempre.**
 *
 * A função existe para que a resposta fique escrita em algum lugar, e para
 * que a próxima pessoa que pensar em filtrar o catálogo por licença encontre
 * esta linha antes.
 */
export function entraNoAcervo(): boolean {
  return true;
}

/**
 * A experiência pode ser oferecida aqui dentro?
 *
 * **Só o que é certo.** `LIKELY_PUBLIC_DOMAIN` não passa: "provável" é o
 * estado de quem ainda precisa conferir, e oferecer sobre provável transfere
 * o risco da plataforma para quem confia nela.
 */
export function podeExibirObra(a: PublicDomainAssessment): boolean {
  return a.status === 'PUBLIC_DOMAIN';
}

/**
 * O link oficial de um item, a partir dos identificadores que se tem.
 *
 * A ordem é por AUTORIDADE sobre a partitura: o IMSLP é onde a edição está,
 * o MusicBrainz é onde a obra está identificada, o Wikidata é o registro
 * geral. O primeiro que existir vale.
 *
 * Note que isto aponta para a **página**, e não para o arquivo. Linkar uma
 * página é o que qualquer catálogo faz; o que o `robots.txt` do IMSLP proíbe
 * é rastrear `/images/` e `/imglnks/` — baixar, e não citar.
 */
export function linkOficial(ids: ExternalIds): { rotulo: string; url: string } | undefined {
  if (ids.mutopia) {
    return { rotulo: 'Mutopia Project', url: `https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=${ids.mutopia}` };
  }
  if (ids.imslp) {
    return { rotulo: 'IMSLP', url: `https://imslp.org/wiki/${encodeURI(ids.imslp)}` };
  }
  if (ids.musicbrainz) {
    return { rotulo: 'MusicBrainz', url: `https://musicbrainz.org/work/${ids.musicbrainz}` };
  }
  if (ids.commonsCategory) {
    return {
      rotulo: 'Wikimedia Commons',
      url: `https://commons.wikimedia.org/wiki/Category:${encodeURI(ids.commonsCategory)}`,
    };
  }
  if (ids.wikidata) {
    return { rotulo: 'Wikidata', url: `https://www.wikidata.org/wiki/${ids.wikidata}` };
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Identificadores externos
// ---------------------------------------------------------------------------

/**
 * Wikidata é o **eixo**, e não mais um identificador.
 *
 * É ele que carrega as referências cruzadas para todas as demais fontes: uma
 * consulta resolve IMSLP, MusicBrainz e Commons de uma vez. Sem um eixo, cada
 * tela inventaria a própria chave — que foi exatamente como `bwv-1001`
 * apareceu cravada dentro de uma tela.
 */
export interface ExternalIds {
  wikidata?: string;
  musicbrainz?: string;
  openOpus?: string;
  imslp?: string;
  commonsCategory?: string;
  mutopia?: string;
  viaf?: string;
  isni?: string;
}

export interface ResolutionMetadata {
  /** Como a identidade foi obtida. **Nunca** por suposição. */
  method: 'WIKIDATA_SPARQL' | 'MUSICBRAINZ_LOOKUP' | 'OPEN_OPUS' | 'MANUAL_CURATION';
  resolvedAt: ISOTimestamp;
  /** Concordância entre fontes. Abaixo de 1 exige revisão antes de publicar. */
  confidence: number;
  conflicts?: string[];
}

// ---------------------------------------------------------------------------
// Partitura e gravação
// ---------------------------------------------------------------------------

/**
 * A hierarquia de fontes de partitura, em tipo.
 *
 * `NATIVA` significa que a plataforma **renderiza** — LilyPond e MIDI do
 * Mutopia viram pauta própria, com playhead próprio, ligada à prática. Um PDF
 * embutido seria imagem morta.
 *
 * `FICHA` é o nível 5: IMSLP e Música Brasilis entram como catalogação, e os
 * arquivos deles **não são buscados** — o `robots.txt` dos dois proíbe
 * justamente os diretórios onde os arquivos ficam. Obra livre não autoriza
 * rastrear o servidor de ninguém.
 */
export type ScoreRenderMode = 'NATIVA' | 'FICHA';

export interface ExternalScoreRef {
  source: KnowledgeSource;
  sourceRef: string;
  /** `lilypond` e `midi` são manipuláveis; `pdf` e `image` não. */
  format: 'lilypond' | 'midi' | 'musicxml' | 'pdf' | 'image';
  render: ScoreRenderMode;
  /** Licença **do arquivo**, que é distinta do domínio público da obra. */
  fileLicense?: string;
  /** Quem editorou. Atribuição por peça é requisito, e não cortesia. */
  editors?: string[];
}

export interface ExternalRecordingRef {
  source: KnowledgeSource;
  sourceRef: string;
  title?: string;
  /** Licença **por item**: estar no Internet Archive não torna nada livre. */
  itemLicense?: string;
}

// ---------------------------------------------------------------------------
// As duas entidades canônicas
// ---------------------------------------------------------------------------

export interface CanonicalComposer {
  id: EntityId;
  canonicalName: string;
  /** "Bach, Johann Sebastian" — para ordenar sem depender do primeiro nome. */
  sortName: string;
  birthYear?: number;
  deathYear?: number;
  birthPlace?: string;
  deathPlace?: string;
  biography?: LocalizedText;
  /**
   * O INSTRUMENTO QUE A PESSOA TOCAVA — e não o meio para que escreveu.
   *
   * São dois eixos, e confundi-los faz o filtro responder a pergunta errada:
   * Berlioz escreveu para orquestra inteira e tocava violão e flauta; Chopin
   * escreveu quase só para piano e era pianista, o que faz parecer que os dois
   * campos são um.
   *
   * Serve a uma pergunta que o aluno faz de verdade — "quem tocava o meu
   * instrumento" — e que nenhum outro campo responde.
   */
  instrumentosPraticados?: string[];
  /** Eras do Atlas em que o compositor produziu. */
  periodIds: EntityId[];
  /**
   * O sub-período, mais fino que a era.
   *
   * O Atlas tem sete eras porque é o recorte do curso. A catalogação de origem
   * distingue mais: separa romântico inicial de tardio, e pós-romântico de
   * século XX. Guardar só a era **perdia essa distinção** — Schubert e Mahler
   * caíam na mesma gaveta, e a diferença entre eles é o assunto de dois
   * capítulos.
   *
   * Aqui os dois convivem: a era organiza o mapa, o sub-período refina a
   * consulta. Nada se perde.
   */
  subPeriodo?: string;
  /** Movimentos estéticos — o eixo que o Atlas usa além de era e região. */
  movements: string[];
  /** Regiões do Atlas ligadas a ele. */
  regionIds: EntityId[];
  portraitUrl?: string;
  externalIds: ExternalIds;
  workIds: EntityId[];
  provenance: FieldProvenance[];
  publicDomain: PublicDomainAssessment;
  resolution: ResolutionMetadata;
}

/**
 * A FICHA DE UMA OBRA, NO PADRAO DOS CATALOGOS MUSICAIS.
 *
 * POR QUE ESTES CAMPOS, E NAO OUTROS
 * ----------------------------------
 * Nao foram inventados aqui. Sao os que todo catalogo de musica usa para
 * identificar uma obra sem ambiguidade — e a razao e pratica: "Sonata em do
 * maior" de Mozart existe mais de uma vez, e so o conjunto **numero de
 * catalogo + tonalidade + instrumentacao** distingue uma da outra.
 *
 * | campo | por que e padrao |
 * | :--- | :--- |
 * | numero de catalogo | e o identificador que a musicologia usa: BWV, K., Op. |
 * | tonalidade | entra no titulo por convencao, e distingue homonimos |
 * | compasso e andamento | fato da peca, e o que o simulador precisa para tocar |
 * | instrumentacao | separa a versao para piano da versao para orquestra |
 * | movimentos | uma sonata em tres movimentos e uma obra, e nao tres |
 * | data de composicao | situa no tempo com mais precisao que a era |
 *
 * O QUE ESTA VAZIO, E POR QUE
 * ---------------------------
 * `catalogNumber` e `externalIds` nascem vazios e assim ficam ate a
 * **resolucao de identidade** rodar — ela depende de consultar Wikidata e
 * MusicBrainz, e isso depende de rede.
 *
 * Preencher "BWV 846" por deducao a partir do titulo e da tonalidade seria
 * palpite com cara de catalogacao, e catalogo que adivinha e pior que catalogo
 * incompleto: ninguem sabe quais linhas conferir.
 */
export interface CanonicalWork {
  id: EntityId;
  canonicalTitle: LocalizedText;
  composerIds: EntityId[];
  /** Ano ou intervalo, como a fonte declara: "1722", "1717-1723". */
  date?: string;
  /**
   * Numero de catalogo tematico: `BWV 846`, `K. 545`, `Op. 27 n. 2`.
   *
   * Vazio ate a resolucao de identidade rodar. Deduzi-lo do titulo seria
   * palpite com cara de catalogacao.
   */
  catalogNumber?: string;
  /** Tonalidade, como o catalogo a escreve: "Do maior", "La menor". */
  key?: string;
  /** Formula de compasso: "4/4", "3/4". */
  meter?: string;
  /** Andamento em batidas por minuto, quando a edicao o declara. */
  tempoBpm?: number;
  instrumentation: string[];
  /** Id do gênero no Atlas: missa, motete, madrigal, ópera, suíte. */
  generoId?: EntityId;
  /**
   * AS SELEÇÕES DA FONTE, e o cuidado que elas exigem.
   *
   * A catalogação de origem mantém duas listas curadas: o que ela **recomenda**
   * a quem está começando, e o que ela considera **popular**. São 1.245 e 401
   * obras, e são juízo editorial de terceiro — não medição nossa, não
   * consenso, não cânone.
   *
   * Elas ficaram fora do catálogo por isso, e a decisão errou o alvo: o
   * problema nunca foi exibi-las, foi exibi-las **como se fossem nossas**.
   *
   * O QUE ESTAS LISTAS NÃO SÃO
   * -------------------------
   * Não são linhagem, escola nem influência. Já houve aqui a tentação de
   * chamar a lista de recomendados de "descendência" — e isso seria um rótulo
   * afirmando uma relação que o dado não carrega.
   *
   * Não são "os mais tocados" nem "os principais": ninguém aqui apurou
   * execução nem cânone. São o que a fonte destaca, e só.
   *
   * Um eixo de linhagem precisa vir de outro lugar — o Wikidata tem
   * professor/aluno, e o grafo de influências já está registrado como trabalho
   * próprio. Reaproveitar esta lista para aquilo seria inventar o dado.
   * Uma seleção de entrada num acervo de vinte e cinco mil obras é exatamente
   * o que alguém que chega precisa — desde que esteja escrito de quem é.
   *
   * O campo guarda a origem junto do fato, e a tela nomeia a fonte.
   *
   * Opcional porque a AUSÊNCIA é a regra: vinte e três mil obras não estão em
   * lista nenhuma, e exigir um arranjo vazio em cada uma diria que alguém
   * conferiu — quando ninguém conferiu.
   */
  selecoesDaFonte?: Array<'RECOMENDADA' | 'POPULAR'>;
  periodId?: EntityId;
  regionId?: EntityId;
  /** Os movimentos da obra — allegro, adágio —, e não o movimento estético. */
  movements: string[];
  scoreRefs: ExternalScoreRef[];
  recordingRefs: ExternalRecordingRef[];
  externalIds: ExternalIds;
  provenance: FieldProvenance[];
  publicDomain: PublicDomainAssessment;
  resolution: ResolutionMetadata;
}

/**
 * A obra tem edição que a plataforma consegue RENDERIZAR?
 *
 * Sem isso, a ficha existe e o botão de tocar não — e é melhor assim do que
 * um botão que abre outra aba, que é o mesmo que dizer "não temos".
 */
export function temEdicaoNativa(obra: CanonicalWork): boolean {
  return obra.scoreRefs.some((r) => r.render === 'NATIVA');
}

/** Um registro de proveniência, com hora e origem. */
export function proveniencia(
  field: string,
  source: KnowledgeSource,
  sourceRef?: string,
  confidence = 1
): FieldProvenance {
  return { field, source, sourceRef, retrievedAt: new Date().toISOString(), confidence };
}

/**
 * O que o Conservatório pode oferecer sobre esta obra, e o que diz sobre isso.
 *
 * O motivo é **obrigatório** e escrito para a pessoa. Uma ficha que diga
 * apenas "indisponível" deixa o aluno sem saber se o problema é legal, técnico
 * ou provisório — e "não sabemos" já é uma informação melhor que silêncio.
 */
export function avaliarDisponibilidade(obra: CanonicalWork): DisponibilidadeNoConservatorio {
  const link = linkOficial(obra.externalIds);
  const pd = obra.publicDomain;

  if (!podeExibirObra(pd)) {
    const motivo =
      pd.status === 'PROTECTED'
        ? `Obra protegida por direito autoral. ${pd.note ?? ''}`.trim()
        : pd.status === 'LIKELY_PUBLIC_DOMAIN'
          ? 'Provavelmente em domínio público, ainda sem confirmação. Não reproduzimos sobre provável.'
          : 'Sem data de morte do autor registrada, não dá para afirmar que está em domínio público.';

    return { modo: 'SOMENTE_CATALOGO', motivo, linkOficial: link };
  }

  /**
   * Domínio público não basta: é preciso ter edição que a plataforma
   * consiga RENDERIZAR. Obra livre sem edição redistribuível fica catalogada
   * com o motivo dito — e o motivo aqui é nosso, e não da lei.
   */
  if (!temEdicaoNativa(obra)) {
    return {
      modo: 'SOMENTE_CATALOGO',
      motivo:
        'Obra em domínio público. Ainda não há edição redistribuível catalogada — quando houver, aparece aqui.',
      linkOficial: link,
    };
  }

  return {
    modo: 'EXPERIENCIA_COMPLETA',
    motivo: 'Obra em domínio público, com edição livre catalogada.',
    linkOficial: link,
  };
}
