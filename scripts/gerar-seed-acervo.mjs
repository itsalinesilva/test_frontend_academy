/**
 * O JSON EXTRAÍDO VIRA SEED DO CATÁLOGO.
 *
 * Roda depois de `extrair-acervo.mjs`. Lê o que veio das fontes, calcula o
 * domínio público pela regra brasileira e escreve
 * `src/data/seed-acervo-externo.ts`.
 *
 * POR QUE GERAR ARQUIVO, E NÃO CONSULTAR EM TEMPO DE EXECUÇÃO
 * ----------------------------------------------------------
 * O acervo é conteúdo publicado, e o produto é páginas estáticas sem banco.
 * Consultar o Open Opus a cada abertura de tela deixaria o catálogo refém da
 * rede de quem consulta e faria mau uso de um serviço mantido de graça.
 *
 * O arquivo é versionado: o acervo passa a ser **nosso**, corrigível, e
 * funciona offline. Reextrair é rodar os dois scripts de novo.
 *
 * O QUE É CALCULADO AQUI, E NÃO COPIADO
 * -------------------------------------
 * A situação de direito autoral. Ela vem da data de morte pela Lei 9.610/98,
 * art. 41 — setenta anos a partir de 1º de janeiro do ano seguinte —, e não do
 * que qualquer fonte declare. Compositor vivo entra no catálogo **marcado como
 * protegido**: o acervo registra a existência, e a legislação decide a
 * experiência.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const PRAZO = 70;
const HOJE = new Date();
const ANO = HOJE.getFullYear();

const entraEmDominioPublico = (morte) => morte + PRAZO + 1;

function situacao(morte, nascimento) {
  if (typeof morte === 'number') {
    const entra = entraEmDominioPublico(morte);
    return ANO >= entra
      ? { status: 'PUBLIC_DOMAIN', nota: `Em domínio público desde ${entra}.` }
      : { status: 'PROTECTED', nota: `Protegida até 31/12/${entra - 1}.` };
  }
  if (typeof nascimento === 'number' && ANO >= entraEmDominioPublico(nascimento + 100)) {
    return {
      status: 'LIKELY_PUBLIC_DOMAIN',
      nota: `Nascimento em ${nascimento} e morte não registrada. Confirmar antes de publicar.`,
    };
  }
  return {
    status: 'UNDETERMINED',
    nota: 'Sem data de morte registrada. O compositor pode estar vivo.',
  };
}

const esc = (s) =>
  s === undefined || s === null
    ? 'undefined'
    : `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ')}'`;

const dados = JSON.parse(readFileSync('scripts/.acervo-extraido.json', 'utf-8'));
mkdirSync('src/data/acervo', { recursive: true });

/**
 * O QUE O WIKIDATA DEU SOBRE CADA PESSOA.
 *
 * Cidadania, local de nascimento, local de morte e instrumento praticado — as
 * quatro propriedades que existem em registro de pessoa, conferidas contra a
 * API antes de virarem código. Ver `extrair-wikidata-compositor.mjs`.
 *
 * O Q-ID VAI PARA O SEED, E O MAPA DE REGIÃO FICA EM TYPESCRIPT
 * -----------------------------------------------------------
 * A tentação é resolver a região aqui e gravar só ela. Não se faz, porque
 * isso queimaria o dado bruto: mudar o mapa — separar a Itália, desdobrar a
 * Europa Oriental — passaria a exigir reextrair duzentos e vinte compositores.
 *
 * Gravando a cidadania, o mapa vira uma decisão de curadoria que se muda numa
 * linha, e que tem teste.
 */
let wikidata = { porCompositor: {}, rotulos: {} };
try {
  wikidata = JSON.parse(readFileSync('scripts/.wikidata-compositores.json', 'utf-8'));
} catch {
  console.warn('  ! sem scripts/.wikidata-compositores.json \u2014 regi\u00e3o e local ficar\u00e3o vazios');
}

const obrasPorCompositor = new Map();
for (const o of dados.obras) {
  const lista = obrasPorCompositor.get(o.composerId) ?? [];
  lista.push(o);
  obrasPorCompositor.set(o.composerId, lista);
}

/** O rótulo legível de um Q-id, para o que a ficha exibe. */
const rotulo = (q) => (q ? wikidata.rotulos[q] : undefined);

/** Lista de cadeias no formato do módulo, ou `[]`. */
const lista = (xs) => (xs && xs.length ? `[${xs.map(esc).join(', ')}]` : '[]');

