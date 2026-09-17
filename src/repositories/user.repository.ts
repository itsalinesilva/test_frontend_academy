import { User, UserRole } from '../domain/types';
import { StorageAdapter, LocalStorageAdapter } from '../infrastructure/storage/storage-adapter';
import { FOUNDER_ADMIN_EMAILS, isFounderAdminEmail } from '../domain/capabilities';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  listAll(): Promise<User[]>;
}

export class PersistentUserRepository implements UserRepository {
  private storage: StorageAdapter;
  private storageKey = 'users_collection';

  constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  private async initializeSeedUsers(): Promise<Record<string, User>> {
    const usersMap: Record<string, User> = {};

    // Mandatory founder admin seeds per Doc 00 and AGENTS.md
    FOUNDER_ADMIN_EMAILS.forEach((founderEmail, idx) => {
      const id = `usr_founder_${idx + 1}`;
      usersMap[id] = {
        id,
        email: founderEmail,
        name: idx === 0 ? 'Aline Silva (Fundadora)' : 'Office Aline Silva (Admin)',
        primaryRole: UserRole.ADMIN,
        assignedRoles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MUSICO, UserRole.ALUNO],
        isEmailVerified: true,
        isFounderAdmin: true,
        authProvider: 'google',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
    });

    // Standard institutional personas for evaluation
    const demoPersonas: Array<{ email: string; name: string; role: UserRole; guardian?: string }> = [
      { email: 'aluno@academia.mus.br', name: 'Frederico Chopin (Estudante)', role: UserRole.ALUNO },
      { email: 'musico@academia.mus.br', name: 'Clara Schumann (Músico & Intérprete)', role: UserRole.MUSICO },
      { email: 'professor@academia.mus.br', name: 'Prof. Johann Sebastian Bach', role: UserRole.PROFESSOR },
      { email: 'crianca@academia.mus.br', name: 'Wolfgang Mozart (Iniciação Kids)', role: UserRole.CRIANCA, guardian: 'leopold.mozart@familia.mus.br' },
    ];

    demoPersonas.forEach((p, idx) => {
      const id = `usr_demo_${idx + 1}`;
      usersMap[id] = {
        id,
        email: p.email,
        name: p.name,
        primaryRole: p.role,
        assignedRoles: [p.role],
        isEmailVerified: true,
        isFounderAdmin: false,
        authProvider: 'email',
        guardianId: p.guardian,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      };
    });

    await this.storage.setItem(this.storageKey, usersMap);
    return usersMap;
  }

  private async getAllMap(): Promise<Record<string, User>> {
    const raw = await this.storage.getItem<Record<string, User>>(this.storageKey);
    if (!raw || Object.keys(raw).length === 0) {
      return this.initializeSeedUsers();
    }
    return raw;
  }

  public async findById(id: string): Promise<User | null> {
    const map = await this.getAllMap();
    return map[id] || null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const map = await this.getAllMap();
    const normalized = email.trim().toLowerCase();
    const found = Object.values(map).find((u) => u.email.toLowerCase() === normalized);

    // Auto-seed founder admin if email matches founder list
    if (!found && isFounderAdminEmail(normalized)) {
      const id = `usr_founder_${Object.keys(map).length + 1}`;
      const founderUser: User = {
        id,
        email: normalized,
        name: normalized.includes('office') ? 'Office Aline Silva (Admin)' : 'Aline Silva (Fundadora)',
        primaryRole: UserRole.ADMIN,
        assignedRoles: [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.MUSICO, UserRole.ALUNO],
        isEmailVerified: true,
        isFounderAdmin: true,
        authProvider: 'google',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      map[id] = founderUser;
      await this.storage.setItem(this.storageKey, map);
      return founderUser;
    }

    return found || null;
  }

  public async save(user: User): Promise<User> {
    const map = await this.getAllMap();
    const isFounder = isFounderAdminEmail(user.email);

    // Backend authority enforcement: never allow non-founder to claim ADMIN unless already authorized
    const enforcedRole = isFounder
      ? UserRole.ADMIN
      : (user.primaryRole === UserRole.ADMIN && !map[user.id]?.assignedRoles?.includes(UserRole.ADMIN)
          ? UserRole.ALUNO
          : user.primaryRole);

    const updated: User = {
      ...user,
      primaryRole: enforcedRole,
      isFounderAdmin: isFounder,
      updatedAt: new Date().toISOString(),
    };

    map[user.id] = updated;
    await this.storage.setItem(this.storageKey, map);
    return updated;
  }

  public async listAll(): Promise<User[]> {
    const map = await this.getAllMap();
    return Object.values(map);
  }
}

export const userRepository = new PersistentUserRepository();

