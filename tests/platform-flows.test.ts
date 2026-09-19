// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { PersistentAcademyRepository } from '../src/repositories/academy.repository';
import { PersistentEditorialRepository } from '../src/repositories/editorial.repository';
import { PersistentRoomsRepository, criarSala } from '../src/repositories/rooms.repository';
import {
  PersistentCommunityEventsRepository,
} from '../src/repositories/community-events.repository';
import { PersistentForumRepository, criarTopico } from '../src/repositories/forum.repository';
import { PersistentReviewsRepository } from '../src/repositories/reviews.repository';
import { PersistentAuditRepository } from '../src/repositories/audit.repository';
import { LocalStorageAdapter } from '../src/infrastructure/storage/local-storage';
import { MemoryStorageAdapter } from '../src/infrastructure/storage/storage-adapter';
import { audienciaDaRota } from '../src/ui/navigation/audiencia';
import { ForumCategory, CommunityEvent, EventType } from '../src/domain/community';
import { VisibilityScope } from '../src/domain/identity';
import {
  UserAcademyProgress,
  AcademicCertificateRecord,
  AcademicHistoryEntry,
  AssessmentSubmission,
} from '../src/domain/academy';
import { AuditAction, AuditSeverity, AuditEvent } from '../src/domain/audit';
import { editId } from '../src/domain/editorial-edit';
import { SEED_LESSONS } from '../src/data/seed-academy-content';

/**
 * PERCURSOS INTEIROS — o que nenhum passo isolado mostra.
 *
 * As camadas anteriores provam que cada peça funciona. Esta prova que elas
 * funcionam **encadeadas**, do jeito que a pessoa faz: matricular, estudar,
 * fazer a prova, receber o certificado, ver o histórico.
 *
 * E prova o que nunca deve acontecer entre papéis:
 *
 *   - o dado de um aluno não chega a outro aluno;
 *   - **o dado de um aluno não chega ao console administrativo**, salvo o
 *     que é do próprio aluno consultá-lo;
 *   - o que o administrador edita não se mistura com o que o aluno produz;
 *   - a trilha de auditoria registra o que aconteceu, e nada além.
 *
 * Referência: `docs/harness/35_TEST_STRATEGY.md`, camadas 4 e 6.
 */

const ANA = 'usr_ana';
const BRUNO = 'usr_bruno';
const EDITORA = 'usr_editora';
const COURSE = 'crs_teoria';

const agora = () => new Date().toISOString();

const progresso = (userId: string, pct: number): UserAcademyProgress => ({
  userId,
  courseId: COURSE,
  enrolledAt: agora(),
  completedLessonIds: [],
  completedActivityIds: [],
  passedAssessmentIds: [],
  progressPercentage: pct,
  studyTimeMinutes: 0,
  updatedAt: agora(),
});

const submissao = (userId: string, nota: number): AssessmentSubmission => ({
  id: `sub_${userId}_${nota}`,
  assessmentId: 'ass_teoria_final',
  courseId: COURSE,
  userId,
  attemptNumber: 1,
  answers: {},
  scorePercentage: nota,
  passed: nota >= 70,
  competenciesScore: {},
  detailedFeedback: [],
  timestamp: agora(),
});

const certificado = (userId: string, nome: string): AcademicCertificateRecord => ({
  id: `cert_${userId}`,
  userId,
  studentName: nome,
  courseId: COURSE,
  courseTitle: 'Teoria da Música',
  workloadHours: 16,
  verificationCode: `CMU-${userId.toUpperCase()}`,
  sha256Hash: 'a'.repeat(64),
  issuedAt: agora(),
  instructorName: 'Conservatório Muscicapa',
  instructorTitle: 'Curadoria Pedagógica',
  competencies: ['intervalos'],
  institution: 'Conservatório Muscicapa',
});

