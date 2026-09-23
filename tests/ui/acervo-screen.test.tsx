// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AcervoScreen } from '../../src/ui/screens/acervo/AcervoScreen';

/**
 * A TELA DO ACERVO — duas seções, e um funil em vez de um painel de controle.
 *
 * 🔴 O QUE ELA ERA
 * ----------------
 * Seis abas no mesmo nível — obras, pessoas, movimentos, biblioteca, artigos,
 * pendências —, **onze seletores de filtro lado a lado** sem ordem nem
 * hierarquia, uma busca, dois cartões soltos e a listagem. Tudo na mesma
 * altura visual, tudo competindo pela atenção.
 *
 * A biblioteca oficial, que é a produção desta escola, tinha virado dois
 * cartões perdidos no meio do catálogo do mundo.
 *
 * O QUE ESTES CASOS GUARDAM
 * -------------------------
 *   o banner diz o que a tela é, antes de qualquer filtro;
 *   há DUAS seções, e não seis;
 *   o funil fica FECHADO, e a busca não se repete dentro dele;
 *   as etapas são numeradas, e cada opção traz a contagem.
 */

vi.mock('../../src/ui/navigation/router', () => ({
  useRouter: () => ({ query: new URLSearchParams(),
    navigate: vi.fn(),
    params: {},
    currentPath: '/acervo',
    breadcrumbs: [],
    authorization: { authorized: true },
  }),
}));

const montar = () => render(<AcervoScreen />);

/** A tela carrega em duas etapas; antes disso há o esqueleto do container. */
/**
 * A espera é folgada de propósito.
 *
 * A tela carrega o catálogo antes de sair do esqueleto, e sob a suíte inteira
 * isso passa do segundo que o `findBy` espera por padrão. Um caso que falha
 * por pressa ensina a reexecutar em vez de ler — e aí o defeito de verdade
 * passa despercebido no meio dos falsos.
 */
const esperarTela = () =>
  screen.findByRole(
    'heading',
    { name: 'O Acervo do Conservatório' },
    { timeout: 40000 }
  );

/**
 * OS CARDS SÃO A NAVEGAÇÃO, e por isso os casos falam com eles.
 *
 * Havia duas fileiras de cápsulas — recortes e eras — embaixo dos cards que
 * contavam as mesmas coisas. Três linhas de controle antes da primeira obra.
 * Os cards absorveram as duas: contam e recortam.
 */
const cartaoDeRecorte = (rotulo: string) =>
  screen.getByText(rotulo).closest('button') as HTMLButtonElement;

/** O card da era, que não é recorte: é um par de setas que anda no tempo. */
const cartaoDaEra = () => screen.getByLabelText('Era anterior').closest('div')!.parentElement!;

const irParaOAcervo = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Acervo de compositores' }));
  return screen.findByRole('searchbox', { name: 'Buscar no acervo' }, { timeout: 40000 });
};

/** Só os cards da listagem — as etiquetas dentro deles também são `li`. */
const cards = () =>
  [...document.querySelectorAll('li')].filter((li) =>
    li.className.includes('border-stone-200 bg-white p-4')
  );

beforeEach(() => {
  localStorage.clear();
});

