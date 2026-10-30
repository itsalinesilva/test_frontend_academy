import { describe, it, expect } from 'vitest';
import {
  GENERATED_DIMENSIONS,
  Level,
  generateExercise,
  supportsLevel,
} from '../src/domain/exercise-generator';
import { Dimension } from '../src/domain/music-grammar';
import { MusicExercise } from '../src/domain/music-exercise';

/**
 * 🔴 O NEXO DAS PERGUNTAS GERADAS.
 *
 * O QUE ESTE ARQUIVO EXISTE PARA IMPEDIR
 * --------------------------------------
 * O gerador produzia, em produção, na tela do percurso:
 *
 *     "Que nota está uma si — qual destas é?"          → resposta: si
 *     "De si, subindo 8 semitons — que intervalo é?"   → resposta: Sexta Menor
 *     "Que escala tem os graus 0, 2, 3, 5, 7, 8, 10?"  → e a explicação
 *                                                        repetia 0-2-3-5-7-8-10
 *     "Que figura vale 1/2 semínimas?"                 → fração crua, plural errado
 *     "A semibreve vale 1 da semibreve."               → tautologia sem unidade
 *
 * Três defeitos distintos, e todos passavam porque nada olhava o **texto** que
 * chega ao aluno:
 *
 *   1. a resposta dentro do enunciado — mede leitura do enunciado, não música;
 *   2. explicação que repete a pergunta — não ensina quem errou;
 *   3. nenhuma ilustração — perguntar "que nota é" sem mostrar a nota escrita
 *      obriga o enunciado a dizê-la.
 *
 * Um teste de contagem nunca pegaria isso: os exercícios existiam, tinham
 * alternativas e tinham gabarito. O que faltava era **sentido**.
 */

/** Todos os exercícios que o gerador sabe produzir, em várias sementes. */
/**
 * Gerados UMA vez por arquivo: com as vinte e uma dimensões são ~25 mil
 * exercícios, e cada um dos vinte casos regerava todos — o arquivo passou a
 * levar 40 s e a estourar o prazo com a máquina ocupada (GR-8). O gerador é
 * determinístico, então a mesma lista serve a todos os casos.
 */
let jaGerados: Array<{ d: Dimension; level: Level; seed: number; e: MusicExercise }> | null = null;

function todos(): Array<{ d: Dimension; level: Level; seed: number; e: MusicExercise }> {
  if (jaGerados) return jaGerados;
  const saida: Array<{ d: Dimension; level: Level; seed: number; e: MusicExercise }> = [];

  for (const d of GENERATED_DIMENSIONS) {
    for (const level of [Level.RECOGNIZE, Level.NAME, Level.EAR]) {
      if (!supportsLevel(d, level)) continue;
      /**
       * 🔴 A VARREDURA PRECISA COBRIR AS COMBINAÇÕES RARAS.
       *
       * Com 40 sementes, "si aumentado" nunca era sorteado — e ele é
       * exatamente o caso que quebra: a quinta aumentada de si exige fá♯♯, que
       * a pauta não desenha, e o exercício saía SEM figura perguntando "que
       * acorde está escrito na pauta?".
       *
       * A varredura curta deu verde numa versão que tinha o defeito. Amostra
       * pequena não é conferência: é sorteio.
       */
      for (let seed = 1; seed <= 400; seed++) {
        const e = generateExercise(d, level, seed);
        if (e) saida.push({ d, level, seed, e });
      }
    }
  }

  jaGerados = saida;
  return saida;
}

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

describe('a conferência não roda sobre vazio', () => {
  it('há exercícios gerados de verdade, em todas as dimensões com gerador', () => {
    const lista = todos();
    expect(lista.length, 'nenhum exercício gerado — o arquivo passaria à toa').toBeGreaterThan(100);

    const cobertas = new Set(lista.map((x) => x.d));
    for (const d of GENERATED_DIMENSIONS) {
      expect(cobertas.has(d), `"${d}" não gerou exercício nenhum`).toBe(true);
    }
  });
});

