import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import {
  AcademyCourse,
  UserAcademyProgress,
  AcademicCertificateRecord,
} from '../../../domain/academy';
import {
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const AcademicProfileScreen: React.FC = () => {
  const { navigate } = useRouter();

  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progresses, setProgresses] = useState<UserAcademyProgress[]>([]);
  const [certificates, setCertificates] = useState<AcademicCertificateRecord[]>([]);
  const [userProfile, setUserProfile] = useState<{
    id: string;
    name?: string;
    displayName?: string;
    email?: string;
  } | null>(null);

  useEffect(() => {
    const loadAcademicProfile = async () => {
      try {
        const session = await authService.getActiveSession();
        /**
         * 🔴 Sair aqui deixava a tela no esqueleto para SEMPRE — inclusive
         * para quem está logado, porque o `return` pulava o `setIsLoading(false)`
         * que fica **fora** do `try`.
         *
         * Sem sessão não há perfil acadêmico, e a tela precisa cair no próprio
         * estado vazio em vez de carregar sem fim. O objeto de reserva anterior
         * apresentava a identidade da fundadora a qualquer visitante
         * (CLAUDE_AUDIT.md T-05/K-05), e por isso não volta.
         */
        if (!session) {
          setIsLoading(false);
          return;
        }
        setUserProfile(session.user);

        const [allCourses, allProgresses, certs] = await Promise.all([
          academyService.getCourses(),
          academyService.getAllUserProgress(session.user.id),
          academyService.getUserCertificates(session.user.id),
        ]);

        setCourses(allCourses);
        setProgresses(allProgresses);
        setCertificates(certs);
      } catch (err) {
        console.error('Error loading academic profile:', err);
      }
      setIsLoading(false);
    };

    loadAcademicProfile();
  }, []);

  const totalStudyHours = progresses.reduce((acc, p) => {
    const crs = courses.find((c) => c.id === p.courseId);
    if (!crs) return acc;
    return acc + Math.round((crs.workloadHours * p.progressPercentage) / 100);
  }, 0);

  const completedCoursesCount = progresses.filter(
    (p) => p.progressPercentage === 100 || !!p.completedAt
  ).length;

  return (
    <PageLayout
      id="academicprofile"
      form="catalog"
      density="operational"
      asideLabel="Resumo academico"
      state={isLoading ? 'loading' : 'content'}
      loadingMessage="Carregando..."
    >
      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Registro
          </p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/academia/history')}>
            Historico completo
          </Button>
        </Card>
      </PageLayout.Aside>

      <PageLayout.Main>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Profile Card / Header Banner */}
        <Card variant="muted" padding="lg" className="border-stone-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-stone-900 text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md">
                {userProfile?.name?.charAt(0) || 'A'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-bold text-2xl text-stone-950">
                    {userProfile?.name || 'Acadêmico de Música'}
                  </h2>
                  <Badge variant="brand" size="sm">Membro Oficial</Badge>
                </div>
                <p className="text-xs text-stone-600 font-sans">
                  {userProfile?.email} • Registro Canônico: {userProfile?.id}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Identidade Auditada pela Cátedra de Música Clássica</span>
                </div>
              </div>
            </div>

            {/* Academic Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t md:border-t-0 md:border-l border-stone-200 pt-4 md:pt-0 md:pl-6 shrink-0">
              <div className="text-center">
                <span className="font-serif font-bold text-2xl text-stone-900 block">
                  {progresses.length}
                </span>
                <span className="text-[11px] font-mono text-stone-500 uppercase">Matrículas</span>
              </div>
              <div className="text-center">
                <span className="font-serif font-bold text-2xl text-stone-800 block">
                  {completedCoursesCount}
                </span>
                <span className="text-[11px] font-mono text-stone-500 uppercase">Concluídos</span>
              </div>
              <div className="text-center">
                <span className="font-serif font-bold text-2xl text-anil-800 block">
                  {certificates.length}
                </span>
                <span className="text-[11px] font-mono text-stone-500 uppercase">Diplomas</span>
              </div>
              <div className="text-center">
                <span className="font-serif font-bold text-2xl text-emerald-800 block">
                  {totalStudyHours}h
                </span>
                <span className="text-[11px] font-mono text-stone-500 uppercase">Horas Auditadas</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Official Diplomas & Certificates Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-anil-800" />
              Certificados e Títulos Digitais Concedidos ({certificates.length})
            </h3>
          </div>

          {certificates.length === 0 ? (
            <Card variant="default" padding="lg" className="text-center py-8">
              <p className="text-xs text-stone-600">
                Você ainda não concluiu uma disciplina formal com certificação emitida.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => navigate('/academia/catalog')}
              >
                Explorar Catálogo e Iniciar Formação
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => {
                const crs = courses.find((c) => c.id === cert.courseId);
                return (
                  <Card
                    key={cert.id}
                    id={`cert-card-${cert.id}`}
                    variant="default"
                    padding="lg"
                    className="border-stone-200 space-y-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-stone-500 uppercase font-semibold">
                          Certificado de Conclusão • {cert.id}
                        </span>
                        <h4 className="font-serif font-bold text-base text-stone-950">
                          {crs?.title || 'Disciplina Concluída'}
                        </h4>
                        <span className="text-xs text-stone-600 block">
                          Carga Horária: {cert.workloadHours} horas • Nível {crs?.level || 'Universitário'}
                        </span>
                      </div>
                      <Award className="w-6 h-6 text-anil-800 shrink-0" />
                    </div>

                    <div className="p-2.5 bg-stone-50 rounded border border-stone-100 font-mono text-[10px] text-stone-600 break-all">
                      Hash SHA-256: {cert.sha256Hash || cert.verificationCode}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                      <span className="text-xs text-stone-500">
                        Emitido em: {new Date(cert.issuedAt).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/academia/certificate/${cert.id}`)}
                      >
                        Visualizar Certificado
                        <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Academic Transcript / Enrolled Courses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-stone-700" />
              Disciplinas em Andamento & Histórico Curricular ({progresses.length})
            </h3>
          </div>

          <div className="space-y-3">
            {progresses.map((prog) => {
              const crs = courses.find((c) => c.id === prog.courseId);
              const isDone = prog.progressPercentage === 100 || !!prog.completedAt;

              return (
                <Card
                  key={prog.courseId}
                  id={`transcript-row-${prog.courseId}`}
                  variant="default"
                  padding="md"
                  className="space-y-3 border-stone-200 hover:border-stone-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isDone ? 'brand' : 'neutral'} size="sm">
                          {isDone ? 'Concluído' : `${prog.progressPercentage}% Concluído`}
                        </Badge>
                        <span className="text-xs font-mono text-stone-500">
                          {crs?.level} • {crs?.workloadHours}h
                        </span>
                      </div>
                      <h4
                        onClick={() => navigate(`/academia/course/${prog.courseId}`)}
                        className="font-serif font-bold text-base text-stone-950 hover:text-anil-800 cursor-pointer mt-1"
                      >
                        {crs?.title || prog.courseId}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/academia/course/${prog.courseId}/progress`)}
                      >
                        Ver Progresso
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          if (isDone) {
                            navigate(`/academia/completion/${prog.courseId}`);
                          } else if (prog.lastAccessedLessonId) {
                            navigate(`/academia/lesson/${prog.lastAccessedLessonId}`);
                          } else {
                            navigate(`/academia/course/${prog.courseId}`);
                          }
                        }}
                      >
                        {isDone ? 'Ver Conclusão' : 'Continuar'}
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
                    <span>
                      {prog.completedLessonIds.length} lições completadas
                    </span>
                    <span>
                      Último registro: {prog.updatedAt ? new Date(prog.updatedAt).toLocaleDateString() : 'Ativo'}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Competencies & Skills Portfolio */}
        <Card variant="default" padding="lg" className="space-y-4 border-stone-200">
          <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-anil-800" />
            Matriz de Competências & Habilidades Adquiridas
          </h3>
          <p className="text-xs text-stone-600">
            Competências desenvolvidas através de avaliações e exercícios práticos na plataforma:
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {[
              'Reconhecimento de Intervalos Acústicos',
              'Construção de Tríades Fundamentais',
              'Análise Harmônica Modal e Tonal',
              'Leitura Urtext de Partituras Clássicas',
              'Contraponto Estrito a Duas Vozes',
              'Precisão Rítmica com Metrônomo',
              'Percepção Auditiva de Cadências',
              'Dedução de Linhas de Baixo',
            ].map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-stone-100 border border-stone-200 text-stone-800 text-xs rounded-lg font-medium flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                {skill}
              </span>
            ))}
          </div>
        </Card>
      </div>
      </PageLayout.Main>
    </PageLayout>
  );
};
