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

  it('a navbar tem cinco elementos: marca, Explorar, Meu aprendizado, lupa e avatar', () => {
    // O que não é um desses cinco vive dentro de Explorar ou dentro da tela.
    const header = lerCodigo('src/ui/components/layout/Header.tsx');
    expect(header).toContain('header-brand');
    expect(header).toContain('ExplorarMenu');
    expect(header).toContain('Meu aprendizado');
    expect(header).toContain('HeaderSearch');
    expect(header).toContain('header-profile-btn');
  });

  it('Explorar abre um painel em colunas, na largura da página', () => {
    const menu = lerCodigo('src/ui/components/layout/ExplorarMenu.tsx');
    expect(menu).toContain('ChevronDown');
    expect(menu).toContain('onMouseEnter');
    expect(menu).toContain('aria-expanded');
    expect(menu).toContain('inset-x-0');
    // colunas por assunto, não uma lista corrida de rotas
    expect(menu).toMatch(/grid-cols-\d/);
  });

  it('o menu lateral antigo foi substituído pelo Explorar', () => {
    expect(existsSync(resolve(raiz, 'src/ui/components/layout/NavMenu.tsx'))).toBe(false);
  });

  it('a busca do header é uma lupa, sem rótulo ocupando a barra', () => {
    // O comportamento tem testes próprios em `header-search.test.tsx`.
    const busca = ler('src/ui/components/layout/HeaderSearch.tsx');
    expect(busca).toContain('Search');
    expect(busca).toContain("aria-label=\"Abrir busca\"");
    expect(busca).not.toContain('Buscar...');
  });
});

describe('a raiz tem home própria, nas duas versões', () => {
  it('a tela de "visão geral" antiga não existe mais', () => {
    expect(existsSync(resolve(raiz, 'src/ui/screens/overview/OverviewScreen.tsx'))).toBe(false);
  });

  it('a raiz abre a HomeScreen', () => {
    const outlet = lerCodigo('src/ui/screens/AppRouterOutlet.tsx');
    expect(outlet).not.toContain('overview/OverviewScreen');
    expect(outlet).toMatch(/currentPath === '\/'[\s\S]{0,240}<HomeScreen/);
  });

  it('a home distingue visitante de aluno logado', () => {
    const home = lerCodigo('src/ui/screens/home/HomeScreen.tsx');
    expect(home).toContain('useUsuarioAtual');
    // O ramo de visitante existe e convida a criar conta.
    expect(home).toContain('if (!userId)');
    expect(home).toContain('/auth/register');
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

  it('os cinco cursos do plano estão publicados', () => {
    const titulos = SEED_COURSES.map((c) => c.title).sort();
    expect(titulos).toEqual([
      'História Social da Música Popular Brasileira',
      'História da Música Brasileira',
      'História da Música Ocidental',
      'Teoria da Música',
      'Violino',
    ]);
  });

  it('todo curso tem capítulos, e todo capítulo tem conteúdo', async () => {
    const { SEED_MODULES, SEED_LESSONS } = await import('../../src/data/seed-academy-content');
    for (const c of SEED_COURSES) {
      const mods = SEED_MODULES.filter((m) => m.courseId === c.id);
      const lics = SEED_LESSONS.filter((l) => l.courseId === c.id);

      expect(mods.length, `${c.title} sem módulos`).toBeGreaterThan(0);
      expect(lics.length, `${c.title}: módulos e lições não batem`).toBe(mods.length);
      expect(c.moduleIds.length).toBe(mods.length);

      for (const l of lics) {
        const blocos = l.variants.TRADITIONAL.sections.flatMap((s2) => s2.blocks ?? []);
        expect(blocos.length, `${l.id} sem blocos`).toBeGreaterThan(0);
        expect(
          blocos.some((b) => b.kind === 'CHECKPOINT'),
          `${l.id} sem checkpoint`
        ).toBe(true);
      }
    }
  });

  it('nenhum bloco tem id repetido em todo o catálogo', async () => {
    const { SEED_LESSONS } = await import('../../src/data/seed-academy-content');
    const ids = SEED_LESSONS.flatMap((l) =>
      l.variants.TRADITIONAL.sections.flatMap((s2) => (s2.blocks ?? []).map((b) => b.id))
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('programas são combinações de cursos que existem, com carga somada', () => {
    const porId = new Map(SEED_COURSES.map((c) => [c.id, c]));
    const trilhas = new Map(SEED_PATHS.map((p) => [p.id, p]));

    expect(SEED_PROGRAMS.length).toBeGreaterThan(0);

    for (const prog of SEED_PROGRAMS) {
      expect(prog.pathIds.length).toBeGreaterThanOrEqual(2);

      const cursos = prog.pathIds.flatMap((pid) => {
        const t = trilhas.get(pid);
        expect(t, `${prog.title} aponta para a trilha inexistente ${pid}`).toBeTruthy();
        return t!.courseIds;
      });

      // A carga do programa é a soma real dos cursos, não um número escolhido.
      const somada = cursos.reduce((a, cid) => {
        const c = porId.get(cid);
        expect(c, `trilha aponta para o curso inexistente ${cid}`).toBeTruthy();
        return a + c!.workloadHours;
      }, 0);

      expect(prog.workloadHours).toBe(somada);
    }
  });

  it('toda trilha aponta para um curso publicado', () => {
    const ids = new Set(SEED_COURSES.map((c) => c.id));
    for (const p of SEED_PATHS) {
      for (const cid of p.courseIds) expect(ids.has(cid)).toBe(true);
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
