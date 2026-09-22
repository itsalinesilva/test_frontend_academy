import { EditorialEdit, EditorialLesson } from './editorial-edit';
import { EdicaoDeArtigo } from './editorial-artigo';
import { Livreto } from './booklet';
import { SecaoEditadaDoLivro } from './book';

/**
 * O PACOTE EDITORIAL — como a edição sai do navegador.
 *
 * 🔴 POR QUE ELE PRECISA EXISTIR
 * ------------------------------
 * A camada editorial grava em `localStorage`. Isso faz a correção aparecer na
 * hora para quem a fez, e **só** para quem a fez: não atravessa para outro
 * computador, não chega ao aluno, e some se o navegador for limpo.
 *
 * Uma engine editorial que só edita o próprio navegador não é uma engine
 * editorial — é um rascunho com aparência de publicação. O pacote é a ponte:
 * ele sai daqui como arquivo, entra no repositório por commit, e é o commit
 * que publica.
 *
 * ```
 *   admin edita ──▶ localStorage ──▶ [ exportar ] ──▶ .json
 *                        │                              │
 *                  só o admin vê                   commit no repo
 *                                                       │
 *                                                  Cloudflare ──▶ aluno
 * ```
 *
 * 🔴 A VERSÃO NÃO É ENFEITE
 * -------------------------
 * Um pacote exportado antes de um campo mudar de forma, importado depois,
 * gravaria conteúdo com a forma errada — e a lição quebraria na leitura, longe
 * de quem importou. Por isso a importação **recusa** o que não reconhece, em
 * vez de tentar adivinhar.
 *
 * O QUE ELE NÃO É
 * ---------------
 * Não é backup de aluno: não leva progresso, tentativa, nota nem certificado.
 * Leva o que o Conservatório **publica**, que é a única coisa que faz sentido
 * viajar entre máquinas e entrar no repositório.
 */

/** A forma corrente do pacote. Sobe quando um campo muda de significado. */
/**
 * Subiu para 2 quando os artigos entraram no pacote.
 *
 * Um pacote da versão 1 não traz `artigos`, e importá-lo numa instalação que
 * os espera gravaria a lista como ausente — o que é indistinguível de "nenhum
 * artigo editado". A recusa é o comportamento certo, e `lerPacote` a aplica
 * nos dois sentidos.
 *
 * Subiu para 3 com os livretos, e para 4 com as seções escritas dos livros da
 * Biblioteca — pela mesma razão: um pacote que não traz a lista não pode ser
 * lido como "nenhuma seção escrita".
 */
export const VERSAO_DO_PACOTE = 4;

export interface PacoteEditorial {
  versao: number;
  /** Quando foi exportado. Serve para o revisor saber o que é mais novo. */
  exportadoEm: string;
  /** Quem exportou. Vai para a trilha de revisão do commit. */
  exportadoPor?: string;
  /** As correções sobre conteúdo publicado. */
  edicoes: EditorialEdit[];
  /** As lições criadas do zero pela curadoria. */
  licoesCriadas: EditorialLesson[];
  /** Os artigos corrigidos e os escritos pela curadoria. */
  artigos: EdicaoDeArtigo[];
  /**
   * 🔴 OS LIVRETOS — 378 questões que não tinham como sair do navegador.
   *
   * O editor de livretos era completo e gravava em `localStorage`, e mesmo
   * assim o trabalho ficava preso na máquina de quem editou: o pacote não os
   * levava. Corrigir uma alternativa errada numa questão de prova era um
   * conserto que nunca chegava a aluno nenhum.
   *
   * Vão inteiros, e não como diferença: o livreto é a fonte das questões, do
   * simulado e da prova, e mandar só o que mudou obrigaria quem importa a ter
   * exatamente a mesma base de partida.
   */
  livretos: Livreto[];
  /**
   * Prefácio, dedicatória, colofão e as demais seções escritas dos livros da
   * Biblioteca. Sem isto, o texto ficaria preso no navegador de quem escreveu
   * — e `npm run livros` imprimiria o texto de partida.
   */
  secoesDeLivro: SecaoEditadaDoLivro[];
}

export interface ResumoDoPacote {
  edicoes: number;
  licoesCriadas: number;
  artigos: number;
  livretos: number;
  secoesDeLivro: number;
  /** Quantas questões viajam no pacote. É a medida que importa a quem revisa. */
  questoes: number;
  /** Quantas lições distintas o pacote toca. */
  licoesAfetadas: number;
  exportadoEm: string;
  exportadoPor?: string;
}

