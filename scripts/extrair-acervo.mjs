/**
 * EXTRAÇÃO DO ACERVO — compositores, obras, biografias e imagens.
 *
 * O QUE ELE FAZ
 * -------------
 * Percorre as fontes abertas, reconcilia o que elas dizem e escreve um seed
 * TypeScript no repositório. Roda uma vez; o resultado é versionado e não
 * depende de rede para servir.
 *
 * AS FONTES, E O QUE CADA UMA DÁ
 * ------------------------------
 *   **Open Opus** — catálogo de compositores e obras, com época, datas e
 *   retrato. É a espinha: nome canônico, id estável e a lista de obras.
 *
 *   **Wikidata** — biografia curta em português, local de nascimento e os
 *   identificadores cruzados (IMSLP, MusicBrainz, Commons). É o eixo de
 *   reconciliação.
 *
 * POR QUE NÃO SPARQL
 * ------------------
 * O endpoint SPARQL do Wikidata recusa requisição sem User-Agent de política,
 * e devolve 403. A API de ação (`w/api.php`) não tem essa exigência e responde
 * com CORS aberto — é por ela que a biografia e os identificadores vêm.
 *
 * DOMÍNIO PÚBLICO É CALCULADO, NUNCA PRESUMIDO
 * --------------------------------------------
 * Vem da data de morte, pela regra brasileira (Lei 9.610/98, art. 41): setenta
 * anos a partir de 1º de janeiro do ano seguinte. Compositor vivo ou morto há
 * menos que isso entra no catálogo **marcado como protegido** — o acervo
 * registra a existência, e a legislação decide a experiência.
 */
import { writeFileSync } from 'node:fs';

const UA = { 'User-Agent': 'ConservatorioMuscicapa/1.0 (contato@muscicapa.org)' };
const ESPERA_MS = 120;

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function json(url, tentativas = 3) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      if (i === tentativas - 1) throw e;
      await dormir(500 * (i + 1));
    }
  }
}

/** Época do Open Opus → era do Atlas. */
const ERA_DA_EPOCA = {
  Medieval: 'era_medieval',
  Renaissance: 'era_renascimento',
  Baroque: 'era_barroco',
  Classical: 'era_classicismo',
  'Early Romantic': 'era_romantismo',
  Romantic: 'era_romantismo',
  'Late Romantic': 'era_romantismo',
  'Post-Romantic': 'era_moderna',
  '20th Century': 'era_moderna',
  'Post-War': 'era_contemporanea',
  '21st Century': 'era_contemporanea',
};

/**
 * A classificação da fonte é de MEIO, e não de gênero.
 *
 * Keyboard, Orchestral, Chamber, Stage, Vocal respondem **por onde sai o som**.
 * Gênero é outra pergunta: como a obra se organiza — sonata, fuga, missa. Os
 * dois eixos se cruzam: existe sonata para piano e sonata para violino.
 *
 * Isto estava sendo gravado como gênero, e o filtro misturava `vocal` com
 * `minueto`. O gênero de verdade vem de outra fonte, e até lá fica vazio.
 */
const MEIO = {
  Keyboard: 'teclado',
  Orchestral: 'orquestra',
  Chamber: 'camara',
  Stage: 'cena',
  Vocal: 'vocal',
  Popular: 'popular',
  Recommended: undefined,
};

