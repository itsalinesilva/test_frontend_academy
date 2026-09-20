/**
 * AS PARTITURAS EXTRAÍDAS VIRAM ACERVO.
 *
 * Roda depois de `extrair-mutopia.mjs`. Limpa os nomes, liga cada peça ao
 * compositor do acervo quando dá, e escreve `src/data/acervo/partituras.json`.
 *
 * O NOME DO COMPOSITOR VEM SUJO
 * -----------------------------
 * A fonte escreve `by J. S. Bach (1685–1750)`. Ligar isso ao acervo exige
 * limpar o prefixo, tirar as datas e casar pelo sobrenome — e **falhar em
 * silêncio quando não casa**, em vez de forçar uma ligação errada.
 *
 * Peça que não casa não some: entra com o nome que a fonte deu, e fica
 * marcada como não reconciliada. Quem for curar sabe onde olhar.
 *
 * POR QUE `FICHA`, E NÃO `NATIVA`
 * -------------------------------
 * A peça traz `.ly` e `.mid` — fonte simbólica, que a plataforma **poderá**
 * renderizar. Não renderiza ainda: não há leitor de LilyPond nem de MIDI aqui.
 *
 * Marcar `NATIVA` agora faria a ficha oferecer "tocar" e abrir nada — o botão
 * morto que este projeto passou meses tirando. Fica `FICHA`, com a licença e o
 * link; no dia em que o leitor existir, é uma linha.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const dados = JSON.parse(readFileSync('scripts/.mutopia-extraido.json', 'utf-8'));
const acervo = JSON.parse(readFileSync('scripts/.acervo-extraido.json', 'utf-8'));

/**
 * As fichas por peça, da segunda passada. Trazem o mantenedor — sem o qual as
 * seiscentas e vinte e uma sob Creative Commons não podem ser redistribuídas —,
 * o opus e a data de composição.
 */
let fichas = {};
try {
  fichas = JSON.parse(readFileSync('scripts/.mutopia-fichas.json', 'utf-8'));
} catch {
  console.warn('  ! sem scripts/.mutopia-fichas.json — rode extrair-mutopia-ficha.mjs');
}

/**
 * O campo "Opus" da fonte guarda DUAS coisas.
 *
 * Em `BWV 846` e `D. 891` é número de catálogo — o único dado capaz de provar
 * que duas entradas de fontes diferentes são a mesma obra. Em `Orchésographie`
 * e `Ayres and Lute Songs I` é o nome da coletânea de onde a peça saiu.
 *
 * Gravar as duas no mesmo campo repetiria o erro que acabamos de corrigir no
 * gênero: um catálogo cujo campo mistura tipos não serve para cruzar nada.
 *
 * O teste é a forma: sigla curta seguida de número é catálogo; o resto é título.
 */
function separarOpus(bruto) {
  if (!bruto) return {};
  const limpo = bruto.trim();
  if (/^(op\.?|no\.?)?\s*[A-Z][A-Za-z]{0,4}\.?\s?\d+[a-z]?$/i.test(limpo)) {
    return { numeroDeCatalogo: limpo };
  }
  if (/^\d+[a-z]?$/.test(limpo)) return { numeroDeCatalogo: 'Op. ' + limpo };
  return { coletanea: limpo };
}

mkdirSync('src/data/acervo', { recursive: true });

