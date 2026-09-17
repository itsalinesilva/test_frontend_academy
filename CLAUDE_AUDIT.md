# CLAUDE_AUDIT.md — Diagnóstico Técnico

**Missão:** COMANDO 0 — investigação integral do repositório
**Data:** 2026-09-16
**Método:** leitura de código + execução real (`tsc`, `eslint`, `vitest`, `vite build`, `curl` contra o servidor de desenvolvimento)
**Escopo:** 254 arquivos em `src/`, 72 telas, 107 componentes, 6 arquivos de teste, 95 arquivos de corpus, 89 documentos

**Legenda de classificação:**
`REAL` · `PARTIAL` · `MOCK` · `MISSING` · `BROKEN` · `DUPLICATED` · `UNCONNECTED` · `WRONG ARCHITECTURE`

---

## 1. SEGURANÇA — ✅ CORRIGIDO NO BLOCO 0 (2026-09-16)

> **Status:** os seis achados desta seção foram corrigidos e verificados por execução.
> O texto original é preservado abaixo como **registro histórico da falha** — é ele que
> justifica cada linha de `server/core/` e cada teste em `tests/server-authority.test.ts`.
> Estado atual e provas de correção: `CLAUDE_STATE.md §5`.
>
> Dois agravantes só apareceram durante a correção e não constavam do diagnóstico inicial:
> **(a)** havia **duas** cópias da allowlist, não uma — a segunda em
> `src/domain/capabilities.ts`, alimentando 4 pontos do `entitlement-service` e o
> `user.repository`; **(b)** a guarda de build `verify:secrets` **reprovou a primeira
> execução**, encontrando um e-mail real remanescente no `DesignSystemCatalog`.

### Registro histórico dos achados

### S-01 · Bypass total de autorização administrativa — `WRONG ARCHITECTURE` + `BROKEN`
**Arquivos:** `src/server/admin/AdminAuthorization.ts:41`, `src/server/middleware/api-middleware.ts:53`

`verifyAdmin()` recebe `sessionToken` no `SecurityContext` e **nunca o utiliza**. A única prova de identidade exigida é uma **string de e-mail enviada pelo próprio cliente**.

**Reprodução executada nesta sessão:**
```bash
curl -X POST http://127.0.0.1:3111/api/v1/admin/verify \
     -H "Content-Type: application/json" \
     -d '{"email":"office.alinesilva@gmail.com"}'
# → {"authorized":true,"role":"SYSTEM_GOVERNOR","level":100,...}

curl "http://127.0.0.1:3111/api/v1/admin/audit-logs?email=office.alinesilva@gmail.com&limit=2"
# → devolveu o log de auditoria institucional completo
```
Sem sessão, sem token, sem senha. **Impacto:** qualquer pessoa na internet lê o log de auditoria e obtém nível 100.

### S-02 · Allowlist administrativa publicada no bundle do cliente — `WRONG ARCHITECTURE`
**Arquivos:** `src/services/application/admin.service.ts:10-11`

O cabeçalho do arquivo declara *"CANONICAL RULE: Não expor lógica administrativa ao cliente"* — e a linha seguinte faz `import { AdminAuthorization } from '../../server/admin/AdminAuthorization'`. Verificado no artefato compilado:

```
grep -o "alinealv.silv@gmail.com" dist/assets/index-*.js   → 6 ocorrências
grep -o "FOUNDER_SUPERADMIN"      dist/assets/index-*.js   → 1 ocorrência
```
Pior: o bloco `catch` cai em `AdminAuthorization.verifyAdmin()` **local**. Como o middleware do Vite não existe em produção, **em produção a autorização de admin é 100% client-side** — exatamente o que o documento proíbe.

### S-03 · Autenticação sem senha — `BROKEN`
**Arquivo:** `src/services/application/auth.service.ts:~258`
```ts
if (user.passwordHash && req.password) {   // ← ambos precisam existir
  if (user.passwordHash !== `pwd_${req.password}` …) throw new UnauthorizedError(…)
}
```
`login({ email })` sem `password` **autentica qualquer usuário cadastrado**. Contas criadas via Google (`passwordHash === undefined`) nunca verificam nada.

