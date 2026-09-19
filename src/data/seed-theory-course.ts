import { AcademyCourse, AcademyModule, AcademyLesson, LessonBlock } from '../domain/academy';
import { CourseLevel } from '../domain/types';
import {
  CAPITULOS_TEORIA,
  COMPETENCIAS_TEORIA,
  TOTAL_DE_CAPITULOS,
} from './theory/capitulos';
import { BLOCOS_01_15 } from './theory/blocos-01-15';
import { BLOCOS_16_30 } from './theory/blocos-16-30';
import { BLOCOS_31_44 } from './theory/blocos-31-44';
import { BLOCOS_45_58 } from './theory/blocos-45-58';
import { LIVRETO_TEORIA } from './seed-booklet-theory';
import { calculateLessonWorkload, courseHours } from '../domain/workload';

/**
 * Curso de Teoria da Música — conteúdo autoral do Conservatório Muscicapa.
 *
 * COBERTURA
 * ---------
 * Cinquenta e oito capítulos. A lista não foi encurtada: ela percorre o
 * escopo inteiro da teoria elementar, tópico a tópico, na ordem em que os
 * conceitos se sustentam uns nos outros. Um curso que pula transporte,
 * modos litúrgicos, instrumentos transpositores ou acordes de nona não é
 * um curso de teoria — é uma seleção de teoria.
 *
 * O TEXTO é escrito aqui, em linguagem própria. Nenhuma obra é citada e
 * nenhuma expressão de terceiro é reproduzida: fatos e ideias não são
 * protegidos; expressão é.
 *
 * FORMA
 * -----
 * Cada capítulo alterna leitura curta com laboratório que aciona o motor de
 * teoria de verdade — o aluno ouve o intervalo, monta o acorde, vê a escala
 * na pauta — e fecha com um checkpoint. Ler sobre uma terça maior e ouvir
 * uma terça maior são duas coisas diferentes, e a segunda é a que fica.
 */

const AUTOR = {
  authorId: 'conservatorio',
  authorName: 'Conservatório Muscicapa',
  authorTitle: 'Cátedra de Teoria Musical',
};

const AGORA = '2026-09-17T00:00:00.000Z';

const idModulo = (n: number) => `mod_teoria_${String(n).padStart(2, '0')}`;
const idLicao = (n: number) => `les_teoria_${String(n).padStart(2, '0')}`;

/** Blocos de todos os capítulos, reunidos dos quatro arquivos de conteúdo. */
const BLOCOS: Record<number, LessonBlock[]> = {
  ...BLOCOS_01_15,
  ...BLOCOS_16_30,
  ...BLOCOS_31_44,
  ...BLOCOS_45_58,
};

/**
 * A carga de cada capítulo é MEDIDA, não escolhida.
 *
 * Conta-se o texto que o aluno lê (a 160 palavras por minuto, que é leitura de
 * estudo e não leitura corrente), o tempo de cada laboratório e o tempo de
 * cada questão do livreto — três a cinco minutos conforme o tamanho dela.
 *
 * Antes, cada capítulo declarava um número escolhido à mão. Um curso que
 * anuncia trinta e cinco horas sem ter contado nada está afirmando ao aluno
 * algo que não verificou.
 */
const QUESTOES_POR_CAPITULO = new Map(
  LIVRETO_TEORIA.capitulos.map((c) => [c.numero, c.questoes])
);

const MINUTOS_POR_CAPITULO = new Map(
  CAPITULOS_TEORIA.map((c) => [
    c.numero,
    calculateLessonWorkload(BLOCOS[c.numero] ?? [], QUESTOES_POR_CAPITULO.get(c.numero) ?? []).total,
  ])
);

const CARGA_HORARIA = courseHours([...MINUTOS_POR_CAPITULO.values()]);

// ---------------------------------------------------------------------------
// Curso
// ---------------------------------------------------------------------------

