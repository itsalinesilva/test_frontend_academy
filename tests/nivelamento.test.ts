import { describe, it, expect } from 'vitest';
import {
  TENTATIVAS_POR_CAPITULO,
  cadeirasNivelaveis,
  diagnosticar,
  iniciarNivelamento,
  interromperNivelamento,
  moduloDoDiagnostico,
  progressoDoNivelamento,
  questaoAtual,
  responderNivelamento,
} from '../src/domain/nivelamento';
import { LIVRETOS_PADRAO } from '../src/data/seed-booklets';
import { CHAIRS, ChairId, chairOfCourse, coursesOfChair } from '../src/domain/chair';
import { academyService } from '../src/services/application/academy.service';
import { Livreto } from '../src/domain/booklet';

/**
 * O NIVELAMENTO DO VISITANTE.
 *
 * 🔴 A tela do visitante mostrava disciplinas soltas ao vento — uma lista de
 * tópicos sem curso, sem módulo e sem ordem. Quem chega não tem como escolher
 * entre eles: escolher pressupõe saber o que já se sabe.
 *
 * 🔴 E A PRIMEIRA VERSÃO DISTO ESTAVA MONTADA SOBRE O GERADOR
 * -----------------------------------------------------------
 * `exercise-generator.ts` produz enunciados com a resposta dentro — "Que nota
 * está uma si — qual destas é?" — e cobre só seis das vinte e uma dimensões,
 * todas de Teoria. Com ele, "escolher a cadeira" seria escolha de mentira: as
 * três levariam ao mesmo lugar.
 *
 * Agora as perguntas são as dos livretos: 378 escritas à mão, em 126
 * capítulos, com distratores que correspondem a enganos reais.
 */

const TEORIA = LIVRETOS_PADRAO.find((l) => l.cursoId === 'crs_teoria_fundamentos')!;

/** Responde acertando até `ateOndeAcerta` capítulos, e errando dali em diante. */
function percorrer(ateOndeAcerta: number, livreto: Livreto = TEORIA) {
  let e = iniciarNivelamento(livreto, ChairId.TEORIA, 7);
  let voltas = 0;

  while (!e.encerrado && voltas < 1000) {
    e = responderNivelamento(e, e.indice < ateOndeAcerta);
    voltas++;
  }

  return e;
}

describe('🔴 as trilhas saem dos LIVRETOS, e não de uma lista escrita à mão', () => {
  it('toda cadeira oferecida tem trilha com questões de verdade', () => {
    const cadeiras = cadeirasNivelaveis(LIVRETOS_PADRAO);

    expect(cadeiras.length, 'nenhuma cadeira nivelável').toBeGreaterThan(0);

    for (const { cadeira, trilhas } of cadeiras) {
      expect(trilhas.length, `${cadeira.name} apareceu sem trilha`).toBeGreaterThan(0);

      for (const t of trilhas) {
        expect(t.capitulos, `"${t.titulo}" sem capítulo`).toBeGreaterThan(0);
        expect(t.questoes, `"${t.titulo}" sem questão — seria um beco`).toBeGreaterThan(0);
        expect(t.cadeira, 'a trilha não declara a cadeira').toBe(cadeira.id);
      }
    }
  });

  it('🔴 há MAIS DE UMA cadeira — senão escolher seria escolha de mentira', () => {
    /**
     * É o caso que falha se alguém remontar o nivelamento sobre o gerador,
     * que só cobre Teoria. Um seletor com uma opção é um seletor decorativo.
     */
    expect(cadeirasNivelaveis(LIVRETOS_PADRAO).length).toBeGreaterThan(1);
  });

  it('toda trilha pertence à cadeira em que foi listada', () => {
    for (const { cadeira, trilhas } of cadeirasNivelaveis(LIVRETOS_PADRAO)) {
      for (const t of trilhas) {
        expect(
          chairOfCourse(t.cursoId),
          `"${t.titulo}" foi listado em ${cadeira.name}, mas não é dela`
        ).toBe(cadeira.id);
      }
    }
  });

  it('História aparece com as TRÊS trilhas, separadas', () => {
    /**
     * Os três cursos de História não são sequência um do outro. Nivelar
     * "História" como percurso único colocaria quem sabe música brasileira a
     * responder sobre a ocidental, e leria o erro como lacuna.
     */
    const historia = cadeirasNivelaveis(LIVRETOS_PADRAO).find(
      (c) => c.cadeira.id === ChairId.HISTORIA
    );

    expect(historia, 'História não aparece no seletor').toBeDefined();
    expect(historia!.trilhas.length).toBe(coursesOfChair(ChairId.HISTORIA).length);
  });

  it('curso sem livreto não é oferecido', () => {
    const semNenhum = cadeirasNivelaveis([]);
    expect(semNenhum, 'ofereceu nivelamento sem livreto nenhum').toEqual([]);
  });

  it('a contagem anunciada é a MEDIDA do livreto', () => {
    /** Número arredondado para impressionar é número inventado. */
    for (const { trilhas } of cadeirasNivelaveis(LIVRETOS_PADRAO)) {
      for (const t of trilhas) {
        const l = LIVRETOS_PADRAO.find((x) => x.cursoId === t.cursoId)!;
        expect(t.capitulos).toBe(l.capitulos.length);
        expect(t.questoes).toBe(l.capitulos.reduce((n, c) => n + c.questoes.length, 0));
      }
    }
  });
});

