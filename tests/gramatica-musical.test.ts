import { describe, it, expect } from 'vitest';
import {
  Dimensao,
  Estimulo,
  Resposta,
  DIMENSOES,
  ESTIMULOS_VALIDOS,
  RESPOSTAS_VALIDAS,
  podeCombinar,
  todasAsFormas,
  formasDaDimensao,
  enunciadoDe,
  dimensoesDoCapitulo,
  estaAoAlcance,
  ordemPedagogica,
  exigeMicrofone,
} from '../src/domain/gramatica-musical';
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
    expect(todasAsFormas().length).toBeGreaterThan(200);
  });

  it('toda forma gerada é válida', () => {
    for (const f of todasAsFormas()) {
      expect(podeCombinar(f), `${f.dimensao}/${f.estimulo}/${f.resposta}`).toBe(true);
    }
  });

  it('nenhuma dimensão fica sem forma', () => {
    for (const d of Object.values(Dimensao)) {
      expect(formasDaDimensao(d).length, d).toBeGreaterThan(0);
    }
  });

  it('a mesma dimensão rende muitas perguntas diferentes', () => {
    // Sobre nota cabem seis perguntas, e cada uma de vários jeitos.
    expect(formasDaDimensao(Dimensao.NOTA).length).toBeGreaterThan(20);
  });

  it('não há forma repetida', () => {
    const chaves = todasAsFormas().map((f) => `${f.dimensao}/${f.estimulo}/${f.resposta}`);
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
    expect(ESTIMULOS_VALIDOS[Dimensao.ARMADURA]).not.toContain(Estimulo.AUDIO);
    expect(podeCombinar({
      dimensao: Dimensao.ARMADURA,
      estimulo: Estimulo.AUDIO,
      resposta: Resposta.ESCOLHER,
    })).toBe(false);
  });

  it('notação especial não se pergunta de ouvido', () => {
    // Um sinal escrito não tem som próprio.
    expect(ESTIMULOS_VALIDOS[Dimensao.NOTACAO_ESPECIAL]).not.toContain(Estimulo.AUDIO);
  });

  it('armadura não se canta nem se toca', () => {
    expect(RESPOSTAS_VALIDAS[Dimensao.ARMADURA]).not.toContain(Resposta.CANTAR);
    expect(RESPOSTAS_VALIDAS[Dimensao.ARMADURA]).not.toContain(Resposta.TOCAR);
  });

  it('andamento se executa batendo o pulso, não tocando uma altura', () => {
    expect(RESPOSTAS_VALIDAS[Dimensao.ANDAMENTO]).toContain(Resposta.EXECUTAR_RITMO);
    expect(RESPOSTAS_VALIDAS[Dimensao.ANDAMENTO]).not.toContain(Resposta.TOCAR);
  });

  it('intervalo se pergunta de todas as formas — é o que o ouvido mais treina', () => {
    for (const e of [Estimulo.NOTACAO, Estimulo.NOME, Estimulo.AUDIO, Estimulo.BRACO]) {
      expect(ESTIMULOS_VALIDOS[Dimensao.INTERVALO], e).toContain(e);
    }
    for (const r of [Resposta.ESCOLHER, Resposta.TOCAR, Resposta.CANTAR, Resposta.ESCREVER_NA_PAUTA]) {
      expect(RESPOSTAS_VALIDAS[Dimensao.INTERVALO], r).toContain(r);
    }
  });

  it('o que se canta é altura, e o que se executa é tempo', () => {
    // Cantar uma célula rítmica não prova ritmo; bater não prova afinação.
    for (const d of Object.values(Dimensao)) {
      if (RESPOSTAS_VALIDAS[d].includes(Resposta.CANTAR)) {
        expect(ESTIMULOS_VALIDOS[d], `${d} se canta mas não soa`).toContain(Estimulo.AUDIO);
      }
    }
  });
});

describe('ancoragem no curso de Teoria', () => {
  it('toda dimensão aponta para capítulos que existem', () => {
    // Sem isto, o catálogo viraria uma lista de ideias soltas.
    const existentes = new Set(CAPITULOS_TEORIA.map((c) => c.numero));
    for (const [dim, d] of Object.entries(DIMENSOES)) {
      expect(d.capitulos.length, dim).toBeGreaterThan(0);
      for (const cap of d.capitulos) {
        expect(existentes.has(cap), `${dim} aponta para o capítulo ${cap}`).toBe(true);
      }
    }
  });

  it('cada capítulo exercitável devolve as dimensões que ensina', () => {
    expect(dimensoesDoCapitulo(10)).toContain(Dimensao.INTERVALO);
    expect(dimensoesDoCapitulo(30)).toContain(Dimensao.ANDAMENTO);
    expect(dimensoesDoCapitulo(43)).toContain(Dimensao.ACORDE);
  });

  it('capítulo inexistente não devolve dimensão', () => {
    expect(dimensoesDoCapitulo(999)).toEqual([]);
  });

  it('a maioria dos 58 capítulos tem exercício possível', () => {
    const cobertos = CAPITULOS_TEORIA.filter((c) => dimensoesDoCapitulo(c.numero).length > 0);
    expect(cobertos.length / CAPITULOS_TEORIA.length).toBeGreaterThan(0.85);
  });
});

