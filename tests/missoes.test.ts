import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  ATIVIDADE_VAZIA,
  MISSOES_POR_DIA,
  MISSOES_POSSIVEIS,
  diaDe,
  missoesDoDia,
  prazoDaMissao,
  progressoDasMissoes,
  temBarra,
} from '../src/domain/missoes';
import { XP } from '../src/domain/economia-de-progresso';

/**
 * As missões do dia.
 *
 * O caso mais consequente aqui é o do sorteio determinístico: se as missões
 * trocassem a cada abertura da tela, a pessoa faria o trabalho e não
 * receberia o crédito. É a pior falha possível numa mecânica de recompensa —
 * pior que não ter missão nenhuma.
 */

const HOJE = new Date(2026, 8, 18, 10, 0);
const AMANHA = new Date(2026, 8, 19, 10, 0);

describe('o sorteio não muda durante o dia', () => {
  it('a mesma pessoa vê as mesmas missões o dia inteiro', () => {
    const manha = missoesDoDia('u_ana', new Date(2026, 8, 18, 7, 30));
    const noite = missoesDoDia('u_ana', new Date(2026, 8, 18, 22, 45));
    expect(manha.map((m) => m.id)).toEqual(noite.map((m) => m.id));
  });

  it('nada precisa estar guardado para isso valer', () => {
    // A semente é pessoa + dia: qualquer aparelho chega às mesmas três.
    expect(missoesDoDia('u_ana', HOJE).map((m) => m.id)).toEqual(
      missoesDoDia('u_ana', HOJE).map((m) => m.id)
    );
  });

  it('no dia seguinte são outras', () => {
    const hoje = missoesDoDia('u_ana', HOJE).map((m) => m.id);
    const amanha = missoesDoDia('u_ana', AMANHA).map((m) => m.id);
    expect(hoje).not.toEqual(amanha);
  });

  it('pessoas diferentes recebem missões diferentes', () => {
    const ana = missoesDoDia('u_ana', HOJE).map((m) => m.id);
    const bruno = missoesDoDia('u_bruno', HOJE).map((m) => m.id);
    expect(ana).not.toEqual(bruno);
  });

  it('dias vizinhos não caem no mesmo sorteio', () => {
    /**
     * Sem a mistura de Knuth, sementes vizinhas — e dias são vizinhos —
     * produzem primeiros valores quase iguais, e a semana inteira sortearia
     * quase sempre as mesmas missões.
     */
    const combinacoes = new Set<string>();
    for (let d = 1; d <= 14; d++) {
      combinacoes.add(
        missoesDoDia('u_ana', new Date(2026, 8, d))
          .map((m) => m.id)
          .join('|')
      );
    }
    expect(combinacoes.size).toBeGreaterThan(5);
  });
});

describe('três missões, e todas diferentes', () => {
  it('são exatamente três', () => {
    expect(missoesDoDia('u_ana', HOJE)).toHaveLength(MISSOES_POR_DIA);
  });

  it('não repete a mesma missão no mesmo dia', () => {
    // Repetir daria duas recompensas pelo mesmo trabalho.
    for (const quem of ['u_ana', 'u_bruno', 'u_carla', 'u_dani']) {
      const ids = missoesDoDia(quem, HOJE).map((m) => m.id);
      expect(new Set(ids).size, quem).toBe(ids.length);
    }
  });

  it('toda missão sorteada existe na lista fixa', () => {
    const conhecidas = new Set(MISSOES_POSSIVEIS.map((m) => m.id));
    for (const m of missoesDoDia('u_ana', HOJE)) {
      expect(conhecidas.has(m.id)).toBe(true);
    }
  });

  it('com o tempo, todas as missões aparecem', () => {
    // Missão que nunca sai é missão que não existe.
    const vistas = new Set<string>();
    for (let d = 1; d <= 60; d++) {
      for (const m of missoesDoDia('u_ana', new Date(2026, 8, d))) vistas.add(m.id);
    }
    expect(vistas.size).toBe(MISSOES_POSSIVEIS.length);
  });
});

