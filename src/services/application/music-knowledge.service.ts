import {
  CanonicalComposer,
  CanonicalWork,
  FieldProvenance,
  avaliarDominioPublico,
  avaliarDisponibilidade,
  proveniencia,
} from '../../domain/music-knowledge';
import {
  ComposerCandidate,
  KnowledgeAdapter,
  KnowledgeSourceError,
  WorkCandidate,
} from '../../adapters/knowledge/knowledge-source.interface';
import {
  MusicKnowledgeRepository,
  musicKnowledgeRepository,
} from '../../repositories/music-knowledge.repository';

/**
 * QUEM RECONCILIA.
 *
 * POR QUE A RECONCILIAÇÃO É UMA CAMADA, E NÃO UM DETALHE
 * ------------------------------------------------------
 * Nenhum adaptador escreve no acervo. Todos devolvem **candidatos**, e é aqui
 * que eles são postos lado a lado — porque decidir exige ver a discordância.
 * Se cada adaptador gravasse direto, a última fonte a responder ganharia, e
 * ninguém saberia que houve disputa.
 *
 * O que sai daqui carrega **proveniência por campo**: a data de morte veio do
 * Wikidata, a biografia da curadoria própria, o identificador de obra do
 * MusicBrainz. Registrar a origem só no nível da entidade apagaria a
 * distinção, e é justamente ela que permite auditar, corrigir e dar crédito.
 *
 * CONFLITO NÃO É ERRO: É INFORMAÇÃO
 * ---------------------------------
 * Duas fontes com datas de morte diferentes não invalidam o registro — elas
 * declaram que ele precisa de olho humano. O conflito fica escrito em
 * `resolution.conflicts` e a confiança cai. O que não se faz é escolher em
 * silêncio e apresentar o resultado como certo.
 *
 * O IMPACTO DISSO É LEGAL, E NÃO ESTÉTICO
 * ---------------------------------------
 * A data de morte decide o domínio público, que decide o que pode ser
 * reproduzido. Uma reconciliação descuidada aqui não produz uma tela feia:
 * produz obra protegida tocando numa plataforma pública.
 */

export interface IngestaoRelatorio {
  compositoresCriados: number;
  compositoresAtualizados: number;
  obrasCriadas: number;
  /** Quantos ficaram com conflito para revisar. */
  comConflito: number;
  /**
   * Obras catalogadas cuja EXPERIÊNCIA não é oferecida aqui dentro.
   *
   * Elas entram no acervo de qualquer forma — catalogar e oferecer são eixos
   * diferentes, e um acervo acadêmico registra a existência das obras. O que
   * este campo lista é o que precisa de sinalização na ficha, com o motivo e o
   * link oficial de onde o item está disponível.
   *
   * O nome anterior era `naoExibiveis`, e o nome carregava a confusão: elas
   * SÃO exibidas — como ficha. O que não se oferece é a partitura e o áudio.
   */
  somenteCatalogo: { titulo: string; motivo: string; linkOficial?: string }[];
  erros: string[];
}

