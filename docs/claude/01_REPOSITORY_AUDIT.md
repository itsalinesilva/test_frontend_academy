# 01 — AUDITORIA COMPLETA DO REPOSITÓRIO

**Missão:** COMANDO 1
**Data:** 2026-09-16
**Método:** medição programática do código-fonte + execução real (`tsc`, `eslint`, `vitest`, `vite build`, `curl`). Nenhuma afirmação aqui vem de leitura impressionista ou da documentação existente.
**Baseline:** pós-Bloco 0 (segurança corrigida). Commit de referência: `cad89d0` + alterações do Bloco 0.
**Escopo medido:** 72 telas (18.700 linhas), 107 componentes, 72 rotas, 22 módulos de domínio, 7 repositórios, 7 serviços, 5 endpoints, 7 arquivos de teste, 92 documentos.

**Classificação:** `REAL` · `PARTIAL` · `MOCK` · `MISSING` · `BROKEN` · `DUPLICATED` · `UNCONNECTED` · `WRONG ARCHITECTURE`

> **Este documento não corrige nada.** É diagnóstico.

---

## SUMÁRIO EXECUTIVO — OS NÚMEROS

| Medição | Resultado |
| :--- | ---: |
| Telas | **72** (18.700 linhas) |
| Telas **sem acesso a qualquer serviço ou repositório** | **28 / 72** (39%) |
| Telas com array de dados fixo dentro do `.tsx` | **24 / 72** (53 arrays) |
| Ações de produto que são `alert()` | **19** em 13 telas |
| Telas que cumprem os **4 estados obrigatórios** do DoD | **0 / 72** |
| Telas com **zero** atributos `aria-*` | **67 / 72** |
| Telas com **zero** atributos `role=` | **70 / 72** |
| Telas com ≤ 1 breakpoint responsivo | **35 / 72** |
| Telas com layout multi-coluna | **9 / 72** |
| Telas usando `position: sticky` | **0 / 72** |
| Telas usando grade de 12 colunas | **0 / 72** |
| Componentes React | **107** |
| **Componentes órfãos (zero usos)** | **23** (2.463 linhas mortas) |
| Uso do componente `Tabs` em telas | **0** |
| Uso do componente `SegmentedControl` em telas | **0** |
| Uso do componente `Sidebar` em qualquer lugar | **0** |
| Módulos de domínio sem repositório nem serviço | **16 / 22** |
| Endpoints de API | **5** (todos de autenticação/admin) |
| Testes | **37** (7 arquivos) |
| Testes de componente, tela, integração ou E2E | **0** |

---

## PARTE I — FRONTEND

### I.1 Rotas — `PARTIAL`

72 rotas em `CANONICAL_ROUTES` (`src/ui/navigation/router.tsx`), todas despachadas em `AppRouterOutlet.tsx`. Nenhuma rota declarada está sem tela.

| Domínio | Rotas | Observação |
| :--- | ---: | :--- |
| Academy | 22 | Hierarquia completa Programa→Trilha→Curso→Módulo→Lição→Avaliação→Certificado |
| Practice | 16 | Loop Skill→MicroSkill→Exercise→Session→Attempt→Feedback→Mastery |
| Admin | 6 | |
| Auth | 4 | `AUTH_CALLBACK` ficou órfã após o Bloco 0 (GIS usa popup, não redirect) |
| Studio | 4 · Rooms 3 · Community 3 · Worlds 3 · Profile 3 | |
| Core / utilitárias | 8 | |

**Defeitos medidos:**

