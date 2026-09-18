// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { CourseCard } from '../../src/ui/components/domain/CourseCard';
import { Carrossel } from '../../src/ui/components/layout/Carrossel';
import { SEED_COURSES, SEED_PROGRAMS, SEED_PATHS } from '../../src/data/seed-academy-content';
import { REPERTORIO_DO_PLAYER, hz } from '../../src/data/seed-player-repertoire';

const raiz = resolve(__dirname, '../..');
const ler = (p: string) => readFileSync(resolve(raiz, p), 'utf-8');
/** O mesmo arquivo sem comentários: o que sobra é o que chega à tela. */
const lerCodigo = (p: string) =>
  ler(p)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');

afterEach(cleanup);

/**
 * Estes testes guardam decisões de interface que foram tomadas depois de a
 * plataforma ser inspecionada tela a tela. Cada um existe porque a coisa que
 * ele proíbe estava lá.
 */

describe('o shell tem um header, e um só', () => {
  it('não existe mais uma segunda barra de navegação', () => {
    // Havia duas: a institucional escura e, abaixo, uma branca repetindo os
    // pilares, a marca e uma sub-barra rotulada "Sub-rotas".
    expect(existsSync(resolve(raiz, 'src/ui/components/layout/Navigation.tsx'))).toBe(false);
  });

  it('o AppShell monta apenas o Header', () => {
    const shell = ler('src/ui/components/layout/AppShell.tsx');
    expect(shell).not.toContain('<Navigation');
    expect(shell.match(/<Header\b/g) ?? []).toHaveLength(1);
  });

  it('a palavra "Sub-rotas" não aparece em lugar nenhum da interface', () => {
    const shell = lerCodigo('src/ui/components/layout/AppShell.tsx');
    const header = lerCodigo('src/ui/components/layout/Header.tsx');
    expect(`${shell}${header}`).not.toContain('Sub-rotas');
  });

  it('a marca da plataforma é escrita uma vez no header', () => {
    const header = lerCodigo('src/ui/components/layout/Header.tsx');
    expect(header.match(/Conservatório Muscicapa/g) ?? []).toHaveLength(1);
  });

  it('as rotas ficam fechadas atrás de um chevron, não expostas em barra', () => {
    const menu = ler('src/ui/components/layout/NavMenu.tsx');
    expect(menu).toContain('ChevronDown');
    expect(menu).toContain('onMouseEnter');
    expect(menu).toContain('aria-expanded');
  });

  it('a busca do header é uma lupa que expande, sem rótulo escrito', () => {
    const busca = ler('src/ui/components/layout/HeaderSearch.tsx');
    expect(busca).toContain('Search');
    expect(busca).not.toContain('Buscar...');
    expect(busca).not.toContain('placeholder="Buscar');
  });
});

describe('a tela de "visão geral" da raiz foi removida', () => {
  it('o arquivo não existe', () => {
    expect(existsSync(resolve(raiz, 'src/ui/screens/overview/OverviewScreen.tsx'))).toBe(false);
  });

  it('a raiz abre o Academy', () => {
    const outlet = lerCodigo('src/ui/screens/AppRouterOutlet.tsx');
    // ProfileOverviewScreen e outra tela e continua existindo; o que sumiu e
    // a tela de raiz, importada de `overview/`.
    expect(outlet).not.toContain("overview/OverviewScreen");
    expect(outlet).not.toMatch(/<OverviewScreen\s*\/>/);
    expect(outlet).toMatch(/currentPath === '\/'[\s\S]{0,200}<AcademyHomeScreen/);
  });
});

