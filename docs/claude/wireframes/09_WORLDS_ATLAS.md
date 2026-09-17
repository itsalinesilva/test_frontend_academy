# WIREFRAMES — 09 · ATLAS: MUNDOS, ERAS E ILHAS

**Depende de:** `00_FOUNDATIONS.md`
**Domínio:** `/worlds`, `/worlds/work/:id`, `/worlds/graph` — e as ilhas de instrumento
**Densidade:** `CATALOG` no mapa · `EDITORIAL` na obra
**Referência:** não há clone externo. É a estrutura mais autoral do produto.

---

## 1. A DECISÃO ESTRUTURAL — dois eixos, não um

O Atlas não é uma linha do tempo com obras penduradas. São **dois eixos que se cruzam**:

```
                    EIXO TEMPORAL  (mundos / eras)
        Barroco ──── Classicismo ──── Romantismo ──── Moderno ──── Brasileira
           │              │               │              │             │
  ┌────────┼──────────────┼───────────────┼──────────────┼─────────────┼────────┐
  │        ▼              ▼               ▼              ▼             ▼        │
  │   ╔═══════════════════════════════════════════════════════════════════╗    │
  │   ║  VIOLINO   — Suzuki · Hans Sitt · Maia Bang · Laoureux · AFS      ║    │
  │   ╚═══════════════════════════════════════════════════════════════════╝    │
  │   ┌───────────────────────────────────────────────────────────────────┐    │
  │   │  PIANO     — aguardando corpus                                    │    │
  │   ├───────────────────────────────────────────────────────────────────┤    │
  │   │  CANTO     — aguardando corpus                                    │    │
  │   ├───────────────────────────────────────────────────────────────────┤    │
  │   │  VIOLÃO    — aguardando corpus                                    │    │
  │   └───────────────────────────────────────────────────────────────────┘    │
  │                    EIXO INSTRUMENTAL  (ilhas)                              │
  └────────────────────────────────────────────────────────────────────────────┘
```

**Onde os eixos se encontram: a obra.** A Chaconne da Partita BWV 1004 pertence ao mundo **Barroco** e à ilha do **Violino** simultaneamente. Quem a estuda carimba o passaporte **nos dois eixos**.

### Por que ilha, e não apenas um filtro por instrumento

Porque *"uma trilha orientada a instrumento é um curso à parte"*. O corpus de violino — Suzuki, Hans Sitt, Maia Bang, Laoureux, All for Strings — **não é teoria musical**. Tem progressão própria, pedagogia própria e critérios de avaliação próprios. Reduzir isso a uma faceta de busca no catálogo apagaria a coisa mais importante que ele tem: a ordem.

| | Espinha teórica | Ilha de instrumento |
| :--- | :--- | :--- |
| Corpus | Bohumil Med (ADR-002), Berklee | Suzuki, Sitt, Maia Bang, Laoureux, AFS |
| Progressão | conceitual | técnica e de repertório |
| Avaliação | exame escrito, quiz | execução aferida por evidência |
| Relação | **pré-requisito transversal** | **consome a teoria, não a substitui** |

Elas se cruzam: um estudo de Hans Sitt em Sol maior exige que o aluno já saiba o que é Sol maior. Esse é o vínculo — não uma hierarquia.

---

## 2. A REGRA DE HONESTIDADE — verificada por teste

> Uma ilha só é **navegável** quando existe corpus real em
> `framework_knowledge/knowledge-<slug>/` **e** o currículo foi derivado dele.

| Status | Significa | Aparência no mapa |
| :--- | :--- | :--- |
| `AVAILABLE` | Corpus ingerido + trilha publicada | Ilha aberta, navegável |
| `IN_PREPARATION` | Corpus presente, currículo em construção | Visível, com selo de preparo, não navegável |
| `PLANNED` | Declarada, sem corpus | Contorno tênue no mapa. Marca o lugar; não promete conteúdo |

Isto existe porque o Atlas anunciava **"142 obras do Barroco"** sobre **5 registros fixos** (`01_REPOSITORY_AUDIT §I.10`). `tests/atlas-islands.test.ts` impede a reincidência: falha se uma fonte declarada não existir em disco, se uma ilha sem corpus se declarar disponível, ou se uma ilha disponível não tiver trilha.

