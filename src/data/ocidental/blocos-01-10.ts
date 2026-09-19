import { LessonBlock } from '../../domain/academy';

/**
 * História da Música Ocidental — capítulos 1 a 10.
 *
 * Da Antiguidade ao barroco médio. Texto autoral; nenhuma obra de referência
 * é citada. Os exemplos sonoros usam melodia de domínio público ou material
 * construído aqui para demonstrar o procedimento em discussão.
 */
export const BLOCOS_OCID_01_10: Record<number, LessonBlock[]> = {
  1: [
    {
      kind: 'MARKDOWN',
      id: 'oc01_intro',
      markdown:
        'Quase nada da música da Antiguidade chegou até nós. Sobrevivem cerca de quarenta fragmentos gregos notados, muitos deles ilegíveis, e o mais completo — um epitáfio gravado em pedra — tem doze versos.\n\n' +
        'O que chegou inteiro foi a **teoria**. E foi ela, não a música, que a Idade Média herdou, copiou, traduziu e frequentemente entendeu ao contrário.\n\n' +
        'Começar por aqui não é arqueologia. É que a nomenclatura dos modos, a ideia de que intervalos são razões numéricas, e a convicção de que a música age sobre o caráter são todas gregas — e continuam operando.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc01_sistema',
      markdown:
        '## O sistema musical grego\n\n' +
        'A unidade era o **tetracorde**: quatro notas descendentes abrangendo uma quarta justa. As duas externas eram fixas; as internas, móveis — e a posição delas definia o **gênero**.\n\n' +
        '**Diatônico** — dois tons e um semitom. É o que sobreviveu.\n' +
        '**Cromático** — uma terça menor e dois semitons.\n' +
        '**Enarmônico** — uma terça maior e dois quartos de tom.\n\n' +
        'O gênero enarmônico, com intervalos menores que o semitom, é o dado mais perturbador dessa herança: o ouvido grego dispunha de distinções que o sistema temperado eliminou.\n\n' +
        'Combinando tetracordes formava-se o **sistema perfeito maior**, de duas oitavas, e dentro dele recortavam-se as espécies de oitava, que receberam os nomes dório, frígio, lídio, mixolídio.',
    },
    {
      kind: 'CALLOUT',
      id: 'oc01_call_nomes',
      type: 'warning',
      title: 'Os nomes viajaram, os conteúdos não',
      text:
        'Os modos medievais chamados dórico, frígio e lídio NÃO correspondem ao que os gregos designavam por esses nomes. A transferência foi feita por leitura equivocada dos tratados antigos, e ficou. Usar os nomes é correto; supor continuidade é erro histórico.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc01_ethos',
      markdown:
        '## A doutrina do ethos\n\n' +
        'Para o pensamento grego, a música não era entretenimento: era força moral. Cada modo produziria um estado de caráter determinado — um tornaria o cidadão firme, outro o amoleceria.\n\n' +
        'Daí a consequência política: se a música forma o caráter, a cidade tem interesse em controlar que música se toca. A ideia de censura musical nasce aí, e volta em cada século.\n\n' +
        'Paralelamente, a corrente pitagórica tratava a música como **número audível**. Os intervalos consonantes correspondem a razões simples de comprimento de corda — 2:1, 3:2, 4:3 —, e a mesma proporção que rege o som regeria os astros. A "harmonia das esferas" não era metáfora poética: era física, no entender de quem a formulou.\n\n' +
        'Essas duas linhas — a música que age sobre a alma e a música que é estrutura matemática — atravessam toda a teoria ocidental, e ainda hoje puxam para lados opostos.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc01_igreja',
      markdown:
        '## Os primeiros séculos cristãos\n\n' +
        'A igreja primitiva cantava, e cantava sem instrumentos. A recusa do instrumento foi deliberada: instrumentos eram associados ao teatro, ao circo e ao culto pagão. O canto puro, apenas vocal, marcava a diferença.\n\n' +
        'Três heranças se cruzaram: a prática da **sinagoga**, com a salmodia e a cantilação do texto sagrado; a **língua e a cultura gregas**, em que os primeiros textos cristãos circularam; e, mais tarde, a organização **romana**.\n\n' +
        'O princípio que se firmou foi o da **subordinação ao texto**. A melodia existe para transmitir a palavra, não para exibir-se. Durante mil anos essa hierarquia será o critério do que é música sacra apropriada — e cada vez que a música se tornar elaborada demais, alguém a invocará para pedir contenção.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc01_check',
      question: 'Por que a igreja primitiva recusava instrumentos musicais no culto?',
      options: [
        'Porque eram caros',
        'Porque os associava ao teatro e aos cultos pagãos',
        'Porque a teoria grega os proibia',
        'Porque não existiam instrumentos disponíveis',
      ],
      correctIndex: 1,
      explanation:
        'A recusa era de associação: instrumentos remetiam ao espetáculo e ao culto pagão. O canto apenas vocal marcava a distinção.',
    },
  ],

  2: [
    {
      kind: 'MARKDOWN',
      id: 'oc02_intro',
      markdown:
        'O **cantochão** — ou canto gregoriano — é o repertório monódico da liturgia latina. Monódico quer dizer uma linha só: nenhuma harmonia, nenhum acompanhamento, ritmo livre regido pela prosódia do texto.\n\n' +
        'É o maior corpo de música conservado da Idade Média, e é a base sobre a qual tudo o que vem depois foi construído: a polifonia nasce acrescentando vozes a ele.\n\n' +
        'O nome "gregoriano" atribui o repertório ao papa Gregório Magno. A atribuição é posterior em dois séculos ao personagem, e serviu para dar autoridade a uma unificação litúrgica que foi, na prática, um trabalho coletivo e demorado.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc02_liturgia',
      markdown:
        '## O que se cantava, e quando\n\n' +
        'A liturgia organiza-se em dois ciclos.\n\n' +
        'O **Ofício** são as oito horas canônicas do dia monástico — Matinas, Laudes, Prima, Terça, Sexta, Noa, Vésperas, Completas. Seu conteúdo musical é sobretudo salmodia, com antífonas, hinos e responsórios.\n\n' +
        'A **Missa** é o rito central, e sua música divide-se em duas partes:\n\n' +
        '**Próprio** — os textos que mudam conforme o dia do ano litúrgico: Intróito, Gradual, Aleluia, Ofertório, Comunhão.\n\n' +
        '**Ordinário** — os textos invariáveis: Kyrie, Gloria, Credo, Sanctus, Agnus Dei.\n\n' +
        'A distinção tem consequência enorme: como o Ordinário se repete em toda missa, foi ele que os compositores passaram a musicar como conjunto. A "missa" como gênero de composição é a musicação do Ordinário — e é por isso que existem centenas de missas sobre exatamente os mesmos cinco textos.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc02_estilos',
      markdown:
        '## Como o texto e a melodia se relacionam\n\n' +
        'Três densidades, e cada uma serve a uma função.\n\n' +
        '**Silábico** — uma nota por sílaba. Usado onde o texto é longo e precisa ser compreendido: salmos, hinos, recitação.\n\n' +
        '**Neumático** — dois a quatro sons por sílaba. O meio-termo, das antífonas.\n\n' +
        '**Melismático** — muitos sons sobre uma sílaba só, às vezes dezenas. Reservado aos momentos de maior solenidade: o Gradual, o Aleluia. O melisma sobre a última sílaba do Aleluia — o **jubilus** — é o canto se soltando da palavra, e será justamente ali que a polifonia começará a crescer.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'oc02_audio',
      title: 'Perfil melódico do cantochão',
      description:
        'Movimento predominantemente conjunto, âmbito estreito, repouso na final do modo. Ouça como a linha evita saltos.',
      notes: ['D4', 'E4', 'F4', 'E4', 'D4', 'F4', 'G4', 'F4', 'E4', 'D4'],
      playMode: 'SEQUENCE',
      bpm: 72,
    },
    {
      kind: 'MARKDOWN',
      id: 'oc02_modos',
      markdown:
        '## Os oito modos\n\n' +
        'O repertório foi classificado em oito modos, definidos por três elementos: a **final** (nota de repouso), o **âmbito** (extensão percorrida) e a **repercussão** (nota de recitação).\n\n' +
        'Quatro finais — ré, mi, fá, sol — geram cada uma dois modos: um **autêntico**, que sobe da final à oitava, e um **plagal**, que se estende de uma quarta abaixo a uma quinta acima.\n\n' +
        'A classificação foi feita **depois** do repertório existir, para organizá-lo. Muitas melodias não se encaixam bem, e os teóricos medievais sabiam disso. É um caso claro de teoria que descreve a prática, e não o contrário.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc02_secular',
      markdown:
        '## O que se cantava fora da igreja\n\n' +
        'A monodia secular foi conservada em quantidade bem menor, porque a igreja é que tinha os copistas. O que sobrou vem sobretudo dos poetas-músicos da nobreza.\n\n' +
        'Os **trovadores** do sul da França cantavam em occitano, a partir do fim do século XI. Seu tema central é o amor cortês: a dama inacessível, o serviço amoroso, a espera.\n\n' +
        'Os **troveiros** do norte cantavam em francês antigo, e ampliaram os temas — canções de cruzada, de tecelã, pastorelas, debates.\n\n' +
        'Os **Minnesänger** alemães seguiram a mesma tradição em língua germânica, com tom mais grave e religioso.\n\n' +
        'Havia também os **goliardos**, clérigos errantes que cantavam em latim sobre vinho, jogo e amor — o que mostra que a língua da igreja não implicava assunto de igreja.\n\n' +
        'Um problema atravessa todo esse repertório: a notação registra as alturas e **não registra o ritmo**. Como essas canções soavam ritmicamente é objeto de disputa que não se resolveu.',
    },
    {
      kind: 'CALLOUT',
      id: 'oc02_call',
      type: 'info',
      title: 'Instrumentos existiam, e não aparecem escritos',
      text:
        'Iluminuras, esculturas e relatos mostram harpas, saltérios, alaúdes, violas de arco, flautas e órgãos portáteis por toda a Idade Média. Quase nenhuma música instrumental foi notada, porque era tocada de memória ou improvisada. A ausência nas fontes não é ausência na prática — é ausência de motivo para escrever.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc02_check',
      question: 'Por que o Ordinário da Missa, e não o Próprio, virou o gênero "missa" na composição?',
      options: [
        'Porque é mais bonito',
        'Porque seus textos são invariáveis e servem a qualquer dia do ano',
        'Porque é mais curto',
        'Porque o Próprio era proibido de ser musicado',
      ],
      correctIndex: 1,
      explanation:
        'O Ordinário se repete em toda missa. Uma composição sobre ele serve sempre; sobre o Próprio, serviria só a um dia do calendário.',
    },
  ],

  3: [
    {
      kind: 'MARKDOWN',
      id: 'oc03_intro',
      markdown:
        'Por volta do século IX aparecem as primeiras descrições de canto a **duas vozes simultâneas**. É o acontecimento mais consequente da história da música ocidental — mais que qualquer obra ou compositor.\n\n' +
        'Culturas do mundo inteiro desenvolveram melodia, ritmo e timbre a graus de refinamento extraordinários. A combinação sistemática de vozes independentes, escrita e transmitida por notação, é uma particularidade que o Ocidente levou adiante como nenhuma outra.\n\n' +
        'Tudo o que vem depois — harmonia, contraponto, forma sonata, orquestração — depende dessa decisão inicial.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc03_organum',
      markdown:
        '## Do paralelo ao melismático\n\n' +
        'O **organum paralelo** é o primeiro estágio descrito: à melodia do cantochão acrescenta-se uma segunda voz a intervalo fixo de quarta ou quinta abaixo. As duas caminham juntas, nota contra nota. Não há independência: é a mesma melodia dobrada.\n\n' +
        'O passo seguinte foi permitir **movimento contrário** — as vozes se afastam e se aproximam. Aparece a independência.\n\n' +
        'O **organum melismático** é a virada decisiva. A voz do cantochão passa a sustentar cada nota por muito tempo, transformando-se num pedal lento; sobre ela, a voz superior desenha melismas livres e longos. O cantochão deixa de ser melodia audível como tal e vira **fundação**: é o *tenor*, do latim *tenere*, segurar.\n\n' +
        'Neste ponto surge um problema prático: se a voz de cima tem muitas notas e a de baixo tem poucas, como as duas se coordenam no tempo? A notação vigente registrava altura, não duração. Foi preciso inventar o ritmo escrito.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc03_modos_ritmicos',
      markdown:
        '## Os modos rítmicos\n\n' +
        'A solução foi um sistema de **seis padrões** de longas e breves, aplicados a grupos de notas. Um sinal indicava qual padrão vigorava, e todo o trecho se lia naquele molde.\n\n' +
        'Os seis padrões são todos **ternários**. A justificativa dada na época foi teológica — o três remete à Trindade e é o número perfeito —, mas o efeito prático foi outro: pela primeira vez, duração passou a ser **notável**.\n\n' +
        'É uma solução rígida, que só admite seis fórmulas. Será substituída um século depois pela notação mensural, que mede cada figura individualmente. Mas o princípio — escrever quanto dura cada som — nasce aqui, e é dele que descende toda a notação rítmica posterior.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc03_notredame',
      markdown:
        '## Notre Dame e os gêneros do século XIII\n\n' +
        'Em torno da catedral de Paris, entre o fim do século XII e o começo do XIII, forma-se o primeiro repertório polifônico de grande escala, com autoria conhecida — coisa nova.\n\n' +
        'Três gêneros se destacam.\n\n' +
        'O **organum de Notre Dame** chega a três e quatro vozes, alternando trechos de tenor sustentado com trechos medidos, chamados *clausulae*.\n\n' +
        'O **conductus** rompe com o costume: sua voz inferior **não** é cantochão preexistente, mas melodia composta de propósito. E todas as vozes cantam o mesmo texto, no mesmo ritmo — textura em blocos. É o primeiro caso de polifonia inteiramente original.\n\n' +
        'O **motete** nasce de um gesto prosaico: acrescentar texto às vozes superiores de uma *clausula*. Daí o nome, do francês *mot*, palavra. A consequência foi radical: as vozes passaram a cantar textos **diferentes ao mesmo tempo**, às vezes em línguas diferentes — latim sagrado no tenor, francês profano acima. O motete se tornou o gênero mais inventivo do século, e o mais difícil de ouvir.',
    },
    {
      kind: 'CALLOUT',
      id: 'oc03_call',
      type: 'historical',
      title: 'Dois nomes, e o que eles significam',
      text:
        'Este é o momento em que compositores começam a ser nomeados nas fontes. Antes, o repertório era anônimo e coletivo; a autoria não era categoria relevante. O aparecimento do nome próprio na música acompanha o mesmo movimento nas artes visuais e na literatura, e marca uma mudança de estatuto: a obra passa a ser de alguém.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc03_check',
      question: 'O que distingue o conductus do organum?',
      options: [
        'O conductus tem mais vozes',
        'No conductus a voz inferior é composta, não é cantochão preexistente',
        'O conductus é instrumental',
        'O conductus não tem texto',
      ],
      correctIndex: 1,
      explanation:
        'O organum acrescenta vozes a um cantochão existente. O conductus compõe todas as vozes, inclusive a inferior — é polifonia inteiramente original.',
    },
  ],

  4: [
    {
      kind: 'MARKDOWN',
      id: 'oc04_intro',
      markdown:
        'O século XIV se apresentou como novidade e assim se nomeou: **ars nova**, arte nova, em oposição à *ars antiqua* do século anterior. A polêmica foi real — houve quem denunciasse a nova música como confusa, lasciva e desrespeitosa do canto sagrado.\n\n' +
        'Duas mudanças técnicas sustentam a ruptura: uma notação que mede durações com precisão, e a admissão da divisão **binária** como legítima.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc04_notacao',
      markdown:
        '## A notação mensural\n\n' +
        'Os modos rítmicos ofereciam seis fórmulas. A notação mensural mede **cada figura**, e permite combiná-las livremente.\n\n' +
        'Cada nível de valor pode ser dividido por **três** (divisão *perfeita*) ou por **dois** (*imperfeita*), e os níveis são independentes entre si. Isso gera quatro combinações básicas — e é a origem direta da distinção moderna entre compasso simples e composto.\n\n' +
        'Admitir o binário foi mais que técnico. O ternário tinha justificação teológica; aceitar o dois como igualmente válido foi retirar da métrica uma carga simbólica que ela carregava havia um século.\n\n' +
        'A partir daí, o ritmo deixa de ser padrão fixo e passa a ser **material de composição**: pode-se escrever sincopação, deslocamento, sobreposição de métricas diferentes.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc04_isorritmia',
      markdown:
        '## Isorritmia\n\n' +
        'A técnica mais característica do período, e a mais abstrata que a música tinha produzido.\n\n' +
        'O tenor é organizado por dois ciclos independentes:\n\n' +
        '**Talea** — um padrão rítmico que se repete.\n' +
        '**Color** — uma sequência de alturas que se repete.\n\n' +
        'Quando os dois ciclos têm comprimentos diferentes — por exemplo, uma talea de 6 notas e um color de 9 —, eles se defasam: a cada repetição, o mesmo padrão rítmico recai sobre alturas diferentes, e só voltam a coincidir depois de várias voltas.\n\n' +
        'O resultado é uma estrutura de longo alcance que o ouvinte quase não percebe como tal, mas que organiza a peça inteira. É música construída sobre um plano numérico — e o parentesco com o serialismo do século XX, seiscentos anos depois, não passou despercebido a ninguém.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc04_trecento',
      markdown:
        '## O Trecento italiano\n\n' +
        'A Itália do século XIV seguiu caminho próprio, e o contraste com a França é nítido.\n\n' +
        'A música italiana é mais **melódica**, mais vocal, mais ornamentada, e menos interessada em construção rítmica abstrata. A voz superior canta longas guirlandas de notas; a estrutura é mais simples e o efeito, mais sensual.\n\n' +
        'Três gêneros dominam: o **madrigal** (que nada tem a ver com o madrigal do século XVI, apesar do nome), a **caccia** — uma caça, em que duas vozes se perseguem em cânone, frequentemente descrevendo cenas de caça ou de mercado — e a **ballata**.\n\n' +
        'A notação italiana do período era diferente da francesa, e as duas conviveram até se fundirem no fim do século.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc04_ficta',
      markdown:
        '## Musica ficta\n\n' +
        '**Musica ficta** é o nome dado às alterações que o executante acrescentava sem que estivessem escritas.\n\n' +
        'Duas razões as motivavam: evitar o trítono, considerado intolerável em certos contextos, e criar sensível na cadência, elevando a nota que antecede a final.\n\n' +
        'A prática era tão corrente que não se anotava — todo cantor sabia onde aplicá-la. O problema é nosso: as fontes registram o que se escrevia, não o que se cantava, e reconstituir a sonoridade real exige decidir caso a caso.\n\n' +
        'É a demonstração mais clara de um princípio que vale para toda a música antiga: **a partitura não é a música**. Ela pressupõe um intérprete que compartilha convenções não escritas. Quando essas convenções se perdem, a partitura fica incompleta — e o que se toca hoje é sempre uma leitura, nunca um registro.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc04_check',
      question: 'O que a isorritmia organiza?',
      options: [
        'A altura de todas as vozes',
        'Ciclos independentes de padrão rítmico (talea) e de alturas (color) no tenor',
        'A afinação dos instrumentos',
        'O texto cantado',
      ],
      correctIndex: 1,
      explanation:
        'Talea e color são ciclos de comprimentos diferentes que se defasam, gerando uma estrutura numérica de longo alcance no tenor.',
    },
  ],

  5: [
    {
      kind: 'MARKDOWN',
      id: 'oc05_intro',
      markdown:
        'No começo do século XV, a música do continente muda de som — e a origem da mudança é a Inglaterra.\n\n' +
        'O que chega de lá é um gosto por **terças e sextas** que a prática continental, presa às quintas e quartas, não tinha. Os teóricos franceses nomearam o efeito de *contenance angloise*, o modo inglês, e reconheceram que a música tinha ficado mais doce.\n\n' +
        'É a primeira vez que a periferia do sistema dita a sonoridade do centro, e não será a última.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc05_fauxbourdon',
      markdown:
        '## Fauxbourdon e a sonoridade das terças\n\n' +
        'A prática inglesa do *faburden* e a continental do **fauxbourdon** produzem cadeias de acordes em primeira inversão, com terças e sextas em movimento paralelo.\n\n' +
        'Para a teoria medieval, terça e sexta eram consonâncias **imperfeitas**, aceitáveis de passagem mas impróprias para repouso. Usá-las em cadeia era admitir que a doçura vale mais que a perfeição teórica.\n\n' +
        'A consequência é grande: a tríade — que a teoria ainda não nomeava — passa a ser a sonoridade corrente. A harmonia tonal, que virá dois séculos depois, começa a ser possível aqui.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'oc05_lab_terca',
      title: 'A terça que mudou o som do século XV',
      lowerNote: 'C4',
      upperNote: 'E4',
      prompt: 'Compare com a quinta vazia do organum. É esta doçura que os teóricos chamaram de modo inglês.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc05_borgonha',
      markdown:
        '## O ducado da Borgonha\n\n' +
        'A corte borgonhesa, então uma das mais ricas da Europa, tornou-se o centro musical do continente. Sua capela atraiu os melhores músicos, e o que ali se produziu circulou por toda parte.\n\n' +
        'O gênero característico é a **chanson borgonhesa**: três vozes, a superior cantada e as duas inferiores possivelmente instrumentais, em francês, sobre formas fixas herdadas da poesia — rondó, balada, virelai. O tom é contido, elegante, sem o virtuosismo rítmico do século anterior.\n\n' +
        'Na música sacra, consolida-se a **missa cíclica**: as cinco partes do Ordinário unificadas por um mesmo material, geralmente um cantus firmus comum a todas.\n\n' +
        'Isso é novo e importante. Pela primeira vez, uma obra musical de grande extensão é concebida como **unidade** — várias seções ligadas por um plano. A ideia de obra longa e coerente, que sustentará a sinfonia e a ópera, começa a existir aqui.',
    },
    {
      kind: 'CALLOUT',
      id: 'oc05_call',
      type: 'historical',
      title: 'Melodias profanas em missas',
      text:
        'Muitos cantus firmus de missas cíclicas eram canções seculares — melodias de taberna e de amor sustentando a liturgia. A prática foi corrente por mais de um século e depois condenada. Que tenha sido possível durante tanto tempo diz algo sobre a fronteira entre sagrado e profano naquele momento: ela era bem menos rígida do que se costuma supor.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc05_check',
      question: 'O que a missa cíclica trouxe de estruturalmente novo?',
      options: [
        'O uso do latim',
        'A ideia de obra longa unificada por material comum entre seções',
        'A polifonia a quatro vozes',
        'O acompanhamento instrumental',
      ],
      correctIndex: 1,
      explanation:
        'Unificar as cinco partes do Ordinário por um mesmo material criou a primeira obra musical extensa concebida como unidade — princípio que sustenta toda a forma longa posterior.',
    },
  ],

  6: [
    {
      kind: 'MARKDOWN',
      id: 'oc06_intro',
      markdown:
        'Entre 1450 e 1520 consolida-se o estilo que se costuma chamar renascentista, e ele tem duas marcas técnicas.\n\n' +
        'A primeira é a **imitação generalizada**: todas as vozes passam a apresentar o mesmo material melódico, entrando uma após a outra. A textura deixa de ter uma voz principal com acompanhamento e passa a ser um tecido de linhas equivalentes.\n\n' +
        'A segunda é a **igualdade das vozes**. No século anterior, o tenor era a fundação e as outras se ajustavam a ele. Agora as quatro têm o mesmo estatuto, e a escrita passa a ser concebida simultaneamente, não voz a voz.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc06_texto',
      markdown:
        '## A música serve ao texto\n\n' +
        'A mudança estética mais consequente não é técnica: é a subordinação deliberada da música ao sentido das palavras.\n\n' +
        'Isso significa várias coisas concretas. A melodia acompanha a **acentuação natural** do texto, em vez de contrariá-la. As cadências caem onde a frase termina. Os pontos de imitação mudam quando a frase do texto muda. E começam a aparecer figuras que **traduzem** o significado: a linha sobe em "ascendit", desce em "descendit", para em "mors".\n\n' +
        'É a aplicação, à música, do princípio humanista de recuperar a eloquência antiga. A música torna-se retórica — arte de mover o ouvinte por meio do discurso.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc06_missas',
      markdown:
        '## Os tipos de missa\n\n' +
        '**Missa de cantus firmus** — constrói-se sobre uma melodia preexistente colocada no tenor, geralmente em valores longos. É a técnica herdada do século XV.\n\n' +
        '**Missa de paródia** — toma uma composição polifônica inteira, com todas as suas vozes, e a retrabalha. Não é plágio nem preguiça: é demonstração de ofício, e o ouvinte reconhecia o modelo, o que fazia parte do prazer.\n\n' +
        '**Missa de paráfrase** — a melodia preexistente é ornamentada e distribuída por todas as vozes, em vez de ficar presa ao tenor.\n\n' +
        '**Missa sine nomine** — sem modelo, material inteiramente original.\n\n' +
        'A progressão dessa lista é significativa: o material emprestado vai sendo absorvido, dissolvido e por fim dispensado. A obra caminha para a originalidade integral.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'oc06_lab',
      title: 'A tríade como sonoridade corrente',
      notes: ['C4', 'E4', 'G4'],
      prompt: 'O que era consonância imperfeita de passagem tornou-se o acorde de repouso do período.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc06_check',
      question: 'O que caracteriza a missa de paródia?',
      options: [
        'Ser uma imitação satírica da liturgia',
        'Retrabalhar uma composição polifônica inteira, com todas as suas vozes',
        'Usar apenas uma melodia no tenor',
        'Não ter modelo algum',
      ],
      correctIndex: 1,
      explanation:
        'Paródia aqui não tem sentido satírico: significa tomar como modelo uma obra polifônica completa e reelaborá-la — demonstração de ofício que o ouvinte reconhecia.',
    },
  ],

  7: [
    {
      kind: 'MARKDOWN',
      id: 'oc07_intro',
      markdown:
        'O século XVI é o período em que a música deixa de ser internacional e passa a ter **sotaque**. Até então, o estilo franco-flamengo dominava de Lisboa à Cracóvia. Agora cada região desenvolve gêneros próprios, em sua própria língua.\n\n' +
        'Uma causa material explica boa parte disso: a **impressão musical**. A partir do início do século, música impressa circula em tiragens, chega a casas particulares e cria um mercado de amadores. Compor para quem toca em casa é diferente de compor para uma capela — e o repertório muda de acordo.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc07_madrigal',
      markdown:
        '## O madrigal italiano\n\n' +
        'O gênero mais importante do século. Poesia de qualidade em italiano, musicada para quatro a seis vozes, sem forma fixa: a música acompanha o poema verso a verso.\n\n' +
        'Sua trajetória é uma radicalização contínua. Começa homofônico e contido. Passa a alternar texturas conforme o sentido. Desenvolve o **madrigalismo** — a figura que ilustra a palavra — a ponto de virar sistema. E termina, no fim do século, em cromatismo e dissonância tão extremos que a linguagem tonal que estava se formando praticamente se desmancha.\n\n' +
        'Os últimos madrigais são das músicas mais audaciosas escritas antes do século XX. Não por acaso, foram redescobertos justamente então.\n\n' +
        'O madrigal é também o gênero em que **texto e música se pressionam mutuamente** até o limite. O que a ópera fará, em seguida, é resolver essa pressão por outro caminho: em vez de várias vozes representando um só afeto, uma voz só representando uma pessoa.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc07_nacionais',
      markdown:
        '## Os estilos nacionais\n\n' +
        '**França** — a *chanson parisiense*: leve, silábica, rápida, com ritmos marcados e assunto frequentemente picante. Fácil de cantar e muito vendida.\n\n' +
        '**Alemanha** — o *Lied* polifônico, construído sobre melodia preexistente, mais sério de tom.\n\n' +
        '**Espanha** — o *villancico*, de estrutura estrófica com refrão, e o *romance*, narrativo.\n\n' +
        '**Inglaterra** — o madrigal inglês, importado da Itália e adaptado, e a *ayre*, para voz solista com alaúde, que antecipa a monodia.\n\n' +
        'A diferença entre esses gêneros não é apenas de língua: é de **função social**. A chanson parisiense é música de divertimento urbano; o Lied, de tradição doméstica; a ayre, de intimidade. A música começa a se organizar pelo lugar onde é tocada.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc07_instrumental',
      markdown:
        '## A música instrumental ganha autonomia\n\n' +
        'Até aqui, a música instrumental existia e quase não se escrevia. No século XVI, ela passa a ser impressa — e, sendo impressa, precisa de formas próprias.\n\n' +
        'Quatro caminhos se abrem.\n\n' +
        '**Transcrição** — vocal adaptado ao alaúde ou à tecla, com ornamentação. É a origem de tudo.\n\n' +
        '**Formas derivadas do vocal** — o *ricercare* imita a textura do motete; a *canzona* imita a chanson, e é mais rápida e seccional. É delas que sairão a fuga e a sonata.\n\n' +
        '**Variação** — um tema e suas transformações sucessivas. A primeira forma puramente instrumental, sem modelo vocal.\n\n' +
        '**Dança** — pares de danças contrastantes, uma lenta e binária, outra rápida e ternária. É a origem direta da suíte barroca.\n\n' +
        'A pergunta que o século deixa em aberto é a decisiva: sem texto para dar forma ao discurso, **o que organiza uma peça instrumental?** Os dois séculos seguintes serão a resposta.',
    },
    {
      kind: 'CALLOUT',
      id: 'oc07_call',
      type: 'info',
      title: 'A imprensa muda o repertório',
      text:
        'Antes da impressão, a música circulava em manuscritos caros, feitos sob encomenda para instituições. Impressa, ela chega a quem toca em casa — e passa a ser escrita para esse público: mais curta, mais cantável, em língua vernácula. O mercado ajuda a definir o estilo, e isso não começou no século XX.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc07_check',
      question: 'De que gêneros vocais derivam, respectivamente, o ricercare e a canzona?',
      options: [
        'Do madrigal e do Lied',
        'Do motete e da chanson',
        'Da missa e do moteto',
        'Do villancico e da ayre',
      ],
      correctIndex: 1,
      explanation:
        'O ricercare imita a textura imitativa do motete; a canzona imita a chanson, mais rápida e seccional. Deles descendem a fuga e a sonata.',
    },
  ],

  8: [
    {
      kind: 'MARKDOWN',
      id: 'oc08_intro',
      markdown:
        'A ruptura religiosa do século XVI dividiu a Europa e, com ela, a música sacra. Cada lado fez escolhas musicais que decorriam diretamente de sua teologia.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc08_reforma',
      markdown:
        '## A Reforma na Alemanha\n\n' +
        'A posição luterana sobre a música foi favorável e ativa: a congregação deve **cantar**, em sua própria língua, e entender o que canta.\n\n' +
        'Daí o **coral** — melodia simples, estrófica, em alemão, harmonizável em quatro vozes com a melodia no soprano. Muitos corais adaptaram melodias já conhecidas, sacras ou profanas, porque o que importava era que o povo pudesse cantar de imediato.\n\n' +
        'A consequência de longo prazo é enorme. O coral torna-se o material básico da música alemã por dois séculos: é ele que sustenta o prelúdio de coral, a cantata, a Paixão. Toda a tradição instrumental e vocal alemã do barroco cresce sobre esse repertório de melodias comunitárias.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc08_fora',
      markdown:
        '## A Reforma fora da Alemanha\n\n' +
        'A linha calvinista foi bem mais restritiva: apenas texto bíblico, apenas salmos, melodia simples e em uníssono, sem polifonia elaborada e sem órgão no culto. O resultado foi o **saltério métrico** — os salmos versificados na língua de cada país.\n\n' +
        'Na Inglaterra, a via foi intermediária. A liturgia anglicana em inglês produziu o **anthem** e o **service**, que conservam a polifonia mas exigem que a palavra seja compreendida. Essa exigência de inteligibilidade é o que dá ao repertório inglês do período sua clareza característica.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc08_trento',
      markdown:
        '## A Contra-Reforma\n\n' +
        'O Concílio de Trento examinou a música e chegou perto de restringi-la severamente. As queixas eram três: a polifonia tornava o texto ininteligível; melodias profanas apareciam em missas; e a execução era descuidada.\n\n' +
        'O resultado foi moderado — o Concílio pediu clareza do texto e decoro, sem proibir a polifonia. Mas a diretriz teve efeito real: firmou-se um estilo sacro de linhas suaves, dissonâncias preparadas e resolvidas, e declamação clara.\n\n' +
        'Esse estilo foi depois codificado como modelo de contraponto e ensinado como tal durante séculos. É provavelmente o único caso em que uma decisão de concílio produziu um método pedagógico que continua em uso.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc08_veneza',
      markdown:
        '## A escola veneziana\n\n' +
        'Na basílica de São Marcos, com suas galerias opostas, desenvolveu-se o estilo **policoral**: dois ou mais coros separados no espaço, alternando e respondendo um ao outro, com instrumentos.\n\n' +
        'Três novidades saem daí, e todas serão centrais no barroco.\n\n' +
        'O **contraste** como princípio estrutural — de massa, de timbre, de dinâmica. O **espaço** como elemento composicional, pela primeira vez. E a **especificação instrumental**: as partes começam a indicar qual instrumento toca o quê, em vez de deixar em aberto.\n\n' +
        'O estilo veneziano é grandioso, sensorial e teatral. O barroco começa aqui, antes mesmo da ópera.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc08_check',
      question: 'Por que o coral luterano teve consequências tão duradouras na música alemã?',
      options: [
        'Porque era obrigatório por lei',
        'Porque virou o material básico de prelúdios, cantatas e Paixões por dois séculos',
        'Porque era escrito em latim',
        'Porque exigia orquestra',
      ],
      correctIndex: 1,
      explanation:
        'O repertório de melodias comunitárias tornou-se a matéria-prima de praticamente toda a música sacra alemã posterior, vocal e instrumental.',
    },
  ],

  9: [
    {
      kind: 'MARKDOWN',
      id: 'oc09_intro',
      markdown:
        'Por volta de 1600 acontece a mudança mais abrupta da história da música ocidental. Em poucas décadas, o ideal de vozes iguais entrelaçadas é substituído por **uma voz solista sobre um baixo harmônico**.\n\n' +
        'Não foi acidente de gosto: foi um programa. Um grupo de eruditos e músicos florentinos, estudando o que julgavam ser a prática da tragédia grega, concluiu que a polifonia impedia a palavra de comover — várias vozes cantando textos sobrepostos não podem representar uma pessoa falando.\n\n' +
        'A solução proposta foi o **canto que imita a fala**: uma linha vocal que segue as inflexões do discurso, sustentada por acordes simples.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc09_continuo',
      markdown:
        '## O baixo contínuo\n\n' +
        'A prática que define o período inteiro. Escreve-se apenas a **linha do baixo**, com números indicando os intervalos a construir acima dela; um ou mais executantes realizam a harmonia ao teclado, alaúde ou harpa, enquanto um instrumento grave sustenta a linha.\n\n' +
        'As implicações são profundas.\n\n' +
        'A textura passa a ser polarizada: **melodia em cima, baixo embaixo, harmonia preenchendo o meio**. As vozes intermediárias deixam de ser linhas com vida própria e viram recheio.\n\n' +
        'O acorde passa a ser pensado como **objeto vertical**, e não como resultado do encontro de linhas. É o nascimento da harmonia no sentido moderno.\n\n' +
        'E a realização é **parcialmente improvisada**: a partitura deixa de ser prescrição completa. Duas execuções corretas do mesmo baixo soam diferentes.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc09_opera',
      markdown:
        '## A ópera\n\n' +
        'As primeiras óperas aparecem em Florença no fim do século XVI, e em pouco tempo o gênero se firma — sobretudo em Veneza, onde surgem os **teatros públicos pagos**.\n\n' +
        'Essa mudança de local é decisiva. Da corte fechada para o teatro comercial, a ópera passa a depender de público — e o público quer enredo, espetáculo, e sobretudo **melodia que se possa levar embora**.\n\n' +
        'Forma-se então a distinção que estruturará o gênero por dois séculos:\n\n' +
        '**Recitativo** — declamação cantada, ritmo livre, acompanhamento mínimo. É onde a ação acontece.\n\n' +
        '**Ária** — melodia desenvolvida, ritmo regular, acompanhamento pleno. É onde o tempo para e o personagem sente.\n\n' +
        'Ação e emoção passam a ocupar tempos diferentes. Essa separação é a invenção dramática central da ópera.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc09_prattiche',
      markdown:
        '## Prima e seconda prattica\n\n' +
        'A convivência dos dois estilos foi teorizada explicitamente, e virou polêmica pública.\n\n' +
        'A **prima prattica** é a polifonia do século XVI: as regras do contraponto governam, e o texto se acomoda a elas.\n\n' +
        'A **seconda prattica** inverte a hierarquia: o **texto governa**, e o contraponto cede. Uma dissonância não preparada é aceitável se a palavra a justifica.\n\n' +
        'A defesa dessa inversão é um dos documentos mais importantes da história da música, porque estabelece um princípio que vale até hoje: **a regra existe para servir à expressão, e não o contrário**. Toda vanguarda posterior invocará alguma versão desse argumento.\n\n' +
        'E os dois estilos conviveram por mais de um século — o estilo antigo permanecendo como linguagem sacra solene, o novo dominando o teatro.',
    },
    {
      kind: 'CALLOUT',
      id: 'oc09_call',
      type: 'historical',
      title: 'A ópera nasce de um erro produtivo',
      text:
        'Os florentinos acreditavam estar recuperando o modo como a tragédia grega era cantada. Não tinham como saber quase nada sobre isso, e o que supuseram estava errado. Inventaram, achando que restauravam — e o engano produziu o gênero mais influente dos quatro séculos seguintes.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc09_check',
      question: 'Qual é a inversão que a seconda prattica propõe?',
      options: [
        'A melodia passa a estar no baixo',
        'O texto governa e o contraponto cede, em vez do contrário',
        'O ritmo passa a ser ternário',
        'A música sacra passa a usar instrumentos',
      ],
      correctIndex: 1,
      explanation:
        'Na prima prattica as regras do contraponto governam. Na seconda, o texto governa e a dissonância se justifica pela palavra.',
    },
  ],

  10: [
    {
      kind: 'MARKDOWN',
      id: 'oc10_intro',
      markdown:
        'Estabelecida a ópera, a segunda metade do século XVII a espalha pela Europa — e cada país a reconstrói à sua maneira, o que revela muito sobre cada um.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc10_escolas',
      markdown:
        '## Três caminhos\n\n' +
        '**Itália** — a ária cresce e domina; o recitativo encolhe até virar ligação funcional. A voz é o centro absoluto, e forma-se o culto do cantor virtuose. O enredo importa menos que o desempenho vocal.\n\n' +
        '**França** — resistência deliberada ao modelo italiano. A *tragédie lyrique* dá peso ao **coro**, ao **balé** e à declamação ajustada à prosódia francesa, que é diferente da italiana. A ária não se separa tanto do recitativo, e o espetáculo cênico é parte essencial. A ópera francesa é assunto de Estado, ligada à corte.\n\n' +
        '**Inglaterra** — a ópera propriamente dita não se firma. O que prospera é a *masque* e a *semi-opera*, em que música, dança e teatro falado se alternam. O público inglês continuou preferindo ouvir sua língua falada.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc10_dacapo',
      markdown:
        '## A ária da capo\n\n' +
        'A forma que dominará a ópera por um século inteiro. Estrutura **A – B – A**: uma seção, uma seção contrastante, e o retorno da primeira.\n\n' +
        'O retorno não era literal: o cantor devia **ornamentá-lo**, e era justamente ali que demonstrava invenção e domínio. A partitura escrevia a estrutura; o intérprete completava.\n\n' +
        'Dramaticamente, a forma congela a ação — nada avança durante uma ária da capo. Em compensação, dá ao afeto tempo para se instalar e se esgotar. Cada ária apresenta **um** estado emocional e o explora até o fim, o que corresponde à concepção da época: as paixões são estados definidos, e a música sabe representá-los um a um.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc10_camara',
      markdown:
        '## Cantata e oratório\n\n' +
        'Fora do teatro, os mesmos recursos geraram dois gêneros.\n\n' +
        'A **cantata** é uma obra breve para uma ou duas vozes com contínuo, alternando recitativos e árias, sobre texto lírico. É música de câmara, para espaços pequenos e público reduzido — e foi ali, longe da pressão do teatro, que muita coisa se experimentou primeiro.\n\n' +
        'O **oratório** é ópera sacra **sem encenação**: mesmo aparato — solistas, coro, orquestra, recitativo e ária —, assunto bíblico, execução em concerto. Nasceu em parte por necessidade prática: durante a Quaresma os teatros fechavam, e o oratório dava ao público a mesma experiência em contexto devocional.\n\n' +
        'Sua diferença estrutural em relação à ópera é o **coro**, que tem papel muito maior — comenta, narra, representa o povo. É a herança que chegará às grandes obras corais dos séculos seguintes.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc10_check',
      question: 'O que a ária da capo faz com o tempo dramático?',
      options: [
        'Acelera a ação',
        'Congela a ação e dá tempo ao afeto para se instalar e esgotar',
        'Alterna ação e emoção dentro da mesma seção',
        'Substitui o recitativo',
      ],
      correctIndex: 1,
      explanation:
        'Durante a ária nada avança no enredo. A forma A–B–A explora um único estado emocional até o fim, conforme a concepção da época sobre as paixões.',
    },
  ],
};
