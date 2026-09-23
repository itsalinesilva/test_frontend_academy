import { Profile, UserCapability, UserRole } from '../../domain/types';
import {
  UnifiedProfileRecord,
  Evidence,
  PortfolioItem,
  ProfileSectionConfig,
  ProfileSectionKey,
  VisibilityLevel,
  TeacherRoomProfile,
} from '../../domain/profile';
import {
  IngestEvidenceRequest,
  IngestEvidenceResponse,
  PublishPortfolioItemRequest,
  UpdatePortfolioItemRequest,
  UpdateProfileHeaderRequest,
} from '../../contracts/profile-contracts';
import { ProfileRepository, PersistentProfileRepository } from '../../repositories/profile.repository';
import {
  UnifiedProfileRepository,
  PersistentUnifiedProfileRepository,
} from '../../repositories/unified-profile.repository';
import { entitlementService } from '../../infrastructure/entitlements/entitlement-service';
import { auditService } from '../../infrastructure/telemetry/audit-service';
import { AuditAction, AuditSeverity } from '../../domain/audit';
import { authService } from './auth.service';
import { NotFoundError, UnauthorizedError } from '../../domain/errors';
import { computeEvidenceHash } from '../../domain/integrity';
import { medirPerfil } from '../../domain/perfil-medido';
// Os repositórios, e não os serviços: `practice.service` e `academy.service` já importam este arquivo.
import { practiceRepository } from '../../repositories/practice.repository';
import { academyRepository } from '../../repositories/academy.repository';

export class ProfileService {
  private profileRepo: ProfileRepository;
  private unifiedRepo: UnifiedProfileRepository;

  constructor(
    profileRepo: ProfileRepository = new PersistentProfileRepository(),
    unifiedRepo: UnifiedProfileRepository = new PersistentUnifiedProfileRepository()
  ) {
    this.profileRepo = profileRepo;
    this.unifiedRepo = unifiedRepo;
  }

  // ---------------------------------------------------------
  // Basic Profile (Compatibility)
  // ---------------------------------------------------------
  public async getProfile(userId: string): Promise<Profile> {
    const session = await authService.getActiveSession();
    const isOwner = session?.user.id === userId;

    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Perfil de Usuário', userId);
    }

    if (!profile.isPublic && !isOwner) {
      entitlementService.assertCapability(session?.user || null, UserCapability.VIEW_PUBLIC_PROFILE);
    }

