import { LessonBlock } from '../../domain/academy';

/**
 * Capítulos XLV a LVIII — dos ornamentos restantes à notação moderna.
 *
 * Fecha o curso: termina a ornamentação, entra em condução de vozes e
 * harmonia a quatro partes, percorre as tétrades e os acordes de nona,
 * e encerra com os instrumentos transpositores e a notação do século XX.
 */
export const BLOCOS_45_58: Record<number, LessonBlock[]> = {
  // -------------------------------------------------------------------------
  45: [
    {
      kind: 'MARKDOWN',
      id: 'c45_intro',
      markdown:
        'O **mordente** é a alternância rápida da nota principal com a sua vizinha, voltando imediatamente à principal. São três sons em sequência veloz: principal — vizinha — principal.\n\n' +
        'Ao contrário da apojatura, o mordente **cabe dentro** da duração da nota principal: ele a enfeita sem encurtá-la no cômputo do compasso.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c45_tipos',
      markdown:
        '## Superior e inferior\n\n' +
        'O **mordente superior** usa a nota **acima**: dó–ré–dó. O sinal é um zigue-zague horizontal.\n\n' +
        'O **mordente inferior** usa a nota **abaixo**: dó–si–dó. O sinal é o mesmo zigue-zague **cortado por um traço vertical**.\n\n' +
        'A distância até a vizinha — tom ou semitom — é a que a armadura determina, salvo indicação em contrário. Quando o compositor quer a vizinha alterada, escreve um acidente pequeno acima ou abaixo do sinal.\n\n' +
        'Há ainda o **mordente múltiplo**, com o zigue-zague prolongado, que repete a alternância mais de uma vez antes de voltar à principal.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c45_audio',
      title: 'Mordente superior sobre dó',
      description: 'Três sons no espaço de um: principal, vizinha acima, principal.',
      notes: ['C5', 'D5', 'C5', 'G4'],
      playMode: 'SEQUENCE',
      bpm: 200,
    },
    {
      kind: 'CALLOUT',
      id: 'c45_call',
      type: 'tip',
      title: 'O traço vertical decide',
      text:
        'Zigue-zague simples: mordente superior, vai para cima. Zigue-zague cortado por traço vertical: mordente inferior, vai para baixo. É a única diferença gráfica, e ela inverte a direção do ornamento.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c45_check',
      question: 'Quantos sons a execução de um mordente simples produz?',
      options: ['Dois', 'Três', 'Quatro', 'Depende do andamento'],
      correctIndex: 1,
      explanation:
        'Principal, vizinha e principal outra vez: três sons em sucessão rápida, dentro da duração da nota escrita.',
    },
  ],

  // -------------------------------------------------------------------------
  46: [
    {
      kind: 'MARKDOWN',
      id: 'c46_intro',
      markdown:
        'O **grupeto** é um giro em torno da nota principal, envolvendo a vizinha superior e a inferior. O sinal é um **S deitado**.\n\n' +
        'O **grupeto direto** executa: superior — principal — inferior — principal. Sobre dó: ré, dó, si, dó.\n\n' +
        'O **grupeto invertido** parte da inferior: si, dó, ré, dó. O sinal é o mesmo S deitado, virado ao contrário — ou, em algumas edições, com um traço vertical.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c46_posicao',
      markdown:
        '## Onde o sinal é colocado\n\n' +
        'A posição do sinal decide **quando** o grupeto soa, e essa é a informação que mais se perde na leitura.\n\n' +
        'Sinal **sobre a nota** — o grupeto começa junto com o tempo, no lugar do ataque da principal.\n\n' +
        'Sinal **depois da nota**, deslocado para a direita — a nota principal soa primeiro, mantém-se, e o grupeto é executado no fim da sua duração, ligando-se à nota seguinte.\n\n' +
        'Sinal **entre duas notas pontuadas** — o grupeto preenche o ponto, e a execução ocupa exatamente o valor acrescentado.\n\n' +
        'Alterações da vizinha superior escrevem-se acima do sinal; da inferior, abaixo dele.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c46_audio',
      title: 'Grupeto direto sobre dó',
      description: 'Ré, dó, si, dó — o giro completo, e então a continuação da melodia.',
      notes: ['D5', 'C5', 'B4', 'C5', 'G4'],
      playMode: 'SEQUENCE',
      bpm: 200,
    },
    {
      kind: 'CHECKPOINT',
      id: 'c46_check',
      question: 'O sinal de grupeto está deslocado para depois da cabeça da nota. O que isso indica?',
      options: [
        'O grupeto é invertido',
        'A nota principal soa primeiro, e o grupeto vem no fim da duração dela',
        'O grupeto deve ser omitido',
        'O grupeto usa apenas a vizinha superior',
      ],
      correctIndex: 1,
      explanation:
        'A posição do sinal marca o momento da execução. Deslocado à direita, o ornamento acontece no fim da nota, servindo de ligação com a seguinte.',
    },
  ],

  // -------------------------------------------------------------------------
  47: [
    {
      kind: 'MARKDOWN',
      id: 'c47_intro',
      markdown:
        'O **trinado** é a alternância **contínua** entre a nota principal e a sua vizinha superior, pela duração da nota escrita. O sinal é *tr*, seguido de uma linha ondulada quando a nota é longa.\n\n' +
        'Ao contrário do mordente, que tem número fixo de sons, o trinado não tem: a quantidade de alternâncias depende da duração, do andamento e do instrumento. O que se pede é regularidade, não uma contagem.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c47_historia',
      markdown:
        '## Por qual nota começa\n\n' +
        'Esta é a questão mais disputada da ornamentação, e a resposta depende do período.\n\n' +
        'Na prática **barroca e clássica**, o trinado começa pela **nota superior**. A razão é harmônica: o trinado funciona como uma apojatura prolongada, e portanto deve começar pela dissonância e não pela consonância.\n\n' +
        'Na prática do **século XIX em diante**, começa pela **nota principal**. O trinado passou a ser entendido como coloração da nota, e não como dissonância prolongada.\n\n' +
        'Não há como decidir pela partitura sozinha: é preciso saber a data e a escola. Edições críticas discutem cada caso, e essa discussão é parte do trabalho de quem toca repertório antigo.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c47_resolucao',
      markdown:
        '## Resolução e terminação\n\n' +
        'O trinado costuma terminar com uma **resolução**: duas notas curtas que fecham o ornamento e conduzem à nota seguinte, geralmente a vizinha inferior seguida da principal.\n\n' +
        'A terminação pode estar **escrita** em notas pequenas — e então executa-se o que está escrito — ou apenas **subentendida**, e nesse caso cabe ao intérprete acrescentá-la conforme a convenção do período.\n\n' +
        'Em finais de frase e em cadências, a terminação é praticamente obrigatória: o trinado sem resolução soa interrompido.',
    },
    {
      kind: 'CALLOUT',
      id: 'c47_call',
      type: 'historical',
      title: 'Por que a notação não resolve',
      text:
        'A ornamentação nunca foi inteiramente padronizada, e o mesmo sinal foi executado de formas diferentes conforme a época, o país e até o compositor. A partitura pressupunha um intérprete que conhecia a convenção local. Hoje, essa convenção precisa ser estudada — e é por isso que edições sérias trazem nota crítica sobre o assunto.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c47_check',
      question: 'Num trinado de repertório barroco, por qual nota se começa, pela convenção do período?',
      options: [
        'Pela nota principal',
        'Pela nota superior',
        'Pela nota inferior',
        'Por qualquer uma, indiferentemente',
      ],
      correctIndex: 1,
      explanation:
        'A prática barroca começa pela superior, porque o trinado funciona ali como apojatura prolongada — inicia na dissonância e resolve depois.',
    },
  ],

  // -------------------------------------------------------------------------
  48: [
    {
      kind: 'MARKDOWN',
      id: 'c48_intro',
      markdown:
        'Além dos três ornamentos de alternância, a notação dispõe de recursos que enfeitam por outros meios — quebrando o acorde, deslizando entre alturas ou suspendendo o tempo.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c48_arpejo',
      markdown:
        '## Arpejo\n\n' +
        'O **arpejo** quebra o acorde: as notas soam sucessivamente em vez de simultaneamente, e permanecem soando. O sinal é uma **linha ondulada vertical** à esquerda do acorde.\n\n' +
        'Sem indicação em contrário, executa-se **de baixo para cima**. Uma seta para baixo no fim da linha inverte a direção.\n\n' +
        'A velocidade não é escrita: um arpejo pode ser quase simultâneo ou nitidamente desdobrado, e essa é uma decisão interpretativa. Na música para teclado do século XIX, o arpejo é também um recurso de sustentação — quebrar o acorde faz o som durar mais.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c48_glissando',
      markdown:
        '## Glissando e portamento\n\n' +
        'O **glissando** percorre **todas as notas intermediárias** entre duas alturas. Escreve-se com uma linha reta ou ondulada entre as duas notas, com a indicação *gliss.*\n\n' +
        'Em instrumentos de altura fixa — piano, harpa — o glissando produz uma escala rápida, e as notas intermediárias são as que o instrumento tem disponíveis.\n\n' +
        'O **portamento** é diferente: desliza **continuamente** de uma altura a outra, sem passar por notas discretas. Só existe em instrumentos de altura contínua — cordas sem trastes, voz, trombone de vara.\n\n' +
        'A distinção é real e frequentemente ignorada: o glissando percorre degraus, o portamento percorre uma rampa.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c48_floreio',
      markdown:
        '## Floreio e cadência melódica\n\n' +
        'O **floreio** é um grupo livre de notas pequenas interpolado na melodia, sem valor rítmico determinado. Executa-se com flexibilidade, dentro do tempo disponível, e é frequente em música vocal e em peças de caráter improvisatório.\n\n' +
        'A **cadência melódica** — no sentido de passagem, não de encadeamento harmônico — é um trecho ornamental extenso, geralmente sobre uma fermata, em que o solista toca sozinho enquanto o restante aguarda.\n\n' +
        'Na prática histórica, era **improvisada**. A partir do século XIX passou a ser escrita pelo compositor, o que a transformou de exibição de invenção em parte fixa da obra.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c48_check',
      question: 'Qual a diferença entre glissando e portamento?',
      options: [
        'Nenhuma; são sinônimos',
        'O glissando percorre as notas intermediárias; o portamento desliza continuamente',
        'O glissando é mais rápido',
        'O portamento só existe no piano',
      ],
      correctIndex: 1,
      explanation:
        'O glissando passa por alturas discretas; o portamento é uma rampa contínua, e por isso só é possível em instrumentos de altura contínua.',
    },
  ],

  // -------------------------------------------------------------------------
  49: [
    {
      kind: 'MARKDOWN',
      id: 'c49_intro',
      markdown:
        'Quando duas ou mais vozes soam ao mesmo tempo, o que interessa não é apenas o que cada uma faz, mas **como se movem uma em relação à outra**. São quatro tipos de movimento, e a classificação é exaustiva.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c49_tipos',
      markdown:
        '## Os quatro movimentos\n\n' +
        '**Direto** — as duas vozes sobem, ou as duas descem, por intervalos diferentes.\n\n' +
        '**Paralelo** — caso particular do direto: as duas se movem na mesma direção **mantendo o mesmo intervalo** entre si.\n\n' +
        '**Contrário** — uma sobe e a outra desce.\n\n' +
        '**Oblíquo** — uma se move e a outra permanece parada.\n\n' +
        'Cada um produz um efeito próprio. O contrário é o que dá maior independência às vozes e maior sensação de duas linhas distintas. O oblíquo é o mais estável, e é o que permite a uma voz sustentar enquanto a outra se movimenta. O paralelo funde as vozes numa única sonoridade mais espessa.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c49_restricoes',
      markdown:
        '## A restrição às quintas e oitavas paralelas\n\n' +
        'A prática da escrita a várias vozes proíbe o movimento paralelo de **quintas justas** e de **oitavas** entre duas mesmas vozes.\n\n' +
        'A razão não é arbitrária. Quinta e oitava são as consonâncias mais perfeitas, e por isso as que mais fundem os timbres. Duas vozes que caminham em oitavas paralelas deixam de ser percebidas como duas: ouvem-se como uma linha reforçada. A independência — que é o objetivo da escrita a várias vozes — desaparece exatamente no ponto em que o paralelismo ocorre.\n\n' +
        'Terças e sextas paralelas, ao contrário, são livres e abundantes: sendo consonâncias imperfeitas, não fundem as vozes a ponto de anular a separação.\n\n' +
        'A proibição vale para o estilo que a formulou. Compositores a violaram deliberadamente quando quiseram justamente o efeito de fusão — o organum medieval é feito de quintas paralelas, e boa parte da música do século XX as usa como cor.',
    },
    {
      kind: 'CALLOUT',
      id: 'c49_call',
      type: 'info',
      title: 'Regra com motivo',
      text:
        'Não se evita quintas paralelas porque "está errado". Evita-se porque elas anulam a independência das vozes, que é o que se está tentando construir. Sabendo o motivo, sabe-se também quando a regra não se aplica: quando a fusão é o efeito desejado.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c49_check',
      question: 'Uma voz sobe e a outra permanece na mesma nota. Que movimento é?',
      options: ['Direto', 'Paralelo', 'Contrário', 'Oblíquo'],
      correctIndex: 3,
      explanation:
        'Movimento oblíquo: uma voz se desloca enquanto a outra fica parada. É o mais estável dos quatro.',
    },
  ],

  // -------------------------------------------------------------------------
  50: [
    {
      kind: 'MARKDOWN',
      id: 'c50_intro',
      markdown:
        'A escrita harmônica tradicional usa **quatro vozes**, correspondentes às quatro tessituras do coro: **soprano, contralto, tenor e baixo**.\n\n' +
        'Mas a tríade tem três notas. Para preenchê-la em quatro vozes é necessário **duplicar** uma delas — e qual duplicar não é indiferente.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c50_duplicacao',
      markdown:
        '## Qual nota duplicar\n\n' +
        'A ordem de preferência, no estado fundamental:\n\n' +
        '**1. A fundamental** — é a duplicação padrão. Reforça a raiz do acorde e não cria problema nenhum.\n\n' +
        '**2. A quinta** — aceitável, produz sonoridade um pouco mais aberta.\n\n' +
        '**3. A terça** — evita-se em acordes maiores, porque a terça é a nota que define a qualidade e duplicá-la a torna pesada demais. Em acordes menores a restrição é menor.\n\n' +
        '**Nunca se duplica a sensível**, nem qualquer nota que tenha resolução obrigatória. Duplicar uma nota que precisa resolver força as duas cópias a resolverem no mesmo lugar — e isso produz oitavas paralelas inevitáveis.\n\n' +
        'Essa última regra não é uma convenção de estilo: é uma consequência aritmética das anteriores.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c50_posicao',
      markdown:
        '## Posição cerrada e posição aberta\n\n' +
        'A **posição cerrada** mantém as três vozes superiores o mais próximas possível: entre soprano e tenor não cabe nenhuma nota do acorde que não esteja sendo usada.\n\n' +
        'A **posição aberta** espaça essas vozes, deixando espaço entre elas.\n\n' +
        'A regra prática de espaçamento: entre vozes vizinhas **superiores** — soprano-contralto, contralto-tenor — não se ultrapassa uma **oitava**. Entre tenor e baixo, a distância pode ser maior, e frequentemente é: a região grave suporta espaçamento amplo sem soar vazia, e soa mal quando apertada.\n\n' +
        'Esse comportamento acompanha a série harmônica, em que os parciais graves são amplamente espaçados e os agudos se aproximam.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c50_lab_cerrada',
      title: 'Dó maior a quatro vozes — posição cerrada',
      notes: ['C3', 'G3', 'C4', 'E4'],
      prompt: 'Vozes superiores juntas, baixo afastado. Fundamental duplicada.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c50_lab_aberta',
      title: 'Dó maior a quatro vozes — posição aberta',
      notes: ['C3', 'E3', 'G3', 'C5'],
      prompt: 'As mesmas notas, espaçadas. Compare a amplitude da sonoridade.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c50_check',
      question: 'Por que não se duplica a sensível?',
      options: [
        'Porque soa desafinado',
        'Porque ela tem resolução obrigatória, e duas cópias resolvendo juntas produzem oitavas paralelas',
        'Porque a sensível é dissonante',
        'Porque a sensível não pertence ao acorde',
      ],
      correctIndex: 1,
      explanation:
        'A sensível precisa subir para a tônica. Duplicada, as duas vozes fariam o mesmo movimento para a mesma nota, gerando oitavas paralelas.',
    },
  ],

  // -------------------------------------------------------------------------
  51: [
    {
      kind: 'MARKDOWN',
      id: 'c51_intro',
      markdown:
        'Acrescentando uma terça acima da quinta da tríade obtém-se o **acorde de sétima**, ou **tétrade**. Quatro notas: fundamental, terça, quinta e sétima.\n\n' +
        'A sétima é uma **dissonância**, e é ela que dá ao acorde a sua energia. Uma tríade pode ficar parada indefinidamente; uma tétrade quer ir a algum lugar.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c51_especies',
      markdown:
        '## As espécies\n\n' +
        '| Nome | Tríade | Sétima | Cifra | Sobre dó |\n' +
        '|---|---|---|---|---|\n' +
        '| Sétima da dominante | maior | menor | C7 | dó–mi–sol–si♭ |\n' +
        '| Sétima maior | maior | maior | C7M | dó–mi–sol–si |\n' +
        '| Sétima menor | menor | menor | Cm7 | dó–mi♭–sol–si♭ |\n' +
        '| Meio-diminuta | diminuta | menor | Cm7(♭5) | dó–mi♭–sol♭–si♭ |\n' +
        '| Diminuta | diminuta | diminuta | C° | dó–mi♭–sol♭–si♭♭ |\n' +
        '| Menor com sétima maior | menor | maior | Cm7M | dó–mi♭–sol–si |\n\n' +
        'A **sétima da dominante** chama-se assim porque é a tétrade que se forma naturalmente sobre o V grau da escala maior. É o acorde mais importante da harmonia tonal.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c51_lab_dom7',
      title: 'Sétima da dominante',
      notes: ['G3', 'B3', 'D4', 'F4'],
      prompt: 'Sol7 em dó maior. Ouça a tensão e imagine a resolução em dó.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c51_lab_7M',
      title: 'Sétima maior',
      notes: ['C4', 'E4', 'G4', 'B4'],
      prompt: 'A sétima maior não empurra: colore. Compare com a anterior.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c51_lab_dim',
      title: 'Sétima diminuta',
      notes: ['B3', 'D4', 'F4', 'G#4'],
      prompt: 'Três terças menores empilhadas. Totalmente simétrico — e por isso ambíguo.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c51_funcao',
      markdown:
        '## Por que a dominante resolve\n\n' +
        'A tétrade de dominante contém um **trítono** entre a sua terça — que é a sensível da tonalidade — e a sua sétima.\n\n' +
        'Cada uma dessas notas tem tendência própria e oposta: a **sensível sobe** meio tom para a tônica; a **sétima desce** meio tom para a terça da tônica. As duas vozes se movem em direções contrárias, por semitom, e chegam simultaneamente a notas estáveis.\n\n' +
        'O trítono, que ao se abrir resolve numa sexta e ao se fechar resolve numa terça, é o mecanismo inteiro da cadência tonal. Não é convenção: é a resolução de duas tendências simultâneas.\n\n' +
        'É por isso que o capítulo XXI justificava elevar o sétimo grau na menor harmônica — sem essa elevação, não há sensível, não há trítono, e a dominante não puxa.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c51_check',
      question: 'Que intervalo, dentro do acorde de sétima da dominante, produz a tendência de resolução?',
      options: [
        'A quinta justa',
        'A terça maior',
        'O trítono entre a terça e a sétima',
        'A oitava',
      ],
      correctIndex: 2,
      explanation:
        'O trítono entre sensível e sétima é o motor: a sensível sobe por semitom, a sétima desce por semitom, e as duas resolvem ao mesmo tempo.',
    },
  ],

  // -------------------------------------------------------------------------
  52: [
    {
      kind: 'MARKDOWN',
      id: 'c52_intro',
      markdown:
        'A tétrade também admite alterações, e a mais frequente incide sobre a **quinta**. O acorde de sétima da dominante com a quinta alterada — para cima ou para baixo — é recurso corrente desde o romantismo, e virou vocabulário básico no jazz.\n\n' +
        '- **7(♯5)** — quinta aumentada: dó–mi–sol♯–si♭\n' +
        '- **7(♭5)** — quinta diminuta: dó–mi–sol♭–si♭\n\n' +
        'Também se alteram a **nona** e a **décima primeira** quando presentes, mas isso pertence ao capítulo LIV.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c52_efeito',
      markdown:
        '## O que a alteração faz\n\n' +
        'A quinta alterada acrescenta uma **segunda tendência** ao acorde, que já tinha a do trítono. A quinta elevada empurra para cima; a abaixada, para baixo. O resultado é um acorde com mais direções simultâneas, e por isso mais tenso.\n\n' +
        'O caso do **7(♭5)** merece atenção especial: esse acorde contém **dois** trítonos, e é simétrico em relação a si mesmo. Transposto por trítono, produz as mesmas quatro notas com nomes trocados.\n\n' +
        'Essa propriedade é a base da **substituição de trítono**: qualquer dominante pode ser trocada pela dominante situada a um trítono de distância, porque as duas compartilham o trítono essencial. É um dos recursos mais usados da harmonia moderna, e sai inteiro dessa simetria.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c52_lab_7b5',
      title: 'Sétima da dominante com quinta diminuta',
      notes: ['C4', 'E4', 'F#4', 'A#4'],
      prompt: 'Dois trítonos no mesmo acorde. Ouça a instabilidade dobrada.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c52_check',
      question: 'Por que a substituição de trítono funciona?',
      options: [
        'Porque os acordes têm a mesma fundamental',
        'Porque as duas dominantes compartilham o mesmo trítono',
        'Porque o trítono é consonante',
        'Porque a quinta é a mesma nos dois',
      ],
      correctIndex: 1,
      explanation:
        'Duas dominantes a distância de trítono contêm o mesmo par de notas formando trítono — só trocam entre si os papéis de terça e sétima. A tendência de resolução se mantém.',
    },
  ],

  // -------------------------------------------------------------------------
  53: [
    {
      kind: 'MARKDOWN',
      id: 'c53_intro',
      markdown:
        'A tétrade tem quatro notas e, portanto, **quatro** disposições: o estado fundamental e três inversões.\n\n' +
        '| Estado | Baixo | Intervalos sobre o baixo | Cifra de baixo |\n' +
        '|---|---|---|---|\n' +
        '| Fundamental | fundamental | 3, 5, 7 | 7 |\n' +
        '| Primeira inversão | terça | 3, 5, 6 | 6/5 |\n' +
        '| Segunda inversão | quinta | 3, 4, 6 | 4/3 |\n' +
        '| Terceira inversão | sétima | 2, 4, 6 | 2 ou 4/2 |\n\n' +
        'Os números do baixo cifrado contam os intervalos acima da nota grave — é por isso que eles mudam a cada inversão, embora o acorde seja sempre o mesmo.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c53_lab_fund',
      title: 'Sol7 — estado fundamental',
      notes: ['G3', 'B3', 'D4', 'F4'],
      prompt: 'Sol no baixo.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c53_lab_3inv',
      title: 'Sol7 — terceira inversão',
      notes: ['F3', 'G3', 'B3', 'D4'],
      prompt: 'A sétima no baixo. Ouça a urgência: este baixo precisa descer.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c53_resolucao',
      markdown:
        '## Como cada inversão resolve\n\n' +
        'A regra de resolução da sétima é constante: **a sétima desce por grau conjunto**, esteja onde estiver.\n\n' +
        'No estado fundamental, o baixo cai uma quinta e a tétrade resolve na tônica em estado fundamental.\n\n' +
        'Na **terceira inversão**, a sétima está no baixo. Como ela precisa descer, o acorde resolve obrigatoriamente numa **primeira inversão** da tônica. Isso não é escolha estilística: é a única saída que a resolução da sétima permite.\n\n' +
        'Quem conhece essa regra prevê o acorde seguinte sem precisar olhar. Quem não conhece escreve resoluções que soam erradas sem saber por quê.',
    },
    {
      kind: 'CALLOUT',
      id: 'c53_call',
      type: 'tip',
      title: 'Identificar a inversão de ouvido',
      text:
        'Não tente ouvir o acorde inteiro. Ouça só o BAIXO, e pergunte que função aquela nota tem no acorde. A inversão é decidida exclusivamente pela nota mais grave, e é sempre a mais fácil de isolar auditivamente.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c53_check',
      question: 'Uma tétrade de dominante em terceira inversão resolve em quê?',
      options: [
        'Tônica em estado fundamental',
        'Tônica em primeira inversão',
        'Tônica em segunda inversão',
        'Em qualquer acorde',
      ],
      correctIndex: 1,
      explanation:
        'A sétima está no baixo e precisa descer por grau conjunto. Ela chega à terça da tônica, que fica assim no baixo — primeira inversão.',
    },
  ],

  // -------------------------------------------------------------------------
  54: [
    {
      kind: 'MARKDOWN',
      id: 'c54_intro',
      markdown:
        'Continuando a empilhar terças sobre a tétrade, chega-se ao **acorde de nona**: cinco notas — fundamental, terça, quinta, sétima e nona.\n\n' +
        'A nona é uma segunda **acima da oitava**, e chamá-la de nona não é preciosismo: ela funciona como extensão do acorde, situada acima da sétima, e não como uma segunda colada à fundamental. O nome registra essa posição.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c54_tipos',
      markdown:
        '## Nona maior e nona menor\n\n' +
        'A **nona maior** — dó–mi–sol–si♭–ré — soa aberta e luminosa. É a extensão mais comum sobre acordes maiores e sobre dominantes.\n\n' +
        'A **nona menor** — dó–mi–sol–si♭–ré♭ — é áspera, e contém um intervalo de nona menor entre fundamental e nona que o ouvido registra como forte atrito. Aparece sobre dominantes com função de tensão máxima, e frequentemente prepara resolução em acorde menor.\n\n' +
        'Sobre acordes menores usa-se a nona maior; a menor produziria choque com a terça menor.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c54_lab_9',
      title: 'Sol com nona maior',
      notes: ['G3', 'B3', 'F4', 'A4'],
      prompt:
        'A quinta foi omitida, como é usual nas extensões. A nona acrescenta cor sem desfazer a função.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c54_omissao',
      markdown:
        '## O que se omite\n\n' +
        'Um acorde de nona tem cinco notas, e a escrita a quatro vozes só comporta quatro. Alguma coisa sai.\n\n' +
        'A ordem de sacrifício é fixa, e segue o quanto cada nota informa:\n\n' +
        '**1. A quinta** é a primeira a sair. Ela não define qualidade nem função — a tríade continua reconhecível sem ela.\n\n' +
        '**2. A fundamental** pode sair quando o baixo a fornece, ou quando outro instrumento a toca.\n\n' +
        '**Nunca saem a terça e a sétima.** A terça define maior ou menor; a sétima define a função dominante. Sem elas o acorde deixa de ser o que é.\n\n' +
        'Essa hierarquia — terça e sétima são essenciais, quinta e fundamental são dispensáveis — vale para todas as extensões, e é o princípio central do acompanhamento a poucas vozes.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c54_check',
      question: 'Num acorde de nona a quatro vozes, qual nota se omite primeiro?',
      options: ['A terça', 'A quinta', 'A sétima', 'A nona'],
      correctIndex: 1,
      explanation:
        'A quinta é a menos informativa: não define qualidade nem função. Terça e sétima nunca saem, porque são elas que caracterizam o acorde.',
    },
  ],

  // -------------------------------------------------------------------------
  55: [
    {
      kind: 'MARKDOWN',
      id: 'c55_intro',
      markdown:
        'A empilhagem por terças pode prosseguir — décima primeira, décima terceira — mas, a partir daí, o acorde contém tantas notas que a própria noção de empilhamento perde utilidade. E há construções que não usam terças de modo algum.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c55_extensoes',
      markdown:
        '## Décima primeira e décima terceira\n\n' +
        'A **décima primeira** corresponde à quarta acima da oitava. Sobre acordes maiores ela choca com a terça, e por isso aparece quase sempre **elevada** — a 11♯, que é a mesma nota do trítono e soa bem. Sobre acordes menores, a décima primeira justa é livre.\n\n' +
        'A **décima terceira** corresponde à sexta acima da oitava. É a extensão mais rica em acordes de dominante, e substitui frequentemente a quinta.\n\n' +
        'Empilhando tudo até a décima terceira, chega-se a **sete** notas — que são todas as notas da escala. Nesse ponto o acorde já não se distingue da escala que o gerou, e a análise por empilhamento deixa de dizer alguma coisa.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c55_naotercais',
      markdown:
        '## Acordes não terçais\n\n' +
        '**Acordes por quartas** — empilham quartas em vez de terças: dó–fá–si♭, por exemplo. Soam abertos e sem a hierarquia tonal habitual, porque a terça — que define maior e menor — simplesmente não está lá. Foram sistematizados no início do século XX, e são vocabulário corrente no jazz modal.\n\n' +
        '**Acordes por segundas** e **clusters** — agregados de notas vizinhas, tocados em bloco. Ao empilhar segundas, o resultado deixa de ser percebido como acorde e passa a ser percebido como **massa sonora**, com altura difusa e timbre próprio. É um recurso de cor e de densidade, não de função.\n\n' +
        '**Acordes por quintas** — soam vazios e arcaicos, e evocam tanto o organum medieval quanto certa escrita moderna deliberadamente despojada.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c55_lab_quartas',
      title: 'Acorde por quartas',
      notes: ['C4', 'F4', 'A#4'],
      prompt: 'Sem terça: nem maior nem menor. Ouça a ausência de direção.',
    },
    {
      kind: 'CALLOUT',
      id: 'c55_call',
      type: 'historical',
      title: 'Quando a terça deixou de ser obrigatória',
      text:
        'A empilhagem por terças reinou por cerca de trezentos anos porque a série harmônica a sustenta. As construções por quartas e por segundas aparecem quando compositores do início do século XX quiseram harmonia sem hierarquia tonal — e a maneira mais direta de conseguir isso foi abandonar justamente o intervalo que define maior e menor.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c55_check',
      question: 'Por que um acorde por quartas não é nem maior nem menor?',
      options: [
        'Porque tem poucas notas',
        'Porque não contém terça, que é o intervalo que define a qualidade',
        'Porque é dissonante',
        'Porque não tem fundamental',
      ],
      correctIndex: 1,
      explanation:
        'Maior e menor são determinados pela terça. Sem terça no acorde, a distinção simplesmente não se aplica.',
    },
  ],

  // -------------------------------------------------------------------------
  56: [
    {
      kind: 'MARKDOWN',
      id: 'c56_intro',
      markdown:
        'Os acordes não são objetos isolados: têm origem comum, parentescos entre si, e alguns são enarmonicamente idênticos a outros. Reunir essas três relações explica muito do que parece arbitrário na harmonia cromática.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c56_origem',
      markdown:
        '## Origem\n\n' +
        'A **tríade maior** está nos parciais 4, 5 e 6 da série harmônica — foi encontrada, não inventada, como o capítulo XVI mostrou.\n\n' +
        'A **tétrade de dominante** aproxima os parciais 4, 5, 6 e 7, com a ressalva de que o sétimo harmônico natural é mais baixo que a sétima temperada.\n\n' +
        'A **tríade menor** não tem origem tão direta na série, e essa assimetria ocupou teóricos por séculos. As explicações propostas — série invertida, terceira comum, derivação por empréstimo — nunca convenceram inteiramente. O fato prático é que a tríade menor funciona, e a teoria acomodou isso melhor do que explicou.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c56_afinidade',
      markdown:
        '## Afinidade\n\n' +
        'Dois acordes são **afins** quando compartilham notas. Quanto mais notas em comum, mais suave a passagem de um ao outro.\n\n' +
        'Em dó maior:\n' +
        '- **I e VI** (dó e lá menor) compartilham **duas** notas: dó e mi. É por isso que o VI substitui o I com tanta naturalidade.\n' +
        '- **I e III** (dó e mi menor) compartilham duas: mi e sol.\n' +
        '- **I e V** compartilham **uma**: sol.\n' +
        '- **I e IV** compartilham **uma**: dó.\n\n' +
        'A afinidade explica a substituição harmônica: trocar um acorde por outro que compartilhe notas mantém a função e muda a cor. É o princípio por trás dos acordes relativos e, no jazz, de boa parte do rearranjo harmônico.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c56_enarmonia',
      markdown:
        '## Enarmonia de acordes\n\n' +
        'O caso mais produtivo é o da **sétima diminuta**. Ela empilha três terças menores e é perfeitamente simétrica — o que significa que **qualquer das suas quatro notas pode ser lida como fundamental**.\n\n' +
        'Consequência: existem apenas **três** acordes de sétima diminuta distintos no sistema temperado, e cada um deles tem **quatro** leituras possíveis. Um único acorde pode, portanto, resolver em quatro tonalidades diferentes, dependendo apenas de como for reescrito.\n\n' +
        'Esse é o mecanismo de modulação enarmônica mais eficiente que existe, e o repertório romântico o usa à exaustão.\n\n' +
        'O segundo caso relevante é o da **sexta aumentada alemã**, enarmonicamente idêntica a um acorde de sétima da dominante. Escrito de um modo, resolve como sexta aumentada; escrito de outro, resolve como dominante. A ponte entre tonalidades distantes passa por aí.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c56_lab_dim',
      title: 'Sétima diminuta — quatro leituras possíveis',
      notes: ['B3', 'D4', 'F4', 'G#4'],
      prompt:
        'Simétrico: cada nota pode ser a fundamental. Reescrevendo-o, ele resolve em quatro tonalidades diferentes.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c56_check',
      question: 'Quantos acordes de sétima diminuta distintos existem no sistema temperado?',
      options: ['Três', 'Quatro', 'Sete', 'Doze'],
      correctIndex: 0,
      explanation:
        'Sendo simétrico, cada acorde de sétima diminuta se repete a cada terça menor. Só existem três conjuntos distintos de notas, e cada um admite quatro leituras.',
    },
  ],

  // -------------------------------------------------------------------------
  57: [
    {
      kind: 'MARKDOWN',
      id: 'c57_intro',
      markdown:
        'Em vários instrumentos, a nota **escrita** e a nota que **soa** não são a mesma. Chamam-se **instrumentos transpositores**, e ignorar isso torna impossível ler uma partitura de orquestra.\n\n' +
        'A convenção é a seguinte: quando o executante lê um **dó escrito**, o instrumento produz a nota que dá **nome** ao instrumento. Um clarinete em si♭ que lê dó produz si♭.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c57_porque',
      markdown:
        '## Por que o sistema existe\n\n' +
        'Não é capricho histórico: é economia de aprendizado.\n\n' +
        'Cada família de instrumentos tem membros de tamanhos diferentes — clarinete em si♭, em lá, em mi♭; trompa em fá, em mi♭; saxofones em si♭ e em mi♭. Todos têm a **mesma digitação relativa**.\n\n' +
        'Escrevendo de forma transposta, o instrumentista aprende **uma** digitação e a aplica a todos os membros da família. A mesma posição de dedos produz sempre o "dó escrito", seja qual for o tamanho do instrumento.\n\n' +
        'Sem transposição, cada membro da família exigiria reaprender o instrumento do zero.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c57_tabela',
      markdown:
        '## Os principais transpositores\n\n' +
        '| Instrumento | Dó escrito soa | Direção |\n' +
        '|---|---|---|\n' +
        '| Clarinete em si♭ | si♭ | 1 tom abaixo |\n' +
        '| Clarinete em lá | lá | 1 tom e meio abaixo |\n' +
        '| Trompete em si♭ | si♭ | 1 tom abaixo |\n' +
        '| Trompa em fá | fá | 1 quinta abaixo |\n' +
        '| Sax alto (mi♭) | mi♭ | 1 sexta maior abaixo |\n' +
        '| Sax tenor (si♭) | si♭ | 1 nona maior abaixo |\n' +
        '| Sax barítono (mi♭) | mi♭ | 1 décima terceira abaixo |\n' +
        '| Corne inglês (fá) | fá | 1 quinta abaixo |\n' +
        '| Flautim | — | 1 oitava **acima** |\n' +
        '| Contrabaixo | — | 1 oitava abaixo |\n' +
        '| Violão | — | 1 oitava abaixo |\n\n' +
        'Os três últimos transpõem por **oitava** apenas, o que é um caso mais simples: a classe de altura não muda, só o registro.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c57_armadura',
      markdown:
        '## A armadura também se transpõe\n\n' +
        'Consequência que costuma pegar quem está começando: se o instrumento transpõe, a **armadura da parte** é diferente da armadura da partitura.\n\n' +
        'Uma peça em dó maior, escrita para clarinete em si♭, aparece na parte do clarinete em **ré maior** — dois sustenidos —, porque é preciso subir um tom no escrito para que soe um tom abaixo.\n\n' +
        'A regra prática: **para escrever, transpõe-se na direção contrária à do instrumento**. O clarinete em si♭ soa um tom abaixo, então escreve-se um tom acima. A trompa em fá soa uma quinta abaixo, então escreve-se uma quinta acima.\n\n' +
        'Quem lê partitura de orquestra faz essa conversão mentalmente, em tempo real, para várias famílias ao mesmo tempo. É trabalhoso, e é exatamente por isso que se treina.',
    },
    {
      kind: 'CALLOUT',
      id: 'c57_call',
      type: 'warning',
      title: 'Partitura em dó',
      text:
        'Algumas edições modernas publicam "partitura em dó" (score in C), em que todos os instrumentos aparecem na altura real. Isso facilita a leitura analítica e é inútil para o ensaio: as PARTES continuam transpostas, e o maestro precisa saber a nota escrita para poder corrigir o músico.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c57_check',
      question: 'Uma peça está em fá maior. Em que tonalidade se escreve a parte do clarinete em si♭?',
      options: ['Fá maior', 'Mi♭ maior', 'Sol maior', 'Si♭ maior'],
      correctIndex: 2,
      explanation:
        'O clarinete em si♭ soa um tom abaixo do escrito. Para soar em fá, escreve-se um tom acima: sol maior.',
    },
  ],

  // -------------------------------------------------------------------------
  58: [
    {
      kind: 'MARKDOWN',
      id: 'c58_intro',
      markdown:
        'A notação tradicional foi desenhada para alturas determinadas, durações proporcionais e instrumentos de timbre estável. A partir do século XX, a composição passou a exigir coisas que esse sistema não escreve.\n\n' +
        'A resposta foi um conjunto de sinais novos — e, ao contrário da notação tradicional, esse conjunto **nunca foi padronizado**. Muitas obras trazem a sua própria legenda, e ler a legenda é parte de ler a peça.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c58_altura',
      markdown:
        '## Altura\n\n' +
        '**Microtons** — sinais acrescentados aos acidentes tradicionais indicam quartos de tom: meia-seta, sustenido com três hastes, bemol invertido. Cada escola propôs a sua grafia, e não há convergência.\n\n' +
        '**Altura aproximada** — cabeças de nota em forma de x, de losango ou de triângulo indicam som de altura indeterminada, ou aproximada, conforme a legenda.\n\n' +
        '**Cluster** — uma faixa vertical preenchida entre duas alturas indica que se toque tudo o que estiver entre elas. Barras diferentes distinguem cluster cromático, diatônico e pentatônico.\n\n' +
        '**Glissando contínuo** — uma linha desenhada livremente sobre o espaço da pauta indica a trajetória da altura ao longo do tempo, sem alturas discretas.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c58_tempo',
      markdown:
        '## Tempo\n\n' +
        '**Notação proporcional** — abandona figuras e compassos. A **distância horizontal** no papel representa a duração: uma nota seguida de muito espaço branco dura mais. Frequentemente vem com uma régua de segundos acima do sistema.\n\n' +
        '**Notação em espaço de tempo** — a pauta é dividida em segundos ou frações, e os eventos são posicionados sobre essa grade.\n\n' +
        '**Caixas e módulos** — grupos de notas dentro de uma moldura, a serem repetidos livremente por um tempo indicado, cada executante em seu próprio andamento. O resultado é deliberadamente diferente a cada execução.\n\n' +
        '**Notação gráfica** — o extremo: desenhos, formas e cores sem equivalência definida, interpretados pelo executante. A partitura deixa de prescrever e passa a sugerir.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c58_tecnicas',
      markdown:
        '## Técnicas estendidas\n\n' +
        'A partitura moderna também precisa indicar modos de produzir som que a escrita tradicional nunca previu.\n\n' +
        'Em **cordas**: bater com a madeira do arco, tocar atrás do cavalete, raspar as cordas graves, percutir o corpo do instrumento.\n\n' +
        'Em **sopros**: som de ar sem altura, multifônicos, slap, percussão de chaves, cantar enquanto se toca.\n\n' +
        'Em **piano**: tocar diretamente nas cordas, abafá-las com a mão, preparar o instrumento com objetos entre as cordas.\n\n' +
        'Em **voz**: fala, sussurro, canto com altura indeterminada, transições contínuas entre fala e canto.\n\n' +
        'Cada uma dessas exige um sinal, e como não há padrão, a legenda da obra é obrigatória.',
    },
    {
      kind: 'CALLOUT',
      id: 'c58_call',
      type: 'info',
      title: 'Ler a legenda é ler a peça',
      text:
        'Na música dos últimos setenta anos, a primeira página de instruções não é acessório: é parte da obra. Duas peças podem usar o mesmo símbolo com sentidos opostos. Quem pula a legenda e vai direto às notas está lendo outra coisa.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c58_fecho',
      markdown:
        '## Onde isto deixa você\n\n' +
        'Os cinquenta e oito capítulos percorreram o sistema inteiro: do fenômeno físico do som à notação que tenta escrever o que o sistema não previa.\n\n' +
        'A teoria não é um conjunto de regras a obedecer. É a descrição de como a música foi organizada — e, como toda descrição, ela é revisada quando a prática muda. A notação moderna é o capítulo em que isso fica evidente, mas o processo é o mesmo que criou as claves, as armaduras e a cifragem.\n\n' +
        'O que fica é a capacidade de ler o que está escrito, ouvir o que está escrito, e escrever o que se ouve. O resto é repertório.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c58_check',
      question: 'Na notação proporcional, o que determina a duração de um som?',
      options: [
        'A figura escolhida',
        'A distância horizontal ocupada no papel',
        'O número do compasso',
        'A indicação metronômica',
      ],
      correctIndex: 1,
      explanation:
        'A notação proporcional dispensa figuras e compassos: o espaço horizontal representa o tempo, e frequentemente há uma régua de segundos acima do sistema.',
    },
  ],
};
