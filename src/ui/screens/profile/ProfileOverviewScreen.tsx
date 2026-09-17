import React, { useState, useEffect } from 'react';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/base/Card';
import { Button } from '../../components/base/Button';
import {
  UnifiedProfileRecord,
  ProfileSectionKey,
  VisibilityLevel,
} from '../../../domain/profile';
import { profileService } from '../../../services/application/profile.service';
import { authService } from '../../../services/application/auth.service';
import { ProfileSectionsModal } from '../../components/profile/ProfileSectionsModal';
import { PublishPortfolioModal } from '../../components/profile/PublishPortfolioModal';
import { EditHeaderModal } from '../../components/profile/EditHeaderModal';
import { TeacherRoomModal } from '../../components/profile/TeacherRoomModal';

// 19 Tab Components
import { ProfileHomeTab } from '../../components/profile/tabs/ProfileHomeTab';
import { AboutTab } from '../../components/profile/tabs/AboutTab';
import { ActivityTab } from '../../components/profile/tabs/ActivityTab';
import { ExperienceTab } from '../../components/profile/tabs/ExperienceTab';
import { SkillsTab } from '../../components/profile/tabs/SkillsTab';
import { EducationTab } from '../../components/profile/tabs/EducationTab';
import { AchievementsTab } from '../../components/profile/tabs/AchievementsTab';
import { CredentialsTab } from '../../components/profile/tabs/CredentialsTab';
import { PortfolioTab } from '../../components/profile/tabs/PortfolioTab';
import { ProjectsTab } from '../../components/profile/tabs/ProjectsTab';
import { RecordingsTab } from '../../components/profile/tabs/RecordingsTab';
import { ScoresTab } from '../../components/profile/tabs/ScoresTab';
import { PracticeTab } from '../../components/profile/tabs/PracticeTab';
import { LearningHistoryTab } from '../../components/profile/tabs/LearningHistoryTab';
import { PassportsTab } from '../../components/profile/tabs/PassportsTab';
import { BadgesTab } from '../../components/profile/tabs/BadgesTab';
import { CommunityTab } from '../../components/profile/tabs/CommunityTab';
import { RoomsTab } from '../../components/profile/tabs/RoomsTab';
import { EventsTab } from '../../components/profile/tabs/EventsTab';

import {
  GraduationCap,
  Music,
  FolderGit2,
  Users,
  Award,
  Layers,
  Edit3,
  SlidersHorizontal,
  Eye,
  ExternalLink,
  Plus,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Briefcase,
  BookOpen,
  Trophy,
  Disc,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
  Compass,
  UserCheck,
  UserPlus,
} from 'lucide-react';

export type ModernProfileTabKey =
  | 'home'
  | 'about'
  | 'activity'
  | 'experience'
  | 'skills'
  | 'education'
  | 'achievements'
  | 'credentials'
  | 'portfolio'
  | 'projects'
  | 'recordings'
  | 'scores'
  | 'practice'
  | 'learning_history'
  | 'passports'
  | 'badges'
  | 'community'
  | 'rooms'
  | 'events';

interface TabItemDef {
  key: ModernProfileTabKey;
  label: string;
  icon: React.FC<{ className?: string }>;
  cluster: 'geral' | 'carreira' | 'producoes' | 'pratica' | 'comunidade';
  sectionKey?: ProfileSectionKey;
}

