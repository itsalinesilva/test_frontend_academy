/**
 * Escreve a fila de prontidão dentro do `CLAUDE_TODO.md`.
 *
 * POR QUE ISTO É UM SCRIPT, E NÃO UMA LEMBRANÇA
 * ---------------------------------------------
 * A pendência era descoberta, dita em voz alta e perdida. "Mapeou? Põe no to
 * do" dependia de alguém lembrar — e lembrar não é um mecanismo.
 *
 * Aqui a seção é **gerada**. Quem roda `npm run qa:todo` reescreve o bloco
 * entre os marcadores com a fila atual, ordenada por prioridade. O que foi
 * resolvido some sozinho; o que apareceu entra sozinho. Não há passo humano
 * entre descobrir e registrar.
 *
 * O resto do arquivo é escrito à mão e nunca é tocado: só o miolo entre os
 * dois marcadores pertence à máquina.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { priorityQueue, readinessReport } from './qa/readiness.mjs';

const ARQUIVO = 'CLAUDE_TODO.md';
const INICIO = '<!-- PRONTIDAO:INICIO -->';
const FIM = '<!-- PRONTIDAO:FIM -->';

const agora = new Date().toISOString().slice(0, 10);
const fila = priorityQueue();
const relatorio = readinessReport();

const linhas = [
  INICIO,
  '',
  '## CURADORIA DO RELATÓRIO DE TESTES',
  '',
  '> **Seção prioritária, e escrita por máquina.** É o passo final da suíte:',
  '> `tests/report-curation.test.ts` regenera este bloco e **falha se ele',
  '> estiver desatualizado**. Não há como rodar os testes e esquecer de curar o',
  '> relatório — é a mesma execução.',
  '>',
  '> O que é adiado, manual ou seu para decidir vive em `CLAUDE_BACKLOG.md`.',
  '> Item sobe de lá para cá ao virar trabalho imediato, e desce ao depender de',
  '> decisão ou de outra fase.',
  '',
  `### As sete perguntas — apuradas em ${agora}`,
  '',
  '> **Esta seção é escrita por máquina.** Não edite à mão: o próximo `qa:todo`',
  '> sobrescreve. O que foi resolvido sai sozinho; o que apareceu entra sozinho.',
  '',
  '| Área | Respondidas | O que falta |',
  '| :--- | :---: | :--- |',
];

for (const r of relatorio) {
  const faltam = r.perguntas.filter((q) => !q.ok).map((q) => q.chave);
  linhas.push(
    `| ${r.area} | ${r.respondidas}/${r.total} | ${faltam.length ? faltam.join(', ') : '—'} |`
  );
}

linhas.push('', '### Fila, na ordem em que deve ser resolvida', '');

if (fila.length === 0) {
  linhas.push('Nenhuma pendência de prontidão.');
} else {
  linhas.push(
    '> A ordem é por **peso da pergunta**, e não por área. Consertar fora dela',
    '> significa proteger o que ninguém alcança, e curar o conteúdo de uma tela',
    '> que ainda não abre.',
    '',
    '| # | Peso | Área | Pergunta | O que falta |',
    '| :--- | :---: | :--- | :--- | :--- |'
  );
  for (const [i, p] of fila.entries()) {
    linhas.push(`| ${i + 1} | ${p.peso} | ${p.area} | ${p.pergunta} | ${p.detalhe} |`);
  }
}

linhas.push(
  '',
  '### O que estas sete perguntas NÃO respondem',
  '',
  'Se a tela está **boa**. Desenho, texto certo no contexto e fluxo que leva ao',
  'lugar certo continuam precisando de navegador e de olho humano — `F.2`.',
  '',
  FIM
);

const doc = readFileSync(ARQUIVO, 'utf-8');
const novo = doc.includes(INICIO)
  ? doc.slice(0, doc.indexOf(INICIO)) + linhas.join('\n') + doc.slice(doc.indexOf(FIM) + FIM.length)
  : doc.replace('# A ORDEM', linhas.join('\n') + '\n\n---\n\n# A ORDEM');

writeFileSync(ARQUIVO, novo, 'utf-8');
console.log(`prontidão sincronizada: ${fila.length} pendências na fila`);
