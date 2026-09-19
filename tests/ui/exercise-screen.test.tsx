// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseScreen } from '../../src/ui/components/practice/ExerciseScreen';
import {
  MusicExercise,
  ExerciseType,
  startLesson,
  answer,
} from '../../src/domain/music-exercise';

/**
 * A tela onde a pessoa passa mais tempo da plataforma.
 *
 * O que estes casos protegem não é aparência: é o contrato de uso. Conferir
 * antes de escolher não pode acontecer; o atalho numérico precisa alcançar a
 * alternativa certa; a explicação só aparece **depois** de responder — senão
 * o exercício entrega a resposta.
 */

vi.mock('../../src/infrastructure/audio/synth', () => ({
  webAudioSynth: {
    playTone: vi.fn(),
    playChord: vi.fn(),
    playSequence: vi.fn(),
  },
}));

const exercise: MusicExercise = {
  id: 'e1',
  type: ExerciseType.IDENTIFY_BY_EAR,
  tag: 'NEW_CONTENT',
  band: 'FOUNDATION',
  prompt: 'Ouça e escolha a resposta',
  audio: { frequenciesHz: [261.63, 392.0], mode: 'SEQUENCE' },
  choices: [
    { id: 'a', label: 'Terça maior', frequenciesHz: [261.63, 329.63] },
    { id: 'b', label: 'Quinta justa', frequenciesHz: [261.63, 392.0] },
    { id: 'c', label: 'Quarta justa', frequenciesHz: [261.63, 349.23] },
  ],
  correctIds: ['b'],
  explanation: 'Sete semitons — a proporção 3:2 que torna a quinta consonante.',
  tonicHz: 261.63,
};

const montar = (opcoes: Partial<Parameters<typeof ExerciseScreen>[0]> = {}) => {
  const onAnswer = vi.fn();
  const onSkip = vi.fn();
  const onExit = vi.fn();
  render(
    <ExerciseScreen
      lesson={startLesson('lic', [exercise])}
      onAnswer={onAnswer}
      onSkip={onSkip}
      onExit={onExit}
      {...opcoes}
    />
  );
  return { onAnswer, onSkip, onExit };
};

beforeEach(() => vi.clearAllMocks());

describe('a anatomia da tela', () => {
  it('mostra o enunciado, a etiqueta e as alternativas', () => {
    montar();
    expect(screen.getByRole('heading', { name: /ouça e escolha/i })).toBeInTheDocument();
    expect(screen.getByText(/conteúdo novo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /terça maior/i })).toBeInTheDocument();
  });

  it('a barra de progresso é anunciada', () => {
    montar();
    expect(screen.getByRole('progressbar', { name: /progresso/i })).toBeInTheDocument();
  });

  it('as vidas aparecem, e o leitor de tela sabe quantas são', () => {
    montar();
    expect(screen.getByLabelText(/5 vidas restantes/i)).toBeInTheDocument();
  });

  it('sem vidas, o rótulo diz que os erros viram débito — e não que travou', () => {
    /**
     * Zero vidas **não** trava o estudo. A pessoa precisa entender que segue
     * podendo responder, e que o que muda é o registro.
     */
    // A licao precisa ter exercicio para cada resposta: `responder` e inerte
    // quando a fila acabou, e as vidas nao cairiam ate zero.
    let lesson = startLesson('lic', Array(5).fill(exercise));
    for (let i = 0; i < 5; i++) lesson = answer(lesson, false);
    expect(lesson.lives).toBe(0);
    render(
      <ExerciseScreen lesson={{ ...lesson, index: 0 }} onAnswer={vi.fn()} onSkip={vi.fn()} onExit={vi.fn()} />
    );
    expect(screen.getByLabelText(/débito/i)).toBeInTheDocument();
  });
});

describe('não se confere sem responder', () => {
  it('o botão de conferir começa desabilitado', () => {
    montar();
    expect(screen.getByRole('button', { name: 'Conferir' })).toBeDisabled();
  });

  it('escolher habilita o botão', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(screen.getByRole('button', { name: /quinta justa/i }));
    expect(screen.getByRole('button', { name: 'Conferir' })).toBeEnabled();
  });
});

