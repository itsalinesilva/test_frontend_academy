# WIREFRAMES — 01 · ACADEMIA (referência estrutural: Coursera)

**Depende de:** `00_FOUNDATIONS.md`
**Domínio:** `/academy/*` — 22 rotas
**Densidade:** `CATALOG` no catálogo · `EDITORIAL` na lição · `OPERATIONAL` no histórico

> **O que clonamos:** a arquitetura de ensino superior formal — hierarquia de 5 níveis, página de apresentação de disciplina com trilho de matrícula fixo, ambiente de aula com sumário lateral persistente, avaliação cronometrada, gabarito analítico, diploma verificável.
>
> **O que adaptamos:** o conteúdo é o corpus musical erudito (base oficial **Bohumil Med**, ADR-002); a identidade é pedra/carmim/bordô; não existem "parceiros universitários", preços, nem certificados pagos.

---

## 1. HIERARQUIA CANÔNICA

```
PROGRAMA  (plurianual)
   └── TRILHA  (sequência com pré-requisitos)
          └── DISCIPLINA / CURSO
                 └── MÓDULO
                        └── LIÇÃO ──▶ ATIVIDADE ──▶ QUIZ
                        └── AVALIAÇÃO SOMATIVA (fim de módulo/curso)
                               └── CERTIFICADO
```

Regra de navegação: **todo nível é alcançável e todo nível sabe voltar.** Breadcrumb obrigatório do 3º nível em diante.

---

## 2. `/academy` — HOME · Forma C

```
┌───────────────────────────────────────────────────────────────┐
│ HERO — continuidade, não marketing                            │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ "Continue de onde parou"                                  │ │
│ │ ┌────────────────────────────────────────────┐            │ │
│ │ │ [capa] Disciplina · Módulo 2 · Lição 3     │  47% ▓▓▓░░ │ │
│ │ │        "Intervalos Simples"      [Retomar] │            │ │
│ │ └────────────────────────────────────────────┘            │ │
│ └───────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────┤
│ [ Visão Geral │ Meus Cursos │ Trilhas │ Programas ] ▸ sticky   │
├─────────────────────────────────────┬─────────────────────────┤
│ col 1–8                             │ col 9–12 ▸ sticky       │
│                                     │                         │
│ ▸ Em andamento                      │ ┌─────────────────────┐ │
│   [CourseCard] [CourseCard]         │ │ SEU PROGRESSO       │ │
│                                     │ │ ○ 2 em andamento    │ │
│ ▸ Próximo passo recomendado         │ │ ○ 0 concluídos      │ │
│   [LessonCard] ← órfão, reconectar  │ │ ○ 4h estudadas      │ │
│                                     │ └─────────────────────┘ │
│ ▸ Trilhas para você                 │ ┌─────────────────────┐ │
│   [ PathCard ] [ PathCard ]         │ │ PRÁTICA VINCULADA   │ │
│                                     │ │ 3 habilidades       │ │
│ ▸ Explorar por cátedra              │ │ desbloqueadas       │ │
│   [chips de categoria]              │ │ [Ir para Prática →] │ │
│                                     │ └─────────────────────┘ │
│                                     │ ┌─────────────────────┐ │
│                                     │ │ CERTIFICADOS        │ │
│                                     │ │ (vazio → como obter)│ │
│                                     │ └─────────────────────┘ │
└─────────────────────────────────────┴─────────────────────────┘
```

**Estados:** `EMPTY` (sem matrícula) mostra o hero substituído por convite ao catálogo — **não** um card vazio.
**Cruzamento obrigatório:** o painel "Prática vinculada" materializa a regra constitucional 1 (Curso → Prática).

---

## 3. `/academy/catalog` · `/academy/search/results` · `/academy/category/:id` — Forma B

