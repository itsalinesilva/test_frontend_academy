import { describe, it, expect, beforeEach } from 'vitest';
import { handleApiRequest, ServerEnv, resetAuditLogForTesting } from '../server/core/api-router';
import { issueSession, verifySession } from '../server/core/session';
import { resolveAdminGrant, parseAdminAllowlist } from '../server/core/admin-authority';
import { ChainedAuditLog } from '../server/core/audit-log';
import { VerifiedGoogleIdentity } from '../server/core/google-identity';

/**
 * Suíte de autorização da autoridade de servidor (CLAUDE_TODO item 0.12).
 *
 * Cobre exatamente as falhas provadas na auditoria:
 *   S-01 — e-mail no corpo da requisição concedia nível 100 sem token;
 *   S-02 — allowlist embutida no cliente e fallback local em caso de falha;
 *   S-05 — token de sessão forjável;
 *   S-07 — log de auditoria sem assinatura real.
 */

const SECRET = 'segredo-de-teste-com-mais-de-32-caracteres-ok';

const TEST_ENV: ServerEnv = {
  GOOGLE_OAUTH_CLIENT_ID: 'test-client-id.apps.googleusercontent.com',
  ADMIN_ALLOWLIST: 'admin.institucional@exemplo.org',
  SESSION_SIGNING_SECRET: SECRET,
  AUDIT_SIGNING_SECRET: SECRET,
  ALLOWED_ORIGIN: 'http://localhost:3000',
};

function identity(email: string, sub = 'sub_123'): VerifiedGoogleIdentity {
  const now = Math.floor(Date.now() / 1000);
  return {
    googleSubject: sub,
    email,
    emailVerified: true,
    name: 'Identidade de Teste',
    issuedAt: now,
    expiresAt: now + 3600,
  };
}

async function adminToken(): Promise<string> {
  const { token } = await issueSession(
    identity('admin.institucional@exemplo.org'),
    { isAdmin: true, level: 100 },
    SECRET
  );
  return token;
}

async function userToken(): Promise<string> {
  const { token } = await issueSession(
    identity('aluno.comum@exemplo.org', 'sub_999'),
    { isAdmin: false },
    SECRET
  );
  return token;
}

function get(path: string, token?: string): Request {
  return new Request(`http://localhost:3000${path}`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

beforeEach(() => resetAuditLogForTesting());

describe('S-01 — e-mail do cliente não é prova de identidade', () => {
  it('nega /admin/verify sem nenhuma credencial', async () => {
    const res = await handleApiRequest(get('/api/v1/admin/verify'), TEST_ENV);
    expect(res.status).toBe(401);
  });

  it('nega /admin/audit-logs sem credencial, mesmo com e-mail na query string', async () => {
    // Esta era a requisição que antes devolvia o log inteiro.
    const res = await handleApiRequest(
      get('/api/v1/admin/audit-logs?email=admin.institucional@exemplo.org&limit=50'),
      TEST_ENV
    );
    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('UNAUTHENTICATED');
  });

  it('não existe caminho que aceite e-mail no corpo para conceder admin', async () => {
    const res = await handleApiRequest(
      new Request('http://localhost:3000/api/v1/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin.institucional@exemplo.org' }),
      }),
      TEST_ENV
    );
    expect(res.status).toBe(404);
  });
});

describe('Autorização por sessão verificada', () => {
  it('admin com sessão válida é autorizado', async () => {
    const res = await handleApiRequest(get('/api/v1/admin/verify', await adminToken()), TEST_ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { isAdmin: boolean; level: number } };
    expect(body.data.isAdmin).toBe(true);
    expect(body.data.level).toBe(100);
  });

  it('usuário comum com sessão válida é negado', async () => {
    const res = await handleApiRequest(get('/api/v1/admin/verify', await userToken()), TEST_ENV);
    expect(res.status).toBe(403);
  });

  it('usuário comum não lê o log de auditoria', async () => {
    const res = await handleApiRequest(get('/api/v1/admin/audit-logs', await userToken()), TEST_ENV);
    expect(res.status).toBe(403);
  });

  it('admin lê o log de auditoria e a cadeia está íntegra', async () => {
    const res = await handleApiRequest(get('/api/v1/admin/audit-logs', await adminToken()), TEST_ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data: { integrity: { valid: boolean } } };
    expect(body.data.integrity.valid).toBe(true);
  });
});

