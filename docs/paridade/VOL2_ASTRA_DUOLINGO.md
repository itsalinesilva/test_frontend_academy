# Paridade · Volume 2 — Astra Trainer e Duolingo

> **Mapeado a partir de capturas de tela reais**, enviadas em 18/09/2026, tela
> por tela, com a URL de cada uma.
>
> **Por que isto importa mais do que parece.** O Volume 1 foi escrito de
> memória, sem acesso à plataforma de referência, e afirmou paridade que não
> podia ter sido verificada. Este volume não repete o erro: cada linha abaixo
> descreve **o que aparece numa captura**. Onde não há captura, está escrito
> que não há.
>
> Volume 1: `VOL1_COURSERA.md` — arquitetura de aprendizagem estruturada.
> Este volume: **prática, progressão e competição.**

---

## Decisão de produto que atravessa o documento inteiro

Dito textualmente por quem decide o produto:

> *"Não quero algo INFANTIL como é o UI/UX do Duolingo. O Astra Trainer é bem
> mais sóbrio e sério. MAS no modo KIDS pode sim fazer uma paridade total de
> Duolingo combinando o Astra."*

Portanto, para cada capacidade abaixo:

| Coluna | Significa |
|---|---|
| **Adotar** | A capacidade entra no Practice |
| **Forma adulta** | Como ela se apresenta no Conservatório — sóbria |
| **Forma Kids** | Como ela se apresenta no modo infantil — pode ser lúdica |

A capacidade é a mesma; o vestuário muda. **Kids é restrito, não
simplificado** — a restrição é de alcance, não de qualidade.

---

# PARTE A — Astra Trainer

## A1 · `/auth` — entrada

**O que a captura mostra:** ilustração do mascote ocupando a metade
esquerda, escura, com lanterna. À direita: logo, sobretítulo
`WELCOME TO ASTRA!`, manchete em duas linhas, botão primário **Get Started**,
separador `ALREADY A CLIENT?`, botão secundário branco **Log In**, e o rodapé
`Terms of Service and Privacy Policy`.

| Capacidade | Estado no Conservatório | Ação |
|---|---|---|
| Duas portas separadas — criar conta e entrar | ◑ `/auth/login` e `/auth/register` existem, mas **sem tela de escolha** | Avaliar: a separação ajuda quem volta |
| Ilustração de metade de tela | ❌ | **Não adotar.** Forma A `focus` já resolve, e ilustração grande empurra o formulário |
| Termos e privacidade no rodapé | ◑ Há menção, sem endereço real | Depende de `I.2` — domínio |

> **Observação honesta:** a entrada do Conservatório é mais simples de
> propósito — só Google, sem senha. A porta dupla do Astra existe porque ele
> tem cadastro próprio. Copiar a estrutura sem ter o motivo dela seria
> paridade de aparência.

## A2 · `/landing` — passagem antes do cadastro

**O que as capturas mostram:** cinco etapas. No topo, cinco traços indicando
a posição; à direita, botão **Skip**. Cada etapa tem manchete, corpo em duas
ou três frases com trechos em negrito, uma animação curta em laço, e botão
**Continue** fixo embaixo.

| Etapa | Conteúdo | Elemento notável |
|---|---|---|
| 1 | "Unlock the hidden logic behind life's patterns!" | Objetos flutuando em círculo |
| 2 | "From theory to transformation!" | Grafo de nós conectados com marcas de concluído |
| 3 | "Stay motivated!" | **Semana S M T W T F S** com dois dias marcados, e selo de chama **"2 days"** |
| 4 | Conversa com o mascote (Astrix) | **Lista de mensagens rolável**, cada uma assinada |
| 5 | — | (não capturada) |

