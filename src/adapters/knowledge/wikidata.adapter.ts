import {
  ComposerCandidate,
  Fetcher,
  KnowledgeAdapter,
  KnowledgeSourceError,
  WorkCandidate,
} from './knowledge-source.interface';
import { KnowledgeSource } from '../../domain/music-knowledge';

/**
 * WIKIDATA — o eixo de reconciliação.
 *
 * POR QUE ELE É O HUB, E NÃO MAIS UMA FONTE
 * -----------------------------------------
 * A mesma obra existe sob identidades incompatíveis: um título de página no
 * IMSLP, um UUID no MusicBrainz, um número interno no Open Opus. Sem um eixo,
 * cada tela inventa a própria chave — e foi assim que `bwv-1001` apareceu
 * cravado dentro de um componente.
 *
 * O Wikidata carrega as **referências cruzadas**: uma consulta resolve IMSLP,
 * MusicBrainz e Commons de uma vez, e ainda devolve o rótulo em português.
 *
 * Propriedades usadas, verificadas na especificação `21.1 §4.2`:
 *
 *   P31/P106  tipo e ocupação — para achar compositores, e não homônimos
 *   P86       compositor de uma obra
 *   P569/P570 nascimento e **morte** — base do cálculo de domínio público
 *   P839      identificador no IMSLP
 *   P435      identificador de obra no MusicBrainz
 *   P373      categoria no Commons
 *   P18       imagem
 *
 * CORS ABERTO, SEM CHAVE, SEM PROXY
 * ---------------------------------
 * O endpoint aceita `origin=*`. Isso importa para a arquitetura: nada aqui
 * precisa de servidor, e o produto continua sendo páginas estáticas sem banco
 * de dados.
 *
 * O QUE ESTE ADAPTADOR NÃO FAZ
 * ----------------------------
 * Não decide domínio público, não escreve no acervo e não resolve conflito
 * com outra fonte. Devolve candidato com a data de morte que encontrou, e o
 * `MusicKnowledgeService` decide o resto — porque decidir exige ver as fontes
 * lado a lado.
 */

const ENDPOINT = 'https://query.wikidata.org/sparql';

/**
 * O agente é exigência de etiqueta do serviço, e não enfeite.
 *
 * Consulta sem identificação é bloqueada, e com razão: é assim que quem
 * mantém o serviço consegue falar com quem o está usando demais.
 */
const AGENTE = 'ConservatorioMuscicapa/1.0 (plataforma educacional)';

interface SparqlBinding {
  [chave: string]: { value: string; type: string } | undefined;
}

/** O identificador curto de uma URI do Wikidata: `.../Q1339` → `Q1339`. */
export function qIdDe(uri: string): string | undefined {
  const m = uri.match(/\/(Q\d+)$/);
  return m ? m[1] : undefined;
}

/** O ano de uma data do Wikidata, que vem como `1750-07-28T00:00:00Z`. */
export function anoDe(data: string | undefined): number | undefined {
  if (!data) return undefined;
  const m = data.match(/^(-?\d{1,4})-/);
  if (!m) return undefined;
  const ano = Number(m[1]);
  return Number.isFinite(ano) ? ano : undefined;
}

export class WikidataAdapter implements KnowledgeAdapter {
  public readonly source: KnowledgeSource = 'WIKIDATA';

  constructor(
    private readonly buscar: Fetcher = fetch,
    private readonly endpoint: string = ENDPOINT
  ) {}

  private async consultar(sparql: string): Promise<SparqlBinding[]> {
    const url = `${this.endpoint}?format=json&origin=*&query=${encodeURIComponent(sparql)}`;

    let resposta: Response;
    try {
      resposta = await this.buscar(url, {
        headers: { Accept: 'application/sparql-results+json', 'Api-User-Agent': AGENTE },
      });
    } catch (e) {
      throw new KnowledgeSourceError('WIKIDATA', 'a consulta não chegou ao serviço', e);
    }

    if (!resposta.ok) {
      throw new KnowledgeSourceError(
        'WIKIDATA',
        `o serviço respondeu ${resposta.status}`,
        resposta.status
      );
    }

    /**
     * Resposta malformada é erro de FONTE, e não acervo vazio.
     *
     * Devolver `[]` aqui faria o acervo "perder" obras toda vez que o serviço
     * oscilasse, sem ninguém perceber — e o relatório diria que não há obras,
     * quando o que não houve foi resposta.
     */
    try {
      const json = (await resposta.json()) as { results?: { bindings?: SparqlBinding[] } };
      return json.results?.bindings ?? [];
    } catch (e) {
      throw new KnowledgeSourceError('WIKIDATA', 'a resposta não era JSON de SPARQL', e);
    }
  }

