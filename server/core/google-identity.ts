/**
 * Verificação de identidade Google — autoridade de servidor.
 *
 * REGRA CANÔNICA: um e-mail enviado pelo cliente NÃO é prova de identidade.
 * A única prova aceita é um ID token do Google cuja assinatura RS256 seja
 * verificada contra o JWKS público do Google e cujas claims sejam validadas.
 *
 * Este módulo vive FORA de `src/` deliberadamente: nada aqui pode ser
 * importado por código de cliente nem entrar no bundle do navegador.
 * Ver CLAUDE_AUDIT.md S-01/S-02.
 *
 * Usa apenas Web Crypto e fetch — roda igual em Cloudflare Workers e Node 18+.
 */

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

/** Claims que a plataforma consome de um ID token já verificado. */
export interface VerifiedGoogleIdentity {
  /** `sub` — identificador estável e imutável do Google. Chave de identidade. */
  readonly googleSubject: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly name?: string;
  readonly pictureUrl?: string;
  readonly issuedAt: number;
  readonly expiresAt: number;
}

export class IdentityVerificationError extends Error {
  public readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'IdentityVerificationError';
    this.code = code;
  }
}

interface GoogleJwk {
  kid: string;
  kty: string;
  alg: string;
  use: string;
  n: string;
  e: string;
}

interface JwtHeader {
  alg: string;
  kid: string;
  typ?: string;
}

interface GoogleIdTokenClaims {
  iss: string;
  aud: string;
  sub: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
  nonce?: string;
  iat: number;
  exp: number;
}

