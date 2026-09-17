# WIREFRAMES — 03 · PRÁTICA (referências: Duolingo + Astra Trainer)

**Depende de:** `00_FOUNDATIONS.md`
**Domínio:** `/practice/*` — 16 rotas
**Densidade:** `CATALOG` nos painéis · `INSTRUMENT` na sessão

> **Duas referências, dois papéis distintos.**
> **Duolingo** governa o *engajamento*: trilha visual de habilidades, sessão curta e focada, feedback imediato por cor e som, ofensiva, XP, vidas.
> **Astra Trainer** governa a *medição*: telemetria de altura em cents, desvio rítmico em milissegundos, curvas de evolução, identificação de pontos de atrito técnico.
>
> Uma sem a outra falha: só Duolingo vira jogo sem rigor; só Astra vira osciloscópio sem motivação.
>
> **Adaptação:** o Practice é o **campo de práticas da Academia** — cada habilidade nasce de uma competência de lição, e cada sessão gera evidência auditada.

---

## 1. O LOOP CANÔNICO — inviolável

```
   ÁRVORE ──▶ HABILIDADE ──▶ MICRO-HABILIDADE ──▶ EXERCÍCIO
                                                      │
                                                      ▼
                                                  TENTATIVA
                                                      │
                                              ┌───────┴───────┐
                                              ▼               ▼
                                         MEDIÇÃO real    (pitch/ritmo)
                                              │
                                              ▼
                                     FEEDBACK IMEDIATO
                                     verde/carmim + som
                                              │
                                    ┌─────────┴─────────┐
                                    ▼                   ▼
                                 REPETIR            PRÓXIMO
                                    │                   │
                                    └────────┬──────────┘
                                             ▼
                                    RESULTADO DA SESSÃO
                                    XP · ofensiva · maestria
                                             │
                                             ▼
                                    EVIDÊNCIA ──▶ PERFIL
                                             │
                                             ▼
                                  PRÓXIMA HABILIDADE desbloqueada
```

**Defeito atual:** `RuleBasedPracticeScoringAdapter` devolve `pitchDeviationCents: pitchMatch ? 0 : 100` — um booleano vestido de medição. Sem medição real não existe Astra Trainer, e o loop acima é decorativo.

---

## 2. `/practice` — HOME · Forma C

```
┌───────────────────────────────────────────────────────────────┐
│ ┌───────────────────────────────────────────────────────────┐ │
│ │  🔥 7        ⚡ 1.240 XP      ❤️❤️❤️♡♡      🏆 Conservatório│ │
│ │  ofensiva    nível 4          vidas         divisão        │ │
│ └───────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────┤
│ [ Trilha │ Habilidades │ Maestria │ Histórico │ Ligas ] sticky │
├─────────────────────────────────────┬─────────────────────────┤
│ col 1–8                             │ col 9–12 ▸ sticky       │
│ ┌─────────────────────────────────┐ │ ┌─────────────────────┐ │
│ │ META DE HOJE                    │ │ │ ▸ ProgressRing      │ │
│ │ ▓▓▓▓▓▓▓░░░  18 / 20 min        │ │ │      ╭───╮          │ │
│ │ 4 de 5 exercícios               │ │ │     │ 78% │  meta   │ │
│ │ [ CONTINUAR PRÁTICA ]  ← CTA    │ │ │      ╰───╯          │ │
│ └─────────────────────────────────┘ │ │ (órfão—reconectar)  │ │
│                                     │ └─────────────────────┘ │
│ ▸ Continuar de onde parou           │ ┌─────────────────────┐ │
│   [PracticeCard] ← órfão            │ │ OFENSIVA            │ │
│                                     │ │ S T Q Q S S D       │ │
│ ▸ Revisão recomendada               │ │ ● ● ● ● ● ● ○       │ │
│   habilidades com maestria caindo   │ │ 2 congelamentos     │ │
│   [PracticeCard] [PracticeCard]     │ └─────────────────────┘ │
│                                     │ ┌─────────────────────┐ │
│ ▸ Desbloqueado pela Academia        │ │ SUA LIGA            │ │
│   "Concluiu Lição 3 →               │ │ 3º de 12            │ │
│    Intervalos Simples liberado"     │ │ [Ver ranking →]     │ │
│   [PracticeCard]  ← cruzamento!     │ └─────────────────────┘ │
└─────────────────────────────────────┴─────────────────────────┘
```

O bloco "Desbloqueado pela Academia" é a materialização visível da regra constitucional 1.

---

## 3. `/practice/skill-tree` — A TRILHA · Forma C

