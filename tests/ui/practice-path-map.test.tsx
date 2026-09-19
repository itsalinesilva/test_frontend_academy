// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PracticePathMap } from '../../src/ui/components/practice/PracticePathMap';
import { Dimension, DIMENSIONS } from '../../src/domain/music-grammar';
import { currentDimension, lockReason } from '../../src/domain/practice-path';

/**
 * O caminho, na tela.
 *
 * Responde a uma pergunta só: por onde eu continuo? O que estes casos
 * protegem é isso — um destaque, cadeado com motivo, e nó fechado que não
 * abre lição.
 */

const montar = (completed: Dimension[] = []) => {
  const onOpenNode = vi.fn();
  render(<PracticePathMap completed={completed} onOpenNode={onOpenNode} />);
  return { onOpenNode };
};

const nameOf = (d: Dimension) => DIMENSIONS[d].nome;

describe('a estrutura fica visível', () => {
  it('as unidades aparecem com número e título', () => {
    montar();
    expect(screen.getByText('Unidade 1')).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(1);
  });

  it('cada unidade diz quantos nós já foram feitos', () => {
    montar([Dimension.NOTE]);
    expect(screen.getByText(/1 de \d+/)).toBeInTheDocument();
  });

  it('o nó mostra a pergunta que ensina a responder', () => {
    montar();
    expect(screen.getByText(DIMENSIONS[Dimension.NOTE].pergunta)).toBeInTheDocument();
  });
});

describe('um só nó em destaque', () => {
  it('exatamente um nó diz "começar"', () => {
    // Vários destaques é a mesma coisa que nenhum.
    montar();
    expect(screen.getAllByText('Começar')).toHaveLength(1);
  });

  it('o destaque é o nó atual do domínio', () => {
    const completed = [Dimension.NOTE, Dimension.NOTE_VALUE];
    montar(completed);

    const atual = currentDimension(completed)!;
    const botao = screen.getByRole('button', { name: nameOf(atual) });
    expect(botao).toHaveTextContent('Começar');
  });

  it('abrir o nó atual leva à lição', async () => {
    const user = userEvent.setup();
    const { onOpenNode } = montar();

    const atual = currentDimension([])!;
    await user.click(screen.getByRole('button', { name: nameOf(atual) }));
    expect(onOpenNode).toHaveBeenCalledWith(atual);
  });
});

describe('o cadeado diz o motivo', () => {
  it('o nó travado leva o motivo no nome acessível', () => {
    /**
     * Quem usa leitor de tela ouve o motivo junto com o nome, sem precisar
     * ativar nada. Esconder a razão atrás de um clique deixaria de fora
     * justamente quem não vê o cadeado.
     */
    montar();
    const reason = lockReason(Dimension.CLEF, [])!;
    expect(
      screen.getByRole('button', { name: new RegExp(`${nameOf(Dimension.CLEF)}.*${reason}`) })
    ).toBeInTheDocument();
  });

  it('tocar no travado mostra o motivo escrito, e não abre lição', async () => {
    const user = userEvent.setup();
    const { onOpenNode } = montar();

    const locked = screen.getByRole('button', {
      name: new RegExp(`^${nameOf(Dimension.CLEF)} — bloqueado`),
    });
    await user.click(locked);

    expect(onOpenNode).not.toHaveBeenCalled();
    expect(screen.getByText(lockReason(Dimension.CLEF, [])!)).toBeInTheDocument();
  });

  it('tocar de novo esconde o motivo', async () => {
    const user = userEvent.setup();
    montar();
    const locked = screen.getByRole('button', {
      name: new RegExp(`^${nameOf(Dimension.CLEF)} — bloqueado`),
    });

    await user.click(locked);
    await user.click(locked);
    expect(screen.queryByText(lockReason(Dimension.CLEF, [])!)).not.toBeInTheDocument();
  });

  it('o nó travado continua alcançável pelo teclado', async () => {
    /**
     * `disabled` tiraria o botão do foco, e quem navega por teclado nunca
     * chegaria ao motivo. O estado vai em `aria-disabled`, que anuncia sem
     * remover.
     */
    montar();
    const locked = screen.getByRole('button', {
      name: new RegExp(`^${nameOf(Dimension.CLEF)} — bloqueado`),
    });

    expect(locked).toHaveAttribute('aria-disabled', 'true');
    expect(locked).not.toBeDisabled();

    locked.focus();
    expect(locked).toHaveFocus();
  });
});

describe('concluir muda o mapa', () => {
  it('o nó feito some da contagem de pendentes e vira concluído', () => {
    const { rerender } = render(
      <PracticePathMap completed={[]} onOpenNode={vi.fn()} />
    );
    const antes = currentDimension([])!;

    rerender(<PracticePathMap completed={[antes]} onOpenNode={vi.fn()} />);
    expect(screen.getByRole('button', { name: nameOf(antes) })).not.toHaveTextContent(
      'Começar'
    );
  });

  it('concluir o pré-requisito destrava quem dependia dele', () => {
    montar([Dimension.NOTE]);
    const clave = screen.getByRole('button', { name: nameOf(Dimension.CLEF) });
    expect(clave).toHaveAttribute('aria-disabled', 'false');
  });
});
