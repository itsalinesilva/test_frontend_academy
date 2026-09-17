import { User, Profile, UserRole, AppMode } from '../../domain/types';
import {
  LoginRequest,
  RegisterRequest,
  GoogleOAuthRequest,
  OnboardingCompletionRequest,
  AuthSessionResponse,
  PostAuthResult,
  LinkAccountRequest,
  ResetPasswordRequest,
} from '../../contracts/auth-contracts';
import { UserRepository, PersistentUserRepository } from '../../repositories/user.repository';
import { ProfileRepository, PersistentProfileRepository } from '../../repositories/profile.repository';
import { isFounderAdminEmail } from '../../domain/capabilities';
import { entitlementService } from '../../infrastructure/entitlements/entitlement-service';
import { auditService } from '../../infrastructure/telemetry/audit-service';
import { AuditAction, AuditSeverity } from '../../domain/audit';
import { ValidationError, UnauthorizedError, ForbiddenError } from '../../domain/errors';
import { apiClient } from '../../infrastructure/api/api-client';
import { StorageAdapter, LocalStorageAdapter } from '../../infrastructure/storage/storage-adapter';
import { adminService } from './admin.service';

export class AuthService {
  private userRepo: UserRepository;
  private profileRepo: ProfileRepository;
  private storage: StorageAdapter;
  private sessionKey = 'current_auth_session';

  constructor(
    userRepo: UserRepository = new PersistentUserRepository(),
    profileRepo: ProfileRepository = new PersistentProfileRepository(),
    storage: StorageAdapter = new LocalStorageAdapter()
  ) {
    this.userRepo = userRepo;
    this.profileRepo = profileRepo;
    this.storage = storage;
  }

  /**
   * Retrieves active session with persisted storage verification and entitlement hydration.
   */
  public async getActiveSession(): Promise<AuthSessionResponse | null> {
    const session = await this.storage.getItem<AuthSessionResponse>(this.sessionKey);
    if (!session) return null;

    // Verify token expiration
    if (new Date(session.expiresAt) <= new Date()) {
      await this.logout();
      return null;
    }

    // Refresh user from authoritative repository
    const dbUser = await this.userRepo.findById(session.user.id);
    if (!dbUser) {
      await this.logout();
      return null;
    }

    const capabilities = entitlementService.getEffectiveCapabilities(dbUser);
    const entitlements = entitlementService.getEffectiveEntitlements(dbUser);
    const mode = this.resolveUserMode(dbUser, session.profile);

    const refreshedSession: AuthSessionResponse = {
      ...session,
      user: dbUser,
      capabilities,
      entitlements,
      mode,
    };

    apiClient.setAuthToken(refreshedSession.accessToken);
    return refreshedSession;
  }

  /**
   * Resolves whether the application should operate in Traditional or Kids mode.
   * "MODOS: Traditional, Kids. Professor não é escolhido como um mundo separado. Professor é capability adquirida."
   */
  public resolveUserMode(user: User, profile?: Profile | null): AppMode {
    if (user.primaryRole === UserRole.CRIANCA) {
      return AppMode.KIDS;
    }
    if (profile?.childControls?.isKidModeActive || profile?.mode === AppMode.KIDS) {
      return AppMode.KIDS;
    }
    return AppMode.TRADITIONAL;
  }

