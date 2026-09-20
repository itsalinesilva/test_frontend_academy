# 87 — A ONTOLOGIA DO CATÁLOGO

> O Conservatório não tem "um catálogo de compositores". Tem um **grafo musical
> relacional**, em que Wikidata e Open Opus são camada de descoberta e
> identificação — e **não** o modelo de domínio.

---

## O erro que este documento corrige

O catálogo estava modelado como

```
obra → campos → filtros
```

e a energia ia toda para a última seta: mais facetas, mais cobertura de campo.
A pergunta que se estava respondendo era *"quantos campos consigo filtrar?"*.

A pergunta anterior, que não estava respondida, é:

> **quais entidades existem, e por quais delas se chega ao acervo?**

O modelo correto é

```
pessoas → papéis → obras → edições → partituras → instrumentos/vozes
        → gêneros → períodos → eventos → relações
```

e **todas essas entidades são pesquisáveis**.

---

## 1 · A ausência de uma entidade força a duplicata

Esta é a lição central, e ela custou caro.

`Partitura` não existia como entidade — era um objeto de valor dentro da obra
(`ExternalScoreRef`). Logo, a única forma de um arquivo entrar no acervo era
**sendo uma obra**.

Resultado: **1.331 obras falsas**. Ninguém decidiu isso. O modelo não oferecia
outro lugar onde aquele dado coubesse.

Por isso a ontologia vem **antes** da ingestão, e não depois. Ingerir
KernScores ou Música Brasilis sobre um modelo inadequado multiplicaria o
problema por dez.

---

## 2 · Uma pessoa não é o seu papel

O tipo se chamava `CanonicalComposer`. O nome parece descrição e é **regra**: a
única forma de existir no acervo era tendo composto.

- Um violinista que nunca escreveu uma nota não tinha onde existir.
- Um barítono virava "um compositor que tem uma voz".
- O instrumento que a pessoa tocava foi parar dentro do registro de compositor,
  como `instrumentosPraticados?: string[]`.

Bach é compositor, organista e cravista. Liszt é compositor, pianista e
professor. Clara Schumann é pianista **e** compositora, e a ordem importa para
a biografia dela.

`Pessoa` tem `atuacoes: AtuacaoMusical[]`, e cada atuação liga **papel** +
(**instrumento** ou **voz**), conforme o papel exija.

| Pergunta | Como o grafo responde |
|---|---|
| quem tocava violino | atuação com papel instrumentista e `inst_violino` |
| quais barítonos há | atuação com papel cantor e voz `BARITONO` |
| quem ensinou Liszt | relação `PROFESSOR_DE` |

A segunda era **impossível** antes: não havia onde guardar tessitura de pessoa.

---

## 3 · Os três níveis de recurso

```
OBRA        a peça musical. A Sonata K. 545 é uma só.
  │
  ├── EDIÇÃO      uma realização editorial: quem revisou, quando, com que
  │   │           critério. Henle e Peters da mesma sonata são duas edições,
  │   │           com direito autoral próprio.
  │   │
  │   └── PARTITURA   um arquivo daquela edição: PDF, MusicXML, Humdrum,
  │                   LilyPond, MIDI. Representações do MESMO texto musical.
  │
  └── GRAVAÇÃO    uma execução registrada.
```

Colapsar os níveis parece economia e não é:

- **sem EDIÇÃO**, a licença do arquivo fica pendurada na obra — e obra em
  domínio público com edição sob Creative Commons passa a parecer livre;
- **sem PARTITURA como entidade**, os quatro formatos do mesmo texto viram
  quatro registros que ninguém sabe que são o mesmo.

### Simbólico não é o mesmo que renderizável

`MUSICXML`, `HUMDRUM`, `LILYPOND` e `MIDI` são **simbólicos**: deles se extrai
altura, duração e compasso. `PDF` e `IMAGEM` são páginas.

Mas um `.ly` simbólico com a plataforma sem leitor de LilyPond é
`SOMENTE_REFERENCIA`. Misturar as duas coisas produziria um botão de tocar que
abre nada — o defeito que este projeto passou meses removendo.

