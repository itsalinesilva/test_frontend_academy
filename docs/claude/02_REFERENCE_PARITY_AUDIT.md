# 02 — AUDITORIA DE PARIDADE ESTRUTURAL

**Missão:** COMANDO 2 · etapa 2
**Data:** 2026-09-16
**Medido contra:** `docs/claude/wireframes/` (especificação normativa, etapa 1)
**Método:** cada uma das 72 telas pontuada programaticamente contra o wireframe do seu domínio — forma de página, regiões fixas, colunas, componentes exigidos, 5 estados, origem de dados.
**Não altera o produto.**
**Revisão 2 (2026-09-16):** acrescentadas as §§7–9 — cobertura nominal das 17 dimensões exigidas pelo COMANDO 2, formato REFERENCE/CURRENT, e remedição do Admin sob a especificação corrigida (`wireframes/07`).

**Pontuação:** `FULL` ≥ 75 · `PARTIAL` 40–74 · `ABSENT` < 40

---

## 1. O ACHADO PRINCIPAL

A paridade não falhou uniformemente. Ela falhou **exatamente onde a estrutura era exigida**:

| Forma de página | O que exige | Telas | Forma correta | `FULL` | Média |
| :--- | :--- | ---: | ---: | ---: | ---: |
| **A** `FOCUS` | 1 coluna — **nada** | 19 | 17 | **15** | **81** |
| **B** `CATALOG` | filtros fixos + resultados | 27 | 8 | **0** | **26** |
| **C** `DETAIL` | hero + abas fixas + trilho fixo | 20 | 7 | **2** | **35** |
| **D** `WORKSPACE` | painéis + área + transporte | 6 | **0** | **0** | **26** |

> **Leitura:** onde a tela é uma coluna centrada, o projeto acerta — 81/100, 15 de 19 aprovadas. Onde a tela precisa de grade, trilho fixo e abas, o projeto desaba — 26 a 35 de 100, e **zero aprovações** nas Formas B e D.
>
> Isso não é um problema de capricho, de gosto ou de capacidade. É a assinatura precisa de uma **peça de infraestrutura ausente**: não existe primitiva de layout com colunas. `ScreenContainer` entrega título, subtítulo, badge e ações — e nada mais. Sem ela, toda tela que precisava de estrutura improvisou um empilhamento vertical.
>
> **Corolário:** criar `PageLayout` não é um item entre outros. É a condição de possibilidade de 53 das 72 telas.

**Números globais:** `FULL` 17 · `PARTIAL` 19 · `ABSENT` 36 · forma correta 32/72 · **`sticky` 0/72** · **`Tabs` 0/72** · média de estados **0,6 de 5**.

---

## 2. PLACAR POR DOMÍNIO

| Domínio | Média | Telas | Referência | Veredito |
| :--- | ---: | ---: | :--- | :--- |
| Auth | **84** | 4 | — | Reescrito no Bloco 0 |
| Academy | **60** | 22 | Coursera | Melhor domínio; falha nas telas estruturais |
| Settings | 50 | 1 | — | |
| Rooms | 46 | 3 | Skool | |
| Worlds | 43 | 3 | — | |
| Practice | **41** | 16 | Duolingo + Astra | Serviço real, linguagem visual ausente |
| Profile | **36** | 3 | LinkedIn | A melhor tela do repo tira 11/100 na forma |
| Overview | 23 | 1 | — | |
| Studio | **20** | 4 | DAW | |
| Notifications | 11 | 1 | — | |
| **Admin** | **9** | 6 | — | Pior domínio |
| Search | 7 | 1 | — | |
| Community | **6** | 3 | Skool | |
| Score | **4** | 1 | Dorico/Sibelius | Pior tela |

---

## 3. AUDITORIA POR DOMÍNIO

### 3.1 ACADEMY — 60/100 · referência Coursera

