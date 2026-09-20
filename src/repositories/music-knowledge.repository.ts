import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import { CanonicalComposer, CanonicalWork } from '../domain/music-knowledge';
import {
  falhaAoCarregarOAcervo,
  todasAsObras,
  todosOsCompositores,
} from '../data/acervo-unificado';

/**
 * O ACERVO CANÔNICO, GUARDADO.
 *
 * TRÊS CATEGORIAS QUE NUNCA SE MISTURAM
 * -------------------------------------
 * Compositor e obra são **conteúdo publicado**: republicar pode reescrevê-los,
 * e ninguém perde nada com isso. Não são dado de aluno e não são trabalho
 * editorial. É por isso que vivem em chave própria, separada de progresso e
 * de rascunho — a separação é o que permite publicar sem medo.
 *
 * O CACHE É POR FONTE, E TEM PRAZO
 * --------------------------------
 * Consultar o Wikidata a cada abertura de tela seria mau uso do serviço de
 * quem o mantém de graça, e deixaria o Atlas refém da rede. O cache guarda a
 * resposta com hora; passado o prazo, pergunta de novo.
 *
 * O prazo é longo de propósito: data de morte de compositor barroco não muda.
 * O que muda é a catalogação, e um mês é tempo de sobra para isso.
 *
 * SEM BANCO DE DADOS, COMO O RESTO DO PRODUTO
 * -------------------------------------------
 * `localStorage` com cópia em JSON para o Drive. Um acervo grande cabe: são
 * fichas de texto, não arquivos. As partituras e os áudios continuam nas
 * fontes que autorizam redistribuição, e o que se guarda aqui é a referência
 * com a licença declarada.
 */

/** Um mês. Catalogação muda devagar; data de morte não muda. */
export const PRAZO_DO_CACHE_MS = 30 * 24 * 60 * 60 * 1000;

interface CacheEntry<T> {
  em: string;
  dado: T;
}

export interface MusicKnowledgeRepository {
  listarCompositores(): Promise<CanonicalComposer[]>;
  compositorPorId(id: string): Promise<CanonicalComposer | null>;
  /** Acha pelo identificador de QUALQUER fonte — é como se evita duplicar. */
  compositorPorExterno(fonte: string, id: string): Promise<CanonicalComposer | null>;
  salvarCompositor(c: CanonicalComposer): Promise<CanonicalComposer>;

  listarObras(filtro?: FiltroDeObra): Promise<CanonicalWork[]>;
  obraPorId(id: string): Promise<CanonicalWork | null>;
  salvarObra(o: CanonicalWork): Promise<CanonicalWork>;

  /** Resposta de fonte externa, guardada com hora. `null` quando venceu. */
  lerCache<T>(chave: string): Promise<T | null>;
  gravarCache<T>(chave: string, dado: T): Promise<void>;
}

export interface FiltroDeObra {
  composerId?: string;
  periodId?: string;
  regionId?: string;
  generoId?: string;
  /** Tonalidade — recorte padrao em catalogo de musica. */
  key?: string;
  /** Só as que a plataforma consegue renderizar. */
  comEdicaoNativa?: boolean;
}

export class PersistentMusicKnowledgeRepository implements MusicKnowledgeRepository {
  private readonly CHAVES = {
    /** Conteúdo publicado: a publicação pode reescrever. */
    COMPOSITORES: 'amd_acervo_compositores_v1',
    OBRAS: 'amd_acervo_obras_v1',
    /** Cache de fonte externa. Descartável por definição. */
    CACHE: 'amd_acervo_cache_v1',
    /**
     * A assinatura do catálogo que gerou o que está guardado.
     *
     * Sem ela, uma correção de dado nunca alcança quem já abriu a tela.
     */
    ASSINATURA: 'amd_acervo_assinatura_v1',
  };

  constructor(
    private storage: LocalStorageAdapter = new LocalStorageAdapter(),
    private readonly prazoMs: number = PRAZO_DO_CACHE_MS,
    private readonly semear = true
  ) {}


