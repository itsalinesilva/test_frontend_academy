import { AcademyCourse, AcademyModule, AcademyLesson, LessonBlock } from '../domain/academy';
import { CourseLevel } from '../domain/types';

/**
 * Curso de Teoria da Música — conteúdo autoral do Conservatório Muscicapa.
 *
 * SOBRE A ORIGEM
 * --------------
 * A SEQUÊNCIA dos doze capítulos foi determinada estudando a progressão
 * consolidada do campo: som → notação → duração → alturas → intervalos →
 * escalas → armaduras → métrica → andamento → subdivisões → acordes →
 * cifragem.
 *
 * Essa ordem não é invenção nem cópia: é a ordem em que os conceitos se
 * sustentam uns nos outros. Não se ensina intervalo antes de altura, nem
 * acorde antes de intervalo, e qualquer curso sério chega à mesma sequência
 * porque a matéria a impõe.
 *
 * O TEXTO é escrito aqui, em linguagem própria. Nenhuma obra é citada, e
 * nenhuma expressão de terceiro é reproduzida — fatos e ideias não são
 * protegidos; expressão é.
 *
 * SOBRE A FORMA
 * -------------
 * Cada lição alterna leitura curta com laboratório que USA o motor de teoria
 * de verdade: o aluno ouve o intervalo, monta o acorde, vê a escala na pauta.
 * Ler sobre uma terça maior e ouvir uma terça maior são duas coisas
 * diferentes, e a segunda é a que fica.
 */

const AUTOR = {
  authorId: 'conservatorio',
  authorName: 'Conservatório Muscicapa',
  authorTitle: 'Cátedra de Teoria Musical',
};

const AGORA = '2026-09-17T00:00:00.000Z';

// ---------------------------------------------------------------------------
// Curso
// ---------------------------------------------------------------------------

export const CURSO_TEORIA: AcademyCourse = {
  id: 'crs_teoria_fundamentos',
  slug: 'teoria-da-musica-fundamentos',
  categoryId: 'cat_teoria',
  categoryName: 'Teoria Musical',
  title: 'Teoria da Música — Fundamentos',
  subtitle: 'Do som à cifra: os doze degraus da gramática musical.',
  description:
    'O percurso completo da teoria elementar, na ordem em que os conceitos se sustentam. ' +
    'Começa no fenômeno físico do som e termina na leitura de uma cifra — passando por notação, ' +
    'duração, intervalos, escalas, armaduras, métrica e acordes. Cada capítulo alterna leitura ' +
    'curta com laboratório sonoro: você ouve o que acabou de ler antes de seguir adiante.',
  level: CourseLevel.FUNDAMENTAL,
  workloadHours: 60,
  ...AUTOR,
  authorBio:
    'A cátedra de teoria reúne o material didático escrito e revisado internamente pelo Conservatório.',
  objectives: [
    'Ler e escrever notação musical em clave de sol e de fá, com fluência.',
    'Identificar intervalos de ouvido e no papel, pelo número e pela qualidade.',
    'Construir escalas maiores e menores em qualquer tonalidade, e reconhecer a armadura.',
    'Compreender compasso, métrica e as subdivisões que geram síncope e contratempo.',
    'Montar tríades e tétrades, reconhecer inversões e ler cifragem.',
  ],
  competencies: [
    'notacao',
    'duracao',
    'alturas',
    'intervalos',
    'escalas',
    'armaduras',
    'metrica',
    'andamento',
    'subdivisao',
    'acordes',
    'cifragem',
  ],
  skills: ['leitura', 'percepcao', 'harmonia'],
  prerequisites: [],
  materials: [],
  curriculumSummary:
    '12 capítulos · 12 lições interativas com laboratório sonoro · livreto de exercícios ao fim de cada capítulo · simulado geral · prova final.',
  assessmentPolicy:
    'Cada capítulo termina com exercícios de fixação. O simulado reúne todas as questões do curso, na ordem estudada. A prova final cobre as mesmas competências com questões próprias.',
  certificatePolicy:
    'Certificado de curso livre emitido ao concluir os doze capítulos com 70% de acerto na prova final.',
  certificateInfo: {
    title: 'Certificado em Teoria da Música — Fundamentos',
    accreditation: 'Curso livre de qualificação profissional. Certificação própria.',
    criteria: 'Conclusão dos doze capítulos e 70% de acerto na prova final.',
  },
  moduleIds: Array.from({ length: 12 }, (_, i) => `mod_teoria_${String(i + 1).padStart(2, '0')}`),
  isPublished: true,
  createdAt: AGORA,
  updatedAt: AGORA,
};

// ---------------------------------------------------------------------------
// Capítulos
// ---------------------------------------------------------------------------

interface DefinicaoCapitulo {
  numero: number;
  titulo: string;
  descricao: string;
  objetivos: string[];
  competencia: string;
  minutos: number;
}

