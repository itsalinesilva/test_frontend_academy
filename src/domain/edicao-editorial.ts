import { AcademyLesson, LessonBlock, AudienceVariant } from './academy';

/**
 * Edição editorial do conteúdo publicado.
 *
 * O PROBLEMA QUE ISTO RESOLVE
 * ---------------------------
 * O catálogo do Conservatório nasce em `src/data/` e é gravado no navegador
 * por `conteudoPublicado()`, que **reescreve** as chaves de conteúdo sempre
 * que a versão do catálogo muda. Isso existe por um motivo bom: três cursos
 * apagados do código continuavam aparecendo na tela porque a chave já estava
 * gravada.
 *
 * Só que `LESSONS` está nessa lista. Se a edição de uma lição fosse gravada
 * por cima da própria chave, bastaria subir a versão do catálogo — coisa que
 * acontece a cada alteração de conteúdo — para **apagar silenciosamente todo
 * o trabalho editorial**. A pessoa corrigiria uma concordância, publicaríamos
 * um capítulo novo em outro curso, e a correção sumiria sem aviso.
 *
 * A COMO FICA
 * -----------
 * A edição não substitui o conteúdo publicado: ela fica **por cima** dele,
 * numa chave própria que a publicação nunca toca. Na leitura, a camada é
 * aplicada; o que ninguém editou passa direto.
 *
 * Isso dá três propriedades que interessam ao negócio:
 *
 *  1. **A edição sobrevive à publicação.** Subir o catálogo não destrói
 *     revisão de texto.
 *  2. **Dá para saber o que foi editado, e voltar atrás.** A edição guarda o
 *     texto original ao lado do novo.
 *  3. **O livro da biblioteca acompanha.** Ele é gerado a partir das lições,
 *     e a leitura já vem com a camada aplicada — corrigir a lição corrige o
 *     livro, sem segunda etapa e sem chance de os dois divergirem.
 */

/** O que uma edição pode alcançar dentro de uma lição. */
export type AlvoDaEdicao =
  /** Um bloco de conteúdo — prosa, aviso, lâmina, verificação. */
  | { tipo: 'BLOCO'; variante: AudienceVariant; secaoId: string; blocoId: string }
  /** O título de uma seção da lição. */
  | { tipo: 'TITULO_DA_SECAO'; variante: AudienceVariant; secaoId: string };

export interface EdicaoEditorial {
  id: string;
  licaoId: string;
  alvo: AlvoDaEdicao;
  /**
   * O bloco (ou título) como ficou depois da edição.
   *
   * Guarda-se o objeto inteiro, e não um recorte: um `CHECKPOINT` tem
   * pergunta, alternativas, resposta certa e explicação, e editar só a
   * pergunta deixando a explicação contradizê-la é o tipo de incoerência que
   * ninguém percebe até o aluno reclamar.
   */
  conteudo: LessonBlock | string;
  /** Como estava antes. É o que permite desfazer e comparar. */
  anterior: LessonBlock | string;
  editadaPor: string;
  editadaEm: string;
  /** Por que a mudança foi feita. Aparece no histórico. */
  motivo?: string;
}

/**
 * Identificador estável da edição.
 *
 * Derivado do alvo, e não sorteado: editar o mesmo bloco duas vezes atualiza
 * a mesma edição em vez de empilhar duas, e a camada não cresce sem limite.
 */
export function idDaEdicao(licaoId: string, alvo: AlvoDaEdicao): string {
  const sufixo =
    alvo.tipo === 'BLOCO'
      ? `${alvo.variante}.${alvo.secaoId}.${alvo.blocoId}`
      : `${alvo.variante}.${alvo.secaoId}.titulo`;
  return `ed_${licaoId}__${sufixo}`;
}

/**
 * Aplica a camada editorial sobre a lição publicada.
 *
 * Função pura: recebe a lição como o catálogo a publicou e as edições, e
 * devolve a lição como ela deve ser lida. Não conhece armazenamento, o que a
 * torna testável sem navegador e reutilizável tanto na tela quanto na geração
 * do livro.
 */