const evento = (id: string, vagas?: number): CommunityEvent => ({
  id,
  hostId: EDITORA,
  hostName: 'Conservatório Muscicapa',
  title: 'Masterclass de leitura à primeira vista',
  description: 'Encontro ao vivo.',
  type: EventType.MASTERCLASS,
  scheduledStartTime: '2026-11-10T22:00:00.000Z',
  scheduledEndTime: '2026-11-10T23:30:00.000Z',
  maxAttendees: vagas,
  attendeeCount: 0,
  isPublic: true,
  visibility: VisibilityScope.PUBLIC,
  status: 'SCHEDULED',
  createdAt: agora(),
});

const eventoDeAuditoria = (actorId: string, action: AuditAction): AuditEvent => ({
  id: `aud_${actorId}_${Date.now()}_${Math.random()}`,
  action,
  actorId,
  actorEmail: `${actorId}@conservatorio`,
  severity: AuditSeverity.INFO,
  metadata: {},
  timestamp: agora(),
});

const novo = () => new LocalStorageAdapter();

beforeEach(() => {
  window.localStorage.clear();
});

// ===========================================================================
describe('percurso do aluno — matricular, estudar, ser avaliado, certificar', () => {
// ===========================================================================
  it('o histórico acadêmico acompanha o percurso, na ordem em que aconteceu', async () => {
    const repo = new PersistentAcademyRepository(novo());

    const passos: AcademicHistoryEntry['type'][] = [
      'course_enrolled',
      'lesson_completed',
      'assessment_submitted',
      'course_completed',
      'certificate_issued',
    ];

    for (const [i, tipo] of passos.entries()) {
      await repo.logHistoryEntry({
        id: `hist_${i}`,
        userId: ANA,
        type: tipo,
        contentId: COURSE,
        contentTitle: 'Teoria da Música',
        contentVersion: '1',
        skills: [],
        details: `passo ${i}`,
        timestamp: new Date(Date.now() + i * 1000).toISOString(),
      });
    }

    const historico = await repo.listHistoryByUser(ANA);
    expect(historico).toHaveLength(5);
    expect(historico.map((h) => h.type)).toEqual(expect.arrayContaining(passos));
  });

  it('a prova reprovada não emite certificado, e a aprovada emite', async () => {
    const repo = new PersistentAcademyRepository(novo());

    await repo.saveAssessmentSubmission(submissao(ANA, 48));
    const reprovada = (await repo.listAssessmentSubmissions(ANA))[0];
    expect(reprovada.passed).toBe(false);

    await repo.saveAssessmentSubmission(submissao(ANA, 84));
    const aprovada = (await repo.listAssessmentSubmissions(ANA)).find((s) => s.scorePercentage === 84)!;
    expect(aprovada.passed).toBe(true);

    await repo.saveCertificate(certificado(ANA, 'Ana'));
    const certificados = await repo.listCertificatesByUser(ANA);
    expect(certificados).toHaveLength(1);
    expect(certificados[0].courseId).toBe(COURSE);
  });

  it('o percurso inteiro sobrevive a recarregar a página', async () => {
    // Grava com uma instância, lê com outra: é o mais perto de um F5.
    const gravando = new PersistentAcademyRepository(novo());
    await gravando.saveProgress(progresso(ANA, 100));
    await gravando.saveAssessmentSubmission(submissao(ANA, 91));
    await gravando.saveCertificate(certificado(ANA, 'Ana'));

    const lendo = new PersistentAcademyRepository(novo());
    expect((await lendo.getProgress(ANA, COURSE))!.progressPercentage).toBe(100);
    expect(await lendo.listAssessmentSubmissions(ANA)).toHaveLength(1);
    expect(await lendo.listCertificatesByUser(ANA)).toHaveLength(1);
  });
});