const semAcento = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** `by J. S. Bach (1685–1750)` → `J. S. Bach`. */
function limparNome(bruto) {
  return bruto
    .replace(/^by\s+/i, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Índice por sobrenome, para reconciliar.
 *
 * O sobrenome é a única parte estável entre as duas fontes: uma escreve
 * "Johann Sebastian Bach", a outra "J. S. Bach". Sobrenome ambíguo — há três
 * Bach no acervo — **não casa**, porque escolher um seria adivinhar.
 */
const porSobrenome = new Map();
for (const c of acervo.compositores) {
  const partes = c.canonicalName.split(' ').filter(Boolean);
  const sobrenome = semAcento(partes[partes.length - 1]);
  const lista = porSobrenome.get(sobrenome) ?? [];
  lista.push(c);
  porSobrenome.set(sobrenome, lista);
}

function reconciliar(nomeLimpo) {
  if (!nomeLimpo || /^anonymous$/i.test(nomeLimpo)) return null;

  const partes = nomeLimpo.split(' ').filter(Boolean);
  const sobrenome = semAcento(partes[partes.length - 1]);
  const candidatos = porSobrenome.get(sobrenome);
  if (!candidatos || candidatos.length === 0) return null;

  /**
   * Sobrenome único resolve. Ambíguo exige mais: as iniciais precisam bater,
   * senão a peça fica sem ligação — e sem ligação é melhor que ligada ao Bach
   * errado.
   */
  if (candidatos.length === 1) return candidatos[0].id;

  const iniciais = partes.slice(0, -1).map((p) => semAcento(p[0])).join('');
  const certo = candidatos.find((c) => {
    const dele = c.canonicalName
      .split(' ')
      .slice(0, -1)
      .map((p) => semAcento(p[0]))
      .join('');
    return dele === iniciais;
  });
  return certo?.id ?? null;
}

const partituras = [];
let reconciliadas = 0;

for (const p of dados.pecas) {
  const nome = limparNome(p.compositor);
  const compositorId = reconciliar(nome);
  if (compositorId) reconciliadas += 1;

  const ficha = fichas[p.idMutopia] ?? {};
  const { numeroDeCatalogo, coletanea } = separarOpus(ficha.opus);

  partituras.push({
    id: 'part-' + (p.idMutopia ?? p.ly.split('/').pop().replace(/\.ly$/, '')),
    t: p.titulo,
    /** Compositor do acervo, quando a reconciliação fecha. */
    c: compositorId ?? undefined,
    /** Nome como a fonte escreve. Fica sempre, casando ou não. */
    cn: nome || 'Anônimo',
    i: p.instrumento,
    e: p.eraId,
    /** Estilo como a fonte o nomeia — mais fino que a era. */
    st: p.estilo || undefined,
    /** Licença DO ARQUIVO, distinta do domínio público da obra. */
    lic: p.licenca,
    /**
     * Quem transcreveu. **Obrigatório** onde a licença exige atribuição — e
     * exigir não é pedir: sem o nome, a redistribuição é sem licença.
     */
    ed: ficha.mantenedor ?? undefined,
    /** BWV 846, D. 891. É por aqui que duas fontes provam falar da mesma obra. */
    cat: numeroDeCatalogo,
    /** Quando a peça saiu da coletânea, e não um número de catálogo. */
    col: coletanea,
    /** "1588", "19th C.", "1780s" — a precisão é a que a fonte tem. */
    dc: ficha.dataDeComposicao ?? undefined,
    ly: p.ly,
    mid: p.midi,
    pdf: p.pdf,
    img: p.preview,
    d: p.descricao,
  });
}

writeFileSync('src/data/acervo/partituras.json', JSON.stringify(partituras), 'utf-8');

const porInstrumento = {};
for (const p of partituras) porInstrumento[p.i] = (porInstrumento[p.i] ?? 0) + 1;
const porEra = {};
for (const p of partituras) porEra[p.e ?? 'sem era'] = (porEra[p.e ?? 'sem era'] ?? 0) + 1;

console.log('✓ src/data/acervo/partituras.json');
console.log(`  ${partituras.length} partituras`);
console.log(`  reconciliadas com o acervo: ${reconciliadas} (${Math.round((reconciliadas / partituras.length) * 100)}%)`);
console.log(`  com MIDI: ${partituras.filter((p) => p.mid).length}`);
console.log(`  por instrumento: ${JSON.stringify(porInstrumento)}`);
console.log(`  por era: ${JSON.stringify(porEra)}`);

const exigemAtribuicao = partituras.filter((p) => /Attribution/i.test(p.lic));
const semCredito = exigemAtribuicao.filter((p) => !p.ed);
console.log(`  exigem atribuição: ${exigemAtribuicao.length} — sem crédito: ${semCredito.length}`);
console.log(`  com número de catálogo: ${partituras.filter((p) => p.cat).length}`);
console.log(`  com data de composição: ${partituras.filter((p) => p.dc).length}`);

/**
 * PARA A GERAÇÃO SE OMITIR O CRÉDITO DE QUEM O EXIGE.
 *
 * Não é aviso: publicar arquivo sob CC-BY sem nomear quem transcreveu é
 * publicar sem licença. Melhor a geração falhar aqui do que o acervo sair
 * com mil peças em situação irregular.
 */
if (semCredito.length > 0) {
  console.error(`
✗ ${semCredito.length} peças exigem atribuição e não têm mantenedor:`);
  for (const p of semCredito.slice(0, 5)) console.error(`   ${p.id} — ${p.t}`);
  process.exit(1);
}