  /**
   * A semente é conferida na LEITURA, e não só ao construir.
   *
   * Semear apenas no construtor deixava o acervo frágil de um jeito real:
   * quem limpasse os dados do site com a aba aberta ficava com o catálogo
   * vazio **para sempre**, porque o repositório já tinha nascido e ninguém o
   * constrói de novo sem recarregar a página.
   *
   * Conferir na leitura custa uma checagem de chave e torna o catálogo
   * reconstruível. Quem passa `semear: false` — os testes de ingestão —
   * continua com o repositório vazio, que é o que eles precisam.
   */
  /**
   * 🔴 O RETRATO GUARDADO ENVELHECIA PARA SEMPRE.
   *
   * Este método gravava a semente na primeira leitura e passava a ler de lá
   * **sem nunca mais conferir**. Funcionou enquanto o catálogo não mudou; no
   * dia em que mudou, quem já tinha aberto a tela ficou com o retrato antigo:
   *
   *   sem região — o filtro geográfico devolvia vazio;
   *   sem local de nascimento e sem instrumento praticado;
   *   com as **três identidades trocadas** que já foram corrigidas na origem;
   *   e, o pior, com identificadores que não casavam mais com as obras — o que
   *   faz **todo compositor aparecer com zero obras**.
   *
   * Nada disso dá sinal. A tela abre, lista duzentas e trinta e quatro pessoas,
   * e cada uma mente sobre si. Correr o seed de novo não alcança ninguém que já
   * tenha o retrato velho.
   *
   * A CORREÇÃO É CARIMBAR A VERSÃO DO CATÁLOGO
   * ------------------------------------------
   * O que está guardado traz a assinatura do catálogo que o gerou. Assinatura
   * diferente descarta e ressemeia. É barato — uma comparação de cadeia — e
   * é a única forma de uma correção de dado chegar a quem já usa a plataforma.
   *
   * A assinatura não é um número escrito à mão: é **derivada do próprio
   * conteúdo**. Número à mão se esquece de incrementar, e o defeito volta
   * calado.
   */
  private assinaturaDoCatalogo(semente: CanonicalComposer[]): string {
    const primeiro = semente[0];
    const ultimo = semente[semente.length - 1];
    /**
     * Quantos, quem abre, quem fecha, e se a região foi apurada. São os quatro
     * eixos que mudaram de verdade até aqui, e qualquer um deles mudando
     * significa que o retrato guardado ficou velho.
     */
    return [
      semente.length,
      primeiro?.id ?? '-',
      ultimo?.id ?? '-',
      semente.filter((c) => c.regionIds.length > 0).length,
      semente.filter((c) => c.birthPlace).length,
    ].join('|');
  }

  private compositores(): CanonicalComposer[] {
    if (!this.semear) {
      return this.storage.get<CanonicalComposer[]>(this.CHAVES.COMPOSITORES) ?? [];
    }

    const semente = todosOsCompositores();
    const assinatura = this.assinaturaDoCatalogo(semente);
    const guardados = this.storage.get<CanonicalComposer[]>(this.CHAVES.COMPOSITORES);
    const assinaturaGuardada = this.storage.get<string>(this.CHAVES.ASSINATURA);

    if (guardados && assinaturaGuardada === assinatura) return guardados;

    this.storage.set(this.CHAVES.COMPOSITORES, semente);
    this.storage.set(this.CHAVES.ASSINATURA, assinatura);
    return semente;
  }

  /**
   * As obras vêm do arquivo servido, e por isso a leitura é assíncrona.
   *
   * Guardar as vinte e cinco mil em `localStorage` estouraria a cota do
   * navegador — são cinco megabytes, e o limite costuma ser cinco. Fica em
   * memória de processo: buscar de novo custa um pedido, e o arquivo é
   * versionado junto do código.
   */
  private obrasCarregadas: CanonicalWork[] | null = null;

  private async obras(): Promise<CanonicalWork[]> {
    if (this.obrasCarregadas) return this.obrasCarregadas;
    if (!this.semear) return [];

    const lidas = await todasAsObras();

    /**
     * 🔴 O RESULTADO DEGRADADO NÃO FICA GUARDADO.
     *
     * Aqui havia `this.obrasCarregadas = await todasAsObras()` sem conferir
     * nada. Quando o arquivo servido não chegava, `todasAsObras` devolvia
     * apenas o repertório próprio — **dezessete obras** —, e esse resultado
     * era guardado **como se fosse o catálogo**.
     *
     * A partir dali, toda leitura da sessão devolvia dezessete sem sequer
     * tentar de novo. Uma recusa de um instante virava permanente: recarregar
     * a tela não adiantava, trocar de seção não adiantava, e nada dizia por
     * quê. Foi assim que o acervo "sumiu".
     *
     * Falha não se guarda. A próxima leitura tenta outra vez.
     */
    if (falhaAoCarregarOAcervo()) return lidas;

    this.obrasCarregadas = lidas;
    return this.obrasCarregadas;
  }

