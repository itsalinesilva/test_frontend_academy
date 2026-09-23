# CLAUDE_TODO.md — Backlog de Engenharia

**Origem:** diagnóstico do COMANDO 0 (`CLAUDE_AUDIT.md`)
**Atualizado:** 2026-09-23
**Regra:** nenhum item é fechado por "a tela existe". Fecha-se com código + persistência + autorização + teste + documentação.

**Estados:** ⬜ aberto · 🔄 em andamento · ✅ concluído · ⛔ bloqueado (depende de decisão sua ou de serviço externo)

---

<!-- PRONTIDAO:INICIO -->

## CURADORIA DO RELATÓRIO DE TESTES

> **Seção prioritária, e escrita por máquina.** É o passo final da suíte:
> `tests/report-curation.test.ts` regenera este bloco e **falha se ele
> estiver desatualizado**. Não há como rodar os testes e esquecer de curar o
> relatório — é a mesma execução.
>
> O que é adiado, manual ou seu para decidir vive em `CLAUDE_BACKLOG.md`.
> Item sobe de lá para cá ao virar trabalho imediato, e desce ao depender de
> decisão ou de outra fase.

### As sete perguntas — apuradas em 2026-09-23

> **Esta seção é escrita por máquina.** Não edite à mão: o próximo `qa:todo`
> sobrescreve. O que foi resolvido sai sozinho; o que apareceu entra sozinho.

| Área | Respondidas | O que falta |
| :--- | :---: | :--- |
| Academia | 10/10 | — |
| Laboratório | 10/10 | — |
| Atlas | 10/10 | — |
| Comunidade | 10/10 | — |
| Perfil | 10/10 | — |
| Console | 10/10 | — |
| Estúdio | 10/10 | — |

### Fila, na ordem em que deve ser resolvida

Nenhuma pendência de prontidão.

### O que estas sete perguntas NÃO respondem

Se a tela está **boa**. Desenho, texto certo no contexto e fluxo que leva ao
lugar certo continuam precisando de navegador e de olho humano — `F.2`.

<!-- PRONTIDAO:FIM -->

---

## DÍVIDA DA PRÓPRIA SUÍTE

> Registrada aqui, e não escondida na conversa. É **parte do trabalho da
> suíte** manter esta lista curta: ao perceber um déficit nela, refatorar.

| # | Item | Estado |
|:---|:---|:---:|
| S-1 | Todo verificador ligado ao pente fino | ✅ 0 soltos |
| S-2 | Todo verificador **visto acusando** por um teste — superado pelo S-2b, que exige mais: não uma acusação, mas todas as formas conhecidas do defeito | ✅ ➡ S-2b |
| S-2b | **Cobertura de ponta a ponta por sinal** — não basta acusar uma vez: cada sinal tem tabela de variantes (≥3 formas do defeito), de casos limpos (≥3, contra falso positivo) e de **limites declarados**. 296 asserções em `tests/checkers-coverage.test.ts` | ✅ **39 de 39** |
| S-2c | **A tabela achou dois verificadores quebrados que a varredura não achava** — ver S-7 e S-8. Foram os casos LIMPOS que os pegaram: verificador que acusa código correto não aparece como falha, aparece como ruído que a gente aprende a ignorar | ✅ |
| S-7 | **`checkKeyboardReach` acusava toda div clicável, até as corretas.** `[^>]*` não atravessa o `>` da SETA: em `<div onClick={() => x()} onKeyDown={y}>` a lista de atributos era cortada no `=>`, e `onKeyDown`, `tabIndex` e `role` ficavam fora do exame. Latente — só dispararia na primeira div clicável escrita na ordem natural. Corrigido com leitura da abertura por contagem de chaves | ✅ |
| S-8 | **`checkComingSoonPromise` era cego a texto sem acento** — `indisponível` casava, `indisponivel` não. Corrigido com classe de caractere | ✅ |
| S-3 | `checkNavigationTargets` era **vazio** — aceitava `/` como prefixo, e todo caminho absoluto passava. Achou 6 botões mortos ao ser consertado | ✅ |
| S-4 | **Segunda costura, para arquivo fixo.** Os que liam caminho conhecido por `readFileSync` — tabela da economia, outlet, `audiencia.ts`, guarda, repositório do Academy, serviço de autenticação — não podiam ser provados sem escrever no repositório de verdade. E eram os mais pesados: herança de audiência, cobertura da guarda, permanência do dado do aluno ao publicar. `injectFile`/`readSource` resolveu | ✅ |
| S-9 | **Três fora das tabelas, com motivo escrito e trava contra crescer**: `checkEveryCheckerIsWired` e `checkEveryCheckerHasProof` verificam a própria suíte (injetar o inventário seria provar um inventário de mentira); `checkReadiness` agrega dez perguntas sobre sete áreas e tem teste próprio | ✅ |
| S-10 | **`uiStrings` era cego a frase portuguesa sem acento.** A regra de "caminho com interpolação" classificava como técnica QUALQUER string de letras e espaços sem acento — ou seja, o grupo que existe para achar falta de acento não via texto sem acento nenhum. Estreitada para exigir caractere de caminho. Achou **9 erros de acentuação e 16 de pontuação em texto que o aluno lê** | ✅ |
| S-11 | Os 25 defeitos de texto que o S-10 revelou: "Nao foi possivel carregar seu perfil.", "O identificador informado nao corresponde a uma licao do curriculo.", "Carregando o laboratorio...", e mais 22 | ✅ corrigidos; `a corrigir` do pente fino caiu de 18 para 2 |
| S-12 | **`checkPublicDomainRepertoire` era vazio contra o arquivo de verdade.** Procurava registros `{ id: '...' }`; o acervo é construído por chamadas a `faixa(...)`. Varria **33 faixas e enxergava zero** — e os fixtures da tabela usavam a forma errada também, então a cobertura estava verde. Refeito: lê o autor e exige `AUTORES_DO_ACERVO`, rol com justificativa por autor (morte, tradicional ou próprio) | ✅ |
| S-13 | **Prova de não-vacuidade contra o repositório real.** A lição do S-12: tabela de cobertura prova que o verificador enxerga o FIXTURE, não que o fixture se pareça com o código. Os cinco leitores de estrutura — regras de audiência, pares rota-tela, chaves de armazenamento, linhas da tabela de contagem, rotas servidas — agora têm piso cobrado contra o repositório de verdade | ✅ |
| S-14 | **Declarações por nome em vez de `Record<string, QaCheck>`** — o atalho fazia nome de verificador errado compilar, porque qualquer chave servia num Record. Agora é erro de compilação | ✅ |
| S-15 | **Etapas de teste, por custo medido.** 1346 testes não se roda a cada commit. `test:commit` 15s/731t · `test:push` 38s/1015t · `test:tudo` 50s/1346t. O que cada uma prova, o que **não** prova, e as seis situações em que a completa é obrigatória: `docs/harness/83_TEST_STAGES.md` | ✅ |
| S-16 | **A suíte da suíte custava 150s por desperdício**, não por tamanho: `sources()` relia os 84 arquivos de `src/` a cada invocação de verificador — 300 varreduras completas em sequência. Cache por processo: 150s → 12s | ✅ |
| S-17 | **`checkRetiredVocabulary` só via a palavra no INÍCIO do identificador.** O código real escreve `etapaDaTribo`, `listarTribos`, `setTriboId` — em camelCase a palavra vem depois de minúscula. Acusava **0 sobre 8 ocorrências vivas**, e o fixture (`triboId`) era a única forma que ele enxergava. A correção óbvia (permitir meio de palavra) deu **69 acusações, quase todas falsas** — `ilha` vive dentro de `trilha`. O que separa é o limite de CAIXA: o `T` de `etapaDaTribo` é fronteira, o `i` de `trilha` não | ✅ 8 corrigidas |
| S-18 | **`verify:citations` nunca tinha sido visto acusando** e a lista estava incompleta — faltavam as duas historiografias brasileiras nomeadas como fonte-base e os métodos de instrumento. 7 nomes acrescentados, superfície testável separada | ✅ |
| X-13 | 🔴 **CITAÇÃO DE FONTE NO PRODUTO, E NO BUNDLE PUBLICADO.** `seed-houses.ts` levava a bibliografia da Casa dos violinistas como DADO DE PRODUTO — título, autor, volume e caminho de PDF de quatro métodos protegidos — e a `description` que o aluno LÊ nomeava dois deles. O tipo dizia "referência interna, nunca publicada"; `src/data/` entra no pacote. Corrigido: o produto guarda só a contagem (`HouseCorpus`), a proveniência virou registro editorial fora do pacote (`docs/harness/82_HOUSE_CORPUS.md`), e a descrição foi reescrita em voz autoral | ✅ |
| A-7 | **CADEIRA — o Grêmio passa a ser por cadeira, não por curso.** O domínio e o documento diziam "um Grêmio por curso": cinco cursos, cinco Grêmios, **três deles de história**. Partia os historiadores em três e quebrava a regra do §7 do próprio documento — quem cursou História Ocidental e quem cursou História Brasileira não se encontravam em Grêmio nenhum, logo não podiam abrir o mesmo Clube. Agora: 5 cursos → **3 cadeiras** (Teoria, História, Violino) → 3 Grêmios | ✅ `src/domain/chair.ts` |
| A-8 | **Duas Casas mentiam o próprio status.** Historiadores e Teóricos estavam `IN_PREPARATION` com **zero obras** — e o tipo define `IN_PREPARATION` como corpus presente. A lista afirmava um preparo que não havia começado. Ambas passam a `ANNOUNCED`, que é o caminho sedimentado honesto | ✅ |
| A-9 | **Modo Casa, com filtros derivados.** Habilita quando a Casa tem cadeira **e** corpus — só cadeira daria modo vazio, só corpus daria modo sem curso que leve até ele. Os filtros do Atlas saem do que a Casa já declara (eras, regiões, competências), e não de campo novo: duas fontes para o mesmo fato divergiriam | ✅ `filtrosDoModoCasa` |
| A-10 | Três verificadores novos, cobertos ponta a ponta: `checkCourseHasChair` (curso sem cadeira é curso sem Grêmio), `checkChairHasCourse` (cadeira vazia seria Grêmio que ninguém pode integrar), `checkHouseStatusMatchesCorpus` | ✅ |
| L-1 | 🔴 **A LIGA, AS MISSÕES E A OFENSIVA ERAM INCAPAZES DE MOSTRAR DADO.** `PracticeLeagueScreen` chamava `computeStandings([], ...)` com array vazio **literal**, logo abaixo de um comentário dizendo que a apuração roda sobre as inscrições da semana. As missões recebiam `EMPTY_ACTIVITY` cravada; a ofensiva, `streakDays={0}` e `freezes={0}`. Praticar todo dia por um mês não mudaria uma linha. O domínio existia, a interface existia e era testada — **faltava o meio** | ✅ |
| L-2 | **`routine.repository.ts`** — a camada que faltava: inscrição de liga por semana e recorte, e atividade do dia por pessoa. Nada nasce semeado | ✅ |
| L-3 | **A PONTE ACADEMIA ↔ LABORATÓRIO.** Existia como dois `navigate()` numa tela de lição — hiperlink não é integração. `DailyActivity.lessonsCompleted` existia desde sempre e **nada nunca o preenchia**: a missão "conclua uma lição" era incumprível por construção. Agora `completeLesson` e `finishSession` escrevem no MESMO registro de rotina | ✅ `tests/routine-bridge.test.ts`, 17 casos |
| L-4 | **`checkEmptyLiteralAsData`** — apuração sobre vazio literal dentro de tela. Não há sintaxe errada: há uma ausência, e ausência não tem forma. Nove formas cobertas, `useState([])` isento | ✅ |
| L-5 | **`AtlasFilter.genreId` filtrava um campo que NÃO EXISTIA** na obra. Quem filtrasse por gênero recebia a lista inteira, sem sinal nenhum de que o recorte foi ignorado. `generoId` acrescentado à obra e aplicado; `checkAtlasFilterIsApplied` recusa que volte | ✅ |
| L-6 | Meu próprio teste da ponte nasceu **vazio**: filtrei por `'LICOES'` e o tipo real é `'LESSON_COMPLETED'`. A lista vinha vazia, o `for` não rodava, e o teste passava medindo nada — dentro do arquivo escrito para impedir exatamente isso. Trava de não-vacuidade acrescentada | ✅ |
| L-7 | **"Muito fácil / muito difícil" passa a ser ouvido.** O percurso grava o veredito e o LÊ: numa seção com mais fáceis que difíceis, a próxima lição sobe de Reconhecer para Nomear (`calibragem-do-percurso.ts`). A frase "o percurso se ajusta a isso" deixou de ser promessa vazia | ✅ `calibragem-do-percurso.test.tsx`, de ponta a ponta |
| L-7a | **"Reportar um problema" chega a alguém.** Endpoint `POST /api/v1/relatos` (só com sessão; a autoria vem da sessão assinada, nunca do corpo) e `GET /api/v1/founder/relatos` (só administração), guardando no KV da Cloudflare `RELATOS`. A tela só diz "vamos revisar" quando o servidor guardou; se não guardou, diz que o relato não foi enviado e por quê. O console de lições lista os relatos. ⛔ **Um passo de painel, e não de código:** criar o KV e ligá-lo como `RELATOS` (ver `.env.example`) — sem ele a API responde 503 e a tela diz isso | ✅ código · ⛔ configurar o KV
| L-7b | 🔴 **O visitante ficava preso em "Abrindo o percurso…".** `/practice` é público, e `PracticePathScreen` só terminava de carregar com sessão. Sem sessão, o percurso agora abre vazio | ✅ |
| L-8 | `atlasRepository.salvarObra` órfão — nada no produto grava obra no Atlas. É o que `B-5` vai usar | ⬜ |
| L-9 | 9 métodos mortos em `academy.service` (`submitAssessment`, `submitActivity` e outros) são **duplicatas** das versões `*Attempt` que funcionam. Superfície não verificada, confunde quem lê | ⬜ |
| L-10 | `earTrainingCorrect` fica zerado: a medição distingue ACOUSTICS de SIMBÓLICA, e nenhuma das duas é percepção auditiva. A missão correspondente não avança — que é a verdade até a sessão carregar o tipo do exercício | ⬜ |
| L-11 | **Modo Casa no Atlas** — `filtrosDoModoCasa` existe no domínio e a tela do Atlas ainda não o usa para recortar por Casa | ⬜ |
| S-5 | **Tela de admin** para editar questão e criar lição — questão: editor de livretos ligado ao console (EE-17); lição: "Nova lição" em `/founder/licoes` (EE-22b) (curado em 2026-09-22) | ✅ |
| S-6 | Template de questão e de lição, para duplicar e editar em vez de escrever do zero | ⬜ |

---

# A ORDEM

> **Esta seção manda.** O detalhe por área continua abaixo, como referência e
> histórico, mas a sequência de trabalho é esta. Ela foi ordenada por
> dependência real: cada fase destrava a seguinte, e fazer fora de ordem
> significa construir sobre o que ainda não existe.
>
> As fases vêm de `77_SECTIONS_AND_LEVELS.md`, `78_REWARDS_AND_PASSPORT.md`,
> `79_LAB_TOOLS.md` e `80_INSTITUTIONAL_ARCHITECTURE.md`.
>
> **Decisão de 19/09:** a Fase B — povoar o acervo — está **adiada**. Ela
> continua sendo o que trava o Laboratório, e continua descrita abaixo, mas
> não se trabalha nela agora.

## Fase A — o Laboratório existe mas ninguém alcança

Oito telas prontas e testadas, nenhuma com rota. É o item mais barato e o de
maior efeito: sem ele, todo o resto é código que ninguém roda.

| # | Item | Estado |
|:---|:---|:---:|
| A-1 | **Rotas para as oito telas** — as oito estão montadas: exercício, encerramento e mapa em `/practice/path`; liga, missões e ofensiva em `/practice/league`; matrícula e réguas em `/practice/enrollment` (curado em 2026-09-22) | ✅ |
| A-2 | **Persistência do que elas produzem** — nós concluídos e meta de ofensiva gravam por `practice-path.repository` (`completeNode`, `setStreakGoal`). O veredito de dificuldade segue órfão, e é o L-7 (curado em 2026-09-22) | ✅ parcial → L-7 |
| A-3 | **Gerador de exercícios** a partir das 21 dimensões. Sem ele o percurso tem forma e não tem conteúdo | 🔄 `exercise-generator.ts` cobre 6 dimensões nos níveis 0, 1 e 3 · faltam 15 dimensões e os níveis 2 e 4 |
| A-4 | Contêiner que costura percurso → lição → encerramento → mapa atualizado — é `PracticePathScreen` (curado em 2026-09-22) | ✅ |

## Fase A-bis — a estrutura institucional e social

Definida em `80_INSTITUTIONAL_ARCHITECTURE.md`, de 19/09. Ela corrige duas
coisas que estavam erradas: "tribo" carregava sozinha três funções, e
"Laboratório" havia sido escrito como guarda-chuva do produto.

| # | Item | Estado |
|:---|:---|:---:|
| S-1 | `Tribe` → `House` em todo o código e nos documentos | ✅ |
| S-2 | Domínio de Grêmio, Casa e Clube, com "não existe Clube sem Grêmio" | ✅ `membership.ts` |
| S-3 | Carteira de pertencimento no Passaporte — as seis perguntas | ✅ `MembershipCardPanel.tsx` |
| S-4 | Verificação que barra vocabulário aposentado | ✅ `checkRetiredVocabulary` |
| S-5 | **Grêmio criado de fato na matrícula** — hoje o domínio existe, nada o cria | ⬜ |
| S-6 | **Casa aberta pela prática recorrente** — três sessões | ⬜ |
| S-7 | **Clube: criar, entrar, fórum próprio**, vinculado ao Grêmio | ⬜ |
| S-8 | Recorte de liga `GUILD` e `CLUB`, além de `HOUSE` e `PLATFORM` | ⬜ |
| S-9 | **Associação** — fundadora e lista vazia de contribuintes | ⬜ |
| S-10 | Tela do Passaporte reunindo carteira + carimbos + emblemas | ⬜ |

## Fase V — visitante e apresentação

Auditoria de 19/09. Das 81 telas, 47 distinguem visitante. O defeito não era
falta de tela: era mostrar ao visitante o **componente de logado vazio** —
"Seu progresso: você ainda não se matriculou" — gastando o melhor espaço da
tela para dizer à pessoa que ela não tem nada.

| # | Item | Estado |
|:---|:---|:---:|
| V-1 | Componente de convite: o que é, o que levo, como começo | ✅ `VisitorInvitation.tsx` |
| V-2 | **Academia** — trilho vira convite, com números reais e a ressalva de curso livre | ✅ |
| V-3 | **Atlas** — convite explicando o que ele vira depois de entrar | ✅ |
| V-4 | **Comunidade** — ação principal deixa de ser "Escrever publicação" para quem não pode publicar | ✅ |
| V-5 | **Partituras** (`/score`) — apresentação do acervo público | ⬜ |
| V-6 | **Busca** (`/search`) — o que se pode achar sem conta | ⬜ |
| V-7 | **Obra** (`/worlds/work/:id`) — convite ao simulador e ao carimbo | ⬜ |
| V-8 | **Credencial** (`/credential`) — já é pública por projeto; conferir o texto | ⬜ |
| V-9 | **Raiz** (`/`) — a home do visitante é a porta comercial; revisar contra os convites | ⬜ |
| V-10 | Verificação: tela em rota pública não mostra seção de progresso pessoal | ✅ `checkPersonalSectionWithoutSession` |

## Fase X — segurança, auditoria de 19/09

| # | Item | Estado |
|:---|:---|:---:|
| X-1 | `/academia/result/<id>` herdava audiência **pública** e mostrava a prova de qualquer um | ✅ |
| X-2 | `getAssessmentAttempt`, `getAssessmentSubmission`, `getAttempt`, `getResult`, `getCertificate` liam registro pessoal sem dono | ✅ |
| X-3 | `checkRecordOwnership` — a classe inteira passa a ser verificada | ✅ |
| X-4 | Revisar as demais rotas que herdam audiência por prefixo, uma a uma | ✅ `checkPersonalRouteInheritingPublic` faz por máquina |
| X-5 | **`checkDeadButton` era cego a corpo vazio.** A captura `onClick=\{([^}]*...)\}` engolia a chave de ABERTURA do corpo (`{` não é `}`) e devolvia `() => {`, que não casa com nada; o `.{0,160}` da outra forma era guloso até o fim da linha. Só via `alert()`. Reescrito com **contagem de chaves**, achou 3 controles mortos reais | ✅ |
| X-6 | **`/admin` era `exigeLogin`** — a hierarquia vivia em dois sistemas, e só um era auditado | ✅ nível `exigeAdmin` |
| X-7 | Guarda aplica os quatro níveis, com recusa que não descreve o que protege | ✅ |
| X-8 | `81_HIERARCHY_AND_ISOLATION.md` — a hierarquia escrita | ✅ |
| X-9 | Teste de fluxo real: guarda renderizada para visitante, aluno e admin | ✅ `audience-guard.test.tsx` |
| X-10 | **`/admin` → `/founder`** — não anunciar que existe console; `/admin` deixa de existir | ✅ |
| X-11 | **`/academy` → `/academia`** e os rótulos de tela em português | ✅ |
| X-12 | Verificação contra a volta de `/admin` e contra nome técnico na tela | ✅ |

## Fase M — o que a tela prometia e não existia

Pente fino de frontend, 20/09. Cinco telas afirmavam coisas que ninguém
apurou. Nenhuma foi pega pelos verificadores de então — as três classes novas
estão abaixo.