| Tela | Pts | Status | Forma | Gap principal | Prio |
| :--- | ---: | :--- | :--- | :--- | :---: |
| `CourseCurriculumScreen` | 15 | ABSENT | A≠**C** | Sem trilho, sem `LockedState`, 0 estados; rota não resolve `:id` | P0 |
| `AcademicHistoryScreen` | 19 | ABSENT | A≠**B** | Sem `DataGrid`; livro-razão como lista solta | P1 |
| `AcademyHomeScreen` | 19 | ABSENT | A≠**C** | Sem trilho de progresso, sem abas, sem `CourseCard`/`LessonCard` | P0 |
| `CourseProgressScreen` | 35 | ABSENT | B≠**C** | Sem trilho; rota não resolve `:id` | P1 |
| `ModuleDetailScreen` | 43 | PARTIAL | A≠**C** | Sem trilho | P1 |
| `CategoryDetailScreen` | 45 | PARTIAL | C≠**B** | Sem painel de filtros; rota não resolve `:id` | P1 |
| `AcademyCatalogScreen` | 48 | PARTIAL | B ok | Filtros sem `sticky`; sem `CourseCard`; sem contagem por faceta | P1 |
| `MyLearningScreen` | 48 | PARTIAL | B ok | Sem `Tabs` (Em andamento/Concluídos/Certificados) | P1 |
| `LessonReaderScreen` | 50 | PARTIAL | C ok | **Sem sumário lateral fixo** — é o que faz parecer aula; sem `Staff`; CTA de prática genérico | **P0** |
| `AcademySearchScreen` | 56 | PARTIAL | B ok | Filtros não fixos, não refletidos na URL | P2 |
| `CourseDetailScreen` | 58 | PARTIAL | C ok | **Sem abas, sem trilho fixo de matrícula** — a tela mais importante do domínio | **P0** |
| `AcademicProfileScreen` | 60 | PARTIAL | B ok | Sem densidade operacional | P2 |
| `AcademySearchResultsScreen` | 60 | PARTIAL | B ok | Sem facetas | P2 |
| `InteractiveLessonScreen` | 66 | PARTIAL | C ok | Sem sumário; rota não resolve `:id` | P1 |
| `PathDetailScreen` · `ProgramDetailScreen` | 78 | FULL | C ok | Faltam estados | P2 |
| `ActivityScreen` `CourseCompletionScreen` `AcademyQuizScreen` `AssessmentScreen` `AssessmentResultScreen` `CertificateScreen` | 85–93 | FULL | A ok | Estados incompletos | P2 |

**Diagnóstico:** as 6 telas aprovadas são todas Forma A. As duas que definem a experiência Coursera — `CourseDetailScreen` e `LessonReaderScreen` — estão em `PARTIAL` porque **não têm abas nem trilho fixo**. A hierarquia de dados está correta; a composição espacial não.

---

### 3.2 PRACTICE — 41/100 · referências Duolingo + Astra Trainer

| Tela | Pts | Status | Forma | Gap principal | Prio |
| :--- | ---: | :--- | :--- | :--- | :---: |
| `PracticeHomeScreen` | 11 | ABSENT | B≠**C** | Sem `ProgressRing`, `XPIndicator`, `PracticeCard`, `Tabs`, trilho | **P0** |
| `MicroSkillScreen` | 15 | ABSENT | B≠**C** | Sem `ProgressRing` | P1 |
| `PracticeHistoryScreen` | 15 | ABSENT | A≠**B** | Sem `DataGrid` | P1 |
| `SkillDetailScreen` | 15 | ABSENT | A≠**C** | Sem `SkillNode`, `ProgressRing`, trilho | P1 |
| `SkillTreeScreen` | 15 | ABSENT | B≠**C** | **Sem `SkillNode` e sem caminho visual** — é a imagem-assinatura do Duolingo | **P0** |
| `ExerciseSessionScreen` | 21 | ABSENT | A≠**D** | **Não é tela cheia**; sem `Waveform`/`Tuner`; 1.255 linhas; 6 arrays fixos | **P0** |
| `RankingScreen` | 31 | ABSENT | A≠**B** | Dados fabricados (Bach, Chopin com XP); exige KV | P1 |
| `PracticeProfileScreen` | 35 | ABSENT | A≠**C** | Sem trilho | P2 |
| `PracticeScreen` | 37 | ABSENT | A≠**D** | Duplicata legada de `PracticeHomeScreen` | P1 |
| `MasteryScreen` | 40 | PARTIAL | B ok | Sem `DataGrid`, sem mapa de calor | P1 |
| `ImmediateFeedbackScreen` | 45 | PARTIAL | A≠**D** | Deve ser faixa sobre a sessão, não tela separada | P1 |
| `DailyGoalScreen` · `StreakScreen` | 61 | PARTIAL | A ok | Sem `ProgressRing`; dados de ofensiva fabricados | P1 |
| `AttemptDetailScreen` `ExerciseDetailScreen` `PracticeResultScreen` | 85 | FULL | A ok | **0 estados**; diagnóstico Astra ausente | P2 |

