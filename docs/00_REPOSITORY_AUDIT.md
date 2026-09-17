# AUDITORIA TÉCNICA EXAUSTIVA DO REPOSITÓRIO (00_REPOSITORY_AUDIT)

**Data da Auditoria:** 16 de Setembro de 2026  
**Status do Repositório:** Base Frontend SPA React 19 + TypeScript 5.7 + Vite + Tailwind CSS v4 + Vitest  
**Finalidade:** Estabelecer o repositório como fonte da verdade técnica, catalogar todo o código existente, inventariar componentes, serviços, contratos, rotas e telas, identificando mocks, dados fictícios, duplicações, débitos técnicos e gaps entre frontend e backend.

---

## 1. INVENTÁRIO DE ARQUIVOS

O repositório é composto por **119 arquivos** distribuídos em arquitetura modular orientada a domínio e contratos:

### 1.1 Contratos (`/src/contracts/` - 5 arquivos, 276 linhas)
- `src/contracts/academy-contracts.ts` (18 linhas): Interfaces de DTOs para detalhes de curso, matrícula e envio de progresso de lição.
- `src/contracts/api-types.ts` (38 linhas): Resposta canônica `ApiResponse<T>`, `ApiErrorResponse`, paginação e envelope de erros HTTP.
- `src/contracts/auth-contracts.ts` (62 linhas): DTOs de login, registro, Google OAuth, onboarding e resposta de sessão `AuthSessionResponse`.
- `src/contracts/profile-contracts.ts` (109 linhas): DTOs para ingestão de evidências (`IngestEvidenceRequest`), portfólio e cabeçalho de perfil.
- `src/contracts/tool-contracts.ts` (49 linhas): Enums e interfaces para ferramentas musicais (`ToolCategory`, `EngineExecutionStatus`, `ToolExecutionRequest`, `ToolExecutionResult`).

### 1.2 Domínio (`/src/domain/` - 10 arquivos, 1.258 linhas)
- `src/domain/types.ts` (201 linhas): Entidades centrais do sistema (`User`, `Profile`, `Course`, `Lesson`, `Room`, `Project`, `UserRole`, `UserCapability`, etc.).
- `src/domain/academy.ts` (344 linhas): Entidades da Academia estruturada (`Program`, `LearningPath`, `AcademyCourse`, `AcademyModule`, `AcademyLesson`, `AcademyActivity`, `AcademyAssessment`, `UserAcademyProgress`, `AcademicCertificateRecord`, `AcademicHistoryEntry`, `AudienceVariant`).
- `src/domain/profile.ts` (369 linhas): Modelo unificado de perfil (`UnifiedProfileRecord`, `Evidence`, `PortfolioItem`, `ProfileSectionConfig`, `VisibilityLevel`, `TeacherRoomProfile`).
- `src/domain/capabilities.ts` (98 linhas): Mapeamento formal de permissões e matriz RBAC por papel (Aluno, Músico, Professor, Admin).
- `src/domain/entitlements.ts` (72 linhas): Gestão de acessos a planos (Gratuito, Pro, Institucional) e cotas de ferramentas.
- `src/domain/audit.ts` (43 linhas): Tipagem de eventos imutáveis de auditoria (`AuditEvent`, `AuditAction`, `AuditSeverity`).
- `src/domain/errors.ts` (62 linhas): Hierarquia de exceções de domínio (`DomainError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ValidationError`, `EngineAdapterError`).
- `src/domain/events.ts` (32 linhas): Definição de eventos de barramento (`DomainEvent`, `DomainEventType`).
- `src/domain/analytics.ts` (18 linhas): Tipos de telemetria de produto (`AnalyticsEvent`, `AnalyticsEventType`).
- `src/domain/feature-flags.ts` (19 linhas): Configuração e chaves de ativação de recursos (`FeatureFlag`, `FeatureFlagKey`).

### 1.3 Repositórios (`/src/repositories/` - 6 arquivos, 1.694 linhas)
- `src/repositories/user.repository.ts` (140 linhas): Persistência de usuários com seeds de fundadores e personas de teste.
- `src/repositories/profile.repository.ts` (96 linhas): Persistência básica de perfis de usuário legados.
- `src/repositories/unified-profile.repository.ts` (907 linhas): Repositório completo de perfis unificados, portfólio de 7 lentes e ingestão de evidências canônicas.
- `src/repositories/course.repository.ts` (210 linhas): Repositório legado de cursos e progresso do estudante.
- `src/repositories/academy.repository.ts` (310 linhas): Repositório canônico da Academia (programas, trilhas, disciplinas, lições, exames, certificados e progresso persistido).
- `src/repositories/audit.repository.ts` (31 linhas): Repositório de log imutável de auditoria local (buffer de 500 registros).

### 1.4 Serviços de Aplicação & Ferramentas (`/src/services/` - 5 arquivos, 1.779 linhas)
- `src/services/application/auth.service.ts` (525 linhas): Orquestração de autenticação, login Google, registro, troca de papéis, emissão de sessão e verificação de rota.
- `src/services/application/profile.service.ts` (496 linhas): Gestão de perfil unificado, visibilidade por seção, portfólio e ingestão de evidências automáticas.
- `src/services/application/academy.service.ts` (608 linhas): Orquestração acadêmica, catálogo, matrícula, progresso de lições, correção de avaliações, emissão de certificados com SHA-256 e gravação de histórico.
- `src/services/tool/tool.service.ts` (111 linhas): Execução de ferramentas musicais (afinador, teoria, partitura, avaliação de prática) com checagem de entitlements e telemetria.
- `src/services/tool/tool.sdk.ts` (39 linhas): SDK simplificado para componentes de UI invocarem ferramentas musicais.

