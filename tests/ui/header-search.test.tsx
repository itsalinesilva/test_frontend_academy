// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { HeaderSearch } from '../../src/ui/components/layout/HeaderSearch';

const navegou: string[] = [];

vi.mock('../../src/ui/navigation/router', () => ({
  useRouter: () => ({ query: new URLSearchParams(),
    currentPath: '/',
    navigate: (p: string) => navegou.push(p),
  }),
}));

beforeEach(() => {
  navegou.length = 0;
});
afterEach(cleanup);

/**
 * A busca do header quebrou de um jeito que só aparece usando: o componente
 * nasceu num header escuro, com o texto digitado em branco. Quando o header
 * passou a ser branco, o que se digitava ficou branco sobre branco — invisível,
 * embora presente no DOM.
 *
 * Verificar o `value` do input não pegaria isso. Estes testes verificam
 * também a COR, porque foi a cor que quebrou.
 */

const fonte = () =>
  readFileSync(
    resolve(__dirname, '../../src/ui/components/layout/HeaderSearch.tsx'),
    'utf-8'
  );

describe('busca do header', () => {
  it('fechada, mostra só a lupa', () => {
    render(<HeaderSearch />);
    expect(screen.getByLabelText('Abrir busca')).toBeTruthy();
    expect(screen.queryByLabelText('Buscar')).toBeNull();
  });

  it('abre ao clicar e dá foco ao campo', async () => {
    const u = userEvent.setup();
    render(<HeaderSearch />);

    await u.click(screen.getByLabelText('Abrir busca'));

    const campo = screen.getByLabelText('Buscar na plataforma');
    expect(document.activeElement).toBe(campo);
  });

  it('o que se digita aparece no campo', async () => {
    const u = userEvent.setup();
    render(<HeaderSearch />);

    await u.click(screen.getByLabelText('Abrir busca'));
    await u.type(screen.getByLabelText('Buscar na plataforma'), 'intervalos');

    expect((screen.getByLabelText('Buscar na plataforma') as HTMLInputElement).value).toBe(
      'intervalos'
    );
  });

  it('o texto digitado não é branco sobre fundo claro', async () => {
    // O defeito exato que houve: `text-white` num header que virou branco.
    const u = userEvent.setup();
    render(<HeaderSearch />);
    await u.click(screen.getByLabelText('Abrir busca'));

    const campo = screen.getByLabelText('Buscar na plataforma');
    expect(campo.className).not.toContain('text-white');
    expect(campo.className).toMatch(/text-stone-[89]00/);
  });

  it('o campo não vive dentro de um container recortado', async () => {
    // Dar foco a um elemento dentro de um container com overflow-hidden faz o
    // navegador rolá-lo para dentro da vista. Se o container ainda está
    // estreito no instante do foco, ele ganha scrollLeft e o texto some.
    const u = userEvent.setup();
    const { container } = render(<HeaderSearch />);
    await u.click(screen.getByLabelText('Abrir busca'));

    const campo = screen.getByLabelText('Buscar na plataforma');
    for (let el = campo.parentElement; el && el !== container; el = el.parentElement) {
      expect(el.className, `${el.className} recorta o campo`).not.toContain('overflow-hidden');
    }
  });

  it('fechada, o campo nem é montado', () => {
    // Sem input montado não há elemento para o navegador rolar para dentro da
    // vista, e não há estado intermediário de 32px recebendo foco.
    render(<HeaderSearch />);
    expect(screen.queryByLabelText('Buscar na plataforma')).toBeNull();
  });

  it('o ícone não clareia até sumir no hover', () => {
    expect(fonte()).not.toContain('hover:text-white');
  });

  it('o campo aberto tem fundo e contorno visíveis', async () => {
    // Sem contorno nem fundo, a caixa de digitação some no header branco.
    const u = userEvent.setup();
    render(<HeaderSearch />);
    await u.click(screen.getByLabelText('Abrir busca'));

    const caixa = screen.getByLabelText('Buscar na plataforma').parentElement!;
    expect(caixa.className).toMatch(/bg-stone-\d{3}/);
    expect(caixa.className).toMatch(/ring-1/);
  });

  it('submeter leva à busca com o termo', async () => {
    const u = userEvent.setup();
    render(<HeaderSearch />);

    await u.click(screen.getByLabelText('Abrir busca'));
    await u.type(screen.getByLabelText('Buscar na plataforma'), 'bossa nova{Enter}');

    expect(navegou).toEqual(['/search?q=bossa%20nova']);
  });

  it('Escape fecha e limpa', async () => {
    const u = userEvent.setup();
    render(<HeaderSearch />);

    await u.click(screen.getByLabelText('Abrir busca'));
    await u.type(screen.getByLabelText('Buscar na plataforma'), 'teste');
    await u.keyboard('{Escape}');

    expect(screen.getByLabelText('Abrir busca')).toBeTruthy();
  });

  it('não navega com o campo vazio', async () => {
    const u = userEvent.setup();
    render(<HeaderSearch />);

    await u.click(screen.getByLabelText('Abrir busca'));
    await u.keyboard('{Enter}');

    expect(navegou).toEqual([]);
  });

  it('o botão de limpar aparece só quando há texto', async () => {
    const u = userEvent.setup();
    render(<HeaderSearch />);

    await u.click(screen.getByLabelText('Abrir busca'));
    expect(screen.queryByLabelText('Limpar busca')).toBeNull();

    await u.type(screen.getByLabelText('Buscar na plataforma'), 'x');
    expect(screen.getByLabelText('Limpar busca')).toBeTruthy();
  });
});
