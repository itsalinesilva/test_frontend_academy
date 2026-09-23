import {
  NOME_DO_ARQUIVO,
  fundirCopia,
  lerCopia,
  montarCopia,
} from '../../domain/copia-de-seguranca';
import { ArquivoDaConta, DriveAppData, ErroDoDrive } from '../../infrastructure/drive/drive-appdata';
import { DADOS_MUDARAM } from '../../infrastructure/storage/storage-adapter';

/**
 * ONDE A CONTA FICA GUARDADA (ADR-001.A · AUD-20).
 *
 * Quem entra com o Google tem a conta no próprio Google Drive: ao conectar, o
 * que está lá volta para este navegador; cada mudança daqui volta para lá.
 * O `localStorage` é a área de trabalho. No celular, quem preferir escolhe
 * "só neste aparelho" — e a tela diz o que isso custa.
 *
 * O Drive pede consentimento UMA vez, num clique (o Google não deixa abrir a
 * janela sem gesto da pessoa). Depois, o token se renova em silêncio.
 */
export type OndeGuardar = 'drive' | 'aparelho';

export interface EstadoDaConta {
  onde: OndeGuardar;
  /** Houve consentimento ao Drive nesta sessão do navegador. */
  conectado: boolean;
  /** Há mudança local que ainda não chegou ao Drive. */
  pendente: boolean;
  ultimaGravacao?: string;
  ultimaLeitura?: string;
  erro?: string;
}

const PREFIXO = 'amd_';
const CHAVE_DO_ESTADO = `${PREFIXO}copia_estado_v1`;
/** Chaves de estado próprio: mudar nelas não é "dado mudou". */
const CHAVES_PROPRIAS = new Set(['copia_estado_v1', 'current_auth_session', 'preferencias_v1']);
const ESPERA_PARA_GRAVAR_MS = 4000;

type Ouvinte = (e: EstadoDaConta) => void;

function lerGuardado(): Record<string, string> {
  const saida: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIXO)) saida[k.slice(PREFIXO.length)] = localStorage.getItem(k) ?? '';
  }
  return saida;
}

export class ContaNoDrive {
  private estado: EstadoDaConta;
  private ouvintes = new Set<Ouvinte>();
  private temporizador: ReturnType<typeof setTimeout> | null = null;
  private userId: string | null = null;
  /**
   * Uma operação no Drive por vez. Sem a fila, a conexão silenciosa do login e
   * o clique em "Conectar" rodavam juntas, as duas não achavam o arquivo, e as
   * duas o CRIAVAM: a conta ficava partida em dois arquivos no Drive.
   */
  private fila: Promise<unknown> = Promise.resolve();
  private enfileirar<T>(f: () => Promise<T>): Promise<T> {
    const vez = this.fila.then(f, f);
    this.fila = vez.catch(() => undefined);
    return vez;
  }
  private drive: (ArquivoDaConta & { autorizar(i: boolean): Promise<void>; autorizado: boolean }) | null = null;

  constructor(
    private readonly criarDrive: (email?: string) => ArquivoDaConta & {
      autorizar(i: boolean): Promise<void>;
      autorizado: boolean;
    } = (email) => new DriveAppData(undefined, undefined, email)
  ) {
    let salvo: Partial<EstadoDaConta> = {};
    try {
      salvo = JSON.parse(localStorage.getItem(CHAVE_DO_ESTADO) ?? '{}');
    } catch {
      salvo = {};
    }
    this.estado = { onde: salvo.onde ?? 'drive', conectado: false, pendente: !!salvo.pendente, ...pick(salvo) };
    if (typeof window !== 'undefined') {
      window.addEventListener(DADOS_MUDARAM, (e) => this.aoMudar((e as CustomEvent<string>).detail));
    }
  }

  get atual(): EstadoDaConta {
    return this.estado;
  }

  ouvir(f: Ouvinte): () => void {
    this.ouvintes.add(f);
    return () => this.ouvintes.delete(f);
  }

  private mudar(parcial: Partial<EstadoDaConta>): void {
    this.estado = { ...this.estado, ...parcial };
    const { onde, pendente, ultimaGravacao, ultimaLeitura } = this.estado;
    try {
      localStorage.setItem(CHAVE_DO_ESTADO, JSON.stringify({ onde, pendente, ultimaGravacao, ultimaLeitura }));
    } catch {
      // armazenamento bloqueado
    }
    this.ouvintes.forEach((f) => f(this.estado));
  }