  private async createSession(user: User, explicitProfile?: Profile): Promise<AuthSessionResponse> {
    let profile = explicitProfile || (await this.profileRepo.findByUserId(user.id));
    if (!profile) {
      profile = {
        userId: user.id,
        displayName: user.name,
        title: isFounderAdminEmail(user.email) ? 'Fundadora & Curadora' : 'Estudante de Música',
        biography: 'Músico e estudante da Academia Musical Digital.',
        avatarSource: user.avatarUrl ? 'google' : 'initials',
        avatarUrl: user.avatarUrl,
        mode: this.resolveUserMode(user),
        instruments: ['Piano'],
        musicalInterests: ['Teoria Musical', 'Harmonia'],
        experienceLevel: 'iniciante',
        isPublic: user.primaryRole !== UserRole.CRIANCA,
        academicProgressSummary: { coursesEnrolled: 0, coursesCompleted: 0, totalStudyHours: 0 },
        practiceSummary: { totalSessions: 0, streakDays: 0 },
        updatedAt: new Date().toISOString(),
      };
      await this.profileRepo.save(profile);
    }

    // Ensure Google avatar is used when available
    if (user.avatarUrl && !profile.avatarUrl) {
      profile.avatarUrl = user.avatarUrl;
      profile.avatarSource = 'google';
      await this.profileRepo.save(profile);
    }

    const capabilities = entitlementService.getEffectiveCapabilities(user);
    const entitlements = entitlementService.getEffectiveEntitlements(user);
    const mode = this.resolveUserMode(user, profile);

    const session: AuthSessionResponse = {
      user,
      profile,
      capabilities,
      entitlements,
      mode,
      accessToken: `token_${user.id}_${Date.now()}`,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days
    };

    await this.storage.setItem(this.sessionKey, session);
    apiClient.setAuthToken(session.accessToken);
    return session;
  }

  /**
   * CANONICAL PIPELINE:
   * Após autenticação:
   * 1. identificar usuário;
   * 2. carregar profile;
   * 3. carregar capabilities;
   * 4. carregar entitlements;
   * 5. carregar modo;
   * 6. carregar progresso;
   * 7. direcionar para Home.
   */
  public async executePostAuthPipeline(user: User): Promise<PostAuthResult> {
    // 1. Identificar usuário
    const dbUser = (await this.userRepo.findById(user.id)) || user;

    // 2. Carregar profile
    let profile = await this.profileRepo.findByUserId(dbUser.id);
    if (!profile) {
      profile = {
        userId: dbUser.id,
        displayName: dbUser.name,
        title: isFounderAdminEmail(dbUser.email) ? 'Fundadora & Curadora' : 'Estudante de Música',
        biography: 'Músico e estudante da Academia Musical Digital.',
        avatarSource: dbUser.avatarUrl ? 'google' : 'initials',
        avatarUrl: dbUser.avatarUrl,
        mode: this.resolveUserMode(dbUser),
        instruments: ['Piano'],
        musicalInterests: ['Teoria Musical', 'Harmonia'],
        experienceLevel: 'iniciante',
        isPublic: dbUser.primaryRole !== UserRole.CRIANCA,
        onboardingCompleted: isFounderAdminEmail(dbUser.email),
        academicProgressSummary: { coursesEnrolled: 1, coursesCompleted: 0, totalStudyHours: 2 },
        practiceSummary: { totalSessions: 4, streakDays: 3 },
        updatedAt: new Date().toISOString(),
      };
      await this.profileRepo.save(profile);
    }

    // Google Avatar preference
    if (dbUser.avatarUrl && (!profile.avatarUrl || profile.avatarSource !== 'google')) {
      profile.avatarUrl = dbUser.avatarUrl;
      profile.avatarSource = 'google';
      await this.profileRepo.save(profile);
    }

    // 3. Carregar capabilities
    const capabilities = entitlementService.getEffectiveCapabilities(dbUser);

    // 4. Carregar entitlements
    const entitlements = entitlementService.getEffectiveEntitlements(dbUser);

    // 5. Carregar modo (Traditional vs Kids)
    const mode = this.resolveUserMode(dbUser, profile);

    // 6. Carregar progresso
    const progress = {
      coursesEnrolled: profile.academicProgressSummary?.coursesEnrolled || 0,
      coursesCompleted: profile.academicProgressSummary?.coursesCompleted || 0,
      totalStudyHours: profile.academicProgressSummary?.totalStudyHours || 0,
      streakDays: profile.practiceSummary?.streakDays || 0,
      totalSessions: profile.practiceSummary?.totalSessions || 0,
    };

    // 7. Direcionar para Home (se onboarding já concluído, senão '/onboarding')
    const destination = profile.onboardingCompleted ? '/' : '/onboarding';

    return {
      user: dbUser,
      profile,
      capabilities,
      entitlements,
      mode,
      progress,
      destination,
    };
  }

