import { LessonBlock } from '../../domain/academy';

/**
 * Curso de Violino — blocos dos 16 capítulos.
 *
 * Texto autoral. É um curso de prática: cada capítulo termina com o que fazer
 * com o instrumento na mão, e os laboratórios de afinação usam o motor real de
 * captação acústica da plataforma, não simulação.
 */
export const BLOCOS_VIOLINO: Record<number, LessonBlock[]> = {
  1: [
    {
      kind: 'MARKDOWN',
      id: 'vl01_intro',
      markdown:
        'Antes de tocar, é preciso saber o que se tem nas mãos — não por formalidade, mas porque quase todo problema de som tem causa mecânica, e quem não conhece as peças não consegue diagnosticar.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl01_partes',
      markdown:
        '## O violino\n\n' +
        '**Tampo** — a face superior, geralmente de abeto. É ele que vibra e irradia o som.\n' +
        '**Fundo e laterais** — de bordo, mais duros. Fecham a caixa e refletem.\n' +
        '**Efes** — as duas aberturas em forma de f. Deixam o ar da caixa sair e entrar.\n' +
        '**Cavalete** — a peça de madeira sobre a qual as cordas passam. **Não é colada**: fica de pé pela pressão das cordas, e é ela que transmite a vibração ao tampo.\n' +
        '**Alma** — um cilindro de madeira dentro da caixa, entre tampo e fundo, logo atrás do pé direito do cavalete. Também não é colada. É a peça que mais afeta o som, e deslocá-la um milímetro muda o instrumento inteiro.\n' +
        '**Braço e escala** — a escala é a peça preta de ébano sobre a qual os dedos pressionam. Não tem trastes: a altura é contínua, e a afinação depende inteiramente do ouvido.\n' +
        '**Cravelhas** — afinação grossa, por atrito.\n' +
        '**Estandarte e microafinadores** — afinação fina.\n' +
        '**Queixeira** — apoio do maxilar.\n\n' +
        'As quatro cordas, da mais grave à mais aguda: **sol, ré, lá, mi**. Afinadas em **quintas justas** entre si.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl01_arco',
      markdown:
        '## O arco\n\n' +
        '**Vareta** — de madeira ou fibra, com curvatura para dentro. Essa curvatura é o que dá elasticidade.\n' +
        '**Crina** — cerca de 150 fios de crina de cavalo. Sob o microscópio têm escamas, e é nelas que o breu adere.\n' +
        '**Talão** — a extremidade que a mão segura.\n' +
        '**Parafuso** — regula a tensão da crina.\n' +
        '**Ponta** — a extremidade oposta.\n\n' +
        'Talão e ponta se comportam de modo diferente: perto do talão o arco pesa mais e a crina tem menos elasticidade; perto da ponta, o contrário. Isso não é defeito — é a propriedade que se aprende a usar.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl01_caminho',
      markdown:
        '## O caminho do som\n\n' +
        'Vale ter isso claro, porque explica quase tudo o que virá depois.\n\n' +
        'A crina com breu **agarra e solta** a corda centenas de vezes por segundo. Não é atrito contínuo: é uma sucessão rapidíssima de puxões e escorregões.\n\n' +
        'A corda vibra. Sozinha, quase não produz som — é fina demais para mover ar.\n\n' +
        'A vibração desce pelo **cavalete**, que a transmite ao **tampo**.\n\n' +
        'O tampo, que tem área grande, move o ar. A **alma** transmite parte da vibração ao fundo, e a caixa inteira passa a soar.\n\n' +
        'A consequência prática: o som não vem da corda, vem da **caixa**. Por isso a posição da alma, a qualidade da madeira e o assentamento do cavalete importam mais que a marca da corda.',
    },
    {
      kind: 'CALLOUT',
      id: 'vl01_call',
      type: 'warning',
      title: 'Cavalete e alma não são para mexer',
      text:
        'Nenhum dos dois é colado, e ambos podem cair. Se a alma cair, AFROUXE as cordas imediatamente e leve o instrumento a um luthier — tocar sem alma, ou com o cavalete torto, pode trincar o tampo. Recolocar é serviço de luthier, não de estudante.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl01_check',
      question: 'O que produz o som audível do violino?',
      options: [
        'A corda vibrando sozinha',
        'A caixa, posta a vibrar pelo cavalete e pela alma',
        'O breu na crina',
        'A escala de ébano',
      ],
      correctIndex: 1,
      explanation:
        'A corda é fina demais para mover ar. Quem produz som é a caixa, que recebe a vibração pelo cavalete e a distribui pela alma.',
    },
  ],

  2: [
    {
      kind: 'MARKDOWN',
      id: 'vl02_intro',
      markdown:
        'As quatro cordas soltas do violino são **sol3, ré4, lá4 e mi5**, afinadas em quintas justas sucessivas.\n\n' +
        'A referência é o **lá4 = 440 Hz**. Afina-se o lá primeiro, e as outras três por quintas a partir dele.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'vl02_audio_cordas',
      title: 'As quatro cordas soltas',
      description: 'Sol, ré, lá, mi — quintas justas sucessivas. Grave para agudo.',
      notes: ['G3', 'D4', 'A4', 'E5'],
      playMode: 'SEQUENCE',
      bpm: 50,
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'vl02_lab_quinta',
      title: 'A quinta justa entre duas cordas',
      lowerNote: 'D4',
      upperNote: 'A4',
      prompt: 'Sete semitons. É este intervalo que você precisa reconhecer para afinar sem afinador.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl02_como',
      markdown:
        '## Como afinar\n\n' +
        '**Cravelha** — para ajustes grandes. Empurre **para dentro** enquanto gira, ou ela escorrega de volta. Gire pouco: um grau de cravelha é muita afinação. Se estiver dura ou escorregadia, o problema é o encaixe, e é serviço de luthier.\n\n' +
        '**Microafinador** — para ajustes finos, sobretudo na corda mi, que é de aço e reage demais à cravelha. Se o microafinador chegar ao fim do curso, volte-o ao meio e reajuste pela cravelha.\n\n' +
        '**A ordem** — afine o lá pela referência. Depois toque lá e ré juntos e ajuste até a quinta soar limpa. Depois ré e sol. Depois lá e mi. Confira o lá no fim, porque mexer nas outras muda a tensão do conjunto.\n\n' +
        'O sinal de que a quinta está afinada é a ausência de **batimento** — aquela pulsação lenta que aparece quando duas notas estão quase, mas não exatamente, no intervalo certo. Quando o batimento desaparece, está afinado.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl02_breu',
      markdown:
        '## Breu e conservação\n\n' +
        'Sem **breu**, a crina escorrega e não produz som. Com breu demais, o som fica áspero e sai pó branco.\n\n' +
        'Passe algumas vezes ao longo de toda a extensão da crina, com pressão leve, antes de estudar. Arco novo precisa de mais; arco em uso diário precisa de pouco.\n\n' +
        'Regras de conservação que evitam a maioria dos danos:\n\n' +
        '**Afrouxe o arco** sempre que guardar. Crina tensionada permanentemente deforma a vareta.\n' +
        '**Não toque na crina com os dedos** — a oleosidade impede a aderência do breu.\n' +
        '**Limpe o breu do tampo e das cordas** depois de estudar, com pano seco. Breu acumulado endurece e ataca o verniz.\n' +
        '**Evite variações bruscas de temperatura e umidade** — a madeira trabalha, e é assim que aparecem fendas.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl02_check',
      question: 'O que indica que uma quinta entre duas cordas está afinada?',
      options: [
        'O som fica mais alto',
        'O batimento — a pulsação lenta — desaparece',
        'As duas cordas vibram juntas',
        'O afinador apita',
      ],
      correctIndex: 1,
      explanation:
        'O batimento é a pulsação produzida por duas frequências quase coincidentes. Quando some, o intervalo está exato.',
    },
  ],

  3: [
    {
      kind: 'MARKDOWN',
      id: 'vl03_intro',
      markdown:
        'A postura no violino é anormal por natureza: o instrumento fica na horizontal, à esquerda, e a cabeça gira para segurá-lo. Não existe postura perfeitamente confortável — existe postura **sustentável**, que não produz dano ao longo dos anos.\n\n' +
        'Esta lição é a mais importante do curso e a que mais se ignora. Lesão por tensão acumulada encerra carreiras, e começa em hábitos formados nas primeiras semanas.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl03_corpo',
      markdown:
        '## De baixo para cima\n\n' +
        '**Pés** — afastados na largura dos ombros, o esquerdo ligeiramente à frente. Peso distribuído. Joelhos soltos, nunca travados.\n\n' +
        '**Coluna** — ereta sem rigidez. Nem empinada nem curvada sobre o instrumento.\n\n' +
        '**Ombros** — **baixos**. Este é o ponto crítico. O ombro esquerdo não levanta para buscar o violino: é o violino que vem até ele.\n\n' +
        '**Cabeça** — gira para a esquerda e o maxilar **pousa** na queixeira. O peso da cabeça é suficiente para segurar; não se aperta.\n\n' +
        '**Violino** — apoiado na clavícula, aproximadamente paralelo ao chão, apontando para a esquerda e ligeiramente à frente. A escala fica na altura em que o braço esquerdo alcança sem esticar.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl03_espaleira',
      markdown:
        '## A espaleira\n\n' +
        'Existe um vão entre o fundo do violino e a clavícula, e seu tamanho depende do pescoço e dos ombros de cada um.\n\n' +
        'A **espaleira** preenche esse vão, para que o instrumento se apoie sem que o ombro suba. A altura correta é a **menor** que permita segurar o violino com o peso da cabeça e o ombro relaxado.\n\n' +
        'Quem tem pescoço curto usa espaleira baixa ou nenhuma. Quem tem pescoço longo precisa de mais altura. Não há resposta única, e copiar a regulagem de outra pessoa é o erro mais comum.\n\n' +
        'O **teste**: com o violino apoiado e a cabeça pousada, solte completamente a mão esquerda. Se o violino cai ou escorrega, falta apoio. Se ele fica e o ombro está relaxado, a regulagem está certa.',
    },
    {
      kind: 'CALLOUT',
      id: 'vl03_call',
      type: 'warning',
      title: 'Dor nunca é normal',
      text:
        'Cansaço muscular depois de estudar é esperado. Dor aguda, formigamento, dormência ou dor que continua depois de parar NÃO são. São sinais de que alguma coisa está sendo forçada, e piorarão se você insistir. Pare, revise a postura, e procure orientação. Nenhum progresso compensa uma lesão de esforço repetitivo.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl03_pratica',
      markdown:
        '## O que fazer agora\n\n' +
        '1. Monte a postura sem o arco. Só o violino.\n' +
        '2. Segure por trinta segundos, respirando normalmente. Se prender a respiração, há tensão.\n' +
        '3. Solte a mão esquerda e verifique se o violino fica.\n' +
        '4. Baixe o instrumento, solte os braços, e repita cinco vezes.\n\n' +
        'Repita esse exercício no início de cada sessão de estudo, pelas primeiras semanas. Postura é hábito motor: ela se instala por repetição, e a repetição errada instala o erro com a mesma eficiência.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl03_check',
      question: 'Qual é a altura correta de espaleira?',
      options: [
        'A mais alta possível, para não cansar o pescoço',
        'A menor que permita segurar o violino com o peso da cabeça e o ombro relaxado',
        'A mesma que o professor usa',
        'Nenhuma; espaleira é dispensável',
      ],
      correctIndex: 1,
      explanation:
        'A espaleira preenche o vão entre o violino e a clavícula. A regulagem certa é individual, e o critério é o ombro permanecer baixo.',
    },
  ],

  4: [
    {
      kind: 'MARKDOWN',
      id: 'vl04_intro',
      markdown:
        'A mão direita é onde se produz o som. A esquerda escolhe a nota; a direita decide se ela vale a pena ser ouvida.\n\n' +
        'A empunhadura do arco tem um objetivo só: manter a mão **flexível**. Toda a variedade de som depende de a mão poder se ajustar continuamente, e uma mão travada não ajusta nada.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl04_montagem',
      markdown:
        '## Montando dedo a dedo\n\n' +
        '**Polegar** — vai **por baixo**, na quina do talão, ligeiramente **dobrado**. O polegar dobrado é o que permite tudo o mais; o polegar esticado trava a mão inteira. Se tiver que memorizar uma coisa desta lição, memorize esta.\n\n' +
        '**Dedo médio** — fica em frente ao polegar, do outro lado da vareta. Polegar e médio formam o círculo que sustenta.\n\n' +
        '**Indicador** — apoia-se na vareta um pouco adiante, entre a primeira e a segunda falange. É por ele que se aplica peso.\n\n' +
        '**Anular** — ao lado do médio, acompanhando.\n\n' +
        '**Mínimo** — pousa **curvado** sobre a parte superior da vareta. Perto do talão, ele contrabalança o peso do arco. Mínimo esticado ou fora da vareta é sinal de tensão.\n\n' +
        'Os dedos ficam levemente separados e **arredondados**. Nenhum aperta.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl04_flexibilidade',
      markdown:
        '## Por que a flexibilidade importa\n\n' +
        'Ao longo de uma arcada do talão à ponta, várias coisas mudam: o peso efetivo do arco diminui, o ângulo do braço muda, a elasticidade da vareta muda.\n\n' +
        'A mão precisa **absorver** essas mudanças continuamente para que o som permaneça igual. Uma mão rígida transmite cada variação ao som — e o resultado é a arcada que começa forte e termina fraca, que é o defeito mais comum de iniciante.\n\n' +
        'Dois exercícios sem tocar, que resolvem mais que horas de arcadas erradas:\n\n' +
        '**Elevador** — segure o arco na vertical e, só com os dedos, suba e desça a vareta. Nada de braço.\n\n' +
        '**Pêndulo** — com o arco na horizontal, mova-o para frente e para trás apenas flexionando e estendendo os dedos.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl04_check',
      question: 'Qual é a posição correta do polegar na empunhadura do arco?',
      options: [
        'Esticado, por cima da vareta',
        'Dobrado, por baixo, na quina do talão',
        'Apoiado na crina',
        'Escondido dentro da mão',
      ],
      correctIndex: 1,
      explanation:
        'O polegar dobrado por baixo é o que permite flexibilidade a toda a mão. Esticado, trava o conjunto e impede qualquer ajuste durante a arcada.',
    },
  ],

  5: [
    {
      kind: 'MARKDOWN',
      id: 'vl05_intro',
      markdown:
        'O som do violino é determinado por **três** variáveis, e apenas três. Todo problema de som é um desequilíbrio entre elas.\n\n' +
        '**Velocidade do arco** — quão rápido a crina percorre a corda.\n' +
        '**Peso** — quanta força vertical se aplica, vinda do braço e não do aperto da mão.\n' +
        '**Ponto de contato** — onde a crina toca a corda, entre o cavalete e a escala.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl05_relacao',
      markdown:
        '## Como elas se compensam\n\n' +
        'As três formam um sistema. Mudar uma exige compensar outra.\n\n' +
        '**Perto do cavalete** — a corda está mais tensa e resiste mais. Exige **mais peso** e **menos velocidade**. Produz som concentrado, intenso, brilhante. Errar aqui produz o som esganiçado e vidrado.\n\n' +
        '**Perto da escala** — a corda cede mais. Exige **menos peso** e **mais velocidade**. Produz som suave, difuso, aveludado. Errar aqui produz som sem núcleo, que some.\n\n' +
        '**No meio** — a região de uso corrente, mais tolerante.\n\n' +
        'Regra prática: **quanto mais forte se quer tocar, mais perto do cavalete**. Tocar forte longe do cavalete só produz ruído, porque a corda não aguenta o peso naquele ponto.\n\n' +
        'E a corda **sol** aceita mais peso que a **mi**, que é fina e estala com facilidade. Cada corda tem seu ponto de equilíbrio.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl05_diagnostico',
      markdown:
        '## Diagnóstico pelo som\n\n' +
        '| O que se ouve | Causa provável | Correção |\n' +
        '|---|---|---|\n' +
        '| Assobio, som vidrado | Muito perto do cavalete sem peso suficiente | Mais peso, ou afaste-se do cavalete |\n' +
        '| Som esmagado, áspero | Peso demais para a velocidade | Menos peso, ou acelere o arco |\n' +
        '| Som fraco, sem núcleo | Longe do cavalete e sem peso | Aproxime-se do cavalete |\n' +
        '| Som que some no meio | Arco perdeu velocidade na ponta | Distribua melhor o arco |\n' +
        '| Chiado ao começar | Arco parado tocou a corda antes de mover | Comece o movimento junto com o contato |\n\n' +
        'Aprender a fazer esse diagnóstico sozinho é o que permite estudar sem professor presente.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl05_pratica',
      markdown:
        '## O que fazer agora\n\n' +
        'Na corda **lá solta**, arco inteiro, som contínuo, o mais uniforme possível. Sem mão esquerda.\n\n' +
        '1. Vinte arcadas lentas, só ouvindo. Quatro segundos para descer, quatro para subir.\n' +
        '2. Mesma coisa perto do cavalete. Perceba que precisa de mais peso.\n' +
        '3. Mesma coisa perto da escala. Perceba que precisa de menos.\n' +
        '4. Volte ao meio e tente igualar o som do início ao fim da arcada.\n\n' +
        'Este é o exercício mais importante do instrumento, e não deixa de ser útil nunca — instrumentistas profissionais continuam fazendo notas longas todos os dias.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl05_check',
      question: 'Para tocar mais forte, o que se deve fazer com o ponto de contato?',
      options: [
        'Aproximar-se da escala',
        'Aproximar-se do cavalete',
        'Não mudar; só aumentar o peso',
        'Tocar sobre a escala',
      ],
      correctIndex: 1,
      explanation:
        'Perto do cavalete a corda resiste mais e suporta mais peso. Tocar forte longe do cavalete só produz ruído, porque a corda cede.',
    },
  ],

  6: [
    {
      kind: 'MARKDOWN',
      id: 'vl06_intro',
      markdown:
        'O arco tem três regiões, e cada uma se comporta de modo diferente.\n\n' +
        '**Talão** — pesado, pouca elasticidade, muita autoridade. Bom para ataques fortes; exige que o mínimo trabalhe para contrabalançar.\n\n' +
        '**Meio** — equilibrado. É onde se faz a maior parte do trabalho, e onde nascem os golpes que saem da corda.\n\n' +
        '**Ponta** — leve, muita elasticidade. Exige peso ativo do braço para não perder som; é onde a arcada costuma enfraquecer.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl06_distribuicao',
      markdown:
        '## Distribuição\n\n' +
        'A quantidade de arco deve corresponder à duração e à dinâmica da nota — e isso se planeja, não se improvisa.\n\n' +
        'Uma nota longa em piano usa **pouco** arco, devagar. Uma nota curta em forte usa **muito** arco, rápido. Duas notas de durações diferentes ligadas na mesma arcada precisam receber parcelas proporcionais.\n\n' +
        'O erro típico do iniciante é gastar arco demais no começo da frase e chegar ao fim sem arco. A correção é planejar: marcar na partitura onde cada arcada começa e termina.\n\n' +
        'Convenções de arcada: a **arcada para baixo** (do talão à ponta) é naturalmente mais forte e cai em tempo forte; a **para cima** é mais leve e serve à anacruse. O sinal ∏ indica para baixo, o sinal V indica para cima.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl06_mudanca',
      markdown:
        '## Mudança de corda\n\n' +
        'Cada corda tem um **plano de arco** — uma altura de braço em que a crina toca aquela corda e só ela. São quatro planos, do mais alto (sol) ao mais baixo (mi).\n\n' +
        'Entre dois planos vizinhos existe um plano intermediário, em que a crina toca **as duas** cordas. É ele que se usa nas cordas duplas, e é ele que se deve atravessar rápido nas mudanças simples.\n\n' +
        'O movimento vem do **braço inteiro**, articulado no ombro, não do pulso. Pulso fazendo a mudança produz o ruído característico de transição mal feita.\n\n' +
        'E a mudança deve ser **antecipada**: o braço começa a se mover antes de a nota anterior terminar, de modo que a chegada seja já no plano novo.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl06_pratica',
      markdown:
        '## O que fazer agora\n\n' +
        '1. Arco inteiro na corda lá, som igual do talão à ponta. Vinte vezes.\n' +
        '2. Metades: só do talão ao meio, só do meio à ponta. Compare o esforço.\n' +
        '3. Mudança lá → ré, arcadas lentas, procurando não ouvir a transição.\n' +
        '4. Percorra as quatro cordas em sequência, subindo e descendo, sem interromper o som.\n\n' +
        'O objetivo do item 4 é que um ouvinte de olhos fechados não consiga dizer onde você trocou de corda.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl06_check',
      question: 'De onde deve vir o movimento de mudança de corda?',
      options: [
        'Do pulso',
        'Do braço inteiro, articulado no ombro',
        'Dos dedos da mão direita',
        'Da rotação do violino',
      ],
      correctIndex: 1,
      explanation:
        'A mudança de plano é movimento de braço. Feita pelo pulso, produz o ruído característico de transição mal executada.',
    },
  ],

  7: [
    {
      kind: 'MARKDOWN',
      id: 'vl07_intro',
      markdown:
        'A mão esquerda pressiona a corda contra a escala, encurtando a parte que vibra e elevando a altura. Como não há trastes, **a posição exata do dedo determina a afinação**, e não há nada que a corrija automaticamente.\n\n' +
        'Isso é a maior dificuldade do instrumento e, ao mesmo tempo, sua maior possibilidade: a altura é contínua, então se pode tocar qualquer frequência — inclusive as que o piano não tem.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl07_forma',
      markdown:
        '## A forma da mão\n\n' +
        '**Polegar** — leve, do lado oposto aos dedos, aproximadamente na altura do primeiro ou segundo dedo. **Não aperta**: se o polegar aperta, a mão trava e a mudança de posição fica impossível.\n\n' +
        '**Pulso** — reto ou levemente arqueado para fora. Nunca dobrado para dentro, encostando no braço do violino — isso é o erro de postura mais comum da mão esquerda, e ele bloqueia o quarto dedo.\n\n' +
        '**Dedos** — curvados, caindo sobre a corda pela **ponta**, quase perpendiculares. Unhas curtas, obrigatoriamente.\n\n' +
        '**Base dos dedos** — a mão forma uma moldura estável; os dedos se movem dentro dela, não a mão inteira a cada nota.\n\n' +
        'A pressão necessária é **menor do que se imagina**: o suficiente para a corda encostar na escala, e nada mais. Pressão excessiva cansa, atrapalha e não melhora o som.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl07_primeira',
      markdown:
        '## A primeira posição\n\n' +
        'Na primeira posição, os quatro dedos cobrem uma quarta justa a partir da corda solta. Em cada corda:\n\n' +
        '| Corda | solta | 1º | 2º | 3º | 4º |\n' +
        '|---|---|---|---|---|---|\n' +
        '| sol | sol | lá | si | dó | ré |\n' +
        '| ré | ré | mi | fá♯ | sol | lá |\n' +
        '| lá | lá | si | dó♯ | ré | mi |\n' +
        '| mi | mi | fá♯ | sol♯ | lá | si |\n\n' +
        'Repare: o **4º dedo** de cada corda dá a mesma nota da **corda solta seguinte**. Isso é ferramenta de afinação — tocando as duas juntas, o uníssono deve ser perfeito.\n\n' +
        'Os dedos **2º e 3º** têm duas posições possíveis, a um semitom de distância, conforme a tonalidade exija a nota natural ou alterada. Chamam-se posição **baixa** e **alta** do dedo, e passar de uma à outra sem deslocar a mão inteira é parte da técnica.',
    },
    {
      kind: 'KEYBOARD',
      id: 'vl07_teclado',
      title: 'As notas da primeira posição na corda lá',
      highlightNotes: ['A4', 'B4', 'C#5', 'D5', 'E5'],
      startOctave: 4,
      octaves: 2,
    },
    {
      kind: 'CALLOUT',
      id: 'vl07_call',
      type: 'tip',
      title: 'Por que os dedos se aproximam ao subir',
      text:
        'A relação entre comprimento de corda e frequência não é linear. Para subir um semitom, encurta-se a corda numa fração fixa do que resta — e o que resta vai diminuindo. Por isso as distâncias entre notas vizinhas encolhem à medida que a mão sobe pela escala. Não é impressão: é aritmética.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl07_check',
      question: 'O que o 4º dedo de uma corda produz?',
      options: [
        'Uma quinta acima da corda solta',
        'A mesma nota da corda solta seguinte',
        'Uma oitava acima da corda solta',
        'Uma terça acima do 3º dedo',
      ],
      correctIndex: 1,
      explanation:
        'O 4º dedo dá o uníssono com a corda solta vizinha mais aguda — e é por isso que ele serve como verificação de afinação.',
    },
  ],

  8: [
    {
      kind: 'MARKDOWN',
      id: 'vl08_intro',
      markdown:
        'Afinar no violino não é acertar uma posição decorada: é **ouvir e corrigir**, continuamente, enquanto se toca.\n\n' +
        'O instrumento não tem trastes, então o dedo nunca cai exatamente no mesmo lugar duas vezes. O que se desenvolve não é precisão mecânica — é um circuito de escuta e ajuste tão rápido que o ouvinte não percebe a correção.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl08_referencias',
      markdown:
        '## As referências disponíveis\n\n' +
        'O violino dá três ferramentas de verificação, e todas são internas ao instrumento.\n\n' +
        '**Cordas soltas** — toque o dedo junto com a corda solta correspondente. O 4º dedo deve dar uníssono perfeito com a corda seguinte; o 1º dedo da corda ré deve formar segunda com o mi, e assim por diante.\n\n' +
        '**Ressonância simpática** — quando uma nota afinada coincide com a frequência de uma corda solta, ou com um harmônico dela, essa corda **vibra sozinha** e o som ganha corpo. É a verificação mais confiável que existe: se a nota está certa, o violino responde.\n\n' +
        '**Batimento** — em cordas duplas, a pulsação lenta indica desvio. Ausência de batimento indica intervalo exato.\n\n' +
        'Essas três referências dispensam afinador eletrônico, e são melhores que ele — porque funcionam **enquanto** você toca, e não depois.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl08_expressiva',
      markdown:
        '## Afinação não é uma coisa só\n\n' +
        'Existem três critérios de afinação, e eles não coincidem.\n\n' +
        '**Temperada** — a do piano: doze semitons iguais. É a referência de quem toca com teclado.\n\n' +
        '**Justa** — intervalos em razões simples, como na série harmônica. É a de quem toca em quarteto ou canta em coro, porque é ela que faz os acordes soarem limpos.\n\n' +
        '**Expressiva** — sensíveis tocadas ligeiramente altas para puxar mais para a tônica; notas abaixadas tocadas ligeiramente baixas. É a de quem toca melodia solo.\n\n' +
        'A diferença entre elas é de poucos cents, e é audível. Um violinista experiente **muda de critério conforme o contexto**, sem pensar — mais justa no quarteto, mais expressiva no solo, mais temperada com piano.\n\n' +
        'É por isso que a altura contínua, que parecia a maior dificuldade do instrumento, acaba sendo sua maior vantagem.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl08_pratica',
      markdown:
        '## O que fazer agora\n\n' +
        '1. Toque o 4º dedo da corda ré junto com a corda lá solta. Ajuste até o uníssono ficar perfeito.\n' +
        '2. Toque o 3º dedo da corda sol (dó) e escute se alguma corda solta responde.\n' +
        '3. Escala de ré maior em uma oitava, lentamente, conferindo cada nota contra a corda solta possível.\n' +
        '4. Repita cantando a nota antes de tocá-la.\n\n' +
        'O item 4 é o mais importante: **ouvir antes de tocar**. Quem toca primeiro e corrige depois nunca fica afinado; quem sabe qual som quer, acerta.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl08_check',
      question: 'O que é ressonância simpática, e por que ela serve para afinar?',
      options: [
        'O eco da sala; indica acústica boa',
        'Uma corda solta vibra sozinha quando a nota tocada coincide com sua frequência — se a nota está certa, o violino responde',
        'O batimento entre duas cordas',
        'O zumbido de uma corda mal afinada',
      ],
      correctIndex: 1,
      explanation:
        'A corda solta entra em vibração por simpatia quando a altura tocada coincide com ela ou com um harmônico seu. O ganho de corpo no som confirma a afinação.',
    },
  ],

  9: [
    {
      kind: 'MARKDOWN',
      id: 'vl09_intro',
      markdown:
        'O violino lê em **clave de sol**, e sua extensão escrita vai do sol3 — a corda mais grave — até bem acima da pauta, com linhas suplementares e sinal de oitava.\n\n' +
        'Além das notas, a parte de violino traz um conjunto de indicações próprias que é preciso saber ler.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl09_sinais',
      markdown:
        '## Os sinais da parte\n\n' +
        '**Números 0 a 4** acima ou abaixo da nota — o **dedo** a usar. 0 é corda solta.\n\n' +
        '**∏** — arcada para baixo, do talão à ponta.\n' +
        '**V** — arcada para cima, da ponta ao talão.\n\n' +
        '**Sul G, sul D, sul A, sul E** — tocar na corda indicada, mesmo que a nota exista em outra. Muda o timbre, e é escolha do compositor.\n\n' +
        '**I, II, III, IV** (algarismos romanos) — indicam a corda, do agudo para o grave em algumas edições e ao contrário em outras. Confira a convenção da edição.\n\n' +
        '**Números romanos com posição** (III, V, VII) — a posição da mão esquerda.\n\n' +
        '**Círculo sobre a nota** — harmônico. Toca-se apenas encostando o dedo, sem pressionar.\n\n' +
        '**pizz.** — pinçar com o dedo, largando o arco. **arco** — voltar a usar o arco.\n\n' +
        '**con sord. / senza sord.** — com e sem surdina.',
    },
    {
      kind: 'STAFF',
      id: 'vl09_staff',
      title: 'As quatro cordas soltas na pauta',
      clef: 'treble',
      notes: ['G3', 'D4', 'A4', 'E5'],
      caption: 'Sol3 abaixo da pauta com linhas suplementares; mi5 no espaço superior.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl09_ler',
      markdown:
        '## Como ler uma parte antes de tocar\n\n' +
        'Quatro passos, na ordem, antes de encostar o arco:\n\n' +
        '**1. Armadura e fórmula de compasso.** Quais notas estão alteradas; quantos tempos por compasso.\n\n' +
        '**2. Extensão.** Qual a nota mais grave e a mais aguda. Isso já diz se a peça cabe na primeira posição ou exige mudança.\n\n' +
        '**3. Arcadas.** Onde começa cada arcada, e se a distribuição fecha. Se a frase acaba na ponta sem arco, refaça o plano.\n\n' +
        '**4. Trechos difíceis.** Marque-os antes. É neles que o estudo vai se concentrar, e não no começo da peça, que é sempre o mais estudado e o menos necessário.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl09_check',
      question: 'O que indica o sinal ∏ numa parte de violino?',
      options: [
        'Uma pausa',
        'Arcada para baixo, do talão à ponta',
        'Um harmônico',
        'Tocar em pizzicato',
      ],
      correctIndex: 1,
      explanation:
        'É o sinal de arcada para baixo, naturalmente mais forte e associada ao tempo forte. O V indica para cima.',
    },
  ],

  10: [
    {
      kind: 'MARKDOWN',
      id: 'vl10_intro',
      markdown:
        'A articulação no violino é decidida pela mão direita: é o modo como cada nota começa, dura e termina. As mesmas alturas, com articulação diferente, produzem música diferente.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl10_golpes',
      markdown:
        '## Os quatro fundamentais\n\n' +
        '**Détaché** — uma arcada por nota, som contínuo, sem interrupção entre elas. Não é destacado, apesar do nome: é o golpe padrão, e a maior parte da música se toca assim. A dificuldade é igualar o som entre a arcada para baixo e a para cima.\n\n' +
        '**Legato** — várias notas numa arcada só. A mão direita não interrompe; quem articula é a mão esquerda. A dificuldade é o arco não acabar antes das notas.\n\n' +
        '**Staccato** — notas separadas por silêncio, com o arco **na corda**, parando entre elas. Cada nota tem começo e fim nítidos.\n\n' +
        '**Martelé** — ataque forte e imediato, com o arco preparado na corda, pressão liberada de uma vez, e parada. Produz consoante audível no início da nota. É o golpe de maior definição rítmica.\n\n' +
        'A diferença entre staccato e martelé é a **preparação**: o martelé acumula pressão antes de soltar; o staccato apenas interrompe.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl10_pratica',
      markdown:
        '## O que fazer agora\n\n' +
        'Na escala de ré maior, uma oitava, primeira posição:\n\n' +
        '1. Toda em détaché, arco inteiro. Iguale o som das duas direções.\n' +
        '2. Toda em détaché, meio arco, mais rápido.\n' +
        '3. Duas notas ligadas por arcada, subindo e descendo.\n' +
        '4. Quatro notas ligadas por arcada.\n' +
        '5. Em martelé, uma nota por arcada, com parada nítida entre elas.\n\n' +
        'Estude cada variante com o metrônomo, começando lento o bastante para acertar sempre. Velocidade vem do acerto repetido, não da tentativa rápida.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl10_check',
      question: 'O que distingue martelé de staccato?',
      options: [
        'O martelé é mais rápido',
        'O martelé prepara pressão na corda antes de soltar, produzindo ataque definido',
        'O staccato tira o arco da corda',
        'O martelé usa mais de uma corda',
      ],
      correctIndex: 1,
      explanation:
        'Os dois param entre as notas. O martelé acumula pressão antes do ataque, o que produz a consoante inicial característica.',
    },
  ],

  11: [
    {
      kind: 'MARKDOWN',
      id: 'vl11_intro',
      markdown:
        'Escalas e arpejos não são exercício de aquecimento: são o trabalho que organiza, ao mesmo tempo, a geometria da mão esquerda, a distribuição do arco e o ouvido.\n\n' +
        'Feitos com atenção, resolvem sozinhos boa parte dos problemas que apareceriam no repertório. Feitos no automático, não fazem nada.',
    },
    {
      kind: 'SCALE_LAB',
      id: 'vl11_lab_re',
      title: 'Ré maior — a escala natural do violino',
      tonic: 'D4',
      mode: 'MAJOR',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl11_porque_re',
      markdown:
        '## Por que se começa por ré maior\n\n' +
        'Porque ela usa as cordas ré e lá, ambas soltas, e cai inteiramente na primeira posição sem exigir extensão nem alteração difícil. As cordas soltas funcionam como referência de afinação a cada quatro notas.\n\n' +
        'A sequência de tonalidades que se segue habitualmente — sol, lá, dó, si♭ — vai acrescentando dificuldades uma de cada vez: primeiro a corda sol, depois o 4º dedo obrigatório, depois as posições baixas do 1º dedo.\n\n' +
        'Não avance de tonalidade enquanto a anterior não estiver afinada com o metrônomo em andamento moderado. A ordem existe porque cada passo depende do anterior.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl11_rotina',
      markdown:
        '## Uma rotina curta e útil\n\n' +
        'Quinze minutos, todos os dias, valem mais que duas horas no sábado.\n\n' +
        '**3 min — notas longas.** Corda solta, arco inteiro, som uniforme. É o exercício do capítulo V, e ele nunca deixa de ser necessário.\n\n' +
        '**4 min — escala.** Uma oitava, lenta, com metrônomo, conferindo afinação contra as cordas soltas.\n\n' +
        '**3 min — arpejo.** A tríade da mesma tonalidade, subindo e descendo.\n\n' +
        '**5 min — um trecho difícil do repertório.** Lento, repetido, até acertar três vezes seguidas.\n\n' +
        'O item final é o que produz progresso. Os três primeiros são o que tornam o item final possível.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl11_check',
      question: 'Por que ré maior é a primeira escala que se estuda no violino?',
      options: [
        'Porque é a tonalidade mais fácil de ler',
        'Porque usa duas cordas soltas como referência e cabe toda na primeira posição',
        'Porque não tem acidentes',
        'Porque é a tonalidade da maioria das peças',
      ],
      correctIndex: 1,
      explanation:
        'As cordas ré e lá soltas dão verificação de afinação a cada quatro notas, e nenhuma nota exige extensão ou mudança de posição.',
    },
  ],

  12: [
    {
      kind: 'MARKDOWN',
      id: 'vl12_intro',
      markdown:
        'Até aqui a mão ficou parada na primeira posição. Subir pela escala amplia a extensão, muda o timbre e — frequentemente — simplifica passagens que seriam desconfortáveis embaixo.\n\n' +
        'A **terceira posição** é a primeira que se aprende, e não a segunda. A razão é prática: nela, a base da mão encosta no corpo do violino, o que dá uma referência tátil que a segunda posição não oferece.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl12_mecanica',
      markdown:
        '## A mecânica da mudança\n\n' +
        'Três coisas acontecem, nesta ordem:\n\n' +
        '**1. O polegar solta.** Se ele estiver apertando, a mão não desliza. É aqui que quase toda mudança falha.\n\n' +
        '**2. O braço conduz.** O movimento vem do cotovelo e do ombro, levando a mão inteira. Os dedos não se esticam para alcançar — a mão vai junto.\n\n' +
        '**3. O dedo-guia desliza.** Um dedo permanece **leve** na corda durante o deslocamento, servindo de trilho. Geralmente é o dedo que estava tocando, ou o que vai tocar.\n\n' +
        'O deslize deve ser **inaudível** na maior parte dos casos. Consegue-se isso reduzindo a pressão durante o movimento e coordenando a mudança com uma troca de arcada, que mascara qualquer resíduo.\n\n' +
        'Quando o deslize é deliberadamente audível, chama-se **portamento**, e é recurso expressivo — não acidente.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl12_pratica',
      markdown:
        '## O que fazer agora\n\n' +
        '1. Na corda lá, 1º dedo no si (primeira posição). Deslize lentamente até o ré (terceira posição) e volte. Só o deslize, sem se preocupar com som.\n' +
        '2. O mesmo, agora com o arco, aceitando que o deslize seja audível.\n' +
        '3. O mesmo, reduzindo a pressão do dedo durante o movimento, até o deslize sumir.\n' +
        '4. Escala de ré maior em duas oitavas, que exige a mudança.\n\n' +
        'Faça o item 1 muitas vezes antes de passar ao 2. A mudança é movimento de braço, e o braço aprende por repetição lenta.',
    },
    {
      kind: 'CALLOUT',
      id: 'vl12_call',
      type: 'tip',
      title: 'O polegar denuncia',
      text:
        'Se a mudança de posição está travada, engasgada ou ruidosa, o problema é quase sempre o polegar apertando. Verifique-o antes de qualquer outra coisa: ele deve soltar ANTES de a mão se mover, e reacomodar-se depois.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl12_check',
      question: 'Por que se aprende a terceira posição antes da segunda?',
      options: [
        'Porque é mais aguda',
        'Porque a base da mão encosta no corpo do violino, dando referência tátil',
        'Porque tem menos notas',
        'Porque a segunda posição não existe',
      ],
      correctIndex: 1,
      explanation:
        'O contato da mão com o corpo do instrumento fornece um ponto de chegada físico, que a segunda posição não oferece.',
    },
  ],

  13: [
    {
      kind: 'MARKDOWN',
      id: 'vl13_intro',
      markdown:
        'Tocar duas cordas ao mesmo tempo exige que o arco encontre o **plano intermediário** entre elas e permaneça ali, e que a mão esquerda coloque dois dedos afinados um em relação ao outro.\n\n' +
        'São duas dificuldades independentes, e convém estudá-las separadas antes de juntá-las.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl13_arco',
      markdown:
        '## O plano do arco\n\n' +
        'O braço fica numa altura intermediária, de modo que a crina toque as duas cordas com **pressão igual**.\n\n' +
        'Se uma corda soa mais que a outra, o plano está deslocado para o lado dela. O ajuste é de milímetros, e feito pelo braço.\n\n' +
        'A pressão total precisa ser **maior** que numa corda só, porque está distribuída entre duas. Mas não o dobro — as cordas se ajudam.\n\n' +
        'Exercício de isolamento: toque as duas cordas soltas juntas, arco inteiro, e busque o equilíbrio sem usar a mão esquerda. Só quando ele estiver estável vale acrescentar os dedos.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl13_afinacao',
      markdown:
        '## A afinação de um intervalo\n\n' +
        'Aqui a afinação muda de critério, e este é o ponto conceitual do capítulo.\n\n' +
        'Numa melodia, cada nota é afinada **em relação à tonalidade**. Numa corda dupla, as duas notas são afinadas **uma em relação à outra** — e o que decide é o **batimento**.\n\n' +
        'Toque o intervalo e escute a pulsação. Ajuste um dos dedos até a pulsação desaparecer. Quando some, o intervalo está em afinação justa, em razão simples.\n\n' +
        'Isso frequentemente exige colocar um dedo num lugar diferente daquele em que ele cairia numa escala. Não é erro: é outro critério, e é o correto para o contexto.\n\n' +
        'Terças, sextas e oitavas são as cordas duplas mais frequentes. As **oitavas** são as mais reveladoras para estudar, porque qualquer desvio produz batimento imediato e inconfundível.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'vl13_lab',
      title: 'Sexta maior — corda dupla frequente',
      lowerNote: 'D4',
      upperNote: 'B4',
      prompt: 'Ouça o intervalo limpo. É este som, sem pulsação, que a mão precisa encontrar.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl13_check',
      question: 'Como se afina uma corda dupla?',
      options: [
        'Colocando cada dedo na posição da escala',
        'Ajustando até o batimento entre as duas notas desaparecer',
        'Usando afinador eletrônico em cada nota',
        'Pressionando mais forte',
      ],
      correctIndex: 1,
      explanation:
        'Na corda dupla as notas se afinam uma em relação à outra, em razão simples. A ausência de batimento é o indicador, e pode exigir posição diferente da escalar.',
    },
  ],

  14: [
    {
      kind: 'MARKDOWN',
      id: 'vl14_intro',
      markdown:
        'O **vibrato** é uma oscilação regular da altura em torno da nota, produzida por um movimento oscilatório da mão esquerda. Ele dá calor, projeção e vida ao som.\n\n' +
        'E é o recurso mais mal usado do instrumento, porque se começa a praticá-lo cedo demais, antes de a afinação e a mão estarem estáveis. Vibrato sobre nota desafinada não corrige nada — apenas espalha o erro.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl14_tipos',
      markdown:
        '## Os três tipos\n\n' +
        '**De braço** — o movimento nasce no antebraço, que oscila a partir do cotovelo. Produz vibrato amplo e intenso. Mais fácil de iniciar.\n\n' +
        '**De pulso** — o movimento nasce no pulso, com o antebraço parado. Produz vibrato mais rápido e contido. É o mais versátil, e o mais usado.\n\n' +
        '**De dedo** — o movimento vem da flexão da própria falange. Produz vibrato muito estreito e rápido, usado em passagens delicadas e em posições altas.\n\n' +
        'Um violinista formado usa os três, alternando conforme a música pede. Começa-se aprendendo um deles — geralmente o de braço ou o de pulso, conforme a mão.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl14_mecanica',
      markdown:
        '## A mecânica, e onde fica a nota\n\n' +
        'O dedo permanece no mesmo ponto da corda; o que oscila é a **inclinação** dele, rolando levemente para trás e voltando.\n\n' +
        'Ponto importante e muito confundido: o vibrato oscila **abaixo** da nota e volta a ela. A altura percebida é o **ponto mais alto** da oscilação, não a média. Por isso um vibrato que sobe acima da nota soa desafinado para cima.\n\n' +
        'Duas variáveis se controlam independentemente: a **amplitude** (quanto a altura varia) e a **velocidade** (quantas oscilações por segundo). Música lenta e expressiva pede amplitude maior e velocidade menor; passagens rápidas pedem o contrário.\n\n' +
        'Vibrato contínuo e sempre igual é um defeito, não um estilo — ele anula a variedade que o recurso existe para produzir.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl14_pratica',
      markdown:
        '## Como começar\n\n' +
        '1. Sem o arco. 3º dedo na corda lá, na nota ré. Role o dedo para trás e para a frente, lentamente, sem tirar o contato com a corda. Vinte vezes.\n' +
        '2. O mesmo, com metrônomo lento: uma oscilação por batida.\n' +
        '3. Duas oscilações por batida. Depois três. Depois quatro.\n' +
        '4. Só então acrescente o arco.\n\n' +
        'A regularidade vem antes da velocidade. Um vibrato lento e regular é musical; um vibrato rápido e irregular é tremor.',
    },
    {
      kind: 'CALLOUT',
      id: 'vl14_call',
      type: 'warning',
      title: 'Não comece cedo demais',
      text:
        'O vibrato exige mão esquerda solta, polegar sem pressão e afinação já confiável. Aprendido sobre uma mão tensa, ele fixa a tensão e fica impossível de corrigir depois. Se sua mão ainda aperta, volte ao capítulo VII antes de continuar aqui.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl14_check',
      question: 'Em relação à nota escrita, para onde oscila o vibrato?',
      options: [
        'Igualmente para cima e para baixo',
        'Abaixo da nota, voltando a ela — a altura percebida é o ponto mais alto',
        'Acima da nota',
        'Depende do tipo de vibrato',
      ],
      correctIndex: 1,
      explanation:
        'A oscilação vai abaixo e retorna. Como o ouvido toma o ponto mais alto como a altura, um vibrato que ultrapasse a nota para cima soa desafinado.',
    },
  ],

  15: [
    {
      kind: 'MARKDOWN',
      id: 'vl15_intro',
      markdown:
        'Os golpes do capítulo X mantêm o arco na corda. Os deste capítulo o tiram — total ou parcialmente —, e é a elasticidade da vareta que faz o trabalho.\n\n' +
        'Todos eles dependem de a mão direita estar flexível. Numa mão travada, nenhum funciona, e insistir só produz ruído.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl15_golpes',
      markdown:
        '## Os quatro\n\n' +
        '**Spiccato** — o arco **salta** da corda a cada nota. O movimento é **ativo**: a mão conduz o arco para baixo e para cima. Funciona no terço inferior a médio do arco, onde há equilíbrio entre peso e elasticidade. Altura do salto e ponto do arco controlam o caráter.\n\n' +
        '**Sautillé** — parece spiccato e é outra coisa. O movimento da mão é **horizontal e pequeno**; o salto acontece **sozinho**, pela ressonância natural da vareta no andamento certo. Não se pode fazer sautillé lento — ele só existe acima de certa velocidade. É a diferença essencial em relação ao spiccato, que é controlado nota a nota.\n\n' +
        '**Ricochete** — deixa-se o arco cair na corda e ele **quica** várias vezes sozinho, numa arcada só. Conta-se com a elasticidade; a mão apenas solta e recolhe.\n\n' +
        '**Colé** — o arco parte da corda, agarra-a com os dedos e sai, num movimento curto no talão. Produz ataque nítido e leve. É exercício excelente de flexibilidade de dedos, mesmo para quem não vai usá-lo no repertório.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl15_pratica',
      markdown:
        '## Como estudar\n\n' +
        'Para o **spiccato**: comece com détaché curto no meio do arco, muito leve. Aumente a velocidade e reduza a pressão até o arco começar a sair da corda sozinho. Não force o salto — deixe-o aparecer.\n\n' +
        'Para o **sautillé**: parta do détaché rápido no meio do arco, com o mínimo de movimento, e procure o andamento em que a vareta começa a ressoar. Quando achar o ponto, você sentirá — o arco passa a quicar sem que você peça.\n\n' +
        'Em ambos, o erro é tentar fazer o salto com força. A vareta faz o trabalho; a mão permite.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl15_check',
      question: 'Qual a diferença essencial entre spiccato e sautillé?',
      options: [
        'O spiccato é mais forte',
        'No spiccato a mão conduz o salto; no sautillé o salto acontece sozinho, pela ressonância da vareta acima de certa velocidade',
        'O sautillé usa a ponta do arco',
        'O spiccato só existe na corda mi',
      ],
      correctIndex: 1,
      explanation:
        'O spiccato é controlado nota a nota e pode ser lento. O sautillé depende da vareta entrar em ressonância, e por isso só existe acima de um andamento mínimo.',
    },
  ],

  16: [
    {
      kind: 'MARKDOWN',
      id: 'vl16_intro',
      markdown:
        'Os quinze capítulos anteriores deram a técnica. Este trata do que fazer com ela sozinho, dia após dia — que é onde o progresso acontece de verdade.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl16_sessao',
      markdown:
        '## Como se estuda\n\n' +
        'A regra central: **estudar não é tocar**. Tocar a peça do começo ao fim é executar, e executar não corrige nada — apenas repete o que já se faz, inclusive os erros.\n\n' +
        'Estudar é:\n\n' +
        '**Isolar** — encontrar o compasso, ou as três notas, que não funcionam. É ali que está o problema, e não na peça inteira.\n\n' +
        '**Diagnosticar** — perguntar **por que** não funciona. É afinação? É distribuição de arco? É a mudança de posição? O capítulo V deu a tabela de diagnóstico de som; use-a.\n\n' +
        '**Reduzir a velocidade** até a passagem sair certa **todas** as vezes. Se sai certa quatro em cinco, ainda está rápido demais.\n\n' +
        '**Repetir com atenção** — dez repetições atentas valem mais que cem no automático. Repetição desatenta fixa o erro tão bem quanto o acerto.\n\n' +
        '**Acelerar por degraus** — com metrônomo, subindo de poucos em poucos pontos, voltando sempre que errar.\n\n' +
        '**Recontextualizar** — reinserir a passagem na frase, e só então na peça.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl16_medicao',
      markdown:
        '## O que a medição diz, e o que não diz\n\n' +
        'A plataforma mede duas coisas a partir do som que você produz: o **desvio de afinação**, em cents, e o **desvio de tempo**, em milissegundos.\n\n' +
        'Essas medidas são **diagnóstico**, não nota. Servem para responder perguntas que o ouvido sozinho responde mal:\n\n' +
        '*Eu desafino sempre para o mesmo lado?* Se o desvio é consistentemente positivo ou negativo, é um problema de geometria da mão, não de ouvido.\n\n' +
        '*Desafino mais em que dedo?* Quase sempre é o 4º, e a causa costuma ser o pulso dobrado para dentro.\n\n' +
        '*Atraso ou adianto?* Atraso costuma ser preparação insuficiente; adianto costuma ser ansiedade.\n\n' +
        'Quando não há sinal captado, a medição registra **ausência**, e não zero. Um silêncio não é uma nota perfeitamente afinada, e o sistema não finge que é.',
    },
    {
      kind: 'MARKDOWN',
      id: 'vl16_board',
      markdown:
        '## O board de prática\n\n' +
        'O acervo de partituras está organizado em **quatro níveis**, e todas as obras nele são de **domínio público** — nada que exija licença entra no repertório da plataforma.\n\n' +
        '**Nível 1** — primeira posição, tonalidades com poucos acidentes, détaché e legato simples, âmbito estreito. Melodias tradicionais e peças curtas.\n\n' +
        '**Nível 2** — primeira posição com maior exigência rítmica, articulações variadas, tonalidades com mais acidentes.\n\n' +
        '**Nível 3** — mudança de posição, cordas duplas simples, vibrato, frases longas.\n\n' +
        '**Nível 4** — golpes de arco que saem da corda, posições altas, cordas duplas exigentes, obras de concerto.\n\n' +
        'Escolha uma obra no seu nível, toque-a no simulador, e a medição registra afinação e tempo nota a nota. A pontuação sobe com a repetição — e o que importa nela não é o número, e sim o que ele mostra sobre onde você ainda erra.\n\n' +
        'Não pule nível. Uma obra do nível 3 tocada com técnica de nível 1 não ensina nada e instala hábitos que custarão meses para desfazer.',
    },
    {
      kind: 'CALLOUT',
      id: 'vl16_call',
      type: 'tip',
      title: 'Quinze minutos todos os dias',
      text:
        'Aprendizado motor depende de frequência, não de volume. Quinze minutos diários produzem mais que duas horas uma vez por semana, porque o intervalo entre sessões é quando a consolidação acontece. Se só tem quinze minutos, use-os — não adie para quando tiver duas horas.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'vl16_check',
      question: 'Por que a medição registra ausência, e não zero, quando não há som captado?',
      options: [
        'Por limitação técnica do microfone',
        'Porque silêncio não é nota afinada — registrar zero fingiria um acerto que não houve',
        'Para economizar armazenamento',
        'Porque zero significa erro máximo',
      ],
      correctIndex: 1,
      explanation:
        'Zero desvio significaria afinação perfeita. Ausência de sinal significa que não houve nota. Confundir as duas coisas produziria um relatório falso.',
    },
  ],
};