### 1.5 Motores & Adapters (`/src/adapters/engines/` - 9 arquivos, 622 linhas)
- `src/adapters/engines/gateway/engine-gateway.ts` (118 linhas): Barramento unificado que desacopla a UI dos motores de execução (áudio, teoria, notação e prática).
- `src/adapters/engines/audio/audio-engine.interface.ts` (23 linhas): Interface do motor de áudio.
- `src/adapters/engines/audio/web-audio.adapter.ts` (118 linhas): Adapter WebAudio para DSP, detecção de pitch e síntese.
- `src/adapters/engines/theory/theory-engine.interface.ts` (34 linhas): Interface do motor de teoria musical.
- `src/adapters/engines/theory/rule-based-theory.adapter.ts` (147 linhas): Validador de regras harmônicas, condução de vozes e acordes tonais.
- `src/adapters/engines/score/score-engine.interface.ts` (35 linhas): Interface do motor de partituras e notação.
- `src/adapters/engines/score/canonical-score.adapter.ts` (80 linhas): Renderizador canvas e parser simplificado de MusicXML/MIDI.
- `src/adapters/engines/practice/practice-scoring.interface.ts` (25 linhas): Interface de avaliação de prática musical.
- `src/adapters/engines/practice/rule-based-practice.adapter.ts` (42 linhas): Motor heurístico de precisão rítmica e afinação de exercícios.

### 1.6 Infraestrutura (`/src/infrastructure/` - 8 arquivos, 698 linhas)
- `src/infrastructure/storage/storage-adapter.ts` (85 linhas): Interface `StorageAdapter`, `LocalStorageAdapter` e `MemoryStorageAdapter`.
- `src/infrastructure/api/api-client.ts` (142 linhas): Cliente HTTP `ApiClient` com interceptação de tokens e mapeamento de exceções.
- `src/infrastructure/entitlements/entitlement-service.ts` (188 linhas): Serviço de verificação de permissões RBAC e planos.
- `src/infrastructure/telemetry/analytics-service.ts` (56 linhas): Buffer local de telemetria e eventos de uso de produto.
- `src/infrastructure/telemetry/audit-service.ts` (58 linhas): Serviço de registro de auditoria imutável institucional.
- `src/infrastructure/feature-flags/feature-flag-service.ts` (30 linhas): Alternância dinâmica de recursos em runtime.
- `src/infrastructure/logging/logger.ts` (62 linhas): Logger estruturado com níveis (debug, info, warn, error).
- `src/infrastructure/audio/synth.ts` (77 linhas): Sintetizador WebAudio de osciladores para audição de notas e acordes.

### 1.7 Dados Canônicos de Seed (`/src/data/` - 1 arquivo, 1.067 linhas)
- `src/data/seed-academy-content.ts` (1.067 linhas): Base de dados canônica da Academia (Programas, Trilhas, Disciplinas dos Fundamentos de Teoria de Edimburgo, Lições completas com texto acadêmico e áudios, Atividades práticas e Avaliações somativas com gabarito).

### 1.8 Roteamento & Casca da Aplicação (`/src/app/`, `/src/ui/navigation/` - 4 arquivos, 816 linhas)
- `src/app/App.tsx` (148 linhas): Ponto de entrada React com `RouterProvider`, `AppShell`, seletor de personas/papéis e toasts.
- `src/app/ErrorBoundary.tsx` (53 linhas): Barreira de contenção de erros de renderização com feedback visual.
- `src/ui/navigation/router.tsx` (340 linhas): Roteador SPA baseado em Hash/Path com `CANONICAL_ROUTES`, extração de parâmetros dinâmicos, geração de migalhas de pão (breadcrumbs) e autorização assíncrona de rota.
- `src/ui/screens/AppRouterOutlet.tsx` (315 linhas): Ponto de montagem de telas com guarda de segurança RBAC e despacho para 46 telas.

### 1.9 Design System & Componentes (`/src/ui/` - 46 componentes, ~5.200 linhas)
- `src/ui/design-system/tokens.ts` (235 linhas): Tokens tipográficos, paleta de cores (vermelhos bordô, tons pedra, esmeralda, âmbar), espaçamentos e raios.
- `src/ui/design-system/index.ts` (53 linhas): Exportação central do Design System.
- Componentes organizados por pastas em `/src/ui/components/`:
  - `a11y/`: `LiveRegion.tsx`, `SkipLink.tsx`, `VisuallyHidden.tsx`.
  - `auth/`: `GoogleOAuthModal.tsx`.
  - `base/`: `Badge.tsx`, `Button.tsx`, `Card.tsx`, `Input.tsx`.
  - `data-display/`: `Avatar.tsx`, `CredentialChip.tsx`, `List.tsx`, `Progress.tsx`, `Table.tsx`.
  - `design-system-catalog/`: `DesignSystemCatalog.tsx` (catálogo visual vivo).
  - `domain/`: `AudienceToggle.tsx`, `CourseCard.tsx`, `FeedCard.tsx`, `MediaCard.tsx`, `PracticeResultCard.tsx`, `ProfileCard.tsx`, `RoomCard.tsx`, `ScoreContainer.tsx`, `TimelineContainer.tsx`, `ToolPanel.tsx`.
  - `feedback/`: `EmptyState.tsx`, `ErrorState.tsx`, `LoadingState.tsx`, `SuccessState.tsx`.
  - `forms/`: `Checkbox.tsx`, `RadioGroup.tsx`, `Select.tsx`, `Switch.tsx`.
  - `layout/`: `AppShell.tsx`, `Header.tsx`, `Navigation.tsx`, `ScreenContainer.tsx`.
  - `navigation/`: `Breadcrumbs.tsx`, `DropdownMenu.tsx`, `SegmentedControl.tsx`, `Tabs.tsx`.
  - `overlays/`: `Dialog.tsx`, `Drawer.tsx`.
  - `profile/`: `EditHeaderModal.tsx`, `ProfileSectionsModal.tsx`, `PublishPortfolioModal.tsx`, `TeacherRoomModal.tsx`.

### 1.10 Telas do Sistema (`/src/ui/screens/` - 36 arquivos, ~9.500 linhas)
- Telas catalogadas no item 2 e detalhadas no item 8.

