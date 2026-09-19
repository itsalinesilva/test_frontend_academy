import React from 'react';
import { UnifiedProfileRecord, ProfileEventItem } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { EmptyState } from '../../feedback/EmptyState';
import { Calendar, MapPin, ExternalLink, Mic2 } from 'lucide-react';

interface EventsTabProps {
  profile: UnifiedProfileRecord;
}

/**
 * Eventos do perfil.
 *
 * Esta aba trazia três apresentações escritas no código — um recital de cravo,
 * um simpósio na USP e um concerto no Theatro Municipal —, e as exibia em
 * TODO perfil, inclusive no de quem tinha criado a conta cinco minutos antes.
 * Era a plataforma atribuindo a uma pessoa uma carreira que não é dela.
 *
 * Agora a aba lê `profile.eventsList`. Enquanto o músico não registrar nada,
 * ela diz que não há nada — e é isso que faz o primeiro registro dele
 * significar alguma coisa.
 */
const formatarData = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Já aconteceu ou ainda vai acontecer.
 *
 * A distinção sai da data, não de um campo `status` gravado à mão — que
 * envelhece sozinho e passa a mentir no dia seguinte.
 */
const jaAconteceu = (evento: ProfileEventItem): boolean => {
  const d = new Date(evento.date);
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now();
};

export const EventsTab: React.FC<EventsTabProps> = ({ profile }) => {
  const eventos = [...(profile.eventsList ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div id="profile-events-tab" className="space-y-6">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">
          Eventos, recitais e masterclasses
        </h2>
        <p className="text-xs text-stone-600">
          Recitais públicos, conferências e apresentações camerísticas registrados por este perfil.
        </p>
      </div>

      {eventos.length === 0 ? (
        <EmptyState
          id="profile-events-empty"
          icon={<Mic2 className="w-8 h-8 stroke-1" aria-hidden="true" />}
          title="Nenhuma apresentação registrada"
          description="Recitais, masterclasses e conferências registrados aqui aparecem no perfil público e podem ser citados como evidência de atuação."
        />
      ) : (
        <div className="space-y-4">
          {eventos.map((evt) => {
            const passado = jaAconteceu(evt);
            return (
              <Card key={evt.id} variant="default" padding="lg">
                <div className="flex flex-col gap-2 border-b border-stone-100 pb-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-sm font-bold text-stone-900">{evt.title}</h3>
                      <span
                        className={`rounded px-2 py-0.5 font-mono text-[10px] font-medium ${
                          passado
                            ? 'bg-stone-100 text-stone-700'
                            : 'border border-amber-200 bg-amber-100 text-amber-900'
                        }`}
                      >
                        {passado ? 'Realizado' : 'Programado'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-stone-600">
                      <span className="font-medium text-stone-800">{evt.kind}</span>
                      <span aria-hidden="true">•</span>
                      <span>Papel: {evt.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs text-stone-500">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    <time dateTime={evt.date}>{formatarData(evt.date)}</time>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-stone-700">{evt.description}</p>

                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                    {evt.venue}
                  </span>
                  {evt.referenceUrl && (
                    <a
                      href={evt.referenceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-stone-800"
                    >
                      Programa
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
