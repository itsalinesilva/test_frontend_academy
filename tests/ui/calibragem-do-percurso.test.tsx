// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from '../../src/ui/navigation/router';
import { PracticePathScreen } from '../../src/ui/screens/practice/PracticePathScreen';
import { Level } from '../../src/domain/exercise-generator';
import { Dimension } from '../../src/domain/music-grammar';
import { dimensaoDoExercicio, nivelDaProximaLicao } from '../../src/domain/calibragem-do-percurso';

/**
 * L-7 — "MUITO FÁCIL / MUITO DIFÍCIL" É OUVIDO.
 *
 * A tela dizia "o percurso se ajusta a isso" e nada lia o que ela gravava.
 */

vi.mock('../../src/infrastructure/audio/synth', () => ({
  webAudioSynth: { playTone: vi.fn(), playChord: vi.fn(), playSequence: vi.fn() },
}));

let sessao: { userId: string | null; nome: string | null } = { userId: 'u1', nome: 'Aline' };
vi.mock('../../src/ui/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ ...sessao, ehAdmin: false, carregando: false, autenticado: sessao.userId !== null }),
}));

const v = (exerciseId: string, verdict: 'EASY' | 'HARD' | 'REPORTED') => ({ exerciseId, verdict });

describe('a regra', () => {
  it('lê a seção do id do exercício gerado', () => {
    expect(dimensaoDoExercicio('gen_NOTE_0_12')).toBe(Dimension.NOTE);
    expect(dimensaoDoExercicio('gen_KEY_SIGNATURE_1_3')).toBe(Dimension.KEY_SIGNATURE);
    expect(dimensaoDoExercicio('e1')).toBeNull();
  });

  it('mais fáceis que difíceis na seção → NOMEAR; empate ou mais difíceis → RECONHECER', () => {
    expect(nivelDaProximaLicao(Dimension.NOTE, [v('gen_NOTE_0_1', 'EASY')])).toBe(Level.NAME);
    expect(nivelDaProximaLicao(Dimension.NOTE, [v('gen_NOTE_0_1', 'EASY'), v('gen_NOTE_0_2', 'HARD')])).toBe(
      Level.RECOGNIZE
    );
    expect(nivelDaProximaLicao(Dimension.NOTE, [])).toBe(Level.RECOGNIZE);
  });

  it('🔴 conta por SEÇÃO: achar ritmo fácil não sobe harmonia', () => {
    expect(nivelDaProximaLicao(Dimension.CHORD, [v('gen_RHYTHM_0_1', 'EASY')])).toBe(Level.RECOGNIZE);
  });

  it('reportar não mexe no nível — relato não é opinião de dificuldade', () => {
    expect(nivelDaProximaLicao(Dimension.NOTE, [v('gen_NOTE_0_1', 'REPORTED')])).toBe(Level.RECOGNIZE);
  });
});

describe('🔴 na tela, de ponta a ponta', () => {
  beforeEach(() => {
    localStorage.clear();
    sessao = { userId: 'u1', nome: 'Aline' };
  });

  const montar = () =>
    render(
      <RouterProvider>
        <PracticePathScreen />
      </RouterProvider>
    );

  const alternativas = () => screen.getAllByRole('button').filter((b) => b.hasAttribute('aria-pressed'));

  it('marcar "muito fácil" grava, e a próxima lição da seção sobe de nível', async () => {
    const user = userEvent.setup();
    const { unmount } = montar();

    await user.click(await screen.findByRole('button', { name: 'Nota' }, { timeout: 20000 }));
    expect(alternativas(), 'RECONHECER tem três alternativas').toHaveLength(3);

    await user.click(alternativas()[0]);
    await user.click(screen.getByRole('button', { name: 'Conferir' }));
    await user.click(screen.getByRole('button', { name: /muito fácil/ }));
    expect(screen.getByText(/o percurso se ajusta a isso/)).toBeInTheDocument();

    /** Outra visita: nada em memória, só o que foi gravado. */
    unmount();
    montar();
    await user.click(await screen.findByRole('button', { name: 'Nota' }, { timeout: 20000 }));
    expect(alternativas(), 'a lição não subiu para NOMEAR').toHaveLength(4);
  });

  it('L-7a: "reportar" envia ao servidor, com o enunciado — e só confirma se chegou', async () => {
    const enviados: unknown[] = [];
    const fetchOriginal = globalThis.fetch;
    globalThis.fetch = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      enviados.push(JSON.parse(String(init?.body)));
      return new Response(JSON.stringify({ data: { id: 'r1' } }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      });
    }) as typeof fetch;
    try {
      const user = userEvent.setup();
      montar();
      await user.click(await screen.findByRole('button', { name: 'Nota' }, { timeout: 20000 }));
      await user.click(alternativas()[0]);
      await user.click(screen.getByRole('button', { name: 'Conferir' }));
      await user.click(screen.getByRole('button', { name: /Reportar/ }));

      expect(await screen.findByText(/vamos revisar/i)).toBeInTheDocument();
      expect(enviados[0]).toMatchObject({ enunciado: expect.stringMatching(/pauta/) });
    } finally {
      globalThis.fetch = fetchOriginal;
    }
  });

  it('sem sessão, não pergunta — não haveria de quem guardar', async () => {
    sessao = { userId: null, nome: null };
    const user = userEvent.setup();
    montar();
    /** 🔴 O visitante vê o percurso — antes ficava em "Abrindo o percurso…" para sempre. */
    await user.click(await screen.findByRole('button', { name: 'Nota' }, { timeout: 20000 }));
    await user.click(alternativas()[0]);
    await user.click(screen.getByRole('button', { name: 'Conferir' }));
    const status = screen.getAllByRole('status');
    expect(within(status[status.length - 1]).queryByRole('button', { name: /muito fácil/ })).toBeNull();
  });
});
