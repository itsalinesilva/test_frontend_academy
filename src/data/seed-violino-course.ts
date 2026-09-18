import { AcademyCourse, AcademyModule, AcademyLesson } from '../domain/academy';
import { CourseLevel } from '../domain/types';
import { CAPITULOS_VIOLINO, COMPETENCIAS_VIOLINO, CARGA_VIOLINO } from './violino/capitulos';
import { BLOCOS_VIOLINO } from './violino/blocos';

/**
 * Curso de Violino — conteúdo autoral do Conservatório.
 *
 * Dezesseis capítulos, do instrumento ao board de prática. A ordem é a do
 * aprendizado real: instrumento, corpo, som, mão esquerda, leitura, técnica,
 * repertório.
 *
 * O curso termina apontando para o simulador, onde o acervo de obras — todas
 * de domínio público — está organizado nos quatro níveis. O board não é
 * apêndice: é o destino do curso.
 */

const AUTOR = {
  authorId: 'conservatorio',
  authorName: 'Conservatório Muscicapa',
  authorTitle: 'Cátedra de Cordas',
};

const AGORA = '2026-09-17T00:00:00.000Z';

const idModulo = (n: number) => `mod_vln_${String(n).padStart(2, '0')}`;
const idLicao = (n: number) => `les_vln_${String(n).padStart(2, '0')}`;

export const CURSO_VIOLINO: AcademyCourse = {
  id: 'crs_violino',
  slug: 'violino',
  categoryId: 'cat_instrumento',
  categoryName: 'Instrumento',
  title: 'Violino',
  subtitle: 'Do instrumento ao repertório, com medição real de afinação e tempo.',
  description:
    'Dezesseis capítulos cobrindo o instrumento, a postura, a produção de som, a mão esquerda, ' +
    'a leitura aplicada e a técnica de arco — até a prática de repertório. Cada capítulo termina ' +
    'com o que fazer com o violino na mão. O curso desemboca no board de prática, onde o acervo ' +
    'de obras de domínio público está organizado em quatro níveis e a execução é medida em ' +
    'afinação e tempo pelo motor acústico da plataforma.',
  level: CourseLevel.FUNDAMENTAL,
  workloadHours: CARGA_VIOLINO,
  ...AUTOR,
  authorBio:
    'A cátedra de cordas reúne o material didático escrito e revisado internamente pelo Conservatório.',
  objectives: [
    'Conhecer o instrumento, afiná-lo e conservá-lo.',
    'Adotar postura sustentável, sem tensão prejudicial.',
    'Controlar velocidade, peso e ponto de contato para produzir som.',
    'Tocar em primeira e terceira posições com afinação verificável.',
    'Ler uma parte de violino com seus sinais próprios.',
    'Executar as articulações fundamentais e os golpes que saem da corda.',
    'Organizar o estudo sozinho e progredir pelos níveis do acervo.',
  ],
  competencies: COMPETENCIAS_VIOLINO,
  skills: ['tecnica-instrumental', 'afinacao', 'leitura'],
  prerequisites: [],
  materials: [],
  curriculumSummary:
    '16 capítulos · 16 lições com laboratório de afinação · board de prática em 4 níveis, só com obras de domínio público.',
  assessmentPolicy:
    'Cada capítulo termina com um checkpoint. A avaliação prática usa a medição de afinação e ' +
    'tempo do simulador — que é diagnóstico, e não nota de julgamento.',
  certificatePolicy:
    'Certificado de curso livre emitido ao concluir os 16 capítulos e atingir domínio em ao menos ' +
    'uma obra de cada um dos três primeiros níveis do acervo.',
  certificateInfo: {
    title: 'Certificado em Violino — Fundamentos',
    accreditation: 'Curso livre de qualificação profissional. Certificação própria.',
    criteria: 'Conclusão dos 16 capítulos e domínio em obras dos níveis 1, 2 e 3.',
  },
  moduleIds: CAPITULOS_VIOLINO.map((c) => idModulo(c.numero)),
  isPublished: true,
  createdAt: AGORA,
  updatedAt: AGORA,
};

export const MODULOS_VIOLINO: AcademyModule[] = CAPITULOS_VIOLINO.map((c) => ({
  id: idModulo(c.numero),
  courseId: CURSO_VIOLINO.id,
  order: c.numero,
  title: `${c.numero}. ${c.titulo}`,
  description:
    c.nivelDoAcervo > 0
      ? `${c.descricao} · prepara o nível ${c.nivelDoAcervo} do acervo`
      : c.descricao,
  objectives: c.objetivos,
  lessonIds: [idLicao(c.numero)],
  createdAt: AGORA,
  updatedAt: AGORA,
}));

export const LICOES_VIOLINO: AcademyLesson[] = CAPITULOS_VIOLINO.map((c) => {
  const id = idLicao(c.numero);
  const blocos = BLOCOS_VIOLINO[c.numero] ?? [];
  return {
    id,
    moduleId: idModulo(c.numero),
    courseId: CURSO_VIOLINO.id,
    order: 1,
    canonicalContentId: `canon_vln_${c.numero}`,
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

export { CAPITULOS_VIOLINO };
