// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { PersistentAtlasRepository } from '../src/repositories/atlas.repository';
import { LocalStorageAdapter } from '../src/infrastructure/storage/local-storage';
import { DEFAULT_ERAS, DEFAULT_REGIONS, DEFAULT_GENRES } from '../src/data/seed-atlas';
import { AtlasWorkPlacement } from '../src/domain/gamification';
import { openHouses, processedSources, HouseNature } from '../src/domain/house';

/**
 * O Atlas — taxonomia é conhecimento, contagem é medição.
 *
 * A distinção é a coisa toda. Que o Barroco vai de cerca de 1600 a 1750 é o
 * que os cursos de História ensinam, capítulo por capítulo; declarar isso é
 * catalogar. **Quantas obras** do Barroco a plataforma tem é pergunta sobre o
 * acervo, e a resposta se conta.
 *
 * A tela do Atlas errava exatamente aí: dizia "142 obras canônicas" numa
 * plataforma sem acervo de obras nenhum. E listava "Música Brasileira de
 * Tradição" como **era** — quando é região, e atravessa várias eras.
 *
 * Catálogo de termos: `docs/harness/75_ATLAS_TAXONOMY.md`.
 */

/**
 * Repositório SEM semente.
 *
 * O de produção semeia do acervo canônico — antes ele lia `DEFAULT_WORKS`,
 * que era `never[] = []`, e a tela do Atlas mostrava zero obras enquanto o
 * acervo tinha dezessete. Aqui a prova é sobre a **contagem ser contada**, e
 * semente entrando no meio confundiria "o teste gravou" com "já estava lá".
 */
const novo = () => new PersistentAtlasRepository(new LocalStorageAdapter(), false);

const obra = (workId: string, eraId: string, composerId = 'cmp_x'): AtlasWorkPlacement => ({
  workId,
  eraId,
  composerId,
});

beforeEach(() => {
  window.localStorage.clear();
});

describe('a taxonomia é conhecimento, e está coerente', () => {
  it('as eras estão em ordem cronológica, sem ordem repetida', () => {
    const ordens = DEFAULT_ERAS.map((e) => e.order);
    expect(new Set(ordens).size, 'duas eras com a mesma ordem').toBe(ordens.length);
    expect([...ordens].sort((a, b) => a - b)).toEqual(ordens);
  });

  it('toda era declara período, descrição e características', () => {
    for (const e of DEFAULT_ERAS) {
      expect(e.periodYears.length, e.name).toBeGreaterThan(4);
      expect(e.description.length, e.name).toBeGreaterThan(40);
      expect(e.keyCharacteristics.length, e.name).toBeGreaterThan(0);
    }
  });

  it('nenhum identificador de era ou região se repete', () => {
    expect(new Set(DEFAULT_ERAS.map((e) => e.id)).size).toBe(DEFAULT_ERAS.length);
    expect(new Set(DEFAULT_REGIONS.map((r) => r.id)).size).toBe(DEFAULT_REGIONS.length);
  });

  it('toda era que uma região declara existe de fato', () => {
    // Região apontando para era inexistente produziria filtro que some.
    const idsDeEra = new Set(DEFAULT_ERAS.map((e) => e.id));
    for (const r of DEFAULT_REGIONS) {
      for (const eraId of r.eraIds) {
        expect(idsDeEra.has(eraId), `${r.name} aponta para ${eraId}`).toBe(true);
      }
    }
  });

  it('"Brasil" é REGIÃO, e não era', () => {
    /**
     * REGRESSÃO — a tela listava "Música Brasileira de Tradição" entre as
     * eras cronológicas, ao lado de Barroco e Romantismo. Não é um recorte
     * de tempo: é um recorte de lugar, e atravessa várias eras.
     */
    expect(DEFAULT_REGIONS.some((r) => r.slug === 'brasil')).toBe(true);
    expect(DEFAULT_ERAS.some((e) => /brasil/i.test(e.name))).toBe(false);
  });

  it('a região do Brasil atravessa mais de uma era', () => {
    const brasil = DEFAULT_REGIONS.find((r) => r.slug === 'brasil')!;
    expect(brasil.eraIds.length).toBeGreaterThan(1);
  });

  it('gênero é faceta: tem natureza, e não período nem lugar', () => {
    for (const g of DEFAULT_GENRES) {
      expect(['VOCAL', 'INSTRUMENTAL', 'CENICO', 'MISTO']).toContain(g.nature);
      expect(g).not.toHaveProperty('periodYears');
      expect(g).not.toHaveProperty('eraIds');
    }
  });
});

