import { describe, it, expect, beforeEach } from 'vitest';
import { handleApiRequest, ServerEnv, resetAuditLogForTesting } from '../server/core/api-router';
import { issueSession } from '../server/core/session';
import { KVEmMemoria } from '../server/core/salas';

/**
 * P-3 — PESSOAS SE ENCONTRAM.
 *
 * O diretório e o perfil de outra pessoa liam o navegador: só apareciam as
 * contas que já tinham entrado naquele computador. Agora cada pessoa publica
 * o próprio cartão (a projeção pública) e todo mundo o encontra.
 */
const SECRET = 'segredo-de-teste-com-comprimento-suficiente-32+';
let env: ServerEnv;
beforeEach(() => {
  resetAuditLogForTesting();
  env = {
    GOOGLE_OAUTH_CLIENT_ID: 'c.apps.googleusercontent.com',
    ADMIN_ALLOWLIST: 'admin@exemplo.org',
    SESSION_SIGNING_SECRET: SECRET,
    AUDIT_SIGNING_SECRET: SECRET,
    ALLOWED_ORIGIN: 'http://localhost:3000',
    COMUNIDADE: new KVEmMemoria(),
  };
});

async function token(sub: string, nome: string) {
  const now = Math.floor(Date.now() / 1000);
  const { token: t } = await issueSession(
    { googleSubject: sub, email: `${sub}@exemplo.org`, name: nome, emailVerified: true, issuedAt: now, expiresAt: now + 3600 },
    { isAdmin: false },
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

const projecao = (nome: string, extra: Record<string, unknown> = {}) => ({
  userId: `usr_${nome.toLowerCase()}`,
  displayName: nome,
  title: 'Violinista',
  headline: 'Estudo Bach',
  instruments: ['Violino'],
  location: 'Belo Horizonte',
  ...extra,
});

describe('🔴 o cartão público atravessa pessoas', () => {
  it('Ana publica; Bruno a encontra na busca e abre o perfil dela', async () => {
    const ana = await token('ana', 'Ana');
    await api('POST', '/pessoas/eu', ana, { userId: 'usr_ana', projecao: projecao('Ana') });
    const bruno = await token('bruno', 'Bruno');

    const achados = (await api('GET', '/pessoas?q=violin', bruno)).data as Array<{ userId: string; nome: string; cidade: string }>;
    expect(achados).toEqual([expect.objectContaining({ userId: 'usr_ana', nome: 'Ana', cidade: 'Belo Horizonte' })]);
    expect((await api('GET', '/pessoas?q=belo', bruno)).data).toHaveLength(1);
    expect((await api('GET', '/pessoas?q=piano', bruno)).data).toEqual([]);

    const perfil = (await api('GET', '/pessoas/usr_ana', bruno)).data as { projecao: { displayName: string }; souEu: boolean };
    expect(perfil).toMatchObject({ projecao: { displayName: 'Ana' }, souEu: false });
  });

  it('perfil que vira privado sai do diretório', async () => {
    const ana = await token('ana', 'Ana');
    await api('POST', '/pessoas/eu', ana, { userId: 'usr_ana', projecao: projecao('Ana') });
    await api('POST', '/pessoas/eu', ana, { userId: 'usr_ana', projecao: null });
    expect((await api('GET', '/pessoas')).data).toEqual([]);
    expect((await api('GET', '/pessoas/usr_ana')).status).toBe(404);
  });

  it('🔴 ninguém publica cartão no userId de outra pessoa', async () => {
    await api('POST', '/pessoas/eu', await token('ana', 'Ana'), { userId: 'usr_ana', projecao: projecao('Ana') });
    const r = await api('POST', '/pessoas/eu', await token('intruso', 'X'), { userId: 'usr_ana', projecao: projecao('Falsa') });
    expect(r.status).toBe(409);
    expect(((await api('GET', '/pessoas/usr_ana')).data as { projecao: { displayName: string } }).projecao.displayName).toBe('Ana');
  });

  it('e-mail ou telefone que escapem na projeção não chegam ao diretório', async () => {
    await api('POST', '/pessoas/eu', await token('ana', 'Ana'), {
      userId: 'usr_ana',
      projecao: projecao('Ana', { email: 'ana@x.org', contato: { telefone: '999' } }),
    });
    const texto = JSON.stringify((await api('GET', '/pessoas/usr_ana')).data);
    expect(texto).not.toMatch(/ana@x\.org|999/);
  });

  it('seguir: o outro lado conta; não se segue a si mesma; sem conta, não segue', async () => {
    const ana = await token('ana', 'Ana');
    const bruno = await token('bruno', 'Bruno');
    await api('POST', '/pessoas/eu', ana, { userId: 'usr_ana', projecao: projecao('Ana') });
    expect((await api('POST', '/pessoas/usr_ana/seguir', bruno)).data).toEqual({ sigo: true, seguidores: 1 });
    expect(((await api('GET', '/pessoas/usr_ana', bruno)).data as { sigo: boolean }).sigo).toBe(true);
    expect((await api('POST', '/pessoas/usr_ana/seguir', ana)).status).toBe(409);
    expect((await api('POST', '/pessoas/usr_ana/seguir')).status).toBe(401);
    expect((await api('POST', '/pessoas/usr_ana/deixar', bruno)).data).toEqual({ sigo: false, seguidores: 0 });
  });
});
