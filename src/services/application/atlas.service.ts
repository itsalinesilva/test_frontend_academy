import { DEFAULT_ERAS, DEFAULT_REGIONS, DEFAULT_GENRES } from '../../data/seed-atlas';
import { SEED_MOVEMENTS } from '../../data/seed-movements';
import { todasAsObras, todosOsCompositores } from '../../data/acervo-unificado';
import {
  AtlasMarker,
  EraDoMapa,
  PosicaoNoMapa,
  RegiaoDoMapa,
  erasEmOrdem,
  marcadoresDaPosicao,
  navegarNoTempo,
  regioesDaEra,
  resumoDaVista,
} from '../../domain/atlas-map';
import { CanonicalComposer, CanonicalWork } from '../../domain/music-knowledge';
import { resolverInstrumento } from '../../domain/catalog-vocabulary';
import { DEFAULT_HOUSES } from '../../data/seed-houses';

/**
 * O ATLAS É UM MAPA — e o mapa lê o MESMO catálogo que a biblioteca.
 *
 * 🔴 AS DUAS TELAS LIAM ACERVOS DIFERENTES
 * ----------------------------------------
 * O Atlas contava **dezessete obras**. O Acervo contava **vinte e quatro mil
 * novecentas e cinquenta e sete**. Não era defasagem de cache: eram duas
 * fontes. `atlas.repository` lia `DEFAULT_WORKS`, projeção do repertório
 * próprio, e o Acervo lia o catálogo canônico.
 *
 * Duas verdades sobre o mesmo acervo é pior que uma verdade incompleta: quem
 * visse o mapa concluiria que o Conservatório tem dezessete obras, e quem visse
 * a biblioteca concluiria outra coisa — e as duas telas estariam "certas".
 *
 * Este serviço existe para que haja **uma fonte**. O mapa é uma **vista** dela.
 *
 * O QUE O MAPA É, E O QUE A BIBLIOTECA É
 * --------------------------------------
 * **Atlas** é exploração: marcadores, indicadores, métricas. Informação
 * simplificada e útil, navegável no tempo e no espaço. Você vê *onde* e
 * *quando* as coisas estão, e quanto há em cada ponto.
 *
 * **Acervo** é consulta: ficha completa, busca, filtro fino, leitura.
 *
 * Não são a mesma experiência, e **são a mesma verdade**. Clicar num marcador
 * do mapa abre a ficha na biblioteca, pelo mesmo identificador canônico.
 */

/** Uma Casa na vista do mapa: quanto ela recorta aqui, e por que não recorta. */
export interface CasaNoMapa {
  id: string;
  nome: string;
  quantos: number;
  recorta: boolean;
  motivo?: string;
}

export interface VistaDoMapa {
  posicao: PosicaoNoMapa;
  /** As eras em ordem cronológica, para o eixo do tempo. */
  eras: EraDoMapa[];
  /** Só as regiões com presença NA ERA ATUAL. Elas repovoam ao andar no tempo. */
  regioes: RegiaoDoMapa[];
  marcadores: AtlasMarker[];
  /**
   * Os indicadores da vista — é o que faz o mapa informar sem obrigar a ler.
   *
   * `apenasPontuados` não é um defeito a esconder: são os marcadores que o
   * acervo registra e não pode oferecer como experiência, quase sempre por
   * prazo de direito autoral. O mapa **mostra** que eles existem.
   */
  indicadores: {
    total: number;
    comExperiencia: number;
    apenasPontuados: number;
    comFonteOficial: number;
  };
  /** Para onde o eixo do tempo pode andar. `null` nas pontas, e não a própria era. */
  eraAnterior: EraDoMapa | null;
  eraSeguinte: EraDoMapa | null;
}

export class AtlasService {
  private compositores: CanonicalComposer[] | null = null;
  private obras: CanonicalWork[] | null = null;

