# WIREFRAMES — 07 · CONSOLE DA FUNDADORA

**Depende de:** `00_FOUNDATIONS.md`
**Domínio:** `/admin/*` — 6 rotas
**Densidade:** `OPERATIONAL`
**Acesso:** exclusivo às identidades da `ADMIN_ALLOWLIST`, resolvido server-side

> ⚠️ **CORREÇÃO DE ESPECIFICAÇÃO (2026-09-16).** A auditoria do COMANDO 2 mediu o Admin contra um wireframe de *gestão de usuários* e atribuiu **9/100**. Essa medição estava contra a especificação errada.
>
> **Definição correta:** o Admin não é um CRUD de usuários nem um painel de suporte. É o **console da fundadora** — instrumento de leitura do negócio e de operação comercial. Quatro finalidades, e apenas estas:
> 1. **Insights** — como a plataforma está sendo usada
> 2. **SEO e alcance** — como ela é encontrada
> 3. **Notificações e alertas** — o que é comunicado, para quem
> 4. **Comercial** — cupons, planos, conversão
>
> A pontuação do Admin fica **suspensa** até a remedição (§7).

---

## 1. O QUE O CONSOLE NÃO É

Registrar isto evita reconstruir o painel errado:

| Não é | Porque |
| :--- | :--- |
| CRUD de usuários | Os dados pessoais vivem no `localStorage` e no Drive de cada pessoa (ADR-001.A). A fundadora **não tem acesso** a eles — e é assim por projeto |
| Editor de conteúdo acadêmico | Autoria de curso pertence ao pipeline de conhecimento (COMANDOS 7–10), com revisão humana própria |
| Central de suporte | Fora de escopo na v1 |
| Painel de saúde de servidor | Não há servidor a monitorar — Cloudflare cuida disso |
| Indexador manual de pessoas | A indexação é **automática no login** (ADR-003). Se depender de ação manual, vira gargalo da fundadora |

**O que o console governa é o que está no KV compartilhado e nos dados agregados — nunca o que é privado do usuário.**

---

## 2. `/admin` — VISÃO EXECUTIVA · Forma C

```
┌───────────────────────────────────────────────────────────────┐
│ Console da Fundadora          [7 dias ▾] [Exportar CSV]       │
├───────────────────────────────────────────────────────────────┤
│ [ Visão Geral │ Alcance & SEO │ Comunicação │ Comercial │      │
│   Comunidade │ Auditoria ]                          ▸ sticky   │
├─────────────────────────────────────┬─────────────────────────┤
│ col 1–8                             │ col 9–12 ▸ sticky       │
│ ┌──────┐┌──────┐┌──────┐┌──────┐    │ ┌─────────────────────┐ │
│ │ 128  ││  47  ││ 312  ││  12  │    │ │ ATENÇÃO             │ │
│ │contas││ativas││sessõe││certif│    │ │ ⚠ 3 denúncias na    │ │
│ │ +14  ││ 37%  ││ +8%  ││ +2   │    │ │   fila              │ │
│ └──────┘└──────┘└──────┘└──────┘    │ │ ⚠ Cupom LANÇAMENTO  │ │
│                                     │ │   expira em 2 dias  │ │
│ ┌─────────────────────────────────┐ │ └─────────────────────┘ │
│ │ ATIVIDADE (30 dias)             │ │ ┌─────────────────────┐ │
│ │      ╭╮    ╭─╮                  │ │ │ FUNIL               │ │
│ │  ╭───╯╰────╯ ╰──╮               │ │ │ visita     1.240    │ │
│ │ ─╯              ╰─              │ │ │ cadastro     128 10%│ │
│ │ sessões · lições · exercícios   │ │ │ onboarding    94 73%│ │
│ └─────────────────────────────────┘ │ │ 1ª lição      61 65%│ │
│                                     │ │ matrícula     38 62%│ │
│ ┌─────────────────────────────────┐ │ │ certificado   12 32%│ │
│ │ CONTEÚDO MAIS PROCURADO         │ │ └─────────────────────┘ │
│ │ ▸ DataGrid                      │ │ ┌─────────────────────┐ │
│ │ termo        buscas  resultados │ │ │ RETENÇÃO            │ │
│ │ "intervalos"    142     3   ⚠   │ │ │ D1  62%             │ │
│ │ "cifras"         88     0   🔴  │ │ │ D7  41%             │ │
│ │ "violão"         71     0   🔴  │ │ │ D30 23%             │ │
│ └─────────────────────────────────┘ │ └─────────────────────┘ │
│  ↑ demanda sem oferta = pauta       │                         │
│    editorial, não métrica de vaidade│                         │
└─────────────────────────────────────┴─────────────────────────┘
```

