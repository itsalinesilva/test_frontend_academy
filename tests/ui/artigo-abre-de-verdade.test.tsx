// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from '../../src/ui/navigation/router';
import { AppRouterOutlet } from '../../src/ui/screens/AppRouterOutlet';
import { SEED_ARTICLES } from '../../src/data/seed-articles';

/**
 * 🔴 O ARTIGO NÃO ABRIA, E O MEU TESTE PASSAVA.
 *
 * A tabela de rotas tinha `/acervo/obra/:id` e `/acervo/compositor/:id`, e
 * **não tinha** `/acervo/artigo/:id`. O card navegava, o outlet reconhecia o
 * prefixo e montava a tela — e a tela não achava o artigo, porque `params.id`
 * vinha vazio: sem padrão na tabela, `parseParams` não tem contra o que casar.
 *
 * O sintoma era o pior possível: a tela abria, não quebrava, e dizia "artigo
 * não encontrado" sobre um artigo que estava ali.
 *
 * E o teste que eu tinha escrito **substituía o roteador** e entregava o `id`
 * na mão. Substituir a peça quebrada é a forma mais eficiente de não encontrar
 * o defeito dela.
 *
 * Este caso não substitui nada: monta o roteador de verdade, navega pela URL,
 * e exige que o artigo apareça.
 */

/**
 * O roteador navega por FRAGMENTO (`#/...`), e não por caminho.
 *
 * Escrever `pathname` num teste faria o caso medir uma forma de navegação que
 * a aplicação não usa — e passaria ou falharia por motivo errado.
 */
const irPara = (caminho: string) => {
  window.location.hash = `#${caminho}`;
};

const montar = () =>
  render(
    <RouterProvider>
      <AppRouterOutlet />
    </RouterProvider>
  );

beforeEach(() => {
  localStorage.clear();
  irPara('/');
});

describe('🔴 o artigo abre pela rota de verdade', () => {
  it.each(SEED_ARTICLES.map((a) => [a.id, a.titulo] as const))(
    'abre "%s" e mostra o título',
    async (id, titulo) => {
      irPara(`/acervo/artigo/${id}`);
      montar();

      await waitFor(
        () => {
          expect(
            screen.getByRole('heading', { name: titulo, level: 1 }),
            `"${titulo}" não abriu pela rota`
          ).toBeInTheDocument();
        },
        { timeout: 40000 }
      );

      /** E não pode dizer que não encontrou o que encontrou. */
      expect(screen.queryByText(/não encontrad/i)).toBeNull();
    }
  );

  it('as referências viram caminho: obras, pessoas e coletâneas', async () => {
    /**
     * Referência que não leva a lugar nenhum é citação de papel. Um artigo que
     * nomeia Chiquinha Gonzaga e não a liga obriga quem lê a sair dali e
     * procurar de novo, com o nome na memória.
     */
    const artigo = SEED_ARTICLES.find((a) => a.coletaneas.length > 0)!;
    irPara(`/acervo/artigo/${artigo.id}`);
    montar();

    /**
     * Uma espera só para os quatro títulos, e não quatro esperas em sequência.
     *
     * Encadeadas, cada `findBy` cobra o próprio tempo e a soma estourava o
     * limite do caso — sem que nada estivesse lento de verdade. O que se mede
     * é a tela chegar ao estado final, e ela chega de uma vez.
     */
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: artigo.titulo, level: 1 })).toBeInTheDocument();
        expect(
          screen.getByRole('heading', { name: /As obras que este artigo percorre/ })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('heading', { name: /As pessoas que este artigo percorre/ })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('heading', { name: /As coletâneas que este artigo percorre/ })
        ).toBeInTheDocument();
      },
      { timeout: 50000 }
    );
  });

  it('🔴 a coletânea ABERTA mostra o índice, e a fechada diz que não foi aberta', async () => {
    /**
     * Uma coletânea sem peças listadas não é uma coletânea vazia: é uma que
     * ninguém abriu ainda. As duas desenham igual — uma lista sem itens —, e
     * confundi-las declara ausência onde há trabalho por fazer.
     */
    const artigo = SEED_ARTICLES.find((a) => a.coletaneas.length > 0)!;
    irPara(`/acervo/artigo/${artigo.id}`);
    montar();

    await screen.findByRole('heading', { name: artigo.titulo, level: 1 }, { timeout: 40000 });

    await waitFor(
      () => expect(screen.getAllByText(/peças, todas catalogadas/).length).toBeGreaterThan(0),
      { timeout: 40000 }
    );

    /** São cinco abertas e quinze por abrir — e as duas contagens são ditas. */
    const abertas = screen.getAllByText(/peças, todas catalogadas/);
    expect(abertas.length, 'as cinco coletâneas abertas não apareceram').toBe(5);
    const inteira = abertas[0];

    expect(
      screen.getAllByText(/índice ainda não aberto/).length,
      'nenhuma coletânea por abrir foi declarada'
    ).toBeGreaterThan(0);

    /** E o índice da aberta traz as peças na ordem do volume. */
    const bloco = inteira.closest('li')!;
    expect(within(bloco).getByText(/Valsa sestrosa|Le campane della sera|Adoramus/)).toBeInTheDocument();
  });

  it('clicar no card da vitrine leva ao artigo', async () => {
    /** O caminho que a pessoa faz de verdade: entra no acervo e clica. */
    const user = userEvent.setup();
    irPara('/acervo');
    montar();

    const vitrine = await screen.findByRole(
      'region',
      { name: 'Artigos publicados' },
      { timeout: 40000 }
    );

    const primeiro = within(vitrine).getAllByRole('button').find((b) => /Ler o artigo/.test(b.textContent ?? ''))!;
    expect(primeiro, 'nenhum card de artigo na vitrine').toBeDefined();

    await user.click(primeiro);

    await waitFor(
      () => {
        expect(window.location.hash).toMatch(/^#\/acervo\/artigo\//);
      },
      { timeout: 40000 }
    );
  });
});