### 1.11 Testes Automatizados (`/tests/` - 6 arquivos, 19 testes unitários)
- `tests/theory-engine.test.ts` (4 testes): Teste de identificação de notas, intervalos e acordes.
- `tests/engine-gateway.test.ts` (2 testes): Teste de injeção e alternância de adapters no gateway.
- `tests/entitlements.test.ts` (3 testes): Validação de capacidades e limites de plano.
- `tests/repositories.test.ts` (3 testes): Teste de persistência de perfis e usuários.
- `tests/design-system.test.ts` (5 testes): Validação de tokens e renderização de botões.
- `tests/tool-service.test.ts` (2 testes): Fluxo ponta a ponta de execução de ferramentas via SDK e adapter.

---

## 2. INVENTÁRIO DE ROTAS

O roteamento (`src/ui/navigation/router.tsx`) e seu outlet (`src/ui/screens/AppRouterOutlet.tsx`) definem **46 rotas canônicas**:

| Rota Canônica | Path / Pattern | Tela Vinculada | Parâmetros Dinâmicos | Proteção / RBAC |
| :--- | :--- | :--- | :--- | :--- |
| `OVERVIEW` | `/` ou `/overview` | `OverviewScreen` | Nenhum | Público |
| `DESIGN_SYSTEM` | `/design-system` | `DesignSystemCatalog` | Nenhum | Público |
| `AUTH_LOGIN` | `/auth/login` | `LoginScreen` | Nenhum | Público |
| `AUTH_REGISTER` | `/auth/register` | `RegisterScreen` | Nenhum | Público |
| `AUTH_RECOVERY` | `/auth/recovery` | `RecoveryScreen` | Nenhum | Público |
| `AUTH_CALLBACK` | `/auth/callback` | `OAuthCallbackScreen` | Nenhum | Público |
| `ONBOARDING` | `/onboarding` | `OnboardingScreen` | Nenhum | Autenticado |
| `SETTINGS` | `/settings` | `SettingsScreen` | Nenhum | Autenticado |
| `NOTIFICATIONS` | `/notifications` | `NotificationsScreen` | Nenhum | Autenticado |
| `SEARCH` | `/search` | `SearchScreen` | Nenhum | Público |
| `HELP` | `/help` | `HelpScreen` | Nenhum | Público |
| `ACADEMY` | `/academy` | `AcademyHomeScreen` | Nenhum | Público |
| `ACADEMY_CATALOG` | `/academy/catalog` | `AcademyCatalogScreen` | Nenhum | Público |
| `ACADEMY_SEARCH` | `/academy/search` | `AcademySearchScreen` | Nenhum | Público |
| `ACADEMY_PROGRAM` | `/academy/program/:id` | `ProgramDetailScreen` | `:id` | Público |
| `ACADEMY_PATH` | `/academy/path/:id` | `PathDetailScreen` | `:id` | Público |
| `ACADEMY_COURSE` | `/academy/course/:id` | `CourseDetailScreen` | `:id` | Público |
| `ACADEMY_MODULE` | `/academy/course/:courseId/module/:moduleId` | `ModuleDetailScreen` | `:courseId`, `:moduleId` | Público |
| `ACADEMY_LESSON` | `/academy/lesson/:id` | `LessonReaderScreen` | `:id` | Autenticado |
| `ACADEMY_ACTIVITY` | `/academy/activity/:id` | `ActivityScreen` | `:id` | Autenticado |
| `ACADEMY_ASSESSMENT` | `/academy/assessment/:id` | `AssessmentScreen` | `:id` | Autenticado |
| `ACADEMY_RESULT` | `/academy/result/:id` | `AssessmentResultScreen` | `:id` | Autenticado |
| `ACADEMY_COMPLETION` | `/academy/completion/:id` | `CourseCompletionScreen` | `:id` | Autenticado |
| `ACADEMY_CERTIFICATE` | `/academy/certificate/:id` | `CertificateScreen` | `:id` | Público (Auditável) |
| `ACADEMY_MY_LEARNING`| `/academy/my-learning` | `MyLearningScreen` | Nenhum | Autenticado |
| `ACADEMY_HISTORY` | `/academy/history` | `AcademicHistoryScreen` | Nenhum | Autenticado |
| `WORLDS` | `/worlds` | `WorldsAtlasScreen` | Nenhum | Público |
| `WORLDS_WORK` | `/worlds/work/:id` | `WorkDetailScreen` | `:id` | Público |
| `WORLDS_GRAPH` | `/worlds/graph` | `MusicGraphScreen` | Nenhum | Público |
| `COMMUNITY` | `/community` | `CommunityFeedScreen` | Nenhum | Público/Autenticado |
| `COMMUNITY_TOPIC` | `/community/topic/:id` | `TopicDetailScreen` | `:id` | Público/Autenticado |
| `COMMUNITY_EVENTS` | `/community/events` | `EventsDirectoryScreen` | Nenhum | Público |
| `STUDIO` | `/studio` | `StudioHubScreen` | Nenhum | Autenticado |
| `STUDIO_PROJECT` | `/studio/project/:id` | `DawProjectScreen` | `:id` | Autenticado |
| `STUDIO_SCORE` | `/studio/score` | `ScoreEditorScreen` | Nenhum | Autenticado |
| `STUDIO_VOICE_EAR` | `/studio/voice-ear` | `VoiceEarLabScreen` | Nenhum | Autenticado |
| `ROOMS` | `/rooms` | `RoomsDirectoryScreen` | Nenhum | Autenticado |
| `ROOMS_DETAIL` | `/rooms/:id` | `RoomDetailScreen` | `:id` | Autenticado |
| `ROOMS_CREATE` | `/rooms/create` | `CreateRoomScreen` | Nenhum | `CREATE_ROOM` (Professor/Admin) |
| `PROFILE` | `/profile` | `ProfileOverviewScreen` | Nenhum | Autenticado/Público |
| `PROFILE_PORTFOLIO` | `/profile/portfolio` | `PortfolioScreen` | Nenhum | Autenticado |
| `PROFILE_EDIT` | `/profile/edit` | `EditProfileScreen` | Nenhum | Autenticado (Dono) |
| `ADMIN` | `/admin` | `AdminDashboardScreen` | Nenhum | `ADMIN` (Requer papel de Administrador) |
| `ADMIN_USERS` | `/admin/users` | `AdminUsersScreen` | Nenhum | `ADMIN` |
| `ADMIN_ENGINES` | `/admin/engines` | `AdminEnginesScreen` | Nenhum | `ADMIN` |
| `ADMIN_CONTENT` | `/admin/content` | `AdminContentScreen` | Nenhum | `ADMIN` |
| `ADMIN_MODERATION` | `/admin/moderation` | `AdminModerationScreen` | Nenhum | `ADMIN` |
| `ADMIN_AUDIT` | `/admin/audit` | `AdminAuditScreen` | Nenhum | `ADMIN` |

