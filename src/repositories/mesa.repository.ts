import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import { ProjetoDaMesa } from '../domain/mesa-de-audio';

/**
 * Os projetos da mesa de áudio (E-9).
 *
 * Duas partes, guardadas em dois lugares, de propósito: o PROJETO (nome,
 * pistas, volumes) é texto e vai no armazenamento de texto; a GRAVAÇÃO é
 * áudio, e áudio não cabe ali — um minuto passa de um megabyte, e a cota
 * inteira costuma ser cinco. Ela vai para o IndexedDB, que existe para isso.
 */

export interface ArmazemDeGravacoes {
  guardar(id: string, audio: Blob): Promise<void>;
  ler(id: string): Promise<Blob | null>;
  apagar(id: string): Promise<void>;
}

/** O armazém do navegador. */
export class GravacoesNoIndexedDB implements ArmazemDeGravacoes {
  private banco(): Promise<IDBDatabase> {
    return new Promise((ok, erro) => {
      const pedido = indexedDB.open('muscicapa-mesa', 1);
      pedido.onupgradeneeded = () => pedido.result.createObjectStore('gravacoes');
      pedido.onsuccess = () => ok(pedido.result);
      pedido.onerror = () => erro(pedido.error);
    });
  }

  private async operar<T>(modo: IDBTransactionMode, fazer: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.banco();
    return new Promise((ok, erro) => {
      const pedido = fazer(db.transaction('gravacoes', modo).objectStore('gravacoes'));
      pedido.onsuccess = () => ok(pedido.result);
      pedido.onerror = () => erro(pedido.error);
    });
  }

  async guardar(id: string, audio: Blob): Promise<void> {
    await this.operar('readwrite', (s) => s.put(audio, id));
  }
  async ler(id: string): Promise<Blob | null> {
    return ((await this.operar('readonly', (s) => s.get(id))) as Blob | undefined) ?? null;
  }
  async apagar(id: string): Promise<void> {
    await this.operar('readwrite', (s) => s.delete(id));
  }
}

/** Em memória — para os testes, e para quando o navegador não oferece IndexedDB. */
export class GravacoesEmMemoria implements ArmazemDeGravacoes {
  private dados = new Map<string, Blob>();
  async guardar(id: string, audio: Blob) {
    this.dados.set(id, audio);
  }
  async ler(id: string) {
    return this.dados.get(id) ?? null;
  }
  async apagar(id: string) {
    this.dados.delete(id);
  }
}

export class MesaRepository {
  private readonly CHAVE = 'amd_estudio_mesa_v1';

  constructor(
    public readonly gravacoes: ArmazemDeGravacoes = typeof indexedDB !== 'undefined'
      ? new GravacoesNoIndexedDB()
      : new GravacoesEmMemoria(),
    private storage: LocalStorageAdapter = new LocalStorageAdapter()
  ) {}

  private todos(): ProjetoDaMesa[] {
    return this.storage.get<ProjetoDaMesa[]>(this.CHAVE) ?? [];
  }

  async listar(autorId: string): Promise<ProjetoDaMesa[]> {
    return this.todos()
      .filter((p) => p.autorId === autorId)
      .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  }

  async buscar(id: string): Promise<ProjetoDaMesa | null> {
    return this.todos().find((p) => p.id === id) ?? null;
  }

  async salvar(p: ProjetoDaMesa): Promise<ProjetoDaMesa> {
    const gravado = { ...p, atualizadoEm: new Date().toISOString() };
    this.storage.set(this.CHAVE, [...this.todos().filter((x) => x.id !== p.id), gravado]);
    return gravado;
  }

  /** Excluir o projeto apaga as gravações dele: áudio órfão ocuparia espaço para sempre. */
  async excluir(id: string): Promise<void> {
    const p = await this.buscar(id);
    for (const pista of p?.pistas ?? []) if (pista.gravacaoId) await this.gravacoes.apagar(pista.gravacaoId);
    this.storage.set(
      this.CHAVE,
      this.todos().filter((x) => x.id !== id)
    );
  }
}

export const mesaRepository = new MesaRepository();
