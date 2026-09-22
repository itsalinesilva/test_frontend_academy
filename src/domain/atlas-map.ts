import { EntityId } from './types';
import {
  CanonicalComposer,
  CanonicalWork,
  DisponibilidadeNoConservatorio,
  avaliarDisponibilidade,
  linkOficial,
  textoDe,
} from './music-knowledge';

/**
 * O ATLAS COMO MAPA NAVEGÁVEL NO TEMPO.
 *
 * O MODELO
 * --------
 * O eixo **horizontal é cronológico**: as eras em ordem, e andar nele troca a
 * era corrente. A cada passo as regiões **se repovoam** — nem toda região tem
 * presença em toda era, e é a própria região que declara em quais tem. O
 * Brasil não aparece na Antiguidade, e isso não é lacuna a preencher: é o
 * fato.
 *
 * Focar uma região filtra os marcadores àquela região **na era corrente**. Os
 * dois recortes são independentes e se compõem.
 *
 * TRÊS TIPOS DE MARCADOR
 * ----------------------
 * **Compositor** — com ficha biográfica e profissional, e o compêndio de
 * obras atreladas a ele.
 * **Obra** — a peça em si.
 * **Movimento** — era mais região mais os compositores fundadores ou
 * influentes, mais os gêneros que ele produziu. É o recorte que responde "o
 * que estava acontecendo aqui", e não "quem estava vivo aqui".
 *
 * CADA MARCADOR DIZ O QUE SE PODE FAZER COM ELE
 * ---------------------------------------------
 * Três estados, e nunca ambiguidade:
 *
 *   **experiência** — dá para tocar, renderizar a partitura, levar à prática;
 *   **apenas pontuado** — está catalogado, com ficha, e a experiência não é
 *   oferecida aqui dentro. O motivo vem escrito;
 *   **com fonte oficial** — o mesmo caso acima, quando se sabe para onde
 *   apontar.
 *
 * Isso vem de `avaliarDisponibilidade`, e não é decidido de novo aqui — a
 * regra mora num lugar só, que é o que impede duas telas de discordarem sobre
 * a mesma obra.
 */

export type MarkerKind = 'COMPOSITOR' | 'OBRA' | 'MOVIMENTO';

/**
 * Movimento estético: o que estava acontecendo, e não quem estava vivo.
 *
 * Um movimento nasce numa era e costuma atravessar mais de uma região. Os
 * **fundadores** são a razão de o marcador existir: sem eles o movimento
 * vira rótulo de período, que é o que a era já é.
 */
export interface MusicalMovement {
  id: EntityId;
  slug: string;
  name: string;
  description: string;
  eraId: EntityId;
  regionIds: EntityId[];
  /** Quem o fundou ou o definiu. Ids de compositor do acervo canônico. */
  founderComposerIds: EntityId[];
  /** Gêneros que o movimento produziu ou transformou. */
  generoIds: EntityId[];
  /** Recorte de anos, quando a historiografia o fixa. */
  years?: string;
}

export interface AtlasMarker {
  id: EntityId;
  kind: MarkerKind;
  titulo: string;
  /** Datas de um compositor, anos de um movimento, instrumentação de uma obra. */
  subtitulo?: string;
  eraId: EntityId;
  regionId?: EntityId;
  movimentoIds: EntityId[];
  generoIds: EntityId[];
  disponibilidade: DisponibilidadeNoConservatorio;
  /**
   * Quantas obras o marcador reúne.
   *
   * Para compositor é o compêndio dele; para movimento, quantos fundadores.
   * `null` quando não se conta nada — e não zero, que seria afirmar uma
   * contagem que ninguém fez.
   */
  contagem: number | null;
}

/** Onde a pessoa está olhando. Tudo além da era é recorte opcional. */
export interface PosicaoNoMapa {
  eraId: EntityId;
  regionId?: EntityId;
  movimentoId?: EntityId;
  generoId?: EntityId;
  composerId?: EntityId;
}

/** O mínimo que o mapa precisa saber de uma era para ordenar o tempo. */
export interface EraDoMapa {
  id: EntityId;
  name: string;
  order: number;
}

/** O mínimo de uma região: em que eras ela tem presença. */
export interface RegiaoDoMapa {
  id: EntityId;
  name: string;
  eraIds: EntityId[];
}

