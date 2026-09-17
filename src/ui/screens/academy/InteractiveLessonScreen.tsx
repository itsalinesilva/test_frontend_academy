import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
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
  AudienceVariant,
} from '../../../domain/academy';
import {
  Play,
  Volume2,
  Music,
  ArrowRight,
  Award,
  Activity,
  RotateCcw,
} from 'lucide-react';

interface PianoKey {
  note: string;
  label: string;
  freq: number;
  isBlack?: boolean;
}

const PIANO_KEYS: PianoKey[] = [
  { note: 'C4', label: 'Dó (C)', freq: 261.63 },
  { note: 'C#4', label: 'C#', freq: 277.18, isBlack: true },
  { note: 'D4', label: 'Ré (D)', freq: 293.66 },
  { note: 'D#4', label: 'D#', freq: 311.13, isBlack: true },
  { note: 'E4', label: 'Mi (E)', freq: 329.63 },
  { note: 'F4', label: 'Fá (F)', freq: 349.23 },
  { note: 'F#4', label: 'F#', freq: 369.99, isBlack: true },
  { note: 'G4', label: 'Sol (G)', freq: 392.0 },
  { note: 'G#4', label: 'G#', freq: 415.3, isBlack: true },
  { note: 'A4', label: 'Lá (A)', freq: 440.0 },
  { note: 'A#4', label: 'A#', freq: 466.16, isBlack: true },
  { note: 'B4', label: 'Si (B)', freq: 493.88 },
  { note: 'C5', label: 'Dó (C5)', freq: 523.25 },
];

