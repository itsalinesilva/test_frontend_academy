// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from '../../src/ui/navigation/router';
import { AppRouterOutlet } from '../../src/ui/screens/AppRouterOutlet';

/**
 * GUARDAS DE REGRESSÃO — os defeitos de 2026-09-22, para que não voltem.
 *
 * Cada caso aqui é GENÉRICO: não confere o defeito que foi consertado, confere
 * a CLASSE dele. Consertar a busca do cabeçalho e testar só a busca do
 * cabeçalho deixaria o próximo `navigate('/x?y=')` cair no mesmo 404.
 */

function arquivos(dir: string, filtro: (f: string) => boolean): string[] {
  const saida: string[] = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) saida.push(...arquivos(caminho, filtro));
    else if (filtro(caminho)) saida.push(caminho);
  }
  return saida;
}

const FONTES = arquivos('src', (f) => /\.(ts|tsx)$/.test(f)).map((f) => ({
  f: f.replace(/\\/g, '/'),
  codigo: readFileSync(f, 'utf8'),
}));

/** Tira o conteúdo de `${...}`, respeitando chaves aninhadas. */
function semInterpolacao(t: string): string {
  let saida = '';
  let profundidade = 0;
  for (let i = 0; i < t.length; i++) {
    if (profundidade === 0 && t[i] === '$' && t[i + 1] === '{') {
      profundidade = 1;
      i++;
      saida += 'x';
      continue;
    }
    if (profundidade > 0) {
      if (t[i] === '{') profundidade++;
      else if (t[i] === '}') profundidade--;
      continue;
    }
    saida += t[i];
  }
  return saida;
}

// ---------------------------------------------------------------------------
// RT-1 — toda navegação com consulta abre uma tela, e não o 404
// ---------------------------------------------------------------------------

/**
 * O pente fino (`checkNavigationTargets`) tira o `?` antes de comparar — ele
 * supunha que o roteador fazia o mesmo, e era essa a suposição errada. E só
 * lê aspas simples: `${...}` passa sem conferência. Esta guarda abre cada
 * destino no ROTEADOR DE VERDADE.
 */
