// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PainelDeMissoes } from '../../src/ui/components/practice/PainelDeMissoes';
import {
  ATIVIDADE_VAZIA,
  MISSOES_POSSIVEIS,
  progressoDasMissoes,
} from '../../src/domain/missoes';

/**
 * O painel de missões.
 *
 * Dois casos carregam o arquivo: barra só onde há o que contar, e nenhuma
 * promessa de missão futura. O segundo é antipadrão declarado — ou a missão
 * existe, ou não aparece.
 */

const aquecimento = MISSOES_POSSIVEIS.find((m) => m.id === 'aquecimento')!;
const semTropeco = MISSOES_POSSIVEIS.find((m) => m.id === 'sem_tropeco')!;

const montar = (opcoes: Partial<Parameters<typeof PainelDeMissoes>[0]> = {}) =>
  render(
    <PainelDeMissoes
      missoes={progressoDasMissoes([aquecimento, semTropeco], {
        ...ATIVIDADE_VAZIA,
        xpNoDia: 4,
      })}
      prazo="13h"
      {...opcoes}
    />
  );

describe('a missão se explica', () => {
  it('mostra título, condição e quanto rende', () => {
    montar();
    expect(screen.getByText('Aquecimento')).toBeInTheDocument();
    expect(screen.getByText(aquecimento.descricao)).toBeInTheDocument();
    expect(screen.getByText(`+${aquecimento.xp} XP`)).toBeInTheDocument();
  });

  it('o prazo é anunciado como prazo, e não como número solto', () => {
    montar();
    expect(screen.getByText('Prazo:')).toBeInTheDocument();
    expect(screen.getByText('13h')).toBeInTheDocument();
  });
});

describe('barra só onde há o que contar', () => {
  it('a missão de contagem mostra a barra e quanto falta', () => {
    montar();
    expect(
      screen.getByRole('progressbar', { name: /progresso de aquecimento/i })
    ).toBeInTheDocument();
    expect(screen.getByText('4 de 10')).toBeInTheDocument();
  });

  it('a missão de sim-ou-não não ganha barra', () => {
    /**
     * "0 de 1" não informa mais que "não cumprida", e barra parada é lida
     * como travamento em vez de tarefa de um passo.
     */
    montar();
    expect(
      screen.queryByRole('progressbar', { name: /sem tropeço/i })
    ).not.toBeInTheDocument();
  });
});

describe('a missão cumprida se distingue sem depender de cor', () => {
  it('quem cumpriu é anunciado como cumprida', () => {
    montar({
      missoes: progressoDasMissoes([aquecimento], { ...ATIVIDADE_VAZIA, xpNoDia: 50 }),
    });
    expect(screen.getByText('— cumprida')).toBeInTheDocument();
  });

  it('quem não cumpriu não é anunciado assim', () => {
    montar();
    expect(screen.queryByText('— cumprida')).not.toBeInTheDocument();
  });
});

describe('não existe promessa de missão futura', () => {
  it('nada de "em breve" nem espaço reservado', () => {
    // Antipadrão declarado: ou a missão existe, ou não aparece.
    const { container } = montar();
    expect(container.textContent).not.toMatch(/em breve|mais missões|novidades/i);
  });

  it('sem desafio do mês, a seção inteira some', () => {
    montar();
    expect(screen.queryByText(/desafio do mês/i)).not.toBeInTheDocument();
  });

  it('com desafio, ele aparece e diz que rende emblema', () => {
    montar({
      desafioDoMes: {
        titulo: 'Vinte lições em setembro',
        descricao: 'Conclua 20 lições até o fim do mês.',
        feito: 7,
        alvo: 20,
      },
    });
    expect(screen.getByText('Vinte lições em setembro')).toBeInTheDocument();
    expect(screen.getByText(/rende emblema, e não experiência/i)).toBeInTheDocument();
    expect(screen.getByText('7 de 20')).toBeInTheDocument();
  });
});
