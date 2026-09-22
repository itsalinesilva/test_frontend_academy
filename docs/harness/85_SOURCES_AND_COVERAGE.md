# 85 — AS FONTES DO ACERVO, E O QUE ELAS NÃO COBREM

Documento **interno**. Nada aqui aparece na plataforma: o conteúdo é autoral, e
a origem dos dados é registro de engenharia.

A exceção é o **link oficial** que a ficha de uma obra mostra — ali o assunto é
*onde o item está disponível*, que é informação de catálogo e obrigação de
atribuição. Diferente de citar de quem é a opinião editorial, que é o que este
documento existe para manter fora do produto.

---

## 1 · O que foi adquirido, e de onde

Medido em **2026-09-20**, contra o catálogo que a tela lê — e não contra os
arquivos crus, que divergem dele.

| fonte | o que deu | quantos |
| :--- | :--- | ---: |
| **Open Opus** | nome canônico, datas, época, lista de obras | 225 compositores · 24.940 obras |
| **Wikidata** | biografia curta em pt, retrato, identificadores cruzados | 220 biografias · 220 retratos |
| **Música Brasilis** | o corpus brasileiro: compositor, datas, biografia, e a página da edição | 783 compositores · 6.917 obras |
| **IMSLP / Petrucci** | onde está a partitura de obra que já temos | 11.221 endereços |
| **Mutopia** | o **arquivo** da partitura (`.ly`, e MIDI em 37) | 181 obras · 1.051 na fila |
| **Antiguidade** | registro próprio: fragmento, tratado, sistema modal | 8 obras |
| **acervo próprio** | transcrições para o sintetizador da plataforma | 14 compositores · 17 obras |

**Total: 31.952 obras · 1.004 compositores.**

### 🔴 A distinção que a plataforma inteira depende

Três números diferentes, e confundi-los foi o defeito mais persistente desta
sessão:

| | quantas | o que significa |
| :--- | ---: | :--- |
| **catalogadas** | 31.952 | a ficha existe: título, autoria, era, região |
| **com partitura** | 16.820 | sabemos **onde a edição está**, e abrimos o caminho |
| **que tocam aqui** | 17 | a plataforma **reproduz**: edição nossa, montada nota a nota |

O que temos das 16.820 é o **endereço**, e não o arquivo — IMSLP proíbe
`/images/` e `/imglnks/`, Música Brasilis proíbe `/media/`, e nada foi baixado
de nenhuma das duas. A exceção é o Mutopia, cujo material é redistribuível: ali
o que se guarda é o link do próprio `.ly`.

Uma ficha que dissesse "obra disponível" sobre as 16.820 estaria afirmando
posse de dezesseis mil partituras que não estão conosco.

### Como cada uma responde

**Open Opus** — API JSON sem chave, CORS aberto. Listagem por inicial
(`/composer/list/name/<letra>.json`); obras por compositor em
`/work/list/composer/<id>/genre/all`.

**Wikidata** — a **API de ação** (`w/api.php`), e não o endpoint SPARQL. O
SPARQL exige User-Agent de política e devolve `403` sem ele; a API de ação não
tem essa exigência e responde com CORS aberto. Duas chamadas por compositor:
`wbsearchentities` resolve o Q-id, `wbgetentities` traz as propriedades.

> **Erro registrado.** Durante uma sessão eu afirmei que o ambiente não tinha
> rede, generalizando aquele `403` do SPARQL. Tinha. O erro custou tempo e
> atrasou o acervo inteiro.

**Música Brasilis** — HTML paginado (`?page=N`, 20 por página). O fim da lista
é sinalizado com **erro 500**, e não com página vazia: tratar isso como falha
abortou a primeira extração na página 85. A biografia não está na listagem, só
na página de cada compositor. `robots.txt` proíbe `/media/` — retrato e arquivo
ficam de fora.

**IMSLP** — a interface pública `/imslpscripts/API.ISCR.php`, 1.000 entradas
por chamada, 259 mil no total. `robots.txt` pede **`Crawl-delay: 2`**, e
proíbe `/index.php`, `/images/`, `/imglnks/`, `/wiki/File:`, `/works` e
`/work/`. O índice fica **em cache** (`scripts/.imslp-indice.json`, 33 MB, não
versionado): sem ele, cada ajuste de chave custava vinte minutos de banda de
quem mantém isso de graça.

**Mutopia** — `?startat` para paginar, `piece-info.cgi` por peça. A segunda
passada por peça foi obrigatória: a listagem dá licença e não dá **transcritor**,
e 621 arquivos sob licença com cláusula de atribuição são impublicáveis sem o
nome de quem os produziu.

