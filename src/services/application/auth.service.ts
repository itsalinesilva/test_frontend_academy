import { isGoogleSignInConfigured } from '../../infrastructure/auth/google-identity-client';
import { User, Profile, UserRole, AppMode } from '../../domain/types';
import {
  GoogleAuthenticationRequest,
  OnboardingCompletionRequest,
  AuthSessionResponse,
  PostAuthResult,
  LinkAccountRequest,
} from '../../contracts/auth-contracts';
import { AuthoritySessionDto } from '../../contracts/admin-contracts';
import { UserRepository, PersistentUserRepository } from '../../repositories/user.repository';
import { ProfileRepository, PersistentProfileRepository } from '../../repositories/profile.repository';
import { entitlementService } from '../../infrastructure/entitlements/entitlement-service';
import { auditService } from '../../infrastructure/telemetry/audit-service';
import { AuditAction, AuditSeverity } from '../../domain/audit';
import { ValidationError, UnauthorizedError, ForbiddenError } from '../../domain/errors';
import { apiClient } from '../../infrastructure/api/api-client';
import { StorageAdapter, LocalStorageAdapter } from '../../infrastructure/storage/storage-adapter';
import { disableGoogleAutoSelect } from '../../infrastructure/auth/google-identity-client';

const AUTHORITY_BASE = '/api/v1';

