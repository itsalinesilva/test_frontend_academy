import React, { useEffect, useState } from 'react';
import { useRouter } from '../navigation/router';
import { authService } from '../../services/application/auth.service';
import { AppMode } from '../../domain/types';
import { rotaBloqueadaParaKids } from '../../domain/kids-account';
import { Card } from '../components/base/Card';
import { Button } from '../components/base/Button';
import { ShieldAlert, LogIn, ArrowLeft } from 'lucide-react';

// 6 Primary Pillars
import { AcademyHomeScreen } from './academy/AcademyHomeScreen';
import { HomeScreen } from './home/HomeScreen';
import { AcademyCatalogScreen } from './academy/AcademyCatalogScreen';
import { AcademySearchScreen } from './academy/AcademySearchScreen';
import { ProgramDetailScreen } from './academy/ProgramDetailScreen';
import { PathDetailScreen } from './academy/PathDetailScreen';
import { CoursePresentationScreen } from './academy/CoursePresentationScreen';
import { CourseLearnScreen } from './academy/CourseLearnScreen';
import { LessonTheaterScreen } from './academy/LessonTheaterScreen';
import { MeuAprendizadoScreen } from './academy/MeuAprendizadoScreen';
import { ModuleDetailScreen } from './academy/ModuleDetailScreen';
import { ActivityScreen } from './academy/ActivityScreen';
import { AssessmentScreen } from './academy/AssessmentScreen';
import { AssessmentResultScreen } from './academy/AssessmentResultScreen';
import { CourseCompletionScreen } from './academy/CourseCompletionScreen';
import { CertificateScreen } from './academy/CertificateScreen';
import { AcademicHistoryScreen } from './academy/AcademicHistoryScreen';
import { CategoryDetailScreen } from './academy/CategoryDetailScreen';
import { CourseCurriculumScreen } from './academy/CourseCurriculumScreen';
import { CourseProgressScreen } from './academy/CourseProgressScreen';
import { InteractiveLessonScreen } from './academy/InteractiveLessonScreen';
import { AcademyQuizScreen } from './academy/AcademyQuizScreen';
import { AcademySearchResultsScreen } from './academy/AcademySearchResultsScreen';
import { AcademicProfileScreen } from './academy/AcademicProfileScreen';

// Practice & Score Canonical Pillars
import { PracticeHomeScreen } from './practice/PracticeHomeScreen';
import { SkillTreeScreen } from './practice/SkillTreeScreen';
import { SkillDetailScreen } from './practice/SkillDetailScreen';
import { MicroSkillScreen } from './practice/MicroSkillScreen';
import { ExerciseDetailScreen } from './practice/ExerciseDetailScreen';
import { ExerciseSessionScreen } from './practice/ExerciseSessionScreen';
import { AttemptDetailScreen } from './practice/AttemptDetailScreen';
import { ImmediateFeedbackScreen } from './practice/ImmediateFeedbackScreen';
import { PracticeResultScreen } from './practice/PracticeResultScreen';
import { MasteryScreen } from './practice/MasteryScreen';
import { PracticeHistoryScreen } from './practice/PracticeHistoryScreen';
import { DailyGoalScreen } from './practice/DailyGoalScreen';
import { StreakScreen } from './practice/StreakScreen';
import { RankingScreen } from './practice/RankingScreen';
import { PracticeProfileScreen } from './practice/PracticeProfileScreen';
import { PracticeScreen } from './practice/PracticeScreen';
import { ScoreScreen } from './score/ScoreScreen';
import { NotFoundScreen } from './notfound/NotFoundScreen';

import { WorldsAtlasScreen } from './worlds/WorldsAtlasScreen';
import { WorkDetailScreen } from './worlds/WorkDetailScreen';
import { MusicGraphScreen } from './worlds/MusicGraphScreen';

import { CommunityFeedScreen } from './community/CommunityFeedScreen';
import { TopicDetailScreen } from './community/TopicDetailScreen';
import { EventsDirectoryScreen } from './community/EventsDirectoryScreen';