| # | Item | Estado |
|:---|:---|:---:|
| M-1 | **Painel do console** mostrava 1.240 usuários, 42 salas, 8.920 eventos — cravados | ✅ mede de verdade |
| M-2 | **Moderação** afirmava "Comunidade em Plena Conformidade" sem consultar nada | ✅ diz que não existe |
| M-3 | **Notificações** inventava parecer de professor e menção no fórum | ✅ vazia e honesta |
| M-4 | **Busca global** devolvia curso, obra e sala inexistentes | ✅ usa `searchCatalog` |
| M-5 | `checkHardcodedMetric` — medida cravada no JSX | ✅ |
| M-6 | `checkDataInsideScreen` passa a ver `useState([...])` e registro com título + destino | ✅ |
| M-9 | 🔴 **O verificador de citações proibia as NOSSAS fontes de acervo.** Ele nasceu de um defeito real — lições citando "págs. 11–24" de obras de referência —, e naquele trabalho `IMSLP`, `Petrucci`, `Mutopia`, `Música Brasilis` e `MuseScore` foram varridos para a mesma lista. **Aplicação errada da regra**: não são bibliografia do que ensinamos, são de onde vem o catálogo. Proibi-las impedia dizer onde a obra está, e no caso do Mutopia **quebrava a licença**, que exige atribuição por peça. Removidas | ✅ 18 nomes, só estudo |
| M-10 | A mensagem de erro do verificador apontava para `CLAUDE_AUDIT.md §15`, **que não existe**. Referência removida | ✅ |
| M-11 | `09_SOURCE_IP_PROVENANCE.md` tratava fonte de estudo e fonte de acervo como a mesma coisa — foi daí que a confusão veio. Corrigido com a tabela das duas | ✅ |
| M-7 | **Tela de Acervo** — `/acervo`, pública. Catálogo com quatro seções (obras, compositores, movimentos, livros), filtros por era/região/movimento/busca, contagem **contada** e ficha com estado, motivo e link oficial | ✅ 13 casos |
| M-12 | **Atlas ≠ Acervo.** O Atlas é mapa jogável com métrica, voltado a praticar a obra; o Acervo é consulta — listagem, filtro, ficha. Informação em profundidade mora no Acervo. Uma tela só serviria mal às duas | ✅ |
| M-13 | **Os cinco livros do Conservatório aparecem bloqueados**, com capítulos e questões **contados do livreto** e o motivo escrito: existem e estão em curadoria editorial. Aparecer bloqueado ≠ não aparecer | ✅ |
| M-14 | 🔴 **Três defeitos que os meus próprios testes acharam na tela**: (a) o estado vazio do container escondia os FILTROS — quem apertasse um recorte sem resultado ficava preso; (b) `setCarregando(true)` a cada tecla desmontava o campo de busca e **só a primeira letra entrava**; (c) o repositório semeava só no construtor, então limpar os dados do site esvaziava o catálogo **para sempre** | ✅ |
| M-15 | `checkComingSoonPromise` lia só `uiFiles()` — promessa escrita em SERVIÇO e renderizada pela tela passava intacta. Ampliado para todo o `src`, com exceção estreita para `motivo:`, que por contrato explica um estado declarado | ✅ 5 formas |
| M-16 | Ficha de obra em tela de detalhe — `/acervo/obra/:id` abre `ObraScreen` com `fichaDaObra` (curado em 2026-09-22) | ✅ |
| M-17 | 🔴 **HAVIA DOIS MODELOS DE OBRA, E A TELA LIA O VAZIO.** O acervo canônico tinha 17 obras e `WorldsAtlasScreen` mostrava **zero**, porque lia `DEFAULT_WORKS: never[] = []`. Unificado: `DEFAULT_WORKS` passa a **derivar** do acervo canônico, e o mapa vira uma vista dele em vez de um segundo acervo | ✅ |
| M-18 | **O `atlas.repository` nunca semeou obra nenhuma** — e não por descuido: semear de `never[] = []` é o mesmo que não semear. Com a lista derivada, passou a haver o que semear. Conferido na LEITURA, para que limpar os dados do site não esvazie o mapa até recarregar | ✅ |
| M-19 | 🔴 **`HISTORICAL_MASTERS` NÃO EXISTE EM LUGAR NENHUM** do repositório, e a verificação de prontidão apontava para ela. "Constante ausente" contava como acervo vazio — o número estava certo por **acidente**, porque o acervo era vazio mesmo. Quando deixasse de ser, a medição continuaria errada e ninguém saberia. Reapontada para `seed-acervo.ts` | ✅ |
| M-20 | A prontidão perguntava "o literal tem conteúdo?", o que falha para acervo **derivado** — diria "vazio" sobre 17 obras. Agora pergunta "está DECLARADO vazio?", que é uma coisa que se vê: `= []`, `= {}` | ✅ |
| M-21 | Resultado medido: **Atlas 9/10 → 10/10**, prontidão geral **5/7 → 6/7**, `a corrigir` de 2 para 1. A tela do Atlas passa a mostrar 17 obras — Barroco 6, Classicismo 6, Romantismo 5; Europa Ocidental 14, Oriental 2, Escandinávia 1 | ✅ |

### O que falta para o acervo estar COMPLETO

| # | Item | Estado |
|:---|:---|:---:|
| AC-1 | **Ficha da obra** — `/acervo/obra/:id`, com compositor, data, era, região, gênero, instrumentação, licença do arquivo e crédito de edição. **Três ações**: tocar, abrir na partitura, levar à prática — e elas **só aparecem quando há edição renderizável** | ✅ |
| AC-1a | **Ficha do compositor** — `/acervo/compositor/:id`, com biografia autoral, datas, eras, regiões, movimentos que ajudou a definir e o **compêndio completo** de obras, sem recorte de disponibilidade | ✅ |
| AC-1b | **14 biografias escritas aqui** — texto autoral, sem citar fonte nenhuma. Cada uma responde à mesma pergunta: o que mudou na música por causa desta pessoa | ✅ 14 de 14 |
| AC-1c | **Gênero por obra, derivado do TÍTULO** — "Minueto em sol maior" é minueto. Leitura, e não atribuição. As três cujo título não nomeia forma ("Manhã", "Melodia", "Hino à alegria") ficam sem gênero, em vez de classificadas por hábito | ✅ 14 de 17 |
| AC-1d | **Nove gêneros novos** no Atlas, exigidos pelo repertório: prelúdio, minueto, cânone, coral, marcha, serenata, bagatela, gavota, valsa | ✅ |
| AC-1e | **Filtros de gênero e compositor** na listagem, e linhas que **abrem a ficha** | ✅ |
| AC-1f | **`useTocarFaixa`** — a síntese saiu de dentro do `GlobalPlayer` e virou hook. Copiá-la para a ficha daria duas implementações do mesmo som, e elas divergiriam na primeira correção | ✅ |
| AC-1g | **Retrato ausente mostra INICIAIS**, nunca foto de banco genérico — inventar a aparência de uma pessoa real é pior que não ter foto. Já houve aqui um avatar de docente tirado de banco | ✅ |
| AC-1h | **0 de 14 compositores têm imagem.** Depende de ingestão do acervo de imagens livres, que depende de rede | ⬜ |
| AC-1i | **"Levar à prática" pratica a obra.** `/practice?obra=` abre `PraticaDaObraScreen`, com a lição FEITA da peça (`pratica-da-obra.ts`): ler notas da melodia, nomear intervalos entre notas vizinhas (pela letra e pelos semitons), o compasso no primeiro compasso escrito, e de ouvido que trecho soou — distratores da própria peça. Determinística: a mesma obra dá sempre a mesma prática | ✅ 45 casos, todas as peças do repertório
| AC-2a | 🔴 **A PROJEÇÃO DESCARTAVA CAMPO QUE A FONTE DECLARAVA.** `FaixaDoPlayer` sempre trouxe `tonalidade`, `compasso` e `bpm`, e a projeção para `CanonicalWork` jogava os três fora. Tonalidade é campo padrão em todo catálogo musical. Perder informação numa projeção **não quebra nada e não aparece** — o tipo aceita o campo ausente e ninguém sente falta do que nunca viu | ✅ com teste |
| AC-2b | **Registro alinhado ao padrão dos catálogos de música** — número de catálogo, tonalidade, compasso, andamento, instrumentação, movimentos. `docs/harness/84_CATALOG_STANDARD.md` | ✅ 10 de 14 campos |
| AC-2c | **Filtro de tonalidade**, com as opções saindo do próprio acervo | ✅ |
| AC-2d | ~~Quatro campos ficam vazios~~ — **dois deixaram de estar**: número de catálogo em 393 obras e data de composição em 866, vindos da ficha por peça do Mutopia. Seguem vazios movimentos e identificadores cruzados por obra. Texto original: quatro campos ficam vazios — número de catálogo, movimentos, data de composição e identificadores cruzados. Dependem da resolução de identidade, que depende de rede. **Deduzir "BWV 846" do título seria palpite com cara de catalogação**; há teste cobrando que permaneçam vazios | ⬜ |
| AC-2e | 🔴🔴 **EU AFIRMEI QUE NÃO HAVIA REDE, E HAVIA.** O endpoint SPARQL do Wikidata recusa requisição sem User-Agent de política e devolve **403**; eu generalizei esse 403 para "o ambiente não tem rede" e repeti isso durante várias respostas. Testado host a host: Open Opus, MusicBrainz, Wikidata (API de ação), Commons e Mutopia **todos respondem 200**. O erro custou tempo da fundadora e atrasou o acervo inteiro | ✅ corrigido |
| AC-3 | **ACERVO EXTRAÍDO** — 220 compositores do Open Opus cruzados com Wikidata pela API de ação. **234 compositores · 25.212 obras** no catálogo. Biografia 234/234 · retrato 220 · Wikidata 220 · MusicBrainz 219 · VIAF 219 · IMSLP 188 | ✅ |
| AC-3e | **162 em domínio público, 61 protegidos, 11 indeterminados** — todos catalogados. O acervo registra a existência; a legislação decide só a experiência | ✅ |
| AC-3f | **As 7 eras do Atlas povoadas**: Romantismo 93 · Moderna 49 · Contemporânea 31 · Barroco 27 · Renascimento 17 · Classicismo 13 · Medieval 4 | ✅ |
| AC-3g | 🔴 **25 mil obras como módulo TS deram pacote de 7,1 MB** — todo visitante baixaria o catálogo inteiro sem abrir o Acervo. Separadas em `public/acervo/obras.json`, buscado sob demanda: pacote voltou a **2,2 MB** (612 KB comprimido). Compositores ficam no módulo (142 KB) porque alimentam contagem e filtro antes de qualquer busca | ✅ |
| AC-3h | Obras NÃO vão para `localStorage`: 5 MB estouraria a cota do navegador. Ficam em memória de processo, e o arquivo é versionado junto do código | ✅ |
| AC-3i | Falha ao buscar as obras devolve lista vazia e **não derruba o catálogo**: o acervo próprio continua servindo, e é ele que toca | ✅ |
| AC-4 | **Documentação das fontes NO CÓDIGO** — `docs/harness/85_SOURCES_AND_COVERAGE.md`: o que foi adquirido, de onde, **como a fonte classifica** (as 10 épocas e o mapa para as 7 eras) e — a seção que mais faltava — **o que a fonte NÃO cobre**. Acervo que não declara o próprio recorte deixa quem consulta supor que a ausência é do mundo | ✅ |
| AC-4a | **Os recortes editoriais da fonte NÃO entram na catalogação.** `popular` e `recommended` são juízo de terceiro; nenhum filtro os usa e nenhuma ficha os exibe. Chamá-los de "descendência" ou "os principais" afirmaria uma relação que o dado não carrega | ✅ |
| AC-4b | **Domínio de artigos** — `src/domain/article.ts`. É onde a curadoria vive, separada e assinada: auditoria, percurso, ensaio. Toda obra citada explica **por quê**; percurso nivelado não pula nível; artigo não cita fonte externa no texto | ✅ 9 casos |
| AC-4c | **Dois artigos de fábrica**: *Concerto ocidental — uma auditoria de repositório* e *Repositório nivelado para violinistas* (introdução de mini-curso + lista de partituras de domínio público por nível, com o motivo de cada escolha) | ✅ |
| AC-4d | **Engine de artigos na tela de admin** — `/founder/artigos` (EE-10 a EE-16) (curado em 2026-09-22) | ✅ |
| AC-4e | **Tela de leitura do artigo** — `/acervo/artigo/:id` (`ArtigoScreen`), com teste que abre cada artigo pela rota de verdade (curado em 2026-09-22) | ✅ |
| AC-5 | **ANTIGUIDADE COBERTA, com tipo de registro próprio.** Não é ficha de obra: `RegistroDaAntiguidade` declara **suporte** (pedra, papiro, cópia medieval, tratado), **estado** (completo, fragmentário, ilegível), extensão sobrevivente e procedência. 8 registros reais — Seikilos, Hinos délficos, Orestes, Mesomedes, Oxirrinco, tratados de harmônica, doutrina do ethos, aulos. Reconstrução é declarada **como hipótese**; demonstração aponta para faixa que existe | ✅ 11 casos |
| AC-8 | **1.349 PARTITURAS EXTRAÍDAS E CATALOGADAS** — Piano 685 · Violão 360 · Voz 245 · Violino 40 · Violoncelo 11 · Flauta 8. Licença declarada por peça: 728 domínio público, 621 Creative Commons. **638 reconciliadas** com o acervo (47%) — sobrenome ambíguo NÃO casa, porque escolher um Bach entre três seria adivinhar | ✅ |
| AC-8b | **AS 1.349 PARTITURAS VIRARAM OBRA DO CATÁLOGO.** Estavam só em `partituras.json`: não apareciam em busca de obra, não tinham ficha, não contavam nas facetas. Agora **26.288 obras** — 1.366 com partitura ligada | ✅ |
| AC-8c | **Título não deduplica, e não se adivinhou.** Das 638 com compositor reconhecido, só **18** têm título que casa: uma fonte escreve `Das wohltemperierte Klavier`, a outra `Prelude and Fugue in C major`. Aproximar por semelhança casaria préludios errados entre si. As 1.331 entram como **registro próprio**, e a repetição fica declarada em vez de resolvida por palpite | ✅ |
| AC-8d | 🔴🔴 **621 PARTITURAS ESTAVAM IMPUBLICÁVEIS E NINGUÉM VIU.** A extração trouxe licença, link e arquivo — e **não trouxe quem transcreveu**. Cláusula de atribuição é condição de uso: arquivo CC-BY exibido sem o nome de quem o produziu está sendo redistribuído **sem licença nenhuma**. Segunda passada sobre `piece-info` trouxe **1.348 de 1.349** mantenedores, de 179 pessoas distintas | ✅ corrigido |
| AC-8e | O crédito **abre** o bloco de edição na ficha, e o formato fica para depois — estava no fim de uma linha técnica. Onde a licença exige, a ficha diz que exige. `checkAtribuicaoDaPartitura` **BLOQUEIA** o build, e vigia os três elos: o dado no arquivo, o carregamento no catálogo, o desenho na tela — cada um quebra sozinho | ✅ 5 variantes |
| AC-8f | A geração do seed **falha com código 1** se alguma peça sob CC ficar sem mantenedor. Melhor a geração parar do que o acervo sair com mil peças irregulares | ✅ |
| AC-8g | A mesma passada trouxe **393 números de catálogo** (BWV 846, D. 891) e **866 datas de composição**, que a listagem não dá. O campo `Opus` da fonte guardava duas coisas — catálogo e nome de coletânea — e foram separadas: gravar as duas juntas repetiria o erro do gênero | ✅ |
| AC-8h | 🔴 **255 OBRAS SUMIAM EM SILÊNCIO NA GERAÇÃO.** `obras.json` tinha 25.195 registros e **24.940 ids distintos** — 204 ids repetidos, e o `Map.set` deixava o último vencer. Todas são a mesma obra digitada duas vezes na fonte (`O Jesulein suss` / `süss`), mesmo número de catálogo. O slug já colapsava por ignorar acento — **por acidente**, escolhendo a grafia pior com a mesma probabilidade da melhor. Agora é deliberado: vence o título com mais acento, e os ids das duas entradas ficam guardados | ✅ |
| AT-1 | 🔴🔴 **ATLAS E ACERVO LIAM ACERVOS DIFERENTES.** O mapa contava **17 obras**; a biblioteca contava **24.957**. Não era defasagem de cache — eram duas fontes: a tela do mapa lia `DEFAULT_WORKS` (projeção do repertório próprio) e a biblioteca lia o catálogo canônico. Duas verdades sobre o mesmo acervo é **pior** que uma verdade incompleta: as duas telas ficam "certas" e nenhuma denuncia a outra | ✅ corrigido |
| AT-1a | `atlas.service.ts` — o mapa passa a ser uma **vista** do catálogo canônico. Mapa e biblioteca contam as mesmas 24.957 obras e as mesmas 234 pessoas, e há teste comparando os dois números | ✅ |
| AT-1b | **A ponte por id canônico**: clicar em Carlos Gomes no mapa abre `/acervo/compositor/antonio-carlos-gomes`. Teste confere que o id do marcador **abre ficha** e que o nome bate | ✅ |
| AT-1c | A contagem do marcador **bate com o compêndio da ficha** — senão o mapa mentiria sobre o tamanho do acervo, que é o defeito original em escala menor | ✅ |
| AT-2 | 🔴 **O ATLAS NÃO ERA UM MAPA** — era uma lista de quatro grupos de fichas de filtro. `atlas-map.ts` existia, testado, com marcadores, navegação no tempo e repovoamento de região, e a tela **nunca o chamou**: zero referências | ✅ |
| AT-2a | **O mapa AGREGA e depois DETALHA.** O domínio emitia toda obra como marcador — **9.245 pontos no Romantismo**. Mapa com nove mil pontos é lista desenhada sobre uma imagem. Sem foco: movimentos e compositores, **de 4 a 95 marcadores por era**, cada um com a contagem. Escolher **o que** olhar abre as obras. Região sozinha não abre — ela ainda é *onde* | ✅ 4 casos |
| AT-2b | A tela virou mapa: **eixo do tempo** com setas (nulo nas pontas, porque seta que não anda parece tela travada), **regiões que repovoam** ao andar no tempo, **marcadores clicáveis** com selo por tipo e contagem, e **quatro indicadores** — incluindo "pontuados, sem experiência", que não é defeito a esconder | ✅ |
| AT-2c | Andar no tempo **limpa foco e região**: o compositor focado pode não existir na era nova, e o mapa pareceria quebrado | ✅ |
| AT-3 | `checkAtlasEAcervoMesmaVerdade` **BLOQUEIA** o build: o serviço lê o canônico, a tela usa o serviço e não `DEFAULT_WORKS`/`countWorks`, o marcador aponta para a ficha, e o domínio mantém a regra de foco | ✅ 5 variantes |
| AT-4 | **Toda região declarada por um compositor é alcançável no mapa** — senão a ficha apontaria para um lugar que nenhuma vista oferece, e ninguém veria | ✅ |
## ESTADO MEDIDO DO ACERVO

Aferido contra o **catálogo importado pelo empacotador** — o mesmo arquivo que
o navegador recebe e que o teste agora lê. A distinção de antes, entre o que o
teste via e o que o navegador via, deixou de existir: era ela que escondeu três
defeitos por sessões inteiras.

```
obras no catálogo        31.952
compositores              1.004   (225 + 783 do Brasil, 0 duplicados)
COM PARTITURA            16.820   52,6%  (era 180)
  IMSLP                  11.221 · Música Brasilis 6.917 · Mutopia 181
que TOCAM aqui               17   edição nossa, renderizável
sem endereço             15.132   destas, 4.274 protegidas (não estão no IMSLP por lei)
partituras a resolver     1.051

Bach 978 obras · Villa-Lobos 250 · Nazareth 229 · Chiquinha Gonzaga 156
Mignone PROTEGIDA até 2057 — com a data errada teria saído livre
```

### As três medidas não são a mesma, e confundi-las foi o defeito mais teimoso

| | quantas | o que significa |
| :--- | ---: | :--- |
| **catalogadas** | 31.952 | a ficha existe: título, autoria, era, região |
| **com partitura** | 16.626 | sabemos **onde a edição está**, e abrimos o caminho |
| **que tocam aqui** | 17 | a plataforma **reproduz**: edição nossa, nota a nota |

Das 16.626, o que temos é o **endereço** e não o arquivo: IMSLP proíbe
`/images/`, Música Brasilis proíbe `/media/`, e nada foi baixado das duas. A
exceção é o Mutopia, redistribuível, onde o link é do próprio `.ly`.

### Cobertura medida

| obras (31.952) | | compositores (1.004) | |
| :--- | ---: | :--- | ---: |
| meio | 99,8% | região | 99,6% |
| região | 98,7% | biografia | 89,6% |
| era | 96,0% | data de morte | 65,9% |
| número de catálogo | 42,8% | retrato | 21,9% |
| gênero | 36,5% | | |
| tonalidade | 19,8% | | |

Direito autoral: **24.336 em domínio público · 5.688 protegidas · 1.928
indeterminadas**. Protegida aparece no catálogo, diz de quem é e aponta para
onde está publicada — o prazo impede tocar aqui dentro, e nada além disso.

✅ 1.987 testes · 0 bloqueios · build `exit=0` · `tsc` limpo

O mapa completo — de onde veio cada coisa, onde está a partitura de cada obra,
e por que 11.046 ainda não casaram — está em
[`docs/harness/85_SOURCES_AND_COVERAGE.md`](docs/harness/85_SOURCES_AND_COVERAGE.md).

---

## O QUE FALTA, SEM RODÉIO

| | Estado |
|---|---|
| **Laboratório** | ❌ Corrigi apenas o fato de ele **abrir**. A tela documentada — banner hero, navbar fixa com as lições, práticas das Casas, mapa de expedições — **não foi construída**. Não está perto, e dizer o contrário seria mentira |
| **Simulador ponta a ponta** | ❌ Nenhuma peça foi levada até o fim. **Não há leitor de MIDI nem de LilyPond** — e é isto, e só isto, que separa as 181 obras com arquivo Mutopia das 17 que tocam. O `.ly` está catalogado; falta quem o leia |
| **Migração para a ontologia** | ❌ Os **31.952** registros ainda são `CanonicalComposer`/`CanonicalWork`. `Pessoa`/`Obra` existem como **tipo**, testados, e não é onde os dados vivem (ON-10) |
| **Tabela de equivalência entre catálogos** | ⬜ A maior causa das 11.046 sem endereço: nosso Monteverdi é `SV` e o do IMSLP é `CND`; nosso C.P.E. Bach é `Wq` e o deles é `Helm`. Nenhuma chave resolve — é trabalho de musicologia |
| **Música Brasilis** | ✅ no catálogo — 783 compositores, 6.917 obras, 679 biografias. Ver MB-1 |
| **IMSLP** | ✅ 11.027 endereços, e o índice em cache — melhorar a chave custa segundos, não 20 min da banda deles. Ver IM-1 |
| **MusicBrainz** | ⬜ nunca consultada, e **não resolve partitura**: é base de metadados. Serviria para melhorar casamento com títulos alternativos |

---