/** Identificador estável e legível: "bach-johann-sebastian". */
export function idLegivel(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class MusicKnowledgeService {
  constructor(
    private readonly adaptadores: KnowledgeAdapter[],
    private readonly repo: MusicKnowledgeRepository = musicKnowledgeRepository
  ) {}

  /**
   * Junta os candidatos de várias fontes num compositor só.
   *
   * A REGRA DE PRECEDÊNCIA
   * ----------------------
   * Campo ausente é preenchido por quem o tiver. Campo presente só é
   * substituído por fonte de **confiança maior** — e quando duas fontes de
   * confiança parecida discordam, o conflito é registrado em vez de resolvido
   * no escuro.
   */
  public reconciliarCompositor(candidatos: ComposerCandidate[]): CanonicalComposer | null {
    if (candidatos.length === 0) return null;

    const ordenados = [...candidatos].sort((a, b) => b.confidence - a.confidence);
    const melhor = ordenados[0];
    const conflitos: string[] = [];
    const prov: FieldProvenance[] = [];

    let deathYear = melhor.deathYear;
    let birthYear = melhor.birthYear;
    const externalIds = { ...melhor.externalIds };

    for (const c of ordenados.slice(1)) {
      /**
       * A discordância que mais importa é a data de morte, porque é ela que
       * decide o domínio público.
       */
      if (typeof c.deathYear === 'number' && typeof deathYear === 'number' && c.deathYear !== deathYear) {
        conflitos.push(`data de morte: ${deathYear} e ${c.deathYear} discordam entre fontes`);
      }
      deathYear ??= c.deathYear;
      birthYear ??= c.birthYear;

      for (const [k, v] of Object.entries(c.externalIds)) {
        const chave = k as keyof typeof externalIds;
        if (v && !externalIds[chave]) externalIds[chave] = v;
      }
    }

    for (const campo of ['canonicalName', 'birthYear', 'deathYear'] as const) {
      prov.push(proveniencia(campo, 'WIKIDATA', externalIds.wikidata, melhor.confidence));
    }

    /**
     * A confiança CAI quando há conflito.
     *
     * Um registro disputado que se apresenta com confiança 1 é pior que um
     * registro ausente: ele convida a publicar sobre o que ninguém conferiu.
     */
    const confidence = conflitos.length > 0 ? Math.min(0.5, melhor.confidence) : melhor.confidence;

    return {
      id: idLegivel(melhor.sortName ?? melhor.name),
      canonicalName: melhor.name,
      sortName: melhor.sortName ?? melhor.name,
      birthYear,
      deathYear,
      birthPlace: melhor.birthPlace,
      biography: melhor.biographyPt || melhor.biographyEn
        ? { pt: melhor.biographyPt, en: melhor.biographyEn }
        : undefined,
      periodIds: [],
      movements: melhor.movements ?? [],
      regionIds: [],
      portraitUrl: melhor.portraitUrl,
      externalIds,
      workIds: [],
      provenance: prov,
      publicDomain: avaliarDominioPublico({ anoDeMorte: deathYear, anoDeNascimento: birthYear }),
      resolution: {
        method: 'WIKIDATA_SPARQL',
        resolvedAt: new Date().toISOString(),
        confidence,
        conflicts: conflitos.length > 0 ? conflitos : undefined,
      },
    };
  }

  /**
   * A obra herda o domínio público **do compositor**, e não da própria idade.
   *
   * É o compositor que morre, e é da morte dele que o prazo corre. Uma obra
   * de 1890 de alguém que morreu em 1960 continua protegida, e avaliar pela
   * data da obra a liberaria por engano.
   */
  public reconciliarObra(
    candidato: WorkCandidate,
    compositor: CanonicalComposer
  ): CanonicalWork {
    const titulo = candidato.titlePt ?? candidato.titleEn ?? 'Obra sem título';

    return {
      id: `${compositor.id}--${idLegivel(titulo)}`,
      canonicalTitle: { pt: candidato.titlePt, en: candidato.titleEn },
      composerIds: [compositor.id],
      date: candidato.date,
      instrumentation: candidato.instrumentation ?? [],
      generoId: candidato.genre ? idLegivel(candidato.genre) : undefined,
      periodId: compositor.periodIds[0],
      regionId: compositor.regionIds[0],
      movements: candidato.movements ?? [],
      /** Nasce sem partitura: a edição vem das fontes do nível 1 a 3. */
      scoreRefs: [],
      recordingRefs: [],
      externalIds: candidato.externalIds,
      provenance: [
        proveniencia('canonicalTitle', 'WIKIDATA', candidato.externalIds.wikidata, candidato.confidence),
      ],
      publicDomain: compositor.publicDomain,
      resolution: {
        method: 'WIKIDATA_SPARQL',
        resolvedAt: new Date().toISOString(),
        confidence: candidato.confidence,
      },
    };
  }

  /**
   * Ingere um compositor e as obras dele, de todas as fontes disponíveis.
   *
   * Erro de UMA fonte não derruba a ingestão: a rede oscila, e perder o
   * trabalho das outras por causa disso seria transformar instabilidade em
   * perda. O erro entra no relatório, que é onde alguém pode vê-lo.
   */
  public async ingerirCompositor(termo: string): Promise<IngestaoRelatorio> {
    const relatorio: IngestaoRelatorio = {
      compositoresCriados: 0,
      compositoresAtualizados: 0,
      obrasCriadas: 0,
      comConflito: 0,
      somenteCatalogo: [],
      erros: [],
    };

    const candidatos: ComposerCandidate[] = [];
    for (const ad of this.adaptadores) {
      try {
        candidatos.push(...(await ad.buscarCompositores(termo, 5)));
      } catch (e) {
        relatorio.erros.push(
          e instanceof KnowledgeSourceError ? e.message : `[${ad.source}] falha inesperada`
        );
      }
    }

    const compositor = this.reconciliarCompositor(candidatos);
    if (!compositor) return relatorio;

    const jaExiste = compositor.externalIds.wikidata
      ? await this.repo.compositorPorExterno('wikidata', compositor.externalIds.wikidata)
      : await this.repo.compositorPorId(compositor.id);

    if (jaExiste) relatorio.compositoresAtualizados += 1;
    else relatorio.compositoresCriados += 1;
    if (compositor.resolution.conflicts) relatorio.comConflito += 1;

    const obras: CanonicalWork[] = [];
    if (compositor.externalIds.wikidata) {
      for (const ad of this.adaptadores) {
        try {
          const cands = await ad.buscarObrasDoCompositor(compositor.externalIds.wikidata, 100);
          obras.push(...cands.map((c) => this.reconciliarObra(c, compositor)));
        } catch (e) {
          relatorio.erros.push(
            e instanceof KnowledgeSourceError ? e.message : `[${ad.source}] falha ao buscar obras`
          );
        }
      }
    }

    /** Mesma obra por duas fontes é uma obra. */
    const porId = new Map(obras.map((o) => [o.id, o]));
    for (const obra of porId.values()) {
      await this.repo.salvarObra(obra);
      relatorio.obrasCriadas += 1;

      /**
       * A obra JÁ foi gravada acima, e isso é deliberado: **tudo entra no
       * acervo**. O que se registra aqui é o que a ficha precisa sinalizar.
       */
      const disp = avaliarDisponibilidade(obra);
      if (disp.modo === 'SOMENTE_CATALOGO') {
        relatorio.somenteCatalogo.push({
          titulo: obra.canonicalTitle.pt ?? obra.canonicalTitle.en ?? obra.id,
          motivo: disp.motivo,
          linkOficial: disp.linkOficial?.url,
        });
      }
    }

    await this.repo.salvarCompositor({ ...compositor, workIds: [...porId.keys()] });
    return relatorio;
  }
}
