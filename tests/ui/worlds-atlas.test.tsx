// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorldsAtlasScreen } from '../../src/ui/screens/worlds/WorldsAtlasScreen';

/**
 * O ATLAS NA TELA — e não só no domínio.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * ---------------------------
 * A verdade compartilhada entre mapa e biblioteca estava provada em catorze
 * casos **de serviço**: que `atlasService` lê o catálogo canônico, que a rota
 * do marcador aponta para a ficha certa, que as contagens batem.
 *
 * Nada disso provava o **clique**. A tela tinha sido reescrita inteira sem um
 * caso de interface, e "o marcador leva à ficha" estava garantido na rota que o
 * serviço devolve — não no que acontece quando alguém aperta.
 *
 * É a distinção entre a arquitetura estar correta e a implementação estar
 * completa, e ela já custou caro aqui: o sistema de facetas viveu meses no
 * serviço, testado, enquanto a tela montava filtro de lista fixa.
 *
 * O QUE ESTES CASOS GUARDAM
 * -------------------------
 *   o Atlas é MAPA — eixo do tempo, regiões que repovoam, marcadores;
 *   o marcador LEVA à ficha da biblioteca, pelo id canônico;
 *   nenhum controle muda um estado que ninguém lê;
 *   nada é cortado da lista em silêncio.
 */

const navegou = vi.fn();

vi.mock('../../src/ui/navigation/router', () => ({
  useRouter: () => ({
    navigate: navegou,
    params: {},
    currentPath: '/worlds',
    breadcrumbs: [],
    authorization: { authorized: true },
  }),
}));

const montar = () => render(<WorldsAtlasScreen />);

/**
 * O mapa carrega em duas etapas — era inicial, depois a vista.
 *
 * Consultar antes disso encontra o esqueleto do `ScreenContainer`, e o caso
 * falharia por pressa em vez de por defeito.
 */
const esperarOMapa = () => screen.findByRole('heading', { name: /Onde/ }, { timeout: 40000 });

beforeEach(() => {
  localStorage.clear();
  navegou.mockClear();
});

describe('o Atlas é um mapa', () => {
  it('abre com eixo do tempo, regiões e marcadores', async () => {
    montar();
    await esperarOMapa();

    /** As oito eras do curso, como caminho e não como lista de filtro. */
    const tempo = screen.getByRole('list', { name: 'Eras' });
    expect(within(tempo).getAllByRole('button').length).toBeGreaterThan(5);

    expect(screen.getByRole('group', { name: 'Filtrar por região' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Filtrar por Casa' })).toBeInTheDocument();
  });

  it('🔴 SEM FOCO a tela mostra PESSOAS, e não milhares de obras', async () => {
    /**
     * O domínio emitia toda obra como marcador — nove mil duzentos e quarenta
     * e cinco pontos no Romantismo. Um mapa com nove mil pontos é uma lista
     * desenhada sobre uma imagem.
     */
    montar();
    await esperarOMapa();

    await waitFor(() => expect(screen.getAllByText('Pessoa').length).toBeGreaterThan(0));
    expect(screen.queryAllByText('Obra')).toHaveLength(0);
  });

  it('o marcador traz a CONTAGEM do que reúne', async () => {
    /** "Bach" e "Bach · 838 obras" pedem decisões diferentes de quem explora. */
    montar();
    await esperarOMapa();

    await waitFor(() => {
      expect(screen.getAllByText(/\d+ obras/).length).toBeGreaterThan(0);
    });
  });

  it('andar no tempo troca o que o mapa mostra', async () => {
    const user = userEvent.setup();
    montar();
    await esperarOMapa();

    const tempo = screen.getByRole('list', { name: 'Eras' });
    const antes = within(tempo)
      .getAllByRole('button')
      .map((b) => b.textContent);

    const romantismo = within(tempo).getByRole('button', { name: /Romantismo/ });
    await user.click(romantismo);

    await waitFor(() => {
      expect(romantismo).toHaveAttribute('aria-current', 'true');
    });
    /** As eras continuam as mesmas; o que muda é onde se está. */
    expect(
      within(screen.getByRole('list', { name: 'Eras' }))
        .getAllByRole('button')
        .map((b) => b.textContent)
    ).toEqual(antes);
  });

  it('as setas do tempo ficam DESABILITADAS nas pontas', async () => {
    /** Seta que não anda é pior que seta ausente: parece tela travada. */
    const user = userEvent.setup();
    montar();
    await esperarOMapa();

    const tempo = screen.getByRole('list', { name: 'Eras' });
    await user.click(within(tempo).getAllByRole('button')[0]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Não há era anterior/ })).toBeDisabled();
    });
  });
});

