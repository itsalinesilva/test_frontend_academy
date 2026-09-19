# WIREFRAMES DE REFERÊNCIA — 00 · FUNDAÇÕES

**Status:** Normativo · especificação executável
**Criado:** 2026-09-16 (COMANDO 2, etapa 1)
**Autoridade:** subordinado a `docs/01_PRODUCT_CONSTITUTION.md`; prevalece sobre qualquer tela existente.

> **Como usar este conjunto.** Estes documentos definem o wireframe **esperado** de cada domínio antes de qualquer auditoria ou implementação. Toda tela é medida contra eles. Quando uma tela diverge, a tela está errada — não o wireframe.
>
> **Índice:**
> `00_FOUNDATIONS.md` (este) · `01_ACADEMY_COURSERA.md` · `02_PROFILE_LINKEDIN.md` · `03_PRACTICE_DUOLINGO_ASTRA.md` · `04_ROOMS_SKOOL.md` · `05_STUDIO_DAW.md` · `06_SCORE_NOTATION.md`

---

## 1. A REGRA DE ADAPTAÇÃO

Clonar **estrutura de experiência**: arquitetura de informação, hierarquia, composição de página, densidade, ciclos de interação, máquinas de estado, navegação.

Nunca clonar: marca, logotipo, paleta de terceiros, textos, ilustrações, código.

A adaptação é feita **sempre** por três meios:
1. **Identidade visual própria** — pedra/carmim/bordô, tipografia serifada acadêmica.
2. **Conteúdo musical erudito e canônico** da plataforma.
3. **Redução honesta de escopo** — clonar só o que a plataforma realmente entrega. Uma aba que não tem dados não é desenhada "por fidelidade"; ela não existe.

> **Corolário importante.** "Paridade estrutural" **não** significa que a nossa tela tenha todas as funcionalidades da referência. Significa que, ao abrir, a pessoa reconhece imediatamente o **tipo de produto** pela organização do espaço.

---

## 2. SISTEMA DE GRADE — a peça que falta hoje

**Diagnóstico:** `ScreenContainer` fornece apenas título, subtítulo, badge e ações. **Não existe primitiva de coluna.** É a causa raiz de `sticky: 0/72`, `grid-cols-12: 0/72` e 65 telas empilhadas verticalmente (ver `01_REPOSITORY_AUDIT.md §I.3`).

### 2.1 Grade canônica

```
12 colunas · gutter 24px (desktop) / 16px (tablet) / 16px (mobile)
Largura máxima de conteúdo: 1280px (max-w-7xl), centrada, com gutter lateral mínimo de 16px
```

### 2.2 As quatro formas canônicas de página

Toda tela da plataforma é **uma destas quatro**. Nenhuma outra é permitida sem justificativa registrada.

---

**FORMA A — `FOCUS` (1 coluna estreita)**
Leitura, formulário, autenticação, certificado, estado terminal.

```
┌──────────────────────────────────────────────────────────┐
│                      [ Header global ]                   │
├──────────────────────────────────────────────────────────┤
│              ┌────────────────────────────┐              │
│              │  max-w-2xl (672px)         │              │
│              │  conteúdo centrado         │              │
│              │                            │              │
│              └────────────────────────────┘              │
└──────────────────────────────────────────────────────────┘
```
Telas: Login, Registro, Recuperação, Certificado, Conclusão de Curso, Feedback Imediato.

---

**FORMA B — `CATALOG` (filtros + resultados)**
Busca, catálogo, diretório, listagem administrativa.

```
┌──────────────────────────────────────────────────────────┐
│ [ Header ] [ Breadcrumbs ]                               │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Título + contagem de resultados + ordenação          │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌────────────┐ ┌───────────────────────────────────────┐ │
│ │ col 1–3    │ │ col 4–12                              │ │
│ │ FILTROS    │ │ RESULTADOS                            │ │
│ │ ▸ STICKY   │ │ grade de cards ou lista densa         │ │
│ │ top-20     │ │                                       │ │
│ │            │ │ [ card ] [ card ] [ card ]            │ │
│ │ facetas    │ │ [ card ] [ card ] [ card ]            │ │
│ │ contadores │ │                                       │ │
│ │            │ │ [ paginação ]                         │ │
│ └────────────┘ └───────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```
`< lg`: filtros colapsam em `Drawer` acionado por botão "Filtrar (n)".
Telas: Catálogo, Busca, Resultados, Categoria, Diretório de Salas, Eventos, Atlas, Admin/Usuários, Admin/Conteúdo.

---

**FORMA C — `DETAIL` (conteúdo + trilho lateral)**
A forma mais importante. É o que faz Coursera parecer Coursera e LinkedIn parecer LinkedIn.

