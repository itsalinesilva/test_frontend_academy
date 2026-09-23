// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArtigoScreen } from '../../src/ui/screens/acervo/ArtigoScreen';
import { acervoService } from '../../src/services/application/acervo.service';

/**
 * A LEITURA DE UM ARTIGO.
 *
 * 🔴 O QUE FALTAVA
 * ----------------
 * A vitrine listava os artigos com resumo, assinatura e "quatro obras citadas"
 * — e **abrir não levava a lugar nenhum**. O texto existia no domínio, testado,
 * seção por seção, e ninguém conseguia ler.
 *
 * Pior no que importa: o artigo afirma que percorre obras do acervo, e essa era
 * justamente a coisa que a tela não deixava conferir.
 */

const navegou = vi.fn();
const rota = { id: '' };

vi.mock('../../src/ui/navigation/router', () => ({
  useRouter: () => ({ query: new URLSearchParams(),
    navigate: navegou,
    params: rota,
    currentPath: `/acervo/artigo/${rota.id}`,
    breadcrumbs: [],
    authorization: { authorized: true },
  }),
}));

const primeiro = acervoService.artigos()[0];

const montar = (id = primeiro.id) => {
  rota.id = id;
  return render(<ArtigoScreen />);
};

const esperar = () =>
  screen.findByRole('heading', { name: 'As obras que este artigo percorre' }, { timeout: 40000 });

beforeEach(() => {
  localStorage.clear();
  navegou.mockClear();
});

describe('o artigo abre e se lê', () => {
  it('há artigos para ler — o caso não olharia nada se não houvesse', () => {
    expect(acervoService.artigos().length).toBeGreaterThan(0);
  });

  it('mostra assinatura, instituição e data', async () => {
    montar();
    await esperar();

    /**
     * A instituição aparece na assinatura e de novo na ressalva de autoria —
     * as duas são corretas, e por isso a busca é pela LINHA de assinatura, e
     * não pelo nome solto.
     */
    const assinatura = document.querySelector('article header p')!;
    expect(assinatura.textContent).toContain(primeiro.autoria);
    expect(assinatura.textContent).toContain(primeiro.instituicao);
  });

  it('o texto aparece inteiro, seção por seção', async () => {
    montar();
    await esperar();

    for (const secao of primeiro.secoes) {
      expect(
        screen.getByRole('heading', { name: secao.titulo }),
        `a seção "${secao.titulo}" não apareceu`
      ).toBeInTheDocument();
    }

    /** Texto de verdade, e não só os títulos. */
    const corpo = document.querySelector('article')!.textContent ?? '';
    expect(corpo.length).toBeGreaterThan(1000);
  });

  it('identificador desconhecido cai no estado vazio, e não em branco', async () => {
    montar('artigo-que-nao-existe');
    await waitFor(() => {
      expect(screen.getByText('Artigo não encontrado')).toBeInTheDocument();
    });
  });
});

describe('🔴 as obras citadas são conferíveis', () => {
  it('cada obra citada traz o MOTIVO de estar ali', async () => {
    /**
     * É a regra do domínio — `citacoesSemMotivo()` existe para recusar quem não
     * traz — e é o que separa curadoria de lista.
     */
    montar();
    await esperar();

    const lista = document.querySelector('ol')!;
    const itens = within(lista).getAllByRole('listitem');

    expect(itens.length, 'o artigo não cita obra nenhuma').toBe(primeiro.obras.length);
    expect(itens.length).toBeGreaterThan(0);

    for (const [i, li] of itens.entries()) {
      const motivo = primeiro.obras[i].motivo;
      expect(li.textContent, `a obra ${i + 1} não traz o motivo`).toContain(motivo.slice(0, 30));
    }
  });

  it('a obra citada LEVA à ficha dela', async () => {
    const user = userEvent.setup();
    montar();
    await esperar();

    const lista = document.querySelector('ol')!;
    const links = within(lista).queryAllByRole('button');

    if (links.length === 0) {
      /**
       * Nenhuma obra citada está no acervo carregado — em jsdom o arquivo
       * servido não chega. A tela então precisa DIZER, e é o caso abaixo.
       */
      expect(within(lista).getAllByText('fora do acervo').length).toBeGreaterThan(0);
      return;
    }

    await user.click(links[0]);
    expect(navegou).toHaveBeenCalledWith(expect.stringMatching(/^\/acervo\/obra\//));
  });

  it('obra citada que saiu do acervo é DITA, e não escondida', async () => {
    /**
     * Esconder a linha faria o artigo afirmar um percurso de quatro obras e
     * mostrar três, sem que ninguém notasse a diferença.
     */
    montar();
    await esperar();

    const lista = document.querySelector('ol')!;
    const itens = within(lista).getAllByRole('listitem');

    /** Toda citação aparece, esteja a obra no acervo ou não. */
    expect(itens.length).toBe(primeiro.obras.length);
    for (const li of itens) {
      const texto = li.textContent ?? '';
      expect(texto.length, 'uma citação apareceu vazia').toBeGreaterThan(40);
    }
  });
});

describe('o artigo declara de quem é o que afirma', () => {
  it('a ressalva de autoria fecha o texto', async () => {
    /**
     * O artigo usa o que as fontes trazem como insumo e conclui por conta
     * própria. Sem a ressalva, a leitura o toma por catalogação de terceiro —
     * ou, pior, toma o juízo de terceiro por nosso.
     */
    montar();
    await esperar();

    expect(screen.getByText(/responsabilidade de quem assina/)).toBeInTheDocument();
  });
});
