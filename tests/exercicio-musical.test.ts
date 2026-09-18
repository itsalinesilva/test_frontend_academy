import { describe, it, expect } from 'vitest';
import {
  TipoDeExercicio,
  ExercicioMusical,
  VIDAS_POR_LICAO,
  SEGUIDOS_PARA_COMBO,
  TEXTO_DA_ETIQUETA,
  exigeMicrofone,
  iniciarLicao,
  exercicioAtual,
  responder,
  pular,
  licaoConcluida,
  prepararRevisao,
  emCombo,
  progresso,
  precisao,
} from '../src/domain/exercicio-musical';

/**
 * O laço da lição.
 *
 * A mecânica mais bem resolvida da referência é a que estes casos protegem:
 * **o erro não termina a lição**. O exercício errado volta mais tarde, na
 * mesma sessão, marcado como revisão — e a lição só fecha quando o que se
 * errou foi refeito.
 *
 * Isso não é punição: é repetição espaçada dentro da sessão. O erro vira a
 * matéria da própria lição.
 *
 * Mapeamento em `docs/paridade/VOL2_ASTRA_DUOLINGO.md` §B9.5.
 */

const ex = (id: string, tipo = TipoDeExercicio.IDENTIFICAR_DE_OUVIDO): ExercicioMusical => ({
  id,
  tipo,
  etiqueta: 'PRATICA',
  faixa: 'FUNDAMENTO',
  enunciado: 'Ouça e identifique o intervalo',
  alternativas: [
    { id: 'a', rotulo: '3ª maior' },
    { id: 'b', rotulo: '5ª justa' },
  ],
  corretas: ['b'],
  explicacao: 'Sete semitons — a proporção 3:2 que torna a quinta consonante.',
});

const licaoDe = (quantos: number) =>
  iniciarLicao(
    'lic_1',
    Array.from({ length: quantos }, (_, i) => ex(`e${i}`))
  );

describe('a lição começa inteira, e em zero', () => {
  it('começa com as cinco vidas e nenhum acerto', () => {
    const l = licaoDe(3);
    expect(l.vidas).toBe(VIDAS_POR_LICAO);
    expect(l.acertos).toBe(0);
    expect(l.erros).toBe(0);
    expect(l.seguidos).toBe(0);
  });

  it('a precisão é nula antes da primeira resposta', () => {
    // `null` é diferente de zero por cento: a tela precisa distinguir
    // "ainda não respondeu" de "errou tudo".
    expect(precisao(licaoDe(3))).toBeNull();
  });

  it('o primeiro exercício da fila é o atual', () => {
    expect(exercicioAtual(licaoDe(3))?.id).toBe('e0');
  });
});

describe('o erro não termina a lição', () => {
  it('errar enfileira o exercício para refazer', () => {
    const l = responder(licaoDe(3), false);
    expect(l.aRefazer).toEqual(['e0']);
    expect(l.erros).toBe(1);
    expect(l.vidas).toBe(VIDAS_POR_LICAO - 1);
  });

  it('a lição NÃO fecha enquanto houver pendência', () => {
    let l = licaoDe(2);
    l = responder(l, false); // e0 errado
    l = responder(l, true); // e1 certo
    expect(l.indice).toBe(2);
    expect(licaoConcluida(l), 'fechou com pendência aberta').toBe(false);
  });

  it('o errado volta ao fim da fila, marcado como revisão', () => {
    let l = licaoDe(2);
    l = responder(l, false);
    l = responder(l, true);
    l = prepararRevisao(l);

    expect(l.fila).toHaveLength(3);
    expect(l.fila[2].id).toBe('e0');
    expect(l.fila[2].etiqueta).toBe('REVISAO');
  });

  it('acertar na revisão tira o exercício da pendência, e a lição fecha', () => {
    let l = licaoDe(2);
    l = responder(l, false);
    l = responder(l, true);
    l = prepararRevisao(l);
    l = responder(l, true); // refez o e0

    expect(l.aRefazer).toEqual([]);
    expect(licaoConcluida(l)).toBe(true);
  });

  it('errar de novo na revisão mantém a pendência', () => {
    // Sem isto, um erro repetido sairia da fila e a lição fecharia com o
    // conteúdo ainda não aprendido.
    let l = licaoDe(1);
    l = responder(l, false);
    l = prepararRevisao(l);
    l = responder(l, false);
    expect(l.aRefazer).toEqual(['e0']);
  });

  it('o mesmo exercício não entra duas vezes na pendência', () => {
    let l = licaoDe(1);
    l = responder(l, false);
    l = prepararRevisao(l);
    l = responder(l, false);
    expect(l.aRefazer).toHaveLength(1);
  });

  it('preparar revisão sem pendência não muda nada', () => {
    let l = licaoDe(1);
    l = responder(l, true);
    expect(prepararRevisao(l)).toBe(l);
  });
});

describe('as vidas acabam, e o estudo continua', () => {
  it('as vidas não ficam negativas', () => {
    /**
     * Ao chegarem a zero, o estudo NÃO trava — o que acumula a partir daí é
     * o índice de débito. Interromper quem está estudando é punir a
     * tentativa. Ver `76_ECONOMIA_DE_PROGRESSO.md` §5.
     */
    let l = licaoDe(10);
    for (let i = 0; i < 8; i++) l = responder(l, false);
    expect(l.vidas).toBe(0);
    expect(l.erros).toBe(8);
  });

  it('com zero vidas ainda se responde', () => {
    let l = licaoDe(10);
    for (let i = 0; i < 6; i++) l = responder(l, false);
    l = responder(l, true);
    expect(l.acertos).toBe(1);
  });
});

