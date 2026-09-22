import {
  CanonicalComposer,
  CanonicalWork,
  PublicDomainAssessment,
  avaliarDominioPublico,
  proveniencia,
  textoDe,
} from '../domain/music-knowledge';
import { compositoresDoRepertorio, obrasDoRepertorio } from './seed-acervo';
import {
  COMPOSITORES_EXTERNOS,
  CompositorExterno,
} from './seed-acervo-externo';
import { COMPOSITORES_BRASILIS } from './seed-brasilis';
import { Partitura, carregarPartituras } from './seed-partituras';
import { lerTitulo } from '../domain/title-reading';
import { regioesDasCidadanias } from '../domain/wikidata-regions';
import { RegistroPendente } from '../domain/catalog-resource';
import { REGISTROS_DA_ANTIGUIDADE } from './seed-antiquity';

/**
 * O ACERVO INTEIRO — o que extraímos, mais o que já era nosso.
 *
 * DUAS ORIGENS, UM CATÁLOGO
 * -------------------------
 * O acervo **externo** vem da extração: Open Opus deu nome, datas, época e a
 * lista de obras; Wikidata deu biografia, retrato e os identificadores
 * cruzados. São centenas de compositores e milhares de obras.
 *
 * O acervo **próprio** são as melodias transcritas à mão para o sintetizador
 * da plataforma. São poucas, e são as únicas que **tocam aqui dentro** — a
 * edição é nossa, e por isso não depende de permissão de ninguém.
 *
 * QUANDO OS DOIS SE ENCONTRAM
 * ---------------------------
 * O mesmo Bach chega pelas duas vias. A junção é por identificador legível, e
 * o registro próprio **acrescenta** ao externo em vez de substituí-lo: ele
 * traz a partitura tocável, e o externo traz a ficha completa. Perder qualquer
 * um dos dois empobreceria o catálogo.
 *
 * A SITUAÇÃO DE DIREITO AUTORAL É RECALCULADA AQUI
 * ------------------------------------------------
 * Não se confia no que veio gravado no seed: o prazo corre, e um compositor
 * que estava protegido na extração pode ter entrado em domínio público desde
 * então. Calcular na leitura custa nada e evita um catálogo que envelhece
 * errado.
 */

/** Transforma o registro extraído em compositor canônico. */
function comoCanonico(e: CompositorExterno): CanonicalComposer {
  /**
   * Recalculado, e não copiado. O `situacao` gravado no seed é o retrato do
   * dia da extração; o prazo continua correndo depois disso.
   */
  const publicDomain: PublicDomainAssessment = avaliarDominioPublico({
    anoDeMorte: e.morte,
    anoDeNascimento: e.nascimento,
  });

  /** Ausente significa Open Opus, que era a única fonte quando isto nasceu. */
  const fonte = e.fonte ?? 'OPEN_OPUS';
  const refDaFonte = fonte === 'MUSICA_BRASILIS' ? e.ids.musicaBrasilis : e.ids.openOpus;

  return {
    id: e.id,
    canonicalName: e.nome,
    sortName: e.ordenar,
    birthYear: e.nascimento,
    deathYear: e.morte,
    biography: e.biografia ? { pt: e.biografia } : undefined,
    periodIds: e.era ? [e.era] : [],
    /** O recorte fino da fonte, preservado ao lado da era do Atlas. */
    subPeriodo: e.epoca,
    movements: [],
    /**
     * A REGIÃO, DERIVADA DA CIDADANIA — e o filtro mais indigno do acervo
     * deixando de ser.
     *
     * Aqui havia `[]` fixo. Catorze compositores de duzentos e trinta e quatro
     * tinham região, e o Atlas oferecia o recorte assim mesmo: quem clicava em
     * "Europa Ocidental (14)" concluía que eram essas as que existiam.
     *
     * São duzentos e dezesseis agora. Os quatro que ficam de fora não têm
     * cidadania declarada na fonte — e ficam sem região, e não numa gaveta
     * chamada "outros", que não significaria lugar nenhum.
     */
    regionIds: regioesDasCidadanias(e.cidadanias ?? []),
    /** Conteúdo de ficha: "nasceu em Eisenach" é o que se lê numa biografia. */
    birthPlace: e.nasceuEm,
    deathPlace: e.morreuEm,
    /**
     * O que a pessoa TOCAVA — e não o meio para que escreveu.
     *
     * São dois eixos diferentes: Berlioz escreveu para orquestra inteira e
     * tocava violão e flauta. Confundi-los faria o filtro de instrumento
     * responder a pergunta errada.
     */
    instrumentosPraticados: e.instrumentos ?? [],
    portraitUrl: e.retrato,
    externalIds: e.ids,
    workIds: [],
    /**
     * A PROVENIÊNCIA DIZ QUAL DAS DUAS CATALOGAÇÕES TROUXE O REGISTRO.
     *
     * Aqui estava `OPEN_OPUS` cravado. Com uma fonte só, era verdade. Com os
     * 783 compositores de Música Brasilis no catálogo, cada um deles passaria
     * a declarar que o nome e a data de morte saíram do Open Opus — que nunca
     * os catalogou.
     *
     * Proveniência errada é pior que proveniência ausente: quem for conferir
     * procura no lugar errado, não acha, e conclui que o dado é inventado.
     */
    provenance: [
      proveniencia('canonicalName', fonte, refDaFonte),
      proveniencia('deathYear', fonte, refDaFonte),
      /**
       * A biografia do recorte brasileiro vem da própria Música Brasilis, e
       * não da Wikidata — que é onde a do recorte ocidental vive. Dizer
       * Wikidata para as duas mandaria quem for conferir procurar no lugar
       * errado.
       */
      ...(e.biografia
        ? [
            fonte === 'MUSICA_BRASILIS'
              ? proveniencia('biography', 'MUSICA_BRASILIS', e.ids.musicaBrasilisUrl)
              : proveniencia('biography', 'WIKIDATA', e.ids.wikidata),
          ]
        : []),
      ...(e.retrato ? [proveniencia('portraitUrl', 'COMMONS', e.ids.wikidata)] : []),
    ],
    publicDomain,
    resolution: {
      method: fonte,
      resolvedAt: new Date().toISOString(),
      /**
       * Confiança pelo cruzamento: um registro que o Wikidata confirmou tem
       * identidade resolvida; um que só o Open Opus conhece é um nome numa
       * lista.
       */
      confidence: e.ids.wikidata ? 1 : 0.7,
    },
  };
}