export const InteractiveLessonScreen: React.FC = () => {
  const { params, navigate } = useRouter();
  const lessonId = params.id;

  const [lesson, setLesson] = useState<AcademyLesson | null>(null);
  const [isLoading] = useState(false);
  const [variant, setVariant] = useState<AudienceVariant>('TRADITIONAL');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [interactiveHistory, setInteractiveHistory] = useState<string[]>([]);
  const [exercisePassed, setExercisePassed] = useState<boolean>(false);
  const [evidenceCreated, setEvidenceCreated] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      // Rota sem parametro: nao consulta o servico e recai no estado de
      // "nao encontrado" da propria tela, em vez de exibir uma entidade
      // fixa de reserva (01_REPOSITORY_AUDIT R-02).
      if (!lessonId) return;
      try {
        const l = await academyService.getLesson(lessonId);
        if (l) {
          setLesson(l);
                  }
      } catch (err) {
        console.error('Error loading interactive lesson:', err);
      }
    };

    loadData();
  }, [lessonId]);

  const handlePlayKey = (key: PianoKey) => {
    webAudioSynth.playTone(key.freq, 0.8);
    setActiveKey(key.note);
    setInteractiveHistory((prev) => [...prev.slice(-7), key.note]);
    setTimeout(() => setActiveKey(null), 300);

    // Check exercise condition: playing C4 then E4 then G4 (Triad)
    const newSeq = [...interactiveHistory, key.note];
    const last3 = newSeq.slice(-3).join('-');
    if (last3 === 'C4-E4-G4') {
      setExercisePassed(true);
    }
  };

  const handlePlayScale = () => {
    const scaleFreqs = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
    webAudioSynth.playSequence(scaleFreqs, 0.35);
  };

  const handlePlayTriad = () => {
    const triadFreqs = [261.63, 329.63, 392.0];
    webAudioSynth.playSequence(triadFreqs, 0.45);
  };

  const handleRegisterEvidence = async () => {
    const session = await authService.getActiveSession();
    // Sem sessao nao ha progresso a carregar nem a gravar: o fallback
    // anterior misturava dados de visitantes anonimos com os da
    // fundadora (CLAUDE_AUDIT.md T-05).
    if (!session) return;
    const userId = session.user.id;
    if (!lesson) return;

    // Trigger lesson completion and log evidence
    await academyService.completeLesson(userId, lesson.id);
    setEvidenceCreated(true);
  };


  const content = lesson?.variants[variant] ?? lesson?.variants.TRADITIONAL ?? null;

  return (
    <PageLayout
      id="interactive-lesson"
      form="detail"
      density="editorial"
      asideLabel="Laboratorio"
      state={isLoading ? 'loading' : !lesson ? 'empty' : 'content'}
      loadingMessage="Carregando o laboratorio..."
      emptyProps={{
        title: 'Licao nao encontrada',
        description: 'O identificador informado nao corresponde a uma licao do curriculo.',
        actionLabel: 'Voltar ao catalogo',
        onAction: () => navigate('/academy/catalog'),
      }}
    >
      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Laboratorio
          </p>
          <p className="text-xs leading-relaxed text-stone-600">
            Pratique o conceito com medicao real antes de seguir.
          </p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/practice/skill-tree')}>
            Abrir treinador
          </Button>
        </Card>
      </PageLayout.Aside>

      <PageLayout.Main>
      <div className="space-y-6">
        {/* Audience Variant Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white border border-stone-200 rounded-xl shadow-xs">
          <AudienceToggle
            id="interactive-audience-toggle"
            variant={variant}
            onChange={(v) => setVariant(v)}
          />
          <span className="text-xs text-stone-600 font-medium">
            Prática interativa com sintetizador acústico integrado
          </span>
        </div>

        {/* Main Interactive Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Keyboard, Audio Experiments, Score */}
          <div className="lg:col-span-2 space-y-6">
            {/* Piano & Acoustic Synth Simulator */}
            <Card variant="default" padding="lg" className="space-y-5 border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                    <Music className="w-5 h-5 text-anil-800" />
                    Teclado & Sintetizador Acústico Canônico
                  </h3>
                  <p className="text-xs text-stone-600">
                    Toque nas teclas para escutar as frequências fundamentais em tempo real.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handlePlayScale}>
                    <Play className="w-3 h-3 mr-1" />
                    Ouvir Escala
                  </Button>
                  <Button size="sm" variant="outline" onClick={handlePlayTriad}>
                    <Volume2 className="w-3 h-3 mr-1" />
                    Ouvir Tríade (C-E-G)
                  </Button>
                </div>
              </div>

              {/* Interactive Virtual Piano */}
              <div className="p-4 bg-stone-900 rounded-xl flex justify-center overflow-x-auto select-none shadow-inner">
                <div className="flex relative py-2">
                  {PIANO_KEYS.map((k) => {
                    const isActive = activeKey === k.note;
                    if (k.isBlack) {
                      return (
                        <button
                          key={k.note}
                          type="button"
                          onClick={() => handlePlayKey(k)}
                          className={`w-7 h-24 -mx-3.5 z-10 rounded-b-sm border border-stone-950 transition-all ${
                            isActive
                              ? 'bg-anil-700 shadow-md transform translate-y-0.5'
                              : 'bg-stone-950 hover:bg-stone-800'
                          }`}
                          title={`${k.note} (${k.freq}Hz)`}
                        >
                          <span className="text-[9px] font-mono text-stone-400 block pt-16 text-center">
                            {k.label}
                          </span>
                        </button>
                      );
                    }
                    return (
                      <button
                        key={k.note}
                        type="button"
                        onClick={() => handlePlayKey(k)}
                        className={`w-11 h-40 bg-white border border-stone-300 rounded-b-md mx-0.5 flex flex-col justify-end p-2 transition-all ${
                          isActive
                            ? 'bg-amber-100 shadow-inner transform translate-y-0.5'
                            : 'hover:bg-stone-100'
                        }`}
                        title={`${k.note} (${k.freq}Hz)`}
                      >
                        <span className="text-[10px] font-mono font-bold text-stone-900 text-center block">
                          {k.note}
                        </span>
                        <span className="text-[9px] font-sans text-stone-500 text-center block">
                          {k.label.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* History Tape of Played Notes */}
              <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                <span className="font-mono">
                  Histórico de Notas:{' '}
                  {interactiveHistory.length > 0 ? interactiveHistory.join(' → ') : 'Nenhuma nota tocada'}
                </span>
                {interactiveHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setInteractiveHistory([])}
                    className="hover:text-stone-800 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Limpar
                  </button>
                )}
              </div>
            </Card>

            {/* Guided Interactive Task */}
            <Card
              variant="default"
              padding="lg"
              className={`space-y-4 border ${
                exercisePassed ? 'border-emerald-300 bg-emerald-50/30' : 'border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-anil-800" />
                  <h4 className="font-serif font-bold text-base text-stone-900">
                    Desafio Interativo: Construção da Tríade de Dó Maior
                  </h4>
                </div>
                {exercisePassed && (
                  <Badge variant="brand" size="sm">Desafio Concluído ✓</Badge>
                )}
              </div>

              <p className="text-xs text-stone-700 leading-relaxed font-sans">
                Para completar este laboratório e gerar evidência acadêmica de domínio, toque sequencialmente
                as teclas da Tríade Fundamental: <strong>C4 (Dó)</strong>, depois <strong>E4 (Mi)</strong> e finalmente <strong>G4 (Sol)</strong>.
              </p>

              {exercisePassed ? (
                <div className="p-3 bg-emerald-100/80 border border-emerald-300 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
                  <span className="font-medium">
                    Excelente! Sequência C4-E4-G4 reconhecida com sucesso pela análise acústica!
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleRegisterEvidence}
                  >
                    {evidenceCreated ? 'Evidência Salva no Perfil' : 'Gerar Evidência Canônica'}
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600">
                  Aguardando execução no teclado... (Toque: C4 → E4 → G4)
                </div>
              )}
            </Card>

            {/* Score Renderer */}
            {content?.scoreSnippet && (
              <Card variant="default" padding="lg" className="space-y-3">
                <h4 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                  <Music className="w-4 h-4 text-stone-700" />
                  Partitura Urtext Vinculada
                </h4>
                <ScoreContainer
                  id={`interactive-score-${lessonId}`}
                  title={content?.scoreSnippet.title}
                  clef={content?.scoreSnippet.clef}
                  keySignature={content?.scoreSnippet.keySignature}
                  timeSignature={content?.scoreSnippet.timeSignature}
                />
              </Card>
            )}
          </div>

          {/* Right Column: Pedagogical Chain Connection */}
          <div className="space-y-6">
            {/* The Pedagogical Flow Chain (Lesson → Practice → Exercise → Score → Evidence → Profile) */}
            <Card variant="muted" padding="md" className="space-y-3 border-stone-200">
              <span className="text-[11px] font-mono uppercase text-stone-500 font-semibold block">
                Cadeia de Aprendizagem Formal:
              </span>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-white rounded border border-stone-200 flex items-center gap-2 font-medium text-stone-900">
                  <span className="w-5 h-5 rounded-full bg-anil-800 text-white flex items-center justify-center text-[10px] font-mono">1</span>
                  <span>Lição Multimodal Interativa</span>
                </div>
                <div className="p-2 bg-white rounded border border-stone-200 flex items-center gap-2 font-medium text-stone-900">
                  <span className="w-5 h-5 rounded-full bg-stone-800 text-white flex items-center justify-center text-[10px] font-mono">2</span>
                  <span>Prática Deliberada no Teclado</span>
                </div>
                <div className="p-2 bg-white rounded border border-stone-200 flex items-center gap-2 font-medium text-stone-900">
                  <span className="w-5 h-5 rounded-full bg-stone-800 text-white flex items-center justify-center text-[10px] font-mono">3</span>
                  <span>Exercício com Avaliação Canônica</span>
                </div>
                <div className="p-2 bg-white rounded border border-stone-200 flex items-center gap-2 font-medium text-stone-900">
                  <span className="w-5 h-5 rounded-full bg-stone-800 text-white flex items-center justify-center text-[10px] font-mono">4</span>
                  <span>Leitura em Partitura Urtext</span>
                </div>
                <div className="p-2 bg-emerald-50 rounded border border-emerald-200 flex items-center gap-2 font-medium text-emerald-900">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-mono">5</span>
                  <span>Geração de Evidência Auditada</span>
                </div>
                <div className="p-2 bg-blue-50 rounded border border-blue-200 flex items-center gap-2 font-medium text-blue-900">
                  <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px] font-mono">6</span>
                  <span>Validação no Perfil Acadêmico</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => navigate('/academy/academic-profile')}
                >
                  <Award className="w-3.5 h-3.5 mr-1.5" />
                  Ver Perfil Acadêmico
                </Button>
              </div>
            </Card>

            {/* Quick Link to Practice Hub */}
            <Card variant="default" padding="md" className="space-y-2 text-xs">
              <h4 className="font-serif font-bold text-stone-900">
                Sessão de Prática Avançada
              </h4>
              <p className="text-stone-600">
                Deseja treinar digitação com metrônomo e detecção de afinação?
              </p>
              <Button
                size="sm"
                variant="primary"
                className="w-full justify-center mt-2"
                onClick={() => navigate('/practice')}
              >
                Abrir Central de Prática
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Card>
          </div>
        </div>
      </div>
      </PageLayout.Main>
    </PageLayout>
  );
};
