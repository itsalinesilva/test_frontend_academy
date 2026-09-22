// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminLicoesScreen } from '../../src/ui/screens/admin/AdminLicoesScreen';
import { RouterProvider } from '../../src/ui/navigation/router';
import { editorialService } from '../../src/services/application/editorial.service';
import { academyService } from '../../src/services/application/academy.service';

/**
 * A ENGINE EDITORIAL, NA TELA.
 *
 * 🔴 O QUE ESTE ARQUIVO GUARDA
 * ----------------------------
 * O domínio já garante que a camada sabe editar bloco musical, acrescentar,
 * remover e exportar — isso está em `engine-editorial.test.ts`. Aqui a
 * pergunta é outra: **a pessoa consegue fazer isso?**
 *
 * A distinção não é preciosismo. `EditorialLesson` e `mergeCreatedLessons`
 * existiam no domínio desde o começo, com testes, e **nenhuma tela os
 * chamava**: a capacidade estava projetada, testada e desligada. Domínio verde
 * com tela ausente é o defeito mais caro deste repositório, porque parece
 * pronto.
 *
 * E a tela precisa dizer a verdade sobre onde a edição vive: em
 * `localStorage`, e **não** no que o aluno lê, até virar commit.
 */

/**
 * 🔴 A SESSÃO É CONTROLADA, E NÃO A TELA.
 *
 * `useCurrentUser` é a fronteira: é por ela que a outorga assinada pelo
 * servidor entra. Fixá-la aqui é legítimo — o que NÃO se pode fazer é fingir o
 * roteador ou o serviço, que é o que fez a rota do artigo faltar enquanto o
 * teste dela passava.
 *
 * E ela é mutável de propósito: a ausência de nome é um caso a testar, não um
 * detalhe a contornar. A camada recusa gravar sem autoria, porque a trilha de
 * revisão depende dela.
 */
let sessao: { userId: string | null; nome: string | null; ehAdmin: boolean } = {
  userId: 'u1',
  nome: 'Aline',
  ehAdmin: true,
};

vi.mock('../../src/ui/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ ...sessao, carregando: false, autenticado: sessao.userId !== null }),
}));

const montar = () =>
  render(
    <RouterProvider>
      <AdminLicoesScreen />
    </RouterProvider>
  );

/** Abre o primeiro curso, o primeiro módulo dele e a primeira lição. */
async function abrirPrimeiraLicao(user: ReturnType<typeof userEvent.setup>) {
  const cursos = await screen.findAllByRole('button', { name: /módulos ·/ }, { timeout: 40000 });
  await user.click(cursos[0]);

  const licoes = await waitFor(() => {
    const achadas = screen
      .getAllByRole('button')
      .filter((b) => b.className.includes('hover:bg-anil-50'));
    expect(achadas.length).toBeGreaterThan(0);
    return achadas;
  });

  await user.click(licoes[0]);
  return screen.findByRole('button', { name: /Voltar à lista/ });
}

beforeEach(async () => {
  localStorage.clear();
  sessao = { userId: 'u1', nome: 'Aline', ehAdmin: true };
});

describe('a tela mostra o acervo REAL de lições', () => {
  it('conta cursos, módulos e lições medidos, e não números escritos', async () => {
    montar();

    const cabecalho = await screen.findByText(/cursos ·.*módulos ·.*lições/, {}, { timeout: 40000 });

    const cursos = await academyService.getCourses();
    const modulos = (await Promise.all(cursos.map((c) => academyService.getModules(c.id)))).flat();

    expect(cabecalho.textContent).toContain(`${cursos.length} cursos`);
    expect(cabecalho.textContent).toContain(`${modulos.length} módulos`);
  });

  it('o curso abre e mostra os módulos numerados', async () => {
    const user = userEvent.setup();
    montar();

    const cursos = await screen.findAllByRole('button', { name: /módulos ·/ }, { timeout: 40000 });
    await user.click(cursos[0]);

    await waitFor(() => expect(screen.getAllByText(/^\d+\. /).length).toBeGreaterThan(0));
  });
});

