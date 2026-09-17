# CLAUDE_TODO.md — Backlog de Engenharia

**Origem:** diagnóstico do COMANDO 0 (`CLAUDE_AUDIT.md`)
**Atualizado:** 2026-09-16
**Regra:** nenhum item é fechado por "a tela existe". Fecha-se com código + persistência + autorização + teste + documentação.

**Estados:** ⬜ aberto · 🔄 em andamento · ✅ concluído · ⛔ bloqueado (depende de decisão sua ou de serviço externo)

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

## BLOCO 3 — COMANDO 3 · Academy (paridade Coursera)
| # | Item | Ref. | Estado |
| :--- | :--- | :--- | :---: |
| 3.1 | Padrões dinâmicos **derivados** de `CANONICAL_ROUTES`, com precedência de rota estática. As 6 rotas resolvem; 14 testes de regressão | T-03 | ✅ |
| 3.2 | **17 ids fixos removidos** (restam 0). `RouteParams` tipado como `string \| undefined`; 15 telas com guarda que recai no estado de não-encontrado | T-04 | ✅ |
| 3.3 | **16 fallbacks para a fundadora removidos** (restam 0), incluindo 2 no `profile.service` que agora lançam `UnauthorizedError` | T-05 | ✅ |
| 3.4 | Substituir a cadeia de `if` do `AppRouterOutlet` por tabela de rotas com casamento por padrão | T-06 | ⬜ |
| 3.9 | `replace()` agora usa `history.replaceState` — antes empilhava, e o "voltar" devolvia o usuário à tela da qual fora redirecionado | R-04 | ✅ |
| 3.10 | 🔴 **Descoberto:** 17 ocorrências em telas de Practice **fixam** `'usr_founder_1'` diretamente — não é fallback, é atribuição. Todo progresso de prática de qualquer usuário é gravado no perfil da fundadora | T-05 | ⬜ COMANDO 5 |
| 3.5 | Fundir `course.repository.ts` em `academy.repository.ts` (com justificativa técnica registrada) | §9 | ⬜ |
| 3.6 | Course Detail: materiais, bibliografia navegável, corpo docente real, cursos relacionados, trilhas relacionadas | §4 | ⬜ |
| 3.7 | Lesson: navegação anterior/próxima, marcação de progresso por tempo real de estudo, CTA contextual para a habilidade correspondente | §4, §6 | ⬜ |
| 3.8 | Estados obrigatórios (loading/empty/error/success) auditados em todas as telas de Academy | DoD | ⬜ |

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
| 15.24 | Criar `/admin/seo`, `/admin/communication`, `/admin/commercial`; descontinuar `/admin/users`, `/admin/content`, `/admin/engines` | ADR-005 | ⬜ |
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
