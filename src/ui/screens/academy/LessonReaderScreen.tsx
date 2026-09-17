import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { useRouter } from '../../navigation/router';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import { AudienceToggle } from '../../components/domain/AudienceToggle';
import { ScoreContainer } from '../../components/domain/ScoreContainer';
import { academyService } from '../../../services/application/academy.service';
import { authService } from '../../../services/application/auth.service';
import { webAudioSynth } from '../../../infrastructure/audio/synth';
import {
  AcademyLesson,
  AcademyCourse,
  AcademyModule,
  AcademyActivity,
  AudienceVariant,
  UserAcademyProgress,
} from '../../../domain/academy';
import {
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Play,
  Volume2,
  BookOpen,
  Film,
  Music,
  BookMarked,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const LessonReaderScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const lessonId = params.id || 'les_fomt_101_1';

  const [variant, setVariant] = useState<AudienceVariant>('TRADITIONAL');
  const [lesson, setLesson] = useState<AcademyLesson | null>(null);
  const [course, setCourse] = useState<AcademyCourse | null>(null);
  const [module, setModule] = useState<AcademyModule | null>(null);
  const [activities, setActivities] = useState<AcademyActivity[]>([]);
  const [progress, setProgress] = useState<UserAcademyProgress | null>(null);

  const [activeTab, setActiveTab] = useState<'conteudo' | 'audio' | 'video' | 'partitura' | 'atividades' | 'referencias'>('conteudo');
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  useEffect(() => {
    const loadLessonData = async () => {
      try {
        const session = await authService.getActiveSession();
        const userId = session?.user.id || 'usr_founder_1';

        const l = await academyService.getLesson(lessonId);
        if (l) {
          setLesson(l);

          const [c, m, acts, prog] = await Promise.all([
            academyService.getCourse(l.courseId),
            academyService.getModule(l.moduleId),
            academyService.getActivities(l.id),
            academyService.getUserProgress(userId, l.courseId),
          ]);

          setCourse(c);
          setModule(m);
          setActivities(acts);
          setProgress(prog);
        }
      } catch (err) {
        console.error('Error loading lesson:', err);
      }
    };

    loadLessonData();
  }, [lessonId]);

  const isCompleted = !!progress?.completedLessonIds.includes(lessonId);

  const handleToggleComplete = async () => {
    const session = await authService.getActiveSession();
    const userId = session?.user.id || 'usr_founder_1';
    if (!lesson) return;

    setIsMarkingComplete(true);
    try {
      const updatedProgress = await academyService.completeLesson(userId, lesson.id);
      setProgress(updatedProgress);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const playAudioSample = (sampleId: string, freqs: number[]) => {
    setPlayingAudioId(sampleId);
    if (freqs.length === 1) {
      webAudioSynth.playTone(freqs[0], 2.0);
    } else {
      webAudioSynth.playSequence(freqs, 0.45);
    }
    setTimeout(() => setPlayingAudioId(null), 2500);
  };

  if (!lesson) {
    return (
      <ScreenContainer
        id="lesson-loading"
        title="Lição Acadêmica"
        subtitle="Carregando dados da lição..."
      >
        <div className="p-8 text-center text-stone-500 font-mono text-xs">
          Buscando plano canônico e mídia...
        </div>
      </ScreenContainer>
    );
  }

  const content = lesson.variants[variant] || lesson.variants.TRADITIONAL;

  return (
    <ScreenContainer
      id={`lesson-reader-${lessonId}`}
      title={content.title}
      subtitle={`Curso: ${course?.title || 'Teoria'} • ${module?.title || 'Módulo'}`}
      badgeLabel={isCompleted ? 'Lição Concluída' : 'Em Andamento'}
      badgeVariant={isCompleted ? 'brand' : 'neutral'}
      primaryAction={{
        label: isMarkingComplete
          ? 'Registrando...'
          : isCompleted
          ? 'Lição Concluída ✓'
          : 'Marcar como Concluída',
        icon: CheckCircle,
        onClick: handleToggleComplete,
      }}
      secondaryActions={[
        {
          label: 'Laboratório Interativo',
          icon: Sparkles,
          onClick: () => navigate(`/academy/lesson/${lessonId}/interactive`),
        },
        {
          label: 'Voltar à Disciplina',
          icon: ArrowLeft,
          onClick: () => navigate(`/academy/course/${lesson.courseId}`),
        },
      ]}
    >
      <div className="space-y-6">
        {/* Sub-bar: Audience variant switcher & Activity Jump */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white border border-stone-200 rounded-xl">
          <AudienceToggle
            id="lesson-audience-toggle"
            variant={variant}
            onChange={(v) => setVariant(v)}
          />

          <div className="flex items-center gap-2">
            <Button
              id="btn-open-interactive-lab"
              size="sm"
              variant="outline"
              onClick={() => navigate(`/academy/lesson/${lessonId}/interactive`)}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-red-800" />
              <span>Lab Interativo & Síntese</span>
            </Button>
            {activities.length > 0 && (
              <Button
                id="btn-jump-to-activity"
                size="sm"
                variant="primary"
                onClick={() => navigate(`/academy/activity/${activities[0].id}`)}
              >
                <span>Exercício ({activities.length})</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Pedagogical Chain Strip: Lesson → Practice → Exercise → Score → Evidence → Profile */}
        <div className="p-3 bg-stone-100/80 border border-stone-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono text-stone-500 uppercase tracking-wider text-[10px] font-semibold">
            Cadeia Pedagógica Integrada:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap font-sans text-stone-700">
            <span className="px-2 py-0.5 bg-red-900 text-white rounded font-medium">1. Lição Teórica</span>
            <span className="text-stone-400">→</span>
            <button
              type="button"
              onClick={() => navigate('/practice')}
              className="px-2 py-0.5 bg-white hover:bg-stone-200 text-stone-800 border border-stone-200 rounded transition-colors"
            >
              2. Prática Deliberada
            </button>
            <span className="text-stone-400">→</span>
            {activities.length > 0 ? (
              <button
                type="button"
                onClick={() => navigate(`/academy/activity/${activities[0].id}`)}
                className="px-2 py-0.5 bg-white hover:bg-stone-200 text-stone-800 border border-stone-200 rounded transition-colors"
              >
                3. Exercício Avaliado
              </button>
            ) : (
              <span className="px-2 py-0.5 bg-stone-200 text-stone-500 rounded">3. Exercício</span>
            )}
            <span className="text-stone-400">→</span>
            <button
              type="button"
              onClick={() => navigate('/score')}
              className="px-2 py-0.5 bg-white hover:bg-stone-200 text-stone-800 border border-stone-200 rounded transition-colors"
            >
              4. Partitura Urtext
            </button>
            <span className="text-stone-400">→</span>
            <button
              type="button"
              onClick={() => navigate('/academy/academic-profile')}
              className="px-2 py-0.5 bg-white hover:bg-stone-200 text-stone-800 border border-stone-200 rounded transition-colors"
            >
              5. Evidência & Perfil
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex border-b border-stone-200 gap-1 overflow-x-auto pb-1 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('conteudo')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'conteudo'
                ? 'border-red-800 text-red-900 font-semibold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Texto & Teoria
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'audio'
                ? 'border-red-800 text-red-900 font-semibold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            Áudio Interativo ({content.audioSamples?.length || 0})
          </button>

          {content.scoreSnippet && (
            <button
              type="button"
              onClick={() => setActiveTab('partitura')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'partitura'
                  ? 'border-red-800 text-red-900 font-semibold'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <Music className="w-4 h-4" />
              Partitura Interativa
            </button>
          )}

          {content.video && (
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'video'
                  ? 'border-red-800 text-red-900 font-semibold'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <Film className="w-4 h-4" />
              Vídeo & Transcrição
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('atividades')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'atividades'
                ? 'border-red-800 text-red-900 font-semibold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Atividades Avaliadas ({activities.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('referencias')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'referencias'
                ? 'border-red-800 text-red-900 font-semibold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            Referências Bibliográficas
          </button>
        </div>

        {/* TAB 1: TEXTO & TEORIA */}
        {activeTab === 'conteudo' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Introduction Banner */}
              <Card variant="default" padding="lg" className="space-y-4">
                <div className="space-y-2">
                  <Badge variant={variant === 'KIDS' ? 'brand' : 'neutral'} size="sm">
                    {variant === 'KIDS' ? 'Versão Lúdica Ilustrada' : 'Exposição Teórica Canônica'}
                  </Badge>
                  <h3 className="font-serif font-bold text-xl text-stone-900 leading-snug">
                    {content.summary}
                  </h3>
                </div>

                <p className="text-sm text-stone-700 leading-relaxed font-sans">
                  {content.introduction}
                </p>
              </Card>

              {/* Sections */}
              {content.sections.map((sec) => (
                <Card key={sec.id} variant="default" padding="lg" className="space-y-4">
                  <h4 className="font-serif font-bold text-lg text-stone-900">
                    {sec.title}
                  </h4>
                  <div className="text-sm text-stone-800 leading-relaxed space-y-3 font-sans whitespace-pre-line">
                    {sec.contentMarkdown}
                  </div>

                  {sec.callout && (
                    <div
                      className={`p-4 rounded-lg border text-xs space-y-1 ${
                        sec.callout.type === 'historical'
                          ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                          : sec.callout.type === 'tip'
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-stone-50 border-stone-200 text-stone-800'
                      }`}
                    >
                      <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Info className="w-3.5 h-3.5" />
                        {sec.callout.title}
                      </div>
                      <p className="leading-relaxed font-sans">{sec.callout.text}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Right column: Audio Quick Previews, Illustrations, Provenance */}
            <div className="space-y-6">
              {/* Audio quick widget */}
              <Card variant="default" padding="md" className="space-y-3">
                <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-red-800" />
                  Demonstrações Acústicas
                </h4>
                <div className="space-y-2">
                  {content.audioSamples.map((aud) => (
                    <div
                      key={aud.id}
                      className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2"
                    >
                      <div className="text-xs font-semibold text-stone-900 font-serif">
                        {aud.title}
                      </div>
                      <p className="text-[11px] text-stone-600 leading-tight">
                        {aud.description}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                        onClick={() => playAudioSample(aud.id, aud.frequenciesHz)}
                      >
                        <Play className="w-3 h-3 mr-1 text-red-800" />
                        {playingAudioId === aud.id ? 'Tocando Frequências...' : 'Reproduzir Amostra'}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Illustrations */}
              {content.illustrations.length > 0 && (
                <Card variant="default" padding="md" className="space-y-3">
                  <h4 className="font-serif font-bold text-sm text-stone-900">
                    Gravuras & Iconografia
                  </h4>
                  {content.illustrations.map((ill) => (
                    <div key={ill.id} className="space-y-2">
                      <div className="h-32 bg-stone-100 rounded border border-stone-200 flex items-center justify-center text-center p-3 text-xs text-stone-500 font-serif">
                        <span>[Gravura Histórica: {ill.title}]</span>
                      </div>
                      <p className="text-xs text-stone-700 font-medium">{ill.caption}</p>
                      <span className="text-[10px] text-stone-400 font-mono block">
                        {ill.historicalContext}
                      </span>
                    </div>
                  ))}
                </Card>
              )}

              {/* Provenance Box */}
              <Card variant="muted" padding="md" className="space-y-2 text-xs border-stone-200">
                <span className="font-mono text-[10px] uppercase text-stone-500 font-bold block">
                  Proveniência Curatorial
                </span>
                <p className="text-stone-800 font-serif">{lesson.provenanceRef}</p>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIO INTERATIVO */}
        {activeTab === 'audio' && (
          <div className="max-w-3xl space-y-4">
            <Card variant="default" padding="lg" className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-red-800" />
                Laboratório de Percepção & Frequências Acústicas
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Utilizamos o motor nativo de síntese em tempo real (Web Audio API) para reproduzir as frequências exatas descritas nos tratados de acústica, sem compressão lossy.
              </p>

              <div className="space-y-4 pt-2">
                {content.audioSamples.map((sample) => (
                  <div
                    key={sample.id}
                    className="p-4 bg-stone-50 border border-stone-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-base text-stone-900">
                        {sample.title}
                      </h4>
                      <p className="text-xs text-stone-600">{sample.description}</p>
                      <div className="flex items-center gap-2 text-xs font-mono text-stone-500 pt-1">
                        <span>Notas: {sample.notes.join(' - ')}</span>
                        <span>•</span>
                        <span>Frequências: {sample.frequenciesHz.map((f) => `${f.toFixed(1)}Hz`).join(', ')}</span>
                      </div>
                    </div>

                    <Button
                      id={`btn-play-sample-${sample.id}`}
                      variant="primary"
                      size="sm"
                      onClick={() => playAudioSample(sample.id, sample.frequenciesHz)}
                    >
                      <Play className="w-3.5 h-3.5 mr-1" />
                      {playingAudioId === sample.id ? 'Reproduzindo...' : 'Ouvir Agora'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: PARTITURA INTERATIVA */}
        {activeTab === 'partitura' && content.scoreSnippet && (
          <div className="max-w-4xl space-y-4">
            <ScoreContainer
              id="lesson-interactive-score"
              title={content.scoreSnippet.title}
              composer="Cátedra de Teoria Musical - Academia Musical Digital"
              clef={content.scoreSnippet.clef}
              keySignature={content.scoreSnippet.keySignature}
              timeSignature={content.scoreSnippet.timeSignature}
              tempoBpm={100}
              measures={[
                { measureNumber: 1, notes: ['C4', 'D4', 'E4', 'F4'], chords: 'C', isCurrent: true },
                { measureNumber: 2, notes: ['G4', 'A4', 'B4', 'C5'], chords: 'G', isCurrent: false },
              ]}
            />
            {content.scoreSnippet.caption && (
              <p className="text-xs text-stone-600 text-center font-sans">
                {content.scoreSnippet.caption}
              </p>
            )}
          </div>
        )}

        {/* TAB 4: VÍDEO & TRANSCRIÇÃO */}
        {activeTab === 'video' && content.video && (
          <div className="max-w-4xl space-y-6">
            <Card variant="default" padding="lg" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                  <Film className="w-5 h-5 text-red-800" />
                  {content.video.title}
                </h3>
                <span className="text-xs font-mono text-stone-500">
                  {content.video.durationMinutes} minutos
                </span>
              </div>

              {/* Simulated accessible media player container */}
              <div className="w-full aspect-video bg-stone-900 rounded-lg flex flex-col items-center justify-center text-white p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-red-800/80 hover:bg-red-800 flex items-center justify-center cursor-pointer transition-colors shadow-lg">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
                <span className="text-xs font-sans text-stone-300">
                  Vídeo Pedagógico Acessível • Demonstração no Piano de Cauda
                </span>
              </div>

              {/* Transcript */}
              <div className="space-y-2 pt-4 border-t border-stone-200">
                <h4 className="font-serif font-bold text-sm text-stone-900">
                  Transcrição Textual & Didática:
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed font-sans bg-stone-50 p-4 rounded border border-stone-200">
                  {content.video.transcript}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 5: ATIVIDADES PRÁTICAS */}
        {activeTab === 'atividades' && (
          <div className="max-w-3xl space-y-4">
            <Card variant="default" padding="lg" className="space-y-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-red-800" />
                  Atividades Práticas de Fixação
                </h3>
                <p className="text-xs text-stone-600">
                  Exercícios avaliados com feedback imediato, registro de tentativa e emissão de evidência.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {activities.map((act, idx) => (
                  <div
                    key={act.id}
                    className="p-4 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono uppercase text-stone-500 font-semibold">
                        Atividade 0{idx + 1} • Dificuldade: {act.difficulty}
                      </span>
                      <h4 className="font-serif font-bold text-base text-stone-900">
                        {act.variants[variant]?.question || act.variants.TRADITIONAL.question}
                      </h4>
                      <div className="flex gap-1.5">
                        {act.skills.map((s, i) => (
                          <span key={i} className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button
                      id={`btn-start-act-${act.id}`}
                      size="sm"
                      variant="primary"
                      onClick={() => navigate(`/academy/activity/${act.id}`)}
                    >
                      Resolver Atividade
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 6: REFERÊNCIAS BIBLIOGRÁFICAS */}
        {activeTab === 'referencias' && (
          <div className="max-w-3xl space-y-4">
            <Card variant="default" padding="lg" className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-red-800" />
                Tratados & Bibliografia Canônica
              </h3>
              <p className="text-xs text-stone-600">
                Fontes acadêmicas de proveniência formal que embasam rigorosamente as proposições desta lição.
              </p>

              <div className="space-y-3 pt-2">
                {content.references.map((ref, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1 text-xs"
                  >
                    <div className="font-bold font-serif text-stone-900 text-sm">
                      {ref.title}
                    </div>
                    <div className="text-stone-700 font-sans">
                      Autor(es): <span className="font-medium">{ref.author}</span>
                    </div>
                    <div className="text-stone-500 font-mono text-[11px]">
                      {ref.chapterOrLecture}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Bottom Navigation Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/academy/course/${lesson.courseId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Grade do Curso
          </Button>

          <div className="flex items-center gap-3">
            <Button
              id="btn-bottom-complete-lesson"
              variant={isCompleted ? 'outline' : 'primary'}
              size="sm"
              onClick={handleToggleComplete}
            >
              <CheckCircle className="w-4 h-4 mr-1.5" />
              {isCompleted ? 'Lição Concluída ✓' : 'Concluir Lição'}
            </Button>

            {activities.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/academy/activity/${activities[0].id}`)}
              >
                Próxima Atividade
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
};