describe('S-05 — integridade do token de sessão', () => {
  it('rejeita token adulterado no payload', async () => {
    const token = await adminToken();
    const [header, payload, signature] = token.split('.');
    const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    claims.email = 'invasor@exemplo.org';
    const forged = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const res = await handleApiRequest(get('/api/v1/admin/verify', `${header}.${forged}.${signature}`), TEST_ENV);
    expect(res.status).toBe(401);
  });

  it('rejeita token assinado com outro segredo', async () => {
    const { token } = await issueSession(
      identity('admin.institucional@exemplo.org'),
      { isAdmin: true, level: 100 },
      'outro-segredo-completamente-diferente-com-32+'
    );
    const res = await handleApiRequest(get('/api/v1/admin/verify', token), TEST_ENV);
    expect(res.status).toBe(401);
  });

  it('rejeita sessão expirada', async () => {
    const { token } = await issueSession(identity('admin.institucional@exemplo.org'), { isAdmin: true }, SECRET);
    const [header, payload, sig] = token.split('.');
    const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    claims.exp = Math.floor(Date.now() / 1000) - 10;
    const expired = btoa(JSON.stringify(claims)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    await expect(verifySession(`${header}.${expired}.${sig}`, SECRET)).rejects.toThrow();
  });

  it('recusa segredo de assinatura fraco', async () => {
    await expect(issueSession(identity('x@y.org'), { isAdmin: false }, 'curto')).rejects.toThrow(
      /32 caracteres/
    );
  });
});

describe('S-02 — allowlist é configuração de servidor, e falha fechada', () => {
  it('allowlist declarada vazia não concede administrador a ninguém', () => {
    // Variável PRESENTE e vazia é uma decisão explícita de quem configurou:
    // ninguém é administrador, nem as contas da fundadora.
    const grant = resolveAdminGrant({ email: 'alinealv.silv@gmail.com' }, parseAdminAllowlist(''));
    expect(grant.isAdmin).toBe(false);
  });

  it('sem a variável definida, valem as contas da fundadora', () => {
    const padrao = parseAdminAllowlist(undefined);
    expect(resolveAdminGrant({ email: 'alinealv.silv@gmail.com' }, padrao).isAdmin).toBe(true);
    expect(resolveAdminGrant({ email: 'office.alinesilva@gmail.com' }, padrao).isAdmin).toBe(true);
  });

  it('a variável definida SUBSTITUI o padrão — a fundadora deixa de ser admin', () => {
    // Outro deployment define a sua própria relação e não herda a nossa.
    const outra = parseAdminAllowlist('governanca@outra-instituicao.org');
    expect(resolveAdminGrant({ email: 'alinealv.silv@gmail.com' }, outra).isAdmin).toBe(false);
    expect(resolveAdminGrant({ email: 'governanca@outra-instituicao.org' }, outra).isAdmin).toBe(true);
  });

  it('e-mail de terceiro nunca vira administrador', () => {
    const padrao = parseAdminAllowlist(undefined);
    expect(resolveAdminGrant({ email: 'alinealv.silv@gmail.com.atacante.net' }, padrao).isAdmin).toBe(false);
    expect(resolveAdminGrant({ email: 'qualquer@exemplo.org' }, padrao).isAdmin).toBe(false);
  });

  it('servidor sem configuração responde 503 em vez de liberar', async () => {
    const res = await handleApiRequest(get('/api/v1/admin/verify', 'qualquer'), {
      ALLOWED_ORIGIN: 'http://localhost:3000',
    });
    expect(res.status).toBe(503);
  });

  it('comparação de e-mail é normalizada, sem passar a aceitar variações', () => {
    const allowlist = parseAdminAllowlist('  Admin.Institucional@Exemplo.ORG , ');
    expect(resolveAdminGrant({ email: 'admin.institucional@exemplo.org' }, allowlist).isAdmin).toBe(true);
    expect(resolveAdminGrant({ email: 'admin.institucional@exemplo.org.br' }, allowlist).isAdmin).toBe(false);
    expect(resolveAdminGrant({ email: 'xadmin.institucional@exemplo.org' }, allowlist).isAdmin).toBe(false);
  });
});

describe('S-07 — cadeia de auditoria', () => {
  it('detecta alteração de conteúdo de um registro', async () => {
    const log = new ChainedAuditLog(SECRET);
    await log.record({ action: 'a.1', severity: 'INFO', details: 'primeiro' });
    await log.record({ action: 'a.2', severity: 'INFO', details: 'segundo' });
    await log.record({ action: 'a.3', severity: 'INFO', details: 'terceiro' });

    expect((await log.verifyChain()).valid).toBe(true);

    // Adulteração direta do registro do meio.
    const records = log.getRecent(10) as unknown as Array<{ details: string }>;
    records[1].details = 'conteúdo trocado';

    const result = await log.verifyChain();
    expect(result.valid).toBe(false);
    expect(result.brokenAtSeq).toBe(2);
  });

  it('assina com HMAC real, não com valor aleatório', async () => {
    const log = new ChainedAuditLog(SECRET);
    const record = await log.record({ action: 'a.1', severity: 'INFO', details: 'único' });
    expect(record.signature).toMatch(/^[0-9a-f]{64}$/);
    expect(record.previousSignature).toBe('genesis');
  });
});

// ---------------------------------------------------------------------------
// L-7a — os relatos de exercício
// ---------------------------------------------------------------------------

function kvDeMemoria() {
  const dados = new Map<string, string>();
  return {
    dados,
    async put(k: string, v: string) {
      dados.set(k, v);
    },
    async get(k: string) {
      return dados.get(k) ?? null;
    },
    async list({ prefix }: { prefix: string }) {
      return { keys: [...dados.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })) };
    },
  };
}

