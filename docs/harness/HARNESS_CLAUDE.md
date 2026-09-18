# Harness Claude — contrato operacional

> Para o agente que **lê, audita e altera este repositório em sessão
> conversacional**, com acesso ao sistema de arquivos e ao terminal.
>
> O harness do AI Studio é outro documento: `HARNESS_AI_STUDIO.md`. As
> superfícies são diferentes e as regras também.
>
> Este arquivo prevalece sobre estilo pessoal. Em conflito com o código
> existente, o código ganha — ver §1.

---

## 1 · Ordem de autoridade

1. **Código e contratos presentes no workspace.** O que está rodando manda.
2. **Este harness e os documentos canônicos** de `docs/harness/`.
3. **Decisões registradas** em `12_ADR_DECISIONS.md` e `49_DECISION_LOG.md`.
4. Documentação de produto.
5. Referências externas.

Preview visual **nunca** é fonte de verdade arquitetural.

Quando a fonte 1 contradiz a 2, a contradição é um **achado** — reporta-se,
não se resolve sozinho escolhendo a que for mais conveniente.

---

## 2 · A regra que gera todas as outras

> **Não afirmar o que não foi verificado.**

Dela decorrem quatro obrigações práticas:

| Obrigação | O que significa na prática |
|---|---|
| **Rodar** | Comando executado, saída lida. Não "deve passar". |
| **Colar** | O número vem da execução, não da memória. |
| **Declarar o limite** | O que não deu para verificar é dito, com o motivo. |
| **Não promover** | `UNVERIFIED` não vira `EXISTING` em silêncio. |

### Classificação obrigatória de capacidade

`VERIFIED` · `EXISTING` · `PARTIAL` · `FRONT_ONLY` · `BACK_ONLY` ·
`EXTERNAL_ENGINE` · `MOCK` · `MISSING` · `UNVERIFIED`

### O que já custou ignorar isto

- Um documento afirmando "paridade alcançada" com uma plataforma de
  referência, **escrito de memória, sem acesso a ela**.
- A afirmação de que a busca do cabeçalho estava consertada **sem ter sido
  aberta no navegador**. Continuava quebrada, e por um motivo que o jsdom não
  reproduz.

A segunda ensina o corolário: **jsdom não é navegador.** Ele não tem layout,
não calcula `scrollLeft` e não toca som. "Os testes passam" não é o mesmo que
"funciona".

---

## 3 · Sequência de trabalho

```
  1. INVESTIGAR   ler o repositório inteiro na área afetada
  2. DIAGNOSTICAR produzir o achado, com arquivo e linha
  3. IMPLEMENTAR  só depois
  4. VERIFICAR    npm run verificar
  5. REGISTRAR    CLAUDE_STATE, CLAUDE_AUDIT, CLAUDE_TODO
```

**Nunca inverter 1 e 3.** "Ler o repositório inteiro antes de modificar
qualquer arquivo" e "não fazer suposições sobre o estado atual" são
instruções permanentes, não preâmbulo.

### Não simplificar por conta própria

Auditoria produz diagnóstico, não demolição.

- Não substituir implementação existente sem auditar.
- Não apagar componente funcional para "limpar".
- **Não remover o que não foi pedido** — um trilho lateral inteiro já foi
  removido numa limpeza não solicitada, e a tela caiu de 89 para 66 na
  medição de paridade.
- Não trocar arquitetura por mock.
- Não criar persistência paralela.
- Não criar segunda regra de negócio no frontend.

---

## 4 · Antes de escrever qualquer tela

Ler `73_ANTIPADROES.md`. É mais curto que consertar depois.

Checagem mínima, de cabeça:

- [ ] O dado vem de repositório? (A1)
- [ ] Todo controle age de verdade? (A2, A3)
- [ ] Leitura de dado de aluno filtra por `userId`? (B1)
- [ ] A rota declarou audiência em `audiencia.ts`? (E2)
- [ ] Os estados vazio/carregando/erro são governados pelos dados? (E3)
- [ ] Controle é `<button>`, campo tem rótulo, ícone tem `aria-label`? (D)
- [ ] A tela promete algo que curso livre não entrega? (C1)

---

## 5 · Verificação

```bash
npm run verificar     # typecheck + lint + pente fino + testes
npm run qa            # só o pente fino, relatório legível
npm run qa -- --so-falhas
```

`npm run verificar` é o que se roda antes de dizer que terminou. Passa inteiro
ou não terminou.

> **Nota de ambiente.** No sandbox do Git Bash, `npm run` devolve código 1
> mesmo quando o comando interno sai com 0. Rodar pelo PowerShell para conferir
> o código de saída, ou chamar `npx` diretamente. Isto é do sandbox, não do
> projeto.

O pente fino está descrito em `72_PENTE_FINO_QUALIDADE.md`, inclusive a seção
do que ele **não** alcança. Ler os dois: "0 bloqueios" não quer dizer "está
pronto", e o documento diz exatamente por quê.

---

## 6 · Escrever verificação nova

Um checador recebe o repositório lido e devolve **achados**. Achado tem
arquivo, linha e o que está errado — sem isso não é achado, é opinião.

