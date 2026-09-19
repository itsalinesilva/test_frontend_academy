// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { REGRAS_DE_AUDIENCIA } from '../../src/ui/navigation/audiencia';

/**
 * Fumaça de rota — o que substitui percorrer a aplicação clicando.
 *
 * POR QUE ISTO EXISTE
 * -------------------
 * Toda a suíte anterior prova propriedades: a tabela de audiência está certa,
 * a guarda barra quem deve, o gerador não inventa. Nenhuma delas **monta a
 * tela de verdade** — e tela que quebra ao montar passa em todas.
 *
 * Aqui cada rota do roteador é renderizada. O critério é o mais grosseiro que
 * existe, e é justamente por isso que vale: **não pode lançar**. Uma tela que
 * explode ao abrir é o único defeito que nenhuma outra camada pega, porque não
 * há o que inspecionar depois do erro.
 *
 * É melhor que clicar em dois aspectos: passa por todas as rotas, sempre, e
 * roda de novo a cada mudança. É pior num aspecto, e ele importa: **não vê**.
 * Layout quebrado, texto errado no contexto e fluxo que leva ao lugar errado
 * continuam precisando de olho humano — está anotado em `CLAUDE_TODO.md`, F.2.
 */

const rotaAtual = { valor: '/' };
const navigate = vi.fn();

vi.mock('../../src/ui/navigation/router', async () => {
  const real = await vi.importActual<Record<string, unknown>>(
    '../../src/ui/navigation/router'
  );
  return {
    ...real,
    useRouter: () => ({
      currentPath: rotaAtual.valor,
      navigate,
      params: { id: 'x', courseId: 'x', moduleId: 'x', lessonId: 'x' },
      /**
       * `breadcrumbs` e `authorization` fazem parte do contrato do roteador e
       * o `ScreenContainer` os lê. Omiti-los quebrava TODA tela no teste — e
       * esse erro era meu, não do produto.
       */
      breadcrumbs: [],
      authorization: { authorized: true },
      goBack: vi.fn(),
      replace: navigate,
    }),
    useRouteParams: () => ({ id: 'x', courseId: 'x', moduleId: 'x', lessonId: 'x' }),
  };
});

/** Admin logado: monta o máximo de telas possível numa passada só. */
vi.mock('../../src/ui/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({
    userId: 'u_teste',
    nome: 'Teste',
    ehAdmin: true,
    carregando: false,
  }),
}));

/** O sintetizador toca; em jsdom não há AudioContext. */
vi.mock('../../src/infrastructure/audio/synth', () => ({
  webAudioSynth: { playTone: vi.fn(), playChord: vi.fn(), playSequence: vi.fn() },
}));

const { AppRouterOutlet } = await import('../../src/ui/screens/AppRouterOutlet');

/**
 * As rotas declaradas na tabela de audiência.
 *
 * Deriva dali em vez de listar aqui: uma segunda lista envelheceria, e a tela
 * nova ficaria sem cobertura exatamente quando mais precisa.
 */
const ROTAS = [...new Set(REGRAS_DE_AUDIENCIA.map((r) => r.rota))];

/** Rotas com parâmetro, que a tabela não traz por serem prefixo. */
const COM_PARAMETRO = [
  '/academia/course/x',
  '/academia/lesson/x',
  '/academia/module/x',
  '/academia/program/x',
  '/academia/path/x',
  '/academia/result/x',
  '/academia/certificate/x',
  '/worlds/work/x',
  '/community/topic/x',
  '/rooms/x',
  '/credential/CMU-X',
  '/practice/skill/x',
  '/practice/exercise/x',
];

const TODAS = [...ROTAS, ...COM_PARAMETRO];

let erros: string[] = [];
let erroOriginal: typeof console.error;

beforeEach(() => {
  erros = [];
  erroOriginal = console.error;
  console.error = (...args: unknown[]) => {
    erros.push(args.map(String).join(' '));
  };
  window.localStorage.clear();
});

afterEach(() => {
  console.error = erroOriginal;
  cleanup();
});

describe('toda rota monta sem lançar', () => {
  for (const rota of TODAS) {
    it(`${rota}`, async () => {
      rotaAtual.valor = rota;

      expect(() => render(<AppRouterOutlet />)).not.toThrow();

      /**
       * Espera o efeito assíncrono: quase toda tela carrega dado no
       * `useEffect`, e uma falha ali acontece DEPOIS do render. Sem esta
       * espera, o teste passaria justamente nas telas que quebram ao buscar.
       */
      await waitFor(() => {
        expect(document.body.textContent?.length ?? 0).toBeGreaterThan(0);
      });
    });
  }
});

describe('nenhuma rota derruba React', () => {
  it('nenhuma montagem produz erro de renderização', async () => {
    /**
     * `console.error` é onde React reclama de hook fora de ordem, de chave
     * duplicada e de atualização de estado em componente desmontado. São
     * defeitos reais que não lançam — e que por isso passam despercebidos até
     * virarem tela em branco em produção.
     */
    const problemas: string[] = [];

    for (const rota of TODAS) {
      rotaAtual.valor = rota;
      erros = [];
      render(<AppRouterOutlet />);
      await waitFor(() => expect(document.body).toBeTruthy());
      cleanup();

      const graves = erros.filter(
        (e) =>
          /Cannot read|is not a function|undefined is not|Rendered more hooks|Invalid hook/.test(e)
      );
      if (graves.length) problemas.push(`${rota}: ${graves[0].slice(0, 140)}`);
    }

    expect(problemas, problemas.join('\n')).toEqual([]);
  });
});
