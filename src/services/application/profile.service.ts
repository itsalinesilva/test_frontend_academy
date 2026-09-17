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
    const userId = targetUserId || session?.user.id || 'usr_founder_1';

    let record = await this.unifiedRepo.findByUserId(userId);

    // If no record exists yet for this user (e.g. newly registered user), build one from session
    if (!record) {
      const basicProfile = await this.profileRepo.findByUserId(userId);
      const user = session?.user;

      record = {
        userId,
        displayName: basicProfile?.displayName || user?.name || 'Músico Acadêmico',
        title: basicProfile?.title || 'Estudante da Academia',
        headline: basicProfile?.headline || 'Música de Concerto • Investigação Tonal',
        biography: basicProfile?.biography || 'Estudante de música e performance na Academia Musical Digital.',
        avatarUrl: basicProfile?.avatarUrl || user?.avatarUrl,
        avatarSource: basicProfile?.avatarSource || 'google',
        primaryRole: user?.primaryRole || UserRole.ALUNO,
        assignedRoles: user?.assignedRoles || [UserRole.ALUNO],
        instruments: basicProfile?.instruments || ['Piano', 'Violino'],
        musicalInterests: basicProfile?.musicalInterests || ['Harmonia Funcional', 'Contraponto'],
        experienceLevel: basicProfile?.experienceLevel || 'intermediario',
        overallVisibility: basicProfile?.isPublic ? 'public' : 'private',
        officialLinks: [],
        sectionsConfig: [
          { key: 'academic', label: 'Academia & Cursos', enabled: true, visibility: 'public', order: 1 },
          { key: 'practice', label: 'Prática & Habilidades', enabled: true, visibility: 'public', order: 2 },
          { key: 'studio', label: 'Estúdio & Portfólio', enabled: true, visibility: 'public', order: 3 },
          { key: 'worlds', label: 'Mundos & Passaportes', enabled: true, visibility: 'public', order: 4 },
          { key: 'community', label: 'Comunidade & Conexões', enabled: true, visibility: 'public', order: 5 },
          { key: 'rooms', label: 'Salas & Cátedras', enabled: true, visibility: 'public', order: 6 },
          { key: 'teacher', label: 'Cátedra Docente', enabled: user?.assignedRoles?.includes(UserRole.PROFESSOR) || false, visibility: 'public', order: 7 },
        ],
        academic: {
          totalStudyHours: basicProfile?.academicProgressSummary?.totalStudyHours || 32,
          enrolledCourses: [],
          learningPaths: [],
          certificates: [],
          competencies: [],
        },
        practice: {
          totalPracticeSessions: basicProfile?.practiceSummary?.totalSessions || 15,
          currentStreakDays: basicProfile?.practiceSummary?.streakDays || 3,
          longestStreakDays: 14,
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
          connectionsCount: 8,
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

    return record;
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
    const integrityHash = `sha256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Date.now().toString(16)}`;

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
      createdAt: new Date().toISOString(),
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
    const currentUserId = session?.user.id || 'usr_founder_1';
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
      profile.connectionsList.push({
        id: `conn_${Date.now()}`,
        targetUserId,
        name: 'Músico Acadêmico Conectado',
        headline: 'Intérprete & Pesquisador',
        primaryInstrument: 'Violino / Teclado',
        role: 'Colega de Concerto',
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