### S-04 · Auto-login como fundadora/ADMIN — `WRONG ARCHITECTURE`
**Arquivo:** `src/app/App.tsx:118-122`
```ts
// Default to founder admin for initial exploration
const founderSession = await authService.login({ email: FOUNDER_ADMIN_EMAILS[0] });
```
Todo visitante sem sessão entra como **ADMIN fundadora**. Combinado com S-03, não há autenticação alguma no produto.

### S-05 · Credenciais e tokens sem criptografia — `WRONG ARCHITECTURE`
- `passwordHash = "pwd_" + senha` — texto claro com prefixo, gravado em `localStorage`.
- `accessToken = "token_" + userId + "_" + Date.now()` — sem assinatura, trivialmente forjável.
- `resetPassword()` **não valida** `req.token` — qualquer um redefine a senha de qualquer e-mail.
- `recoverPassword()` **devolve o `resetToken` no corpo da resposta**.

### S-06 · Barra de simulação de papéis exposta em produção — `WRONG ARCHITECTURE`
**Arquivo:** `src/app/App.tsx:38-75` — o `<select>` "Papel Ativo" (ADMIN / PROFESSOR / MÚSICO / ALUNO / CRIANÇA) é renderizado no shell para todos os usuários, em todas as builds. Escalonamento de privilégio por menu suspenso.

### S-07 · "Log imutável" mutável e sem assinatura — `MOCK`
**Arquivo:** `src/server/admin/AuditLog.ts`
- `signature: "sig_" + Math.random().toString(36)` — não é assinatura criptográfica.
- Persiste via `window.localStorage` — em contexto Node (`window === undefined`) o log vive apenas em memória e some a cada restart.
- Semeia 2 registros falsos (`aud_seed_1/2`) datados de `2026-09-14` como se fossem atos reais.
- `resetForTesting()` é público — apaga o "log imutável".

---

## 2. BACKEND E PERSISTÊNCIA

### B-01 · Não existe backend de produção — `MISSING`
Os 3 endpoints (`/admin/verify`, `/admin/audit-logs`, `/auth/recovery`) vivem em `vite.config.ts` → `configureServer`. Isso é um hook **exclusivo do dev server**. Em `vite build` + `vite preview` ou em qualquer hospedagem estática, `/api/v1/*` retorna 404. O produto publicado não tem API.

### B-02 · Não existe banco de dados — `MISSING`
Persistência integral em `localStorage` (prefixo `amd_`). Consequências reais: limpar o navegador destrói matrículas, notas de exame, certificados SHA-256 e histórico acadêmico; nada é compartilhado entre dispositivos; não existe backup, migração, transação ou integridade referencial.

### B-03 · `ApiClient` escrito e nunca usado — `UNCONNECTED`
142 linhas com timeout, `AbortController`, mapeamento de erro HTTP→domínio. **Zero chamadas de dados** (`apiClient.get/post/put/delete` não aparecem em lugar nenhum). Só `setAuthToken()` é invocado. Toda a UI chama repositórios locais diretamente.

### B-04 · Domínios sem repositório nem serviço — `UNCONNECTED`
Existem tipos ricos em `domain/community.ts` (185 l.), `domain/teacher.ts` (174 l.), `domain/creation.ts` (223 l.), `domain/music.ts` (167 l.), `domain/evidence.ts` (143 l.), `domain/gamification.ts`, `domain/kids.ts`, `domain/commercial.ts`.
**Nenhum deles tem repositório ou serviço.** As telas correspondentes (Community, Rooms, Worlds, Studio, Score) ignoram o domínio e declaram arrays locais.

---

## 3. TELAS — DENSIDADE REAL vs. APARÊNCIA