**Estado atual:** Violino em `IN_PREPARATION` — 15 obras presentes, nenhuma ingerida. Piano, Canto e Violão em `PLANNED`.

### Abrir uma ilha nova — cinco passos

1. Criar `framework_knowledge/knowledge-<slug>/` com as obras.
2. Listar as fontes em `sources`, com `isIngested: false` e `role` correto.
3. Status → `IN_PREPARATION`.
4. Rodar a ingestão (COMANDO 8) e derivar a trilha do corpus.
5. Preencher `curriculumPathId` e passar para `AVAILABLE`.

O `role` da fonte importa: **repertório** (Suzuki) e **estudo técnico** (Sitt) não se substituem, e o teste verifica que o violino tem ambos.

---

## 3. `/worlds` — O MAPA · Forma B

```
┌───────────────────────────────────────────────────────────────┐
│ Atlas Musical                        [Meu passaporte] [Grafo] │
│ [ Eras │ Instrumentos │ Compositores │ Obras ]     ▸ Tabs     │
├──────────────────┬────────────────────────────────────────────┤
│ col 1–3 ▸ sticky │ col 4–12                                   │
│                  │  ═══ ERAS ═══                              │
│ SEU PASSAPORTE   │  ┌──────────────────────────────────────┐  │
│ ┌──────────────┐ │  │ BARROCO            1600 – 1750       │  │
│ │  ✦ 7 carimbos│ │  │ Bach · Händel · Vivaldi              │  │
│ │  Peregrino   │ │  │ 3 obras catalogadas · 2 estudadas    │  │
│ │  Barroco     │ │  │             ← contagem REAL          │  │
│ └──────────────┘ │  └──────────────────────────────────────┘  │
│                  │  ┌──────────────────────────────────────┐  │
│ FILTROS          │  │ CLASSICISMO        1750 – 1820       │  │
│ ▸ Era            │  │ 0 obras catalogadas                  │  │
│ ▸ Instrumento    │  │ ▸ estado vazio honesto, não "98"     │  │
│ ▸ Século         │  └──────────────────────────────────────┘  │
│ ▸ Só estudadas   │                                            │
│                  │  ═══ ILHAS DE INSTRUMENTO ═══              │
│                  │  ┌──────────────────────────────────────┐  │
│                  │  │ 🎻 VIOLINO         em preparo        │  │
│                  │  │ Cordas friccionadas                  │  │
│                  │  │ 15 obras de método no acervo         │  │
│                  │  │ Suzuki · Sitt · Maia Bang · Laoureux │  │
│                  │  │ [Ver o acervo]   (trilha em breve)   │  │
│                  │  └──────────────────────────────────────┘  │
│                  │  ┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐  │
│                  │  ╎ 🎹 Piano · 🎤 Canto · 🎸 Violão      ╎  │
│                  │  ╎ aguardando corpus pedagógico         ╎  │
│                  │  └╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘  │
└──────────────────┴────────────────────────────────────────────┘
```

Ilhas `PLANNED` aparecem com contorno tracejado e sem ação — presentes no mapa, evidentemente fechadas.

---

## 4. `/worlds/island/:slug` — A ILHA · Forma C *(rota a criar)*

