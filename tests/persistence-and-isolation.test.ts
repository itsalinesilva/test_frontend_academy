// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { PersistentAcademyRepository } from '../src/repositories/academy.repository';
import { PersistentPracticeRepository } from '../src/repositories/practice.repository';
import { PersistentReviewsRepository } from '../src/repositories/reviews.repository';
import { LocalStorageAdapter } from '../src/infrastructure/storage/local-storage';
import { UserAcademyProgress } from '../src/domain/academy';
import { MasteryRecord } from '../src/domain/practice';
import { AvaliacaoDeCurso } from '../src/domain/reviews';
import { StudyRecord } from '../src/domain/study-attendance';

/**
 * As duas perguntas que este arquivo responde são as que a arquitetura sem
 * banco de dados torna perigosas:
 *
 *   1. **O que o aluno faz sobrevive a fechar o navegador?**
 *      Sem servidor, se o localStorage não guardar, ninguém guarda. Um
 *      progresso que some é um curso refeito do zero.
 *
 *   2. **O dado de um aluno chega ao outro?**
 *      O armazenamento é do DISPOSITIVO, não da conta. Computador de casa,
 *      de escola ou de lan house é dividido. Se a leitura não filtrar por
 *      quem está logado, o segundo aluno vê o primeiro — e não precisa de
 *      ataque nenhum para isso acontecer, basta usar o produto.
 *
 * Cada caso aqui nasceu de um defeito real encontrado pelo pente fino, não de
 * uma hipótese: `listMasteriesByUser()` ignorava o `userId` que recebia e
 * devolvia o domínio de habilidade de todo mundo.
 */

const ANA = 'usr_ana';
const BRUNO = 'usr_bruno';

const progress = (userId: string, courseId: string, pct: number): UserAcademyProgress => ({
  userId,
  courseId,
  enrolledAt: new Date().toISOString(),
  completedLessonIds: [`${courseId}_licao_1`],
  completedActivityIds: [],
  passedAssessmentIds: [],
  progressPercentage: pct,
  studyTimeMinutes: 42,
  updatedAt: new Date().toISOString(),
});

const avaliacao = (userId: string, estrelas: 1 | 2 | 3 | 4 | 5, comentario: string): AvaliacaoDeCurso => ({
  id: `rev_crs_teoria_${userId}`,
  courseId: 'crs_teoria',
  userId,
  autor: 'Ana',
  anonima: false,
  estrelas,
  comentario,
  criadaEm: new Date().toISOString(),
  concluiuOCurso: true,
});

const dominio = (userId: string, skillId: string, nivel: number): MasteryRecord => ({
  id: `mst_${userId}_${skillId}`,
  userId,
  skillId,
  level: nivel,
  scorePercentage: nivel * 20,
  totalAttempts: 10,
  successfulAttempts: nivel * 2,
  lastPracticedAt: new Date().toISOString(),
});

beforeEach(() => {
  window.localStorage.clear();
});

describe('o que o aluno faz sobrevive a fechar o navegador', () => {
  it('o progresso gravado é lido de volta por uma instância nova', async () => {
    // Instância nova é o mais perto que este teste chega de recarregar a
    // página: o repositório é reconstruído e só tem o armazenamento.
    const antes = new PersistentAcademyRepository(new LocalStorageAdapter());
    await antes.saveProgress(progress(ANA, 'crs_teoria', 30));

    const depois = new PersistentAcademyRepository(new LocalStorageAdapter());
    const lido = await depois.getProgress(ANA, 'crs_teoria');

    expect(lido).not.toBeNull();
    expect(lido!.progressPercentage).toBe(30);
    expect(lido!.completedLessonIds).toContain('crs_teoria_licao_1');
    expect(lido!.studyTimeMinutes).toBe(42);
  });

  it('gravar de novo atualiza, e não duplica', async () => {
    const repo = new PersistentAcademyRepository(new LocalStorageAdapter());
    await repo.saveProgress(progress(ANA, 'crs_teoria', 30));
    await repo.saveProgress(progress(ANA, 'crs_teoria', 55));

    const todos = await repo.listUserProgress(ANA);
    expect(todos).toHaveLength(1);
    expect(todos[0].progressPercentage).toBe(55);
  });

  it('publicar uma versão nova do catálogo não apaga o progresso', async () => {
    // O catálogo é reescrito a cada versão — foi assim que três cursos
    // apagados do código pararam de aparecer na tela. O risco inverso é
    // reescrever por cima do que é do aluno.
    const repo = new PersistentAcademyRepository(new LocalStorageAdapter());
    await repo.saveProgress(progress(ANA, 'crs_teoria', 70));

    window.localStorage.setItem('amd_academy_catalog_version', '"versao-antiga"');
    new PersistentAcademyRepository(new LocalStorageAdapter());

    const lido = await new PersistentAcademyRepository(new LocalStorageAdapter()).getProgress(
      ANA,
      'crs_teoria'
    );
    expect(lido, 'a republicação do catálogo apagou o progresso do aluno').not.toBeNull();
    expect(lido!.progressPercentage).toBe(70);
  });

  it('a avaliação do curso persiste e continua sendo da autora', async () => {
    const repo = new PersistentReviewsRepository(new LocalStorageAdapter());
    await repo.salvar(avaliacao(ANA, 5, 'O capítulo de intervalos finalmente fez sentido para mim.'));

    const outra = new PersistentReviewsRepository(new LocalStorageAdapter());
    const lida = await outra.forUser(ANA, 'crs_teoria');
    expect(lida?.estrelas).toBe(5);
    expect(lida?.autor).toBe('Ana');
  });

  it('a frequência de estudo persiste por dia', async () => {
    const repo = new PersistentReviewsRepository(new LocalStorageAdapter());
    await repo.recordStudy(ANA, '2026-09-15', 25);
    await repo.recordStudy(ANA, '2026-09-16', 30);

    const outra = new PersistentReviewsRepository(new LocalStorageAdapter());
    const dias = await outra.frequencia(ANA);
    expect(dias).toHaveLength(2);
    expect(dias.reduce((a: number, d: StudyRecord) => a + d.minutos, 0)).toBe(55);
  });
});

