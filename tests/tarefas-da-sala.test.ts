import { describe, it, expect, beforeEach } from 'vitest';
import { handleApiRequest, ServerEnv, resetAuditLogForTesting } from '../server/core/api-router';
import { issueSession } from '../server/core/session';
import { KVEmMemoria } from '../server/core/salas';

/**
 * P-7 — TAREFAS COM ENTREGA NAS SALAS: quem cuida propõe e avalia; cada aluno
 * entrega, refaz até a avaliação, e vê só a própria entrega.
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
    SALAS: new KVEmMemoria(),
  };
});
async function token(sub: string) {
  const now = Math.floor(Date.now() / 1000);
  const { token: t } = await issueSession(
    { googleSubject: sub, email: `${sub}@x.org`, name: sub, emailVerified: true, issuedAt: now, expiresAt: now + 3600 },
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
  const b = (await r.json()) as { data?: never; error?: { code: string } };
  return { status: r.status, data: b.data as never, erro: b.error };
}

async function turma() {
  const prof = await token('prof');
  const bia = await token('bia');
  const caio = await token('caio');
  await api('POST', '', prof, { nome: 'Harmonia' });
  await api('POST', '/harmonia/entrar', bia);
  await api('POST', '/harmonia/entrar', caio);
  return { prof, bia, caio };
}

describe('🔴 da tarefa à avaliação', () => {
  it('professora propõe; Bia entrega; a professora vê, avalia; Bia vê a nota e o comentário — e é avisada', async () => {
    const { prof, bia } = await turma();
    const t = (await api('POST', '/harmonia/tarefas', prof, { titulo: 'Coral a 4 vozes', enunciado: 'Harmonize o baixo dado.', formato: 'texto' })).data as { id: string };

    expect((await api('POST', `/harmonia/tarefas/${t.id}/entregar`, bia, { conteudo: 'Minha harmonização' })).status).toBe(201);
    const entregas = (await api('GET', `/harmonia/tarefas/${t.id}/entregas`, prof)).data as Array<{ aluno: { sub: string } }>;
    expect(entregas.map((e) => e.aluno.sub)).toEqual(['bia']);

    await api('POST', `/harmonia/tarefas/${t.id}/entregas/bia/avaliar`, prof, { nota: 8.5, comentario: 'Cuidado com as quintas no c. 3.' });
    const minha = ((await api('GET', '/harmonia/tarefas', bia)).data as Array<{ minhaEntrega: { avaliacao: { nota: number; comentario: string } } }>)[0].minhaEntrega;
    expect(minha.avaliacao).toMatchObject({ nota: 8.5, comentario: 'Cuidado com as quintas no c. 3.' });

    const avisos = (
      await handleApiRequest(new Request('http://localhost:3000/api/v1/salas-novidades', { headers: { Authorization: `Bearer ${bia}` } }), env).then((r) => r.json())
    ) as { data: Array<{ tipo: string }> };
    expect(avisos.data.map((a) => a.tipo)).toEqual(expect.arrayContaining(['SALA_TAREFA', 'SALA_AVALIACAO']));
  });

  it('🔴 aluno não vê a entrega dos colegas, não propõe e não avalia', async () => {
    const { prof, bia, caio } = await turma();
    const t = (await api('POST', '/harmonia/tarefas', prof, { titulo: 'T', enunciado: 'E' })).data as { id: string };
    await api('POST', `/harmonia/tarefas/${t.id}/entregar`, bia, { conteudo: 'da Bia' });
    expect((await api('GET', `/harmonia/tarefas/${t.id}/entregas`, caio)).status).toBe(403);
    expect(((await api('GET', '/harmonia/tarefas', caio)).data as Array<{ minhaEntrega: unknown; entregas: unknown }>)[0]).toMatchObject({ minhaEntrega: null, entregas: null });
    expect((await api('POST', '/harmonia/tarefas', caio, { titulo: 'T', enunciado: 'E' })).status).toBe(403);
    expect((await api('POST', `/harmonia/tarefas/${t.id}/entregas/bia/avaliar`, caio, { comentario: 'x' })).status).toBe(403);
  });

  it('refazer vale até a avaliação; depois, a entrega é registro', async () => {
    const { prof, bia } = await turma();
    const t = (await api('POST', '/harmonia/tarefas', prof, { titulo: 'T', enunciado: 'E' })).data as { id: string };
    await api('POST', `/harmonia/tarefas/${t.id}/entregar`, bia, { conteudo: 'v1' });
    await api('POST', `/harmonia/tarefas/${t.id}/entregar`, bia, { conteudo: 'v2' });
    await api('POST', `/harmonia/tarefas/${t.id}/entregas/bia/avaliar`, prof, { nota: null, comentario: 'Bom.' });
    expect((await api('POST', `/harmonia/tarefas/${t.id}/entregar`, bia, { conteudo: 'v3' })).erro?.code).toBe('JA_AVALIADA');
    expect(((await api('GET', `/harmonia/tarefas/${t.id}/entregas`, prof)).data as Array<{ conteudo: string }>)[0].conteudo).toBe('v2');
  });

  it('o formato é conferido: link precisa ser http(s); partitura precisa ser MusicXML; avaliação precisa de comentário', async () => {
    const { prof, bia } = await turma();
    const link = (await api('POST', '/harmonia/tarefas', prof, { titulo: 'Gravação', enunciado: 'Grave', formato: 'link' })).data as { id: string };
    expect((await api('POST', `/harmonia/tarefas/${link.id}/entregar`, bia, { conteudo: 'javascript:alert(1)' })).erro?.code).toBe('LINK_INVALIDO');
    const part = (await api('POST', '/harmonia/tarefas', prof, { titulo: 'Coral', enunciado: 'Escreva', formato: 'partitura' })).data as { id: string };
    expect((await api('POST', `/harmonia/tarefas/${part.id}/entregar`, bia, { conteudo: 'não é xml' })).erro?.code).toBe('PARTITURA_INVALIDA');
    expect((await api('POST', `/harmonia/tarefas/${part.id}/entregar`, bia, { conteudo: '<?xml version="1.0"?><score-partwise version="4.0"></score-partwise>' })).status).toBe(201);
    expect((await api('POST', `/harmonia/tarefas/${part.id}/entregas/bia/avaliar`, prof, { nota: 9 })).erro?.code).toBe('SEM_COMENTARIO');
    expect((await api('POST', `/harmonia/tarefas/${part.id}/entregas/bia/avaliar`, prof, { nota: 11, comentario: 'x' })).erro?.code).toBe('NOTA_INVALIDA');
  });

  it('entrega depois do prazo é marcada como tal', async () => {
    const { prof, bia } = await turma();
    const t = (await api('POST', '/harmonia/tarefas', prof, { titulo: 'T', enunciado: 'E', prazo: '2020-01-01T00:00:00Z' })).data as { id: string };
    expect(((await api('POST', `/harmonia/tarefas/${t.id}/entregar`, bia, { conteudo: 'tarde' })).data as { atrasada: boolean }).atrasada).toBe(true);
  });
});
