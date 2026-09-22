import { Coletanea } from '../domain/collection';

/**
 * AS VINTE COLETÂNEAS DO CORPUS BRASILEIRO.
 *
 * Lidas da catalogação brasileira, que as mantém como objetos próprios — e não
 * como etiqueta de obra. Cada uma é um **livro que existiu**, com organizador
 * e, quando se sabe, ano.
 *
 * O QUE ESTÁ CASADO, E O QUE NÃO ESTÁ
 * -----------------------------------
 * Cinco delas têm o índice inteiro casado peça a peça contra o catálogo —
 * quarenta e uma peças, todas com obra e partitura. As outras quinze estão
 * catalogadas pela ficha, e as peças ainda não foram casadas uma a uma.
 *
 * 🔴 A diferença entre as duas situações **tem de aparecer**. Uma coletânea
 * sem peças listadas não é uma coletânea vazia: é uma que ninguém abriu ainda.
 * `estadoDaColetanea` existe para a tela não confundir as duas, porque as duas
 * desenham igual — uma lista sem itens.
 *
 * E NENHUMA PEÇA CRIA OBRA
 * ------------------------
 * Quando o casamento não fecha, a peça fica com o título que o volume lhe dá e
 * **sem** `obraId`. Criar obra a partir de um índice de livro é exatamente
 * como as mil trezentas e trinta e uma obras falsas entraram no catálogo.
 */