  /**
   * Authentication with Email + Password.
   */
  public async login(req: LoginRequest): Promise<AuthSessionResponse> {
    const email = req.email.trim().toLowerCase();
    let user = await this.userRepo.findByEmail(email);

    if (!user) {
      // Auto-provision if it's one of the founder emails
      if (isFounderAdminEmail(email)) {
        user = {
          id: `usr_founder_${Date.now()}`,
          email,
          name: email.includes('office') ? 'Office Aline Silva (Admin)' : 'Aline Silva (Fundadora)',
          primaryRole: UserRole.ADMIN,
          assignedRoles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MUSICO, UserRole.ALUNO],
          isEmailVerified: true,
          isFounderAdmin: true,
          authProvider: 'email',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await this.userRepo.save(user);
      } else {
        throw new UnauthorizedError('Credenciais inválidas ou usuário não cadastrado.');
      }
    }

    // Password verification check
    if (user.passwordHash && req.password) {
      if (user.passwordHash !== `pwd_${req.password}` && user.passwordHash !== req.password) {
        throw new UnauthorizedError('Senha incorreta.');
      }
    }

    const session = await this.createSession(user);

    await auditService.logEvent(
      AuditAction.USER_LOGIN,
      { id: user.id, email: user.email },
      AuditSeverity.INFO,
      { metadata: { role: user.primaryRole, method: 'email' } }
    );

    return session;
  }

