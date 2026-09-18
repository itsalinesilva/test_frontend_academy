import { LessonBlock } from '../../domain/academy';

/**
 * História da Música Brasileira — capítulos 1 a 9.
 *
 * Das matrizes formadoras ao projeto modernista. Texto autoral; nenhuma obra
 * de referência é citada.
 */
export const BLOCOS_BR_01_09: Record<number, LessonBlock[]> = {
  1: [
    {
      kind: 'MARKDOWN',
      id: 'br01_intro',
      markdown:
        'Toda história da música brasileira começa pelas três matrizes — indígena, africana e ibérica. A fórmula é verdadeira e é insuficiente, e convém ver por quê antes de usá-la.\n\n' +
        'Ela sugere três blocos homogêneos que se somam em proporções fixas. Nada disso corresponde ao que houve. Não existe "a" música indígena: existem centenas de povos com sistemas musicais distintos. Não existe "a" música africana: os escravizados vieram de regiões vastas e culturalmente diversas, com práticas que não se confundiam entre si. E a matriz ibérica chegou junto com influências italianas, francesas e, mais tarde, alemãs.\n\n' +
        'A fórmula serve como ponto de partida. Não como explicação.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br01_indigena',
      markdown:
        '## A matriz indígena\n\n' +
        'É a menos presente no repertório resultante, e é importante entender por que — a resposta não é "porque contribuiu pouco".\n\n' +
        'Os sistemas musicais indígenas são estruturalmente distantes do europeu: escalas de outra construção, formas ligadas ao ritual e à função, canto frequentemente coletivo e responsorial, uso de flautas, maracás e instrumentos de percussão com significado cerimonial preciso.\n\n' +
        'O que impediu a incorporação não foi incompatibilidade musical: foi o **extermínio e a desestruturação** das sociedades que a praticavam. A música desaparece quando desaparece a comunidade que a canta.\n\n' +
        'O que restou na música brasileira corrente são elementos pontuais — alguns instrumentos, alguns nomes, algumas melodias recolhidas tardiamente e já transformadas. A historiografia mais antiga registrou essa presença reduzida como se fosse falta de vigor da matriz. É leitura que inverte causa e efeito.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br01_africana',
      markdown:
        '## A matriz africana\n\n' +
        'Costuma-se resumir: a contribuição africana foi **rítmica**. É verdade, e é pouco.\n\n' +
        'O que veio da África e se tornou estrutural na música brasileira:\n\n' +
        '**Ritmo** — a síncope generalizada, a divisão que não coincide com o tempo forte, a sobreposição de padrões rítmicos distintos, e a organização por um padrão-guia recorrente. Não é ornamento sobre uma base europeia: é outro modo de organizar o tempo.\n\n' +
        '**Forma responsorial** — o solista propõe, o coro responde. É a estrutura do samba de roda, do jongo, das rodas de capoeira, do maracatu, e chega intacta ao samba urbano e ao partido-alto.\n\n' +
        '**Percussão** — uma família inteira de instrumentos, com técnica e função próprias, e a concepção do tambor como instrumento de fala.\n\n' +
        '**Função** — música ligada ao trabalho, ao culto e à celebração coletiva, e não ao concerto silencioso.\n\n' +
        'Reduzir tudo isso a "ritmo" é o resumo de quem ouve com ouvido europeu e só percebe o que difere da sua própria métrica.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br01_iberica',
      markdown:
        '## A matriz ibérica\n\n' +
        'A mais completa em termos de sistema, porque veio com **instituições**: igreja, escola, notação, imprensa.\n\n' +
        'O que ela fixou:\n\n' +
        '**A tonalidade** — o sistema de maior e menor, as funções harmônicas, a cadência. É a gramática sobre a qual quase toda a música brasileira posterior opera.\n\n' +
        '**A estrutura estrófica** — estrofe e refrão, quadratura de frase, forma fechada.\n\n' +
        '**Os instrumentos de corda** — viola, cavaquinho, violão, rabeca; e os de sopro e teclado da tradição erudita.\n\n' +
        '**Os gêneros** — modinha, fado, romance, e a estrutura da música religiosa.\n\n' +
        'Há um ponto de convergência notável: a **síncope** existe tanto na tradição ibérica quanto na africana. É provável que sua predominância na música brasileira venha desse encontro, e não de uma origem única — o que é um bom exemplo de como as matrizes não se somaram, mas se reforçaram em pontos específicos.',
    },
    {
      kind: 'CALLOUT',
      id: 'br01_call',
      type: 'warning',
      title: 'Cuidado com a fórmula das três raças',
      text:
        'A ideia de que o brasileiro resulta da fusão harmoniosa de três contribuições foi formulada num contexto em que servia para afirmar identidade nacional e, ao mesmo tempo, para dissolver o conflito. Ela descreve mal a violência do processo e apaga que a "fusão" se deu sob escravidão e extermínio. Use a fórmula como atalho descritivo, com consciência do que ela esconde.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br01_check',
      question: 'Por que a matriz indígena tem presença reduzida no repertório brasileiro corrente?',
      options: [
        'Porque era musicalmente simples',
        'Porque as sociedades que a praticavam foram exterminadas e desestruturadas',
        'Porque não usava instrumentos',
        'Porque foi proibida por lei',
      ],
      correctIndex: 1,
      explanation:
        'A música desaparece com a comunidade que a sustenta. A presença reduzida é efeito da destruição dessas sociedades, não de fraqueza da matriz.',
    },
  ],

  2: [
    {
      kind: 'MARKDOWN',
      id: 'br02_intro',
      markdown:
        'Desde o século XVI, os missionários perceberam que a música era o instrumento mais eficaz de catequese. E usaram-na de um modo que merece ser examinado com atenção.\n\n' +
        'A estratégia não foi impor o canto europeu: foi **tomar as melodias indígenas e substituir-lhes o texto** por letras cristãs em língua indígena. Chegou-se a preterir o cantochão em favor dessas melodias, porque elas funcionavam melhor.\n\n' +
        'É uma decisão pragmática e reveladora: reconhece-se o valor e a força da música do outro, e usa-se essa força contra a cultura que a produziu.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br02_autos',
      markdown:
        '## Autos, procissões e o teatro devocional\n\n' +
        'A catequese usou o **auto** — peça teatral devocional com música, dança e canto, herdada da tradição ibérica medieval. Encenavam-se episódios bíblicos com participação de indígenas, em língua indígena, com instrumentos europeus e locais.\n\n' +
        'As **procissões** cumpriam função parecida no espaço urbano: música, cortejo, representação, e integração da população ao calendário religioso.\n\n' +
        'Dessa prática nasce uma característica que atravessará toda a música brasileira: a **fronteira porosa entre celebração religiosa e festa popular**. O calendário católico organiza as festas; as festas absorvem elementos africanos e indígenas; e o resultado não é nem uma coisa nem outra. Congadas, folias de reis, maracatus e o próprio carnaval descendem dessa combinação.',
    },
    {
      kind: 'CALLOUT',
      id: 'br02_call',
      type: 'warning',
      title: 'As fontes são de quem escreveu',
      text:
        'Tudo o que sabemos sobre a música indígena do período vem de cartas e crônicas de missionários e viajantes europeus. São observadores com objetivo declarado de conversão, sem formação para descrever sistemas musicais diferentes do seu, escrevendo em vocabulário que não servia ao que ouviam. Ler essas fontes exige desconto permanente.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br02_check',
      question: 'Qual foi a estratégia musical central da catequese jesuítica?',
      options: [
        'Impor o cantochão romano em latim',
        'Manter as melodias indígenas e substituir-lhes o texto por conteúdo cristão',
        'Proibir a música indígena',
        'Ensinar notação europeia antes de tudo',
      ],
      correctIndex: 1,
      explanation:
        'Aproveitou-se a força das melodias já conhecidas, trocando apenas a letra — chegando a preterir o cantochão porque este funcionava menos bem.',
    },
  ],

  3: [
    {
      kind: 'MARKDOWN',
      id: 'br03_intro',
      markdown:
        'O ouro das Minas Gerais, no século XVIII, produziu a primeira vida musical brasileira de alta densidade: dezenas de compositores, orquestras regulares, repertório sacro extenso e um sistema de encomenda que funcionava.\n\n' +
        'O centro dessa vida não era a catedral nem a corte: eram as **irmandades religiosas**, associações de leigos que organizavam o culto, financiavam as festas e contratavam os músicos.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br03_irmandades',
      markdown:
        '## Como funcionava\n\n' +
        'As irmandades eram organizadas por condição social e por cor — havia irmandades de brancos, de pardos, de pretos —, e competiam entre si na pompa de suas festas. Música boa era questão de prestígio corporativo.\n\n' +
        'Essa competição gerou demanda constante e remunerada. Formaram-se conjuntos estáveis, com cordas, sopros e órgão, e um circuito profissional.\n\n' +
        'E aqui está o fato social decisivo: **a maioria desses músicos era mulata**. A música era uma das poucas atividades em que um homem livre de cor podia adquirir qualificação, ganhar a vida e obter reconhecimento público.\n\n' +
        'Isso não significa ascensão social plena — as restrições permaneciam, e o ofício tinha estatuto ambíguo, entre o trabalho manual e a arte. Mas significa que o repertório sacro mineiro, que é a primeira grande produção musical brasileira, foi obra sobretudo de compositores negros e mestiços.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br03_repertorio',
      markdown:
        '## O repertório\n\n' +
        'É música **sacra**, funcional, escrita para as festas do calendário: missas, novenas, ofícios de Semana Santa, ladainhas, motetos.\n\n' +
        'A linguagem é a do classicismo europeu de meados do século XVIII — harmonia funcional clara, frase periódica, orquestra de cordas com dois sopros, escrita vocal a quatro vozes. Chegou por meio de partituras importadas e de tratados, e foi absorvida com competência.\n\n' +
        'A pergunta que se costuma fazer é se há "brasilidade" nessa música. A resposta honesta é que não, não no sentido de traços folclóricos audíveis — e que isso não a torna menos brasileira. Ela foi escrita aqui, por brasileiros, para instituições brasileiras, dentro das condições materiais daqui. Exigir sotaque folclórico de uma música sacra do século XVIII é aplicar-lhe um critério inventado cento e cinquenta anos depois.\n\n' +
        'Boa parte desse repertório permaneceu esquecida em arquivos de irmandades até o século XX, e sua recuperação ainda está em curso.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br03_check',
      question: 'Quem organizava e financiava a vida musical nas Minas do século XVIII?',
      options: [
        'A corte portuguesa',
        'As irmandades religiosas de leigos',
        'Os bispos, diretamente',
        'Empresários de teatro',
      ],
      correctIndex: 1,
      explanation:
        'As irmandades contratavam os músicos e competiam entre si na pompa das festas, o que sustentou um circuito profissional estável.',
    },
  ],

  4: [
    {
      kind: 'MARKDOWN',
      id: 'br04_intro',
      markdown:
        'Em 1808 a corte portuguesa transfere-se para o Rio de Janeiro, fugindo da invasão napoleônica. Para a música brasileira, é a mudança institucional mais brusca de toda a sua história.\n\n' +
        'Da noite para o dia, uma cidade colonial passa a ser sede de um império. Chegam a Capela Real com seu efetivo, uma biblioteca musical, instrumentos, cantores contratados na Europa, e verba régia para tudo isso.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br04_jose_mauricio',
      markdown:
        '## José Maurício Nunes Garcia\n\n' +
        'Padre, mulato, filho de mãe parda, formado no circuito das irmandades cariocas, era o principal músico da cidade quando a corte chegou. Foi nomeado mestre de capela.\n\n' +
        'Sua obra é extensa — missas, ofícios de defuntos, motetos, obras instrumentais — e tecnicamente sólida, na linguagem do classicismo vienense que dominava então. Reagiu com rapidez ao repertório que chegava com a corte, incorporando-o.\n\n' +
        'Sua trajetória, porém, revela os limites do ambiente. Quando chegou ao Rio um mestre de capela português, José Maurício foi progressivamente afastado das funções mais prestigiosas. A cor e a origem pesaram, num ambiente de corte que reproduzia as hierarquias da metrópole.\n\n' +
        'É o mesmo padrão do capítulo anterior, agora sob luz mais forte: o músico negro tem espaço enquanto é indispensável, e o perde quando aparece um substituto europeu.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br04_italiana',
      markdown:
        '## A virada italiana\n\n' +
        'A partir da década de 1820, e sobretudo sob Pedro I e Pedro II, a **ópera italiana** torna-se o gosto dominante. Companhias italianas se instalam, cantores são contratados, teatros são construídos.\n\n' +
        'A consequência é dupla. De um lado, o Rio de Janeiro passa a ter vida operística regular e de bom nível, com repertório atualizado. De outro, a música sacra e instrumental perde espaço e financiamento, e o modelo italiano se torna o único caminho de prestígio para um compositor brasileiro.\n\n' +
        'Quem quisesse ser levado a sério tinha de escrever ópera, em italiano, no estilo italiano. Essa exigência define o capítulo seguinte.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br04_check',
      question: 'O que a chegada da corte em 1808 mudou institucionalmente?',
      options: [
        'Introduziu a música africana no Rio',
        'Instalou a Capela Real, com efetivo, acervo e verba régia, numa cidade colonial',
        'Proibiu a música das irmandades',
        'Criou o primeiro conservatório do país',
      ],
      correctIndex: 1,
      explanation:
        'A transferência trouxe de uma vez estrutura, repertório e financiamento de uma capela de corte europeia para o Rio de Janeiro.',
    },
  ],

  5: [
    {
      kind: 'MARKDOWN',
      id: 'br05_intro',
      markdown:
        'O Segundo Reinado é o período em que o Brasil tenta ter uma música erudita à altura das nações europeias — e o critério de sucesso, naquele momento, era um só: ser reconhecido na Itália.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br05_gomes',
      markdown:
        '## Carlos Gomes\n\n' +
        'Formado no interior paulista, levado ao Rio, e enviado à Europa com bolsa imperial, tornou-se o único compositor brasileiro do século XIX com carreira internacional plena. Suas óperas estrearam nos grandes teatros italianos e foram levadas pelo mundo.\n\n' +
        'Sua linguagem é integralmente italiana do período — a estrutura de cena, o tratamento vocal, a orquestração, tudo. O que é "brasileiro" nele é o **assunto**: enredos ambientados no Brasil, com personagens indígenas.\n\n' +
        'Aí está a questão que o curso precisa enfrentar de frente.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br05_questao',
      markdown:
        '## O que torna uma obra "nacional"?\n\n' +
        'Três respostas possíveis, e nenhuma é neutra.\n\n' +
        '**O assunto** — se a ópera trata de tema brasileiro, é brasileira. Por esse critério, Carlos Gomes é plenamente nacional. O problema é que o indígena que aparece nessas obras é uma construção literária romântica europeia, tão distante do indígena real quanto o pastor da ópera barroca estava do camponês.\n\n' +
        '**A linguagem musical** — só é nacional a música que usa material folclórico brasileiro. Por esse critério, Carlos Gomes não é nacional. Mas o critério só foi formulado depois dele, pelo modernismo, e aplicá-lo retroativamente é anacronismo.\n\n' +
        '**A origem e a circunstância** — é brasileira a música feita por brasileiros, nas condições daqui. É o critério mais largo e o menos exigente.\n\n' +
        'A discussão não tem solução técnica, porque não é técnica. Ela reaparecerá em cada capítulo seguinte, sempre com outra roupa — e o que muda a cada vez é quem tem poder de definir o critério.',
    },
    {
      kind: 'CALLOUT',
      id: 'br05_call',
      type: 'info',
      title: 'O indianismo não é etnografia',
      text:
        'O indígena do romantismo brasileiro — na literatura e na ópera — é um símbolo de nobreza originária, construído para dar ao país um passado heroico próprio, equivalente ao medieval europeu. Não descreve povos indígenas reais nem sua música. É um projeto de identidade nacional, e deve ser lido como tal.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br05_check',
      question: 'Por que é anacrônico exigir material folclórico brasileiro de Carlos Gomes?',
      options: [
        'Porque ele não conhecia música folclórica',
        'Porque esse critério de nacionalidade só foi formulado depois, pelo modernismo',
        'Porque a Itália proibia',
        'Porque não havia folclore no Brasil',
      ],
      correctIndex: 1,
      explanation:
        'O critério que define música nacional pelo uso de material folclórico é uma construção do século XX. Aplicá-lo ao século XIX é julgar com régua que ainda não existia.',
    },
  ],

  6: [
    {
      kind: 'MARKDOWN',
      id: 'br06_intro',
      markdown:
        'Enquanto a elite ouvia ópera italiana, formava-se nas casas e nas ruas das cidades brasileiras a primeira música popular urbana do país. Dois gêneros a fundam, e sua relação é reveladora.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br06_modinha',
      markdown:
        '## A modinha\n\n' +
        'Canção sentimental, de melodia expressiva, acompanhada por viola, violão ou piano. Herda estrutura da canção de salão portuguesa e absorve o gosto melódico italiano.\n\n' +
        'Seu traço mais interessante é a **circulação dupla**. A modinha era cantada nos salões da elite, com acompanhamento de piano e texto refinado; e era cantada na rua, com viola, em versão mais simples e assunto mais direto. As duas versões se alimentavam.\n\n' +
        'Esse trânsito entre salão e rua, e entre o escrito e o transmitido de ouvido, será uma constante da música brasileira. Aqui ele aparece pela primeira vez com clareza.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br06_lundu',
      markdown:
        '## O lundu\n\n' +
        'De origem africana, dançado, sincopado, com texto frequentemente cômico ou malicioso.\n\n' +
        'Foi o **primeiro gênero de origem africana a ser aceito** — com reservas — nos ambientes brancos. Sua sátira e sua sensualidade escandalizavam e atraíam ao mesmo tempo, e ele circulou em partitura impressa, em teatro musicado e em salão.\n\n' +
        'É por meio do lundu que a síncope africana entra no repertório escrito brasileiro. Essa entrada é o acontecimento técnico mais consequente da música popular do século XIX.\n\n' +
        'Modinha e lundu eram frequentemente apresentados juntos, pelos mesmos intérpretes: a modinha para comover, o lundu para divertir. E, no cruzamento dos dois, forma-se a matriz da canção brasileira — melodia de apelo sentimental sobre base rítmica sincopada.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'br06_audio',
      title: 'A síncope característica',
      description:
        'O ataque fora do tempo forte, prolongando-se sobre ele. É esta célula que atravessa lundu, maxixe, choro e samba.',
      notes: ['C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'G4', 'C5'],
      playMode: 'SEQUENCE',
      bpm: 120,
    },
    {
      kind: 'CHECKPOINT',
      id: 'br06_check',
      question: 'Qual a importância técnica do lundu?',
      options: [
        'Introduziu o piano no Brasil',
        'Foi a via pela qual a síncope de origem africana entrou no repertório escrito',
        'Trouxe a ópera para a rua',
        'Criou a notação brasileira',
      ],
      correctIndex: 1,
      explanation:
        'Sendo aceito e impresso em ambientes brancos, o lundu levou a síncope africana para a partitura — e dela para todos os gêneros urbanos seguintes.',
    },
  ],

  7: [
    {
      kind: 'MARKDOWN',
      id: 'br07_intro',
      markdown:
        'O choro nasce no Rio de Janeiro do fim do século XIX, e é a primeira **linguagem instrumental** propriamente brasileira.\n\n' +
        'Sua origem é um processo, não uma invenção: músicos — muitos deles funcionários públicos modestos, mulatos, tocando por gosto depois do expediente — pegaram as danças europeias da moda e tocaram-nas do jeito daqui.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br07_formacao',
      markdown:
        '## O que entrou na receita\n\n' +
        'A **polca**, dança de salão europeia, chegou ao Brasil em meados do século e fez enorme sucesso. É a base rítmica e formal do choro.\n\n' +
        'A **habanera** trouxe a célula rítmica de origem caribenha, ela própria de raiz africana.\n\n' +
        'A **valsa** e a **schottisch** contribuíram com o repertório e com as formas.\n\n' +
        'E o **lundu** forneceu a síncope.\n\n' +
        'O que resultou não é nenhuma dessas coisas. A polca tocada com síncope brasileira, em andamento mais rápido, com a linha de baixo respondendo à melodia e o instrumento solista improvisando as passagens — isso é choro.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br07_conjunto',
      markdown:
        '## O conjunto e o modo de tocar\n\n' +
        'A formação típica tem três funções bem definidas.\n\n' +
        '**Solista** — flauta, cavaquinho, bandolim ou clarinete. Apresenta o tema e o varia.\n\n' +
        '**Centro** — o violão de seis cordas e o cavaquinho fazem a harmonia e o ritmo.\n\n' +
        '**Baixaria** — o violão de sete cordas faz uma linha grave que **responde** à melodia, com contracantos elaborados. Não é acompanhamento: é uma segunda voz com vida própria.\n\n' +
        'A baixaria é o traço técnico mais característico do gênero, e é o que aproxima o choro do contraponto.\n\n' +
        'A forma é herdada do rondó: três partes, cada uma repetida, com retorno à primeira — **AABBACCA** —, e cada parte em tonalidade diferente. É uma forma exigente, que pede domínio de modulação.\n\n' +
        'E a **improvisação** é constitutiva: o tema é ponto de partida, não texto fixo. Tocar choro é variar.',
    },
    {
      kind: 'CALLOUT',
      id: 'br07_call',
      type: 'info',
      title: 'Música de amadores profissionais',
      text:
        'Os chorões do período eram, em geral, funcionários dos Correios, da Alfândega, da Estrada de Ferro — gente de classe média baixa que tocava por gosto, em rodas domésticas, sem viver disso. O altíssimo nível técnico do gênero foi construído fora do sistema de conservatório e fora do mercado.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br07_check',
      question: 'O que é a baixaria no choro?',
      options: [
        'O acompanhamento harmônico do cavaquinho',
        'A linha grave do violão de sete cordas que responde à melodia com contracantos',
        'A parte improvisada do solista',
        'O andamento acelerado do gênero',
      ],
      correctIndex: 1,
      explanation:
        'É uma segunda voz melódica no registro grave, não um acompanhamento — e é o que dá ao choro seu caráter contrapontístico.',
    },
  ],

  8: [
    {
      kind: 'MARKDOWN',
      id: 'br08_intro',
      markdown:
        'O samba é o caso mais estudado e mais mitificado da música brasileira. Convém separar o processo histórico da narrativa que se construiu sobre ele.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br08_formacao',
      markdown:
        '## A formação\n\n' +
        'A palavra "samba" designava, no século XIX, danças de roda de origem africana praticadas no Recôncavo Baiano e em outras regiões — o samba de roda, com palmas, canto responsorial e percussão.\n\n' +
        'Com a migração baiana para o Rio de Janeiro depois da abolição, essas práticas se instalam em casas da região central da cidade, onde se reúnem músicos, praticantes de culto afro-brasileiro e trabalhadores.\n\n' +
        'O que se forma ali não é o samba de roda transplantado: é um gênero **urbano** novo, que combina a matriz rítmica e a forma responsorial com o maxixe, a marcha e a estrutura de canção com refrão.\n\n' +
        'A primeira gravação registrada como samba, em 1917, já mostra essa mistura — e sua autoria foi disputada, o que é sintomático de uma criação que era coletiva por natureza.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br08_radio',
      markdown:
        '## O rádio e a indústria\n\n' +
        'Nos anos 1930 o rádio se torna o meio de comunicação dominante no Brasil, e a indústria fonográfica se estrutura. O samba é o gênero que ocupa esse espaço.\n\n' +
        'As consequências são técnicas e não apenas comerciais:\n\n' +
        'A **duração** se padroniza pelo tempo do disco de 78 rotações — cerca de três minutos.\n\n' +
        'A **forma** se fixa em estrofe e refrão, com introdução instrumental.\n\n' +
        'A **orquestração** se profissionaliza: entram arranjadores, metais, cordas. O samba de gravadora soa diferente do samba de roda.\n\n' +
        'E a **autoria individual** se impõe sobre a criação coletiva, porque direito autoral exige um nome. Muitos conflitos de autoria do período vêm dessa incompatibilidade entre um modo coletivo de criar e um sistema jurídico que só reconhece indivíduos.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br08_simbolo',
      markdown:
        '## A promoção a símbolo nacional\n\n' +
        'Nos anos 1930 e 1940, o samba passa de música perseguida pela polícia a símbolo oficial da nacionalidade. A mudança é rápida demais para ser espontânea.\n\n' +
        'Houve **política de Estado**: um governo empenhado em construir identidade nacional unificada encontrou no samba um símbolo eficaz, e o promoveu — com apoio, com censura seletiva de letras e com estímulo ao samba-exaltação, de tema patriótico.\n\n' +
        'Houve também **interesse da indústria**, que precisava de um produto nacional identificável.\n\n' +
        'E houve, é preciso dizer, a qualidade e a força do gênero, que não se explica só por promoção.\n\n' +
        'O resultado tem duplo efeito: o samba ganhou projeção e recursos, e ao mesmo tempo foi domesticado — depurado das letras que incomodavam, afastado de sua origem de culto, e apresentado como expressão de uma harmonia racial que o país não tinha.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br08_check',
      question: 'Por que o disco de 78 rotações afetou a forma do samba?',
      options: [
        'Porque exigia instrumentos elétricos',
        'Porque limitava a duração a cerca de três minutos, padronizando a estrutura',
        'Porque não registrava percussão',
        'Porque só permitia uma voz',
      ],
      correctIndex: 1,
      explanation:
        'O suporte impôs o tempo, e o tempo impôs a forma: introdução, estrofe e refrão dentro de três minutos.',
    },
  ],

  9: [
    {
      kind: 'MARKDOWN',
      id: 'br09_intro',
      markdown:
        'A Semana de Arte Moderna de 1922 é o marco de um programa que reorganizou a música erudita brasileira por meio século.\n\n' +
        'O diagnóstico era este: a música erudita brasileira era uma cópia atrasada da europeia, e não tinha razão de existir enquanto fosse só isso. A saída proposta: **construir uma linguagem nacional a partir do material folclórico**, com a mesma seriedade técnica da tradição europeia.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br09_programa',
      markdown:
        '## O programa\n\n' +
        'Tinha três exigências, e elas eram explícitas.\n\n' +
        '**Pesquisar** — ir a campo, recolher e transcrever a música tradicional brasileira. Não usar o folclore de ouvido, mas conhecê-lo em profundidade.\n\n' +
        '**Incorporar estruturalmente** — não citar a melodia folclórica como enfeite sobre harmonia europeia, mas deixar que suas escalas, seus ritmos e suas formas moldem a linguagem.\n\n' +
        '**Dominar o ofício** — a música nacional deve ter o mesmo nível técnico da europeia. Nacionalismo não é desculpa para amadorismo.\n\n' +
        'A terceira exigência é a que diferencia esse projeto de outros nacionalismos: ele não propunha abrir mão do rigor, e sim aplicá-lo a outra matéria.',
    },
    {
      kind: 'MARKDOWN',
      id: 'br09_tensoes',
      markdown:
        '## As tensões que o programa carrega\n\n' +
        'Vale enunciá-las, porque elas explicam boa parte das disputas dos capítulos seguintes.\n\n' +
        '**Quem escolhe o que é nacional?** O folclore brasileiro é enorme e contraditório. Selecionar dele o que representa a nação é decisão política, tomada por um grupo pequeno e urbano.\n\n' +
        '**O material sobrevive à transposição?** Levar uma melodia modal, de métrica livre, para a orquestra sinfônica e a harmonia funcional altera justamente o que a tornava distinta.\n\n' +
        '**Por que a forma continua europeia?** Se o objetivo é autonomia, usar sinfonia, sonata e quarteto mantém a dependência no nível mais estrutural.\n\n' +
        '**E o que é feito da música urbana viva?** O programa privilegiou o folclore rural, considerado autêntico, e olhou com desconfiança para o samba e o choro, que eram música popular comercial — e que, nesse mesmo momento, estavam produzindo a linguagem brasileira mais original do século.\n\n' +
        'Nenhuma dessas tensões foi resolvida. Elas foram vividas.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'br09_check',
      question: 'O que o programa modernista exigia além do uso de material folclórico?',
      options: [
        'Que a música fosse escrita em português',
        'Pesquisa de campo e incorporação estrutural, com o mesmo rigor técnico da tradição europeia',
        'Que se abandonasse a notação',
        'Que só se compusesse para instrumentos brasileiros',
      ],
      correctIndex: 1,
      explanation:
        'Exigia conhecer o material de primeira mão, deixá-lo moldar a linguagem, e não abrir mão do domínio de ofício — nacionalismo não era desculpa para amadorismo.',
    },
  ],
};