---

## 3. INVENTÁRIO DE COMPONENTES

Total: **46 componentes React** catalogados.

### 3.1 Acessibilidade (3 componentes)
- `LiveRegion`: Região ARIA viva para leitores de tela com suporte a `polite` e `assertive`.
- `SkipLink`: Link de salto acessível para navegação direta ao conteúdo principal.
- `VisuallyHidden`: Ocultação visual de elementos mantendo legibilidade para tecnologias assistivas.

### 3.2 Base & Primitivas (4 componentes)
- `Button`: Botão com variantes (`primary`, `secondary`, `outline`, `ghost`, `danger`, `kids`), tamanhos (`xs`, `sm`, `md`, `lg`) e estado de carregamento acessível.
- `Badge`: Indicador de estado com variantes (`neutral`, `brand`, `accent`, `warning`, `danger`, `kids`).
- `Card`: Contêiner com suporte a padding proporcional e variantes (`default`, `muted`, `accent`, `interactive`, `kids`).
- `Input`: Campo de texto controlado com suporte a rótulo flutuante, erros e ícones.

### 3.3 Exibição de Dados (5 componentes)
- `Avatar`: Exibição de imagem ou iniciais com indicação de presença e variantes por papel.
- `CredentialChip`: Tag de certificação e validação canônica com ícone institucional.
- `List`: Lista acessível com suporte a itens selecionáveis e divisores.
- `Progress`: Barra de progresso linear e circular (`ProgressBar`) com tokens de cor semânticos.
- `Table`: Tabela tabular com cabeçalhos acessíveis, ordenação e linhas zebradas.

### 3.4 Formulários (4 componentes)
- `Checkbox`: Caixa de seleção estilizada e compatível com teclado.
- `RadioGroup`: Grupo de botões de rádio com navegação por setas.
- `Select`: Menu suspenso de seleção única estilizado com tokens da plataforma.
- `Switch`: Alternador booleano com estados `checked` e `disabled`.

### 3.5 Layout & Estrutura (4 componentes)
- `AppShell`: Estrutura mestre contendo `Header`, `Navigation`, `SkipLink` e barra de personas rápidas.
- `Header`: Cabeçalho institucional com busca, notificações, troca de perfil e seletor de modo.
- `Navigation`: Barra de navegação principal com os 6 pilares (Academia, Mundos, Comunidade, Estúdio, Salas, Perfil) e Admin.
- `ScreenContainer`: Contêiner padrão de página com título, subtítulo, crachá, ações primárias/secundárias, tratamento de loading e empty states.

### 3.6 Navegação (4 componentes)
- `Breadcrumbs`: Trilha de migalhas gerada dinamicamente pelo roteador.
- `DropdownMenu`: Menu flutuante de ações acionado por botão.
- `SegmentedControl`: Controle segmentado com abas contíguas para alternância de filtros.
- `Tabs`: Sistema de abas com suporte a teclado e painéis ARIA.

### 3.7 Modais & Sobreposições (2 componentes)
- `Dialog`: Janela modal com foco travado e fechamento por `Escape`.
- `Drawer`: Painel deslizante lateral para ações secundárias e filtros em telas menores.

### 3.8 Domínio Musical Específico (10 componentes)
- `AudienceToggle`: Alternador de visualização entre Modo Geral (Adulto/Conservatório) e Modo Infantil (Kids).
- `CourseCard`: Card de apresentação de disciplinas com barra de progresso e nível de rigor.
- `FeedCard`: Card de publicações no fórum da comunidade com contadores de respostas.
- `MediaCard`: Card de reprodução e audição de arquivos e manuscritos históricos.
- `PracticeResultCard`: Card com métricas de afinação, precisão rítmica e pontuação de prática.
- `ProfileCard`: Resumo visual de perfil com distintivos de papel e bio.
- `RoomCard`: Card de salas de mestres com contagem de alunos e próxima sessão ao vivo.
- `ScoreContainer`: Visualizador de pauta musical (Canvas) com renderização de notas, armadura e claves.
- `TimelineContainer`: Linha do tempo horizontal/vertical para obras históricas e genealogia.
- `ToolPanel`: Painel de controle de ferramentas utilitárias (metrônomo, afinador).

### 3.9 Modais de Perfil & Portfólio (4 componentes)
- `EditHeaderModal`: Modal para edição de nome, bio, instrumentos e título profissional.
- `ProfileSectionsModal`: Modal para ordenação, ativação e ajuste de visibilidade das 7 lentes do perfil.
- `PublishPortfolioModal`: Modal para publicação de gravação, partitura ou análise no portfólio de evidências.
- `TeacherRoomModal`: Modal para o professor configurar sua sala vinculada ao perfil.

---

## 4. INVENTÁRIO DE SERVIÇOS

O sistema possui **9 serviços de aplicação e infraestrutura**:

1. **`AuthService` (`src/services/application/auth.service.ts`)**:
   - `getActiveSession()`: Recupera a sessão ativa do armazenamento local e recarrega permissões.
   - `loginWithEmail(email, password)`: Autenticação simulada contra a coleção local de usuários.
   - `loginWithGoogle(request)`: Simulação de autenticação federada com criação ou enriquecimento de conta.
   - `register(request)`: Criação de conta, verificação de email do responsável se menor de idade e inicialização de perfil.
   - `completeOnboarding(request)`: Finalização de onboarding e redirecionamento para o dashboard inicial.
   - `switchRole(newRole)`: Troca de persona ativa do usuário para teste de permissões.
   - `checkRouteAccess(path, user)`: Validação de guarda de rotas baseada em capacidades institucionais.
   - `logout()`: Destruição da sessão e token no armazenamento local.

