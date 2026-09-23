// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { acervoService } from '../../src/services/application/acervo.service';
import { CompositorScreen } from '../../src/ui/screens/acervo/CompositorScreen';
import { ObraScreen } from '../../src/ui/screens/acervo/ObraScreen';

/**
 * AS FICHAS DO ACERVO.
 *
 * É aqui que o "IMDB musical" ou se cumpre ou não: a ficha do compositor
 * precisa trazer quem foi, em que movimentos esteve e **o compêndio inteiro**;
 * a ficha da obra precisa dizer o que se pode fazer com ela — e as ações só
 * podem existir quando são reais.
 *
 * O caso que estes testes mais protegem é o do botão que não age. Oferecer
 * "tocar" numa obra sem edição renderizável seria a mesma mentira das telas
 * que abriam um alerta do navegador no lugar da ação.
 */

const navigate = vi.fn();
let paramId = 'bach-johann-sebastian';

vi.mock('../../src/ui/navigation/router', () => ({
  useRouter: () => ({ query: new URLSearchParams(),
    navigate,
    params: { id: paramId },
    currentPath: '/acervo',
    breadcrumbs: [],
    authorization: { authorized: true },
  }),
}));

beforeEach(() => {
  navigate.mockClear();
});

/**
 * 🔴 AS ESPERAS TÊM PRAZO EXPLÍCITO, e não o padrão de um segundo.
 *
 * Estas fichas leem o catálogo inteiro — mais de 5 MB de JSON. Numa máquina
 * ociosa isso cabe no prazo padrão de `waitFor`; com a suíte inteira rodando em
 * paralelo, ou com outro processo pesado na máquina, não cabe.
 *
 * Seis destes casos falharam exatamente assim: verdes isolados, vermelhos na
 * suíte completa. Teste que depende de a máquina estar livre não mede o
 * código — mede a máquina, e ensina a ignorar vermelho.
 */

describe('a ficha do compositor', () => {
  beforeEach(() => {
    paramId = 'bach-johann-sebastian';
  });

  it('traz a biografia escrita por nós', async () => {
    render(<CompositorScreen />);
    /**
     * Não é resumo de verbete nem tradução: é o que o Conservatório diz sobre
     * o compositor, no formato que deu ao próprio conteúdo.
     */
    /**
     * A espera e folgada porque a primeira ficha de cada arquivo de teste paga
     * a leitura do catalogo inteiro — cinco megabytes, vinte e cinco mil obras
     * — que antes nunca era paga, porque o `fetch` nao respondia em teste e a
     * suite rodava sobre dezessete obras.
     */
    await waitFor(
      () => expect(screen.getByText(/Levou a escrita a várias vozes/)).toBeInTheDocument(),
      { timeout: 40000 }
    );
  });

  it('traz as datas', async () => {
    render(<CompositorScreen />);
    await waitFor(() => expect(screen.getByText(/1685 – 1750/)).toBeInTheDocument(), {
      timeout: 40000,
    });
  });

  it('MOSTRA O RETRATO quando há — e nunca foto de banco', async () => {
    /**
     * Já houve aqui um avatar de docente tirado de banco genérico. Inventar a
     * aparência de uma pessoa real é pior que não ter foto.
     *
     * Este caso afirmava que Bach NÃO tinha retrato — e era verdade enquanto
     * ele vivia partido em dois registros: a biografia autoral num, o retrato
     * e as obras noutro. A fusão de identidade juntou os dois, e a premissa
     * caiu com ela.
     *
     * O que permanece é a regra: retrato de verdade, ou iniciais. Nunca banco.
     */
    render(<CompositorScreen />);
    await waitFor(() => expect(screen.getByText(/Levou a escrita/)).toBeInTheDocument(), {
      timeout: 40000,
    });

    const retrato = document.querySelector('img[alt^="Retrato"]');
    if (retrato) {
      /** A fonte da imagem é o acervo de imagens livres, e não um banco. */
      expect(retrato.getAttribute('src')).toMatch(/commons\.wikimedia\.org/);
    } else {
      expect(screen.getByText('JS')).toBeInTheDocument();
    }
  });

  it('lista os movimentos que ele ajudou a definir, com descrição', async () => {
    render(<CompositorScreen />);
    await waitFor(() => expect(screen.getByText('Contraponto tardio')).toBeInTheDocument(), { timeout: 40000 });
    expect(screen.getByText(/baixo contínuo tinha aberto/)).toBeInTheDocument();
  });

  it('TRAZ O COMPÊNDIO COMPLETO DE OBRAS', async () => {
    /**
     * Sem recorte de disponibilidade: um catálogo que listasse só o que toca
     * esconderia metade da obra de quem veio consultar.
     */
    render(<CompositorScreen />);
    await waitFor(() => expect(screen.getByText('Compêndio de obras')).toBeInTheDocument(), { timeout: 40000 });

    const obras = screen.getAllByText(/Disponível para estudo|Catalogada/);
    expect(obras.length).toBeGreaterThan(1);
  });

  it('cada obra do compêndio abre a ficha dela', async () => {
    const user = userEvent.setup();
    render(<CompositorScreen />);
    await waitFor(() => expect(screen.getByText('Compêndio de obras')).toBeInTheDocument(), { timeout: 40000 });

    await user.click(screen.getByText(/Prelúdio em dó maior/));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/acervo/obra/'));
  });

  it('compositor inexistente mostra o vazio, e não uma ficha em branco', async () => {
    paramId = 'nao-existe-ninguem';
    render(<CompositorScreen />);
    await waitFor(
      () => expect(screen.getByText(/Compositor não encontrado/)).toBeInTheDocument(),
      { timeout: 40000 }
    );
  });
});

