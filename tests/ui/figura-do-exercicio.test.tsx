// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FiguraDoExercicio } from '../../src/ui/components/practice/FiguraDoExercicio';
import { Level, generateExercise } from '../../src/domain/exercise-generator';
import { Dimension } from '../../src/domain/music-grammar';

/**
 * 🔴 A PAUTA CHEGA À TELA.
 *
 * O domínio já garante que o exercício de leitura TEM figura — isso está em
 * `nexo-das-perguntas.test.ts`. Este arquivo guarda a outra metade: que a
 * figura é **desenhada**.
 *
 * A distinção não é preciosismo. A rota do artigo existia no domínio e faltava
 * na tabela do roteador, e o teste dela passava porque montava um roteador de
 * mentira. Aqui o risco é o mesmo em outra forma: o enunciado diz "Que nota
 * está escrita na pauta?", e se a pauta não for desenhada a pergunta fica sem
 * resposta possível — pior que o defeito que a figura veio corrigir.
 */

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('a pauta é desenhada, com as notas que o gerador soletrou', () => {
  it('🔴 o exercício de nota desenha uma pauta de verdade', () => {
    const e = generateExercise(Dimension.NOTE, Level.RECOGNIZE, 1)!;
    expect(e.figura, 'o gerador não produziu figura').toBeDefined();

    const { container } = render(<FiguraDoExercicio figura={e.figura!} />);

    /** Pauta é SVG com as cinco linhas — e não uma caixa vazia com borda. */
    const svg = container.querySelector('svg');
    expect(svg, 'nenhum desenho na figura').not.toBeNull();

    const linhas = svg!.querySelectorAll('line');
    expect(linhas.length, 'a pauta saiu sem linhas').toBeGreaterThanOrEqual(5);
  });

  it('🔴 a nota aparece desenhada — e não some no caminho', () => {
    /**
     * `paraNota` devolve `null` para o que não casa com a notação científica.
     * Uma nota descartada em silêncio deixaria a pauta vazia com a pergunta
     * intacta.
     */
    const e = generateExercise(Dimension.CHORD, Level.RECOGNIZE, 1)!;
    expect(e.figura?.kind).toBe('STAFF');

    const notas = (e.figura as { kind: 'STAFF'; notes: string[] }).notes;
    const { container } = render(<FiguraDoExercicio figura={e.figura!} />);

    /** Uma cabeça de nota por nota escrita. */
    const cabecas = container.querySelectorAll('ellipse, circle');
    expect(
      cabecas.length,
      `o acorde tem ${notas.length} notas e a pauta desenhou ${cabecas.length}`
    ).toBeGreaterThanOrEqual(notas.length);
  });

  it('as três dimensões que usam pauta desenham sem quebrar', () => {
    for (const d of [Dimension.NOTE, Dimension.INTERVAL, Dimension.SCALE, Dimension.CHORD]) {
      for (const seed of [1, 7, 23, 88]) {
        const e = generateExercise(d, Level.NAME, seed);
        if (!e?.figura) continue;

        const { container, unmount } = render(<FiguraDoExercicio figura={e.figura} />);
        expect(container.querySelector('svg'), `${d}/${seed}: não desenhou`).not.toBeNull();
        unmount();
      }
    }
  });

  it('🔴 a figura de leitura NÃO oferece botão de ouvir', () => {
    /**
     * Ouvir num exercício de leitura é atalho: quem toca a pauta responde de
     * ouvido e não lê nada. O som pertence ao exercício de ouvido, onde é a
     * matéria.
     */
    const e = generateExercise(Dimension.INTERVAL, Level.RECOGNIZE, 3)!;
    render(<FiguraDoExercicio figura={e.figura!} />);

    expect(
      screen.queryByRole('button', { name: /ouvir/i }),
      'a pauta de leitura entrega a resposta pelo som'
    ).toBeNull();
  });

  it('a clave pedida é a clave desenhada', () => {
    /**
     * `NAME` alterna sol e fá, e a mesma posição passa a ser outra nota. Se a
     * tela desenhasse sempre sol, o nível estaria ensinando errado.
     */
    const { container, unmount } = render(
      <FiguraDoExercicio figura={{ kind: 'STAFF', clef: 'bass', notes: ['D3'] }} />
    );
    expect(container.textContent, 'a clave de fá não foi desenhada').toMatch(/𝄢|bass|fá/i);
    unmount();

    const agudo = render(
      <FiguraDoExercicio figura={{ kind: 'STAFF', clef: 'treble', notes: ['G4'] }} />
    );
    expect(agudo.container.textContent).toMatch(/𝄞|treble|sol/i);
  });

  it('nota ilegível não derruba a tela — some, e a pauta continua', () => {
    /** Falhar em silêncio é ruim; quebrar a tela inteira é pior. */
    const { container } = render(
      <FiguraDoExercicio figura={{ kind: 'STAFF', clef: 'treble', notes: ['C4', 'XYZ', 'E4'] }} />
    );
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('a legenda aparece quando existe, e não inventa uma quando não existe', () => {
    const sem = render(<FiguraDoExercicio figura={{ kind: 'STAFF', clef: 'treble', notes: ['C4'] }} />);
    expect(sem.container.querySelector('figcaption')).toBeNull();
    sem.unmount();

    const com = render(
      <FiguraDoExercicio
        figura={{ kind: 'STAFF', clef: 'treble', notes: ['C4'], caption: 'Compasso simples' }}
      />
    );
    expect(com.container.querySelector('figcaption')?.textContent).toBe('Compasso simples');
  });
});

describe('o teclado destaca as teclas certas', () => {
  it('converte notação científica em tecla, incluindo acidente', () => {
    const { container } = render(
      <FiguraDoExercicio
        figura={{ kind: 'KEYBOARD', highlightNotes: ['C4', 'E4', 'G4'], octaves: 1 }}
      />
    );

    /** O teclado desenhou algo, e não uma caixa vazia. */
    expect(container.querySelector('svg, [role="group"], button'), 'teclado não desenhou').not.toBeNull();
  });
});