const linhasCompositores = dados.compositores.map((c) => {
  const s = situacao(c.deathYear, c.birthYear);
  /**
   * Compositor sem registro no Wikidata entra com listas vazias, e não some.
   * Vazio se vê no filtro — ele simplesmente não participa do recorte.
   */
  const wd = wikidata.porCompositor[c.id] ?? { cidadanias: [], instrumentos: [] };
  const ids = Object.entries(c.externalIds)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${esc(v)}`)
    .join(', ');

  return `  {
    id: ${esc(c.id)},
    nome: ${esc(c.canonicalName)},
    ordenar: ${esc(c.sortName)},
    nascimento: ${c.birthYear ?? 'undefined'},
    morte: ${c.deathYear ?? 'undefined'},
    era: ${esc(c.periodId)},
    epoca: ${esc(c.epoch)},
    biografia: ${esc(c.biografiaPt)},
    retrato: ${esc(c.portraitUrl)},
    ids: { ${ids} },
    cidadanias: ${lista(wd.cidadanias)},
    nasceuEm: ${esc(rotulo(wd.nascimentoEm))},
    morreuEm: ${esc(rotulo(wd.morteEm))},
    instrumentos: ${lista((wd.instrumentos ?? []).map(rotulo).filter(Boolean))},
    situacao: ${esc(s.status)},
    nota: ${esc(s.nota)},
  },`;
});

/**
 * AS OBRAS NÃO ENTRAM NO MÓDULO.
 *
 * Vinte e cinco mil registros como código TypeScript deram um pacote de 7,1 MB
 * — e todo visitante baixaria o catálogo inteiro mesmo sem abrir o Acervo.
 *
 * Elas viram arquivo servido, buscado sob demanda e guardado em cache. Quem
 * nunca abre o catálogo não paga por ele; quem abre paga uma vez.
 *
 * Os compositores CONTINUAM no módulo: são duzentos e vinte, pesam pouco, e
 * são eles que alimentam contagem, filtro e o mapa do Atlas — coisas que
 * precisam estar prontas antes de qualquer busca.
 */
/**
 * A FONTE REPETE OBRAS, E A REPETIÇÃO ESTAVA SUMINDO EM SILêNCIO.
 *
 * Duzentos e quatro identificadores apareciam mais de uma vez — duzentos e
 * cinquenta e cinco registros. Todos são a **mesma obra digitada duas vezes**:
 * mesmo número de catálogo, mudando só acento, caixa ou espaço final.
 *
 *   "O Jesulein suss, o Jesulein mild, BWV.493"
 *   "O Jesulein süss, o Jesulein mild, BWV.493"
 *
 * O slug já colapsava as duas, porque ignora acento — mas colapsava por
 * acidente, num `Map.set` onde o último a chegar vencia. Acidente que dá o
 * resultado certo continua sendo acidente: aqui ele escolhia a grafia pior com
 * a mesma probabilidade com que escolhia a melhor.
 *
 * Agora é deliberado, e escolhe: vence o título com mais acento — grafia mais
 * completa é a menos corrompida na transmissão — e, empatando, o mais curto,
 * que é o sem espaço sobrando. Os identificadores das duas entradas ficam
 * guardados, porque a fonte conhece as duas e perder isso quebraria a volta à
 * origem.
 */
function acentos(t) {
  return [...t.normalize('NFD')].filter((c) => /[̀-ͯ]/.test(c)).length;
}

const obrasPorId = new Map();
for (const o of dados.obras) {
  const anterior = obrasPorId.get(o.id);
  if (!anterior) {
    obrasPorId.set(o.id, { ...o, title: o.title.trim(), outrosOpenOpus: [] });
    continue;
  }

  const melhor =
    acentos(o.title) > acentos(anterior.title) ||
    (acentos(o.title) === acentos(anterior.title) && o.title.trim().length < anterior.title.length)
      ? { ...o, title: o.title.trim() }
      : anterior;

  obrasPorId.set(o.id, {
    ...melhor,
    outrosOpenOpus: [
      ...new Set([...anterior.outrosOpenOpus, anterior.openOpusId, o.openOpusId]),
    ].filter((id) => id !== melhor.openOpusId),
  });
}

const obrasUnicas = [...obrasPorId.values()];
console.log(
  `  duplicatas da fonte colapsadas: ${dados.obras.length - obrasUnicas.length} (${dados.obras.length} → ${obrasUnicas.length})`
);

writeFileSync(
  'src/data/acervo/obras.json',
  JSON.stringify(
    obrasUnicas.map((o) => ({
      id: o.id,
      c: o.composerId,
      t: o.title,
      s: o.subtitle,
      /**
       * `m` é MEIO, e não gênero.
       *
       * A classificação da fonte — Keyboard, Orchestral, Chamber, Stage, Vocal
       * — responde "por onde sai o som", e não "como a obra se organiza". Ela
       * estava sendo gravada em `generoId`, e o filtro de gênero misturava
       * `vocal` com `minueto` como se fossem do mesmo tipo.
       *
       * `g` fica VAZIO até vir forma de verdade. Catálogo com o campo errado
       * preenchido é pior que campo vazio: o vazio se vê, o errado não.
       */
      m: o.meio,
      og: o.genreOpenOpus,
      e: o.periodId,
      oo: o.openOpusId,
      /** As outras entradas da fonte para a mesma obra. Volta à origem preservada. */
      oo2: o.outrosOpenOpus.length ? o.outrosOpenOpus : undefined,
      r: o.recomendada,
      p: o.popular,
    }))
  ),
  'utf-8'
);

const arquivo = `/**
 * O ACERVO EXTERNO, EXTRAÍDO E VERSIONADO.
 *
 * GERADO POR \`scripts/gerar-seed-acervo.mjs\`. Não editar à mão.
 *
 * De onde veio cada coisa:
 *
 *   **Open Opus** — nome canônico, datas, época e a lista de obras.
 *   **Wikidata** — biografia curta em português, retrato e os identificadores
 *   cruzados (IMSLP, MusicBrainz, Commons, VIAF, ISNI).
 *
 * A **situação de direito autoral é calculada aqui**, e não copiada de fonte
 * nenhuma: sai da data de morte pela Lei 9.610/98, art. 41 — setenta anos a
 * partir de 1º de janeiro do ano seguinte.
 *
 * Compositor vivo ou morto há menos que o prazo entra **marcado como
 * protegido**. O acervo registra a existência; a legislação decide a
 * experiência. Um catálogo acadêmico que escondesse o século XX estaria
 * mutilado.
 *
 * Extraído em ${HOJE.toISOString().slice(0, 10)}.
 */

export interface CompositorExterno {
  id: string;
  nome: string;
  ordenar: string;
  nascimento?: number;
  morte?: number;
  era?: string;
  epoca?: string;
  biografia?: string;
  retrato?: string;
  ids: Record<string, string>;
  /**
   * Os Estados de que a pessoa foi cidadã, como Q-id do Wikidata.
   *
   * Vem histórico e é correto: Bach é cidadão do Sacro Império, Mozart do
   * Arcebispado de Salzburgo. O bruto fica aqui, e \`wikidata-regions.ts\`
   * decide a região — mudar o mapa não exige reextrair nada.
   */
  cidadanias: string[];
  /** Cidade de nascimento, já legível. É conteúdo de ficha, e não filtro. */
  nasceuEm?: string;
  morreuEm?: string;
  /** O que a pessoa TOCAVA — distinto do meio para que escreveu. */
  instrumentos: string[];
  situacao: 'PUBLIC_DOMAIN' | 'PROTECTED' | 'LIKELY_PUBLIC_DOMAIN' | 'UNDETERMINED';
  nota: string;
}

/** Forma curta de propósito: são milhares de linhas, e o nome longo pesaria. */
export interface ObraExterna {
  id: string;
  /** compositor */ c: string;
  /** título */ t: string;
  /** subtítulo */ s?: string;
  /** gênero do Atlas */ g?: string;
  /** gênero como o Open Opus o nomeia */ og?: string;
  /** era */ e?: string;
  /** id no Open Opus */ oo?: string;
  /** recomendada pelo catálogo de origem */ r: boolean;
  /** popular */ p: boolean;
}

export const COMPOSITORES_EXTERNOS: CompositorExterno[] = [
${linhasCompositores.join('\n')}
];

/**
 * Quantas obras o arquivo servido tem.
 *
 * Está aqui para que a contagem do catálogo apareça **antes** de a lista
 * chegar — sem isso, a tela mostraria zero até o carregamento terminar, e zero
 * é a informação errada.
 */
export const TOTAL_DE_OBRAS_EXTERNAS = ${obrasUnicas.length};

/** As obras vivem em \`src/data/acervo/obras.json\`, buscadas sob demanda. */
export const CAMINHO_DAS_OBRAS = '/acervo/obras.json';
`;

writeFileSync('src/data/seed-acervo-externo.ts', arquivo, 'utf-8');

const porSituacao = {};
for (const c of dados.compositores) {
  const s = situacao(c.deathYear, c.birthYear).status;
  porSituacao[s] = (porSituacao[s] ?? 0) + 1;
}

console.log(`✓ src/data/seed-acervo-externo.ts  (compositores)`);
console.log(`✓ src/data/acervo/obras.json              (obras, sob demanda)`);
console.log(`  ${dados.compositores.length} compositores · ${obrasUnicas.length} obras`);
const comWd = dados.compositores.filter((c) => wikidata.porCompositor[c.id]);
console.log(
  `  com cidadania: ${comWd.filter((c) => wikidata.porCompositor[c.id].cidadanias.length).length}` +
    ` \u00b7 com local de nascimento: ${comWd.filter((c) => wikidata.porCompositor[c.id].nascimentoEm).length}` +
    ` \u00b7 com instrumento: ${comWd.filter((c) => wikidata.porCompositor[c.id].instrumentos.length).length}`
);
console.log(`  por situação: ${JSON.stringify(porSituacao)}`);