describe('ordem pedagógica', () => {
  it('cadência exige função harmônica, que exige acorde, que exige intervalo', () => {
    // Perguntar cadência a quem não sabe função harmônica não é desafio: é
    // cobrar o que não foi ensinado.
    expect(estaAoAlcance(Dimensao.CADENCIA, [])).toBe(false);
    expect(estaAoAlcance(Dimensao.CADENCIA, [Dimensao.FUNCAO_HARMONICA])).toBe(true);
  });

  it('nota e valor não exigem nada — é por onde se começa', () => {
    expect(estaAoAlcance(Dimensao.NOTA, [])).toBe(true);
    expect(estaAoAlcance(Dimensao.VALOR, [])).toBe(true);
  });

  it('a ordem topológica põe todo pré-requisito antes', () => {
    const ordem = ordemPedagogica();
    expect(ordem).toHaveLength(Object.values(Dimensao).length);

    for (const [i, d] of ordem.entries()) {
      for (const requisito of DIMENSOES[d].requer) {
        expect(ordem.indexOf(requisito), `${requisito} vem depois de ${d}`).toBeLessThan(i);
      }
    }
  });

  it('não há ciclo nos pré-requisitos', () => {
    // Um ciclo faria a ordenação devolver o resto na ordem declarada, e
    // nenhuma dimensão ficaria alcançável.
    const ordem = ordemPedagogica();
    expect(new Set(ordem).size).toBe(ordem.length);
  });

  it('nenhuma dimensão é pré-requisito de si mesma', () => {
    for (const [dim, d] of Object.entries(DIMENSOES)) {
      expect(d.requer, dim).not.toContain(dim as Dimensao);
    }
  });
});

describe('o enunciado sai da gramática', () => {
  it('toda forma tem enunciado legível', () => {
    // Gerado, e não escrito caso a caso: garante que a mesma pergunta seja
    // formulada do mesmo jeito em toda a plataforma.
    for (const f of todasAsFormas()) {
      const e = enunciadoDe(f);
      expect(e.length, `${f.dimensao}/${f.estimulo}`).toBeGreaterThan(15);
      expect(e).toMatch(/^[A-ZÀ-Ý]/);
    }
  });

  it('o enunciado diz de onde vem a pergunta e como se responde', () => {
    expect(
      enunciadoDe({
        dimensao: Dimensao.INTERVALO,
        estimulo: Estimulo.AUDIO,
        resposta: Resposta.CANTAR,
      })
    ).toBe('Ouça e cante a resposta');

    expect(
      enunciadoDe({
        dimensao: Dimensao.NOTA,
        estimulo: Estimulo.NOTACAO,
        resposta: Resposta.TOCAR,
      })
    ).toBe('Veja a pauta e toque a resposta');
  });
});

describe('microfone', () => {
  it('tocar, cantar e executar ritmo exigem microfone', () => {
    // A tela precisa saber antes de abrir, para não pedir permissão à toa.
    expect(exigeMicrofone(Resposta.TOCAR)).toBe(true);
    expect(exigeMicrofone(Resposta.CANTAR)).toBe(true);
    expect(exigeMicrofone(Resposta.EXECUTAR_RITMO)).toBe(true);
  });

  it('as formas de apontar não exigem microfone', () => {
    for (const r of [Resposta.ESCOLHER, Resposta.PAREAR, Resposta.APONTAR, Resposta.ORDENAR]) {
      expect(exigeMicrofone(r), r).toBe(false);
    }
  });

  it('há forma sem microfone para toda dimensão', () => {
    /**
     * Quem não liberar o microfone — ou não tiver um — continua praticando
     * tudo. Sem isto, uma dimensão inteira ficaria inacessível a essa pessoa.
     */
    for (const d of Object.values(Dimensao)) {
      expect(
        RESPOSTAS_VALIDAS[d].some((r) => !exigeMicrofone(r)),
        `${d} só se responde com microfone`
      ).toBe(true);
    }
  });
});
