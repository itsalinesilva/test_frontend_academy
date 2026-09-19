# WIREFRAMES — 08 · NÚCLEO & UTILITÁRIAS

**Depende de:** `00_FOUNDATIONS.md`
**Domínio:** `/`, `/search`, `/notifications`, `/settings`, `/help`, `/onboarding`, `/auth/*`, 404
**Referência:** não há referência externa única — estas telas seguem convenção de produto e as fundações.

---

## 1. `/` — VISÃO GERAL · Forma C

A primeira tela depois do login. Não é vitrine: é **retomada**.

```
┌───────────────────────────────────────────────────────────────┐
│ Bom dia, Aline.                          🔥 7 dias de estudo  │
├─────────────────────────────────────┬─────────────────────────┤
│ col 1–8                             │ col 9–12 ▸ sticky       │
│ ┌─────────────────────────────────┐ │ ┌─────────────────────┐ │
│ │ CONTINUE                        │ │ │ HOJE                │ │
│ │ Fundamentos · Módulo 2 · Lição 3│ │ │ ○ Meta 18/20 min    │ │
│ │ ▓▓▓▓░░░ 47%        [Retomar →]  │ │ │ ○ 1 tarefa (2 dias) │ │
│ └─────────────────────────────────┘ │ │ ○ Recital sáb 19h   │ │
│                                     │ └─────────────────────┘ │
│ ▸ Seus 8 pilares                    │ ┌─────────────────────┐ │
│  ┌────┐┌────┐┌────┐┌────┐           │ │ ATIVIDADE RECENTE   │ │
│  │Acad││Prát││Mund││Comu│           │ │ ● lição concluída   │ │
│  └────┘└────┘└────┘└────┘           │ │ ● 45 min de prática │ │
│  ┌────┐┌────┐┌────┐┌────┐           │ │ ● evidência gerada  │ │
│  │Estú││Part││Sala││Perf│           │ └─────────────────────┘ │
│  └────┘└────┘└────┘└────┘           │ ┌─────────────────────┐ │
│    cada um com contagem REAL        │ │ SUGESTÃO            │ │
│                                     │ │ "Pratique intervalos│ │
│ ▸ Retome a prática                  │ │  antes da avaliação"│ │
│   habilidades com maestria caindo   │ └─────────────────────┘ │
└─────────────────────────────────────┴─────────────────────────┘
```
**Contrato:** nenhum contador aparece sem dado real. Usuário novo vê `EMPTY` com o caminho de início, **não** cards zerados.

---

## 2. `/search` — BUSCA GLOBAL · Forma B

```
┌───────────────────────────────────────────────────────────────┐
│ [ 🔍 buscar em toda a Academia…                    ]  ⌘K      │
│ 47 resultados para "intervalos"                               │
│ [ Tudo 47 │ Cursos 3 │ Lições 4 │ Habilidades 6 │ Obras 12 │  │
│   Pessoas 8 │ Tópicos 14 ]                          ▸ Tabs    │
├──────────────────┬────────────────────────────────────────────┤
│ col 1–3 ▸ sticky │ col 4–12 — resultados agrupados por tipo,  │
│ Tipo · Nível     │ com o tipo visível em cada linha e realce  │
│ Era · Instrumento│ do termo encontrado                        │
└──────────────────┴────────────────────────────────────────────┘
```

**Busca de pessoas (ADR-003):** executada por `GET /api/v1/people/search?q=` numa Cloudflare Function sobre o índice em KV. O índice **nunca chega ao navegador** — o peso não é limitante em nenhuma escala. Resultado traz cartão de perfil (nome, headline, instrumentos, avatar) e link para `/profile/:userId`.

**Busca sem resultado é sinal de produto** — o termo alimenta o painel "Conteúdo mais procurado" do console da fundadora (`07 §2`).

---

## 3. `/notifications` — Forma B

Abas `Tudo · Acadêmico · Salas · Comunidade · Sistema`. Não lidas em destaque; ação em massa "marcar tudo como lido"; cada item leva ao contexto exato de origem. Respeita a preferência de canal do perfil. `EMPTY` é um estado bom: "tudo em dia".

---

## 4. `/settings` — Forma C

Abas `Conta · Áudio & MIDI · Privacidade · Notificações · Acessibilidade · Dados`.

**Aba Dados** — materializa o ADR-001.A e precisa existir:

```
┌─────────────────────────────────────────────────────────┐
│ CÓPIA DE SEGURANÇA                                      │
│ ✓ Último backup: hoje, 14:32 — Google Drive             │
│   pasta privada do app · 2,4 MB                         │
│   [Fazer backup agora]  [Restaurar]  [Baixar JSON]      │
├─────────────────────────────────────────────────────────┤
│ MÍDIA NO SEU DRIVE                                      │
│ 12 arquivos · 340 MB na sua conta Google                │
│ 8 publicados (link público) · 4 privados                │
│   [Gerenciar]                                           │
├─────────────────────────────────────────────────────────┤
│ 🔴 EXCLUIR CONTA                                        │
│ Remove seus dados da plataforma. Os arquivos no seu     │
│ Drive permanecem seus e não são apagados.               │
└─────────────────────────────────────────────────────────┘
```
Honestidade obrigatória: dizer que os dados vivem no navegador e no Drive da pessoa, e o que acontece ao limpar o navegador.

---

## 5. `/onboarding` — Forma A, em passos

Hoje tem **1.010 linhas** — componente-Deus a quebrar.

`1 Boas-vindas → 2 Perfil → 3 Instrumentos → 4 Nível → 5 Objetivos → 6 Preferências → 7 Modo Kids (condicional) → 8 Trilha sugerida`

Progresso visível, voltar sempre possível, nada obrigatório exceto o vínculo de responsável no modo Kids. Termina numa recomendação **real**, derivada das respostas.

---

## 6. `/auth/*` — Forma A

Reescritas no Bloco 0; média **84/100**, a maior do repositório. `login` e `register` levam o botão oficial do Google; `recovery` aponta para a recuperação da Conta Google (a plataforma não tem senha). **`/auth/callback` ficou órfã** — o GIS usa popup, não redirecionamento: remover na limpeza de rotas.

---

## 7. `/help` e 404 — Forma B / A

`help`: busca na base + categorias + artigo. O `alert()` atual no suporte deve virar formulário real ou canal declarado.
`404`: sugere o caminho provável e oferece busca. Hoje está correta (77/100).

---

## 8. MATRIZ

| Rota | Forma | Abas | Trilho | Situação |
| :--- | :---: | :---: | :---: | :--- |
| `/` | C | — | ✓ | 23/100 — hardcoded |
| `/search` | B | ✓ | ✓ filtros | 7/100 — sem `Tabs`, hardcoded |
| `/notifications` | B | ✓ | — | 11/100 — hardcoded |
| `/settings` | C | ✓ | — | 50/100 — sem `Tabs`; falta aba Dados |
| `/onboarding` | A | passos | — | 60/100 — 1.010 linhas |
| `/auth/login` `/register` `/recovery` | A | — | — | ✅ 77–89/100 |
| `/auth/callback` | — | — | — | **órfã — remover** |
| `/help` | B | — | ✓ | 20/100 — `alert()` |
| 404 | A | — | — | ✅ 77/100 |
