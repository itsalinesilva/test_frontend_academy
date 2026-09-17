import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { CourseCard } from '../../components/domain/CourseCard';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import { AcademyCourse, UserAcademyProgress, AcademyCertificate } from '../../../domain/academy';

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
    <PageLayout
      id="my-learning"
      form="catalog"
      density="catalog"
      asideLabel="Resumo do percurso"
      state={isLoading ? 'loading' : enrollments.length === 0 ? 'empty' : 'content'}
      loadingMessage="Carregando suas matriculas..."
      emptyProps={{
        title: 'Voce ainda nao tem matricula',
        description:
          'A matricula e gratuita e libera licoes, atividades e a avaliacao final com certificado.',
        actionLabel: 'Explorar catalogo',
        onAction: () => navigate('/academy/catalog'),
      }}
    >
      {/* Abas de situacao. Antes eram tres botoes soltos; agora usam o
          componente `Tabs` do design system, que estava com 0 usos em telas
          (01_REPOSITORY_AUDIT I.4). */}
      <PageLayout.Tabs
        id="my-learning-tabs"
        activeTab={filter}
        onChange={(t) => setFilter(t as 'all' | 'in_progress' | 'completed')}
        tabs={[
          { id: 'all', label: 'Todas', badge: enrollments.length || undefined },
          {
            id: 'in_progress',
            label: 'Em andamento',
            badge: enrollments.filter((e) => e.progressPercentage < 100).length || undefined,
          },
          {
            id: 'completed',
            label: 'Concluidas',
            badge: enrollments.filter((e) => e.progressPercentage === 100).length || undefined,
          },
        ]}
      />

      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Integralizacao
          </p>
          <dl className="space-y-1.5 text-xs text-stone-700">
            <div className="flex items-center justify-between">
              <dt>Matriculadas</dt>
              <dd className="font-mono font-bold">{enrollments.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Concluidas</dt>
              <dd className="font-mono font-bold">
                {enrollments.filter((e) => e.progressPercentage === 100).length}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Certificados</dt>
              <dd className="font-mono font-bold">{certificates.length}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-stone-100 pt-1.5">
              <dt>Horas cursadas</dt>
              <dd className="font-mono font-bold">{totalCompletedHours.toFixed(1)}h</dd>
            </div>
          </dl>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/academy/history')}>
            Historico academico
          </Button>
        </Card>
      </PageLayout.Aside>

      <PageLayout.Main>
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

        {/* Lista de matriculas */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredEnrollments.map((enrollment) => {
            const course = courseMap.get(enrollment.courseId);
            if (!course) return null;
            return (
              <CourseCard
                key={enrollment.courseId}
                id={`enrolled-${course.id}`}
                title={course.title}
                description={course.subtitle}
                instructorName={course.authorName}
                level={course.level}
                durationHours={course.workloadHours}
                modulesCount={course.moduleIds.length}
                provenanceCitation={course.provenance?.source}
                progressPercent={enrollment.progressPercentage}
                isEnrolled
                onActionClick={() => {
                  // Retoma na ultima licao acessada. Sem registro, abre a
                  // disciplina — em vez do id fixo 'les_fomt_101_1' que
                  // estava aqui e levava todos a mesma licao.
                  if (enrollment.lastAccessedLessonId) {
                    navigate(`/academy/lesson/${enrollment.lastAccessedLessonId}`);
                  } else {
                    navigate(`/academy/course/${course.id}`);
                  }
                }}
              />
            );
          })}
        </div>
      </div>
      </PageLayout.Main>
    </PageLayout>
  );
};