| # | Achado | Classificação |
| :--- | :--- | :--- |
| R-01 | **6 rotas não resolvem seus parâmetros.** `dynamicPatterns` (router.tsx) omite padrões e `parseParams` exige igualdade de segmentos: `/academy/course/:id/curriculum`, `/academy/course/:id/progress`, `/academy/lesson/:id/interactive`, `/academy/quiz/:id`, `/academy/category/:id`, `/practice/feedback/:id` recebem `params = {}` | `BROKEN` |
| R-02 | **18 telas mascaram R-01** com `params.id \|\| '<id fixo>'` (`'crs_fomt_01'`, `'les_fomt_101_1'`, `'bwv-1001'`, `'sala-chopin'`…). As rotas quebradas *parecem* funcionar porque exibem sempre a mesma entidade | `MOCK` + `BROKEN` |
| R-03 | Despacho por cadeia de `if` com `currentPath.includes('/progress')` e `.includes('/curriculum')` **globais** — qualquer rota futura contendo esses fragmentos cai na tela errada | `WRONG ARCHITECTURE` |
| R-04 | `replace()` apenas chama `navigate()`; não substitui a entrada do histórico | `BROKEN` |
| R-05 | `getInitialPath()` lê `location.pathname` quando não há hash, mas `navigate()` só escreve hash — dois modos de roteamento misturados | `PARTIAL` |
| R-06 | `PRACTICE_SKILL` e `PRACTICE_SKILL_DETAIL` mapeiam o mesmo path | `DUPLICATED` |
| R-07 | Sem rota de perfil público de terceiros (`/profile/:userId`) — impossível ver o perfil de outra pessoa | `MISSING` |

### I.2 Páginas / telas — `MOCK` em 39% dos casos

**28 telas não tocam nenhuma camada de dados.** Renderizam arrays literais escritos no próprio arquivo:

```
admin/     (6)  AdminAudit · AdminContent · AdminDashboard · AdminEngines · AdminModeration · AdminUsers
community/ (3)  CommunityFeed · EventsDirectory · TopicDetail
rooms/     (3)  CreateRoom · RoomDetail · RoomsDirectory
studio/    (4)  DawProject · ScoreEditor · StudioHub · VoiceEarLab
worlds/    (3)  MusicGraph · WorkDetail · WorldsAtlas
score/     (1)  ScoreScreen
outras     (8)  Overview · Search · Notifications · Help · PracticeScreen · NotFound · OAuthCallback · RecoveryScreen
```

**Por domínio:**

| Domínio | Telas | Com serviço | Veredito |
| :--- | ---: | ---: | :--- |
| **Academy** | 22 | 22 | `PARTIAL` — plumbing real; conteúdo raso (4 lições) |
| **Practice** | 16 | 15 | `PARTIAL` — serviço real; medição falsa; zero estados de carregamento |
| **Profile** | 3 | 3 | `PARTIAL` — 19 abas reais; mídia e métricas fixas |
| **Admin** | 6 | **0** | `UNCONNECTED` |
| **Community** | 3 | **0** | `MOCK` |
| **Rooms** | 3 | **0** | `MOCK` |
| **Studio** | 4 | **0** | `MOCK` |
| **Worlds** | 3 | **0** | `MOCK` |

**Componentes-Deus (`WRONG ARCHITECTURE`):**
- `ExerciseSessionScreen.tsx` — **1.255 linhas**, 6 arrays fixos
- `OnboardingScreen.tsx` — **1.010 linhas**
- `CourseDetailScreen.tsx` — 743 linhas
- `ProfileOverviewScreen.tsx` — 672 linhas
- `LessonReaderScreen.tsx` — 662 linhas

### I.3 Layouts — `MISSING`

| Padrão estrutural | Telas que usam |
| :--- | ---: |
| `position: sticky` (sidebar/header fixos) | **0 / 72** |
| Grade de 12 colunas | **0 / 72** |
| Multi-coluna (`lg:col-span`) | **7 / 72** |
| Largura de conteúdo consistente (`max-w-7xl`) | **2 / 72** |
| `ScreenContainer` padrão | 54 / 72 (**18 telas o ignoram**) |

**Consequência direta para a paridade:** Coursera, LinkedIn e Skool são, estruturalmente, layouts de **duas ou três colunas com painel lateral fixo (sticky)**. Este repositório tem **zero** elementos sticky e **7** telas multi-coluna. As outras 65 são empilhamento vertical de cards. Isso não é diferença de estilo — é ausência do wireframe da referência.

### I.4 Componentes — `UNCONNECTED` em 21%

107 componentes; **23 nunca são usados** (2.463 linhas). O padrão dos órfãos é o achado mais revelador de toda a auditoria:

