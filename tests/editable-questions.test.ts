import { describe, it, expect } from 'vitest';
import {
  CAMPOS_EDITAVEIS_DA_QUESTAO,
  EditorialEdit,
  applyEditsToQuestions,
  createdLessonIsValid,
  editId,
  mergeCreatedLessons,
} from '../src/domain/editorial-edit';
import { Questao } from '../src/domain/booklet';

/**
 * As questões passam a ser editáveis.
 *
 * O QUE ESTAVA FALTANDO
 * ---------------------
 * A camada editorial cobria bloco e título de seção. As **174 questões** do
 * curso de Teoria ficavam de fora: dava para ver um erro numa alternativa e
 * não havia como consertá-lo.
 *
 * É o defeito que esta camada existe justamente para não ter — e a pergunta
 * "é editável pelo admin?" do relatório de prontidão foi quem o manteve à
 * vista depois de meses.
 */

const questao = (id: string, prompt: string): Questao =>
  ({
    id,
    prompt,
    tipo: 'MULTIPLA_ESCOLHA',
    choices: [
      { id: 'a', text: 'Terça maior' },
      { id: 'b', text: 'Quinta justa' },
    ],
    resposta: 'b',
    explanation: 'Sete semitons — a proporção 3:2 que torna a quinta consonante.',
    dificuldade: 'MEDIA',
  }) as unknown as Questao;

const edicao = (capitulo: number, q: Questao): EditorialEdit => ({
  id: editId('lic', { tipo: 'QUESTAO', capitulo, questaoId: q.id }),
  lessonId: 'lic',
  alvo: { tipo: 'QUESTAO', capitulo, questaoId: q.id },
  conteudo: q,
  anterior: 'irrelevante',
  editadaPor: 'fundadora',
  editadaEm: new Date().toISOString(),
});

describe('o identificador da edição sai do alvo', () => {
  it('a mesma questão dá sempre a mesma edição', () => {
    // Senão corrigir duas vezes empilharia duas, e a de baixo é que valeria.
    const a = editId('lic', { tipo: 'QUESTAO', capitulo: 10, questaoId: 'q1' });
    const b = editId('lic', { tipo: 'QUESTAO', capitulo: 10, questaoId: 'q1' });
    expect(a).toBe(b);
  });

  it('questões diferentes não colidem', () => {
    /**
     * O gerador de identificador era um ternário que tratava "não é bloco"
     * como "é título de seção". Com um terceiro alvo, duas questões cairiam
     * no mesmo identificador e a correção de uma apagaria a da outra.
     */
    const q1 = editId('lic', { tipo: 'QUESTAO', capitulo: 10, questaoId: 'q1' });
    const q2 = editId('lic', { tipo: 'QUESTAO', capitulo: 10, questaoId: 'q2' });
    const outroCapitulo = editId('lic', { tipo: 'QUESTAO', capitulo: 11, questaoId: 'q1' });

    expect(new Set([q1, q2, outroCapitulo]).size).toBe(3);
  });

  it('não colide com alvo de bloco nem de título', () => {
    const daQuestao = editId('lic', { tipo: 'QUESTAO', capitulo: 1, questaoId: 'x' });
    const doBloco = editId('lic', {
      tipo: 'BLOCO',
      variante: 'TRADITIONAL',
      secaoId: '1',
      blocoId: 'x',
    });
    expect(daQuestao).not.toBe(doBloco);
  });
});

describe('a correção substitui a questão publicada', () => {
  const original = questao('q1', 'Que intervalo é este;');
  const corrigida = questao('q1', 'Que intervalo é este?');

  it('a questão editada aparece no lugar da original', () => {
    const saida = applyEditsToQuestions(10, [original], [edicao(10, corrigida)]);
    expect(saida[0].prompt).toBe('Que intervalo é este?');
  });

  it('as não editadas passam intactas', () => {
    const outra = questao('q2', 'Outra pergunta qualquer, intacta.');
    const saida = applyEditsToQuestions(10, [original, outra], [edicao(10, corrigida)]);

    expect(saida[1]).toBe(outra);
    expect(saida).toHaveLength(2);
  });

  it('edição de outro capítulo não vaza para este', () => {
    // Questão pertence ao capítulo; misturar corrigiria a pergunta errada.
    const saida = applyEditsToQuestions(11, [original], [edicao(10, corrigida)]);
    expect(saida[0].prompt).toBe(original.prompt);
  });

  it('sem edição nenhuma, devolve a mesma lista', () => {
    const lista = [original];
    expect(applyEditsToQuestions(10, lista, [])).toBe(lista);
  });
});

describe('o que se pode corrigir numa questão', () => {
  it('enunciado, alternativas, resposta e explicação', () => {
    /**
     * Os quatro juntos, e não só o enunciado: editar a pergunta deixando a
     * explicação contradizê-la é a incoerência que ninguém percebe até o
     * aluno reclamar.
     */
    expect([...CAMPOS_EDITAVEIS_DA_QUESTAO]).toEqual([
      'prompt',
      'choices',
      'resposta',
      'explanation',
    ]);
  });
});

describe('criar lição nova', () => {
  const nova = (id: string, order: number, titulo = 'Modulação para o relativo') => ({
    id,
    moduleId: 'mod_1',
    courseId: 'crs_teoria',
    order,
    title: titulo,
    blocks: [{ kind: 'MARKDOWN' as const, id: 'b1', markdown: 'Texto da lição.' }],
    durationMinutes: 12,
    criadaPor: 'fundadora',
    criadaEm: new Date().toISOString(),
  });

  it('a lição criada aparece junto das publicadas', () => {
    /**
     * Dava para corrigir o que existe e não dava para acrescentar. Quem
     * percebesse que falta um capítulo não tinha como escrevê-lo sem mexer em
     * `src/data/` — ou seja, sem ser programador.
     */
    const saida = mergeCreatedLessons([], [nova('lic_nova', 1)]);
    expect(saida).toHaveLength(1);
    expect(saida[0].variants.TRADITIONAL?.title).toBe('Modulação para o relativo');
  });

  it('entra na ordem do módulo, e não empilhada no fim', () => {
    // Lição escrita para ser a segunda precisa aparecer como segunda.
    const publicada = {
      id: 'lic_pub',
      moduleId: 'mod_1',
      order: 3,
    } as unknown as Parameters<typeof mergeCreatedLessons>[0][number];

    const saida = mergeCreatedLessons([publicada], [nova('lic_nova', 1)]);
    expect(saida.map((l) => l.id)).toEqual(['lic_nova', 'lic_pub']);
  });

  it('sem lição criada, devolve a lista publicada', () => {
    const publicadas: Parameters<typeof mergeCreatedLessons>[0] = [];
    expect(mergeCreatedLessons(publicadas, [])).toBe(publicadas);
  });

  it('lição sem bloco não é válida', () => {
    /**
     * Ela entraria no catálogo como uma entrada que abre vazia — e o aluno
     * conclui que a plataforma quebrou, não que ninguém escreveu ainda.
     */
    expect(createdLessonIsValid({ ...nova('x', 1), blocks: [] })).toBe(false);
  });

  it('lição sem título também não', () => {
    expect(createdLessonIsValid({ ...nova('x', 1, ' ') })).toBe(false);
  });

  it('com título e bloco, é válida', () => {
    expect(createdLessonIsValid(nova('x', 1))).toBe(true);
  });
});
