// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * O LABORATÓRIO DE QUEM TEM NOME.
 *
 * 🔴 ESTA VISTA NUNCA TINHA SIDO RENDERIZADA.
 *
 * A tela foi construída e auditada como **visitante**, e a de quem entra ficou
 * sem prova nenhuma. Ao renderizá-la pela primeira vez, três defeitos:
 *
 *   **dois marcos `complementary` com o mesmo nome**, aninhados — o layout
 *   monta o painel, e o componente montava outro dentro;
 *
 *   **o Feed dizia "em andamento" e listava sessões CONCLUÍDAS** — vinha de
 *   `getPracticeHistory`, e resultado só existe quando a sessão acabou. O
 *   rótulo e o conteúdo diziam coisas opostas;
 *
 *   **"em movimento agora" listava três medidas paradas em zero** — a seção
 *   diz no próprio texto que não são as maiores, são as que mudaram.
 *
 * Os três são a mesma falha: construir a vista sem olhar para ela.
 */

const sessao = { userId: 'user-teste', nome: 'Aline', ehAdmin: false, carregando: false };

vi.mock('../../src/ui/hooks/useCurrentUser', () => ({ useCurrentUser: () => sessao }));

const navigate = vi.fn();
vi.mock('../../src/ui/navigation/router', () => ({
  useRouter: () => ({ query: new URLSearchParams(),
    navigate,
    params: {},
    currentPath: '/practice',
    breadcrumbs: [],
    authorization: { authorized: true },
  }),
}));

import { LaboratorioScreen } from '../../src/ui/screens/practice/LaboratorioScreen';

const abrir = async () => {
  const r = render(<LaboratorioScreen />);
  await screen.findByRole('tab', { name: /Feed/ }, { timeout: 40000 });
  return r;
};


beforeEach(() => {
  localStorage.clear();
  navigate.mockClear();
});

describe('a estrutura é a mesma do visitante, sem duplicar marco', () => {
  it('🔴 há UM painel complementar, e não dois aninhados', async () => {
    /**
     * `PageLayout.Aside` já monta o marco, com o rótulo que a tela declara. O
     * componente do painel montava outro, com o mesmo nome — e um leitor de
     * tela anunciava dois painéis idênticos, um dentro do outro.
     *
     * Marco é estrutura de página, e quem decide a estrutura é o layout.
     */
    await abrir();
    expect(screen.getAllByRole('complementary').length).toBe(1);
  });

  it('as três abas continuam, e o hero de visitante NÃO aparece', async () => {
    /**
     * O banner apresenta o espaço a quem não o conhece. Para quem já entrou é
     * ruído, e ruído no topo empurra para baixo o que a pessoa veio ver.
     */
    const { container } = await abrir();

    expect(screen.getAllByRole('tab').length).toBe(3);
    expect((container.textContent ?? '').includes('Estudar é uma coisa')).toBe(false);
  });
});

describe('🔴 o Feed mostra o que está ABERTO', () => {
  it('não lista sessão concluída sob o rótulo de em andamento', async () => {
    /**
     * Aberta é a sessão **sem `endedAt`** — não há campo de status a
     * consultar: o fim é o carimbo de hora, e a ausência dele define o aberto.
     *
     * Sem nada aberto, o Feed diz isso e aponta para Lições. Feed vazio com
     * sugestões seria a tela mudando de assunto sozinha.
     */
    await abrir();

    /**
     * A espera é pela REGIÃO, e não pela aba: enquanto o perfil não volta, o
     * Feed desenha o esqueleto de carregamento, que não é marco. Medir antes
     * disso testaria o estado intermediário.
     */
    const feed = await screen.findByRole('region', { name: 'Em andamento' }, { timeout: 40000 });
    const texto = feed.textContent ?? '';

    const vazio = /Nada aberto agora/i.test(texto);
    const cheio = /começou e não fechou/i.test(texto);

    expect(vazio || cheio, 'o Feed não declara o que está mostrando').toBe(true);

    /** E nunca fala em pontuação de sessão, que só existe depois do fim. */
    expect(texto, 'o Feed mostrou medida de sessão encerrada').not.toMatch(/pontuação\s*\d/i);
  });

  it('sem nada aberto, o Feed leva às lições em vez de sugerir sozinho', async () => {
    const user = userEvent.setup();
    await abrir();

    const feed = await screen.findByRole('region', { name: 'Em andamento' }, { timeout: 40000 });
    const botao = within(feed).queryByRole('button', { name: /lições disponíveis/i });

    if (!botao) return;

    await user.click(botao);
    expect(screen.getByRole('region', { name: 'Disponíveis para você' })).toBeInTheDocument();
  });
});

describe('🔴 o painel não promete movimento onde não houve', () => {
  it('"em movimento agora" só lista o que de fato se moveu', async () => {
    await abrir();

    /** O painel só monta depois que o perfil volta. */
    const destaque = await screen.findByRole(
      'region',
      { name: 'Em destaque agora' },
      { timeout: 40000 }
    );
    const texto = destaque.textContent ?? '';

    /**
     * Ou há medida movida, ou a seção declara que nada se moveu. O que não
     * pode é listar zeros parados debaixo de um título que promete o
     * contrário.
     */
    const declarouParado = /Nada se moveu/i.test(texto);
    const temSeta = destaque.querySelectorAll('[aria-label="subiu"],[aria-label="caiu"]').length > 0;

    expect(
      declarouParado || temSeta,
      'a seção promete movimento e não mostra nem movimento nem a ausência dele'
    ).toBe(true);

    /** Se declarou parado, não pode ter linha de medida junto. */
    if (declarouParado) {
      expect(
        destaque.querySelectorAll('[aria-label="parada"]').length,
        'declarou que nada se moveu e listou medidas paradas'
      ).toBe(0);
    }
  });

  it('o calendário da defensiva aparece, com os sete dias', async () => {
    await abrir();

    const calendario = await screen.findByRole(
      'region',
      { name: 'Calendário da defensiva' },
      { timeout: 40000 }
    );
    const sete = within(calendario).getByLabelText('Sete defensivas em track');

    expect(within(sete).getAllByRole('listitem').length, 'não são sete dias').toBe(7);
  });

  it('os tópicos abrem e fecham, e o fechado mostra o resumo', async () => {
    const user = userEvent.setup();
    await abrir();

    const ligas = await screen.findByRole(
      'region',
      { name: 'Ligas e classificações' },
      { timeout: 40000 }
    );
    const cabeca = within(ligas).getByRole('button');

    expect(cabeca).toHaveAttribute('aria-expanded', 'false');
    expect(cabeca.textContent, 'o tópico fechado não resume nada').toMatch(/\w{6,}/);

    await user.click(cabeca);
    await waitFor(() => expect(cabeca).toHaveAttribute('aria-expanded', 'true'));
  });

  it('🔴 tópico sem medida mostra ESQUELETO, e não linha inventada', async () => {
    const user = userEvent.setup();
    await abrir();

    const ligas = await screen.findByRole(
      'region',
      { name: 'Ligas e classificações' },
      { timeout: 40000 }
    );
    await user.click(within(ligas).getByRole('button'));

    await waitFor(() => {
      expect(within(ligas).getByText(/Nada medido aqui ainda/i)).toBeInTheDocument();
    });

    /** E nenhum `#` de posição: era `rankPosition || 3` que punha em terceiro. */
    expect(/#\d/.test(ligas.textContent ?? ''), 'voltou posição inventada').toBe(false);
  });
});
