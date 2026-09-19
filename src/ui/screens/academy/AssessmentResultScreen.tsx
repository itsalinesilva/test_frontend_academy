import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { ProgressBar } from '../../components/data-display/Progress';
import { academyService } from '../../../services/application/academy.service';
import {
  AssessmentAttempt,
  AcademyAssessment,
  AcademyCourse,
} from '../../../domain/academy';
import {
  Award,
  RotateCcw,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

export const AssessmentResultScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const { userId, carregando: sessaoCarregando } = useCurrentUser();
  const attemptId = params.id || '';

  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [assessment, setAssessment] = useState<AcademyAssessment | null>(null);
  const [course, setCourse] = useState<AcademyCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAttemptData = async () => {
      /**
       * Sem sessao nao ha resultado a mostrar: este e o registro de UMA
       * pessoa, e a rota e alcancavel por qualquer um.
       */
      if (sessaoCarregando) return;
      if (!userId) {
        setIsLoading(false);
        return;
      }
      try {
        const att = await academyService.getAssessmentAttempt(attemptId, userId);
        if (att) {
          setAttempt(att);
          const asm = await academyService.getAssessment(att.assessmentId);
          setAssessment(asm);
          if (asm) {
            const c = await academyService.getCourse(asm.courseId);
            setCourse(c);
          }
        }
      } catch (err) {
        console.error('Error loading result:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAttemptData();
  }, [attemptId, userId, sessaoCarregando]);

  if (!attempt && !isLoading) {
    return (
      <ScreenContainer
        id="result-not-found"
        title="Resultado da Avaliação"
        subtitle="Tentativa não localizada."
        emptyProps={{
          title: 'Tentativa não encontrada',
          description: `O identificador [${attemptId}] não foi localizado.`,
          actionLabel: 'Voltar ao Início',
          onAction: () => navigate('/academia'),
        }}
      >
        <div />
      </ScreenContainer>
    );
  }

  const isPassed = !!attempt?.passed;

  return (
    <ScreenContainer
      id={`assessment-result-${attemptId}`}
      title={isPassed ? 'Aprovação Atestada com Louvor' : 'Resultado da Avaliação'}
      subtitle={`Disciplina: ${course?.title || 'Curso Acadêmico'} • ${assessment?.title || 'Exame'}`}
      badgeLabel={isPassed ? 'Aprovado' : 'Revisão Necessária'}
      badgeVariant={isPassed ? 'brand' : 'neutral'}
      primaryAction={{
        label: isPassed ? 'Ver Conclusão & Certificado' : 'Revisar Disciplina',
        icon: isPassed ? GraduationCap : RotateCcw,
        onClick: () => {
          if (isPassed && course) {
            navigate(`/academia/completion/${course.id}`);
          } else if (course) {
            navigate(`/academia/course/${course.id}`);
          }
        },
      }}
      secondaryActions={[
        {
          label: 'Início da Academia',
          onClick: () => navigate('/academia'),
        },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Score Summary Card */}
        <Card
          variant="default"
          padding="xl"
          className={`space-y-6 text-center border-2 ${
            isPassed ? 'border-emerald-500 bg-emerald-50/10' : 'border-stone-300'
          }`}
        >
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-stone-100">
            {isPassed ? (
              <Award className="w-8 h-8 text-emerald-700" />
            ) : (
              <RotateCcw className="w-8 h-8 text-stone-500" />
            )}
          </div>

          <div className="space-y-2">
            <Badge variant={isPassed ? 'brand' : 'neutral'} size="md">
              {isPassed ? 'Competências Consolidadas' : 'Abaixo do Limiar de Aprovação'}
            </Badge>
            <h2 className="font-serif font-bold text-2xl text-stone-900">
              Aproveitamento: {(attempt?.percentageScore ?? attempt?.scorePercentage ?? 0).toFixed(0)}%
            </h2>
            <p className="text-xs text-stone-600">
              Pontuação obtida: <strong>{attempt?.scoreEarned}</strong> de {attempt?.maxScore} points possíveis.
              (Corte mínimo exigido: {assessment?.passingScorePercentage}%)
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <ProgressBar
              id="result-progress"
              value={attempt?.percentageScore || 0}
              max={100}
              sizeVariant="md"
              variant={isPassed ? 'primary' : 'neutral'}
            />
          </div>

          {isPassed && attempt?.certificateId && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-left flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-emerald-950 font-serif">
                  Certificado Canônico Emitido
                </div>
                <div className="text-[11px] font-mono text-emerald-800">
                  Registro: {attempt.certificateId}
                </div>
              </div>
              <Button
                id="btn-view-certificate"
                size="sm"
                variant="primary"
                onClick={() => navigate(`/academia/certificate/${attempt.certificateId}`)}
              >
                Abrir Certificado
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}
        </Card>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-900">
            Gabarito Comentado & Análise de Respostas
          </h3>

          <div className="space-y-3">
            {assessment?.questions.map((q, idx) => {
              const userAnswerId = attempt?.answers[q.id];
              const isCorrect = userAnswerId === q.correctOptionId;
              const chosenOption = q.options.find((o) => o.id === userAnswerId);
              const correctOption = q.options.find((o) => o.id === q.correctOptionId);

              return (
                <Card
                  key={q.id}
                  variant="default"
                  padding="lg"
                  className="space-y-3 border-stone-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-stone-500 font-semibold">
                      Questão {idx + 1}
                    </span>
                    <Badge variant={isCorrect ? 'brand' : 'danger'} size="sm">
                      {isCorrect ? 'Correta (+pontos)' : 'Incorreta (0 pts)'}
                    </Badge>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-stone-900">
                    {q.prompt}
                  </h4>

                  <div className="text-xs space-y-1 pt-1 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500 font-mono">Sua resposta:</span>
                      <span className={`font-semibold ${isCorrect ? 'text-emerald-800' : 'text-red-700'}`}>
                        {chosenOption ? chosenOption.text : '(Não respondida)'}
                      </span>
                    </div>

                    {!isCorrect && correctOption && (
                      <div className="flex items-center gap-2">
                        <span className="text-stone-500 font-mono">Gabarito correto:</span>
                        <span className="text-stone-900 font-semibold">
                          {correctOption.text}
                        </span>
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <div className="p-3 bg-stone-50 rounded border border-stone-200 text-xs text-stone-600 font-sans">
                      <strong>Fundamentação:</strong> {q.explanation}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
};
