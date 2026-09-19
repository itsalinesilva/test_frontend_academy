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
  export function checkerInventory(): {
    nome: string;
    arquivo: string;
    ligado: boolean;
    provado: boolean;
  }[];
  export const checkEveryCheckerIsWired: QaCheck;
  export const checkEveryCheckerHasProof: QaCheck;
}

declare module '*/qa/flow.mjs' {
  const checks: Record<string, QaCheck>;
  export = checks;
}

declare module '*/qa/security.mjs' {
  const checks: Record<string, QaCheck>;
  export = checks;
}

declare module '*/qa/text.mjs' {
  const checks: Record<string, QaCheck>;
  export = checks;
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
