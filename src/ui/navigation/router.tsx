import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '../../domain/types';
import { authService } from '../../services/application/auth.service';

export interface BreadcrumbEntry {
  label: string;
  path?: string;
}

export interface RouteAuthorizationResult {
  authorized: boolean;
  reason?: string;
  requiredCapability?: string;
}

/** Parâmetros extraídos da rota. Ausência é explícita. */
export type RouteParams = Record<string, string | undefined>;

export interface RouterContextValue {
  /** O caminho, SEM a consulta: `/search`, e não `/search?q=bach`. */
  currentPath: string;
  /**
   * A consulta do endereço (`?q=bach` → `query.get('q')`).
   *
   * 🔴 SEPARADA DO CAMINHO, e é isso que faz a rota casar. Antes, o caminho
   * carregava a consulta junto, e `/search?q=bach` não era igual a
   * `/search`: toda busca feita pelo cabeçalho caía na página de não
   * encontrado, e o botão "Entrar" da guarda (`/auth/login?voltar=…`)
   * também.
   */
  query: URLSearchParams;
  /**
   * Parâmetros da rota. `string | undefined` deliberadamente: o tipo
   * anterior (`Record<string, string>`) afirmava presença que a rota não
   * garante, e foi o que permitiu as 18 telas com id fixo de reserva (R-02).
   * Com a ausência no tipo, o compilador exige que ela seja tratada.
   */
  params: RouteParams;
  breadcrumbs: BreadcrumbEntry[];
  navigate: (path: string) => void;
  replace: (path: string) => void;
  authorization: RouteAuthorizationResult;
  recheckAuthorization: () => Promise<void>;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export const CANONICAL_ROUTES = {
  // Global & Core
  OVERVIEW: '/',
  DESIGN_SYSTEM: '/design-system',
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_RECOVERY: '/auth/recovery',
  AUTH_CALLBACK: '/auth/callback',
  ONBOARDING: '/onboarding',
  SETTINGS: '/settings',
  NOTIFICATIONS: '/notifications',
  SEARCH: '/search',
  HELP: '/help',

  // 8 Primary Canonical Pillars & Navigation Axes
  ACADEMY: '/academia',
  ACADEMY_CATALOG: '/academia/catalog',
  ACADEMY_SEARCH: '/academia/search',
  ACADEMY_SEARCH_RESULTS: '/academia/search/results',
  ACADEMY_CATEGORY: '/academia/category/:id',
  ACADEMY_PROGRAM: '/academia/program/:id',
  ACADEMY_PATH: '/academia/path/:id',
  ACADEMY_COURSE: '/academia/course/:id',
  ACADEMY_COURSE_CURRICULUM: '/academia/course/:id/curriculum',
  ACADEMY_COURSE_PROGRESS: '/academia/course/:id/progress',
  ACADEMY_MODULE: '/academia/course/:courseId/module/:moduleId',
  ACADEMY_LESSON: '/academia/lesson/:id',
  ACADEMY_INTERACTIVE_LESSON: '/academia/lesson/:id/interactive',
  ACADEMY_ACTIVITY: '/academia/activity/:id',
  ACADEMY_QUIZ: '/academia/quiz/:id',
  ACADEMY_ASSESSMENT: '/academia/assessment/:id',
  ACADEMY_RESULT: '/academia/result/:id',
  ACADEMY_COMPLETION: '/academia/completion/:id',
  ACADEMY_CERTIFICATE: '/academia/certificate/:id',
  ACADEMY_MY_LEARNING: '/academia/my-learning',
  ACADEMY_HISTORY: '/academia/history',
  ACADEMY_PROFILE: '/academia/academic-profile',

  PRACTICE: '/practice',
  PRACTICE_SKILL_TREE: '/practice/skill-tree',
  PRACTICE_SKILL: '/practice/skill/:id',
  PRACTICE_SKILL_DETAIL: '/practice/skill/:id',
  PRACTICE_MICRO_SKILL: '/practice/microskill/:id',
  PRACTICE_EXERCISE: '/practice/exercise/:id',
  PRACTICE_SESSION: '/practice/session/:id',
  PRACTICE_ATTEMPT: '/practice/attempt/:id',
  PRACTICE_FEEDBACK: '/practice/feedback/:id',
  PRACTICE_RESULT: '/practice/result/:id',
  PRACTICE_MASTERY: '/practice/mastery',
  PRACTICE_HISTORY: '/practice/history',
  PRACTICE_DAILY_GOAL: '/practice/daily-goal',
  PRACTICE_STREAK: '/practice/streak',
  PRACTICE_RANKING: '/practice/ranking',
  PRACTICE_PROFILE: '/practice/profile',

  ACERVO: '/acervo',
  ACERVO_OBRA: '/acervo/obra/:id',
  ACERVO_COMPOSITOR: '/acervo/compositor/:id',
  /**
   * 🔴 ESTA ROTA FALTAVA, E O ARTIGO NÃO ABRIA.
   *
   * O card navegava para `/acervo/artigo/<id>`, o outlet reconhecia o prefixo
   * e montava a tela — e a tela não achava o artigo, porque `params.id` vinha
   * **vazio**: sem um padrão nesta tabela, `parseParams` não tem contra o que
   * casar, e o segmento do identificador se perde.
   *
   * O sintoma é o pior que existe: a tela abre, não quebra, e mostra "artigo
   * não encontrado" sobre um artigo que está ali.
   *
   * E o meu teste passava, porque ele **substituía o roteador** e entregava o
   * `id` na mão. Substituir a peça quebrada é a forma mais eficiente de não
   * encontrar o defeito dela.
   */
  ACERVO_ARTIGO: '/acervo/artigo/:id',

  SCORE: '/score',

  WORLDS: '/worlds',
  WORLDS_WORK: '/worlds/work/:id',
  WORLDS_GRAPH: '/worlds/graph',

  COMMUNITY: '/community',
  COMMUNITY_TOPIC: '/community/topic/:id',
  COMMUNITY_EVENTS: '/community/events',

  STUDIO: '/studio',
  STUDIO_PROJECT: '/studio/project/:id',
  STUDIO_SCORE: '/studio/score',
  STUDIO_VOICE_EAR: '/studio/voice-ear',

  ROOMS: '/rooms',
  ROOMS_DETAIL: '/rooms/:id',
  ROOMS_CREATE: '/rooms/create',

  PROFILE: '/profile',
  PROFILE_PORTFOLIO: '/profile/portfolio',
  PROFILE_EDIT: '/profile/edit',
  PROFILE_NETWORK: '/profile/network',
  // Perfil de OUTRA pessoa. Sem esta rota a premissa "LinkedIn de musicos"
  // era estruturalmente vazia: existia tela de perfil, e ela so conseguia
  // exibir o proprio. As rotas estaticas acima tem precedencia sobre este
  // padrao (resolveRouteParams), entao /profile/edit continua sendo a edicao
  // e nao um usuario chamado "edit".
  PROFILE_MEMBER: '/profile/:userId',

  // Admin Governance (Protected)
  ADMIN: '/founder',
  ADMIN_USERS: '/founder/users',
  ADMIN_ENGINES: '/founder/engines',
  ADMIN_CONTENT: '/founder/content',
  ADMIN_LICOES: '/founder/licoes',
  ADMIN_ARTIGOS: '/founder/artigos',
  ADMIN_MODERATION: '/founder/moderation',
  ADMIN_AUDIT: '/founder/audit',
  ADMIN_CREDENTIALS: '/founder/credentials',
  ADMIN_BOOKLETS: '/founder/booklets',
  ADMIN_LIBRARY: '/founder/biblioteca',

  // Simulador de violino com acompanhamento de partitura.
  VIOLIN_SIMULATOR: '/violin/simulator',
  VIOLIN_SIMULATOR_SCORE: '/violin/simulator/:id',

  // Conta infantil: criacao e acompanhamento parental.
  KIDS_CREATE: '/kids/create',
  KIDS_MANAGE: '/kids/manage',

  // Verificacao publica de documento. NAO exige sessao: quem confere um
  // certificado e um empregador, uma banca, uma secretaria — gente que nao
  // tem conta e nao vai criar uma para conferir um documento.
  CREDENTIAL_VERIFY: '/credential',
  CREDENTIAL_BY_CODE: '/credential/:codigo',
} as const;

/**
 * Separa caminho e consulta. `/a/b?x=1` → `{ caminho: '/a/b', consulta: 'x=1' }`.
 *
 * Exportada porque é a regra que o roteador inteiro segue: rota, parâmetros,
 * autorização e trilha olham o CAMINHO; só a tela olha a consulta.
 */
export function separarEndereco(endereco: string): { caminho: string; consulta: string } {
  const i = endereco.indexOf('?');
  if (i < 0) return { caminho: endereco || '/', consulta: '' };
  return { caminho: endereco.slice(0, i) || '/', consulta: endereco.slice(i + 1) };
}

function getInitialPath(): string {
  if (typeof window === 'undefined') return '/';
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    return window.location.hash.slice(1);
  }
  const path = window.location.pathname;
  return path && path !== '' ? path : '/';
}

