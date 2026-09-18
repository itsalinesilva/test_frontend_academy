import { AcademyCourse, AcademyModule, AcademyLesson, LessonBlock } from '../domain/academy';
import { CourseLevel } from '../domain/types';
import {
  CAPITULOS_OCIDENTAL,
  COMPETENCIAS_OCIDENTAL,
  CARGA_OCIDENTAL,
} from './ocidental/capitulos';
import { BLOCOS_OCID_01_10 } from './ocidental/blocos-01-10';
import { BLOCOS_OCID_11_20 } from './ocidental/blocos-11-20';

/**
 * Curso de História da Música Ocidental — conteúdo autoral do Conservatório.
 *
 * Vinte capítulos, da Antiguidade ao século XX, na periodização consolidada
 * da disciplina. O texto é escrito aqui; nenhuma obra de referência é citada.
 *
 * Compositores são nomeados porque são o assunto do curso. O que a regra
 * proíbe é citar a BIBLIOGRAFIA de onde o material de estudo interno veio —
 * não ensinar quem foi Josquin.
 */

const AUTOR = {
  authorId: 'conservatorio',
  authorName: 'Conservatório Muscicapa',
  authorTitle: 'Cátedra de Musicologia Histórica',
};

const AGORA = '2026-09-17T00:00:00.000Z';

const idModulo = (n: number) => `mod_ocid_${String(n).padStart(2, '0')}`;
const idLicao = (n: number) => `les_ocid_${String(n).padStart(2, '0')}`;

export const CURSO_OCIDENTAL: AcademyCourse = {
  id: 'crs_historia_ocidental',
  slug: 'historia-da-musica-ocidental',
  categoryId: 'cat_historia',
  categoryName: 'História da Música',
  title: 'História da Música Ocidental',
  subtitle: 'Do fim do mundo antigo ao século XX, pelos problemas que cada época teve de resolver.',
  description:
    'Vinte capítulos percorrendo a música ocidental da herança grega ao serialismo. O fio não é ' +
    'uma lista de compositores: é a sucessão de problemas técnicos e estéticos — como escrever o ' +
    'ritmo, como combinar vozes independentes, como dar forma a uma peça sem texto, o que fazer ' +
    'quando a tonalidade deixa de organizar o discurso. Cada solução criou o problema seguinte.',
  level: CourseLevel.INTERMEDIARIO,
  workloadHours: CARGA_OCIDENTAL,
  ...AUTOR,
  authorBio:
    'A cátedra de musicologia reúne o material didático escrito e revisado internamente pelo Conservatório.',
  objectives: [
    'Situar qualquer obra do repertório ocidental em seu período e explicar por quê.',
    'Descrever a formação da polifonia e da notação rítmica.',
    'Explicar a passagem da polifonia renascentista à monodia acompanhada.',
    'Caracterizar as formas do barroco, do classicismo e do romantismo.',
    'Compreender a dissolução da tonalidade e as correntes que a sucederam.',
  ],
  competencies: COMPETENCIAS_OCIDENTAL,
  skills: ['escuta-historica', 'analise', 'contexto'],
  prerequisites: [],
  materials: [],
  curriculumSummary:
    '20 capítulos · 20 lições com exemplos sonoros · exercícios de fixação ao fim de cada capítulo.',
  assessmentPolicy:
    'Cada capítulo termina com um checkpoint de leitura. A prova final cobre a periodização inteira.',
  certificatePolicy:
    'Certificado de curso livre emitido ao concluir os 20 capítulos com 70% de acerto na prova final.',
  certificateInfo: {
    title: 'Certificado em História da Música Ocidental',
    accreditation: 'Curso livre de qualificação profissional. Certificação própria.',
    criteria: 'Conclusão dos 20 capítulos e 70% de acerto na prova final.',
  },
  moduleIds: CAPITULOS_OCIDENTAL.map((c) => idModulo(c.numero)),
  isPublished: true,
  createdAt: AGORA,
  updatedAt: AGORA,
};

export const MODULOS_OCIDENTAL: AcademyModule[] = CAPITULOS_OCIDENTAL.map((c) => ({
  id: idModulo(c.numero),
  courseId: CURSO_OCIDENTAL.id,
  order: c.numero,
  title: `${c.numero}. ${c.titulo}`,
  description: `${c.periodo} — ${c.descricao}`,
  objectives: c.objetivos,
  lessonIds: [idLicao(c.numero)],
  createdAt: AGORA,
  updatedAt: AGORA,
}));

const BLOCOS: Record<number, LessonBlock[]> = {
  ...BLOCOS_OCID_01_10,
  ...BLOCOS_OCID_11_20,
};

export const LICOES_OCIDENTAL: AcademyLesson[] = CAPITULOS_OCIDENTAL.map((c) => {
  const id = idLicao(c.numero);
  const blocos = BLOCOS[c.numero] ?? [];
  return {
    id,
    moduleId: idModulo(c.numero),
    courseId: CURSO_OCIDENTAL.id,
    order: 1,
    canonicalContentId: `canon_ocid_${c.numero}`,
    durationMinutes: c.minutos,
    objectives: c.objetivos,
    skills: [c.competencia],
    activityIds: [],
    variants: {
      TRADITIONAL: {
        title: c.titulo,
        summary: c.descricao,
        introduction: `${c.periodo}. ${c.descricao}`,
        sections: [{ id: `${id}_s1`, title: c.titulo, contentMarkdown: '', blocks: blocos }],
        audioSamples: [],
        illustrations: [],
      },
      KIDS: {
        title: c.titulo,
        summary: c.descricao,
        introduction: `${c.periodo}. ${c.descricao}`,
        sections: [{ id: `${id}_s1k`, title: c.titulo, contentMarkdown: '', blocks: blocos }],
        audioSamples: [],
        illustrations: [],
      },
    },
    createdAt: AGORA,
    updatedAt: AGORA,
  };
});

export { CAPITULOS_OCIDENTAL };