export function montarPacote(entrada: {
  edicoes: EditorialEdit[];
  licoesCriadas: EditorialLesson[];
  artigos: EdicaoDeArtigo[];
  livretos: Livreto[];
  secoesDeLivro: SecaoEditadaDoLivro[];
  exportadoPor?: string;
  agora?: Date;
}): PacoteEditorial {
  return {
    versao: VERSAO_DO_PACOTE,
    exportadoEm: (entrada.agora ?? new Date()).toISOString(),
    exportadoPor: entrada.exportadoPor,
    edicoes: entrada.edicoes,
    licoesCriadas: entrada.licoesCriadas,
    artigos: entrada.artigos,
    livretos: entrada.livretos,
    secoesDeLivro: entrada.secoesDeLivro,
  };
}

export function resumirPacote(p: PacoteEditorial): ResumoDoPacote {
  const tocadas = new Set<string>([
    ...p.edicoes.map((e) => e.lessonId),
    ...p.licoesCriadas.map((l) => l.id),
  ]);

  return {
    edicoes: p.edicoes.length,
    licoesCriadas: p.licoesCriadas.length,
    artigos: p.artigos.length,
    livretos: p.livretos.length,
    secoesDeLivro: p.secoesDeLivro.length,
    questoes: p.livretos.reduce(
      (n, l) => n + l.capitulos.reduce((m, c) => m + c.questoes.length, 0),
      0
    ),
    licoesAfetadas: tocadas.size,
    exportadoEm: p.exportadoEm,
    exportadoPor: p.exportadoPor,
  };
}

/**
 * O nome do arquivo exportado.
 *
 * Carrega a data porque quem revisa acumula vários, e "pacote.json" repetido
 * na pasta de downloads é a forma mais rápida de importar o errado.
 */
export function nomeDoArquivo(p: PacoteEditorial): string {
  const dia = p.exportadoEm.slice(0, 10);
  return `conservatorio-editorial-${dia}.json`;
}

export type LeituraDoPacote =
  | { ok: true; pacote: PacoteEditorial }
  | { ok: false; motivo: string };

/**
 * Lê um pacote, e **recusa** o que não reconhece.
 *
 * 🔴 Cada recusa nomeia o que está errado. "Arquivo inválido" faria quem
 * importou tentar de novo com o mesmo arquivo; dizer *o que* falta é o que
 * permite consertar.
 *
 * O parâmetro é texto, e não objeto, de propósito: é assim que ele chega — de
 * um arquivo escolhido na tela. Analisar aqui mantém o `try` num lugar só.
 */