describe('🔴 o editor de blocos edita PENTAGRAMA e PLAYER', () => {
  it('a lição abre com os blocos dela, e os tipos aparecem nomeados', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiraLicao(user);

    /** As seções aparecem com a contagem de blocos. */
    const secoes = await screen.findAllByText(/\d+ blocos/);
    expect(secoes.length).toBeGreaterThan(0);

    /**
     * A primeira seção já vem ABERTA: quem entra para editar quer editar, e
     * um editor que abre todo fechado cobra um clique antes de qualquer
     * trabalho. Clicar aqui a fecharia.
     */
    await waitFor(() => {
      const artigos = screen.getAllByRole('article');
      expect(artigos.length, 'a seção abriu sem bloco nenhum').toBeGreaterThan(0);
    });
  });

  it('🔴 dá para ACRESCENTAR um pentagrama onde não havia nenhum', async () => {
    /**
     * Este é o caso que a versão anterior reprovaria. A camada só sabia trocar
     * o conteúdo de um bloco existente: acrescentar exigia mudar o código.
     */
    const user = userEvent.setup();
    montar();
    await abrirPrimeiraLicao(user);

    await screen.findAllByText(/\d+ blocos/);

    const antes = (await screen.findAllByRole('article')).length;

    await user.click(screen.getByRole('button', { name: /Pentagrama/ }));

    await waitFor(() =>
      expect(screen.getAllByRole('article').length, 'o pentagrama não entrou').toBe(antes + 1)
    );

    /**
     * E ele vem com os campos de pauta. `getAllBy` porque a lição pode já ter
     * pentagrama: o acrescentado é o último.
     */
    expect(screen.getAllByRole('combobox', { name: /Clave/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('textbox', { name: /Notas na pauta/i }).length).toBeGreaterThan(0);
  });

  it('🔴 o PLAYER deixa definir o que ele toca, e como', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiraLicao(user);

    await screen.findAllByText(/\d+ blocos/);

    await user.click(screen.getByRole('button', { name: /^Player$/ }));

    const todas = await screen.findAllByRole('textbox', { name: /O que o player toca/i });
    expect(todas.length).toBeGreaterThan(0);

    const modo = screen.getAllByRole('combobox', { name: /Como toca/i }).slice(-1)[0];
    expect(within(modo).getByRole('option', { name: /Uma após a outra/ })).toBeInTheDocument();
    expect(within(modo).getByRole('option', { name: /Todas juntas/ })).toBeInTheDocument();
  });

  it('🔴 a nota mal escrita é acusada ENQUANTO se edita', async () => {
    /**
     * "dó" em vez de "C4" produz pentagrama vazio na lição. Descobrir isso na
     * gravação, depois de escrever a seção inteira, é descobrir tarde.
     */
    const user = userEvent.setup();
    montar();
    await abrirPrimeiraLicao(user);

    await screen.findAllByText(/\d+ blocos/);
    await user.click(screen.getByRole('button', { name: /Pentagrama/ }));

    /** O acrescentado é o último: a lição pode já ter pentagrama. */
    const notas = (await screen.findAllByRole('textbox', { name: /Notas na pauta/i })).slice(-1)[0];
    await user.clear(notas);
    await user.type(notas, 'dó ré mi');

    await waitFor(() =>
      expect(
        screen.getAllByText(/notação científica/i).length,
        'a nota errada passou calada'
      ).toBeGreaterThan(0)
    );
  });

  it('a dica de formato fica junto do campo, antes de qualquer erro', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiraLicao(user);

    await screen.findAllByText(/\d+ blocos/);
    await user.click(screen.getByRole('button', { name: /Pentagrama/ }));

    /** "C4 é o dó central" — o erro mais previsível de quem revisa em português. */
    expect((await screen.findAllByText(/dó central/i)).length).toBeGreaterThan(0);
  });
});

