import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import { AcademyQuiz, AcademyCourse } from '../../../domain/academy';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

export const AcademyQuizScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const quizId = params.id;

  const [quiz, setQuiz] = useState<AcademyQuiz | null>(null);
  const [course, setCourse] = useState<AcademyCourse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    scorePercentage: number;
    passed: boolean;
    correctCount: number;
    totalCount: number;
    feedback: Record<string, { correct: boolean; explanation: string }>;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      // Rota sem parametro: nao consulta o servico e recai no estado de
      // "nao encontrado" da propria tela, em vez de exibir uma entidade
      // fixa de reserva (01_REPOSITORY_AUDIT R-02).
      if (!quizId) return;
      try {
        const q = await academyService.getQuiz(quizId);
        if (q) {
          setQuiz(q);
          const c = await academyService.getCourse(q.courseId);
          setCourse(c);
        }
      } catch (err) {
        console.error('Error loading quiz:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (result) return; // locked after submission
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    const session = await authService.getActiveSession();
    // Sem sessao nao ha progresso a carregar nem a gravar: o fallback
    // anterior misturava dados de visitantes anonimos com os da
    // fundadora (CLAUDE_AUDIT.md T-05).
    if (!session) return;
    const userId = session.user.id;

    setIsSubmitting(true);
    try {
      const res = await academyService.submitQuizAttempt(userId, quiz.id, answers);
      setResult(res);
    } catch (err) {
      console.error('Error submitting quiz:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
  };

  if (!quiz && !isLoading) {
    return (
      <ScreenContainer
        id="quiz-not-found"
        title="Quiz Formativo"
        subtitle="Questionário não encontrado."
        emptyProps={{
          title: 'Quiz não localizado',
          description: `O identificador [${quizId}] não corresponde a uma avaliação ativa.`,
          actionLabel: 'Voltar à Academia',
          onAction: () => navigate('/academy'),
        }}
      >
        <div />
      </ScreenContainer>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = quiz?.questions.length || 0;
  const isAllAnswered = answeredCount === totalQuestions;

  return (
    <ScreenContainer
      id={`quiz-screen-${quizId}`}
      title={quiz?.title || 'Quiz de Verificação'}
      subtitle={`Curso: ${course?.title || 'Teoria'} • ${quiz?.estimatedMinutes || 3} min`}
      badgeLabel={result ? (result.passed ? 'Aprovado' : 'Refazer') : 'Checagem Formativa'}
      badgeVariant={result ? (result.passed ? 'brand' : 'neutral') : 'neutral'}
      primaryAction={
        !result
          ? {
              label: isSubmitting ? 'Avaliando...' : 'Submeter Respostas',
              icon: CheckCircle2,
              onClick: handleSubmit,
            }
          : {
              label: 'Continuar no Curso',
              icon: ArrowRight,
              onClick: () => navigate(`/academy/course/${quiz?.courseId}`),
            }
      }
      secondaryActions={[
        {
          label: 'Voltar ao Curso',
          icon: ArrowLeft,
          onClick: () => navigate(`/academy/course/${quiz?.courseId}`),
        },
      ]}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Quiz Info Banner */}
        <Card variant="muted" padding="lg" className="border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-stone-500 font-semibold">
                Avaliação Formativa Imediata
              </span>
              <h2 className="font-serif font-bold text-xl text-stone-900">
                {quiz?.title}
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                {quiz?.description}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-stone-600 shrink-0 border-l border-stone-200 pl-4">
              <div>
                <span className="text-stone-400 block">Tempo Est.</span>
                <span className="font-bold text-stone-800">{quiz?.estimatedMinutes} min</span>
              </div>
              <div>
                <span className="text-stone-400 block">Corte Mín.</span>
                <span className="font-bold text-stone-800">{quiz?.passingScorePercentage}%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Banner if submitted */}
        {result && (
          <Card
            variant="default"
            padding="lg"
            className={`border ${
              result.passed
                ? 'border-emerald-300 bg-emerald-50/50'
                : 'border-amber-300 bg-amber-50/50'
            } space-y-4`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {result.passed ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    {result.passed
                      ? 'Parabéns! Você dominou os conceitos do Quiz!'
                      : 'Você atingiu o corte parcial. Revise o material e tente novamente.'}
                  </h3>
                  <p className="text-xs text-stone-600">
                    Acertos: {result.correctCount} de {result.totalCount} questões ({result.scorePercentage}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Tentar Novamente
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(`/academy/course/${quiz?.courseId}`)}
                >
                  Continuar
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {quiz?.questions.map((q, idx) => {
            const selectedOpt = answers[q.id];
            const qFeedback = result?.feedback[q.id];

            return (
              <Card
                key={q.id}
                id={`quiz-question-${q.id}`}
                variant="default"
                padding="lg"
                className={`space-y-4 border ${
                  qFeedback
                    ? qFeedback.correct
                      ? 'border-emerald-200 bg-white'
                      : 'border-red-200 bg-white'
                    : 'border-stone-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-stone-500 uppercase tracking-wider font-semibold">
                      Questão 0{idx + 1} • {q.skill || 'Competência Musical'}
                    </span>
                    <h4 className="font-serif font-bold text-base text-stone-900">
                      {q.prompt}
                    </h4>
                  </div>
                  {qFeedback && (
                    <Badge variant={qFeedback.correct ? 'brand' : 'neutral'} size="sm">
                      {qFeedback.correct ? 'Correto ✓' : 'Incorreto ✗'}
                    </Badge>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const isSelected = selectedOpt === opt.id;
                    const isCorrectAnswer = result && opt.id === q.correctOptionId;
                    const isWrongAnswer = result && isSelected && !qFeedback?.correct;

                    let optionStyle = 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800';
                    if (result) {
                      if (isCorrectAnswer) {
                        optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold';
                      } else if (isWrongAnswer) {
                        optionStyle = 'bg-red-50 border-red-300 text-anil-950';
                      } else {
                        optionStyle = 'bg-stone-50 border-stone-200 text-stone-400 opacity-60';
                      }
                    } else if (isSelected) {
                      optionStyle = 'bg-stone-900 text-white border-stone-900 font-medium shadow-xs';
                    }

                    return (
                      <div
                        key={opt.id}
                        id={`quiz-option-${opt.id}`}
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        className={`p-3.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono border ${
                              isSelected
                                ? 'bg-white text-stone-900 border-white font-bold'
                                : 'border-stone-400 text-stone-500'
                            }`}
                          >
                            {opt.id.slice(-1).toUpperCase()}
                          </span>
                          <span>{opt.text}</span>
                        </div>

                        {result && isCorrectAnswer && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {result && isWrongAnswer && (
                          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Feedback Explanation */}
                {qFeedback && (
                  <div
                    className={`p-3 rounded-lg border text-xs leading-relaxed ${
                      qFeedback.correct
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                        : 'bg-red-50/60 border-red-200 text-red-900'
                    }`}
                  >
                    <span className="font-bold block mb-0.5">Explicação Canônica:</span>
                    <p>{qFeedback.explanation}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Bottom Submission Bar */}
        {!result && (
          <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-stone-600">
              {answeredCount} de {totalQuestions} questões respondidas
            </span>
            <Button
              id="btn-quiz-submit"
              variant="primary"
              size="md"
              disabled={!isAllAnswered || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Submetendo...' : 'Finalizar e Corrigir Quiz'}
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
};
