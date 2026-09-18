import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import { MusicalEra, AtlasWorkPlacement } from '../domain/gamification';
import { Tribe } from '../domain/tribe';
import {
  ERAS_PADRAO,
  REGIOES_PADRAO,
  GENEROS_PADRAO,
  Regiao,
  Genero,
} from '../data/seed-atlas';
import { TRIBOS_PADRAO } from '../data/seed-tribes';

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

  listarRegioes(): Promise<Regiao[]>;
  regiaoPorSlug(slug: string): Promise<Regiao | null>;

  listarGeneros(): Promise<Genero[]>;
  listarTribos(): Promise<Tribe[]>;

  /** Obras do acervo, opcionalmente filtradas pelos eixos. */
  listarObras(filtro?: FiltroDoAtlas): Promise<AtlasWorkPlacement[]>;
  /** Quantas obras respondem ao filtro. **Contado**, nunca declarado. */
  contarObras(filtro?: FiltroDoAtlas): Promise<number>;
  salvarObra(obra: AtlasWorkPlacement): Promise<AtlasWorkPlacement>;
}

/**
 * Filtro pelos três eixos, mais a faceta de gênero.
 *
 * Os três eixos se cruzam: era diz *quando*, região diz *onde*, tribo diz
 * *com quem* — qual população nichada produziu ou pratica. Gênero não é
 * eixo: refina o resultado dentro do cruzamento.
 */
export interface FiltroDoAtlas {
  eraId?: string;
  regiaoId?: string;
  triboId?: string;
  generoId?: string;
  compositorId?: string;
}

export class PersistentAtlasRepository implements AtlasRepository {
  private storage: LocalStorageAdapter;

  private readonly CHAVES = {
    /** Acervo de obras. Conteúdo publicado — a publicação pode reescrevê-lo. */
    OBRAS: 'amd_atlas_works_v1',
  };

  constructor(storage: LocalStorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  public async listarEras(): Promise<MusicalEra[]> {
    return [...ERAS_PADRAO].sort((a, b) => a.order - b.order);
  }

  public async eraPorSlug(slug: string): Promise<MusicalEra | null> {
    return ERAS_PADRAO.find((e) => e.slug === slug || e.id === slug) ?? null;
  }

  public async listarRegioes(): Promise<Regiao[]> {
    return [...REGIOES_PADRAO].sort((a, b) => a.order - b.order);
  }

  public async regiaoPorSlug(slug: string): Promise<Regiao | null> {
    return REGIOES_PADRAO.find((r) => r.slug === slug || r.id === slug) ?? null;
  }

  public async listarGeneros(): Promise<Genero[]> {
    return [...GENEROS_PADRAO].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
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
  public async listarTribos(): Promise<Tribe[]> {
    return TRIBOS_PADRAO;
  }

  private obras(): AtlasWorkPlacement[] {
    return this.storage.get<AtlasWorkPlacement[]>(this.CHAVES.OBRAS) ?? [];
  }

  public async listarObras(filtro: FiltroDoAtlas = {}): Promise<AtlasWorkPlacement[]> {
    return this.obras().filter(
      (o) =>
        (!filtro.eraId || o.eraId === filtro.eraId) &&
        (!filtro.regiaoId || o.regiaoId === filtro.regiaoId) &&
        (!filtro.triboId || o.triboId === filtro.triboId) &&
        (!filtro.compositorId || o.composerId === filtro.compositorId)
    );
  }

  public async contarObras(filtro: FiltroDoAtlas = {}): Promise<number> {
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
