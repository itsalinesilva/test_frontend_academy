import { AcademyCourse, AcademyModule, AcademyLesson, LessonBlock } from '../domain/academy';
import { CourseLevel } from '../domain/types';
import { CAPITULOS_POPULAR, COMPETENCIAS_POPULAR } from './popular/capitulos';
import { BLOCOS_POPULAR } from './popular/blocos';
import { LIVRETO_POPULAR } from './seed-booklet-popular';
import { calculateLessonWorkload, courseHours } from '../domain/workload';

/**
 * Curso de História Social da Música Popular Brasileira.
 *
 * É a **extensão** do curso de História da Música Brasileira, e o segundo do
 * programa. Aquele conta o que se compôs; este conta quem compôs, para quem, e
 * em que condições materiais.
 *
 * Por isso começa em Portugal, dois séculos antes de o Brasil ter cidade: a
 * canção urbana nasce do mesmo processo que esvazia o campo, e sem esse
 * processo não se entende o que vem depois.
 */

const AUTOR = {
  authorId: 'conservatorio',
  authorName: 'Conservatório Muscicapa',
  authorTitle: 'Cátedra de Musicologia Brasileira',
};

const AGORA = '2026-09-17T00:00:00.000Z';

const idModulo = (n: number) => `mod_pop_${String(n).padStart(2, '0')}`;
const idLicao = (n: number) => `les_pop_${String(n).padStart(2, '0')}`;

const BLOCOS: Record<number, LessonBlock[]> = { ...BLOCOS_POPULAR };

/** Carga medida: texto a 160 palavras por minuto, mais exemplos e questões. */
const QUESTOES_POR_CAPITULO = new Map(
  LIVRETO_POPULAR.capitulos.map((c) => [c.numero, c.questoes])
);

const MINUTOS_POR_CAPITULO = new Map(
  CAPITULOS_POPULAR.map((c) => [
    c.numero,
    calculateLessonWorkload(BLOCOS[c.numero] ?? [], QUESTOES_POR_CAPITULO.get(c.numero) ?? []).total,
  ])
);

const CARGA_POPULAR = courseHours([...MINUTOS_POR_CAPITULO.values()]);

export const CURSO_POPULAR: AcademyCourse = {
  id: 'crs_historia_social_popular',
  slug: 'historia-social-da-musica-popular-brasileira',
  categoryId: 'cat_historia',
  categoryName: 'História da Música',
  title: 'História Social da Música Popular Brasileira',
  subtitle: 'Quem fez, para quem, e sob que condições materiais.',
  description:
    'Quatorze capítulos sobre a música popular brasileira como processo social. Começa no ' +
    'esvaziamento do campo português, que produz o indivíduo que canta sozinho, e chega à ' +
    'disputa contemporânea sobre o que presta. Trata dos barbeiros, das irmandades, do maxixe ' +
    'e da reação a ele, do choro e do funcionalismo público, da repressão ao samba e da sua ' +
    'adoção pelo Estado, do rádio que transforma canção em mercadoria, e do juízo de gosto ' +
    'como marcador de classe. Extensão do curso de História da Música Brasileira.',
  level: CourseLevel.INTERMEDIARIO,
  workloadHours: CARGA_POPULAR,
  ...AUTOR,
  authorBio:
    'A cátedra de musicologia brasileira reúne o material didático escrito e revisado internamente pelo Conservatório.',
  objectives: [
    'Relacionar urbanização e o aparecimento da canção individual.',
    'Descrever as condições materiais do músico em cada período.',
    'Explicar o mecanismo pelo qual gêneros de matriz africana foram aceitos, e a que preço.',
    'Analisar o efeito do rádio e do disco sobre a forma da canção.',
    'Reconhecer o juízo de gosto musical como marcador social.',
  ],
  competencies: COMPETENCIAS_POPULAR,
  skills: ['contexto', 'analise-critica', 'escuta-historica'],
  prerequisites: ['Recomenda-se cursar antes História da Música Brasileira.'],
  materials: [],
  curriculumSummary:
    '14 capítulos · 14 lições · exercícios de fixação ao fim de cada capítulo · simulado e prova final.',
  assessmentPolicy:
    'Cada capítulo termina com um checkpoint. A prova final cobre as competências do curso inteiro.',
  certificatePolicy:
    'Certificado de curso livre emitido ao concluir os 14 capítulos com 70% de acerto na prova final.',
  certificateInfo: {
    title: 'Certificado em História Social da Música Popular Brasileira',
    accreditation: 'Curso livre de qualificação profissional. Certificação própria.',
    criteria: 'Conclusão dos 14 capítulos e 70% de acerto na prova final.',
  },
  moduleIds: CAPITULOS_POPULAR.map((c) => idModulo(c.numero)),
  isPublished: true,
  createdAt: AGORA,
  updatedAt: AGORA,
};

export const MODULOS_POPULAR: AcademyModule[] = CAPITULOS_POPULAR.map((c) => ({
  id: idModulo(c.numero),
  courseId: CURSO_POPULAR.id,
  order: c.numero,
  title: `${c.numero}. ${c.titulo}`,
  description: `${c.periodo} — ${c.descricao}`,
  objectives: c.objetivos,
  lessonIds: [idLicao(c.numero)],
  createdAt: AGORA,
  updatedAt: AGORA,
}));

export const LICOES_POPULAR: AcademyLesson[] = CAPITULOS_POPULAR.map((c) => {
  const id = idLicao(c.numero);
  const blocos = BLOCOS[c.numero] ?? [];
  return {
    id,
    moduleId: idModulo(c.numero),
    courseId: CURSO_POPULAR.id,
    order: 1,
    canonicalContentId: `canon_pop_${c.numero}`,
    durationMinutes: MINUTOS_POR_CAPITULO.get(c.numero) ?? 30,
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

export { CAPITULOS_POPULAR };