---

## 4 · 🔴 Fonte externa enriquece. Não cria.

Quando uma fonte traz um recurso cuja obra o catálogo não reconhece, há três
saídas, e **duas são ruins**:

| Saída | O que acontece |
|---|---|
| descartar | perde-se um recurso real, e ninguém fica sabendo |
| criar uma obra | o catálogo ganha duplicata com aparência de registro |
| **enfileirar** | o recurso existe, aparece, e não mente sobre o que é |

`RegistroPendente` é a terceira. Um item na fila **aparece no acervo** (seção
"A resolver"), com o nome que a fonte deu e o motivo por extenso, e **não conta
como obra em nenhuma contagem**.

Esconder a fila seria a outra forma do mesmo erro: **pendência invisível é
descarte disfarçado.**

`checkFonteNaoCriaEntidade` bloqueia o build e vigia as quatro pontas: a fila
existe no domínio, a ligação não escreve obra com id de partitura, a ligação
enfileira o que não casou, e a tela mostra.

---

## 5 · Wikidata é fonte, não modelo

O catálogo chegou a raciocinar em termos de `P19`, `P27`, `P1303` — propriedades
do Wikidata — em vez de em termos do domínio do Conservatório.

A fonte alimenta; o modelo é nosso. Concretamente:

- a **cidadania** (P27) entra como Q-id bruto no seed, e `wikidata-regions.ts`
  decide a região — mudar o mapa não exige reextrair nada;
- a **grafia de instrumento** de cada fonte passa por `resolverInstrumento`,
  que devolve o termo do **nosso** vocabulário ou `undefined`, e nunca cria um
  termo novo;
- `P412` (tessitura) não existe em compositor porque é propriedade de *cantor* —
  e a tessitura, no nosso modelo, é atributo de uma **atuação**, não de pessoa.

Vocabulário que cresce sozinho deixa de ser vocabulário: em um mês há `Violin`,
`violin` e `Violino` como três instrumentos, e o filtro de cordas perde dois
terços do que deveria achar.

---

## 6 · A busca entra por qualquer porta

A busca não é uma coleção de filtros sobre obras. Toda entidade se reduz a
`EntidadeIndexada` — id, tipo, rótulo, linha de apoio, **termos** —, e a busca
casa termos e agrupa por tipo.

| Digitando | O catálogo devolve |
|---|---|
| `Mozart` | a **pessoa**, e com ela obras, partituras e gravações |
| `barítono` | a **voz**, e as pessoas com essa tessitura |
| `violino` | o **instrumento**, violinistas, obras e partituras para violino |
| `concerto para violino` | **obras** |
| `BWV 1041` | a **obra**, direto |

Os vocabulários entram no índice como entidades. Deixá-los fora obrigaria quem
procura a **já saber em qual filtro o termo mora** — que é justamente o que
ninguém sabe.

Nome alternativo é pesquisável: quem procura `Fryderyk Szopen` e quem procura
`Chopin` procuram a mesma pessoa.

---

## 7 · As fases, e onde estamos

| | Fase | Estado |
|---|---|---|
| 1 | **Catálogo** — Person, Role, Instrument, Voice, Work, Movement, Edition, Score, Recording, Event, Source | ✅ ontologia escrita e testada |
| 2 | **Busca** — universal, por qualquer entidade | ✅ domínio pronto · ⬜ na tela |
| 3 | **Resolução** — id canônico interno, sem duplicatas | ⬜ migração dos 24.957 registros |
| 4 | **Cobertura** — ingestão seletiva para preencher lacunas | ⛔ **congelada até a fase 3** |
| 5 | **Motor** — representação canônica, MIDI/MusicXML, prática | ⬜ |

**A fase 4 está congelada de propósito.** KernScores, Música Brasilis e IMSLP
não aumentam o universo de obras — eles **preenchem recursos de obras que já
temos**. Ingeri-los antes da fase 3 importaria milhares de recursos para um
modelo que ainda não sabe onde pô-los, que é exatamente como nasceram as 1.331
duplicatas.
