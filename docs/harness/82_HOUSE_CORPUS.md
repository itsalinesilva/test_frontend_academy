# 82 — CORPUS DAS CASAS

Registro **editorial** da proveniência de cada Casa. Não é empacotado, não vai
ao navegador, e nenhum título ou autor daqui aparece na plataforma.

## Por que este arquivo existe

A proveniência vivia em `src/data/seed-houses.ts`, como dado de produto. Ia ao
ar dentro do `dist/`: título, autor, volume e caminho de arquivo de quatro
métodos protegidos. Duas regras quebradas de uma vez — a plataforma transmite
conteúdo autoral e não cita a bibliografia do estudo interno, e proveniência de
corpus é trabalho editorial, que pela separação das três categorias de
armazenamento nunca chega ao cliente.

O que o produto guarda agora é só a contagem: quantas obras compõem o corpus
previsto, e quantas já foram processadas. É o que a tela precisa para dizer se
a Casa está pronta, e nada além disso.

## Casa dos Violinistas — `casa-violino`

| Papel | Volumes | Situação |
| :--- | :---: | :--- |
| Repertório | 3 | não ingerido |
| Técnica | 2 | não ingerido |

Os títulos, autores e caminhos de arquivo ficam no acervo editorial, fora do
repositório. Quem for fazer a ingestão consulta ali.

## Cadeira que alimenta cada Casa

A Casa só ganha modo Casa quando tem **cadeira e corpus**. Hoje:

| Casa | Cadeira | Corpus | Modo Casa |
| :--- | :--- | :---: | :---: |
| Violinistas | Violino | 4 obras | ao ingerir |
| Historiadores da música | História | — | não |
| Teóricos | Teoria | — | não |
| Pianistas · Cantores · Violonistas · Compositores | — | — | não |

As quatro sem cadeira aguardam curso que chegue ao Laboratório. É o campo
`cadeiraId`, ausente de propósito, que liga uma coisa à outra quando o curso
existir.

## As demais Casas

Historiadores da música, Teóricos, Pianistas, Cantores, Violonistas e
Compositores estão declaradas sem corpus. Uma Casa `ANNOUNCED` aparece na
lista, fechada, com o motivo escrito — e **nunca** é preenchida com conteúdo
inventado para a tela não parecer vazia.
