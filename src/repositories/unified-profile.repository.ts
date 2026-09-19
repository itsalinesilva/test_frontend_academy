import {
  UnifiedProfileRecord,
  Evidence,
  PortfolioItem,
  ProfileSectionConfig,
} from '../domain/profile';
import { StorageAdapter, LocalStorageAdapter } from '../infrastructure/storage/storage-adapter';

export interface UnifiedProfileRepository {
  findByUserId(userId: string): Promise<UnifiedProfileRecord | null>;
  save(profile: UnifiedProfileRecord): Promise<UnifiedProfileRecord>;
  addEvidence(evidence: Evidence): Promise<Evidence>;
  getEvidencesByUserId(userId: string): Promise<Evidence[]>;
  savePortfolioItem(item: PortfolioItem): Promise<PortfolioItem>;
  deletePortfolioItem(userId: string, itemId: string): Promise<boolean>;
  getPublicProjection(userId: string): Promise<UnifiedProfileRecord | null>;
  listPublicDirectory(): Promise<UnifiedProfileRecord[]>;
  getDefaultSectionsConfig(): ProfileSectionConfig[];
}

export class PersistentUnifiedProfileRepository implements UnifiedProfileRepository {
  private storage: StorageAdapter;
  private profilesKey = 'canonical_unified_profiles_v1';
  private evidencesKey = 'canonical_evidences_collection_v1';

  constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  public getDefaultSectionsConfig(): ProfileSectionConfig[] {
    return [
      { key: 'home', label: 'Visão Geral (Profile Home)', enabled: true, visibility: 'public', order: 1 },
      { key: 'about', label: 'Sobre & Trajetória (About)', enabled: true, visibility: 'public', order: 2 },
      { key: 'activity', label: 'Atividade Recente (Activity)', enabled: true, visibility: 'public', order: 3 },
      { key: 'experience', label: 'Experiência & Docência (Experience)', enabled: true, visibility: 'public', order: 4 },
      { key: 'skills', label: 'Habilidades & Competências (Skills)', enabled: true, visibility: 'public', order: 5 },
      { key: 'education', label: 'Formação & Titulações (Education)', enabled: true, visibility: 'public', order: 6 },
      { key: 'achievements', label: 'Conquistas & Premiações (Achievements)', enabled: true, visibility: 'public', order: 7 },
      { key: 'credentials', label: 'Credenciais & Certificados (Credentials)', enabled: true, visibility: 'public', order: 8 },
      { key: 'portfolio', label: 'Portfólio & Obras (Portfolio)', enabled: true, visibility: 'public', order: 9 },
      { key: 'projects', label: 'Projetos de Investigação (Projects)', enabled: true, visibility: 'public', order: 10 },
      { key: 'recordings', label: 'Gravações & Áudio (Recordings)', enabled: true, visibility: 'public', order: 11 },
      { key: 'scores', label: 'Partituras & Edições (Scores)', enabled: true, visibility: 'public', order: 12 },
      { key: 'practice', label: 'Rotina de Prática (Practice)', enabled: true, visibility: 'public', order: 13 },
      { key: 'learning_history', label: 'Histórico de Aprendizagem (Learning History)', enabled: true, visibility: 'public', order: 14 },
      { key: 'passports', label: 'Passaportes de Mundos (Passports)', enabled: true, visibility: 'public', order: 15 },
      { key: 'badges', label: 'Distinções & Selos (Badges)', enabled: true, visibility: 'public', order: 16 },
      { key: 'community', label: 'Comunidade & Fóruns (Community)', enabled: true, visibility: 'public', order: 17 },
      { key: 'rooms', label: 'Salas Virtuais & Cátedras (Rooms)', enabled: true, visibility: 'public', order: 18 },
      { key: 'events', label: 'Eventos & Masterclasses (Events)', enabled: true, visibility: 'public', order: 19 },
      // Compatibility keys
      { key: 'academic', label: 'Academia & Cursos', enabled: true, visibility: 'public', order: 20 },
      { key: 'studio', label: 'Estúdio & Produção', enabled: true, visibility: 'public', order: 21 },
      { key: 'worlds', label: 'Mundos Históricos', enabled: true, visibility: 'public', order: 22 },
      { key: 'teacher', label: 'Cátedra Docente', enabled: true, visibility: 'public', order: 23 },
    ];
  }

