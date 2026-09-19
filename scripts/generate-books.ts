/**
 * Gera os livros estáticos do Conservatório em `books/`.
 *
 * Cada curso rende dois: o livro de leitura e o caderno de prática. Saem em
 * Markdown e em HTML — o Markdown para editar e versionar, o HTML para ler,
 * imprimir e baixar.
 *
 * O HTML é autocontido: um arquivo só, com o estilo embutido e o brasão
 * referenciado por caminho relativo. Abre offline e imprime direto do
 * navegador, com quebras de página nos lugares certos.
 *
 * Rodar: npm run livros (usa vite-node, que resolve os imports de TypeScript)
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const OUTCOME = 'livros';
mkdirSync(OUTCOME, { recursive: true });

/** Markdown → HTML, o suficiente para o que os livros usam. */
function paraHtml(md) {
  const escapar = (t) =>
    t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const linhas = md.split('\n');
  const saida = [];
  let emLista = false;
  let emCitacao = false;

  const fecharBlocos = () => {
    if (emLista) { saida.push('</ul>'); emLista = false; }
    if (emCitacao) { saida.push('</blockquote>'); emCitacao = false; }
  };

  const inline = (t) =>
    escapar(t)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>');

  for (const linha of linhas) {
    if (linha.startsWith('<!--')) continue;

    if (/^#{1,4} /.test(linha)) {
      fecharBlocos();
      const nivel = linha.match(/^#+/)[0].length;
      saida.push(`<h${nivel}>${inline(linha.replace(/^#+ /, ''))}</h${nivel}>`);
      continue;
    }
    if (/^---+$/.test(linha.trim())) {
      fecharBlocos();
      saida.push('<hr>');
      continue;
    }
    if (linha.startsWith('> ')) {
      if (!emCitacao) { saida.push('<blockquote>'); emCitacao = true; }
      saida.push(`<p>${inline(linha.slice(2))}</p>`);
      continue;
    }
    if (/^[-*] /.test(linha)) {
      if (!emLista) { saida.push('<ul>'); emLista = true; }
      saida.push(`<li>${inline(linha.slice(2))}</li>`);
      continue;
    }
    if (linha.trim() === '') {
      fecharBlocos();
      continue;
    }
    // Tabela em pipe.
    if (linha.includes('|') && linha.trim().startsWith('|')) {
      const celulas = linha.split('|').slice(1, -1).map((c) => c.trim());
      if (celulas.every((c) => /^-+$/.test(c))) continue;
      fecharBlocos();
      saida.push(
        `<table><tr>${celulas.map((c) => `<td>${inline(c)}</td>`).join('')}</tr></table>`
      );
      continue;
    }
    fecharBlocos();
    saida.push(`<p>${inline(linha)}</p>`);
  }
  fecharBlocos();

  // Junta tabelas consecutivas numa só.
  return saida.join('\n').replace(/<\/table>\s*<table>/g, '');
}

const STYLE = `
  @page { size: A5; margin: 18mm 16mm; }
  :root { --anil: #1d2f49; --ouro: #7b6947; --texto: #1c1917; --suave: #57534e; }
  body { font-family: Georgia, 'Times New Roman', serif; color: var(--texto);
         line-height: 1.65; max-width: 34rem; margin: 0 auto; padding: 2rem 1.25rem; }
  h1 { font-size: 1.7rem; color: var(--anil); border-bottom: 2px solid var(--ouro);
       padding-bottom: .4rem; margin-top: 2.4rem; }
  h2 { font-size: 1.25rem; color: var(--anil); margin-top: 2rem; }
  h3 { font-size: 1.05rem; color: var(--suave); }
  blockquote { border-left: 3px solid var(--ouro); background: #f9f8f6;
               margin: 1.2rem 0; padding: .7rem 1rem; }
  code { background: #f0eeea; padding: .1rem .3rem; border-radius: 3px;
         font-family: ui-monospace, monospace; font-size: .9em; }
  table { border-collapse: collapse; margin: 1rem 0; width: 100%; }
  td { border: 1px solid #e1dbd1; padding: .4rem .6rem; }
  hr { border: 0; border-top: 1px solid #e1dbd1; margin: 2rem 0; }
  .secao { page-break-before: always; }
  .secao:first-child { page-break-before: auto; }
  .capa { text-align: center; padding-top: 22vh; }
  .capa img { width: 190px; margin: 0 auto 2rem; display: block; }
  .rodape { margin-top: 4rem; font-size: .8rem; color: var(--suave);
            border-top: 1px solid #e1dbd1; padding-top: 1rem; }
  .editavel { border-left: 3px dashed var(--ouro); padding-left: .9rem; }
  @media print { body { max-width: none; } .editavel { border: 0; padding: 0; } }
`;

function montarHtml(livro) {
  const secoes = [...livro.secoes].sort((a, b) => a.ordem - b.ordem);
  const corpo = secoes
    .map((s) => {
      const classes = ['secao'];
      if (s.papel === 'CAPA') classes.push('capa');
      if (s.origem === 'EDITAVEL') classes.push('editavel');
      const brasao =
        s.papel === 'CAPA' ? '<img src="../public/brasao-muscicapa-512.png" alt="">' : '';
      return `<section class="${classes.join(' ')}" id="${s.id}" data-origem="${s.origem}" data-papel="${s.papel}">\n${brasao}\n${paraHtml(s.conteudo)}\n</section>`;
    })
    .join('\n\n');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${livro.titulo} — ${livro.instituicao}</title>
<meta name="author" content="${livro.autoria}">
<style>${STYLE}</style>
</head>
<body>
${corpo}
<footer class="rodape">
  ${livro.instituicao} · ${livro.edicao} · ${livro.ano}<br>
  Seções com borda tracejada são <strong>editáveis</strong>: regenerar o livro não as sobrescreve.
</footer>
</body>
</html>`;
}

function montarMarkdown(livro) {
  return [...livro.secoes]
    .sort((a, b) => a.ordem - b.ordem)
    .map(
      (s) =>
        `<!-- secao: ${s.id} · ${s.papel} · ${s.origem} -->\n\n${s.conteudo}`
    )
    .join('\n\n\n');
}

// --- geração ---------------------------------------------------------------

const { bookService } = await import('../src/services/application/book.service.ts');
const { CURSO_TEORIA, MODULOS_TEORIA, LICOES_TEORIA } = await import(
  '../src/data/seed-theory-course.ts'
);
const { LIVRETO_TEORIA } = await import('../src/data/seed-booklet-theory.ts');
const { SINTESE_TEORIA } = await import('../src/data/seed-synthesis-theory.ts');

const CURSOS = [
  {
    curso: CURSO_TEORIA,
    modulos: MODULOS_TEORIA,
    licoes: LICOES_TEORIA,
    livreto: LIVRETO_TEORIA,
    sintese: SINTESE_TEORIA,
  },
];

let gerados = 0;
for (const entrada of CURSOS) {
  const base = entrada.curso.slug;

  for (const [chave, sufixo] of [['leitura', ''], ['imersao', '-pratica']]) {
    const anteriorPath = join(OUTCOME, `${base}${sufixo}.md`);
    // Preserva o que foi escrito à mão: só as seções GERADAS são refeitas.
    const anterior = existsSync(anteriorPath) ? lerAnterior(anteriorPath) : null;

    const livros = bookService.gerar({ ...entrada, anterior });
    const livro = livros[chave];

    const problemas = bookService.validar(livro).filter((p) => p.gravidade === 'erro');
    if (problemas.length > 0) {
      console.error(`✗ ${livro.titulo}: ${problemas.map((p) => p.mensagem).join(' ')}`);
      process.exit(1);
    }

    writeFileSync(join(OUTCOME, `${base}${sufixo}.md`), montarMarkdown(livro), 'utf8');
    writeFileSync(join(OUTCOME, `${base}${sufixo}.html`), montarHtml(livro), 'utf8');

    const palavras = livro.secoes.reduce(
      (a, s) => a + (s.conteudo.match(/[A-Za-zÀ-ÿ]+/g) ?? []).length,
      0
    );
    const editaveis = livro.secoes.filter((s) => s.origem === 'EDITAVEL').length;
    console.log(
      `✓ ${livro.titulo}\n    ${livro.secoes.length} seções (${editaveis} editáveis) · ${palavras} palavras`
    );
    gerados += 1;
  }
}

/** Relê o Markdown anterior para recuperar as seções editadas à mão. */
function lerAnterior(caminho) {
  const texto = readFileSync(caminho, 'utf8');
  const secoes = [];
  const partes = texto.split(/<!-- secao: /).slice(1);
  for (const parte of partes) {
    const fim = parte.indexOf(' -->');
    const [id, papel, origem] = parte.slice(0, fim).split(' · ');
    secoes.push({
      id,
      papel,
      origem,
      titulo: id,
      ordem: secoes.length,
      conteudo: parte.slice(fim + 4).trim(),
    });
  }
  return secoes.length > 0 ? { secoes } : null;
}

console.log(`\n${gerados} livros em ${OUTCOME}/`);
