import { getGoogleClientId } from '../auth/google-identity-client';

/**
 * O arquivo da conta no Google Drive da própria pessoa (ADR-001.A).
 *
 * Escopo `drive.appdata`: a pasta oculta da aplicação. A pessoa não a vê no
 * Drive, nenhum outro app a lê, e a plataforma não enxerga nada fora dela.
 * O Google classifica o escopo como não sensível — sem verificação restrita.
 *
 * O token de acesso vem do Google Identity Services (token client) e fica só
 * em memória: é curto (uma hora) e renovável sem nova tela depois do primeiro
 * consentimento. Nunca vai para o `localStorage`.
 */
export const ESCOPO_APPDATA = 'https://www.googleapis.com/auth/drive.appdata';
const API = 'https://www.googleapis.com/drive/v3';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3';

interface TokenClient {
  requestAccessToken(opcoes?: { prompt?: string; login_hint?: string }): void;
}
interface Oauth2 {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    callback: (r: { access_token?: string; expires_in?: number; error?: string }) => void;
    error_callback?: (e: { type: string }) => void;
  }): TokenClient;
}

export class ErroDoDrive extends Error {
  constructor(
    public readonly codigo: 'SEM_CONFIGURACAO' | 'SEM_PERMISSAO' | 'REDE' | 'COTA' | 'RESPOSTA',
    mensagem: string
  ) {
    super(mensagem);
    this.name = 'ErroDoDrive';
  }
}

export interface ArquivoDaConta {
  /** `null` quando a conta ainda não tem arquivo no Drive. */
  ler(nome: string): Promise<string | null>;
  gravar(nome: string, conteudo: string): Promise<void>;
}

/** O Drive de verdade. `pedirToken` e `buscar` são injetáveis para teste. */
export class DriveAppData implements ArquivoDaConta {
  private token: { valor: string; expiraEm: number } | null = null;
  private idDoArquivo = new Map<string, string>();

  constructor(
    private readonly pedirToken: (interativo: boolean, email?: string) => Promise<{ valor: string; segundos: number }> = pedirTokenAoGoogle,
    private readonly buscar: typeof fetch = (...a) => fetch(...a),
    private readonly email?: string
  ) {}

  /** O primeiro pedido pode abrir a janela de consentimento; os seguintes, não. */
  async autorizar(interativo: boolean): Promise<void> {
    if (this.token && this.token.expiraEm > Date.now() + 60_000) return;
    const t = await this.pedirToken(interativo, this.email);
    this.token = { valor: t.valor, expiraEm: Date.now() + t.segundos * 1000 };
  }

  get autorizado(): boolean {
    return !!this.token && this.token.expiraEm > Date.now();
  }

  private async chamar(url: string, init: RequestInit = {}): Promise<Response> {
    await this.autorizar(false);
    let r: Response;
    try {
      r = await this.buscar(url, {
        ...init,
        headers: { ...(init.headers ?? {}), Authorization: `Bearer ${this.token!.valor}` },
      });
    } catch {
      throw new ErroDoDrive('REDE', 'Sem conexão com o Google Drive.');
    }
    if (r.status === 401 || r.status === 403) {
      const corpo = await r.text().catch(() => '');
      this.token = null;
      if (/storageQuotaExceeded/.test(corpo)) {
        throw new ErroDoDrive('COTA', 'O Google Drive da sua conta está sem espaço.');
      }
      throw new ErroDoDrive('SEM_PERMISSAO', 'O Google Drive não autorizou o acesso. Autorize de novo.');
    }
    if (!r.ok) throw new ErroDoDrive('RESPOSTA', `O Google Drive respondeu ${r.status}.`);
    return r;
  }

  private async acharId(nome: string): Promise<string | null> {
    const guardado = this.idDoArquivo.get(nome);
    if (guardado) return guardado;
    const q = encodeURIComponent(`name = '${nome.replace(/'/g, "\\'")}'`);
    const r = await this.chamar(`${API}/files?spaces=appDataFolder&q=${q}&fields=files(id,name)`);
    const { files } = (await r.json()) as { files: Array<{ id: string }> };
    const id = files[0]?.id ?? null;
    if (id) this.idDoArquivo.set(nome, id);
    return id;
  }

  async ler(nome: string): Promise<string | null> {
    const id = await this.acharId(nome);
    if (!id) return null;
    const r = await this.chamar(`${API}/files/${id}?alt=media`);
    return r.text();
  }

  async gravar(nome: string, conteudo: string): Promise<void> {
    const id = await this.acharId(nome);
    if (id) {
      await this.chamar(`${UPLOAD}/files/${id}?uploadType=media`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: conteudo,
      });
      return;
    }
    /** Criação: metadados (nome, pasta oculta) e conteúdo numa só requisição. */
    const fronteira = `muscicapa${Date.now()}`;
    const corpo =
      `--${fronteira}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify({ name: nome, parents: ['appDataFolder'] }) +
      `\r\n--${fronteira}\r\nContent-Type: application/json\r\n\r\n${conteudo}\r\n--${fronteira}--`;
    const r = await this.chamar(`${UPLOAD}/files?uploadType=multipart&fields=id`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${fronteira}` },
      body: corpo,
    });
    const { id: novo } = (await r.json()) as { id: string };
    this.idDoArquivo.set(nome, novo);
  }
}

/** Pede o token ao Google Identity Services. */
export async function pedirTokenAoGoogle(
  interativo: boolean,
  email?: string
): Promise<{ valor: string; segundos: number }> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new ErroDoDrive('SEM_CONFIGURACAO', 'O login Google não está configurado neste ambiente.');
  }
  await carregarGis();
  const oauth2 = (window as unknown as { google?: { accounts?: { oauth2?: Oauth2 } } }).google?.accounts?.oauth2;
  if (!oauth2) throw new ErroDoDrive('SEM_CONFIGURACAO', 'O Google Identity Services não carregou.');

  return new Promise((ok, falha) => {
    const cliente = oauth2.initTokenClient({
      client_id: clientId,
      scope: ESCOPO_APPDATA,
      callback: (r) =>
        r.access_token
          ? ok({ valor: r.access_token, segundos: r.expires_in ?? 3600 })
          : falha(new ErroDoDrive('SEM_PERMISSAO', 'O acesso ao Google Drive não foi concedido.')),
      error_callback: () => falha(new ErroDoDrive('SEM_PERMISSAO', 'O acesso ao Google Drive não foi concedido.')),
    });
    /** Sem interação: `prompt: ''` renova em silêncio quando já houve consentimento. */
    cliente.requestAccessToken({ prompt: interativo ? 'consent' : '', login_hint: email });
  });
}

function carregarGis(): Promise<void> {
  const url = 'https://accounts.google.com/gsi/client';
  const w = window as unknown as { google?: { accounts?: { oauth2?: unknown } } };
  if (w.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((ok, falha) => {
    const existente = document.querySelector<HTMLScriptElement>(`script[src="${url}"]`);
    const s = existente ?? document.createElement('script');
    s.addEventListener('load', () => ok());
    s.addEventListener('error', () => falha(new ErroDoDrive('REDE', 'Não foi possível carregar o Google.')));
    if (!existente) {
      s.src = url;
      s.async = true;
      document.head.appendChild(s);
    } else if (w.google?.accounts) {
      ok();
    }
  });
}
