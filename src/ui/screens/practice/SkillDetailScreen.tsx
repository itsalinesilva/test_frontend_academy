import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  Star,
  Play,
  ArrowRight,
  Layers,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { Skill, Exercise, MasteryRecord } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter, useRouteParams } from '../../navigation/router';

export const SkillDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useRouteParams();
  const skillId = params.id;

  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [mastery, setMastery] = useState<MasteryRecord | null>(null);

  useEffect(() => {
    async function loadSkillData() {
      // Rota sem parametro: nao consulta o servico e recai no estado de
      // "nao encontrado" da propria tela, em vez de exibir uma entidade
      // fixa de reserva (01_REPOSITORY_AUDIT R-02).
      if (!skillId) return;
      try {
        setLoading(true);
        const [skillData, exercisesData] = await Promise.all([
          practiceService.getSkill(skillId),
          practiceService.listExercises(skillId),
        ]);
        setSkill(skillData);
        setExercises(exercisesData);

        // Fetch mastery for founder user
        const overview = await practiceService.getMasteryOverview('usr_founder_1');
        const m = overview.masteries.find((rec) => rec.skillId === skillId);
        setMastery(m || null);
      } catch (err) {
        console.error('Failed to load skill details', err);
      } finally {
        setLoading(false);
      }
    }
    loadSkillData();
  }, [skillId]);

  const handleLaunchExercise = async (ex: Exercise) => {
    try {
      const session = await practiceService.startSession(
        'usr_founder_1',
        ex.modality,
        ex.id,
        skill?.id
      );
      router.navigate(`/practice/session/${session.id}`);
    } catch (e) {
      console.error('Failed to launch exercise', e);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-stone-200 rounded" />
        <div className="h-40 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-stone-900">Habilidade não encontrada</h2>
        <Button variant="outline" onClick={() => router.navigate('/practice/skill-tree')}>
          Voltar para Árvore
        </Button>
      </div>
    );
  }

  const currentLevel = mastery?.level || 1;
  const levelNames = ['', 'Novato', 'Aprendiz', 'Competente', 'Mestre', 'Virtuoso'];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Back Button */}
      <div>
        <button
          onClick={() => router.navigate('/practice/skill-tree')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Árvore de Habilidades
        </button>
      </div>

      {/* Header Profile */}
      <Card variant="default" padding="lg" className="space-y-4 bg-white border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-stone-100 text-stone-800">
                {skill.code}
              </span>
              <Badge variant="brand">{skill.category}</Badge>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {skill.name}
            </h1>
          </div>

          {/* Mastery Badge */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center shrink-0">
            <span className="text-[10px] text-stone-500 uppercase tracking-wide block font-mono">
              Nível de Maestria
            </span>
            <div className="flex items-center justify-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= currentLevel ? 'fill-amber-400 text-amber-500' : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-stone-800 block mt-1">
              {levelNames[currentLevel]} ({currentLevel}/5)
            </span>
          </div>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed font-sans">
          {skill.description}
        </p>

        {skill.prerequisiteSkillIds.length > 0 && (
          <div className="text-xs text-stone-500 pt-2 border-t border-stone-100">
            <span className="font-semibold text-stone-700">Pré-requisitos: </span>
            {skill.prerequisiteSkillIds.join(', ')}
          </div>
        )}
      </Card>

      {/* Micro-Skills Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-anil-800" />
            <span>Microcompetências Constitutivas</span>
          </h2>
          <span className="text-xs text-stone-500">
            {skill.microSkills?.length || 0} micro-habilidades
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skill.microSkills?.map((ms) => (
            <Card
              key={ms.id}
              variant="default"
              padding="md"
              className="hover:border-stone-400 transition-all flex flex-col justify-between space-y-3 cursor-pointer"
              onClick={() => router.navigate(`/practice/microskill/${ms.id}`)}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                    {ms.code}
                  </span>
                  <Badge variant="neutral" className="text-[10px]">
                    +{ms.xpBonus} XP
                  </Badge>
                </div>
                <h3 className="font-serif font-bold text-base text-stone-900 mt-2">
                  {ms.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                  {ms.description}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-stone-500 font-mono text-[11px]">
                  Alvo: {ms.targetMetric}
                </span>
                <span className="font-medium text-anil-800 flex items-center gap-1">
                  Ver Rúbrica <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Exercises Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>Exercícios Práticos Associados</span>
          </h2>
        </div>

        <div className="space-y-3">
          {exercises.map((ex) => (
            <Card
              key={ex.id}
              variant="default"
              padding="md"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-anil-800 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral">{ex.modality}</Badge>
                  <Badge variant="brand">{ex.difficulty}</Badge>
                  <span className="text-xs font-mono text-stone-400">+{ex.xpAwarded} XP</span>
                </div>
                <h3 className="font-serif font-bold text-stone-900 text-base">
                  {ex.title}
                </h3>
                <p className="text-xs text-stone-600 line-clamp-1">
                  {ex.instruction}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.navigate(`/practice/exercise/${ex.id}`)}
                >
                  Ficha do Exercício
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleLaunchExercise(ex)}
                  className="flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Praticar Agora</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