2. **`ProfileService` (`src/services/application/profile.service.ts`)**:
   - `getProfile(userId)` / `getMyProfile()`: Leitura do perfil legado e assert de permissões públicas.
   - `updateMyProfile(updates)`: Atualização de bio, instrumentos e preferências.
   - `getUnifiedProfile(userId)`: Recuperação do perfil canônico com 7 lentes e portfólio.
   - `updateUnifiedProfileHeader(userId, request)`: Atualização de metadados do cabeçalho.
   - `updateSectionConfigs(userId, configs)`: Reordenação e alteração de visibilidade (pública/privada) das seções.
   - `ingestEvidence(request)`: Ingestão de evidência emitida por módulos da Academia, Estúdio ou Salas.
   - `publishPortfolioItem(userId, request)`: Publicação formal de item com vínculo à evidência auditada.
   - `deletePortfolioItem(userId, itemId)`: Remoção de item do portfólio.

3. **`AcademyService` (`src/services/application/academy.service.ts`)**:
   - `getPrograms()`, `getProgram(id)`: Consulta a programas curriculares.
   - `getPaths()`, `getPath(id)`: Consulta a trilhas de aprendizado.
   - `getCourses()`, `getCourse(id)`: Consulta ao catálogo de disciplinas.
   - `getModules(courseId)`, `getModule(id)`: Módulos pedagógicos da disciplina.
   - `getLesson(id)`: Lição interativa com fundamentação teórica e áudio sintetizado.
   - `enrollInCourse(userId, courseId)`: Inscrição formal na disciplina com criação de registro de progresso.
   - `markLessonComplete(userId, courseId, lessonId, durationSeconds)`: Integralização de lição, atualização da barra de progresso percentual e emissão de evento no histórico.
   - `submitActivity(userId, activityId, payload)`: Envio de atividade prática e correção determinística.
   - `submitAssessment(userId, assessmentId, answers)`: Submissão de exame somativo, cálculo de nota, emissão de certificado e registro no livro de histórico acadêmico.
   - `getUserProgress(userId, courseId)`, `listUserEnrollments(userId)`: Acompanhamento de progresso.
   - `getCertificate(id)`, `listUserCertificates(userId)`: Certificados digitais oficiais.
   - `listUserAuditEntries(userId)`: Livro de registro acadêmico imutável.

4. **`ToolService` (`src/services/tool/tool.service.ts`)**:
   - `executeTunerAnalysis(buffer, sampleRate)`: Processamento de pitch via engine de áudio.
   - `executeTheoryAnalysis(notes)`: Análise harmônica e de acordes tonais.
   - `executeScorePlayback(scoreData)`: Geração e síntese de áudio de partituras.
   - `evaluatePracticeSubmission(targetNotes, performedBuffer)`: Comparação de notas esperadas com áudio executado.

5. **`ToolSDK` (`src/services/tool/tool.sdk.ts`)**:
   - Fachada client-side consumida diretamente por componentes React para acionar o `ToolService`.

6. **`EntitlementService` (`src/infrastructure/entitlements/entitlement-service.ts`)**:
   - Avaliação determinística da matriz RBAC e resolução de capacidades efetivas por usuário e papel.

7. **`AnalyticsService` (`src/infrastructure/telemetry/analytics-service.ts`)**:
   - Rastreamento e log de eventos analíticos em buffer de memória e localStorage.

8. **`AuditService` (`src/infrastructure/telemetry/audit-service.ts`)**:
   - Registro imutável de atos institucionais (login, concessão de papéis, emissão de certificados, conclusões de cursos).

9. **`FeatureFlagService` (`src/infrastructure/feature-flags/feature-flag-service.ts`)**:
   - Habilitação ou desativação de recursos em tempo real.

---

## 5. INVENTÁRIO DE APIS

Atualmente, o repositório define a abstração do cliente HTTP (`src/infrastructure/api/api-client.ts`) apontando para `/api/v1`, mas **nenhum servidor backend Node ou Python está em execução**.

### Status dos Endpoints Planejados vs Realidade:
- `/api/v1/auth/*` (login, registro, refresh, oauth): **Não existe no backend**. Todo o fluxo é interceptado e processado no navegador pelo `AuthService` utilizando `LocalStorageAdapter`.
- `/api/v1/profile/*` (leitura, atualização, portfólio): **Não existe no backend**. Processado via `ProfileService` e `PersistentUnifiedProfileRepository`.
- `/api/v1/academy/*` (cursos, lições, submissões de exames): **Não existe no backend**. Processado via `AcademyService` e `PersistentAcademyRepository`.
- `/api/v1/engines/*` (análise remota de teoria em Python, DSP em C++/WebAssembly): **Não existe no backend**. Executado pelos adapters de fallback locais (`RuleBasedTheoryEngineAdapter`, `WebAudioEngineAdapter`).

---

## 6. INVENTÁRIO DE BANCO / PERSISTÊNCIA

A persistência do sistema está operando inteiramente via camada de abstração `StorageAdapter` com implementação `LocalStorageAdapter` (chave com prefixo `amd_`):

1. `amd_users_collection`: Coleção de usuários cadastrados, inicializada com fundadores e personas de teste.
2. `amd_profiles_collection`: Coleção de perfis legados.
3. `amd_canonical_unified_profiles_v1`: Coleção de perfis unificados de 7 lentes com suporte a portfólio.
4. `amd_canonical_evidences_collection_v1`: Repositório de evidências canônicas geradas pelo sistema.
5. `amd_current_auth_session`: Sessão ativa, contendo token JWT simulado e lista de permissões.
6. `amd_audit_events_immutable_log`: Log de auditoria persistido localmente limitado a 500 registros.
7. `amd_academy_programs`, `amd_academy_paths`, `amd_academy_courses`, etc.: Coleções canônicas da Academia criadas sob demanda a partir do `seed-academy-content.ts`.
8. `amd_user_course_progress`: Registro de matrícula e lições finalizadas por usuário.

