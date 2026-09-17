# WIREFRAMES DE REFERÊNCIA — ÍNDICE

**Criado:** 2026-09-16 · COMANDO 2, etapa 1
**Natureza:** especificação **normativa** e permanente. Não é proposta nem inspiração.

---

## Por que este conjunto existe

A auditoria do COMANDO 1 mediu que a plataforma não reproduz a arquitetura de experiência das referências, e identificou a causa: **as telas foram montadas como maquetes visuais isoladas**, sem consumir o design system nem os componentes de domínio que já existiam prontos (23 componentes órfãos, 2.463 linhas), e sem reproduzir o wireframe estrutural (`sticky`: 0/72, grade de 12 colunas: 0/72, `Tabs`: 0 telas).

Auditar contra uma referência que só existe na cabeça de quem audita produz lista de críticas. Auditar contra um wireframe escrito produz **contrato de implementação**.

Estes documentos são, portanto, a base de:
- **COMANDO 2** — auditoria de paridade: medir cada tela contra o wireframe do seu domínio;
- **COMANDOS 3 a 13** — implementação: construir contra a especificação;
- **COMANDO 18** — auditoria final: critério objetivo de aprovação.

---

## Documentos

| # | Documento | Domínio | Referência | Rotas |
| :--- | :--- | :--- | :--- | ---: |
| 00 | [`00_FOUNDATIONS.md`](00_FOUNDATIONS.md) | Transversal | — | todas |
| 01 | [`01_ACADEMY_COURSERA.md`](01_ACADEMY_COURSERA.md) | Academia | Coursera | 22 |
| 02 | [`02_PROFILE_LINKEDIN.md`](02_PROFILE_LINKEDIN.md) | Perfil | LinkedIn | 3 (+1 a criar) |
| 03 | [`03_PRACTICE_DUOLINGO_ASTRA.md`](03_PRACTICE_DUOLINGO_ASTRA.md) | Prática | Duolingo + Astra Trainer | 16 |
| 04 | [`04_ROOMS_SKOOL.md`](04_ROOMS_SKOOL.md) | Salas & Comunidade | Skool | 6 |
| 05 | [`05_STUDIO_DAW.md`](05_STUDIO_DAW.md) | Estúdio | DAW profissional | 3 |
| 06 | [`06_SCORE_NOTATION.md`](06_SCORE_NOTATION.md) | Partitura | Dorico / Sibelius / Finale | 2 |
| 07 | [`07_ADMIN_FOUNDER_CONSOLE.md`](07_ADMIN_FOUNDER_CONSOLE.md) | Console da Fundadora | — (insights · SEO · comunicação · comercial) | 6 |
| 08 | [`08_CORE_UTILITIES.md`](08_CORE_UTILITIES.md) | Núcleo & utilitárias | — | 11 |

**Cobertura:** as 72 telas do produto têm wireframe de referência. Nenhuma ficou sem especificação.

**Especificações técnicas relacionadas:** [`21.1`](../../backend_specs/21.1_CONTENT_APIS_AND_ENTITY_RESOLUTION.md) — acervo de domínio público e resolução de entidades · [`21.2`](../../backend_specs/21.2_MEDIA_DRIVE_ARCHITECTURE.md) — mídia do usuário sobre o Google Drive.

**Leia `00_FOUNDATIONS.md` primeiro.** Os demais dependem dele para grade, formas de página, estados, responsividade, acessibilidade e vinculação a componentes.

---

## As quatro formas de página

Toda tela é uma destas. Não há quinta forma sem justificativa registrada.

| Forma | Nome | Composição | Exemplos |
| :--- | :--- | :--- | :--- |
| **A** | `FOCUS` | 1 coluna, máx. 672px | Login, Avaliação, Certificado, Resultado |
| **B** | `CATALOG` | filtros fixos (3) + resultados (9) | Catálogo, Busca, Diretórios, Admin |
| **C** | `DETAIL` | hero + abas fixas + conteúdo (8) + trilho fixo (4) | Curso, Lição, Perfil, Sala, Habilidade |
| **D** | `WORKSPACE` | ferramentas + área + inspetor + transporte | Estúdio, Editor de Partitura, Sessão |

---

## O bloqueio comum a tudo

**Não existe primitiva de layout com grade de colunas.** `ScreenContainer` entrega apenas título, subtítulo, badge e ações — é essa ausência que produziu 65 telas empilhadas verticalmente.

Criar `PageLayout` (`00_FOUNDATIONS.md §9.1`) é **pré-requisito** das Formas B, C e D, e portanto o primeiro item de implementação do COMANDO 3.

---

## Como usar numa auditoria

Para cada tela, produzir:

```
REFERENCE           — o wireframe deste conjunto
CURRENT             — o que a tela faz hoje, medido
PARITY STATUS       — FULL | PARTIAL | ABSENT
GAP                 — a diferença específica
REQUIRED CHANGE     — a mudança concreta
PRIORITY            — P0 bloqueia · P1 quebra o reconhecimento · P2 refino
```

---

## Regra permanente

> **Referência de produto = clone de estrutura e experiência.**
> **Identidade, conteúdo, dados, integrações, cruzamentos e funcionalidades musicais = próprios.**

E o corolário que governa o escopo:

> Paridade estrutural **não** é ter todas as funcionalidades da referência.
> É que, ao abrir, a pessoa reconheça imediatamente o **tipo de produto** pela organização do espaço.
> Uma aba sem dados não é desenhada por fidelidade — ela não existe.
