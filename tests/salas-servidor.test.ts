import { describe, it, expect, beforeEach } from 'vitest';
import { handleApiRequest, ServerEnv, resetAuditLogForTesting } from '../server/core/api-router';
import { issueSession } from '../server/core/session';
import { KVEmMemoria, nivelDosPontos } from '../server/core/salas';

/**
 * AUD-9 — SALAS NO MOLDE DO SKOOL, COM VÁRIAS PESSOAS DE VERDADE.
 *
 * Antes: a sala se criava e se via, mas ninguém entrava, ninguém publicava, e
 * ela vivia no navegador de quem criou — outra pessoa nunca a encontraria.
 * Agora: comunidade, sala de aula, agenda, membros, ranking e sobre, no KV do
 * servidor (ADR-003), com a autoria vinda sempre da sessão assinada.
 */

const SECRET = 'segredo-de-teste-com-comprimento-suficiente-32+';
let env: ServerEnv;

beforeEach(() => {
  resetAuditLogForTesting();
  env = {
    GOOGLE_OAUTH_CLIENT_ID: 'cliente.apps.googleusercontent.com',
    ADMIN_ALLOWLIST: 'admin@exemplo.org',
    SESSION_SIGNING_SECRET: SECRET,
    AUDIT_SIGNING_SECRET: SECRET,
    ALLOWED_ORIGIN: 'http://localhost:3000',
    SALAS: new KVEmMemoria(),
  };
});

async function token(sub: string, nome: string): Promise<string> {
  const { token: t } = await issueSession(
    {
      googleSubject: sub,
      email: `${sub}@exemplo.org`,
      name: nome,
      emailVerified: true,
      issuedAt: Math.floor(Date.now() / 1000),
      expiresAt: Math.floor(Date.now() / 1000) + 3600,
    },
    { isAdmin: false },
    SECRET
  );
  return t;
}

async function api(metodo: string, caminho: string, tk?: string, corpo?: unknown) {
  const r = await handleApiRequest(
    new Request(`http://localhost:3000/api/v1/salas${caminho}`, {
      method: metodo,
      headers: { ...(tk ? { Authorization: `Bearer ${tk}` } : {}), 'Content-Type': 'application/json' },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    }),
    env
  );
  const b = (await r.json()) as { data?: unknown; error?: { code: string; message: string } };
  return { status: r.status, data: b.data as never, erro: b.error };
}

describe('a sala nasce, e outra pessoa a encontra', () => {
  it('🔴 criada por uma conta, aparece no diretório de outra — não é mais do navegador de quem criou', async () => {
    const prof = await token('prof', 'Profa. Ana');
    const aluna = await token('aluna', 'Bia');
    const criada = await api('POST', '', prof, { nome: 'Harmonia à Noite', privacidade: 'publica', categorias: ['Dúvidas', 'Partituras'] });
    expect(criada.status).toBe(201);
    expect(criada.data).toMatchObject({ slug: 'harmonia-a-noite', dono: { sub: 'prof', nome: 'Profa. Ana' } });

    const dir = await api('GET', '', aluna);
    expect(dir.data).toEqual([expect.objectContaining({ nome: 'Harmonia à Noite', membros: 1, souMembro: false })]);
  });

  it('o dono vem da SESSÃO: o corpo não consegue criar sala em nome de outra pessoa', async () => {
    const r = await api('POST', '', await token('eu', 'Eu'), { nome: 'X', dono: { sub: 'outra', nome: 'Outra' } });
    expect(r.data).toMatchObject({ dono: { sub: 'eu' } });
  });

  it('sem conta, lê o diretório mas não cria', async () => {
    expect((await api('GET', '')).status).toBe(200);
    expect((await api('POST', '', undefined, { nome: 'X' })).status).toBe(401);
  });

  it('sem o KV ligado, a API diz que as salas não estão ligadas — e não finge', async () => {
    delete env.SALAS;
    const r = await api('GET', '');
    expect(r.status).toBe(503);
    expect(r.erro?.code).toBe('SALAS_NAO_CONFIGURADAS');
  });
});