export const CAPITULOS_TEORIA: DefinicaoCapitulo[] = [
  {
    numero: 1,
    titulo: 'O som e suas quatro propriedades',
    descricao:
      'Antes de qualquer símbolo: o que é um som, e quais das suas propriedades a música organiza.',
    objetivos: [
      'Distinguir altura, duração, intensidade e timbre num mesmo som.',
      'Explicar por que a altura depende da frequência e não do volume.',
      'Reconhecer a série harmônica como origem do timbre.',
    ],
    competencia: 'fundamentos',
    minutos: 25,
  },
  {
    numero: 2,
    titulo: 'A pauta, as claves e os nomes das notas',
    descricao: 'O sistema de escrita: onde a nota mora no papel e o que a clave decide.',
    objetivos: [
      'Ler notas em clave de sol e em clave de fá.',
      'Explicar por que existem claves diferentes.',
      'Usar linhas suplementares sem perder a referência.',
    ],
    competencia: 'notacao',
    minutos: 35,
  },
  {
    numero: 3,
    titulo: 'Figuras, pausas e a divisão do tempo',
    descricao: 'A duração escrita: a proporção entre as figuras e o que o ponto de aumento faz.',
    objetivos: [
      'Relacionar as figuras entre si pela proporção de dois para um.',
      'Aplicar ponto de aumento e ligadura de valor.',
      'Ler pausas com a mesma precisão com que se leem notas.',
    ],
    competencia: 'duracao',
    minutos: 35,
  },
  {
    numero: 4,
    titulo: 'Tom, semitom e os acidentes',
    descricao:
      'A menor distância do sistema, e os cinco sinais que alteram a altura de uma nota escrita.',
    objetivos: [
      'Medir distâncias em tons e semitons sobre o teclado.',
      'Aplicar sustenido, bemol, bequadro, dobrado sustenido e dobrado bemol.',
      'Reconhecer enarmonia e explicar por que duas grafias soam igual.',
    ],
    competencia: 'alturas',
    minutos: 35,
  },
  {
    numero: 5,
    titulo: 'Intervalos: número e qualidade',
    descricao:
      'A distância entre duas notas — contada de um jeito e qualificada de outro, e por que são dois passos.',
    objetivos: [
      'Classificar um intervalo pelo número e pela qualidade.',
      'Inverter um intervalo e prever o resultado.',
      'Distinguir consonância de dissonância de ouvido.',
    ],
    competencia: 'intervalos',
    minutos: 45,
  },
  {
    numero: 6,
    titulo: 'Escalas maiores e menores',
    descricao: 'A sequência de tons e semitons que define um modo, e as três formas da menor.',
    objetivos: [
      'Construir a escala maior em qualquer tonalidade pelo padrão de tons e semitons.',
      'Distinguir menor natural, harmônica e melódica.',
      'Identificar o grau de uma nota dentro da escala.',
    ],
    competencia: 'escalas',
    minutos: 45,
  },
  {
    numero: 7,
    titulo: 'Armaduras de clave e tonalidades',
    descricao:
      'Por que os acidentes migram para o começo da pauta, e como o ciclo das quintas os organiza.',
    objetivos: [
      'Determinar a tonalidade a partir da armadura.',
      'Escrever a armadura de qualquer tonalidade maior ou menor.',
      'Relacionar cada tonalidade maior à sua relativa menor.',
    ],
    competencia: 'armaduras',
    minutos: 45,
  },
  {
    numero: 8,
    titulo: 'Compasso, métrica e acentuação',
    descricao: 'Como o tempo se agrupa, e o que a fórmula de compasso realmente informa.',
    objetivos: [
      'Ler a fórmula de compasso e deduzir a unidade de tempo.',
      'Distinguir compasso simples de composto.',
      'Identificar o tempo forte e a acentuação natural.',
    ],
    competencia: 'metrica',
    minutos: 40,
  },
  {
    numero: 9,
    titulo: 'Andamento, dinâmica e agógica',
    descricao: 'As indicações que não estão nas notas: velocidade, intensidade e flexão do tempo.',
    objetivos: [
      'Interpretar indicações de andamento e relacioná-las ao metrônomo.',
      'Aplicar a escala de dinâmica, do pianíssimo ao fortíssimo.',
      'Reconhecer as indicações de mudança gradual de tempo.',
    ],
    competencia: 'andamento',
    minutos: 30,
  },
  {
    numero: 10,
    titulo: 'Quiálteras, síncope e contratempo',
    descricao: 'Quando a subdivisão contraria o compasso — e o efeito rítmico que disso resulta.',
    objetivos: [
      'Executar quiálteras contra a subdivisão natural.',
      'Distinguir síncope de contratempo pela posição do ataque.',
      'Explicar por que a síncope desloca o acento.',
    ],
    competencia: 'subdivisao',
    minutos: 40,
  },
  {
    numero: 11,
    titulo: 'Acordes: tríades e inversões',
    descricao: 'Três notas empilhadas em terças, e o que muda quando o baixo troca.',
    objetivos: [
      'Construir as quatro qualidades de tríade.',
      'Identificar a inversão pelo baixo.',
      'Reconhecer as tríades sobre os graus da escala maior.',
    ],
    competencia: 'acordes',
    minutos: 45,
  },
  {
    numero: 12,
    titulo: 'Cifragem e leitura harmônica',
    descricao: 'O sistema de símbolos que descreve um acorde sem escrevê-lo nota a nota.',
    objetivos: [
      'Ler e escrever cifras de tríades e tétrades.',
      'Interpretar a indicação de baixo invertido.',
      'Converter uma cifra em notas concretas ao teclado.',
    ],
    competencia: 'cifragem',
    minutos: 45,
  },
];

