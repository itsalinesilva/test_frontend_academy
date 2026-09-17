import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  Target,
  CheckCircle2,
  ChevronLeft,
  Play,
  Sparkles,
} from 'lucide-react';
import { MicroSkill, Skill, Exercise } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter, useRouteParams } from '../../navigation/router';

export const MicroSkillScreen: React.FC = () => {
  const router = useRouter();
  const params = useRouteParams();
  const microId = params.id;

  const [loading, setLoading] = useState(true);
  const [microSkill, setMicroSkill] = useState<MicroSkill | null>(null);
  const [parentSkill, setParentSkill] = useState<Skill | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    async function loadData() {
      // Rota sem parametro: nao consulta o servico e recai no estado de
      // "nao encontrado" da propria tela, em vez de exibir uma entidade
      // fixa de reserva (01_REPOSITORY_AUDIT R-02).
      if (!microId) return;
      try {
        setLoading(true);
        const ms = await practiceService.getMicroSkill(microId);
        setMicroSkill(ms);
        if (ms) {
          const [ps, allEx] = await Promise.all([
            practiceService.getSkill(ms.skillId),
            practiceService.listExercises(ms.skillId),
          ]);
          setParentSkill(ps);
          setExercises(allEx.filter((e) => e.microSkillId === ms.id || !e.microSkillId));
        }
      } catch (err) {
        console.error('Failed to load microskill', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [microId]);

  const handleStartExercise = async (ex: Exercise) => {
    try {
      const session = await practiceService.startSession(
        'usr_founder_1',
        ex.modality,
        ex.id,
        parentSkill?.id
      );
      router.navigate(`/practice/session/${session.id}`);
    } catch (e) {
      console.error('Failed to launch exercise', e);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-stone-200 rounded" />
        <div className="h-40 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  if (!microSkill) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-stone-900">Microcompetência não encontrada</h2>
        <Button variant="outline" onClick={() => router.navigate('/practice/skill-tree')}>
          Voltar para Árvore
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb Back */}
      <div>
        <button
          onClick={() =>
            parentSkill ? router.navigate(`/practice/skill/${parentSkill.id}`) : router.navigate('/practice/skill-tree')
          }
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar para Habilidade: {parentSkill?.name || 'Habilidade'}
        </button>
      </div>

      {/* Main Info Card */}
      <Card variant="default" padding="lg" className="space-y-4 bg-white border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-red-100 text-red-900">
                {microSkill.code}
              </span>
              <Badge variant="brand">{microSkill.category}</Badge>
              <Badge variant="neutral">{microSkill.modality}</Badge>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {microSkill.name}
            </h1>
          </div>

          <Badge variant="success" className="text-xs px-3 py-1 font-mono">
            +{microSkill.xpBonus} XP Bônus
          </Badge>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed font-sans">
          {microSkill.description}
        </p>

        {/* Rubric & Target */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-[10px] uppercase font-mono text-stone-500 block mb-1">
              Rúbrica de Avaliação
            </span>
            <p className="text-xs text-stone-800 font-medium leading-relaxed">
              {microSkill.rubric}
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-[10px] uppercase font-mono text-stone-500 block mb-1">
              Métrica Alvo de Desempenho
            </span>
            <p className="text-xs text-red-800 font-mono font-bold leading-relaxed flex items-center gap-1.5">
              <Target className="w-4 h-4 text-red-700" />
              {microSkill.targetMetric}
            </p>
          </div>
        </div>

        {/* Criteria Checklist */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <h3 className="text-xs font-bold uppercase font-mono text-stone-700">
            Critérios Pedagógicos de Aprovação
          </h3>
          <ul className="space-y-1.5">
            {microSkill.criteria.map((crit, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-stone-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{crit}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Target Drills */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-800" />
          <span>Exercícios Recomendados para esta Microcompetência</span>
        </h2>

        <div className="space-y-3">
          {exercises.map((ex) => (
            <Card
              key={ex.id}
              variant="default"
              padding="md"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-red-800 transition-all"
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
                  Ver Ficha
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStartExercise(ex)}
                  className="flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Praticar</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
