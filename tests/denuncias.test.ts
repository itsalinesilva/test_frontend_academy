import { describe, it, expect, beforeEach } from 'vitest';
import { handleApiRequest, ServerEnv, resetAuditLogForTesting } from '../server/core/api-router';
import { issueSession } from '../server/core/session';
import { KVEmMemoria } from '../server/core/salas';

/**
 * P-4 · AUD-14 — DENUNCIAR E MODERAR.
 *
 * Antes não havia como denunciar, e a tela de moderação dizia isso. Agora:
 * denúncia com motivo, uma por pessoa e por alvo, fila agrupada para a
 * administração, e decisão que vale para todas as denúncias do mesmo alvo.
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
    SALAS: new KVEmMemoria(),
  };
});
async function token(sub: string, isAdmin = false) {
  const now = Math.floor(Date.now() / 1000);
  const { token: t } = await issueSession(
    { googleSubject: sub, email: isAdmin ? 'admin@exemplo.org' : `${sub}@x.org`, name: sub, emailVerified: true, issuedAt: now, expiresAt: now + 3600 },
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

describe('🔴 da denúncia à decisão', () => {
  it('três pessoas denunciam o mesmo tópico: a fila mostra UM item com 3; ocultar tira o tópico e fecha as três', async () => {
    const autora = await token('autora');
    const t = (await api('POST', '/forum/topicos', autora, { titulo: 'Compre já', corpo: 'link' })).data as { id: string };
    for (const q of ['a', 'b', 'c']) {
      const r = await api('POST', '/denuncias', await token(q), { alvo: { tipo: 'forum-topico', id: t.id, resumo: 'Compre já' }, motivo: 'Spam ou propaganda' });
      expect(r.status).toBe(201);
    }
    const admin = await token('adm', true);
    const fila = (await api('GET', '/founder/denuncias', admin)).data as Array<{ id: string; vezes: number }>;
    expect(fila).toHaveLength(1);
    expect(fila[0].vezes).toBe(3);

    await api('POST', `/founder/denuncias/${fila[0].id}/ocultar`, admin);
    expect((await api('GET', '/founder/denuncias', admin)).data).toEqual([]);
    expect(((await api('GET', '/founder/denuncias?status=ocultada', admin)).data as unknown[]).length).toBe(1);
    expect((await api('GET', '/forum/topicos', await token('leitor'))).data).toEqual([]);
    const trilha = (await api('GET', '/admin/audit-logs?limit=50', admin)).data as { logs: Array<{ action: string }> };
    expect(trilha.logs.some((e) => e.action === 'moderation.report.ocultar')).toBe(true);
  });

  it('denunciar de novo não soma; sem motivo da lista, recusa; sem conta, recusa', async () => {
    const eu = await token('eu');
    const alvo = { tipo: 'forum-topico', id: 'x', resumo: 'x' };
    await api('POST', '/denuncias', eu, { alvo, motivo: 'Outro' });
    expect((await api('POST', '/denuncias', eu, { alvo, motivo: 'Outro' })).status).toBe(200);
    expect(((await api('GET', '/founder/denuncias', await token('adm', true))).data as Array<{ vezes: number }>)[0].vezes).toBe(1);
    expect((await api('POST', '/denuncias', eu, { alvo, motivo: 'porque sim' })).erro?.code).toBe('MOTIVO_INVALIDO');
    expect((await api('POST', '/denuncias', undefined, { alvo, motivo: 'Outro' })).status).toBe(401);
  });

  it('a fila é só da administração', async () => {
    expect((await api('GET', '/founder/denuncias', await token('bia'))).status).toBe(403);
  });

  it('post de sala denunciado e ocultado some para os membros, e a autora ainda o vê', async () => {
    const dona = await token('dona');
    const bia = await token('bia');
    const caio = await token('caio');
    const sala = (m: string, c: string, tk: string, corpo?: unknown) => api(m, `/salas${c}`, tk, corpo);
    await sala('POST', '', dona, { nome: 'Coro' });
    await sala('POST', '/coro/entrar', bia);
    await sala('POST', '/coro/entrar', caio);
    const p = (await sala('POST', '/coro/posts', bia, { titulo: 'Ofensivo', corpo: 'x' })).data as { id: string };
    const sobre = (await sala('GET', '/coro', caio)).data as { sala: { id: string } };
    await api('POST', '/denuncias', caio, { alvo: { tipo: 'sala-post', id: p.id, salaId: sobre.sala.id, resumo: 'Ofensivo' }, motivo: 'Ofensa ou assédio' });
    const admin = await token('adm', true);
    const [item] = (await api('GET', '/founder/denuncias', admin)).data as Array<{ id: string }>;
    await api('POST', `/founder/denuncias/${item.id}/ocultar`, admin);
    expect((await sala('GET', '/coro/posts', caio)).data).toEqual([]);
    expect(((await sala('GET', '/coro/posts', bia)).data as unknown[]).length).toBe(1);
  });

  it('descartar fecha sem mexer no conteúdo', async () => {
    const t = (await api('POST', '/forum/topicos', await token('autora'), { titulo: 'Legítimo', corpo: 'x' })).data as { id: string };
    await api('POST', '/denuncias', await token('a'), { alvo: { tipo: 'forum-topico', id: t.id, resumo: 'Legítimo' }, motivo: 'Outro' });
    const admin = await token('adm', true);
    const [item] = (await api('GET', '/founder/denuncias', admin)).data as Array<{ id: string }>;
    await api('POST', `/founder/denuncias/${item.id}/descartar`, admin);
    expect(((await api('GET', '/forum/topicos')).data as unknown[]).length).toBe(1);
  });
});
