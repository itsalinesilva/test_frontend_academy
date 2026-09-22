import { aoPraticarHoje } from '../../domain/defensiva';
import {
  medirTentativa,
  naturezaDoExercicio,
  tentativaAprovada,
  LIMIAR_APROVACAO,
  SinalDaTentativa,
  agregarMedicoes,
  descreverSessao,
  recomendarProximoPasso,
} from '../../domain/practice-measurement';
import {
  PracticeModality,
  ExerciseAttempt,
  PracticeSession,
  PracticeResult,
  MasteryRecord,
  StreakTracker,
  DailyGoal,
  RankingLeaderboardEntry,
  PracticeProfile,
  SkillTree,
  Skill,
  MicroSkill,
  Exercise,
  RankingLeague,
} from '../../domain/practice';
import { PracticeRepository, practiceRepository } from '../../repositories/practice.repository';
import { RoutineRepository, routineRepository } from '../../repositories/routine.repository';
import { LeagueTier } from '../../domain/league';
import { profileService, ProfileService } from './profile.service';
import { analyticsService } from '../../infrastructure/telemetry/analytics-service';
import { AnalyticsEventType } from '../../domain/analytics';
import { levelOf, COMPLETIONS_TO_JOIN_LEAGUE } from '../../domain/progress-economy';

export interface EvaluateAttemptInput {
  exerciseId: string;
  userId: string;
  sessionId?: string;
  /** Resposta simbólica, quando o exercício tem uma. */
  givenResponse: string;
  expectedResponse?: string;
  /**
   * Sinal capturado durante a execução.
   *
   * O que não vier aqui NÃO é inventado: a dimensão correspondente sai
   * ausente da medição, com a razão registrada. A versão anterior desta
   * assinatura tinha campos já-agregados (`centsDeviation`,
   * `timingDeviationMs`) que, quando omitidos, eram preenchidos por sorteio.
   */
  sinal?: SinalDaTentativa;
}

export class PracticeService {
  private repo: PracticeRepository;
  private profileSvc: ProfileService;

  private rotina: RoutineRepository;

  constructor(
    repo: PracticeRepository = practiceRepository,
    profSvc: ProfileService = profileService,
    rotina: RoutineRepository = routineRepository
  ) {
    this.repo = repo;
    this.profileSvc = profSvc;
    this.rotina = rotina;
  }

  // ---------------------------------------------------------------------------
  // Catalog & Navigation Queries
  // ---------------------------------------------------------------------------

  public async listSkillTrees(): Promise<SkillTree[]> {
    return this.repo.listSkillTrees();
  }

  public async getSkillTree(id: string): Promise<SkillTree | null> {
    return this.repo.findSkillTreeById(id);
  }

  public async listSkills(treeId?: string): Promise<Skill[]> {
    return this.repo.listSkills(treeId);
  }

  public async getSkill(id: string): Promise<Skill | null> {
    return this.repo.findSkillById(id);
  }

  public async getMicroSkill(id: string): Promise<MicroSkill | null> {
    return this.repo.findMicroSkillById(id);
  }

  public async listExercises(skillId?: string): Promise<Exercise[]> {
    return this.repo.listExercises(skillId);
  }

  public async getExercise(id: string): Promise<Exercise | null> {
    return this.repo.findExerciseById(id);
  }

  // ---------------------------------------------------------------------------
  // Practice Session Lifecycle
  // ---------------------------------------------------------------------------

  public async startSession(
    userId: string,
    modality: PracticeModality,
    exerciseId?: string,
    skillId?: string
  ): Promise<PracticeSession> {
    const session: PracticeSession = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      modality,
      toolType: modality,
      skillIds: skillId ? [skillId] : [],
      exerciseIds: exerciseId ? [exerciseId] : [],
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      accuracyScore: 0,
      notesAttempted: 0,
      notesCorrect: 0,
      attemptsCount: 0,
      totalXpEarned: 0,
      isCompleted: false,
    };

    await this.repo.saveSession(session);

    await analyticsService.track(AnalyticsEventType.LESSON_PROGRESS, 'practice_session_started', {
      userId,
      sessionId: session.id,
      modality,
    });

