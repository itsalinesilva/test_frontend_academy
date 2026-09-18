import { describe, it, expect } from 'vitest';
import {
  montarMes,
  sequenciaAtual,
  registrarEstudo,
  diaDe,
  RegistroDeEstudo,
} from '../src/domain/frequencia';
import {
  resumirAvaliacoes,
  percentuais,
  podeAvaliar,
  nomeExibido,
  AvaliacaoDeCurso,
} from '../src/domain/reviews';

const r = (dia: string, minutos = 30, eventos = 1): RegistroDeEstudo => ({ dia, minutos, eventos });

describe('calendário de frequência', () => {
  const hoje = new Date(2026, 8, 17); // 17 de setembro de 2026, uma quinta

  it('monta o mês com o número certo de dias', () => {
    const m = montarMes([], 2026, 9, hoje);
    expect(m.diasNoMes).toBe(30);
    expect(m.celulas.filter((c) => c.numero !== null)).toHaveLength(30);
  });

  it('alinha a primeira semana com casas vazias antes do dia 1', () => {
    // 1º de setembro de 2026 cai numa terça: duas casas vazias antes.
    const m = montarMes([], 2026, 9, hoje);
    const vazias = m.celulas.slice(0, 2);
    expect(vazias.every((c) => c.numero === null)).toBe(true);
    expect(m.celulas[2].numero).toBe(1);
  });

  it('a grade sempre completa semanas de sete casas', () => {
    for (const mes of [1, 2, 6, 9, 12]) {
      const m = montarMes([], 2026, mes, hoje);
      expect(m.celulas.length % 7).toBe(0);
    }
  });

  it('marca só os dias com registro', () => {
    const m = montarMes([r('2026-09-10'), r('2026-09-11')], 2026, 9, hoje);
    expect(m.diasEstudados).toBe(2);
    expect(m.celulas.find((c) => c.numero === 10)?.estudou).toBe(true);
    expect(m.celulas.find((c) => c.numero === 12)?.estudou).toBe(false);
  });

  it('dia futuro não é falta: é marcado como futuro', () => {
    // Um calendário que pintasse de cinza o dia 30 estaria afirmando que a
    // aluna faltou num dia que ainda não chegou.
    const m = montarMes([], 2026, 9, hoje);
    expect(m.celulas.find((c) => c.numero === 30)?.futuro).toBe(true);
    expect(m.celulas.find((c) => c.numero === 16)?.futuro).toBe(false);
  });

  it('reconhece hoje', () => {
    const m = montarMes([], 2026, 9, hoje);
    expect(m.celulas.filter((c) => c.ehHoje)).toHaveLength(1);
    expect(m.celulas.find((c) => c.ehHoje)?.numero).toBe(17);
  });

  it('soma os minutos do mês', () => {
    const m = montarMes([r('2026-09-01', 45), r('2026-09-02', 15)], 2026, 9, hoje);
    expect(m.minutosTotais).toBe(60);
  });

  it('calcula a maior sequência dentro do mês', () => {
    const m = montarMes(
      [r('2026-09-01'), r('2026-09-02'), r('2026-09-03'), r('2026-09-10'), r('2026-09-11')],
      2026,
      9,
      hoje
    );
    expect(m.maiorSequencia).toBe(3);
  });

  it('registro com zero eventos não conta como dia estudado', () => {
    const m = montarMes([{ dia: '2026-09-05', minutos: 0, eventos: 0 }], 2026, 9, hoje);
    expect(m.diasEstudados).toBe(0);
  });
});

describe('sequência atual', () => {
  const hoje = new Date(2026, 8, 17);

  it('conta os dias consecutivos terminando hoje', () => {
    const s = sequenciaAtual([r('2026-09-15'), r('2026-09-16'), r('2026-09-17')], hoje);
    expect(s).toBe(3);
  });

  it('não quebra se hoje ainda não foi estudado, mas ontem foi', () => {
    // Quebrar à meia-noite puniria quem ainda vai estudar à noite.
    const s = sequenciaAtual([r('2026-09-15'), r('2026-09-16')], hoje);
    expect(s).toBe(2);
  });

  it('quebra quando o último registro é de anteontem', () => {
    expect(sequenciaAtual([r('2026-09-15')], hoje)).toBe(0);
  });

  it('é zero sem nenhum registro', () => {
    expect(sequenciaAtual([], hoje)).toBe(0);
  });

  it('atravessa a virada do mês', () => {
    const primeiroDeOutubro = new Date(2026, 9, 1);
    const s = sequenciaAtual([r('2026-09-29'), r('2026-09-30'), r('2026-10-01')], primeiroDeOutubro);
    expect(s).toBe(3);
  });
});