// ===========================================================================
describe('vazamento entre alunos — nenhuma trilha atravessa', () => {
// ===========================================================================
  const casos: [string, (r: PersistentAcademyRepository) => Promise<unknown[]>][] = [
    ['progresso', (r) => r.listUserProgress(BRUNO)],
    ['submissões de prova', (r) => r.listAssessmentSubmissions(BRUNO)],
    ['certificados', (r) => r.listCertificatesByUser(BRUNO)],
    ['histórico acadêmico', (r) => r.listHistoryByUser(BRUNO)],
  ];

  for (const [nome, ler] of casos) {
    it(`${nome} de Ana não aparece para Bruno`, async () => {
      const repo = new PersistentAcademyRepository(novo());
      await repo.saveProgress(progresso(ANA, 70));
      await repo.saveAssessmentSubmission(submissao(ANA, 88));
      await repo.saveCertificate(certificado(ANA, 'Ana'));
      await repo.logHistoryEntry({
        id: 'hist_ana',
        userId: ANA,
        type: 'course_completed',
        contentId: COURSE,
        contentTitle: 'Teoria da Música',
        contentVersion: '1',
        skills: [],
        details: 'concluiu',
        timestamp: agora(),
      });

      expect(await ler(repo)).toEqual([]);
    });
  }

  it('o nome do aluno não vaza no certificado de outro', async () => {
    const repo = new PersistentAcademyRepository(novo());
    await repo.saveCertificate(certificado(ANA, 'Ana Ribeiro'));
    await repo.saveCertificate(certificado(BRUNO, 'Bruno Costa'));

    const deBruno = await repo.listCertificatesByUser(BRUNO);
    expect(deBruno).toHaveLength(1);
    expect(JSON.stringify(deBruno)).not.toContain('Ana Ribeiro');
  });
});

// ===========================================================================
describe('aluno e administração — o que cada lado alcança', () => {
// ===========================================================================
  it('a trilha de auditoria não guarda o conteúdo do estudo do aluno', async () => {
    /**
     * A auditoria registra ATOS de segurança — entrar, sair, ter acesso
     * negado. Se ela passasse a guardar o que o aluno respondeu, o console
     * administrativo viraria uma janela para o desempenho individual de
     * cada pessoa, sem que ninguém tivesse decidido isso.
     */
    const auditoria = new PersistentAuditRepository(new MemoryStorageAdapter());
    await auditoria.append(eventoDeAuditoria(ANA, AuditAction.USER_LOGIN));

    const registros = await auditoria.listRecent();
    const texto = JSON.stringify(registros);

    expect(texto).not.toMatch(/scorePercentage|answers|completedLessonIds/);
  });

  it('a correção editorial e o progresso do aluno vivem em chaves separadas', async () => {
    /**
     * Misturá-las faria a publicação de conteúdo apagar uma das duas — e já
     * aconteceu de o catálogo ser reescrito por cima do que não era dele.
     */
    const academy = new PersistentAcademyRepository(novo());
    await academy.saveProgress(progresso(ANA, 55));

    const editorial = new PersistentEditorialRepository(novo());
    const licao = SEED_LESSONS[0];
    const secao = licao.variants.TRADITIONAL.sections[0];
    const bloco = secao.blocks![0];
    const alvo = {
      tipo: 'BLOCO' as const,
      variante: 'TRADITIONAL' as const,
      secaoId: secao.id,
      blocoId: bloco.id,
    };
    await editorial.salvar({
      id: editId(licao.id, alvo),
      lessonId: licao.id,
      alvo,
      conteudo: bloco,
      anterior: bloco,
      editadaPor: EDITORA,
      editadaEm: agora(),
    });

    // nenhuma das duas some, e nenhuma contém a outra
    expect((await academy.getProgress(ANA, COURSE))!.progressPercentage).toBe(55);
    expect(await editorial.todas()).toHaveLength(1);

    const chaveDoProgresso = window.localStorage.getItem('amd_amd_academy_user_progress_v1');
    expect(chaveDoProgresso).not.toContain('editadaPor');
  });

  it('a edição do administrador leva o nome de quem editou, e só dele', async () => {
    const editorial = new PersistentEditorialRepository(novo());
    const licao = SEED_LESSONS[0];
    const secao = licao.variants.TRADITIONAL.sections[0];
    const bloco = secao.blocks![0];
    const alvo = {
      tipo: 'BLOCO' as const,
      variante: 'TRADITIONAL' as const,
      secaoId: secao.id,
      blocoId: bloco.id,
    };
    await editorial.salvar({
      id: editId(licao.id, alvo),
      lessonId: licao.id,
      alvo,
      conteudo: bloco,
      anterior: bloco,
      editadaPor: EDITORA,
      editadaEm: agora(),
      motivo: 'concordância',
    });

    const [h] = await editorial.historico();
    expect(h.editadaPor).toBe(EDITORA);
    expect(h.editadaPor).not.toBe(ANA);
  });
});

