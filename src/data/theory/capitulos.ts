/**
 * Os 58 capítulos do curso de Teoria.
 *
 * A SEQUÊNCIA É A DO CAMPO, E É EXAUSTIVA
 * ---------------------------------------
 * Cada capítulo corresponde a um tópico da teoria musical elementar, na ordem
 * em que os conceitos se sustentam. A lista foi montada a partir do escopo
 * consolidado da disciplina — e é exaustiva de propósito: um curso que pula
 * transporte, modos litúrgicos ou acordes de nona não é um curso de teoria,
 * é uma seleção de teoria.
 *
 * `paginasDeReferencia` registra onde o assunto está no material de estudo
 * interno. Serve para conferência editorial e NÃO aparece para o aluno.
 */

export interface DefinicaoCapitulo {
  numero: number;
  /** Numeração romana, como na tradição dos tratados. */
  romano: string;
  titulo: string;
  descricao: string;
  objetivos: string[];
  competencia: string;
  /**
   * Competencias que o capitulo tambem cobre, quando o assunto nao cabe numa
   * etiqueta so. O capitulo XVIII ensina a escala maior E a armadura; o LI
   * ensina a tetrade E a funcao de dominante.
   */
  competenciasAdicionais?: string[];
  minutos: number;
  /** Faixa no material de estudo. Uso interno. */
  paginasDeReferencia: [number, number];
}

const R = [
  '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
  'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX',
  'XXXI', 'XXXII', 'XXXIII', 'XXXIV', 'XXXV', 'XXXVI', 'XXXVII', 'XXXVIII', 'XXXIX', 'XL',
  'XLI', 'XLII', 'XLIII', 'XLIV', 'XLV', 'XLVI', 'XLVII', 'XLVIII', 'XLIX', 'L',
  'LI', 'LII', 'LIII', 'LIV', 'LV', 'LVI', 'LVII', 'LVIII',
];

function cap(
  numero: number,
  titulo: string,
  descricao: string,
  objetivos: string[],
  competencia: string,
  minutos: number,
  paginas: [number, number],
  competenciasAdicionais?: string[]
): DefinicaoCapitulo {
  return {
    numero,
    romano: R[numero],
    titulo,
    descricao,
    objetivos,
    competencia,
    ...(competenciasAdicionais ? { competenciasAdicionais } : {}),
    minutos,
    paginasDeReferencia: paginas,
  };
}