---

## 1a · 🔴 O MAPA DO ENDEREÇO — onde está a partitura de cada obra

```
31.952  obras catalogadas
├── 16.820  COM PARTITURA  (52,6%)
│   ├── 11.221  IMSLP / Petrucci      link da página da obra
│   ├──  6.917  Música Brasilis       link da página da edição
│   └──    181  Mutopia               link do ARQUIVO (.ly)
│       └──  17  que a plataforma reproduz  (edição nossa)
└── 15.132  SEM ENDEREÇO  (47,4%)
    ├──  4.274  protegidas            não estão no IMSLP, por lei
    └── 10.858  em domínio público    o casamento ainda não achou
```

As somas por fonte passam de 16.820 porque uma obra pode ter mais de um
endereço — Mutopia e IMSLP para a mesma peça, por exemplo.

### Por que as 11.046 ainda não casaram

Medido, e não suposto. Quatro causas, em ordem de tamanho:

**Sistema de catálogo diferente dos dois lados.** É a maior, e nenhuma chave a
resolve: nosso Monteverdi é `SV`, o do IMSLP é `CND`; nosso C.P.E. Bach é `Wq`,
o deles é `Helm`; nosso Byrd é `MB`, o deles é `T`. Exige **tabela de
equivalência** entre catálogos, que é trabalho de musicologia e não de
normalização.

**Compositor ausente do índice deles** — 4.639 obras.

**Título escrito diferente** sem número de catálogo em nenhum dos lados. O
casamento por prefixo de 20 caracteres pega parte, e para onde o prefixo é
ambíguo ele **não casa nada**, por regra.

**Obra que a fonte simplesmente não tem.**

### O que já foi corrigido, e quanto rendeu

| correção | de → para |
| :--- | ---: |
| `` virava BACKSPACE na expressão de catálogo — compilava e nunca casava | — |
| siglas de catálogo: 9 → 36 (fonte) e 16 → 40 (nosso lado) | 9.625 → 10.560 |
| cache do índice, e casamento por prefixo | → 10.808 |
| número com romano e dois-pontos: `Hob.XVI:52`, `TWV 43:h3` | → **11.075** |
| títulos alternativos do MusicBrainz, como chave adicional | → **11.269** |

A terceira sozinha valeu **501 obras de Telemann**: `TWV 43:h3` saía truncado
como `TWV 43`, que é comum a dezenas de quartetos — e chave ambígua não casa
nada, por regra.

---

## 1b · A matriz de completude, medida

Sobre as 31.952 obras:

| campo | cobertura | eixo |
| :--- | ---: | :--- |
| meio | 99,8% | universal |
| região | 98,7% | universal |
| era | 96,0% | universal |
| número de catálogo | 42,8% | seletivo — lido do título |
| gênero (forma) | 36,5% | seletivo — lido do título |
| tonalidade | 19,8% | seletivo — lida do título |

Sobre os 1.004 compositores:

| campo | cobertura |
| :--- | ---: |
| região | 99,6% |
| biografia | 89,6% |
| data de morte | 65,9% |
| retrato | 21,9% |

**Retrato e data de morte caíram** quando o corpus brasileiro entrou, e a causa
é a fonte: Música Brasilis publica datas para 452 dos 756, e o retrato dela
está sob `/media/`, que o `robots.txt` proíbe. A queda é honesta — o que não se
pode é oferecer como filtro um campo que alcança 22%.

Direito autoral, sobre as obras: **24.336 em domínio público · 5.688 protegidas
· 1.928 indeterminadas**. Obra protegida **aparece no catálogo**, diz de quem é
e aponta para onde está publicada; o que o prazo impede é tocá-la aqui dentro.

---

## 2 · Como a fonte classifica

O Open Opus usa **dez épocas**. Elas são o eixo cronológico dele, e o mapa para
as sete eras do Atlas é este:

| época (fonte) | era do Atlas |
| :--- | :--- |
| Medieval | `era_medieval` |
| Renaissance | `era_renascimento` |
| Baroque | `era_barroco` |
| Classical | `era_classicismo` |
| Early Romantic · Romantic · Late Romantic | `era_romantismo` |
| Post-Romantic · 20th Century | `era_moderna` |
| Post-War · 21st Century | `era_contemporanea` |

Três épocas caem na mesma era de Romantismo, e duas na mesma era Moderna. **A
distinção não se perde**: o sub-período é guardado ao lado da era, no campo
`subPeriodo`, e é recorte de consulta próprio.