const TAB_DEFINITIONS: TabItemDef[] = [
  { key: 'home', label: 'Início', icon: Layers, cluster: 'geral' },
  { key: 'about', label: 'Sobre & Bio', icon: BookOpen, cluster: 'geral', sectionKey: 'about' },
  { key: 'activity', label: 'Atividade', icon: Clock, cluster: 'geral', sectionKey: 'activity' },
  { key: 'experience', label: 'Experiência', icon: Briefcase, cluster: 'carreira', sectionKey: 'experience' },
  { key: 'skills', label: 'Habilidades', icon: Sparkles, cluster: 'pratica', sectionKey: 'skills' },
  { key: 'education', label: 'Formação', icon: GraduationCap, cluster: 'carreira', sectionKey: 'education' },
  { key: 'achievements', label: 'Conquistas', icon: Trophy, cluster: 'carreira', sectionKey: 'achievements' },
  { key: 'credentials', label: 'Credenciais', icon: Award, cluster: 'carreira', sectionKey: 'credentials' },
  { key: 'portfolio', label: 'Portfólio', icon: FolderGit2, cluster: 'producoes', sectionKey: 'portfolio' },
  { key: 'projects', label: 'Projetos', icon: FileText, cluster: 'producoes', sectionKey: 'projects' },
  { key: 'recordings', label: 'Gravações', icon: Disc, cluster: 'producoes', sectionKey: 'recordings' },
  { key: 'scores', label: 'Partituras', icon: Music, cluster: 'producoes', sectionKey: 'scores' },
  { key: 'practice', label: 'Prática & Streak', icon: Flame, cluster: 'pratica', sectionKey: 'practice' },
  { key: 'learning_history', label: 'Histórico', icon: BookOpen, cluster: 'pratica', sectionKey: 'learning_history' },
  { key: 'passports', label: 'Passaportes', icon: Compass, cluster: 'pratica', sectionKey: 'passports' },
  { key: 'badges', label: 'Badges', icon: ShieldCheck, cluster: 'pratica', sectionKey: 'badges' },
  { key: 'community', label: 'Comunidade', icon: Users, cluster: 'comunidade', sectionKey: 'community' },
  { key: 'rooms', label: 'Salas & Cátedra', icon: BookOpen, cluster: 'comunidade', sectionKey: 'rooms' },
  { key: 'events', label: 'Eventos', icon: Calendar, cluster: 'comunidade', sectionKey: 'events' },
];