```
┌──────────────────────────────────────────────────────────┐
│ [ Header ] [ Breadcrumbs ]                               │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ HERO — identidade da entidade, metadados, CTA        │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [ ABAS ] ▸ STICKY top-0 · z-20 · fundo opaco         │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────┐ ┌────────────────────┐ │
│ │ col 1–8   CONTEÚDO PRINCIPAL  │ │ col 9–12  TRILHO   │ │
│ │                               │ │ ▸ STICKY top-20    │ │
│ │ seções empilhadas             │ │                    │ │
│ │                               │ │ progresso          │ │
│ │                               │ │ ações              │ │
│ │                               │ │ metadados          │ │
│ │                               │ │ relacionados       │ │
│ └───────────────────────────────┘ └────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```
`< lg`: o trilho **desce para baixo** do conteúdo (nunca some). As abas viram scroller horizontal com `overflow-x-auto` e indicadores de borda.
Telas: Curso, Trilha, Programa, Módulo, Lição, Perfil, Obra, Sala, Habilidade, Tópico.

---

**FORMA D — `WORKSPACE` (ferramenta de tela cheia)**
Estúdio, editor de partitura, sessão de exercício, laboratório.

```
┌──────────────────────────────────────────────────────────┐
│ BARRA DE FERRAMENTAS  ▸ STICKY top-0                     │
├──────────┬────────────────────────────────┬──────────────┤
│ PAINÉIS  │  ÁREA DE TRABALHO              │ INSPETOR     │
│ ESQUERDA │  (rolagem própria)             │ DIREITA      │
│ 240px    │  flex-1                        │ 280px        │
│          │                                │              │
│ colapsá- │                                │ colapsável   │
│ vel      │                                │              │
├──────────┴────────────────────────────────┴──────────────┤
│ BARRA DE TRANSPORTE / STATUS  ▸ STICKY bottom-0          │
└──────────────────────────────────────────────────────────┘
```
Ocupa `100dvh`, **sem** o `ScreenContainer` padrão. Fundo escuro obrigatório (Estúdio).
`< lg`: painéis viram `Drawer`; área de trabalho ocupa tudo.
Telas: DAW, Editor de Partitura, Sessão de Exercício, Laboratório de Voz.

---

### 2.3 Regiões fixas (`sticky`) — contrato

| Região | Posição | z-index | Fundo |
| :--- | :--- | ---: | :--- |
| Header global | `top-0` | 50 | opaco + `backdrop-blur` |
| Barra de abas (Forma C) | `top-16` | 20 | opaco; sombra ao rolar |
| Trilho lateral (Forma C) | `top-20` | 10 | transparente |
| Filtros (Forma B) | `top-20` | 10 | transparente |
| Barra de ferramentas (Forma D) | `top-0` | 30 | opaco |
| Transporte (Forma D) | `bottom-0` | 30 | opaco |
| Player global | `bottom-0` | 40 | opaco |

**Regra:** todo `sticky` precisa de fundo opaco ou `backdrop-blur`; conteúdo passando por baixo de texto legível é defeito.

---

## 3. ANATOMIA DO SHELL

```
┌────────────────────────────────────────────────────────────┐
│ SkipLink (visível ao focar)                                │
├────────────────────────────────────────────────────────────┤
│ HEADER  ▸ sticky top-0 · h-16                              │
│ [logo] [navegação primária] ····· [busca ⌘K] [🔔] [avatar] │
├────────────────────────────────────────────────────────────┤
│ Breadcrumbs (oculto na raiz de cada pilar)                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   <main id="main">  ← alvo do SkipLink                     │
│     FORMA A · B · C · D                                    │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ GlobalPlayer  ▸ sticky bottom-0 (quando há áudio ativo)    │
└────────────────────────────────────────────────────────────┘
```

**Navegação primária (8 pilares):** Início · Academia · Prática · Mundos · Comunidade · Estúdio · Partituras · Perfil — mais Salas e Admin quando outorgados.

**Idioma:** pt-BR em toda a interface. Os rótulos em inglês atuais ("Home", "Academy", "Practice") são defeito.

**Atalhos:** `⌘K`/`Ctrl+K` paleta de comandos · `Alt+P` player · `/` foco na busca · `Esc` fecha sobreposição.

---

## 4. ESCALA DE DENSIDADE

Cada domínio tem densidade própria. Misturar densidades é o que produz aparência genérica.

| Densidade | Onde | Altura de linha de lista | Padding de card | Tamanho base |
| :--- | :--- | ---: | ---: | ---: |
| `EDITORIAL` | Lição, obra, artigo | — | 32px | 16px / `leading-relaxed` |
| `CATALOG` | Catálogo, perfil, sala | 72px | 20px | 14px |
| `OPERATIONAL` | Admin, histórico, tabelas | 44px | 12px | 13px |
| `INSTRUMENT` | Estúdio, partitura, sessão | 28px | 8px | 12px / `font-mono` |