**Diagnóstico:** o serviço de Practice tem 656 linhas de lógica real. A linguagem visual da referência está **inteiramente nos órfãos**: `SkillNode`, `XPIndicator`, `ProgressRing`, `PracticeCard`, `LockedState` — cinco componentes construídos e nunca usados. **0 de 16 telas têm estado de carregamento**, apesar de 15 buscarem dados assíncronos. E a medição Astra não existe: `pitchDeviationCents` é `0` ou `100`.

---

### 3.3 PROFILE — 36/100 · referência LinkedIn

| Tela | Pts | Status | Forma | Gap principal | Prio |
| :--- | ---: | :--- | :--- | :--- | :---: |
| `ProfileOverviewScreen` | 11 | ABSENT | A≠**C** | Sem `ProfileHeader`, `Tabs`, `SegmentedControl`, `Credential`, trilho, `sticky` | **P0** |
| `PortfolioScreen` | 37 | ABSENT | B ok | Sem `Tabs`, sem `Modal`, sem filtros | P1 |
| `EditProfileScreen` | 60 | PARTIAL | B≠**A** | Salvamento monolítico; sem prévia de visitante | P2 |
| **`/profile/:userId`** | — | **MISSING** | — | **Não existe.** Impossível ver o perfil de outra pessoa | **P0** |

**Diagnóstico — o paradoxo mais instrutivo do repositório.** `ProfileOverviewScreen` é a tela com **maior riqueza funcional** do projeto: 672 linhas, 19 abas reais, clusters, visibilidade por seção. E tira **11 de 100**. Motivo: implementa as 19 abas **à mão**, com scroller próprio, sem `Tabs`, sem `ProfileHeader`, sem trilho lateral e sem um único `sticky`. O conteúdo é de LinkedIn; a composição espacial é de uma página empilhada.

E a rota de perfil de terceiros não existe — o que torna a premissa "LinkedIn de músicos" estruturalmente vazia, já que ninguém vê ninguém.

---

### 3.4 ROOMS & COMMUNITY — 46 e 6/100 · referência Skool

| Tela | Pts | Status | Forma | Gap principal | Prio |
| :--- | ---: | :--- | :--- | :--- | :---: |
| `EventsDirectoryScreen` | 4 | ABSENT | A≠**B** | Sem `EventCard`; hardcoded; `alert()` na inscrição | P1 |
| `CommunityFeedScreen` | 7 | ABSENT | A≠**B** | Sem `ForumCard`; hardcoded; sem filtros | P1 |
| `RoomDetailScreen` | 8 | ABSENT | A≠**C** | **Sem as 8 abas** (Mural/Sala/Tarefas/Membros/Calendário/Ranking) — é o Skool inteiro | **P0** |
| `TopicDetailScreen` | 8 | ABSENT | A≠**C** | Respostas somem ao sair da página | P1 |
| `RoomsDirectoryScreen` | 52 | PARTIAL | B ok | Filtros não fixos; hardcoded | P1 |
| `CreateRoomScreen` | 77 | FULL | A ok | `setTimeout` sem persistência | P1 |

