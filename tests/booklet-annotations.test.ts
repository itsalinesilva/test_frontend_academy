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
