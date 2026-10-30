import { describe, it, expect } from 'vitest';
import { COLETANEAS_BRASILEIRAS } from '../src/data/seed-collections';
import {
  estadoDaColetanea,
  numeracaoQuebrada,
  pecasCasadas,
} from '../src/domain/collection';
import { todasAsObras, todosOsCompositores } from '../src/data/acervo-unificado';

/**
 * AS COLETÂNEAS — Compositor → Coletânea → Obra → Edição → Partitura.
 *
 * 🔴 O QUE ESTES CASOS IMPEDEM
 * ----------------------------
 * Que a coletânea vire etiqueta. Guardar "Machiette" como texto na obra perde
 * a **ordem**, e a ordem é conteúdo: `Valsa op. 2 nº 3` é a terceira peça de
 * um livro, e não uma valsa solta.
 *
 * E que a peça vire obra. Um índice de livro com títulos é exatamente a forma
 * como 1.331 obras falsas entraram no catálogo — peça que não casa fica sem
 * `obraId`, e não ganha uma obra inventada.
 */

describe('a coletânea é objeto, e não etiqueta', () => {
  it('toda coletânea tem título e fonte', () => {
    expect(COLETANEAS_BRASILEIRAS.length, 'nenhuma coletânea — o caso passaria à toa').toBe(20);

    for (const c of COLETANEAS_BRASILEIRAS) {
      expect(c.titulo.trim().length, `"${c.id}" sem título`).toBeGreaterThan(2);
      expect(c.fonte, `"${c.id}" sem fonte declarada`).toBeTruthy();
    }
  });

  it('nenhum identificador se repete', () => {
    const ids = COLETANEAS_BRASILEIRAS.map((c) => c.id);
    expect(new Set(ids).size, 'coletânea duplicada').toBe(ids.length);
  });

  it('🔴 a numeração das peças não pula nem repete', () => {
    /**
     * Uma coletânea que pula do 3 para o 5 perdeu uma peça na leitura, e o
     * defeito não aparece: a lista parece completa porque tem títulos.
     */
    for (const c of COLETANEAS_BRASILEIRAS) {
      expect(numeracaoQuebrada(c), `"${c.titulo}" tem numeração quebrada`).toBe(false);
    }
  });
});

describe('🔴 a peça aponta para obra que existe, e não cria nenhuma', () => {
  it('todo obraId citado está no catálogo', async () => {
    const ids = new Set((await todasAsObras()).map((o) => o.id));
    expect(ids.size, 'o acervo veio vazio — o caso passaria à toa').toBeGreaterThan(1000);

    for (const c of COLETANEAS_BRASILEIRAS) {
      for (const p of c.pecas) {
        if (!p.obraId) continue;
        expect(ids.has(p.obraId), `"${c.titulo}" / "${p.titulo}" aponta para obra inexistente`).toBe(
          true
        );
      }
    }
  });

  it('todo composerId citado está no catálogo', () => {
    const ids = new Set(todosOsCompositores().map((c) => c.id));

    for (const c of COLETANEAS_BRASILEIRAS) {
      if (!c.composerId) continue;
      expect(ids.has(c.composerId), `"${c.titulo}" aponta para compositor inexistente`).toBe(true);
    }
  });

  it('coletânea sem composerId declara organizador ou é anônima por decisão', () => {
    /**
     * A *Coleção de modinhas* reúne dezessete assinaturas; as *Modinhas
     * coletadas por Spix e von Martius* têm dois coletores que não compuseram
     * nada. Forçar um autor em qualquer das duas seria inventar — mas ficar
     * sem nenhum dos dois campos seria perder de onde o volume veio.
     */
    for (const c of COLETANEAS_BRASILEIRAS.filter((x) => !x.composerId)) {
      const temOrigem = Boolean(c.organizador) || /an[oô]nim|populares/i.test(c.titulo);
      expect(temOrigem, `"${c.titulo}" não tem autor nem organizador nem é anônima`).toBe(true);
    }
  });
});

describe('o estado da coletânea é declarado, e não deduzido do vazio', () => {
  it('🔴 SÓ FICHA é diferente de coletânea vazia', () => {
    /**
     * As duas desenham igual — uma lista sem itens. Confundi-las faria a tela
     * declarar ausência onde há trabalho por fazer.
     */
    const inteiras = COLETANEAS_BRASILEIRAS.filter((c) => estadoDaColetanea(c) === 'INTEIRA');
    const soFicha = COLETANEAS_BRASILEIRAS.filter((c) => estadoDaColetanea(c) === 'SO_FICHA');

    expect(inteiras.length, 'nenhuma coletânea casada por inteiro').toBe(5);
    expect(soFicha.length, 'o índice de nenhuma foi aberto').toBe(15);

    /** As cinco inteiras somam as 41 peças casadas uma a uma. */
    const casadas = COLETANEAS_BRASILEIRAS.reduce((n, c) => n + pecasCasadas(c), 0);
    expect(casadas, 'as peças casadas não batem com o que foi apurado').toBe(41);
  });

  it('coletânea INTEIRA tem toda peça com obra', () => {
    for (const c of COLETANEAS_BRASILEIRAS.filter((x) => estadoDaColetanea(x) === 'INTEIRA')) {
      expect(pecasCasadas(c), `"${c.titulo}" foi dada como inteira e tem peça solta`).toBe(
        c.pecas.length
      );
    }
  });
});