### T-01 · 27 das 72 telas não acessam nenhuma camada de dados — `MOCK`
```
admin/  (6)  AdminAudit, AdminContent, AdminDashboard, AdminEngines, AdminModeration, AdminUsers
community/(3) CommunityFeed, EventsDirectory, TopicDetail
rooms/  (3)  CreateRoom, RoomDetail, RoomsDirectory
studio/ (4)  DawProject, ScoreEditor, StudioHub, VoiceEarLab
worlds/ (3)  MusicGraph, WorkDetail, WorldsAtlas
outras  (8)  Overview, Search, Notifications, Help, Score, PracticeScreen, OAuthCallback, NotFound
```
Todas renderizam arrays literais escritos dentro do `.tsx`. São **maquetes**, não funcionalidades.

### T-02 · 19 ações de produto são `alert()` — `MOCK`
`AdminAudit`, `AdminContent`(2), `AdminEngines`, `AdminUsers`(2), `EventsDirectory`, `TopicDetail`, `Help`, `Portfolio`, `RoomDetail`(2), `Score`, `DawProject`, `ScoreEditor`(3), `VoiceEarLab`(2).
Inclui ações centrais do negócio: *"Exportar MusicXML"*, *"Salvar Partitura"*, *"Inscrição confirmada no evento"*, *"Submeter evidência para a tarefa"*, *"Gerenciar permissões"*.

### T-03 · Parâmetros de rota não resolvidos em 6 rotas — `BROKEN`
**Arquivo:** `src/ui/navigation/router.tsx:~360` — `dynamicPatterns` omite padrões. `parseParams` exige igualdade de número de segmentos, então nenhum padrão casa:

| Rota | Efeito |
| :--- | :--- |
| `/academy/course/:id/curriculum` | `params = {}` |
| `/academy/course/:id/progress` | `params = {}` |
| `/academy/lesson/:id/interactive` | `params = {}` |
| `/academy/quiz/:id` | `params = {}` |
| `/academy/category/:id` | `params = {}` |
| `/practice/feedback/:id` | `params = {}` |

### T-04 · Os fallbacks hardcoded escondem o T-03 — `MOCK` + `BROKEN`
18 telas fazem `const id = params.id || 'crs_fomt_01'` (ou `'les_fomt_101_1'`, `'bwv-1001'`, `'sala-chopin'`…). Resultado: as 6 rotas quebradas do T-03 **parecem funcionar** porque sempre exibem a mesma entidade fixa. É precisamente o caso de *"tela existe, funcionalidade não"*.

### T-05 · 18 telas escrevem dados sob a conta da fundadora — `BROKEN`
Padrão `const userId = session?.user.id || 'usr_founder_1'`. Sem sessão válida, progresso, tentativas e evidências de qualquer visitante são gravados no perfil da fundadora.

### T-06 · Roteador frágil e sem `replace` real — `PARTIAL`
- `navigate()` escreve em `window.location.hash` → sempre empilha histórico; `replace()` apenas chama `navigate()` (não substitui).
- `getInitialPath()` lê `location.pathname` se não houver hash — mistura dois modos de roteamento.
- `AppRouterOutlet` despacha por cadeia de `if` com `currentPath.includes('/progress')` e `.includes('/curriculum')` **globais** — qualquer rota futura contendo esses fragmentos cai na tela errada.
- `PRACTICE_SKILL` e `PRACTICE_SKILL_DETAIL` mapeiam o mesmo path — `DUPLICATED`.

### T-07 · Navegação com rótulos em inglês e links duplicados — `PARTIAL`
`Navigation.tsx:40-47` usa "Home, Academy, Practice, Worlds, Community, Studio, Score, Profile" num produto inteiramente em pt-BR. No submenu: *"Treino Auditivo de Intervalos"* e *"Metrônomo Acústico"* apontam ambos para `/practice`; *"Catálogo Urtext"* e *"Editor de Pautas"* apontam ambos para `/score`. Rótulos diferentes, destino idêntico = navegação enganosa.

---

## 4. PARIDADE COM AS REFERÊNCIAS (pré-avaliação; formalização no COMANDO 2)

