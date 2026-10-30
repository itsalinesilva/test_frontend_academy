/**
 * APLICA AS IDENTIDADES CORRIGIDAS AO ACERVO JÁ EXTRAÍDO.
 *
 * `auditar-identidade.mjs` acha quem está trocado e quem é o certo. Este aqui
 * substitui — e substituir é refazer **tudo** que veio da entidade errada:
 * biografia, retrato e os identificadores cruzados.
 *
 * TROCAR SÓ O Q-ID SERIA PIOR QUE NÃO TROCAR
 * ------------------------------------------
 * A ficha ficaria com o identificador do compositor e a biografia do
 * presidente — um registro internamente contraditório, e agora sem o sinal
 * que permitiu flagrá-lo. A auditoria seguinte passaria batida.
 *
 * Roda sobre o arquivo extraído, e não sobre as fontes: reextrair duzentos e
 * vinte compositores para consertar três seria pagar caro pelo mesmo
 * resultado. A extração completa já ficou corrigida na origem, para o próximo
 * que a rodar.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const UA = { 'User-Agent': 'ConservatorioMuscicapa/1.0 (contato@muscicapa.org)' };
const ARQUIVO = 'scripts/.acervo-extraido.json';

const { correcoes } = JSON.parse(readFileSync('scripts/.identidade-auditada.json', 'utf-8'));
const acervo = JSON.parse(readFileSync(ARQUIVO, 'utf-8'));

const alvos = Object.keys(correcoes);
if (alvos.length === 0) {
  console.log('  nada a corrigir');
  process.exit(0);
}

console.log(`  ${alvos.length} identidades a substituir`);

const { entities } = await fetch(
  'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json' +
    '&languages=pt|pt-br|en&props=claims|descriptions&ids=' +
    alvos.map((id) => correcoes[id].qid).join('|'),
  { headers: UA }
).then((r) => r.json());

let trocados = 0;

for (const id of alvos) {
  const c = acervo.compositores.find((x) => x.id === id);
  if (!c) {
    console.warn(`  ! ${id} não está no acervo`);
    continue;
  }

  const qid = correcoes[id].qid;
  const e = entities?.[qid];
  if (!e) {
    console.warn(`  ! ${qid} não voltou da API — ${c.canonicalName} fica como está`);
    continue;
  }

  const texto = (p) => {
    const v = e.claims?.[p]?.[0]?.mainsnak?.datavalue?.value;
    return typeof v === 'string' ? v : undefined;
  };
  const imagem = texto('P18');

  const antes = { wd: c.externalIds.wikidata, bio: c.biografiaPt };

  c.biografiaPt =
    e.descriptions?.['pt-br']?.value ?? e.descriptions?.pt?.value ?? e.descriptions?.en?.value;
  c.portraitUrl = imagem
    ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imagem)}?width=400`
    : undefined;
  c.externalIds = {
    /** O identificador do Open Opus é da NOSSA resolução, e não muda. */
    openOpus: c.externalIds.openOpus,
    wikidata: qid,
    imslp: texto('P839'),
    musicbrainz: texto('P434'),
    commonsCategory: texto('P373'),
    viaf: texto('P214'),
    isni: texto('P213'),
  };

  trocados += 1;
  console.log(`\n  ${c.canonicalName}`);
  console.log(`     ${antes.wd} → ${qid}`);
  console.log(`     antes: ${antes.bio ?? '(sem biografia)'}`);
  console.log(`     agora: ${c.biografiaPt ?? '(sem biografia)'}`);
}

writeFileSync(ARQUIVO, JSON.stringify(acervo), 'utf-8');
console.log(`\n✓ ${ARQUIVO} — ${trocados} identidades substituídas`);