export const CAPITULOS_TEORIA: DefinicaoCapitulo[] = [
  cap(1, 'Características da música e do som',
    'O que a música organiza, e as quatro propriedades que todo som tem ao mesmo tempo.',
    ['Distinguir altura, duração, intensidade e timbre.',
     'Explicar por que a altura depende da frequência e não do volume.',
     'Situar melodia, harmonia, contraponto e ritmo como dimensões da organização musical.'],
    'fundamentos', 30, [11, 12]),

  cap(2, 'Notas e pauta',
    'O sistema de escrita: as sete notas, a pauta e as linhas suplementares.',
    ['Nomear as sete notas nas duas nomenclaturas em uso.',
     'Situar uma nota na pauta pela linha ou pelo espaço.',
     'Usar linhas suplementares sem perder a referência.'],
    'notacao', 30, [13, 15]),

  cap(3, 'Clave de sol e clave de fá na quarta linha',
    'As duas claves mais usadas, e o que cada uma fixa.',
    ['Ler notas em clave de sol e em clave de fá na quarta linha.',
     'Explicar por que a mesma posição muda de nome conforme a clave.',
     'Relacionar as duas claves pelo dó central.'],
    'notacao', 35, [16, 19]),

  cap(4, 'Valores',
    'As figuras, suas proporções, a notação atual e os valores antigos.',
    ['Relacionar as sete figuras pela proporção de dois para um.',
     'Reconhecer a divisão binária e a ternária dos valores.',
     'Identificar os valores antigos e os valores extremos.'],
    'duracao', 40, [20, 29]),

  cap(5, 'Semitom, tom e alterações',
    'A menor distância do sistema e os cinco sinais que alteram a altura.',
    ['Medir distâncias em tons e semitons.',
     'Aplicar os cinco acidentes e conhecer o alcance de cada um.',
     'Distinguir alteração fixa, ocorrente e de precaução.'],
    'alturas', 40, [30, 39]),

  cap(6, 'Ponto de aumento',
    'O sinal que acrescenta metade do valor — e o que acontece quando há dois.',
    ['Aplicar ponto simples, duplo e triplo.',
     'Calcular a duração resultante em cada caso.',
     'Reconhecer o ponto em pausas.'],
    'duracao', 25, [40, 44]),

  cap(7, 'Ponto de diminuição',
    'O ponto que encurta, e por que ele não é o mesmo sinal do aumento.',
    ['Distinguir o ponto de aumento do de diminuição pela posição.',
     'Executar a articulação que o ponto de diminuição indica.'],
    'duracao', 20, [45, 46]),

  cap(8, 'Legato',
    'A ligadura de expressão, a de valor e a de portamento.',
    ['Distinguir ligadura de expressão de ligadura de valor.',
     'Executar o legato conforme o instrumento.',
     'Reconhecer a ligadura de portamento.'],
    'fraseado', 25, [47, 49]),

  cap(9, 'Claves de dó e clave de fá na terceira linha',
    'As claves restantes do sistema, e a que instrumento cada uma serve.',
    ['Ler nas claves de dó em terceira e quarta linhas.',
     'Relacionar cada clave ao registro que ela atende.',
     'Transpor mentalmente entre claves.'],
    'notacao', 40, [50, 59]),

  cap(10, 'Intervalos justos, maiores e menores',
    'A distância entre duas notas: o número e a qualidade.',
    ['Classificar um intervalo pelo número e pela qualidade.',
     'Identificar quais intervalos admitem a qualidade justa.',
     'Reconhecer intervalos de ouvido.'],
    'intervalos', 45, [60, 69]),

  cap(11, 'Intervalos aumentados e diminutos',
    'O que acontece quando um intervalo é alargado ou encolhido.',
    ['Construir intervalos aumentados e diminutos.',
     'Reconhecer o trítono e explicar sua instabilidade.',
     'Distinguir enarmonia de identidade de intervalo.'],
    'intervalos', 35, [70, 74]),

  cap(12, 'Intervalos compostos',
    'Os intervalos que ultrapassam a oitava.',
    ['Reduzir um intervalo composto ao simples correspondente.',
     'Nomear nona, décima e décima primeira.',
     'Reconhecer que a qualidade se mantém na redução.'],
    'intervalos', 25, [74, 75]),

  cap(13, 'Inversão de intervalos',
    'A regra dos nove e a troca de qualidade.',
    ['Inverter um intervalo e prever número e qualidade.',
     'Aplicar a inversão para reconhecer intervalos grandes.',
     'Explicar por que os justos permanecem justos.'],
    'intervalos', 30, [76, 78]),

  cap(14, 'Enarmonia',
    'Duas grafias, o mesmo som — e por que a escolha importa.',
    ['Encontrar o equivalente enarmônico de qualquer nota.',
     'Explicar a função que a grafia informa.',
     'Reconhecer enarmonia de tonalidades.'],
    'alturas', 30, [79, 82]),

  cap(15, 'Escala e grau',
    'A sequência ordenada de notas e o nome de cada posição.',
    ['Definir escala e identificar o grau de uma nota.',
     'Nomear os sete graus e descrever a função de cada um.',
     'Distinguir grau conjunto de grau disjunto.'],
    'escalas', 35, [83, 88]),

  cap(16, 'Série harmônica',
    'A origem física do timbre, dos intervalos e do próprio sistema.',
    ['Descrever a série harmônica e suas proporções.',
     'Relacionar os primeiros harmônicos aos intervalos consonantes.',
     'Explicar a origem do temperamento a partir da série.'],
    'fundamentos', 40, [89, 94]),

  cap(17, 'Consonância e dissonância de intervalos',
    'Por que alguns intervalos soam em repouso e outros pedem resolução.',
    ['Classificar intervalos em consonantes perfeitos, imperfeitos e dissonantes.',
     'Relacionar a classificação à série harmônica.',
     'Reconhecer a dissonância de ouvido.'],
    'intervalos', 30, [95, 97]),

  cap(18, 'Escalas maiores',
    'O padrão de tons e semitons, as armaduras e o ciclo das quintas.',
    ['Construir a escala maior em qualquer tonalidade.',
     'Determinar a armadura pelo ciclo das quintas.',
     'Identificar a tonalidade a partir da armadura.'],
    'escalas', 55, [98, 112], ['armaduras']),

  cap(19, 'Compasso',
    'Como o pulso se agrupa, e o que a fórmula informa.',
    ['Ler a fórmula de compasso simples e composta.',
     'Distinguir compasso simples, composto e alternado.',
     'Reconhecer a unidade de tempo e a de compasso.'],
    'metrica', 50, [113, 125]),

  cap(20, 'Métrica',
    'A organização do tempo em unidades regulares.',
    ['Analisar a métrica de um trecho.',
     'Distinguir métrica binária, ternária e quaternária.',
     'Reconhecer a anacruse.'],
    'metrica', 35, [126, 130]),

  cap(21, 'Escalas menores',
    'As três formas da menor e a relação com a maior.',
    ['Construir menor natural, harmônica e melódica.',
     'Relacionar cada maior à sua relativa menor.',
     'Distinguir relativa de homônima.'],
    'escalas', 50, [131, 140]),

  cap(22, 'Acento métrico, síncope e contratempo',
    'O acento natural e os dois modos de deslocá-lo.',
    ['Identificar o tempo forte e a acentuação natural.',
     'Distinguir síncope de contratempo pela posição do ataque.',
     'Executar ambos com precisão.'],
    'subdivisao', 40, [141, 150]),

  cap(23, 'Escala maior — formas harmônica e melódica',
    'As alterações que a escala maior também admite.',
    ['Construir a maior harmônica e a maior melódica.',
     'Reconhecer o efeito do sexto grau abaixado.',
     'Comparar com as formas correspondentes da menor.'],
    'escalas', 30, [151, 156]),

  cap(24, 'Tons vizinhos',
    'As tonalidades aparentadas, e por que a modulação prefere as próximas.',
    ['Identificar os tons vizinhos de uma tonalidade.',
     'Relacionar vizinhança à diferença de acidentes.',
     'Prever para onde uma peça tende a modular.'],
    'tonalidade', 30, [157, 160]),

  cap(25, 'Modulação',
    'A mudança de centro tonal no curso de uma peça.',
    ['Reconhecer uma modulação e nomear o tom de chegada.',
     'Distinguir modulação de empréstimo modal.',
     'Identificar o acorde pivô.'],
    'tonalidade', 40, [161, 163]),

  cap(26, 'Modos litúrgicos',
    'Os oito modos medievais, autênticos e plagais.',
    ['Nomear os modos autênticos e plagais.',
     'Identificar a final e a repercussão de cada modo.',
     'Distinguir os modos medievais dos modos gregos modernos.'],
    'escalas-especiais', 45, [164, 174]),

  cap(27, 'Transporte',
    'Escrever ou executar uma peça em outra altura.',
    ['Transportar por intervalo e por mudança de clave.',
     'Ajustar a armadura ao transportar.',
     'Reconhecer quando o transporte é exigido.'],
    'transposicao', 40, [175, 180]),

  cap(28, 'Teoria alemã dos compassos',
    'Outra leitura do compasso, e o que ela esclarece.',
    ['Descrever a classificação alemã dos compassos.',
     'Comparar com a nomenclatura de tradição latina.'],
    'metrica', 25, [181, 182]),

  cap(29, 'Transposição dos modos litúrgicos',
    'Os modos fora de sua altura original.',
    ['Transpor um modo litúrgico mantendo sua estrutura.',
     'Reconhecer um modo transposto na partitura.'],
    'escalas-especiais', 25, [183, 186]),

  cap(30, 'Andamento',
    'A velocidade: termos, metrônomo e as indicações de mudança.',
    ['Interpretar termos de andamento e relacioná-los ao metrônomo.',
     'Reconhecer as indicações de mudança gradual e súbita.',
     'Explicar a diferença entre termo e indicação metronômica.'],
    'andamento', 40, [187, 195]),

  cap(31, 'Escalas artificiais',
    'Escalas construídas por princípio, e não por tradição.',
    ['Construir a escala de tons inteiros e a octatônica.',
     'Reconhecer a simetria e o que ela produz.',
     'Identificar escalas artificiais em repertório.'],
    'escalas-especiais', 35, [196, 204]),

  cap(32, 'Quiálteras',
    'Quando a subdivisão contraria o compasso.',
    ['Executar tercinas, quintinas e demais quiálteras.',
     'Distinguir quiáltera de aumento e de diminuição.',
     'Ler quiálteras em compasso composto.'],
    'subdivisao', 40, [205, 212]),

  cap(33, 'Dinâmica',
    'A intensidade escrita, e o caráter relativo dela.',
    ['Aplicar a escala de dinâmica do pianíssimo ao fortíssimo.',
     'Executar crescendo, diminuendo e acentos.',
     'Explicar por que a dinâmica é relativa à obra.'],
    'andamento', 35, [213, 221]),

  cap(34, 'Expressão',
    'As indicações de caráter, e o que elas pedem além das notas.',
    ['Interpretar as indicações de caráter mais frequentes.',
     'Distinguir indicação de expressão de indicação de andamento.'],
    'andamento', 30, [222, 226]),

  cap(35, 'Escalas exóticas',
    'Escalas de tradições fora do sistema tonal europeu.',
    ['Reconhecer as principais escalas de outras tradições.',
     'Relacionar cada uma à sua distribuição de intervalos.',
     'Evitar a leitura tonal de material não tonal.'],
    'escalas-especiais', 40, [227, 240]),

  cap(36, 'Abreviaturas',
    'Os sinais que encurtam a escrita sem mudar o que se toca.',
    ['Ler os sinais de repetição, tremolo e compasso igual.',
     'Executar as abreviaturas de figuras.',
     'Reconhecer a barra de repetição e as casas.'],
    'notacao', 40, [241, 257]),

  cap(37, 'Termos especiais',
    'O vocabulário que aparece nas partituras e não se deduz.',
    ['Reconhecer os termos italianos mais frequentes.',
     'Distinguir termos de andamento, de caráter e de execução.'],
    'notacao', 35, [258, 266]),

  cap(38, 'Escala geral',
    'A extensão completa das alturas escritas, e como nomeá-las.',
    ['Situar qualquer altura na escala geral.',
     'Relacionar registro e clave.',
     'Reconhecer os limites dos instrumentos na escala geral.'],
    'notacao', 30, [267, 271]),

  cap(39, 'Nomenclatura das notas',
    'Os sistemas de nomes e de índices em uso.',
    ['Converter entre os sistemas de nomenclatura.',
     'Usar índices acústicos corretamente.',
     'Reconhecer a nomenclatura alemã.'],
    'notacao', 25, [272, 273]),

  cap(40, 'Acordes de quinta',
    'As tríades: construção e as quatro qualidades.',
    ['Construir as quatro qualidades de tríade.',
     'Reconhecer as tríades sobre os graus da escala.',
     'Identificar uma tríade de ouvido.'],
    'acordes', 45, [274, 284]),

  cap(41, 'Acordes de quinta alterados',
    'Tríades com a quinta modificada.',
    ['Construir tríades de quinta aumentada e diminuta.',
     'Reconhecer o efeito da alteração.',
     'Situar o acorde alterado no encadeamento.'],
    'acordes', 30, [285, 286]),

  cap(42, 'Inversão dos acordes de quinta',
    'O que muda quando o baixo troca.',
    ['Identificar a inversão pelo baixo.',
     'Nomear estado fundamental, primeira e segunda inversão.',
     'Explicar a instabilidade da segunda inversão.'],
    'acordes', 35, [287, 290]),

  cap(43, 'Cifragem dos acordes de quinta',
    'O sistema de símbolos que descreve o acorde.',
    ['Ler e escrever cifras de tríades.',
     'Interpretar a indicação de baixo invertido.',
     'Converter cifra em notas ao instrumento.'],
    'cifragem', 40, [291, 295]),

  cap(44, 'Ornamentos — apojatura',
    'A nota que toma tempo da principal.',
    ['Executar apojatura breve e longa.',
     'Distinguir apojatura de nota real.',
     'Reconhecer a notação em nota pequena.'],
    'ornamentos', 35, [296, 308]),

  cap(45, 'Ornamentos — mordente',
    'A alternância rápida com a nota vizinha.',
    ['Executar mordente superior e inferior.',
     'Reconhecer o sinal e sua variação.'],
    'ornamentos', 25, [309, 311]),

  cap(46, 'Ornamentos — grupeto',
    'O giro em torno da nota principal.',
    ['Executar grupeto direto e invertido.',
     'Situar o grupeto antes ou depois da nota.'],
    'ornamentos', 25, [312, 318]),

  cap(47, 'Ornamentos — trinado',
    'A alternância contínua, e as convenções de execução.',
    ['Executar o trinado com e sem resolução.',
     'Reconhecer a variação histórica da nota inicial.'],
    'ornamentos', 30, [319, 323]),

  cap(48, 'Ornamentos — arpejo, glissando, portamento e floreio',
    'Os demais recursos de ornamentação.',
    ['Executar arpejo, glissando e portamento.',
     'Reconhecer floreio e cadência melódica.',
     'Distinguir cada recurso pelo sinal.'],
    'ornamentos', 35, [324, 331]),

  cap(49, 'Melodia — movimento das vozes',
    'Como as linhas se movem umas em relação às outras.',
    ['Distinguir movimento direto, contrário e oblíquo.',
     'Reconhecer movimento paralelo e suas restrições.',
     'Analisar a condução de duas vozes.'],
    'fraseado', 40, [332, 337]),

  cap(50, 'Acordes a quatro vozes',
    'A disposição do acorde em soprano, contralto, tenor e baixo.',
    ['Dispor uma tríade a quatro vozes.',
     'Aplicar a duplicação adequada.',
     'Reconhecer posição cerrada e aberta.'],
    'acordes', 45, [338, 345]),

  cap(51, 'Acordes de sétima',
    'A tétrade: construção e as espécies.',
    ['Construir as espécies de acorde de sétima.',
     'Reconhecer a sétima da dominante e sua função.',
     'Identificar a tétrade de ouvido.'],
    'acordes', 45, [346, 353], ['funcoes']),

  cap(52, 'Acordes de sétima alterados',
    'Tétrades com intervalos modificados.',
    ['Construir sétimas com quinta alterada.',
     'Reconhecer o efeito de cada alteração.'],
    'acordes', 30, [354, 355]),

  cap(53, 'Inversão dos acordes de sétima',
    'As três inversões da tétrade.',
    ['Nomear as três inversões pelo baixo.',
     'Cifrar cada inversão corretamente.',
     'Reconhecer a inversão de ouvido.'],
    'acordes', 35, [356, 363]),

  cap(54, 'Acordes de nona',
    'A empilhagem além da sétima.',
    ['Construir acordes de nona maior e menor.',
     'Situar a nona no encadeamento.',
     'Cifrar a nona corretamente.'],
    'acordes', 35, [364, 369]),

  cap(55, 'Outros acordes',
    'Acordes por quartas, por segundas e demais construções.',
    ['Reconhecer acordes não terçais.',
     'Identificar clusters e acordes por quartas.',
     'Situar essas construções historicamente.'],
    'acordes', 35, [370, 372]),

  cap(56, 'Origem, afinidade e enarmonia dos acordes',
    'De onde vem cada acorde, e quais se confundem entre si.',
    ['Explicar a origem dos acordes na série harmônica.',
     'Reconhecer acordes enarmonicamente idênticos.',
     'Usar a enarmonia de acordes na modulação.'],
    'acordes', 40, [373, 376]),

  cap(57, 'Transposição para instrumentos transpositores',
    'Por que a nota escrita e a nota que soa nem sempre coincidem.',
    ['Identificar os principais instrumentos transpositores.',
     'Converter entre som escrito e som real.',
     'Preparar uma parte transposta.'],
    'transposicao', 45, [377, 384]),

  cap(58, 'Notação moderna',
    'Os sinais criados no século XX para o que a notação tradicional não escreve.',
    ['Reconhecer os principais sinais da notação contemporânea.',
     'Ler notação proporcional e gráfica.',
     'Situar a notação moderna em relação à tradicional.'],
    'notacao', 40, [385, 390]),
];

export const TOTAL_DE_CAPITULOS = CAPITULOS_TEORIA.length;

/** Competências distintas cobertas pelo curso. */
export const COMPETENCIAS_TEORIA = Array.from(
  new Set(
    CAPITULOS_TEORIA.flatMap((c) => [c.competencia, ...(c.competenciasAdicionais ?? [])])
  )
).sort();

/** Carga horária total, em horas, arredondada para cima. */
export const CARGA_HORARIA = Math.ceil(
  CAPITULOS_TEORIA.reduce((a, c) => a + c.minutos, 0) / 60
);