describe('combo de acertos', () => {
  it('a sequência cresce a cada acerto e zera ao errar', () => {
    let l = licaoDe(10);
    l = responder(l, true);
    l = responder(l, true);
    expect(l.seguidos).toBe(2);

    l = responder(l, false);
    expect(l.seguidos).toBe(0);
  });

  it('a melhor sequência da lição fica registrada', () => {
    let l = licaoDe(10);
    for (let i = 0; i < 4; i++) l = responder(l, true);
    l = responder(l, false);
    l = responder(l, true);

    expect(l.melhorSequencia).toBe(4);
    expect(l.seguidos).toBe(1);
  });

  it('o combo acende a partir do limiar declarado', () => {
    // É o que muda a cor da barra de progresso, como na referência.
    let l = licaoDe(10);
    for (let i = 0; i < SEGUIDOS_PARA_COMBO - 1; i++) l = responder(l, true);
    expect(emCombo(l)).toBe(false);

    l = responder(l, true);
    expect(emCombo(l)).toBe(true);
  });

  it('errar apaga o combo', () => {
    let l = licaoDe(10);
    for (let i = 0; i < SEGUIDOS_PARA_COMBO; i++) l = responder(l, true);
    l = responder(l, false);
    expect(emCombo(l)).toBe(false);
  });
});

describe('pular não pune, mas também não acerta', () => {
  it('pular não consome vida nem conta erro', () => {
    const l = pular(licaoDe(3));
    expect(l.vidas).toBe(VIDAS_POR_LICAO);
    expect(l.erros).toBe(0);
    expect(l.acertos).toBe(0);
  });

  it('pular quebra a sequência', () => {
    // Não seria honesto manter o combo de quem não respondeu.
    let l = licaoDe(3);
    l = responder(l, true);
    l = pular(l);
    expect(l.seguidos).toBe(0);
  });

  it('pular não enfileira para revisão', () => {
    // Quem pulou não errou: não há erro a corrigir.
    expect(pular(licaoDe(3)).aRefazer).toEqual([]);
  });
});

describe('progresso e precisão', () => {
  it('o progresso vai de zero a um', () => {
    let l = licaoDe(4);
    expect(progresso(l)).toBe(0);
    l = responder(l, true);
    expect(progresso(l)).toBe(0.25);
  });

  it('entrar em revisão faz a barra recuar — e isso é honesto', () => {
    /**
     * A fila cresce, então a fração cai. Mostrar 100% e depois pedir mais
     * exercícios seria pior: a barra passaria a mentir justamente quando a
     * pessoa achasse que tinha acabado.
     */
    let l = licaoDe(2);
    l = responder(l, false);
    l = responder(l, true);
    const antes = progresso(l);

    l = prepararRevisao(l);
    expect(progresso(l)).toBeLessThan(antes);
  });

  it('a precisão é a fração de acertos sobre respondidas', () => {
    let l = licaoDe(4);
    l = responder(l, true);
    l = responder(l, false);
    l = responder(l, true);
    l = responder(l, true);
    expect(precisao(l)).toBe(75);
  });

  it('pular não entra na conta da precisão', () => {
    let l = licaoDe(3);
    l = responder(l, true);
    l = pular(l);
    expect(precisao(l)).toBe(100);
  });
});

describe('os tipos de exercício', () => {
  it('há tipo que a referência não tem: tocar, cantar e bater o ritmo', () => {
    /**
     * Clicar na alternativa certa prova que a pessoa RECONHECE. Tocar a nota
     * certa prova que ela SABE. É onde a plataforma deixa de ser "Duolingo de
     * música" e passa a ser outra coisa.
     */
    expect(exigeMicrofone(TipoDeExercicio.TOCAR)).toBe(true);
    expect(exigeMicrofone(TipoDeExercicio.CANTAR)).toBe(true);
    expect(exigeMicrofone(TipoDeExercicio.BATER_RITMO)).toBe(true);
  });

  it('os tipos de apontar não exigem microfone', () => {
    // A tela precisa saber antes de abrir, para não pedir permissão à toa.
    for (const t of [
      TipoDeExercicio.RECONHECER_NOTACAO,
      TipoDeExercicio.IDENTIFICAR_DE_OUVIDO,
      TipoDeExercicio.COMBINAR_PARES,
      TipoDeExercicio.APONTAR_NO_BRACO,
    ]) {
      expect(exigeMicrofone(t), t).toBe(false);
    }
  });

  it('toda etiqueta tem texto legível', () => {
    for (const [chave, texto] of Object.entries(TEXTO_DA_ETIQUETA)) {
      expect(texto.length, chave).toBeGreaterThan(6);
    }
  });

  it('a etiqueta de revisão diz o que aconteceu, e não só que é revisão', () => {
    // "Corrija o erro de antes" situa; "Revisão" não diz de quê.
    expect(TEXTO_DA_ETIQUETA.REVISAO).toMatch(/erro/i);
  });
});

describe('o exercício se explica depois de respondido', () => {
  it('todo exercício traz explicação com conteúdo', () => {
    // É a parte que ensina. Sem ela, acertar e errar informam o mesmo: nada.
    const e = ex('e1');
    expect(e.explicacao.length).toBeGreaterThan(25);
  });

  it('a alternativa correta está entre as oferecidas', () => {
    const e = ex('e1');
    for (const id of e.corretas) {
      expect(e.alternativas.some((a) => a.id === id)).toBe(true);
    }
  });
});
