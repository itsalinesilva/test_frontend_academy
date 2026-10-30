# 84 — O PADRÃO DE CATALOGAÇÃO DO ACERVO

O acervo do Conservatório é **banco próprio**: entidade nossa, corrigível por
quem sabe mais que a fonte. Mas o modelo de ficha não foi inventado aqui — é o
que os catálogos de música usam, e a razão é prática.

## Por que seguir o padrão

"Sonata em dó maior" de Mozart existe mais de uma vez. Só o conjunto **número
de catálogo + tonalidade + instrumentação** distingue uma da outra. Um catálogo
que guardasse apenas título e compositor teria ambiguidade estrutural: duas
obras diferentes ocupando a mesma linha.

## O registro de obra

| campo | por que é padrão | estado |
| :--- | :--- | :---: |
| título canônico | identifica | 17/17 |
| compositor | identifica | 17/17 |
| **número de catálogo** | é o identificador que a musicologia usa: BWV, K., Op. | 0/17 |
| **tonalidade** | entra no título por convenção e distingue homônimos | 17/17 |
| **compasso** | fato da peça; o simulador precisa dele | 17/17 |
| **andamento** | idem | 17/17 |
| gênero/forma | recorte de busca em todo catálogo | 14/17 |
| instrumentação | separa a versão para piano da de orquestra | 17/17 |
| movimentos | uma sonata em três movimentos é uma obra, não três | 0/17 |
| data de composição | situa com mais precisão que a era | 0/17 |
| era · região | os dois eixos do Atlas | 17/17 |
| situação de direito autoral | decide o que pode ser oferecido | 17/17 |
| identificadores cruzados | reconciliação entre fontes | 0/17 |
| referência de partitura | o que torna a obra estudável | 17/17 |

**Dez dos catorze completos.** Os quatro vazios — número de catálogo,
movimentos, data e identificadores cruzados — dependem da **resolução de
identidade**, que consulta Wikidata e MusicBrainz e portanto depende de rede.

### Por que não preenchê-los por dedução

"Prelúdio em dó maior" de Bach é quase certamente BWV 846. Quase certamente
não é apuração. Deduzir o número de catálogo do título e da tonalidade seria
palpite com cara de catalogação — e **catálogo que adivinha é pior que catálogo
incompleto**, porque ninguém sabe quais linhas conferir.

`tests/acervo-seed.test.ts` cobra que esses campos **permaneçam vazios** até a
ingestão rodar.

## Os recortes de filtro

Os mesmos que um catálogo de música oferece:

| eixo | onde |
| :--- | :--- |
| era | Acervo e Atlas |
| região | Acervo e Atlas |
| movimento estético | Acervo e Atlas |
| gênero/forma | Acervo |
| compositor | Acervo |
| **tonalidade** | Acervo |
| disponibilidade para estudo | Acervo |

As listas de opção saem do **próprio acervo**, e não de listas escritas à mão:
filtro que oferece um recorte sem resultado, sem dizer por quê, parece defeito.

## O defeito que originou este documento

`FaixaDoPlayer` sempre trouxe `tonalidade`, `compasso` e `bpm`. A projeção para
`CanonicalWork` **jogava os três fora**.

Perder informação numa projeção não quebra nada e não aparece em lugar nenhum:
o tipo aceita o campo ausente, a tela não mostra, e ninguém sente falta do que
nunca viu. A ficha ficava mais pobre que o dado que já existia no repositório.

Há teste para que não volte.

## Os três eixos que não se anulam

Um catálogo amador colapsa estes três num campo só, e depois não consegue
cruzar nada:

| Eixo | Pergunta | Exemplo | Onde vive |
|---|---|---|---|
| **Meio** | Por onde sai o som? | teclado, orquestra, voz | `instrumentation[]` |
| **Forma** | Como a obra se organiza? | sonata, fuga, minueto | `generoId` |
| **Movimento estético** | A que corrente pertence? | impressionismo | `movements[]` |

Existe sonata para piano e sonata para violino: a forma é a mesma, o meio muda.
Existe fuga barroca e fuga do século XX. Quem procura repertório procura pelo
meio; quem estuda estrutura procura pela forma.

Um quarto eixo se confunde com o terceiro pelo nome: **os movimentos da obra**
— allegro, adágio — são as partes dela, e não a corrente estética a que
pertence. São dois campos diferentes com a mesma palavra.

### O defeito que este quadro documenta

O campo de forma guardou **meio** em 25.195 obras. A classificação de origem
— `Keyboard`, `Orchestral`, `Chamber`, `Stage`, `Vocal` — responde à primeira
pergunta, e estava gravada no campo da segunda. O filtro oferecia `vocal` ao
lado de `minueto` como se fossem do mesmo tipo.

Migrado para `instrumentation`. O campo de forma ficou **vazio** até vir forma
de verdade, e o filtro caiu de 5 opções falsas para 13 formas reais.

Campo errado preenchido é pior que campo vazio: **o vazio se vê, o errado
não.**

---

## O meio tem dois níveis, e eles não se misturam numa faceta

A catalogação de origem classifica **grosso**: sabe dizer "teclado" para vinte
e cinco mil obras, e não sabe dizer "cravo". A partitura classifica **fino**:
quem transcreveu escreveu para que instrumento.