/**
 * Todos os compositores, com o registro próprio acrescentando ao externo.
 *
 * A ordem importa: o externo entra primeiro e o próprio sobrescreve o que
 * souber melhor — as eras em que a plataforma de fato tem obra, e os
 * movimentos que a curadoria atribuiu.
 */
/**
 * A CHAVE DE IDENTIDADE POR NOME.
 *
 * Sem acento, sem pontuação, sem caixa, e com as palavras **ordenadas**. É a
 * ordenação que faz `Johann Sebastian Bach` e `Bach, Johann Sebastian` caírem
 * na mesma chave — e era exatamente aí que as duas fontes divergiam.
 */
function chaveDeIdentidade(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z ]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .sort()
    .join(' ');
}

/**
 * De onde vem cada identificador que o catálogo já usou.
 *
 * O repertório próprio numera `bach-johann-sebastian`; a catalogação de origem
 * numera `johann-sebastian-bach`. As obras próprias apontam para o primeiro e
 * as vinte e cinco mil apontam para o segundo — e a fusão precisa deixar os
 * dois caminhos funcionando.
 */
const apelidosDeCompositor = new Map<string, string>();

/** O identificador canônico de um compositor, resolvendo apelidos antigos. */
export function idCanonicoDoCompositor(id: string): string {
  return apelidosDeCompositor.get(id) ?? id;
}

export function todosOsCompositores(hoje: Date = new Date()): CanonicalComposer[] {
  const porId = new Map<string, CanonicalComposer>();
  const porNome = new Map<string, string>();
  apelidosDeCompositor.clear();

  /**
   * DUAS CATALOGAÇÕES DE ORIGEM, E NÃO UMA.
   *
   * O Open Opus cataloga o concerto ocidental; Música Brasilis cataloga o
   * corpus brasileiro. As duas são **primárias no recorte delas**, e é por
   * isso que as duas criam entidade — o que a ontologia proíbe às fontes de
   * recurso, que só enriquecem quem já existe.
   *
   * A ordem importa: o ocidental primeiro, o brasileiro depois. Quando os dois
   * trazem a mesma pessoa — Villa-Lobos, Carlos Gomes, Camargo Guarnieri e
   * Francisco Mignone atravessaram para o catálogo europeu —, quem chega
   * depois **acrescenta ao registro que já existe** em vez de abrir um
   * segundo. É a mesma resolução por nome ordenado que juntou os nove
   * compositores duplicados; o que ela impede aqui é o Brasil ganhar dois
   * Villa-Lobos.
   */
  for (const e of COMPOSITORES_EXTERNOS) {
    const c = comoCanonico(e);
    porId.set(c.id, c);
    porNome.set(chaveDeIdentidade(c.canonicalName), c.id);
  }

  for (const e of COMPOSITORES_BRASILIS) {
    const c = comoCanonico(e);
    const chave = chaveDeIdentidade(c.canonicalName);
    const jaExiste = porNome.get(chave);

    if (!jaExiste) {
      porId.set(c.id, c);
      porNome.set(chave, c.id);
      continue;
    }

    /**
     * Ele já está no catálogo pelo ocidental. O identificador brasileiro vira
     * apelido — sem isto, as obras de Villa-Lobos que vêm daqui apontariam
     * para um registro que não existe, e ficariam órfãs.
     */
    apelidosDeCompositor.set(c.id, jaExiste);

    const atual = porId.get(jaExiste)!;
    porId.set(jaExiste, {
      ...atual,
      /**
       * A região BRASILEIRA se soma. Os quatro que atravessaram tinham região
       * pela cidadania declarada no catálogo europeu; esta fonte confirma a
       * mesma, e somar não duplica porque o conjunto é de valores únicos.
       */
      regionIds: [...new Set([...atual.regionIds, ...c.regionIds])],
      periodIds: [...new Set([...atual.periodIds, ...c.periodIds])],
      /**
       * A BIOGRAFIA MAIS SUBSTANTIVA VENCE.
       *
       * 🔴 Villa-Lobos ficava com `"compositor brasileiro (1887–1959)"` — a
       * linha de descritor da Wikidata — enquanto Música Brasilis traz uma
       * biografia inteira dele. A fusão preservava o registro ocidental sem
       * olhar o conteúdo, e o resultado era a ficha mais pobre dos dois.
       *
       * O critério é o tamanho do texto, e ele é grosseiro de propósito: um
       * descritor de uma linha e uma biografia de parágrafos não se confundem
       * por comprimento. A biografia autoral do Conservatório continua
       * vencendo as duas, porque ela entra depois, na passada do repertório
       * próprio.
       */
      biography:
        (textoDe(c.biography) ?? '').length > (textoDe(atual.biography) ?? '').length
          ? c.biography
          : atual.biography,
      externalIds: { ...atual.externalIds, ...c.externalIds },
      /** As duas proveniências ficam: cada campo continua dizendo de onde veio. */
      provenance: [...atual.provenance, ...c.provenance],
    });
  }

  for (const p of compositoresDoRepertorio(hoje)) {
    /**
     * 🔴 HAVIA DOIS BACHS, E DOIS DE MAIS OITO.
     *
     * A fusão era só por identificador, e as duas fontes numeram diferente:
     * `bach-johann-sebastian` de um lado, `johann-sebastian-bach` do outro.
     * Nove dos catorze compositores do repertório próprio — Bach, Beethoven,
     * Brahms, Chopin, Grieg, Mozart, Pachelbel, Schumann, Vivaldi — viviam
     * duplicados.
     *
     * O estrago não era só a contagem. O dado bom ficava **partido**: a
     * biografia autoral num registro sem obra, sem retrato e sem região; as
     * oitocentas e trinta e oito obras noutro, com uma linha de descrição da
     * fonte no lugar da biografia. Quem abria a ficha via metade, e a metade
     * que faltava não dava sinal de existir.
     *
     * Casar por nome normalizado resolve, e o identificador que sobrevive é o
     * **externo** — porque é para ele que as vinte e cinco mil obras apontam.
     * O identificador próprio vira apelido, e as obras próprias continuam
     * chegando.
     */
    const idExterno = porId.has(p.id) ? p.id : porNome.get(chaveDeIdentidade(p.canonicalName));
    const externo = idExterno ? porId.get(idExterno) : undefined;

    if (!externo || !idExterno) {
      porId.set(p.id, p);
      porNome.set(chaveDeIdentidade(p.canonicalName), p.id);
      continue;
    }

    if (idExterno !== p.id) apelidosDeCompositor.set(p.id, idExterno);

    porId.set(idExterno, {
      ...externo,
      /** A biografia autoral prevalece sobre a descrição curta da fonte. */
      biography: p.biography ?? externo.biography,
      /** As eras somam: a fonte diz a época, a curadoria diz onde há obra. */
      periodIds: [...new Set([...externo.periodIds, ...p.periodIds])],
      subPeriodo: externo.subPeriodo,
      regionIds: [...new Set([...externo.regionIds, ...p.regionIds])],
      birthPlace: externo.birthPlace ?? p.birthPlace,
      deathPlace: externo.deathPlace ?? p.deathPlace,
      instrumentosPraticados: [
        ...new Set([
          ...(externo.instrumentosPraticados ?? []),
          ...(p.instrumentosPraticados ?? []),
        ]),
      ],
      movements: [...new Set([...externo.movements, ...p.movements])],
      provenance: [...externo.provenance, ...p.provenance],
    });
  }

  return [...porId.values()].sort((a, b) => a.sortName.localeCompare(b.sortName, 'pt-BR'));
}


