import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  Lock,
  Unlock,
  Star,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { SkillTree, SkillCategory } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter } from '../../navigation/router';

export const SkillTreeScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trees, setTrees] = useState<SkillTree[]>([]);
  const [selectedTreeId, setSelectedTreeId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    async function loadTrees() {
      try {
        setLoading(true);
        const data = await practiceService.listSkillTrees();
        setTrees(data);
        if (data.length > 0) {
          setSelectedTreeId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load skill trees', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrees();
  }, []);

  const activeTree = trees.find((t) => t.id === selectedTreeId) || trees[0];

  const filteredTrees = trees.filter(
    (t) => selectedCategory === 'ALL' || t.category === selectedCategory
  );

  // Group nodes by tier
  const nodesByTier: Record<number, typeof activeTree.nodes> = {};
  if (activeTree) {
    activeTree.nodes.forEach((node) => {
      if (!nodesByTier[node.tier]) {
        nodesByTier[node.tier] = [];
      }
      nodesByTier[node.tier].push(node);
    });
  }

  const tiers = Object.keys(nodesByTier).map(Number).sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-stone-200 rounded" />
        <div className="h-48 bg-stone-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono tracking-wider uppercase text-red-800 font-semibold">
              Currículo Gamificado
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-serif">Árvore de Habilidades</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
            Árvore de Habilidades & Microcompetências
          </h1>
          <p className="text-sm text-stone-600 font-sans mt-1">
            Navegue pelos tiers pedagógicos, desbloqueie nós de competência e alcance a maestria canônica.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.navigate('/practice')}
        >
          Voltar para Prática
        </Button>
      </div>

      {/* Category Tabs & Tree Selector */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-stone-500 flex items-center gap-1 mr-2">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          {['ALL', ...Object.values(SkillCategory)].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat === 'ALL' ? 'Todas as Categorias' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Tree Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 pb-3">
          {filteredTrees.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTreeId(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all border ${
                selectedTreeId === t.id
                  ? 'bg-white border-red-800 text-red-900 shadow-sm font-semibold'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-white'
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>

      {/* Active Tree Banner */}
      {activeTree && (
        <Card variant="default" padding="md" className="bg-stone-50 border border-stone-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="brand">{activeTree.category}</Badge>
              <h2 className="font-serif font-bold text-lg text-stone-900">
                {activeTree.title}
              </h2>
            </div>
            <span className="text-xs font-mono text-stone-500">Versão {activeTree.version}</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            {activeTree.description}
          </p>
        </Card>
      )}

      {/* Visual Tier Graph */}
      <div className="space-y-10 relative">
        {tiers.map((tierNum) => {
          const nodes = nodesByTier[tierNum] || [];
          return (
            <div key={tierNum} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-stone-900 text-white text-xs font-mono font-bold">
                  Tier {tierNum}
                </span>
                <div className="h-px bg-stone-200 flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nodes.map((node) => {
                  const isUnlocked = node.unlockedByDefault || (node.masteryLevel || 0) > 0;
                  const mastery = node.masteryLevel || 0;

                  return (
                    <Card
                      key={node.skillId}
                      variant="default"
                      padding="lg"
                      className={`relative flex flex-col justify-between space-y-4 transition-all ${
                        isUnlocked
                          ? 'hover:border-red-800 cursor-pointer shadow-xs hover:shadow-md'
                          : 'opacity-75 bg-stone-50 border-dashed border-stone-300'
                      }`}
                      onClick={() => router.navigate(`/practice/skill/${node.skillId}`)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-stone-100 text-stone-700">
                            {node.code}
                          </span>
                          <div className="flex items-center gap-1">
                            {isUnlocked ? (
                              <Unlock className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-stone-400" />
                            )}
                          </div>
                        </div>

                        <h3 className="font-serif font-bold text-stone-900 text-base leading-snug">
                          {node.name}
                        </h3>

                        {node.prerequisites.length > 0 && (
                          <div className="text-[11px] text-stone-500 font-sans">
                            <span className="font-medium text-stone-700">Pré-requisitos: </span>
                            {node.prerequisites.join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Mastery Stars */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= mastery
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                          <span className="text-[10px] font-mono text-stone-500 ml-1">
                            {mastery}/5
                          </span>
                        </div>

                        <span className="text-xs font-medium text-red-800 flex items-center gap-1">
                          Ver Detalhes <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
