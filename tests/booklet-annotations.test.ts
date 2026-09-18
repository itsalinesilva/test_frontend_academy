import { describe, it, expect } from 'vitest';
import {
  Livreto,
  Questao,
  Avaliacao,
  montarSimulado,
  questoesDaAvaliacao,
  conferirEquivalencia,
  validarQuestao,
  validarLivreto,
  totalDeQuestoes,
} from '../src/domain/booklet';
import {
  Anotacao,
  criarAncora,
  resolverAncora,
  segmentar,
  montarCaderno,
  resumirCaderno,
} from '../src/domain/annotations';

// ---------------------------------------------------------------------------

function questao(id: string, sobre: string[], dificuldade: Questao['dificuldade'] = 'basica'): Questao {
  return {
    id,
    enunciado: `Enunciado da questão ${id}, com extensão suficiente.`,
    tipo: 'MULTIPLA_ESCOLHA',
    alternativas: [
      { id: 'a', texto: 'Primeira alternativa' },
      { id: 'b', texto: 'Segunda alternativa' },
      { id: 'c', texto: 'Terceira alternativa' },
      { id: 'd', texto: 'Quarta alternativa' },
    ],
    resposta: 'b',
    explicacao: 'A segunda alternativa é a correta porque descreve o conceito.',
    dificuldade,
    competencias: sobre,
  };
}

const LIVRETO: Livreto = {
  id: 'liv_1',
  cursoId: 'crs_1',
  titulo: 'Caderno de Teoria',
  descricao: 'Exercícios capítulo a capítulo.',
  capitulos: [
    {
      id: 'cap_1',
      numero: 1,
      titulo: 'Notação',
      questoes: [questao('q1', ['notacao']), questao('q2', ['notacao', 'pauta'])],
    },
    {
      id: 'cap_2',
      numero: 2,
      titulo: 'Intervalos',
      questoes: [questao('q3', ['intervalos']), questao('q4', ['intervalos'], 'intermediaria')],
    },
  ],
  criadoEm: '2026-01-01T00:00:00.000Z',
  atualizadoEm: '2026-01-01T00:00:00.000Z',
};

describe('Livreto e simulado', () => {
  it('o simulado reúne TODAS as questões, na ordem dos capítulos', () => {
    const s = montarSimulado(LIVRETO);
    expect(s.questaoIds).toEqual(['q1', 'q2', 'q3', 'q4']);
    expect(s.tipo).toBe('SIMULADO');
  });

  it('o simulado referencia o livreto — não copia', () => {
    // Corrigir um enunciado no livreto tem de corrigir no simulado. Se fosse
    // cópia, a primeira edição quebraria a sincronia e ninguém perceberia.
    const s = montarSimulado(LIVRETO);
    const editado: Livreto = {
      ...LIVRETO,
      capitulos: LIVRETO.capitulos.map((c) => ({
        ...c,
        questoes: c.questoes.map((q) =>
          q.id === 'q1' ? { ...q, enunciado: 'Enunciado corrigido pela revisão.' } : q
        ),
      })),
    };
    const resolvidas = questoesDaAvaliacao(s, editado);
    expect(resolvidas[0].enunciado).toBe('Enunciado corrigido pela revisão.');
  });

  it('a ordem do simulado segue a numeração dos capítulos, não a inserção', () => {
    const invertido: Livreto = { ...LIVRETO, capitulos: [...LIVRETO.capitulos].reverse() };
    expect(montarSimulado(invertido).questaoIds).toEqual(['q1', 'q2', 'q3', 'q4']);
  });

  it('conta as questões do livreto', () => {
    expect(totalDeQuestoes(LIVRETO)).toBe(4);
  });
});