| Domínio | Referência | Paridade estrutural | Paridade funcional | Veredito |
| :--- | :--- | :---: | :---: | :--- |
| **Academy** | Coursera | ~70% | ~45% | Hierarquia Programa→Trilha→Curso→Módulo→Lição→Avaliação→Certificado **existe e funciona**. Falta: catálogo com **3 cursos e 4 lições**, sem vídeo real, sem materiais para download, sem fórum de curso, sem avaliação por pares, sem legendas/transcrições, sem retomada de vídeo. |
| **Profile** | LinkedIn | ~65% | ~40% | 7 lentes, seções reordenáveis, visibilidade por seção, portfólio — **arquitetura correta**. Falta: feed de atividade real, conexões (só `toggleConnection` sem grafo), recomendações, experiência/educação editáveis, perfil público de terceiros, busca de pessoas. |
| **Practice** | Duolingo / Astra Trainer | ~75% | ~50% | Loop Skill→MicroSkill→Exercise→Attempt→Feedback→Mastery **implementado no serviço**. Falta: medição real (o adaptador devolve `pitchDeviationCents` = 0 ou 100, literal), sem áudio no exercício, streak/ranking **fabricados**, sem vidas/tolerância. |
| **Teacher Room** | Skool | ~20% | ~5% | 3 telas 100% hardcoded. Sem criar curso, aula, tarefa, material, evento; sem fila de correção; sem membros; sem analytics; sem repositório. |
| **Studio** | DAW profissional | ~25% | ~5% | Timeline/mixer visuais, sem síntese por canal, sem gravação, sem piano roll funcional, sem automação, sem render/export, sem persistência de projeto, sem undo/redo. |
| **Score** | Dorico/Sibelius/Finale | ~20% | ~5% | Sem entrada de notas, sem seleção, sem undo/redo, sem vozes, sem dinâmica/articulação, sem playback, sem importação. Export MusicXML real existe **no motor** mas a tela nunca o chama. |

---

## 5. MOTORES MUSICAIS

### E-01 · Detecção de pitch — `REAL` mas `UNCONNECTED`
`web-audio.adapter.ts` implementa autocorrelação com interpolação parabólica e conversão Hz→MIDI→cents. **Correto.**
Porém `VoiceEarLabScreen.tsx` **nunca o invoca**: não chama `getUserMedia`, não instancia `AudioContext`, não importa `engineGateway`. O "afinador" alterna entre duas strings fixas (`'C4 (261.63 Hz)'` / `'A4 (440.0 Hz)'`), a barra de cents tem largura fixa (52%/50%) e "85% de Precisão" está escrito no JSX.
*Nota de performance:* o autocorrelacionador é O(n²) em JS síncrono — precisará ir para `AudioWorklet` antes de rodar em tempo real.

### E-02 · Motor de partitura — `PARTIAL`
`exportToMusicXml()` gera XML bem-formado, mas: `<duration>4</duration>` fixo para toda nota, ignora armadura, fórmula de compasso, acidentes, ligaduras, vozes e dinâmica. **Não há importação**, não há MIDI. A interface `ScoreEngineAdapter` sequer declara `importFromMusicXml`.

### E-03 · Motor de avaliação de prática — `MOCK`
`rule-based-practice.adapter.ts:35` — `pitchDeviationCents: pitchMatch ? 0 : 100`. É um booleano vestido de medição em cents. Não há detecção de ataque (*onset*), *beat tracking*, análise espectral nem cálculo de rush/drag em ms — que é exatamente a promessa "Astra Trainer" da Constituição §2.3.

### E-04 · Telemetria de motores falsificada — `MOCK`
Os 4 adaptadores retornam `latencyMs: 1` fixo em `getHealth()`. `AdminEnginesScreen` exibe isso como telemetria real de produção.

### E-05 · Nenhuma biblioteca musical instalada — `MISSING`
Sem VexFlow/Verovio/OSMD (renderização), sem Tone.js/WebMIDI (áudio/MIDI), sem `pitchy`/`aubio`/`essentia.js`, sem `music21`/`librosa` (Python). O documento `21_OPEN_SOURCE_API_CATALOG.md` cataloga candidatos; nada foi adotado.