| MB-12 | ✅ **MUSICBRAINZ FECHOU: 3.849 obras com título alternativo, 29.322 títulos, 4.096 identificadores cruzados.** 5.273 consultas, 1 falha de rede, política de 1 req/s respeitada | ✅ |
| MB-13 | O casamento do IMSLP rodou **do cache**, em segundos: **11.075 → 11.269**. As chaves de título saltaram de 32.330 para **50.958** | ✅ |
| MB-14 | **Obras com partitura: 16.626 → 16.820 = 52,6%** (IMSLP 11.221 · Brasilis 6.917 · Mutopia 181). Sem endereço: 15.132, das quais **4.274 protegidas** — essas não estão no IMSLP por lei | ✅ |
| MB-15 | Números propagados para os três lugares que os afirmam: tabela do artigo de auditoria, `85_SOURCES_AND_COVERAGE.md` e este relatório. O guarda `artigos-numeros-conferem` acusou o desvio sozinho — era 607, virou 623 | ✅ |
| LB-11 | 🔴 **A VISTA LOGADA NUNCA TINHA SIDO RENDERIZADA.** A tela foi construída e auditada como visitante; ao abri-la com nome pela primeira vez, três defeitos | ✅ |
| LB-12 | 🔴 **Dois marcos `complementary` com o mesmo nome**, aninhados: o layout monta o painel e o componente montava outro dentro. Um leitor de tela anunciava dois painéis idênticos | ✅ |
| LB-13 | 🔴 **O Feed dizia "em andamento" e listava sessões CONCLUÍDAS** — vinha de `getPracticeHistory`, e resultado só existe quando a sessão acabou. Agora vem de `sessoesAbertas()`: sessão **sem `endedAt`**, que é o que define o aberto | ✅ |
| LB-14 | 🔴 **"Em movimento agora" listava três medidas paradas em zero** — a seção diz no próprio texto que não são as maiores, são as que mudaram. Agora só entra o que se moveu, e quando nada se moveu ela declara isso | ✅ |
| LB-15 | 8 casos novos em `tests/ui/laboratorio-logado.test.tsx` — 19 no total entre as duas vistas | ✅ |
| LB-1 | ✅ **O LABORATÓRIO FOI RECONSTRUÍDO.** Navbar **fixa** com três seções — Feed · Lições · Práticas —, painel lateral em todas as três, e `docs/harness/88_LABORATORIO.md` com a estrutura e a origem de cada peça na paridade | ✅ |
| LB-2 | 🔴 **A tela anterior não tinha navegação nenhuma.** Coluna única com 25 botões, sem marco de página e sem região: um leitor de tela recebia a lista inteira sem nome de seção | ✅ |
| LB-3 | 🔴🔴 **POSIÇÃO DE LIGA INVENTADA.** O código era `leaderboard.find(...)?.rankPosition \|\| 3` — quem não estava na tabela aparecia em **terceiro lugar**. É o antipadrão que a auditoria de referência nomeia, e que já tinha acontecido com Bach em primeiro | ✅ |
| LB-4 | 🔴 **Medida pessoal desenhava para visitante**: "Ofensiva 0 Dias", "Meta Diária 0%", "Liga Semanal". Medida de alguém sobre ninguém. Agora o painel diz **o que mede** e convida; o que é público — as competências — carrega para qualquer um | ✅ |
| LB-5 | O painel tem **hierarquia obrigatória**: três em destaque escolhidas por **movimento** (a que mais subiu, a que mais caiu, a que está a um passo de mudar de faixa) e o resto em dropdown por tópico — ligas, habilidades, pontuação, percursos. Lista plana de dezenas de números não informa: esconde | ✅ |
| LB-6 | Topo do painel: **calendário do mês** com os dias praticados, e as **7 defensivas em track** no rodapé — os últimos sete dias, e não a semana do calendário, porque a sequência que se sustenta não recomeça no domingo | ✅ |
| LB-7 | Tópico sem medida mostra **esqueleto** — cinza, sem nome, sem número. É a melhor solução de estado vazio das capturas, e o contrário de preencher com gente que não existe | ✅ |
| LB-8 | Lições: destaque por agremiação e casa, e o carrossel bloqueado **com o motivo escrito** — cadeado que diz o que falta, não cadeado mudo. A amostra é esqueleto, e não trilhas inventadas | ✅ |
| LB-9 | ⚠️ **Práticas declara que o mapa ainda não é mapa.** O globo com forma geográfica, régua de eras que repovoa e zoom por compositor **não existe**. A tela diz isso e leva ao Atlas, em vez de chamar lista de mapa | ℹ️ |
| LB-10 | 10 casos de auditoria em `tests/ui/laboratorio.test.tsx`, inclusive um que procura `#\d` no texto inteiro — qualquer volta do `\|\| 3` reaparece assim | ✅ |
| LB-16 | 🔴 **LIÇÕES ERAM TÓPICOS SOLTOS.** A aba listava `SkillTree[]` — teoria, percepção, ritmo — sem curso, sem módulo e sem ordem. A estrutura acadêmica já existia inteira e ordenada; o Laboratório a ignorava e inventava a própria. Agora é **Cadeira → Curso → Módulo → Lição**, com seções numeradas em sequência: 126 lições, 3 cadeiras, 5 cursos | ✅ `arvore-de-licoes.ts`, 10 casos |
| LB-17 | A ordem é **sugestão, e não cadeado**: nenhuma lição sai `disabled`, e há caso que conta os bloqueados e exige zero. Quem quiser fazer a vigésima da décima seção pode — o que o sistema faz é dizer **onde aquilo fica**, e `feitasForaDeOrdem()` informa sem impedir | ✅ |
| LB-18 | 🔴 **O VISITANTE RECEBIA VINTE PORTAS.** Disciplinas soltas para quem ainda não sabe qual é a sua — escolher pressupõe saber o que já se sabe. Agora a aba abre um **NIVELAMENTO**: perguntas na ordem real do curso (`pedagogicalOrder`), e onde a pessoa para é por onde ela entra | ✅ `nivelamento.ts`, 19 casos de domínio + 12 de tela |
| LB-19 | 🔴 **Um erro só não encerra.** A confirmação é outra pergunta da mesma dimensão, com outra semente — repetir mediria memória do clique. Encerrar no primeiro erro faria um deslize de um segundo determinar meses de estudo, e a pessoa entraria **abaixo** do que sabe | ✅ |
| LB-20 | O diagnóstico aponta **módulo que existe**: casa o capítulo com `AcademyModule.order`, e há caso que confere os dois lados contra o acervo. Montar `mod_teoria_07` na tela seria uma segunda convenção de identificador, que continuaria compilando no dia em que a primeira mudasse | ✅ |
| LB-21 | O resultado **declara o que não cobre**: só entram dimensões com gerador, e o rodapé conta quantas ficaram de fora. Teste curto apresentado como completo faria alguém concluir que domina o curso inteiro por ter passado em seis frentes | ✅ |
| DF-1 | 🔴🔴 **A DEFENSIVA NUNCA QUEBRAVA.** O serviço somava um dia sempre que a data mudasse, **sem olhar qual data era**. Quem praticasse em janeiro e voltasse em julho encontrava a defensiva intacta, com um dia a mais: a "sequência de 40 dias" podia ser 40 dias espalhados por dois anos. Contador que nunca quebra não mede constância, mede visitas | ✅ |
| DF-2 | 🔴🔴 **E o nível SUMIA quando ela quebrava.** O painel fazia `estadoDaDefensiva(currentStreakDays)` — conta de `dias / 7`. Zerar os dias zerava o nível junto: quem fechou três semanas e faltou um dia via "Sem defensiva ativa". É o oposto exato da regra — cada defensiva completa vale um nível **a mais, para sempre** | ✅ |
| DF-3 | Os dois vinham da mesma causa: **a transição não existia em lugar nenhum**. Agora é `aoPraticarHoje()`, que decide continuar, quebrar e fechar ciclo **juntos**, porque são a mesma decisão sobre as mesmas datas. `completedCyclesCount` é guardado, e não derivado — derivar de um contador que zera é garantir que o nível zere junto | ✅ 24 casos em `tests/defensiva.test.ts` |
| DF-4 | Praticar duas vezes no mesmo dia **não conta dobrado**, e a virada de mês e de ano continuam sendo dias consecutivos — aritmética de data, e não subtração de milissegundos sobre o relógio local | ✅ |
| NV-3 | 🔴 **O NIVELAMENTO ENTRAVA DIRETO EM TEORIA.** Ele foi montado sobre `exercise-generator`, que só cobre Teoria — "escolher a cadeira" seria escolha de mentira, com as três levando ao mesmo lugar. Agora é sobre os **livretos**: 378 questões escritas à mão, 126 capítulos, 5 trilhas, distratores que correspondem a enganos reais | ✅ 31 casos de domínio |
| NV-4 | A tela abre num **seletor de cadeira**. História aparece com as **três trilhas separadas** — os cursos dela não são sequência um do outro, e fundi-los colocaria quem sabe música brasileira a responder sobre a ocidental, lendo o erro como lacuna | ✅ |
| NV-5 | **Trocar de cadeira e encerrar, a qualquer momento**, com a saída no topo e não escondida no rodapé. Teste do qual só se sai respondendo até o fim é teste que se abandona fechando a aba | ✅ 18 casos de tela |
| PZ-A | 🔴🔴 **A PAUTA DESENHAVA TODA NOTA NA LINHA DO MEIO.** `Staff` tinha `noteY = 54` fixo ("aproximado pela oitava"), sem acidente, sem linha suplementar e sem duração. É o componente dos blocos de pentagrama das lições e da figura dos exercícios: "que nota está escrita na pauta?" mostrava a MESMA cabeça de nota qualquer que fosse a resposta. Os testes contavam cabeças de nota, nunca a posição — por isso nada acusou. Reescrito: altura por grau e clave (sol, fá, dó), linhas suplementares, ♯ ♭ ♮, cabeça vazada/cheia, haste pelo lado certo, colchete, barras de compasso pela duração | ✅ `pauta-na-altura.test.tsx`: posição conferida contra a resposta do gerador |
| PZ-B | **O acorde saía em fila — um arpejo.** Figura e bloco STAFF ganham `simultaneas`: empilhado, haste única, segunda para o outro lado da haste. O gerador marca os acordes; o editor de blocos tem a caixa "notas simultâneas", e o "ouvir" toca junto | ✅ |
| GR-1 | 🔴 **GUARDAS DE REGRESSÃO — cada defeito de 2026-09-22 vira regra por CLASSE, e não por caso** (`tests/ui/guardas-de-regressao.test.tsx`): (a) todo `navigate` com consulta, achado por varredura, abre no roteador de verdade sem 404; (b) só repositório que funde a camada publicada toca chave editorial; (c) a pasta de `npm run livros` é a que a Biblioteca anuncia; (d) espera do Acervo sem prazo explícito falha; (e) todo campo do pacote tem nome no recado da exportação — campo novo sem nome falha | ✅ 16 casos |
| GR-2 | **A guarda (d) achou mais 16 esperas sem prazo** nos testes do Acervo — a mesma classe da que quebrou a suíte completa hoje. Todas com prazo; a regra ficou sem lista de exceções | ✅ |
| GR-3 | 🔴 **O pente fino tinha a suposição errada.** `checkNavigationTargets` tira a consulta antes de comparar — supunha que o roteador fazia o mesmo, e por isso ficou verde com toda busca no 404. E só lia aspas simples: `${...}` escapava. Agora lê template (cada interpolação vira segmento de exemplo), com variante e caso limpo novos na tabela, e o limite declarado aponta para a guarda que confere o roteador | ✅ |
| GR-4 | **Processo: o ✅ do EE-5 era falso** — serviço ligado, tela ausente. Item de engine só fecha com o caminho da PESSOA testado (tela) e o do ALUNO (leitura) | regra |
| GR-5 | 🔴 **Eu sobrescrevi um item do TODO.** Três itens novos foram numerados NV-3/4/5 sobre o nivelamento, e o NV-5 original foi trocado. Restaurado; a série virou RT. `tests/todo-ids.test.ts` recusa ID repetido novo (os 31 repetidos antigos ficam congelados) | ✅ |
| GR-6 | **Curadoria dos ⬜ que já estavam resolvidos** — 14 itens fechados, cada um com a prova no texto (rota, tela ou item que resolveu): S-5, A-1, A-2 (parcial → L-7), A-4, M-16, AC-4d, AC-4e, BI-9, B-6i, G-1, G-2, G-3; AC-1i e LAB-3 reescritos com o que de fato falta | ✅ |
| GR-7 | 🔴 **A suíte ficava mais lenta E instável com paralelismo demais.** O limite é a MEMÓRIA, não os núcleos: cada processo, com jsdom e o catálogo, passa de 1 GB, e com 11 (ou mesmo 6) a máquina paginava — 113 a 400 s, rodadas vermelhas por tempo esgotado. `maxWorkers` sai da memória livre (~1,2 GB por processo), entre 2 e metade dos núcleos | ✅ |
| GR-8 | 🔴 **A causa da instabilidade era do PRODUTO, e não só da suíte.** Medido, e não suposto: converter o catálogo custa 0,7 s e ordenar 0,1 s — o que pesava era `comoItem` e `disponibilidadeDoCompositor` filtrarem as ~32 mil obras POR COMPOSITOR, duas vezes cada: dezenas de milhões de comparações a cada listagem, pagas também no navegador de quem abre a aba de compositores e o mapa do Atlas. Índice de obras por compositor, calculado uma vez por lista (`obrasPorCompositor`, WeakMap). `atlas-acervo` 24 s → 3 s; "os compositores" 7,8 s → <0,3 s. E `nexo-das-perguntas` regerava 25 mil exercícios em cada um dos seus 20 casos: gera uma vez (42 s → 12 s) | ✅ |
| PZ-C | **`ScoreContainer` desenhava toda nota na mesma altura.** Cada compasso agora é desenhado pela mesma regra do `Staff` (`alturaNaPauta`) — as duas pautas da plataforma não podem discordar —, com pausa, acidente, linha suplementar e duração. O repertório passou a guardar a ESCRITA (`escrita`), porque a frequência não guarda grafia: si♭ e lá♯ são o mesmo número. Limite declarado: nota que atravessa a barra fica inteira no compasso em que começa, e a tela diz quais | ✅ |
| NV-6 | 🔴 **Sair no meio NÃO é errar.** Quem parou no capítulo 12 sem errar não tem ponto de entrada medido — tem um **piso**. O diagnóstico de quem interrompeu diz isso e não aponta módulo; dizer "você entra no 12" afirmaria o que o teste não apurou | ✅ |
| NV-7 | O módulo casa por **curso e capítulo**, e não só pelo número: capítulo 3 existe em todos os cursos, e casar só pelo número entregaria o capítulo 3 de Teoria a quem nivelou Violino | ✅ |
| QG-1 | 🔴🔴 **AS PERGUNTAS GERADAS TRAZIAM A RESPOSTA NO ENUNCIADO.** Em produção, na tela do percurso: *"Que nota está uma si — qual destas é?"* → resposta **si**. Não mede música, mede leitura do enunciado. E a frase não é português | ✅ |
| QG-2 | 🔴 **E as outras ditavam a fórmula.** *"De si, subindo 8 semitons — que intervalo é?"* e *"Que escala tem os graus 0, 2, 3, 5, 7, 8, 10?"* são consulta a tabela com o gabarito ao lado. A de escala nem dizia a tônica — estava **incompleta e mesmo assim respondível**, sinal de que não era sobre música | ✅ |
| QG-3 | **Causa raiz: não havia onde desenhar.** `MusicExercise` não tinha figura, então o enunciado precisava dizer o que deveria estar escrito. Agora tem `ExerciseFigure` (pauta e teclado), e a pergunta é **sobre a figura** | ✅ `FiguraDoExercicio.tsx`, 8 casos |
| QG-4 | 🔴 **A grafia na pauta estava errada.** Lá aumentado saía **A–C#–F**: lido como está, é fá maior invertido, e não um acorde aumentado. Agora soletra **por grau** — cada grau toma a próxima letra —, e sai A–C#–**E#**, fá diminuto = F–A♭–**C♭**, si menor harmônica com **lá♯** | ✅ |
| QG-5 | Si aumentado exige **fá♯♯**, que a pauta não desenha: a raiz é sorteada **depois** da qualidade, entre as que se escrevem. Antes disso, 34 exercícios saíam **sem pauta** perguntando "que acorde está escrito na pauta?" | ✅ |
| QG-6 | 🔴 **O teste curto deu verde numa versão com o defeito.** A varredura ia a 40 sementes e "si aumentado" nunca era sorteado. Amostra pequena não é conferência: é sorteio. Agora são 400 | ✅ |
| QG-7 | **Português e explicações.** *"1 semitom formam"*, *"Que figura vale 1/2 semínimas?"*, *"A semibreve vale 1 da semibreve"* (tautologia sem unidade), *"classe de altura 11"* (jargão de quem programa afinação). E *"Que figura dura o mesmo que uma semínima?"* com resposta **semínima** — a referência nunca pode ser a própria resposta | ✅ 20 casos em `nexo-das-perguntas.test.ts` |
| QG-8 | **RECONHECER e NOMEAR eram a mesma pergunta**, mudando só de 3 para 4 distratores — o cabeçalho do próprio gerador prometia "sem apoio no enunciado" e não cumpria. Agora `NAME` alterna clave de sol e de fá, e a mesma posição passa a ser outra nota | ✅ |
| EE-1 | 🔴🔴 **NÃO HAVIA CAMINHO DE ESCRITA PARA CONTEÚDO.** `academy.repository` só salva progresso, tentativa, submissão e certificado — nunca curso, módulo, lição ou atividade. O conteúdo vive em `src/data/seed-*.ts`, compilado. A engine editorial não estava incompleta: **não existia** | ✅ |
| EE-2 | 🔴 **Só TEXTO era editável.** `isTextualBlock` deixava de fora justamente o que faz a plataforma ser de música: pentagrama, teclado, player, laboratórios e diagrama. Pauta com nota errada só se consertava mudando o código — e quem revisa conteúdo não é quem publica código | ✅ `isMusicalBlock` |
| EE-3 | **Não sabia acrescentar nem remover bloco**, só trocar o conteúdo de um existente. Novo alvo `BLOCOS_DA_SECAO` cobre acrescentar, remover e reordenar numa decisão só | ✅ |
| EE-4 | 🔴 **A estrutura entra ANTES do conteúdo.** Ao contrário, quem editasse um parágrafo e depois acrescentasse um pentagrama **perderia o parágrafo**, sem nada acusar | ✅ caso dedicado |
| EE-5 | 🔴 **`EditorialLesson` e `mergeCreatedLessons` existiam e NADA os chamava** — nem repositório, nem serviço, nem tela. Criar lição estava projetado e desligado. Capacidade desligada é pior que ausente: parece presente | ⚠️ **era falso** — ligados ao serviço e ao repositório, mas nenhuma tela criava lição e nenhum leitor as mostrava. Ver EE-22 |
| EE-6 | **Validação antes de gravar.** "dó" em vez de "C4" produz pentagrama vazio na lição, e quem gravou já saiu da tela quando o aluno encontra. `problemasDoBloco` recusa na hora, nomeando o problema, e a tela acusa **enquanto se edita** | ✅ |
| EE-7 | 🔴 **O PACOTE — como a edição sai do navegador.** Sem ele a engine era rascunho com aparência de publicação. Exporta JSON indentado (o destino é um commit), importa **fundindo** com a regra "a mais nova vence por data", e recusa versão diferente em vez de adivinhar | ✅ `pacote-editorial.ts` |
| EE-8 | A tela **diz que a edição não chegou ao aluno**, em aviso permanente enquanto houver pendência. Sem isso, quem corrige vinte lições vai embora achando que publicou | ✅ 16 casos de tela |
| EE-9 | `/founder/licoes` — editor por curso → módulo → lição → bloco, com campos próprios por tipo (clave, notas, o que o player toca e como, andamento, tipo de diagrama, alternativas). **Um editor que exigisse conhecer a forma interna do dado seria o arquivo com outra roupa** | ✅ |
| EE-10 | 🔴 **ARTIGOS: o mesmo defeito, no outro canto da casa.** Viviam em `seed-articles.ts`, compilados — corrigir uma vírgula exigia mudar o código. Agora têm camada, validação, tela e pacote | ✅ `/founder/artigos`, 33 casos de domínio + 21 de tela |
| EE-11 | A anatomia é a do artigo: **cabeçalho** (natureza, título, subtítulo, resumo, autoria, instituição, data, etiquetas), **corpo** em `.md` com seções reordenáveis, **citações** com motivo, **rodapé calculado** | ✅ |
| EE-12 | 🔴 **O RODAPÉ NÃO SE EDITA.** É derivado do artigo. Um rodapé digitado diverge do corpo no dia em que uma citação entra e ninguém lembra de atualizá-lo — e aí a peça diz "12 obras" e percorre 14. A tela mostra como vai sair, e explica por que não tem campos | ✅ |
| EE-13 | A validação é **mais dura** que a das lições, porque o artigo sai assinado e datado: resumo curto é recusado (ele é o que decide se alguém abre), citação sem motivo é recusada nos três tipos, obra inexistente no acervo é recusada — percurso que não se pode percorrer | ✅ |
| EE-14 | 🔴 **`atualizadoEm` é gravado pelo SERVIÇO**, e não aceito da tela. É registro, não campo: deixar a tela mandar permitiria gravar uma revisão datada de ontem, e o rodapé mentiria sobre quando foi revista | ✅ |
| EE-15 | A camada entra na **leitura**: `AcervoScreen` e `ArtigoScreen` passaram a ler com as edições aplicadas. Sem isso a correção ficaria gravada e invisível — e o artigo escrito pela curadoria daria "não encontrado", porque não está no seed | ✅ |
| EE-16 | O pacote subiu para a **versão 2** e leva os artigos. Um pacote v1 não traz a lista, e importá-lo gravaria "nenhum artigo editado" — indistinguível de ausência. A recusa é o comportamento certo, nos dois sentidos | ✅ |
| EE-17 | **O editor de livretos EDITA de verdade** — salva, cria capítulo e questão, altera enunciado e alternativas. Estava só inalcançável. Conferido, e agora ligado ao console | ✅ |
| EE-18 | 🔴 **E as 378 questões não tinham como sair do navegador.** O editor gravava em `localStorage` e o pacote não as levava: corrigir uma alternativa errada de prova era conserto que nunca chegava a aluno nenhum. Pacote subiu para **versão 3** e leva os livretos inteiros | ✅ |
| EE-19 | **As seções editoriais do livro** — capa, folha de rosto, ficha, prefácio, colofão — tinham `OrigemDaSecao = 'EDITAVEL'` no modelo e **nenhum editor nem persistência**: o livro é gerado a cada leitura, e a tela dizia "editável" sobre seção que esquecia o que fosse escrito. Agora: `SecaoEditadaDoLivro` em chave própria, aplicada por cima do gerado na leitura, editor na Biblioteca, reverter ao texto de partida, e **pacote v4** que as leva. Edição que aponte para seção GERADA é **ignorada** — o livro não pode divergir do curso | ✅ 18 casos de domínio + 5 de tela |
| EE-20 | **O recado da exportação contava só lições.** Artigos, livretos (com as questões) e seções viajavam no pacote sem aparecer no recado — e o da importação omitia os mesmos três, contrariando a regra escrita no próprio código: "contar o que aconteceu, item a item" | ✅ |
| EE-21 | 🔴🔴 **NADA LIA O PACOTE DEPOIS DO COMMIT.** O desenho dizia "exportar → commit → aluno", e nenhum código carregava o `.json` commitado: a correção saía do navegador e não entrava em lugar nenhum. Agora mora em **`public/editorial/pacote.json`**, é buscado antes da primeira tela (`camada-publicada.ts`, com prazo de 5 s), e toda leitura — lições, lições criadas, artigos, livretos, seções de livro, `npm run livros` — funde publicado + local, a mais nova vence. Gravar continua só local | ✅ 11 casos, incluindo a seta inteira noutro navegador |
| EE-21b | **O pacote exportado é CUMULATIVO**: leva o publicado junto com o novo. Um pacote só com as novidades, commitado por cima do anterior, apagaria as correções que já tinham chegado ao aluno | ✅ |
| EE-21c | **O aviso de pendência apaga depois do commit.** Conta só o que difere do publicado (mesmo id e mesmo carimbo = igual). Aviso que nunca apaga é aviso que se aprende a ignorar | ✅ |
| EE-21d | **Pacote commitado e recusado aparece em VERMELHO** no console de lições — significa que nenhuma correção publicada está valendo. Arquivo ausente (ou o `index.html` que o SPA devolve no lugar) não é erro: é instalação nova | ✅ |
| EE-21e | **`npm run livros` gravava em `livros/`**, e a tela e os livros existentes usavam `books/` — por isso nunca achava a edição anterior para preservar. Alinhado; os quatro arquivos `music-theory-foundations*` (slug antigo do curso, sem texto escrito à mão — conferido seção a seção) saíram | ✅ |
| EE-21f | 🔴 **DESPUBLICAR, pelo pacote.** O pacote só sabia acrescentar: reverter uma correção publicada, apagar lição criada ou artigo, excluir livreto — o item voltava na leitura seguinte. Pacote **v5** leva `removidos` (tipo, id, data, autor): a remoção esconde o item publicado mais antigo que ela, e editar de novo depois o traz de volta (a mais nova vence, sem caso especial). Uma leitura só das remoções (`remocoesVigentes`) serve aos três repositórios que leem a camada — editorial, Academia e livretos. A remoção conta como pendência, e o recado da exportação a nomeia | ✅ `despublicar.test.ts`, com o ciclo em dois navegadores
| EE-22 | 🔴 **As lições criadas nunca apareciam.** `mergeCreatedLessons` não era chamado por leitor nenhum — agora o repositório da Academia as funde na leitura do aluno, antes das edições | ✅ |
| EE-22b | 🔴 **E nenhuma tela criava lição.** Agora cada módulo em `/founder/licoes` tem **"Nova lição"**: pede título, duração e texto de abertura (o mínimo que a validação exige) e abre a lição no editor de blocos, com os 19 tipos. Lição criada aparece marcada e pode ser **excluída**; publicada, não (ver EE-21f) | ✅ 5 casos de tela, incluindo o aluno achando a lição no módulo |
| BL-1 | 🔴 **A BIBLIOTECA DE BLOCOS FUNCIONAIS.** A auditoria de paridade mediu **24 componentes construídos e nunca usados**, em 57 pontos de aplicação — `Player`, `PianoRoll`, `Tuner`, `Waveform` entre eles. Peças prontas esperando quem as chamasse. O que faltava não era componente: era **poder usá-los sem escrever código** | ✅ 7 blocos novos, 28 casos |
| BL-2 | **Player com onda** — transporte, repetição, meia velocidade. A forma de onda é **derivada das notas**, e não desenhada: picos que não correspondem ao som seriam enfeite com aparência de medição | ✅ |
| BL-3 | **Rolo de piano** — duração vira comprimento e simultaneidade vira empilhamento. É o que torna visível o que a pauta esconde de quem ainda não lê | ✅ |
| BL-4 | 🔴 **Afinador** — o bloco que OUVE, pelo microfone, em cents reais. Sem permissão ele **declara** que não está medindo: um ponteiro parado no zero é lido como "afinado" por qualquer pessoa | ✅ |
| BL-5 | **Tabela** com `scope` nos cabeçalhos (sem ele, leitor de tela recebe sopa de células), **citação** com fonte obrigatória, e **linha do tempo** em que a distância no desenho é a distância no tempo — espaçar por igual a transformaria numa lista com datas | ✅ |
| BL-6 | 🔴 **Sessão de exercícios — o loop do Duolingo dentro da lição.** Progresso, vidas, e a **faixa de veredito que sobe de baixo** com a explicação, sem sair da pergunta. A auditoria mediu `ExerciseSessionScreen` em 21/100, com 1.255 linhas e seis vetores fixos; o que faltava era o exercício poder ser **escrito por quem edita** | ✅ |
| BL-7 | 🔴 **GUARDA DE EXAUSTIVIDADE no renderizador.** O `switch` compilava com retorno `JSX.Element \| undefined`, e um tipo novo saía **em silêncio** — a lição ficava com um buraco que só o aluno via. Agora `never` recusa em tempo de compilação, e um caso percorre todos os tipos conferindo que desenham | ✅ |
| BL-8 | Cada bloco novo tem **custo em minutos declarado** em `workload.ts` — o compilador exigiu, porque a tabela é `Record` total. Sessão de exercícios custa zero de propósito: o custo é o das questões, e um número ali somaria duas vezes | ✅ |
| QA-1 | 🔴 **FURO NO PENTE FINO: rota que existe e nada aponta para ela.** O verificador de tela órfã pergunta "existe rota que monta esta tela?" — e `/founder/licoes` tinha rota, então passou, mesmo sem link nenhum. É o espelho dos três links mortos da barra: lá o link apontava para rota inexistente, aqui a rota existe e ninguém aponta | ✅ `nenhuma tela inalcançável` |
| QA-2 | 🔴🔴 **E ELE ACHOU NOVE TELAS CONSTRUÍDAS E INVISÍVEIS.** Não davam erro, não quebravam nada: ninguém chegava nelas. Entre elas **o editor de livretos** (610 linhas, de onde saem as 378 questões do nivelamento), **a Biblioteca do Conservatório** (254 linhas) e **o simulador de violino** | ✅ 8 ligadas |
| QA-3 | Ligadas: livretos e Biblioteca no console; classificação, defensiva, perfil de prática e matrícula nas sub-rotas do Laboratório; simulador de violino idem; recuperação de conta no rodapé do login — quem não consegue entrar não tinha como chegar à única tela que explica por quê | ✅ `pilares-sub-rotas` foi de 14 para 19 casos |
| QA-4 | **`AcademySearchResultsScreen` era duplicata.** Conferido campo a campo: nenhum dos onze campos de busca levava a ela — cada um filtra na própria tela ou manda para a busca global. Era versão anterior da busca da Academia, só de cursos. **Fundidas**: a busca da Academia ganhou o que só a outra tinha (termo por `?q=`, filtro por cátedra, ordenação), e `/academia/search/results` continua abrindo, agora nela | ✅ |
| RT-0 | **Série RT = roteador.** Estes três itens foram registrados como NV-3, NV-4 e NV-5 por engano — o prefixo NV já era do nivelamento, e o NV-5 original chegou a ser sobrescrito. Restaurado; os commits `3444437` e `6931cc6` citam os números antigos | nota |
| RT-1 | 🔴🔴 **TODA BUSCA PELO CABEÇALHO CAÍA NO 404.** O campo navega para `/search?q=termo`, e o roteador comparava o endereço INTEIRO com as rotas: `/search?q=bach` ≠ `/search`. O teste do cabeçalho conferia só a navegação; ninguém conferia se a tela abria. O mesmo derrubava o **"Entrar" da guarda** (`/auth/login?voltar=…`), os dois botões da ficha da obra (`/score?obra=…`, `/practice?obra=…`) e contaminava o id do curso vindo da busca (`/academia/course/X?modulo=Y`). **Corrigido no roteador**: `currentPath` é só o caminho, e a consulta vem em `query` | ✅ `busca-com-termo.test.tsx`, roteador de verdade |
| RT-2 | **Nenhum código lia consulta nenhuma.** Agora: a busca global e a da Academia abrem com o termo; entrar e criar conta **voltam para a tela que pediu a entrada** (só caminho interno — `//outro-site` e `https://…` são recusados); o curso aberto pela busca abre nas disciplinas, com a procurada expandida | ✅ |
| RT-3 | **`/score?obra=` abria um exemplo fixo.** A tela de partitura lia três "obras Urtext" escritas nela mesma, que só trocavam o título; "Auditar" tocava um motivo fixo; armadura e fórmula trocavam um rótulo. Agora a obra vem pelo endereço via `acervoService` (`fichaDaObra` + `faixaDaObra`), o repertório é o real (as transcrições próprias), o player toca as notas da peça e o andamento muda o som. Os controles que não mudavam nada saíram. **Estúdio 10/10 — prontidão 7/7** | ✅ `partitura-do-estudio.test.tsx` |
| QA-5 | O verificador mede a **TELA**, e não a grafia da rota. A primeira versão acusava `/kids`, que divide o mesmo `if` com `/kids/manage` — a tela abre, só aquele apelido não é usado. Acusar ali seria pedir um link inútil, e é assim que um verificador perde a confiança de quem o lê | ✅ |
| QA-6 | Limites declarados: fragmentos (`.includes`), prefixos dinâmicos (`/practice/attempt/`) e pontos de entrada externos ficam de fora — o caminho deles é montado em tempo de execução, e medir por literal acusaria todos | ✅ |
| FL-1 | 🔴 **SEIS CASOS VERDES ISOLADOS E VERMELHOS NA SUÍTE COMPLETA.** `acervo-fichas` usava `waitFor` com o prazo padrão de um segundo para carregar 5 MB de catálogo. Numa máquina ociosa cabia; com a suíte em paralelo, não. Teste que depende de a máquina estar livre não mede o código — mede a máquina, e ensina a ignorar vermelho | ✅ 9 esperas com prazo explícito |
| LX-1 | 🔴 **A SEGUNDA ÁRVORE SAIU.** `SEED_SKILL_TREES` — 5 árvores, 32 nós escritos à mão, com pré-requisitos que não casavam com capítulo nenhum — foi removida com tipos, serviço, repositório e tela. Os 8 botões "ver árvore" levam à árvore acadêmica (`/practice?aba=licoes`); o endereço antigo abre o Laboratório na aba Lições; o resíduo gravado nos navegadores é apagado. Ver `88_LABORATORIO.md` §7.3 | ✅ `arvore-unica.test.tsx`, incluindo a trava contra a volta |
| NV-1 | 🔴 **TRÊS LINKS MORTOS NA BARRA PRINCIPAL.** `Meta do dia` → `/practice/daily` (o outlet serve `/practice/daily-goal`), `Catálogo de cursos` → `/academia/catalogo` (é `/academia/catalog`), `Minha grade` → `/academia/grade` (é `/academia/meu-aprendizado`) | ✅ |
| NV-2 | O verificador de destino não pegava, e **não é defeito dele**: ele lê `navigate('...')` no **código**, e sub-rota de pilar é **dado**. Novo caso abre as **14 entradas** da barra com o roteador de verdade — foi ele que achou os dois da Academia | ✅ |
| PZ-1 | ✅ **O PRAZO PASSOU A DECLARAR O REGIME.** `src/domain/copyright-term.ts`: seis regimes, cada um com o marco e o artigo que o sustenta. A pergunta "morte ou publicação?" tem resposta — **as duas**, conforme a natureza da obra | ✅ |
| PZ-2 | **autor conhecido → morte + 70** (art. 41) · **coautoria → morte do último** (art. 42) · **anônima/pseudônima → publicação + 70** (art. 43) · **audiovisual/fotográfica → divulgação + 70** (art. 44) · **autor desconhecido → domínio público** (art. 45, II) · **anterior a qualquer prazo** → constatação, sem conta | ✅ |
| PZ-3 | 🔴 Contar **sempre da morte** deixa obra anônima do séc. XVIII indeterminada para sempre — o acervo esconde o que é livre. Contar **sempre da publicação** libera obra de autor morto há pouco — o acervo **declara livre o que está protegido**. Só o segundo tem consequência jurídica, e é por isso que a escolha de regime erra para o lado que protege | ✅ |
| PZ-4 | O `+ 1` do **1º de janeiro seguinte** está testado: morte em 1955 → livre em 1º/1/2026, e não em 2025. Um ano é tempo de alguém publicar o que não podia | ✅ |
| PZ-5 | 🔴 **A Antiguidade passava `anoDeMorte: 500`** — data inventada para a conta fechar, sobre um epitáfio anônimo do séc. II. Resultado certo, método errado: a ficha declarava morte de quem ninguém sabe quem foi. Agora usa `ANTERIOR_A_QUALQUER_PRAZO`, que é constatação | ✅ |
| PZ-6 | Dois verificadores novos, **bloqueantes**: `checkPrazoDeProtecao` (o regime e o artigo existem, e o `+1` não sumiu) e `checkDataDeMorteCravada` (nenhuma data escrita à mão no domínio). Com tabela de provas: 5 e 3 variantes, 3 limpos cada, limites declarados | ✅ |
| MB-7 | ✅ **MusicBrainz ligado** — `scripts/enriquecer-musicbrainz.ts`. Entra **pela obra** e não pelo compositor: uma consulta por número de catálogo, que é prova de identidade, com o identificador do compositor na mesma consulta. 1 req/s respeitado (pausa de 1.100 ms), UA identificado, cache gravado a cada 50 | ✅ |
| MB-8 | **Ensaio com 200 obras**: 161 ganharam título alternativo (80%), 180 ganharam identificador cruzado, 0 falhas de rede | ✅ |
| MB-9 | ⚠️ **Medição honesta do rendimento.** A fonte **não expõe** os atributos de catálogo (vêm vazios) nem os aliases traduzidos — o crosswalk `SV`↔`CND` e `Wq`↔`Helm` **não está lá**. O que ela dá é a grafia do título dela, que difere da nossa | ℹ️ |
| MB-10 | Rendimento medido no casamento com o IMSLP: **+7 obras sobre 161 enriquecidas (4,3%)**. Extrapolado para as 5.273, algo como **+200 obras com endereço**. O ganho maior é outro: **~4.700 obras ganham identificador cruzado**, que é completude de catálogo | ℹ️ |
| MB-11 | 🔴 **O alias estava ANULANDO casamentos que funcionavam.** A guarda de ambiguidade tratava alias como título: chave repetida virava `null` e derrubava os dois. Com 161 obras o ganho foi **+1**. Agora o alias **preenche vaga vazia e nunca anula** — indício não desfaz afirmação — e o mesmo dado rendeu **+7** | ✅ |
| PF-1 | 🔴 **A tela do artigo fazia 22 buscas no catálogo inteiro**, uma por obra citada — 700 mil comparações para montar 22 linhas. Uma passada e um índice: o teste caiu de **62 s para 13 s** | ✅ |
| BUG-1 | 🔴🔴 **O ARTIGO NÃO ABRIA, e o meu teste passava.** A tabela de rotas tinha `/acervo/obra/:id` e `/acervo/compositor/:id` e **não tinha** `/acervo/artigo/:id`. Sem padrão, `parseParams` não tem contra o que casar: `params.id` vinha **vazio**, a tela montava e dizia "artigo não encontrado" sobre artigo que estava ali | ✅ |
| BUG-1a | O teste que eu escrevi **substituía o roteador** e entregava o `id` na mão — substituir a peça quebrada é a forma mais eficiente de não encontrar o defeito dela. Novo caso monta `RouterProvider` + `AppRouterOutlet` de verdade, navega pela URL, e clica no card da vitrine | ✅ |
| BUG-2 | 🔴 **A MÉTRICA CONTAVA UM TERÇO E CHAMAVA DE TOTAL.** O card dizia "22 obras citadas" sobre artigo que percorre 22 obras, 20 pessoas e 20 coletâneas. Não estava inflada — estava **cega** | ✅ |
| BUG-2a | Agora conta por tipo, e separado: `10 obras · 8 pessoas` / `11 obras · 12 pessoas` / `22 obras · 20 pessoas · 20 coletâneas`. Um número só esconderia se são sessenta e duas obras ou sessenta e dois nomes | ✅ |
| IX-1 | ✅ **PESSOAS E COLETÂNEAS VIRARAM REFERÊNCIA INDEXADA.** `PessoaCitada` e `ColetaneaCitada` no domínio, com motivo obrigatório como as obras. **40 pessoas e 20 coletâneas** indexadas nos três artigos, todos os identificadores conferidos contra o catálogo | ✅ |
| IX-2 | `papel` distingue quem **compôs** de quem **editou, compilou ou coletou** — Laforge, Mário de Andrade, Spix e von Martius não escreveram uma nota | ✅ |
| IX-3 | A tela do artigo ganhou as duas seções, navegáveis: pessoa abre a ficha, coletânea mostra **o índice na ordem do volume** com cada peça ligada à obra. Coletânea por abrir diz "índice ainda não aberto" — não é coletânea vazia | ✅ |
| IX-4 | **Referências por artigo: 18 · 23 · 62 — total 103**, contra 43 antes. E cada uma é caminho, não texto | ✅ |
| CO-1 | ✅ **COLETÂNEA VIROU ENTIDADE**, na cadeia que você especificou: `Compositor → Coletânea → Obra → Edição → Partitura`. `src/domain/collection.ts` + `src/data/seed-collections.ts`, com as 20 do corpus brasileiro | ✅ |
| CO-2 | **41 peças casadas, 41 de 41** — Gallet (12), Álvares Pinto (7), Barrozo Netto (7), Oswald/Machiette (12), Nepomuceno/Quartetos (3). Todas com obra e partitura localizada | ✅ |
| CO-3 | 🔴 A coletânea guarda a **ordem**, e a ordem é conteúdo: `Valsa op. 2 nº 3` é a terceira peça de um livro, não uma valsa solta. Guardar como etiqueta perderia isso, e `numeracaoQuebrada()` impede índice com buraco | ✅ |
| CO-4 | 🔴 **Peça não cria obra.** Índice de livro com títulos é exatamente como as 1.331 obras falsas entraram. Peça que não casa fica sem `obraId` e continua listada com o título do volume | ✅ |
| CO-5 | **Três estados declarados**: INTEIRA (5), PARCIAL (0), SÓ FICHA (15). Coletânea sem peças listadas **não é** coletânea vazia — as duas desenham igual, e confundi-las declararia ausência onde há trabalho por fazer | ✅ |
| CO-6 | Quem **editou** é campo separado de quem **compôs**: Pierre Laforge editou (1842), Mário de Andrade compilou, Spix e von Martius coletaram — nenhum compôs uma nota. E a *Coleção de modinhas* tem 17 assinaturas num volume: catalogá-la sob um autor apagaria 16 | ✅ |
| OO-1 | ✅ **A curadoria do Open Opus entrou na auditoria**, medida no nosso dado: **1.245 recomendadas · 401 populares · 363 nas duas** (606 e 214 com partitura). 204 compositores com obra recomendada, 148 com popular. As listas de compositores da fonte — 23 populares, 77 recomendados — são outra coisa, e o texto diz isso | ✅ |
| OO-2 | O artigo diz o que os números **não são**: não mediram execução, não são linhagem, e não são juízo do Conservatório. A própria fonte conta que as listas nasceram de enciclopédia e catálogo de biblioteca e foram padronizadas depois | ✅ |
| SZ-1 | ⚠️ **'Suzuki' saiu da lista de fontes proibidas — decisão da Aline, registrada.** A regra existe para manter fora a **bibliografia de estudo**; o índice de um volume pedagógico é fato, e fato não se protege | ✅ |
| SZ-2 | 🔴 **O que continua proibido é reproduzir as peças do próprio Shinichi Suzuki.** Ele morreu em 1998 — protegidas até **2069** pela Lei 9.610/98. As 6 do Volume 1 (Variações sobre *Twinkle*, Allegro, Perpetual Motion, Allegretto, Andantino, Etude) entram como registro: existem, são dele, não tocam aqui | ✅ |
| SZ-3 | Modelado como você pediu: **método → volume → item → Obra → Compositor**, e não Suzuki como autor de tudo. 36 peças, **15 autores** — Bach (8 no total), Händel, Purcell, Schumann, Weber, Brahms, Paganini, Thomas, Lully, Beethoven, Boccherini, Martini, Dvořák, Becker, Bayly | ✅ |
| AR-9 | ✅ O artigo brasileiro virou **"Seleção de Coletâneas Brasileiras"**, refeito em 5 seções em torno dos volumes. **22 obras citadas** | ✅ |
| AR-10 | 🔴 O teste dos artigos mantinha uma **segunda lista de proibidos**, escrita à mão, que vedava nomear **qualquer** fonte — inclusive a de catálogo cuja curadoria o artigo precisa atribuir. Atribuir é o conserto do erro de "os mais tocados"; proibir o nome tornava o conserto impossível. Agora há **uma lista só**, a do verificador | ✅ |
| ER-1 | ✅ A era voltou a trazer **a datação no rótulo** — "Barroco · c. 1600 – 1750". Vem de `periodYears`, o mesmo campo que o Atlas usa: as duas telas dizem a mesma coisa sem ninguém escrever o intervalo duas vezes | ✅ |
| AR-1 | ✅ **Artigo novo: "O Brasil tinha quatro nomes neste acervo"** — 16 obras citadas, 5 seções. Cobre **as 8 partituras mais buscadas** da fonte e **obra de cada um dos 8 compositores em destaque**, mais três representantes de coletânea (Luís Álvares Pinto, Luciano Gallet, Henrique Oswald) | ✅ |
| AR-1a | 🔴 **Primeira versão citava 7, e deixava 6 dos 8 em destaque sem obra nenhuma.** Eles apareciam numa tabela e não viravam caminho — artigo que nomeia e não liga é lista, não percurso. Corrigido antes de fechar | ✅ |
| AR-1b | **Referências por artigo: 10 · 11 · 16 — total 37**, contra 8 antes desta rodada | ✅ |
| AR-7 | ✅ **O percurso de violino foi de 3 para 5 níveis.** Os três primeiros tocam aqui; **4 e 5 têm só o endereço da partitura**, e a seção nova diz por que isso é o degrau e não uma limitação: até o nível 3 imitar o som é atalho legítimo, e a partir dali o que separa quem avança é **ler** | ✅ |
| AR-8 | O caso dos níveis cobrava exatamente `[1,2,3]`. Passou a cobrar **sequência sem buraco** e **pelo menos duas peças por nível** — nível de peça única é exemplo, não degrau | ✅ |
| AR-2 | 🔴 **O rótulo do recorte é a parte que importa.** A fonte publica "principais compositores" e "top 8 mais buscadas"; o artigo diz **de quem é a medida** e **o que ela mede** — "em destaque no catálogo de origem", "mais procuradas lá". "Os mais importantes" seria juízo nosso sem apuração; "os mais tocados" seria pior, porque mediram **busca no site**, não execução | ✅ |
| AR-3 | As 20 coletâneas entraram como o que são: **objetos editoriais**, não listas de recomendação. A *Coleção de modinhas* de Pierre Laforge (1842), as *Modinhas coletadas por Spix e von Martius*, as *Modinhas Imperiais* de Mário de Andrade. Coletânea foi publicada assim, por alguém, num ano — é fonte primária de como o repertório circulava | ✅ |
| AR-4 | ✅ A **auditoria** foi corrigida: afirmava que o repertório brasileiro "existe e aguarda edição" e que a Antiguidade não tinha obra. As duas deixaram de ser verdade. E a seção do Brasil passou a dizer onde estava a leitura errada — faltava **quem catalogasse**, e não edição | ✅ |
| AR-5 | 🔴 **O teste de citação media um universo menor que o acervo.** Conferia contra `obrasDoRepertorio` — as 17 obras próprias — e passava porque os artigos só citavam essas. Agora confere contra as 31.952, com piso de não-vacuidade | ✅ |
| AR-6 | ⚠️ **O repertório graduado de violino já existe, e não pode nomear o método.** O artigo `art_percurso_violino_nivelado` é exatamente esse percurso — Gossec, minueto em Sol, Brahms, *Jesu*, Händel, Vivaldi —, com as peças em domínio público e a ordem autoral. O nome do método está entre as **18 fontes proibidas** de `verify-no-citations.mjs`, que roda no build | ℹ️ |
| CT-1 | ⬜ **Carlos Gomes tem quatro registros de "Fosca"**: um do Open Opus (sem partitura) e três da Música Brasilis (com). 174 compositores têm título repetido. Parte é legítima — a fonte cataloga cada arranjo como partitura própria —, parte é a mesma obra por duas fontes. Precisa de deduplicação por obra, e não por ficha | ⬜ |
| DI-1 | ✅ **OBRAS COM PARTITURA: 180 → 16.626 = 52,0% do acervo.** IMSLP 11.027 · Música Brasilis 6.917 · Mutopia 181 (com arquivo). O card "Antiguidade" deu lugar a **"Obras disponíveis"**, que conta e filtra esse número | ✅ |
| DI-2 | ⚠️ **Ressalva feita uma vez e registrada:** o que temos é o **endereço** da partitura, não o arquivo — IMSLP e Música Brasilis proíbem `/images/` e `/media/` no `robots.txt`, e nada foi baixado. As que a plataforma **reproduz** continuam sendo 17, montadas nota a nota aqui. Rótulo decidido pela Aline | ℹ️ |
| IM-1 | 🔴 **`` VIROU BACKSPACE na expressão de número de catálogo.** Escrita como cadeia comum, `''` é o caractere de retrocesso, não a fronteira de palavra: a expressão **compilava, rodava e nunca casava**. Corrigida com `String.raw`, que é a única forma segura | ✅ |
| IM-2 | A lista de siglas foi de 9 para 36 do lado do IMSLP e de 16 para 40 do nosso — Sz, BB, L., FP, TrV, JW, Kk, MWV, SV, WAB, Z, W. Chaves de número: 10.089 → **11.696** | ✅ |
| IM-3 | 🔴 **O número não era só um número.** `TWV 43:h3` saía como `TWV 43`, comum a dezenas de quartetos de Telemann, e `Hob.XVI:52` não casava nada — começa com romano. Chave ambígua não casa, por regra, e **501 obras de Telemann** sobravam por isso. O leitor entende romano, número e continuação por dois-pontos | ✅ |
| IM-4 | O caso que declarava "LIMITE: Hoboken com romano não é lido" foi **invertido**: o limite caiu, e o teste agora cobra que seja lido | ✅ |
| IM-5 | Casamento por **prefixo de título** (20 caracteres, com guarda de ambiguidade): o IMSLP escreve "Symphony No.5, Op.67" e nós "Symphony No. 5 in C minor, Op. 67" | ✅ |
| IM-6 | ✅ **O ÍNDICE FICOU EM CACHE** — 259 mil entradas, 33 MB, não versionado. A primeira passada descartava tudo depois de casar, e cada ideia nova custava 20 min de banda da fonte. Agora custa **segundos e zero requisições**; `--rastejar` força releitura. Foi o que permitiu ir de 9.625 → 10.560 → 10.808 → **11.075** sem tocar no IMSLP de novo | ✅ |
| MU-1 | ✅ **Mutopia: 106 → 181 obras com ARQUIVO** (`.ly`, e MIDI em 37). É a única fonte cujo arquivo pode ficar aqui: Mutopia é redistribuível, IMSLP e Brasilis não | ✅ |
| MU-2 | Nome abreviado deixou de derrubar a resolução: `M. Giuliani` não casava com `Mauro Giuliani` pela chave de palavras ordenadas. Sobrenome + inicial resolve, e **só quando é inequívoco** — dois com o mesmo sobrenome e inicial somem da tabela | ✅ |
| MU-3 | 🔴 **75 obras criadas com PROVA.** A regra "fonte de recurso não cria entidade" ganhou uma exceção estreita e cumulativa: autoria resolvida + número de catálogo + número **inédito naquele compositor**. `BWV 1087` não está em obra nenhuma de Bach — não é duplicata, é obra que falta | ✅ |
| MU-4 | ⬜ **Faltam 1.051 pendentes**, e 700 são por compositor ausente do catálogo: Giuliani (88), Horetzky (60), Carcassi (36), Aguado (26) — repertório de violão que a catalogação de origem não cobre. 106 são `Traditional`/`Anonymous` e não têm autoria a resolver | ⬜ |
| AN-1 | ✅ **ANTIGUIDADE É ERA, E NÃO TIPO DE ENTIDADE.** Os 8 registros entraram como obras de `era_antiguidade` — com suporte e datação no lugar de tonalidade e número de catálogo, que `CanonicalWork` já previa. O filtro de era os alcança sozinho, e o card pôde sair sem nada ficar inalcançável | ✅ |
| AN-2 | Obra **sem autoria** passou a ser permitida ali, e só ali: a música antiga que sobreviveu é quase toda anônima, e inventar autor para preencher campo seria o pior tipo de dado fabricado. O teste distingue **anônimo de fato** de **autoria não resolvida** | ✅ |
| LK-1 | ✅ "Consultar em…" sai quando a ficha já tem bloco de Edição — eram dois links para o mesmo destino, e o de cima sem fonte, formato, licença nem transcritor. Fica só quando é o **único** caminho | ✅ |
| MB-6 | ℹ️ **MusicBrainz nunca foi consultada, e não resolve partitura.** É base de metadados — obra, gravação, relações —, não biblioteca de partitura. Temos 220 identificadores vindos do Wikidata. Serve para **melhorar casamento** (títulos alternativos das obras), e é assim que ela entra, se entrar | ⬜ |
| LA-1 | ✅ **AS DUAS FILEIRAS DE CÁPSULAS SAÍRAM.** Havia uma de recortes e uma de eras, logo abaixo dos cards que contavam as mesmas coisas — três linhas de controle antes da primeira obra. Os cards do banner absorveram as duas: **contam e recortam**. "31.874 obras" é o que a pessoa quer ver, e clicar nele é o gesto óbvio | ✅ |
| LA-2 | O card de Movimentos virou **card de Era, com dois chevrons**. Eras têm ordem — medieval antes de barroco —, e cápsulas soltas descartavam essa ordem tratando-as como sete rótulos. A sequência começa em "todas as eras", e voltar da primeira **devolve ao acervo inteiro**: sem esse degrau, quem entra numa era não sai pelo card | ✅ |
| LA-3 | 🔴 A tela montava a lista de eras de `DEFAULT_ERAS` e o pente fino acusou, com razão: lista fixa na tela não sabe quantos itens cada opção devolve, e oferece as que devolvem zero. A ordem cronológica vive no **serviço**, que já a passava para a faceta; a tela só lê `faceta.opcoes` | ✅ |
| PT-8 | ✅ **IMSLP FECHOU: 9.625 obras casadas** — 6.638 por número de catálogo, 2.987 por título, sobre 256 mil entradas lidas do índice deles. `Crawl-delay: 2` respeitado; `/images/` e `/imglnks/` nunca tocados | ✅ |
| PT-9 | **Obras com endereço de partitura: 180 → 15.138 = 47,5%** (IMSLP 9.625 · Música Brasilis 6.917 · Mutopia 106) | ✅ |
| PT-10 | ⬜ **Faltam 16.736 sem endereço, e elas se dividem em três** — a distinção importa porque só uma é trabalho de casamento: **4.436 protegidas** (não estão no IMSLP por lei — é biblioteca de domínio público; só chegam por catálogo de editora) · **11.659 em domínio público** (o IMSLP provavelmente tem, e o casamento não achou) · **641 indeterminadas** | ⬜ |
| PT-11 | ⬜ **Por que o casamento não achou as 11.659**, medido e não suposto: (a) o título do IMSLP é mais curto — "Symphony No.5, Op.67" contra "Symphony No. 5 in C minor, Op. 67" —, e a chave de título exige igualdade após normalizar; (b) a expressão que extrai o número de catálogo cobre 9 siglas (BWV, K, KV, D, Op, HWV, RV, Hob, WoO, S) e a musicologia usa dezenas (Sz, BB, L., FP, TrV, JW, Anh., B., CD…). **4.570 das sem endereço já têm número de catálogo apurado do nosso lado** — é a chave mais forte, sobrando | ⬜ |
| PT-12 | ⬜ Uma segunda passada custaria outros 20 min de banda da fonte. Antes dela, o índice precisa ser **guardado em cache** (`scripts/.imslp-indice.json`): a passada atual descartou as 256 mil entradas depois de casar, e sem cache toda melhoria de casamento exige rastejar tudo de novo | ⬜ |
| FI-1 | ✅ **MOVIMENTO SAIU DOS RECORTES, ERA ENTROU.** Medido: 6 movimentos alcançam **3.102 de 31.874 obras = 9,7%**, e 11 dos 1.004 compositores. Era alcança **30.587 = 96,0%**. Um recorte exposto ao lado de "Obras" e "Pessoas" promete o mesmo peso e entregava um décimo | ✅ |
| FI-2 | Movimento **não sumiu**: continua no funil como filtro de obras e pessoas — que é onde eixo seletivo pertence —, e lá traz a contagem de antemão. A era exposta escreve no MESMO estado da etapa 2 do funil: duas interfaces, um estado só, senão divergem | ✅ |
| NU-1 | ⚠️ **"17" NÃO É O NÚMERO DE PARTITURAS.** São três números diferentes, e a tela mostrava um rótulo para cada: **31.874 obras catalogadas** · **7.040 com partitura localizada** · **17 que TOCAM aqui** (edição nossa, renderizável). Os 17 são "Para estudo aqui" | ℹ️ |
| NU-2 | Não foram extraídas 32 mil partituras, e dizer que sim seria mentira. O que existe são 31.874 **fichas de obra**. Partitura com endereço: 7.040 hoje, e o casamento com IMSLP acrescenta ~8.500 | ⬜ em andamento |
| OR-1 | ✅ **AS LISTAS SAEM EM ORDEM ALFABÉTICA.** Saíam na ordem em que o arquivo foi lido — a ordem da extração, ou seja, nenhuma. Com 31.874 obras isso faz a página 2 não ter relação com a página 1, e torna impossível saber se algo está no acervo sem percorrer 1.040 páginas. Ordenado num lugar só, em `listar()`, e não em cada ramo: ramo esquecido sairia embaralhado sem ninguém notar | ✅ |
| OR-2 | `localeCompare` com `pt-BR`, e não comparação por código de caractere — sem isso "Ária" cai **depois** de "Zumbi", e uma parte do catálogo em português vai parar num fim de lista que ninguém alcança | ✅ |
| OR-3 | O compêndio da ficha também: Bach tem 978 obras, e sem ordem procurar uma exige ler as 978. Os artigos ficam de fora, por decisão: publicação própria se lê do mais recente para o mais antigo | ✅ |
| BIO-1 | ✅ **BIOGRAFIAS: de 225 para 900 de 1.004 compositores.** Os 783 brasileiros entraram sem nenhuma; a fonte publica a biografia na página de cada um, e não na listagem. 679 colhidas, com proveniência apontando para a página de origem | ✅ |
| BIO-2 | 🔴 Villa-Lobos, Carlos Gomes, Guarnieri e Mignone ficavam com a **linha de descritor da Wikidata** — "compositor brasileiro (1887–1959)" — porque a fusão preservava o registro ocidental sem olhar o conteúdo. Agora vence a biografia mais substantiva, e a autoral do Conservatório continua vencendo as duas | ✅ |
| BIO-3 | Duas verificações acusaram as biografias: "curso superior" e "ilha". As regras estão certas e o alvo estava errado — é texto **citado**, sobre gente morta. A saída óbvia seria editar a biografia para o verificador calar, publicando como citação um texto alterado. Isentada a linha `"biografia":` em `src/data/`, **pela forma** (chave entre aspas = objeto gerado); biografia escrita à mão continua verificada | ✅ |
| PT-3 | 🔴 **A FICHA DIZIA "NÃO HÁ EDIÇÃO CATALOGADA" SOBRE 7.040 OBRAS QUE TÊM.** Havia dois estados onde existem três: *toca aqui* · *partitura achada* · *ainda procurando*. O segundo não existia, e as obras com endereço recebiam o recado do terceiro — que manda a pessoa desistir de procurar o que está a um clique | ✅ |
| PT-4 | E o link não aparecia: `linkOficial` não conhecia a chave do corpus brasileiro, e as partituras do Mutopia ligavam a obra **sem gravar o identificador** — obra com edição casada e botão "consultar na fonte" que não aparecia | ✅ |
| PT-5 | 🔴 Referência de **página** não é referência de **arquivo**. A ficha declarava "transcrição sem autoria declarada" e "licença não declarada" sobre páginas do IMSLP e da Música Brasilis, onde autoria e licença estão declaradas — de cada edição, uma por uma. Campo `aponta: 'ARQUIVO' \| 'PAGINA'`, e a ficha fala diferente de cada | ✅ |
| PT-6 | ✅ **IMSLP / Petrucci ligado.** `scripts/casar-imslp.ts` percorre o índice público da fonte e casa por **compositor + número de catálogo**, com título como segunda chave. `robots.txt` lido: `Crawl-delay: 2` respeitado, `/images/` e `/imglnks/` nunca tocados — entra o link da página, nunca o arquivo | ✅ |
| PT-7 | O casamento **não cria obra nenhuma**: linha do índice que não acha obra é linha descartada. É a regra que as 1.331 duplicatas ensinaram, aplicada a uma fonte que tem 240 mil entradas e poderia inundar o catálogo | ✅ |
| DP-1 | ⚖️ **Registro, ficha e biografia não dependem de direito autoral** — fato não se protege. O que o prazo do art. 41 decide é se a obra **toca aqui dentro**, e nada além disso. Obra protegida aparece, diz de quem é, e aponta para onde está publicada | ✅ |
| MB-1 | ✅ **MÚSICA BRASILIS ESTÁ NO CATÁLOGO.** 783 compositores e 6.917 obras brasileiras. O acervo foi de **24.957 para 31.874 obras** e de **225 para 1.004 compositores**. O Brasil tinha quatro nomes — os que atravessaram para o catálogo do concerto europeu —, e passou a ter o corpus | ✅ |
| MB-1a | 🔴🔴 **A PRIMEIRA EXTRAÇÃO DEU A CADA COMPOSITOR AS DATAS DO ANTERIOR.** O leitor pegava 900 caracteres **antes** do link, com o comentário "as datas vêm num selo logo acima". Não vêm: o selo fica **dentro do cartão, depois do link**. O que está acima é o fim do cartão do vizinho | ✅ corrigido |
| MB-1b | Nada acusava: anos plausíveis, formato certo, campo certo. Camargo Guarnieri saiu 1944–2011 (é 1907–1993), Francisco Mignone 1835–1923 (é 1897–1986), Villa-Lobos sem data nenhuma | ✅ |
| MB-1c | ⚖️ **E o estrago era jurídico.** A data de morte decide o domínio público pela Lei 9.610/98 — morte + 71. Com 1923, a obra de Mignone teria sido **declarada livre**; ela está protegida até 2057. Era o erro mais caro que este catálogo pode cometer | ✅ |
| MB-1d | O leitor passou a ler **de dentro do cartão**, e a extração agora **confere uma amostra contra a página de cada compositor** — uma segunda fonte dentro da mesma fonte. Divergência derruba a extração. Datas subiram de 405 para **452** | ✅ |
| MB-2 | Identidade resolvida pela mesma chave de nome ordenado que juntou os nove duplicados: Villa-Lobos, Carlos Gomes, Camargo Guarnieri e Francisco Mignone já estavam no acervo pelo lado ocidental e **não duplicaram**. 0 nomes repetidos em 1.004 | ✅ |
| MB-3 | Proveniência deixou de mentir: era `OPEN_OPUS` cravado, e os 783 brasileiros passariam a declarar que o nome saiu de um catálogo que nunca os listou. `resolution.method` e a proveniência por campo agora dizem qual das duas catalogações trouxe cada registro | ✅ |
| MB-4 | 🔴 **O MAPA PASSOU A EMITIR 299 PESSOAS NUMA ERA.** Menos que os 9.245 de antes, e ainda assim não é mapa. Teto de 150, ordenado por tamanho de compêndio — e **`naoPlotados` na tela**, dizendo quantas ficaram e como chegar nelas. Corte com número é recorte; corte sem número é mentira sobre o tamanho do acervo | ✅ |
| MB-5 | ⚠️ **Local de nascimento caiu de 96% para 22%.** A fonte brasileira não publica o campo — nem na listagem, nem na página do compositor, que traz biografia e mais nada. O piso de 90% valia para **filtro**, e `birthPlace` é texto de ficha; o filtro é `regionId`, que está em **1.000 de 1.004**. O teste passou a cobrar o que dá para cobrar: não regredir onde a fonte publica, e **ficar vazio** onde não publica | ✅ |
| PT-1 | ✅ **OBRAS COM ENDEREÇO DE PARTITURA: de 180 para 7.040.** Toda obra brasileira chega com a página da edição dela — na fonte, obra e edição são a mesma ficha. É o oposto das 1.169 partituras avulsas que procuram obra e não acham | ✅ |
| PT-2 | ⬜ **Faltam 24.834 obras sem edição localizada.** O caminho é IMSLP/Petrucci, que cataloga por obra e por número de catálogo — e o acervo agora tem número de catálogo em 46% das obras, que é a chave de casamento. **Próximo passo do acervo** | ⬜ |
| EN-1 | ⬜ **Enriquecer os 783 brasileiros pela Wikidata**: local de nascimento, biografia e identificadores cruzados. A desambiguação tem de casar **ano de nascimento e morte** com o que Música Brasilis declara — casar só por nome ligaria "Alberto Costa" a qualquer um, e importaria a biografia de outra pessoa | ⬜ |
| CG-0 | 🔴🔴 **A CAUSA RAIZ DE "O CATÁLOGO COMPLETO NÃO CARREGOU": o arquivo NUNCA FOI VERSIONADO.** `public/acervo/obras.json` e `public/acervo/partituras.json` existiam **só na máquina onde a extração rodou**. Nunca entraram no git. Toda construção feita a partir do repositório nascia **sem catálogo** | ✅ resolvido |
| CG-0a | E a falha não aparecia como falha. Um aplicativo de página única responde qualquer caminho desconhecido com o próprio `index.html`, **status 200**. O `fetch('/acervo/obras.json')` recebia HTML, o `JSON.parse` morria com *Unexpected token '<', "&lt;!DOCTYPE"...*, e a tela caía para as 17 obras próprias pedindo para recarregar. **Recarregar nunca ia resolver** — não havia o que buscar | ✅ |
| CG-0b | Correção: os dois arquivos saíram de `public/` e foram para **`src/data/acervo/`**, e o carregamento deixou de ser `fetch` por caminho e passou a ser `import()` resolvido pelo empacotador. O catálogo virou **dependência da construção**: ou a construção o acha, ou ela falha — na máquina de quem publica, e não no navegador de quem estuda | ✅ |
| CG-0c | Medido na construção: `assets/obras-*.js` **5.286.062 bytes** (786 kB comprimido) e `assets/partituras-*.js` **684 kB**, servidos de `/assets/`, onde nenhuma rota da aplicação passa. Continuam em pedaço próprio, pedido só quando o acervo abre | ✅ |
| CG-0d | 🔴 **E a suíte inteira rodava sobre o acervo mutilado.** Havia um caso afirmando *"no ambiente de teste não há rede, então o aviso DEVE aparecer"* — ou seja, o caminho que carrega as 25 mil obras **não era exercitado por teste nenhum**, e o estado degradado tinha virado o estado testado. Agora o teste lê o mesmo arquivo que o navegador, e o caso cobra o contrário: **mais de 20 mil obras na tela, e nenhum aviso de falha** | ✅ |
| CG-0e | Custo assumido: cada arquivo de teste que toca o acervo lê 5 MB de verdade. A suíte subiu de ~69 s para ~73 s e as esperas foram folgadas. É segundo gasto exercitando o código que vai para o navegador — o barato de antes era **não testar** | ✅ |
| CG-0f | ⚠️ **PENDENTE DE COMMIT.** Os arquivos estão em `src/data/acervo/` e ainda **não foram adicionados ao git**. Enquanto não forem, a publicação continua nascendo sem catálogo — a diferença é que agora ela **falha na construção**, em vez de mentir no navegador | ⚠️ |
| FL-1 | A fila de edições sem obra (1.169) **saiu da tela**. Já foi recorte navegável, depois virou aviso contando quantas eram; as duas saíram pelo mesmo motivo: **um número que quem lê não pode endereçar não informa, atrapalha**. A contagem ficou em `resumo().naFilaDeResolucao`, que é assunto de quem cataloga, e o pente fino passou a exigir ela **no código** em vez de na tela | ✅ |
| CG-1 | 🔴🔴 **O CATÁLOGO NÃO CHEGAVA AO NAVEGADOR — e eram DOIS defeitos somados.** (a) `carregarObrasExternas(buscar = fetch)` capturava o `fetch` **solto**; chamado assim ele roda sem receptor e o navegador recusa com *Illegal invocation*. O `catch` engolia, e a tela caía para as 17 obras próprias. Em teste nunca apareceu: lá o `fetch` é uma função comum. (b) O repositório **guardava o resultado degradado** como se fosse o catálogo — uma recusa de um instante virava permanente, e recarregar não adiantava | ✅ |
| CG-1a | Provado ponta a ponta contra o build servido por HTTP real: **24.940 do arquivo → 24.957 no catálogo → 1169 pendentes**. O número que você via — "~1400 a resolver" — era o sintoma exato: com o catálogo fora, nada casa e ficam 1349 | ✅ |
| CG-1b | `fetch` amarrado ao objeto global, **duas tentativas** com pausa, arquivo vazio tratado como falha, e o vazio **não fica guardado** — a próxima leitura tenta outra vez | ✅ |
| CG-2 | 🔴🔴 **HAVIA DOIS BACHS — e dois de mais oito.** A fusão de compositores era só por identificador, e as fontes numeram diferente: `bach-johann-sebastian` contra `johann-sebastian-bach`. **9 dos 14** do repertório próprio viviam duplicados: Bach, Beethoven, Brahms, Chopin, Grieg, Mozart, Pachelbel, Schumann, Vivaldi | ✅ resolvido |
| CG-2a | O estrago não era a contagem: o dado bom ficava **partido**. Biografia autoral num registro sem obra, sem retrato e sem região; as 838 obras noutro, com uma linha da fonte no lugar da biografia. **Era isso que você via como "ficha sem nada"** | ✅ |
| CG-2b | Resolução por **nome normalizado com palavras ordenadas** — é a ordenação que faz "Johann Sebastian Bach" e "Bach, Johann Sebastian" caírem na mesma chave. Sobrevive o id **externo**, porque é para ele que as 25 mil obras apontam; o próprio vira apelido | ✅ |
| CG-2c | **225 compositores** (eram 234 com 9 duplicados) · 0 duplicados · 0 obras órfãs · **Bach com 978 obras, retrato e biografia autoral** no mesmo registro | ✅ |
| CG-2d | Três efeitos colaterais que sumiam em silêncio, e cada um só apareceu porque um teste falhou: obras próprias apontando para id que deixou de existir; a ficha resolvendo o compositor e filtrando obras pelo id cru (**mostrava zero sobre quem tem 978**); e os **fundadores de movimento** com os ids antigos — Bach deixava de listar o Contraponto tardio, e o movimento deixava de contar Bach | ✅ |
| CG-2e | O identificador **antigo continua abrindo** a ficha, com o compêndio completo. Link salvo não vira "não encontrado" | ✅ com teste |
| CG-3 | **AS SELEÇÕES CURADAS DA FONTE APARECEM** — 1.245 recomendadas e 401 em destaque estavam extraídas e **sem uso em lugar nenhum**. Viraram a **etapa 1 do funil**: "por onde começar" é a pergunta de quem chega a um acervo de 25 mil obras | ✅ |
| CG-3a | ⚠️ **O RÓTULO NOMEIA DE QUEM É.** "Populares" sozinho lê-se como *os mais tocados*; "Recomendadas" sozinho, como *os principais* — apuração que ninguém fez aqui. São **"Recomendadas pela fonte"** e **"Em destaque no catálogo de origem"**, e a ajuda diz o que elas **não** são. Mesma regra que impediu `recommended` de virar um filtro chamado "descendência" | ✅ |
| CG-3b | O domínio declara por escrito: não são linhagem, escola nem influência. Um eixo de linhagem precisa vir do Wikidata (professor/aluno) — reaproveitar esta lista seria inventar o dado | ✅ |
| CG-4 | **A TELA DE LEITURA DO ARTIGO EXISTE** (`/acervo/artigo/:id`). A vitrine listava "4 obras citadas" e abrir não levava a lugar nenhum. Agora: texto inteiro seção por seção, e **cada obra citada com o motivo e link para a ficha** — que era a única coisa que a tela não deixava conferir | ✅ 8 casos |
| CG-4a | Obra citada que saiu do acervo é **dita**, e não escondida: esconder faria o artigo afirmar um percurso de quatro obras e mostrar três | ✅ |