describe('🔴 a ordem é a do CURSO, capítulo a capítulo', () => {
  it('os passos saem em sequência crescente de capítulo', () => {
    /**
     * Sem ordem o erro não localiza nada: numa amostra embaralhada, errar a
     * décima e acertar a terceira não diz por onde começar.
     */
    for (const livreto of LIVRETOS_PADRAO) {
      const e = iniciarNivelamento(livreto, ChairId.TEORIA, 1);
      const numeros = e.passos.map((p) => p.capitulo);

      expect(
        [...numeros].sort((a, b) => a - b),
        `"${livreto.titulo}" saiu fora de ordem`
      ).toEqual(numeros);
    }
  });

  it('a ordem vem do NÚMERO declarado, e não da ordem do arquivo', () => {
    /**
     * Confiar na ordem de chegada funciona até alguém reordenar a origem — e
     * aí a "ordem do curso" vira a ordem do arquivo, sem que nada acuse.
     */
    const embaralhado: Livreto = {
      ...TEORIA,
      capitulos: [...TEORIA.capitulos].reverse(),
    };

    const e = iniciarNivelamento(embaralhado, ChairId.TEORIA, 1);
    expect(e.passos[0].capitulo).toBe(1);
    expect(e.passos[e.passos.length - 1].capitulo).toBe(TEORIA.capitulos.length);
  });

  it('todo passo carrega a lição do capítulo', () => {
    const e = iniciarNivelamento(TEORIA, ChairId.TEORIA, 1);
    expect(e.passos.every((p) => Boolean(p.lessonId)), 'há capítulo sem lição').toBe(true);
  });
});

describe('toda questão é respondível — nenhuma é beco sem saída', () => {
  it('cada capítulo entrega questão com alternativas, resposta e explicação', () => {
    let e = iniciarNivelamento(TEORIA, ChairId.TEORIA, 3);

    for (let i = 0; i < e.passos.length; i++) {
      const q = questaoAtual(e);

      expect(q, `o capítulo ${e.passos[i].capitulo} não entregou questão`).not.toBeNull();
      expect(q!.prompt.trim(), 'questão sem enunciado').not.toBe('');
      expect(q!.choices.length, 'questão sem alternativa').toBeGreaterThan(1);
      expect(
        q!.choices.some((c) => c.id === q!.resposta),
        'a resposta certa não está entre as alternativas'
      ).toBe(true);
      expect(q!.explanation.trim(), 'questão sem explicação — não ensina nada').not.toBe('');

      e = responderNivelamento(e, true);
    }
  });

  it('🔴 a confirmação é OUTRA questão do mesmo capítulo', () => {
    /** Repetir a mesma mediria memória do clique, e não conhecimento. */
    const inicio = iniciarNivelamento(TEORIA, ChairId.TEORIA, 5);
    const primeira = questaoAtual(inicio)!;
    const confirmacao = questaoAtual(responderNivelamento(inicio, false))!;

    expect(confirmacao.id, 'a confirmação repetiu a questão errada').not.toBe(primeira.id);

    /** E é do MESMO capítulo — senão não confirma nada. */
    const doCapitulo = inicio.passos[0].questoes.map((q) => q.id);
    expect(doCapitulo).toContain(confirmacao.id);
  });

  it('a mesma semente produz a mesma sequência', () => {
    expect(questaoAtual(iniciarNivelamento(TEORIA, ChairId.TEORIA, 11))!.id).toBe(
      questaoAtual(iniciarNivelamento(TEORIA, ChairId.TEORIA, 11))!.id
    );
  });

  it('sementes diferentes não engessam a mesma primeira questão', () => {
    const ids = new Set(
      [1, 2, 3, 4, 5, 6].map((s) => questaoAtual(iniciarNivelamento(TEORIA, ChairId.TEORIA, s))!.id)
    );
    expect(ids.size, 'a semente não muda nada — o sorteio é decorativo').toBeGreaterThan(1);
  });
});