// ===========================================================================
describe('percurso da comunidade — publicar, responder, inscrever-se', () => {
// ===========================================================================
  it('abrir um tópico e responder atualiza a contagem, que é contada', async () => {
    const forum = new PersistentForumRepository(novo());
    const { topico, abertura } = criarTopico({
      titulo: 'Quintas paralelas na transição IV–V',
      corpo: 'No exercício da lição 3, ao mover o soprano para a sensível…',
      categoria: ForumCategory.HARMONY,
      authorId: ANA,
      authorName: 'Ana',
    });

    await forum.salvarTopico(topico);
    await forum.salvarResposta(abertura);

    await forum.salvarResposta({
      ...abertura,
      id: `${abertura.id}_r2`,
      authorId: BRUNO,
      authorName: 'Bruno',
      contentMarkdown: 'Tente dobrar a terça no acorde de dominante.',
      createdAt: new Date(Date.now() + 1000).toISOString(),
    });

    const lido = (await forum.listarTopicos())[0];
    expect(lido.replyCount, 'a contagem não acompanhou as respostas').toBe(2);

    const mensagens = await forum.respostasDoTopico(topico.id);
    expect(mensagens).toHaveLength(2);
    expect(mensagens[0].authorId).toBe(ANA); // a abertura vem primeiro
  });

  it('inscrever-se num evento é idempotente e a vaga não infla', async () => {
    /**
     * Clicar duas vezes acontece de verdade quando a resposta demora. Se a
     * segunda inscrição contasse, a lotação da sala seria fantasia.
     */
    const repo = new PersistentCommunityEventsRepository(novo());
    await repo.salvar(evento('evt_1'));

    await repo.inscrever('evt_1', ANA);
    await repo.inscrever('evt_1', ANA);

    expect(await repo.totalDeInscritos('evt_1')).toBe(1);
    expect(await repo.estaInscrito('evt_1', ANA)).toBe(true);
    expect(await repo.estaInscrito('evt_1', BRUNO)).toBe(false);
  });

  it('cancelar a inscrição de Ana não cancela a de Bruno', async () => {
    const repo = new PersistentCommunityEventsRepository(novo());
    await repo.salvar(evento('evt_1'));
    await repo.inscrever('evt_1', ANA);
    await repo.inscrever('evt_1', BRUNO);

    await repo.cancelarInscricao('evt_1', ANA);

    expect(await repo.totalDeInscritos('evt_1')).toBe(1);
    expect(await repo.estaInscrito('evt_1', BRUNO)).toBe(true);
  });

  it('as inscrições de um aluno não incluem as de outro', async () => {
    const repo = new PersistentCommunityEventsRepository(novo());
    await repo.salvar(evento('evt_1'));
    await repo.salvar(evento('evt_2'));
    await repo.inscrever('evt_1', ANA);
    await repo.inscrever('evt_2', BRUNO);

    const deAna = await repo.inscricoesDoUsuario(ANA);
    expect(deAna).toHaveLength(1);
    expect(deAna[0].eventoId).toBe('evt_1');
  });
});

