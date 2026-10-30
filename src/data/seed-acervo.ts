import {
  CanonicalComposer,
  CanonicalWork,
  avaliarDominioPublico,
  proveniencia,
} from '../domain/music-knowledge';
import { REPERTORIO_DO_PLAYER, Periodo } from './seed-player-repertoire';

/**
 * O ACERVO QUE JÁ EXISTE, CATALOGADO.
 *
 * O ATLAS TINHA ZERO OBRAS — E O MATERIAL ESTAVA AQUI DO LADO
 * ----------------------------------------------------------
 * `DEFAULT_WORKS` era `never[] = []`, e o repertório do player já trazia
 * trinta e três melodias de domínio público com autor e período declarados.
 * As duas coisas nunca tinham sido ligadas: o Atlas era uma moldura vazia ao
 * lado de um acervo real.
 *
 * Isto não é ingestão de fonte externa. É reconhecer o que a plataforma já
 * tem, e é por isso que funciona sem rede.
 *
 * POR QUE ESTAS OBRAS SÃO EXPERIÊNCIA COMPLETA
 * --------------------------------------------
 * A transcrição é **nossa** — alturas e durações escritas aqui para o
 * sintetizador da plataforma. É o nível 3 da hierarquia de fontes de
 * partitura: edição própria, nativa por construção, sem depender de permissão
 * de ninguém. Por isso toca, e por isso a licença do arquivo é nossa.
 *
 * A obra em si é de domínio público por outro fundamento — a morte do autor —,
 * e os dois fatos são registrados separadamente, que é o que a proveniência
 * por campo existe para permitir.
 *
 * O QUE NÃO ENTRA NO MAPA HISTÓRICO
 * ---------------------------------
 * Escalas, cadências, diapasão e melodias tradicionais sem autor conhecido
 * **não têm era**. Atribuir uma seria inventar historiografia para preencher
 * um mapa: a escala maior não pertence ao Barroco. Elas continuam no player,
 * que é onde fazem sentido.
 */

/**
 * Os fatos de cada compositor do repertório.
 *
 * Datas e origem são **fato histórico**, e não citação de fonte: dizer que
 * Bach morreu em 1750 não é reproduzir o livro de ninguém. A tabela é escrita
 * à mão de propósito — é curadoria, e a proveniência registra isso.
 */
interface FatoDeCompositor {
  nome: string;
  sortName: string;
  nascimento: number;
  morte: number;
  regiao: string;
  /** Movimentos ou escolas a que a historiografia o associa. */
  movimentos: string[];
  /**
   * Biografia curta, **escrita aqui**.
   *
   * Não é resumo de verbete nem tradução de nada: é o que o Conservatório diz
   * sobre o compositor, no formato que deu ao próprio conteúdo. Cada uma
   * responde à mesma pergunta — o que mudou na música por causa desta pessoa —
   * em vez de recitar cargos e cidades.
   */
  biografia: string;
}

