/**
 * O PRAZO DE PROTEÇÃO — quando conta da MORTE, quando conta da PUBLICAÇÃO.
 *
 * 🔴 POR QUE ESTE ARQUIVO EXISTE
 * -----------------------------
 * A pergunta "o prazo conta da morte ou da publicação?" apareceu três vezes
 * nesta sessão, e a resposta é **as duas**, conforme a natureza da obra. Tratar
 * como se fosse uma regra só produz os dois erros possíveis:
 *
 *   contar sempre da morte    → obra anônima do século XVIII fica
 *                               indeterminada para sempre, porque nunca vai
 *                               haver data de morte. O acervo esconde o que
 *                               é livre.
 *   contar sempre da publicação → obra de autor conhecido morto há pouco sai
 *                               como livre. O acervo **declara liberado o que
 *                               está protegido**, e esse é o erro caro.
 *
 * O QUE A LEI 9.610/98 DIZ, POR REGIME
 * ------------------------------------
 *
 * | regime | marco | artigo |
 * | :--- | :--- | :--- |
 * | obra de autor conhecido | **morte do autor** + 70 | art. 41 |
 * | obra em coautoria indivisível | morte do **último** coautor + 70 | art. 42 |
 * | obra anônima ou pseudônima | **primeira publicação** + 70 | art. 43 |
 * | obra audiovisual ou fotográfica | **divulgação** + 70 | art. 44 |
 * | obra de autor morto sem sucessor | domínio público | art. 45, I |
 * | obra de autor desconhecido | domínio público, ressalvado o folclore | art. 45, II |
 *
 * Em todos os casos o prazo corre **a partir de 1º de janeiro do ano seguinte**
 * ao marco — por isso o `+ 71` em vez de `+ 70` nas contas de ano. Uma obra
 * cujo autor morreu em 1955 entra em domínio público em **1º/1/2026**, e não
 * em 2025.
 *
 * O QUE ISTO NÃO DECIDE
 * ---------------------
 * Só decide se a plataforma pode **reproduzir**. Não decide se a obra aparece
 * no catálogo, se a ficha diz de quem é, se há biografia, ou se o acervo
 * aponta para onde a partitura está publicada. Fato não se protege, e obra
 * protegida é registrada como qualquer outra.
 *
 * E não decide nada sobre o **arquivo**. A edição de uma obra em domínio
 * público tem direito próprio: quem transcreveu fez trabalho. As duas coisas
 * viajam separadas, e é por isso que `fileLicense` existe na referência de
 * partitura.
 */

/**
 * Setenta anos, contados de 1º de janeiro do ano seguinte ao marco.
 *
 * O `+ 1` é o dia 1º de janeiro seguinte, e não um arredondamento. Errar isso
 * libera a obra um ano antes da hora.
 */
export const PRAZO_EM_ANOS = 70;

export type RegimeDePrazo =
  /** Autor conhecido: conta da morte dele. Lei 9.610/98, art. 41. */
  | 'AUTOR_CONHECIDO'
  /** Coautoria indivisível: conta da morte do ÚLTIMO. Art. 42. */
  | 'COAUTORIA_INDIVISIVEL'
  /** Anônima ou pseudônima: conta da primeira publicação. Art. 43. */
  | 'ANONIMA_OU_PSEUDONIMA'
  /** Audiovisual ou fotográfica: conta da divulgação. Art. 44. */
  | 'AUDIOVISUAL_OU_FOTOGRAFICA'
  /** Autor desconhecido, fora do folclore protegido. Art. 45, II. */
  | 'AUTOR_DESCONHECIDO'
  /**
   * Anterior a qualquer prazo concebível.
   *
   * Não é cálculo: é constatação. Um fragmento grego do século II não precisa
   * de conta, e fingir que precisa produziria "indeterminado" sobre algo que
   * nenhum jurista discutiria.
   */
  | 'ANTERIOR_A_QUALQUER_PRAZO';

/** O marco que cada regime usa — é isto que a pergunta confundia. */
export const MARCO_DO_REGIME: Record<RegimeDePrazo, 'MORTE' | 'PUBLICACAO' | 'NENHUM'> = {
  AUTOR_CONHECIDO: 'MORTE',
  COAUTORIA_INDIVISIVEL: 'MORTE',
  ANONIMA_OU_PSEUDONIMA: 'PUBLICACAO',
  AUDIOVISUAL_OU_FOTOGRAFICA: 'PUBLICACAO',
  AUTOR_DESCONHECIDO: 'NENHUM',
  ANTERIOR_A_QUALQUER_PRAZO: 'NENHUM',
};

/** O artigo da lei que sustenta cada regime, para a ficha poder citá-lo. */
export const ARTIGO_DO_REGIME: Record<RegimeDePrazo, string> = {
  AUTOR_CONHECIDO: 'Lei 9.610/98, art. 41',
  COAUTORIA_INDIVISIVEL: 'Lei 9.610/98, art. 42',
  ANONIMA_OU_PSEUDONIMA: 'Lei 9.610/98, art. 43',
  AUDIOVISUAL_OU_FOTOGRAFICA: 'Lei 9.610/98, art. 44',
  AUTOR_DESCONHECIDO: 'Lei 9.610/98, art. 45, II',
  ANTERIOR_A_QUALQUER_PRAZO: 'anterior a qualquer prazo legal concebível',
};

