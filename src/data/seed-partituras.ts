/**
 * AS PARTITURAS DO ACERVO.
 *
 * Vivem em `src/data/acervo/partituras.json` e chegam por importação dinâmica
 * — mil trezentas e quarenta e nove entradas dentro do módulo principal
 * pesariam no pacote de quem nunca abre o catálogo, e por isso elas viajam
 * num pedaço próprio, pedido só quando o acervo abre.
 *
 * O QUE CADA UMA TRAZ
 * -------------------
 * Título, compositor (ligado ao acervo quando a reconciliação fecha), meio,
 * era, **licença do arquivo** e as URLs de LilyPond, MIDI, PDF e prévia.
 *
 * A licença é do ARQUIVO, e é distinta do domínio público da obra. Há peças em
 * domínio público e há peças sob Creative Commons com exigência de atribuição
 * — e as duas obrigam a plataforma a coisas diferentes.
 */

export interface Partitura {
  id: string;
  /** título */ t: string;
  /** compositor do acervo, quando reconciliado */ c?: string;
  /** nome do compositor como a fonte escreve */ cn: string;
  /** meio: instrumento ou voz */ i: string;
  /** era do Atlas */ e?: string;
  /** estilo como a fonte o nomeia */ st?: string;
  /** licença do arquivo */ lic: string;
  /**
   * Quem transcreveu.
   *
   * Presente em mil trezentas e quarenta e oito das mil trezentas e quarenta e
   * nove, e **obrigatório** nas seiscentas e vinte e uma sob licença com
   * cláusula de atribuição: exibir o arquivo sem o nome é exibi-lo sem licença.
   * A geração do seed falha se alguma ficar sem.
   */
  ed?: string;
  /** número de catálogo: `BWV 846`, `D. 891` */ cat?: string;
  /** coletânea de onde a peça saiu — não é número de catálogo */ col?: string;
  /** data de composição, na precisão que a fonte tem: `1588`, `19th C.` */ dc?: string;
  /** fonte LilyPond */ ly: string;
  /** MIDI, quando há */ mid?: string;
  /** PDF */ pdf?: string;
  /** imagem de prévia */ img?: string;
  /** descrição da edição */ d?: string;
}

let carregadas: Partitura[] | null = null;

/**
 * 🔴 BUSCAR POR CAMINHO DEVOLVIA HTML, E NÃO PARTITURA.
 *
 * Era `fetch('/acervo/partituras.json')`. Quando o arquivo não estava no
 * servidor — e ele nunca foi versionado, então em toda construção feita a
 * partir do repositório ele não estava —, a resposta era o `index.html` da
 * aplicação com status 200, porque um aplicativo de página única responde
 * qualquer caminho desconhecido com a própria página. O `catch` engolia, a
 * seção ficava vazia, e nada explicava o porquê.
 *
 * Importado, o arquivo é resolvido pelo empacotador: ou a construção o
 * encontra, ou a construção falha — na máquina de quem publica, e não no
 * navegador de quem estuda.
 *
 * Falha aqui continua devolvendo lista vazia e NÃO derruba o catálogo: obras e
 * compositores seguem servindo, e perder a seção de partituras é menos grave
 * que a tela não abrir.
 */
export async function carregarPartituras(): Promise<Partitura[]> {
  if (carregadas) return carregadas;

  try {
    const modulo = await import('./acervo/partituras.json');
    carregadas = (modulo.default ?? modulo) as Partitura[];
    return carregadas;
  } catch {
    return [];
  }
}

/** Esquece o que foi carregado. Existe para o teste. */
export function limparCacheDePartituras(): void {
  carregadas = null;
}
