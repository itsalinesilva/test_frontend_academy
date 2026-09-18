# 76 · Economia de progresso — onde e como se conta

> **Catálogo fixo de tudo o que é contabilizado na plataforma.** Cada evento
> que gera pontuação, emblema, ofensiva ou posição está declarado aqui, uma
> vez só.
>
> Existe porque foi pedido assim: *"temos que criar um documento com catálogos
> fixos de onde é possível contabilizar e como contabilizar — XP, score,
> jornadas completas, emblemas etc. — para não haver perda ou falha."*

---

## A regra que evita perda

> **Um evento é contado uma vez, num lugar só, e esse lugar está nesta tabela.**

O modo de falha desta parte do produto é silencioso e caro: o aluno pratica
uma hora e o número não sobe, ou sobe duas vezes, e ninguém descobre porque
nenhum teste cobre a contagem. A defesa é esta tabela, mais os casos de teste
que ela exige.

E a regra que vem junto, herdada de `73_ANTIPADROES.md` §A1:

> **Contador nasce em zero.** Conta recém-criada já exibiu, neste projeto,
> sete dias de ofensiva e quarenta pontos que ninguém tinha feito. Zero é a
> informação correta, e é o que faz o primeiro ponto real significar alguma
> coisa.

---

## 1 · As quatro moedas

São quatro, e não se convertem entre si. Misturá-las é como o significado de
cada uma se perde.

| Moeda | O que mede | Zera? | Onde aparece |
|---|---|---|---|
| **XP** | Esforço — quanto se praticou | Não. Acumula para sempre | Perfil, liga |
| **Score** | Qualidade — quão bem | Não. Acumula | Perfil, classificação |
| **Ofensiva** | Constância — dias seguidos | **Sim**, ao pular um dia | Cabeçalho, perfil |
| **Débito** | Erro — quantas vezes e onde | Só quitando | Perfil, ao lado das vidas |

> **Por que XP e Score são separados.** XP premia aparecer; Score premia
> acertar. Quem pratica muito e erra muito sobe em XP e não em Score — e isso
> é informação verdadeira sobre a pessoa, que uma moeda só apagaria.

---

## 2 · Tabela de contagem

**Esta é a autoridade.** Valor que não está aqui não é atribuído.

A coluna **Onde** nomeia o símbolo do código que dispara o evento, e o `⏳`
marca o que **ainda não existe**. A distinção não é cosmética: uma tabela que
nomeia código inexistente sem dizer que ele não existe é a mesma falha de
sempre — declarar pronto o que não está — só que em forma de documento.

Quem verifica isto não é a leitura: é `scripts/qa/economia.mjs`, que abre cada
símbolo sem `⏳` e falha se não o encontrar no código. Implementar um evento
significa criar o símbolo **e** apagar o `⏳` da linha; esquecer a segunda
metade não quebra nada, mas esquecer a primeira quebra a suíte.

Os valores em si vivem em `src/domain/economia-de-progresso.ts`, na constante
`XP` — **um** lugar no código autorizado a dizer quanto vale cada coisa. Onde a
coluna **Onde** nomeia `XP.ALGUMA_COISA`, o verificador compara o número desta
tabela com o número da constante e falha se divergirem. Foi essa divergência,
sem ninguém para notá-la, que deixou o perfil anunciar 1920 de XP e nível 12 a
quem nunca praticou.

### 2.1 · Nível

| Regra | Valor |
|---|---|
| Custo do nível `n` | **100 × n** de XP |
| Nível inicial | 1, com 0 de XP |
| Perde-se nível? | **Não.** Nível lê esforço acumulado, não mérito atual |

Uma progressão só, sem tabela nova a cada faixa: sair do nível 1 custa 100, do
2 custa 200, do 11 custa 1100. Quem tem 1920 de XP está no nível 6 — e não no
12, como o perfil chegou a afirmar.

### Academy — estudo

