import { User, UserRole } from '../domain/types';
import { StorageAdapter, LocalStorageAdapter } from '../infrastructure/storage/storage-adapter';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  /** Busca pela identidade estável do Google (`sub`). Caminho preferencial. */
  findByGoogleSubject(subject: string): Promise<User | null>;
  save(user: User): Promise<User>;
  listAll(): Promise<User[]>;
}

/**
 * Repositório local de usuários (ADR-001.A: local-first, sem banco de dados).
 *
 * O que foi removido, e por quê:
 *
 *  - **Seed de fundadoras por e-mail.** O repositório criava usuários ADMIN a
 *    partir de `FOUNDER_ADMIN_EMAILS`, e `findByEmail()` provisionava um
 *    administrador sempre que via um e-mail da lista. Isso é decisão de
 *    autorização tomada no cliente — CLAUDE_AUDIT.md S-02. A outorga agora
 *    vem exclusivamente da sessão assinada pelo servidor.
 *
 *  - **Personas de demonstração.** "Prof. Johann Sebastian Bach",
 *    "Clara Schumann", "Frederico Chopin" e "Wolfgang Mozart" eram semeados
 *    como contas reais da plataforma — dado fabricado apresentado como real
 *    (CLAUDE_AUDIT.md K-05). A coleção agora nasce vazia e só recebe
 *    identidades efetivamente autenticadas no Google.
 *
 *  - **Coerção de papel por e-mail no `save()`.** `isFounderAdminEmail()`
 *    forçava `UserRole.ADMIN`. Removido pelo mesmo motivo.
 */
export class PersistentUserRepository implements UserRepository {
  private storage: StorageAdapter;
  private storageKey = 'users_collection';

  constructor(storage: StorageAdapter = new LocalStorageAdapter()) {
    this.storage = storage;
  }

  private async getAllMap(): Promise<Record<string, User>> {
    const raw = await this.storage.getItem<Record<string, User>>(this.storageKey);
    return raw || {};
  }

  public async findById(id: string): Promise<User | null> {
    const map = await this.getAllMap();
    return map[id] || null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const map = await this.getAllMap();
    const normalized = email.trim().toLowerCase();
    return Object.values(map).find((u) => u.email.toLowerCase() === normalized) || null;
  }

  public async findByGoogleSubject(subject: string): Promise<User | null> {
    if (!subject) return null;
    const map = await this.getAllMap();
    return Object.values(map).find((u) => u.googleSubject === subject) || null;
  }

  /**
   * Persiste o usuário exatamente como recebido.
   *
   * Nenhuma regra de autorização é aplicada aqui: o papel já foi decidido
   * pelo servidor em `AuthService.authenticateWithGoogle()` e é reconciliado
   * a cada revalidação de sessão. Um repositório não é lugar de decidir
   * privilégio — e tentar decidir aqui foi exatamente o que criou o S-02.
   */
  public async save(user: User): Promise<User> {
    const map = await this.getAllMap();
    const updated: User = { ...user, updatedAt: new Date().toISOString() };
    map[user.id] = updated;
    await this.storage.setItem(this.storageKey, map);
    return updated;
  }

  public async listAll(): Promise<User[]> {
    const map = await this.getAllMap();
    return Object.values(map);
  }

  /** Conveniência para telas de governança. */
  public async listByRole(role: UserRole): Promise<User[]> {
    const all = await this.listAll();
    return all.filter((u) => u.primaryRole === role || u.assignedRoles.includes(role));
  }
}

export const userRepository = new PersistentUserRepository();