/** A forma curta em que as obras vivem no arquivo servido. */
interface ObraServida {
  id: string;
  c: string;
  t: string;
  s?: string;
  m?: string;
  og?: string;
  e?: string;
  oo?: string;
  /** Outras entradas da fonte para a mesma obra, colapsadas na geração. */
  oo2?: string[];
  r: boolean;
  p: boolean;
}

/**
 * As obras chegam SOB DEMANDA.
 *
 * Vinte e cinco mil registros dentro do módulo davam um pacote de 7,1 MB, e
 * todo visitante baixaria o catálogo inteiro mesmo sem abrir o Acervo. Elas
 * viraram arquivo servido: quem nunca abre o catálogo não paga por ele, e quem
 * abre paga uma vez.
 *
 * O cache é de processo. Recarregar a página busca de novo — e é o certo, já
 * que o arquivo é versionado junto do código e muda com ele.
 */
let obrasServidas: ObraServida[] | null = null;

/**
 * Por que o catálogo servido não chegou, quando não chegou.
 *
 * `null` significa "carregou" ou "ainda não tentou" — e a diferença entre as
 * duas não importa para quem pergunta: o que importa é que **não há falha a
 * relatar**. Ter um motivo aqui significa que a listagem está incompleta e a
 * tela deve dizer isso em vez de mostrar um acervo mutilado como se fosse o
 * acervo inteiro.
 */
let falhaAoCarregar: string | null = null;

export function falhaAoCarregarOAcervo(): string | null {
  return falhaAoCarregar;
}

/**
 * 🔴 O CATALOGO DEIXOU DE SER BUSCADO POR CAMINHO, E PASSOU A SER IMPORTADO.
 *
 * O QUE ACONTECIA
 * ---------------
 * As vinte e cinco mil obras viviam em `public/acervo/obras.json` e chegavam
 * por `fetch('/acervo/obras.json')`. Quando esse caminho nao existia no
 * servidor, a resposta **nao era um erro**: era o `index.html` da aplicacao,
 * porque um aplicativo de pagina unica responde qualquer caminho desconhecido
 * com a propria pagina. O `JSON.parse` entao falhava com
 * *"Unexpected token '<', \"<!DOCTYPE\"..."*, a tela caia para as dezessete
 * obras do repertorio proprio e pedia para recarregar.
 *
 * Recarregar nunca resolveu, e nao tinha como resolver: o arquivo nao estava
 * la. Ele **nunca foi versionado** — existia so na maquina onde a extracao
 * rodou —, e toda construcao feita a partir do repositorio nascia sem
 * catalogo. O aviso de "tente de novo" era, na pratica, uma mentira educada.
 *
 * POR QUE IMPORTAR RESOLVE, E TENTAR DE NOVO NAO RESOLVIA
 * ------------------------------------------------------
 * Importado, o catalogo vira **dependencia da construcao**: o empacotador o
 * resolve em tempo de compilacao, e uma construcao que nao o encontre nao
 * termina — falha ali, na maquina de quem publica, em vez de falhar no
 * navegador de quem estuda. O arquivo ganha nome com marca de versao, servido
 * de `/assets/`, onde nenhuma rota da aplicacao passa; e some a possibilidade
 * de receber uma pagina HTML no lugar de dado.
 *
 * O `import()` e dinamico de proposito: sao cinco megabytes, e eles so devem
 * viajar quando alguem abre o acervo — nao no primeiro carregamento de quem
 * entrou para estudar uma licao.
 */