O Atlas tem sete eras porque é o recorte do curso — elas organizam o mapa. O
sub-período refina a busca: separar romântico inicial de tardio é a diferença
entre Schubert e Mahler, e essa diferença é o assunto de dois capítulos.

Os dois eixos convivem, e nada é descartado.

Gêneros da fonte — Keyboard, Orchestral, Chamber, Stage, Vocal, Popular — são
**agrupamentos de meio**, e não formas. Não se confundem com os gêneros do
Atlas (missa, fuga, minueto), que são formas. Os dois eixos coexistem.

---

## 3 · 🔴 O QUE AS FONTES NÃO COBREM

**Esta é a seção mais importante do documento.** Um acervo que não declara o
próprio recorte deixa quem consulta supor que a ausência é do mundo, e não da
fonte.

O Open Opus é um catálogo de **música de concerto ocidental**. Fora disso, ele
é mudo — e foi por isso que outras fontes entraram.

| lacuna | estado hoje | natureza |
| :--- | :--- | :--- |
| **Repertório brasileiro** | ✅ **783 compositores, 6.917 obras** | era falha de cobertura, e foi resolvida: Música Brasilis cataloga o corpus como corpus |
| **Antiguidade** | ✅ 8 registros, como obras da era | não é falha de fonte: sobreviveu pouquíssima música notada |
| **Repertório de violão** | ⬜ 700 partituras sem compositor | Giuliani (88), Horetzky (60), Carcassi (36), Aguado (26). O Mutopia os tem; o Open Opus, não |
| **Tradições não-europeias** | ⬜ ausentes | fora do escopo declarado de toda fonte usada |
| **Música popular** | ⬜ marginal | idem |
| **Compositoras** | ⬜ pouquíssimas | viés do cânone que a fonte reproduz. Música Brasilis melhorou: Chiquinha Gonzaga entra com 156 obras |

### O que mudou desde a primeira versão desta tabela

**O Brasil deixou de ser lacuna.** Ele aparecia com quatro nomes — os que
atravessaram para o catálogo do concerto europeu —, e hoje tem 783. A regra de
ontologia "fonte externa enriquece, e não cria" ganhou aqui a sua **exceção
declarada**: para o recorte brasileiro, Música Brasilis ocupa o lugar que o
Open Opus ocupa no ocidental, e por isso cria entidade.

**A Antiguidade deixou de precisar de tratamento especial.** Ela era um tipo de
registro à parte, com recorte próprio na tela, e isso era erro de categoria:
obra e pessoa são *o que a coisa é*, antiguidade é *quando*. Os oito registros
entraram como obras de `era_antiguidade`, com suporte e datação no lugar de
tonalidade e número de catálogo — campos que `CanonicalWork` já previa vazios.

**Obra sem autoria é permitida ali, e só ali.** A música antiga que sobreviveu
é quase toda anônima, e inventar um autor para preencher campo seria o pior
tipo de dado fabricado. Fora da Antiguidade, obra sem autor é defeito.

---

## 4 · Os recortes editoriais da fonte

O Open Opus marca obras como *popular* e *recommended* — **1.245 recomendadas e
401 populares**. São **opinião editorial de terceiro**: a curadoria de quem eles
consideram entrada natural no repertório.

### 🔴 Correção: eles ENTRAM na plataforma, com o rótulo dizendo de quem são

Este documento afirmava que "nenhum filtro da plataforma usa `popular` ou
`recommended`". **Deixou de ser verdade**, e a mudança foi deliberada: eles são
uma faceta chamada `selecao`, com duas opções:

- **"Recomendadas pela fonte"**
- **"Em destaque no catálogo de origem"**

O que estava certo no raciocínio antigo era o *risco*, e não a proibição.
Rotulá-las "os principais" ou "os mais tocados" afirmaria uma apuração que
ninguém fez, e "descendência" afirmaria uma linhagem que o dado não carrega —
`rec` não é escola, nem influência. O rótulo que nomeia a fonte resolve isso
sem jogar fora um recorte útil.

O catálogo continua neutro: a plataforma não assina o juízo, ela **diz de quem
ele é**.

### Onde eles entram também

Como **insumo de artigo autoral**. O artigo usa o recorte como ponto de partida,
o Conservatório conclui o que conclui, e o texto é nosso. Ver
`src/domain/article.ts`.

---

## 4a · A fonte repete, e a repetição estava sumindo

