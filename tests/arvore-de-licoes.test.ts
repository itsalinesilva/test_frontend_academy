import { describe, it, expect } from 'vitest';
import {
  feitasForaDeOrdem,
  montarArvoreDeLicoes,
  progressoNoCurso,
  proximaSugerida,
} from '../src/domain/arvore-de-licoes';
import { ChairId } from '../src/domain/chair';
import { academyService } from '../src/services/application/academy.service';

/**
 * A ÁRVORE DE LIÇÕES — Cadeira → Curso → Módulo → Lição.
 *
 * 🔴 O Laboratório listava árvores de competência SOLTAS — teoria, percepção,
 * ritmo — sem curso, sem módulo e sem ordem. Quem abria não sabia o que vinha
 * antes, o que vinha depois, nem a que curso aquilo pertencia.
 *
 * A estrutura acadêmica já existia inteira e ordenada; o Laboratório é que a
 * ignorava e inventava a própria. Duas organizações sobre o mesmo conteúdo é
 * pior que nenhuma: a pessoa estuda por uma e é avaliada pela outra.
 */

async function arvoreReal(cadeiras: ChairId[] = []) {
  const cursos = await academyService.getCourses();

  const modulos = (
    await Promise.all(cursos.map((c) => academyService.getModules(c.id)))
  ).flat();

  const licoes = (
    await Promise.all(modulos.map((m) => academyService.getLessons(m.id)))
  ).flat();

  return montarArvoreDeLicoes({ cursos, modulos, licoes, cadeirasDoAluno: cadeiras });
}

describe('a árvore sai ordenada em todos os níveis', () => {
  it('há cadeiras, com cursos e lições — a conferência não é vazia', async () => {
    const arvore = await arvoreReal();

    expect(arvore.length, 'nenhuma cadeira com curso').toBeGreaterThan(0);

    const totalDeLicoes = arvore
      .flatMap((c) => c.cursos)
      .reduce((n, c) => n + c.totalDeLicoes, 0);

    expect(totalDeLicoes, 'nenhuma lição na árvore — o caso passaria à toa').toBeGreaterThan(0);
  });

  it('🔴 módulos e lições vêm em sequência, sem buraco nem repetição', async () => {
    /**
     * A ordem exibida é a POSIÇÃO na sequência, e não o campo cru: um módulo
     * removido deixaria 1, 2, 4, e quem lê procuraria o terceiro.
     */
    for (const cadeira of await arvoreReal()) {
      for (const curso of cadeira.cursos) {
        expect(
          curso.modulos.map((m) => m.ordem),
          `"${curso.titulo}" tem módulos fora de sequência`
        ).toEqual(curso.modulos.map((_, i) => i + 1));

        for (const m of curso.modulos) {
          expect(
            m.licoes.map((l) => l.ordem),
            `"${curso.titulo}" / "${m.titulo}" tem lições fora de sequência`
          ).toEqual(m.licoes.map((_, i) => i + 1));
        }
      }
    }
  });

  it('todo curso pertence à cadeira em que foi listado', async () => {
    /**
     * A cadeira vem de um mapa explícito e total — curso sem cadeira não tem
     * Grêmio, e é isso que o pente fino recusa. A árvore não pode inventar
     * pertencimento.
     */
    const arvore = await arvoreReal();
    const ids = arvore.flatMap((c) => c.cursos.map((x) => x.id));

    expect(new Set(ids).size, 'o mesmo curso apareceu em duas cadeiras').toBe(ids.length);
  });

  it('curso sem lição não entra — seria uma gaveta vazia', async () => {
    for (const cadeira of await arvoreReal()) {
      for (const curso of cadeira.cursos) {
        expect(curso.totalDeLicoes, `"${curso.titulo}" entrou sem lição`).toBeGreaterThan(0);
      }
    }
  });

  it('o pertencimento vem de fora, e não é adivinhado', async () => {
    const semVinculo = await arvoreReal([]);
    const comHistoria = await arvoreReal([ChairId.HISTORIA]);

    expect(semVinculo.every((c) => !c.pertence), 'visitante apareceu pertencendo').toBe(true);

    const historia = comHistoria.find((c) => c.cadeira.id === ChairId.HISTORIA);
    if (historia) expect(historia.pertence).toBe(true);
  });
});

describe('🔴 a ordem é SUGESTÃO, e a tela pode dizer quem pulou', () => {
  const curso = {
    id: 'c1',
    titulo: 'Curso',
    totalDeLicoes: 5,
    modulos: [
      {
        id: 'm1',
        titulo: 'Módulo 1',
        ordem: 1,
        licoes: [
          { id: 'l1', titulo: 'Lição 1', ordem: 1 },
          { id: 'l2', titulo: 'Lição 2', ordem: 2 },
        ],
      },
      {
        id: 'm2',
        titulo: 'Módulo 2',
        ordem: 2,
        licoes: [
          { id: 'l3', titulo: 'Lição 3', ordem: 1 },
          { id: 'l4', titulo: 'Lição 4', ordem: 2 },
          { id: 'l5', titulo: 'Lição 5', ordem: 3 },
        ],
      },
    ],
  };

  it('a próxima sugerida é a primeira não feita, na ordem', () => {
    expect(proximaSugerida(curso, new Set())?.licao.id).toBe('l1');
    expect(proximaSugerida(curso, new Set(['l1', 'l2']))?.licao.id).toBe('l3');
    expect(proximaSugerida(curso, new Set(['l1', 'l2', 'l3', 'l4', 'l5']))).toBeNull();
  });

  it('quem segue a ordem não aparece como fora de ordem', () => {
    expect(feitasForaDeOrdem(curso, new Set(['l1', 'l2', 'l3']))).toEqual([]);
  });

  it('🔴 quem pula APARECE, e não é bloqueado', () => {
    /**
     * Fazer a quinta sem ter feito a primeira é permitido: adulto escolhe por
     * onde entra. O que o sistema faz é **dizer onde aquilo fica** — quem
     * pulou não fechou as seções anteriores, e vai encontrar pressupostos que
     * não estudou.
     *
     * Dizer isso é diferente de proibir, e esta função é a prova de que a
     * diferença está implementada: ela **informa**, e não devolve bloqueio.
     */
    const fora = feitasForaDeOrdem(curso, new Set(['l5']));
    expect(fora.map((l) => l.id)).toEqual(['l5']);
  });

  it('a seção só conta como fechada quando TODAS as lições dela foram feitas', () => {
    expect(progressoNoCurso(curso, new Set(['l1'])).secoesFechadas).toBe(0);
    expect(progressoNoCurso(curso, new Set(['l1', 'l2'])).secoesFechadas).toBe(1);
    expect(progressoNoCurso(curso, new Set(['l1', 'l2', 'l3', 'l4'])).secoesFechadas).toBe(1);
    expect(progressoNoCurso(curso, new Set(['l1', 'l2', 'l3', 'l4', 'l5'])).secoesFechadas).toBe(2);
  });

  it('o progresso conta o que foi feito, e não o que foi aberto', () => {
    const p = progressoNoCurso(curso, new Set(['l1', 'l5']));
    expect(p.feitas).toBe(2);
    expect(p.total).toBe(5);
    expect(p.secoesFechadas, 'pular não fecha seção').toBe(0);
  });
});
