import { LessonBlock } from '../../domain/academy';

/**
 * História da Música Brasileira — capítulos 10 a 18.
 *
 * De Villa-Lobos ao presente. Texto autoral; nenhuma obra de referência é
 * citada.
 */
export const BLOCOS_BR_10_18: Record<number, LessonBlock[]> = {
  10: [
    {
      kind: 'MARKDOWN',
      id: 'br10_intro',
      markdown:
        'Villa-Lobos é a figura central da música erudita brasileira, e também a mais difícil de avaliar com equilíbrio — porque dele se fez, em vida, um monumento.\n\n' +
        'Sua formação foi irregular: pouca escola formal, muito contato direto com músicos de choro no Rio, viagens pelo interior, e leitura autodidata de tratados. Ele próprio cultivou a imagem de quem aprendeu com o Brasil em vez de com os livros — narrativa útil e apenas parcialmente verdadeira.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br10_obra',
      markdown:
        '## A obra\n\n' +
        'Enorme: mais de mil peças, em todos os gêneros, de altíssima irregularidade — ao lado de obras-primas há muita produção apressada.\n\n' +
        'Três núcleos organizam o essencial.\n\n' +
        'Os **Choros** aplicam ao gênero popular urbano a escala e os recursos da música de concerto. São peças de efetivo variável, de um violão a orquestra com coro, que tomam o modo de tocar do choro — a improvisação, o contracanto, a liberdade formal — e o reescrevem em grande formato.\n\n' +
        'As **Bachianas Brasileiras** fazem o cruzamento oposto e mais famoso: procedimentos do contraponto barroco aplicados a material melódico e rítmico brasileiro. Cada peça leva título duplo, um europeu e um brasileiro — uma ária que é também uma modinha, uma dança que é também uma toccata imitando o trem. A tese implícita é que há afinidade real entre a construção de Bach e a música popular brasileira, e não apenas justaposição.\n\n' +
        'E há a **obra para violão**, que reintroduziu no repertório de concerto um instrumento até então associado à rua, com escrita idiomática que só alguém que tocou choro poderia ter escrito.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br10_orfeonico',
      markdown:
        '## O canto orfeônico\n\n' +
        'Nos anos 1930, Villa-Lobos assumiu a direção de um programa nacional de educação musical: canto coral obrigatório nas escolas, com repertório de melodias folclóricas e patrióticas, e concentrações de milhares de estudantes cantando em estádios.\n\n' +
        'O programa teve efeito real de alfabetização musical em escala inédita, e formou gerações que sabiam ler música.\n\n' +
        'E foi conduzido sob um governo autoritário, com finalidade explícita de disciplina e civismo. As concentrações de massa eram, também, demonstrações de ordem.\n\n' +
        'As duas coisas são verdadeiras ao mesmo tempo, e o curso não precisa escolher entre elas. O que convém reter é que a maior política de educação musical da história do país foi construída dentro de um projeto de Estado que tinha objetivos que iam além da música.',
    },
    {
      kind: 'CALLOUT',
      id: 'br10_call',
      type: 'info',
      title: 'A síntese que ele propôs',
      text:
        'A pergunta do capítulo IX era se material brasileiro sobrevive à forma europeia. A resposta de Villa-Lobos foi prática: não separar as duas coisas em camadas, mas procurar onde elas já se parecem. É por isso que as Bachianas não soam como folclore harmonizado — soam como uma terceira coisa.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br10_check',
      question: 'Qual é a tese implícita nas Bachianas Brasileiras?',
      options: [
        'Que a música brasileira deve imitar Bach',
        'Que há afinidade real entre a construção contrapontística barroca e a música popular brasileira',
        'Que o folclore deve ser abandonado',
        'Que Bach era brasileiro de espírito',
      ],
      correctIndex: 1,
      explanation:
        'Os títulos duplos apontam correspondências — a ária que é modinha, a toccata que é trem —, sugerindo parentesco estrutural e não mera justaposição.',
    },
  ],

  11: [
    {
      kind: 'MARKDOWN',
      id: 'br11_intro',
      markdown:
        'Em torno e depois de Villa-Lobos, o programa nacionalista foi levado adiante por compositores que o aplicaram com mais sistema e menos exuberância.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br11_primeira',
      markdown:
        '## A primeira geração\n\n' +
        'Compositores formados ainda no ambiente do fim do século XIX, que aderiram ao programa modernista já maduros. Sua obra é de transição: linguagem pós-romântica com material brasileiro incorporado progressivamente.\n\n' +
        'O traço comum é a **coleta**. Vários deles fizeram trabalho de pesquisa de campo, transcrevendo e publicando repertório tradicional. Essa produção documental é, em alguns casos, mais duradoura que a composicional — e é ela que deu à geração seguinte o material com que trabalhar.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br11_mignone',
      markdown:
        '## Francisco Mignone e Lorenzo Fernândez\n\n' +
        '**Mignone** teve trajetória dupla, e assumida: formado na Itália, escreveu ópera e obra sinfônica na linguagem europeia e, paralelamente, sob pseudônimo, compôs música popular urbana de sucesso. Só mais tarde aderiu ao nacionalismo, e sua produção nacionalista é das mais idiomáticas do período — as peças para piano baseadas em danças e festas populares são de uma naturalidade que a geração anterior não alcançou.\n\n' +
        'A dupla trajetória é significativa: mostra que a separação entre erudito e popular era, para os próprios músicos, uma convenção de mercado mais do que uma fronteira real.\n\n' +
        '**Lorenzo Fernândez** trabalhou de modo mais sistemático a incorporação de escalas e ritmos regionais à linguagem de concerto, e sua obra é das que melhor demonstram o programa aplicado com rigor.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br11_como',
      markdown:
        '## Como o material entra na obra\n\n' +
        'Vale nomear as técnicas, porque elas se repetem em toda a geração.\n\n' +
        '**Citação** — a melodia tradicional aparece reconhecível, harmonizada. É o grau mais superficial.\n\n' +
        '**Paráfrase** — a melodia é alterada, ornamentada, fragmentada; reconhece-se o parentesco, não a peça.\n\n' +
        '**Extração de material** — toma-se a **escala** do repertório tradicional (frequentemente modal, com sétima abaixada ou quarta aumentada) e compõe-se melodia nova dentro dela. O resultado soa brasileiro sem citar nada.\n\n' +
        '**Extração rítmica** — a célula rítmica de uma dança regional organiza o movimento inteiro, independentemente da melodia.\n\n' +
        'Os dois últimos procedimentos são os que o programa do capítulo IX chamava de incorporação estrutural. São também os mais difíceis, e os que produziram as obras que envelheceram melhor.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br11_check',
      question: 'O que distingue extração de material da simples citação?',
      options: [
        'A extração usa mais instrumentos',
        'A extração toma a escala ou a célula rítmica e compõe material novo dentro dela',
        'A citação é proibida por direito autoral',
        'A extração exige texto cantado',
      ],
      correctIndex: 1,
      explanation:
        'Citar é usar a melodia pronta. Extrair é tomar a estrutura — escala, célula rítmica — e compor com ela, produzindo música nova que soa da mesma origem.',
    },
  ],

  12: [
    {
      kind: 'MARKDOWN',
      id: 'br12_intro',
      markdown:
        'A terceira geração nacionalista é a que leva o programa ao mais alto grau de rigor técnico — e a que entra em conflito aberto com a vanguarda.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br12_guarnieri',
      markdown:
        '## Camargo Guarnieri\n\n' +
        'Sua obra é o nacionalismo brasileiro em sua forma mais depurada: contraponto denso, escrita econômica, material brasileiro absorvido a ponto de não se destacar como citação.\n\n' +
        'Escreveu muito para piano — as séries de peças curtas baseadas em danças e cantos populares são o núcleo da sua produção — e também sinfonias, concertos e música de câmara, sempre dentro da mesma linguagem.\n\n' +
        'Foi ainda professor de grande influência, e formou boa parte da geração seguinte.\n\n' +
        'Em 1950 publicou uma carta aberta contra o dodecafonismo, acusando-o de formalismo, de cosmopolitismo e de alienação em relação à realidade brasileira. O documento provocou ruptura duradoura no meio musical do país.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br12_polemica',
      markdown:
        '## A polêmica, e o que estava em jogo\n\n' +
        'Os argumentos de cada lado:\n\n' +
        '**Nacionalistas** — a música deve comunicar-se com seu povo e apoiar-se em sua cultura. Uma técnica importada, abstrata e inacessível é, na prática, subordinação cultural com aparência de modernidade.\n\n' +
        '**Vanguardistas** — a linguagem musical não tem nacionalidade, e prender o compositor brasileiro ao folclore é condená-lo ao provincianismo e ao atraso permanente. Modernizar é participar do debate internacional.\n\n' +
        'A disputa foi áspera, teve consequências institucionais — cargos, bolsas, acesso a orquestras — e atravessou também a política, com cada posição sendo associada a campos ideológicos.\n\n' +
        'Vista hoje, ela reencena a pergunta do capítulo V com outros termos: **quem define o que é legítimo, e com que autoridade?** É a mesma questão que apareceu com Carlos Gomes, e reaparecerá no tropicalismo.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br12_gnattali',
      markdown:
        '## Radamés Gnattali\n\n' +
        'Caso que desmonta a oposição por dentro.\n\n' +
        'Formado eruditamente, trabalhou a vida inteira em rádio e gravadora como arranjador, escrevendo para orquestra de estúdio, acompanhando cantores populares, tocando com chorões — e, ao mesmo tempo, compondo sonatas, concertos e música de câmara.\n\n' +
        'Sua obra de concerto é atravessada pelo choro e pelo samba não como citação, mas como linguagem materna. E seus arranjos de música popular têm construção de quem domina contraponto.\n\n' +
        'Ele não escolheu entre erudito e popular porque, no ambiente em que trabalhou, a escolha não fazia sentido. É o argumento mais forte contra a divisão que a polêmica do período supunha.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br12_check',
      question: 'Qual era o argumento nacionalista contra o dodecafonismo?',
      options: [
        'Que era tecnicamente fácil demais',
        'Que uma técnica importada e abstrata equivalia a subordinação cultural disfarçada de modernidade',
        'Que não podia ser tocada no Brasil',
        'Que era proibida pelo governo',
      ],
      correctIndex: 1,
      explanation:
        'A acusação era de formalismo e cosmopolitismo: música que não se comunica com seu povo nem se apoia em sua cultura seria, na prática, dependência com aparência de avanço.',
    },
  ],

  13: [
    {
      kind: 'MARKDOWN',
      id: 'br13_intro',
      markdown:
        'A partir do fim dos anos 1930, a técnica dodecafônica chega ao Brasil e produz a primeira ruptura declarada com o programa nacionalista.\n\n' +
        'O veículo foi o grupo **Música Viva**, reunido em torno de um compositor e professor alemão radicado no país, que trouxe consigo a formação da vanguarda europeia.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br13_musicaviva',
      markdown:
        '## Música Viva\n\n' +
        'O grupo teve boletim, programa de rádio, concertos e um manifesto.\n\n' +
        'As teses centrais: a música deve acompanhar seu tempo; a técnica é internacional e o compositor brasileiro tem direito a ela; e o folclorismo, praticado como obrigação, vira academismo — repete fórmulas em vez de investigar.\n\n' +
        'O trabalho pedagógico foi talvez mais importante que o composicional: formou uma geração de compositores que, mesmo divergindo depois, saiu dali com domínio de técnicas contemporâneas.\n\n' +
        'A reação nacionalista, tratada no capítulo anterior, foi violenta — e teve efeito prático: o grupo se dispersou, e vários de seus integrantes recuaram para posições intermediárias.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br13_saldo',
      markdown:
        '## O saldo\n\n' +
        'O dodecafonismo não se estabeleceu no Brasil como linguagem dominante, e é útil perguntar por quê.\n\n' +
        'Parte da resposta é a resistência institucional. Parte é que a música brasileira de concerto sempre teve, como referência de sucesso, a comunicação com um público — e a série não oferecia isso.\n\n' +
        'Mas o episódio deixou consequências duradouras: quebrou o consenso nacionalista, legitimou a experimentação, e abriu o caminho que as vanguardas dos anos 1960 percorreriam.\n\n' +
        'Vários compositores importantes do período seguinte passaram pela série e saíram dela com linguagem própria, nem nacionalista nem serial. É talvez o resultado mais produtivo do episódio.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br13_check',
      question: 'Qual foi a crítica do Música Viva ao folclorismo?',
      options: [
        'Que o folclore era de má qualidade',
        'Que, praticado como obrigação, vira academismo — repetição de fórmulas em vez de investigação',
        'Que o folclore não era brasileiro',
        'Que ninguém sabia transcrevê-lo',
      ],
      correctIndex: 1,
      explanation:
        'A acusação não era contra o material, e sim contra transformá-lo em regra: a obrigação de usar folclore congela a linguagem tanto quanto qualquer outro academismo.',
    },
  ],

  14: [
    {
      kind: 'MARKDOWN',
      id: 'br14_intro',
      markdown:
        'A bossa nova é a reforma técnica mais precisa da música popular brasileira. Em poucos anos, no fim dos anos 1950, reorganizou harmonia, ritmo e interpretação da canção — e o efeito foi permanente.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br14_harmonia',
      markdown:
        '## A reforma harmônica\n\n' +
        'O samba-canção dos anos 1940 usava harmonia tonal funcional simples, com acordes de três e quatro sons.\n\n' +
        'A bossa nova introduziu sistematicamente:\n\n' +
        '**Extensões** — nonas, décimas primeiras elevadas, décimas terceiras, tratadas como parte normal do acorde e não como tensão a resolver.\n\n' +
        '**Acordes alterados** — quintas e nonas modificadas, dominantes com várias alterações simultâneas.\n\n' +
        '**Substituições** — o trote de trítono, os acordes diminutos de passagem, as cadências ampliadas.\n\n' +
        '**Condução de vozes** — os acordes ligados por movimento cromático interno, de modo que a mudança seja mínima entre um e outro.\n\n' +
        'Essa harmonia vem em parte do jazz e em parte do impressionismo francês, que circulava entre músicos com formação erudita. O que a bossa nova fez foi **naturalizá-la na canção** — usá-la sem que soasse erudita nem jazzística, mas simplesmente como o modo de harmonizar uma canção brasileira.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'br14_lab',
      title: 'Acorde com nona e décima primeira elevada',
      notes: ['C4', 'E4', 'A#4', 'D5', 'F#5'],
      prompt: 'Extensões tratadas como sonoridade estável, não como tensão a resolver. É a assinatura harmônica do período.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br14_ritmo',
      markdown:
        '## A divisão do violão\n\n' +
        'A inovação rítmica é mais difícil de descrever e igualmente decisiva.\n\n' +
        'O violão passa a fazer, sozinho, duas funções simultâneas: o **polegar** marca uma linha de baixo regular, geralmente nos tempos, enquanto os **dedos** tocam os acordes numa divisão sincopada que não coincide com o baixo.\n\n' +
        'O resultado é que um instrumento só reproduz a relação entre surdo e tamborim de uma bateria de samba. A percussão inteira cabe num violão — e é por isso que a bossa nova pôde ser tocada por uma pessoa numa sala pequena.\n\n' +
        'Essa redução é o ponto. O samba de bateria exige um grupo e um espaço; a bossa nova leva a mesma organização rítmica para o formato de câmara.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br14_canto',
      markdown:
        '## O canto\n\n' +
        'A terceira mudança: abandona-se a voz projetada, vibrada e dramática do rádio, e adota-se um canto **próximo da fala**, sem vibrato, em volume baixo, com afinação precisa e dicção natural.\n\n' +
        'Isso só é possível com **microfone** — é uma estética que depende de tecnologia de captação. E produz um efeito de intimidade que muda a relação com o ouvinte: não é alguém cantando para uma plateia, é alguém cantando perto.\n\n' +
        'As três mudanças — harmônica, rítmica e vocal — formam um sistema coerente. Nenhuma delas funcionaria isolada: a harmonia complexa exige atenção que o canto discreto permite; o canto discreto exige o acompanhamento contido que a divisão do violão fornece.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br14_check',
      question: 'O que a divisão do violão na bossa nova reproduz?',
      options: [
        'A melodia da canção',
        'A relação entre baixo regular e sincopação de uma bateria de samba, num instrumento só',
        'O acompanhamento do choro',
        'A harmonia do jazz',
      ],
      correctIndex: 1,
      explanation:
        'Polegar e dedos fazem funções rítmicas independentes — o equivalente a surdo e tamborim —, o que permite ao violão sozinho sustentar a organização rítmica do samba.',
    },
  ],

  15: [
    {
      kind: 'MARKDOWN',
      id: 'br15_intro',
      markdown:
        'Nos anos 1960, a música de concerto brasileira rompe definitivamente com o programa nacionalista e se alinha às correntes internacionais de vanguarda.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br15_manifestos',
      markdown:
        '## Os manifestos\n\n' +
        'Grupos de compositores jovens publicam documentos declarando que o nacionalismo folclórico estava esgotado e que a música devia incorporar os meios do seu tempo: novos materiais sonoros, notação gráfica, indeterminação, eletrônica.\n\n' +
        'As posições variam, mas há um ponto comum: a recusa de que a nacionalidade seja um dever estético. Ser brasileiro deixa de ser um programa e volta a ser uma circunstância.\n\n' +
        'Alguns desses grupos mantiveram compromisso político explícito, e defendiam que a modernização da linguagem era, ela própria, posição diante da realidade do país.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br15_meios',
      markdown:
        '## Os meios novos\n\n' +
        '**Música eletroacústica** — instalam-se estúdios em universidades e centros de pesquisa. O compositor passa a trabalhar diretamente com o som gravado e sintetizado, sem notação e sem intérprete. A produção brasileira nessa área começa modesta em recursos e desenvolve soluções próprias.\n\n' +
        '**Notação gráfica e indeterminação** — partituras que deixam decisões ao intérprete, ou que indicam a música por desenho em vez de altura e duração precisas.\n\n' +
        '**Textura e massa** — composição por densidades e nuvens sonoras, em vez de por notas individuais.\n\n' +
        '**Instrumentos preparados e técnicas estendidas** — extrair do instrumento sons que ele não foi feito para produzir.\n\n' +
        'Institucionalmente, o período é marcado pela criação de cursos universitários de composição, festivais e bienais — o que deu à música de concerto brasileira uma base que ela não tinha.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br15_check',
      question: 'O que as vanguardas dos anos 1960 recusavam no nacionalismo?',
      options: [
        'O uso de orquestra',
        'Que a nacionalidade fosse um dever estético em vez de uma circunstância',
        'A escrita para piano',
        'O contato com música popular',
      ],
      correctIndex: 1,
      explanation:
        'A recusa não era ao Brasil, e sim à obrigação: compor brasileiro deixou de ser programa prescrito e voltou a ser condição de quem compõe aqui.',
    },
  ],

  16: [
    {
      kind: 'MARKDOWN',
      id: 'br16_intro',
      markdown:
        'Entre 1964 e 1985, sob ditadura militar, a canção popular brasileira assume função que em outros países coube à imprensa e ao debate público: tornou-se o principal espaço de discurso sobre o país.\n\n' +
        'Não foi escolha estética: foi o que restou.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br16_festivais',
      markdown:
        '## Os festivais\n\n' +
        'Os festivais televisivos da segunda metade dos anos 1960 transformaram a canção em acontecimento nacional. Auditórios lotados, torcidas organizadas, vaias e aplausos como num estádio, e milhões de pessoas assistindo.\n\n' +
        'O formato de competição teve efeito sobre a própria canção: valorizou o **impacto imediato**, a letra que pudesse ser compreendida e discutida na primeira audição, e o arranjo que causasse efeito ao vivo.\n\n' +
        'E criou uma disputa pública sobre o que a música brasileira devia ser — disputa que se encenava literalmente no palco, com o público tomando partido.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br16_tropicalismo',
      markdown:
        '## Tropicalismo\n\n' +
        'O programa tropicalista foi o mais polêmico, e o mais consequente.\n\n' +
        'Suas teses:\n\n' +
        '**Antropofagia** — engolir o estrangeiro e devolvê-lo transformado, em vez de recusá-lo em nome da pureza nacional. A ideia vinha do modernismo dos anos 1920 e foi retomada deliberadamente.\n\n' +
        '**Recusa da pureza** — guitarra elétrica, rock, iê-iê-iê e cultura de massa entram no mesmo caldo que o baião, o samba e a marcha. A mistura é o ponto, não um meio.\n\n' +
        '**Recusa da hierarquia entre bom e mau gosto** — o brega, o cafona e o kitsch são material legítimo.\n\n' +
        'A reação foi dura, e veio dos dois lados: a esquerda nacionalista acusou o movimento de alienação e submissão ao imperialismo cultural — a guitarra elétrica chegou a ser objeto de passeata de protesto —, e o regime prendeu e exilou seus principais nomes.\n\n' +
        'É o mesmo conflito do capítulo XII, de novo: quem define o que é legítimo. Só que agora a pergunta é feita por dentro da música popular.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br16_censura',
      markdown:
        '## A censura\n\n' +
        'A censura prévia obrigava a submeter letras antes da gravação e da execução. Canções eram proibidas, versos alterados sob exigência, discos retidos.\n\n' +
        'O efeito sobre a linguagem foi paradoxal e é bem documentado: a proibição do dito direto produziu uma **poética da metáfora**. Letras que falam de amor e falam de repressão; de viagem e de exílio; de amanhecer e de fim do regime.\n\n' +
        'O ouvinte aprendeu a ler nas entrelinhas, e a cumplicidade entre quem escrevia e quem ouvia tornou-se parte do sentido da canção.\n\n' +
        'Convém não romantizar isso. A censura empobreceu o que pôde, silenciou carreiras, exilou gente e destruiu obras. A criatividade que ela provocou foi resposta a um dano, não um benefício.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br16_check',
      question: 'O que a antropofagia tropicalista propunha?',
      options: [
        'Recusar toda influência estrangeira',
        'Engolir o estrangeiro e devolvê-lo transformado, em vez de defender a pureza nacional',
        'Voltar ao folclore rural',
        'Abandonar a canção em favor da música instrumental',
      ],
      correctIndex: 1,
      explanation:
        'A ideia, retomada do modernismo dos anos 1920, inverte a defesa da pureza: incorpora-se o de fora e transforma-se, porque é assim que a cultura brasileira sempre operou.',
    },
  ],

  17: [
    {
      kind: 'MARKDOWN',
      id: 'br17_intro',
      markdown:
        'Boa parte da história que se conta da música brasileira é história do Rio de Janeiro, e depois de São Paulo. Isso não é acidente de narrativa: é efeito de onde estavam o rádio, as gravadoras e a televisão.\n\n' +
        'Este capítulo trata do que essa concentração deixou de fora — e que é, em volume e em variedade, a maior parte.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br17_nordeste',
      markdown:
        '## Nordeste\n\n' +
        'A região de maior densidade de gêneros tradicionais ainda vivos.\n\n' +
        'Na **tradição rural**: o coco, o aboio, o repente e a cantoria de viola, o cavalo-marinho, o bumba meu boi.\n\n' +
        'Na **tradição afro-brasileira urbana**: o maracatu de baque virado e o de baque solto, o afoxé, o frevo — este último uma marcha acelerada com sofisticação de arranjo para metais que poucos gêneros populares alcançam.\n\n' +
        'E o **baião**, que é o caso central. Estruturado a partir de material nordestino — a escala com sétima abaixada e quarta aumentada característica, a célula rítmica do baião, a formação de sanfona, zabumba e triângulo —, foi levado ao rádio nacional nos anos 1940 e teve êxito gigantesco.\n\n' +
        'O baião é a prova de que a concentração da indústria não era barreira absoluta: um gênero regional, apresentado sem diluição, podia tornar-se nacional. Mas exigiu uma operação deliberada de apresentação, e não aconteceu sozinho.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br17_outras',
      markdown:
        '## Norte, Sul, Centro-Oeste, Minas\n\n' +
        '**Norte** — o carimbó e o lundu marajoara no Pará; o boi-bumbá amazonense, que se desenvolveu em espetáculo de grande escala; e, mais tarde, o encontro da guitarra com ritmos caribenhos que produziu gêneros próprios da região.\n\n' +
        '**Sul** — a música de raiz ibérica e platina: a milonga, a chamarrita, o vanerão e o xote gaúcho, com influência direta do Prata e da imigração europeia.\n\n' +
        '**Centro-Oeste e interior paulista** — a **moda de viola** e o canto em terças paralelas das duplas caipiras, com a viola de dez cordas e suas afinações próprias. É um dos repertórios de maior público do país e dos menos estudados academicamente.\n\n' +
        '**Minas Gerais** — além do barroco do capítulo III, a tradição das folias de reis, do congado, e uma produção de canção do século XX com linguagem harmônica e vocal reconhecível.',
    },
    {
      kind: 'CALLOUT',
      id: 'br17_call',
      type: 'warning',
      title: 'Regional não quer dizer menor',
      text:
        'A palavra "regional" costuma funcionar como rebaixamento — o que é do Rio é nacional, o resto é regional. Mas o samba também é regional: é do Rio. A diferença não está na música, está em onde ficavam os estúdios e as emissoras.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br17_check',
      question: 'Por que a história da música brasileira é predominantemente carioca e paulista?',
      options: [
        'Porque a música dessas cidades era melhor',
        'Porque rádio, gravadoras e televisão estavam concentrados nesse eixo',
        'Porque as outras regiões não tinham música própria',
        'Porque houve proibição legal de gravar fora do Sudeste',
      ],
      correctIndex: 1,
      explanation:
        'A narrativa segue a infraestrutura de registro e difusão. O que não foi gravado e transmitido entrou menos na história — o que diz respeito à indústria, não à música.',
    },
  ],

  18: [
    {
      kind: 'MARKDOWN',
      id: 'br18_intro',
      markdown:
        'Das últimas décadas do século XX até agora, a música brasileira se caracteriza por não ter um centro — nem estético, nem geográfico, nem institucional.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br18_concerto',
      markdown:
        '## A música de concerto\n\n' +
        'Depois do esgotamento tanto do nacionalismo quanto da vanguarda de manifesto, a produção de concerto brasileira se pluraliza. Já não há programa a cumprir nem linha a seguir.\n\n' +
        'Convivem: compositores que retomam material brasileiro sem o dever nacionalista; os que trabalham com técnicas de textura e espectro; os que compõem com meios eletrônicos e mistos; os que escrevem música de linguagem consonante e acessível sem constrangimento; e os que cruzam deliberadamente com o popular e com tradições locais.\n\n' +
        'A base institucional melhorou — há pós-graduação em música em várias universidades, orquestras estáveis em mais cidades, festivais e editais. E permanece frágil, dependente de política pública que oscila.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br18_cruzamentos',
      markdown:
        '## Os cruzamentos\n\n' +
        'O traço mais visível do período é a perda de nitidez das fronteiras de gênero.\n\n' +
        'Instrumentistas com formação erudita tocando choro e improvisando; músicos populares escrevendo para orquestra; grupos que combinam percussão de matriz africana com eletrônica; repertórios tradicionais regravados com arranjos de câmara; rap e funk carioca incorporando samples de qualquer origem.\n\n' +
        'Isso não é novidade absoluta — os capítulos VI e XII mostraram o mesmo trânsito em outras épocas. A diferença é que agora ele é a norma e não a exceção, e já não gera polêmica de legitimidade.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br18_digital',
      markdown:
        '## A circulação digital\n\n' +
        'A mudança material mais importante desde o rádio.\n\n' +
        'Gravar deixou de exigir estúdio e capital. Distribuir deixou de exigir gravadora e loja. Um artista de qualquer cidade do país pode publicar e ser ouvido em qualquer lugar.\n\n' +
        'Os efeitos são ambíguos e vale enunciá-los sem entusiasmo nem lamento.\n\n' +
        'De um lado, a concentração do capítulo XVII se enfraqueceu: gêneros que nunca teriam passado pelo filtro das gravadoras alcançaram público nacional — o funk carioca, o brega paraense, o piseiro nordestino, o sertanejo em suas várias fases.\n\n' +
        'De outro, surgiu nova concentração: as plataformas de distribuição são poucas, globais, e seus algoritmos de recomendação decidem o que é ouvido com opacidade maior que a de qualquer diretor artístico de gravadora. E a remuneração por execução é baixíssima, o que empurra o músico de volta para o show e para o trabalho de encomenda.\n\n' +
        'O gargalo mudou de lugar. Não desapareceu.',
    },
    {
      kind: 'CALLOUT',
      id: 'br18_call',
      type: 'info',
      title: 'Onde isto deixa você',
      text:
        'Dezoito capítulos, das matrizes formadoras à circulação digital. A pergunta que atravessa o curso inteiro — o que faz uma música ser brasileira, e quem tem autoridade para responder — reapareceu em cada período com roupa diferente: com Carlos Gomes, com o modernismo, com Guarnieri, com o tropicalismo. Ela não tem resposta final, e é por isso que continua produtiva.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br18_check',
      question: 'Qual é o efeito ambíguo da circulação digital?',
      options: [
        'Acabou com a concentração da indústria por completo',
        'Enfraqueceu a concentração geográfica, mas criou nova concentração nas plataformas e seus algoritmos',
        'Aumentou a remuneração dos músicos',
        'Eliminou a necessidade de shows',
      ],
      correctIndex: 1,
      explanation:
        'Gêneros regionais alcançaram público nacional sem passar por gravadoras, mas as plataformas são poucas e decidem o que se ouve com opacidade maior que a do filtro anterior.',
    },
  ],
};
