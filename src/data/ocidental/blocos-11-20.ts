import { LessonBlock } from '../../domain/academy';

/**
 * História da Música Ocidental — capítulos 11 a 20.
 *
 * Do barroco tardio ao século XX. Texto autoral; nenhuma obra de referência é
 * citada. Compositores são nomeados porque são o assunto — o que não se cita
 * é bibliografia.
 */
export const BLOCOS_OCID_11_20: Record<number, LessonBlock[]> = {
  11: [
    {
      kind: 'MARKDOWN',
      id: 'oc11_intro',
      markdown:
        'Ao longo do século XVII a música instrumental deixa de ser subproduto da vocal e passa a ter quantidade, prestígio e formas próprias.\n\n' +
        'O problema que ela precisa resolver é o que ficou em aberto no capítulo VII: **sem texto, o que dá forma a uma peça?** Três respostas se firmam, e são as três formas do barroco tardio.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc11_suite',
      markdown:
        '## Suíte: a forma pela dança\n\n' +
        'Uma sucessão de danças estilizadas, todas na mesma tonalidade, cada uma com seu caráter e sua métrica.\n\n' +
        'O núcleo consolidado é **allemande** (moderada, binária), **courante** (mais rápida, ternária), **sarabanda** (lenta, ternária, com acento no segundo tempo) e **giga** (rápida, em divisão ternária). Entre a sarabanda e a giga inserem-se danças opcionais: minueto, bourrée, gavota, passepied.\n\n' +
        '"Estilizadas" é a palavra importante: já não se dança essas peças. A dança forneceu o **molde métrico e o caráter**, e a música passou a habitá-lo por conta própria.\n\n' +
        'A forma de cada dança é binária: duas seções repetidas, a primeira modulando para a dominante, a segunda retornando. Esse esquema simples — sair do centro e voltar — é o embrião da forma sonata.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc11_sonata',
      markdown:
        '## Sonata: a forma pelo contraste de movimentos\n\n' +
        'Sonata, no barroco, significa apenas "peça para tocar", em oposição a cantata, "peça para cantar". Não é ainda a forma sonata.\n\n' +
        'Duas variedades se firmam:\n\n' +
        '**Sonata da chiesa** — quatro movimentos alternando lento e rápido, os rápidos frequentemente fugados. Grave e contida.\n\n' +
        '**Sonata da camera** — na prática uma suíte de danças com introdução.\n\n' +
        'Quanto ao efetivo, a **sonata em trio** é a formação característica: duas linhas melódicas agudas mais o contínuo. O nome engana — são quase sempre **quatro** executantes, porque o contínuo exige um instrumento de harmonia e um grave.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc11_concerto',
      markdown:
        '## Concerto: a forma pelo contraste de massas\n\n' +
        'O princípio é a oposição entre grupos. No **concerto grosso**, um pequeno grupo de solistas alterna com a orquestra plena; no **concerto solo**, um instrumento único enfrenta o conjunto.\n\n' +
        'A organização interna é o **ritornello**: um tema orquestral que retorna várias vezes, em tonalidades diferentes, separando episódios solistas.\n\n' +
        'É a primeira solução verdadeiramente robusta para o problema da forma instrumental longa. Ela combina três coisas: **repetição** reconhecível (o ritornello), **variedade** (os episódios) e **plano tonal** (o percurso das tonalidades). Todas as formas clássicas posteriores usarão alguma combinação desses três recursos.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc11_fuga',
      markdown:
        '## Fuga e música de tecla\n\n' +
        'A **fuga** não é propriamente uma forma, e sim um **procedimento**: um tema — o sujeito — é apresentado por uma voz e sucessivamente imitado pelas outras, em alternância de tônica e dominante, intercalado por episódios modulantes.\n\n' +
        'Não há esquema fixo de seções. O que há é uma técnica de condução que pode gerar peças de qualquer extensão. A fuga é o ponto de chegada de setecentos anos de contraponto imitativo.\n\n' +
        'No órgão, além da fuga, desenvolvem-se as formas ligadas ao coral luterano — o prelúdio de coral, a partita, a fantasia —, em que a melodia comunitária é ornamentada, imitada, ou colocada como cantus firmus. É a confluência do capítulo VIII com este.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc11_check',
      question: 'Por que a "sonata em trio" costuma exigir quatro executantes?',
      options: [
        'Porque tem quatro movimentos',
        'Porque as três linhas escritas incluem o contínuo, que exige um instrumento de harmonia e um grave',
        'Porque um músico fica de reserva',
        'Porque o nome está errado nas fontes',
      ],
      correctIndex: 1,
      explanation:
        'São três linhas escritas — duas agudas e o baixo —, mas o baixo contínuo é realizado por dois executantes: um sustenta a linha, outro preenche a harmonia.',
    },
  ],

  12: [
    {
      kind: 'MARKDOWN',
      id: 'oc12_intro',
      markdown:
        'A primeira metade do século XVIII é simultaneamente o ponto mais alto do barroco e o momento em que ele começa a soar antiquado. Enquanto a linguagem contrapontística alcança sua realização máxima, uma geração mais nova já a considera pesada e escolástica.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc12_vivaldi',
      markdown:
        '## Vivaldi e a forma do concerto\n\n' +
        'É com Vivaldi que o concerto solo ganha a forma que se tornará padrão: **três movimentos**, rápido–lento–rápido, com os externos em forma de ritornello.\n\n' +
        'Suas contribuições concretas: ritmos incisivos e memoráveis; clareza tonal — as modulações são audíveis e funcionais; e um papel solista que exige virtuosismo real, não apenas ornamentação.\n\n' +
        'A produção foi enorme, e a difusão maior ainda: os concertos circularam impressos por toda a Europa e foram estudados, copiados e transcritos por outros compositores. A forma do concerto se padroniza porque um modelo eficiente ficou disponível a todos.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc12_rameau',
      markdown:
        '## Rameau e a teoria da harmonia\n\n' +
        'Compositor de ópera, e o primeiro a formular sistematicamente o que a prática já fazia havia um século.\n\n' +
        'Suas teses centrais:\n\n' +
        'O acorde tem uma **fundamental** — e as inversões são o **mesmo** acorde, apenas com outra nota no baixo. Antes disso, cada disposição era tratada como entidade distinta.\n\n' +
        'A harmonia se organiza por **funções**: tônica, dominante e subdominante têm papéis distintos e hierárquicos.\n\n' +
        'E a **série harmônica** fundamenta acusticamente o sistema — a tríade maior não é convenção, está na natureza do som.\n\n' +
        'Essa formulação é a base da teoria harmônica que ainda se ensina. Ela transforma a harmonia de prática transmitida por hábito em **sistema explicável** — com todas as vantagens e as rigidezes que isso traz.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc12_bach',
      markdown:
        '## Bach\n\n' +
        'Não foi celebrado em vida como compositor — era conhecido sobretudo como organista e examinador de instrumentos —, e sua música foi considerada densa e fora de moda por seus contemporâneos mais jovens. O reconhecimento pleno veio no século XIX.\n\n' +
        'O que distingue sua obra é a **síntese**. As tradições italiana, francesa e alemã, o contraponto antigo e a harmonia tonal moderna, o coral luterano e a forma de concerto: tudo aparece integrado numa linguagem só.\n\n' +
        '**Instrumental** — as coleções para tecla percorrem sistematicamente as vinte e quatro tonalidades, demonstrando na prática o que a afinação temperada permitia; as suítes para instrumento solo sem acompanhamento extraem polifonia de uma linha única; os concertos reelaboram o modelo italiano com densidade contrapontística maior.\n\n' +
        '**Vocal** — as cantatas de igreja, escritas semanalmente durante anos, articulam coral, coro, recitativo e ária em torno do texto do dia. As Paixões levam essa arquitetura à escala máxima, combinando narração, meditação e participação da assembleia.\n\n' +
        'As obras finais — ciclos de fugas e cânones sobre um mesmo tema — são exploração sistemática de possibilidades contrapontísticas, e algumas nem especificam instrumento. É música que investiga o próprio material.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc12_handel',
      markdown:
        '## Händel\n\n' +
        'A trajetória oposta: cosmopolita, empresário de si mesmo, celebrado em vida e nunca esquecido depois.\n\n' +
        'Formado na Alemanha, aperfeiçoado na Itália, estabelecido em Londres, construiu carreira produzindo **ópera italiana** para o público inglês. Quando esse mercado entrou em colapso — custos altos, brigas entre cantores, concorrência da ópera em inglês com assunto popular —, ele mudou de gênero.\n\n' +
        'O **oratório em inglês** foi sua resposta comercial e artística: sem encenação, portanto mais barato; em inglês, portanto compreensível; com assunto bíblico, portanto aceitável na Quaresma; e com **coros** de grande efeito, que o público inglês, com sua tradição coral, apreciava.\n\n' +
        'Foi um acerto completo, e fundou a tradição coral anglófona que atravessa os dois séculos seguintes.',
    },
    {
      kind: 'CALLOUT',
      id: 'oc12_call',
      type: 'historical',
      title: 'Dois modelos de vida musical',
      text:
        'Bach foi funcionário — de cortes, de igrejas, de uma escola municipal — e compôs dentro das obrigações do cargo. Händel foi empresário, arriscou capital próprio, faliu e se reergueu. As duas trajetórias, contemporâneas e nascidas no mesmo ano, mostram que a passagem do músico-servidor ao músico-empreendedor já estava em curso no início do século XVIII.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc12_check',
      question: 'Qual foi a contribuição teórica central de Rameau?',
      options: [
        'A invenção do baixo contínuo',
        'Reconhecer que as inversões são o mesmo acorde e organizar a harmonia por funções',
        'A criação da forma sonata',
        'A padronização do concerto em três movimentos',
      ],
      correctIndex: 1,
      explanation:
        'A noção de fundamental unificou as inversões num só acorde, e a organização funcional (tônica, dominante, subdominante) tornou a harmonia um sistema explicável.',
    },
  ],

  13: [
    {
      kind: 'MARKDOWN',
      id: 'oc13_intro',
      markdown:
        'Por volta de 1730, uma geração mais nova passa a achar o contraponto barroco artificial, pesado e afetado. O que se quer agora é **naturalidade**: melodia clara, frases regulares, harmonia simples, textura leve.\n\n' +
        'Não é apenas gosto musical. É a mesma virada que atravessa a filosofia, a literatura e as artes do período — desconfiança do artifício, valorização da clareza, apelo à razão e ao sentimento natural.\n\n' +
        'Dois estilos de transição preparam o terreno: o **galante**, elegante e ornamentado, feito para agradar; e o **sensível**, que busca expressão íntima e mudanças bruscas de afeto dentro da mesma peça — coisa que a estética barroca do afeto único não admitia.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc13_mudancas',
      markdown:
        '## O que muda concretamente\n\n' +
        '| Barroco | Clássico |\n' +
        '|---|---|\n' +
        '| Textura contrapontística densa | Melodia acompanhada |\n' +
        '| Um afeto por movimento | Contrastes dentro do movimento |\n' +
        '| Frase contínua, expansiva | Frase periódica de 4 e 8 compassos |\n' +
        '| Harmonia em ritmo rápido | Harmonia mais lenta, pontuando |\n' +
        '| Baixo contínuo | Harmonia escrita por extenso |\n\n' +
        'O abandono do contínuo é mais importante do que parece: significa que o compositor passa a **especificar** cada nota da harmonia, em vez de delegá-la ao executante. A partitura fica mais completa, e o intérprete, menos coautor.\n\n' +
        'A frase periódica é o outro pilar. Antecedente e consequente, pergunta e resposta, quatro compassos e quatro compassos: a música passa a ter uma métrica de segundo nível, previsível o bastante para que a quebra dela seja expressiva.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc13_sonata',
      markdown:
        '## A forma sonata\n\n' +
        'A grande construção do período. Em resumo:\n\n' +
        '**Exposição** — apresenta um primeiro grupo temático na tônica e um segundo na dominante (ou na relativa maior, se a peça for menor). O essencial não são os temas: é o **conflito tonal** entre dois centros.\n\n' +
        '**Desenvolvimento** — fragmenta, combina e transporta o material, passando por tonalidades distantes. É a zona de instabilidade.\n\n' +
        '**Reexposição** — retoma os dois grupos, agora **ambos na tônica**. O conflito tonal se resolve.\n\n' +
        'É o ponto que costuma escapar: a forma sonata é um **drama de tonalidades**, não um arranjo de melodias. A tensão que a sustenta é a distância entre tônica e dominante, e a resolução é trazer tudo de volta ao centro.\n\n' +
        'Isso explica por que ela pôde sustentar obras cada vez mais longas: o plano tonal dá direção a qualquer quantidade de material.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc13_generos',
      markdown:
        '## Os gêneros que se firmam\n\n' +
        'A **sinfonia** nasce da abertura de ópera italiana, em três seções — rápido, lento, rápido —, que se destaca do teatro e vira peça de concerto. Ganha depois um quarto movimento, o minueto, e se estabiliza.\n\n' +
        'O **quarteto de cordas** surge como a formação de câmara por excelência: quatro linhas equivalentes, sem contínuo, sem instrumento de harmonia. É a textura mais exigente, porque não há onde se esconder.\n\n' +
        'O **concerto clássico** adapta o ritornello barroco à forma sonata, criando uma exposição dupla — primeiro a orquestra, depois o solista.\n\n' +
        'Na ópera, a **reforma** ataca os excessos: menos exibição do cantor, menos ária da capo obrigatória, mais continuidade dramática, coro reintegrado à ação. O argumento é o mesmo de 1600 — a música deve servir ao drama —, e ele reaparecerá ainda outras vezes.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc13_check',
      question: 'O que gera a tensão estrutural da forma sonata?',
      options: [
        'O contraste entre dois temas diferentes',
        'O conflito entre dois centros tonais, resolvido quando tudo retorna à tônica',
        'A alternância de andamentos',
        'A diferença de instrumentação',
      ],
      correctIndex: 1,
      explanation:
        'Os temas podem até ser parecidos. O que estrutura a forma é a saída da tônica para a dominante na exposição e o retorno de todo o material à tônica na reexposição.',
    },
  ],

  14: [
    {
      kind: 'MARKDOWN',
      id: 'oc14_intro',
      markdown:
        'No último terço do século XVIII o estilo clássico atinge a maturidade. Duas trajetórias, muito diferentes entre si, o definem.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc14_haydn',
      markdown:
        '## Haydn\n\n' +
        'Passou quase trinta anos empregado numa corte aristocrática, com orquestra à disposição e obrigação de produzir continuamente. Ele mesmo observou que o isolamento o obrigou a se tornar original — não havia com quem comparar-se.\n\n' +
        'Suas contribuições são estruturais.\n\n' +
        'No **quarteto de cordas**, estabeleceu a independência das quatro vozes e o diálogo entre elas: o material circula, nenhuma voz é mero acompanhamento.\n\n' +
        'Na **sinfonia**, firmou o plano de quatro movimentos e, sobretudo, desenvolveu o **trabalho temático** — construir movimentos inteiros a partir de poucos motivos, transformando-os continuamente. É a técnica que permite que uma peça longa soe unificada.\n\n' +
        'E introduziu o **humor** como recurso composicional: a expectativa criada e frustrada, a pausa inesperada, o final que parece começar de novo. O humor musical depende de convenções firmes — só se pode surpreender quem sabe o que deveria acontecer.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc14_mozart',
      markdown:
        '## Mozart\n\n' +
        'Trajetória oposta: criança prodígio exibida pela Europa, adulto que tentou viver como músico independente numa época em que isso mal era possível.\n\n' +
        'Sua marca é a **absorção**. Viajando desde menino, assimilou o estilo italiano de ópera, o contraponto alemão, a sinfonia vienense, a escola de Mannheim — e fundiu tudo sem que as costuras apareçam.\n\n' +
        'Na **ópera**, realizou o que a reforma pedia: a música conduz o drama, os personagens têm caráter musical distinto, e os **conjuntos** — dueto, trio, finale — permitem que várias pessoas cantem ao mesmo tempo coisas diferentes, cada uma com sua própria intenção. A ação passa a acontecer dentro da música, e não entre as árias.\n\n' +
        'No **concerto para piano**, elevou o gênero ao nível da sinfonia: o diálogo entre solista e orquestra deixa de ser alternância e vira conversa.\n\n' +
        'E o **cromatismo** de sua harmonia, sobretudo tardia, vai além do que o estilo clássico requeria — pressionando de dentro os limites da linguagem.',
    },
    {
      kind: 'CALLOUT',
      id: 'oc14_call',
      type: 'info',
      title: 'Por que esse estilo pareceu "natural"',
      text:
        'A frase de quatro compassos, a harmonia funcional clara e a melodia acompanhada foram sentidas como naturais no século XVIII, e ainda hoje soam assim para quem cresceu ouvindo música ocidental. Naturalidade, aqui, é familiaridade histórica: é o estilo mais difundido do repertório, e por isso o ouvido o toma por padrão.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc14_check',
      question: 'O que o trabalho temático permite?',
      options: [
        'Usar mais instrumentos',
        'Construir movimentos longos e unificados a partir de poucos motivos transformados',
        'Escrever mais rápido',
        'Dispensar a tonalidade',
      ],
      correctIndex: 1,
      explanation:
        'Derivar tudo de pouco material dá coerência a peças extensas: o ouvinte reconhece as transformações, e a obra soa como um percurso e não como uma coleção.',
    },
  ],

  15: [
    {
      kind: 'MARKDOWN',
      id: 'oc15_intro',
      markdown:
        'Beethoven é o ponto em que a linguagem clássica é levada até onde ela suporta — e além.\n\n' +
        'Sua posição é dupla: herdeiro direto de Haydn e Mozart, e o compositor que muda o estatuto da música. Com ele, a obra deixa de ser encomenda para ocasião e passa a ser **declaração pessoal**; o compositor deixa de ser artesão a serviço e passa a ser artista com algo a dizer.\n\n' +
        'Foi também o primeiro a viver, com dificuldade mas com êxito, de assinaturas, edições e concertos — sem cargo fixo numa corte.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc15_fases',
      markdown:
        '## As três fases\n\n' +
        '**Primeira** — a linguagem herdada, já com marcas próprias: contrastes mais violentos, acentos deslocados, humor mais áspero que o de Haydn, e uma insistência rítmica que não tem precedente.\n\n' +
        '**Segunda** — a fase da ampliação. Os movimentos se alongam, o desenvolvimento cresce até se tornar o centro de gravidade da peça, as codas deixam de ser fechamento e viram segundo desenvolvimento. O minueto dá lugar ao **scherzo**, mais rápido e mais brusco. E aparece a ideia de obra com **percurso**: uma sinfonia que começa em conflito e termina em resolução, atravessando os movimentos como uma narrativa.\n\n' +
        '**Terceira** — escrita depois de a surdez se tornar completa. É a fase mais difícil e mais radical: fugas dentro de sonatas, variações que se afastam irreconhecivelmente do tema, formas que não correspondem a nenhum molde, e passagens de simplicidade extrema ao lado de outras de densidade extrema. Boa parte dessa música foi considerada incompreensível por décadas.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc15_nona',
      markdown:
        '## A Nona Sinfonia\n\n' +
        'Introduzir **vozes e coro** numa sinfonia quebrou a fronteira entre gênero instrumental e vocal, que estava firme havia um século.\n\n' +
        'As consequências foram enormes e duraram cem anos. Para uns, ela provou que a música instrumental pura já não bastava e precisava do apoio da palavra — e essa leitura levou ao poema sinfônico e ao drama musical. Para outros, foi uma exceção que não deveria ser imitada, e a sinfonia deveria continuar sendo música absoluta.\n\n' +
        'A discussão organizou boa parte do debate estético do século XIX, e os dois campos se formaram em torno dela.\n\n' +
        'Além disso, a obra estabeleceu uma expectativa que pesou sobre todos os sinfonistas seguintes: a de que uma sinfonia deve **significar algo** e levar o ouvinte de um estado a outro. Escrever sinfonias depois disso passou a ser assumir uma herança.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc15_check',
      question: 'Que fronteira a Nona Sinfonia rompeu?',
      options: [
        'Entre música sacra e profana',
        'Entre gênero sinfônico instrumental e gênero vocal',
        'Entre música de corte e música popular',
        'Entre tonalidade maior e menor',
      ],
      correctIndex: 1,
      explanation:
        'Introduzir solistas e coro numa sinfonia misturou dois territórios que estavam separados, e abriu o debate estético central do século XIX.',
    },
  ],

  16: [
    {
      kind: 'MARKDOWN',
      id: 'oc16_intro',
      markdown:
        'Classicismo e romantismo não são períodos sucessivos com fronteira nítida: são **atitudes**, e conviveram.\n\n' +
        '| Classicismo | Romantismo |\n' +
        '|---|---|\n' +
        '| Equilíbrio, proporção | Intensidade, excesso |\n' +
        '| Forma clara | Forma a serviço da expressão |\n' +
        '| O universal | O individual |\n' +
        '| Contenção | Confissão |\n' +
        '| Música absoluta | Música ligada a ideias e imagens |\n\n' +
        'Tecnicamente, o que muda: harmonia mais cromática, modulações a tonalidades distantes, dissonância menos preparada, orquestra maior, dinâmica em extremos, e rubato como norma.\n\n' +
        'Muda também a **posição social**. O músico já não serve a uma corte: vive de concertos, de edições e de aulas. E ganha um público novo — a burguesia urbana, que compra piano, assina concertos e toca em casa.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc16_lied',
      markdown:
        '## O Lied\n\n' +
        'O gênero mais característico do romantismo alemão, e o menos espetacular: uma voz e um piano, numa sala.\n\n' +
        'Sua condição de possibilidade foi dupla — uma poesia lírica alemã de altíssima qualidade, disponível e lida por todos, e um instrumento, o piano moderno, capaz de sustentar, colorir e comentar.\n\n' +
        'O ponto decisivo é o **papel do piano**. Ele não acompanha: é o segundo personagem. Desenha a paisagem, imita o movimento descrito no poema, antecipa o que a voz dirá, e contradiz o que ela diz quando o poema é irônico. Muitas vezes é ele quem revela o que o texto esconde.\n\n' +
        'Três formas organizam o gênero: **estrófica** (a mesma música em todas as estrofes), **estrófica variada** (com modificações) e **durchkomponiert** (música contínua, sem repetição, acompanhando o poema verso a verso).\n\n' +
        'E o **ciclo de canções** — várias canções ligadas por uma narrativa ou um percurso emocional — cria, na escala de uma sala de estar, uma forma longa equivalente à da sinfonia.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc16_coral',
      markdown:
        '## Música coral\n\n' +
        'O século XIX é o momento em que o **canto coral amador** se espalha: sociedades corais, orfeões, coros de igreja e de fábrica.\n\n' +
        'Isso tem uma consequência musical direta: existe um público enorme que **canta**, e não apenas ouve. Escreve-se muito para coro, e escreve-se em nível executável por amadores dedicados.\n\n' +
        'Paralelamente, os grandes gêneros sacros — missa, réquiem, oratório — continuam sendo cultivados, mas cada vez mais como **obras de concerto**, não litúrgicas. Um réquiem do século XIX é feito para a sala, não para o funeral.\n\n' +
        'E é nesse século que nasce o **repertório histórico**: obras do passado voltam a ser executadas regularmente. Pela primeira vez, uma cultura musical vive tanto de música nova quanto de música antiga — situação que hoje parece óbvia e que, até então, não existia.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc16_check',
      question: 'Qual é o papel do piano no Lied romântico?',
      options: [
        'Apenas dar a nota e sustentar a harmonia',
        'Ser um segundo personagem que comenta, antecipa e às vezes contradiz o texto',
        'Substituir a orquestra por economia',
        'Dobrar a linha vocal',
      ],
      correctIndex: 1,
      explanation:
        'O piano não acompanha: participa. Ele desenha a cena, antecipa, e frequentemente revela o que a voz não diz.',
    },
  ],

  17: [
    {
      kind: 'MARKDOWN',
      id: 'oc17_intro',
      markdown:
        'A música instrumental do século XIX vive uma tensão permanente: as formas herdadas do classicismo continuam sendo o padrão de seriedade, mas a estética romântica pede liberdade, fragmento e expressão imediata.\n\n' +
        'Dessa tensão saem soluções opostas, e a discussão sobre qual delas é legítima domina a crítica do período.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc17_piano',
      markdown:
        '## O piano e a peça característica\n\n' +
        'O piano é o instrumento do século: presente em toda casa burguesa, capaz de tocar sozinho uma textura completa, e objeto de uma indústria que o aperfeiçoa continuamente — quadro de ferro, cordas mais tensas, escape duplo, extensão ampliada.\n\n' +
        'Para ele desenvolve-se a **peça característica**: curta, de caráter definido, frequentemente com título evocativo. Noturno, impromptu, momento musical, balada, estudo, intermezzo.\n\n' +
        'É a forma romântica por excelência, e por um motivo preciso: ela dispensa a arquitetura de longo prazo. Captura **um** estado, **uma** imagem, e termina. É o fragmento assumido como forma.\n\n' +
        'O **estudo** merece nota à parte: nasce como exercício técnico e vira gênero de concerto, em que dificuldade mecânica e conteúdo poético deixam de se opor.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc17_programa',
      markdown:
        '## Música de programa e poema sinfônico\n\n' +
        'A outra solução para a forma longa: se o plano tonal clássico já não basta, que a **narrativa** dê forma à peça.\n\n' +
        'A **sinfonia programática** mantém os movimentos mas os liga a um enredo, frequentemente com um tema recorrente que representa uma personagem ou ideia e se transforma ao longo da obra.\n\n' +
        'O **poema sinfônico** vai além: abandona a divisão em movimentos e constrói uma peça única, de forma livre, organizada pela transformação contínua de poucos temas.\n\n' +
        'Contra isso ergue-se a defesa da **música absoluta**: a música não representa nada além dela mesma, e submetê-la a um enredo é rebaixá-la. A sinfonia e a música de câmara continuam sendo cultivadas por quem sustenta essa posição, com rigor formal deliberado.\n\n' +
        'A polêmica foi áspera, pública e durou décadas. Vista hoje, ela é menos sobre técnica do que sobre **o que a música é** — e nenhum dos dois campos conseguiu provar seu ponto.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc17_orquestra',
      markdown:
        '## A orquestra cresce\n\n' +
        'Ao longo do século a orquestra praticamente dobra de tamanho. As madeiras chegam a três ou quatro de cada; os metais ganham **válvulas**, o que os torna cromáticos e os libera do papel de reforço harmônico; a percussão se diversifica; a harpa se incorpora.\n\n' +
        'A válvula é a mudança técnica mais consequente: antes dela, trompas e trompetes só dispunham dos sons da série harmônica de sua afinação. Com ela, podem tocar qualquer nota — e passam a ter melodia.\n\n' +
        'A **orquestração** torna-se, então, disciplina autônoma. Escolher o timbre deixa de ser detalhe de realização e passa a ser decisão composicional, com tratados dedicados ao assunto.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc17_check',
      question: 'Por que a peça característica é a forma romântica por excelência?',
      options: [
        'Porque é fácil de tocar',
        'Porque dispensa arquitetura de longo prazo e captura um único estado ou imagem',
        'Porque usa orquestra grande',
        'Porque segue a forma sonata rigorosamente',
      ],
      correctIndex: 1,
      explanation:
        'Ela assume o fragmento como forma: registra um caráter definido e termina, sem precisar do plano tonal extenso que o classicismo exigia.',
    },
  ],

  18: [
    {
      kind: 'MARKDOWN',
      id: 'oc18_intro',
      markdown:
        'A ópera do século XIX é o gênero de maior alcance público da música. Em muitas cidades, é o principal acontecimento cultural — e, em alguns países, também político.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc18_franca',
      markdown:
        '## França\n\n' +
        'Paris desenvolve a **grand opéra**: cinco atos, assunto histórico, coros massivos, balé obrigatório, cenografia espetacular e efeitos de maquinaria. É espetáculo total, produzido em escala industrial para um público burguês numeroso.\n\n' +
        'Ao lado dela, a **ópera cômica** mantém diálogo falado entre os números e assunto contemporâneo, e a **ópera lírica** ocupa um meio-termo, mais intimista, com assunto sentimental.\n\n' +
        'A convenção do balé obrigatório parece detalhe e não é: influenciou o formato de obras escritas para Paris por compositores estrangeiros, que tinham de acomodá-lo.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc18_italia',
      markdown:
        '## Itália e Verdi\n\n' +
        'A tradição italiana permanece centrada na **voz**. O *bel canto* da primeira metade do século cultiva a linha melódica longa, o legato e a agilidade, com estruturas convencionais de cena bem definidas: uma seção lenta e reflexiva seguida de uma rápida e resolutiva.\n\n' +
        'A trajetória de Verdi atravessa o século inteiro e mostra uma transformação contínua:\n\n' +
        '**Início** — energia rítmica direta, melodias de grande apelo, assuntos com ressonância patriótica num país em processo de unificação.\n\n' +
        '**Maturidade** — construção dramática mais firme, personagens de psicologia complexa, e a estrutura convencional de números começando a se dissolver em cenas contínuas.\n\n' +
        '**Últimas obras** — orquestra tratada com sutileza, declamação flexível, e continuidade quase total. A convenção da ária separada praticamente desaparece, sem que a centralidade da voz se perca.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc18_wagner',
      markdown:
        '## Wagner e o drama musical\n\n' +
        'A reforma mais radical, e a mais teorizada — Wagner escreveu volumes explicando o que pretendia.\n\n' +
        'Os princípios:\n\n' +
        '**Obra de arte total** — música, poesia, cena e gesto concebidos juntos, pelo mesmo autor.\n\n' +
        '**Fim dos números fechados** — nada de árias separadas por recitativos; a música flui continuamente, sem pontos de aplauso.\n\n' +
        '**Leitmotiv** — temas breves associados a personagens, objetos e ideias, que retornam transformados. Eles fazem o que o narrador faria num romance: lembram, antecipam, comentam e revelam o que as personagens não dizem.\n\n' +
        '**Melodia contínua** — a linha vocal não se organiza em frases quadradas; segue o texto, enquanto a orquestra sustenta a estrutura.\n\n' +
        'A consequência técnica de maior alcance está na **harmonia**. A busca de continuidade levou a evitar sistematicamente a cadência resolutiva — resolver é parar, e a obra não pode parar. O resultado é uma harmonia em suspensão permanente, cromática, que adia a resolução por longos trechos.\n\n' +
        'É desse adiamento que sairá, em poucas décadas, a dissolução da tonalidade.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc18_check',
      question: 'Como a busca de continuidade dramática afetou a harmonia de Wagner?',
      options: [
        'Tornou-a mais simples e diatônica',
        'Levou a evitar a cadência resolutiva, produzindo suspensão cromática prolongada',
        'Eliminou a orquestra',
        'Restaurou os modos medievais',
      ],
      correctIndex: 1,
      explanation:
        'Resolver a harmonia é criar um ponto de repouso — e repouso interrompe o fluxo. Adiar a resolução manteve a continuidade e, no caminho, afrouxou a tonalidade.',
    },
  ],

  19: [
    {
      kind: 'MARKDOWN',
      id: 'oc19_intro',
      markdown:
        'As últimas décadas do século XIX e os anos até a Primeira Guerra são um período de máxima ampliação e de tensão crescente. Tudo cresce — orquestra, duração, cromatismo — e, ao mesmo tempo, tudo começa a rachar.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc19_posromantismo',
      markdown:
        '## Pós-romantismo\n\n' +
        'A herança romântica é levada ao extremo. Sinfonias de mais de uma hora, orquestras de centenas de executantes, coros e solistas dentro de obras sinfônicas, e harmonia tão cromática que a tonalidade só se sustenta por momentos.\n\n' +
        'A sinfonia pós-romântica frequentemente pretende ser um **mundo**: abarcar o trivial e o sublime, a marcha militar e o canto de ninar, a ironia e o luto, tudo na mesma obra. É ambição de totalidade.\n\n' +
        'E há, subjacente, a consciência de que se trata de um fim. Muito desse repertório é escrito como despedida — e foi ouvido assim.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc19_nacionalismo',
      markdown:
        '## Nacionalismos\n\n' +
        'Fora dos centros tradicionais — na Rússia, na Boêmia, na Escandinávia, na Espanha, e mais tarde nas Américas —, compositores buscam uma linguagem própria, apoiada no material musical local.\n\n' +
        'As fontes são a **canção camponesa**, as **danças tradicionais**, os **modos** não tonais presentes nesses repertórios, e assuntos tirados da história e da lenda nacionais.\n\n' +
        'O ponto de interesse técnico é este: o material tradicional frequentemente **não é tonal**. Usa modos, escalas de outras estruturas, métricas irregulares. Incorporá-lo obriga a afrouxar a harmonia funcional — e o nacionalismo acaba sendo, sem pretendê-lo, uma das forças que corroem a tonalidade por dentro.\n\n' +
        'É preciso distinguir, porém, o uso decorativo do uso estrutural. Citar uma melodia folclórica e harmonizá-la à maneira alemã é uma coisa; deixar que a estrutura do material redefina a linguagem é outra, bem mais consequente.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc19_franca',
      markdown:
        '## Novas correntes em França\n\n' +
        'A resposta francesa à hegemonia germânica foi tomar caminho oposto: em vez de intensificar, **atenuar**.\n\n' +
        'As características são reconhecíveis: acordes usados por sua **cor** e não por sua função; sétimas e nonas não resolvidas, tratadas como sonoridades estáveis; escalas de tons inteiros e modais; forma fluida, sem desenvolvimento no sentido germânico; e uma atenção ao timbre que se torna, ela própria, elemento estrutural.\n\n' +
        'O rótulo "impressionismo" foi emprestado da pintura e não agradou aos compositores. A analogia funciona num ponto: a preferência pela sensação sobre a narrativa, pelo instante sobre o percurso.\n\n' +
        'É a primeira linguagem que trata a **harmonia como cor**, e nisso ela abre caminho para boa parte do século XX, do jazz à música de cinema.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'oc19_audio',
      title: 'Escala de tons inteiros',
      description:
        'Sem semitom, sem sensível, sem direção obrigatória. A harmonia flutua em vez de caminhar.',
      notes: ['C4', 'D4', 'E4', 'F#4', 'G#4', 'A#4', 'C5'],
      playMode: 'SEQUENCE',
      bpm: 80,
    },
    {
      kind: 'MARKDOWN',
      id: 'oc19_verismo',
      markdown:
        '## Verismo\n\n' +
        'Na ópera italiana, a virada é de assunto: em vez de reis, mitos e heroínas históricas, **gente comum** em situações violentas e cotidianas. Camponeses, operários, ciúme, faca.\n\n' +
        'Musicalmente, isso implica declamação mais próxima da fala, orquestra que sublinha a ação, e melodia de apelo imediato e curva expressiva intensa.\n\n' +
        'O verismo é também o momento em que a ópera italiana absorve, à sua maneira, a continuidade wagneriana — sem abrir mão do primado da voz e da melodia reconhecível.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc19_check',
      question: 'Por que o nacionalismo musical contribuiu para afrouxar a tonalidade?',
      options: [
        'Porque rejeitava a música alemã por motivo político',
        'Porque o material tradicional usa modos e estruturas que a harmonia funcional não acomoda',
        'Porque preferia instrumentos folclóricos',
        'Porque evitava o uso de orquestra',
      ],
      correctIndex: 1,
      explanation:
        'Incorporar estruturalmente material modal e de métrica irregular obriga a relaxar a harmonia funcional — efeito colateral, não programa.',
    },
  ],

  20: [
    {
      kind: 'MARKDOWN',
      id: 'oc20_intro',
      markdown:
        'O século XX não tem um estilo. Tem correntes simultâneas, frequentemente incompatíveis, e nenhuma delas se torna a linguagem comum que a tonalidade havia sido por trezentos anos.\n\n' +
        'Essa é a característica definidora do período: pela primeira vez desde a Idade Média, **não existe um sistema partilhado**. Cada compositor precisa escolher ou construir a sua linguagem, e justificar a escolha.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc20_ruptura',
      markdown:
        '## A dissolução da tonalidade\n\n' +
        'Não foi decisão de um autor: foi processo. O cromatismo crescente, o adiamento sistemático da resolução e a harmonia usada como cor levaram, cada um por seu caminho, ao ponto em que o centro tonal deixou de ser perceptível.\n\n' +
        'A **atonalidade livre** é o primeiro estágio: escreve-se evitando deliberadamente qualquer nota que se imponha como centro. Funciona bem em peças curtas e muito expressivas — e revela um problema sério nas longas. Sem tonalidade, **o que dá forma a uma peça extensa?** Era a mesma pergunta do capítulo VII, quinhentos anos depois.\n\n' +
        'O **método dodecafônico** é a resposta construída: as doze notas são ordenadas numa série, e a série — com suas transposições, inversão, retrógrado e inversão do retrógrado — fornece todo o material. Nenhuma nota se repete antes que as outras onze soem, o que impede qualquer uma de virar centro.\n\n' +
        'É um sistema que substitui a hierarquia tonal por uma regra de igualdade. Depois da guerra, o princípio será estendido também ao ritmo, à dinâmica e ao timbre — o serialismo integral.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc20_neoclassicismo',
      markdown:
        '## Neoclassicismo e Stravinsky\n\n' +
        'Caminho oposto: em vez de romper, **retomar** — formas, gêneros e procedimentos anteriores ao romantismo, tratados com linguagem moderna.\n\n' +
        'Não é restauração. É uso deliberado do passado como material, com distanciamento: a forma antiga aparece, e aparece **torta** — harmonia deslocada, métrica irregular, instrumentação seca.\n\n' +
        'A trajetória de Stravinsky é a mais instrutiva do século porque atravessa quase todas as correntes. Começa no nacionalismo russo, com obras de violência rítmica sem precedente — métrica em deslocamento constante, acordes sobrepostos, percussão como protagonista. Passa décadas no neoclassicismo. E, já velho, adota o serialismo que combatera.\n\n' +
        'Essas mudanças foram lidas como incoerência. São, mais provavelmente, o retrato de um século em que nenhuma linguagem era óbvia.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc20_oral',
      markdown:
        '## O peso das tradições orais\n\n' +
        'Duas forças vindas de fora da tradição erudita reconfiguram a música do século.\n\n' +
        'A **etnomusicologia** — a coleta sistemática de música camponesa com registro sonoro — revela estruturas que a notação ocidental não previa: métricas aditivas, escalas de outras construções, heterofonia. Compositores que fizeram esse trabalho de campo integraram tais estruturas de modo profundo, e não decorativo.\n\n' +
        'O **jazz** e a música afro-americana trazem outra concepção de ritmo, de timbre, de improvisação e de afinação expressiva. Sua influência sobre a música de concerto europeia é imediata e permanente.\n\n' +
        'O que ambas as forças têm em comum é virem de tradições **orais** — e mostrarem que a notação, que a Europa tomava por condição da música complexa, não é condição de nada.',
    },
    {
      kind: 'MARKDOWN',
      id: 'oc20_pos',
      markdown:
        '## Depois da guerra\n\n' +
        'A partir de 1945 as direções se multiplicam.\n\n' +
        '**Serialismo integral** — estender a organização serial a todos os parâmetros, buscando controle total.\n\n' +
        '**Indeterminação e acaso** — o oposto exato: deixar decisões ao intérprete ou ao sorteio, questionando a própria ideia de obra fixa.\n\n' +
        '**Música eletroacústica** — som gravado e som gerado eletronicamente. Pela primeira vez, o compositor trabalha diretamente com o som, sem intermediário — e sem notação.\n\n' +
        '**Textura e massa** — abandonar a nota individual e compor com nuvens sonoras, densidades e glissandos de conjunto.\n\n' +
        '**Minimalismo** — repetição de padrões breves com transformação gradual, e retorno a uma harmonia consonante e estável.\n\n' +
        'Que essas direções coexistam, se contradigam e continuem produtivas é o estado em que a música chega ao fim do século — e permanece.',
    },
    {
      kind: 'CALLOUT',
      id: 'oc20_call',
      type: 'info',
      title: 'Onde isto deixa você',
      text:
        'Vinte capítulos, do fim do mundo antigo ao fim do século XX. O fio não é a lista de compositores: é a sucessão de problemas — como escrever o ritmo, como combinar vozes, como dar forma a uma peça sem texto, o que fazer quando a tonalidade deixa de organizar. Cada solução criou o problema seguinte, e é isso que faz disto uma história, e não um catálogo.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'oc20_check',
      question: 'Que problema a atonalidade livre revelou, e que o dodecafonismo tentou resolver?',
      options: [
        'A dificuldade de afinar instrumentos',
        'A falta de um princípio de forma para peças extensas sem centro tonal',
        'A impossibilidade de notar as alturas',
        'A resistência do público',
      ],
      correctIndex: 1,
      explanation:
        'Sem tonalidade, desaparece o plano que dava direção a obras longas. A série fornece um princípio de organização que substitui essa função.',
    },
  ],
};
