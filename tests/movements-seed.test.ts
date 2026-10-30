import { describe, it, expect } from 'vitest';
import { SEED_MOVEMENTS } from '../src/data/seed-movements';
import { compositoresDoRepertorio, obrasDoRepertorio } from '../src/data/seed-acervo';
import { marcadoresDaPosicao } from '../src/domain/atlas-map';

/**
 * OS MOVIMENTOS, E OS FUNDADORES DELES.
 *
 * Um movimento cujos fundadores não existem no acervo é um marcador que abre
 * numa lista vazia. Pior que ausente: promete um recorte e entrega nada.
 *
 * Este arquivo cobra a ligação de ponta a ponta — do id escrito à mão em
 * `seed-movements.ts` até o compositor derivado do repertório. Errar uma letra
 * num id não quebra compilação nenhuma, e só apareceria na tela.
 */

const EM_2026 = new Date('2026-06-15T12:00:00.000Z');

describe('todo movimento tem fundador de verdade', () => {
  it('CADA FUNDADOR EXISTE NO ACERVO', () => {
    const ids = new Set(compositoresDoRepertorio(EM_2026).map((c) => c.id));

    for (const m of SEED_MOVEMENTS) {
      for (const f of m.founderComposerIds) {
        expect(ids.has(f), `"${m.name}" aponta para "${f}", que não existe no acervo`).toBe(true);
      }
    }
  });

  it('nenhum movimento fica sem fundador', () => {
    for (const m of SEED_MOVEMENTS) {
      expect(m.founderComposerIds.length, m.name).toBeGreaterThan(0);
    }
  });

  it('o fundador pertence à era do movimento', () => {
    /**
     * Um movimento do Barroco com fundador que só tem obra do Romantismo
     * abriria vazio ao ser focado: o filtro cruza era E fundador.
     */
    const compositores = compositoresDoRepertorio(EM_2026);

    for (const m of SEED_MOVEMENTS) {
      for (const f of m.founderComposerIds) {
        const c = compositores.find((x) => x.id === f)!;
        expect(c.periodIds, `${c.sortName} em "${m.name}"`).toContain(m.eraId);
      }
    }
  });

  it('o fundador tem presença em alguma região do movimento', () => {
    const compositores = compositoresDoRepertorio(EM_2026);

    for (const m of SEED_MOVEMENTS) {
      for (const f of m.founderComposerIds) {
        const c = compositores.find((x) => x.id === f)!;
        expect(
          c.regionIds.some((r) => m.regionIds.includes(r)),
          `${c.sortName} não está em nenhuma região de "${m.name}"`
        ).toBe(true);
      }
    }
  });

  it('todo movimento declara descrição própria, e não um rótulo', () => {
    // Movimento sem descrição vira sinônimo de era, que já existe.
    for (const m of SEED_MOVEMENTS) {
      expect(m.description.length, m.name).toBeGreaterThan(100);
    }
  });
});

describe('focar um movimento abre em gente, e não em vazio', () => {
  const acervo = () => ({
    compositores: compositoresDoRepertorio(EM_2026),
    obras: obrasDoRepertorio(EM_2026),
    movimentos: SEED_MOVEMENTS,
  });

  it('CADA MOVIMENTO, FOCADO, TRAZ SEUS COMPOSITORES', () => {
    for (const m of SEED_MOVEMENTS) {
      const marcadores = marcadoresDaPosicao(
        { eraId: m.eraId, movimentoId: m.id },
        acervo()
      ).filter((x) => x.kind === 'COMPOSITOR');

      expect(marcadores.length, `"${m.name}" abriu sem ninguém`).toBeGreaterThan(0);
    }
  });

  it('cada movimento aparece como marcador na era dele', () => {
    for (const m of SEED_MOVEMENTS) {
      const achou = marcadoresDaPosicao({ eraId: m.eraId }, acervo()).some(
        (x) => x.kind === 'MOVIMENTO' && x.id === m.id
      );
      expect(achou, `"${m.name}" não aparece no mapa da era dele`).toBe(true);
    }
  });

  it('o marcador de movimento conta os fundadores', () => {
    const contraponto = SEED_MOVEMENTS.find((m) => m.id === 'mov_contraponto_tardio')!;
    const marcador = marcadoresDaPosicao({ eraId: 'era_barroco' }, acervo()).find(
      (x) => x.id === 'mov_contraponto_tardio'
    );

    expect(marcador?.contagem).toBe(contraponto.founderComposerIds.length);
  });

  it('o compositor carrega os movimentos a que pertence', () => {
    const m = marcadoresDaPosicao({ eraId: 'era_barroco' }, acervo()).find(
      (x) => x.kind === 'COMPOSITOR' && x.id === 'bach-johann-sebastian'
    );

    expect(m?.movimentoIds).toContain('mov_contraponto_tardio');
  });
});