**Diagnóstico:** `RoomDetailScreen` tira 8/100. O Skool **é** a navegação por abas dentro do espaço do professor — e não há uma aba. O ciclo tarefa → submissão → correção → parecer → evidência, que é a razão de existir da Cátedra, não existe em nenhuma forma. **Bloqueado pela camada de estado compartilhado** (decisão E).

---

### 3.5 STUDIO & SCORE — 20 e 4/100 · referências DAW e Dorico

| Tela | Pts | Status | Forma | Gap principal | Prio |
| :--- | ---: | :--- | :--- | :--- | :---: |
| `ScoreScreen` | 4 | ABSENT | A≠**B** | Sem `Staff`, sem filtros, hardcoded | P1 |
| `DawProjectScreen` | 18 | ABSENT | A≠**D** | Sem `MixerChannel`, `PianoRoll`, `Track`, `Timeline`, `Recorder`; sem áudio real | **P0** |
| `ScoreEditorScreen` | 18 | ABSENT | A≠**D** | Sem `NotationToolbar`, sem `Staff`, **sem entrada de nota**, 3 `alert()` | **P0** |
| `VoiceEarLabScreen` | 18 | ABSENT | A≠**D** | Sem `Tuner`, sem `Waveform`, **sem microfone** — 100% simulado | **P0** |
| `StudioHubScreen` | 27 | ABSENT | A≠**B** | Hardcoded | P2 |

**Diagnóstico:** **nenhuma das 6 telas de Forma D adota a forma.** São páginas comuns fingindo ser ferramentas. `DawProjectScreen` precisa de 5 componentes que existem e estão órfãos. `ScoreEditorScreen` chama `alert('Exportar MusicXML')` enquanto `exportToMusicXml()` real está pronto no motor. `VoiceEarLabScreen` alterna duas strings fixas enquanto o detector de altura por autocorrelação — correto e testado — está desconectado.

---

### 3.6 ADMIN — 9/100 · pior domínio

Seis telas, **três com 0 pontos**. Nenhuma acessa serviço; todas usam arrays fixos; nenhuma usa `DataGrid` (237 linhas, órfão); nenhuma tem estado; 6 `alert()`. `AdminUsersScreen` lista usuários fixos em vez de `userRepository.listAll()`; `AdminAuditScreen` mostra 2 eventos fixos enquanto o endpoint `/api/v1/admin/audit-logs` **funciona e é autenticado** desde o Bloco 0.

---

### 3.7 WORLDS, OVERVIEW, SEARCH e utilitárias

| Tela | Pts | Gap |
| :--- | ---: | :--- |
| `SearchScreen` | 7 | Sem `Tabs` por tipo de entidade; hardcoded |
| `NotificationsScreen` | 11 | Sem `Tabs`; hardcoded |
| `HelpScreen` | 20 | `alert()` no suporte |
| `OverviewScreen` | 23 | Forma A onde o wireframe pede C; hardcoded |
| `WorldsAtlasScreen` | 27 | Contadores fabricados ("142 obras" sobre 5 registros) |
| `MusicGraphScreen` | 37 | Grafo hardcoded |
| `WorkDetailScreen` | 66 | Melhor de Worlds; sem proveniência resolvida |
| `SettingsScreen` | 50 | Sem `Tabs` apesar de ter 4 seções |

---

## 4. COMPONENTES EXIGIDOS PELO WIREFRAME E AUSENTES

| Componente | Telas que deveriam usar | Situação |
| :--- | ---: | :--- |
| `Tabs` | **10** | existe · **0 usos** |
| `DataGrid` | **7** | **órfão** |
| `ProgressRing` | 5 | **órfão** |
| `LockedState` | 4 | **órfão** |
| `CourseCard` | 3 | existe, subutilizado |
| `Staff` | 3 | existe, subutilizado |
| `ForumCard` | 3 | **órfão** |
| `Waveform` · `Tuner` · `SkillNode` | 2 cada | órfão / existe |
| `ProfileHeader` `Credential` `SegmentedControl` `Modal` `MixerChannel` `PianoRoll` `Recorder` `NotationToolbar` `Track` `Timeline` `EventCard` `LessonCard` `XPIndicator` `PracticeCard` | 1 cada | maioria **órfã** |

