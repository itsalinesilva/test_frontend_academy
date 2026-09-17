import React from 'react';
import { UnifiedProfileRecord } from '../../../../domain/profile';
import { Card } from '../../base/Card';
import { Button } from '../../base/Button';
import {
  GraduationCap,
  Flame,
  Music,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ProfileHomeTabProps {
  profile: UnifiedProfileRecord;
  onNavigateTab: (tabKey: any) => void;
  onConnectToggle?: () => void;
  isConnected?: boolean;
}

export const ProfileHomeTab: React.FC<ProfileHomeTabProps> = ({
  profile,
  onNavigateTab,
}) => {
  const latestRecording = profile.recordingsList && profile.recordingsList.length > 0
    ? profile.recordingsList[0]
    : null;

  const activeProjects = (profile.projectsList || []).slice(0, 2);

  return (
    <div id="profile-home-tab" className="space-y-8">
      {/* Dimension Matrix: 6 Dimensions of the Musician */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Dimensões da Trajetória Musical
            </h2>
            <p className="text-xs text-stone-600">
              Visão integrada sem fragmentar o artista em perfis incompatíveis
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-stone-100 text-stone-700 font-mono border border-stone-200">
            6 Lentes Ativas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Academic Dimension */}
          <Card
            id="dimension-card-academic"
            variant="default"
            padding="md"
            className="hover:border-stone-400 transition-colors cursor-pointer group"
            onClick={() => onNavigateTab('learning_history')}
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-stone-500 group-hover:text-stone-900 transition-colors flex items-center gap-1">
                Explorar <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="mt-3">
              <h3 className="font-serif font-bold text-stone-900 text-sm">Acadêmico</h3>
              <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                Cursos teóricos, programas de conservatório e histórico de estudos orientados.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
              <span>{profile.academic?.enrolledCourses?.length || 0} cursos</span>
              <span className="font-mono">{profile.academic?.totalStudyHours || 0}h de estudo</span>
            </div>
          </Card>

          {/* Practice Dimension */}
          <Card
            id="dimension-card-practice"
            variant="default"
            padding="md"
            className="hover:border-stone-400 transition-colors cursor-pointer group"
            onClick={() => onNavigateTab('practice')}
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-stone-500 group-hover:text-stone-900 transition-colors flex items-center gap-1">
                Rotina <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="mt-3">
              <h3 className="font-serif font-bold text-stone-900 text-sm">Prática & Técnica</h3>
              <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                Metrônomo, afinação, repertório polido e consistência diária de instrumento.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                🔥 {profile.practice?.currentStreakDays || 0} dias seguidos
              </span>
              <span>{profile.practice?.totalPracticeSessions || 0} sessões</span>
            </div>
          </Card>

          {/* Musician Dimension */}
          <Card
            id="dimension-card-musician"
            variant="default"
            padding="md"
            className="hover:border-stone-400 transition-colors cursor-pointer group"
            onClick={() => onNavigateTab('recordings')}
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-300">
                <Music className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-stone-500 group-hover:text-stone-900 transition-colors flex items-center gap-1">
                Dossiê <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="mt-3">
              <h3 className="font-serif font-bold text-stone-900 text-sm">Músico & Produções</h3>
              <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                Gravações acústicas, partituras publicadas e projetos artísticos de concerto.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
              <span>{profile.recordingsList?.length || 0} gravações</span>
              <span>{profile.scoresList?.length || 0} partituras</span>
            </div>
          </Card>

          {/* Professor Dimension */}
          <Card
            id="dimension-card-professor"
            variant="default"
            padding="md"
            className="hover:border-stone-400 transition-colors cursor-pointer group"
            onClick={() => onNavigateTab('rooms')}
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-800 flex items-center justify-center border border-sky-200">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-stone-500 group-hover:text-stone-900 transition-colors flex items-center gap-1">
                Cátedra <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="mt-3">
              <h3 className="font-serif font-bold text-stone-900 text-sm">Professor & Salas</h3>
              <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                Salas virtuais criadas, orientação de alunos e masterclasses ministradas.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
              <span>{profile.rooms?.teacherProfile?.enrolledStudentsCount || 84} alunos orientados</span>
              <span className="text-sky-700 font-medium">Cátedra Docente</span>
            </div>
          </Card>

          {/* Community Dimension */}
          <Card
            id="dimension-card-community"
            variant="default"
            padding="md"
            className="hover:border-stone-400 transition-colors cursor-pointer group"
            onClick={() => onNavigateTab('community')}
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center border border-indigo-200">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-stone-500 group-hover:text-stone-900 transition-colors flex items-center gap-1">
                Rede <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="mt-3">
              <h3 className="font-serif font-bold text-stone-900 text-sm">Comunidade & Fóruns</h3>
              <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                Publicações acadêmicas, respostas em fóruns e rede de conexões sem DM.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
              <span>{profile.community?.connectionsCount || 4} conexões</span>
              <span>{profile.community?.posts?.length || 2} artigos</span>
            </div>
          </Card>

          {/* Evidence Dimension */}
          <Card
            id="dimension-card-evidence"
            variant="default"
            padding="md"
            className="hover:border-stone-400 transition-colors cursor-pointer group"
            onClick={() => onNavigateTab('credentials')}
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-300">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-stone-500 group-hover:text-stone-900 transition-colors flex items-center gap-1">
                Validação <ArrowRight className="w-3 h-3" />
              </span>
            </div>
            <div className="mt-3">
              <h3 className="font-serif font-bold text-stone-900 text-sm">Evidências & Credenciais</h3>
              <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                Certificados com assinatura SHA-256, selos de mundos e microcredenciais.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
              <span>{profile.evidences?.length || 0} artefatos</span>
              <span className="text-emerald-700 font-mono text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> SHA-256
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Featured Musician Audio Preview */}
      {latestRecording && (
        <Card id="home-featured-recording" variant="default" padding="lg" className="border-stone-300 bg-stone-50/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                Dossiê de Gravação em Destaque
              </span>
              <h3 className="font-serif font-bold text-base text-stone-900 mt-0.5">
                {latestRecording.title}
              </h3>
              <p className="text-xs text-stone-600">
                {latestRecording.workReference} • {latestRecording.composer}
              </p>
            </div>
            <Button
              id="home-btn-view-all-recordings"
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('recordings')}
              className="self-start sm:self-auto text-xs"
            >
              Ver Todas as Gravações
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-white rounded border border-stone-200">
              <span className="text-stone-500 block text-[11px]">Instrumento Empregado</span>
              <span className="font-medium text-stone-800">{latestRecording.instrumentUsed}</span>
            </div>
            <div className="p-3 bg-white rounded border border-stone-200">
              <span className="text-stone-500 block text-[11px]">Espaço Acústico</span>
              <span className="font-medium text-stone-800">{latestRecording.acousticSpace}</span>
            </div>
            <div className="p-3 bg-white rounded border border-stone-200">
              <span className="text-stone-500 block text-[11px]">Duração & Registro</span>
              <span className="font-medium text-stone-800">
                {latestRecording.duration} • Gravado em {latestRecording.recordingDate}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Projects and Trajectory Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Research & Artistic Projects */}
        <Card id="home-active-projects" variant="default" padding="md">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <h3 className="font-serif font-bold text-sm text-stone-900">
              Projetos de Investigação & Recitais
            </h3>
            <button
              onClick={() => onNavigateTab('projects')}
              className="text-xs text-stone-600 hover:text-stone-900 font-medium"
            >
              Ver Todos ({profile.projectsList?.length || 0})
            </button>
          </div>
          <div className="divide-y divide-stone-100 mt-2">
            {activeProjects.map((prj) => (
              <div key={prj.id} className="py-3 first:pt-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-xs text-stone-900">{prj.title}</h4>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize whitespace-nowrap ${
                      prj.status === 'em_andamento'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {prj.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 line-clamp-2">{prj.description}</p>
                <div className="mt-2 text-[11px] text-stone-500 flex items-center justify-between">
                  <span>Papel: {prj.role}</span>
                  <span>{prj.startDate} - {prj.endDate || 'Em andamento'}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Credentials & Integrity Digest */}
        <Card id="home-credentials-digest" variant="default" padding="md">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <h3 className="font-serif font-bold text-sm text-stone-900">
              Credenciais & Validação Criptográfica
            </h3>
            <button
              onClick={() => onNavigateTab('credentials')}
              className="text-xs text-stone-600 hover:text-stone-900 font-medium"
            >
              Auditar ({profile.evidences?.length || 0})
            </button>
          </div>

          <div className="mt-3 space-y-3">
            <div className="p-3 bg-stone-50 rounded border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-stone-900">
                  Doutorado em Práticas Interpretativas & Musicologia
                </span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                  Verificado
                </span>
              </div>
              <p className="text-[11px] text-stone-600 mt-1">
                Universidade de São Paulo (USP) • Royal Academy of Music
              </p>
              <div className="mt-2 pt-2 border-t border-stone-200 text-[10px] font-mono text-stone-500 truncate">
                Hash: 8f4e2a1b9c7d3e5f6a8b0c2d4e6f8a0b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded border border-stone-200">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-stone-900">
                  Outorga de Cátedra Docente em Polifonia
                </span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                  Oficial
                </span>
              </div>
              <p className="text-[11px] text-stone-600 mt-1">
                Academia Musical Digital • Conselho Docente
              </p>
              <div className="mt-2 pt-2 border-t border-stone-200 text-[10px] font-mono text-stone-500 truncate">
                Hash: c4b3a2d1e0f9876543210fedcba9876543210abcdef0123456789abcdef01234
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
