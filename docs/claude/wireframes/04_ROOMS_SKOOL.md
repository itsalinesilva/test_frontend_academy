# WIREFRAMES — 04 · SALAS & CÁTEDRAS (referência estrutural: Skool)

**Depende de:** `00_FOUNDATIONS.md`
**Domínio:** `/rooms`, `/rooms/:id`, `/rooms/create` — e a Comunidade em `/community/*`
**Densidade:** `CATALOG`

> **O que clonamos:** o espaço soberano do professor, com a tríade que define o Skool — **Comunidade · Sala de Aula · Calendário**, mais membros e ranking de engajamento — tudo sob uma navegação de abas dentro do espaço, não fora dele.
>
> **O que adaptamos:** é a **Cátedra**. O "classroom" do Skool aqui é alimentado pela Academia da plataforma; as tarefas são submissões de repertório com parecer pedagógico; o ranking é engajamento acadêmico, não vaidade.
>
> **Dependência dura:** este domínio é o mais afetado pela decisão E. Uma sala é, por definição, **estado compartilhado entre pessoas** — não cabe em `localStorage`. Sem Cloudflare KV, este wireframe não é implementável.

---

## 1. ESTADO ATUAL

3 telas, **0 serviços**, arrays fixos, 2 `alert()`. `domain/teacher.ts` tem 175 linhas e 12 interfaces — **sem repositório e sem serviço**. Paridade estrutural estimada: ~20%. É o domínio mais distante da referência.

---

## 2. `/rooms` — DIRETÓRIO · Forma B

```
┌───────────────────────────────────────────────────────────────┐
│ Cátedras & Salas                          [+ Abrir Cátedra]   │
│ [ Todas │ Minhas salas │ Que leciono │ Abertas ]              │
├──────────────────┬────────────────────────────────────────────┤
│ col 1–3 ▸ sticky │ col 4–12                                   │
│ Instrumento      │ ┌────────────────────────────────────────┐ │
│ Nível            │ │ [capa]  Cátedra de Cravo Histórico     │ │
│ Formato          │ │  [av]   Prof. Nome · 16 membros        │ │
│ Vagas            │ │         Próximo encontro: ter 18:00    │ │
│                  │ │         ▪ 3 tarefas abertas            │ │
│                  │ │                        [Solicitar →]   │ │
│                  │ └────────────────────────────────────────┘ │
└──────────────────┴────────────────────────────────────────────┘
```

---

## 3. `/rooms/:id` — A CÁTEDRA · Forma C

**O coração do domínio.** As abas aqui são o Skool.

```
┌───────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗ │
│ ║ CAPA DA CÁTEDRA                                           ║ │
│ ╚═══════════════════════════════════════════════════════════╝ │
│  [av] Cátedra de Cravo Histórico        [Convidar] [⚙ Gerir] │
│       Prof. Nome · 16 membros · 3 tarefas abertas             │
├───────────────────────────────────────────────────────────────┤
│ [Mural│Sala de Aula│Tarefas│Membros│Calendário│Ranking│Sobre] │
│                                                    ▸ sticky   │
├─────────────────────────────────────┬─────────────────────────┤
│ col 1–8                             │ col 9–12 ▸ sticky       │
│                                     │ ┌─────────────────────┐ │
│ ┌─── ABA: MURAL ──────────────────┐ │ │ SUA SITUAÇÃO        │ │
│ │ ┌─────────────────────────────┐ │ │ │ ▓▓▓░ 3 de 5 tarefas │ │
│ │ │ [av] Publicar no mural…     │ │ │ │ ⏰ Próximo prazo:   │ │
│ │ └─────────────────────────────┘ │ │ │    Invenção 1 · 2d  │ │
│ │ [📌 fixado]                     │ │ │ [Enviar →]          │ │
│ │ ┌─────────────────────────────┐ │ │ └─────────────────────┘ │
│ │ │ [av] Prof. Nome · 2h        │ │ │ ┌─────────────────────┐ │
│ │ │ Orientações da semana 4     │ │ │ │ PRÓXIMO ENCONTRO    │ │
│ │ │ 📎 partitura anexa          │ │ │ │ ter · 18:00         │ │
│ │ │ ♥ 8   💬 4 respostas        │ │ │ │ [Adicionar agenda]  │ │
│ │ └─────────────────────────────┘ │ │ └─────────────────────┘ │
│ │ ▸ ForumCard (órfão)             │ │ ┌─────────────────────┐ │
│ └─────────────────────────────────┘ │ │ MEMBROS (16)        │ │
│                                     │ │ [av][av][av][av]+12 │ │
│ ┌─── ABA: SALA DE AULA ───────────┐ │ └─────────────────────┘ │
│ │ ▼ Módulo: Toque Articulado      │ │ ┌─────────────────────┐ │
│ │   ✓ Aula 1 · vídeo + partitura  │ │ │ RANKING SEMANAL     │ │
│ │   ▸ Aula 2 · atual              │ │ │ 1. nome      420 pt │ │
│ │   🔒 Aula 3                      │ │ │ 2. você      310 pt │ │
│ │ ▶ Módulo: Ornamentação     🔒    │ │ └─────────────────────┘ │
│ │ (curso da Academia OU próprio)  │ │                         │
│ └─────────────────────────────────┘ │                         │
│                                     │                         │
│ ┌─── ABA: TAREFAS ────────────────┐ │                         │
│ │ ALUNO                           │ │                         │
│ │ ┌─────────────────────────────┐ │ │                         │
│ │ │ Invenção nº 1 (BWV 772)     │ │ │                         │
│ │ │ prazo 20/09 · áudio ou vídeo│ │ │                         │
│ │ │ [Enviar gravação]           │ │ │                         │
│ │ │ ──────────────────────────  │ │ │                         │
│ │ │ ✓ Entregue · nota 8,5       │ │ │                         │
│ │ │ 💬 Parecer do professor ▾   │ │ │                         │
│ │ └─────────────────────────────┘ │ │                         │
│ │                                 │ │                         │
│ │ PROFESSOR — fila de correção    │ │                         │
│ │ ┌─────────────────────────────┐ │ │                         │
│ │ │ ⏳ 4 aguardando parecer      │ │ │                         │
│ │ │ [av] aluno · 2:14  [Avaliar]│ │ │                         │
│ │ │      ▁▂▅▇▅▂▁ forma de onda  │ │ │                         │
│ │ └─────────────────────────────┘ │ │                         │
│ └─────────────────────────────────┘ │                         │
└─────────────────────────────────────┴─────────────────────────┘
```

