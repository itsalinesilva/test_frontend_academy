/**
 * O contrato dos verificadores, para quem os importa de TypeScript.
 *
 * Eles vivem em `.mjs` porque rodam fora do bundle — `node scripts/qa.mjs`,
 * sem passo de compilação, o que os torna utilizáveis em qualquer máquina e em
 * qualquer gancho de CI sem preparo.
 *
 * O preço disso é que o TypeScript não os enxerga. Este arquivo paga o preço
 * uma vez: declara a forma comum de **todo** verificador — uma função sem
 * argumento que devolve achados — em vez de espalhar `any` pelos testes.
 *
 * A forma é a mesma para todos de propósito. Um verificador que precisasse de
 * argumento seria um verificador que depende de quem o chama, e o pente fino
 * roda todos do mesmo jeito.
 */

/** Um achado: onde está, e o que há de errado ali. */
interface QaFinding {
  file: string;
  line?: number;
  detail?: string;
}

type QaCheck = () => QaFinding[];

declare module '*/qa/core.mjs' {
  export const SEVERITY: Record<string, string>;
  export function stripComments(source: string): string;
  export function sources(): { file: string; content: string; code: string }[];
  export function injectSources(files: { file: string; content: string }[]): void;
  export function clearInjectedSources(): void;
  /** A segunda costura: poe conteudo no lugar do arquivo daquele caminho. */
  export function injectFile(caminho: string, conteudo: string): void;
  export function readSource(caminho: string): string;
  export function sourceExists(caminho: string): boolean;
  export function checkerInventory(): {
    nome: string;
    arquivo: string;
    ligado: boolean;
    provado: boolean;
  }[];
  export const checkEveryCheckerIsWired: QaCheck;
  export const checkEveryCheckerHasProof: QaCheck;
}

/**
 * Cada export declarado pelo nome, e nao `Record<string, QaCheck>`.
 *
 * O atalho anterior era `export = checks` com um Record: o modulo inteiro
 * virava um mapa de nome para verificador. Duas consequencias ruins. Os
 * leitores de estrutura — `audienceRules`, `chavesDeArmazenamento`,
 * `countingRows` — caiam no tipo generico e nao davam para usar. E um nome de
 * verificador ERRADO compilava, porque qualquer chave servia num Record.
 *
 * Declarado assim, chamar um verificador que nao existe e erro de compilacao.
 */
declare module '*/qa/flow.mjs' {
  export function servedRoutes(): string[];
  export const checkNavigationTargets: QaCheck;
  export const checkDegreeClaims: QaCheck;
  export const checkFreeCourseDisclaimer: QaCheck;
  export const checkFabricatedData: QaCheck;
  export const checkPublicDomainRepertoire: QaCheck;
  export const checkDeadButton: QaCheck;
  export const checkEmptyLiteralAsData: QaCheck;
  export const checkSuccessWithoutEffect: QaCheck;
  export const checkComingSoonPromise: QaCheck;
  export const checkDataInsideScreen: QaCheck;
  export const checkDevToolInProduction: QaCheck;
  export const checkAccessibleName: QaCheck;
  export const checkFieldLabel: QaCheck;
  export const checkAltText: QaCheck;
  export const checkKeyboardReach: QaCheck;
  export const checkInflatedAggregate: QaCheck;
  export const checkRetiredVocabulary: QaCheck;
  export const checkPersonalSectionWithoutSession: QaCheck;
  export const checkHardcodedMetric: QaCheck;
}

declare module '*/qa/security.mjs' {
  export function chavesDeArmazenamento(): Map<string, string[]>;
  export const checkKeyCollision: QaCheck;
  export const checkPerUserFilter: QaCheck;
  export const checkPublishKeepsStudentData: QaCheck;
  export const checkAdminAuthority: QaCheck;
  export const checkConsoleLeak: QaCheck;
  export const checkHtmlInjection: QaCheck;
  export const checkSessionTeardown: QaCheck;
  export const checkCommittedSecret: QaCheck;
  export const checkRecordOwnership: QaCheck;
  export function audienceRules(): { route: string; audience: string }[];
  export function routeToScreen(): { route: string; screen: string }[];
  export const checkAdminScreensBehindAdminAudience: QaCheck;
  export const checkGuardCoversEveryAudience: QaCheck;
  export const checkPersonalRouteInheritingPublic: QaCheck;
  export const checkNoGuessableAdminRoute: QaCheck;
  export const checkTechnicalNameInUi: QaCheck;
}

declare module '*/qa/economy.mjs' {
  export function countingRows(): { line: string; lineNumber: number; columns: string[] }[];
  export const checkCountingSymbol: QaCheck;
  export const checkCountingVocabulary: QaCheck;
  export const checkValueOutsideTable: QaCheck;
  export const checkDivergentValue: QaCheck;
}

declare module '*/qa/text.mjs' {
  export function checkText(): {
    ortografia: QaFinding[];
    pontuacao: QaFinding[];
    mojibake: QaFinding[];
    inacabado: QaFinding[];
    ingles: QaFinding[];
  };
  export const checkContentMarkdown: QaCheck;
  export const checkEnglishLeakInSentence: QaCheck;
}

declare module '*/qa/institution.mjs' {
  export const checkCourseHasChair: QaCheck;
  export const checkChairHasCourse: QaCheck;
  export const checkHouseStatusMatchesCorpus: QaCheck;
  export const checkAtlasFilterIsApplied: QaCheck;
  export const checkAcervoCatalogaTudo: QaCheck;
  export const checkDisponibilidadeTemMotivo: QaCheck;
  export const checkAtribuicaoDaPartitura: QaCheck;
  export const checkNiveisDeMeioSeparados: QaCheck;
  export const checkFiltroOferecidoEAplicado: QaCheck;
  export const checkEixoUniversalAlcancaOAcervo: QaCheck;
  export const checkFonteNaoCriaEntidade: QaCheck;
  /**
   * O prazo declara o regime — morte para autor conhecido (art. 41),
   * publicação para obra anônima (art. 43).
   */
  export const checkPrazoDeProtecao: QaCheck;
  /** Data de morte escrita à mão para fazer a conta fechar. */
  export const checkDataDeMorteCravada: QaCheck;
  export const checkPapelEEixoProprio: QaCheck;
  export const checkAtlasEAcervoMesmaVerdade: QaCheck;
}

declare module '*/qa/readiness.mjs' {
  export function readinessReport(): {
    area: string;
    id: string;
    respondidas: number;
    total: number;
    perguntas: { chave: string; pergunta: string; ok: boolean; detalhe: string; peso: number }[];
  }[];
  export function priorityQueue(): {
    area: string;
    chave: string;
    pergunta: string;
    detalhe: string;
    peso: number;
  }[];
  export const checkReadiness: QaCheck;
}

/**
 * A lista de fontes proibidas vive no verificador, e é ela que vale.
 *
 * O teste dos artigos mantinha uma cópia escrita à mão, e as duas divergiram:
 * a cópia proibia nomear **qualquer** fonte, inclusive a de catálogo cuja
 * curadoria o artigo precisa atribuir. Declarar o módulo aqui deixa uma lista
 * só no projeto.
 */
declare module '*/verify-no-citations.mjs' {
  export const FONTES_PROIBIDAS: string[];
  export function verificarCitacoes(): { file: string; detail: string }[];
}
