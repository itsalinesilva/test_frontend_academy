import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { Calendar, Users, ExternalLink } from 'lucide-react';

interface ProjectsTabProps {
  profile: UnifiedProfileRecord;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({ profile }) => {
  const projects = profile.projectsList || [];

  return (
    <div id="profile-projects-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">
          Projetos de Investigação, Gravação & Edição Musical
        </h2>
        <p className="text-xs text-stone-600">
          Iniciativas artísticas de longo prazo, resgate de manuscritos e ciclos integrais de concerto
        </p>
      </div>

      <div className="space-y-4">
        {projects.map((prj) => (
          <Card key={prj.id} variant="default" padding="lg">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-sm text-stone-900">{prj.title}</h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize font-medium ${
                      prj.status === 'em_andamento'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}
                  >
                    {prj.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">{prj.subtitle}</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {prj.startDate} — {prj.endDate || 'Em andamento'}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed mt-3">
              {prj.description}
            </p>

            <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-stone-700">
                  <span className="font-semibold text-stone-900">Papel: </span>
                  {prj.role}
                </div>
                {prj.collaborators && prj.collaborators.length > 0 && (
                  <div className="text-stone-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>Colaboradores: {prj.collaborators.join(', ')}</span>
                  </div>
                )}
              </div>

              {prj.externalLink && (
                <a
                  href={prj.externalLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-stone-800 hover:text-stone-950 font-medium text-xs self-start sm:self-auto"
                >
                  Página do Projeto <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