    return profile;
  }

  public async updateMyProfile(
    updates: Partial<
      Pick<
        Profile,
        | 'displayName'
        | 'title'
        | 'biography'
        | 'headline'
        | 'avatarSource'
        | 'avatarUrl'
        | 'instruments'
        | 'musicalInterests'
        | 'experienceLevel'
        | 'isPublic'
        | 'privacySettings'
        | 'guardian'
        | 'childControls'
      >
    >
  ): Promise<Profile> {
    const session = await authService.getActiveSession();
    entitlementService.assertCapability(session?.user || null, UserCapability.EDIT_OWN_PROFILE);

    const existing = await this.getProfile(session!.user.id);
    const updated: Profile = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const saved = await this.profileRepo.save(updated);

    // Also synchronize into Unified Profile
    const unified = await this.unifiedRepo.findByUserId(session!.user.id);
    if (unified) {
      if (updates.displayName) unified.displayName = updates.displayName;
      if (updates.title) unified.title = updates.title;
      if (updates.biography) unified.biography = updates.biography;
      if (updates.headline) unified.headline = updates.headline;
      if (updates.instruments) unified.instruments = updates.instruments;
      if (updates.musicalInterests) unified.musicalInterests = updates.musicalInterests;
      if (updates.experienceLevel) unified.experienceLevel = updates.experienceLevel;
      if (updates.avatarUrl) unified.avatarUrl = updates.avatarUrl;
      await this.unifiedRepo.save(unified);
    }

    await auditService.logEvent(
      AuditAction.PROFILE_INITIALIZED,
      { id: session!.user.id, email: session!.user.email },
      AuditSeverity.INFO,
      { metadata: { updatedFields: Object.keys(updates) } }
    );

    return saved;
  }

  // ---------------------------------------------------------
  // Unified Profile System (Docs 02, 08, 30, 54)
  // ---------------------------------------------------------
  public async getUnifiedProfile(targetUserId?: string): Promise<UnifiedProfileRecord> {
    const session = await authService.getActiveSession();
    // Sem alvo explícito e sem sessão não há perfil a devolver. O fallback
    // anterior entregava o perfil da fundadora a qualquer visitante anônimo
    // (CLAUDE_AUDIT.md T-05).
    const userId = targetUserId || session?.user.id;
    if (!userId) {
      throw new UnauthorizedError('Nenhum perfil identificado. Autentique-se para acessar o seu.');
    }

    let record = await this.unifiedRepo.findByUserId(userId);

    // If no record exists yet for this user (e.g. newly registered user), build one from session
    if (!record) {
      const basicProfile = await this.profileRepo.findByUserId(userId);
      const user = session?.user;

      record = {
        userId,
        displayName: basicProfile?.displayName || user?.name || 'Músico Acadêmico',
        title: basicProfile?.title || 'Estudante da Academia',
        headline: basicProfile?.headline || '',
        biography: basicProfile?.biography || '',
        avatarUrl: basicProfile?.avatarUrl || user?.avatarUrl,
        avatarSource: basicProfile?.avatarSource || 'google',
        primaryRole: user?.primaryRole || UserRole.ALUNO,
        assignedRoles: user?.assignedRoles || [UserRole.ALUNO],
        // Quem acabou de se cadastrar nao toca nenhum instrumento "por
        // padrao". Os valores anteriores — Piano, Violino, Harmonia Funcional,
        // Contraponto, nivel intermediario — apareciam no perfil de alguem
        // que nunca os informou.
        instruments: basicProfile?.instruments || [],
        musicalInterests: basicProfile?.musicalInterests || [],
        experienceLevel: basicProfile?.experienceLevel || 'iniciante',
        // Privado por padrao: aparecer no diretorio publico e opt-in.
        overallVisibility: basicProfile?.isPublic ? 'public' : 'private',
        officialLinks: [],
        // Configuracao unica, vinda do repositorio. Aqui havia uma segunda
        // copia com 7 secoes enquanto o repositorio definia 23 — as telas
        // mostravam conjuntos diferentes conforme o caminho de criacao.
        sectionsConfig: this.unifiedRepo.getDefaultSectionsConfig(),
        academic: {
          // AUD-7: aqui nasciam 32 h, 15 sessões, 3 e 14 dias, 8 conexões.
          // Os números vêm de `medirPerfil`, logo abaixo, a cada leitura.
          totalStudyHours: 0,
          enrolledCourses: [],
          learningPaths: [],
          certificates: [],
          competencies: [],
        },
        practice: {
          totalPracticeSessions: 0,
          currentStreakDays: 0,
          longestStreakDays: 0,
          skills: [],
          repertoire: [],
          achievements: [],
          recentExercises: [],
        },
        portfolio: [],
        evidences: [],
        worlds: {
          passports: [],
          badges: [],
          microcredentials: [],
        },
        community: {
          connectionsCount: 0,
          posts: [],
          forumParticipations: [],
          eventsAttended: [],
        },
        rooms: {
          attendedRooms: [],
        },
        updatedAt: new Date().toISOString(),
      };

      await this.unifiedRepo.save(record);
    }

    // Keep primary role in sync with active session user
    if (session && session.user.id === userId && record.primaryRole !== session.user.primaryRole) {
      record.primaryRole = session.user.primaryRole;
      record.assignedRoles = session.user.assignedRoles;
    }

    // AUD-7: o dono vê os números medidos agora, e eles ficam gravados — é o
    // registro gravado que a projeção pública mostra aos outros.
    if (session && session.user.id === userId) {
      const [resultados, ofensiva, progressos, dominios, habilidades] = await Promise.all([
        practiceRepository.listResultsByUser(userId).catch(() => []),
        practiceRepository.getStreak(userId).catch(() => null),
        academyRepository.listUserProgress(userId).catch(() => []),
        practiceRepository.listMasteriesByUser(userId).catch(() => []),
        practiceRepository.listSkills().catch(() => []),
      ]);
      const nomes = new Map(habilidades.map((h) => [h.id, h.name]));
      const m = medirPerfil({ resultados, ofensiva, progressos, dominios, nomes });
      record.academic = { ...record.academic, totalStudyHours: m.totalStudyHours };
      record.practice = {
        ...record.practice,
        totalPracticeSessions: m.totalPracticeSessions,
        currentStreakDays: m.currentStreakDays,
        longestStreakDays: m.longestStreakDays,
        recentExercises: m.recentExercises,
        skills: m.skills,
      };
      record.community = { ...record.community, connectionsCount: record.connectionsList?.length ?? 0 };
      await this.unifiedRepo.save(record);
    }

    // Quem NAO e o dono recebe a projecao filtrada, nunca o registro cru.
    // Antes, `getUnifiedProfile('id_de_outra_pessoa')` devolvia o registro
    // completo — biografia privada, evidencias privadas, portfolio nao
    // publicado — a qualquer visitante. Nao dava para alcancar isso pela UI
    // porque /profile/:userId nao existia; com a rota criada seria um
    // vazamento por URL (CLAUDE_AUDIT.md P-02).
    if (!session || session.user.id !== userId) {
      const projecao = await this.unifiedRepo.getPublicProjection(userId);
      if (!projecao) {
        throw new NotFoundError('Perfil', userId);
      }
      return projecao;
    }

    return record;
  }

  /**
   * Diretorio de pessoas visiveis publicamente.
   *
   * Sem isto a premissa "LinkedIn de musicos" nao fecha: havia rota de perfil
   * proprio, mas nenhum caminho para encontrar outra pessoa.
   */
  public async listDirectory(): Promise<UnifiedProfileRecord[]> {
    return this.unifiedRepo.listPublicDirectory();
  }

  /**
   * Server-approved public projection.
   * In strict compliance with Docs 30 & 54:
   * "Server builds a visibility-filtered projection. Never send private fields to frontend and rely on CSS to hide them."
   */
  public async getPublicProfileProjection(userId: string): Promise<UnifiedProfileRecord | null> {
    return this.unifiedRepo.getPublicProjection(userId);
  }

  /**
   * Update Profile Header, Bio, Instruments and Official Links
   */
  public async updateProfileHeader(updates: UpdateProfileHeaderRequest): Promise<UnifiedProfileRecord> {
    const session = await authService.getActiveSession();
    if (!session) throw new UnauthorizedError('Sessão ativa necessária.');

    const profile = await this.getUnifiedProfile(session.user.id);

    profile.displayName = updates.displayName;
    profile.title = updates.title;
    profile.headline = updates.headline;
    profile.biography = updates.biography;
    if (updates.avatarUrl !== undefined) profile.avatarUrl = updates.avatarUrl;
    profile.instruments = updates.instruments;
    profile.musicalInterests = updates.musicalInterests;
    profile.experienceLevel = updates.experienceLevel;
    profile.officialLinks = updates.officialLinks;
    profile.overallVisibility = updates.overallVisibility;
    if (updates.specialties !== undefined) profile.specialties = updates.specialties;
    if (updates.location !== undefined) profile.location = updates.location;
    if (updates.currentStatus !== undefined) profile.currentStatus = updates.currentStatus;
    if (updates.capabilities !== undefined) profile.capabilities = updates.capabilities;

    const saved = await this.unifiedRepo.save(profile);

    // Sync basic profile
    await this.profileRepo.save({
      userId: session.user.id,
      displayName: updates.displayName,
      title: updates.title,
      headline: updates.headline,
      biography: updates.biography,
      instruments: updates.instruments,
      musicalInterests: updates.musicalInterests,
      experienceLevel: updates.experienceLevel,
      isPublic: updates.overallVisibility === 'public',
      avatarUrl: profile.avatarUrl,
      academicProgressSummary: profile.academic ? {
        coursesEnrolled: profile.academic.enrolledCourses.length,
        coursesCompleted: profile.academic.enrolledCourses.filter(c => c.status === 'concluido').length,
        totalStudyHours: profile.academic.totalStudyHours,
      } : { coursesEnrolled: 0, coursesCompleted: 0, totalStudyHours: 0 },
      practiceSummary: profile.practice ? {
        totalSessions: profile.practice.totalPracticeSessions,
        streakDays: profile.practice.currentStreakDays,
        lastPracticeAt: new Date().toISOString(),
      } : { totalSessions: 0, streakDays: 0 },
      updatedAt: new Date().toISOString(),
    });

    await auditService.logEvent(
      AuditAction.PROFILE_INITIALIZED,
      { id: session.user.id, email: session.user.email },
      AuditSeverity.INFO,
      { metadata: { action: 'header_updated' } }
    );

    return saved;
  }

  /**
   * Reorder and Configure Visibility of Profile Lenses/Sections
   */
  public async updateSectionsConfig(sections: ProfileSectionConfig[]): Promise<ProfileSectionConfig[]> {
    const session = await authService.getActiveSession();
    if (!session) throw new UnauthorizedError('Sessão ativa necessária.');

    const profile = await this.getUnifiedProfile(session.user.id);
    profile.sectionsConfig = sections;
    await this.unifiedRepo.save(profile);

    await auditService.logEvent(
      AuditAction.PROFILE_INITIALIZED,
      { id: session.user.id, email: session.user.email },
      AuditSeverity.INFO,
      { metadata: { action: 'sections_reconfigured', count: sections.length } }
    );

    return sections;
  }

  public async toggleSectionVisibility(
    sectionKey: ProfileSectionKey,
    visibility: VisibilityLevel,
    enabled?: boolean
  ): Promise<ProfileSectionConfig[]> {
    const session = await authService.getActiveSession();
    if (!session) throw new UnauthorizedError('Sessão ativa necessária.');

    const profile = await this.getUnifiedProfile(session.user.id);
    const target = profile.sectionsConfig.find((s) => s.key === sectionKey);
    if (target) {
      target.visibility = visibility;
      if (enabled !== undefined) target.enabled = enabled;
      await this.unifiedRepo.save(profile);
    }
    return profile.sectionsConfig;
  }

  public async reorderSections(orderedKeys: ProfileSectionKey[]): Promise<ProfileSectionConfig[]> {
    const session = await authService.getActiveSession();
    if (!session) throw new UnauthorizedError('Sessão ativa necessária.');

    const profile = await this.getUnifiedProfile(session.user.id);
    orderedKeys.forEach((key, index) => {
      const sec = profile.sectionsConfig.find((s) => s.key === key);
      if (sec) sec.order = index + 1;
    });

    profile.sectionsConfig.sort((a, b) => a.order - b.order);
    await this.unifiedRepo.save(profile);
    return profile.sectionsConfig;
  }

  // ---------------------------------------------------------
  // Portfolio Publishing & Management (Doc 08)
  // ---------------------------------------------------------
  public async publishPortfolioItem(request: PublishPortfolioItemRequest): Promise<PortfolioItem> {
    const session = await authService.getActiveSession();
    if (!session) throw new UnauthorizedError('Sessão ativa necessária.');

    const profile = await this.getUnifiedProfile(session.user.id);

    const newItem: PortfolioItem = {
      id: `port_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: session.user.id,
      title: request.title,
      category: request.category,
      context: request.context,
      objective: request.objective,
      userRoleInProject: request.userRoleInProject,
      skills: request.skills,
      instruments: request.instruments,
      workReferences: request.workReferences,
      processNotes: request.processNotes,
      resultSummary: request.resultSummary,
      evidenceIds: request.evidenceIds,
      artifactUrl: request.artifactUrl,
      audioPreviewUrl: request.audioPreviewUrl,
      visibility: request.visibility,
      version: '1.0.0',
      isFeatured: request.isFeatured ?? true,
      orderIndex: profile.portfolio.length + 1,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await this.unifiedRepo.savePortfolioItem(newItem);

    await auditService.logEvent(
      AuditAction.PROFILE_INITIALIZED,
      { id: session.user.id, email: session.user.email },
      AuditSeverity.INFO,
      { metadata: { action: 'portfolio_item_published', itemId: newItem.id, title: newItem.title } }
    );

    return saved;
  }

  public async updatePortfolioItem(request: UpdatePortfolioItemRequest): Promise<PortfolioItem> {
    const session = await authService.getActiveSession();
    if (!session) throw new UnauthorizedError('Sessão ativa necessária.');

    const profile = await this.getUnifiedProfile(session.user.id);
    const existing = profile.portfolio.find((p) => p.id === request.id);
    if (!existing) {
      throw new NotFoundError('Item de Portfólio', request.id);
    }

    const updated: PortfolioItem = {
      ...existing,
      ...request,
      updatedAt: new Date().toISOString(),
    };

    const saved = await this.unifiedRepo.savePortfolioItem(updated);
    return saved;
  }

  public async deletePortfolioItem(itemId: string): Promise<boolean> {
    const session = await authService.getActiveSession();
    if (!session) throw new UnauthorizedError('Sessão ativa necessária.');

    return this.unifiedRepo.deletePortfolioItem(session.user.id, itemId);
  }

  public async reorderPortfolioItems(orderedIds: string[]): Promise<PortfolioItem[]> {
    const session = await authService.getActiveSession();
    if (!session) throw new UnauthorizedError('Sessão ativa necessária.');

    const profile = await this.getUnifiedProfile(session.user.id);
    orderedIds.forEach((id, index) => {
      const item = profile.portfolio.find((p) => p.id === id);
      if (item) item.orderIndex = index + 1;
    });

    profile.portfolio.sort((a, b) => a.orderIndex - b.orderIndex);
    await this.unifiedRepo.save(profile);
    return profile.portfolio;
  }

  // ---------------------------------------------------------
  // Teacher Room Management (When role has PROFESSOR)
  // ---------------------------------------------------------
  public async updateTeacherRoomInfo(updates: Partial<TeacherRoomProfile>): Promise<TeacherRoomProfile> {
    const session = await authService.getActiveSession();
    if (!session) throw new UnauthorizedError('Sessão ativa necessária.');

    if (!session.user.assignedRoles.includes(UserRole.PROFESSOR) && session.user.primaryRole !== UserRole.PROFESSOR) {
      throw new UnauthorizedError('Apenas usuários com prerrogativa docente (PROFESSOR) podem gerenciar a Room própria.');
    }

    const profile = await this.getUnifiedProfile(session.user.id);
    if (!profile.rooms.teacherProfile) {
      profile.rooms.teacherProfile = {
        ownRoomId: `room_${session.user.id}`,
        roomName: `Cátedra de ${profile.displayName}`,
        tagline: 'Estudo e Orientação Musical Personalizada',
        description: 'Espaço acadêmico docente para orientações, envio de tarefas e masterclasses.',
        enrolledStudentsCount: 0,
        coursesOffered: [],
        upcomingClassesAndEvents: [],
        guidedProjects: [],
        teacherAnnouncements: [],
        exposeStudentCount: true,
        exposeUpcomingLives: true,
        exposeGuidedProjects: true,
      };
    }

    profile.rooms.teacherProfile = {
      ...profile.rooms.teacherProfile,
      ...updates,
    };

    await this.unifiedRepo.save(profile);
    return profile.rooms.teacherProfile;
  }

  // ---------------------------------------------------------
  // Evidence Receiver Contract (Docs 08 & 30)
  // Prepared for Academy, Practice, Studio, Rooms, Community
  // ---------------------------------------------------------
  public async ingestEvidence(request: IngestEvidenceRequest): Promise<IngestEvidenceResponse> {
    const createdAt = new Date().toISOString();

    // O hash e calculado SOBRE O CONTEUDO, com Web Crypto. O valor anterior
    // era `Math.random()` com "sha256:" na frente: nao derivava do registro,
    // nao detectava adulteracao e ainda assim a UI o anunciava como "prova
    // matematica de integridade" (CLAUDE_AUDIT.md P-07).
    const integrityHash = await computeEvidenceHash({
      userId: request.userId,
      source: request.source,
      sourceEntityId: request.sourceEntityId,
      title: request.title,
      description: request.description,
      artifactType: request.artifactType,
      artifactUrl: request.artifactUrl,
      skills: request.skills || [],
      instruments: request.instruments || [],
      evaluator: request.evaluator,
      createdAt,
    });

    const evidence: Evidence = {
      id: `evi_${request.source}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: request.userId,
      source: request.source,
      sourceEntityId: request.sourceEntityId,
      title: request.title,
      description: request.description,
      artifactType: request.artifactType,
      artifactUrl: request.artifactUrl,
      sha256Hash: integrityHash,
      evaluator: request.evaluator,
      skills: request.skills || [],
      instruments: request.instruments || [],
      metadata: request.metadata || {},
      visibility: request.visibility || 'public',
      createdAt,
    };

    await this.unifiedRepo.addEvidence(evidence);

    await auditService.logEvent(
      AuditAction.PROFILE_INITIALIZED,
      { id: request.userId, email: 'system@academia.mus.br' },
      AuditSeverity.INFO,
      {
        metadata: {
          action: 'evidence_ingested',
          source: request.source,
          evidenceId: evidence.id,
          integrityHash,
        },
      }
    );

    return {
      evidence,
      integrityHash,
      registeredAt: evidence.createdAt,
    };
  }

  public async toggleConnection(targetUserId: string): Promise<{ connected: boolean; count: number }> {
    const session = await authService.getActiveSession();
    if (!session) {
      throw new UnauthorizedError('Autentique-se para gerenciar conexões.');
    }
    const currentUserId = session.user.id;
    const profile = await this.getUnifiedProfile(currentUserId);

    if (!profile.connectionsList) {
      profile.connectionsList = [];
    }

    const existingIdx = profile.connectionsList.findIndex((c) => c.targetUserId === targetUserId);
    let connected = false;

    if (existingIdx >= 0) {
      profile.connectionsList.splice(existingIdx, 1);
      connected = false;
    } else {
      // A identidade vem do perfil de destino. A versao anterior gravava
      // 'Musico Academico Conectado' / 'Interprete & Pesquisador' / 'Violino /
      // Teclado' para QUALQUER pessoa conectada: a lista de conexoes parecia
      // povoada e nenhum nome ali era real (CLAUDE_AUDIT.md P-03).
      const alvo = await this.unifiedRepo.getPublicProjection(targetUserId);
      if (!alvo) {
        throw new NotFoundError('Perfil', targetUserId);
      }
      profile.connectionsList.push({
        id: `conn_${Date.now()}`,
        targetUserId,
        name: alvo.displayName,
        headline: alvo.headline,
        avatarUrl: alvo.avatarUrl,
        primaryInstrument: alvo.instruments[0] ?? 'Nao informado',
        role: alvo.title,
        connectedAt: new Date().toISOString(),
        status: 'connected',
      });
      connected = true;
    }

    profile.community.connectionsCount = profile.connectionsList.length;
    await this.unifiedRepo.save(profile);
    return { connected, count: profile.connectionsList.length };
  }
}

export const profileService = new ProfileService();
