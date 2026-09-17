import React, { useState } from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { ExternalLink, ShieldCheck } from 'lucide-react';

interface PortfolioTabProps {
  profile: UnifiedProfileRecord;
}

export const PortfolioTab: React.FC<PortfolioTabProps> = ({ profile }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const portfolio = profile.portfolio || [];

  const filtered = selectedCategory === 'all'
    ? portfolio
    : portfolio.filter((item) => item.category === selectedCategory);

  return (
    <div id="profile-portfolio-tab" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-200">
        <div>
          <h2 className="font-serif text-base font-bold text-stone-900">
            Portfólio de Obras & Produções Artísticas
          </h2>
          <p className="text-xs text-stone-600">
            Dossiê curado de interpretações, transcrições críticas, ensaios morfológicos e gravações de concerto
          </p>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'gravacao', 'partitura', 'analise', 'composicao'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white font-medium'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <Card key={item.id} variant="default" padding="lg" className="border-stone-200 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                    {item.category}
                  </span>
                  <h3 className="font-serif font-bold text-base text-stone-900 mt-0.5">
                    {item.title}
                  </h3>
                  {item.workReferences && (
                    <p className="text-xs text-stone-600 mt-0.5">{item.workReferences}</p>
                  )}
                </div>
                {item.isFeatured && (
                  <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-medium">
                    Destaque
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-2 text-xs text-stone-700 leading-relaxed">
                <div>
                  <span className="font-semibold text-stone-900">Contexto: </span>
                  {item.context}
                </div>
                <div>
                  <span className="font-semibold text-stone-900">Objetivo: </span>
                  {item.objective}
                </div>
                <div>
                  <span className="font-semibold text-stone-900">Papel no Projeto: </span>
                  {item.userRoleInProject}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100">
              <div className="flex flex-wrap gap-1 mb-3">
                {item.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-50">
                <span className="text-[11px] font-mono text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Evidência Vinculada
                </span>
                {item.artifactUrl && (
                  <a
                    href={item.artifactUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-stone-800 hover:text-stone-950 font-medium flex items-center gap-1 text-[11px]"
                  >
                    Visualizar <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