describe('o banner diz o que a tela é', () => {
  it('abre nomeando o acervo e o que ele oferece', async () => {
    montar();
    await esperarTela();

    /** A distinção que faltava: o que a escola produz e o que ela cataloga. */
    expect(screen.getByText(/o que esta escola escreve/i)).toBeInTheDocument();
    expect(screen.getByText(/o repertório que ela estuda/i)).toBeInTheDocument();
  });

  it('🔴 o banner do topo NÃO traz métrica', async () => {
    /**
     * As métricas viviam aqui e misturavam as duas seções — livros e artigos
     * ao lado de obras e pessoas. O banner apresenta as duas; o número pertence
     * à seção que ele conta.
     */
    montar();
    await esperarTela();

    expect(screen.queryByText('Obras catalogadas')).toBeNull();
  });

  it('as métricas são CONTADAS na seção do acervo, e nenhuma é zero', async () => {
    /**
     * Foi uma tela anunciando "142 obras canônicas" sobre um acervo de zero
     * que motivou metade das verificações deste projeto.
     */
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);

    /**
     * A busca é dentro do bloco de métricas, e não na tela toda: "Movimentos"
     * também é um recorte, e procurar solto acha os dois.
     */
    for (const rotulo of ['Obras catalogadas', 'Compositores', 'Obras disponíveis']) {
      const caixa = cartaoDeRecorte(rotulo);
      const valor = within(caixa).getByText(/^[\d.]+$/).textContent!;
      expect(Number(valor.replace(/\D/g, '')), `${rotulo} apareceu zerado`).toBeGreaterThan(0);
    }
  });

  it('🔴 a fila de resolucao NAO aparece para quem estuda', async () => {
    /**
     * Houve um recorte navegavel de edicoes sem obra, e depois um aviso
     * contando quantas eram. Os dois sairam pelo mesmo motivo: um numero que
     * quem le nao pode enderecar nao informa, atrapalha.
     *
     * A fila continua contada — em `resumo().naFilaDeResolucao`, que o
     * pente fino exige — e continua fora da tela.
     */
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);

    expect(screen.queryByText(/fila de resolu/i)).toBeNull();
    expect(screen.queryByText(/a resolver/i)).toBeNull();
  });
});

describe('🔴 há DUAS seções, e não seis', () => {
  it('a navbar tem exatamente Biblioteca e Acervo de compositores', async () => {
    montar();
    await esperarTela();

    const nav = screen.getByRole('navigation', { name: 'Seções do acervo' });
    expect(within(nav).getAllByRole('button').map((b) => b.textContent)).toEqual([
      'Biblioteca',
      'Acervo de compositores',
    ]);
  });

  it('abre na Biblioteca — a produção da escola vem primeiro', async () => {
    montar();
    await esperarTela();

    expect(screen.getByRole('heading', { name: 'A biblioteca oficial' })).toBeInTheDocument();
    /** O catálogo do mundo só aparece quando se pede por ele. */
    expect(screen.queryByRole('searchbox', { name: 'Buscar no acervo' })).toBeNull();
  });

  it('trocar de seção troca o que se vê', async () => {
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);

    expect(screen.getByRole('heading', { name: 'O acervo de compositores' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'A biblioteca oficial' })).toBeNull();
  });
});

describe('🔴 o funil fica fechado, e a tela fica limpa', () => {
  it('nenhum seletor de filtro aparece antes de abrir o funil', async () => {
    /** Eram onze caixas abertas disputando espaço com a listagem. */
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);

    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
    expect(screen.getByRole('button', { name: /Filtrar/ })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('abrir o funil mostra as etapas NUMERADAS', async () => {
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);

    await user.click(screen.getByRole('button', { name: /Filtrar/ }));
    await screen.findByText('Afunilar o acervo', {}, { timeout: 40000 });

    const lista = document.querySelector('#painel-do-funil ol')!;
    const etapas = [...lista.querySelectorAll(':scope > li')];

    expect(etapas.length, 'o funil abriu sem etapa nenhuma').toBeGreaterThan(1);
    for (const [i, li] of etapas.entries()) {
      expect(li.textContent, `a etapa ${i + 1} não traz número`).toMatch(/^\d/);
    }
  });

  it('🔴 a busca NÃO se repete dentro do funil', async () => {
    /**
     * A lupa fica no centro, acima da amostragem. Repeti-la dentro do painel
     * dava dois campos de busca na mesma tela, com o mesmo propósito.
     */
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);
    await user.click(screen.getByRole('button', { name: /Filtrar/ }));

    expect(screen.getAllByRole('searchbox')).toHaveLength(1);
  });

  it('toda opção do funil diz QUANTOS itens devolve', async () => {
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);
    await user.click(screen.getByRole('button', { name: /Filtrar/ }));

    const eixos = await screen.findAllByRole('combobox', {}, { timeout: 40000 });
    expect(eixos.length).toBeGreaterThan(1);

    const opcoes = [...(eixos[0] as HTMLSelectElement).options].filter(
      (o) => o.value !== '__todos__'
    );
    expect(opcoes.length).toBeGreaterThan(0);
    for (const o of opcoes) {
      expect(o.textContent, `"${o.textContent}" não traz contagem`).toMatch(/\(\d[\d.]*\)/);
    }
  });

  it('o botão de filtrar mostra QUANTOS recortes estão ativos', async () => {
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);
    await user.click(screen.getByRole('button', { name: /Filtrar/ }));

    const eixo = (await screen.findAllByRole('combobox', {}, { timeout: 40000 }))[0] as HTMLSelectElement;
    const alvo = [...eixo.options].find((o) => o.value !== '__todos__')!;
    await user.selectOptions(eixo, alvo.value);

    await waitFor(() => {
      /**
       * O contador vive num `span` dentro do botão, então o nome acessível
       * junta as duas partes sem espaço garantido. A afirmação é sobre o que
       * se lê, e não sobre como o navegador concatena.
       */
      const botao = screen.getByRole('button', { name: /Filtrar/ });
      expect(botao.textContent, 'o botão não diz quantos recortes estão ativos').toMatch(
        /Filtrar\s*1/
      );
    }, { timeout: 40000 });
  });

  it('o funil fecha no Escape', async () => {
    /** É painel, e não outra tela. */
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);
    await user.click(screen.getByRole('button', { name: /Filtrar/ }));

    await screen.findByText('Afunilar o acervo', {}, { timeout: 40000 });
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByText('Afunilar o acervo')).toBeNull(), { timeout: 40000 });
  });
});

