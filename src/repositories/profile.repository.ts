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

  /**
   * Nenhum perfil de fabrica.
   *
   * Havia aqui dois perfis completos da fundadora, com biografia, titulos e
   * instrumentos — de alguem que ainda nao se cadastrou na plataforma. O
   * perfil basico passa a ser criado no primeiro acesso, a partir da sessao.
   */
  private async initializeSeedProfiles(): Promise<Record<string, Profile>> {
    const map: Record<string, Profile> = {};
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
