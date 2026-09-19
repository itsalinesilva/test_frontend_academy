# Conservatório Muscicapa — harness de engenharia

Este pacote é a fonte operacional do projeto: produto, UX, domínio,
engenharia, agentes de IA, qualidade e implantação.

---

## Comece por aqui

| Você é… | Leia, nesta ordem |
|---|---|
| **Agente conversacional** (Claude Code, com terminal) | `HARNESS_CLAUDE.md` → `73_ANTIPATTERNS.md` → `35_TEST_STRATEGY.md` |
| **Agente de geração** (AI Studio, sem repositório em mãos) | `HARNESS_AI_STUDIO.md` → `73_ANTIPATTERNS.md` → `18_FRONTEND_ARCHITECTURE.md` |
| **Pessoa entrando no projeto** | `00_MASTER_ONBOARDING.md` → `01_PRODUCT_SYSTEM.md` → `73_ANTIPATTERNS.md` |
| **Quem vai verificar qualidade** | `74_QUALITY_RITUAL.md` → `72_QUALITY_SWEEP.md` |

> **Ninguém escreve código aqui sem ter lido `73_ANTIPATTERNS.md`.** Ele
> cataloga o que já foi construído errado neste repositório, quanto custou, e
> qual verificação hoje impede a reincidência. É mais curto que consertar
> depois.

---

## Os cinco documentos operacionais

Estes são os que se lê **todo dia**. Os demais são referência de contrato.

| Documento | Responde |
|---|---|
| `HARNESS_CLAUDE.md` | Como o agente conversacional trabalha aqui |
| `HARNESS_AI_STUDIO.md` | Padrões de engenharia para geração assistida |
| `73_ANTIPATTERNS.md` | O que não pode voltar, e o que custou |
| `35_TEST_STRATEGY.md` | Em que ordem se testa, e o que cada camada responde |
| `74_QUALITY_RITUAL.md` | Com que frequência, e o roteiro manual |

E o comando que amarra os cinco:

```bash
npm run verificar     # typecheck + lint + pente fino + testes
```

---

## O ecossistema

```
  docs/harness/            contratos, harness e ritual  ← você está aqui
  docs/claude/             auditorias e diagnósticos datados
  CLAUDE_STATE.md          o estado agora
  CLAUDE_AUDIT.md          achados, com identificador
  CLAUDE_TODO.md           pendências MEDIDAS

  src/domain/              tipos e regras puras · não importam ui nem infra
  src/services/            casos de uso · orquestram, não persistem
  src/repositories/        persistência · única camada que fala com localStorage
  src/ui/                  telas e componentes · não conhecem armazenamento
  src/data/                conteúdo publicado do Conservatório
  src/infrastructure/      adaptadores: armazenamento, áudio, autenticação

  scripts/qa/              o pente fino, por assunto
  scripts/qa.mjs           orquestrador — `npm run qa`
  tests/                   a suíte
  server/                  autoridade de sessão, FORA da raiz do Vite
```

### Três categorias de armazenamento, que nunca se misturam

| Categoria | Exemplos | A publicação de conteúdo reescreve? |
|---|---|---|
| **Conteúdo publicado** | cursos, módulos, lições, atividades | **Sim** — é para isso que existe |
| **Dado do aluno** | progresso, tentativas, certificados, histórico, frequência | **Nunca** |
| **Trabalho editorial** | correções de texto, livretos | **Nunca** |

Misturá-las já custou duas vezes, em direções opostas. Ver `73_ANTIPATTERNS.md` §B3.

---

## Ordem de autoridade

1. **Código e contratos presentes no workspace** — o que está rodando manda
2. Os documentos canônicos deste pacote
3. Decisões em `12_ADR_DECISIONS.md` e `49_DECISION_LOG.md`
4. Documentação de produto
5. Referências externas

Preview visual **nunca** é fonte de verdade arquitetural.

Código que contradiz um contrato é **defeito ou mudança pendente de ADR** — e
a contradição é um achado a reportar, não algo a resolver sozinho escolhendo
o lado mais conveniente.

---

## O que o negócio decide, e que muda decisão técnica

| Fato | Consequência |
|---|---|
| **Curso livre**, certificação própria, **sem vínculo com o MEC** | A ressalva vai no documento impresso e não é editável no Estúdio |
| **Sem banco de dados** — `localStorage` + cópia no Drive da pessoa | Isolamento por `userId` em toda leitura, sem exceção |
| **Entrada só pelo Google** | Não existe senha para criar, memorizar ou vazar |
| **Allowlist no servidor** | `isAdmin` vem da sessão assinada, nunca do cliente |
| **Conteúdo autoral** | Nenhuma citação de fonte, obra ou instituição, em lugar nenhum |
| **Kids restrito** | A variante infantil restringe alcance; não empobrece conteúdo |
| **Cloudflare Pages a partir do git** | Sem passo manual; nenhum segredo no pacote |
| **Paleta anil e ouro** | Nenhuma cor de destaque nova sem decisão |

Administradores fundadores: `alinealv.silv@gmail.com` e
`office.alinesilva@gmail.com`. A autorização é **server-side por allowlist em
variável de ambiente**. Allowlist vazia ⇒ nenhum administrador.

---

## Estado comercial

Produto inicialmente gratuito. O modelo de entitlement existe desde o início
para suportar planos futuros, sem pagamento nem paywall na primeira versão.

---

## Referências arquiteturais

Coursera (aprendizagem estruturada), Duolingo (prática e progressão), Skool
(sala e comunidade de curso), LinkedIn (identidade profissional e portfólio).

> O blueprint **não autoriza copiar interface nem marca**. Define padrões
> funcionais, adaptados ao produto. E a paridade se mede por estrutura
> declarada — `npm run measure:parity` —, não por impressão.

---

## Ordem de leitura dos contratos

Fundamento: `00_MASTER_ONBOARDING` → `01_PRODUCT_SYSTEM` →
`02_IDENTITY_PROFILE_SOCIAL` → `03_MAPS_PATHS_PASSPORTS` → `04_DOMAIN_MODEL` →
`05_API_SECURITY_INFRA` → `06_TOOL_CATALOG` → `07_TEACHER_ROOM` →
`08_PROFILE_EVIDENCE_PORTFOLIO` → `09_SOURCE_IP_PROVENANCE` →
`10_IMPLEMENTATION_ORDER` → `11_VERTICAL_SLICES` → `12_ADR_DECISIONS` →
`13_DEFINITION_OF_DONE` → `14_COMMERCIAL_STRATEGY`

Construção: `15` a `49`, por área.

Contratos de tela e de motor: `50` a `71`.

Qualidade: **`72_PENTE_FINO_QUALIDADE`**, **`73_ANTIPADROES`**,
**`74_RITUAL_DE_QUALIDADE`**.

Índice completo em `DOC_INDEX.md`.
