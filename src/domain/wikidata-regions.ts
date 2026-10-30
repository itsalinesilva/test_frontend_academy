/**
 * DE QUE ESTADO PARA QUE REGIÃO — o mapa que alimenta o filtro geográfico.
 *
 * O PROBLEMA QUE ELE RESOLVE
 * --------------------------
 * A região era o filtro mais indigno do acervo: **17 obras de 26.288** tinham
 * uma, e o recorte era oferecido assim mesmo. Quem clicava em "Europa
 * Ocidental (14)" concluía que eram essas as que existiam, quando eram essas
 * as que tinham o campo escrito.
 *
 * A diferença entre "não há" e "não apuramos" é invisível no resultado de um
 * filtro. É por isso que ela se resolve aqui, e não na tela.
 *
 * POR QUE A CIDADANIA, E NÃO O LOCAL DE NASCIMENTO
 * ------------------------------------------------
 * O local de nascimento é um ponto — Eisenach, Bonn —, e resolver cidade até
 * país exigiria uma consulta por cidade. A cidadania **já vem como Estado**.
 *
 * Os dois ficam no acervo: o local é conteúdo de ficha, e a cidadania é o que
 * alimenta o filtro.
 *
 * O ESTADO VEM HISTÓRICO, E ISSO NÃO É ERRO
 * -----------------------------------------
 * Bach é cidadão do Sacro Império Romano-Germânico; Mozart, do Arcebispado de
 * Salzburgo; Chopin, do Congresso da Polônia. Nenhum desses Estados existe, e
 * é correto que a fonte os declare: a pessoa viveu neles, e o mapa de hoje é
 * uma leitura posterior.
 *
 * Mapear cada um explicitamente é mais trabalhoso que olhar o país de hoje —
 * e é a única forma de não escrever geografia errada. O rótulo fica ao lado de
 * cada entrada porque um mapa de `Q183: 'reg_europa_ocidental'` ninguém confere.
 *
 * O QUE NÃO ESTÁ AQUI FICA SEM REGIÃO
 * -----------------------------------
 * Não há categoria "outros". Um compositor cujo Estado não está mapeado
 * simplesmente não participa deste recorte — e aparece em todos os demais.
 * Inventar uma gaveta para ele encheria o filtro de um rótulo que não
 * significa lugar nenhum.
 */

/**
 * As regiões, na granularidade do Atlas.
 *
 * Três foram acrescentadas porque o acervo as exigia: os Estados Unidos são o
 * **segundo maior grupo** de compositores depois da França, e não havia região
 * nas Américas além do Brasil. Forçá-los para a Europa seria o erro que o
 * comentário de `DEFAULT_REGIONS` já alertava — "geografia errada para caber
 * numa lista curta".
 */
