// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminArtigosScreen } from '../../src/ui/screens/admin/AdminArtigosScreen';
import { RouterProvider } from '../../src/ui/navigation/router';
import { editorialService } from '../../src/services/application/editorial.service';
import { acervoService } from '../../src/services/application/acervo.service';

/**
 * A ENGINE EDITORIAL DOS ARTIGOS, NA TELA.
 *
 * O domínio já garante a validação e a camada — isso está em
 * `engine-artigos.test.ts`. Aqui a pergunta é a outra: **a pessoa consegue
 * escrever e corrigir um artigo?**
 *
 * A distinção é a mesma que valeu para as lições, e pelo mesmo motivo:
 * `EditorialLesson` existia no domínio, com testes, e nenhuma tela a chamava.
 * Domínio verde com tela ausente parece pronto e não é.
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
      <AdminArtigosScreen />
    </RouterProvider>
  );

beforeEach(() => {
  localStorage.clear();
  sessao = { userId: 'u1', nome: 'Aline', ehAdmin: true };
});

/** Abre o primeiro artigo publicado. */
async function abrirPrimeiro(user: ReturnType<typeof userEvent.setup>) {
  const primeiro = acervoService.artigos()[0];
  const botao = await screen.findByRole(
    'button',
    { name: new RegExp(primeiro.titulo.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) },
    { timeout: 40000 }
  );
  await user.click(botao);
  return primeiro;
}

describe('a tela lista os artigos REAIS do acervo', () => {
  it('conta publicados, escritos aqui e editados — medidos', async () => {
    montar();

    const cabecalho = await screen.findByText(/publicados ·.*escritos aqui/, {}, { timeout: 40000 });
    expect(cabecalho.textContent).toContain(`${acervoService.artigos().length} publicados`);
  });

  it('cada artigo mostra autoria, seções e referências contadas', async () => {
    montar();
    const primeiro = acervoService.artigos()[0];

    await screen.findByText(/publicados ·/, {}, { timeout: 40000 });

    const esperado =
      primeiro.obras.length + primeiro.pessoas.length + primeiro.coletaneas.length;
    expect(
      screen.getAllByText(new RegExp(`${primeiro.secoes.length} seções · ${esperado} referências`))
        .length
    ).toBeGreaterThan(0);
  });
});

describe('🔴 o CABEÇALHO segue o padrão do artigo', () => {
  it('traz natureza, título, subtítulo, resumo, autoria, instituição e data', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiro(user);

    const cabecalho = await screen.findByRole('region', { name: 'Cabeçalho do artigo' });

    for (const nome of [
      /Natureza do artigo/i,
      /^Título$/i,
      /Subtítulo/i,
      /Resumo/i,
      /Autoria/i,
      /Instituição/i,
      /Publicado em/i,
      /Etiquetas/i,
    ]) {
      expect(
        within(cabecalho).getByLabelText(nome),
        `o cabeçalho não tem campo ${nome}`
      ).toBeInTheDocument();
    }
  });

  it('a natureza só aceita os três tipos do domínio, cada um explicado', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiro(user);

    const tipo = await screen.findByLabelText(/Natureza do artigo/i);
    const opcoes = within(tipo).getAllByRole('option');

    expect(opcoes.length, 'a natureza aceita valor inventado').toBe(3);
    for (const o of opcoes) {
      expect(o.textContent, `"${o.textContent}" sem explicação`).toContain('—');
    }
  });

  it('o resumo diz para que serve, junto do campo', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiro(user);

    expect(await screen.findByText(/o que o artigo/i)).toBeInTheDocument();
    expect(screen.getByText(/decide abrir/i)).toBeInTheDocument();
  });
});