export async function carregarObrasExternas(): Promise<ObraServida[]> {
  if (obrasServidas) return obrasServidas;
  falhaAoCarregar = null;

  try {
    const modulo = await import('./acervo/obras.json');
    const lido = (modulo.default ?? modulo) as ObraServida[];

    /**
     * NAO-VACUIDADE. Um arquivo presente e vazio passaria por catalogo, e a
     * tela mostraria duzentas e vinte e cinco pessoas com zero obras cada sem
     * uma palavra sobre o motivo.
     */
    if (!Array.isArray(lido) || lido.length === 0) {
      throw new Error('o catalogo importado veio vazio');
    }

    obrasServidas = lido;
    return obrasServidas;
  } catch (e) {
    /**
     * Chegar aqui deixou de ser um acidente de rede e passou a ser um defeito
     * de construcao. O motivo fica guardado, e a tela diz que a listagem esta
     * incompleta — mas o vazio NAO fica guardado em `obrasServidas`, para que
     * a proxima leitura tente de novo em vez de devolver dezessete obras.
     */
    falhaAoCarregar = e instanceof Error ? e.message : 'falha desconhecida';
    return [];
  }
}

/**
 * AS OBRAS BRASILEIRAS.
 *
 * Importadas, e não buscadas por caminho, pela mesma razao que as outras: um
 * arquivo que o empacotador nao resolve some da publicacao sem avisar.
 *
 * São seis mil novecentas e dezessete, e cada uma chega **com o endereco da
 * edicao dela** — o que faz delas o oposto das mil cento e sessenta e nove
 * edicoes que nao acharam obra. Aqui obra e edicao nascem juntas e ja ligadas,
 * porque na fonte elas sao a mesma ficha.
 */
interface ObraBrasileira {
  id: string;
  /** compositor */ c: string;
  /** título */ t: string;
  /** meio, como a fonte o nomeia */ i: string[];
  /** era */ e?: string;
  /** a página da edição na fonte */ u: string;
}

let obrasBrasileiras: ObraBrasileira[] | null = null;

export async function carregarObrasBrasileiras(): Promise<ObraBrasileira[]> {
  if (obrasBrasileiras) return obrasBrasileiras;

  try {
    const modulo = await import('./acervo/brasilis.json');
    const lido = (modulo.default ?? modulo) as ObraBrasileira[];
    if (!Array.isArray(lido) || lido.length === 0) {
      throw new Error('o corpus brasileiro importado veio vazio');
    }
    obrasBrasileiras = lido;
    return obrasBrasileiras;
  } catch (e) {
    falhaAoCarregar = e instanceof Error ? e.message : 'falha desconhecida';
    return [];
  }
}

/**
 * ONDE ESTÁ A PARTITURA DE CADA OBRA — o índice do IMSLP.
 *
 * Gerado por `scripts/casar-imslp.ts`, que percorre o índice público da fonte
 * e casa por **compositor + número de catálogo**, com o título como segunda
 * chave. O que entra aqui é o link da página da obra, e nunca o arquivo: o
 * `robots.txt` da fonte proíbe `/images/` e `/imglnks/`, que é onde os PDF
 * ficam, e o download acontece lá, com quem publica.
 *
 * Por que um arquivo separado, e não um campo dentro de `obras.json`: o
 * casamento é reexecutável e o catálogo não. Regravar cinco megabytes de obras
 * para acrescentar um link em cada uma faria toda rodada de enriquecimento
 * reescrever o acervo inteiro, e a revisão de mudanças ficaria ilegível.
 */
interface PartituraLocalizada {
  /** id da obra no nosso catálogo */ o: string;
  /** link permanente da página na fonte */ u: string;
}

let indiceImslp: Map<string, string> | null = null;

async function carregarIndiceImslp(): Promise<Map<string, string>> {
  if (indiceImslp) return indiceImslp;

  try {
    const modulo = await import('./acervo/imslp.json');
    const lido = (modulo.default ?? modulo) as PartituraLocalizada[];
    indiceImslp = new Map(lido.map((r) => [r.o, r.u]));
    return indiceImslp;
  } catch {
    /**
     * Ausência aqui NÃO é falha do catálogo: é enriquecimento que ainda não
     * rodou. As obras continuam listadas, e a ficha diz que a edição ainda não
     * foi localizada — que é a verdade quando o índice não existe.
     */
    indiceImslp = new Map();
    return indiceImslp;
  }
}

/** Esquece o que foi carregado. Existe para o teste, e para reextração. */
export function limparCacheDeObras(): void {
  obrasServidas = null;
  falhaAoCarregar = null;
}

/**
 * Todas as obras: as catalogadas e as que tocam.
 *
 * As externas nascem **sem partitura** — o catálogo sabe que existem, e a
 * experiência depende de haver edição redistribuível. As próprias trazem a
 * transcrição, e são as que tocam.
 */
/**
 * O parametro `buscar` sumiu junto com o `fetch`.
 *
 * Ele existia para que o teste pudesse substituir a rede. Nao ha mais rede a
 * substituir: o catalogo e importado pelo empacotador, e o teste le o mesmo
 * arquivo que a aplicacao le — que e, alias, o que ele deveria ter lido desde
 * sempre. Um teste que substituia a rede por um punhado de obras de mentira
 * provava que o codigo funciona sobre dado inventado, e nao sobre o acervo.
 */