| Capacidade | Estado | Ação |
|---|---|---|
| Passagem de apresentação em etapas | ❌ | **Adotar.** Hoje o visitante cai direto na Home |
| Indicador de posição + **Skip** | ❌ | **Adotar.** Pular é respeito por quem já decidiu |
| Animação curta em laço por etapa | ❌ | Adotar **na forma sóbria**: o diagrama do Atlas, não personagem |
| Prévia da semana de ofensiva | ❌ | **Adotar** — antecipa o mecanismo antes de pedir cadastro |
| Conversa com mascote | ❌ | **Kids apenas.** Na forma adulta, texto institucional |

## A3 · Escolha da disciplina inicial

**O que a captura mostra:** título `Choose your starting discipline`, seletor
`Language [English]`, grade de cinco cartões brancos — Tarot, Astrology,
Kabbalah, Runes, Numerology —, cada um com o mascote vestido conforme a
disciplina. Botão `Log Out` embaixo.

| Capacidade | Estado | Ação |
|---|---|---|
| Escolher a trilha inicial no cadastro | ❌ | **Adotar.** Hoje o aluno cai no catálogo inteiro e decide sozinho |
| Seletor de idioma no cadastro | ❌ | Registrar; depende de haver segundo idioma |
| Sair de dentro do cadastro | ✅ | Já existe |

> No Conservatório as cinco disciplinas do Astra correspondem aos **cursos**:
> Teoria, História Ocidental, História Brasileira, História Social da Popular,
> Violino.

## A4 · Modelo de aprendizagem

**O que a captura mostra:** pergunta `Which learning way fits your experience
best?` e dois cartões:

- **Step-by-Step Learning** — "Unlock lessons step by step, building a solid foundation along the way."
- **Flexible Learning** — "Gain instant access to all lessons and explore them at your own pace."

Abaixo: `You can change this setting anytime in your profile.` e botão
**Let's Go!**

| Capacidade | Estado | Ação |
|---|---|---|
| Escolher entre progressão travada e livre | ❌ | **Adotar.** É decisão de produto real, e muda o desbloqueio de lição |
| Dizer que dá para mudar depois | ❌ | **Adotar** — reduz o peso da escolha |
| Refletir a escolha no Perfil | ❌ | **Adotar** (ver A6) |

> Esta é, das capacidades do Astra, **a mais importante que falta**: ela
> governa se a lição 7 abre antes da 6.

## A5 · `/overview` — a Home do curso

**O que a captura mostra:**

- **Barra de navegação:** logo · `Course` · `Lessons` · `Bookmarks` · `Articles` · `Profile` · ícone de brilho
- **Cartão de perfil fixo, canto superior direito:** avatar, nome, e três contadores — gota, coroa, losango
- **Banner de destaque:** mascote grande e saudação personalizada com o nome
- **Faixa "Current Course":** o curso ativo em destaque, os demais esmaecidos, na mesma linha
- **"Let's start!":** cartão do próximo item com selo `Tap to start`
- **"This might be interesting for you":** cartão de aplicativo móvel e cartão de presente

| Capacidade | Estado | Ação |
|---|---|---|
| Barra de navegação com as áreas | ✅ | Existe |
| Cartão de perfil fixo com contadores | ❌ | **Adotar** — ofensiva, pontuação, pontuação semanal |
| Saudação personalizada com nome | ◑ Existe na Home do aluno | Manter |
| Faixa do curso ativo, com os outros ao lado | ❌ | **Adotar.** Troca de curso sem sair da tela |
| Cartão "continuar de onde parou" | ✅ | Existe na Home |
| Cartão de aplicativo móvel | ❌ | Só quando houver aplicativo (`I.8`) |
| Cartão de presente | ❌ | Depende de haver cobrança |

> **`Profile` na barra abre o mesmo que o cartão do canto.** Duplicação
> observada na captura. **Não reproduzir.**

## A6 · Perfil

**O que as capturas mostram, em ordem:** avatar, nome, e-mail · três métricas
lado a lado — `Total Score`, `Weekly Score`, `Your Rank` · linha de conquistas
`0 of 44 My Achievements` com fileira de emblemas em cinza · `View Rating >` ·
e a lista: `Manage Profile` · `Purchases` · `Collections` · `Change Password`
· `Learning [Step-by-Step Learning]` · `Language [English]` ·
`Support [English Only]` · `Terms of Service` · `Privacy Policy` · `Log Out`.