const COMPOSITORES: Record<string, FatoDeCompositor> = {
  'Johann Sebastian Bach': {
    nome: 'Johann Sebastian Bach',
    sortName: 'Bach, Johann Sebastian',
    nascimento: 1685,
    morte: 1750,
    regiao: 'reg_europa_ocidental',
    movimentos: ['mov_contraponto_tardio'],
    biografia:
      'Levou a escrita a várias vozes ao limite do que o sistema tonal comporta. Onde outros usavam a harmonia para sustentar uma melodia, ele a usava para fazer várias caminharem juntas sem que nenhuma virasse acompanhamento. Foi organista e mestre de capela a vida inteira, e escreveu quase sempre por encargo — o que torna o rigor do resultado ainda mais difícil de explicar.',
  },
  'Antonio Vivaldi': {
    nome: 'Antonio Vivaldi',
    sortName: 'Vivaldi, Antonio',
    nascimento: 1678,
    morte: 1741,
    regiao: 'reg_europa_ocidental',
    movimentos: ['mov_concerto_italiano'],
    biografia:
      'Fixou o modelo do concerto que a Europa inteira copiaria: três movimentos, e um jogo entre o solista e o conjunto em que o material volta transformado a cada retorno. Ensinou durante décadas num orfanato feminino de Veneza, e boa parte do que escreveu saiu para ser tocada por aquelas alunas.',
  },
  'Georg Friedrich Händel': {
    nome: 'Georg Friedrich Händel',
    sortName: 'Händel, Georg Friedrich',
    nascimento: 1685,
    morte: 1759,
    regiao: 'reg_europa_ocidental',
    movimentos: ['mov_oratorio_ingles'],
    biografia:
      'Alemão de nascimento, fez carreira em Londres e inventou ali um gênero para um público que já não queria ópera italiana: o drama sacro cantado em inglês, sem cena. Nele o coro deixa de comentar a ação e passa a agir — e é essa mudança que fez o formato durar.',
  },
  'Johann Pachelbel': {
    nome: 'Johann Pachelbel',
    sortName: 'Pachelbel, Johann',
    nascimento: 1653,
    morte: 1706,
    regiao: 'reg_europa_ocidental',
    movimentos: ['mov_contraponto_tardio'],
    biografia:
      'Organista de tradição alemã central, trabalhou o baixo que se repete como estrutura, e não como truque. A repetição obstinada libera as vozes de cima para variar sem perder o chão — procedimento que atravessou três séculos e chegou à música popular.',
  },
  'Christian Petzold': {
    nome: 'Christian Petzold',
    sortName: 'Petzold, Christian',
    nascimento: 1677,
    morte: 1733,
    regiao: 'reg_europa_ocidental',
    movimentos: [],
    biografia:
      'Organista da corte de Dresden. Escreveu peças curtas de teclado que circularam em cadernos domésticos, e por isso mesmo foram atribuídas a outros durante mais de dois séculos. O caso é um bom lembrete de que a autoria, na música do período, era menos fixa do que se costuma supor.',
  },
  'Wolfgang Amadeus Mozart': {
    nome: 'Wolfgang Amadeus Mozart',
    sortName: 'Mozart, Wolfgang Amadeus',
    nascimento: 1756,
    morte: 1791,
    regiao: 'reg_europa_ocidental',
    movimentos: ['mov_classicismo_vienense'],
    biografia:
      'Fez da forma sonata um modo de argumentar: apresentar, pôr em conflito, resolver. A clareza da superfície engana — sob ela há um controle de tensão que quase ninguém alcançou depois. Escreveu em todos os gêneros do seu tempo e mudou cada um deles.',
  },
  'Joseph Haydn': {
    nome: 'Joseph Haydn',
    sortName: 'Haydn, Joseph',
    nascimento: 1732,
    morte: 1809,
    regiao: 'reg_europa_ocidental',
    movimentos: ['mov_classicismo_vienense'],
    biografia:
      'Deu à sinfonia e ao quarteto de cordas a forma que eles teriam pelos cem anos seguintes. Passou trinta anos a serviço de uma única casa, com orquestra própria à disposição — condição rara que lhe permitiu experimentar sem precisar agradar de imediato.',
  },
  'Ludwig van Beethoven': {
    nome: 'Ludwig van Beethoven',
    sortName: 'Beethoven, Ludwig van',
    nascimento: 1770,
    morte: 1827,
    regiao: 'reg_europa_ocidental',
    movimentos: ['mov_classicismo_vienense'],
    biografia:
      'Alargou a forma herdada até ela comportar um arco dramático longo, em que o fim responde ao começo. Perdeu a audição em plena maturidade e continuou compondo — as obras desse período são as que mais se afastaram do que era tocável e esperado.',
  },
  'François-Joseph Gossec': {
    nome: 'François-Joseph Gossec',
    sortName: 'Gossec, François-Joseph',
    nascimento: 1734,
    morte: 1829,
    regiao: 'reg_europa_ocidental',
    movimentos: [],
    biografia:
      'Atravessou o Antigo Regime e a Revolução escrevendo para os dois. Ajudou a fundar as instituições de ensino musical francesas que se tornariam modelo, e compôs música cívica para as festas revolucionárias — repertório feito para praça, e não para salão.',
  },
  'Frédéric Chopin': {
    nome: 'Frédéric Chopin',
    sortName: 'Chopin, Frédéric',
    nascimento: 1810,
    morte: 1849,
    /** Polonês de nascimento, carreira em Paris. As duas regiões são o fato. */
    regiao: 'reg_europa_oriental',
    movimentos: ['mov_piano_romantico'],
    biografia:
      'Escreveu quase só para piano, e reinventou o que o instrumento podia dizer. A peça curta de caráter, nas mãos dele, comporta um mundo: a forma é breve e a densidade harmônica não. Polonês, viveu a maior parte da vida adulta em Paris.',
  },
  'Robert Schumann': {
    nome: 'Robert Schumann',
    sortName: 'Schumann, Robert',
    nascimento: 1810,
    morte: 1856,
    regiao: 'reg_europa_ocidental',
    movimentos: ['mov_piano_romantico'],
    biografia:
      'Organizou peças curtas em ciclos, de modo que o conjunto diz o que nenhuma delas diz sozinha. Foi também crítico, e escreveu sobre música com a mesma exigência com que a compunha — a ponto de inventar personagens para discordar de si mesmo em público.',
  },
  'Piotr Ilitch Tchaikovsky': {
    nome: 'Piotr Ilitch Tchaikovsky',
    sortName: 'Tchaikovsky, Piotr Ilitch',
    nascimento: 1840,
    morte: 1893,
    regiao: 'reg_europa_oriental',
    movimentos: ['mov_nacionalismo_romantico'],
    biografia:
      'Trouxe para a sala de concerto a dança e a fala da música russa sem abrir mão da arquitetura aprendida no conservatório. O resultado desagradou aos dois lados na época, e é exatamente essa tensão que a obra dele resolve.',
  },
  'Johannes Brahms': {
    nome: 'Johannes Brahms',
    sortName: 'Brahms, Johannes',
    nascimento: 1833,
    morte: 1897,
    regiao: 'reg_europa_ocidental',
    movimentos: [],
    biografia:
      'Escreveu contra a pressa do próprio tempo: quatro sinfonias em quase quarenta anos, cada uma medida contra o que Beethoven tinha deixado. A textura é densa e a construção é motívica — pouco material, trabalhado até o fim.',
  },
  'Edvard Grieg': {
    nome: 'Edvard Grieg',
    sortName: 'Grieg, Edvard',
    nascimento: 1843,
    morte: 1907,
    regiao: 'reg_escandinavia',
    movimentos: ['mov_nacionalismo_romantico'],
    biografia:
      'Formou-se no centro da tradição germânica e voltou à Noruega para escrever a partir do modo, da dança e da paisagem sonora de casa. A peça curta, e não a sinfonia, foi onde essa gramática coube melhor.',
  },
};

