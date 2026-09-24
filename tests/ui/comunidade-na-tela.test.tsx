// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from '../../src/ui/navigation/router';
import { AppRouterOutlet } from '../../src/ui/screens/AppRouterOutlet';
import { GuardaDeAudiencia } from '../../src/ui/navigation/GuardaDeAudiencia';
import { apiClient } from '../../src/infrastructure/api/api-client';
import { handleApiRequest, ServerEnv } from '../../server/core/api-router';
import { issueSession } from '../../server/core/session';
import { KVEmMemoria } from '../../server/core/salas';

/**
 * P-1, P-2 de ponta a ponta: a tela de verdade e o servidor de verdade, duas
 * pessoas. Ana abre um tópico e marca um evento; Bruno, em outra sessão, vê
 * os dois, responde e se inscreve.
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
}

beforeEach(() => {
  cleanup();
  localStorage.clear();
  env.COMUNIDADE = new KVEmMemoria();
  vi.stubGlobal('fetch', (url: string, init?: RequestInit) => handleApiRequest(new Request(`http://localhost:3000${url}`, init), env));
});

const abrir = (endereco: string) => {
  window.location.hash = `#${endereco}`;
  return render(
    <RouterProvider>
      <GuardaDeAudiencia>
        <AppRouterOutlet />
      </GuardaDeAudiencia>
    </RouterProvider>
  );
};

describe('🔴 a comunidade atravessa pessoas', () => {
  it('Ana abre um tópico pela tela; Bruno o encontra e responde', async () => {
    const user = userEvent.setup();
    await comoQuem('ana', 'Ana');
    abrir('/community');
    await user.click((await screen.findAllByRole('button', { name: /Escrever publicação/ }, { timeout: 15000 }))[0]);
    await user.type(screen.getByLabelText(/Título/), 'Quintas paralelas');
    await user.type(screen.getByLabelText(/Texto/), 'Na lição 3, como evitar?');
    await user.click(screen.getByRole('button', { name: 'Publicar' }));
    expect(await screen.findByText('Quintas paralelas', {}, { timeout: 15000 })).toBeInTheDocument();
    cleanup();

    await comoQuem('bruno', 'Bruno');
    abrir('/community');
    await user.click(await screen.findByText('Quintas paralelas', {}, { timeout: 15000 }));
    await user.type(await screen.findByLabelText(/Adicionar resposta/, {}, { timeout: 15000 }), 'Dobre a terça.');
    await user.click(screen.getByRole('button', { name: /Enviar resposta/ }));
    expect(await screen.findByText('Dobre a terça.', {}, { timeout: 15000 })).toBeInTheDocument();
    expect(screen.getByText('1 resposta')).toBeInTheDocument();
  }, 90000);

  it('Ana marca um evento; Bruno se inscreve, e a contagem sobe no servidor', async () => {
    const user = userEvent.setup();
    await comoQuem('ana', 'Ana');
    abrir('/community/events');
    await user.click((await screen.findAllByRole('button', { name: 'Marcar evento' }, { timeout: 15000 }))[0]);
    await user.type(screen.getByLabelText('Título'), 'Recital de alunos');
    const futuro = (h: number) => {
      const d = new Date(Date.now() + 864e5 * 7 + h * 36e5);
      return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
    };
    await user.type(screen.getByLabelText('Começa'), futuro(0));
    await user.type(screen.getByLabelText('Termina'), futuro(2));
    await user.click(screen.getAllByRole('button', { name: 'Marcar evento' }).at(-1)!);
    expect(await screen.findByText('Recital de alunos', {}, { timeout: 15000 })).toBeInTheDocument();
    cleanup();

    await comoQuem('bruno', 'Bruno');
    abrir('/community/events');
    await user.click(await screen.findByRole('button', { name: 'Quero participar' }, { timeout: 15000 }));
    expect(await screen.findByText(/1 inscrito/, {}, { timeout: 15000 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar inscrição' })).toBeInTheDocument();
  }, 90000);
});
