import { describe, it, expect } from 'vitest';
import {
  frequenciaDaNota,
  notaMaisProxima,
  desvioEmCents,
  medirTentativa,
  pontuarAfinacao,
  pontuarTempo,
  atingiuDominio,
  ajustarDificuldade,
  tentativaAprovada,
  naturezaDoExercicio,
} from '../src/domain/practice-measurement';
import { PracticeModality, ExerciseType } from '../src/domain/practice';

/**
 * Regressão do COMANDO 5.
 *
 * A avaliação anterior sorteava o desvio de afinação: de 0 a 8 cents para
 * quem acertasse a nota, de 45 a 85 para quem errasse. O número parecia uma
 * medição e não media nada — e o aluno ajustava o estudo por ele.
 */

describe('Conversão de altura', () => {
  it('confere com as frequências conhecidas do temperamento igual', () => {
    expect(frequenciaDaNota('A4')).toBeCloseTo(440, 5);
    expect(frequenciaDaNota('A3')).toBeCloseTo(220, 5);
    expect(frequenciaDaNota('A5')).toBeCloseTo(880, 5);
    expect(frequenciaDaNota('C4')).toBeCloseTo(261.6256, 3);
    expect(frequenciaDaNota('E4')).toBeCloseTo(329.6276, 3);
    expect(frequenciaDaNota('C5')).toBeCloseTo(523.2511, 3);
  });

  it('aceita as duas grafias de uma mesma tecla', () => {
    expect(frequenciaDaNota('A#4')).toBeCloseTo(frequenciaDaNota('Bb4')!, 6);
    expect(frequenciaDaNota('C#3')).toBeCloseTo(frequenciaDaNota('Db3')!, 6);
  });

  it('recusa entrada inválida em vez de devolver um número plausível', () => {
    expect(frequenciaDaNota('H4')).toBeNull();
    expect(frequenciaDaNota('C')).toBeNull();
    expect(frequenciaDaNota('')).toBeNull();
  });

  it('identifica a nota mais próxima de uma frequência', () => {
    expect(notaMaisProxima(440)?.nota).toBe('A4');
    expect(notaMaisProxima(261.63)?.nota).toBe('C4');
    expect(notaMaisProxima(440)?.deviationCents).toBe(0);
  });

  it('o desvio em cents é a definição, não uma aproximação', () => {
    // Um semitom são exatamente 100 cents; uma oitava, 1200.
    expect(desvioEmCents(frequenciaDaNota('A#4')!, 440)).toBeCloseTo(100, 6);
    expect(desvioEmCents(880, 440)).toBeCloseTo(1200, 6);
    expect(desvioEmCents(440, 440)).toBeCloseTo(0, 9);
    // 20 cents acima de A4.
    expect(desvioEmCents(440 * Math.pow(2, 20 / 1200), 440)).toBeCloseTo(20, 6);
  });
});

describe('Curvas de pontuação', () => {
  it('desvio inaudível não penaliza', () => {
    expect(pontuarAfinacao(0)).toBe(100);
    expect(pontuarAfinacao(4)).toBe(100);
    expect(pontuarAfinacao(-5)).toBe(100);
  });

  it('meio semitom zera — a esta altura já se ouve outra nota', () => {
    expect(pontuarAfinacao(50)).toBe(0);
    expect(pontuarAfinacao(-70)).toBe(0);
  });

  it('é monotônica e simétrica', () => {
    for (let d = 0; d < 50; d++) {
      expect(pontuarAfinacao(d)).toBeGreaterThanOrEqual(pontuarAfinacao(d + 1));
      expect(pontuarAfinacao(d)).toBe(pontuarAfinacao(-d));
    }
  });

  it('o tempo segue o limiar de percepção de assincronia', () => {
    expect(pontuarTempo(0)).toBe(100);
    expect(pontuarTempo(20)).toBe(100);
    expect(pontuarTempo(120)).toBe(0);
    expect(pontuarTempo(60)).toBeGreaterThan(0);
    expect(pontuarTempo(60)).toBeLessThan(100);
  });
});

