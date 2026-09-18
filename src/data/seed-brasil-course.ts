import { AcademyCourse, AcademyModule, AcademyLesson, LessonBlock } from '../domain/academy';
import { CourseLevel } from '../domain/types';
import { CAPITULOS_BRASIL, COMPETENCIAS_BRASIL, CARGA_BRASIL } from './brasil/capitulos';
import { BLOCOS_BR_01_09 } from './brasil/blocos-01-09';
import { BLOCOS_BR_10_18 } from './brasil/blocos-10-18';

/**
 * Curso de História da Música Brasileira — conteúdo autoral do Conservatório.
 *
 * Dezoito capítulos, das matrizes formadoras à circulação digital. As linhas
 * erudita e popular correm juntas de propósito: separá-las produziria um
 * retrato falso de um país onde elas nunca estiveram separadas.
 */

const AUTOR = {
  authorId: 'conservatorio',
  authorName: 'Conservatório Muscicapa',
  authorTitle: 'Cátedra de Musicologia Brasileira',
};

const AGORA = '2026-09-17T00:00:00.000Z';

const idModulo = (n: number) => `mod_bras_${String(n).padStart(2, '0')}`;
const idLicao = (n: number) => `les_bras_${String(n).padStart(2, '0')}`;

export const CURSO_BRASIL: AcademyCourse = {
  id: 'crs_historia_brasil',
  slug: 'historia-da-musica-brasileira',
  categoryId: 'cat_historia',
  categoryName: 'História da Música',
  title: 'História da Música Brasileira',
  subtitle: 'Das três matrizes à circulação digital, com a erudita e a popular na mesma linha.',
  description:
    'Dezoito capítulos sobre a formação da música brasileira. Percorre o período colonial, a ' +
    'corte, o romantismo imperial, o nacionalismo em três gerações e a vanguarda — e, na mesma ' +
    'linha do tempo, a modinha, o choro, o samba, a bossa nova, o tropicalismo e os repertórios ' +
    'regionais. A pergunta que atravessa o curso é quem define o que é música brasileira, e com ' +
    'que autoridade.',
  level: CourseLevel.INTERMEDIARIO,
  workloadHours: CARGA_BRASIL,
  ...AUTOR,
  authorBio:
    'A cátedra de musicologia brasileira reúne o material didático escrito e revisado internamente pelo Conservatório.',
  objectives: [
    'Descrever as matrizes formadoras sem reduzi-las à fórmula das três raças.',
    'Situar o barroco mineiro e a música da corte em suas condições materiais.',
    'Explicar a formação da música popular urbana, do lundu ao samba.',
    'Caracterizar o programa nacionalista e as tensões que ele carrega.',
    'Analisar a reforma técnica da bossa nova.',
    'Reconhecer os repertórios regionais que a concentração da indústria deixou de fora.',
  ],
  competencies: COMPETENCIAS_BRASIL,
  skills: ['escuta-historica', 'contexto', 'analise-critica'],
  prerequisites: [],
  materials: [],
  curriculumSummary:
    '18 capítulos · 18 lições com exemplos sonoros · exercícios de fixação ao fim de cada capítulo.',
  assessmentPolicy:
    'Cada capítulo termina com um checkpoint de leitura. A prova final cobre a periodização inteira.',
  certificatePolicy:
    'Certificado de curso livre emitido ao concluir os 18 capítulos com 70% de acerto na prova final.',
  certificateInfo: {
    title: 'Certificado em História da Música Brasileira',
    accreditation: 'Curso livre de qualificação profissional. Certificação própria.',
    criteria: 'Conclusão dos 18 capítulos e 70% de acerto na prova final.',
  },
  moduleIds: CAPITULOS_BRASIL.map((c) => idModulo(c.numero)),
  isPublished: true,
  createdAt: AGORA,
  updatedAt: AGORA,
};

export const MODULOS_BRASIL: AcademyModule[] = CAPITULOS_BRASIL.map((c) => ({
  id: idModulo(c.numero),
  courseId: CURSO_BRASIL.id,
  order: c.numero,
  title: `${c.numero}. ${c.titulo}`,
  description: `${c.periodo} — ${c.descricao}`,
  objectives: c.objetivos,
  lessonIds: [idLicao(c.numero)],
  createdAt: AGORA,
  updatedAt: AGORA,
}));

const BLOCOS: Record<number, LessonBlock[]> = {
  ...BLOCOS_BR_01_09,
  ...BLOCOS_BR_10_18,
};

export const LICOES_BRASIL: AcademyLesson[] = CAPITULOS_BRASIL.map((c) => {
  const id = idLicao(c.numero);
  const blocos = BLOCOS[c.numero] ?? [];
  return {
    id,
    moduleId: idModulo(c.numero),
    courseId: CURSO_BRASIL.id,
    order: 1,
    canonicalContentId: `canon_bras_${c.numero}`,
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

export { CAPITULOS_BRASIL };
