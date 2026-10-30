// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from '../../src/ui/navigation/router';
import { AppRouterOutlet } from '../../src/ui/screens/AppRouterOutlet';

/**
 * O LABORATÓRIO — visitante e quem tem nome.
 *
 * 🔴 O QUE ESTES CASOS GUARDAM, E POR QUE CADA UM EXISTE
 * ------------------------------------------------------
 * A tela anterior era uma coluna com tudo despejado e **nenhuma navegação**:
 * nenhum marco de página, nenhuma região, nenhuma barra. Um leitor de tela
 * recebia vinte e cinco botões sem nome de seção.
 *
 * E tinha dois defeitos piores que a desorganização:
 *
 *   **medida pessoal para visitante** — "Ofensiva 0 Dias", "Meta Diária 0%" e
 *   "Liga Semanal" desenhavam para quem não tem nome;
 *
 *   **posição de liga inventada** — `rankPosition || 3` punha em **terceiro
 *   lugar** quem não estava em tabela nenhuma.
 *
 * O segundo é o que esta suíte persegue desde que apareceu Bach em primeiro
 * numa liga: número que a tela produz do nada, com cara de apurado.
 */

const montar = () =>
  render(
    <RouterProvider>
      <AppRouterOutlet />
    </RouterProvider>
  );

const abrirLaboratorio = async () => {
  window.location.hash = '#/practice';
  const r = montar();
  /**
   * A barra é o padrão da casa: abas com papel `tab`, rótulo e contagem. A
   * versão anterior desenhava cápsulas próprias com ícone — e uma tela que
   * inventa a própria barra obriga quem navega a reaprender o gesto.
   */
  await screen.findByRole('tab', { name: /Feed/ }, { timeout: 40000 });
  return r;
};

const aba = (nome: RegExp) => screen.getByRole('tab', { name: nome });

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('a tela tem estrutura, e a estrutura tem nome', () => {
  it('🔴 a barra é a PADRÃO da casa, e é a primeira coisa da tela', async () => {
    /**
     * Três abas, e não mais. E no padrão do resto do site — aba sublinhada com
     * contagem —, e não cápsulas próprias com ícone.
     *
     * 🔴 E **nada acima dela**. A versão anterior punha dois parágrafos antes
     * da barra: um explicando a tela, outro repetindo a pergunta da aba ativa.
     * A barra é o primeiro elemento do conteúdo, como na Academia e no Acervo.
     */
    const { container } = await abrirLaboratorio();

    const abas = screen.getAllByRole('tab');
    expect(abas.map((t) => (t.textContent ?? '').replace(/\d+$/, '').trim())).toEqual([
      'Feed',
      'Lições',
      'Práticas',
    ]);

    /**
     * Nada de texto próprio da tela antes da barra. O que vem antes dela no
     * documento é o cabeçalho do site e a trilha de navegação, que são do
     * container e não da tela.
     */
    const listaDeAbas = abas[0].closest('[role="tablist"]')!;
    const antes = container.textContent?.slice(0, container.textContent.indexOf('Feed')) ?? '';
    expect(listaDeAbas, 'as abas não formam uma lista de abas').not.toBeNull();
    expect(
      antes.includes('O que está aberto fica no'),
      'ainda há parágrafo de explicação acima da barra'
    ).toBe(false);
  });

  it('o painel lateral é região própria, e está em todas as abas', async () => {
    const user = userEvent.setup();
    await abrirLaboratorio();

    const painel = screen.getByRole('complementary', { name: 'Painel do laboratório' });
    expect(painel).toBeInTheDocument();

    for (const secao of [/Lições/, /Práticas/]) {
      await user.click(aba(secao));
      expect(
        screen.getByRole('complementary', { name: 'Painel do laboratório' }),
        `o painel sumiu em "${secao}"`
      ).toBeInTheDocument();
    }
  });

  it('trocar de aba troca o centro', async () => {
    const user = userEvent.setup();
    await abrirLaboratorio();

    await user.click(aba(/Práticas/));
    expect(screen.getByRole('region', { name: 'Mapa de práticas' })).toBeInTheDocument();

    await user.click(aba(/Lições/));
    expect(screen.getByRole('region', { name: 'Disponíveis para você' })).toBeInTheDocument();
  });
});

