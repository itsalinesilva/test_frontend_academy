import {
  UnifiedProfileRecord,
  VisibilityLevel,
  Evidence,
  PortfolioItem,
} from '../../src/domain/profile';
import { UserRole } from '../../src/domain/types';

/**
 * Constrói um `UnifiedProfileRecord` completo para testes.
 *
 * Existe porque os testes de perfil dependiam do seed da fundadora — ~915
 * linhas de currículo fabricado que foram removidas do repositório. Um teste
 * que monta os próprios dados também é melhor: não quebra quando o conteúdo
 * inicial da plataforma muda, e cada caso declara exatamente a situação que
 * está exercitando.
 */
export function criarPerfil(
  userId: string,
  sobrescrever: Partial<UnifiedProfileRecord> = {}
): UnifiedProfileRecord {
  return {
    userId,
    displayName: `Músico ${userId}`,
    title: 'Intérprete',
    headline: 'Perfil de teste',
    biography: '',
    avatarSource: 'initials',
    primaryRole: UserRole.ALUNO,
    assignedRoles: [UserRole.ALUNO],
    instruments: ['Violino'],
    musicalInterests: [],
    experienceLevel: 'iniciante',
    officialLinks: [],
    overallVisibility: 'public' as VisibilityLevel,
    sectionsConfig: [
      { key: 'academic', label: 'Academia', enabled: true, visibility: 'public', order: 1 },
      { key: 'practice', label: 'Prática', enabled: true, visibility: 'private', order: 2 },
    ],
    academic: {
      totalStudyHours: 0,
      enrolledCourses: [],
      learningPaths: [],
      certificates: [],
      competencies: [],
    },
    practice: {
      skills: [],
      repertoire: [],
      achievements: [],
      totalPracticeSessions: 0,
      currentStreakDays: 0,
      longestStreakDays: 0,
      recentExercises: [],
    },
    portfolio: [],
    evidences: [],
    worlds: { passports: [], badges: [], microcredentials: [] },
    community: {
      posts: [],
      forumParticipations: [],
      eventsAttended: [],
      connectionsCount: 0,
    },
    rooms: { attendedRooms: [] },
    updatedAt: new Date().toISOString(),
    ...sobrescrever,
  };
}

/** Evidência com visibilidade explícita, para exercitar a projeção pública. */
export function criarEvidencia(
  id: string,
  userId: string,
  visibility: VisibilityLevel
): Evidence {
  return {
    id,
    userId,
    source: 'ACADEMY' as Evidence['source'],
    sourceEntityId: 'crs_1',
    title: `Evidência ${id}`,
    description: 'Registro de teste.',
    artifactType: 'score' as Evidence['artifactType'],
    artifactUrl: 'https://exemplo.org/artefato',
    sha256Hash: 'sha256:' + '0'.repeat(64),
    skills: [],
    instruments: [],
    metadata: {},
    visibility,
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

/** Item de portfólio com visibilidade explícita. */
export function criarItemPortfolio(
  id: string,
  userId: string,
  visibility: VisibilityLevel
): PortfolioItem {
  return {
    id,
    userId,
    title: `Item ${id}`,
    category: 'recording' as PortfolioItem['category'],
    context: 'Contexto de teste.',
    objective: 'Objetivo de teste.',
    userRoleInProject: 'Intérprete',
    skills: [],
    instruments: [],
    evidenceIds: [],
    visibility,
    version: '1.0',
    isFeatured: false,
    orderIndex: 1,
    publishedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}
