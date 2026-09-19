import { describe, it, expect } from 'vitest';
import {
  calculateLessonWorkload,
  questionMinutes,
  countWords,
  courseHours,
  WORDS_PER_MINUTE,
} from '../src/domain/workload';
import { SEED_COURSES, SEED_LESSONS } from '../src/data/seed-academy-content';
import { LIVRETOS_PADRAO } from '../src/data/seed-booklets';
import { LessonBlock } from '../src/domain/academy';
import { Questao } from '../src/domain/booklet';

/**
 * A carga horária era um número escolhido à mão — "40 min" porque parecia
 * razoável. Um curso que anuncia trinta e cinco horas sem ter contado nada
 * está afirmando ao aluno algo que não verificou.
 *
 * Estes testes garantem que ela continue sendo medida.
 */

const md = (id: string, texto: string): LessonBlock => ({
  kind: 'MARKDOWN',
  id,
  markdown: texto,
});

const questao = (id: string, prompt: string, alts: string[]): Questao => ({
  id,
  prompt,
  tipo: 'MULTIPLA_ESCOLHA',
  choices: alts.map((texto, i) => ({ id: ['a', 'b', 'c', 'd'][i], texto })),
  resposta: 'a',
  explanation: 'x',
  dificuldade: 'basica',
  competencias: ['x'],
});

describe('contagem de palavras', () => {
  it('ignora a marcação de markdown', () => {
    expect(countWords('**uma** _duas_ `três`')).toBe(3);
  });

  it('não conta separadores de tabela como palavra', () => {
    expect(countWords('| a | b |')).toBe(2);
  });
});

describe('tempo de questão', () => {
  it('questão curta leva três minutos', () => {
    const q = questao('q1', 'Quantos tempos tem 4/4?', ['Dois', 'Três', 'Quatro', 'Cinco']);
    expect(questionMinutes(q)).toBe(3);
  });

  it('questão longa leva cinco minutos', () => {
    // Alternativas extensas exigem comparação, não só reconhecimento.
    const longa = 'uma alternativa bastante extensa que descreve um raciocínio inteiro e obriga a comparar com as outras antes de decidir qual delas responde';
    const q = questao('q2', `${longa} ${longa}`, [longa, longa, longa, longa]);
    expect(questionMinutes(q)).toBe(5);
  });

  it('o tempo fica sempre entre três e cinco minutos', () => {
    for (const l of LIVRETOS_PADRAO) {
      for (const c of l.capitulos) {
        for (const q of c.questoes) {
          const m = questionMinutes(q);
          expect(m, `${q.id}`).toBeGreaterThanOrEqual(3);
          expect(m, `${q.id}`).toBeLessThanOrEqual(5);
        }
      }
    }
  });
});

describe('carga de uma lição', () => {
  it('conta o texto na velocidade de leitura de estudo', () => {
    const texto = Array.from({ length: WORDS_PER_MINUTE * 3 }, () => 'palavra').join(' ');
    const carga = calculateLessonWorkload([md('b1', texto)]);
    expect(carga.palavras).toBe(WORDS_PER_MINUTE * 3);
    expect(carga.minutosDeLeitura).toBe(3);
  });

  it('acrescenta o tempo de interação dos laboratórios', () => {
    const semLab = calculateLessonWorkload([md('b1', 'curto')]);
    const comLab = calculateLessonWorkload([
      md('b1', 'curto'),
      { kind: 'INTERVAL_LAB', id: 'l1', title: 'x', lowerNote: 'C4', upperNote: 'E4' },
    ]);
    expect(comLab.minutosDeInteracao).toBeGreaterThan(semLab.minutosDeInteracao);
  });

  it('acrescenta o tempo das questões do capítulo', () => {
    const q = questao('q1', 'Curta?', ['a', 'b', 'c', 'd']);
    const carga = calculateLessonWorkload([md('b1', 'curto')], [q, q, q]);
    expect(carga.minutosDeExercicio).toBe(9);
  });

  it('arredonda para cima, ao minuto', () => {
    // Arredondar de cinco em cinco colapsava as lições em três valores e
    // escondia que um capítulo tem o dobro do texto do outro.
    const texto = Array.from({ length: 1000 }, () => 'palavra').join(' ');
    const carga = calculateLessonWorkload([md('b1', texto)]);
    expect(Number.isInteger(carga.total)).toBe(true);
    expect(carga.total).toBeGreaterThanOrEqual(1000 / WORDS_PER_MINUTE);
  });

  it('nunca devolve menos de cinco minutos', () => {
    expect(calculateLessonWorkload([]).total).toBe(5);
  });
});

describe('a carga declarada pelos cursos é a medida', () => {
  it('a duração de cada lição bate com a medição do seu conteúdo', () => {
    const questoesPorLicao = new Map(
      LIVRETOS_PADRAO.flatMap((l) => l.capitulos.map((c) => [c.lessonId, c.questoes]))
    );

    for (const lesson of SEED_LESSONS) {
      const blocos = lesson.variants.TRADITIONAL.sections.flatMap((s) => s.blocks ?? []);
      const esperado = calculateLessonWorkload(blocos, questoesPorLicao.get(lesson.id) ?? []).total;
      expect(lesson.durationMinutes, lesson.id).toBe(esperado);
    }
  });

  it('a carga do curso é a soma das lições, em horas', () => {
    for (const curso of SEED_COURSES) {
      const minutos = SEED_LESSONS.filter((l) => l.courseId === curso.id).map(
        (l) => l.durationMinutes
      );
      expect(curso.workloadHours, curso.title).toBe(courseHours(minutos));
    }
  });

  it('a duração varia com o tamanho do capítulo, e não em degraus fixos', () => {
    // Antes, os capítulos tinham 25, 30, 35, 40 ou 45 minutos — cinco números
    // escolhidos. Se a medição produzisse poucos valores distintos, estaria
    // escondendo que um capítulo tem o dobro do texto do outro.
    const duracoes = new Set(SEED_LESSONS.map((l) => l.durationMinutes));
    expect(duracoes.size).toBeGreaterThanOrEqual(10);
  });

  it('capítulo com mais texto declara mais tempo', () => {
    const comTexto = SEED_LESSONS.map((l) => ({
      minutos: l.durationMinutes,
      palavras: calculateLessonWorkload(
        l.variants.TRADITIONAL.sections.flatMap((s) => s.blocks ?? [])
      ).palavras,
    }));

    const maior = comTexto.reduce((a, b) => (b.palavras > a.palavras ? b : a));
    const menor = comTexto.reduce((a, b) => (b.palavras < a.palavras ? b : a));
    expect(maior.minutos).toBeGreaterThan(menor.minutos);
  });
});
