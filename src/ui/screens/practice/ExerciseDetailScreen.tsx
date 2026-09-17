import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  Play,
  Volume2,
  ChevronLeft,
  Music,
} from 'lucide-react';
import { Exercise, Skill } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter, useRouteParams } from '../../navigation/router';
import { webAudioSynth } from '../../../infrastructure/audio/synth';

export const ExerciseDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useRouteParams();
  const exerciseId = params.id;

  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    async function loadData() {
      // Rota sem parametro: nao consulta o servico e recai no estado de
      // "nao encontrado" da propria tela, em vez de exibir uma entidade
      // fixa de reserva (01_REPOSITORY_AUDIT R-02).
      if (!exerciseId) return;
      try {
        setLoading(true);
        const ex = await practiceService.getExercise(exerciseId);
        setExercise(ex);
        if (ex) {
          const sk = await practiceService.getSkill(ex.skillId);
          setSkill(sk);
        }
      } catch (err) {
        console.error('Failed to load exercise detail', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [exerciseId]);

  const handleStartSession = async () => {
    if (!exercise) return;
    try {
      const session = await practiceService.startSession(
        'usr_founder_1',
        exercise.modality,
        exercise.id,
        exercise.skillId
      );
      router.navigate(`/practice/session/${session.id}`);
    } catch (e) {
      console.error('Failed to start session', e);
    }
  };

  const handlePlayAudioPrompt = () => {
    if (!exercise?.audioPrompt) return;
    setIsPlayingAudio(true);
    exercise.audioPrompt.frequenciesHz.forEach((freq, idx) => {
      setTimeout(() => {
        webAudioSynth.playTone(freq, 0.8, 'triangle');
        if (idx === exercise.audioPrompt!.frequenciesHz.length - 1) {
          setTimeout(() => setIsPlayingAudio(false), 900);
        }
      }, idx * 600);
    });
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-stone-200 rounded" />
        <div className="h-48 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-stone-900">Exercício não encontrado</h2>
        <Button variant="outline" onClick={() => router.navigate('/practice')}>
          Voltar para Prática
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Back Button */}
      <div>
        <button
          onClick={() =>
            skill ? router.navigate(`/practice/skill/${skill.id}`) : router.navigate('/practice')
          }
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para {skill?.name || 'Prática'}
        </button>
      </div>

      {/* Main Card */}
      <Card variant="default" padding="lg" className="space-y-6 bg-white border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="neutral">{exercise.modality}</Badge>
              <Badge variant="brand">{exercise.difficulty}</Badge>
              {exercise.tempoBpm && (
                <span className="text-xs font-mono font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                  {exercise.tempoBpm} BPM
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {exercise.title}
            </h1>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-stone-400 block">Recompensa</span>
            <span className="text-lg font-bold font-mono text-red-800">
              +{exercise.xpAwarded} XP
            </span>
          </div>
        </div>

        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
          <h3 className="text-xs font-mono uppercase font-bold text-stone-500">
            Instrução de Execução
          </h3>
          <p className="text-sm text-stone-800 leading-relaxed font-sans font-medium">
            {exercise.instruction}
          </p>
        </div>

        {/* Notation Snippet or Audio Prompt */}
        {exercise.notationSnippet && (
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-amber-900 flex items-center gap-1.5">
                <Music className="w-4 h-4" /> Snippet Notacional Urtext
              </span>
              <span className="text-[11px] font-mono text-amber-800">
                Clave: {exercise.notationSnippet.clef} • Tom: {exercise.notationSnippet.keySignature} • {exercise.notationSnippet.timeSignature}
              </span>
            </div>
            <div className="font-mono text-lg font-bold text-stone-900 tracking-widest bg-white p-3 rounded-lg border border-amber-200">
              {exercise.notationSnippet.notesDisplay}
            </div>
          </div>
        )}

        {exercise.audioPrompt && (
          <div className="flex items-center justify-between p-4 bg-stone-100 rounded-xl border border-stone-200">
            <div>
              <span className="text-xs font-mono font-semibold text-stone-800 block">
                Áudio Guia Canônico
              </span>
              <span className="text-xs text-stone-500">
                Notas: {exercise.audioPrompt.notes.join(' - ')}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayAudioPrompt}
              disabled={isPlayingAudio}
              className="flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingAudio ? 'Reproduzindo...' : 'Ouvir Exemplo'}</span>
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <div className="text-xs text-stone-500 font-sans">
            Tolerância de afinação: ±{exercise.toleranceCents} cents
          </div>
          <Button
            id="btn-start-exercise-session"
            variant="primary"
            size="lg"
            onClick={handleStartSession}
            className="flex items-center gap-2 bg-red-800 hover:bg-red-700 text-white"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Iniciar Prática</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
