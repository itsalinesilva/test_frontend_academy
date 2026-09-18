# 77 · O Laboratório, as seções e os níveis

> Este documento é **autoridade de nomenclatura e de estrutura**. Quando uma
> tela, um domínio ou outro documento discordar dele, quem está errado é o
> outro.

---

## 1 · O nome

A plataforma tinha dois nomes e um buraco. `Academy` era claro — é o **curso**,
com módulos, lições, atividades, simulados, prova e certificado. `Practice` era
o nome de tudo o que sobrava, e sobrava coisa demais: exercícios, Atlas,
estúdios, simuladores, ferramentas, repertório.

Um nome que quer dizer "o resto" não orienta decisão nenhuma. Por isso:

| Nome | O que é | O que **não** é |
|---|---|---|
| **Academy** | O curso formal: módulos, lições, avaliações, certificado | Não é onde se treina |
| **Laboratório** | Onde se pratica, pesquisa, experimenta e constrói | Não é um curso, e não emite certificado por si |
| **Atlas** | O mapa de eras, regiões, compositores e obras — **dentro** do Laboratório | Não é uma área separada |
| **Passaporte** | O histórico documentado do que se fez no Laboratório | Não é o perfil |

O Laboratório contém, e esta lista é fechada até alguém acrescentar aqui:

1. **Lições de prática** — outras que as do Academy (ver §4)
2. **Percursos** — a sequência ordenada dessas lições
3. **Atlas** — eras, regiões, tribos, compositores, obras
4. **Simuladores** — tocar a obra e ser medido
5. **Estúdios** — voz, afinação, e o caderno de partituras
6. **Ferramentas** — metrônomo, afinador, teste de microfone (ver `79`)
7. **Ligas e missões** — a camada de competição e de rotina

> **"Practice" sai do vocabulário de produto.** Continua existindo como
> caminho de rota (`/practice/...`) enquanto a migração de URL não acontece —
> quebrar link de quem já usa é pior que inconsistência de nome —, mas nenhum
> texto de interface, documento ou nome de domínio novo deve usá-lo. O item
> está em `CLAUDE_TODO.md`.

---

## 2 · Seção é disciplina

Uma **seção** é um assunto — não um pedaço de tamanho fixo. "Intervalos" é uma
seção. "Ornamentos" é uma seção. "Cifragem" também é, e tem um décimo do
tamanho de "Acordes".

Isso não é detalhe de organização: é o que impede o erro de partir o conteúdo
em blocos iguais. Conteúdo partido em blocos iguais mente sobre o assunto —
sugere que cifragem e harmonia funcional pesam o mesmo, e a pessoa distribui o
esforço errado por causa da forma da tela.

### De onde saem as seções

**Do sumário do curso, e nunca de uma lista escrita à parte.** No curso de
Teoria, cada capítulo declara a sua `competencia`; as competências distintas
**são** as seções. Hoje são 18 seções sobre 58 capítulos, com esta densidade:

| Seção | Capítulos | Seção | Capítulos |
|---|---:|---|---:|
| acordes | 10 | metrica | 3 |
| notacao | 8 | andamento | 3 |
| intervalos | 5 | fundamentos | 2 |
| ornamentos | 5 | alturas | 2 |
| escalas | 4 | fraseado | 2 |
| escalas-especiais | 4 | subdivisao | 2 |
| duracao | 3 | tonalidade | 2 |
| … | | cifragem | 1 |

Uma lista paralela de seções poderia contradizer o sumário sem que nada
quebrasse. Derivar garante que acrescentar um capítulo reposicione o mapa
sozinho.

### A ordem é a do sumário

Dentro da seção, a ordem é a **numeração dos capítulos**. Entre seções, a
ordem é a do primeiro capítulo de cada uma. Não se inventa ordem pedagógica
nova: o sumário do curso já é a ordem pedagógica, decidida quando o curso foi
escrito.

> Atenção: a competência **não** é contígua. `notacao` vai do capítulo 2 ao 58.
> Uma seção pode voltar mais adiante no curso, e isso é correto — o assunto
> reaparece com mais profundidade. É por isso que existe nível.

---

## 3 · Nível é profundidade, não quantidade

O nível **não** é "mais exercícios". É a mesma seção pedida de outro jeito.