**Total: 24 componentes distintos exigidos e não usados em 57 pontos de aplicação.**

---

## 5. PLANO DE CORREÇÃO EM ORDEM DE DEPENDÊNCIA

### P0 — bloqueia tudo

| # | Mudança | Destrava |
| :--- | :--- | ---: |
| 1 | **Criar `PageLayout`** com as 4 formas, grade de 12 colunas, regiões `sticky`, colapso responsivo, marcos ARIA e orquestração dos 5 estados | **53 telas** |
| 2 | Adotar `Tabs` e `SegmentedControl` | 10 telas |
| 3 | Reconectar os 24 componentes exigidos | 57 pontos |
| 4 | Implementar os 5 estados via `PageLayout` | 72 telas |

### P0 — telas que definem o reconhecimento da referência

| # | Tela | Mudança |
| :--- | :--- | :--- |
| 5 | `CourseDetailScreen` | Forma C: hero bordô, abas fixas, trilho de matrícula fixo, acordeão da grade com `LockedState` |
| 6 | `LessonReaderScreen` | Sumário lateral fixo, `Staff`, CTA contextual para a habilidade específica |
| 7 | `ProfileOverviewScreen` | `ProfileHeader`, `Tabs`, `SegmentedControl`, trilho fixo |
| 8 | **Criar `/profile/:userId`** | Projeção pública respeitando visibilidade por seção |
| 9 | `SkillTreeScreen` | `SkillNode` + caminho visual SVG + `LockedState` |
| 10 | `PracticeHomeScreen` | Forma C com `ProgressRing`, `XPIndicator`, `PracticeCard` |
| 11 | `ExerciseSessionScreen` | Forma D tela cheia; quebrar as 1.255 linhas |
| 12 | `RoomDetailScreen` | As 8 abas do Skool *(depende do KV)* |
| 13 | `DawProjectScreen` `ScoreEditorScreen` `VoiceEarLabScreen` | Forma D + reconectar componentes + motores reais |

### P1 — integridade de dados e verdade

| # | Mudança |
| :--- | :--- |
| 14 | Ligar as 6 telas de Admin aos repositórios e ao endpoint de auditoria já autenticado |
| 15 | Remover **todos** os dados fabricados (ranking com compositores mortos, áudio de chuva, `storage.academia.mus.br`, "142 obras") |
| 16 | Substituir os 19 `alert()` por fluxos reais ou por escopo declarado |
| 17 | Criar repositórios e serviços de Community, Rooms, Worlds, Studio, Score |
| 18 | Corrigir as 6 rotas que não resolvem parâmetros e remover os 18 fallbacks que as mascaram |

### P2 — refino

Densidade por domínio · facetas com contagem real · filtros na URL · tema escuro no Estúdio · tipografia institucional · migração de tokens · pt-BR na navegação.

---

## 6. VEREDITO

**Nenhum domínio atinge paridade estrutural.** O melhor (Academy, 60/100) acerta a hierarquia de dados e erra a composição espacial nas duas telas que mais importam. O pior (Score, 4/100) é uma maquete.

Mas a auditoria identifica uma causa única e específica, e isso muda a natureza do trabalho: **as telas de uma coluna tiram 81/100; as telas que exigem estrutura tiram 26 a 35.** A diferença não é qualidade de execução — é a ausência de uma primitiva de layout que nunca foi construída, somada a 24 componentes de paridade que foram construídos e nunca conectados.

O caminho não é reescrever 72 telas. É construir `PageLayout`, conectar o que já existe, e recompor as 13 telas de P0. O restante decorre.

---

