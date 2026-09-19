import { describe, it, expect } from 'vitest';
import {
  LIVRETOS_PADRAO,
  PROVAS_PADRAO,
  SIMULADOS_PADRAO,
  livretoDoCurso,
  provaDoCurso,
} from '../src/data/seed-booklets';
import { SEED_COURSES, SEED_MODULES, SEED_ASSESSMENTS } from '../src/data/seed-academy-content';
import {
  validarLivreto,
  montarProvaFinal,
  competenciasNaoCobertas,
  questoesDaAvaliacao,
  totalDeQuestoes,
} from '../src/domain/booklet';

/**
 * O livreto de Teoria ficou dezesseis capítulos para trás quando o curso foi
 * para cinquenta e oito. O resultado era pior que a falta de exercício: o
 * capítulo 5 do livreto perguntava sobre intervalos enquanto a lição 5
 * ensinava semitons. Todos os dezesseis estavam desalinhados, e nada acusou.
 *
 * Estes testes acusam.
 */

describe('todo curso tem caderno de exercícios alinhado às suas lições', () => {
  it('cada curso publicado tem um livreto', () => {
    for (const c of SEED_COURSES) {
      expect(livretoDoCurso(c.id), `${c.title} sem livreto`).toBeTruthy();
    }
  });

  it('o livreto tem exatamente os capítulos do curso, na mesma ordem', () => {
    for (const c of SEED_COURSES) {
      const livreto = livretoDoCurso(c.id)!;
      const modulos = SEED_MODULES.filter((m) => m.courseId === c.id).sort(
        (a, b) => a.order - b.order
      );

      expect(livreto.capitulos.length, `${c.title}: contagem`).toBe(modulos.length);

      livreto.capitulos.forEach((cap, i) => {
        expect(cap.numero, `${c.title} cap ${i}`).toBe(modulos[i].order);
        // O título do módulo carrega o prefixo de numeração; o do livreto não.
        expect(
          modulos[i].title.includes(cap.titulo),
          `${c.title} cap ${cap.numero}: livreto diz "${cap.titulo}", curso diz "${modulos[i].title}"`
        ).toBe(true);
      });
    }
  });

  it('a lição de cada capítulo do livreto existe no curso', () => {
    const ids = new Set<string>(SEED_MODULES.flatMap((m) => m.lessonIds));
    for (const l of LIVRETOS_PADRAO) {
      for (const cap of l.capitulos) {
        expect(
          cap.lessonId !== undefined && ids.has(cap.lessonId),
          `${l.titulo} cap ${cap.numero}: ${cap.lessonId}`
        ).toBe(true);
      }
    }
  });

  it('nenhum capítulo fica sem questão', () => {
    for (const l of LIVRETOS_PADRAO) {
      for (const cap of l.capitulos) {
        expect(cap.questoes.length, `${l.titulo} cap ${cap.numero}`).toBeGreaterThan(0);
      }
    }
  });

  it('todo livreto passa na própria validação', () => {
    for (const l of LIVRETOS_PADRAO) {
      expect(validarLivreto(l), l.titulo).toEqual([]);
    }
  });

  it('nenhuma questão tem id repetido dentro do catálogo inteiro', () => {
    const ids = LIVRETOS_PADRAO.flatMap((l) =>
      l.capitulos.flatMap((c) => c.questoes.map((q) => q.id))
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('prova final', () => {
  it('existe uma para cada curso', () => {
    for (const c of SEED_COURSES) {
      expect(provaDoCurso(c.id), `${c.title} sem prova`).toBeTruthy();
    }
  });

  it('cobre todas as competências que o livreto cobra', () => {
    for (const l of LIVRETOS_PADRAO) {
      const prova = provaDoCurso(l.cursoId)!;
      expect(competenciasNaoCobertas(prova, l), l.titulo).toEqual([]);
    }
  });

  it('as questões são cópias congeladas, não referências ao livreto', () => {
    // Editar o livreto depois não pode mudar uma prova que alguém já fez.
    for (const prova of PROVAS_PADRAO) {
      expect(prova.questaoIds).toEqual([]);
      expect(prova.questoesProprias.length).toBeGreaterThan(0);
      for (const q of prova.questoesProprias) {
        expect(q.id.startsWith('pf_')).toBe(true);
      }
    }
  });

  it('não repete questão dentro da mesma prova', () => {
    for (const prova of PROVAS_PADRAO) {
      const ids = prova.questoesProprias.map((q) => q.id);
      expect(new Set(ids).size, prova.titulo).toBe(ids.length);
    }
  });

  it('a mesma semente produz a mesma prova', () => {
    // Uma prova que muda a cada chamada não pode ser conferida por ninguém.
    const l = LIVRETOS_PADRAO[0];
    const a = montarProvaFinal(l, { semente: 7, totalDeQuestoes: 12 });
    const b = montarProvaFinal(l, { semente: 7, totalDeQuestoes: 12 });
    expect(a.questoesProprias.map((q) => q.id)).toEqual(b.questoesProprias.map((q) => q.id));
  });

  it('sementes diferentes produzem provas diferentes', () => {
    const l = LIVRETOS_PADRAO[0];
    const a = montarProvaFinal(l, { semente: 7, totalDeQuestoes: 20 });
    const b = montarProvaFinal(l, { semente: 8, totalDeQuestoes: 20 });
    expect(a.questoesProprias.map((q) => q.id)).not.toEqual(
      b.questoesProprias.map((q) => q.id)
    );
  });

  it('a prova não excede o tamanho do livreto', () => {
    const l = LIVRETOS_PADRAO[0];
    const gigante = montarProvaFinal(l, { totalDeQuestoes: 9999 });
    expect(gigante.questoesProprias.length).toBeLessThanOrEqual(totalDeQuestoes(l));
  });

  it('entra no catálogo como avaliação do curso', () => {
    for (const c of SEED_COURSES) {
      const noCatalogo = SEED_ASSESSMENTS.filter((a) => a.courseId === c.id);
      expect(noCatalogo.length, `${c.title}`).toBe(1);
      expect(noCatalogo[0].questions.length).toBeGreaterThan(0);
      expect(noCatalogo[0].passingScorePercentage).toBe(70);
      expect(noCatalogo[0].competenciesTested.length).toBeGreaterThan(0);
    }
  });

  it('toda questão da prova tem resposta válida entre as alternativas', () => {
    for (const a of SEED_ASSESSMENTS) {
      for (const q of a.questions) {
        expect(
          q.options.some((o) => o.id === q.correctOptionId),
          `${a.title} / ${q.id}`
        ).toBe(true);
      }
    }
  });
});

describe('simulado', () => {
  it('reúne o livreto inteiro, na ordem dos capítulos', () => {
    // Previsível de propósito: a função dele é revisar, não sortear.
    for (const l of LIVRETOS_PADRAO) {
      const sim = SIMULADOS_PADRAO.find((s) => s.cursoId === l.cursoId)!;
      const esperadas = l.capitulos
        .slice()
        .sort((a, b) => a.numero - b.numero)
        .flatMap((c) => c.questoes.map((q) => q.id));
      expect(sim.questaoIds).toEqual(esperadas);
    }
  });

  it('resolve as referências contra o livreto', () => {
    for (const l of LIVRETOS_PADRAO) {
      const sim = SIMULADOS_PADRAO.find((s) => s.cursoId === l.cursoId)!;
      expect(questoesDaAvaliacao(sim, l).length).toBe(totalDeQuestoes(l));
    }
  });
});
