/**
 * Os 16 capítulos do curso de Violino.
 *
 * A ordem é a do aprendizado real: primeiro o instrumento e o corpo, depois o
 * som, depois a mão esquerda, depois a leitura, e só então o repertório — que
 * já é o laboratório de prática, organizado nos quatro níveis do acervo.
 *
 * Não se toca antes de saber segurar. Não se afina antes de ouvir. A sequência
 * não é convenção pedagógica: é a ordem em que uma coisa depende da outra.
 */

export interface CapituloViolino {
  numero: number;
  titulo: string;
  descricao: string;
  objetivos: string[];
  competencia: string;
  minutos: number;
  /** Nível do acervo que este capítulo prepara. 0 = anterior ao repertório. */
  nivelDoAcervo: 0 | 1 | 2 | 3 | 4;
}

function cap(
  numero: number,
  titulo: string,
  descricao: string,
  objetivos: string[],
  competencia: string,
  minutos: number,
  nivelDoAcervo: 0 | 1 | 2 | 3 | 4
): CapituloViolino {
  return { numero, titulo, descricao, objetivos, competencia, minutos, nivelDoAcervo };
}

export const CAPITULOS_VIOLINO: CapituloViolino[] = [
  cap(1, 'O instrumento',
    'As partes do violino e do arco, o que cada uma faz, e o que pode dar errado nelas.',
    ['Nomear as partes do violino e do arco.',
     'Explicar o caminho da vibração da corda até o ar.',
     'Reconhecer os problemas mais comuns de montagem.'],
    'instrumento', 35, 0),

  cap(2, 'Cuidado e afinação',
    'Cravelhas, microafinadores, breu, e como afinar sem forçar nada.',
    ['Afinar as quatro cordas em quintas justas.',
     'Usar cravelha e microafinador na situação certa.',
     'Aplicar breu e conservar o arco e o instrumento.'],
    'instrumento', 30, 0),

  cap(3, 'Postura do corpo',
    'Pés, coluna, ombros e cabeça — antes de qualquer coisa ter a ver com música.',
    ['Adotar a postura de pé e sentado sem tensão.',
     'Posicionar o violino sem levantar o ombro esquerdo.',
     'Reconhecer os sinais precoces de tensão prejudicial.'],
    'postura', 40, 0),

  cap(4, 'A mão direita e o arco',
    'Como segurar o arco, e por que a mão precisa continuar flexível.',
    ['Montar a empunhadura do arco dedo a dedo.',
     'Manter a flexibilidade do polegar e do mínimo.',
     'Reconhecer as empunhaduras travadas e corrigi-las.'],
    'arco', 45, 0),

  cap(5, 'O som: velocidade, peso e ponto de contato',
    'Os três controles que produzem o som, e como eles se compensam.',
    ['Relacionar velocidade do arco, peso e ponto de contato.',
     'Produzir som cheio na corda solta.',
     'Diagnosticar som esganiçado, vidrado ou fraco pela causa.'],
    'arco', 45, 1),

  cap(6, 'Divisões do arco e mudança de corda',
    'Talão, meio e ponta; arco inteiro, metade, terço; e a passagem entre cordas.',
    ['Executar com controle nas três regiões do arco.',
     'Distribuir o arco conforme a duração escrita.',
     'Mudar de corda sem ruído e sem quebra de som.'],
    'arco', 45, 1),

  cap(7, 'A mão esquerda: forma e primeira posição',
    'A moldura da mão, o polegar, e onde cada dedo cai na primeira posição.',
    ['Montar a forma da mão esquerda sem apertar.',
     'Situar os quatro dedos na primeira posição.',
     'Explicar por que a distância entre os dedos diminui ao subir.'],
    'mao-esquerda', 50, 1),

  cap(8, 'Afinação e o ouvido que corrige',
    'Ouvir a nota antes de tocá-la, e usar as cordas soltas como referência.',
    ['Afinar cada dedo contra a corda solta correspondente.',
     'Reconhecer desvio de afinação de ouvido e corrigir na hora.',
     'Usar ressonância simpática como verificação.'],
    'afinacao', 45, 1),

  cap(9, 'Leitura aplicada ao violino',
    'A pauta em clave de sol, a tablatura de dedilhado, e como ler uma parte.',
    ['Ler notas em primeira posição na clave de sol.',
     'Interpretar dedilhado, arcada e indicação de corda.',
     'Reconhecer os sinais de arco para cima e para baixo.'],
    'leitura', 40, 1),

  cap(10, 'Articulações fundamentais',
    'Détaché, legato, staccato e martelé — o que a mão direita faz em cada um.',
    ['Executar détaché uniforme.',
     'Ligar notas numa arcada só com som contínuo.',
     'Distinguir staccato de martelé pela mecânica.'],
    'arco', 45, 2),

  cap(11, 'Escalas e arpejos em uma oitava',
    'O trabalho diário que organiza a mão e o ouvido ao mesmo tempo.',
    ['Executar escalas maiores de uma oitava em primeira posição.',
     'Tocar arpejos correspondentes.',
     'Montar uma rotina curta de estudo diário.'],
    'tecnica', 45, 2),

  cap(12, 'Mudança de posição',
    'A terceira posição, o deslize preparatório e o silêncio da mudança.',
    ['Executar a mudança para a terceira posição.',
     'Preparar a mudança com o polegar.',
     'Fazer a mudança sem que o deslize seja audível.'],
    'mao-esquerda', 50, 3),

  cap(13, 'Cordas duplas',
    'Duas cordas ao mesmo tempo: pressão do arco, plano e afinação relativa.',
    ['Encontrar o plano de arco entre duas cordas.',
     'Executar terças e sextas em cordas duplas.',
     'Afinar o intervalo pelo batimento, e não por dedo.'],
    'tecnica', 50, 3),

  cap(14, 'Vibrato',
    'O movimento, seus três tipos, e quando começar a usá-lo.',
    ['Distinguir vibrato de braço, de pulso e de dedo.',
     'Executar o movimento lento e regular antes de acelerar.',
     'Aplicar vibrato sem perder a afinação central.'],
    'tecnica', 45, 3),

  cap(15, 'Golpes de arco avançados',
    'Spiccato, sautillé, ricochete e colé — quando o arco sai da corda.',
    ['Executar spiccato controlado.',
     'Distinguir spiccato de sautillé pela origem do movimento.',
     'Reconhecer o ponto do arco em que cada golpe funciona.'],
    'arco', 45, 4),

  cap(16, 'Estudar sozinho, e o board de prática',
    'Como organizar o estudo, medir o próprio progresso e usar o acervo por níveis.',
    ['Montar uma sessão de estudo com objetivo definido.',
     'Usar a medição de afinação e tempo como diagnóstico, não como nota.',
     'Escolher repertório no nível certo e progredir por ele.'],
    'estudo', 40, 4),
];

export const COMPETENCIAS_VIOLINO = Array.from(
  new Set(CAPITULOS_VIOLINO.map((c) => c.competencia))
).sort();

export const CARGA_VIOLINO = Math.ceil(
  CAPITULOS_VIOLINO.reduce((a, c) => a + c.minutos, 0) / 60
);
