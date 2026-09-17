import React, { useState } from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import {
  Music,
  FileText,
  MessageSquare,
  Award,
  Video,
  Calendar,
} from 'lucide-react';

interface ActivityTabProps {
  profile?: UnifiedProfileRecord;
}

export const ActivityTab: React.FC<ActivityTabProps> = () => {
  const [filter, setFilter] = useState<'all' | 'recordings' | 'scores' | 'forum' | 'academic'>('all');

  const activities = [
    {
      id: 'act-1',
      category: 'recordings',
      title: 'Gravação em Áudio Adicionada ao Dossiê',
      description: 'J.S. Bach - Prelúdio e Fuga em Dó Menor BWV 847 (Cravo Francês)',
      date: '15 de Abril de 2024',
      badge: 'Áudio Gravado',
      icon: Music,
      iconBg: 'bg-amber-100 text-amber-900',
    },
    {
      id: 'act-2',
      category: 'scores',
      title: 'Edição Crítica de Partitura Publicada',
      description: 'Edição Crítica Analítica: J.S. Bach - Fuga a 4 Vozes em Sol Menor BWV 861 com marcação temática',
      date: '28 de Fevereiro de 2024',
      badge: 'Partitura Registrada',
      icon: FileText,
      iconBg: 'bg-stone-200 text-stone-900',
    },
    {
      id: 'act-3',
      category: 'forum',
      title: 'Ensaio & Resposta Aceita no Fórum Acadêmico',
      description: 'Discussão sobre a realização dos ornamentos no segundo caderno de Couperin com citações de tratados',
      date: '14 de Janeiro de 2024',
      badge: 'Solução Aprovada',
      icon: MessageSquare,
      iconBg: 'bg-indigo-100 text-indigo-900',
    },
    {
      id: 'act-4',
      category: 'academic',
      title: 'Masterclass Ministrada na Sala Virtual',
      description: 'Sessão aberta sobre "Tratamento de Cadências e Notas de Passagem na Fuga Barroca" para 42 alunos',
      date: '10 de Dezembro de 2023',
      badge: 'Docência',
      icon: Video,
      iconBg: 'bg-sky-100 text-sky-900',
    },
    {
      id: 'act-5',
      category: 'academic',
      title: 'Microcredencial Conquistada com Louvor',
      description: 'Mestre em Polifonia Barroca - Análise de 12 Fugas a 4 vozes com acurácia de 98%',
      date: '18 de Novembro de 2023',
      badge: 'Distinção',
      icon: Award,
      iconBg: 'bg-emerald-100 text-emerald-900',
    },
  ];

  const filtered = filter === 'all'
    ? activities
    : activities.filter((a) => a.category === filter);

  return (
    <div id="profile-activity-tab" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-200">
        <div>
          <h2 className="font-serif text-base font-bold text-stone-900">
            Linha do Tempo de Atividades
          </h2>
          <p className="text-xs text-stone-600">
            Registro cronológico das contribuições, gravações, publicações e participações acadêmicas
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              filter === 'all'
                ? 'bg-stone-900 text-white font-medium'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('recordings')}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              filter === 'recordings'
                ? 'bg-stone-900 text-white font-medium'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Gravações
          </button>
          <button
            onClick={() => setFilter('scores')}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              filter === 'scores'
                ? 'bg-stone-900 text-white font-medium'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Partituras
          </button>
          <button
            onClick={() => setFilter('forum')}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              filter === 'forum'
                ? 'bg-stone-900 text-white font-medium'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Fóruns
          </button>
          <button
            onClick={() => setFilter('academic')}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              filter === 'academic'
                ? 'bg-stone-900 text-white font-medium'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Acadêmico
          </button>
        </div>
      </div>

      <div className="relative pl-6 border-l-2 border-stone-200 space-y-6">
        {filtered.map((act) => {
          const Icon = act.icon;
          return (
            <div key={act.id} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-[31px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-xs ${act.iconBg}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              <Card variant="default" padding="md" className="hover:border-stone-400 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-stone-900">{act.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono border border-stone-200">
                      {act.badge}
                    </span>
                    <span className="text-[11px] text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {act.date}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-stone-600 mt-2">{act.description}</p>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