| Órfão | Linhas | O que deveria sustentar |
| :--- | ---: | :--- |
| `MixerChannel` | 137 | Mixer da DAW |
| `PianoRoll` | 118 | Edição MIDI da DAW |
| `Recorder` | 148 | Gravação no Estúdio |
| `NotationToolbar` | 168 | Barra do editor de partitura |
| `InstrumentKeyboard` | 166 | Teclado/simulador de instrumento |
| `SkillNode` | 108 | Nós da árvore de habilidades (Duolingo) |
| `XPIndicator` | 80 | XP (Duolingo) |
| `ProgressRing` | 87 | Anel de progresso (Duolingo) |
| `PracticeCard` | 103 | Card de exercício (Duolingo) |
| `LockedState` | 64 | Habilidade bloqueada (Duolingo) |
| `ProfileHeader` | 174 | Cabeçalho de perfil (LinkedIn) |
| `Credential` | 122 | Credencial (LinkedIn) |
| `ForumCard` | 71 | Card de fórum (Skool) |
| `EventCard` | 112 | Card de evento (Skool) |
| `LessonCard` | 112 | Card de lição (Coursera) |
| `DataGrid` | 237 | Tabelas do Admin |
| `Topbar` | 133 | Barra superior |
| `IconButton` · `Skeleton` · `Tooltip` · `CompletedState` | 286 | Primitivas |
| `LiveRegion` · `VisuallyHidden` | 41 | **Acessibilidade** |

> **Este é o diagnóstico central da questão de paridade.** Os componentes que implementam a linguagem visual das referências **foram construídos e nunca conectados**. `DawProjectScreen` desenha um mixer com `<div>` cru em vez de usar `MixerChannel`; `SkillTreeScreen` não usa `SkillNode`; `VoiceEarLabScreen` não usa `Tuner`. Não falta capacidade de componente — falta a montagem da tela sobre eles.

Adicionalmente **nunca usados em tela alguma**: `Tabs` (0), `SegmentedControl` (0), `Sidebar` (0), `Modal` (0). `Tabs` e `SegmentedControl` aparecem só no catálogo do design system.

### I.5 Design System — `WRONG ARCHITECTURE`

Três sistemas de tokens paralelos, nenhum adotado:

1. `src/index.css` — 25 variáveis CSS `--color-*`
2. `src/ui/design-system/tokens.ts` — objeto `TOKENS` completo
3. Classes Tailwind cruas — o que a UI de fato usa

**`tokens.ts` é importado por exatamente 1 arquivo: o próprio `DesignSystemCatalog.tsx`.** Os outros 180 `.tsx` usam utilitários brutos: `text-stone-900` (614×), `text-stone-500` (529×), `text-red-800` (180×).

| Achado | Classificação |
| :--- | :--- |
| Tokens definidos e não consumidos | `UNCONNECTED` |
| Paleta implementada `#991b1b` ≠ constitucional `#8B1E2D`; bordô secundário `#6D1D2D` decidido (ADR-001.D) e **ainda não aplicado** | `PARTIAL` |
| **Zero `@font-face`, zero `<link>` de fonte, zero `font-family`** — a "tipografia serifada clássica" é a serifada padrão do sistema operacional | `MISSING` |
| Zero `dark:` e zero `prefers-color-scheme` | `MISSING` |
| Rótulos de navegação em inglês ("Home", "Academy", "Practice") num produto pt-BR | `PARTIAL` |

### I.6 Estados — `MISSING`

O DoD (`00_SOURCE_OF_TRUTH.md §4`) exige loading, empty, error e success em toda tela.

| Estado | Telas que têm |
| :--- | ---: |
| Loading | 14 / 72 |
| Empty | 27 / 72 |
| Error | 42 / 72 |
| **Os 4 simultaneamente** | **0 / 72** |

Por domínio: **Practice tem 0/16 telas com estado de carregamento**, apesar de 15 delas buscarem dados assíncronos. Studio, Rooms, Worlds, Admin e Community: 0 estados de carregamento.

### I.7 Navegação — `PARTIAL`

- 8 pilares + Room + Admin no `Navigation.tsx`.
- `Breadcrumbs` gerado pelo roteador, mas usado em **2** lugares.
- **Links duplicados e enganosos:** "Treino Auditivo de Intervalos" e "Metrônomo Acústico" → ambos `/practice`; "Catálogo Urtext" e "Editor de Pautas" → ambos `/score`.
- `CirculationBar` usado em 4 lugares; `CommandPalette`, `WorkspaceSwitcher`, `Pagination`, `DropdownMenu`, `Drawer` em 1 cada.

### I.8 Responsividade — `PARTIAL`

