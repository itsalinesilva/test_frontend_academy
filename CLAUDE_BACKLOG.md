# CLAUDE_BACKLOG.md — o que fica para depois

**Atualizado:** 2026-09-20

> Este arquivo é o **segundo** dos dois. Aqui mora o que não dá para fazer de
> uma vez: tela pendente, função pendente, decisão sua, tarefa de
> infraestrutura, e o levantamento histórico por área.
>
> O **primeiro** é `CLAUDE_TODO.md`, que a suíte de testes cura sozinha a cada
> execução. Item sobe daqui para lá quando vira trabalho imediato, e desce de
> lá para cá quando depende de decisão, de serviço externo ou de outra fase.
>
> A divisão existe porque misturar os dois fazia o urgente desaparecer no meio
> do adiado.

---

# DETALHE POR ÁREA — referência e histórico

> O que está abaixo é o levantamento original, por área. Continua valendo como
> detalhe e como memória do que já foi fechado; a **ordem** de trabalho é a de
> cima.

---

## BLOCO 0 — EMERGÊNCIA DE SEGURANÇA ✅ **CONCLUÍDO** (2026-09-16)
> Verificado por execução: 5 vetores de ataque recusados, 37/37 testes passando, bundle sem segredos.

| # | Item | Ref. | Estado |
| :--- | :--- | :--- | :---: |
| 0.1 | Google Sign-In real (GIS) — `GoogleSignInButton` + `google-identity-client.ts`; `GoogleOAuthModal` simulado excluído | S-03/S-04 | ✅ |
| 0.2 | Verificação de assinatura RS256 do ID token contra o JWKS do Google, com validação de `iss`/`aud`/`exp`/`iat`/`nonce` e recusa de confusão de algoritmo | S-01 | ✅ |
| 0.3 | `resolveAdminGrant()` só aceita sessão verificada; não existe assinatura que aceite e-mail do cliente | S-01 | ✅ |
| 0.4 | Allowlist movida para `ADMIN_ALLOWLIST` (env do servidor); allowlist vazia ⇒ nenhum admin | S-02 | ✅ |
| 0.5 | `admin.service.ts` sem import de servidor e sem fallback local; falha de rede ⇒ **nega** | S-02 | ✅ |
| 0.6 | `scripts/verify-bundle-secrets.mjs` encadeado ao `npm run build` e ao CI — **pegou um vazamento residual na primeira execução** | S-02 | ✅ |
| 0.7 | Auto-login de fundadora removido de `App.tsx`; visitante sem sessão é anônimo | S-04 | ✅ |
| 0.8 | Simulador de papéis restrito a `import.meta.env.DEV` e limitado a papéis já atribuídos | S-06 | ✅ |
| 0.9 | Sessão JWS HS256 assinada pelo servidor, com comparação em tempo constante | S-05 | ✅ |
| 0.10 | `passwordHash`, `login(email,password)`, `register()`, `recoverPassword()`, `resetPassword()` **eliminados** do domínio, contratos e telas | S-05 | ✅ |
| 0.11 | `ChainedAuditLog` com HMAC encadeado + `verifyChain()`; seeds falsos e `resetForTesting()` público removidos | S-07 | ✅ |
| 0.12 | `tests/server-authority.test.ts` — 16 testes de autorização | Q-04 | ✅ |
| 0.13 | *(extra)* `src/server/` eliminado; autoridade movida para `server/` fora da raiz do Vite | S-02 | ✅ |
| 0.14 | *(extra)* Segunda cópia da allowlist em `src/domain/capabilities.ts` removida (alimentava 4 pontos do entitlement-service) | S-02 | ✅ |
| 0.15 | *(extra)* Personas fabricadas (Bach, Clara Schumann, Chopin, Mozart) removidas do `user.repository` | K-05 | ✅ |
| 0.16 | *(extra)* Cloudflare Pages Function + middleware Vite compartilhando o **mesmo** roteador | B-01 | ✅ |

**Pendências geradas por este bloco:**

| # | Item | Estado |
| :--- | :--- | :---: |
| 0.A | Criar o **OAuth Client ID** no Google Cloud Console e preencher `.env.local` / variáveis do Cloudflare | ⛔ depende de você |
| 0.B | `OAuthCallbackScreen` ficou órfã (GIS usa popup, não redirect) — avaliar remoção na auditoria de rotas | ⬜ |
| 0.C | Auditoria do log encadeado é **por instância** do runtime: em Workers, cada isolate tem sua cadeia. Definir destino durável (KV) junto do Bloco E | ⬜ |

---

## BLOCO 1 — COMANDO 1 · Auditoria formal ✅ **CONCLUÍDO** (2026-09-16)
| # | Item | Estado |
| :--- | :--- | :---: |
| 1.1 | `docs/claude/01_REPOSITORY_AUDIT.md` — Frontend / Backend / Domínio / Testes / Documentação, com classificação por item | ✅ |
| 1.2 | Matriz componente → telas: **23 órfãos de 107** (2.463 linhas mortas) | ✅ |
| 1.3 | Matriz rota → tela → serviço → repositório → persistência | ✅ |

**Achados novos, que não constavam do diagnóstico do COMANDO 0:**

| # | Achado | Consequência |
| :--- | :--- | :--- |
| 1.A | **23 componentes órfãos**, e entre eles exatamente os da paridade: `MixerChannel`, `PianoRoll`, `Recorder`, `NotationToolbar`, `SkillNode`, `XPIndicator`, `ProgressRing`, `LockedState`, `ProfileHeader`, `Credential`, `ForumCard`, `EventCard`, `LessonCard`, `DataGrid`, `LiveRegion`, `VisuallyHidden` | A paridade falhou na **montagem**, não na capacidade. Reconectar é mais barato que reconstruir |
| 1.B | `Tabs` e `SegmentedControl`: **0 telas**. `Sidebar` e `Modal`: **0 usos** | A navegação por abas — espinha dorsal de LinkedIn/Coursera/Skool — não existe |
| 1.C | `sticky`: **0/72** · grade de 12 colunas: **0/72** · multi-coluna: **7/72** | O wireframe de duas/três colunas com painel fixo das referências não foi reproduzido |
| 1.D | **0/72 telas** cumprem os 4 estados do DoD; Practice tem **0/16** com carregamento | O próprio DoD do projeto nunca foi atendido por nenhuma tela |
| 1.E | **67/72 telas sem `aria`**, 70/72 sem `role` | WCAG AA inexistente, apesar de declarado |
| 1.F | **16 de 22 módulos de domínio** sem repositório nem serviço | O modelo é bom e a UI passa ao largo dele |
| 1.G | Componentes-Deus: `ExerciseSessionScreen` **1.255 l.**, `OnboardingScreen` **1.010 l.** | Refatoração obrigatória antes de evoluir |
| 1.H | 35/72 telas com ≤1 breakpoint; 18 telas ignoram `ScreenContainer` | Responsividade e consistência estrutural ausentes |

## BLOCO 2 — COMANDO 2 · Paridade estrutural ✅ **CONCLUÍDO** (2026-09-16)
| # | Item | Estado |
| :--- | :--- | :---: |
| 2.1 | `docs/claude/02_REFERENCE_PARITY_AUDIT.md` com REFERENCE / CURRENT / PARITY STATUS / GAP / REQUIRED CHANGE / PRIORITY por tela | ⬜ |
| 2.2 | Wireframe textual de referência para Academy, Profile, Practice, Room, Studio, Score (IA, densidade, colunas, abas, estados) | ⬜ |

---

## BLOCO 3 — COMANDO 3 · Academy (paridade Coursera) ✅ **CONCLUIDO** (2026-09-17)
> Academy 60 -> **90/100**. As 22 telas em FULL. Paridade ESTRUTURAL fechada; a funcional aguarda conteudo (COMANDO 8/9).
| # | Item | Ref. | Estado |
| :--- | :--- | :--- | :---: |
| 3.1 | Padrões dinâmicos **derivados** de `CANONICAL_ROUTES`, com precedência de rota estática. As 6 rotas resolvem; 14 testes de regressão | T-03 | ✅ |
| 3.2 | **17 ids fixos removidos** (restam 0). `RouteParams` tipado como `string \| undefined`; 15 telas com guarda que recai no estado de não-encontrado | T-04 | ✅ |
| 3.3 | **16 fallbacks para a fundadora removidos** (restam 0), incluindo 2 no `profile.service` que agora lançam `UnauthorizedError` | T-05 | ✅ |
| 3.4 | Substituir a cadeia de `if` do `AppRouterOutlet` por tabela de rotas com casamento por padrão | T-06 | ⬜ |
| 3.9 | `replace()` agora usa `history.replaceState` — antes empilhava, e o "voltar" devolvia o usuário à tela da qual fora redirecionado | R-04 | ✅ |
| 3.11 | ⚠️ **Regressão minha, corrigida no mesmo turno:** a guarda de sessão inserida em massa (item 3.3) bloqueava também o **catálogo público** em 7 telas — visitante anônimo não via curso algum. Sessão passou a condicionar só as chamadas específicas do usuário | T-05 | ✅ |
| 3.10 | 🔴 **Descoberto:** 17 ocorrências em telas de Practice **fixam** `'usr_founder_1'` diretamente — não é fallback, é atribuição. Todo progresso de prática de qualquer usuário é gravado no perfil da fundadora | T-05 | ⬜ COMANDO 5 |
| 3.5 | Fundir `course.repository.ts` em `academy.repository.ts` (com justificativa técnica registrada) | §9 | ⬜ |
| 3.6 | Course Detail: materiais, bibliografia navegável, corpo docente real, cursos relacionados, trilhas relacionadas | §4 | ⬜ |
| 3.7 | Lesson: navegação anterior/próxima, marcação de progresso por tempo real de estudo, CTA contextual para a habilidade correspondente | §4, §6 | ⬜ |
| 3.8 | Estados obrigatorios auditados em Academy: media **1,7 de 5** por tela (era 0,9). Nenhuma tela com zero | DoD | 🔄 |
| 3.12 | `AcademyHomeScreen` 19→97 · `AcademyCatalogScreen` 48→93 · `MyLearningScreen` 48→93 · `AcademicHistoryScreen` 19→93 | §I.4 | ✅ |
| 3.13 | Órfãos reconectados: `CourseCard` (4 telas) · `LessonCard` · `DataGrid` · `Tabs` (2) | 1.A | ✅ |
| 3.14 | Mais um id fixo encontrado e removido: `MyLearningScreen` levava toda matrícula sem registro à lição `les_fomt_101_1` | R-02 | ✅ |
| 3.15 | As 8 telas restantes recompostas: Curriculum 15->93 · Progress 35->89 · Module 43->89 · Category 45->89 · Search 56->81 · AcademicProfile 60->89 · SearchResults 60->85 · InteractiveLesson 66->89 | §3.1 | ✅ |
| 3.16 | Retornos antecipados de "nao encontrado" removidos: o estado `empty` do `PageLayout` cobre, e o codigo duplicado some | DoD | ✅ |

