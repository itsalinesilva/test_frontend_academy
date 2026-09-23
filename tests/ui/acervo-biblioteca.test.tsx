// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AcervoScreen } from '../../src/ui/screens/acervo/AcervoScreen';
import { acervoService } from '../../src/services/application/acervo.service';

/**
 * A BIBLIOTECA OFICIAL — a produção desta escola, e não o catálogo do mundo.
 *
 * 🔴 O QUE FALTAVA
 * ----------------
 * Livros e artigos existiam no domínio, testados, e apareciam como **dois
 * cartões** no meio do catálogo, com os filtros do acervo todos misturados em
 * volta. A produção da escola ficava do tamanho de uma legenda.
 *
 * Agora é uma seção com vitrine própria: artigos e livros em carrosséis
 * paginados, com o que convence alguém a abrir — subtítulo, resumo, quem
 * assina, e quantas obras do acervo o texto percorre.
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

beforeEach(() => {
  localStorage.clear();
});

describe('a biblioteca é a primeira coisa que se vê', () => {
  it('a seção explica o que é produção própria', async () => {
    montar();
    await esperarTela();

    expect(screen.getByRole('heading', { name: 'A biblioteca oficial' })).toBeInTheDocument();
    expect(screen.getByText(/e não o que ele cataloga/i)).toBeInTheDocument();
  });

  it('há DUAS vitrines: artigos e livros', async () => {
    montar();
    await esperarTela();

    expect(screen.getByRole('region', { name: 'Artigos publicados' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Livros do Conservatório' })).toBeInTheDocument();
  });
});

describe('a vitrine de artigos mostra o que convence a abrir', () => {
  it('cada box traz tipo, título, resumo e assinatura', async () => {
    montar();
    await esperarTela();

    const vitrine = screen.getByRole('region', { name: 'Artigos publicados' });
    const boxes = within(vitrine).getAllByRole('listitem');
    expect(boxes.length).toBeGreaterThan(0);

    for (const box of boxes) {
      const texto = box.textContent ?? '';
      expect(texto, 'o box não diz o tipo do artigo').toMatch(
        /Auditoria|Percurso de estudo|Ensaio/
      );
      /** Quem assina e quando — um artigo sem autoria não é artigo. */
      expect(texto, 'o box não traz assinatura e ano').toMatch(/\d{4}/);
      /**
       * 🔴 A CONTAGEM PASSOU A SER POR TIPO, e o caso cobrava o rótulo antigo.
       *
       * O card dizia "22 obras citadas" sobre um artigo que percorre vinte
       * coletâneas, vinte pessoas e vinte e duas obras — contava um terço e
       * chamava de total.
       *
       * Agora ele lista os tipos que existem. O que se cobra é que **haja
       * contagem**, e que ela nomeie o que conta: "10 obras · 8 pessoas".
       */
      expect(texto, 'o box não diz quantas obras percorre').toMatch(/\d+ obras?\s/);
      expect(texto, 'a contagem não nomeia o que conta').toMatch(
        /\d+ (obras?|pessoas?|coletâneas?)/
      );
      /** Resumo de verdade, e não só o título. */
      expect(texto.length).toBeGreaterThan(120);
    }
  });

  it('a vitrine diz QUANTOS há no total, e não só os da página', async () => {
    montar();
    await esperarTela();

    const vitrine = screen.getByRole('region', { name: 'Artigos publicados' });
    expect(within(vitrine).getByText(/\d+ no total/)).toBeInTheDocument();
  });
});

describe('a vitrine de livros não esconde o que ainda não abriu', () => {
  it('o livro fechado aparece COM a contagem e COM o motivo', async () => {
    /**
     * Esconder o que existe e ainda não abriu daria a impressão de que a escola
     * produziu menos do que produziu. E o selo diz o ESTADO — "em curadoria" —
     * e não um prazo: "em breve" é promessa que ninguém assumiu.
     */
    montar();
    await esperarTela();

    const vitrine = screen.getByRole('region', { name: 'Livros do Conservatório' });
    const boxes = within(vitrine).getAllByRole('listitem');
    expect(boxes.length).toBeGreaterThan(0);

    const fechados = boxes.filter((b) => /em curadoria/.test(b.textContent ?? ''));
    expect(fechados.length, 'nenhum livro fechado — o caso não olharia nada').toBeGreaterThan(0);

    for (const box of fechados) {
      const texto = box.textContent ?? '';
      expect(texto, 'o livro fechado não conta capítulos').toMatch(/cap[íi]tulos?/);
      expect(texto, 'o livro fechado não conta questões').toMatch(/quest(ão|ões)/);
      expect(texto, 'o motivo ficou só num title').toMatch(/curadoria editorial/);
    }
  });

  it('capítulos e questões são CONTADOS do próprio material', async () => {
    const livros = acervoService.livros();
    expect(livros.length).toBeGreaterThan(0);
    for (const l of livros) {
      expect(l.capitulos, `${l.titulo} sem capítulos`).toBeGreaterThan(0);
      expect(l.questoes, `${l.titulo} sem questões`).toBeGreaterThan(0);
    }
  });
});

describe('o carrossel é paginado', () => {
  it('quando há mais do que cabe, há como andar', async () => {
    const user = userEvent.setup();
    montar();
    await esperarTela();

    const vitrine = screen.getByRole('region', { name: 'Livros do Conservatório' });
    const proxima = within(vitrine).queryByRole('button', {
      name: 'Próximos de Livros do Conservatório',
    });

    if (!proxima) {
      /** Não paginou: então mostra tudo, e nada está escondido. */
      expect(within(vitrine).getAllByRole('listitem').length).toBe(acervoService.livros().length);
      return;
    }

    const anteriores = within(vitrine).getByRole('button', {
      name: 'Anteriores de Livros do Conservatório',
    });
    expect(anteriores).toBeDisabled();

    await user.click(proxima);
    await waitFor(() => expect(anteriores).toBeEnabled(), { timeout: 40000 });
  });
});

describe('🔴 artigo não é obra de acervo', () => {
  it('nenhum artigo entra na contagem de obras', async () => {
    /**
     * O acervo artístico registra o que existe no mundo; a biblioteca oficial
     * registra o que esta escola produziu. Somar os dois faria a contagem do
     * acervo crescer com texto nosso.
     */
    const resumo = await acervoService.resumo();
    const artigos = acervoService.artigos();
    const obras = await acervoService.listar('OBRAS', {});

    expect(artigos.length).toBeGreaterThan(0);
    expect(obras.length).toBe(resumo.obras);
    for (const a of artigos) {
      expect(obras.some((o) => o.id === a.id), `${a.titulo} entrou no acervo`).toBe(false);
    }
  });

  it('cada artigo declara as obras que percorre, com motivo', async () => {
    for (const a of acervoService.artigos()) {
      expect(a.obras.length, `${a.titulo} não cita obra nenhuma`).toBeGreaterThan(0);
      for (const o of a.obras) {
        expect(o.motivo, `${a.titulo} cita ${o.obraId} sem motivo`).toBeTruthy();
      }
    }
  });
});
