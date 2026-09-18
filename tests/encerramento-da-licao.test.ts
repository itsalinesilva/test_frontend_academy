import { describe, it, expect } from 'vitest';
import {
  ContextoDoEncerramento,
  METAS_DE_OFENSIVA,
  convemPropormeta,
  faltamParaAMeta,
  sequenciaDeEncerramento,
} from '../src/domain/encerramento-da-licao';
import {
  ExercicioMusical,
  TipoDeExercicio,
  SEGUIDOS_PARA_COMBO,
  iniciarLicao,
  responder,
  prepararRevisao,
} from '../src/domain/exercicio-musical';
import { CONCLUSOES_PARA_ENTRAR_NA_LIGA } from '../src/domain/economia-de-progresso';

/**
 * O encerramento da lição.
 *
 * A regra que estes casos guardam é uma só: **nenhuma tela de conquista sem
 * conquista**. Não existe "Ofensiva: 0 dias" nem "Melhor sequência: 1".
 *
 * Uma tela comemorando o que não aconteceu ensina a pessoa a pular a
 * sequência inteira — e aí a conquista real, quando vier, também será pulada.
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

/** Uma lição terminada, com o resultado que se pedir. */
const terminada = (acertos: number, erros = 0) => {
  let l = licaoDe(acertos + erros);
  for (let i = 0; i < acertos; i++) l = responder(l, true);
  for (let i = 0; i < erros; i++) l = responder(l, false);
  // Refaz o que errou, senão a lição não fecha.
  for (let i = 0; i < erros; i++) {
    l = prepararRevisao(l);
    l = responder(l, true);
  }
  return l;
};

const contexto = (parcial: Partial<ContextoDoEncerramento> = {}): ContextoDoEncerramento => ({
  xpAcumuladoAntes: 5000,
  ofensivaEmDias: 4,
  sustentouODiaAgora: false,
  cumpriuAMetaAgora: false,
  conclusoesAntes: 40,
  ...parcial,
});

const chaves = (l = terminada(3), c = contexto()) =>
  sequenciaDeEncerramento(l, c).map((q) => q.chave);

describe('quem saiu no meio não colheu', () => {
  it('lição inacabada não encerra', () => {
    let l = licaoDe(5);
    l = responder(l, true);
    expect(sequenciaDeEncerramento(l, contexto())).toEqual([]);
  });

  it('lição com erro ainda não refeito não encerra', () => {
    // A pendência de revisão mantém a lição aberta — ver exercicio-musical.
    let l = licaoDe(2);
    l = responder(l, false);
    l = responder(l, true);
    expect(sequenciaDeEncerramento(l, contexto())).toEqual([]);
  });
});

describe('nenhuma tela de conquista sem conquista', () => {
  it('a lição mais simples rende só experiência e precisão', () => {
    expect(chaves()).toEqual(['XP', 'PRECISAO']);
  });

  it('sequência curta não vira tela', () => {
    expect(chaves(terminada(SEGUIDOS_PARA_COMBO - 1))).not.toContain('SEQUENCIA');
  });

  it('sequência a partir do limiar vira tela', () => {
    expect(chaves(terminada(SEGUIDOS_PARA_COMBO))).toContain('SEQUENCIA');
  });

  it('ofensiva não repete quando o dia já estava sustentado', () => {
    // Mostrar "4 dias" a cada lição do mesmo dia é ruído, não conquista.
    expect(chaves(terminada(3), contexto({ sustentouODiaAgora: false }))).not.toContain(
      'OFENSIVA'
    );
  });

  it('ofensiva aparece quando foi esta lição que sustentou o dia', () => {
    expect(chaves(terminada(3), contexto({ sustentouODiaAgora: true }))).toContain('OFENSIVA');
  });

  it('meta do dia só aparece quando se cumpriu agora', () => {
    expect(chaves(terminada(3), contexto({ cumpriuAMetaAgora: false }))).not.toContain(
      'META_DO_DIA'
    );
    expect(chaves(terminada(3), contexto({ cumpriuAMetaAgora: true }))).toContain('META_DO_DIA');
  });

  it('nível só aparece quando se subiu de nível', () => {
    // 5000 de XP com mais algumas dezenas não vira nível novo.
    expect(chaves(terminada(3), contexto({ xpAcumuladoAntes: 5000 }))).not.toContain('NIVEL');
    // A um passo de fechar o nível 1, qualquer acerto já basta.
    expect(chaves(terminada(3), contexto({ xpAcumuladoAntes: 99 }))).toContain('NIVEL');
  });

  it('toda conquista tem valor e legenda — nenhuma tela muda', () => {
    const tudo = sequenciaDeEncerramento(
      terminada(SEGUIDOS_PARA_COMBO),
      contexto({
        xpAcumuladoAntes: 99,
        sustentouODiaAgora: true,
        cumpriuAMetaAgora: true,
        conclusoesAntes: CONCLUSOES_PARA_ENTRAR_NA_LIGA - 1,
      })
    );
    expect(tudo.length).toBeGreaterThan(4);
    for (const q of tudo) {
      expect(q.valor.length, q.chave).toBeGreaterThan(0);
      expect(q.legenda.length, q.chave).toBeGreaterThan(20);
    }
  });
});