import { StudioHubScreen } from './studio/StudioHubScreen';
import { DawProjectScreen } from './studio/DawProjectScreen';
import { ScoreEditorScreen } from './studio/ScoreEditorScreen';
import { VoiceEarLabScreen } from './studio/VoiceEarLabScreen';

import { RoomsDirectoryScreen } from './rooms/RoomsDirectoryScreen';
import { RoomDetailScreen } from './rooms/RoomDetailScreen';
import { CreateRoomScreen } from './rooms/CreateRoomScreen';

import { ProfileOverviewScreen } from './profile/ProfileOverviewScreen';
import { PortfolioScreen } from './profile/PortfolioScreen';
import { NetworkDirectoryScreen } from './profile/NetworkDirectoryScreen';
import { CredentialStudioScreen } from './admin/CredentialStudioScreen';
import { BookletEditorScreen } from './admin/BookletEditorScreen';
import { LibraryScreen } from './admin/LibraryScreen';
import { CredentialVerifyScreen } from './credentials/CredentialVerifyScreen';
import { KidsCreateScreen } from './kids/KidsCreateScreen';
import { ViolinSimulatorScreen } from './violin/ViolinSimulatorScreen';
import { KidsGuardianScreen } from './kids/KidsGuardianScreen';
import { EditProfileScreen } from './profile/EditProfileScreen';

// Core & Utilities
import { LoginScreen } from './auth/LoginScreen';
import { RegisterScreen } from './auth/RegisterScreen';
import { RecoveryScreen } from './auth/RecoveryScreen';
import { OAuthCallbackScreen } from './auth/OAuthCallbackScreen';
import { OnboardingScreen } from './onboarding/OnboardingScreen';
import { SettingsScreen } from './settings/SettingsScreen';
import { NotificationsScreen } from './notifications/NotificationsScreen';
import { SearchScreen } from './search/SearchScreen';
import { HelpScreen } from './help/HelpScreen';

// Admin Governance (Protected)
import { AdminDashboardScreen } from './admin/AdminDashboardScreen';
import { AdminUsersScreen } from './admin/AdminUsersScreen';
import { AdminEnginesScreen } from './admin/AdminEnginesScreen';
import { AdminContentScreen } from './admin/AdminContentScreen';
import { AdminModerationScreen } from './admin/AdminModerationScreen';
import { AdminAuditScreen } from './admin/AdminAuditScreen';

// Design System Catalog
import { DesignSystemCatalog } from '../components/design-system-catalog/DesignSystemCatalog';