describe('🔴 um erro só não encerra — a fronteira precisa de duas', () => {
  it('errar uma e acertar a confirmação CONTINUA, e o capítulo fica de pé', () => {
    /**
     * Encerrar no primeiro erro faria um deslize de um segundo determinar
     * meses de estudo, e a pessoa entraria abaixo do que sabe.
     */
    const inicio = iniciarNivelamento(TEORIA, ChairId.TEORIA, 2);
    const erro = responderNivelamento(inicio, false);

    expect(erro.encerrado, 'um erro encerrou o nivelamento').toBe(false);
    expect(erro.indice, 'o erro avançou de capítulo em vez de confirmar').toBe(inicio.indice);
    expect(erro.tentativa).toBe(1);

    const recuperado = responderNivelamento(erro, true);

    expect(recuperado.encerrado).toBe(false);
    expect(recuperado.indice).toBe(inicio.indice + 1);
    expect(recuperado.dominados).toContain(inicio.passos[0].capitulo);
    expect(recuperado.tentativa, 'a tentativa não voltou a zero').toBe(0);
  });

  it('errar as duas encerra, e a entrada é aquele capítulo', () => {
    const inicio = iniciarNivelamento(TEORIA, ChairId.TEORIA, 2);
    let e = inicio;
    for (let i = 0; i < TENTATIVAS_POR_CAPITULO; i++) e = responderNivelamento(e, false);

    expect(e.encerrado).toBe(true);
    expect(e.entrada?.capitulo).toBe(inicio.passos[0].capitulo);
    expect(e.dominados, 'o capítulo errado foi contado como dominado').toEqual([]);
  });

  it('a entrada é o PRIMEIRO que caiu, e não o último respondido', () => {
    const inicio = iniciarNivelamento(TEORIA, ChairId.TEORIA, 7);
    const fim = percorrer(3);

    expect(fim.entrada?.capitulo).toBe(inicio.passos[3].capitulo);
    expect(fim.dominados.length, 'os três anteriores não ficaram de pé').toBe(3);
  });

  it('acertar tudo encerra SEM entrada — e isso não é "nível máximo"', () => {
    const fim = percorrer(9999);

    expect(fim.encerrado).toBe(true);
    expect(fim.entrada, 'inventou entrada onde não houve erro').toBeNull();
    expect(fim.dominados.length).toBe(fim.passos.length);
  });

  it('responder depois do fim não muda nada', () => {
    const fim = percorrer(0);
    expect(responderNivelamento(fim, true)).toEqual(fim);
    expect(questaoAtual(fim), 'o nivelamento encerrado ainda entrega questão').toBeNull();
  });
});

describe('🔴 sair no meio NÃO é errar', () => {
  it('interromper encerra sem inventar ponto de entrada', () => {
    /**
     * Quem parou no capítulo 12 sem errar não tem entrada medida: tem um
     * piso. Dizer "você entra no 12" afirmaria o que o teste não apurou.
     */
    let e = iniciarNivelamento(TEORIA, ChairId.TEORIA, 4);
    for (let i = 0; i < 12; i++) e = responderNivelamento(e, true);

    const parado = interromperNivelamento(e);

    expect(parado.encerrado).toBe(true);
    expect(parado.interrompido).toBe(true);
    expect(parado.entrada, 'a saída virou ponto de entrada').toBeNull();
    expect(parado.dominados.length, 'os acertos foram descartados').toBe(12);
  });

  it('o diagnóstico de quem saiu fala em PISO, e não em entrada', () => {
    let e = iniciarNivelamento(TEORIA, ChairId.TEORIA, 4);
    for (let i = 0; i < 12; i++) e = responderNivelamento(e, true);

    const d = diagnosticar(interromperNivelamento(e));

    expect(d.interrompido).toBe(true);
    expect(d.capitulo, 'apontou capítulo de entrada para quem não errou').toBeNull();
    expect(d.frases.titulo).toMatch(/sem errar/i);
    expect(d.frases.detalhe, 'não explica que o limite não foi encontrado').toMatch(/piso/i);
  });

  it('quem sai sem responder nada recebe isso dito, e não um diagnóstico vazio', () => {
    const d = diagnosticar(interromperNivelamento(iniciarNivelamento(TEORIA, ChairId.TEORIA, 1)));

    expect(d.dominados).toBe(0);
    expect(d.frases.titulo).toMatch(/antes da primeira resposta/i);
    expect(d.frases.detalhe).toMatch(/nada foi medido/i);
  });

  it('interromper depois de encerrado não muda nada', () => {
    const fim = percorrer(2);
    expect(interromperNivelamento(fim)).toEqual(fim);
  });
});