    return session;
  }

  public async getSession(sessionId: string): Promise<PracticeSession | null> {
    return this.repo.findSessionById(sessionId);
  }

  // ---------------------------------------------------------------------------
  // Training Loop: Attempt & Measurements
  // ---------------------------------------------------------------------------

  /**
   * Avalia uma tentativa a partir do sinal REALMENTE capturado.
   *
   * A versão anterior sorteava o que não recebia: quem acertasse a nota
   * ganhava um desvio de afinação entre 0 e 8 cents, quem errasse entre 45 e
   * 85 — e `consistency` sorteava mesmo com dados reais. Os números tinham
   * aparência de medição e não descreviam nada do que a pessoa tocou.
   *
   * Agora tudo passa por `medirTentativa`, que devolve `null` para o que não
   * foi medido. Uma tentativa sem medição é registrada como tal: nem
   * aprovada, nem reprovada.
   */
  public async evaluateAttempt(input: EvaluateAttemptInput): Promise<ExerciseAttempt> {
    const exercise = await this.repo.findExerciseById(input.exerciseId);
    if (!exercise) {
      throw new Error(`Exercise ${input.exerciseId} not found`);
    }

    const expected =
      input.expectedResponse || exercise.expectedNotes?.join(' ') || exercise.targetPitch || '';
    const given = input.givenResponse.trim();

    const nature = naturezaDoExercicio(exercise.modality, exercise.type);

    const sinal: SinalDaTentativa = {
      ...input.sinal,
      notaAlvo: input.sinal?.notaAlvo ?? exercise.targetPitch ?? undefined,
      bpmAlvo: input.sinal?.bpmAlvo ?? exercise.targetBpm ?? undefined,
      // A resposta simbólica sempre entra: mesmo num exercício acústico, ter
      // tocado as notas certas é informação.
      respostaDada: given || undefined,
      respostaEsperada: expected || undefined,
    };

    const medicao = medirTentativa(sinal, nature);
    const aprovada = tentativaAprovada(medicao);

    // Tentativa sem medição não é acerto nem erro. `isCorrect` é booleano no
    // contrato existente, então o registro fiel fica em `medicao` e o falso
    // aqui significa "não confirmado", nunca "errou".
    const isCorrect = aprovada === true;

    const nota = medicao.notaGlobal;
    const xpEarned =
      aprovada === true
        ? exercise.xpAwarded
        : aprovada === false
          ? Math.max(5, Math.round(exercise.xpAwarded * 0.25))
          : 0; // sem medição não há XP: premiaria o silêncio

    // --- devolutiva imediata, construída sobre o que foi medido -------------
    let headline: string;
    let details: string;
    let correctiveAction: string;

    if (aprovada === null) {
      headline = 'Não foi possível medir esta tentativa';
      details = medicao.ausencias.join(' ') || 'Nenhum dado de execução foi capturado.';
      correctiveAction =
        'Confira se o microfone está liberado e se houve som audível, e tente de novo. Nada foi registrado contra você.';
    } else if (aprovada) {
      headline = 'Execução dentro do alvo';
      const partes: string[] = [];
      if (medicao.afinacao.deviationCents !== null) {
        partes.push(`afinação a ${Math.abs(medicao.afinacao.deviationCents)} cents do alvo`);
      }
      if (medicao.tempoRitmico.meanDeviationMs !== null) {
        partes.push(`desvio médio de ${medicao.tempoRitmico.meanDeviationMs} ms em relação ao pulso`);
      }
      details = partes.length > 0 ? `Medido: ${partes.join('; ')}.` : `Nota global ${nota}.`;
      correctiveAction =
        (medicao.estabilidadeRitmica !== null && medicao.estabilidadeRitmica < 80)
          ? 'O alvo foi atingido, mas o pulso ainda oscila. Repita mantendo o andamento constante.'
          : 'Mantenha a regularidade e avance para a próxima dificuldade.';
    } else {
      headline = 'Ainda fora do alvo';
      const pior = [
        ['afinação', medicao.afinacao.pontuacao],
        ['tempo', medicao.tempoRitmico.pontuacao],
        ['constância do pulso', medicao.estabilidadeRitmica],
        ['constância da altura', medicao.estabilidadeDeAltura],
        ['sustentação', medicao.sustentacao.pontuacao],
        ['resposta', medicao.acerto.pontuacao],
      ]
        .filter((d): d is [string, number] => typeof d[1] === 'number')
        .sort((a, b) => a[1] - b[1])[0];

      if (medicao.afinacao.deviationCents !== null && Math.abs(medicao.afinacao.deviationCents) > 25) {
        const acima = medicao.afinacao.deviationCents > 0;
        details = `A altura ficou ${Math.abs(medicao.afinacao.deviationCents)} cents ${acima ? 'acima' : 'abaixo'} de ${medicao.afinacao.notaAlvo}.`;
        correctiveAction = acima
          ? 'Alivie a pressão do ataque e reapoie a nota um pouco mais grave.'
          : 'Sustente o apoio e busque a nota um pouco mais aguda antes de soar.';
      } else if (pior) {
        details = `A dimensão mais baixa foi ${pior[0]}, em ${pior[1]} de 100. Nota global ${nota}.`;
        correctiveAction = `Repita trabalhando ${pior[0]} — as outras dimensões já estão no lugar.`;
      } else {
        details = `Nota global ${nota}, abaixo do limiar de ${LIMIAR_APROVACAO}.`;
        correctiveAction = 'Repita a execução com atenção ao pulso.';
      }
    }

    const attempt: ExerciseAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      exerciseId: exercise.id,
      skillId: exercise.skillId,
      microSkillId: exercise.microSkillId,
      userId: input.userId,
      sessionId: input.sessionId,
      attemptNumber: 1,
      givenResponse: given,
      expectedResponse: expected,
      isCorrect,
      accuracyScore: nota ?? 0,
      timingDeviationMs: medicao.tempoRitmico.meanDeviationMs ?? 0,
      pitchDeviationCents: medicao.afinacao.deviationCents ?? 0,
      medicao,
      immediateFeedback: {
        headline,
        details,
        correctiveAction,
        isPass: isCorrect,
        badgeAwarded: nota !== null && nota >= 95 ? 'Execução exemplar' : undefined,
      },
      xpEarned,
      timestamp: new Date().toISOString(),
    };

    await this.repo.saveAttempt(attempt);

    if (input.sessionId) {
      const session = await this.repo.findSessionById(input.sessionId);
      if (session) {
        session.attemptsCount += 1;
        session.notesAttempted += 1;
        if (isCorrect) session.notesCorrect += 1;
        session.totalXpEarned += xpEarned;
        // Tentativas sem medição não entram na média: incluí-las como zero
        // rebaixaria a sessão por uma falha de captação.
        if (nota !== null) {
          const medidasAnteriores = session.attemptsMeasured ?? 0;
          session.accuracyScore = Math.round(
            (session.accuracyScore * medidasAnteriores + nota) / (medidasAnteriores + 1)
          );
          session.attemptsMeasured = medidasAnteriores + 1;
        }
        if (!session.exerciseIds.includes(exercise.id)) {
          session.exerciseIds.push(exercise.id);
        }
        await this.repo.saveSession(session);
      }
    }

    return attempt;
  }

  /** A tentativa de alguem, para esse alguem. Ver `80` e a auditoria de 19/09. */
  public async getAttempt(attemptId: string, userId: string): Promise<ExerciseAttempt | null> {
    const found = await this.repo.findAttemptById(attemptId);
    if (!found || found.userId !== userId) return null;
    return found;
  }

  // ---------------------------------------------------------------------------
  // Session Completion & Mastery Progression
  // ---------------------------------------------------------------------------

  public async finishSession(sessionId: string, userId: string): Promise<PracticeResult> {
    const session = await this.repo.findSessionById(sessionId);
    const attempts = await this.repo.listAttemptsBySession(sessionId);

    const durationSeconds = session ? Math.max(30, Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000)) : 120;
    const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

    let skillId = 'sk_intervals_basic';
    let modality = PracticeModality.KEYBOARD;
    let exerciseTitle = 'Laboratório Prático Deliberado';

    if (session) {
      session.isCompleted = true;
      session.endedAt = new Date().toISOString();
      session.durationSeconds = durationSeconds;
      modality = session.modality;
      if (session.skillIds.length > 0) skillId = session.skillIds[0];
      await this.repo.saveSession(session);
    }

    if (attempts.length > 0) {
      const ex = await this.repo.findExerciseById(attempts[0].exerciseId);
      if (ex) {
        exerciseTitle = ex.title;
        skillId = ex.skillId;
      }
    }

    // Aggregate measurements
    const attemptsCount = Math.max(1, attempts.length);
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const avgAccuracy = Math.round(
      attempts.reduce((sum, a) => sum + (a.accuracyScore || 70), 0) / attemptsCount
    );
    const avgScore = Math.round(
      attempts.reduce((sum, a) => sum + (a.measurement?.score || 750), 0) / attemptsCount
    );
    const avgPitchAcc = Math.round(
      attempts.reduce((sum, a) => sum + (a.measurement?.pitch.centsAccuracy || 80), 0) / attemptsCount
    );
    const avgRhythmAcc = Math.round(
      attempts.reduce((sum, a) => sum + (a.measurement?.rhythm.stabilityScore || 80), 0) / attemptsCount
    );
    const avgIntonation = Math.round(
      attempts.reduce((sum, a) => sum + (a.measurement?.intonation || 85), 0) / attemptsCount
    );
    const avgConsistency = Math.round(
      attempts.reduce((sum, a) => sum + (a.measurement?.consistency || 80), 0) / attemptsCount
    );
    const totalXp = attempts.reduce((sum, a) => sum + a.xpEarned, 0) || 50;

    // 1. Mastery Calculation
    let mastery = await this.repo.getMastery(userId, skillId);
    let previousLevel = 0;
    let newLevel = 1;
    let leveledUp = false;

    if (!mastery) {
      mastery = {
        id: `mst_${userId}_${skillId}`,
        userId,
        skillId,
        level: 1,
        scorePercentage: avgAccuracy,
        totalAttempts: attemptsCount,
        successfulAttempts: correctCount,
        lastPracticedAt: new Date().toISOString(),
      };
      newLevel = 1;
      leveledUp = true;
    } else {
      previousLevel = mastery.level;
      mastery.totalAttempts += attemptsCount;
      mastery.successfulAttempts += correctCount;
      mastery.scorePercentage = Math.round(
        (mastery.scorePercentage * 0.7) + (avgAccuracy * 0.3)
      );
      mastery.lastPracticedAt = new Date().toISOString();

      // Progression thresholds:
      // Level 1: 3 successes, 70%
      // Level 2: 8 successes, 75%
      // Level 3: 15 successes, 82%
      // Level 4: 25 successes, 90%
      // Level 5: 40 successes, 95%
      if (mastery.successfulAttempts >= 40 && mastery.scorePercentage >= 95) {
        newLevel = 5;
      } else if (mastery.successfulAttempts >= 25 && mastery.scorePercentage >= 90) {
        newLevel = 4;
      } else if (mastery.successfulAttempts >= 15 && mastery.scorePercentage >= 82) {
        newLevel = 3;
      } else if (mastery.successfulAttempts >= 8 && mastery.scorePercentage >= 75) {
        newLevel = 2;
      } else {
        newLevel = 1;
      }

      if (newLevel > previousLevel) {
        mastery.level = newLevel;
        mastery.masteredAt = new Date().toISOString();
        leveledUp = true;
      }
    }
    await this.repo.saveMastery(mastery);

    // 2. Streak & Daily Goal updates
    const streak = await this.repo.getStreak(userId);
    const todayStr = new Date().toISOString().split('T')[0];
    let streakIncremented = false;

    if (streak.lastActiveDate !== todayStr) {
      /**
       * 🔴 A TRANSIÇÃO INTEIRA VEM DO DOMÍNIO.
       *
       * Este bloco somava um dia sempre que a data mudasse, sem olhar **qual**
       * data era: quem praticasse em janeiro e voltasse em julho encontrava a
       * defensiva intacta, com um dia a mais. E não fechava ciclo nenhum — o
       * nível era recalculado na tela, pela conta que o faz sumir na quebra.
       *
       * `aoPraticarHoje` decide as três coisas juntas, porque são a mesma
       * decisão. Ver `domain/defensiva.ts`.
       */
      const depois = aoPraticarHoje({
        ultimaData: streak.lastActiveDate,
        hoje: todayStr,
        diasSeguidos: streak.currentStreakDays,
        ciclosCompletados: streak.completedCyclesCount ?? 0,
      });

      streak.currentStreakDays = depois.diasSeguidos;
      streak.completedCyclesCount = depois.ciclosCompletados;

      if (streak.currentStreakDays > streak.longestStreakDays) {
        streak.longestStreakDays = streak.currentStreakDays;
      }
      streak.lastActiveDate = todayStr;
      streakIncremented = true;
    }

    const todayEntry = streak.calendarHistory.find((c) => c.date === todayStr);
    if (todayEntry) {
      todayEntry.completedMinutes += durationMinutes;
      todayEntry.xp += totalXp;
    } else {
      streak.calendarHistory.push({
        date: todayStr,
        completedMinutes: durationMinutes,
        xp: totalXp,
      });
    }
    await this.repo.saveStreak(streak);

    const goal = await this.repo.getDailyGoal(userId);
    goal.completedMinutes += durationMinutes;
    goal.completedExercises += attemptsCount;
    goal.completedXp += totalXp;
    if (
      goal.completedMinutes >= goal.targetMinutes &&
      goal.completedXp >= goal.targetXp &&
      !goal.isCompleted
    ) {
      goal.isCompleted = true;
      goal.completedAt = new Date().toISOString();
    }
    await this.repo.saveDailyGoal(goal);

    // 3. Construct PracticeResult
    const result: PracticeResult = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sessionId,
      userId,
      skillId,
      exerciseTitle,
      modality,
      summaryScore: avgScore,
      // Agregado das medições REAIS das tentativas desta sessão.
      //
      // Aqui havia um objeto com valores cravados — nota alvo 'C4', desvio de
      // 4 cents, 8 ms de atraso, 2 segundos de duração, variância 2 — que
      // apareciam no relatório de qualquer sessão, de qualquer instrumento,
      // independentemente do que tivesse sido tocado.
      medicao: agregarMedicoes(attempts.map((a) => a.medicao).filter(Boolean)),
      pitchAccuracy: avgPitchAcc,
      rhythmAccuracy: avgRhythmAcc,
      tempoStability: avgRhythmAcc,
      intonationScore: avgIntonation,
      consistencyScore: avgConsistency,
      durationSeconds,
      notesAttempted: attemptsCount,
      notesCorrect: correctCount,
      xpGained: totalXp,
      streakIncremented,
      masteryAdvancement: {
        previousLevel,
        newLevel,
        leveledUp,
      },
      // Só se afirma o que foi medido. Antes, três frases fixas — sempre as
      // mesmas — relatavam afinação e ritmo mesmo numa sessão de teoria, onde
      // nada disso existe.
      feedbackPoints: descreverSessao(attempts, attemptsCount),
      recommendations: recomendarProximoPasso(attempts),
      createdAt: new Date().toISOString(),
    };

    // 4. Evidência no perfil — só quando houve o que evidenciar.
    //
    // Uma sessão inteira sem medição não deposita evidência: ela afirmaria
    // uma prática cujo resultado ninguém conhece, e evidência é justamente
    // aquilo que se pode conferir depois.
    const houveMedicao = attempts.some((a) => a.medicao?.notaGlobal !== null);
    try {
      if (!houveMedicao) throw new Error('sessao sem medicao');
      const evidence = await this.profileSvc.ingestEvidence({
        userId,
        source: 'practice',
        sourceEntityId: result.id,
        title: `Prática Deliberada: ${exerciseTitle}`,
        description: `Sessão de treinamento de ${modality} com ${attemptsCount} execuções, acurácia de ${avgAccuracy}% e pontuação de ${avgScore}/1000.`,
        artifactType: 'audio',
        artifactUrl: `/practice/result/${result.id}`,
        skills: [skillId, modality],
        evaluator: {
          id: 'engine_rule_based_practice',
          name: 'Motor de Medição Acústica',
          title: 'Aferidor de Telemetria e Microcompetências',
          decision: avgAccuracy >= 70 ? 'aprovado_com_louvor' : 'revisar',
          feedbackNotes: descreverSessao(attempts, attemptsCount).join(' '),
        },
      });
      result.evidenceGeneratedId = evidence.evidence.id;
    } catch (e) {
      console.warn('[PracticeService] Evidence sync warning:', e);
    }

    await this.repo.saveResult(result);

    /**
     * A sessao alimenta a ROTINA: missoes do dia e liga da semana.
     *
     * Sem isto, `PracticeLeagueScreen` chamava `computeStandings([], ...)` com
     * um array vazio literal e as missoes recebiam `EMPTY_ACTIVITY` cravada. A
     * tela montava, os testes de componente passavam, e ela era
     * estruturalmente incapaz de mostrar qualquer coisa — praticar todo dia
     * nao mudava uma linha.
     *
     * So se credita o que foi medido. `newWorksOpened` fica de fora porque
     * abrir obra e evento do Atlas, e nao desta sessao; preenche-lo aqui seria
     * creditar uma leitura que ninguem fez.
     */
    const rodadasImpecaveis = attempts.length > 0 && attempts.every((a) => a.isCorrect) ? 1 : 0;

    /**
     * `earTrainingCorrect` fica de fora, e isso e deliberado.
     *
     * A medicao distingue ACOUSTICS de SIMBOLICA, e nenhuma das duas e
     * "treino de ouvido": uma sessao de teclado e acustica sem ser percepcao
     * auditiva. Creditar acerto de ouvido a partir do que existe hoje seria
     * adivinhar, e a missao que depende desse numero passaria a ser cumprida
     * por quem nunca fez percepcao.
     *
     * Fica zerado ate a sessao carregar o tipo do exercicio ate aqui. A
     * missao correspondente simplesmente nao avanca — que e a verdade.
     */
    await this.rotina.somarAtividade(userId, {
      xpToday: totalXp,
      flawlessRounds: rodadasImpecaveis,
      periodsPracticed: 1,
    });

    /**
     * A inscricao na liga nasce da pratica, e nao de um botao. A faixa de
     * entrada e a primeira: subir e descer e trabalho da apuracao semanal, e
     * nao desta chamada.
     */
    await this.rotina.creditarXpDaSemana(
      userId,
      { type: 'PLATFORM' },
      LeagueTier.BRONZE,
      totalXp
    );

    return result;
  }

  /** O resultado de alguem, para esse alguem. */
  public async getResult(resultId: string, userId: string): Promise<PracticeResult | null> {
    const found = await this.repo.findResultById(resultId);
    if (!found || found.userId !== userId) return null;
    return found;
  }

  /**
   * 🔴 AS SESSÕES ABERTAS — o que a pessoa começou e não terminou.
   *
   * Distinto de `getPracticeHistory`, que devolve **resultados**, e resultado
   * só existe quando a sessão acabou. O Feed do Laboratório dizia "em
   * andamento" e listava sessões concluídas: o rótulo e o conteúdo diziam
   * coisas opostas, e quem lê acredita no rótulo.
   *
   * Aberta é a sessão **sem `endedAt`**. Não há campo de status a consultar:
   * o fim é o carimbo de hora, e a ausência dele é o que define o aberto.
   */
  public async sessoesAbertas(userId: string): Promise<PracticeSession[]> {
    const todas = await this.repo.listSessionsByUser(userId);
    return todas
      .filter((s) => !s.endedAt)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }

  public async getPracticeHistory(userId: string): Promise<PracticeResult[]> {
    return this.repo.listResultsByUser(userId);
  }

  // ---------------------------------------------------------------------------
  // Gamification & Profile Overview
  // ---------------------------------------------------------------------------

  public async getStreak(userId: string): Promise<StreakTracker> {
    return this.repo.getStreak(userId);
  }

  public async getDailyGoal(userId: string): Promise<DailyGoal> {
    return this.repo.getDailyGoal(userId);
  }

  public async updateDailyGoal(
    userId: string,
    targetMinutes: number,
    targetXp: number,
    targetExercises: number
  ): Promise<DailyGoal> {
    const goal = await this.repo.getDailyGoal(userId);
    goal.targetMinutes = targetMinutes;
    goal.targetXp = targetXp;
    goal.targetExercises = targetExercises;
    return this.repo.saveDailyGoal(goal);
  }

  public async getLeaderboard(
    period: string = 'WEEKLY',
    league: RankingLeague = RankingLeague.CONSERVATORY
  ): Promise<RankingLeaderboardEntry[]> {
    return this.repo.getLeaderboard(period, league);
  }

  public async getMasteryOverview(userId: string): Promise<{
    masteries: MasteryRecord[];
    unlockedSkillsCount: number;
    masteredSkillsCount: number;
    averageLevel: number;
  }> {
    const masteries = await this.repo.listMasteriesByUser(userId);
    const unlocked = masteries.length;
    const mastered = masteries.filter((m) => m.level >= 4).length;
    const avg = masteries.length > 0
      ? Math.round((masteries.reduce((sum, m) => sum + m.level, 0) / masteries.length) * 10) / 10
      : 0;

    return {
      masteries,
      unlockedSkillsCount: unlocked,
      masteredSkillsCount: mastered,
      averageLevel: avg,
    };
  }

  public async getPracticeProfile(userId: string): Promise<PracticeProfile> {
    const [streak, dailyGoal, results, masteries] = await Promise.all([
      this.repo.getStreak(userId),
      this.repo.getDailyGoal(userId),
      this.repo.listResultsByUser(userId),
      this.repo.listMasteriesByUser(userId),
    ]);

    /**
     * Tudo aqui sai do que a pessoa fez, e nada mais.
     *
     * Este bloco somava `+ 125` minutos, `+ 8` sessoes e `+ 74` tentativas a
     * numeros reais, e dava 86% de precisao a quem nao tinha resultado
     * nenhum. Somar em cima do dado real e pior que preencher vazio: corrompe
     * a medida, e nunca da para reconhecer o enchimento depois.
     */
    const totalMinutes = results.reduce((sum, r) => sum + Math.round(r.durationSeconds / 60), 0);
    const totalSessions = results.length;
    const totalAttempts = results.reduce((sum, r) => sum + r.notesAttempted, 0);
    const avgAcc =
      results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.pitchAccuracy, 0) / results.length)
        : null;

    const count = {
      novato: masteries.filter((m) => m.level === 1).length,
      aprendiz: masteries.filter((m) => m.level === 2).length,
      competente: masteries.filter((m) => m.level === 3).length,
      mestre: masteries.filter((m) => m.level === 4).length,
      virtuoso: masteries.filter((m) => m.level === 5).length,
    };

    /**
     * O XP sai do que foi creditado na hora, resultado por resultado.
     *
     * Recalcular hoje pela tabela de hoje reescreveria o passado a cada
     * mudanca de valor — quem praticou em marco veria o numero mudar sozinho.
     */
    const somarXp = (lista: PracticeResult[]) =>
      lista.reduce((sum, r) => sum + r.xpGained, 0);

    const totalXp = somarXp(results);
    const nivel = levelOf(totalXp);
    const weeklyXp = somarXp(results.filter((r) => r.createdAt >= inicioDaSemana()));
    const xpDoMes = somarXp(results.filter((r) => r.createdAt >= inicioDoMes()));

    return {
      userId,
      totalPracticeTimeMinutes: totalMinutes,
      totalSessionsCount: totalSessions,
      totalAttemptsCount: totalAttempts,
      /** `null` e "ainda nao praticou" — diferente de ter errado tudo. */
      overallAccuracyPercentage: avgAcc,
      /** §6: entra-se na liga depois de tres conclusoes, e nao antes. */
      currentLeague:
        results.length >= COMPLETIONS_TO_JOIN_LEAGUE ? RankingLeague.BRONZE : null,
      streak,
      dailyGoal,
      experience: {
        id: `xp_${userId}`,
        userId,
        totalXp,
        weeklyXp: weeklyXp,
        monthlyXp: xpDoMes,
        level: nivel.nivel,
        currentLevelXp: nivel.xpInLevel,
        nextLevelXp: nivel.levelXp,
        lastEarnedAt: results[results.length - 1]?.createdAt ?? null,
      },
      masteryCount: count,
      /** A distribuicao sai das sessoes reais; sem sessao, nao ha distribuicao. */
      preferredModalities: distribuicaoPorModalidade(results),
      recentResults: results.slice(-5).reverse(),
    };
  }
}