describe('a ficha da obra', () => {
  beforeEach(() => {
    paramId = 'obra-bar-bach-prelude';
  });

  it('traz a ficha com compositor, era e gênero', async () => {
    render(<ObraScreen />);
    await waitFor(() => expect(screen.getByText('Ficha')).toBeInTheDocument(), { timeout: 40000 });

    // O nome aparece no subtítulo E na ficha; os dois são corretos.
    expect(screen.getAllByText('Johann Sebastian Bach').length).toBeGreaterThan(0);
    expect(screen.getByText('era_barroco')).toBeInTheDocument();
    expect(screen.getByText('preludio')).toBeInTheDocument();
  });

  it('OFERECE AS TRÊS AÇÕES quando há edição renderizável', async () => {
    render(<ObraScreen />);
    await waitFor(() => expect(screen.getByRole('button', { name: /Tocar/ })).toBeInTheDocument(), { timeout: 40000 });

    expect(screen.getByRole('button', { name: /Abrir na partitura/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Levar à prática/ })).toBeInTheDocument();
  });

  it('levar à partitura e à prática navega carregando a obra', async () => {
    const user = userEvent.setup();
    render(<ObraScreen />);
    await waitFor(() => expect(screen.getByRole('button', { name: /Abrir na partitura/ })).toBeInTheDocument(), { timeout: 40000 });

    await user.click(screen.getByRole('button', { name: /Abrir na partitura/ }));
    expect(navigate).toHaveBeenCalledWith('/score?obra=obra-bar-bach-prelude');

    await user.click(screen.getByRole('button', { name: /Levar à prática/ }));
    expect(navigate).toHaveBeenCalledWith('/practice?obra=obra-bar-bach-prelude');
  });

  it('declara a licença do ARQUIVO e quem editorou', async () => {
    /**
     * Atribuição por peça é requisito, e não cortesia: a licença do arquivo é
     * distinta do domínio público da obra.
     */
    render(<ObraScreen />);
    await waitFor(() => expect(screen.getByText('Edição')).toBeInTheDocument(), { timeout: 40000 });

    expect(screen.getByText(/Transcrição própria do Conservatório/)).toBeInTheDocument();
  });

  it('leva à ficha do compositor', async () => {
    const user = userEvent.setup();
    render(<ObraScreen />);
    await waitFor(() => expect(screen.getByText(/Ver a ficha de/)).toBeInTheDocument(), { timeout: 40000 });

    await user.click(screen.getByText(/Ver a ficha de/));
    /**
     * O identificador é o CANÔNICO, e não o do repositório próprio.
     *
     * Nove compositores viviam duplicados entre as duas fontes; a fusão elegeu
     * o identificador externo, porque é para ele que as vinte e cinco mil obras
     * apontam. O antigo continua chegando — há caso para isso —, mas o link
     * que a tela gera é o novo.
     */
    expect(navigate).toHaveBeenCalledWith('/acervo/compositor/johann-sebastian-bach');
  });

  it('🔴 o identificador ANTIGO continua abrindo a ficha', async () => {
    /**
     * Um link salvo com `bach-johann-sebastian` não pode virar "não
     * encontrado": a pessoa existe, e a página existe. E precisa trazer o
     * compêndio — a primeira correção resolvia o compositor e deixava o filtro
     * de obras com o id cru, o que mostrava **zero obras** sobre quem tem
     * novecentas e setenta e oito.
     */
    const pelaAntiga = await acervoService.fichaDoCompositor('bach-johann-sebastian');
    const pelaNova = await acervoService.fichaDoCompositor('johann-sebastian-bach');

    expect(pelaAntiga, 'o identificador antigo deixou de abrir').not.toBeNull();
    expect(pelaAntiga!.compositor.id).toBe('johann-sebastian-bach');
    expect(pelaAntiga!.obras.length).toBe(pelaNova!.obras.length);
    expect(pelaAntiga!.obras.length).toBeGreaterThan(0);
  });

  it('obra inexistente mostra o vazio', async () => {
    paramId = 'obra-que-nao-existe';
    render(<ObraScreen />);
    await waitFor(() => expect(screen.getByText(/Obra não encontrada/)).toBeInTheDocument(), { timeout: 40000 });
  });
});