export function lerPacote(texto: string): LeituraDoPacote {
  let cru: unknown;

  try {
    cru = JSON.parse(texto);
  } catch {
    return { ok: false, motivo: 'O arquivo não é JSON válido.' };
  }

  if (!cru || typeof cru !== 'object' || Array.isArray(cru)) {
    return { ok: false, motivo: 'O arquivo não contém um pacote editorial.' };
  }

  const p = cru as Partial<PacoteEditorial>;

  if (typeof p.versao !== 'number') {
    return { ok: false, motivo: 'O pacote não declara versão, e por isso não pode ser lido com segurança.' };
  }

  if (p.versao > VERSAO_DO_PACOTE) {
    return {
      ok: false,
      motivo: `O pacote é da versão ${p.versao} e esta instalação lê até a ${VERSAO_DO_PACOTE}. Atualize a plataforma antes de importar.`,
    };
  }

  if (p.versao < VERSAO_DO_PACOTE) {
    return {
      ok: false,
      motivo: `O pacote é da versão ${p.versao}, anterior à ${VERSAO_DO_PACOTE}. Importá-lo gravaria conteúdo com a forma antiga.`,
    };
  }

  if (!Array.isArray(p.edicoes) || !Array.isArray(p.licoesCriadas)) {
    return { ok: false, motivo: 'O pacote está sem a lista de edições ou a de lições criadas.' };
  }

  if (!Array.isArray(p.artigos)) {
    return { ok: false, motivo: 'O pacote está sem a lista de artigos.' };
  }

  if (!Array.isArray(p.livretos)) {
    return { ok: false, motivo: 'O pacote está sem a lista de livretos.' };
  }

  if (!Array.isArray(p.secoesDeLivro)) {
    return { ok: false, motivo: 'O pacote está sem a lista de seções dos livros.' };
  }

  /**
   * Conferência de forma, item a item.
   *
   * Uma edição sem `lessonId` entra no armazenamento e nunca é aplicada a
   * lição nenhuma: fica ocupando espaço, aparece na contagem e não tem efeito.
   * É pior que a recusa, porque parece ter funcionado.
   */
  for (const [i, e] of p.edicoes.entries()) {
    if (!e || typeof e !== 'object') {
      return { ok: false, motivo: `A edição ${i + 1} não é um registro.` };
    }
    for (const campo of ['id', 'lessonId', 'editadaPor', 'editadaEm'] as const) {
      if (typeof (e as EditorialEdit)[campo] !== 'string') {
        return { ok: false, motivo: `A edição ${i + 1} está sem "${campo}".` };
      }
    }
    if (!(e as EditorialEdit).alvo || typeof (e as EditorialEdit).alvo !== 'object') {
      return { ok: false, motivo: `A edição ${i + 1} está sem alvo — não se sabe o que ela corrige.` };
    }
  }

  for (const [i, l] of p.licoesCriadas.entries()) {
    if (!l || typeof l !== 'object' || typeof (l as EditorialLesson).id !== 'string') {
      return { ok: false, motivo: `A lição criada ${i + 1} está sem identificador.` };
    }
  }

  for (const [i, l] of p.livretos.entries()) {
    if (!l || typeof l !== 'object' || typeof (l as Livreto).cursoId !== 'string') {
      return { ok: false, motivo: `O livreto ${i + 1} não declara a que curso pertence.` };
    }
    if (!Array.isArray((l as Livreto).capitulos)) {
      return { ok: false, motivo: `O livreto ${i + 1} está sem capítulos.` };
    }
  }

  for (const [i, a] of p.artigos.entries()) {
    if (!a || typeof a !== 'object' || typeof (a as EdicaoDeArtigo).artigoId !== 'string') {
      return { ok: false, motivo: `O artigo ${i + 1} está sem identificador.` };
    }
    if (!(a as EdicaoDeArtigo).conteudo) {
      return { ok: false, motivo: `O artigo ${i + 1} veio sem conteúdo.` };
    }
  }

  for (const [i, e] of p.secoesDeLivro.entries()) {
    if (!e || typeof e !== 'object') {
      return { ok: false, motivo: `A seção de livro ${i + 1} não é um registro.` };
    }
    for (const campo of ['id', 'livroId', 'secaoId', 'conteudo', 'editadaEm'] as const) {
      if (typeof (e as SecaoEditadaDoLivro)[campo] !== 'string') {
        return { ok: false, motivo: `A seção de livro ${i + 1} está sem "${campo}".` };
      }
    }
  }

  return {
    ok: true,
    pacote: {
      versao: p.versao,
      exportadoEm: typeof p.exportadoEm === 'string' ? p.exportadoEm : new Date().toISOString(),
      exportadoPor: typeof p.exportadoPor === 'string' ? p.exportadoPor : undefined,
      edicoes: p.edicoes as EditorialEdit[],
      licoesCriadas: p.licoesCriadas as EditorialLesson[],
      artigos: p.artigos as EdicaoDeArtigo[],
      livretos: p.livretos as Livreto[],
      secoesDeLivro: p.secoesDeLivro as SecaoEditadaDoLivro[],
    },
  };
}

/**
 * Junta o que já está gravado com o que veio do pacote.
 *
 * 🔴 A EDIÇÃO MAIS NOVA VENCE, e a comparação é por data — não por ordem de
 * chegada. Importar um pacote antigo por cima do trabalho de hoje apagaria
 * correções mais recentes, e ninguém saberia quais.
 *
 * O identificador da edição é derivado do alvo, e não sorteado: duas correções
 * do mesmo bloco colidem no mesmo id, que é exatamente o que permite comparar
 * datas em vez de empilhar duplicatas.
 */
export function fundirEdicoes(
  atuais: readonly EditorialEdit[],
  doPacote: readonly EditorialEdit[]
): { resultado: EditorialEdit[]; adicionadas: number; substituidas: number; mantidas: number } {
  const porId = new Map(atuais.map((e) => [e.id, e]));
  let adicionadas = 0;
  let substituidas = 0;
  let mantidas = 0;

  for (const nova of doPacote) {
    const atual = porId.get(nova.id);

    if (!atual) {
      porId.set(nova.id, nova);
      adicionadas++;
      continue;
    }

    if (Date.parse(nova.editadaEm) > Date.parse(atual.editadaEm)) {
      porId.set(nova.id, nova);
      substituidas++;
    } else {
      mantidas++;
    }
  }

  return { resultado: [...porId.values()], adicionadas, substituidas, mantidas };
}