describe('a contagem é contada, nunca declarada', () => {
  it('sem acervo, a contagem é zero — e não um número bonito', async () => {
    /**
     * REGRESSÃO — "Barroco: 142 obras canônicas" numa plataforma que não
     * catalogava obra nenhuma. Zero é a informação correta.
     *
     * Hoje o acervo NÃO nasce vazio: ele sai do repositório próprio. O que
     * este caso guarda continua valendo — a contagem sai do que existe, e
     * quando não existe nada ela é zero.
     */
    const repo = novo();
    expect(await repo.countWorks()).toBe(0);
    expect(await repo.listarObras()).toEqual([]);
  });

  it('nenhuma era traz contagem embutida', () => {
    // Se trouxesse, ela envelheceria sozinha e passaria a mentir.
    for (const e of DEFAULT_ERAS) {
      expect(e).not.toHaveProperty('worksCount');
      expect(e).not.toHaveProperty('totalWorks');
    }
  });

  it('a contagem acompanha o acervo', async () => {
    const repo = novo();
    await repo.salvarObra(obra('w1', 'era_barroco'));
    await repo.salvarObra(obra('w2', 'era_barroco'));
    await repo.salvarObra(obra('w3', 'era_romantismo'));

    expect(await repo.countWorks()).toBe(3);
    expect(await repo.countWorks({ eraId: 'era_barroco' })).toBe(2);
    expect(await repo.countWorks({ eraId: 'era_classicismo' })).toBe(0);
  });

  it('gravar a mesma obra duas vezes não a duplica', async () => {
    const repo = novo();
    await repo.salvarObra(obra('w1', 'era_barroco'));
    await repo.salvarObra(obra('w1', 'era_barroco', 'cmp_outro'));

    expect(await repo.countWorks()).toBe(1);
    expect((await repo.listarObras())[0].composerId).toBe('cmp_outro');
  });
});

describe('os eixos se cruzam', () => {
  it('uma obra se situa em era e tribo ao mesmo tempo', async () => {
    const repo = novo();
    await repo.salvarObra({
      workId: 'bwv1004',
      eraId: 'era_barroco',
      houseId: 'house_violinists',
      composerId: 'cmp_bach',
    });

    expect(await repo.countWorks({ eraId: 'era_barroco' })).toBe(1);
    expect(await repo.countWorks({ houseId: 'house_violinists' })).toBe(1);
    expect(await repo.countWorks({ eraId: 'era_romantismo', houseId: 'house_violinists' })).toBe(0);
  });

  it('filtrar por compositor devolve só as obras dele', async () => {
    const repo = novo();
    await repo.salvarObra(obra('w1', 'era_barroco', 'cmp_a'));
    await repo.salvarObra(obra('w2', 'era_barroco', 'cmp_b'));

    const deA = await repo.listarObras({ composerId: 'cmp_a' });
    expect(deA).toHaveLength(1);
    expect(deA[0].workId).toBe('w1');
  });
});

describe('tribo — a população nichada', () => {
  it('nenhuma tribo está ABERTA enquanto não houver progressão publicada', async () => {
    /**
     * A convenção: tribo sem trilha fica `EM_PREPARO` ou `ANUNCIADA` —
     * visível, fechada, com o motivo escrito, e **nunca preenchida com
     * conteúdo inventado** para a lista não parecer vazia.
     */
    const houses = await novo().listarCasas();
    expect(houses.length).toBeGreaterThan(0);
    expect(openHouses(houses)).toEqual([]);
  });

  it('tribo não é lugar: não tem coordenada no mapa', async () => {
    /**
     * Foi a correção que deu origem ao tipo. "Ilha" dava ideia de lugar, e
     * lugar é assunto do Atlas — que já trata de onde e de quando. Quem tem
     * coordenada é o mundo, não a população.
     */
    for (const t of await novo().listarCasas()) {
      expect(t, t.name).not.toHaveProperty('mapCoordinates');
    }
  });

  it('há tribo que não é de instrumento', async () => {
    // Quem estuda história forma uma tribo tanto quanto quem toca violino —
    // e isso não cabia em "ilha de instrumento".
    const houses = await novo().listarCasas();
    expect(houses.some((t) => t.nature === HouseNature.DISCIPLINE)).toBe(true);
    expect(houses.some((t) => t.slug === 'historiadores')).toBe(true);
  });

  it('toda era que uma tribo declara existe de fato', async () => {
    const idsDeEra = new Set(DEFAULT_ERAS.map((e) => e.id));
    for (const t of await novo().listarCasas()) {
      for (const eraId of t.relevantEraIds) {
        expect(idsDeEra.has(eraId), `${t.name} aponta para ${eraId}`).toBe(true);
      }
    }
  });

  it('toda região que uma tribo declara existe de fato', async () => {
    const idsDeRegiao = new Set(DEFAULT_REGIONS.map((r) => r.id));
    for (const t of await novo().listarCasas()) {
      for (const regionId of t.relevantRegiaoIds) {
        expect(idsDeRegiao.has(regionId), `${t.name} aponta para ${regionId}`).toBe(true);
      }
    }
  });

  it('a contagem de fontes é a das PROCESSADAS, não a das declaradas', async () => {
    // Mostrar "15 obras" quando nenhuma foi processada seria anunciar acervo
    // que a plataforma não alcança.
    for (const t of await novo().listarCasas()) {
      expect(processedSources(t), t.name).toBe(0);
    }
  });
});

describe('leitura e escrita atravessam o recarregar', () => {
  it('a obra gravada volta numa instância nova', async () => {
    await novo().salvarObra(obra('w1', 'era_moderna'));
    expect(await novo().countWorks()).toBe(1);
  });

  it('a taxonomia não depende do armazenamento', async () => {
    // Ela é conhecimento, e vem do código — não do que alguém gravou.
    window.localStorage.clear();
    expect((await novo().listarEras()).length).toBe(DEFAULT_ERAS.length);
    expect((await novo().listarRegioes()).length).toBe(DEFAULT_REGIONS.length);
  });
});