describe('a entrada na liga é notícia uma vez só', () => {
  it('a conclusão que completa o mínimo anuncia a entrada', () => {
    expect(
      chaves(terminada(3), contexto({ conclusoesAntes: CONCLUSOES_PARA_ENTRAR_NA_LIGA - 1 }))
    ).toContain('ENTRADA_NA_LIGA');
  });

  it('antes do mínimo, não anuncia', () => {
    expect(chaves(terminada(3), contexto({ conclusoesAntes: 0 }))).not.toContain(
      'ENTRADA_NA_LIGA'
    );
  });

  it('depois de já estar na liga, não anuncia de novo', () => {
    expect(
      chaves(terminada(3), contexto({ conclusoesAntes: CONCLUSOES_PARA_ENTRAR_NA_LIGA }))
    ).not.toContain('ENTRADA_NA_LIGA');
  });
});

describe('a ordem vai do que se fez para o que mudou', () => {
  it('experiência vem antes de nível, ofensiva e liga', () => {
    /**
     * Ir do geral ao particular faria a conquista maior chegar antes de a
     * pessoa saber por quê.
     */
    const ordem = chaves(
      terminada(3),
      contexto({ xpAcumuladoAntes: 99, sustentouODiaAgora: true, conclusoesAntes: 2 })
    );
    expect(ordem.indexOf('XP')).toBe(0);
    expect(ordem.indexOf('NIVEL')).toBeGreaterThan(ordem.indexOf('PRECISAO'));
    expect(ordem.indexOf('ENTRADA_NA_LIGA')).toBe(ordem.length - 1);
  });
});

describe('a experiência conta o erro', () => {
  it('a legenda diz quantos acertos e quantos erros houve', () => {
    const [xp] = sequenciaDeEncerramento(terminada(3, 2), contexto());
    expect(xp.legenda).toMatch(/erro/i);
  });

  it('lição sem erro nenhum não fala de erro', () => {
    const [xp] = sequenciaDeEncerramento(terminada(4), contexto());
    expect(xp.legenda).not.toMatch(/\d+ erros/);
  });
});

describe('a meta de ofensiva é escolhida, não imposta', () => {
  it('as metas oferecidas são de prazo crescente', () => {
    expect([...METAS_DE_OFENSIVA]).toEqual([7, 14, 30]);
  });

  it('não se propõe meta no primeiro dia', () => {
    // Pedir compromisso a quem ainda não sabe se vai voltar.
    expect(convemPropormeta(1, null)).toBe(false);
  });

  it('propõe-se a quem já voltou uma vez', () => {
    expect(convemPropormeta(2, null)).toBe(true);
  });

  it('não se insiste com quem já escolheu', () => {
    expect(convemPropormeta(9, 7)).toBe(false);
  });

  it('sem meta, não há distância para meta nenhuma', () => {
    // A tela não deve inventar uma meta só para ter o que mostrar.
    expect(faltamParaAMeta(5, null)).toBeNull();
  });

  it('a distância para a meta não fica negativa', () => {
    expect(faltamParaAMeta(9, 7)).toBe(0);
    expect(faltamParaAMeta(3, 7)).toBe(4);
  });
});
