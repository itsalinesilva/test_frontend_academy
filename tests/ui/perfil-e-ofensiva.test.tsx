// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PainelDaOfensiva } from '../../src/ui/components/practice/PainelDaOfensiva';
import {
  Emblema,
  Regua,
  ReguasDoPerfil,
} from '../../src/ui/components/practice/ReguasDoPerfil';
import { CLUBES_DE_OFENSIVA } from '../../src/domain/frequencia';

/**
 * O perfil e a ofensiva.
 *
 * Dois casos carregam o arquivo: zero se declara sem constranger, e emblema
 * bloqueado aparece. Os dois são sobre a mesma coisa — dizer a verdade sobre
 * onde a pessoa está sem transformar isso em cobrança nem em segredo.
 */

// ---------------------------------------------------------------------------
// Ofensiva
// ---------------------------------------------------------------------------

const SEMANA_VAZIA = [false, false, false, false, false, false, false];

const ofensiva = (opcoes: Partial<Parameters<typeof PainelDaOfensiva>[0]> = {}) =>
  render(
    <PainelDaOfensiva
      diasSeguidos={0}
      semana={SEMANA_VAZIA}
      congelamentos={0}
      meta={null}
      {...opcoes}
    />
  );

describe('zero se declara sem constranger', () => {
  it('diz zero, e diz como começar', () => {
    /**
     * Quem está em zero ou nunca começou, ou parou — e nos dois casos a
     * informação útil é como recomeçar, não a repreensão.
     */
    ofensiva();
    expect(screen.getByRole('heading', { name: /0 dias de ofensiva/i })).toBeInTheDocument();
    expect(screen.getByText(/já começa uma/i)).toBeInTheDocument();
  });

  it('nada no texto repreende ou apressa', () => {
    const { container } = ofensiva();
    expect(container.textContent).not.toMatch(/não perca|cuidado|você falhou|últim/i);
  });

  it('um dia é "1 dia", e não "1 dias"', () => {
    ofensiva({ diasSeguidos: 1 });
    expect(screen.getByRole('heading', { name: /^1 dia de ofensiva/i })).toBeInTheDocument();
  });
});

describe('a semana fica visível', () => {
  it('os sete dias aparecem, e cada um diz o que houve', () => {
    // Cor sozinha não chega a quem não a distingue nem a leitor de tela.
    ofensiva({ semana: [false, true, true, false, false, false, false] });
    expect(screen.getByText(/^segunda: estudou/)).toBeInTheDocument();
    expect(screen.getByText(/^quinta: sem registro/)).toBeInTheDocument();
  });
});

describe('congelamentos e meta', () => {
  it('sem congelamento, não se fala em congelamento', () => {
    ofensiva();
    expect(screen.queryByText(/congelamento/i)).not.toBeInTheDocument();
  });

  it('com congelamentos, explica para que servem', () => {
    ofensiva({ congelamentos: 2 });
    expect(screen.getByText(/protegem um dia perdido cada/i)).toBeInTheDocument();
  });

  it('sem meta escolhida, não se inventa uma', () => {
    ofensiva({ diasSeguidos: 4 });
    expect(screen.queryByText(/sua meta/i)).not.toBeInTheDocument();
  });

  it('com meta, diz quanto falta', () => {
    // Meta de 14 para não colidir com a contagem do clube de 7 dias.
    ofensiva({ diasSeguidos: 4, meta: 14 });
    expect(screen.getByText(/Sua meta é de/i)).toHaveTextContent('Faltam 10.');
  });

  it('meta alcançada é dita como cumprida, e não como "faltam 0"', () => {
    ofensiva({ diasSeguidos: 9, meta: 7 });
    expect(screen.getByText(/cumprida/i)).toBeInTheDocument();
  });
});