export const AppRouterOutlet: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const [authStatus, setAuthStatus] = useState<{
    isChecking: boolean;
    authorized: boolean;
    reason?: string;
    porSerCrianca?: boolean;
  }>({ isChecking: false, authorized: true });

  // Protected route authorization evaluation
  useEffect(() => {
    let isMounted = true;
    async function evaluateSecurity() {
      const isProtected = currentPath.startsWith('/founder') || currentPath === '/rooms/create';

      // A restrição de conta infantil é avaliada em TODA rota, não só nas
      // protegidas por papel. Perfil de terceiro, comunidade e salas não são
      // "áreas administrativas" — são exatamente onde uma criança não deve
      // chegar, e a checagem tem de estar na navegação para que um link
      // colado de fora encontre o mesmo bloqueio (domain/kids-account.ts).
      const precisaAvaliar = isProtected || rotaBloqueadaParaKids(currentPath);
      if (!precisaAvaliar) {
        if (isMounted) setAuthStatus({ isChecking: false, authorized: true });
        return;
      }

      setAuthStatus({ isChecking: true, authorized: true });
      const session = await authService.getActiveSession();

      if (session?.mode === AppMode.KIDS && rotaBloqueadaParaKids(currentPath)) {
        if (isMounted) {
          setAuthStatus({
            isChecking: false,
            authorized: false,
            porSerCrianca: true,
            reason:
              'Esta área não faz parte do perfil infantil. Perfis de outras pessoas, comunidade e salas ficam com quem é responsável pela conta.',
          });
        }
        return;
      }

      if (!isProtected) {
        if (isMounted) setAuthStatus({ isChecking: false, authorized: true });
        return;
      }

      const check = await authService.checkRouteAccess(currentPath, session?.user || null);

      if (isMounted) {
        setAuthStatus({
          isChecking: false,
          authorized: check.authorized,
          reason: check.reason,
        });
      }
    }

    evaluateSecurity();
    return () => {
      isMounted = false;
    };
  }, [currentPath]);

  // If checking protected route access
  if (authStatus.isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-anil-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-600 font-serif">Verificando autorização de segurança canônica…</p>
        </div>
      </div>
    );
  }

  // Access denied screen for protected routes
  if (!authStatus.authorized) {
    // Para a criança a mensagem não é de "acesso negado": ela não fez nada
    // errado, e tratar a restricao como falta ensina a contorná-la.
    if (authStatus.porSerCrianca) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
          <Card variant="default" padding="lg" className="w-full max-w-md space-y-4 border-stone-300 text-center shadow-md">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-amber-300">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-lg font-bold text-stone-900">Esta parte fica com quem cuida de você</h2>
            <p className="text-xs leading-relaxed text-stone-600">{authStatus.reason}</p>
            <p className="text-xs leading-relaxed text-stone-500">
              As aulas, os exercícios e a sua prática continuam todos disponíveis.
            </p>
            <div className="flex justify-center pt-2">
              <Button variant="primary" size="sm" onClick={() => navigate('/academia')}>
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Voltar para as aulas
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
        <Card variant="default" padding="lg" className="max-w-md w-full text-center space-y-4 border-red-300 shadow-md">
          <div className="w-12 h-12 bg-red-100 text-anil-800 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="font-serif font-bold text-lg text-stone-900">Acesso Institucional Restrito</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            {authStatus.reason || 'Esta rota exige credenciais com privilégios institucionais específicos.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Retornar ao Início
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/auth/login')}>
              <LogIn className="w-3.5 h-3.5 mr-1" /> Autenticar como Admin
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Raiz: a home, nas duas versoes.
  //
  // Visitante recebe o que a plataforma e e por que criar conta. Quem entrou
  // recebe o proprio feed. A tela antiga daqui repetia o menu do header pela
  // terceira vez e foi removida; esta nao repete menu nenhum.
  if (currentPath === '/' || currentPath === '' || currentPath === '/overview') {
    return <HomeScreen />;
  }

  // Design System
  if (currentPath === '/design-system') {
    return (
      <div id="screen-design-system">
        <DesignSystemCatalog />
      </div>
    );
  }

  // 1. ACADEMIA
  if (currentPath === '/academia') {
    return <AcademyHomeScreen />;
  }
  if (
    currentPath === '/academia/meu-aprendizado' ||
    currentPath === '/academia/my-learning'
  ) {
    return <MeuAprendizadoScreen />;
  }
  if (currentPath === '/academia/catalog') {
    return <AcademyCatalogScreen />;
  }
  if (currentPath === '/academia/search/results') {
    return <AcademySearchResultsScreen />;
  }
  if (currentPath === '/academia/search') {
    return <AcademySearchScreen />;
  }
  if (currentPath.startsWith('/academia/category/')) {
    return <CategoryDetailScreen />;
  }
  if (currentPath.startsWith('/academia/program/')) {
    return <ProgramDetailScreen />;
  }
  if (currentPath.startsWith('/academia/path/')) {
    return <PathDetailScreen />;
  }
  if (currentPath.includes('/module/')) {
    return <ModuleDetailScreen />;
  }
  if (currentPath.includes('/curriculum')) {
    return <CourseCurriculumScreen />;
  }
  if (currentPath.includes('/progress')) {
    return <CourseProgressScreen />;
  }
  // Dentro do curso: menu lateral fixo, conteudo ao centro, calendario a direita.
  if (currentPath.startsWith('/academia/course/') && currentPath.endsWith('/aprender')) {
    return <CourseLearnScreen />;
  }
  // Apresentacao do curso: hero, metricas, secoes, disciplinas, avaliacoes.
  if (currentPath.startsWith('/academia/course/')) {
    return <CoursePresentationScreen />;
  }
  if (currentPath.includes('/interactive')) {
    return <InteractiveLessonScreen />;
  }
  // A licao abre em tela-teatro, com o menu da disciplina a esquerda.
  if (currentPath.startsWith('/academia/lesson/')) {
    return <LessonTheaterScreen />;
  }
  if (currentPath.startsWith('/academia/activity/')) {
    return <ActivityScreen />;
  }
  if (currentPath.startsWith('/academia/quiz/')) {
    return <AcademyQuizScreen />;
  }
  if (currentPath.startsWith('/academia/assessment/')) {
    return <AssessmentScreen />;
  }
  if (currentPath.startsWith('/academia/result/')) {
    return <AssessmentResultScreen />;
  }
  if (currentPath.startsWith('/academia/completion/')) {
    return <CourseCompletionScreen />;
  }
  if (currentPath.startsWith('/academia/certificate/')) {
    return <CertificateScreen />;
  }
  if (currentPath === '/academia/history') {
    return <AcademicHistoryScreen />;
  }
  if (currentPath === '/academia/academic-profile' || currentPath === '/academia/profile') {
    return <AcademicProfileScreen />;
  }

  // 2. PRACTICE (PRACTICE HUB & GAMIFIED LOOP)
  if (currentPath === '/practice') {
    return <PracticeHomeScreen />;
  }
  if (currentPath === '/practice/trainer' || currentPath === '/practice/ear') {
    return <PracticeScreen />;
  }
  if (currentPath === '/practice/skill-tree') {
    return <SkillTreeScreen />;
  }
  if (currentPath.startsWith('/practice/skill/')) {
    return <SkillDetailScreen />;
  }
  if (currentPath.startsWith('/practice/microskill/')) {
    return <MicroSkillScreen />;
  }
  if (currentPath.startsWith('/practice/exercise/')) {
    return <ExerciseDetailScreen />;
  }
  if (currentPath.startsWith('/practice/session/')) {
    return <ExerciseSessionScreen />;
  }
  if (currentPath.startsWith('/practice/attempt/')) {
    return <AttemptDetailScreen />;
  }
  if (currentPath.startsWith('/practice/feedback/')) {
    return <ImmediateFeedbackScreen />;
  }
  if (currentPath.startsWith('/practice/result/')) {
    return <PracticeResultScreen />;
  }
  if (currentPath === '/practice/mastery') {
    return <MasteryScreen />;
  }
  if (currentPath === '/practice/history') {
    return <PracticeHistoryScreen />;
  }
  if (currentPath === '/practice/daily-goal') {
    return <DailyGoalScreen />;
  }
  if (currentPath === '/practice/streak') {
    return <StreakScreen />;
  }
  if (currentPath === '/practice/ranking') {
    return <RankingScreen />;
  }
  if (currentPath === '/practice/profile') {
    return <PracticeProfileScreen />;
  }

  // 3. SCORE (SCORE HUB & URTEXT)
  if (currentPath === '/score') {
    return <ScoreScreen />;
  }

  // 4. MUNDOS (WORLDS)
  if (currentPath === '/worlds') {
    return <WorldsAtlasScreen />;
  }
  if (currentPath.startsWith('/worlds/work/')) {
    return <WorkDetailScreen />;
  }
  if (currentPath === '/worlds/graph') {
    return <MusicGraphScreen />;
  }

  // 3. COMMUNITY
  if (currentPath === '/community') {
    return <CommunityFeedScreen />;
  }
  if (currentPath.startsWith('/community/topic/')) {
    return <TopicDetailScreen />;
  }
  if (currentPath === '/community/events') {
    return <EventsDirectoryScreen />;
  }

  // 4. STUDIO
  if (currentPath === '/studio') {
    return <StudioHubScreen />;
  }
  if (currentPath.startsWith('/studio/project/')) {
    return <DawProjectScreen />;
  }
  if (currentPath === '/studio/score') {
    return <ScoreEditorScreen />;
  }
  if (currentPath === '/studio/voice-ear') {
    return <VoiceEarLabScreen />;
  }

  // 5. ROOMS
  if (currentPath === '/rooms') {
    return <RoomsDirectoryScreen />;
  }
  if (currentPath === '/rooms/create') {
    return <CreateRoomScreen />;
  }
  if (currentPath.startsWith('/rooms/')) {
    return <RoomDetailScreen />;
  }

  // 6. PROFILE
  if (currentPath === '/profile') {
    return <ProfileOverviewScreen />;
  }
  if (currentPath === '/profile/portfolio') {
    return <PortfolioScreen />;
  }
  if (currentPath === '/profile/edit') {
    return <EditProfileScreen />;
  }
  if (currentPath === '/profile/network') {
    return <NetworkDirectoryScreen />;
  }
  // Perfil de outra pessoa. Vem DEPOIS das rotas estaticas de /profile/*
  // para que elas tenham precedencia.
  if (currentPath.startsWith('/profile/')) {
    return <ProfileOverviewScreen />;
  }

  // VIOLINO
  if (currentPath.startsWith('/violin/simulator')) {
    return <ViolinSimulatorScreen />;
  }

  // CONTA INFANTIL
  if (currentPath === '/kids/create') {
    return <KidsCreateScreen />;
  }
  if (currentPath === '/kids/manage' || currentPath === '/kids') {
    return <KidsGuardianScreen />;
  }

  // CREDENCIAIS — verificacao publica, sem sessao
  if (currentPath === '/credential' || currentPath.startsWith('/credential/')) {
    return <CredentialVerifyScreen />;
  }

  // AUTHENTICATION
  if (currentPath === '/auth/login') {
    return <LoginScreen />;
  }
  if (currentPath === '/auth/register') {
    return <RegisterScreen />;
  }
  if (currentPath === '/auth/recovery') {
    return <RecoveryScreen />;
  }
  if (currentPath === '/auth/callback') {
    return <OAuthCallbackScreen />;
  }

  // ONBOARDING, SETTINGS, NOTIFICATIONS, SEARCH, HELP
  if (currentPath === '/onboarding') {
    return <OnboardingScreen />;
  }
  if (currentPath === '/settings') {
    return <SettingsScreen />;
  }
  if (currentPath === '/notifications') {
    return <NotificationsScreen />;
  }
  if (currentPath === '/search') {
    return <SearchScreen />;
  }
  if (currentPath === '/help') {
    return <HelpScreen />;
  }

  // ADMIN GOVERNANCE
  if (currentPath === '/founder') {
    return <AdminDashboardScreen />;
  }
  if (currentPath === '/founder/users') {
    return <AdminUsersScreen />;
  }
  if (currentPath === '/founder/engines') {
    return <AdminEnginesScreen />;
  }
  if (currentPath === '/founder/content') {
    return <AdminContentScreen />;
  }
  if (currentPath === '/founder/moderation') {
    return <AdminModerationScreen />;
  }
  if (currentPath === '/founder/credentials') {
    return <CredentialStudioScreen />;
  }
  if (currentPath === '/founder/booklets') {
    return <BookletEditorScreen />;
  }
  if (currentPath === '/founder/biblioteca') {
    return <LibraryScreen />;
  }
  if (currentPath === '/founder/audit') {
    return <AdminAuditScreen />;
  }

  // Explicit 404 Not Found State
  return <NotFoundScreen attemptedPath={currentPath} />;
};