A imagem-assinatura do Duolingo. Caminho serpenteante, não grade.

```
┌───────────────────────────────────────────────────────────────┐
│ [ Percepção │ Leitura │ Ritmo │ Harmonia │ Instrumento ]      │
├─────────────────────────────────────┬─────────────────────────┤
│  UNIDADE 1 · FUNDAMENTOS DO SOM     │ col 9–12 ▸ sticky       │
│  ─────────────────────────────────  │ ┌─────────────────────┐ │
│                                     │ │ UNIDADE 1           │ │
│            ╭───╮                    │ │ ▓▓▓▓▓░░░ 62%        │ │
│            │ ✓ │  Alturas           │ │ 3 de 5 habilidades  │ │
│            ╰─┬─╯  ●●●●● ouro        │ │                     │ │
│              │                      │ │ Vem da Academia:    │ │
│        ╭───╮ │                      │ │ "Fundamentos de     │ │
│        │ ✓ │─╯    Oitavas           │ │  Teoria" Módulo 1   │ │
│        ╰─┬─╯      ●●●●○             │ │ [Ver lição →]       │ │
│          │                          │ └─────────────────────┘ │
│          │  ╭───╮                   │ ┌─────────────────────┐ │
│          ╰──│ ▶ │  Intervalos       │ │ PRÓXIMA CONQUISTA   │ │
│             ╰─┬─╯  ●●○○○  ← ATUAL   │ │ 🏅 "Ouvido Absoluto"│ │
│               │     pulsando        │ │ faltam 2 habilidades│ │
│         ╭───╮ │                     │ └─────────────────────┘ │
│         │ 🔒│─╯    Tríades          │                         │
│         ╰─┬─╯      LockedState      │                         │
│           │        "Conclua         │                         │
│           │         Intervalos"     │                         │
│        ╭──┴──╮                      │                         │
│        │ 👑  │     PROVA DA UNIDADE │                         │
│        ╰─────╯     🔒               │                         │
└─────────────────────────────────────┴─────────────────────────┘
```

**Contratos:** cada nó é `SkillNode` *(órfão — reconectar)* · 5 estados (`bloqueado` `disponível` `atual` `concluído` `ouro`) · maestria em 5 pontos, não porcentagem crua · nó bloqueado diz **por que** e **como** desbloquear via `LockedState` · caminho visual conectando os nós (SVG), não cards soltos · teclado: setas navegam, Enter abre.

---

## 4. `/practice/skill/:id` — Forma C

Hero com o nó grande, maestria em 5 pontos, e a lista de micro-habilidades com barra individual. Trilho: origem acadêmica da habilidade, evidências geradas, melhor desempenho, e a curva de evolução (Astra).

---

## 5. `/practice/session/:id` — A SESSÃO · Forma D

**Tela cheia, sem shell.** É o momento de foco absoluto.

```
┌───────────────────────────────────────────────────────────────┐
│ [✕]   ▓▓▓▓▓▓▓░░░░░░░  4/10        ❤️❤️❤️♡♡          ⚡ +40 XP │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│                  Que intervalo você ouviu?                    │
│                                                               │
│              ┌───────────────────────────┐                    │
│              │      ▶  OUVIR             │                    │
│              │   [forma de onda real]    │                    │
│              │   ▁▂▅▇▅▂▁▁▂▅▇▅▂▁          │                    │
│              └───────────────────────────┘                    │
│                                                               │
│     ┌──────────────┐  ┌──────────────┐                        │
│     │ Terça menor  │  │ Terça maior  │                        │
│     └──────────────┘  └──────────────┘                        │
│     ┌──────────────┐  ┌──────────────┐                        │
│     │ Quarta justa │  │ Quinta justa │                        │
│     └──────────────┘  └──────────────┘                        │
│                                                               │
├───────────────────────────────────────────────────────────────┤
│                                          [ VERIFICAR ]        │
└───────────────────────────────────────────────────────────────┘

        ▼ após verificar — faixa de feedback sobe de baixo ▼

┌───────────────────────────────────────────────────────────────┐
│ ▓ CERTO!  (verde #15803D)                                     │
│ Terça maior — 4 semitons.                                     │
│ ♪ [ouvir de novo]   📖 Med, p. 63                             │
│                                          [ CONTINUAR ]        │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ ▓ NÃO FOI DESSA VEZ  (carmim #991b1b)                         │
│ Resposta correta: Terça maior (4 semitons).                   │
│ Você respondeu Terça menor (3 semitons).                      │
│ ♪ [ouvir as duas lado a lado]   📖 Med, p. 63                 │
│                              [ TENTAR DE NOVO ] [ CONTINUAR ] │
└───────────────────────────────────────────────────────────────┘
```