## BLOCO 4 — COMANDO 4 · Profile (paridade LinkedIn)
| # | Item | Ref. | Estado |
| :--- | :--- | :--- | :---: |
| 4.1 | Aposentar `profile.repository.ts`; migrar `auth.service` para `unified-profile.repository` | §9 | ⬜ |
| 4.2 | Feed de atividade alimentado por eventos reais de domínio | §4 | ⬜ |
| 4.3 | Grafo de conexões persistido (hoje `toggleConnection` sem entidade) | §4 | ⬜ |
| 4.4 | Seções Experiência e Educação editáveis e persistidas | §4 | ⬜ |
| 4.5 | Perfil público de terceiros (`/profile/:userId`) respeitando visibilidade por seção | §4 | ⬜ |
| 4.6 | **Substituir todos os dados fabricados do perfil semente** — áudios de chuva, `cdn.example.com`, `storage.academia.mus.br` | K-05 | ⬜ |

## BLOCO 5 — COMANDO 5 · Practice (paridade Duolingo/Astra)
| # | Item | Ref. | Estado |
| :--- | :--- | :--- | :---: |
| 5.1 | Medição real em `RuleBasedPracticeScoringAdapter`: cents reais, detecção de ataque, rush/drag em ms | E-03 | ⬜ |
| 5.2 | Áudio real nos exercícios (síntese do intervalo/ritmo alvo via `engineGateway`) | E-01 | ⬜ |
| 5.3 | Streak, meta diária e ranking a partir de dados do usuário — **remover Bach/Chopin/Villa-Lobos do leaderboard** | K-05 | ⬜ |
| 5.4 | Vidas/tolerância a erro e progressão de dificuldade | §4 | ⬜ |
| 5.5 | Remover/absorver `PracticeScreen.tsx` legado (duplicata de `PracticeHomeScreen`) com justificativa | §9 | ⬜ |

## BLOCO 6 — COMANDO 6 · Cruzamentos
| # | Item | Ref. | Estado |
| :--- | :--- | :--- | :---: |
| 6.1 | `AcademyLesson.skills: string[]` → `skillIds: EntityId[]`; grafo lição↔habilidade; concluir lição desbloqueia a habilidade | §6 regra 1 | ⬜ |
| 6.2 | Prática → Notação; Notação → Estúdio (importar partitura como trilhas MIDI) | §6 regras 2–3 | ⬜ |
| 6.3 | Estúdio → Evidência (gravação finalizada gera `Evidence`) | §6 regra 4 | ⬜ |
| 6.4 | Entidade `Passport` persistida; carimbo automático por obra/era dominada | §6 regra 6 | ⬜ |
| 6.5 | Portfólio → Salas & Comunidade (submissão para banca e publicação no fórum) | §6 regra 7 | ⬜ |
| 6.6 | `docs/claude/06_CROSS_SYSTEM_INTEGRATION.md` | — | ⬜ |

---

## BLOCO 7 — COMANDOS 7–10 · Conhecimento e conteúdo
| # | Item | Ref. | Estado |
| :--- | :--- | :--- | :---: |
| 7.1 | Modelo de proveniência real: `Source`, `Chapter`, `Section`, `Concept`, `Competency`, `PageReference`, `CopyrightStatus`, `TransformationType` | K-02 | ⬜ |
| 7.2 | Pipeline de ingestão sobre `framework_knowledge/`: 37 transcrições Edinburgh + **5 livros / 1.592 páginas**, dos quais **688 exigem OCR em pt-BR** | K-01 | ⬜ |
| 7.3 | Knowledge Graph / Concept Graph / Competency Graph / Course Graph / Exercise Graph | — | ⬜ |
| 7.4 | Auditar as citações página-a-página existentes; remover ou marcar `UNVERIFIED` toda citação cuja fonte não esteja no repositório | K-03 | ⬜ |
| 7.5 | Fontes disponibilizadas: **Med ×2, Grout & Palisca, Berklee ×2** + Edinburgh. Faltam Suzuki, Hans Sitt e Maia Bang (violino) — necessários só quando o currículo de cordas entrar | K-04 | ✅ |
| 7.6 | Course Generation Engine (Source → … → Assessment) com revisão humana antes de publicar | — | ⬜ |
| 7.7 | Assessment Engine com banco de questões, distratores, explicação e proveniência por questão | — | ⬜ |
| 7.8 | Expandir o catálogo de 4 lições para o volume que sustente "paridade Coursera" | §4 | ⬜ |
| 7.10 | **Reancorar o currículo no Bohumil Med** (ADR-002): `seed-academy-content.ts` está estruturado sobre Edinburgh e precisa seguir a progressão do Med, com o *Livro de Exercícios* integrado ao longo do curso | ADR-002 | ⬜ |
| 7.11 | Edinburgh, Berklee e Grout passam a alimentar **Practice / Duolingo-Astra** e leitura complementar, não a espinha dorsal do currículo | ADR-002 | ⬜ |
| 7.13 | **Curso História da Música Ocidental** derivado de Grout & Palisca, capítulo a capítulo, com blocos interativos | ADR-007 | ⬜ |
| 7.14 | **Curso História da Música Brasileira** — Unidade 1 (Vasco Mariz) e Unidade 2 (Tinhorão), eixos separados por decisão editorial | ADR-007 | ⬜ |
| 7.15 | `CanonicalComposer` / `CanonicalWork` + `FieldProvenance` (proveniência por campo, não por entidade) | ADR-007 | ⬜ |
| 7.16 | `MusicKnowledgeService` com adaptadores Wikidata · MusicBrainz · IMSLP · Commons · Archive · VIAF/ISNI | ADR-007 | ⬜ |
| 7.17 | Rotas `/academia/conservatory`, `/conservatory/composer/:id`, `/conservatory/work/:id` | ADR-007 | ⬜ |
| 7.18 | **Contatar a Música Brasilis** pedindo autorização de uso de dados. Sem acordo, o adaptador fica desabilitado e a integração é apenas link de saída | ADR-007 | ⛔ |
| 7.19 | Mais exercícios de teoria derivados do *Livro de Exercícios* do Med, com citação de página | ADR-002 | ⬜ |
| 7.20 | **Adaptador Mutopia** — 2.124 pecas, PDF + MIDI + LilyPond, licenca de redistribuicao explicita | ADR-008 | ⬜ |
| 7.21 | Renderizacao NATIVA de partitura a partir de MIDI/LilyPond — nunca PDF embutido | ADR-008 | ⬜ |
| 7.22 | Atribuicao de editor e licenca por peca, alimentando `FieldProvenance` | ADR-008 | ⬜ |
| 7.23 | Estado "obra em dominio publico, edicao livre indisponivel" — sem link de saida | ADR-008 | ⬜ |
| 7.24 | **Editorar em MusicXML obras brasileiras de dominio publico** (Nazareth, Chiquinha Gonzaga, Callado, Carlos Gomes) — move a plataforma de extratora para contribuinte | ADR-008 | ⬜ |
| 7.12 | **OCR das duas obras do Med (688 páginas) é caminho crítico**, não tarefa secundária — sem ele não há currículo oficial | ADR-002 | ⬜ |
| 7.9 | Resolver as ilustrações: ou produzir/licenciar imagens reais, ou remover `illustrations[]` das lições | K-05 | ⬜ |

## BLOCO 8 — COMANDO 11 · Motores musicais
| # | Item | Ref. | Estado |
| :--- | :--- | :--- | :---: |
| 8.1 | Conectar `VoiceEarLabScreen` ao pitch real: `getUserMedia` + `AudioContext` + `engineGateway` | E-01 | ⬜ |
| 8.2 | Mover autocorrelação para `AudioWorklet` (hoje O(n²) na thread principal) | E-01 | ⬜ |
| 8.3 | Detecção de ataque, beat tracking, análise espectral | E-03 | ⬜ |
| 8.4 | Importação MusicXML + MIDI bidirecional; `exportToMusicXml` com duração, armadura, compasso, acidentes, vozes | E-02 | ⬜ |
| 8.5 | Adotar bibliotecas (renderização de partitura, áudio/MIDI, DSP) com registro de licença | E-05 | ⬜ |
| 8.6 | Motor Python quando for tecnicamente superior (contraponto SATB, análise de áudio) + contratos front↔node↔python | — | ⬜ |
| 8.7 | Telemetria de motor real — remover `latencyMs: 1` fixo | E-04 | ⬜ |
| 8.8 | `docs/claude/11_MUSIC_ENGINE_MATRIX.md` | — | ⬜ |

