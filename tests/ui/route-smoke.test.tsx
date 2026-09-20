// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
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

/**
 * 🔴 QUEM ESTÁ OLHANDO A TELA É VARIÁVEL, e antes era sempre admin logado.
 *
 * Este arquivo montava tudo como administrador com sessão. Por esse caminho,
 * uma tela que trava para quem NÃO está logado passa em todos os casos.
 *
 * Foi exatamente o que aconteceu: a casa do Laboratório tinha
 * `if (!userId) return;` **antes** de desligar o carregamento. Visitante ficava
 * com esqueleto eterno — a tela não abria — e a suíte inteira seguia verde.
 *
 * Toda rota roda agora nas duas peles.
 */
const usuario = {
  atual: { userId: 'u_teste', nome: 'Teste', ehAdmin: true, carregando: false } as {
    userId: string | null;
    nome: string | null;
    ehAdmin: boolean;
    carregando: boolean;
  },
};

vi.mock('../../src/ui/hooks/useCurrentUser', () => ({
  useCurrentUser: () => usuario.atual,
}));

const PELES = [
  { nome: 'visitante', quem: { userId: null, nome: null, ehAdmin: false, carregando: false } },
  { nome: 'logado', quem: { userId: 'u_teste', nome: 'Teste', ehAdmin: true, carregando: false } },
];

/** O sintetizador toca; em jsdom não há AudioContext. */
vi.mock('../../src/infrastructure/audio/synth', () => ({
  webAudioSynth: { playTone: vi.fn(), playChord: vi.fn(), playSequence: vi.fn() },
}));

const { AppRouterOutlet } = await import('../../src/ui/screens/AppRouterOutlet');

/**
 * 🔴 AS ROTAS VÊM DO ROTEADOR, e não da tabela de audiência.
 *
 * A tabela declara **quem pode entrar** em cada caminho, e nem todo caminho
 * servido tem regra própria — muitos herdam do prefixo. Derivar dali cobria
 * quarenta e três rotas de noventa e uma: quase metade da aplicação montava
 * sem que ninguém olhasse, inclusive telas do Laboratório.
 *
 * O roteador é a única fonte que sabe o que de fato é servido. A leitura é
 * estática, do mesmo jeito que o pente fino faz para contar rotas.
 */
const ROTAS_DO_ROTEADOR = (() => {
  const fonte = readFileSync('src/ui/screens/AppRouterOutlet.tsx', 'utf-8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  return [
    ...new Set(
      [
        ...fonte.matchAll(
          /currentPath\s*(?:===|\.startsWith\(|\.includes\()\s*'([^']+)'/g
        ),
      ]
        .map((m) => m[1])
        /** Prefixo termina em `/` e precisa de um parâmetro para virar rota. */
        .map((r) => (r.endsWith('/') ? `${r}x` : r))
    ),
  ];
})();

const ROTAS = [...new Set([...REGRAS_DE_AUDIENCIA.map((r) => r.rota), ...ROTAS_DO_ROTEADOR])];

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

/**
 * 🔴 "NÃO LANÇOU" NÃO É "ABRIU".
 *
 * O critério era `body.textContent.length > 0`. Uma tela presa no esqueleto de
 * carregamento **tem** nós no corpo, e a contagem de texto passava — o
 * esqueleto é só `div` com classe de animação, e qualquer migalha de texto de
 * outro canto da árvore satisfazia a condição.
 *
 * O critério afiado é o **esqueleto**: se a animação de carregamento ainda está
 * na árvore depois de três segundos, a tela não abriu. É ele que pegou o
 * Laboratório travado para visitante.
 *
 * O piso de texto é só a rede de segurança, e é baixo de propósito: "Curso não
 * encontrado" é um estado vazio **correto** para um identificador inventado, e
 * a tela que o mostra abriu. Exigir cem caracteres reprovaria o acerto.
 */
const TEXTO_MINIMO = 30;

/**
 * O esqueleto de carregamento, que é o disfarce de "abriu".
 *
 * `animate-pulse` sozinho NÃO serve como sinal: é utilitário do Tailwind e
 * aparece em coisas legítimas — o ponto vermelho de "ao vivo" no grafo, o
 * selo de gravando, o floco da ofensiva congelada. A primeira versão deste
 * detector acusou o grafo por causa de um ponto de dois pixels e meio.
 *
 * O que identifica esqueleto é o **bloco cinza de conteúdo**: uma caixa
 * `bg-stone-200` pulsando, sem texto, no lugar onde a informação vai ficar.
 */
const aindaCarregando = () => {
  const pulsando = [...document.querySelectorAll('[class*="animate-pulse"]')];
  return pulsando.some((el) => {
    const proprio = /bg-stone-200/.test(el.className);
    const dentro = !!el.querySelector('[class*="bg-stone-200"]');
    return proprio || dentro;
  });
};

describe('a fumaça cobre o roteador inteiro', () => {
  it('a lista de rotas vem do roteador, e não de uma segunda lista', () => {
    /**
     * NÃO-VACUIDADE. Se a leitura estática quebrar, `TODAS` encolhe e a suíte
     * segue verde testando meia dúzia de telas — que é o defeito que este
     * arquivo existe para impedir, um nível acima.
     */
    expect(ROTAS_DO_ROTEADOR.length, 'a leitura do roteador devolveu pouca coisa').toBeGreaterThan(
      60
    );
    expect(TODAS.length).toBeGreaterThan(60);
  });
});

describe('toda rota ABRE, nas duas peles', () => {
  for (const pele of PELES) {
    for (const rota of TODAS) {
      it(`${pele.nome} — ${rota}`, async () => {
        usuario.atual = pele.quem;
        rotaAtual.valor = rota;

        expect(() => render(<AppRouterOutlet />)).not.toThrow();

        /**
         * Espera o efeito assíncrono: quase toda tela carrega dado no
         * `useEffect`, e uma falha ali acontece DEPOIS do render.
         */
        await waitFor(
          () => {
            expect(
              aindaCarregando(),
              `${rota} ficou presa no esqueleto de carregamento para ${pele.nome}`
            ).toBe(false);
          },
          { timeout: 3000 }
        );

        const texto = (document.body.textContent ?? '').replace(/\s+/g, ' ').trim();
        expect(
          texto.length,
          `${rota} abriu sem conteúdo legível para ${pele.nome}: "${texto.slice(0, 60)}"`
        ).toBeGreaterThan(TEXTO_MINIMO);
      });
    }
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
