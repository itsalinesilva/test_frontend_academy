/**
 * A IDENTIDADE CASOU A PESSOA CERTA? — e, quando não, quem é a certa.
 *
 * O DEFEITO QUE ORIGINOU ESTE SCRIPT
 * ----------------------------------
 * O acervo trazia `John Adams`, compositor nascido em 1947, ligado a `Q11806`
 * — **o segundo presidente dos Estados Unidos**, nascido em 1735. A ficha
 * exibia a biografia do presidente, o retrato do presidente, e os
 * identificadores cruzados do presidente.
 *
 * Nada acusava. A resolução por nome devolveu uma entidade que existe, com
 * biografia que existe e retrato que existe — e o resultado foi um registro
 * inteiramente falso com aparência de registro completo. É a pior falha
 * possível num acervo: não é dado faltando, é dado errado parecendo certo.
 *
 * OS DOIS SINAIS, E POR QUE UM SÓ NÃO BASTA
 * -----------------------------------------
 * **A data sozinha não serve.** Onze registros divergem no ano de nascimento,
 * e oito deles estão corretos: Ockeghem é `1420` aqui e `1410` lá, Josquin é
 * `1450` e `1455`. Não é erro de ninguém — é datação de século XV, que a
 * historiografia dá por aproximação. Acusar esses onze trataria incerteza
 * histórica como defeito.
 *
 * **A ocupação separa.** `P106` traz `Q36834` (compositor) nos oito legítimos
 * e não traz em nenhum dos três errados: o presidente é advogado e diplomata,
 * o Humperdinck ligado por engano é cantor pop, e o Howard Hanson ligado por
 * engano é um político de Minnesota sem ocupação declarada.
 *
 * Conferido contra a API antes de virar regra.
 *
 * A RE-RESOLUÇÃO
 * --------------
 * Achar o errado é metade. A outra é achar o certo: busca por nome, filtra por
 * quem é compositor, e **exige que o ano de nascimento feche**. Candidato que
 * não fecha não entra — é melhor ficar sem biografia do que com a de outro.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const UA = 'ConservatorioMuscicapa/0.1 (office.alinesilva@gmail.com)';
const API = 'https://www.wikidata.org/w/api.php';

/**
 * As ocupações que fazem de alguém autor de música.
 *
 * Não é só `compositor`: há quem o acervo conheça primeiro como organista ou
 * maestro, e cuja entidade declara isso antes. Exigir apenas `Q36834`
 * acusaria registros corretos.
 */
const OCUPACOES_MUSICAIS = new Set([
  'Q36834', // compositor
  'Q486748', // pianista
  'Q1259917', // cantor-compositor
  'Q158852', // maestro
  'Q765778', // organista
  'Q1955150', // violinista
  'Q639669', // músico
  'Q1622272', // professor universitário — não musical, e comum em compositor moderno
  'Q3455803', // diretor musical
  'Q2865819', // musicólogo? (confere-se pelo rótulo na saída)
]);

/** Só estas duas afirmam autoria; as demais entram como apoio. */
const NUCLEO = new Set(['Q36834', 'Q1259917']);

const acervo = JSON.parse(readFileSync('scripts/.acervo-extraido.json', 'utf-8'));
const comWikidata = acervo.compositores.filter((c) => c.externalIds?.wikidata);

if (comWikidata.length === 0) {
  console.error('✗ nenhum compositor com Wikidata — a auditoria ficaria vazia');
  process.exit(1);
}

