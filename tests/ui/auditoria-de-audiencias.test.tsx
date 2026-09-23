// @vitest-environment jsdom
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { render, cleanup } from '@testing-library/react';
import { RouterProvider, CANONICAL_ROUTES } from '../../src/ui/navigation/router';
import { AppRouterOutlet } from '../../src/ui/screens/AppRouterOutlet';
import { SEED_COURSES, SEED_MODULES, SEED_LESSONS } from '../../src/data/seed-academy-content';
import { SEED_ARTICLES } from '../../src/data/seed-articles';
import { audienciaDaRota } from '../../src/ui/navigation/audiencia';
import { GuardaDeAudiencia } from '../../src/ui/navigation/GuardaDeAudiencia';

/**
 * AUDITORIA DE AUDIÊNCIAS — toda rota, nas três pessoas que a plataforma tem.
 *
 * Visitante, aluna e administradora abrem CADA rota pelo roteador de verdade,
 * com a guarda de audiência por fora do outlet, como no `App`.
 * A pessoa muda pela SESSÃO (`authService.getActiveSession`), e não por um
 * gancho falso: é a sessão que a guarda e a checagem do `/founder` leem, e
 * trocar por dentro deixaria de fora justamente o que se quer conferir.
 *
 * O que cada abertura vira:
 *   ABRE       a tela abriu
 *   CONVITE    abriu com a versão de visitante (o convite)
 *   LOGIN      a guarda pediu entrada
 *   ADMIN      acesso institucional recusado
 *   CONTA      "você já está na sua conta" (tela só de visitante)
 *   404        página não encontrada
 *   CARREGANDO não saiu do carregamento
 *   ERRO       a tela quebrou
 */

type Pessoa = 'visitante' | 'aluna' | 'admin';

const sessaoAtual: { valor: unknown } = { valor: null };
vi.mock('../../src/services/application/auth.service', async () => {
  const real = await vi.importActual<typeof import('../../src/services/application/auth.service')>(
    '../../src/services/application/auth.service'
  );
  real.authService.getActiveSession = (async () => sessaoAtual.valor) as never;
  return real;
});
vi.mock('../../src/infrastructure/audio/synth', () => ({
  webAudioSynth: { playTone: vi.fn(), playChord: vi.fn(), playSequence: vi.fn() },
}));

const SESSOES: Record<Pessoa, unknown> = {
  visitante: null,
  aluna: {
    accessToken: 't',
    isAdmin: false,
    mode: 'ADULT',
    user: { id: 'u_aluna', name: 'Aluna de Teste', email: 'aluna@exemplo.org', primaryRole: 'STUDENT', assignedRoles: ['STUDENT'] },
  },
  admin: {
    accessToken: 't',
    isAdmin: true,
    mode: 'ADULT',
    user: { id: 'u_admin', name: 'Administração', email: 'admin@exemplo.org', primaryRole: 'ADMIN', assignedRoles: ['ADMIN'] },
  },
};

/** Ids de verdade onde a rota pede um — "x" mediria a tela de "não encontrado". */
const EXEMPLO: Record<string, string> = {
  course: SEED_COURSES[0].id,
  courseId: SEED_COURSES[0].id,
  moduleId: SEED_MODULES[0].id,
  lesson: SEED_LESSONS[0].id,
  obra: 'obra-bar-bach-prelude',
  compositor: 'bach-johann-sebastian',
  artigo: SEED_ARTICLES[0].id,
};

function concretizar(rota: string): string {
  return rota.replace(/:(\w+)/g, (_, nome: string) => {
    if (nome === 'courseId') return EXEMPLO.courseId;
    if (nome === 'moduleId') return EXEMPLO.moduleId;
    if (rota.includes('/course/')) return EXEMPLO.course;
    if (rota.includes('/lesson/')) return EXEMPLO.lesson;
    if (rota.includes('/obra/')) return EXEMPLO.obra;
    if (rota.includes('/compositor/')) return EXEMPLO.compositor;
    if (rota.includes('/artigo/')) return EXEMPLO.artigo;
    return 'x';
  });
}

/** As rotas: as canônicas e as que o outlet atende por igualdade. */
const ROTAS = (() => {
  const outlet = readFileSync('src/ui/screens/AppRouterOutlet.tsx', 'utf8');
  const servidas = [...outlet.matchAll(/currentPath === '([^']+)'/g)].map((m) => m[1]);
  return [...new Set([...(Object.values(CANONICAL_ROUTES) as string[]), ...servidas])]
    .filter((r) => r !== '' && r !== '/overview')
    .map((r) => ({ rota: r, endereco: concretizar(r) }));
})();