**Princípio de projeto:** toda métrica aqui existe para **provocar uma decisão**. "142 pessoas buscaram *intervalos* e 88 buscaram *cifras* sem nenhum resultado" é pauta de conteúdo. Contagem de sessões sem consequência é vaidade e não entra.

---

## 3. `/admin/seo` — ALCANCE & SEO · Forma B

Substitui o atual `AdminEnginesScreen`, que exibia telemetria falsa (`latencyMs: 1` fixo).

```
┌───────────────────────────────────────────────────────────────┐
│ Alcance & Descoberta                                          │
├──────────────────┬────────────────────────────────────────────┤
│ col 1–3 ▸ sticky │ col 4–12                                   │
│ Tipo de página   │ ┌────────────────────────────────────────┐ │
│  ☐ Curso         │ │ SAÚDE DE INDEXAÇÃO                     │ │
│  ☐ Obra          │ │ 47 páginas públicas                    │ │
│  ☐ Perfil        │ │ ✓ 31 com título e descrição            │ │
│  ☐ Tópico        │ │ ⚠ 12 sem descrição                     │ │
│ Situação         │ │ 🔴 4 sem título                        │ │
│  ☐ Completa      │ └────────────────────────────────────────┘ │
│  ☐ Incompleta    │ ┌────────────────────────────────────────┐ │
│                  │ │ ▸ DataGrid                             │ │
│                  │ │ página          título  desc  JSON-LD  │ │
│                  │ │ /academy/course/fomt  ✓    ✓     ✓     │ │
│                  │ │ /worlds/work/bwv1001  ✓    ⚠     ✗     │ │
│                  │ │                        [Editar meta]   │ │
│                  │ └────────────────────────────────────────┘ │
│                  │ ┌────────────────────────────────────────┐ │
│                  │ │ ARTEFATOS                              │ │
│                  │ │ sitemap.xml  gerado há 2h  [Regerar]   │ │
│                  │ │ robots.txt   ✓                         │ │
│                  │ │ OpenGraph    31/47                     │ │
│                  │ └────────────────────────────────────────┘ │
└──────────────────┴────────────────────────────────────────────┘
```

**Nota de arquitetura — dívida a registrar:** a aplicação é uma SPA com roteamento por *hash* (`#/academy/course/x`). **Fragmentos de hash não são indexáveis** — do ponto de vista de um buscador, o site tem uma única página. Nenhum trabalho de SEO produz efeito enquanto isso não mudar.

Correções possíveis, em ordem de custo: (1) migrar para `history.pushState` com rotas reais; (2) pré-renderizar as páginas públicas no build; (3) servir metadados por Cloudflare Function conforme o `User-Agent`. **A (1) é pré-requisito das outras duas** e conecta com o defeito R-04/R-05 do `01_REPOSITORY_AUDIT.md`.

---

## 4. `/admin/communication` — NOTIFICAÇÕES & ALERTAS · Forma B

```
┌───────────────────────────────────────────────────────────────┐
│ Comunicação                              [+ Nova mensagem]    │
│ [ Campanhas │ Automações │ Avisos do sistema │ Modelos ]      │
├──────────────────┬────────────────────────────────────────────┤
│ Público-alvo     │ ┌────────────────────────────────────────┐ │
│  ☐ Todos     128 │ │ Boas-vindas          AUTOMÁTICA  ✓ ON  │ │
│  ☐ Sem 1ª lição 34│ │ gatilho: onboarding concluído          │ │
│  ☐ Inativos 7d  41│ │ 94 enviadas · 71% lidas                │ │
│  ☐ Professores  6│ ├────────────────────────────────────────┤ │
│  ☐ Certificados 12│ │ Ofensiva em risco    AUTOMÁTICA  ✓ ON  │ │
│                  │ │ gatilho: 20h sem prática               │ │
│ Canal            │ │ 312 enviadas · 44% retomaram           │ │
│  ☐ No produto    │ ├────────────────────────────────────────┤ │
│  ☐ E-mail        │ │ Lançamento de trilha   CAMPANHA  📅    │ │
│                  │ │ agendada 20/09 · 41 destinatários      │ │
│                  │ │              [Editar] [Prévia] [Enviar]│ │
│                  │ └────────────────────────────────────────┘ │
└──────────────────┴────────────────────────────────────────────┘
```

