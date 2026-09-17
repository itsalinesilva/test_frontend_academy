import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { Building, MapPin, Calendar } from 'lucide-react';

interface ExperienceTabProps {
  profile: UnifiedProfileRecord;
}

export const ExperienceTab: React.FC<ExperienceTabProps> = ({ profile }) => {
  const experiences = profile.experiences || [];

  return (
    <div id="profile-experience-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">
          Experiência Profissional & Docência
        </h2>
        <p className="text-xs text-stone-600">
          Trajetória em cátedras acadêmicas, orquestras de concerto, festivais e grupos de câmara
        </p>
      </div>

      <div className="space-y-4">
        {experiences.map((exp) => (
          <Card key={exp.id} variant="default" padding="lg" className="border-stone-200">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-sm text-stone-900">{exp.role}</h3>
                  {exp.isCurrent && (
                    <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-medium">
                      Atual
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-600 mt-1">
                  <span className="flex items-center gap-1 font-medium text-stone-800">
                    <Building className="w-3.5 h-3.5 text-stone-500" />
                    {exp.organization}
                  </span>
                  {exp.location && (
                    <span className="flex items-center gap-1 text-stone-500">
                      • <MapPin className="w-3.5 h-3.5" />
                      {exp.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {exp.startDate} — {exp.endDate || 'Presente'}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed mt-3">
              {exp.description}
            </p>

            {exp.skills && exp.skills.length > 0 && (
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-stone-500">Competências:</span>
                {exp.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