// ---------------------------------------------------------------------------
// O eixo do tempo
// ---------------------------------------------------------------------------

export function erasEmOrdem(eras: EraDoMapa[]): EraDoMapa[] {
  return [...eras].sort((a, b) => a.order - b.order);
}

/**
 * Andar na linha do tempo.
 *
 * Nas pontas devolve `null`, e não a mesma era. Quem chama precisa distinguir
 * "não há para onde ir" de "fui e voltei ao mesmo lugar" — é isso que permite
 * desabilitar a seta em vez de deixá-la clicável sem efeito, que seria um
 * botão morto.
 */
export function navegarNoTempo(
  eras: EraDoMapa[],
  atual: EntityId,
  direcao: 'ANTES' | 'DEPOIS'
): EntityId | null {
  const ordenadas = erasEmOrdem(eras);
  const i = ordenadas.findIndex((e) => e.id === atual);
  if (i === -1) return null;

  const alvo = direcao === 'DEPOIS' ? i + 1 : i - 1;
  return ordenadas[alvo]?.id ?? null;
}

/**
 * As regiões que **se repovoam** nesta era.
 *
 * É a própria região que declara em que eras tem presença. Mostrar todas
 * sempre, com as vazias apagadas, sugeriria que falta conteúdo onde não falta:
 * o Brasil não tem Antiguidade musical documentada, e isso é o fato, não uma
 * lacuna do acervo.
 */
export function regioesDaEra(regioes: RegiaoDoMapa[], eraId: EntityId): RegiaoDoMapa[] {
  return regioes.filter((r) => r.eraIds.includes(eraId));
}

// ---------------------------------------------------------------------------
// Os marcadores
// ---------------------------------------------------------------------------

/**
 * A disponibilidade de um COMPOSITOR, derivada das obras dele.
 *
 * Um compositor "tem experiência" quando pelo menos uma obra dele pode ser
 * oferecida. Sem nenhuma, fica pontuado — com o motivo da situação dele, que
 * é o que explica o conjunto.
 *
 * Derivar em vez de declarar é o que impede a ficha do compositor de
 * prometer o que o compêndio dele não entrega.
 */
export function disponibilidadeDoCompositor(
  compositor: CanonicalComposer,
  obras: CanonicalWork[]
): DisponibilidadeNoConservatorio {
  const dele = obras.filter((o) => o.composerIds.includes(compositor.id));
  const tocavel = dele.find((o) => avaliarDisponibilidade(o).modo === 'EXPERIENCIA_COMPLETA');

  if (tocavel) {
    return {
      modo: 'EXPERIENCIA_COMPLETA',
      motivo: `${dele.length} obra(s) catalogada(s), com edição livre disponível.`,
      linkOficial: linkOficial(compositor.externalIds),
    };
  }

  return {
    modo: 'SOMENTE_CATALOGO',
    motivo:
      dele.length === 0
        ? 'Compositor catalogado. Nenhuma obra dele foi catalogada ainda.'
        : `${dele.length} obra(s) catalogada(s), nenhuma com edição livre disponível aqui.`,
    linkOficial: linkOficial(compositor.externalIds),
  };
}

function anos(c: CanonicalComposer): string | undefined {
  if (!c.birthYear && !c.deathYear) return undefined;
  return `${c.birthYear ?? '?'} – ${c.deathYear ?? '?'}`;
}

/**
 * Monta os marcadores de uma posição.
 *
 * A ordem dos recortes é a da pergunta que a pessoa faz: primeiro **quando**,
 * depois **onde**, depois **o quê**. Aplicar movimento antes de era daria um
 * mapa que muda de tempo sozinho ao trocar de filtro.
 */
interface AcervoDoMapa {
  compositores: CanonicalComposer[];
  obras: CanonicalWork[];
  movimentos: MusicalMovement[];
}

/**
 * Quem a posição alcança — sem teto nenhum.
 *
 * Separado de `marcadoresDaPosicao` porque duas perguntas diferentes precisam
 * da mesma conta: quantos plotar, e **quantos existem**. Recalcular por fora
 * faria as duas divergirem no dia em que um filtro mudasse.
 */
