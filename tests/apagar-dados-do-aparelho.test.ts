// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  apagarDadosDoAparelho,
  BANCOS_INDEXEDDB,
  CHAVES_SEM_PREFIXO,
} from '../src/infrastructure/storage/apagar-dados-do-aparelho';
import { lerPreferencias, salvarPreferencias, PREFERENCIAS_PADRAO } from '../src/repositories/preferencias.repository';

/**
 * AUD-17 — sair apagava só a sessão. Em aparelho compartilhado, contas com
 * e-mail, perfis, prática, caderno e gravações ficavam para a próxima pessoa.
 */

beforeEach(() => localStorage.clear());

describe('apagar os dados do aparelho', () => {
  it('🔴 some tudo o que a plataforma guardou — e a acessibilidade fica', async () => {
    localStorage.setItem('amd_users_collection', '[{"email":"a@x.org"}]');
    localStorage.setItem('amd_estudio_caderno_v1', '[]');
    localStorage.setItem('onboarding_draft_state_v2', '{}');
    localStorage.setItem('de_outro_site', 'fica');
    salvarPreferencias({ ...PREFERENCIAS_PADRAO, altoContraste: true });
    const apagados: string[] = [];
    (globalThis as Record<string, unknown>).indexedDB = {
      deleteDatabase: (nome: string) => {
        apagados.push(nome);
        const pedido: Record<string, () => void> = {};
        queueMicrotask(() => pedido.onsuccess?.());
        return pedido;
      },
    };

    await apagarDadosDoAparelho();

    expect(localStorage.getItem('amd_users_collection')).toBeNull();
    expect(localStorage.getItem('amd_estudio_caderno_v1')).toBeNull();
    expect(localStorage.getItem('onboarding_draft_state_v2')).toBeNull();
    expect(localStorage.getItem('de_outro_site')).toBe('fica');
    expect(apagados).toEqual(['muscicapa-mesa']);
    expect(lerPreferencias().altoContraste).toBe(true);
    vi.restoreAllMocks();
  });
});

/** Todo arquivo .ts/.tsx de src. */
function fontes(dir = 'src'): string[] {
  return readdirSync(dir).flatMap((n) => {
    const c = join(dir, n);
    return statSync(c).isDirectory() ? fontes(c) : /\.tsx?$/.test(c) ? [c] : [];
  });
}

describe('🔴 nenhum dado escapa da lista de apagar', () => {
  const codigo = fontes().map((f) => ({ f, s: readFileSync(f, 'utf8') }));

  it('todo banco IndexedDB aberto está na lista', () => {
    const abertos = codigo.flatMap(({ s }) => [...s.matchAll(/indexedDB\.open\('([^']+)'/g)].map((m) => m[1]));
    expect(abertos.length).toBeGreaterThan(0);
    for (const nome of abertos) expect(BANCOS_INDEXEDDB, nome).toContain(nome);
  });

  it('toda chave de localStorage fora do prefixo amd_ está na lista', () => {
    const constantes = codigo.flatMap(({ s }) =>
      [...s.matchAll(/const \w*(?:KEY|CHAVE)\w*\s*=\s*'([^']+)'/g)].map((m) => ({ nome: m[1], s }))
    );
    const soltas = codigo
      .filter(({ f }) => !f.includes('storage-adapter'))
      .flatMap(({ s }) => [...s.matchAll(/localStorage\.setItem\((\w+)/g)].map((m) => m[1]));
    for (const variavel of soltas) {
      const valor = constantes.find((c) => c.s.includes(`const ${variavel}`))?.nome;
      if (valor === undefined) continue; // chave montada em tempo de execução: o adaptador cuida
      expect(CHAVES_SEM_PREFIXO as readonly string[], variavel).toContain(valor);
    }
  });
});