export const REGIAO_DO_ESTADO: Record<string, string> = {
  /**
   * O valor é o **id** da região (`reg_...`), e não o slug.
   *
   * O resto do sistema guarda id em `regionIds` e resolve o rótulo por id. Sair
   * daqui com slug fazia a mesma região aparecer duas vezes na faceta —
   * "europa-ocidental" com 145 e "Europa Ocidental" com 11 —, porque o
   * repertório próprio já usava id e o externo passou a usar slug.
   */
  // ---------------------------------------------------------------- França
  Q142: 'reg_europa_ocidental', // França
  Q70972: 'reg_europa_ocidental', // Reino da França

  // ------------------------------------------- Terras germânicas e o Império
  Q183: 'reg_europa_ocidental', // Alemanha
  Q12548: 'reg_europa_ocidental', // Sacro Império Romano-Germânico
  Q153015: 'reg_europa_ocidental', // Reino da Saxônia
  Q156199: 'reg_europa_ocidental', // Eleitorado da Saxônia
  Q1055: 'reg_europa_ocidental', // Hamburgo
  Q696651: 'reg_europa_ocidental', // Ducado de Saxe-Eisenach
  Q7904317: 'reg_europa_ocidental', // Eleitorado de Colônia
  Q157367: 'reg_europa_ocidental', // Brandemburgo-Prússia
  Q27306: 'reg_europa_ocidental', // Reino da Prússia
  Q713750: 'reg_europa_ocidental', // Alemanha Ocidental
  Q1206012: 'reg_europa_ocidental', // Reich Alemão
  Q7318: 'reg_europa_ocidental', // Alemanha Nazi
  Q556263: 'reg_europa_ocidental', // Ducado de Brunsvique-Luneburgo
  Q326029: 'reg_europa_ocidental', // Ducado de Brunswick
  Q154195: 'reg_europa_ocidental', // Reino da Baviera
  Q527527: 'reg_europa_ocidental', // Principado-Bispado de Lübeck

  // ------------------------------------------------------ Áustria e o Danúbio
  Q40: 'reg_europa_ocidental', // Áustria
  Q131964: 'reg_europa_ocidental', // Império Austríaco
  Q28513: 'reg_europa_ocidental', // Áustria-Hungria
  Q699964: 'reg_europa_ocidental', // Arquiducado da Áustria
  Q701614: 'reg_europa_ocidental', // Arcebispado de Salzburgo
  Q533534: 'reg_europa_ocidental', // Cisleitânia

  // --------------------------------------------------------------- Britânicas
  Q145: 'reg_europa_ocidental', // Reino Unido
  Q179876: 'reg_europa_ocidental', // Reino da Inglaterra
  Q161885: 'reg_europa_ocidental', // Reino da Grã-Bretanha
  Q174193: 'reg_europa_ocidental', // Reino Unido da Grã-Bretanha e Irlanda
  Q27: 'reg_europa_ocidental', // Irlanda
  Q215530: 'reg_europa_ocidental', // Reino da Irlanda

  // ---------------------------------------------- Países Baixos, Bélgica, Suíça
  Q31: 'reg_europa_ocidental', // Bélgica
  Q39: 'reg_europa_ocidental', // Suíça
  Q1031430: 'reg_europa_ocidental', // Países Baixos Habsburgos
  Q157109: 'reg_europa_ocidental', // Países Baixos Burgúndios
  Q170072: 'reg_europa_ocidental', // Províncias Unidas dos Países Baixos
  Q15864: 'reg_europa_ocidental', // Reino Unido dos Países Baixos

  /**
   * A PENÍNSULA ITÁLICA FICA EM EUROPA OCIDENTAL.
   *
   * São trinta e seis compositores, e a separação seria defensável — muitos
   * catálogos a fazem. Ela não é feita aqui porque `DEFAULT_REGIONS` define
   * Europa Ocidental como incluindo a península itálica, e mudar isso é
   * decisão de curadoria, e não de quem está preenchendo o campo.
   */
  Q38: 'reg_europa_ocidental', // Itália
  Q172579: 'reg_europa_ocidental', // Reino da Itália
  Q4948: 'reg_europa_ocidental', // República de Veneza
  Q170174: 'reg_europa_ocidental', // Estados Papais
  Q154849: 'reg_europa_ocidental', // Grão-Ducado da Toscana
  Q173065: 'reg_europa_ocidental', // Reino de Nápoles
  Q3932079: 'reg_europa_ocidental', // Reino da Sicília
  Q1235720: 'reg_europa_ocidental', // República de Lucca
  Q209857: 'reg_europa_ocidental', // Reino Lombardo-Vêneto
  Q693570: 'reg_europa_ocidental', // Ducado de Ferrara
  Q174306: 'reg_europa_ocidental', // República de Gênova
  Q165040: 'reg_europa_ocidental', // Ducado de Parma e Piacenza

  // ----------------------------------------------------------- Europa Oriental
  Q34266: 'reg_europa_oriental', // Império Russo
  Q15180: 'reg_europa_oriental', // União Soviética
  Q159: 'reg_europa_oriental', // Rússia
  Q2305208: 'reg_europa_oriental', // Rússia bolchevique
  Q36: 'reg_europa_oriental', // Polônia
  Q152115: 'reg_europa_oriental', // Ducado de Varsóvia
  Q221457: 'reg_europa_oriental', // Congresso da Polônia
  Q207272: 'reg_europa_oriental', // Segunda República Polonesa
  Q28: 'reg_europa_oriental', // Hungria
  Q171150: 'reg_europa_oriental', // Reino da Hungria
  Q33946: 'reg_europa_oriental', // Checoslováquia
  Q42585: 'reg_europa_oriental', // Reino da Boêmia
  Q218: 'reg_europa_oriental', // Romênia
  Q191: 'reg_europa_oriental', // Estônia

  // ------------------------------------------------------------- Escandinávia
  Q756617: 'reg_escandinavia', // Reino da Dinamarca
  Q34: 'reg_escandinavia', // Suécia
  Q20: 'reg_escandinavia', // Noruega
  Q33: 'reg_escandinavia', // Finlândia
  Q62633: 'reg_escandinavia', // Grão-Ducado da Finlândia

  // --------------------------------------------------------- Península Ibérica
  Q29: 'reg_iberica', // Espanha
  Q3399982: 'reg_iberica', // Reino de Espanha
  Q45: 'reg_iberica', // Portugal

  // --------------------------------------------------------------------- Brasil
  Q155: 'reg_brasil', // Brasil

  // ------------------------------------------------------------ América do Norte
  Q30: 'reg_america_do_norte', // Estados Unidos
  Q179997: 'reg_america_do_norte', // Treze Colônias
  Q16: 'reg_america_do_norte', // Canadá

  // ------------------------------------------------------------- América Latina
  Q414: 'reg_america_latina', // Argentina
  Q96: 'reg_america_latina', // México
  Q241: 'reg_america_latina', // Cuba
  Q298: 'reg_america_latina', // Chile

  // ---------------------------------------------------------- Ásia e Oceania
  Q17: 'reg_asia_oceania', // Japão
  Q188712: 'reg_asia_oceania', // Império do Japão
  Q408: 'reg_asia_oceania', // Austrália
};

/**
 * As regiões de um compositor, a partir das cidadanias que a fonte declara.
 *
 * Devolve **todas** as distintas, e não a primeira: quem foi cidadão do
 * Império Austríaco e depois da Áustria aparece uma vez só, porque as duas
 * caem na mesma região; quem se naturalizou noutro continente aparece nas
 * duas, e é o correto — Stravinsky é russo **e** americano, e recortá-lo só
 * como russo apagaria metade da obra dele.
 *
 * A ordem é a da fonte, que lista a cidadania de origem primeiro. Isso importa
 * porque a obra herda a PRIMEIRA região do compositor.
 */
export function regioesDasCidadanias(cidadanias: string[]): string[] {
  const vistas: string[] = [];
  for (const q of cidadanias) {
    const r = REGIAO_DO_ESTADO[q];
    if (r && !vistas.includes(r)) vistas.push(r);
  }
  return vistas;
}

/** Os Estados que a fonte declarou e este mapa não conhece. Para auditoria. */
export function estadosNaoMapeados(cidadanias: string[]): string[] {
  return cidadanias.filter((q) => !REGIAO_DO_ESTADO[q]);
}
