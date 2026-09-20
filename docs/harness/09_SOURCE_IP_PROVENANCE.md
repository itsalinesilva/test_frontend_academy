# 09 — SOURCE / IP / PROVENANCE

## Princípio
Fonte e expressão são objetos diferentes. O conteúdo pedagógico da plataforma é uma expressão autoral construída a partir de referências autorizadas; não copiar textos, ilustrações, exercícios protegidos ou gravações sem licença.

## Knowledge record
`source_id, title, author, publisher, edition, year, ISBN/identifier, license, rights_scope, page_or_section, access_date, notes, allowed_use`.

## Referências iniciais do projeto
Bohumil Med: teoria e exercícios; Donald J. Grout/Palisca: história da música ocidental; materiais da University of Edinburgh fornecidos; materiais Berklee fornecidos; Suzuki, Hans Sitt, Maia Bang e outras escolas/métodos quando licenciados ou adequadamente referenciados; MusicBrainz/Open Opus e APIs/bases conforme licenças; partituras públicas via fontes permitidas como IMSLP e conteúdo licenciado do ecossistema MuseScore.

## Provenance graph
Source → claim/concept → authored lesson → activity → assessment → credential. O usuário deve conseguir consultar a bibliografia pertinente quando o produto assim determinar.

## License register
Toda biblioteca, API, fonte musical, dataset, fonte tipográfica, modelo e engine deve possuir registro de licença, versão e uso permitido antes de integração comercial.

---

## 🔴 A distinção que faltava — corrigido em 19/09

Este documento tratava **fonte de estudo** e **fonte de acervo** como a mesma
coisa, e `verify-no-citations.mjs` herdou a confusão: proibia `IMSLP`,
`Petrucci`, `Mutopia`, `Música Brasilis` e `MuseScore` junto com os livros de
referência.

Isso tornava impossível a coisa mais básica de um catálogo — dizer onde a obra
está —, e no caso do Mutopia **quebrava a própria licença**, que exige
atribuição por peça.

| | O que é | Aparece na plataforma? |
| :--- | :--- | :--- |
| **Fonte de estudo** | livros, cursos e instituições de onde o conteúdo pedagógico foi escrito | **Nunca.** O conteúdo é transmitido na forma autoral que demos a ele |
| **Fonte de acervo** | de onde vêm compositores, biografias, obras, partituras e imagens do catálogo | **Sim, e é obrigatório.** Atribuição por item, com link oficial |

### O que isso muda no produto

O acervo mostra **tudo** o que é possível mostrar — e grande parte é domínio
público. Onde um item específico não pode ser reproduzido aqui dentro, a ficha
diz o motivo e **aponta a fonte oficial** para quem quiser se informar mais.

A frase deste documento que dizia *"o usuário deve conseguir consultar a
bibliografia pertinente quando o produto assim determinar"* vale para a
**fonte de acervo**, e não para a bibliografia do estudo interno.

### Fontes de acervo em uso

Wikidata (eixo de reconciliação) · MusicBrainz · Wikimedia Commons · Internet
Archive · Open Opus · Mutopia (partitura) · IMSLP e Música Brasilis
(catalogação; os arquivos deles não são buscados, por `robots.txt`).
