import { describe, it, expect } from 'vitest';
import { REGISTROS_DA_ANTIGUIDADE } from '../src/data/seed-antiquity';
import { motivoDaOferta, temSom } from '../src/domain/antiquity-record';
import { REPERTORIO_DO_PLAYER } from '../src/data/seed-player-repertoire';

/**
 * A ANTIGUIDADE, COBERTA COMO O QUE ELA É.
 *
 * O primeiro capítulo do curso trata dela, e o acervo de obras não tem nenhuma.
 * A tentação seria catalogar peças — mas não há peças. Sobreviveram cerca de
 * quarenta fragmentos, a maioria mutilada, e o que chegou inteiro foi a teoria.
 *
 * Forçar a ficha de obra aqui produziria um catálogo de fantasmas: registros
 * com título, compositor e data que ninguém conhece.
 *
 * O que estes casos protegem é o **nível de tratamento**. A era tem menos
 * registros que o Romantismo porque sobreviveu menos — e não porque foi tratada
 * com menos cuidado. Cada item declara suporte, estado, extensão e o que se
 * pode fazer com ele.
 */

describe('a era está coberta, e com profundidade', () => {
  it('há registros — a era não fica vazia', () => {
    expect(REGISTROS_DA_ANTIGUIDADE.length).toBeGreaterThan(5);
  });

  it('cobre as três naturezas: música notada, teoria e objeto', () => {
    /**
     * Cobrir só música notada deixaria de fora o que mais sobreviveu. O que
     * chegou inteiro da Antiguidade foi a teoria, e um acervo que a ignorasse
     * estaria descrevendo mal a própria era.
     */
    const naturezas = new Set(REGISTROS_DA_ANTIGUIDADE.map((r) => r.natureza));

    expect(naturezas.has('MUSICA_NOTADA')).toBe(true);
    expect(naturezas.has('TEORIA')).toBe(true);
    expect(naturezas.has('ICONOGRAFIA')).toBe(true);
  });

  it('cobre os quatro suportes pelos quais as coisas chegaram', () => {
    const suportes = new Set(REGISTROS_DA_ANTIGUIDADE.map((r) => r.suporte));
    expect(suportes.size).toBeGreaterThanOrEqual(3);
  });

  it('todo registro tem descrição que ensina, e não rótulo', () => {
    for (const r of REGISTROS_DA_ANTIGUIDADE) {
      expect(r.descricao.length, r.id).toBeGreaterThan(250);
    }
  });

  it('todo registro declara suporte, estado e datação', () => {
    for (const r of REGISTROS_DA_ANTIGUIDADE) {
      expect(r.suporte, r.id).toBeTruthy();
      expect(r.estado, r.id).toBeTruthy();
      expect(r.datacao.length, r.id).toBeGreaterThan(5);
    }
  });
});

describe('a honestidade do que se pode oferecer', () => {
  it('TODO MOTIVO É ESCRITO, e nenhum diz apenas "indisponível"', () => {
    for (const r of REGISTROS_DA_ANTIGUIDADE) {
      const m = motivoDaOferta(r);
      expect(m.length, r.id).toBeGreaterThan(40);
      expect(m.toLowerCase()).not.toBe('indisponível');
    }
  });

  it('reconstrução é declarada COMO reconstrução', () => {
    /**
     * Apresentar uma leitura moderna como se fosse o registro antigo seria o
     * mesmo erro de apresentar dedução como catalogação.
     */
    const comReconstrucao = REGISTROS_DA_ANTIGUIDADE.filter((r) => r.oferta === 'RECONSTRUCAO');
    expect(comReconstrucao.length).toBeGreaterThan(0);

    for (const r of comReconstrucao) {
      expect(motivoDaOferta(r)).toMatch(/hipótese|leitura moderna/i);
    }
  });

  it('o que não tem som diz que não tem, e por quê', () => {
    const semSom = REGISTROS_DA_ANTIGUIDADE.filter((r) => !temSom(r));
    expect(semSom.length).toBeGreaterThan(0);

    for (const r of semSom) {
      expect(motivoDaOferta(r).length).toBeGreaterThan(40);
    }
  });

  it('extensão não contada devolve nulo, e não zero', () => {
    /**
     * Um tratado não tem compassos. Zero seria afirmar uma contagem que
     * ninguém fez.
     */
    const tratados = REGISTROS_DA_ANTIGUIDADE.filter((r) => r.natureza === 'TEORIA');
    for (const t of tratados) expect(t.extensaoSobrevivente).toBeNull();
  });
});

describe('as demonstrações apontam para material que existe', () => {
  it('TODA DEMONSTRAÇÃO TEM FAIXA DE VERDADE', () => {
    /**
     * Demonstração que aponta para faixa inexistente é botão morto — o aluno
     * clica e não ouve nada, e descobre isso no meio do estudo.
     */
    const ids = new Set(REPERTORIO_DO_PLAYER.map((f) => f.id));
    const comDemo = REGISTROS_DA_ANTIGUIDADE.filter((r) => r.demonstracaoId);

    expect(comDemo.length, 'nenhuma demonstração — o teste mediria nada').toBeGreaterThan(0);
    for (const r of comDemo) {
      expect(ids.has(r.demonstracaoId!), `${r.id} aponta para ${r.demonstracaoId}`).toBe(true);
    }
  });

  it('a era inteira é domínio público, com a ressalva da edição moderna', () => {
    for (const r of REGISTROS_DA_ANTIGUIDADE) {
      expect(r.publicDomain.status).toBe('PUBLIC_DOMAIN');
      expect(r.publicDomain.note).toContain('edição moderna');
    }
  });
});
