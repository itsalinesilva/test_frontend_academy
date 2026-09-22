// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonBlockRenderer } from '../../src/ui/components/academy/LessonBlocks';
import { LessonBlock } from '../../src/domain/academy';
import { problemasDoBloco, isEditableBlock } from '../../src/domain/editorial-edit';
import { MINUTES_PER_BLOCK } from '../../src/domain/workload';

/**
 * A BIBLIOTECA DE BLOCOS FUNCIONAIS.
 *
 * 🔴 O QUE ESTES CASOS IMPEDEM
 * ----------------------------
 * A auditoria de paridade mediu **24 componentes construídos e nunca usados**
 * — `Player`, `PianoRoll`, `Tuner`, `Waveform` entre eles. Peças prontas,
 * esperando quem as chamasse.
 *
 * O risco ao ligá-las é o oposto e igualmente caro: bloco que entra no
 * contrato, aparece no menu do editor, e **não desenha nada**. O `switch` do
 * renderizador compilava com retorno `JSX.Element | undefined`, e um tipo novo
 * saía em silêncio — a lição ficava com um buraco que só o aluno via.
 *
 * Por isso o primeiro caso aqui percorre TODOS os tipos do contrato.
 */

/** Um exemplar válido de cada tipo de bloco. */
const EXEMPLARES: LessonBlock[] = [
  { kind: 'MARKDOWN', id: 'b1', markdown: 'texto' },
  { kind: 'CALLOUT', id: 'b2', type: 'info', title: 'Aviso', text: 'corpo' },
  {
    kind: 'AUDIO_EXAMPLE',
    id: 'b3',
    title: 'Exemplo',
    notes: ['C4', 'E4'],
    playMode: 'SEQUENCE',
  },
  { kind: 'INTERVAL_LAB', id: 'b4', title: 'Lab', lowerNote: 'C4', upperNote: 'E4' },
  { kind: 'CHORD_LAB', id: 'b5', title: 'Lab', notes: ['C4', 'E4', 'G4'] },
  { kind: 'SCALE_LAB', id: 'b6', title: 'Lab', tonic: 'C4', mode: 'MAJOR' },
  { kind: 'KEYBOARD', id: 'b7', highlightNotes: ['C4'] },
  { kind: 'STAFF', id: 'b8', clef: 'treble', notes: ['C4', 'E4'] },
  { kind: 'DIAGRAM', id: 'b9', title: 'Ciclo', diagram: 'CIRCLE_OF_FIFTHS' },
  {
    kind: 'CHECKPOINT',
    id: 'b10',
    question: 'Qual?',
    options: ['a', 'b'],
    correctIndex: 0,
    explanation: 'porque sim, e por este motivo',
  },
  { kind: 'SLIDES', id: 'b11', title: 'Deck', slides: [{ heading: 'A', body: 'corpo' }] },
  { kind: 'VIDEO_PLACEHOLDER', id: 'b12', topic: 'Aula' },

  // ---- a biblioteca funcional ---------------------------------------------
  {
    kind: 'PLAYER',
    id: 'b13',
    title: 'Ouça a tríade',
    notes: ['C4', 'E4', 'G4'],
    playMode: 'CHORD',
  },
  {
    kind: 'PIANO_ROLL',
    id: 'b14',
    title: 'As vozes no tempo',
    notas: [
      { nota: 'C4', inicioEmTempos: 0, duracaoEmTempos: 2 },
      { nota: 'E4', inicioEmTempos: 2, duracaoEmTempos: 2 },
    ],
  },
  { kind: 'TUNER_LAB', id: 'b15', title: 'Cante lá', notaAlvo: 'A4' },
  {
    kind: 'TABELA',
    id: 'b16',
    title: 'Modos',
    colunas: ['Modo', 'Terça'],
    linhas: [['Maior', 'maior'], ['Menor', 'menor']],
  },
  { kind: 'CITACAO', id: 'b17', texto: 'A música é...', fonte: 'Fux', localizacao: '1725' },
  {
    kind: 'LINHA_DO_TEMPO',
    id: 'b18',
    title: 'O barroco',
    marcos: [
      { ano: 1600, titulo: 'Começa' },
      { ano: 1750, titulo: 'Termina' },
    ],
  },
  {
    kind: 'SESSAO_DE_EXERCICIOS',
    id: 'b19',
    title: 'Intervalos',
    vidas: 3,
    questoes: [
      {
        id: 'q1',
        enunciado: 'Que intervalo você ouviu?',
        alternativas: ['Terça menor', 'Terça maior'],
        corretaIndex: 1,
        explicacao: 'São quatro semitons, que formam terça maior.',
        notas: ['C4', 'E4'],
        playMode: 'SEQUENCE',
      },
      {
        id: 'q2',
        enunciado: 'E este?',
        alternativas: ['Quinta justa', 'Trítono'],
        corretaIndex: 0,
        explicacao: 'São sete semitons, que formam quinta justa.',
      },
    ],
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('🔴 TODO tipo de bloco do contrato DESENHA alguma coisa', () => {
  it('nenhum tipo sai em branco', () => {
    /**
     * Este é o caso que a guarda de exaustividade protege do lado do
     * compilador, e que este arquivo protege do lado do desenho: um `case`
     * pode existir e devolver `null`.
     */
    const vazios: string[] = [];

    for (const b of EXEMPLARES) {
      const { container, unmount } = render(<LessonBlockRenderer block={b} />);
      const temConteudo =
        (container.textContent ?? '').trim().length > 0 ||
        container.querySelector('svg, button, table, input') !== null;

      if (!temConteudo) vazios.push(b.kind);
      unmount();
    }

    expect(vazios, `tipos que não desenham nada: ${vazios.join(', ')}`).toEqual([]);
  });

  it('a lista de exemplares cobre TODOS os tipos declarados', () => {
    /**
     * Sem isto, acrescentar um tipo ao contrato e esquecer de testá-lo daria
     * verde — e o caso acima passaria por não conhecer o tipo novo.
     */
    const testados = new Set(EXEMPLARES.map((b) => b.kind));
    const declarados = Object.keys(MINUTES_PER_BLOCK);

    const faltando = declarados.filter((k) => !testados.has(k as LessonBlock['kind']));
    expect(faltando, `tipos sem exemplar no teste: ${faltando.join(', ')}`).toEqual([]);
  });

  it('todo tipo do contrato tem custo em minutos declarado', () => {
    for (const b of EXEMPLARES) {
      expect(
        MINUTES_PER_BLOCK[b.kind],
        `"${b.kind}" sem custo declarado — a carga da lição sairia errada`
      ).toBeDefined();
    }
  });

  it('todo exemplar é válido — o teste não roda sobre bloco quebrado', () => {
    for (const b of EXEMPLARES) {
      expect(problemasDoBloco(b), `"${b.kind}" nasceu inválido no próprio teste`).toEqual([]);
    }
  });

  it('todo bloco funcional é editável pela engine', () => {
    const funcionais: LessonBlock['kind'][] = [
      'PLAYER',
      'PIANO_ROLL',
      'TUNER_LAB',
      'TABELA',
      'CITACAO',
      'LINHA_DO_TEMPO',
      'SESSAO_DE_EXERCICIOS',
    ];

    for (const kind of funcionais) {
      const b = EXEMPLARES.find((x) => x.kind === kind)!;
      expect(isEditableBlock(b), `"${kind}" não é editável`).toBe(true);
    }
  });
});

describe('🔴 o PLAYER toca, e a onda vem do som', () => {
  it('desenha forma de onda e oferece ouvir, repetir e meia velocidade', () => {
    const b = EXEMPLARES.find((x) => x.kind === 'PLAYER')!;
    const { container } = render(<LessonBlockRenderer block={b} />);

    /** Exato: "Ouvir" casaria também com "Ouvir a meia velocidade". */
    expect(screen.getByRole('button', { name: 'Ouvir' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /meia velocidade/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Repetir/i })).toBeInTheDocument();

    /** A onda é desenho, e não texto: tem que haver algo no SVG. */
    expect(container.querySelector('svg, [class*="waveform"], canvas')).not.toBeNull();
  });

  it('🔴 player sem nota legível DECLARA que não há o que tocar', () => {
    /**
     * Um player mudo com aparência de player faz a pessoa clicar três vezes
     * antes de concluir que está quebrado.
     */
    render(
      <LessonBlockRenderer
        block={{
          kind: 'PLAYER',
          id: 'x',
          title: 'Quebrado',
          notes: ['nao-e-nota'],
          playMode: 'SEQUENCE',
        }}
      />
    );

    expect(screen.getByText(/não tem nota legível/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ouvir' })).toBeNull();
  });
});

describe('a TABELA é lida como tabela', () => {
  it('tem cabeçalho com escopo, e as linhas na ordem', () => {
    /** Sem `scope`, o leitor de tela recebe uma sopa de células. */
    const b = EXEMPLARES.find((x) => x.kind === 'TABELA')!;
    render(<LessonBlockRenderer block={b} />);

    const tabela = screen.getByRole('table');
    const cabecalhos = within(tabela).getAllByRole('columnheader');

    expect(cabecalhos.map((c) => c.textContent)).toEqual(['Modo', 'Terça']);
    expect(cabecalhos.every((c) => c.getAttribute('scope') === 'col')).toBe(true);
    expect(within(tabela).getAllByRole('row').length).toBe(3); // cabeçalho + duas linhas
  });

  it('🔴 linha com tamanho diferente do cabeçalho é RECUSADA', () => {
    /** Desalinha a tabela inteira, e o valor vai para a coluna errada. */
    const r = problemasDoBloco({
      kind: 'TABELA',
      id: 'x',
      colunas: ['A', 'B'],
      linhas: [['1', '2', '3']],
    });

    expect(r.join(' ')).toMatch(/3 células e o cabeçalho tem 2/);
  });
});

describe('a CITAÇÃO exige fonte', () => {
  it('mostra o texto e a atribuição', () => {
    const b = EXEMPLARES.find((x) => x.kind === 'CITACAO')!;
    const { container } = render(<LessonBlockRenderer block={b} />);

    expect(container.querySelector('blockquote')?.textContent).toContain('A música é');
    expect(container.querySelector('figcaption')?.textContent).toContain('Fux');
  });

  it('🔴 citação sem fonte é recusada — é plágio começando', () => {
    const r = problemasDoBloco({ kind: 'CITACAO', id: 'x', texto: 'algo', fonte: '  ' });
    expect(r.join(' ')).toMatch(/sem fonte/i);
  });
});

describe('🔴 a LINHA DO TEMPO mostra distância, e não uma lista', () => {
  it('ordena os marcos pelo ano, mesmo fora de ordem na entrada', () => {
    render(
      <LessonBlockRenderer
        block={{
          kind: 'LINHA_DO_TEMPO',
          id: 'x',
          title: 'Fora de ordem',
          marcos: [
            { ano: 1750, titulo: 'Depois' },
            { ano: 1600, titulo: 'Antes' },
          ],
        }}
      />
    );

    const itens = screen.getAllByRole('listitem');
    expect(itens[0].textContent).toContain('1600');
    expect(itens[1].textContent).toContain('1750');
  });

  it('o espaço entre marcos é PROPORCIONAL ao intervalo', () => {
    /**
     * Espaçar por igual transformaria a linha do tempo numa lista com datas —
     * e o intervalo é justamente o que ela existe para mostrar.
     */
    render(
      <LessonBlockRenderer
        block={{
          kind: 'LINHA_DO_TEMPO',
          id: 'x',
          title: 'Intervalos desiguais',
          marcos: [
            { ano: 1600, titulo: 'A' },
            { ano: 1610, titulo: 'B' },
            { ano: 1900, titulo: 'C' },
          ],
        }}
      />
    );

    const itens = screen.getAllByRole('listitem');
    const margem = (el: HTMLElement) => parseFloat(el.style.marginTop || '0');

    expect(
      margem(itens[2]),
      'o salto de 290 anos não ficou maior que o de 10'
    ).toBeGreaterThan(margem(itens[1]));
  });

  it('um marco só é recusado — é uma data solta, não uma linha', () => {
    const r = problemasDoBloco({
      kind: 'LINHA_DO_TEMPO',
      id: 'x',
      title: 'T',
      marcos: [{ ano: 1600, titulo: 'A' }],
    });
    expect(r.join(' ')).toMatch(/pelo menos dois marcos/i);
  });
});

describe('🔴 a SESSÃO DE EXERCÍCIOS é o loop do Duolingo', () => {
  const sessao = EXEMPLARES.find((x) => x.kind === 'SESSAO_DE_EXERCICIOS')!;

  it('tem progresso, vidas e o enunciado da primeira questão', () => {
    render(<LessonBlockRenderer block={sessao} />);

    const barra = screen.getByRole('progressbar', { name: 'Progresso da sessão' });
    expect(barra.getAttribute('aria-valuenow')).toBe('0');

    expect(screen.getByLabelText('3 vidas')).toBeInTheDocument();
    expect(screen.getByText('Que intervalo você ouviu?')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('verificar só habilita depois de escolher', () => {
    render(<LessonBlockRenderer block={sessao} />);
    expect(
      (screen.getByRole('button', { name: 'Verificar' }) as HTMLButtonElement).disabled
    ).toBe(true);
  });

  it('🔴 a faixa de veredito sobe COM a explicação, sem sair da pergunta', async () => {
    /**
     * Quem erra precisa ler por quê sem sair da pergunta. Uma tela separada de
     * resultado quebra o loop — foi o que a auditoria mediu em
     * `ImmediateFeedbackScreen`.
     */
    const user = userEvent.setup();
    render(<LessonBlockRenderer block={sessao} />);

    await user.click(screen.getByRole('button', { name: 'Terça maior' }));
    await user.click(screen.getByRole('button', { name: 'Verificar' }));

    const faixa = screen.getByRole('status');
    expect(faixa.textContent).toContain('Certo');
    expect(faixa.textContent, 'a explicação não apareceu').toContain('quatro semitons');
    expect(within(faixa).getByRole('button', { name: 'Continuar' })).toBeInTheDocument();

    /** E a pergunta continua na tela: o loop não foi quebrado. */
    expect(screen.getByText('Que intervalo você ouviu?')).toBeInTheDocument();
  });

  it('🔴 quem erra recebe a RESPOSTA CERTA, e não só o vermelho', async () => {
    const user = userEvent.setup();
    render(<LessonBlockRenderer block={sessao} />);

    await user.click(screen.getByRole('button', { name: 'Terça menor' }));
    await user.click(screen.getByRole('button', { name: 'Verificar' }));

    const faixa = screen.getByRole('status');
    expect(faixa.textContent).toContain('Não foi dessa vez');
    expect(faixa.textContent, 'não diz qual era a resposta').toContain('Terça maior');
  });

  it('errar consome uma vida', async () => {
    const user = userEvent.setup();
    render(<LessonBlockRenderer block={sessao} />);

    await user.click(screen.getByRole('button', { name: 'Terça menor' }));
    await user.click(screen.getByRole('button', { name: 'Verificar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    /**
     * O rótulo passa a dizer QUANTAS restam. Um contador que não muda ao
     * perder vida não é contador — e o coração apagado sozinho não é lido por
     * quem usa leitor de tela.
     */
    await waitFor(() => expect(screen.getByLabelText('2 vidas')).toBeInTheDocument());
    expect(screen.getByText('2/2')).toBeInTheDocument();
  });

  it('o fim conta os acertos, e deixa refazer', async () => {
    const user = userEvent.setup();
    render(<LessonBlockRenderer block={sessao} />);

    await user.click(screen.getByRole('button', { name: 'Terça maior' }));
    await user.click(screen.getByRole('button', { name: 'Verificar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    await user.click(await screen.findByRole('button', { name: 'Quinta justa' }));
    await user.click(screen.getByRole('button', { name: 'Verificar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText(/2 de 2 certas/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fazer de novo/ })).toBeInTheDocument();
  });

  it('a questão com notas traz o player; a sem notas, não', async () => {
    const user = userEvent.setup();
    render(<LessonBlockRenderer block={sessao} />);

    /** A primeira tem notas. */
    expect(screen.getByRole('button', { name: 'Ouvir' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Terça maior' }));
    await user.click(screen.getByRole('button', { name: 'Verificar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    /** A segunda não tem — e nenhum player deve aparecer. */
    await screen.findByText('E este?');
    expect(screen.queryByRole('button', { name: 'Ouvir' })).toBeNull();
  });

  it('🔴 questão sem explicação é recusada na gravação', () => {
    const r = problemasDoBloco({
      kind: 'SESSAO_DE_EXERCICIOS',
      id: 'x',
      title: 'T',
      questoes: [
        { id: 'q', enunciado: 'a?', alternativas: ['x', 'y'], corretaIndex: 0, explicacao: ' ' },
      ],
    });

    expect(r.join(' ')).toMatch(/sem explicação/i);
  });

  it('resposta certa fora da lista é recusada', () => {
    const r = problemasDoBloco({
      kind: 'SESSAO_DE_EXERCICIOS',
      id: 'x',
      title: 'T',
      questoes: [
        { id: 'q', enunciado: 'a?', alternativas: ['x', 'y'], corretaIndex: 9, explicacao: 'pois' },
      ],
    });

    expect(r.join(' ')).toMatch(/não existe/i);
  });
});

describe('o AFINADOR diz quando não está ouvindo', () => {
  it('🔴 sem captura ativa, o painel declara que nada está sendo medido', () => {
    /**
     * Sem isto, "0 cents" significaria ao mesmo tempo "afinado" e "não estou
     * ouvindo nada" — e as duas coisas são opostas.
     */
    const b = EXEMPLARES.find((x) => x.kind === 'TUNER_LAB')!;
    render(<LessonBlockRenderer block={b} />);

    const recado = screen.getByRole('status');
    expect(recado.textContent).toMatch(/começar a medir|não está sendo medido|não expõe/i);
  });

  it('nota alvo ilegível é dita, e não silenciosamente ignorada', () => {
    render(
      <LessonBlockRenderer
        block={{ kind: 'TUNER_LAB', id: 'x', title: 'Cante', notaAlvo: 'lá' }}
      />
    );

    expect(screen.getByText(/não é legível/i)).toBeInTheDocument();
  });

  it('tolerância zero é recusada — ninguém canta exato', () => {
    const r = problemasDoBloco({
      kind: 'TUNER_LAB',
      id: 'x',
      title: 'T',
      notaAlvo: 'A4',
      toleranciaCents: 0,
    });

    expect(r.join(' ')).toMatch(/maior que zero/i);
  });
});

describe('o ROLO DE PIANO desenha as notas no tempo', () => {
  it('nota com duração zero é recusada — não apareceria', () => {
    const r = problemasDoBloco({
      kind: 'PIANO_ROLL',
      id: 'x',
      notas: [{ nota: 'C4', inicioEmTempos: 0, duracaoEmTempos: 0 }],
    });

    expect(r.join(' ')).toMatch(/duração zero/i);
  });

  it('nota ilegível é recusada com o formato explicado', () => {
    const r = problemasDoBloco({
      kind: 'PIANO_ROLL',
      id: 'x',
      notas: [{ nota: 'dó', inicioEmTempos: 0, duracaoEmTempos: 1 }],
    });

    expect(r.join(' ')).toMatch(/C4/);
  });
});