| AC-20 | 🔴 **A TELA DO ACERVO ERA UM AMONTOADO.** Seis abas no mesmo nível — obras, pessoas, movimentos, biblioteca, artigos, pendências —, **onze seletores de filtro lado a lado** sem ordem nem hierarquia, uma busca, dois cartões soltos e a listagem. Tudo na mesma altura visual, tudo competindo. A **biblioteca oficial**, que é a produção desta escola, tinha virado dois cartões perdidos no meio do catálogo do mundo | ✅ refeita |
| AC-20a | **Banner** no topo nomeando a tela e dizendo as duas coisas que vivem nela: o que a escola **produz** e o que ela **cataloga**. Seis métricas contadas | ✅ |
| AC-20b | **Navbar de DUAS seções**: Biblioteca · Acervo de compositores. Abre na **Biblioteca** — a produção própria vem primeiro, e o catálogo do mundo só aparece quando se pede | ✅ |
| AC-20c | **Biblioteca com vitrines próprias**: artigos e livros em carrosséis **paginados**, com o que convence a abrir — tipo, subtítulo, resumo, assinatura, ano e quantas obras o texto percorre. Paginado e não rolável: barra de rolagem esconde o que existe e obriga a arrastar para descobrir | ✅ 9 casos |
| AC-21 | **O FILTRO VIROU FUNIL.** `catalog-funnel.ts`: etapas **numeradas** na ordem em que um catálogo musical estreita a busca — quando · onde · por onde sai o som · como se organiza · o detalhe. Cada etapa só aparece onde faz sentido, e faceta sem etapa declarada **não some**: cai na última | ✅ |
| AC-21a | O funil é um **ícone no canto** e fica **fechado**. Os onze seletores viviam abertos disputando espaço com a listagem. Fechado, a tela mostra o que a pessoa veio ver; aberto, mostra o caminho inteiro de uma vez. Fecha no Escape e no clique fora | ✅ |
| AC-21b | **A lupa fica no centro, e não se repete dentro do funil** — eram dois campos de busca com o mesmo propósito. Há teste recusando o segundo | ✅ |
| AC-21c | O botão mostra **quantos recortes estão ativos** sem precisar abrir, e cada etapa mostra quantos dela | ✅ |
| AC-21d | "O que você procura" deixou de ser aba e virou escolha dentro do acervo: Obras · Pessoas · Movimentos · A resolver. Trocar o alvo **zera o funil** — os eixos de um não valem no outro | ✅ |
| AC-22 | 🔴 O selo do livro dizia **"em breve"**, e o pente fino acusou: promessa que ninguém assumiu. Virou **"em curadoria"** — estado, e não prazo — com o motivo por extenso logo abaixo, e não escondido num `title` | ✅ |
| AC-23 | Espera dos testes da tela folgada para 6s: sob a suíte inteira a carga do catálogo passava do segundo padrão do `findBy`. Caso que falha por pressa ensina a reexecutar em vez de ler — e aí o defeito de verdade passa no meio dos falsos | ✅ |