---

## 6. CRUZAMENTO ENTRE SISTEMAS (Constituição §4)

| Regra constitucional | Status |
| :--- | :--- |
| 1. Curso → Prática (lição desbloqueia exercícios) | ❌ `MISSING` — links são `navigate('/practice')` genéricos. `AcademyLesson.skills` é `string[]` de nomes, não IDs de `Skill`. Não há grafo lição↔habilidade. |
| 2. Prática → Notação | ❌ `MISSING` |
| 3. Notação → Estúdio (1 clique → trilhas MIDI) | ❌ `MISSING` |
| 4. Estúdio → Evidência | ❌ `MISSING` |
| 5. Evidência → Perfil & Portfólio | ✅ `REAL` — `profile.service.ingestEvidence()` |
| 6. Curso & Prática → Passaporte Histórico | ❌ `MISSING` — não existe entidade Passport persistida |
| 7. Portfólio → Salas & Comunidade | ❌ `MISSING` |
| **Extra (funciona)** Academy → Evidence | ✅ `academy.service.ts:406,635` |
| **Extra (funciona)** Practice → Evidence | ✅ `practice.service.ts:513` |

**2 de 7 regras constitucionais de cruzamento estão implementadas.**

---

## 7. DESIGN SYSTEM E UI/UX

### D-01 · Três sistemas de tokens paralelos, nenhum adotado — `WRONG ARCHITECTURE`
1. `src/index.css` — 25 variáveis CSS `--color-*`
2. `src/ui/design-system/tokens.ts` — objeto `TOKENS` completo
3. Classes Tailwind cruas espalhadas pela UI

**`tokens.ts` é importado por exatamente 1 arquivo: o próprio `DesignSystemCatalog.tsx`.** Os outros 180 `.tsx` usam utilitários brutos: `text-stone-900` (614×), `text-stone-500` (529×), `text-red-800` (180×)… Trocar a identidade visual hoje exige um *find-and-replace* em 180 arquivos.

### D-02 · Paleta implementada ≠ paleta constitucional — `PARTIAL`
Constituição §3 define acento **#8B1E2D / #6B1420** (bordô acadêmico). O código usa **#991b1b** (Tailwind `red-800`) em `index.css` e `tokens.ts`. A cor "institucional" é a cor padrão do framework.

### D-03 · Tipografia institucional não existe — `MISSING`
Zero `@font-face`, zero `<link>` para fontes, zero `font-family` declarada. `font-serif` resolve para a serifada padrão do sistema (Times New Roman no Windows). A "tipografia serifada clássica e equilibrada" da Constituição §3 **não foi implementada**.

### D-04 · Sem tema escuro — `MISSING`
Nenhuma classe `dark:` e nenhum `prefers-color-scheme`. `tokens.ts` define `surface.studio: '#18181b'` para o DAW, mas nada consome.

### D-05 · Acessibilidade declarada, não verificada — `PARTIAL`
Existem `LiveRegion`, `SkipLink`, `VisuallyHidden` — bom. Mas: `alert()` nativo não é anunciado a leitores de tela de forma controlada; a barra de cents não tem `role="meter"`/`aria-valuenow`; não há nenhum teste de a11y; WCAG AA nunca foi medido.

---

## 8. TESTES

### Q-01 · Cobertura desproporcional — `PARTIAL`
19 testes / 301 linhas para 254 arquivos e ~30.000 linhas de código.

**Sem nenhum teste:** `auth.service` (800 l.), `academy.service` (733 l.), `practice.service` (656 l.), `profile.service` (534 l.), `unified-profile.repository` (1.189 l.), roteador, **qualquer componente React**, **qualquer tela**, integração, E2E, autorização de rota, acessibilidade, responsividade.

### Q-02 · Infraestrutura de teste de componente ausente — `MISSING`
`vitest.config.ts` usa `environment: 'node'`; não há `jsdom`/`happy-dom`, `@testing-library/react`, nem Playwright/Cypress. **Hoje é tecnicamente impossível testar uma tela.**

