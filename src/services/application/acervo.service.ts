import {
  CanonicalComposer,
  CanonicalWork,
  DisponibilidadeNoConservatorio,
  avaliarDisponibilidade,
  temPartituraLocalizada,
  textoDe,
} from '../../domain/music-knowledge';
import { MusicalMovement, disponibilidadeDoCompositor } from '../../domain/atlas-map';
import {
  MusicKnowledgeRepository,
  musicKnowledgeRepository,
} from '../../repositories/music-knowledge.repository';
import { SEED_MOVEMENTS } from '../../data/seed-movements';
import { REGISTROS_DA_ANTIGUIDADE } from '../../data/seed-antiquity';
import { motivoDaOferta } from '../../domain/antiquity-record';
import { SEED_ARTICLES } from '../../data/seed-articles';
import { ArtigoDoConservatorio } from '../../domain/article';
import { carregarPartituras, Partitura } from '../../data/seed-partituras';
import {
  falhaAoCarregarOAcervo,
  idCanonicoDoCompositor,
  partiturasPendentes,
} from '../../data/acervo-unificado';
import {
  Faceta,
  ORDEM_DOS_SUBPERIODOS,
  ROTULO_DA_SITUACAO,
  contar,
  contarLista,
  montarFaceta,
  rotuloDoMeio,
  separarPorNivel,
} from '../../domain/catalog-facets';
import { DEFAULT_ERAS, DEFAULT_REGIONS, DEFAULT_GENRES } from '../../data/seed-atlas';
import { LIVRETOS_PADRAO } from '../../data/seed-booklets';
import { FaixaDoPlayer, REPERTORIO_DO_PLAYER } from '../../data/seed-player-repertoire';

/**
 * O ACERVO COMO CATÁLOGO.
 *
 * DUAS FORMAS DE OLHAR A MESMA COISA
 * ----------------------------------
 * O **Atlas** é mapa: jogável, com métrica, voltado a praticar a obra. Andar
 * nele é percorrer o tempo e o espaço, e o que importa ali é o que se pode
 * fazer com a peça.
 *
 * O **Acervo** é catálogo: listagem, filtro, ficha. Quem chega aqui quer
 * consultar — ver tudo o que existe de um compositor, todas as obras de um
 * gênero, o que há de um movimento. Informação em profundidade mora aqui, e
 * não no mapa.
 *
 * As duas leem o mesmo acervo. Separá-las não é duplicar: é reconhecer que
 * procurar e praticar são atividades diferentes, e que uma tela que tentasse
 * servir às duas serviria mal a ambas.
 *
 * O CATÁLOGO MOSTRA TUDO
 * ----------------------
 * Toda obra entra na listagem, qualquer que seja a situação de direito
 * autoral. O que muda é o que a ficha diz: se dá para tocar aqui, se está
 * apenas pontuada, e para onde apontar quando alguém quiser mais.
 */

/** O tipo do artigo, em uma palavra que diga o que esperar. */
const ROTULO_DO_ARTIGO: Record<string, string> = {
  AUDITORIA: 'Auditoria',
  PERCURSO: 'Percurso de estudo',
  ENSAIO: 'Ensaio',
};

/** O motivo da pendência, escrito para quem vai resolver à mão. */
const MOTIVO_DA_PENDENCIA: Record<string, string> = {
  OBRA_NAO_ENCONTRADA: 'O compositor foi reconhecido; a obra, n\u00e3o',
  OBRA_AMBIGUA: 'Mais de uma obra casou \u2014 escolher seria adivinhar',
  PESSOA_NAO_ENCONTRADA: 'O nome da fonte n\u00e3o casou com ningu\u00e9m do acervo',
  DADO_INSUFICIENTE: 'A fonte n\u00e3o deu dado suficiente para tentar',
};

export type SecaoDoAcervo =
  | 'OBRAS'
  | 'COMPOSITORES'
  | 'PARTITURAS'
  | 'MOVIMENTOS'
  | 'ANTIGUIDADE'
  | 'LIVROS'
  | 'ARTIGOS'
  /**
   * O QUE CHEGOU DE FORA E AINDA NÃO ACHOU DONO.
   *
   * Mil cento e sessenta e nove partituras cuja obra o catálogo não reconheceu.
   * Elas **não são obras** — mil trezentas e trinta e uma já foram, por falta
   * de uma entidade onde coubessem, e o catálogo passou a afirmar obras que
   * não existiam.
   *
   * A seção existe porque pendência que não aparece é descarte disfarçado: o
   * recurso sumiria da tela e ninguém saberia que o acervo o tem.
   */
  | 'PENDENTES';

export interface FiltroDoAcervo {
  busca?: string;
  eraId?: string;
  regionId?: string;
  movimentoId?: string;
  generoId?: string;
  composerId?: string;
  /** Tonalidade — recorte padrão em catálogo de música. */
  key?: string;
  /** Sub-período: mais fino que a era, como a catalogação de origem distingue. */
  subPeriodo?: string;
  /** Meio: instrumento ou voz. Recorte diferente de gênero. */
  meio?: string;
  /**
   * O instrumento que o COMPOSITOR tocava.
   *
   * Nome próprio de propósito: chamar de `meio` faria o filtro de obra e o de
   * pessoa disputarem a mesma chave, e um recorte responderia pelo outro.
   */
  instrumentoPraticado?: string;
  /** Movimento estético — impressionismo, serialismo. */
  movimento?: string;
  /**
   * A seleção curada da FONTE — e a tela diz de quem é.
   *
   * Mil duzentas e quarenta e cinco recomendadas, quatrocentas e uma
   * populares. Ficaram extraídas e sem uso porque são juízo de terceiro; o
   * erro não era trê-las, era apresentá-las como se fossem nossas.
   */
  selecao?: string;
  /** Licença do arquivo de partitura. */
  licenca?: string;
  /** Situação de direito autoral. */
  situacao?: string;
  /** Só o que a plataforma consegue tocar. */
  somenteTocaveis?: boolean;
  /**
   * SÓ AS OBRAS CUJA PARTITURA O ACERVO SABE ONDE ENCONTRAR.
   *
   * Distinto de `somenteTocaveis`, e a diferença não é sutil: **tocável** é a
   * obra que a plataforma renderiza aqui dentro — são as dezessete montadas
   * nota a nota. **Com partitura** é a obra cuja edição tem endereço: o
   * Conservatório sabe onde ela está e abre o caminho.
   *
   * Os dois números precisam existir separados porque respondem a perguntas
   * diferentes — "o que posso estudar aqui agora" e "de que obra eu consigo a
   * partitura" —, e juntá-los num só faria um dos dois mentir.
   */
  comPartitura?: boolean;
}

