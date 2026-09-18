import { LessonBlock } from '../../domain/academy';

/**
 * Capítulos XVI a XXX — da série harmônica ao andamento.
 *
 * É o trecho central do curso: aqui entram escalas maiores e menores,
 * compasso, métrica, tonalidade e modulação. São os capítulos que mais
 * pedem laboratório, porque tratam de relações que só se fixam pelo ouvido.
 */
export const BLOCOS_16_30: Record<number, LessonBlock[]> = {
  // -------------------------------------------------------------------------
  16: [
    {
      kind: 'MARKDOWN',
      id: 'c16_intro',
      markdown:
        'Uma corda posta a vibrar não produz **um** som. Ela vibra em toda a sua extensão e, simultaneamente, em metades, terços, quartos, quintos — cada fração produzindo um som próprio, mais agudo e mais fraco.\n\n' +
        'O som da vibração total é o **fundamental**, o que se identifica como "a nota". Os demais são os **harmônicos**, ou sons parciais. Não se ouvem separadamente: funde-se tudo numa impressão única, e essa impressão é o **timbre**.\n\n' +
        'A série é o fato acústico do qual quase toda a teoria ocidental deriva. Não é metáfora: os intervalos consonantes, a tríade maior, a função de dominante e o próprio problema do temperamento saem daqui.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c16_serie',
      markdown:
        '## A série, sobre dó\n\n' +
        '| Nº | Nota | Intervalo em relação ao anterior |\n' +
        '|---|---|---|\n' +
        '| 1 | dó | fundamental |\n' +
        '| 2 | dó | oitava justa |\n' +
        '| 3 | sol | quinta justa |\n' +
        '| 4 | dó | quarta justa |\n' +
        '| 5 | mi | terça maior |\n' +
        '| 6 | sol | terça menor |\n' +
        '| 7 | si♭ *(baixo)* | terça menor |\n' +
        '| 8 | dó | segunda maior |\n' +
        '| 9 | ré | segunda maior |\n' +
        '| 10 | mi | segunda menor |\n' +
        '| 11 | fá♯ *(desviado)* | segunda menor |\n' +
        '| 12 | sol | — |\n\n' +
        'Duas observações decisivas.\n\n' +
        'Primeira: os **intervalos vão diminuindo** à medida que se sobe — oitava, quinta, quarta, terça maior, terça menor, e assim por diante. A série começa larga e vai se fechando.\n\n' +
        'Segunda: os harmônicos **4, 5 e 6** formam dó–mi–sol. A **tríade maior** não foi inventada por ninguém: ela estava na física da corda, e a música ocidental a encontrou.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c16_audio_serie',
      title: 'Os primeiros harmônicos, um a um',
      description:
        'Aproximação temperada dos oito primeiros parciais sobre dó. Repare que as distâncias encolhem à medida que se sobe.',
      notes: ['C2', 'C3', 'G3', 'C4', 'E4', 'G4', 'A#4', 'C5'],
      playMode: 'SEQUENCE',
      bpm: 66,
    },
    {
      kind: 'CHORD_LAB',
      id: 'c16_lab_triade',
      title: 'Harmônicos 4, 5 e 6',
      notes: ['C4', 'E4', 'G4'],
      prompt: 'A tríade maior, exatamente como a série a apresenta.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c16_temperamento',
      markdown:
        '## O problema que a série cria\n\n' +
        'Os harmônicos **7** e **11** não coincidem com nenhuma nota do sistema. O sétimo é sensivelmente mais baixo que o si♭ temperado; o décimo primeiro fica entre fá e fá♯. Escrevê-los é uma aproximação, e a tabela acima assinala isso.\n\n' +
        'Pior: empilhar doze quintas justas puras **não** fecha em sete oitavas. Sobra um excedente pequeno e teimoso, conhecido como coma pitagórica. O sistema natural simplesmente não fecha.\n\n' +
        'O **temperamento igual** resolve por decreto: divide a oitava em doze semitons rigorosamente iguais, o que torna cada quinta ligeiramente estreita e cada terça maior sensivelmente larga em relação às naturais. Nenhum intervalo além da oitava fica exato — e, em troca, toca-se em todas as tonalidades no mesmo instrumento.\n\n' +
        'Todo instrumento de altura fixa que existe hoje vive desse acordo.',
    },
    {
      kind: 'CALLOUT',
      id: 'c16_call',
      type: 'info',
      title: 'Por que dois instrumentos soam diferentes',
      text:
        'Tocando a mesma nota, a flauta e o violino produzem o mesmo fundamental. O que difere é QUAIS harmônicos aparecem e com que força. A flauta produz poucos parciais, e por isso soa "limpa"; o violino produz muitos, e soa "rica". Timbre é a assinatura harmônica de um corpo vibrante.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c16_check',
      question: 'Os harmônicos 4, 5 e 6 de uma fundamental formam o quê?',
      options: [
        'Uma escala maior',
        'Uma tríade maior',
        'Uma tríade menor',
        'Um acorde de sétima',
      ],
      correctIndex: 1,
      explanation:
        'Sobre dó, os parciais 4, 5 e 6 são dó, mi e sol — a tríade maior. A consonância desse acorde tem causa física, não convenção.',
    },
  ],

  // -------------------------------------------------------------------------
  17: [
    {
      kind: 'MARKDOWN',
      id: 'c17_intro',
      markdown:
        '**Consonância** é a impressão de repouso produzida por dois sons simultâneos. **Dissonância** é a impressão de tensão, que pede continuação.\n\n' +
        'A classificação não é arbitrária: acompanha de perto a ordem da série harmônica. Quanto mais cedo dois sons aparecem como parciais próximos de uma mesma fundamental, mais consonantes soam. A razão entre as frequências é simples — 2:1, 3:2, 4:3 — e o ouvido registra essa simplicidade como estabilidade.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c17_classes',
      markdown:
        '## As três classes\n\n' +
        '**Consonâncias perfeitas** — uníssono, oitava, quinta justa e quarta justa. Soam vazias e estáveis. Razões simples: 1:1, 2:1, 3:2, 4:3.\n\n' +
        '**Consonâncias imperfeitas** — terças e sextas, maiores e menores. Soam plenas e agradáveis, mas com menos peso de repouso que as perfeitas. São elas que dão cor à harmonia.\n\n' +
        '**Dissonâncias** — segundas, sétimas e todos os intervalos aumentados e diminutos. Pedem resolução.\n\n' +
        'Repare que a classificação segue a inversão: as perfeitas invertem em perfeitas, as imperfeitas em imperfeitas, as dissonâncias em dissonâncias. O sistema é coerente consigo mesmo.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c17_lab_5J',
      title: 'Quinta justa — consonância perfeita',
      lowerNote: 'C4',
      upperNote: 'G4',
      prompt: 'Estável e vazia. Não pede continuação.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c17_lab_3M',
      title: 'Terça maior — consonância imperfeita',
      lowerNote: 'C4',
      upperNote: 'E4',
      prompt: 'Estável, mas colorida. Compare o peso com a quinta.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c17_lab_7m',
      title: 'Sétima menor — dissonância',
      lowerNote: 'C4',
      upperNote: 'A#4',
      prompt: 'Ouça a inquietação. Este intervalo quer ir a algum lugar.',
    },
    {
      kind: 'CALLOUT',
      id: 'c17_call',
      type: 'historical',
      title: 'O caso da quarta',
      text:
        'A quarta justa é a consonância mais disputada da teoria. Contra o baixo, ela soa instável e a tradição a trata como dissonância que precisa de preparação e resolução; entre vozes superiores, é consonância pacífica. A mesma razão acústica, dois julgamentos — prova de que a classificação depende também do contexto, e não só do número.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c17_resolucao',
      markdown:
        '## Dissonância não é defeito\n\n' +
        'É costume ouvir "dissonante" como sinônimo de feio. Não é isso que o termo significa aqui.\n\n' +
        'A dissonância é o **motor** da música tonal. É ela que cria expectativa, e a consonância que a satisfaz. Uma peça só de consonâncias não vai a lugar nenhum — falta-lhe o desequilíbrio que faz querer continuar ouvindo.\n\n' +
        'O que a prática tonal regula não é o uso da dissonância, mas a sua **preparação** e a sua **resolução**: de onde ela vem e para onde vai.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c17_check',
      question: 'A terça maior pertence a que classe?',
      options: [
        'Consonância perfeita',
        'Consonância imperfeita',
        'Dissonância',
        'Depende da tonalidade',
      ],
      correctIndex: 1,
      explanation:
        'Terças e sextas são consonâncias imperfeitas: estáveis, porém com menos peso de repouso que uníssono, oitava, quinta e quarta.',
    },
  ],

  // -------------------------------------------------------------------------
  18: [
    {
      kind: 'MARKDOWN',
      id: 'c18_intro',
      markdown:
        'A escala maior é definida por **um padrão de distâncias**, e não pelas notas em si. O padrão, do primeiro ao oitavo grau:\n\n' +
        '**T — T — st — T — T — T — st**\n\n' +
        'Tom, tom, semitom, tom, tom, tom, semitom. Os semitons caem entre os graus **III–IV** e **VII–VIII**.\n\n' +
        'Aplicado a dó, o padrão dá exatamente as sete notas naturais — e é por isso que dó maior não tem acidentes. Aplicado a qualquer outra nota, o mesmo padrão obriga a acidentes, e são eles que formam a armadura.',
    },
    {
      kind: 'SCALE_LAB',
      id: 'c18_lab_do',
      title: 'Dó maior',
      tonic: 'C4',
      mode: 'MAJOR',
    },
    {
      kind: 'SCALE_LAB',
      id: 'c18_lab_sol',
      title: 'Sol maior — o mesmo padrão, um acidente',
      tonic: 'G4',
      mode: 'MAJOR',
    },
    {
      kind: 'MARKDOWN',
      id: 'c18_quintas',
      markdown:
        '## O ciclo das quintas\n\n' +
        'Construindo a escala maior sobre a **quinta** de dó, chega-se a sol — e aparece **um** sustenido: fá♯, exigido para que o semitom caia entre VII e VIII.\n\n' +
        'Sobre a quinta de sol, chega-se a ré — **dois** sustenidos. Sobre a quinta de ré, lá — **três**. O padrão se mantém: **cada quinta acima acrescenta um sustenido**.\n\n' +
        'Descendo por quintas — ou subindo por quartas — acontece o inverso: **cada quinta abaixo acrescenta um bemol**. Dó → fá (1♭) → si♭ (2♭) → mi♭ (3♭).\n\n' +
        'Percorrido inteiro, o ciclo passa pelas doze tonalidades e volta ao ponto de partida, o que só é possível graças ao temperamento igual.',
    },
    {
      kind: 'DIAGRAM',
      id: 'c18_ciclo',
      title: 'Ciclo das quintas',
      diagram: 'CIRCLE_OF_FIFTHS',
      caption: 'Sustenidos à direita, bemóis à esquerda, dó no topo, sem acidente nenhum.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c18_ordem',
      markdown:
        '## A ordem dos acidentes, e como ler a armadura\n\n' +
        'Os acidentes não entram na armadura em qualquer ordem.\n\n' +
        '**Sustenidos**: fá, dó, sol, ré, lá, mi, si.\n' +
        '**Bemóis**: si, mi, lá, ré, sol, dó, fá — exatamente a ordem inversa.\n\n' +
        'Cada lista é uma sequência de quintas ascendentes ou descendentes, o que explica a simetria.\n\n' +
        'Daí saem duas regras práticas de leitura.\n\n' +
        'Com **sustenidos**: o último sustenido é a **sensível**; a tônica está **um semitom acima** dele. Três sustenidos, o último é sol♯, logo a tonalidade é lá maior.\n\n' +
        'Com **bemóis**: o **penúltimo bemol** é a própria tônica. Quatro bemóis — si♭, mi♭, lá♭, ré♭ —, o penúltimo é lá♭, logo lá♭ maior. A única exceção é fá maior, com um bemol só, que não tem penúltimo e se decora.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c18_tabela',
      markdown:
        '## As quinze armaduras maiores\n\n' +
        '| ♯ | Tonalidade | | ♭ | Tonalidade |\n' +
        '|---|---|---|---|---|\n' +
        '| 0 | dó | | 0 | dó |\n' +
        '| 1 | sol | | 1 | fá |\n' +
        '| 2 | ré | | 2 | si♭ |\n' +
        '| 3 | lá | | 3 | mi♭ |\n' +
        '| 4 | mi | | 4 | lá♭ |\n' +
        '| 5 | si | | 5 | ré♭ |\n' +
        '| 6 | fá♯ | | 6 | sol♭ |\n' +
        '| 7 | dó♯ | | 7 | dó♭ |\n\n' +
        'Quinze armaduras ao todo, porque dó aparece uma vez só e três pares são enarmônicos entre si.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c18_check',
      question: 'Uma armadura tem quatro sustenidos: fá♯, dó♯, sol♯, ré♯. Qual é a tonalidade maior?',
      options: ['Ré maior', 'Lá maior', 'Mi maior', 'Si maior'],
      correctIndex: 2,
      explanation:
        'O último sustenido é ré♯, que é a sensível. Um semitom acima está mi. Mi maior.',
    },
  ],

  // -------------------------------------------------------------------------
  19: [
    {
      kind: 'MARKDOWN',
      id: 'c19_intro',
      markdown:
        'O tempo musical não corre solto: agrupa-se em unidades regulares chamadas **compassos**, separadas por **barras verticais**.\n\n' +
        'Dentro de cada compasso há um número fixo de **tempos**, e o primeiro deles é naturalmente mais forte. É esse acento recorrente que produz a sensação de pulso organizado.\n\n' +
        'A **fórmula de compasso**, escrita no início da peça depois da clave e da armadura, declara a organização. Ela tem dois números, e o que cada um significa depende de o compasso ser simples ou composto.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c19_simples',
      markdown:
        '## Compasso simples\n\n' +
        'No compasso simples, **cada tempo se divide por dois**.\n\n' +
        'O número **de cima** indica quantos tempos há no compasso. O número **de baixo** indica qual figura vale um tempo, pela convenção 1 = semibreve, 2 = mínima, 4 = semínima, 8 = colcheia.\n\n' +
        '- **2/4** — dois tempos, semínima por tempo. Binário.\n' +
        '- **3/4** — três tempos, semínima por tempo. Ternário.\n' +
        '- **4/4** — quatro tempos, semínima por tempo. Quaternário.\n' +
        '- **3/8** — três tempos, colcheia por tempo.\n' +
        '- **2/2** — dois tempos, mínima por tempo.\n\n' +
        'Dois símbolos antigos sobrevivem: **C** equivale a 4/4, e **C cortado** equivale a 2/2. Não são as iniciais de "comum": vêm do círculo medieval que indicava divisão perfeita.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c19_composto',
      markdown:
        '## Compasso composto\n\n' +
        'No compasso composto, **cada tempo se divide por três**. Como o sistema de figuras não tem valor que se divida naturalmente por três, a unidade de tempo passa a ser uma **figura pontuada**.\n\n' +
        'E aqui a fórmula muda de sentido: o número de cima indica quantas **divisões** há no compasso, não quantos tempos.\n\n' +
        '- **6/8** — seis colcheias, agrupadas de três em três: **dois** tempos de colcheia pontuada.\n' +
        '- **9/8** — nove colcheias: **três** tempos.\n' +
        '- **12/8** — doze colcheias: **quatro** tempos.\n\n' +
        'Para achar o número real de tempos, **divide-se o número de cima por três**.\n\n' +
        'Todo compasso composto tem correspondente simples com o mesmo número de tempos: 6/8 ↔ 2/4, 9/8 ↔ 3/4, 12/8 ↔ 4/4. A diferença não é quantos tempos existem, mas como cada tempo se reparte por dentro.',
    },
    {
      kind: 'CALLOUT',
      id: 'c19_call',
      type: 'warning',
      title: '6/8 não é 3/4',
      text:
        'Os dois compassos contêm seis colcheias, e param por aí as semelhanças. Em 3/4 há TRÊS tempos de duas colcheias; em 6/8 há DOIS tempos de três colcheias. Os acentos caem em lugares diferentes, e a música soa outra. A alternância deliberada entre os dois — a hemíola — é um dos recursos rítmicos mais antigos que existem.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c19_audio_68',
      title: '6/8 — dois grupos de três',
      description: 'Ouça onde caem os acentos: na primeira e na quarta colcheia.',
      notes: ['C4', 'E4', 'G4', 'C5', 'G4', 'E4'],
      playMode: 'SEQUENCE',
      bpm: 160,
    },
    {
      kind: 'MARKDOWN',
      id: 'c19_alternados',
      markdown:
        '## Compassos alternados e irregulares\n\n' +
        'Nem toda música cabe em grupos de dois ou três iguais.\n\n' +
        'Os **compassos alternados** mudam de fórmula ao longo da peça, compasso a compasso — recurso comum na música do século XX e no canto de texto livre.\n\n' +
        'Os **compassos irregulares** — 5/8, 7/8, 11/8 — contêm um número de divisões que não é múltiplo de dois nem de três. Organizam-se internamente em grupos desiguais: 5/8 pode ser 3+2 ou 2+3, e a escolha muda inteiramente o caráter. Boas edições indicam o agrupamento na própria fórmula ou por meio das hastes.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c19_check',
      question: 'Quantos tempos tem um compasso 9/8?',
      options: ['Dois', 'Três', 'Quatro', 'Nove'],
      correctIndex: 1,
      explanation:
        'Compasso composto: divide-se o número de cima por três. Nove colcheias em grupos de três dão três tempos de colcheia pontuada.',
    },
  ],

  // -------------------------------------------------------------------------
  20: [
    {
      kind: 'MARKDOWN',
      id: 'c20_intro',
      markdown:
        '**Métrica** é a organização dos acentos dentro do compasso. O compasso diz quantos tempos existem; a métrica diz como eles pesam.\n\n' +
        'A hierarquia é constante e independe do estilo.\n\n' +
        '**Binária** (2 tempos): forte — fraco.\n' +
        '**Ternária** (3 tempos): forte — fraco — fraco.\n' +
        '**Quaternária** (4 tempos): forte — fraco — **meio-forte** — fraco.\n\n' +
        'O terceiro tempo do compasso quaternário é o detalhe que importa: ele recebe um acento secundário, mais leve que o do primeiro tempo e mais pesado que os demais. É por isso que o compasso de quatro tempos não soa como dois compassos de dois.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c20_niveis',
      markdown:
        '## Os níveis métricos\n\n' +
        'A acentuação não existe só dentro do compasso. Ela se reproduz em escalas maiores e menores ao mesmo tempo.\n\n' +
        'Abaixo do tempo, as **divisões**: a primeira colcheia de cada tempo é mais forte que a segunda.\n\n' +
        'Acima do compasso, a **hipermetria**: numa série de quatro compassos, o primeiro costuma funcionar como forte e o terceiro como meio-forte, exatamente como os tempos dentro do compasso. É o que faz uma frase de quatro compassos soar completa.\n\n' +
        'Essa recursividade — o mesmo padrão em várias escalas de tempo — é o que dá à música tonal a sua sensação de proporção.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c20_anacruse',
      markdown:
        '## Anacruse\n\n' +
        'Nem toda peça começa no tempo forte. A **anacruse** é a nota ou grupo de notas que antecede o primeiro tempo forte, formando um compasso inicial incompleto.\n\n' +
        'A convenção de escrita é rigorosa: o valor que falta ao compasso inicial é **descontado do compasso final**, de modo que os dois somados formem um compasso completo. Uma peça que começa com uma colcheia de anacruse termina com um compasso a que falta uma colcheia.\n\n' +
        'A anacruse não é detalhe de notação: ela muda o sentido da melodia. Cantar "para**bééns**" com o acento no lugar certo depende de reconhecer que a primeira sílaba é anacruse. Deslocar isso destrói a prosódia.',
    },
    {
      kind: 'CALLOUT',
      id: 'c20_call',
      type: 'tip',
      title: 'O acento métrico é presumido, não escrito',
      text:
        'Nenhuma partitura escreve acentos em todos os tempos fortes — seria ilegível e desnecessário. A acentuação métrica está subentendida na fórmula de compasso. Quando o compositor escreve um acento, é justamente porque quer ALGO DIFERENTE do padrão.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c20_check',
      question: 'Num compasso quaternário, qual tempo recebe o acento secundário?',
      options: ['O primeiro', 'O segundo', 'O terceiro', 'O quarto'],
      correctIndex: 2,
      explanation:
        'A hierarquia é forte, fraco, meio-forte, fraco. O terceiro tempo tem acento secundário, e é ele que distingue o quaternário de dois binários seguidos.',
    },
  ],

  // -------------------------------------------------------------------------
  21: [
    {
      kind: 'MARKDOWN',
      id: 'c21_intro',
      markdown:
        'A escala menor tem **três formas**, e todas as três pertencem à mesma tonalidade. Não são escalas concorrentes: são recursos que a música alterna conforme a necessidade.\n\n' +
        'A forma de base é a **natural**, cujo padrão é:\n\n' +
        '**T — st — T — T — st — T — T**\n\n' +
        'Os semitons caem entre II–III e V–VI. A diferença decisiva em relação à maior é a **terça menor** entre I e III, e é ela que produz o caráter.',
    },
    {
      kind: 'SCALE_LAB',
      id: 'c21_lab_natural',
      title: 'Lá menor natural',
      tonic: 'A3',
      mode: 'NATURAL_MINOR',
    },
    {
      kind: 'MARKDOWN',
      id: 'c21_formas',
      markdown:
        '## As três formas\n\n' +
        '**Natural** — sem alteração. É a escala que corresponde exatamente à armadura. Seu VII grau está a um **tom** da tônica, e portanto é subtônica, não sensível: falta-lhe atração para a tônica.\n\n' +
        '**Harmônica** — eleva o **VII grau** em um semitom, criando a sensível. Recupera a atração e viabiliza o acorde de dominante maior, que é o que a harmonia tonal exige. O custo é um salto de **segunda aumentada** entre VI e VII — três semitons entre graus vizinhos, característico e difícil de cantar.\n\n' +
        '**Melódica** — eleva **VI e VII** na **subida**, eliminando a segunda aumentada, e desce como a natural. É a única escala do sistema que é diferente ao subir e ao descer, e a razão é expressa: a subida quer a sensível, a descida não precisa dela.',
    },
    {
      kind: 'SCALE_LAB',
      id: 'c21_lab_harmonica',
      title: 'Lá menor harmônica — ouça o salto entre VI e VII',
      tonic: 'A3',
      mode: 'HARMONIC_MINOR',
    },
    {
      kind: 'MARKDOWN',
      id: 'c21_relativa',
      markdown:
        '## Relativa e homônima\n\n' +
        'Duas relações diferentes ligam uma maior a uma menor, e confundi-las é erro clássico.\n\n' +
        'A **relativa menor** tem a **mesma armadura** e tônica diferente: está uma terça menor abaixo da maior. Dó maior e lá menor compartilham zero acidentes; ré maior e si menor compartilham dois sustenidos. As notas são as mesmas; o centro é outro.\n\n' +
        'A **homônima menor** tem a **mesma tônica** e armadura diferente: dó maior e dó menor. Mesmo centro, notas diferentes — três bemóis de diferença, sempre.\n\n' +
        'Para achar a relativa menor de qualquer maior, desce-se uma terça menor a partir da tônica. Para achar a relativa maior de qualquer menor, sobe-se uma terça menor.',
    },
    {
      kind: 'CALLOUT',
      id: 'c21_call',
      type: 'info',
      title: 'Como saber se a peça é maior ou menor',
      text:
        'A armadura sozinha não decide: ela serve a duas tonalidades. Olha-se então a última nota do baixo, a primeira e a última harmonia, e — principalmente — se aparece um acidente elevando sistematicamente o sétimo grau. Esse acidente recorrente é a assinatura da menor harmônica, e é a pista mais confiável.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c21_check',
      question: 'Por que a escala menor harmônica tem uma segunda aumentada entre VI e VII?',
      options: [
        'Por engano histórico da notação',
        'Porque o VII foi elevado para virar sensível, e o VI ficou onde estava',
        'Porque a menor tem sete notas',
        'Porque o VI foi abaixado',
      ],
      correctIndex: 1,
      explanation:
        'Elevar apenas o VII cria sensível, mas abre o intervalo até o VI, que permanece na posição natural. O resultado são três semitons entre graus vizinhos.',
    },
  ],

  // -------------------------------------------------------------------------
  22: [
    {
      kind: 'MARKDOWN',
      id: 'c22_intro',
      markdown:
        'A métrica estabelece onde o acento deve cair. A música interessante passa boa parte do tempo **contrariando** essa expectativa — e para isso existem dois recursos, frequentemente confundidos.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c22_sincope',
      markdown:
        '## Síncope\n\n' +
        'A **síncope** é o som que **começa em tempo fraco e se prolonga sobre o tempo forte**.\n\n' +
        'O ataque acontece antes do tempo forte; quando o tempo forte chega, a nota já está soando. O acento métrico encontra um som em curso, e não um ataque novo — e é esse desencontro que produz a característica sensação de deslocamento.\n\n' +
        'A síncope escreve-se por ligadura de valor atravessando o tempo, ou por uma figura longa iniciada em posição fraca.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c22_contratempo',
      markdown:
        '## Contratempo\n\n' +
        'O **contratempo** é o som que **ataca em tempo fraco e o tempo forte fica em silêncio**.\n\n' +
        'A diferença em relação à síncope é uma só, e é objetiva: na síncope o tempo forte é **ocupado por som prolongado**; no contratempo o tempo forte é **ocupado por pausa**.\n\n' +
        'A pergunta que resolve qualquer caso: *o que acontece no tempo forte?* Som que já vinha soando, é síncope. Silêncio, é contratempo.',
    },
    {
      kind: 'CALLOUT',
      id: 'c22_call',
      type: 'tip',
      title: 'O teste em uma pergunta',
      text:
        'Não olhe para onde a nota começa — isso é igual nos dois casos. Olhe para o TEMPO FORTE. Se há som prolongado nele, síncope. Se há pausa nele, contratempo.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c22_tipos',
      markdown:
        '## Síncope regular e irregular\n\n' +
        'A síncope é **regular** quando as duas partes têm o mesmo valor — metade em tempo fraco, metade sobre o forte. É **irregular** quando as partes são desiguais, e é a mais frequente na prática.\n\n' +
        'Há ainda a distinção entre síncope **dentro do tempo**, que desloca a subdivisão sem atravessar o tempo, e síncope **entre tempos**, que atravessa. A primeira produz balanço; a segunda produz deslocamento.\n\n' +
        'Boa parte da música popular brasileira vive dessas categorias, e descrevê-las com precisão é o que permite escrever o que se ouve.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c22_audio',
      title: 'Deslocamento rítmico',
      description:
        'Mesma sequência de alturas, ataques fora do tempo forte. Tente bater o pulso enquanto ouve.',
      notes: ['C4', 'C4', 'E4', 'E4', 'G4', 'G4', 'E4', 'C4'],
      playMode: 'SEQUENCE',
      bpm: 132,
    },
    {
      kind: 'CHECKPOINT',
      id: 'c22_check',
      question: 'Uma nota ataca na segunda colcheia do tempo e o tempo seguinte tem pausa no início. O que é?',
      options: [
        'Síncope',
        'Contratempo',
        'Quiáltera',
        'Anacruse',
      ],
      correctIndex: 1,
      explanation:
        'O tempo forte está ocupado por silêncio, não por som prolongado. Isso caracteriza contratempo.',
    },
  ],

  // -------------------------------------------------------------------------
  23: [
    {
      kind: 'MARKDOWN',
      id: 'c23_intro',
      markdown:
        'A escala menor tem três formas, e isso é bem sabido. Menos sabido é que a escala **maior** também admite formas alteradas, pela mesma lógica, na direção oposta.\n\n' +
        '**Maior harmônica** — abaixa o **VI grau** em um semitom. Em dó: dó, ré, mi, fá, sol, **láb**, si, dó.\n\n' +
        '**Maior melódica** — abaixa **VI e VII** na descida, mantendo a maior natural na subida. É o espelho exato da menor melódica.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c23_efeito',
      markdown:
        '## O que a alteração produz\n\n' +
        'Abaixar o VI da maior cria, entre VI e VII, o mesmo salto de **segunda aumentada** que caracteriza a menor harmônica. A escala ganha uma coloração que o ouvido reconhece imediatamente como emprestada do modo menor.\n\n' +
        'Em termos harmônicos, o VI abaixado transforma o acorde de subdominante em **menor**, e é essa a sonoridade que a prática chama de **empréstimo modal**: uma peça em maior que toma emprestado da sua homônima menor.\n\n' +
        'É um dos recursos expressivos mais eficazes que a harmonia tonal tem, e aparece em toda parte — de Schubert à canção popular — justamente porque produz um escurecimento súbito sem sair da tonalidade.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c23_audio',
      title: 'Dó maior harmônica',
      description: 'A escala maior com o sexto grau abaixado. Ouça o salto entre lá bemol e si.',
      notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'G#4', 'B4', 'C5'],
      playMode: 'SEQUENCE',
      bpm: 84,
    },
    {
      kind: 'CALLOUT',
      id: 'c23_call',
      type: 'info',
      title: 'Simetria do sistema',
      text:
        'Menor harmônica eleva o VII; maior harmônica abaixa o VI. Menor melódica eleva VI e VII subindo; maior melódica abaixa VI e VII descendo. O sistema é simétrico, e reconhecer isso reduz quatro regras a uma.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c23_check',
      question: 'Que grau é alterado na escala maior harmônica?',
      options: [
        'O sétimo, elevado',
        'O sexto, abaixado',
        'O terceiro, abaixado',
        'O segundo, elevado',
      ],
      correctIndex: 1,
      explanation:
        'A maior harmônica abaixa o VI grau em um semitom, criando a segunda aumentada entre VI e VII.',
    },
  ],

  // -------------------------------------------------------------------------
  24: [
    {
      kind: 'MARKDOWN',
      id: 'c24_intro',
      markdown:
        'Duas tonalidades são **vizinhas** — ou aparentadas — quando suas armaduras diferem em **no máximo um acidente**. Quanto menor a diferença, mais notas em comum, e mais fácil a passagem de uma para outra.\n\n' +
        'Toda tonalidade tem **cinco** vizinhos diretos:\n\n' +
        '- a **relativa** (mesma armadura);\n' +
        '- a **dominante**, uma quinta acima (um acidente a mais), e sua relativa;\n' +
        '- a **subdominante**, uma quinta abaixo (um acidente a menos), e sua relativa.\n\n' +
        'Em dó maior: lá menor, sol maior, mi menor, fá maior e ré menor.',
    },
    {
      kind: 'DIAGRAM',
      id: 'c24_ciclo',
      title: 'Vizinhança no ciclo das quintas',
      diagram: 'CIRCLE_OF_FIFTHS',
      caption:
        'Os vizinhos são os setores imediatamente à esquerda e à direita, mais as relativas correspondentes.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c24_uso',
      markdown:
        '## Por que isso importa\n\n' +
        'A forma sonata clássica, a suíte barroca e a canção popular têm em comum uma coisa: modulam preferencialmente para vizinhos.\n\n' +
        'Uma peça em maior vai à **dominante**; uma peça em menor vai à **relativa maior**. Não é convenção arbitrária — é que o percurso até um vizinho exige alterar uma nota só, e o ouvido acompanha a mudança sem perder o fio.\n\n' +
        'Modulações a tonalidades distantes existem e são poderosas justamente porque contrariam essa expectativa. Mas para que contrariem, é preciso que a expectativa exista — e ela existe porque a vizinhança é a norma.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c24_check',
      question: 'Quais são os tons vizinhos de sol maior?',
      options: [
        'Dó maior, ré maior, mi menor, lá menor, si menor',
        'Dó maior, fá maior, ré menor, lá menor, mi menor',
        'Ré maior, lá maior, si menor, fá♯ menor, mi menor',
        'Somente mi menor',
      ],
      correctIndex: 0,
      explanation:
        'Relativa (mi menor), dominante (ré maior) e sua relativa (si menor), subdominante (dó maior) e sua relativa (lá menor).',
    },
  ],

  // -------------------------------------------------------------------------
  25: [
    {
      kind: 'MARKDOWN',
      id: 'c25_intro',
      markdown:
        '**Modulação** é a mudança de centro tonal no decorrer de uma peça. Não é apenas aparecer um acidente estranho: é o novo centro **estabelecer-se**, confirmado por cadência.\n\n' +
        'É essa a diferença entre modulação e simples inflexão passageira. Um acorde emprestado colore o trecho e vai embora; uma modulação instala outro polo de gravidade, e a música passa a orbitar em torno dele.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c25_processos',
      markdown:
        '## Como se modula\n\n' +
        '**Por acorde pivô** — escolhe-se um acorde que exista nas duas tonalidades. Ele é apresentado como pertencente à primeira, reinterpretado como pertencente à segunda, e a cadência confirma a chegada. É o processo mais suave, e o mais usado.\n\n' +
        '**Por transição cromática** — uma voz desliza por semitons até que a nova tonalidade se imponha. O efeito é de deslizamento contínuo.\n\n' +
        '**Direta, ou de salto** — a nova tonalidade entra sem preparo nenhum, muitas vezes na retomada de um tema. É abrupta de propósito, e é o recurso mais frequente na canção popular, onde se sobe meio tom ou um tom no último refrão.\n\n' +
        '**Por enarmonia** — um acorde é reescrito enarmonicamente e passa a ter outra função. O acorde de sétima diminuta presta-se especialmente a isso, porque cada uma das suas quatro notas pode ser lida como fundamental, abrindo quatro saídas diferentes.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c25_distinguir',
      markdown:
        '## Modulação ou empréstimo?\n\n' +
        'O critério prático é a **cadência**.\n\n' +
        'Se o trecho apresenta a dominante do novo tom e resolve nele, com repouso perceptível, houve modulação.\n\n' +
        'Se o acidente aparece, colore um acorde e desaparece sem que nenhuma cadência confirme o novo centro, foi **empréstimo modal** ou **dominante secundária** — a tonalidade original nunca foi abandonada.\n\n' +
        'Na análise, isso muda tudo: numerar os graus na tonalidade errada torna incompreensível um trecho que era simples.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c25_lab_pivo',
      title: 'Acorde pivô: dó maior em duas leituras',
      notes: ['C4', 'E4', 'G4'],
      prompt:
        'Em dó maior é o I grau. Em sol maior é o IV. O mesmo acorde, duas funções — e é por aí que a modulação passa.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c25_check',
      question: 'O que distingue uma modulação de um empréstimo modal?',
      options: [
        'A quantidade de acidentes novos',
        'A confirmação do novo centro por cadência',
        'A duração do trecho',
        'A mudança de armadura na partitura',
      ],
      correctIndex: 1,
      explanation:
        'Modulação exige que o novo centro se estabeleça, e é a cadência que o estabelece. Sem cadência confirmatória, houve apenas coloração passageira.',
    },
  ],

  // -------------------------------------------------------------------------
  26: [
    {
      kind: 'MARKDOWN',
      id: 'c26_intro',
      markdown:
        'Antes do sistema de maior e menor, a música ocidental organizava-se em **modos**. O sistema litúrgico medieval reconhecia oito, agrupados em quatro pares.\n\n' +
        'Cada modo define-se por três elementos:\n\n' +
        '**Final** — a nota de repouso, onde a melodia termina.\n' +
        '**Âmbito** — a extensão de notas que a melodia percorre em relação à final.\n' +
        '**Repercussão** — também chamada tenor ou dominante modal, é a nota em torno da qual a melodia gravita e sobre a qual se recita o texto.\n\n' +
        'Repare que a final e a repercussão são coisas distintas — diferença que o sistema tonal depois apagaria ao fundir centro e polo de tensão em tônica e dominante.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c26_oito',
      markdown:
        '## Autênticos e plagais\n\n' +
        'Cada final gera **dois** modos.\n\n' +
        'O modo **autêntico** tem âmbito que vai da final à sua oitava — a melodia sobe a partir do repouso.\n\n' +
        'O modo **plagal** tem âmbito que vai de uma quarta abaixo da final até uma quinta acima — a final fica no meio da extensão. O nome do plagal é o do autêntico correspondente com o prefixo **hipo-**.\n\n' +
        '| Nº | Modo | Final | Âmbito |\n' +
        '|---|---|---|---|\n' +
        '| I | Dórico | ré | ré–ré |\n' +
        '| II | Hipodórico | ré | lá–lá |\n' +
        '| III | Frígio | mi | mi–mi |\n' +
        '| IV | Hipofrígio | mi | si–si |\n' +
        '| V | Lídio | fá | fá–fá |\n' +
        '| VI | Hipolídio | fá | dó–dó |\n' +
        '| VII | Mixolídio | sol | sol–sol |\n' +
        '| VIII | Hipomixolídio | sol | ré–ré |\n\n' +
        'Quatro finais, oito modos. Os modos numerados em ímpar são autênticos; os pares, plagais.',
    },
    {
      kind: 'CALLOUT',
      id: 'c26_call',
      type: 'warning',
      title: 'Os nomes gregos não descrevem música grega',
      text:
        'Dórico, frígio, lídio e mixolídio são nomes tomados da teoria grega antiga — e aplicados a escalas que NÃO correspondem ao que os gregos designavam por eles. A transferência foi feita por erro de leitura dos tratados, e ficou. Usar os nomes é correto; supor continuidade histórica direta, não.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c26_modernos',
      markdown:
        '## Os modos na prática moderna\n\n' +
        'O uso contemporâneo — no jazz, na música popular e no ensino de improvisação — simplificou o sistema. Ignorou a distinção entre autêntico e plagal, que dependia de âmbito melódico, e passou a tratar cada modo simplesmente como uma escala.\n\n' +
        'Acrescentou ainda dois modos que o sistema medieval não tinha como categorias independentes: **jônio** (sobre dó, idêntico à maior) e **eólio** (sobre lá, idêntico à menor natural), além do **lócrio** (sobre si), teoricamente possível e praticamente instável por ter a quinta diminuta.\n\n' +
        'São sete modos modernos, obtidos rodando a escala de dó maior por cada uma das suas notas. É um atalho pedagógico eficiente — e é preciso saber que é um atalho, porque ele descarta justamente o que definia os modos medievais.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c26_audio_dorico',
      title: 'Modo dórico sobre ré',
      description:
        'As sete notas naturais a partir de ré. Compare com a menor natural: a diferença é o sexto grau, aqui natural.',
      notes: ['D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5'],
      playMode: 'SEQUENCE',
      bpm: 84,
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c26_audio_frigio',
      title: 'Modo frígio sobre mi',
      description:
        'A partir de mi. O semitom logo no primeiro passo é a marca do modo, e o que lhe dá o caráter.',
      notes: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'],
      playMode: 'SEQUENCE',
      bpm: 84,
    },
    {
      kind: 'CHECKPOINT',
      id: 'c26_check',
      question: 'O que distingue um modo autêntico do seu plagal correspondente?',
      options: [
        'A nota final',
        'O âmbito da melodia em relação à final',
        'A armadura de clave',
        'O andamento',
      ],
      correctIndex: 1,
      explanation:
        'A final é a mesma nos dois. O que muda é o âmbito: no autêntico a melodia vai da final à oitava; no plagal, de uma quarta abaixo a uma quinta acima.',
    },
  ],

  // -------------------------------------------------------------------------
  27: [
    {
      kind: 'MARKDOWN',
      id: 'c27_intro',
      markdown:
        '**Transporte** é executar ou escrever uma música em altura diferente da original, **preservando integralmente** as relações entre as notas. Todos os intervalos permanecem; só o ponto de partida muda.\n\n' +
        'As razões são práticas: adequar a peça à extensão de um cantor, acomodar um instrumento transpositor, ou facilitar a execução numa tonalidade menos hostil.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c27_metodos',
      markdown:
        '## Os três métodos\n\n' +
        '**Por intervalo** — determina-se o intervalo entre a tônica antiga e a nova, e desloca-se cada nota por esse mesmo intervalo, com a mesma qualidade. É o método direto, e o único que funciona sempre.\n\n' +
        '**Por armadura** — escreve-se a armadura da nova tonalidade e leem-se os graus, não as notas: o que era III grau continua III grau. É mais rápido para quem pensa em funções.\n\n' +
        '**Por mudança de clave** — lê-se a mesma partitura imaginando outra clave, o que desloca automaticamente todas as notas, e corrige-se a armadura mentalmente. É o método dos repetidores e maestros, porque não exige reescrever nada, e é a razão prática pela qual se aprende a ler em sete claves.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c27_cuidados',
      markdown:
        '## O que não pode mudar\n\n' +
        'Transporte correto preserva a **qualidade** de cada intervalo, não apenas a distância genérica. Uma terça maior tem de continuar terça maior — não pode virar terça menor nem quarta diminuta.\n\n' +
        'Consequência prática: os **acidentes ocorrentes** também se transportam, e nem sempre para o mesmo tipo de acidente. Um sustenido ocorrente pode virar bequadro na nova tonalidade, se a armadura já contiver aquela alteração. Quem transporta trocando sustenido por sustenido mecanicamente erra.\n\n' +
        'A verificação é simples e vale a pena: confira que cada intervalo da nova versão tem a mesma qualidade que na original.',
    },
    {
      kind: 'CALLOUT',
      id: 'c27_call',
      type: 'tip',
      title: 'Transportar é pensar em graus',
      text:
        'Quem transporta nota a nota calcula muito e erra. Quem pensa "isto é o V grau, e o V grau da nova tonalidade é tal" transporta quase sem cálculo. O treino de graus do capítulo XV é o que torna o transporte praticável à primeira vista.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c27_check',
      question: 'Ao transportar de dó maior para mi♭ maior, o que acontece com uma terça maior dó–mi?',
      options: [
        'Vira terça menor mi♭–sol♭',
        'Vira terça maior mi♭–sol',
        'Vira quarta justa',
        'Permanece dó–mi',
      ],
      correctIndex: 1,
      explanation:
        'A qualidade tem de ser preservada. Dó–mi é terça maior; transportada para mi♭, dá mi♭–sol, também terça maior.',
    },
  ],

  // -------------------------------------------------------------------------
  28: [
    {
      kind: 'MARKDOWN',
      id: 'c28_intro',
      markdown:
        'A tradição latina classifica os compassos pelo número de tempos: binário, ternário, quaternário. A tradição de língua alemã organiza a mesma matéria por outro critério, e a distinção esclarece pontos que a primeira deixa obscuros.\n\n' +
        'O critério ali é a **natureza da divisão**, e não a contagem dos tempos.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c28_categorias',
      markdown:
        '## As categorias\n\n' +
        '**Compasso de tempo simples** — cada tempo divide-se em dois. Corresponde ao que a tradição latina chama compasso simples.\n\n' +
        '**Compasso de tempo composto** — cada tempo divide-se em três. A unidade é figura pontuada.\n\n' +
        'Sobre esse eixo, cruza-se o número de tempos: dois, três ou quatro. Resultam seis categorias básicas, e toda fórmula de compasso comum se encaixa numa delas.\n\n' +
        '| | 2 tempos | 3 tempos | 4 tempos |\n' +
        '|---|---|---|---|\n' +
        '| divisão binária | 2/4 | 3/4 | 4/4 |\n' +
        '| divisão ternária | 6/8 | 9/8 | 12/8 |\n\n' +
        'A tabela deixa evidente o que a nomenclatura latina esconde: **6/8 é um compasso de dois tempos**, e pertence à mesma coluna que 2/4. O número seis, que enganaria, refere-se a divisões e não a tempos.',
    },
    {
      kind: 'CALLOUT',
      id: 'c28_call',
      type: 'info',
      title: 'Por que isto vale a pena',
      text:
        'Porque resolve de uma vez a confusão entre 6/8 e 3/4. Lidos pela tabela, eles ocupam células diferentes em ambos os eixos: um tem dois tempos de divisão ternária, o outro tem três tempos de divisão binária. Não há como confundi-los.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c28_check',
      question: 'Na classificação por natureza da divisão, 12/8 é o quê?',
      options: [
        'Compasso de doze tempos',
        'Compasso de quatro tempos com divisão ternária',
        'Compasso de três tempos com divisão binária',
        'Compasso irregular',
      ],
      correctIndex: 1,
      explanation:
        'Doze divisões agrupadas de três em três dão quatro tempos, cada um dividido em três. É o correspondente ternário de 4/4.',
    },
  ],

  // -------------------------------------------------------------------------
  29: [
    {
      kind: 'MARKDOWN',
      id: 'c29_intro',
      markdown:
        'Os oito modos litúrgicos foram descritos sobre finais fixas — ré, mi, fá, sol — usando apenas notas naturais. Mas a prática precisou deslocá-los, e por dois motivos.\n\n' +
        'O primeiro é o **âmbito vocal**: um coro não canta necessariamente na tessitura em que o modo foi codificado.\n\n' +
        'O segundo é a **estrutura**: transpor permite preservar o desenho de tons e semitons do modo enquanto se muda a altura — que é precisamente o que o transporte faz com qualquer escala.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c29_como',
      markdown:
        '## Como se transpõe um modo\n\n' +
        'Preserva-se a **sequência de tons e semitons** a partir da nova final, exatamente como se faz com a escala maior. Os acidentes necessários aparecem por consequência, e formam a armadura do modo transposto.\n\n' +
        'O caso histórico mais frequente é a transposição por **quarta justa acima**, que introduz um **si♭** — o único acidente que a notação medieval reconhecia de forma sistemática. O modo dórico sobre ré transposto assim resulta em dórico sobre sol, com si♭ na armadura.\n\n' +
        'É por isso que, em música modal, uma armadura com um bemol **não significa** fá maior nem ré menor. Significa, com grande probabilidade, um modo transposto — e analisá-la como tonalidade produz disparate.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c29_audio',
      title: 'Dórico transposto para sol',
      description:
        'A mesma estrutura do dórico sobre ré, agora a partir de sol. O si bemol é o que mantém o desenho intacto.',
      notes: ['G4', 'A4', 'A#4', 'C5', 'D5', 'E5', 'F5', 'G5'],
      playMode: 'SEQUENCE',
      bpm: 84,
    },
    {
      kind: 'CALLOUT',
      id: 'c29_call',
      type: 'warning',
      title: 'Armadura não é tonalidade, em música modal',
      text:
        'Num repertório modal, a armadura informa quais notas foram alteradas para preservar a estrutura do modo — não anuncia um centro tonal. Quem lê um bemol e conclui "fá maior" vai analisar a peça inteira errado.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c29_check',
      question: 'Por que a transposição de um modo litúrgico exige acidentes?',
      options: [
        'Para deixar a melodia mais aguda',
        'Para preservar a sequência de tons e semitons a partir da nova final',
        'Porque a armadura medieval exigia',
        'Para transformar o modo em tonalidade',
      ],
      correctIndex: 1,
      explanation:
        'O modo é definido pelo desenho de tons e semitons. Mudando a final, só se mantém esse desenho alterando algumas notas — e são esses acidentes que formam a armadura.',
    },
  ],

  // -------------------------------------------------------------------------
  30: [
    {
      kind: 'MARKDOWN',
      id: 'c30_intro',
      markdown:
        '**Andamento** é a velocidade de execução — quantos tempos por unidade de tempo real. É o que converte as proporções abstratas das figuras em durações concretas.\n\n' +
        'Indica-se de duas maneiras, que coexistem na mesma partitura e servem a propósitos diferentes.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c30_termos',
      markdown:
        '## Termos de andamento\n\n' +
        'Do mais lento ao mais rápido, com os valores metronômicos aproximados que a prática consagrou:\n\n' +
        '| Termo | ≈ bpm | Caráter |\n' +
        '|---|---|---|\n' +
        '| Grave | 40–48 | solene, pesado |\n' +
        '| Largo | 48–56 | amplo |\n' +
        '| Lento | 56–60 | lento |\n' +
        '| Adagio | 60–72 | à vontade |\n' +
        '| Andante | 72–84 | andando |\n' +
        '| Moderato | 84–108 | moderado |\n' +
        '| Allegretto | 108–120 | ligeiro |\n' +
        '| Allegro | 120–160 | alegre, rápido |\n' +
        '| Vivace | 160–176 | vivo |\n' +
        '| Presto | 176–200 | muito rápido |\n' +
        '| Prestissimo | 200+ | o mais rápido possível |\n\n' +
        'Os termos são italianos por razão histórica, e a maioria designa **caráter** antes de velocidade. *Andante* quer dizer "andando"; *allegro*, "alegre". A velocidade veio junto por associação, e é por isso que os valores da tabela são aproximados e variam por período e por repertório.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c30_metronomo',
      markdown:
        '## Indicação metronômica\n\n' +
        'A segunda forma é precisa: uma figura, o sinal de igual e um número, como **♩ = 96**. Lê-se "noventa e seis semínimas por minuto".\n\n' +
        'É uma indicação **objetiva**, e substituiu progressivamente os termos como instrução de velocidade — sem eliminá-los, porque o termo continua informando o caráter, que o número não informa.\n\n' +
        'Uma partitura que traga apenas o número diz com que velocidade tocar, e não com que espírito. Por isso as duas indicações costumam aparecer juntas.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c30_mudancas',
      markdown:
        '## Mudanças de andamento\n\n' +
        '**Graduais:**\n' +
        '- *accelerando* — acelerando progressivamente\n' +
        '- *ritardando* e *rallentando* — desacelerando progressivamente\n' +
        '- *stringendo* — apertando, acelerando com tensão\n' +
        '- *allargando* — alargando, desacelerando e ampliando\n\n' +
        '**Súbitas e de retorno:**\n' +
        '- *a tempo* — retomar o andamento anterior\n' +
        '- *tempo primo* — retomar o andamento inicial da peça\n' +
        '- *meno mosso* / *più mosso* — menos / mais movido, mudança imediata\n\n' +
        '**Flexibilidade:**\n' +
        '- *rubato* — literalmente "roubado": tomar tempo de umas notas e devolver a outras, mantendo o total. Não é tocar fora do tempo; é redistribuí-lo.\n' +
        '- *fermata* — suspender a contagem sobre uma nota ou pausa. A duração fica a critério do intérprete, e não há convenção fixa.',
    },
    {
      kind: 'CALLOUT',
      id: 'c30_call',
      type: 'historical',
      title: 'O andamento mudou com o tempo',
      text:
        'Um allegro do século XVIII não é um allegro do século XIX. As convenções, os instrumentos e as salas mudaram, e a mesma palavra passou a designar velocidades bem diferentes. Interpretar música antiga exige conhecer a convenção do período — a tabela desta lição descreve a prática corrente, não uma constante histórica.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c30_check',
      question: 'O que significa rubato?',
      options: [
        'Tocar mais rápido',
        'Redistribuir o tempo entre as notas mantendo a duração total',
        'Parar sobre uma nota',
        'Retomar o andamento inicial',
      ],
      correctIndex: 1,
      explanation:
        'Rubato é tempo "roubado" de umas notas e devolvido a outras. A flexibilidade é interna; o andamento geral permanece.',
    },
  ],
};
