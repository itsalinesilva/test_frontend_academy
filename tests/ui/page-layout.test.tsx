// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageLayout } from '../../src/ui/components/layout/PageLayout';

/**
 * Primeiro teste de componente do repositório.
 *
 * Até aqui era tecnicamente impossível: `vitest.config.ts` usava
 * `environment: 'node'` e não havia jsdom nem testing-library
 * (CLAUDE_AUDIT.md Q-02). Com a infraestrutura instalada, o critério de
 * aceite nº 10 dos wireframes — "tem teste de componente cobrindo os 5
 * estados" — passa a ser verificável.
 */

afterEach(cleanup);

const TABS = [
  { id: 'a', label: 'Visão Geral' },
  { id: 'b', label: 'Grade' },
];

describe('PageLayout — marcos de acessibilidade', () => {
  it('expõe um único <main id="main">, alvo do SkipLink', () => {
    const { container } = render(
      <PageLayout id="t" form="focus">
        <PageLayout.Main>conteúdo</PageLayout.Main>
      </PageLayout>
    );
    const mains = container.querySelectorAll('main');
    expect(mains).toHaveLength(1);
    expect(mains[0]).toHaveAttribute('id', 'main');
  });

  it('rotula o painel lateral como landmark de complemento', () => {
    render(
      <PageLayout id="t" form="catalog" asideLabel="Filtros">
        <PageLayout.Aside>facetas</PageLayout.Aside>
        <PageLayout.Main>resultados</PageLayout.Main>
      </PageLayout>
    );
    expect(screen.getByRole('complementary', { name: 'Filtros' })).toBeInTheDocument();
  });

  it('envolve o hero num <header> e as abas numa tablist', () => {
    const { container } = render(
      <PageLayout id="t" form="detail">
        <PageLayout.Hero>título</PageLayout.Hero>
        <PageLayout.Tabs id="tabs" tabs={TABS} activeTab="a" onChange={() => {}} />
        <PageLayout.Main>corpo</PageLayout.Main>
      </PageLayout>
    );
    expect(container.querySelector('header')).toBeInTheDocument();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });
});

