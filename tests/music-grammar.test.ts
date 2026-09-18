import { describe, it, expect } from 'vitest';
import {
  Dimension,
  Stimulus,
  ResponseMode,
  DIMENSIONS,
  VALID_STIMULI,
  VALID_RESPONSES,
  isValidForm,
  allForms,
  formsOfDimension,
  promptFor,
  dimensionsOfChapter,
  isWithinReach,
  pedagogicalOrder,
  requiresMicrophone,
} from '../src/domain/music-grammar';
import { CAPITULOS_TEORIA } from '../src/data/theory/capitulos';

/**
 * A gramática do exercício.
 *
 * A referência tem sete formatos fixos. Sete é pouco para música, e a razão é
 * estrutural: numa língua, "qual o significado de *milk*?" é quase a única
 * pergunta possível sobre uma palavra. Sobre uma ÚNICA NOTA cabem seis — que
 * nota é, onde fica na pauta, em que clave está, quanto dura, como soa, onde
 * fica no braço.
 *
 * Por isso aqui há três eixos que se cruzam, e o repertório é **derivado**:
 * acrescentar uma dimensão traz junto todas as formas em que ela pode ser
 * perguntada, sem que ninguém precise listá-las.
 *
 * O que estes casos protegem é a **matriz de validade** — que é onde mora o
 * conhecimento pedagógico, e o que impede o gerador de produzir perguntas sem
 * resposta.
 */

describe('a gramática gera muito mais que sete formatos', () => {
  it('há mais de duzentas formas de exercício', () => {
    expect(allForms().length).toBeGreaterThan(200);
  });

  it('toda forma gerada é válida', () => {
    for (const f of allForms()) {
      expect(isValidForm(f), `${f.dimensao}/${f.estimulo}/${f.resposta}`).toBe(true);
    }
  });

  it('nenhuma dimensão fica sem forma', () => {
    for (const d of Object.values(Dimension)) {
      expect(formsOfDimension(d).length, d).toBeGreaterThan(0);
    }
  });

  it('a mesma dimensão rende muitas perguntas diferentes', () => {
    // Sobre nota cabem seis perguntas, e cada uma de vários jeitos.
    expect(formsOfDimension(Dimension.NOTE).length).toBeGreaterThan(20);
  });

  it('não há forma repetida', () => {
    const chaves = allForms().map((f) => `${f.dimensao}/${f.estimulo}/${f.resposta}`);
    expect(new Set(chaves).size).toBe(chaves.length);
  });
});

describe('a matriz de validade carrega o conhecimento pedagógico', () => {
  it('armadura de clave NÃO se pergunta de ouvido', () => {
    /**
     * É convenção de escrita: não soa. "Ouça e diga quantos sustenidos há" é
     * uma pergunta sem resposta — dois tons diferentes podem soar iguais e
     * ter armaduras distintas.
     */
    expect(VALID_STIMULI[Dimension.KEY_SIGNATURE]).not.toContain(Stimulus.AUDIO);
    expect(isValidForm({
      dimensao: Dimension.KEY_SIGNATURE,
      estimulo: Stimulus.AUDIO,
      resposta: ResponseMode.CHOOSE,
    })).toBe(false);
  });

  it('notação especial não se pergunta de ouvido', () => {
    // Um sinal escrito não tem som próprio.
    expect(VALID_STIMULI[Dimension.SPECIAL_NOTATION]).not.toContain(Stimulus.AUDIO);
  });

  it('armadura não se canta nem se toca', () => {
    expect(VALID_RESPONSES[Dimension.KEY_SIGNATURE]).not.toContain(ResponseMode.SING);
    expect(VALID_RESPONSES[Dimension.KEY_SIGNATURE]).not.toContain(ResponseMode.PLAY);
  });

  it('andamento se executa batendo o pulso, não tocando uma altura', () => {
    expect(VALID_RESPONSES[Dimension.TEMPO]).toContain(ResponseMode.PERFORM_RHYTHM);
    expect(VALID_RESPONSES[Dimension.TEMPO]).not.toContain(ResponseMode.PLAY);
  });

  it('intervalo se pergunta de todas as formas — é o que o ouvido mais treina', () => {
    for (const e of [Stimulus.NOTATION, Stimulus.NAME, Stimulus.AUDIO, Stimulus.FINGERBOARD]) {
      expect(VALID_STIMULI[Dimension.INTERVAL], e).toContain(e);
    }
    for (const r of [ResponseMode.CHOOSE, ResponseMode.PLAY, ResponseMode.SING, ResponseMode.WRITE_ON_STAFF]) {
      expect(VALID_RESPONSES[Dimension.INTERVAL], r).toContain(r);
    }
  });

  it('o que se canta é altura, e o que se executa é tempo', () => {
    // Cantar uma célula rítmica não prova ritmo; bater não prova afinação.
    for (const d of Object.values(Dimension)) {
      if (VALID_RESPONSES[d].includes(ResponseMode.SING)) {
        expect(VALID_STIMULI[d], `${d} se canta mas não soa`).toContain(Stimulus.AUDIO);
      }
    }
  });
});

