import { EntityId } from './types';
import { Questao, TipoQuestao, DificuldadeQuestao } from './booklet';

/**
 * Síntese de capítulo — a base de extração de questões.
 *
 * O PROBLEMA QUE ISTO RESOLVE
 * ---------------------------
 * Escrever questões lendo o capítulo inteiro produz cobertura irregular: o
 * que estava fresco na memória vira três questões e o que estava no meio não
 * vira nenhuma. Ninguém percebe, porque não há como perceber — não existe
 * lista do que deveria ter sido cobrado.
 *
 * A síntese resolve isso invertendo a ordem. Primeiro decompõe-se o capítulo
 * em BLOCOS FUNDAMENTAIS: cada afirmação que o aluno precisa levar consigo,
 * uma por vez, em uma frase. Depois, cada bloco gera questão.
 *
 * A cobertura deixa de ser julgamento e vira contagem: todo bloco sem questão
 * é uma lacuna visível, e o teste acusa.
 *
 * O QUE UM BLOCO É, E O QUE NÃO É
 * -------------------------------
 * Um bloco é uma afirmação verificável que sustenta o capítulo. Não é um
 * parágrafo resumido nem um tópico: é o NÚCLEO — aquilo que, se o aluno não
 * souber, não entendeu o capítulo.
 *
 * "A escala maior tem o padrão T–T–st–T–T–T–st" é um bloco.
 * "Escalas são importantes na música" não é: não se verifica.
 */

export type NaturezaDoBloco =
  /** O que uma coisa é. */
  | 'DEFINICAO'
  /** O que sempre vale, e em que condição. */
  | 'REGRA'
  /** O que separa duas coisas que se confundem. */
  | 'DISTINCAO'
  /** Como se faz, passo a passo. */
  | 'PROCEDIMENTO'
  /** Por que é assim, e não de outro jeito. */
  | 'CAUSA'
  /** Quando, onde, quem. */
  | 'FATO'
  /** Que categorias existem e o que as separa. */
  | 'CLASSIFICACAO';

/**
 * Tipo de questão que cada natureza pede.
 *
 * Não é convenção arbitrária: decorre do que se quer verificar. Uma DISTINÇÃO
 * só se testa oferecendo as duas coisas lado a lado — múltipla escolha. Uma
 * REGRA se testa melhor afirmando algo e pedindo julgamento, porque é assim
 * que ela aparece na prática. Um PROCEDIMENTO exige aplicar, não reconhecer.
 */
export const TIPO_POR_NATUREZA: Record<NaturezaDoBloco, TipoQuestao> = {
  DEFINICAO: 'MULTIPLA_ESCOLHA',
  REGRA: 'VERDADEIRO_FALSO',
  DISTINCAO: 'MULTIPLA_ESCOLHA',
  PROCEDIMENTO: 'IDENTIFICACAO',
  CAUSA: 'MULTIPLA_ESCOLHA',
  FATO: 'MULTIPLA_ESCOLHA',
  CLASSIFICACAO: 'IDENTIFICACAO',
};

export type PesoDoBloco =
  /** Sustenta o capítulo. Rende duas questões. */
  | 'NUCLEAR'
  /** Necessário, mas derivado. Rende uma. */
  | 'APOIO';

export const QUESTOES_POR_PESO: Record<PesoDoBloco, number> = {
  NUCLEAR: 2,
  APOIO: 1,
};

export interface BlocoDeSintese {
  id: EntityId;
  capituloId: EntityId;
  ordem: number;
  /**
   * A afirmação nuclear, em uma frase.
   *
   * Uma frase, e não um parágrafo: se não cabe numa frase, são dois blocos.
   * Essa disciplina é o que impede a síntese de virar um resumo — e resumo
   * não serve para extrair questão, porque não tem granularidade.
   */
  nucleo: string;
  nature: NaturezaDoBloco;
  peso: PesoDoBloco;
  /**
   * Os enganos reais sobre este ponto.
   *
   * Viram os distratores. Uma alternativa errada inventada é fácil de
   * descartar e não ensina nada; uma alternativa que é o engano que a pessoa
   * de fato comete faz a questão valer a pena.
   */
  confusoesComuns: string[];
  competencia: string;
  /** Questões que nasceram deste bloco. */
  questaoIds: EntityId[];
}