describe('entrar', () => {
  it('sala pública: entra na hora; sala privada: fica pedindo até quem cuida aprovar', async () => {
    const prof = await token('prof', 'Profa');
    const bia = await token('bia', 'Bia');
    await api('POST', '', prof, { nome: 'Aberta' });
    await api('POST', '', prof, { nome: 'Fechada', privacidade: 'privada' });

    expect((await api('POST', '/aberta/entrar', bia)).data).toMatchObject({ status: 'ativo', papel: 'membro' });
    expect((await api('POST', '/fechada/entrar', bia)).data).toMatchObject({ status: 'pendente' });

    /** Pendente não lê a comunidade da sala privada. */
    expect((await api('GET', '/fechada/posts', bia)).status).toBe(403);
    /** Quem cuida vê o pedido; aprova. */
    const membros = await api('GET', '/fechada/membros', prof);
    expect((membros.data as Array<{ sub: string; status: string }>).find((m) => m.sub === 'bia')?.status).toBe('pendente');
    await api('POST', '/fechada/membros/bia/aprovar', prof);
    expect((await api('GET', '/fechada/posts', bia)).status).toBe(200);
  });

  it('🔴 membro comum não aprova, não remove e não nomeia moderador', async () => {
    const prof = await token('prof', 'Profa');
    const bia = await token('bia', 'Bia');
    const caio = await token('caio', 'Caio');
    await api('POST', '', prof, { nome: 'Sala', privacidade: 'privada' });
    await api('POST', '/sala/entrar', bia);
    await api('POST', '/sala/membros/bia/aprovar', prof);
    await api('POST', '/sala/entrar', caio);
    expect((await api('POST', '/sala/membros/caio/aprovar', bia)).status).toBe(403);
    expect((await api('POST', '/sala/membros/prof/remover', bia)).status).toBe(403);
    /** Moderador aprova, mas não nomeia moderador — isso é do dono. */
    await api('POST', '/sala/membros/bia/moderador', prof);
    expect((await api('POST', '/sala/membros/caio/aprovar', bia)).status).toBe(200);
    expect((await api('POST', '/sala/membros/caio/moderador', bia)).status).toBe(403);
    /** Ninguém remove quem criou a sala. */
    expect((await api('POST', '/sala/membros/prof/remover', bia)).status).toBe(409);
  });
});

describe('a comunidade', () => {
  async function salaCom3() {
    const prof = await token('prof', 'Profa');
    const bia = await token('bia', 'Bia');
    const caio = await token('caio', 'Caio');
    await api('POST', '', prof, { nome: 'Coro', categorias: ['Avisos', 'Dúvidas'] });
    await api('POST', '/coro/entrar', bia);
    await api('POST', '/coro/entrar', caio);
    return { prof, bia, caio };
  }

  it('publicar, comentar, curtir — cada coisa com o autor da sessão', async () => {
    const { bia, caio } = await salaCom3();
    const post = (await api('POST', '/coro/posts', bia, { titulo: 'Afinação do Lá', corpo: 'Como vocês afinam?', categoria: 'Dúvidas' })).data as { id: string };
    await api('POST', `/coro/posts/${post.id}/comentarios`, caio, { corpo: 'Com diapasão.' });
    await api('POST', `/coro/posts/${post.id}/curtir`, caio);

    const lidos = (await api('GET', '/coro/posts', caio)).data as Array<Record<string, unknown>>;
    expect(lidos[0]).toMatchObject({ titulo: 'Afinação do Lá', autor: { sub: 'bia' }, categoria: 'Dúvidas', curtidas: 1, curtiEu: true, comentarios: 1 });
    const coms = (await api('GET', `/coro/posts/${post.id}/comentarios`, bia)).data as Array<{ autor: { sub: string } }>;
    expect(coms[0].autor.sub).toBe('caio');
  });

  it('quem não está na sala lê a comunidade pública, mas não publica nem curte', async () => {
    const { bia } = await salaCom3();
    const fora = await token('fora', 'Fora');
    const post = (await api('POST', '/coro/posts', bia, { titulo: 'T', corpo: 'C' })).data as { id: string };
    expect((await api('GET', '/coro/posts', fora)).status).toBe(200);
    expect((await api('POST', '/coro/posts', fora, { titulo: 'T', corpo: 'C' })).status).toBe(403);
    expect((await api('POST', `/coro/posts/${post.id}/curtir`, fora)).status).toBe(403);
  });

  it('curtir de novo descurte; curtir o próprio post não vale', async () => {
    const { bia, caio } = await salaCom3();
    const post = (await api('POST', '/coro/posts', bia, { titulo: 'T', corpo: 'C' })).data as { id: string };
    expect((await api('POST', `/coro/posts/${post.id}/curtir`, caio)).data).toEqual({ curti: true });
    expect((await api('POST', `/coro/posts/${post.id}/curtir`, caio)).data).toEqual({ curti: false });
    expect((await api('POST', `/coro/posts/${post.id}/curtir`, bia)).status).toBe(409);
  });

  it('fixado vem primeiro; só quem cuida fixa; só o autor ou quem cuida apaga', async () => {
    const { prof, bia, caio } = await salaCom3();
    const velho = (await api('POST', '/coro/posts', bia, { titulo: 'Regras', corpo: 'Leiam.' })).data as { id: string };
    await api('POST', '/coro/posts', caio, { titulo: 'Novo', corpo: 'Oi.' });
    expect((await api('POST', `/coro/posts/${velho.id}/fixar`, caio)).status).toBe(403);
    await api('POST', `/coro/posts/${velho.id}/fixar`, prof);
    const lista = (await api('GET', '/coro/posts', caio)).data as Array<{ titulo: string }>;
    expect(lista.map((p) => p.titulo)).toEqual(['Regras', 'Novo']);

    const r = await handleApiRequest(
      new Request(`http://localhost:3000/api/v1/salas/coro/posts/${velho.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${caio}` } }),
      env
    );
    expect(r.status).toBe(403);
  });

  it('post sem título ou sem texto volta com o motivo', async () => {
    const { bia } = await salaCom3();
    const r = await api('POST', '/coro/posts', bia, { titulo: '', corpo: 'x' });
    expect(r.status).toBe(400);
    expect(r.erro?.message).toMatch(/título/);
  });
});