describe('🔴 a RESPOSTA nunca está no enunciado', () => {
  it('nenhum enunciado contém o rótulo da alternativa certa', () => {
    /**
     * Este é o caso que a versão anterior reprovaria em massa. "Que nota está
     * uma si" com resposta "si" é o exemplo puro: quem lê a pergunta já sabe.
     */
    const falhas: string[] = [];

    for (const { d, level, seed, e } of todos()) {
      const certa = e.choices.find((c) => e.correctIds.includes(c.id))!;
      /**
       * Fronteira de PALAVRA, e não substring.
       *
       * "Repare" contém "re", que normaliza igual a "ré". Sem a fronteira o
       * caso acusaria o enunciado honesto e escondaria o desonesto no meio do
       * ruído — falso positivo em massa é o jeito mais rápido de um
       * verificador ser desligado.
       */
      const enunciado = normalizar(e.prompt);
      const resposta = normalizar(certa.label);
      const escapada = resposta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const comFronteira = new RegExp(`(^|[^a-z0-9])${escapada}([^a-z0-9]|$)`);

      if (comFronteira.test(enunciado)) {
        falhas.push(`${d}/${Level[level]}/${seed}: "${e.prompt}" → "${certa.label}"`);
      }
    }

    expect(falhas.slice(0, 5), `${falhas.length} enunciados entregam a resposta`).toEqual([]);
  });

  it('🔴 o enunciado não dita a fórmula que identifica a resposta', () => {
    /**
     * "Que escala tem os graus 0, 2, 3, 5, 7, 8, 10 em semitons?" não contém o
     * rótulo "si menor natural", e mesmo assim entrega a resposta: a sequência
     * **é** a definição. O mesmo valia para o acorde ("os intervalos 0, 4, 7")
     * e para o intervalo ("subindo 8 semitons").
     *
     * Enunciado de leitura não carrega lista de números: a informação está na
     * figura.
     */
    const falhas: string[] = [];

    for (const { d, level, seed, e } of todos()) {
      if (level === Level.EAR) continue;
      if (d === Dimension.NOTE_VALUE || d === Dimension.KEY_SIGNATURE) continue;

      /** Duas ou mais quantidades no enunciado é fórmula ditada. */
      const numeros = e.prompt.match(/\d+/g) ?? [];
      if (numeros.length >= 2) {
        falhas.push(`${d}/${Level[level]}/${seed}: "${e.prompt}"`);
      }
    }

    expect(falhas.slice(0, 5), `${falhas.length} enunciados ditam a fórmula`).toEqual([]);
  });
});