| UI-1 | 🔴🔴 **A BATERIA NÃO VIA TELA QUE NÃO ABRE — e essa é a resposta ao "como você não vê".** A fumaça de rota tinha **duas cegueiras**: montava tudo como **administrador logado** (visitante nunca era exercitado) e o critério era `body.textContent.length > 0`, que um esqueleto de carregamento satisfaz. Passava verde sobre tela que não abre | ✅ corrigido |
| UI-1a | A lista de rotas vinha da **tabela de audiência** — 43 de 91. Quase metade da aplicação montava sem ninguém olhar. Agora deriva do **roteador**, que é a única fonte do que é servido: **117 rotas × 2 peles = 234 casos**, contra 44 rasos | ✅ |
| UI-1b | O critério afiado virou **"o esqueleto sumiu"**. O piso de texto é só rede de segurança e é baixo de propósito: "Curso não encontrado" é estado vazio **correto** para id inventado, e exigir 100 caracteres reprovaria o acerto | ✅ |
| UI-1c | O detector de esqueleto **acusou o grafo por um ponto de 2,5px**: `animate-pulse` é utilitário do Tailwind e aparece em selo de "ao vivo" e floco de ofensiva. Refeito para exigir **bloco cinza de conteúdo** (`bg-stone-200` pulsando), que é o que esqueleto é | ✅ |
| UI-2 | 🔴 **ONZE TELAS NÃO ABRIAM**, todas pelo mesmo padrão: `if (!userId) return;` **antes** de `setIsLoading(false)`. Visitante ficava com esqueleto eterno — sem erro, sem aviso. Corrigidas: Laboratório (casa), Competência, Tentativa, Retorno imediato, Maestria, Histórico, Meta do dia, Perfil de prática, Perfil acadêmico (×2 rotas) | ✅ |
| UI-2a | `/academia/academic-profile` e `/academia/profile` travavam **inclusive para quem está logado** — o `return` pulava um `setIsLoading(false)` que ficava **fora** do `try` | ✅ |
| UI-2b | Duas telas devolviam `return null` para visitante — **página em branco**, sem título, sem explicação, sem volta. Ausente e quebrado parecem a mesma coisa quando a tela não fala. Agora dizem o que falta e por quê | ✅ |
| UI-3 | **O MENU LIMPO: só os pilares.** Ele listava os cinco **com as sub-rotas penduradas** — virou inventário. Agora: **Academia · Laboratório · Acervo · Estúdio**, mais **Perfil só com sessão**. Visitante vê quatro, e os quatro abrem | ✅ |
| UI-3a | Salas e Admin saíram do menu: entram pelo Perfil, que é onde a conta vive. `pilaresVisiveis(temSessao)` é a fonte única — barra inferior, menu e corrente de circulação leem dela | ✅ |
| UI-3b | O teste que guardava isso lia literais de rota **dentro do menu**, e o menu deixou de ter rota escrita — o caso virou vácuo (passava sobre zero caminhos). Movido para ler os pilares, mais um caso recusando que o menu volte a escrever rota | ✅ |
| UI-4 | 🔴 **O RODAPÉ FALAVA COM QUEM PROGRAMA.** Exibia "TypeScript Strict", "Web Audio Synthesizer" e "WCAG AA Compliant" a aluno e visitante — escolhas de implementação anunciadas a quem veio aprender música. Refeito: quem a escola é, a **ressalva de curso livre** (que alcança quem nunca chegou ao certificado) e o caminho de volta pelos pilares | ✅ |

