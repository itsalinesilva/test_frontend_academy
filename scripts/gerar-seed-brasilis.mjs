/**
 * O CORPUS BRASILEIRO VIRA CATÁLOGO.
 *
 * Roda depois de `extrair-musica-brasilis.mjs`. Converte o que foi lido em
 * compositores e obras do acervo, e escreve dois arquivos versionados.
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
 * hospedar-se na banda de quem pediu para não rastrarem aquele diretório.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const dados = JSON.parse(readFileSync('scripts/.musica-brasilis.json', 'utf-8'));

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
 * O recorte é o das sete eras do curso. Compositor vivo entra em
 * contemporânea; sem data nenhuma, **fica sem era** — e não numa era provável,
 * que seria afirmar uma datação que ninguém fez.
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
 */
function situacao(morte) {
  const hoje = new Date().getFullYear();
  if (!morte) {
    return {
      status: 'UNDETERMINED',
      nota: 'Sem data de morte registrada na fonte, não dá para afirmar que está em domínio público.',
    };
  }
  if (morte + 71 <= hoje) {
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

const compositoresPorChave = new Map();
for (const c of dados.compositores) {
  compositoresPorChave.set(chaveDeIdentidade(c.nome), c);
}

/**
 * Nem toda partitura aponta para um compositor da listagem.
 *
 * A listagem de compositores tem setecentos e poucos; a de partituras nomeia
 * quem assina cada uma, e há nomes ali que não têm página própria. Eles entram
 * assim mesmo, com o que a partitura declara — e o que não se sabe fica vazio.
 */
const compositores = new Map();

for (const c of dados.compositores) {
  const s = situacao(c.morte);
  compositores.set(chaveDeIdentidade(c.nome), {
    id: 'mb-' + idLegivel(c.nome),
    nome: c.nome,
    ordenar: c.nome.split(' ').slice(-1)[0] + ', ' + c.nome.split(' ').slice(0, -1).join(' '),
    nascimento: c.nascimento,
    morte: c.morte,
    era: eraDe(c.nascimento, c.morte),
    url: c.url,
    idNaFonte: c.idNaFonte,
    situacao: s.status,
    nota: s.nota,
  });
}

for (const p of dados.partituras) {
  const chave = chaveDeIdentidade(p.compositor);
  if (compositores.has(chave)) continue;

  const s = situacao(undefined);
  compositores.set(chave, {
    id: 'mb-' + idLegivel(p.compositor),
    nome: p.compositor,
    ordenar: p.compositor,
    era: undefined,
    situacao: s.status,
    nota: s.nota,
  });
}

const obras = dados.partituras.map((p) => {
  const c = compositores.get(chaveDeIdentidade(p.compositor));
  return {
    id: 'mb-obra-' + p.idNaFonte,
    compositorId: c.id,
    titulo: p.titulo,
    instrumentos: p.instrumentos,
    era: c.era,
    url: p.url,
    idNaFonte: p.idNaFonte,
  };
});

mkdirSync('src/data/acervo', { recursive: true });

writeFileSync(
  'src/data/acervo/brasilis.json',
  JSON.stringify({
    compositores: [...compositores.values()],
    obras,
    coletaneas: dados.coletaneas,
  }),
  'utf-8'
);

const porSituacao = {};
for (const c of compositores.values()) porSituacao[c.situacao] = (porSituacao[c.situacao] ?? 0) + 1;
const porEra = {};
for (const c of compositores.values()) porEra[c.era ?? 'sem era'] = (porEra[c.era ?? 'sem era'] ?? 0) + 1;

console.log('✓ src/data/acervo/brasilis.json');
console.log(`  ${compositores.size} compositores · ${obras.length} obras · ${dados.coletaneas.length} coletâneas`);
console.log(`  por situação: ${JSON.stringify(porSituacao)}`);
console.log(`  por era: ${JSON.stringify(porEra)}`);
console.log(`  sem era declarada: ${[...compositores.values()].filter((c) => !c.era).length}`);
