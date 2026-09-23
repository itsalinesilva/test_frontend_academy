// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { RouterProvider } from '../../src/ui/navigation/router';
import { AppRouterOutlet } from '../../src/ui/screens/AppRouterOutlet';
import { PersistentPracticeRepository } from '../../src/repositories/practice.repository';

/**
 * LX-1 — UMA ÁRVORE SÓ.
 *
 * Havia duas organizações sobre o mesmo conteúdo: a árvore acadêmica (cadeira
 * → curso → módulo → lição), que o Laboratório usa, e `SEED_SKILL_TREES` — 5
 * árvores e 32 nós escritos à mão, com pré-requisitos que não casavam com
 * capítulo nenhum. A pessoa estudava por uma e era avaliada pela outra.
 */

const irPara = (c: string) => {
  window.location.hash = `#${c}`;
};

const montar = () =>
  render(
    <RouterProvider>
      <AppRouterOutlet />
    </RouterProvider>
  );

beforeEach(() => {
  localStorage.clear();
  irPara('/');
});

/** A aba ativa do Laboratório, pelo papel de aba selecionada. */
async function abaAtiva() {
  const abas = await screen.findAllByRole('tab', {}, { timeout: 40000 });
  return abas.find((a) => a.getAttribute('aria-selected') === 'true')?.textContent ?? '';
}

describe('🔴 o endereço antigo e os botões levam à árvore acadêmica', () => {
  it('/practice/skill-tree abre o Laboratório na aba Lições', async () => {
    irPara('/practice/skill-tree');
    montar();
    expect(await abaAtiva()).toMatch(/Lições/);
  });

  it('/practice?aba=licoes abre na aba Lições', async () => {
    irPara('/practice?aba=licoes');
    montar();
    expect(await abaAtiva()).toMatch(/Lições/);
  });

  it('/practice, sem aba pedida, continua abrindo no Feed', async () => {
    irPara('/practice');
    montar();
    expect(await abaAtiva()).not.toMatch(/Lições/);
  });
});

describe('o resíduo sai do navegador', () => {
  it('🔴 a árvore semeada em quem já usou a plataforma é apagada', async () => {
    const chave = `amd_${PersistentPracticeRepository.CHAVE_DA_ARVORE_ANTIGA}`;
    localStorage.setItem(chave, JSON.stringify([{ id: 'tree_ear_training' }]));

    new PersistentPracticeRepository();
    await new Promise((r) => setTimeout(r, 0));

    expect(localStorage.getItem(chave)).toBeNull();
  });
});

describe('🔴 a segunda árvore não volta', () => {
  function arquivos(dir: string): string[] {
    return readdirSync(dir).flatMap((n) => {
      const c = join(dir, n);
      return statSync(c).isDirectory() ? arquivos(c) : /\.(ts|tsx)$/.test(c) ? [c] : [];
    });
  }

  it('nenhum código declara ou lê árvore de competências escrita à mão', () => {
    const PROIBIDOS = [/SEED_SKILL_TREES/, /\bSkillTree\b/, /listSkillTrees|getSkillTree|findSkillTreeById/];
    const achados = arquivos('src').flatMap((f) => {
      const codigo = readFileSync(f, 'utf8')
        // comentário que CONTA a história não é uso
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
      return PROIBIDOS.filter((p) => p.test(codigo)).map((p) => `${f}: ${p}`);
    });
    expect(achados).toEqual([]);
  });

  it('todo botão que levava à árvore antiga leva à aba Lições', () => {
    const antigos = arquivos('src').filter((f) =>
      /navigate\(\s*'\/practice\/skill-tree'/.test(readFileSync(f, 'utf8'))
    );
    expect(antigos).toEqual([]);
  });
});