describe('agenda, ranking e sala de aula', () => {
  it('só quem cuida marca encontro; link que não é http(s) é descartado', async () => {
    const prof = await token('prof', 'Profa');
    const bia = await token('bia', 'Bia');
    await api('POST', '', prof, { nome: 'Sala' });
    await api('POST', '/sala/entrar', bia);
    expect((await api('POST', '/sala/encontros', bia, { titulo: 'X', inicio: '2026-10-01T19:00:00Z' })).status).toBe(403);
    const e = await api('POST', '/sala/encontros', prof, { titulo: 'Ensaio', inicio: '2026-10-01T19:00:00Z', link: 'javascript:alert(1)' });
    expect(e.data).toMatchObject({ titulo: 'Ensaio', duracaoMin: 60 });
    expect((e.data as { link?: string }).link).toBeUndefined();
    expect(((await api('GET', '/sala/encontros', bia)).data as unknown[]).length).toBe(1);
  });

  it('🔴 ranking: pontos são curtidas recebidas, com os níveis do Skool', async () => {
    const prof = await token('prof', 'Profa');
    const bia = await token('bia', 'Bia');
    const caio = await token('caio', 'Caio');
    await api('POST', '', prof, { nome: 'Sala' });
    await api('POST', '/sala/entrar', bia);
    await api('POST', '/sala/entrar', caio);
    const p = (await api('POST', '/sala/posts', bia, { titulo: 'T', corpo: 'C' })).data as { id: string };
    await api('POST', `/sala/posts/${p.id}/curtir`, caio);
    await api('POST', `/sala/posts/${p.id}/curtir`, prof);
    const r = (await api('GET', '/sala/ranking', caio)).data as Array<{ sub: string; pontos: number; nivel: number }>;
    expect(r[0]).toMatchObject({ sub: 'bia', pontos: 2, nivel: 1 });
    expect([0, 4, 5, 19, 20, 33015].map(nivelDosPontos)).toEqual([1, 1, 2, 2, 3, 9]);
  });

  it('o dono escolhe os cursos da sala de aula; outra pessoa não', async () => {
    const prof = await token('prof', 'Profa');
    const bia = await token('bia', 'Bia');
    await api('POST', '', prof, { nome: 'Sala' });
    expect((await api('PATCH', '/sala', bia, { cursos: ['x'] })).status).toBe(403);
    await api('PATCH', '/sala', prof, { cursos: ['crs_fomt_01'] });
    expect(((await api('GET', '/sala', bia)).data as { sala: { cursos: string[] } }).sala.cursos).toEqual(['crs_fomt_01']);
  });
});