export const MODULOS_TEORIA: AcademyModule[] = CAPITULOS_TEORIA.map((c) => ({
  id: `mod_teoria_${String(c.numero).padStart(2, '0')}`,
  courseId: CURSO_TEORIA.id,
  order: c.numero,
  title: `Capítulo ${c.numero} — ${c.titulo}`,
  description: c.descricao,
  objectives: c.objetivos,
  lessonIds: [`les_teoria_${String(c.numero).padStart(2, '0')}`],
  createdAt: AGORA,
  updatedAt: AGORA,
}));

// ---------------------------------------------------------------------------
// Lições
// ---------------------------------------------------------------------------

/** Blocos de cada lição, por número de capítulo. */
const BLOCOS: Record<number, LessonBlock[]> = {
  1: [
    {
      kind: 'MARKDOWN',
      id: 'c1_intro',
      markdown:
        'Um som é uma perturbação do ar que chega ao ouvido. A música não organiza qualquer perturbação: organiza **quatro propriedades** que todo som tem ao mesmo tempo.\n\n' +
        '**Altura** é o quão grave ou agudo o som é. Depende da **frequência** — quantas vezes por segundo a fonte vibra. Mais vibrações, som mais agudo.\n\n' +
        '**Duração** é quanto tempo o som permanece.\n\n' +
        '**Intensidade** é o quão forte ou fraco ele soa. Depende da **amplitude** da vibração, não da frequência: um som pode ser grave e altíssimo, ou agudo e quase inaudível.\n\n' +
        '**Timbre** é o que distingue um violino de uma flauta tocando a mesma nota, com a mesma força, pelo mesmo tempo.',
    },
    {
      kind: 'CALLOUT',
      id: 'c1_call',
      type: 'warning',
      title: 'A confusão mais comum',
      text:
        'Altura e intensidade são propriedades independentes. Dizer que uma nota é "alta" é ambíguo em português — pode significar aguda ou forte. Em música, "alta" quer dizer aguda. Para intensidade, diz-se forte e fraco.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c1_audio_altura',
      title: 'A mesma duração, alturas diferentes',
      description: 'Três sons de duração idêntica. O que muda é só a frequência.',
      notes: ['C3', 'C4', 'C5'],
      playMode: 'SEQUENCE',
      bpm: 60,
    },
    {
      kind: 'MARKDOWN',
      id: 'c1_serie',
      markdown:
        '## De onde vem o timbre\n\n' +
        'Quando uma corda vibra, ela não produz uma frequência só. Produz a **fundamental** — a que se ouve como a nota — e, junto, uma série de frequências mais agudas em proporções simples: o dobro, o triplo, o quádruplo. São os **harmônicos**.\n\n' +
        'A intensidade relativa de cada harmônico é o que produz o timbre. Um violino e uma flauta tocando lá 440 emitem a mesma fundamental; o que difere é a receita de harmônicos que acompanha.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c1_audio_serie',
      title: 'Os primeiros harmônicos de dó',
      description:
        'Fundamental, oitava, quinta e oitava seguinte — as proporções 1:2:3:4, ouvidas em sequência e depois juntas.',
      notes: ['C3', 'C4', 'G4', 'C5'],
      playMode: 'SEQUENCE',
      bpm: 50,
    },
    {
      kind: 'CHECKPOINT',
      id: 'c1_check',
      question: 'Dois sons têm a mesma frequência, mas um é muito mais forte. O que difere entre eles?',
      options: ['A altura', 'A intensidade', 'O timbre', 'A duração'],
      correctIndex: 1,
      explanation:
        'A frequência determina a altura — se ela é a mesma, a altura é a mesma. A diferença de força é intensidade, que depende da amplitude da vibração.',
    },
  ],

  2: [
    {
      kind: 'MARKDOWN',
      id: 'c2_intro',
      markdown:
        'A **pauta** — ou pentagrama — são cinco linhas e quatro espaços. Cada linha e cada espaço é uma posição de altura: quanto mais acima, mais agudo.\n\n' +
        'Só que cinco linhas não dizem nada sozinhas. É a **clave**, no início da pauta, que fixa uma nota de referência — e todas as outras se posicionam a partir dela.',
    },
    {
      kind: 'STAFF',
      id: 'c2_staff',
      title: 'Clave de sol: as notas nas linhas',
      notes: ['E4', 'G4', 'B4', 'D5', 'F5'],
      clef: 'treble',
    },
    {
      kind: 'MARKDOWN',
      id: 'c2_claves',
      markdown:
        '## Por que mais de uma clave\n\n' +
        'Se houvesse uma clave só, instrumentos graves viveriam abaixo da pauta e agudos acima dela — escritos em linhas suplementares intermináveis, ilegíveis.\n\n' +
        'A **clave de sol** fixa o sol4 na segunda linha e serve a vozes e instrumentos agudos. A **clave de fá** fixa o fá3 na quarta linha e serve aos graves. A mesma posição na pauta significa notas diferentes conforme a clave — é isso que a clave decide.',
    },
    {
      kind: 'KEYBOARD',
      id: 'c2_teclado',
      title: 'As notas naturais, do dó3 ao dó5',
      highlightNotes: ['C4'],
      octaves: 2,
      startOctave: 3,
    },
    {
      kind: 'CHECKPOINT',
      id: 'c2_check',
      question: 'Uma nota escrita na segunda linha da pauta. Que nota é?',
      options: [
        'Sol, sempre',
        'Depende da clave',
        'Mi, sempre',
        'Depende da armadura',
      ],
      correctIndex: 1,
      explanation:
        'A posição na pauta só ganha nome depois que a clave fixa a referência. Na clave de sol, a segunda linha é sol4; na clave de fá, é si2.',
    },
  ],

  3: [
    {
      kind: 'MARKDOWN',
      id: 'c3_intro',
      markdown:
        'As figuras não têm duração fixa em segundos. Têm duração **relativa**: cada figura vale o dobro da seguinte.\n\n' +
        '| Figura | Vale |\n|---|---|\n| semibreve | 2 mínimas |\n| mínima | 2 semínimas |\n| semínima | 2 colcheias |\n| colcheia | 2 semicolcheias |\n\n' +
        'Quanto tempo dura uma semínima em segundos? Depende do andamento — e é só isso que o andamento decide.',
    },
    {
      kind: 'CALLOUT',
      id: 'c3_call',
      type: 'tip',
      title: 'O ponto de aumento',
      text:
        'Um ponto à direita da figura acrescenta METADE do valor dela. Semínima pontuada = semínima + colcheia. Não é uma regra arbitrária: é a única forma de escrever uma duração de três subdivisões sem inventar uma figura nova.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c3_audio',
      title: 'Semínimas e colcheias sobre o mesmo pulso',
      description: 'Quatro semínimas, depois oito colcheias. O pulso não muda; a subdivisão dobra.',
      notes: ['C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4', 'C4'],
      playMode: 'SEQUENCE',
      bpm: 100,
    },
    {
      kind: 'CHECKPOINT',
      id: 'c3_check',
      question: 'Quantas semicolcheias cabem numa mínima?',
      options: ['4', '8', '16', '2'],
      correctIndex: 1,
      explanation:
        'Mínima = 2 semínimas = 4 colcheias = 8 semicolcheias. Cada degrau da tabela dobra a quantidade.',
    },
  ],

  4: [
    {
      kind: 'MARKDOWN',
      id: 'c4_intro',
      markdown:
        'O **semitom** é a menor distância do sistema temperado: de uma tecla à tecla imediatamente vizinha, branca ou preta. Dois semitons formam um **tom**.\n\n' +
        'Entre as sete notas naturais, a distância é de um tom — exceto entre **mi e fá** e entre **si e dó**, onde é de um semitom. É por isso que o teclado não tem tecla preta nesses dois pontos.',
    },
    {
      kind: 'KEYBOARD',
      id: 'c4_teclado',
      title: 'Onde faltam as teclas pretas',
      highlightNotes: ['E4', 'F4', 'B4', 'C5'],
      octaves: 2,
      startOctave: 4,
    },
    {
      kind: 'MARKDOWN',
      id: 'c4_acidentes',
      markdown:
        '## Os cinco acidentes\n\n' +
        '**Sustenido (♯)** sobe um semitom. **Bemol (♭)** desce um semitom. **Bequadro (♮)** cancela o acidente anterior. **Dobrado sustenido (𝄪)** sobe um tom; **dobrado bemol (𝄫)** desce um tom.\n\n' +
        'Duas grafias podem soar idêntico: fá♯ e sol♭ são a mesma tecla. Chama-se **enarmonia**. A escolha entre as duas não é indiferente — ela informa a função da nota dentro da tonalidade.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c4_lab_semitom',
      title: 'Mi–fá: um semitom',
      lowerNote: 'E4',
      upperNote: 'F4',
      prompt: 'Ouça e peça a análise. Esta é a menor distância do sistema.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c4_lab_tom',
      title: 'Dó–ré: um tom',
      lowerNote: 'C4',
      upperNote: 'D4',
      prompt: 'O dobro da distância anterior. Compare o quanto soa mais aberto.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c4_check',
      question: 'Quantos semitons há entre mi e fá?',
      options: ['Dois', 'Um', 'Três', 'Nenhum'],
      correctIndex: 1,
      explanation:
        'Mi e fá são vizinhos imediatos: um semitom. O mesmo vale para si e dó. Nos demais pares de notas naturais vizinhas, a distância é de um tom.',
    },
  ],

  5: [
    {
      kind: 'MARKDOWN',
      id: 'c5_intro',
      markdown:
        'Um **intervalo** é a distância entre duas notas. Classificá-lo exige **dois passos**, e confundi-los é a origem de quase todo erro.\n\n' +
        '**Primeiro, o número.** Conta-se quantos nomes de nota há entre as duas, incluindo as duas pontas. De dó a mi: dó, ré, mi — três nomes, é uma **terça**. O número ignora acidentes.\n\n' +
        '**Depois, a qualidade.** Aí sim os acidentes contam. Dó–mi tem 4 semitons: terça **maior**. Dó–mi♭ tem 3: terça **menor**. As duas são terças; a qualidade é que difere.',
    },
    {
      kind: 'CALLOUT',
      id: 'c5_call',
      type: 'info',
      title: 'Por que dois sistemas',
      text:
        'O número diz o lugar na escala; a qualidade diz o tamanho exato. Uma terça sempre ocupa três graus, seja maior ou menor — e é isso que a mantém reconhecível como terça, na melodia e no acorde.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c5_lab_3m',
      title: 'Terça maior',
      lowerNote: 'C4',
      upperNote: 'E4',
      prompt: 'Ouça ANTES de pedir a análise. Nomear sem ouvir treina o olho, não o ouvido.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c5_lab_3men',
      title: 'Terça menor — o mesmo número, outra qualidade',
      lowerNote: 'C4',
      upperNote: 'Eb4',
      prompt: 'Três graus, como a anterior. Um semitom a menos muda o caráter inteiro.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c5_lab_5j',
      title: 'Quinta justa',
      lowerNote: 'C4',
      upperNote: 'G4',
      prompt: 'A consonância mais estável depois da oitava — a base do acorde.',
    },
    {
      kind: 'INTERVAL_LAB',
      id: 'c5_lab_7m',
      title: 'Sétima maior — a dissonância aguda',
      lowerNote: 'C4',
      upperNote: 'B4',
      prompt: 'Compare com a oitava: falta um semitom, e o efeito é de tensão.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c5_inversao',
      markdown:
        '## Inversão\n\n' +
        'Inverter um intervalo é subir a nota grave uma oitava — ou baixar a aguda. O resultado obedece a duas regras fixas:\n\n' +
        '- **os números somam nove**: terça inverte em sexta, quinta em quarta, segunda em sétima;\n' +
        '- **a qualidade troca**: maior vira menor, aumentado vira diminuto. Justo continua justo.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c5_check',
      question: 'Qual é a inversão de uma terça maior?',
      options: ['Sexta maior', 'Sexta menor', 'Terça menor', 'Quinta justa'],
      correctIndex: 1,
      explanation:
        'Os números somam nove: 9 − 3 = 6, é uma sexta. E a qualidade troca: maior vira menor. Portanto, sexta menor.',
    },
  ],

  6: [
    {
      kind: 'MARKDOWN',
      id: 'c6_intro',
      markdown:
        'Uma **escala** é uma sequência ordenada de notas dentro de uma oitava. O que define o caráter dela não são as notas: é o **padrão de tons e semitons** entre elas.\n\n' +
        'A escala maior tem sempre o mesmo padrão, comece onde começar:\n\n' +
        '**T · T · st · T · T · T · st**\n\n' +
        'Os semitons caem entre o 3º e o 4º grau, e entre o 7º e o 8º. É daí que vem o som de escala maior — e é por isso que, ao transpor, os acidentes aparecem: eles existem para preservar o padrão.',
    },
    {
      kind: 'SCALE_LAB',
      id: 'c6_lab_do',
      title: 'Dó maior — nenhum acidente',
      tonic: 'C4',
      mode: 'MAJOR',
    },
    {
      kind: 'SCALE_LAB',
      id: 'c6_lab_sol',
      title: 'Sol maior — repare de onde vem o fá sustenido',
      tonic: 'G4',
      mode: 'MAJOR',
    },
    {
      kind: 'MARKDOWN',
      id: 'c6_menores',
      markdown:
        '## As três menores\n\n' +
        'A **menor natural** tem semitons entre 2–3 e 5–6. Soa modal, sem tração para a tônica.\n\n' +
        'A **menor harmônica** sobe o 7º grau um semitom, criando a sensível — a nota que puxa para a tônica. O preço é um intervalo de segunda aumentada entre o 6º e o 7º, que é difícil de cantar.\n\n' +
        'A **menor melódica** resolve isso subindo também o 6º grau na subida, e desfazendo as duas alterações na descida. É a única escala que muda conforme a direção.',
    },
    {
      kind: 'SCALE_LAB',
      id: 'c6_lab_menor',
      title: 'Lá menor natural',
      tonic: 'A4',
      mode: 'NATURAL_MINOR',
    },
    {
      kind: 'SCALE_LAB',
      id: 'c6_lab_harmonica',
      title: 'Lá menor harmônica — ouça o salto entre o 6º e o 7º grau',
      tonic: 'A4',
      mode: 'HARMONIC_MINOR',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c6_check',
      question: 'Onde ficam os semitons na escala maior?',
      options: [
        'Entre 2–3 e 5–6',
        'Entre 3–4 e 7–8',
        'Entre 1–2 e 4–5',
        'Não há semitons na escala maior',
      ],
      correctIndex: 1,
      explanation:
        'O padrão é T–T–st–T–T–T–st: os semitons caem entre o 3º e o 4º grau e entre o 7º e o 8º. É esse desenho que faz a escala soar maior.',
    },
  ],

  7: [
    {
      kind: 'MARKDOWN',
      id: 'c7_intro',
      markdown:
        'Se a escala de sol maior precisa de fá♯ para manter o padrão, escrever o sustenido em cada fá da peça seria repetitivo e sujeito a erro. A solução é a **armadura**: os acidentes migram para o início da pauta e valem para a peça inteira.\n\n' +
        'A ordem em que eles aparecem não é livre. Os sustenidos entram sempre nesta sequência: **fá, dó, sol, ré, lá, mi, si**. Os bemóis, exatamente na ordem inversa: **si, mi, lá, ré, sol, dó, fá**.',
    },
    {
      kind: 'CALLOUT',
      id: 'c7_call',
      type: 'tip',
      title: 'Como ler a armadura de cabeça',
      text:
        'Com sustenidos: o ÚLTIMO sustenido é a sensível — a tônica está um semitom acima dele. Com bemóis: o PENÚLTIMO bemol é a própria tônica. Com um bemol só, é fá maior; não há penúltimo, e vale decorar.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c7_relativas',
      markdown:
        '## Relativas\n\n' +
        'Cada armadura serve a **duas** tonalidades: uma maior e uma menor. A menor relativa começa no 6º grau da maior — uma terça menor abaixo.\n\n' +
        'Dó maior e lá menor dividem a armadura vazia. Sol maior e mi menor dividem o fá♯. As notas são as mesmas; o que muda é qual delas funciona como centro de repouso.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c7_check',
      question: 'Uma armadura com dois sustenidos, fá♯ e dó♯. Que tonalidade maior é?',
      options: ['Sol maior', 'Ré maior', 'Lá maior', 'Si maior'],
      correctIndex: 1,
      explanation:
        'O último sustenido é dó♯, que funciona como sensível. Um semitom acima de dó♯ é ré: a tonalidade é ré maior. A relativa menor é si menor.',
    },
  ],

  8: [
    {
      kind: 'MARKDOWN',
      id: 'c8_intro',
      markdown:
        'O pulso da música se agrupa em unidades regulares chamadas **compassos**, separados por barras verticais. A **fórmula de compasso**, no início da peça, informa esse agrupamento com dois números.\n\n' +
        'Em compasso **simples**, o número de cima diz quantos tempos há no compasso, e o de baixo diz que figura vale um tempo — 4 para semínima, 8 para colcheia, 2 para mínima.\n\n' +
        'Em 4/4: quatro tempos, cada um valendo uma semínima.',
    },
    {
      kind: 'CALLOUT',
      id: 'c8_call',
      type: 'warning',
      title: 'Compasso composto engana',
      text:
        'Em 6/8, o número de cima NÃO significa seis tempos. Compassos compostos subdividem cada tempo em três, e 6/8 tem DOIS tempos, cada um valendo uma semínima pontuada. Ler 6/8 como seis tempos é o erro mais comum de iniciante.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c8_audio',
      title: 'O mesmo número de colcheias, agrupado de dois jeitos',
      description:
        'Primeiro em 3/4 — três tempos de duas colcheias. Depois em 6/8 — dois tempos de três. A acentuação muda tudo.',
      notes: ['C4', 'G4', 'C4', 'G4', 'C4', 'G4'],
      playMode: 'SEQUENCE',
      bpm: 120,
    },
    {
      kind: 'CHECKPOINT',
      id: 'c8_check',
      question: 'Quantos tempos tem um compasso 6/8?',
      options: ['Seis', 'Três', 'Dois', 'Oito'],
      correctIndex: 2,
      explanation:
        '6/8 é composto: os seis colcheias agrupam-se em dois tempos de três. A unidade de tempo é a semínima pontuada, não a colcheia.',
    },
  ],

  9: [
    {
      kind: 'MARKDOWN',
      id: 'c9_intro',
      markdown:
        'As figuras dizem a duração relativa; o **andamento** converte isso em tempo real. A indicação pode ser um termo — *largo*, *adagio*, *andante*, *allegro*, *presto* — ou um número de batidas por minuto.\n\n' +
        'Os termos são faixas, não pontos: *andante* é uma região de velocidade, e dois intérpretes razoáveis discordam dentro dela. O metrônomo é preciso; o termo é expressivo. Partituras modernas costumam trazer os dois.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c9_dinamica',
      markdown:
        '## Dinâmica\n\n' +
        'A intensidade também se escreve, numa escala relativa: **pp** (pianíssimo), **p** (piano), **mp**, **mf**, **f** (forte), **ff** (fortíssimo).\n\n' +
        'Relativa é a palavra que importa: um *forte* de quarteto de cordas e um *forte* de orquestra sinfônica não têm o mesmo volume. A indicação diz a posição dentro da obra, não um número de decibéis.\n\n' +
        '**Crescendo** e **diminuendo** indicam mudança gradual — e, como toda mudança gradual, precisam de um ponto de partida e um de chegada para significarem algo.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c9_check',
      question: 'Uma peça indica ♩ = 60. O que isso significa?',
      options: [
        'Sessenta compassos por minuto',
        'Sessenta semínimas por minuto, uma por segundo',
        'Sessenta notas no total',
        'Sessenta segundos de duração',
      ],
      correctIndex: 1,
      explanation:
        'A indicação metronômica diz quantas vezes por minuto a figura indicada ocorre. ♩ = 60 são sessenta semínimas por minuto — exatamente uma por segundo.',
    },
  ],

  10: [
    {
      kind: 'MARKDOWN',
      id: 'c10_intro',
      markdown:
        'A subdivisão natural de um compasso simples é binária: cada tempo se divide em dois. A **quiáltera** contraria isso — encaixa um número diferente de notas no mesmo espaço.\n\n' +
        'A mais comum é a **tercina**: três notas no tempo de duas. Escreve-se com um 3 sobre o grupo. Existem também quintinas, seitinas, e assim por diante.',
    },
    {
      kind: 'AUDIO_EXAMPLE',
      id: 'c10_audio_tercina',
      title: 'Colcheias e depois tercinas',
      description: 'O mesmo tempo, dividido em dois e depois em três.',
      notes: ['C4', 'C4', 'C4', 'C4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4'],
      playMode: 'SEQUENCE',
      bpm: 90,
    },
    {
      kind: 'MARKDOWN',
      id: 'c10_sincope',
      markdown:
        '## Síncope e contratempo\n\n' +
        'Os dois deslocam o acento para fora do tempo forte, e a diferença está no que acontece **no** tempo forte.\n\n' +
        'Na **síncope**, o som começa num tempo fraco e **prolonga-se** sobre o forte. O acento cai onde não se esperava porque a nota já estava soando.\n\n' +
        'No **contratempo**, o tempo forte é **silêncio** — há uma pausa — e o som entra no fraco. O acento se desloca porque o forte foi deixado vazio.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c10_check',
      question: 'O tempo forte está em silêncio e a nota entra no tempo fraco. Isso é:',
      options: ['Síncope', 'Contratempo', 'Quiáltera', 'Ligadura'],
      correctIndex: 1,
      explanation:
        'Contratempo: o tempo forte é ocupado por pausa. Na síncope, ao contrário, o som já está soando quando o tempo forte chega — ele se prolonga sobre o forte.',
    },
  ],

  11: [
    {
      kind: 'MARKDOWN',
      id: 'c11_intro',
      markdown:
        'Uma **tríade** são três notas empilhadas em terças: **fundamental**, **terça** e **quinta**. As combinações possíveis de terça maior e menor produzem quatro qualidades:\n\n' +
        '| Tríade | Terça | Quinta |\n|---|---|---|\n| maior | maior | justa |\n| menor | menor | justa |\n| diminuta | menor | diminuta |\n| aumentada | maior | aumentada |',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c11_lab_maior',
      title: 'Dó maior',
      notes: ['C4', 'E4', 'G4'],
      prompt: 'Terça maior embaixo, menor em cima. Quinta justa entre os extremos.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c11_lab_menor',
      title: 'Dó menor — uma nota de diferença',
      notes: ['C4', 'Eb4', 'G4'],
      prompt: 'Só a terça desceu um semitom. Compare o efeito com o anterior.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c11_lab_dim',
      title: 'Dó diminuto',
      notes: ['C4', 'Eb4', 'Gb4'],
      prompt: 'Duas terças menores empilhadas. A quinta encolheu, e o acorde pede resolução.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c11_lab_aum',
      title: 'Dó aumentado',
      notes: ['C4', 'E4', 'G#4'],
      prompt: 'Duas terças maiores. Simétrico, e por isso sem repouso.',
    },
    {
      kind: 'MARKDOWN',
      id: 'c11_inversoes',
      markdown:
        '## Inversões\n\n' +
        'A inversão é decidida por uma coisa só: **qual nota está no baixo**.\n\n' +
        '- fundamental no baixo → **estado fundamental**\n' +
        '- terça no baixo → **primeira inversão**\n' +
        '- quinta no baixo → **segunda inversão**\n\n' +
        'O acorde continua sendo o mesmo — as três notas não mudaram. O que muda é a sonoridade e a função no encadeamento: uma segunda inversão soa instável e raramente serve de repouso.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c11_check',
      question: 'Um acorde com as notas dó, mi e sol, tendo mi no baixo. Que acorde é, e em que posição?',
      options: [
        'Mi menor, estado fundamental',
        'Dó maior, primeira inversão',
        'Dó maior, segunda inversão',
        'Mi diminuto, primeira inversão',
      ],
      correctIndex: 1,
      explanation:
        'As notas dó, mi e sol formam a tríade de dó maior, independentemente da ordem. Com a terça (mi) no baixo, está em primeira inversão.',
    },
  ],

  12: [
    {
      kind: 'MARKDOWN',
      id: 'c12_intro',
      markdown:
        'A **cifra** descreve um acorde por um símbolo, em vez de escrevê-lo nota a nota. Nasceu da prática — quem acompanha precisa saber a harmonia, não a disposição exata das vozes.\n\n' +
        'A letra indica a fundamental: **C** é dó, **D** é ré, e assim por diante, seguindo a nomenclatura de letras.\n\n' +
        'O que vem depois qualifica:\n\n' +
        '- **C** — tríade maior\n' +
        '- **Cm** — tríade menor\n' +
        '- **C°** — diminuta\n' +
        '- **C+** — aumentada\n' +
        '- **C7** — com sétima menor\n' +
        '- **CM7** — com sétima maior',
    },
    {
      kind: 'CALLOUT',
      id: 'c12_call',
      type: 'info',
      title: 'A barra indica o baixo',
      text:
        'C/E significa acorde de dó maior com mi no baixo — a primeira inversão. O que vem depois da barra é sempre a nota do baixo, não outro acorde.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c12_lab_c7',
      title: 'C7 — sétima menor',
      notes: ['C4', 'E4', 'G4', 'Bb4'],
      prompt: 'O acorde que pede resolução. É ele que conduz a harmonia tonal.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c12_lab_cm7',
      title: 'CM7 — sétima maior',
      notes: ['C4', 'E4', 'G4', 'B4'],
      prompt: 'Um semitom acima da anterior, e o caráter muda de tensão para repouso.',
    },
    {
      kind: 'CHORD_LAB',
      id: 'c12_lab_dm7',
      title: 'Dm7 — o segundo grau',
      notes: ['D4', 'F4', 'A4', 'C5'],
      prompt: 'Tríade menor com sétima menor. O acorde que costuma preceder o C7.',
    },
    {
      kind: 'CHECKPOINT',
      id: 'c12_check',
      question: 'A cifra G/B pede quais notas, e com o quê no baixo?',
      options: [
        'Sol maior com si no baixo',
        'Sol e si, dois acordes seguidos',
        'Si menor com sol no baixo',
        'Sol com sétima em si',
      ],
      correctIndex: 0,
      explanation:
        'A letra antes da barra é o acorde: sol maior, ou seja, sol–si–ré. O que vem depois da barra é a nota do baixo: si. É a primeira inversão de sol maior.',
    },
  ],
};

export const LICOES_TEORIA: AcademyLesson[] = CAPITULOS_TEORIA.map((c) => {
  const id = `les_teoria_${String(c.numero).padStart(2, '0')}`;
  const blocos = BLOCOS[c.numero] ?? [];
  return {
    id,
    moduleId: `mod_teoria_${String(c.numero).padStart(2, '0')}`,
    courseId: CURSO_TEORIA.id,
    order: 1,
    canonicalContentId: `canon_teoria_${c.numero}`,
    durationMinutes: c.minutos,
    objectives: c.objetivos,
    skills: [c.competencia],
    activityIds: [],
    variants: {
      TRADITIONAL: {
        title: c.titulo,
        summary: c.descricao,
        introduction: c.descricao,
        sections: [{ id: `${id}_s1`, title: c.titulo, contentMarkdown: '', blocks: blocos }],
        audioSamples: [],
        illustrations: [],
      },
      KIDS: {
        title: c.titulo,
        summary: c.descricao,
        introduction: c.descricao,
        sections: [{ id: `${id}_s1k`, title: c.titulo, contentMarkdown: '', blocks: blocos }],
        audioSamples: [],
        illustrations: [],
      },
    },
    createdAt: AGORA,
    updatedAt: AGORA,
  };
});
