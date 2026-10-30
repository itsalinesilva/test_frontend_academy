import {
  ArtigoDoConservatorio,
  ColetaneaCitada,
  ObraCitada,
  PessoaCitada,
  SecaoDoArtigo,
  TipoDeArtigo,
} from './article';

/**
 * A CAMADA EDITORIAL DOS ARTIGOS.
 *
 * 🔴 O MESMO DEFEITO DAS LIÇÕES, NO OUTRO CANTO DA CASA
 * -----------------------------------------------------
 * Os artigos vivem em `src/data/seed-articles.ts`, compilados no pacote. Não
 * há caminho de escrita: corrigir uma vírgula num artigo publicado exigia
 * mudar o código e publicar de novo.
 *
 * Para lição isso já foi resolvido. Aqui a estrutura é outra — artigo tem
 * cabeçalho assinado, seções e citações —, mas o desenho é o mesmo, e é
 * deliberado: uma segunda arquitetura de edição significaria duas coisas para
 * manter, e a que ficasse para trás viraria a que quebra.
 *
 * O QUE SE EDITA, E POR QUE É A PEÇA INTEIRA
 * ------------------------------------------
 * Ao contrário da lição, aqui a edição guarda o **artigo inteiro**, e não um
 * alvo dentro dele. A razão é o que o artigo é: um texto assinado, com
 * cabeçalho, corpo e referências que se sustentam uns aos outros.
 *
 * Trocar o título sem rever o resumo, ou acrescentar uma obra citada sem tocar
 * no texto que a justifica, produz peça incoerente — e incoerência num texto
 * assinado é pior que num bloco de lição, porque ela sai com o nome de alguém
 * embaixo.
 *
 * 🔴 O QUE A EDIÇÃO NÃO PODE FAZER
 * --------------------------------
 * Não pode remover a exigência de motivo nas citações. Uma lista de obras sem
 * justificativa é uma lista de opiniões escondidas: quem lê não sabe se a peça
 * está ali por ser representativa ou porque alguém gostou dela.
 *
 * E não pode citar obra que não existe no acervo — artigo que aponta para obra
 * inexistente é um percurso que não se pode percorrer, e quem lê descobre isso
 * no meio do caminho.
 */

export interface EdicaoDeArtigo {
  /** Derivado do artigo, e não sorteado: editar duas vezes deixa UMA edição. */
  id: string;
  artigoId: string;
  /** O artigo como ficou. Peça inteira, pelas razões do cabeçalho. */
  conteudo: ArtigoDoConservatorio;
  /** Como o Conservatório publicou. É o que permite reverter e comparar. */
  anterior: ArtigoDoConservatorio | null;
  /** `true` quando o artigo não existe no seed — foi escrito pela curadoria. */
  criado: boolean;
  editadaPor: string;
  editadaEm: string;
  motivo?: string;
}

export function idDaEdicaoDeArtigo(artigoId: string): string {
  return `art_${artigoId}`;
}

/**
 * Aplica a camada sobre os artigos publicados.
 *
 * Função pura, como a das lições: recebe o que o acervo publicou e devolve o
 * que deve ser lido. Não conhece armazenamento, e por isso é testável sem
 * navegador e serve tanto à tela quanto à geração do livro.
 *
 * A ORDEM DA LISTAGEM É PRESERVADA, e os criados entram no fim — a vitrine
 * ordena por data de publicação depois, e reordenar aqui faria duas
 * ordenações competirem.
 */
export function aplicarEdicoesDeArtigos(
  publicados: readonly ArtigoDoConservatorio[],
  edicoes: readonly EdicaoDeArtigo[]
): ArtigoDoConservatorio[] {
  if (edicoes.length === 0) return [...publicados];

  const porArtigo = new Map(edicoes.map((e) => [e.artigoId, e]));

  const corrigidos = publicados.map((a) => {
    const e = porArtigo.get(a.id);
    return e ? e.conteudo : a;
  });

  /** Os que a curadoria escreveu do zero — não estão no seed. */
  const publicadosIds = new Set(publicados.map((a) => a.id));
  const criados = edicoes
    .filter((e) => e.criado && !publicadosIds.has(e.artigoId))
    .map((e) => e.conteudo);

  return [...corrigidos, ...criados];
}

/**
 * Os problemas do artigo, antes de gravar.
 *
 * 🔴 VALIDA AQUI, E NÃO NA TELA. O artigo sai assinado e datado: um resumo
 * vazio ou uma citação sem motivo entra na biblioteca com o nome de alguém
 * embaixo, e quem gravou já saiu quando alguém percebe.
 *
 * `idsDoAcervo` é opcional porque nem todo chamador tem o acervo carregado —
 * a tela de edição tem, e é lá que a conferência importa. Quando falta, a
 * função declara que não conferiu, em vez de fingir que conferiu.
 */
