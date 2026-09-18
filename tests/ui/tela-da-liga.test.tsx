// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TelaDaLiga } from '../../src/ui/components/practice/TelaDaLiga';
import {
  CONCLUIDOS_PARA_ENTRAR,
  FaixaDaLiga,
  LinhaDaClassificacao,
  NOME_DA_FAIXA,
} from '../../src/domain/liga';

/**
 * A liga, na tela.
 *
 * O caso mais importante deste arquivo é o da tabela vazia. Já houve aqui um
 * ranking com Bach em primeiro e Clara Schumann em segundo, numa plataforma
 * sem um único usuário — o que não é enfeite, é dizer a alguém que ela está
 * em décimo lugar numa competição que não existe.
 */

const classificacao: LinhaDaClassificacao[] = [
  { posicao: 1, userId: 'u_ana', xpDaSemana: 420, destino: 'SOBE' },
  { posicao: 2, userId: 'u_bruno', xpDaSemana: 380, destino: 'FICA' },
  { posicao: 3, userId: 'u_carla', xpDaSemana: 90, destino: 'CAI' },
];

const NOMES: Record<string, string> = {
  u_ana: 'Ana Ribeiro',
  u_bruno: 'Bruno Tavares',
  u_carla: 'Carla Menezes',
};

const montar = (opcoes: Partial<Parameters<typeof TelaDaLiga>[0]> = {}) => {
  const aoTrocarRecorte = vi.fn();
  render(
    <TelaDaLiga
      faixa={FaixaDaLiga.PRATA}
      recorte={{ tipo: 'PLATAFORMA' }}
      recortesDisponiveis={[
        { recorte: { tipo: 'PLATAFORMA' }, rotulo: 'Plataforma' },
        { recorte: { tipo: 'TRIBO', entidadeId: 'tribo_violinistas' }, rotulo: 'Violinistas' },
      ]}
      aoTrocarRecorte={aoTrocarRecorte}
      classificacao={classificacao}
      nomeDe={(id) => NOMES[id] ?? id}
      meuUserId="u_bruno"
      conclusoes={5}
      fechaEm="domingo às 23h59"
      {...opcoes}
    />
  );
  return { aoTrocarRecorte };
};

describe('tabela vazia mostra a forma, e nunca gente inventada', () => {
  it('sem participante, não aparece nome nenhum', () => {
    montar({ classificacao: [] });
    for (const nome of Object.values(NOMES)) {
      expect(screen.queryByText(nome)).not.toBeInTheDocument();
    }
  });

  it('o esqueleto explica por que está vazio, e como se entra', () => {
    // A pessoa precisa entender que a liga funciona e ainda não começou.
    montar({ classificacao: [] });
    expect(screen.getByText(/ninguém entrou nesta liga/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${CONCLUIDOS_PARA_ENTRAR} conclusões`))).toBeInTheDocument();
  });

  it('as barras cinzas do esqueleto não são lidas como conteúdo', () => {
    /**
     * Forma vazia anunciada por leitor de tela viraria uma lista de seis
     * itens sem nome — que é pior que não ter lista.
     */
    const { container } = render(
      <TelaDaLiga
        faixa={FaixaDaLiga.BRONZE}
        recorte={{ tipo: 'PLATAFORMA' }}
        recortesDisponiveis={[{ recorte: { tipo: 'PLATAFORMA' }, rotulo: 'Plataforma' }]}
        aoTrocarRecorte={vi.fn()}
        classificacao={[]}
        nomeDe={(id) => id}
        meuUserId={null}
        conclusoes={0}
        fechaEm="domingo"
      />
    );
    const listas = container.querySelectorAll('ol[aria-hidden="true"]');
    expect(listas.length).toBe(1);
  });

  it('com tabela vazia não se cobra entrada de ninguém', () => {
    // "Faltam 3 conclusões para entrar" numa liga sem gente seria ruído.
    montar({ classificacao: [], meuUserId: null, conclusoes: 0 });
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
    montar({ meuUserId: null, conclusoes: 1 });
    // Dentro do convite: "2" solto casaria também com a posição na tabela.
    const convite = screen.getByText(/ainda não está nesta liga/i);
    expect(convite).toHaveTextContent(
      new RegExp(`Faltam\\s*${CONCLUIDOS_PARA_ENTRAR - 1}\\s*conclusões`)
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
    expect(screen.getByText(NOME_DA_FAIXA[FaixaDaLiga.PRATA])).toBeInTheDocument();
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
    const { aoTrocarRecorte } = montar();

    await user.click(screen.getByRole('button', { name: 'Violinistas' }));
    expect(aoTrocarRecorte).toHaveBeenCalledWith({
      tipo: 'TRIBO',
      entidadeId: 'tribo_violinistas',
    });
  });
});