export function compositoresDaPosicao(
  posicao: PosicaoNoMapa,
  acervo: AcervoDoMapa
): CanonicalComposer[] {
  const { eraId, regionId, movimentoId, composerId } = posicao;
  const movimentoFoco = movimentoId
    ? acervo.movimentos.find((m) => m.id === movimentoId)
    : undefined;

  return acervo.compositores.filter((c) => {
    if (!c.periodIds.includes(eraId)) return false;
    if (regionId && !c.regionIds.includes(regionId)) return false;
    if (composerId && c.id !== composerId) return false;
    /**
     * Filtrar por movimento mostra **os fundadores e influentes dele** — é o
     * que a pergunta "quem fez este movimento" quer saber. Listar todo mundo
     * que viveu na mesma era e região devolveria o mapa inteiro de novo.
     */
    if (movimentoFoco && !movimentoFoco.founderComposerIds.includes(c.id)) return false;
    return true;
  });
}

/**
 * 🔴 O TETO DE PESSOAS NO MAPA — e por que ele não esconde ninguém.
 *
 * Emitir toda obra como marcador dava nove mil pontos, e isso já tinha sido
 * resolvido. Depois entraram os setecentos e oitenta e três compositores
 * brasileiros, e a era Moderna passou a emitir **duzentas e noventa e nove
 * pessoas**. Menos que nove mil, e ainda assim não é mapa: é uma lista de
 * nomes desenhada sobre uma imagem.
 *
 * O teto ordena por tamanho de compêndio — quem tem mais obra catalogada
 * aparece primeiro — e **quem sobra é contado**, por `pessoasNaoPlotadas`. A
 * tela diz o número e diz como chegar ao resto: escolher uma região, um
 * movimento ou um gênero. Nenhum nome sai do acervo; o que muda é quantos
 * cabem numa vista de longe.
 *
 * Um mapa que corta em silêncio é pior que um mapa cheio, porque quem olha
 * conclui que aquilo é tudo.
 */
export const TETO_DE_PESSOAS_NO_MAPA = 150;

export function pessoasNaoPlotadas(posicao: PosicaoNoMapa, acervo: AcervoDoMapa): number {
  return Math.max(0, compositoresDaPosicao(posicao, acervo).length - TETO_DE_PESSOAS_NO_MAPA);
}

