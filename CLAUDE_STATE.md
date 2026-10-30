# CLAUDE_STATE.md — Estado Verificado do Repositório

> **Este documento descreve o que foi VERIFICADO POR EXECUÇÃO, não o que a documentação afirma.**
> Toda linha aqui foi confirmada lendo código, rodando build/testes ou chamando endpoints reais.

| Campo | Valor |
| :--- | :--- |
| **Última atualização** | 2026-09-18 |
| **Missão concluída** | **COMANDO 5 — a camada de telas do Practice**, oito componentes com domínio próprio |
| **Branch** | `feat/security-authority-and-audit` (commit `43f7b2f`) |
| **Próxima missão** | **Ligar o Practice** — rotas, persistência e o gerador de exercícios (T-58, T-59) |
| **Status global** | 🟠 **PROTÓTIPO COM AUTENTICAÇÃO REAL** — os bloqueadores de segurança estão fechados; a paridade funcional não |

### O que mudou nesta sessão

| Verificação | Comando | Resultado |
| :--- | :--- | :--- |
| Typecheck estrito | `tsc --noEmit` | ✅ 0 erros |
| Lint | `eslint src tests scripts` | ⚠️ 0 erros · 21 avisos (`no-explicit-any`, todos anteriores) |
| Testes | `vitest run` | ✅ **861** em 47 arquivos |
| Pente fino | `node scripts/qa.mjs` | ✅ **0 bloqueios · 0 a corrigir** |

**Telas do Practice construídas:** exercício, encerramento, caminho do
percurso, liga, matrícula, missões, réguas do perfil, ofensiva.

**Domínios novos:** `gramatica-musical` (280 formas de exercício),
`economia-de-progresso` (a tabela de contagem em código),
`encerramento-da-licao`, `percurso`, `missoes`, clubes em `frequencia`.

**Defeitos reais corrigidos:** `getPracticeProfile` fabricava o retrato de
quem pratica — somava `+125` minutos, `+8` sessões e `+74` tentativas a
números reais, dava 86% de precisão a quem nunca praticou, e abria o perfil
no nível 12 e na liga Conservatório. A tabela de contagem citava três
símbolos inexistentes e contradizia a si mesma no valor das missões.

**Verificações novas no pente fino:** agregado inflado, símbolo inexistente na
contagem, valor divergente entre documento e código, vocabulário do Atlas.

> **O que NÃO está pronto, e é o próximo passo:** as oito telas existem, são
> testadas e não têm rota — nenhuma é alcançável pela navegação. Nada do que
> elas produzem é persistido, e não há gerador que produza exercícios para as
> 21 dimensões. Ver `CLAUDE_TODO.md` T-58 e T-59.

---

## 1. Verificação executada nesta sessão

| Verificação | Comando | Resultado |
| :--- | :--- | :--- |
| Instalação de dependências | `npm install` | ✅ 222 pacotes (falhava antes: `ComSpec` vazio no shell — ver §6) |
| Typecheck estrito | `tsc --noEmit` | ✅ **0 erros** |
| Lint | `eslint src server functions` | ⚠️ 0 erros, **20 warnings** (`no-explicit-any`; eram 28) |
| Testes | `vitest run` | ✅ **100/100** (11 arquivos) |
| Build de produção | `vite build` | ✅ 7.7s — bundle único de **1.244 kB** (sem code-splitting) |
| Servidor de API | `curl` contra 5 vetores de ataque | ✅ **404 / 401 / 401 / 401 / 401** — todos recusados |
| Vazamento no bundle | `npm run verify:secrets` | ✅ **limpo** (guarda encadeada ao `npm run build`) |

> A afirmação em `docs/00_SOURCE_OF_TRUTH.md §2.6` de que a Academia tem erros de tipagem **está desatualizada**: o typecheck está limpo. Em compensação, o typecheck limpo **não significa** produto funcional (ver CLAUDE_AUDIT.md).

---

## 2. Inventário real (medido, não documentado)

| Métrica | Documentação diz | **Realidade medida** | Δ |
| :--- | ---: | ---: | :--- |
| Arquivos em `src/` | 119 | **254** | +135 |
| Telas (`*Screen.tsx`) | 36 | **72** | +36 |
| Componentes React | 46 | **107** | +61 |
| Rotas em `CANONICAL_ROUTES` | 46 | **72** | +26 |
| Testes automatizados | 19 | **19** | = |

**Conclusão:** o código evoluiu ~2 gerações além da documentação. `docs/00_REPOSITORY_AUDIT.md` e `docs/00_SOURCE_OF_TRUTH.md` **não descrevem mais este repositório** e não podem ser usados como fonte da verdade até serem reescritos (COMANDO 17).

---

## 3. Camadas — o que existe de fato

### 3.1 Camadas REAIS e sólidas (patrimônio a preservar)

| Camada | Arquivos | Avaliação |
| :--- | :--- | :--- |
| **Modelo de domínio** | `src/domain/` (22 arquivos, ~3.000 linhas) | Tipagem estrita, sem `any`, cobre 20 subdomínios. Excelente. |
| **Academy (dados→serviço)** | `domain/academy.ts` → `academy.repository.ts` → `academy.service.ts` (733 l.) | Matrícula, progresso, quiz, avaliação somativa, certificado SHA-256, histórico. **Lógica de negócio real.** |
| **Practice (dados→serviço)** | `domain/practice.ts` → `practice.repository.ts` → `practice.service.ts` (656 l.) | Sessão, tentativa, avaliação, maestria, streak, XP. **Lógica de negócio real.** |
| **Perfil unificado 7 lentes** | `unified-profile.repository.ts` (1.189 l.) + `profile.service.ts` | Seções, visibilidade, portfólio, ingestão de evidência. Real — mas semeado com dados fictícios (§4). |
| **Engine Gateway (Ports & Adapters)** | `adapters/engines/` | Arquitetura correta de portas/adaptadores. Permite trocar motor JS por Python sem tocar na UI. |
| **Detecção de pitch** | `web-audio.adapter.ts` | Autocorrelação + interpolação parabólica + conversão MIDI/cents. **Algoritmo real e correto.** |
| **Motor de teoria** | `rule-based-theory.adapter.ts` | Intervalos, tríades, escalas. Real, coberto por 4 testes. |
| **Cruzamento Academy/Practice → Evidence → Profile** | `academy.service.ts:406,635` / `practice.service.ts:513` | **Integração real e funcionando.** Único cruzamento transversal implementado. |