  /**
   * A plataforma nasce SEM pessoas.
   *
   * Aqui havia ~915 linhas descrevendo um perfil completo da fundadora:
   * catedra, 420 horas de estudo, percentil 99,8, posts com 215 upvotes,
   * bacharelado de 2.400h, certificados e evidencias. Nada disso aconteceu —
   * a fundadora nem se cadastrou ainda. Era um curriculo fabricado que iria
   * para producao com o nome real dela.
   *
   * Perfis passam a existir quando alguem se cadastra: `getUnifiedProfile`
   * monta o registro a partir da sessao no primeiro acesso. As telas de
   * perfil e de rede ja tratam o vazio como estado legitimo.
   */
  private async initializeSeedData(): Promise<Record<string, UnifiedProfileRecord>> {
    const map: Record<string, UnifiedProfileRecord> = {};
    await this.storage.setItem(this.profilesKey, map);
    return map;
  }

  private async getAllProfilesMap(): Promise<Record<string, UnifiedProfileRecord>> {
    const raw = await this.storage.getItem<Record<string, UnifiedProfileRecord>>(this.profilesKey);
    if (!raw || Object.keys(raw).length === 0) {
      return this.initializeSeedData();
    }
    return raw;
  }

  public async findByUserId(userId: string): Promise<UnifiedProfileRecord | null> {
    const map = await this.getAllProfilesMap();
    // Um id desconhecido devolve null. A versao anterior tratava qualquer id
    // que CONTIVESSE a palavra "founder" como fundador e, pior, caia em
    // `initialized.usr_founder_1` quando nao achava — de modo que
    // `usr_founder_qualquer-coisa` devolvia o registro completo da fundadora.
    // Inofensivo enquanto nao havia rota por usuario; vazamento acessivel por
    // URL a partir de /profile/:userId (CLAUDE_AUDIT.md P-01).
    return map[userId] ?? null;
  }

  /**
   * Diretorio de pessoas: so quem esta publicamente visivel.
   *
   * O filtro roda aqui, na fonte, e nao na tela — uma lista de pessoas
   * montada no cliente a partir do mapa completo entregaria perfis privados
   * ao bundle mesmo que a UI os escondesse.
   */
  public async listPublicDirectory(): Promise<UnifiedProfileRecord[]> {
    const map = await this.getAllProfilesMap();
    const visiveis = Object.values(map).filter((p) => p.overallVisibility !== 'private');
    const projetados = await Promise.all(
      visiveis.map((p) => this.getPublicProjection(p.userId))
    );
    return projetados
      .filter((p): p is UnifiedProfileRecord => p !== null)
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR'));
  }

  public async save(profile: UnifiedProfileRecord): Promise<UnifiedProfileRecord> {
    const map = await this.getAllProfilesMap();
    const updated: UnifiedProfileRecord = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    map[profile.userId] = updated;
    await this.storage.setItem(this.profilesKey, map);
    return updated;
  }

  public async addEvidence(evidence: Evidence): Promise<Evidence> {
    const allEvidences = (await this.storage.getItem<Evidence[]>(this.evidencesKey)) || [];
    allEvidences.push(evidence);
    await this.storage.setItem(this.evidencesKey, allEvidences);

    // Also link into the user's unified profile record
    const profile = await this.findByUserId(evidence.userId);
    if (profile) {
      profile.evidences = [evidence, ...profile.evidences.filter((e) => e.id !== evidence.id)];
      await this.save(profile);
    }

    return evidence;
  }

  public async getEvidencesByUserId(userId: string): Promise<Evidence[]> {
    const profile = await this.findByUserId(userId);
    if (profile) {
      return profile.evidences;
    }
    const all = (await this.storage.getItem<Evidence[]>(this.evidencesKey)) || [];
    return all.filter((e) => e.userId === userId);
  }

