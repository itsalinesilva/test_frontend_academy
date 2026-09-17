import { CourseLevel } from '../domain/types';
import {
  Program,
  LearningPath,
  AcademyCategory,
  AcademyCourse,
  AcademyModule,
  AcademyLesson,
  AcademyActivity,
  AcademyAssessment,
  AcademyQuiz,
} from '../domain/academy';

// ---------------------------------------------------------------------------
// 0. CATEGORIES (Taxonomia Curricular Superior)
// ---------------------------------------------------------------------------

export const SEED_CATEGORIES: AcademyCategory[] = [
  {
    id: 'cat_teoria_harmonia',
    slug: 'teoria-harmonia-analise',
    name: 'Teoria Musical, Harmonia & Análise Tonal',
    description:
      'Gramática musical fundamental, física acústica das alturas, formação de tríades e tétrades, encadeamento de acordes e condução funcional.',
    iconName: 'Music',
    color: 'border-blue-500 text-blue-700 bg-blue-50',
    courseCount: 2,
    featuredCourseIds: ['crs_fomt_01', 'crs_fomt_02'],
    skills: [
      'Notação Alfabética & Claves',
      'Física Acústica & Oitavas',
      'Escalas Diatônicas Maiores & Menores',
      'Tríades Primárias (I - IV - V)',
      'Cadências Tais & Modulações',
    ],
  },
  {
    id: 'cat_contraponto_polifonia',
    slug: 'contraponto-polifonia-fuga',
    name: 'Contraponto, Polifonia & Fuga',
    description:
      'Independência melódica de linhas simultâneas, as cinco espécies de Fux sobre canto firme, cânones e invenções a vozes.',
    iconName: 'Layers',
    color: 'border-emerald-500 text-emerald-700 bg-emerald-50',
    courseCount: 1,
    featuredCourseIds: ['crs_contraponto_01'],
    skills: [
      'Contraponto Nota-contra-Nota (1ª Espécie)',
      'Espécies com Síncopa e Retardo',
      'Condução Cantabile',
      'Proibição de Paralelismos',
    ],
  },
  {
    id: 'cat_percepcao_solfejo',
    slug: 'percepcao-auditiva-solfejo',
    name: 'Percepção Auditiva, Ear Training & Solfejo',
    description:
      'Desenvolvimento do ouvido musical interno, identificação de intervalos, ditados melódicos e rítmicos, solfejo relativo e absoluto.',
    iconName: 'Ear',
    color: 'border-amber-500 text-amber-700 bg-amber-50',
    courseCount: 1,
    featuredCourseIds: ['crs_fomt_01'],
    skills: [
      'Identificação Auditiva de Intervalos',
      'Percepção de Modos Maior e Menor',
      'Reconhecimento de Baixo Fundamental',
      'Ditado Rítmico Proporcional',
    ],
  },
  {
    id: 'cat_historia_musicologia',
    slug: 'historia-musica-musicologia',
    name: 'História da Música & Musicologia',
    description:
      'Tradição dos períodos barroco, clássico, romântico e moderno, organologia, biografia dos grandes mestres e proveniência de manuscritos.',
    iconName: 'BookOpen',
    color: 'border-purple-500 text-purple-700 bg-purple-50',
    courseCount: 1,
    featuredCourseIds: ['crs_fomt_02'],
    skills: [
      'Periodização Estética Ocidental',
      'Estudo de Fontes & Urtext',
      'Análise Crítica de Obras Canônicas',
    ],
  },
  {
    id: 'cat_performance_repertorio',
    slug: 'performance-repertorio-urtext',
    name: 'Performance, Repertório & Urtext',
    description:
      'Técnica instrumental expressiva, interpretação estilística fundamentada, leitura à primeira vista e masterclasses com mestres.',
    iconName: 'Award',
    color: 'border-rose-500 text-rose-700 bg-rose-50',
    courseCount: 1,
    featuredCourseIds: ['crs_fomt_01'],
    skills: [
      'Articulação e Fraseado',
      'Dinâmica e Polifonia no Instrumento',
      'Prática Deliberada Guiada',
    ],
  },
];

// ---------------------------------------------------------------------------
// 1. PROGRAMS
// ---------------------------------------------------------------------------