describe('o progresso', () => {
  it('sem atividade nenhuma, nada está cumprido', () => {
    const p = progressoDasMissoes(MISSOES_POSSIVEIS, ATIVIDADE_VAZIA);
    expect(p.every((x) => !x.cumprida)).toBe(true);
  });

  it('a missão de contagem mede quanto falta', () => {
    const [aquecimento] = progressoDasMissoes(
      [MISSOES_POSSIVEIS[0]],
      { ...ATIVIDADE_VAZIA, xpNoDia: 4 }
    );
    expect(aquecimento.feito).toBe(4);
    expect(aquecimento.alvo).toBe(10);
    expect(aquecimento.cumprida).toBe(false);
  });

  it('passar do alvo não passa da barra', () => {
    // "14 de 10" faria a barra transbordar e a conta parecer errada.
    const [aquecimento] = progressoDasMissoes(
      [MISSOES_POSSIVEIS[0]],
      { ...ATIVIDADE_VAZIA, xpNoDia: 140 }
    );
    expect(aquecimento.feito).toBe(10);
    expect(aquecimento.cumprida).toBe(true);
  });

  it('a missão de sim-ou-não não tem barra', () => {
    /**
     * "Termine uma rodada sem errar" não tem meio caminho, e "0 de 1" não
     * informa mais que "não cumprida" — barra parada é lida como travamento.
     */
    const semTropeco = MISSOES_POSSIVEIS.find((m) => m.id === 'sem_tropeco')!;
    const [p] = progressoDasMissoes([semTropeco], ATIVIDADE_VAZIA);
    expect(temBarra(p)).toBe(false);
  });

  it('a missão de contagem tem barra', () => {
    const [p] = progressoDasMissoes([MISSOES_POSSIVEIS[0]], ATIVIDADE_VAZIA);
    expect(temBarra(p)).toBe(true);
  });

  it('praticar em dois períodos cumpre a constância', () => {
    const constancia = MISSOES_POSSIVEIS.find((m) => m.id === 'constancia')!;
    const [um] = progressoDasMissoes([constancia], {
      ...ATIVIDADE_VAZIA,
      periodosComPratica: 1,
    });
    const [dois] = progressoDasMissoes([constancia], {
      ...ATIVIDADE_VAZIA,
      periodosComPratica: 2,
    });
    expect(um.cumprida).toBe(false);
    expect(dois.cumprida).toBe(true);
  });
});

describe('os valores são os do documento', () => {
  const doc = readFileSync(
    resolve(__dirname, '../docs/harness/76_ECONOMIA_DE_PROGRESSO.md'),
    'utf-8'
  );

  it('toda missão paga um dos dois valores da tabela', () => {
    /**
     * Enquanto §4 tinha missões de 75 e §2 só previa 50, o documento se
     * contradizia — e foi o pente fino da economia que apontou.
     */
    for (const m of MISSOES_POSSIVEIS) {
      expect([XP.MISSAO_DIARIA, XP.MISSAO_DIARIA_MAIOR], m.id).toContain(m.xp);
    }
  });

  it('as seis missões do documento são as seis do código', () => {
    for (const m of MISSOES_POSSIVEIS) {
      expect(doc, m.titulo).toContain(`| ${m.titulo} |`);
    }
  });

  it('o documento e o código concordam no valor de cada missão', () => {
    for (const m of MISSOES_POSSIVEIS) {
      const linha = doc.split('\n').find((l) => l.startsWith(`| ${m.titulo} |`))!;
      expect(linha.trim().endsWith(`| ${m.xp} |`), `${m.titulo}: ${linha}`).toBe(true);
    }
  });
});

describe('o prazo e o dia', () => {
  it('o dia usa o fuso do aparelho, como a ofensiva', () => {
    expect(diaDe(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('o prazo encolhe conforme o dia passa', () => {
    expect(prazoDaMissao(new Date(2026, 8, 18, 8, 0))).toMatch(/^15h/);
    expect(prazoDaMissao(new Date(2026, 8, 18, 23, 30))).toBe('29 min');
  });
});