  public async disponivel(): Promise<boolean> {
    try {
      await this.consultar('SELECT ?x WHERE { BIND(1 AS ?x) } LIMIT 1');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Compositores pelo nome.
   *
   * `P106 wd:Q36834` é "ocupação: compositor". Sem esse recorte, buscar
   * "Bach" devolveria a cidade, o cratera lunar e o asteroide — o Wikidata
   * descreve o mundo, e não só música.
   */
  public async buscarCompositores(termo: string, limite = 10): Promise<ComposerCandidate[]> {
    const escapado = termo.replace(/["\\]/g, ' ').trim();
    if (!escapado) return [];

    const sparql = `
      SELECT ?p ?pLabel ?nasc ?morte ?imslp ?mb ?commons ?img ?localNasc ?localNascLabel WHERE {
        ?p wdt:P106 wd:Q36834 .
        ?p rdfs:label ?pLabel .
        FILTER(CONTAINS(LCASE(?pLabel), LCASE("${escapado}")))
        FILTER(LANG(?pLabel) IN ("pt", "pt-br", "en"))
        OPTIONAL { ?p wdt:P569 ?nasc }
        OPTIONAL { ?p wdt:P570 ?morte }
        OPTIONAL { ?p wdt:P839 ?imslp }
        OPTIONAL { ?p wdt:P434 ?mb }
        OPTIONAL { ?p wdt:P373 ?commons }
        OPTIONAL { ?p wdt:P18 ?img }
        OPTIONAL { ?p wdt:P19 ?localNasc }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "pt-br,pt,en" }
      }
      LIMIT ${Math.max(1, Math.min(50, limite))}
    `;

    const linhas = await this.consultar(sparql);
    return this.dedupePorQId(linhas.map((b) => this.comoCompositor(b)));
  }

  private comoCompositor(b: SparqlBinding): ComposerCandidate {
    const qid = qIdDe(b.p?.value ?? '');
    const nome = b.pLabel?.value ?? '';

    return {
      name: nome,
      /** "Johann Sebastian Bach" → "Bach, Johann Sebastian". */
      sortName: nome.includes(' ')
        ? `${nome.slice(nome.lastIndexOf(' ') + 1)}, ${nome.slice(0, nome.lastIndexOf(' '))}`
        : nome,
      birthYear: anoDe(b.nasc?.value),
      deathYear: anoDe(b.morte?.value),
      birthPlace: b.localNascLabel?.value,
      portraitUrl: b.img?.value,
      externalIds: {
        wikidata: qid,
        imslp: b.imslp?.value,
        musicbrainz: b.mb?.value,
        commonsCategory: b.commons?.value,
      },
      /**
       * Confiança pela COMPLETUDE do que voltou.
       *
       * Um registro com data de morte e identificadores cruzados é uma
       * identidade resolvida; um com só o nome é um palpite. Tratar os dois
       * como iguais faria o serviço reconciliar sobre ruído.
       */
      confidence: b.morte?.value ? 1 : b.nasc?.value ? 0.7 : 0.4,
    };
  }

  /** Duas linhas SPARQL do mesmo Q-id são rótulos diferentes, e não pessoas diferentes. */
  private dedupePorQId(candidatos: ComposerCandidate[]): ComposerCandidate[] {
    const porId = new Map<string, ComposerCandidate>();
    const semId: ComposerCandidate[] = [];

    for (const c of candidatos) {
      const id = c.externalIds.wikidata;
      if (!id) {
        semId.push(c);
        continue;
      }
      const atual = porId.get(id);
      // fica o mais completo, que e o de maior confianca
      if (!atual || c.confidence > atual.confidence) porId.set(id, c);
    }
    return [...porId.values(), ...semId];
  }

  /**
   * Obras de um compositor, pelo Q-id dele.
   *
   * A consulta exige `P839` — obra com página no IMSLP. Não é preciosismo: é
   * o recorte que separa obra catalogada de menção solta, e é o que a
   * especificação valida com um retorno real.
   */
  public async buscarObrasDoCompositor(qid: string, limite = 50): Promise<WorkCandidate[]> {
    if (!/^Q\d+$/.test(qid)) {
      throw new KnowledgeSourceError('WIKIDATA', `"${qid}" não é um identificador do Wikidata`);
    }

    const sparql = `
      SELECT ?w ?wLabel ?imslp ?mb ?data ?generoLabel WHERE {
        ?w wdt:P86 wd:${qid} ;
           wdt:P839 ?imslp .
        OPTIONAL { ?w wdt:P435 ?mb }
        OPTIONAL { ?w wdt:P571 ?data }
        OPTIONAL { ?w wdt:P136 ?genero }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "pt-br,pt,en" }
      }
      LIMIT ${Math.max(1, Math.min(200, limite))}
    `;

    const linhas = await this.consultar(sparql);
    return linhas.map((b) => ({
      titlePt: b.wLabel?.value,
      date: b.data?.value ? String(anoDe(b.data.value) ?? '') : undefined,
      genre: b.generoLabel?.value,
      instrumentation: [],
      movements: [],
      externalIds: {
        wikidata: qIdDe(b.w?.value ?? ''),
        imslp: b.imslp?.value,
        musicbrainz: b.mb?.value,
      },
      confidence: b.mb?.value ? 1 : 0.8,
    }));
  }
}