  /** Quem está na conta. Sem sessão, não há conta a guardar. */
  entrou(userId: string | null, email?: string): void {
    if (userId === this.userId) return;
    this.userId = userId;
    this.drive = userId ? this.criarDrive(email) : null;
    this.mudar({ conectado: false, erro: undefined });
    /** Já houve consentimento antes? Tenta em silêncio; sem ele, a tela oferece o botão. */
    if (userId && this.estado.onde === 'drive') void this.conectar(false);
  }

  escolher(onde: OndeGuardar): void {
    this.mudar({ onde, erro: undefined });
    if (onde === 'drive' && this.userId) void this.conectar(true);
  }

  /** Conecta ao Drive e traz a conta de lá, fundida com o que há aqui; depois grava a soma. */
  async conectar(interativo: boolean): Promise<void> {
    return this.enfileirar(() => this.conectarJa(interativo));
  }

  private async conectarJa(interativo: boolean): Promise<void> {
    if (!this.drive || !this.userId) return;
    if (this.estado.conectado && this.drive.autorizado) return;
    try {
      await this.drive.autorizar(interativo);
      this.mudar({ conectado: true, erro: undefined });
      await this.trazerDoDrive();
      await this.gravarJa();
    } catch (e) {
      /** Silencioso e sem consentimento prévio é o caso comum: não é erro para a pessoa. */
      if (!interativo && e instanceof ErroDoDrive && e.codigo === 'SEM_PERMISSAO') return;
      this.mudar({ conectado: false, erro: (e as Error).message });
    }
  }

  private async trazerDoDrive(): Promise<void> {
    const texto = await this.drive!.ler(NOME_DO_ARQUIVO);
    if (texto === null) return;
    const lida = lerCopia(texto, this.userId!);
    if (!lida.ok) throw new Error(lida.motivo);
    this.aplicar(lida.copia);
    this.mudar({ ultimaLeitura: new Date().toISOString() });
  }

  private aplicar(copia: Parameters<typeof fundirCopia>[1]): void {
    const fundido = fundirCopia(lerGuardado(), copia);
    this.aplicando = true;
    try {
      for (const [k, v] of Object.entries(fundido)) localStorage.setItem(`${PREFIXO}${k}`, v);
    } finally {
      this.aplicando = false;
    }
  }
  private aplicando = false;

  private aoMudar(chave: string): void {
    if (this.aplicando || CHAVES_PROPRIAS.has(chave) || !this.userId) return;
    if (this.estado.onde !== 'drive') return;
    if (!this.estado.pendente) this.mudar({ pendente: true });
    if (this.temporizador) clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => void this.gravarAgora().catch(() => undefined), ESPERA_PARA_GRAVAR_MS);
  }

  /** Grava a conta inteira no Drive — um arquivo só, pequeno (texto). */
  async gravarAgora(): Promise<void> {
    return this.enfileirar(() => this.gravarJa());
  }

  private async gravarJa(): Promise<void> {
    if (!this.drive || !this.userId || this.estado.onde !== 'drive') return;
    /** Sem consentimento ainda, a mudança fica pendente — e vai quando a pessoa conectar. */
    if (!this.estado.conectado) return;
    try {
      if (!this.drive.autorizado) await this.drive.autorizar(false);
      const copia = montarCopia(lerGuardado(), this.userId);
      await this.drive.gravar(NOME_DO_ARQUIVO, JSON.stringify(copia));
      this.mudar({ pendente: false, conectado: true, ultimaGravacao: copia.geradaEm, erro: undefined });
    } catch (e) {
      this.mudar({ conectado: this.drive.autorizado, erro: (e as Error).message });
      throw e;
    }
  }

  /** A conta como arquivo, para baixar — vale nos dois modos, e é o caminho do celular sem Drive. */
  exportar(): string {
    if (!this.userId) throw new Error('Entre na sua conta para exportar os dados.');
    return JSON.stringify(montarCopia(lerGuardado(), this.userId), null, 2);
  }

  /** Traz um arquivo exportado. Recusa o de outra conta. */
  importar(texto: string): { ok: true } | { ok: false; motivo: string } {
    if (!this.userId) return { ok: false, motivo: 'Entre na sua conta para restaurar os dados.' };
    const lida = lerCopia(texto, this.userId);
    if (!lida.ok) return lida;
    this.aplicar(lida.copia);
    if (this.estado.onde === 'drive') this.aoMudar('importacao');
    return { ok: true };
  }
}

function pick(s: Partial<EstadoDaConta>): Partial<EstadoDaConta> {
  return { ultimaGravacao: s.ultimaGravacao, ultimaLeitura: s.ultimaLeitura };
}

export const contaNoDrive = new ContaNoDrive();
