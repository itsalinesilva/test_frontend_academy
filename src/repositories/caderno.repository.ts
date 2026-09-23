import { LocalStorageAdapter } from '../infrastructure/storage/local-storage';
import { PartituraDoCaderno } from '../domain/caderno';

/**
 * O caderno de partituras de cada pessoa (M-10).
 *
 * É dado DO ALUNO, do mesmo lado do progresso: publicar conteúdo novo não
 * pode apagar o que alguém escreveu. Por isso a chave é própria, e fica fora
 * de `conteudoPublicado()`.
 */
export interface CadernoRepository {
  listar(autorId: string): Promise<PartituraDoCaderno[]>;
  buscar(id: string): Promise<PartituraDoCaderno | null>;
  salvar(p: PartituraDoCaderno): Promise<PartituraDoCaderno>;
  excluir(id: string): Promise<void>;
}

export class PersistentCadernoRepository implements CadernoRepository {
  private readonly CHAVE = 'amd_estudio_caderno_v1';

  constructor(private storage: LocalStorageAdapter = new LocalStorageAdapter()) {}

  private todas(): PartituraDoCaderno[] {
    return this.storage.get<PartituraDoCaderno[]>(this.CHAVE) ?? [];
  }

  public async listar(autorId: string): Promise<PartituraDoCaderno[]> {
    return this.todas()
      .filter((p) => p.autorId === autorId)
      .sort((a, b) => b.atualizadaEm.localeCompare(a.atualizadaEm));
  }

  public async buscar(id: string): Promise<PartituraDoCaderno | null> {
    return this.todas().find((p) => p.id === id) ?? null;
  }

  /** `atualizadaEm` é gravado aqui: é registro, e não campo que a tela preencha. */
  public async salvar(p: PartituraDoCaderno): Promise<PartituraDoCaderno> {
    const gravada = { ...p, atualizadaEm: new Date().toISOString() };
    this.storage.set(this.CHAVE, [...this.todas().filter((x) => x.id !== p.id), gravada]);
    return gravada;
  }

  public async excluir(id: string): Promise<void> {
    this.storage.set(
      this.CHAVE,
      this.todas().filter((p) => p.id !== id)
    );
  }
}

export const cadernoRepository: CadernoRepository = new PersistentCadernoRepository();
