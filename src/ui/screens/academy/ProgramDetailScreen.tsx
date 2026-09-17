import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { academyService } from '../../../services/application/academy.service';
import { Program, LearningPath, AcademyCourse } from '../../../domain/academy';
import {
  Layers,
  Award,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

export const ProgramDetailScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const programId = params.id;

  const [program, setProgram] = useState<Program | null>(null);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgram = async () => {
      // Rota sem parametro: nao consulta o servico e recai no estado de
      // "nao encontrado" da propria tela, em vez de exibir uma entidade
      // fixa de reserva (01_REPOSITORY_AUDIT R-02).
      if (!programId) return;
      try {
        const p = await academyService.getProgram(programId);
        if (p) {
          setProgram(p);
          const allPaths = await academyService.getPaths();
          const matchedPaths = allPaths.filter((pth) => p.pathIds.includes(pth.id));
          setPaths(matchedPaths);

          const allCourses = await academyService.getCourses();
          setCourses(allCourses);
        }
      } catch (err) {
        console.error('Error loading program:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgram();
  }, [programId]);

  if (!program && !isLoading) {
    return (
      <ScreenContainer
        id="program-not-found"
        title="Programa Acadêmico"
        subtitle="Identificador de programa não localizado."
        emptyProps={{
          title: 'Programa não encontrado',
          description: `O identificador [${programId}] não corresponde a nenhum programa curricular ativo.`,
          actionLabel: 'Voltar ao Catálogo',
          onAction: () => navigate('/academy/catalog'),
        }}
      >
        <div />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      id={`program-detail-${programId}`}
      title={program?.title || 'Carregando Programa...'}
      subtitle={program?.subtitle || ''}
      badgeLabel="Programa Curricular Integrado"
      badgeVariant="brand"
      primaryAction={{
        label: paths.length > 0 ? 'Iniciar Trilha 1' : 'Ver Catálogo',
        icon: ArrowRight,
        onClick: () => {
          if (paths.length > 0) {
            navigate(`/academy/path/${paths[0].id}`);
          } else {
            navigate('/academy/catalog');
          }
        },
      }}
      secondaryActions={[
        {
          label: 'Catálogo de Cursos',
          onClick: () => navigate('/academy/catalog'),
        },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Description, Paths, Competencies, Curriculum */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <Card variant="default" padding="lg" className="space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900">
              Sobre a Formação Integral
            </h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              {program?.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="text-stone-500 font-mono uppercase block text-[10px]">Carga Horária</span>
                <span className="font-bold text-stone-900 text-sm font-serif">{program?.workloadHours} horas auditadas</span>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="text-stone-500 font-mono uppercase block text-[10px]">Duração Estimada</span>
                <span className="font-bold text-stone-900 text-sm font-serif">{program?.estimatedMonths} meses recomendados</span>
              </div>
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
                <span className="text-stone-500 font-mono uppercase block text-[10px]">Trilhas Sequenciadas</span>
                <span className="font-bold text-stone-900 text-sm font-serif">{program?.pathIds.length} trilhas temáticas</span>
              </div>
            </div>
          </Card>

          {/* Sequential Paths */}
          <div className="space-y-4">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-anil-800" />
              Trilhas Curriculares do Programa
            </h2>

            <div className="space-y-4">
              {paths.map((path, idx) => {
                const pathCourses = courses.filter((c) => path.courseIds.includes(c.id));

                return (
                  <Card
                    key={path.id}
                    id={`path-block-${path.id}`}
                    variant="default"
                    padding="lg"
                    className="space-y-4 hover:border-stone-400 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-stone-900 text-white text-[11px] font-mono rounded">
                            Trilha 0{idx + 1}
                          </span>
                          <Badge variant="neutral" size="sm">Nível {path.level}</Badge>
                        </div>
                        <h3 className="font-serif font-bold text-base text-stone-900">
                          {path.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-stone-500 shrink-0">
                        {path.workloadHours}h • {path.courseIds.length} cursos
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {path.description}
                    </p>

                    {/* Courses included in this path */}
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <span className="text-[11px] font-mono uppercase text-stone-500">
                        Disciplinas da Trilha:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {pathCourses.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => navigate(`/academy/course/${c.id}`)}
                            className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-md flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <span className="text-xs font-serif font-semibold text-stone-900 line-clamp-1">
                              {c.title}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-1" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/academy/path/${path.id}`)}
                      >
                        Acessar Trilha Detalhada
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Competencies, Certification, Provenance */}
        <div className="space-y-6">
          {/* Competencies */}
          <Card variant="default" padding="md" className="space-y-3">
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-anil-800" />
              Competências Certificadas
            </h3>
            <ul className="space-y-2 text-xs text-stone-700">
              {program?.competencies.map((comp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{comp}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Certificate Info */}
          <Card variant="muted" padding="md" className="space-y-3 border-stone-200">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-anil-800" />
              <h3 className="font-serif font-bold text-sm text-stone-900">
                Certificação Acadêmica
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {program?.certificateTitle}
            </p>
            <div className="text-[11px] text-stone-500 font-mono space-y-1">
              <div>• Assinatura Digital SHA-256</div>
              <div>• Código Único de Registro</div>
              <div>• Auditável em Portfólio de Evidências</div>
            </div>
          </Card>

          {/* Provenance */}
          <Card variant="default" padding="md" className="space-y-2 text-xs">
            <span className="font-mono uppercase text-stone-500 font-semibold block text-[10px]">
              Proveniência Canônica
            </span>
            <p className="text-stone-700 font-serif leading-snug">
            </p>
          </Card>
        </div>
      </div>
    </ScreenContainer>
  );
};
