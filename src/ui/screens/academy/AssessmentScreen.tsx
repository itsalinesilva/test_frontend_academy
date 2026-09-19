import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { ProgressBar } from '../../components/data-display/Progress';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import { AcademyAssessment, AcademyCourse } from '../../../domain/academy';
import { ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const AssessmentScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const assessmentId = params.id;

  const [assessment, setAssessment] = useState<AcademyAssessment | null>(null);
  const [course, setCourse] = useState<AcademyCourse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAssessment = async () => {
      // Rota sem parametro: nao consulta o servico e recai no estado de
      // "nao encontrado" da propria tela, em vez de exibir uma entidade
      // fixa de reserva (01_REPOSITORY_AUDIT R-02).
      if (!assessmentId) return;
      try {
        const asm = await academyService.getAssessment(assessmentId);
        if (asm) {
          setAssessment(asm);
          const c = await academyService.getCourse(asm.courseId);
          setCourse(c);
        }
      } catch (err) {
        console.error('Error loading assessment:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssessment();
  }, [assessmentId]);

  if (!assessment && !isLoading) {
    return (
      <ScreenContainer
        id="assessment-not-found"
        title="Avaliação Acadêmica"
        subtitle="Exame não localizado."
        emptyProps={{
          title: 'Exame não encontrado',
          description: `O identificador [${assessmentId}] não foi localizado no repositório.`,
          actionLabel: 'Voltar ao Início',
          onAction: () => navigate('/academy'),
        }}
      >
        <div />
      </ScreenContainer>
    );
  }

  const questions = assessment?.questions || [];
  const currentQuestion = questions[currentQuestionIdx];
  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = questions.length > 0 && answeredCount === questions.length;

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitAssessment = async () => {
    if (!assessment) return;

    const session = await authService.getActiveSession();
    // Sem sessao nao ha progresso a carregar nem a gravar: o fallback
    // anterior misturava dados de visitantes anonimos com os da
    // fundadora (CLAUDE_AUDIT.md T-05).
    if (!session) return;
    const userId = session.user.id;

    setIsSubmitting(true);
    try {
      const res = await academyService.submitAssessmentAttempt(
        userId,
        assessment.id,
        answers
      );
      navigate(`/academy/result/${res.submission.id}`);
    } catch (err) {
      console.error('Error submitting assessment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      id={`assessment-screen-${assessmentId}`}
      title={assessment?.title || 'Avaliação Somativa'}
      subtitle={`Disciplina: ${course?.title || 'Curso Acadêmico'} • Critério de Aprovação: ${assessment?.passingScorePercentage}%`}
      badgeLabel="Exame Oficial"
      badgeVariant="brand"
      secondaryActions={[
        {
          label: 'Voltar à Disciplina',
          icon: ArrowLeft,
          onClick: () => navigate(`/academy/course/${assessment?.courseId}`),
        },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Exam Protocol Banner */}
        <div className="p-4 bg-white border border-stone-200 rounded-xl flex items-center justify-between text-xs font-mono text-stone-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-anil-800" />
            <span>Exame Somativo Auditado</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Questão {currentQuestionIdx + 1} de {questions.length}</span>
            <span>•</span>
            <span>{answeredCount} respondidas</span>
          </div>
        </div>

        {/* Progress Bar of Answered Questions */}
        <div className="space-y-1">
          <ProgressBar
            id="assessment-progress"
            value={questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}
            max={100}
            sizeVariant="sm"
            variant="primary"
          />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <Card variant="default" padding="xl" className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-stone-500 uppercase tracking-wider font-semibold">
                Questão {currentQuestionIdx + 1} • {currentQuestion.points} Pontos
              </span>
              <Badge variant="neutral" size="sm">
                Múltipla Escolha
              </Badge>
            </div>

            <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
              {currentQuestion.prompt}
            </h3>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    id={`opt-${opt.id}`}
                    aria-pressed={isSelected}
                    onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-anil-800 bg-red-50/30 text-anil-950 font-medium'
                        : 'border-stone-200 hover:border-stone-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold shrink-0 ${
                          isSelected
                            ? 'bg-anil-800 text-white'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {opt.id.slice(-1).toUpperCase()}
                      </span>
                      <span className="text-sm font-serif text-stone-900 leading-snug">
                        {opt.text}
                      </span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-anil-800 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Question Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              <Button
                variant="outline"
                size="sm"
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentQuestionIdx(i)}
                    className={`w-7 h-7 rounded text-xs font-mono font-medium transition-colors ${
                      i === currentQuestionIdx
                        ? 'bg-stone-900 text-white'
                        : answers[questions[i].id]
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {currentQuestionIdx < questions.length - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                >
                  Próxima
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  id="btn-submit-full-assessment"
                  variant="primary"
                  size="sm"
                  disabled={!isAllAnswered || isSubmitting}
                  onClick={handleSubmitAssessment}
                >
                  {isSubmitting ? 'Finalizando...' : 'Finalizar Exame'}
                  <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </ScreenContainer>
  );
};
