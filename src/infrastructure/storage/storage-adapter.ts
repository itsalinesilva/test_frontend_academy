/**
 * Aviso de que um dado da plataforma mudou neste navegador.
 *
 * A conta vive no Google Drive da pessoa (ADR-001.A): o `localStorage` é a
 * área de trabalho, e cada mudança precisa voltar para o Drive. Quem guarda
 * aqui não sabe disso — só avisa; `conta-no-drive.service` escuta.
 */
export const DADOS_MUDARAM = 'amd:dados-mudaram';

function avisarMudanca(chave: string): void {
  try {
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(DADOS_MUDARAM, { detail: chave }));
  } catch {
    // ambiente sem eventos: nada a avisar
  }
}

export interface StorageAdapter {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, unknown>();

  public async getItem<T>(key: string): Promise<T | null> {
    const val = this.store.get(key);
    return val !== undefined ? (val as T) : null;
  }

  public async setItem<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  public async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  public async clear(): Promise<void> {
    this.store.clear();
  }
}

export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix = 'amd_') {
    this.prefix = prefix;
  }

  public get<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      const raw = window.localStorage.getItem(`${this.prefix}${key}`);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  public set<T>(key: string, value: T): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(value));
        avisarMudanca(key);
      }
    } catch {
      // Storage quota or restriction fallback
    }
  }

  public async getItem<T>(key: string): Promise<T | null> {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      const raw = window.localStorage.getItem(`${this.prefix}${key}`);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  public async setItem<T>(key: string, value: T): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(value));
        avisarMudanca(key);
      }
    } catch {
      // Storage quota or restriction fallback
    }
  }

  public async removeItem(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(`${this.prefix}${key}`);
        avisarMudanca(key);
      }
    } catch {
      // Ignore errors on removal
    }
  }

  public async clear(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
      }
    } catch {
      // Ignore
    }
  }
}