describe('🔴 o visitante NÃO vê medida de ninguém', () => {
  it('não há ofensiva, meta nem posição de liga', async () => {
    const { container } = await abrirLaboratorio();
    const texto = container.textContent ?? '';

    /**
     * `#3` era a posição inventada. Procurar o número cru é o que pega a
     * regressão: qualquer volta do `|| 3` reaparece assim.
     */
    expect(/#\d/.test(texto), 'apareceu posição de liga para visitante').toBe(false);

    expect(texto, 'ofensiva desenhada sem nome').not.toMatch(/Ofensiva\s*\d+\s*Dias/i);
    expect(texto, 'meta diária desenhada sem nome').not.toMatch(/Meta Di[áa]ria\s*\d+%/i);
  });

  it('🔴 o painel do visitante é o CONVITE, e não um quadro branco vazio', async () => {
    /**
     * O painel do visitante desenhava um cartão e, abaixo, um esqueleto de
     * calendário — que na tela virava **uma caixa branca sem nada dentro**.
     *
     * Esqueleto serve para dizer "isto está carregando" ou "esta é a forma da
     * tabela". Parado e sem contexto, é só espaço gasto — e é o espaço mais
     * valioso da tela.
     *
     * No lugar entra o convite padrão da casa: o que o espaço faz, com números
     * reais, e como se entra.
     */
    await abrirLaboratorio();

    const painel = screen.getByRole('complementary', { name: 'Painel do laboratório' });

    expect(within(painel).getByText(/vira treino medido/i)).toBeInTheDocument();
    expect(within(painel).getByRole('button', { name: /Entrar para medir/i })).toBeInTheDocument();

    /** E nenhum bloco decorativo vazio sobrando no painel. */
    const decorativos = [...painel.querySelectorAll('[aria-hidden="true"]')].filter(
      (e) => (e.textContent ?? '').trim() === '' && e.children.length > 3
    );
    expect(decorativos.length, 'sobrou esqueleto decorativo no painel do visitante').toBe(0);
  });

  it('o banner explica COMERCIALMENTE o que há no laboratório', async () => {
    /**
     * Quem chega de fora vê "Feed · Lições · Práticas" e não tem como adivinhar
     * que por trás disso há medição de afinação, histórico, liga e defensiva.
     */
    const { container } = await abrirLaboratorio();

    /**
     * Espera o banner, e não só a barra.
     *
     * Enquanto a árvore pública carrega, a tela mostra o estado de
     * carregamento — e ler o `textContent` aí devolve "Carregando o
     * laboratório…". O caso passava por sorte: a leitura chegava depois por
     * pouco, e passou a chegar antes quando o carregamento ganhou uma segunda
     * consulta.
     *
     * Asserção sobre texto de tela sem esperar a tela é teste de corrida, e
     * quem perde a corrida é quem for mexer no carregamento depois.
     */
    await screen.findByRole('region', { name: 'O que é o Laboratório' }, { timeout: 40000 });
    const texto = container.textContent ?? '';

    for (const assunto of [
      /árvores de competência|lições/i,
      /defensiva/i,
      /histórico|métricas/i,
      /ligas e classificações/i,
      /percursos/i,
      /habilidades/i,
    ]) {
      expect(assunto.test(texto), `o banner não fala de ${assunto}`).toBe(true);
    }
  });

  it('o Feed pede nome em vez de mostrar lista vazia de outra pessoa', async () => {
    await abrirLaboratorio();

    /** A região só monta depois que a árvore pública carrega. */
    const feed = await screen.findByRole('region', { name: 'Em andamento' }, { timeout: 40000 });
    expect(within(feed).getByText(/é registro de alguém/i)).toBeInTheDocument();
  });

  it('o que é PÚBLICO carrega mesmo sem nome', async () => {
    /**
     * 🔴 A tela anterior saía com `if (!userId) return;` antes de desligar o
     * carregamento, e o visitante ficava com esqueleto eterno — sem erro e sem
     * aviso. O que não depende de nome tem de chegar.
     */
    const user = userEvent.setup();
    await abrirLaboratorio();

    await user.click(aba(/Lições/));

    const secao = screen.getByRole('region', { name: 'Disponíveis para você' });
    await waitFor(() => {
      expect(
        within(secao).getAllByRole('button').length,
        'nenhuma competência pública carregou'
      ).toBeGreaterThan(0);
    });
  });
});

describe('🔴 Lições segue a ÁRVORE ACADÊMICA, e não tópicos soltos', () => {
  it('as cadeiras aparecem, com os cursos delas', async () => {
    /**
     * Aqui havia uma lista de árvores de competência — teoria, percepção,
     * ritmo — sem curso, sem módulo e sem ordem. Eram tópicos ao vento: quem
     * abria não sabia o que vinha antes nem a que curso aquilo pertencia.
     *
     * A estrutura acadêmica já existia inteira e ordenada. O Laboratório é que
     * a ignorava e inventava a própria — e duas organizações sobre o mesmo
     * conteúdo é pior que nenhuma.
     */
    const user = userEvent.setup();
    await abrirLaboratorio();
    await user.click(aba(/Lições/));

    const cadeiras = await waitFor(() => {
      const achadas = screen.getAllByRole('article');
      expect(achadas.length, 'nenhuma cadeira apareceu').toBeGreaterThan(0);
      return achadas;
    });

    /** Cada cadeira nomeia o Grêmio que abre o acompanhamento dela. */
    for (const c of cadeiras) {
      expect(c.textContent, 'cadeira sem Grêmio nomeado').toMatch(/Gr[êe]mio/i);
    }
  });

  it('🔴 os módulos são SEÇÕES NUMERADAS, em sequência', async () => {
    const user = userEvent.setup();
    await abrirLaboratorio();
    await user.click(aba(/Lições/));

    const curso = await waitFor(() => {
      const achado = screen
        .getAllByRole('button')
        .find((b) => /m[óo]dulos?\s*·/.test(b.textContent ?? ''));
      expect(achado, 'nenhum curso na árvore').toBeDefined();
      return achado!;
    });

    await user.click(curso);

    const secoes = await waitFor(() => {
      const achadas = screen.getAllByText(/Seção \d+ ·/);
      expect(achadas.length, 'o curso abriu sem seções').toBeGreaterThan(0);
      return achadas;
    });

    /** A numeração é sequência, e não campo cru: 1, 2, 3 — sem buraco. */
    const numeros = secoes
      .map((e) => Number((e.textContent ?? '').match(/Seção (\d+)/)?.[1]))
      .filter((n) => !Number.isNaN(n));

    expect(numeros.slice(0, 3), 'as seções não estão em sequência').toEqual([1, 2, 3]);
  });

  it('a ordem é SUGESTÃO: toda lição é clicável, inclusive fora de ordem', async () => {
    /**
     * Quem quiser começar pela vigésima da décima seção pode. O sistema não
     * bloqueia, e não deveria: adulto escolhe por onde entra. O que ele faz é
     * dizer onde aquilo fica.
     */
    const user = userEvent.setup();
    await abrirLaboratorio();
    await user.click(aba(/Lições/));

    const curso = await waitFor(() => {
      const achado = screen
        .getAllByRole('button')
        .find((b) => /m[óo]dulos?\s*·/.test(b.textContent ?? ''));
      return achado!;
    });
    await user.click(curso);

    await waitFor(() => expect(screen.getAllByText(/Seção \d+ ·/).length).toBeGreaterThan(2));

    /** Nenhuma lição desabilitada — o cadeado seria o oposto da regra. */
    const licoes = screen
      .getAllByRole('button')
      .filter((b) => /^\d+\.\d+/.test((b.textContent ?? '').trim()));

    expect(licoes.length, 'nenhuma lição clicável').toBeGreaterThan(3);
    expect(
      licoes.filter((b) => (b as HTMLButtonElement).disabled).length,
      'há lição bloqueada — a ordem é sugestão, não cadeado'
    ).toBe(0);
  });

  it('o curso anuncia por onde ele COMEÇA', async () => {
    const user = userEvent.setup();
    await abrirLaboratorio();
    await user.click(aba(/Lições/));

    const curso = await waitFor(() => {
      const achado = screen
        .getAllByRole('button')
        .find((b) => /m[óo]dulos?\s*·/.test(b.textContent ?? ''));
      return achado!;
    });

    expect(curso.textContent, 'o curso não diz por onde começar').toMatch(/come[çc]a em/i);
  });
});

describe('🔴 Práticas declara que o mapa NÃO é um mapa ainda', () => {
  it('diz o que falta em vez de chamar lista de mapa', async () => {
    /**
     * O mapa de práticas é um globo: forma geográfica, marcação por
     * compositor, régua de eras que repovoa as regiões. Isso não existe.
     *
     * Desenhar uma lista e chamá-la de mapa faria quem abre esperando um globo
     * concluir que a plataforma está quebrada — e estaria certo.
     */
    const user = userEvent.setup();
    await abrirLaboratorio();

    await user.click(aba(/Práticas/));

    const mapa = screen.getByRole('region', { name: 'Mapa de práticas' });
    expect(within(mapa).getByText(/globo ainda não foi construído/i)).toBeInTheDocument();

    /** E leva ao que existe, em vez de deixar quem lê sem saída. */
    expect(within(mapa).getByRole('button', { name: /Abrir o Atlas/i })).toBeInTheDocument();
  });
});
