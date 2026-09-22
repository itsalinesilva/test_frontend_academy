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
  | { tipo: 'QUESTAO'; capitulo: number; questaoId: string }
  /**
   * 🔴 A LISTA INTEIRA DE BLOCOS DE UMA SEÇÃO.
   *
   * O alvo `BLOCO` corrige um bloco que **já existe**. Com ele e só com ele,
   * a camada editorial sabia consertar uma frase e não sabia acrescentar um
   * pentagrama, tirar um aviso repetido nem trocar a ordem de dois trechos.
   *
   * Reordenar e inserir por índice seria pior: dois editores mexendo na mesma
   * seção produziriam índices que já não apontam para o que apontavam. A lista
   * inteira é uma decisão só, e a última vence — que é o comportamento que
   * quem edita espera de um editor.
   *
   * A ordem de aplicação importa e está em `applyEdits`: a estrutura entra
   * antes do conteúdo, para que a correção de um bloco pouse sobre a lista
   * nova e não sobre a antiga.
   */
  | { tipo: 'BLOCOS_DA_SECAO'; variante: AudienceVariant; secaoId: string };

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
  conteudo: LessonBlock | LessonBlock[] | Questao | string;
  /** Como estava antes. É o que permite desfazer e comparar. */
  anterior: LessonBlock | LessonBlock[] | string;
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
    case 'BLOCOS_DA_SECAO':
      return `ed_${lessonId}__${alvo.variante}.${alvo.secaoId}.blocos`;
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

      /**
       * 🔴 A ESTRUTURA ENTRA ANTES DO CONTEÚDO.
       *
       * Se a correção de um bloco fosse aplicada primeiro, ela pousaria sobre
       * a lista antiga e sumiria quando a lista nova substituísse tudo. Quem
       * editasse um parágrafo e depois acrescentasse um pentagrama perderia o
       * parágrafo — sem nada acusar.
       */
      const idDaLista = editId(licao.id, {
        tipo: 'BLOCOS_DA_SECAO',
        variante: nomeDaVariante,
        secaoId: secao.id,
      });
      const edicaoDaLista = porAlvo.get(idDaLista);

      const partida = Array.isArray(edicaoDaLista?.conteudo)
        ? ((mudou = true), edicaoDaLista!.conteudo as LessonBlock[])
        : (secao.blocks ?? []);

      const blocos = partida.map((bloco) => {
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
 * 🔴 BLOCOS MUSICAIS TAMBÉM SE EDITAM.
 *
 * `isTextualBlock` decidia o que tinha lápis, e deixava de fora exatamente o
 * que faz a plataforma ser de música: o pentagrama, o teclado, o exemplo
 * sonoro, os laboratórios e o diagrama.
 *
 * A consequência era concreta. Uma pauta com a nota errada ou um exemplo
 * tocando o acorde trocado só podia ser consertado mudando o código e
 * publicando de novo — e quem revisa conteúdo não é quem publica código. Erro
 * que depende de outra pessoa para ser corrigido é erro que fica.
 */
export function isMusicalBlock(bloco: LessonBlock): boolean {
  return [
    'STAFF',
    'KEYBOARD',
    'AUDIO_EXAMPLE',
    'DIAGRAM',
    'INTERVAL_LAB',
    'CHORD_LAB',
    'SCALE_LAB',
    /** A biblioteca funcional — ver `BlocosFuncionais.tsx`. */
    'PLAYER',
    'PIANO_ROLL',
    'TUNER_LAB',
  ].includes(bloco.kind);
}

/**
 * Blocos de apresentação: organizam o texto sem serem texto nem som.
 *
 * Tabela, citação, linha do tempo e sessão de exercícios. Estão aqui, e não
 * em `isTextualBlock`, porque a busca por texto os trata de outro jeito — e
 * porque o editor deles tem campos próprios, não uma caixa de markdown.
 */
export function isCompositionBlock(bloco: LessonBlock): boolean {
  return ['TABELA', 'CITACAO', 'LINHA_DO_TEMPO', 'SESSAO_DE_EXERCICIOS'].includes(bloco.kind);
}

/**
 * O bloco pode ser editado no lugar?
 *
 * `VIDEO_PLACEHOLDER` fica de fora, e é a única exclusão: ele registra onde a
 * aula gravada entrará, e a plataforma não hospeda vídeo (ADR-004). Um editor
 * para ele produziria um campo que não leva a lugar nenhum.
 */
export function isEditableBlock(bloco: LessonBlock): boolean {
  return isTextualBlock(bloco) || isMusicalBlock(bloco) || isCompositionBlock(bloco);
}

/**
 * Os problemas de um bloco, antes de gravar.
 *
 * 🔴 VALIDAR AQUI, E NÃO NA TELA. Gravar uma pauta com nota que o
 * renderizador não entende produz lição com pentagrama vazio — e quem gravou
 * já saiu da tela quando o aluno encontra. A camada recusa na hora, com o
 * motivo escrito.
 *
 * Devolve lista vazia quando está tudo certo.
 */
export function problemasDoBloco(bloco: LessonBlock): string[] {
  const erros: string[] = [];
  const cientifica = /^[A-Ga-g](#|b)?-?\d$/;

  const conferirNotas = (notas: readonly string[], onde: string) => {
    if (notas.length === 0) {
      erros.push(`${onde}: nenhuma nota. Um bloco musical sem nota não mostra nada.`);
      return;
    }
    for (const n of notas) {
      if (!cientifica.test(n.trim())) {
        erros.push(`${onde}: "${n}" não é notação científica — use dó central como C4.`);
      }
    }
  };

  switch (bloco.kind) {
    case 'MARKDOWN':
      if (!bloco.markdown.trim()) erros.push('O texto está vazio.');
      break;

    case 'CALLOUT':
      if (!bloco.title.trim()) erros.push('O destaque está sem título.');
      if (!bloco.text.trim()) erros.push('O destaque está sem texto.');
      break;

    case 'CHECKPOINT':
      if (!bloco.question.trim()) erros.push('A verificação está sem pergunta.');
      if (bloco.options.length < 2) erros.push('A verificação precisa de pelo menos duas alternativas.');
      if (bloco.options.some((o) => !o.trim())) erros.push('Há alternativa em branco.');
      if (bloco.correctIndex < 0 || bloco.correctIndex >= bloco.options.length) {
        erros.push('A resposta certa aponta para uma alternativa que não existe.');
      }
      if (!bloco.explanation.trim()) {
        erros.push('A verificação está sem explicação — ela é a parte que ensina.');
      }
      break;

    case 'SLIDES':
      if (bloco.slides.length === 0) erros.push('Não há lâmina nenhuma.');
      if (bloco.slides.some((l) => !l.heading.trim())) erros.push('Há lâmina sem título.');
      break;

    case 'STAFF':
      conferirNotas(bloco.notes, 'Pauta');
      if (bloco.timeSignature && !/^\d+\/\d+$/.test(bloco.timeSignature)) {
        erros.push(`Fórmula de compasso inválida: "${bloco.timeSignature}". Use 4/4, 3/4, 6/8.`);
      }
      break;

    case 'KEYBOARD':
      if (bloco.highlightNotes?.length) conferirNotas(bloco.highlightNotes, 'Teclado');
      if (bloco.octaves !== undefined && (bloco.octaves < 1 || bloco.octaves > 4)) {
        erros.push('O teclado cabe entre uma e quatro oitavas.');
      }
      break;

    case 'AUDIO_EXAMPLE':
      conferirNotas(bloco.notes, 'Exemplo sonoro');
      if (!bloco.title.trim()) erros.push('O exemplo sonoro está sem título.');
      if (bloco.bpm !== undefined && (bloco.bpm < 20 || bloco.bpm > 300)) {
        erros.push('O andamento fica entre 20 e 300 batidas por minuto.');
      }
      break;

    case 'INTERVAL_LAB':
      conferirNotas([bloco.lowerNote, bloco.upperNote], 'Laboratório de intervalo');
      break;

    case 'CHORD_LAB':
      conferirNotas(bloco.notes, 'Laboratório de acorde');
      break;

    case 'SCALE_LAB':
      conferirNotas([bloco.tonic], 'Laboratório de escala');
      break;

    case 'DIAGRAM':
      if (!bloco.title.trim()) erros.push('O diagrama está sem título.');
      break;

    case 'VIDEO_PLACEHOLDER':
      break;

    // ---- a biblioteca funcional -------------------------------------------
    case 'PLAYER':
      if (!bloco.title.trim()) erros.push('O player está sem título.');
      conferirNotas(bloco.notes, 'Player');
      if (bloco.bpm !== undefined && (bloco.bpm < 20 || bloco.bpm > 300)) {
        erros.push('O andamento fica entre 20 e 300 batidas por minuto.');
      }
      break;

    case 'PIANO_ROLL':
      if (bloco.notas.length === 0) {
        erros.push('O rolo de piano está sem nota nenhuma.');
      }
      conferirNotas(
        bloco.notas.map((n) => n.nota),
        'Rolo de piano'
      );
      for (const n of bloco.notas) {
        if (n.duracaoEmTempos <= 0) {
          erros.push(`A nota "${n.nota}" tem duração zero — não apareceria no desenho.`);
        }
        if (n.inicioEmTempos < 0) erros.push(`A nota "${n.nota}" começa antes do tempo zero.`);
      }
      break;

    case 'TUNER_LAB':
      if (!bloco.title.trim()) erros.push('O laboratório de afinação está sem título.');
      conferirNotas([bloco.notaAlvo], 'Laboratório de afinação');
      if (bloco.toleranciaCents !== undefined && bloco.toleranciaCents <= 0) {
        /**
         * Tolerância zero é inalcançável: nenhuma voz humana fica exatamente
         * na frequência, e o bloco reprovaria todo mundo para sempre.
         */
        erros.push('A tolerância precisa ser maior que zero — ninguém canta exato.');
      }
      break;

    case 'TABELA':
      if (bloco.colunas.length === 0) erros.push('A tabela está sem coluna nenhuma.');
      if (bloco.linhas.length === 0) erros.push('A tabela está sem linha nenhuma.');
      for (const [i, linha] of bloco.linhas.entries()) {
        if (linha.length !== bloco.colunas.length) {
          /**
           * Linha com tamanho diferente do cabeçalho desalinha a tabela
           * inteira, e quem lê associa o valor à coluna errada.
           */
          erros.push(
            `A linha ${i + 1} tem ${linha.length} células e o cabeçalho tem ${bloco.colunas.length}.`
          );
        }
      }
      break;

    case 'CITACAO':
      if (!bloco.texto.trim()) erros.push('A citação está vazia.');
      if (!bloco.fonte.trim()) {
        erros.push('A citação está sem fonte — citação sem atribuição é plágio começando.');
      }
      break;

    case 'LINHA_DO_TEMPO':
      if (!bloco.title.trim()) erros.push('A linha do tempo está sem título.');
      if (bloco.marcos.length < 2) {
        /** Um marco só não é linha do tempo: é uma data solta. */
        erros.push('A linha do tempo precisa de pelo menos dois marcos.');
      }
      for (const m of bloco.marcos) {
        if (!m.titulo.trim()) erros.push(`O marco de ${m.ano} está sem título.`);
        if (!Number.isInteger(m.ano)) erros.push(`"${m.ano}" não é um ano.`);
      }
      break;

    case 'SESSAO_DE_EXERCICIOS':
      if (!bloco.title.trim()) erros.push('A sessão está sem título.');
      if (bloco.questoes.length === 0) erros.push('A sessão está sem questão nenhuma.');

      for (const [i, q] of bloco.questoes.entries()) {
        const onde = `Questão ${i + 1}`;
        if (!q.enunciado.trim()) erros.push(`${onde}: sem enunciado.`);
        if (q.alternativas.length < 2) erros.push(`${onde}: precisa de pelo menos duas alternativas.`);
        if (q.alternativas.some((a) => !a.trim())) erros.push(`${onde}: há alternativa em branco.`);
        if (q.corretaIndex < 0 || q.corretaIndex >= q.alternativas.length) {
          erros.push(`${onde}: a resposta certa aponta para uma alternativa que não existe.`);
        }
        if (!q.explicacao.trim()) {
          erros.push(`${onde}: sem explicação — é a parte que ensina quem errou.`);
        }
        if (q.notas?.length) conferirNotas(q.notas, onde);
      }
      break;
  }

  return erros;
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
