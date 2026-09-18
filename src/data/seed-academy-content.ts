import { CURSO_TEORIA, MODULOS_TEORIA, LICOES_TEORIA } from './seed-theory-course';
import { CURSO_OCIDENTAL, MODULOS_OCIDENTAL, LICOES_OCIDENTAL } from './seed-ocidental-course';
import { CURSO_BRASIL, MODULOS_BRASIL, LICOES_BRASIL } from './seed-brasil-course';
import { CURSO_VIOLINO, MODULOS_VIOLINO, LICOES_VIOLINO } from './seed-violino-course';
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
import { CourseLevel } from '../domain/types';
import { PROVAS_PADRAO } from './seed-booklets';

/**
 * Catálogo do Academy.
 *
 * O QUE SAIU DAQUI, E POR QUÊ
 * ---------------------------
 * Este arquivo continha três cursos que nunca existiram — "Fundamentos de
 * Teoria Musical I e II" e "Contraponto Polifônico" —, com ementas, módulos,
 * lições, provas e questionários escritos por inteiro, atribuídos a uma
 * docente que morreu em 1896, com foto de banco de imagens e o autor
 * `usr_founder_1`. Em cima deles havia dois "programas acadêmicos integrados"
 * e três "trilhas formativas graduadas", igualmente inventados.
 *
 * Nada disso foi produzido pelo Conservatório. Era cenário. Foi removido.
 *
 * O QUE ESTÁ AQUI AGORA
 * ---------------------
 * Os quatro cursos reais, escritos e revisados internamente:
 *
 *   Teoria da Música            58 capítulos
 *   História da Música Ocidental 20 capítulos
 *   História da Música Brasileira 18 capítulos
 *   Violino                      16 capítulos
 *
 * E os programas, que são combinações desses cursos numa ordem que faz
 * sentido cursar. Um programa nunca é uma entidade solta: ele referencia
 * cursos que existem, e sua carga horária é a soma da carga deles.
 */

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

export const SEED_CATEGORIES: AcademyCategory[] = [
  {
    id: 'cat_teoria',
    slug: 'teoria-musical',
    name: 'Teoria Musical',
    description:
      'A gramática da música: notação, alturas, durações, intervalos, escalas, métrica, harmonia e transposição.',
    iconName: 'Music',
    color: 'border-anil-700 text-anil-800 bg-anil-50',
    courseCount: 1,
    featuredCourseIds: [CURSO_TEORIA.id],
    skills: CURSO_TEORIA.competencies,
  },
  {
    id: 'cat_historia',
    slug: 'historia-da-musica',
    name: 'História da Música',
    description:
      'A música ocidental da Antiguidade ao século XX, e a formação da música brasileira das matrizes ao presente.',
    iconName: 'BookOpen',
    color: 'border-ouro-600 text-ouro-700 bg-ouro-50',
    courseCount: 2,
    featuredCourseIds: [CURSO_OCIDENTAL.id, CURSO_BRASIL.id],
    skills: Array.from(
      new Set([...CURSO_OCIDENTAL.competencies, ...CURSO_BRASIL.competencies])
    ),
  },
  {
    id: 'cat_instrumento',
    slug: 'instrumento',
    name: 'Instrumento',
    description:
      'Técnica instrumental com medição acústica real de afinação e tempo, e repertório de domínio público por nível.',
    iconName: 'Music2',
    color: 'border-stone-400 text-stone-700 bg-stone-50',
    courseCount: 1,
    featuredCourseIds: [CURSO_VIOLINO.id],
    skills: CURSO_VIOLINO.competencies,
  },
];

// ---------------------------------------------------------------------------
// Cursos
// ---------------------------------------------------------------------------

export const SEED_COURSES: AcademyCourse[] = [
  CURSO_TEORIA,
  CURSO_OCIDENTAL,
  CURSO_BRASIL,
  CURSO_VIOLINO,
];

// ---------------------------------------------------------------------------
// Programas — combinações de cursos
// ---------------------------------------------------------------------------

const AGORA = '2026-09-17T00:00:00.000Z';

/** Soma a carga horária dos cursos de um programa. Nada de número inventado. */
function carga(ids: string[]): number {
  return SEED_COURSES.filter((c) => ids.includes(c.id)).reduce(
    (a, c) => a + c.workloadHours,
    0
  );
}