| Capacidade | Estado | Ação |
|---|---|---|
| Pontuação total, semanal e posição | ❌ | **Adotar** |
| `N de M` conquistas, com os emblemas visíveis mesmo bloqueados | ❌ | **Adotar.** Ver o que falta é o que motiva |
| Atalho para a classificação | ❌ | **Adotar** |
| Ajuste do modelo de aprendizagem no perfil | ❌ | **Adotar** (par de A4) |
| Idioma e idioma de suporte, separados | ❌ | Registrar |
| Compras | ❌ | Depende de cobrança |
| Coleções | ❌ | Equivale a **Bookmarks** — ver A8 |

## A7 · Tela do curso

**O que a captura mostra:** grade de cartões de módulo, cada um com número no
canto (`04`…`13`), ícone, título, `0 / 14 lessons completed` e barra de
progresso. Alguns módulos com contagens altas — 144, 123, 151 lições.

Abaixo, seção **"Test your knowledge"**: *"All knowledge requires practice.
Here, you'll train your mind to recognize patterns, understand meanings, and
make connections."* — com cartões **com cadeado**: `Astrology Essentials`,
`Astrological Combinations`.

| Capacidade | Estado | Ação |
|---|---|---|
| Módulos numerados, com progresso por módulo | ◑ `CourseCurriculumScreen` mostra a grade, sem numeração nem barra | **Adotar** |
| `N / M lições concluídas` por módulo | ❌ | **Adotar** |
| **Seção de prática dentro do curso, com cadeado** | ❌ | **Adotar — é a costura Academy ↔ Practice** |
| Cadeado com motivo visível | ◑ `LockedState` existe | Ligar ao desbloqueio real |

> **Este é o achado mais importante do Astra:** a prática não é uma área
> separada — ela aparece **dentro do curso**, no fim da grade, como o passo
> seguinte ao estudo. É o que resolve a pergunta "onde o Practice se encaixa".

## A8 · `/bookmarks`

**O que a captura mostra:** estado vazio, ícone de marcador e a frase
*"Press the bookmark icon on a lesson page to save it here."*

| Capacidade | Estado | Ação |
|---|---|---|
| Salvar lição e reencontrá-la | ◑ Há anotações no Academy; **marcador de lição não** | **Adotar** |
| Estado vazio que **ensina como usar** | ❌ | **Adotar** — é o melhor estado vazio das capturas |
| Catalogar por curso, seção e filtro | ❌ | **Adotar** |

## A9 · `/articles`

**O que a captura mostra:** abas por disciplina — Tarot, Astrology, Runes,
Numerology, Kabbalah —, sub-filtros em cápsula — Major Arcana, The Cups, The
Pentacles, The Swords, The Wands —, e grade de imagens com título sobreposto.

| Capacidade | Estado | Ação |
|---|---|---|
| Acervo de artigos navegável | ◑ Há a Biblioteca, **sem versão pública** | **Adotar na Biblioteca**, não em tela separada |
| Abas por disciplina + sub-filtro | ❌ | **Adotar** |
| Grade visual com capa | ❌ | Adotar em forma sóbria |
| **Redigir artigo e livro no Admin, em formato publicável** | ❌ | **Adotar — pedido explícito** |

> Decisão registrada: *"podemos deixar essa tela na biblioteca do
> conservatório, pra isso você tem que deixar uma versão pública da
> biblioteca, com aviso de que não há conteúdo publicado."*

## A10 · Lição

**O que as capturas mostram:** cabeçalho com `X` de fechar, título `Saturn`,
ícone de marcador à direita; barra de progresso e contador `1 / 36`; cartão
com ilustração do planeta e balão de fala do mascote; texto com frases em
negrito, lista com marcadores `✦`, emoji; botão **Continue**.