/** Uma linha da listagem, já pronta para a tela desenhar. */
export interface ItemDoAcervo {
  id: string;
  secao: SecaoDoAcervo;
  titulo: string;
  /** Compositor de uma obra, datas de um compositor, era de um movimento. */
  linhaDeApoio?: string;
  /** Era, região, gênero — o que situa o item. */
  etiquetas: string[];
  disponibilidade: DisponibilidadeNoConservatorio;
  /** Quantas obras o item reúne. `null` quando não reúne nada. */
  contagem: number | null;

  /**
   * O RETRATO, no próprio card.
   *
   * Ele só aparecia depois de clicar. Uma lista de duzentas e trinta e quatro
   * pessoas sem rosto obriga a abrir uma por uma para reconhecer quem é quem —
   * e o acervo **tem** duzentos e vinte retratos, extraídos e versionados.
   *
   * Ausente quando não há. A tela mostra iniciais, e nunca foto de banco: a
   * aparência de uma pessoa real não se inventa.
   */
  imagemUrl?: string;

  /**
   * A AUTORIA, LIGÁVEL.
   *
   * O card de obra trazia o nome do compositor como texto solto. Se a autoria
   * é a matriz do catálogo — e é —, ela precisa ser **caminho**: da obra para
   * a pessoa, com um clique, sem passar pela ficha da obra.
   */
  autorId?: string;
  autorNome?: string;
  autorImagemUrl?: string;
}

export interface ResumoDoAcervo {
  obras: number;
  compositores: number;
  movimentos: number;
  livros: number;
  tocaveis: number;
  apenasCatalogados: number;
  /**
   * As edicoes que ainda nao acharam obra.
   *
   * Elas sairam da navegacao — arquivo sem obra nao e catalogo, e oferecer
   * uma vitrine deles fazia a tela repetir a mesma lista duas vezes. Mas
   * sumir com o numero seria pior: viraria descarte disfarcado de coisa que
   * a plataforma leu e nao soube onde por.
   *
   * Por isso a fila e **declarada**, e nao navegavel.
   */
  naFilaDeResolucao: number;
  /**
   * OBRAS CUJA PARTITURA TEM ENDEREÇO CONHECIDO, de qualquer fonte.
   *
   * Entra no resumo porque virou card na tela, e card que conta precisa contar
   * de verdade: um número escrito à mão ali envelheceria calado, e este muda a
   * cada rodada de enriquecimento.
   */
  comPartitura: number;
  /**
   * Os registros da Antiguidade.
   *
   * 🔴 Deixaram de ser recorte próprio: Antiguidade é **era**, e não tipo de
   * entidade — o mesmo erro de categoria do Movimento. Eles agora entram como
   * obras de `era_antiguidade` e o filtro de era os alcança sozinho.
   *
   * O número fica no resumo porque é medida do acervo, e porque quem catalogar
   * precisa saber quantos são sem abrir a listagem.
   */
  antiguidade: number;
}

/**
 * O estado de um livro do Conservatório.
 *
 * Os cinco livros EXISTEM — saem dos livretos, que saem dos cursos. O que
 * falta é curadoria editorial, e até que ela aconteça eles aparecem no
 * catálogo **bloqueados, com o motivo escrito**.
 *
 * Aparecer bloqueado é diferente de não aparecer: quem consulta o acervo
 * precisa saber que a plataforma tem material próprio a caminho, e precisa
 * saber por que ainda não abriu.
 */
export interface LivroNoAcervo {
  id: string;
  titulo: string;
  cursoId: string;
  capitulos: number;
  questoes: number;
  liberado: boolean;
  motivo: string;
}

export class AcervoService {
  constructor(private readonly repo: MusicKnowledgeRepository = musicKnowledgeRepository) {}

  /**
   * Os livros do Conservatório, todos bloqueados até a curadoria.
   *
   * O número de capítulos e de questões é **contado** do livreto, e não
   * declarado à mão: um livro que anunciasse "12 capítulos" sem os ter seria
   * a mesma mentira das telas que exibiam número que ninguém apurou.
   */
  public livros(): LivroNoAcervo[] {
    return LIVRETOS_PADRAO.map((l) => ({
      id: l.id,
      titulo: l.titulo,
      cursoId: l.cursoId,
      capitulos: l.capitulos.length,
      questoes: l.capitulos.reduce((a, c) => a + c.questoes.length, 0),
      liberado: false,
      motivo: 'Em breve. O livro existe e está em curadoria editorial antes de abrir.',
    }));
  }

  /**
   * Os sub-períodos presentes no acervo, na ordem cronológica da catalogação.
   *
   * A ordem não é alfabética de propósito: "Early Romantic" vem antes de
   * "Late Romantic", e ordenar por letra os separaria por acaso.
   */
  public async subPeriodosDoAcervo(): Promise<string[]> {
    const ORDEM = [
      'Medieval',
      'Renaissance',
      'Baroque',
      'Classical',
      'Early Romantic',
      'Romantic',
      'Late Romantic',
      'Post-Romantic',
      '20th Century',
      'Post-War',
      '21st Century',
    ];
    const presentes = new Set(
      (await this.repo.listarCompositores())
        .map((c) => c.subPeriodo)
        .filter((s): s is string => Boolean(s))
    );
    return ORDEM.filter((o) => presentes.has(o));
  }

  /** As tonalidades presentes no acervo, em ordem. */
  public async tonalidadesDoAcervo(): Promise<string[]> {
    const obras = await this.repo.listarObras();
    return [...new Set(obras.map((o) => o.key).filter((k): k is string => Boolean(k)))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    );
  }

