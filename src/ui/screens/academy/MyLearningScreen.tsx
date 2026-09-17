import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { ProgressBar } from '../../components/data-display/Progress';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import { AcademyCourse, UserAcademyProgress, AcademyCertificate } from '../../../domain/academy';
import { BookOpen, GraduationCap, History, Play } from 'lucide-react';

export const MyLearningScreen: React.FC = () => {
  const { navigate } = useRouter();

  const [enrollments, setEnrollments] = useState<UserAcademyProgress[]>([]);
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [certificates, setCertificates] = useState<AcademyCertificate[]>([]);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const session = await authService.getActiveSession();
        // O catalogo e publico; so o progresso exige sessao. A guarda anterior
        // bloqueava ambos, escondendo o catalogo de visitantes anonimos.
        const userId = session?.user.id;

        const [userEnrolls, allCourses, userCerts] = await Promise.all([
          userId
            ? academyService.listUserEnrollments(userId)
            : Promise.resolve([]),
          academyService.getCourses(),
          userId
            ? academyService.listUserCertificates(userId)
            : Promise.resolve([]),
        ]);

        setEnrollments(userEnrolls);
        setCourses(allCourses);
        setCertificates(userCerts);
      } catch (err) {
        console.error('Error loading my-learning:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const certMap = new Map(certificates.map((cert) => [cert.courseId, cert]));

  const filteredEnrollments = enrollments.filter((enr) => {
    const isCompleted = enr.progressPercentage === 100 || !!enr.completedAt;
    if (filter === 'in_progress') return !isCompleted;
    if (filter === 'completed') return isCompleted;
    return true;
  });

  const totalCompletedHours = enrollments.reduce((acc, enr) => {
    const c = courseMap.get(enr.courseId);
    if (!c) return acc;
    return acc + (c.workloadHours * (enr.progressPercentage / 100));
  }, 0);

  return (
    <ScreenContainer
      id="my-learning"
      title="Meu Aprendizado"
      subtitle="Acompanhamento do seu percurso acadêmico, disciplinas matriculadas e integralização curricular."
      badgeLabel="Plano de Estudos"
      badgeVariant="brand"
      primaryAction={{
        label: 'Explorar Catálogo',
        icon: BookOpen,
        onClick: () => navigate('/academy/catalog'),
      }}
      secondaryActions={[
        {
          label: 'Histórico Acadêmico',
          icon: History,
          onClick: () => navigate('/academy/history'),
        },
      ]}
      emptyProps={
        enrollments.length === 0
          ? {
              title: 'Você ainda não está matriculado em nenhum curso',
              description: 'Selecione uma disciplina no Catálogo da Academia para iniciar sua jornada teórica e prática.',
              actionLabel: 'Ver Catálogo de Cursos',
              onAction: () => navigate('/academy/catalog'),
            }
          : undefined
      }
    >
      <div className="space-y-6">
        {/* Progress Overview Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card variant="default" padding="md" className="space-y-1">
            <span className="text-xs text-stone-500 font-mono uppercase">Disciplinas Matriculadas</span>
            <p className="text-2xl font-bold font-serif text-stone-900">{enrollments.length}</p>
          </Card>
          <Card variant="default" padding="md" className="space-y-1">
            <span className="text-xs text-stone-500 font-mono uppercase">Horas Cumpridas</span>
            <p className="text-2xl font-bold font-serif text-stone-900">{totalCompletedHours.toFixed(1)} h</p>
          </Card>
          <Card variant="default" padding="md" className="space-y-1">
            <span className="text-xs text-stone-500 font-mono uppercase">Lições Concluídas</span>
            <p className="text-2xl font-bold font-serif text-stone-900">
              {enrollments.reduce((sum, e) => sum + e.completedLessonIds.length, 0)}
            </p>
          </Card>
          <Card variant="default" padding="md" className="space-y-1">
            <span className="text-xs text-stone-500 font-mono uppercase">Certificados Emitidos</span>
            <p className="text-2xl font-bold font-serif text-stone-900">{certificates.length}</p>
          </Card>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-stone-500 mr-2">Filtrar:</span>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-stone-900 text-white font-medium'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Todos ({enrollments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('in_progress')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filter === 'in_progress'
                ? 'bg-stone-900 text-white font-medium'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Em Andamento ({enrollments.filter((e) => e.progressPercentage < 100).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filter === 'completed'
                ? 'bg-stone-900 text-white font-medium'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Concluídos ({enrollments.filter((e) => e.progressPercentage === 100 || !!e.completedAt).length})
          </button>
        </div>

        {/* Enrolled Courses Cards List */}
        {isLoading ? (
          <div className="py-16 text-center text-xs text-stone-500 font-mono">
            Carregando matrículas acadêmicas...
          </div>
        ) : (
          <div className="space-y-4">
          {filteredEnrollments.map((enrollment) => {
            const course = courseMap.get(enrollment.courseId);
            if (!course) return null;

            const isDone = enrollment.progressPercentage === 100 || !!enrollment.completedAt;
            const cert = certMap.get(course.id);
            const nextLessonId = enrollment.lastAccessedLessonId || (course.moduleIds.length > 0 ? 'les_fomt_101_1' : undefined);

            return (
              <Card
                key={enrollment.courseId}
                id={`enrolled-course-${course.id}`}
                variant="default"
                padding="lg"
                className="space-y-4 hover:border-stone-400 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={isDone ? 'brand' : 'neutral'} size="sm">
                        {isDone ? 'Concluído com Êxito' : 'Em Andamento'}
                      </Badge>
                      <span className="text-xs font-mono text-stone-500">
                        Nível {course.level} • {course.workloadHours} horas
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-stone-900">
                      {course.title}
                    </h3>
                  </div>

                  <span className="text-xs text-stone-500 font-sans">
                    Prof. {course.authorName}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {course.subtitle}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 p-3 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="flex justify-between text-xs text-stone-700 font-sans">
                    <span>Progresso da Grade: {enrollment.completedLessonIds.length} lições completadas</span>
                    <span className="font-mono font-semibold">{enrollment.progressPercentage}%</span>
                  </div>
                  <ProgressBar
                    id={`progress-bar-${course.id}`}
                    value={enrollment.progressPercentage}
                    max={100}
                    sizeVariant="sm"
                    variant={isDone ? 'primary' : 'primary'}
                  />
                </div>

                {/* Actions bottom */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-stone-100">
                  <div className="text-xs text-stone-500 font-mono">
                    Último acesso: {enrollment.updatedAt ? new Date(enrollment.updatedAt).toLocaleDateString('pt-BR') : 'Hoje'}
                  </div>

                  <div className="flex items-center gap-2">
                    {isDone && cert && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/academy/certificate/${cert.id}`)}
                      >
                        <GraduationCap className="w-3.5 h-3.5 mr-1 text-red-800" />
                        Ver Certificado Digital
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        if (nextLessonId) {
                          navigate(`/academy/lesson/${nextLessonId}`);
                        } else {
                          navigate(`/academy/course/${course.id}`);
                        }
                      }}
                    >
                      <Play className="w-3.5 h-3.5 mr-1" />
                      {isDone ? 'Revisar Conteúdo' : 'Continuar Lição'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        )}
      </div>
    </ScreenContainer>
  );
};