export async function todasAsObras(hoje: Date = new Date()): Promise<CanonicalWork[]> {
  const compositores = new Map(todosOsCompositores(hoje).map((c) => [c.id, c]));
  const porId = new Map<string, CanonicalWork>();

  for (const o of await carregarObrasExternas()) {
    const c = compositores.get(o.c);
    /**
     * O QUE O TÍTULO JÁ DIZ, LIDO — e não deduzido.
     *
     * `Sonata in B flat major, K. 545` carrega forma, tonalidade e número de
     * catálogo dentro do próprio título. Deixá-los presos na cadeia de texto
     * fazia o catálogo ter campo vazio sobre informação que ele possui.
     *
     * Rende 46% de número de catálogo e 45% de forma, sem uma requisição —
     * contra 4% e 11% medidos na base externa de identificadores cruzados.
     */
    const lido = lerTitulo(o.t);
    porId.set(o.id, {
      id: o.id,
      canonicalTitle: { pt: o.t },
      composerIds: [o.c],
      /**
       * O meio vem da fonte e entra em `instrumentation`, que é onde ele
       * pertence. É meio GROSSO — "teclado" não é "piano" —, e o instrumento
       * exato vem da partitura, quando há.
       */
      instrumentation: o.m ? [o.m] : [],
      /**
       * VAZIO de propósito, e é a correção de um defeito.
       *
       * A classificação da fonte estava gravada aqui, e ela é de meio. O
       * filtro de gênero mostrava `vocal` ao lado de `minueto`, como se
       * fossem do mesmo tipo. Forma de verdade virá de outra fonte; até lá o
       * campo fica vazio, porque campo errado preenchido é pior que vazio —
       * o vazio se vê, o errado não.
       */
      /**
       * A forma LIDA do título, e vazia quando o título não a nomeia.
       *
       * O campo guardou MEIO por vinte e cinco mil registros — `vocal` ao lado
       * de `minueto` no mesmo filtro. Agora só entra o que está escrito:
       * "Manhã" e "Melodia" continuam sem forma, em vez de classificadas
       * pela forma mais provável daquele compositor.
       */
      generoId: lido.forma,
      /**
       * As listas curadas da fonte, preservadas COM a origem.
       *
       * Foram extraídas e ficaram sem uso por serem juízo de terceiro. O erro
       * não era trazê-las: era apresentá-las sem dizer de quem são.
       */
      selecoesDaFonte: [
        ...(o.r ? ['RECOMENDADA' as const] : []),
        ...(o.p ? ['POPULAR' as const] : []),
      ],
      catalogNumber: lido.numeroDeCatalogo,
      key: lido.tonalidade,
      periodId: o.e,
      regionId: c?.regionIds[0],
      movements: [],
      scoreRefs: [],
      recordingRefs: [],
      externalIds: o.oo ? { openOpus: o.oo } : {},
      provenance: [
        proveniencia('canonicalTitle', 'OPEN_OPUS', o.oo),
        /**
         * A procedência destes três é o título da própria fonte, e não outra
         * base. Quem auditar precisa saber que não houve consulta externa.
         */
        ...(lido.forma ? [proveniencia('generoId', 'OPEN_OPUS', o.oo)] : []),
        ...(lido.numeroDeCatalogo ? [proveniencia('catalogNumber', 'OPEN_OPUS', o.oo)] : []),
        ...(lido.tonalidade ? [proveniencia('key', 'OPEN_OPUS', o.oo)] : []),
      ],
      /**
       * A obra herda do COMPOSITOR: é ele que morre, e é da morte dele que o
       * prazo corre. Avaliar pela data da obra liberaria por engano uma peça
       * de 1890 de quem morreu em 1960.
       */
      publicDomain: c?.publicDomain ?? avaliarDominioPublico({ hoje }),
      resolution: {
        method: 'OPEN_OPUS',
        resolvedAt: new Date().toISOString(),
        confidence: 1,
      },
    });
  }

  /**
   * O CORPUS BRASILEIRO ENTRA COMO CATÁLOGO, e não como recurso.
   *
   * Cada registro daqui é uma obra com autoria nomeada e com a página da
   * edição. A `scoreRefs` sai preenchida na origem: é a diferença entre esta
   * fonte e as partituras avulsas, que precisam procurar a obra a que
   * pertencem e frequentemente não acham.
   *
   * O identificador do compositor é **traduzido pelo canônico**. Villa-Lobos,
   * Carlos Gomes, Camargo Guarnieri e Francisco Mignone já estavam no catálogo
   * pelo lado ocidental; sem a tradução, as obras deles que vêm por aqui
   * apontariam para um registro que a fusão extinguiu, e ficariam órfãs — que
   * é exatamente o que aconteceu com as obras próprias quando os nove
   * duplicados foram unidos.
   */
  for (const o of await carregarObrasBrasileiras()) {
    const idDoAutor = idCanonicoDoCompositor(o.c);
    const c = compositores.get(idDoAutor);

    /** Autoria que não resolve não vira obra sem autor: não vira obra. */
    if (!c) continue;

    const lido = lerTitulo(o.t);

    porId.set(o.id, {
      id: o.id,
      canonicalTitle: { pt: o.t },
      composerIds: [idDoAutor],
      instrumentation: o.i,
      generoId: lido.forma,
      catalogNumber: lido.numeroDeCatalogo,
      key: lido.tonalidade,
      periodId: o.e,
      regionId: c.regionIds[0],
      movements: [],
      /**
       * `FICHA`, e não `NATIVA`: o que se guarda é o endereço da página onde a
       * edição está, e não um arquivo que a plataforma saiba renderizar.
       * Marcar nativa poria um botão de tocar que não toca.
       *
       * E é a PÁGINA, não o arquivo: o `robots.txt` da fonte proíbe `/media/`,
       * que é onde os PDF vivem. O download acontece lá, com quem publica.
       */
      scoreRefs: [
        {
          source: 'MUSICA_BRASILIS' as const,
          sourceRef: o.u,
          format: 'pdf' as const,
          render: 'FICHA' as const,
          aponta: 'PAGINA' as const,
        },
      ],
      recordingRefs: [],
      externalIds: { musicaBrasilisUrl: o.u },
      provenance: [proveniencia('canonicalTitle', 'MUSICA_BRASILIS', o.u)],
      /** A obra herda do compositor: é dele que o prazo corre. */
      publicDomain: c.publicDomain,
      resolution: {
        method: 'MUSICA_BRASILIS' as const,
        resolvedAt: new Date().toISOString(),
        confidence: 1,
      },
    });
  }

  /**
   * O ENDEREÇO DA PARTITURA ENTRA NA OBRA QUE JÁ EXISTE.
   *
   * 🔴 E **não cria obra nenhuma** — que é a regra que as mil trezentas e
   * trinta e uma duplicatas ensinaram. O índice é casamento por identidade:
   * uma linha dele que não ache obra é uma linha descartada, e não uma obra
   * nova com nome de página da fonte.
   *
   * `FICHA`, e não `NATIVA`: sabemos onde a edição está e não sabemos
   * renderizá-la aqui. Marcar nativa poria um botão de tocar que não toca.
   */
  const imslp = await carregarIndiceImslp();
  for (const [obraId, url] of imslp) {
    const obra = porId.get(obraId);
    if (!obra) continue;

    porId.set(obraId, {
      ...obra,
      scoreRefs: [
        ...obra.scoreRefs,
        {
          source: 'IMSLP' as const,
          sourceRef: url,
          format: 'pdf' as const,
          render: 'FICHA' as const,
          aponta: 'PAGINA' as const,
        },
      ],
      externalIds: { ...obra.externalIds, imslpUrl: url },
    });
  }

  /**
   * 🔴 A ANTIGUIDADE É UMA ERA, E NÃO UM TIPO DE ENTIDADE.
   *
   * Os oito registros viviam fora do catálogo de obras, como
   * `RegistroDaAntiguidade`, e a tela precisava de um recorte próprio para
   * eles — ao lado de "Obras" e "Compositores", como se fossem uma terceira
   * categoria de coisa.
   *
   * Era erro de categoria, o mesmo do Movimento: obra e pessoa são **o que a
   * coisa é**; antiguidade é **quando**. E o preço aparecia no filtro: a era
   * `era_antiguidade` tinha **zero obras**, então ela sumia da faceta — que
   * descarta opção que devolve zero — e os oito ficavam sem caminho nenhum
   * depois que as cápsulas saíram da tela.
   *
   * Entrando como obra, o filtro de era os alcança sozinho, sem exceção em
   * lugar nenhum. O que muda é a ficha: um epitáfio de Seikilos não tem
   * tonalidade nem número de catálogo — tem suporte, estado de conservação e
   * datação. `CanonicalWork` já prevê campo vazio, e é para isso.
   */
  for (const r of REGISTROS_DA_ANTIGUIDADE) {
    porId.set(r.id, {
      id: r.id,
      canonicalTitle: r.titulo,
      /**
       * SEM AUTORIA, e declarado.
       *
       * Não é descuido de catalogação: a música da Antiguidade que sobreviveu
       * é quase toda anônima, e inventar um autor para preencher o campo seria
       * o pior tipo de dado fabricado. A regra "obra não nasce sem compositor"
       * vale para obra que **tem** autor e não foi resolvido — aqui não há.
       *
       * E é por isso que o regime de prazo destes registros é
       * `ANTERIOR_A_QUALQUER_PRAZO`, e não "indeterminado": um fragmento do
       * século II não precisa de conta, e submetê-lo à regra de morte do autor
       * produziria "não dá para afirmar" sobre o que nenhum jurista discutiria.
       */
      composerIds: [],
      date: r.datacao,
      /** O suporte no lugar do meio: é o que esta ficha tem para dizer. */
      instrumentation: [r.suporte],
      periodId: r.eraId,
      regionId: r.regionId,
      movements: [],
      scoreRefs: [],
      recordingRefs: [],
      externalIds: {},
      provenance: [proveniencia('canonicalTitle', 'MANUAL_CURATION', r.procedencia)],
      publicDomain: r.publicDomain,
      resolution: {
        method: 'MANUAL_CURATION',
        resolvedAt: new Date().toISOString(),
        confidence: 1,
      },
    });
  }

  await ligarPartituras(porId, await carregarPartituras(), [...compositores.values()]);

  /**
   * As próprias entram por último: elas trazem a partitura tocável.
   *
   * E os identificadores de compositor são **traduzidos** para o canônico. Sem
   * isto, uma obra própria de Bach apontaria para `bach-johann-sebastian`, que
   * deixou de existir na fusão — e a obra ficaria órfã, listada sem autor,
   * enquanto a ficha de Bach não a contaria.
   */
  for (const p of obrasDoRepertorio(hoje)) {
    porId.set(p.id, {
      ...p,
      composerIds: p.composerIds.map(idCanonicoDoCompositor),
    });
  }

  return [...porId.values()];
}