/**
 * Período do player → era do Atlas.
 *
 * `Referência`, `Teoria` e `Tradicional` ficam de fora: material próprio e
 * melodia sem autor conhecido **não têm era**, e inventar uma seria fabricar
 * historiografia para o mapa não parecer vazio.
 */
const ERA_DO_PERIODO: Partial<Record<Periodo, string>> = {
  Barroco: 'era_barroco',
  Clássico: 'era_classicismo',
  Romântico: 'era_romantismo',
};

/**
 * O gênero de cada faixa, lido do que o TÍTULO declara.
 *
 * "Minueto em sol maior" é minueto; "Cânone — baixo obstinado" é cânone. Isso
 * é leitura, e não atribuição: a forma está escrita no nome da peça.
 *
 * As que o título não nomeia ficam de fora. "Melodia" e "Manhã" são peças de
 * caráter por convenção, e chamá-las assim seria classificar por hábito — o
 * tipo de preenchimento que faz um filtro parecer completo e responder errado.
 */
const GENERO_DA_FAIXA: Record<string, string> = {
  'bar-bach-prelude': 'preludio',
  'bar-minueto-sol': 'minueto',
  'bar-jesu-alegria': 'coral',
  'bar-canon-pachelbel': 'canone',
  'bar-vivaldi-primavera': 'concerto',
  'bar-handel-alegria': 'marcha',
  'cla-mozart-k545': 'sonata',
  'cla-mozart-serenata': 'serenata',
  'cla-beethoven-bagatela': 'bagatela',
  'cla-haydn-surpresa': 'sinfonia',
  'cla-gossec-gavota': 'gavota',
  'rom-brahms-cancao-de-ninar': 'cancao',
  'rom-tchaikovsky-valsa': 'valsa',
  'rom-chopin-preludio': 'preludio',
};

