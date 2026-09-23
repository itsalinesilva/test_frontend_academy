// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminLicoesScreen } from '../../src/ui/screens/admin/AdminLicoesScreen';
import { RouterProvider } from '../../src/ui/navigation/router';
import { academyService } from '../../src/services/application/academy.service';
import { editorialService } from '../../src/services/application/editorial.service';

/**
 * EE-22b — CRIAR LIÇÃO PELA TELA.
 *
 * O TODO marcava "criar lição" como ligado (EE-5), e nenhuma tela criava: o
 * serviço gravava, e nada o chamava. Aqui a pergunta é a da pessoa — ela
 * consegue criar uma lição, e o aluno a vê no módulo?
 */

let sessao: { userId: string | null; nome: string | null; ehAdmin: boolean } = {
  userId: 'u1',
  nome: 'Aline',
  ehAdmin: true,
};

vi.mock('../../src/ui/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ ...sessao, carregando: false, autenticado: sessao.userId !== null }),
}));

const montar = () =>
  render(
    <RouterProvider>
      <AdminLicoesScreen />
    </RouterProvider>
  );

beforeEach(() => {
  localStorage.clear();
  sessao = { userId: 'u1', nome: 'Aline', ehAdmin: true };
});

async function abrirNovaLicao(user: ReturnType<typeof userEvent.setup>) {
  const cursos = await screen.findAllByRole('button', { name: /módulos ·/ }, { timeout: 40000 });
  await user.click(cursos[0]);
  const [nova] = await screen.findAllByRole('button', { name: /Nova lição em/ });
  const modulo = nova.textContent!.replace(/^.*Nova lição em /, '');
  await user.click(nova);
  return modulo;
}

describe('criar lição', () => {
  it('🔴 cria, abre no editor, e o ALUNO a encontra no módulo', async () => {
    const user = userEvent.setup();
    montar();
    await abrirNovaLicao(user);

    await user.type(screen.getByLabelText('Título'), 'Intervalos compostos');
    await user.type(screen.getByLabelText('Texto de abertura (.md)'), 'Um intervalo maior que a oitava.');
    await user.click(screen.getByRole('button', { name: /Criar lição/ }));

    /** Abre direto no editor da lição nova. */
    expect(await screen.findByRole('heading', { name: 'Intervalos compostos' }, { timeout: 20000 })).toBeInTheDocument();

    /** E o caminho do aluno — não o do editor — a traz. */
    const [criada] = await editorialService.licoesCriadas();
    const doModulo = await academyService.getLessons(criada.moduleId);
    expect(doModulo.map((l) => l.id)).toContain(criada.id);
    expect(criada.criadaPor).toBe('Aline');
  });

  it('a lição criada aparece marcada na lista, e só ela oferece excluir', async () => {
    const user = userEvent.setup();
    montar();
    await abrirNovaLicao(user);
    await user.type(screen.getByLabelText('Título'), 'Lição para excluir');
    await user.type(screen.getByLabelText('Texto de abertura (.md)'), 'Texto.');
    await user.click(screen.getByRole('button', { name: /Criar lição/ }));
    await screen.findByRole('heading', { name: 'Lição para excluir' }, { timeout: 20000 });

    await user.click(screen.getByRole('button', { name: /Excluir lição criada/ }));
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    await screen.findAllByRole('button', { name: /Nova lição em/ }, { timeout: 20000 });
    expect(await editorialService.licoesCriadas()).toEqual([]);
  });

  it('título curto ou abertura vazia é recusado, e a recusa aparece', async () => {
    const user = userEvent.setup();
    montar();
    await abrirNovaLicao(user);

    await user.type(screen.getByLabelText('Título'), 'Ab');
    await user.click(screen.getByRole('button', { name: /Criar lição/ }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(await editorialService.licoesCriadas()).toEqual([]);
  });

  it('sem sessão não cria — toda lição leva autoria', async () => {
    sessao = { userId: null, nome: null, ehAdmin: false };
    const user = userEvent.setup();
    montar();
    await abrirNovaLicao(user);
    expect(screen.getByRole('button', { name: /Criar lição/ })).toBeDisabled();
  });

  it('lição PUBLICADA não oferece excluir', async () => {
    const user = userEvent.setup();
    montar();
    const cursos = await screen.findAllByRole('button', { name: /módulos ·/ }, { timeout: 40000 });
    await user.click(cursos[0]);
    const licoes = screen.getAllByRole('button').filter((b) => b.className.includes('hover:bg-anil-50'));
    await user.click(licoes[0]);
    await screen.findByRole('button', { name: /Voltar à lista/ });
    expect(screen.queryByRole('button', { name: /Excluir lição criada/ })).toBeNull();
  });
});
