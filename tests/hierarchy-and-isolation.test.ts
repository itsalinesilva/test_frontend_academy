import { describe, it, expect } from 'vitest';
import {
  Audiencia,
  REGRAS_DE_AUDIENCIA,
  audienciaDaRota,
} from '../src/ui/navigation/audiencia';

/**
 * A hierarquia do sistema.
 *
 * Três públicos, e eles não se misturam: **visitante**, **aluno** e
 * **administração**. O que estes casos guardam não é a existência das telas —
 * é a separação entre elas.
 *
 * O QUE ESTAVA PARTIDO ATÉ 19/09
 * ------------------------------
 * A tabela declarava `/admin` como `exigeLogin`, e quem de fato barrava o
 * aluno comum era um efeito no `AppRouterOutlet` chamando `checkRouteAccess`.
 * A proteção funcionava — mas a hierarquia vivia em **dois sistemas**, um
 * declarativo e um imperativo, e só o primeiro era auditado.
 *
 * Duas fontes de verdade sobre quem alcança o quê divergem na primeira rota
 * nova. Uma tela administrativa criada fora do prefixo `/admin` não seria
 * protegida por ninguém, e a tabela continuaria dizendo que estava tudo certo.
 */

const NIVEIS: Audiencia[] = ['publica', 'exigeLogin', 'somenteVisitante', 'exigeAdmin'];

describe('os quatro níveis existem e são distintos', () => {
  it('toda regra declara um nível conhecido', () => {
    for (const r of REGRAS_DE_AUDIENCIA) {
      expect(NIVEIS, `${r.rota}`).toContain(r.audiencia);
    }
  });

  it('toda regra diz POR QUE é assim', () => {
    /**
     * O campo `porque` não serve ao runtime: serve à revisão. Regra de
     * audiência sem justificativa é regra que ninguém ousa mudar, porque
     * ninguém sabe o que ela protegia.
     */
    for (const r of REGRAS_DE_AUDIENCIA) {
      expect(r.porque.length, r.rota).toBeGreaterThan(15);
    }
  });

  it('não há duas regras para a mesma rota', () => {
    const rotas = REGRAS_DE_AUDIENCIA.map((r) => r.rota);
    expect(new Set(rotas).size).toBe(rotas.length);
  });
});

describe('administração é nível próprio, e não "logado"', () => {
  it('/admin exige administração', () => {
    expect(audienciaDaRota('/admin')).toBe('exigeAdmin');
  });

  it('toda subrota de /admin herda a exigência', () => {
    // Herdar aqui é o comportamento certo: a raiz é a mais restritiva.
    for (const sub of [
      '/admin/users',
      '/admin/engines',
      '/admin/content',
      '/admin/moderation',
      '/admin/credentials',
      '/admin/booklets',
      '/admin/biblioteca',
      '/admin/audit',
    ]) {
      expect(audienciaDaRota(sub), sub).toBe('exigeAdmin');
    }
  });

  it('estar logado não basta para a administração', () => {
    /**
     * É a distinção que o nível novo existe para fazer. Enquanto `/admin` era
     * `exigeLogin`, a tabela dizia que qualquer aluno alcançava o console — e
     * só um segundo sistema, não auditado, impedia.
     */
    expect(audienciaDaRota('/admin')).not.toBe('exigeLogin');
  });
});

describe('o que é de alguém não é público', () => {
  it('as rotas de registro pessoal exigem login', () => {
    for (const rota of [
      '/academy/result/sub_1',
      '/academy/certificate/cert_1',
      '/academy/completion/c_1',
      '/academy/history',
      '/academy/meu-aprendizado',
      '/profile',
      '/notifications',
      '/settings',
    ]) {
      expect(audienciaDaRota(rota), rota).toBe('exigeLogin');
    }
  });

  it('`/academy/result` não volta a herdar pública', () => {
    /**
     * O vazamento de 19/09: a rota herdava `publica` de `/academy`, e a tela
     * buscava a submissão só pelo identificador. Quem tivesse um id via a
     * nota, a aprovação e o número de certificado de outra pessoa.
     */
    expect(audienciaDaRota('/academy')).toBe('publica');
    expect(audienciaDaRota('/academy/result/qualquer-coisa')).toBe('exigeLogin');
  });

  it('o catálogo continua aberto — restringir tudo seria o erro oposto', () => {
    // Trancar o catálogo esconderia o produto de quem ainda não decidiu.
    expect(audienciaDaRota('/academy')).toBe('publica');
    expect(audienciaDaRota('/worlds')).toBe('publica');
    expect(audienciaDaRota('/score')).toBe('publica');
  });
});

describe('prefixo mais longo vence', () => {
  it('a regra específica ganha da genérica', () => {
    expect(audienciaDaRota('/academy')).toBe('publica');
    expect(audienciaDaRota('/academy/history')).toBe('exigeLogin');
  });

  it('rota desconhecida vale como pública', () => {
    /**
     * Erra para o lado de não bloquear, e não para o de trancar. O risco de
     * uma rota nova ficar aberta é real, e é por isso que existe verificação
     * de máquina: `checkPersonalRouteInheritingPublic` acusa quando a rota
     * parece registro de pessoa e a tela não consulta a sessão.
     */
    expect(audienciaDaRota('/rota-que-nao-existe')).toBe('publica');
  });
});

describe('visitante tem para onde ir', () => {
  it('as rotas de entrada são só de visitante', () => {
    // Quem já entrou não tem o que fazer na tela de entrar.
    expect(audienciaDaRota('/auth/login')).toBe('somenteVisitante');
    expect(audienciaDaRota('/auth/register')).toBe('somenteVisitante');
  });

  it('a raiz é pública: serve aos dois', () => {
    expect(audienciaDaRota('/')).toBe('publica');
  });
});