### 3.2 Camadas AUSENTES

| Camada | Status |
| :--- | :--- |
| Backend HTTP de produção | ❌ **NÃO EXISTE.** Os 3 endpoints em `src/server/middleware/api-middleware.ts` só rodam via `configureServer` do Vite — **desaparecem em `vite build`/`preview`/produção.** |
| Banco de dados | ❌ **NÃO EXISTE.** 100% `localStorage` do navegador. Limpar o cache apaga matrículas, notas e certificados. |
| `ApiClient` | ⚠️ 142 linhas escritas, **0 chamadas de dados**. Só `setAuthToken()` é usado. |
| Repositórios de Community, Rooms, Worlds, Studio, Score, Evidence standalone | ❌ **NÃO EXISTEM.** Há `domain/community.ts`, `domain/teacher.ts`, `domain/creation.ts`, `domain/music.ts` — mas nenhum repositório ou serviço os consome. |
| Motor Python (musicologia/SATB) | ❌ Não existe. |
| WebSocket / WebRTC (salas ao vivo) | ❌ Não existe. |
| Importação MusicXML / MIDI | ❌ Não existe (só exportação parcial). |
| Pipeline de ingestão de conhecimento | ❌ Não existe. 7 MB de fontes em `framework_knowledge/` nunca foram processados. |
| Bibliotecas musicais (VexFlow, Verovio, OSMD, Tone.js, pitchy) | ❌ Nenhuma. `package.json` tem apenas `clsx`, `lucide-react`, `react`, `react-dom`, `tailwind-merge`. |

---

## 4. Conteúdo real vs. conteúdo fabricado

### Conteúdo acadêmico semeado (`src/data/`)

| Entidade | Quantidade real |
| :--- | ---: |
| Programas | 2 |
| Trilhas | 3 |
| Cursos | 3 |
| Módulos | 3 |
| **Lições** | **4** (10 seções · **60 blocos interativos**) |
| Atividades | 4 |
| Avaliações somativas | 1 |
| Quizzes | 2 |
| Árvores de habilidade | 5 |
| Habilidades / micro-habilidades | 5 / 6 |
| Exercícios | 10 |

A **qualidade** do texto das 4 lições é alta e academicamente correta. A **quantidade** (4 lições) não sustenta a afirmação de "paridade Coursera".

### Corpus disponível e NÃO utilizado

`framework_knowledge/endinburgh- musictheory-002/` — **95 arquivos, 7 MB**: 37 transcrições de aula (Edinburgh *Fundamentals of Music Theory*, Lectures 1–5), 31 páginas HTML, 5 PDFs, 1 JSON de metadados.
→ **Nenhum byte deste corpus é lido pelo código.** As 4 lições foram escritas à mão e apenas *citam* as aulas.

### Fontes citadas que NÃO estão no repositório

As lições citam com número de página: **Bohumil Med** (*"Cap. 1, págs. 11–24"*), **Walter Piston**, **Kostka & Payne**, **J.J. Fux**, **Kent Kennan**. Nenhuma dessas obras existe no repositório. As citações página-a-página são, portanto, **não verificadas** — risco acadêmico e jurídico num produto publicado.

### Dados fabricados apresentados como reais (violação direta da sua instrução)

| Local | Fabricação |
| :--- | :--- |
| `seed-practice-content.ts:627` | Ranking semanal com **Bach, Clara Schumann, Villa-Lobos e Chopin como usuários da plataforma** com XP. |
| `seed-practice-content.ts:595` | Histórico de 7 dias de streak com minutos/XP inventados. |
| `unified-profile.repository.ts:232-258` | Gravações "de Bach" que apontam para **sons de chuva e riacho** do Google (`sounds/v1/water/rain_heavy.ogg`). |
| `unified-profile.repository.ts:611` | `https://cdn.example.com/audio/bwv1004_snippet.mp3` — domínio de exemplo. |
| `unified-profile.repository.ts:695-764` | 4 evidências em `https://storage.academia.mus.br/...` — **domínio inexistente**. |
| `WorldsAtlasScreen.tsx` | "142 obras do Barroco, 185 do Romantismo…" — existem **5 obras hardcoded**. |
| `VoiceEarLabScreen.tsx` | "85% de Precisão", "Sequência 4/10", barra de cents em 52% — todos fixos no JSX. |
| `seed-academy-content.ts` | Avatares de professores = fotos aleatórias do Unsplash. |
| Todas as lições | `illustrations[]` descreve gravuras históricas que **não existem** (`public/` contém só `favicon.svg`). |

---

## 5. Segurança — estado após o Bloco 0

🟢 **Os quatro bloqueadores de release foram fechados e verificados por execução.**

| Ataque original | Antes | Depois (verificado em 2026-09-16) |
| :--- | :--- | :--- |
| `POST /admin/verify -d '{"email":"<fundadora>"}'` | `authorized:true, level:100` | **HTTP 404** — o endpoint que aceitava e-mail deixou de existir |
| `GET /admin/audit-logs?email=<fundadora>` | log institucional completo | **HTTP 401** `UNAUTHENTICATED` |
| `GET /admin/verify` sem token | — | **HTTP 401** |
| Token de sessão forjado | aceito (não havia assinatura) | **HTTP 401** — HMAC não confere |
| `idToken: "mock_google_id_token_123"` | aceito | **HTTP 401** `MALFORMED_TOKEN` |
| E-mails da fundadora em `dist/` | **6 ocorrências** | **0** — guarda de build falha o release se voltarem |
| `FOUNDER_SUPERADMIN` / `isAuthorizedEmail` em `dist/` | 1 / 3 | **0 / 0** |