  public async listarCompositores(): Promise<CanonicalComposer[]> {
    return [...this.compositores()].sort((a, b) => a.sortName.localeCompare(b.sortName, 'pt-BR'));
  }

  public async compositorPorId(id: string): Promise<CanonicalComposer | null> {
    return this.compositores().find((c) => c.id === id) ?? null;
  }

  /**
   * Buscar pelo identificador externo é o que impede o acervo de duplicar.
   *
   * O mesmo Bach chega pelo Wikidata numa consulta e pelo Open Opus noutra.
   * Sem esta busca, cada ingestão criaria um Bach novo, e o Atlas passaria a
   * ter três — todos com metade das obras.
   */
  public async compositorPorExterno(fonte: string, id: string): Promise<CanonicalComposer | null> {
    return (
      this.compositores().find(
        (c) => (c.externalIds as Record<string, string | undefined>)[fonte] === id
      ) ?? null
    );
  }

  public async salvarCompositor(c: CanonicalComposer): Promise<CanonicalComposer> {
    const outros = this.compositores().filter((x) => x.id !== c.id);
    this.storage.set(this.CHAVES.COMPOSITORES, [...outros, c]);
    return c;
  }

  public async listarObras(filtro: FiltroDeObra = {}): Promise<CanonicalWork[]> {
    /**
     * TODO CAMPO DECLARADO NO FILTRO É APLICADO AQUI.
     *
     * `AtlasFilter` já teve um campo declarado e nunca aplicado: quem
     * filtrasse por gênero recebia a lista inteira, sem nenhum sinal de que o
     * recorte tinha sido ignorado. Filtro que não filtra é pior que filtro
     * ausente, porque devolve resultado errado com cara de resultado.
     */
    const obras = await this.obras();
    return obras.filter(
      (o) =>
        (!filtro.composerId || o.composerIds.includes(filtro.composerId)) &&
        (!filtro.periodId || o.periodId === filtro.periodId) &&
        (!filtro.regionId || o.regionId === filtro.regionId) &&
        (!filtro.generoId || o.generoId === filtro.generoId) &&
        (!filtro.key || o.key === filtro.key) &&
        (!filtro.comEdicaoNativa || o.scoreRefs.some((r) => r.render === 'NATIVA'))
    );
  }

  public async obraPorId(id: string): Promise<CanonicalWork | null> {
    return (await this.obras()).find((o) => o.id === id) ?? null;
  }

  /**
   * Gravar uma obra a acrescenta ao que está em memória.
   *
   * O catálogo servido é imutável — ele vem do arquivo versionado. O que se
   * grava aqui é a curadoria de quem corrige: entra na lista e sobrevive
   * enquanto a aba viver. Persistir vinte e cinco mil registros a cada
   * correção estouraria a cota do navegador.
   */
  public async salvarObra(o: CanonicalWork): Promise<CanonicalWork> {
    const atuais = await this.obras();
    this.obrasCarregadas = [...atuais.filter((x) => x.id !== o.id), o];
    return o;
  }

  private cache(): Record<string, CacheEntry<unknown>> {
    return this.storage.get<Record<string, CacheEntry<unknown>>>(this.CHAVES.CACHE) ?? {};
  }

  public async lerCache<T>(chave: string): Promise<T | null> {
    const e = this.cache()[chave];
    if (!e) return null;

    const idade = Date.now() - new Date(e.em).getTime();
    /**
     * Vencido devolve `null`, e não o dado velho com um aviso.
     *
     * "Velho porém disponível" obrigaria cada chamador a decidir se aceita —
     * e algum deles esqueceria. `null` significa "pergunte de novo", e é uma
     * instrução, não uma opinião.
     */
    return idade > this.prazoMs ? null : (e.dado as T);
  }

  public async gravarCache<T>(chave: string, dado: T): Promise<void> {
    this.storage.set(this.CHAVES.CACHE, {
      ...this.cache(),
      [chave]: { em: new Date().toISOString(), dado },
    });
  }
}

export const musicKnowledgeRepository: MusicKnowledgeRepository =
  new PersistentMusicKnowledgeRepository();