| Capacidade | Estado | Ação |
|---|---|---|
| Fechar e voltar de onde veio | ✅ | Existe |
| Marcar a lição no cabeçalho | ❌ | **Adotar** (par de A8) |
| Progresso `N / M` dentro da lição | ◑ Há barra; **sem contador** | **Adotar** |
| Avanço passo a passo com `Continue` | ◑ O teatro rola a página inteira | **Avaliar** — passo a passo prende mais |
| Balão de fala do mascote | ❌ | **Kids apenas** |

> **Defeito observado na captura, a não repetir:** a lição do Astra é a tela
> de telefone esticada na largura do navegador, sem adaptação. O Conservatório
> já usa a forma E com coluna de leitura — **isto é vantagem nossa**.

---

# PARTE B — Duolingo

> Mapeado para **extrair mecanismo**, não aparência. A instrução foi
> explícita: usar os dois mapas de requisitos, e onde o Astra não tem uma
> função que o Duolingo tem, incluí-la para o Practice ficar completo.

## B1 · Nivelamento antes do cadastro

**O que a captura mostra:** mascote com balão *"Quanto você entende de
inglês?"* e lista rolável de níveis, de "não sei nada" a "consigo falar sobre
a maioria dos assuntos em detalhes", cada um com ícone de barras crescentes.
Botão `CONTINUAR` desabilitado até haver escolha.

| Capacidade | Estado | Ação |
|---|---|---|
| **Perguntar o nível antes de começar** | ❌ | **Adotar.** Mais inteligente que A4: o Astra pergunta *como* aprender; o Duolingo pergunta *de onde partir* |
| Ícone de intensidade crescente | ❌ | Adotar — comunica sem texto |
| Botão desabilitado até escolher | ◑ | Padrão já usado |

> **Adotar os dois:** nível de partida (Duolingo) **e** ritmo de progressão
> (Astra). São perguntas diferentes.

## B2 · `/learn` — a Home

**O que a captura mostra:**

- **Navegação lateral esquerda:** APRENDER · SONS · LIGAS · MISSÕES · LOJA · PERFIL · MAIS
- **Cabeçalho da unidade:** `SEÇÃO 1, UNIDADE 1` + título + botão `GUIA`
- **Caminho vertical:** nós circulares — o ativo com selo `COMEÇAR`, os demais cinzas; baú de recompensa; mascote ao lado
- **Trilho direito:** seletor de curso (bandeira) · ofensiva (chama, `0`) · gemas (`500`) · vidas (coração, `5`)
- **Cartões do trilho:** `Desbloqueie as Ligas!` com requisito explícito · `Missões do dia` com barra `0 / 10` · `Crie um perfil pra salvar o seu progresso!`

| Capacidade | Estado | Ação |
|---|---|---|
| **Caminho visual com nós** | ❌ | **Adotar** — é o coração do Practice |
| Cabeçalho de seção e unidade | ❌ | **Adotar** |
| Botão `GUIA` — referência sem sair do caminho | ❌ | **Adotar**, ligado à lição do Academy |
| Baú de recompensa no caminho | ❌ | Adotar **em forma sóbria** — marco, não baú |
| Trilho com ofensiva, moeda e vidas | ❌ | **Adotar** (ver Parte C) |
| Requisito explícito para desbloquear | ❌ | **Adotar.** "Complete mais 3 lições" é melhor que cadeado mudo |
| Aviso de progresso não salvo | ❌ | **Adotar** — o Conservatório tem o mesmo risco |

## B3 · Troca de curso

**O que a captura mostra:** popover `MEUS CURSOS` com o curso atual marcado e
`+ Adicionar curso`.

| Capacidade | Estado | Ação |
|---|---|---|
| Trocar de curso sem sair da tela | ❌ | **Adotar** — equivale à faixa "Current Course" do Astra (A5) |
| Acrescentar curso pelo mesmo lugar | ❌ | **Adotar** |

## B4 · Ofensiva