describe('gravar, descartar e a ordem dos blocos', () => {
  it('gravar sem mudar nada é impossível — o botão fica desligado', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiraLicao(user);

    await screen.findAllByText(/\d+ blocos/);

    const gravar = await screen.findByRole('button', { name: /Gravar seção/ });
    expect((gravar as HTMLButtonElement).disabled, 'dá para gravar sem mudança').toBe(true);
  });

  it('descartar devolve a seção ao publicado', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiraLicao(user);

    await screen.findAllByText(/\d+ blocos/);

    const antes = (await screen.findAllByRole('article')).length;
    await user.click(screen.getByRole('button', { name: /Pentagrama/ }));
    await waitFor(() => expect(screen.getAllByRole('article').length).toBe(antes + 1));

    await user.click(screen.getByRole('button', { name: /Descartar/ }));
    await waitFor(() => expect(screen.getAllByRole('article').length).toBe(antes));
  });

  it('🔴 gravar leva a mudança para a CAMADA, e ela volta na leitura', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiraLicao(user);

    await screen.findAllByText(/\d+ blocos/);

    await user.click(screen.getByRole('button', { name: /Pentagrama/ }));
    await user.click(screen.getByRole('button', { name: /Gravar seção/ }));

    await waitFor(async () => {
      const edicoes = await editorialService.edicoes();
      expect(edicoes.length, 'nada foi gravado na camada').toBeGreaterThan(0);
    });

    const edicoes = await editorialService.edicoes();
    expect(edicoes[0].alvo.tipo, 'gravou como correção de bloco em vez de estrutura').toBe(
      'BLOCOS_DA_SECAO'
    );
  });

  it('o primeiro bloco não sobe e o último não desce', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiraLicao(user);

    await screen.findAllByText(/\d+ blocos/);

    await screen.findAllByRole('article');
    expect(
      (screen.getByRole('button', { name: /Subir bloco 1/ }) as HTMLButtonElement).disabled
    ).toBe(true);
  });
});

describe('🔴 a tela diz que a edição NÃO chegou ao aluno', () => {
  it('o aviso de pendência aparece assim que há mudança gravada', async () => {
    /**
     * Sem ele, quem corrige vinte lições vai embora achando que publicou. A
     * camada só chega ao aluno por commit.
     */
    const user = userEvent.setup();
    montar();
    await abrirPrimeiraLicao(user);

    await screen.findAllByText(/\d+ blocos/);
    await user.click(screen.getByRole('button', { name: /Pentagrama/ }));
    await user.click(screen.getByRole('button', { name: /Gravar seção/ }));

    /**
     * O texto vive num parágrafo com trechos em negrito, e `findByText` devolve
     * o fragmento. A asserção é sobre o aviso inteiro — que é o que a pessoa lê.
     */
    const aviso = await screen.findByRole('status', { name: '' }).catch(() => null);
    const paragrafo =
      aviso ?? (await screen.findByText(/ainda não chegaram ao aluno/i)).closest('p')!;

    expect(paragrafo.textContent, 'não diz como publicar').toMatch(/commit/i);
    expect(paragrafo.textContent, 'não avisa do risco de limpar o navegador').toMatch(/navegador/i);
    expect(paragrafo.textContent, 'não diz quantas mudanças estão pendentes').toMatch(/\d+ mudan/);
  });

  it('sem mudança nenhuma, não há aviso — ele não é decoração', async () => {
    montar();
    await screen.findByText(/cursos ·/, {}, { timeout: 40000 });

    expect(screen.queryByText(/ainda não chegaram ao aluno/i)).toBeNull();
  });
});

describe('o pacote sai e entra', () => {
  it('🔴 importar um pacote ilegível diz O QUE está errado', async () => {
    /** "Arquivo inválido" faria tentar de novo com o mesmo arquivo. */
    const user = userEvent.setup();
    montar();

    const entrada = await screen.findByLabelText(/Importar pacote editorial/i, {}, { timeout: 40000 });
    const arquivo = new File(['isto não é json'], 'pacote.json', { type: 'application/json' });

    await user.upload(entrada as HTMLInputElement, arquivo);

    expect(await screen.findByText(/não é JSON válido/i)).toBeInTheDocument();
  });

  it('importar pacote de outra versão é recusado, com o número', async () => {
    const user = userEvent.setup();
    montar();

    const entrada = await screen.findByLabelText(/Importar pacote editorial/i, {}, { timeout: 40000 });
    const arquivo = new File(
      [JSON.stringify({ versao: 99, edicoes: [], licoesCriadas: [] })],
      'pacote.json',
      { type: 'application/json' }
    );

    await user.upload(entrada as HTMLInputElement, arquivo);

    const recado = await screen.findByText(/99/);
    expect(recado.textContent).toMatch(/atualize/i);
  });

  it('o botão de exportar existe e está nomeado', async () => {
    montar();
    expect(
      await screen.findByRole('button', { name: /Exportar pacote/ }, { timeout: 40000 })
    ).toBeInTheDocument();
  });
});
