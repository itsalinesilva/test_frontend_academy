import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { BookOpen, Video, Sparkles } from 'lucide-react';

interface RoomsTabProps {
  profile: UnifiedProfileRecord;
}

export const RoomsTab: React.FC<RoomsTabProps> = ({ profile }) => {
  const teacherProfile = profile.rooms?.teacherProfile;
  const attendedRooms = profile.rooms?.attendedRooms || [];

  return (
    <div id="profile-rooms-tab" className="space-y-8">
      <div className="pb-3 border-b border-stone-200">
        <h2 className="font-serif text-base font-bold text-stone-900">
          Salas Virtuais, Cátedras & Orientação de Alunos
        </h2>
        <p className="text-xs text-stone-600">
          Espaços colaborativos de masterclasses ao vivo, bancas de análise e aulas síncronas
        </p>
      </div>

      {/* Professor Professorship Spotlight (if applicable) */}
      {teacherProfile && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-800" />
              Cátedra Docente Ativa (Professor)
            </h3>
            <span className="text-[11px] font-mono bg-sky-50 text-sky-900 border border-sky-200 px-2 py-0.5 rounded">
              {teacherProfile.enrolledStudentsCount} Alunos Matriculados
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Masterclasses & Scheduled Auditions */}
            <Card variant="default" padding="md">
              <h4 className="font-serif font-bold text-xs text-stone-900 pb-2 border-b border-stone-200 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-sky-700" />
                Aulas Ao Vivo & Masterclasses Agendadas
              </h4>
              <div className="divide-y divide-stone-100 mt-2">
                {(teacherProfile.upcomingClassesAndEvents || []).map((live) => (
                  <div key={live.id} className="py-2.5 first:pt-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">{live.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-stone-100 rounded text-stone-600">
                        {live.type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 font-mono mt-1 block">
                      {new Date(live.date).toLocaleDateString('pt-BR')} às 19:30
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Guided Projects */}
            <Card variant="default" padding="md">
              <h4 className="font-serif font-bold text-xs text-stone-900 pb-2 border-b border-stone-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Projetos & Obras Orientadas
              </h4>
              <div className="divide-y divide-stone-100 mt-2">
                {(teacherProfile.guidedProjects || []).map((gp) => (
                  <div key={gp.id} className="py-2.5 first:pt-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-stone-900">{gp.title}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded">
                        {gp.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-600 mt-0.5 block">
                      Orientando: {gp.studentName}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Attended Rooms as Participant */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-sm text-stone-900">
          Salas em que Participa como Intérprete / Ouvinte
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {attendedRooms.map((room) => (
            <Card key={room.roomId} variant="default" padding="md">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="font-serif font-bold text-xs text-stone-900">{room.roomName}</span>
                <span className="text-[10px] font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded capitalize">
                  {room.role}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-stone-600">
                <span>{room.lessonsCount} lições • {room.assignmentsSubmitted} tarefas submetidas</span>
                <span className="text-[11px] text-stone-500 font-mono">
                  Prof. {room.teacherName}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
