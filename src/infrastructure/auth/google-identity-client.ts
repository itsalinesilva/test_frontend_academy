/**
 * Cliente do Google Identity Services (GIS).
 *
 * Substitui o `GoogleOAuthModal` simulado, que gerava
 * `mock_google_id_token_...` e permitia digitar qualquer e-mail
 * (CLAUDE_AUDIT.md S-03/S-04).
 *
 * Aqui obtemos um ID token REAL, assinado pelo Google. Este módulo não
 * decide nada sobre identidade nem privilégio: ele apenas coleta a
 * credencial e a entrega para o servidor verificar.
 */

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    nonce?: string;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: 'signin' | 'signup' | 'use';
    ux_mode?: 'popup' | 'redirect';
  }): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  prompt(listener?: (notification: { isNotDisplayed(): boolean; isSkippedMoment(): boolean }) => void): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

export class GoogleIdentityError extends Error {
  public readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'GoogleIdentityError';
    this.code = code;
  }
}

export function getGoogleClientId(): string {
  return import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || '';
}

export function isGoogleSignInConfigured(): boolean {
  return getGoogleClientId().length > 0;
}

let scriptPromise: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new GoogleIdentityError('NO_DOCUMENT', 'Google Sign-In requer ambiente de navegador.'));
      return;
    }
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_URL}"]`);
    const script = existing ?? document.createElement('script');

    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () =>
      reject(
        new GoogleIdentityError(
          'SCRIPT_LOAD_FAILED',
          'Não foi possível carregar o Google Identity Services. Verifique a conexão.'
        )
      )
    );

    if (!existing) {
      script.src = GIS_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  return scriptPromise;
}

/** Nonce criptográfico de uso único — o servidor confere contra a claim do token. */
export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Renderiza o botão oficial do Google e resolve com o ID token assinado.
 *
 * Usamos o botão oficial (em vez de One Tap apenas) porque ele funciona de
 * forma previsível em todos os navegadores e é o caminho acessível por teclado.
 */
export async function requestGoogleIdToken(params: {
  container: HTMLElement;
  nonce: string;
  locale?: string;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}): Promise<string> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new GoogleIdentityError(
      'NOT_CONFIGURED',
      'VITE_GOOGLE_OAUTH_CLIENT_ID não está definido. Configure o OAuth Client ID do Google.'
    );
  }

  await loadGisScript();
  const gis = window.google?.accounts?.id;
  if (!gis) {
    throw new GoogleIdentityError('GIS_UNAVAILABLE', 'Google Identity Services não ficou disponível.');
  }

  return new Promise<string>((resolve, reject) => {
    let settled = false;

    gis.initialize({
      client_id: clientId,
      nonce: params.nonce,
      cancel_on_tap_outside: true,
      ux_mode: 'popup',
      callback: (response) => {
        if (settled) return;
        settled = true;
        if (!response.credential) {
          reject(new GoogleIdentityError('NO_CREDENTIAL', 'O Google não retornou credencial.'));
          return;
        }
        resolve(response.credential);
      },
    });

    params.container.innerHTML = '';
    gis.renderButton(params.container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: params.text || 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      locale: params.locale || 'pt-BR',
      width: params.container.clientWidth || 320,
    });
  });
}

/** Encerra a seleção automática de conta ao sair. */
export function disableGoogleAutoSelect(): void {
  try {
    window.google?.accounts?.id?.disableAutoSelect();
  } catch {
    // GIS ausente — nada a desfazer.
  }
}
