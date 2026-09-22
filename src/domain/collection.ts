import { KnowledgeSource } from './music-knowledge';

/** O identificador de uma entidade do catálogo, como em `music-knowledge`. */
type EntityId = string;

/**
 * A COLETÂNEA — e por que ela é entidade, e não etiqueta.
 *
 * 🔴 O ERRO QUE ESTA ENTIDADE EVITA
 * ---------------------------------
 * A tentação é guardar "Machiette, 12 piccoli pezzi" como um campo de texto na
 * obra, ou como mais uma etiqueta. As duas formas perdem a mesma coisa: a
 * coletânea **tem ordem**, e a ordem é conteúdo. `Valsa Op. 2 nº 3` é a
 * terceira peça de um livro, e não uma valsa solta de Henrique Oswald.
 *
 * Perder a ordem custa o que o livro ensinava: a Machiette é uma progressão, e
 * tocar a nona antes da segunda é ignorar a decisão de quem a publicou.
 *
 * A CADEIA, E ONDE A COLETÂNEA ENTRA NELA
 * ---------------------------------------
 *
 *     Compositor → Coletânea → Obra → Edição → Partitura
 *
 * A coletânea fica **entre** a pessoa e a obra, e não no lugar de nenhuma das
 * duas. Ela não é obra: não se toca uma coletânea, tocam-se as peças dela. E
 * não é edição: a mesma coletânea pode ter várias.
 *
 * COLETÂNEA NÃO É CURADORIA, e a distinção decide o rótulo
 * --------------------------------------------------------
 * Uma **curadoria** é uma lista que alguém montou agora: "os mais buscados",
 * "os recomendados". Uma **coletânea** foi publicada assim, por alguém, num
 * ano — ela é fonte primária de como aquele repertório circulava.
 *
 * A *Coleção de modinhas* que Pierre Laforge editou em 1842 diz o que se
 * cantava no Rio de Janeiro daquele ano. Nenhuma lista de recomendação diz
 * isso, por melhor que seja.
 *
 * Por isso a coletânea entra no acervo **como objeto**, com organizador e
 * data, e a curadoria entra como recorte que nomeia a fonte.
 */
export interface Coletanea {
  id: EntityId;
  titulo: string;
  /**
   * Quem assina a coletânea.
   *
   * `undefined` quando ela é anônima ou de autoria coletiva — a *Coleção de
   * modinhas* reúne dezessete nomes e mais anônimos, e forçar um autor ali
   * seria inventar. Nesse caso `organizador` carrega quem a editou, que é
   * outra coisa e é o que se sabe.
   */
  composerId?: EntityId;
  /**
   * Quem EDITOU ou COMPILOU, quando é diferente de quem compôs.
   *
   * Pierre Laforge editou; Mário de Andrade compilou; Spix e von Martius
   * coletaram em viagem. Nenhum dos três compôs uma nota, e os três são a
   * razão de a coletânea existir.
   */
  organizador?: string;
  /** Ano da publicação, na precisão que se tem. */
  ano?: string;
  /** Para que instrumento ou formação o volume foi publicado. */
  formacao?: string;
  /**
   * As peças, **na ordem do volume**.
   *
   * Vazio quando a coletânea está catalogada e as peças ainda não foram
   * casadas uma a uma. Vazio aqui significa "ainda não apurado", e não "não
   * tem peça" — e é por isso que a tela precisa dizer qual dos dois é.
   */
  pecas: PecaDaColetanea[];
  fonte: KnowledgeSource;
  /** A página da coletânea na fonte, que é onde as edições estão. */
  url?: string;
}

export interface PecaDaColetanea {
  /** Posição no volume, a partir de 1. É o que a coletânea tem de próprio. */
  numero: number;
  /** O título como o volume o escreve. */
  titulo: string;
  /**
   * A obra do catálogo, quando ela foi casada.
   *
   * 🔴 A peça NÃO CRIA obra. Se o casamento não fechou, `obraId` fica ausente
   * e a peça continua listada com o título que o volume lhe dá — que é o que a
   * fonte afirma. Criar obra a partir de um índice de livro repetiria o erro
   * das mil trezentas e trinta e uma partituras que viraram obras falsas.
   */
  obraId?: EntityId;
  /**
   * Quem assina a peça, quando é diferente de quem assina o volume.
   *
   * A *Coleção de modinhas* tem dezessete assinaturas em vinte e poucas peças;
   * a *Machiette* tem uma só. Sem este campo, as duas seriam catalogadas do
   * mesmo jeito, e a primeira perderia toda a autoria.
   */
  autoria?: string;
}

/** Quantas peças da coletânea acharam obra no catálogo. */
export function pecasCasadas(c: Coletanea): number {
  return c.pecas.filter((p) => p.obraId).length;
}

/**
 * A coletânea está completamente catalogada?
 *
 * Três estados, e a tela precisa distinguir os três: **inteira** (toda peça
 * achou obra), **parcial** (algumas acharam) e **só a ficha** (nenhuma peça
 * foi catalogada ainda).
 *
 * O terceiro não é defeito: é o estado normal de uma coletânea recém-lida, e
 * confundi-lo com "coletânea vazia" faria a tela declarar ausência onde há
 * trabalho por fazer.
 */
export function estadoDaColetanea(c: Coletanea): 'INTEIRA' | 'PARCIAL' | 'SO_FICHA' {
  if (c.pecas.length === 0) return 'SO_FICHA';
  const casadas = pecasCasadas(c);
  if (casadas === c.pecas.length) return 'INTEIRA';
  return casadas === 0 ? 'SO_FICHA' : 'PARCIAL';
}

/**
 * As peças estão numeradas em sequência, sem buraco nem repetição?
 *
 * Uma coletânea que pula do 3 para o 5 perdeu uma peça na leitura, e o defeito
 * não aparece em lugar nenhum: a lista parece completa porque tem títulos.
 */
export function numeracaoQuebrada(c: Coletanea): boolean {
  const numeros = c.pecas.map((p) => p.numero);
  return numeros.some((n, i) => n !== i + 1);
}