describe('Equivalência entre prova e curso', () => {
  const prova = (questoes: Questao[]): Avaliacao => ({
    id: 'aval_p',
    cursoId: 'crs_1',
    livretoId: 'liv_1',
    tipo: 'PROVA',
    titulo: 'Prova final',
    questaoIds: [],
    questoesProprias: questoes,
    notaDeCorte: 70,
    tempoLimiteMinutos: 60,
    criadoEm: '2026-01-01T00:00:00.000Z',
    atualizadoEm: '2026-01-01T00:00:00.000Z',
  });

  it('aprova uma prova que cobre as mesmas competências', () => {
    const r = conferirEquivalencia(
      LIVRETO,
      prova([questao('p1', ['notacao']), questao('p2', ['pauta']), questao('p3', ['intervalos'])])
    );
    expect(r.equivalente).toBe(true);
    expect(r.faltando).toEqual([]);
  });

  it('acusa competência do curso que a prova esqueceu', () => {
    // Esquecer um capítulo é o erro mais fácil de cometer ao escrever a prova.
    const r = conferirEquivalencia(LIVRETO, prova([questao('p1', ['notacao', 'pauta'])]));
    expect(r.equivalente).toBe(false);
    expect(r.faltando).toContain('intervalos');
  });

  it('acusa a prova que cobra o que o curso não ensinou', () => {
    const r = conferirEquivalencia(
      LIVRETO,
      prova([
        questao('p1', ['notacao']),
        questao('p2', ['pauta']),
        questao('p3', ['intervalos']),
        questao('p4', ['contraponto']),
      ])
    );
    expect(r.equivalente).toBe(false);
    expect(r.excedentes).toContain('contraponto');
  });

  it('relata a distribuição de dificuldade dos dois lados', () => {
    const r = conferirEquivalencia(LIVRETO, prova([questao('p1', ['notacao'], 'avancada')]));
    expect(r.dificuldadeLivreto.basica).toBe(3);
    expect(r.dificuldadeLivreto.intermediaria).toBe(1);
    expect(r.dificuldadeProva.avancada).toBe(1);
  });
});