Os dois convivem no mesmo campo de propósito — uma obra de piano **é** obra de
teclado, e quem filtra por teclado tem de achá-la. O que não convive é a
faceta:

| Faceta | O que oferece | Pergunta que responde |
|---|---|---|
| **Meio** | teclado, orquestra, câmara, voz, cena | "o que há de teclado" |
| **Instrumento da edição** | Piano, Violino, Violão, Voz | "o que há com arquivo para piano" |

Oferecer `Teclado (5.951)` ao lado de `Piano (685)` como irmãos ensinaria que o
catálogo não sabe o que está contando — um contém o outro.

`checkNiveisDeMeioSeparados` acusa se os mapas se fundirem, e acusa se a mesma
chave aparecer nos dois níveis.

---

## 🔴 A atribuição da edição é condição de uso, e não crédito de cortesia

A obra estar em domínio público **não torna livre o arquivo**. São dois
direitos distintos: o da composição, que expira, e o da **edição**, de quem
transcreveu — que é trabalho recente e tem licença própria.

Das 1.349 partituras do acervo, **621 estão sob Creative Commons com cláusula
de atribuição**. Exibir um desses arquivos sem nomear quem o produziu é
redistribuí-lo **sem licença nenhuma**.

A primeira extração trouxe título, instrumento, licença, link e PDF — e não
trouxe o nome. As 621 ficaram impublicáveis por uma coluna ausente, e ninguém
percebeu porque a ficha não tinha onde mostrar a falta.

Uma segunda passada, sobre a página por peça, trouxe **1.348 de 1.349**
mantenedores — 179 pessoas distintas.

### As três garantias, porque cada uma quebra sozinha

1. **O dado existe** no arquivo servido. A geração do seed **falha com código 1**
   se alguma peça sob CC ficar sem mantenedor.
2. **O catálogo o carrega** para `ExternalScoreRef.editors`.
3. **A tela o desenha** — e o crédito **abre** o bloco de edição, em vez de
   terminar uma linha técnica.

`checkAtribuicaoDaPartitura` **BLOQUEIA** o build e vigia os três elos.

### O e-mail do mantenedor não entra

A fonte publica nome, e-mail ofuscado e site. Só o **nome** entra no acervo: o
e-mail é dado pessoal de um voluntário, publicado para ser contactado sobre a
edição — e não para ser copiado para dentro de outro sistema. A atribuição
que a licença exige se cumpre com o nome e o link para a peça na fonte.

---

## Ler o título não é deduzir o campo

`Sonata in B flat major, K. 545` carrega três campos de catálogo dentro do
próprio título. Extraí-los não inventa nada — o dado está escrito —, e
deixá-los presos na cadeia de texto é o que faz um catálogo ter campo vazio
sobre informação que ele possui.

Inferir que uma peça de 1720 de Bach "deve ser" BWV alguma coisa seria a outra
operação, e essa `title-reading.ts` não faz.

### O rendimento, medido contra a alternativa

A decisão foi tomada com número, e não por preferência:

| Campo | Lendo o título | Consultando a base externa |
|---|---|---|
| Forma | **45%** | 4% |
| Número de catálogo | **46%** | não vem como atributo |
| Tonalidade | **25%** | 11% |
| Requisições | nenhuma | uma por página de cem |

A amostra externa foi de trezentas obras de um mesmo compositor. A consulta
externa continua valendo — e vale **depois**: com onze mil números de catálogo
em mãos, a ligação entre as bases deixa de depender de grafia de título e passa
a ter chave de verdade.

### A recusa é metade do módulo

Um leitor que acerta `Sonata, K. 545` e também "acerta" `Manhã` inventando uma
forma seria pior que leitor nenhum, porque o erro dele vem com cara de dado.

- Título poético — "Manhã", "Melodia", "Für Elise" — fica **sem forma**.
- A forma vem de **vocabulário fechado**, o mesmo `DEFAULT_GENRES` do Atlas.
  Uma forma que não existisse lá apareceria no filtro sem rótulo.
- `Hob. III:12` fica **sem número**, e não com um número errado.

### 🔴 O modo é obrigatório na tonalidade

A primeira regra aceitava `in` seguido de nota, e classificou *"Ich bin **in
mi**r vergnügt"* como estando em Mi.

Sem a palavra que diz maior ou menor, qualquer preposição seguida de duas
letras vira tonalidade — e o filtro passa a mentir sobre milhares de cantatas
alemãs. As três grafias lidas (`C major`, `e-Moll`, `en ré mineur`) exigem o
modo.

### O teste guarda piso **e** teto

Piso, porque a regra pode continuar compilando e devolvendo vazio para tudo —
foi assim que dois verificadores deste projeto passaram meses verdes sobre
cegueira.

Teto, porque **salto de cobertura aqui é sinal de regra frouxa**, e não de
melhora. Se a tonalidade passar de metade do acervo, algo voltou a casar o que
não devia.

---

## O que este acervo **não** é

Não é grande. São **14 compositores e 17 obras**, derivados do repertório
próprio — melodias transcritas à mão para o sintetizador da plataforma, escritas
antes da catalogação existir.

**Nada foi baixado de fonte externa.** Os adaptadores estão especificados, um
está escrito (Wikidata), e nenhum rodou: a ingestão depende de rede.

O volume virá da ingestão, e é ela que transforma dezessete registros em
acervo. Até lá, o que existe está bem catalogado — e é só isso que se afirma.
