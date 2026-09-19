// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LessonBlockRenderer, noteToFrequency } from '../../src/ui/components/academy/LessonBlocks';
import type { LessonBlock } from '../../src/domain/academy';

/**
 * Os blocos interativos da lição.
 *
 * O ponto central destes testes é que NENHUM bloco simula resultado: as
 * análises vêm do `RuleBasedTheoryEngineAdapter` real. Se algum dia alguém
 * substituir o motor por um valor fixo, estes testes continuam passando —
 * por isso verificamos valores que só um motor correto produz (7 semitons
 * para a quinta justa, a fórmula da escala maior).
 */

beforeEach(() => {
  // WebAudio não existe em jsdom. O sintetizador é exercitado em outro nível;
  // aqui interessa a integração com o motor de teoria e a interface.
  vi.stubGlobal('AudioContext', class {
    createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: { value: 0 }, type: '' }; }
    createGain() { return { connect() {}, gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} } }; }
    get currentTime() { return 0; }
    get destination() { return {}; }
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('conversão de altura', () => {
  it('converte notação científica em frequência temperada', () => {
    expect(noteToFrequency('A4')).toBeCloseTo(440, 5);
    expect(noteToFrequency('A3')).toBeCloseTo(220, 5);
    expect(noteToFrequency('C4')).toBeCloseTo(261.626, 2);
    expect(noteToFrequency('C#4')).toBeCloseTo(277.183, 2);
  });

  it('recusa entrada inválida em vez de devolver um número plausível', () => {
    expect(noteToFrequency('H4')).toBeNull();
    expect(noteToFrequency('foo')).toBeNull();
    expect(noteToFrequency('')).toBeNull();
  });
});

describe('INTERVAL_LAB — análise vem do motor real', () => {
  const block: LessonBlock = {
    kind: 'INTERVAL_LAB',
    id: 'lab-1',
    title: 'Quinta justa',
    lowerNote: 'C4',
    upperNote: 'G4',
    prompt: 'Ouça e analise.',
  };

  it('não mostra resultado antes de o usuário pedir a análise', () => {
    render(<LessonBlockRenderer block={block} />);
    expect(screen.queryByText('7')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analisar/i })).toBeInTheDocument();
  });

  it('exibe os semitons que o motor calcula — 7 para a quinta justa', async () => {
    render(<LessonBlockRenderer block={block} />);
    await userEvent.click(screen.getByRole('button', { name: /analisar/i }));
    await waitFor(() => expect(screen.getByText('7')).toBeInTheDocument());
    expect(screen.getByText(/consonante/i)).toBeInTheDocument();
  });

  it('oferece escuta melódica e harmônica separadas', () => {
    render(<LessonBlockRenderer block={block} />);
    expect(screen.getByRole('button', { name: /ouvir melódico/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ouvir harmônico/i })).toBeInTheDocument();
  });
});

describe('CHORD_LAB — identificação pelo motor', () => {
  it('identifica a tríade e a inversão em português', async () => {
    // Título neutro para que o resultado do motor não se confunda com o rótulo.
    render(
      <LessonBlockRenderer
        block={{ kind: 'CHORD_LAB', id: 'c1', title: 'Identificação', notes: ['C4', 'E4', 'G4'] }}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /identificar/i }));
    // O nome do acorde é montado por partes no JSX (fundamental + qualidade),
    // e o texto aparece tanto no <span> quanto no <p> que o contém. A
    // asserção olha o elemento que de fato carrega o nome.
    await waitFor(() => {
      const name = document.querySelector('.font-serif.text-base.font-bold');
      expect(name?.textContent?.replace(/\s+/g, ' ').trim()).toBe('C maior');
    });
    expect(screen.getByText('estado fundamental')).toBeInTheDocument();
  });
});

describe('SCALE_LAB — escala gerada pela fórmula do motor', () => {
  it('produz a escala de Dó maior fechada na oitava, sem acidentes', async () => {
    render(
      <LessonBlockRenderer
        block={{ kind: 'SCALE_LAB', id: 's1', title: 'Dó maior', tonic: 'C', mode: 'MAJOR' }}
      />
    );
    // O teclado tambem rotula teclas com os nomes das notas; a asserção
    // precisa olhar só a lista de graus produzida pelo motor.
    await waitFor(() => expect(screen.getByText(/sem acidentes/i)).toBeInTheDocument());
    const degrees = document.querySelectorAll('.font-mono.text-sm.font-bold');
    const labels = [...degrees].map((el) => el.textContent?.trim());
    // O motor fecha a escala na oitava: 8 graus, de C a C.
    expect(labels).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']);
  });
});

