# 83 — ETAPAS DE TESTE

Mil trezentos e quarenta e seis testes não se roda a cada commit. Este
documento diz **o que roda quando**, **o que cada etapa prova**, e — a parte
que costuma faltar — **o que ela não prova**.

A divisão não é por gosto. É por custo medido, em 2026-09-19:

| camada | arquivos | testes | custo |
| :--- | ---: | ---: | ---: |
| domínio, serviço, repositório, segurança | 39 | 688 | **14,5 s** |
| tela (jsdom) | 16 | 284 | 52,7 s |
| a suíte auditando a si mesma | 4 | 374 | 33,3 s |

A lógica inteira do produto custa quinze segundos. O caro é montar DOM e a
suíte se auditar — e nenhuma dessas duas precisa rodar a cada commit.

> **Antes de fatiar, tire a ineficiência.** A suíte da suíte custava 150 s
> porque `sources()` relia os oitenta e quatro arquivos de `src/` a cada
> invocação de verificador — trezentas varreduras completas em sequência. Um
> cache por processo levou isso a 12 s. Fatiar em volta de um desperdício é
> transformar desperdício em processo.

---

## Camada 1 — `npm run test:commit`

**~15 s · 731 testes · a cada commit.**

Pente fino estático mais toda a lógica que não precisa de navegador: domínio,
serviços, repositórios, autoridade de servidor, audiência de rota, posse de
registro, economia de progresso, gramática de exercício.

**Prova:** que nenhuma regra de negócio quebrou, que nenhum dado de aluno
vazou entre contas, que nenhuma rota pessoal ficou pública, que nenhum botão
está morto, que nenhuma tela afirma número que ninguém contou, que nenhuma
fonte externa foi citada.

**Não prova:** que a tela monta. Componente que quebra no `render` passa aqui
inteiro, porque aqui ninguém renderiza nada.

## Camada 2 — `npm run test:push`

**~38 s · 1015 testes · antes de empurrar para o repositório remoto.**

Camada 1 mais a verificação de tipos e os testes de tela em jsdom: fumaça de
rota, guarda de audiência, formulário de matrícula, sessão de exercício,
blocos de lição, mapa da trilha.

**Prova:** que toda rota monta sem derrubar React, que o visitante vê convite
onde o aluno vê conteúdo, que o formulário aceita e recusa o que deve.

**Não prova:** que os verificadores do pente fino ainda enxergam. Um
verificador pode ter ficado cego — regex que parou de casar com o formato do
código — e esta camada segue verde, porque ela usa os verificadores sem
auditá-los.

## Camada 3 — `npm run test:tudo`

**~50 s · 1346 testes · obrigatória nas situações abaixo.**

Tudo, mais a suíte auditando a si mesma: cada sinal em todas as formas
conhecidas do defeito, cada caso limpo contra falso positivo, os limites
declarados, a não-vacuidade dos leitores contra o repositório de verdade, e a
curadoria do relatório no TO DO.

### Quando a camada 3 é obrigatória

1. **Antes de publicar.** Sem exceção.
2. **Ao mexer em `scripts/qa/`.** É a única camada que verifica os
   verificadores. Mexer neles e rodar só a camada 1 é pedir para repetir o
   defeito do `checkPublicDomainRepertoire`, que varria trinta e três faixas e
   enxergava zero enquanto o relatório dizia que estava conferido.
3. **Ao mudar a FORMA de um dado**, mesmo sem mudar a regra. Trocar
   `{ id: '...' }` por `faixa('...')` num arquivo de dados não quebra teste
   nenhum e cega o verificador que lia aquele formato.
4. **Ao acrescentar rota, tela ou nível de audiência.** A tabela de audiência
   e o outlet são dois sistemas, e só a camada 3 confere que a guarda cobre
   todos os níveis declarados.
5. **Ao mexer em `docs/harness/76_PROGRESS_ECONOMY.md`** ou em
   `src/domain/progress-economy.ts` — a tabela é a autoridade, e a divergência
   entre documento e código só é vista aqui.
6. **Quando a camada 1 ou 2 falha por motivo que você não entende.** Antes de
   ajustar o teste, rode a camada 3: pode ser o verificador que está errado, e
   não o produto.

---

## O que nenhuma camada prova

**Que a tela está boa.** Desenho, texto certo no contexto, fluxo que leva ao
lugar certo, contraste, toque em tela pequena — isso continua precisando de
navegador e de olho humano. Está registrado como `F.2` no TO DO, e não tem
atalho.

**Que o conteúdo está correto.** A suíte confere que a lição tem blocos, que o
markdown fecha o negrito e que o link tem destino. Se o texto diz que o modo
dórico começa em ré quando deveria dizer outra coisa, nenhuma máquina aqui
percebe.

---

## Como escolher, na dúvida

Se a mudança toca **apenas** `src/domain`, `src/services` ou
`src/repositories`: camada 1 basta.

Se toca `src/ui`: camada 2.

Se toca `scripts/qa`, `docs/harness`, `src/data` ou navegação: camada 3.

Na dúvida sobre qual, a camada 3 custa cinquenta segundos. É mais barato que
descobrir depois.