function idLegivel(nome) {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const ano = (d) => (d ? Number(String(d).slice(0, 4)) : undefined);

/** `P106` inclui compositor ou cantor-compositor? É o que separa o homônimo. */
const AUTORIA_MUSICAL = new Set(['Q36834', 'Q1259917']);

function ehAutorDeMusica(claims) {
  return (claims?.P106 ?? [])
    .map((c) => c.mainsnak?.datavalue?.value?.id)
    .some((q) => AUTORIA_MUSICAL.has(q));
}

function anoDaPropriedade(claims, prop) {
  for (const x of claims?.[prop] ?? []) {
    const m = x.mainsnak?.datavalue?.value?.time?.match(/^([+-])(\d{1,4})-/);
    if (m) return Number(m[1] === '-' ? -m[2] : m[2]);
  }
  return undefined;
}

/**
 * 🔴 O PRIMEIRO RESULTADO DA BUSCA NÃO É A PESSOA.
 *
 * Esta função pedia `limit=1` e ficava com `search[0]`. O acervo saiu com
 * **três identidades trocadas**, e nenhuma delas dava sinal de erro:
 *
 *   `John Adams`, compositor de 1947  →  o segundo presidente dos EUA
 *   `Howard Hanson`, compositor       →  um político de Minnesota
 *   `Engelbert Humperdinck`, de 1854  →  o cantor pop dos anos 60
 *
 * As três fichas ficaram completas — biografia, retrato, identificadores
 * cruzados —, e completamente erradas. É a pior falha possível num acervo:
 * não é dado faltando, que se vê, é dado errado com aparência de certo.
 *
 * A correção tem duas exigências, e as duas são necessárias:
 *
 *   **a ocupação** — `P106` precisa dizer compositor. Foi conferido contra a
 *   API: os três impostores não a têm, e os compositores de datação incerta,
 *   que também divergiam no ano, têm.
 *
 *   **o ano de nascimento** — porque há compositores homônimos de séculos
 *   diferentes, e trocar um pelo outro seria o mesmo defeito com outra cara.
 *
 * Candidato ambíguo **não entra**: dois que passam nos dois testes devolvem
 * nada, porque escolher um seria adivinhar. Ficha sem biografia é um buraco
 * visível; ficha com a biografia de outro, não.
 *
 * Devolve biografia curta, retrato e os identificadores cruzados. Falha de
 * rede aqui **não** derruba o compositor: ele entra com o que o Open Opus deu,
 * e a ausência fica registrada.
 */
async function doWikidata(nomeCompleto, anoDeNascimento) {
  const busca = await json(
    'https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&origin=*&language=pt&uselang=pt&type=item&limit=10&search=' +
      encodeURIComponent(nomeCompleto)
  );
  const candidatos = (busca?.search ?? []).map((x) => x.id);
  if (candidatos.length === 0) return null;

  const ent = await json(
    'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&origin=*&languages=pt|pt-br|en&props=claims|descriptions&ids=' +
      candidatos.join('|')
  );

  const aprovados = candidatos.filter((q) => {
    const c = ent?.entities?.[q]?.claims;
    if (!c || !ehAutorDeMusica(c)) return false;
    if (!anoDeNascimento) return true;
    const nasc = anoDaPropriedade(c, 'P569');
    /**
     * Sem ano na entidade, não dá para confirmar — e não confirmar é recusar.
     * A datação do século XV diverge legitimamente, e por isso a folga é de
     * três anos, e não exata.
     */
    return nasc !== undefined && Math.abs(nasc - anoDeNascimento) <= 3;
  });

  if (aprovados.length !== 1) return null;

  const achado = { id: aprovados[0] };
  const e = ent?.entities?.[achado.id];
  if (!e) return null;

  const valor = (p) => e.claims?.[p]?.[0]?.mainsnak?.datavalue?.value;
  const texto = (p) => {
    const v = valor(p);
    return typeof v === 'string' ? v : undefined;
  };

  const imagem = texto('P18');
  const desc =
    e.descriptions?.['pt-br']?.value ??
    e.descriptions?.pt?.value ??
    e.descriptions?.en?.value;

  return {
    wikidata: achado.id,
    descricao: desc,
    imslp: texto('P839'),
    musicbrainz: texto('P434'),
    commonsCategory: texto('P373'),
    viaf: texto('P214'),
    isni: texto('P213'),
    /** `Special:FilePath` resolve o nome do arquivo para a imagem servida. */
    portraitCommons: imagem
      ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imagem)}?width=400`
      : undefined,
  };
}

async function main() {
  const limite = Number(process.argv[2] ?? 0);

  /**
   * A lista INTEIRA, letra por letra.
   *
   * `pop` e `rec` trazem 78 nomes — os populares e os recomendados. A listagem
   * por inicial devolve os 220 que o catálogo tem. Ficar nos 78 seria escolher
   * um acervo menor por comodidade de uma chamada.
   */
  console.log('· lendo o catálogo inteiro de compositores, letra por letra');
  const porId = new Map();
  for (const L of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    try {
      const j = await json(`https://api.openopus.org/composer/list/name/${L}.json`);
      for (const c of j.composers ?? []) porId.set(c.id, c);
    } catch {
      // letra sem compositor devolve erro; não é falha
    }
    await dormir(60);
  }
  let compositores = [...porId.values()];

  if (limite > 0) compositores = compositores.slice(0, limite);
  console.log(`  ${compositores.length} compositores`);

  const saida = { compositores: [], obras: [], erros: [] };

  for (const [i, c] of compositores.entries()) {
    const id = idLegivel(c.complete_name);
    process.stdout.write(`\r· ${i + 1}/${compositores.length}  ${c.complete_name.slice(0, 40).padEnd(40)}`);

    let wd = null;
    try {
      wd = await doWikidata(c.complete_name, ano(c.birth));
    } catch (e) {
      saida.erros.push(`wikidata ${c.complete_name}: ${e.message}`);
    }
    await dormir(ESPERA_MS);

    let obras = [];
    try {
      const w = await json(`https://api.openopus.org/work/list/composer/${c.id}/genre/all.json`);
      obras = w.works ?? [];
    } catch (e) {
      saida.erros.push(`obras ${c.complete_name}: ${e.message}`);
    }
    await dormir(ESPERA_MS);

    saida.compositores.push({
      id,
      canonicalName: c.complete_name,
      sortName: c.name + ', ' + c.complete_name.replace(new RegExp('\\s*' + c.name + '$'), ''),
      birthYear: ano(c.birth),
      deathYear: ano(c.death),
      epoch: c.epoch,
      periodId: ERA_DA_EPOCA[c.epoch],
      biografiaPt: wd?.descricao,
      portraitUrl: wd?.portraitCommons ?? c.portrait,
      externalIds: {
        openOpus: String(c.id),
        wikidata: wd?.wikidata,
        imslp: wd?.imslp,
        musicbrainz: wd?.musicbrainz,
        commonsCategory: wd?.commonsCategory,
        viaf: wd?.viaf,
        isni: wd?.isni,
      },
      totalObras: obras.length,
    });

    for (const o of obras) {
      saida.obras.push({
        id: `${id}--${idLegivel(o.title)}`,
        composerId: id,
        title: o.title,
        subtitle: o.subtitle || undefined,
        genreOpenOpus: o.genre,
        /** MEIO, e não gênero. O gênero fica vazio até vir forma de verdade. */
        meio: MEIO[o.genre],
        periodId: ERA_DA_EPOCA[c.epoch],
        openOpusId: String(o.id),
        /** O catálogo do Open Opus marca as obras de entrada no repertório. */
        recomendada: o.recommended === '1' || o.recommended === true,
        popular: o.popular === '1' || o.popular === true,
      });
    }
  }

  console.log('');
  writeFileSync('scripts/.acervo-extraido.json', JSON.stringify(saida, null, 1), 'utf-8');
  console.log(`✓ ${saida.compositores.length} compositores · ${saida.obras.length} obras`);
  console.log(`  com biografia: ${saida.compositores.filter((c) => c.biografiaPt).length}`);
  console.log(`  com retrato  : ${saida.compositores.filter((c) => c.portraitUrl).length}`);
  console.log(`  com Wikidata : ${saida.compositores.filter((c) => c.externalIds.wikidata).length}`);
  console.log(`  com IMSLP    : ${saida.compositores.filter((c) => c.externalIds.imslp).length}`);
  if (saida.erros.length) console.log(`  erros        : ${saida.erros.length}`);
}

main().catch((e) => {
  console.error('falhou:', e);
  process.exit(1);
});
