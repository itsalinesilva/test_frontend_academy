import { AcademyCourse, AcademyLesson, AcademyModule } from './academy';
import { CHAIRS, Chair, ChairId, chairOfCourse } from './chair';

/**
 * A ÁRVORE DE LIÇÕES — Cadeira → Curso → Módulo → Lição, em ordem.
 *
 * 🔴 O QUE ISTO CORRIGE
 * ---------------------
 * O Laboratório listava **árvores de competência soltas** — teoria, percepção,
 * ritmo, leitura — sem curso, sem módulo e sem ordem. Eram tópicos ao vento:
 * quem abria não sabia o que vinha antes, o que vinha depois, nem a que curso
 * aquilo pertencia.
 *
 * A estrutura acadêmica já existia inteira e ordenada. O Laboratório é que a
 * ignorava e inventava a própria organização — e duas organizações sobre o
 * mesmo conteúdo é pior que nenhuma: a pessoa estuda por uma e é avaliada pela
 * outra.
 *
 * A ORDEM É SUGESTÃO, E NÃO CADEADO
 * ---------------------------------
 * Quem quiser começar pela disciplina 20 da seção 10 **pode**. O sistema não
 * bloqueia, e não deveria: adulto escolhe por onde entra.
 *
 * O que ele faz é **dizer onde aquilo fica**. Quem pula não terá seguido a
 * ordem apresentada, não terá fechado as seções anteriores, e a tela mostra
 * isso — sem impedir e sem julgar. Completude não é obrigatória; o que é
 * obrigatório é o sistema estar pronto e a sugestão estar certa.
 */

export interface LicaoNaArvore {
  id: string;
  titulo: string;
  /** Posição dentro do módulo, a partir de 1. */
  ordem: number;
}

export interface ModuloNaArvore {
  id: string;
  titulo: string;
  /** Posição dentro do curso, a partir de 1. */
  ordem: number;
  licoes: LicaoNaArvore[];
}

export interface CursoNaArvore {
  id: string;
  titulo: string;
  modulos: ModuloNaArvore[];
  /** Quantas lições o curso tem no total, somando os módulos. */
  totalDeLicoes: number;
}

export interface CadeiraNaArvore {
  cadeira: Chair;
  cursos: CursoNaArvore[];
  /**
   * A pessoa pertence ao Grêmio desta cadeira?
   *
   * Decide o que aparece aberto e o que aparece com o motivo escrito. Para
   * visitante é sempre `false`, e a tela diz o que falta em vez de esconder.
   */
  pertence: boolean;
}

/**
 * Monta a árvore inteira, ordenada em todos os níveis.
 *
 * 🔴 A ordenação é explícita em cada nível, e não herdada da ordem em que os
 * dados chegaram. Confiar na ordem de chegada funciona até alguém trocar a
 * origem — e aí a "ordem cronológica" vira a ordem do arquivo, sem que nada
 * acuse.
 */