describe('Medição — o que não foi medido fica AUSENTE', () => {
  it('sem som, a afinação é null e a ausência é explicada', () => {
    // A versão anterior devolveria aqui um desvio entre 45 e 85 cents,
    // sorteado, e o aluno leria isso como "você desafinou".
    const m = medirTentativa({ notaAlvo: 'A4' }, 'ACOUSTICS');

    expect(m.afinacao.deviationCents).toBeNull();
    expect(m.afinacao.pontuacao).toBeNull();
    expect(m.notaGlobal).toBeNull();
    expect(m.ausencias.join(' ')).toMatch(/som audível/i);
  });

  it('ausência NÃO é zero', () => {
    const m = medirTentativa({ notaAlvo: 'A4' }, 'ACOUSTICS');
    expect(m.afinacao.pontuacao).not.toBe(0);
    expect(m.estabilidadeRitmica).not.toBe(0);
  });

  it('nada medido significa nem aprovado nem reprovado', () => {
    const m = medirTentativa({}, 'ACOUSTICS');
    expect(tentativaAprovada(m)).toBeNull();
  });

  it('a mesma entrada produz sempre a mesma medição', () => {
    // O sorteio anterior falhava exatamente aqui.
    const sinal = { frequenciesHz: [442, 441, 443], notaAlvo: 'A4' };
    const a = medirTentativa(sinal, 'ACOUSTICS');
    const b = medirTentativa(sinal, 'ACOUSTICS');
    expect(a).toEqual(b);
  });
});

describe('Medição acústica', () => {
  it('nota exata dá afinação perfeita', () => {
    const m = medirTentativa({ frequenciesHz: [440, 440, 440], notaAlvo: 'A4' }, 'ACOUSTICS');
    expect(m.afinacao.deviationCents).toBe(0);
    expect(m.afinacao.pontuacao).toBe(100);
    expect(m.afinacao.notaDetectada).toBe('A4');
  });

  it('mede o desvio real de quem canta um pouco alto', () => {
    // 30 cents acima de A4.
    const f = 440 * Math.pow(2, 30 / 1200);
    const m = medirTentativa({ frequenciesHz: [f, f, f], notaAlvo: 'A4' }, 'ACOUSTICS');
    expect(m.afinacao.deviationCents).toBe(30);
    expect(m.afinacao.pontuacao).toBeLessThan(100);
    expect(m.afinacao.pontuacao).toBeGreaterThan(0);
  });

  it('usa a mediana: um quadro espúrio não desloca a leitura', () => {
    const m = medirTentativa(
      { frequenciesHz: [440, 441, 439, 1760, 440], notaAlvo: 'A4' },
      'ACOUSTICS'
    );
    expect(m.afinacao.notaDetectada).toBe('A4');
    expect(Math.abs(m.afinacao.deviationCents!)).toBeLessThan(10);
  });

  it('afinação firme pontua mais que afinação oscilante', () => {
    const firme = medirTentativa(
      { frequenciesHz: [440, 440.2, 439.8, 440.1, 440], notaAlvo: 'A4' },
      'ACOUSTICS'
    );
    const oscilante = medirTentativa(
      { frequenciesHz: [430, 450, 435, 447, 440], notaAlvo: 'A4' },
      'ACOUSTICS'
    );
    expect(firme.estabilidadeDeAltura!).toBeGreaterThan(oscilante.estabilidadeDeAltura!);
  });

  it('calcula o andamento a partir dos ataques', () => {
    // Quatro ataques a cada 500 ms = 120 bpm.
    const m = medirTentativa({ ataquesMs: [0, 500, 1000, 1500], bpmAlvo: 120 }, 'ACOUSTICS');
    expect(m.tempoRitmico.bpmMedido).toBe(120);
    expect(m.tempoRitmico.meanDeviationMs).toBe(0);
    expect(m.tempoRitmico.pontuacao).toBe(100);
  });

  it('detecta o arrasto de quem atrasa progressivamente', () => {
    const m = medirTentativa({ ataquesMs: [0, 520, 1070, 1650], bpmAlvo: 120 }, 'ACOUSTICS');
    expect(m.tempoRitmico.meanDeviationMs!).toBeGreaterThan(0);
    expect(m.tempoRitmico.pontuacao!).toBeLessThan(100);
  });

  it('pulso regular pontua mais que pulso irregular', () => {
    const regular = medirTentativa({ ataquesMs: [0, 500, 1000, 1500] }, 'ACOUSTICS');
    const irregular = medirTentativa({ ataquesMs: [0, 380, 1010, 1380] }, 'ACOUSTICS');
    expect(regular.estabilidadeRitmica!).toBeGreaterThan(irregular.estabilidadeRitmica!);
  });

  it('um ataque só não permite medir andamento', () => {
    const m = medirTentativa({ ataquesMs: [0], bpmAlvo: 120 }, 'ACOUSTICS');
    expect(m.tempoRitmico.bpmMedido).toBeNull();
    expect(m.ausencias.join(' ')).toMatch(/ao menos dois/i);
  });
});