export const ProfileOverviewScreen: React.FC = () => {
  const [profile, setProfile] = useState<UnifiedProfileRecord | null>(null);
  const [activeTab, setActiveTab] = useState<ModernProfileTabKey>('home');
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [isPreviewPublic, setIsPreviewPublic] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // Modals state
  const [showSectionsModal, setShowSectionsModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [showTeacherRoomModal, setShowTeacherRoomModal] = useState(false);

  // Load profile data
  const loadProfile = async (asPublicPreview = false) => {
    try {
      const session = await authService.getActiveSession();
      // Sem sessao nao ha progresso a carregar nem a gravar: o fallback
      // anterior misturava dados de visitantes anonimos com os da
      // fundadora (CLAUDE_AUDIT.md T-05).
      if (!session) return;
      const currentUserId = session.user.id;

      if (asPublicPreview) {
        const publicData = await profileService.getPublicProfileProjection(currentUserId);
        if (publicData) {
          setProfile(publicData);
        } else {
          setFeedback('Este perfil está totalmente configurado como Privado no servidor.');
        }
      } else {
        const fullData = await profileService.getUnifiedProfile(currentUserId);
        setProfile(fullData);
      }
    } catch (err: any) {
      console.error('Erro ao carregar perfil:', err);
    }
  };

  useEffect(() => {
    loadProfile(isPreviewPublic);
  }, [isPreviewPublic]);

  const togglePublicPreview = () => {
    const nextState = !isPreviewPublic;
    setIsPreviewPublic(nextState);
    if (nextState) {
      setFeedback('Modo Preview Público Ativo: Exibindo projeção sanitizada pelo servidor sem campos privados.');
    } else {
      setFeedback('Modo Proprietário Ativo: Ferramentas de edição, reordenação e visibilidade habilitadas.');
    }
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleToggleConnection = async () => {
    if (!profile) return;
    try {
      const res = await profileService.toggleConnection('usr_founder_1');
      setIsConnected(res.connected);
      setFeedback(
        res.connected
          ? 'Conexão estabelecida com sucesso! Agora você acompanha as atualizações e produções deste perfil.'
          : 'Conexão desfeita.'
      );
      setTimeout(() => setFeedback(null), 4000);
      await loadProfile(isPreviewPublic);
    } catch (err) {
      console.error('Erro ao alternar conexão:', err);
    }
  };

  // Helper to check section visibility config
  const getSectionVisibility = (key?: ProfileSectionKey): VisibilityLevel => {
    if (!profile || !key) return 'public';
    const config = profile.sectionsConfig.find((s) => s.key === key);
    return config ? config.visibility : 'public';
  };

  const getVisibilityBadge = (level: VisibilityLevel) => {
    switch (level) {
      case 'public':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            👁️ Público
          </span>
        );
      case 'connections':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            🔒 Apenas Conexões
          </span>
        );
      case 'room_members':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
            🔑 Membros de Salas
          </span>
        );
      case 'private':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200 text-stone-800 border border-stone-300">
            🚫 Privado
          </span>
        );
      default:
        return null;
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-stone-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-600 font-serif">Carregando perfil profissional unificado...</p>
        </div>
      </div>
    );
  }

  // Filter tabs by cluster if needed
  const visibleTabs = selectedCluster === 'all'
    ? TAB_DEFINITIONS
    : TAB_DEFINITIONS.filter((t) => t.cluster === selectedCluster);

  const currentTabDef = TAB_DEFINITIONS.find((t) => t.key === activeTab) || TAB_DEFINITIONS[0];
  const currentSectionVisibility = getSectionVisibility(currentTabDef.sectionKey);

  return (
    <ScreenContainer
      id="profile-overview"
      title="Perfil Profissional & Dossiê Artístico"
      subtitle="Estrutura completa e unificada: Dimensões Acadêmica, Prática, Músico, Professor, Comunidade e Evidências."
      badgeLabel={profile.primaryRole}
      badgeVariant="brand"
      primaryAction={
        !isPreviewPublic
          ? {
              label: 'Publicar no Portfólio',
              icon: Plus,
              onClick: () => setShowPublishModal(true),
            }
          : undefined
      }
      secondaryActions={[
        {
          label: isPreviewPublic ? 'Retornar ao Modo Edição' : 'Visualizar Preview Público',
          icon: isPreviewPublic ? Edit3 : Eye,
          onClick: togglePublicPreview,
        },
        ...(!isPreviewPublic
          ? [
              {
                label: 'Privacidade das Seções',
                icon: SlidersHorizontal,
                onClick: () => setShowSectionsModal(true),
              },
              {
                label: 'Editar Apresentação',
                icon: Edit3,
                onClick: () => setShowHeaderModal(true),
              },
            ]
          : []),
      ]}
    >
      <div className="space-y-6">
        {/* Live Feedback Toast */}
        {feedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{feedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-stone-400 hover:text-stone-700 text-xs"
            >
              Fechar
            </button>
          </div>
        )}

        {/* FULL PROFESSIONAL HEADER */}
        <Card id="profile-main-header" variant="default" padding="lg" className="border-stone-300 bg-white">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Avatar & Core Profile Data */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative shrink-0">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-24 h-24 rounded-full object-cover border-2 border-stone-800 shadow-xs"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center font-serif text-3xl font-bold border-2 border-stone-200 shadow-xs">
                    {profile.displayName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                )}
                <div
                  className="absolute -bottom-1 -right-1 p-1 bg-stone-900 text-white rounded-full"
                  title="Identidade Verificada & Autenticada"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              <div className="space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-serif font-bold text-xl sm:text-2xl text-stone-900">
                    {profile.displayName}
                  </h1>
                  <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-bold">
                    {profile.primaryRole}
                  </span>
                  <span className="text-[10px] font-mono capitalize bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                    Nível {profile.experienceLevel}
                  </span>
                </div>

                {/* Title & Headline */}
                <p className="text-sm font-semibold text-stone-800">{profile.title}</p>
                <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">{profile.headline}</p>

                {/* Location and Status */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs">
                  {profile.location && (
                    <span className="flex items-center gap-1 text-stone-600">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      {profile.location}
                    </span>
                  )}
                  {profile.currentStatus && (
                    <span className="font-medium text-stone-800 bg-stone-50 px-2.5 py-1 rounded border border-stone-200 text-[11px]">
                      {profile.currentStatus}
                    </span>
                  )}
                </div>

                {/* Instruments Chips */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-stone-500 mr-1">Instrumentos:</span>
                  {profile.instruments.map((inst, i) => (
                    <span
                      key={inst}
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        i === 0
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 border border-stone-300 text-stone-800'
                      }`}
                    >
                      {inst}
                    </span>
                  ))}
                </div>

                {/* Specialties Chips */}
                {profile.specialties && profile.specialties.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-stone-500 mr-1">Especialidades:</span>
                    {profile.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions & Official Links */}
            <div className="flex flex-col items-center sm:items-end gap-3 shrink-0 pt-2 lg:pt-0">
              {/* Connection & Edit Buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="header-btn-toggle-connection"
                  onClick={handleToggleConnection}
                  className={`text-xs px-3.5 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 shadow-2xs ${
                    isConnected
                      ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  {isConnected ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Conectado ({profile.community?.connectionsCount || 4})
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Conectar
                    </>
                  )}
                </button>

                {!isPreviewPublic && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHeaderModal(true)}
                    className="text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Editar
                  </Button>
                )}
              </div>

              {/* Official Links */}
              <div className="text-right">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                  Links & Publicações Oficiais
                </span>
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-end max-w-xs">
                  {profile.officialLinks && profile.officialLinks.length > 0 ? (
                    profile.officialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-50 border border-stone-200 text-[11px] font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-stone-400" />
                      </a>
                    ))
                  ) : (
                    <span className="text-[11px] text-stone-400 italic">Nenhum link cadastrado</span>
                  )}
                </div>
              </div>

              {/* Capabilities Badges */}
              {profile.capabilities && profile.capabilities.length > 0 && (
                <div className="pt-2 text-right">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    Capabilities Adquiridas
                  </span>
                  <div className="flex flex-wrap gap-1 justify-center sm:justify-end max-w-xs">
                    {profile.capabilities.map((cap, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-900 border border-sky-200 font-mono"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 19 SCREENS NAVIGATION BAR */}
        <div id="profile-screens-nav" className="space-y-3">
          {/* Quick Clusters Filter */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
              {[
                { id: 'all', label: 'Todas as 19 Seções' },
                { id: 'geral', label: 'Visão Geral & Bio' },
                { id: 'carreira', label: 'Carreira & Titulações' },
                { id: 'producoes', label: 'Músico & Produções' },
                { id: 'pratica', label: 'Prática & Maestria' },
                { id: 'comunidade', label: 'Comunidade & Cátedras' },
              ].map((cl) => (
                <button
                  key={cl.id}
                  onClick={() => setSelectedCluster(cl.id)}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                    selectedCluster === cl.id
                      ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {cl.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-stone-500 font-mono">
                {visibleTabs.length} seções disponíveis
              </span>
            </div>
          </div>

          {/* Horizontal Scroller for the 19 Tabs */}
          <div className="flex border-b border-stone-200 gap-1 overflow-x-auto pb-0.5 text-xs">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  id={`profile-nav-tab-${tab.key}`}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-2.5 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'border-stone-900 text-stone-900 font-bold bg-stone-50/50'
                      : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION PRIVACY HEADER */}
        <div className="flex items-center justify-between px-1 py-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800">
              Visualizando: {currentTabDef.label}
            </span>
            {currentTabDef.sectionKey && (
              <div className="flex items-center gap-1">
                <span className="text-stone-400">•</span>
                <span className="text-stone-500">Privacidade:</span>
                {getVisibilityBadge(currentSectionVisibility)}
              </div>
            )}
          </div>

          {!isPreviewPublic && (
            <button
              onClick={() => setShowSectionsModal(true)}
              className="text-[11px] text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3" /> Gerenciar Visibilidade
            </button>
          )}
        </div>

        {/* RENDER CURRENT TAB */}
        <div id="profile-active-tab-content">
          {activeTab === 'home' && (
            <ProfileHomeTab
              profile={profile}
              onNavigateTab={(tabKey) => setActiveTab(tabKey)}
              onConnectToggle={handleToggleConnection}
              isConnected={isConnected}
            />
          )}

          {activeTab === 'about' && <AboutTab profile={profile} />}

          {activeTab === 'activity' && <ActivityTab profile={profile} />}

          {activeTab === 'experience' && <ExperienceTab profile={profile} />}

          {activeTab === 'skills' && <SkillsTab profile={profile} />}

          {activeTab === 'education' && <EducationTab profile={profile} />}

          {activeTab === 'achievements' && <AchievementsTab profile={profile} />}

          {activeTab === 'credentials' && <CredentialsTab profile={profile} />}

          {activeTab === 'portfolio' && <PortfolioTab profile={profile} />}

          {activeTab === 'projects' && <ProjectsTab profile={profile} />}

          {activeTab === 'recordings' && <RecordingsTab profile={profile} />}

          {activeTab === 'scores' && <ScoresTab profile={profile} />}

          {activeTab === 'practice' && <PracticeTab profile={profile} />}

          {activeTab === 'learning_history' && <LearningHistoryTab profile={profile} />}

          {activeTab === 'passports' && <PassportsTab profile={profile} />}

          {activeTab === 'badges' && <BadgesTab profile={profile} />}

          {activeTab === 'community' && (
            <CommunityTab
              profile={profile}
              onToggleConnection={handleToggleConnection}
              connections={profile.connectionsList}
            />
          )}

          {activeTab === 'rooms' && <RoomsTab profile={profile} />}

          {activeTab === 'events' && <EventsTab profile={profile} />}
        </div>
      </div>

      {/* MODALS */}
      {showSectionsModal && (
        <ProfileSectionsModal
          sections={profile.sectionsConfig}
          onSave={async (updated) => {
            await profileService.updateSectionsConfig(updated);
            await loadProfile(isPreviewPublic);
            setFeedback('Configurações de privacidade por seção atualizadas no servidor!');
            setTimeout(() => setFeedback(null), 3000);
          }}
          onClose={() => setShowSectionsModal(false)}
        />
      )}

      {showPublishModal && (
        <PublishPortfolioModal
          availableEvidences={profile.evidences}
          onPublish={async (item) => {
            await profileService.publishPortfolioItem(item);
            await loadProfile(false);
            setFeedback('Artefato publicado no portfólio com sucesso!');
            setTimeout(() => setFeedback(null), 3000);
          }}
          onClose={() => setShowPublishModal(false)}
        />
      )}

      {showHeaderModal && (
        <EditHeaderModal
          profile={profile}
          onSave={async (data) => {
            await profileService.updateProfileHeader(data);
            await loadProfile(isPreviewPublic);
            setFeedback('Dados de apresentação e links oficiais atualizados!');
            setTimeout(() => setFeedback(null), 3000);
          }}
          onClose={() => setShowHeaderModal(false)}
        />
      )}

      {showTeacherRoomModal && profile.rooms.teacherProfile && (
        <TeacherRoomModal
          teacherProfile={profile.rooms.teacherProfile}
          onSave={async (data) => {
            await profileService.updateTeacherRoomInfo(data);
            await loadProfile(false);
            setFeedback('Informações da cátedra docente salvas com sucesso!');
            setTimeout(() => setFeedback(null), 3000);
          }}
          onClose={() => setShowTeacherRoomModal(false)}
        />
      )}
    </ScreenContainer>
  );
};
