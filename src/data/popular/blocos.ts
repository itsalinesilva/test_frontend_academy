import { LessonBlock } from '../../domain/academy';

/**
 * História Social da Música Popular Brasileira — blocos dos 14 capítulos.
 *
 * Texto autoral. Nenhuma obra de referência é citada.
 *
 * O foco é social: quem fazia, para quem, de que vivia, e o que mudou nas
 * condições materiais. Quando o curso descreve um gênero, descreve-o para
 * explicar a situação que o produziu — não o contrário.
 */
export const BLOCOS_POPULAR: Record<number, LessonBlock[]> = {
  1: [
    {
      kind: 'MARKDOWN',
      id: 'pp01_intro',
      markdown:
        'Este curso começa em Portugal, no século XVI, dois séculos antes de o Brasil ter cidade digna do nome. A razão não é reverência à metrópole: é que a **canção urbana** — cantada por uma pessoa só, acompanhada por ela mesma, sobre um sentimento particular — nasce de um processo social específico, e esse processo começou lá.\n\n' +
        'O processo é o **esvaziamento do campo**. A economia das navegações puxa gente da pequena agricultura para os portos e para a capital. Quem chega à cidade chega sozinho, sem a comunidade que estruturava a vida na aldeia.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp01_contraste',
      markdown:
        '## Duas músicas, duas formas de viver\n\n' +
        'No **campo**, a música é coletiva e funcional. Canta-se no terreiro, em grupo, para a festa, para o trabalho, para o ciclo do ano. Instrumentos de percussão e sopro simples, tocados por muitos. A música acompanha uma vida partilhada, e por isso não precisa exprimir ninguém em particular.\n\n' +
        'Na **cidade**, aparece outra coisa: uma pessoa cantando sozinha, acompanhando-se ao som de sua viola, sobre a sua própria falta. Não há terreiro, não há coro, não há ocasião comunitária. Há um indivíduo e um instrumento portátil.\n\n' +
        'Essa mudança de formato não é estética. É a consequência sonora de um modo de vida em que cada um vive por si.',
    },
    {
      kind: 'CALLOUT',
      id: 'pp01_call',
      type: 'info',
      title: 'Por que a viola, e não o tambor',
      text:
        'Instrumento de corda portátil, tocável por uma pessoa só, capaz de dar melodia e harmonia ao mesmo tempo, e barato. A viola é o instrumento que a vida urbana individual exige — do mesmo modo que o tambor coletivo era o que a festa de terreiro exigia. O instrumento acompanha a estrutura social, não o gosto.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp01_tom',
      markdown:
        '## O tom muda junto\n\n' +
        'Há um registro contemporâneo desse processo, escrito por quem o viu acontecer e não gostou: o teatro popular português do século XVI compara explicitamente o canto alegre dos terreiros ao lamento individual das ruas da cidade.\n\n' +
        'O alegre "cantar para folgar" do campo dá lugar a versos "carregados de fadiga", cantados por gente sujeita a dúvidas que a vida comunitária não produzia. E esse tom lamentoso **vira moda urbana** — canta-se e dança-se ao som dele justamente porque ele corresponde à nova realidade.\n\n' +
        'Trezentos anos depois, do outro lado do Atlântico, a modinha brasileira fará exatamente a mesma coisa: canção triste, individual, de amor não correspondido, cantada na cidade com acompanhamento de corda. A continuidade não é coincidência — é o mesmo processo social chegando mais tarde.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'pp01_check',
      question: 'Por que a canção urbana é cantada por uma pessoa só?',
      options: [
        'Porque é mais fácil de compor',
        'Porque corresponde a um modo de vida em que cada um vive por si',
        'Porque a igreja proibia o canto coletivo',
        'Porque faltavam instrumentos',
      ],
      correctIndex: 1,
      explanation:
        'O formato acompanha a estrutura social. Sem a comunidade que sustentava a festa de terreiro, resta o indivíduo e um instrumento que ele carrega e toca sozinho.',
    },
  ],

  2: [
    {
      kind: 'MARKDOWN',
      id: 'pp02_intro',
      markdown:
        'O primeiro tipo identificável de canção popular urbana é a **cantiga de serenata**: cantada à noite, na rua, sob a janela da mulher pretendida, com acompanhamento de viola.\n\n' +
        'Seu objetivo é prático e preciso: transmitir um recado amoroso a alguém que a moral patriarcal mantinha afastada da vida social. A canção existe porque a conversa direta era impossível.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp02_escudeiro',
      markdown:
        '## Quem cantava\n\n' +
        'O personagem típico é o **escudeiro** — um jovem de origem fidalga empobrecida, sem terra e sem renda, vivendo na cidade de aparências e de expedientes.\n\n' +
        'Sua situação explica muito. Ele não tem o que oferecer materialmente, e precisa oferecer outra coisa: **prosápia, conversa e domínio da viola**. Numa sociedade em transformação, onde a nobreza empobrecia e a origem já não garantia posição, saber cantar e tocar tornou-se um ativo social real.\n\n' +
        'O teatro da época registra isso com clareza cômica: uma moça da cidade grande rejeita o pretendente por ser um desses escudeiros pretensiosos e numerosos demais; e uma moça do interior contrata casamenteiros pedindo explicitamente um homem "discreto" e que "saiba tanger viola".\n\n' +
        'As duas querem a mesma coisa, e as duas estão dizendo o mesmo: o que dá valor a um homem, na sociedade nova, já não é a terra que ele tem.',
    },
    {
      kind: 'CALLOUT',
      id: 'pp02_call',
      type: 'historical',
      title: 'Trezentos anos de antecedência',
      text:
        'A serenata portuguesa do século XVI e a seresta brasileira do século XIX fazem a mesma coisa pelos mesmos motivos: recado amoroso cantado na rua, à noite, com corda, para alguém socialmente inacessível. Não é herança nostálgica — é o mesmo arranjo social produzindo a mesma solução musical.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp02_como',
      markdown:
        '## Como se cantava\n\n' +
        'Os textos musicais originais não sobreviveram, mas as cenas teatrais permitem reconstituir bastante.\n\n' +
        'O canto era **a solo**, com acompanhamento de viola de quatro ordens de cordas metálicas, tocada **rasgada** — o polegar varrendo todas as cordas, produzindo bloco harmônico e ritmo ao mesmo tempo. Não é dedilhado: é acompanhamento percussivo e harmônico simultâneo.\n\n' +
        'Essa técnica atravessará o Atlântico e reaparecerá na viola caipira, no cavaquinho e no violão de acompanhamento — em todos eles, a mão direita faz harmonia e ritmo de uma vez.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'pp02_check',
      question: 'Por que o domínio da viola era um ativo social para o escudeiro?',
      options: [
        'Porque música era profissão lucrativa',
        'Porque numa sociedade em que a origem já não garantia posição, ele não tinha o que oferecer materialmente',
        'Porque a igreja exigia',
        'Porque era requisito para o cargo',
      ],
      correctIndex: 1,
      explanation:
        'Sem terra e sem renda, restavam-lhe as qualidades urbanas: desenvoltura pessoal e domínio dos símbolos da sociedade nova — cantar e tocar viola.',
    },
  ],

  3: [
    {
      kind: 'MARKDOWN',
      id: 'pp03_intro',
      markdown:
        'A colônia demorou a ter cidade. Até o século XVIII, o que havia eram vilas pequenas, com população flutuante e economia voltada ao porto. Música organizada existia em dois lugares: na **igreja** e na **casa-grande**.\n\n' +
        'A pergunta deste capítulo não é o que se tocava — é **de que vivia** quem tocava.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp03_irmandades',
      markdown:
        '## O empregador era a irmandade\n\n' +
        'Não havia corte, não havia teatro público, não havia mercado. Quem contratava música eram as **irmandades religiosas** — associações de leigos organizadas por condição social e por cor, que financiavam as festas do calendário.\n\n' +
        'Isso define tudo o que se segue. O músico colonial é um **prestador de serviço por encomenda**, remunerado por evento, sem salário nem vínculo. Sua renda depende do calendário litúrgico e da disposição da irmandade em gastar.\n\n' +
        'E como as irmandades competiam entre si na pompa das festas, havia demanda real e paga. Formou-se um ofício.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp03_quem',
      markdown:
        '## Quem exercia o ofício\n\n' +
        'Predominantemente **homens de cor** — mestiços livres e, em menor número, escravizados alugados por seus proprietários.\n\n' +
        'A razão é estrutural, e não tem nada de elogiosa. O trabalho musical era classificado como **ofício mecânico**, isto é, trabalho manual — categoria que a mentalidade da época considerava indigna do homem branco de posses. Ser músico estava mais perto de ser sapateiro do que de ser letrado.\n\n' +
        'Daí a ambiguidade permanente da posição: o músico era necessário, era remunerado, era aplaudido na festa — e continuava socialmente classificado como artesão de segunda. Ganhava reconhecimento pelo que fazia e não pelo que era.\n\n' +
        'Essa ambiguidade atravessa toda a história que este curso conta. Ela reaparece com o barbeiro, com o chorão, com o sambista — e nunca se resolve inteiramente.',
    },
    {
      kind: 'CALLOUT',
      id: 'pp03_call',
      type: 'warning',
      title: 'Espaço não é ascensão',
      text:
        'É tentador ler a predominância negra e mestiça na música colonial como prova de mobilidade social. Não é. A música estava aberta a eles justamente porque era desvalorizada como trabalho manual. Foi uma das poucas portas abertas — e continuou sendo uma porta de serviço.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'pp03_check',
      question: 'Por que o ofício musical estava aberto a homens de cor na colônia?',
      options: [
        'Por política de inclusão das irmandades',
        'Porque era classificado como ofício mecânico, indigno do branco de posses',
        'Porque brancos não sabiam música',
        'Por exigência da Coroa',
      ],
      correctIndex: 1,
      explanation:
        'A abertura vem da desvalorização: trabalho manual não convinha ao homem branco de posses. Foi uma porta aberta, e continuou sendo porta de serviço.',
    },
  ],

  4: [
    {
      kind: 'MARKDOWN',
      id: 'pp04_intro',
      markdown:
        'Entre o fim do século XVIII e meados do XIX, a música profissional de rua nas cidades brasileiras era feita pelas **bandas de barbeiros**.\n\n' +
        'O nome é literal: eram barbeiros. E barbeiro, naquela sociedade, não cortava só cabelo — sangrava, aplicava sanguessuga, arrancava dente, tratava ferida. Era o ofício de quem lidava com o corpo alheio, e por isso mesmo estava no fundo da escala: exercido por escravizados de ganho e por libertos.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp04_como',
      markdown:
        '## Por que barbeiros tocavam\n\n' +
        'A combinação não é pitoresca: é econômica.\n\n' +
        'O barbeiro escravizado trabalhava em regime de **ganho** — o proprietário o alugava ou o deixava trabalhar por conta, exigindo uma quantia fixa por semana. Tudo o que excedesse essa quantia ficava com ele, e era com isso que muitos compravam a própria alforria.\n\n' +
        'Música era **renda extra**, e renda extra era liberdade. Tocava-se em procissão, em festa de igreja, em casamento, em recepção oficial, em inauguração — qualquer ocasião que pagasse.\n\n' +
        'O efetivo era de sopros e percussão, o que permitia tocar andando e ao ar livre. O repertório ia de marchas e dobrados a modinhas e lundus, conforme o contratante.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp04_relatos',
      markdown:
        '## O julgamento dos que escreveram\n\n' +
        'Quase todos os relatos sobre os barbeiros vêm de viajantes europeus, e quase todos são depreciativos: som áspero, afinação duvidosa, execução rude.\n\n' +
        'Convém ler esses relatos com desconto duplo. Primeiro porque o critério é o da música de concerto europeia, aplicado a conjuntos de sopro tocando na rua, ao sol, com instrumentos velhos. Segundo porque quem julgava tinha interesse em descrever a colônia como atrasada.\n\n' +
        'O que os mesmos relatos registram sem perceber é mais interessante: essas bandas tocavam **de memória**, adaptavam repertório europeu sem partitura, e improvisavam. Eram músicos de tradição oral executando material de tradição escrita — e isso exige competência que a categoria "rude" não descreve.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'pp04_check',
      question: 'Por que os barbeiros tocavam música?',
      options: [
        'Por tradição africana do ofício',
        'Porque música era renda extra, e renda extra podia comprar alforria',
        'Porque a Coroa exigia bandas nas vilas',
        'Porque não havia outros músicos',
      ],
      correctIndex: 1,
      explanation:
        'No regime de ganho, o que excedia a quantia devida ao proprietário ficava com o escravizado. Música pagava, e era com esse excedente que muitos compravam a liberdade.',
    },
  ],

  5: [
    {
      kind: 'MARKDOWN',
      id: 'pp05_intro',
      markdown:
        'A **modinha** é o caso mais instrutivo de circulação entre classes na música brasileira, porque ela atravessou a fronteira social nas duas direções e voltou diferente cada vez.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp05_travessias',
      markdown:
        '## As travessias\n\n' +
        '**Da rua para o salão.** A canção sentimental de viola, cantada por gente comum, é adotada pela elite urbana. Ao atravessar, ela ganha acompanhamento de **piano** ou de cravo, texto mais elaborado, e uma linha melódica influenciada pelo canto italiano de ópera, que era o gosto dominante. Fica mais longa, mais ornamentada e mais difícil de cantar.\n\n' +
        '**Do salão para a rua.** A versão refinada volta a circular fora dos salões, simplificada: acompanhamento de viola ou violão, texto direto, melodia reduzida ao que se canta de ouvido.\n\n' +
        'E o ciclo recomeça. Nenhuma das duas versões é "a" modinha — as duas são a modinha, em pontos diferentes do mesmo movimento.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp05_impressa',
      markdown:
        '## O que a imprensa faz com isso\n\n' +
        'A partir do século XIX, modinhas passam a ser **impressas** em folhetos e em partitura para piano, vendidas em lojas de música.\n\n' +
        'Isso tem três consequências.\n\n' +
        'A canção ganha **autor declarado**, onde antes circulava anônima.\n\n' +
        'Fixa-se uma **versão oficial**, onde antes havia variantes.\n\n' +
        'E o alvo comercial passa a ser quem tem **piano em casa** — ou seja, a versão impressa é a de salão, e é ela que fica registrada.\n\n' +
        'Daí um problema que vale reter para todo o curso: **o que sobreviveu nos arquivos é a versão da classe que comprava partitura**. A versão de rua, que era a mais cantada, é justamente a que menos se conservou. Quem estuda pelas fontes escritas estuda um recorte social, não o conjunto.',
    },
    {
      kind: 'CALLOUT',
      id: 'pp05_call',
      type: 'warning',
      title: 'O arquivo tem classe',
      text:
        'Nenhum acervo é neutro. O que chega ao pesquisador é o que alguém teve meios e interesse de registrar — partitura impressa, jornal, inventário. A música de quem não comprava partitura existiu em quantidade muito maior e deixou muito menos rastro. Tratar o arquivo como retrato fiel é reproduzir o filtro sem perceber.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'pp05_check',
      question: 'Por que a versão de salão da modinha é a que melhor se conservou?',
      options: [
        'Porque era musicalmente superior',
        'Porque a imprensa musical vendia para quem tinha piano em casa',
        'Porque a de rua foi proibida',
        'Porque era mais antiga',
      ],
      correctIndex: 1,
      explanation:
        'O que sobrevive nos arquivos é o que alguém teve meios e interesse de registrar. A versão mais cantada foi a que menos se conservou.',
    },
  ],

  6: [
    {
      kind: 'MARKDOWN',
      id: 'pp06_intro',
      markdown:
        'O **lundu** foi o primeiro gênero reconhecidamente de origem africana a ser admitido nos ambientes brancos brasileiros. Entender **em que termos** essa admissão se deu é entender o mecanismo que se repetirá com o maxixe, com o samba e com o funk.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp06_termos',
      markdown:
        '## Os termos da aceitação\n\n' +
        'O lundu entrou pela porta do **cômico**.\n\n' +
        'Foi aceito como número de teatro musicado e de salão desde que se apresentasse como divertimento: texto malicioso, personagem caricato, dança insinuante tratada como graça. A sensualidade que escandalizava era tolerada porque vinha embrulhada em piada.\n\n' +
        'Nesses termos, ele podia ser cantado por brancos, impresso em partitura e executado em ambiente respeitável. O que não podia era ser levado a sério.\n\n' +
        'Esse é o mecanismo: a cultura negra é admitida **como entretenimento**, e a admissão é condicionada a que ela aceite esse lugar. Sair dele — pretender dignidade artística, ou reivindicar origem — recolocava o problema.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp06_ganho',
      markdown:
        '## O que entrou junto\n\n' +
        'Mesmo nesses termos desiguais, algo decisivo aconteceu: com o lundu, a **síncope de matriz africana entrou no repertório escrito e impresso** do país.\n\n' +
        'Uma vez impressa, ela passou a ser lida, tocada e absorvida por músicos que nunca tinham frequentado um batuque. Deixou de ser característica de um grupo e virou traço da música brasileira em geral.\n\n' +
        'Não se deve romantizar isso — não foi troca entre iguais, e quem cedeu não foi quem tinha poder. Mas também não se deve subestimar: a partir daí, a base rítmica de tudo o que este curso vai tratar já estava dada.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'pp06_audio',
      title: 'A célula sincopada que entrou pelo lundu',
      description:
        'O ataque fora do tempo forte, prolongando-se sobre ele. É esta célula que atravessa maxixe, choro e samba.',
      notes: ['C4', 'E4', 'G4', 'E4', 'C4', 'E4', 'G4', 'C5'],
      playMode: 'SEQUENCE',
      bpm: 120,
    },
    {
      kind: 'CHECKPOINT',
      id: 'pp06_check',
      question: 'Em que termos o lundu foi admitido nos ambientes brancos?',
      options: [
        'Como música sacra',
        'Como divertimento cômico, desde que não fosse levado a sério',
        'Como dança de corte',
        'Como música de concerto'
      ],
      correctIndex: 1,
      explanation:
        'A sensualidade era tolerada embrulhada em piada. O mecanismo — aceitar a cultura negra como entretenimento, condicionando a admissão a esse lugar — se repetirá.',
    },
  ],

  7: [
    {
      kind: 'MARKDOWN',
      id: 'pp07_intro',
      markdown:
        'A **polca** chegou ao Brasil em meados do século XIX como a dança europeia da moda, e fez enorme sucesso em todas as camadas urbanas. Foi tocada em baile de elite, em clube de classe média e em festa popular.\n\n' +
        'E foi exatamente por circular em todos esses lugares que ela se transformou.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp07_maxixe',
      markdown:
        '## Como nasce o maxixe\n\n' +
        'Não houve invenção nem autor. Houve **execução**.\n\n' +
        'Músicos brasileiros — os mesmos barbeiros, chorões e instrumentistas de baile — tocaram a polca do jeito que sabiam tocar: com a síncope que o lundu já tinha tornado corrente, com acompanhamento de violão e cavaquinho em vez de piano, e em andamento próprio.\n\n' +
        'E dançarinos brasileiros dançaram-na como sabiam dançar: **corpos juntos, umbigada, requebro** — elementos das danças de roda de matriz africana aplicados a uma dança de par europeia.\n\n' +
        'O resultado tem outro nome porque é outra coisa. O maxixe é o que sobra da polca depois que ela passa por músicos e dançarinos que não são europeus.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp07_reacao',
      markdown:
        '## A reação\n\n' +
        'O maxixe foi atacado com uma violência que a polca nunca sofreu: chamado de imoral, de indecente, de dança de gente baixa. Foi proibido em clubes, condenado na imprensa e tratado como problema de polícia.\n\n' +
        'É útil perguntar o que exatamente incomodava. A polca também era dança de par, também era rápida, também era divertimento. A diferença estava em **quem dançava e como**: o requebro e a proximidade corporal identificados como negros, praticados por gente pobre, em espaço que a elite não controlava.\n\n' +
        'Compositores de formação erudita escreveram maxixes — e vários deles, por precaução, os rotularam como "tango brasileiro" na partitura. O nome estrangeiro tornava o gênero publicável e vendável. É o mesmo mecanismo do capítulo anterior, agora explícito na capa da edição.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'pp07_check',
      question: 'Por que compositores rotulavam maxixes como "tango brasileiro"?',
      options: [
        'Porque eram realmente tangos',
        'Porque o nome estrangeiro tornava o gênero publicável e vendável',
        'Por exigência das gravadoras',
        'Para diferenciar do maxixe dançado',
      ],
      correctIndex: 1,
      explanation:
        'O maxixe carregava estigma social. Trocar o rótulo permitia que a mesma música circulasse em ambiente respeitável — o mesmo mecanismo do lundu, agora na capa da edição.',
    },
  ],

  8: [
    {
      kind: 'MARKDOWN',
      id: 'pp08_intro',
      markdown:
        'O **choro** produziu, no fim do século XIX, música instrumental de dificuldade técnica comparável à do repertório de concerto. A pergunta social é: **quem tinha condições de desenvolver esse nível, e como?**',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp08_base',
      markdown:
        '## Funcionários públicos com instrumento\n\n' +
        'A composição social dos chorões é bem documentada e é surpreendentemente homogênea: empregados dos **Correios**, da **Alfândega**, da **Estrada de Ferro**, da **Imprensa Nacional**. Homens de classe média baixa, muitos deles mestiços, com emprego estável e horário fixo.\n\n' +
        'Essas três condições explicam o resto.\n\n' +
        '**Renda previsível** — não dependiam de tocar para comer, e por isso podiam tocar pelo gosto, sem submeter o repertório ao que o contratante quer ouvir.\n\n' +
        '**Horário fixo** — havia a noite livre, e ela era toda aproveitada. As rodas varavam a madrugada.\n\n' +
        '**Estabilidade** — podiam comprar instrumento e mantê-lo, coisa impossível para quem vive de biscate.\n\n' +
        'Virtuosismo exige tempo livre e segurança material. O choro é o que acontece quando essas duas coisas caem nas mãos de gente com talento e sem acesso ao conservatório.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp08_roda',
      markdown:
        '## A roda, e por que ela não é mercado\n\n' +
        'A roda de choro acontecia em **casa** — na sala de alguém, com comida, com família por perto, sem ingresso, sem palco e sem público separado dos músicos.\n\n' +
        'Isso tem consequências técnicas diretas.\n\n' +
        'Sem público pagante, **não há pressão de agradar**: pode-se tocar difícil, repetir, errar, recomeçar.\n\n' +
        'Sem palco, **não há separação** entre quem toca e quem escuta; quem chega com instrumento entra.\n\n' +
        'E a transmissão é **oral e por participação** — aprende-se tocando junto, não estudando método.\n\n' +
        'O choro se desenvolveu fora do mercado e fora da escola. Quando, mais tarde, ele entrar nos dois, mudará — e parte do que mudará é justamente a liberdade que vinha de não depender de nenhum dos dois.',
    },
    {
      kind: 'CALLOUT',
      id: 'pp08_call',
      type: 'info',
      title: 'Amadorismo não é falta de nível',
      text:
        '"Amador" aqui quer dizer que não se vivia disso, e não que se tocava mal. O nível técnico do choro é altíssimo justamente porque quem o fazia não precisava agradar ninguém para comer. Profissionalizar teria imposto o repertório que vende.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'pp08_check',
      question: 'Por que o emprego público estável foi condição do virtuosismo dos chorões?',
      options: [
        'Porque davam aulas no serviço',
        'Porque renda previsível e noite livre permitem tocar pelo gosto, sem submeter o repertório a quem paga',
        'Porque o governo fornecia instrumentos',
        'Porque tinham formação de conservatório',
      ],
      correctIndex: 1,
      explanation:
        'Virtuosismo exige tempo livre e segurança material. O choro é o que acontece quando as duas coisas chegam a quem tem talento e não tem acesso ao conservatório.',
    },
  ],

  9: [
    {
      kind: 'MARKDOWN',
      id: 'pp09_intro',
      markdown:
        'O carnaval brasileiro do século XIX não era desfile: era o **entrudo** — brincadeira de rua em que se jogava água, farinha, limão de cheiro e coisas piores em quem passasse. Não havia música organizada, não havia percurso, não havia agremiação. Havia bagunça.\n\n' +
        'A transformação do entrudo em festa organizada é um processo de **disciplinamento**, e vale acompanhar quem o conduziu e por quê.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp09_organizacao',
      markdown:
        '## Quem organiza, e como\n\n' +
        'A elite urbana, incomodada com o entrudo, importa o modelo europeu: **grandes sociedades** carnavalescas, com carros alegóricos, fantasias caras, percurso definido e crítica política. Desfile para ser assistido, não brincadeira para participar.\n\n' +
        'As camadas populares organizam-se por outro caminho, e em formatos distintos entre si:\n\n' +
        '**Rancho** — cortejo com enredo, marcação lenta, instrumentos de sopro e corda. Origem nos ranchos de reis, de matriz religiosa popular.\n\n' +
        '**Cordão** — mais numeroso, percussão forte, ligado a comunidades negras, frequentemente em conflito com a polícia.\n\n' +
        '**Bloco** — formação de vizinhança, informal, sem hierarquia rígida.\n\n' +
        'Essas não são variações de estilo: são **composições sociais diferentes**, cada uma com seu grau de tolerância por parte das autoridades.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp09_disputa',
      markdown:
        '## A disputa pela rua\n\n' +
        'O carnaval é, ao longo de todo o período, uma disputa pelo **espaço público**.\n\n' +
        'De um lado, o poder público quer festa previsível, em percurso controlado, sem aglomeração de gente pobre fora de hora. Regulamenta, exige licença, proíbe instrumentos de percussão em determinadas áreas, dispersa cordões.\n\n' +
        'De outro, a festa popular ocupa a rua porque é o único espaço que tem.\n\n' +
        'O que se chama hoje de "tradição do carnaval" é o resultado sedimentado dessa negociação forçada — e cada elemento que hoje parece natural, do percurso fixo à agremiação registrada, foi em algum momento uma exigência imposta.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'pp09_check',
      question: 'O que distingue rancho, cordão e bloco?',
      options: [
        'O andamento da música',
        'A composição social de cada um, e o grau de tolerância que recebiam',
        'O número de instrumentos',
        'A época do ano em que saíam',
      ],
      correctIndex: 1,
      explanation:
        'São formações socialmente distintas, não variações de estilo — e a polícia tratava cada uma de um jeito.',
    },
  ],

  10: [
    {
      kind: 'MARKDOWN',
      id: 'pp10_intro',
      markdown:
        'O samba urbano se forma no Rio de Janeiro das primeiras décadas do século XX, em casas do centro da cidade onde se reuniam migrantes baianos, trabalhadores portuários, praticantes de culto afro-brasileiro e músicos.\n\n' +
        'Essas casas cumpriam várias funções ao mesmo tempo: eram moradia, ponto de apoio para quem chegava, local de culto e lugar de festa. A música não era atividade separada — era parte do funcionamento daquela rede.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp10_repressao',
      markdown:
        '## Por que a polícia entrava\n\n' +
        'O samba foi perseguido de forma sistemática nas primeiras décadas do século, e os motivos declarados eram três: perturbação do sossego, vadiagem e prática religiosa não autorizada.\n\n' +
        'Os três merecem exame.\n\n' +
        '**Perturbação** — a percussão era audível e identificável à distância.\n\n' +
        '**Vadiagem** — era crime previsto em lei, e aplicado a quem não comprovasse ocupação fixa. Servia para prender negro pobre reunido, sem precisar de outro motivo.\n\n' +
        '**Religião** — o culto afro-brasileiro era enquadrado como charlatanismo, e o tambor o denunciava.\n\n' +
        'Ou seja: a música era o **rastro audível** de reunião que se queria impedir. Reprimir o samba era reprimir a aglomeração de negros pobres, e o som era só o que tornava a aglomeração localizável.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp10_virada',
      markdown:
        '## E depois, o Estado adota\n\n' +
        'Nos anos 1930 e 1940 o mesmo gênero passa a ser tratado como **símbolo da nacionalidade**, com apoio oficial, espaço no rádio estatal e estímulo à produção.\n\n' +
        'A reviravolta é rápida demais para ser espontânea, e tem explicações concretas:\n\n' +
        'Um governo empenhado em construir **identidade nacional unificada** precisava de símbolo popular, e o samba já tinha alcance.\n\n' +
        'A **indústria fonográfica** precisava de um produto nacional identificável.\n\n' +
        'E o samba tinha, de fato, qualidade e força próprias — o que a promoção aproveitou, mas não criou.\n\n' +
        'O preço foi a **domesticação**: valorizou-se o samba de tema patriótico e de exaltação ao trabalho; desestimulou-se o de malandragem; afastou-se a associação com o culto. O gênero ganhou projeção e perdeu parte do que o constituía.\n\n' +
        'É o mesmo mecanismo do lundu e do maxixe, na sua forma mais completa: aceitação mediante condições, com a diferença de que agora quem estabelece as condições é o Estado.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'pp10_check',
      question: 'Por que o crime de vadiagem era instrumento de repressão ao samba?',
      options: [
        'Porque sambistas não trabalhavam',
        'Porque permitia prender negro pobre reunido sem precisar de outro motivo',
        'Porque proibia instrumentos musicais',
        'Porque exigia licença para tocar',
      ],
      correctIndex: 1,
      explanation:
        'A lei punia quem não comprovasse ocupação fixa. A música era o rastro audível que tornava a reunião localizável.',
    },
  ],

  11: [
    {
      kind: 'MARKDOWN',
      id: 'pp11_intro',
      markdown:
        'Nos anos 1930 o **rádio** se torna o meio de comunicação dominante no Brasil. Para a música popular, é a mudança material mais profunda desde a imprensa musical — e de natureza diferente, porque o rádio não vende partitura: vende **audiência a anunciantes**.\n\n' +
        'A partir daí, a canção deixa de ser prática e passa a ser produto.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp11_forma',
      markdown:
        '## O que o meio faz com a forma\n\n' +
        'As restrições técnicas e comerciais moldam a canção diretamente.\n\n' +
        '**Duração** — o disco de 78 rotações comporta cerca de três minutos por lado, e a programação é vendida em blocos. A canção se ajusta a esse tempo, e o tempo vira norma estética.\n\n' +
        '**Estrutura** — introdução instrumental, estrofe, refrão memorável, repetição. O refrão precisa fixar em uma audição, porque a segunda audição pode não acontecer.\n\n' +
        '**Registro vocal** — o microfone permite cantar baixo e próximo, e cria o cantor de voz "aveludada" que não existiria num teatro sem amplificação.\n\n' +
        '**Arranjo** — entram orquestras de estúdio, arranjadores contratados, naipes de metais e cordas. A canção deixa de ser voz e violão e passa a ser produção.\n\n' +
        'Nada disso é decisão artística tomada em liberdade: é adaptação ao que o meio comporta e ao que o patrocinador paga.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp11_profissao',
      markdown:
        '## Nasce o profissional assalariado\n\n' +
        'O rádio cria, pela primeira vez no Brasil, um número significativo de pessoas que **vivem exclusivamente de música**: cantores contratados, músicos de orquestra, arranjadores, compositores de encomenda, produtores.\n\n' +
        'É ganho real — estabilidade e reconhecimento que o barbeiro e o chorão nunca tiveram.\n\n' +
        'E é subordinação nova. O compositor assalariado escreve o que a emissora e o patrocinador aprovam; o cantor grava o que a gravadora decide; o repertório passa por filtros que não são musicais.\n\n' +
        'A autonomia que o chorão tinha por não depender de música para comer é justamente o que se perde quando se passa a depender.',
    },
    {
      kind: 'CALLOUT',
      id: 'pp11_call',
      type: 'info',
      title: 'O meio não é neutro',
      text:
        'Toda tecnologia de difusão impõe um formato, e o formato vira estética. Três minutos não é o tempo natural de uma canção — é o tempo de um lado de 78 rotações. Gerações inteiras compuseram dentro de uma medida que era industrial e passou a parecer musical.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'pp11_check',
      question: 'O que o rádio vende, e por que isso importa para a canção?',
      options: [
        'Partituras, o que fixa versões',
        'Audiência a anunciantes, o que submete o repertório a filtros não musicais',
        'Discos, o que amplia o repertório',
        'Ingressos, o que valoriza o ao vivo',
      ],
      correctIndex: 1,
      explanation:
        'Quem paga é o patrocinador, não o ouvinte. A canção passa a ser avaliada pela audiência que entrega, e o filtro deixa de ser musical.',
    },
  ],

  12: [
    {
      kind: 'MARKDOWN',
      id: 'pp12_intro',
      markdown:
        'A música popular brasileira formou-se em **criação coletiva**: samba feito em roda, verso puxado por um e completado por outro, melodia que circula e se altera, autoria difusa por natureza.\n\n' +
        'O direito autoral, importado pronto, reconhece **indivíduos**. O encontro dos dois produziu conflito permanente, e vários dos casos mais conhecidos da música brasileira saem daí.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp12_conflito',
      markdown:
        '## O mecanismo do conflito\n\n' +
        'Numa roda, uma canção é de todos e de ninguém. No cartório, ela precisa de um nome, uma data e uma assinatura.\n\n' +
        'Quem registrava era quem **sabia que existia registro** e tinha meios de chegar até ele — o que raramente era o sambista do morro, e frequentemente era o intermediário letrado que frequentava a roda.\n\n' +
        'As formas do problema foram várias:\n\n' +
        '**Registro por terceiro** — alguém registra em nome próprio o que ouviu.\n\n' +
        '**Coautoria imposta** — o compositor cede metade da obra a quem tem acesso ao mercado, como condição para gravá-la.\n\n' +
        '**Compra a preço fixo** — a obra é vendida de uma vez, por quantia pequena, e todo o rendimento futuro fica com o comprador.\n\n' +
        'As três eram legais. É esse o ponto: não foram fraudes contra o sistema, foram usos do sistema por quem o conhecia contra quem não o conhecia.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp12_editoras',
      markdown:
        '## Editoras e arrecadação\n\n' +
        'As **editoras musicais** administravam o catálogo e ficavam com parcela substancial do rendimento, em troca de colocar a obra no mercado. Para quem não tinha acesso ao mercado, a troca parecia boa — e frequentemente era a única disponível.\n\n' +
        'A **arrecadação por execução pública** — rádio, baile, estabelecimento — exige um sistema de contagem e uma estrutura para distribuir. Quem controla essa estrutura controla o dinheiro, e a opacidade da contagem foi objeto de disputa durante décadas.\n\n' +
        'Vale reter, porque reaparece hoje: o problema não é a existência de intermediário, é a **assimetria de informação** entre quem cria e quem administra. Ela não foi resolvida pelo disco, e não foi resolvida pelo streaming.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'pp12_check',
      question: 'Por que os conflitos de autoria do período não foram, em geral, fraudes?',
      options: [
        'Porque ninguém reclamou',
        'Porque eram usos legais do sistema por quem o conhecia contra quem não o conhecia',
        'Porque não havia lei de direito autoral',
        'Porque as obras eram de domínio público',
      ],
      correctIndex: 1,
      explanation:
        'Registro por terceiro, coautoria imposta e compra a preço fixo eram legais. O problema era a assimetria de acesso e de informação.',
    },
  ],

  13: [
    {
      kind: 'MARKDOWN',
      id: 'pp13_intro',
      markdown:
        'A partir dos anos 1950, a **classe média urbana** cresce, ganha poder de compra e passa a ser o público-alvo preferencial da indústria fonográfica. Isso muda o que se produz.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp13_alvo',
      markdown:
        '## Quem compra define o que se grava\n\n' +
        'O disco é caro, e o toca-discos também. Quem compra é quem tem renda — e a indústria produz para quem compra, não para quem ouve.\n\n' +
        'Daí uma distorção que atravessa o período: o repertório que a indústria registra e promove reflete o gosto de uma **fração** do público, e essa fração é tomada como se fosse o país.\n\n' +
        'A bossa nova é o exemplo mais claro. Nasce num ambiente social bem delimitado — jovens de classe média da zona sul carioca, com acesso a formação musical e a discos importados —, e sua sofisticação harmônica é possível justamente por isso. O êxito é real e a qualidade também; o que não é verdade é que ela representasse o gosto musical brasileiro da época.\n\n' +
        'Enquanto isso, o que a maioria ouvia — e comprava, quando podia — raramente chegava à crítica e quase nunca chegava ao registro histórico com dignidade.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp13_segmentacao',
      markdown:
        '## Segmentação\n\n' +
        'A indústria passa a organizar o mercado em faixas, e cada faixa recebe um rótulo que é social antes de ser musical.\n\n' +
        'O que se dirige à classe média instruída é chamado de **música popular brasileira**, com sigla e prestígio crítico. O que se dirige ao público de renda baixa recebe nomes que funcionam como advertência — **brega**, **cafona**, **música de gosto duvidoso**.\n\n' +
        'Não há critério técnico que separe as duas categorias. Há um critério de público, travestido de critério estético.\n\n' +
        'Reconhecer isso não obriga a achar tudo igualmente bom. Obriga a perceber que o juízo carrega uma informação sobre classe que ele não declara.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'pp13_check',
      question: 'O que separa, na prática, "MPB" de "brega"?',
      options: [
        'A complexidade harmônica',
        'O público a que cada uma se dirige — critério social travestido de estético',
        'A qualidade das letras',
        'A formação dos músicos',
      ],
      correctIndex: 1,
      explanation:
        'Não há critério técnico que sustente a separação. O rótulo carrega informação sobre classe que ele não declara.',
    },
  ],

  14: [
    {
      kind: 'MARKDOWN',
      id: 'pp14_intro',
      markdown:
        'Desde pelo menos os anos 1960, a música popular brasileira é objeto de disputa pública permanente sobre o que presta e o que não presta. Este capítulo trata da disputa em si — de quem participa dela e do que ela produz.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp14_polemicas',
      markdown:
        '## As polêmicas, e o que têm em comum\n\n' +
        '**A guitarra elétrica** — acusada de submissão ao imperialismo cultural, chegou a ser alvo de passeata. O argumento era político; o efeito prático era definir que instrumento é legítimo.\n\n' +
        '**O tropicalismo** — acusado pela esquerda de alienação e perseguido pela direita. As duas acusações concordavam num ponto: havia um jeito certo de ser brasileiro, e aquele não era.\n\n' +
        '**O sertanejo e o brega** — acusados de pobreza artística por uma crítica que nunca precisou explicar seu critério, e cujo público era exatamente o inverso do público desses gêneros.\n\n' +
        '**O funk** — tratado como caso de polícia antes de ser tratado como música, exatamente como o samba oitenta anos antes.\n\n' +
        'O que todas têm em comum: a acusação de inautenticidade recai sistematicamente sobre o que é feito **por** e **para** os de baixo, e é feita por quem tem acesso a jornal, rádio ou cátedra.',
    },
    {
      kind: 'MARKDOWN',
      id: 'pp14_gosto',
      markdown:
        '## O gosto como marcador\n\n' +
        'Declarar gosto musical é declarar posição social, e quase sempre sem perceber.\n\n' +
        'Dizer que se ouve determinada coisa e não outra comunica escolaridade, renda, origem e ambição. É por isso que a discussão sobre música popular é tão áspera: ela raramente é sobre a música.\n\n' +
        'Isso não significa que todo juízo é apenas social, nem que não se possa dizer que uma canção é melhor que outra. Significa que **quem julga está localizado**, e que um juízo que se apresenta como puramente estético está escondendo metade de si.\n\n' +
        'A crítica musical, que se apresenta como árbitro neutro, é parte interessada: ela consagra e desqualifica, e essas decisões têm efeito material sobre carreiras e sobre o que se conserva.',
    },
    {
      kind: 'CALLOUT',
      id: 'pp14_call',
      type: 'info',
      title: 'Onde isto deixa você',
      text:
        'Quatorze capítulos, do esvaziamento do campo português à disputa de hoje. O fio é um só: a música popular é feita sob condições materiais determinadas, por pessoas em posições determinadas, e o que se conserva dela passa pelo filtro de quem tinha meios de registrar. Saber disso não estraga o prazer de ouvir — dá a ele contexto.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'pp14_check',
      question: 'O que as polêmicas sobre autenticidade musical têm em comum?',
      options: [
        'Todas envolveram instrumentos elétricos',
        'A acusação recai sobre o que é feito por e para os de baixo, e parte de quem tem acesso à tribuna',
        'Todas foram resolvidas pela crítica',
        'Todas trataram de questões técnicas',
      ],
      correctIndex: 1,
      explanation:
        'Do maxixe ao funk, a inautenticidade é imputada de cima para baixo. A disputa é sobre legitimidade social, e raramente sobre a música.',
    },
  ],
};