| BI-1 | 🔴🔴 **O CATÁLOGO FALHAVA EM SILÊNCIO — e era isso que você via.** Quando `obras.json` não chega, a listagem cai para o repertório próprio (**17 obras**) e **todo compositor aparece com zero**, sem uma palavra. Quem olha conclui que o acervo está vazio, quando ele está **inalcançável** — são coisas diferentes, e só uma é culpa do acervo. Agora a tela diz o que falhou e o que sobrou | ✅ 3 casos |
| BI-2 | 🔴 **O RETRATO GUARDADO ENVELHECIA PARA SEMPRE.** Os compositores eram gravados em `localStorage` na primeira leitura e lidos de lá **sem nunca mais conferir**. Quem abriu a tela antes das regiões ficou com retrato sem região, sem local de nascimento, com as 3 identidades trocadas já corrigidas na origem, e com ids que não casam mais com as obras — **zero obras em todos**. Nada dava sinal, e reextrair não alcançava ninguém | ✅ |
| BI-2a | A semente agora carimba uma **assinatura derivada do próprio conteúdo** — quantos, quem abre, quem fecha, quantos com região, quantos com local. Assinatura diferente descarta e ressemeia. Número escrito à mão se esquece de incrementar, e o defeito volta calado | ✅ |
| BI-3 | 🔴 **NÃO HAVIA PAGINAÇÃO.** A listagem renderizava **todos** os itens: com 17 passou despercebido, com 24.957 são 25 mil nós no DOM de uma vez e a aba trava. Página de 30, com total dito em cima para ninguém confundir "a página" com "o acervo" | ✅ |
| BI-4 | **O ROSTO NO CARD.** `ItemDoAcervo` **não tinha campo de imagem** — o retrato só aparecia depois de clicar, e o acervo tem 220 retratos versionados. Uma lista de 234 pessoas sem rosto obriga a abrir uma por uma. Sem retrato, mostra **iniciais** — nunca foto de banco | ✅ |
| BI-5 | **A AUTORIA VIROU CAMINHO.** O nome do compositor no card de obra era texto cinza. Se a autoria é a matriz do catálogo, ela precisa levar à pessoa com um clique, sem passar pela ficha da obra. O card traz retrato pequeno + nome clicável | ✅ |
| BI-6 | **A FICHA DA OBRA ABRE PELO COMPOSITOR.** Retrato, datas, local de nascimento, biografia e "ver o compêndio completo" — antes dos campos da obra. O compositor era uma linha dentro da tabela, na mesma altura de "compasso" | ✅ |
| BI-7 | **A SEÇÃO QUE FALTAVA: a produção do Conservatório.** Livros e artigos existiam no domínio, testados, e **não tinham porta** — o mesmo defeito do Acervo fora da navegação, um nível abaixo. Agora: **banner** dizendo o que a seção é (o que a escola produz × o que ela cataloga), **6 métricas contadas**, **cartões por tipo de conteúdo** que levam à seção, e listagem paginada | ✅ 5 casos |
| BI-7a | Aba **Artigos** nova. Artigo é produção própria assinada, **e não obra de acervo** — há teste recusando que ele entre na contagem de obras. Cada um diz quantas obras do acervo percorre | ✅ |
| BI-7b | O que está fechado aparece **com a contagem**: esconder o que existe e ainda não abriu daria a impressão de que a escola produziu menos do que produziu | ✅ |
| BI-8 | **Falta o preview de visitante ser distinto do acesso completo** — hoje `/acervo` e as duas fichas são `publica` integralmente. Decidir se a ficha completa deve exigir nome, sabendo que o Acervo é a porta de entrada de quem chega por busca | ⬜ |
| BI-9 | **A tela de leitura do artigo existe** — ver AC-4e (curado em 2026-09-22) | ✅ |

| NV-1 | 🔴🔴 **O ACERVO NÃO ESTAVA EM NENHUMA BARRA.** Rota pública desde o início, com 24.957 obras, 234 pessoas e ficha de obra e de compositor — **e sem porta na interface**, nem para quem já entrou. A causa: havia **três listas de navegação independentes** mantidas à mão (`AppShell`, `ExplorarMenu`, `CirculationBar`), cada uma com itens diferentes. Três listas divergem na primeira tela nova | ✅ corrigido |
| NV-1a | `src/ui/navigation/pilares.ts` — **uma fonte só**. Cinco pilares: **Academia · Laboratório · Acervo · Estúdio · Perfil**. As três superfícies leem dela, e há teste recusando rota escrita à mão em qualquer uma | ✅ 12 casos |
| NV-1b | **O que não é pilar virou sub-rota**: `/score` (editor de partitura) entra sob **Estúdio** — são a mesma sala, um edita notação e o outro edita som, e separá-los gastava um dos cinco lugares; `/worlds` (Atlas) entra sob **Acervo**, porque é a vista de mapa do mesmo catálogo; `/community` e `/notifications` sob **Perfil** | ✅ |
| NV-1c | A `CirculationBar` tinha **oito** passos. Corrente de oito não é corrente: era um terceiro menu, e divergia dos outros dois | ✅ |
| NV-1d | `/rooms` e `/founder` continuam escritos à mão no menu, e o teste **nomeia a exceção** em vez de afrouxar a regra: são extras por papel, e pô-los nos pilares os ofereceria a todo mundo | ✅ |
| NV-2 | 🔴 **O LABORATÓRIO ESTAVA FECHADO PARA QUEM CHEGA.** `/practice` exigia login e o visitante batia na porta — não havia conteúdo dele. Uma escola que não deixa ver a aula antes de matricular perde quem ia se matricular | ✅ |
| NV-2a | A rota virou **pública**. O treino é síntese local e roda para qualquer um; o que exige nome é a **medição** — ofensiva, XP, histórico — e ela fica atrás do convite. Mesmo desenho do Atlas. Painel zerado não aparece: zero ali não significa "você não praticou", significa "não há onde guardar" | ✅ |
| NV-2b | Os três pilares de vitrine — Academia, Laboratório, Acervo — têm teste recusando `exigeLogin`. Perfil e Estúdio seguem exigindo nome, e é correto: um é a conta, o outro salva projeto assinado | ✅ |

| AT-7 | **TESTE DE UI DO ATLAS** — a verdade compartilhada estava provada em 14 casos **de serviço**, e nenhum provava o **clique**. A tela tinha sido reescrita inteira sem um caso de interface: "o marcador leva à ficha" estava garantido na rota que o serviço devolve, e não no que acontece quando alguém aperta. É a distinção entre arquitetura correta e implementação completa — e ela já custou caro aqui: o sistema de facetas viveu meses no serviço, testado, enquanto a tela montava filtro de lista fixa | ✅ 11 casos |
| AT-6 | ✅ **AS CASAS PASSAM A RECORTAR O MAPA.** Era um grupo de botões que mudava um estado que ninguém lia. Agora `House.instrumentoId` liga a Casa ao vocabulário, e escolher "Violinistas" mostra **quem tocava violino** naquela era — 21 no Romantismo, 55 pianistas, 9 violinistas no Barroco. O cruzamento passa por `resolverInstrumento`: a fonte grava `guitarra` e a Casa pede `inst_violao` | ✅ |
| AT-6a | A Casa que **não** recorta fica visível e desabilitada, com o motivo no título — "não se organiza por instrumento" ou "nenhuma pessoa desta Casa tem obra nesta era". Sumir com ela esconderia que o espaço existe; deixá-la clicável mentiria | ✅ |
| AT-8 | **O CORTE DA LISTA SE ANUNCIA.** A versão anterior cortava em 120 marcadores **em silêncio**. Hoje a maior era tem 95, então nunca disparava — e quando o catálogo crescesse, marcadores sumiriam sem que a tela dissesse. Agora mostra "mostrando 60 de N" com "Mostrar mais". Corte que não se anuncia é dado perdido com aparência de lista completa | ✅ |

| AT-5 | **Busca universal na tela do Acervo** — o domínio (`catalog-graph.ts`) está pronto e testado; a tela ainda busca só dentro da seção escolhida. É o que falta da FASE 2 | ⬜ |
| AT-6 | **Casas ainda não filtram o mapa** — a seção existe e a seleção não recorta os marcadores. Ou passa a recortar, ou some | ⬜ |

| ON-0 | ⛔ **INGESTÃO DE FONTES CONGELADA.** KernScores, Música Brasilis e IMSLP **não aumentam o universo de obras** — eles preenchem recursos de obras que já temos. Ingeri-los antes de estabilizar o modelo importaria milhares de recursos para uma estrutura que não sabe onde pô-los, que é exatamente como nasceram as 1.331 duplicatas | ⛔ até a FASE 3 |
| ON-1 | 🔴🔴 **A AUSÊNCIA DE UMA ENTIDADE FORÇA A DUPLICATA — a lição central.** `Partitura` não existia como entidade: era objeto de valor dentro da obra. Logo, a única forma de um arquivo entrar no acervo era **sendo uma obra**. Ninguém decidiu criar 1.331 obras falsas; o modelo não oferecia outro lugar onde o dado coubesse | ✅ diagnosticado |
| ON-1a | **As 1.331 obras falsas saíram do catálogo.** 26.288 → **24.957 obras**, todas reais. Nenhum identificador repetido | ✅ |
| ON-1b | **O cruzamento por número de catálogo — que só a ontologia habilita — subiu o casamento de 35 para 180 partituras.** `BWV 846` é prova de identidade; título é indício. A ligação tenta catálogo primeiro, título depois, e só exato | ✅ |
| ON-1c | **1.169 partituras vão para a FILA DE RESOLUÇÃO** — 711 sem pessoa reconhecida, 458 com pessoa e sem obra. Elas **aparecem** na seção "A resolver", com o nome que a fonte deu e o motivo por extenso. Esconder seria a outra forma do mesmo erro: **pendência invisível é descarte disfarçado** | ✅ |
| ON-2 | 🔴 **UMA PESSOA NÃO É O SEU PAPEL.** `CanonicalComposer` — o nome parece descrição e é **regra**: a única forma de existir no acervo era tendo composto. Um violinista que nunca escreveu uma nota não tinha onde existir; um barítono virava "um compositor que tem uma voz"; e o instrumento foi parar dentro do registro de compositor como `instrumentosPraticados?: string[]` | ✅ corrigido |
| ON-2a | `Pessoa` com `atuacoes: AtuacaoMusical[]` — cada atuação liga **papel** + (**instrumento** ou **voz**), conforme o papel exija. Bach é compositor **e** organista **e** cravista ao mesmo tempo. A pergunta *"quais barítonos há"* era **impossível** antes: não havia onde guardar tessitura de pessoa | ✅ |
| ON-2b | **Vocabulário controlado** — `catalog-vocabulary.ts`: 14 papéis em 5 naturezas, 23 instrumentos em 7 famílias, 7 tessituras. `Violin`, `violino`, `Violine` e `geige` resolvem no **mesmo** `inst_violino`; grafia desconhecida devolve `undefined` e **não cria termo novo**. Vocabulário que cresce sozinho deixa de ser vocabulário | ✅ |
| ON-3 | **OS TRÊS NÍVEIS DE RECURSO**: Obra → Edição → Partitura, mais Gravação. **Sem EDIÇÃO**, a licença do arquivo fica pendurada na obra — e obra em domínio público com edição sob CC passa a parecer livre. **Sem PARTITURA como entidade**, os quatro formatos do mesmo texto viram quatro registros que ninguém sabe que são o mesmo | ✅ |
| ON-3a | **Simbólico ≠ renderizável.** MusicXML, Humdrum, LilyPond e MIDI são simbólicos; PDF e imagem são páginas. Mas um `.ly` simbólico sem leitor é `SOMENTE_REFERENCIA` — misturar os dois produziria o botão de tocar que abre nada | ✅ |
| ON-4 | 🔴 **FONTE EXTERNA ENRIQUECE. NÃO CRIA.** Criar entidade canônica é ato de curadoria, e curadoria tem dono e data. `checkFonteNaoCriaEntidade` **BLOQUEIA** o build e vigia quatro pontas: a fila existe no domínio, a ligação não escreve obra com id de partitura, enfileira o que não casou, e a tela mostra | ✅ 5 variantes |
| ON-5 | **WIKIDATA É FONTE, NÃO MODELO.** O catálogo chegou a raciocinar em `P19`, `P27`, `P1303` em vez de em termos do domínio. A cidadania entra como Q-id bruto e `wikidata-regions.ts` decide a região — mudar o mapa não exige reextrair nada. A grafia de instrumento passa pelo **nosso** vocabulário | ✅ |
| ON-6 | **A BUSCA ENTRA POR QUALQUER PORTA.** Toda entidade se reduz a `EntidadeIndexada` — id, tipo, rótulo, termos — e a busca casa termos e agrupa por tipo. `Mozart`→pessoa · `barítono`→voz · `violino`→instrumento+violinistas+obras · `BWV 1041`→a obra, direto. Os **vocabulários entram no índice**: deixá-los fora obriga quem procura a já saber em qual filtro o termo mora | ✅ domínio |
| ON-6a | Nome alternativo é pesquisável — quem procura `Fryderyk Szopen` e quem procura `Chopin` procuram a mesma pessoa. Foi a falta disto que fez o casamento por título render 18 de 638 | ✅ |
| ON-7 | **Entidades novas no domínio, todas pesquisáveis**: `Movimento` da obra (número, andamento, tonalidade, duração — era `string[]`), `Contribuicao` por papel (uma ópera tem compositor **e** libretista; `composerIds` atribuía ao compositor o trabalho do outro), `ParteVocal` com os quatro eixos, `Evento`, `Execucao`, `RelacaoEntrePessoas`, `RelacaoEntreObras`, `FonteDoCatalogo` | ✅ 23 casos |
| ON-8 | 🔴 **A AUTO-VIGILÂNCIA DAVA PASSE LIVRE** — `qa-modules.d.ts` é declaração de tipo, não teste, e citar o verificador nela bastava para ele contar como "visto acusando". Aconteceu com dois verificadores da mesma sessão | ✅ `.d.ts` excluído |
| ON-9 | **FASE 2 na tela** — o domínio da busca universal está pronto e testado; a `AcervoScreen` ainda busca só dentro da seção escolhida | ⬜ |
| ON-10 | **FASE 3 — migração dos 24.957 registros** de `CanonicalComposer`/`CanonicalWork` para `Pessoa`/`Obra`. A ontologia convive com o modelo antigo hoje; ela só vira o catálogo quando os dados migrarem | ⬜ |
| ON-11 | **FASE 4 — só depois**: ingestão seletiva de KernScores e Música Brasilis para preencher lacunas de partitura do universo que já temos. **Nenhuma obra nova nasce disso** | ⬜ |
| ON-12 | **FASE 5 — motor**: representação canônica de partitura, MIDI/MusicXML, renderização, simulador, prática | ⬜ |

