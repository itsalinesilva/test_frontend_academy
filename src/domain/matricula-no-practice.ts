import { EntityId, ISOTimestamp } from './types';

/**
 * MATRÍCULA NUM PERCURSO DE PRÁTICA.
 *
 * A DECISÃO QUE ESTE ARQUIVO REGISTRA
 * -----------------------------------
 * As lições do Academy e as do Practice são **coisas diferentes**. Há vínculo,
 * e ele não é obrigatório:
 *
 *   *"As lições do curso são umas e as do Practice, outras — outras a mais.
 *   Tem vínculo sim, mas não obrigatório. Practice de história, practice de
 *   teoria, practice violino vão usar o material de base do Academy, mas não
 *   precisa ser restrito. O aluno pode não fazer o Academy e fazer o
 *   Practice; ele precisa apenas indicar isso no formulário de matrícula."*
 *
 * A consequência de projeto é direta: **o mesmo percurso tem lições
 * diferentes conforme o ponto de partida de quem entra.** Quem nunca viu o
 * assunto precisa do que o cursado já sabe; dar o mesmo material aos dois
 * perde os dois.
 *
 * POR QUE ISTO É DOMÍNIO, E NÃO UM CAMPO DE FORMULÁRIO
 * ---------------------------------------------------
 * Porque governa **qual lição aparece**. Se ficasse como uma preferência
 * solta no perfil, cada tela decidiria sozinha o que fazer com ela — e duas
 * telas discordariam sobre o que mostrar à mesma pessoa.
 */

/**
 * De onde a pessoa parte.
 *
 * A escala não é de habilidade genérica: é da **relação com o assunto neste
 * Conservatório**. "Cursei aqui" diz mais sobre o que a pessoa viu do que
 * "sou intermediário", porque o currículo é conhecido.
 */
export enum PontoDePartida {
  /** Nunca estudou o assunto. Precisa do vocabulário antes do exercício. */
  LEIGO = 'LEIGO',
  /** Estudou por conta própria, fora daqui. Sabe-se lá o quê, e em que ordem. */
  AUTODIDATA = 'AUTODIDATA',
  /** Está cursando o curso correspondente agora. */
  CURSANDO = 'CURSANDO',
  /** Concluiu o curso correspondente. */
  CURSADO = 'CURSADO',
  /** Formação anterior no assunto, fora do Conservatório. */
  FORMADO_FORA = 'FORMADO_FORA',
}

export const NOME_DO_PONTO_DE_PARTIDA: Record<PontoDePartida, string> = {
  [PontoDePartida.LEIGO]: 'Nunca estudei o assunto',
  [PontoDePartida.AUTODIDATA]: 'Estudei por conta própria',
  [PontoDePartida.CURSANDO]: 'Estou fazendo o curso aqui',
  [PontoDePartida.CURSADO]: 'Concluí o curso aqui',
  [PontoDePartida.FORMADO_FORA]: 'Tenho formação no assunto',
};

/** O que cada opção significa, para a pessoa escolher sem adivinhar. */
export const EXPLICACAO_DO_PONTO_DE_PARTIDA: Record<PontoDePartida, string> = {
  [PontoDePartida.LEIGO]:
    'O percurso começa pelo vocabulário: cada termo é apresentado antes de ser cobrado.',
  [PontoDePartida.AUTODIDATA]:
    'O percurso começa por uma sondagem, para achar o que você já sabe e o que ficou pelo caminho.',
  [PontoDePartida.CURSANDO]:
    'Os exercícios acompanham o capítulo em que você está no curso, e não se adiantam a ele.',
  [PontoDePartida.CURSADO]:
    'O percurso parte do que o curso cobriu e vai adiante — com o que o curso não alcança.',
  [PontoDePartida.FORMADO_FORA]:
    'O percurso começa por uma sondagem ampla e libera o material avançado desde o início.',
};

/**
 * Ritmo de desbloqueio.
 *
 * Vem da paridade com o Astra Trainer, e é pergunta diferente do ponto de
 * partida: aquela é *de onde parto*, esta é *como avanço*.
 */
export enum RitmoDoPercurso {
  /** Uma etapa por vez. A seguinte só abre quando a anterior fecha. */
  PASSO_A_PASSO = 'PASSO_A_PASSO',
  /** Tudo aberto desde o começo. */
  LIVRE = 'LIVRE',
}

