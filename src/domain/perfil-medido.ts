import { MasteryRecord, PracticeResult, StreakTracker } from './practice';
import { UserAcademyProgress } from './academy';
import { PracticeLensData } from './profile';

/**
 * Os números do perfil, MEDIDOS (AUD-7).
 *
 * O perfil de quem acabava de entrar nascia com 32 horas de estudo,
 * 15 sessões, 3 dias seguidos, recorde de 14 e 8 conexões — números que
 * ninguém tinha feito. Depois disso, ficavam congelados: praticar não mudava
 * o perfil. Agora cada número sai do registro que o produziu, e zero é zero.
 */
export interface MedidasDoPerfil {
  totalStudyHours: number;
  totalPracticeSessions: number;
  currentStreakDays: number;
  longestStreakDays: number;
  recentExercises: PracticeLensData['recentExercises'];
  skills: PracticeLensData['skills'];
}

export function medirPerfil(fontes: {
  resultados: PracticeResult[];
  ofensiva: Pick<StreakTracker, 'currentStreakDays' | 'longestStreakDays'> | null;
  progressos: UserAcademyProgress[];
  dominios?: MasteryRecord[];
  /** skillId → nome. Habilidade sem nome conhecido sai com o id: melhor que nome inventado. */
  nomes?: Map<string, string>;
}): MedidasDoPerfil {
  const minutosNaAcademia = fontes.progressos.reduce((t, p) => t + (p.studyTimeMinutes || 0), 0);
  const minutosPraticando = fontes.resultados.reduce((t, r) => t + (r.durationSeconds || 0), 0) / 60;
  const recentes = [...fontes.resultados].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);

  return {
    /** Uma casa decimal: "0,4 h" é verdade; arredondar para 0 apagaria quem começou. */
    totalStudyHours: Math.round(((minutosNaAcademia + minutosPraticando) / 60) * 10) / 10,
    totalPracticeSessions: fontes.resultados.length,
    currentStreakDays: fontes.ofensiva?.currentStreakDays ?? 0,
    longestStreakDays: fontes.ofensiva?.longestStreakDays ?? 0,
    recentExercises: recentes.map((r) => ({
      id: r.id,
      title: r.exerciseTitle,
      toolUsed: r.modality,
      /** `summaryScore` vai de 0 a 1000; o perfil mostra porcentagem. */
      accuracyScore: Math.round(r.summaryScore / 10),
      completedAt: r.createdAt,
    })),
    skills: [...(fontes.dominios ?? [])]
      .sort((a, b) => b.level - a.level || b.scorePercentage - a.scorePercentage)
      .map((d) => ({
        id: d.skillId,
        name: fontes.nomes?.get(d.skillId) ?? d.skillId,
        currentLevel: d.level,
        accuracyRate: Math.round(d.scorePercentage),
        totalAttempts: d.totalAttempts,
      })),
  };
}
