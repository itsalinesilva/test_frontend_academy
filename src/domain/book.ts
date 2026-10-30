import { EntityId, ISOTimestamp } from './types';

/**
 * Livro estático de um curso — a biblioteca do Conservatório.
 *
 * O QUE É
 * -------
 * A versão impressa de cada curso: o mesmo conteúdo que o aluno percorre na
 * plataforma, montado como livro, para ler de ponta a ponta, imprimir ou
 * guardar.
 *
 * A DIVISÃO QUE ORGANIZA TUDO: GERADO versus EDITÁVEL
 * ---------------------------------------------------
 * Algumas partes do livro NASCEM do curso e não devem ser escritas à mão —
 * sumário, capítulos, caderno de exercícios. Se alguém as editasse aqui, o
 * livro e a plataforma passariam a dizer coisas diferentes, e a divergência
 * apareceria meses depois, sem ninguém saber qual está certo.
 *
 * Outras partes são do LIVRO e não existem no curso — capa, folha de rosto,
 * dedicatória, prefácio, colofão. Essas são escritas, e devem ser editáveis
 * sem tocar em código.
 *
 * O tipo separa as duas coisas, e a regeneração respeita a separação:
 * regenerar atualiza o que é gerado e PRESERVA o que foi escrito.
 */

export type OrigemDaSecao =
  /** Nasce do curso. Regenerar sobrescreve. */
  | 'GERADA'
  /** Escrita à mão. Regenerar preserva. */
  | 'EDITAVEL';

export type PapelDaSecao =
  | 'CAPA'
  | 'FOLHA_DE_ROSTO'
  | 'FICHA_CATALOGRAFICA'
  | 'DEDICATORIA'
  | 'PREFACIO'
  | 'SUMARIO'
  | 'CAPITULO'
  | 'CADERNO_DE_EXERCICIOS'
  | 'GABARITO'
  | 'COLOFAO';

export interface SecaoDoLivro {
  id: string;
  papel: PapelDaSecao;
  origem: OrigemDaSecao;
  titulo: string;
  /** Conteúdo em Markdown. */
  conteudo: string;
  /** Ordem de impressão. */
  ordem: number;
  /** Começa em página ímpar — capítulos de livro impresso costumam começar. */
  abrePaginaImpar?: boolean;
}

export type TipoDeLivro =
  /** O texto do curso: leitura, conceitos, ilustrações. */
  | 'LEITURA'
  /** As práticas: laboratórios, exercícios executados, simuladores. */
  | 'IMERSAO';

export interface LivroDoConservatorio {
  id: EntityId;
  cursoId: EntityId;
  tipo: TipoDeLivro;
  titulo: string;
  subtitulo: string;
  /** Quem assina a obra. */
  autoria: string;
  instituicao: string;
  edicao: string;
  ano: number;
  secoes: SecaoDoLivro[];
  geradoEm: ISOTimestamp;
}

// ---------------------------------------------------------------------------
// Identidade editorial
// ---------------------------------------------------------------------------

export const AUTORIA_PADRAO = 'Aline Alves Silva';
export const INSTITUICAO = 'Conservatório Muscicapa';

/**
 * Ressalva de natureza do curso, impressa na ficha catalográfica.
 *
 * O mesmo princípio dos certificados: quem lê o livro precisa saber o que
 * está lendo. Um livro didático de curso livre é uma coisa legítima; um que
 * se deixa confundir com material de curso reconhecido prejudica primeiro
 * quem confiou nele.
 */
export const RESSALVA_EDITORIAL =
  'Material didático de curso livre de qualificação profissional. ' +
  'Publicação própria do Conservatório Muscicapa, sem vínculo com o MEC.';

// ---------------------------------------------------------------------------
// Regeneração preservando o que foi escrito
// ---------------------------------------------------------------------------

/**
 * Funde o livro recém-gerado com a versão anterior.
 *
 * As seções GERADAS vêm da nova; as EDITÁVEIS, da antiga. É o que permite
 * regenerar o livro depois de corrigir uma lição sem perder o prefácio que
 * alguém escreveu.
 *
 * Uma seção editável que não existe na versão nova é MANTIDA: ela foi
 * acrescentada à mão, e sumir com ela seria apagar trabalho.
 */
export function fundirPreservandoEdicoes(
  novo: LivroDoConservatorio,
  anterior: LivroDoConservatorio | null
): LivroDoConservatorio {
  if (!anterior) return novo;

  const editadasAntes = new Map(
    anterior.secoes.filter((s) => s.origem === 'EDITAVEL').map((s) => [s.id, s])
  );

  const secoes = novo.secoes.map((s) =>
    s.origem === 'EDITAVEL' && editadasAntes.has(s.id) ? editadasAntes.get(s.id)! : s
  );

  const idsNovos = new Set(novo.secoes.map((s) => s.id));
  for (const [id, secao] of editadasAntes) {
    if (!idsNovos.has(id)) secoes.push(secao);
  }

  return { ...novo, secoes: secoes.sort((a, b) => a.ordem - b.ordem) };
}

export interface ProblemaDoLivro {
  gravidade: 'erro' | 'aviso';
  mensagem: string;
  secaoId?: string;
}

