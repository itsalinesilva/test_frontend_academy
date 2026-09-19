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

### As sete perguntas — apuradas em 2026-09-19

> **Esta seção é escrita por máquina.** Não edite à mão: o próximo `qa:todo`
> sobrescreve. O que foi resolvido sai sozinho; o que apareceu entra sozinho.

| Área | Respondidas | O que falta |
| :--- | :---: | :--- |
| Academia | 10/10 | — |
| Laboratório | 10/10 | — |
| Atlas | 9/10 | acervo |
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
| 1 | 9 | Atlas | Tem acervo? | sem obras e compositores — a área é uma moldura |
| 2 | 5 | Estúdio | Está integrado? | nenhuma chamada a serviço ou repositório |

### O que estas sete perguntas NÃO respondem

Se a tela está **boa**. Desenho, texto certo no contexto e fluxo que leva ao
lugar certo continuam precisando de navegador e de olho humano — `F.2`.

<!-- PRONTIDAO:FIM -->

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
| X-5 | `checkDeadButton` não vê handler dentro de objeto de props — `onAction: () => {}` passou batido | ⬜ |
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
| M-7 | **Denúncia no fórum** — botão, registro, fila e trilha de auditoria | ⬜ |
| M-8 | **Domínio de notificação** — tipo, alvo, leitura, repositório por usuário | ⬜ |
| M-9 | `WorkDetailScreen` e `MusicGraphScreen` ainda têm obra e grafo escritos na tela | ⬜ |
| M-10 | `StudioHubScreen` e `ScoreEditorScreen` — fachadas, ver `79` | ⬜ |
| M-11 | Busca cobrir Atlas e Comunidade; as abas de categoria voltam aí | ⬜ |

## Fase B — o acervo está vazio ⏸ **ADIADA POR DECISÃO DE 19/09**

Medido em 18/09: **0 compositores**, **0 obras no Atlas**, 3 regiões, 4
partituras executáveis. "Escolher uma obra e jogar no simulador" não tem hoje
o que escolher.

| # | Item | Estado |
|:---|:---|:---:|
| B-1 | **Compositores por era** — `HistoricalMaster` existe como tipo, sem um único registro | ⬜ |
| B-2 | **Obras** com áudio e, onde couber, partitura executável | ⬜ |
| B-3 | **Regiões** além das três de hoje | ⬜ |
| B-4 | **Mundos** = era × região, navegáveis | ⬜ |
| B-5 | Ligar as 33 faixas do player e as 4 partituras ao Atlas | ⬜ |

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
| E-6 | **Remover a fachada** de `ScoreEditorScreen` — botão morto e promessa de MusicXML/MIDI que não existe | ⬜ |
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