**35 de 72 telas têm ≤ 1 breakpoint.** O DoD exige funcionamento de 320 px a 2560 px; não há evidência de teste em nenhuma largura. `overflow-x-auto` (obrigatório para tabelas e partituras em telas estreitas) aparece em 6 telas.

### I.9 Acessibilidade — `MISSING`

| Medição | Resultado |
| :--- | ---: |
| Telas com zero `aria-*` | **67 / 72** |
| Telas com zero `role=` | **70 / 72** |
| `LiveRegion` / `VisuallyHidden` | **órfãos** |
| Testes de a11y | **0** |

As 5 telas com `aria` são as 3 de autenticação reescritas no Bloco 0, `Settings` e `AcademySearch`. Os 19 `alert()` nativos também não são anunciáveis de forma controlada. **WCAG AA nunca foi medido.**

### I.10 Mocks e dados fabricados — `MOCK`

**19 `alert()`** substituindo ações centrais do negócio: *Exportar MusicXML*, *Salvar Partitura*, *Importar MusicXML*, *Submeter evidência para a tarefa*, *Inscrição confirmada no evento*, *Gerenciar permissões*, *Sincronizar cadeia de custódia*, *Executar diagnóstico dos motores*.

**53 arrays de dados fixos** em 24 telas.

**Dados fabricados apresentados como reais** (violação direta da diretriz do produto):

| Local | Fabricação | Status |
| :--- | :--- | :--- |
| `seed-practice-content.ts:627` | Bach, Clara Schumann, Villa-Lobos e Chopin como **usuários com XP no ranking semanal** | aberto |
| `seed-practice-content.ts:595` | Streak de 7 dias com minutos/XP inventados | aberto |
| `unified-profile.repository.ts:232-258` | "Gravações de Bach" que apontam para **sons de chuva e riacho** do Google | aberto |
| `unified-profile.repository.ts:611` | `cdn.example.com` | aberto |
| `unified-profile.repository.ts:695-764` | 4 evidências em `storage.academia.mus.br` — **domínio inexistente** | aberto |
| `WorldsAtlasScreen.tsx` | "142 obras do Barroco, 185 do Romantismo…" sobre **5 obras** fixas | aberto |
| `VoiceEarLabScreen.tsx` | "85% de Precisão", "4/10", barra de cents em 52% — fixos no JSX | aberto |
| `RecordingsTab.tsx:12` | `currentProgress = 35` fixo; reprodução é toggle booleano | aberto |
| `seed-academy-content.ts` | Avatares de professores = fotos do Unsplash | aberto |
| Todas as lições | `illustrations[]` descreve gravuras que não existem (`public/` só tem `favicon.svg`) | aberto |
| `user.repository.ts` | Personas Bach/Chopin/Clara/Mozart como contas | ✅ **corrigido no Bloco 0** |

---

## PARTE II — BACKEND

### II.1 Servidores — `REAL` (novo)

| Componente | Estado |
| :--- | :--- |
| `server/core/api-router.ts` | `REAL` — roteador agnóstico de runtime (`Request`→`Response`) |
| `functions/api/v1/[[route]].ts` | `REAL` — Cloudflare Pages Function (produção) |
| `server/adapters/vite-middleware.ts` | `REAL` — dev server, **mesmo roteador** |

Resolve o B-01 da auditoria anterior: dev e produção deixam de divergir.

### II.2 APIs e endpoints — `PARTIAL`

**5 endpoints, todos de identidade.** Nenhum endpoint de negócio.