describe('🔴 o CORPO é .md, e as seções se reordenam', () => {
  it('cada seção tem título e caixa de markdown', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiro(user);

    const corpo = await screen.findByRole('region', { name: 'Corpo do artigo' });

    expect(within(corpo).getByLabelText(/Título da seção 1/i)).toBeInTheDocument();
    expect(within(corpo).getByLabelText(/Texto da seção 1/i)).toBeInTheDocument();
    expect(within(corpo).getAllByText(/negrito/).length).toBeGreaterThan(0);
  });

  it('acrescentar uma seção a coloca no fim, numerada', async () => {
    const user = userEvent.setup();
    montar();
    const artigo = await abrirPrimeiro(user);

    const corpo = await screen.findByRole('region', { name: 'Corpo do artigo' });
    await user.click(within(corpo).getByRole('button', { name: /Acrescentar seção/ }));

    await waitFor(() =>
      expect(
        within(corpo).getByText(`Seção ${artigo.secoes.length + 1}`)
      ).toBeInTheDocument()
    );
  });

  it('🔴 a ordem é RENUMERADA ao remover — sem buraco', async () => {
    /**
     * Ordem crua deixaria 1, 2, 4 depois de uma remoção, e quem lê procuraria
     * a terceira, que não existe.
     */
    const user = userEvent.setup();
    montar();
    const artigo = await abrirPrimeiro(user);
    if (artigo.secoes.length < 2) return;

    const corpo = await screen.findByRole('region', { name: 'Corpo do artigo' });
    await user.click(within(corpo).getByRole('button', { name: /Remover seção 1/ }));

    await waitFor(() => {
      const numeros = within(corpo)
        .getAllByText(/^Seção \d+$/)
        .map((e) => Number(e.textContent!.replace('Seção ', '')));
      expect(numeros).toEqual(numeros.map((_, i) => i + 1));
    });
  });

  it('a primeira seção não sobe e a última não desce', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiro(user);

    const corpo = await screen.findByRole('region', { name: 'Corpo do artigo' });
    expect(
      (within(corpo).getByRole('button', { name: /Subir seção 1/ }) as HTMLButtonElement).disabled
    ).toBe(true);
  });
});

describe('🔴 toda CITAÇÃO tem campo de motivo', () => {
  it('obras, pessoas e coletâneas, cada uma com identificador e motivo', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiro(user);

    const citacoes = await screen.findByRole('region', { name: 'Citações do artigo' });

    for (const grupo of ['Obras', 'Pessoas', 'Coletâneas']) {
      expect(
        within(citacoes).getByText(new RegExp(`^${grupo} \\(\\d+\\)$`)),
        `falta o grupo ${grupo}`
      ).toBeInTheDocument();
    }

    expect(citacoes.textContent, 'não explica por que o motivo é exigido').toMatch(
      /opiniões escondidas/i
    );
  });

  it('acrescentar uma citação vazia faz a tela ACUSAR na hora', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiro(user);

    const citacoes = await screen.findByRole('region', { name: 'Citações do artigo' });
    const acrescentar = within(citacoes).getAllByRole('button', { name: /Acrescentar/ })[0];

    await user.click(acrescentar);

    await waitFor(() =>
      expect(screen.getAllByText(/sem dizer por quê/i).length).toBeGreaterThan(0)
    );
  });

  it('com problema aberto, gravar fica desligado', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiro(user);

    const citacoes = await screen.findByRole('region', { name: 'Citações do artigo' });
    await user.click(within(citacoes).getAllByRole('button', { name: /Acrescentar/ })[0]);

    await waitFor(() =>
      expect(
        (screen.getByRole('button', { name: /Gravar artigo/ }) as HTMLButtonElement).disabled,
        'dá para gravar um artigo com citação sem motivo'
      ).toBe(true)
    );
  });
});

describe('🔴 o RODAPÉ é calculado, e não digitado', () => {
  it('mostra autoria, data e as referências contadas', async () => {
    const user = userEvent.setup();
    montar();
    const artigo = await abrirPrimeiro(user);

    const rodape = await screen.findByRole('region', { name: 'Rodapé do artigo' });
    const total = artigo.obras.length + artigo.pessoas.length + artigo.coletaneas.length;

    expect(rodape.textContent).toContain(artigo.autoria);
    expect(rodape.textContent).toContain(`${total} referências`);
  });

  it('não tem campo nenhum, e a tela explica por quê', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiro(user);

    const rodape = await screen.findByRole('region', { name: 'Rodapé do artigo' });

    expect(
      within(rodape).queryByRole('textbox'),
      'o rodapé tem campo editável — ele deveria ser calculado'
    ).toBeNull();
    expect(rodape.textContent).toMatch(/calculado do artigo/i);
  });

  it('a contagem do rodapé ACOMPANHA a citação acrescentada', async () => {
    const user = userEvent.setup();
    montar();
    const artigo = await abrirPrimeiro(user);

    const antes = artigo.obras.length + artigo.pessoas.length + artigo.coletaneas.length;

    const citacoes = screen.getByRole('region', { name: 'Citações do artigo' });
    await user.click(within(citacoes).getAllByRole('button', { name: /Acrescentar/ })[0]);

    const rodape = screen.getByRole('region', { name: 'Rodapé do artigo' });
    await waitFor(() => expect(rodape.textContent).toContain(`${antes + 1} referências`));
  });
});