export function marcadoresDaPosicao(
  posicao: PosicaoNoMapa,
  acervo: {
    compositores: CanonicalComposer[];
    obras: CanonicalWork[];
    movimentos: MusicalMovement[];
  }
): AtlasMarker[] {
  const { eraId, regionId, movimentoId, generoId, composerId } = posicao;

  const movimentosDaEra = acervo.movimentos.filter(
    (m) => m.eraId === eraId && (!regionId || m.regionIds.includes(regionId))
  );
  const movimentoFoco = movimentoId
    ? acervo.movimentos.find((m) => m.id === movimentoId)
    : undefined;

  const compositores = compositoresDaPosicao(posicao, acervo);

  /**
   * 🔴 A OBRA SÓ ENTRA NO MAPA QUANDO HÁ FOCO.
   *
   * O mapa emitia **toda obra da era** como marcador. No Romantismo isso dá
   * nove mil duzentos e quarenta e cinco pontos, e um mapa com nove mil pontos
   * não é um mapa — é uma lista desenhada em cima de uma imagem.
   *
   * Um mapa agrega quando se está longe e detalha quando se aproxima. Aqui a
   * distância é a **especificidade da posição**:
   *
   *   era, ou era + região   → *onde* e *quando*. Mostra movimentos e
   *                            compositores, cada um com a **contagem** do que
   *                            reúne. Nada se perde: o número está no marcador.
   *
   *   com compositor, movimento ou gênero → a pessoa escolheu **o que** olhar.
   *                            Aí as obras entram, e são poucas o bastante para
   *                            caber na tela.
   *
   * Região sozinha não abre as obras porque continua sendo *onde*: Brasil no
   * Romantismo mostra os compositores brasileiros com o compêndio contado, e
   * clicar num deles abre as obras dele.
   */
  const temFoco = !!composerId || !!movimentoId || !!generoId;

  const obras = temFoco
    ? acervo.obras.filter((o) => {
        if (o.periodId !== eraId) return false;
        if (regionId && o.regionId !== regionId) return false;
        if (generoId && o.generoId !== generoId) return false;
        if (composerId && !o.composerIds.includes(composerId)) return false;
        if (
          movimentoFoco &&
          !o.composerIds.some((c) => movimentoFoco.founderComposerIds.includes(c))
        ) {
          return false;
        }
        return true;
      })
    : [];

const deCompositores: AtlasMarker[] = compositores
    .map((c) => ({
      pessoa: c,
      quantas: acervo.obras.filter((o) => o.composerIds.includes(c.id)).length,
    }))
    /** Quem tem mais obra catalogada aparece primeiro. Empate: ordem alfabética. */
    .sort((a, b) => b.quantas - a.quantas || a.pessoa.sortName.localeCompare(b.pessoa.sortName, 'pt-BR'))
    .slice(0, TETO_DE_PESSOAS_NO_MAPA)
    .map(({ pessoa: c, quantas }) => ({
    id: c.id,
    kind: 'COMPOSITOR',
    titulo: c.canonicalName,
    subtitulo: anos(c),
    eraId,
    regionId: regionId ?? c.regionIds[0],
    movimentoIds: movimentosDaEra
      .filter((m) => m.founderComposerIds.includes(c.id))
      .map((m) => m.id),
    generoIds: [],
      disponibilidade: disponibilidadeDoCompositor(c, acervo.obras),
      contagem: quantas,
    }));

  const deObras: AtlasMarker[] = obras.map((o) => ({
    id: o.id,
    kind: 'OBRA',
    titulo: textoDe(o.canonicalTitle) ?? o.id,
    subtitulo: o.date,
    eraId,
    regionId: o.regionId,
    movimentoIds: [],
    generoIds: o.generoId ? [o.generoId] : [],
    disponibilidade: avaliarDisponibilidade(o),
    contagem: null,
  }));

  /**
   * O marcador de movimento não aparece quando já se está DENTRO dele: seria
   * um marcador que leva ao lugar onde a pessoa está.
   */
  const deMovimentos: AtlasMarker[] = movimentoFoco
    ? []
    : movimentosDaEra
        .filter((m) => !generoId || m.generoIds.includes(generoId))
        .map((m) => ({
          id: m.id,
          kind: 'MOVIMENTO' as const,
          titulo: m.name,
          subtitulo: m.years,
          eraId,
          regionId: regionId ?? m.regionIds[0],
          movimentoIds: [m.id],
          generoIds: m.generoIds,
          /**
           * Movimento é recorte de navegação, e não item de acervo: ele sempre
           * abre. O que pode ou não ser oferecido são as obras dentro dele.
           */
          disponibilidade: {
            modo: 'EXPERIENCIA_COMPLETA' as const,
            motivo: 'Recorte do mapa. O que se pode fazer depende de cada obra dentro dele.',
          },
          contagem: m.founderComposerIds.length,
        }));

  /**
   * Cada grupo em ordem alfabética, e os grupos na ordem de leitura do mapa:
   * movimento (o recorte mais largo), pessoa, obra.
   *
   * Os compositores já vêm ordenados por tamanho de compêndio, porque é isso
   * que o teto de plotagem escolhe — reordenar aqui desfaria a escolha e
   * plotaria outros. Alfabética se aplica a quem não passa por teto.
   */
  const alfabetica = (a: AtlasMarker, b: AtlasMarker) =>
    a.titulo.localeCompare(b.titulo, 'pt-BR');

  return [
    ...deMovimentos.sort(alfabetica),
    ...deCompositores,
    ...deObras.sort(alfabetica),
  ];
}

/**
 * Quantos marcadores de cada estado — para a legenda dizer a verdade.
 *
 * Uma legenda que declare "12 disponíveis" sobre um mapa de 40 marcadores diz
 * mais que um mapa colorido sem números, e impede a impressão de que tudo que
 * aparece é tocável.
 */
export function resumoDaVista(marcadores: AtlasMarker[]): {
  total: number;
  comExperiencia: number;
  apenasPontuados: number;
  comFonteOficial: number;
} {
  const apenas = marcadores.filter((m) => m.disponibilidade.modo === 'SOMENTE_CATALOGO');
  return {
    total: marcadores.length,
    comExperiencia: marcadores.length - apenas.length,
    apenasPontuados: apenas.length,
    comFonteOficial: apenas.filter((m) => m.disponibilidade.linkOficial).length,
  };
}