## 7. AS 17 DIMENSÕES DO COMANDO 2 — COBERTURA EXPLÍCITA

O COMANDO 2 exige comparação em 17 dimensões. As §§1–6 cobriram a maioria de forma agregada; esta seção fecha cada uma nominalmente, no formato **REFERENCE / CURRENT / STATUS / GAP / REQUIRED CHANGE / PRIORITY**.

### 7.1 Information Architecture
- **REFERENCE** — hierarquia de 5 níveis navegável nos dois sentidos (Programa→Trilha→Curso→Módulo→Lição); perfil em seções modulares; sala em abas; prática em árvore.
- **CURRENT** — a hierarquia **existe e está correta** em `domain/academy.ts` e nas rotas. É o ponto mais forte do projeto.
- **STATUS** `PARTIAL` · **GAP** — 6 rotas não resolvem parâmetros e 18 telas mascaram isso com IDs fixos; sem `/profile/:userId`. · **CHANGE** — corrigir `dynamicPatterns`, remover fallbacks, criar a rota de perfil público. · **P0**

### 7.2 Navigation
- **REFERENCE** — navegação primária persistente + navegação contextual **dentro** da entidade (abas) + breadcrumb + retorno previsível.
- **CURRENT** — 8 pilares no header; breadcrumb gerado mas usado em 2 lugares; **nenhuma navegação contextual interna**.
- **STATUS** `ABSENT` · **GAP** — `Tabs` 0/72; links de submenu duplicados apontando ao mesmo destino; rótulos em inglês. · **CHANGE** — adotar `Tabs` nas 10 telas; corrigir submenu; traduzir. · **P0**

### 7.3 Hierarchy
- **REFERENCE** — um H1, hierarquia tipográfica clara, densidade decrescente do hero ao rodapé.
- **CURRENT** — `ScreenContainer` fornece H1 consistente em 54/72 telas; 18 o ignoram.
- **STATUS** `PARTIAL` · **GAP** — sem escala tipográfica aplicada; **nenhuma fonte carregada**. · **CHANGE** — tipografia institucional + escala de 8 níveis. · **P1**

### 7.4 Page Composition
- **REFERENCE** — 4 formas canônicas com grade de 12 colunas e regiões fixas.
- **CURRENT** — **`sticky` 0/72 · `grid-cols-12` 0/72 · multi-coluna 7/72.**
- **STATUS** `ABSENT` · **GAP** — não existe primitiva de layout. · **CHANGE** — criar `PageLayout`. · **P0 — destrava 53 telas**

### 7.5 Density
- **REFERENCE** — 4 densidades: `EDITORIAL`, `CATALOG`, `OPERATIONAL`, `INSTRUMENT`.
- **CURRENT** — densidade uniforme e indiferenciada em todo o produto.
- **STATUS** `ABSENT` · **GAP** — lição lê-se como card; admin ocupa o mesmo espaço de uma página de curso; estúdio não é compacto. · **CHANGE** — aplicar a escala por domínio. · **P2**

### 7.6 Tabs
- **REFERENCE** — espinha dorsal de Coursera, LinkedIn e Skool.
- **CURRENT** — **`Tabs` e `SegmentedControl`: 0 usos em telas.** Só o catálogo do design system os instancia.
- **STATUS** `ABSENT` · **GAP** — exigidos em 10 telas. `ProfileOverviewScreen` reimplementa 19 abas à mão. · **CHANGE** — adotar o componente. · **P0**

### 7.7 Cards
- **REFERENCE** — card por tipo de entidade, com affordance e métrica próprias.
- **CURRENT** — `CourseCard`, `RoomCard`, `MediaCard`, `FeedCard`, `ProfileCard` existem. `LessonCard`, `PracticeCard`, `ForumCard`, `EventCard` **órfãos**.
- **STATUS** `PARTIAL` · **GAP** — 4 cards órfãos; telas desenham cards à mão. · **CHANGE** — reconectar. · **P1**

