import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { ProfileHeader } from '../../components/data-display/ProfileHeader';
import { SegmentedControl } from '../../components/navigation/SegmentedControl';
import { useRouter } from '../../navigation/router';
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
  SlidersHorizontal,
  ExternalLink,
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
  Calendar,
  Compass,
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
  const { params, navigate } = useRouter();
  // Sem :userId a tela e o proprio perfil; com :userId e o de outra pessoa.
  // Esta unica linha e o que faltava para a premissa "LinkedIn de musicos"
  // deixar de ser estruturalmente vazia (CLAUDE_AUDIT.md P-05).
  const viewedUserId = params.userId;

  const [profile, setProfile] = useState<UnifiedProfileRecord | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ModernProfileTabKey>('home');
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [isPreviewPublic, setIsPreviewPublic] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  // Nao se nasce conectado. O valor inicial `true` afirmava um vinculo que
  // ninguem tinha criado; agora sai da lista real de conexoes do visitante.
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const isOwnProfile = !viewedUserId || viewedUserId === sessionUserId;

  // Modals state
  const [showSectionsModal, setShowSectionsModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [showTeacherRoomModal, setShowTeacherRoomModal] = useState(false);

  // Load profile data
  const loadProfile = async (asPublicPreview = false) => {
    try {
      setErro(null);
      const session = await authService.getActiveSession();
      setSessionUserId(session?.user.id ?? null);

      // O alvo e o usuario da URL; sem URL, o da sessao. Um visitante anonimo
      // em /profile nao tem alvo — e isso e um estado, nao um erro.
      const targetUserId = viewedUserId ?? session?.user.id;
      if (!targetUserId) {
        setProfile(null);
        return;
      }

      const ehProprio = targetUserId === session?.user.id;

      if (asPublicPreview && ehProprio) {
        const publicData = await profileService.getPublicProfileProjection(targetUserId);
        if (publicData) {
          setProfile(publicData);
        } else {
          setFeedback('Este perfil está configurado como privado.');
        }
      } else {
        // Para quem nao e o dono o proprio servico ja devolve a projecao
        // publica — a tela nao precisa (nem consegue) pedir o registro cru.
        const dados = await profileService.getUnifiedProfile(targetUserId);
        setProfile(dados);
      }

      // Estado de conexao real: vem da MINHA lista, procurando o perfil visto.
      if (!ehProprio && session) {
        const meu = await profileService.getUnifiedProfile(session.user.id);
        setIsConnected(
          (meu.connectionsList ?? []).some((c) => c.targetUserId === targetUserId)
        );
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setErro(err instanceof Error ? err.message : 'Não foi possível carregar este perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    // Recarrega ao trocar de modo (proprio/preview) e ao trocar de usuario na
    // URL — /profile/a -> /profile/b remonta o conteudo, nao so a rota.
    loadProfile(isPreviewPublic);
  }, [isPreviewPublic, viewedUserId]);

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
      // Conecta com QUEM ESTA SENDO VISTO. O id fixo 'usr_founder_1' fazia
      // toda e qualquer conexao apontar para a fundadora (CLAUDE_AUDIT.md P-06).
      if (!viewedUserId) return;
      const res = await profileService.toggleConnection(viewedUserId);
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

  // Filtra as secoes pelo agrupador selecionado.
  const visibleTabs =
    selectedCluster === 'all'
      ? TAB_DEFINITIONS
      : TAB_DEFINITIONS.filter((t) => t.cluster === selectedCluster);

  const currentTabDef = TAB_DEFINITIONS.find((t) => t.key === activeTab) || TAB_DEFINITIONS[0];
  const currentSectionVisibility = getSectionVisibility(currentTabDef.sectionKey);

  // Estados de pagina. Ficam num retorno proprio para preservar o
  // estreitamento de tipo de `profile` nas ~400 linhas de JSX abaixo.
  if (isLoading || erro || !profile) {
    return (
      <PageLayout
        id="profile-overview"
        form="detail"
        density="operational"
        asideLabel="Secoes"
        state={isLoading ? 'loading' : erro ? 'error' : 'empty'}
        loadingMessage="Carregando perfil profissional…"
        errorProps={{
          message: erro ?? 'Não foi possível carregar este perfil.',
          onRetry: () => {
            setIsLoading(true);
            loadProfile(isPreviewPublic);
          },
        }}
        emptyProps={{
          title: viewedUserId ? 'Perfil indisponível' : 'Entre para ver seu perfil',
          description: viewedUserId
            ? 'Este perfil não existe ou seu autor o mantém privado.'
            : 'Seu perfil profissional reúne formação, prática, produções e credenciais.',
          actionLabel: viewedUserId ? 'Ver a rede' : 'Entrar',
          onAction: () => navigate(viewedUserId ? '/profile/network' : '/auth/login'),
        }}
      >
        {null}
      </PageLayout>
    );
  }

  return (
    <PageLayout
      id="profile-overview"
      form="detail"
      density="operational"
      asideLabel="Secoes"
      state="content"
    >
      <PageLayout.Hero>
        {/* O cabecalho agora e o componente do design system. Antes eram ~180
            linhas escritas a mao aqui, sem capa e sem distinguir perfil
            proprio de perfil de terceiro. */}
        <ProfileHeader
          id="profile-header"
          name={profile.displayName}
          title={profile.title}
          headline={profile.headline}
          location={profile.location}
          affiliation={profile.currentStatus}
          avatarUrl={profile.avatarUrl}
          totalStudyHours={profile.academic?.totalStudyHours ?? 0}
          coursesCompleted={profile.academic?.certificates?.length ?? 0}
          credentialsCount={profile.evidences?.length ?? 0}
          isOwnProfile={isOwnProfile}
          isConnected={isConnected}
          onConnect={handleToggleConnection}
          onMessage={() => navigate('/community/feed')}
          onEditProfile={() => setShowHeaderModal(true)}
        />
      </PageLayout.Hero>

      <PageLayout.Tabs
        id="profile-tabs"
        tabs={visibleTabs.map((t) => ({
          id: t.key,
          label: t.label,
          icon: <t.icon className="w-3.5 h-3.5" />,
        }))}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as ModernProfileTabKey)}
      />

      <PageLayout.Aside>
        <Card variant="default" padding="md" className="space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
            Secoes do perfil
          </p>
          <dl className="space-y-1.5 text-xs text-stone-700">
            <div className="flex items-center justify-between">
              <dt>Visiveis</dt>
              <dd className="font-mono font-bold">{visibleTabs.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Instrumentos</dt>
              <dd className="font-mono font-bold">{profile.instruments.length}</dd>
            </div>
          </dl>
          {isOwnProfile ? (
            <div className="space-y-2 border-t border-stone-100 pt-2.5">
              <Button variant="outline" size="sm" className="w-full" onClick={togglePublicPreview}>
                {isPreviewPublic ? 'Voltar a edicao' : 'Ver como o publico ve'}
              </Button>
              {!isPreviewPublic && (
                <>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setShowSectionsModal(true)}>
                    Privacidade das secoes
                  </Button>
                  <Button variant="primary" size="sm" className="w-full" onClick={() => setShowPublishModal(true)}>
                    Publicar no portfolio
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/profile/network')}>
              Voltar a rede
            </Button>
          )}
        </Card>

        {profile.officialLinks && profile.officialLinks.length > 0 && (
          <Card variant="default" padding="md" className="space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-stone-500">
              Links oficiais
            </p>
            <div className="flex flex-wrap gap-1.5">
              {profile.officialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded border border-stone-200 bg-stone-50 px-2 py-0.5 text-[11px] font-medium text-stone-700 transition-colors hover:bg-stone-100"
                >
                  <span>{link.label}</span>
                  <ExternalLink className="h-2.5 w-2.5 text-stone-400" />
                </a>
              ))}
            </div>
          </Card>
        )}
      </PageLayout.Aside>

      <PageLayout.Main>

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

        {/* Agrupador das 19 secoes: SegmentedControl do design system no
            lugar de seis <button> com classes condicionais a mao. */}
        <SegmentedControl
          id="profile-clusters"
          ariaLabel="Agrupar seções do perfil"
          sizeVariant="sm"
          value={selectedCluster}
          onChange={setSelectedCluster}
          options={[
            { id: 'all', label: 'Todas' },
            { id: 'geral', label: 'Visao geral' },
            { id: 'carreira', label: 'Carreira' },
            { id: 'producoes', label: 'Producoes' },
            { id: 'pratica', label: 'Pratica' },
            { id: 'comunidade', label: 'Comunidade' },
          ]}
        />


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
            setFeedback('Privacidade por seção guardada.');
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
      </PageLayout.Main>
    </PageLayout>
  );
};