export interface EntradaDePrazo {
  regime: RegimeDePrazo;
  /** Ano de morte do autor — ou do último coautor, na coautoria indivisível. */
  anoDeMorte?: number;
  /** Ano da primeira publicação ou divulgação. */
  anoDePublicacao?: number;
  hoje?: Date;
}

export interface ResultadoDePrazo {
  status: 'PUBLIC_DOMAIN' | 'PROTECTED' | 'UNDETERMINED';
  regime: RegimeDePrazo;
  artigo: string;
  /** O ano em que a obra entra (ou entrou) em domínio público. */
  entraEm?: number;
  /** A frase para a ficha, escrita para quem lê e não para quem audita. */
  nota: string;
}

/**
 * O ano de entrada em domínio público, a partir do marco.
 *
 * `marco + 71` porque o prazo começa em 1º de janeiro do ano **seguinte**:
 * morte em 1955 → contagem de 1956 a 2025 → livre em 1º/1/2026.
 */
export function anoDeEntrada(anoDoMarco: number): number {
  return anoDoMarco + PRAZO_EM_ANOS + 1;
}

/**
 * 🔴 O CÁLCULO, E É O ÚNICO LUGAR ONDE ELE ACONTECE.
 *
 * Espalhar esta conta faz cada chamador escolher o próprio marco — e foi
 * exatamente assim que a pergunta "morte ou publicação?" ficou sem resposta
 * consistente. Um lugar só, e o regime é **declarado** por quem chama, não
 * adivinhado aqui.
 */
export function avaliarPrazo(entrada: EntradaDePrazo): ResultadoDePrazo {
  const anoAtual = (entrada.hoje ?? new Date()).getFullYear();
  const artigo = ARTIGO_DO_REGIME[entrada.regime];
  const marco = MARCO_DO_REGIME[entrada.regime];

  if (entrada.regime === 'ANTERIOR_A_QUALQUER_PRAZO') {
    return {
      status: 'PUBLIC_DOMAIN',
      regime: entrada.regime,
      artigo,
      nota: 'Anterior a qualquer prazo legal concebível. Não há o que contar.',
    };
  }

  if (entrada.regime === 'AUTOR_DESCONHECIDO') {
    return {
      status: 'PUBLIC_DOMAIN',
      regime: entrada.regime,
      artigo,
      nota: `Autor desconhecido, em domínio público por ${artigo} — ressalvada a proteção do conhecimento tradicional.`,
    };
  }

  const anoDoMarco = marco === 'MORTE' ? entrada.anoDeMorte : entrada.anoDePublicacao;

  if (typeof anoDoMarco !== 'number') {
    /**
     * Falta o dado do marco DESTE regime — e a nota diz **qual** falta.
     *
     * "Indeterminado" sozinho manda quem for resolver procurar às cegas. Dizer
     * que falta a data de morte, ou que falta a de publicação, é a diferença
     * entre uma pendência acionável e um beco.
     */
    return {
      status: 'UNDETERMINED',
      regime: entrada.regime,
      artigo,
      nota:
        marco === 'MORTE'
          ? `Sem data de morte do autor, não há como contar o prazo de ${artigo}.`
          : `Sem data de primeira publicação, não há como contar o prazo de ${artigo}.`,
    };
  }

  const entraEm = anoDeEntrada(anoDoMarco);
  const livre = anoAtual >= entraEm;

  const origem =
    marco === 'MORTE' ? `morte do autor em ${anoDoMarco}` : `primeira publicação em ${anoDoMarco}`;

  return {
    status: livre ? 'PUBLIC_DOMAIN' : 'PROTECTED',
    regime: entrada.regime,
    artigo,
    entraEm,
    nota: livre
      ? `Em domínio público desde 1º/1/${entraEm} — ${origem}, ${artigo}.`
      : `Protegida até 31/12/${entraEm - 1}; entra em domínio público em 1º/1/${entraEm} — ${origem}, ${artigo}.`,
  };
}

/**
 * O regime que se aplica, a partir do que se sabe da obra.
 *
 * Deliberadamente conservador: na dúvida entre autor conhecido e anônimo, vale
 * **autor conhecido**, porque é o regime que protege mais. Errar para o lado
 * de proteger esconde obra livre; errar para o outro lado reproduz obra
 * protegida, e só um dos dois erros tem consequência jurídica.
 */
export function regimeDaObra(obra: {
  temAutorNomeado: boolean;
  anonimaDeclarada?: boolean;
  anteriorANotacao?: boolean;
  coautoriaIndivisivel?: boolean;
}): RegimeDePrazo {
  if (obra.anteriorANotacao) return 'ANTERIOR_A_QUALQUER_PRAZO';
  if (obra.temAutorNomeado) {
    return obra.coautoriaIndivisivel ? 'COAUTORIA_INDIVISIVEL' : 'AUTOR_CONHECIDO';
  }
  return obra.anonimaDeclarada ? 'ANONIMA_OU_PSEUDONIMA' : 'AUTOR_DESCONHECIDO';
}