```
┌───────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ 🎻 VIOLINO · Cordas friccionadas                          ║ │
│ ║ Do primeiro contato com o arco ao repertório solo barroco ║ │
│ ╚═══════════════════════════════════════════════════════════╝ │
├───────────────────────────────────────────────────────────────┤
│ [ Trilha │ Acervo │ Repertório │ Técnica │ Obras no Atlas ]   │
├─────────────────────────────────────┬─────────────────────────┤
│ col 1–8                             │ col 9–12 ▸ sticky       │
│                                     │ ┌─────────────────────┐ │
│ ┌─ ABA: ACERVO ───────────────────┐ │ │ SEU PROGRESSO       │ │
│ │ REPERTÓRIO                      │ │ │ ▓░░░░ etapa 1 de 8  │ │
│ │  Suzuki Violin School  V.1 V.2 V.3│ │ │                   │ │
│ │ ESTUDOS TÉCNICOS                │ │ │ [Começar]           │ │
│ │  Hans Sitt · 100 Estudos  V.1–5 │ │ └─────────────────────┘ │
│ │ MÉTODO                          │ │ ┌─────────────────────┐ │
│ │  Maia Bang  V.I V.II V.III      │ │ │ TEORIA EXIGIDA      │ │
│ │  All for Strings  V.1 V.2 V.3   │ │ │ ✓ Leitura em clave  │ │
│ │ TÉCNICA                         │ │ │   de sol            │ │
│ │  Laoureux · Méthode Pratique    │ │ │ ▸ Escalas maiores   │ │
│ │                                 │ │ │ [Ir à disciplina →] │ │
│ │ 15 obras · 0 ingeridas          │ │ └─────────────────────┘ │
│ └─────────────────────────────────┘ │ ┌─────────────────────┐ │
│                                     │ │ ERAS ONDE ESTE      │ │
│ ┌─ ABA: OBRAS NO ATLAS ───────────┐ │ │ INSTRUMENTO BRILHA  │ │
│ │ Cruzamento dos dois eixos:      │ │ │ Barroco · Clássico  │ │
│ │ repertório de violino por era   │ │ │ Romântico           │ │
│ └─────────────────────────────────┘ │ └─────────────────────┘ │
└─────────────────────────────────────┴─────────────────────────┘
```

O painel **Teoria exigida** materializa o cruzamento: a ilha consome a espinha teórica, e diz explicitamente o que falta estudar antes de avançar.

---

## 5. PASSAPORTE — carimba nos dois eixos

`CulturalPassport` e `PassportEntry` já existem em `domain/gamification.ts`. O eixo instrumental acrescenta `IslandStampType`:

| Carimbo | Eixo | Gatilho |
| :--- | :--- | :--- |
| `WORK_ANALYZED` · `WORK_PERFORMED` | temporal | obra estudada ou executada |
| `COURSE_MASTERED` · `EXAM_HONORS` | temporal | disciplina concluída |
| `TOUR_COMPLETED` | temporal | roteiro guiado |
| **`ISLAND_VISITED`** | instrumental | primeira visita à ilha |
| **`STAGE_COMPLETED`** | instrumental | etapa da progressão do instrumento |
| **`ETUDE_MASTERED`** | instrumental | estudo técnico aferido por evidência |
| **`REPERTOIRE_PERFORMED`** | instrumental | obra de repertório executada e avaliada |

**Regra:** todo carimbo instrumental exige `evidenceId`. Não se carimba por ter aberto a página — carimba-se por execução medida. É o que liga o Atlas ao motor de prática e ao portfólio, cumprindo as regras constitucionais 4 e 6.

---

## 6. COMPOSITORES E O GRAFO

`HistoricalMaster` já modela biografia, linhagem pedagógica e grafo de influências. `/worlds/graph` deve renderizar **relações reais** entre mestres catalogados — não um array fixo com cinco nós.

Fonte natural: **Grout & Palisca**, agora em `framework_knowledge/music-history/`. A narrativa das eras e as linhagens saem dali, com proveniência página a página (COMANDO 8).

---

## 7. MATRIZ

| Rota | Forma | Situação |
| :--- | :---: | :--- |
| `/worlds` | B | 27/100 — contadores fabricados; sem eixo instrumental |
| `/worlds/island/:slug` | C | **criar** |
| `/worlds/work/:id` | C | 66/100 — melhor de Worlds; falta proveniência resolvida |
| `/worlds/graph` | B | 37/100 — grafo hardcoded |

---

## 8. DEPENDÊNCIAS

| Dependência | Situação |
| :--- | :--- |
| `atlas.repository` + serviço | inexistentes |
| Ingestão do corpus de violino (15 obras) | COMANDO 8 |
| Ingestão de Grout & Palisca para eras e linhagens | COMANDO 8 |
| Catálogo de obras via Wikidata/IMSLP (`21.1`) | inexistente |
| `CulturalPassport` persistido | modelo existe, **órfão** |
| Cruzamento evidência → carimbo | regra constitucional 6, ausente |