```
┌───────────────────────────────────────────────────────────────┐
│ Breadcrumb: Início › Academia › Catálogo                      │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ [ 🔍 buscar disciplinas, competências, obras…         ]   │ │
│ │ 3 disciplinas · ordenar por: [Relevância ▾]               │ │
│ └───────────────────────────────────────────────────────────┘ │
├──────────────────┬────────────────────────────────────────────┤
│ col 1–3 ▸ sticky │ col 4–12                                   │
│                  │                                            │
│ FILTROS          │ ┌────────────────────────────────────────┐ │
│ ▸ Nível          │ │ [capa]  Fundamentos de Teoria Musical  │ │
│   ☐ Fundamental 3│ │         Prof. …  ·  Fundamental        │ │
│   ☐ Intermed.  0 │ │         ⏱ 12h · 3 módulos · 4 lições   │ │
│   ☐ Avançado   0 │ │         Competências: ▪ ▪ ▪            │ │
│ ▸ Cátedra        │ │         ▓▓▓░░░ 47%      [Continuar]    │ │
│ ▸ Instrumento    │ └────────────────────────────────────────┘ │
│ ▸ Carga horária  │ ┌────────────────────────────────────────┐ │
│ ▸ Competência    │ │ …                                      │ │
│                  │ └────────────────────────────────────────┘ │
│ [Limpar filtros] │ [ ‹ 1 2 3 › ]                              │
└──────────────────┴────────────────────────────────────────────┘
```

**Exigências:** cada faceta mostra **contagem real**; filtros refletidos na URL (compartilhável); filtro sem resultado → `EMPTY` com sugestão de relaxar critério.
**Defeito atual a corrigir:** o catálogo anuncia números que não correspondem ao acervo (`01_REPOSITORY_AUDIT.md §I.10`).

---

## 4. `/academy/course/:id` — DETALHE DA DISCIPLINA · Forma C

**A tela mais importante do domínio.** É por ela que se reconhece uma plataforma acadêmica.

```
┌───────────────────────────────────────────────────────────────┐
│ Breadcrumb: Início › Academia › Catálogo › Fundamentos…       │
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ HERO (fundo bordô #6D1D2D, tinta clara)                   ║ │
│ ║ Programa ▸ Trilha  (links reais para o nível acima)        ║ │
│ ║ ┌───────────────────────────────────────────────────────┐ ║ │
│ ║ │ FUNDAMENTOS DE TEORIA MUSICAL          (serifada 40px)│ ║ │
│ ║ │ Ementa em uma frase                                   │ ║ │
│ ║ │ [Fundamental] ⏱12h · 3 módulos · 4 lições · 1 exame   │ ║ │
│ ║ │ [avatar] Corpo docente                                │ ║ │
│ ║ └───────────────────────────────────────────────────────┘ ║ │
│ ╚═══════════════════════════════════════════════════════════╝ │
├───────────────────────────────────────────────────────────────┤
│ [Visão Geral│Grade│Competências│Bibliografia│Materiais│Avaliação] ▸ sticky │
├─────────────────────────────────────┬─────────────────────────┤
│ col 1–8                             │ col 9–12 ▸ sticky top-20│
│                                     │ ┌─────────────────────┐ │
│ ▸ Sobre esta disciplina             │ │ ▓▓▓▓░░░░ 47%        │ │
│   texto acadêmico, medida 65ch      │ │ Módulo 2 de 3       │ │
│                                     │ │                     │ │
│ ▸ O que você será capaz de fazer    │ │ [ CONTINUAR ]  ←CTA │ │
│   ✓ objetivo · ✓ objetivo           │ │ Lição 3 · 15 min    │ │
│                                     │ ├─────────────────────┤ │
│ ▸ Pré-requisitos                    │ │ ⏱ 12 horas          │ │
│   [chip] [chip]  ou "nenhum"        │ │ 📜 Certificado ao   │ │
│                                     │ │    concluir         │ │
│ ▸ GRADE CURRICULAR                  │ │ 🎯 3 habilidades    │ │
│  ┌─────────────────────────────────┐│ │    desbloqueáveis   │ │
│  │ ▼ Módulo 1 · Notação   ✓ 100%   ││ ├─────────────────────┤ │
│  │   ✓ Lição 1 · 15min   [Rever]   ││ │ Corpo docente       │ │
│  │   ✓ Atividade 1                 ││ │ [avatar] nome       │ │
│  │   ✓ Quiz · 8/10                 ││ ├─────────────────────┤ │
│  │ ▼ Módulo 2 · Escalas   ▓░ 40%   ││ │ Fontes              │ │
│  │   ✓ Lição 2                     ││ │ Med, cap. 1–4       │ │
│  │   ▸ Lição 3  ← atual            ││ │ Berklee I, cap. 2   │ │
│  │   🔒 Lição 4                     ││ ├─────────────────────┤ │
│  │ ▶ Módulo 3 · Intervalos  🔒      ││ │ Trilha relacionada  │ │
│  │ ▶ Avaliação Final        🔒      ││ │ Obras no Atlas      │ │
│  └─────────────────────────────────┘│ └─────────────────────┘ │
│                                     │                         │
│ ▸ Bibliografia (proveniência real)  │                         │
│ ▸ Disciplinas relacionadas          │                         │
└─────────────────────────────────────┴─────────────────────────┘
```