function idDe(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Os compositores do repertório, como entidade canônica. */
export function compositoresDoRepertorio(hoje: Date = new Date()): CanonicalComposer[] {
  const usados = new Set(
    REPERTORIO_DO_PLAYER.filter((f) => ERA_DO_PERIODO[f.periodo]).map((f) => f.autor)
  );

  return [...usados]
    .map((nome) => COMPOSITORES[nome])
    .filter((f): f is FatoDeCompositor => Boolean(f))
    .map((f) => {
      const eras = [
        ...new Set(
          REPERTORIO_DO_PLAYER.filter((t) => t.autor === f.nome)
            .map((t) => ERA_DO_PERIODO[t.periodo])
            .filter((e): e is string => Boolean(e))
        ),
      ];

      return {
        id: idDe(f.sortName),
        canonicalName: f.nome,
        sortName: f.sortName,
        birthYear: f.nascimento,
        deathYear: f.morte,
        periodIds: eras,
        movements: f.movimentos,
        biography: { pt: f.biografia },
        regionIds: [f.regiao],
        externalIds: {},
        workIds: REPERTORIO_DO_PLAYER.filter((t) => t.autor === f.nome && ERA_DO_PERIODO[t.periodo]).map(
          (t) => `obra-${t.id}`
        ),
        provenance: [
          proveniencia('birthYear', 'MANUAL_CURATION', 'curadoria do Conservatório'),
          proveniencia('deathYear', 'MANUAL_CURATION', 'curadoria do Conservatório'),
          proveniencia('biography', 'MANUAL_CURATION', 'texto autoral do Conservatório'),
        ],
        publicDomain: avaliarDominioPublico({ anoDeMorte: f.morte, hoje }),
        resolution: {
          method: 'MANUAL_CURATION' as const,
          resolvedAt: hoje.toISOString(),
          confidence: 1,
        },
      };
    });
}

/** As faixas com era definida, como obra canônica com edição nossa. */
export function obrasDoRepertorio(hoje: Date = new Date()): CanonicalWork[] {
  return REPERTORIO_DO_PLAYER.filter((t) => ERA_DO_PERIODO[t.periodo] && COMPOSITORES[t.autor]).map(
    (t) => {
      const fato = COMPOSITORES[t.autor];
      return {
        id: `obra-${t.id}`,
        canonicalTitle: { pt: t.titulo },
        composerIds: [idDe(fato.sortName)],
        /**
         * Tonalidade, compasso e andamento vinham na faixa e eram JOGADOS
         * FORA na projecao. Sao campos padrao de catalogo — tonalidade entra
         * no titulo por convencao e distingue homonimos —, e perde-los
         * deixava a ficha mais pobre que o dado que ja existia.
         */
        key: t.tonalidade,
        meter: t.compasso === '\u2014' ? undefined : t.compasso,
        tempoBpm: t.bpm,
        /**
         * O que ha e uma linha melodica transcrita, e nao a obra completa.
         * Declarar "piano" ou "orquestra" seria descrever uma edicao que nao
         * temos.
         */
        instrumentation: ['Linha melodica'],
        movements: [],
        generoId: GENERO_DA_FAIXA[t.id],
        periodId: ERA_DO_PERIODO[t.periodo],
        regionId: fato.regiao,
        /**
         * Edição PRÓPRIA, e é isso que a torna tocável aqui dentro. A licença
         * do arquivo é nossa; o domínio público da obra vem da morte do autor,
         * que é outro fundamento e fica registrado à parte.
         */
        scoreRefs: [
          {
            source: 'MANUAL_CURATION' as const,
            sourceRef: t.id,
            format: 'midi' as const,
            render: 'NATIVA' as const,
            fileLicense: 'Transcrição própria do Conservatório Muscicapa',
            editors: ['Conservatório Muscicapa'],
          },
        ],
        recordingRefs: [],
        externalIds: {},
        provenance: [proveniencia('canonicalTitle', 'MANUAL_CURATION', t.id)],
        publicDomain: avaliarDominioPublico({ anoDeMorte: fato.morte, hoje }),
        resolution: {
          method: 'MANUAL_CURATION' as const,
          resolvedAt: hoje.toISOString(),
          confidence: 1,
        },
      };
    }
  );
}
