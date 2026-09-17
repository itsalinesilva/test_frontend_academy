import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  Star,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Skill, MasteryRecord } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter } from '../../navigation/router';

export const MasteryScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [masteries, setMasteries] = useState<MasteryRecord[]>([]);

  useEffect(() => {
    async function loadMastery() {
      try {
        setLoading(true);
        const [allSkills, overview] = await Promise.all([
          practiceService.listSkills(),
          practiceService.getMasteryOverview('usr_founder_1'),
        ]);
        setSkills(allSkills);
        setMasteries(overview.masteries);
      } catch (err) {
        console.error('Failed to load mastery data', err);
      } finally {
        setLoading(false);
      }
    }
    loadMastery();
  }, []);

  const levelLabels = ['', 'Novato', 'Aprendiz', 'Competente', 'Mestre', 'Virtuoso'];

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-stone-200 rounded" />
        <div className="h-48 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  const masteredCount = masteries.filter((m) => m.level >= 4).length;
  const inProgressCount = masteries.filter((m) => m.level >= 1 && m.level < 4).length;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <button
            onClick={() => router.navigate('/practice')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar para Prática
          </button>
          <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
            Matriz de Maestria & Competências
          </h1>
          <p className="text-sm text-stone-600 font-sans mt-1">
            Acompanhe o nível de maturidade e retenção em cada habilidade musical canônica.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Card variant="default" padding="sm" className="bg-stone-50 text-center px-4 py-2">
            <span className="text-[10px] uppercase font-mono text-stone-500 block">Habilidades Mestras</span>
            <span className="text-xl font-bold font-mono text-red-900">{masteredCount}</span>
          </Card>
          <Card variant="default" padding="sm" className="bg-stone-50 text-center px-4 py-2">
            <span className="text-[10px] uppercase font-mono text-stone-500 block">Em Progresso</span>
            <span className="text-xl font-bold font-mono text-amber-700">{inProgressCount}</span>
          </Card>
        </div>
      </div>

      {/* Mastery Tiers Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div key={lvl} className="p-3 bg-white rounded-xl border border-stone-200 text-center space-y-1">
            <div className="flex justify-center gap-0.5">
              {[...Array(lvl)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-500" />
              ))}
            </div>
            <span className="text-xs font-bold text-stone-900 block font-serif">
              Nível {lvl}: {levelLabels[lvl]}
            </span>
          </div>
        ))}
      </div>

      {/* Skills Mastery List */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-red-800" />
          <span>Habilidades Auditadas</span>
        </h2>

        <div className="space-y-3">
          {skills.map((skill) => {
            const mastery = masteries.find((m) => m.skillId === skill.id);
            const level = mastery?.level || 1;
            const scorePct = mastery?.scorePercentage || 75;
            const totalAttempts = mastery?.totalAttempts || 12;

            return (
              <Card
                key={skill.id}
                variant="default"
                padding="md"
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-400 transition-all"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                      {skill.code}
                    </span>
                    <Badge variant="brand">{skill.category}</Badge>
                    <span className="text-xs font-serif font-semibold text-red-900">
                      Nível {level} - {levelLabels[level]}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-stone-900 truncate">
                    {skill.name}
                  </h3>

                  <div className="flex items-center gap-4 text-xs font-mono text-stone-500">
                    <span>Acurácia Média: {scorePct}%</span>
                    <span>•</span>
                    <span>Tentativas: {totalAttempts}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= level ? 'fill-amber-400 text-amber-500' : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.navigate(`/practice/skill/${skill.id}`)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <span>Praticar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};