### 7.8 Sidebars
- **REFERENCE** — trilho contextual fixo nas Formas B e C.
- **CURRENT** — `Sidebar` **0 usos**; nenhum trilho fixo em 72 telas.
- **STATUS** `ABSENT` · **GAP** — filtros rolam para fora; CTA de matrícula some ao rolar; sumário da lição inexistente. · **CHANGE** — `PageLayout.Rail`. · **P0**

### 7.9 Progress
- **REFERENCE** — progresso visível em todo nível, com semântica ARIA.
- **CURRENT** — `Progress`/`ProgressBar` usados; **`ProgressRing` órfão** (exigido em 5 telas); nenhum `role="progressbar"` com `aria-valuenow`.
- **STATUS** `PARTIAL` · **GAP** — progresso sem semântica; maestria como porcentagem crua em vez dos 5 pontos. · **CHANGE** — reconectar `ProgressRing`; ARIA. · **P1**

### 7.10 Search
- **REFERENCE** — busca global com abas por tipo, facetas com contagem, termo na URL.
- **CURRENT** — `SearchScreen` 7/100: hardcoded, sem `Tabs`, sem facetas. **Busca de pessoas não existe.**
- **STATUS** `ABSENT` · **GAP** — sem índice; sem endpoint. · **CHANGE** — `GET /api/v1/people/search` na Function sobre KV (ADR-003); `Tabs` por tipo. · **P1**

### 7.11 Filtering
- **REFERENCE** — facetas com contagem real, combináveis, refletidas na URL, limpáveis.
- **CURRENT** — filtros como estado local em algumas telas; sem contagem, sem URL, sem `sticky`.
- **STATUS** `ABSENT` · **GAP** — filtro não compartilhável nem restaurável. · **CHANGE** — facetas derivadas do repositório + sincronização com a URL. · **P1**

### 7.12 Detail Pages
- **REFERENCE** — hero + abas + conteúdo + trilho fixo.
- **CURRENT** — 20 telas deveriam ser Forma C; **7 chegam perto, 2 aprovam**.
- **STATUS** `ABSENT` · **GAP** — `CourseDetailScreen` 58, `LessonReaderScreen` 50, `ProfileOverviewScreen` 11, `RoomDetailScreen` 8. · **CHANGE** — recompor sobre `PageLayout`. · **P0**

### 7.13 Activity
- **REFERENCE** — fluxo de atividade derivado de eventos reais, com origem rastreável.
- **CURRENT** — `ActivityTab` existe e lê do perfil; `domain/events.ts` (33 l.) **órfão**; nenhum evento de domínio é publicado.
- **STATUS** `PARTIAL` · **GAP** — atividade não se alimenta sozinha. · **CHANGE** — barramento de eventos alimentando a lente de atividade. · **P1**

### 7.14 States
- **REFERENCE** — `LOADING` `EMPTY` `ERROR` `SUCCESS` `LOCKED` em toda tela.
- **CURRENT** — **média de 0,6 de 5. Zero telas cumprem os cinco.** Practice: 0/16 com carregamento.
- **STATUS** `ABSENT` · **GAP** — `Skeleton`, `LockedState`, `CompletedState` órfãos. · **CHANGE** — orquestrar via `PageLayout`. · **P0**

### 7.15 Workflows
- **REFERENCE** — fluxos fechados de ponta a ponta: matrícula→lição→avaliação→certificado; skill→sessão→feedback→maestria→evidência; tarefa→entrega→correção→parecer→evidência.
- **CURRENT** — Academy e Practice **fecham** (lógica real nos serviços). Sala, Estúdio e Partitura **não fecham** — terminam em `alert()`.
- **STATUS** `PARTIAL` · **GAP** — 5 dos 7 cruzamentos constitucionais ausentes. · **CHANGE** — implementar os cruzamentos. · **P1**