| Evento | XP | Score | Ofensiva | Onde é disparado |
|---|---:|---:|:---:|---|
| Lição concluída | 10 | — | ✅ | `XP.LICAO_CONCLUIDA` · `academy.service.completeLesson` |
| Checkpoint acertado na primeira | 5 | 5 | — | `XP.CHECKPOINT_ACERTADO` · `LessonBlocks` |
| Checkpoint acertado depois de errar | 5 | — | — | idem |
| Atividade concluída | 15 | conforme acerto | ✅ | `XP.ATIVIDADE_CONCLUIDA` · `saveActivityAttempt` |
| Simulado concluído | 25 | conforme acerto | ✅ | `XP.SIMULADO_CONCLUIDO` · `saveAssessmentSubmission` |
| **Prova final aprovada** | 100 | conforme nota | ✅ | `XP.PROVA_APROVADA` |
| Prova final reprovada | 25 | — | ✅ | `XP.PROVA_REPROVADA` — esforço conta; acerto não |
| Curso concluído | 250 | — | — | `XP.CURSO_CONCLUIDO` · `course_completed` |
| Certificado emitido | 50 | — | — | `XP.CERTIFICADO_EMITIDO` · `saveCertificate` |

### Practice — treino

| Evento | XP | Score | Ofensiva | Onde |
|---|---:|---:|:---:|---|
| Exercício acertado | 25 | conforme medição | ✅ | `XP.EXERCICIO_ACERTADO` · `saveAttempt` |
| Exercício errado | 5 | — | ✅ | `XP.EXERCICIO_ERRADO` — e gera débito |
| Rodada de 10 concluída | 20 | — | — | `XP.RODADA_CONCLUIDA` · `xpDaLicao` |
| Missão diária cumprida | 50 | — | — | `XP.MISSAO_DIARIA` — ver §4 |
| Meta do dia cumprida | 30 | — | — | `XP.META_DO_DIA` · `DailyGoal` |
| Unidade do percurso concluída | 150 | — | — | ⏳ `UNIDADE_CONCLUIDA` |
| Obra de repertório avaliada | 200 | conforme avaliação | ✅ | ⏳ `REPERTORIO_EXECUTADO` |

### Atlas — exploração

| Evento | XP | Score | Onde |
|---|---:|---:|---|
| Primeira visita a um mundo | 20 | — | ⏳ `MUNDO_VISITADO` |
| Primeira visita a uma região | 20 | — | ⏳ `REGIAO_VISITADA` |
| Obra analisada | 40 | conforme análise | `XP.OBRA_ANALISADA` · `WORK_ANALYZED` |
| Excursão concluída | 120 | — | `XP.EXCURSAO_CONCLUIDA` · `TOUR_COMPLETED` |

### Comunidade

| Evento | XP | Score | Onde |
|---|---:|---:|---|
| Tópico aberto | 10 | — | `XP.TOPICO_ABERTO` · `forumRepository.salvarTopico` |
| Resposta publicada | 5 | — | `XP.RESPOSTA_PUBLICADA` · `salvarResposta` |
| Resposta aceita como solução | 30 | 20 | `XP.RESPOSTA_ACEITA` · `isAcceptedSolution` |
| Avaliação de curso escrita | 15 | — | `XP.AVALIACAO_ESCRITA` · `reviewsRepository.salvar` |

> **Nada de comunidade conta para a ofensiva.** Ofensiva é constância de
> **estudo**; escrever no fórum todo dia não é praticar.

### O que NÃO conta

Declarado para não haver dúvida:

- Abrir tela, rolar página, assistir sem interagir
- Marcar lição com marcador
- Trocar de curso ou de configuração
- Refazer exercício já acertado — **XP só na primeira vez por exercício, por dia**

---

## 3 · Ofensiva

