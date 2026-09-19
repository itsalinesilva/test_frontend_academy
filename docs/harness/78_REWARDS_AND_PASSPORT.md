# 78 · Recompensas, réguas e passaporte

> Companheiro de `76_PROGRESS_ECONOMY.md`. Aquele diz **quanto vale cada
> coisa**; este diz **o que se ganha por acumular**. Valor de XP não se declara
> aqui; marco, emblema e carimbo não se declaram lá.

---

## 1 · A régua ascendente

O marco de cinco em cinco — 5 lições, 5 obras, 5 horas, 5 dias — é o **chão**,
e não o sistema. É o primeiro degrau de uma régua que sobe.

| Faixa | Régua | Exemplo | Multiplicador de XP |
|---|---:|---|---:|
| **I · Iniciação** | a cada **5** | 5 lições, 5 obras, 5h, 5 dias | 1× |
| **II · Constância** | a cada **10** | 10, 20, 30, 40… | 2× |
| **III · Repertório** | a cada **25** | 25, 50, 75… | 5× |
| **IV · Domínio** | a cada **50** | 50, 100, 150… | 12× |
| **V · Cátedra** | a cada **100** | 100, 200, 300… | 30× |

A régua muda de faixa quando a anterior se esgota: os marcos de 5 valem até o
25º evento; dali em diante quem marca é a régua de 10, e assim por diante. Sem
isso, alguém com 400 lições teria 80 emblemas de cinco em cinco — e oitenta
emblemas não significam nada.

**Por que os multiplicadores crescem mais que a régua.** O 100º dia seguido é
muito mais difícil que vinte vezes o 5º, porque a chance de quebrar acumula.
Um multiplicador linear pagaria mal justamente onde o esforço é maior.

### O XP do marco

```
xp do marco = XP_BASE_DO_MARCO × multiplicador da faixa
XP_BASE_DO_MARCO = 50
```

Marco de 5 lições paga 50. Marco de 100 dias paga 1500. Os dois números
existem na mesma constante, e `scripts/qa/economy.mjs` confere.

---

## 2 · O que é contável

Marco só existe sobre coisa que a plataforma **mede de verdade**. Esta lista é
fechada; acrescentar linha aqui obriga a acrescentar a medição.

| Contador | Unidade | Onde é medido | Existe? |
|---|---|---|:---:|
| Lições concluídas | lição | `LessonInProgress` | ✅ |
| Exercícios acertados | exercício | idem | ✅ |
| Dias de ofensiva | dia | `study-attendance.ts` | ✅ |
| Obras executadas no simulador | obra | ⏳ `WORK_PERFORMED` | ⬜ |
| **Horas de simulador** | minuto | ⏳ `SimulatorSession` | ⬜ |
| Obras analisadas no Atlas | obra | ⏳ `WORK_ANALYZED` | ⬜ |
| Eras visitadas | era | ⏳ | ⬜ |
| Compositores estudados | compositor | ⏳ | ⬜ |
| Regiões percorridas | região | ⏳ | ⬜ |
| Tours concluídos | tour | ⏳ `TOUR_COMPLETED` | ⬜ |
| Partituras escritas | partitura | ⏳ caderno (ver `79`) | ⬜ |
| Semanas no topo da liga | semana | `league.ts` | ✅ |

> **Tempo de simulador é a métrica mais reveladora que temos**, e é a que está
> faltando. Ela diz quanto a pessoa **tocou**, não quanto ela clicou — e é a
> única que separa quem estuda de quem coleciona tela visitada. Medida em
> minutos, somada por sessão, e nunca estimada.

---

## 3 · As quatro formas de recompensa

Elas não se misturam, e a distinção importa:

| Forma | O que prova | Onde aparece | Some se? |
|---|---|---|---|
| **XP** | que praticou | perfil, liga | nunca |
| **Emblema** | que atingiu um marco | passaporte, perfil | nunca |
| **Carimbo** | que **esteve** em algum lugar do Atlas | passaporte | nunca |
| **Credencial** | que foi **avaliado** e aprovado | perfil, verificável | nunca |

Emblema é quantidade; carimbo é lugar; credencial é julgamento. Um emblema de
"10 obras de Beethoven" diz que fez dez. Um carimbo de Beethoven diz que
esteve lá. Uma credencial diz que alguém conferiu.

> **Credencial nunca é automática.** Emblema e carimbo caem sozinhos ao atingir
> a condição; credencial exige avaliação, e é a única que a instituição assina.
> Confundir as duas transformaria emblema em diploma — o que a plataforma não
> pode prometer, por ser **curso livre**.

---

## 4 · O passaporte

O passaporte é o **acervo** de carimbos e emblemas: onde a pessoa esteve,
o que fez, em que ordem. É o histórico documentado — e é o ponto para o qual o
Atlas existe.

A distinção com o perfil é dura e vale escrever:

| | Perfil | Passaporte |
|---|---|---|
| Responde | "como estou **agora**" | "por onde **passei**" |
| Conteúdo | XP, nível, liga, ofensiva, precisão | carimbos, emblemas, credenciais |
| Muda quando | a cada sessão | só quando algo novo acontece |
| Apaga | nada, mas os números oscilam | nada, e nada oscila |
| Natureza | **estado** | **história** |

### O Passaporte é também a carteira de pertencimento

Além dos carimbos, ele responde a seis perguntas — Academia, Grêmio,
Laboratório, Casa, Comunidade, Clube. A estrutura está em
`80_INSTITUTIONAL_ARCHITECTURE.md` §10, e a regra é a mesma de todo o resto:
vazio é vazio, e pertencimento de exemplo seria afirmação falsa sobre a vida
de alguém.

### Tipos de carimbo

| Carimbo | Ganha-se ao | Soma |
|---|---|---|
| **Era** | concluir a primeira obra de uma era | 8 possíveis |
| **Região** | concluir a primeira obra de uma região | 3 hoje |
| **Compositor** | concluir uma obra do compositor | 1 por compositor |
| **Obra** | executar a obra no simulador | 1 por obra |
| **Tour** | concluir um tour inteiro | 1 por tour |
| **Casa** | entrar e praticar numa Casa | 7 hoje |

O carimbo de compositor **soma**: cinco obras de Beethoven deixam um carimbo de
Beethoven com contador 5 — e não cinco carimbos iguais. Carimbo repetido
encheria o passaporte de duplicata e esconderia a variedade, que é justamente o
que ele existe para mostrar.

### O passaporte não se enfeita

Página sem carimbo mostra a **forma da página** — como o esqueleto da liga —
e diz o que é preciso fazer para o primeiro. Nunca carimbo cinza "de exemplo",
nunca contador inventado. Um passaporte que começa parecendo usado tira o
sentido de usá-lo.

---

## 5 · O que a pessoa escolhe expor

O acervo é dela; a vitrine também.

| Regra | Razão |
|---|---|
| Tudo o que ganhou fica no passaporte | é histórico, e histórico não se edita |
| Ela escolhe **quais** aparecem no perfil | perfil é apresentação, e apresentação é escolha |
| Ela escolhe **quantos** destaca | limite de destaque: **6** |
| Nada aparece no perfil por padrão | ninguém deve ser exposto por omissão |
| Esconder no perfil **não** apaga do passaporte | são coisas diferentes |

---

## 6 · Ligas, rankings e a proporção entre eles

`76 §6` define a mecânica da liga. O que este documento acrescenta é como ela
se relaciona com a régua:

| Sistema | Período | Métrica | Zera |
|---|---|---|---|
| **Liga** | semana | XP da semana | sim, toda segunda |
| **Ranking de obra** | sempre | melhor pontuação naquela obra | não |
| **Ranking de tour** | sempre | pontuação somada do tour | não |
| **Régua / emblema** | sempre | contagem acumulada | não |

A liga é a única que zera, e é de propósito: ela mede **esforço recente**, e
por isso quem volta depois de um mês compete de igual para igual. Os rankings
de obra e de tour são o contrário — medem **a melhor execução de sempre**, e é
o que faz valer a pena refazer a mesma obra até tirar uma pontuação melhor.

> **Refazer a obra é o laço central do Laboratório.** Tocar, pontuar, ver a
> própria marca anterior, tentar de novo. É por isso que o ranking de obra não
> pode zerar: ele é a memória contra a qual a pessoa compete.

---

## 7 · O que o admin decide

Nem tudo aqui deve estar ligado no dia um. O catálogo declara **tudo o que é
possível**; a plataforma liga o que faz sentido agora.

| Estado | O que significa |
|---|---|
| `PADRAO` | ligado desde o começo, para todos |
| `OPCIONAL` | existe, desligado; o admin liga |
| `EXPERIMENTAL` | existe e pode inflar a economia; o admin avalia antes |

O admin pode, na tela de recompensas: **ligar, desligar, editar o texto, editar
a condição e criar marco novo** a partir dos contadores da §2. O que ele não
pode é criar marco sobre contador que não existe — e a tela não oferece essa
opção, em vez de aceitar e falhar depois.

> **O que já foi ganho não se perde.** Desligar um emblema tira-o da lista de
> ganháveis; quem já tinha continua tendo. Retirar conquista de alguém por
> decisão administrativa é o tipo de coisa que destrói confiança de uma vez.

---

## 8 · Verificações que isto obriga

| Regra | Verificação | Existe? |
|---|---|:---:|
| Marco só sobre contador medido | `checkMilestoneCounter` | ⬜ |
| XP de marco = base × multiplicador | `checkMilestoneXp` | ⬜ |
| Nenhum carimbo duplicado | teste de domínio | ⬜ |
| Passaporte vazio não inventa carimbo | `checkFabricatedData` | ✅ |
| Desligar emblema não apaga conquista | teste de domínio | ⬜ |
| Credencial nunca automática | `checkDegreeClaims` | ✅ parcial |