describe('a explicação só aparece depois de responder', () => {
  it('antes de conferir, a explicação está escondida', () => {
    // Senão o exercício entrega a resposta antes de ser respondido.
    montar();
    expect(screen.queryByText(/proporção 3:2/i)).not.toBeInTheDocument();
  });

  it('depois de conferir, a explicação aparece', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(screen.getByRole('button', { name: /quinta justa/i }));
    await user.click(screen.getByRole('button', { name: 'Conferir' }));
    expect(screen.getByText(/proporção 3:2/i)).toBeInTheDocument();
  });

  it('acertar diz que acertou', async () => {
    const user = userEvent.setup();
    montar();
    await user.click(screen.getByRole('button', { name: /quinta justa/i }));
    await user.click(screen.getByRole('button', { name: 'Conferir' }));
    expect(screen.getByText('Correto.')).toBeInTheDocument();
  });

  it('errar diz que errou, e explica do mesmo jeito', async () => {
    // O erro é onde mais se aprende: esconder a explicação ali seria perder
    // o único momento em que a pessoa quer saber o porquê.
    const user = userEvent.setup();
    montar();
    await user.click(screen.getByRole('button', { name: /terça maior/i }));
    await user.click(screen.getByRole('button', { name: 'Conferir' }));
    expect(screen.getByText('Não é essa.')).toBeInTheDocument();
    expect(screen.getByText(/proporção 3:2/i)).toBeInTheDocument();
  });

  it('conferido, o botão passa a Continuar e avança a lição', async () => {
    const user = userEvent.setup();
    const { onAnswer } = montar();
    await user.click(screen.getByRole('button', { name: /quinta justa/i }));
    await user.click(screen.getByRole('button', { name: 'Conferir' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(onAnswer).toHaveBeenCalledWith(true, ['b']);
  });
});

describe('o atalho numérico', () => {
  it('a tecla escolhe a alternativa correspondente', async () => {
    // Responder sem tirar a mão do teclado é velocidade para quem vê e
    // acessibilidade para quem não usa mouse.
    const user = userEvent.setup();
    montar();
    await user.keyboard('2');
    expect(screen.getByRole('button', { name: /quinta justa/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('tecla fora da faixa não faz nada', async () => {
    const user = userEvent.setup();
    montar();
    await user.keyboard('9');
    expect(screen.getByRole('button', { name: 'Conferir' })).toBeDisabled();
  });

  it('o número aparece ao lado da alternativa', () => {
    montar();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

describe('o áudio', () => {
  it('há botão de ouvir e botão de meia velocidade', () => {
    /**
     * Meia velocidade não é conveniência: é o que torna audível a condução
     * de vozes de uma cadência.
     */
    montar();
    expect(screen.getByRole('button', { name: 'Ouvir' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /meia velocidade/i })).toBeInTheDocument();
  });

  it('exercício sem áudio não mostra os botões de escuta', () => {
    const semAudio = { ...exercise, audio: undefined };
    render(
      <ExerciseScreen
        lesson={startLesson('lic', [semAudio])}
        onAnswer={vi.fn()}
        onSkip={vi.fn()}
        onExit={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: 'Ouvir' })).not.toBeInTheDocument();
  });
});

describe('pular e sair', () => {
  it('pular avisa quem chamou', async () => {
    const user = userEvent.setup();
    const { onSkip } = montar();
    await user.click(screen.getByRole('button', { name: 'Pular' }));
    expect(onSkip).toHaveBeenCalled();
  });

  it('sair tem nome acessível', async () => {
    const user = userEvent.setup();
    const { onExit } = montar();
    await user.click(screen.getByRole('button', { name: /sair da lição/i }));
    expect(onExit).toHaveBeenCalled();
  });
});

describe('o combo', () => {
  it('a sequência aparece a partir de dois acertos', () => {
    let lesson = startLesson('lic', [exercise, exercise, exercise]);
    lesson = answer(lesson, true);
    lesson = answer(lesson, true);
    render(
      <ExerciseScreen lesson={{ ...lesson, index: 0 }} onAnswer={vi.fn()} onSkip={vi.fn()} onExit={vi.fn()} />
    );
    expect(screen.getByText(/2 streak/i)).toBeInTheDocument();
  });

  it('com um acerto só, não há alarde', () => {
    // Anunciar "1 seguido" seria ruído: uma resposta certa não é sequência.
    let lesson = startLesson('lic', [exercise, exercise]);
    lesson = answer(lesson, true);
    render(
      <ExerciseScreen lesson={{ ...lesson, index: 0 }} onAnswer={vi.fn()} onSkip={vi.fn()} onExit={vi.fn()} />
    );
    expect(screen.queryByText(/streak/i)).not.toBeInTheDocument();
  });
});

describe('a etiqueta de revisão', () => {
  it('o exercício que volta diz que é correção de erro anterior', () => {
    const revisao = { ...exercise, tag: 'REVIEW' as const };
    render(
      <ExerciseScreen
        lesson={startLesson('lic', [revisao])}
        onAnswer={vi.fn()}
        onSkip={vi.fn()}
        onExit={vi.fn()}
      />
    );
    expect(screen.getByText(/corrija o erro de antes/i)).toBeInTheDocument();
  });
});

describe('sair no meio avisa o que se perde', () => {
  it('sem nada respondido, o ✕ sai direto', async () => {
    // Confirmar a saida de uma licao intocada e atrito puro: nao ha progresso
    // em risco, e a pergunta so ensina a descartar avisos sem ler.
    const user = userEvent.setup();
    const { onExit } = montar();
    await user.click(screen.getByRole('button', { name: /sair da lição/i }));
    expect(onExit).toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('com exercício respondido, pergunta antes — e diz o que se perde', async () => {
    const user = userEvent.setup();
    const lesson = answer(startLesson('lic', [exercise, exercise]), true);
    const { onExit } = montar({ lesson });

    await user.click(screen.getByRole('button', { name: /sair da lição/i }));
    expect(onExit).not.toHaveBeenCalled();

    const aviso = screen.getByRole('dialog');
    // "Tem certeza?" nao informa nada: o aviso precisa dizer a consequencia.
    expect(aviso).toHaveTextContent(/não será registrado/i);
  });

  it('ficar fecha o aviso sem sair', async () => {
    const user = userEvent.setup();
    const lesson = answer(startLesson('lic', [exercise, exercise]), true);
    const { onExit } = montar({ lesson });

    await user.click(screen.getByRole('button', { name: /sair da lição/i }));
    await user.click(screen.getByRole('button', { name: /continuar a lição/i }));

    expect(onExit).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('confirmar sai de fato', async () => {
    const user = userEvent.setup();
    const lesson = answer(startLesson('lic', [exercise, exercise]), true);
    const { onExit } = montar({ lesson });

    await user.click(screen.getByRole('button', { name: /sair da lição/i }));
    await user.click(screen.getByRole('button', { name: /perder o progresso/i }));
    expect(onExit).toHaveBeenCalled();
  });

  it('Escape equivale a ficar', async () => {
    const user = userEvent.setup();
    const lesson = answer(startLesson('lic', [exercise, exercise]), true);
    const { onExit } = montar({ lesson });

    await user.click(screen.getByRole('button', { name: /sair da lição/i }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onExit).not.toHaveBeenCalled();
  });
});

describe('calibragem do exercício', () => {
  const check = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: /quinta justa/i }));
    await user.click(screen.getByRole('button', { name: 'Conferir' }));
  };

  it('sem destino para o dado, o rodapé não existe', async () => {
    /**
     * Um botao que coleta opiniao e nao a registra em lugar nenhum e pior do
     * que nao perguntar: cria a impressao de que alguem esta ouvindo.
     */
    const user = userEvent.setup();
    montar();
    await check(user);
    expect(screen.queryByRole('button', { name: /muito fácil/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reportar/i })).not.toBeInTheDocument();
  });

  it('o veredito chega a quem vai registrá-lo', async () => {
    const user = userEvent.setup();
    const onRateDifficulty = vi.fn();
    montar({ onRateDifficulty });

    await check(user);
    await user.click(screen.getByRole('button', { name: /muito difícil/i }));

    expect(onRateDifficulty).toHaveBeenCalledWith('e1', 'HARD');
  });

  it('respondido o veredito, o rodapé confirma em vez de repetir a pergunta', async () => {
    const user = userEvent.setup();
    montar({ onRateDifficulty: vi.fn() });

    await check(user);
    await user.click(screen.getByRole('button', { name: /muito fácil/i }));

    expect(screen.getByText(/anotado/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /muito fácil/i })).not.toBeInTheDocument();
  });

  it('reportar chega a quem vai revisar', async () => {
    const user = userEvent.setup();
    const onReport = vi.fn();
    montar({ onReport });

    await check(user);
    await user.click(screen.getByRole('button', { name: /reportar/i }));

    expect(onReport).toHaveBeenCalledWith('e1');
    expect(screen.getByText(/vamos revisar/i)).toBeInTheDocument();
  });

  it('antes de conferir não se avalia o que ainda não se viu', async () => {
    montar({ onRateDifficulty: vi.fn(), onReport: vi.fn() });
    expect(screen.queryByRole('button', { name: /muito fácil/i })).not.toBeInTheDocument();
  });
});
