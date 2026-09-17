# WIREFRAMES — 06 · PARTITURA (referência: Dorico / Sibelius / Finale)

**Depende de:** `00_FOUNDATIONS.md`
**Domínio:** `/score`, `/studio/score`
**Formas:** B no catálogo · **D** no editor · **Densidade:** `INSTRUMENT`

> **O que clonamos:** a gramática do editor profissional — folha de papel central, paleta de figuras, inspetor de propriedades, navegador de compassos, entrada por teclado do computador e por MIDI, reprodução com playhead.
>
> **O que adaptamos:** o escopo é **notação pedagógica e analítica**, não gravação editorial de partitura orquestral. Coral SATB, exercícios de harmonia, análise de repertório, trechos de lição. Interoperabilidade real por MusicXML e MIDI.

---

## 1. ESTADO ATUAL

`ScoreEditorScreen`: **125 linhas**, 3 `alert()`, zero entrada de nota. `ScoreScreen`: 267 linhas, arrays fixos, 1 `alert()`. `NotationToolbar` (168 linhas) **órfão**. `exportToMusicXml()` existe no motor, gera XML bem-formado — e **nunca é chamado pela tela**.

Paridade: ~20% estrutural, ~5% funcional.

---

## 2. `/score` — CATÁLOGO DE REPERTÓRIO · Forma B

```
┌───────────────────────────────────────────────────────────────┐
│ Partituras & Repertório      [+ Nova] [Importar MusicXML/MIDI]│
│ [ Minhas │ Repertório canônico │ Exercícios │ Compartilhadas ]│
├──────────────────┬────────────────────────────────────────────┤
│ col 1–3 ▸ sticky │ col 4–12                                   │
│ Compositor       │ ┌────────────────────────────────────────┐ │
│ Era              │ │ [miniatura da pauta]                   │ │
│ Instrumentação   │ │ Coral BWV 262 · J. S. Bach             │ │
│ Clave            │ │ SATB · 16 compassos · Si♭ maior        │ │
│ Tonalidade       │ │ 🌐 Domínio público · fonte IMSLP       │ │
│ Dificuldade      │ │      [Abrir] [Tocar] [Estúdio →]       │ │
│ Fonte            │ └────────────────────────────────────────┘ │
│  ▸ Minhas        │                                            │
│  ▸ IMSLP         │  Obras externas exibem SEMPRE a            │
│  ▸ Musica Bras.  │  proveniência e o cálculo de domínio       │
│  ▸ Lições        │  público (21.1 §5). Sem isso, não aparece. │
└──────────────────┴────────────────────────────────────────────┘
```

---

## 3. `/studio/score` — O EDITOR · Forma D

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ← Partituras │ Coral a 4 vozes  [Salvar] [Exportar▾] [▶] [Estúdio →]    │
├──────────┬──────────────────────────────────────────────┬───────────────┤
│ PALETAS  │  FOLHA (fundo branco, tinta preta)           │ INSPETOR      │
│ 240px    │  centrada, zoom, rolagem vertical            │ 280px         │
│          │                                              │               │
│ ▸ FIGURAS│  ┌────────────────────────────────────────┐  │ SELEÇÃO       │
│ 𝅝 𝅗𝅥 ♩ ♪ ♬│  │  Coral a Quatro Vozes        (serif)   │  │ Nota · Lá4    │
│ . ⁝ ³    │  │  Análise de Condução                   │  │               │
│          │  │                                        │  │ Altura  A4 ▾  │
│ ▸ PAUSAS │  │  𝄞 ♯♯  4/4                              │  │ Duração ♩ ▾   │
│ ▬ ▭ 𝄾 𝄿  │  │  ├─●──●──●──●─┤─●──●──●──●─┤           │  │ Voz     1 ▾   │
│          │  │  Soprano                               │  │ Acid.   ♮ ▾   │
│ ▸ ACID.  │  │                                        │  │               │
│ ♯ ♭ ♮ 𝄪 𝄫│  │  𝄞 ♯♯                                   │  │ ▸ Articulação │
│          │  │  ├─●──●──●──●─┤─●──●──●──●─┤           │  │  · ‾ > ∧      │
│ ▸ DINÂM. │  │  Contralto                             │  │               │
│ pp p mf f│  │                                        │  │ ▸ Dinâmica    │
│ < >      │  │  𝄢 ♯♯                                   │  │               │
│          │  │  ├─●──●──●──●─┤─●──●──●──●─┤           │  │ ▸ Ligadura    │
│ ▸ ARTIC. │  │  Tenor                                 │  │               │
│ · ‾ > ∧ 𝄐│  │                                        │  ├───────────────┤
│          │  │  𝄢 ♯♯                                   │  │ ANÁLISE       │
│ ▸ ESTRUT.│  │  ├─●──●──●──●─┤─●──●──●──●─┤           │  │ ⚠ Quintas     │
│ clave    │  │  Baixo                                 │  │   paralelas   │
│ armadura │  │         ▲ playhead                     │  │   c. 3 S–T    │
│ compasso │  └────────────────────────────────────────┘  │ ✓ Âmbito ok   │
│ barra    │                                              │ ✓ Cruzamento  │
│          │  ┌── NAVEGADOR DE COMPASSOS ──────────────┐  │   ausente     │
│ ▸ VOZES  │  │ ▪▪▪▪|▪▪▪▪|▪▪▪▪|▪▪▪▪  1–16             │  │               │
│ 1 2 3 4  │  └────────────────────────────────────────┘  │ (motor de     │
│          │                                              │  teoria real) │
├──────────┴──────────────────────────────────────────────┴───────────────┤
│ [◀◀][▶][■]  c.3|2  ♩=72  🔊  Zoom [−][100%][+]   [↶ Desfazer][↷ Refazer]│
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.1 O inspetor de análise — nossa diferenciação