`obras.json` tinha 25.195 registros e **24.940 identificadores distintos**. 204
ids apareciam mais de uma vez — 255 registros —, e o `Map.set` da geração
deixava o último a chegar vencer.

Conferidos um a um, **todos os 255 são a mesma obra digitada duas vezes na
fonte**: mesmo número de catálogo, mudando só acento, caixa ou espaço final.

```
"O Jesulein suss, o Jesulein mild, BWV.493"
"O Jesulein süss, o Jesulein mild, BWV.493"
```

O slug já colapsava as duas, porque ignora acento — mas colapsava **por
acidente**. Acidente que dá o resultado certo continua sendo acidente: ali ele
escolhia a grafia pior com a mesma probabilidade com que escolhia a melhor.

Agora é deliberado e escolhe: vence o título com **mais acento** — grafia mais
completa é a menos corrompida na transmissão — e, empatando, o mais curto, que
é o sem espaço sobrando. Os identificadores das duas entradas ficam guardados
em `oo2`, porque a fonte conhece as duas e perder isso quebraria a volta à
origem.

---

## 4b · A segunda passada sobre as partituras

A listagem da fonte dá título, instrumento, estilo, licença e os arquivos. Não
dá **quem editorou**, que é condição de licença em 621 das 1.349 peças.

A página por peça dá, e dá mais duas coisas que a listagem não tem:

| Campo | Quantas | Para que serve |
|---|---|---|
| Mantenedor | **1.348** de 1.349 | Cumprir a cláusula de atribuição |
| Número de catálogo | **393** | Único dado capaz de provar que duas fontes falam da mesma obra |
| Data de composição | **866** | Situa a peça dentro da era, e não só na era |

O campo `Opus` da fonte guardava **duas coisas**: em `BWV 846` e `D. 891` é
número de catálogo; em `Orchésographie` e `Ayres and Lute Songs I` é o nome da
coletânea. Gravar as duas no mesmo campo repetiria o erro do gênero, e foram
separadas pela forma: sigla curta seguida de número é catálogo, o resto é
título.

**O ritmo foi deliberadamente lento** — quatro por vez, com pausa entre as
levas. O `robots.txt` não proíbe este caminho, e não proibir não é convidar:
um projeto de voluntários não deve pagar a conta de banda pela nossa pressa.

---

## 4c · Título não deduplica entre fontes

Das 638 partituras com compositor reconhecido, **18** têm título que casa com
uma obra já catalogada. As outras 620 não casam porque as duas fontes escrevem
diferente:

- uma diz `Das wohltemperierte Klavier`, a outra `Prelude and Fugue in C major`
- uma lista a coleção inteira, a outra numera `14 Canons - 3`

Aproximar por semelhança de texto casaria préludios errados entre si, e **um
catálogo que junta a peça errada mente pior do que um que repete**.

Então repete, e a repetição é declarada: as 1.331 entram como registro
próprio, ligadas ao mesmo compositor. Quem abrir Bach vê a ficha da
catalogação e a edição como duas linhas — e são duas coisas: uma diz que a
obra existe, a outra diz que há arquivo e sob que licença.

O que funde de verdade é **número de catálogo**. Já há 393; falta a passada
por obra que os traga para o lado da catalogação de origem.

---

## 4d · As sete propriedades do Wikidata, conferidas contra a API

Sete propriedades foram levantadas de conhecimento geral. **Quatro existem** em
registro de pessoa e três não — e as três não existem porque a pergunta estava
endereçada à entidade errada.

| Propriedade | Em compositor? | Onde vive de verdade |
|---|---|---|
| **P19** local de nascimento | ✅ 219 de 220 | — |
| **P20** local de morte | ✅ 212 | — |
| **P27** cidadania | ✅ 216 | — |
| **P1303** instrumento praticado | ✅ 181 | — |
| **P135** movimento | ⚠️ 83, e mistura era com movimento | — |
| P412 tessitura | ❌ | registro de **cantor** |
| P571 data de criação | ❌ | registro de **obra** |
| P870 instrumentação | ❌ | registro de **obra** |

Escrever as três últimas teria produzido campos permanentemente vazios e a
impressão de que o acervo é pobre — quando o que estava errado era a pergunta.

### Por que a cidadania, e não o local de nascimento

O local é um **ponto** — Eisenach, Bonn —, e resolver cidade até país exigiria
uma consulta por cidade. A cidadania **já vem como Estado**.

Os dois entram no acervo: o local é conteúdo de ficha — "nasceu em Eisenach" é
o que se lê numa biografia —, e a cidadania alimenta o filtro.