describe('Medição simbólica', () => {
  it('teoria é medida por acerto, não por afinação', () => {
    const m = medirTentativa(
      { respostaEsperada: 'Terça maior', respostaDada: 'terça maior', tempoDeRespostaMs: 3200 },
      'SIMBOLICA'
    );
    expect(m.acerto.correto).toBe(true);
    expect(m.notaGlobal).toBe(100);
    // Não perde ponto por não ter afinação para medir.
    expect(m.afinacao.pontuacao).toBeNull();
    expect(m.dimensoesMedidas).toEqual(['acerto']);
  });

  it('a resposta errada é registrada como errada, sem meio-termo', () => {
    const m = medirTentativa(
      { respostaEsperada: 'Terça maior', respostaDada: 'Terça menor' },
      'SIMBOLICA'
    );
    expect(m.acerto.correto).toBe(false);
    expect(m.notaGlobal).toBe(0);
  });

  it('classifica corretamente a natureza de cada exercício', () => {
    expect(naturezaDoExercicio(PracticeModality.VOICE, ExerciseType.SIGHT_SINGING)).toBe('ACOUSTICS');
    expect(naturezaDoExercicio(PracticeModality.RHYTHM, ExerciseType.RHYTHM_TAP)).toBe('ACOUSTICS');
    expect(naturezaDoExercicio(PracticeModality.THEORY, ExerciseType.INTERVAL)).toBe('SIMBOLICA');
    expect(naturezaDoExercicio(PracticeModality.EAR_TRAINING, ExerciseType.CHORD)).toBe('SIMBOLICA');
  });
});

describe('Nota global', () => {
  it('pondera só o que foi medido, renormalizando os pesos', () => {
    // Só afinação, e perfeita: a nota é 100, não 30 (o peso da afinação).
    const m = medirTentativa({ frequenciesHz: [440], notaAlvo: 'A4' }, 'ACOUSTICS');
    expect(m.notaGlobal).toBe(100);
    expect(m.dimensoesMedidas).toEqual(['afinacao']);
  });

  it('combina dimensões quando há mais de uma', () => {
    const m = medirTentativa(
      {
        frequenciesHz: [440, 440, 440, 440],
        notaAlvo: 'A4',
        ataquesMs: [0, 500, 1000, 1500],
        bpmAlvo: 120,
      },
      'ACOUSTICS'
    );
    expect(m.dimensoesMedidas.length).toBeGreaterThan(1);
    expect(m.notaGlobal).toBeGreaterThan(90);
  });
});

describe('Domínio e dificuldade', () => {
  it('domínio exige constância, não um pico', () => {
    // Uma execução excelente isolada não é domínio.
    expect(atingiuDominio([100])).toBe(false);
    expect(atingiuDominio([100, 40, 100])).toBe(false);
    expect(atingiuDominio([88, 90, 92])).toBe(true);
  });

  it('uma queda na última tentativa desfaz o domínio', () => {
    expect(atingiuDominio([95, 95, 60])).toBe(false);
  });

  it('a dificuldade sobe só com folga confortável', () => {
    expect(ajustarDificuldade('iniciante', [95, 93, 96])).toBe('intermediario');
    expect(ajustarDificuldade('iniciante', [80, 85, 88])).toBe('iniciante');
  });

  it('a dificuldade desce com dificuldade persistente', () => {
    expect(ajustarDificuldade('avancado', [40, 50, 45])).toBe('intermediario');
  });

  it('a faixa do meio não mexe em nada', () => {
    // Oscilar a dificuldade a cada tentativa destrói a referência que o aluno
    // usa para saber se está melhorando.
    expect(ajustarDificuldade('intermediario', [70, 75, 72])).toBe('intermediario');
  });

  it('não extrapola os extremos da escala', () => {
    expect(ajustarDificuldade('virtuoso', [99, 99, 99])).toBe('virtuoso');
    expect(ajustarDificuldade('iniciante', [10, 10, 10])).toBe('iniciante');
  });

  it('poucas tentativas não mudam a dificuldade', () => {
    expect(ajustarDificuldade('intermediario', [99, 99])).toBe('intermediario');
  });
});
