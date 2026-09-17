import React, { useEffect, useState } from 'react';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import { Badge } from '../../components/base/Badge';
import {
  Filter,
} from 'lucide-react';
import { SkillTree, SkillCategory } from '../../../domain/practice';
import { practiceService } from '../../../services/application/practice.service';
import { useRouter } from '../../navigation/router';
import { PageLayout } from '../../components/layout/PageLayout';
import { SkillNode } from '../../components/domain/SkillNode';
import { LockedState } from '../../components/feedback/LockedState';

export const SkillTreeScreen: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(false);
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
    <PageLayout
      id="skilltree"
      form="detail"
      density="operational"
      asideLabel="Trilhas"
      state={isLoading ? 'loading' : trees.length === 0 ? 'empty' : 'content'}
      loadingMessage="Carregando..."
    >
      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Árvores
          </p>
          <dl className="space-y-1.5 text-xs text-stone-700">
            <div className="flex items-center justify-between">
              <dt>Trilhas</dt>
              <dd className="font-mono font-bold">{trees.length}</dd>
            </div>
          </dl>
          <Button variant="outline" size="sm" className="w-full" onClick={() => router.navigate('/practice')}>
            Voltar ao treino
          </Button>
        </Card>

        {/* Uma habilidade esmaecida nao diz POR QUE esta esmaecida. */}
        <Card variant="default" padding="md">
          <LockedState
            id="skill-tree-locked"
            title="Habilidades bloqueadas"
            description="Cada habilidade abre quando os pré-requisitos dela são dominados."
            requirementText="Domine as habilidades anteriores para liberar as seguintes."
          />
        </Card>
      </PageLayout.Aside>

      <PageLayout.Main>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono tracking-wider uppercase text-anil-800 font-semibold">
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
                  ? 'bg-anil-800 text-white shadow-xs'
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
                  ? 'bg-white border-anil-800 text-red-900 shadow-sm font-semibold'
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
                  const desbloqueado = node.unlockedByDefault || (node.masteryLevel || 0) > 0;
                  return (
                    <SkillNode
                      key={node.skillId}
                      id={`skill-node-${node.skillId}`}
                      title={node.name}
                      level={node.masteryLevel || 0}
                      maxLevel={5}
                      progressPercentage={((node.masteryLevel || 0) / 5) * 100}
                      isLocked={!desbloqueado}
                      onClick={
                        desbloqueado
                          ? () => router.navigate(`/practice/skill/${node.skillId}`)
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      </PageLayout.Main>
    </PageLayout>
  );
};