export interface SinteseDeCapitulo {
  capituloId: EntityId;
  numero: number;
  titulo: string;
  blocos: BlocoDeSintese[];
}

export interface SinteseDeCurso {
  cursoId: EntityId;
  titulo: string;
  capitulos: SinteseDeCapitulo[];
}

// ---------------------------------------------------------------------------
// Cobertura
// ---------------------------------------------------------------------------

export interface LacunaDeCobertura {
  capituloId: EntityId;
  blocoId: EntityId;
  nucleo: string;
  esperadas: number;
  encontradas: number;
}

export interface RelatorioDeCobertura {
  completa: boolean;
  totalDeBlocos: number;
  blocosCobertos: number;
  questoesEsperadas: number;
  questoesExistentes: number;
  lacunas: LacunaDeCobertura[];
  /** Questões que não nasceram de nenhum bloco — cobram o que não foi sintetizado. */
  questoesOrfas: EntityId[];
}

/**
 * Confere se as questões cobrem a síntese inteira.
 *
 * Dois lados, e os dois importam:
 *
 *  - **Lacuna**: bloco sem questão suficiente. O aluno estudou algo que não
 *    foi cobrado, e o curso não verificou se ele aprendeu.
 *  - **Órfã**: questão que não nasceu de nenhum bloco. Ela cobra algo que a
 *    síntese não previu — ou o bloco está faltando, ou a questão está fora
 *    do escopo. Nos dois casos, alguém precisa olhar.
 */
export function conferirCobertura(
  sintese: SinteseDeCurso,
  questoes: Questao[]
): RelatorioDeCobertura {
  const existentes = new Set(questoes.map((q) => q.id));
  const usadas = new Set<string>();
  const lacunas: LacunaDeCobertura[] = [];

  let totalDeBlocos = 0;
  let blocosCobertos = 0;
  let questoesEsperadas = 0;

  for (const capitulo of sintese.capitulos) {
    for (const bloco of capitulo.blocos) {
      totalDeBlocos += 1;
      const esperadas = QUESTOES_POR_PESO[bloco.peso];
      questoesEsperadas += esperadas;

      const presentes = bloco.questaoIds.filter((id) => existentes.has(id));
      presentes.forEach((id) => usadas.add(id));

      if (presentes.length >= esperadas) {
        blocosCobertos += 1;
      } else {
        lacunas.push({
          capituloId: capitulo.capituloId,
          blocoId: bloco.id,
          nucleo: bloco.nucleo,
          esperadas,
          encontradas: presentes.length,
        });
      }
    }
  }

  const questoesOrfas = questoes.filter((q) => !usadas.has(q.id)).map((q) => q.id);

  return {
    completa: lacunas.length === 0 && questoesOrfas.length === 0,
    totalDeBlocos,
    blocosCobertos,
    questoesEsperadas,
    questoesExistentes: questoes.length,
    lacunas,
    questoesOrfas,
  };
}

// ---------------------------------------------------------------------------
// Prescrição
// ---------------------------------------------------------------------------

export interface PrescricaoDeQuestao {
  blocoId: EntityId;
  capituloId: EntityId;
  nucleo: string;
  tipoSugerido: TipoQuestao;
  dificuldadeSugerida: DificuldadeQuestao;
  competencia: string;
  distratoresSugeridos: string[];
  /** Quantas ainda faltam para este bloco. */
  faltam: number;
}

/**
 * Diz exatamente o que ainda falta escrever, e de que tipo.
 *
 * É o que transforma "escreva questões sobre o capítulo 7" — instrução vaga,
 * que produz cobertura irregular — em uma lista de encomendas concretas.
 *
 * A dificuldade vem da natureza do bloco: reconhecer uma definição é básico;
 * aplicar um procedimento ou distinguir duas coisas parecidas é mais difícil,
 * porque exige ter entendido, e não apenas lido.
 */
