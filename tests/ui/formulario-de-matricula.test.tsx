// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormularioDeMatricula } from '../../src/ui/components/practice/FormularioDeMatricula';
import {
  NOME_DO_PONTO_DE_PARTIDA,
  PontoDePartida,
  RitmoDoPercurso,
} from '../../src/domain/matricula-no-practice';

/**
 * A matrícula no percurso.
 *
 * Duas perguntas, e nada de teste antes de começar. O que estes casos
 * protegem é que continuem sendo perguntas — respondíveis por teclado,
 * explicadas na própria opção, e sem nenhuma marcada como a certa.
 */

const montar = (opcoes: Partial<Parameters<typeof FormularioDeMatricula>[0]> = {}) => {
  const aoMatricular = vi.fn();
  render(
    <FormularioDeMatricula
      nomeDoPercurso="Teoria musical"
      aoMatricular={aoMatricular}
      {...opcoes}
    />
  );
  return { aoMatricular };
};

const opcaoDe = (p: PontoDePartida) =>
  screen.getByRole('radio', { name: new RegExp(NOME_DO_PONTO_DE_PARTIDA[p]) });

describe('as duas perguntas', () => {
  it('pergunta de onde se parte e como se avança', () => {
    // Pelo grupo, e não pelo texto: a dica do rodapé repete a mesma frase.
    montar();
    expect(screen.getByRole('group', { name: /de onde você parte/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /como você avança/i })).toBeInTheDocument();
  });

  it('as cinco partidas aparecem', () => {
    montar();
    for (const p of Object.values(PontoDePartida)) {
      expect(opcaoDe(p)).toBeInTheDocument();
    }
  });

  it('cada opção explica o que faz, ali mesmo', () => {
    // Ajuda escondida obriga a escolher adivinhando.
    montar();
    expect(screen.getByText(/começa pelo vocabulário/i)).toBeInTheDocument();
    expect(screen.getByText(/acompanham o capítulo/i)).toBeInTheDocument();
  });

  it('a partida mostra que faixas de material abre', () => {
    montar();
    expect(screen.getAllByText('vocabulario').length).toBeGreaterThan(0);
  });
});

describe('nenhuma opção é a certa', () => {
  it('nenhuma partida vem marcada', () => {
    /**
     * Marcar uma como recomendada faria a pessoa escolher a que parece melhor
     * em vez da que é verdade — e o percurso inteiro sairia errado daí.
     */
    montar();
    for (const p of Object.values(PontoDePartida)) {
      expect(opcaoDe(p)).not.toBeChecked();
    }
  });

  it('nenhum texto recomenda ou destaca uma partida', () => {
    montar();
    expect(screen.queryByText(/recomendad/i)).not.toBeInTheDocument();
    expect(screen.getByText(/não existe resposta melhor/i)).toBeInTheDocument();
  });

  it('não dá para começar sem responder de onde se parte', () => {
    montar();
    expect(screen.getByRole('button', { name: /começar o percurso/i })).toBeDisabled();
    expect(screen.getByText(/escolha de onde você parte/i)).toBeInTheDocument();
  });
});

describe('responder pelo teclado', () => {
  it('as opções são radios de verdade, navegáveis por seta', async () => {
    /**
     * Já houve aqui uma prova em que as alternativas eram `div onClick`: quem
     * usava teclado literalmente não conseguia responder.
     */
    const user = userEvent.setup();
    montar();

    opcaoDe(PontoDePartida.LEIGO).focus();
    await user.keyboard('{ArrowDown}');

    expect(opcaoDe(PontoDePartida.AUTODIDATA)).toBeChecked();
    expect(opcaoDe(PontoDePartida.LEIGO)).not.toBeChecked();
  });

  it('escolher uma desmarca a anterior', async () => {
    const user = userEvent.setup();
    montar();

    await user.click(opcaoDe(PontoDePartida.CURSANDO));
    await user.click(opcaoDe(PontoDePartida.CURSADO));

    expect(opcaoDe(PontoDePartida.CURSANDO)).not.toBeChecked();
    expect(opcaoDe(PontoDePartida.CURSADO)).toBeChecked();
  });
});

describe('o ritmo', () => {
  it('passo a passo vem marcado, porque alguma coisa tem de estar', () => {
    // Diferente da partida: aqui não há resposta verdadeira a descobrir, e
    // deixar sem escolha só criaria um segundo bloqueio.
    montar();
    expect(screen.getByRole('radio', { name: /passo a passo/i })).toBeChecked();
  });

  it('dá para trocar para livre', async () => {
    const user = userEvent.setup();
    const { aoMatricular } = montar();

    await user.click(opcaoDe(PontoDePartida.LEIGO));
    await user.click(screen.getByRole('radio', { name: /livre/i }));
    await user.click(screen.getByRole('button', { name: /começar o percurso/i }));

    expect(aoMatricular).toHaveBeenCalledWith({
      pontoDePartida: PontoDePartida.LEIGO,
      ritmo: RitmoDoPercurso.LIVRE,
      cursoVinculadoId: undefined,
    });
  });
});

describe('o vínculo com o curso é opcional, e dito', () => {
  it('sem curso correspondente, diz que praticar sem cursar é previsto', () => {
    montar();
    expect(screen.getByText(/praticar sem cursar é caso previsto/i)).toBeInTheDocument();
  });

  it('com curso, explica que as lições são outras', () => {
    /**
     * As lições do curso são umas e as do percurso são outras. O vínculo
     * serve para o percurso saber onde a pessoa está, não para exigir o curso.
     */
    montar({ cursoCorrespondente: { id: 'c_teoria', titulo: 'Teoria Musical' } });
    expect(screen.getByText(/as lições são outras/i)).toBeInTheDocument();
    expect(screen.getByText('Teoria Musical')).toBeInTheDocument();
  });

  it('o vínculo vai junto da matrícula', async () => {
    const user = userEvent.setup();
    const { aoMatricular } = montar({
      cursoCorrespondente: { id: 'c_teoria', titulo: 'Teoria Musical' },
    });

    await user.click(opcaoDe(PontoDePartida.CURSANDO));
    await user.click(screen.getByRole('button', { name: /começar o percurso/i }));

    expect(aoMatricular).toHaveBeenCalledWith(
      expect.objectContaining({ cursoVinculadoId: 'c_teoria' })
    );
  });
});
