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

export function secoesEditaveis(livro: LivroDoConservatorio): SecaoDoLivro[] {
  return livro.secoes.filter((s) => s.origem === 'EDITAVEL').sort((a, b) => a.ordem - b.ordem);
}

export function contarPalavras(livro: LivroDoConservatorio): number {
  return livro.secoes.reduce(
    (a, s) => a + (s.conteudo.match(/[A-Za-zÀ-ÿ]+/g) ?? []).length,
    0
  );
}
