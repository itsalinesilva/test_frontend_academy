// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { PersistentAtlasRepository } from '../src/repositories/atlas.repository';
import { LocalStorageAdapter } from '../src/infrastructure/storage/local-storage';
import { ERAS_PADRAO, REGIOES_PADRAO, GENEROS_PADRAO } from '../src/data/seed-atlas';
import { AtlasWorkPlacement } from '../src/domain/gamification';
import { tribosAbertas, fontesProcessadas, NaturezaDaTribo } from '../src/domain/tribo';

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
  it('uma obra se situa em era e tribo ao mesmo tempo', async () => {
    const repo = novo();
    await repo.salvarObra({
      workId: 'bwv1004',
      eraId: 'era_barroco',
      triboId: 'tribo_violinistas',
      composerId: 'cmp_bach',
    });

    expect(await repo.contarObras({ eraId: 'era_barroco' })).toBe(1);
    expect(await repo.contarObras({ triboId: 'tribo_violinistas' })).toBe(1);
    expect(await repo.contarObras({ eraId: 'era_romantismo', triboId: 'tribo_violinistas' })).toBe(0);
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

describe('tribo — a população nichada', () => {
  it('nenhuma tribo está ABERTA enquanto não houver progressão publicada', async () => {
    /**
     * A convenção: tribo sem trilha fica `EM_PREPARO` ou `ANUNCIADA` —
     * visível, fechada, com o motivo escrito, e **nunca preenchida com
     * conteúdo inventado** para a lista não parecer vazia.
     */
    const tribos = await novo().listarTribos();
    expect(tribos.length).toBeGreaterThan(0);
    expect(tribosAbertas(tribos)).toEqual([]);
  });

  it('tribo não é lugar: não tem coordenada no mapa', async () => {
    /**
     * Foi a correção que deu origem ao tipo. "Ilha" dava ideia de lugar, e
     * lugar é assunto do Atlas — que já trata de onde e de quando. Quem tem
     * coordenada é o mundo, não a população.
     */
    for (const t of await novo().listarTribos()) {
      expect(t, t.name).not.toHaveProperty('mapCoordinates');
    }
  });

  it('há tribo que não é de instrumento', async () => {
    // Quem estuda história forma uma tribo tanto quanto quem toca violino —
    // e isso não cabia em "ilha de instrumento".
    const tribos = await novo().listarTribos();
    expect(tribos.some((t) => t.natureza === NaturezaDaTribo.DISCIPLINA)).toBe(true);
    expect(tribos.some((t) => t.slug === 'historiadores')).toBe(true);
  });

  it('toda era que uma tribo declara existe de fato', async () => {
    const idsDeEra = new Set(ERAS_PADRAO.map((e) => e.id));
    for (const t of await novo().listarTribos()) {
      for (const eraId of t.relevantEraIds) {
        expect(idsDeEra.has(eraId), `${t.name} aponta para ${eraId}`).toBe(true);
      }
    }
  });

  it('toda região que uma tribo declara existe de fato', async () => {
    const idsDeRegiao = new Set(REGIOES_PADRAO.map((r) => r.id));
    for (const t of await novo().listarTribos()) {
      for (const regiaoId of t.relevantRegiaoIds) {
        expect(idsDeRegiao.has(regiaoId), `${t.name} aponta para ${regiaoId}`).toBe(true);
      }
    }
  });

  it('a contagem de fontes é a das PROCESSADAS, não a das declaradas', async () => {
    // Mostrar "15 obras" quando nenhuma foi processada seria anunciar acervo
    // que a plataforma não alcança.
    for (const t of await novo().listarTribos()) {
      expect(fontesProcessadas(t), t.name).toBe(0);
    }
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