export function problemasDoArtigo(
  artigo: ArtigoDoConservatorio,
  idsDoAcervo?: Set<string>
): string[] {
  const erros: string[] = [];

  // ---- cabeçalho -----------------------------------------------------------
  if (!artigo.titulo.trim()) erros.push('O artigo está sem título.');
  if (!artigo.subtitulo.trim()) erros.push('O artigo está sem subtítulo.');

  if (!artigo.resumo.trim()) {
    erros.push('O artigo está sem resumo — é ele que aparece na listagem.');
  } else if (artigo.resumo.trim().length < 40) {
    /**
     * O resumo diz o que o artigo **conclui**, e não o que ele vai discutir.
     * Uma linha de dez palavras não consegue fazer isso, e quem procura na
     * biblioteca decide por ele se vale abrir.
     */
    erros.push('O resumo é curto demais para dizer o que o artigo conclui.');
  }

  if (!artigo.autoria.trim()) {
    erros.push('O artigo está sem autoria — texto publicado sai assinado.');
  }
  if (!artigo.instituicao.trim()) erros.push('O artigo está sem instituição.');

  if (!/^\d{4}-\d{2}-\d{2}/.test(artigo.publicadoEm)) {
    erros.push('A data de publicação não está em forma de data.');
  }

  // ---- corpo ---------------------------------------------------------------
  if (artigo.secoes.length === 0) {
    erros.push('O artigo não tem nenhuma seção.');
  }

  for (const s of artigo.secoes) {
    if (!s.titulo.trim()) erros.push('Há seção sem título.');
    if (!s.markdown.trim()) erros.push(`A seção "${s.titulo || '(sem título)'}" está vazia.`);
  }

  const ordens = artigo.secoes.map((s) => s.ordem);
  if (new Set(ordens).size !== ordens.length) {
    /** Ordem repetida faz duas seções disputarem a mesma posição. */
    erros.push('Há duas seções com a mesma ordem.');
  }

  // ---- citações ------------------------------------------------------------
  const semMotivo = (m: string) => m.trim().length < 15;

  for (const o of artigo.obras) {
    if (semMotivo(o.motivo)) {
      erros.push(`A obra ${o.obraId} é citada sem dizer por quê.`);
    }
  }
  for (const p of artigo.pessoas) {
    if (semMotivo(p.motivo)) erros.push(`A pessoa ${p.pessoaId} é citada sem dizer por quê.`);
  }
  for (const c of artigo.coletaneas) {
    if (semMotivo(c.motivo)) {
      erros.push(`A coletânea ${c.coletaneaId} é citada sem dizer por quê.`);
    }
  }

  const idsDeObra = artigo.obras.map((o) => o.obraId);
  if (new Set(idsDeObra).size !== idsDeObra.length) {
    erros.push('A mesma obra está citada duas vezes.');
  }

  if (idsDoAcervo) {
    for (const o of artigo.obras) {
      if (!idsDoAcervo.has(o.obraId)) {
        erros.push(
          `A obra ${o.obraId} não existe no acervo — o percurso não pode ser percorrido.`
        );
      }
    }
  }

  return erros;
}

/** Um artigo em branco, já com a forma que a validação exige. */
export function artigoEmBranco(entrada: {
  id: string;
  autoria: string;
  instituicao?: string;
  agora?: Date;
}): ArtigoDoConservatorio {
  const quando = (entrada.agora ?? new Date()).toISOString();

  return {
    id: entrada.id,
    tipo: 'ENSAIO',
    titulo: '',
    subtitulo: '',
    resumo: '',
    autoria: entrada.autoria,
    instituicao: entrada.instituicao ?? 'Conservatório Muscicapa',
    secoes: [{ id: `${entrada.id}_s1`, titulo: '', markdown: '', ordem: 1 }],
    obras: [],
    pessoas: [],
    coletaneas: [],
    etiquetas: [],
    publicadoEm: quando,
    atualizadoEm: quando,
  };
}

/**
 * O rodapé editorial, derivado do artigo.
 *
 * 🔴 DERIVADO, e não um campo que alguém preenche. Um rodapé escrito à mão
 * diverge do corpo no dia em que uma citação entra e ninguém lembra de
 * atualizá-lo — e aí a peça diz "12 obras" no rodapé e percorre 14.
 *
 * O que ele traz é o que um rodapé editorial traz: quem assina, quando saiu,
 * quando foi revisto, e o que foi consultado, contado.
 */
export interface RodapeDoArtigo {
  autoria: string;
  instituicao: string;
  publicadoEm: string;
  atualizadoEm: string;
  /** Quantas referências de cada tipo, medidas e não escritas. */
  referencias: { obras: number; pessoas: number; coletaneas: number; total: number };
  /** `true` quando o artigo foi revisto depois de publicado. */
  revisado: boolean;
}

export function rodapeDoArtigo(artigo: ArtigoDoConservatorio): RodapeDoArtigo {
  const obras = artigo.obras.length;
  const pessoas = artigo.pessoas.length;
  const coletaneas = artigo.coletaneas.length;

  return {
    autoria: artigo.autoria,
    instituicao: artigo.instituicao,
    publicadoEm: artigo.publicadoEm,
    atualizadoEm: artigo.atualizadoEm,
    referencias: { obras, pessoas, coletaneas, total: obras + pessoas + coletaneas },
    /**
     * Compara a data, e não o instante: gravar o artigo no mesmo dia em que ele
     * saiu não o torna "revisado", e marcar isso encheria o rodapé de revisões
     * que ninguém fez.
     */
    revisado: artigo.atualizadoEm.slice(0, 10) > artigo.publicadoEm.slice(0, 10),
  };
}

/** Os tipos de artigo, para o formulário não aceitar um valor inventado. */
export const TIPOS_DE_ARTIGO: Array<{ valor: TipoDeArtigo; rotulo: string; explica: string }> = [
  { valor: 'AUDITORIA', rotulo: 'Auditoria', explica: 'O que o acervo tem, e o que falta.' },
  { valor: 'PERCURSO', rotulo: 'Percurso', explica: 'Ordem sugerida de estudo, com obras do acervo.' },
  { valor: 'ENSAIO', rotulo: 'Ensaio', explica: 'Recorte temático: uma era, um movimento, uma escola.' },
];

export type { ColetaneaCitada, ObraCitada, PessoaCitada, SecaoDoArtigo };