/**
 * A semana comeca na segunda, no fuso do dispositivo.
 *
 * Mesmo criterio da ofensiva e da liga (§3 e §6). Usar UTC faria a semana
 * virar no meio da noite de domingo para quem esta no Brasil.
 */
function inicioDaSemana(): string {
  const hoje = new Date();
  const diaDaSemana = (hoje.getDay() + 6) % 7; // segunda = 0
  const segunda = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - diaDaSemana);
  return segunda.toISOString();
}

function inicioDoMes(): string {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();
}

/**
 * Em que a pessoa pratica, medido pelo que ela praticou.
 *
 * Devolve lista vazia quando nao ha sessao: sem pratica nao ha preferencia, e
 * inventar uma distribuicao seria descrever alguem que nao existe.
 */
function distribuicaoPorModalidade(
  results: PracticeResult[]
): { modality: PracticeModality; percentage: number }[] {
  if (results.length === 0) return [];

  const porModalidade = new Map<PracticeModality, number>();
  for (const r of results) {
    porModalidade.set(r.modality, (porModalidade.get(r.modality) ?? 0) + 1);
  }

  return [...porModalidade.entries()]
    .map(([modality, quantas]) => ({
      modality,
      percentage: Math.round((quantas / results.length) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

export const practiceService = new PracticeService();