### 7.16 Interactions
- **REFERENCE** — atalhos de teclado, arrastar para reordenar, edição no lugar, resposta otimista, desfazer.
- **CURRENT** — `⌘K` e `Alt+P` no shell (bom). Fora disso: nenhum atalho, nenhum arrastar, nenhum desfazer — **inclusive nos editores**, onde é inegociável.
- **STATUS** `ABSENT` · **GAP** — editor sem entrada de nota nem desfazer não é editor. · **CHANGE** — teclado no editor, DAW e árvore de habilidades; pilha de desfazer. · **P1**

### 7.17 Responsive Behavior
- **REFERENCE** — contrato por forma em 5 faixas (`00_FOUNDATIONS §6`).
- **CURRENT** — **35/72 telas com ≤1 breakpoint**; `overflow-x-auto` em 6; `Drawer` em 1.
- **STATUS** `ABSENT` · **GAP** — sem colapso de filtros, sem sumário em gaveta, sem contêiner rolável para tabelas e partituras. · **CHANGE** — implementar via `PageLayout`; testar em 320/768/1280. · **P1**

---

## 8. REMEDIÇÃO DO ADMIN

A pontuação de **9/100** da §3.6 foi obtida contra uma especificação equivocada — *gestão de usuários*. A definição correta (`wireframes/07_ADMIN_FOUNDER_CONSOLE.md`) é **console da fundadora**: insights, SEO, comunicação e comercial.

| Tela atual | Sob a nova especificação |
| :--- | :--- |
| `AdminDashboardScreen` | Mantém-se como `/admin`, mas precisa de funil, retenção e "conteúdo procurado sem oferta" |
| `AdminAuditScreen` | Mantém-se — e deve consumir o endpoint que **já existe e já é autenticado** |
| `AdminModerationScreen` | Mantém-se — fila sobre o KV compartilhado |
| `AdminUsersScreen` | **Descontinuar** — os dados pessoais vivem no Drive do usuário; a fundadora não tem nem deve ter acesso |
| `AdminContentScreen` | **Descontinuar** — autoria pertence ao pipeline de conhecimento (COMANDOS 7–10) |
| `AdminEnginesScreen` | **Descontinuar** — exibia telemetria falsa; é substituída por `/admin/seo` |
| — | **Criar** `/admin/seo`, `/admin/communication`, `/admin/commercial` |

🔴 **Descoberta que bloqueia o SEO inteiro:** a aplicação roteia por *hash* (`#/academy/course/x`). Fragmentos de hash **não são indexáveis** — para um buscador, o site tem uma única página. Nenhum trabalho de SEO produz efeito antes de migrar para `history.pushState`. Isso conecta com os defeitos R-04 e R-05 do `01_REPOSITORY_AUDIT.md` e passa a ser **P0 comercial**, não apenas higiene técnica.

**Admin permanece como o domínio mais distante da especificação** — agora por um motivo diferente e mais preciso: metade das telas existentes não deveria existir, e as três que importam ainda não foram construídas.

---

## 9. ENCERRAMENTO DO COMANDO 2

| Exigência do comando | Situação |
| :--- | :--- |
| Auditoria tela a tela | ✅ 72 telas pontuadas individualmente |
| 17 dimensões de comparação | ✅ §7, uma a uma |
| Formato REFERENCE / CURRENT / STATUS / GAP / CHANGE / PRIORITY | ✅ §7; §3 traz GAP e PRIORITY por tela |
| `docs/claude/02_REFERENCE_PARITY_AUDIT.md` | ✅ |
| Identidade própria preservada | ✅ nenhuma mudança de identidade proposta; a adaptação está registrada em cada wireframe |
| Não alterar o produto | ✅ nenhum arquivo de `src/` modificado nesta missão |

**Especificação de referência completa:** 9 documentos em `docs/claude/wireframes/` cobrindo os 8 pilares, o console da fundadora e as utilitárias. Nenhuma das 72 telas está sem wireframe de referência.

**Pré-requisito único para o COMANDO 3:** `PageLayout`. Sem ele, 53 telas não são corrigíveis de forma consistente, e qualquer correção pontual precisará ser refeita.
