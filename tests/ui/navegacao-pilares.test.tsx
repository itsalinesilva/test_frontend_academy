// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PILARES, pilarDaRota } from '../../src/ui/navigation/pilares';
import { CIRCULATION_CHAIN } from '../../src/ui/components/navigation/CirculationBar';
import { audienciaDaRota } from '../../src/ui/navigation/audiencia';

/**
 * OS CINCO PILARES — uma lista, e não três.
 *
 * 🔴 O DEFEITO QUE ESTES CASOS GUARDAM
 * ------------------------------------
 * Havia **três listas de navegação independentes**: a barra inferior do
 * `AppShell`, o menu do chevron e a `CirculationBar`. Cada uma mantida à mão,
 * cada uma com itens diferentes — e o **Acervo não estava em nenhuma delas**.
 *
 * Vinte e quatro mil novecentas e cinquenta e sete obras, duzentas e trinta e
 * quatro pessoas, mil trezentas e quarenta e nove partituras, rota pública
 * desde o início — e sem porta na interface. Nem para quem já entrou.
 *
 * Três listas divergem na primeira tela nova. Uma lista não tem como.
 */

describe('a navegação tem cinco pilares, e só', () => {
  it('são exatamente estes cinco', () => {
    expect(PILARES.map((p) => p.label)).toEqual([
      'Academia',
      'Laboratório',
      'Acervo',
      'Estúdio',
      'Perfil',
    ]);
  });

  it('🔴 o ACERVO está entre eles', () => {
    /** O caso que não existia, e por isso o defeito durou. */
    const acervo = PILARES.find((p) => p.path === '/acervo');
    expect(acervo, 'o Acervo saiu da navegação de novo').toBeDefined();
  });

  it('a corrente de circulação lê a MESMA lista', () => {
    /**
     * Ela tinha oito passos — Score e Studio separados, mais Community, Event
     * e Room. Corrente de oito não é corrente: é um terceiro menu.
     */
    expect(CIRCULATION_CHAIN.map((c) => c.path)).toEqual(PILARES.map((p) => p.path));
  });

  it('nenhuma superfície de navegação declara lista própria', () => {
    /**
     * A prova de que a fonte é uma só. Um arranjo literal de rotas dentro de
     * um componente de navegação é a semente das três listas.
     */
    const superficies = [
      'src/ui/components/layout/AppShell.tsx',
      'src/ui/components/navigation/CirculationBar.tsx',
      'src/ui/components/layout/ExplorarMenu.tsx',
    ];

    for (const arquivo of superficies) {
      const fonte = readFileSync(arquivo, 'utf-8');
      expect(fonte, `${arquivo} não lê os pilares`).toContain('PILARES');

      /**
       * `path: '/algo'` escrito à mão é lista própria voltando.
       *
       * DUAS EXCEÇÕES, e elas são nomeadas em vez de a regra ser afrouxada:
       * `/rooms` e `/founder` aparecem só para quem tem papel — docente e
       * administração. Não são pilares, e pô-los na lista os ofereceria a
       * todo mundo.
       */
      const PERMITIDAS = ['/rooms', '/founder'];
      const literais = [...fonte.matchAll(/path:\s*'(\/[a-z-]+)'/g)]
        .map((m) => m[1])
        .filter((r) => !PERMITIDAS.includes(r));

      expect(literais, `${arquivo} voltou a declarar rota à mão`).toEqual([]);
    }
  });
});

describe('o que não é pilar é sub-rota', () => {
  it('o editor de partitura vive DENTRO do Estúdio', () => {
    /**
     * `/score` era um pilar ao lado do Estúdio. São a mesma sala: um edita
     * notação, o outro edita som. Separá-los gastava um dos cinco lugares — e
     * foi por isso que o Acervo ficou de fora.
     */
    expect(pilarDaRota('/score')?.id).toBe('estudio');
  });

  it('o Atlas vive DENTRO do Acervo', () => {
    /** O mapa é a vista do mesmo catálogo, e há teste provando que a verdade é uma. */
    expect(pilarDaRota('/worlds')?.id).toBe('acervo');
  });

  it('a sub-rota de uma ficha volta ao pilar certo', () => {
    expect(pilarDaRota('/acervo/compositor/bach')?.id).toBe('acervo');
    expect(pilarDaRota('/academia/curso/teoria')?.id).toBe('academia');
  });

  it('rota fora de qualquer pilar devolve NADA, e não o primeiro', () => {
    /** Devolver o primeiro destacaria "Academia" em telas que não são dela. */
    expect(pilarDaRota('/founder')).toBeUndefined();
  });
});

describe('todo pilar é alcançável por quem chega', () => {
  it('🔴 nenhum pilar exige login SEM ter porta de visitante', () => {
    /**
     * O Laboratório exigia login, e o visitante batia na porta — não havia
     * conteúdo dele. Uma escola que não deixa ver a aula antes de matricular
     * perde quem ia se matricular.
     *
     * Perfil e Estúdio continuam exigindo nome, e é correto: um é a conta, o
     * outro salva projeto assinado. Os três primeiros pilares são a vitrine.
     */
    const vitrine = PILARES.filter((p) => ['academia', 'laboratorio', 'acervo'].includes(p.id));
    expect(vitrine).toHaveLength(3);

    for (const p of vitrine) {
      expect(audienciaDaRota(p.path), `${p.label} está fechado para quem chega`).not.toBe(
        'exigeLogin'
      );
    }
  });

  it('o Laboratório abre para visitante', () => {
    expect(audienciaDaRota('/practice')).toBe('publica');
  });

  it('o Acervo abre para visitante', () => {
    expect(audienciaDaRota('/acervo')).toBe('publica');
  });

  it('Perfil e Configurações continuam exigindo nome', () => {
    /** Não-vacuidade: se tudo fosse público, o caso acima passaria à toa. */
    expect(audienciaDaRota('/profile')).toBe('exigeLogin');
    expect(audienciaDaRota('/settings')).toBe('exigeLogin');
  });

  it('o Estúdio abre para visitante; guardar é que pede nome (AUD-1)', () => {
    expect(audienciaDaRota('/studio')).toBe('publica');
    expect(audienciaDaRota('/studio/score/novo')).toBe('publica');
  });
});
