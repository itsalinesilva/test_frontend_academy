/**
 * O CORPUS BRASILEIRO VIRA CATÁLOGO.
 *
 * Roda depois de `extrair-musica-brasilis.mjs`. Converte o que foi lido em
 * compositores e obras do acervo, **no mesmo formato que o catálogo ocidental
 * já usa** — `CompositorExterno` e obra compacta —, para que nada no sistema
 * precise saber que existem duas fontes.
 *
 * A REGRA QUE VALE AQUI, E POR QUE ELA É DIFERENTE
 * ------------------------------------------------
 * A ontologia diz que **fonte externa enriquece, e não cria** — foi assim que
 * mil trezentas e trinta e uma partituras deixaram de virar obras falsas.
 *
 * Para o Brasil a regra se aplica ao contrário, e de propósito. Música Brasilis
 * não é uma fonte de recurso sobre um acervo que já existe: ela **é** o
 * catálogo do repertório brasileiro, do mesmo jeito que o Open Opus é o do
 * ocidental. Recusá-la como criadora de entidade deixaria o Brasil com os
 * quatro nomes que atravessaram para o catálogo do concerto europeu — que é
 * exatamente a distorção que este trabalho existe para corrigir.
 *
 * O que continua valendo sem exceção: **nenhuma obra nasce sem compositor
 * nomeado**, e nada entra sem proveniência.
 *
 * FICHA SIM, ARQUIVO NÃO
 * ----------------------
 * O `robots.txt` da fonte proíbe `/media/`, onde vivem PDF e imagens. Cada
 * obra guarda o **link para a página dela na fonte**, que é onde o download
 * acontece — e o retrato do compositor não é usado, porque exibi-lo seria
 * hospedar-se na banda de quem pediu para não rastrearem aquele diretório.
 *
 * DOIS ARQUIVOS, E POR QUÊ
 * ------------------------
 * Os compositores saem em TypeScript, como os duzentos e vinte e cinco do
 * catálogo ocidental: são poucos, são a entidade, e o resto do sistema os lê
 * de forma síncrona. As obras saem em JSON, importado sob demanda: são quase
 * sete mil, e só viajam quando alguém abre o acervo.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const dados = JSON.parse(readFileSync('scripts/.musica-brasilis.json', 'utf-8'));

/**
 * AS BIOGRAFIAS, quando já foram colhidas.
 *
 * Vêm de `extrair-brasilis-fichas.mjs`, que lê a página de cada compositor —
 * a listagem não traz biografia, só nome e datas.
 *
 * Ausência aqui não impede gerar: os compositores entram com o que se sabe, e
 * a ficha fica sem o texto. O que não se faz é inventar um resumo a partir das
 * datas, que é o tipo de preenchimento que transforma catálogo em ficção.
 */
let fichas = new Map();
try {
  const lidas = JSON.parse(readFileSync('scripts/.brasilis-fichas.json', 'utf-8'));
  fichas = new Map(lidas.filter((f) => f.biografia).map((f) => [f.idNaFonte, f.biografia]));
  console.log(`  biografias disponíveis: ${fichas.size}`);
} catch {
  console.log('  sem biografias colhidas ainda — rode scripts/extrair-brasilis-fichas.mjs');
}

const HOJE = new Date().getFullYear();

const semAcento = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const idLegivel = (nome) =>
  semAcento(nome)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * A chave de identidade: nome sem acento, sem pontuação, com as palavras
 * ORDENADAS.
 *
 * É a ordenação que faz `Heitor Villa-Lobos` e `Villa-Lobos, Heitor` caírem na
 * mesma chave. Sem ela, os quatro brasileiros que já estão no acervo pelo
 * catálogo ocidental entrariam de novo — e o Brasil ganharia dois Villa-Lobos,
 * repetindo o defeito que acabou de ser corrigido em nove compositores.
 *
 * A fusão em si **não acontece aqui**: acontece em `todosOsCompositores`, que
 * já resolve identidade por esta mesma chave. Aqui a chave serve só para não
 * duplicar dentro da própria fonte.
 */
