/**
 * Garante que nenhuma obra de referência externa apareça no produto.
 *
 * A plataforma transmite conteúdo AUTORAL. Nenhum livro, curso, tratado ou
 * instituição que serviu de base ao estudo interno pode ser mencionado —
 * nem na interface, nem nos dados, nem no bundle.
 *
 * Esta verificação existe porque a purga manual já foi feita uma vez e o
 * único jeito de ela não voltar aos poucos, numa string aqui e num seed ali,
 * é o build quebrar.
 *
 * Roda sobre `dist/` (o que realmente vai ao ar) e sobre `src/` (para o erro
 * aparecer no arquivo onde nasceu, e não num chunk minificado).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

/**
 * Termos proibidos.
 *
 * Nomes de compositores NÃO entram aqui: Fux, Palestrina e Bach são o
 * conteúdo do curso de história, são domínio público e devem ser ensinados.
 * O que está proibido é a CITAÇÃO BIBLIOGRÁFICA e a fonte de onde o material
 * de estudo interno veio.
 */
const PROIBIDOS = [
  // As grafias aportuguesadas tambem contam. Uma faixa do player chegou a
  // trazer "Catedra de Teoria de Edimburgo" e passou por esta verificacao,
  // porque so a grafia inglesa estava listada.
  'Edinburgh',
  'Edimburgo',
  'Bohumil',
  'Musimed',
  'Grout',
  'Palisca',
  'Burkholder',
  'Kostka',
  'Jeppesen',
  'Tovey',
  'IMSLP',
  'Petrucci Music Library',
  'Musica Brasilis',
  'Música Brasilis',
  'Mutopia',
  'MuseScore',
  'Gradus ad Parnassum',
];

const EXTENSOES = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.css', '.html', '.json']);

/** Arquivos que documentam a própria proibição. */
const ISENTOS = [
  'scripts/verify-no-citations.mjs',
  'scripts\\verify-no-citations.mjs',
];

function percorrer(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const nome of readdirSync(dir)) {
    if (nome === 'node_modules' || nome === '.git') continue;
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      percorrer(caminho, acc);
    } else if (EXTENSOES.has(extname(nome))) {
      acc.push(caminho);
    }
  }
  return acc;
}

const violacoes = [];

for (const arquivo of [...percorrer('dist'), ...percorrer('src')]) {
  if (ISENTOS.some((i) => arquivo.endsWith(i))) continue;
  const conteudo = readFileSync(arquivo, 'utf8');
  for (const termo of PROIBIDOS) {
    if (conteudo.includes(termo)) {
      const linha = conteudo.slice(0, conteudo.indexOf(termo)).split('\n').length;
      violacoes.push(`${arquivo}:${linha} menciona "${termo}"`);
    }
  }
}

if (violacoes.length > 0) {
  console.error('\n✗ CITAÇÃO DE FONTE EXTERNA NO PRODUTO:\n');
  violacoes.forEach((v) => console.error(`  • ${v}`));
  console.error('\nA plataforma transmite conteúdo autoral e não cita a bibliografia');
  console.error('usada no estudo interno. Ver CLAUDE_AUDIT.md §15.\n');
  process.exit(1);
}

console.log(`✓ Nenhuma das ${PROIBIDOS.length} fontes proibidas aparece em src/ ou dist/.`);