export function prescrever(
  sintese: SinteseDeCurso,
  questoes: Questao[]
): PrescricaoDeQuestao[] {
  const existentes = new Set(questoes.map((q) => q.id));
  const prescricoes: PrescricaoDeQuestao[] = [];

  for (const capitulo of sintese.capitulos) {
    for (const bloco of capitulo.blocos) {
      const presentes = bloco.questaoIds.filter((id) => existentes.has(id)).length;
      const faltam = QUESTOES_POR_PESO[bloco.peso] - presentes;
      if (faltam <= 0) continue;

      const dificuldade: DificuldadeQuestao =
        bloco.nature === 'DEFINICAO' || bloco.nature === 'FATO'
          ? 'basica'
          : bloco.nature === 'PROCEDIMENTO' || bloco.nature === 'CAUSA'
            ? 'avancada'
            : 'intermediaria';

      prescricoes.push({
        blocoId: bloco.id,
        capituloId: capitulo.capituloId,
        nucleo: bloco.nucleo,
        tipoSugerido: TIPO_POR_NATUREZA[bloco.nature],
        dificuldadeSugerida: dificuldade,
        competencia: bloco.competencia,
        distratoresSugeridos: bloco.confusoesComuns,
        faltam,
      });
    }
  }

  return prescricoes;
}

// ---------------------------------------------------------------------------
// Validação da própria síntese
// ---------------------------------------------------------------------------

export interface ProblemaDeSintese {
  gravidade: 'erro' | 'aviso';
  mensagem: string;
  capituloId?: EntityId;
  blocoId?: EntityId;
}

/**
 * Confere a síntese antes de ela virar base de questões.
 *
 * Uma síntese ruim produz questões ruins em escala — e o defeito só aparece
 * lá na frente, quando já há dezenas de questões escritas em cima dela.
 */
export function validarSintese(sintese: SinteseDeCurso): ProblemaDeSintese[] {
  const problemas: ProblemaDeSintese[] = [];
  const ids = new Set<string>();

  for (const capitulo of sintese.capitulos) {
    if (capitulo.blocos.length === 0) {
      problemas.push({
        gravidade: 'erro',
        capituloId: capitulo.capituloId,
        mensagem: `Capítulo ${capitulo.numero} não tem blocos de síntese.`,
      });
      continue;
    }

    if (!capitulo.blocos.some((b) => b.peso === 'NUCLEAR')) {
      problemas.push({
        gravidade: 'aviso',
        capituloId: capitulo.capituloId,
        mensagem: `Capítulo ${capitulo.numero} não tem nenhum bloco nuclear — todo capítulo tem ao menos uma ideia que o sustenta.`,
      });
    }

    for (const bloco of capitulo.blocos) {
      if (ids.has(bloco.id)) {
        problemas.push({
          gravidade: 'erro',
          blocoId: bloco.id,
          mensagem: `Identificador de bloco repetido: ${bloco.id}.`,
        });
      }
      ids.add(bloco.id);

      // Uma frase. Se não cabe numa frase, são dois blocos — e a granularidade
      // é justamente o que permite extrair questão.
      const frases = bloco.nucleo.split(/(?<=[.!?])\s+/).filter((f) => f.trim().length > 0);
      if (frases.length > 1) {
        problemas.push({
          gravidade: 'aviso',
          blocoId: bloco.id,
          mensagem: `O bloco "${bloco.id}" tem mais de uma frase. Se são duas afirmações, são dois blocos.`,
        });
      }
      if (bloco.nucleo.trim().length < 20) {
        problemas.push({
          gravidade: 'erro',
          blocoId: bloco.id,
          mensagem: `O núcleo do bloco "${bloco.id}" é curto demais para ser verificável.`,
        });
      }
      if (bloco.confusoesComuns.length === 0) {
        problemas.push({
          gravidade: 'aviso',
          blocoId: bloco.id,
          mensagem: `O bloco "${bloco.id}" não lista confusões comuns — os distratores da questão terão de ser inventados.`,
        });
      }
    }
  }

  return problemas;
}

export function totalDeBlocos(sintese: SinteseDeCurso): number {
  return sintese.capitulos.reduce((a, c) => a + c.blocos.length, 0);
}