### 5.1 Variante de execução — onde entra o Astra Trainer

Para exercícios de canto ou instrumento, o painel de medição é obrigatório:

```
┌───────────────────────────────────────────────────────────────┐
│  Cante a nota Lá (A4 = 440 Hz)                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  AFINAÇÃO ▸ role="meter"                                │  │
│  │  -50 ────────────┬──●───────────── +50 cents            │  │
│  │                  0                                       │  │
│  │              +7 cents · ligeiramente alto               │  │
│  │  detectado: 441,8 Hz · clareza 0,92                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  ESTABILIDADE (últimos 3 s)                             │  │
│  │  ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌  alvo                  │  │
│  │  ╭─╮  ╭──╮   ╭───────╮                                  │  │
│  │ ─╯ ╰──╯  ╰───╯       ╰──                                │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  RITMO · desvio por ataque                              │  │
│  │  ●─── +12ms   ●─ +3ms   ───● −28ms   ● 0ms              │  │
│  │  tendência: atraso médio de 9 ms                        │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

**Contratos de medição (hoje inexistentes):** microfone real via `getUserMedia` · detecção de altura em `AudioWorklet` (o autocorrelacionador atual é O(n²) na thread principal) · desvio em **cents reais** · detecção de ataque com desvio em **milissegundos** · clareza do sinal exibida · sem sinal → estado explícito, nunca número inventado.

---

## 6. `/practice/result/:id` — Forma A

Resultado da sessão: XP ganho com animação de contagem, ofensiva atualizada, precisão, tempo, e o **diagnóstico Astra**: por micro-habilidade, acertos, desvio médio de afinação, desvio rítmico, e o ponto de atrito identificado. Abaixo: maestria antes → depois, evidência gerada (link para o perfil) e próximos passos.

---

## 7. `/practice/mastery` · `/streak` · `/ranking` · `/history`

| Rota | Forma | Conteúdo |
| :--- | :---: | :--- |
| `/practice/mastery` | B | Matriz habilidade × maestria com mapa de calor; ordenável; revisão sugerida por decaimento |
| `/practice/streak` | A | Calendário anual estilo mapa de contribuições; congelamentos; recordes |
| `/practice/ranking` | B | Liga semanal, promoção/rebaixamento. **Hoje é fabricado** (Bach e Chopin com XP) — exige Cloudflare KV (decisão E) ou não existe |
| `/practice/history` | B | `DataGrid` *(órfão)*: data · habilidade · duração · precisão · XP · evidência |

---

## 8. MATRIZ DE APLICAÇÃO

| Rota | Forma | Densidade | Componente-chave |
| :--- | :---: | :--- | :--- |
| `/practice` | C | CATALOG | `ProgressRing` `XPIndicator` `PracticeCard` |
| `/practice/skill-tree` | C | CATALOG | `SkillNode` `LockedState` |
| `/practice/skill/:id` · `/microskill/:id` | C | CATALOG | `SkillNode` `ProgressRing` |
| `/practice/exercise/:id` | A | CATALOG | `PracticeCard` |
| `/practice/session/:id` | **D** | INSTRUMENT | `Waveform` `Tuner` `InstrumentKeyboard` |
| `/practice/feedback/:id` | sobreposição | INSTRUMENT | faixa inferior |
| `/practice/attempt/:id` · `/result/:id` | A | CATALOG | gráficos Astra |
| `/practice/mastery` · `/history` · `/ranking` | B | OPERATIONAL | `DataGrid` |
| `/practice/streak` · `/daily-goal` | A | CATALOG | `ProgressRing` |
| `/practice/profile` | C | CATALOG | — |

---

## 9. GAPS ESTRUTURAIS MEDIDOS

| Gap | Evidência |
| :--- | :--- |
| **0 de 16 telas** têm estado de carregamento | 15 delas buscam dados assíncronos |
| `SkillNode`, `XPIndicator`, `ProgressRing`, `PracticeCard`, `LockedState` **órfãos** | os 5 componentes da linguagem Duolingo existem e não são usados |
| Medição falsa | `pitchDeviationCents: 0 ou 100` |
| Sem microfone real em exercício algum | nenhum `getUserMedia` no domínio |
| `ExerciseSessionScreen` com **1.255 linhas** e 6 arrays fixos | componente-Deus |
| Ranking fabricado | compositores mortos como usuários com XP |
| Sem vidas, sem tolerância a erro | mecânica de engajamento ausente |
| Trilha sem caminho visual | habilidades como cards soltos, não como percurso |