export const NOME_DO_RITMO: Record<RitmoDoPercurso, string> = {
  [RitmoDoPercurso.PASSO_A_PASSO]: 'Passo a passo',
  [RitmoDoPercurso.LIVRE]: 'Livre',
};

export const EXPLICACAO_DO_RITMO: Record<RitmoDoPercurso, string> = {
  [RitmoDoPercurso.PASSO_A_PASSO]:
    'Cada etapa abre quando a anterior fecha, construindo base antes de avançar.',
  [RitmoDoPercurso.LIVRE]: 'Tudo disponível desde o começo, para explorar na ordem que quiser.',
};

export interface MatriculaNoPercurso {
  id: EntityId;
  userId: EntityId;
  /** O percurso de prática: teoria, história, violino. */
  percursoId: EntityId;
  pontoDePartida: PontoDePartida;
  ritmo: RitmoDoPercurso;
  /**
   * Curso do Academy correspondente, quando houver.
   *
   * **Opcional por projeto.** Quem faz o Practice de história sem fazer o
   * curso de história é um caso previsto, não uma exceção a tolerar.
   */
  cursoVinculadoId?: EntityId;
  matriculadaEm: ISOTimestamp;
  atualizadaEm: ISOTimestamp;
}

// ---------------------------------------------------------------------------
// O que o ponto de partida decide
// ---------------------------------------------------------------------------

/**
 * Faixa de material que a matrícula abre.
 *
 * Uma lição declara a que faixas serve. A mesma lição pode servir a mais de
 * uma — e boa parte serve —, mas as de vocabulário não interessam a quem
 * cursou, e as avançadas não alcançam quem nunca viu o assunto.
 */
export type FaixaDeMaterial = 'VOCABULARIO' | 'FUNDAMENTO' | 'APLICACAO' | 'AVANCADO';

export const FAIXAS_POR_PARTIDA: Record<PontoDePartida, FaixaDeMaterial[]> = {
  [PontoDePartida.LEIGO]: ['VOCABULARIO', 'FUNDAMENTO'],
  [PontoDePartida.AUTODIDATA]: ['VOCABULARIO', 'FUNDAMENTO', 'APLICACAO'],
  [PontoDePartida.CURSANDO]: ['FUNDAMENTO', 'APLICACAO'],
  [PontoDePartida.CURSADO]: ['APLICACAO', 'AVANCADO'],
  [PontoDePartida.FORMADO_FORA]: ['FUNDAMENTO', 'APLICACAO', 'AVANCADO'],
};

/** A matrícula alcança esta faixa de material? */
export function alcanca(matricula: MatriculaNoPercurso, faixa: FaixaDeMaterial): boolean {
  return FAIXAS_POR_PARTIDA[matricula.pontoDePartida].includes(faixa);
}

/**
 * A matrícula exige sondagem antes de começar?
 *
 * Quem estudou fora chega com lacunas que ninguém conhece — nem a plataforma,
 * nem, muitas vezes, a própria pessoa. Começar pelo capítulo um seria perder
 * quem já sabe; começar pelo fim seria perder quem não sabe. A sondagem
 * resolve, e só faz sentido para quem veio de fora.
 */
export function exigeSondagem(matricula: MatriculaNoPercurso): boolean {
  return (
    matricula.pontoDePartida === PontoDePartida.AUTODIDATA ||
    matricula.pontoDePartida === PontoDePartida.FORMADO_FORA
  );
}

/**
 * O percurso acompanha o curso, sem se adiantar a ele?
 *
 * Só para quem está cursando **agora**. Exercitar o capítulo 12 enquanto se
 * lê o 5 não é desafio: é cobrar o que ainda não foi ensinado.
 */
export function acompanhaOCurso(matricula: MatriculaNoPercurso): boolean {
  return (
    matricula.pontoDePartida === PontoDePartida.CURSANDO &&
    matricula.cursoVinculadoId !== undefined
  );
}

export function criarMatricula(dados: {
  userId: EntityId;
  percursoId: EntityId;
  pontoDePartida: PontoDePartida;
  ritmo: RitmoDoPercurso;
  cursoVinculadoId?: EntityId;
}): MatriculaNoPercurso {
  const agora = new Date().toISOString();
  return {
    id: `mat_${dados.percursoId}_${dados.userId}`,
    userId: dados.userId,
    percursoId: dados.percursoId,
    pontoDePartida: dados.pontoDePartida,
    ritmo: dados.ritmo,
    cursoVinculadoId: dados.cursoVinculadoId,
    matriculadaEm: agora,
    atualizadaEm: agora,
  };
}
