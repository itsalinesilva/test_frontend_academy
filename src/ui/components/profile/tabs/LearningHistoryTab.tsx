import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';

interface LearningHistoryTabProps {
  profile: UnifiedProfileRecord;
}

export const LearningHistoryTab: React.FC<LearningHistoryTabProps> = ({ profile }) => {
  const academic = profile.academic || {
    totalStudyHours: 420,
    enrolledCourses: [],
    learningPaths: [],
    certificates: [],
    competencies: [],
  };

  const courses = academic.enrolledCourses || [];

  return (
    <div id="profile-learning-history-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">
          Histórico de Aprendizagem & Cursos Orientados
        </h2>
        <p className="text-xs text-stone-600">
          Programas curriculares, carga horária cumprida e certificações de conclusão
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card variant="default" padding="md" className="border-stone-200 bg-amber-50/30">
          <span className="text-xs font-semibold text-amber-900 block">Total de Horas Dedicadas</span>
          <span className="font-serif font-bold text-2xl text-amber-950 mt-1 block">
            {academic.totalStudyHours} horas
          </span>
          <span className="text-[11px] text-stone-600 mt-1 block">
            Em módulos teóricos, solfejo e análise musical
          </span>
        </Card>

        <Card variant="default" padding="md" className="border-stone-200">
          <span className="text-xs font-semibold text-stone-700 block">Cursos Concluídos</span>
          <span className="font-serif font-bold text-2xl text-stone-900 mt-1 block">
            {courses.filter((c) => c.status === 'concluido').length} de {courses.length}
          </span>
          <span className="text-[11px] text-stone-600 mt-1 block">
            100% de aproveitamento nos módulos de Polifonia
          </span>
        </Card>
      </div>

      <div className="space-y-3">
        {courses.map((course) => (
          <Card key={course.id} variant="default" padding="md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif font-bold text-sm text-stone-900">{course.title}</h3>
                <span className="text-xs text-stone-600">Instrutor: {course.instructor}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-stone-500">{course.hoursStudied}h estudadas</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize font-medium ${
                    course.status === 'concluido'
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {course.status}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                <span>Progresso Curricular</span>
                <span className="font-mono">{course.progressPercentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-stone-800 rounded-full"
                  style={{ width: `${course.progressPercentage}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