/** Mesma regra para as lições criadas: a mais nova vence, por identificador. */
export function fundirLicoesCriadas(
  atuais: readonly EditorialLesson[],
  doPacote: readonly EditorialLesson[]
): { resultado: EditorialLesson[]; adicionadas: number; substituidas: number; mantidas: number } {
  const porId = new Map(atuais.map((l) => [l.id, l]));
  let adicionadas = 0;
  let substituidas = 0;
  let mantidas = 0;

  for (const nova of doPacote) {
    const atual = porId.get(nova.id);

    if (!atual) {
      porId.set(nova.id, nova);
      adicionadas++;
      continue;
    }

    /**
     * `criadaEm` é o carimbo que a lição criada tem. Não há `updatedAt` aqui:
     * salvar de novo reescreve o carimbo, e é por isso que ele serve de
     * comparação.
     */
    const quandoNova = Date.parse(nova.criadaEm);
    const quandoAtual = Date.parse(atual.criadaEm);

    if (Number.isFinite(quandoNova) && Number.isFinite(quandoAtual) && quandoNova > quandoAtual) {
      porId.set(nova.id, nova);
      substituidas++;
    } else {
      mantidas++;
    }
  }

  return { resultado: [...porId.values()], adicionadas, substituidas, mantidas };
}

/** Mesma regra dos outros dois: a mais nova vence, por identificador. */
export function fundirArtigos(
  atuais: readonly EdicaoDeArtigo[],
  doPacote: readonly EdicaoDeArtigo[]
): { resultado: EdicaoDeArtigo[]; adicionadas: number; substituidas: number; mantidas: number } {
  const porId = new Map(atuais.map((a) => [a.id, a]));
  let adicionadas = 0;
  let substituidas = 0;
  let mantidas = 0;

  for (const nova of doPacote) {
    const atual = porId.get(nova.id);

    if (!atual) {
      porId.set(nova.id, nova);
      adicionadas++;
      continue;
    }

    if (Date.parse(nova.editadaEm) > Date.parse(atual.editadaEm)) {
      porId.set(nova.id, nova);
      substituidas++;
    } else {
      mantidas++;
    }
  }

  return { resultado: [...porId.values()], adicionadas, substituidas, mantidas };
}

/**
 * Funde os livretos, pelo curso.
 *
 * 🔴 A COMPARAÇÃO É POR `updatedAt`, e não por ordem de chegada — mesma regra
 * dos outros três. Importar um pacote antigo por cima do trabalho de hoje
 * apagaria questões corrigidas, e ninguém saberia quais.
 */
export function fundirLivretos(
  atuais: readonly Livreto[],
  doPacote: readonly Livreto[]
): { resultado: Livreto[]; adicionadas: number; substituidas: number; mantidas: number } {
  const porCurso = new Map(atuais.map((l) => [l.cursoId, l]));
  let adicionadas = 0;
  let substituidas = 0;
  let mantidas = 0;

  for (const novo of doPacote) {
    const atual = porCurso.get(novo.cursoId);

    if (!atual) {
      porCurso.set(novo.cursoId, novo);
      adicionadas++;
      continue;
    }

    if (Date.parse(novo.updatedAt) > Date.parse(atual.updatedAt)) {
      porCurso.set(novo.cursoId, novo);
      substituidas++;
    } else {
      mantidas++;
    }
  }

  return { resultado: [...porCurso.values()], adicionadas, substituidas, mantidas };
}

/** Mesma regra dos outros: a mais nova vence, por identificador. */
export function fundirSecoesDeLivro(
  atuais: readonly SecaoEditadaDoLivro[],
  doPacote: readonly SecaoEditadaDoLivro[]
): { resultado: SecaoEditadaDoLivro[]; adicionadas: number; substituidas: number; mantidas: number } {
  const porId = new Map(atuais.map((e) => [e.id, e]));
  let adicionadas = 0;
  let substituidas = 0;
  let mantidas = 0;

  for (const nova of doPacote) {
    const atual = porId.get(nova.id);

    if (!atual) {
      porId.set(nova.id, nova);
      adicionadas++;
      continue;
    }

    if (Date.parse(nova.editadaEm) > Date.parse(atual.editadaEm)) {
      porId.set(nova.id, nova);
      substituidas++;
    } else {
      mantidas++;
    }
  }

  return { resultado: [...porId.values()], adicionadas, substituidas, mantidas };
}