/**
 * Orquestração de autenticação.
 *
 * ARQUITETURA (ADR-001.A): a plataforma é local-first e autentica
 * exclusivamente via Google. A IDENTIDADE é resolvida pelo servidor de
 * autoridade, que verifica a assinatura do ID token contra o JWKS do Google;
 * os DADOS do usuário permanecem locais (`localStorage`), com backup no
 * Drive do próprio usuário.
 *
 * O que foi removido, e por quê (CLAUDE_AUDIT.md):
 *  - `login(email, password)` — S-03: só verificava a senha quando ambos
 *    existiam, de modo que `login({email})` autenticava qualquer usuário.
 *  - `register()` com senha, `recoverPassword()`, `resetPassword()` — S-05:
 *    senha em texto claro (`"pwd_"+senha`), token de reset nunca validado e
 *    devolvido na própria resposta. Com login só por Google, toda essa
 *    superfície deixa de existir em vez de ser remendada.
 *  - Emissão local de token — S-05: `token_${id}_${Date.now()}` era forjável.
 *    O token agora é um JWS HS256 assinado pelo servidor.
 */
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

  // ------------------------------------------------------------- SESSÃO ---

  /**
   * Recupera a sessão ativa e a REVALIDA contra o servidor de autoridade.
   *
   * Não basta existir um objeto no `localStorage`: ele poderia ter sido
   * escrito à mão pelo usuário. O servidor confere a assinatura do token e
   * devolve o privilégio administrativo vigente.
   */
  public async getActiveSession(): Promise<AuthSessionResponse | null> {
    const stored = await this.storage.getItem<AuthSessionResponse>(this.sessionKey);
    if (!stored?.accessToken) return null;

    if (new Date(stored.expiresAt) <= new Date()) {
      await this.clearLocalSession();
      return null;
    }

    let authority: AuthoritySessionDto['admin'] | null = null;
    try {
      const response = await fetch(`${AUTHORITY_BASE}/auth/session`, {
        headers: { Authorization: `Bearer ${stored.accessToken}` },
      });
      if (!response.ok) {
        await this.clearLocalSession();
        return null;
      }
      const body = (await response.json()) as { data: { admin: AuthoritySessionDto['admin'] } };
      authority = body.data.admin;
    } catch {
      // Autoridade inacessível: a sessão não pode ser confirmada.
      // Falha fechada — melhor pedir novo login do que operar com
      // privilégio não verificado.
      return null;
    }

    const dbUser = await this.userRepo.findById(stored.user.id);
    if (!dbUser) {
      await this.clearLocalSession();
      return null;
    }

    // O papel ADMIN só sobrevive se o servidor continuar concedendo.
    const reconciledUser = this.reconcileAdminRole(dbUser, authority.isAdmin);
    if (reconciledUser !== dbUser) {
      await this.userRepo.save(reconciledUser);
    }

    const profile = await this.profileRepo.findByUserId(reconciledUser.id);
    const refreshed: AuthSessionResponse = {
      ...stored,
      user: reconciledUser,
      profile: profile || stored.profile,
      capabilities: entitlementService.getEffectiveCapabilities(reconciledUser),
      entitlements: entitlementService.getEffectiveEntitlements(reconciledUser),
      mode: this.resolveUserMode(reconciledUser, profile),
      isAdmin: authority.isAdmin,
      adminCapabilities: authority.capabilities,
    };

    await this.storage.setItem(this.sessionKey, refreshed);
    apiClient.setAuthToken(refreshed.accessToken);
    return refreshed;
  }

  /**
   * Remove o papel ADMIN de um usuário local quando o servidor não o concede.
   * Impede que alguém edite o `localStorage` e se promova a administrador.
   */
  private reconcileAdminRole(user: User, serverGrantsAdmin: boolean): User {
    const claimsAdmin = user.primaryRole === UserRole.ADMIN || user.assignedRoles.includes(UserRole.ADMIN);
    if (serverGrantsAdmin || !claimsAdmin) return user;

    return {
      ...user,
      primaryRole: user.primaryRole === UserRole.ADMIN ? UserRole.ALUNO : user.primaryRole,
      assignedRoles: user.assignedRoles.filter((r) => r !== UserRole.ADMIN),
      isFounderAdmin: false,
      updatedAt: new Date().toISOString(),
    };
  }

  public resolveUserMode(user: User, profile?: Profile | null): AppMode {
    if (user.primaryRole === UserRole.CRIANCA) return AppMode.KIDS;
    if (profile?.childControls?.isKidModeActive || profile?.mode === AppMode.KIDS) return AppMode.KIDS;
    return AppMode.TRADITIONAL;
  }

  private async clearLocalSession(): Promise<void> {
    await this.storage.removeItem(this.sessionKey);
    apiClient.setAuthToken(null);
  }

  // ------------------------------------------------------ AUTENTICAÇÃO ---

  /**
   * Único caminho de autenticação da plataforma.
   *
   * O ID token é enviado ao servidor, que verifica a assinatura RS256 contra
   * o JWKS do Google, valida `iss`/`aud`/`exp`/`nonce` e devolve a identidade
   * verificada mais a concessão administrativa. O cliente nunca decide quem
   * é quem, nem quem é admin.
   */
  /**
   * Conta local — SÓ EM DESENVOLVIMENTO.
   *
   * POR QUE ISTO EXISTE
   * -------------------
   * A plataforma autentica exclusivamente por Google (ADR-001.A), o que é a
   * decisão certa em produção. Em desenvolvimento, porém, ela tornava a
   * plataforma **impossível de usar**: sem `VITE_GOOGLE_OAUTH_CLIENT_ID`
   * configurado, não havia como criar conta, e portanto não havia como ver
   * nenhuma tela na versão logada.
   *
   * TRÊS TRAVAS, E POR QUE CADA UMA
   * -------------------------------
   * 1. `import.meta.env.DEV` — o Vite elimina este método do bundle de
   *    produção por eliminação de código morto. Ele não existe no build.
   * 2. Google configurado desativa o atalho — se há o caminho real, usa-se o
   *    real.
   * 3. A conta criada **nunca recebe privilégio de admin**. Privilégio segue
   *    a outorga assinada pelo servidor, e um atalho local não é servidor.
   *    Foi exatamente assim que o mock anterior deixou qualquer um entrar
   *    como fundadora (CLAUDE_AUDIT.md S-03/S-04).
   */
  public async authenticateLocalDevelopment(
    nome: string,
    email: string
  ): Promise<AuthSessionResponse> {
    if (!import.meta.env.DEV) {
      throw new UnauthorizedError('Conta local existe apenas em desenvolvimento.');
    }
    if (isGoogleSignInConfigured()) {
      throw new UnauthorizedError(
        'Google Sign-In está configurado neste ambiente; use a entrada federada.'
      );
    }

    const limpo = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo)) {
      throw new UnauthorizedError('Informe um e-mail válido.');
    }

    const agora = new Date().toISOString();
    let user = await this.userRepo.findByEmail(limpo);

    if (!user) {
      user = {
        id: `usr_local_${limpo.replace(/[^a-z0-9]/g, '_')}`,
        email: limpo,
        name: nome.trim() || limpo.split('@')[0],
        primaryRole: UserRole.ALUNO,
        assignedRoles: [UserRole.ALUNO],
        isEmailVerified: false,
        authProvider: 'google',
        isFounderAdmin: false,
        linkedAccounts: [],
        createdAt: agora,
        updatedAt: agora,
      };
      await this.userRepo.save(user);
    }

    const profile = await this.ensureProfile(user);

    const session: AuthSessionResponse = {
      user,
      profile,
      capabilities: entitlementService.getEffectiveCapabilities(user),
      entitlements: entitlementService.getEffectiveEntitlements(user),
      mode: this.resolveUserMode(user, profile),
      // Token de desenvolvimento: não vale contra o servidor de autoridade, e
      // é isso mesmo. Nenhuma rota protegida do servidor o aceita.
      accessToken: 'dev-local-session',
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      isAdmin: false,
      adminCapabilities: [],
    };

    await this.storage.setItem(this.sessionKey, session);
    return session;
  }

  public async authenticateWithGoogle(req: GoogleAuthenticationRequest): Promise<AuthSessionResponse> {
    const response = await fetch(`${AUTHORITY_BASE}/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: req.idToken, nonce: req.nonce }),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as
        | { error?: { code?: string; message?: string } }
        | null;
      throw new UnauthorizedError(
        errorBody?.error?.message || 'Não foi possível validar sua identidade Google.'
      );
    }

    const { data } = (await response.json()) as { data: AuthoritySessionDto };
    const { identity, admin, accessToken, expiresAt } = data;

    // Provisionamento local, chaveado pelo `sub` do Google — estável mesmo
    // que o usuário troque o e-mail da conta.
    let user = await this.userRepo.findByGoogleSubject(identity.subject);
    if (!user) {
      user = await this.userRepo.findByEmail(identity.email);
    }

    const now = new Date().toISOString();
    if (!user) {
      user = {
        id: `usr_${identity.subject}`,
        googleSubject: identity.subject,
        email: identity.email,
        name: identity.name || identity.email.split('@')[0],
        avatarUrl: identity.pictureUrl,
        primaryRole: admin.isAdmin ? UserRole.ADMIN : UserRole.ALUNO,
        assignedRoles: admin.isAdmin
          ? [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MUSICO, UserRole.ALUNO]
          : [UserRole.ALUNO],
        isEmailVerified: true,
        authProvider: 'google',
        isFounderAdmin: admin.isAdmin,
        linkedAccounts: [{ provider: 'google', email: identity.email, linkedAt: now }],
        createdAt: now,
        updatedAt: now,
      };
      await this.userRepo.save(user);
    } else {
      const updated: User = {
        ...user,
        googleSubject: identity.subject,
        email: identity.email,
        name: identity.name || user.name,
        avatarUrl: identity.pictureUrl || user.avatarUrl,
        isEmailVerified: true,
        updatedAt: now,
      };
      // O privilégio segue sempre a decisão do servidor, nos dois sentidos.
      const withAdmin = admin.isAdmin
        ? {
            ...updated,
            isFounderAdmin: true,
            assignedRoles: updated.assignedRoles.includes(UserRole.ADMIN)
              ? updated.assignedRoles
              : [...updated.assignedRoles, UserRole.ADMIN],
          }
        : this.reconcileAdminRole(updated, false);
      user = withAdmin;
      await this.userRepo.save(user);
    }

    const profile = await this.ensureProfile(user, identity.pictureUrl);

    const session: AuthSessionResponse = {
      user,
      profile,
      capabilities: entitlementService.getEffectiveCapabilities(user),
      entitlements: entitlementService.getEffectiveEntitlements(user),
      mode: this.resolveUserMode(user, profile),
      accessToken,
      expiresAt,
      isAdmin: admin.isAdmin,
      adminCapabilities: admin.capabilities,
    };

    await this.storage.setItem(this.sessionKey, session);
    apiClient.setAuthToken(accessToken);

    await auditService.logEvent(
      AuditAction.GOOGLE_OAUTH_LOGIN,
      { id: user.id, email: user.email },
      AuditSeverity.INFO,
      { metadata: { provider: 'google', isAdmin: admin.isAdmin } }
    );

    return session;
  }

  private async ensureProfile(user: User, pictureUrl?: string): Promise<Profile> {
    const existing = await this.profileRepo.findByUserId(user.id);
    if (existing) {
      if (pictureUrl && existing.avatarUrl !== pictureUrl) {
        const synced: Profile = { ...existing, avatarUrl: pictureUrl, avatarSource: 'google' };
        await this.profileRepo.save(synced);
        return synced;
      }
      return existing;
    }

    const profile: Profile = {
      userId: user.id,
      displayName: user.name,
      title: 'Estudante da Academia',
      biography: 'Músico e estudante da Conservatório Muscicapa.',
      avatarSource: pictureUrl ? 'google' : 'initials',
      avatarUrl: pictureUrl,
      mode: this.resolveUserMode(user),
      instruments: [],
      musicalInterests: [],
      experienceLevel: 'iniciante',
      isPublic: user.primaryRole !== UserRole.CRIANCA,
      onboardingCompleted: false,
      // Zeros honestos: nada de progresso inventado para a tela parecer viva.
      academicProgressSummary: { coursesEnrolled: 0, coursesCompleted: 0, totalStudyHours: 0 },
      practiceSummary: { totalSessions: 0, streakDays: 0 },
      updatedAt: new Date().toISOString(),
    };
    await this.profileRepo.save(profile);
    return profile;
  }

  public async executePostAuthPipeline(user: User): Promise<PostAuthResult> {
    const dbUser = (await this.userRepo.findById(user.id)) || user;
    const profile = await this.ensureProfile(dbUser, dbUser.avatarUrl);

    return {
      user: dbUser,
      profile,
      capabilities: entitlementService.getEffectiveCapabilities(dbUser),
      entitlements: entitlementService.getEffectiveEntitlements(dbUser),
      mode: this.resolveUserMode(dbUser, profile),
      progress: {
        coursesEnrolled: profile.academicProgressSummary?.coursesEnrolled || 0,
        coursesCompleted: profile.academicProgressSummary?.coursesCompleted || 0,
        totalStudyHours: profile.academicProgressSummary?.totalStudyHours || 0,
        streakDays: profile.practiceSummary?.streakDays || 0,
        totalSessions: profile.practiceSummary?.totalSessions || 0,
      },
      destination: profile.onboardingCompleted ? '/' : '/onboarding',
    };
  }

  // -------------------------------------------------------- ONBOARDING ---

  public async completeOnboarding(req: OnboardingCompletionRequest): Promise<AuthSessionResponse> {
    const session = await this.getActiveSession();
    if (!session) {
      throw new UnauthorizedError('Sessão expirada ou não autenticada.');
    }

    const dbUser = await this.userRepo.findById(session.user.id);
    if (!dbUser) {
      throw new UnauthorizedError('Usuário não localizado no registro canônico.');
    }

    const targetMode = req.mode || AppMode.TRADITIONAL;
    const isKidsMode = targetMode === AppMode.KIDS;

    if (isKidsMode && (!req.guardian?.guardianEmail || !req.guardian.guardianEmail.includes('@'))) {
      throw new ValidationError('O Modo Kids exige o e-mail verificado de um responsável legal.', {
        guardianEmail: ['E-mail do responsável legal é obrigatório.'],
      });
    }

    // "Professor não é escolhido como um mundo separado; é capability adquirida."
    // ADMIN nunca é atribuído aqui: vem exclusivamente do servidor.
    const targetRole = session.isAdmin ? UserRole.ADMIN : isKidsMode ? UserRole.CRIANCA : UserRole.ALUNO;

    dbUser.primaryRole = targetRole;
    if (!dbUser.assignedRoles.includes(targetRole)) {
      dbUser.assignedRoles = [...dbUser.assignedRoles, targetRole];
    }
    if (isKidsMode && req.guardian?.guardianEmail) {
      dbUser.guardianId = `guardian_${req.guardian.guardianEmail}`;
    }
    dbUser.updatedAt = new Date().toISOString();
    await this.userRepo.save(dbUser);

    const existingProfile = await this.profileRepo.findByUserId(dbUser.id);
    const updatedProfile: Profile = {
      ...(existingProfile || { userId: dbUser.id }),
      displayName: req.displayName.trim() || dbUser.name,
      title: req.title?.trim() || (isKidsMode ? 'Iniciação Musical Kids' : 'Estudante da Academia'),
      biography: req.biography || `Trajetória no modo ${targetMode} da Conservatório Muscicapa.`,
      avatarSource: req.avatarSource || (dbUser.avatarUrl ? 'google' : 'initials'),
      avatarUrl: req.avatarUrl || dbUser.avatarUrl,
      mode: targetMode,
      instruments: req.instruments,
      musicalInterests: req.musicalInterests,
      goals: req.goals,
      experienceLevel: req.experienceLevel || 'iniciante',
      preferences: req.preferences,
      isPublic: !isKidsMode && req.privacySettings?.visibility === 'public',
      privacySettings: {
        visibility: isKidsMode ? 'private' : req.privacySettings?.visibility || 'public',
        showAcademicHistory: isKidsMode ? false : req.privacySettings?.showAcademicHistory ?? true,
        showPracticeLog: isKidsMode ? false : req.privacySettings?.showPracticeLog ?? true,
        showPortfolio: isKidsMode ? false : req.privacySettings?.showPortfolio ?? true,
        allowCommunityInteraction: isKidsMode
          ? false
          : req.privacySettings?.allowCommunityInteraction ?? true,
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
      academicProgressSummary: existingProfile?.academicProgressSummary || {
        coursesEnrolled: 0,
        coursesCompleted: 0,
        totalStudyHours: 0,
      },
      practiceSummary: existingProfile?.practiceSummary || { totalSessions: 0, streakDays: 0 },
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

    const refreshed: AuthSessionResponse = { ...session, user: dbUser, profile: updatedProfile };
    await this.storage.setItem(this.sessionKey, refreshed);
    return refreshed;
  }

  // ------------------------------------------------------------- PAPÉIS ---

  /**
   * Alterna o papel ativo entre as capacidades JÁ ATRIBUÍDAS ao usuário.
   * ADMIN exige concessão do servidor — não é auto-atribuível.
   */
  public async switchRole(newRole: UserRole): Promise<AuthSessionResponse> {
    const session = await this.getActiveSession();
    if (!session) {
      throw new UnauthorizedError('Sessão expirada.');
    }

    if (newRole === UserRole.ADMIN && !session.isAdmin) {
      throw new ForbiddenError('O papel administrativo não é concedido a esta identidade pelo servidor.');
    }

    const dbUser = await this.userRepo.findById(session.user.id);
    if (!dbUser) {
      throw new UnauthorizedError('Usuário não localizado.');
    }
    if (!dbUser.assignedRoles.includes(newRole)) {
      throw new ForbiddenError(`O papel ${newRole} não está atribuído a esta conta.`);
    }

    dbUser.primaryRole = newRole;
    dbUser.updatedAt = new Date().toISOString();
    await this.userRepo.save(dbUser);

    await auditService.logEvent(
      AuditAction.ROLE_GRANTED,
      { id: dbUser.id, email: dbUser.email },
      AuditSeverity.INFO,
      { metadata: { switchedTo: newRole } }
    );

    const refreshed: AuthSessionResponse = {
      ...session,
      user: dbUser,
      capabilities: entitlementService.getEffectiveCapabilities(dbUser),
      mode: this.resolveUserMode(dbUser, session.profile),
    };
    await this.storage.setItem(this.sessionKey, refreshed);
    return refreshed;
  }

  /** Vincula um provedor adicional. Sem senha: a plataforma não tem senhas. */
  public async linkAccount(req: LinkAccountRequest): Promise<{ success: boolean; user: User; message: string }> {
    const user = await this.userRepo.findById(req.userId);
    if (!user) {
      throw new UnauthorizedError('Usuário não localizado.');
    }

    const linked = user.linkedAccounts || [];
    if (linked.some((la) => la.provider === req.provider && la.email === req.email)) {
      return { success: true, user, message: 'Conta já vinculada.' };
    }

    user.linkedAccounts = [...linked, { provider: req.provider, email: req.email, linkedAt: new Date().toISOString() }];
    user.updatedAt = new Date().toISOString();
    await this.userRepo.save(user);

    await auditService.logEvent(
      AuditAction.ACCOUNT_LINKED,
      { id: user.id, email: user.email },
      AuditSeverity.INFO,
      { metadata: { linkedProvider: req.provider } }
    );

    return { success: true, user, message: 'Conta vinculada com sucesso.' };
  }

  // ------------------------------------------------------------- LOGOUT ---

  public async logout(): Promise<void> {
    const stored = await this.storage.getItem<AuthSessionResponse>(this.sessionKey);

    if (stored?.accessToken) {
      await auditService.logEvent(
        AuditAction.USER_LOGOUT,
        { id: stored.user.id, email: stored.user.email },
        AuditSeverity.INFO
      );
      try {
        await fetch(`${AUTHORITY_BASE}/auth/session`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${stored.accessToken}` },
        });
      } catch {
        // Encerramento local prossegue mesmo sem a autoridade.
      }
    }

    disableGoogleAutoSelect();
    await this.clearLocalSession();
  }

  // ------------------------------------------------------ GUARDA DE ROTA ---

  /**
   * Avalia acesso a rota. A decisão sobre `/admin` vem do campo `isAdmin` da
   * sessão, que só existe porque o servidor o assinou — nunca de estado local.
   */
  public async checkRouteAccess(
    routePath: string,
    sessionUser: User | null
  ): Promise<{ authorized: boolean; reason?: string; requiredCapability?: string }> {
    if (routePath.startsWith('/admin')) {
      const session = await this.getActiveSession();
      if (!session) {
        return {
          authorized: false,
          reason: 'Acesso restrito. Autentique-se com uma conta institucional.',
          requiredCapability: 'admin.console.access',
        };
      }
      if (!session.isAdmin) {
        return {
          authorized: false,
          reason: 'Esta identidade não possui outorga administrativa no servidor.',
          requiredCapability: 'admin.console.access',
        };
      }
      return { authorized: true };
    }

    if (routePath === '/rooms/create') {
      if (!sessionUser) {
        return {
          authorized: false,
          reason: 'Apenas professores ou cátedras habilitadas podem criar salas de aula.',
          requiredCapability: 'room.management.create',
        };
      }
      const dbUser = await this.userRepo.findById(sessionUser.id);
      const isTeacher =
        dbUser &&
        (dbUser.primaryRole === UserRole.PROFESSOR ||
          dbUser.assignedRoles.includes(UserRole.PROFESSOR) ||
          dbUser.primaryRole === UserRole.ADMIN);

      if (!isTeacher) {
        return {
          authorized: false,
          reason:
            'A cátedra de Professor é uma capability adquirida. Habilite sua cátedra pedagógica nas configurações.',
          requiredCapability: 'room.management.create',
        };
      }
    }

    return { authorized: true };
  }
}

export const authService = new AuthService();
