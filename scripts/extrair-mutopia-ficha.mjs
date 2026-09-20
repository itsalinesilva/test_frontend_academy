/**
 * A FICHA DE CADA PARTITURA — quem transcreveu, e sob que obrigação.
 *
 * POR QUE ESTA SEGUNDA PASSADA EXISTE
 * -----------------------------------
 * A listagem da fonte dá título, instrumento, estilo e licença. Não dá **quem
 * editorou** — e seiscentas e vinte e uma das mil trezentas e quarenta e nove
 * estão sob licença Creative Commons com cláusula de atribuição.
 *
 * Atribuição sob CC não é cortesia: é a condição da licença. Redistribuir sem
 * nomear quem transcreveu é redistribuir sem licença nenhuma. O acervo tem o
 * arquivo e não tinha o nome, o que o tornava impublicável.
 *
 * A página por peça tem o nome, e tem mais duas coisas que valem a viagem:
 *
 *   **Opus** — o número de catálogo, que é o único campo capaz de dizer que
 *   duas entradas de fontes diferentes são a mesma obra. É o que falta para
 *   fundir o que hoje se repete.
 *
 *   **Data de composição** — que a listagem também não dá, e que situa a peça
 *   dentro da era em vez de só na era.
 *
 * O RITMO É DELIBERADAMENTE LENTO
 * -------------------------------
 * Quatro por vez, com pausa entre as levas. O `robots.txt` da fonte não proíbe
 * este caminho, e não proibir não é convidar: um projeto de voluntários não
 * deve pagar a conta de banda por causa da nossa pressa.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const pecas = JSON.parse(readFileSync('scripts/.mutopia-extraido.json', 'utf-8')).pecas;
const FICHA = 'https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=';

const texto = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Lê o valor que vem DEPOIS do rótulo.
 *
 * A página é uma tabela de duas colunas achatada em linhas: o rótulo numa, o
 * valor na seguinte. Ler assim é frágil se a página mudar — e é por isso que
 * um valor ausente devolve `null` em vez de o que estiver por perto.
 */
function campo(linhas, rotulo) {
  const i = linhas.findIndex((l) => l === rotulo || l === rotulo + ':');
  if (i < 0 || i + 1 >= linhas.length) return null;
  const v = linhas[i + 1];
  /** A fonte escreve isto quando não sabe. Copiar seria inventar um dado. */
  if (!v || /^not known$/i.test(v) || v === ':') return null;
  return v;
}

/**
 * O mantenedor vem em até três linhas: nome, e-mail ofuscado, site.
 *
 * Só o **nome** entra no acervo. O e-mail é dado pessoal de um voluntário que
 * o publicou para ser contactado sobre a edição, e não para ser copiado para
 * dentro de outro sistema; a atribuição que a licença exige se cumpre com o
 * nome e o link para a peça na fonte.
 */
function mantenedor(linhas) {
  const i = linhas.findIndex((l) => l === 'Maintainer:' || l === 'Maintainer');
  if (i < 0) return null;
  const v = linhas[i + 1];
  if (!v || /\(at\)/.test(v) || /^https?:/.test(v)) return null;
  return v;
}

const fichas = {};
let erros = 0;
const LEVA = 4;

for (let i = 0; i < pecas.length; i += LEVA) {
  const leva = pecas.slice(i, i + LEVA);
  await Promise.all(
    leva.map(async (p) => {
      try {
        const r = await fetch(FICHA + p.idMutopia);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const l = texto(await r.text());
        if (l.some((x) => /not found/i.test(x))) throw new Error('sem ficha');

        fichas[p.idMutopia] = {
          mantenedor: mantenedor(l),
          opus: campo(l, 'Opus:'),
          dataDeComposicao: campo(l, 'Date of composition:'),
          idMutopiaCompleto: campo(l, 'Music ID Number:'),
        };
      } catch {
        erros += 1;
      }
    })
  );

  if (i % 200 === 0) {
    process.stdout.write(`\r  ${i}/${pecas.length} — ${Object.keys(fichas).length} fichas, ${erros} falhas`);
  }
  await new Promise((r) => setTimeout(r, 250));
}

writeFileSync('scripts/.mutopia-fichas.json', JSON.stringify(fichas), 'utf-8');

const com = Object.values(fichas);
console.log('\n✓ scripts/.mutopia-fichas.json');
console.log(`  ${com.length} fichas de ${pecas.length} peças · ${erros} falhas`);
console.log(`  com mantenedor nomeado : ${com.filter((f) => f.mantenedor).length}`);
console.log(`  com opus               : ${com.filter((f) => f.opus).length}`);
console.log(`  com data de composição : ${com.filter((f) => f.dataDeComposicao).length}`);