---

## 5. MÁQUINA DE ESTADOS — obrigatória em toda tela

Hoje **0 de 72 telas** cumprem isto (`01_REPOSITORY_AUDIT.md §I.6`).

```
                   ┌──────────┐
      montagem ───▶│ LOADING  │  esqueleto com a FORMA da tela,
                   └────┬─────┘  nunca spinner centralizado
                        │
        ┌───────────────┼───────────────┬──────────────┐
        ▼               ▼               ▼              ▼
   ┌─────────┐    ┌──────────┐    ┌─────────┐   ┌──────────┐
   │ CONTENT │    │  EMPTY   │    │  ERROR  │   │  LOCKED  │
   └────┬────┘    └──────────┘    └────┬────┘   └──────────┘
        │          ação sugerida        │ retry   pré-requisito
        ▼                                         + caminho
   ┌─────────┐
   │ SUCCESS │  confirmação + próximo passo
   └─────────┘
```

| Estado | Componente | Exigência |
| :--- | :--- | :--- |
| LOADING | `Skeleton` *(órfão — reconectar)* | Esqueleto com a geometria real. `aria-busy="true"` |
| EMPTY | `EmptyState` | Título, explicação e **ação recomendada**. Nunca "nenhum dado" seco |
| ERROR | `ErrorState` | Causa em linguagem humana + `onRetry`. `role="alert"` |
| SUCCESS | `SuccessState` · `CompletedState` *(órfão)* | Confirma o ato e oferece o próximo passo |
| LOCKED | `LockedState` *(órfão)* | Diz **por que** está bloqueado e **como** desbloquear |

---

## 6. RESPONSIVIDADE — contrato por forma

| Largura | A `FOCUS` | B `CATALOG` | C `DETAIL` | D `WORKSPACE` |
| :--- | :--- | :--- | :--- | :--- |
| ≥ 1280 | centrado 672px | 3+9 | 8+4 | 240 + flex + 280 |
| 1024–1279 | centrado | 3+9 | 8+4 | 200 + flex + 240 |
| 768–1023 | full - 32px | filtros → `Drawer` | trilho **abaixo**; abas → scroller | painéis → `Drawer` |
| 640–767 | full - 32px | 2 colunas de card | 1 coluna | área cheia + transporte |
| 320–639 | full - 32px | 1 coluna | 1 coluna | área cheia + transporte |

**Invariantes:** gutter lateral ≥ 16px em qualquer largura · `body` nunca rola horizontalmente · tabelas, partituras e linhas do tempo vão em contêiner próprio com `overflow-x-auto` · alvo de toque ≥ 44×44px.

---

## 7. CONTRATO DE ACESSIBILIDADE

Hoje 67 de 72 telas têm **zero** `aria-*`.

| Exigência | Como |
| :--- | :--- |
| Marco principal | `<main id="main">` único, alvo do `SkipLink` |
| Hierarquia de títulos | um `<h1>` por tela; sem pular níveis |
| Abas | `role="tablist"` / `tab` / `tabpanel`, `aria-selected`, setas ←→ navegam |
| Progresso | `role="progressbar"` com `aria-valuenow/min/max/text` |
| Medidor (cents, nível) | `role="meter"` com `aria-valuenow` e `aria-valuetext` |
| Status assíncrono | `LiveRegion` *(órfão)* — `polite` para progresso, `assertive` para erro |
| Foco | anel visível sempre; foco preso em modal; devolvido ao gatilho ao fechar |
| Ícone sem rótulo | `IconButton` *(órfão)* com `aria-label` obrigatório |
| Cor | nunca é o único portador de informação — acompanhar de ícone ou texto |
| Contraste | ≥ 4,5:1 texto normal · ≥ 3:1 texto grande e bordas de controle |
| `alert()` nativo | **proibido** — não é anunciável de forma controlada |

---

## 8. IDENTIDADE VISUAL

### 8.1 Cor (ADR-001.D)

| Papel | Valor | Uso |
| :--- | :--- | :--- |
| Primário | `#991b1b` | Ação primária, playhead, alerta crítico. **Nunca fundo extenso** |
| Secundário bordô | `#6D1D2D` | Cabeçalhos acadêmicos, certificados, selos institucionais |
| Superfície | `#FFFFFF` / `#FAFAF9` / `#F5F5F4` | Papel, tela, rebaixo |
| Tinta | `#1C1917` / `#44403C` / `#78716C` | Texto primário / secundário / auxiliar |
| Estúdio | `#18181B` | Fundo da Forma D |
| Aprovação | `#15803D` | Acerto, aprovado, afinado |
| Atenção | `#B45309` | Prazo, revisão pendente |