**Regras:** segmento sempre mostra **contagem real** antes do envio · prévia obrigatória · envio a mais de 50 pessoas exige confirmação explícita · **modo Kids nunca recebe campanha comercial** · toda campanha é registrada no log de auditoria com autor e público · respeitar a preferência de notificação de cada perfil.

---

## 5. `/admin/commercial` — COMERCIAL · Forma B

```
┌───────────────────────────────────────────────────────────────┐
│ Comercial                                   [+ Criar cupom]   │
│ [ Cupons │ Planos │ Conversão ]                               │
├───────────────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ ▸ DataGrid                                                │ │
│ │ código      desconto  usos/limite  validade    situação    │ │
│ │ LANCAMENTO    100%      38 / 100   20/09/26   ● ativo  ⚠  │ │
│ │ CONSERVAT30    30%      12 / 50    31/12/26   ● ativo     │ │
│ │ BETA           100%     50 / 50     —         ○ esgotado  │ │
│ │                                    [Editar] [Desativar]   │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────┐ ┌───────────────────────────────┐ │
│ │ RESGATES (30 dias)      │ │ POR PLANO                     │ │
│ │  ╭──╮                   │ │ Gratuito       112  87%       │ │
│ │ ─╯  ╰───╮   ╭──         │ │ Pro             14  11%       │ │
│ │         ╰───╯           │ │ Institucional    2   2%       │ │
│ └─────────────────────────┘ └───────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

Cupom: código, tipo, valor, limite total, limite por pessoa, validade, escopo (plano ou curso). Código gerado com alfabeto sem ambiguidade (sem `O`/`0`, `I`/`1`). `domain/commercial.ts` já existe com 107 linhas e **5 enums** — e está **órfão**, sem repositório nem serviço.

---

## 6. `/admin/moderation` e `/admin/audit`

**Moderação** · Forma B — fila do que foi denunciado no KV compartilhado: post, resposta, item de portfólio, perfil. Cada item mostra conteúdo, autor, motivo, quem denunciou. Ações: manter · ocultar · remover · advertir · suspender. Toda ação vai ao log com justificativa obrigatória.

**Auditoria** · Forma B — `DataGrid` sobre `GET /api/v1/admin/audit-logs`, que **já existe, já é autenticado e já devolve o resultado da verificação da cadeia HMAC** desde o Bloco 0. A tela hoje mostra 2 eventos fixos e ignora o endpoint.

Colunas: sequência · data · ato · autor · severidade · detalhe · IP. Filtro por severidade e período. **Selo de integridade da cadeia no topo** — verde se `verifyChain()` retorna válido, vermelho apontando o `seq` comprometido.

---

## 7. MATRIZ DE APLICAÇÃO E REMEDIÇÃO

| Rota | Forma | Tela atual | Situação |
| :--- | :---: | :--- | :--- |
| `/admin` | C | `AdminDashboardScreen` | métricas fixas; sem funil, retenção ou insight |
| `/admin/seo` | B | *(não existe)* | **criar** — substitui `AdminEnginesScreen` |
| `/admin/communication` | B | *(não existe)* | **criar** |
| `/admin/commercial` | B | *(não existe)* | **criar** |
| `/admin/moderation` | B | `AdminModerationScreen` | 43 linhas, sem fila |
| `/admin/audit` | B | `AdminAuditScreen` | ignora o endpoint funcional |
| ~~`/admin/users`~~ | — | `AdminUsersScreen` | **descontinuar** — fora do escopo do console |
| ~~`/admin/content`~~ | — | `AdminContentScreen` | **descontinuar** — pertence ao pipeline de conhecimento |
| ~~`/admin/engines`~~ | — | `AdminEnginesScreen` | **descontinuar** — telemetria falsa; vira `/admin/seo` |

> **Justificativa técnica das descontinuações** (exigida pela regra de trabalho nº 4): as três telas consomem exclusivamente arrays fixos, somam 0–20 pontos de paridade, e suas finalidades ou são impossíveis nesta arquitetura (gestão de dados que vivem no Drive do usuário) ou pertencem a outro subsistema. Nenhuma funcionalidade real é perdida, porque nenhuma existe.

---

## 8. DEPENDÊNCIAS

| Dependência | Situação |
| :--- | :--- |
| Agregação de métricas em KV | inexistente |
| `commercial.repository` + serviço | domínio existe (107 l.), **órfão** |
| Fila de moderação em KV | inexistente |
| Envio de e-mail | **decisão pendente** — provedor não escolhido |
| Roteamento indexável (`pushState`) | **bloqueia SEO inteiro** |
| `DataGrid` | **órfão** — exigido em 5 telas deste console |