describe('🔴 pergunta de LEITURA mostra o que se lê', () => {
  it('todo exercício de leitura tem figura', () => {
    /**
     * Perguntar "que nota é" sem mostrar a nota escrita força o enunciado a
     * dizê-la — que é exatamente como o defeito nasceu. A figura não é enfeite:
     * é o lugar onde a informação mora.
     */
    const falhas: string[] = [];

    for (const { d, level, seed, e } of todos()) {
      if (level === Level.EAR) continue;
      /** Valor de figura e armadura são convenções de escrita, sem pauta a ler. */
      if (d === Dimension.NOTE_VALUE || d === Dimension.KEY_SIGNATURE) continue;

      if (!e.figura) falhas.push(`${d}/${Level[level]}/${seed}: "${e.prompt}"`);
    }

    expect(falhas.slice(0, 5), `${falhas.length} exercícios de leitura sem figura`).toEqual([]);
  });

  it('a figura é desenhável: notas em notação científica válida', () => {
    /**
     * Uma nota que o renderizador não entende some da pauta — e aí a pergunta
     * fica sobre uma figura incompleta, sem nada acusar.
     */
    /** `_` é pausa: ritmo sem pausa não mostra contratempo. */
    const cientifica = /^([A-G](#|b)?-?\d|_)$/;
    const falhas: string[] = [];

    for (const { d, seed, e } of todos()) {
      if (e.figura?.kind !== 'STAFF') continue;

      expect(e.figura.notes.length, `${d}/${seed}: pauta vazia`).toBeGreaterThan(0);

      for (const n of e.figura.notes) {
        if (!cientifica.test(n)) falhas.push(`${d}/${seed}: nota ilegível "${n}"`);
      }
    }

    expect(falhas.slice(0, 5), `${falhas.length} notas que a pauta não desenha`).toEqual([]);
  });

  it('a legenda da figura nunca entrega a resposta', () => {
    for (const { d, seed, e } of todos()) {
      const legenda = e.figura?.caption;
      if (!legenda) continue;

      const certa = e.choices.find((c) => e.correctIds.includes(c.id))!;
      expect(
        normalizar(legenda).includes(normalizar(certa.label)),
        `${d}/${seed}: a legenda diz a resposta`
      ).toBe(false);
    }
  });

  it('exercício de ouvido tem som, e não tem figura', () => {
    /** Mostrar a pauta num exercício de ouvido é entregar a resposta escrita. */
    for (const { d, level, seed, e } of todos()) {
      if (level !== Level.EAR) continue;

      expect(e.audio, `${d}/${seed}: exercício de ouvido sem som`).toBeDefined();
      expect(e.audio!.frequenciesHz.length, `${d}/${seed}: som vazio`).toBeGreaterThan(0);
      expect(e.figura, `${d}/${seed}: o exercício de ouvido mostra a resposta escrita`).toBeUndefined();
    }
  });
});

describe('🔴 a explicação ENSINA — não repete a pergunta', () => {
  it('nenhuma explicação repete a fórmula que o enunciado já daria', () => {
    /**
     * "A escala menor natural tem a sequência 0-2-3-5-7-8-10 em semitons" era
     * a explicação de uma pergunta que dizia "os graus 0, 2, 3, 5, 7, 8, 10".
     * Quem errou lia duas vezes a mesma coisa.
     */
    const falhas: string[] = [];

    for (const { d, level, seed, e } of todos()) {
      if (d === Dimension.SCALE || d === Dimension.CHORD) {
        /** Sequência de três ou mais números ligados por hífen é a fórmula crua. */
        if (/\d+([-,]\s?\d+){2,}/.test(e.explanation)) {
          falhas.push(`${d}/${Level[level]}/${seed}: "${e.explanation}"`);
        }
      }
    }

    expect(falhas.slice(0, 5), `${falhas.length} explicações repetem a fórmula`).toEqual([]);
  });

  it('nenhuma explicação é tautologia quebrada', () => {
    /** "A semibreve vale 1 da semibreve" — o sujeito e o complemento iguais. */
    const falhas: string[] = [];

    for (const { d, seed, e } of todos()) {
      const m = e.explanation.match(/A (\w+) vale .* da (\w+)\./);
      if (m && normalizar(m[1]) === normalizar(m[2])) {
        falhas.push(`${d}/${seed}: "${e.explanation}"`);
      }
    }

    expect(falhas, 'explicação que se define por si mesma').toEqual([]);
  });

  it('toda explicação tem frase de verdade, e não só um rótulo', () => {
    for (const { d, seed, e } of todos()) {
      expect(e.explanation.trim(), `${d}/${seed}: explicação vazia`).not.toBe('');
      expect(
        e.explanation.trim().length,
        `${d}/${seed}: explicação curta demais para ensinar: "${e.explanation}"`
      ).toBeGreaterThan(20);
      expect(e.explanation.trim().endsWith('.'), `${d}/${seed}: explicação sem ponto final`).toBe(
        true
      );
    }
  });

  it('🔴 nenhum jargão de implementação chega ao aluno', () => {
    /**
     * "classe de altura 11" é vocabulário de quem programa afinação. Para quem
     * está aprendendo a ler uma nota, é ruído com aparência de rigor.
     */
    const proibidos = [/classe de altura/i, /pitch class/i, /midi/i, /\bhz\b/i, /semitons?\b.*\barray/i];

    for (const { d, seed, e } of todos()) {
      for (const p of proibidos) {
        expect(p.test(e.explanation), `${d}/${seed}: jargão em "${e.explanation}"`).toBe(false);
        expect(p.test(e.prompt), `${d}/${seed}: jargão no enunciado "${e.prompt}"`).toBe(false);
      }
    }
  });
});

describe('o português está certo', () => {
  it('nenhuma fração crua no texto que o aluno lê', () => {
    /** "Que figura vale 1/2 semínimas?" — e o plural depois de meia. */
    for (const { d, seed, e } of todos()) {
      expect(/\d\/\d\s+sem[íi]nima/.test(e.prompt), `${d}/${seed}: "${e.prompt}"`).toBe(false);
    }
  });

  it('a concordância de número bate no enunciado e na explicação', () => {
    const falhas: string[] = [];

    for (const { d, seed, e } of todos()) {
      for (const texto of [e.prompt, e.explanation]) {
        /** "1 semitom formam" / "uma semínima valem" — singular com verbo plural. */
        if (/\b(1|um|uma)\s+\w+\s+(formam|valem|têm|são)\b/i.test(texto)) {
          falhas.push(`${d}/${seed}: "${texto}"`);
        }
        /** "2 semínima" — plural com substantivo singular. */
        if (/\b([2-9]|\d{2,})\s+(sem[íi]nima|semitom|alteração)\b/i.test(texto)) {
          falhas.push(`${d}/${seed}: "${texto}"`);
        }
      }
    }

    expect(falhas.slice(0, 5), `${falhas.length} erros de concordância`).toEqual([]);
  });

  it('todo enunciado é uma pergunta ou uma ordem, e não um fragmento', () => {
    for (const { d, seed, e } of todos()) {
      const p = e.prompt.trim();
      expect(p.length, `${d}/${seed}: enunciado curto demais`).toBeGreaterThan(15);
      expect(
        p.endsWith('?') || p.endsWith('.') || /^Ouça/.test(p),
        `${d}/${seed}: enunciado sem forma de pergunta: "${p}"`
      ).toBe(true);
    }
  });
});

describe('🔴 RECONHECER e NOMEAR são níveis DIFERENTES', () => {
  it('o nível NAME não é só "mais um distrator"', () => {
    /**
     * O cabeçalho do gerador promete que `NAME` é "sem apoio no enunciado". Os
     * dois níveis produziam enunciado idêntico, mudando só de 3 para 4
     * alternativas — a promessa do próprio arquivo não era cumprida.
     *
     * Agora `NAME` também troca de clave, e a mesma posição na pauta passa a
     * ser outra nota. É a competência que o nível cobra.
     */
    const claves = new Set<string>();

    for (let seed = 1; seed <= 120; seed++) {
      const e = generateExercise(Dimension.NOTE, Level.NAME, seed);
      if (e?.figura?.kind === 'STAFF') claves.add(e.figura.clef);
    }

    expect(claves.size, 'NAME usa uma clave só — é RECOGNIZE com um distrator a mais').toBeGreaterThan(1);
  });

  it('RECOGNIZE fica na clave de sol, que é a que se aprende primeiro', () => {
    for (let seed = 1; seed <= 120; seed++) {
      const e = generateExercise(Dimension.NOTE, Level.RECOGNIZE, seed);
      if (e?.figura?.kind === 'STAFF') {
        expect(e.figura.clef, `semente ${seed}: RECOGNIZE saiu fora da clave de sol`).toBe('treble');
      }
    }
  });

  it('NAME oferece mais alternativas que RECOGNIZE', () => {
    const r = generateExercise(Dimension.INTERVAL, Level.RECOGNIZE, 1)!;
    const n = generateExercise(Dimension.INTERVAL, Level.NAME, 1)!;
    expect(n.choices.length).toBeGreaterThan(r.choices.length);
  });
});

describe('a estrutura do exercício continua íntegra', () => {
  it('a resposta certa está entre as alternativas, e é uma só', () => {
    for (const { d, seed, e } of todos()) {
      expect(e.correctIds.length, `${d}/${seed}: mais de uma resposta certa`).toBe(1);
      expect(
        e.choices.some((c) => e.correctIds.includes(c.id)),
        `${d}/${seed}: a resposta certa não está entre as alternativas`
      ).toBe(true);
    }
  });

  it('nenhuma alternativa se repete dentro do mesmo exercício', () => {
    /** Duas alternativas iguais fazem duas estarem certas, ou nenhuma. */
    for (const { d, seed, e } of todos()) {
      const rotulos = e.choices.map((c) => c.label);
      expect(new Set(rotulos).size, `${d}/${seed}: alternativa repetida em ${rotulos}`).toBe(
        rotulos.length
      );
    }
  });

  it('a mesma semente produz o mesmo exercício', () => {
    for (const d of GENERATED_DIMENSIONS) {
      const a = generateExercise(d, Level.RECOGNIZE, 12);
      const b = generateExercise(d, Level.RECOGNIZE, 12);
      expect(JSON.stringify(a), `${d}: o gerador não é reproduzível`).toBe(JSON.stringify(b));
    }
  });
});
