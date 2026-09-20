/**
 * O QUE O WIKIDATA SABE SOBRE CADA COMPOSITOR — as quatro propriedades que existem.
 *
 * CONFERIDAS CONTRA A API ANTES DE VIRAR CÓDIGO
 * ---------------------------------------------
 * Sete propriedades foram levantadas de conhecimento geral. Quatro existem em
 * registro de pessoa, e três não:
 *
 *   P19  local de nascimento     ✓
 *   P20  local de morte          ✓
 *   P27  cidadania               ✓
 *   P1303 instrumento praticado  ✓
 *
 *   P412 tessitura       ✗ é propriedade de CANTOR, e não de compositor
 *   P571 data de criação ✗ é propriedade de OBRA
 *   P870 instrumentação  ✗ é propriedade de OBRA
 *
 * Escrever as três últimas teria produzido três campos permanentemente vazios
 * e a impressão de que o acervo é pobre onde, na verdade, a pergunta estava
 * endereçada à entidade errada.
 *
 * POR QUE A CIDADANIA, E NÃO SÓ O LOCAL DE NASCIMENTO
 * ---------------------------------------------------
 * A região do Atlas é uma divisão política e cultural, e o local de nascimento
 * é um ponto. Resolver a cidade até o país exigiria uma segunda consulta por
 * cidade; a cidadania **já vem como país**, e é o caminho curto para a região.
 *
 * Os dois são gravados: o local de nascimento é conteúdo de ficha — "nasceu em
 * Eisenach" é o que se lê numa biografia —, e a cidadania é o que alimenta o
 * filtro.
 *
 * A CIDADANIA VEM HISTÓRICA, E ISSO É CORRETO
 * -------------------------------------------
 * Bach devolve Sacro Império Romano-Germânico **e** Alemanha. Não é erro da
 * fonte: ele viveu num Estado que não existe mais, e o mapa de hoje é uma
 * leitura posterior. As duas ficam, e quem mapeia para região decide.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const UA = 'ConservatorioMuscicapa/0.1 (office.alinesilva@gmail.com)';
const API = 'https://www.wikidata.org/w/api.php';

const acervo = JSON.parse(readFileSync('scripts/.acervo-extraido.json', 'utf-8'));
const comWikidata = acervo.compositores.filter((c) => c.externalIds?.wikidata);

console.log(`  ${comWikidata.length} compositores com identificador Wikidata`);

/** Os rótulos dos Q-ids referidos, para o mapa de região ser auditável. */
const referidos = new Set();
const porCompositor = {};

/** A API aceita cinquenta entidades por chamada. Menos chamadas, menos carga. */
const LOTE = 50;

function valores(claims, prop) {
  const c = claims?.[prop];
  if (!c) return [];
  return c
    .map((x) => x.mainsnak?.datavalue)
    .filter((d) => d && d.type === 'wikibase-entityid')
    .map((d) => d.value.id);
}

/**
 * O ano de uma data do Wikidata.
 *
 * O formato é `+1685-03-21T00:00:00`, e há registros com mais de uma data —
 * calendário juliano e gregoriano para o mesmo nascimento. Basta o ano, e o
 * primeiro serve: a diferença entre os dois calendários nunca chega a um ano.
 */
function ano(claims, prop) {
  const c = claims?.[prop];
  if (!c) return null;
  for (const x of c) {
    const t = x.mainsnak?.datavalue?.value?.time;
    if (!t) continue;
    const m = t.match(/^([+-])(\d{1,4})-/);
    if (m) return Number(m[1] === '-' ? -m[2] : m[2]);
  }
  return null;
}