describe('ancoragem no curso de Teoria', () => {
  it('toda dimensão aponta para capítulos que existem', () => {
    // Sem isto, o catálogo viraria uma lista de ideias soltas.
    const existentes = new Set(CAPITULOS_TEORIA.map((c) => c.numero));
    for (const [dim, d] of Object.entries(DIMENSIONS)) {
      expect(d.capitulos.length, dim).toBeGreaterThan(0);
      for (const cap of d.capitulos) {
        expect(existentes.has(cap), `${dim} aponta para o capítulo ${cap}`).toBe(true);
      }
    }
  });

  it('cada capítulo exercitável devolve as dimensões que ensina', () => {
    expect(dimensionsOfChapter(10)).toContain(Dimension.INTERVAL);
    expect(dimensionsOfChapter(30)).toContain(Dimension.TEMPO);
    expect(dimensionsOfChapter(43)).toContain(Dimension.CHORD);
  });

  it('capítulo inexistente não devolve dimensão', () => {
    expect(dimensionsOfChapter(999)).toEqual([]);
  });

  it('a maioria dos 58 capítulos tem exercício possível', () => {
    const cobertos = CAPITULOS_TEORIA.filter((c) => dimensionsOfChapter(c.numero).length > 0);
    expect(cobertos.length / CAPITULOS_TEORIA.length).toBeGreaterThan(0.85);
  });
});

describe('ordem pedagógica', () => {
  it('cadência exige função harmônica, que exige acorde, que exige intervalo', () => {
    // Perguntar cadência a quem não sabe função harmônica não é desafio: é
    // cobrar o que não foi ensinado.
    expect(isWithinReach(Dimension.CADENCE, [])).toBe(false);
    expect(isWithinReach(Dimension.CADENCE, [Dimension.HARMONIC_FUNCTION])).toBe(true);
  });

  it('nota e valor não exigem nada — é por onde se começa', () => {
    expect(isWithinReach(Dimension.NOTE, [])).toBe(true);
    expect(isWithinReach(Dimension.NOTE_VALUE, [])).toBe(true);
  });

  it('a ordem topológica põe todo pré-requisito antes', () => {
    const ordem = pedagogicalOrder();
    expect(ordem).toHaveLength(Object.values(Dimension).length);

    for (const [i, d] of ordem.entries()) {
      for (const requisito of DIMENSIONS[d].requer) {
        expect(ordem.indexOf(requisito), `${requisito} vem depois de ${d}`).toBeLessThan(i);
      }
    }
  });

  it('não há ciclo nos pré-requisitos', () => {
    // Um ciclo faria a ordenação devolver o resto na ordem declarada, e
    // nenhuma dimensão ficaria alcançável.
    const ordem = pedagogicalOrder();
    expect(new Set(ordem).size).toBe(ordem.length);
  });

  it('nenhuma dimensão é pré-requisito de si mesma', () => {
    for (const [dim, d] of Object.entries(DIMENSIONS)) {
      expect(d.requer, dim).not.toContain(dim as Dimension);
    }
  });
});

describe('o enunciado sai da gramática', () => {
  it('toda forma tem enunciado legível', () => {
    // Gerado, e não escrito caso a caso: garante que a mesma pergunta seja
    // formulada do mesmo jeito em toda a plataforma.
    for (const f of allForms()) {
      const e = promptFor(f);
      expect(e.length, `${f.dimensao}/${f.estimulo}`).toBeGreaterThan(15);
      expect(e).toMatch(/^[A-ZÀ-Ý]/);
    }
  });

  it('o enunciado diz de onde vem a pergunta e como se responde', () => {
    expect(
      promptFor({
        dimensao: Dimension.INTERVAL,
        estimulo: Stimulus.AUDIO,
        resposta: ResponseMode.SING,
      })
    ).toBe('Ouça e cante a resposta');

    expect(
      promptFor({
        dimensao: Dimension.NOTE,
        estimulo: Stimulus.NOTATION,
        resposta: ResponseMode.PLAY,
      })
    ).toBe('Veja a pauta e toque a resposta');
  });
});

describe('microfone', () => {
  it('tocar, cantar e executar ritmo exigem microfone', () => {
    // A tela precisa saber antes de abrir, para não pedir permissão à toa.
    expect(requiresMicrophone(ResponseMode.PLAY)).toBe(true);
    expect(requiresMicrophone(ResponseMode.SING)).toBe(true);
    expect(requiresMicrophone(ResponseMode.PERFORM_RHYTHM)).toBe(true);
  });

  it('as formas de apontar não exigem microfone', () => {
    for (const r of [ResponseMode.CHOOSE, ResponseMode.MATCH, ResponseMode.POINT, ResponseMode.ORDER]) {
      expect(requiresMicrophone(r), r).toBe(false);
    }
  });

  it('há forma sem microfone para toda dimensão', () => {
    /**
     * Quem não liberar o microfone — ou não tiver um — continua praticando
     * tudo. Sem isto, uma dimensão inteira ficaria inacessível a essa pessoa.
     */
    for (const d of Object.values(Dimension)) {
      expect(
        VALID_RESPONSES[d].some((r) => !requiresMicrophone(r)),
        `${d} só se responde com microfone`
      ).toBe(true);
    }
  });
});