function post(path: string, body: unknown, token?: string): Request {
  return new Request(`http://localhost:3000${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
}

describe('L-7a — relatos de exercício', () => {
  const relato = { exerciseId: 'gen_NOTE_0_1', enunciado: 'Que nota está escrita na pauta?', comentario: 'A pauta está vazia.' };

  it('sem sessão, recusa — relato precisa de autoria', async () => {
    const env = { ...TEST_ENV, RELATOS: kvDeMemoria() };
    const res = await handleApiRequest(post('/api/v1/relatos', relato), env);
    expect(res.status).toBe(401);
  });

  it('sem armazenamento configurado, diz isso — e não finge que guardou', async () => {
    const res = await handleApiRequest(post('/api/v1/relatos', relato, await userToken()), TEST_ENV);
    expect(res.status).toBe(503);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe('RELATOS_NAO_CONFIGURADO');
  });

  it('🔴 guarda, com a autoria DA SESSÃO — e não a que o corpo disser', async () => {
    const kv = kvDeMemoria();
    const env = { ...TEST_ENV, RELATOS: kv };
    const res = await handleApiRequest(
      post('/api/v1/relatos', { ...relato, autorEmail: 'forjado@exemplo.org' }, await userToken()),
      env
    );
    expect(res.status).toBe(201);
    const [gravado] = [...kv.dados.values()].map((v) => JSON.parse(v));
    expect(gravado).toMatchObject({ exerciseId: relato.exerciseId, autorEmail: 'aluno.comum@exemplo.org' });
  });

  it('relato sem exercício ou com comentário longo demais é recusado', async () => {
    const env = { ...TEST_ENV, RELATOS: kvDeMemoria() };
    const semExercicio = await handleApiRequest(post('/api/v1/relatos', { enunciado: 'x' }, await userToken()), env);
    expect(semExercicio.status).toBe(400);
    const longo = await handleApiRequest(
      post('/api/v1/relatos', { ...relato, comentario: 'x'.repeat(501) }, await userToken()),
      env
    );
    expect(longo.status).toBe(400);
  });

  it('só a administração lê os relatos', async () => {
    const env = { ...TEST_ENV, RELATOS: kvDeMemoria() };
    await handleApiRequest(post('/api/v1/relatos', relato, await userToken()), env);

    expect((await handleApiRequest(get('/api/v1/founder/relatos', await userToken()), env)).status).toBe(403);
    const res = await handleApiRequest(get('/api/v1/founder/relatos', await adminToken()), env);
    expect(res.status).toBe(200);
    const corpo = (await res.json()) as { data: { relatos: Array<{ enunciado: string }> } };
    expect(corpo.data.relatos.map((r) => r.enunciado)).toEqual([relato.enunciado]);
  });
});
