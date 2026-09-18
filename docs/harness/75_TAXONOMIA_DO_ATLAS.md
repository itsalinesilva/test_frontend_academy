# 75 · Taxonomia do Atlas — catálogo único

> **Um termo, um significado, um tipo no domínio.** Este documento é a
> autoridade sobre o vocabulário do Atlas e da Prática. Onde o código disser
> outra coisa, o código é que se corrige.
>
> Existe porque o vocabulário estava se formando em dois lugares ao mesmo
> tempo, e dois nomes para a mesma coisa é como um produto passa a ensinar
> coisas diferentes sobre si mesmo.

---

## Por que isto vem antes de construir o Practice

O Practice não é uma lista de exercícios: é **navegação por um mapa**. Quem
pratica escolhe uma era, uma região, uma tribo, uma obra — e cada uma dessas
palavras precisa significar exatamente uma coisa, ou o filtro de uma tela não
vai casar com o rótulo de outra.

O estado encontrado em 18/09/2026:

| Termo | No domínio | Na interface | Problema |
|---|---|---|---|
| Era | `MusicalEra` ✅ | 5 eras **escritas na tela**, com contagens inventadas | Fachada |
| Mundo | `MusicalWorld` ✅ | não aparece | Tipo sem uso |
| Atlas | só em texto | `/worlds` | Sem tipo próprio |
| **Tribo** | `Tribo` ✅ | eixo do Atlas | **Substituiu `InstrumentIsland` em 18/09** |
| **Região** | `Regiao` ✅ | eixo do Atlas | **Criada em 18/09** |
| Liga | `RankingLeague` ✅ | não aparece | Tipo sem uso |
| Gênero | `Genero` ✅ | faceta de filtro | **Criado em 18/09**, 16 gêneros |

---

## O catálogo

### Atlas

> **O mapa inteiro.** Não é um lugar: é a vista de todos os lugares.

O Atlas não tem tipo próprio e **não deve ter** — ele é a *composição* dos
eixos abaixo. Dar-lhe uma entidade criaria uma segunda fonte de verdade sobre
o que já está em Era, Região e Tribo.

Rota: `/worlds`. **O nome da rota está errado** — "mundos" é um dos eixos, não
o mapa. Ver `T-1` no TODO.

---

### Os três eixos

O Atlas se navega por três eixos que se cruzam. Uma obra fica no cruzamento
dos três, e é por isso que ela é a unidade que o passaporte carimba.

```
                    ERA  (quando)
                     │
      REGIÃO ────────┼──────── TRIBO
      (onde)         │        (com quem)
                   OBRA
```

#### 1 · Era — o eixo do tempo

> **Recorte temporal da história da música.** Define a época que a pessoa
> escolheu estudar.

| | |
|---|---|
| Tipo | `MusicalEra` |
| Exemplos | Barroco (1600–1750) · Classicismo (1750–1820) · Romantismo · Moderno |
| Tem | período em anos, características, ordem cronológica, paleta própria |
| Não é | gênero, região, nem curso |

**Regra:** era é **período histórico**, não estilo. "Música Brasileira de
Tradição" estava listada como era na tela — **e não é**: é uma região, e
atravessa várias eras. Corrigido em 18/09 (`T-2`).

#### 2 · Região — o eixo geográfico

> **Recorte geográfico e cultural.** Onde a música foi feita, e por quem.

| | |
|---|---|
| Tipo | `Regiao` |
| Exemplos | Europa Ocidental · Brasil · Península Ibérica |
| Tem | delimitação, escolas, movimentos, compositores |
| Não é | era, nem gênero |

**Por que precisa existir.** Hoje "Brasil" e "Ocidental" são **cursos** — e
isso funciona para a História, mas não para a Prática: quem quer praticar
repertório brasileiro do século XX precisa cruzar *região* com *era*, e não
abrir outro curso. Região é o eixo que faltava.

> Foi dito: *"regiões pode ser uma forma de expressar realmente algo
> geográfico, exemplo Brasil, Ocidente, que temos atualmente já são regiões
> que sabemos que haverá muita movimentação de compositores e movimentos
> musicais."*

#### 3 · Tribo — o eixo da gente

> **A população nichada.** Não um lugar: um grupo.

| | |
|---|---|
| Tipo | `Tribo` |
| Exemplos | Tribo dos violinistas · dos pianistas · **dos historiadores** |
| Tem | corpus pedagógico com proveniência, progressão em etapas, eras e regiões relevantes |
| Estado | `ABERTA` · `EM_PREPARO` · `ANUNCIADA` |
| Natureza | `INSTRUMENTO` · `DISCIPLINA` · `OFICIO` |

**Por que tribo, e não ilha.** O tipo se chamava `InstrumentIsland`, e o erro
não era de rótulo: **ilha dá ideia de lugar** — e lugar, aqui, é assunto do
Atlas, que já trata de *onde* (região) e de *quando* (era). Dois vocabulários
competindo pelo mesmo significado foi o que este catálogo pegou.

Tribo trata de **gente**: a população nichada de um lugar ou de um tempo. E a
generalização é o ganho — quem estuda história da música forma uma tribo
tanto quanto quem toca violino, e isso **não cabia** em "ilha de instrumento".

**Tribo não tem coordenada no mapa.** Quem tem é o mundo.

**Por que tribo e não filtro:** a trilha de uma tribo é **um percurso à
parte**, com corpus e pedagogia próprios. O violino tem método de repertório,
caderno de estudos técnicos e escalas; o historiador tem outro conjunto.

**Tribo `ANUNCIADA` aparece na lista, fechada, com o motivo escrito, e nunca
preenchida com conteúdo inventado.**

---

### Mundo