describe('registro de estudo', () => {
  it('cria o dia quando ainda não existe', () => {
    const rs = registrarEstudo([], '2026-09-17', 20);
    expect(rs).toEqual([{ dia: '2026-09-17', minutos: 20, eventos: 1 }]);
  });

  it('soma ao dia existente em vez de duplicá-lo', () => {
    const rs = registrarEstudo([r('2026-09-17', 20)], '2026-09-17', 15);
    expect(rs).toHaveLength(1);
    expect(rs[0].minutos).toBe(35);
    expect(rs[0].eventos).toBe(2);
  });

  it('mantém a lista ordenada por data', () => {
    let rs = registrarEstudo([], '2026-09-20', 10);
    rs = registrarEstudo(rs, '2026-09-05', 10);
    expect(rs.map((x) => x.dia)).toEqual(['2026-09-05', '2026-09-20']);
  });

  it('diaDe usa o fuso local, não UTC', () => {
    // 23h do dia 17 em fuso negativo viraria dia 18 em UTC.
    expect(diaDe(new Date(2026, 8, 17, 23, 30))).toBe('2026-09-17');
  });
});

describe('avaliações de curso', () => {
  const av = (estrelas: 1 | 2 | 3 | 4 | 5, i = 1): AvaliacaoDeCurso => ({
    id: `av${i}`,
    courseId: 'c1',
    userId: `u${i}`,
    autor: 'Aluno',
    anonima: false,
    estrelas,
    comentario: 'texto',
    criadaEm: '2026-09-17T00:00:00.000Z',
    concluiuOCurso: true,
  });

  it('sem avaliações, a média é null e não zero', () => {
    // Zero significaria nota mínima. Ausência de nota é outra coisa.
    const r0 = resumirAvaliacoes([]);
    expect(r0.media).toBeNull();
    expect(r0.total).toBe(0);
  });

  it('calcula a média com uma casa decimal', () => {
    const r0 = resumirAvaliacoes([av(5, 1), av(4, 2), av(4, 3)]);
    expect(r0.media).toBe(4.3);
    expect(r0.total).toBe(3);
  });

  it('distribui por faixa de estrelas', () => {
    const r0 = resumirAvaliacoes([av(5, 1), av(5, 2), av(3, 3)]);
    expect(r0.distribuicao[5]).toBe(2);
    expect(r0.distribuicao[3]).toBe(1);
    expect(r0.distribuicao[1]).toBe(0);
  });

  it('percentuais somam 100 quando há avaliações', () => {
    const p = percentuais(resumirAvaliacoes([av(5, 1), av(4, 2), av(3, 3), av(2, 4)]));
    expect(p[5] + p[4] + p[3] + p[2] + p[1]).toBe(100);
  });

  it('percentuais são todos zero sem avaliações', () => {
    const p = percentuais(resumirAvaliacoes([]));
    expect(Object.values(p).every((x) => x === 0)).toBe(true);
  });

  it('só avalia quem concluiu, e só uma vez', () => {
    expect(podeAvaliar(true, false)).toBe(true);
    expect(podeAvaliar(false, false)).toBe(false);
    expect(podeAvaliar(true, true)).toBe(false);
  });

  it('avaliação anônima não expõe o nome', () => {
    const anonima = { ...av(5), anonima: true, autor: 'Aline Silva' };
    expect(nomeExibido(anonima)).not.toContain('Aline');
  });
});

describe('a plataforma não semeia avaliação', () => {
  it('nenhum arquivo de seed cria avaliações de curso', async () => {
    const { readFileSync, readdirSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    const dir = resolve(__dirname, '../src/data');

    for (const nome of readdirSync(dir)) {
      if (!nome.startsWith('seed-') || !nome.endsWith('.ts')) continue;
      const conteudo = readFileSync(resolve(dir, nome), 'utf-8');
      expect(conteudo, `${nome} semeia avaliação`).not.toMatch(/AvaliacaoDeCurso\s*\[\s*\]\s*=\s*\[\s*\{/);
      expect(conteudo, `${nome} declara nota de curso`).not.toMatch(/\bratingAverage\b|\breviewCount\b/);
    }
  });
});