### Q-03 · Teste apontando para código legado — `DUPLICATED`
`tests/repositories.test.ts` valida `course.repository.ts`, que `00_SOURCE_OF_TRUTH.md §2.6` manda fundir em `academy.repository.ts`. O teste passará a defender o código que deve morrer.

### Q-04 · CI verde sobre um produto inseguro — `BROKEN`
`.github/workflows/ci.yml` roda typecheck+lint+test+build — tudo verde — enquanto S-01…S-06 estão abertos. **O gate atual não protege nada relevante.** Faltam: `npm audit`, teste de autorização, verificação de que segredos não vazam para `dist/`.

---

## 9. DUPLICAÇÕES E DÍVIDA

| Item | Status |
| :--- | :--- |
| `course.repository.ts` (210 l.) vs `academy.repository.ts` (350 l.) | `DUPLICATED` — dois catálogos concorrentes |
| `profile.repository.ts` (96 l.) vs `unified-profile.repository.ts` (1.189 l.) | `DUPLICATED` — **ambos ativos**: `auth.service` usa o legado, `profile.service` usa o unificado |
| `domain/types.ts` (`Course`,`Lesson`,`Profile`) vs `domain/academy.ts` / `domain/profile.ts` | `DUPLICATED` |
| `PracticeScreen.tsx` (461 l., hardcoded) vs `PracticeHomeScreen.tsx` (521 l., real) | `DUPLICATED` — a antiga sobrevive em `/practice/trainer` |
| `Player.tsx`, `Recorder.tsx`, `Tuner.tsx`, `Waveform.tsx`, `PianoRoll.tsx`, `MixerChannel.tsx`, `Track.tsx` | Componentes de domínio musical — verificar quais estão órfãos (COMANDO 12) |
| Bundle único de 1.244 kB | `WRONG ARCHITECTURE` — sem `React.lazy`/`manualChunks`; todo o seed acadêmico entra na primeira tela |
| 28 warnings `no-explicit-any` | Dívida de tipagem em 12 telas |

---

## 10. CONHECIMENTO, CONTEÚDO E PROVENIÊNCIA

### K-01 · Corpus disponível e não processado — `MISSING`
`framework_knowledge/` tem **95 arquivos / 7 MB**: 37 transcrições das *Fundamentals of Music Theory* (Edinburgh, Lectures 1–5), 31 HTML de curso, 5 PDFs. **Zero linhas de código leem essa pasta.** Não existe `src/knowledge/`, nem parser, nem grafo, nem embeddings.

### K-02 · Proveniência é string livre, não registro rastreável — `PARTIAL`
`AcademyLesson.provenanceRef: string` — texto como *"University of Edinburgh Lecture 1 (02_01. Musical Notes) & Med, Bohumil (Cap. 1: Som e Notação)"*. Existe `domain/admin.ts:CanonicalProvenanceRecord` com `sourceId`/`licenseId`, mas **nada o instancia**. Não há `Source`, `Chapter`, `Section`, `Concept`, `PageReference`, `CopyrightStatus`, `TransformationType` — o modelo exigido pelo COMANDO 7/8.

### K-03 · Citações página-a-página não verificáveis — 🟠 risco jurídico/acadêmico
As lições citam páginas específicas (*Med, "págs. 11–24"*) de obras que **não existem no repositório**. Num produto publicado, citação de página não verificada é um problema de credibilidade acadêmica e de direito autoral.

### K-04 · Fontes que você mencionou e não estão no repositório — `MISSING`
Bohumil Med, Grout/Palisca, Suzuki, Hans Sitt, Maia Bang, Berklee (Harmony / Music Theory). **Apenas Edinburgh está presente.** O COMANDO 8 (ingestão) não pode ser executado sobre fontes ausentes.