export const CURSO_TEORIA: AcademyCourse = {
  id: 'crs_teoria_fundamentos',
  slug: 'teoria-da-musica-fundamentos',
  categoryId: 'cat_teoria',
  categoryName: 'Teoria Musical',
  title: 'Teoria da Música',
  subtitle: 'Do fenômeno do som à notação contemporânea, sem pular tópico.',
  description:
    'O percurso completo da teoria musical elementar, em cinquenta e oito capítulos, na ordem ' +
    'em que os conceitos se sustentam. Começa na física do som e termina na notação do século XX — ' +
    'passando por notação, valores, alturas, intervalos, escalas, compasso, métrica, tonalidade, ' +
    'modulação, modos, ornamentos, harmonia e transposição. Cada capítulo alterna leitura curta ' +
    'com laboratório sonoro: você ouve o que acabou de ler antes de seguir adiante.',
  level: CourseLevel.FUNDAMENTAL,
  workloadHours: CARGA_HORARIA,
  ...AUTOR,
  authorBio:
    'A cátedra de teoria reúne o material didático escrito e revisado internamente pelo Conservatório.',
  objectives: [
    'Ler e escrever notação musical nas sete claves, com fluência nas duas mais usadas.',
    'Identificar intervalos de ouvido e no papel, pelo número e pela qualidade.',
    'Construir escalas maiores, menores, modais e artificiais em qualquer altura.',
    'Compreender compasso, métrica, quiálteras e as subdivisões que geram síncope e contratempo.',
    'Montar tríades, tétrades e acordes de nona, reconhecer inversões e ler cifragem.',
    'Reconhecer e executar os ornamentos conforme a convenção do período.',
    'Transportar e escrever para instrumentos transpositores.',
  ],
  competencies: COMPETENCIAS_TEORIA,
  skills: ['leitura', 'percepcao', 'harmonia'],
  prerequisites: [],
  materials: [],
  curriculumSummary:
    `${TOTAL_DE_CAPITULOS} capítulos · ${TOTAL_DE_CAPITULOS} lições com laboratório sonoro · ` +
    'livreto de exercícios ao fim de cada capítulo · simulado geral · prova final.',
  assessmentPolicy:
    'Cada capítulo termina com exercícios de fixação. O simulado reúne todas as questões do curso, ' +
    'na ordem estudada. A prova final cobre as mesmas competências com questões próprias.',
  certificatePolicy:
    `Certificado de curso livre emitido ao concluir os ${TOTAL_DE_CAPITULOS} capítulos com 70% de acerto na prova final.`,
  certificateInfo: {
    title: 'Certificado em Teoria da Música',
    accreditation: 'Curso livre de qualificação profissional. Certificação própria.',
    criteria: `Conclusão dos ${TOTAL_DE_CAPITULOS} capítulos e 70% de acerto na prova final.`,
  },
  moduleIds: CAPITULOS_TEORIA.map((c) => idModulo(c.numero)),
  isPublished: true,
  createdAt: AGORA,
  updatedAt: AGORA,
};

// ---------------------------------------------------------------------------
// Módulos — um por capítulo
// ---------------------------------------------------------------------------

export const MODULOS_TEORIA: AcademyModule[] = CAPITULOS_TEORIA.map((c) => ({
  id: idModulo(c.numero),
  courseId: CURSO_TEORIA.id,
  order: c.numero,
  title: `${c.romano}. ${c.titulo}`,
  description: c.descricao,
  objectives: c.objetivos,
  lessonIds: [idLicao(c.numero)],
  createdAt: AGORA,
  updatedAt: AGORA,
}));

// ---------------------------------------------------------------------------
// Lições
// ---------------------------------------------------------------------------

export const LICOES_TEORIA: AcademyLesson[] = CAPITULOS_TEORIA.map((c) => {
  const id = idLicao(c.numero);
  const blocos = BLOCOS[c.numero] ?? [];
  return {
    id,
    moduleId: idModulo(c.numero),
    courseId: CURSO_TEORIA.id,
    order: 1,
    canonicalContentId: `canon_teoria_${c.numero}`,
    durationMinutes: MINUTOS_POR_CAPITULO.get(c.numero) ?? 30,
    objectives: c.objetivos,
    skills: [c.competencia, ...(c.competenciasAdicionais ?? [])],
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

export { CAPITULOS_TEORIA, TOTAL_DE_CAPITULOS };
