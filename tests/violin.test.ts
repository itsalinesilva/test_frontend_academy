import { describe, it, expect } from 'vitest';
import {
  CORDAS,
  ondeTocar,
  fracaoDoBraco,
  notasEmPrimeiraPosicao,
  descreverExecucao,
  notaCabeEmPrimeiraPosicao,
} from '../src/domain/violin';
import {
  julgarNota,
  julgarExecucao,
  simplificar,
  batidaParaMs,
  PartituraExecutavel,
  AmostraDetectada,
} from '../src/domain/score-follow';
import { frequenciaDaNota } from '../src/domain/practice-measurement';
import { PARTITURAS_VIOLINO } from '../src/data/seed-violin-scores';

describe('Braço do violino — física, não desenho', () => {
  it('as quatro cordas estão afinadas em quintas justas', () => {
    for (let i = 1; i < CORDAS.length; i++) {
      const anterior = frequenciaDaNota(CORDAS[i - 1].solta)!;
      const atual = frequenciaDaNota(CORDAS[i].solta)!;
      // Uma quinta justa temperada são 7 semitons: razão 2^(7/12).
      expect(atual / anterior).toBeCloseTo(Math.pow(2, 7 / 12), 6);
    }
  });

  it('a oitava cai exatamente no meio da corda', () => {
    // A verificação mais simples de que a fórmula está certa. Um braço com
    // dedos igualmente espaçados — o erro comum — falharia aqui.
    expect(fracaoDoBraco(12)).toBeCloseTo(0.5, 10);
  });

  it('as distâncias entre dedos DIMINUEM conforme se sobe', () => {
    // É isto que o aluno precisa ver, e é isto que um diagrama desenhado
    // "de olho" ensina errado — no violino não há trastes para corrigir.
    const passos = [1, 2, 3, 4, 5, 6, 7].map((s) => fracaoDoBraco(s) - fracaoDoBraco(s - 1));
    for (let i = 1; i < passos.length; i++) {
      expect(passos[i]).toBeLessThan(passos[i - 1]);
    }
  });

  it('a fração cresce monotonicamente e fica dentro da corda', () => {
    for (let s = 0; s <= 12; s++) {
      expect(fracaoDoBraco(s)).toBeGreaterThanOrEqual(0);
      expect(fracaoDoBraco(s)).toBeLessThan(1);
      if (s > 0) expect(fracaoDoBraco(s)).toBeGreaterThan(fracaoDoBraco(s - 1));
    }
  });
});

