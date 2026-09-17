import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { Calendar, MapPin } from 'lucide-react';

interface EventsTabProps {
  profile?: UnifiedProfileRecord;
}

export const EventsTab: React.FC<EventsTabProps> = () => {
  const events = [
    {
      id: 'evt-1',
      title: 'Recital Integral do Cravo Bem Temperado (Livro I - Prelúdios & Fugas 1 a 12)',
      type: 'Recital Solo',
      role: 'Cravista Solista',
      date: '18 de Outubro de 2024, 20:00',
      venue: 'Auditório Clara Schumann / Transmissão em Alta Definição',
      status: 'proximo',
      description: 'Execução comentada ao cravo flamengo com temperamento Valotti a 415Hz.',
    },
    {
      id: 'evt-2',
      title: 'Simpósio Ibero-Americano de Práticas Interpretativas do Século XVIII',
      type: 'Conferência Acadêmica',
      role: 'Palestrante Convidada',
      date: '12 de Setembro de 2024, 14:30',
      venue: 'Universidade de São Paulo (USP) - Sala de Música Antiga',
      status: 'proximo',
      description: 'Mesa-redonda sobre "Tratados de Ornamentação e a Retórica das Fugas Bachianas".',
    },
    {
      id: 'evt-3',
      title: 'Concerto de Abertura do Festival de Música Barroca',
      type: 'Concerto Orquestral',
      role: 'Continuísta Convidada',
      date: '20 de Março de 2024, 19:30',
      venue: 'Theatro Municipal / Orquestra Barroca',
      status: 'concluido',
      description: 'Execução de baixo cifrado nos Concertos de Brandenburgo nº 3 e 5 de J.S. Bach.',
    },
  ];

  return (
    <div id="profile-events-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">
          Eventos, Recitais & Masterclasses
        </h2>
        <p className="text-xs text-stone-600">
          Programação de recitais públicos, conferências de musicologia e apresentações camerísticas
        </p>
      </div>

      <div className="space-y-4">
        {events.map((evt) => (
          <Card key={evt.id} variant="default" padding="lg">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-stone-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-sm text-stone-900">{evt.title}</h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize font-medium ${
                      evt.status === 'proximo'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {evt.status === 'proximo' ? 'Em Breve' : 'Realizado'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-600 mt-1">
                  <span className="font-medium text-stone-800">{evt.type}</span>
                  <span>•</span>
                  <span>Papel: {evt.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>{evt.date}</span>
              </div>
            </div>

            <p className="text-xs text-stone-700 mt-3 leading-relaxed">{evt.description}</p>

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {evt.venue}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