  /**
   * O catálogo, carregado uma vez por sessão.
   *
   * As obras vivem em arquivo servido e chegam sob demanda. O mapa precisa
   * delas para contar o compêndio de cada compositor — sem isso, o marcador
   * diria "Bach" sem dizer quanto há de Bach, que é metade do que um mapa faz.
   */
  private async catalogo() {
    if (!this.compositores || !this.obras) {
      this.compositores = todosOsCompositores();
      this.obras = await todasAsObras();
    }
    return { compositores: this.compositores, obras: this.obras, movimentos: SEED_MOVEMENTS };
  }

  /** A era em que o mapa abre: a primeira que tem algum marcador. */
  public async eraInicial(): Promise<string> {
    const ordenadas = erasEmOrdem(DEFAULT_ERAS);
    const acervo = await this.catalogo();

    for (const e of ordenadas) {
      if (marcadoresDaPosicao({ eraId: e.id }, acervo).length > 0) return e.id;
    }
    /**
     * Nenhuma era com marcador significa catálogo vazio, e não erro. O mapa
     * abre na primeira e mostra o vazio — que é informação.
     */
    return ordenadas[0]?.id ?? '';
  }

  /**
   * A CASA RECORTA O MAPA, e não é só um rótulo.
   *
   * Casa é gente: violinistas, pianistas, cantores. Escolher uma mostra **quem
   * tocava aquele instrumento** naquela era — que é a pergunta que o aluno faz
   * de verdade, e que nenhum outro recorte do mapa responde.
   *
   * O cruzamento passa pelo vocabulário: a fonte grava `violino`, `piano`,
   * `guitarra`, e `resolverInstrumento` leva os três ao identificador do
   * catálogo. Comparar as cadeias direto faria "guitarra" nunca casar com a
   * Casa dos violonistas.
   *
   * Casa sem instrumento declarado — historiadores, teóricos — não recorta, e
   * a interface diz isso em vez de oferecer um controle que não faz nada.
   */
  private recortarPelaCasa(marcadores: AtlasMarker[], houseId: string | undefined, acervo: {
    compositores: CanonicalComposer[];
  }): AtlasMarker[] {
    if (!houseId) return marcadores;

    const casa = DEFAULT_HOUSES.find((h) => h.id === houseId);
    if (!casa?.instrumentoId) return marcadores;

    const tocam = new Set(
      acervo.compositores
        .filter((c) =>
          (c.instrumentosPraticados ?? []).some(
            (g) => resolverInstrumento(g) === casa.instrumentoId
          )
        )
        .map((c) => c.id)
    );

    /**
     * Movimento sai da vista quando há Casa escolhida: ele agrupa por corrente
     * estética, e a pergunta aqui é de instrumento. Deixá-lo faria o mapa
     * responder a duas perguntas ao mesmo tempo, e nenhuma bem.
     */
    return marcadores.filter((m) => m.kind === 'COMPOSITOR' && tocam.has(m.id));
  }

  /** Tudo que a tela precisa para desenhar uma posição do mapa. */
  public async vista(posicao: PosicaoNoMapa, houseId?: string): Promise<VistaDoMapa> {
    const acervo = await this.catalogo();
    const eras = erasEmOrdem(DEFAULT_ERAS);
    const marcadores = this.recortarPelaCasa(marcadoresDaPosicao(posicao, acervo), houseId, acervo);

    return {
      posicao,
      eras,
      /**
       * As regiões REPOVOAM ao andar no tempo.
       *
       * É o comportamento que faz o Atlas ser mapa e não lista: a Escandinávia
       * não existe no mapa do Renascimento, e aparece no do Romantismo.
       */
      regioes: regioesDaEra(DEFAULT_REGIONS, posicao.eraId),
      marcadores,
      indicadores: resumoDaVista(marcadores),
      /**
       * `null` nas pontas, e não a própria era: uma seta que não anda é pior
       * que seta ausente — quem clica conclui que a tela travou.
       */
      eraAnterior: eras.find((e) => e.id === navegarNoTempo(eras, posicao.eraId, 'ANTES')) ?? null,
      eraSeguinte: eras.find((e) => e.id === navegarNoTempo(eras, posicao.eraId, 'DEPOIS')) ?? null,
    };
  }

