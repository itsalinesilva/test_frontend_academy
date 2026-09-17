/**
 * Emissão e validação de sessão — autoridade de servidor.
 *
 * Substitui `token_${userId}_${Date.now()}` (CLAUDE_AUDIT.md S-05), que era
 * um identificador em texto claro, sem assinatura e trivialmente forjável.
 *
 * O token é um JWS compacto HS256 assinado com um segredo que existe apenas
 * no ambiente do servidor. O cliente pode ler o payload, mas não pode
 * produzir nem alterar um token válido.
 */

import { VerifiedGoogleIdentity } from './google-identity';

export interface SessionClaims {
  /** `sub` do Google — identidade estável, imune a troca de e-mail. */
  readonly sub: string;
  readonly email: string;
  readonly name?: string;
  readonly picture?: string;
  /** Resolvido pelo servidor a partir da allowlist. Nunca vem do cliente. */
  readonly isAdmin: boolean;
  readonly adminLevel?: number;
  readonly iat: number;
  readonly exp: number;
}

export class SessionError extends Error {
  public readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'SessionError';
    this.code = code;
  }
}

const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 horas

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
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

async function importHmacKey(secret: string): Promise<CryptoKey> {
  if (!secret || secret.length < 32) {
    throw new SessionError(
      'WEAK_SECRET',
      'SESSION_SIGNING_SECRET ausente ou com menos de 32 caracteres.'
    );
  }
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret) as unknown as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/** Comparação em tempo constante — evita vazar informação por timing. */
function constantTimeEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export async function issueSession(
  identity: VerifiedGoogleIdentity,
  admin: { isAdmin: boolean; level?: number },
  signingSecret: string
): Promise<{ token: string; claims: SessionClaims }> {
  const now = Math.floor(Date.now() / 1000);
  const claims: SessionClaims = {
    sub: identity.googleSubject,
    email: identity.email,
    name: identity.name,
    picture: identity.pictureUrl,
    isAdmin: admin.isAdmin,
    adminLevel: admin.level,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };

  const header = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(claims)));
  const signingInput = `${header}.${payload}`;

  const key = await importHmacKey(signingSecret);
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signingInput) as unknown as ArrayBuffer
  );

  return {
    token: `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`,
    claims,
  };
}

/**
 * Valida um token de sessão. Lança em qualquer anomalia — nunca devolve
 * uma sessão parcial ou "provavelmente válida".
 */
export async function verifySession(token: string, signingSecret: string): Promise<SessionClaims> {
  if (!token) {
    throw new SessionError('MISSING_SESSION', 'Nenhuma sessão apresentada.');
  }

  const segments = token.split('.');
  if (segments.length !== 3) {
    throw new SessionError('MALFORMED_SESSION', 'Token de sessão malformado.');
  }
  const [header, payload, signature] = segments;

  let parsedHeader: { alg?: string };
  try {
    parsedHeader = JSON.parse(new TextDecoder().decode(base64UrlDecode(header))) as { alg?: string };
  } catch {
    throw new SessionError('MALFORMED_SESSION', 'Cabeçalho do token ilegível.');
  }
  if (parsedHeader.alg !== 'HS256') {
    throw new SessionError('UNSUPPORTED_ALGORITHM', `Algoritmo de sessão não aceito: ${parsedHeader.alg}.`);
  }

  const key = await importHmacKey(signingSecret);
  const expected = new Uint8Array(
    await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(`${header}.${payload}`) as unknown as ArrayBuffer
    )
  );

  if (!constantTimeEquals(expected, base64UrlDecode(signature))) {
    throw new SessionError('INVALID_SIGNATURE', 'Assinatura de sessão inválida. Token adulterado.');
  }

  let claims: SessionClaims;
  try {
    claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as SessionClaims;
  } catch {
    throw new SessionError('MALFORMED_SESSION', 'Payload do token ilegível.');
  }

  if (claims.exp <= Math.floor(Date.now() / 1000)) {
    throw new SessionError('SESSION_EXPIRED', 'A sessão expirou. Autentique-se novamente.');
  }

  return claims;
}

/** Extrai o token do cabeçalho `Authorization: Bearer <token>`. */
export function extractBearerToken(authorizationHeader: string | null): string {
  if (!authorizationHeader) return '';
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}