### O Estado vem histórico, e isso não é erro

Bach é cidadão do **Sacro Império Romano-Germânico**; Mozart, do **Arcebispado
de Salzburgo**; Chopin, do **Congresso da Polônia**. Nenhum desses Estados
existe, e é correto que a fonte os declare: a pessoa viveu neles, e o mapa de
hoje é uma leitura posterior.

Mapear cada um explicitamente — **82 Estados para 8 regiões** — é mais
trabalhoso que olhar o país de hoje, e é a única forma de não escrever geografia
errada. O rótulo fica ao lado de cada Q-id porque um mapa de
`Q183: 'reg_europa_ocidental'` ninguém confere.

O **bruto vai para o seed** e o mapa fica em TypeScript: separar a Itália ou
desdobrar a Europa Oriental passa a ser uma linha, em vez de reextrair duzentos
e vinte compositores.

### P135 não foi importado cru

Debussy devolve "impressionismo na música", que é movimento. Bach devolve
"música barroca", que é **era**. Dos 22 valores distintos, a maioria é era
disfarçada — "música barroca" 28, "música clássica" 15, "era romântica" 15.

Gravar junto poria "Barroco" ao lado de "Impressionismo" no filtro de movimento:
o mesmo defeito que o campo de gênero carregou por vinte e cinco mil registros.

---

## 4e · 🔴 Três compositores tinham a ficha de outra pessoa

| Quem o acervo dizia ser | Quem a ficha descrevia |
|---|---|
| `John Adams`, compositor de 1947 | o **2º presidente dos Estados Unidos**, de 1735 |
| `Howard Hanson`, compositor | um **político de Minnesota** |
| `Engelbert Humperdinck`, de 1854 | o **cantor pop** dos anos 60 |

As três fichas estavam **completas** — biografia, retrato, identificadores
cruzados — e completamente erradas. É a pior falha possível num acervo: não é
dado faltando, que se vê, é dado errado com aparência de certo.

**A causa**: a extração pedia `limit=1` à busca e ficava com `search[0]`.

### O sinal que separa, e o que não separa

**A data sozinha não serve.** Onze registros divergem no ano de nascimento, e
**oito estão corretos**: Ockeghem é `1420` aqui e `1410` lá, Josquin `1450` e
`1455`. É datação de século XV, que a historiografia dá por aproximação.
Acusar os onze trataria incerteza histórica como defeito.

**A ocupação separa.** `P106` traz `Q36834` (compositor) nos oito legítimos e em
nenhum dos três errados.

A correção exige **as duas coisas** — ocupação e ano —, porque há compositores
homônimos de séculos diferentes. Candidato ambíguo **não entra**: dois que
passam nos dois testes devolvem nada, porque escolher um seria adivinhar.

Trocar só o Q-id seria pior que não trocar: a ficha ficaria com o identificador
de um e a biografia de outro, e agora sem o sinal que permitiu flagrá-la.

---

## 5 · O que é igualável, e o que não é

Cobertura **igual entre eras é impossível**: o Medieval tem menos obra
catalogada que o Romantismo porque sobreviveu menos, e não porque ninguém
procurou. Perseguir paridade de volume produziria preenchimento.

O que deve ficar parelho é a **qualidade do registro**:

| medida | onde está | |
| :--- | ---: | :--- |
| todo compositor com biografia | 89,6% | 104 sem, quase todos da fonte que não publica |
| todo registro com proveniência por campo | 100% | e ela diz **qual** das fontes, desde que passaram a ser quatro |
| toda ficha dizendo o que se pode fazer, e por quê | 100% | três estados: toca aqui · partitura achada · ainda procurando |
| toda era com o tipo de registro adequado | ✅ | a Antiguidade foi a última, e entrou como obra |

### 🔴 A distribuição por era não é meta, e é medida

```
Romantismo    10.389        Renascimento   2.255
Moderna        8.054        Classicismo    2.175
Barroco        5.086        Medieval         161
Contemporânea  2.537        Antiguidade        8
sem era        1.287
```

O Medieval tem 161 e o Romantismo 10.389 porque **sobreviveu menos**, e não
porque ninguém procurou. Perseguir paridade aqui produziria preenchimento — que
é a forma mais discreta de dado fabricado, porque cada linha inventada parece
uma linha a mais de trabalho feito.

As **1.287 sem era** são o único número desta lista que é dívida: são obras cuja
fonte não declarou época e cujo compositor não tem data que permita derivá-la.


Essa é a medida de completude do acervo — e não a contagem por era.