| Endpoint | Método | Autorização | Estado |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/session` | POST | pública (verifica ID token Google) | `REAL` |
| `/api/v1/auth/session` | GET | sessão assinada | `REAL` |
| `/api/v1/auth/session` | DELETE | sessão assinada | `REAL` |
| `/api/v1/admin/verify` | GET | sessão + allowlist | `REAL` |
| `/api/v1/admin/audit-logs` | GET | sessão + `admin.audit.view` | `REAL` |

**Ausentes (`MISSING`):** todo `/academy/*`, `/practice/*`, `/profile/*`, `/community/*`, `/rooms/*`, `/studio/*`, `/score/*`, `/worlds/*`, `/evidence/*`. Por ADR-001.A isso é **intencional** para dados pessoais (local-first); mas as superfícies sociais decididas para Cloudflare KV (decisão E) ainda não têm endpoint algum.

`ApiClient` (142 linhas): **0 chamadas de dados**. Só `setAuthToken()`. `UNCONNECTED`.

### II.3 Serviços — `REAL` / `PARTIAL`

| Serviço | Linhas | Estado |
| :--- | ---: | :--- |
| `academy.service.ts` | 733 | `REAL` — matrícula, progresso, quiz, exame, certificado SHA-256, histórico |
| `practice.service.ts` | 656 | `REAL` — sessão, tentativa, maestria, streak, XP |
| `profile.service.ts` | 534 | `REAL` — 7 lentes, visibilidade, portfólio, ingestão de evidência |
| `auth.service.ts` | ~600 | `REAL` (reescrito no Bloco 0) |
| `admin.service.ts` | 105 | `REAL` (reescrito no Bloco 0) |
| `tool.service.ts` + `tool.sdk.ts` | 150 | `PARTIAL` — só afinador, teoria, partitura, prática |

**Ausentes:** Community, Rooms, Studio, Score, Worlds, Evidence, Gamification, Kids, Commercial.

### II.4 Repositórios — `PARTIAL` + `DUPLICATED`

| Repositório | Linhas | Estado |
| :--- | ---: | :--- |
| `unified-profile.repository.ts` | 1.189 | `REAL` — mas semeado com mídia fabricada |
| `academy.repository.ts` | 350 | `REAL` |
| `practice.repository.ts` | 275 | `REAL` |
| `user.repository.ts` | ~90 | `REAL` (reescrito no Bloco 0) |
| `audit.repository.ts` | 31 | `PARTIAL` |
| `course.repository.ts` | 210 | `DUPLICATED` — concorre com `academy.repository` |
| `profile.repository.ts` | 96 | `DUPLICATED` — concorre com `unified-profile`; **ambos ativos** |

### II.5 Banco de dados — `MISSING` (por decisão)

Não existe, **por projeto** (ADR-001.A): persistência em `localStorage`, backup JSON no Drive do usuário. Consequências assumidas: limpar o navegador destrói progresso enquanto o backup no Drive (item 15.6) não existir.

**Pendência decidida e não implementada:** Cloudflare KV para as superfícies compartilhadas (decisão E) — fórum, salas, conexões, ranking, perfil público. `MISSING`.

### II.6 Autenticação — `REAL`

Reescrita no Bloco 0. Google-only, ID token verificado contra o JWKS com RS256, validação de `iss`/`aud`/`exp`/`iat`/`nonce`, recusa de confusão de algoritmo, sessão JWS HS256 com comparação em tempo constante. Senha eliminada do domínio, contratos e telas.

**Pendência:** `VITE_GOOGLE_OAUTH_CLIENT_ID` não configurado — sem ele, o botão mostra "Autenticação indisponível". `BLOCKED` (depende de ação externa).

### II.7 Autorização — `PARTIAL`

- **Admin:** `REAL` — allowlist em variável de ambiente, resolvida server-side, guarda de build impede vazamento.
- **RBAC de capacidades:** `PARTIAL` — `entitlement-service` decide no cliente a partir de `assignedRoles`; o papel é controlado pelo servidor, mas a **avaliação** é local. Aceitável em arquitetura local-first para dados próprios; **insuficiente** para as superfícies KV.
- **Ownership / IDOR:** `MISSING` — não há verificação de propriedade de recurso em lugar algum. Hoje inofensivo (dados locais); torna-se crítico com o KV.

### II.8 Storage, filas, workers, integrações

| Item | Estado |
| :--- | :--- |
| Storage de artefatos (áudio, partituras, PDFs) | `MISSING` — URLs apontam para domínio inexistente |
| Backup no Google Drive (`drive.appdata`) | `MISSING` — decidido (ADR-001.A), não implementado |
| Filas / workers | `MISSING` — e provavelmente desnecessários na arquitetura escolhida |
| Integrações de conteúdo (Wikidata, MusicBrainz, IMSLP, Commons, Archive, Open Opus) | `MISSING` — especificadas em `21.1`, nenhuma implementada |
| Proxy de CORS para IMSLP / Musica Brasilis | `MISSING` |
| Pipeline de ingestão de conhecimento | `MISSING` — 110 MB de fontes nunca lidos |

---

## PARTE III — DOMÍNIO

### III.1 Entidades — `REAL` na modelagem, `UNCONNECTED` no consumo

22 módulos, ~3.400 linhas, tipagem estrita, sem `any`. **A modelagem é o melhor ativo do repositório.** Mas:

| Módulo | Linhas | Repo | Serviço | Veredito |
| :--- | ---: | :---: | :---: | :--- |
| `profile` | 494 | ✅ | ✅ | `REAL` |
| `academy` | 485 | ✅ | ✅ | `REAL` |
| `practice` | 326 | ✅ | ✅ | `REAL` |
| `types` | 214 | ✅ | ✅ | `REAL` |
| `audit` | 46 | ✅ | ✅ | `REAL` |
| `creation` | 224 | ❌ | ❌ | `UNCONNECTED` |
| `community` | 186 | ❌ | ❌ | `UNCONNECTED` |
| `identity` | 178 | ❌ | ❌ | `UNCONNECTED` |
| `teacher` | 175 | ❌ | ❌ | `UNCONNECTED` |
| `music` | 168 | ❌ | ❌ | `UNCONNECTED` |
| `evidence` | 144 | ❌ | ❌ | `UNCONNECTED` |
| `gamification` | 114 | ❌ | ❌ | `UNCONNECTED` |
| `admin` | 113 | ❌ | ❌ | `UNCONNECTED` |
| `commercial` | 107 | ❌ | ❌ | `UNCONNECTED` |
| `kids` | 80 | ❌ | ❌ | `UNCONNECTED` |
| `entitlements` | 73 | ❌ | ❌ | `UNCONNECTED` |
| `events` · `feature-flags` · `capabilities` · `index` | 184 | ❌ | ❌ | `UNCONNECTED` |

**16 de 22 módulos de domínio não têm repositório nem serviço.** As telas correspondentes ignoram o domínio e declaram arrays locais — o modelo existe e é bom, e a UI passa ao largo dele.

### III.2 Relacionamentos entre sistemas — 2 de 7 implementados

A Constituição §4 define 7 cruzamentos obrigatórios:

| Regra | Estado |
| :--- | :--- |
| 1. Curso → Prática (lição desbloqueia exercícios) | `MISSING` — links são `navigate('/practice')` genéricos; `AcademyLesson.skills` é `string[]` de nomes, não IDs |
| 2. Prática → Notação | `MISSING` |
| 3. Notação → Estúdio (partitura vira trilhas MIDI) | `MISSING` |
| 4. Estúdio → Evidência | `MISSING` |
| 5. Evidência → Perfil & Portfólio | ✅ `REAL` |
| 6. Curso & Prática → Passaporte | `MISSING` — entidade `Passport` não persiste |
| 7. Portfólio → Salas & Comunidade | `MISSING` |
| *(extra)* Academy → Evidência | ✅ `REAL` (`academy.service.ts:406,635`) |
| *(extra)* Practice → Evidência | ✅ `REAL` (`practice.service.ts:513`) |

### III.3 Ownership e permissões — `MISSING`

Não há conceito de propriedade de recurso implementado. `UserCapability` existe e é avaliado, mas nenhuma função pergunta "este usuário é dono deste recurso?". Inofensivo hoje; bloqueador para o KV.

### III.4 Conteúdo — `PARTIAL`

| Entidade semeada | Quantidade |
| :--- | ---: |
| Programas / Trilhas / Cursos | 2 / 3 / 3 |
| Módulos / **Lições** | 3 / **4** |
| Atividades / Avaliações / Quizzes | 4 / 1 / 2 |
| Árvores de habilidade / Habilidades / Micro-habilidades / Exercícios | 5 / 5 / 6 / 10 |

Qualidade textual das 4 lições: alta e academicamente correta. Volume: insuficiente para sustentar "paridade Coursera".

**Fontes disponíveis e não processadas:** 1.592 páginas (Med ×2, Grout & Palisca, Berklee ×2) + 37 transcrições Edinburgh. **688 páginas exigem OCR** — e são exatamente as duas obras do Med, que o ADR-002 define como base oficial. `MISSING`.

**Proveniência:** `provenanceRef` é string livre. `CanonicalProvenanceRecord` existe em `domain/admin.ts` e **nada o instancia**. Citações página a página a obras não ingeridas permanecem não verificadas. `PARTIAL`.

---

## PARTE IV — TESTES

**37 testes, 7 arquivos.** Cobertura por tipo:

| Tipo | Quantidade | Estado |
| :--- | ---: | :--- |
| **Autorização / servidor** | 16 | `REAL` (criado no Bloco 0) |
| Unitário de motor (teoria, gateway, tool) | 8 | `REAL` |
| Unitário de entitlements | 4 | `REAL` |
| Unitário de repositório | 4 | `PARTIAL` — testa `course.repository`, que é o duplicado a eliminar |
| Design system (tokens) | 5 | `PARTIAL` — valida tokens que a UI não usa |
| **Componente** | **0** | `MISSING` |
| **Tela** | **0** | `MISSING` |
| **Integração** | **0** | `MISSING` |
| **API (endpoints de negócio)** | **0** | `MISSING` |
| **E2E** | **0** | `MISSING` |
| **Acessibilidade** | **0** | `MISSING` |
| **Responsividade** | **0** | `MISSING` |

**Sem nenhum teste:** `academy.service` (733 l.), `practice.service` (656 l.), `profile.service` (534 l.), `unified-profile.repository` (1.189 l.), roteador, qualquer um dos 107 componentes, qualquer uma das 72 telas.

**Impedimento técnico:** `vitest.config.ts` usa `environment: 'node'`; não há `jsdom`/`happy-dom`, `@testing-library/react` nem Playwright. **É tecnicamente impossível testar uma tela hoje.** `MISSING`.

---

## PARTE V — DOCUMENTAÇÃO

| Documento | Estado |
| :--- | :--- |
| `docs/00_REPOSITORY_AUDIT.md` | `BROKEN` — descreve 119 arquivos / 36 telas / 46 componentes / 46 rotas. Realidade: 254 / 72 / 107 / 72. Afirma erros de tipagem que não existem |
| `docs/00_SOURCE_OF_TRUTH.md` | `BROKEN` — mesma defasagem; §2.6 afirma typecheck quebrado, que está limpo |
| `docs/01_PRODUCT_CONSTITUTION.md` | `REAL` — continua válido e é a melhor referência normativa |
| `docs/02_DOMAIN_MODEL.md` · `03_DESIGN_SYSTEM.md` | `PARTIAL` |
| `docs/harness/` (71 arquivos) | `PARTIAL` — **50 têm menos de 25 linhas**. Contratos como `60_SCORE_ENGINE_CONTRACT`, `61_AUDIO_ENGINE_CONTRACT`, `63_DATABASE_SCHEMA_CONTRACT` têm 16 linhas: são títulos, não contratos |
| `docs/harness/PROMPTS.md` | `REAL` — 3.300 linhas, é o plano de trabalho vigente |
| `docs/backend_specs/21.1_...` | `REAL` — criado nesta sessão |
| `CLAUDE_STATE/AUDIT/TODO.md` | `REAL` — criados nesta sessão |
| `README.md` na raiz | `MISSING` |
| `CLAUDE.md` | `MISSING` |
| `metadata.json` | `PARTIAL` — declara `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` e nome `"- teste_virtual_academy"`; resíduo do AI Studio |
| ADRs formais | `PARTIAL` — ADR-001 e ADR-002 existem em `CLAUDE_STATE.md`, não em `docs/harness/12_ADR_DECISIONS.md` (18 linhas) |

---

## PARTE VI — CONTAGEM POR CLASSIFICAÇÃO

| Classificação | Ocorrências | Principais |
| :--- | ---: | :--- |
| `REAL` | 21 | Domínio (5 módulos), Academy/Practice/Profile services, repositórios canônicos, autenticação, autorização admin, auditoria encadeada, roteador de API, pitch, teoria, gateway, 2 cruzamentos, 16 testes de autorização, Constituição, PROMPTS, 21.1 |
| `PARTIAL` | 19 | Rotas, Academy, Practice, Profile, RBAC, tool.service, responsividade, paleta, conteúdo, proveniência, docs de harness, testes de repositório e design system |
| `MOCK` | 8 | 28 telas sem dados, 19 `alert()`, 53 arrays fixos, fallbacks de rota, mídia fabricada, telemetria de motores, medição de prática |
| `MISSING` | 24 | Endpoints de negócio, KV, Drive, storage, integrações de conteúdo, ingestão, OCR, Passport, 5 cruzamentos, tipografia, dark mode, sticky, grade, a11y, estados, testes (7 tipos), README, CLAUDE.md |
| `BROKEN` | 5 | 6 rotas sem parâmetro, `replace()`, roteamento híbrido, docs de fonte da verdade, teste apontando para código a eliminar |
| `DUPLICATED` | 4 | `course.repository`, `profile.repository`, tipos paralelos, `PracticeScreen` legado |
| `UNCONNECTED` | 6 | 23 componentes órfãos, 16 módulos de domínio, `ApiClient`, `tokens.ts`, `Tabs`/`SegmentedControl`/`Sidebar`, motor de pitch ↔ UI |
| `WRONG ARCHITECTURE` | 6 | 3 sistemas de tokens, cadeia de `if` do outlet, 5 componentes-Deus, bundle único de 1,2 MB, ausência de ownership, `.includes()` global no roteamento |

---

## PARTE VII — VEREDITO E RESPOSTA À QUESTÃO DE PARIDADE

### O que este repositório é hoje

Um **protótipo de frontend de alta qualidade superficial sobre um núcleo de domínio genuinamente bom**, com autenticação agora real. Três camadas merecem ser preservadas e expandidas: a modelagem de domínio, os serviços de Academy/Practice/Profile, e a arquitetura de portas e adaptadores dos motores.

### Por que as telas não têm a experiência das referências

A auditoria permite responder isso com números, não com opinião:

1. **Os componentes da referência existem e não foram conectados.** 23 componentes órfãos, e entre eles estão precisamente `MixerChannel`, `PianoRoll`, `Recorder`, `NotationToolbar`, `SkillNode`, `XPIndicator`, `ProgressRing`, `LockedState`, `ProfileHeader`, `Credential`, `ForumCard`, `EventCard`, `LessonCard`, `DataGrid`. As telas redesenham à mão, com `<div>` cru, aquilo que já existia pronto.

2. **O wireframe estrutural não foi reproduzido.** `sticky`: 0/72. Grade de 12 colunas: 0/72. Multi-coluna: 7/72. Coursera, LinkedIn e Skool são, na essência, layouts de duas/três colunas com painel lateral fixo. O que existe aqui é empilhamento vertical de cards em 65 das 72 telas.

3. **A navegação por abas — que é a espinha dorsal de LinkedIn, Coursera e Skool — não é usada.** `Tabs`: 0 telas. `SegmentedControl`: 0 telas. A única exceção é `ProfileOverviewScreen`, que implementa 19 abas **à mão**, com um scroller horizontal próprio, em vez do componente do design system.

4. **O design system não governa a UI.** `tokens.ts` é consumido por 1 arquivo. A identidade visual está espalhada em 180 arquivos como classes Tailwind cruas, e a tipografia institucional simplesmente não foi carregada.

5. **A densidade funcional é aparente, não real.** 39% das telas não acessam dados; 19 ações centrais são `alert()`; nenhuma tela cumpre os 4 estados obrigatórios do próprio DoD do projeto.

**Conclusão:** a paridade falhou não por falta de componentes nem por falta de modelo de domínio — ambos existem e têm qualidade. Falhou na **montagem**: telas construídas como maquetes visuais isoladas, sem consumir o design system, sem consumir os componentes de domínio já prontos, e sem reproduzir a arquitetura de informação das referências. É um problema de integração e composição, não de capacidade.

### Gaps críticos, em ordem de gravidade

1. **Ausência de camada de dados em 28 telas** — Admin, Community, Rooms, Studio, Worlds inteiros.
2. **16 módulos de domínio sem repositório nem serviço** — o modelo existe e a UI não o usa.
3. **5 dos 7 cruzamentos constitucionais não implementados** — os módulos são ilhas.
4. **Dados fabricados apresentados como reais** — compositores mortos como usuários, áudio de chuva rotulado como Bach.
5. **Zero testes de componente, tela, integração e E2E** — e impossibilidade técnica de escrevê-los hoje.
6. **Paridade estrutural ausente** — medida em §I.3, §I.4 e §VII.
7. **110 MB de fontes nunca processadas**, sendo que 688 páginas da base oficial (Med) exigem OCR.
8. **Acessibilidade inexistente** — 67/72 telas sem `aria`.

Nenhum desses gaps é irreparável, e nenhum exige jogar fora o que existe.