**O que a captura mostra:** popover `0 dias de ofensiva`, *"Faça uma lição hoje
pra começar uma nova ofensiva!"*, semana `D S T Q Q S S` com círculos vazios,
e cartão bloqueado `Sociedade da Chama Acesa` — *"Consiga uma ofensiva de 7
dias pra entrar e ganhar recompensas exclusivas"* — com `VER MAIS`.

| Capacidade | Estado | Ação |
|---|---|---|
| Ofensiva com semana visível | ◑ Domínio existe (`frequencia.ts`, `StreakTracker`); **sem o popover** | **Adotar** |
| **Zero declarado sem constranger** | ✅ Já é a nossa regra | Manter |
| Clube por ofensiva sustentada | ❌ | **Adotar** (ver Parte C) |

## B5 · `/quests` — Missões

**O que a captura mostra:** faixa roxa de boas-vindas · `Missões do dia` com
temporizador `9 HORAS` · missão `Ganhe 10 XP` com barra `0 / 10` e baú ·
`Mais missões em breve` com cadeado · à direita, desafios do mês com medalha.

| Capacidade | Estado | Ação |
|---|---|---|
| **Missões diárias com meta e prazo** | ◑ Há `DailyGoal`; **sem tela e sem missões** | **Adotar** |
| Temporizador até virar o dia | ❌ | **Adotar** — cria urgência honesta |
| Desafio mensal | ❌ | **Adotar** |
| "Mais missões em breve" | ❌ | **Não adotar.** É promessa de funcionalidade futura na tela |

## B6 · `/leaderboard` — Ligas

**O que a captura mostra:** três medalhas, `Desbloqueie as Ligas!`,
*"Complete mais 3 lições pra começar a competir"*, botão `COMEÇAR UMA LIÇÃO`,
e **linhas em esqueleto** mostrando o formato da tabela. À direita, `O QUE SÃO
AS LIGAS?` explicando a mecânica.

| Capacidade | Estado | Ação |
|---|---|---|
| Classificação semanal por liga | ◑ `RankingLeague` existe com seis níveis; **tela não** | **Adotar** |
| **Esqueleto mostrando o formato antes de haver dado** | ❌ | **Adotar.** É a melhor solução de estado vazio das capturas: mostra a forma sem inventar gente |
| Explicação da mecânica ao lado | ❌ | **Adotar** |
| Subida e queda de liga | ❌ | **Adotar** (ver Parte C) |

> **Atenção ao antipadrão A1.** O esqueleto é a forma correta de mostrar uma
> tabela vazia: cinza, sem nome, sem número. O que **não** se faz é preencher
> com participantes inventados — já aconteceu aqui, com Bach em primeiro lugar.

## B7 · Início da lição

**O que a captura mostra:** balão sobre o nó — título, `Lição 1 de 4`, botão
`COMEÇAR +10 XP`.

| Capacidade | Estado | Ação |
|---|---|---|
| **Dizer o ganho antes de começar** | ❌ | **Adotar.** `+10 XP` no botão é contrato explícito |
| Posição da lição na unidade | ❌ | **Adotar** |

## B8 · Exercício

**O que a captura mostra:** `X` de fechar, barra de progresso, contador de
vidas (`5`), etiqueta `PALAVRA NOVA`, enunciado, três alternativas com imagem
e **atalho numérico** (`1`, `2`, `3`), botões `PULAR` e `VERIFICAR`.

| Capacidade | Estado | Ação |
|---|---|---|
| Barra de progresso do exercício | ◑ | **Adotar** |
| **Vidas** | ❌ | **Adotar com variação** (ver Parte C) |
| Etiqueta de tipo de conteúdo | ❌ | **Adotar** — "PALAVRA NOVA" prepara a atenção |
| **Atalho de teclado numerado** | ❌ | **Adotar.** Acessibilidade e velocidade |
| `PULAR` sem punição | ❌ | **Adotar** |
| `VERIFICAR` desabilitado até escolher | ✅ | Padrão já usado |

---

# PARTE C — O que o Conservatório monta a partir dos dois