describe('Digitação em primeira posição', () => {
  it('as cordas soltas são preferidas quando possível', () => {
    // Lá 4 existe como corda solta e como 4º dedo no Ré. Um iniciante toca
    // a corda solta, e é isso que os métodos de iniciação assumem.
    for (const corda of CORDAS) {
      const p = ondeTocar(corda.solta)!;
      expect(p.corda.indice).toBe(corda.indice);
      expect(p.digitacao.dedo).toBe(0);
    }
  });

  it('coloca as notas onde o professor colocaria', () => {
    const casos: [string, string, number][] = [
      ['A3', 'Sol', 1],
      ['B3', 'Sol', 2],
      ['C4', 'Sol', 3],
      ['E4', 'Ré', 1],
      ['F#4', 'Ré', 2],
      ['G4', 'Ré', 3],
      ['B4', 'Lá', 1],
      ['C#5', 'Lá', 2],
      ['D5', 'Lá', 3],
      ['F#5', 'Mi', 1],
      ['A5', 'Mi', 3],
      ['B5', 'Mi', 4],
    ];
    for (const [nota, corda, dedo] of casos) {
      const p = ondeTocar(nota);
      expect(p, `${nota} deveria ser tocável`).not.toBeNull();
      expect(p!.corda.nome, `${nota}: corda`).toBe(corda);
      expect(p!.digitacao.dedo, `${nota}: dedo`).toBe(dedo);
    }
  });

  it('distingue o 2º dedo baixo do alto', () => {
    // Confundir os dois é a origem de boa parte da desafinação de iniciante.
    expect(ondeTocar('F4')!.digitacao).toMatchObject({ dedo: 2, variante: 'baixo' });
    expect(ondeTocar('F#4')!.digitacao).toMatchObject({ dedo: 2, variante: 'natural' });
    expect(ondeTocar('C5')!.digitacao).toMatchObject({ dedo: 2, variante: 'baixo' });
    expect(ondeTocar('C#5')!.digitacao).toMatchObject({ dedo: 2, variante: 'natural' });
  });

  it('recusa nota fora da primeira posição em vez de inventar digitação', () => {
    expect(ondeTocar('F3')).toBeNull(); // abaixo da corda mais grave
    expect(ondeTocar('D6')).toBeNull(); // exige mudança de posição
    expect(notaCabeEmPrimeiraPosicao('C6')).toBe(false);
  });

  it('cobre 32 pontos: quatro cordas, oito alturas cada', () => {
    const points = notasEmPrimeiraPosicao();
    expect(points).toHaveLength(32);
    expect(new Set(points.map((p) => p.corda.nome)).size).toBe(4);
  });

  it('a frequência calculada bate com a nota nomeada', () => {
    for (const p of notasEmPrimeiraPosicao()) {
      expect(p.frequenciaHz).toBeCloseTo(frequenciaDaNota(p.nota)!, 4);
    }
  });

  it('descreve a execução como se diz em aula', () => {
    expect(descreverExecucao(ondeTocar('D4')!).texto).toContain('solta');
    expect(descreverExecucao(ondeTocar('F4')!).texto).toContain('2º dedo baixo');
    expect(descreverExecucao(ondeTocar('B4')!).acessivel).toContain('corda Lá');
  });
});

// ---------------------------------------------------------------------------

const PECA: PartituraExecutavel = {
  id: 'teste',
  titulo: 'Exercício',
  bpmOriginal: 60,
  compasso: [4, 4],
  notas: [
    { id: 'n1', nota: 'A4', inicioBatida: 0, duracaoBatidas: 1 },
    { id: 'n2', nota: 'B4', inicioBatida: 1, duracaoBatidas: 1 },
    { id: 'n3', nota: 'C#5', inicioBatida: 2, duracaoBatidas: 1 },
    { id: 'n4', nota: 'D5', inicioBatida: 3, duracaoBatidas: 1 },
  ],
};

function amostrasDe(pares: [number, string][], bpm = 60): AmostraDetectada[] {
  return pares.map(([batida, nota]) => ({
    ms: batidaParaMs(batida, bpm),
    frequenciaHz: frequenciaDaNota(nota)!,
  }));
}

