import { describe, it, expect, beforeEach } from 'vitest';
import { handleApiRequest, ServerEnv, resetAuditLogForTesting } from '../server/core/api-router';
import { issueSession } from '../server/core/session';
import { KVEmMemoria } from '../server/core/salas';

/**
 * P-1, P-2 — FÓRUM E EVENTOS DE VÁRIAS PESSOAS.
 *
 * O fórum gravava no navegador de quem escrevia: o tópico nunca chegava a
 * outra pessoa. Evento não tinha como ser criado. Agora: servidor, autoria da
 * sessão, contagem contada — e os percursos que viviam em `platform-flows`
 * (contagem de respostas, inscrição sem duplicar, cancelamento isolado).
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

async function token(sub: string, nome: string, email = `${sub}@exemplo.org`, isAdmin = false) {
  const now = Math.floor(Date.now() / 1000);
  const { token: t } = await issueSession(
    { googleSubject: sub, email, name: nome, emailVerified: true, issuedAt: now, expiresAt: now + 3600 },
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
  const b = (await r.json()) as { data?: never; error?: { code: string; message: string } };
  return { status: r.status, data: b.data as never, erro: b.error };
}

describe('🔴 o fórum é de todo mundo', () => {
  it('Ana abre um tópico; Bruno — outra sessão — o encontra, responde, e a contagem é contada', async () => {
    const ana = await token('ana', 'Ana');
    const bruno = await token('bruno', 'Bruno');
    const t = (await api('POST', '/forum/topicos', ana, { titulo: 'Quintas paralelas na IV–V', corpo: 'No exercício da lição 3…', categoria: 'HARMONY' })).data as { id: string };

    const lista = (await api('GET', '/forum/topicos', bruno)).data as Array<{ id: string; respostas: number; autor: { sub: string } }>;
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({ respostas: 0, autor: { sub: 'ana' } });

    await api('POST', `/forum/topicos/${t.id}/respostas`, bruno, { corpo: 'Dobre a terça na dominante.' });
    await api('POST', `/forum/topicos/${t.id}/respostas`, ana, { corpo: 'Obrigada!' });
    expect(((await api('GET', '/forum/topicos')).data as Array<{ respostas: number }>)[0].respostas).toBe(2);

    const aberto = (await api('GET', `/forum/topicos/${t.id}`)).data as { mensagens: Array<{ autor: { sub: string } }> };
    expect(aberto.mensagens.map((m) => m.autor.sub)).toEqual(['ana', 'bruno', 'ana']); // a abertura vem primeiro
  });

  it('a autoria vem da sessão; sem conta, lê mas não escreve', async () => {
    const r = await api('POST', '/forum/topicos', await token('eu', 'Eu'), { titulo: 'T', corpo: 'C', autor: { sub: 'outra' } });
    expect(r.data).toMatchObject({ autor: { sub: 'eu' } });
    expect((await api('GET', '/forum/topicos')).status).toBe(200);
    expect((await api('POST', '/forum/topicos', undefined, { titulo: 'T', corpo: 'C' })).status).toBe(401);
  });

  it('filtra por categoria; categoria desconhecida vira Conversa', async () => {
    const eu = await token('eu', 'Eu');
    await api('POST', '/forum/topicos', eu, { titulo: 'A', corpo: 'x', categoria: 'HARMONY' });
    await api('POST', '/forum/topicos', eu, { titulo: 'B', corpo: 'x', categoria: 'INVENTADA' });
    expect(((await api('GET', '/forum/topicos?categoria=HARMONY')).data as unknown[]).length).toBe(1);
    expect(((await api('GET', '/forum/topicos?categoria=LOUNGE')).data as unknown[]).length).toBe(1);
  });
});

describe('🔴 moderação do fórum — só quem o servidor reconhece como admin', () => {
  it('aluna não modera; admin oculta, e o tópico some para os outros — mas o autor ainda o vê', async () => {
    const ana = await token('ana', 'Ana');
    const bruno = await token('bruno', 'Bruno');
    const admin = await token('adm', 'Admin', 'admin@exemplo.org', true);
    const t = (await api('POST', '/forum/topicos', ana, { titulo: 'Spam', corpo: 'x' })).data as { id: string };

    expect((await api('POST', `/founder/forum/topicos/${t.id}/ocultar`, bruno)).status).toBe(403);
    expect((await api('POST', `/founder/forum/topicos/${t.id}/ocultar`, admin)).status).toBe(200);

    expect((await api('GET', '/forum/topicos', bruno)).data).toEqual([]);
    expect(((await api('GET', '/forum/topicos', ana)).data as unknown[]).length).toBe(1);
    expect((await api('GET', `/forum/topicos/${t.id}`, bruno)).status).toBe(404);
  });

  it('tópico fechado não aceita resposta', async () => {
    const ana = await token('ana', 'Ana');
    const admin = await token('adm', 'Admin', 'admin@exemplo.org', true);
    const t = (await api('POST', '/forum/topicos', ana, { titulo: 'T', corpo: 'x' })).data as { id: string };
    await api('POST', `/founder/forum/topicos/${t.id}/trancar`, admin);
    expect((await api('POST', `/forum/topicos/${t.id}/respostas`, ana, { corpo: 'y' })).status).toBe(409);
  });

  it('resposta oculta sai da conversa e da contagem', async () => {
    const ana = await token('ana', 'Ana');
    const bruno = await token('bruno', 'Bruno');
    const admin = await token('adm', 'Admin', 'admin@exemplo.org', true);
    const t = (await api('POST', '/forum/topicos', ana, { titulo: 'T', corpo: 'x' })).data as { id: string };
    const r = (await api('POST', `/forum/topicos/${t.id}/respostas`, bruno, { corpo: 'ofensa' })).data as { id: string };
    await api('POST', `/founder/forum/topicos/${t.id}/${r.id}/ocultar`, admin);
    expect(((await api('GET', '/forum/topicos', ana)).data as Array<{ respostas: number }>)[0].respostas).toBe(0);
    expect(((await api('GET', `/forum/topicos/${t.id}`, ana)).data as { mensagens: unknown[] }).mensagens).toHaveLength(1);
  });
});

describe('🔴 eventos de todo mundo', () => {
  async function marcado(vagas?: number) {
    const ana = await token('ana', 'Ana');
    const e = (await api('POST', '/eventos', ana, { titulo: 'Masterclass de leitura', inicio: '2026-11-10T22:00:00Z', fim: '2026-11-10T23:30:00Z', vagas })).data as { id: string };
    return { ana, id: e.id };
  }

  it('evento marcado por uma pessoa aparece para outra', async () => {
    await marcado();
    const lista = (await api('GET', '/eventos', await token('bruno', 'Bruno'))).data as Array<{ titulo: string; meu: boolean }>;
    expect(lista).toEqual([expect.objectContaining({ titulo: 'Masterclass de leitura', meu: false })]);
  });

  it('inscrever duas vezes (clique duplo) não duplica nem desfaz', async () => {
    const { id } = await marcado();
    const bruno = await token('bruno', 'Bruno');
    await api('POST', `/eventos/${id}/inscrever`, bruno);
    await api('POST', `/eventos/${id}/inscrever`, bruno);
    expect(((await api('GET', '/eventos', bruno)).data as Array<{ inscritos: number; inscrito: boolean }>)[0]).toMatchObject({ inscritos: 1, inscrito: true });
  });

  it('a desinscrição de Ana não tira a de Bruno', async () => {
    const { ana, id } = await marcado();
    const bruno = await token('bruno', 'Bruno');
    await api('POST', `/eventos/${id}/inscrever`, ana);
    await api('POST', `/eventos/${id}/inscrever`, bruno);
    await api('POST', `/eventos/${id}/desinscrever`, ana);
    const visto = (await api('GET', '/eventos', bruno)).data as Array<{ inscritos: number; inscrito: boolean }>;
    expect(visto[0]).toMatchObject({ inscritos: 1, inscrito: true });
  });

  it('lotado recusa; cancelado recusa; só o anfitrião (ou admin) cancela', async () => {
    const { ana, id } = await marcado(1);
    const bruno = await token('bruno', 'Bruno');
    const caio = await token('caio', 'Caio');
    await api('POST', `/eventos/${id}/inscrever`, bruno);
    expect((await api('POST', `/eventos/${id}/inscrever`, caio)).status).toBe(409);
    expect((await api('POST', `/eventos/${id}/cancelar`, bruno)).status).toBe(403);
    expect((await api('POST', `/eventos/${id}/cancelar`, ana)).status).toBe(200);
    expect((await api('POST', `/eventos/${id}/inscrever`, caio)).erro?.code).toBe('EVENTO_CANCELADO');
  });

  it('fim antes do início é recusado; link não http é descartado', async () => {
    const ana = await token('ana', 'Ana');
    expect((await api('POST', '/eventos', ana, { titulo: 'X', inicio: '2026-11-10T22:00:00Z', fim: '2026-11-10T21:00:00Z' })).status).toBe(400);
    const e = await api('POST', '/eventos', ana, { titulo: 'X', inicio: '2026-11-10T22:00:00Z', fim: '2026-11-10T23:00:00Z', link: 'javascript:alert(1)' });
    expect((e.data as { link?: string }).link).toBeUndefined();
  });

  it('sem o KV ligado, a comunidade diz que não está ligada', async () => {
    delete env.COMUNIDADE;
    expect((await api('GET', '/forum/topicos')).erro?.code).toBe('COMUNIDADE_NAO_CONFIGURADA');
  });
});