/** Título comparável: sem acento, sem pontuação, sem caixa. */
function normalizar(t: string): string {
  return t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * AS PARTITURAS SE LIGAM ÀS OBRAS — e o que não se liga NÃO VIRA OBRA.
 *
 * 🔴 O DEFEITO QUE ESTA FUNÇÃO CARREGAVA
 * ------------------------------------
 * Ela criava uma obra para cada partitura que não casava. Mil trezentas e
 * trinta e uma obras falsas entraram no catálogo assim, e não por decisão:
 * `Partitura` não existia como entidade, e a única forma de um arquivo entrar
 * no acervo era sendo uma obra.
 *
 * **A ausência da entidade força a duplicata.** O modelo relacional
 * (`catalog-resource.ts`) resolve a causa: partitura é recurso de obra, e
 * recurso sem dono conhecido fica **pendente**, visível, esperando resolução.
 *
 * São três saídas possíveis, e duas são ruins:
 *
 *   descartar   — perde-se um recurso real, e ninguém fica sabendo;
 *   criar obra  — o catálogo ganha duplicata com aparência de registro;
 *   enfileirar  — o recurso existe, aparece, e não mente sobre o que é.
 *
 * COMO A LIGAÇÃO É TENTADA, EM DUAS PASSADAS
 * -------------------------------------------
 * **Número de catálogo primeiro.** `BWV 846` é o único dado capaz de provar que
 * duas fontes falam da mesma peça. A leitura de título já extraiu onze mil
 * deles do lado das obras, e a ficha por peça trouxe trezentos e noventa e
 * três do lado das partituras — é esse cruzamento que a ontologia habilita.
 *
 * **Título depois**, e só exato. Aproximar por semelhança casaria préludios
 * errados entre si, e um catálogo que junta a peça errada mente pior do que um
 * que declara não saber.
 */
async function ligarPartituras(
  porId: Map<string, CanonicalWork>,
  partituras: Partitura[],
  compositoresConhecidos: CanonicalComposer[]
): Promise<void> {
  pendentes = [];

  const porCatalogo = new Map<string, string>();
  const porTitulo = new Map<string, string>();
  for (const o of porId.values()) {
    for (const c of o.composerIds) {
      if (o.catalogNumber) porCatalogo.set(c + '|' + normalizar(o.catalogNumber), o.id);
      porTitulo.set(c + '|' + normalizar(o.canonicalTitle.pt ?? ''), o.id);
    }
  }

  /**
   * OS NÚMEROS DE CATÁLOGO QUE CADA COMPOSITOR JÁ TEM.
   *
   * Serve a uma pergunta só, e é a que decide se uma partitura vira obra: o
   * catálogo já conhece esta peça? `BWV 1087` não está em obra nenhuma de
   * Bach, e por isso a partitura das *14 Canons* não é duplicata — é uma obra
   * que falta.
   */
  const catalogosDoCompositor = new Map<string, Set<string>>();
  for (const o of porId.values()) {
    if (!o.catalogNumber) continue;
    for (const c of o.composerIds) {
      const atual = catalogosDoCompositor.get(c) ?? new Set<string>();
      atual.add(normalizar(o.catalogNumber));
      catalogosDoCompositor.set(c, atual);
    }
  }

  /**
   * 🔴 A FONTE ESCREVE O NOME ABREVIADO, e a resolução falhava por isso.
   *
   * `M. Giuliani`, `A. Diabelli`, `F. Horetzky`. A chave de palavras ordenadas
   * — a mesma que juntou os nove compositores duplicados — não casa `M` com
   * `Mauro`, e setecentas e onze partituras ficaram sem dono.
   *
   * Sobrenome mais inicial resolve, **quando é inequívoco**. Dois compositores
   * com o mesmo sobrenome e a mesma inicial tornam a chave um sorteio, e ela
   * some da tabela: ligar a partitura à pessoa errada é pior que deixá-la na
   * fila, porque a ficha passa a afirmar autoria falsa com ar de apurada.
   */
  const porSobrenomeEInicial = new Map<string, string | null>();
  for (const c of compositoresConhecidos) {
    const palavras = normalizar(c.canonicalName).split(' ').filter(Boolean);
    if (palavras.length < 2) continue;
    const k = palavras[palavras.length - 1] + '|' + palavras[0][0];
    porSobrenomeEInicial.set(k, porSobrenomeEInicial.has(k) ? null : c.id);
  }

  /** `Traditional` e `Anonymous` não são pessoas: não resolvem, e não criam. */
  const SEM_AUTORIA = /^(traditional|anonymous|unknown|various|anon)/i;

  const resolverPessoa = (p: Partitura): string | undefined => {
    if (p.c) return p.c;
    if (SEM_AUTORIA.test(p.cn)) return undefined;

    const palavras = normalizar(p.cn).split(' ').filter(Boolean);
    if (palavras.length < 2) return undefined;

    return porSobrenomeEInicial.get(palavras[palavras.length - 1] + '|' + palavras[0][0]) ?? undefined;
  };

  for (const p of partituras) {
    /**
     * `FICHA`, e não `NATIVA`: o `.ly` é fonte simbólica que a plataforma
     * **poderá** renderizar, e não renderiza — não há leitor de LilyPond aqui.
     * Marcar nativa agora poria um botão de tocar que abre nada.
     */
    const ref = {
      source: 'MUTOPIA' as const,
      sourceRef: p.ly,
      format: 'lilypond' as const,
      render: 'FICHA' as const,
      /** Licença DO ARQUIVO. Metade exige atribuição, e exigir é condição de uso. */
      fileLicense: p.lic,
      /** Quem transcreveu. Sem o nome, as sob Creative Commons são impublicáveis. */
      editors: p.ed ? [p.ed] : undefined,
    };

    const pessoa = resolverPessoa(p);

    /** Catálogo primeiro: é prova de identidade. Título é indício. */
    const porNumero = pessoa && p.cat ? porCatalogo.get(pessoa + '|' + normalizar(p.cat)) : undefined;
    const porNome = pessoa ? porTitulo.get(pessoa + '|' + normalizar(p.t)) : undefined;
    let alvo = porNumero ?? porNome;

    /**
     * 🔴 QUANDO A PARTITURA **VIRA** OBRA — e é uma exceção estreita.
     *
     * A regra continua: fonte de recurso não cria entidade. Foi assim que mil
     * trezentas e trinta e uma obras falsas entraram no catálogo, e o que as
     * fazia falsas era não haver **prova** de que aquela peça era outra.
     *
     * O número de catálogo é essa prova. `BWV 1087` não está em obra nenhuma
     * de Bach neste acervo — e não porque a peça não exista, mas porque a
     * catalogação de origem não a lista. Criar a obra aqui não duplica nada:
     * duplicar exigiria que ela já estivesse lá com outro nome, e o número diz
     * que não está.
     *
     * As três condições são cumulativas, e cada uma remove um jeito de errar:
     *
     *   autoria resolvida       — obra não nasce sem autor;
     *   número de catálogo      — sem ele não há prova, e volta a ser palpite;
     *   número inédito naquele
     *   compositor              — com ele, seria a mesma obra por outro nome.
     *
     * Sem as três, continua valendo a fila: o recurso existe, aparece, e não
     * mente sobre o que é.
     */
    const catalogoInedito =
      pessoa &&
      p.cat &&
      !alvo &&
      !(catalogosDoCompositor.get(pessoa) ?? new Set()).has(normalizar(p.cat));

    if (catalogoInedito) {
      const lido = lerTitulo(p.t);
      const autor = compositoresConhecidos.find((c) => c.id === pessoa);

      alvo = 'mut-obra-' + p.id;
      porId.set(alvo, {
        id: alvo,
        canonicalTitle: { pt: p.t },
        composerIds: [pessoa],
        date: p.dc,
        instrumentation: [p.i],
        generoId: lido.forma,
        catalogNumber: p.cat,
        key: lido.tonalidade,
        periodId: p.e ?? autor?.periodIds[0],
        regionId: autor?.regionIds[0],
        movements: [],
        scoreRefs: [],
        recordingRefs: [],
        externalIds: {},
        provenance: [proveniencia('canonicalTitle', 'MUTOPIA', p.id)],
        /** A obra herda do compositor: é dele que o prazo corre. */
        publicDomain: autor?.publicDomain ?? avaliarDominioPublico({}),
        resolution: { method: 'MANUAL_CURATION', resolvedAt: new Date().toISOString(), confidence: 1 },
      });

      /**
       * E o número passa a constar como conhecido daquele compositor.
       *
       * Sem isto, duas partituras do MESMO número de catálogo — movimentos de
       * uma suíte, por exemplo — criariam duas obras iguais, e a criação que
       * existe para não duplicar passaria a duplicar.
       */
      catalogosDoCompositor.set(
        pessoa,
        (catalogosDoCompositor.get(pessoa) ?? new Set<string>()).add(normalizar(p.cat!))
      );
      porCatalogo.set(pessoa + '|' + normalizar(p.cat!), alvo);
    }

    if (!alvo) {
      /**
       * NÃO CRIA OBRA. O recurso entra na fila, com o que a fonte disse
       * guardado inteiro para quem for resolver à mão.
       */
      pendentes.push({
        id: 'pend-' + p.id,
        recurso: 'PARTITURA',
        recursoId: p.id,
        motivo: pessoa ? 'OBRA_NAO_ENCONTRADA' : 'PESSOA_NAO_ENCONTRADA',
        descricaoNaFonte: `${p.cn} — ${p.t}${p.cat ? ' (' + p.cat + ')' : ''}`,
        candidatos: [],
        registradoEm: new Date().toISOString(),
        fonteId: 'MUTOPIA',
      });
      continue;
    }

    const obra = porId.get(alvo)!;
    porId.set(alvo, {
      ...obra,
      /** O instrumento exato da edição soma ao meio grosso da fonte. */
      instrumentation: [...new Set([...obra.instrumentation, p.i])],
      catalogNumber: obra.catalogNumber ?? p.cat,
      date: obra.date ?? p.dc,
      scoreRefs: [...obra.scoreRefs, ref],
      /**
       * 🔴 A EDIÇÃO ENTRAVA E O IDENTIFICADOR NÃO.
       *
       * A obra ganhava a referência da partitura e continuava sem nada em
       * `externalIds` — e é de lá que `linkOficial` monta o link que a ficha
       * oferece. Resultado: obra com edição casada, e um botão "consultar na
       * fonte" que não aparecia.
       *
       * O identificador do Mutopia é o da própria peça, e é o que resolve a
       * página dela na fonte.
       */
      externalIds: { ...obra.externalIds, mutopia: obra.externalIds.mutopia ?? p.id },
      provenance: [...obra.provenance, proveniencia('scoreRefs', 'MUTOPIA', p.id)],
    });
  }
}

/**
 * AS PARTITURAS QUE AINDA NÃO ACHARAM OBRA.
 *
 * Preenchida por `ligarPartituras`, que roda dentro de `todasAsObras`. O
 * acoplamento é deliberado e declarado: a fila é o resultado da mesma passada
 * que liga o que casou, e calculá-la de novo percorreria vinte e cinco mil
 * obras uma segunda vez para chegar à mesma resposta.
 *
 * Quem a consome precisa ter chamado `todasAsObras` antes. Ela devolve lista
 * vazia até lá — e vazio aqui significa "ainda não apurado", que é diferente
 * de "nada pendente"; por isso a contagem do acervo nunca a usa como zero.
 */
let pendentes: RegistroPendente[] = [];

export function partiturasPendentes(): RegistroPendente[] {
  return pendentes;
}

/**
 * As obras que a plataforma consegue TOCAR, sem depender de rede.
 *
 * São as nossas transcrições. O Atlas — que é mapa de prática, e não catálogo
 * — se alimenta daqui: um mapa com vinte e cinco mil marcadores não seria
 * navegável, e a maioria deles não abriria nada.
 */
export function obrasTocaveis(hoje: Date = new Date()): CanonicalWork[] {
  return obrasDoRepertorio(hoje);
}