### 8.2 Tipografia — hoje **não existe** (zero `font-family` declarada)

| Papel | Família | Onde |
| :--- | :--- | :--- |
| Acadêmica | serifada de leitura | Títulos, nomes de obra, lições, diplomas |
| Interface | sem serifa | Navegação, rótulos, cards, formulários |
| Técnica | monoespaçada | BPM, Hz, cents, ms, compassos, código |

Escala: `12 · 13 · 14 · 16 · 18 · 24 · 32 · 40`. Corpo de leitura em 16px com medida de 60–75 caracteres.

---

## 9. VINCULAÇÃO A COMPONENTES EXISTENTES

**Regra:** antes de escrever qualquer `<div>` novo, verificar esta tabela. 23 componentes já existem e **nunca foram usados** — o defeito de paridade é de montagem, não de capacidade.

| Região do wireframe | Componente | Situação |
| :--- | :--- | :--- |
| Grade de colunas das Formas B/C | — | **NÃO EXISTE — criar `PageLayout`** |
| Abas de seção | `Tabs` | existe · **0 usos em tela** |
| Alternância de filtro | `SegmentedControl` | existe · **0 usos em tela** |
| Trilho lateral | `Sidebar` | existe · **0 usos** |
| Cabeçalho de perfil | `ProfileHeader` | **órfão** |
| Credencial / diploma | `Credential` · `CredentialChip` | **órfão** / usado |
| Card de lição | `LessonCard` | **órfão** |
| Card de exercício | `PracticeCard` | **órfão** |
| Nó da árvore de habilidades | `SkillNode` | **órfão** |
| XP | `XPIndicator` | **órfão** |
| Anel de progresso | `ProgressRing` | **órfão** |
| Estado bloqueado | `LockedState` | **órfão** |
| Estado concluído | `CompletedState` | **órfão** |
| Card de fórum | `ForumCard` | **órfão** |
| Card de evento | `EventCard` | **órfão** |
| Tabela operacional | `DataGrid` | **órfão** |
| Canal do mixer | `MixerChannel` | **órfão** |
| Grade MIDI | `PianoRoll` | **órfão** |
| Gravação | `Recorder` | **órfão** |
| Barra do editor de partitura | `NotationToolbar` | **órfão** |
| Teclado de instrumento | `InstrumentKeyboard` | **órfão** |
| Afinador | `Tuner` | existe |
| Forma de onda | `Waveform` | existe |
| Pauta | `Staff` · `ScoreContainer` | existe |
| Pista | `Track` · `Timeline` | existe |
| Esqueleto de carregamento | `Skeleton` | **órfão** |
| Botão de ícone | `IconButton` | **órfão** |
| Dica | `Tooltip` | **órfão** |
| Região viva | `LiveRegion` | **órfão** |
| Texto só para leitor de tela | `VisuallyHidden` | **órfão** |

### 9.1 Primitiva a criar — `PageLayout`

```tsx
<PageLayout form="detail">        {/* focus | catalog | detail | workspace */}
  <PageLayout.Hero>…</PageLayout.Hero>
  <PageLayout.Tabs items={…} />   {/* sticky top-16 */}
  <PageLayout.Main>…</PageLayout.Main>   {/* col 1–8  */}
  <PageLayout.Rail>…</PageLayout.Rail>   {/* col 9–12, sticky top-20 */}
</PageLayout>
```
Responsabilidades: grade de 12 colunas, larguras máximas, regiões fixas, colapso responsivo, `<main>` e marcos ARIA, orquestração dos 5 estados.

**Sem esta primitiva, nenhum wireframe das Formas B, C e D é implementável de forma consistente — é o primeiro item de implementação do COMANDO 3.**

---

## 10. CRITÉRIO DE APROVAÇÃO DE PARIDADE

Uma tela só passa quando:

1. Declara explicitamente sua **Forma** (A/B/C/D) e a respeita.
2. Usa `PageLayout` — nenhuma grade ad-hoc.
3. Usa os componentes da tabela §9 — nenhum redesenho manual do que já existe.
4. Implementa os **5 estados** (§5).
5. Cumpre o contrato responsivo (§6) em 320 / 768 / 1280 px.
6. Cumpre o contrato de acessibilidade (§7).
7. Consome dados reais de serviço/repositório — **zero arrays fixos no `.tsx`**.
8. Zero `alert()`.
9. Respeita a densidade do domínio (§4).
10. Tem teste de componente cobrindo os 5 estados.