**O que mudou estruturalmente:**

- **`src/server/` foi eliminado.** Código de autoridade agora vive em `server/`, fora da raiz do Vite — o vazamento S-02 passou a ser estruturalmente impossível, não apenas evitado por disciplina.
- **Havia duas cópias da allowlist**, não uma: `src/server/admin/AdminRole.ts` e `src/domain/capabilities.ts`. A segunda alimentava 4 pontos do `entitlement-service` e o `user.repository`. Ambas removidas; a relação vive em `ADMIN_ALLOWLIST`, variável de ambiente do servidor.
- **Identidade verificada de verdade:** `server/core/google-identity.ts` busca o JWKS do Google, verifica a assinatura RS256 com Web Crypto e valida `iss`, `aud`, `exp`, `iat` e `nonce`. Rejeita `alg` diferente de RS256 (confusão de algoritmo) e e-mail não verificado.
- **Sessão assinada:** JWS HS256 emitido pelo servidor, com comparação de assinatura em tempo constante. Substitui `token_${id}_${Date.now()}`.
- **Senha eliminada por remoção de superfície**, não por remendo: `passwordHash`, `login(email,password)`, `register()`, `recoverPassword()` e `resetPassword()` não existem mais no domínio, nos contratos nem nas telas.
- **Auditoria encadeada:** HMAC-SHA256 que cobre o conteúdo e a assinatura do registro anterior. Alterar qualquer elo quebra `verifyChain()` e o endpoint devolve o `seq` comprometido.
- **Falha fechada em toda parte:** sem configuração → HTTP 503; autoridade inacessível → acesso negado; allowlist vazia → nenhum administrador.
- **Dev e produção compartilham o mesmo roteador** (`server/core/api-router.ts`), consumido pelo middleware do Vite e pela Cloudflare Pages Function. Acaba a divergência que fazia a API existir só em desenvolvimento (B-01).

**O que permanece aberto:** tudo que não é autenticação. Ver `CLAUDE_AUDIT.md` §2–§11 e `CLAUDE_TODO.md`.

---

## 6. Nota de ambiente (Windows)

`npm install` falhava com `ERR_INVALID_ARG_TYPE` no postinstall do `esbuild` porque a variável `ComSpec` estava vazia neste shell. Correção:

```bash
export COMSPEC="C:\\Windows\\System32\\cmd.exe"
npm install
```

Isso **não é um defeito do projeto**, mas deve constar no README/CI para reprodutibilidade.

---

## 7. Onde estamos na sequência de PROMPTS

| Comando | Missão | Status |
| :--- | :--- | :--- |
| **COMANDO 0** | Ler repositório, diagnosticar, criar CLAUDE_*.md | ✅ **CONCLUÍDO** |
| COMANDO 1 | Auditoria total → `docs/claude/01_REPOSITORY_AUDIT.md` | ⏭️ **PRÓXIMO** |
| COMANDO 2 | Auditoria de paridade visual/estrutural | ⬜ |
| COMANDO 3–5 | Paridade Academy / Profile / Practice | ⬜ |
| COMANDO 6 | Auditoria de conexões entre sistemas | ⬜ |
| COMANDO 7–10 | Knowledge Framework, ingestão, geração de cursos, quizzes | ⬜ |
| COMANDO 11–13 | Music Engine, Score/Studio, Teacher Room | ⬜ |
| COMANDO 14–15 | Segurança/Admin, Backend completo | ⬜ (itens 14 antecipados por emergência) |
| COMANDO 16–19 | Testes, documentação, paridade final, release gate | ⬜ |

---

## 8. Decisões de arquitetura (ADR-001 — tomadas em 2026-09-16)

### ADR-001.A · Hospedagem e persistência — **local-first, sem banco de dados**
- **Hospedagem:** Cloudflare Pages a partir do repositório Git.
- **Persistência primária:** `localStorage` do navegador (mantém a camada `StorageAdapter` já existente).
- **Backup/durabilidade:** JSON no Google Drive do próprio usuário, escopo `drive.appdata` (pasta oculta da aplicação).
- **Autenticação:** exclusivamente Google Sign-In — o que torna o backup no Drive automático e elimina senhas do produto.
- **Sem banco de dados relacional.**