describe('🔴 o marcador leva à ficha da biblioteca', () => {
  it('clicar numa PESSOA foca o mapa, e o link abre a ficha canônica', async () => {
    const user = userEvent.setup();
    montar();
    await esperarOMapa();

    await waitFor(() => expect(screen.getAllByText('Pessoa').length).toBeGreaterThan(0));

    const pessoa = screen.getAllByText('Pessoa')[0].closest('button')!;
    const nome = pessoa.querySelector('span')!.textContent!;
    await user.click(pessoa);

    /** Pessoa FOCA o mapa — é o zoom, e não a saída para a biblioteca. */
    const link = await screen.findByRole('button', {
      name: new RegExp(`Abrir a ficha completa de ${nome}`),
    });
    await user.click(link);

    expect(navegou).toHaveBeenCalledWith(expect.stringMatching(/^\/acervo\/compositor\//));
  });

  it('há caminho explícito do mapa para a biblioteca', async () => {
    const user = userEvent.setup();
    montar();
    await esperarOMapa();

    await user.click(screen.getByRole('button', { name: 'Abrir a biblioteca' }));
    expect(navegou).toHaveBeenCalledWith('/acervo');
  });
});

describe('nenhum controle muda um estado que ninguém lê', () => {
  it('🔴 a CASA recorta o mapa de verdade', async () => {
    /**
     * A seção existia e a seleção não recortava nada: um grupo de botões que
     * mudava um estado sem leitor. Controle que não faz nada é o defeito que
     * este projeto já removeu em outros lugares.
     */
    const user = userEvent.setup();
    montar();
    await esperarOMapa();

    /**
     * O mapa abre na primeira era com marcador — a Idade Média —, e ali não há
     * violinista. O caso precisa de uma era onde a Casa de fato recorte, senão
     * estaria medindo a ausência de dado e não o comportamento do controle.
     */
    const tempo = screen.getByRole('list', { name: 'Eras' });
    await user.click(within(tempo).getByRole('button', { name: /Romantismo/ }));

    const casas = screen.getByRole('group', { name: 'Filtrar por Casa' });
    await waitFor(() =>
      expect(within(casas).getByRole('button', { name: /Violinistas/ })).toBeEnabled()
    );

    const antes = screen.getAllByText('Pessoa').length;
    const violinistas = within(casas).getByRole('button', { name: /Violinistas/ });

    await user.click(violinistas);

    await waitFor(() => {
      expect(screen.getByText(/Mostrando só quem esta Casa reúne/)).toBeInTheDocument();
    });
    expect(screen.getAllByText('Pessoa').length).toBeLessThan(antes);
  });

  it('a Casa que NÃO recorta fica desabilitada, e diz por quê', async () => {
    /** Sumir com ela esconderia que o espaço existe; deixá-la clicável mentiria. */
    montar();
    await esperarOMapa();

    const casas = screen.getByRole('group', { name: 'Filtrar por Casa' });
    await waitFor(() => expect(within(casas).getAllByRole('button').length).toBeGreaterThan(3));

    const desabilitadas = within(casas)
      .getAllByRole('button')
      .filter((b) => (b as HTMLButtonElement).disabled);

    expect(desabilitadas.length, 'nenhuma Casa desabilitada — o caso não olharia nada').toBeGreaterThan(0);
    for (const b of desabilitadas) {
      expect(b.getAttribute('title'), `${b.textContent} não diz por que não recorta`).toBeTruthy();
    }
  });

  it('a região recorta, e volta a era inteira', async () => {
    const user = userEvent.setup();
    montar();
    await esperarOMapa();

    const regioes = screen.getByRole('group', { name: 'Filtrar por região' });
    const botoes = within(regioes).getAllByRole('button');
    expect(botoes.length).toBeGreaterThan(1);

    await user.click(botoes[1]);
    await waitFor(() => expect(botoes[1]).toHaveClass('bg-anil-800'));

    await user.click(within(regioes).getByRole('button', { name: 'Toda a era' }));
    await waitFor(() =>
      expect(within(regioes).getByRole('button', { name: 'Toda a era' })).toHaveClass('bg-anil-800')
    );
  });
});

describe('nada some da lista em silêncio', () => {
  it('o corte da lista se ANUNCIA, quando corta', async () => {
    /**
     * A versão anterior cortava em cento e vinte sem dizer. Hoje a maior era
     * tem noventa e cinco marcadores, então o corte só dispara em eras densas
     * — e quando disparar, a tela precisa declarar.
     */
    const user = userEvent.setup();
    montar();
    await esperarOMapa();

    const tempo = screen.getByRole('list', { name: 'Eras' });
    await user.click(within(tempo).getByRole('button', { name: /Romantismo/ }));

    await waitFor(() => expect(screen.getAllByText('Pessoa').length).toBeGreaterThan(0));

    const aviso = screen.queryByText(/mostrando \d+ de/);
    if (aviso) {
      /** Cortou: precisa oferecer o resto. */
      expect(screen.getByRole('button', { name: 'Mostrar mais' })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Mostrar mais' }));
      await waitFor(() => expect(screen.getAllByText('Pessoa').length).toBeGreaterThan(0));
    } else {
      /** Não cortou: então a lista mostra tudo, e nada está escondido. */
      expect(screen.queryByRole('button', { name: 'Mostrar mais' })).toBeNull();
    }
  });
});
