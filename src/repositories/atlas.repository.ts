import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import { MusicalEra, AtlasWorkPlacement } from '../domain/gamification';
import { House } from '../domain/house';
import {
  DEFAULT_ERAS,
  DEFAULT_REGIONS,
  DEFAULT_GENRES,
  DEFAULT_WORKS,
  Region,
  Genre,
} from '../data/seed-atlas';
import { DEFAULT_HOUSES } from '../data/seed-houses';

/**
 * O Atlas.
 *
 * POR QUE ESTE REPOSITÓRIO EXISTE
 * -------------------------------
 * `MusicalEra`, `MusicalWorld`, `Tribo` e `AtlasWorkPlacement` estavam no
 * domínio desde o começo, e **nenhuma tela os consumia**. A tela
 * do Atlas, em paralelo, trazia cinco eras escritas dentro do próprio
 * arquivo, com contagens de obra inventadas — "142 obras canônicas" numa
 * plataforma sem acervo de obras.
 *
 * O domínio estava certo e a tela passava ao largo dele.
 *
 * A REGRA QUE SEPARA AS DUAS COISAS
 * ---------------------------------
 * **Taxonomia é conhecimento; contagem é medição.**
 *
 * Que o Barroco vai de cerca de 1600 a 1750 é o que o curso de História
 * ensina, capítulo por capítulo — declarar isso é catalogar. Quantas obras
 * do Barroco a plataforma tem é uma pergunta sobre o acervo, e a resposta se
 * conta, nunca se digita.
 *
 * Por isso `contarObras()` conta. Enquanto o acervo estiver vazio, devolve
 * zero — e zero é a informação correta.
 */
export interface AtlasRepository {
  listarEras(): Promise<MusicalEra[]>;
  eraPorSlug(slug: string): Promise<MusicalEra | null>;

  listarRegioes(): Promise<Region[]>;
  regiaoPorSlug(slug: string): Promise<Region | null>;

  listarGeneros(): Promise<Genre[]>;
  listarCasas(): Promise<House[]>;

  /** Obras do acervo, opcionalmente filtradas pelos eixos. */
  listarObras(filtro?: AtlasFilter): Promise<AtlasWorkPlacement[]>;
  /** Quantas obras respondem ao filtro. **Contado**, nunca declarado. */
  countWorks(filtro?: AtlasFilter): Promise<number>;
  salvarObra(obra: AtlasWorkPlacement): Promise<AtlasWorkPlacement>;
}

/**
 * Filtro pelos três eixos, mais a faceta de gênero.
 *
 * Os três eixos se cruzam: era diz *quando*, região diz *onde*, tribo diz
 * *com quem* — qual população nichada produziu ou pratica. Gênero não é
 * eixo: refina o resultado dentro do cruzamento.
 */
/**
 * Os cinco recortes do Atlas.
 *
 * Todo campo declarado aqui e APLICADO em `listarObras`. Parece obvio, e nao
 * era: `genreId` viveu aqui sem campo correspondente na obra e sem linha de
 * filtro nenhuma. Quem filtrasse por genero recebia a lista inteira, sem
 * nenhum sinal de que o recorte tinha sido ignorado.
 *
 * `checkAtlasFilterIsApplied` recusa que isso volte.
 */
export interface AtlasFilter {
  eraId?: string;
  regionId?: string;
  houseId?: string;
  generoId?: string;
  composerId?: string;
}

export class PersistentAtlasRepository implements AtlasRepository {
  private storage: LocalStorageAdapter;

  private readonly CHAVES = {
    /** Acervo de obras. Conteúdo publicado — a publicação pode reescrevê-lo. */
    OBRAS: 'amd_atlas_works_v1',
  };

  private readonly semear: boolean;

  constructor(storage: LocalStorageAdapter = new LocalStorageAdapter(), semear = true) {
    this.storage = storage;
    this.semear = semear;
  }

  public async listarEras(): Promise<MusicalEra[]> {
    return [...DEFAULT_ERAS].sort((a, b) => a.order - b.order);
  }

  public async eraPorSlug(slug: string): Promise<MusicalEra | null> {
    return DEFAULT_ERAS.find((e) => e.slug === slug || e.id === slug) ?? null;
  }

  public async listarRegioes(): Promise<Region[]> {
    return [...DEFAULT_REGIONS].sort((a, b) => a.order - b.order);
  }

  public async regiaoPorSlug(slug: string): Promise<Region | null> {
    return DEFAULT_REGIONS.find((r) => r.slug === slug || r.id === slug) ?? null;
  }

  public async listarGeneros(): Promise<Genre[]> {
    return [...DEFAULT_GENRES].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  /**
   * Tribos — a população nichada.
   *
   * Vêm do catálogo, com o status que cada uma tem de verdade. A dos
   * violinistas e a dos historiadores estão `EM_PREPARO`: o corpus existe,
   * a progressão não. As demais estão `ANUNCIADA`, e a lista as mostra
   * fechadas, com o motivo — nunca preenchidas com conteúdo inventado para
   * a tela não parecer vazia.
   */
  public async listarCasas(): Promise<House[]> {
    return DEFAULT_HOUSES;
  }

  /**
   * O acervo do mapa sai de `DEFAULT_WORKS`, que por sua vez sai do acervo
   * canônico.
   *
   * Isto **nunca aconteceu** antes, e não por descuido: `DEFAULT_WORKS` era
   * `never[] = []`, e semear de uma lista vazia é o mesmo que não semear. Com
   * a lista derivando do acervo, passou a haver o que semear — e a tela do
   * Atlas, que lia zero enquanto o acervo tinha dezessete obras, passa a ver
   * as dezessete.
   *
   * Conferido na LEITURA, e não no construtor: quem limpa os dados do site com
   * a aba aberta continuaria com o mapa vazio até recarregar.
   */
  private obras(): AtlasWorkPlacement[] {
    const guardadas = this.storage.get<AtlasWorkPlacement[]>(this.CHAVES.OBRAS);
    if (guardadas) return guardadas;
    if (!this.semear) return [];

    this.storage.set(this.CHAVES.OBRAS, DEFAULT_WORKS);
    return DEFAULT_WORKS;
  }

  public async listarObras(filtro: AtlasFilter = {}): Promise<AtlasWorkPlacement[]> {
    return this.obras().filter(
      (o) =>
        (!filtro.eraId || o.eraId === filtro.eraId) &&
        (!filtro.regionId || o.regionId === filtro.regionId) &&
        (!filtro.houseId || o.houseId === filtro.houseId) &&
        (!filtro.generoId || o.generoId === filtro.generoId) &&
        (!filtro.composerId || o.composerId === filtro.composerId)
    );
  }

  public async countWorks(filtro: AtlasFilter = {}): Promise<number> {
    return (await this.listarObras(filtro)).length;
  }

  public async salvarObra(obra: AtlasWorkPlacement): Promise<AtlasWorkPlacement> {
    const atuais = this.obras();
    const i = atuais.findIndex((o) => o.workId === obra.workId);
    if (i >= 0) atuais[i] = obra;
    else atuais.push(obra);
    this.storage.set(this.CHAVES.OBRAS, atuais);
    return obra;
  }
}

export const atlasRepository: AtlasRepository = new PersistentAtlasRepository();