describe('Acompanhamento de partitura', () => {
  it('execução exata dá pontuação máxima', () => {
    const r = julgarExecucao(
      PECA,
      amostrasDe([[0, 'A4'], [1, 'B4'], [2, 'C#5'], [3, 'D5']]),
      60
    );
    expect(r.julgamentos.every((j) => j.verdict === 'PERFEITO')).toBe(true);
    expect(r.precisao).toBe(100);
    expect(r.maiorSequencia).toBe(4);
  });

  it('separa erro de altura de erro de tempo', () => {
    // Tocar a nota certa fora do tempo e a nota errada no tempo são erros
    // diferentes, com correções diferentes.
    const alturaErrada = julgarNota(PECA.notas[0], amostrasDe([[0, 'C5']]), 60);
    expect(alturaErrada.verdict).toBe('ALTURA_ERRADA');

    const atrasado = julgarNota(PECA.notas[0], amostrasDe([[0.45, 'A4']]), 60);
    expect(atrasado.verdict).toBe('ATRASADO');
    expect(atrasado.deviationMs).toBeGreaterThan(0);

    const adiantado = julgarNota(PECA.notas[1], amostrasDe([[0.55, 'B4']]), 60);
    expect(adiantado.verdict).toBe('ADIANTADO');
    expect(adiantado.deviationMs).toBeLessThan(0);
  });

  it('silêncio vira NAO_TOCADA, não erro de altura', () => {
    const r = julgarNota(PECA.notas[0], [], 60);
    expect(r.verdict).toBe('NAO_TOCADA');
    expect(r.deviationCents).toBeNull();
  });

  it('a janela acompanha o andamento', () => {
    // 100 ms em 60 BPM é pouco; nos mesmos 100 ms em 240 BPM já é quase uma
    // nota inteira. Uma tolerância fixa seria generosa no lento e cruel no
    // rápido, e o jogo "quebraria" ao acelerar.
    const lento = julgarNota(PECA.notas[0], [{ ms: 100, frequenciaHz: 440 }], 60);
    const rapido = julgarNota(PECA.notas[0], [{ ms: 100, frequenciaHz: 440 }], 240);
    expect(lento.verdict).toBe('PERFEITO');
    expect(rapido.verdict).not.toBe('PERFEITO');
  });

  it('o piso protege andamentos muito rápidos', () => {
    // Abaixo de ~50 ms nenhum instrumentista controla o ataque; sem o piso o
    // "perfeito" viraria inalcançável por razão física, não musical.
    const r = julgarNota(PECA.notas[0], [{ ms: 40, frequenciaHz: 440 }], 300);
    expect(r.verdict).toBe('PERFEITO');
  });

  it('escolhe a amostra pela altura, não pela proximidade no tempo', () => {
    // Durante a mudança de nota o microfone ainda capta o fim da anterior.
    // Escolher por tempo atribuiria à nota nova a altura da velha.
    const r = julgarNota(
      PECA.notas[1],
      [
        { ms: batidaParaMs(1.02, 60), frequenciaHz: frequenciaDaNota('A4')! },
        { ms: batidaParaMs(1.1, 60), frequenciaHz: frequenciaDaNota('B4')! },
      ],
      60
    );
    expect(r.verdict).not.toBe('ALTURA_ERRADA');
  });

  it('pausa não conta como acerto nem como erro', () => {
    const comPausa: PartituraExecutavel = {
      ...PECA,
      notas: [...PECA.notas, { id: 'p1', nota: null, inicioBatida: 4, duracaoBatidas: 1 }],
    };
    const r = julgarExecucao(comPausa, amostrasDe([[0, 'A4']]), 60);
    expect(r.notasJulgadas).toBe(4);
  });

  it('a maior sequência quebra no erro e recomeça', () => {
    const r = julgarExecucao(
      PECA,
      amostrasDe([[0, 'A4'], [1, 'C5'], [2, 'C#5'], [3, 'D5']]),
      60
    );
    expect(r.maiorSequencia).toBe(2);
    expect(r.correct).toBe(3);
  });

  it('relata os desvios médios em ms e em cents', () => {
    const r = julgarExecucao(PECA, amostrasDe([[0, 'A4'], [1, 'B4']]), 60);
    expect(r.desvioMedioMs).not.toBeNull();
    expect(r.desvioMedioCents).not.toBeNull();
  });
});