**Gaps Críticos de Persistência:**
- Não há banco de dados relacional Cloud SQL / PostgreSQL provisionado.
- Não há Firestore ou banco de documentos em nuvem conectado.
- Limpeza de cache do navegador destrói o progresso do usuário e certificados gerados.

---

## 7. INVENTÁRIO DE AUTENTICAÇÃO

O sistema possui uma camada de autenticação frontend completa, estruturada e aderente à especificação:

- **Personas Pré-configuradas (Seeds):**
  - `usr_founder_1` (`office.alinesilva@gmail.com` / `alinealv.silv@gmail.com`): Fundadora com papel `ADMIN` irrogável, acesso a todos os consoles e bypass de restrições.
  - `usr_evaluator_aluno` (`aluno@academia.mus.br`): Estudante regular com permissões acadêmicas padrão.
  - `usr_evaluator_prof` (`professor@academia.mus.br`): Professor com capacidade de criar salas e avaliar submissões.
- **Simulação de Google OAuth (`GoogleOAuthModal.tsx`):**
  - Modal estilizado que simula o fluxo federado do Google Identity Services, permitindo alternar instantaneamente entre contas ou inserir e-mail personalizado.
- **Proteção Infantil (Doc 32):**
  - `RegisterScreen` solicita e valida o e-mail do responsável caso a data de nascimento indique menoridade.
- **Sessão & Tokens:**
  - Token JWT mock assinado simbolicamente no cliente (`base64`), com expiração de 24 horas e recarga automática de entitlements.
- **Guarda de Rotas:**
  - `AppRouterOutlet` intercepta rotas `/admin/*` e `/rooms/create`, exibindo tela formal de "Acesso Restrito" caso o usuário não possua o papel exigido.

---

## 8. INVENTÁRIO DE TELAS EXISTENTES (36 TELAS)

Todas as 36 telas estão implementadas em `/src/ui/screens/` e montadas no roteador:

### 8.1 Núcleo & Utilidades (6 telas)
1. `OverviewScreen.tsx`: Dashboard inicial com atalhos para os 6 pilares, status de estudo, atividade recente e chamada de onboarding.
2. `DesignSystemCatalog.tsx`: Catálogo vivo dos componentes de design system, tokens de cor, tipografia e formulários.
3. `SearchScreen.tsx`: Busca global com suporte a filtros por tipo de entidade (cursos, partituras, salas, tópicos).
4. `NotificationsScreen.tsx`: Central de alertas de tarefas, convites para recitais e avisos acadêmicos.
5. `SettingsScreen.tsx`: Preferências de interface, idioma, privacidade e áudio.
6. `HelpScreen.tsx`: Base de conhecimento institucional, manual do aluno e FAQ.

### 8.2 Autenticação & Entrada (5 telas)
7. `LoginScreen.tsx`: Tela de autenticação por e-mail/senha ou Google OAuth com suporte a alternância rápida de personas.
8. `RegisterScreen.tsx`: Formulário de cadastro com seleção de papel, data de nascimento e fluxo de proteção de menor.
9. `RecoveryScreen.tsx`: Recuperação de senha por link institucional.
10. `OAuthCallbackScreen.tsx`: Receptor de callback federado com processamento de token.
11. `OnboardingScreen.tsx`: Jornada guiada em 4 passos para calibrar objetivos musicais, nível de experiência e instrumentos.

### 8.3 Academia Musical (11 telas)
12. `AcademyHomeScreen.tsx`: Entrada da Academia com destaque para trilhas recomendadas, disciplinas em andamento e programas acadêmicos.
13. `AcademyCatalogScreen.tsx`: Catálogo completo de disciplinas com filtros por nível (Fundamental, Intermediário, Avançado), modalidade e busca textual.
14. `AcademySearchScreen.tsx`: Mecanismo de busca avançada com filtros cruzados de competências e carga horária.
15. `ProgramDetailScreen.tsx`: Apresentação formal de programa acadêmico plurianual (ex: Teoria & Percepção Tonal).
16. `PathDetailScreen.tsx`: Visão encadeada da trilha pedagógica e pré-requisitos sequenciais.
17. `CourseDetailScreen.tsx`: Apresentação curricular completa do curso (objetivos, ementa de módulos, corpo docente, bibliografia e botão de matrícula).
18. `ModuleDetailScreen.tsx`: Detalhamento das lições e atividades de uma unidade didática específica.
19. `LessonReaderScreen.tsx`: Leitor de lição interativo com texto formatado, citações históricas, síntese de áudio de demonstrações, tocador e conclusão de lição.
20. `ActivityScreen.tsx`: Interface de exercícios práticos com múltipla escolha, ditado auditivo e resolução de intervalos.
21. `AssessmentScreen.tsx`: Exame formal de fim de módulo com cronômetro, pontuação e bloqueio de consulta.
22. `AssessmentResultScreen.tsx`: Gabarito comentado pós-exame com análise questão por questão, percentual obtido e atestado de aprovação.
23. `CourseCompletionScreen.tsx`: Painel comemorativo de integralização de disciplina com resumo de carga horária e emissão de certificado.
24. `CertificateScreen.tsx`: Diploma acadêmico canônico para impressão/PDF com código de autenticação, hash SHA-256 e competências atestadas.
25. `MyLearningScreen.tsx`: Painel pessoal do aluno com disciplinas matriculadas, barras de progresso e atalho rápido para continuar lições.
26. `AcademicHistoryScreen.tsx`: Livro de registro imutável de atos acadêmicos com auditoria de lições e certificados.

