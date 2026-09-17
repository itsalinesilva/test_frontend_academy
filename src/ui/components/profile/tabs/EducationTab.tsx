import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { Award, Calendar } from 'lucide-react';

interface EducationTabProps {
  profile: UnifiedProfileRecord;
}

export const EducationTab: React.FC<EducationTabProps> = ({ profile }) => {
  const educationList = profile.educationList || [];

  return (
    <div id="profile-education-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">
          Formação Acadêmica & Titulações de Conservatório
        </h2>
        <p className="text-xs text-stone-600">
          Graus formais, pesquisas de pós-graduação, orientações teóricas e distinções acadêmicas
        </p>
      </div>

      <div className="space-y-4">
        {educationList.map((edu) => (
          <Card key={edu.id} variant="default" padding="lg">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif font-bold text-sm text-stone-900">{edu.degree}</h3>
                <span className="text-xs font-medium text-stone-700 block mt-0.5">
                  {edu.institution}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {edu.startYear} — {edu.endYear || 'Presente'}
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="text-stone-700">
                <span className="font-semibold text-stone-900">Tema de Investigação: </span>
                {edu.fieldOfStudy}
              </div>

              {edu.advisor && (
                <div className="text-stone-600">
                  <span className="font-semibold text-stone-800">Orientação: </span>
                  {edu.advisor}
                </div>
              )}

              {edu.honors && (
                <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 mt-2 font-medium">
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>{edu.honors}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