### K-05 · Dados fabricados apresentados como reais — 🔴 violação direta da diretriz
Catalogados integralmente em `CLAUDE_STATE.md §4`. Destaques: Bach/Chopin/Villa-Lobos como usuários com XP no ranking semanal; "gravações da Chaconne BWV 1004" que são arquivos de som de chuva do Google; 4 evidências apontando para o domínio inexistente `storage.academia.mus.br`; "142 obras do Barroco" sobre 5 registros hardcoded.

---

## 11. DOCUMENTAÇÃO

### DOC-01 · Fonte da verdade desatualizada — `BROKEN`
`docs/00_REPOSITORY_AUDIT.md` e `docs/00_SOURCE_OF_TRUTH.md` descrevem 119 arquivos / 36 telas / 46 componentes / 46 rotas. A realidade é 254 / 72 / 107 / 72. Ambos afirmam erros de tipagem na Academia que **já não existem**. São documentos de uma geração anterior do código.

### DOC-02 · 71 documentos de harness, maioria com <25 linhas — `PARTIAL`
De `docs/harness/`, 50 arquivos têm menos de 25 linhas. Vários "contratos" (`60_SCORE_ENGINE_CONTRACT`, `61_AUDIO_ENGINE_CONTRACT`, `63_DATABASE_SCHEMA_CONTRACT`) têm 16 linhas — são títulos, não contratos executáveis.

### DOC-03 · Nenhum README operacional — `MISSING`
Não existe `README.md` na raiz, nem `CLAUDE.md`. Não há instrução de instalação, execução, variáveis de ambiente, ou a armadilha do `ComSpec` no Windows.

### DOC-04 · `metadata.json` órfão — `PARTIAL`
Declara `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` e nome `"- teste_virtual_academy"` — resíduo do AI Studio, sem correspondência no código.

---

## 12. SÍNTESE — CONTAGEM POR CLASSIFICAÇÃO

| Classificação | Ocorrências principais |
| :--- | ---: |
| `REAL` | 9 (domínio, Academy svc, Practice svc, Profile svc, gateway, pitch, teoria, 2 cruzamentos de evidência) |
| `PARTIAL` | 11 |
| `MOCK` | 8 (27 telas, 19 alerts, VoiceEarLab, scoring, telemetria, audit log, seeds fabricados, fallbacks) |
| `MISSING` | 14 (backend, DB, Knowledge, MusicXML import, MIDI, WebSocket, Python, fontes, dark mode, libs musicais, E2E, jsdom, README, Passport) |
| `BROKEN` | 7 (S-01, S-03, T-03, T-05, DOC-01, Q-04, router params) |
| `DUPLICATED` | 5 |
| `UNCONNECTED` | 3 (ApiClient, domínios sem repo, pitch engine ↔ UI) |
| `WRONG ARCHITECTURE` | 6 (S-01, S-02, S-04, S-05, S-06, D-01, bundle) |

---

## 13. VEREDITO

O repositório é um **protótipo de frontend maduro com um núcleo de domínio genuinamente bom**. Três camadas merecem ser preservadas e construídas em cima: o modelo de domínio tipado, os serviços de Academy/Practice/Profile, e a arquitetura de portas e adaptadores dos motores.

O que impede de chamá-lo de produto:

1. **Não há autenticação.** Qualquer visitante é ADMIN (S-01…S-06). Este é o bloqueador absoluto.
2. **Não há backend nem banco.** O que existe roda só no dev server do Vite e no `localStorage` do visitante.
3. **Metade das telas é cenografia.** 27 telas sem camada de dados, 19 ações que são `alert()`.
4. **Há dados fabricados no produto**, incluindo compositores mortos como usuários e áudio de chuva rotulado como Bach.
5. **O acervo de conhecimento existe mas nunca foi lido** — 7 MB parados, e as fontes citadas nas lições não estão no repositório.
6. **A rede de segurança é ilusória.** CI verde, typecheck limpo, 19 testes passando — sobre um produto com bypass de admin.

Nada disso é irreparável, e nada precisa ser jogado fora. A ordem de ataque está em `CLAUDE_TODO.md`.