| Nível | O que muda | Exemplo em *intervalos* |
|---|---|---|
| **0 · Reconhecer** | Apontar entre alternativas, com o enunciado dando o vocabulário | "Qual destes é uma terça maior?" |
| **1 · Nomear** | Produzir a resposta sem alternativas prontas | "Que intervalo é este?" |
| **2 · Aplicar** | Usar em contexto, com mais de um passo | "Escreva a terça maior acima de Fá♯" |
| **3 · Ouvir** | Sem notação: só som | "Ouça e diga qual é" |
| **4 · Executar** | Tocar ou cantar, medido pelo microfone | "Cante a terça maior a partir desta nota" |

Os cinco níveis usam a **mesma gramática** de `domain/music-grammar.ts` — as
21 dimensões × 6 estímulos × 9 respostas. O nível é um recorte da matriz, e não
um conteúdo novo. É por isso que ele não multiplica trabalho editorial.

### A densidade decide o tamanho

Quantos módulos e quantas perguntas uma seção tem, **em cada nível**, sai da
densidade da seção — não de um número redondo:

```
módulos da seção   = capítulos da seção
perguntas do módulo = formas válidas (dimensão × estímulo × resposta)
                      daquele capítulo, naquele nível
```

`cifragem` tem 1 capítulo: 1 módulo. `acordes` tem 10: 10 módulos. Se um
capítulo rende 6 formas no nível 0 e 14 no nível 2, são 6 e 14 perguntas —
não 10 e 10.

> **Dez não é regra, é coincidência.** Quando uma seção couber em dez, serão
> dez porque a matéria deu dez. Forçar dez onde cabem vinte esconde metade do
> assunto; forçar dez onde cabem três inventa sete perguntas que não existem —
> e inventar pergunta é a forma mais silenciosa de mentir sobre o conteúdo.

---

## 4 · As lições do Laboratório não são as do Academy

Decisão sua, de 18/09, e ela governa tudo aqui: **a pessoa pode fazer o
Laboratório sem fazer o Academy**. O vínculo existe para o percurso saber onde
ela está, e nunca para exigir o curso.

O que a matrícula pergunta, e o que cada resposta abre, está em
`domain/practice-enrollment.ts` e na tela `EnrollmentForm`.

---

## 5 · O quadro geral

Cada seção expõe um **quadro** — o roadmap que responde "onde eu estou nisto"
antes de qualquer exercício:

```
  ┌─ INTERVALOS ──────────────────── seção · 5 capítulos ─┐
  │  nível 0  ███████████░░░░  8 de 11                    │
  │  nível 1  ████░░░░░░░░░░░  3 de 11                    │
  │  nível 2  ░░░░░░░░░░░░░░░  0 de 9    abre no nível 1  │
  │  nível 3  ░░░░░░░░░░░░░░░  0 de 7    abre no nível 2  │
  │  nível 4  ░░░░░░░░░░░░░░░  0 de 4    microfone        │
  │                                                        │
  │  capítulos 10 · 11 · 12 · 13 · 17                     │
  └────────────────────────────────────────────────────────┘
```

Três regras do quadro:

1. **O nível aparece sempre**, inclusive o que ainda não abriu — ver o que
   falta é o que orienta. Esconder o fechado deixa a pessoa sem noção de
   tamanho.
2. **O motivo do fechamento é escrito**, como em `practice-path.ts`.
3. **Nenhum número inventado.** Seção sem conteúdo naquele nível mostra zero
   e diz que não há, em vez de exibir uma barra vazia que parece progresso
   perdido.

---

## 6 · O que isto obriga no código

| Regra | Onde vive | Verificação |
|---|---|---|
| Seção sai da competência do capítulo | `domain/practice-path.ts` | `tests/practice-path.test.ts` |
| Ordem sai da numeração do capítulo | idem | idem |
| Nível é recorte da gramática | `domain/music-grammar.ts` | `tests/music-grammar.test.ts` |
| Densidade não é arredondada | `domain/practice-path.ts` | falta — ver TODO |
| "Practice" não aparece em texto de interface | — | falta — ver TODO |

---

## 7 · Vocabulário — tabela de decisão

| Se você quer dizer… | Use | Nunca use |
|---|---|---|
| O produto inteiro | **Conservatório** | Plataforma, app |
| O curso formal | **Academy** | Curso online, EAD |
| Onde se pratica e experimenta | **Laboratório** | Practice, treino |
| Um assunto do Laboratório | **Seção** | Módulo, tópico, área |
| Uma subdivisão da seção | **Módulo** | Unidade, capítulo |
| A profundidade do pedido | **Nível** | Dificuldade, tier |
| O quadro geral da seção | **Quadro** | Dashboard, painel |
| O histórico de conquistas | **Passaporte** | Troféus, galeria |
| O acervo de partituras da pessoa | **Caderno de partituras** | Biblioteca, projetos |