const chaveDeIdentidade = (nome) =>
  semAcento(nome)
    .replace(/[^a-z ]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .sort()
    .join(' ');

/**
 * A era pela data de morte, ou de nascimento quando não há morte.
 *
 * O recorte é o das sete eras do curso. Sem data nenhuma, **fica sem era** — e
 * não numa era provável, que seria afirmar uma datação que ninguém fez.
 */
function eraDe(nascimento, morte) {
  const ano = morte ?? (nascimento ? nascimento + 60 : undefined);
  if (!ano) return undefined;
  if (ano < 1400) return 'era_medieval';
  if (ano < 1600) return 'era_renascimento';
  if (ano < 1750) return 'era_barroco';
  if (ano < 1820) return 'era_classicismo';
  if (ano < 1910) return 'era_romantismo';
  if (ano < 1975) return 'era_moderna';
  return 'era_contemporanea';
}

/**
 * A regra brasileira de domínio público: Lei 9.610/98, art. 41.
 *
 * Setenta anos a contar de 1º de janeiro do ano SEGUINTE ao da morte — por
 * isso `morte + 71`, e não `+ 70`. Sem data de morte não se afirma nada.
 *
 * 🔴 ISTO É O QUE TORNAVA A DATA ERRADA CARA.
 *
 * A primeira extração leu o selo de datas do cartão **anterior**, e deu a cada
 * compositor os anos do vizinho. Francisco Mignone, que morreu em 1986, saiu
 * como morto em 1923 — e por esta função a obra dele teria sido declarada
 * livre, quando está protegida até 2057. O leitor foi corrigido e as datas
 * agora são conferidas contra a página do próprio compositor.
 */
function situacao(morte) {
  if (!morte) {
    return {
      status: 'UNDETERMINED',
      nota: 'Sem data de morte registrada na fonte, não dá para afirmar que está em domínio público.',
    };
  }
  if (morte + 71 <= HOJE) {
    return {
      status: 'PUBLIC_DOMAIN',
      nota: `Domínio público no Brasil: morte em ${morte}, prazo de 70 anos a partir de 1º de janeiro de ${morte + 1}.`,
    };
  }
  return {
    status: 'PROTECTED',
    nota: `Protegida até 1º de janeiro de ${morte + 71}, pela Lei 9.610/98, art. 41.`,
  };
}

// ---------------------------------------------------------------------------
// Os compositores
// ---------------------------------------------------------------------------

const compositores = new Map();

for (const c of dados.compositores) {
  const s = situacao(c.morte);
  const partes = c.nome.split(' ');
  compositores.set(chaveDeIdentidade(c.nome), {
    id: 'mb-' + idLegivel(c.nome),
    nome: c.nome,
    ordenar: partes.length > 1 ? partes.slice(-1)[0] + ', ' + partes.slice(0, -1).join(' ') : c.nome,
    nascimento: c.nascimento,
    morte: c.morte,
    era: eraDe(c.nascimento, c.morte),
    biografia: fichas.get(c.idNaFonte),
    ids: { musicaBrasilis: c.idNaFonte, musicaBrasilisUrl: c.url },
    /**
     * A CIDADANIA DECLARADA É A BRASILEIRA, e é isso que dá a região.
     *
     * `Q155` é o Brasil no Wikidata, e `wikidata-regions.ts` o traduz para
     * `reg_brasil`. Escrever a região direto pularia o mapa e faria este
     * arquivo decidir geografia, que não é trabalho dele.
     *
     * O que se afirma com isto é **atuação no Brasil**, e não nascimento: a
     * fonte cataloga música brasileira, e nela há italianos que compuseram
     * aqui. O lugar de nascimento fica vazio justamente porque a fonte não o
     * declara na listagem — e vazio é mais honesto que suposto.
     */
    cidadanias: ['Q155'],
    instrumentos: [],
    situacao: s.status,
    nota: s.nota,
    fonte: 'MUSICA_BRASILIS',
  });
}

/**
 * Nem toda partitura aponta para um compositor da listagem.
 *
 * A listagem de compositores tem setecentos e cinquenta e seis; as partituras
 * nomeiam quem assina cada uma, e há nomes ali sem página própria. Eles entram
 * assim mesmo, com o que a partitura declara — e o que não se sabe fica vazio,
 * inclusive a situação de direito autoral, que sem data de morte é
 * INDETERMINADA e não "provavelmente livre".
 */
for (const p of dados.partituras) {
  if (!p.compositor) continue;
  const chave = chaveDeIdentidade(p.compositor);
  if (compositores.has(chave)) continue;

  const s = situacao(undefined);
  compositores.set(chave, {
    id: 'mb-' + idLegivel(p.compositor),
    nome: p.compositor,
    ordenar: p.compositor,
    ids: {},
    cidadanias: ['Q155'],
    instrumentos: [],
    situacao: s.status,
    nota: s.nota,
    fonte: 'MUSICA_BRASILIS',
  });
}

// ---------------------------------------------------------------------------
// As obras
// ---------------------------------------------------------------------------

/**
 * 🔴 NENHUMA OBRA NASCE SEM COMPOSITOR NOMEADO.
 *
 * É a única regra da ontologia que não tem exceção nem para o Brasil. Uma das
 * seis mil novecentas e dezoito partituras não nomeia quem a assina, e ela
 * fica de fora — não vira obra anônima com a autoria em branco.
 */
const semAutoria = dados.partituras.filter((p) => !p.compositor);

const obras = dados.partituras
  .filter((p) => p.compositor)
  .map((p) => {
    const c = compositores.get(chaveDeIdentidade(p.compositor));
    return {
      id: 'mb-obra-' + p.idNaFonte,
      c: c.id,
      t: p.titulo,
      /** O meio, como a fonte o nomeia. O vocabulário controlado resolve depois. */
      i: p.instrumentos ?? [],
      e: c.era,
      /**
       * O ENDEREÇO DA PARTITURA — que é o motivo de esta fonte entrar.
       *
       * Toda obra daqui chega **com a página da edição dela**. É o oposto das
       * mil cento e sessenta e nove edições de outra fonte que não acharam
       * obra: aqui a obra e a edição nascem juntas e já ligadas.
       *
       * O link é para a PÁGINA, e não para o arquivo: `/media/` é proibido
       * pelo `robots.txt` da fonte, e o download acontece lá.
       */
      u: p.url,
    };
  });

// ---------------------------------------------------------------------------
// Não-vacuidade
// ---------------------------------------------------------------------------

if (obras.length < 6000 || compositores.size < 700) {
  console.error(
    `\n✗ leitura insuficiente: ${obras.length} obras e ${compositores.size} compositores.` +
      ' A extração declarou 6.918 partituras e 756 compositores — menos que isso significa que a conversão quebrou, e gravar seria pior que não gravar.'
  );
  process.exit(1);
}

const comData = [...compositores.values()].filter((c) => c.morte).length;
if (comData < 400) {
  console.error(
    `\n✗ só ${comData} compositores com data de morte. A extração corrigida encontrou 452.` +
      ' Menos que isso é sinal de que o leitor de datas regrediu — e data de morte errada declara livre o que está protegido.'
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------

const lista = [...compositores.values()].sort((a, b) => a.ordenar.localeCompare(b.ordenar, 'pt-BR'));

const cabecalho = `/**
 * O CORPUS BRASILEIRO, EXTRAÍDO E VERSIONADO.
 *
 * GERADO POR \`scripts/gerar-seed-brasilis.mjs\`. Não editar à mão.
 *
 * Fonte: **Música Brasilis** (musicabrasilis.org.br), que aqui é fonte
 * PRIMÁRIA e não complemento. O Brasil aparecia neste acervo com quatro
 * compositores — Villa-Lobos, Carlos Gomes, Camargo Guarnieri e Francisco
 * Mignone — não porque o repertório seja pequeno, mas porque a catalogação de
 * origem é do concerto ocidental e cobre o Brasil pelos poucos nomes que
 * atravessaram.
 *
 * O que vem daqui: nome, datas quando a fonte as declara, e o link da ficha.
 * O que NÃO vem: retrato e arquivo, porque o \`robots.txt\` da fonte proíbe
 * \`/media/\`, que é onde os dois vivem.
 *
 * A **situação de direito autoral é calculada**, e não copiada: sai da data de
 * morte pela Lei 9.610/98, art. 41. Sem data de morte a situação é
 * INDETERMINADA — e não "provavelmente livre", que seria um palpite com
 * consequência jurídica.
 *
 * Extraído em ${new Date().toISOString().slice(0, 10)}.
 */
import { CompositorExterno } from './seed-acervo-externo';

/** As obras vivem em \`acervo/brasilis.json\`, importadas sob demanda. */
export const COMPOSITORES_BRASILIS: CompositorExterno[] = `;

writeFileSync(
  'src/data/seed-brasilis.ts',
  cabecalho + JSON.stringify(lista, null, 2) + ';\n',
  'utf-8'
);

mkdirSync('src/data/acervo', { recursive: true });
writeFileSync('src/data/acervo/brasilis.json', JSON.stringify(obras), 'utf-8');

// ---------------------------------------------------------------------------

const porSituacao = {};
for (const c of compositores.values()) porSituacao[c.situacao] = (porSituacao[c.situacao] ?? 0) + 1;
const porEra = {};
for (const c of compositores.values()) porEra[c.era ?? 'sem era'] = (porEra[c.era ?? 'sem era'] ?? 0) + 1;

console.log('✓ src/data/seed-brasilis.ts        (compositores)');
console.log('✓ src/data/acervo/brasilis.json    (obras, sob demanda)');
console.log(`  ${compositores.size} compositores · ${obras.length} obras · ${dados.coletaneas.length} coletâneas`);
console.log(`  com data de morte: ${comData}`);
console.log(`  com biografia: ${[...compositores.values()].filter((c) => c.biografia).length}`);
console.log(`  por situação: ${JSON.stringify(porSituacao)}`);
console.log(`  por era: ${JSON.stringify(porEra)}`);
console.log(`  partituras sem compositor nomeado, deixadas de fora: ${semAutoria.length}`);