### 3.1 Abas — conteúdo e permissão

| Aba | Aluno | Professor |
| :--- | :--- | :--- |
| **Mural** | ler, publicar, responder | + fixar, moderar, excluir |
| **Sala de Aula** | consumir aulas em ordem | criar/editar módulos e aulas, publicar |
| **Tarefas** | ver, enviar, ver parecer | criar, definir prazo, **fila de correção**, avaliar |
| **Membros** | lista + perfis | + aprovar, remover, promover a monitor |
| **Calendário** | ver, confirmar presença | criar encontros, bancas, recitais |
| **Ranking** | ver | ver + critérios |
| **Sobre** | ler regras e método | editar |
| **Análises** | — | frequência, entregas, progresso por aluno |

### 3.2 O ciclo da tarefa — o que faz a Cátedra existir

```
Professor cria ──▶ prazo ──▶ Aluno grava/anexa ──▶ SUBMISSÃO
                                                        │
                                                        ▼
                                              fila de correção
                                                        │
                                          Professor avalia + parecer
                                                        │
                                              ┌─────────┴─────────┐
                                              ▼                   ▼
                                          EVIDÊNCIA          nota no
                                       (auditada)         histórico
                                              │
                                              ▼
                                      PERFIL do aluno
```

Este ciclo é a regra constitucional 7 e **não existe hoje**.

---

## 4. `/rooms/create` — Forma A

Assistente em 4 passos: identidade (nome, capa, instrumento, nível) → método (regras, ementa) → conteúdo (vincular curso da Academia ou criar módulos) → acesso (aberta, por solicitação, por convite). Exige capacidade `room.management.create`.

---

## 5. COMUNIDADE — `/community/*` · Forma B/C

Mesma linguagem do Mural, em escala global. `/community` lista tópicos (`ForumCard` órfão) com filtros por categoria e ordenação por recente/discutido/resolvido; `/community/topic/:id` é Forma C com a discussão à esquerda, autor e tópicos relacionados no trilho, e marcação de **resposta homologada** por docente. `/community/events` usa `EventCard` *(órfão)*.

---

## 6. MATRIZ DE APLICAÇÃO

| Rota | Forma | Abas | Situação |
| :--- | :---: | :---: | :--- |
| `/rooms` | B | ✓ | hardcoded |
| `/rooms/:id` | C | ✓ 8 abas | hardcoded, 2 `alert()` |
| `/rooms/create` | A | passos | `setTimeout` sem persistência |
| `/community` | B | ✓ | hardcoded |
| `/community/topic/:id` | C | — | hardcoded, respostas somem ao sair |
| `/community/events` | B | ✓ | hardcoded, 1 `alert()` |

---

## 7. DEPENDÊNCIAS BLOQUEANTES

| Dependência | Situação |
| :--- | :--- |
| `SharedStateAdapter` sobre Cloudflare KV | **decidido, não implementado** (item 15.15) |
| Verificação de propriedade de recurso (IDOR) | **inexistente** — crítico aqui: professor só corrige os próprios alunos |
| `teacher.repository` + `teacher.service` | **inexistentes** |
| `community.repository` + `community.service` | **inexistentes** |
| Armazenamento de artefatos (áudio/vídeo de submissão) | **inexistente** |
| `ForumCard`, `EventCard` | **órfãos** |
