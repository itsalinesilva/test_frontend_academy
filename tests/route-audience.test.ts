import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import {
  audienciaDaRota,
  REGRAS_DE_AUDIENCIA,
  rotaDeclarada,
} from '../src/ui/navigation/audiencia';

const root = resolve(__dirname, '..');

function auditar() {
  const output = execFileSync('node', ['scripts/audit-routes.mjs', '--json'], {
    cwd: root,
    encoding: 'utf-8',
  });
  return JSON.parse(output) as {
    routes: string[];
    screens: { nome: string; roteada: boolean; vazaParaVisitante: boolean }[];
    orphans: string[];
    leaking: string[];
  };
}

/**
 * A plataforma tinha oitenta telas e nenhuma declaração de audiência: cada
 * tela decidia sozinha se checava sessão, e menos da metade checava. O
 * resultado aparecia em frases como "Ver meus certificados" numa tela aberta
 * por visitante — uma promessa que a tela não pode cumprir.
 */

describe('tabela de audiência', () => {
  it('a regra mais específica vence', () => {
    // /academy é público, mas /academy/meu-aprendizado não é.
    expect(audienciaDaRota('/academia')).toBe('publica');
    expect(audienciaDaRota('/academia/course/crs_teoria')).toBe('publica');
    expect(audienciaDaRota('/academia/meu-aprendizado')).toBe('exigeLogin');
  });

  it('verificar certificado é público; as credenciais do aluno não', () => {
    // Quem confere um certificado é o empregador, e ele não tem conta aqui.
    expect(audienciaDaRota('/credential/CMU-ABC')).toBe('publica');
    expect(audienciaDaRota('/credentials')).toBe('exigeLogin');
  });

  it('quem já entrou não fica preso na tela de entrar', () => {
    expect(audienciaDaRota('/auth/login')).toBe('somenteVisitante');
    expect(audienciaDaRota('/auth/register')).toBe('somenteVisitante');
  });

  it('a home é pública, porque serve aos dois', () => {
    expect(audienciaDaRota('/')).toBe('publica');
  });

  it('rota desconhecida é pública, e não bloqueada por engano', () => {
    // Errar para o lado de não bloquear; a auditoria acusa a omissão.
    expect(audienciaDaRota('/rota-que-nao-existe')).toBe('publica');
    expect(rotaDeclarada('/rota-que-nao-existe')).toBe(false);
  });

  it('toda regra explica por que existe', () => {
    for (const r of REGRAS_DE_AUDIENCIA) {
      expect(r.porque.length, r.rota).toBeGreaterThan(20);
    }
  });

  it('não há duas regras para a mesma rota', () => {
    const routes = REGRAS_DE_AUDIENCIA.map((r) => r.rota);
    expect(new Set(routes).size).toBe(routes.length);
  });
});

describe('auditoria de rotas da plataforma', () => {
  const r = auditar();

  it('toda tela é alcançável por alguma rota', () => {
    expect(r.orphans, `órfãs: ${r.orphans.join(', ')}`).toEqual([]);
  });

  it('toda rota declara a quem serve', () => {
    const semDeclaracao = r.routes.filter((rota) => !rotaDeclarada(rota));
    expect(semDeclaracao, `sem audiência: ${semDeclaracao.join(', ')}`).toEqual([]);
  });

  it('nenhuma tela pública promete ao visitante o que só o aluno tem', () => {
    expect(r.leaking, `vazam: ${r.leaking.join(', ')}`).toEqual([]);
  });
});
