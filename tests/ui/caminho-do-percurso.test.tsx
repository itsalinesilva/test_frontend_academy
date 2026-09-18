// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CaminhoDoPercurso } from '../../src/ui/components/practice/CaminhoDoPercurso';
import { Dimensao, DIMENSOES } from '../../src/domain/gramatica-musical';
import { dimensaoAtual, motivoDoBloqueio } from '../../src/domain/percurso';

/**
 * O caminho, na tela.
 *
 * Responde a uma pergunta só: por onde eu continuo? O que estes casos
 * protegem é isso — um destaque, cadeado com motivo, e nó fechado que não
 * abre lição.
 */

const montar = (concluidas: Dimensao[] = []) => {
  const aoAbrirNo = vi.fn();
  render(<CaminhoDoPercurso concluidas={concluidas} aoAbrirNo={aoAbrirNo} />);
  return { aoAbrirNo };
};

const nomeDe = (d: Dimensao) => DIMENSOES[d].nome;

describe('a estrutura fica visível', () => {
  it('as unidades aparecem com número e título', () => {
    montar();
    expect(screen.getByText('Unidade 1')).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(1);
  });

  it('cada unidade diz quantos nós já foram feitos', () => {
    montar([Dimensao.NOTA]);
    expect(screen.getByText(/1 de \d+/)).toBeInTheDocument();
  });

  it('o nó mostra a pergunta que ensina a responder', () => {
    montar();
    expect(screen.getByText(DIMENSOES[Dimensao.NOTA].pergunta)).toBeInTheDocument();
  });
});

describe('um só nó em destaque', () => {
  it('exatamente um nó diz "começar"', () => {
    // Vários destaques é a mesma coisa que nenhum.
    montar();
    expect(screen.getAllByText('Começar')).toHaveLength(1);
  });

  it('o destaque é o nó atual do domínio', () => {
    const concluidas = [Dimensao.NOTA, Dimensao.VALOR];
    montar(concluidas);

    const atual = dimensaoAtual(concluidas)!;
    const botao = screen.getByRole('button', { name: nomeDe(atual) });
    expect(botao).toHaveTextContent('Começar');
  });

  it('abrir o nó atual leva à lição', async () => {
    const user = userEvent.setup();
    const { aoAbrirNo } = montar();

    const atual = dimensaoAtual([])!;
    await user.click(screen.getByRole('button', { name: nomeDe(atual) }));
    expect(aoAbrirNo).toHaveBeenCalledWith(atual);
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
    const motivo = motivoDoBloqueio(Dimensao.CLAVE, [])!;
    expect(
      screen.getByRole('button', { name: new RegExp(`${nomeDe(Dimensao.CLAVE)}.*${motivo}`) })
    ).toBeInTheDocument();
  });

  it('tocar no travado mostra o motivo escrito, e não abre lição', async () => {
    const user = userEvent.setup();
    const { aoAbrirNo } = montar();

    const travado = screen.getByRole('button', {
      name: new RegExp(`^${nomeDe(Dimensao.CLAVE)} — bloqueado`),
    });
    await user.click(travado);

    expect(aoAbrirNo).not.toHaveBeenCalled();
    expect(screen.getByText(motivoDoBloqueio(Dimensao.CLAVE, [])!)).toBeInTheDocument();
  });

  it('tocar de novo esconde o motivo', async () => {
    const user = userEvent.setup();
    montar();
    const travado = screen.getByRole('button', {
      name: new RegExp(`^${nomeDe(Dimensao.CLAVE)} — bloqueado`),
    });

    await user.click(travado);
    await user.click(travado);
    expect(screen.queryByText(motivoDoBloqueio(Dimensao.CLAVE, [])!)).not.toBeInTheDocument();
  });

  it('o nó travado continua alcançável pelo teclado', async () => {
    /**
     * `disabled` tiraria o botão do foco, e quem navega por teclado nunca
     * chegaria ao motivo. O estado vai em `aria-disabled`, que anuncia sem
     * remover.
     */
    montar();
    const travado = screen.getByRole('button', {
      name: new RegExp(`^${nomeDe(Dimensao.CLAVE)} — bloqueado`),
    });

    expect(travado).toHaveAttribute('aria-disabled', 'true');
    expect(travado).not.toBeDisabled();

    travado.focus();
    expect(travado).toHaveFocus();
  });
});

describe('concluir muda o mapa', () => {
  it('o nó feito some da contagem de pendentes e vira concluído', () => {
    const { rerender } = render(
      <CaminhoDoPercurso concluidas={[]} aoAbrirNo={vi.fn()} />
    );
    const antes = dimensaoAtual([])!;

    rerender(<CaminhoDoPercurso concluidas={[antes]} aoAbrirNo={vi.fn()} />);
    expect(screen.getByRole('button', { name: nomeDe(antes) })).not.toHaveTextContent(
      'Começar'
    );
  });

  it('concluir o pré-requisito destrava quem dependia dele', () => {
    montar([Dimensao.NOTA]);
    const clave = screen.getByRole('button', { name: nomeDe(Dimensao.CLAVE) });
    expect(clave).toHaveAttribute('aria-disabled', 'false');
  });
});