const IDS_HISTORIA = [CURSO_OCIDENTAL.id, CURSO_BRASIL.id];
const IDS_INSTRUMENTISTA = [CURSO_TEORIA.id, CURSO_VIOLINO.id];
const IDS_FORMACAO = [CURSO_TEORIA.id, CURSO_OCIDENTAL.id, CURSO_BRASIL.id, CURSO_VIOLINO.id];

export const SEED_PROGRAMS: Program[] = [
  {
    id: 'prg_historia_da_musica',
    slug: 'programa-historia-da-musica',
    title: 'História da Música',
    subtitle: 'A tradição ocidental e a formação brasileira, na mesma linha do tempo.',
    description:
      'Reúne os dois cursos de história. O percurso ocidental dá o sistema de referência; o ' +
      'percurso brasileiro mostra o que acontece quando esse sistema encontra outras matrizes. ' +
      'Cursar os dois na sequência é o que permite ler a música brasileira sem tomá-la como ' +
      'desvio nem como exotismo.',
    workloadHours: carga(IDS_HISTORIA),
    estimatedMonths: 6,
    pathIds: ['pth_historia_ocidental', 'pth_historia_brasil'],
    prerequisites: [],
    competencies: Array.from(
      new Set([...CURSO_OCIDENTAL.competencies, ...CURSO_BRASIL.competencies])
    ),
    targetAudience: 'Estudantes de música, professores e ouvintes que querem contexto.',
    certificateTitle: 'Certificado do Programa de História da Música',
    isPublished: true,
    createdAt: AGORA,
    updatedAt: AGORA,
  },
  {
    id: 'prg_instrumentista',
    slug: 'programa-instrumentista',
    title: 'Instrumentista — Violino',
    subtitle: 'A teoria que o instrumento exige, e o instrumento que a teoria explica.',
    description:
      'Teoria da Música e Violino cursados em paralelo. A teoria deixa de ser abstrata quando ' +
      'cada intervalo tem um dedo correspondente, e a técnica deixa de ser mecânica quando se ' +
      'entende o que se está tocando. É a combinação que a plataforma recomenda a quem começa ' +
      'num instrumento.',
    workloadHours: carga(IDS_INSTRUMENTISTA),
    estimatedMonths: 8,
    pathIds: ['pth_teoria', 'pth_violino'],
    prerequisites: [],
    competencies: Array.from(
      new Set([...CURSO_TEORIA.competencies, ...CURSO_VIOLINO.competencies])
    ),
    targetAudience: 'Quem está começando no violino, com ou sem leitura prévia.',
    certificateTitle: 'Certificado do Programa de Instrumentista — Violino',
    isPublished: true,
    createdAt: AGORA,
    updatedAt: AGORA,
  },
  {
    id: 'prg_formacao_completa',
    slug: 'programa-formacao-completa',
    title: 'Formação Completa',
    subtitle: 'Os quatro cursos do Conservatório, na ordem em que se sustentam.',
    description:
      'Teoria, as duas histórias e o instrumento. É o percurso integral do que o Conservatório ' +
      'publica hoje — a gramática, o contexto e a prática. Cursado inteiro, cobre o que se ' +
      'espera de uma formação musical de base.',
    workloadHours: carga(IDS_FORMACAO),
    estimatedMonths: 14,
    pathIds: ['pth_teoria', 'pth_historia_ocidental', 'pth_historia_brasil', 'pth_violino'],
    prerequisites: [],
    competencies: Array.from(
      new Set(SEED_COURSES.flatMap((c) => c.competencies))
    ),
    targetAudience: 'Quem quer formação musical de base completa.',
    certificateTitle: 'Certificado do Programa de Formação Completa',
    isPublished: true,
    createdAt: AGORA,
    updatedAt: AGORA,
  },
];

// ---------------------------------------------------------------------------
// Trilhas — um curso cada, na ordem do programa
// ---------------------------------------------------------------------------

