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
  currentPath: string;
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
  ACADEMY: '/academy',
  ACADEMY_CATALOG: '/academy/catalog',
  ACADEMY_SEARCH: '/academy/search',
  ACADEMY_SEARCH_RESULTS: '/academy/search/results',
  ACADEMY_CATEGORY: '/academy/category/:id',
  ACADEMY_PROGRAM: '/academy/program/:id',
  ACADEMY_PATH: '/academy/path/:id',
  ACADEMY_COURSE: '/academy/course/:id',
  ACADEMY_COURSE_CURRICULUM: '/academy/course/:id/curriculum',
  ACADEMY_COURSE_PROGRESS: '/academy/course/:id/progress',
  ACADEMY_MODULE: '/academy/course/:courseId/module/:moduleId',
  ACADEMY_LESSON: '/academy/lesson/:id',
  ACADEMY_INTERACTIVE_LESSON: '/academy/lesson/:id/interactive',
  ACADEMY_ACTIVITY: '/academy/activity/:id',
  ACADEMY_QUIZ: '/academy/quiz/:id',
  ACADEMY_ASSESSMENT: '/academy/assessment/:id',
  ACADEMY_RESULT: '/academy/result/:id',
  ACADEMY_COMPLETION: '/academy/completion/:id',
  ACADEMY_CERTIFICATE: '/academy/certificate/:id',
  ACADEMY_MY_LEARNING: '/academy/my-learning',
  ACADEMY_HISTORY: '/academy/history',
  ACADEMY_PROFILE: '/academy/academic-profile',

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
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ENGINES: '/admin/engines',
  ADMIN_CONTENT: '/admin/content',
  ADMIN_MODERATION: '/admin/moderation',
  ADMIN_AUDIT: '/admin/audit',
  ADMIN_CREDENTIALS: '/admin/credentials',

  // Conta infantil: criacao e acompanhamento parental.
  KIDS_CREATE: '/kids/create',
  KIDS_MANAGE: '/kids/manage',

  // Verificacao publica de documento. NAO exige sessao: quem confere um
  // certificado e um empregador, uma banca, uma secretaria — gente que nao
  // tem conta e nao vai criar uma para conferir um documento.
  CREDENTIAL_VERIFY: '/credential',
  CREDENTIAL_BY_CODE: '/credential/:codigo',
} as const;

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
  if (path.startsWith('/academy')) {
    crumbs.push({ label: 'Academia', path: '/academy' });
    if (path === '/academy/catalog') {
      crumbs.push({ label: 'Catálogo de Cursos' });
    } else if (path === '/academy/search') {
      crumbs.push({ label: 'Busca Acadêmica' });
    } else if (path === '/academy/search/results') {
      crumbs.push({ label: 'Resultados da Busca' });
    } else if (path.startsWith('/academy/category/')) {
      crumbs.push({ label: `Cátedra: ${params.id || 'Especialização'}` });
    } else if (path.startsWith('/academy/program/')) {
      crumbs.push({ label: `Programa: ${params.id || 'Detalhes'}` });
    } else if (path.startsWith('/academy/path/')) {
      crumbs.push({ label: `Trilha: ${params.id || 'Detalhes'}` });
    } else if (path.includes('/curriculum')) {
      crumbs.push({ label: 'Grade Curricular' });
    } else if (path.includes('/progress')) {
      crumbs.push({ label: 'Progresso do Curso' });
    } else if (path.startsWith('/academy/course/')) {
      crumbs.push({ label: `Curso: ${params.id || 'Detalhes'}` });
    } else if (path.includes('/interactive')) {
      crumbs.push({ label: 'Laboratório Interativo' });
    } else if (path.startsWith('/academy/lesson/')) {
      crumbs.push({ label: 'Lição' });
    } else if (path.startsWith('/academy/activity/')) {
      crumbs.push({ label: 'Atividade Prática' });
    } else if (path.startsWith('/academy/quiz/')) {
      crumbs.push({ label: 'Quiz de Verificação' });
    } else if (path.startsWith('/academy/assessment/')) {
      crumbs.push({ label: 'Avaliação Acadêmica' });
    } else if (path.startsWith('/academy/result/')) {
      crumbs.push({ label: 'Resultado do Exame' });
    } else if (path.startsWith('/academy/completion/')) {
      crumbs.push({ label: 'Conclusão de Curso' });
    } else if (path.startsWith('/academy/certificate/')) {
      crumbs.push({ label: 'Certificado Digital' });
    } else if (path === '/academy/my-learning') {
      crumbs.push({ label: 'Meu Aprendizado' });
    } else if (path === '/academy/history') {
      crumbs.push({ label: 'Histórico Acadêmico' });
    } else if (path === '/academy/academic-profile') {
      crumbs.push({ label: 'Perfil Acadêmico' });
    }
    return crumbs;
  }

  // Practice
  if (path.startsWith('/practice')) {
    crumbs.push({ label: 'Prática & Treino', path: '/practice' });
    if (path === '/practice/skill-tree') crumbs.push({ label: 'Árvore de Habilidades' });
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
  if (path.startsWith('/admin')) {
    crumbs.push({ label: 'Governança Admin', path: '/admin' });
    if (path === '/admin/credentials') crumbs.push({ label: 'Estúdio de Credenciais' });
    else if (path === '/admin/users') crumbs.push({ label: 'Usuários & Papéis' });
    else if (path === '/admin/engines') crumbs.push({ label: 'Engines & Gateway' });
    else if (path === '/admin/content') crumbs.push({ label: 'Conteúdo & Currículo' });
    else if (path === '/admin/moderation') crumbs.push({ label: 'Moderação' });
    else if (path === '/admin/audit') crumbs.push({ label: 'Auditoria Imutável' });
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
 * estava incompleta: `/academy/course/:id/curriculum`, `/.../progress`,
 * `/academy/lesson/:id/interactive`, `/academy/quiz/:id`,
 * `/academy/category/:id` e `/practice/feedback/:id` ficaram de fora. Como
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

export function resolveRouteParams(path: string): RouteParams {
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
  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);
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
      checkAuth(sanitized);
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
      checkAuth(sanitized);
    },
    [checkAuth]
  );

  // Sync with browser hash changes (e.g. back/forward button)
  useEffect(() => {
    const handleHashChange = () => {
      const hashPath = window.location.hash ? window.location.hash.replace('#', '') : '/';
      setCurrentPath(hashPath);
      checkAuth(hashPath);
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