describe('Validação editorial', () => {
  it('exige explicação — questão sem ela ensina a acertar, não o assunto', () => {
    const p = validarQuestao({ ...questao('x', ['t']), explicacao: '' });
    expect(p.some((i) => i.gravidade === 'erro' && /explicação/i.test(i.mensagem))).toBe(true);
  });

  it('acusa resposta que não está entre as alternativas', () => {
    const p = validarQuestao({ ...questao('x', ['t']), resposta: 'z' });
    expect(p.some((i) => /não corresponde/i.test(i.mensagem))).toBe(true);
  });

  it('acusa alternativas repetidas e em branco', () => {
    const repetida = validarQuestao({
      ...questao('x', ['t']),
      alternativas: [
        { id: 'a', texto: 'Mesma' },
        { id: 'b', texto: 'mesma' },
        { id: 'c', texto: 'Outra' },
      ],
    });
    expect(repetida.some((i) => /repetidas/i.test(i.mensagem))).toBe(true);

    const branco = validarQuestao({
      ...questao('x', ['t']),
      alternativas: [
        { id: 'a', texto: 'Uma' },
        { id: 'b', texto: '  ' },
        { id: 'c', texto: 'Outra' },
      ],
      resposta: 'a',
    });
    expect(branco.some((i) => /branco/i.test(i.mensagem))).toBe(true);
  });

  it('avisa quando os capítulos estão desequilibrados', () => {
    // Um capítulo com o triplo do outro faz o curso parecer perder o fôlego.
    const desigual: Livreto = {
      ...LIVRETO,
      capitulos: [
        { ...LIVRETO.capitulos[0], questoes: [questao('a1', ['x'])] },
        {
          ...LIVRETO.capitulos[1],
          questoes: Array.from({ length: 9 }, (_, i) => questao(`b${i}`, ['y'])),
        },
      ],
    };
    expect(validarLivreto(desigual).some((p) => /desequilibrados/i.test(p.mensagem))).toBe(true);
  });

  it('acusa identificador de questão repetido', () => {
    const duplicado: Livreto = {
      ...LIVRETO,
      capitulos: [
        { ...LIVRETO.capitulos[0], questoes: [questao('mesma', ['x'])] },
        { ...LIVRETO.capitulos[1], questoes: [questao('mesma', ['y'])] },
      ],
    };
    expect(validarLivreto(duplicado).some((p) => /repetido/i.test(p.mensagem))).toBe(true);
  });

  it('o livreto de exemplo é válido', () => {
    expect(validarLivreto(LIVRETO).filter((p) => p.gravidade === 'erro')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------

const TEXTO =
  'A escala maior tem sete graus. O primeiro grau chama-se tônica. ' +
  'A tônica é o centro de repouso da tonalidade, e para ela tudo converge.';

function marcacao(id: string, inicio: number, fim: number): Anotacao {
  return {
    id,
    userId: 'u1',
    cursoId: 'c1',
    licaoId: 'l1',
    tipo: 'MARCA_TEXTO',
    ancora: criarAncora(TEXTO, inicio, fim),
    cor: 'amarelo',
    criadaEm: '2026-01-01T00:00:00.000Z',
    atualizadaEm: '2026-01-01T00:00:00.000Z',
  };
}

describe('Anotações — a âncora é o texto, não a posição', () => {
  it('encontra o trecho onde ele estava', () => {
    const a = criarAncora(TEXTO, 2, 14);
    expect(a.texto).toBe('escala maior');
    expect(resolverAncora(a, TEXTO)).toMatchObject({ situacao: 'firme', inicio: 2 });
  });

  it('reencontra o trecho depois de o texto acima mudar de tamanho', () => {
    // O caso real: alguém corrige uma vírgula na lição. Com âncora só por
    // posição, TODAS as marcações posteriores escorregariam e o aluno abriria
    // o caderno com grifos no meio de palavras.
    const a = criarAncora(TEXTO, TEXTO.indexOf('tônica'), TEXTO.indexOf('tônica') + 6);
    const editado = 'Uma observação inicial. ' + TEXTO;
    const r = resolverAncora(a, editado);
    expect(r.situacao).toBe('deslocada');
    expect(editado.slice(r.inicio, r.fim)).toBe('tônica');
  });

  it('desempata trechos repetidos pelo contexto em volta', () => {
    const segunda = TEXTO.indexOf('tônica', TEXTO.indexOf('tônica') + 1);
    const a = criarAncora(TEXTO, segunda, segunda + 6);
    const r = resolverAncora(a, TEXTO);
    expect(r.inicio).toBe(segunda);
  });

  it('marca como órfã quando o trecho some de verdade', () => {
    const a = criarAncora(TEXTO, 2, 14);
    expect(resolverAncora(a, 'Texto completamente diferente.').situacao).toBe('orfa');
  });

  it('a anotação órfã preserva o que o aluno escreveu', () => {
    // Ele perde a posição, nunca o conteúdo.
    const a = criarAncora(TEXTO, 2, 14);
    expect(a.texto).toBe('escala maior');
    resolverAncora(a, 'outro conteúdo');
    expect(a.texto).toBe('escala maior');
  });
});

describe('Segmentação para renderização', () => {
  it('sem marcações, devolve o texto inteiro num segmento', () => {
    const s = segmentar(TEXTO, []);
    expect(s).toHaveLength(1);
    expect(s[0].texto).toBe(TEXTO);
  });

  it('recompõe exatamente o texto original', () => {
    const s = segmentar(TEXTO, [marcacao('m1', 2, 14), marcacao('m2', 30, 45)]);
    expect(s.map((x) => x.texto).join('')).toBe(TEXTO);
  });

  it('marcações sobrepostas convivem no mesmo segmento', () => {
    // O aluno grifa a frase e depois comenta três palavras dela. Renderizar
    // como exclusivo faria a de cima apagar a de baixo.
    const s = segmentar(TEXTO, [marcacao('frase', 0, 30), marcacao('trecho', 10, 20)]);
    expect(s.some((seg) => seg.anotacoes.length === 2)).toBe(true);
    expect(s.map((x) => x.texto).join('')).toBe(TEXTO);
  });

  it('marcação órfã não quebra a segmentação', () => {
    const orfa = marcacao('o1', 2, 14);
    const s = segmentar('Conteúdo totalmente novo.', [orfa]);
    expect(s.map((x) => x.texto).join('')).toBe('Conteúdo totalmente novo.');
  });
});

describe('Caderno do curso', () => {
  const anotacoes: Anotacao[] = [
    { ...marcacao('a', 60, 66), tipo: 'COMENTARIO', comentario: 'Rever isto.' },
    marcacao('b', 2, 14),
    {
      ...marcacao('c', 0, 0),
      tipo: 'MARCADOR',
      ancora: undefined,
    },
  ];

  it('ordena pela posição no texto, não pela data', () => {
    // A ordem em que ele leu é a ordem do raciocínio que estava construindo;
    // ordenar por data poria o último grifo no topo e quebraria isso.
    const caderno = montarCaderno(anotacoes, { l1: TEXTO });
    const comTrecho = caderno.filter((e) => e.anotacao.ancora);
    expect(comTrecho[0].anotacao.id).toBe('b');
    expect(comTrecho[1].anotacao.id).toBe('a');
  });

  it('resume o caderno por tipo', () => {
    const r = resumirCaderno(montarCaderno(anotacoes, { l1: TEXTO }));
    expect(r.marcacoes).toBe(1);
    expect(r.comentarios).toBe(1);
    expect(r.marcadores).toBe(1);
    expect(r.licoesComAnotacao).toBe(1);
  });

  it('conta as órfãs separadamente', () => {
    const r = resumirCaderno(montarCaderno(anotacoes, { l1: 'Conteúdo trocado.' }));
    expect(r.orfas).toBe(2);
  });
});

// ---------------------------------------------------------------------------

import { LIVRETO_TEORIA } from '../src/data/seed-booklet-theory';
import { CURSO_TEORIA, MODULOS_TEORIA, LICOES_TEORIA, CAPITULOS_TEORIA } from '../src/data/seed-theory-course';

describe('Curso de Teoria — integridade do conteúdo', () => {
  // O curso cobre o escopo inteiro da teoria elementar, nao um recorte dele.
  // Quando eram dezesseis capitulos, ficavam de fora transporte, modulacao,
  // modos liturgicos, instrumentos transpositores e acordes de nona.
  it('cinquenta e oito capítulos, e um módulo e uma lição para cada', () => {
    expect(CAPITULOS_TEORIA).toHaveLength(58);
    expect(MODULOS_TEORIA).toHaveLength(58);
    expect(LICOES_TEORIA).toHaveLength(58);
    expect(CURSO_TEORIA.moduleIds).toHaveLength(58);
  });

  it('cada módulo declarado no curso existe de fato', () => {
    const ids = new Set(MODULOS_TEORIA.map((m) => m.id));
    for (const id of CURSO_TEORIA.moduleIds) {
      expect(ids.has(id), `módulo ${id} declarado e ausente`).toBe(true);
    }
  });

  it('cada lição aponta para um módulo existente, e vice-versa', () => {
    const modulos = new Set(MODULOS_TEORIA.map((m) => m.id));
    for (const l of LICOES_TEORIA) {
      expect(modulos.has(l.moduleId), `lição ${l.id} aponta para módulo inexistente`).toBe(true);
      expect(l.courseId).toBe(CURSO_TEORIA.id);
    }
    for (const m of MODULOS_TEORIA) {
      for (const licaoId of m.lessonIds) {
        expect(LICOES_TEORIA.some((l) => l.id === licaoId), `módulo ${m.id} cita lição inexistente`).toBe(true);
      }
    }
  });

  it('nenhuma lição está vazia — todas têm blocos interativos', () => {
    // Uma lição sem blocos é um título sem aula. O curso tem doze capítulos;
    // todos os doze precisam ter conteúdo, não só os primeiros.
    for (const l of LICOES_TEORIA) {
      const blocos = l.variants.TRADITIONAL.sections[0]?.blocks ?? [];
      expect(blocos.length, `${l.id} não tem blocos`).toBeGreaterThan(0);
    }
  });

  it('toda lição termina com uma verificação', () => {
    for (const l of LICOES_TEORIA) {
      const blocos = l.variants.TRADITIONAL.sections[0]?.blocks ?? [];
      expect(
        blocos.some((b) => b.kind === 'CHECKPOINT'),
        `${l.id} não tem checkpoint`
      ).toBe(true);
    }
  });

  it('a maioria das lições traz laboratório ou exemplo sonoro', () => {
    // Ler sobre uma terça e ouvir uma terça são coisas diferentes.
    const comSom = LICOES_TEORIA.filter((l) => {
      const blocos = l.variants.TRADITIONAL.sections[0]?.blocks ?? [];
      return blocos.some((b) =>
        ['AUDIO_EXAMPLE', 'INTERVAL_LAB', 'CHORD_LAB', 'SCALE_LAB', 'KEYBOARD', 'STAFF'].includes(b.kind)
      );
    });
    expect(comSom.length).toBeGreaterThanOrEqual(10);
  });
});

describe('Livreto de Teoria', () => {
  it('não tem erro estrutural', () => {
    const erros = validarLivreto(LIVRETO_TEORIA).filter((p) => p.gravidade === 'erro');
    expect(erros, erros.map((e) => e.mensagem).join(' | ')).toEqual([]);
  });

  it('cobre os dezesseis capítulos com quantidade equilibrada', () => {
    // A quantidade por capítulo não é arbitrária: sai da síntese. Um capítulo
    // com mais blocos nucleares rende mais questões — e é assim que deve ser.
    expect(LIVRETO_TEORIA.capitulos).toHaveLength(16);
    for (const c of LIVRETO_TEORIA.capitulos) {
      expect(c.questoes.length, `capítulo ${c.numero}`).toBeGreaterThanOrEqual(6);
      expect(c.questoes.length, `capítulo ${c.numero}`).toBeLessThanOrEqual(8);
    }
    expect(totalDeQuestoes(LIVRETO_TEORIA)).toBe(102);
  });

  it('cada capítulo do livreto aponta para a lição correspondente', () => {
    const licoes = new Set(LICOES_TEORIA.map((l) => l.id));
    for (const c of LIVRETO_TEORIA.capitulos) {
      expect(c.licaoId && licoes.has(c.licaoId), `capítulo ${c.numero} sem lição`).toBe(true);
    }
  });

  it('toda questão tem explicação de verdade', () => {
    // Questão sem explicação ensina a acertar, não o assunto.
    for (const c of LIVRETO_TEORIA.capitulos) {
      for (const q of c.questoes) {
        expect(q.explicacao.length, `${q.id}`).toBeGreaterThan(40);
      }
    }
  });

  it('as competências do livreto são as que o curso declara ensinar', () => {
    const doCurso = new Set([...CURSO_TEORIA.competencies, 'fundamentos']);
    for (const c of LIVRETO_TEORIA.capitulos) {
      for (const q of c.questoes) {
        for (const comp of q.competencias) {
          expect(doCurso.has(comp), `${q.id} cobra "${comp}", que o curso não declara`).toBe(true);
        }
      }
    }
  });

  it('o simulado reúne todas as questões na ordem dos capítulos', () => {
    const s = montarSimulado(LIVRETO_TEORIA);
    expect(s.questaoIds).toHaveLength(102);
    expect(s.questaoIds[0]).toBe('tq_01_1');
    expect(s.questaoIds[s.questaoIds.length - 1]).toBe('tq_16_6');
  });

  it('há progressão de dificuldade — não é tudo básico', () => {
    const todas = LIVRETO_TEORIA.capitulos.flatMap((c) => c.questoes);
    const porNivel = {
      basica: todas.filter((q) => q.dificuldade === 'basica').length,
      intermediaria: todas.filter((q) => q.dificuldade === 'intermediaria').length,
      avancada: todas.filter((q) => q.dificuldade === 'avancada').length,
    };
    expect(porNivel.basica).toBeGreaterThan(0);
    expect(porNivel.intermediaria).toBeGreaterThan(0);
    expect(porNivel.avancada).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------

import { SINTESE_TEORIA } from '../src/data/seed-synthesis-theory';
import {
  conferirCobertura,
  prescrever,
  validarSintese,
  totalDeBlocos,
  QUESTOES_POR_PESO,
} from '../src/domain/synthesis';

describe('Síntese como base de extração de questões', () => {
  const questoesDoLivreto = LIVRETO_TEORIA.capitulos.flatMap((c) => c.questoes);

  it('a síntese cobre os dezesseis capítulos', () => {
    expect(SINTESE_TEORIA.capitulos).toHaveLength(16);
    expect(totalDeBlocos(SINTESE_TEORIA)).toBeGreaterThanOrEqual(48);
  });

  it('a síntese não tem erro estrutural', () => {
    const erros = validarSintese(SINTESE_TEORIA).filter((p) => p.gravidade === 'erro');
    expect(erros, erros.map((e) => e.mensagem).join(' | ')).toEqual([]);
  });

  it('cada bloco é UMA afirmação — não um resumo', () => {
    // Se não cabe numa frase, são dois blocos. É essa granularidade que
    // permite extrair questão; um resumo não tem onde pegar.
    for (const c of SINTESE_TEORIA.capitulos) {
      for (const b of c.blocos) {
        const frases = b.nucleo.split(/(?<=[.!?])\s+/).filter((f) => f.trim());
        expect(frases.length, `${b.id}: "${b.nucleo}"`).toBe(1);
      }
    }
  });

  it('todo bloco lista as confusões reais que viram distratores', () => {
    // Alternativa errada inventada é fácil de descartar e não ensina nada.
    for (const c of SINTESE_TEORIA.capitulos) {
      for (const b of c.blocos) {
        expect(b.confusoesComuns.length, `${b.id}`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('todo capítulo tem ao menos um bloco nuclear', () => {
    for (const c of SINTESE_TEORIA.capitulos) {
      expect(
        c.blocos.some((b) => b.peso === 'NUCLEAR'),
        `capítulo ${c.numero} sem bloco nuclear`
      ).toBe(true);
    }
  });

  it('A COBERTURA É COMPLETA: nenhum bloco sem questão, nenhuma questão órfã', () => {
    // Este é o teste que a metodologia existe para permitir. Antes dele, a
    // cobertura era julgamento; agora é contagem.
    const r = conferirCobertura(SINTESE_TEORIA, questoesDoLivreto);

    expect(
      r.lacunas,
      r.lacunas.map((l) => `${l.blocoId}: ${l.encontradas}/${l.esperadas} — ${l.nucleo}`).join('\n')
    ).toEqual([]);

    expect(r.questoesOrfas, `questões sem bloco de origem: ${r.questoesOrfas.join(', ')}`).toEqual([]);
    expect(r.completa).toBe(true);
    expect(r.blocosCobertos).toBe(r.totalDeBlocos);
  });

  it('as questões correspondem exatamente ao previsto pelos pesos dos blocos', () => {
    const previstas = SINTESE_TEORIA.capitulos
      .flatMap((c) => c.blocos)
      .reduce((a, b) => a + QUESTOES_POR_PESO[b.peso], 0);
    expect(previstas).toBe(102);
    expect(questoesDoLivreto).toHaveLength(102);
  });

  it('com a cobertura completa, não há nada a prescrever', () => {
    expect(prescrever(SINTESE_TEORIA, questoesDoLivreto)).toEqual([]);
  });

  it('remover uma questão faz a lacuna aparecer na hora', () => {
    // A prova de que o mecanismo funciona: tire uma questão e o relatório
    // aponta exatamente qual bloco ficou descoberto.
    const faltando = questoesDoLivreto.filter((q) => q.id !== 'tq_05_3');
    const r = conferirCobertura(SINTESE_TEORIA, faltando);
    expect(r.completa).toBe(false);
    expect(r.lacunas.some((l) => l.blocoId === 's05_3')).toBe(true);

    const p = prescrever(SINTESE_TEORIA, faltando);
    expect(p[0].blocoId).toBe('s05_3');
    expect(p[0].competencia).toBe('intervalos');
    expect(p[0].distratoresSugeridos.length).toBeGreaterThan(0);
  });

  it('o tipo de questão prescrito decorre da natureza do bloco', () => {
    const semNada = conferirCobertura(SINTESE_TEORIA, []);
    expect(semNada.completa).toBe(false);

    const todas = prescrever(SINTESE_TEORIA, []);
    const regra = todas.find((p) => p.blocoId === 's03_1');
    const distincao = todas.find((p) => p.blocoId === 's05_2');
    const procedimento = todas.find((p) => p.blocoId === 's05_1');

    expect(regra?.tipoSugerido).toBe('VERDADEIRO_FALSO');
    expect(distincao?.tipoSugerido).toBe('MULTIPLA_ESCOLHA');
    expect(procedimento?.tipoSugerido).toBe('IDENTIFICACAO');
    expect(procedimento?.dificuldadeSugerida).toBe('avancada');
  });
});