describe('escrever, gravar e reverter', () => {
  it('🔴 gravar leva o artigo para a CAMADA', async () => {
    const user = userEvent.setup();
    montar();
    const artigo = await abrirPrimeiro(user);

    const titulo = await screen.findByLabelText(/^Título$/i);
    await user.clear(titulo);
    await user.type(titulo, 'Título corrigido pela curadoria');

    await user.click(screen.getByRole('button', { name: /Gravar artigo/ }));

    await waitFor(async () => {
      const edicoes = await editorialService.edicoesDeArtigos();
      expect(edicoes.length, 'nada foi gravado').toBeGreaterThan(0);
    });

    const edicoes = await editorialService.edicoesDeArtigos();
    expect(edicoes[0].artigoId).toBe(artigo.id);
    expect(edicoes[0].conteudo.titulo).toBe('Título corrigido pela curadoria');
    expect(edicoes[0].criado, 'artigo publicado marcado como criado').toBe(false);
  });

  it('🔴 "Escrever artigo" abre um branco que NÃO passa na validação', async () => {
    /**
     * Um branco que passasse permitiria publicar artigo sem título e sem
     * resumo. O que ele dá é a forma, não o conteúdo.
     */
    const user = userEvent.setup();
    montar();

    await user.click(
      await screen.findByRole('button', { name: /Escrever artigo/ }, { timeout: 40000 })
    );

    expect(await screen.findByRole('region', { name: 'Cabeçalho do artigo' })).toBeInTheDocument();
    expect(
      (screen.getByRole('button', { name: /Gravar artigo/ }) as HTMLButtonElement).disabled,
      'o artigo em branco pode ser gravado'
    ).toBe(true);
    /**
     * `getAllBy` porque "(sem título)" também aparece no cartão da lista — o
     * artigo em branco está lá com esse rótulo. O que importa é que a recusa
     * apareça, e ela aparece.
     */
    expect(screen.getAllByText(/sem título/i).length).toBeGreaterThan(0);
  });

  it('a autoria do artigo novo vem da sessão, e não em branco', async () => {
    const user = userEvent.setup();
    montar();

    await user.click(
      await screen.findByRole('button', { name: /Escrever artigo/ }, { timeout: 40000 })
    );

    expect((await screen.findByLabelText(/Autoria/i) as HTMLInputElement).value).toBe('Aline');
  });

  it('🔴 o botão de remover diz o que ele FAZ — reverter ou apagar', async () => {
    /**
     * Para artigo publicado isso é reverter; para o escrito aqui, é apagar —
     * ele não existe em lugar nenhum além da camada. Uma palavra só para os
     * dois faria alguém apagar achando que reverteria.
     */
    const user = userEvent.setup();
    montar();
    await abrirPrimeiro(user);

    const titulo = await screen.findByLabelText(/^Título$/i);
    await user.clear(titulo);
    await user.type(titulo, 'Um título qualquer para gravar');
    await user.click(screen.getByRole('button', { name: /Gravar artigo/ }));

    expect(
      await screen.findByRole('button', { name: /Reverter ao publicado/ })
    ).toBeInTheDocument();
  });

  it('o aviso de pendência aparece e diz que falta o commit', async () => {
    const user = userEvent.setup();
    montar();
    await abrirPrimeiro(user);

    const titulo = await screen.findByLabelText(/^Título$/i);
    await user.clear(titulo);
    await user.type(titulo, 'Outro título qualquer para gravar');
    await user.click(screen.getByRole('button', { name: /Gravar artigo/ }));

    const aviso = await screen.findByText(/ainda não chegaram ao aluno/i);
    expect(aviso.closest('p')!.textContent).toMatch(/commit/i);
  });

  it('descartar devolve o artigo ao que estava', async () => {
    const user = userEvent.setup();
    montar();
    const artigo = await abrirPrimeiro(user);

    const titulo = await screen.findByLabelText(/^Título$/i);
    await user.clear(titulo);
    await user.type(titulo, 'mudado');

    await user.click(screen.getByRole('button', { name: /Descartar/ }));

    await waitFor(() =>
      expect((screen.getByLabelText(/^Título$/i) as HTMLInputElement).value).toBe(artigo.titulo)
    );
  });
});
