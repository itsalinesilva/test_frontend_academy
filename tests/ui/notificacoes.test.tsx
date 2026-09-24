// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from '../../src/ui/navigation/router';
import { NotificationsScreen } from '../../src/ui/screens/notifications/NotificationsScreen';
import { NotificacoesRepository, notificacoesRepository } from '../../src/repositories/notificacoes.repository';
import { montarCopia } from '../../src/domain/copia-de-seguranca';
import { apiClient } from '../../src/infrastructure/api/api-client';
import { handleApiRequest, ServerEnv } from '../../server/core/api-router';
import { issueSession } from '../../server/core/session';
import { KVEmMemoria } from '../../server/core/salas';

/**
 * AUD-10 — A PLATAFORMA PASSA A AVISAR.
 *
 * A central dizia, com honestidade, que nenhum aviso era emitido. Agora:
 * certificado e nível (pessoais, vão para o Drive com a conta) e o que
 * acontece nas salas (o servidor calcula).
 */

const SECRET = 'segredo-de-teste-com-comprimento-suficiente-32+';
const env: ServerEnv = {
  GOOGLE_OAUTH_CLIENT_ID: 'c.apps.googleusercontent.com',
  ADMIN_ALLOWLIST: 'admin@exemplo.org',
  SESSION_SIGNING_SECRET: SECRET,
  AUDIT_SIGNING_SECRET: SECRET,
  ALLOWED_ORIGIN: 'http://localhost:3000',
};

const pessoa: { atual: { id: string; name: string } | null } = { atual: null };
vi.mock('../../src/services/application/auth.service', async () => {
  const real = await vi.importActual<typeof import('../../src/services/application/auth.service')>(
    '../../src/services/application/auth.service'
  );
  real.authService.getActiveSession = (async () =>
    pessoa.atual
      ? { accessToken: 't', isAdmin: false, mode: 'ADULT', user: { ...pessoa.atual, email: 'x@x.org', primaryRole: 'STUDENT', assignedRoles: ['STUDENT'] } }
      : null) as never;
  return real;
});

async function comoQuem(id: string, nome: string) {
  pessoa.atual = { id, name: nome };
  const now = Math.floor(Date.now() / 1000);
  const { token } = await issueSession(
    { googleSubject: id, email: `${id}@x.org`, name: nome, emailVerified: true, issuedAt: now, expiresAt: now + 3600 },
    { isAdmin: false },
    SECRET
  );
  apiClient.setAuthToken(token);
  return token;
}

async function api(metodo: string, caminho: string, tk: string, corpo?: unknown) {
  const r = await handleApiRequest(
    new Request(`http://localhost:3000/api/v1${caminho}`, {
      method: metodo,
      headers: { Authorization: `Bearer ${tk}`, 'Content-Type': 'application/json' },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    }),
    env
  );
  return (await r.json()) as { data: never };
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  env.SALAS = new KVEmMemoria();
  vi.stubGlobal('fetch', (url: string, init?: RequestInit) => handleApiRequest(new Request(`http://localhost:3000${url}`, init), env));
});