describe('o que se procura é uma escolha, e não uma aba', () => {
  it('🔴 os CARDS recortam, e não há mais fileira de cápsulas', async () => {
    /**
     * Havia duas fileiras embaixo dos cards: uma de recortes, outra de eras,
     * repetindo em pastilha o que o número em cima já dizia. Três linhas de
     * controle antes da primeira obra.
     *
     * O número que conta e o botão que recorta são a mesma coisa: "31.874
     * obras" é o que a pessoa quer ver, e clicar nele é o gesto óbvio. Um card
     * que informa e não obedece é promessa não cumprida.
     */
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);

    expect(screen.queryByRole('list', { name: 'O que você procura' })).toBeNull();
    expect(screen.queryByRole('list', { name: 'Filtrar por era' })).toBeNull();

    for (const rotulo of ['Obras catalogadas', 'Compositores', 'Obras disponíveis']) {
      expect(cartaoDeRecorte(rotulo), `"${rotulo}" não é clicável`).toBeInstanceOf(
        HTMLButtonElement
      );
    }

    /**
     * 🔴 E ANTIGUIDADE DEIXOU DE SER CARD.
     *
     * Antiguidade é **era**, e não tipo de entidade — o mesmo erro de
     * categoria do Movimento. Os oito registros entraram como obras de
     * `era_antiguidade`, e os chevrons deste banner os alcançam.
     */
    expect(screen.queryByText('Antiguidade')).toBeNull();

    /**
     * 🔴 E MOVIMENTO DEIXOU DE SER RECORTE.
     *
     * Medido: seis movimentos alcançando 3.102 das 31.874 obras — 9,7% — e 11
     * dos 1.004 compositores. Um card com o mesmo peso de "Obras" promete o
     * mesmo peso e entrega um décimo. Virou filtro, dentro do funil.
     */
    expect(screen.queryByText('Movimentos')).toBeNull();

    expect(cartaoDeRecorte('Obras catalogadas')).toHaveAttribute('aria-current', 'true');
  });

  it('🔴 a ERA anda pelos dois chevrons, na ordem do tempo', async () => {
    /**
     * Movimento ocupava este card e alcança 9,7% do acervo. A era alcança 96%,
     * e é o eixo com que um catálogo musical se navega.
     *
     * Os chevrons, e não uma lista: as eras têm ORDEM — medieval vem antes de
     * barroco —, e cápsulas soltas descartavam essa ordem tratando-as como
     * sete rótulos. Duas setas andam nela, que é o gesto que corresponde ao
     * que o dado é.
     */
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);

    const voltar = await screen.findByLabelText('Era anterior', {}, { timeout: 40000 });
    const avancar = screen.getByLabelText('Era seguinte');

    /** Na ponta, a seta desliga: dar a volta faz quem navega perder onde está. */
    expect(voltar, 'sem era escolhida, voltar não deveria andar').toBeDisabled();
    expect(avancar).toBeEnabled();

    const antes = screen.getByText(/resultados?/).textContent;
    await user.click(avancar);

    /** Escolher a era tem de RECORTAR: filtro que não filtra é pior que nenhum. */
    await waitFor(() => {
      expect(screen.getByText(/resultados?/).textContent).not.toBe(antes);
    }, { timeout: 40000 });

    /** E o card passa a dizer em que era se está, e não mais "Era". */
    await waitFor(() => {
      expect(within(cartaoDaEra()).queryByText('Era')).toBeNull();
    }, { timeout: 40000 });

    expect(screen.getByLabelText('Era anterior'), 'andou, e voltar continua desligado').toBeEnabled();
  });

  it('trocar o alvo troca a listagem', async () => {
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);

    await user.click(cartaoDeRecorte('Compositores'));

    await waitFor(() => {
      expect(screen.getByText(/\d+ resultados?/)).toBeInTheDocument();
    }, { timeout: 40000 });
  });
});

