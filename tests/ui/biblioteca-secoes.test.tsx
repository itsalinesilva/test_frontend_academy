// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LibraryScreen } from '../../src/ui/screens/admin/LibraryScreen';
import { RouterProvider } from '../../src/ui/navigation/router';

/**
 * EE-19 NA TELA — a pessoa consegue escrever o prefácio, e ele fica?
 *
 * Antes, a Biblioteca marcava cinco seções como "editável" e não oferecia
 * editor nenhum. O domínio com testes verdes não bastava: faltava a tela.
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
      <LibraryScreen />
    </RouterProvider>
  );

beforeEach(() => {
  localStorage.clear();
  sessao = { userId: 'u1', nome: 'Aline', ehAdmin: true };
});

describe('a Biblioteca edita as seções escritas', () => {
  it('🔴 escrever o prefácio grava, e a leitura seguinte o traz de volta', async () => {
    const user = userEvent.setup();
    const { unmount } = montar();

    await user.click(await screen.findByRole('button', { name: 'Editar Prefácio' }, { timeout: 40000 }));
    const caixa = screen.getByRole('textbox');
    await user.clear(caixa);
    await user.type(caixa, 'Um prefácio escrito à mão.');
    await user.click(screen.getByRole('button', { name: /Gravar seção/ }));

    expect(await screen.findByRole('status', {}, { timeout: 40000 })).toHaveTextContent(
      /ainda não chegaram a mais ninguém/
    );

    /** Desmonta e monta de novo: é a "leitura seguinte" em que o texto sumia. */
    unmount();
    montar();
    await user.click(await screen.findByRole('button', { name: 'Editar Prefácio' }, { timeout: 40000 }));
    expect(screen.getByRole('textbox')).toHaveValue('Um prefácio escrito à mão.');
    expect(screen.getByText(/Escrita por Aline/)).toBeInTheDocument();
  });

  it('seção gerada do curso não oferece editor', async () => {
    montar();
    await screen.findByRole('button', { name: 'Editar Prefácio' }, { timeout: 40000 });
    expect(screen.queryByRole('button', { name: 'Editar Sumário' })).toBeNull();
  });

  it('apagar tudo e gravar é recusado, e a recusa aparece na tela', async () => {
    const user = userEvent.setup();
    montar();

    await user.click(await screen.findByRole('button', { name: 'Editar Colofão' }, { timeout: 40000 }));
    await user.clear(screen.getByRole('textbox'));
    await user.click(screen.getByRole('button', { name: /Gravar seção/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/ficaria vazia/);
  });

  it('voltar ao texto de partida desfaz a edição', async () => {
    const user = userEvent.setup();
    montar();

    await user.click(await screen.findByRole('button', { name: 'Editar Prefácio' }, { timeout: 40000 }));
    const original = (screen.getByRole('textbox') as HTMLTextAreaElement).value;
    await user.type(screen.getByRole('textbox'), ' Acréscimo.');
    await user.click(screen.getByRole('button', { name: /Gravar seção/ }));
    await screen.findByRole('status', {}, { timeout: 40000 });

    await user.click(screen.getByRole('button', { name: 'Editar Prefácio' }));
    await user.click(screen.getByRole('button', { name: /Voltar ao texto de partida/ }));
    await user.click(await screen.findByRole('button', { name: 'Editar Prefácio' }, { timeout: 40000 }));

    expect(screen.getByRole('textbox')).toHaveValue(original);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('sem sessão não grava — toda edição leva autoria', async () => {
    sessao = { userId: null, nome: null, ehAdmin: false };
    const user = userEvent.setup();
    montar();

    await user.click(await screen.findByRole('button', { name: 'Editar Prefácio' }, { timeout: 40000 }));
    const editor = screen.getByRole('textbox').closest('div')!.parentElement!;
    expect(within(editor).getByRole('button', { name: /Gravar seção/ })).toBeDisabled();
  });
});
