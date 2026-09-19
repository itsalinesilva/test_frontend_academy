/**
 * Os 20 capítulos do curso de História da Música Ocidental.
 *
 * A periodização é a consolidada na disciplina: parte da herança da
 * Antiguidade e do canto cristão, atravessa a invenção da polifonia, o
 * Renascimento, o Barroco, o Classicismo, o Romantismo e chega ao século XX.
 *
 * Não é uma cronologia de nomes. Cada capítulo pergunta o que mudou no modo
 * de organizar o som, e por que mudou — que é o que faz história da música
 * ser diferente de lista de compositores.
 */

export interface CapituloOcidental {
  numero: number;
  titulo: string;
  periodo: string;
  descricao: string;
  objetivos: string[];
  competencia: string;
  minutos: number;
}

function cap(
  numero: number,
  titulo: string,
  periodo: string,
  descricao: string,
  objetivos: string[],
  competencia: string,
  minutos: number
): CapituloOcidental {
  return { numero, titulo, periodo, descricao, objetivos, competencia, minutos };
}

export const CAPITULOS_OCIDENTAL: CapituloOcidental[] = [
  cap(1, 'A música no fim do mundo antigo', 'Antiguidade — séc. IV a.C. a VI d.C.',
    'A herança grega, o sistema de tetracordes e modos, e o que a igreja cristã primitiva recebeu e recusou dela.',
    ['Descrever o sistema musical grego e a doutrina do ethos.',
     'Explicar o que a teoria medieval herdou da Antiguidade e o que interpretou mal.',
     'Situar a formação do canto cristão entre a sinagoga e o mundo greco-romano.'],
    'antiguidade', 45),

  cap(2, 'Canto litúrgico e canto secular na Idade Média', 'Séc. VI a XIII',
    'O cantochão: como se organizou a liturgia, que formas o canto assumiu, e o que se cantava fora da igreja.',
    ['Descrever a estrutura do Ofício e da Missa.',
     'Distinguir canto silábico, neumático e melismático.',
     'Reconhecer os oito modos e a função da final e da repercussão.',
     'Situar trovadores, troveiros e Minnesänger na monodia secular.'],
    'medieval', 55),

  cap(3, 'Os primórdios da polifonia e o século XIII', 'Séc. IX a XIII',
    'A invenção da simultaneidade: do organum paralelo à escola de Notre Dame e ao motete.',
    ['Descrever a passagem do organum paralelo ao melismático.',
     'Explicar os modos rítmicos e o problema que eles resolveram.',
     'Caracterizar o organum de Notre Dame, o conductus e o motete.'],
    'medieval', 55),

  cap(4, 'Música francesa e italiana do século XIV', 'Séc. XIV',
    'A ars nova: notação mensural, isorritmia, e o Trecento italiano.',
    ['Explicar o que a notação mensural tornou possível.',
     'Descrever a técnica isorrítmica.',
     'Distinguir a ars nova francesa do Trecento italiano.',
     'Definir musica ficta e o problema que ela revela.'],
    'medieval', 50),

  cap(5, 'Da Idade Média ao Renascimento', 'Séc. XV',
    'A música inglesa, a contenance angloise e a escola do ducado da Borgonha.',
    ['Explicar a influência inglesa sobre o continente.',
     'Caracterizar a chanson borgonhesa e a missa cíclica.',
     'Descrever a técnica do fauxbourdon.'],
    'renascimento', 45),

  cap(6, 'A era renascentista: de Ockeghem a Josquin', 'c. 1450–1520',
    'A imitação generalizada e a subordinação da música ao texto.',
    ['Descrever a textura imitativa a quatro vozes.',
     'Explicar a mudança na relação entre música e palavra.',
     'Caracterizar a missa de paródia e a de cantus firmus.'],
    'renascimento', 50),

  cap(7, 'Novas correntes no século XVI', 'c. 1520–1600',
    'Os estilos nacionais, o madrigal e a emancipação da música instrumental.',
    ['Descrever o madrigal italiano e o madrigalismo.',
     'Distinguir chanson, Lied e villancico.',
     'Caracterizar ricercare, canzona, tento e variação.'],
    'renascimento', 55),

  cap(8, 'Música sacra no Renascimento tardio', 'c. 1520–1600',
    'Reforma, Contra-Reforma e a escola veneziana.',
    ['Explicar o coral luterano e sua função.',
     'Descrever o que o Concílio de Trento decidiu sobre a música.',
     'Caracterizar o estilo policoral veneziano.'],
    'renascimento', 50),

  cap(9, 'O primeiro período barroco', 'c. 1600–1650',
    'A monodia acompanhada, o baixo contínuo e a invenção da ópera.',
    ['Explicar a passagem da polifonia à monodia acompanhada.',
     'Descrever o baixo contínuo e o que ele implica.',
     'Situar o nascimento da ópera e o papel do recitativo.',
     'Distinguir prima e seconda prattica.'],
    'barroco', 55),

  cap(10, 'Ópera e música vocal no barroco médio', 'c. 1650–1700',
    'A ópera fora da Itália, a cantata, o oratório e a separação entre ária e recitativo.',
    ['Descrever a ária da capo e sua função dramática.',
     'Distinguir ópera italiana, francesa e inglesa do período.',
     'Caracterizar cantata e oratório.'],
    'barroco', 50),

  cap(11, 'Música instrumental no barroco tardio', 'c. 1650–1750',
    'Suíte, sonata, concerto: as formas que a música sem texto criou para si.',
    ['Descrever a suíte e suas danças.',
     'Distinguir sonata da chiesa e da camera.',
     'Explicar o concerto grosso e o ritornello.',
     'Caracterizar a fuga e o coral de órgão.'],
    'barroco', 55),

  cap(12, 'A primeira metade do século XVIII', 'c. 1700–1750',
    'Vivaldi, Rameau, Bach e Händel: o ponto alto e o fim do barroco.',
    ['Descrever a contribuição de Vivaldi ao concerto.',
     'Explicar a teoria harmônica de Rameau e seu alcance.',
     'Caracterizar a obra instrumental e vocal de Bach.',
     'Situar Händel entre a ópera italiana e o oratório inglês.'],
    'barroco', 60),

  cap(13, 'Origens do estilo clássico', 'c. 1730–1770',
    'O estilo galante, o sensível, e a formação da sonata, da sinfonia e do concerto.',
    ['Explicar a reação ao contraponto barroco.',
     'Descrever a forma sonata e sua lógica tonal.',
     'Situar a reforma da ópera e o que ela corrigia.'],
    'classicismo', 55),

  cap(14, 'O final do século XVIII', 'c. 1770–1800',
    'Haydn e Mozart: a maturidade do estilo clássico.',
    ['Caracterizar o quarteto de cordas e a sinfonia de Haydn.',
     'Descrever a síntese operística de Mozart.',
     'Explicar o desenvolvimento temático como procedimento.'],
    'classicismo', 55),

  cap(15, 'Beethoven', '1770–1827',
    'As três fases, e a obra que empurrou o classicismo até o limite.',
    ['Descrever as três fases da produção de Beethoven.',
     'Explicar a ampliação da forma sonata.',
     'Situar a Nona Sinfonia como ponto de virada.'],
    'classicismo', 50),

  cap(16, 'O século XIX: romantismo e música vocal', 'c. 1800–1850',
    'O Lied, a música coral e a nova relação entre poesia e música.',
    ['Distinguir classicismo de romantismo como atitude.',
     'Descrever o Lied e o ciclo de canções.',
     'Explicar o papel do piano como parceiro da voz.'],
    'romantismo', 50),

  cap(17, 'O século XIX: música instrumental', 'c. 1800–1890',
    'A peça característica, a música de câmara e o poema sinfônico.',
    ['Caracterizar a peça curta para piano.',
     'Explicar a música de programa e o poema sinfônico.',
     'Descrever a tensão entre forma herdada e expressão.'],
    'romantismo', 55),

  cap(18, 'O século XIX: ópera e drama musical', 'c. 1800–1890',
    'Grand opéra, bel canto, Verdi e o drama musical de Wagner.',
    ['Distinguir as escolas operísticas francesa e italiana.',
     'Descrever a trajetória dramática de Verdi.',
     'Explicar o leitmotiv e a melodia contínua.'],
    'romantismo', 55),

  cap(19, 'O fim de uma era', 'c. 1880–1918',
    'Pós-romantismo, nacionalismos, impressionismo e verismo.',
    ['Descrever a ampliação da orquestra e da harmonia.',
     'Explicar o nacionalismo musical e suas fontes.',
     'Caracterizar a harmonia impressionista.',
     'Situar o verismo na ópera italiana.'],
    'moderno', 55),

  cap(20, 'O século XX', 'c. 1900–2000',
    'A ruptura tonal, o neoclassicismo, o serialismo e o que veio depois.',
    ['Explicar a dissolução da tonalidade e suas causas.',
     'Descrever atonalidade livre e método dodecafônico.',
     'Caracterizar o neoclassicismo e o papel de Stravinsky.',
     'Situar as correntes do pós-guerra.'],
    'moderno', 60),
];

export const COMPETENCIAS_OCIDENTAL = Array.from(
  new Set(CAPITULOS_OCIDENTAL.map((c) => c.competencia))
).sort();

export const CARGA_OCIDENTAL = Math.ceil(
  CAPITULOS_OCIDENTAL.reduce((a, c) => a + c.minutos, 0) / 60
);