| AC-12 | **MATRIZ DE COMPLETUDE** — `scripts/auditar-completude.ts` mede campo a campo, sobre o acervo servido e não sobre amostra. É ela que responde "qual filtro o acervo sustenta". Antes: **17 de 32** campos acima de 90%. Depois: **21 de 33** | ✅ |
| AC-12a | 🔴🔴 **O FILTRO DE REGIÃO ALCANÇAVA 17 OBRAS DE 26.288 — E ERA OFERECIDO ASSIM MESMO.** Quem clicava em "Europa Ocidental (14)" concluía que eram essas as que existiam, quando eram essas as que tinham o campo escrito. A diferença entre "não há" e "não apuramos" é invisível no resultado de um filtro | ✅ **0% → 96%** |
| AC-12b | A região sai da **cidadania** (P27), e não do local de nascimento: o local é um ponto e exigiria uma consulta por cidade; a cidadania já vem como Estado. Os dois entram — o local é conteúdo de ficha, a cidadania alimenta o filtro. `birthPlace` 0% → **94%**, `deathPlace` 0% → **91%** | ✅ |
| AC-12c | **O Estado vem histórico, e isso não é erro.** Bach é cidadão do Sacro Império; Mozart, do Arcebispado de Salzburgo; Chopin, do Congresso da Polônia. Mapa **explícito de 82 Estados** para 8 regiões, com o rótulo ao lado de cada Q-id — um mapa de `Q183: 'reg_europa_ocidental'` ninguém confere. `src/domain/wikidata-regions.ts` | ✅ 6 casos |
| AC-12d | **3 REGIÕES NOVAS, exigidas pelo acervo.** Os **Estados Unidos são o 2º maior grupo** — 33 compositores, atrás só da França — e não havia região nas Américas além do Brasil. Acrescentadas América do Norte, América Latina e Ásia e Oceania. Mesmo precedente da Europa Oriental: *"região que falta se acrescenta"* | ✅ |
| AC-12e | 🔴 **`eraIds` da região FILTRA o que a tela oferece** — uma região com obra numa era que ela não declara fica **inalcançável**. Albéniz e Granados estavam nesse limbo. Corrigidas contra o acervo: Ibérica ganhou Romantismo e Moderna, Escandinávia ganhou Barroco, Europa Oriental ganhou Classicismo | ✅ |
| AC-12f | **O BRASIL saiu de 0 para 290 obras** — Villa-Lobos, Carlos Gomes, Camargo Guarnieri, Francisco Mignone. Não havia falta de repertório: havia falta de apuração. É o piso a partir do qual a Música Brasilis entra | ✅ |
| AC-13 | 🔴🔴 **TRÊS COMPOSITORES TINHAM A FICHA DE OUTRA PESSOA.** `John Adams` (1947) estava ligado ao **2º presidente dos Estados Unidos**; `Howard Hanson`, a um político de Minnesota; `Engelbert Humperdinck` (1854), ao **cantor pop dos anos 60**. Biografia, retrato e identificadores cruzados — tudo completo, e tudo errado. É a pior falha possível num acervo: não é dado faltando, que se vê, é dado errado com aparência de certo | ✅ corrigido |
| AC-13a | **A causa**: `extrair-acervo.mjs` pedia `limit=1` à busca e ficava com `search[0]`, sem conferir nada. Corrigido na origem: candidato precisa ter **P106 = compositor** e o **ano de nascimento tem de fechar**. Ambíguo **não entra** — dois que passam nos dois testes devolvem nada, porque escolher um seria adivinhar | ✅ |
| AC-13b | **A data sozinha não serve como sinal.** Onze registros divergem no ano, e **oito estão corretos**: Ockeghem é 1420 aqui e 1410 lá, Josquin 1450 e 1455. É datação de século XV, que a historiografia dá por aproximação. Acusar os onze trataria incerteza histórica como defeito. **P106 separa**: os três impostores não a têm, os oito legítimos têm | ✅ conferido na API |
| AC-13c | `scripts/auditar-identidade.mjs` acha o errado **e re-resolve o certo**, exigindo ocupação e ano. Os três fecharam: Q11806→**Q84114**, Q124322374→**Q382748**, Q221289→**Q55010**. Trocar só o Q-id seria pior que não trocar — a ficha ficaria com o identificador de um e a biografia de outro, agora sem o sinal que permitiu flagrá-la | ✅ |
| AC-14 | **AS 7 PROPRIEDADES DO WIKIDATA, CONFERIDAS CONTRA A API ANTES DE VIRAREM CÓDIGO** (como você exigiu). **Existem** em registro de pessoa: P19 local de nascimento, P20 local de morte, P27 cidadania, P1303 instrumento praticado. **NÃO existem**: P412 tessitura (é de *cantor*), P571 data de criação (é de *obra*), P870 instrumentação (é de *obra*). Escrever as três últimas teria produzido campos permanentemente vazios e a impressão de acervo pobre onde a pergunta estava endereçada à entidade errada | ✅ |
| AC-14a | **Filtro novo: "Instrumento que tocava"** — P1303, 181 compositores, 32 instrumentos (piano 106 · órgão 48 · violino 42 · violoncelo 10 · cravo 8). Responde a pergunta que o aluno faz de verdade — *"quem tocava o meu instrumento"* — e que nenhum outro campo responde. **Não é o meio da obra**: Berlioz era violonista e escreveu para orquestra inteira | ✅ |
| AC-14b | P135 (movimento estético) extraído e **não importado cru**: rende só 83 de 220, e a maioria dos valores é **era disfarçada** — "música barroca" 28, "música clássica" 15, "era romântica" 15. Gravar junto poria "Barroco" ao lado de "Impressionismo" no filtro de movimento, o mesmo defeito do campo de gênero. O bruto fica no extraído; a separação é curadoria | ⬜ |
| AC-15 | **A DIGNIDADE DO FILTRO, EM CÓDIGO.** A `Faceta` passa a declarar `cobertura` e `universal`. São **dois tipos de campo**, e tratá-los igual produz as duas falhas opostas: eixo **universal** (era, região, compositor) com cobertura baixa é lacuna de apuração; eixo **seletivo** (movimento, partitura, número de catálogo) com cobertura baixa é a realidade. Cobrar 90% de um seletivo levaria a **inventar dado** | ✅ |
| AC-15a | A tela diz *"Recorta 45% do acervo — 11.684 obras"*, e a frase muda conforme o eixo: universal acrescenta *"o que falta é apuração, e não ausência"*. Eixo que alcança tudo **não escreve frase nenhuma** — ruído repetido ensina a não ler os avisos que importam | ✅ |
| AC-15b | 🔴 **A TELA NÃO USAVA AS FACETAS.** O sistema existia no serviço desde o início — contagem por opção, opção vazia não oferecida, tudo testado — e `AcervoScreen` montava seletores de `DEFAULT_ERAS`/`DEFAULT_REGIONS`/`DEFAULT_GENRES`: **sem contagem, e oferecendo recortes que devolviam vazio**. Agora a grade vem do serviço, e eixo novo aparece sozinho | ✅ |
| AC-15c | 🔴 **UMA FACETA SE FILTRAVA A SI MESMA.** O recorte aplicava todos os filtros e contava cada eixo sobre o resultado — inclusive o próprio. Escolher "Brasil" fazia o eixo de região mostrar só "Brasil (4)", e **trocar de região virava impossível** sem limpar o filtro antes. Cada eixo conta sobre os **demais** | ✅ |
| AC-15d | **Recorte órfão se limpa sozinho.** A versão anterior limpava região e movimento à mão quando a era mudava — cobria uma combinação e deixava as outras. A regra agora é geral: **todo seletor exibe "Todos" ou uma opção que ele mesmo oferece**, e há teste de invariante | ✅ |
| AC-15e | 🔴 A ajuda do filtro estava **dentro do `<label>`**, e entrava no NOME ACESSÍVEL: o campo se chamava *"Era Quando a obra foi escrita, no recorte de sete eras do curso."* Quem usa leitor de tela ouvia a frase a cada foco. Saiu para `aria-describedby` | ✅ |
| AC-15f | **`checkFiltroOferecidoEAplicado` BLOQUEIA** o build: toda faceta montada aparece num `.filter`, e a tela pede as facetas ao serviço em vez de montar lista fixa. Filtro que a tela mostra e a listagem ignora é pior que filtro nenhum — quem clica vê a contagem mudar e o resultado ficar igual | ✅ 4 variantes |
| AC-15g | `checkEixoUniversalAlcancaOAcervo` mede era e compositor no arquivo servido, e a **cidadania no seed** — porque é dela que sai a região de 25 mil obras, e ela cairia junto em silêncio | ✅ 5 variantes |
| AC-16 | 🔴 **A AUTO-VIGILÂNCIA DAVA PASSE LIVRE.** `checkEveryCheckerHasProof` procurava o nome do verificador em qualquer arquivo sob `tests/` — e **`qa-modules.d.ts` é declaração de tipo, não teste**. Declarar o tipo bastava para o verificador contar como "visto acusando". Aconteceu com dois desta mesma sessão | ✅ `.d.ts` excluído |
| AC-17 | **O QUE SEGUE ABAIXO DO PISO, e por quê** — `catalogNumber` 45% e `generoId` 44% (a leitura de título está no teto; o resto só vem de consulta por obra) · `key` 24% · `date` 3% · `movements` da obra 0% (allegro, adágio — exige catalogação analítica) · `recordingRefs` 0% · `imslp` 81% | ⬜ |
| AC-17a | **MusicBrainz por obra, agora com chave**: 11.891 números de catálogo em mãos fazem a ligação entre as bases deixar de depender de grafia de título. É o caminho para `date`, `movements` e o resto de `generoId` | ⬜ |

| AC-11 | ⚠️ **PASSO 3 ENTREGUE POR OUTRO CAMINHO, E A TROCA FOI MEDIDA.** A ordem pedia *MusicBrainz por obra — forma, tonalidade, número de catálogo*. Medi a fonte antes de escrever código: numa amostra de **300 obras de Bach**, só **11 têm forma** (4%) e **34 têm tonalidade** (11%); número de catálogo não vem como atributo nenhum. Pior, a ligação seria por título — 8.427 obras lá contra ~800 aqui para o mesmo Bach —, o mesmo beco do Mutopia | ✅ medido |
| AC-11a | **OS PRÓPRIOS TÍTULOS TRAZEM OS TRÊS CAMPOS.** `src/domain/title-reading.ts`: forma **45%**, número de catálogo **46%**, tonalidade **25%** — sem uma requisição. Dez vezes o rendimento da consulta externa. `Sonata in B flat major, K. 545` carrega os três dentro do título, e deixá-los presos na cadeia de texto era ter campo vazio sobre informação que já possuíamos | ✅ 17 casos |
| AC-11b | **Ler não é deduzir, e a recusa é metade do módulo.** Título sem forma legível devolve vazio — "Manhã", "Melodia", "Für Elise" continuam sem gênero, e não com a forma mais provável daquele compositor. Mesma regra do AC-1c | ✅ |
| AC-11c | 🔴 **A primeira regra de tonalidade classificou "Ich bin in mir vergnügt" como estando em Mi** — `in mi` casava. Sem exigir a palavra que diz maior ou menor, qualquer preposição seguida de duas letras vira tonalidade, e o filtro passaria a mentir sobre milhares de cantatas alemãs. O modo virou obrigatório nas três grafias | ✅ com teste |
| AC-11d | O teste guarda **piso e teto** do rendimento. Piso porque a regra pode continuar compilando e devolvendo vazio para tudo — foi assim que dois verificadores ficaram verdes sobre cegueira. **Teto** porque salto de cobertura aqui é sinal de regra frouxa, e não de melhora | ✅ |
| AC-11e | **17 gêneros novos no Atlas**, exigidos pela leitura: trio, quarteto, quinteto, mazurca, polonesa, noturno, estudo, capricho, rapsódia, variações, balada, abertura, impromptu, romance, tocata, poema, réquiem, hino. Critério de entrada: a forma **aparece escrita** em obra do acervo. Filtro passou de 13 a **39 opções**, todas rotuladas, sobre 11.679 obras | ✅ |
| AC-11f | `quarteto` entra **genérico**, ao lado do `quarteto-de-cordas` que já existia. Um quarteto com piano não é quarteto de cordas, e o título raramente diz qual dos dois é — presumir cordas afirmaria instrumentação que ninguém apurou | ✅ |
| AC-11g | A sigla leva ponto conforme a convenção de cada catálogo, e não por padrão nosso: `K.` de Köchel e `D.` de Deutsch abreviam sobrenome; `BWV` e `RV` são iniciais. As três grafias da fonte — `BWV.846`, `BWV 846`, `BWV. 846` — saem numa só, porque cruzar é a única coisa para que o campo serve | ✅ |
| AC-11h | **LIMITE DECLARADO**: Hoboken com algarismo romano (`Hob. III:12`) não é lido — fica sem número, e não com um número errado. Tem teste cobrando que continue assim | ✅ |
| AC-11i | **MusicBrainz volta a valer AGORA**, e por outro motivo: com 11.891 números de catálogo em mãos, a ligação entre as duas bases deixa de depender de grafia de título e passa a ter chave de verdade. É aí que a consulta por obra rende — e só para completar os 55% que o título não diz | ⬜ |
| AC-11j | Data de composição ainda em **3%** (866 obras, todas vindas da ficha por peça do Mutopia). O título não a carrega, e ela só vem de consulta externa | ⬜ |
| AC-9b | 🔴 **O CAMPO DE GÊNERO GUARDAVA MEIO, EM 25.195 OBRAS.** A classificação da fonte — Keyboard, Orchestral, Chamber, Stage, Vocal — responde "por onde sai o som", e não "como a obra se organiza". O filtro de gênero oferecia `vocal` ao lado de `minueto`. Migrado para `instrumentation`; `generoId` fica **vazio** até vir forma de verdade, porque campo errado preenchido é pior que vazio — o vazio se vê, o errado não. Gênero passou de 5 opções falsas a **13 formas reais** | ✅ |
| AC-9c | **Meio em DOIS níveis, e não num só.** A fonte sabe dizer "teclado" para 25 mil obras e não sabe dizer "cravo"; a partitura sabe dizer "Piano". Oferecer `Teclado (5.951)` ao lado de `Piano (685)` como irmãos ensina que o catálogo não sabe o que conta — um contém o outro. Duas facetas: **Meio** (varre tudo) e **Instrumento da edição** (só o que tem arquivo). `checkNiveisDeMeioSeparados` vigia | ✅ 4 variantes |
| AC-9d | Faceta de meio povoada: Vocal 8.761 · Teclado 5.951 · Câmara 5.193 · Orquestra 5.104 · Cena 1.262. Instrumento exato: Piano 685 · Violão 360 · Voz 245 · Violino 40 · Violoncelo 11 · Flauta 8 | ✅ |
| AC-8a | ⚠️ **As partituras ficam `FICHA`, e não `NATIVA`.** Trazem `.ly` e `.mid`, e a plataforma **não tem leitor** de LilyPond nem de MIDI. Marcar NATIVA faria a ficha oferecer "tocar" e abrir nada — o botão morto que o projeto passou meses tirando. No dia em que o leitor existir, é uma linha | ⬜ |
| AC-9 | **CURADORIA DE FILTROS POR FACETAS** — `catalog-facets.ts`. Cada eixo traz a **contagem do que devolve**, apurada sobre o recorte atual dos demais filtros. Opção com zero **não é oferecida**: convidar ao beco sem saída ensina a desconfiar de todo filtro | ✅ |
| AC-9a | Os eixos: **meio** (instrumento ou voz — recorte diferente de gênero), era, sub-período, região, gênero/forma, tonalidade, compositor, situação de direito autoral, licença do arquivo. Cada um com texto de ajuda: "meio" e "gênero" parecem a mesma coisa para quem não é músico, e não são | ✅ |
| AC-10 | **Seções novas do Acervo**: PARTITURAS e ANTIGUIDADE. O serviço as serve; a tela ainda não as desenha | ⬜ |
| AC-6 | **Unidade brasileira** — o oposto: o repositório existe e é vasto, falta **edição digital redistribuível**. Catalogação pela Música Brasilis, e editoração própria para o que não tem edição livre. Muda a plataforma de consumidora para contribuinte do acervo comum | ⬜ |
| AC-7 | **Cobertura igual entre eras é impossível** — o Medieval tem menos obra porque sobreviveu menos. O que deve ficar parelho é a QUALIDADE do registro: biografia, proveniência, ficha dizendo o que se pode fazer. Essa é a medida de completude, e não a contagem por era | ✅ registrado |
| AC-3a | `scripts/gerar-seed-acervo.mjs` converte o extraído em seed versionado. O acervo passa a ser **nosso**: fica no repositório, funciona offline, e reextrair é rodar os dois scripts | ✅ |
| AC-3b | **A situação de direito autoral é RECALCULADA na leitura**, e não copiada do seed: o prazo corre, e quem estava protegido na extração pode ter entrado em domínio público desde então | ✅ |
| AC-3c | **Compositor vivo entra no catálogo, marcado como protegido.** O acervo registra a existência; a legislação decide a experiência. Catálogo acadêmico que escondesse o século XX estaria mutilado | ✅ |
| AC-3d | `acervo-unificado.ts` — o registro próprio **acrescenta** ao externo em vez de substituí-lo: o externo traz a ficha completa, o próprio traz a partitura que toca | ✅ |
| AC-2 | **Tela de ingestão no console** — `MusicKnowledgeService.ingerirCompositor` existe e ninguém consegue dispará-lo pela interface. É o que dá VOLUME ao acervo | ⬜ |
| AC-3 | **Os outros cinco adaptadores** sobre a porta que já existe: Open Opus, MusicBrainz, Commons, Internet Archive e **Mutopia** (o único que dá partitura renderizável) | ⬜ |
| AC-4 | ⚠️ **A consulta SPARQL do Wikidata não foi reconferida ao vivo** — o ambiente está sem rede. Conferir no navegador antes de publicar | ⬜ |
| AC-5 | **Mapa gameificado na tela** — `atlas-map.ts` navega no tempo, repovoa regiões e monta três tipos de marcador, tudo testado. `WorldsAtlasScreen` ainda usa o filtro antigo, sem linha do tempo | ⬜ |
| AC-6 | **Repertório brasileiro**: Brasil aparece com **0 obras** em todas as eras. É a oportunidade da `21.1 §11.6` — editorar Nazareth, Chiquinha Gonzaga, Callado, Carlos Gomes | ⬜ |
| AC-7 | **Presets de prática por nível** a partir das peças de domínio público dos compendios de instrumento — a lista é curadoria nossa, sem nomear método nenhum | ⬜ |

### Estado do Laboratório — medido em 19/09

As telas estão prontas; o **motor** não.

| | |
|:---|---:|
| telas, todas ligadas a serviço ou repositório | 19 |
| dimensões na gramática | 21 |
| **com gerador** | **6** |
| níveis na gramática | 5 |
| **renderizáveis** | **3** |
| **combinações geráveis** | **16 de 105** |
| árvores · competências · exercícios semeados | 5 · 5 · 10 |

| # | Item | Estado |
|:---|:---|:---:|
| LAB-1 | 🔴 **AS 21 DIMENSÕES TÊM GERADOR — eram 6.** Quinze construtores novos: clave, alteração, compasso, ritmo, andamento, dinâmica, expressão, função harmônica, cadência, condução de vozes, ornamento, modulação, transposição, notação especial e acústica. A pauta ganhou pausa, duração e acordes em sequência; a figura ganhou o SINAL impresso (pp, Allegro, D.C.). Ouvido só onde o motor de som é honesto (alteração, ornamento, acústica); nas outras o nível fica fechado e declarado (`OUVIDO_ALEM_DO_MOTOR`). As 20 regras de `nexo-das-perguntas` valem para todas, e `lab1-correcao-musical.test.tsx` refaz cada resposta a partir da figura | ✅ 31 casos de correção + as 20 regras × 21 dimensões × 400 sementes |
| LAB-1a | **Dois defeitos que só a leitura da amostra pegou**: a célula de síncope tinha 2,5 tempos num 2/4 (agora há teste de compasso cheio), e "Largo quer dizer largo". E um terceiro, latente: `soletrarPorGrau` contava a oitava duas vezes em intervalo composto — os geradores antigos só usavam simples | ✅ |
| LAB-1b | Rótulo "Interval" em inglês na descrição da dimensão de intervalo | ✅ Intervalo |
| LAB-2 | **2 dos 5 níveis não são renderizáveis** | ⬜ |
| LAB-3 | **Os exercícios medidos passam de 11 para mais de 60, DERIVADOS e não escritos à mão** (`exercicios-derivados.ts`): uma frase medida por peça do repertório (a mesma transcrição da ficha e da partitura), as escalas maiores das sete tônicas soletradas por grau, e o canto de cada nota natural. Achado no caminho: a cópia dos exercícios no navegador era semeada UMA vez e lida para sempre — quem já tinha aberto o Laboratório nunca veria exercício novo. A leitura vem do código, e a cópia antiga é apagada | ✅ `exercicios-derivados.test.ts`
| LAB-4 | Veredito de dificuldade — ver L-7 | ✅ |
| LAB-5 | `earTrainingCorrect` zerado: a medição não distingue percepção auditiva, e creditar seria adivinhar | ⬜ |
| M-8 | **Domínio de notificação** — tipo, alvo, leitura, repositório por usuário | ⬜ |
| M-9 | `WorkDetailScreen` e `MusicGraphScreen` ainda têm obra e grafo escritos na tela | ⬜ |
| M-10 | 🔴 **O Estúdio deixou de ser fachada.** O editor mostrava um "Estudo Contrapontístico a Quatro Vozes" que ninguém escreveu, com notas decorativas e armadura/fórmula que só trocavam rótulo; o hub mandava para `/studio/project/arranjo-satb-coral`, projeto que não existe, e prometia "MusicXML e MIDI" sem exportar nada. Agora há o **caderno de partituras** (`caderno.ts`, `caderno.repository.ts`): escrever nota a nota com figura, alteração, oitava e pausa; tocar com a duração de cada figura; guardar em nome da pessoa; reabrir por `?id=`; excluir no hub; baixar MusicXML 3.1 e MIDI | ✅ `caderno-de-partituras.test.tsx` — XML lido por parser, MIDI conferido byte a byte |
| M-11 | Busca cobrir Atlas e Comunidade; as abas de categoria voltam aí | ⬜ |

