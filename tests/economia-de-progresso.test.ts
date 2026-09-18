import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  XP,
  CUSTO_BASE_DO_NIVEL,
  CONCLUSOES_PARA_ENTRAR_NA_LIGA,
  EXERCICIOS_POR_RODADA,
  custoDoNivel,
  nivelDe,
  xpDaLicao,
  scoreDaLicao,
} from '../src/domain/economia-de-progresso';
import {
  ExercicioMusical,
  TipoDeExercicio,
  iniciarLicao,
  responder,
  pular,
} from '../src/domain/exercicio-musical';

/**
 * A economia de progresso.
 *
 * O documento §2 se declara a autoridade sobre quanto vale cada coisa. Até
 * agora ele existia só como prosa — e foi por isso que o perfil de prática
 * pôde anunciar 1920 de XP e nível 12 a quem nunca praticou, sem que nada
 * quebrasse.
 *
 * Estes casos guardam o que a prosa não guarda sozinha.
 */

const ex = (id: string): ExercicioMusical => ({
  id,
  tipo: TipoDeExercicio.IDENTIFICAR_DE_OUVIDO,
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
  iniciarLicao('lic', Array.from({ length: quantos }, (_, i) => ex(`e${i}`)));

describe('errar também paga', () => {
  it('o erro vale menos que o acerto, mas não vale zero', () => {
    /**
     * XP mede ESFORÇO. Zerar o erro ensinaria a não tentar o que ainda não se
     * domina — que é justamente o que mais precisa ser tentado.
     */
    expect(XP.EXERCICIO_ERRADO).toBeGreaterThan(0);
    expect(XP.EXERCICIO_ERRADO).toBeLessThan(XP.EXERCICIO_ACERTADO);
  });

  it('uma lição toda errada ainda rende XP', () => {
    let l = licaoDe(4);
    for (let i = 0; i < 4; i++) l = responder(l, false);
    expect(xpDaLicao(l)).toBe(4 * XP.EXERCICIO_ERRADO);
  });

  it('pular não rende nada — quem pulou não praticou', () => {
    let l = licaoDe(3);
    l = pular(l);
    l = pular(l);
    expect(xpDaLicao(l)).toBe(0);
  });
});

describe('o bônus de rodada é da rodada que houve', () => {
  it('dez exercícios terminados pagam o bônus', () => {
    let l = licaoDe(EXERCICIOS_POR_RODADA);
    for (let i = 0; i < EXERCICIOS_POR_RODADA; i++) l = responder(l, true);
    expect(xpDaLicao(l)).toBe(
      EXERCICIOS_POR_RODADA * XP.EXERCICIO_ACERTADO + XP.RODADA_CONCLUIDA
    );
  });

  it('sair no meio não paga bônus de rodada', () => {
    // Pagar por rodada que não houve seria pagar pela intenção.
    let l = licaoDe(EXERCICIOS_POR_RODADA);
    for (let i = 0; i < 4; i++) l = responder(l, true);
    expect(xpDaLicao(l)).toBe(4 * XP.EXERCICIO_ACERTADO);
  });

  it('lição curta não vira rodada só por terminar', () => {
    let l = licaoDe(3);
    for (let i = 0; i < 3; i++) l = responder(l, true);
    expect(xpDaLicao(l)).toBe(3 * XP.EXERCICIO_ACERTADO);
  });

  it('terminar com pendência de revisão ainda aberta não paga o bônus', () => {
    let l = licaoDe(EXERCICIOS_POR_RODADA);
    l = responder(l, false);
    for (let i = 1; i < EXERCICIOS_POR_RODADA; i++) l = responder(l, true);
    // O errado ainda não foi refeito: a rodada não fechou.
    expect(xpDaLicao(l)).toBe(
      XP.EXERCICIO_ERRADO + (EXERCICIOS_POR_RODADA - 1) * XP.EXERCICIO_ACERTADO
    );
  });
});

describe('nível', () => {
  it('começa em 1, com nada', () => {
    expect(nivelDe(0)).toEqual({ nivel: 1, xpNoNivel: 0, xpDoNivel: CUSTO_BASE_DO_NIVEL });
  });

  it('cada nível custa mais que o anterior', () => {
    for (let n = 1; n < 20; n++) {
      expect(custoDoNivel(n + 1)).toBeGreaterThan(custoDoNivel(n));
    }
  });

  it('1920 de XP é nível 6 — e não 12, como o perfil já afirmou', () => {
    const n = nivelDe(1920);
    expect(n.nivel).toBe(6);
    expect(n.xpNoNivel).toBe(420);
    expect(n.xpDoNivel).toBe(600);
  });

  it('o XP dentro do nível nunca alcança o custo do nível', () => {
    // Se alcançasse, a barra apareceria cheia sem subir de nível.
    for (const xp of [0, 1, 99, 100, 101, 299, 300, 5000, 12345]) {
      const n = nivelDe(xp);
      expect(n.xpNoNivel, `${xp} de XP`).toBeLessThan(n.xpDoNivel);
      expect(n.xpNoNivel).toBeGreaterThanOrEqual(0);
    }
  });

  it('nível nunca regride com mais XP', () => {
    let anterior = 0;
    for (let xp = 0; xp < 8000; xp += 37) {
      const n = nivelDe(xp).nivel;
      expect(n).toBeGreaterThanOrEqual(anterior);
      anterior = n;
    }
  });

  it('XP negativo ou quebrado não derruba a conta', () => {
    expect(nivelDe(-500).nivel).toBe(1);
    expect(nivelDe(150.9).nivel).toBe(2);
  });
});

describe('score é qualidade, e ausência de prática não é zero', () => {
  it('sem resposta, não há score', () => {
    // `null` e 0 são coisas diferentes: "não praticou" e "errou tudo".
    expect(scoreDaLicao(licaoDe(3))).toBeNull();
  });

  it('acertar tudo dá o score cheio', () => {
    let l = licaoDe(4);
    for (let i = 0; i < 4; i++) l = responder(l, true);
    expect(scoreDaLicao(l)).toBe(1000);
  });

  it('errar tudo dá zero, que é diferente de não ter score', () => {
    let l = licaoDe(4);
    for (let i = 0; i < 4; i++) l = responder(l, false);
    expect(scoreDaLicao(l)).toBe(0);
  });
});

describe('o documento e o código dizem o mesmo número', () => {
  /**
   * `76_ECONOMIA_DE_PROGRESSO.md` é a autoridade; este módulo é o único lugar
   * do código autorizado a repetir os números dela. Divergência silenciosa
   * entre os dois foi exatamente o que deixou o perfil mentir.
   */
  const doc = readFileSync(
    resolve(__dirname, '../docs/harness/76_ECONOMIA_DE_PROGRESSO.md'),
    'utf-8'
  );

  it('toda constante citada na tabela vale ali o que vale aqui', () => {
    const citadas = [...doc.matchAll(/\|\s*([^|]*?)\s*\|\s*(\d+)\s*\|[^|]*\|[^|]*\|[^|]*`XP\.([A-Z_]+)`/g)];
    expect(citadas.length, 'a tabela deixou de citar as constantes').toBeGreaterThan(8);

    for (const [, evento, valor, constante] of citadas) {
      expect(XP[constante as keyof typeof XP], `${evento} → XP.${constante}`).toBe(Number(valor));
    }
  });

  it('a regra de entrada na liga é a mesma dos dois lados', () => {
    expect(doc).toContain(`**${CONCLUSOES_PARA_ENTRAR_NA_LIGA} lições ou exercícios**`);
  });

  it('o custo do nível declarado no documento é o do código', () => {
    expect(doc).toContain(`**${CUSTO_BASE_DO_NIVEL} × n**`);
  });
});
