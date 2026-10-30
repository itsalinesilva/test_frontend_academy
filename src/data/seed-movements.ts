import { MusicalMovement } from '../domain/atlas-map';

/**
 * MOVIMENTOS — o que estava acontecendo, e não quem estava vivo.
 *
 * A DIFERENÇA ENTRE ERA E MOVIMENTO
 * ---------------------------------
 * Era é recorte de tempo; movimento é recorte de **propósito**. Dois
 * compositores do mesmo Barroco podiam estar resolvendo problemas diferentes,
 * e é o movimento que separa um do outro.
 *
 * Por isso o marcador de movimento lista **fundadores e influentes**, e não
 * todos os contemporâneos: a pergunta é "quem fez isto acontecer".
 *
 * TEXTO AUTORAL, COMO O RESTO
 * ---------------------------
 * As descrições são escritas aqui. Nenhuma obra de referência é citada — o
 * que se transmite é o conteúdo, na forma da plataforma.
 *
 * OS FUNDADORES SÃO IDS DO ACERVO
 * -------------------------------
 * Apontam para compositores que existem em `seed-acervo.ts`. Fundador que não
 * esteja lá vira um movimento sem ninguém dentro, e
 * `checkMovimentoTemFundador` recusa.
 */
export const SEED_MOVEMENTS: MusicalMovement[] = [
  {
    id: 'mov_contraponto_tardio',
    slug: 'contraponto-tardio',
    name: 'Contraponto tardio',
    description:
      'Fuga, cânone e invenção deixam de ser exercício de escola e viram forma de pensar. É a resposta alemã ao problema que o baixo contínuo tinha aberto: como manter a independência das linhas depois que a harmonia passou a governar o conjunto. A solução foi fazer cada voz ser, ao mesmo tempo, melodia e função harmônica.',
    eraId: 'era_barroco',
    regionIds: ['reg_europa_ocidental'],
    founderComposerIds: ['bach-johann-sebastian', 'pachelbel-johann'],
    generoIds: ['fuga', 'suite'],
    years: 'c. 1680 – 1750',
  },
  {
    id: 'mov_concerto_italiano',
    slug: 'concerto-italiano',
    name: 'Concerto italiano',
    description:
      'O jogo entre um solista e o conjunto vira princípio de forma. Três movimentos, o ritornello que volta transformado, e a descoberta de que contraste organiza o tempo melhor que continuidade. Foi daqui que o resto da Europa copiou o modelo.',
    eraId: 'era_barroco',
    regionIds: ['reg_europa_ocidental'],
    founderComposerIds: ['vivaldi-antonio'],
    generoIds: ['concerto'],
    years: 'c. 1700 – 1740',
  },
  {
    id: 'mov_oratorio_ingles',
    slug: 'oratorio-ingles',
    name: 'Oratório inglês',
    description:
      'Drama sacro cantado em inglês, sem cena e sem figurino, para um público que já não queria ópera italiana. O coro deixa de comentar e passa a agir — e é essa mudança que faz o gênero durar.',
    eraId: 'era_barroco',
    regionIds: ['reg_europa_ocidental'],
    founderComposerIds: ['handel-georg-friedrich'],
    generoIds: ['oratorio'],
    years: 'c. 1730 – 1760',
  },
  {
    id: 'mov_classicismo_vienense',
    slug: 'classicismo-vienense',
    name: 'Classicismo vienense',
    description:
      'A forma sonata como maneira de argumentar: apresentar, pôr em conflito, resolver. Sinfonia e quarteto de cordas deixam de ser divertimento e passam a sustentar pensamento longo. O equilíbrio entre clareza e tensão é o assunto inteiro.',
    eraId: 'era_classicismo',
    regionIds: ['reg_europa_ocidental'],
    founderComposerIds: ['haydn-joseph', 'mozart-wolfgang-amadeus', 'beethoven-ludwig-van'],
    generoIds: ['sinfonia', 'sonata', 'quarteto'],
    years: 'c. 1750 – 1820',
  },
  {
    id: 'mov_piano_romantico',
    slug: 'piano-romantico',
    name: 'Piano romântico',
    description:
      'O instrumento ganha peso, alcance e pedal, e a escrita muda com ele: a peça curta de caráter passa a caber um mundo. Noturno, estudo e peça de álbum trocam a arquitetura longa pela intensidade concentrada.',
    eraId: 'era_romantismo',
    regionIds: ['reg_europa_ocidental', 'reg_europa_oriental'],
    founderComposerIds: ['chopin-frederic', 'schumann-robert'],
    generoIds: ['noturno', 'estudo'],
    years: 'c. 1820 – 1870',
  },
  {
    id: 'mov_nacionalismo_romantico',
    slug: 'nacionalismo-romantico',
    name: 'Nacionalismo romântico',
    description:
      'Compositores fora do eixo germânico-italiano passam a escrever a partir da música que se ouvia em casa — modo, dança e fala locais entram na sala de concerto. Não é folclore citado: é outra gramática disputando espaço com a que vinha sendo tratada como universal.',
    eraId: 'era_romantismo',
    regionIds: ['reg_europa_oriental', 'reg_escandinavia'],
    founderComposerIds: ['tchaikovsky-piotr-ilitch', 'grieg-edvard'],
    generoIds: ['suite', 'sinfonia'],
    years: 'c. 1850 – 1910',
  },
];
