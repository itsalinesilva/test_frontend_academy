import { describe, it, expect } from 'vitest';
import {
  INTERVALS,
  ROOTS,
  generateQuestion,
  generateRound,
  isAnswerCorrect,
} from '../src/domain/interval-training';
import { frequenciaDaNota, notaMaisProxima } from '../src/domain/practice-measurement';

/**
 * Geração de exercício **não é fabricação de dado** — e a diferença importa.
 *
 * Três questões escritas à mão num arquivo de tela seriam fabricação: fingem
 * um banco que não existe, o aluno esgota em trinta segundos e passa a
 * reconhecer a POSIÇÃO da resposta em vez do intervalo. Foi o que havia em
 * `/practice/trainer`.
 *
 * Um intervalo, porém, é uma **relação** definida pela distância em semitons.
 * Dada a raiz, a segunda altura sai por cálculo. A mesma terça maior a partir
 * de sete raízes é sete exercícios legítimos — e é assim que se estuda
 * percepção, justamente para o ouvido não decorar a altura absoluta.
 *
 * O que estes casos garantem é que a geração está **musicalmente correta**.
 * Um treino que ensina o intervalo errado é pior que treino nenhum.
 */

describe('a segunda altura sai da teoria, não de uma tabela', () => {
  it('a razão entre as frequências é a do intervalo, em doze partes iguais', () => {
    for (let semente = 1; semente <= 60; semente++) {
      const q = generateQuestion(semente);
      const esperado = q.raizHz * Math.pow(2, q.intervalo.semitons / 12);
      expect(q.segundaHz, `semente ${semente}`).toBeCloseTo(esperado, 6);
    }
  });

  it('a quinta justa soa a 1,5 vez a raiz — a proporção 3:2 que a define', () => {
    // Não é detalhe teórico: é por que a quinta é consonante.
    const quinta = INTERVALS.find((i) => i.semitons === 7)!;
    const raiz = frequenciaDaNota('C4')!;
    const segunda = raiz * Math.pow(2, quinta.semitons / 12);
    expect(segunda / raiz).toBeCloseTo(1.5, 2);
  });

  it('a oitava dobra a frequência, exatamente', () => {
    const raiz = frequenciaDaNota('A4')!;
    expect(raiz * Math.pow(2, 12 / 12)).toBeCloseTo(raiz * 2, 6);
  });

  it('a segunda altura é uma nota do sistema, e não um valor solto', () => {
    for (let semente = 1; semente <= 40; semente++) {
      const q = generateQuestion(semente);
      const nota = notaMaisProxima(q.segundaHz)!;
      // desvio desprezível: a geração cai exatamente sobre a nota
      expect(Math.abs(nota.deviationCents), `semente ${semente}`).toBeLessThan(1);
    }
  });
});

describe('a questão é respondível, e não entrega a resposta', () => {
  it('a alternativa correta está sempre entre as oferecidas', () => {
    for (let semente = 1; semente <= 60; semente++) {
      const q = generateQuestion(semente);
      expect(
        q.choices.some((a) => a.semitons === q.intervalo.semitons),
        `semente ${semente}`
      ).toBe(true);
    }
  });

  it('não há alternativa repetida', () => {
    for (let semente = 1; semente <= 60; semente++) {
      const q = generateQuestion(semente);
      const distintas = new Set(q.choices.map((a) => a.semitons));
      expect(distintas.size, `semente ${semente}`).toBe(q.choices.length);
    }
  });

  it('a correta não fica sempre na mesma posição', () => {
    /**
     * Se ficasse, o aluno aprenderia a posição em vez do intervalo — que é
     * exatamente o vício que as três questões fixas produziam.
     */
    const posicoes = new Set<number>();
    for (let semente = 1; semente <= 40; semente++) {
      const q = generateQuestion(semente);
      posicoes.add(q.choices.findIndex((a) => a.semitons === q.intervalo.semitons));
    }
    expect(posicoes.size).toBeGreaterThan(1);
  });

  it('as alternativas erradas são as VIZINHAS, porque é ali que o ouvido erra', () => {
    // Oferecer "2ª maior" contra "oitava" não treina nada.
    for (let semente = 1; semente <= 40; semente++) {
      const q = generateQuestion(semente);
      const distancias = q.choices
        .filter((a) => a.semitons !== q.intervalo.semitons)
        .map((a) => Math.abs(a.semitons - q.intervalo.semitons));
      expect(Math.max(...distancias), `semente ${semente}`).toBeLessThanOrEqual(7);
    }
  });
});

describe('a rodada dá treino de verdade', () => {
  it('a raiz varia, para o ouvido não decorar a altura absoluta', () => {
    const raizes = new Set(generateRound(20, 7).map((q) => q.raiz));
    expect(raizes.size).toBeGreaterThan(2);
  });

  it('o intervalo varia dentro da rodada', () => {
    const intervalos = new Set(generateRound(20, 7).map((q) => q.intervalo.semitons));
    expect(intervalos.size).toBeGreaterThan(2);
  });

  it('nenhum intervalo aparece duas vezes seguidas', () => {
    // Dá a impressão de que o treino travou.
    const rodada = generateRound(30, 99);
    for (let i = 1; i < rodada.length; i++) {
      expect(rodada[i].intervalo.semitons).not.toBe(rodada[i - 1].intervalo.semitons);
    }
  });

  it('toda raiz gerada pertence à faixa confortável declarada', () => {
    for (const q of generateRound(40, 3)) {
      expect(ROOTS).toContain(q.raiz as (typeof ROOTS)[number]);
    }
  });
});

describe('determinismo', () => {
  it('a mesma semente dá a mesma questão', () => {
    /**
     * Determinístico de propósito: sem isso, um caso de teste sobre a geração
     * seria um caso sobre sorte, e um defeito só apareceria de vez em quando.
     */
    expect(generateQuestion(42)).toEqual(generateQuestion(42));
    expect(generateRound(10, 5)).toEqual(generateRound(10, 5));
  });

  it('sementes diferentes dão rodadas diferentes', () => {
    expect(generateRound(10, 1)).not.toEqual(generateRound(10, 2));
  });
});

describe('a correção compara o que o intervalo É', () => {
  it('acerta pela distância em semitons, não pelo nome', () => {
    /**
     * Nome é rótulo de exibição e pode mudar de redação numa revisão de
     * texto. A distância é o que define o intervalo — comparar nome faria a
     * correção quebrar numa correção gramatical.
     */
    const q = generateQuestion(11);
    const comOutroNome = { ...q.intervalo, nome: 'redação diferente' };
    expect(isAnswerCorrect(q, comOutroNome)).toBe(true);
  });

  it('erra quando a distância é outra', () => {
    const q = generateQuestion(11);
    const errada = INTERVALS.find((i) => i.semitons !== q.intervalo.semitons)!;
    expect(isAnswerCorrect(q, errada)).toBe(false);
  });
});

describe('cada intervalo se explica', () => {
  it('todo intervalo do treino tem explicação com conteúdo', () => {
    // O aluno lê isto depois de responder; é a parte que ensina.
    for (const i of INTERVALS) {
      expect(i.explanation.length, i.nome).toBeGreaterThan(25);
      expect(i.nome.length, String(i.semitons)).toBeGreaterThan(3);
    }
  });

  it('não há dois intervalos com a mesma distância', () => {
    const distancias = INTERVALS.map((i) => i.semitons);
    expect(new Set(distancias).size).toBe(distancias.length);
  });
});
