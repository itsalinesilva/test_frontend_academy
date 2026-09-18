import { CURSO_TEORIA, MODULOS_TEORIA, LICOES_TEORIA } from './seed-theory-course';
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

/**
 * Catálogo do Academy.
 *
 * O QUE SAIU DAQUI, E POR QUÊ
 * ---------------------------
 * Este arquivo continha três cursos que nunca existiram — "Fundamentos de
 * Teoria Musical I e II" e "Contraponto Polifônico" —, com ementas, módulos,
 * lições, atividades, provas e questionários escritos por inteiro, atribuídos
 * a uma docente que morreu em 1896, com foto de banco de imagens e o autor
 * `usr_founder_1`. Em cima deles havia dois "programas acadêmicos integrados"
 * e três "trilhas formativas graduadas", igualmente inventados, além de
 * categorias cujo `courseCount` contava cursos inexistentes.
 *
 * Nada disso foi produzido pelo Conservatório. Era cenário: enchia a tela de
 * catálogo para que ela não parecesse vazia. Foi removido inteiro.
 *
 * O QUE FICOU
 * -----------
 * O curso de Teoria da Música, que é escrito, revisado e real — 58 capítulos,
 * 58 módulos, 58 lições com laboratório.
 *
 * O QUE FALTA
 * -----------
 * Os outros três cursos do plano (História da Música Ocidental, História da
 * Música Brasileira e Violino) ainda não foram escritos. Enquanto não forem,
 * não aparecem: um curso só entra no catálogo quando tem conteúdo.
 *
 * Programas são combinações de cursos. Com um curso publicado não há
 * combinação possível, e a lista é honestamente vazia — ela se preenche
 * sozinha quando o segundo curso entrar.
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
];

// ---------------------------------------------------------------------------
// Programas — combinações de cursos
// ---------------------------------------------------------------------------

/**
 * Um programa reúne dois ou mais cursos numa ordem que faz sentido cursar.
 * Ex.: Teoria + Violino; História Ocidental + História Brasileira.
 *
 * Vazio por enquanto porque só há um curso publicado.
 */
export const SEED_PROGRAMS: Program[] = [];

export const SEED_PATHS: LearningPath[] = [];

// ---------------------------------------------------------------------------
// Cursos
// ---------------------------------------------------------------------------

export const SEED_COURSES: AcademyCourse[] = [CURSO_TEORIA];

// ---------------------------------------------------------------------------
// Módulos e lições
// ---------------------------------------------------------------------------

export const SEED_MODULES: AcademyModule[] = [...MODULOS_TEORIA];

export const SEED_LESSONS: AcademyLesson[] = [...LICOES_TEORIA];

// ---------------------------------------------------------------------------
// Atividades, avaliações e questionários
// ---------------------------------------------------------------------------

/**
 * Os exercícios do curso de Teoria vivem no livreto (`seed-booklet-theory`),
 * que é editável pelo Conservatório e alimenta o simulado. As avaliações
 * somativas ainda não foram redigidas — e não se inventa prova.
 */
export const SEED_ACTIVITIES: AcademyActivity[] = [];

export const SEED_ASSESSMENTS: AcademyAssessment[] = [];

export const SEED_QUIZZES: AcademyQuiz[] = [];
