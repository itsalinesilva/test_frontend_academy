import { Profile } from '../domain/types';
import { StorageAdapter, LocalStorageAdapter } from '../infrastructure/storage/storage-adapter';

export interface ProfileRepository {
  findByUserId(userId: string): Promise<Profile | null>;
  save(profile: Profile): Promise<Profile>;
}

export class PersistentProfileRepository implements ProfileRepository {
  private storage: StorageAdapter;
  private storageKey = 'profiles_collection';

  constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  private async initializeSeedProfiles(): Promise<Record<string, Profile>> {
    const map: Record<string, Profile> = {
      usr_founder_1: {
        userId: 'usr_founder_1',
        displayName: 'Aline Silva',
        title: 'Fundadora & Curadora Artística',
        biography: 'Pianista, pesquisadora de contraponto bachiano e fundadora da Academia Musical Digital.',
        headline: 'Música de Concerto • Preservação Histórica',
        avatarSource: 'google',
        instruments: ['Piano', 'Cravo', 'Composição & Regência'],
        musicalInterests: ['Contraponto & Fuga', 'Harmonia Funcional', 'Prática Historicamente Informada'],
        experienceLevel: 'conservatorio',
        isPublic: true,
        privacySettings: {
          visibility: 'public',
          showAcademicHistory: true,
          showPracticeLog: true,
          showPortfolio: true,
          allowCommunityInteraction: true,
        },
        onboardingCompleted: true,
        academicProgressSummary: { coursesEnrolled: 5, coursesCompleted: 5, totalStudyHours: 420 },
        practiceSummary: { totalSessions: 180, streakDays: 45, lastPracticeAt: new Date().toISOString() },
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      usr_founder_2: {
        userId: 'usr_founder_2',
        displayName: 'Office Aline Silva',
        title: 'Coordenação Institucional & Governança',
        biography: 'Coordenação acadêmica e auditoria institucional de cátedras e currículos.',
        headline: 'Direção Acadêmica • Governança',
        avatarSource: 'google',
        instruments: ['Piano', 'Órgão de Tubos'],
        musicalInterests: ['Análise Musical', 'Regência Coral', 'Musicologia'],
        experienceLevel: 'conservatorio',
        isPublic: true,
        privacySettings: {
          visibility: 'institutional',
          showAcademicHistory: true,
          showPracticeLog: true,
          showPortfolio: true,
          allowCommunityInteraction: true,
        },
        onboardingCompleted: true,
        academicProgressSummary: { coursesEnrolled: 4, coursesCompleted: 4, totalStudyHours: 350 },
        practiceSummary: { totalSessions: 120, streakDays: 30, lastPracticeAt: new Date().toISOString() },
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    };

    await this.storage.setItem(this.storageKey, map);
    return map;
  }

  private async getAllMap(): Promise<Record<string, Profile>> {
    const raw = await this.storage.getItem<Record<string, Profile>>(this.storageKey);
    if (!raw || Object.keys(raw).length === 0) {
      return this.initializeSeedProfiles();
    }
    return raw;
  }

  public async findByUserId(userId: string): Promise<Profile | null> {
    const map = await this.getAllMap();
    return map[userId] || null;
  }

  public async save(profile: Profile): Promise<Profile> {
    const map = await this.getAllMap();
    const updated: Profile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    map[profile.userId] = updated;
    await this.storage.setItem(this.storageKey, map);
    return updated;
  }
}

export const profileRepository = new PersistentProfileRepository();