## BLOCO 9 — COMANDOS 12–13 · Studio, Score, Teacher Room
| # | Item | Ref. | Estado |
| :--- | :--- | :--- | :---: |
| 9.1 | Score Editor: entrada de notas, seleção, undo/redo, vozes, dinâmica, articulação, playback, persistência. Ligar a tela ao `exportToMusicXml` real (hoje é `alert()`) | §4 | ⬜ |
| 9.2 | Studio: síntese por canal, gravação, piano roll funcional, automação, render/export, persistência de projeto, undo/redo | §4 | ⬜ |
| 9.3 | Repositório + serviço de Rooms; professor cria curso, aula, exercício, tarefa, material, evento; aluno entrega; professor avalia | B-04 | ⬜ |
| 9.4 | Repositório + serviço de Community (fóruns, tópicos, respostas, moderação, eventos) | B-04 | ⬜ |
| 9.5 | Repositório + serviço de Worlds (obras, eras, grafo, passaportes) — remover os contadores fabricados | K-05 | ⬜ |
| 9.6 | Substituir os 19 `alert()` por fluxos reais | T-02 | ⬜ |

## BLOCO 10 — COMANDO 15 · Backend
| # | Item | Ref. | Estado |
| :--- | :--- | :--- | :---: |
| 10.1 | **Decisão sua:** stack de backend e hospedagem (Node/Fastify + PostgreSQL? Cloudflare Workers + D1? conforme `38_DEPLOYMENT_CLOUDFLARE.md`) | B-01 | ⛔ |
| 10.2 | Servidor HTTP real, independente do dev server do Vite | B-01 | ⬜ |
| 10.3 | Esquema relacional + migrações + seeds versionados | B-02 | ⬜ |
| 10.4 | Migrar `localStorage` → API; `localStorage` vira apenas cache offline | B-02 | ⬜ |
| 10.5 | Ativar o `ApiClient` como único caminho de dados da UI | B-03 | ⬜ |
| 10.6 | Autorização em **todo** endpoint; validação de entrada; rate limiting; CORS restrito | §1 | ⬜ |
| 10.7 | Armazenamento de artefatos (áudio, partituras, PDFs) com URLs assinadas | K-05 | ⬜ |
| 10.8 | `docs/claude/15_BACKEND_ARCHITECTURE.md` + `15_API_CONTRACTS.md` | — | ⬜ |

## BLOCO 11 — COMANDO 16 · Testes
| # | Item | Ref. | Estado |
| :--- | :--- | :--- | :---: |
| 11.1 | Instalar `jsdom` + `@testing-library/react`; habilitar teste de componente | Q-02 | ✅ |
| 11.2 | Testes unitários de `auth`, `academy`, `practice`, `profile` services | Q-01 | ⬜ |
| 11.3 | Testes de integração dos cruzamentos (Academy→Practice→Evidence→Profile) | §6 | ⬜ |
| 11.4 | E2E (Playwright): signup, login, matrícula, lição, quiz, exame, certificado, prática, portfólio, sala, admin | Q-01 | ⬜ |
| 11.5 | Testes de acessibilidade (axe) e de responsividade 320px–2560px | D-05 | ⬜ |
| 11.6 | Endurecer o CI: `npm audit`, testes de autorização, verificação de vazamento de segredos em `dist/` | Q-04 | ⬜ |
| 11.7 | `docs/claude/16_TEST_ARCHITECTURE.md` + `tests/TEST_MATRIX.md` | — | ⬜ |