**Consequências verificadas:**
- ✅ Elimina S-03 e S-05 (senha, hash, reset de senha) por remoção de superfície — não há mais senha no produto.
- ✅ Escopos `drive.appdata` e `drive.file` são classificados pelo Google como **não sensíveis** → sem verificação restrita, **sem auditoria CASA**, sem custo anual. ([Google Drive API — escopos](https://developers.google.com/drive/api/guides/api-specific-auth))
- ⚠️ **Exige uma camada serverless mínima.** Cloudflare Pages Functions (incluído no Pages, **não é banco de dados**) é obrigatório para três coisas que não podem rodar no cliente:
  1. **Verificar a assinatura do ID token do Google** contra o JWKS — sem isso, "login Google" é apenas uma string de e-mail (é exatamente a falha S-01 de hoje).
  2. **Guardar a allowlist de admin** como *secret* de ambiente, resolvendo S-02 (hoje os e-mails estão no bundle).
  3. **Proxy de CORS** para as APIs de domínio público que não permitem acesso direto do navegador (ver ADR-001.C).
- ⛔ **Conflito em aberto:** dados inerentemente multiusuário (fórum, salas professor↔aluno, conexões, ranking, perfil público de terceiros, verificação pública de certificado) **não podem existir** apenas com `localStorage` + `drive.appdata` privado. Decisão pendente — ver `CLAUDE_TODO.md`.
- ℹ️ **Certificados verificáveis sem banco:** assinatura Ed25519 com chave privada em *secret* do Cloudflare; a verificação pública confere apenas a assinatura do payload. **Zero armazenamento.**

### ADR-001.B · Fontes de conhecimento — **acervo em 7 pastas** (atualizado 2026-09-17)
Organizado por domínio em `framework_knowledge/`:

| Pasta | Papel | Obras |
| :--- | :--- | ---: |
| `bohumil-med/` | **base oficial do currículo** (ADR-002) | 2 |
| `music-ocidental-history/` | espinha de História Ocidental — Grout & Palisca | 1 |
| `music-brasil-history/` | espinha de História Brasileira — **Vasco Mariz** + **Tinhorão** | 2 |
| `knowledge-violin/` | ilha de instrumento (ADR-006) | 15 |
| `endinburgh- musictheory-002/` | curso complementar, insumo de Practice | 37 transcrições |
| *(raiz)* | Berklee Music Theory I e II | 2 |

**Total: 22 obras + 37 transcrições.**

Camada de texto (verificada):

| Obra | Páginas | Camada de texto | Ingestão |
| :--- | ---: | :--- | :--- |
| Berklee Music Theory Book 1 | 85 | ✅ fontes + `ToUnicode` | Extração direta |
| Berklee Music Theory Book 2 | 54 | ✅ fontes + `ToUnicode` | Extração direta |
| Grout & Palisca — *História da Música Ocidental* | 765 | ⚠️ fontes sem `ToUnicode` + 540 imagens | Extração arriscada; validar amostra |
| **Bohumil Med — Teoria da Música 5ed** | **424** | ❌ `/Font=0`, 424 imagens | **OCR obrigatório (pt-BR)** |
| **Med — Livro de Exercícios** | **264** | ❌ `/Font=0`, 264 imagens | **OCR obrigatório (pt-BR)** |
| Edinburgh — *Fundamentals of Music Theory* | 37 transcrições | ✅ texto puro | Extração direta |

**Total: 1.592 páginas, das quais 688 exigem OCR.**

🔴 **Risco jurídico ativo:** as 5 obras são comerciais e protegidas (Musimed, Gradiva, Berklee Press). O repositório **não tem `.gitignore`** e `framework_knowledge/` **já está versionado no Git**. Se o repositório Git for público no Cloudflare, 110 MB de livros protegidos são publicados. Os livros devem ser material de referência **local, fora do versionamento**, consumidos em tempo de autoria — e apenas o conteúdo original derivado + a citação vão para o produto. Isso é exatamente o que o `PROMPTS.md` (COMANDO 7/8) já determina.

### ADR-001.C · Conteúdo e mídias — **fontes de domínio público + resolução de entidades**
> **Reescrito em 2026-09-16** para incorporar MusicBrainz, Wikidata, a retificação sobre a API do IMSLP e a camada de resolução de entidades.
> Especificação normativa completa: **`docs/backend_specs/21.1_MUSIC_KNOWLEDGE_SOURCES_AND_ENTITY_RESOLUTION.md`**.

**Princípio:** a plataforma **não hospeda acervo próprio**. Ela **resolve, referencia e reproduz** conteúdo de domínio público a partir de fontes canônicas, e **gera** o que puder ser gerado programaticamente.

#### C.1 · Retificação — o IMSLP **tem** API oficial
A auditoria inicial afirmou que o IMSLP não possui API própria. **Estava errado.** Existe e está documentada: `imslp.org/imslpscripts/API.ISCR.php` (worklist). Verificado em 2026-09-16: responde `200` com JSON válido. Três armadilhas reais:
- Declara `Content-Type: text/plain` mas entrega JSON → exige `JSON.parse` explícito.
- Parâmetros são **posicionais separados por `/`** (`account=worklist/disclaimer=accepted/type=2/...`), não `&` → `URLSearchParams` produz URL inválida.
- Retorna **objeto indexado** (`{"0":{…}}`), não array → exige normalização.
- 🔴 **Continua sem CORS**, inclusive com `&origin=*` → o proxy permanece obrigatório.

#### C.2 · Fontes

| Fonte | CORS | Papel |
| :--- | :---: | :--- |
| **Wikidata** | ✅ | **Hub de resolução de entidades** |
| **MusicBrainz** | ✅ | Identidade de obra e gravação, autoria, relações |
| **Wikimedia Commons** | ✅ | Manuscritos, fac-símiles, gravuras, retratos |
| **Internet Archive** | ✅ | Gravações históricas (licença **por item**) |
| **Open Opus** | ✅ | Catálogo leve de compositores e obras |
| **IMSLP / Petrucci** | 🔴 proxy | **Partituras em domínio público** — fonte primária |
| **Musica Brasilis** | 🔴 proxy | Repertório brasileiro (sem API; curadoria + cache) |
| ~~MuseScore~~ | — | **Recusado** — acervo enviado por usuários e protegido. Serve só como alvo de formato |

#### C.3 · Camada de resolução de entidades — Wikidata como hub
A mesma obra hoje tem identidade incompatível em cada fonte (e, no código atual, um `'bwv-1001'` hardcoded dentro de `WorldsAtlasScreen.tsx`). Wikidata carrega as referências cruzadas e resolve tudo numa consulta. **Propriedades verificadas empiricamente:** `P86` compositor · `P839` ID do IMSLP · `P435` ID de obra no MusicBrainz · `P434` ID de artista · `P373` categoria no Commons · `P18` imagem · `P569`/`P570` nascimento/morte.

Retorno real da consulta executada:
```
Sonatas e Partitas para violino solo          ← rótulo pt-BR nativo
  IMSLP = 6_Violin_Sonatas_and_Partitas,_BWV_1001-1006_(Bach,_Johann_Sebastian)
  MB    = 4a8c18a0-efe2-4b56-a127-9958dec08ad3
```

Todas as telas passam a consumir `CanonicalWorkIdentity` normalizada — **a UI nunca fala com fonte externa diretamente**, preservando a arquitetura de portas e adaptadores já existente.

#### C.4 · Domínio público é **calculado**, não presumido
`P570` (data de morte) permite computar vida + 70 anos (Lei 9.610/98, art. 41) em vez de assumir que "obra antiga = livre". Status `PROTECTED` ou `UNDETERMINED` **não renderiza mídia**. Ressalva registrada: a **edição** de uma partitura tem direito próprio — a licença que o IMSLP declara para cada arquivo prevalece sobre o cálculo da obra.

#### C.5 · Mídia gerada e mídia do usuário
- **Gerada programaticamente:** pautas e exemplos notacionais em SVG; diagramas didáticos (ciclo das quintas, teclado, braço, condução de vozes); áudio de intervalos, escalas, acordes e playback de partitura por síntese WebAudio (base já existe em `infrastructure/audio/synth.ts`).
- **Do usuário:** MP3 importado e decodificado **localmente** via `decodeAudioData`; nunca enviado a servidor.
- 🔴 **Vedado gerar por IA** "manuscritos históricos" ou "gravuras de época": destrói a proveniência exigida pela Constituição §2 e fabrica material historicamente falso num produto acadêmico. Manuscrito real vem do Commons ou do IMSLP, com proveniência — ou não é exibido.

### ADR-001.D · Paleta — **vermelho primário, bordô secundário**
- **Primário:** `#991b1b` (mantido — é o vermelho já implementado).
- **Secundário derivado:** **`#6D1D2D`** — bordô obtido do primário deslocando a matiz para 348° (vinho) e reduzindo a luminosidade para 27%. Contraste sobre branco **11,3:1 (WCAG AAA)**.
- A rampa completa (50→900) de ambos será gerada na migração de tokens (Bloco 12), que passa a ser pré-requisito e não item cosmético.
- A Constituição §3 (`#8B1E2D / #6B1420`) fica formalmente emendada por esta decisão.

---

### ADR-002 · Hierarquia editorial do conteúdo acadêmico (2026-09-16)

| Papel | Fonte |
| :--- | :--- |
| **Base oficial do currículo** | **Bohumil Med — *Teoria da Música* (5ª ed.)**, com o ***Livro de Exercícios*** integrado ao longo do curso, e não como apêndice |
| Fontes complementares da Academia | Berklee Music Theory I e II; Grout & Palisca (*História da Música Ocidental*) |
| Insumo para Practice / Duolingo-Astra | **Edinburgh** — passa a ser mais um curso entre outros, alimentando experiências práticas, não a espinha dorsal |

**Consequências:**
- O `seed-academy-content.ts` atual está ancorado em Edinburgh e precisa ser reordenado sobre a estrutura do Med.
- As 688 páginas que exigem OCR são **exatamente as duas obras do Med** — ou seja, o OCR deixa de ser tarefa secundária e vira **caminho crítico** do currículo.
- O *Livro de Exercícios* é a fonte natural do banco de questões do COMANDO 10, com proveniência página a página.
- Citações a Med nas lições existentes permanecem `UNVERIFIED` até a ingestão confirmar cada número de página (item 7.4).

---

## 8-bis. Especificação de wireframes — `docs/claude/wireframes/`

Conjunto **normativo e permanente**, criado porque auditar paridade contra uma referência não escrita produz lista de críticas, e não contrato de implementação.

| Documento | Domínio | Referência |
| :--- | :--- | :--- |
| `00_FOUNDATIONS.md` | transversal — **ler primeiro** | — |
| `01_ACADEMY_COURSERA.md` | Academia (22 rotas) | Coursera |
| `02_PROFILE_LINKEDIN.md` | Perfil (3 rotas + 1 a criar) | LinkedIn |
| `03_PRACTICE_DUOLINGO_ASTRA.md` | Prática (16 rotas) | Duolingo + Astra Trainer |
| `04_ROOMS_SKOOL.md` | Salas & Comunidade (6 rotas) | Skool |
| `05_STUDIO_DAW.md` | Estúdio (3 rotas) | DAW profissional |
| `06_SCORE_NOTATION.md` | Partitura (2 rotas) | Dorico / Sibelius / Finale |
| `07_ADMIN_FOUNDER_CONSOLE.md` | Console da Fundadora (6 rotas) | — |
| `08_CORE_UTILITIES.md` | Núcleo & utilitárias (11 rotas) | — |

**Cobertura:** as 72 telas têm wireframe. `docs/backend_specs/21.2` especifica a mídia sobre o Drive (ADR-004).

**As 4 formas de página canônicas:** `FOCUS` (1 coluna) · `CATALOG` (filtros+resultados) · `DETAIL` (hero+abas+conteúdo+trilho) · `WORKSPACE` (ferramenta de tela cheia).

**Bloqueio raiz identificado:** não existe primitiva de grade de colunas. `ScreenContainer` só entrega título e ações — é essa ausência que produziu 65 telas empilhadas verticalmente e `sticky: 0/72`. Criar `PageLayout` é pré-requisito das Formas B, C e D.

---

## 8-ter. Resultado da auditoria de paridade (COMANDO 2)

**A paridade falhou exatamente onde a estrutura era exigida:**

| Forma de página | O que exige | Telas | `FULL` | Média |
| :--- | :--- | ---: | ---: | ---: |
| **A** `FOCUS` | 1 coluna — **nada** | 19 | **15** | **81** |
| **B** `CATALOG` | filtros fixos + resultados | 27 | **0** | **26** |
| **C** `DETAIL` | hero + abas fixas + trilho fixo | 20 | **2** | **35** |
| **D** `WORKSPACE` | painéis + área + transporte | 6 | **0** | **26** |

Média por domínio: Auth 84 · Academy 60 · Rooms 46 · Practice 41 · Profile 36 · Studio 20 · Admin 9 · Community 6 · **Score 4**.

**Causa única identificada:** ausência da primitiva de layout com colunas. Telas de uma coluna acertam (81/100); telas que precisam de grade improvisam empilhamento (26–35). Somado a **24 componentes de paridade construídos e nunca conectados**, em 57 pontos de aplicação.

**Consequência para o plano:** não é reescrever 72 telas. É construir `PageLayout` (destrava 53), reconectar o que existe, e recompor as 13 telas de P0.

---

## 8-quater. ADR-003 · Estado compartilhado (2026-09-16)

Pergunta levantada: perfil de terceiros e Skool seriam viáveis só com Drive + localStorage, já que o conteúdo é texto e imagem, com vídeo/áudio por link?

**Resposta técnica:** não, e a razão não é peso — é escopo. `drive.appdata` é uma pasta **app-private**, acessível apenas pelo usuário autenticado no momento. Não existe API que permita ao usuário B ler o `appdata` do usuário A. `localStorage` é ainda mais restrito (por navegador e máquina).

**O que a arquitetura de mídia por link resolve, e é correto:** a plataforma praticamente não armazena bytes. Vídeo → YouTube/Drive · MP3 → Drive · imagem histórica → Commons/IMSLP. Sobra texto e referência: perfil ≈ 3 KB, post ≈ 1 KB.

**Índice de busca — matemática:** ~200 bytes por pessoa. 1.000 → 200 KB · 10.000 → 2 MB · 100.000 → quebrado. **Só é problema se o navegador baixar o índice.** Com a busca executada numa Function, o índice nunca chega ao cliente e o peso deixa de ser limitante em qualquer escala.

**Decisão mantida (= decisão E):** Cloudflare KV, que é literalmente "documentos JSON por chave" — sem esquema, sem SQL, sem migração, sem servidor a administrar. Preferível a um arquivo único porque **elimina colisão de escrita**: uma chave por item (`thread:<id>:reply:<ts>:<userId>`) torna impossível duas pessoas se sobrescreverem no fórum.

| Camada | Onde | O quê |
| :--- | :--- | :--- |
| Privado | localStorage + Drive `appdata` | Aprendizado, prática, projetos, partituras, rascunhos (~80% do produto) |
| Compartilhado | Cloudflare KV | Cartão de perfil, índice de busca, fórum, salas, entregas, notas, conexões, ranking |
| Mídia | YouTube · Drive · Commons · IMSLP | Apenas links |

**Ressalva registrada:** a indexação de pessoas para busca deve ser **automática no login**, nunca manual pelo painel Admin — caso contrário o cadastro vira gargalo operacional da fundadora. O Admin modera e remove; não indexa.

---

## 8-quinquies. ADR-004 · Mídia sobre o Google Drive (2026-09-16)

**Decisão:** a plataforma **não hospeda um único byte** de mídia do usuário. Imagem, áudio e vídeo vivem no Drive do próprio autor; a plataforma guarda apenas o `fileId` e metadados em texto, e monta a reprodução de forma integrada — sem redirecionar e sem interromper o fluxo.

**Verificado empiricamente (cabeçalhos, 2026-09-16):**

| Caminho | CORS | Resultado |
| :--- | :--- | :--- |
| `lh3.googleusercontent.com/d/<id>` | ✅ `Access-Control-Allow-Origin: *` | **Imagem e áudio ficam indistinguíveis de nativos** |
| `drive.google.com/file/d/<id>/preview` | reflete origem · sem `X-Frame-Options` | Iframe de vídeo/PDF |
| `drive.google.com/uc?export=download` | ❌ | **403 — descontinuado, não usar** |

**Ressalva honesta:** vídeo **não** fica indistinguível — o player do Drive tem identidade do Google. Imagem e áudio ficam. Recomendação: iframe emoldurado pela nossa interface na v1.

**Decisão de projeto mais importante:** forma de onda, duração e dimensões são extraídas **no momento do upload**, enquanto os bytes estão na memória do navegador. O array de picos (~2 KB de texto) é persistido; o áudio nunca é reprocessado para renderizar a interface.

**Escopos:** `drive.appdata` (backup privado) + `drive.file` (apenas arquivos criados pelo app) — ambos **não sensíveis**, sem CASA.

🔴 **Consentimento obrigatório:** publicar exige permissão "qualquer pessoa com o link". A interface precisa dizer isso claramente e oferecer o caminho de despublicar.

**Fronteira:** mídia do usuário → Drive · acervo histórico → Commons/IMSLP com proveniência (`21.1`) · material didático → síntese e SVG programáticos. Nunca misturar as três origens.

---

## 8-sexies. ADR-005 · Admin = console da fundadora (2026-09-16)

O Admin **não** é CRUD de usuários nem central de suporte. É instrumento de leitura do negócio, com quatro finalidades: **insights · SEO e alcance · notificações e alertas · comercial (cupons, planos, conversão)**.

Consequência imediata: `AdminUsersScreen`, `AdminContentScreen` e `AdminEnginesScreen` são **descontinuadas** — a primeira porque os dados pessoais vivem no Drive do usuário e a fundadora não tem nem deve ter acesso; a segunda porque autoria pertence ao pipeline de conhecimento; a terceira porque exibia telemetria falsa. Criar `/admin/seo`, `/admin/communication` e `/admin/commercial`.

🔴 **Descoberta que bloqueia o SEO inteiro:** a aplicação roteia por *hash*. Fragmentos de hash **não são indexáveis** — para um buscador, o site tem uma página só. Migrar para `history.pushState` passa a ser **P0 comercial**, não higiene técnica.

---

## 8-septies. ADR-006 · Atlas de dois eixos (2026-09-17)

**Decisão:** o Atlas não é uma linha do tempo com obras penduradas. São **dois eixos que se cruzam**:

- **Eixo temporal** — mundos/eras (Barroco, Classicismo, Romantismo, Moderno, Brasileira)
- **Eixo instrumental** — **ilhas**, uma por instrumento com corpus próprio

**Encontro:** a obra. A Chaconne BWV 1004 é Barroco **e** Violino; quem a estuda carimba o passaporte nos dois eixos.

**Por que ilha e não filtro:** *"uma trilha orientada a instrumento é um curso à parte"*. O corpus de violino (Suzuki, Hans Sitt, Maia Bang, Laoureux, All for Strings) não é teoria musical — tem progressão, pedagogia e avaliação próprias. Reduzi-lo a faceta de busca apagaria sua ordem, que é o que ele tem de mais importante.

| | Espinha teórica | Ilha de instrumento |
| :--- | :--- | :--- |
| Corpus | Bohumil Med, Berklee | Suzuki, Sitt, Maia Bang, Laoureux, AFS |
| Progressão | conceitual | técnica e de repertório |
| Avaliação | exame, quiz | execução aferida por evidência |
| Relação | pré-requisito transversal | consome a teoria, não a substitui |

**Regra de honestidade, verificada por teste** (`tests/atlas-islands.test.ts`): uma ilha só é navegável com corpus real em disco **e** currículo derivado dele. Três estados: `AVAILABLE` · `IN_PREPARATION` · `PLANNED`. Ilha `PLANNED` marca o lugar no mapa e não promete conteúdo. Existe porque o Atlas anunciava "142 obras do Barroco" sobre 5 registros fixos (K-05).

**Convenção de descoberta:** cada ilha corresponde a `framework_knowledge/knowledge-<slug>/`. Abrir uma nova ilha são 5 passos documentados em `seed-atlas-islands.ts`.

**Estado:** Violino `IN_PREPARATION` — **15 obras presentes, 0 ingeridas**. Piano, Canto e Violão `PLANNED`.

**Carimbos do eixo instrumental** exigem `evidenceId`: carimba-se por execução medida, nunca por ter aberto a página.

---

## 8-octies. ADR-007 · Conservatório e as duas espinhas historiográficas (2026-09-17)

**Princípio:** *a aula ensina a história; o grafo permite explorar a história.* Um curso de História não carrega o catálogo inteiro dentro das aulas — a lição aponta para uma **coleção dinâmica** de compositores e obras que vive no grafo de conhecimento.

**Conservatório** é a seção da Academia onde esse grafo é navegável: o tour por compositores, obras e biografias, em `/academia/conservatory/*`.

**Cadeia canônica:** `LIVRO → CAPÍTULO → PERÍODO → MOVIMENTO → COMPOSITOR → OBRA → PARTITURA → GRAVAÇÃO → ANÁLISE → LIÇÃO → EXERCÍCIO → PRÁTICA → EVIDÊNCIA → PERFIL`

**Entidades próprias, fontes externas como referência:** `CanonicalComposer` e `CanonicalWork`, com **proveniência por CAMPO** (`FieldProvenance`) — a biografia pode vir de uma fonte, as datas de outra e o identificador de obra de uma terceira. Registrar proveniência só no nível da entidade apagaria essa distinção, e é ela que permite auditar, corrigir e dar crédito.

### As duas espinhas

| Curso | Fonte-base | Eixo |
| :--- | :--- | :--- |
| **História da Música Ocidental** | Grout & Palisca | cronológico por era; cruza com o eixo temporal do Atlas |
| **Brasileira · Unidade 1** | Vasco Mariz | música de concerto: colonial, Império, nacionalismo, séc. XX |
| **Brasileira · Unidade 2** | José Ramos Tinhorão | história social da música popular: modinha, lundu, choro, samba, rádio, bossa, tropicalismo |

Manter Mariz e Tinhorão em unidades **separadas** é decisão editorial: um escreve história da música de concerto, o outro história social da música popular. Fundi-los numa linha do tempo única apagaria a diferença de método que é o valor de cada um.

### Música Brasilis — verificado em 2026-09-17

| Verificação | Resultado |
| :--- | :--- |
| `/api/` · `/api/v1/` · `/wp-json/` | 302 · 302 · 301 — **não há endpoint de API** |
| Documentação pública de API | **não localizada** |
| `robots.txt` | existe, e contém `Disallow: /media/` |

**`/media/` é exatamente onde ficam as partituras.** A proibição é explícita.

**Decisão:** o `MusicaBrasilisAdapter` fica **especificado e desabilitado** até haver acesso oficial. **Não fazer scraping** — nem do catálogo, nem de `/media/`. Enquanto isso: curadoria manual de metadados com `source: 'MANUAL_CURATION'` e **link de saída** para a página deles. Linkar é uso normal da web; baixar em massa contra o `robots.txt` não é.

**Ação recomendada:** contato institucional pedindo autorização.

Especificação completa em `docs/backend_specs/21.1 §10`.

---

## 8-nonies. ADR-008 · Partituras de domínio público (2026-09-17)

**A distinção que resolve a questão:** domínio público da **obra** ≠ permissão para baixar em massa o **servidor** de alguém. A música de Carlos Gomes é livre; o PDF digitalizado por uma instituição é trabalho e infraestrutura dela.

A obra ser livre **garante** que podemos obtê-la de fonte que permite redistribuição, ou editorá-la nós mesmos. O objetivo — tudo nativo, sem redirecionar — é plenamente alcançável; só muda o caminho.

### ⚠️ Correção de especificação minha

O `21.1 §3.2` classificava o IMSLP como fonte primária de **arquivos**. Errado. Verificado:

```
Disallow: /images/     ← PDFs das partituras
Disallow: /imglnks/    ← PDFs das partituras
```

**IMSLP está na mesma situação da Música Brasilis:** metadados acessíveis, arquivos proibidos ao rastreamento.

### ✅ Mutopia Project — a fonte que resolve

`robots.txt`: `Disallow:` **vazio** — rastreamento integralmente permitido. E o projeto declara: *2.124 peças livres para baixar, modificar, imprimir, copiar, distribuir, executar e gravar, em Domínio Público ou Creative Commons, em PDF, MIDI e LilyPond editável.*

Decisivo: fornece **MIDI e código-fonte LilyPond**, não só PDF. Com a fonte simbólica, renderizamos a partitura **nativamente** — pauta própria, playhead próprio, ligação com Score Studio e prática. PDF embutido seria imagem morta.

Contrapartida: atribuição de editor e licença **por peça**, alimentando o `FieldProvenance`.

### Hierarquia de fontes

| Nível | Fonte | Exibição |
| ---: | :--- | :--- |
| 1 | **Mutopia** | **nativa** (LilyPond/MIDI → nossa pauta) |
| 2 | **Wikimedia Commons** | **nativa** (manuscritos, fac-símiles) |
| 3 | **Nossa própria edição** (MusicXML) | **nativa** |
| 4 | **Internet Archive** | **nativa** (áudio) |
| 5 | IMSLP · Música Brasilis | **só metadados** — arquivos não são buscados |

Níveis 1–4 cobrem "tudo dentro da plataforma, sem redirecionar". Nível 5 enriquece a ficha sem tocar nos arquivos.

### Obra sem edição livre

A ficha declara: *"Obra em domínio público · edição livre ainda não disponível no acervo"*, e oferece o que a plataforma gera sozinha (síntese, análise). **Nenhum link para fora.**

### Repertório brasileiro — a oportunidade

O Mutopia é forte em europeu e fraco em brasileiro. Para a Unidade Brasileira, o caminho é **editorar nós mesmos** obras brasileiras de domínio público — Nazareth, Chiquinha Gonzaga, Callado, Carlos Gomes, Anacleto de Medeiros. São obras livres; falta edição digital redistribuível.

Isso move a plataforma de **extratora** para **contribuinte** do acervo comum, e torna a edição nativa por construção.

Especificação completa em `docs/backend_specs/21.1 §11`.

---

## 9. Regras de trabalho ativas (acordadas no COMANDO 0)

1. Investigar → diagnosticar → só então implementar.
2. Não simplificar funcionalidades; não substituir arquitetura por mock.
3. Não declarar implementado porque existe tela.
4. Não remover funcionalidade existente sem justificativa técnica escrita.
5. Não inventar dados para uma tela parecer pronta.
6. Ao final de cada missão: atualizar `CLAUDE_STATE.md`, `CLAUDE_AUDIT.md`, `CLAUDE_TODO.md`.
7. Referência de mercado = **clone de estrutura e experiência**; identidade, conteúdo e dados = **próprios**.

---

## Sessão de 2026-09-17 — Teoria completa, shell enxugado, catálogo purgado

| Verificação | Comando | Resultado |
| :--- | :--- | :--- |
| Typecheck estrito | `tsc --noEmit` | ✅ 0 erros |
| Lint | `eslint src tests` | ✅ 0 erros, 19 warnings (`no-explicit-any`, preexistentes) |
| Testes | `vitest run` | ✅ **331/331** (20 arquivos) |
| Build | `npm run build` | ✅ inclui `verify:secrets` e `verify:citations` |

### Curso de Teoria — de 16 para 58 capítulos

| Métrica | Antes | Agora |
| :--- | ---: | ---: |
| Capítulos | 16 | **58** |
| Módulos | 16 | **58** |
| Lições | 16 | **58** |
| Blocos de conteúdo | 91 | **340** |
| Checkpoints | 16 | **58** (um por capítulo, verificado) |
| Laboratórios/áudio | — | 64 blocos em 41 capítulos |

Cobertura conferida por script: nenhum capítulo sem blocos, nenhum id de bloco
duplicado, nenhum capítulo sem checkpoint.

Os 17 capítulos que antes não existiam: modulação, transporte, teoria alemã dos
compassos, transposição dos modos litúrgicos, abreviaturas, termos especiais,
escala geral, nomenclatura das notas, acordes a quatro vozes, acordes de sétima
e suas alterações e inversões, acordes de nona, outros acordes, origem e
enarmonia dos acordes, instrumentos transpositores e notação moderna.

### Shell — de três menus para um

Removidos: a barra branca de pilares (`Navigation.tsx`, apagado), a sub-barra
rotulada "Sub-rotas", a segunda marca ("Academia Musical"), e a tela de raiz
(`OverviewScreen.tsx`, apagada) que repetia o menu pela terceira vez.

Novos: `NavMenu` (rotas atrás de um chevron, abre por proximidade),
`HeaderSearch` (uma lupa que expande), `Carrossel` (paginado).

A raiz `/` agora abre o Academy.

### Catálogo — fabricação removida

`seed-academy-content.ts` continha três cursos que nunca existiram
(`crs_fomt_01`, `crs_fomt_02`, `crs_contraponto_01`), com ementas, módulos,
lições, provas e questionários escritos por inteiro, atribuídos a uma docente
morta em 1896, com foto de banco de imagens e autor `usr_founder_1`. Sobre eles
havia dois programas e três trilhas igualmente inventados.

Tudo removido. Resta o que é real: o curso de Teoria.

### Player

5 faixas → **31**, todas de domínio público ou material teórico próprio
(`seed-player-repertoire.ts`). Removida a faixa assinada por uma cátedra
estrangeira — violação da regra de não citar fontes.

### Paridade com o Coursera

Auditoria completa em `docs/PARIDADE_COURSERA.md`. Sete lacunas reais de
sistema, sendo vídeo a mais visível; três lacunas de conteúdo (os outros três
cursos ainda não foram escritos).