export const SEED_PROGRAMS: Program[] = [
  {
    id: 'prg_fundamentos_musicais',
    slug: 'programa-fundamentos-e-gramatica-musical',
    title: 'Programa Integrado de Fundamentos & Gramática Musical',
    subtitle: 'Formação canônica completa do nível elementar à sintaxe harmônica funcional.',
    description:
      'Currículo acadêmico estruturado conforme as diretrizes dos grandes centros de formação superior em música. Abrange a física das alturas, métrica temporal proporcional, construção escalar modal/tonal, condução de vozes a quatro partes e análise de repertório ocidental.',
    workloadHours: 60,
    estimatedMonths: 4,
    pathIds: ['pth_teoria_gramatica', 'pth_ritmo_sintaxe'],
    prerequisites: ['Alfabetização básica', 'Interesse em teoria musical e instrumento'],
    competencies: [
      'Leitura e identificação vertical/horizontal em claves de Sol e Fá',
      'Construção e reconhecimento auditivo de intervalos e escalas',
      'Estruturação de tríades maiores, menores, diminutas e aumentadas',
      'Encadeamento harmônico com resolução de sensíveis e quintas paralelas proibidas',
    ],
    targetAudience: 'Estudantes de música, instrumentistas, cantores, professores e entusiastas formais.',
    certificateTitle: 'Certificado de Conclusão do Programa Integrado em Gramática Musical',
    isPublished: true,
    provenanceRef: 'Curadoria conjunta Universidade de Edimburgo (Open Courseware) + Bohumil Med (Teoria da Música)',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prg_analise_contraponto',
    slug: 'programa-analise-e-contraponto-polifonico',
    title: 'Programa de Contraponto Polifônico & Análise Formal',
    subtitle: 'Da tradição renascentista de Fux às fugas e invenções do Barroco.',
    description:
      'Imersão técnica nas espécies de contraponto estrito sobre cantus firmus, independência de linhas melódicas, imitação motívica e arquitetura da forma sonata e fuga.',
    workloadHours: 80,
    estimatedMonths: 6,
    pathIds: ['pth_contraponto_estrito'],
    prerequisites: ['Programa Integrado de Fundamentos ou aprovação em teste de proficiência'],
    competencies: [
      'Domínio das 5 espécies de contraponto a duas e três vozes',
      'Análise de condução polifônica em obras de Palestrina e J.S. Bach',
      'Composição de invenção a duas vozes e resposta canônica',
    ],
    targetAudience: 'Compositores, arranjadores, regentes e instrumentistas de concerto.',
    certificateTitle: 'Diploma Acadêmico em Contraponto Canônico & Análise Polifônica',
    isPublished: true,
    provenanceRef: 'Tratados de J.J. Fux (Gradus ad Parnassum) e Kent Kennan (Counterpoint)',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// 2. LEARNING PATHS
// ---------------------------------------------------------------------------

export const SEED_PATHS: LearningPath[] = [
  {
    id: 'pth_teoria_gramatica',
    programId: 'prg_fundamentos_musicais',
    order: 1,
    slug: 'trilha-fundamentos-teoricos-e-alturas',
    title: 'Trilha 1: Teoria Acústica & Gramática das Alturas',
    subtitle: 'Da física das cordas vibrantes ao empilhamento vertical de acordes.',
    description:
      'Esta trilha introduz a organização matemática do som, o fenômeno das oitavas e a formação da escala maior diatônica, culminando no domínio das tríades primárias.',
    courseIds: ['crs_fomt_01', 'crs_fomt_02'],
    workloadHours: 26,
    level: CourseLevel.FUNDAMENTAL,
    skills: ['Física Acústica', 'Identificação Intervalar', 'Escalas Maiores', 'Tríades Primárias'],
  },
  {
    id: 'pth_ritmo_sintaxe',
    programId: 'prg_fundamentos_musicais',
    order: 2,
    slug: 'trilha-métrica-ritmica-e-cadencias',
    title: 'Trilha 2: Métrica Proporcional & Cadências Harmônicas',
    subtitle: 'Estruturação do tempo, acentuações métricas e as fórmulas cadenciais.',
    description:
      'Trabalho aprofundado na subdivisão de pulsos, compassos simples e compostos, síncopas, anacruses e a respiração harmônica através de cadências autênticas, plagais e rotas.',
    courseIds: ['crs_fomt_02'],
    workloadHours: 34,
    level: CourseLevel.INTERMEDIARIO,
    skills: ['Métrica & Compassos', 'Subdivisão Rítmica', 'Cadência Perfeita', 'Cadência Plagal'],
  },
  {
    id: 'pth_contraponto_estrito',
    programId: 'prg_analise_contraponto',
    order: 1,
    slug: 'trilha-contraponto-de-fux',
    title: 'Trilha: Espécies de Contraponto Estrito',
    subtitle: 'Canto firme, consonâncias perfeitas e condução de vozes oblíquas.',
    description:
      'Exercícios graduados de contraponto nota-contra-nota, duas notas contra uma e síncopa de suspensão.',
    courseIds: ['crs_contraponto_01'],
    workloadHours: 45,
    level: CourseLevel.AVANCADO,
    skills: ['Contraponto 1ª Espécie', 'Contraponto 2ª Espécie', 'Resolução de Retardo'],
  },
];

// ---------------------------------------------------------------------------
// 3. COURSES
// ---------------------------------------------------------------------------

export const SEED_COURSES: AcademyCourse[] = [
  {
    id: 'crs_fomt_01',
    slug: 'fundamentos-teoria-musical-1',
    pathId: 'pth_teoria_gramatica',
    programId: 'prg_fundamentos_musicais',
    categoryId: 'cat_teoria_harmonia',
    categoryName: 'Teoria, Harmonia & Sintaxe Tonal',
    title: 'Fundamentos de Teoria Musical I: Notas, Escalas e Tríades',
    subtitle: 'Estruturação acústica das notas, oitavas, escalas maiores e tríades primárias.',
    description:
      'Curso formal dedicado à gramática fundamental da música ocidental. Aborda a física das alturas, oitavas, fórmula intervalar diatônica maior, modos e a hierarquia funcional das tríades tônicas, subdominantes e dominantes.',
    level: CourseLevel.FUNDAMENTAL,
    workloadHours: 12,
    authorId: 'usr_founder_1',
    authorName: 'Profa. Dra. Clara Schumann',
    authorTitle: 'Cátedra de Teoria Musical & Análise Canônica',
    authorBio:
      'Pianista virtuose, compositora e professora de renome internacional. Liderou cátedras de interpretação e análise musical formal, com foco na tradição expressiva e no rigor sintático.',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    objectives: [
      'Compreender o princípio físico da oitava e a série harmônica fundamental.',
      'Dominar a escrita e leitura alfabética internacional (A a G) e silábica (Dó a Si).',
      'Construir e auditar escalas maiores diatônicas através da fórmula T - T - st - T - T - T - st.',
      'Identificar as três tríades primárias fundamentais (I, IV e V) e suas funções tonais.',
    ],
    competencies: [
      'Identificação de Alturas',
      'Cálculo de Intervalos Diatônicos',
      'Construção de Escala Maior',
      'Harmonia Funcional Primária (I - IV - V)',
    ],
    skills: [
      'Notação Musical',
      'Física Acústica',
      'Círculo de Quintas',
      'Percepção Tonal',
      'Tríades Maiores',
    ],
    prerequisites: ['Nenhum pré-requisito formal exigido. Apenas interesse em teoria musical.'],
    learningOutcomes: [
      'Capacidade de ler com fluência notas em claves de Sol e Fá.',
      'Habilidade de transpor escalas maiores e identificar armaduras de clave.',
      'Competência para construir tríades maiores e menores sobre qualquer tônica.',
      'Conexão direta entre audição, leitura na partitura e execução no teclado.',
    ],
    materials: [
      {
        id: 'mat_01',
        title: 'Tabela Canônica de Frequências e Alturas (PDF)',
        type: 'pdf',
        url: '#mat-pdf-frequencias',
        sizeOrRef: '1.2 MB • Academia Musical Digital',
      },
      {
        id: 'mat_02',
        title: 'Partitura Modelo: Escala Maior e Tríades em Dó e Sol (MusicXML)',
        type: 'score',
        url: '#mat-score-escalas',
        sizeOrRef: 'MusicXML 3.1 • 4 Compassos',
      },
      {
        id: 'mat_03',
        title: 'Guia de Audição: Resolução V - I nas Obras de Bach e Mozart (Áudio)',
        type: 'audio',
        url: '#mat-audio-resolucoes',
        sizeOrRef: 'FLAC 24-bit / 48kHz Estéreo',
      },
    ],
    references: [
      {
        title: 'Teoria da Música (Edição Canônica)',
        author: 'Bohumil Med',
        year: '1996',
        citation: 'Brasília: Musimed, 4ª ed. Capítulos 1 a 4 (Notação, Intervalos e Escalas).',
      },
      {
        title: 'Fundamentals of Music Theory',
        author: 'University of Edinburgh (Lectures 1-2)',
        year: '2021',
        citation: 'Open Courseware Library. Open educational resource on pitch and scales.',
      },
      {
        title: 'Harmonielehre (Tratado de Harmonia)',
        author: 'Arnold Schoenberg',
        year: '1922',
        citation: 'Universal Edition, Viena. Fundamentos acústicos dos harmônicos.',
      },
    ],
    curriculumSummary:
      '2 Módulos Acadêmicos, 4 Lições Interativas com Áudio e Partitura, 4 Atividades Avaliadas, 1 Quiz Rápido e 1 Exame Final.',
    assessmentPolicy:
      'Nota mínima de 75% na Avaliação Final para elegibilidade de Certificado Canônico.',
    certificatePolicy:
      'Certificado acadêmico com assinatura digital SHA-256 e código único de validação perene.',
    certificateInfo: {
      title: 'Certificado de Conclusão com Louvor em Teoria Musical I',
      accreditation: 'Conselho Pedagógico Superior da Academia Musical Digital',
      criteria: 'Aprovação com mínimo de 75% no Exame Final e conclusão das 4 lições curriculares.',
    },
    moduleIds: ['mod_fomt_101', 'mod_fomt_102'],
    finalAssessmentId: 'asm_fomt_01_final',
    isPublished: true,
    worldRef: {
      workId: 'wrk_bach_wtc_cmaj',
      workTitle: 'Cravo Bem Temperado, Livro I: Prelúdio em Dó Maior BWV 846',
      composer: 'Johann Sebastian Bach',
      period: 'Barroco Tardio',
    },
    relatedPractice: {
      sessionId: 'prc_fomt_01_scales',
      title: 'Treino de Digitação & Construção de Escalas no Teclado',
      instrument: 'Piano / Teclado',
      type: 'Técnica e Leitura',
      focus: 'Fórmula T-T-st-T-T-T-st e reconhecimento imediato de notas no pentagrama',
      exerciseId: 'ex_scales_01',
    },
    relatedScore: {
      scoreId: 'score_c_major_scale',
      title: 'Escala de Dó Maior e Encadeamento I - IV - V (Edição Canônica Urtext)',
      composer: 'Academia Musical Digital',
      clef: 'treble',
    },
    provenance: {
      source:
        'University of Edinburgh - Fundamentals of Music Theory (Lectures 1-2) & Bohumil Med (Teoria da Música)',
      citation: 'Lectures 1 & 2: Musical Notes, Octaves, Major Scales, Primary Chords. Open Courseware.',
      curatorNotes:
        'Conteúdo derivado conceitualmente com rigor musicológico e integridade pedagógica auditada.',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'crs_fomt_02',
    slug: 'fundamentos-teoria-musical-2',
    pathId: 'pth_ritmo_sintaxe',
    programId: 'prg_fundamentos_musicais',
    categoryId: 'cat_teoria_harmonia',
    categoryName: 'Teoria, Harmonia & Sintaxe Tonal',
    title: 'Fundamentos de Teoria Musical II: Ritmo, Métrica e Cadências',
    subtitle: 'Durações rítmicas, quiálteras, métrica, compassos e cadências harmônicas.',
    description:
      'Aprofundamento na dimensão temporal e na sintaxe harmônica: relações proporcionais de duração, ligaduras, compassos simples e compostos, anacruse e condução de cadências perfeitas e imperfeitas.',
    level: CourseLevel.FUNDAMENTAL,
    workloadHours: 14,
    authorId: 'usr_founder_1',
    authorName: 'Prof. Johannes Brahms',
    authorTitle: 'Cátedra de Composição & Sintaxe Tonal',
    authorBio:
      'Compositor e pianista alemão. Mestre absoluto da variação contínua, do rigor formal e da polifonia rítmica.',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    objectives: [
      'Dominar a hierarquia geométrica das figuras de valor (Semibreve até Semicolcheia).',
      'Diferenciar a pulsação binária, ternária e quaternária em compassos simples e compostos.',
      'Identificar cadências autênticas perfeitas, imperfeitas e cadência plagal em partituras.',
    ],
    competencies: [
      'Leitura Rítmica Proporcional',
      'Análise de Fórmula de Compasso',
      'Reconhecimento de Cadências',
    ],
    skills: [
      'Compassos Simples e Compostos',
      'Subdivisões Ternárias',
      'Cadência Perfeita',
      'Cadência Plagal',
    ],
    prerequisites: ['Fundamentos de Teoria Musical I: Notas, Escalas e Tríades'],
    learningOutcomes: [
      'Domínio da pulsação métrica em compassos 2/4, 3/4, 4/4 e 6/8.',
      'Identificação precisa das resoluções cadenciais em partituras clássicas.',
      'Capacidade de transcrever ritmos ouvidos com exatidão métrica.',
    ],
    materials: [
      {
        id: 'mat_04',
        title: 'Mapa das Fórmulas de Compasso e Acentuações Métricas (PDF)',
        type: 'pdf',
        url: '#mat-pdf-compassos',
        sizeOrRef: '950 KB',
      },
    ],
    references: [
      {
        title: 'Gramática da Música e Métrica Musical',
        author: 'Osvaldo Lacerda',
        year: '1976',
        citation: 'São Paulo: Ricordi Brasileira. Seções de ritmo e métrica.',
      },
    ],
    curriculumSummary: '2 Módulos Acadêmicos, 4 Lições, 4 Atividades, 1 Quiz e 1 Exame Final.',
    assessmentPolicy: 'Nota mínima de 75% na Avaliação Final.',
    certificatePolicy: 'Certificado com verificação institucional e hash SHA-256.',
    certificateInfo: {
      title: 'Certificado em Ritmo, Métrica e Cadências Tonais',
      accreditation: 'Conselho Acadêmico Musical',
      criteria: 'Aprovação com 75%+ e resolução de exercícios rítmicos.',
    },
    moduleIds: ['mod_fomt_201'],
    finalAssessmentId: 'asm_fomt_02_final',
    isPublished: true,
    worldRef: {
      workId: 'wrk_beethoven_symph5',
      workTitle: 'Sinfonia Nº 5 em Dó Menor Op. 67 (Análise do Motivo Rítmico)',
      composer: 'Ludwig van Beethoven',
      period: 'Classicismo / Transição Romântica',
    },
    relatedPractice: {
      sessionId: 'prc_fomt_02_rhythm',
      title: 'Treino de Pulsação, Metrônomo e Subdivisão Rítmica',
      instrument: 'Metrônomo & Palmas / Teclado',
      type: 'Percepção e Rítmica',
      focus: 'Subdivisão de colcheias e semicolcheias nos compassos 2/4, 3/4 e 4/4',
      exerciseId: 'ex_rhythm_01',
    },
    relatedScore: {
      scoreId: 'score_cadences_bach',
      title: 'Cadências Autênticas e Plagais nos Corais de J.S. Bach',
      composer: 'J.S. Bach',
      clef: 'treble',
    },
    provenance: {
      source: 'University of Edinburgh - Fundamentals of Music Theory (Lectures 3-5)',
      citation: 'Lectures 3 to 5: Rhythmic Duration, Tuplets, Meter, Cadences & Inversions.',
      curatorNotes: 'Adequação formal de proveniência respeitando a separação entre conteúdo canônico e apresentação.',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'crs_contraponto_01',
    slug: 'contraponto-modal-e-polifonia',
    pathId: 'pth_contraponto_estrito',
    programId: 'prg_analise_contraponto',
    categoryId: 'cat_contraponto_polifonia',
    categoryName: 'Contraponto, Polifonia & Fuga',
    title: 'Contraponto Modal e Prática Polifônica',
    subtitle: 'As regras de Fux, espécies estritas sobre cantus firmus e independência de vozes.',
    description:
      'Estudo avançado da arte contrapontística. Do canto firme à primeira e segunda espécies a duas vozes, evitando paralelismos perfeitos e controlando o fluxo melódico cantábile.',
    level: CourseLevel.AVANCADO,
    workloadHours: 20,
    authorId: 'usr_founder_1',
    authorName: 'Profa. Dra. Nadia Boulanger',
    authorTitle: 'Cátedra Honorária de Análise Musical e Contraponto',
    authorBio:
      'Lendária pedagoga francesa que formou gerações de compositores do século XX (Copland, Glass, Piazzolla). Mestra insuperável em contraponto severo e escuta atenta.',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    objectives: [
      'Dominar o tratamento de intervalos consonantes perfeitos, imperfeitos e dissonâncias controladas.',
      'Escrever contraponto de 1ª e 2ª espécie sobre cantus firmus em modos eclesiásticos.',
      'Analisar a condução de vozes em motetos renascentistas.',
    ],
    competencies: [
      'Contraponto Estrito',
      'Condução de Linha Melódica (Cantabile)',
      'Identificação de Paralelismos Proibidos',
    ],
    skills: [
      'Canto Firme',
      '1ª Espécie Nota-contra-Nota',
      'Movimento Contrário e Oblíquo',
      'Clímax Melódico',
    ],
    prerequisites: ['Fundamentos de Teoria Musical I e II'],
    learningOutcomes: [
      'Condução polifônica elegante sem quintas ou oitavas paralelas.',
      'Capacidade de compor contracantos expressivos sobre melodias dadas.',
      'Análise crítica da independência textural em peças vocais e instrumentais.',
    ],
    materials: [],
    references: [
      {
        title: 'Gradus ad Parnassum (O Estudo do Contraponto)',
        author: 'Johann Joseph Fux',
        year: '1725',
        citation: 'Tradução para o português por José Antônio de Almeida Prado.',
      },
      {
        title: 'The Style of Palestrina and the Dissonance',
        author: 'Knud Jeppesen',
        year: '1946',
        citation: 'Oxford University Press. Regras rigorosas da polifonia renascentista.',
      },
    ],
    curriculumSummary: '2 Módulos Acadêmicos, 4 Lições Especializadas e 1 Projeto Final de Composição.',
    assessmentPolicy: 'Nota mínima de 80% em exercícios contrapontísticos com validação de regras.',
    certificatePolicy: 'Certificado avançado assinado e auditado.',
    certificateInfo: {
      title: 'Diploma Especializado em Contraponto Estrito',
      accreditation: 'Cátedra de Polifonia & Composição',
      criteria: 'Submissão de composição polifônica a 2 vozes sem violações sintáticas.',
    },
    moduleIds: [],
    isPublished: true,
    worldRef: {
      workId: 'wrk_palestrina_pope_marcellus',
      workTitle: 'Missa Papae Marcelli (Kyrie)',
      composer: 'Giovanni Pierluigi da Palestrina',
      period: 'Renascimento',
    },
    relatedPractice: {
      sessionId: 'prc_counterpoint_01',
      title: 'Laboratório de Condução de Vozes & Cantus Firmus',
      instrument: 'Cravo / Órgão / Piano',
      type: 'Composição & Condução',
      focus: 'Canto firme no baixo e contraponto superior em 1ª espécie',
      exerciseId: 'ex_counterpoint_01',
    },
    relatedScore: {
      scoreId: 'score_cantus_firmus_d_dorian',
      title: 'Cantus Firmus em Modo Dórico e Contraponto Modelo',
      composer: 'J.J. Fux (Edição Canônica)',
      clef: 'treble',
    },
    provenance: {
      source: 'Johann Joseph Fux (Gradus ad Parnassum) & Knud Jeppesen (The Style of Palestrina)',
      citation: 'Fux, J.J. Gradus ad Parnassum (1725). Tradução e anotações canônicas.',
      curatorNotes: 'Exercícios estritos de condução com validação algorítmica.',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// 4. MODULES
// ---------------------------------------------------------------------------

export const SEED_MODULES: AcademyModule[] = [
  {
    id: 'mod_fomt_101',
    courseId: 'crs_fomt_01',
    order: 1,
    title: 'Módulo 1: A Natureza das Notas e o Fenômeno da Oitava',
    description:
      'Definição de frequência acústica, notação alfabética internacional e a duplicação periódica da oitava (proporção 2:1).',
    objectives: [
      'Compreender o conceito físico e perceptivo de altura.',
      'Associar notação de letras (A-B-C-D-E-F-G) às notas tradicionais (Lá-Si-Dó-Ré-Mi-Fá-Sol).',
      'Identificar oitavas acústicas no piano e na clave de Sol.',
    ],
    lessonIds: ['les_fomt_101_1', 'les_fomt_101_2'],
    assessmentId: undefined,
  },
  {
    id: 'mod_fomt_102',
    courseId: 'crs_fomt_01',
    order: 2,
    title: 'Módulo 2: A Escala Maior Diatônica e as Tríades Primárias',
    description:
      'A arquitetura intervalar invariante da tonalidade maior e a hierarquia funcional dos acordes de Tônica, Subdominante e Dominante.',
    objectives: [
      'Construir qualquer escala maior a partir da fórmula Tom-Tom-Semitom-Tom-Tom-Tom-Semitom.',
      'Identificar as armaduras de clave fundamentais.',
      'Formar e resolver tríades primárias (Graus I, IV e V).',
    ],
    lessonIds: ['les_fomt_102_1', 'les_fomt_102_2'],
    assessmentId: 'asm_fomt_01_final',
  },
  {
    id: 'mod_fomt_201',
    courseId: 'crs_fomt_02',
    order: 1,
    title: 'Módulo 1: Proporções Temporais e Figuras de Valor',
    description: 'Divisão métrica, equivalências rítmicas e notação de pausas.',
    objectives: ['Compreender as proporções 2:1 entre figuras musicais.'],
    lessonIds: [],
  },
];

// ---------------------------------------------------------------------------
// 5. LESSONS (Separating CONTENT from PRESENTATION - Traditional vs Kids)
// ---------------------------------------------------------------------------

export const SEED_LESSONS: AcademyLesson[] = [
  {
    id: 'les_fomt_101_1',
    moduleId: 'mod_fomt_101',
    courseId: 'crs_fomt_01',
    order: 1,
    canonicalContentId: 'canon_mus_notes_alpha',
    durationMinutes: 15,
    objectives: [
      'Diferenciar altura sonora de intensidade e timbre.',
      'Mapear a notação alfabética internacional (A a G) e sua correlação histórica com a afinação em Lá4 (440 Hz).',
    ],
    skills: ['Notação Alfabética', 'Leitura Básica de Alturas', 'Teoria Acústica'],
    provenanceRef: 'University of Edinburgh Lecture 1 (02_01. Musical Notes) & Med, Bohumil (Cap. 1: Som e Notação)',
    activityIds: ['act_fomt_101_1_notacao'],
    variants: {
      TRADITIONAL: {
        title: 'Lição 1: Notas Musicais e a Notação Alfabética Internacional',
        summary: 'Os fundamentos da discretização do espectro audível e as convenções ocidentais de notação musical.',
        introduction:
          'Na tradição da música ocidental, o espectro contínuo de vibrações audíveis é organizado em frequências de referência discretas denominadas notas musicais. Cada nota possui uma frequência fundamental bem definida que o sistema auditivo humano decodifica como uma altura específica.',
        sections: [
          {
            id: 'sec_1',
            title: '1. As Sete Notas e a Notação Alfabética',
            contentMarkdown: `A notação musical ocidental adota dois sistemas primordiais:
- **Nomenclatura Silábica (Guido d'Arezzo):** Dó, Ré, Mi, Fá, Sol, Lá, Si.
- **Nomenclatura Alfabética Internacional:** A, B, C, D, E, F, G.

Observe a correlação estrita entre os dois sistemas:
- **A** = Lá (referência do diapasão padrão: A4 = 440 Hz)
- **B** = Si
- **C** = Dó (o centro de gravidade do teclado e da clave de Sol/Fá)
- **D** = Ré
- **E** = Mi
- **F** = Fá
- **G** = Sol

Na ordenação que ascende a partir de Dó (C), obtemos a célebre série diatônica: **C - D - E - F - G - A - B - (C)**.`,
            callout: {
              type: 'historical',
              title: 'Nota de Proveniência Histórica',
              text: 'O sistema alfabético remonta aos teóricos da Grécia Antiga e de Boécio (séc. VI), enquanto os nomes silábicos Dó-Ré-Mi foram derivados no século XI pelo monge beneditino Guido d’Arezzo a partir do hino litúrgico a São João Batista (Ut queant laxis).',
            },
          },
          {
            id: 'sec_2',
            title: '2. Tons e Semitons Naturais',
            contentMarkdown: `Nem todas as notas adjacentes na escala natural guardam a mesma distância intervalar entre si:
- Entre **C e D**, **D e E**, **F e G**, **G e A**, **A e B**, a distância acústica é de um **Tom Inteiro** (dois semitons).
- Entre **E e F** (Mi e Fá) e entre **B e C** (Si e Dó), a distância natural é de apenas um **Semitom** (meio-tom).

Essa distribuição assimétrica é o segredo acústico que permite ao ouvido humano reconhecer a tônica e se orientar tonalmente sem esforço.`,
          },
        ],
        video: {
          title: 'Aula Demonstrativa: Do Teclado à Partitura',
          durationMinutes: 8,
          description: 'Apresentação no piano de cauda demonstrando a distribuição dos tons e semitons naturais.',
          transcript:
            'Neste vídeo, o professor executa a escala diatônica a partir do Dó central (C4), demonstrando por que as teclas brancas E-F e B-C não possuem tecla preta intermediária: a distância entre elas já é o semitom diatônico natural.',
        },
        audioSamples: [
          {
            id: 'aud_a440',
            title: 'Lá 4 (A4) - Frequência de Referência 440 Hz',
            description: 'A frequência padrão adotada pela International Organization for Standardization (ISO 16).',
            notes: ['A4'],
            frequenciesHz: [440.0],
            durationSeconds: 3,
          },
          {
            id: 'aud_c_major_scale',
            title: 'Escala Natural Ascendente (C4 até C5)',
            description: 'Execução das 8 notas diatônicas: Dó, Ré, Mi, Fá, Sol, Lá, Si, Dó.',
            notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
            frequenciesHz: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25],
            durationSeconds: 5,
          },
        ],
        scoreSnippet: {
          id: 'sc_c_notes',
          title: 'As Sete Notas Naturais na Clave de Sol',
          clef: 'treble',
          keySignature: 'C Major',
          timeSignature: '4/4',
          notesDisplay: 'C4 D4 E4 F4 | G4 A4 B4 C5',
          caption: 'Observe a passagem de linha a espaço sucessivo na pauta de 5 linhas (pentagrama).',
        },
        illustrations: [
          {
            id: 'ill_diapason',
            title: 'Gravura Histórica: O Diapasão e o Monocórdio Pitagórico',
            altText: 'Ilustração histórica de Pitágoras medindo comprimentos de corda proporcionais no monocórdio.',
            historicalContext: 'Tratado de Teoria Musical, edição fac-similar da biblioteca de Leipzig (1738).',
            caption: 'Pitagóricos demonstrando que a harmonia do universo obedece a proporções numéricas inteiras.',
          },
        ],
        references: [
          {
            title: 'Teoria da Música (4ª Edição Revista e Ampliada)',
            author: 'Bohumil Med',
            chapterOrLecture: 'Capítulo 1: O Som e sua Representação Gráfica (págs. 11–24)',
            sourceType: 'book',
          },
          {
            title: 'Fundamentals of Music Theory',
            author: 'University of Edinburgh',
            chapterOrLecture: 'Lecture 1: Musical Notes & Staff Notation',
            sourceType: 'open_courseware',
          },
        ],
      },
      KIDS: {
        title: 'Lição 1: O Alfabeto Secreto dos Sons e a Chave Mágica de Sol!',
        summary: 'Conheça os 7 passarinhos cantores e descubra por que as notas usam letrinhas mágicas de A até G!',
        introduction:
          'Você sabia que a música tem uma linguagem secreta muito parecida com o alfabeto da escola? Em vez de ler palavras normais, os músicos do mundo inteiro usam 7 letrinhas mágicas para cantar!',
        sections: [
          {
            id: 'sec_kids_1',
            title: '1. A Grande Família das Sete Notas',
            contentMarkdown: `No Castelo da Música, moram 7 amiguinhos que adoram cantar juntos:
- **Dó** (que adora andar de **Carro** = **C**)
- **Ré** (que tem um **Dinossauro** fofinho = **D**)
- **Mi** (que tem orelhas de **Elefante** = **E**)
- **Fá** (que solta **Foguetes** no céu = **F**)
- **Sol** (que é o grande astro que **Gira** = **G**)
- **Lá** (que toca **Asas** de anjo = **A**)
- **Si** (que voa num lindo **Balão** = **B**)

Quando juntamos todos eles, eles cantam a escadinha mais famosa do mundo:
**Dó, Ré, Mi, Fá, Sol, Lá, Si e DÓ no alto da torre!**`,
            callout: {
              type: 'tip',
              title: 'Super Dica da Coruja Músico',
              text: 'Se você ver uma letra "C" escrita num livro de música em qualquer país do planeta, você já sabe: ela se chama Dó!',
            },
          },
          {
            id: 'sec_kids_2',
            title: '2. Os Degraus Pequeninos e os Degraus Grandes',
            contentMarkdown: `Imagine que a escada da música tem degraus grandes (que chamamos de **Tom**) e degraus pequenininhos (que chamamos de **Meio-Tom**).
- O **Mi e o Fá** são vizinhos tão coladinhos que moram no mesmo degrau pequenino!
- O **Si e o Dó** também são melhores amigos e dão as mãos no degrau pequenino!
Todos os outros precisam dar um pulinho maior!`,
          },
        ],
        video: {
          title: 'Historinha Cantada: Os Bichinhos da Escala',
          durationMinutes: 6,
          description: 'Desenho animado lúdico apresentando cada nota musical e sua letra do alfabeto.',
          transcript:
            'A fada Clave de Sol abre as portas do castelo e nos mostra o passarinho Dó cantando bem grave e o gatinho Si cantando bem fininho no alto da árvore.',
        },
        audioSamples: [
          {
            id: 'aud_a440_kids',
            title: 'O Som Amarelo do Lá (A = 440)',
            description: 'Ouça o som que todas as orquestras do planeta usam para afinar os violinos!',
            notes: ['A4'],
            frequenciesHz: [440.0],
            durationSeconds: 3,
          },
          {
            id: 'aud_c_scale_kids',
            title: 'Subindo os 8 Degraus com Alegria!',
            description: 'Ouça os amiguinhos cantando de Dó até Dó!',
            notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
            frequenciesHz: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25],
            durationSeconds: 5,
          },
        ],
        scoreSnippet: {
          id: 'sc_c_kids',
          title: 'Os Amigos na Pauta Colorida',
          clef: 'treble',
          keySignature: 'C Major',
          timeSignature: '4/4',
          notesDisplay: 'C4 D4 E4 F4 | G4 A4 B4 C5',
          caption: 'Cada bolinha senta na sua linha ou mora na sua casinha branca!',
        },
        illustrations: [
          {
            id: 'ill_kids_tree',
            title: 'O Castelo da Clave de Sol',
            altText: 'Ilustração colorida de castelo infantil onde as notas musicais moram em diferentes andares.',
            historicalContext: 'Pedagogia Musical Lúdica da Academia Musical Digital.',
            caption: 'A escada encantada das 7 notas musicais.',
          },
        ],
        references: [
          {
            title: 'Método de Iniciação Musical para Crianças',
            author: 'Curadoria Pedagógica Infantil',
            chapterOrLecture: 'Aventuras na Terra das Alturas',
            sourceType: 'book',
          },
        ],
      },
    },
  },
  {
    id: 'les_fomt_101_2',
    moduleId: 'mod_fomt_101',
    courseId: 'crs_fomt_01',
    order: 2,
    canonicalContentId: 'canon_mus_octaves',
    durationMinutes: 20,
    objectives: [
      'Entender a proporção acústica 2:1 da oitava.',
      'Identificar o fenômeno da equivalência de classe de altura (Pitch Class Equivalence).',
    ],
    skills: ['Oitavas Acústicas', 'Equivalência de Alturas', 'Teoria de Frequências'],
    provenanceRef: 'University of Edinburgh Lecture 1 (03_02. Octaves) & Piston, Walter (Harmony)',
    activityIds: ['act_fomt_101_2_oitava'],
    variants: {
      TRADITIONAL: {
        title: 'Lição 2: Oitavas e Equivalência Acústica (Proporção 2:1)',
        summary: 'A base física e psicoacústica da consonância perfeita mais elementar da música.',
        introduction:
          'O intervalo de oitava é a relação mais pura e universal de toda a música humana, encontrada em virtually todas as culturas do planeta. Ele ocorre quando uma nota vibra com exatamente o dobro da frequência de outra.',
        sections: [
          {
            id: 'sec_oct_1',
            title: '1. A Proporção 2:1 no Monocórdio',
            contentMarkdown: `Pitágoras descobriu no século VI a.C. que, ao pressionar uma corda elástica exatamente no seu ponto médio (divisão de 1/2):
- O comprimento vibrante é reduzido à metade (1/2).
- A frequência dobra (2/1).
- O som resultante soa tão semelhante ao som original que nosso cérebro o interpreta como a **mesma nota em um registro mais agudo**.

Por exemplo:
- **A3 (Lá 3):** 220 Hz
- **A4 (Lá 4):** 440 Hz (220 × 2)
- **A5 (Lá 5):** 880 Hz (440 × 2)

Essa propriedade é chamada na teoria musical contemporânea de **Equivalência de Classe de Altura** (*Pitch Class Equivalence*).`,
            callout: {
              type: 'info',
              title: 'Consonância Perfeita',
              text: 'A oitava é classificada como a consonância perfeita mais estável do sistema tonal, seguida da Quinta Justa (proporção 3:2).',
            },
          },
        ],
        audioSamples: [
          {
            id: 'aud_oct_demo',
            title: 'Comparação de Oitavas: Dó 3 (130.8 Hz) e Dó 4 (261.6 Hz)',
            description: 'Ouça o Dó grave seguido do Dó central e em seguida soando simultaneamente.',
            notes: ['C3', 'C4'],
            frequenciesHz: [130.81, 261.63],
            durationSeconds: 4,
          },
        ],
        scoreSnippet: {
          id: 'sc_oct_snippet',
          title: 'Oitava C4 - C5 em Clave de Sol',
          clef: 'treble',
          keySignature: 'C Major',
          timeSignature: '2/4',
          notesDisplay: 'C4 C5',
          caption: 'Oitava justa com 12 semitons de distância cromática.',
        },
        illustrations: [],
        references: [
          {
            title: 'A History of Western Music',
            author: 'J. Peter Burkholder, Donald J. Grout, Claude V. Palisca',
            chapterOrLecture: 'Chapter 1: The Curvature of Musical Time and Pythagoras',
            sourceType: 'book',
          },
        ],
      },
      KIDS: {
        title: 'Lição 2: O Salto do Gigante e o Bebê Passarinho (A Oitava!)',
        summary: 'Descubra como o papai urso e o filhote urso cantam a mesmíssima nota, mas um no grave e outro no agudo!',
        introduction:
          'Já reparou que o Papai Urso tem uma voz bem grossa e o Ursinho Pequeno tem uma voz bem fininha? Mas os dois conseguem cantar parabéns para você na mesmíssima melodia!',
        sections: [
          {
            id: 'sec_oct_kids_1',
            title: '1. O Espelho Mágico da Música',
            contentMarkdown: `Quando você toca a primeira tecla de Dó no teclado e depois caminha 8 casinhas para a direita, você chega em outro Dó!
Eles são como irmãos gêmeos:
- Um é o **Dó Grandão** (voz grossa e calma)
- O outro é o **Dó Voador** (voz fininha e veloz)

Eles se abraçam e o som fica lindo e brilhante, como duas estrelas juntas no céu!`,
          },
        ],
        audioSamples: [
          {
            id: 'aud_oct_kids',
            title: 'O Papai Dó e o Bebê Dó',
            description: 'Toque para ouvir como eles cantam a mesma nota em alturas diferentes!',
            notes: ['C3', 'C4'],
            frequenciesHz: [130.81, 261.63],
            durationSeconds: 4,
          },
        ],
        illustrations: [],
        references: [],
      },
    },
  },
  {
    id: 'les_fomt_102_1',
    moduleId: 'mod_fomt_102',
    courseId: 'crs_fomt_01',
    order: 1,
    canonicalContentId: 'canon_mus_major_scale',
    durationMinutes: 25,
    objectives: [
      'Compreender a fórmula intervalar da escala maior (Tom - Tom - Semitom - Tom - Tom - Tom - Semitom).',
      'Construir a escala maior a partir de qualquer tônica através de acidentes (sustenidos e bemóis).',
    ],
    skills: ['Construção de Escala Maior', 'Acidentes Musicais', 'Tonalidade Maior'],
    provenanceRef: 'University of Edinburgh Lecture 1 (04_03. Major Scales) & Med (Cap. 4: Escalas Diatônicas)',
    activityIds: ['act_fomt_102_1_escala'],
    variants: {
      TRADITIONAL: {
        title: 'Lição 3: A Estrutura da Escala Maior Diatônica',
        summary: 'A fórmula matemática que estabeleceu o alicerce melódico e harmônico da música tonal.',
        introduction:
          'A escala maior é a matriz construtiva de séculos de música ocidental. Sua sonoridade clara, estável e triunfante decorre de um padrão intervalar fixo que organiza a tensão e o repouso.',
        sections: [
          {
            id: 'sec_sc_1',
            title: '1. A Fórmula T - T - st - T - T - T - st',
            contentMarkdown: `Toda e qualquer escala maior obedece impreterivelmente à seguinte sequência de 7 passos:
1. Da tônica (I) para o segundo grau (II): **Tom**
2. Do grau II para o grau III: **Tom**
3. Do grau III para o grau IV: **Semitom** (ponto crítico de atração melódica)
4. Do grau IV para o grau V: **Tom**
5. Do grau V para o grau VI: **Tom**
6. Do grau VI para o grau VII: **Tom**
7. Do grau VII (sensível) para a tônica superior (VIII): **Semitom**

Em **Dó Maior (C)**:
\`C --[Tom]--> D --[Tom]--> E --[st]--> F --[Tom]--> G --[Tom]--> A --[Tom]--> B --[st]--> C\`
Nenhuma nota preta (acidente) é necessária!

Porém, se iniciarmos a escala em **Sol (G)**:
\`G -> A (Tom) -> B (Tom) -> C (st) -> D (Tom) -> E (Tom) -> F# (Tom) -> G (st)\`
O **Fá sustenido (F#)** torna-se indispensável para manter a distância de tom até o VII grau e de semitom até o VIII.`,
          },
        ],
        audioSamples: [
          {
            id: 'aud_g_major',
            title: 'Escala de Sol Maior (com Fá Sustenido)',
            description: 'Observe a resolução tensa do F# agudo repousando no Sol tônico.',
            notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F#5', 'G5'],
            frequenciesHz: [392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 739.99, 783.99],
            durationSeconds: 5,
          },
        ],
        scoreSnippet: {
          id: 'sc_major_formula',
          title: 'Escala de Dó Maior e Sol Maior no Pentagrama',
          clef: 'treble',
          keySignature: 'G Major (1 sustenido)',
          timeSignature: '4/4',
          notesDisplay: 'G4 A4 B4 C5 | D5 E5 F#5 G5',
          caption: 'Armadura com 1 sustenido (F# na 5ª linha da clave de Sol).',
        },
        illustrations: [],
        references: [
          {
            title: 'Harmonia',
            author: 'Walter Piston',
            chapterOrLecture: 'Capítulo 1: A Escala Maior e Graus Tonais',
            sourceType: 'book',
          },
        ],
      },
      KIDS: {
        title: 'Lição 3: O Caminho Mágico dos Pulos Grandes e Pequeninos!',
        summary: 'Aprenda a fórmula secreta que constrói a mais alegre de todas as trilhas musicais!',
        introduction:
          'Para fazer uma festa no Castelo da Música, o Rei Dó criou uma regrinha mágica para caminhar pelo jardim: dois passos de gigante, um passinho de formiga, três passos de gigante e um passinho de formiga!',
        sections: [
          {
            id: 'sec_sc_kids_1',
            title: '1. O Segredo do Coelho e do Elefante',
            contentMarkdown: `O Elefante dá passos grandões: **TOM!**
A Formiguinha dá passos curtinhos: **SEMITOM!**

A música mais feliz do mundo sempre caminha assim:
**Elefante - Elefante - Formiguinha!**
**Elefante - Elefante - Elefante - Formiguinha!**

Se você cantar essa canção, todos os bichinhos da floresta vão sorrir junto com você!`,
          },
        ],
        audioSamples: [],
        illustrations: [],
        references: [],
      },
    },
  },
  {
    id: 'les_fomt_102_2',
    moduleId: 'mod_fomt_102',
    courseId: 'crs_fomt_01',
    order: 2,
    canonicalContentId: 'canon_mus_primary_triads',
    durationMinutes: 30,
    objectives: [
      'Entender a formação de uma tríade pelo empilhamento de terças (fundamental, terça e quinta).',
      'Reconhecer auditiva e teoricamente as três tríades primárias: Tônica (I), Subdominante (IV) e Dominante (V).',
    ],
    skills: ['Tríades Primárias', 'Harmonia Funcional', 'Funções Tônica-Subdominante-Dominante'],
    provenanceRef: 'University of Edinburgh Lecture 1 (05_04 & 06_05. Primary Chords) & Kostka & Payne (Tonal Harmony)',
    activityIds: ['act_fomt_102_2_triades'],
    variants: {
      TRADITIONAL: {
        title: 'Lição 4: As Tríades Primárias (Tônica, Subdominante e Dominante)',
        summary: 'Os pilares fundamentais da harmonia funcional que sustentam a grande arquitetura musical.',
        introduction:
          'Um acorde é a ressonância simultânea de três ou mais alturas. Ao empilharmos duas terças consecutivas sobre os graus da escala diatônica, construímos as tríades que governam a sintaxe harmônica ocidental.',
        sections: [
          {
            id: 'sec_tr_1',
            title: '1. Anatomia de uma Tríade',
            contentMarkdown: `Uma tríade fundamental é constituída por:
- **Fundamental (Raiz):** A nota que dá nome ao acorde e define seu centro acústico.
- **Terça:** A nota localizada a um intervalo de terça (maior ou menor) acima da fundamental, determinando o modo do acorde.
- **Quinta:** A nota localizada a um intervalo de quinta justa acima da fundamental.

Sobre a escala diatônica de Dó Maior, destacam-se três tríades maiores perfeitas, chamadas **Tríades Primárias**:
1. **Grau I (Tônica - C Maior: C - E - G):** O porto seguro, repouso e estabilidade absoluta.
2. **Grau IV (Subdominante - F Maior: F - A - C):** Abertura do espaço tonal, movimento para longe do centro.
3. **Grau V (Dominante - G Maior: G - B - D):** Tensão máxima; contém a sensível (B) que exige resolução resoluta de volta à tônica (C).`,
            callout: {
              type: 'tip',
              title: 'Totalidade Diatônica',
              text: 'Note que as três tríades primárias (C-E-G, F-A-C, G-B-D) contêm juntas exatamente todas as sete notas da escala diatônica (C, D, E, F, G, A, B). Isso significa que é possível harmonizar virtualmente qualquer melodia diatônica utilizando apenas I, IV e V!',
            },
          },
        ],
        audioSamples: [
          {
            id: 'aud_c_chord',
            title: 'Tríade Tônica (Dó Maior: C - E - G)',
            description: 'Som calmo, brilhante e estável de repouso.',
            notes: ['C4', 'E4', 'G4'],
            frequenciesHz: [261.63, 329.63, 392.0],
            durationSeconds: 3,
          },
          {
            id: 'aud_cadence_iv_v_i',
            title: 'Progressão I - IV - V - I Completa',
            description: 'O ciclo harmônico canônico: Repouso -> Partida -> Tensão -> Resolução.',
            notes: ['C4', 'F4', 'G4', 'C4'],
            frequenciesHz: [261.63, 349.23, 392.0, 261.63],
            durationSeconds: 6,
          },
        ],
        scoreSnippet: {
          id: 'sc_triads',
          title: 'Tríades I, IV e V em Clave de Sol',
          clef: 'treble',
          keySignature: 'C Major',
          timeSignature: '3/4',
          notesDisplay: '[C4 E4 G4] | [F4 A4 C5] | [G4 B4 D5] | [C4 E4 G4]',
          caption: 'Empilhamento vertical das notas nos graus I, IV, V e I.',
        },
        illustrations: [],
        references: [
          {
            title: 'Tonal Harmony with an Introduction to Twentieth-Century Music',
            author: 'Stefan Kostka & Dorothy Payne',
            chapterOrLecture: 'Chapter 3: Triads and Seventh Chords',
            sourceType: 'book',
          },
        ],
      },
      KIDS: {
        title: 'Lição 4: Os Três Super-Heróis da Orquestra (Rei, Cavaleiro e Mago!)',
        summary: 'Conheça os três acordes mais poderosos de todos que resolvem qualquer mistério musical!',
        introduction:
          'Quando três passarinhos cantam ao mesmo tempo, eles criam um super-poder chamado ACORDE! E no reino da música existem três super-heróis imbatíveis!',
        sections: [
          {
            id: 'sec_tr_kids_1',
            title: '1. O Rei Dó, o Cavaleiro Fá e o Mago Sol',
            contentMarkdown: `- **O Rei Dó (Grau I):** Mora no castelo mais seguro e quentinho de todos. Quando a música chega nele, todo mundo suspira de alívio e descanso!
- **O Cavaleiro Fá (Grau IV):** Adora sair para explorar montanhas e florestas distantes!
- **O Mago Sol (Grau V):** Solta faíscas brilhantes de magia! Ele faz um mistério tão grande que todo mundo fica esperando o feitiço acabar... e quando acaba, todos correm felizes de volta para o castelo do Rei Dó!`,
          },
        ],
        audioSamples: [],
        illustrations: [],
        references: [],
      },
    },
  },
];

// ---------------------------------------------------------------------------
// 6. ACTIVITIES (Evaluation & Validation)
// ---------------------------------------------------------------------------

export const SEED_ACTIVITIES: AcademyActivity[] = [
  {
    id: 'act_fomt_101_1_notacao',
    lessonId: 'les_fomt_101_1',
    courseId: 'crs_fomt_01',
    canonicalId: 'act_canon_alpha_match',
    type: 'multiple_choice',
    difficulty: 'iniciante',
    skills: ['Notação Alfabética', 'Identificação de Alturas'],
    correctAnswer: 'opt_c',
    variants: {
      TRADITIONAL: {
        instruction: 'Identifique a correspondência internacional entre notação silábica e alfabética.',
        contextPrompt:
          'Na convenção internacional adotada em partituras clássicas e gravações científicas, cada nota musical recebe uma letra de A até G.',
        question: 'Qual é a representação alfabética internacional correspondente à nota fundamental DÓ (C)?',
        options: [
          { id: 'opt_a', label: 'Letra A', explanation: 'Incorreto. A letra A corresponde à nota Lá (440 Hz).' },
          { id: 'opt_b', label: 'Letra D', explanation: 'Incorreto. A letra D corresponde à nota Ré.' },
          { id: 'opt_c', label: 'Letra C', explanation: 'Correto! A letra C representa universalmente a nota Dó.' },
          { id: 'opt_d', label: 'Letra F', explanation: 'Incorreto. A letra F representa a nota Fá.' },
        ],
        feedbackCorrect: 'Excelente precisão acadêmica! A letra C designa canonicamente a nota Dó na notação internacional.',
        feedbackIncorrect: 'Revise a tabela de correspondências da Lição 1: A=Lá, B=Si, C=Dó, D=Ré, E=Mi, F=Fá, G=Sol.',
        hints: ['Lembre-se de que a ordem das letras começa em A (Lá), e portanto a letra C cai exatamente em Dó.'],
      },
      KIDS: {
        instruction: 'Ajude o passarinho a encontrar a letrinha da casinha do Dó!',
        contextPrompt: 'O amiguinho Dó precisa entrar no seu carro para ir passear no castelo.',
        question: 'Qual é a letra mágica que representa o nosso amiguinho DÓ?',
        options: [
          { id: 'opt_a', label: 'Letra A (de Asas)', explanation: 'Essa é a letra do amigo Lá!' },
          { id: 'opt_b', label: 'Letra D (de Dinossauro)', explanation: 'Essa é a letra do amigo Ré!' },
          { id: 'opt_c', label: 'Letra C (de Carro do Dó!)', explanation: 'Parabéns! C é a letra do Dó!' },
          { id: 'opt_d', label: 'Letra F (de Foguete)', explanation: 'Essa é a letra do amigo Fá!' },
        ],
        feedbackCorrect: 'Muito bem! Você acertou! O Carro C é do amigo Dó!',
        feedbackIncorrect: 'Tente mais uma vez! Lembre-se: C de Carro do Dó!',
        hints: ['Pense no C de Carro!'],
      },
    },
  },
  {
    id: 'act_fomt_101_2_oitava',
    lessonId: 'les_fomt_101_2',
    courseId: 'crs_fomt_01',
    canonicalId: 'act_canon_octave_ratio',
    type: 'interval_identification',
    difficulty: 'iniciante',
    skills: ['Oitavas Acústicas', 'Física do Som'],
    correctAnswer: 'opt_2_1',
    variants: {
      TRADITIONAL: {
        instruction: 'Avalie a relação acústica de frequências fundamentais entre oitavas adjacentes.',
        contextPrompt:
          'Se a nota Lá 3 vibra a 220 ciclos por segundo (Hz), a nota Lá 4 (uma oitava imediatamente superior) vibrará a 440 ciclos por segundo.',
        question: 'Qual é a proporção numérica exata de frequência que define o intervalo acústico de oitava?',
        options: [
          { id: 'opt_3_2', label: 'Proporção 3:2', explanation: 'Incorreto. A proporção 3:2 define a Quinta Justa.' },
          { id: 'opt_2_1', label: 'Proporção 2:1', explanation: 'Exato! A duplicação exata (2:1) produz a oitava.' },
          { id: 'opt_4_3', label: 'Proporção 4:3', explanation: 'Incorreto. A proporção 4:3 define a Quarta Justa.' },
          { id: 'opt_5_4', label: 'Proporção 5:4', explanation: 'Incorreto. A proporção 5:4 define a Terça Maior justa.' },
        ],
        feedbackCorrect: 'Correto! A proporção 2:1 representa a divisão da corda ao meio e a duplicação periódica da frequência.',
        feedbackIncorrect: 'Revise o experimento pitagórico no monocórdio: dividir a corda pela metade duplica a vibração (2:1).',
        hints: ['Pense na duplicação de 220 Hz para 440 Hz.'],
      },
      KIDS: {
        instruction: 'Descubra como o papai urso e o bebê urso cantam juntos!',
        contextPrompt: 'O Papai Urso bate o tambor 1 vez e o Bebê Urso bate bem rapidinho exatamente o dobro de vezes!',
        question: 'Quantas vezes mais rápido o som da oitava fininha vibra?',
        options: [
          { id: 'opt_3_2', label: '3 vezes', explanation: 'Não foi dessa vez.' },
          { id: 'opt_2_1', label: 'Exatamente 2 vezes (o dobro!)', explanation: 'Isso mesmo! O dobro de velocidade!' },
          { id: 'opt_4_3', label: '4 vezes', explanation: 'Quatro vezes seria duas oitavas!' },
          { id: 'opt_5_4', label: '5 vezes', explanation: 'Não.' },
        ],
        feedbackCorrect: 'Uau! Você é um verdadeiro cientista da música! Vibra o dobro!',
        feedbackIncorrect: 'Lembre-se: é o dobro, ou seja, 2 vezes!',
        hints: ['É o dobro do som!'],
      },
    },
  },
  {
    id: 'act_fomt_102_1_escala',
    lessonId: 'les_fomt_102_1',
    courseId: 'crs_fomt_01',
    canonicalId: 'act_canon_major_semitones',
    type: 'scale_degree',
    difficulty: 'intermediario',
    skills: ['Construção de Escala Maior', 'Graus Escalares'],
    correctAnswer: 'opt_iii_iv_vii_viii',
    variants: {
      TRADITIONAL: {
        instruction: 'Localize a posição precisa dos semitons naturais na escala maior diatônica.',
        contextPrompt: 'A fórmula intervalar invariante da escala maior diatônica organiza tons e semitons em posições estritas.',
        question: 'Entre quais graus da escala maior diatônica ocorrem os dois intervalos de semitom?',
        options: [
          { id: 'opt_i_ii_iv_v', label: 'Entre I–II e IV–V', explanation: 'Incorreto. Entre I e II a distância é de um tom.' },
          { id: 'opt_iii_iv_vii_viii', label: 'Entre III–IV e VII–VIII (ou I superior)', explanation: 'Perfeito! Em Dó Maior: Mi-Fá (III-IV) e Si-Dó (VII-VIII).' },
          { id: 'opt_ii_iii_v_vi', label: 'Entre II–III e V–VI', explanation: 'Incorreto. Nessas posições a distância é de tom inteiro.' },
          { id: 'opt_iv_v_vi_vii', label: 'Entre IV–V e VI–VII', explanation: 'Incorreto.' },
        ],
        feedbackCorrect: 'Resposta irretocável! Os semitons diatônicos da escala maior situam-se rigorosamente entre os graus 3º–4º e 7º–8º.',
        feedbackIncorrect: 'Considere a escala de Dó Maior: C(I)-D(II)-E(III)-F(IV)-G(V)-A(VI)-B(VII)-C(VIII). Onde estão Mi-Fá e Si-Dó?',
        hints: ['Lembre-se de onde estão as notas naturais Mi-Fá e Si-Dó.'],
      },
      KIDS: {
        instruction: 'Onde estão os dois passinhos pequenininhos da formiguinha?',
        contextPrompt: 'Na escada da música, a formiguinha só dá passinho curto em dois lugares muito especiais.',
        question: 'Onde ficam os degrauzinhos pequenos?',
        options: [
          { id: 'opt_i_ii_iv_v', label: 'Logo no comecinho', explanation: 'No comecinho o elefante dá um passo grande!' },
          { id: 'opt_iii_iv_vii_viii', label: 'Do 3º para o 4º e do 7º para o 8º degrau!', explanation: 'Isso! Mi-Fá e Si-Dó!' },
          { id: 'opt_ii_iii_v_vi', label: 'No meio do caminho', explanation: 'Não.' },
          { id: 'opt_iv_v_vi_vii', label: 'Em lugar nenhum', explanation: 'Não.' },
        ],
        feedbackCorrect: 'Maravilha! Você encontrou os esconderijos da formiguinha!',
        feedbackIncorrect: 'Procure os degraus 3 para 4 e 7 para 8!',
        hints: ['Pense no Mi-Fá e Si-Dó.'],
      },
    },
  },
  {
    id: 'act_fomt_102_2_triades',
    lessonId: 'les_fomt_102_2',
    courseId: 'crs_fomt_01',
    canonicalId: 'act_canon_primary_chords',
    type: 'cadence_analysis',
    difficulty: 'intermediario',
    skills: ['Tríades Primárias', 'Harmonia Funcional'],
    correctAnswer: 'opt_i_iv_v',
    variants: {
      TRADITIONAL: {
        instruction: 'Identifique a tríade funcional de repouso e resolução máxima.',
        contextPrompt: 'Na harmonia tonal funcional ocidental, os graus harmônicos recebem papéis sintáticos específicos.',
        question: 'Quais são os três graus diatônicos que formam as Tríades Primárias da tonalidade maior?',
        options: [
          { id: 'opt_i_ii_iii', label: 'Graus I, II e III', explanation: 'Incorreto. II e III são tríades menores secundárias.' },
          { id: 'opt_i_iv_v', label: 'Graus I (Tônica), IV (Subdominante) e V (Dominante)', explanation: 'Exato! As três tríades maiores fundamentais da tonalidade.' },
          { id: 'opt_ii_iv_vi', label: 'Graus II, IV e VI', explanation: 'Incorreto.' },
          { id: 'opt_iii_vi_vii', label: 'Graus III, VI e VII', explanation: 'Incorreto.' },
        ],
        feedbackCorrect: 'Parabéns! Os graus I, IV e V encerram toda a gama tonal diatônica e regem as cadências clássicas.',
        feedbackIncorrect: 'Considere os três acordes maiores puros da escala de Dó: C (I), F (IV) e G (V).',
        hints: ['São a Tônica, a Subdominante e a Dominante.'],
      },
      KIDS: {
        instruction: 'Quem são os três grandes heróis do Castelo Musical?',
        contextPrompt: 'Os três heróis que resolvem todas as aventuras da orquestra.',
        question: 'Quem são os 3 heróis que tocam juntos?',
        options: [
          { id: 'opt_i_ii_iii', label: 'Os heróis 1, 2 e 3', explanation: 'Não.' },
          { id: 'opt_i_iv_v', label: 'O Rei (I), o Cavaleiro (IV) e o Mago (V)!', explanation: 'Viva! Você acertou em cheio!' },
          { id: 'opt_ii_iv_vi', label: 'Os ajudantes da cozinha', explanation: 'Não.' },
          { id: 'opt_iii_vi_vii', label: 'Os guardas da torre', explanation: 'Não.' },
        ],
        feedbackCorrect: 'Incrível! O Rei, o Cavaleiro e o Mago comandam a festa!',
        feedbackIncorrect: 'Procure os graus I, IV e V!',
        hints: ['Rei I, Cavaleiro IV e Mago V!'],
      },
    },
  },
];

// ---------------------------------------------------------------------------
// 7. ASSESSMENTS
// ---------------------------------------------------------------------------

export const SEED_ASSESSMENTS: AcademyAssessment[] = [
  {
    id: 'asm_fomt_01_final',
    courseId: 'crs_fomt_01',
    moduleId: 'mod_fomt_102',
    title: 'Exame de Avaliação Canônica: Fundamentos I',
    description:
      'Avaliação somativa oficial para validação de competências teóricas e emissão de Certificado Acadêmico. Persiste tentativas, respostas, pontuação e parecer pedagógico.',
    passingScorePercentage: 75,
    timeLimitMinutes: 30,
    competenciesTested: [
      'Notação Alfabética & Alturas',
      'Acústica e Oitavas',
      'Escala Maior Diatônica',
      'Harmonia Primária (I - IV - V)',
    ],
    questions: [
      {
        id: 'q1',
        prompt: 'Qual nota musical é representada pela letra "E" na notação alfabética internacional?',
        skill: 'Notação Alfabética & Alturas',
        options: [
          { id: 'q1_a', label: 'Dó' },
          { id: 'q1_b', label: 'Mi' },
          { id: 'q1_c', label: 'Sol' },
          { id: 'q1_d', label: 'Si' },
        ],
        correctOptionId: 'q1_b',
        explanation: 'A sequência C=Dó, D=Ré, E=Mi estabelece que a letra E representa a nota Mi.',
      },
      {
        id: 'q2',
        prompt: 'Se uma corda de violoncelo vibra a 65.4 Hz (Dó 2), qual será a frequência fundamental da nota situada exatamente uma oitava acima (Dó 3)?',
        skill: 'Acústica e Oitavas',
        options: [
          { id: 'q2_a', label: '130.8 Hz (duas vezes 65.4 Hz)' },
          { id: 'q2_b', label: '98.1 Hz' },
          { id: 'q2_c', label: '196.2 Hz' },
          { id: 'q2_d', label: '65.4 Hz' },
        ],
        correctOptionId: 'q2_a',
        explanation: 'A oitava acústica possui razão 2:1, portanto 65.4 Hz × 2 = 130.8 Hz.',
      },
      {
        id: 'q3',
        prompt: 'Qual acidente musical é obrigatório para construir corretamente a escala de Sol Maior a partir de sua fórmula intervalar?',
        skill: 'Escala Maior Diatônica',
        options: [
          { id: 'q3_a', label: 'Si bemol (Bb)' },
          { id: 'q3_b', label: 'Fá sustenido (F#)' },
          { id: 'q3_c', label: 'Dó sustenido (C#)' },
          { id: 'q3_d', label: 'Sol sustenido (G#)' },
        ],
        correctOptionId: 'q3_b',
        explanation: 'Para manter o semitom diatônico entre o 7º e o 8º grau (F# -> G), o Fá deve ser elevado em meio-tom por um sustenido.',
      },
      {
        id: 'q4',
        prompt: 'Em uma cadência tonal autêntica clássica, qual tríade primária gera a máxima tensão que exige resolução imediata na Tônica (I)?',
        skill: 'Harmonia Primária (I - IV - V)',
        options: [
          { id: 'q4_a', label: 'A tríade de Subdominante (IV)' },
          { id: 'q4_b', label: 'A tríade de Dominante (V)' },
          { id: 'q4_c', label: 'A tríade de Supertônica (II)' },
          { id: 'q4_d', label: 'A tríade de Mediante (III)' },
        ],
        correctOptionId: 'q4_b',
        explanation: 'A Dominante (V) contém a sensível diatônica da tonalidade, criando o vetor máximo de tensão harmônica direcionado à Tônica (I).',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 8. FORMATIVE QUIZZES (Checagem Rápida de Compreensão)
// ---------------------------------------------------------------------------

export const SEED_QUIZZES: AcademyQuiz[] = [
  {
    id: 'quiz_fomt_01_check',
    courseId: 'crs_fomt_01',
    moduleId: 'mod_fomt_101',
    lessonId: 'les_fomt_101_1',
    title: 'Quiz Rápido: Notação Alfabética e Reconhecimento de Notas',
    description: 'Checagem formativa de 3 minutos com feedback explicativo imediato para fixar os conceitos da Lição.',
    estimatedMinutes: 3,
    passingScorePercentage: 70,
    questions: [
      {
        id: 'qz_1',
        prompt: 'Na notação internacional usada em tratados e softwares musicais, a letra "A" representa qual nota?',
        options: [
          { id: 'qz_1_a', text: 'Dó' },
          { id: 'qz_1_b', text: 'Lá' },
          { id: 'qz_1_c', text: 'Fá' },
          { id: 'qz_1_d', text: 'Si' },
        ],
        correctOptionId: 'qz_1_b',
        explanation: 'A notação anglo-germânica inicia a contagem da letra A a partir da nota Lá (A=Lá, B=Si, C=Dó, D=Ré, E=Mi, F=Fá, G=Sol).',
        skill: 'Notação Alfabética',
      },
      {
        id: 'qz_2',
        prompt: 'Quantas notas compõem uma oitava diatônica completa, do ponto de partida até sua repetição duplicada?',
        options: [
          { id: 'qz_2_a', text: '5 notas' },
          { id: 'qz_2_b', text: '7 notas distintas mais a repetição da fundamental (8ª)' },
          { id: 'qz_2_c', text: '12 notas apenas sem repetição' },
          { id: 'qz_2_d', text: '4 notas' },
        ],
        correctOptionId: 'qz_2_b',
        explanation: 'A oitava recebe este nome exatamente por abranger os 7 graus diatônicos seguidos pela 8ª nota que repete a primeira numa razão de frequência 2:1.',
        skill: 'Acústica & Oitavas',
      },
      {
        id: 'qz_3',
        prompt: 'Qual é o intervalo existente entre a tônica e o 3º grau da escala de Dó Maior (Dó - Mi)?',
        options: [
          { id: 'qz_3_a', text: 'Terça Menor (1 tom e 1 semitom)' },
          { id: 'qz_3_b', text: 'Terça Maior (2 tons inteiros)' },
          { id: 'qz_3_c', text: 'Quarta Justa' },
          { id: 'qz_3_d', text: 'Segunda Maior' },
        ],
        correctOptionId: 'qz_3_b',
        explanation: 'De Dó a Ré há 1 tom, e de Ré a Mi há outro tom, totalizando 2 tons (Terça Maior).',
        skill: 'Identificação Intervalar',
      },
    ],
  },
  {
    id: 'quiz_fomt_02_check',
    courseId: 'crs_fomt_02',
    moduleId: 'mod_fomt_201',
    lessonId: 'les_fomt_102_1',
    title: 'Quiz Rápido: Métrica, Compassos e Cadências',
    description: 'Teste sua compreensão das relações de pulso, fórmulas de compasso e respiração harmônica cadencial.',
    estimatedMinutes: 4,
    passingScorePercentage: 70,
    questions: [
      {
        id: 'qz_4',
        prompt: 'Em um compasso 3/4, quantas semínimas preenchem exatamente um compasso completo?',
        options: [
          { id: 'qz_4_a', text: '2 semínimas' },
          { id: 'qz_4_b', text: '3 semínimas' },
          { id: 'qz_4_c', text: '4 semínimas' },
          { id: 'qz_4_d', text: '6 semínimas' },
        ],
        correctOptionId: 'qz_4_b',
        explanation: 'O número superior 3 indica a quantidade de tempos, e o número inferior 4 representa a semínima (figura de valor 1/4 da semibreve).',
        skill: 'Fórmula de Compasso',
      },
      {
        id: 'qz_5',
        prompt: 'A cadência conhecida historicamente como "Cadência do Amém", encontrada nos encerramentos sacros, é a:',
        options: [
          { id: 'qz_5_a', text: 'Cadência Autêntica Perfeita (V - I)' },
          { id: 'qz_5_b', text: 'Cadência Plagal (IV - I)' },
          { id: 'qz_5_c', text: 'Cadência Deceptiva ou Interrompida (V - VI)' },
          { id: 'qz_5_d', text: 'Meia Cadência (I - V)' },
        ],
        correctOptionId: 'qz_5_b',
        explanation: 'A progressão IV para I é classicamente denominada Cadência Plagal ou "Cadência do Amém" pela sua sonoridade solene e repousante.',
        skill: 'Cadências Tonais',
      },
    ],
  },
];