export const COLETANEAS_BRASILEIRAS: Coletanea[] = [
  {
    id: 'col_gallet_12_exercicios',
    titulo: '12 Exercícios Brasileiros',
    composerId: 'mb-luciano-gallet',
    formacao: 'piano a quatro mãos',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/luciano-gallet-12-exerc%C3%ADcios-brasileiros/',
    pecas: [
      { numero: 1, titulo: 'Valsa sestrosa', obraId: 'mb-obra-107654' },
      { numero: 2, titulo: 'Puladinho 1º', obraId: 'mb-obra-107653' },
      { numero: 3, titulo: 'Dobrado', obraId: 'mb-obra-107652' },
      { numero: 4, titulo: 'Chorinho', obraId: 'mb-obra-107651' },
      { numero: 5, titulo: 'Modinha', obraId: 'mb-obra-107650' },
      { numero: 6, titulo: 'Tanguinho', obraId: 'mb-obra-107649' },
      { numero: 7, titulo: 'Schottisch brasileira', obraId: 'mb-obra-107648' },
      { numero: 8, titulo: 'Seresta', obraId: 'mb-obra-107647' },
      { numero: 9, titulo: 'Maxixe', obraId: 'mb-obra-107646' },
      { numero: 10, titulo: 'Polca sertaneja', obraId: 'mb-obra-107645' },
      { numero: 11, titulo: 'Puladinho 2º', obraId: 'mb-obra-107644' },
      { numero: 12, titulo: 'Batuque', obraId: 'mb-obra-107643' },
    ],
  },
  {
    id: 'col_alvares_pinto_7_motetos',
    titulo: '7 Motetos para os Sermões da Quaresma',
    composerId: 'mb-luis-alvares-pinto',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/lu%C3%ADs-%C3%A1lvares-pinto-7-motetos-para-os-serm%C3%B5es-da-quaresma/',
    pecas: [
      { numero: 1, titulo: 'Adoramus te Christe (Moteto nº 5)', obraId: 'mb-obra-106947' },
      { numero: 2, titulo: 'Antífonas para o Domingo de Ramos', obraId: 'mb-obra-113508' },
      { numero: 3, titulo: 'Attendite (Moteto nº 2)', obraId: 'mb-obra-106950' },
      { numero: 4, titulo: 'Bajulans (Moteto nº 4)', obraId: 'mb-obra-106948' },
      { numero: 5, titulo: 'Divertimentos Harmônicos', obraId: 'mb-obra-112143' },
      { numero: 6, titulo: 'Dominus Jesus', obraId: 'mb-obra-106672' },
      { numero: 7, titulo: 'Gradual Hoc Dies', obraId: 'mb-obra-113510' },
    ],
  },
  {
    id: 'col_barrozo_netto_7_pecas',
    titulo: '7 Peças Características',
    composerId: 'mb-barrozo-netto',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/barrozo-netto-7-pe%C3%A7as-caracter%C3%ADsticas/',
    pecas: [
      { numero: 1, titulo: 'Bailado das borboletas', obraId: 'mb-obra-108544' },
      { numero: 2, titulo: 'Dança dos gnomos', obraId: 'mb-obra-108543' },
      { numero: 3, titulo: 'Flor em botão', obraId: 'mb-obra-108542' },
      { numero: 4, titulo: 'Harmonia das sombras', obraId: 'mb-obra-108541' },
      { numero: 5, titulo: 'Marcha dos elefantes', obraId: 'mb-obra-108539' },
      { numero: 6, titulo: 'Pizzicato', obraId: 'mb-obra-108540' },
      { numero: 7, titulo: 'Ponteio', obraId: 'mb-obra-108538' },
    ],
  },
  {
    id: 'col_oswald_machiette',
    titulo: 'Machiette — 12 piccoli pezzi per pianoforte',
    composerId: 'mb-henrique-oswald',
    formacao: 'piano',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/henrique-oswald-machiette-12-piccoli-pezzi-per-pianoforte/',
    pecas: [
      { numero: 1, titulo: 'Le campane della sera, op. 2 nº 1', obraId: 'mb-obra-113683' },
      { numero: 2, titulo: 'Scherzo, op. 2 nº 2', obraId: 'mb-obra-113186' },
      { numero: 3, titulo: 'Valsa, op. 2 nº 3', obraId: 'mb-obra-113685' },
      { numero: 4, titulo: 'Canzoneta, op. 2 nº 4', obraId: 'mb-obra-113686' },
      { numero: 5, titulo: 'Ninna-nanna, op. 2 nº 5', obraId: 'mb-obra-113687' },
      { numero: 6, titulo: 'Marcha, op. 2 nº 6', obraId: 'mb-obra-113688' },
      { numero: 7, titulo: 'Romanza, op. 2 nº 7', obraId: 'mb-obra-113668' },
      { numero: 8, titulo: '2ª Gavotta, op. 2 nº 8', obraId: 'mb-obra-113690' },
      { numero: 9, titulo: 'Pastorale, op. 2 nº 9', obraId: 'mb-obra-113691' },
      { numero: 10, titulo: 'Minueto, op. 2 nº 10', obraId: 'mb-obra-113692' },
      { numero: 11, titulo: 'Sarabanda, op. 2 nº 11', obraId: 'mb-obra-113693' },
      { numero: 12, titulo: 'La caccia, op. 2 nº 12', obraId: 'mb-obra-113694' },
    ],
  },
  {
    id: 'col_nepomuceno_quartetos',
    titulo: 'Quartetos',
    composerId: 'mb-alberto-nepomuceno',
    formacao: 'quarteto de cordas',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/alberto-nepomuceno-quartetos/',
    pecas: [
      { numero: 1, titulo: 'Quarteto nº 1 em si menor (1890)', obraId: 'mb-obra-111297' },
      { numero: 2, titulo: 'Quarteto nº 2 em mi bemol maior (1890)', obraId: 'mb-obra-111296' },
      { numero: 3, titulo: 'Quarteto nº 3 em ré menor (1891)', obraId: 'mb-obra-111295' },
    ],
  },

  /**
   * DAQUI PARA BAIXO, SÓ A FICHA.
   *
   * Estão catalogadas e as peças ainda não foram casadas uma a uma. A lista
   * vazia é declarada: `estadoDaColetanea` devolve `SO_FICHA`, e a tela diz
   * que o índice não foi aberto — em vez de desenhar uma coletânea sem peças,
   * que quem lê interpretaria como coletânea vazia.
   */
  {
    id: 'col_miguez_12_pecas',
    titulo: '12 Peças Características',
    composerId: 'mb-leopoldo-miguez',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/leopoldo-miguez-12-pe%C3%A7as-caracter%C3%ADsticas/',
    pecas: [],
  },
  {
    id: 'col_oswald_6_pecas_op14',
    titulo: '6 Peças para piano, op. 14',
    composerId: 'mb-henrique-oswald',
    formacao: 'piano',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/henrique-oswald-6-pe%C3%A7as-para-piano-op-14/',
    pecas: [],
  },
  {
    /**
     * Sem `composerId`, e de propósito: a fonte a atribui a "Anônimo, coleção
     * Canções Populares do Brasil". Escolher um autor aqui seria inventar.
     */
    id: 'col_cancoes_populares_brasil',
    titulo: 'Canções Populares do Brasil',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/can%C3%A7%C3%B5es-populares-do-brasil/',
    pecas: [],
  },
  {
    /**
     * Dezessete assinaturas e mais anônimos num volume só. É o caso que fez
     * `autoria` existir na peça: sem ele, a coletânea inteira seria catalogada
     * como de um autor — ou de nenhum —, e as dezessete se perderiam.
     */
    id: 'col_modinhas_laforge_1842',
    titulo: 'Coleção de modinhas',
    organizador: 'Pierre Laforge',
    ano: '1842',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/cole%C3%A7%C3%A3o-de-modinhas-ed-pierre-laforge-1842/',
    pecas: [],
  },
  {
    id: 'col_zapata_nuits_bresiliennes',
    titulo: 'Les Nuits Brésiliennes — 30 canções com piano',
    composerId: 'mb-jose-zapata-y-amat',
    formacao: 'canto e piano',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/jos%C3%A9-zapata-y-amat-les-nuits-br%C3%A9siliennes-30-can%C3%A7%C3%B5es-com-piano/',
    pecas: [],
  },
  {
    id: 'col_mauricinas',
    titulo: 'Mauricinas — coleção de canções e valsas',
    composerId: 'mb-jose-mauricio-nunes-garcia-junior',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/mauricinas-cole%C3%A7%C3%A3o-de-can%C3%A7%C3%B5es-e-valsas/',
    pecas: [],
  },
  {
    /**
     * Dois naturalistas alemães anotaram estas melodias enquanto atravessavam
     * o país, entre 1817 e 1820. Não compuseram nada, e são a razão de o
     * volume existir — daí `organizador` e não `composerId`.
     */
    id: 'col_modinhas_spix_martius',
    titulo: 'Modinhas coletadas por Spix e von Martius',
    organizador: 'Johann Baptist von Spix e Carl Friedrich Philipp von Martius',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/modinhas-coletadas-por-spix-e-von-martius/',
    pecas: [],
  },
  {
    id: 'col_modinhas_bom_gosto',
    titulo: 'Modinhas de bom gosto',
    composerId: 'mb-joao-francisco-leal',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/jo%C3%A3o-francisco-leal-modinhas-de-bom-gosto/',
    pecas: [],
  },
  {
    id: 'col_modinhas_imperiais',
    titulo: 'Modinhas Imperiais',
    organizador: 'Mário de Andrade',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/modinhas-imperiais-compiladas-por-m%C3%A1rio-de-andrade/',
    pecas: [],
  },
  {
    /**
     * Um MÉTODO, e não uma antologia — e entra aqui assim mesmo, porque a
     * estrutura é a mesma: um volume publicado, com ordem interna. O que muda
     * é a intenção de quem o escreveu, e isso a ficha diz.
     */
    id: 'col_metodo_pianoforte',
    titulo: 'Método de Pianoforte',
    composerId: 'mb-jose-mauricio-nunes-garcia',
    formacao: 'piano',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/m%C3%A9todo-de-pianoforte/',
    pecas: [],
  },
  {
    id: 'col_oswald_pagine_album',
    titulo: "Pagine d'Album — 6 piccoli pezzi",
    composerId: 'mb-henrique-oswald',
    formacao: 'piano',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/henrique-oswald-pagine-dalbum-6-piccoli-pezzi/',
    pecas: [],
  },
  {
    id: 'col_oswald_six_morceaux',
    titulo: 'Six morceaux, op. 4',
    composerId: 'mb-henrique-oswald',
    formacao: 'piano',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/henrique-oswald-six-morceaux-op-4/',
    pecas: [],
  },
  {
    id: 'col_velloso_guerra_com_as_criancas',
    titulo: 'Série "Com as crianças"',
    composerId: 'mb-nininha-velloso-guerra',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/nininha-velloso-guerra-s%C3%A9rie-com-as-crian%C3%A7as/',
    pecas: [],
  },
  {
    id: 'col_oswald_trois_morceaux',
    titulo: 'Trois morceaux, op. 23',
    composerId: 'mb-henrique-oswald',
    formacao: 'piano',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/henrique-oswald-trois-morceaux-op-23/',
    pecas: [],
  },
  {
    id: 'col_oswald_album_op36',
    titulo: 'Álbum, op. 36',
    composerId: 'mb-henrique-oswald',
    formacao: 'piano',
    fonte: 'MUSICA_BRASILIS',
    url: 'https://musicabrasilis.org.br/pt-br/coletaneas/henrique-oswald-%C3%A1lbum-op-36/',
    pecas: [],
  },
];
