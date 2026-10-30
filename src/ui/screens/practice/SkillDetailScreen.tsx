import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  Star,
  Play,
  Layers,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { Skill, Exercise, MasteryRecord } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter, useRouteParams } from '../../navigation/router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { PageLayout } from '../../components/layout/PageLayout';
import { ProgressRing } from '../../components/data-display/ProgressRing';
import { SkillNode } from '../../components/domain/SkillNode';

export const SkillDetailScreen: React.FC = () => {
  const { userId } = useCurrentUser();
  const router = useRouter();
  const params = useRouteParams();
  const skillId = params.id;

  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [mastery, setMastery] = useState<MasteryRecord | null>(null);

  useEffect(() => {
    async function loadSkillData() {
      /**
       * 🔴 SAIR ANTES DE DESLIGAR O CARREGAMENTO DEIXA A TELA NO ESQUELETO.
       *
       * Havia dois `return` aqui — um para quem não está logado, outro para
       * rota sem parâmetro — e os dois saíam **antes** de `setIsLoading(false)`.
       * O resultado é esqueleto eterno: a tela não abre, não dá erro, e não diz
       * nada.
       *
       * Rota sem parâmetro precisa cair no "não encontrado" da própria tela, e
       * não em carregamento infinito. E a competência é pública: o que exige
       * nome é a **maestria**, que é medição de alguém.
       */
      try {
        setLoading(true);

        if (skillId) {
          const [skillData, exercisesData] = await Promise.all([
            practiceService.getSkill(skillId),
            practiceService.listExercises(skillId),
          ]);
          setSkill(skillData);
          setExercises(exercisesData);

          if (userId) {
            const overview = await practiceService.getMasteryOverview(userId);
            setMastery(overview.masteries.find((rec) => rec.skillId === skillId) ?? null);
          }
        }
      } catch (err) {
        console.error('Failed to load skill details', err);
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    }
    loadSkillData();
  }, [skillId]);

  const handleLaunchExercise = async (ex: Exercise) => {
    if (!userId) return;
    try {
      const session = await practiceService.startSession(
        userId,
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
        <Button variant="outline" onClick={() => router.navigate('/practice?aba=licoes')}>
          Voltar para Árvore
        </Button>
      </div>
    );
  }

  const currentLevel = mastery?.level || 1;
  const levelNames = ['', 'Novato', 'Aprendiz', 'Competente', 'Mestre', 'Virtuoso'];

  return (
    <PageLayout
      id="skilldetail"
      form="detail"
      density="operational"
      asideLabel="Habilidade"
      state={isLoading ? 'loading' : !skill ? 'empty' : 'content'}
      loadingMessage="Carregando..."
    >
      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Domínio
          </p>
          {skill && (
            <div className="flex items-center gap-3">
              <ProgressRing
                id="skill-ring"
                value={mastery?.scorePercentage ?? 0}
                size={52}
                showLabel
              />
              <p className="text-xs text-stone-600">
                {skill.microSkills?.length ?? 0} micro-habilidades
              </p>
            </div>
          )}
          <Button variant="outline" size="sm" className="w-full" onClick={() => router.navigate('/practice?aba=licoes')}>
            Voltar à árvore
          </Button>
        </Card>
      </PageLayout.Aside>

      <PageLayout.Main>
      {/* Back Button */}
      <div>
        <button
          onClick={() => router.navigate('/practice?aba=licoes')}
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
            <SkillNode
              key={ms.id}
              id={`micro-${ms.id}`}
              title={ms.name}
              level={mastery?.level ?? 0}
              maxLevel={5}
              progressPercentage={mastery?.scorePercentage ?? 0}
              onClick={() => router.navigate(`/practice/microskill/${ms.id}`)}
            />
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
      </PageLayout.Main>
    </PageLayout>
  );
};