  /**
   * Os movimentos, com os fundadores resolvidos para o identificador canônico.
   *
   * 🔴 A curadoria nomeia os fundadores com os identificadores do repositório
   * próprio — `bach-johann-sebastian`. A fusão de identidade elegeu o
   * identificador externo, e sem traduzir aqui **nenhum fundador casava**:
   * a ficha de Bach deixava de listar o Contraponto tardio, e o movimento
   * deixava de contar Bach.
   *
   * Some em silêncio, como sempre. A ligação simplesmente não acontecia.
   */
  public movimentos(): MusicalMovement[] {
    return SEED_MOVEMENTS.map((m) => ({
      ...m,
      founderComposerIds: m.founderComposerIds.map(idCanonicoDoCompositor),
    }));
  }

  private combina(texto: string | null | undefined, busca?: string): boolean {
    if (!busca) return true;
    return (texto ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .includes(
        busca
          .normalize('NFD')
          .replace(/[̀-ͯ]/g, '')
          .toLowerCase()
      );
  }

  /**
   * A listagem de uma seção.
   *
   * Todo campo declarado em `FiltroDoAcervo` é aplicado. Filtro que não filtra
   * devolve resultado errado com cara de resultado — já aconteceu uma vez com
   * o gênero do Atlas, que existia no tipo e não existia no corpo.
   */
  /**
   * 🔴 A LISTAGEM SAÍA NA ORDEM EM QUE O ARQUIVO FOI LIDO.
   *
   * Que é a ordem da extração — ou seja, nenhuma ordem. Trinta e uma mil obras
   * numa sequência sem critério fazem a página dois não ter relação com a
   * página um, e tornam impossível saber se algo está no acervo sem percorrer
   * mil quarenta páginas.
   *
   * Ordem alfabética não é enfeite: é o que faz uma lista longa ser
   * consultável. `localeCompare` com `pt-BR` põe acento no lugar certo — sem
   * ele, "Álvares" cai depois de "Zumbi", porque a comparação seria por
   * código de caractere.
   *
   * Ordenar aqui, num lugar só, e não em cada ramo: um ramo esquecido sairia
   * embaralhado e ninguém notaria até alguém procurar algo nele.
   */
  public async listar(
    secao: SecaoDoAcervo,
    filtro: FiltroDoAcervo = {}
  ): Promise<ItemDoAcervo[]> {
    const itens = await this.listarSemOrdem(secao, filtro);

    /**
     * Os ARTIGOS são a exceção, e ela é deliberada: publicação própria se lê
     * do mais recente para o mais antigo, como qualquer periódico. Alfabética
     * ali esconderia o que acabou de sair.
     */
    if (secao === 'ARTIGOS') return itens;

    return [...itens].sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
  }

  private async listarSemOrdem(
    secao: SecaoDoAcervo,
    filtro: FiltroDoAcervo = {}
  ): Promise<ItemDoAcervo[]> {
    if (secao === 'LIVROS') {
      return this.livros()
        .filter((l) => this.combina(l.titulo, filtro.busca))
        .map((l) => ({
          id: l.id,
          secao: 'LIVROS' as const,
          titulo: l.titulo,
          linhaDeApoio: `${l.capitulos} capítulos · ${l.questoes} questões`,
          etiquetas: ['Livro do Conservatório'],
          disponibilidade: { modo: 'SOMENTE_CATALOGO' as const, motivo: l.motivo },
          contagem: l.capitulos,
        }));
    }

    const [compositores, obras] = await Promise.all([
      this.repo.listarCompositores(),
      this.repo.listarObras(),
    ]);

    if (secao === 'MOVIMENTOS') {
      return this.movimentos()
        .filter((m) => !filtro.eraId || m.eraId === filtro.eraId)
        .filter((m) => !filtro.regionId || m.regionIds.includes(filtro.regionId))
        .filter((m) => !filtro.generoId || m.generoIds.includes(filtro.generoId))
        .filter((m) => !filtro.movimentoId || m.id === filtro.movimentoId)
        .filter((m) => this.combina(m.name, filtro.busca) || this.combina(m.description, filtro.busca))
        .map((m) => ({
          id: m.id,
          secao: 'MOVIMENTOS' as const,
          titulo: m.name,
          linhaDeApoio: m.years,
          etiquetas: [m.eraId, ...m.generoIds],
          disponibilidade: {
            modo: 'EXPERIENCIA_COMPLETA' as const,
            motivo: 'Recorte do catálogo. O que se pode fazer depende de cada obra dentro dele.',
          },
          contagem: m.founderComposerIds.length,
        }));
    }

    if (secao === 'ARTIGOS') {
      /**
       * O QUE O CONSERVATÓRIO ESCREVE, e não o que ele cataloga.
       *
       * Artigo não é obra de acervo: é produção própria, assinada, com data. O
       * acervo artístico registra o que **existe no mundo**; a biblioteca
       * oficial registra o que **esta escola produziu**. Misturar os dois faria
       * a contagem do acervo crescer com texto nosso.
       */
      return SEED_ARTICLES.filter(
        (a) => this.combina(a.titulo, filtro.busca) || this.combina(a.resumo, filtro.busca)
      ).map((a) => ({
        id: a.id,
        secao: 'ARTIGOS' as const,
        titulo: a.titulo,
        linhaDeApoio: `${a.autoria} · ${new Date(a.publicadoEm).getFullYear()}`,
        etiquetas: [ROTULO_DO_ARTIGO[a.tipo] ?? a.tipo, ...a.etiquetas],
        disponibilidade: {
          modo: 'EXPERIENCIA_COMPLETA' as const,
          motivo: 'Texto autoral do Conservat\u00f3rio, aberto a quem chega.',
        },
        /** Quantas obras do acervo o artigo percorre — e cada uma com motivo. */
        contagem: a.obras.length,
      }));
    }

    if (secao === 'PARTITURAS') {
      /**
       * 🔴 PARTITURAS E ANTIGUIDADE CAÍAM NO RAMO DAS OBRAS.
       *
       * As duas seções existem no tipo desde sempre e **nunca tiveram caso
       * aqui**. Pedir `PARTITURAS` devolvia as vinte e quatro mil novecentas e
       * cinquenta e sete obras; pedir `ANTIGUIDADE`, as mesmas.
       *
       * Não é um recorte vazio — é o recorte **errado**, servido com a
       * confiança de um certo. As mil trezentas e quarenta e nove partituras e
       * os oito registros da Antiguidade ficaram invisíveis, e quem pedisse por
       * eles recebia outra coisa sem sinal nenhum.
       */
      const todas = await this.partituras(filtro);
      return todas.map((p) => ({
        id: p.id,
        secao: 'PARTITURAS' as const,
        titulo: p.t,
        linhaDeApoio: p.cn,
        etiquetas: [p.i, p.e, p.st].filter((x): x is string => Boolean(x)),
        disponibilidade: {
          /**
           * `SOMENTE_CATALOGO` porque não há leitor de LilyPond nem de MIDI
           * aqui. O arquivo existe e a plataforma só sabe apontar para ele.
           */
          modo: 'SOMENTE_CATALOGO' as const,
          motivo: p.ed
            ? `Edição de ${p.ed}, sob ${p.lic}. A plataforma ainda não renderiza este formato.`
            : `Sob ${p.lic}. A plataforma ainda não renderiza este formato.`,
          linkOficial: { rotulo: 'Mutopia', url: p.ly },
        },
        contagem: null,
      }));
    }

    if (secao === 'ANTIGUIDADE') {
      return this.antiguidade(filtro).map((r) => ({
        id: r.id,
        secao: 'ANTIGUIDADE' as const,
        titulo: r.titulo.pt ?? r.id,
        linhaDeApoio: r.datacao,
        etiquetas: [r.suporte, r.estado, r.natureza],
        disponibilidade: {
          modo:
            r.oferta === 'SOMENTE_FICHA'
              ? ('SOMENTE_CATALOGO' as const)
              : ('EXPERIENCIA_COMPLETA' as const),
          motivo: motivoDaOferta(r),
        },
        contagem: null,
      }));
    }

    if (secao === 'PENDENTES') {
      /**
       * A fila é produzida pela mesma passada que liga o que casou, e por isso
       * exige que as obras tenham sido carregadas antes — o que `listar` já
       * faz acima. Sem isso ela devolveria vazio, e vazio aqui significaria
       * "nada pendente" quando significa "ainda não apurado".
       */
      return partiturasPendentes()
        .filter((r) => this.combina(r.descricaoNaFonte, filtro.busca))
        .map((r) => ({
          id: r.id,
          secao: 'PENDENTES' as const,
          titulo: r.descricaoNaFonte,
          linhaDeApoio: MOTIVO_DA_PENDENCIA[r.motivo],
          etiquetas: [r.fonteId],
          disponibilidade: {
            modo: 'SOMENTE_CATALOGO' as const,
            motivo:
              'O arquivo existe na fonte e ainda n\u00e3o foi ligado a uma obra do cat\u00e1logo. N\u00e3o vira obra nova: seria duplicata com apar\u00eancia de registro.',
          },
          contagem: null,
        }));
    }

    if (secao === 'COMPOSITORES') {
      const movimento = filtro.movimentoId
        ? this.movimentos().find((m) => m.id === filtro.movimentoId)
        : undefined;

      return compositores
        .filter((c) => !filtro.eraId || c.periodIds.includes(filtro.eraId))
        .filter((c) => !filtro.subPeriodo || c.subPeriodo === filtro.subPeriodo)
        .filter((c) => !filtro.regionId || c.regionIds.includes(filtro.regionId))
        .filter((c) => !filtro.composerId || c.id === filtro.composerId)
        /**
         * TODO FILTRO OFERECIDO PRECISA SER APLICADO AQUI.
         *
         * Uma faceta que a tela mostra e a listagem ignora é pior que nenhuma:
         * quem clica vê a contagem mudar no rótulo e o resultado ficar igual, e
         * conclui que o catálogo está quebrado — o que está.
         */
        .filter(
          (c) =>
            !filtro.instrumentoPraticado ||
            (c.instrumentosPraticados ?? []).includes(filtro.instrumentoPraticado)
        )
        .filter((c) => !filtro.movimento || c.movements.includes(filtro.movimento))
        .filter((c) => !movimento || movimento.founderComposerIds.includes(c.id))
        .filter((c) => this.combina(c.canonicalName, filtro.busca))
        .map((c) => this.comoItem(c, obras))
        .filter((i) => !filtro.somenteTocaveis || i.disponibilidade.modo === 'EXPERIENCIA_COMPLETA');
    }

    const movimento = filtro.movimentoId
      ? this.movimentos().find((m) => m.id === filtro.movimentoId)
      : undefined;
    const porId = new Map(compositores.map((c) => [c.id, c]));

    return obras
      .filter((o) => !filtro.eraId || o.periodId === filtro.eraId)
      .filter((o) => !filtro.regionId || o.regionId === filtro.regionId)
      .filter((o) => !filtro.generoId || o.generoId === filtro.generoId)
      .filter((o) => !filtro.meio || o.instrumentation.includes(filtro.meio))
      .filter(
        (o) =>
          !filtro.selecao ||
          (o.selecoesDaFonte ?? []).includes(filtro.selecao as 'RECOMENDADA')
      )
      .filter((o) => !filtro.key || o.key === filtro.key)
      .filter((o) => !filtro.composerId || o.composerIds.includes(filtro.composerId))
      .filter((o) => !movimento || o.composerIds.some((c) => movimento.founderComposerIds.includes(c)))
      .filter(
        (o) =>
          this.combina(textoDe(o.canonicalTitle), filtro.busca) ||
          this.combina(porId.get(o.composerIds[0])?.canonicalName, filtro.busca)
      )
      /**
       * O recorte "com partitura" é aplicado sobre a OBRA, e não sobre o item
       * montado: é a obra que carrega as referências de edição, e o item só
       * carrega o que a tela desenha.
       */
      .filter((o) => !filtro.comPartitura || temPartituraLocalizada(o))
      .map((o) => this.obraComoItem(o, porId))
      .filter((i) => !filtro.somenteTocaveis || i.disponibilidade.modo === 'EXPERIENCIA_COMPLETA');
  }

  private comoItem(c: CanonicalComposer, obras: CanonicalWork[]): ItemDoAcervo {
    const dele = obras.filter((o) => o.composerIds.includes(c.id));
    return {
      id: c.id,
      secao: 'COMPOSITORES',
      titulo: c.canonicalName,
      linhaDeApoio:
        c.birthYear || c.deathYear ? `${c.birthYear ?? '?'} – ${c.deathYear ?? '?'}` : undefined,
      etiquetas: [...c.periodIds, ...c.regionIds],
      disponibilidade: disponibilidadeDoCompositor(c, obras),
      contagem: dele.length,
      imagemUrl: c.portraitUrl,
    };
  }

  private obraComoItem(o: CanonicalWork, porId: Map<string, CanonicalComposer>): ItemDoAcervo {
    return {
      id: o.id,
      secao: 'OBRAS',
      titulo: textoDe(o.canonicalTitle) ?? o.id,
      linhaDeApoio: porId.get(o.composerIds[0])?.canonicalName,
      etiquetas: [o.periodId, o.regionId, o.generoId].filter((x): x is string => Boolean(x)),
      disponibilidade: avaliarDisponibilidade(o),
      contagem: null,
      /** O caminho da obra para quem a fez, sem passar pela ficha dela. */
      autorId: o.composerIds[0],
      autorNome: porId.get(o.composerIds[0])?.canonicalName,
      autorImagemUrl: porId.get(o.composerIds[0])?.portraitUrl,
    };
  }

  /**
   * Os números do acervo, contados.
   *
   * Nenhum declarado à mão. Foi uma tela anunciando "142 obras canônicas"
   * sobre um acervo de zero que motivou metade das verificações do projeto.
   */
  public async resumo(): Promise<ResumoDoAcervo> {
    const [compositores, obras] = await Promise.all([
      this.repo.listarCompositores(),
      this.repo.listarObras(),
    ]);

    const tocaveis = obras.filter(
      (o) => avaliarDisponibilidade(o).modo === 'EXPERIENCIA_COMPLETA'
    ).length;

    return {
      obras: obras.length,
      compositores: compositores.length,
      movimentos: this.movimentos().length,
      livros: this.livros().length,
      tocaveis,
      apenasCatalogados: obras.length - tocaveis,
      /**
       * Contado DEPOIS de `listarObras()`, e nao antes: a fila so existe
       * quando a ligacao entre partitura e obra ja rodou. Ler o numero antes
       * devolveria zero, e zero aqui e a mentira exata que a fila combate.
       */
      naFilaDeResolucao: partiturasPendentes().length,
      /**
       * As obras cuja partitura tem endereço — de qualquer fonte.
       *
       * É o número que virou card, e por isso precisa ser contado e não
       * escrito: um card que conta errado envelhece calado, e este muda a cada
       * rodada de enriquecimento.
       */
      comPartitura: obras.filter(temPartituraLocalizada).length,
      antiguidade: this.antiguidade().length,
    };
  }

  /** As partituras catalogadas, com licença e arquivos declarados. */
  public async partituras(filtro: FiltroDoAcervo = {}): Promise<Partitura[]> {
    const todas = await carregarPartituras();
    return todas
      .filter((p) => !filtro.eraId || p.e === filtro.eraId)
      .filter((p) => !filtro.meio || p.i === filtro.meio)
      .filter((p) => !filtro.licenca || p.lic === filtro.licenca)
      .filter((p) => !filtro.composerId || p.c === filtro.composerId)
      .filter((p) => this.combina(p.t, filtro.busca) || this.combina(p.cn, filtro.busca));
  }

  /**
   * AS FACETAS — cada eixo com a contagem do que devolve.
   *
   * Apuradas sobre o resultado dos DEMAIS filtros, e não sobre o acervo
   * inteiro. Escolher "Barroco" faz a faceta de meio recontar: o que aparece é
   * o que existe de barroco.
   *
   * Opção com zero não é oferecida. Oferecer recorte que devolve vazio é
   * convidar ao beco sem saída.
   */
  public async facetas(secao: SecaoDoAcervo, filtro: FiltroDoAcervo = {}): Promise<Faceta[]> {
    /**
     * 🔴 A ERA VOLTA A TRAZER A DATAÇÃO NO RÓTULO.
     *
     * "Barroco" sozinho exige que quem lê já saiba quando foi o Barroco — e
     * quem está aprendendo história da música é exatamente quem não sabe. O
     * intervalo é a metade útil do rótulo: é ele que transforma um nome de
     * gaveta numa posição no tempo.
     *
     * Vem de `periodYears`, que é o que o Atlas já usa no eixo do tempo. As
     * duas telas passam a dizer a mesma coisa sobre a mesma era, e sem
     * ninguém escrever o intervalo duas vezes.
     */
    const nomeDaEra = (id: string) => {
      const e = DEFAULT_ERAS.find((x) => x.id === id);
      if (!e) return id;
      return e.periodYears ? `${e.name} · ${e.periodYears}` : e.name;
    };
    const nomeDaRegiao = (id: string) => DEFAULT_REGIONS.find((r) => r.id === id)?.name ?? id;
    const nomeDoGenero = (id: string) => DEFAULT_GENRES.find((g) => g.slug === id)?.name ?? id;
    /**
     * A ORDEM CRONOLÓGICA, e não a ordem por contagem.
     *
     * Toda faceta ordena por quantidade — é o certo para uma lista de opções,
     * porque põe na frente o que devolve mais. Era é a exceção: ela tem ordem
     * própria, e ordenar por contagem faria o Renascimento aparecer entre o
     * Moderno e o Romântico.
     *
     * Importa para quem NAVEGA no tempo, e não só para quem escolhe: a tela
     * anda nas eras com duas setas, e as setas seguem esta ordem. É por isso
     * que ela vive aqui, e não na tela — a tela montar a própria lista fixa
     * faria ela oferecer eras que devolvem zero.
     */
    const ordemDasEras = DEFAULT_ERAS.map((e) => e.id);

    if (secao === 'PARTITURAS') {
      const base = await this.partituras({ ...filtro, meio: undefined, licenca: undefined });
      const porEra = await this.partituras({ ...filtro, eraId: undefined });

      return [
        montarFaceta(
          'meio',
          'Instrumento ou voz',
          'Por onde o som sai. É recorte diferente de gênero: existe sonata para piano e sonata para violino.',
          contar(base, (p) => p.i),
          rotuloDoMeio
        ),
        montarFaceta(
          'eraId',
          'Era',
          'Quando a obra foi escrita, no recorte de sete eras do curso.',
          contar(porEra, (p) => p.e),
          nomeDaEra,
          ordemDasEras
        ),
        montarFaceta(
          'licenca',
          'Licença do arquivo',
          'A licença da EDIÇÃO, que é distinta do domínio público da obra. Algumas exigem atribuição.',
          contar(base, (p) => p.lic)
        ),
      ];
    }

    if (secao === 'COMPOSITORES') {
      const base = await this.repo.listarCompositores();

      /**
       * UMA FACETA NÃO SE FILTRA.
       *
       * Este recorte aplicava **todos** os filtros e contava cada eixo sobre o
       * resultado — inclusive o próprio. Escolher "Brasil" fazia o eixo de
       * região mostrar só "Brasil (4)", e trocar de região virava impossível
       * sem limpar o filtro antes.
       *
       * Cada eixo conta sobre o resultado dos **demais**. É mais caro, e é o
       * que faz a busca facetada ser navegável em vez de um beco.
       */
      const semOEixo = (exceto: string) =>
        base
          .filter((c) => exceto === 'eraId' || !filtro.eraId || c.periodIds.includes(filtro.eraId))
          .filter(
            (c) => exceto === 'regionId' || !filtro.regionId || c.regionIds.includes(filtro.regionId)
          )
          .filter(
            (c) => exceto === 'subPeriodo' || !filtro.subPeriodo || c.subPeriodo === filtro.subPeriodo
          )
          .filter(
            (c) =>
              exceto === 'instrumentoPraticado' ||
              !filtro.instrumentoPraticado ||
              (c.instrumentosPraticados ?? []).includes(filtro.instrumentoPraticado)
          )
          .filter(
            (c) => exceto === 'movimento' || !filtro.movimento || c.movements.includes(filtro.movimento)
          )
          .filter(
            (c) =>
              exceto === 'situacao' || !filtro.situacao || c.publicDomain.status === filtro.situacao
          );

      return [
        montarFaceta(
          'eraId',
          'Era',
          'As sete eras do curso. Um compositor aparece em todas em que produziu.',
          contarLista(semOEixo('eraId'), (c) => c.periodIds),
          nomeDaEra,
          ordemDasEras,
          true
        ),
        /**
         * REGIÃO é eixo UNIVERSAL, e por isso ele cobra.
         *
         * Toda pessoa produziu em algum lugar. Este recorte alcançava
         * **catorze de duzentos e trinta e quatro** e era oferecido assim
         * mesmo — quem clicava em "Europa Ocidental (14)" concluía que eram
         * essas as que existiam.
         *
         * Alcança duzentos e trinta agora, derivado da cidadania que a fonte
         * declara.
         */
        montarFaceta(
          'regionId',
          'Regi\u00e3o',
          'Onde o compositor produziu, derivado da cidadania que a fonte declara. Quem foi cidad\u00e3o de dois Estados aparece nos dois.',
          contarLista(semOEixo('regionId'), (c) => c.regionIds),
          nomeDaRegiao,
          undefined,
          true
        ),
        montarFaceta(
          'subPeriodo',
          'Sub-per\u00edodo',
          'Recorte mais fino que a era: separa rom\u00e2ntico inicial de tardio, que \u00e9 a diferen\u00e7a entre duas gera\u00e7\u00f5es.',
          contar(semOEixo('subPeriodo'), (c) => c.subPeriodo),
          (id) => id,
          ORDEM_DOS_SUBPERIODOS,
          true
        ),
        /**
         * O INSTRUMENTO QUE A PESSOA TOCAVA — e não o meio para que escreveu.
         *
         * Responde a uma pergunta que o aluno faz de verdade e que nenhum
         * outro campo responde: "quem tocava o meu instrumento". Confundi-lo
         * com o meio da obra faria Berlioz — violonista e flautista que
         * escreveu para orquestra inteira — aparecer no lugar errado.
         *
         * Eixo SELETIVO: a fonte não declara o instrumento de todo mundo, e
         * preencher o que falta seria inventar biografia.
         */
        montarFaceta(
          'instrumentoPraticado',
          'Instrumento que tocava',
          'O que a pessoa tocava, e n\u00e3o o meio para que escreveu. S\u00e3o eixos diferentes: Berlioz era violonista e escreveu para orquestra.',
          contarLista(semOEixo('instrumentoPraticado'), (c) => c.instrumentosPraticados ?? [])
        ),
        montarFaceta(
          'movimento',
          'Movimento est\u00e9tico',
          'A corrente a que o compositor se filia \u2014 impressionismo, serialismo. A maior parte n\u00e3o pertence a movimento nomeado, e isso \u00e9 a realidade, e n\u00e3o lacuna.',
          contarLista(semOEixo('movimento'), (c) => c.movements)
        ),
        montarFaceta(
          'situacao',
          'Situa\u00e7\u00e3o de direito autoral',
          'Decide o que a plataforma pode oferecer \u2014 e n\u00e3o o que ela cataloga. Tudo entra no acervo.',
          contar(semOEixo('situacao'), (c) => c.publicDomain.status),
          (id) => ROTULO_DA_SITUACAO[id] ?? id,
          undefined,
          true
        ),
      ];
    }

    const obras = await this.repo.listarObras();

    /** Mesma regra: cada eixo conta sobre o resultado dos demais, e não do seu. */
    const semOEixo = (exceto: string) =>
      obras
        .filter((o) => exceto === 'eraId' || !filtro.eraId || o.periodId === filtro.eraId)
        .filter((o) => exceto === 'regionId' || !filtro.regionId || o.regionId === filtro.regionId)
        .filter((o) => exceto === 'generoId' || !filtro.generoId || o.generoId === filtro.generoId)
        .filter(
          (o) => exceto === 'meio' || !filtro.meio || o.instrumentation.includes(filtro.meio)
        )
        .filter(
          (o) =>
            exceto === 'selecao' ||
            !filtro.selecao ||
            (o.selecoesDaFonte ?? []).includes(filtro.selecao as 'RECOMENDADA')
        )
        .filter((o) => exceto === 'key' || !filtro.key || o.key === filtro.key);

    const [meioAmplo, instrumentoExato] = separarPorNivel(
      contarLista(semOEixo('meio'), (o) => o.instrumentation)
    );

    return [
      montarFaceta(
        'eraId',
        'Era',
        'Quando a obra foi escrita, no recorte de sete eras do curso.',
        contar(semOEixo('eraId'), (o) => o.periodId),
        nomeDaEra,
        ordemDasEras,
        true
      ),
      /**
       * MEIO em DOIS níveis, e não num só.
       *
       * A catalogação de origem classifica grosso: sabe dizer "teclado" para
       * vinte e cinco mil obras, e não sabe dizer "cravo". A partitura
       * classifica fino: quem transcreveu escreveu para que instrumento.
       *
       * Numa faceta só, "Teclado (5.286)" apareceria ao lado de "Piano (685)"
       * como se fossem irmãos, e não são — um contém o outro. São duas
       * perguntas diferentes: "o que há de teclado" e "o que há com edição
       * para piano".
       */
      montarFaceta(
        'meio',
        'Meio',
        'A família por onde o som sai — teclado, orquestra, câmara, voz. Varre o acervo inteiro. Uma obra para piano também é de teclado, e aparece aqui.',
        meioAmplo,
        rotuloDoMeio,
        undefined,
        true
      ),
      montarFaceta(
        'meio',
        'Instrumento da edição',
        'O instrumento EXATO que a partitura declara. Só existe onde há edição — filtrar por aqui é pedir o que tem arquivo.',
        instrumentoExato,
        rotuloDoMeio
      ),
      montarFaceta(
        'generoId',
        'Gênero',
        'A FORMA da obra — missa, fuga, minueto. Responde "como ela se organiza", e não "por onde sai o som".',
        contar(semOEixo('generoId'), (o) => o.generoId),
        nomeDoGenero
      ),
      montarFaceta(
        'regionId',
        'Região',
        'Onde a obra se situa, herdado do compositor.',
        contar(semOEixo('regionId'), (o) => o.regionId),
        nomeDaRegiao,
        undefined,
        true
      ),
      /**
       * AS SELEÇÕES DA FONTE, e o rótulo nomeia de quem são.
       *
       * Num acervo de vinte e cinco mil obras, uma seleção de entrada é
       * exatamente o que quem chega procura. O que não pode é apresentar o
       * juízo de outro como se fosse o nosso.
       */
      montarFaceta(
        'selecao',
        'Seleção do catálogo de origem',
        'Listas curadas por quem catalogou a fonte, e não pelo Conservatório. NÃO são "os mais tocados" nem "os principais" — ninguém aqui apurou isso.',
        contarLista(semOEixo('selecao'), (o) => o.selecoesDaFonte ?? []),
        /**
         * O RÓTULO NOMEIA DE QUEM É, e isso não é excesso de escrúpulo.
         *
         * "Populares" sozinho lê-se como *os mais tocados* — uma apuração que
         * ninguém fez aqui. "Recomendadas" sozinho lê-se como *os principais*.
         * As duas listas são recorte editorial da fonte, e o rótulo precisa
         * carregar isso junto do número.
         *
         * É a mesma regra que impediu `recommended` de virar um filtro chamado
         * "descendência": rótulo não pode afirmar relação que o dado não carrega.
         */
        (id) =>
          id === 'RECOMENDADA'
            ? 'Recomendadas pela fonte'
            : 'Em destaque no catálogo de origem'
      ),
      montarFaceta(
        'key',
        'Tonalidade',
        'Entra no título por convenção e distingue homônimos: há mais de uma Sonata em dó maior.',
        contar(semOEixo('key'), (o) => o.key)
      ),
    ];
  }

  /**
   * Os artigos inteiros, para a vitrine da biblioteca.
   *
   * `listar('ARTIGOS')` devolve a forma achatada de listagem — título, etiqueta,
   * contagem. A vitrine precisa do que convence alguém a abrir: subtítulo,
   * resumo, quem assina e quando saiu.
   *
   * São duas leituras da mesma coisa, e não duas fontes: as duas saem de
   * `SEED_ARTICLES`.
   */
  public artigos(): ArtigoDoConservatorio[] {
    return [...SEED_ARTICLES].sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm));
  }

  /**
   * O catálogo servido chegou?
   *
   * Devolve o motivo quando não chegou, e `null` quando está tudo lá. A tela
   * precisa da diferença entre "o acervo está vazio" e "o acervo está
   * inalcançável" — são coisas diferentes, e só uma delas é culpa do acervo.
   */
  public falhaDeCarga(): string | null {
    return falhaAoCarregarOAcervo();
  }

  /**
   * A PRODUÇÃO DO CONSERVATÓRIO, contada por tipo.
   *
   * É o que alimenta os cartões do topo da biblioteca oficial. Cada número é
   * **contado**, e nenhum é escrito à mão — foi uma tela anunciando "142 obras
   * canônicas" sobre um acervo de zero que motivou metade das verificações
   * deste projeto.
   *
   * O que está fechado aparece com a contagem de qualquer jeito: esconder o
   * que existe e ainda não abriu daria a impressão de que a escola produziu
   * menos do que produziu.
   */
  public producaoDoConservatorio(): Array<{
    id: SecaoDoAcervo;
    rotulo: string;
    descricao: string;
    total: number;
    disponiveis: number;
  }> {
    const livros = this.livros();

    return [
      {
        id: 'LIVROS',
        rotulo: 'Biblioteca oficial',
        descricao:
          'Os livros do Conservat\u00f3rio \u2014 cada um escrito para um curso, com cap\u00edtulos e quest\u00f5es contados do pr\u00f3prio material.',
        total: livros.length,
        disponiveis: livros.filter((l) => l.liberado).length,
      },
      {
        id: 'ARTIGOS',
        rotulo: 'Artigos publicados',
        descricao:
          'Texto autoral assinado: auditoria do pr\u00f3prio acervo, percurso de estudo, ensaio. Toda obra citada explica por que est\u00e1 ali.',
        total: SEED_ARTICLES.length,
        disponiveis: SEED_ARTICLES.length,
      },
    ];
  }

  /** Os registros da Antiguidade — outro tipo de ficha, outra era. */
  public antiguidade(filtro: FiltroDoAcervo = {}) {
    return REGISTROS_DA_ANTIGUIDADE.filter(
      (r) => this.combina(r.titulo.pt, filtro.busca) || this.combina(r.descricao, filtro.busca)
    );
  }

  /**
   * A ficha de um compositor: quem foi, e o compêndio inteiro dele.
   *
   * O compêndio vem COMPLETO — sem recorte de disponibilidade. Um catálogo
   * que listasse só o que toca esconderia metade da obra de quem consulta, e
   * saber que a peça existe já é parte do que se veio buscar.
   */
  public async fichaDoCompositor(id: string): Promise<{
    compositor: CanonicalComposer;
    obras: CanonicalWork[];
    movimentos: MusicalMovement[];
    disponibilidade: DisponibilidadeNoConservatorio;
  } | null> {
    /**
     * O IDENTIFICADOR ANTIGO CONTINUA CHEGANDO.
     *
     * Nove compositores viviam duplicados entre as duas fontes —
     * `bach-johann-sebastian` e `johann-sebastian-bach` eram o mesmo Bach —, e
     * a fusão escolheu o identificador externo, que é para onde as vinte e
     * cinco mil obras apontam.
     *
     * Um link salvo com o identificador antigo não pode virar "não encontrado":
     * a pessoa existe, e a página existe. O apelido resolve.
     */
    /**
     * O catálogo é montado ANTES de resolver o apelido.
     *
     * O mapa de apelidos nasce durante a fusão dos compositores, e resolver
     * antes disso consultava um mapa vazio: o identificador antigo devolvia
     * "não encontrado" mesmo com a pessoa no acervo. Ordem importa aqui.
     */
    await this.repo.listarCompositores();

    /**
     * Resolvido UMA vez, e usado em tudo.
     *
     * A primeira correção resolveu só o compositor e deixou o filtro de obras
     * com o identificador cru da rota — abrir pelo apelido antigo achava a
     * pessoa e mostrava **zero obras**, que é pior que não achar: a ficha
     * afirmava um compêndio vazio sobre quem tem novecentas e setenta e oito.
     */
    const canonico = idCanonicoDoCompositor(id);

    const compositor = await this.repo.compositorPorId(canonico);
    if (!compositor) return null;

    const todas = await this.repo.listarObras();

    /**
     * O compêndio sai em ordem alfabética.
     *
     * Bach tem 978 obras e elas saíam na ordem em que o arquivo foi lido — que
     * é a ordem da extração, ou seja, nenhuma. Num compêndio desse tamanho,
     * sem ordem, não dá para saber se uma peça está lá sem ler as 978.
     *
     * `localeCompare` com `pt-BR` põe o acento no lugar: sem ele a comparação
     * é por código de caractere, e "Ária" cai depois de "Wachet auf".
     */
    const dele = todas
      .filter((o) => o.composerIds.includes(canonico))
      .sort((a, b) =>
        (textoDe(a.canonicalTitle) ?? '').localeCompare(textoDe(b.canonicalTitle) ?? '', 'pt-BR')
      );

    return {
      compositor,
      obras: dele,
      movimentos: this.movimentos()
        .filter((m) => m.founderComposerIds.includes(canonico))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
      disponibilidade: disponibilidadeDoCompositor(compositor, todas),
    };
  }

  /**
   * 🔴 VÁRIAS OBRAS DE UMA VEZ, e não uma chamada por obra.
   *
   * A tela do artigo buscava as obras citadas com `fichaDaObra` num laço —
   * vinte e duas chamadas, e cada uma percorre as 31.952 obras procurando um
   * identificador. Setecentas mil comparações para montar uma lista de vinte e
   * duas linhas, e a tela levava dezenas de segundos para chegar ao estado
   * final.
   *
   * Uma passada, um índice, e a busca vira consulta a mapa. O ganho não é de
   * elegância: é a diferença entre a tela abrir e a tela parecer travada.
   */
  public async obrasPorIds(ids: string[]): Promise<Map<string, CanonicalWork>> {
    const procurados = new Set(ids);
    const todas = await this.repo.listarObras();

    return new Map(todas.filter((o) => procurados.has(o.id)).map((o) => [o.id, o]));
  }

  /**
   * Os compositores do catálogo.
   *
   * A tela do artigo precisa deles para transformar identificador em nome
   * ligável — e sem este método ela alcançaria o repositório por fora, que é
   * como uma tela passa a conhecer a forma de armazenamento.
   */
  public async compositores(): Promise<CanonicalComposer[]> {
    return this.repo.listarCompositores();
  }

  /** A ficha completa de uma obra, para a tela de detalhe. */
  public async fichaDaObra(id: string): Promise<{
    obra: CanonicalWork;
    compositor: CanonicalComposer | null;
    disponibilidade: DisponibilidadeNoConservatorio;
  } | null> {
    const obra = await this.repo.obraPorId(id);
    if (!obra) return null;

    return {
      obra,
      compositor: await this.repo.compositorPorId(obra.composerIds[0]),
      disponibilidade: avaliarDisponibilidade(obra),
    };
  }

  /**
   * A transcrição própria que dá som e escrita à obra, ou nenhuma.
   *
   * A obra guarda o id da faixa na referência NATIVA. A ficha da obra e a
   * tela de partitura perguntam aqui — antes a ficha fazia a conta sozinha, e
   * a partitura não fazia conta nenhuma.
   */
  public faixaDaObra(obra: Pick<CanonicalWork, 'scoreRefs'>): FaixaDoPlayer | null {
    const ref = obra.scoreRefs.find((r) => r.render === 'NATIVA')?.sourceRef;
    return REPERTORIO_DO_PLAYER.find((f) => f.id === ref) ?? null;
  }

  /** O repertório que a pauta desenha: toda faixa com escrita. */
  public repertorioComPartitura(): FaixaDoPlayer[] {
    return REPERTORIO_DO_PLAYER.filter((f) => f.escrita.some(([n]) => n !== '_'));
  }
}

export const acervoService = new AcervoService();