export function validarLivro(livro: LivroDoConservatorio): ProblemaDoLivro[] {
  const problemas: ProblemaDoLivro[] = [];
  const papeis = new Set(livro.secoes.map((s) => s.papel));

  for (const obrigatorio of ['CAPA', 'FOLHA_DE_ROSTO', 'SUMARIO'] as PapelDaSecao[]) {
    if (!papeis.has(obrigatorio)) {
      problemas.push({ gravidade: 'erro', mensagem: `Falta a seção obrigatória: ${obrigatorio}.` });
    }
  }

  if (!livro.secoes.some((s) => s.papel === 'CAPITULO')) {
    problemas.push({ gravidade: 'erro', mensagem: 'O livro não tem capítulos.' });
  }

  const ordens = livro.secoes.map((s) => s.ordem);
  if (new Set(ordens).size !== ordens.length) {
    problemas.push({ gravidade: 'aviso', mensagem: 'Há seções com a mesma ordem de impressão.' });
  }

  for (const s of livro.secoes) {
    if (s.origem === 'GERADA' && s.conteudo.trim().length === 0) {
      problemas.push({
        gravidade: 'erro',
        secaoId: s.id,
        mensagem: `A seção gerada "${s.titulo}" saiu vazia — algo falhou na geração.`,
      });
    }
  }

  return problemas;
}

// ---------------------------------------------------------------------------
// A camada editorial do livro (EE-19)
// ---------------------------------------------------------------------------

/**
 * O que foi escrito numa seção editável.
 *
 * 🔴 POR QUE ISTO PRECISOU EXISTIR
 * --------------------------------
 * `fundirPreservandoEdicoes` prometia preservar o prefácio ao regenerar — e o
 * livro é regenerado A CADA LEITURA, a partir do curso. Sem um lugar onde o
 * texto escrito ficasse, não havia "versão anterior" para preservar: a tela
 * dizia "editável" sobre uma seção que ninguém tinha como editar, e que
 * esqueceria o que fosse escrito nela na leitura seguinte.
 *
 * Guarda-se só o conteúdo, e não a seção inteira: papel, título e ordem são do
 * modelo do livro. Deixá-los viajar com a edição permitiria a uma edição
 * antiga devolver um prefácio para a posição que ele tinha antes de o livro
 * mudar de forma.
 */
export interface SecaoEditadaDoLivro {
  /** Derivado do livro e da seção: editar duas vezes deixa UMA edição. */
  id: string;
  livroId: string;
  secaoId: string;
  conteudo: string;
  editadaPor: string;
  editadaEm: string;
}

export function idDaSecaoEditada(livroId: string, secaoId: string): string {
  return `${livroId}::${secaoId}`;
}

/**
 * O livro como deve ser lido: o gerado, com o que foi escrito por cima.
 *
 * 🔴 SÓ SEÇÃO EDITÁVEL RECEBE EDIÇÃO. Uma edição que apontasse para um
 * capítulo — por pacote torto, ou por uma seção que mudou de origem — faria o
 * livro dizer uma coisa e o curso outra, que é exatamente a divergência que a
 * separação GERADA/EDITÁVEL existe para impedir. Ela é ignorada, e não
 * aplicada.
 */
export function aplicarSecoesEditadas(
  livro: LivroDoConservatorio,
  edicoes: readonly SecaoEditadaDoLivro[]
): LivroDoConservatorio {
  const doLivro = new Map(
    edicoes.filter((e) => e.livroId === livro.id).map((e) => [e.secaoId, e])
  );
  if (doLivro.size === 0) return livro;

  return {
    ...livro,
    secoes: livro.secoes.map((s) => {
      const e = doLivro.get(s.id);
      return e && s.origem === 'EDITAVEL' ? { ...s, conteudo: e.conteudo } : s;
    }),
  };
}

/**
 * O que impede gravar uma seção.
 *
 * Vazia é recusada: capa ou folha de rosto em branco sai impressa em branco,
 * e quem apagou para reescrever depois já saiu da tela quando o livro é
 * baixado. Para voltar ao texto de partida existe reverter.
 */
export function problemasDaSecao(secao: SecaoDoLivro | undefined, conteudo: string): string[] {
  if (!secao) return ['A seção não existe neste livro.'];
  if (secao.origem !== 'EDITAVEL') {
    return [`"${secao.titulo}" nasce do curso: corrija a lição, e o livro acompanha.`];
  }
  if (conteudo.replace(/<!--[\s\S]*?-->/g, '').trim().length === 0) {
    return [`"${secao.titulo}" ficaria vazia. Para voltar ao texto de partida, use reverter.`];
  }
  return [];
}

export function secoesEditaveis(livro: LivroDoConservatorio): SecaoDoLivro[] {
  return livro.secoes.filter((s) => s.origem === 'EDITAVEL').sort((a, b) => a.ordem - b.ordem);
}

export function countWords(livro: LivroDoConservatorio): number {
  return livro.secoes.reduce(
    (a, s) => a + (s.conteudo.match(/[A-Za-zÀ-ÿ]+/g) ?? []).length,
    0
  );
}