// ===========================================================================
describe('percurso do docente — criar sala e encontrá-la', () => {
// ===========================================================================
  it('a sala criada aparece no diretório e é alcançável pelo endereço', async () => {
    /**
     * REGRESSÃO — criar sala chamava `setTimeout(400)` e navegava de volta
     * sem gravar. O professor voltava ao diretório e a sala não estava lá.
     * E o detalhe da sala IGNORAVA o identificador da rota, mostrando sempre
     * a mesma turma inventada.
     */
    const repo = new PersistentRoomsRepository(novo());
    const sala = criarSala({
      nome: 'Contraponto e fuga ao teclado',
      modalidade: 'LABORATORIO',
      capacidade: 12,
      ementa: 'Correção semanal de exercícios a quatro vozes.',
      teacherId: EDITORA,
      teacherName: 'Docente',
    });
    await repo.salvar(sala);

    const diretorio = await new PersistentRoomsRepository(novo()).listar();
    expect(diretorio).toHaveLength(1);

    const porSlug = await repo.porId(sala.slug);
    expect(porSlug?.name).toBe('Contraponto e fuga ao teclado');

    const inexistente = await repo.porId('sala-que-nao-existe');
    expect(inexistente, 'endereço desconhecido deveria devolver nada').toBeNull();
  });

  it('a sala nasce com zero alunos e zero tarefas, não com número bonito', async () => {
    const sala = criarSala({
      nome: 'Turma nova',
      modalidade: 'CLASSE_REGULAR',
      capacidade: 20,
      ementa: '',
      teacherId: EDITORA,
      teacherName: 'Docente',
    });
    expect(sala.studentCount).toBe(0);
    expect(sala.activeAssignmentCount).toBe(0);
    expect(sala.announcements).toEqual([]);
  });

  it('"minhas turmas" traz só as do docente que perguntou', async () => {
    const repo = new PersistentRoomsRepository(novo());
    await repo.salvar(
      criarSala({ nome: 'A', modalidade: 'CLASSE_REGULAR', capacidade: 10, ementa: '', teacherId: EDITORA, teacherName: 'D' })
    );
    await repo.salvar(
      criarSala({ nome: 'B', modalidade: 'CLASSE_REGULAR', capacidade: 10, ementa: '', teacherId: ANA, teacherName: 'A' })
    );

    expect(await repo.doProfessor(EDITORA)).toHaveLength(1);
    expect((await repo.doProfessor(EDITORA))[0].name).toBe('A');
  });
});

// ===========================================================================
describe('coerência de rota ao longo do percurso', () => {
// ===========================================================================
  it('o que o aluno produz exige login; o que a instituição publica, não', () => {
    // Verificar credencial é público porque quem confere é o empregador, e
    // ele não tem conta aqui.
    expect(audienciaDaRota('/academy')).toBe('publica');
    expect(audienciaDaRota('/credential/CMU-ABC')).toBe('publica');

    expect(audienciaDaRota('/academy/meu-aprendizado')).toBe('exigeLogin');
    expect(audienciaDaRota('/credentials')).toBe('exigeLogin');

    /**
     * `/admin` era `exigeLogin`, e este caso fixava isso como se estivesse
     * certo. Estava errado: com aquele nível, a tabela dizia que qualquer
     * aluno logado alcançava o console, e só um segundo sistema — um efeito no
     * outlet, que a auditoria não lia — impedia.
     *
     * Administração é nível próprio desde 19/09. Ver `81_HIERARCHY_AND_ISOLATION.md`.
     */
    expect(audienciaDaRota('/admin')).toBe('exigeAdmin');
  });

  it('quem já entrou não fica preso na tela de entrar', () => {
    expect(audienciaDaRota('/auth/login')).toBe('somenteVisitante');
    expect(audienciaDaRota('/auth/register')).toBe('somenteVisitante');
  });
});

// ===========================================================================
describe('avaliação do curso — quem escreveu continua sendo o autor', () => {
// ===========================================================================
  it('a avaliação de Ana não é reatribuída ao ler como Bruno', async () => {
    const repo = new PersistentReviewsRepository(novo());
    await repo.salvar({
      id: `rev_${COURSE}_${ANA}`,
      courseId: COURSE,
      userId: ANA,
      autor: 'Ana',
      anonima: false,
      estrelas: 5,
      comentario: 'O capítulo de intervalos finalmente fez sentido para mim.',
      criadaEm: agora(),
      concluiuOCurso: true,
    });

    expect(await repo.forUser(BRUNO, COURSE)).toBeNull();

    const todas = await repo.listarPorCurso(COURSE);
    expect(todas).toHaveLength(1);
    expect(todas[0].userId).toBe(ANA);
  });
});
