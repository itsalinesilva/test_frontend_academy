# 86 — A DIGNIDADE DO FILTRO

> O que um eixo precisa cumprir para ser oferecido, e o que ele precisa
> declarar quando não alcança tudo.

---

## O defeito que originou este documento

O Acervo oferecia um filtro de **Região**. Ele recortava **17 obras de
26.288** — e era apresentado como qualquer outro filtro.

Quem clicava em `Europa Ocidental (14)` concluía que eram essas as obras
europeias que existiam. Eram as que tinham **o campo escrito**.

**A diferença entre "não há" e "não apuramos" é invisível no resultado de um
filtro.** Um recorte devolve uma lista; a lista não diz se é curta porque o
acervo é pobre ali ou porque ninguém apurou. É o mesmo tipo de mentira que uma
tela anunciando "142 obras canônicas" sobre um acervo de zero.

---

## 1 · Os dois tipos de eixo

Tratá-los igual produz as duas falhas opostas.

| | **Universal** | **Seletivo** |
|---|---|---|
| Exemplos | era, região, compositor, meio | movimento estético, partitura, número de catálogo, tonalidade |
| Toda obra tem? | **sim** | **não, e isso é a realidade** |
| Cobertura baixa significa | lacuna de apuração | o acervo é assim |
| Piso exigido | **90%** | nenhum |

Cobrar noventa por cento de um eixo seletivo levaria a **inventar dado**: um
campo de movimento estético a cem por cento seria falso, porque a maior parte
dos compositores não pertence a movimento nomeado.

Não cobrar nada de um eixo universal deixa o filtro mentir.

---

## 2 · Toda faceta declara quanto alcança

`Faceta.cobertura` traz `{ comCampo, total }`, apurado sobre o recorte atual.
A tela escreve:

> Recorta 45% do acervo — 11.684 obras. Nem todo registro tem este dado, e isso
> é a realidade do acervo.

E, num eixo universal:

> Recorta 96% do acervo — 25.164 obras. O que falta é apuração, e não ausência.

**Eixo que alcança tudo não escreve frase nenhuma.** "100% das obras têm este
dado" é ruído, e ruído repetido ensina a não ler os avisos que importam.

### `comCampo` não é a soma das opções

Num campo de lista, uma obra com três instrumentos soma três e é **uma** obra.
Somar daria cobertura acima de cem por cento, ou — pior — cobertura plausível
sobre um acervo em que metade não tem o campo.

---

## 3 · Uma faceta não se filtra

Cada eixo conta sobre o resultado dos **demais** filtros, e nunca sobre o seu
próprio.

O recorte aplicava todos os filtros e contava cada eixo sobre o resultado,
inclusive o dele. Escolher "Brasil" fazia o eixo de região mostrar só
`Brasil (4)` — e **trocar de região virava impossível** sem limpar o filtro
antes. O filtro virava um beco.

É mais caro de calcular, e é o que faz a busca facetada ser navegável.

---

## 4 · Opção com zero não é oferecida

Oferecer um recorte que devolve vazio é convidar ao beco sem saída, e um
catálogo que faz isso ensina a desconfiar de todos os filtros dele.

A Antiguidade, por exemplo, **não** aparece no filtro de era das obras: ela é
catalogada por `RegistroDaAntiguidade`, que é outro tipo de ficha.

### Recorte órfão se limpa sozinho

As facetas se compõem, então um valor já escolhido pode cair fora da lista
nova. Quando isso acontece, o `<select>` fica em branco e a lista vem vazia —
quem olha conclui que o acervo não tem nada, e não que a combinação não existe.

A versão anterior limpava região e movimento à mão quando a era mudava: cobria
uma combinação e deixava as outras. A regra agora é geral e tem teste de
invariante: **todo seletor exibe "Todos" ou uma opção que ele mesmo oferece.**

---

## 5 · 🔴 O filtro oferecido precisa ser aplicado

O sistema de facetas vivia no serviço desde o início — contagem por opção,
opção vazia não oferecida, tudo testado — e **a tela não o chamava**. Ela
montava os seletores de `DEFAULT_ERAS`, `DEFAULT_REGIONS` e `DEFAULT_GENRES`.

Um filtro que a tela mostra e a listagem ignora é pior que filtro nenhum: quem
clica vê a contagem mudar no rótulo e o resultado ficar igual, e conclui que o
catálogo está quebrado — o que está.

`checkFiltroOferecidoEAplicado` **bloqueia o build** e vigia a mão dupla:

1. o campo de toda faceta montada aparece num `.filter` do mesmo serviço;
2. a tela pede as facetas ao serviço, em vez de montar lista fixa.

---

## 6 · A ajuda fica FORA do `<label>`

Não é detalhe de marcação. Dentro dele, o texto de apoio entra no **nome
acessível** do campo: o seletor de era passou a se chamar

> "Era Quando a obra foi escrita, no recorte de sete eras do curso."

Quem usa leitor de tela ouve a frase inteira a cada foco, e quem procura o campo
pelo nome não o encontra. Fora, com `aria-describedby`, o campo se chama "Era" e
a explicação é lida depois — que é o papel dela.

---

## 7 · A matriz de completude

`scripts/auditar-completude.ts` mede campo a campo, **sobre o acervo servido**
e não sobre amostra. É ela que responde qual filtro o acervo sustenta.

| | antes | depois |
|---|---|---|
| Campos acima de 90% | 17 de 32 | **21 de 33** |
| `obra.regionId` | **0%** (17 registros) | **96%** (25.164) |
| `compositor.regionIds` | 6% | **98%** |
| `compositor.birthPlace` | 0% | **94%** |
| `compositor.deathPlace` | 0% | **91%** |

### O que segue abaixo do piso, e por quê

| Campo | Cobertura | Por quê |
|---|---|---|
| `catalogNumber` | 45% | a leitura de título está no teto; o resto só vem de consulta por obra |
| `generoId` | 44% | idem — e título poético não nomeia forma |
| `key` | 24% | a maioria dos títulos não traz tonalidade |
| `instrumentosPraticados` | 77% | a fonte não declara o instrumento de todo mundo |
| `date` | 3% | só a ficha por peça do Mutopia a traz |
| `movements` da obra | 0% | allegro, adágio — exige catalogação analítica |
| `movements` do compositor | 5% | **seletivo**: a maioria não pertence a movimento nomeado |
| `recordingRefs` | 0% | nenhuma fonte de gravação integrada |

Todos são eixos **seletivos**, exceto os que já alcançaram o piso. Nenhum é
oferecido sem declarar o que recorta.