> **Um território do Atlas: o cruzamento de uma Era com uma Região.**

| | |
|---|---|
| Tipo | `MusicalWorld` |
| Exemplos | Barroco Alemão · Romantismo Francês · Modernismo Brasileiro |
| Tem | coordenadas no mapa, tema estético, requisito de desbloqueio, obras |

`MusicalWorld` tinha `eraId` e **não tinha região** — com isso, "Barroco" era
um mundo só, quando Barroco alemão e Barroco italiano são territórios
distintos, com escolas distintas. `regiaoId` acrescentado em 18/09.

> **Era ≠ Mundo.** A era é o *recorte de tempo*; o mundo é o *lugar
> navegável* que resulta de cruzá-la com uma região. Eras são poucas; mundos
> são muitos.

---

### Tribo

Definida acima, como o terceiro eixo. **Decisão tomada em 18/09/2026:** o
termo "ilha" foi removido do projeto.

> *"Tribo é o correto — tribo de violinistas, tribo de pianistas, tribo de
> historiadores. Tribo trata da ideia de grupo nichado. Ilha dava a ideia de
> local e não combinaria nada com o Atlas: agora o Atlas trata sobre tudo,
> local e tempo, mas no quesito tribo seria a população nichada daquele local
> ou tempo."*

---

### Liga

> **Faixa de competição por desempenho, dentro de um recorte.** Não é lugar
> nem gente: é **nível**.

| | |
|---|---|
| Tipo | `RankingLeague` |
| Faixas | Bronze · Prata · Ouro · Platina · Diamante · **Conservatório** |
| Período | Semanal |
| Mecânica | Sobe-se e cai-se conforme a posição ao fim da semana |

**Ligas se encaixam dentro de recortes**, e é isso que responde "campeonato de
quê":

```
  Liga da plataforma      todos os alunos
  Liga do curso           quem faz Teoria da Música
  Liga da tribo           quem pratica violino
  Liga da era             quem estuda Barroco
```

A mesma pessoa está em várias ao mesmo tempo. Detalhes em
`76_ECONOMIA_DE_PROGRESSO.md`.

---

### Obra e Compositor

| Termo | Definição | Tipo |
|---|---|---|
| **Obra** | A peça musical. Fica no cruzamento dos três eixos | `AtlasWorkPlacement` ✅ |
| **Compositor** | Quem a escreveu. Pertence a uma era e a uma região | `HistoricalMaster` ✅ |

`AtlasWorkPlacement` cruza `eraId` + `regiaoId` + `triboId` + `composerId`.

---

### Gênero

> **Faceta de filtro sobre a obra.** Não é eixo.

| | |
|---|---|
| Tipo | `Genero` — faceta, não entidade do mapa |
| Exemplos | Concerto · Sonata · Fuga · Choro · Modinha |

**Por que faceta e não eixo:** gênero não organiza o mapa — refina a busca
dentro dele. Uma fuga não é um lugar que se visita.

Outras facetas úteis: formação (solo, câmara, orquestra), dificuldade, e
duração.

---

## Tabela de decisão — qual palavra usar

| Se você quer dizer… | Use | Nunca use |
|---|---|---|
| O mapa inteiro | **Atlas** | Mundos, Worlds |
| Um recorte de tempo | **Era** | Período, época, mundo |
| Um recorte geográfico | **Região** | Mundo, país |
| Era × Região, navegável | **Mundo** | Era, território |
| A população nichada | **Tribo** | Ilha, grupo, comunidade |
| Faixa de competição | **Liga** | Ranking, nível |
| Posição dentro da liga | **Classificação** | Ranking, liga |
| Tipo da peça | **Gênero** | Estilo, forma |
| Sequência de estudo dentro de um curso | **Trilha** | Caminho, path |
| Sequência de exercícios | **Percurso** | Trilha |

---

## O que corrigir no código

Cada linha é uma pendência em `CLAUDE_TODO.md`, seção **T**.

| # | Correção | Onde |
|---|---|---|
| T-1 | `/worlds` → `/atlas`; o mapa não é um dos eixos | `AppRouterOutlet`, `audiencia.ts`, menu |
| T-2 | "Música Brasileira de Tradição" está listada como **era**; é **região** | `WorldsAtlasScreen` |
| T-3 | Criar `Regiao`; acrescentar `regiaoId` a `MusicalWorld` e `AtlasWorkPlacement` | `domain/gamification.ts` |
| T-4 | ~~Decidir Tribo × Ilha~~ — **decidido: ilha removida.** `InstrumentIsland` → `Tribo`, com natureza `INSTRUMENTO`/`DISCIPLINA`/`OFICIO` | ✅ |
| T-5 | Criar `Genero` como faceta de obra | `domain/gamification.ts` |
| T-6 | **As 5 eras do Atlas estão escritas na tela, com contagens inventadas** — "142 obras canônicas" sem acervo | `WorldsAtlasScreen` |
| T-7 | Os 5 compositores do grafo estão escritos na tela | `MusicGraphScreen` |
| T-8 | `MusicalWorld` e `RankingLeague` existem e **nenhuma tela os consome** | — |
| T-9 | Conferir se o mapa do braço do violino corresponde ao Atlas | `BracoDoViolino.tsx` |
| T-10 | `regiaoId` em `MusicalWorld` ✅ e em `AtlasWorkPlacement` ✅ | feito em 18/09 |

---

## Regra permanente

> **Termo novo entra aqui antes de entrar no código.**

Se uma palavra não está neste catálogo, ela não tem significado acordado — e
uma palavra sem significado acordado vira dois significados em duas telas. Foi
assim que "mundo" passou a nomear tanto o mapa quanto um de seus eixos.
