// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeagueBoard } from '../../src/ui/components/practice/LeagueBoard';
import {
  COMPLETIONS_TO_ENTER,
  LeagueTier,
  StandingRow,
  TIER_NAME,
} from '../../src/domain/league';

/**
 * A liga, na tela.
 *
 * O caso mais importante deste arquivo é o da tabela vazia. Já houve aqui um
 * ranking com Bach em primeiro e Clara Schumann em segundo, numa plataforma
 * sem um único usuário — o que não é enfeite, é dizer a alguém que ela está
 * em décimo lugar numa competição que não existe.
 */

const standings: StandingRow[] = [
  { posicao: 1, userId: 'u_ana', weeklyXp: 420, destino: 'PROMOTED' },
  { posicao: 2, userId: 'u_bruno', weeklyXp: 380, destino: 'STAYS' },
  { posicao: 3, userId: 'u_carla', weeklyXp: 90, destino: 'RELEGATED' },
];

const NOMES: Record<string, string> = {
  u_ana: 'Ana Ribeiro',
  u_bruno: 'Bruno Tavares',
  u_carla: 'Carla Menezes',
};

const montar = (opcoes: Partial<Parameters<typeof LeagueBoard>[0]> = {}) => {
  const onChangeScope = vi.fn();
  render(
    <LeagueBoard
      faixa={LeagueTier.SILVER}
      scope={{ tipo: 'PLATFORM' }}
      availableScopes={[
        { scope: { tipo: 'PLATFORM' }, label: 'Plataforma' },
        { scope: { tipo: 'TRIBE', entidadeId: 'tribo_violinistas' }, label: 'Violinistas' },
      ]}
      onChangeScope={onChangeScope}
      standings={standings}
      nameOf={(id) => NOMES[id] ?? id}
      viewerId="u_bruno"
      completions={5}
      closesAt="domingo às 23h59"
      {...opcoes}
    />
  );
  return { onChangeScope };
};

describe('tabela vazia mostra a forma, e nunca gente inventada', () => {
  it('sem participante, não aparece nome nenhum', () => {
    montar({ standings: [] });
    for (const nome of Object.values(NOMES)) {
      expect(screen.queryByText(nome)).not.toBeInTheDocument();
    }
  });

  it('o esqueleto explica por que está vazio, e como se entra', () => {
    // A pessoa precisa entender que a liga funciona e ainda não começou.
    montar({ standings: [] });
    expect(screen.getByText(/ninguém entrou nesta liga/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${COMPLETIONS_TO_ENTER} conclusões`))).toBeInTheDocument();
  });

  it('as barras cinzas do esqueleto não são lidas como conteúdo', () => {
    /**
     * Forma vazia anunciada por leitor de tela viraria uma lista de seis
     * itens sem nome — que é pior que não ter lista.
     */
    const { container } = render(
      <LeagueBoard
        faixa={LeagueTier.BRONZE}
        scope={{ tipo: 'PLATFORM' }}
        availableScopes={[{ scope: { tipo: 'PLATFORM' }, label: 'Plataforma' }]}
        onChangeScope={vi.fn()}
        standings={[]}
        nameOf={(id) => id}
        viewerId={null}
        completions={0}
        closesAt="domingo"
      />
    );
    const listas = container.querySelectorAll('ol[aria-hidden="true"]');
    expect(listas.length).toBe(1);
  });

  it('com tabela vazia não se cobra entrada de ninguém', () => {
    // "Faltam 3 conclusões para entrar" numa liga sem gente seria ruído.
    montar({ standings: [], viewerId: null, completions: 0 });
    expect(screen.queryByText(/faltam/i)).not.toBeInTheDocument();
  });
});

describe('a classificação', () => {
  it('mostra posição, nome e experiência da semana', () => {
    montar();
    expect(screen.getByText('Ana Ribeiro')).toBeInTheDocument();
    expect(screen.getByText('420 XP')).toBeInTheDocument();
  });

  it('a própria linha fica marcada', () => {
    montar();
    expect(screen.getByText('você')).toBeInTheDocument();
  });

  it('sobe, fica e cai são anunciados, e não só coloridos', () => {
    /**
     * Verde e vermelho não chegam a quem não distingue cor nem a quem usa
     * leitor de tela — e é a informação mais consequente da tabela.
     */
    montar();
    expect(screen.getByText('sobe de faixa')).toBeInTheDocument();
    expect(screen.getByText('cai de faixa')).toBeInTheDocument();
  });

  it('diz que a conta é da semana, e não do acumulado', () => {
    // É a diferença entre a liga premiar esforço e premiar antiguidade.
    montar();
    expect(screen.getByText(/da semana/i)).toBeInTheDocument();
    expect(screen.getByText(/domingo às 23h59/)).toBeInTheDocument();
  });
});

describe('quem ainda não entrou', () => {
  it('sabe quantas conclusões faltam', () => {
    montar({ viewerId: null, completions: 1 });
    // Dentro do convite: "2" solto casaria também com a posição na tabela.
    const convite = screen.getByText(/ainda não está nesta liga/i);
    expect(convite).toHaveTextContent(
      new RegExp(`Faltam\\s*${COMPLETIONS_TO_ENTER - 1}\\s*conclusões`)
    );
  });

  it('quem já participa não recebe o convite', () => {
    montar();
    expect(screen.queryByText(/ainda não está nesta liga/i)).not.toBeInTheDocument();
  });
});

describe('os recortes', () => {
  it('a faixa atual aparece marcada na escada', () => {
    montar();
    expect(screen.getByText(TIER_NAME[LeagueTier.SILVER])).toBeInTheDocument();
    expect(screen.getByText(/sua faixa atual/i)).toBeInTheDocument();
  });

  it('o recorte ativo é anunciado como atual', () => {
    montar();
    expect(screen.getByRole('button', { name: 'Plataforma' })).toHaveAttribute(
      'aria-current',
      'true'
    );
  });

  it('trocar de recorte avisa quem chamou', async () => {
    // "O melhor da tribo dos violinistas" diz muito mais que "o da plataforma".
    const user = userEvent.setup();
    const { onChangeScope } = montar();

    await user.click(screen.getByRole('button', { name: 'Violinistas' }));
    expect(onChangeScope).toHaveBeenCalledWith({
      tipo: 'TRIBE',
      entidadeId: 'tribo_violinistas',
    });
  });
});
