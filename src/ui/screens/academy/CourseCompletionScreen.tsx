import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import { AcademyCourse, AcademyCertificate, UserAcademyProgress } from '../../../domain/academy';
import { Award, CheckCircle2, GraduationCap, ArrowRight, BookOpen } from 'lucide-react';

export const CourseCompletionScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const courseId = params.id || 'crs_fomt_01';

  const [course, setCourse] = useState<AcademyCourse | null>(null);
  const [certificate, setCertificate] = useState<AcademyCertificate | null>(null);
  const [progress, setProgress] = useState<UserAcademyProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCompletionData = async () => {
      try {
        const session = await authService.getActiveSession();
        const userId = session?.user.id || 'usr_founder_1';

        const [c, prog, certs] = await Promise.all([
          academyService.getCourse(courseId),
          academyService.getUserProgress(userId, courseId),
          academyService.listUserCertificates(userId),
        ]);

        setCourse(c);
        setProgress(prog);

        const courseCert = certs.find((cert) => cert.courseId === courseId);
        setCertificate(courseCert || null);
      } catch (err) {
        console.error('Error loading completion:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompletionData();
  }, [courseId]);

  if (!course && !isLoading) {
    return (
      <ScreenContainer
        id="completion-not-found"
        title="Conclusão Acadêmica"
        subtitle="Disciplina não localizada."
      >
        <div />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      id={`course-completion-${courseId}`}
      title="Conclusão Formal de Disciplina"
      subtitle={`Parabéns pela integralização curricular da disciplina [${course?.title || ''}].`}
      badgeLabel="Disciplina Concluída"
      badgeVariant="brand"
      primaryAction={
        certificate
          ? {
              label: 'Visualizar Certificado Digital',
              icon: GraduationCap,
              onClick: () => navigate(`/academy/certificate/${certificate.id}`),
            }
          : {
              label: 'Continuar no Catálogo',
              icon: BookOpen,
              onClick: () => navigate('/academy/catalog'),
            }
      }
      secondaryActions={[
        {
          label: 'Meu Histórico',
          onClick: () => navigate('/academy/history'),
        },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Celebration Banner */}
        <Card variant="default" padding="xl" className="text-center space-y-6 border-red-800/30 bg-red-50/10">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-900 text-white flex items-center justify-center shadow-md">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="brand" size="md">Grau Acadêmico Aprovado</Badge>
            <h2 className="font-serif font-bold text-2xl text-stone-900">
              {course?.title}
            </h2>
            {progress?.completedAt && (
              <span className="text-xs font-mono text-stone-500 block">
                Integralizado em {new Date(progress.completedAt).toLocaleDateString('pt-BR')}
              </span>
            )}
            <p className="text-sm text-stone-600 max-w-lg mx-auto">
              Todas as lições, demonstrações auditivas e atividades práticas foram cumpridas com rigor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
            <div className="p-3 bg-white border border-stone-200 rounded-lg">
              <span className="text-[10px] font-mono text-stone-500 uppercase block">Carga Integralizada</span>
              <span className="font-serif font-bold text-stone-900 text-sm">{course?.workloadHours} horas</span>
            </div>
            <div className="p-3 bg-white border border-stone-200 rounded-lg">
              <span className="text-[10px] font-mono text-stone-500 uppercase block">Nível de Rigor</span>
              <span className="font-serif font-bold text-stone-900 text-sm">{course?.level}</span>
            </div>
            <div className="p-3 bg-white border border-stone-200 rounded-lg">
              <span className="text-[10px] font-mono text-stone-500 uppercase block">Cátedra Titular</span>
              <span className="font-serif font-bold text-stone-900 text-sm line-clamp-1">{course?.authorName}</span>
            </div>
          </div>
        </Card>

        {/* Competências Atestadas */}
        <Card variant="default" padding="lg" className="space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            Competências e Habilidades Consolidadas
          </h3>

          <ul className="space-y-2 text-xs text-stone-700">
            {course?.competencies.map((comp, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>{comp}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Certificate Callout */}
        {certificate && (
          <Card variant="muted" padding="lg" className="space-y-3 border-stone-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-red-800" />
                <h4 className="font-serif font-bold text-base text-stone-900">
                  Certificado Canônico Registrado
                </h4>
              </div>
              <span className="text-xs font-mono text-stone-500">
                {certificate.verificationCode}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              O documento comprobatório foi emitido com hash criptográfico SHA-256 e anexado ao seu Portfólio de Evidências da lente acadêmica.
            </p>
            <div className="pt-2 flex justify-end">
              <Button
                id="btn-open-issued-cert"
                variant="primary"
                size="sm"
                onClick={() => navigate(`/academy/certificate/${certificate.id}`)}
              >
                Visualizar Certificado Oficial
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </ScreenContainer>
  );
};