const DESTINOS_COM_CONSULTA = (() => {
  const achados = new Map<string, string>();
  for (const { f, codigo } of FONTES) {
    for (const m of codigo.matchAll(/navigate\(\s*(['`])((?:(?!\1)[\s\S])*?)\1/g)) {
      const destino = semInterpolacao(m[2]);
      if (destino.startsWith('/') && destino.includes('?')) achados.set(destino, f);
    }
  }
  return [...achados.entries()];
})();

const irPara = (caminho: string) => {
  window.location.hash = `#${caminho}`;
};

beforeEach(() => {
  localStorage.clear();
  irPara('/');
});

describe('🔴 RT-1 — navegação com consulta', () => {
  it('a varredura acha as navegações com consulta — e não está vazia', () => {
    /** Guarda da guarda: um regex quebrado acharia zero e passaria sempre. */
    expect(DESTINOS_COM_CONSULTA.length).toBeGreaterThanOrEqual(5);
    expect(DESTINOS_COM_CONSULTA.map(([d]) => d)).toContain('/search?q=x');
  });

  it.each(DESTINOS_COM_CONSULTA)('"%s" (de %s) abre uma tela, e não a página de não encontrado', async (destino) => {
    irPara(destino);
    const { unmount } = render(
      <RouterProvider>
        <AppRouterOutlet />
      </RouterProvider>
    );
    /** Deixa a tela montar e o outlet decidir. */
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText(/Página Não Encontrada/)).toBeNull();
    unmount();
  });
});

// ---------------------------------------------------------------------------
// EE-21 — ninguém lê a camada editorial pelas costas da camada publicada
// ---------------------------------------------------------------------------

describe('🔴 EE-21 — toda leitura editorial funde o publicado', () => {
  /**
   * O defeito era um leitor que ia direto ao `localStorage`: o aluno lia só o
   * que estava no navegador dele, e o pacote commitado não valia. Um leitor
   * novo escrito do mesmo jeito repetiria o defeito sem nada acusar.
   */
  const CHAVES = [
    'amd_academy_editorial_v1',
    'amd_academy_licoes_criadas_v1',
    'amd_acervo_artigos_editoriais_v1',
    'amd_biblioteca_secoes_editadas_v1',
    'course_booklets_v1',
  ];

  it('só os repositórios que fundem a camada publicada tocam as chaves editoriais', () => {
    const tocam = FONTES.filter(({ codigo }) => CHAVES.some((c) => codigo.includes(`'${c}'`)));
    expect(tocam.length, 'a varredura não achou ninguém — o teste ficou vazio').toBeGreaterThan(0);

    for (const { f, codigo } of tocam) {
      expect(
        codigo.includes('camadaPublicada()'),
        `${f} lê chave editorial sem fundir a camada publicada — o aluno veria só o local`
      ).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// EE-21e — o gerador de livros grava onde a Biblioteca diz
// ---------------------------------------------------------------------------

describe('EE-21e — a pasta dos livros', () => {
  it('npm run livros grava na pasta que a Biblioteca anuncia, e que existe', () => {
    const script = readFileSync('scripts/generate-books.ts', 'utf8');
    const pasta = /const OUTCOME = '([^']+)'/.exec(script)?.[1];
    expect(pasta, 'o script não declara a pasta de saída').toBeTruthy();

    const tela = readFileSync('src/ui/screens/admin/LibraryScreen.tsx', 'utf8');
    expect(tela, `a tela não anuncia ${pasta}/`).toContain(`${pasta}/`);
    /** Sem a pasta, o script nunca acha a edição anterior para preservar. */
    expect(existsSync(pasta!)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// FL-1 — nenhuma espera do Acervo depende do prazo padrão de um segundo
// ---------------------------------------------------------------------------

describe('FL-1 — esperas do Acervo com prazo explícito', () => {
  /**
   * O catálogo tem 5 MB. Esperar com o prazo padrão passa numa máquina ociosa
   * e falha com a suíte em paralelo — a espera que ficou sem prazo quebrou a
   * suíte completa em 2026-09-22.
   */
  function chamadas(codigo: string, nome: RegExp): string[] {
    const saida: string[] = [];
    for (const m of codigo.matchAll(nome)) {
      let i = m.index! + m[0].length;
      let nivel = 1;
      const inicio = i;
      while (i < codigo.length && nivel > 0) {
        if (codigo[i] === '(') nivel++;
        else if (codigo[i] === ')') nivel--;
        i++;
      }
      saida.push(codigo.slice(inicio, i));
    }
    return saida;
  }

  const TESTES_DO_ACERVO = arquivos('tests/ui', (f) => /acervo-.*\.test\.tsx$/.test(f));

  it('a varredura acha os testes do Acervo', () => {
    expect(TESTES_DO_ACERVO.length).toBeGreaterThanOrEqual(3);
  });

  it.each(TESTES_DO_ACERVO)('%s: todo waitFor e findBy declara o prazo', (arquivo) => {
    const codigo = readFileSync(arquivo, 'utf8');
    const sem = [
      ...chamadas(codigo, /\bwaitFor\(/g),
      ...chamadas(codigo, /\bfind(?:All)?By\w+\(/g),
    ].filter((c) => !/timeout/.test(c));
    /** Sem exceção: regra com lista de exceções é regra que cresce. */
    expect(sem, 'espera sem prazo — verde isolada, vermelha na suíte').toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// EE-20 — o recado da exportação conta tudo o que viaja
// ---------------------------------------------------------------------------

vi.mock('../../src/ui/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ userId: 'u1', nome: 'Aline', ehAdmin: true, carregando: false, autenticado: true }),
}));

describe('EE-20 — o recado da exportação', () => {
  it('nomeia cada tipo que o pacote leva — e não só lições', async () => {
    const { AdminLicoesScreen } = await import('../../src/ui/screens/admin/AdminLicoesScreen');
    const { VERSAO_DO_PACOTE, montarPacote } = await import('../../src/domain/pacote-editorial');

    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    const user = userEvent.setup();
    render(
      <RouterProvider>
        <AdminLicoesScreen />
      </RouterProvider>
    );

    await user.click(await screen.findByRole('button', { name: /Exportar pacote/ }, { timeout: 40000 }));
    const recado = await screen.findByText(/public\/editorial\/pacote\.json/, {}, { timeout: 20000 });

    /**
     * Cada lista do pacote precisa aparecer. A lista sai do próprio pacote:
     * um campo novo em `PacoteEditorial` que o recado não nomeie faz este caso
     * falhar, em vez de viajar calado.
     */
    const campos = Object.keys(
      montarPacote({ edicoes: [], licoesCriadas: [], artigos: [], livretos: [], secoesDeLivro: [] })
    ).filter((k) => !['versao', 'exportadoEm', 'exportadoPor'].includes(k));
    const NOME: Record<string, RegExp> = {
      edicoes: /correç/,
      licoesCriadas: /lições criadas|lição criada/,
      artigos: /artigo/,
      livretos: /livreto/,
      secoesDeLivro: /seç(ão|ões) de livro/,
    };
    expect(VERSAO_DO_PACOTE).toBeGreaterThanOrEqual(4);
    for (const c of campos) {
      expect(NOME[c], `campo "${c}" do pacote sem nome no recado`).toBeDefined();
      expect(recado.textContent).toMatch(NOME[c]);
    }
  });
});