describe('a listagem é paginada e o rosto aparece', () => {
  it('não despeja tudo de uma vez', async () => {
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);

    await waitFor(() => expect(cards().length).toBeGreaterThan(0), { timeout: 40000 });
    expect(cards().length).toBeLessThanOrEqual(24);
  });

  it('a pessoa mostra retrato ou iniciais SEM precisar clicar', async () => {
    /**
     * O retrato só aparecia depois de abrir a ficha. Uma lista de duzentas e
     * trinta e quatro pessoas sem rosto obriga a abrir uma por uma.
     */
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);

    await user.click(cartaoDeRecorte('Compositores'));

    await waitFor(() => expect(cards().length).toBeGreaterThan(0), { timeout: 40000 });
    const comRosto = cards().filter(
      (li) => li.querySelector('img') || li.querySelector('span[aria-hidden="true"]')
    );
    expect(comRosto.length).toBe(cards().length);
  });
});

describe('nada aqui promete o que não tem', () => {
  it('nenhum item fica com selo sem motivo escrito', async () => {
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);

    await waitFor(() => expect(cards().length).toBeGreaterThan(0), { timeout: 40000 });

    for (const card of cards()) {
      const texto = card.textContent ?? '';
      if (/Catalogado|Disponível para estudo/.test(texto)) {
        expect(texto.length, 'selo sem motivo por extenso').toBeGreaterThan(60);
      }
    }
  });

  it('🔴 o catalogo INTEIRO chega, e nao ha aviso de falha', async () => {
    /**
     * O QUE ESTE CASO SUBSTITUI, E POR QUE O ANTERIOR ERA UM PROBLEMA.
     *
     * Aqui se exigia o contrario: que o aviso de "o catalogo nao carregou"
     * APARECESSE, com a justificativa de que "no ambiente de teste nao ha
     * rede". Era verdade, e era exatamente o defeito: a suite inteira rodava
     * sobre as dezessete obras do repertorio proprio, e o caminho que carrega
     * as vinte e cinco mil nunca era percorrido por teste nenhum. O estado
     * degradado tinha virado o estado testado.
     *
     * O catalogo deixou de ser buscado por caminho e passou a ser importado
     * pelo empacotador. Agora o teste le o mesmo arquivo que o navegador le, e
     * o que se cobra e o certo: que ele chegue inteiro.
     */
    const user = userEvent.setup();
    montar();
    await esperarTela();
    await irParaOAcervo(user);

    expect(screen.queryByText('O catalogo completo nao carregou')).toBeNull();
    expect(screen.queryByText(/o catálogo completo não carregou/i)).toBeNull();

    const caixa = cartaoDeRecorte('Obras catalogadas');
    const obras = Number(within(caixa).getByText(/^[\d.]+$/).textContent!.replace(/\D/g, ''));

    /**
     * O piso e alto de proposito. Dezessete passaria por "carregou alguma
     * coisa" e e justamente o numero do acervo mutilado.
     */
    expect(obras, 'a tela caiu para o repertorio proprio').toBeGreaterThan(20000);
  });
});