### 8.4 Mundos Musicais & Atlas (3 telas)
27. `WorldsAtlasScreen.tsx`: Atlas histórico-geográfico das eras da música (Barroco, Classicismo, Romantismo, Modernismo, Música Brasileira).
28. `WorkDetailScreen.tsx`: Ficha analítica detalhada de obra canônica (ex: Sonata BWV 1001 de Bach) com contexto, partitura e manuscrito.
29. `MusicGraphScreen.tsx`: Grafo genealógico e topológico de influências entre compositores e mestres.

### 8.5 Comunidade & Fórum (3 telas)
30. `CommunityFeedScreen.tsx`: Linha do tempo de tópicos de discussão musicológica, dúvidas e análises.
31. `TopicDetailScreen.tsx`: Fio de discussão completo com respostas de alunos e moderação docente.
32. `EventsDirectoryScreen.tsx`: Calendário de recitais ao vivo, masterclasses virtuais e bancas.

### 8.6 Estúdio & Ferramentas (4 telas)
33. `StudioHubScreen.tsx`: Centro de ferramentas e projetos do aluno.
34. `DawProjectScreen.tsx`: Interface de DAW com pistas de áudio/MIDI, controles de volume, pan, solo, mute e barra de transporte.
35. `ScoreEditorScreen.tsx`: Editor gráfico de partituras em pauta com armaduras, compassos e claves.
36. `VoiceEarLabScreen.tsx`: Laboratório de percepção auditiva e afinador cromático com detecção de pitch em tempo real.

### 8.7 Salas & Mestres (3 telas)
37. `RoomsDirectoryScreen.tsx`: Diretório de salas de aula e cátedras de professores.
38. `RoomDetailScreen.tsx`: Sala de aula virtual com quadro de avisos, tarefas pendentes e lista de alunos.
39. `CreateRoomScreen.tsx`: Painel do professor para abertura de nova turma ou oficina.

### 8.8 Perfil Único & Portfólio (3 telas)
40. `ProfileOverviewScreen.tsx`: Perfil público e privado com projeção das 7 lentes institucionais (Academia, Prática, Estúdio, Mundos, Comunidade, Salas, Docente).
41. `PortfolioScreen.tsx`: Portfólio formal de evidências com gravações, partituras e certificados vinculados.
42. `EditProfileScreen.tsx`: Formulário de personalização de dados biográficos, instrumentos e configurações de privacidade.

### 8.9 Governança & Admin (6 telas)
43. `AdminDashboardScreen.tsx`: Visão executiva da plataforma com métricas de sistema e atalhos de governança.
44. `AdminUsersScreen.tsx`: Gestão de usuários, suspensão e atribuição de papéis (Aluno, Músico, Professor, Admin).
45. `AdminEnginesScreen.tsx`: Painel de telemetria dos motores de processamento musical (áudio, teoria, notação).
46. `AdminContentScreen.tsx`: Homologação e gestão de matrizes curriculares.
47. `AdminModerationScreen.tsx`: Fila de moderação de conteúdo e proteção comunitária.
48. `AdminAuditScreen.tsx`: Painel de visualização do livro-razão imutável de auditoria.

---

## 9. INVENTÁRIO DE MOCKS

Existem vários mocks em operação que simulam a existência de serviços externos e atrasos de rede:

1. **Simulação de Latência de Rede:** Múltiplas funções em `auth.service.ts`, `profile.service.ts` e `academy.service.ts` utilizam `new Promise(resolve => setTimeout(resolve, 300))` para emular requisições assíncronas ao backend.
2. **Mock de Google OAuth (`GoogleOAuthModal.tsx`):** Não abre popup real do Google nem obtém tokens da API do Google Workspace; gera internamente um token fictício `mock_google_id_token_...`.
3. **Mock de Áudio DSP (`web-audio.adapter.ts` e `VoiceEarLabScreen.tsx`):** Em telas como `VoiceEarLabScreen.tsx`, ao clicar no microfone, o estado de afinação alterna entre strings fixas (`C4 (261.63 Hz)` e `A4 (440.0 Hz)`) em vez de conectar o stream do microfone ao WebAudio Analyzer.
4. **Mock de DAW (`DawProjectScreen.tsx`):** O tocador de DAW altera o booleano `isPlaying` e o relógio de tempo, mas não instancia nós WebAudio reais para tocar os stems das pistas.
5. **Mock de Partitura (`ScoreEditorScreen.tsx`):** Desenha a partitura visualmente em um Canvas estático através do `ScoreContainer`, mas o botão de salvar executa um `alert()` e não serializa um arquivo MusicXML real.
6. **Mock de Criação de Salas (`CreateRoomScreen.tsx`):** Dispara um `setTimeout` de 400ms e redireciona para a lista sem adicionar o registro a um repositório centralizado de salas.
7. **Mock de Discussões e Respostas (`TopicDetailScreen.tsx`):** Permite adicionar respostas ao estado local React do componente, mas as respostas são perdidas ao sair da página por não estarem conectadas a um repositório persistente de comunidade.

---

## 10. INVENTÁRIO DE DADOS FICTÍCIOS

1. **Catálogo de Cursos da Academia:** O conteúdo em `src/data/seed-academy-content.ts` e `course.repository.ts` é fundamentado em dados reais de altíssima qualidade histórica (Lectures 1 & 2 da Universidade de Edimburgo, BWV 1001 de Bach), porém é restrito a uma única disciplina inicial expandida.
2. **Obras do Atlas Musical (`WorldsAtlasScreen.tsx`):** A lista de 5 obras (Sonata BWV 1001, Don Giovanni, Balada nº 1 de Chopin, Sagração da Primavera, Choro nº 1 de Villa-Lobos) está codificada diretamente no corpo do componente.
3. **Grafo Musical (`MusicGraphScreen.tsx`):** Nós com Buxtehude, Bach, C.P.E. Bach, Mozart e Beethoven codificados em um array literal.
4. **Salas de Aula (`RoomsDirectoryScreen.tsx`):** Turmas "Cátedra Chopin" e "Oficina de Contraponto Rigoroso" codificadas em array local.
5. **Eventos Comunitários (`EventsDirectoryScreen.tsx`):** Masterclasses e recitais codificados estaticamente.
6. **Usuários do Admin (`AdminUsersScreen.tsx`):** Três usuários estáticos (Clara Wieck Schumann, Aline Silva, Johannes Brahms) definidos no próprio componente ao invés de buscar do `UserRepository`.
7. **Eventos do Admin Audit (`AdminAuditScreen.tsx`):** Array fixo de 2 eventos de auditoria ao invés de consultar `auditRepository.listRecent()`.