function base64UrlDecode(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const withPadding = padded + '='.repeat((4 - (padded.length % 4)) % 4);
  const binary = atob(withPadding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlDecodeJson<T>(input: string): T {
  const bytes = base64UrlDecode(input);
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

/**
 * Cache do JWKS. O Google rotaciona as chaves periodicamente; respeitamos
 * `Cache-Control: max-age` da resposta, com um piso conservador.
 */
let jwksCache: { keys: GoogleJwk[]; expiresAt: number } | null = null;
const JWKS_MIN_TTL_MS = 60_000;

async function fetchGoogleJwks(): Promise<GoogleJwk[]> {
  const now = Date.now();
  if (jwksCache && jwksCache.expiresAt > now) {
    return jwksCache.keys;
  }

  const response = await fetch(GOOGLE_JWKS_URL);
  if (!response.ok) {
    throw new IdentityVerificationError(
      'JWKS_UNAVAILABLE',
      `Não foi possível obter as chaves públicas do Google (HTTP ${response.status}).`
    );
  }

  const body = (await response.json()) as { keys: GoogleJwk[] };
  if (!body.keys || body.keys.length === 0) {
    throw new IdentityVerificationError('JWKS_EMPTY', 'O Google retornou um conjunto de chaves vazio.');
  }

  const cacheControl = response.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const ttlMs = maxAgeMatch ? Number(maxAgeMatch[1]) * 1000 : JWKS_MIN_TTL_MS;

  jwksCache = { keys: body.keys, expiresAt: now + Math.max(ttlMs, JWKS_MIN_TTL_MS) };
  return body.keys;
}

/** Usado apenas por testes, para isolar execuções. */
export function resetJwksCacheForTesting(): void {
  jwksCache = null;
}

/**
 * Verifica um ID token do Google de ponta a ponta.
 *
 * @param idToken   JWT emitido pelo Google Identity Services.
 * @param clientId  OAuth Client ID esperado na claim `aud`.
 * @param expectedNonce  Nonce gerado pelo cliente, quando houver (anti-replay).
 */
export async function verifyGoogleIdToken(
  idToken: string,
  clientId: string,
  expectedNonce?: string
): Promise<VerifiedGoogleIdentity> {
  if (!clientId) {
    throw new IdentityVerificationError(
      'MISSING_CLIENT_ID',
      'GOOGLE_OAUTH_CLIENT_ID não está configurado no ambiente do servidor.'
    );
  }
  if (!idToken || typeof idToken !== 'string') {
    throw new IdentityVerificationError('MISSING_TOKEN', 'Nenhum ID token foi apresentado.');
  }

  const segments = idToken.split('.');
  if (segments.length !== 3) {
    throw new IdentityVerificationError('MALFORMED_TOKEN', 'O ID token não é um JWT bem formado.');
  }
  const [encodedHeader, encodedPayload, encodedSignature] = segments;

  let header: JwtHeader;
  let claims: GoogleIdTokenClaims;
  try {
    header = base64UrlDecodeJson<JwtHeader>(encodedHeader);
    claims = base64UrlDecodeJson<GoogleIdTokenClaims>(encodedPayload);
  } catch {
    throw new IdentityVerificationError('MALFORMED_TOKEN', 'Não foi possível decodificar o ID token.');
  }

  // O algoritmo vem do próprio token; aceitar qualquer valor permitiria
  // ataques de confusão de algoritmo (alg=none, HS256 com a chave pública).
  if (header.alg !== 'RS256') {
    throw new IdentityVerificationError(
      'UNSUPPORTED_ALGORITHM',
      `Algoritmo de assinatura não aceito: ${header.alg}. Apenas RS256.`
    );
  }

  const jwks = await fetchGoogleJwks();
  const jwk = jwks.find((k) => k.kid === header.kid);
  if (!jwk) {
    throw new IdentityVerificationError(
      'UNKNOWN_KEY',
      'A chave que assinou o token não consta no JWKS atual do Google.'
    );
  }

  const publicKey = await crypto.subtle.importKey(
    'jwk',
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const signedContent = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const signature = base64UrlDecode(encodedSignature);

  const signatureIsValid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    publicKey,
    signature as unknown as ArrayBuffer,
    signedContent as unknown as ArrayBuffer
  );

  if (!signatureIsValid) {
    throw new IdentityVerificationError('INVALID_SIGNATURE', 'A assinatura do ID token é inválida.');
  }

  // Assinatura válida não basta: as claims precisam ser as esperadas.
  if (!GOOGLE_ISSUERS.includes(claims.iss)) {
    throw new IdentityVerificationError('INVALID_ISSUER', `Emissor não reconhecido: ${claims.iss}.`);
  }
  if (claims.aud !== clientId) {
    throw new IdentityVerificationError(
      'INVALID_AUDIENCE',
      'O token foi emitido para outra aplicação. Possível tentativa de reuso de token.'
    );
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const CLOCK_SKEW_SECONDS = 60;
  if (claims.exp + CLOCK_SKEW_SECONDS < nowSeconds) {
    throw new IdentityVerificationError('TOKEN_EXPIRED', 'O ID token expirou.');
  }
  if (claims.iat - CLOCK_SKEW_SECONDS > nowSeconds) {
    throw new IdentityVerificationError('TOKEN_NOT_YET_VALID', 'O ID token tem data de emissão no futuro.');
  }

  if (expectedNonce && claims.nonce !== expectedNonce) {
    throw new IdentityVerificationError('NONCE_MISMATCH', 'O nonce não confere. Requisição possivelmente replicada.');
  }

  if (!claims.email) {
    throw new IdentityVerificationError('MISSING_EMAIL', 'O token não contém e-mail. Escopo `email` ausente.');
  }

  const emailVerified = claims.email_verified === true || claims.email_verified === 'true';
  if (!emailVerified) {
    throw new IdentityVerificationError(
      'EMAIL_NOT_VERIFIED',
      'O e-mail da conta Google não é verificado.'
    );
  }

  return {
    googleSubject: claims.sub,
    email: claims.email.trim().toLowerCase(),
    emailVerified,
    name: claims.name,
    pictureUrl: claims.picture,
    issuedAt: claims.iat,
    expiresAt: claims.exp,
  };
}