describe('o dado de um aluno não chega ao outro no mesmo dispositivo', () => {
  it('o progresso de Ana não aparece para Bruno', async () => {
    const repo = new PersistentAcademyRepository(new LocalStorageAdapter());
    await repo.saveProgress(progress(ANA, 'crs_teoria', 80));

    expect(await repo.getProgress(BRUNO, 'crs_teoria')).toBeNull();
    expect(await repo.listUserProgress(BRUNO)).toEqual([]);
  });

  it('o domínio de habilidade de Ana não aparece para Bruno', async () => {
    /**
     * REGRESSÃO — `listMasteriesByUser(_userId)` recebia o identificador,
     * ignorava, e devolvia a tabela inteira. Quem abrisse o Practice depois
     * de Ana veria o desempenho dela por habilidade.
     */
    const repo = new PersistentPracticeRepository(new LocalStorageAdapter());
    await repo.saveMastery(dominio(ANA, 'skl_intervalos', 4));
    await repo.saveMastery(dominio(BRUNO, 'skl_ritmo', 2));

    const deBruno = await repo.listMasteriesByUser(BRUNO);
    expect(deBruno).toHaveLength(1);
    expect(deBruno[0].skillId).toBe('skl_ritmo');
    expect(deBruno.map((m) => m.userId)).not.toContain(ANA);
  });

  it('a sessão de prática de Ana não aparece para Bruno', async () => {
    const repo = new PersistentPracticeRepository(new LocalStorageAdapter());
    await repo.saveSession({
      id: 'ses_1',
      userId: ANA,
      startedAt: new Date().toISOString(),
    } as never);

    expect(await repo.listSessionsByUser(BRUNO)).toEqual([]);
  });

  it('a avaliação de Ana não é atribuída a Bruno', async () => {
    const repo = new PersistentReviewsRepository(new LocalStorageAdapter());
    await repo.salvar(
      avaliacao(ANA, 4, 'Bom curso, com exercícios bem colocados ao fim de cada capítulo.')
    );

    expect(await repo.forUser(BRUNO, 'crs_teoria')).toBeNull();
  });

  it('a frequência de Ana não aparece para Bruno', async () => {
    const repo = new PersistentReviewsRepository(new LocalStorageAdapter());
    await repo.recordStudy(ANA, '2026-09-15', 25);
    expect(await repo.frequencia(BRUNO)).toEqual([]);
  });
});

describe('o Practice não inventa o passado de quem acabou de chegar', () => {
  it('a sequência de estudo de uma conta nova é zero', async () => {
    /**
     * REGRESSÃO — a semente trazia sete dias de sequência, catorze de
     * recorde e um calendário preenchido. Quem criasse a conta hoje abriria
     * o Practice e veria uma semana de estudo que não fez.
     */
    const repo = new PersistentPracticeRepository(new LocalStorageAdapter());
    const seq = await repo.getStreak(BRUNO);

    expect(seq.currentStreakDays).toBe(0);
    expect(seq.longestStreakDays).toBe(0);
    expect(seq.calendarHistory).toEqual([]);
    expect(seq.userId).toBe(BRUNO);
  });

  it('a meta do dia de uma conta nova tem alvo, e cumprimento zero', async () => {
    const repo = new PersistentPracticeRepository(new LocalStorageAdapter());
    const meta = await repo.getDailyGoal(BRUNO);

    expect(meta.targetMinutes, 'a meta é decisão do produto').toBeGreaterThan(0);
    expect(meta.completedMinutes, 'o cumprimento é do aluno').toBe(0);
    expect(meta.completedExercises).toBe(0);
    expect(meta.isCompleted).toBe(false);
  });

  it('o ranking não traz participante que a plataforma não tem', async () => {
    // A liga trazia Bach em primeiro e Clara Schumann em segundo.
    const repo = new PersistentPracticeRepository(new LocalStorageAdapter());
    expect(await repo.getLeaderboard()).toEqual([]);
  });
});