async function buscar(ids, props) {
  const u = `${API}?action=wbgetentities&ids=${ids.join('|')}&props=${props}&languages=pt|en&format=json`;
  const r = await fetch(u, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  if (j.error) throw new Error(j.error.info);
  return j.entities ?? {};
}

let falhas = 0;

for (let i = 0; i < comWikidata.length; i += LOTE) {
  const lote = comWikidata.slice(i, i + LOTE);
  try {
    const ents = await buscar(
      lote.map((c) => c.externalIds.wikidata),
      'claims'
    );

    for (const c of lote) {
      const e = ents[c.externalIds.wikidata];
      if (!e?.claims) continue;

      const registro = {
        nascimentoEm: valores(e.claims, 'P19')[0] ?? null,
        morteEm: valores(e.claims, 'P20')[0] ?? null,
        cidadanias: valores(e.claims, 'P27'),
        instrumentos: valores(e.claims, 'P1303'),
        /**
         * MOVIMENTO ESTÉTICO — e a fonte mistura duas coisas neste campo.
         *
         * Debussy devolve "impressionismo na música", que é movimento. Bach
         * devolve "música barroca", que é **era**. Gravar os dois no mesmo
         * campo poria "Barroco" ao lado de "Impressionismo" no filtro de
         * movimento, como se fossem do mesmo tipo — o mesmo defeito que o
         * campo de gênero carregou por vinte e cinco mil registros.
         *
         * O bruto fica; a separação é decisão de curadoria, e se faz contra a
         * lista de movimentos que a plataforma já mantém.
         */
        movimentos: valores(e.claims, 'P135'),
        /**
         * As DATAS, e elas não são para exibir — o acervo já tem as suas.
         *
         * Servem para **auditar a identidade**. Um registro nosso que diz 1947
         * ligado a uma entidade que nasceu em 1735 não é o mesmo sujeito, e
         * essa contradição é a única forma automática de flagrar resolução que
         * casou a pessoa errada.
         *
         * Sem isto, um compositor com a biografia de um presidente americano
         * fica no acervo indefinidamente — e foi o que aconteceu.
         */
        nasceuEm: ano(e.claims, 'P569'),
        morreuEm: ano(e.claims, 'P570'),
      };
      porCompositor[c.id] = registro;

      for (const q of [
        registro.nascimentoEm,
        registro.morteEm,
        ...registro.cidadanias,
        ...registro.instrumentos,
        ...registro.movimentos,
      ]) {
        if (q) referidos.add(q);
      }
    }
  } catch (e) {
    falhas += 1;
    console.warn(`  ! lote ${i}: ${e.message}`);
  }

  process.stdout.write(`\r  ${Math.min(i + LOTE, comWikidata.length)}/${comWikidata.length}`);
  await new Promise((r) => setTimeout(r, 300));
}

/**
 * OS RÓTULOS DOS Q-IDS, e por que eles são indispensáveis.
 *
 * Sem eles, o mapa de região seria uma lista de `Q183: 'europa-ocidental'` que
 * ninguém consegue conferir. Com o rótulo ao lado, quem revisar lê "Alemanha →
 * Europa Ocidental" e sabe se concorda.
 */
const listaReferidos = [...referidos];
const rotulos = {};

for (let i = 0; i < listaReferidos.length; i += LOTE) {
  const lote = listaReferidos.slice(i, i + LOTE);
  try {
    const ents = await buscar(lote, 'labels');
    for (const q of lote) {
      const e = ents[q];
      rotulos[q] = e?.labels?.pt?.value ?? e?.labels?.en?.value ?? q;
    }
  } catch (e) {
    falhas += 1;
    console.warn(`  ! rótulos ${i}: ${e.message}`);
  }
  process.stdout.write(`\r  rótulos ${Math.min(i + LOTE, listaReferidos.length)}/${listaReferidos.length}`);
  await new Promise((r) => setTimeout(r, 300));
}

writeFileSync(
  'scripts/.wikidata-compositores.json',
  JSON.stringify({ porCompositor, rotulos }),
  'utf-8'
);

const regs = Object.values(porCompositor);
console.log('\n✓ scripts/.wikidata-compositores.json');
console.log(`  ${regs.length} compositores · ${falhas} falhas`);
console.log(`  com local de nascimento : ${regs.filter((r) => r.nascimentoEm).length}`);
console.log(`  com local de morte      : ${regs.filter((r) => r.morteEm).length}`);
console.log(`  com cidadania           : ${regs.filter((r) => r.cidadanias.length).length}`);
console.log(`  com instrumento         : ${regs.filter((r) => r.instrumentos.length).length}`);
console.log(`  com movimento (P135)    : ${regs.filter((r) => r.movimentos.length).length}`);
console.log(`  Q-ids distintos referidos: ${listaReferidos.length}`);

/** As cidadanias por frequência: é esta lista que vira o mapa de região. */
const paises = {};
for (const r of regs) for (const q of r.cidadanias) paises[q] = (paises[q] ?? 0) + 1;
console.log('\n  cidadanias mais frequentes:');
for (const [q, n] of Object.entries(paises).sort((a, b) => b[1] - a[1]).slice(0, 30)) {
  console.log(`    ${String(n).padStart(4)}  ${q.padEnd(10)} ${rotulos[q] ?? '?'}`);
}
console.log(`\n  países distintos a mapear: ${Object.keys(paises).length}`);