Cada linha existe porque apareceu numa captura. Os detalhes de contagem estão
em `docs/harness/76_ECONOMIA_DE_PROGRESSO.md`; a taxonomia do mapa, em
`docs/harness/75_TAXONOMIA_DO_ATLAS.md`.

| # | Capacidade | Origem | Forma adulta | Forma Kids |
|---|---|---|---|---|
| C1 | Caminho visual com nós | Duolingo B2 | Trilha sóbria sobre o Atlas | Caminho ilustrado |
| C2 | Prática **dentro do curso** | Astra A7 | Seção ao fim da grade | Igual |
| C3 | Nível de partida + ritmo | B1 + A4 | Duas perguntas no cadastro | Igual |
| C4 | Ofensiva com semana | A2 + B4 | Selo discreto no cabeçalho | Chama animada |
| C5 | Missões diárias com prazo | B5 | Lista sóbria | Baú e recompensa |
| C6 | Ligas com esqueleto | B6 | Tabela institucional | Medalhas |
| C7 | XP declarado antes | B7 | `+10` no botão | Igual, com animação |
| C8 | Vidas → **índice de débito** | B8 | Ver abaixo | Corações |
| C9 | Emblemas `N de M`, bloqueados visíveis | A6 | Fileira em cinza | Coloridos |
| C10 | Marcador de lição | A8 + A10 | Ícone no cabeçalho | Igual |
| C11 | Biblioteca pública + redação no Admin | A9 | Formato de publicação | Igual |
| C12 | Trocar de curso sem sair | A5 + B3 | Faixa no topo | Igual |
| C13 | Requisito explícito no cadeado | B2 | "Faltam 3 lições" | Igual |
| C14 | Atalho numérico no exercício | B8 | Sempre | Sempre |
| C15 | Passagem de apresentação | A2 | Diagrama do Atlas | Mascote |

## C8 · Vidas e índice de débito — variação nossa

Pedido registrado, em resumo: em vez de vidas que travam o estudo, manter um
**histórico de erro** que não debita a pontuação real.

- Cinco vidas por sessão, como no Duolingo.
- Ao acabarem, **não trava**: passa a acumular **índice de débito**, em
  vermelho, ao lado das vidas.
- O débito **não** subtrai da pontuação. É registro: *"você errou tantas
  vezes, nestes lugares exatos"* — como um extrato.
- Quem quiser **quita o débito com pontuação**, e ele some.
- Aparece no perfil, ao lado da pontuação.

> É uma boa ideia por um motivo pedagógico, e não só por humor: transforma o
> erro em informação localizada — *onde* se errou — em vez de punição que
> interrompe. E torna a quitação uma escolha, não uma obrigação.

---

# O que NÃO adotar, e por quê

| Do Astra | Motivo |
|---|---|
| `Profile` na barra abrindo o mesmo que o cartão do canto | Duplicação observada na captura |
| Lição como tela de telefone esticada | O Conservatório já tem forma melhor |
| Ilustração ocupando metade da tela de entrada | Empurra o formulário para baixo |

| Do Duolingo | Motivo |
|---|---|
| Mascote em toda tela | Decisão explícita: sóbrio na forma adulta |
| Verde saturado e traço infantil | Paleta é anil e ouro |
| "Mais missões em breve" | Promessa de funcionalidade futura na tela — antipadrão |
| Loja de gemas | Não há cobrança nesta versão |

---

# Como este documento é conferido

| Afirmação | Como se verifica |
|---|---|
| "Existe no Conservatório" | `npm run qa` · `node scripts/auditar-rotas.mjs` · o arquivo citado |
| "Aparece na captura" | A captura, arquivada com a data |
| "Adotar" | Vira linha em `CLAUDE_TODO.md`, seção **T** |

**Nada aqui afirma paridade alcançada.** O documento mapeia o que as capturas
mostram e decide o que entra. O que entrou, e está funcionando, é o que
`npm run qa` e a suíte provam — e só isso.
