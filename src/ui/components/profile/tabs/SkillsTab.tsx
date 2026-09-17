import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { ShieldCheck } from 'lucide-react';

interface SkillsTabProps {
  profile?: UnifiedProfileRecord;
}

export const SkillsTab: React.FC<SkillsTabProps> = () => {
  const skillCategories = [
    {
      category: 'Contraponto & Polifonia',
      skills: [
        { name: 'Contraponto a 4 Vozes (Estilo Bachiano)', level: 10, accuracy: 98, status: 'Mestre' },
        { name: 'Fuga com Sujeito Duplo & Invertível', level: 9, accuracy: 95, status: 'Avançado' },
        { name: 'Cânone Enigmático & Retrógrado', level: 9, accuracy: 94, status: 'Avançado' },
        { name: 'Análise de Motivos & Estreitos (Stretto)', level: 10, accuracy: 99, status: 'Mestre' },
      ],
    },
    {
      category: 'Teclado Histórico & Performance',
      skills: [
        { name: 'Realização de Baixo Cifrado à Primeira Vista', level: 9, accuracy: 96, status: 'Avançado' },
        { name: 'Ornamentação Estilo Francês (Agréments)', level: 10, accuracy: 97, status: 'Mestre' },
        { name: 'Articulação e Digitação Histórica', level: 9, accuracy: 93, status: 'Avançado' },
        { name: 'Afinação em Temperamentos Valotti e Meio-Tom', level: 9, accuracy: 95, status: 'Avançado' },
      ],
    },
    {
      category: 'Percepção, Ritmo & Leitura',
      skills: [
        { name: 'Polifonia Auditiva (Discriminação de 4 Vozes)', level: 10, accuracy: 99, status: 'Mestre' },
        { name: 'Leitura em Claves Antigas (Dó 1ª, 3ª, 4ª)', level: 9, accuracy: 94, status: 'Avançado' },
        { name: 'Precisão Rítmica com Metrônomo Subdividido', level: 9, accuracy: 96, status: 'Avançado' },
      ],
    },
  ];

  return (
    <div id="profile-skills-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">
          Árvore de Competências Musicais & Maestria Prática
        </h2>
        <p className="text-xs text-stone-600">
          Avaliação contínua com base em exercícios executados, acurácia analítica e validação docente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {skillCategories.map((cat, idx) => (
          <Card key={idx} variant="default" padding="md" className="space-y-4">
            <h3 className="font-serif font-bold text-sm text-stone-900 pb-2 border-b border-stone-100 flex items-center justify-between">
              <span>{cat.category}</span>
              <span className="text-[11px] font-mono text-stone-500 font-normal">
                {cat.skills.length} itens
              </span>
            </h3>

            <div className="space-y-4">
              {cat.skills.map((s, sIdx) => (
                <div key={sIdx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-800">{s.name}</span>
                    <span className="font-mono text-stone-600">{s.accuracy}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-stone-800 rounded-full transition-all duration-300"
                      style={{ width: `${s.accuracy}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-500">
                    <span className="flex items-center gap-1 text-emerald-800">
                      <ShieldCheck className="w-3 h-3" /> Nível {s.level}/10 • {s.status}
                    </span>
                    <span>Auditado</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
