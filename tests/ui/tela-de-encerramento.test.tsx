// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TelaDeEncerramento } from '../../src/ui/components/practice/TelaDeEncerramento';
import { Conquista } from '../../src/domain/encerramento-da-licao';

/**
 * O encerramento, na tela.
 *
 * Uma conquista por vez. O que estes casos protegem é que a tela **não
 * acrescente** nada ao que o domínio decidiu: se a lista veio com duas
 * conquistas, são duas telas, e não há uma terceira comemorando o que não
 * aconteceu.
 */

const XP: Conquista = {
  chave: 'XP',
  titulo: 'Experiência',
  valor: '+95 XP',
  legenda: '3 acertos e 1 erro — o erro também conta, porque você praticou.',
};

const OFENSIVA: Conquista = {
  chave: 'OFENSIVA',
  titulo: 'Ofensiva',
  valor: '4 dias',
  legenda: 'Dias seguidos de estudo. Um dia inteiro sem praticar zera.',
};

const montar = (opcoes: Partial<Parameters<typeof TelaDeEncerramento>[0]> = {}) => {
  const aoEscolherMeta = vi.fn();
  const aoRevisarLicao = vi.fn();
  const aoConcluir = vi.fn();
  render(
    <TelaDeEncerramento
      conquistas={[XP, OFENSIVA]}
      metaProposta={false}
      aoEscolherMeta={aoEscolherMeta}
      aoRevisarLicao={aoRevisarLicao}
      aoConcluir={aoConcluir}
      {...opcoes}
    />
  );
  return { aoEscolherMeta, aoRevisarLicao, aoConcluir };
};

describe('uma conquista por vez', () => {
  it('a primeira tela mostra só a primeira conquista', () => {
    montar();
    expect(screen.getByText('+95 XP')).toBeInTheDocument();
    expect(screen.queryByText('4 dias')).not.toBeInTheDocument();
  });

  it('continuar leva à seguinte', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByText('4 dias')).toBeInTheDocument();
    expect(screen.queryByText('+95 XP')).not.toBeInTheDocument();
  });

  it('a legenda explica o número, e não só o repete', () => {
    montar();
    expect(screen.getByText(/o erro também conta/i)).toBeInTheDocument();
  });

  it('a etapa é anunciada a quem não vê a barra', () => {
    montar();
    expect(screen.getByLabelText(/etapa 1 de 3/i)).toBeInTheDocument();
  });
});

describe('a tela não inventa conquista', () => {
  it('lista de uma conquista dá uma tela de conquista e o fecho', async () => {
    /**
     * A regra mora no domínio: conquista que não aconteceu não está na lista.
     * Aqui se confere que a tela não acrescenta nenhuma por conta própria.
     */
    const user = userEvent.setup();
    montar({ conquistas: [XP] });

    expect(screen.getByLabelText(/etapa 1 de 2/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(screen.getByRole('heading', { name: /lição concluída/i })).toBeInTheDocument();
  });

  it('sem conquista nenhuma, vai direto ao fecho', () => {
    montar({ conquistas: [] });
    expect(screen.getByRole('heading', { name: /lição concluída/i })).toBeInTheDocument();
  });
});

describe('o fecho reúne o que passou', () => {
  const chegarAoFecho = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
  };

  it('o resumo repete todas as conquistas juntas', async () => {
    // Uma por vez para chegar; todas juntas para guardar.
    const user = userEvent.setup();
    montar();
    await chegarAoFecho(user);

    expect(screen.getByText('+95 XP')).toBeInTheDocument();
    expect(screen.getByText('4 dias')).toBeInTheDocument();
  });

  it('revisar a lição é oferecido aqui, e não depois', async () => {
    /**
     * É o único momento em que a pessoa ainda lembra o que errou. Oferecer a
     * revisão no mapa, mais tarde, é oferecer a quem já esqueceu.
     */
    const user = userEvent.setup();
    const { aoRevisarLicao } = montar();
    await chegarAoFecho(user);

    await user.click(screen.getByRole('button', { name: /revisar esta lição/i }));
    expect(aoRevisarLicao).toHaveBeenCalled();
  });

  it('voltar ao percurso encerra', async () => {
    const user = userEvent.setup();
    const { aoConcluir } = montar();
    await chegarAoFecho(user);

    await user.click(screen.getByRole('button', { name: /voltar ao percurso/i }));
    expect(aoConcluir).toHaveBeenCalled();
  });
});

describe('a meta de constância', () => {
  const montarComMeta = () => montar({ conquistas: [XP], metaProposta: true });

  const chegarNaMeta = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
  };

  it('só aparece quando proposta', () => {
    montar({ conquistas: [XP], metaProposta: false });
    expect(screen.queryByText(/meta de constância/i)).not.toBeInTheDocument();
  });

  it('oferece as três metas, sem recomendar nenhuma', async () => {
    // Recomendar seria pôr a meta no lugar da pessoa.
    const user = userEvent.setup();
    montarComMeta();
    await chegarNaMeta(user);

    for (const dias of ['7 dias', '14 dias', '30 dias']) {
      expect(screen.getByRole('button', { name: new RegExp(dias) })).toBeInTheDocument();
    }
  });

  it('escolher registra e avança', async () => {
    const user = userEvent.setup();
    const { aoEscolherMeta } = montarComMeta();
    await chegarNaMeta(user);

    await user.click(screen.getByRole('button', { name: /14 dias/ }));
    expect(aoEscolherMeta).toHaveBeenCalledWith(14);
    expect(screen.getByRole('heading', { name: /lição concluída/i })).toBeInTheDocument();
  });

  it('dá para seguir sem escolher meta nenhuma', async () => {
    /**
     * Uma etapa que só avança escolhendo é pedágio, não escolha: a pessoa
     * aprende a clicar em qualquer coisa para sair dali, e a meta que sai daí
     * não vale nada.
     */
    const user = userEvent.setup();
    const { aoEscolherMeta } = montarComMeta();
    await chegarNaMeta(user);

    await user.click(screen.getByRole('button', { name: /agora não/i }));
    expect(aoEscolherMeta).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: /lição concluída/i })).toBeInTheDocument();
  });
});