| Regra | Valor |
|---|---|
| O que sustenta o dia | **Uma** lição, atividade, simulado, prova ou exercício |
| Virada do dia | Meia-noite, fuso do dispositivo |
| Quebra | Um dia inteiro sem nenhum dos eventos acima |
| Congelamento | Até **2** acumulados; protege um dia perdido cada |
| Como se ganha congelamento | 7 dias seguidos, máximo de 2 guardados |

**O dia de hoje nunca conta como falta.** Já era regra em
`domain/frequencia.ts`, e continua: dia futuro não é ausência, e a sequência
termina ontem — senão, às 00h01 toda ofensiva apareceria quebrada.

**Clubes por ofensiva:**

| Clube | Requisito |
|---|---|
| Aprendiz Constante | 7 dias |
| Estudante de Rotina | 30 dias |
| Disciplina do Conservatório | 100 dias |
| Ano de Estudo | 365 dias |

---

## 4 · Missões e metas

### Meta do dia

Ajustável pelo aluno. Padrão: **20 minutos · 100 XP · 5 exercícios**. Cumprir
qualquer um dos três cumpre a meta.

### Missões

Três por dia, sorteadas de uma lista fixa, com prazo até a virada.

| Missão | Condição | XP |
|---|---:|---:|
| Aquecimento | 10 XP em qualquer atividade | 50 |
| Ouvido atento | 5 exercícios de percepção acertados | 50 |
| Sem tropeço | Uma rodada sem erro | 75 |
| Visita ao Atlas | Abrir uma obra que nunca abriu | 50 |
| Leitura do dia | Uma lição concluída | 50 |
| Constância | Praticar em dois períodos do dia | 75 |

**Desafio do mês:** um só, de longo curso — por exemplo, 20 lições no mês.
Rende emblema, não XP.

> **Não existe "mais missões em breve".** Promessa de funcionalidade futura na
> tela é antipadrão A2/§G. Ou a missão existe, ou não aparece.

---

## 5 · Vidas e índice de débito

A variação nossa sobre as vidas do Duolingo, conforme pedido.

### Vidas

- **5 por sessão de prática.** Errar consome uma.
- Recompõem-se ao começar a sessão seguinte.
- **Quando acabam, o estudo NÃO trava.** Aqui a mecânica diverge da
  referência, e de propósito: interromper quem está estudando é punir a
  tentativa.

### Índice de débito

- Quando as vidas acabam, cada erro seguinte acumula **1 de débito**.
- O débito **não subtrai da pontuação**. É registro.
- Fica em **vermelho**, ao lado das vidas, e aparece no perfil.
- Guarda **onde** se errou: *"3 em intervalos · 2 em armadura de clave"*.
- Quitável com pontuação: **10 de Score por 1 de débito**. Some ao quitar.
- Quem não quitar convive com ele — e ele continua visível.

> **Por que é boa ideia, e não só piada.** O débito transforma o erro em
> informação **localizada**: em vez de "você errou muito", diz *onde*. E a
> quitação é escolha, não obrigação — quem quiser deixar o extrato à mostra,
> deixa.

---

## 6 · Ligas e classificação

### Faixas

Bronze → Prata → Ouro → Platina → Diamante → **Conservatório**

### Recortes

A mesma pessoa compete em vários ao mesmo tempo:

| Recorte | Quem entra |
|---|---|
| Plataforma | Todos |
| Curso | Quem faz aquele curso |
| **Tribo** | Quem pratica aquele instrumento |
| Era | Quem estuda aquela era |

### Regras

| Regra | Valor |
|---|---|
| Período | Semanal, de segunda a domingo |
| Métrica | **XP da semana** — esforço, não acúmulo histórico |
| Sobe | 20% do topo |
| Cai | 20% da base |
| Entrada | Depois de **3 lições ou exercícios** concluídos |
| Sem participantes | **Esqueleto cinza**, nunca gente inventada |

> A última linha é regra dura. Já houve, aqui, um ranking com Bach em
> primeiro e Clara Schumann em segundo. Tabela vazia mostra a **forma** — sem
> nome, sem número.