export function aplicarEdicoes(
  licao: AcademyLesson,
  edicoes: EdicaoEditorial[]
): AcademyLesson {
  const minhas = edicoes.filter((e) => e.licaoId === licao.id);
  if (minhas.length === 0) return licao;

  const porAlvo = new Map(minhas.map((e) => [e.id, e]));
  const variantes = { ...licao.variants } as AcademyLesson['variants'];
  let mudou = false;

  for (const nomeDaVariante of Object.keys(variantes) as AudienceVariant[]) {
    const variante = variantes[nomeDaVariante];
    if (!variante) continue;

    const secoes = variante.sections.map((secao) => {
      const idTitulo = idDaEdicao(licao.id, {
        tipo: 'TITULO_DA_SECAO',
        variante: nomeDaVariante,
        secaoId: secao.id,
      });
      const edicaoDoTitulo = porAlvo.get(idTitulo);

      const blocos = (secao.blocks ?? []).map((bloco) => {
        const idBloco = idDaEdicao(licao.id, {
          tipo: 'BLOCO',
          variante: nomeDaVariante,
          secaoId: secao.id,
          blocoId: bloco.id,
        });
        const edicao = porAlvo.get(idBloco);
        if (!edicao || typeof edicao.conteudo === 'string') return bloco;
        mudou = true;
        return edicao.conteudo;
      });

      if (edicaoDoTitulo && typeof edicaoDoTitulo.conteudo === 'string') {
        mudou = true;
        return { ...secao, title: edicaoDoTitulo.conteudo, blocks: blocos };
      }
      return { ...secao, blocks: blocos };
    });

    variantes[nomeDaVariante] = { ...variante, sections: secoes };
  }

  if (!mudou) return licao;
  return { ...licao, variants: variantes, updatedAt: new Date().toISOString() };
}

/** Aplica a camada a uma coleção inteira, preservando a ordem. */
export function aplicarEdicoesEmLote(
  licoes: AcademyLesson[],
  edicoes: EdicaoEditorial[]
): AcademyLesson[] {
  if (edicoes.length === 0) return licoes;
  return licoes.map((l) => aplicarEdicoes(l, edicoes));
}

/**
 * Texto legível de um bloco, para busca e comparação.
 *
 * Quem procura "onde está aquele erro de concordância" digita a frase, não o
 * identificador do bloco. Isto é o que torna a busca possível.
 */
export function textoDoBloco(bloco: LessonBlock): string {
  switch (bloco.kind) {
    case 'MARKDOWN':
      return bloco.markdown;
    case 'CALLOUT':
      return `${bloco.title}\n${bloco.text}`;
    case 'CHECKPOINT':
      return [bloco.question, ...bloco.options, bloco.explanation].join('\n');
    case 'SLIDES':
      return bloco.slides
        .map((s) => [s.heading, s.body, s.note].filter(Boolean).join('\n'))
        .join('\n\n');
    case 'AUDIO_EXAMPLE':
      return [bloco.title, bloco.description].filter(Boolean).join('\n');
    case 'INTERVAL_LAB':
    case 'CHORD_LAB':
      return [bloco.title, bloco.prompt].filter(Boolean).join('\n');
    case 'SCALE_LAB':
      return bloco.title;
    case 'STAFF':
      return [bloco.title, bloco.caption].filter(Boolean).join('\n');
    case 'DIAGRAM':
      return [bloco.title, bloco.caption].filter(Boolean).join('\n');
    default:
      return '';
  }
}

/**
 * Um bloco é editável como texto?
 *
 * Prosa, aviso, lâmina e verificação são texto que alguém escreveu e alguém
 * revisa. Laboratório sonoro, pauta e diagrama são gerados a partir de notas
 * musicais — editá-los como texto produziria um diagrama quebrado, não uma
 * correção. Estes se alteram pelos próprios campos.
 */
export function blocoEhTextual(bloco: LessonBlock): boolean {
  return ['MARKDOWN', 'CALLOUT', 'CHECKPOINT', 'SLIDES'].includes(bloco.kind);
}
