// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider } from '../../src/ui/navigation/router';
import { AppRouterOutlet } from '../../src/ui/screens/AppRouterOutlet';

/**
 * 🔴 A BUSCA DO CABEÇALHO LEVA O TERMO, E A TELA PRECISA RECEBÊ-LO.
 *
 * O campo do cabeçalho navega para `/search?q=termo`. O teste dele conferia
 * só a navegação — e ninguém conferia o outro lado: o outlet comparava o
 * caminho INTEIRO, com a consulta junto, e a tela de busca não lia o termo.
 *
 * Monta o roteador de verdade e navega pelo fragmento, como a aplicação faz.
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

describe('o termo chega à busca', () => {
  it('🔴 /search?q=… abre a busca global, e não a página de não encontrado', async () => {
    irPara('/search?q=harmonia');
    montar();
    expect(await screen.findByLabelText('Buscar em toda a plataforma', {}, { timeout: 20000 })).toHaveValue(
      'harmonia'
    );
  });

  it('🔴 /academia/search?q=… abre a busca da Academia com o termo', async () => {
    irPara('/academia/search?q=escala');
    montar();
    expect(await screen.findByLabelText('Buscar um conceito musical', {}, { timeout: 20000 })).toHaveValue(
      'escala'
    );
  });

  it('o endereço antigo /academia/search/results?q=… continua abrindo — agora a busca unificada', async () => {
    irPara('/academia/search/results?q=escala');
    montar();
    expect(await screen.findByLabelText('Buscar um conceito musical', {}, { timeout: 20000 })).toHaveValue(
      'escala'
    );
  });
});

describe('as outras navegações com consulta', () => {
  it('🔴 /auth/login?voltar=… abre o login, e não a página de não encontrado', async () => {
    irPara('/auth/login?voltar=%2Facademia%2Fcatalog');
    montar();
    expect(await screen.findByRole('heading', { level: 1 }, { timeout: 20000 })).toHaveAttribute('id', 'login-title');
    expect(screen.queryByText(/Página Não Encontrada/)).toBeNull();
  });

  it('/academia/course/X?modulo=Y abre o curso certo nas disciplinas, com a procurada aberta', async () => {
    const { SEED_COURSES, SEED_MODULES } = await import('../../src/data/seed-academy-content');
    const modulo = SEED_MODULES.find((m) => SEED_COURSES.some((c) => c.id === m.courseId))!;
    irPara(`/academia/course/${modulo.courseId}?modulo=${modulo.id}`);
    montar();

    const botao = await screen.findByRole(
      'button',
      { name: (nome: string) => nome.includes(modulo.title) },
      { timeout: 20000 }
    );
    expect(botao).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('separar caminho e consulta, e voltar depois de entrar', () => {
  it('separa, e o caminho sem consulta fica como estava', async () => {
    const { separarEndereco } = await import('../../src/ui/navigation/router');
    expect(separarEndereco('/search?q=bach')).toEqual({ caminho: '/search', consulta: 'q=bach' });
    expect(separarEndereco('/academia')).toEqual({ caminho: '/academia', consulta: '' });
    expect(separarEndereco('?x=1').caminho).toBe('/');
  });

  it('🔴 só volta para caminho INTERNO — nunca para outro site', async () => {
    const { destinoAposEntrar } = await import('../../src/ui/navigation/router');
    expect(destinoAposEntrar('/', '/academia/catalog')).toBe('/academia/catalog');
    expect(destinoAposEntrar('/', '//site-malicioso.com')).toBe('/');
    expect(destinoAposEntrar('/', 'https://site-malicioso.com')).toBe('/');
    expect(destinoAposEntrar('/', '/auth/login')).toBe('/');
    expect(destinoAposEntrar('/', null)).toBe('/');
  });

  it('quem não terminou o cadastro vai ao onboarding antes de voltar', async () => {
    const { destinoAposEntrar } = await import('../../src/ui/navigation/router');
    expect(destinoAposEntrar('/onboarding', '/academia/catalog')).toBe('/onboarding');
  });
});