### As réguas do perfil

Pedido: *"como se o link do perfil tivesse várias réguas; quando mostrar, é
como uma tabela em régua — tem o primeiro no curso, mas tem outras métricas
correndo que não é a pontuada ali, mas aparece"*.

A régua ativa aparece **em destaque**; as demais, **esmaecidas e
expansíveis**, na mesma tabela:

```
  ▸ Progresso no curso        você em 12º de 48       ← ativa
    Ofensiva                  você em 3º              esmaecida
    Score do perfil           você em 21º             esmaecida
    XP da semana              você em 8º              esmaecida
```

Trocar a régua ativa reordena a tabela sem sair da tela.

---

## 7 · Emblemas

| Regra | Valor |
|---|---|
| Total | **44** — o número aparece como `N de 44` |
| Bloqueados | **Visíveis, em cinza.** Ver o que falta é o que motiva |
| Concessão | Automática, ao cumprir a condição |
| Revogação | Nunca |

Famílias: Estudo · Prática · Atlas · Constância · Comunidade · Domínio.

**O catálogo dos 44 ainda não existe.** Está em `T-12` do TODO. Enquanto não
existir, a tela mostra os que existem — e não 44 quadrados cinzas fingindo um
catálogo.

---

## 8 · Onde cada número é gravado

| Número | Chave | Categoria |
|---|---|---|
| XP e Score | `amd_practice_results_v1` | Dado do aluno |
| Ofensiva | `amd_practice_streak_v1` | Dado do aluno |
| Meta do dia | `amd_practice_daily_goals_v1` | Dado do aluno |
| Classificação | `amd_practice_leaderboard_v1` | Derivado |
| Débito | **a criar** | Dado do aluno |
| Emblemas | **a criar** | Dado do aluno |
| Passaporte | **a criar** | Dado do aluno |

> **Toda chave marcada "Dado do aluno" é intocável pela publicação de
> conteúdo, e filtrada por `userId` em toda leitura.** Regras de
> `73_ANTIPADROES.md` §B1 e §B3.

---

## 9 · O que os testes têm de garantir

Cada linha vira caso em `tests/economia-de-progresso.test.ts`.

| # | Garantia | Por que |
|---|---|---|
| E-1 | Todo evento da tabela §2 concede **exatamente** o valor declarado | A tabela é a autoridade |
| E-2 | **Nenhum evento conta duas vezes** | Contagem dupla é o defeito silencioso mais provável |
| E-3 | Refazer exercício acertado **não** concede XP de novo no mesmo dia | §2 |
| E-4 | Conta nova tem XP, Score, ofensiva e débito **em zero** | Regressão da semente fabricada |
| E-5 | Ofensiva quebra ao pular um dia e **não** quebra à meia-noite | `frequencia.ts` |
| E-6 | Congelamento protege um dia, e no máximo dois | §3 |
| E-7 | Erro além das vidas gera débito, e o débito **não** subtrai da pontuação | §5 |
| E-8 | Quitar débito consome Score na taxa declarada | §5 |
| E-9 | O débito registra **onde** se errou | §5 |
| E-10 | Liga usa XP **da semana**, não acumulado | §6 |
| E-11 | Sem participantes, a classificação volta **vazia** | Antipadrão A1 |
| E-12 | A classificação de um aluno não expõe dado de outro | §B1 |
| E-13 | Emblema não é revogado | §7 |
| E-14 | Publicar conteúdo não apaga XP, ofensiva nem emblema | §B3 |
| E-15 | Evento da comunidade **não** sustenta ofensiva | §2 |

---

## Regra permanente

> **Valor novo entra nesta tabela antes de entrar no código.**

Um `+25` escrito direto numa tela é um número que ninguém mais sabe de onde
veio — e que vai divergir do `+25` da outra tela na primeira vez que alguém
ajustar um dos dois.