describe('🔴 o diagnóstico aponta para um módulo que EXISTE', () => {
  it('o capítulo sugerido casa com um módulo real, do curso certo', async () => {
    /**
     * Um número de capítulo que não casa com módulo nenhum levaria a pessoa a
     * uma rota morta — o mesmo defeito do artigo que não abria.
     */
    const cursos = await academyService.getCourses();
    const modulos = (await Promise.all(cursos.map((c) => academyService.getModules(c.id)))).flat();

    for (const livreto of LIVRETOS_PADRAO) {
      for (const ate of [0, 1, 5]) {
        const e = percorrer(ate, livreto);
        const d = diagnosticar(e);
        if (d.capitulo === null) continue;

        const modulo = moduloDoDiagnostico(d, modulos);

        expect(modulo, `${livreto.titulo}: capítulo ${d.capitulo} sem módulo`).not.toBeNull();
        expect(modulo!.order).toBe(d.capitulo);
        expect(modulo!.courseId, 'casou com módulo de outro curso').toBe(livreto.cursoId);
      }
    }
  });

  it('🔴 o módulo casa pelo CURSO também, e não só pelo número', async () => {
    /**
     * Capítulo 3 existe em todos os cursos. Casar só pelo número entregaria o
     * capítulo 3 de Teoria a quem nivelou Violino.
     */
    const cursos = await academyService.getCourses();
    const modulos = (await Promise.all(cursos.map((c) => academyService.getModules(c.id)))).flat();

    const violino = LIVRETOS_PADRAO.find((l) => l.cursoId === 'crs_violino')!;
    const d = diagnosticar(percorrer(2, violino));
    const modulo = moduloDoDiagnostico(d, modulos);

    expect(modulo).not.toBeNull();
    expect(modulo!.courseId).toBe('crs_violino');
  });

  it('sem entrada não há módulo sugerido — e a frase não finge que há', async () => {
    const cursos = await academyService.getCourses();
    const modulos = (await Promise.all(cursos.map((c) => academyService.getModules(c.id)))).flat();

    const d = diagnosticar(percorrer(9999));

    expect(moduloDoDiagnostico(d, modulos)).toBeNull();
    expect(d.frases.titulo).toMatch(/ficaram de pé/i);
    expect(d.frases.detalhe, 'não diz que mede só esta trilha').toMatch(/trilha inteira|não mais/i);
  });

  it('as frases nomeiam o capítulo e o título, e nunca dizem "nível 0"', () => {
    const d = diagnosticar(percorrer(2));

    expect(d.frases.titulo).toContain(String(d.capitulo));
    expect(d.frases.titulo).toContain(d.titulo!);
    expect(d.frases.titulo).not.toMatch(/n[íi]vel 0/i);
  });
});

describe('a barra de progresso não mente', () => {
  it('começa em zero e termina em cem quando tudo foi respondido', () => {
    expect(progressoDoNivelamento(iniciarNivelamento(TEORIA, ChairId.TEORIA, 1)).percentual).toBe(0);
    expect(progressoDoNivelamento(percorrer(9999)).percentual).toBe(100);
  });

  it('a confirmação não faz a barra andar — é o mesmo capítulo', () => {
    const inicio = iniciarNivelamento(TEORIA, ChairId.TEORIA, 4);
    const erro = responderNivelamento(inicio, false);

    expect(progressoDoNivelamento(erro).respondidas).toBe(
      progressoDoNivelamento(inicio).respondidas
    );
  });

  it('nunca passa do total', () => {
    const p = progressoDoNivelamento(percorrer(9999));
    expect(p.respondidas).toBe(p.total);
    expect(p.percentual).toBeLessThanOrEqual(100);
  });

  it('o total é o número de capítulos da trilha escolhida, e não um fixo', () => {
    for (const l of LIVRETOS_PADRAO) {
      const e = iniciarNivelamento(l, ChairId.TEORIA, 1);
      expect(progressoDoNivelamento(e).total).toBe(l.capitulos.length);
    }
  });
});

describe('as cadeiras do seletor são as do Conservatório', () => {
  it('nenhuma cadeira inventada entra na lista', () => {
    const conhecidas = new Set(CHAIRS.map((c) => c.id));
    for (const { cadeira } of cadeirasNivelaveis(LIVRETOS_PADRAO)) {
      expect(conhecidas.has(cadeira.id), `cadeira desconhecida: ${cadeira.id}`).toBe(true);
      expect(cadeira.guildName.trim(), 'cadeira sem Grêmio nomeado').not.toBe('');
    }
  });
});