---

## 11. INVENTÁRIO DE FUNCIONALIDADES PARCIALMENTE IMPLEMENTADAS

1. **Academia Musical Completa:**
   - Possui todo o modelo de dados em `domain/academy.ts`, base em `seed-academy-content.ts`, orquestração em `academy.service.ts` e repositório em `academy.repository.ts`.
   - **Gap Atual:** As telas recém-criadas (`AssessmentScreen`, `ActivityScreen`, `AssessmentResultScreen`, `CertificateScreen`, `CourseCompletionScreen`, `AcademicHistoryScreen`) foram escritas com divergências pontuais nas propriedades dos contratos (ex: `maxScore`, `validationRule`, importações de `Certificate`, `updatedAt` em `UserAcademyProgress`), impedindo o `tsc` estrito de compilar sem erros de tipagem.
2. **Perfil Unificado de 7 Lentes:**
   - Possui repositório detalhado (`unified-profile.repository.ts`) e serviço (`profile.service.ts`).
   - A tela `ProfileOverviewScreen` lê dados do serviço, mas a renderização de submissões de áudio e evidências depende de mocks inseridos manualmente.
3. **Engine Gateway & Ferramentas:**
   - Arquitetura de adapters e interfaces formalmente modelada em `adapters/engines/`.
   - Adapters reais em JavaScript/WebAudio funcionais, porém faltam os bridges remotos para processamento avançado via backend Python.
4. **Governança & Admin:**
   - Telas de UI completas e funcionais em layout, mas consumindo arrays mock locais em vez de conectar com `userRepository`, `auditRepository` e `academyRepository`.

---

## 12. INVENTÁRIO DE FUNCIONALIDADES INEXISTENTES

1. **Backend Server (Node.js API):** Não há processo Express ou Fastify executando endpoints HTTP `/api/v1/*`.
2. **Engine Python de Musicologia & SATB:** O microsserviço Python de teoria computacional especificado em `docs/harness/20_PYTHON_ENGINE_ARCHITECTURE.md` não foi criado nem empacotado.
3. **Persistência em Nuvem (PostgreSQL / Firestore):** Não há banco de dados distribuído configurado; toda a retenção é baseada em `localStorage` do navegador do cliente.
4. **Comunicação em Tempo Real (WebSockets / WebRTC):** As salas de aula virtuais em `src/ui/screens/rooms/` não possuem conexão WebRTC de vídeo/áudio ou WebSocket para chat bidirecional ao vivo.
5. **Conversor / Exportador MusicXML Completo:** A importação e exportação de partituras para softwares profissionais de notação ainda não possui o motor de serialização XML completo.

---

## 13. IDENTIFICAÇÃO DE DUPLICAÇÕES

1. **Repositórios de Cursos Concorrentes:**
   - `src/repositories/course.repository.ts`: Modelo antigo com `Course`, `CourseModule`, `Lesson`.
   - `src/repositories/academy.repository.ts`: Modelo moderno completo com `AcademyCourse`, `AcademyModule`, `AcademyLesson`, `Program`, `LearningPath`, `AcademyActivity`, `AcademyAssessment`.
   - *Impacto:* Risco de dessincronização de progresso e duplicidade de dados seed.
2. **Repositórios de Perfis Concorrentes:**
   - `src/repositories/profile.repository.ts`: Perfil legado simplificado (`Profile`).
   - `src/repositories/unified-profile.repository.ts`: Perfil unificado de 7 lentes com suporte a evidências e portfólio (`UnifiedProfileRecord`).
3. **Definições de Tipos em Paralelo:**
   - Tipos em `src/domain/types.ts` (`Course`, `Lesson`, `Profile`) concorrem com tipos em `src/domain/academy.ts` e `src/domain/profile.ts`.

---

## 14. IDENTIFICAÇÃO DE DÍVIDA ARQUITETURAL

1. **Erros de Tipagem TypeScript na Camada Academia:**
   - Conforme demonstrado pelo `npm run typecheck`, as telas recém-geradas da Academia contêm erros de compatibilidade de interface com `domain/academy.ts` e `academy.service.ts`.
2. **Desconexão do `ApiClient`:**
   - `src/infrastructure/api/api-client.ts` está configurado para efetuar requisições REST contra `/api/v1`, mas todos os serviços chamam diretamente os repositórios locais em vez de passar por uma camada de rede desacoplada ou um mock-service worker (MSW).
3. **Telas Acopladas a Mocks Locais:**
   - Telas de Mundos, Comunidade, Salas e Admin definem dados fixos dentro do próprio arquivo `.tsx`, ignorando os repositórios e serviços já construídos.

---

## 15. IDENTIFICAÇÃO DE GAPS ENTRE FRONTEND E BACKEND

| Domínio | Frontend Atual | Backend Necessário | Gravidade do Gap |
| :--- | :--- | :--- | :--- |
| **Autenticação** | LocalStorage + mock JWT | Auth Server OAuth 2.0 / Firebase Auth | Alta (sessão volátil) |
| **Persistência de Cursos** | LocalStorage (`amd_...`) | Cloud SQL (PostgreSQL) com migrações | Alta (perda de progresso) |
| **Correção de Áudio** | WebAudio heurístico simples | Microsserviço Python com librosa / essentia | Média (limitação de precisão) |
| **Partituras / Notação** | Canvas simplificado 2D | Engine MusicXML/VexFlow/Verovio serializado | Média |
| **Salas & Aulas ao Vivo**| Layout de cards e tarefas | Servidor WebRTC / LiveKit / WebSockets | Alta (ausência de sincronia) |
| **Certificados Oficiais** | Hash gerado via SHA-256 local | Assinatura digital com chave privada institucional | Média |
