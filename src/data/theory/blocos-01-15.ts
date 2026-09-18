import { LessonBlock } from '../../domain/academy';

/**
 * Capítulos I a XV — do fenômeno do som até a noção de grau.
 *
 * Texto autoral. Cada capítulo traz leitura, pelo menos um laboratório que
 * aciona o motor de teoria de verdade, e um checkpoint que cobra o que foi
 * lido. O laboratório não é ilustração: é onde o conceito passa do papel
 * para o ouvido.
 */
export const BLOCOS_01_15: Record<number, LessonBlock[]> = {
  // -------------------------------------------------------------------------
  1: [
    {
      kind: 'MARKDOWN',
      id: 'c01_intro',
      markdown:
        'Música é som organizado no tempo. A definição parece larga demais, e é — mas ela delimita o que interessa: **som** e **tempo**. Tudo o que a teoria estuda cabe nessas duas palavras.\n\n' +
        'Som é vibração. Um corpo elástico — uma corda, uma coluna de ar, uma pele esticada — é posto em movimento, perturba o ar à volta, e essa perturbação chega ao ouvido como onda de pressão. Sem meio material não há som: no vácuo, a corda vibra e ninguém escuta.\n\n' +
        'Nem todo som serve à música. Distingue-se o **som determinado**, cuja vibração é regular e permite reconhecer uma altura, do **ruído**, cuja vibração é irregular. A fronteira não é absoluta — a caixa clara é ruído e é música —, mas o sistema de notação foi construído para sons determinados.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c01_props',
      markdown:
        '## As quatro propriedades\n\n' +
        'Todo som musical tem quatro propriedades **ao mesmo tempo**. Não são fases nem etapas: são quatro perguntas que se respondem sobre o mesmo evento.\n\n' +
        '**Altura** — o som é grave ou agudo. Depende da **frequência**: quantas vibrações por segundo. Mais vibrações, mais agudo. Mede-se em hertz.\n\n' +
        '**Duração** — quanto tempo o som permanece. É a propriedade que a notação rítmica organiza.\n\n' +
        '**Intensidade** — o som é fraco ou forte. Depende da **amplitude** da vibração, isto é, do tamanho do deslocamento, não da sua velocidade.\n\n' +
        '**Timbre** — a qualidade que permite reconhecer *qual* instrumento tocou. Depende da composição da onda: dos harmônicos que acompanham o som fundamental e da força relativa entre eles.',
    },
    {
      kind: 'CALLOUT',
      id: 'c01_call',
      type: 'warning',
      title: 'Altura e intensidade são independentes',
      text:
        'É o erro mais comum de quem começa. Tocar mais forte não deixa o som mais agudo — muda a amplitude, não a frequência. Uma nota grave pode ser fortíssima e uma nota aguda pode ser quase inaudível. São dois controles separados.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c01_audio_altura',
      title: 'A mesma nota, três oitavas',
      description:
        'Mesma classe de altura, frequências diferentes. O nome não muda; o registro sim.',
      notes: ['C3', 'C4', 'C5'],
      playMode: 'SEQUENCE',
      bpm: 60,
    },
    {
      kind: 'MARKDOWN',
      id: 'c01_dimensoes',
      markdown:
        '## As dimensões da organização\n\n' +
        'A música organiza esses sons em quatro planos, e a teoria tem um nome para cada um.\n\n' +
        '**Melodia** é a sucessão de sons, um depois do outro — a dimensão horizontal. É o que se canta e o que se lembra.\n\n' +
        '**Harmonia** é a simultaneidade de sons — a dimensão vertical. É o que sustenta a melodia e lhe dá contexto.\n\n' +
        '**Contraponto** é a combinação de melodias simultâneas, cada uma com vida própria. É harmonia lida na horizontal, ou melodia lida na vertical: depende de onde se põe o foco.\n\n' +
        '**Ritmo** é a organização das durações. Está presente nos três anteriores, porque nenhum som existe fora do tempo.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c01_check',
      question: 'Dois sons têm a mesma frequência, mas um é muito mais forte. O que difere entre eles?',
      options: [
        'A altura',
        'A intensidade',
        'A duração',
        'O timbre necessariamente',
      ],
      correctIndex: 1,
      explanation:
        'Frequência igual significa altura igual. O que muda com a força é a amplitude da vibração, ou seja, a intensidade.',
    },
  ],

  // -------------------------------------------------------------------------
  2: [
    {
      kind: 'MARKDOWN',
      id: 'c02_intro',
      markdown:
        'O sistema ocidental usa **sete nomes** de nota, que se repetem indefinidamente ao subir ou descer: **dó, ré, mi, fá, sol, lá, si**. Depois do si vem outra vez o dó, mais agudo — e a distância entre dois dós consecutivos chama-se **oitava**, porque é a oitava nota contando desde a primeira.\n\n' +
        'Existem duas nomenclaturas em uso simultâneo. A **silábica** — dó, ré, mi… — vem dos países de língua latina. A **alfabética** — C, D, E, F, G, A, B — vem da tradição germânica e inglesa, e é a que aparece em cifras.\n\n' +
        '| Silábica | dó | ré | mi | fá | sol | lá | si |\n' +
        '|---|---|---|---|---|---|---|---|\n' +
        '| Alfabética | C | D | E | F | G | A | B |\n\n' +
        'Repare que a sequência alfabética começa em **A = lá**, e não em dó. Isso é resíduo histórico: a escala de referência mudou, as letras não.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c02_pauta',
      markdown:
        '## A pauta\n\n' +
        'A **pauta** — também chamada pentagrama — é o conjunto de **cinco linhas paralelas** e os **quatro espaços** entre elas. As linhas contam-se sempre **de baixo para cima**: a primeira linha é a de baixo.\n\n' +
        'Uma nota é escrita ou **sobre uma linha**, atravessada por ela, ou **dentro de um espaço**. São nove posições ao todo dentro da pauta: cinco linhas mais quatro espaços.\n\n' +
        'Quanto mais alta a posição, mais agudo o som. A escrita é literal nesse ponto: o desenho sobe quando o som sobe.',
    },
    {
      kind: 'STAFF',
      id: 'c02_staff_posicoes',
      title: 'As nove posições da pauta',
      clef: 'treble',
      notes: ['E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'],
      caption: 'Alternando linha e espaço, de baixo para cima, sem saltar nenhuma posição.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c02_suplementares',
      markdown:
        '## Linhas suplementares\n\n' +
        'Nove posições não bastam. Quando um som ultrapassa os limites da pauta, acrescentam-se **linhas suplementares**: pequenos traços que prolongam o pentagrama acima ou abaixo, usados apenas pela nota que deles precisa.\n\n' +
        'Elas se contam a partir da pauta para fora: a primeira suplementar superior é a mais próxima da quinta linha. A leitura fica mais lenta à medida que se afastam, e é por isso que existem claves diferentes e o sinal de oitava — recursos para evitar acúmulo de suplementares.',
    },
    {
      kind: 'CALLOUT',
      id: 'c02_call',
      type: 'tip',
      title: 'Linha, não espaço',
      text:
        'Ao escrever à mão, a linha deve atravessar a cabeça da nota pelo meio. Uma nota mal centrada vira outra nota — e o leitor não tem como adivinhar qual você quis dizer.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c02_check',
      question: 'Quantas posições de nota cabem dentro da pauta, sem linhas suplementares?',
      options: ['Cinco', 'Sete', 'Nove', 'Onze'],
      correctIndex: 2,
      explanation:
        'Cinco linhas mais quatro espaços: nove posições. Além delas, só com linhas suplementares.',
    },
  ],

  // -------------------------------------------------------------------------
  3: [
    {
      kind: 'MARKDOWN',
      id: 'c03_intro',
      markdown:
        'A pauta sozinha não diz nada. Ela tem posições, mas não tem nomes — a terceira linha é a terceira linha, e nada mais.\n\n' +
        'A **clave** é o sinal colocado no início da pauta que fixa **uma** nota numa **linha** determinada. Fixada essa, todas as outras decorrem por vizinhança: a nota do espaço acima é a seguinte, a do espaço abaixo é a anterior.\n\n' +
        'Existem três desenhos de clave — sol, fá e dó — e cada um pode ocupar linhas diferentes, gerando sete claves em uso histórico. Este capítulo trata das duas mais frequentes.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c03_sol',
      markdown:
        '## Clave de sol\n\n' +
        'A clave de sol é escrita na **segunda linha**, e é dela que vem o nome: a espiral do desenho envolve a segunda linha, declarando que ali está o **sol**.\n\n' +
        'A partir disso, as linhas de baixo para cima são **mi, sol, si, ré, fá**, e os espaços são **fá, lá, dó, mi**. Os espaços formam a palavra que todo estudante decora, e as linhas pedem mais trabalho.\n\n' +
        'É a clave dos registros agudos: violino, flauta, oboé, clarinete, trompete, a mão direita do teclado e as vozes de soprano, contralto e tenor.',
    },
    {
      kind: 'STAFF',
      id: 'c03_staff_sol',
      title: 'Clave de sol — as cinco linhas',
      clef: 'treble',
      notes: ['E4', 'G4', 'B4', 'D5', 'F5'],
      caption: 'Mi, sol, si, ré, fá — da primeira à quinta linha.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c03_fa',
      markdown:
        '## Clave de fá na quarta linha\n\n' +
        'A clave de fá tem dois pontos, e é entre esses pontos que passa a linha do **fá**. Na sua posição mais comum, ela abraça a **quarta linha**.\n\n' +
        'As linhas passam a ser **sol, si, ré, fá, lá**, e os espaços **lá, dó, mi, sol**.\n\n' +
        'É a clave dos registros graves: violoncelo, contrabaixo, fagote, trombone, tuba, a mão esquerda do teclado e a voz de baixo.',
    },
    {
      kind: 'STAFF',
      id: 'c03_staff_fa',
      title: 'Clave de fá — as cinco linhas',
      clef: 'bass',
      notes: ['G2', 'B2', 'D3', 'F3', 'A3'],
      caption: 'Sol, si, ré, fá, lá — mesma posição no papel, som muito mais grave.',
    },
    {
      kind: 'CALLOUT',
      id: 'c03_call',
      type: 'info',
      title: 'O dó central costura as duas',
      text:
        'O dó central fica exatamente na primeira linha suplementar ABAIXO da clave de sol e na primeira linha suplementar ACIMA da clave de fá. É a mesma nota, escrita nas duas pontas — por isso o sistema de piano, com as duas pautas, é contínuo: uma termina onde a outra começa.',
    },
    {
      kind: 'KEYBOARD',
      id: 'c03_teclado',
      title: 'O dó central no teclado',
      highlightNotes: ['C4'],
      startOctave: 3,
      octaves: 2,
    },
    {
      kind: 'CHECKPOINT',
      id: 'c03_check',
      question: 'Uma nota está na terceira linha. Que nota é?',
      options: [
        'Si, sempre',
        'Ré, sempre',
        'Depende da clave',
        'Depende da armadura',
      ],
      correctIndex: 2,
      explanation:
        'A posição por si só não nomeia nada. Em clave de sol a terceira linha é si; em clave de fá na quarta linha é ré. A clave é quem decide.',
    },
  ],

  // -------------------------------------------------------------------------
  4: [
    {
      kind: 'MARKDOWN',
      id: 'c04_intro',
      markdown:
        'A altura resolve-se com a posição na pauta. A **duração** resolve-se com o **desenho** da nota — se a cabeça é vazia ou cheia, se tem haste, se tem colchete.\n\n' +
        'O sistema é proporcional e não absoluto: uma figura não vale um número fixo de segundos. Ela vale **o dobro da seguinte**. Quanto isso dura em segundos depende do andamento, que é assunto de outro capítulo.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c04_figuras',
      markdown:
        '## As sete figuras\n\n' +
        '| Figura | Vale | Desenho |\n' +
        '|---|---|---|\n' +
        '| Semibreve | 4 tempos | cabeça vazia, sem haste |\n' +
        '| Mínima | 2 tempos | cabeça vazia, com haste |\n' +
        '| Semínima | 1 tempo | cabeça cheia, com haste |\n' +
        '| Colcheia | 1/2 tempo | um colchete |\n' +
        '| Semicolcheia | 1/4 de tempo | dois colchetes |\n' +
        '| Fusa | 1/8 de tempo | três colchetes |\n' +
        '| Semifusa | 1/16 de tempo | quatro colchetes |\n\n' +
        'Cada colchete acrescentado divide a duração por dois. O padrão é regular e pode ser continuado — existem grafias com cinco e seis colchetes, raríssimas.\n\n' +
        'Os valores em tempos da tabela supõem a semínima como unidade de tempo. É o caso mais comum, mas não é lei: em compasso de 2/2 é a mínima que vale um tempo, e a tabela inteira se desloca.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c04_pausas',
      markdown:
        '## As pausas\n\n' +
        'Cada figura tem uma **pausa** de valor equivalente. O silêncio é medido com o mesmo rigor que o som, e uma pausa mal contada estraga o compasso tanto quanto uma nota mal contada.\n\n' +
        'A pausa de semibreve é um retângulo **suspenso sob a quarta linha**; a de mínima é um retângulo **apoiado sobre a terceira**. A diferença de posição é a única coisa que as distingue, e trocá-las dobra ou divide pela metade a duração do silêncio.\n\n' +
        'A pausa de semibreve tem ainda um uso especial: sozinha no compasso, ela indica **compasso inteiro de silêncio**, seja qual for a fórmula — mesmo num compasso de três tempos, onde ela não valeria quatro.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c04_divisao',
      markdown:
        '## Divisão binária e divisão ternária\n\n' +
        'A figura simples divide-se **por dois**: uma semínima em duas colcheias, uma colcheia em duas semicolcheias. É a **divisão binária**, e é a que o próprio desenho das figuras já traz embutida.\n\n' +
        'Quando se quer dividir **por três**, o sistema não tem figura própria: recorre-se à figura pontuada — assunto do próximo capítulo — ou à quiáltera. Essa assimetria entre o binário, que é nativo, e o ternário, que precisa de sinal, atravessa toda a notação rítmica.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c04_antigos',
      markdown:
        '## Valores antigos e valores extremos\n\n' +
        'Antes da semibreve existiam figuras maiores, herdadas da notação medieval e hoje fora de uso corrente: a **breve**, que vale duas semibreves, e a **longa**, que vale duas breves. A breve ainda aparece, escrita como um retângulo entre duas barras verticais, em música antiga e em finais suspensos.\n\n' +
        'Na outra ponta, a **quartifusa** e a **quintifusa** — cinco e seis colchetes — existem no sistema mas praticamente não se escrevem: a essa altura é mais legível mudar a unidade de tempo do compasso.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c04_audio',
      title: 'A proporção, ouvida',
      description:
        'Mesma altura, durações sucessivamente divididas por dois. A proporção é o que se ouve; o som é irrelevante aqui.',
      notes: ['C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4'],
      playMode: 'SEQUENCE',
      bpm: 120,
    },
    {
      kind: 'CHECKPOINT',
      id: 'c04_check',
      question: 'Quantas semicolcheias cabem numa mínima?',
      options: ['Quatro', 'Seis', 'Oito', 'Dezesseis'],
      correctIndex: 2,
      explanation:
        'Mínima = 2 semínimas = 4 colcheias = 8 semicolcheias. Cada degrau da escada dobra a quantidade.',
    },
  ],

  // -------------------------------------------------------------------------
  5: [
    {
      kind: 'MARKDOWN',
      id: 'c05_intro',
      markdown:
        'Os sete nomes de nota não estão igualmente espaçados. Entre algumas notas vizinhas a distância é **um tom**; entre outras, **meio tom**.\n\n' +
        'O **semitom** é a menor distância do sistema ocidental temperado. No teclado, é a distância entre duas teclas imediatamente vizinhas, contando as pretas. O **tom** vale dois semitons.\n\n' +
        'Na sequência natural das sete notas, há semitom em dois pontos apenas: **mi–fá** e **si–dó**. Todos os outros passos são de um tom. É exatamente por isso que o teclado tem teclas pretas em grupos de dois e de três: onde falta a preta, o semitom já estava lá.',
    },
    {
      kind: 'KEYBOARD',
      id: 'c05_teclado',
      title: 'Os dois semitons naturais',
      highlightNotes: ['E4', 'F4', 'B4', 'C5'],
      startOctave: 4,
      octaves: 2,
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c05_lab_semitom',
      title: 'Mi–fá: um semitom',
      lowerNote: 'E4',
      upperNote: 'F4',
      prompt: 'A menor distância do sistema. Ouça e peça a análise.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c05_lab_tom',
      title: 'Dó–ré: um tom',
      lowerNote: 'C4',
      upperNote: 'D4',
      prompt: 'O dobro da distância anterior. Compare quanto soa mais aberto.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c05_tipos',
      markdown:
        '## Semitom diatônico e semitom cromático\n\n' +
        'Dois semitons podem soar idênticos e ser coisas diferentes na escrita.\n\n' +
        'O **semitom diatônico** ocorre entre notas de **nomes diferentes**: mi–fá, si–dó, dó–réb.\n\n' +
        'O **semitom cromático** ocorre entre notas de **mesmo nome**, uma delas alterada: dó–dó♯, si–si♭.\n\n' +
        'A distância sonora é a mesma no sistema temperado. O que muda é a função, e a grafia informa essa função a quem lê.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c05_acidentes',
      markdown:
        '## Os cinco acidentes\n\n' +
        'Para alterar a altura de uma nota escrita, o sistema usa cinco sinais, colocados **antes** da nota na escrita e ditos **depois** do nome na fala — escreve-se ♯ antes do dó, mas diz-se "dó sustenido".\n\n' +
        '**Sustenido (♯)** — sobe um semitom.\n' +
        '**Bemol (♭)** — desce um semitom.\n' +
        '**Bequadro (♮)** — cancela qualquer alteração anterior e devolve a nota ao estado natural.\n' +
        '**Dobrado sustenido (𝄪)** — sobe um tom inteiro.\n' +
        '**Dobrado bemol (𝄫)** — desce um tom inteiro.\n\n' +
        'Os dobrados não são curiosidade: aparecem sempre que a lógica da escala exige. O sétimo grau de sol♯ menor harmônica é **fá𝄪**, e escrevê-lo como sol seria mais simples de ler e errado de analisar.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c05_alcance',
      markdown:
        '## Onde cada alteração vale\n\n' +
        'Um acidente tem três modos de existir, e confundi-los gera erro de leitura.\n\n' +
        'A alteração **fixa** é a da armadura de clave: vale para a peça inteira, em todas as oitavas, até que a armadura mude.\n\n' +
        'A alteração **ocorrente** — ou acidental — é a escrita no meio da música: vale do ponto em que aparece **até o fim daquele compasso**, e **apenas naquela oitava**. Passada a barra de compasso, ela caduca.\n\n' +
        'A alteração **de precaução** não altera nada: é escrita entre parênteses apenas para lembrar ao executante que a alteração anterior já não vale. É cortesia editorial, e boas edições usam bastante.',
    },
    {
      kind: 'CALLOUT',
      id: 'c05_call',
      type: 'warning',
      title: 'A ligadura atravessa a barra',
      text:
        'Um acidente morre na barra de compasso — exceto se a nota estiver ligada a uma nota do compasso seguinte. Nesse caso a alteração acompanha a ligadura, porque é o mesmo som prolongado. É a única exceção, e ela cai em prova.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c05_check',
      question: 'Um sustenido aparece num fá no meio do compasso. Ele afeta o quê?',
      options: [
        'Todos os fás da peça',
        'Todos os fás desse compasso, em qualquer oitava',
        'Os fás daquela oitava até o fim do compasso',
        'Apenas aquela nota',
      ],
      correctIndex: 2,
      explanation:
        'O acidente ocorrente vale até a barra de compasso e apenas na oitava em que foi escrito. Um fá de outra oitava, no mesmo compasso, permanece natural.',
    },
  ],

  // -------------------------------------------------------------------------
  6: [
    {
      kind: 'MARKDOWN',
      id: 'c06_intro',
      markdown:
        'O sistema de figuras divide sempre por dois, e por isso não escreve durações de três unidades. O **ponto de aumento** resolve isso.\n\n' +
        'Colocado **à direita da cabeça da nota**, o ponto acrescenta **metade do valor** da figura a que se aplica.\n\n' +
        '- Semínima pontuada = semínima + colcheia = **um tempo e meio**\n' +
        '- Mínima pontuada = mínima + semínima = **três tempos**\n' +
        '- Colcheia pontuada = colcheia + semicolcheia = **três quartos de tempo**\n\n' +
        'A regra é sempre a mesma: metade do que está escrito, somada ao que está escrito.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c06_duplo',
      markdown:
        '## Ponto duplo e ponto triplo\n\n' +
        'Podem-se acumular pontos. **Cada ponto vale metade do ponto anterior**, e não metade da figura.\n\n' +
        'Mínima com **dois** pontos: mínima (2) + semínima (1) + colcheia (0,5) = **3,5 tempos**.\n\n' +
        'Mínima com **três** pontos: 2 + 1 + 0,5 + 0,25 = **3,75 tempos**.\n\n' +
        'Repare no padrão: cada ponto novo aproxima o valor do dobro da figura original sem nunca alcançá-lo. O ponto triplo é raro; o duplo aparece com frequência em música barroca e em marchas.',
    },
    {
      kind: 'CALLOUT',
      id: 'c06_call',
      type: 'tip',
      title: 'Onde o ponto se escreve',
      text:
        'Se a nota está num espaço, o ponto vai nesse mesmo espaço. Se a nota está sobre uma linha, o ponto sobe para o espaço acima — nunca sobre a linha, onde se confundiria com a própria nota.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c06_pausas',
      markdown:
        '## O ponto nas pausas\n\n' +
        'As pausas também se pontuam, com exatamente a mesma regra: uma pausa de semínima pontuada dura um tempo e meio de silêncio.\n\n' +
        'Há uma restrição de boa escrita: evita-se a pausa pontuada quando ela atravessa a divisão natural do compasso, porque o leitor perde a referência do tempo forte. Nesse caso escrevem-se duas pausas separadas, ainda que a soma seja a mesma.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c06_check',
      question: 'Quanto vale uma semínima com ponto duplo, em compasso de semínima por tempo?',
      options: ['1,5 tempo', '1,75 tempo', '2 tempos', '2,5 tempos'],
      correctIndex: 1,
      explanation:
        'Semínima (1) + colcheia (0,5) + semicolcheia (0,25) = 1,75. O segundo ponto vale metade do primeiro, não metade da figura.',
    },
  ],

  // -------------------------------------------------------------------------
  7: [
    {
      kind: 'MARKDOWN',
      id: 'c07_intro',
      markdown:
        'Existe um segundo ponto na notação, e ele faz o contrário do primeiro.\n\n' +
        'O **ponto de diminuição** — o mesmo sinal, colocado **acima ou abaixo** da cabeça da nota, e não ao lado — indica que a nota deve ser **encurtada e destacada**. É o sinal que se chama correntemente de *staccato*.\n\n' +
        'A duração escrita não muda no cômputo do compasso: a nota continua ocupando o mesmo lugar no tempo. O que muda é quanto desse tempo é som e quanto é silêncio. Convencionalmente, toca-se cerca de metade do valor e cala-se o resto.',
    },
    {
      kind: 'CALLOUT',
      id: 'c07_call',
      type: 'warning',
      title: 'A posição decide tudo',
      text:
        'Ponto ao LADO da cabeça: aumento — a nota dura mais. Ponto ACIMA ou ABAIXO da cabeça: diminuição — a nota dura menos. É o mesmo desenho produzindo efeitos opostos, e a única informação que os distingue é onde ele está.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c07_graus',
      markdown:
        '## Os graus do destacado\n\n' +
        'O destacado tem intensidades, e a notação distingue três.\n\n' +
        '**Staccato** — ponto simples. Encurta cerca de metade.\n\n' +
        '**Staccatissimo** — cunha vertical em vez de ponto. Encurta ao mínimo, ataque seco.\n\n' +
        '**Portato** ou *mezzo-staccato* — pontos **sob uma ligadura**. Notas separadas, mas sem interromper a linha: cada uma tem seu ataque, e o conjunto permanece ligado em caráter.\n\n' +
        'A execução depende do instrumento. No violino é questão de arco; no piano, de dedo e pedal; no sopro, de articulação da língua. O sinal é o mesmo; a técnica que o realiza, não.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c07_check',
      question: 'Uma semínima com ponto sobre a cabeça, em compasso 4/4. Quanto tempo ela ocupa no compasso?',
      options: [
        'Meio tempo',
        'Um tempo, sendo parte som e parte silêncio',
        'Um tempo e meio',
        'Depende do andamento',
      ],
      correctIndex: 1,
      explanation:
        'O ponto de diminuição não altera a contagem: a nota continua valendo um tempo. Ela é apenas tocada mais curta, e o restante do tempo é silêncio.',
    },
  ],

  // -------------------------------------------------------------------------
  8: [
    {
      kind: 'MARKDOWN',
      id: 'c08_intro',
      markdown:
        '**Legato** é o contrário do destacado: as notas sucedem-se sem interrupção audível entre elas. Uma termina exatamente quando a outra começa, sem respiro.\n\n' +
        'O sinal é uma **linha curva** que cobre o grupo de notas a serem ligadas. E é aqui que mora uma das confusões mais persistentes da notação, porque a mesma curva tem três significados diferentes.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c08_tres',
      markdown:
        '## Três ligaduras, um desenho\n\n' +
        '**Ligadura de expressão** — une notas de **alturas diferentes**. Significa: toque tudo isso ligado. Todas as notas soam.\n\n' +
        '**Ligadura de valor** — une duas notas de **altura idêntica**. Significa: some as durações e toque **uma só**. A segunda nota não é atacada; ela é o prolongamento da primeira.\n\n' +
        '**Ligadura de portamento** — une duas notas com a indicação de que se deslize de uma à outra, passando pelas alturas intermediárias. Existe em instrumentos de altura contínua — cordas sem trastes, voz, trombone de vara — e não no piano.\n\n' +
        'A regra para distinguir as duas primeiras é mecânica: **alturas iguais, é valor; alturas diferentes, é expressão**. Não há ambiguidade.',
    },
    {
      kind: 'CALLOUT',
      id: 'c08_call',
      type: 'info',
      title: 'Por que a ligadura de valor existe',
      text:
        'Ela permite escrever durações que nenhuma figura representa — por exemplo cinco tempos — e permite prolongar um som ATRAVÉS da barra de compasso, coisa que uma figura sozinha não pode fazer, já que nenhuma nota pode ser escrita a cavalo entre dois compassos.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c08_frase',
      markdown:
        '## A ligadura como frase\n\n' +
        'Além de instrução técnica, a ligadura de expressão delimita **unidades de sentido**. Uma curva longa sobre oito compassos não pede apenas legato: declara que aquilo é uma frase, e deve ser tocado como um gesto único, com um ponto de chegada.\n\n' +
        'Em música de cordas a ligadura acumula ainda um terceiro sentido — indica **uma única arcada** —, e é preciso ler o contexto para saber se o compositor pensava em fraseado, em técnica, ou nos dois.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c08_check',
      question: 'Duas notas de mesma altura unidas por linha curva. O que se toca?',
      options: [
        'As duas, ligadas',
        'Uma só, com a soma das durações',
        'As duas, destacadas',
        'Um portamento entre elas',
      ],
      correctIndex: 1,
      explanation:
        'Alturas iguais caracterizam ligadura de valor: as durações se somam e a segunda nota não recebe ataque. Entre alturas diferentes, a mesma curva significaria legato.',
    },
  ],

  // -------------------------------------------------------------------------
  9: [
    {
      kind: 'MARKDOWN',
      id: 'c09_intro',
      markdown:
        'Sol e fá na quarta linha atendem os extremos. Sobra o meio — as vozes e instrumentos de registro intermediário, que ficariam cheios de linhas suplementares em qualquer das duas.\n\n' +
        'Para eles existe a **clave de dó**, cujo desenho marca a linha do **dó central** (aproximadamente 261,6 Hz). Ela pode ocupar quatro linhas diferentes, e cada posição gera uma clave distinta.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c09_tabela',
      markdown:
        '## As sete claves do sistema\n\n' +
        '| Clave | Linha | Uso principal |\n' +
        '|---|---|---|\n' +
        '| Sol | 2ª | violino, flauta, mão direita |\n' +
        '| Fá | 4ª | violoncelo, fagote, mão esquerda |\n' +
        '| Fá | 3ª | histórica, registro de barítono |\n' +
        '| Dó | 3ª (**alto**) | viola |\n' +
        '| Dó | 4ª (**tenor**) | violoncelo e fagote no agudo, trombone tenor |\n' +
        '| Dó | 1ª (**soprano**) | histórica, voz aguda |\n' +
        '| Dó | 2ª (**mezzo**) | histórica |\n\n' +
        'Das quatro claves de dó, duas permanecem em uso corrente: **alto**, que é a clave própria da viola, e **tenor**, usada nos registros agudos do violoncelo, do fagote e do trombone para evitar suplementares.\n\n' +
        'A clave de fá na **terceira** linha e as claves de dó em primeira e segunda linha aparecem em música antiga e em edições urtext. Saber lê-las é requisito para quem trabalha com repertório anterior ao século XIX.',
    },
    {
      kind: 'STAFF',
      id: 'c09_staff_alto',
      title: 'Clave de dó na terceira linha (alto)',
      clef: 'alto',
      notes: ['F3', 'A3', 'C4', 'E4', 'G4'],
      caption: 'As cinco linhas: fá, lá, dó, mi, sol. O dó central está na terceira linha.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c09_metodo',
      markdown:
        '## Como se lê uma clave nova\n\n' +
        'Não se decora tabela. Fixa-se **uma** referência e conta-se por vizinhança.\n\n' +
        'Na clave de dó, a referência é dada pelo próprio sinal: a linha que ele marca é o dó central. Tudo o mais decorre — o espaço acima é ré, a linha acima é mi, e assim por diante.\n\n' +
        'Com prática, a referência deixa de ser calculada e passa a ser reconhecida. É a mesma coisa que aconteceu com a clave de sol: ninguém conta "mi, sol, si" para ler a terceira linha.',
    },
    {
      kind: 'CALLOUT',
      id: 'c09_call',
      type: 'tip',
      title: 'Transposição de clave',
      text:
        'Trocar a clave equivale a transpor o que está escrito. Ler um trecho de clave de sol como se fosse clave de dó em terceira linha soa uma sétima abaixo. É assim que se transporta à primeira vista sem reescrever nada — e é uma das habilidades mais úteis que a leitura em claves diversas dá.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c09_check',
      question: 'Qual é a clave própria da viola?',
      options: [
        'Clave de sol',
        'Clave de fá na quarta linha',
        'Clave de dó na terceira linha',
        'Clave de dó na quarta linha',
      ],
      correctIndex: 2,
      explanation:
        'A viola lê em clave de dó na terceira linha, chamada clave de alto. O registro dela cai justamente entre o violino e o violoncelo.',
    },
  ],

  // -------------------------------------------------------------------------
  10: [
    {
      kind: 'MARKDOWN',
      id: 'c10_intro',
      markdown:
        '**Intervalo** é a distância entre duas notas. Classificá-lo exige **duas** informações independentes, e é por isso que quem tenta resolver com uma só sempre erra.\n\n' +
        'O **número** conta os nomes de nota envolvidos, incluindo as duas pontas. De dó a mi: dó, ré, mi — três nomes, **terça**. A contagem ignora completamente os acidentes.\n\n' +
        'A **qualidade** mede a distância exata em tons e semitons, e é ela quem distingue uma terça maior de uma terça menor.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c10_duas_familias',
      markdown:
        '## Duas famílias de intervalos\n\n' +
        'Os intervalos dividem-se em duas famílias que se comportam de modo diferente.\n\n' +
        '**Uníssono, quarta, quinta e oitava** admitem a qualidade **justa**. Não existe quarta maior nem quinta menor: essas distâncias, na escala natural, dão um resultado só, e quando alteradas tornam-se aumentadas ou diminutas — nunca maiores ou menores.\n\n' +
        '**Segunda, terça, sexta e sétima** admitem **maior** e **menor**. A menor é sempre um semitom mais estreita que a maior.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c10_tabela',
      markdown:
        '## Tabela de referência\n\n' +
        '| Intervalo | Semitons | Exemplo a partir de dó |\n' +
        '|---|---|---|\n' +
        '| Uníssono justo | 0 | dó–dó |\n' +
        '| Segunda menor | 1 | dó–réb |\n' +
        '| Segunda maior | 2 | dó–ré |\n' +
        '| Terça menor | 3 | dó–mib |\n' +
        '| Terça maior | 4 | dó–mi |\n' +
        '| Quarta justa | 5 | dó–fá |\n' +
        '| Quinta justa | 7 | dó–sol |\n' +
        '| Sexta menor | 8 | dó–láb |\n' +
        '| Sexta maior | 9 | dó–lá |\n' +
        '| Sétima menor | 10 | dó–sib |\n' +
        '| Sétima maior | 11 | dó–si |\n' +
        '| Oitava justa | 12 | dó–dó |\n\n' +
        'Falta o 6 nessa tabela: é o trítono, e ele tem capítulo próprio a seguir.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c10_lab_3M',
      title: 'Terça maior',
      lowerNote: 'C4',
      upperNote: 'E4',
      prompt: 'Quatro semitons. O intervalo que define o caráter maior de um acorde.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c10_lab_3m',
      title: 'Terça menor',
      lowerNote: 'C4',
      upperNote: 'E4',
      prompt: 'Três semitons — um a menos. Mesmo número, qualidade diferente, e o caráter muda inteiro.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c10_lab_5J',
      title: 'Quinta justa',
      lowerNote: 'C4',
      upperNote: 'G4',
      prompt: 'Sete semitons. O intervalo mais estável depois da oitava.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c10_harmonico',
      markdown:
        '## Melódico e harmônico\n\n' +
        'O intervalo é **melódico** quando as notas soam em sequência, e **harmônico** quando soam juntas. A classificação é idêntica nos dois casos — o que muda é o efeito.\n\n' +
        'O intervalo melódico ainda se qualifica como **ascendente** ou **descendente**, e reconhecer um intervalo descendente de ouvido é mais difícil do que reconhecer o mesmo intervalo subindo. Convém treinar os dois.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c10_check',
      question: 'Por que não existe "quarta maior"?',
      options: [
        'Porque a quarta é dissonante',
        'Porque uníssono, quarta, quinta e oitava só admitem justo, aumentado ou diminuto',
        'Porque a quarta é rara',
        'Porque a quarta equivale à quinta invertida',
      ],
      correctIndex: 1,
      explanation:
        'A quarta pertence à família dos justos. Alterada, ela vira aumentada ou diminuta — as qualidades maior e menor não se aplicam a essa família.',
    },
  ],

  // -------------------------------------------------------------------------
  11: [
    {
      kind: 'MARKDOWN',
      id: 'c11_intro',
      markdown:
        'Um intervalo pode ser alargado ou encolhido para além das qualidades básicas. As regras dependem da família a que ele pertence.\n\n' +
        '**Família dos justos** (uníssono, quarta, quinta, oitava):\n' +
        '- justo + 1 semitom = **aumentado**\n' +
        '- justo − 1 semitom = **diminuto**\n\n' +
        '**Família dos maiores e menores** (segunda, terça, sexta, sétima):\n' +
        '- maior + 1 semitom = **aumentado**\n' +
        '- menor − 1 semitom = **diminuto**\n\n' +
        'Repare na assimetria: na segunda família, entre o aumentado e o diminuto há **dois** degraus intermediários (maior e menor), enquanto na primeira há apenas um (justo).',
    },
    {
      kind: 'MARKDOWN',
      id: 'c11_dobrados',
      markdown:
        '## Superaumentado e subdiminuto\n\n' +
        'A alteração pode continuar. Um intervalo aumentado ampliado outro semitom torna-se **superaumentado**; um diminuto reduzido outro semitom torna-se **subdiminuto**.\n\n' +
        'São raros, e exigem acidentes dobrados para serem escritos. Aparecem sobretudo em análise de música cromática do fim do século XIX, onde a condução das vozes justifica grafias que de outro modo pareceriam gratuitas.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c11_tritono',
      markdown:
        '## O trítono\n\n' +
        'Seis semitons. Pode ser escrito como **quarta aumentada** (fá–si) ou como **quinta diminuta** (si–fá). O som é o mesmo; a função, não.\n\n' +
        'O nome vem de "três tons", e o intervalo tem duas propriedades notáveis. Primeira: divide a oitava exatamente ao meio. Segunda: é o único intervalo cuja **inversão é ele mesmo** — invertida, a quarta aumentada dá quinta diminuta, que continua valendo seis semitons.\n\n' +
        'Essa ambiguidade é o motor da modulação cromática. O trítono do acorde de dominante pode resolver em duas direções diferentes conforme seja lido como quarta aumentada ou como quinta diminuta — e é isso que permite o acorde de sexta aumentada alemã e o intercâmbio de dominantes a distância de trítono.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c11_lab_tritono',
      title: 'Trítono',
      lowerNote: 'F4',
      upperNote: 'B4',
      prompt: 'Seis semitons. Ouça a tensão: ele não fica parado, quer resolver.',
    },
    {
      kind: 'CALLOUT',
      id: 'c11_call',
      type: 'historical',
      title: 'O intervalo que se evitava',
      text:
        'Durante séculos a prática do canto litúrgico evitou o trítono melódico, pela dificuldade de entoá-lo e pela instabilidade que produz. A regra era prática, não superstição — e foi justamente essa instabilidade que a música tonal, mais tarde, aprendeu a usar como motor.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c11_check',
      question: 'Uma quinta justa reduzida em um semitom torna-se o quê?',
      options: [
        'Quinta menor',
        'Quinta diminuta',
        'Quarta aumentada',
        'Quarta justa',
      ],
      correctIndex: 1,
      explanation:
        'A quinta é da família dos justos, que não admite maior nem menor. Reduzida, torna-se diminuta. Quarta aumentada é outra grafia do mesmo som, não do mesmo intervalo.',
    },
  ],

  // -------------------------------------------------------------------------
  12: [
    {
      kind: 'MARKDOWN',
      id: 'c12_intro',
      markdown:
        'Os intervalos até a oitava chamam-se **simples**. Os que a ultrapassam chamam-se **compostos**.\n\n' +
        'A regra de nomeação é direta: continua-se a contar os nomes de nota. De dó a ré na oitava seguinte há nove nomes — é uma **nona**. A seguir vêm **décima**, **décima primeira**, **décima segunda**, **décima terceira**.\n\n' +
        'Para reduzir um composto ao simples correspondente, **subtrai-se sete**. Nona → segunda. Décima → terça. Décima primeira → quarta. Décima terceira → sexta.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c12_qualidade',
      markdown:
        '## A qualidade não muda\n\n' +
        'A redução preserva a qualidade. Uma **décima maior** reduz-se a uma **terça maior**; uma **nona menor** reduz-se a uma **segunda menor**. Acrescentar uma oitava não altera a relação, apenas a distribui.\n\n' +
        'Por isso, na prática, quem reconhece intervalos simples reconhece os compostos: basta identificar a classe e somar a oitava.',
    },
    {
      kind: 'CALLOUT',
      id: 'c12_call',
      type: 'info',
      title: 'Quando se usa o nome composto',
      text:
        'Na harmonia, os nomes compostos importam: nona, décima primeira e décima terceira designam notas que se acrescentam ao acorde ACIMA da sétima, e chamá-las de segunda, quarta e sexta apagaria essa distinção. Na análise melódica, ao contrário, quase sempre se reduz ao simples.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c12_lab_decima',
      title: 'Décima maior',
      lowerNote: 'C3',
      upperNote: 'E4',
      prompt: 'Uma terça maior mais uma oitava. Compare com a terça simples do capítulo X.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c12_check',
      question: 'A que intervalo simples corresponde uma décima primeira justa?',
      options: ['Terça justa', 'Quarta justa', 'Quinta justa', 'Sexta justa'],
      correctIndex: 1,
      explanation:
        '11 − 7 = 4. É uma quarta justa acrescida de uma oitava, e a qualidade permanece justa.',
    },
  ],

  // -------------------------------------------------------------------------
  13: [
    {
      kind: 'MARKDOWN',
      id: 'c13_intro',
      markdown:
        '**Inverter** um intervalo é transpor a nota grave uma oitava acima — ou a aguda uma oitava abaixo — de modo que troquem de posição.\n\n' +
        'O resultado é previsível, e duas regras bastam.\n\n' +
        '**Regra do nove**: o número do intervalo somado ao número da sua inversão dá sempre **nove**. Terça inverte em sexta (3+6=9). Segunda inverte em sétima. Quarta inverte em quinta. Uníssono inverte em oitava.\n\n' +
        '**Regra da qualidade**: maior ↔ menor, aumentado ↔ diminuto, e **justo permanece justo**.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c13_uso',
      markdown:
        '## Para que serve\n\n' +
        'Primeiro: **reconhecimento**. Intervalos grandes são difíceis de identificar de ouvido; os pequenos, não. Diante de uma sexta, inverte-se mentalmente para terça, identifica-se a terça, e reconstrói-se a resposta.\n\n' +
        'Segundo: **escrita**. Calcular uma sétima maior acima de si é trabalhoso; calcular uma segunda menor abaixo é imediato. Chega-se a lá♯, e a resposta é essa, uma oitava acima.\n\n' +
        'Terceiro: **análise harmônica**. As inversões de acorde nada mais são do que intervalos invertidos, e quem domina a mecânica aqui não precisa reaprendê-la lá.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c13_porque',
      markdown:
        '## Por que nove, e não oito\n\n' +
        'Porque a contagem de intervalos **inclui as duas pontas**. Dó a mi conta três nomes; mi a dó conta seis; e o dó foi contado duas vezes, uma em cada intervalo. Três mais seis dá nove, que é oito mais um — a oitava, mais a nota contada em dobro.\n\n' +
        'É a mesma razão pela qual uma oitava tem sete notas diferentes e não oito.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c13_lab_sexta',
      title: 'Sexta menor — a inversão da terça maior',
      lowerNote: 'E4',
      upperNote: 'C5',
      prompt: 'Compare com a terça maior dó–mi do capítulo X. Mesmas notas, ordem trocada.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c13_check',
      question: 'Qual é a inversão de uma terça menor?',
      options: ['Sexta menor', 'Sexta maior', 'Quinta justa', 'Sétima maior'],
      correctIndex: 1,
      explanation:
        '3 + 6 = 9, logo o número é sexta; e menor inverte em maior. Sexta maior.',
    },
  ],

  // -------------------------------------------------------------------------
  14: [
    {
      kind: 'MARKDOWN',
      id: 'c14_intro',
      markdown:
        '**Enarmonia** é a relação entre duas notas de **grafia diferente** e **som idêntico**. Dó♯ e ré♭ são a mesma tecla do piano e a mesma frequência no sistema temperado — e são notas diferentes na partitura.\n\n' +
        'Toda nota tem equivalentes enarmônicos. Alguns são triviais (fá♯ = sol♭); outros exigem acidentes dobrados (dó = si♯ = ré𝄫).\n\n' +
        'Isso não é redundância do sistema. A grafia carrega informação que o som não carrega.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c14_funcao',
      markdown:
        '## O que a grafia informa\n\n' +
        'A escolha entre dó♯ e ré♭ diz **para onde a nota vai**.\n\n' +
        'Um **dó♯** é uma nota elevada, e a tendência de uma nota elevada é **subir** — ela resolve em ré. Um **ré♭** é uma nota abaixada, e abaixadas **descem** — ele resolve em dó.\n\n' +
        'O executante lê essa informação e ajusta o fraseado. Num instrumento de altura contínua — violino, voz, trombone — ele ajusta até a afinação: intérpretes tocam sensíveis ligeiramente altas e notas abaixadas ligeiramente baixas, contrariando o temperamento em favor da direção melódica.\n\n' +
        'Escrever a enarmonia errada não deixa a partitura só feia: instrui mal quem toca.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c14_tonalidades',
      markdown:
        '## Enarmonia de tonalidades\n\n' +
        'Tonalidades inteiras podem ser enarmônicas. **Dó♯ maior** (sete sustenidos) e **ré♭ maior** (cinco bemóis) soam exatamente iguais.\n\n' +
        'Os três pares enarmônicos do ciclo das quintas são:\n' +
        '- si maior (5♯) ↔ dó♭ maior (7♭)\n' +
        '- fá♯ maior (6♯) ↔ sol♭ maior (6♭)\n' +
        '- dó♯ maior (7♯) ↔ ré♭ maior (5♭)\n\n' +
        'Na prática escolhe-se a armadura com menos acidentes — ré♭ em vez de dó♯ —, exceto quando o contexto harmônico da peça exige a outra grafia para que as resoluções façam sentido.',
    },
    {
      kind: 'CALLOUT',
      id: 'c14_call',
      type: 'warning',
      title: 'Enarmonia é propriedade do temperamento',
      text:
        'Dó♯ e ré♭ só são o mesmo som porque a afinação temperada igualou os doze semitons. Em sistemas de afinação anteriores, e em instrumentos de altura contínua tocando expressivamente, essas duas notas NÃO coincidem. A enarmonia é uma conveniência histórica, não uma verdade acústica.',
    },
    {
      kind: 'KEYBOARD',
      id: 'c14_teclado',
      title: 'Uma tecla, dois nomes',
      highlightNotes: ['C#4', 'F#4'],
      startOctave: 4,
      octaves: 1,
    },
    {
      kind: 'CHECKPOINT',
      id: 'c14_check',
      question: 'Por que escrever ré♭ em vez de dó♯ num trecho, se soam igual?',
      options: [
        'Porque ré♭ é mais fácil de ler',
        'Porque a grafia indica a direção de resolução e a função da nota',
        'Porque bemóis soam mais graves',
        'Não há diferença; é escolha livre',
      ],
      correctIndex: 1,
      explanation:
        'A grafia informa função: nota elevada tende a subir, nota abaixada tende a descer. Isso orienta fraseado e, em instrumentos de altura contínua, a própria afinação.',
    },
  ],

  // -------------------------------------------------------------------------
  15: [
    {
      kind: 'MARKDOWN',
      id: 'c15_intro',
      markdown:
        '**Escala** é a sucessão ordenada das notas de um sistema, dentro do âmbito de uma oitava, subindo ou descendo por graus conjuntos.\n\n' +
        'Três palavras dessa definição merecem atenção. **Ordenada**: as notas vêm em sequência de altura, não em qualquer ordem. **Oitava**: a escala fecha quando o primeiro nome se repete. **Graus conjuntos**: passa-se de cada nota à vizinha imediata, sem saltar nomes.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c15_graus',
      markdown:
        '## Os graus e seus nomes\n\n' +
        'Cada posição na escala é um **grau**, numerado em algarismos romanos de I a VII. Cada grau tem também um nome funcional, que descreve o papel que ele cumpre na tonalidade.\n\n' +
        '| Grau | Nome | Função |\n' +
        '|---|---|---|\n' +
        '| I | Tônica | centro; onde tudo repousa |\n' +
        '| II | Supertônica | acima da tônica; prepara a dominante |\n' +
        '| III | Mediante | entre I e V; define maior ou menor |\n' +
        '| IV | Subdominante | afasta-se da tônica |\n' +
        '| V | Dominante | maior tensão; pede a tônica |\n' +
        '| VI | Superdominante | relativa; substitui a tônica |\n' +
        '| VII | Sensível | a um semitom da tônica; resolve nela |\n\n' +
        'O VII grau só se chama **sensível** quando está a **um semitom** da tônica. Quando está a um tom — como na escala menor natural — chama-se **subtônica**, e não tem a mesma urgência de resolver. É por isso que a menor harmônica eleva o VII: para transformar subtônica em sensível e recuperar a atração para a tônica.',
    },
    {
      kind: 'SCALE_LAB',
      id: 'c15_lab_escala',
      title: 'Escala de dó maior — grau por grau',
      tonic: 'C4',
      mode: 'MAJOR',
    },
    {
      kind: 'MARKDOWN',
      id: 'c15_conjunto',
      markdown:
        '## Grau conjunto e grau disjunto\n\n' +
        'O movimento por **grau conjunto** vai de uma nota à vizinha imediata: dó–ré, mi–fá. É o movimento da escala, e é o mais fácil de cantar.\n\n' +
        'O movimento por **grau disjunto** salta: dó–mi, sol–dó. É o movimento do arpejo.\n\n' +
        'A distinção organiza a análise melódica. Melodias predominantemente conjuntas soam cantáveis e fluidas; melodias disjuntas soam angulares e instrumentais. A maior parte do repertório alterna as duas coisas, e o ponto em que troca costuma ser expressivamente decisivo.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c15_tipos',
      markdown:
        '## Tipos de escala\n\n' +
        'Adiantando o que vem nos capítulos seguintes, as escalas classificam-se pela quantidade de notas e pela distribuição dos intervalos.\n\n' +
        '**Diatônica** — sete notas com dois semitons distribuídos assimetricamente. As maiores e menores são diatônicas.\n\n' +
        '**Cromática** — doze notas, todos os semitons, sem nenhum salto de tom.\n\n' +
        '**Pentatônica** — cinco notas, sem semitons. Universalmente difundida, e provavelmente a mais antiga.\n\n' +
        '**Artificiais e exóticas** — construídas por princípio de simetria ou vindas de outras tradições, tratadas nos capítulos XXXI e XXXV.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c15_check',
      question: 'Em que caso o VII grau se chama subtônica, e não sensível?',
      options: [
        'Quando a escala é menor, sempre',
        'Quando está a um tom inteiro da tônica',
        'Quando a escala tem bemóis',
        'Quando não é o último grau',
      ],
      correctIndex: 1,
      explanation:
        'Sensível exige distância de um semitom até a tônica. A um tom de distância, o grau chama-se subtônica e perde a atração característica.',
    },
  ],
};