Onde o Dorico tem verificação de gravação editorial, nós temos **verificação de condução de vozes**, alimentada pelo `RuleBasedTheoryEngineAdapter`, que já existe e funciona: quintas e oitavas paralelas, cruzamento e sobreposição de vozes, âmbito de cada naipe, resolução da sensível, dobramentos.

Isso liga o Editor diretamente à Academia: o aluno vê o erro **enquanto escreve**, com a citação da regra (Med, capítulo e página).

### 3.2 Entrada de notas — obrigatória

| Meio | Comportamento |
| :--- | :--- |
| Mouse | clicar na pauta insere a figura selecionada |
| Teclado | `A`–`G` altura · `1`–`7` duração · `↑↓` oitava · `#`/`b` acidente · `R` pausa · `.` ponto |
| MIDI | Web MIDI API — tocar insere |
| Navegação | `←→` entre notas · `Tab` entre vozes · `Enter` próximo compasso |
| Edição | `Del` apaga · `Ctrl+Z`/`Ctrl+Y` desfazer/refazer |

**Sem entrada de nota não há editor** — há um visualizador. É o estado atual.

---

## 4. ESCOPO

| Capacidade | Escopo |
| :--- | :--- |
| Pauta de 5 linhas; claves sol, fá, dó (alto/tenor) | ✅ |
| Sistemas: solo, piano (2 pautas), SATB (4) | ✅ |
| Todas as armaduras do ciclo das quintas | ✅ |
| Compassos simples e compostos | ✅ |
| Semibreve → fusa, pontos, quiálteras, ligaduras | ✅ |
| Acidentes, incluindo dobrados | ✅ |
| Dinâmica, articulação, fermata, crescendo | ✅ |
| Até 4 vozes por sistema | ✅ |
| Playback polifônico com playhead | ✅ |
| **Importar e exportar MusicXML** | ✅ inegociável |
| **Importar e exportar MIDI** | ✅ |
| Desfazer/refazer | ✅ |
| Análise de condução de vozes | ✅ diferencial |
| Letra e cifras | 🟡 v2 |
| Extração de partes, layout de página, gravação editorial fina | ❌ |
| Percussão, tablatura, notação contemporânea | ❌ |

---

## 5. MATRIZ DE APLICAÇÃO

| Rota | Forma | Situação |
| :--- | :---: | :--- |
| `/score` | B | hardcoded, 1 `alert()` |
| `/studio/score` | D | 3 `alert()`, sem entrada de nota, sem desfazer, sem playback |

---

## 6. DEPENDÊNCIAS BLOQUEANTES

| Dependência | Situação |
| :--- | :--- |
| Biblioteca de renderização de notação (VexFlow/Verovio/OSMD) | **nenhuma instalada** — decisão a registrar no doc 21 |
| Modelo de documento de partitura com desfazer/refazer | inexistente |
| **Importação** MusicXML | inexistente |
| Exportação MusicXML completa | `PARTIAL` — ignora duração, armadura, compasso, acidentes, vozes; `<duration>4</duration>` fixo |
| MIDI (import/export/Web MIDI) | inexistente |
| Playback polifônico | inexistente |
| `score.repository` + `score.service` | inexistentes |
| `NotationToolbar` | **órfão** |
| Ligar a tela ao `exportToMusicXml()` real | **hoje é `alert()`** |