**Contratos:**
- O acordeão da grade é a **espinha dorsal** — expansível, com estado por item (`✓ concluído`, `▸ atual`, `🔒 bloqueado` via `LockedState`).
- O trilho é **fixo** e o CTA muda conforme o estado: `Matricular-se` → `Continuar` → `Ver certificado`.
- Sem matrícula: grade visível mas lições bloqueadas; **nunca esconder a estrutura** — é ela que vende o curso.
- "Fontes" exibe proveniência real; citação não verificada aparece marcada, nunca silenciosamente.

---

## 5. `/academy/lesson/:id` — AMBIENTE DE AULA · Forma C variante

O sumário substitui as abas e **persiste** — é o que faz parecer uma aula, não um artigo.

```
┌───────────────────────────────────────────────────────────────┐
│ ← Voltar à disciplina    Módulo 2 · Lição 3 de 4    ▓▓▓░ 47%  │
├────────────────────┬──────────────────────────────────────────┤
│ col 1–3 ▸ sticky   │ col 4–12  ·  EDITORIAL  ·  medida 65ch   │
│ SUMÁRIO DO CURSO   │                                          │
│                    │ ┌──────────────────────────────────────┐ │
│ ▼ Módulo 1      ✓  │ │ H1 · Intervalos Simples   (serifada) │ │
│   ✓ Lição 1        │ │ ⏱ 15 min · Objetivos: ✓ ✓            │ │
│   ✓ Lição 2        │ └──────────────────────────────────────┘ │
│ ▼ Módulo 2         │                                          │
│   ✓ Lição 2        │ Texto acadêmico formatado.               │
│   ▸ Lição 3 ←atual │                                          │
│     · Seção 1      │ ┌──────────────────────────────────────┐ │
│     · Seção 2      │ │ ♪ EXEMPLO SONORO                     │ │
│   🔒 Lição 4        │ │ [▶] Terça maior · C4–E4              │ │
│ ▶ Módulo 3      🔒  │ │ síntese WebAudio real                │ │
│ ▶ Avaliação     🔒  │ └──────────────────────────────────────┘ │
│                    │                                          │
│ ┌────────────────┐ │ ┌──────────────────────────────────────┐ │
│ │ Tempo: 6/15min │ │ │ 🎼 PARTITURA · Staff                 │ │
│ └────────────────┘ │ │ [▶ tocar] [abrir no editor →]        │ │
│                    │ └──────────────────────────────────────┘ │
│                    │                                          │
│                    │ ┌──────────────────────────────────────┐ │
│                    │ │ 🖼 MANUSCRITO (Commons/IMSLP)        │ │
│                    │ │ legenda + proveniência + licença     │ │
│                    │ └──────────────────────────────────────┘ │
│                    │                                          │
│                    │ ▸ Verificação de leitura                 │
│                    │ ▸ Referências (Med, p. 41–48)            │
│                    │                                          │
│                    │ ┌──────────────────────────────────────┐ │
│                    │ │ 🎯 PRATICAR ESTA COMPETÊNCIA          │ │
│                    │ │ "Identificação de intervalos"        │ │
│                    │ │ [Abrir no Treinador →]  ← contextual!│ │
│                    │ └──────────────────────────────────────┘ │
│                    │                                          │
│                    │ [← Lição anterior]  [Concluir e seguir →]│
└────────────────────┴──────────────────────────────────────────┘
```

