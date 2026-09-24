import { describe, it, expect, beforeEach } from 'vitest';
import { handleApiRequest, ServerEnv, resetAuditLogForTesting } from '../server/core/api-router';
import { issueSession } from '../server/core/session';
import { KVEmMemoria } from '../server/core/salas';
import { registrarAcesso } from '../server/core/contas';

/**
 * P-5 e P-15 — a administração sabe quem usa a plataforma e consegue agir;
 * e escrita tem limite.
 */
const SECRET = 'segredo-de-teste-com-comprimento-suficiente-32+';
let env: ServerEnv;
let kv: KVEmMemoria;

beforeEach(() => {
  resetAuditLogForTesting();
  kv = new KVEmMemoria();
  env = {
    GOOGLE_OAUTH_CLIENT_ID: 'c.apps.googleusercontent.com',
    ADMIN_ALLOWLIST: 'admin@exemplo.org',
    SESSION_SIGNING_SECRET: SECRET,
    AUDIT_SIGNING_SECRET: SECRET,
    ALLOWED_ORIGIN: 'http://localhost:3000',
    COMUNIDADE: kv,
    SALAS: new KVEmMemoria(),
  };
});

async function token(sub: string, email: string, isAdmin = false) {
  const now = Math.floor(Date.now() / 1000);
  const { token: t } = await issueSession(
    { googleSubject: sub, email, name: sub, emailVerified: true, issuedAt: now, expiresAt: now + 3600 },
    { isAdmin },
    SECRET
  );
  return t;
}
async function api(metodo: string, caminho: string, tk?: string, corpo?: unknown) {
  const r = await handleApiRequest(
    new Request(`http://localhost:3000/api/v1${caminho}`, {
      method: metodo,
      headers: { ...(tk ? { Authorization: `Bearer ${tk}` } : {}), 'Content-Type': 'application/json' },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    }),
    env
  );
  const b = (await r.json()) as { data?: never; error?: { code: string } };
  return { status: r.status, data: b.data as never, erro: b.error };
}

describe('🔴 contas: a administração vê e age — no servidor', () => {
  it('o login registra a conta; a lista é só da administração', async () => {
    await registrarAcesso(kv, { sub: 'bia', email: 'bia@x.org', nome: 'Bia' });
    await registrarAcesso(kv, { sub: 'bia', email: 'bia@x.org', nome: 'Bia' });
    const admin = await token('adm', 'admin@exemplo.org', true);
    const lista = (await api('GET', '/founder/contas', admin)).data as Array<{ email: string; acessos: number }>;
    expect(lista).toEqual([expect.objectContaining({ email: 'bia@x.org', acessos: 2 })]);
    expect((await api('GET', '/founder/contas', await token('bia', 'bia@x.org'))).status).toBe(403);
  });

  it('suspender recusa a sessão da pessoa em TODA rota, na hora; restaurar devolve', async () => {
    await registrarAcesso(kv, { sub: 'bia', email: 'bia@x.org', nome: 'Bia' });
    const bia = await token('bia', 'bia@x.org');
    const admin = await token('adm', 'admin@exemplo.org', true);
    expect((await api('POST', '/salas', bia, { nome: 'Antes' })).status).toBe(201);

    expect((await api('POST', '/founder/contas/bia/suspender', admin, {})).erro?.code).toBe('SEM_MOTIVO');
    expect((await api('POST', '/founder/contas/bia/suspender', admin, { motivo: 'spam no fórum' })).status).toBe(200);

    /** O mesmo token, ainda dentro da validade — e recusado. */
    expect((await api('POST', '/salas', bia, { nome: 'Depois' })).status).toBe(401);
    expect((await api('GET', '/auth/session', bia)).status).toBe(401);

    await api('POST', '/founder/contas/bia/restaurar', admin);
    expect((await api('POST', '/salas', bia, { nome: 'De novo' })).status).toBe(201);
  });

  it('administração não se suspende, e não suspende quem está na allowlist', async () => {
    await registrarAcesso(kv, { sub: 'adm', email: 'admin@exemplo.org', nome: 'Admin' });
    await registrarAcesso(kv, { sub: 'adm2', email: 'admin@exemplo.org', nome: 'Admin 2' });
    const admin = await token('adm', 'admin@exemplo.org', true);
    expect((await api('POST', '/founder/contas/adm/suspender', admin, { motivo: 'x' })).erro?.code).toBe('A_SI_MESMA');
    expect((await api('POST', '/founder/contas/adm2/suspender', admin, { motivo: 'x' })).erro?.code).toBe('ADMIN_INTOCAVEL');
  });
});

describe('🔴 limite de taxa nas escritas', () => {
  it('a 31ª escrita no mesmo minuto é recusada com 429 — a leitura não conta', async () => {
    const eu = await token('eu', 'eu@x.org');
    for (let i = 0; i < 30; i++) {
      expect((await api('POST', '/forum/topicos', eu, { titulo: `T${i}`, corpo: 'x' })).status).toBe(201);
    }
    const r = await api('POST', '/forum/topicos', eu, { titulo: 'demais', corpo: 'x' });
    expect(r.status).toBe(429);
    expect(r.erro?.code).toBe('LIMITE_EXCEDIDO');
    expect((await api('GET', '/forum/topicos', eu)).status).toBe(200);
    /** Outra pessoa não paga pelo excesso de uma. */
    expect((await api('POST', '/forum/topicos', await token('outra', 'o@x.org'), { titulo: 'T', corpo: 'x' })).status).toBe(201);
  });
});