function parseParams(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      const paramName = patternParts[i].slice(1);
      params[paramName] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

function deriveBreadcrumbs(path: string, params: RouteParams): BreadcrumbEntry[] {
  const crumbs: BreadcrumbEntry[] = [{ label: 'Início', path: '/' }];

  if (path === '/' || path === '/overview') {
    return crumbs;
  }

  // Academy
  if (path.startsWith('/academia')) {
    crumbs.push({ label: 'Academia', path: '/academia' });
    if (path === '/academia/catalog') {
      crumbs.push({ label: 'Catálogo de Cursos' });
    } else if (path === '/academia/search' || path === '/academia/search/results') {
      crumbs.push({ label: 'Busca Acadêmica' });
    } else if (path.startsWith('/academia/category/')) {
      crumbs.push({ label: `Cátedra: ${params.id || 'Especialização'}` });
    } else if (path.startsWith('/academia/program/')) {
      crumbs.push({ label: `Programa: ${params.id || 'Detalhes'}` });
    } else if (path.startsWith('/academia/path/')) {
      crumbs.push({ label: `Trilha: ${params.id || 'Detalhes'}` });
    } else if (path.includes('/curriculum')) {
      crumbs.push({ label: 'Grade Curricular' });
    } else if (path.includes('/progress')) {
      crumbs.push({ label: 'Progresso do Curso' });
    } else if (path.startsWith('/academia/course/')) {
      crumbs.push({ label: `Curso: ${params.id || 'Detalhes'}` });
    } else if (path.includes('/interactive')) {
      crumbs.push({ label: 'Laboratório Interativo' });
    } else if (path.startsWith('/academia/lesson/')) {
      crumbs.push({ label: 'Lição' });
    } else if (path.startsWith('/academia/activity/')) {
      crumbs.push({ label: 'Atividade Prática' });
    } else if (path.startsWith('/academia/quiz/')) {
      crumbs.push({ label: 'Quiz de Verificação' });
    } else if (path.startsWith('/academia/assessment/')) {
      crumbs.push({ label: 'Avaliação Acadêmica' });
    } else if (path.startsWith('/academia/result/')) {
      crumbs.push({ label: 'Resultado do Exame' });
    } else if (path.startsWith('/academia/completion/')) {
      crumbs.push({ label: 'Conclusão de Curso' });
    } else if (path.startsWith('/academia/certificate/')) {
      crumbs.push({ label: 'Certificado Digital' });
    } else if (path === '/academia/my-learning') {
      crumbs.push({ label: 'Meu Aprendizado' });
    } else if (path === '/academia/history') {
      crumbs.push({ label: 'Histórico Acadêmico' });
    } else if (path === '/academia/academic-profile') {
      crumbs.push({ label: 'Perfil Acadêmico' });
    }
    return crumbs;
  }

  // Practice
  if (path.startsWith('/practice')) {
    crumbs.push({ label: 'Prática & Treino', path: '/practice' });
    if (path === '/practice/skill-tree') crumbs.push({ label: 'Lições' });
    else if (path.startsWith('/practice/skill/')) crumbs.push({ label: `Habilidade: ${params.id || 'Detalhes'}` });
    else if (path.startsWith('/practice/microskill/')) crumbs.push({ label: `Micro-Habilidade: ${params.id || 'Detalhes'}` });
    else if (path.startsWith('/practice/exercise/')) crumbs.push({ label: `Exercício: ${params.id || 'Ficha'}` });
    else if (path.startsWith('/practice/session/')) crumbs.push({ label: `Sessão de Prática: ${params.id || 'Ao Vivo'}` });
    else if (path.startsWith('/practice/attempt/')) crumbs.push({ label: `Tentativa: ${params.id || 'Medição'}` });
    else if (path.startsWith('/practice/feedback/')) crumbs.push({ label: 'Feedback Imediato' });
    else if (path.startsWith('/practice/result/')) crumbs.push({ label: 'Diagnóstico de Desempenho' });
    else if (path === '/practice/mastery') crumbs.push({ label: 'Matriz de Maestria' });
    else if (path === '/practice/history') crumbs.push({ label: 'Histórico de Sessões' });
    else if (path === '/practice/daily-goal') crumbs.push({ label: 'Meta Diária' });
    else if (path === '/practice/streak') crumbs.push({ label: 'Ofensiva & Sequência' });
    else if (path === '/practice/ranking') crumbs.push({ label: 'Ligas & Ranking' });
    else if (path === '/practice/profile') crumbs.push({ label: 'Perfil de Prática' });
    return crumbs;
  }

  // Score
  if (path.startsWith('/score')) {
    crumbs.push({ label: 'Partituras & Repertório', path: '/score' });
    return crumbs;
  }

  // Worlds
  if (path.startsWith('/worlds')) {
    crumbs.push({ label: 'Atlas Musical', path: '/worlds' });
    if (path.startsWith('/worlds/work/')) {
      crumbs.push({ label: `Obra: ${params.id || 'Detalhes'}` });
    } else if (path === '/worlds/graph') {
      crumbs.push({ label: 'Grafo de Conexões' });
    }
    return crumbs;
  }

  // Community
  if (path.startsWith('/community')) {
    crumbs.push({ label: 'Comunidade', path: '/community' });
    if (path.startsWith('/community/topic/')) {
      crumbs.push({ label: `Tópico: ${params.id || 'Discussão'}` });
    } else if (path === '/community/events') {
      crumbs.push({ label: 'Eventos & Recitais' });
    }
    return crumbs;
  }

  // Studio
  if (path.startsWith('/studio')) {
    crumbs.push({ label: 'Estúdio', path: '/studio' });
    if (path.startsWith('/studio/project/')) {
      crumbs.push({ label: `Projeto DAW: ${params.id || 'Trabalho'}` });
    } else if (path === '/studio/score') {
      crumbs.push({ label: 'Editor de Partituras' });
    } else if (path === '/studio/voice-ear') {
      crumbs.push({ label: 'Voz & Afinação' });
    }
    return crumbs;
  }

  // Rooms
  if (path.startsWith('/rooms')) {
    crumbs.push({ label: 'Salas & Mestres', path: '/rooms' });
    if (path === '/rooms/create') {
      crumbs.push({ label: 'Criar Nova Sala' });
    } else if (path !== '/rooms') {
      crumbs.push({ label: `Sala: ${params.id || 'Classe'}` });
    }
    return crumbs;
  }

  // Violino
  if (path.startsWith('/violin')) {
    crumbs.push({ label: 'Violino', path: '/violin/simulator' });
    if (params.id) crumbs.push({ label: 'Simulador' });
    return crumbs;
  }

  // Conta infantil
  if (path.startsWith('/kids')) {
    crumbs.push({ label: 'Conta infantil', path: '/kids/manage' });
    if (path === '/kids/create') crumbs.push({ label: 'Criar perfil' });
    return crumbs;
  }

  // Profile
  if (path.startsWith('/profile')) {
    // O perfil de outra pessoa nao pende de "Meu Perfil" — pende da Rede,
    // que e por onde se chega ate ele.
    if (params.userId) {
      crumbs.push({ label: 'Rede', path: '/profile/network' });
      crumbs.push({ label: 'Perfil' });
      return crumbs;
    }
    crumbs.push({ label: 'Meu Perfil', path: '/profile' });
    if (path === '/profile/portfolio') {
      crumbs.push({ label: 'Portfólio de Evidências' });
    } else if (path === '/profile/network') {
      crumbs.push({ label: 'Rede' });
    } else if (path === '/profile/edit') {
      crumbs.push({ label: 'Editar Perfil' });
    }
    return crumbs;
  }

  // Admin
  if (path.startsWith('/founder')) {
    crumbs.push({ label: 'Governança Admin', path: '/founder' });
    if (path === '/founder/biblioteca') crumbs.push({ label: 'Biblioteca Oficial' });
    else if (path === '/founder/booklets') crumbs.push({ label: 'Livretos de Exercício' });
    else if (path === '/founder/credentials') crumbs.push({ label: 'Estúdio de Credenciais' });
    else if (path === '/founder/users') crumbs.push({ label: 'Usuários & Papéis' });
    else if (path === '/founder/engines') crumbs.push({ label: 'Engines & Gateway' });
    else if (path === '/founder/content') crumbs.push({ label: 'Conteúdo & Currículo' });
    else if (path === '/founder/moderation') crumbs.push({ label: 'Moderação' });
    else if (path === '/founder/audit') crumbs.push({ label: 'Auditoria Imutável' });
    return crumbs;
  }

  // Global utilities
  if (path === '/settings') crumbs.push({ label: 'Configurações' });
  else if (path === '/notifications') crumbs.push({ label: 'Central de Notificações' });
  else if (path === '/search') crumbs.push({ label: 'Busca Global' });
  else if (path === '/help') crumbs.push({ label: 'Ajuda & Suporte' });
  else if (path === '/onboarding') crumbs.push({ label: 'Boas-Vindas & Integração' });
  else if (path === '/design-system') crumbs.push({ label: 'Design System' });
  else if (path.startsWith('/auth')) crumbs.push({ label: 'Autenticação' });

  return crumbs;
}

/**
 * Rotas estáticas e dinâmicas, DERIVADAS de `CANONICAL_ROUTES`.
 *
 * A versão anterior mantinha à mão uma lista de 20 padrões dinâmicos, e ela
 * estava incompleta: `/academia/course/:id/curriculum`, `/.../progress`,
 * `/academia/lesson/:id/interactive`, `/academia/quiz/:id`,
 * `/academia/category/:id` e `/practice/feedback/:id` ficaram de fora. Como
 * `parseParams` exige igualdade de número de segmentos, nenhum padrão casava
 * e essas 6 rotas recebiam `params = {}` — defeito R-01 do
 * 01_REPOSITORY_AUDIT. Dezoito telas mascaravam isso com um id fixo de
 * reserva, de modo que as rotas quebradas PARECIAM funcionar, sempre
 * exibindo a mesma entidade.
 *
 * Derivar elimina a classe inteira do defeito: qualquer rota acrescentada a
 * `CANONICAL_ROUTES` passa a resolver parâmetros sem edição adicional.
 */
const ALL_ROUTES = Object.values(CANONICAL_ROUTES) as string[];
const STATIC_ROUTES = new Set(ALL_ROUTES.filter((r) => !r.includes(':')));

/**
 * Padrões dinâmicos ordenados por especificidade: mais segmentos literais
 * primeiro. Sem isso, `/rooms/:id` capturaria `/rooms/create`.
 */
const DYNAMIC_ROUTES = ALL_ROUTES.filter((r) => r.includes(':')).sort((a, b) => {
  const literals = (r: string) => r.split('/').filter((seg) => seg && !seg.startsWith(':')).length;
  return literals(b) - literals(a);
});

export function resolveRouteParams(endereco: string): RouteParams {
  const path = separarEndereco(endereco).caminho;
  // Rota estática tem precedência absoluta sobre padrão dinâmico.
  if (STATIC_ROUTES.has(path)) return {};

  for (const pattern of DYNAMIC_ROUTES) {
    const matched = parseParams(pattern, path);
    if (matched) return matched;
  }
  return {};
}

export interface RouterProviderProps {
  currentUser?: User | null;
  children: React.ReactNode;
}

export const RouterProvider: React.FC<RouterProviderProps> = ({ currentUser = null, children }) => {
  /** O endereço inteiro, com a consulta. As telas recebem as duas partes separadas. */
  const [endereco, setCurrentPath] = useState<string>(getInitialPath);
  const { caminho: currentPath, consulta } = useMemo(() => separarEndereco(endereco), [endereco]);
  const query = useMemo(() => new URLSearchParams(consulta), [consulta]);
  const [authorization, setAuthorization] = useState<RouteAuthorizationResult>({ authorized: true });

  const checkAuth = useCallback(
    async (pathToCheck: string) => {
      // Server-side check
      const result = await authService.checkRouteAccess(pathToCheck, currentUser);
      setAuthorization(result);
    },
    [currentUser]
  );

  const navigate = useCallback(
    (newPath: string) => {
      const sanitized = newPath.startsWith('/') ? newPath : `/${newPath}`;
      setCurrentPath(sanitized);

      if (typeof window !== 'undefined') {
        window.location.hash = `#${sanitized}`;
      }
      checkAuth(separarEndereco(sanitized).caminho);
    },
    [checkAuth]
  );

  /**
   * Substitui a entrada atual do histórico, em vez de empilhar uma nova.
   *
   * A versão anterior apenas delegava a `navigate`, de modo que um
   * redirecionamento deixava a página de origem no histórico — e o botão
   * "voltar" devolvia o usuário à tela da qual ele acabara de ser
   * redirecionado, num laço. Defeito R-04 do 01_REPOSITORY_AUDIT.
   */
  const replace = useCallback(
    (newPath: string) => {
      const sanitized = newPath.startsWith('/') ? newPath : `/${newPath}`;
      setCurrentPath(sanitized);
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#${sanitized}`);
      }
      checkAuth(separarEndereco(sanitized).caminho);
    },
    [checkAuth]
  );

  // Sync with browser hash changes (e.g. back/forward button)
  useEffect(() => {
    const handleHashChange = () => {
      const hashPath = window.location.hash ? window.location.hash.replace('#', '') : '/';
      setCurrentPath(hashPath);
      checkAuth(separarEndereco(hashPath).caminho);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [checkAuth]);

  // Re-check authorization when user changes
  useEffect(() => {
    checkAuth(currentPath);
  }, [currentUser, currentPath, checkAuth]);

  // Calculate params based on known dynamic routes
  const params = useMemo(() => resolveRouteParams(currentPath), [currentPath]);

  const breadcrumbs = useMemo(() => {
    return deriveBreadcrumbs(currentPath, params);
  }, [currentPath, params]);

  const value: RouterContextValue = {
    currentPath,
    query,
    params,
    breadcrumbs,
    navigate,
    replace,
    authorization,
    recheckAuthorization: () => checkAuth(currentPath),
  };

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export const useRouter = (): RouterContextValue => {
  const ctx = useContext(RouterContext);
  if (!ctx) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return ctx;
};

export const useRouteParams = (): RouteParams => {
  const router = useRouter();
  return router.params;
};

/**
 * Para onde ir depois de entrar: o `?voltar=` que a guarda deixou no endereço.
 *
 * Só caminho INTERNO é aceito — começando por uma barra e não por duas. Um
 * `voltar` que apontasse para outro site transformaria o botão de entrar num
 * redirecionamento para qualquer lugar, com a cara da plataforma.
 *
 * O destino do pipeline de autenticação vence quando não é a entrada comum:
 * quem ainda não concluiu o cadastro vai para o onboarding antes de voltar.
 */
export function destinoAposEntrar(destinoDoPipeline: string, voltar: string | null): string {
  if (destinoDoPipeline !== '/') return destinoDoPipeline;
  if (!voltar || !voltar.startsWith('/') || voltar.startsWith('//')) return destinoDoPipeline;
  if (voltar.startsWith('/auth/')) return destinoDoPipeline;
  return voltar;
}