describe('o catálogo só contém o que existe', () => {
  it('nenhum curso fabricado sobrou', () => {
    for (const c of SEED_COURSES) {
      expect(c.id).not.toMatch(/^crs_fomt_|^crs_contraponto_/);
      expect(c.authorId).not.toBe('usr_founder_1');
    }
  });

  it('nenhum docente inventado assina curso', () => {
    // Havia uma pianista morta em 1896 listada como docente, com foto de
    // banco de imagens. Curso do Conservatório é assinado pelo Conservatório.
    for (const c of SEED_COURSES) {
      expect(c.authorName).toBe('Conservatório Muscicapa');
      expect(c.authorAvatarUrl ?? '').not.toContain('unsplash');
    }
  });

  it('programas são combinações de cursos, e não existem sem cursos que combinar', () => {
    if (SEED_COURSES.length < 2) {
      expect(SEED_PROGRAMS).toHaveLength(0);
      expect(SEED_PATHS).toHaveLength(0);
    } else {
      for (const p of SEED_PROGRAMS) expect(p.pathIds.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('toda disciplina pertence a um curso publicado', async () => {
    const { SEED_MODULES } = await import('../../src/data/seed-academy-content');
    const ids = new Set(SEED_COURSES.map((c) => c.id));
    for (const m of SEED_MODULES) expect(ids.has(m.courseId)).toBe(true);
  });
});

describe('cartão de curso', () => {
  const base = {
    id: 'cc',
    title: 'Teoria da Música',
    description: 'Do som à notação contemporânea.',
    instructorName: 'Conservatório Muscicapa',
    level: 'FUNDAMENTAL',
    durationHours: 35,
    modulesCount: 58,
    onActionClick: () => {},
  };

  it('não desenha contorno em volta', () => {
    const { container } = render(<CourseCard {...base} />);
    const cartao = container.querySelector('#cc')!;
    expect(cartao.className).not.toMatch(/\bborder\b/);
    expect(cartao.className).not.toMatch(/border-stone-200/);
  });

  it('a ação é um ícone, não uma frase dentro de um botão largo', () => {
    render(<CourseCard {...base} />);
    const acao = document.querySelector('#cc-open')!;
    expect(acao.textContent).toBe('');
    expect(acao.className).toContain('rounded-full');
    expect(screen.queryByText(/Matricular-se no Curso/i)).toBeNull();
    expect(screen.queryByText(/Continuar Curso/i)).toBeNull();
  });

  it('clicar no corpo abre a lista de disciplinas ali mesmo', async () => {
    const u = userEvent.setup();
    render(<CourseCard {...base} moduleTitles={['I. Som', 'II. Pauta', 'III. Claves']} />);

    expect(screen.queryByText('II. Pauta')).toBeNull();
    await u.click(screen.getByText('Teoria da Música'));
    expect(screen.getByText('II. Pauta')).toBeTruthy();

    await u.click(screen.getByText('Teoria da Música'));
    expect(screen.queryByText('II. Pauta')).toBeNull();
  });

  it('sem disciplinas para mostrar, o corpo não finge ser clicável', () => {
    render(<CourseCard {...base} />);
    const corpo = screen.getByText('Teoria da Música').closest('button')!;
    expect(corpo.hasAttribute('disabled')).toBe(true);
  });
});

describe('carrossel', () => {
  it('não mostra controles quando tudo cabe numa página', () => {
    render(
      <Carrossel id="c1" label="teste" porPagina={3}>
        {[<div key="a">a</div>, <div key="b">b</div>]}
      </Carrossel>
    );
    expect(screen.queryByLabelText('Próxima página')).toBeNull();
  });

  it('pagina quando há mais itens do que cabem', () => {
    // jsdom reporta 1024px de largura, logo `porPagina` vale integralmente.
    render(
      <Carrossel id="c2" label="teste" porPagina={2}>
        {['a', 'b', 'c'].map((k) => (
          <div key={k}>{k}</div>
        ))}
      </Carrossel>
    );
    expect(screen.getByLabelText('Próxima página')).toBeTruthy();
    expect(screen.queryByText('c')).toBeNull();
  });
});

describe('repertório do player', () => {
  it('tem muito mais que as cinco faixas originais', () => {
    expect(REPERTORIO_DO_PLAYER.length).toBeGreaterThanOrEqual(20);
  });

  it('nenhuma fonte externa é citada como autor', () => {
    // O player trazia uma faixa assinada por uma cátedra estrangeira.
    const proibidos = /edimburgo|edinburgh|harvard|oxford|grout|med\b/i;
    for (const f of REPERTORIO_DO_PLAYER) {
      expect(proibidos.test(f.autor)).toBe(false);
    }
  });

  it('toda faixa tem notas audíveis e duração coerente', () => {
    for (const f of REPERTORIO_DO_PLAYER) {
      expect(f.notas.length).toBeGreaterThan(0);
      expect(f.notas.some(([freq]) => freq > 0)).toBe(true);
      expect(f.duracaoSegundos).toBeGreaterThan(0);
      for (const [freq, dur] of f.notas) {
        expect(freq === 0 || (freq > 20 && freq < 5000)).toBe(true);
        expect(dur).toBeGreaterThan(0);
      }
    }
  });

  it('os identificadores são únicos', () => {
    const ids = REPERTORIO_DO_PLAYER.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('a conversão de altura usa temperamento igual com lá4 = 440', () => {
    expect(hz('A4')).toBe(440);
    expect(hz('A5')).toBe(880);
    expect(hz('C4')).toBeCloseTo(261.63, 1);
    expect(hz('E4')).toBeCloseTo(329.63, 1);
    // uma oitava = razão 2; um semitom = 2^(1/12)
    // hz arredonda em duas casas, entao a razao carrega o erro do arredondamento.
    expect(hz('C5') / hz('C4')).toBeCloseTo(2, 3);
    expect(hz('C#4') / hz('C4')).toBeCloseTo(Math.pow(2, 1 / 12), 3);
  });
});