## BLOCO 12 — Design System e UI/UX (transversal)
| # | Item | Ref. | Estado |
| :--- | :--- | :--- | :---: |
| 12.1 | Unificar os 3 sistemas de tokens em um só, consumido por Tailwind v4 `@theme`; migrar os 180 arquivos que usam classes cruas | D-01 | ⬜ |
| 12.2 | Alinhar a paleta ao bordô constitucional (#8B1E2D / #6B1420) ou emendar formalmente a Constituição | D-02 | ⬜ |
| 12.3 | Implementar a tipografia institucional (serifada + sans + mono) com carregamento e fallback | D-03 | ⬜ |
| 12.4 | Tema escuro, obrigatório para as telas de Estúdio | D-04 | ⬜ |
| 12.5 | Padronizar o idioma da navegação para pt-BR; corrigir links de submenu duplicados | T-07 | ⬜ |
| 12.6 | Code-splitting por rota (`React.lazy`); hoje são 1.244 kB num único bundle | §9 | ⬜ |
| 12.7 | Zerar os 28 warnings `no-explicit-any` | §9 | ⬜ |

## BLOCO 13 — COMANDO 17 · Documentação
| # | Item | Ref. | Estado |
| :--- | :--- | :--- | :---: |
| 13.1 | Reescrever `00_REPOSITORY_AUDIT.md` e `00_SOURCE_OF_TRUTH.md` para o estado real (254/72/107/72) | DOC-01 | ⬜ |
| 13.2 | `README.md` operacional + `CLAUDE.md` (incluindo a armadilha do `ComSpec` no Windows) | DOC-03 | ⬜ |
| 13.3 | Preencher os contratos de 16 linhas em `docs/harness/` | DOC-02 | ⬜ |
| 13.4 | Corrigir ou remover `metadata.json` (resíduo do AI Studio) | DOC-04 | ⬜ |
| 13.5 | Marcar todo documento com IMPLEMENTED / PARTIAL / PLANNED / BLOCKED / MOCK | — | ⬜ |

## BLOCO 14 — COMANDOS 18–19 · Paridade final e release gate
| # | Item | Estado |
| :--- | :--- | :---: |
| 14.1 | `docs/claude/18_FINAL_PARITY_AUDIT.md`, `18_FINAL_IMPLEMENTATION_STATUS.md`, `18_FINAL_GAPS.md` | ⬜ |
| 14.2 | Release gate: 20 critérios, incluindo "nenhum mock crítico", "nenhum dado fictício apresentado como real", "nenhuma permissão só no frontend" | ⬜ |

---

## Decisões — estado

| # | Decisão | Resultado |
| :--- | :--- | :--- |
| ✅ A | Hospedagem e persistência | **Cloudflare Pages + localStorage + backup JSON no Google Drive (`drive.appdata`) + login só com Google. Sem banco de dados.** Exige Cloudflare Pages Functions (não é banco) para verificar o ID token, guardar a allowlist de admin e fazer proxy de CORS. Ver ADR-001.A. |
| ✅ B | Livros-fonte | **5 obras reintegradas** (Med ×2, Grout/Palisca, Berklee ×2) + Edinburgh. 1.592 páginas, **688 exigem OCR**. Ver ADR-001.B. |
| ✅ C | Origem das mídias | **Wikidata (hub) + MusicBrainz + Wikimedia Commons + Internet Archive + Open Opus** (acesso direto), **IMSLP** (API oficial `API.ISCR.php`, sem CORS → proxy) **+ Musica Brasilis** (proxy), **upload de MP3 do usuário**, ilustrações e áudio por **renderização/síntese programática**. MuseScore descartado. Ver ADR-001.C. |
| ✅ D | Paleta | **`#991b1b` primário + `#6D1D2D` bordô secundário** (derivado, AAA). Ver ADR-001.D. |
| ✅ E | **Dados multiusuário** | **Cloudflare KV exclusivamente para as superfícies compartilhadas** (fórum, salas, conexões, ranking, perfil público). Todo dado pessoal permanece local-first. Ver ADR-001.E. |

### ✅ E · Dados multiusuário — decidido: Cloudflare KV com escopo mínimo

`localStorage` + `drive.appdata` são **privados de cada usuário**. Nada que precise ser visto por *outra pessoa* pode viver ali. Isso atinge diretamente os pilares LinkedIn e Skool do plano de negócio:

| Superfície | Precisa de estado compartilhado? |
| :--- | :--- |
| Academy, Practice, Studio, Score, Portfólio, Passaporte, Histórico | ❌ Não — funciona 100% local-first |
| Certificado verificável publicamente | ❌ Não — resolvido por assinatura Ed25519, sem armazenamento |
| **Fórum / Comunidade** | ✅ Sim |
| **Salas do Professor** (aluno entrega ↔ professor corrige) | ✅ Sim |
| **Conexões entre músicos** | ✅ Sim |
| **Ranking / ligas** | ✅ Sim |
| **Perfil público de terceiros** | ✅ Sim |

**Decisão:** Cloudflare KV, com escopo deliberadamente mínimo.

**Regra de fronteira (invariante de arquitetura):**
> Um dado só pode ir para o KV se for **impossível** exibi-lo sem que outra pessoa o leia.
> Todo o resto — aprendizado, prática, estúdio, partituras, portfólio, passaporte, histórico — permanece `localStorage` + backup no Drive, e **nunca** trafega para o KV.

Consequência: se o KV cair ou for desligado, o produto continua inteiro para cada usuário; apenas as superfícies sociais degradam. Isso preserva a natureza local-first da decisão A.

---

## BLOCO 15 — Itens criados pelas decisões ADR-001
| # | Item | Ref. | Estado |
| :--- | :--- | :--- | :---: |
| 15.1 | **`.gitignore`** criado — cobre `node_modules/`, `dist/`, `.env*`, `.wrangler/` e `framework_knowledge/` | ADR-001.B | ✅ |
| 15.2 | `git rm -r --cached framework_knowledge` — 95 arquivos saíram do índice, 110 MB preservados em disco. Verificado: os 5 livros comerciais **nunca estiveram no histórico** | ADR-001.B | ✅ |
| 15.2b | **Decisão pendente:** o corpus Edinburgh está no commit `cbe50f1`. Sair do índice não o remove do histórico. Se o repositório for público, exige reescrita de histórico (ação destrutiva — só com sua autorização) | ADR-001.B | ⛔ |
| 15.2c | Versionar `package-lock.json` (hoje não rastreado) para build reprodutível no Cloudflare | ADR-001.A | ⬜ |
| 15.15 | Camada `SharedStateAdapter` sobre Cloudflare KV, com a regra de fronteira do item E | ADR-001.E | ⬜ |
| 15.16 | Índice de pessoas em KV + `GET /api/v1/people/search` executado na Function (índice nunca chega ao navegador) | ADR-003 | ⬜ |
| 15.17 | **Indexação automática no login** — nunca manual pelo Admin, sob pena de virar gargalo operacional | ADR-003 | ⬜ |
| 15.18 | Fórum e entregas com **uma chave por item** (`thread:<id>:reply:<ts>:<userId>`) para eliminar colisão de escrita | ADR-003 | ⬜ |
| 15.19 | Upload ao Drive com escopo `drive.file` + extração de picos/duração **no momento do upload** | ADR-004 | ⬜ |
| 15.20 | Player nativo de áudio e `<img>` direto via `lh3.googleusercontent.com/d/<id>` (CORS liberado, verificado) | ADR-004 | ⬜ |
| 15.21 | Consentimento explícito antes de publicar ("qualquer pessoa com o link") + caminho de despublicar | ADR-004 | ⬜ |
| 15.22 | Estado "mídia indisponível" quando o autor revoga o compartilhamento — nunca player quebrado | ADR-004 | ⬜ |
| 15.23 | **Migrar roteamento de hash para `history.pushState`** — pré-requisito de todo SEO; hash não é indexável | ADR-005 | ⬜ |
| 15.24 | Criar `/founder/seo`, `/founder/communication`, `/founder/commercial`; descontinuar `/founder/users`, `/founder/content`, `/founder/engines` | ADR-005 | ⬜ |
| 15.25 | Aba "Dados" em Configurações — backup, restauração, mídia no Drive, exclusão de conta | ADR-001.A | ⬜ |
| 15.3 | Google Sign-In real (GIS) substituindo o `GoogleOAuthModal` simulado; escopos `openid email profile drive.appdata` | ADR-001.A | ⬜ |
| 15.4 | Cloudflare Pages Function: verificação de assinatura do ID token contra o JWKS do Google | ADR-001.A / S-01 | ⬜ |
| 15.5 | Allowlist de admin como *secret* de ambiente + verificação no CI de que não vaza para `dist/` | ADR-001.A / S-02 | ⬜ |
| 15.6 | Serviço de backup/restauração no Drive: snapshot JSON versionado, merge por *timestamp*, restauração em novo dispositivo | ADR-001.A | ⬜ |
| 15.7 | Certificado assinado com Ed25519 + endpoint público de verificação (sem armazenamento) | ADR-001.A | ⬜ |
| 15.8 | Cloudflare Function de proxy para IMSLP e Musica Brasilis. Deve tratar as 3 armadilhas do IMSLP: URL **posicional com `/`**, `Content-Type: text/plain` entregando JSON, e retorno como **objeto indexado** em vez de array | ADR-001.C / 21.1 §2 | ⬜ |
| 15.9 | Adaptadores tipados com timeout, retry com backoff e degradação graciosa: **Wikidata, MusicBrainz, Wikimedia Commons, Internet Archive, Open Opus** (acesso direto) + **IMSLP, Musica Brasilis** (via proxy) | ADR-001.C / 21.1 §3 | ⬜ |
| 15.9a | **Camada de resolução de entidades** — `CanonicalWorkIdentity` e `CanonicalPersonIdentity` com Wikidata como hub (`P86`/`P839`/`P435`/`P434`/`P373`/`P18`) | 21.1 §4 | ⬜ |
| 15.9b | `PublicDomainAssessment` — domínio público **calculado** a partir de `P570` (vida + 70, Lei 9.610/98). `PROTECTED`/`UNDETERMINED` **não renderiza mídia**. Licença por arquivo do IMSLP prevalece sobre o cálculo da obra | 21.1 §5 | ⬜ |
| 15.9c | `User-Agent` identificável em toda chamada externa + respeito a `X-RateLimit-*` do MusicBrainz + backoff em `503` | 21.1 §7 | ⬜ |
| 15.9d | Substituir os identificadores hardcoded (`'bwv-1001'`, `'sala-chopin'`…) por `CanonicalWorkIdentity` resolvida | 21.1 §9 | ⬜ |
| 15.10 | Ingestão com **OCR em pt-BR** para as 688 páginas digitalizadas (Med ×2) e validação de amostra em Grout | ADR-001.B | ⬜ |
| 15.11 | Importação de MP3 do usuário (`decodeAudioData`), processamento 100% local | ADR-001.C | ⬜ |
| 15.12 | Renderização programática de ilustrações (pauta, ciclo das quintas, teclado, braço, cifras) em SVG — **vedada geração por IA de manuscritos/gravuras históricas** | ADR-001.C / 21.1 §8 | ⬜ |
| 15.13 | Rampa de cor completa para `#991b1b` e `#6D1D2D` no `@theme` do Tailwind v4 | ADR-001.D | ⬜ |
| 15.14 | Deploy no Cloudflare Pages + configuração de build e variáveis de ambiente | ADR-001.A | ⬜ |


---

## BLOCO 4 — COMANDO 4 · Profile (paridade LinkedIn) ✅ **CONCLUIDO** (2026-09-17)

> Profile 36 -> **92/100**. As 4 telas em FULL. Sete defeitos corrigidos, todos
> com teste de regressao (24 casos novos). Detalhamento em `CLAUDE_AUDIT.md` §14.

| # | Item | Origem | Estado |
|---|---|---|---|
| 4.1 | `/profile/:userId` criada — sem ela a premissa "LinkedIn de musicos" era estruturalmente vazia (P-05) | §14 | ✅ |
| 4.2 | `/profile/network` — diretorio de musicos, o caminho que faltava para alcancar outro perfil | §14 | ✅ |
| 4.3 | Vazamento por substring "founder" fechado (P-01) | §14 | ✅ |
| 4.4 | Perfil de terceiro passa a receber projecao publica, nunca o registro cru (P-02) | §14 | ✅ |
| 4.5 | Identidade de conexao deixa de ser inventada (P-03); `usr_founder_1` cravado removido (P-06) | §14 | ✅ |
| 4.6 | Conexoes semeadas apontando para perfis inexistentes removidas; contador consistente (P-04) | §14 | ✅ |
| 4.7 | **`sha256Hash` passa a ser SHA-256 de verdade** em evidencias e certificados; verificacao recalcula e compara (P-07) | §14 | ✅ |
| 4.8 | Orfaos reconectados: `ProfileHeader`, `SegmentedControl`, `Credential`, `Modal`, `Tabs`. `ProfileCard` NAO — exige e-mail e traz credenciais falsas de fabrica | §14 | ✅ |
| 4.9 | **O seed da fundadora e um curriculo fabricado** (percentil 99,8; 420h; posts com 215 upvotes) e vai para producao com o nome real dela. Esvaziar e decisao de produto | §14 | ⬜ **decisao da Aline** |
| 4.10 | `PortfolioScreen`: `alert()` fingindo exportar PDF trocado por exportacao real em JSON (o mesmo formato do backup no Drive) | §14 | ✅ |
| 4.11 | Estados de pagina em Profile: media **2,5 de 5** por tela (era 0). Nenhuma tela com zero | DoD | ✅ |


---


## PENDÊNCIAS REAIS — levantamento de 2026-09-18

> **Como esta lista foi feita.** Cada número veio de `npm run qa`,
> `node scripts/auditar-rotas.mjs` ou da suíte, executados nesta data. Nenhum
> item foi estimado, e nenhum foi dado por fechado porque a tela existe.
> Substitui a lista de 2026-09-17, que era parcial.
>
> **Estado medido agora:** 83 rotas · 81 telas · 0 órfãs · **0 bloqueios e 0
> correções** no pente fino · **527 testes** passando · tsc e eslint limpos.
>
> **Harness reorganizado em 2026-09-18.** `HARNESS_CLAUDE.md`,
> `HARNESS_AI_STUDIO.md`, `73_ANTIPATTERNS.md` e `74_QUALITY_RITUAL.md`
> são novos; `35_TEST_STRATEGY`, `66_TEST_CASE_LIBRARY`, `43_RELEASE_GATES`,
> `40_AGENTS_HARNESS`, `13_DEFINITION_OF_DONE` e `README` foram reescritos
> com o que a auditoria mostrou que faltava.

### O que já foi fechado neste levantamento

Registrado aqui porque a lista anterior não continha estes itens — eles só
apareceram quando o pente fino passou a procurá-los.

| Achado | Onde estava |
| :--- | :--- |
| ✅ Vazamento de dado entre alunos: `listMasteriesByUser()` ignorava o `userId` e devolvia o desempenho de todos | `practice.repository.ts` |
| ✅ Progresso falso semeado em conta nova: 7 dias de sequência, 14 de recorde, 18/20 min da meta, ranking com Bach e Clara Schumann | `seed-practice-content.ts` |
| ✅ Catálogo paralelo fabricado, 197 linhas, **consumido por nenhuma tela** — apagado | `course.repository.ts` |
| ✅ Três recitais fixos exibidos em todo perfil, incluindo um no Theatro Municipal | `EventsTab.tsx` |
| ✅ Gravação de Bach de abril de 2024 exibida em todo perfil | `ActivityTab.tsx` |
| ✅ Criar sala chamava `setTimeout(400)` e navegava — não gravava nada | `CreateRoomScreen.tsx` |
| ✅ Diretório com três turmas de professores inventados | `RoomsDirectoryScreen.tsx` |
| ✅ Detalhe da sala ignorava o id da rota; listava a fundadora como aluna com nota 9,5 | `RoomDetailScreen.tsx` |
| ✅ "Garantir participação" respondia com um alerta de "inscrição confirmada" sem inscrever | `EventsDirectoryScreen.tsx` |
| ✅ "Publicar no fórum" limpava o campo e não gravava; dois debates inventados | `CommunityFeedScreen.tsx` |
| ✅ Tópico ignorava o id e mostrava sempre o mesmo debate, com resposta de professor inexistente | `TopicDetailScreen.tsx` |
| ✅ Trilha de auditoria relatando **uma tentativa de acesso não autenticado que nunca houve** | `AdminAuditScreen.tsx` |
| ✅ Quatro "motores" com versão, latência e saúde inventadas; diagnóstico que não consultava nada | `AdminEnginesScreen.tsx` |
| ✅ Quatro usuários inventados; botões de provisionar conta e editar permissão que não agiam | `AdminUsersScreen.tsx` |
| ✅ Dois planos curriculares inventados, enquanto o catálogo real ao lado não aparecia | `AdminContentScreen.tsx` |
| ✅ Certificado dizia "ACADEMIA MUSICAL DIGITAL · CÁTEDRA DE **ENSINO SUPERIOR** LIVRE" e não trazia a ressalva de curso livre | `CertificateScreen.tsx` |
| ✅ "Salvar partitura" acendia "Salvo!" por 3 s sem gravar | `ScoreScreen.tsx` |
| ✅ Laboratório auditivo inteiro fingido: afinador com valores fixos, intervalo que não tocava, resposta que não corrigia, "85% de precisão" de quem nunca respondeu | `VoiceEarLabScreen.tsx` |
| ✅ Inspetor de estados de desenvolvimento **exposto ao aluno em produção** | `ScreenContainer.tsx` |
| ✅ Banner "Todos os serviços operando · Status 100% Online" sem nenhuma verificação | `HelpScreen.tsx` |
| ✅ Senha de conta infantil trocada por diálogo do navegador: texto visível, sem confirmação | `KidsGuardianScreen.tsx` |
| ✅ Blocos inteiros de texto sem acentuação em três telas | Academy, Profile |

---

### A — Acessibilidade ✅ **as 129 correções foram feitas**

| # | Item | Era | Agora |
| :--- | :--- | ---: | ---: |
| A.1 | Campo de formulário sem rótulo acessível | 94 | **0** |
| A.2 | Elemento clicável que o teclado não alcança | 22 | **0** |
| A.3 | Botão só com ícone e sem `aria-label` | 13 | **0** |

Como foi feito, e por que a distinção importa:

- **Rótulo por vínculo, não por proximidade.** O padrão da base era
  `<label>Texto</label>` seguido do campo como IRMÃO. Parece rótulo e não é:
  clicar no texto não põe foco no campo, e o leitor de tela anuncia "caixa de
  edição" sem dizer de quê. 44 pares ganharam `htmlFor`/`id`.
- **Texto ao lado virou nome acessível.** `<span>Clave:</span>` antes de um
  seletor é o rótulo — 23 campos ganharam `aria-label` a partir dele, ou do
  `placeholder` quando ele descrevia o campo. Placeholder de FORMATO
  (`https://…`) foi excluído de propósito: ele diz como digitar, não o quê.
- **Clicável virou botão.** Alternativa de prova, lição da grade, resultado de
  busca e cartão de navegação eram `<div onClick>` — que não recebe foco e não
  responde a Enter. Quem navega por teclado **não conseguia responder a prova**.
- **Controle de valor ganhou teclado.** A régua da linha do tempo é um
  `slider` com setas; a nota do piano roll e a linha de tabela respondem a
  Enter. O fundo dos diálogos recebeu `role="presentation"`, porque fechar
  clicando fora é atalho de mouse e o caminho garantido é a tecla Esc.

Os tetos em `tests/pente-fino.test.ts` foram baixados a zero.

---

### B — Visitante e aluno · 39 de 81 telas não distinguem

A guarda de rota protege o acesso; ela **não** faz a tela pública adaptar o
conteúdo. Uma tela pública que fala com o aluno quando quem lê é visitante
promete o que não pode cumprir.

| # | Área | Telas | Estado |
| :--- | :--- | ---: | :---: |
| B.1 | `admin` — todas exigem login; confirmar se a guarda basta ou se falta mensagem | 9 | ⬜ |
| B.2 | `academy` — as públicas precisam de versão visitante de verdade | 8 | ⬜ |
| B.3 | `studio` | 4 | ⬜ |
| B.4 | `auth` — são `somenteVisitante`; verificar se a distinção é necessária | 3 | ⬜ |
| B.5 | `practice` | 3 | ⬜ |
| B.6 | `worlds` | 3 | ⬜ |
| B.7 | `profile` (2) · `credentials` · `help` · `notfound` · `notifications` · `rooms` · `score` · `search` | 9 | ⬜ |

---

### C — Persistência

| # | Item | Estado |
| :--- | :--- | :---: |
| C.1 | Progresso, avaliação e frequência sobrevivem ao recarregar — 13 casos em `tests/persistencia-e-isolamento.test.ts` | ✅ |
| C.2 | Dado de um aluno não chega ao outro no mesmo dispositivo | ✅ |
| C.3 | **Cópia de segurança em JSON no Drive da pessoa** — nunca executada de ponta a ponta. **É a única coisa que impede perda total ao limpar o navegador.** | ⛔ depende de **I.7** (escopo `drive.file`) |
| C.4 | Restaurar a partir do backup — o caminho inverso não existe | ⬜ |
| C.5 | **Edição do conteúdo pelo admin** — camada editorial, correção na própria leitura, sobrevive à publicação, e o livro da biblioteca sai com ela. 17 casos em `tests/edicao-editorial.test.ts` | ✅ |
| C.6 | Livreto — exercícios, simulados e provas gravam e voltam. Coberto no mesmo arquivo | ✅ |
| C.7 | Exportar e apagar todos os dados (LGPD) — `68_DATA_RETENTION_EXPORT_DELETE.md` sem implementação | ⬜ |

---

### D — Recursos que a tela sugeria e que não existem

Os controles que mentiam foram removidos; os recursos continuam abertos.

| # | Item | Onde | Estado |
| :--- | :--- | :--- | :---: |
| D.1 | Exportar e importar MusicXML | Score, Studio | ⬜ |
| D.2 | Salvar partitura (exige repositório + serialização do editor) | Score, Studio | ⬜ |
| D.3 | Persistir projeto da mesa de mixagem | `DawProjectScreen` | ⬜ |
| D.4 | Fila de moderação do fórum (denunciar conteúdo) | Community | ⬜ |
| D.5 | Sistema de chamados — hoje é um e-mail para a instituição | Help | ⬜ |
| D.6 | Tarefas da sala: publicar, entregar evidência, avaliar | Rooms | ⬜ |
| D.7 | Matrícula do aluno na sala (a capacidade já existe no modelo) | Rooms | ⬜ |
| D.8 | Criar evento da Academia (a inscrição já funciona; falta quem crie) | Community | ⬜ |
| D.9 | Registrar evento, gravação e partitura no perfil (o tipo existe; falta a tela) | Profile | ⬜ |

---

### E — Texto e conteúdo

| # | Item | Estado |
| :--- | :--- | :---: |
| E.1 | **Revisão humana dos 126 capítulos dos 5 cursos.** O pente fino confere acentuação de lista fechada, pontuação e markdown. **Não confere concordância, regência, coesão nem se a frase cabe no lugar.** Nenhum capítulo passou por revisão. | ⬜ |
| E.2 | Revisão de correção **musical** do conteúdo — que o capítulo 5 corresponda à lição 5 está testado; que o que ele ensina esteja certo, não | ⬜ |
| E.3 | 17 dos 58 capítulos de Teoria sem laboratório sonoro (6, 7, 8, 20, 27, 28, 30, 33, 34, 36, 37, 38, 47, 48, 49, 57, 58) | ⬜ |
| E.4 | Vídeo na lição — só existe um bloco reservado. É a maior lacuna de paridade. | ⬜ |

---

### F — O que só olho humano ou navegador real pega

Descrito em `docs/harness/72_QUALITY_SWEEP.md`. Repetido aqui porque é
pendência, não nota de rodapé.

| # | Item | Estado |
| :--- | :--- | :---: |
| F.1 | **Mobile** — nenhuma verificação toca largura, alvo de toque ou gesto | ⬜ |
| F.2 | **Navegador real** — os testes rodam em jsdom, que não tem layout nem som. O defeito da lupa (texto empurrado para fora durante a animação) **não era reproduzível em jsdom** e só apareceu abrindo o navegador. Falta uma passada manual tela a tela. | ⬜ |
| F.3 | Aparência: contraste, espaçamento, hierarquia | ⬜ |
| F.4 | `navigate(variavel)` — só destinos literais são conferidos | ⬜ |

---

### G — Decisões que dependem de você

| # | Item | Estado |
| :--- | :--- | :---: |
| G.1 | ~~Criar o OAuth Client ID~~ — **feito em 18/09/2026.** Login real do Google funcionando em `localhost:3000`. O que resta de infraestrutura virou a seção **I**, com cronologia própria | ✅ |
| G.2 | O seed do perfil da fundadora é um currículo fabricado (percentil 99,8 · 420 h · posts com 215 apoios) e vai a produção com seu nome. Esvaziar? | ⛔ |
| G.3 | `OAuthCallbackScreen` ficou órfã de propósito (o login usa janela, não redirecionamento). Remover? | ⛔ |

---

### P — Practice · levantamento de 2026-09-18

Medido, não estimado: `repo`, `usuário` e `alert` contados arquivo a arquivo.

**O Practice não era um vazio — era quase tudo real.** 15 das 16 telas já
liam do repositório e conheciam o usuário logado. Nenhuma tinha botão falso.

| # | Item | Estado |
| :--- | :--- | :---: |
| P.1 | `/practice/trainer` com três questões fixas, e sessão abrindo com **40 XP e 7 dias de ofensiva que ninguém fez**. Nada era gravado | ✅ corrigido |
| P.2 | Domínio `treino-de-intervalos` — questões **geradas da teoria**, um só lugar para o Practice e o laboratório do Studio | ✅ |
| P.3 | 18 casos garantindo que a geração é musicalmente correta. **Um deles pegou defeito real no gerador**: sementes sequenciais davam sempre a mesma raiz | ✅ |
| P.4 | Unificar o laboratório de intervalos do Studio com o mesmo domínio | ✅ |
| P.5 | A aba de ritmo do trainer: o metrônomo toca, mas não mede nem grava a execução | ⬜ |
| P.6 | A aba de acordes está declarada no seletor e não existe | ⬜ |
| P.7 | Ligar a tentativa gravada à ofensiva, à meta do dia e ao domínio de habilidade | ⬜ ver **T-15** |
| P.8 | **Decidido: a liga se constrói agora, completa.** `domain/liga.ts` — apuração, subida, queda, fechamento de semana, quatro recortes. 26 casos. Zero participantes devolve zero linhas, e isso é a resposta certa | ✅ |

> **O Practice ganhou mapa.** O levantamento de paridade de 18/09 mostrou que
> ele não é uma área solta: ancora-se no Atlas — era, região, ilha, obra. Ver
> a seção **T**, que reorganiza P.5–P.8 dentro dessa estrutura.

---

### H — Verificações que ainda não existem

Cada linha é um antipadrão de `73_ANTIPATTERNS.md` sem vigilância automática.
Está escrito em vez de dar impressão de cobertura.

| # | Antipadrão sem verificação | Estado |
| :--- | :--- | :---: |
| H.1 | **A5** — painel que responde sem consultar. Só parcial hoje | ⬜ |
| H.2 | **E3** — estado de tela que os dados não governam | ⬜ |
| H.3 | **E4** — segunda fonte de verdade descrevendo a mesma entidade | ⬜ |
| H.4 | **A4** — a conferência é por arquivo: se um arquivo tem duas afordâncias e perde a guarda de uma, não pega | ⬜ |
| H.5 | Coesão entre pergunta e explicação de um `CHECKPOINT` — hoje só a edição preserva os dois juntos | ⬜ |

---

### Ordem sugerida

1. **I.0** — apagar a chave secreta do cliente. Dois minutos, e nada no projeto a usa.
2. **F.2** — uma passada no navegador de verdade, tela a tela, **agora com login real do Google funcionando**. É a classe de defeito que nenhum teste daqui alcança, e foi ela que produziu o pior erro do projeto.
3. **B.2** — as 8 telas públicas do Academy são as que o visitante mais vê.
4. **E.1** — revisão do texto, capítulo a capítulo.
5. **Practice** (comando 5-6) — **iniciado**. Ver o levantamento abaixo: 15 das 16 telas já liam dado real; a que faltava foi corrigida.
6. Só depois de o produto estar pronto: a seção **I**, de I.2 em diante.

~~A.1 nos seis arquivos concentrados~~ — feito. ~~G.1 OAuth Client ID~~ — feito.

---

## INFRAESTRUTURA E IDENTIDADE — cronologia até a publicação

> **Decisão registrada:** o projeto é terminado **primeiro**; domínio e
> servidor vêm depois. Esta seção existe para que "depois" tenha uma ordem
> escrita, e para que nada dela seja descoberto tarde.
>
> Atualizado em 2026-09-18, quando o primeiro Client ID OAuth foi criado.

### Estado de hoje

| Item | Estado |
| :--- | :---: |
| Client ID OAuth (Web) criado no Google Cloud | ✅ 18/09/2026 |
| `.env.local` configurado — login real funcionando em `localhost:3000` | ✅ |
| `ADMIN_ALLOWLIST` com os dois e-mails institucionais | ✅ |
| Chaves HMAC de sessão e auditoria geradas para desenvolvimento | ✅ |
| Domínio registrado | ⬜ |
| Cloudflare Pages configurado | ⬜ |
| Repositório no GitHub conectado ao Cloudflare | ⬜ |
| Origens de produção autorizadas no OAuth | ⬜ |
| Publicação da tela de consentimento (sai de "usuários de teste") | ⬜ |
| Client ID Android | ⬜ |

> **A chave secreta do cliente não foi usada, e não será.** Esta arquitetura
> verifica a assinatura do ID token contra as chaves públicas do Google
> (JWKS). Chave secreta serve ao fluxo de código de autorização, que o projeto
> não usa. Ver `I.0`.

---

### I · Identidade e publicação — **nesta ordem**

#### I.0 · Apagar a chave secreta do cliente ⬜ **agora**

A `GOCSPX-…` foi gerada junto com o Client ID e colada em conversa. Como
**nada no projeto a usa**, o caminho limpo é apagá-la:

> Google Cloud Console → APIs e Serviços → Credenciais → o cliente OAuth →
> **Chaves secretas do cliente** → apagar.

Isso não afeta o login. Se algum dia um fluxo de servidor precisar de uma,
gera-se outra, e ela vive **só** como variável de ambiente do Cloudflare.

O pente fino passou a barrar `GOCSPX-…` no repositório — verificação
`nenhum segredo de credencial versionado`.

#### I.1 · Terminar o produto ⬜ **antes de tudo o que segue**

Enquanto o desenvolvimento roda em `localhost:3000`, que já está autorizado,
nada abaixo é necessário. Antecipar domínio só cria configuração para
refazer.

#### I.2 · Registrar o domínio ⬜

`conservatoriomuscicapa.com.br` ou `.com`. **Decisão pendente.**

Consequência técnica: a escolha define as origens do OAuth, o certificado, e
o endereço que vai impresso no certificado do aluno e na verificação pública
de credencial — `/credential/<código>` é uma rota pública, e é o endereço
que um empregador vai abrir.

#### I.3 · Conectar o repositório ao Cloudflare Pages ⬜

Depende de: I.2.

- [ ] Repositório no GitHub (hoje o projeto é local)
- [ ] Cloudflare Pages ligado ao repositório, publicação a partir do git
- [ ] Comando de build `npm run build` — que já encadeia `tsc`, verificação de
      segredos, de citações e o pente fino, e **falha a publicação** se algum
      acusar
- [ ] Variáveis de ambiente no painel, **com chaves HMAC novas** — as de
      `.env.local` são de desenvolvimento e não vão para produção
- [ ] `ALLOWED_ORIGIN` apontando para o domínio, sem curinga

#### I.4 · Autorizar as origens de produção no OAuth ⬜

Depende de: I.2, I.3.

No cliente OAuth já criado, acrescentar em **Origens JavaScript autorizadas**:

```
https://conservatoriomuscicapa.com.br
https://www.conservatoriomuscicapa.com.br
https://<projeto>.pages.dev          ← a prévia do Cloudflare
```

Manter `http://localhost:3000` para o desenvolvimento continuar funcionando.

> Origem errada ou faltando dá erro **na hora do login**, e é o modo de falha
> mais comum de publicação com OAuth. Conferir os dois percursos — domínio e
> prévia — antes de anunciar qualquer coisa.

#### I.5 · Publicar a tela de consentimento ⬜

Depende de: I.2, I.4.

Hoje o acesso é **restrito a usuários de teste** — só os e-mails listados
conseguem entrar. Para qualquer pessoa se matricular, a tela de consentimento
precisa sair do modo de teste.

- [ ] Logotipo, nome e domínio verificado
- [ ] Política de privacidade e termos publicados em endereços do domínio
- [ ] Escopos pedidos: **apenas** os mínimos. Ver `I.7`
- [ ] Verificação do Google, se os escopos exigirem

#### I.6 · Subdomínio da administração ⬜ **decisão sua**

Você levantou a pergunta certa, e a resposta tem duas partes.

**Feito em 20/09: a rota passou a ser `/founder`.** `/admin` não existe mais
— não redireciona, cai no `NotFoundScreen` como qualquer endereço inventado,
porque redirecionar confirmaria que há o que procurar.

**O que o nome NÃO faz.** Não é controle de segurança. O que de fato protege
já está no lugar: a allowlist vive no servidor, a sessão é assinada, e
allowlist vazia significa nenhum administrador. Nome nenhum substitui isso.

**O que ele FAZ, e é legítimo:** não anunciar que existe um console. `/admin`
é o primeiro alvo de qualquer varredura automática; `/founder` não está em
lista nenhuma. Camada válida **depois** da que decide, nunca no lugar dela.
`checkNoGuessableAdminRoute` impede a volta.

**O que um subdomínio separado FAZ, e é real:**

| Ganho | Por quê |
| :--- | :--- |
| **Cloudflare Access na frente** | Uma política de acesso fecha o subdomínio **antes** de a aplicação carregar. Quem não passar nem vê a tela — e isso é controle de verdade, não obscuridade |
| **Origem separada** | Sessão e armazenamento do painel não compartilham origem com a área do aluno. Uma falha de um lado não alcança o outro |
| **Registro separado** | Dá para ver, no painel do Cloudflare, quem tentou chegar à administração |
| **Regra de firewall própria** | Limite de tentativas e restrição por país, só ali |

**Recomendação.** `fundador.conservatoriomuscicapa.com.br`, **com Cloudflare
Access exigindo o seu e-mail do Google**. O nome diferente é ganho marginal;
o Access é o que muda o jogo. E você continua entrando com o mesmo e-mail
Google de sempre — o Access pede a conta antes, a aplicação confere a
allowlist depois. Duas barreiras independentes.

Depende de: I.2, I.3. **Tarefa de implementação, depois da decisão:**

- [ ] Subdomínio apontado para o mesmo projeto do Pages
- [ ] Política do Cloudflare Access com os dois e-mails institucionais
- [ ] Origem do subdomínio autorizada no OAuth
- [ ] **A rota `/founder` continua existindo na aplicação** — o subdomínio é
      camada adicional, e a autoridade de sessão continua sendo a garantia
- [ ] Verificar que a área do aluno **não** responde no subdomínio, e
      vice-versa

#### I.7 · Escopos e a cópia no Drive ⬜

Depende de: I.5. **Bloqueia `C.3` e `C.4`.**

A cópia de segurança em JSON no Drive da pessoa exige escopo além do perfil
básico. O escopo correto é **`drive.file`** — dá acesso somente aos arquivos
que a própria aplicação criou, e não à biblioteca inteira de quem usa.

- [ ] Acrescentar `drive.file` aos escopos
- [ ] Verificar se aciona verificação do Google e quanto tempo leva
- [ ] Implementar gravação e **restauração** (`C.4`)
- [ ] Testar de ponta a ponta, com conta real

> É a única defesa contra perda total quando alguém limpa o navegador, e o
> item que mais tempo ficou sem verificação.

#### I.8 · Client ID Android ⬜ **futuro**

Depende de: I.5, e da decisão sobre o aplicativo nativo (`F.1` de mobile).

O cliente Web **não serve** para Android: o Google exige um cliente de tipo
próprio, com o nome do pacote e a impressão SHA-1 do certificado de
assinatura.

- [ ] Decidir: aplicativo nativo, ou site instalável (PWA)?
      **Um site instalável não precisa de cliente Android** — usa o mesmo
      cliente Web. Isso pode eliminar este item inteiro
- [ ] Se nativo: cliente OAuth do tipo Android, com pacote e SHA-1
- [ ] SHA-1 de depuração **e** de publicação — são diferentes, e esquecer o
      segundo quebra o login só na loja
- [ ] Mesma tela de consentimento; o `aud` do token passa a ter dois valores
      válidos, e a verificação no servidor precisa aceitar os dois

#### I.9 · Domínio de e-mail institucional ⬜

Hoje a Central de Ajuda aponta para `suporte@conservatoriomuscicapa.com.br`,
que **ainda não existe**. Depende de I.2.

---

### Ordem executável

```
  I.0  apagar a chave secreta              agora, 2 minutos
  I.1  terminar o produto                  o resto do TODO
   ↓
  I.2  registrar o domínio                 decisão sua
  I.3  GitHub + Cloudflare Pages
  I.4  origens de produção no OAuth
  I.5  publicar a tela de consentimento
   ↓
  I.6  subdomínio + Access                 decisão sua
  I.7  escopo do Drive → destrava C.3, C.4
   ↓
  I.8  Android — só se for aplicativo nativo
  I.9  e-mail institucional
```

> **Nada de I.2 em diante é necessário para terminar o produto.** O
> desenvolvimento roda em `localhost:3000`, que já está autorizado, com login
> real do Google funcionando desde 18/09/2026.

---

## T · ATLAS E PRACTICE — do mapeamento de paridade, 2026-09-18

> **Origem:** `docs/parity/VOL2_ASTRA_DUOLINGO.md`, mapeado captura por
> captura. Taxonomia em `docs/harness/75_ATLAS_TAXONOMY.md`; contagem em
> `docs/harness/76_PROGRESS_ECONOMY.md`.
>
> **A ordem abaixo não é arbitrária.** Vocabulário antes de estrutura,
> estrutura antes de tela, tela antes de competição. Construir fora de ordem
> obriga a refazer: uma tela de liga feita antes de a contagem existir vai
> exibir número que ninguém sabe de onde veio.

### Estado encontrado

| Achado | Onde |
| :--- | :--- |
| `MusicalWorld`, `InstrumentIsland`, `RankingLeague`, `CulturalPassport`, `WorldTour` existem no domínio e **nenhuma tela os consome** | `domain/gamification.ts` |
| As 5 eras do Atlas estão escritas na tela, com **contagens de obra inventadas** — "142 obras canônicas" numa plataforma sem acervo | `WorldsAtlasScreen` |
| Os 5 compositores do grafo estão escritos na tela | `MusicGraphScreen` |
| **Região** e **Tribo** não existem | — |
| O pente fino **não pegava** os dois primeiros: `worksCount` escapava do padrão `\bcount` | corrigido em 18/09 |

---

### T.1 · Vocabulário — **antes de qualquer código**

| # | Item | Estado |
| :--- | :--- | :---: |
| T-1 | Rota `/worlds` → `/atlas`. O mapa não é um dos seus eixos | ⬜ |
| T-2 | "Música Brasileira de Tradição" está listada como **era**; é **região** | ✅ |
| T-4 | **Decidido: ilha removida.** `InstrumentIsland` → `Tribo`, com natureza `INSTRUMENTO`/`DISCIPLINA`/`OFICIO`. Tribo é grupo nichado, não lugar — e por isso perdeu a coordenada de mapa e ganhou a tribo dos historiadores | ✅ |

**Testes:** `tests/taxonomia-do-atlas.test.ts`
- nenhum termo do catálogo aparece com dois significados no código
- toda rota do Atlas responde pelo nome catalogado

---

### T.2 · Domínio do Atlas — **iniciado em 18/09**

> `tests/atlas.test.ts`, 16 casos. O que eles travam: a contagem é **contada**
> (regressão de "142 obras canônicas"), "Brasil" é região e não era, nenhuma
> era carrega contagem embutida, e ilha sem currículo não é simulada.

| # | Item | Estado |
| :--- | :--- | :---: |
| T-3 | Criar `Regiao` ✅ · acrescentar `regiaoId` a `MusicalWorld` e `AtlasWorkPlacement` ⬜ | ◑ |
| T-5 | Criar `Genero` como **faceta** de obra, não entidade | ✅ 16 gêneros |
| T-10 | `atlas.repository` — eras, regiões, gêneros, ilhas, obras. Acervo **nasce vazio** | ✅ |
| T-11 | Semear com o que existe: **8 eras** dos cursos de História, **3 regiões**, **16 gêneros**. Contagem de obras é contada | ✅ |

**Testes:** `tests/atlas.test.ts`
- uma obra se situa em era, região e ilha ao mesmo tempo
- ilha `PLANNED` aparece no mapa e **não** é navegável
- contagem de obras é **contada**, nunca declarada
- repositório vazio devolve vazio — sem era de exemplo

---

### T.3 · Economia de progresso

> **Antes das telas de liga e missão.** Elas exibem estes números.

| # | Item | Estado |
| :--- | :--- | :---: |
| T-12 | `domain/economia-de-progresso.ts` — a tabela do §2 como código, fonte única | ⬜ |
| T-13 | Catálogo dos **44 emblemas**. Enquanto não existir, a tela mostra os que existem — não 44 quadrados cinzas | ⬜ |
| T-14 | `progresso.repository` — XP, score, débito, emblemas, passaporte | ⬜ |
| T-15 | Ligar as tentativas já gravadas à ofensiva, meta e domínio de habilidade *(era P.7)* | ⬜ |
| T-16 | **Índice de débito** — acumula, registra onde, quita com score, não subtrai | ⬜ |

**Testes:** `tests/economia-de-progresso.test.ts` — os 15 casos `E-1…E-15` de
`76_PROGRESS_ECONOMY.md` §9. Os que mais importam:
- **E-2** nenhum evento conta duas vezes
- **E-4** conta nova começa em zero — regressão da semente fabricada
- **E-11** sem participantes, classificação volta vazia
- **E-14** publicar conteúdo não apaga XP, ofensiva nem emblema

---

### T.4 · Telas do Atlas

| # | Item | Origem | Estado |
| :--- | :--- | :--- | :---: |
| T-6 | Reescrever `WorldsAtlasScreen` lendo do repositório, com os três eixos e a faceta de gênero | — | ✅ |
| T-7 | Reescrever `MusicGraphScreen` lendo do repositório | — | ⬜ |
| T-17 | Navegação por eixo: era, região, ilha, com filtro de gênero | pedido | ⬜ |
| T-18 | Da obra, entrar no percurso de prática | Astra A7 | ⬜ |
| T-9 | Conferir se o mapa do braço do violino corresponde ao Atlas | pedido | ⬜ |

**Testes:** `tests/ui/atlas.test.tsx`
- o filtro de era reduz a lista de obras
- ilha fechada mostra o motivo, e não some
- o mapa vazio diz que está vazio

---

### T.5 · Practice — caminho e percurso

> **Decisão de 18/09:** as lições do Practice são **outras**, além das do
> curso. O vínculo com o Academy existe e não é obrigatório: quem nunca fez o
> curso de história pode praticar história. Cada matrícula declara o **ponto
> de partida** — leigo, autodidata, cursando, cursado, formado fora —, e é ele
> que decide qual faixa de material aparece: vocabulário, fundamento,
> aplicação, avançado. Ver `domain/matricula-no-practice.ts`.
>
> Itens que isso abre:
>
> | # | Item | Estado |
> | :--- | :--- | :---: |
> | T-40 | Formulário de matrícula no percurso, com as cinco opções explicadas | ✅ `FormularioDeMatricula.tsx` |
> | T-41 | Sondagem para quem vem de fora — autodidata e formado fora | ⬜ |
> | T-42 | Lições do Practice marcadas por faixa de material | ⬜ |
> | T-43 | Percurso de quem está cursando **acompanha** o curso, sem se adiantar | ⬜ |

| # | Item | Origem | Estado |
| :--- | :--- | :--- | :---: |
| T-19 | **Caminho visual com nós** — seção, unidade, nó ativo, requisito explícito | Duolingo B2 | ✅ `CaminhoDoPercurso.tsx` |
| T-20 | **Prática dentro do curso**, ao fim da grade, com cadeado que diz o motivo | Astra A7 | ⬜ |
| T-21 | XP declarado **antes** — `+10` no botão | Duolingo B7 | ⬜ |
| T-22 | Exercício: barra, vidas, etiqueta de tipo, **atalho numérico**, pular sem punição | Duolingo B8 | ✅ `TelaDoExercicio.tsx` |

**A anatomia da lição, mapeada da saga de capturas (paridade §B9–B10).** O
laço já existe em `domain/exercicio-musical.ts`, com 29 casos. Falta a tela.

| # | Item | Origem | Estado |
| :--- | :--- | :--- | :---: |
| T-44 | **Sete tipos de exercício** traduzidos para música — reconhecer notação, identificar de ouvido, seguir o padrão, escrever na pauta, combinar pares, ditado, função harmônica | §B10.2 | ✅ domínio · ⬜ telas |
| T-45 | **Quatro tipos além da referência** — tocar, cantar, bater o ritmo, apontar no braço. Medidos pelo microfone | nosso | ✅ domínio · ⬜ telas |
| T-46 | **O erro volta na mesma lição**, com a etiqueta "corrija o erro de antes" | §B9.5 | ✅ |
| T-47 | A alternativa **soa** ao ser tocada | §B9.3 | ✅ |
| T-48 | Dois botões de escuta: normal e **meia velocidade** | §B9.3 | ✅ |
| T-49 | **Ouvir voz a voz** de uma cadência; comparar a sua execução com a referência; **transpor** o mesmo exercício | nosso | ⬜ |
| T-50 | Combo aceso a partir de 5 seguidos, com a barra mudando de cor | §B9.4 | ✅ |
| T-51 | `MUITO FÁCIL` / `MUITO DIFÍCIL` / reportar no rodapé do acerto | §B9.4 | ✅ tela · ⬜ **falta onde gravar** o veredito |
| T-52 | **Som de acerto e erro musicalmente coerente** — tríade no tom, segunda menor, combo subindo a escala, cadência ao fim | §B10.5 | ✅ tríade e segunda menor · ⬜ combo subindo, cadência ao fim |
| T-53 | Encerramento em etapas, **uma conquista por tela** | §B9.6 | ✅ `TelaDeEncerramento.tsx` |
| T-54 | **Meta de ofensiva** escolhida pela pessoa: 7 / 14 / 30 dias | §B9.6 | ✅ tela · ⬜ **falta persistir** a escolha |
| T-55 | `REVISAR LIÇÃO` ao fim | §B9.6 | ✅ |
| T-56 | Ao sair, **o mapa já atualizado** — nó concluído, seguinte aberto, sem recarregar | §B9.7 | ⬜ |
| T-57 | Avisar que o progresso se perde ao sair da lição pelo `✕` | §B9.1 | ✅ |
| T-23 | Percurso ancorado no Atlas: era → região → **tribo** → obra → exercício | pedido | ⬜ — o percurso existe pela gramática; falta o recorte pelo Atlas |
| T-58 | **Ligar as telas às rotas** — hoje `TelaDoExercicio`, `TelaDeEncerramento`, `CaminhoDoPercurso` e `TelaDaLiga` existem e são testadas, mas nenhuma rota as abre | — | ⬜ |
| T-59 | **Onde guardar o que as telas produzem** — veredito de dificuldade (T-51), meta de ofensiva (T-54), nós concluídos do percurso. Sem repositório, os botões existem e a informação se perde ao recarregar | — | ⬜ |
| P.5 | Aba de ritmo: o metrônomo toca, mas **não mede nem grava** | — | ⬜ |
| P.6 | Aba de acordes está declarada no seletor e **não existe** | — | ⬜ |

**Testes:** `tests/fluxos-de-pratica.test.ts`
- nó bloqueado diz **quanto falta**, e não só que está bloqueado
- concluir o nó desbloqueia o seguinte, e **só** o seguinte
- o percurso ancorado devolve exercícios **daquela** obra
- atalho numérico seleciona a alternativa correspondente

---

### T.6 · Ligas, missões e perfil

| # | Item | Origem | Estado |
| :--- | :--- | :--- | :---: |
| T-24 | Tela de ligas com **esqueleto** quando não há participante — a mecânica já existe em `domain/liga.ts` | Duolingo B6 | ✅ `TelaDaLiga.tsx` |
| T-25 | Ligas por recorte: plataforma, curso, tribo, era | pedido | ✅ |
| T-26 | Missões diárias com prazo e desafio do mês | Duolingo B5 | ✅ `missoes.ts` + `PainelDeMissoes.tsx` · ⬜ falta a **atividade do dia** real alimentando o progresso |
| T-27 | **Réguas do perfil** — ativa em destaque, demais esmaecidas e expansíveis | pedido | ✅ `ReguasDoPerfil.tsx` |
| T-28 | Perfil: pontuação total, semanal, posição, `N de M` com bloqueados visíveis | Astra A6 | ✅ componente · ⬜ falta a lista real de emblemas |
| T-29 | Ofensiva com semana visível e clubes | A2 + B4 | ✅ `PainelDaOfensiva.tsx` + `CLUBES_DE_OFENSIVA` |
| P.8 | Decidir **se a liga entra agora** ou depois de haver turma | — | ⛔ **decisão sua** |

**Testes:** `tests/ui/ligas-e-missoes.test.tsx`
- sem participante, aparece esqueleto — **sem nome inventado**
- trocar a régua reordena sem sair da tela
- emblema bloqueado aparece, em cinza
- missão cumprida não pode ser cumprida de novo no mesmo dia

---

### T.7 · Cadastro e apresentação

| # | Item | Origem | Estado |
| :--- | :--- | :--- | :---: |
| T-30 | **Ponto de partida** — `domain/matricula-no-practice.ts`, cinco opções, cada uma abrindo faixa de material diferente. 17 casos | Duolingo B1 | ✅ no domínio · ⬜ na tela |
| T-31 | **Ritmo** — passo a passo × livre, pergunta separada do ponto de partida | Astra A4 | ✅ no domínio · ⬜ na tela |
| T-32 | Escolher a trilha inicial | Astra A3 | ⬜ |
| T-33 | Passagem de apresentação em etapas, com posição e **Skip** | Astra A2 | ⬜ |

**Testes:** `tests/fluxos-de-cadastro.test.ts`
- ritmo "passo a passo" **trava** a lição 7 antes da 6; "livre" não trava
- mudar o ritmo no perfil muda o desbloqueio
- pular a apresentação leva direto à escolha de trilha

---

### T.8 · Biblioteca e redação

| # | Item | Origem | Estado |
| :--- | :--- | :--- | :---: |
| T-34 | **Versão pública da Biblioteca**, com aviso de que não há conteúdo publicado | pedido | ⬜ |
| T-35 | Abas por disciplina e sub-filtro | Astra A9 | ⬜ |
| T-36 | **Engine de redação no Admin** — artigo e livro em formato de publicação | pedido | ⬜ |
| T-37 | **Marcador de lição** e a tela que os reúne, catalogados | Astra A8/A10 | ⬜ |

**Testes:** `tests/biblioteca-publica.test.ts`
- visitante vê a Biblioteca e o aviso de acervo vazio
- artigo publicado no Admin aparece na Biblioteca
- marcador salvo volta na lista, catalogado por curso

---

### T.9 · Kids

| # | Item | Estado |
| :--- | :--- | :---: |
| T-38 | Forma Kids das capacidades `C1`–`C15`: **paridade total com o Duolingo, combinada ao Astra**, conforme decidido | ⬜ |
| T-39 | Garantir que Kids **restringe alcance** e não empobrece conteúdo | ⬜ |

---

### Ordem executável

```
  T.1  vocabulário         ← T-4 depende de você
  T.2  domínio do Atlas
  T.3  economia            ← números antes das telas que os mostram
   ↓
  T.4  telas do Atlas
  T.5  caminho do Practice
   ↓
  T.6  ligas e missões     ← P.8 depende de você
  T.7  cadastro
  T.8  biblioteca
  T.9  Kids
```

### Decisões tomadas em 18/09

| # | Decisão |
| :--- | :--- |
| T-4 | **Ilha removida. Tribo é o termo** — grupo nichado, não lugar. Violinistas, pianistas, **historiadores** |
| P.8 | **A liga se constrói agora, completa.** O que não se cria é resultado falso |
| T-5 | 16 gêneros de início. Ajustáveis |
| T.5 | **Practice não depende do Academy.** Lições do curso são umas; as do Practice, outras. O vínculo existe e não é obrigatório — o aluno indica o ponto de partida na matrícula |

### Ainda dependem de você

| # | Decisão |
| :--- | :--- |
| — | Confirmar se os 16 gêneros cobrem o que você quer, ou cortar/acrescentar |