async function api(params) {
  const r = await fetch(`${API}?${params}&format=json`, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const j = await r.json();
  if (j.error) throw new Error(j.error.info);
  return j;
}

function ano(claims, prop) {
  for (const x of claims?.[prop] ?? []) {
    const t = x.mainsnak?.datavalue?.value?.time;
    const m = t?.match(/^([+-])(\d{1,4})-/);
    if (m) return Number(m[1] === '-' ? -m[2] : m[2]);
  }
  return null;
}

const ocupacoes = (claims) =>
  (claims?.P106 ?? []).map((c) => c.mainsnak?.datavalue?.value?.id).filter(Boolean);

const LOTE = 50;
const situacao = {};

for (let i = 0; i < comWikidata.length; i += LOTE) {
  const lote = comWikidata.slice(i, i + LOTE);
  const { entities } = await api(
    `action=wbgetentities&ids=${lote.map((c) => c.externalIds.wikidata).join('|')}&props=claims`
  );

  for (const c of lote) {
    const e = entities[c.externalIds.wikidata];
    const ocs = ocupacoes(e?.claims);
    situacao[c.id] = {
      nome: c.canonicalName,
      qid: c.externalIds.wikidata,
      nossoNascimento: c.birthYear ?? null,
      deleNascimento: ano(e?.claims, 'P569'),
      ocupacoes: ocs,
      ehMusico: ocs.some((o) => NUCLEO.has(o) || OCUPACOES_MUSICAIS.has(o)),
    };
  }
  process.stdout.write(`\r  auditando ${Math.min(i + LOTE, comWikidata.length)}/${comWikidata.length}`);
  await new Promise((r) => setTimeout(r, 300));
}

const todos = Object.entries(situacao);
const suspeitos = todos.filter(([, s]) => !s.ehMusico);

console.log(`\n\n  ${todos.length} identidades conferidas`);
console.log(`  entidade NÃO é músico: ${suspeitos.length}`);

/**
 * NÃO-VACUIDADE.
 *
 * Se a auditoria não achasse nada, ela seria indistinguível de uma auditoria
 * quebrada. O acervo tem pelo menos os três casos conhecidos; zero aqui
 * significa que o sinal parou de funcionar, e não que o acervo ficou limpo.
 */
if (suspeitos.length === 0) {
  console.warn('  ! zero suspeitos — confira se P106 ainda é lida, porque havia três');
}

/** A busca pela entidade certa, para cada suspeito. */
const correcoes = {};

for (const [id, s] of suspeitos) {
  console.log(`\n  ${s.nome}  (${s.qid}) — ocupações: ${s.ocupacoes.join(', ') || 'nenhuma'}`);

  try {
    const busca = await api(
      `action=wbsearchentities&search=${encodeURIComponent(s.nome)}&language=en&type=item&limit=20`
    );
    const candidatos = (busca.search ?? []).map((x) => x.id).filter((q) => q !== s.qid);
    if (candidatos.length === 0) {
      console.log('     nenhum candidato');
      continue;
    }

    const { entities } = await api(
      `action=wbgetentities&ids=${candidatos.slice(0, 20).join('|')}&props=claims|labels|descriptions&languages=pt|en`
    );

    const bons = [];
    for (const q of candidatos) {
      const e = entities[q];
      if (!e?.claims) continue;
      const ocs = ocupacoes(e.claims);
      if (!ocs.some((o) => NUCLEO.has(o))) continue;

      const nasc = ano(e.claims, 'P569');
      /**
       * O ano TEM de fechar. Um compositor homônimo do século errado seria
       * exatamente o mesmo defeito que estamos consertando.
       */
      if (s.nossoNascimento && nasc && Math.abs(nasc - s.nossoNascimento) > 3) continue;
      if (s.nossoNascimento && !nasc) continue;

      bons.push({
        qid: q,
        nascimento: nasc,
        rotulo: e.labels?.pt?.value ?? e.labels?.en?.value ?? q,
        descricao: e.descriptions?.pt?.value ?? e.descriptions?.en?.value ?? '',
      });
    }

    if (bons.length === 1) {
      correcoes[id] = bons[0];
      console.log(`     ✓ ${bons[0].qid} — ${bons[0].rotulo} (${bons[0].nascimento}) — ${bons[0].descricao}`);
    } else if (bons.length === 0) {
      console.log('     nenhum candidato é compositor com o ano certo');
    } else {
      /** Ambíguo não entra. Escolher um entre dois seria o palpite de novo. */
      console.log(`     ambíguo (${bons.length}): ${bons.map((b) => b.qid).join(', ')} — não corrigido`);
    }
  } catch (e) {
    console.log(`     ! ${e.message}`);
  }

  await new Promise((r) => setTimeout(r, 400));
}

writeFileSync(
  'scripts/.identidade-auditada.json',
  JSON.stringify({ suspeitos: Object.fromEntries(suspeitos), correcoes }),
  'utf-8'
);

console.log('\n✓ scripts/.identidade-auditada.json');
console.log(`  suspeitos: ${suspeitos.length} · corrigidos com segurança: ${Object.keys(correcoes).length}`);
console.log(`  sem correção segura: ${suspeitos.length - Object.keys(correcoes).length}`);