export function montarArvoreDeLicoes(entrada: {
  cursos: AcademyCourse[];
  modulos: AcademyModule[];
  licoes: AcademyLesson[];
  cadeirasDoAluno: ChairId[];
}): CadeiraNaArvore[] {
  const licoesPorModulo = new Map<string, AcademyLesson[]>();
  for (const l of entrada.licoes) {
    const atual = licoesPorModulo.get(l.moduleId) ?? [];
    atual.push(l);
    licoesPorModulo.set(l.moduleId, atual);
  }

  const modulosPorCurso = new Map<string, AcademyModule[]>();
  for (const m of entrada.modulos) {
    const atual = modulosPorCurso.get(m.courseId) ?? [];
    atual.push(m);
    modulosPorCurso.set(m.courseId, atual);
  }

  const daCadeira = new Set(entrada.cadeirasDoAluno);

  return CHAIRS.map((cadeira) => {
    const cursos = entrada.cursos
      .filter((c) => chairOfCourse(c.id) === cadeira.id)
      .map((c) => {
        const modulos = (modulosPorCurso.get(c.id) ?? [])
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((m, i) => ({
            id: m.id,
            titulo: m.title,
            /**
             * A ordem exibida é a POSIÇÃO na sequência, e não o campo cru.
             *
             * Os campos podem ter buracos — um módulo removido deixa 1, 2, 4 —
             * e mostrar isso faria quem lê procurar o terceiro, que não existe.
             * A sequência é recontada; o campo continua sendo quem ordena.
             */
            ordem: i + 1,
            licoes: (licoesPorModulo.get(m.id) ?? [])
              .slice()
              .sort((a, b) => a.order - b.order)
              /**
               * O título vem da VARIANTE adulta.
               *
               * `AcademyLesson` não tem título próprio: ele vive em
               * `variants`, uma por público, porque a mesma lição se apresenta
               * diferente para adulto e para criança. A árvore é do Laboratório
               * adulto, e usa `TRADITIONAL`; o identificador canônico é o mesmo
               * nas duas, e serve de saída quando a variante falta.
               */
              .map((l, j) => ({
                id: l.id,
                titulo: l.variants?.TRADITIONAL?.title ?? l.canonicalContentId,
                ordem: j + 1,
              })),
          }));

        return {
          id: c.id,
          titulo: c.title,
          modulos,
          totalDeLicoes: modulos.reduce((n, m) => n + m.licoes.length, 0),
        };
      })
      .filter((c) => c.totalDeLicoes > 0);

    return { cadeira, cursos, pertence: daCadeira.has(cadeira.id) };
  }).filter((c) => c.cursos.length > 0);
}

/**
 * A próxima lição sugerida dentro de um curso, dado o que já foi concluído.
 *
 * É a primeira, na ordem, que ainda não foi feita. Não é a mais fácil nem a
 * mais curta: é **a próxima**, porque a sequência é o conteúdo.
 */
export function proximaSugerida(
  curso: CursoNaArvore,
  concluidas: Set<string>
): { modulo: ModuloNaArvore; licao: LicaoNaArvore } | null {
  for (const m of curso.modulos) {
    for (const l of m.licoes) {
      if (!concluidas.has(l.id)) return { modulo: m, licao: l };
    }
  }
  return null;
}

/**
 * 🔴 QUEM PULOU A ORDEM — e a tela precisa poder dizer isso sem impedir.
 *
 * Devolve as lições concluídas que têm **pendência anterior**: alguém fez a
 * décima sem ter feito a terceira.
 *
 * Não é erro, e não gera bloqueio. É informação: quem pulou não fechou as
 * seções anteriores, e vai encontrar pressupostos que não estudou. Dizer isso
 * é diferente de proibir.
 */
export function feitasForaDeOrdem(curso: CursoNaArvore, concluidas: Set<string>): LicaoNaArvore[] {
  const emOrdem = curso.modulos.flatMap((m) => m.licoes);
  const fora: LicaoNaArvore[] = [];
  let viuPendente = false;

  for (const l of emOrdem) {
    if (!concluidas.has(l.id)) {
      viuPendente = true;
      continue;
    }
    if (viuPendente) fora.push(l);
  }

  return fora;
}

/** Quantas lições de um curso foram concluídas, e quantas há. */
export function progressoNoCurso(
  curso: CursoNaArvore,
  concluidas: Set<string>
): { feitas: number; total: number; secoesFechadas: number } {
  const todas = curso.modulos.flatMap((m) => m.licoes);

  return {
    feitas: todas.filter((l) => concluidas.has(l.id)).length,
    total: todas.length,
    /**
     * Seção fechada é módulo com **todas** as lições feitas. É a unidade que
     * a ordem protege: pular deixa seções abertas, e é isso que se conta.
     */
    secoesFechadas: curso.modulos.filter(
      (m) => m.licoes.length > 0 && m.licoes.every((l) => concluidas.has(l.id))
    ).length,
  };
}