describe('CHECKPOINT — verificação no meio do texto', () => {
  const block: LessonBlock = {
    kind: 'CHECKPOINT',
    id: 'chk',
    question: 'Entre quais notas há semitom natural?',
    options: ['C-D', 'E-F', 'G-A', 'D-E'],
    correctIndex: 1,
    explanation: 'E-F e B-C são os semitons da escala natural.',
  };

  it('não revela a resposta antes da escolha', () => {
    render(<LessonBlockRenderer block={block} />);
    expect(screen.queryByText(/semitons da escala natural/i)).not.toBeInTheDocument();
  });

  it('confirma o acerto e mostra a explicação', async () => {
    render(<LessonBlockRenderer block={block} />);
    await userEvent.click(screen.getByRole('button', { name: 'E-F' }));
    expect(screen.getByText('Correto.')).toBeInTheDocument();
    expect(screen.getByText(/semitons da escala natural/i)).toBeInTheDocument();
    // A explicação é autoral. Não há citação de fonte a exibir — o campo
    // `sourceRef` foi removido do domínio junto com toda a bibliografia.
    expect(screen.queryByText(/Fonte:/)).not.toBeInTheDocument();
  });

  it('no erro, explica sem humilhar', async () => {
    render(<LessonBlockRenderer block={block} />);
    await userEvent.click(screen.getByRole('button', { name: 'C-D' }));
    expect(screen.getByText('Ainda não.')).toBeInTheDocument();
    expect(screen.getByText(/semitons da escala natural/i)).toBeInTheDocument();
  });

  it('bloqueia nova escolha depois de respondido', async () => {
    render(<LessonBlockRenderer block={block} />);
    await userEvent.click(screen.getByRole('button', { name: 'C-D' }));
    expect(screen.getByRole('button', { name: /G-A/ })).toBeDisabled();
  });
});

describe('DIAGRAM — gerado em SVG, sem dependência de imagem', () => {
  it('renderiza o ciclo das quintas com rótulo acessível', () => {
    render(
      <LessonBlockRenderer
        block={{ kind: 'DIAGRAM', id: 'd1', title: 'Ciclo', diagram: 'CIRCLE_OF_FIFTHS', highlight: ['C', 'G'] }}
      />
    );
    expect(screen.getByRole('img', { name: /ciclo das quintas/i })).toBeInTheDocument();
  });

  it('renderiza a distribuição de tons e semitons', () => {
    render(
      <LessonBlockRenderer
        block={{ kind: 'DIAGRAM', id: 'd2', title: 'T/st', diagram: 'TONE_SEMITONE' }}
      />
    );
    expect(screen.getByRole('img', { name: /tons e semitons/i })).toBeInTheDocument();
  });
});

describe('CALLOUT e MARKDOWN', () => {
  it('renderiza nota histórica como landmark de complemento', () => {
    render(
      <LessonBlockRenderer
        block={{ kind: 'CALLOUT', id: 'c', type: 'historical', title: 'Guido d\'Arezzo', text: 'Séc. XI.' }}
      />
    );
    expect(screen.getByText("Guido d'Arezzo")).toBeInTheDocument();
    expect(screen.getByText('Séc. XI.')).toBeInTheDocument();
  });

  it('interpreta negrito e código sem permitir HTML bruto', () => {
    render(
      <LessonBlockRenderer
        block={{ kind: 'MARKDOWN', id: 'm', markdown: 'A nota **Lá** vale `440` Hz.<script>alert(1)</script>' }}
      />
    );
    expect(screen.getByText('Lá').tagName).toBe('STRONG');
    expect(screen.getByText('440').tagName).toBe('CODE');
    // O texto do script aparece como TEXTO, nunca como elemento executável.
    expect(document.querySelector('script')).toBeNull();
  });
});

describe('SLIDES — decompõe raciocínio sem parede de texto', () => {
  const block: LessonBlock = {
    kind: 'SLIDES',
    id: 'sl',
    title: 'A razão 2:1',
    slides: [
      { heading: 'A corda inteira', body: 'Vibra na fundamental.', note: 'f = 130,8 Hz' },
      { heading: 'A metade', body: 'Vibra ao dobro.', note: 'f x 2' },
      { heading: 'O reconhecimento', body: 'Mesma nota, mais aguda.' },
    ],
  };

  it('mostra a primeira lâmina e anuncia a posição', () => {
    render(<LessonBlockRenderer block={block} />);
    expect(screen.getByText('A corda inteira')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /lâmina 1 de 3/i })).toBeInTheDocument();
    expect(screen.queryByText('A metade')).not.toBeInTheDocument();
  });

  it('avança e retrocede, desabilitando nos extremos', async () => {
    render(<LessonBlockRenderer block={block} />);
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: /próxima/i }));
    expect(screen.getByText('A metade')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /próxima/i }));
    expect(screen.getByText('O reconhecimento')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /próxima/i })).toBeDisabled();
  });

  it('permite saltar direto para uma lâmina pelos marcadores', async () => {
    render(<LessonBlockRenderer block={block} />);
    await userEvent.click(screen.getByRole('tab', { name: /lâmina 3/i }));
    expect(screen.getByText('O reconhecimento')).toBeInTheDocument();
  });
});

describe('VIDEO_PLACEHOLDER — discreto por contrato', () => {
  it('registra o ponto sem fingir player nem reservar área vazia', () => {
    const { container } = render(
      <LessonBlockRenderer block={{ kind: 'VIDEO_PLACEHOLDER', id: 'v', topic: 'a cadência' }} />
    );
    expect(screen.getByText(/aula em vídeo sobre a cadência/i)).toBeInTheDocument();
    // Sem iframe, sem video, sem botão de reprodução: nada que sugira mídia
    // disponível ou conteúdo faltando.
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.querySelector('video')).toBeNull();
    expect(container.querySelector('button')).toBeNull();
  });
});
