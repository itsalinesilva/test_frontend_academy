import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { AudienceToggle } from '../../components/domain/AudienceToggle';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import { webAudioSynth } from '../../../infrastructure/audio/synth';
import {
  AcademyActivity,
  AcademyLesson,
  AudienceVariant,
  ActivityAttemptResult,
} from '../../../domain/academy';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2,
  ArrowRight,
  ArrowLeft,
  Award,
  HelpCircle,
} from 'lucide-react';

export const ActivityScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const activityId = params.id;

  const [activity, setActivity] = useState<AcademyActivity | null>(null);
  const [lesson, setLesson] = useState<AcademyLesson | null>(null);
  const [variant, setVariant] = useState<AudienceVariant>('TRADITIONAL');

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [attemptResult, setAttemptResult] = useState<ActivityAttemptResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /**
   * AUD-4 — id inexistente deixava a tela em "Buscando atividade…" para
   * sempre: não achar e ainda estar buscando davam no mesmo `activity === null`.
   */
  const [ausente, setAusente] = useState(false);
  const [precisaEntrar, setPrecisaEntrar] = useState(false);

  useEffect(() => {
    const loadActivityData = async () => {
      setAusente(false);
      // Rota sem parametro: nao consulta o servico e recai no estado de
      // "nao encontrado" da propria tela, em vez de exibir uma entidade
      // fixa de reserva (01_REPOSITORY_AUDIT R-02).
      if (!activityId) {
        setAusente(true);
        return;
      }
      try {
        const act = await academyService.getActivity(activityId);
        if (act) {
          setActivity(act);
          const l = await academyService.getLesson(act.lessonId);
          setLesson(l);
        } else {
          setAusente(true);
        }
      } catch (err) {
        console.error('Error loading activity:', err);
        setAusente(true);
      }
    };

    loadActivityData();
  }, [activityId]);

  const handleSubmit = async () => {
    if (!selectedOptionId || !activity) return;

    const session = await authService.getActiveSession();
    // Sem sessao nao ha progresso a carregar nem a gravar: o fallback
    // anterior misturava dados de visitantes anonimos com os da
    // fundadora (CLAUDE_AUDIT.md T-05).
    // E o clique não pode sumir calado: dizer por que nada foi corrigido.
    if (!session) {
      setPrecisaEntrar(true);
      return;
    }
    const userId = session.user.id;

    setIsSubmitting(true);
    try {
      const result = await academyService.submitActivityAttempt(
        userId,
        activity.id,
        selectedOptionId
      );
      setAttemptResult(result);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSelectedOptionId(null);
    setAttemptResult(null);
  };

  const playPitchStimulus = () => {
    // Standard A440 reference stimulus
    webAudioSynth.playTone(440, 2.0);
  };

  if (!activity && ausente) {
    return (
      <ScreenContainer id="activity-missing" title="Atividade não encontrada" subtitle={`Nenhuma atividade responde por "${activityId ?? ''}".`}>
        <div className="p-8 text-center space-y-3">
          <p className="text-sm text-stone-600">O endereço pode estar incompleto, ou a atividade foi retirada do curso.</p>
          <button
            type="button"
            onClick={() => navigate('/academia')}
            className="text-sm font-medium text-anil-700 underline-offset-2 hover:underline"
          >
            Voltar à Academia
          </button>
        </div>
      </ScreenContainer>
    );
  }

  if (!activity) {
    return (
      <ScreenContainer
        id="activity-loading"
        title="Atividade Prática"
        subtitle="Carregando enunciado…"
      >
        <div className="p-8 text-center text-stone-500 font-mono text-xs">
          Buscando atividade avaliada...
        </div>
      </ScreenContainer>
    );
  }

  const content = activity.variants[variant] || activity.variants.TRADITIONAL;

  return (
    <ScreenContainer
      id={`activity-screen-${activityId}`}
      title="Atividade de Fixação & Evidência"
      subtitle={`Lição: ${lesson?.variants.TRADITIONAL.title || 'Teoria Musical'}`}
      badgeLabel={`Dificuldade: ${activity.difficulty}`}
      badgeVariant="brand"
      secondaryActions={[
        {
          label: 'Voltar à Lição',
          icon: ArrowLeft,
          onClick: () => navigate(`/academia/lesson/${activity.lessonId}`),
        },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Audience Variant Switcher */}
        <div className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-xl">
          <span className="text-xs text-stone-600 font-sans">
            Modalidade de Linguagem:
          </span>
          <AudienceToggle
            id="activity-audience-toggle"
            variant={variant}
            onChange={(v) => setVariant(v)}
          />
        </div>

        {/* Main Activity Card */}
        <Card variant="default" padding="xl" className="space-y-6">
          {/* Instrução */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-stone-500 font-semibold flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
                Instrução Pedagógica:
              </span>
              <span className="text-xs font-mono text-stone-500">
                {activity.maxScore} points
              </span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed font-sans bg-stone-50 p-3 rounded-lg border border-stone-200">
              {content.instruction}
            </p>
          </div>

          {/* Áudio demonstrativo para ear training ou estímulo quando presente */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between">
            <div className="text-xs text-stone-700 font-medium">
              Estímulo Acústico Canônico (Síntese Web Audio)
            </div>
            <Button
              id="btn-play-activity-stimulus"
              size="sm"
              variant="outline"
              onClick={playPitchStimulus}
            >
              <Volume2 className="w-3.5 h-3.5 mr-1 text-anil-800" />
              Ouvir Tom de Referência (440Hz)
            </Button>
          </div>

          {/* Enunciado / Conteúdo da Questão */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
              {content.question}
            </h3>
          </div>

          {/* Resposta: Options list */}
          <div className="space-y-2.5">
            {content.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const isSubmitted = !!attemptResult;
              const expectedId = typeof activity.validationRule === 'object' && activity.validationRule !== null ? activity.validationRule.expectedOptionId : activity.correctAnswer;
              const isCorrectOpt = opt.id === expectedId;

              let borderClass = 'border-stone-200 hover:border-stone-400 bg-white';
              if (isSelected && !isSubmitted) {
                borderClass = 'border-anil-800 bg-red-50/20 text-anil-950 font-medium';
              } else if (isSubmitted) {
                if (isCorrectOpt) {
                  borderClass = 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-medium';
                } else if (isSelected && !isCorrectOpt) {
                  borderClass = 'border-red-600 bg-red-50/40 text-anil-950 font-medium';
                } else {
                  borderClass = 'border-stone-200 opacity-60';
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  id={`activity-option-${opt.id}`}
                  aria-pressed={selectedOptionId === opt.id}
                  disabled={isSubmitted}
                  onClick={() => {
                    if (!isSubmitted) setSelectedOptionId(opt.id);
                  }}
                  className={`w-full p-4 border rounded-xl text-left flex items-center justify-between cursor-pointer transition-all ${borderClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-stone-100 border border-stone-300 flex items-center justify-center text-xs font-mono font-bold text-stone-700 shrink-0">
                      {opt.id.slice(-1).toUpperCase()}
                    </span>
                    <span className="text-sm font-serif text-stone-900 leading-snug">
                      {opt.text}
                    </span>
                  </div>

                  {isSubmitted && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  )}
                  {isSubmitted && isSelected && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-red-700 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Validação / Feedback & Pontuação Banner */}
          {attemptResult && (
            <div
              id="activity-feedback-banner"
              className={`p-5 rounded-xl border space-y-3 ${
                attemptResult.passed
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-red-50 border-red-300 text-anil-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {attemptResult.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-700 shrink-0" />
                  )}
                  <h4 className="font-serif font-bold text-base">
                    {attemptResult.passed ? 'Resposta Correta! Competência Atestada.' : 'Resposta Incorreta.'}
                  </h4>
                </div>
                <Badge variant={attemptResult.passed ? 'brand' : 'danger'} size="sm">
                  Pontuação: {attemptResult.scoreEarned} / {activity.maxScore}
                </Badge>
              </div>

              <p className="text-xs leading-relaxed font-sans">
                {attemptResult.feedback}
              </p>

              {attemptResult.passed && attemptResult.evidenceId && (
                <div className="text-[11px] font-mono text-emerald-800 pt-2 border-t border-emerald-200/60 flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Evidência registrada no seu Portfólio de Evidências (ID: {attemptResult.evidenceId})</span>
                </div>
              )}
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/academia/lesson/${activity.lessonId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar à Lição
            </Button>

            <div className="flex items-center gap-2">
              {attemptResult ? (
                <>
                  {!attemptResult.passed && (
                    <Button
                      id="btn-retry-activity"
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Tentar Novamente
                    </Button>
                  )}
                  <Button
                    id="btn-activity-next-step"
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/academia/course/${lesson?.courseId || 'crs_fomt_01'}`)}
                  >
                    Prosseguir no Curso
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </>
              ) : (
                <Button
                  id="btn-submit-activity"
                  variant="primary"
                  size="sm"
                  disabled={!selectedOptionId || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? 'Validando...' : 'Submeter Resposta'}
                  <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
            </div>
            {precisaEntrar && (
              <p role="alert" className="mt-3 text-xs text-amber-800">
                Para corrigir e guardar sua resposta, entre na sua conta.{' '}
                <button
                  type="button"
                  onClick={() => navigate(`/auth/login?voltar=${encodeURIComponent(`/academia/activity/${activityId ?? ''}`)}`)}
                  className="font-medium underline"
                >
                  Entrar
                </button>
              </p>
            )}
          </div>
        </Card>
      </div>
    </ScreenContainer>
  );
};