describe('PageLayout — as 4 formas canônicas', () => {
  it('FOCUS limita a largura e não cria grade', () => {
    const { container } = render(
      <PageLayout id="t" form="focus">
        <PageLayout.Main>x</PageLayout.Main>
      </PageLayout>
    );
    expect(container.querySelector('[data-page-form="focus"]')).toBeInTheDocument();
    expect(container.querySelector('main')?.className).toContain('max-w-2xl');
    expect(container.querySelector('.lg\\:grid-cols-12')).toBeNull();
  });

  it('CATALOG coloca os filtros à ESQUERDA (col 1–3) e resultados em 4–12', () => {
    const { container } = render(
      <PageLayout id="t" form="catalog">
        <PageLayout.Aside>f</PageLayout.Aside>
        <PageLayout.Main>r</PageLayout.Main>
      </PageLayout>
    );
    expect(container.querySelector('aside')?.className).toContain('lg:col-span-3');
    expect(container.querySelector('aside')?.className).toContain('lg:order-1');
    expect(container.querySelector('main')?.className).toContain('lg:col-span-9');
  });

  it('DETAIL coloca o trilho à DIREITA (col 9–12) e o conteúdo em 1–8', () => {
    const { container } = render(
      <PageLayout id="t" form="detail">
        <PageLayout.Aside>trilho</PageLayout.Aside>
        <PageLayout.Main>corpo</PageLayout.Main>
      </PageLayout>
    );
    expect(container.querySelector('aside')?.className).toContain('lg:col-span-4');
    expect(container.querySelector('aside')?.className).toContain('lg:order-2');
    expect(container.querySelector('main')?.className).toContain('lg:col-span-8');
  });

  it('WORKSPACE ocupa a viewport e monta barra, painéis e transporte', () => {
    const { container } = render(
      <PageLayout id="t" form="workspace">
        <PageLayout.Toolbar>barra</PageLayout.Toolbar>
        <PageLayout.Panel>ferramentas</PageLayout.Panel>
        <PageLayout.Main>área</PageLayout.Main>
        <PageLayout.Inspector>inspetor</PageLayout.Inspector>
        <PageLayout.Transport>transporte</PageLayout.Transport>
      </PageLayout>
    );
    const root = container.querySelector('[data-page-form="workspace"]');
    expect(root?.className).toContain('h-[100dvh]');
    expect(screen.getByText('barra')).toBeInTheDocument();
    expect(screen.getByText('transporte')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Inspetor' })).toBeInTheDocument();
  });

  it('sem Aside, o conteúdo ocupa as 12 colunas', () => {
    const { container } = render(
      <PageLayout id="t" form="detail">
        <PageLayout.Main>corpo</PageLayout.Main>
      </PageLayout>
    );
    expect(container.querySelector('main')?.className).toContain('lg:col-span-12');
  });
});

describe('PageLayout — regiões fixas (sticky: hoje 0/72 telas)', () => {
  it('fixa a barra de abas abaixo do header, com fundo opaco', () => {
    const { container } = render(
      <PageLayout id="t" form="detail">
        <PageLayout.Tabs id="tabs" tabs={TABS} activeTab="a" onChange={() => {}} />
        <PageLayout.Main>x</PageLayout.Main>
      </PageLayout>
    );
    const bar = container.querySelector('.sticky.top-16');
    expect(bar).toBeInTheDocument();
    expect(bar?.className).toMatch(/bg-stone-50|backdrop-blur/);
  });

  it('fixa o trilho e o desloca para baixo quando há abas', () => {
    const { container: semAbas } = render(
      <PageLayout id="a" form="detail">
        <PageLayout.Aside>t</PageLayout.Aside>
        <PageLayout.Main>c</PageLayout.Main>
      </PageLayout>
    );
    expect(semAbas.querySelector('aside')?.className).toContain('lg:top-20');
    cleanup();

    const { container: comAbas } = render(
      <PageLayout id="b" form="detail">
        <PageLayout.Tabs id="tabs" tabs={TABS} activeTab="a" onChange={() => {}} />
        <PageLayout.Aside>t</PageLayout.Aside>
        <PageLayout.Main>c</PageLayout.Main>
      </PageLayout>
    );
    expect(comAbas.querySelector('aside')?.className).toContain('lg:top-32');
  });
});

describe('PageLayout — os 5 estados (hoje 0/72 telas cumprem o DoD)', () => {
  it('LOADING anuncia carregamento e usa esqueleto com a geometria da forma', () => {
    render(
      <PageLayout id="t" form="catalog" state="loading" loadingMessage="Carregando disciplinas…">
        <PageLayout.Main>não deve aparecer</PageLayout.Main>
      </PageLayout>
    );
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(within(status).getByText('Carregando disciplinas…')).toBeInTheDocument();
    expect(screen.queryByText('não deve aparecer')).not.toBeInTheDocument();
  });

  it('EMPTY exibe título, explicação e AÇÃO recomendada', async () => {
    const onAction = vi.fn();
    render(
      <PageLayout
        id="t"
        form="catalog"
        state="empty"
        emptyProps={{
          title: 'Nenhuma disciplina',
          description: 'Explore o catálogo para se matricular.',
          actionLabel: 'Ver catálogo',
          onAction,
        }}
      >
        <PageLayout.Main>oculto</PageLayout.Main>
      </PageLayout>
    );
    expect(screen.getByText('Nenhuma disciplina')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /ver catálogo/i }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('ERROR expõe a causa e oferece nova tentativa', async () => {
    const onRetry = vi.fn();
    render(
      <PageLayout id="t" form="detail" state="error" errorProps={{ message: 'Falha de rede.', onRetry }}>
        <PageLayout.Main>oculto</PageLayout.Main>
      </PageLayout>
    );
    expect(screen.getByText('Falha de rede.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /tentar novamente|repetir|tentar/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('LOCKED diz POR QUE está bloqueado e COMO desbloquear', () => {
    render(
      <PageLayout
        id="t"
        form="detail"
        state="locked"
        lockedProps={{
          title: 'Habilidade bloqueada',
          requirementText: 'Conclua a Lição 3 para liberar.',
          unlockActionLabel: 'Ir para a lição',
        }}
      >
        <PageLayout.Main>oculto</PageLayout.Main>
      </PageLayout>
    );
    expect(screen.getByText('Habilidade bloqueada')).toBeInTheDocument();
    expect(screen.getByText(/conclua a lição 3/i)).toBeInTheDocument();
  });

  it('CONTENT renderiza o conteúdo e nenhum estado substituto', () => {
    render(
      <PageLayout id="t" form="detail" state="content">
        <PageLayout.Main>conteúdo real</PageLayout.Main>
      </PageLayout>
    );
    expect(screen.getByText('conteúdo real')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('PageLayout — responsividade', () => {
  it('oferece acionador acessível para o painel lateral em telas estreitas', async () => {
    render(
      <PageLayout id="t" form="catalog" asideLabel="Filtros">
        <PageLayout.Aside>facetas</PageLayout.Aside>
        <PageLayout.Main>r</PageLayout.Main>
      </PageLayout>
    );
    const toggle = screen.getByRole('button', { name: /filtros/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 't-aside');

    await userEvent.click(toggle);
    expect(screen.getByRole('button', { name: /fechar/i })).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('PageLayout.Section', () => {
  it('associa o título à seção por aria-labelledby', () => {
    render(
      <PageLayout id="t" form="detail">
        <PageLayout.Main>
          <PageLayout.Section title="Grade curricular">itens</PageLayout.Section>
        </PageLayout.Main>
      </PageLayout>
    );
    expect(screen.getByRole('region', { name: 'Grade curricular' })).toBeInTheDocument();
  });
});