describe('avisos pessoais', () => {
  it('emitir o mesmo aviso duas vezes não duplica; cada pessoa só vê os seus', () => {
    const r = new NotificacoesRepository();
    const aviso = { id: 'a1', userId: 'bia', tipo: 'CERTIFICADO' as const, titulo: 'T', texto: 'x', link: '/' };
    r.emitir(aviso);
    r.emitir(aviso);
    r.emitir({ ...aviso, id: 'a2', userId: 'caio' });
    expect(r.listar('bia')).toHaveLength(1);
    expect(r.listar('caio')).toHaveLength(1);
  });

  it('🔴 os avisos vão para o Drive com a conta — e só os da pessoa', () => {
    const r = new NotificacoesRepository();
    r.emitir({ id: 'a1', userId: 'bia', tipo: 'NIVEL', titulo: 'T', texto: 'x', link: '/' });
    r.emitir({ id: 'a2', userId: 'caio', tipo: 'NIVEL', titulo: 'T', texto: 'x', link: '/' });
    const guardado: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      guardado[k.replace(/^amd_/, '')] = localStorage.getItem(k)!;
    }
    const copia = montarCopia(guardado, 'bia');
    expect((copia.dados.notificacoes_v1 as Array<{ userId: string }>).map((a) => a.userId)).toEqual(['bia']);
  });

  it('o certificado e a subida de nível emitem aviso na origem', () => {
    const academia = readFileSync('src/services/application/academy.service.ts', 'utf8');
    const pratica = readFileSync('src/services/application/practice.service.ts', 'utf8');
    expect(academia).toMatch(/notificacoesRepository\.emitir\(\{[\s\S]*?tipo: 'CERTIFICADO'/);
    expect(pratica).toMatch(/notificacoesRepository\.emitir\(\{[\s\S]*?tipo: 'NIVEL'/);
  });
});

describe('🔴 avisos das salas', () => {
  it('post novo, comentário no meu post, curtida, encontro e aprovação — nunca o que eu mesma fiz', async () => {
    const prof = await comoQuem('prof', 'Profa');
    const bia = await comoQuem('bia', 'Bia');
    await api('POST', '/salas', prof, { nome: 'Coro', privacidade: 'privada' });
    await api('POST', '/salas/coro/entrar', bia);
    await api('POST', '/salas/coro/membros/bia/aprovar', prof);
    const meu = (await api('POST', '/salas/coro/posts', bia, { titulo: 'Meu post', corpo: 'x' })).data as { id: string };
    await api('POST', `/salas/coro/posts/${meu.id}/comentarios`, prof, { corpo: 'Muito bom.' });
    await api('POST', `/salas/coro/posts/${meu.id}/curtir`, prof);
    await api('POST', '/salas/coro/posts', prof, { titulo: 'Ensaio sábado', corpo: 'x' });
    await api('POST', '/salas/coro/encontros', prof, { titulo: 'Ensaio', inicio: '2026-12-01T19:00:00Z' });

    const novidades = (await api('GET', '/salas-novidades', bia)).data as Array<{ tipo: string; titulo: string }>;
    expect(novidades.map((n) => n.tipo).sort()).toEqual(['SALA_APROVADO', 'SALA_COMENTARIO', 'SALA_CURTIDA', 'SALA_ENCONTRO', 'SALA_POST']);
    expect(novidades.some((n) => n.titulo.includes('Meu post'))).toBe(false);
  });

  it('o marco "desde" corta o que já foi visto', async () => {
    const prof = await comoQuem('prof', 'Profa');
    const bia = await comoQuem('bia', 'Bia');
    await api('POST', '/salas', prof, { nome: 'Sala' });
    await api('POST', '/salas/sala/entrar', bia);
    await api('POST', '/salas/sala/posts', prof, { titulo: 'Antigo', corpo: 'x' });
    const agora = new Date(Date.now() + 1000).toISOString();
    const r = (await api('GET', `/salas-novidades?desde=${encodeURIComponent(agora)}`, bia)).data as unknown[];
    expect(r).toEqual([]);
  });
});

describe('a central na tela', () => {
  it('mostra o aviso, leva ao lugar, e "marcar todas como lidas" zera', async () => {
    await comoQuem('bia', 'Bia');
    notificacoesRepository.emitir({ id: 'c1', userId: 'bia', tipo: 'CERTIFICADO', titulo: 'Certificado emitido', texto: 'Você concluiu Teoria.', link: '/academia/certificate/x' });
    const user = userEvent.setup();
    render(
      <RouterProvider>
        <NotificationsScreen />
      </RouterProvider>
    );
    expect(await screen.findByText('Certificado emitido', {}, { timeout: 10000 })).toBeInTheDocument();
    expect(screen.getByText('1 não lidas')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Marcar todas como lidas' }));
    expect(await screen.findByText('Tudo lido')).toBeInTheDocument();
    await user.click(screen.getByText('Certificado emitido'));
    expect(window.location.hash).toBe('#/academia/certificate/x');
  }, 30000);

  it('sem aviso, diz o que vai aparecer — nada inventado', async () => {
    await comoQuem('caio', 'Caio');
    render(
      <RouterProvider>
        <NotificationsScreen />
      </RouterProvider>
    );
    expect(await screen.findByText('Você não tem notificações', {}, { timeout: 10000 })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Gabriel Carvalho|Contraponto Modal|BWV 1001/);
  }, 30000);
});
