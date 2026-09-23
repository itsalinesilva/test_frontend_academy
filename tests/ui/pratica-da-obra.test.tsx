// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider } from '../../src/ui/navigation/router';
import { AppRouterOutlet } from '../../src/ui/screens/AppRouterOutlet';
import { REPERTORIO_DO_PLAYER } from '../../src/data/seed-player-repertoire';
import { nomeDoCompasso, nomeDoIntervalo, praticaDaObra } from '../../src/domain/pratica-da-obra';

/**
 * AC-1i — "LEVAR À PRÁTICA" PRATICA A OBRA.
 */

vi.mock('../../src/infrastructure/audio/synth', () => ({
  webAudioSynth: { playTone: vi.fn(), playChord: vi.fn(), playSequence: vi.fn() },
}));

describe('o nome do intervalo sai da LETRA e dos semitons', () => {
  it.each([
    ['C4', 'E4', 'terça maior'],
    ['C4', 'Eb4', 'terça menor'],
    ['C4', 'D#4', 'segunda aumentada'],
    ['F4', 'B4', 'quarta aumentada'],
    ['B4', 'F5', 'quinta diminuta'],
    ['C4', 'C5', 'oitava justa'],
    ['E4', 'C4', 'terça maior'],
    ['G4', 'F5', 'sétima menor'],
  ])('%s → %s é %s', (a, b, nome) => {
    expect(nomeDoIntervalo(a, b)).toBe(nome);
  });

  it('além da oitava não nomeia — a prática não pergunta o que a pauta mal mostra', () => {
    expect(nomeDoIntervalo('C4', 'E5')).toBeNull();
  });

  it('o compasso: simples e composto', () => {
    expect(nomeDoCompasso('3/4')).toBe('ternário simples');
    expect(nomeDoCompasso('6/8')).toBe('binário composto');
    expect(nomeDoCompasso('5/4')).toBeNull();
  });
});

describe('🔴 a prática de cada peça do repertório é íntegra', () => {
  const pecas = REPERTORIO_DO_PLAYER.filter((f) => f.escrita.filter(([n]) => n !== '_').length >= 4);

  it('a varredura tem peças de verdade', () => {
    expect(pecas.length).toBeGreaterThan(10);
  });

  it.each(pecas.map((f) => [f.id, f] as const))('%s', (_, f) => {
    const exercicios = praticaDaObra({ ...f, id: f.id });
    expect(exercicios.length, 'peça com escrita e sem prática').toBeGreaterThanOrEqual(3);
    /** Peça que repete um desenho perdia a pergunta de ouvido: distratores iguais ao certo. */
    if (f.escrita.filter(([n]) => n !== '_').length >= 8) {
      expect(exercicios.some((e) => e.audio), 'peça longa sem pergunta de ouvido').toBe(true);
    }

    for (const e of exercicios) {
      const certa = e.choices.find((c) => e.correctIds.includes(c.id));
      expect(certa, `${e.id}: a resposta não está entre as alternativas`).toBeDefined();
      expect(new Set(e.choices.map((c) => c.label)).size, `${e.id}: alternativa repetida`).toBe(e.choices.length);
      expect(e.choices.length).toBeGreaterThanOrEqual(3);
      expect(e.explanation.trim().endsWith('.')).toBe(true);

      /** O intervalo é refeito a partir da figura, sem perguntar ao gerador. */
      if (e.prompt.startsWith('Que intervalo') && e.figura?.kind === 'STAFF') {
        const [a, b] = e.figura.notes;
        expect(certa!.label).toBe(nomeDoIntervalo(a, b));
      }
      /** A nota perguntada é uma nota da peça. */
      if (e.prompt.startsWith('Que nota') && e.figura?.kind === 'STAFF') {
        expect(f.escrita.map(([n]) => n)).toContain(e.figura.notes[0]);
      }
      /** De ouvido, sem figura — mostrar a pauta entregaria a resposta. */
      if (e.audio) expect(e.figura).toBeUndefined();
    }
  });
});

describe('🔴 na tela', () => {
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

  it('/practice?obra=… abre a prática da peça, e não o Laboratório genérico', async () => {
    irPara('/practice?obra=obra-bar-bach-prelude');
    montar();
    expect(await screen.findByText(/Que nota da peça/, {}, { timeout: 40000 })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Feed/ })).toBeNull();
  });

  it('obra inexistente diz isso', async () => {
    irPara('/practice?obra=nao-existe');
    montar();
    expect(await screen.findByText(/não está no acervo/, {}, { timeout: 40000 })).toBeInTheDocument();
  });
});
