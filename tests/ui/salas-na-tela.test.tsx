// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from '../../src/ui/navigation/router';
import { AppRouterOutlet } from '../../src/ui/screens/AppRouterOutlet';
import { GuardaDeAudiencia } from '../../src/ui/navigation/GuardaDeAudiencia';
import { apiClient } from '../../src/infrastructure/api/api-client';
import { handleApiRequest, ServerEnv } from '../../server/core/api-router';
import { issueSession } from '../../server/core/session';
import { KVEmMemoria } from '../../server/core/salas';

/**
 * AUD-9 — AS SALAS DE PONTA A PONTA: a tela de verdade, falando com o
 * servidor de verdade (KV em memória), com DUAS pessoas.
 *
 * A profa. cria a sala pela tela; a aluna, em outra sessão, a encontra no
 * diretório, entra, publica; a profa. curte; o ranking conta.
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
      ? {
          accessToken: 't',
          isAdmin: false,
          mode: 'ADULT',
          expiresAt: new Date(Date.now() + 1e8).toISOString(),
          user: { ...pessoa.atual, email: `${pessoa.atual.id}@x.org`, primaryRole: 'STUDENT', assignedRoles: ['STUDENT'] },
        }
      : null) as never;
  return real;
});

async function comoQuem(id: string | null, nome = '') {
  pessoa.atual = id ? { id, name: nome } : null;
  if (!id) return apiClient.setAuthToken(null);
  const now = Math.floor(Date.now() / 1000);
  const { token } = await issueSession(
    { googleSubject: id, email: `${id}@x.org`, name: nome, emailVerified: true, issuedAt: now, expiresAt: now + 3600 },
    { isAdmin: false },
    SECRET
  );
  apiClient.setAuthToken(token);
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  env.SALAS = new KVEmMemoria();
  /** O `fetch` do app cai no roteador do servidor — o mesmo das Pages Functions. */
  vi.stubGlobal('fetch', (url: string, init?: RequestInit) =>
    handleApiRequest(new Request(`http://localhost:3000${url}`, init), env)
  );
});

function abrir(endereco: string) {
  window.location.hash = `#${endereco}`;
  return render(
    <RouterProvider>
      <GuardaDeAudiencia>
        <AppRouterOutlet />
      </GuardaDeAudiencia>
    </RouterProvider>
  );
}

describe('🔴 a sala atravessa pessoas', () => {
  it('a profa. cria; a aluna encontra, entra e publica; a profa. curte; o ranking conta', async () => {
    const user = userEvent.setup();

    /** Profa. cria pela tela — sem papel de professor: no Skool, quem tem conta abre a sua. */
    await comoQuem('prof', 'Profa. Ana');
    abrir('/rooms/create');
    await user.type(await screen.findByLabelText(/Nome da sala/, {}, { timeout: 15000 }), 'Coro de Quinta');
    await user.click(screen.getByRole('button', { name: 'Criar sala' }));
    expect(await screen.findByRole('heading', { name: 'Coro de Quinta' }, { timeout: 15000 })).toBeInTheDocument();
    cleanup();

    /** Aluna, outra sessão: acha no diretório. */
    await comoQuem('bia', 'Bia');
    abrir('/rooms');
    const cartao = await screen.findByText('Coro de Quinta', {}, { timeout: 15000 });
    await user.click(cartao);
    await user.click(await screen.findByRole('button', { name: 'Entrar na sala' }, { timeout: 15000 }));

    /** Publica. */
    await user.type(await screen.findByLabelText('Título do post', {}, { timeout: 15000 }), 'Qual o tom da peça?');
    await user.type(screen.getByLabelText('Texto do post'), 'Ré maior ou Si menor?');
    await user.click(screen.getByRole('button', { name: 'Publicar' }));
    expect(await screen.findByRole('heading', { name: 'Qual o tom da peça?' }, { timeout: 15000 })).toBeInTheDocument();
    cleanup();

    /** Profa. curte o post da aluna. */
    await comoQuem('prof', 'Profa. Ana');
    abrir('/rooms/coro-de-quinta');
    await user.click(await screen.findByRole('button', { name: 'Curtir o post de Bia' }, { timeout: 15000 }));
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Curtir o post de Bia' })).toHaveAttribute('aria-pressed', 'true'));

    /** Ranking. */
    await user.click(screen.getByRole('tab', { name: 'Ranking' }));
    const bia = await screen.findByText(/Bia/, { selector: 'li span' }, { timeout: 15000 });
    expect(within(bia.closest('li')!).getByText('1 pts')).toBeInTheDocument();
  }, 90000);

  it('visitante lê a sala pública, e o botão de entrar leva ao login', async () => {
    await comoQuem('prof', 'Profa');
    const { salasService } = await import('../../src/services/application/salas.service');
    await salasService.criar({ nome: 'Aberta', descricao: '', privacidade: 'publica', categorias: [] });
    await salasService.publicar('aberta', { titulo: 'Bem-vindos', corpo: 'Leiam as regras.', categoria: 'Geral' });

    await comoQuem(null);
    const user = userEvent.setup();
    abrir('/rooms/aberta');
    expect(await screen.findByRole('heading', { name: 'Bem-vindos' }, { timeout: 15000 })).toBeInTheDocument();
    expect(screen.queryByLabelText('Título do post')).toBeNull();
    await user.click(screen.getAllByRole('button', { name: /Entrar/ })[0]);
    await vi.waitFor(() => expect(window.location.hash).toMatch(/#\/auth\/login\?voltar=/));
  }, 60000);

  it('sala privada: visitante e quem não entrou veem só o Sobre', async () => {
    await comoQuem('prof', 'Profa');
    const { salasService } = await import('../../src/services/application/salas.service');
    await salasService.criar({ nome: 'Fechada', descricao: 'Turma da manhã.', privacidade: 'privada', categorias: [] });
    await salasService.publicar('fechada', { titulo: 'Segredo da turma', corpo: 'x', categoria: 'Geral' });

    await comoQuem('fora', 'Fora');
    abrir('/rooms/fechada');
    expect(await screen.findByText(/Esta sala é privada/, {}, { timeout: 15000 })).toBeInTheDocument();
    expect(screen.queryByText('Segredo da turma')).toBeNull();
    expect(screen.getByRole('button', { name: 'Pedir para entrar' })).toBeInTheDocument();
  }, 60000);

  it('sem o KV ligado, as telas dizem que as salas não estão ligadas — nada de lista vazia fingindo', async () => {
    delete env.SALAS;
    await comoQuem('bia', 'Bia');
    abrir('/rooms');
    expect(await screen.findByText(/não estão ligadas/, {}, { timeout: 15000 })).toBeInTheDocument();
  }, 30000);
});