type Resultado = 'ABRE' | 'CONVITE' | 'LOGIN' | 'ADMIN' | 'CONTA' | '404' | 'CARREGANDO' | 'ERRO' | 'CRIANCA';

async function abrir(endereco: string, pessoa: Pessoa): Promise<{ r: Resultado; detalhe?: string }> {
  sessaoAtual.valor = SESSOES[pessoa];
  localStorage.clear();
  window.location.hash = `#${endereco}`;
  const erros: string[] = [];
  const espiao = vi.spyOn(console, 'error').mockImplementation((...a: unknown[]) => {
    erros.push(String(a[0]).slice(0, 120));
  });
  try {
    render(
      /** A MESMA composição do App: a guarda por fora do outlet. Sem ela, a auditoria mediria rota sem porteiro. */
      <RouterProvider>
        <GuardaDeAudiencia>
          <AppRouterOutlet />
        </GuardaDeAudiencia>
      </RouterProvider>
    );
  } catch (e) {
    espiao.mockRestore();
    cleanup();
    return { r: 'ERRO', detalhe: (e as Error).message.slice(0, 120) };
  }

  /** Espera a tela assentar: sem "verificando", sem "carregando". */
  let texto = '';
  for (let i = 0; i < 40; i++) {
    await new Promise((ok) => setTimeout(ok, 50));
    texto = document.body.textContent ?? '';
    if (!/Verificando autorização|Carregando|Abrindo|Preparando|Montando/i.test(texto)) break;
  }
  const temConvite = !!document.getElementById('convite-titulo');
  espiao.mockRestore();
  cleanup();

  if (/Página Não Encontrada/.test(texto)) return { r: '404' };
  if (/Acesso Institucional Restrito|Esta área não está disponível para a sua conta/.test(texto)) return { r: 'ADMIN' };
  if (/Esta parte fica com quem cuida/.test(texto)) return { r: 'CRIANCA' };
  if (/Esta página é da sua conta/.test(texto)) return { r: 'LOGIN' };
  if (/Você já está na sua conta/.test(texto)) return { r: 'CONTA' };
  if (/Algo deu errado|Something went wrong/i.test(texto)) return { r: 'ERRO', detalhe: erros[0] };
  if (/Verificando autorização|Carregando|Abrindo|Preparando|Montando/i.test(texto) && texto.length < 400) {
    return { r: 'CARREGANDO' };
  }
  return { r: temConvite ? 'CONVITE' : 'ABRE' };
}

const MATRIZ: Array<{ rota: string; audiencia: string } & Record<Pessoa, Resultado>> = [];

describe('auditoria de audiências', () => {
  beforeAll(async () => {
    for (const { rota, endereco } of ROTAS) {
      const linha = { rota, audiencia: audienciaDaRota(endereco) } as (typeof MATRIZ)[number];
      for (const p of ['visitante', 'aluna', 'admin'] as Pessoa[]) linha[p] = (await abrir(endereco, p)).r;
      MATRIZ.push(linha);
    }
    // eslint-disable-next-line no-console
    console.log('AUDITORIA_JSON:' + JSON.stringify(MATRIZ));
  }, 600000);

  it('a auditoria percorreu as rotas', () => {
    expect(MATRIZ.length).toBeGreaterThan(60);
  });

  it('🔴 nenhuma rota quebra, em nenhuma das três pessoas', () => {
    const quebradas = MATRIZ.flatMap((l) =>
      (['visitante', 'aluna', 'admin'] as Pessoa[]).filter((p) => l[p] === 'ERRO').map((p) => `${l.rota} (${p})`)
    );
    expect(quebradas).toEqual([]);
  });

  it('🔴 nenhuma rota servida dá 404 para quem pode estar nela', () => {
    const perdidas = MATRIZ.filter((l) => l.aluna === '404' || l.admin === '404').map((l) => l.rota);
    expect(perdidas).toEqual([]);
  });

  it('🔴 o console de administração só abre para a administração', () => {
    for (const l of MATRIZ.filter((x) => x.rota.startsWith('/founder'))) {
      expect(l.visitante, `${l.rota} abriu para visitante`).not.toMatch(/ABRE|CONVITE/);
      expect(l.aluna, `${l.rota} abriu para aluna`).not.toMatch(/ABRE|CONVITE/);
      expect(l.admin, `${l.rota} não abriu para a administração`).toBe('ABRE');
    }
  });

  it('🔴 rota que exige conta não abre o conteúdo para visitante', () => {
    const vazaram = MATRIZ.filter((l) => l.audiencia === 'exigeLogin' && /ABRE/.test(l.visitante)).map((l) => l.rota);
    expect(vazaram).toEqual([]);
  });
});
