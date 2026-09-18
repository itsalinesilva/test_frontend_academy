// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { PersistentAtlasRepository } from '../src/repositories/atlas.repository';
import { LocalStorageAdapter } from '../src/infrastructure/storage/local-storage';
import { ERAS_PADRAO, REGIOES_PADRAO, GENEROS_PADRAO } from '../src/data/seed-atlas';
import { AtlasWorkPlacement } from '../src/domain/gamification';

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
 * Catálogo de termos: `docs/harness/75_TAXONOMIA_DO_ATLAS.md`.
 */

const novo = () => new PersistentAtlasRepository(new LocalStorageAdapter());

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
    const ordens = ERAS_PADRAO.map((e) => e.order);
    expect(new Set(ordens).size, 'duas eras com a mesma ordem').toBe(ordens.length);
    expect([...ordens].sort((a, b) => a - b)).toEqual(ordens);
  });

  it('toda era declara período, descrição e características', () => {
    for (const e of ERAS_PADRAO) {
      expect(e.periodYears.length, e.name).toBeGreaterThan(4);
      expect(e.description.length, e.name).toBeGreaterThan(40);
      expect(e.keyCharacteristics.length, e.name).toBeGreaterThan(0);
    }
  });

  it('nenhum identificador de era ou região se repete', () => {
    expect(new Set(ERAS_PADRAO.map((e) => e.id)).size).toBe(ERAS_PADRAO.length);
    expect(new Set(REGIOES_PADRAO.map((r) => r.id)).size).toBe(REGIOES_PADRAO.length);
  });

  it('toda era que uma região declara existe de fato', () => {
    // Região apontando para era inexistente produziria filtro que some.
    const idsDeEra = new Set(ERAS_PADRAO.map((e) => e.id));
    for (const r of REGIOES_PADRAO) {
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
    expect(REGIOES_PADRAO.some((r) => r.slug === 'brasil')).toBe(true);
    expect(ERAS_PADRAO.some((e) => /brasil/i.test(e.name))).toBe(false);
  });

  it('a região do Brasil atravessa mais de uma era', () => {
    const brasil = REGIOES_PADRAO.find((r) => r.slug === 'brasil')!;
    expect(brasil.eraIds.length).toBeGreaterThan(1);
  });

  it('gênero é faceta: tem natureza, e não período nem lugar', () => {
    for (const g of GENEROS_PADRAO) {
      expect(['VOCAL', 'INSTRUMENTAL', 'CENICO', 'MISTO']).toContain(g.natureza);
      expect(g).not.toHaveProperty('periodYears');
      expect(g).not.toHaveProperty('eraIds');
    }
  });
});

describe('a contagem é contada, nunca declarada', () => {
  it('o acervo nasce vazio, e a contagem é zero', async () => {
    /**
     * REGRESSÃO — "Barroco: 142 obras canônicas" numa plataforma que não
     * cataloga obra nenhuma. Zero é a informação correta.
     */
    const repo = novo();
    expect(await repo.contarObras()).toBe(0);
    expect(await repo.listarObras()).toEqual([]);
  });

  it('nenhuma era traz contagem embutida', () => {
    // Se trouxesse, ela envelheceria sozinha e passaria a mentir.
    for (const e of ERAS_PADRAO) {
      expect(e).not.toHaveProperty('worksCount');
      expect(e).not.toHaveProperty('totalWorks');
    }
  });

  it('a contagem acompanha o acervo', async () => {
    const repo = novo();
    await repo.salvarObra(obra('w1', 'era_barroco'));
    await repo.salvarObra(obra('w2', 'era_barroco'));
    await repo.salvarObra(obra('w3', 'era_romantismo'));

    expect(await repo.contarObras()).toBe(3);
    expect(await repo.contarObras({ eraId: 'era_barroco' })).toBe(2);
    expect(await repo.contarObras({ eraId: 'era_classicismo' })).toBe(0);
  });

  it('gravar a mesma obra duas vezes não a duplica', async () => {
    const repo = novo();
    await repo.salvarObra(obra('w1', 'era_barroco'));
    await repo.salvarObra(obra('w1', 'era_barroco', 'cmp_outro'));

    expect(await repo.contarObras()).toBe(1);
    expect((await repo.listarObras())[0].composerId).toBe('cmp_outro');
  });
});

describe('os eixos se cruzam', () => {
  it('uma obra se situa em era e ilha ao mesmo tempo', async () => {
    const repo = novo();
    await repo.salvarObra({
      workId: 'bwv1004',
      eraId: 'era_barroco',
      instrumentIslandId: 'ilha_violino',
      composerId: 'cmp_bach',
    });

    expect(await repo.contarObras({ eraId: 'era_barroco' })).toBe(1);
    expect(await repo.contarObras({ ilhaId: 'ilha_violino' })).toBe(1);
    expect(await repo.contarObras({ eraId: 'era_romantismo', ilhaId: 'ilha_violino' })).toBe(0);
  });

  it('filtrar por compositor devolve só as obras dele', async () => {
    const repo = novo();
    await repo.salvarObra(obra('w1', 'era_barroco', 'cmp_a'));
    await repo.salvarObra(obra('w2', 'era_barroco', 'cmp_b'));

    const deA = await repo.listarObras({ compositorId: 'cmp_a' });
    expect(deA).toHaveLength(1);
    expect(deA[0].workId).toBe('w1');
  });
});

describe('ilha declarada, nunca simulada', () => {
  it('não há ilha enquanto não houver currículo publicado', async () => {
    /**
     * A convenção do domínio: ilha sem currículo fica `PLANNED` — visível no
     * mapa, fechada, e **nunca preenchida com conteúdo inventado**. Enquanto
     * nenhuma tiver trilha, a lista é vazia em vez de trazer uma ilha de
     * mentira para o mapa não parecer vazio.
     */
    expect(await novo().listarIlhas()).toEqual([]);
  });
});

describe('leitura e escrita atravessam o recarregar', () => {
  it('a obra gravada volta numa instância nova', async () => {
    await novo().salvarObra(obra('w1', 'era_moderna'));
    expect(await novo().contarObras()).toBe(1);
  });

  it('a taxonomia não depende do armazenamento', async () => {
    // Ela é conhecimento, e vem do código — não do que alguém gravou.
    window.localStorage.clear();
    expect((await novo().listarEras()).length).toBe(ERAS_PADRAO.length);
    expect((await novo().listarRegioes()).length).toBe(REGIOES_PADRAO.length);
  });
});