  public async savePortfolioItem(item: PortfolioItem): Promise<PortfolioItem> {
    const profile = await this.findByUserId(item.userId);
    if (!profile) {
      throw new Error(`Perfil do usuário ${item.userId} não encontrado para adicionar item ao portfólio.`);
    }

    const existingIdx = profile.portfolio.findIndex((p) => p.id === item.id);
    if (existingIdx >= 0) {
      profile.portfolio[existingIdx] = { ...item, updatedAt: new Date().toISOString() };
    } else {
      profile.portfolio.push(item);
    }

    // Sort by orderIndex
    profile.portfolio.sort((a, b) => a.orderIndex - b.orderIndex);
    await this.save(profile);
    return item;
  }

  public async deletePortfolioItem(userId: string, itemId: string): Promise<boolean> {
    const profile = await this.findByUserId(userId);
    if (!profile) return false;

    const initialLen = profile.portfolio.length;
    profile.portfolio = profile.portfolio.filter((p) => p.id !== itemId);
    if (profile.portfolio.length !== initialLen) {
      await this.save(profile);
      return true;
    }
    return false;
  }

  /**
   * Server-approved public projection.
   * In strict compliance with Docs 30 & 54:
   * "Server builds a visibility-filtered projection. Never send private fields to frontend and rely on CSS to hide them."
   */
  public async getPublicProjection(userId: string): Promise<UnifiedProfileRecord | null> {
    const full = await this.findByUserId(userId);
    if (!full) return null;

    if (full.overallVisibility === 'private') {
      return null; // Entire profile is private
    }

    // Filter sections based on visibility
    const visibleSections = full.sectionsConfig.filter(
      (s) => s.enabled && s.visibility === 'public'
    );

    // Filter portfolio items (only public items)
    const publicPortfolio = full.portfolio.filter((p) => p.visibility === 'public');

    // Filter evidences (only public evidences)
    const publicEvidences = full.evidences.filter((e) => e.visibility === 'public');

    // Filter official links (only public links)
    const publicLinks = full.officialLinks.filter((l) => l.isPublic);

    // Build the projected record
    const projected: UnifiedProfileRecord = {
      ...full,
      sectionsConfig: visibleSections,
      portfolio: publicPortfolio,
      evidences: publicEvidences,
      officialLinks: publicLinks,
      // If a section is hidden/private, empty its data in the public projection
      academic: visibleSections.some((s) => s.key === 'academic')
        ? full.academic
        : {
            totalStudyHours: 0,
            enrolledCourses: [],
            learningPaths: [],
            certificates: [],
            competencies: [],
          },
      practice: visibleSections.some((s) => s.key === 'practice')
        ? full.practice
        : {
            totalPracticeSessions: 0,
            currentStreakDays: 0,
            longestStreakDays: 0,
            skills: [],
            repertoire: [],
            achievements: [],
            recentExercises: [],
          },
      worlds: visibleSections.some((s) => s.key === 'worlds')
        ? full.worlds
        : {
            passports: [],
            badges: [],
            microcredentials: [],
          },
      community: visibleSections.some((s) => s.key === 'community')
        ? full.community
        : {
            connectionsCount: full.community.connectionsCount,
            posts: [],
            forumParticipations: [],
            eventsAttended: [],
          },
      rooms: visibleSections.some((s) => s.key === 'rooms' || s.key === 'teacher')
        ? {
            attendedRooms: visibleSections.some((s) => s.key === 'rooms') ? full.rooms.attendedRooms : [],
            teacherProfile: visibleSections.some((s) => s.key === 'teacher') ? full.rooms.teacherProfile : undefined,
          }
        : {
            attendedRooms: [],
          },
      experiences: visibleSections.some((s) => s.key === 'experience') ? full.experiences : [],
      educationList: visibleSections.some((s) => s.key === 'education') ? full.educationList : [],
      achievementsList: visibleSections.some((s) => s.key === 'achievements') ? full.achievementsList : [],
      recordingsList: visibleSections.some((s) => s.key === 'recordings')
        ? full.recordingsList?.filter((r) => r.visibility === 'public')
        : [],
      scoresList: visibleSections.some((s) => s.key === 'scores')
        ? full.scoresList?.filter((s) => s.visibility === 'public')
        : [],
      projectsList: visibleSections.some((s) => s.key === 'projects') ? full.projectsList : [],
      connectionsList: visibleSections.some((s) => s.key === 'community') ? full.connectionsList : [],
    };

    return projected;
  }
}

export const unifiedProfileRepository = new PersistentUnifiedProfileRepository();