```js
// scripts/qa/<assunto>.mjs
import { interfaces } from './nucleo.mjs';

export function checarAlgumaCoisa() {
  const achados = [];
  for (const { arquivo, codigo } of interfaces()) {
    // `codigo` vem sem comentários — ver a regra abaixo
  }
  return achados;
}
```

Registrar em `scripts/qa.mjs` com a gravidade certa, e acrescentar o caso em
`tests/pente-fino.test.ts`.

### Três regras aprendidas errando

1. **Conferir contra código correto antes de confiar.** Rodar a verificação
   nova sobre trecho que se sabe certo e exigir silêncio.
2. **Comentário não é código.** Sem removê-los, o comentário que documenta por
   que a ressalva de curso livre existe era acusado como a promessa indevida
   que ele previne.
3. **Cuidado com caixa e com `>`.** `/i` fez "em **todo** o catálogo" casar com
   `TODO`. Ler atributos até o primeiro `>` corta em `onChange={(e) => …}`.

### Gravidade

| Gravidade | Quando | Efeito |
|---|---|---|
| `BLOQUEIA` | O produto está errado agora — mente, vaza ou promete indevidamente | Trava build e suíte |
| `CORRIGIR` | Defeito real com dívida contada | Teto na suíte; só desce |
| `OBSERVAR` | Sinal, não conclusão | Só relatório |

---

## 7 · Testes

Ordem e propósito estão em `35_TEST_STRATEGY.md`. O que este harness
acrescenta é **quando escrever**:

- Todo defeito encontrado vira caso de teste **antes** da correção, quando
  isso for prático. O caso descreve o defeito, não a correção.
- O comentário do teste diz **o que aconteceu de verdade**, não a categoria
  abstrata. "`listMasteriesByUser` ignorava o `userId` que recebia" ensina;
  "testa isolamento de dados" não.
- Teste de componente declara `// @vitest-environment jsdom` na primeira
  linha.

### O que não se faz com teste

- Não baixar o rigor para o teste passar. As iterações do PBKDF2 das contas
  infantis são lentas **de propósito**: é isso que encarece o ataque de
  dicionário. Baixá-las para poupar quinze segundos de suíte é enfraquecer a
  proteção de uma criança.
- Não escrever teste que exija o antipadrão. Um caso deste repositório
  **exigia** que o curso citasse uma universidade — a citação proibida
  transformada em requisito. A asserção foi invertida.

---

## 8 · Comunicação

### O relatório

- Número vem de execução.
- Quando algo falhou, dizer, com a saída.
- Quando um passo foi pulado, dizer.
- Quando está feito e verificado, dizer sem hesitar.
- **Sem parabenizar o próprio trabalho.**

### Mensagem de commit

Explica **o que estava errado e o que isso custava**, não só o que mudou. O
histórico é onde a próxima pessoa descobre por que a decisão foi tomada.

### Correção de rumo

Quando algo foi afirmado errado e isso muda o que a pessoa vai fazer:
corrigir em uma frase e seguir. Sem preâmbulo, sem autocrítica, sem repetir
o erro três vezes.

---

## 9 · Contexto de negócio que altera decisão técnica

| Fato | Consequência técnica |
|---|---|
| **Curso livre**, certificação própria, sem MEC | A ressalva vai no documento impresso e não é editável no Estúdio |
| **Sem banco de dados** — `localStorage` + cópia no Drive da pessoa | Isolamento por `userId` em toda leitura; a cópia é a única defesa contra perda total |
| **Entrada só por Google** | Não existe senha para criar, memorizar ou vazar. Não reintroduzir |
| **Allowlist no servidor** | `isAdmin` vem da sessão assinada. Nunca do cliente |
| **Conteúdo autoral** | Nenhuma citação de fonte, em lugar nenhum |
| **Kids restrito** | A variante infantil restringe alcance; não empobrece conteúdo |
| **Publicação no Cloudflare Pages a partir do git** | Sem passo de construção manual; segredo nenhum no pacote |

---

## 10 · Preferências de quem decide o produto

Estão em `73_ANTIPADROES.md` §G, e são **critério de aceitação**, não gosto a
ser tolerado. Em resumo: sem cartão decorativo, sem legenda redundante, ícone
onde cabe ícone, menu só com telas, um cabeçalho só, paleta anil e ouro.

E a que mais orienta o trabalho:

> **Dado ausente não é problema; função ausente é.** Construir a arquitetura,
> a persistência e o estado vazio honesto é entregar. Preencher com ficção
> para parecer cheio é o antipadrão A1.

---

## 11 · Ao final de cada trecho de trabalho

- [ ] `npm run verificar` passou inteiro
- [ ] `CLAUDE_STATE.md` reflete o estado
- [ ] `CLAUDE_AUDIT.md` registra os achados novos
- [ ] `CLAUDE_TODO.md` tem as pendências **medidas**, não estimadas
- [ ] Defeito encontrado virou caso de teste
- [ ] Antipadrão novo entrou em `73_ANTIPADROES.md`, com o que custou
- [ ] O relatório diz o que não foi verificado
