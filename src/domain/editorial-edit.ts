import { AcademyLesson, LessonBlock, AudienceVariant } from './academy';
import { Questao } from './booklet';

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
export type EditTarget =
  /** Um bloco de conteúdo — prosa, aviso, lâmina, verificação. */
  | { tipo: 'BLOCO'; variante: AudienceVariant; secaoId: string; blocoId: string }
  /** O título de uma seção da lição. */
  | { tipo: 'TITULO_DA_SECAO'; variante: AudienceVariant; secaoId: string }
  /**
   * Uma **questão** — de atividade, de simulado ou de prova.
   *
   * Ficou de fora da primeira versão desta camada, e a consequência era
   * concreta: havia 174 questões no curso de Teoria e nenhuma delas podia ser
   * corrigida. Ver um erro numa alternativa e não poder consertá-lo é
   * exatamente o defeito que esta camada existe para não ter.
   *
   * A questão pertence ao capítulo, e não à lição — por isso `capitulo` em vez
   * de `secaoId`. O identificador da edição continua saindo do alvo, e não de
   * sorteio: corrigir duas vezes a mesma questão deixa **uma** edição.
   */
  | { tipo: 'QUESTAO'; capitulo: number; questaoId: string };

export interface EditorialEdit {
  id: string;
  lessonId: string;
  alvo: EditTarget;
  /**
   * O bloco (ou título) como ficou depois da edição.
   *
   * Guarda-se o objeto inteiro, e não um recorte: um `CHECKPOINT` tem
   * pergunta, alternativas, resposta certa e explicação, e editar só a
   * pergunta deixando a explicação contradizê-la é o tipo de incoerência que
   * ninguém percebe até o aluno reclamar.
   */
  conteudo: LessonBlock | Questao | string;
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
export function editId(lessonId: string, alvo: EditTarget): string {
  /**
   * `switch` exaustivo, e não ternário.
   *
   * O ternário anterior tratava "não é bloco" como "é título de seção" — e no
   * dia em que um terceiro alvo apareceu, ele produziu silenciosamente um
   * identificador de título para uma questão. Duas questões diferentes
   * colidiriam na mesma edição, e a correção de uma apagaria a da outra.
   *
   * Com `switch`, o compilador acusa o alvo que ninguém tratou.
   */
  switch (alvo.tipo) {
    case 'BLOCO':
      return `ed_${lessonId}__${alvo.variante}.${alvo.secaoId}.${alvo.blocoId}`;
    case 'TITULO_DA_SECAO':
      return `ed_${lessonId}__${alvo.variante}.${alvo.secaoId}.titulo`;
    case 'QUESTAO':
      return `ed_${lessonId}__questao.${alvo.capitulo}.${alvo.questaoId}`;
  }
}

/**
 * Aplica a camada editorial sobre a lição publicada.
 *
 * Função pura: recebe a lição como o catálogo a publicou e as edições, e
 * devolve a lição como ela deve ser lida. Não conhece armazenamento, o que a
 * torna testável sem navegador e reutilizável tanto na tela quanto na geração
 * do livro.
 */
export function applyEdits(
  licao: AcademyLesson,
  edicoes: EditorialEdit[]
): AcademyLesson {
  const minhas = edicoes.filter((e) => e.lessonId === licao.id);
  if (minhas.length === 0) return licao;

  const porAlvo = new Map(minhas.map((e) => [e.id, e]));
  const variantes = { ...licao.variants } as AcademyLesson['variants'];
  let mudou = false;

  for (const nomeDaVariante of Object.keys(variantes) as AudienceVariant[]) {
    const variante = variantes[nomeDaVariante];
    if (!variante) continue;

    const secoes = variante.sections.map((secao) => {
      const idTitulo = editId(licao.id, {
        tipo: 'TITULO_DA_SECAO',
        variante: nomeDaVariante,
        secaoId: secao.id,
      });
      const edicaoDoTitulo = porAlvo.get(idTitulo);

      const blocos = (secao.blocks ?? []).map((bloco) => {
        const idBloco = editId(licao.id, {
          tipo: 'BLOCO',
          variante: nomeDaVariante,
          secaoId: secao.id,
          blocoId: bloco.id,
        });
        const edicao = porAlvo.get(idBloco);
        /**
         * `kind` estreita para bloco.
         *
         * Desde que a camada passou a guardar questão também, `conteudo` é uma
         * união — e uma questão gravada por engano num alvo de bloco entraria
         * na lição como se fosse conteúdo. O compilador não pegaria: as duas
         * são objeto.
         */
        if (!edicao || typeof edicao.conteudo === 'string' || !('kind' in edicao.conteudo)) {
          return bloco;
        }
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
export function applyEditsToMany(
  licoes: AcademyLesson[],
  edicoes: EditorialEdit[]
): AcademyLesson[] {
  if (edicoes.length === 0) return licoes;
  return licoes.map((l) => applyEdits(l, edicoes));
}

/**
 * Texto legível de um bloco, para busca e comparação.
 *
 * Quem procura "onde está aquele erro de concordância" digita a frase, não o
 * identificador do bloco. Isto é o que torna a busca possível.
 */
export function blockText(bloco: LessonBlock): string {
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
export function isTextualBlock(bloco: LessonBlock): boolean {
  return ['MARKDOWN', 'CALLOUT', 'CHECKPOINT', 'SLIDES'].includes(bloco.kind);
}

/**
 * Aplica a camada editorial sobre as questões de um capítulo.
 *
 * Mesmo desenho dos blocos, e pela mesma razão: as questões são **conteúdo
 * publicado**, e `conteudoPublicado()` as reescreve quando a versão do
 * catálogo sobe. Guardar a correção junto delas significaria perdê-la na
 * próxima publicação — e perdê-la em silêncio.
 *
 * Função pura. Recebe as questões como o catálogo as publicou e devolve como
 * devem ser lidas.
 */
export function applyEditsToQuestions(
  capitulo: number,
  questoes: Questao[],
  edicoes: EditorialEdit[]
): Questao[] {
  const minhas = edicoes.filter(
    (e) => e.alvo.tipo === 'QUESTAO' && e.alvo.capitulo === capitulo
  );
  if (minhas.length === 0) return questoes;

  const porId = new Map(
    minhas.map((e) => [(e.alvo as { questaoId: string }).questaoId, e.conteudo as Questao])
  );

  return questoes.map((q) => porId.get(q.id) ?? q);
}

/**
 * A questão é editável em todos os campos que a tornam certa ou errada?
 *
 * Existe como função porque a tela precisa saber o que oferecer, e porque
 * editar só o enunciado deixando a explicação contradizê-lo é o tipo de
 * incoerência que ninguém percebe até o aluno reclamar.
 */
export const CAMPOS_EDITAVEIS_DA_QUESTAO = [
  'prompt',
  'choices',
  'resposta',
  'explanation',
] as const;

export function questionEditIsComplete(antes: Questao, depois: Questao): boolean {
  return CAMPOS_EDITAVEIS_DA_QUESTAO.every((campo) => campo in depois && campo in antes);
}

// ---------------------------------------------------------------------------
// Lição criada pela instituição
// ---------------------------------------------------------------------------

/**
 * Uma lição que a instituição escreveu, e não o catálogo publicou.
 *
 * O QUE FALTAVA
 * -------------
 * Dava para corrigir o que existe e não dava para **acrescentar**. Quem
 * percebesse que falta um capítulo sobre modulação não tinha como escrevê-lo
 * sem mexer em `src/data/` e publicar uma versão nova do catálogo — ou seja,
 * sem ser programador.
 *
 * ONDE ELA VIVE
 * -------------
 * Na mesma chave da camada editorial, e **nunca** em `LESSONS`. A razão é a
 * de sempre: `conteudoPublicado()` reescreve as chaves de conteúdo a cada
 * versão do catálogo. Uma lição escrita à mão gravada lá seria apagada em
 * silêncio na próxima publicação — e desta vez o prejuízo não seria uma
 * correção de vírgula, seria uma aula inteira.
 */
export interface EditorialLesson {
  id: string;
  moduleId: string;
  courseId: string;
  /** Onde entra na ordem do módulo. */
  order: number;
  title: string;
  /**
   * Os blocos, montados a partir das estruturas que já existem.
   *
   * Nada de formato novo: a lição criada usa os mesmos `LessonBlock` das
   * publicadas, e por isso é lida, exportada para o livro e editada pelos
   * mesmos caminhos. Um segundo formato dobraria todo o resto.
   */
  blocks: LessonBlock[];
  durationMinutes: number;
  criadaPor: string;
  criadaEm: string;
}

/**
 * Junta o que a instituição escreveu ao que o catálogo publicou.
 *
 * Função pura, aplicada na leitura — o mesmo desenho da sobreposição de
 * edições. As criadas entram **na ordem do módulo**, e não empilhadas no fim:
 * uma lição escrita para ser a terceira precisa aparecer como terceira.
 */
export function mergeCreatedLessons(
  publicadas: AcademyLesson[],
  criadas: EditorialLesson[]
): AcademyLesson[] {
  if (criadas.length === 0) return publicadas;

  const convertidas: AcademyLesson[] = criadas.map((c) => ({
    id: c.id,
    moduleId: c.moduleId,
    courseId: c.courseId,
    canonicalContentId: c.id,
    order: c.order,
    durationMinutes: c.durationMinutes,
    objectives: [],
    skills: [],
    activityIds: [],
    variants: {
      TRADITIONAL: { title: c.title, summary: '', sections: [{ id: 's1', title: c.title, contentMarkdown: '', blocks: c.blocks }] },
    } as AcademyLesson['variants'],
    createdAt: c.criadaEm,
    updatedAt: c.criadaEm,
  }));

  return [...publicadas, ...convertidas].sort((a, b) => {
    if (a.moduleId !== b.moduleId) return a.moduleId.localeCompare(b.moduleId);
    return a.order - b.order;
  });
}

/**
 * Uma lição criada é válida?
 *
 * Título e ao menos um bloco. Não é burocracia: lição sem bloco entra no
 * catálogo como uma entrada que abre vazia — e o aluno conclui que a
 * plataforma quebrou, não que ninguém escreveu ainda.
 */
export function createdLessonIsValid(licao: EditorialLesson): boolean {
  return licao.title.trim().length > 2 && licao.blocks.length > 0;
}