**Contratos:**
- **Tempo real de estudo** medido e persistido; conclusão exige leitura efetiva, não só o clique.
- O CTA de prática aponta para a **habilidade específica** (`/practice/skill/:id`), não para `/practice` genérico. Esta é a diferença entre cumprir e não cumprir a regra constitucional 1.
- Ilustração só é exibida com proveniência resolvida (`21.1 §5`); sem fonte, a seção não existe.
- `< lg`: sumário vira `Drawer` acionado por "Conteúdo do curso".

---

## 6. `/academy/assessment/:id` — AVALIAÇÃO · Forma A

```
┌──────────────────────────────────────────────────────────┐
│ AVALIAÇÃO FINAL          ⏱ 28:14  ▸ sticky · fixo        │
│ Questão 4 de 10   ●●●○○○○○○○                             │
├──────────────────────────────────────────────────────────┤
│  Enunciado (peso 2,0)                                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ♪ [▶] Ouça o intervalo                             │  │
│  └────────────────────────────────────────────────────┘  │
│  ○ Terça menor    ○ Terça maior                          │
│  ○ Quarta justa   ○ Quinta justa                         │
│                                                          │
│  [← Anterior]  [Marcar p/ revisão]  [Próxima →]          │
├──────────────────────────────────────────────────────────┤
│ [ Revisar marcadas ]              [ ENTREGAR AVALIAÇÃO ] │
└──────────────────────────────────────────────────────────┘
```

Cronômetro persiste a recarga · sem feedback durante a prova · confirmação antes de entregar · tempo esgotado entrega automaticamente · navegação livre entre questões.

**`/academy/result/:id` — gabarito analítico:** nota, aprovação, e **questão a questão**: sua resposta, a correta, a explicação, o conceito e a **fonte com página**. Reprovado → caminho de recuperação.

---

## 7. `/academy/certificate/:id` — Forma A

Página de papel: fundo branco, moldura bordô, serifada. Nome, disciplina, carga horária, competências atestadas, data, **hash SHA-256**, código de verificação e QR para o endpoint público de verificação por assinatura (ADR-001.A — sem banco). `@media print` limpo, sem navegação.

---

## 8. `/academy/my-learning` · `/academy/history` — Forma B / `OPERATIONAL`

`Meu Aprendizado`: abas Em andamento · Concluídos · Salvos · Certificados. Lista densa 72px com progresso e retomada em um clique.
`Histórico`: `DataGrid` *(órfão — reconectar)*. Colunas: data · ato · entidade · nota · carga horária · evidência. Ordenável, filtrável, exportável. Registro imutável.

---

## 9. MATRIZ DE APLICAÇÃO

| Rota | Forma | Trilho fixo | Abas | Densidade |
| :--- | :---: | :---: | :---: | :--- |
| `/academy` | C | ✓ | ✓ | CATALOG |
| `/academy/catalog` · `/search/results` · `/category/:id` | B | ✓ filtros | — | CATALOG |
| `/academy/program/:id` · `/path/:id` | C | ✓ | ✓ | CATALOG |
| `/academy/course/:id` (+ `/curriculum` `/progress`) | C | ✓ | ✓ | CATALOG |
| `/academy/module/:id` | C | ✓ | — | CATALOG |
| `/academy/lesson/:id` (+ `/interactive`) | C variante | ✓ sumário | — | EDITORIAL |
| `/academy/activity/:id` · `/quiz/:id` | A | — | — | EDITORIAL |
| `/academy/assessment/:id` | A | ✓ cronômetro | — | EDITORIAL |
| `/academy/result/:id` · `/completion/:id` · `/certificate/:id` | A | — | — | EDITORIAL |
| `/academy/my-learning` | B | — | ✓ | CATALOG |
| `/academy/history` · `/academic-profile` | B | — | ✓ | OPERATIONAL |

---

## 10. CRUZAMENTOS OBRIGATÓRIOS NESTE DOMÍNIO

| Origem | Destino | Onde aparece |
| :--- | :--- | :--- |
| Lição | Habilidade específica | CTA contextual no fim da lição (§5) |
| Curso | Obras do Atlas | Trilho do detalhe (§4) |
| Lição | Editor de partitura | Botão no bloco de partitura (§5) |
| Avaliação aprovada | Evidência → Perfil | Automático ✅ *(já funciona)* |
| Certificado | Portfólio | Ação na tela de certificado |
| Conclusão de módulo | Carimbo de passaporte | Automático |