export const SEED_PATHS: LearningPath[] = [
  {
    id: 'pth_teoria',
    programId: 'prg_instrumentista',
    order: 1,
    slug: 'trilha-teoria',
    title: CURSO_TEORIA.title,
    subtitle: CURSO_TEORIA.subtitle,
    description: CURSO_TEORIA.description,
    courseIds: [CURSO_TEORIA.id],
    workloadHours: CURSO_TEORIA.workloadHours,
    level: CourseLevel.FUNDAMENTAL,
    skills: CURSO_TEORIA.competencies,
  },
  {
    id: 'pth_historia_ocidental',
    programId: 'prg_historia_da_musica',
    order: 1,
    slug: 'trilha-historia-ocidental',
    title: CURSO_OCIDENTAL.title,
    subtitle: CURSO_OCIDENTAL.subtitle,
    description: CURSO_OCIDENTAL.description,
    courseIds: [CURSO_OCIDENTAL.id],
    workloadHours: CURSO_OCIDENTAL.workloadHours,
    level: CourseLevel.INTERMEDIARIO,
    skills: CURSO_OCIDENTAL.competencies,
  },
  {
    id: 'pth_historia_brasil',
    programId: 'prg_historia_da_musica',
    order: 2,
    slug: 'trilha-historia-brasil',
    title: CURSO_BRASIL.title,
    subtitle: CURSO_BRASIL.subtitle,
    description: CURSO_BRASIL.description,
    courseIds: [CURSO_BRASIL.id],
    workloadHours: CURSO_BRASIL.workloadHours,
    level: CourseLevel.INTERMEDIARIO,
    skills: CURSO_BRASIL.competencies,
  },
  {
    id: 'pth_violino',
    programId: 'prg_instrumentista',
    order: 2,
    slug: 'trilha-violino',
    title: CURSO_VIOLINO.title,
    subtitle: CURSO_VIOLINO.subtitle,
    description: CURSO_VIOLINO.description,
    courseIds: [CURSO_VIOLINO.id],
    workloadHours: CURSO_VIOLINO.workloadHours,
    level: CourseLevel.FUNDAMENTAL,
    skills: CURSO_VIOLINO.competencies,
  },
];

// ---------------------------------------------------------------------------
// Módulos e lições
// ---------------------------------------------------------------------------

export const SEED_MODULES: AcademyModule[] = [
  ...MODULOS_TEORIA,
  ...MODULOS_OCIDENTAL,
  ...MODULOS_BRASIL,
  ...MODULOS_VIOLINO,
];

export const SEED_LESSONS: AcademyLesson[] = [
  ...LICOES_TEORIA,
  ...LICOES_OCIDENTAL,
  ...LICOES_BRASIL,
  ...LICOES_VIOLINO,
];

// ---------------------------------------------------------------------------
// Atividades, avaliações e questionários
// ---------------------------------------------------------------------------

/**
 * Os exercícios de cada curso vivem no livreto correspondente, que é editável
 * pelo Conservatório e alimenta o simulado.
 *
 * A prova final **não é escrita à mão**: sai do livreto, sorteada com semente
 * fixa e garantindo uma questão de cada competência antes de preencher o
 * resto. Consequência prática — corrigir uma questão no livreto corrige o
 * simulado, e a próxima geração da prova já sai correta.
 */
export const SEED_ACTIVITIES: AcademyActivity[] = [];

export const SEED_ASSESSMENTS: AcademyAssessment[] = PROVAS_PADRAO.map((p) => ({
  id: p.id,
  courseId: p.cursoId,
  title: p.titulo,
  description:
    'Prova final do curso. Cobre todas as competências, com questões sorteadas do caderno de exercícios.',
  passingScorePercentage: p.notaDeCorte,
  competenciesTested: Array.from(
    new Set(p.questoesProprias.flatMap((q) => q.competencias))
  ).sort(),
  timeLimitMinutes: p.tempoLimiteMinutos,
  questions: p.questoesProprias.map((q) => ({
    id: q.id,
    prompt: q.enunciado,
    options: q.alternativas.map((a) => ({ id: a.id, label: a.texto, text: a.texto })),
    correctOptionId: q.resposta,
    explanation: q.explicacao,
    skill: q.competencias[0] ?? 'geral',
  })),
  createdAt: AGORA,
  updatedAt: AGORA,
}));

export const SEED_QUIZZES: AcademyQuiz[] = [];