describe('Simplificação de partitura', () => {
  const densa: PartituraExecutavel = {
    id: 'densa',
    titulo: 'Peça',
    bpmOriginal: 90,
    compasso: [4, 4],
    notas: [
      { id: 'a', nota: 'A4', inicioBatida: 0, duracaoBatidas: 0.5 },
      { id: 'b', nota: 'A4', inicioBatida: 0.5, duracaoBatidas: 0.5 },
      { id: 'c', nota: 'B4', inicioBatida: 1, duracaoBatidas: 0.2 },
      { id: 'd', nota: 'C#5', inicioBatida: 1.2, duracaoBatidas: 0.8 },
      { id: 'e', nota: 'D5', inicioBatida: 2, duracaoBatidas: 2 },
    ],
  };

  it('funde repetições curtas de mesma altura', () => {
    const r = simplificar(densa, 'iniciante');
    expect(r.notas.length).toBeLessThan(densa.notas.length);
    // As duas colcheias de Lá viram uma semínima, e o Si de 0,2 batida —
    // ornamento — é absorvido por ela em vez de deixar um buraco.
    expect(r.notas[0].nota).toBe('A4');
    expect(r.notas[0].duracaoBatidas).toBeCloseTo(1.2, 5);
    expect(r.notas.map((n) => n.nota)).not.toContain('B4');
  });

  it('a versão intermediária preserva o ornamento que a iniciante remove', () => {
    const inter = simplificar(densa, 'intermediario');
    expect(inter.notas.map((n) => n.nota)).toContain('B4');
  });

  it('preserva o CONTORNO da melodia', () => {
    // O ponto é chegar à versão original reconhecendo a peça, não decorando.
    const r = simplificar(densa, 'iniciante');
    const alturas = r.notas.map((n) => n.nota);
    expect(alturas[0]).toBe('A4');
    expect(alturas[alturas.length - 1]).toBe('D5');
  });

  it('não altera a duração total da peça', () => {
    const fim = (p: PartituraExecutavel) =>
      Math.max(...p.notas.map((n) => n.inicioBatida + n.duracaoBatidas));
    expect(fim(simplificar(densa, 'iniciante'))).toBe(fim(densa));
    expect(fim(simplificar(densa, 'intermediario'))).toBe(fim(densa));
  });

  it('"original" devolve a peça intacta', () => {
    expect(simplificar(densa, 'original')).toBe(densa);
  });
});

describe('Peças do simulador', () => {
  it('toda nota de toda peça cabe em primeira posição', () => {
    // Sem esta guarda, uma peça nova pode pedir uma nota que exige mudança de
    // posição — e o simulador mostraria um braço sem indicação alguma,
    // deixando o aluno sem saber onde pisar.
    for (const p of PARTITURAS_VIOLINO) {
      for (const n of p.notas) {
        if (n.nota === null) continue;
        expect(
          notaCabeEmPrimeiraPosicao(n.nota),
          `${p.titulo}: ${n.nota} (${n.id}) não cabe em primeira posição`
        ).toBe(true);
      }
    }
  });

  it('as notas não se sobrepõem no tempo', () => {
    // O violino do iniciante é monofônico; duas notas simultâneas seriam
    // impossíveis de julgar por detecção de altura única.
    for (const p of PARTITURAS_VIOLINO) {
      const ordenadas = [...p.notas].sort((a, b) => a.inicioBatida - b.inicioBatida);
      for (let i = 1; i < ordenadas.length; i++) {
        const fimAnterior = ordenadas[i - 1].inicioBatida + ordenadas[i - 1].duracaoBatidas;
        expect(
          ordenadas[i].inicioBatida,
          `${p.titulo}: ${ordenadas[i].id} começa antes de ${ordenadas[i - 1].id} terminar`
        ).toBeGreaterThanOrEqual(fimAnterior - 1e-9);
      }
    }
  });

  it('cada peça tem identificador único e andamento plausível', () => {
    const ids = PARTITURAS_VIOLINO.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PARTITURAS_VIOLINO) {
      expect(p.bpmOriginal).toBeGreaterThanOrEqual(40);
      expect(p.bpmOriginal).toBeLessThanOrEqual(160);
      expect(p.notas.length).toBeGreaterThan(0);
    }
  });

  it('a simplificação de qualquer peça continua tocável', () => {
    for (const p of PARTITURAS_VIOLINO) {
      for (const nivel of ['intermediario', 'iniciante'] as const) {
        for (const n of simplificar(p, nivel).notas) {
          if (n.nota === null) continue;
          expect(notaCabeEmPrimeiraPosicao(n.nota)).toBe(true);
        }
      }
    }
  });
});
