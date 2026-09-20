# CLAUDE_TODO.md — Backlog de Engenharia

**Origem:** diagnóstico do COMANDO 0 (`CLAUDE_AUDIT.md`)
**Atualizado:** 2026-09-18
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

### As sete perguntas — apuradas em 2026-09-20

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
| Estúdio | 9/10 | integrado |

### Fila, na ordem em que deve ser resolvida

> A ordem é por **peso da pergunta**, e não por área. Consertar fora dela
> significa proteger o que ninguém alcança, e curar o conteúdo de uma tela
> que ainda não abre.

| # | Peso | Área | Pergunta | O que falta |
| :--- | :---: | :--- | :--- | :--- |
| 1 | 5 | Estúdio | Está integrado? | nenhuma chamada a serviço ou repositório |

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
| L-7 | `recordVerdict` e `verdictsForUser` do percurso: gravam e leem veredito de exercício, e **ninguém chama nenhum dos dois**. O botão de "achei fácil / achei difícil" não existe na tela | ⬜ |
| L-8 | `atlasRepository.salvarObra` órfão — nada no produto grava obra no Atlas. É o que `B-5` vai usar | ⬜ |
| L-9 | 9 métodos mortos em `academy.service` (`submitAssessment`, `submitActivity` e outros) são **duplicatas** das versões `*Attempt` que funcionam. Superfície não verificada, confunde quem lê | ⬜ |
| L-10 | `earTrainingCorrect` fica zerado: a medição distingue ACOUSTICS de SIMBÓLICA, e nenhuma das duas é percepção auditiva. A missão correspondente não avança — que é a verdade até a sessão carregar o tipo do exercício | ⬜ |
| L-11 | **Modo Casa no Atlas** — `filtrosDoModoCasa` existe no domínio e a tela do Atlas ainda não o usa para recortar por Casa | ⬜ |
| S-5 | **Tela de admin** para editar questão e criar lição: o domínio existe, a interface não | ⬜ |
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
| A-1 | **Rotas para as oito telas** — exercício, encerramento, percurso, liga, matrícula, missões, réguas, ofensiva | ⬜ |
| A-2 | **Persistência do que elas produzem** — nós concluídos, meta de ofensiva, veredito de dificuldade. `practice-path.repository.ts` já existe e não é chamado por ninguém | ⬜ |
| A-3 | **Gerador de exercícios** a partir das 21 dimensões. Sem ele o percurso tem forma e não tem conteúdo | 🔄 `exercise-generator.ts` cobre 6 dimensões nos níveis 0, 1 e 3 · faltam 15 dimensões e os níveis 2 e 4 |
| A-4 | Contêiner que costura percurso → lição → encerramento → mapa atualizado | ⬜ |

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
| M-16 | Ficha de obra em tela de detalhe — `fichaDaObra` existe no serviço e nenhuma rota a abre | ⬜ |
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
| AC-1i | `/score?obra=` e `/practice?obra=` — as duas telas ainda **ignoram** o parâmetro | ⬜ |
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
| AC-4d | **Engine de artigos na tela de admin** — o domínio existe, os dois artigos existem, e não há tela para criar nem editar | ⬜ |
| AC-4e | **Tela de leitura do artigo** e a seção de artigos no Acervo | ⬜ |
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
obras no catálogo      24.957
compositores              225   (eram 234, com 9 duplicados)
partituras a resolver   1.169   (era 1.349 = sintoma de catálogo fora)
com biografia             225
com retrato               220
com região                221

Bach: 978 obras · retrato · biografia autoral, no MESMO registro
```

**A tela foi conferida com o servidor de verdade**: banner com "24.957", listagem
com "24.957 resultados · página 1 de 1.040", nenhum aviso de falha, 24 cards na
primeira página.

✅ 1.974 testes · 0 bloqueios · build `exit=0` · `tsc` limpo

---

## O QUE FALTA, SEM RODÉIO

| | Estado |
|---|---|
| **Laboratório** | ❌ Corrigi apenas o fato de ele **abrir**. A tela documentada — banner hero, navbar fixa com as lições, práticas das Casas, mapa de expedições — **não foi construída**. Não está perto, e dizer o contrário seria mentira |
| **Migração para a ontologia** | ❌ Os 24.957 registros ainda são `CanonicalComposer`/`CanonicalWork`. `Pessoa`/`Obra` existem como **tipo**, testados, e não é onde os dados vivem (ON-10) |
| **Simulador ponta a ponta** | ❌ Nenhuma peça foi levada até o fim. Não há leitor de MIDI nem de LilyPond |
| **Música Brasilis** | 🟡 em ingestão — ver MB-1 |

---

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
| BI-9 | **Falta a tela de leitura do artigo.** A listagem existe e abrir um artigo ainda não leva a lugar nenhum | ⬜ |

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
| LAB-1 | **15 das 21 dimensões sem gerador** — o Laboratório funciona sobre um sexto do vocabulário que a arquitetura define | ⬜ |
| LAB-2 | **2 dos 5 níveis não são renderizáveis** | ⬜ |
| LAB-3 | Conteúdo semeado fino: 5 árvores, 5 competências, 10 exercícios | ⬜ |
| LAB-4 | `recordVerdict` e `verdictsForUser` órfãos — o botão de "achei fácil / difícil" não existe na tela | ⬜ |
| LAB-5 | `earTrainingCorrect` zerado: a medição não distingue percepção auditiva, e creditar seria adivinhar | ⬜ |
| M-8 | **Domínio de notificação** — tipo, alvo, leitura, repositório por usuário | ⬜ |
| M-9 | `WorkDetailScreen` e `MusicGraphScreen` ainda têm obra e grafo escritos na tela | ⬜ |
| M-10 | `StudioHubScreen` e `ScoreEditorScreen` — fachadas, ver `79` | ⬜ |
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
| B-6i | **Ficha de obra na tela** — o domínio sabe dizer o modo, o motivo e o link, e nenhuma tela mostra isso ainda | ⬜ |
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
| E-4 | **Caderno: escrever e tocar** — base em biblioteca aberta madura, áudio pelo motor único | ⬜ |
| E-5 | **Caderno: pastas, salvar, baixar** em MusicXML e MIDI | ⬜ |
| E-6 | **Remover a fachada** de `ScoreEditorScreen` — botão morto e promessa de MusicXML/MIDI que não existe | ✅ |
| E-8 | **Remover a fachada** de `DawProjectScreen` — slider de volume CONTROLADO com `onChange` vazio (o aluno arrastava e o React devolvia), botão "Adicionar Pista" morto, e "formatos de exportáção suportados: WAV 24-bit 48kHz, FLAC, MIDI 2.0 e MusicXML" — nenhum produzido em lugar nenhum do código | ✅ |
| E-9 | As quatro pistas SATB de `DawProjectScreen`, o Play e o Rec ainda são estado local sem motor de áudio. A tela agora **diz** isso; continuam a ser fachada até `E-1`..`E-4` | ⬜ |
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
| G-1 | **Editar as 174 questões** — a camada editorial cobre bloco e título de seção, e deixa questão de fora | ⬜ |
| G-2 | **Criar lição nova** a partir das estruturas existentes — não há função de criação em lugar nenhum | ⬜ |
| G-3 | Editar os tipos de bloco que o `BlockEditor` não cobre — hoje só MARKDOWN, CALLOUT, CHECKPOINT e SLIDES | ⬜ |
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

---