  /**
   * Authentication with Google OAuth.
   * "Avatar do Google deve ser utilizado quando disponível."
   */
  public async loginWithGoogle(req: GoogleOAuthRequest): Promise<AuthSessionResponse> {
    const email = req.email.trim().toLowerCase();
    let user = await this.userRepo.findByEmail(email);
    const isFounder = isFounderAdminEmail(email);

    if (!user) {
      // Provision user with Google Identity
      user = {
        id: isFounder
          ? `usr_founder_${Date.now()}`
          : `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        email,
        name: req.name || email.split('@')[0],
        avatarUrl: req.avatarUrl,
        primaryRole: isFounder ? UserRole.ADMIN : UserRole.ALUNO,
        assignedRoles: isFounder
          ? [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MUSICO, UserRole.ALUNO]
          : [UserRole.ALUNO],
        isEmailVerified: true,
        authProvider: 'google',
        isFounderAdmin: isFounder,
        linkedAccounts: [
          {
            provider: 'google',
            email,
            linkedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await this.userRepo.save(user);

      const profile: Profile = {
        userId: user.id,
        displayName: user.name,
        title: isFounder ? 'Fundadora & Curadora Artística' : 'Estudante de Música',
        biography: isFounder
          ? 'Direção Artística e Preservação Histórica da Academia.'
          : 'Estudante na Academia Musical Digital.',
        avatarSource: 'google',
        avatarUrl: req.avatarUrl,
        mode: AppMode.TRADITIONAL,
        instruments: ['Piano'],
        musicalInterests: ['Teoria Musical', 'Harmonia'],
        experienceLevel: isFounder ? 'conservatorio' : 'iniciante',
        isPublic: true,
        privacySettings: {
          visibility: 'public',
          showAcademicHistory: true,
          showPracticeLog: true,
          showPortfolio: true,
          allowCommunityInteraction: true,
        },
        onboardingCompleted: isFounder,
        academicProgressSummary: { coursesEnrolled: 1, coursesCompleted: 0, totalStudyHours: 0 },
        practiceSummary: { totalSessions: 0, streakDays: 0 },
        updatedAt: new Date().toISOString(),
      };
      await this.profileRepo.save(profile);
    } else {
      // User exists: update Google avatar when available and link account
      let changed = false;
      if (req.avatarUrl && req.avatarUrl !== user.avatarUrl) {
        user.avatarUrl = req.avatarUrl;
        changed = true;
      }
      if (!user.linkedAccounts?.some((la) => la.provider === 'google')) {
        user.linkedAccounts = [
          ...(user.linkedAccounts || []),
          { provider: 'google', email, linkedAt: new Date().toISOString() },
        ];
        changed = true;
      }
      if (changed) {
        await this.userRepo.save(user);
      }

      // Sync avatar to profile
      const profile = await this.profileRepo.findByUserId(user.id);
      if (profile && req.avatarUrl && profile.avatarUrl !== req.avatarUrl) {
        profile.avatarUrl = req.avatarUrl;
        profile.avatarSource = 'google';
        await this.profileRepo.save(profile);
      }
    }

    await auditService.logEvent(
      AuditAction.GOOGLE_OAUTH_LOGIN,
      { id: user.id, email: user.email },
      AuditSeverity.INFO,
      { metadata: { provider: 'google', isFounder, hasAvatar: Boolean(req.avatarUrl) } }
    );

    return this.createSession(user);
  }

  /**
   * User Registration with Initial Mode.
   */
  public async register(req: RegisterRequest): Promise<AuthSessionResponse> {
    const email = req.email.trim().toLowerCase();
    const existing = await this.userRepo.findByEmail(email);
    if (existing) {
      throw new ValidationError('Email já cadastrado.', { email: ['Este e-mail já está em uso.'] });
    }

    const isFounder = isFounderAdminEmail(email);
    const initialMode = req.initialMode || AppMode.TRADITIONAL;
    const role = isFounder
      ? UserRole.ADMIN
      : initialMode === AppMode.KIDS
      ? UserRole.CRIANCA
      : req.selectedRole || UserRole.ALUNO;

    if (role === UserRole.CRIANCA && (!req.guardianEmail || !req.guardianEmail.includes('@'))) {
      throw new ValidationError('Contas infantis requerem e-mail de responsável legal válido.', {
        guardianEmail: ['E-mail do responsável é obrigatório.'],
      });
    }

    const user: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email,
      name: req.name.trim(),
      avatarUrl: req.avatarUrl,
      primaryRole: role,
      assignedRoles: isFounder
        ? [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MUSICO, UserRole.ALUNO]
        : [role],
      isEmailVerified: req.authProvider === 'google',
      authProvider: req.authProvider || 'email',
      passwordHash: req.password ? `pwd_${req.password}` : undefined,
      linkedAccounts: [
        {
          provider: req.authProvider || 'email',
          email,
          linkedAt: new Date().toISOString(),
        },
      ],
      guardianId: req.guardianEmail ? `guardian_${req.guardianEmail}` : undefined,
      isFounderAdmin: isFounder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await this.userRepo.save(user);

    const isChild = role === UserRole.CRIANCA;
    const profile: Profile = {
      userId: user.id,
      displayName: user.name,
      title: isChild ? 'Iniciação Musical Kids' : 'Estudante da Academia',
      biography: `Perfil de ${user.primaryRole} na Academia Musical Digital.`,
      avatarSource: req.avatarUrl ? 'google' : 'initials',
      avatarUrl: req.avatarUrl,
      mode: initialMode,
      instruments: ['Piano'],
      musicalInterests: ['Teoria Musical'],
      experienceLevel: 'iniciante',
      isPublic: !isChild,
      privacySettings: {
        visibility: isChild ? 'private' : 'public',
        showAcademicHistory: !isChild,
        showPracticeLog: !isChild,
        showPortfolio: !isChild,
        allowCommunityInteraction: !isChild,
      },
      guardian:
        isChild && req.guardianEmail
          ? {
              guardianEmail: req.guardianEmail,
              parentalConsentGiven: true,
              consentTimestamp: new Date().toISOString(),
            }
          : undefined,
      childControls: isChild
        ? {
            isKidModeActive: true,
            restrictedChat: true,
            contentFilterLevel: 'strict',
            maxDailyScreenMinutes: 45,
          }
        : undefined,
      onboardingCompleted: false, // New registration must proceed to onboarding
      academicProgressSummary: { coursesEnrolled: 0, coursesCompleted: 0, totalStudyHours: 0 },
      practiceSummary: { totalSessions: 0, streakDays: 0 },
      updatedAt: new Date().toISOString(),
    };
    await this.profileRepo.save(profile);

    await auditService.logEvent(
      AuditAction.USER_REGISTER,
      { id: user.id, email: user.email },
      AuditSeverity.INFO,
      { metadata: { role: user.primaryRole, mode: initialMode, provider: user.authProvider } }
    );

    return this.createSession(user, profile);
  }

  /**
   * Account Linking
   * "account linking"
   * Links a secondary provider (Google or Email) to an existing user account.
   */
  public async linkAccount(req: LinkAccountRequest): Promise<{ success: boolean; user: User; profile: Profile; message: string }> {
    const user = await this.userRepo.findById(req.userId);
    if (!user) {
      throw new UnauthorizedError('Usuário não localizado.');
    }

    const linkedAccounts = user.linkedAccounts || [];
    const alreadyLinked = linkedAccounts.some((la) => la.provider === req.provider && la.email === req.email);

    if (alreadyLinked) {
      const profile = (await this.profileRepo.findByUserId(user.id))!;
      return { success: true, user, profile, message: 'Conta já vinculada.' };
    }

    user.linkedAccounts = [
      ...linkedAccounts,
      {
        provider: req.provider,
        email: req.email,
        linkedAt: new Date().toISOString(),
      },
    ];

    if (req.provider === 'google' && req.avatarUrl) {
      user.avatarUrl = req.avatarUrl;
    }
    if (req.provider === 'email' && req.password) {
      user.passwordHash = `pwd_${req.password}`;
    }

    await this.userRepo.save(user);

    const profile = await this.profileRepo.findByUserId(user.id);
    if (profile && req.provider === 'google' && req.avatarUrl) {
      profile.avatarUrl = req.avatarUrl;
      profile.avatarSource = 'google';
      await this.profileRepo.save(profile);
    }

    await auditService.logEvent(
      AuditAction.ACCOUNT_LINKED,
      { id: user.id, email: user.email },
      AuditSeverity.INFO,
      { metadata: { linkedProvider: req.provider, linkedEmail: req.email } }
    );

    return {
      success: true,
      user,
      profile: profile!,
      message: `Conta ${req.provider === 'google' ? 'Google' : 'E-mail'} vinculada com sucesso.`,
    };
  }

  /**
   * Completes Onboarding with canonical fields and mode.
   * "ONBOARDING: Nome, Avatar, Tipo inicial de experiência, Instrumentos, Nível, Objetivos, Interesses, Preferências, Kids Mode quando aplicável.
   * MODOS: Traditional, Kids. Professor não é escolhido como um mundo separado. Professor é capability adquirida."
   */
  public async completeOnboarding(req: OnboardingCompletionRequest): Promise<AuthSessionResponse> {
    const session = await this.getActiveSession();
    if (!session) {
      throw new UnauthorizedError('Sessão expirada ou não autenticada.');
    }

    const currentUserId = session.user.id;
    const dbUser = await this.userRepo.findById(currentUserId);
    if (!dbUser) {
      throw new UnauthorizedError('Usuário não localizado no registro canônico.');
    }

    const isFounder = isFounderAdminEmail(dbUser.email);
    const targetMode = req.mode || AppMode.TRADITIONAL;
    const isKidsMode = targetMode === AppMode.KIDS;

    // "Professor não é escolhido como um mundo separado. Professor é capability adquirida."
    const targetRole = isFounder
      ? UserRole.ADMIN
      : isKidsMode
      ? UserRole.CRIANCA
      : UserRole.ALUNO;

    if (isKidsMode && (!req.guardian?.guardianEmail || !req.guardian.guardianEmail.includes('@'))) {
      throw new ValidationError('O Modo Kids exige o e-mail verificado de um responsável legal.', {
        guardianEmail: ['E-mail do responsável legal é obrigatório.'],
      });
    }

    dbUser.primaryRole = targetRole;
    if (!dbUser.assignedRoles.includes(targetRole)) {
      dbUser.assignedRoles = [...dbUser.assignedRoles, targetRole];
    }
    if (isKidsMode && req.guardian?.guardianEmail) {
      dbUser.guardianId = `guardian_${req.guardian.guardianEmail}`;
    }
    if (req.avatarUrl && !dbUser.avatarUrl) {
      dbUser.avatarUrl = req.avatarUrl;
    }
    await this.userRepo.save(dbUser);

    const existingProfile = await this.profileRepo.findByUserId(dbUser.id);
    const updatedProfile: Profile = {
      ...(existingProfile || {
        userId: dbUser.id,
        academicProgressSummary: { coursesEnrolled: 1, coursesCompleted: 0, totalStudyHours: 0 },
        practiceSummary: { totalSessions: 0, streakDays: 0 },
      }),
      displayName: req.displayName.trim() || dbUser.name,
      title: req.title?.trim() || (isKidsMode ? 'Iniciação Musical Kids' : 'Estudante da Academia'),
      biography: req.biography || `Trajetória no modo ${targetMode} da Academia Musical Digital.`,
      avatarSource: req.avatarSource || (req.avatarUrl ? 'google' : 'initials'),
      avatarUrl: req.avatarUrl || dbUser.avatarUrl,
      mode: targetMode,
      instruments: req.instruments.length > 0 ? req.instruments : ['Piano'],
      musicalInterests: req.musicalInterests.length > 0 ? req.musicalInterests : ['Teoria Musical'],
      goals: req.goals || ['Aprimoramento Musical'],
      experienceLevel: req.experienceLevel || 'iniciante',
      preferences: req.preferences || {
        tuningStandard: '440hz',
        notationSystem: 'syllabic',
        preferredClef: 'g_treble',
        notificationsEnabled: true,
      },
      isPublic: !isKidsMode && (req.privacySettings?.visibility === 'public'),
      privacySettings: {
        visibility: isKidsMode ? 'private' : (req.privacySettings?.visibility || 'public'),
        showAcademicHistory: isKidsMode ? false : (req.privacySettings?.showAcademicHistory ?? true),
        showPracticeLog: isKidsMode ? false : (req.privacySettings?.showPracticeLog ?? true),
        showPortfolio: isKidsMode ? false : (req.privacySettings?.showPortfolio ?? true),
        allowCommunityInteraction: isKidsMode ? false : (req.privacySettings?.allowCommunityInteraction ?? true),
      },
      guardian: isKidsMode ? req.guardian : undefined,
      childControls: isKidsMode
        ? req.childControls || {
            isKidModeActive: true,
            restrictedChat: true,
            contentFilterLevel: 'strict',
            maxDailyScreenMinutes: 45,
          }
        : undefined,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    await this.profileRepo.save(updatedProfile);

    await auditService.logEvent(
      AuditAction.ONBOARDING_COMPLETED,
      { id: dbUser.id, email: dbUser.email },
      AuditSeverity.INFO,
      { metadata: { mode: targetMode, role: targetRole, isKidsMode } }
    );

    if (isKidsMode && req.guardian) {
      await auditService.logEvent(
        AuditAction.GUARDIAN_LINKED,
        { id: dbUser.id, email: dbUser.email },
        AuditSeverity.SECURITY,
        { metadata: { guardianEmail: req.guardian.guardianEmail } }
      );
    }

    return this.createSession(dbUser, updatedProfile);
  }

  public async switchRole(newRole: UserRole): Promise<AuthSessionResponse> {
    const session = await this.getActiveSession();
    if (!session) {
      throw new UnauthorizedError('Sessão expirada.');
    }

    const dbUser = await this.userRepo.findById(session.user.id);
    if (!dbUser) {
      throw new UnauthorizedError('Usuário não localizado.');
    }

    // Server-side check for ADMIN
    if (newRole === UserRole.ADMIN) {
      const serverCheck = await adminService.verifyAuthorization(dbUser.email);
      if (!serverCheck.authorized) {
        throw new ForbiddenError(serverCheck.reason || 'Papel administrativo recusado pelo servidor.');
      }
    }

    dbUser.primaryRole = newRole;
    if (!dbUser.assignedRoles.includes(newRole)) {
      dbUser.assignedRoles.push(newRole);
    }
    await this.userRepo.save(dbUser);

    await auditService.logEvent(
      AuditAction.ROLE_GRANTED,
      { id: dbUser.id, email: dbUser.email },
      AuditSeverity.INFO,
      { metadata: { switchedTo: newRole } }
    );

    return this.createSession(dbUser);
  }

  public async logout(): Promise<void> {
    const session = await this.getActiveSession();
    if (session) {
      await auditService.logEvent(
        AuditAction.USER_LOGOUT,
        { id: session.user.id, email: session.user.email },
        AuditSeverity.INFO
      );
    }
    await this.storage.removeItem(this.sessionKey);
    apiClient.setAuthToken(null);
  }

  /**
   * Evaluates server-side authorization for routes.
   * "A resolução de admin deve acontecer SERVER-SIDE. Nunca confiar apenas no frontend."
   */
  public async checkRouteAccess(
    routePath: string,
    sessionUser: User | null
  ): Promise<{ authorized: boolean; reason?: string; requiredCapability?: string }> {
    // Admin routes require verified SERVER-SIDE authorization
    if (routePath.startsWith('/admin')) {
      if (!sessionUser) {
        return {
          authorized: false,
          reason: 'Acesso restrito. Faça login com credenciais de administrador.',
          requiredCapability: 'admin.console.access',
        };
      }

      // Delegate directly to server authority
      const serverEvaluation = await adminService.verifyAuthorization(sessionUser.email, routePath);
      if (!serverEvaluation.authorized) {
        return {
          authorized: false,
          reason: serverEvaluation.reason || 'Acesso institucional recusado pelo servidor de segurança.',
          requiredCapability: 'admin.console.access',
        };
      }
      return { authorized: true };
    }

    // Room creation requires professor capability (acquired)
    if (routePath === '/rooms/create') {
      if (!sessionUser) {
        return {
          authorized: false,
          reason: 'Apenas professores ou cátedras habilitadas podem criar salas de aula.',
          requiredCapability: 'room.management.create',
        };
      }
      const verifiedDbUser = await this.userRepo.findById(sessionUser.id);
      const isTeacher =
        verifiedDbUser &&
        (isFounderAdminEmail(verifiedDbUser.email) ||
          verifiedDbUser.primaryRole === UserRole.PROFESSOR ||
          verifiedDbUser.assignedRoles.includes(UserRole.PROFESSOR) ||
          verifiedDbUser.primaryRole === UserRole.ADMIN);

      if (!isTeacher) {
        return {
          authorized: false,
          reason: 'A cátedra de Professor é uma capability adquirida. Habilite sua cátedra pedagógica nas configurações.',
          requiredCapability: 'room.management.create',
        };
      }
    }

    return { authorized: true };
  }

  /**
   * Account Recovery
   */
  public async recoverPassword(email: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.userRepo.findByEmail(cleanEmail);

    const resetToken = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (!user) {
      return {
        success: true,
        message: 'Se este e-mail estiver cadastrado na Academia, um código de redefinição foi gerado.',
        resetToken,
      };
    }

    await auditService.logEvent(
      AuditAction.USER_LOGIN,
      { id: user.id, email: user.email },
      AuditSeverity.INFO,
      { metadata: { action: 'password_recovery_requested', token: resetToken } }
    );

    return {
      success: true,
      message: `Instruções e token de redefinição gerados para ${cleanEmail}.`,
      resetToken,
    };
  }

  /**
   * Password Reset Completion
   */
  public async resetPassword(req: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    const cleanEmail = req.email.trim().toLowerCase();
    const user = await this.userRepo.findByEmail(cleanEmail);
    if (!user) {
      throw new UnauthorizedError('Usuário não localizado para redefinição de senha.');
    }

    user.passwordHash = `pwd_${req.newPassword}`;
    await this.userRepo.save(user);

    await auditService.logEvent(
      AuditAction.PASSWORD_RESET,
      { id: user.id, email: user.email },
      AuditSeverity.SECURITY,
      { metadata: { tokenUsed: req.token } }
    );

    return {
      success: true,
      message: 'Senha redefinida com sucesso. Faça login com sua nova credencial.',
    };
  }
}

export const authService = new AuthService();