describe('o clube mostra o degrau, e não só o cadeado', () => {
  it('os quatro clubes aparecem, alcançados ou não', () => {
    ofensiva({ diasSeguidos: 0 });
    for (const c of CLUBES_DE_OFENSIVA) {
      expect(screen.getByText(c.nome)).toBeInTheDocument();
    }
  });

  it('o próximo clube diz quantos dias faltam', () => {
    // Cadeado sem número é convite a desistir: perto ou a um ano daqui?
    ofensiva({ diasSeguidos: 5 });
    expect(screen.getByText(/faltam 2 dias/i)).toBeInTheDocument();
  });

  it('o clube alcançado é marcado', () => {
    ofensiva({ diasSeguidos: 40 });
    expect(screen.getAllByText('alcançado')).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Réguas e emblemas
// ---------------------------------------------------------------------------

const REGUAS: Regua[] = [
  {
    id: 'xp_total',
    nome: 'Experiência total',
    descricao: 'Mede esforço acumulado. Não zera nunca.',
    valor: 1920,
  },
  {
    id: 'xp_semana',
    nome: 'Experiência da semana',
    descricao: 'É por ela que a liga classifica.',
    valor: 480,
  },
  {
    id: 'maestria',
    nome: 'Maestrias',
    descricao: 'Nós do percurso concluídos.',
    valor: 7,
    maximo: 21,
  },
];

const EMBLEMAS: Emblema[] = [
  { id: 'e1', nome: 'Primeira lição', conquistado: true, requisito: 'Concluir uma lição.' },
  { id: 'e2', nome: 'Ouvido firme', conquistado: false, requisito: 'Acertar 50 de ouvido.' },
  { id: 'e3', nome: 'Sem tropeço', conquistado: false, requisito: 'Uma rodada sem erro.' },
];

const perfil = (opcoes: Partial<Parameters<typeof ReguasDoPerfil>[0]> = {}) => {
  const aoTrocarRegua = vi.fn();
  render(
    <ReguasDoPerfil
      reguas={REGUAS}
      reguaAtivaId="xp_total"
      aoTrocarRegua={aoTrocarRegua}
      emblemas={EMBLEMAS}
      {...opcoes}
    />
  );
  return { aoTrocarRegua };
};

describe('uma régua em destaque, as outras ao alcance', () => {
  it('a régua ativa vem aberta', () => {
    perfil();
    expect(screen.getByText(/mede esforço acumulado/i)).toBeInTheDocument();
  });

  it('as demais vêm fechadas, mas presentes', () => {
    // Esmaecer não pode virar esconder.
    perfil();
    expect(screen.getByText('Experiência da semana')).toBeInTheDocument();
    expect(screen.queryByText(/é por ela que a liga classifica/i)).not.toBeInTheDocument();
  });

  it('abrir uma secundária mostra o detalhe sem sair da tela', async () => {
    const user = userEvent.setup();
    const { aoTrocarRegua } = perfil();

    await user.click(screen.getByRole('button', { name: /experiência da semana/i }));
    expect(screen.getByText(/é por ela que a liga classifica/i)).toBeInTheDocument();
    expect(aoTrocarRegua).toHaveBeenCalledWith('xp_semana');
  });

  it('o estado aberto ou fechado é anunciado', () => {
    perfil();
    expect(screen.getByRole('button', { name: /experiência total/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(screen.getByRole('button', { name: /maestrias/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });
});

describe('barra só onde a régua termina', () => {
  it('régua com máximo ganha barra', async () => {
    const user = userEvent.setup();
    perfil();
    await user.click(screen.getByRole('button', { name: /maestrias/i }));
    expect(
      screen.getByRole('progressbar', { name: /progresso de maestrias/i })
    ).toBeInTheDocument();
  });

  it('experiência acumulada não ganha barra', () => {
    /**
     * XP não tem teto. Desenhar uma barra seria inventar um fim que não
     * existe — e a barra chegaria ao fim mentindo.
     */
    perfil();
    expect(
      screen.queryByRole('progressbar', { name: /experiência total/i })
    ).not.toBeInTheDocument();
  });
});

describe('emblema bloqueado aparece', () => {
  it('a contagem é N de M, com o M inteiro', () => {
    /**
     * Esconder o bloqueado deixa a coleção sem forma: a pessoa não sabe se
     * conquistou três de quatro ou três de quarenta.
     */
    perfil();
    expect(screen.getByRole('heading', { name: '1 de 3 emblemas' })).toBeInTheDocument();
  });

  it('o bloqueado aparece com o requisito escrito', () => {
    perfil();
    expect(screen.getByText('Ouvido firme')).toBeInTheDocument();
    expect(screen.getByText('Acertar 50 de ouvido.')).toBeInTheDocument();
  });

  it('conquistado e bloqueado se distinguem sem depender de cor', () => {
    perfil();
    expect(screen.getByText(/— conquistado/)).toBeInTheDocument();
    expect(screen.getAllByText(/— ainda não conquistado/)).toHaveLength(2);
  });
});