## Fase B — o acervo está vazio — **REABERTA EM 19/09**

Medido em 18/09: **0 compositores**, **0 obras no Atlas**, 3 regiões, 4
partituras executáveis. "Escolher uma obra e jogar no simulador" não tem hoje
o que escolher.

**Reapurado em 19/09 — eu tinha dito que faltava recurso, e não falta.**

| recurso | estado |
| :--- | :--- |
| 20 capítulos de História da Música Ocidental, texto autoral | ✅ existe |
| 8 eras do Atlas, com os MESMOS slugs das competências do curso | ✅ existe, e já casam |
| 33 faixas de domínio público, com autor e período | ✅ existe |
| 4 partituras executáveis | ✅ existe |
| Plano de 5 fontes abertas com CORS, Wikidata como hub, domínio público calculado da data de morte | ✅ especificado em `docs/backend_specs/21.1` |
| Adaptadores dessas fontes | ⬜ **nenhum escrito** |
| `functions/api/sources/[source]/[[path]].ts` | ⬜ não existe |
| `CanonicalComposer` / `CanonicalWork` no domínio | ⬜ não existe |

O buraco não é de recurso. É que **o oleoduto do acervo foi especificado e
nunca construído**, e o Atlas nunca foi ligado ao curso que é a espinha dele —
embora os slugs de era já sejam os mesmos.

| # | Item | Estado |
|:---|:---|:---:|
| B-1 | **Compositores por era** — `HistoricalMaster` existe como tipo, sem um único registro | ⬜ |
| B-2 | **Obras** com áudio e, onde couber, partitura executável | ⬜ |
| B-3 | **Regiões** além das três de hoje | ⬜ |
| B-4 | **Mundos** = era × região, navegáveis | ⬜ |
| B-5 | **Ligar as faixas ao Atlas** — `DEFAULT_WORKS` era `never[] = []` enquanto o repertório já trazia 33 melodias com autor e período declarados. `seed-acervo.ts` deriva compositores e obras do que **já existe**, sem rede: a transcrição é nossa, logo a obra é EXPERIÊNCIA COMPLETA por construção | ✅ |
| B-6 | **`CanonicalComposer` / `CanonicalWork` no domínio**, com `PublicDomainAssessment`, `FieldProvenance` por campo, `ExternalScoreRef` com modo de renderização e `LocalizedText` | ✅ `src/domain/music-knowledge.ts` |
| B-6a | **O prazo brasileiro, provado.** Lei 9.610/98 art. 41: setenta anos a partir de 1º de janeiro do ano SEGUINTE ao da morte — ou seja `morte + 71`, e não `morte + 70`. Contar errado liberaria toda obra um ano antes. Testado no limite exato: quem morreu em 1955 já está livre em 2026, quem morreu em 1956 não | ✅ 20 casos |
| B-6b | **Só domínio público CERTO é reproduzido.** `LIKELY_PUBLIC_DOMAIN` não passa: "provável" é o estado de quem ainda precisa conferir, e publicar sobre provável transfere o risco da plataforma para quem confia nela. A ficha textual aparece para tudo, menos para o protegido | ✅ |
| B-6c | **A obra herda o domínio público DO COMPOSITOR**, e não da própria idade. Obra de 1890 de quem morreu em 1960 continua protegida; avaliar pela data da obra a liberaria por engano | ✅ |
| B-7 | **Porta e adaptador do Wikidata** — o eixo de reconciliação, com CORS aberto, sem chave e sem proxy. `fetch` injetado, porque adaptador que só se testa com internet é adaptador que ninguém testa | ✅ 17 casos |
| B-7a | ⚠️ **A consulta SPARQL NÃO foi reconferida ao vivo**: o ambiente onde ela foi escrita está sem rede. A `21.1 §4.2` registra a verificação empírica de 16/09 com retorno real, e é nela que confio — **conferir no navegador antes de publicar** | ⬜ |
| M-1 | **O Atlas como mapa que anda no tempo** — eixo horizontal cronológico; andar troca a era e as **regiões se repovoam**, porque é a própria região que declara em que eras tem presença. Nas pontas a navegação devolve `null`, e não a mesma era — senão a seta viraria botão morto | ✅ `atlas-map.ts`, 23 casos |
| M-2 | **Três tipos de marcador**: compositor (com ficha e compêndio), obra, e **movimento** — era + regiões + fundadores + gêneros. Filtrar por movimento mostra **os fundadores**, e não todo mundo que viveu na mesma era: senão o filtro devolveria o mapa inteiro | ✅ |
| M-3 | **Cada marcador diz o que se pode fazer com ele** — experiência, apenas pontuado, ou pontuado com fonte oficial. Derivado de `avaliarDisponibilidade`, e não decidido de novo: a regra mora num lugar só, que é o que impede duas telas de discordarem sobre a mesma obra | ✅ |
| M-4 | **Obra protegida APARECE no mapa**, pontuada e com link oficial — não escondida. O aluno de história precisa ver que ela existe naquela era e região | ✅ |
| M-5 | **Seis movimentos semeados**, com fundadores que existem no acervo. Teste cobra a ligação de ponta a ponta: id errado numa letra não quebra compilação e só apareceria na tela | ✅ 9 casos |
| M-6 | **Duas regiões novas** — Europa Oriental e Escandinávia. Chopin, Tchaikovsky e Grieg estavam no acervo sem região possível, e forçá-los para a Europa Ocidental seria escrever geografia errada para caber numa lista curta | ✅ |
| M-7 | **A tela do mapa** — o domínio monta a vista, conta a legenda e navega no tempo; nenhuma tela desenha isso ainda. É o próximo passo | ⬜ |
| M-8 | Escala, cadência, diapasão e melodia tradicional **não entram no mapa histórico**: não têm era, e atribuir uma seria fabricar historiografia. Continuam no player | ✅ registrado |
| B-6d | 🔴 **EU TINHA COLADO DOIS EIXOS QUE NÃO SE ANULAM.** `podeListarFicha()` devolvia `false` para obra protegida — o acervo **escondia** o que não podia reproduzir. Catalogar é registrar que a obra existe; oferecer a experiência é renderizar partitura e tocar áudio. **Só o segundo é limitado por lei.** Um catálogo que só registrasse o que pode tocar ficaria mutilado, sem quase nada do século XX | ✅ |
| B-6e | **`ModoDeAcesso`**: `EXPERIENCIA_COMPLETA` ou `SOMENTE_CATALOGO`, com **motivo obrigatório** — "indisponível" sozinho deixa o aluno sem saber se o problema é a lei, a falta de edição ou algo provisório | ✅ |
| B-6f | **`linkOficial()`** — aponta para a **página** do IMSLP, Mutopia, MusicBrainz, Commons ou Wikidata, na ordem de quem tem a edição. Linkar página é o que todo catálogo faz; o `robots.txt` proíbe **rastrear** `/images/`, que é baixar e não citar. Sem identificador, não inventa link | ✅ |
| B-6g | **A §11.5 e a §11.7 da `21.1` diziam "nenhum link para fora".** Corrigido em §11.4-bis: a proibição vale para o **fluxo de estudo** — não interromper quem está numa lição —, e não para a ficha de catálogo, onde omitir onde a obra está seria esconder informação de quem veio procurá-la | ✅ |
| B-6h | Dois verificadores novos: `checkAcervoCatalogaTudo` (a listagem não pode voltar a filtrar por licença) e `checkDisponibilidadeTemMotivo` (toda saída explica). Cobertos ponta a ponta | ✅ |
| B-6i | **Ficha de obra na tela** — `ObraScreen` mostra o modo, o motivo e o link oficial da disponibilidade (curado em 2026-09-22) | ✅ |
| B-7b | Adaptadores de **Open Opus, MusicBrainz, Commons, Internet Archive e Mutopia** — a porta está pronta e cada um é uma implementação dela | ⬜ |
| B-7c | **Mutopia é a fonte de partitura**, e não o IMSLP: o `robots.txt` do IMSLP proíbe `/images/` e `/imglnks/`, que é exatamente onde os PDFs ficam. Obra livre não autoriza rastrear o servidor de ninguém. Mutopia dá LilyPond e MIDI — **símbolo**, que a plataforma renderiza nativamente | ⬜ |
| B-7d | **`MusicKnowledgeService`** — nenhum adaptador escreve no domínio; todos devolvem candidatos e a reconciliação os põe lado a lado. Discordância de data de morte vira **conflito registrado** e derruba a confiança, em vez de ser resolvida em silêncio. Fonte fora do ar não derruba a ingestão | ✅ 27 casos |
| B-7e | **`music-knowledge.repository`** — acervo como conteúdo publicado, em chave própria, com cache por fonte e prazo de um mês. Busca por identificador externo impede o acervo de duplicar o mesmo compositor a cada ingestão | ✅ |
| B-7f | **Tela de ingestão no console** — o serviço existe e ninguém consegue dispará-lo pela interface | ⬜ |
| B-7g | Ligar o acervo canônico ao `atlas.repository` (hoje são dois modelos de obra) e à tela do Atlas | ⬜ |
| B-7 | Adaptador de Open Opus e de Wikidata — as duas com CORS aberto, sem proxy e sem chave | ⬜ |
| B-8 | Cada capítulo do curso de história terminando na coleção de obras daquela era (`21.1 §10.7`) | ⬜ |

## Fase C — seções e níveis

Estrutura definida em `77`. Hoje o percurso deriva da gramática; falta a camada
de seção e de nível.

| # | Item | Estado |
|:---|:---|:---:|
| C-1 | **Seção = competência do capítulo**, derivada do sumário e nunca escrita à parte | ⬜ |
| C-2 | **Níveis 0–4** como recorte da gramática — reconhecer, nomear, aplicar, ouvir, executar | ⬜ |
| C-3 | **Quadro geral da seção** com todos os níveis à vista, inclusive os fechados | ⬜ |
| C-4 | **Densidade sem arredondamento** — e um teste que falhe se alguém fixar em dez | ⬜ |
| C-5 | Ordenação pela numeração do capítulo, entre e dentro de seções | ⬜ |

## Fase D — recompensas e passaporte

Catálogo em `78`. Nada aqui entra antes de a Fase B existir: marco sobre
contador que não se mede é marco falso.

| # | Item | Estado |
|:---|:---|:---:|
| D-1 | **Catálogo de contadores** — só o que a plataforma mede de verdade | ⬜ |
| D-2 | **Tempo de simulador**, em minutos, somado por sessão. A métrica que falta e a mais reveladora | ⬜ |
| D-3 | **Réguas ascendentes** — 5, 10, 25, 50, 100 — com multiplicador de XP | ⬜ |
| D-4 | **Emblemas** e **carimbos**, com carimbo de compositor que soma em vez de duplicar | ⬜ |
| D-5 | **Tela do passaporte** — vazia mostra a forma, nunca carimbo de exemplo | ⬜ |
| D-6 | **Admin**: ligar, desligar, editar e criar marco sobre contador existente | ⬜ |
| D-7 | A pessoa escolhe o que expõe no perfil; esconder não apaga do passaporte | ⬜ |
| D-8 | Ranking por obra e por tour — não zeram, e é contra eles que se refaz a obra | ⬜ |

## Fase E — ferramentas do Laboratório

Ordem de `79 §7`: da que destrava mais para a que destrava menos.

| # | Item | Estado |
|:---|:---|:---:|
| E-1 | **Teste de microfone** — destrava 4 tipos de exercício e todos os simuladores | ⬜ |
| E-2 | **Metrônomo que mede** — grava a batida, devolve desvio em ms por tempo (era `P.5`) | ⬜ |
| E-3 | **Afinador** — cents com sinal, referência ajustável, temperamento | ⬜ |
| E-4 | **Caderno: escrever e tocar** — ver M-10. Uma voz; ligadura, ponto e quiáltera ainda não | ✅ |
| E-5 | **Caderno: pastas, salvar e baixar.** Salvar e baixar em MusicXML e MIDI vieram com o M-10; agora há **pastas**: campo livre no editor, com as pastas já usadas sugeridas; no hub o caderno aparece agrupado por pasta ("sem pasta" por último), com filtro. Pasta não é condição para guardar | ✅
| E-6 | **Remover a fachada** de `ScoreEditorScreen` — botão morto e promessa de MusicXML/MIDI que não existe | ✅ |
| E-8 | **Remover a fachada** de `DawProjectScreen` — slider de volume CONTROLADO com `onChange` vazio (o aluno arrastava e o React devolvia), botão "Adicionar Pista" morto, e "formatos de exportáção suportados: WAV 24-bit 48kHz, FLAC, MIDI 2.0 e MusicXML" — nenhum produzido em lugar nenhum do código | ✅ |
| E-9 | 🔴 **A mesa de áudio deixou de ser vitrine.** Eram quatro pistas "SATB" fixas, transporte que só mudava de cor, relógio parado em 00:01:24, desfazer sem ação e onda desenhada por fórmula. Agora: gravar do microfone em cada pista, com as OUTRAS tocando como guia; tocar as audíveis juntas, no mesmo instante, com volume, mudo e solo de verdade; relógio que anda; forma de onda tirada das amostras; exportar a mixagem em WAV; projetos guardados (texto no armazenamento local, áudio no IndexedDB) e listados no hub. Achado no caminho: trocar de rota ao salvar REMONTAVA a tela no meio da digitação — "Coro" gravava "Co" | ✅ `mesa-de-audio.test.tsx`
| E-7 | Escrever partitura a partir de uma obra do Atlas e comparar com a referência | ⬜ |

## Fase F — o nome

| # | Item | Estado |
|:---|:---|:---:|
| F-1 | **"Practice" fora de todo texto de interface** — o nome é Laboratório | ⬜ |
| F-2 | Rotas `/practice/*` — decidir o nome. **Não é `/laboratorio`**: Laboratório é unidade de atividade, e há vários. Ver `80 §6` | ⬜ |
| F-3 | Verificação que falhe se "Practice" voltar a aparecer em tela | ⬜ |

## Fase G — o que o admin ainda não consegue editar

Levantado em 18/09, respondendo à sua pergunta direta.

| # | Item | Estado |
|:---|:---|:---:|
| G-1 | **Editar as questões** — o editor de livretos edita enunciado e alternativas das 378 questões, e o pacote as leva (EE-17, EE-18) (curado em 2026-09-22) | ✅ |
| G-2 | **Criar lição nova** — EE-22b (curado em 2026-09-22) | ✅ |
| G-3 | Editar os tipos de bloco — o editor de `/founder/licoes` cobre os 19 tipos, musicais inclusive (EE-2, BL-1) (curado em 2026-09-22) | ✅ |
| G-4 | Editar simulados e provas | ⬜ |

## Fase H — qualidade do ferramental

| # | Item | Estado |
|:---|:---|:---:|
| H-1 | ~~`checkDeadButton` e handler em objeto de props~~ — **movido para X-5**, junto do resto da auditoria | ➡ |
| H-2 | Verificações de `78 §8`: marco só sobre contador medido, XP de marco = base × multiplicador, carimbo sem duplicata | ⬜ |
| H-3 | Verificação de densidade: falhar se seção for arredondada para número redondo | ⬜ |

## Fase I — infraestrutura e publicação

Continua como está na seção **I** mais abaixo, sem mudança: domínio, GitHub,
Cloudflare, OAuth de produção, subdomínio de admin, escopo `drive.file`,
cliente Android, e-mail institucional. Depende de você em vários pontos.

### Pendências de infraestrutura — Cloudflare (adiado por decisão, 2026-09-23)

Não configurar agora: o projeto não terminou. O que ficará pendente quando for a hora:

| # | Item | Estado |
|:---|:---|:---:|
| I-CF-1 | Criar o namespace KV `RELATOS` e ligá-lo ao projeto Pages (instruções em `.env.example`). Sem ele, `POST /api/v1/relatos` responde "armazenamento não configurado", e a tela diz isso com honestidade (L-7a) | ⛔ |
| I-CF-2 | Variáveis de produção da assinatura de sessão e da lista de administração no painel do Pages; conferir `/api/v1/admin/verify` com a sessão real | ⛔ |
| I-CF-3 | Persistência durável (D1 ou KV) para o que hoje é só do navegador: contas, perfil, progresso, caderno, salas. Ver AUD-20. Sem isso, nada passa de um aparelho para outro | ⛔ |
| I-CF-4 | Domínio e subdomínio de admin; cabeçalhos de segurança (`_headers`) validados no ar | ⛔ |

## AUDITORIA DAS TRÊS PESSOAS — 2026-09-23

Todas as rotas foram abertas como visitante, aluna e administração, pelo roteador de verdade e com a guarda de audiência:
98 rotas × 3 pessoas (`tests/ui/auditoria-de-audiencias.test.tsx`). **Nenhuma rota quebra.** Nenhuma dá 404 a quem pode estar
nela. `/founder/*` só abre para a administração. Nenhuma rota `exigeLogin` mostra conteúdo a visitante. As lacunas abaixo
não aparecem como erro; aparecem quando se segue o fluxo.

### Visitante

| # | Item | Estado |
|:---|:---|:---:|
| AUD-1 | 🔴 **O Estúdio contradiz a audiência.** `audiencia.ts` declara `/studio*` como `exigeLogin`, mas as telas foram escritas para visitante (convite, "funciona sem conta"). Esse conteúdo é inalcançável. Decidir: abrir o Estúdio ao visitante, com rascunho local, ou apagar o texto de visitante | ⬜ |
| AUD-2 | `/design-system` é público em produção. Deve ficar atrás de `import.meta.env.DEV` ou de `exigeAdmin` | ⬜ |
| AUD-3 | `/academia/academic-profile` é público e diz ao visitante "Membro Oficial • Identidade Auditada pela Cátedra". A rota precisa de uma versão de visitante ou de `exigeLogin` | ⬜ |
| AUD-4 | `/academia/activity/:id` com um id inexistente fica **carregando para sempre**, nas três pessoas. Falta o estado "não encontrada" | ⬜ |
| AUD-5 | A tela de Ajuda promete avaliação "pelo docente da sua cátedra", e esse fluxo não existe | ⬜ |

### Aluna (usuária logada)

| # | Item | Estado |
|:---|:---|:---:|
| AUD-6 | 🔴 **Configurações não salvam.** "Salvar Preferências" (`handleSave`) só mostra "Configurações Salvas" e não persiste nada. Os interruptores de acessibilidade não têm efeito | ⬜ |
| AUD-7 | 🔴 **Números inventados no perfil unificado** (`profile.service.getUnifiedProfile`): 32 horas de estudo, 15 sessões, sequência de 3 dias, recorde de 14, 8 conexões. Devem vir do histórico de prática ou sumir | ⬜ |
| AUD-8 | A privacidade do perfil diz "atualizadas no servidor!", mas grava em localStorage. Corrigir o texto (ou a gravação, com I-CF-3) | ⬜ |
| AUD-9 | **Salas: sem fluxo de turma.** Existe criar e ver, mas não existe entrar/matricular, publicar tarefa, publicar aviso ou entregar trabalho. Como as salas são locais, outra pessoa não consegue entrar nelas | ⬜ |
| AUD-10 | Notificações: a própria tela diz que a plataforma não emite nenhuma. Falta decidir o que emite (tarefa, certificado, relato respondido) | ⬜ |
| AUD-11 | `/worlds/work/:id` e `/worlds/graph` ainda são dados fixos (mesmo defeito de M-9) | ⬜ |

### Administração

| # | Item | Estado |
|:---|:---|:---:|
| AUD-12 | **Usuários:** o painel promete atribuir papéis e homologar. Na prática lista só as contas deste navegador e não tem ação nenhuma | ⬜ |
| AUD-13 | **Conteúdo:** o painel promete homologação, mas a tela é só leitura. A edição real está no editorial (EE-*); o cartão deve apontar para lá ou a homologação deve existir | ⬜ |
| AUD-14 | **Moderação:** o cartão existe, e a própria tela diz que a moderação não existe. Tirar o cartão ou construir a fila (relatos L-7b são o começo natural) | ⬜ |
| AUD-15 | **Auditoria:** a tela diz "imutável/criptográficos", mas lê a trilha local do navegador. O servidor tem `GET /api/v1/admin/audit-logs` e `adminService` sabe chamá-lo, mas nenhuma tela usa. Ligar a tela ao servidor e corrigir o texto | ⬜ |

### Vazamento de dados e sessão

| # | Item | Estado |
|:---|:---|:---:|
| AUD-16 | ✅ Nenhum vazamento entre pessoas pelas rotas. A projeção do perfil respeita a visibilidade. Os endpoints de admin exigem sessão de admin. As ferramentas de desenvolvimento (incluindo "Estados UI") ficam atrás de `import.meta.env.DEV`. O e-mail do autor de um relato só aparece para a administração | ✅ |
| AUD-17 | 🔴 **Sair não limpa os dados.** O logout apaga só a sessão; ficam no localStorage `users_collection` (com e-mails), perfis, prática, caderno e mesa (IndexedDB). Em aparelho compartilhado, a próxima pessoa lê tudo pelo DevTools. Oferecer "sair e apagar os dados deste aparelho" e não guardar e-mail alheio em claro | ⬜ |
| AUD-18 | O editor de partitura e a Mesa checam `(userId && p.autorId !== userId)`: **sem sessão a checagem passa**, e qualquer id abriria. Hoje isso não tem efeito porque `/studio` é `exigeLogin`, mas vira falha no dia em que AUD-1 abrir o Estúdio. Trocar por "sem sessão ⇒ só rascunho local próprio" | ⬜ |

### Acervo — o que a mineração no MusicBrainz rendeu

| # | Item | Estado |
|:---|:---|:---:|
| AUD-19 | A mineração **terminou**: 11.447 consultas (5.928 com resultado, 5.519 vazias) e aliases para 2.330 obras em `src/data/acervo/alias.json`. **Efeito:** o casamento com o IMSLP foi de 11.075 para 11.269 (+194). Hoje 16.820 de 31.952 obras (52,6%) têm endereço de partitura (IMSLP 11.269 · Música Brasilis 6.917 · Mutopia 181 com arquivo). Nenhum arquivo foi baixado (robots.txt). 🔴 **Lacuna:** os ids de obra do MusicBrainz (`mb`) nunca chegam a `externalIds.musicbrainz` do produto; `alias.json` só é lido pelo script offline `scripts/casar-imslp.ts`. Ligar os ids às obras e mostrar o link na ficha | ⬜ |

### Estrutural

| # | Item | Estado |
|:---|:---|:---:|
| AUD-20 | 🔴 **Não há persistência durável.** Contas, perfis, progresso, certificados, caderno, mesa e salas vivem no navegador. Trocar de aparelho ou limpar o navegador perde tudo, e salas/relatos entre pessoas não funcionam de verdade. Depende de I-CF-3 | ⛔ |

---