  /**
   * Os gêneros que a era de fato tem, com contagem.
   *
   * Oferecido a partir dos marcadores, e não de `DEFAULT_GENRES` inteiro: um
   * recorte que devolve vazio ensina a desconfiar de todos os filtros.
   */
  public async generosDaEra(eraId: string): Promise<Array<{ id: string; nome: string; quantos: number }>> {
    const acervo = await this.catalogo();
    const marcadores = marcadoresDaPosicao({ eraId }, acervo);

    const conta = new Map<string, number>();
    for (const m of marcadores) {
      for (const g of m.generoIds) conta.set(g, (conta.get(g) ?? 0) + 1);
    }

    return [...conta.entries()]
      .map(([id, quantos]) => ({
        id,
        nome: DEFAULT_GENRES.find((g) => g.slug === id || g.id === id)?.name ?? id,
        quantos,
      }))
      .sort((a, b) => b.quantos - a.quantos);
  }

  /**
   * As Casas, com o que cada uma recorta NESTA era.
   *
   * A contagem vem antes do clique: "Violinistas (12)" e "Violinistas" pedem
   * decisões diferentes, e uma Casa que devolve zero naquela era não deve ser
   * oferecida como se fosse levar a algum lugar.
   */
  public async casasDaEra(eraId: string): Promise<CasaNoMapa[]> {
    const acervo = await this.catalogo();
    const base = marcadoresDaPosicao({ eraId }, acervo);

    return DEFAULT_HOUSES.map((h) => {
      if (!h.instrumentoId) {
        return {
          id: h.id,
          nome: h.name,
          quantos: 0,
          recorta: false,
          motivo: 'Esta Casa n\u00e3o se organiza por instrumento, e ainda n\u00e3o recorta o mapa.',
        };
      }
      const quantos = this.recortarPelaCasa(base, h.id, acervo).length;
      return {
        id: h.id,
        nome: h.name,
        quantos,
        recorta: quantos > 0,
        motivo: quantos === 0 ? 'Nenhuma pessoa desta Casa tem obra nesta era.' : undefined,
      };
    });
  }

  /**
   * A ROTA DO MARCADOR PARA A FICHA — a ponte entre o mapa e a biblioteca.
   *
   * Clicar em Mozart no mapa abre a ficha de Mozart na biblioteca, **pelo mesmo
   * identificador canônico**. É isso que faz as duas telas serem vistas de um
   * catálogo só, em vez de dois catálogos parecidos.
   *
   * Movimento não tem ficha própria ainda, e por isso volta ao Acervo filtrado
   * por ele — o que é honesto: leva ao que existe, em vez de a uma tela vazia.
   */
  public rotaDoMarcador(m: AtlasMarker): string {
    if (m.kind === 'COMPOSITOR') return `/acervo/compositor/${m.id}`;
    if (m.kind === 'OBRA') return `/acervo/obra/${m.id}`;
    return `/acervo?movimento=${m.id}`;
  }

  /**
   * Quanto o mapa enxerga do catálogo.
   *
   * Existe para ser comparado com o total da biblioteca. Enquanto as duas telas
   * lerem fontes diferentes, este número denuncia — e foi por não haver
   * comparação que dezessete passaram por vinte e cinco mil.
   */
  public async cobertura(): Promise<{ obras: number; compositores: number; comRegiao: number }> {
    const { compositores, obras } = await this.catalogo();
    return {
      obras: obras.length,
      compositores: compositores.length,
      comRegiao: compositores.filter((c) => c.regionIds.length > 0).length,
    };
  }
}

export const atlasService = new AtlasService();
