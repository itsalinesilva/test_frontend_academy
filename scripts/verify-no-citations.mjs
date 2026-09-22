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
/**
 * O QUE ESTA LISTA PROÍBE, E O QUE ELA NUNCA DEVERIA TER PROIBIDO.
 *
 * DE ONDE ELA VEIO
 * ----------------
 * De um defeito real: as lições citavam páginas específicas de obras de
 * referência — "págs. 11–24" — dentro do texto didático. Citar a bibliografia
 * do estudo interno apresenta o ensino da plataforma como derivado de outro,
 * e é o que esta verificação existe para impedir.
 *
 * O ERRO QUE ESTAVA AQUI DENTRO
 * -----------------------------
 * Junto das obras de referência, a lista trazia **IMSLP, Petrucci, Mutopia,
 * Música Brasilis e MuseScore**. Isso foi aplicação errada da regra: essas não
 * são bibliografia do que ensinamos — são as **fontes do acervo**, de onde
 * vêm compositores, biografias, obras e imagens.
 *
 * Proibir o nome delas tornava impossível a coisa mais básica de um catálogo:
 * dizer onde a obra está. Pior no caso do Mutopia, cuja licença **exige**
 * atribuição por peça — proibir o nome quebraria a própria licença que
 * autoriza usar o acervo dele.
 *
 * Foram removidas em 19/09. Nomear a fonte de um item catalogado é atribuição,
 * e atribuição é obrigação, não infração.
 *
 * O QUE CONTINUA PROIBIDO
 * -----------------------
 * Só a bibliografia do estudo: os livros, cursos e instituições de onde o
 * conteúdo autoral foi escrito. O conteúdo é transmitido na forma que a
 * plataforma deu a ele, e a fonte desse estudo não aparece.
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
  'Gradus ad Parnassum',

  // As duas historiografias brasileiras nomeadas como base no documento de
  // fontes. Lista de proibidos incompleta e lista que nao protege.
  'Vasco Mariz',
  'Tinhor\u00e3o',
  'Tinhorao',

  // Metodos de instrumento.
  //
  // 🔴 'Suzuki' SAIU DESTA LISTA, e a decisao e da Aline.
  //
  // A regra existe para manter fora da plataforma a BIBLIOGRAFIA DE ESTUDO —
  // os livros que a gente le para escrever conteudo, e cujo texto e de
  // terceiros. Citar Grout ou Kostka numa tela seria pendurar a plataforma
  // numa fonte que ela nao pode reproduzir.
  //
  // O repertorio graduado de violino e outra coisa. O indice de um volume
  // pedagogico — quais pecas estao nele, em que ordem — e FATO, e fato nao se
  // protege. E as pecas sao de Bach, Handel, Purcell, Schumann, Boccherini:
  // dominio publico, com autoria propria, catalogadas aqui em nome de quem as
  // escreveu.
  //
  // O que continua proibido, e mais importante que o nome: **reproduzir as
  // pecas do proprio Shinichi Suzuki**. Ele morreu em 1998, e pela Lei
  // 9.610/98 art. 41 a obra dele esta protegida ate 2069. As Variacoes sobre
  // Twinkle, o Allegro, o Perpetual Motion, o Allegretto, o Andantino e o
  // Etude entram no catalogo como REGISTRO — existem, sao dele, e nao tocam
  // aqui.
  'Hans Sitt',
  'Maia Bang',
  'Berklee',
];

/**
 * O verificador precisa ser chamável por um teste.
 *
 * Antes ele era um script de cima a baixo: lia o disco, imprimia e encerrava o
 * processo. Não havia como pôr um defeito na frente dele e exigir a acusação,
 * então ele nunca foi visto acusando — exatamente o estado em que
 * `checkPublicDomainRepertoire` varria trinta e três faixas e enxergava zero.
 *
 * A separação é a mínima: esta função decide, e a parte de baixo lê o disco e
 * relata. A regra não mudou; o que mudou é que agora dá para prová-la.
 */
/**
 * 🔴 TERMOS PROIBIDOS QUE TAMBEM SAO TITULO DE OBRA.
 *
 * `Gradus ad Parnassum` esta na lista porque e o tratado de contraponto do Fux
 * — bibliografia de estudo, que nao se cita na plataforma.
 *
 * Mas e tambem o nome de pecas de musica reais: a *Doctor Gradus ad Parnassum*
 * que abre o **Children's Corner** de Debussy, e a colecao de Clementi. Elas
 * estao no catalogo porque existem, e o titulo de uma obra e **fato sobre a
 * obra** — nao e citacao de tratado nenhum.
 *
 * A distincao e por LUGAR, e o lugar e estreito: os arquivos de dado do
 * acervo, gerados a partir das fontes, que contem titulos e endereços e mais
 * nada. Prosa da plataforma continua proibida de citar, inclusive nestes
 * mesmos termos.
 */
const TAMBEM_SAO_TITULO = ['Gradus ad Parnassum'];

/**
 * O dado do acervo — titulos como as fontes os escrevem.
 *
 * `src/data/acervo/` e o que os geradores escrevem: obras, aliases, endereços.
 * Nao ha prosa ali, e por isso um termo que caia num titulo nao e citacao.
 * No pacote construido esses arquivos viram pedacos com o mesmo nome.
 */
const ehDadoDoAcervo = (file) =>
  /src[\\/]data[\\/]acervo[\\/]/.test(file) ||
  /(obras|brasilis|imslp|alias|partituras)-[A-Za-z0-9_-]+\.js$/.test(file);

export function citacoesProibidas(arquivos) {
  const achados = [];
  for (const { file, content } of arquivos) {
    if (ISENTOS.some((i) => file.endsWith(i))) continue;

    for (const termo of PROIBIDOS) {
      /**
       * O termo que tambem e titulo de obra nao acusa dentro do dado do
       * acervo — e continua acusando em qualquer outro lugar.
       */
      if (TAMBEM_SAO_TITULO.includes(termo) && ehDadoDoAcervo(file)) continue;

      if (content.includes(termo)) {
        const linha = content.slice(0, content.indexOf(termo)).split('\n').length;
        achados.push({ file, line: linha, termo, detail: `${file}:${linha} menciona "${termo}"` });
      }
    }
  }
  return achados;
}

export const FONTES_PROIBIDAS = PROIBIDOS;

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

/** Roda sozinho pela linha de comando; importado, só oferece a função. */
const chamadoDiretamente = process.argv[1]?.endsWith('verify-no-citations.mjs');

const violacoes = chamadoDiretamente
  ? citacoesProibidas(
      [...percorrer('dist'), ...percorrer('src')].map((file) => ({
        file,
        content: readFileSync(file, 'utf8'),
      }))
    ).map((v) => v.detail)
  : [];

if (violacoes.length > 0) {
  console.error('\n✗ CITAÇÃO DE FONTE EXTERNA NO PRODUTO:\n');
  violacoes.forEach((v) => console.error(`  • ${v}`));
  console.error('\nA plataforma transmite conteúdo autoral e não cita a bibliografia');
  console.error('usada no estudo interno.\n');
  process.exit(1);
}

if (chamadoDiretamente) {
  console.log(`✓ Nenhuma das ${PROIBIDOS.length} fontes proibidas aparece em src/ ou dist/.`);
}
